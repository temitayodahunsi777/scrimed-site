#!/usr/bin/env node

import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const rawArgs = process.argv.slice(2);
const flags = new Set(rawArgs.filter((arg) => arg.startsWith("--") && !arg.includes("=")));
const allowedFlags = new Set(["--json", "--strict", "--self-test"]);
const unknownFlags = [...flags].filter((flag) => !allowedFlags.has(flag));
const valuedArgs = rawArgs.filter((arg) => arg.includes("="));
const unknownValuedArgs = valuedArgs.filter(
  (arg) =>
    !arg.startsWith("--base-url=") &&
    !arg.startsWith("--canonical-origin=") &&
    !arg.startsWith("--output-dir=")
);

if (unknownFlags.length || unknownValuedArgs.length) {
  throw new Error(
    `Unsupported preview verification option: ${[
      ...unknownFlags,
      ...unknownValuedArgs
    ].join(", ")}`
  );
}

const prohibitedMarkers = [
  "autonomous diagnosis",
  "autonomous treatment",
  "clinically proven",
  "deployment ready",
  "dr. emily carter",
  "ehr writeback enabled",
  "fda approved",
  "fda cleared",
  "hipaa compliant",
  "live clinical deployment",
  "predictive alerts",
  "replaces doctors",
  "revolutionized our practice",
  "soc 2 certified"
];

const routePolicy = [
  {
    path: "/",
    requiredText: ["healthcare", "human-supervised", "synthetic"]
  },
  {
    path: "/validation-evidence",
    requiredText: ["validation", "evidence", "synthetic"]
  },
  {
    path: "/legal",
    requiredText: ["protected health information", "human review"]
  },
  {
    path: "/faithcore",
    requiredText: ["optional", "do not affect"]
  },
  {
    path: "/pilot-demo-commercial-readiness",
    requiredText: ["synthetic", "no phi"]
  }
];

function valueArg(name, fallback = null) {
  const prefix = `--${name}=`;
  return rawArgs.find((arg) => arg.startsWith(prefix))?.slice(prefix.length) ?? fallback;
}

function normalizePreviewBaseUrl(value) {
  if (!value) throw new Error("Preview verification requires --base-url.");
  const parsed = new URL(value);
  const local = new Set(["127.0.0.1", "localhost"]).has(parsed.hostname);
  if (
    !new Set(["http:", "https:"]).has(parsed.protocol) ||
    (!local && parsed.protocol !== "https:") ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error("Preview base URL must be a bare HTTPS origin or localhost HTTP origin.");
  }
  return parsed.origin;
}

export function evaluatePreviewSnapshot(snapshot, policy) {
  const failures = [];
  const normalizedText = snapshot.text.toLowerCase();
  const searchableText = normalizedText.replace(/[^a-z0-9]+/g, " ").trim();
  const normalizedMarkup = `${snapshot.text}\n${snapshot.jsonLd}`.toLowerCase();

  if (snapshot.status !== 200) failures.push(`route-status:${policy.path}:${snapshot.status}`);
  if (snapshot.documentWidth > snapshot.viewportWidth + 1) {
    failures.push(`horizontal-overflow:${policy.path}:${snapshot.documentWidth}`);
  }
  if (!snapshot.title.trim()) failures.push(`missing-title:${policy.path}`);
  const expectedCanonical = new URL(policy.path, `${snapshot.canonicalOrigin}/`).href;
  let normalizedCanonical = null;
  try {
    normalizedCanonical = new URL(snapshot.canonical).href;
  } catch {
    // The canonical is invalid or absent; the shared failure below remains deterministic.
  }
  if (normalizedCanonical !== expectedCanonical) {
    failures.push(`canonical-origin:${policy.path}`);
  }
  for (const required of policy.requiredText) {
    if (!searchableText.includes(required.replace(/[^a-z0-9]+/g, " "))) {
      failures.push(`required-copy:${policy.path}:${required}`);
    }
  }
  for (const marker of prohibitedMarkers) {
    if (normalizedMarkup.includes(marker)) {
      failures.push(`prohibited-copy:${policy.path}:${marker}`);
    }
  }
  if (policy.path === "/faithcore" && normalizedText.includes("governs clinical reasoning")) {
    failures.push("faithcore-clinical-authority-claim");
  }
  if (
    snapshot.formCount > 0 &&
    !/(do not (?:include|submit) phi|do not [^.]{0,80}protected health information|no phi)/.test(
      searchableText
    )
  ) {
    failures.push(`public-form-no-phi-warning:${policy.path}`);
  }

  return failures;
}

