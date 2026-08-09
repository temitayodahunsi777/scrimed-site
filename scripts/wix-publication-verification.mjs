#!/usr/bin/env node

import assert from "node:assert/strict";
import { constants } from "node:fs";
import path from "node:path";
import { lstat, open, realpath } from "node:fs/promises";

import {
  verifyWixPublicationEvidence,
  wixPublicationPolicy
} from "./lib/wix-publication-policy.mjs";

const args = new Set(process.argv.slice(2));
const allowedArgs = new Set(["--json", "--self-test", "--strict"]);
const unknownArgs = [...args].filter((arg) => !allowedArgs.has(arg));
const maximumResponseBytes = 8_000_000;
const maximumEvidenceFiles = 128;
const maximumAggregateEvidenceBytes = 32_000_000;
const maximumConcurrentRequests = 4;
const maximumRedirects = 5;
const redirectStatuses = new Set([301, 302, 303, 307, 308]);
const allowedHostnames = new Set(
  [
    wixPublicationPolicy.baseUrl,
    ...wixPublicationPolicy.redirectSources
  ].map((value) => new URL(value).hostname)
);

if (unknownArgs.length > 0) {
  throw new Error(`Unsupported Wix publication verification option: ${unknownArgs.join(", ")}`);
}

function extractRobots(html) {
  const tags = [...html.matchAll(/<meta\b([^>]*)>/gi)];
  for (const tag of tags) {
    const attributes = Object.fromEntries(
      [...tag[1].matchAll(/([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map((match) => [
        match[1].toLowerCase(),
        match[2] ?? match[3] ?? ""
      ])
    );
    if (attributes.name?.toLowerCase() === "robots") return attributes.content ?? "";
  }
  return "";
}

class PublicationEvidenceError extends Error {
  constructor(code, networkAvailable) {
    super(code);
    this.name = "PublicationEvidenceError";
    this.code = code;
    this.networkAvailable = networkAvailable;
  }
}

async function mapWithConcurrency(values, worker) {
  const results = new Array(values.length);
  let nextIndex = 0;

  async function consume() {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(values[index], index);
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(maximumConcurrentRequests, values.length) },
      () => consume()
    )
  );
  return results;
}

function parseAllowedPublicUrl(value, evidenceLabel) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new PublicationEvidenceError(`invalid-url:${evidenceLabel}`, null);
  }
  if (
    !new Set(["http:", "https:"]).has(parsed.protocol)
    || !allowedHostnames.has(parsed.hostname)
    || parsed.username
    || parsed.password
    || parsed.port
  ) {
    throw new PublicationEvidenceError(`disallowed-url:${evidenceLabel}`, null);
  }
  return parsed;
}

function parseAllowedRedirectUrl(currentUrl, location, evidenceLabel) {
  const nextUrl = parseAllowedPublicUrl(
    new URL(location, currentUrl).toString(),
    evidenceLabel
  );
  if (currentUrl.protocol === "https:" && nextUrl.protocol !== "https:") {
    throw new PublicationEvidenceError(`redirect-downgrade:${evidenceLabel}`, null);
  }
  return nextUrl;
}

async function readBoundedResponseBody(response, evidenceLabel) {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maximumResponseBytes) {
      await reader.cancel();
      throw new PublicationEvidenceError(`response-too-large:${evidenceLabel}`, true);
    }
    chunks.push(Buffer.from(value));
  }

  return Buffer.concat(chunks, totalBytes).toString("utf8");
}

