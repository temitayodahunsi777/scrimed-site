import { readFileSync } from "node:fs";

import { evaluatePublicClaimsIntegrity } from "./public-claims-policy.mjs";

export const wixPublicationPolicy = JSON.parse(
  readFileSync(new URL("../../config/wix-publication-policy.json", import.meta.url), "utf8")
);

const maximumHtmlStartTags = 2_048;
const maximumHtmlTagBytes = 32_768;
const maximumScriptBodyBytes = 4_000_000;
const maximumEvidenceAgeMs = 30 * 60 * 1000;

function inspectBoundedHtmlStructure(html) {
  const failures = [];
  const normalized = html.toLowerCase();

  for (const tagName of ["meta", "link", "title", "script"]) {
    const marker = `<${tagName}`;
    let cursor = 0;
    let count = 0;
    while (cursor < normalized.length) {
      const start = normalized.indexOf(marker, cursor);
      if (start < 0) break;
      const boundary = normalized[start + marker.length] ?? "";
      if (boundary && !/[\s/>]/.test(boundary)) {
        cursor = start + marker.length;
        continue;
      }
      count += 1;
      if (count > maximumHtmlStartTags) {
        failures.push(`html-tag-budget-exceeded:${tagName}`);
        break;
      }
      const tagEnd = normalized.indexOf(">", start + marker.length);
      if (tagEnd < 0 || tagEnd - start > maximumHtmlTagBytes) {
        failures.push(`html-tag-malformed-or-oversized:${tagName}`);
        break;
      }
      if (tagName === "script") {
        const close = normalized.indexOf("</script>", tagEnd + 1);
        if (close < 0 || close - tagEnd > maximumScriptBodyBytes) {
          failures.push("html-script-malformed-or-oversized");
          break;
        }
        cursor = close + "</script>".length;
      } else {
        cursor = tagEnd + 1;
      }
    }
  }

  return failures;
}

function decodeHtml(value = "") {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .trim();
}

function parseAttributes(source = "") {
  const attributes = {};
  const expression = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match;

  while ((match = expression.exec(source)) !== null) {
    attributes[match[1].toLowerCase()] = decodeHtml(match[2] ?? match[3] ?? match[4] ?? "");
  }

  return attributes;
}

function extractTags(html, tagName) {
  const expression = new RegExp(`<${tagName}\\b([^>]*)>`, "gi");
  return [...html.matchAll(expression)].map((match) => parseAttributes(match[1]));
}

function extractTitle(html) {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return decodeHtml(match?.[1]?.replace(/<[^>]+>/g, "") ?? "");
}

function extractVisibleText(html) {
  return decodeHtml(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
  );
}

function containsVisibleLabel(visibleText, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  return new RegExp(`\\b${escaped}\\b`, "i").test(visibleText);
}

function extractMeta(html, attributeName, attributeValue) {
  const target = attributeValue.toLowerCase();
  const tag = extractTags(html, "meta").find(
    (attributes) => attributes[attributeName.toLowerCase()]?.toLowerCase() === target
  );
  return tag?.content ?? "";
}

function extractCanonical(html) {
  const tag = extractTags(html, "link").find((attributes) =>
    attributes.rel
      ?.toLowerCase()
      .split(/\s+/)
      .includes("canonical")
  );
  return tag?.href ?? "";
}

function extractJsonLd(html) {
  const objects = [];
  const errors = [];
  const expression = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = expression.exec(html)) !== null) {
    const attributes = parseAttributes(match[1]);
    if (attributes.type?.toLowerCase() !== "application/ld+json") continue;

    try {
      objects.push(JSON.parse(match[2].trim()));
    } catch {
      errors.push("invalid-json-ld");
    }
  }

  return { objects, errors };
}

