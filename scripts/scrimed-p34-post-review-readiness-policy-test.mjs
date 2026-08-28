import assert from "node:assert/strict";

import { createClinicalEvidenceHash } from "../app/lib/clinicalEvidenceControls.ts";
import {
  calculatePilotMarginScenario,
  evaluatePilotCostGovernor
} from "../app/lib/economics/pilotCostGovernor.ts";
import {
  createPilotManifest,
  syntheticPilotControlContract
} from "../app/lib/commercial/pilotManifest.ts";
import {
  buildPilotProposalFingerprint,
  evaluateBuyerReadiness,
  evaluatePilotExpansion,
  evaluatePilotSuccessCriteria,
  getPilotOperatingSystemSummary,
  transitionPilotWorkflow
} from "../app/lib/commercial/pilotOperatingSystem.ts";
import {
  getPilotTemplate,
  getPilotTemplateRegistrySummary
} from "../app/lib/commercial/pilotTemplateRegistry.ts";
import {
  evaluatePreviewAcceptance,
  getP34PreviewAcceptanceSummary
} from "../app/lib/release/previewAcceptance.ts";
import { p34ExactHeadBaseline } from "../app/lib/scrimed-p34/exactHeadBaseline.ts";
import { createRedactedAal2Evidence } from "./lib/aal2-redacted-evidence.mjs";

let passed = 0;
function check(name, run) {
  run();
  passed += 1;
  console.log(`pass ${name}`);
}

const template = getPilotTemplate("enterprise-ai-governance");
assert.ok(template);
const scope = "Evaluate one bounded synthetic enterprise governance workflow with objective evidence and retained human authority.";
const candidateReference = p34ExactHeadBaseline.candidateFingerprint;
const successCriteria = [
  { metricId: "evidence-coverage", label: "Evidence coverage", unit: "percent", direction: "at-least", baseline: 50, target: 90, mandatory: true, evidenceSourceId: "synthetic-eval-v1" }
];
const scopeFingerprint = createClinicalEvidenceHash({
  templateId: template.templateId,
  scope,
  exclusions: [...template.exclusions].sort()
});
const validManifestInput = {
  pilotId: "synthetic-pilot-test",
  prospectAlias: "prospect-test-001",
  templateId: template.templateId,
  scope,
  environment: "synthetic-nonproduction",
  datasetVersion: "synthetic-dataset-v1",
  candidateReference,
  modelPolicyVersion: "model-policy-v1",
  evidencePolicyVersion: "evidence-policy-v1",
  costCeilingUsd: 500,
  durationDays: 30,
  successCriteria,
  exclusions: template.exclusions,
  approvalState: "APPROVED_FOR_SYNTHETIC_EXECUTION",
  approvalEvidence: {
    approverId: "synthetic-test-approver",
    approvedAt: "2026-08-27T12:00:00.000Z",
    expiresAt: "2026-09-26T12:00:00.000Z",
    candidateReference,
    scopeFingerprint
  },
  controlContract: syntheticPilotControlContract
};

check("template-registry-is-complete-and-nonbinding", () => {
  const registry = getPilotTemplateRegistrySummary();
  assert.equal(registry.templateCount, 6);
  assert.equal(registry.allNoPhi, true);
  assert.equal(registry.allNonbinding, true);
  assert.equal(registry.productionAuthorityGranted, false);
});

check("manifest-requires-complete-control-contract", () => {
  const decision = createPilotManifest({
    ...validManifestInput,
    controlContract: { ...syntheticPilotControlContract, noEhrWriteback: false }
  });
  assert.equal(decision.status, "BLOCKED");
  assert.ok(decision.reasonCodes.includes("PILOT_CONTROL_CONTRACT_INCOMPLETE"));
});

check("manifest-rejects-identifying-prospect-value", () => {
  const decision = createPilotManifest({ ...validManifestInput, prospectAlias: "person@example.com" });
  assert.equal(decision.status, "BLOCKED");
  assert.ok(decision.reasonCodes.includes("NON_IDENTIFYING_PROSPECT_ALIAS_REQUIRED"));
});

