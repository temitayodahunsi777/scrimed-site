#!/usr/bin/env node

import { constants as fsConstants } from "node:fs";
import { access, readFile } from "node:fs/promises";
import net from "node:net";
import { spawn, spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import path from "node:path";

const root = process.cwd();
const loopbackHost = "127.0.0.1";
const defaultPort = 3048;
const defaultStartupTimeoutMs = 30_000;
const maximumLogTailBytes = 24_000;
const localEnvironmentFiles = [
  ".env",
  ".env.local",
  ".env.production",
  ".env.production.local",
  ".env.development",
  ".env.development.local",
  ".env.test",
  ".env.test.local"
];
const forcedSafeEnvironment = {
  SCRIMED_AI_PROVIDER_CALLS_ENABLED: "false",
  SCRIMED_ALLOW_PHI: "false",
  SCRIMED_AUTONOMOUS_ELIGIBILITY_DECISIONS: "false",
  SCRIMED_AUTONOMOUS_PAYER_DECISIONS: "false",
  SCRIMED_AUTONOMOUS_TREATMENT_ACTIONS: "false",
  SCRIMED_CONSEQUENTIAL_ACTIONS_ENABLED: "false",
  SCRIMED_EMERGENCY_MONITORING: "false",
  SCRIMED_EXECUTION_ATTEMPT_DURABLE_STORE_ENABLED: "false",
  SCRIMED_EXTERNAL_IMAGING_ADAPTERS_ENABLED: "false",
  SCRIMED_FAITH_AFFECTS_CLINICAL_LOGIC: "false",
  SCRIMED_FOUNDRY_DEPLOYMENT_ENABLED: "false",
  SCRIMED_GROWTH_OS_ENABLED: "false",
  SCRIMED_LIVE_CLINICAL_EXECUTION: "false",
  SCRIMED_MEDICAL_DEVICE_CONNECTIONS: "false",
  SCRIMED_P32_CANDIDATE_REVIEW_ENABLED: "false",
  SCRIMED_P32_EVIDENCE_ISSUER_ENABLED: "false",
  SCRIMED_P32_RCM_VOICE_ENABLED: "false",
  SCRIMED_PRODUCTION_EHR_CONNECTIONS: "false",
  SCRIMED_SCHEDULES_ENABLED: "false",
  SCRIMED_SYNTHETIC_ONLY: "true",
  SCRIMED_TRIALCORE_ENABLEMENT_ENABLED: "false",
  SCRIMED_WORK_DURABLE_STORE_ENABLED: "false",
  SCRIMED_WORK_PROTECTED_WRITES_ENABLED: "false"
};

const entrypoints = {
  buildId: ".next/BUILD_ID",
  cleanup: "scripts/clean-generated-cache.mjs",
  integrity: "scripts/check-generated-integrity.mjs",
  next: "node_modules/next/dist/bin/next",
  postflight: "scripts/generated-output-postflight.mjs",
  publicReleaseVerifier: "scripts/verify-public-release.mjs",
  smoke: "scripts/public-production-smoke.mjs"
};

function parseBoundedInteger(value, label, minimum, maximum) {
  if (!/^\d+$/.test(value)) {
    throw new Error(`${label} must be an integer.`);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${label} must be between ${minimum} and ${maximum}.`);
  }

  return parsed;
}

function parseOptions(args) {
  const options = {
    port: defaultPort,
    selfTest: false,
    startupTimeoutMs: defaultStartupTimeoutMs
  };

  for (const argument of args) {
    if (argument === "--self-test") {
      options.selfTest = true;
      continue;
    }

    if (argument.startsWith("--port=")) {
      options.port = parseBoundedInteger(argument.slice("--port=".length), "port", 1024, 65_535);
      continue;
    }

    if (argument.startsWith("--startup-timeout-ms=")) {
      options.startupTimeoutMs = parseBoundedInteger(
        argument.slice("--startup-timeout-ms=".length),
        "startup timeout",
        1_000,
        120_000
      );
      continue;
    }

    throw new Error(`Unsupported local public smoke option: ${argument}`);
  }

  return options;
}

async function discoverLocalEnvironmentNames() {
  const names = new Set();

  for (const filePath of localEnvironmentFiles) {
    let contents;
    try {
      contents = await readFile(path.join(root, filePath), "utf8");
    } catch (error) {
      if (error?.code === "ENOENT") {
        continue;
      }

      throw error;
    }

    for (const line of contents.split(/\r?\n/)) {
      const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(line);
      if (match) {
        names.add(match[1]);
      }
    }
  }

  return names;
}

function createNonsecretEnvironment(port, localEnvironmentNames) {
  const environment = {};

  for (const name of localEnvironmentNames) {
    environment[name] = "";
  }

  for (const name of ["HOME", "LANG", "LC_ALL", "PATH", "TMPDIR", "TZ"]) {
    if (typeof process.env[name] === "string") {
      environment[name] = process.env[name];
    }
  }

  Object.assign(environment, forcedSafeEnvironment, {
    CI: "1",
    NEXT_TELEMETRY_DISABLED: "1",
    NODE_ENV: "production",
    PORT: String(port),
    SCRIMED_BASE_URL: `http://${loopbackHost}:${port}`
  });
  return environment;
}

