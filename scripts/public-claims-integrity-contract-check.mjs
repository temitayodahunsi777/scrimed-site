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
  "unsubstantiated-named-testimonial",
  "unverified-market-recognition",
  "unverified-novelty-superlative",
  "no-patient-information-disclosure",
  "publicClaimsReleaseAllowed",
  "--self-test"
]);
requireText("docs/public-claims-integrity.md", [
  "Proof Before Promises",
  "Do not submit patient information",
  "Voice Intake Assistant` form accepted",
  "verified as disabled at revision 2",
  "npm run smoke:wix-public-claims",
  "No claim is approved automatically"
]);
requireText("app/lib/scrimed-control-plane/platformEvidence.ts", [
  "public-claims-integrity-smoke.mjs",
  "static Wix Editor content",
  "Voice Intake Assistant form was disabled",
  "external-action-required"
]);
requireText("package.json", [
  '"contract:public-claims-integrity"',
  '"smoke:wix-public-claims"',
  '"test:wix-public-claims-policy"'
]);

console.log("pass SCRIMED public-claims integrity contract check (4 files verified)");
