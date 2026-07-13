#!/usr/bin/env node

const args = new Set(process.argv.slice(2));
const allowedArgs = new Set(["--strict", "--self-test", "--json"]);
const unknownArgs = [...args].filter((arg) => !allowedArgs.has(arg));

if (unknownArgs.length > 0) {
  throw new Error(`Unsupported public-claims integrity option: ${unknownArgs.join(", ")}`);
}

const defaultUrl = "https://www.scrimedsolutions.com/";

const blockedClaimRules = [
  {
    id: "unsubstantiated-named-testimonial",
    markers: ["dr. emily carter"],
    reason: "Named customer testimony requires written authorization, substantiation, and applicable disclosures."
  },
  {
    id: "unsubstantiated-testimonial-outcome",
    markers: ["revolutionized our practice"],
    reason: "A customer outcome claim requires evidence, typicality context, and approval."
  },
  {
    id: "unverified-market-recognition",
    markers: ["globally recognized company", "global leader"],
    reason: "Recognition and market-leadership claims require retained independent evidence."
  },
  {
    id: "unverified-novelty-superlative",
    markers: ["world's first"],
    reason: "Novelty superlatives require a dated legal and competitive substantiation record."
  },
  {
    id: "unverified-physical-location",
    markers: ["500 innovation way"],
    reason: "A published business location requires an owner-verified address record."
  }
];

const requiredDisclosureRules = [
  {
    id: "no-patient-information-disclosure",
    markers: ["do not submit patient information", "do not submit protected health information"]
  },
  {
    id: "human-governed-scope-disclosure",
    markers: ["human review", "clinician governed", "decision support"]
  }
];

function canonicalize(value) {
  return value
    .toLowerCase()
    .replaceAll("\\u2019", "'")
    .replaceAll("\\u0027", "'")
    .replaceAll("&rsquo;", "'")
    .replaceAll("&#8217;", "'")
    .replaceAll("&#x2019;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&#x27;", "'")
    .replace(/\s+/g, " ");
}

export function evaluatePublicClaimsIntegrity(content) {
  const corpus = canonicalize(content);
  const blockedClaims = blockedClaimRules
    .filter((rule) => rule.markers.some((marker) => corpus.includes(marker)))
    .map(({ id, reason }) => ({ id, reason }));
  const missingDisclosures = requiredDisclosureRules
    .filter((rule) => !rule.markers.some((marker) => corpus.includes(marker)))
    .map((rule) => rule.id);
  const publicClaimsReleaseAllowed = blockedClaims.length === 0 && missingDisclosures.length === 0;

  return {
    service: "scrimed-public-claims-integrity-smoke",
    status: publicClaimsReleaseAllowed ? "public-claims-integrity-pass" : "public-claims-integrity-blocked",
    publicClaimsReleaseAllowed,
    blockedClaims,
    missingDisclosures,
    rawPageStored: false,
    visitorDataCollected: false,
    externalMutationPerformed: false,
    boundary: "This check evaluates published public copy only. It does not approve claims, mutate Wix, authorize PHI collection, certify compliance, or approve customer go-live."
  };
}

function runSelfTest() {
  const blocked = evaluatePublicClaimsIntegrity(`
    Hear from Our Clients. Dr. Emily Carter says SCRIMED revolutionized our practice.
    SCRIMED is the world's first global leader. Visit 500 Innovation Way.
  `);
  const safe = evaluatePublicClaimsIntegrity(`
    Proof Before Promises. Inspect no-PHI synthetic demonstration evidence.
    Do not submit patient information. Clinician governed decision support with human review.
  `);

  if (
    blocked.publicClaimsReleaseAllowed
    || blocked.blockedClaims.length !== 5
    || blocked.missingDisclosures.length !== 2
    || !safe.publicClaimsReleaseAllowed
    || safe.blockedClaims.length !== 0
    || safe.missingDisclosures.length !== 0
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
let report;

try {
  const content = await fetchPublishedPage(targetUrl);
  report = { ...evaluatePublicClaimsIntegrity(content), targetUrl, networkAvailable: true };
} catch (error) {
  report = {
    service: "scrimed-public-claims-integrity-smoke",
    status: "public-claims-evidence-unavailable",
    publicClaimsReleaseAllowed: false,
    blockedClaims: [],
    missingDisclosures: requiredDisclosureRules.map((rule) => rule.id),
    targetUrl,
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
  console.log(`target=${report.targetUrl} network_available=${report.networkAvailable}`);
  console.log(`blocked_claim_ids=${report.blockedClaims.map((claim) => claim.id).join(",") || "none"}`);
  console.log(`missing_disclosure_ids=${report.missingDisclosures.join(",") || "none"}`);
  console.log(report.boundary);
  console.log(`public_claims_release_allowed=${report.publicClaimsReleaseAllowed}`);
}

if (args.has("--strict") && !report.publicClaimsReleaseAllowed) {
  process.exitCode = 1;
}