function collectJsonLdViolations(value, path = "$", violations = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectJsonLdViolations(item, `${path}[${index}]`, violations));
    return violations;
  }

  if (!value || typeof value !== "object") return violations;

  const forbiddenTypes = new Set(
    wixPublicationPolicy.forbiddenJsonLdTypes.map((type) => type.toLowerCase())
  );
  const forbiddenKeys = new Set(
    wixPublicationPolicy.forbiddenJsonLdKeys.map((key) => key.toLowerCase())
  );
  const types = Array.isArray(value["@type"]) ? value["@type"] : [value["@type"]];
  for (const type of types.filter((candidate) => typeof candidate === "string")) {
    if (forbiddenTypes.has(type.toLowerCase())) {
      violations.push(`forbidden-jsonld-type:${type}:${path}`);
    }
  }

  for (const [key, nested] of Object.entries(value)) {
    if (forbiddenKeys.has(key.toLowerCase())) {
      violations.push(`forbidden-jsonld-key:${key}:${path}`);
    }
    collectJsonLdViolations(nested, `${path}.${key}`, violations);
  }

  return violations;
}

function normalizeUrl(value) {
  try {
    const parsed = new URL(value);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return "";
  }
}

function expectedRouteUrl(path) {
  return path === "/"
    ? `${wixPublicationPolicy.baseUrl}/`
    : `${wixPublicationPolicy.baseUrl}${path}`;
}

function extractCrawlerLocations(content = "") {
  return [...content.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)]
    .map((match) => decodeHtml(match[1]))
    .filter(Boolean);
}