check("manifest-rejects-forged-scope-approval", () => {
  const decision = createPilotManifest({
    ...validManifestInput,
    approvalEvidence: { ...validManifestInput.approvalEvidence, scopeFingerprint: "0".repeat(64) }
  });
  assert.equal(decision.status, "BLOCKED");
  assert.ok(decision.reasonCodes.includes("SYNTHETIC_EXECUTION_APPROVAL_INVALID"));
});

check("manifest-rejects-stale-scope-approval", () => {
  const decision = createPilotManifest(
    validManifestInput,
    new Date("2026-09-27T12:00:00.000Z")
  );
  assert.equal(decision.status, "BLOCKED");
  assert.ok(decision.reasonCodes.includes("SYNTHETIC_EXECUTION_APPROVAL_INVALID"));
});

const manifestDecision = createPilotManifest(validManifestInput);
assert.ok(manifestDecision.manifest);

check("pilot-stage-transition-requires-evidence", () => {
  const result = transitionPilotWorkflow({
    manifest: manifestDecision.manifest,
    currentStage: "DISCOVERY",
    requestedStage: "WORKFLOW_MAP",
    actorId: "synthetic-test-operator",
    idempotencyKey: "pilot-test-transition-001",
    consumedIdempotencyKeys: [],
    evidenceIds: [],
    timestamp: "2026-08-27T12:10:00.000Z"
  });
  assert.equal(result.allowed, false);
  assert.ok(result.reasonCodes.includes("MISSING_EVIDENCE:discovery-brief"));
});

check("pilot-stage-transition-blocks-duplicate-execution", () => {
  const result = transitionPilotWorkflow({
    manifest: manifestDecision.manifest,
    currentStage: "DISCOVERY",
    requestedStage: "WORKFLOW_MAP",
    actorId: "synthetic-test-operator",
    idempotencyKey: "pilot-test-transition-001",
    consumedIdempotencyKeys: ["pilot-test-transition-001"],
    evidenceIds: ["discovery-brief"],
    timestamp: "2026-08-27T12:10:00.000Z"
  });
  assert.equal(result.allowed, false);
  assert.ok(result.reasonCodes.includes("DUPLICATE_EXECUTION_BLOCKED"));
  assert.equal(result.customerSystemWriteAuthorized, false);
});

check("pilot-stage-transition-allows-next-synthetic-stage", () => {
  const result = transitionPilotWorkflow({
    manifest: manifestDecision.manifest,
    currentStage: "DISCOVERY",
    requestedStage: "WORKFLOW_MAP",
    actorId: "synthetic-test-operator",
    idempotencyKey: "pilot-test-transition-002",
    consumedIdempotencyKeys: [],
    evidenceIds: ["discovery-brief"],
    timestamp: "2026-08-27T12:10:00.000Z"
  });
  assert.equal(result.allowed, true);
  assert.equal(result.resultingStage, "WORKFLOW_MAP");
  assert.equal(result.productionAuthorityGranted, false);
});

check("objective-success-fails-on-missing-evidence", () => {
  const result = evaluatePilotSuccessCriteria({ manifest: manifestDecision.manifest, observations: [] });
  assert.equal(result.status, "FAIL");
  assert.equal(result.vagueSuccessStateAllowed, false);
});

check("cost-governor-stops-on-total-overrun", () => {
  const result = evaluatePilotCostGovernor({
    maxInferenceCostUsd: 100,
    maxToolCostUsd: 50,
    maxRetries: 2,
    maxRuntimeMinutes: 60,
    maxTotalBudgetUsd: 150,
    warningThresholdPercent: 80
  }, {
    inferenceCostUsd: 90,
    toolCostUsd: 40,
    infrastructureCostUsd: 20,
    reviewCostUsd: 30,
    retries: 1,
    runtimeMinutes: 40
  });
  assert.equal(result.status, "STOP");
  assert.equal(result.executionAllowed, false);
  assert.ok(result.reasonCodes.includes("TOTAL_BUDGET_EXCEEDED"));
});

