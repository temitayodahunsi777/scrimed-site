#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const paths = [
  "app/lib/pr25FrozenReviewBaseline.ts",
  "app/lib/exactHeadReviewBinding.ts",
  "app/lib/releaseStateMachine.ts",
  "app/lib/mergeReadiness.ts",
  "app/lib/postPr25PlatformAdvance.ts",
  "app/api/scrimed-work/review/route.ts",
  "app/scrimed-work/review/page.tsx",
  "app/globals.css",
  "docs/release/PR25_FROZEN_REVIEW_BASELINE.md",
  "docs/review/PR25_REVIEWER_BRIEF.md",
  "docs/release/PRODUCTION_AUTHORIZATION_PACKET.md",
  "scripts/lib/current-exact-head-review-candidate.mjs",
  "scripts/lib/exact-head-approval-consumption-ledger.mjs",
  "scripts/verify-merge-readiness.mjs",
  "package.json"
];
const files = Object.fromEntries(
  await Promise.all(paths.map(async (path) => [path, await readFile(path, "utf8")]))
);
const combined = Object.values(files).join("\n");

for (const required of [
  "c15a79c76d59a2f94bb7f999469da8bbc1618d8c",
  "REVIEW_REQUESTED",
  "APPROVE_EXACT_HEAD",
  "READY_FOR_MERGE_AUTHORIZATION",
  "NOT_READY_FOR_MERGE",
  "releaseAuthorityGranted: false",
  "productionAuthorityGranted: false"
]) {
  assert.ok(combined.includes(required), `missing review-control contract: ${required}`);
}

for (const forbidden of [
  "review approval automatically merges",
  "merge automatically deploys",
  "production authority granted by review"
]) {
  assert.equal(combined.toLowerCase().includes(forbidden), false);
}

assert.match(files["app/scrimed-work/review/page.tsx"], /read-only/i);
assert.match(files["app/scrimed-work/review/page.tsx"], /exact-head-identity/);
assert.match(files["app/globals.css"], /\.exact-head-identity code/);
assert.match(files["app/api/scrimed-work/review/route.ts"], /none-read-only-summary/);
assert.match(files["package.json"], /test:exact-head-review-binding/);
assert.match(files["package.json"], /evidence:post-pr25-platform:check/);
assert.match(
  files["scripts/verify-merge-readiness.mjs"],
  /evaluateExactHeadReviewBinding/
);
assert.match(
  files["scripts/verify-merge-readiness.mjs"],
  /SCRIMED_EXACT_HEAD_APPROVAL_FILE/
);
assert.match(
  files["scripts/verify-merge-readiness.mjs"],
  /verifyP32SupplementalEvidenceAttestation/
);
assert.match(
  files["scripts/verify-merge-readiness.mjs"],
  /SCRIMED_P32_EVIDENCE_TRUSTED_PUBLIC_KEYS_JSON/
);
assert.match(
  files["scripts/verify-merge-readiness.mjs"],
  /SCRIMED_EXACT_HEAD_CONSUMPTION_LEDGER_DIR/
);
assert.match(
  files["scripts/verify-merge-readiness.mjs"],
  /consumedApprovalIds:\s*consumptionState\.consumedApprovalIds/
);
assert.match(
  files["scripts/verify-merge-readiness.mjs"],
  /loadCurrentExactHeadReviewCandidate/
);
assert.match(files["scripts/verify-merge-readiness.mjs"], /--candidate-only/);
assert.doesNotMatch(
  files["scripts/verify-merge-readiness.mjs"],
  /getPr25ExactHeadReviewCandidate/
);
assert.match(
  files["scripts/lib/current-exact-head-review-candidate.mjs"],
  /manifest\.baseHeadSha === sourceState\.commitSha/
);
assert.match(
  files["scripts/lib/current-exact-head-review-candidate.mjs"],
  /reviewPacket\.candidateReviewPacketSha256/
);
assert.match(
  files["scripts/lib/current-exact-head-review-candidate.mjs"],
  /validation\.validationEvidenceHashSha256/
);
assert.match(
  files["scripts/lib/exact-head-approval-consumption-ledger.mjs"],
  /O_EXCL/
);
assert.match(
  files["scripts/lib/exact-head-approval-consumption-ledger.mjs"],
  /exact-head-review-replay-rejected/
);
assert.match(
  files["scripts/lib/exact-head-approval-consumption-ledger.mjs"],
  /assertProtectedAncestorChain/
);
assert.match(
  files["scripts/lib/exact-head-approval-consumption-ledger.mjs"],
  /assertPinnedLedgerDirectory/
);
assert.match(
  files["scripts/lib/exact-head-approval-consumption-ledger.mjs"],
  /directoryHandle\.sync\(\)/
);
assert.match(
  files["scripts/lib/exact-head-approval-consumption-ledger.mjs"],
  /legacyLedgerVersionV1/
);
assert.match(
  files["scripts/lib/exact-head-approval-consumption-ledger.mjs"],
  /stableIdentifierKeyVersion/
);
assert.doesNotMatch(
  files["app/lib/exactHeadReviewBinding.ts"],
  /trustedIdentityEvidenceVerified:\s*boolean/
);
assert.doesNotMatch(
  files["scripts/verify-merge-readiness.mjs"],
  /exactHeadApprovalMatches:\s*baseline\.review\.exactHeadApprovalRecorded/
);

console.log(
  "pass SCRIMED Work exact-head reviewer contract (historical frozen identity, checked-out-head merge binding, read-only UI/API, release separation, and operator boundaries)"
);
