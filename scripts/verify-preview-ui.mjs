#!/usr/bin/env node

import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { bindVercelPreviewAccessCookie } from "./lib/vercel-preview-access.mjs";

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
    requiredText: ["optional", "does not influence"]
  },
  {
    path: "/pilot-demo-commercial-readiness",
    requiredText: ["synthetic", "no phi"]
  },
  {
    path: "/product",
    requiredText: ["product proof", "exact-head review readiness", "synthetic pilot"]
  },
  {
    path: "/synthetic-pilot",
    requiredText: ["synthetic workflow pilot", "no phi", "pilot operating system"]
  },
  {
    path: "/investor-demo-command-room",
    requiredText: ["investor demo command room", "evidence", "no-pii"]
  }
];

const reviewReadinessApiPath = "/api/scrimed-control-plane/review-readiness";

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

function isVercelToolbarCspIssue(value) {
  return value.includes("https://vercel.live/_next-live/feedback/feedback.js")
    && /content security policy|\bcsp\b/i.test(value);
}

function isExpectedTeardownCancellation({ url, error, resourceType }, baseUrl) {
  return error === "net::ERR_ABORTED"
    && url.startsWith(`${baseUrl}/`)
    && new Set(["document", "fetch"]).has(resourceType);
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
  if ((snapshot.consoleErrors ?? []).length > 0) failures.push(`console-error:${policy.path}`);
  if ((snapshot.pageErrors ?? []).length > 0) failures.push(`page-error:${policy.path}`);
  if ((snapshot.resourceErrors ?? []).length > 0) failures.push(`resource-error:${policy.path}`);
  if ((snapshot.http4xx ?? []).length > 0) failures.push(`http-4xx:${policy.path}`);
  if ((snapshot.http5xx ?? []).length > 0) failures.push(`http-5xx:${policy.path}`);
  if ((snapshot.redirectCount ?? 0) > 10) failures.push(`redirect-loop:${policy.path}`);
  if (!snapshot.title.trim()) failures.push(`missing-title:${policy.path}`);
  if (snapshot.mainCount !== 1) failures.push(`main-landmark:${policy.path}:${snapshot.mainCount}`);
  if (snapshot.headingCount < 1) failures.push(`missing-heading:${policy.path}`);
  if ((snapshot.duplicateIds ?? []).length > 0) failures.push(`duplicate-id:${policy.path}`);
  if ((snapshot.unnamedControls ?? []).length > 0) failures.push(`unnamed-control:${policy.path}`);
  if (snapshot.focusableCount < 1) failures.push(`keyboard-target-missing:${policy.path}`);
  if (!snapshot.focusIndicatorVisible) failures.push(`visible-focus-missing:${policy.path}`);
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

export function evaluateReviewReadinessResponse(snapshot) {
  const failures = [];
  if (snapshot.status !== 200) failures.push(`route-status:${reviewReadinessApiPath}:${snapshot.status}`);
  if (!snapshot.contentType.includes("application/json")) failures.push("review-readiness-content-type");
  if (snapshot.reviewAuthority !== "external-human-review-required") failures.push("review-authority-header");
  if (snapshot.payload?.ok !== true) failures.push("review-readiness-envelope");
  const data = snapshot.payload?.data;
  if (data?.service !== "scrimed-p34-review-readiness") failures.push("review-readiness-service");
  if (data?.mergeAuthority?.granted !== false) failures.push("review-readiness-merge-boundary");
  if (data?.productionAuthorityGranted !== false) failures.push("review-readiness-production-boundary");
  if (!Array.isArray(data?.operatorActions) || data.operatorActions.length < 1) {
    failures.push("review-readiness-operator-actions");
  }
  return failures;
}

function safeSnapshot(policy, width = 390) {
  const routeCopy = {
    "/": "SCRIMED healthcare intelligence. Human-supervised synthetic demonstration.",
    "/validation-evidence": "Validation and evidence for synthetic workflows.",
    "/legal": "Do not submit protected health information. AI outputs require human review.",
    "/faithcore": "FaithCore is optional and does not influence clinical outputs.",
    "/pilot-demo-commercial-readiness": "Synthetic demonstration. No PHI.",
    "/product": "Product proof. Exact-head review readiness. Synthetic pilot.",
    "/synthetic-pilot": "SCRIMED Synthetic Workflow Pilot. No PHI. Pilot operating system.",
    "/investor-demo-command-room": "Investor demo command room. Evidence. No-PII."
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
    formCount: 0,
    mainCount: 1,
    headingCount: 1,
    duplicateIds: [],
    unnamedControls: [],
    focusableCount: 1,
    focusIndicatorVisible: true,
    consoleErrors: [],
    pageErrors: [],
    resourceErrors: [],
    http4xx: [],
    http5xx: [],
    redirectCount: 0
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
  const duplicateId = safeSnapshot(routePolicy[0]);
  duplicateId.duplicateIds = ["duplicate"];
  assert.ok(evaluatePreviewSnapshot(duplicateId, routePolicy[0]).includes("duplicate-id:/"));
  const resourceError = safeSnapshot(routePolicy[0]);
  resourceError.resourceErrors = [{ url: "https://preview.example.test/_next/static/test.js", error: "failed" }];
  assert.ok(evaluatePreviewSnapshot(resourceError, routePolicy[0]).includes("resource-error:/"));
  assert.equal(
    isVercelToolbarCspIssue(
      "Loading https://vercel.live/_next-live/feedback/feedback.js violates Content Security Policy"
    ),
    true
  );
  assert.equal(isVercelToolbarCspIssue("https://example.test/feedback.js csp"), false);
  assert.equal(
    isExpectedTeardownCancellation(
      { url: "https://preview.example.test/pilot", error: "net::ERR_ABORTED", resourceType: "fetch" },
      "https://preview.example.test"
    ),
    true
  );
  assert.deepEqual(
    evaluateReviewReadinessResponse({
      status: 200,
      contentType: "application/json",
      reviewAuthority: "external-human-review-required",
      payload: {
        ok: true,
        data: {
          service: "scrimed-p34-review-readiness",
          mergeAuthority: { granted: false },
          productionAuthorityGranted: false,
          operatorActions: [{ id: "review" }]
        }
      }
    }),
    []
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
const previewAccessCookie = bindVercelPreviewAccessCookie({
  cookie: process.env.SCRIMED_PREVIEW_ACCESS_COOKIE,
  accessOrigin: process.env.SCRIMED_PREVIEW_ACCESS_ORIGIN,
  requestOrigin: baseUrl
});
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
const apiResults = [];
try {
  for (const viewport of [
    { name: "desktop", width: 1440, height: 1000 },
    { name: "mobile-390", width: 390, height: 844 }
  ]) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height }
    });
    try {
      if (previewAccessCookie) {
        await context.addCookies([{
          name: previewAccessCookie.name,
          value: previewAccessCookie.value,
          url: baseUrl,
          httpOnly: true,
          secure: true,
          sameSite: "Lax"
        }]);
      }
      for (const policy of routePolicy) {
        const page = await context.newPage();
        const consoleErrors = [];
        const pageErrors = [];
        const resourceErrors = [];
        const platformWarnings = [];
        const canceledRequests = [];
        const http4xx = [];
        const http5xx = [];
        page.on("console", (message) => {
          if (message.type() !== "error") return;
          const value = message.text().slice(0, 240);
          if (isVercelToolbarCspIssue(value)) platformWarnings.push({ source: "console", message: value });
          else consoleErrors.push(value);
        });
        page.on("pageerror", (error) => pageErrors.push(error.message.slice(0, 240)));
        page.on("requestfailed", (request) => {
          const entry = {
            url: request.url().split("?", 1)[0],
            error: request.failure()?.errorText?.slice(0, 240) ?? "request failed",
            resourceType: request.resourceType()
          };
          if (isVercelToolbarCspIssue(`${entry.url} ${entry.error}`)) {
            platformWarnings.push({ source: "resource", ...entry });
          } else if (isExpectedTeardownCancellation(entry, baseUrl)) {
            canceledRequests.push(entry);
          } else {
            resourceErrors.push(entry);
          }
        });
        page.on("response", (response) => {
          if (response.status() >= 400 && response.status() < 500) http4xx.push({ status: response.status(), url: response.url().split("?", 1)[0] });
          if (response.status() >= 500) http5xx.push({ status: response.status(), url: response.url().split("?", 1)[0] });
        });
        const response = await page.goto(`${baseUrl}${policy.path}`, {
          waitUntil: "domcontentloaded",
          timeout: 30_000
        });
        await page.waitForSelector("main", { state: "visible", timeout: 15_000 });
        await page.waitForTimeout(750);
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
          formCount: document.querySelectorAll("form").length,
          mainCount: document.querySelectorAll("main").length,
          headingCount: document.querySelectorAll("h1, h2, h3, h4, h5, h6").length,
          duplicateIds: [...document.querySelectorAll("[id]")]
            .map((element) => element.id)
            .filter((id, index, ids) => id && ids.indexOf(id) !== index),
          unnamedControls: [...document.querySelectorAll("button, input, select, textarea")]
            .filter((element) => {
              const labelledBy = element.getAttribute("aria-labelledby");
              const labelledText = labelledBy
                ? labelledBy.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? "").join(" ")
                : "";
              const nativeLabels = "labels" in element
                ? [...(element.labels ?? [])].map((label) => label.textContent ?? "").join(" ")
                : "";
              return ![
                element.getAttribute("aria-label") ?? "",
                labelledText,
                nativeLabels,
                element.textContent ?? "",
                element.getAttribute("title") ?? ""
              ].some((value) => value.trim().length > 0);
            })
            .map((element) => `${element.tagName.toLowerCase()}#${element.id || "unnamed"}`),
          focusableCount: [...document.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
            .filter((element) => {
              const style = getComputedStyle(element);
              return style.display !== "none" && style.visibility !== "hidden";
            }).length
        }), {
          pagePath: policy.path,
          origin: baseUrl,
          expectedCanonicalOrigin: canonicalOrigin
        });
        snapshot.status = response?.status() ?? 0;
        let redirectCount = 0;
        for (let request = response?.request().redirectedFrom(); request; request = request.redirectedFrom()) redirectCount += 1;
        snapshot.consoleErrors = consoleErrors;
        snapshot.pageErrors = pageErrors;
        snapshot.resourceErrors = resourceErrors;
        snapshot.http4xx = http4xx;
        snapshot.http5xx = http5xx;
        snapshot.redirectCount = redirectCount;
        await page.keyboard.press("Tab");
        snapshot.focusIndicatorVisible = await page.evaluate(() => {
          const active = document.activeElement;
          if (!active || active === document.body) return false;
          const style = getComputedStyle(active);
          return style.outlineStyle !== "none" || style.boxShadow !== "none";
        });
        const failures = evaluatePreviewSnapshot(snapshot, policy);
        const screenshotPath = path.join(
          outputDir,
          `${viewport.name}-${policy.path === "/" ? "home" : policy.path.slice(1)}.png`
        );
        await page.screenshot({ path: screenshotPath, fullPage: true });
        results.push({ viewport: viewport.name, path: policy.path, failures, screenshotPath, consoleErrors, pageErrors, resourceErrors, platformWarnings, canceledRequests, http4xx, http5xx, redirectCount });
        await page.close();
      }
    } finally {
      await context.close();
    }
  }

  const apiContext = await browser.newContext();
  try {
    if (previewAccessCookie) {
      await apiContext.addCookies([{
        name: previewAccessCookie.name,
        value: previewAccessCookie.value,
        url: baseUrl,
        httpOnly: true,
        secure: true,
        sameSite: "Lax"
      }]);
    }
    const response = await apiContext.request.get(`${baseUrl}${reviewReadinessApiPath}`);
    const contentType = response.headers()["content-type"] ?? "";
    let payload = null;
    try {
      payload = await response.json();
    } catch {
      // The deterministic content-type and envelope failures below preserve the evidence.
    }
    const snapshot = {
      path: reviewReadinessApiPath,
      status: response.status(),
      contentType,
      reviewAuthority: response.headers()["x-scrimed-review-authority"] ?? "",
      payload
    };
    apiResults.push({ ...snapshot, failures: evaluateReviewReadinessResponse(snapshot) });
  } finally {
    await apiContext.close();
  }
} finally {
  await browser.close();
}

const report = {
  service: "scrimed-preview-ui-verification",
  baseUrl,
  canonicalOrigin,
  capturedAt: new Date().toISOString(),
  passed:
    results.every((result) => result.failures.length === 0) &&
    apiResults.every((result) => result.failures.length === 0),
  results,
  apiResults
};
await writeFile(
  path.join(outputDir, "preview-ui-verification.json"),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8"
);

if (flags.has("--json")) console.log(JSON.stringify(report, null, 2));
else {
  console.log(
    `${report.passed ? "pass" : "blocked"} SCRIMED preview UI verification (${results.length} route/viewport checks, ${apiResults.length} API checks)`
  );
  for (const result of results.filter((entry) => entry.failures.length > 0)) {
    console.log(`${result.viewport} ${result.path}: ${result.failures.join(", ")}`);
  }
  for (const result of apiResults.filter((entry) => entry.failures.length > 0)) {
    console.log(`api ${result.path}: ${result.failures.join(", ")}`);
  }
}
if (!report.passed || flags.has("--strict") && !report.passed) process.exitCode = 1;