check("margin-model-remains-estimated-and-nonbinding", () => {
  const result = calculatePilotMarginScenario({
    proposedPriceUsd: 25_000,
    modelSpendUsd: 100,
    engineeringEffortUsd: 8_000,
    reviewBurdenUsd: 3_000,
    infrastructureUsd: 1_000,
    customerSupportUsd: 2_000
  });
  assert.equal(result.classification, "ESTIMATED");
  assert.equal(result.bindingQuoteAuthorized, false);
  assert.equal(result.sensitivity.length, 4);
});

check("protected-pilot-expansion-fails-closed", () => {
  const result = evaluatePilotExpansion({
    syntheticExecutionAuthorized: true,
    successCriteriaPassed: true,
    evidenceFresh: true,
    unresolvedCriticalRisk: false,
    requestedState: "PREPARE_PROTECTED_PILOT",
    insuranceReady: false,
    counselReady: false,
    privacySecurityReady: false,
    deploymentDesignReady: false,
    customerAuthorizationPresent: false
  });
  assert.equal(result.allowed, false);
  assert.equal(result.protectedPilotActivated, false);
  assert.ok(result.reasonCodes.includes("COUNSEL_REVIEW_REQUIRED"));
});

check("proposal-fingerprint-does-not-grant-agent-authority", () => {
  const result = buildPilotProposalFingerprint({
    proposalId: "proposal-test-001",
    version: "v1",
    scope,
    pricingScenario: { proposedPriceUsd: 25_000 },
    candidateReference,
    expiresAt: "2026-09-27T00:00:00.000Z",
    approvalStatus: "HUMAN_APPROVAL_REQUIRED"
  });
  assert.equal(result.agentMaySign, false);
  assert.equal(result.agentMayDiscount, false);
  assert.equal(result.contractAuthorized, false);
  assert.match(result.proposalFingerprint, /^[0-9a-f]{64}$/);
});

check("buyer-priority-never-authorizes-outreach", () => {
  const result = evaluateBuyerReadiness({
    archetype: "health-system",
    pain: 90,
    urgency: 85,
    pilotFit: 90,
    regulatoryExposure: 20,
    dataBurden: 15,
    integrationBurden: 15,
    potentialContractSize: 90,
    expansion: 90,
    evidenceGain: 95,
    strategicFit: 95,
    effort: 30
  });
  assert.equal(result.status, "PRIORITY");
  assert.equal(result.automaticOutreachAuthorized, false);
  assert.equal(result.bindingCommercialActionAuthorized, false);
});

const previewInput = {
  deploymentId: p34ExactHeadBaseline.preview.deploymentId,
  deploymentUrl: p34ExactHeadBaseline.preview.deploymentUrl,
  commitSha: p34ExactHeadBaseline.commitSha,
  treeSha: p34ExactHeadBaseline.treeSha,
  candidateFingerprint: p34ExactHeadBaseline.candidateFingerprint,
  environment: "preview",
  nodeMajor: 24,
  healthPassed: true,
  readinessPassed: true,
  browserSmokePassed: true,
  apiSmokePassed: true,
  safetyBoundariesPassed: true,
  protectedWritesObserved: false,
  productionAliases: [],
  acceptedBy: "synthetic-release-steward",
  acceptedAt: "2026-08-27T13:00:00.000Z"
};
const previewExpected = {
  deploymentId: p34ExactHeadBaseline.preview.deploymentId,
  deploymentUrl: p34ExactHeadBaseline.preview.deploymentUrl,
  commitSha: p34ExactHeadBaseline.commitSha,
  treeSha: p34ExactHeadBaseline.treeSha,
  candidateFingerprint: p34ExactHeadBaseline.candidateFingerprint
};

check("preview-acceptance-is-exact-bound-and-nonproduction", () => {
  const result = evaluatePreviewAcceptance(
    previewInput,
    previewExpected,
    new Date("2026-08-27T13:05:00.000Z")
  );
  assert.equal(result.status, "NONPRODUCTION_PREVIEW_ACCEPTED");
  assert.equal(result.mergeAuthorized, false);
  assert.equal(result.productionAuthorized, false);
  assert.equal(result.customerGoLiveAuthorized, false);
});

