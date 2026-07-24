#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const files = {
  route: await readFile(
    "app/api/pilot-workspaces/[workspaceSlug]/qa-evidence/p32-candidate-review/route.ts",
    "utf8"
  ),
  service: await readFile("app/lib/scrimedP32CandidateReview.ts", "utf8"),
  store: await readFile("app/lib/protectedPilotStore.ts", "utf8"),
  panel: await readFile("app/pilot-workspace/P32CandidateReviewPanel.tsx", "utf8"),
  access: await readFile("app/pilot-workspace/ProtectedPilotAccess.tsx", "utf8"),
  migration: await readFile(
    "supabase/migrations/20260722120000_p32_candidate_review_control_plane.sql",
    "utf8"
  ),
  env: await readFile(".env.example", "utf8"),
  docs: await readFile("docs/scrimed-p32-candidate-review.md", "utf8")
};

function requireIncludes(label, value, expected) {
  if (!value.includes(expected)) throw new Error(`${label} is missing ${expected}.`);
}

for (const expected of [
  "getAuthenticatedGovernanceContext(request)",
  "getAccessiblePilotWorkspace",
  "createP32CandidateReviewAssignmentReceipt",
  "recordP32CandidateReviewDecisionReceipt",
  "idempotency-key",
  "action !== \"assign\" && action !== \"decide\"",
  "releaseAuthorityGranted",
  "runtime = \"nodejs\"",
  "rateLimit"
]) {
  requireIncludes("candidate-review route", files.route, expected);
}

for (const expected of [
  "SCRIMED_P32_CANDIDATE_REVIEW_ENABLED",
  "createP32CandidateReviewerIdentityHash",
  "createP32CandidateTenantScopeHash",
  "p32-candidate-review-separation-of-duties-required",
  "gateId: \"named-reviewer-approval\"",
  "reviewerRole: \"principal-engineer\"",
  "identityAssurance: \"aal2-protected-workspace\"",
  "releaseAuthorityGranted: false",
  "SCRIMED_P32_EVIDENCE_TRUSTED_PUBLIC_KEYS_JSON",
  "allowedApprovalGateIds",
  "p32-candidate-review-trust-scope-invalid",
  "createPrivateKey",
  "asymmetricKeyType !== \"ed25519\""
]) {
  requireIncludes("candidate-review service", files.service, expected);
}

for (const expected of [
  "private.p32_candidate_review_assignments",
  "private.p32_candidate_review_decisions",
  "p32_candidate_review_assignments_workspace_tenant_fk",
  "p32_candidate_review_decisions_workspace_tenant_fk",
  "p32_candidate_review_decisions_assignment_scope_fk",
  "references public.pilot_workspaces(id, tenant_id)",
  "array['tenant-admin', 'pilot-lead']",
  "array['reviewer']",
  "membership.status = 'active'",
  "p32-candidate-review-separation-of-duties-required",
  "p32-candidate-review-idempotency-replay",
  "before update or delete",
  "previous_audit_hash",
  "release_authority_granted = false",
  "revoke all on table",
  "grant execute on function public.create_p32_candidate_review_assignment",
  "grant execute on function public.record_p32_candidate_review_decision"
]) {
  requireIncludes("candidate-review migration", files.migration, expected);
}

for (const expected of [
  "create_p32_candidate_review_assignment",
  "record_p32_candidate_review_decision",
  "P32CandidateReviewAssignmentReceiptInput",
  "P32CandidateReviewDecisionReceiptInput"
]) {
  requireIncludes("protected pilot store", files.store, expected);
}

for (const expected of [
  "P32CandidateReviewPanel",
  "Approve Source Review",
  "Reject Candidate",
  "Copy Identity Hash",
  "Download Review Evidence",
  "crypto.randomUUID()"
]) {
  requireIncludes("candidate-review browser workflow", files.panel + files.access, expected);
}

for (const expected of [
  "SCRIMED_P32_CANDIDATE_REVIEW_ENABLED=false",
  "SCRIMED_P32_CANDIDATE_REVIEW_PRIVATE_KEY_PEM=",
  "SCRIMED_P32_CANDIDATE_REVIEW_SOURCE_COMMIT=",
  "SCRIMED_P32_CANDIDATE_REVIEW_PACKET_FINGERPRINT="
]) {
  requireIncludes("environment template", files.env, expected);
}

for (const expected of [
  "bootstrap release",
  "does not authorize deployment",
  "AAL2",
  "append-only",
  "allowedApprovalGateIds",
  "npm run test:scrimed-p32-candidate-review"
]) {
  requireIncludes("candidate-review documentation", files.docs, expected);
}

const combinedRuntime = files.route + files.service + files.panel;
if (/console\.(?:log|warn|error)\([^\n]*(?:privateKey|signature|bearer|accessToken)/i.test(combinedRuntime)) {
  throw new Error("Candidate-review runtime must not log signing or bearer material.");
}
if (/NEXT_PUBLIC_.*(?:PRIVATE|SECRET|KEY_PEM)/.test(files.env + files.service)) {
  throw new Error("Candidate-review signing material must remain server-only.");
}

console.log("pass SCRIMED p.32 protected candidate-review contract");
