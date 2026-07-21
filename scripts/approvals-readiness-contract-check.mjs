#!/usr/bin/env node

import { readFileSync } from "node:fs";

const requiredFiles = [
  "app/lib/intendedUseReview.ts",
  "app/lib/approvalsReadiness.ts",
  "app/lib/scrimed-control-plane/approvalAchievement.ts",
  "app/approvals-readiness/IntendedUseReviewWorkbench.tsx",
  "app/approvals-readiness/page.tsx",
  "app/api/approvals-readiness/route.ts",
  "app/api/approvals-readiness/brief/route.ts",
  "docs/SCRIMED_INTENDED_USE_MEMO.md",
  "docs/approvals-readiness.md",
  "docs/intended-use-review.md",
  "scripts/intended-use-review-policy-test.mjs",
  "scripts/public-production-smoke.mjs",
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "package.json"
];

const files = Object.fromEntries(requiredFiles.map((path) => [path, readFileSync(path, "utf8")]));

function requireIncludes(path, expected) {
  if (!files[path].includes(expected)) {
    throw new Error(`${path} missing required contract text: ${expected}`);
  }
}

for (const expected of [
  "evaluateIntendedUseReview",
  "blocked-prohibited-scope",
  "qualified-review-packet-ready",
  "approved: false",
  "externalUseAuthorized: false",
  "phiAuthority: false",
  "clinicalAuthority: false",
  "productionAuthority: false",
  "production-live",
  "restricted-clinical",
  "diagnosis",
  "treatment-selection",
  "prescribing",
  "payer-submission",
  "ehr-writeback",
  "certification-claim",
  "qualified-humans-external-system-of-record-only"
]) {
  requireIncludes("app/lib/intendedUseReview.ts", expected);
}

for (const expected of [
  'id="intended-use-review-workbench"',
  "Nothing entered here is sent, persisted, cached, signed, or approved",
  "No self-approval or authority transfer",
  "not authorized"
]) {
  requireIncludes("app/approvals-readiness/IntendedUseReviewWorkbench.tsx", expected);
}

requireIncludes("app/approvals-readiness/page.tsx", "<IntendedUseReviewWorkbench />");
requireIncludes("app/lib/approvalsReadiness.ts", "getIntendedUseReviewProgram");
requireIncludes("app/lib/approvalsReadiness.ts", "## Intended Use Review Packet");
requireIncludes("app/lib/scrimed-control-plane/approvalAchievement.ts", "intended-use-review-packet");
requireIncludes("app/lib/scrimed-control-plane/approvalAchievement.ts", "/approvals-readiness#intended-use-review-workbench");
requireIncludes("app/api/approvals-readiness/route.ts", '"X-SCRIMED-Intended-Use-Authority": "qualified-review-required"');
requireIncludes("app/api/approvals-readiness/route.ts", '"Cache-Control": "no-store"');
requireIncludes("app/api/approvals-readiness/brief/route.ts", '"Cache-Control": "no-store"');
requireIncludes("docs/SCRIMED_INTENDED_USE_MEMO.md", "This draft is not an approval");
requireIncludes("docs/intended-use-review.md", "No system or agent may approve the memo");
requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", "scripts/intended-use-review-policy-test.mjs");
requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", "scripts/approvals-readiness-contract-check.mjs");
requireIncludes("scripts/public-production-smoke.mjs", "scrimed-intended-use-review");
requireIncludes("package.json", '"test:intended-use-review"');
requireIncludes("package.json", '"smoke:approvals-readiness"');

const claimSurfaceFiles = requiredFiles.filter((path) =>
  path.startsWith("app/") || path.startsWith("docs/")
);
const combined = claimSurfaceFiles.map((path) => files[path]).join("\n").toLowerCase();
for (const forbidden of [
  "scrimed is hipaa certified",
  "scrimed is fda cleared",
  "autonomous diagnosis enabled",
  "ehr writeback enabled",
  "payer submission enabled",
  "customer go-live approved",
  "intended use approved by scrimed ai"
]) {
  if (combined.includes(forbidden)) {
    throw new Error(`Approvals Readiness contains forbidden claim: ${forbidden}`);
  }
}

console.log("pass approvals readiness contract");
