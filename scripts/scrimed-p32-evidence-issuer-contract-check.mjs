#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const files = {
  route: await readFile(
    "app/api/pilot-workspaces/[workspaceSlug]/qa-evidence/p32-attestation/route.ts",
    "utf8"
  ),
  client: await readFile("scripts/scrimed-p32-evidence-issuer-client.mjs", "utf8"),
  issuer: await readFile("app/lib/scrimedP32EvidenceIssuer.ts", "utf8"),
  store: await readFile("app/lib/protectedPilotStore.ts", "utf8"),
  migration: await readFile(
    "supabase/migrations/20260721173000_p32_evidence_attestation_issuances.sql",
    "utf8"
  ),
  env: await readFile(".env.example", "utf8")
};

function requireIncludes(label, value, expected) {
  if (!value.includes(expected)) throw new Error(`${label} is missing ${expected}.`);
}

for (const expected of [
  "getAuthenticatedGovernanceContext(request)",
  "getAccessiblePilotWorkspace",
  "listQaManualRunEvidencePackets",
  "recordP32EvidenceAttestationIssuance",
  "evaluateScrimedWorkWriteRequestProvenance(request)",
  "p32-evidence-issuer-csrf-denied",
  "X-SCRIMED-CSRF-Protection",
  "idempotency-key",
  "releaseAuthorityGranted: false",
  "runtime = \"nodejs\"",
  "rateLimit"
]) {
  requireIncludes("protected issuer route", files.route, expected);
}

for (const expected of [
  '"X-SCRIMED-Request-Context": "operator-smoke-v1"',
  '"Idempotency-Key": randomUUID()'
]) {
  requireIncludes("protected issuer client", files.client, expected);
}

for (const expected of [
  "SCRIMED_P32_EVIDENCE_ISSUER_ENABLED",
  "createPrivateKey",
  "asymmetricKeyType !== \"ed25519\"",
  "assertExactCandidate",
  "selectCurrentQaEvidencePacket",
  "approvals: []",
  "protected-aal2-workspace",
  "signatureFingerprint",
  "p32-evidence-issuer-role-forbidden"
]) {
  requireIncludes("protected issuer service", files.issuer, expected);
}

for (const expected of [
  "private.p32_evidence_attestation_issuances",
  "foreign key (workspace_id, tenant_id)",
  "references public.pilot_workspaces(id, tenant_id)",
  "array['tenant-admin', 'pilot-lead']",
  "private.require_governance_workspace",
  "qa_manual_run_evidence_packets",
  "p32-evidence-attestation-idempotency-replay",
  "protected-aal2-workspace",
  "release_authority_granted = false",
  "before update or delete",
  "previous_audit_hash",
  "signature_fingerprint",
  "revoke all on table",
  "grant execute on function public.record_p32_evidence_attestation_issuance"
]) {
  requireIncludes("protected issuer migration", files.migration, expected);
}

for (const expected of [
  "record_p32_evidence_attestation_issuance",
  "P32EvidenceIssuerReceiptInput"
]) {
  requireIncludes("protected pilot store", files.store, expected);
}

for (const expected of [
  "SCRIMED_P32_EVIDENCE_ISSUER_ENABLED=false",
  "SCRIMED_P32_EVIDENCE_ISSUER_PRIVATE_KEY_PEM=",
  "SCRIMED_P32_EVIDENCE_ISSUER_SOURCE_COMMIT="
]) {
  requireIncludes("environment template", files.env, expected);
}

if (/console\.(?:log|warn|error)\([^\n]*(?:privateKey|signature|bearer)/i.test(files.issuer + files.route)) {
  throw new Error("Protected issuer code must not log signing or bearer material.");
}

console.log("pass SCRIMED p.32 protected evidence issuer contract");