async function fetchResource(url, evidenceLabel) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  let currentUrl = parseAllowedPublicUrl(url, evidenceLabel);

  try {
    for (let redirectCount = 0; redirectCount <= maximumRedirects; redirectCount += 1) {
      const response = await fetch(currentUrl, {
        cache: "no-store",
        redirect: "manual",
        signal: controller.signal,
        headers: { "user-agent": "SCRIMED-Wix-Publication-Verification/1.0" }
      });
      if (redirectStatuses.has(response.status)) {
        const location = response.headers.get("location");
        await response.body?.cancel();
        if (!location) {
          throw new PublicationEvidenceError(`redirect-location-missing:${evidenceLabel}`, true);
        }
        currentUrl = parseAllowedRedirectUrl(currentUrl, location, evidenceLabel);
        continue;
      }

      const declaredLength = Number(response.headers.get("content-length") ?? 0);
      if (Number.isFinite(declaredLength) && declaredLength > maximumResponseBytes) {
        await response.body?.cancel();
        throw new PublicationEvidenceError(`response-too-large:${evidenceLabel}`, true);
      }
      const content = await readBoundedResponseBody(response, evidenceLabel);
      return {
        status: response.status,
        finalUrl: currentUrl.toString(),
        content
      };
    }
    throw new PublicationEvidenceError(`redirect-limit-exceeded:${evidenceLabel}`, true);
  } catch (error) {
    if (error instanceof PublicationEvidenceError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new PublicationEvidenceError(`network-timeout:${evidenceLabel}`, false);
    }
    throw new PublicationEvidenceError(`network-request-failed:${evidenceLabel}`, false);
  } finally {
    clearTimeout(timeout);
  }
}

async function collectLiveEvidence() {
  const collectionFailures = [];

  async function collectSafely(label, worker) {
    try {
      return await worker();
    } catch (error) {
      const publicationError =
        error instanceof PublicationEvidenceError
          ? error
          : new PublicationEvidenceError(`evidence-unavailable:${label}`, false);
      collectionFailures.push(publicationError.code);
      return null;
    }
  }

  const pages = await mapWithConcurrency(
    wixPublicationPolicy.scanRoutes,
    (route) => collectSafely(`page:${route}`, async () => {
      const result = await fetchResource(
        `${wixPublicationPolicy.baseUrl}${route}`,
        `page:${route}`
      );
      return {
        path: route,
        status: result.status,
        finalUrl: result.finalUrl,
        html: result.content
      };
    })
  );
  const retiredRoutes = await mapWithConcurrency(
    wixPublicationPolicy.retiredStoreRoutes,
    (route) => collectSafely(`retired:${route}`, async () => {
      const result = await fetchResource(
        `${wixPublicationPolicy.baseUrl}${route}`,
        `retired:${route}`
      );
      return { path: route, status: result.status };
    })
  );
  const bookingRoutes = await mapWithConcurrency(
    wixPublicationPolicy.noIndexBookingSystemRoutes,
    (route) => collectSafely(`booking:${route}`, async () => {
      const result = await fetchResource(
        `${wixPublicationPolicy.baseUrl}${route}`,
        `booking:${route}`
      );
      return {
        path: route,
        status: result.status,
        robots: extractRobots(result.content)
      };
    })
  );
  const redirects = await mapWithConcurrency(
    wixPublicationPolicy.redirectSources,
    (source) => collectSafely(`redirect:${new URL(source).host}`, async () => {
      const result = await fetchResource(source, `redirect:${new URL(source).host}`);
      return { source, status: result.status, finalUrl: result.finalUrl };
    })
  );
  const crawlerFiles = await mapWithConcurrency(
    wixPublicationPolicy.crawlerFiles,
    (route) => collectSafely(`crawler:${route}`, async () => {
      const result = await fetchResource(
        `${wixPublicationPolicy.baseUrl}${route}`,
        `crawler:${route}`
      );
      return { path: route, status: result.status, content: result.content };
    })
  );

  return {
    capture: {
      mode: "live-http-observation",
      baseUrl: wixPublicationPolicy.baseUrl,
      capturedAt: new Date().toISOString()
    },
    pages: pages.filter(Boolean),
    retiredRoutes: retiredRoutes.filter(Boolean),
    bookingRoutes: bookingRoutes.filter(Boolean),
    redirects: redirects.filter(Boolean),
    crawlerFiles: crawlerFiles.filter(Boolean),
    collectionFailures
  };
}

