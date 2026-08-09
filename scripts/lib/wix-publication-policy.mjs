import { readFileSync } from "node:fs";

import { evaluatePublicClaimsIntegrity } from "./public-claims-policy.mjs";

export const wixPublicationPolicy = JSON.parse(
  readFileSync(new URL("../../config/wix-publication-policy.json", import.meta.url), "utf8")
);

const maximumHtmlStartTags = 2_048;
const maximumHtmlTagBytes = 32_768;
const maximumScriptBodyBytes = 4_000_000;
const maximumEvidenceAgeMs = 30 * 60 * 1000;

function isTagBoundary(value) {
  return !value || /[\s/>]/.test(value);
}

function findTagEnd(html, start) {
  let quote = "";
  const limit = Math.min(html.length, start + maximumHtmlTagBytes + 1);
  for (let index = start; index < limit; index += 1) {
    const character = html[index];
    if (quote) {
      if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
    } else if (character === ">") {
      return index;
    }
  }
  return -1;
}

function findClosingTag(html, normalized, tagName, from) {
  const marker = `</${tagName}`;
  let cursor = from;
  while (cursor < normalized.length) {
    const start = normalized.indexOf(marker, cursor);
    if (start < 0) return null;
    if (!isTagBoundary(normalized[start + marker.length])) {
      cursor = start + marker.length;
      continue;
    }
    const end = findTagEnd(html, start + marker.length);
    return end < 0 ? null : { start, end };
  }
  return null;
}

function scanHtmlElements(html, tagName, includeBody = false) {
  const normalized = html.toLowerCase();
  const marker = `<${tagName}`;
  const elements = [];
  const failures = [];
  let cursor = 0;

  while (cursor < normalized.length) {
    const start = normalized.indexOf(marker, cursor);
    if (start < 0) break;
    if (!isTagBoundary(normalized[start + marker.length])) {
      cursor = start + marker.length;
      continue;
    }
    if (elements.length >= maximumHtmlStartTags) {
      failures.push(`html-tag-budget-exceeded:${tagName}`);
      break;
    }
    const tagEnd = findTagEnd(html, start + marker.length);
    if (tagEnd < 0) {
      failures.push(`html-tag-malformed-or-oversized:${tagName}`);
      break;
    }

    const element = {
      start,
      openEnd: tagEnd,
      end: tagEnd,
      attributesSource: html.slice(start + marker.length, tagEnd),
      body: ""
    };
    if (includeBody) {
      const close = findClosingTag(html, normalized, tagName, tagEnd + 1);
      if (!close || close.start - tagEnd > maximumScriptBodyBytes) {
        failures.push(`html-${tagName}-malformed-or-oversized`);
        break;
      }
      element.body = html.slice(tagEnd + 1, close.start);
      element.end = close.end;
    }
    elements.push(element);
    cursor = element.end + 1;
  }

  return { elements, failures };
}

function inspectBoundedHtmlStructure(html) {
  const failures = [];
  for (const tagName of ["meta", "link", "title", "script"]) {
    failures.push(...scanHtmlElements(html, tagName, tagName === "title" || tagName === "script").failures);
  }

  return failures;
}

function decodeHtml(value = "") {
  return value.replace(
    /&(?:#([0-9]{1,7})|#x([0-9a-f]{1,6})|amp|quot|apos|lt|gt);/gi,
    (entity, decimal, hexadecimal) => {
      if (decimal || hexadecimal) {
        const codePoint = Number.parseInt(decimal ?? hexadecimal, hexadecimal ? 16 : 10);
        if (
          !Number.isInteger(codePoint) ||
          codePoint < 0 ||
          codePoint > 0x10ffff ||
          (codePoint >= 0xd800 && codePoint <= 0xdfff)
        ) {
          return entity;
        }
        return String.fromCodePoint(codePoint);
      }
      const named = entity.toLowerCase();
      if (named === "&amp;") return "&";
      if (named === "&quot;") return '"';
      if (named === "&apos;") return "'";
      if (named === "&lt;") return "<";
      if (named === "&gt;") return ">";
      return entity;
    }
  ).trim();
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
  return scanHtmlElements(html, tagName).elements.map((element) =>
    parseAttributes(element.attributesSource)
  );
}

function extractTitle(html) {
  const title = scanHtmlElements(html, "title", true).elements[0];
  return decodeHtml(title ? stripMarkup(title.body) : "");
}

function stripMarkup(html) {
  let output = "";
  let cursor = 0;
  while (cursor < html.length) {
    const start = html.indexOf("<", cursor);
    if (start < 0) {
      output += html.slice(cursor);
      break;
    }
    output += `${html.slice(cursor, start)} `;
    const end = findTagEnd(html, start + 1);
    if (end < 0) {
      output += html.slice(start);
      break;
    }
    cursor = end + 1;
  }
  return output;
}

function removeElementBodies(html, tagNames) {
  const ranges = tagNames.flatMap((tagName) =>
    scanHtmlElements(html, tagName, true).elements.map((element) => ({
      start: element.start,
      end: element.end
    }))
  ).sort((left, right) => left.start - right.start);
  let output = "";
  let cursor = 0;
  for (const range of ranges) {
    if (range.start < cursor) continue;
    output += `${html.slice(cursor, range.start)} `;
    cursor = range.end + 1;
  }
  return output + html.slice(cursor);
}

function normalizeWhitespace(value) {
  return value.split(/\s+/).filter(Boolean).join(" ");
}

function extractVisibleText(html) {
  return normalizeWhitespace(
    decodeHtml(stripMarkup(removeElementBodies(html, ["script", "style"])))
  );
}

function containsVisibleLabel(visibleText, label) {
  const haystack = normalizeWhitespace(visibleText).toLowerCase();
  const needle = normalizeWhitespace(label).toLowerCase();
  let cursor = 0;
  while (needle && cursor < haystack.length) {
    const index = haystack.indexOf(needle, cursor);
    if (index < 0) return false;
    const before = haystack[index - 1] ?? "";
    const after = haystack[index + needle.length] ?? "";
    const isWord = (character) => /[a-z0-9]/.test(character);
    if (!isWord(before) && !isWord(after)) return true;
    cursor = index + needle.length;
  }
  return false;
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
  for (const script of scanHtmlElements(html, "script", true).elements) {
    const attributes = parseAttributes(script.attributesSource);
    if (attributes.type?.toLowerCase() !== "application/ld+json") continue;

    try {
      objects.push(JSON.parse(script.body.trim()));
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
  if (extractTags(html, "a").some((attributes) => attributes.href?.toLowerCase().startsWith("tel:"))) {
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
