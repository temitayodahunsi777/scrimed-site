#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/boundaryReleaseEvidenceIntake.ts",
  "app/lib/protectedExternalApprovalEvidence.ts",
  "app/lib/protectedPilotStore.ts",
  "app/lib/boundaryReleaseApprovalMatrix.ts",
  "app/api/pilot-workspaces/[workspaceSlug]/boundary-release-evidence-intake/route.ts",
  "app/api/pilot-workspaces/[workspaceSlug]/boundary-release-evidence-intake/packet/route.ts",
  "scripts/boundary-release-evidence-intake-authenticated-smoke.mjs",
  "docs/boundary-release-approval-matrix.md",
  "docs/protected-pilot-workspaces.md",
  "scripts/public-production-smoke.mjs",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "app/lib/navigationAudit.ts",
  "scripts/clinical-data-fabric-contract-check.mjs",
  "scripts/clinical-data-governance-contract-check.mjs",
  "scripts/clinical-context-gateway-contract-check.mjs",
  "scripts/scrimed-os-upgrade-batch-contract-check.mjs",
  "scripts/boundary-release-approval-matrix-contract-check.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required boundary-release evidence intake text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/boundaryReleaseEvidenceIntake.ts"];
const route = files["app/api/pilot-workspaces/[workspaceSlug]/boundary-release-evidence-intake/route.ts"];
const packetRoute =
  files["app/api/pilot-workspaces/[workspaceSlug]/boundary-release-evidence-intake/packet/route.ts"];
const authenticatedSmoke = files["scripts/boundary-release-evidence-intake-authenticated-smoke.mjs"];
const docs = files["docs/boundary-release-approval-matrix.md"];
const protectedDocs = files["docs/protected-pilot-workspaces.md"];
const smoke = files["scripts/public-production-smoke.mjs"];

for (const expected of [
  "protected-boundary-release-evidence-intake-aal2-metadata-only",
  "boundary-release-evidence-intake-no-phi",
  "external-artifact-reference-only-no-raw-evidence-storage",
  "not-authorized-boundary-release",
  "buildBoundaryReleaseEvidenceIntakeQueue",
  "validateBoundaryReleaseEvidenceIntakeInput",
  "getBoundaryReleaseEvidenceIntakeSummary",
  "buildBoundaryReleaseEvidenceIntakePacket",
  "boundaryReleaseEvidenceIntakePacketProofStackStatus",
  "Protected Boundary Release Evidence Intake Packet",
  "BoundaryEvidence",
  "rawEvidenceAccepted: false",
  "boundaryReleaseEvidenceIntakeBoundary",
  "boundaryReleaseEvidenceIntakeReleaseAuthority",
  "clinicalAuthorityRequested",
  "rawEvidenceStoredInScrimed",
  "forbiddenPayloadKeys",
  "domainForWorkItem",
  "ProtectedExternalApprovalEvidenceInput"
]) {
  requireIncludes("app/lib/boundaryReleaseEvidenceIntake.ts", source, expected);
}

for (const path of ["app/lib/boundaryReleaseEvidenceIntake.ts", "app/lib/protectedExternalApprovalEvidence.ts"]) {
  requireIncludes(path, files[path], "/(^|[^A-Za-z0-9])sk-");
  requireIncludes(path, files[path], "/(^|[^A-Za-z0-9])sbp_");
}

for (const expected of [
  "recordProtectedBoundaryReleaseEvidenceIntakePacketDownload",
  "protected-boundary-release-evidence-intake",
  "rawEvidenceStoredInScrimed: false",
  "not-authorized-boundary-release"
]) {
  requireIncludes("app/lib/protectedPilotStore.ts", files["app/lib/protectedPilotStore.ts"], expected);
}

const boundedSecretKeyPattern = /(^|[^A-Za-z0-9])sk-[A-Za-z0-9_-]{12,}/i;
const boundedSupabaseSecretPattern = /(^|[^A-Za-z0-9])sbp_[A-Za-z0-9_-]{12,}/i;

if (boundedSecretKeyPattern.test("risk-analysis-report")) {
  throw new Error("boundary release evidence intake secret scanner must not flag risk-analysis-report.");
}

if (!boundedSecretKeyPattern.test(" sk-testsecretvalue123456")) {
  throw new Error("boundary release evidence intake secret scanner must still flag standalone sk-style keys.");
}

if (boundedSupabaseSecretPattern.test("asbp_reference_label")) {
  throw new Error("boundary release evidence intake secret scanner must not flag embedded sbp_ substrings.");
}

if (!boundedSupabaseSecretPattern.test(" sbp_testsecretvalue123456")) {
  throw new Error("boundary release evidence intake secret scanner must still flag standalone sbp_ secrets.");
}

for (const expected of [
  "getAuthenticatedGovernanceContext",
  "getAccessiblePilotWorkspace",
  "listProtectedExternalApprovalEvidenceReferences",
  "recordProtectedExternalApprovalEvidenceReference",
  "validateBoundaryReleaseEvidenceIntakeInput",
  "protected-boundary-release-evidence-intake-read",
  "protected-boundary-release-evidence-intake-record",
  "X-SCRIMED-Boundary-Release-Evidence-Intake",
  "X-SCRIMED-Storage-Authority",
  "no-raw-evidence-storage",
  "boundaryReleaseEvidenceIntakeReleaseAuthority",
  "not-authorized-production-phi",
  "not-authorized-live-care",
  "not-production-connector-approved",
  "not-certified-readiness-only",
  "unsupported-content-type",
  "payload-too-large",
  "validation-failed",
  "X-SCRIMED-Boundary-Release-Evidence-Persisted",
  "[redacted-metadata-only-review-note]"
]) {
  requireIncludes(
    "app/api/pilot-workspaces/[workspaceSlug]/boundary-release-evidence-intake/route.ts",
    route,
    expected
  );
}

