#!/usr/bin/env node

import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

import publicationPolicy from "../config/wix-publication-policy.json" with { type: "json" };

const rawArgs = process.argv.slice(2);
const flags = new Set(rawArgs.filter((arg) => !arg.includes("=")));
const allowedFlags = new Set(["--self-test", "--strict", "--json"]);
const unknown = [...flags].filter((flag) => !allowedFlags.has(flag));
if (unknown.length) throw new Error(`Unsupported live-mobile option: ${unknown.join(", ")}`);

const valueArg = (name, fallback) =>
  rawArgs.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const canonicalOrigin = new URL(valueArg("base-url", publicationPolicy.baseUrl)).origin;
if (canonicalOrigin !== new URL(publicationPolicy.baseUrl).origin) {
  throw new Error("Live mobile verification is restricted to the governed Wix canonical origin.");
}

function normalizeExecutablePath(value) {
  if (!value) return undefined;
  if (!path.isAbsolute(value) || !/(?:chrome|chromium)/i.test(path.basename(value))) {
    throw new Error(
      "SCRIMED_PLAYWRIGHT_EXECUTABLE_PATH must be an absolute Chrome/Chromium path."
    );
  }
  return value;
}

const executablePath = normalizeExecutablePath(
  process.env.SCRIMED_PLAYWRIGHT_EXECUTABLE_PATH
);

export function evaluateMobilePage(snapshot) {
  const failures = [];
  if (snapshot.status !== 200) failures.push(`route-status:${snapshot.path}:${snapshot.status}`);
  if (snapshot.viewportWidth !== 390) failures.push(`viewport-width:${snapshot.path}:${snapshot.viewportWidth}`);
  if (snapshot.documentWidth > snapshot.viewportWidth + 1) {
    failures.push(`horizontal-overflow:${snapshot.path}:${snapshot.documentWidth}`);
  }
  if (snapshot.bodyWidth > snapshot.viewportWidth + 1) {
    failures.push(`body-overflow:${snapshot.path}:${snapshot.bodyWidth}`);
  }
  if (!snapshot.mobileUserAgent) failures.push(`mobile-user-agent-missing:${snapshot.path}`);
  return failures;
}

if (flags.has("--self-test")) {
  const safe = {
    path: "/",
    status: 200,
    viewportWidth: 390,
    documentWidth: 390,
    bodyWidth: 390,
    mobileUserAgent: true
  };
  assert.deepEqual(evaluateMobilePage(safe), []);
  assert.deepEqual(evaluateMobilePage({ ...safe, documentWidth: 980 }), ["horizontal-overflow:/:980"]);
  assert.throws(() => new URL("not-a-url"));
  assert.throws(() => normalizeExecutablePath("relative/browser"));
  console.log("pass SCRIMED live mobile verifier self-test");
  process.exit(0);
}

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  try {
    ({ chromium } = createRequire(import.meta.url)("playwright"));
  } catch {
    console.error("blocked live mobile verification: Playwright is unavailable in this environment.");
    process.exit(2);
  }
}

const routeSet = new Set([
  "/",
  "/vitals-monitoring",
  "/faithcore",
  "/about-scrimed",
  "/partner-with-scrimed",
  "/request-a-demo",
  "/blank",
  "/blank-1",
  "/blank-2",
  "/blank-3"
]);
const routes = publicationPolicy.scanRoutes.filter((route) => routeSet.has(route));
const outputDirectory = path.resolve(valueArg("output-dir", "artifacts/live-mobile"));
await mkdir(outputDirectory, { recursive: true });

let browser;
try {
  browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {})
  });
} catch {
  const blocked = {
    schemaVersion: "scrimed-live-mobile-verification-v1-2026-08-01",
    status: "BLOCKED_ENVIRONMENT",
    reasonCode: "browser-launch-failed",
    canonicalOrigin,
    approvedExecutableConfigured: Boolean(executablePath),
    productionEvidenceAccepted: false
  };
  if (flags.has("--json")) console.log(JSON.stringify(blocked, null, 2));
  else {
    console.error(
      "blocked live mobile verification: approved Chrome/Chromium could not start in this environment."
    );
  }
  process.exit(2);
}
const results = [];
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    screen: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1 SCRIMED-Mobile-Verification/1.0"
  });
  for (const route of routes) {
    const page = await context.newPage();
    const response = await page.goto(`${canonicalOrigin}${route}`, {
      waitUntil: "networkidle",
      timeout: 45_000
    });
    const snapshot = await page.evaluate((pagePath) => {
      const viewportWidth = window.innerWidth;
      const offendingSelectors = [...document.querySelectorAll("body *")]
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            element,
            rect,
            overflow: rect.right > viewportWidth + 1 || rect.left < -1 || rect.width > viewportWidth + 1
          };
        })
        .filter((item) => item.overflow && item.rect.width > 0 && item.rect.height > 0)
        .slice(0, 25)
        .map(({ element, rect }) => ({
          selector: [
            element.tagName.toLowerCase(),
            element.id ? `#${element.id}` : "",
            [...element.classList].slice(0, 3).map((name) => `.${name}`).join("")
          ].join(""),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width)
        }));
      return {
        path: pagePath,
        status: 0,
        title: document.title,
        viewportWidth,
        documentWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body?.scrollWidth ?? 0,
        mobileUserAgent: /iphone|mobile/i.test(navigator.userAgent),
        offendingSelectors
      };
    }, route);
    snapshot.status = response?.status() ?? 0;
    const fileName = route === "/" ? "home" : route.replace(/^\//, "").replaceAll("/", "-");
    const screenshot = path.join(outputDirectory, `${fileName}-390px.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    const failures = evaluateMobilePage(snapshot);
    results.push({ ...snapshot, failures, screenshot });
    await page.close();
  }
  await context.close();
} finally {
  await browser.close();
}

const report = {
  schemaVersion: "scrimed-live-mobile-verification-v1-2026-08-01",
  canonicalOrigin,
  capturedAt: new Date().toISOString(),
  device: { viewportWidth: 390, viewportHeight: 844, deviceScaleFactor: 3, mobileUserAgent: true },
  results,
  failureCount: results.reduce((count, result) => count + result.failures.length, 0),
  passed: results.every((result) => result.failures.length === 0),
  mutationPerformed: false
};
await writeFile(
  path.join(outputDirectory, "live-mobile-verification.json"),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8"
);
if (flags.has("--json")) console.log(JSON.stringify(report, null, 2));
else console.log(`report SCRIMED live mobile verification pages=${results.length} failures=${report.failureCount}`);
if (flags.has("--strict") && !report.passed) process.exitCode = 1;
