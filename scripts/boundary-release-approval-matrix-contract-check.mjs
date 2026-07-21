#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "README.md",
  "app/lib/boundaryReleaseApprovalMatrix.ts",
  "app/api/boundary-release-approvals/route.ts",
  "app/api/boundary-release-approvals/brief/route.ts",
  "app/boundary-release-approvals/page.tsx",
  "app/boundary-resolution/page.tsx",
  "app/lib/siteNavigation.ts",
  "docs/boundary-release-approval-matrix.md",
  "docs/architecture.md",
  "docs/scrimed-systems-map.md",
  "package.json",
  "scripts/public-production-smoke.mjs",
  "scripts/boundary-release-approval-matrix-contract-check.mjs",
  "scripts/boundary-release-evidence-intake-contract-check.mjs",
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "app/lib/boundaryReleaseEvidenceIntake.ts",
  "app/lib/navigationAudit.ts",
  "scripts/clinical-data-fabric-contract-check.mjs",
  "scripts/clinical-data-governance-contract-check.mjs",
  "scripts/clinical-context-gateway-contract-check.mjs",
  "scripts/scrimed-os-upgrade-batch-contract-check.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required boundary-release approval matrix text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/boundaryReleaseApprovalMatrix.ts"];
const api = files["app/api/boundary-release-approvals/route.ts"];
const briefApi = files["app/api/boundary-release-approvals/brief/route.ts"];
const page = files["app/boundary-release-approvals/page.tsx"];
const nav = files["app/lib/siteNavigation.ts"];
const docs = files["docs/boundary-release-approval-matrix.md"];
const smoke = files["scripts/public-production-smoke.mjs"];

for (const expected of [
  "boundary-release-approval-matrix-active-fail-closed",
  "boundaryReleaseApprovalPaths",
  "evaluateBoundaryReleaseRequest",
  "getBoundaryReleaseApprovalMatrixSummary",
  "buildBoundaryReleaseApprovalMatrixBrief",
  "live-phi",
  "clinical-decision-support",
  "autonomous-clinical-action",
  "ehr-writeback",
  "payer-submission",
  "clinical-research-outcomes-learning",
  "security-certification-claims",
  "global-operation",
  "customer-go-live",
  "releaseDecision: \"blocked-fail-closed\"",
  "canRelieveBoundary: false",
  "matrixStepDocumented: true",
  "releaseEvidenceSatisfied",
  "pending_external",
  "pending_customer",
  "unknownBoundaryFailsClosed",
  "noAutomaticRelease",
  "everyPathHasHash",
  "buildBoundaryReleaseEvidenceWorkQueue",
  "evidenceWorkQueueSummary",
  "metadata-only-evidence-work-queue-active",
  "noWorkItemAcceptsRawEvidence",
  "everyPendingStepHasEvidenceWorkItem",
  "everyPendingSignoffHasEvidenceWorkItem",
  "workQueueCannotReleaseBoundaries",
  "blocked-sensitive-storage",
  "acceptsRawEvidence: false",
  "The matrix can complete the approval path documentation, but it cannot relieve a boundary"
]) {
  requireIncludes("app/lib/boundaryReleaseApprovalMatrix.ts", source, expected);
}

for (const expected of [
  "X-SCRIMED-Boundary-Release-Approval-Matrix",
  "active-fail-closed",
  "X-SCRIMED-Release-Authority",
  "not-authorized-boundary-release",
  "X-SCRIMED-PHI-Authority",
  "not-authorized-production-phi",
  "X-SCRIMED-Clinical-Care-Authority",
  "not-authorized-live-care",
  "X-SCRIMED-Payer-Submission-Authority",
  "not-authorized",
  "X-SCRIMED-EHR-Writeback-Authority",
  "not-production-connector-approved",
  "not-certified-readiness-only",
  "X-SCRIMED-Customer-Go-Live-Authority"
]) {
  requireIncludes("app/api/boundary-release-approvals/route.ts", api, expected);
  requireIncludes("app/api/boundary-release-approvals/brief/route.ts", briefApi, expected);
}

for (const expected of [
  "Boundary Release Approval Matrix",
  "Documented is not approved",
  "Release candidates",
  "Pending signoffs",
  "Approval path",
  "Step ledger",
  "Can relieve now",
  "Release hash",
  "Evidence work queue",
  "Accepts raw evidence",
  "Pending approvals become metadata-only work items"
]) {
  requireIncludes("app/boundary-release-approvals/page.tsx", page, expected);
}