for (const expected of [
  "getAuthenticatedGovernanceContext",
  "getAccessiblePilotWorkspace",
  "listProtectedExternalApprovalEvidenceReferences",
  "recordProtectedBoundaryReleaseEvidenceIntakePacketDownload",
  "buildBoundaryReleaseEvidenceIntakePacket",
  "protected-boundary-release-evidence-intake-packet-download",
  "Content-Disposition",
  "text/markdown; charset=utf-8",
  "X-SCRIMED-Proof-Stack",
  "not-authorized-production-phi",
  "not-authorized-live-care",
  "not-production-connector-approved",
  "not-certified-readiness-only",
  "protected-boundary-release-evidence-intake-packet-audit-failed"
]) {
  requireIncludes(
    "app/api/pilot-workspaces/[workspaceSlug]/boundary-release-evidence-intake/packet/route.ts",
    packetRoute,
    expected
  );
}

for (const expected of [
  "analyzeAal2BearerToken",
  "formatAal2TokenReport",
  "redactSensitive",
  "loadLocalEnv",
  "requireHeader",
  "SCRIMED_BEARER_TOKEN",
  "SCRIMED_REQUIRE_AUTHENTICATED_SMOKE",
  "--strict",
  "/api/boundary-release-approvals",
  "const packetPath = `${protectedPath}/packet`",
  "boundary-release-evidence-intake-no-phi",
  "rawEvidenceStoredInScrimed: false",
  "boundaryReleaseRequested: false",
  "clinicalAuthorityRequested: false",
  "not-authorized-boundary-release",
  "x-scrimed-boundary-release-evidence-persisted",
  "x-scrimed-proof-stack",
  "aal2-audited-boundary-release-evidence-intake-packets-no-phi",
  "skip authenticated boundary-release evidence intake happy path",
  "pass unauthenticated boundary-release evidence intake read fail-closed",
  "pass unauthenticated boundary-release evidence intake packet fail-closed",
  "pass authenticated boundary-release evidence intake metadata reference",
  "pass authenticated boundary-release evidence intake packet",
  "This packet is metadata-only. It is not a release approval"
]) {
  requireIncludes("scripts/boundary-release-evidence-intake-authenticated-smoke.mjs", authenticatedSmoke, expected);
}

for (const expected of [
  "Protected Boundary Release Evidence Intake",
  "metadata-only intake surface",
  "/api/pilot-workspaces/{workspaceSlug}/boundary-release-evidence-intake",
  "/api/pilot-workspaces/{workspaceSlug}/boundary-release-evidence-intake/packet",
  "does not store raw evidence",
  "does not relieve preserved boundaries"
]) {
  requireIncludes("docs/boundary-release-approval-matrix.md", docs, expected);
}

for (const expected of [
  "Boundary Release Evidence Intake",
  "GET /api/pilot-workspaces/{workspaceSlug}/boundary-release-evidence-intake",
  "POST /api/pilot-workspaces/{workspaceSlug}/boundary-release-evidence-intake",
  "GET /api/pilot-workspaces/{workspaceSlug}/boundary-release-evidence-intake/packet",
  "raw evidence",
  "AAL2"
]) {
  requireIncludes("docs/protected-pilot-workspaces.md", protectedDocs, expected);
}

for (const expected of [
  "Protected Boundary Release Evidence Intake protected API",
  "Protected Boundary Release Evidence Intake write protected API",
  "Protected Boundary Release Evidence Intake packet protected API",
  "/boundary-release-evidence-intake",
  "/boundary-release-evidence-intake/packet",
  "boundary-release-evidence-intake-no-phi"
]) {
  requireIncludes("scripts/public-production-smoke.mjs", smoke, expected);
}

for (const expected of [
  "\"smoke:boundary-release-evidence-intake\": \"node scripts/boundary-release-evidence-intake-contract-check.mjs\"",
  "\"smoke:boundary-release-evidence-intake:authenticated\": \"node scripts/boundary-release-evidence-intake-authenticated-smoke.mjs\"",
  "\"smoke:boundary-release-evidence-intake:strict\": \"node scripts/boundary-release-evidence-intake-authenticated-smoke.mjs --strict\""
]) {
  requireIncludes("package.json", files["package.json"], expected);
}

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "boundary release evidence intake contract"
);

for (const path of [
  "app/lib/navigationAudit.ts",
  "scripts/clinical-data-fabric-contract-check.mjs",
  "scripts/clinical-data-governance-contract-check.mjs",
  "scripts/clinical-context-gateway-contract-check.mjs",
  "scripts/scrimed-os-upgrade-batch-contract-check.mjs",
  "scripts/boundary-release-approval-matrix-contract-check.mjs"
]) {
  requireIncludes(path, files[path], "expectedApiRoutePatternCount = 434");
}

console.log("pass boundary release evidence intake contract check");