function appendLogTail(current, chunk) {
  const combined = `${current}${chunk.toString("utf8")}`;
  return combined.slice(-maximumLogTailBytes);
}

function trackChildProcess(child) {
  const state = {
    code: null,
    error: null,
    exited: false,
    exitPromise: null,
    signal: null
  };

  state.exitPromise = new Promise((resolve) => {
    child.once("exit", (code, signal) => {
      state.code = code;
      state.exited = true;
      state.signal = signal;
      resolve();
    });
  });
  child.once("error", (error) => {
    state.error = error;
  });

  return state;
}

async function assertEntrypoints() {
  await Promise.all(
    Object.entries(entrypoints).map(async ([label, relativePath]) => {
      try {
        await access(path.join(root, relativePath), fsConstants.R_OK);
      } catch {
        if (label === "buildId") {
          throw new Error("Production build output unavailable. Run the production build before local public smoke.");
        }

        throw new Error(`Required ${label} entrypoint is unavailable: ${relativePath}`);
      }
    })
  );
}

async function assertLocalPortAvailable(port) {
  await new Promise((resolve, reject) => {
    const probe = net.createServer();

    probe.unref();
    probe.once("error", (error) => {
      reject(new Error(`Local smoke port ${port} is unavailable: ${error.code ?? error.message}`));
    });
    probe.listen({ host: loopbackHost, port, exclusive: true }, () => {
      probe.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  });
}

function runNodeStage(label, args, environment, timeoutMs, allowFailure = false) {
  const startedAt = Date.now();
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    env: environment,
    stdio: "inherit",
    timeout: timeoutMs,
    shell: false
  });

  if (result.error) {
    const message =
      result.error.code === "ETIMEDOUT"
        ? `${label} timed out after ${Date.now() - startedAt}ms.`
        : `${label} could not start: ${result.error.message}`;

    if (allowFailure) {
      return { ok: false, message };
    }

    throw new Error(message);
  }

  if (result.status !== 0) {
    const message = `${label} failed with exit ${result.status ?? "unknown"}${
      result.signal ? ` (${result.signal})` : ""
    }.`;

    if (allowFailure) {
      return { ok: false, message };
    }

    throw new Error(message);
  }

  console.log(`pass ${label} (${Date.now() - startedAt}ms)`);
  return { ok: true };
}

async function waitForReadiness(serverState, baseUrl, timeoutMs) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (serverState.error) {
      throw new Error(`Local Next server could not start: ${serverState.error.message}`);
    }

    if (serverState.exited) {
      throw new Error(
        `Local Next server exited before readiness with code ${serverState.code ?? "unknown"}${
          serverState.signal ? ` (${serverState.signal})` : ""
        }.`
      );
    }

    try {
      const response = await fetch(`${baseUrl}/api/operating-mode`, {
        redirect: "error",
        signal: AbortSignal.timeout(1_500)
      });

      if (response.status === 200) {
        console.log(`pass local Next server readiness: ${baseUrl}`);
        return;
      }
    } catch {
      // The bounded readiness loop reports one concise terminal error below.
    }

    await delay(250);
  }

  throw new Error(`Local Next server was not ready within ${timeoutMs}ms.`);
}

async function stopServer(server, serverState) {
  if (serverState.exited) {
    return;
  }

  server.kill("SIGTERM");
  await Promise.race([serverState.exitPromise, delay(5_000)]);

  if (!serverState.exited) {
    server.kill("SIGKILL");
    await Promise.race([serverState.exitPromise, delay(2_000)]);
  }

  if (!serverState.exited) {
    throw new Error("Local Next server did not terminate after SIGTERM and SIGKILL.");
  }
}