for (const expected of [
  "/boundary-release-approvals",
  "Approval Matrix",
  "Boundary Release Approval Matrix",
  "Does not relieve preserved boundaries"
]) {
  requireIncludes("app/lib/siteNavigation.ts", nav, expected);
}

requireIncludes("app/boundary-resolution/page.tsx", files["app/boundary-resolution/page.tsx"], "Approval Matrix");

for (const expected of [
  "SCRIMED Boundary Release Approval Matrix",
  "Live PHI / ePHI processing",
  "Clinical decision support",
  "Autonomous diagnosis, treatment, prescribing, or imaging interpretation",
  "EHR writeback and production connector activation",
  "Payer submission, prior authorization, claims, and appeals",
  "Clinical research, outcomes learning, and human-subject data",
  "SOC 2, HIPAA, HITRUST, ISO, FDA, ONC, and certification claims",
  "Global operation, data residency, GDPR, EHDS, and EU AI Act readiness",
  "Customer go-live and production release",
  "The matrix does not complete the real-world approval step",
  "Every boundary remains `blocked-fail-closed`",
  "Evidence Work Queue",
  "Evidence work items are metadata-only",
  "They do not accept raw evidence"
]) {
  requireIncludes("docs/boundary-release-approval-matrix.md", docs, expected);
}

requireIncludes("README.md", files["README.md"], "Boundary release approval matrix");
requireIncludes("docs/architecture.md", files["docs/architecture.md"], "Boundary Release Approval Matrix");

for (const expected of ["/api/boundary-release-approvals", "/api/boundary-release-approvals/brief"]) {
  requireIncludes("README.md", files["README.md"], expected);
  requireIncludes("docs/architecture.md", files["docs/architecture.md"], expected);
}

for (const expected of [
  "Boundary Release Approval Matrix",
  "payer submission, EHR writeback, customer go-live",
  "/boundary-release-approvals"
]) {
  requireIncludes("docs/scrimed-systems-map.md", files["docs/scrimed-systems-map.md"], expected);
}

for (const expected of [
  "requireBoundaryReleaseApprovalMatrixBoundary",
  "checkBoundaryReleaseApprovalMatrix",
  "/api/boundary-release-approvals",
  "/api/boundary-release-approvals/brief",
  "boundary-release-approval-matrix-active-fail-closed",
  "not-authorized-boundary-release",
  "releasedBoundaryCount",
  "blockedBoundaryCount",
  "allApprovalStepsDocumented",
  "evidenceWorkQueueSummary",
  "noWorkItemAcceptsRawEvidence",
  "everyPendingStepHasEvidenceWorkItem",
  "Evidence Work Queue",
  "live-phi",
  "payer-submission",
  "customer-go-live"
]) {
  requireIncludes("scripts/public-production-smoke.mjs", smoke, expected);
}

for (const expected of [
  "\"smoke:boundary-release-approvals\": \"node scripts/boundary-release-approval-matrix-contract-check.mjs\""
]) {
  requireIncludes("package.json", files["package.json"], expected);
}

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "boundary release approval matrix contract"
);

for (const path of [
  "app/lib/navigationAudit.ts",
  "scripts/clinical-data-fabric-contract-check.mjs",
  "scripts/clinical-data-governance-contract-check.mjs",
  "scripts/clinical-context-gateway-contract-check.mjs",
  "scripts/scrimed-os-upgrade-batch-contract-check.mjs",
  "scripts/boundary-release-approval-matrix-contract-check.mjs"
]) {
  requireIncludes(path, files[path], "expectedApiRoutePatternCount = 443");
}

requireIncludes(
  "app/lib/boundaryReleaseEvidenceIntake.ts",
  files["app/lib/boundaryReleaseEvidenceIntake.ts"],
  "protected-boundary-release-evidence-intake-aal2-metadata-only"
);

requireIncludes(
  "scripts/boundary-release-evidence-intake-contract-check.mjs",
  files["scripts/boundary-release-evidence-intake-contract-check.mjs"],
  "pass boundary release evidence intake contract check"
);

console.log("pass boundary release approval matrix contract check");