function locationPath(value) {
  try {
    const parsed = new URL(value);
    if (parsed.origin !== wixPublicationPolicy.baseUrl) return null;
    return parsed.pathname === "/" ? "/" : parsed.pathname.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

function collectDuplicateKeys(entries, key) {
  const seen = new Set();
  const duplicates = new Set();
  for (const entry of entries) {
    const value = entry?.[key];
    if (typeof value !== "string") continue;
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

function collectUnexpectedKeys(entries, key, allowedValues, label) {
  return entries
    .map((entry) => entry?.[key])
    .filter(
      (value) =>
        typeof value !== "string"
        || !allowedValues.has(value)
    )
    .map((value) => `${label}:${typeof value === "string" ? value : "missing"}`);
}

function collectPolicyConfigurationFailures() {
  const failures = [];
  const scanRoutes = new Set(wixPublicationPolicy.scanRoutes);
  const metadataPaths = wixPublicationPolicy.requiredMetadata.map((entry) => entry.path);
  const metadataPathSet = new Set(metadataPaths);

  for (const path of collectDuplicateKeys(
    wixPublicationPolicy.scanRoutes.map((route) => ({ path: route })),
    "path"
  )) {
    failures.push(`policy-duplicate-scan-route:${path}`);
  }
  for (const path of collectDuplicateKeys(wixPublicationPolicy.requiredMetadata, "path")) {
    failures.push(`policy-duplicate-metadata:${path}`);
  }
  for (const path of scanRoutes) {
    if (!metadataPathSet.has(path)) failures.push(`policy-missing-metadata:${path}`);
  }
  for (const path of metadataPaths) {
    if (!scanRoutes.has(path)) failures.push(`policy-unscanned-metadata:${path}`);
  }
  for (const path of wixPublicationPolicy.faithSpecificRoutes) {
    if (!scanRoutes.has(path)) failures.push(`policy-unscanned-faith-route:${path}`);
  }
  for (const key of ["retiredStoreRoutes", "redirectSources", "crawlerFiles", "noIndexBookingSystemRoutes"]) {
    const values = wixPublicationPolicy[key];
    const duplicates = collectDuplicateKeys(values.map((value) => ({ value })), "value");
    for (const value of duplicates) failures.push(`policy-duplicate-${key}:${value}`);
  }
  if (
    !Array.isArray(wixPublicationPolicy.forbiddenVisibleCommerceLabels)
    || wixPublicationPolicy.forbiddenVisibleCommerceLabels.length === 0
  ) {
    failures.push("policy-missing-visible-commerce-labels");
  }

  return failures;
}

export function inspectWixPublicationPage(page) {
  const failures = [];
  const html = typeof page.html === "string" ? page.html : "";
  const structureFailures = inspectBoundedHtmlStructure(html);
  if (structureFailures.length) {
    return {
      path: page.path,
      passed: false,
      failures: structureFailures.map((failure) => `${failure}:${page.path}`),
      metadata: {
        title: "",
        description: "",
        ogTitle: "",
        ogDescription: "",
        ogUrl: "",
        canonical: ""
      },
      blockedClaimIds: [],
      missingDisclosureIds: [],
      jsonLdObjectCount: 0
    };
  }
  const expectedUrl = expectedRouteUrl(page.path);
  const title = extractTitle(html);
  const description = extractMeta(html, "name", "description");
  const ogTitle = extractMeta(html, "property", "og:title");
  const ogDescription = extractMeta(html, "property", "og:description");
  const ogUrl = extractMeta(html, "property", "og:url");
  const canonical = extractCanonical(html);
  const required = wixPublicationPolicy.requiredMetadata.find((entry) => entry.path === page.path);
  const claims = evaluatePublicClaimsIntegrity(html);
  const jsonLd = extractJsonLd(html);
  const visibleText = extractVisibleText(html);

  if (page.status !== 200) failures.push(`route-status:${page.path}:${page.status}`);
  if (!html) failures.push(`empty-html:${page.path}`);
  if (normalizeUrl(page.finalUrl) !== expectedUrl) {
    failures.push(`final-url:${page.path}`);
  }
  if (normalizeUrl(canonical) !== normalizeUrl(expectedUrl)) {
    failures.push(`canonical:${page.path}`);
  }
  if (ogUrl && normalizeUrl(ogUrl) !== expectedUrl) failures.push(`og-url:${page.path}`);
  if (!title) failures.push(`missing-title:${page.path}`);

  if (required) {
    for (const [field, actual] of Object.entries({
      title,
      description,
      ogTitle,
      ogDescription
    })) {
      if (actual !== required[field]) failures.push(`metadata:${page.path}:${field}`);
    }
    if (!ogUrl) failures.push(`metadata:${page.path}:ogUrl`);
    for (const requiredText of required.requiredVisibleText ?? []) {
      if (!visibleText.toLowerCase().includes(requiredText.toLowerCase())) {
        failures.push(`visible-copy:${page.path}:${requiredText}`);
      }
    }
  }

  for (const label of wixPublicationPolicy.forbiddenVisibleCommerceLabels ?? []) {
    if (containsVisibleLabel(visibleText, label)) {
      failures.push(`visible-commerce-label:${page.path}:${label}`);
    }
  }

  for (const claim of claims.blockedClaims) {
    failures.push(`blocked-claim:${page.path}:${claim.id}`);
  }
  if (page.path === "/" && claims.missingDisclosures.length > 0) {
    failures.push(`missing-home-disclosures:${claims.missingDisclosures.join(",")}`);
  }
  if (/<a\b[^>]*href\s*=\s*["']tel:/i.test(html)) {
    failures.push(`telephone-link:${page.path}`);
  }
  if (!wixPublicationPolicy.faithSpecificRoutes.includes(page.path)) {
    const normalizedHtml = html.toLowerCase();
    for (const marker of wixPublicationPolicy.faithFirstEnterpriseMarkers) {
      if (normalizedHtml.includes(marker.toLowerCase())) {
        failures.push(`faith-first-enterprise-copy:${page.path}:${marker}`);
      }
    }
  }

  failures.push(...jsonLd.errors.map((error) => `${error}:${page.path}`));
  for (const [index, object] of jsonLd.objects.entries()) {
    failures.push(
      ...collectJsonLdViolations(object, `$[${index}]`).map(
        (violation) => `${violation}:${page.path}`
      )
    );
  }

  return {
    path: page.path,
    passed: failures.length === 0,
    failures,
    metadata: {
      title,
      description,
      ogTitle,
      ogDescription,
      ogUrl,
      canonical
    },
    blockedClaimIds: claims.blockedClaims.map((claim) => claim.id),
    missingDisclosureIds: claims.missingDisclosures,
    jsonLdObjectCount: jsonLd.objects.length
  };
}

export function verifyWixPublicationEvidence(evidence) {
  const failures = collectPolicyConfigurationFailures();
  if (Array.isArray(evidence?.collectionFailures)) {
    failures.push(
      ...evidence.collectionFailures.filter(
        (failure) => typeof failure === "string" && failure.length > 0
      )
    );
  }
  const capture = evidence?.capture;
  const capturedAt = Date.parse(capture?.capturedAt ?? "");
  if (capture?.mode !== "live-http-observation") {
    failures.push("published-evidence-must-be-direct-live-observation");
  }
  if (capture?.baseUrl !== wixPublicationPolicy.baseUrl) {
    failures.push("published-evidence-base-url-mismatch");
  }
  if (
    !Number.isFinite(capturedAt) ||
    capturedAt > Date.now() + 60_000 ||
    Date.now() - capturedAt > maximumEvidenceAgeMs
  ) {
    failures.push("published-evidence-stale-or-invalid");
  }
  const pages = Array.isArray(evidence.pages) ? evidence.pages : [];
  const pagePaths = new Set(pages.map((page) => page.path));
  const expectedPagePaths = new Set(wixPublicationPolicy.scanRoutes);

  failures.push(
    ...collectUnexpectedKeys(pages, "path", expectedPagePaths, "unexpected-page-evidence")
  );
  for (const path of collectDuplicateKeys(pages, "path")) {
    failures.push(`duplicate-page-evidence:${path}`);
  }
  for (const path of wixPublicationPolicy.scanRoutes) {
    if (!pagePaths.has(path)) failures.push(`missing-route-evidence:${path}`);
  }

  const pageResults = pages
    .filter((page) => wixPublicationPolicy.scanRoutes.includes(page.path))
    .map(inspectWixPublicationPage);
  failures.push(...pageResults.flatMap((result) => result.failures));

  const retiredRoutes = Array.isArray(evidence.retiredRoutes) ? evidence.retiredRoutes : [];
  failures.push(
    ...collectUnexpectedKeys(
      retiredRoutes,
      "path",
      new Set(wixPublicationPolicy.retiredStoreRoutes),
      "unexpected-retired-route-evidence"
    )
  );
  for (const path of collectDuplicateKeys(retiredRoutes, "path")) {
    failures.push(`duplicate-retired-route-evidence:${path}`);
  }
  for (const path of wixPublicationPolicy.retiredStoreRoutes) {
    const result = retiredRoutes.find((entry) => entry.path === path);
    if (!result) {
      failures.push(`missing-retired-route-evidence:${path}`);
    } else if (!wixPublicationPolicy.allowedRetiredRouteStatuses.includes(result.status)) {
      failures.push(`retired-route-active:${path}:${result.status}`);
    }
  }

  const bookingRoutes = Array.isArray(evidence.bookingRoutes) ? evidence.bookingRoutes : [];
  failures.push(
    ...collectUnexpectedKeys(
      bookingRoutes,
      "path",
      new Set(wixPublicationPolicy.noIndexBookingSystemRoutes),
      "unexpected-booking-route-evidence"
    )
  );
  for (const path of collectDuplicateKeys(bookingRoutes, "path")) {
    failures.push(`duplicate-booking-route-evidence:${path}`);
  }
  for (const path of wixPublicationPolicy.noIndexBookingSystemRoutes) {
    const result = bookingRoutes.find((entry) => entry.path === path);
    if (!result) {
      failures.push(`missing-booking-route-evidence:${path}`);
    } else {
      if (result.status !== 200) failures.push(`booking-route-status:${path}:${result.status}`);
      if (!result.robots?.toLowerCase().split(",").map((value) => value.trim()).includes("noindex")) {
        failures.push(`booking-route-indexable:${path}`);
      }
    }
  }

  const redirects = Array.isArray(evidence.redirects) ? evidence.redirects : [];
  failures.push(
    ...collectUnexpectedKeys(
      redirects,
      "source",
      new Set(wixPublicationPolicy.redirectSources),
      "unexpected-redirect-evidence"
    )
  );
  for (const source of collectDuplicateKeys(redirects, "source")) {
    failures.push(`duplicate-redirect-evidence:${source}`);
  }
  for (const source of wixPublicationPolicy.redirectSources) {
    const result = redirects.find((entry) => entry.source === source);
    if (!result) {
      failures.push(`missing-redirect-evidence:${source}`);
    } else if (normalizeUrl(result.finalUrl) !== `${wixPublicationPolicy.baseUrl}/`) {
      failures.push(`redirect-target:${source}`);
    }
  }

  const crawlerFiles = Array.isArray(evidence.crawlerFiles) ? evidence.crawlerFiles : [];
  failures.push(
    ...collectUnexpectedKeys(
      crawlerFiles,
      "path",
      new Set(wixPublicationPolicy.crawlerFiles),
      "unexpected-crawler-evidence"
    )
  );
  for (const path of collectDuplicateKeys(crawlerFiles, "path")) {
    failures.push(`duplicate-crawler-evidence:${path}`);
  }
  for (const path of wixPublicationPolicy.crawlerFiles) {
    const result = crawlerFiles.find((entry) => entry.path === path);
    if (!result) {
      failures.push(`missing-crawler-evidence:${path}`);
      continue;
    }
    if (result.status !== 200) failures.push(`crawler-status:${path}:${result.status}`);
    if (!result.content?.includes(wixPublicationPolicy.baseUrl)) {
      failures.push(`crawler-preferred-domain:${path}`);
    }
    for (const marker of wixPublicationPolicy.forbiddenCrawlerMarkers) {
      if (result.content?.toLowerCase().includes(marker.toLowerCase())) {
        failures.push(`crawler-forbidden-marker:${path}:${marker}`);
      }
    }
  }

  const crawlerPaths = new Set(wixPublicationPolicy.crawlerFiles);
  const scanPaths = new Set(wixPublicationPolicy.scanRoutes);
  for (const result of crawlerFiles) {
    for (const location of extractCrawlerLocations(result.content)) {
      const path = locationPath(location);
      if (!path) {
        failures.push(`crawler-external-location:${result.path ?? "missing"}`);
        continue;
      }
      if (path.endsWith(".xml")) {
        if (!crawlerPaths.has(path)) failures.push(`uncollected-sitemap:${path}`);
      } else if (!scanPaths.has(path)) {
        failures.push(`unscanned-indexed-route:${path}`);
      }
    }
  }

  return {
    service: "scrimed-wix-publication-verification",
    policyVersion: wixPublicationPolicy.version,
    status: failures.length === 0 ? "pass" : "blocked",
    passed: failures.length === 0,
    failures: [...new Set(failures)],
    pageResults,
    evidenceSummary: {
      captureMode: capture?.mode ?? "missing",
      capturedAt: capture?.capturedAt ?? null,
      pages: pages.length,
      retiredRoutes: retiredRoutes.length,
      bookingRoutes: bookingRoutes.length,
      redirects: redirects.length,
      crawlerFiles: crawlerFiles.length
    },
    rawContentStored: false,
    visitorDataCollected: false,
    clinicalAuthorityGranted: false,
    boundary:
      "This gate verifies published public metadata and claims only. It does not approve PHI collection, clinical use, certification, customer activation, or application deployment."
  };
}