check("preview-acceptance-rejects-production-alias", () => {
  const result = evaluatePreviewAcceptance(
    { ...previewInput, productionAliases: ["app.scrimedsolutions.com"] },
    previewExpected,
    new Date("2026-08-27T13:05:00.000Z")
  );
  assert.equal(result.accepted, false);
  assert.ok(result.reasonCodes.includes("PRODUCTION_ALIAS_ATTACHED"));
});

check("preview-acceptance-rejects-stale-candidate", () => {
  const result = evaluatePreviewAcceptance(
    { ...previewInput, commitSha: "a".repeat(40) },
    previewExpected,
    new Date("2026-08-27T13:05:00.000Z")
  );
  assert.equal(result.accepted, false);
  assert.ok(result.reasonCodes.includes("COMMIT_MISMATCH"));
});

check("preview-acceptance-rejects-stale-or-wrong-url-evidence", () => {
  const result = evaluatePreviewAcceptance(
    { ...previewInput, deploymentUrl: "https://unbound-preview.example.test" },
    previewExpected,
    new Date("2026-08-29T13:05:00.000Z")
  );
  assert.equal(result.accepted, false);
  assert.ok(result.reasonCodes.includes("DEPLOYMENT_URL_MISMATCH"));
  assert.ok(result.reasonCodes.includes("STALE_ACCEPTANCE_EVIDENCE"));
});

check("runtime-preview-summary-never-self-accepts", () => {
  const result = getP34PreviewAcceptanceSummary({
    NODE_ENV: "test",
    VERCEL_ENV: "preview",
    VERCEL_GIT_COMMIT_SHA: p34ExactHeadBaseline.commitSha,
    SCRIMED_PREVIEW_CANDIDATE_SHA256: p34ExactHeadBaseline.candidateFingerprint
  });
  assert.equal(result.previewAccepted, false);
  assert.equal(result.productionAuthorized, false);
});

check("aal2-evidence-is-redacted", () => {
  const redacted = createRedactedAal2Evidence({
    commitSha: p34ExactHeadBaseline.commitSha,
    candidateFingerprint: p34ExactHeadBaseline.candidateFingerprint,
    targetOrigin: p34ExactHeadBaseline.preview.deploymentUrl,
    status: "PASS_NONPRODUCTION_AAL2",
    tokenFingerprint: "forbidden",
    subjectFingerprint: "forbidden",
    checks: [{ id: "aal2-token-policy", passed: true }]
  }, "2026-08-27T13:00:00.000Z");
  const serialized = JSON.stringify(redacted);
  assert.equal(serialized.includes("tokenFingerprint"), false);
  assert.equal(serialized.includes("subjectFingerprint"), false);
  assert.equal(redacted.productionAuthorityGranted, false);
});

check("operating-system-summary-retains-protected-boundary", () => {
  const result = getPilotOperatingSystemSummary();
  assert.equal(result.manifestDecision.status, "HUMAN_SCOPE_REVIEW_REQUIRED");
  assert.equal(result.manifestDecision.manifest?.executionAuthorized, false);
  assert.equal(result.successCriteria.eligibleForExpansion, false);
  assert.equal(result.evidencePacket.evidenceState, "DRAFT_DEMONSTRATION_EVIDENCE");
  assert.equal(result.expansion.allowed, false);
  assert.ok(result.expansion.reasonCodes.includes("SYNTHETIC_EXECUTION_APPROVAL_REQUIRED"));
  assert.equal(result.productionAuthorityGranted, false);
  assert.equal(result.customerActivationAuthorized, false);
  assert.equal(result.trustReadiness.find((entry) => entry.tier === "SYNTHETIC_PILOT")?.status, "NAMED_SCOPE_APPROVAL_REQUIRED");
  assert.equal(result.trustReadiness.find((entry) => entry.tier === "PRODUCTION")?.status, "BLOCKED");
  assert.equal(result.evidencePacket.watermark, "SYNTHETIC / NON-PRODUCTION");
});

console.log(`SCRIMED p.34 post-review readiness policy tests: ${passed}/${passed} passed`);
