#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/investorDemoRunOfShow.ts",
  "app/lib/investorAudienceReadiness.ts",
  "app/globals.css",
  "app/investor-audience-readiness/InvestorDemoRunOfShow.tsx",
  "app/investor-audience-readiness/page.tsx",
  "app/pricing/page.tsx",
  "docs/investor-audience-readiness.md",
  "scripts/investor-demo-run-of-show-policy-test.mjs",
  "scripts/investor-demo-proof-route-smoke.mjs",
  "scripts/bounded-public-fetch-policy-test.mjs",
  "scripts/lib/bounded-public-fetch.mjs",
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "package.json"
];

const files = Object.fromEntries(
  await Promise.all(
    requiredFiles.map(async (path) => [path, await readFile(path, "utf8")])
  )
);

function requireIncludes(path, expected) {
  if (!files[path].includes(expected)) {
    throw new Error(`${path} missing investor demo run-of-show contract text: ${expected}`);
  }
}

for (const expected of [
  "InvestorDemoRunOfShow",
  "executive-preview",
  "technical-walkthrough",
  "diligence-walkthrough",
  "3-minute preview",
  "12-minute walkthrough",
  "30-minute diligence",
  "evidenceMap",
  "documentation-before-authorization",
  "governance-moat",
  "commercial-path",
  "syntheticOnly: true",
  "phiAllowed: false",
  "clinicalExecutionAllowed: false",
  "investmentSolicitationAuthorized: false",
  "externalSendAuthorized: false",
  "humanReviewRequired: true",
  "assessInvestorDemoRehearsal",
  "ready-for-internal-rehearsal",
  "externalArtifactDistributionAuthorized: false"
]) {
  requireIncludes("app/lib/investorDemoRunOfShow.ts", expected);
}

for (const expected of [
  "investor-demo-run-of-show",
  "investorDemoModes",
  "Synthetic only",
  "Human review required",
  "Controlled next decision",
  "Automated rehearsal gate",
  "Before an external meeting",
  'target="_blank"'
]) {
  requireIncludes(
    "app/investor-audience-readiness/InvestorDemoRunOfShow.tsx",
    expected
  );
}

requireIncludes(
  "app/investor-audience-readiness/page.tsx",
  "Open Demo Command Room"
);
requireIncludes(
  "app/investor-audience-readiness/page.tsx",
  "View Guided Outline"
);
requireIncludes(
  "app/lib/investorAudienceReadiness.ts",
  "investorDemoRunOfShow"
);
for (const expected of [
  ".investor-demo-timeline",
  "grid-template-columns: repeat(3, minmax(0, 1fr));",
  ".investor-demo-rehearsal",
  "@media (max-width: 980px)",
  "font-size: 32px;",
  "@media (max-width: 640px)",
  "font-size: 28px;"
]) {
  requireIncludes("app/globals.css", expected);
}
requireIncludes(
  "docs/investor-audience-readiness.md",
  "## Guided Investor Demonstration"
);
requireIncludes(
  "docs/investor-audience-readiness.md",
  "An automated rehearsal assessment verifies"
);
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "scripts/investor-demo-run-of-show-policy-test.mjs"
);
requireIncludes(
  "package.json",
  '"smoke:investor-demo-run-of-show": "node scripts/investor-demo-run-of-show-contract-check.mjs"'
);
requireIncludes(
  "package.json",
  '"smoke:investor-demo-proof-routes": "node scripts/investor-demo-proof-route-smoke.mjs"'
);
requireIncludes(
  "package.json",
  '"test:bounded-public-fetch-policy": "node scripts/bounded-public-fetch-policy-test.mjs"'
);
const pricingProofText =
  "Start with inspectable proof. Expand only when the value and governance case hold.";
requireIncludes("app/pricing/page.tsx", pricingProofText);
requireIncludes("scripts/investor-demo-proof-route-smoke.mjs", pricingProofText);
for (const expected of [
  "/documentation-before-authorization",
  "/demos/prior-authorization-support",
  "/atlas",
  "/trust-os",
  "/pilot-demo-commercial-readiness",
  "not-authorized-live-care",
  "not-authorized-production-phi",
  "not-production-connector-approved",
  "boundedPublicFetch",
  "readBoundedResponseText",
  "--self-test"
]) {
  requireIncludes("scripts/investor-demo-proof-route-smoke.mjs", expected);
}
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "scripts/investor-demo-proof-route-smoke.mjs"
);
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "scripts/bounded-public-fetch-policy-test.mjs"
);
for (const expected of [
  "normalizePublicSmokeBaseUrl",
  "Public smoke request timed out",
  "mutation requests must remain single-attempt",
  "Public smoke response contained more than",
  "must not contain credentials"
]) {
  requireIncludes("scripts/lib/bounded-public-fetch.mjs", expected);
}

for (const forbidden of [
  "guaranteed investment return",
  "customer deployment confirmed",
  "clinical validation complete",
  "payer submission enabled",
  "EHR writeback enabled",
  "PHI processing approved"
]) {
  for (const path of [
    "app/lib/investorDemoRunOfShow.ts",
    "app/investor-audience-readiness/InvestorDemoRunOfShow.tsx",
    "docs/investor-audience-readiness.md"
  ]) {
    if (files[path].toLowerCase().includes(forbidden.toLowerCase())) {
      throw new Error(`${path} contains forbidden investor demo claim: ${forbidden}`);
    }
  }
}

console.log("pass investor demo run-of-show contract check");
