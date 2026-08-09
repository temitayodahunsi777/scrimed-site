#!/usr/bin/env node

import { readFile } from "node:fs/promises";

import {
  blockedClaimRules,
  evaluatePublicClaimsIntegrity,
  requiredDisclosureRules
} from "./lib/public-claims-policy.mjs";

const args = new Set(process.argv.slice(2));
const allowedArgs = new Set(["--strict", "--self-test", "--json"]);
const unknownArgs = [...args].filter((arg) => !allowedArgs.has(arg));

if (unknownArgs.length > 0) {
  throw new Error(`Unsupported public-claims integrity option: ${unknownArgs.join(", ")}`);
}

const defaultUrl = "https://www.scrimedsolutions.com/";
function runSelfTest() {
  const blocked = evaluatePublicClaimsIntegrity(
    blockedClaimRules.map((rule) => rule.markers[0]).join(". ")
  );
  const safe = evaluatePublicClaimsIntegrity(`
    Validation and Evidence. Inspect no-PHI synthetic demonstration evidence.
    Do not submit protected health information. Clinician-supportive workflows require human review.
    SCRIMED is not FDA approved, is not HIPAA compliant, and does not provide autonomous diagnosis.
  `);
  const mixed = evaluatePublicClaimsIntegrity(`
    Do not submit protected health information. This is a synthetic demonstration requiring human review.
    SCRIMED is not FDA approved. A separate sentence falsely says FDA approved.
  `);

  if (
    blocked.publicClaimsReleaseAllowed
    || blocked.blockedClaims.length !== blockedClaimRules.length
    || blocked.missingDisclosures.length !== requiredDisclosureRules.length
    || !safe.publicClaimsReleaseAllowed
    || safe.blockedClaims.length !== 0
    || safe.missingDisclosures.length !== 0
    || mixed.publicClaimsReleaseAllowed
    || !mixed.blockedClaims.some((claim) => claim.id === "unsupported-fda-claim")
  ) {
    throw new Error("Public-claims integrity policy self-test failed.");
  }

  console.log("pass SCRIMED public-claims integrity policy self-test");
}

async function fetchPublishedPage(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "SCRIMED-Public-Claims-Integrity/1.0" }
    });
    if (!response.ok) {
      throw new Error(`Published page returned HTTP ${response.status}.`);
    }
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

if (args.has("--self-test")) {
  runSelfTest();
  process.exit(0);
}

const targetUrl = process.env.SCRIMED_MARKETING_SITE_URL ?? defaultUrl;
const publishedHtmlPath = process.env.SCRIMED_MARKETING_SITE_HTML_PATH?.trim();
let report;

try {
  const content = publishedHtmlPath
    ? await readFile(publishedHtmlPath, "utf8")
    : await fetchPublishedPage(targetUrl);
  report = {
    ...evaluatePublicClaimsIntegrity(content),
    targetUrl,
    evidenceSource: publishedHtmlPath
      ? "operator-supplied-cache-bypassed-published-html"
      : "direct-network-fetch",
    networkAvailable: publishedHtmlPath ? null : true,
    rawPageRetained: false
  };
} catch (error) {
  report = {
    service: "scrimed-public-claims-integrity-smoke",
    status: "public-claims-evidence-unavailable",
    publicClaimsReleaseAllowed: false,
    blockedClaims: [],
    missingDisclosures: requiredDisclosureRules.map((rule) => rule.id),
    targetUrl,
    evidenceSource: publishedHtmlPath ? "operator-supplied-published-html" : "direct-network-fetch",
    networkAvailable: false,
    errorCode: error instanceof Error && error.name === "AbortError" ? "request-timeout" : "request-unavailable",
    rawPageStored: false,
    visitorDataCollected: false,
    externalMutationPerformed: false,
    boundary: "Unavailable evidence fails closed in strict mode. This check does not approve claims, mutate Wix, authorize PHI collection, certify compliance, or approve customer go-live."
  };
}

if (args.has("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`${report.publicClaimsReleaseAllowed ? "pass" : args.has("--strict") ? "blocked" : "report"} SCRIMED public claims: ${report.status}`);
  console.log(
    `target=${report.targetUrl} evidence_source=${report.evidenceSource} network_available=${report.networkAvailable}`
  );
  console.log(`blocked_claim_ids=${report.blockedClaims.map((claim) => claim.id).join(",") || "none"}`);
  console.log(`missing_disclosure_ids=${report.missingDisclosures.join(",") || "none"}`);
  console.log(report.boundary);
  console.log(`public_claims_release_allowed=${report.publicClaimsReleaseAllowed}`);
}

if (args.has("--strict") && !report.publicClaimsReleaseAllowed) {
  process.exitCode = 1;
}