async function resolveEvidenceAsset(root, pathname) {
  const absolutePath = path.resolve(root, pathname);
  const relativePath = path.relative(root, absolutePath);
  if (
    relativePath === ".."
    || relativePath.startsWith(`..${path.sep}`)
    || path.isAbsolute(relativePath)
  ) {
    throw new PublicationEvidenceError("evidence-path-outside-root", null);
  }
  const rootRealPath = await realpath(root);
  const assetStats = await lstat(absolutePath);
  if (assetStats.isSymbolicLink()) {
    throw new PublicationEvidenceError("evidence-symlink-not-allowed", null);
  }
  const assetRealPath = await realpath(absolutePath);
  const realRelativePath = path.relative(rootRealPath, assetRealPath);
  if (
    realRelativePath === ".."
    || realRelativePath.startsWith(`..${path.sep}`)
    || path.isAbsolute(realRelativePath)
  ) {
    throw new PublicationEvidenceError("evidence-path-outside-root", null);
  }
  return assetRealPath;
}

async function readBoundedEvidenceFile(pathname, label, budget) {
  let handle;
  try {
    handle = await open(
      pathname,
      constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0)
    );
    const fileStats = await handle.stat();
    if (!fileStats.isFile() || fileStats.size > maximumResponseBytes) {
      throw new PublicationEvidenceError(`evidence-file-invalid:${label}`, null);
    }
    budget.files += 1;
    budget.bytes += fileStats.size;
    if (
      budget.files > maximumEvidenceFiles ||
      budget.bytes > maximumAggregateEvidenceBytes
    ) {
      throw new PublicationEvidenceError("evidence-aggregate-budget-exceeded", null);
    }
    return await handle.readFile({ encoding: "utf8" });
  } catch (error) {
    if (error instanceof PublicationEvidenceError) throw error;
    throw new PublicationEvidenceError(`evidence-file-invalid:${label}`, null);
  } finally {
    await handle?.close();
  }
}

async function loadEvidenceFile(pathname) {
  const budget = { files: 0, bytes: 0 };
  const absolutePath = path.resolve(pathname);
  const root = await realpath(path.dirname(absolutePath));
  const manifestPath = await resolveEvidenceAsset(root, path.basename(absolutePath));
  const evidence = JSON.parse(await readBoundedEvidenceFile(manifestPath, "manifest", budget));
  const referencedEntries =
    (Array.isArray(evidence.pages) ? evidence.pages.length : 0) +
    (Array.isArray(evidence.crawlerFiles) ? evidence.crawlerFiles.length : 0);
  if (referencedEntries > maximumEvidenceFiles - 1) {
    throw new PublicationEvidenceError("evidence-aggregate-budget-exceeded", null);
  }

  for (const page of evidence.pages ?? []) {
    if (page.htmlPath && !page.html) {
      page.html = await readBoundedEvidenceFile(
        await resolveEvidenceAsset(root, page.htmlPath),
        `page:${page.path ?? "unknown"}`,
        budget
      );
    }
  }
  for (const crawler of evidence.crawlerFiles ?? []) {
    if (crawler.contentPath && !crawler.content) {
      crawler.content = await readBoundedEvidenceFile(
        await resolveEvidenceAsset(root, crawler.contentPath),
        `crawler:${crawler.path ?? "unknown"}`,
        budget
      );
    }
  }

  evidence.capture = {
    mode: "offline-operator-supplied",
    baseUrl: wixPublicationPolicy.baseUrl,
    capturedAt: new Date().toISOString()
  };
  return evidence;
}

function safeHtml(route) {
  const metadata = wixPublicationPolicy.requiredMetadata.find((entry) => entry.path === route);
  const expectedUrl =
    route === "/" ? `${wixPublicationPolicy.baseUrl}/` : `${wixPublicationPolicy.baseUrl}${route}`;
  const title = metadata?.title ?? `SCRIMED ${route}`;
  const description =
    metadata?.description
    ?? "SCRIMED synthetic-data demonstration content requiring human review; do not submit protected health information.";
  const ogTitle = metadata?.ogTitle ?? title;
  const ogDescription = metadata?.ogDescription ?? description;
  const disclosure =
    route === "/"
      ? "No-PHI synthetic demonstration. Human-supervised workflows require human review."
      : "";
  const requiredVisibleText = (metadata?.requiredVisibleText ?? []).join(" ");

  return `<!doctype html>
<html>
  <head>
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta property="og:title" content="${ogTitle}">
    <meta property="og:description" content="${ogDescription}">
    <meta property="og:url" content="${expectedUrl}">
    <link rel="canonical" href="${expectedUrl}">
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"SCRIMED SOLUTIONS","url":"${wixPublicationPolicy.baseUrl}"}</script>
  </head>
  <body>${disclosure} ${requiredVisibleText}</body>
</html>`;
}