async function runSelfTest(localEnvironmentNames) {
  const parsed = parseOptions(["--port=3049", "--startup-timeout-ms=1500"]);
  if (parsed.port !== 3049 || parsed.startupTimeoutMs !== 1_500) {
    throw new Error("Local public smoke option parsing is not deterministic.");
  }

  for (const invalid of [["--port=80"], ["--port=not-a-port"], ["--unknown"]]) {
    try {
      parseOptions(invalid);
      throw new Error(`Invalid option unexpectedly passed: ${invalid.join(" ")}`);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("Invalid option unexpectedly passed")) {
        throw error;
      }
    }
  }

  const environment = createNonsecretEnvironment(parsed.port, localEnvironmentNames);
  const allowedNonblankNames = new Set([
    "CI",
    "HOME",
    "LANG",
    "LC_ALL",
    "NEXT_TELEMETRY_DISABLED",
    "NODE_ENV",
    "PATH",
    "PORT",
    "SCRIMED_BASE_URL",
    "TMPDIR",
    "TZ",
    ...Object.keys(forcedSafeEnvironment)
  ]);
  const unexpectedNonblankNames = Object.entries(environment)
    .filter(([name, value]) => Boolean(value) && !allowedNonblankNames.has(name))
    .map(([name]) => name);

  if (unexpectedNonblankNames.length > 0) {
    throw new Error(
      `Nonsecret environment included unexpected nonblank names: ${unexpectedNonblankNames.join(", ")}`
    );
  }

  const unshadowedLocalNames = [...localEnvironmentNames].filter(
    (name) => !allowedNonblankNames.has(name) && environment[name] !== ""
  );
  if (unshadowedLocalNames.length > 0) {
    throw new Error(`Local dotenv names were not shadowed: ${unshadowedLocalNames.join(", ")}`);
  }

  if (environment.SCRIMED_BASE_URL !== `http://${loopbackHost}:${parsed.port}`) {
    throw new Error("Local public smoke base URL is not loopback-confined.");
  }

  const child = spawn(
    process.execPath,
    ["-e", "process.on('SIGTERM', () => process.exit(0)); setInterval(() => {}, 1000);"],
    {
      cwd: root,
      env: environment,
      stdio: "ignore",
      shell: false
    }
  );
  const childState = trackChildProcess(child);
  await delay(50);
  await stopServer(child, childState);

  if (!childState.exited) {
    throw new Error("Local public smoke child-process shutdown self-test failed.");
  }

  console.log("pass SCRIMED local public smoke runner self-test");
}

const options = parseOptions(process.argv.slice(2));
const localEnvironmentNames = await discoverLocalEnvironmentNames();

if (options.selfTest) {
  await runSelfTest(localEnvironmentNames);
  process.exit(0);
}

await assertEntrypoints();
const environment = createNonsecretEnvironment(options.port, localEnvironmentNames);
const baseUrl = environment.SCRIMED_BASE_URL;

runNodeStage("pre-smoke generated-output postflight", [entrypoints.postflight], environment, 60_000);
runNodeStage("pre-smoke generated integrity", [entrypoints.integrity], environment, 30_000);
runNodeStage(
  "built public release verification",
  [entrypoints.publicReleaseVerifier, "--require-build"],
  environment,
  60_000
);

try {
  await assertLocalPortAvailable(options.port);
} catch (error) {
  console.error(
    `fail SCRIMED local public smoke runner: ${error instanceof Error ? error.message : String(error)} ` +
      "Rendered build verification passed, but it is not equivalent to loopback HTTP verification. Run this command in an environment that permits local listeners."
  );
  process.exit(1);
}

let outputTail = "";
let runError = null;
let server = null;
let serverState = null;

try {
  server = spawn(process.execPath, [entrypoints.next, "start", "-H", loopbackHost, "-p", String(options.port)], {
    cwd: root,
    env: environment,
    stdio: ["ignore", "pipe", "pipe"],
    shell: false
  });

  serverState = trackChildProcess(server);
  server.stdout.on("data", (chunk) => {
    outputTail = appendLogTail(outputTail, chunk);
  });
  server.stderr.on("data", (chunk) => {
    outputTail = appendLogTail(outputTail, chunk);
  });

  await waitForReadiness(serverState, baseUrl, options.startupTimeoutMs);
  runNodeStage("local public production smoke", [entrypoints.smoke], environment, 300_000);
} catch (error) {
  runError = error;
} finally {
  if (server && serverState) {
    try {
      await stopServer(server, serverState);
    } catch (error) {
      runError ??= error;
    }
  }
}

const postflight = runNodeStage(
  "post-smoke generated-output postflight",
  [entrypoints.postflight],
  environment,
  60_000,
  true
);

if (!postflight.ok) {
  runError ??= new Error(`${postflight.message} Generated output remains untrusted.`);
}

const integrity = runNodeStage(
  "post-smoke generated integrity",
  [entrypoints.integrity],
  environment,
  30_000,
  true
);

if (!integrity.ok) {
  const cleanup = runNodeStage(
    "corrupted generated-output cleanup",
    [entrypoints.cleanup],
    environment,
    30_000,
    true
  );
  const cleanupStatus = cleanup.ok ? "corrupted output was removed" : `cleanup also failed: ${cleanup.message}`;
  runError ??= new Error(`${integrity.message} ${cleanupStatus}. A clean rebuild is required.`);
}

if (runError) {
  if (outputTail.trim()) {
    console.error(`Local Next server output tail:\n${outputTail.trim()}`);
  }
  console.error(
    `fail SCRIMED local public smoke runner: ${runError instanceof Error ? runError.message : String(runError)}`
  );
  process.exit(1);
}

console.log(`pass SCRIMED local public smoke runner: base_url=${baseUrl} server_stopped=true integrity=passed`);
