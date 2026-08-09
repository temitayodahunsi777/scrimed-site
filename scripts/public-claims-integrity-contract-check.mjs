#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function requireText(relativePath, values) {
  const content = read(relativePath);
  for (const value of values) {
    if (!content.includes(value)) {
      throw new Error(`${relativePath} is missing required public-claims control: ${value}`);
    }
  }
}

requireText("scripts/public-claims-integrity-smoke.mjs", [
  "./lib/public-claims-policy.mjs",
  "evaluatePublicClaimsIntegrity",
  "publicClaimsReleaseAllowed",
  "--self-test"
]);
requireText("scripts/lib/public-claims-policy.mjs", [
  "config/public-claims-policy.json",
  "hasUnnegatedMarker",
  "evaluatePublicClaimsIntegrity",
  "missingDisclosures"
]);
requireText("config/public-claims-policy.json", [
  "unsubstantiated-named-testimonial",
  "unverified-physical-location",
  "spiritually governed healthtech platform",
  "unsupported-vitals-alert-claim",
  "actionable clinical trends",
  "patient-condition insights",
  "real-time, accurate patient data analysis",
  "unsupported-autonomous-care-claim",
  "no-phi-disclosure",
  "synthetic-status-disclosure",
  "human-review-disclosure"
]);
requireText("app/lib/publicClaimsPolicy.ts", [
  "evaluatePublicClaims",
  "getPublicClaimsPolicySummary",
  "publication permission",
  "qualified human approval"
]);
requireText("docs/public-claims-integrity.md", [
  "Validation and Evidence",
  "Building with clinicians, health systems, and innovators.",
  "Do not submit patient information",
  "Voice Intake Assistant` form accepted",
  "verified as disabled at revision 2",
  "npm run smoke:wix-public-claims",
  "No claim is approved automatically"
]);
requireText("app/lib/scrimed-control-plane/platformEvidence.ts", [
  "public-claims-integrity-smoke.mjs",
  "policy-v4 direct-origin audit",
  "zero claim failures",
  "network-restricted shell",
  "implemented-local"
]);
requireText("package.json", [
  '"contract:public-claims-integrity"',
  '"smoke:wix-public-claims"',
  '"test:wix-public-claims-policy"'
]);

console.log("pass SCRIMED public-claims integrity contract check (7 files verified)");