function safeEvidenceFixture() {
  const nestedSitemaps = wixPublicationPolicy.crawlerFiles.filter(
    (route) => route.endsWith("-sitemap.xml")
  );
  const indexedUrls = wixPublicationPolicy.scanRoutes
    .map((route) => {
      const url =
        route === "/" ? `${wixPublicationPolicy.baseUrl}/` : `${wixPublicationPolicy.baseUrl}${route}`;
      return `<url><loc>${url}</loc></url>`;
    })
    .join("");

  return {
    capture: {
      mode: "live-http-observation",
      baseUrl: wixPublicationPolicy.baseUrl,
      capturedAt: new Date().toISOString()
    },
    pages: wixPublicationPolicy.scanRoutes.map((route) => ({
      path: route,
      status: 200,
      finalUrl:
        route === "/" ? `${wixPublicationPolicy.baseUrl}/` : `${wixPublicationPolicy.baseUrl}${route}`,
      html: safeHtml(route)
    })),
    retiredRoutes: wixPublicationPolicy.retiredStoreRoutes.map((route) => ({
      path: route,
      status: 404
    })),
    bookingRoutes: wixPublicationPolicy.noIndexBookingSystemRoutes.map((route) => ({
      path: route,
      status: 200,
      robots: "noindex"
    })),
    redirects: wixPublicationPolicy.redirectSources.map((source) => ({
      source,
      status: 200,
      finalUrl: `${wixPublicationPolicy.baseUrl}/`
    })),
    crawlerFiles: wixPublicationPolicy.crawlerFiles.map((route) => ({
      path: route,
      status: 200,
      content:
        route === "/sitemap.xml"
          ? `<sitemapindex>${nestedSitemaps
              .map(
                (sitemap) =>
                  `<sitemap><loc>${wixPublicationPolicy.baseUrl}${sitemap}</loc></sitemap>`
              )
              .join("")}</sitemapindex>`
          : route.endsWith("-sitemap.xml")
            ? `<urlset>${indexedUrls}</urlset>`
            : `${wixPublicationPolicy.baseUrl}/`
    }))
  };
}

