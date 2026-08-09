#!/usr/bin/env node

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";

import {
  analyzeAal2BearerToken,
  formatAal2TokenReport,
  redactSensitive
} from "./lib/aal2-token-policy.mjs";
import { loadLocalEnv } from "./lib/local-env.mjs";

loadLocalEnv();

const rawArgs = process.argv.slice(2);
const allowedPrefixes = ["--output=", "--base-url=", "--workspace="];
const unknownArgs = rawArgs.filter(
  (arg) => !allowedPrefixes.some((prefix) => arg.startsWith(prefix))
);
if (unknownArgs.length > 0) {
  throw new Error(`Unsupported p.32 evidence issuer option: ${unknownArgs.join(", ")}`);
}

function option(prefix, fallback = "") {
  return rawArgs.find((arg) => arg.startsWith(prefix))?.slice(prefix.length).trim() || fallback;
}

function failClosed(message) {
  console.error(redactSensitive(message));
  process.exit(1);
}

function candidateValidation() {
  const result = spawnSync(
    process.execPath,
    ["scripts/release-candidate-validation.mjs", "--json"],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      env: process.env,
      maxBuffer: 32 * 1024 * 1024,
      shell: false,
      timeout: 20 * 60 * 1000
    }
  );
  if (result.status !== 0 || result.error) {
    failClosed("The exact local candidate could not be validated before evidence issuance.");
  }
  try {
    return JSON.parse(result.stdout);
  } catch {
    failClosed("Candidate validation returned malformed JSON.");
  }
}

const baseUrl = option(
  "--base-url=",
  process.env.SCRIMED_BASE_URL ?? "https://app.scrimedsolutions.com"
).replace(/\/$/, "");
const workspaceSlug = option(
  "--workspace=",
  process.env.SCRIMED_WORKSPACE_SLUG ?? "atlas-synthetic-evaluation"
);
const outputValue = option(
  "--output=",
  process.env.SCRIMED_P32_EVIDENCE_OUTPUT_PATH ?? ""
);
const bearerToken = process.env.SCRIMED_BEARER_TOKEN?.trim() ?? "";

if (!outputValue || !isAbsolute(outputValue)) {
  failClosed("Use --output=/absolute/path/no-secret-evidence.json outside the Git repository.");
}
const outputPath = resolve(outputValue);
const relativeToRepository = relative(process.cwd(), outputPath);
if (
  relativeToRepository === "" ||
  (!relativeToRepository.startsWith("..") && !isAbsolute(relativeToRepository))
) {
  failClosed("The p.32 evidence transfer file must remain outside the Git repository.");
}
if (!bearerToken) {
  failClosed("SCRIMED_BEARER_TOKEN is required for protected AAL2 evidence issuance.");
}

const tokenAnalysis = analyzeAal2BearerToken({ bearerToken, workspaceSlug });
if (!tokenAnalysis.ok) {
  failClosed(`AAL2 token preflight failed: ${tokenAnalysis.errors.join(" ")}`);
}
console.log(`pass protected issuer token preflight: ${formatAal2TokenReport(tokenAnalysis)}`);

const validation = candidateValidation();
const requestBody = {
  sourceCommit: validation.sourceCommitSha,
  sourceTreeFingerprint: validation.sourceFingerprintSha256,
  artifactFingerprint: validation.artifactFingerprintSha256,
  validationEvidenceFingerprint: validation.validationEvidenceHashSha256
};
if (
  !validation.candidateStable ||
  !validation.automatedValidationPassed ||
  Object.values(requestBody).some((value) => typeof value !== "string")
) {
  failClosed("The local candidate is not eligible for protected evidence issuance.");
}

let response;
try {
  response = await fetch(
    `${baseUrl}/api/pilot-workspaces/${encodeURIComponent(workspaceSlug)}/qa-evidence/p32-attestation`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
        "Idempotency-Key": randomUUID(),
        "X-SCRIMED-Request-Context": "operator-smoke-v1"
      },
      body: JSON.stringify(requestBody)
    }
  );
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  failClosed(`Protected p.32 evidence issuer could not be reached: ${message}`);
}

const responseText = await response.text();
let payload;
try {
  payload = JSON.parse(responseText);
} catch {
  failClosed(`Protected p.32 evidence issuer returned non-JSON status ${response.status}.`);
}
if (response.status !== 201 || !payload?.evidenceFile || !payload?.receipt?.auditHash) {
  const code = payload?.error?.code ?? `http-${response.status}`;
  const message = payload?.error?.message ?? "Issuance failed closed.";
  failClosed(`Protected p.32 evidence issuance failed: ${code}. ${message}`);
}

const serialized = `${JSON.stringify(payload.evidenceFile, null, 2)}\n`;
if (
  /(?:Bearer\s+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|PRIVATE KEY|service[_ -]?role)/i.test(
    serialized
  )
) {
  failClosed("Protected issuer returned prohibited secret-like material.");
}

await mkdir(dirname(outputPath), { recursive: true, mode: 0o700 });
try {
  await writeFile(outputPath, serialized, { encoding: "utf8", flag: "wx", mode: 0o600 });
} catch (error) {
  if (error?.code === "EEXIST") {
    failClosed("The requested evidence output already exists; choose a fresh path.");
  }
  throw error;
}

console.log(`pass protected p.32 evidence file written with mode 0600: ${outputPath}`);
console.log(`receipt_audit_hash=${payload.receipt.auditHash}`);
console.log("next: run release:scrimed-p32-evidence:strict with --evidence-file=<that path>");
console.log("operator action required: remove the short-lived bearer token after this bounded run.");