function safeSnapshot(policy, width = 390) {
  const routeCopy = {
    "/": "SCRIMED healthcare intelligence. Human-supervised synthetic demonstration.",
    "/validation-evidence": "Validation and evidence for synthetic workflows.",
    "/legal": "Do not submit protected health information. AI outputs require human review.",
    "/faithcore": "FaithCore is optional and faith experiences do not affect clinical outputs.",
    "/pilot-demo-commercial-readiness": "Synthetic demonstration. No PHI."
  };
  return {
    path: policy.path,
    baseUrl: "https://preview.example.test",
    canonicalOrigin: "https://app.scrimedsolutions.com",
    status: 200,
    title: "SCRIMED",
    canonical: `https://app.scrimedsolutions.com${policy.path === "/" ? "/" : policy.path}`,
    text: routeCopy[policy.path],
    jsonLd: '{"@type":"Organization"}',
    viewportWidth: width,
    documentWidth: width,
    formCount: 0
  };
}

if (flags.has("--self-test")) {
  for (const policy of routePolicy) {
    assert.deepEqual(evaluatePreviewSnapshot(safeSnapshot(policy), policy), []);
  }
  const overflow = safeSnapshot(routePolicy[0]);
  overflow.documentWidth = 420;
  assert.ok(evaluatePreviewSnapshot(overflow, routePolicy[0]).includes("horizontal-overflow:/:420"));
  const prohibited = safeSnapshot(routePolicy[0]);
  prohibited.text += " Autonomous diagnosis";
  assert.ok(
    evaluatePreviewSnapshot(prohibited, routePolicy[0]).includes(
      "prohibited-copy:/:autonomous diagnosis"
    )
  );
  assert.throws(() => normalizePreviewBaseUrl("http://example.com"));
  console.log("pass SCRIMED portable preview UI verifier self-test");
  process.exit(0);
}

const baseUrl = normalizePreviewBaseUrl(
  valueArg("base-url", process.env.SCRIMED_PREVIEW_BASE_URL ?? null)
);
const canonicalOrigin = normalizePreviewBaseUrl(
  valueArg("canonical-origin", "https://app.scrimedsolutions.com")
);
const outputDir = path.resolve(valueArg("output-dir", "artifacts/ui-verification"));
await mkdir(outputDir, { recursive: true });

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  try {
    ({ chromium } = createRequire(import.meta.url)("playwright"));
  } catch {
    console.error(
      "blocked preview verification: Playwright is unavailable. Run in the approved browser-verification CI image."
    );
    process.exit(2);
  }
}

const executablePath = process.env.SCRIMED_PLAYWRIGHT_EXECUTABLE_PATH;
if (
  executablePath &&
  (!path.isAbsolute(executablePath) || !/(?:chrome|chromium)/i.test(path.basename(executablePath)))
) {
  throw new Error("SCRIMED_PLAYWRIGHT_EXECUTABLE_PATH must be an absolute Chrome/Chromium path.");
}
const browser = await chromium.launch({
  headless: true,
  ...(executablePath ? { executablePath } : {})
});
const results = [];
try {
  for (const viewport of [
    { name: "desktop", width: 1440, height: 1000 },
    { name: "mobile-390", width: 390, height: 844 }
  ]) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height }
    });
    try {
      for (const policy of routePolicy) {
        const page = await context.newPage();
        const response = await page.goto(`${baseUrl}${policy.path}`, {
          waitUntil: "networkidle",
          timeout: 30_000
        });
        const snapshot = await page.evaluate(({ pagePath, origin, expectedCanonicalOrigin }) => ({
          path: pagePath,
          baseUrl: origin,
          canonicalOrigin: expectedCanonicalOrigin,
          status: 0,
          title: document.title,
          canonical:
            document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "",
          text: document.body?.innerText ?? "",
          jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')]
            .map((element) => element.textContent ?? "")
            .join("\n"),
          viewportWidth: window.innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          formCount: document.querySelectorAll("form").length
        }), {
          pagePath: policy.path,
          origin: baseUrl,
          expectedCanonicalOrigin: canonicalOrigin
        });
        snapshot.status = response?.status() ?? 0;
        const failures = evaluatePreviewSnapshot(snapshot, policy);
        const screenshotPath = path.join(
          outputDir,
          `${viewport.name}-${policy.path === "/" ? "home" : policy.path.slice(1)}.png`
        );
        await page.screenshot({ path: screenshotPath, fullPage: true });
        results.push({ viewport: viewport.name, path: policy.path, failures, screenshotPath });
        await page.close();
      }
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

const report = {
  service: "scrimed-preview-ui-verification",
  baseUrl,
  canonicalOrigin,
  capturedAt: new Date().toISOString(),
  passed: results.every((result) => result.failures.length === 0),
  results
};
await writeFile(
  path.join(outputDir, "preview-ui-verification.json"),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8"
);

if (flags.has("--json")) console.log(JSON.stringify(report, null, 2));
else {
  console.log(
    `${report.passed ? "pass" : "blocked"} SCRIMED preview UI verification (${results.length} route/viewport checks)`
  );
  for (const result of results.filter((entry) => entry.failures.length > 0)) {
    console.log(`${result.viewport} ${result.path}: ${result.failures.join(", ")}`);
  }
}
if (!report.passed || flags.has("--strict") && !report.passed) process.exitCode = 1;