async function runSelfTest() {
  const safe = safeEvidenceFixture();
  assert.equal(verifyWixPublicationEvidence(safe).passed, true);
  assert.throws(
    () => parseAllowedPublicUrl("https://example.com", "self-test"),
    /disallowed-url:self-test/
  );
  assert.throws(
    () =>
      parseAllowedRedirectUrl(
        new URL("https://www.scrimedsolutions.com/"),
        "http://www.scrimedsolutions.com/",
        "self-test"
      ),
    /redirect-downgrade:self-test/
  );
  await assert.rejects(
    () => resolveEvidenceAsset("/tmp/scrimed-wix-evidence", "../outside.html"),
    /evidence-path-outside-root/
  );

  const unsafeSchema = structuredClone(safe);
  unsafeSchema.pages[0].html = unsafeSchema.pages[0].html.replace(
    "</head>",
    '<script type="application/ld+json">{"@context":"https://schema.org","@type":"Review","address":{"addressLocality":"Atlanta, GA"},"telephone":"+14049814427"}</script></head>'
  );
  const unsafeSchemaResult = verifyWixPublicationEvidence(unsafeSchema);
  assert.equal(unsafeSchemaResult.passed, false);
  assert.equal(
    unsafeSchemaResult.failures.some((failure) => failure.includes("forbidden-jsonld-type:Review")),
    true
  );
  assert.equal(
    unsafeSchemaResult.failures.some((failure) => failure.includes("forbidden-jsonld-key:address")),
    true
  );

  const caseVariantSchema = structuredClone(safe);
  caseVariantSchema.pages[0].html = caseVariantSchema.pages[0].html.replace(
    "</head>",
    '<script type="application/ld+json">{"@context":"https://schema.org","@type":"review","Address":{"addressLocality":"Atlanta, GA"}}</script></head>'
  );
  const caseVariantResult = verifyWixPublicationEvidence(caseVariantSchema);
  assert.equal(
    caseVariantResult.failures.some((failure) =>
      failure.includes("forbidden-jsonld-type:review")
    ),
    true
  );
  assert.equal(
    caseVariantResult.failures.some((failure) =>
      failure.includes("forbidden-jsonld-key:Address")
    ),
    true
  );

  const unsafeVitals = structuredClone(safe);
  unsafeVitals.pages.find((page) => page.path === "/vitals-monitoring").html += "predictive alerts";
  assert.equal(
    verifyWixPublicationEvidence(unsafeVitals).failures.some((failure) =>
      failure.includes("unsupported-vitals-alert-claim")
    ),
    true
  );

  const visibleStoreNavigation = structuredClone(safe);
  visibleStoreNavigation.pages[0].html = visibleStoreNavigation.pages[0].html.replace(
    "</body>",
    "<nav><a href=\"/shop\">Shop</a></nav></body>"
  );
  assert.equal(
    verifyWixPublicationEvidence(visibleStoreNavigation).failures.includes(
      "visible-commerce-label:/:Shop"
    ),
    true
  );

  const visibleUnverifiedPhone = structuredClone(safe);
  visibleUnverifiedPhone.pages[0].html = visibleUnverifiedPhone.pages[0].html.replace(
    "</body>",
    "<p>(404) 981-4427</p></body>"
  );
  assert.equal(
    verifyWixPublicationEvidence(visibleUnverifiedPhone).failures.some((failure) =>
      failure.includes("unverified-organization-contact-metadata")
    ),
    true
  );

  const missingRoute = structuredClone(safe);
  missingRoute.pages = missingRoute.pages.filter((page) => page.path !== "/faithcore");
  assert.equal(
    verifyWixPublicationEvidence(missingRoute).failures.includes(
      "missing-route-evidence:/faithcore"
    ),
    true
  );

  const duplicateRoute = structuredClone(safe);
  duplicateRoute.pages.push(structuredClone(duplicateRoute.pages[0]));
  assert.equal(
    verifyWixPublicationEvidence(duplicateRoute).failures.includes(
      "duplicate-page-evidence:/"
    ),
    true
  );

  const activeStore = structuredClone(safe);
  activeStore.retiredRoutes[0].status = 200;
  assert.equal(
    verifyWixPublicationEvidence(activeStore).failures.some((failure) =>
      failure.startsWith("retired-route-active:")
    ),
    true
  );

  const indexableBooking = structuredClone(safe);
  indexableBooking.bookingRoutes[0].robots = "index,follow";
  assert.equal(
    verifyWixPublicationEvidence(indexableBooking).failures.some((failure) =>
      failure.startsWith("booking-route-indexable:")
    ),
    true
  );

  const unscannedRoute = structuredClone(safe);
  unscannedRoute.crawlerFiles.find((entry) => entry.path === "/pages-sitemap.xml").content +=
    `<url><loc>${wixPublicationPolicy.baseUrl}/forgotten-page</loc></url>`;
  assert.equal(
    verifyWixPublicationEvidence(unscannedRoute).failures.includes(
      "unscanned-indexed-route:/forgotten-page"
    ),
    true
  );

  const uncollectedSitemap = structuredClone(safe);
  uncollectedSitemap.crawlerFiles.find((entry) => entry.path === "/sitemap.xml").content +=
    `<sitemap><loc>${wixPublicationPolicy.baseUrl}/new-sitemap.xml</loc></sitemap>`;
  assert.equal(
    verifyWixPublicationEvidence(uncollectedSitemap).failures.includes(
      "uncollected-sitemap:/new-sitemap.xml"
    ),
    true
  );

  const externalSitemapLocation = structuredClone(safe);
  externalSitemapLocation.crawlerFiles.find(
    (entry) => entry.path === "/pages-sitemap.xml"
  ).content += "<url><loc>https://example.com/untrusted</loc></url>";
  assert.equal(
    verifyWixPublicationEvidence(externalSitemapLocation).failures.includes(
      "crawler-external-location:/pages-sitemap.xml"
    ),
    true
  );

  const unexpectedPage = structuredClone(safe);
  unexpectedPage.pages.push({
    path: "/unexpected",
    status: 200,
    finalUrl: `${wixPublicationPolicy.baseUrl}/unexpected`,
    html: safeHtml("/")
  });
  assert.equal(
    verifyWixPublicationEvidence(unexpectedPage).failures.includes(
      "unexpected-page-evidence:/unexpected"
    ),
    true
  );

  const offlineEvidence = structuredClone(safe);
  offlineEvidence.capture.mode = "offline-operator-supplied";
  assert.equal(verifyWixPublicationEvidence(offlineEvidence).passed, false);
  assert.equal(
    verifyWixPublicationEvidence(offlineEvidence).failures.includes(
      "published-evidence-must-be-direct-live-observation"
    ),
    true
  );

  const partialEvidence = structuredClone(safe);
  partialEvidence.collectionFailures = ["network-timeout:booking:/cart-page"];
  assert.equal(
    verifyWixPublicationEvidence(partialEvidence).failures.includes(
      "network-timeout:booking:/cart-page"
    ),
    true
  );

  const malformedHtml = structuredClone(safe);
  malformedHtml.pages[0].html = "<meta ".repeat(2_050);
  assert.equal(
    verifyWixPublicationEvidence(malformedHtml).failures.some((failure) =>
      failure.startsWith("html-tag-")
    ),
    true
  );

  console.log(
    `pass SCRIMED Wix publication verification self-test (${wixPublicationPolicy.scanRoutes.length} routes, metadata, JSON-LD, redirects, crawler files, and commerce boundaries)`
  );
}

if (args.has("--self-test")) {
  await runSelfTest();
  process.exit(0);
}

const evidencePath = process.env.SCRIMED_WIX_PUBLICATION_EVIDENCE_PATH?.trim();
let report;

try {
  const evidence = evidencePath ? await loadEvidenceFile(evidencePath) : await collectLiveEvidence();
  report = {
    ...verifyWixPublicationEvidence(evidence),
    evidenceSource: evidencePath ? "operator-supplied-ephemeral-evidence" : "direct-network-fetch",
    networkAvailable: evidencePath ? null : true
  };
} catch (error) {
  const publicationError =
    error instanceof PublicationEvidenceError
      ? error
      : new PublicationEvidenceError("evidence-unavailable", false);
  report = {
    service: "scrimed-wix-publication-verification",
    policyVersion: wixPublicationPolicy.version,
    status: "evidence-unavailable",
    passed: false,
    failures: [publicationError.code],
    pageResults: [],
    evidenceSummary: {
      captureMode: "missing",
      capturedAt: null,
      pages: 0,
      retiredRoutes: 0,
      bookingRoutes: 0,
      redirects: 0,
      crawlerFiles: 0
    },
    evidenceSource: evidencePath ? "operator-supplied-ephemeral-evidence" : "direct-network-fetch",
    networkAvailable: publicationError.networkAvailable,
    rawContentStored: false,
    visitorDataCollected: false,
    clinicalAuthorityGranted: false,
    boundary:
      "Unavailable publication evidence fails closed in strict mode. This check does not authorize PHI, clinical use, certification, customer activation, or deployment."
  };
}

if (args.has("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`${report.passed ? "pass" : args.has("--strict") ? "blocked" : "report"} SCRIMED Wix publication verification: ${report.status}`);
  console.log(
    `policy=${report.policyVersion} evidence_source=${report.evidenceSource} network_available=${report.networkAvailable}`
  );
  console.log(
    `pages=${report.evidenceSummary.pages} retired_routes=${report.evidenceSummary.retiredRoutes} booking_routes=${report.evidenceSummary.bookingRoutes} redirects=${report.evidenceSummary.redirects} crawler_files=${report.evidenceSummary.crawlerFiles}`
  );
  console.log(`failure_codes=${report.failures.join(",") || "none"}`);
  console.log(report.boundary);
}

if (args.has("--strict") && !report.passed) process.exitCode = 1;
