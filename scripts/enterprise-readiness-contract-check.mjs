#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/scrimedSafetyGovernance.ts",
  "app/lib/costApiGuardrails.ts",
  "app/lib/diligencePacketManifest.ts",
  "app/lib/diligencePacketShareGuard.ts",
  "app/lib/diligenceReleaseGate.ts",
  "app/lib/recipientQualificationMatrix.ts",
  "app/lib/modelAgnosticRouter.ts",
  "app/lib/investorReadinessCommandCenter.ts",
  "app/lib/qaAal2RunEvidence.ts",
  "app/lib/releaseContinuity.ts",
  "app/lib/releaseAuthorizationChain.ts",
  "app/lib/releaseEvidenceFreshnessGuard.ts",
  "app/lib/releaseEvidenceLedger.ts",
  "app/lib/releaseEvidencePromotion.ts",
  "app/lib/enterpriseRiskRegister.ts",
  "app/lib/productReadinessRegistry.ts",
  "app/lib/clinicalRobustnessLab.ts",
  "app/lib/executionAttemptEnvelope.ts",
  "app/lib/executionAttemptDurableStore.ts",
  "app/investor-readiness/page.tsx",
  "app/release-continuity/page.tsx",
  "app/risk-register/page.tsx",
  "app/api/investor-readiness/status/route.ts",
  "app/api/risk-register/route.ts",
  "app/api/products/readiness/route.ts",
  "app/api/release-continuity/route.ts",
  "app/api/release-continuity/brief/route.ts",
  "app/api/release-continuity/evidence-ledger/route.ts",
  "app/api/release-continuity/evidence-ledger/brief/route.ts",
  "app/api/release-continuity/evidence-freshness-guard/route.ts",
  "app/api/release-continuity/evidence-freshness-guard/brief/route.ts",
  "app/api/release-continuity/authorization-chain/route.ts",
  "app/api/release-continuity/authorization-chain/brief/route.ts",
  "app/api/release-continuity/diligence-gate/route.ts",
  "app/api/release-continuity/diligence-gate/brief/route.ts",
  "app/api/release-continuity/diligence-packet-manifest/route.ts",
  "app/api/release-continuity/diligence-packet-manifest/brief/route.ts",
  "app/api/release-continuity/diligence-packet-share-guard/route.ts",
  "app/api/release-continuity/diligence-packet-share-guard/brief/route.ts",
  "app/api/release-continuity/recipient-qualification-matrix/route.ts",
  "app/api/release-continuity/recipient-qualification-matrix/brief/route.ts",
  "app/api/release-continuity/evidence-promotion/route.ts",
  "app/api/release-continuity/evidence-promotion/brief/route.ts",
  "app/api/workflows/execution-attempts/durable-store/record/route.ts",
  "app/api/workflows/execution-attempts/durable-store/replay/route.ts",
  "app/api/workflows/execution-attempts/durable-store/review-disposition/route.ts",
  "app/lib/siteNavigation.ts",
  "docs/ENTERPRISE_READINESS.md",
  "docs/SAFETY_BOUNDARIES.md",
  "docs/INVESTOR_DILIGENCE.md",
  "docs/MODEL_ROUTER.md",
  "docs/RISK_REGISTER.md",
  "docs/NO_PHI_POLICY.md",
  "docs/release-continuity.md",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required enterprise readiness contract text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));

for (const expected of [
  "scrimedSafetyPolicyVersion",
  "synthetic-evaluation",
  "clinical-robustness-lab",
  "investor-buyer-diligence",
  "live-phi",
  "clinical-diagnosis",
  "treatment-recommendation",
  "prescribing",
  "patient-outreach",
  "payer-submission",
  "ehr-writeback",
  "production-connector-approval",
  "certification-validation-claim",
  "active-fail-closed",
  "not-authorized-production-phi",
  "not-authorized-live-care"
]) {
  requireIncludes("app/lib/scrimedSafetyGovernance.ts", files["app/lib/scrimedSafetyGovernance.ts"], expected);
}

for (const expected of [
  "SCRIMED_AI_PROVIDER_CALLS_ENABLED",
  "SCRIMED_COST_GUARDRAILS_ENABLED",
  "SCRIMED_MAX_SYNTHETIC_REQUESTS_PER_MINUTE",
  "provider-call kill switch",
  "failClosedVerified"
]) {
  requireIncludes("app/lib/costApiGuardrails.ts", files["app/lib/costApiGuardrails.ts"], expected);
}

for (const expected of [
  "DiligencePacketManifestSummary",
  "diligence-packet-manifest-active-no-secret",
  "/api/release-continuity/diligence-packet-manifest",
  "/api/release-continuity/diligence-packet-manifest/brief",
  "diligence-manifest-",
  "no-secret-buyer-investor-diligence-only",
  "include-no-secret-metadata",
  "withhold-until-human-aal2",
  "withhold-until-qualified-review",
  "protected-boundary-release-evidence-intake-packet",
  "Protected Boundary Release Evidence Intake Packet",
  "/api/pilot-workspaces/{workspaceSlug}/boundary-release-evidence-intake/packet",
  "boundary release approved",
  "tokenMaterialCaptured: false",
  "productionApproval: false",
  "packetAssemblyRules",
  "blockedClaims",
  "requiredReviewerRoles"
]) {
  requireIncludes(
    "app/lib/diligencePacketManifest.ts",
    files["app/lib/diligencePacketManifest.ts"],
    expected
  );
}

for (const expected of [
  "DiligencePacketShareGuardSummary",
  "diligence-packet-share-guard-active-human-gated",
  "/api/release-continuity/diligence-packet-share-guard",
  "/api/release-continuity/diligence-packet-share-guard/brief",
  "diligence-share-",
  "protected-diligence-only-after-human-review",
  "recipient-specific-human-approval-required",
  "not-authorized-without-customer-permission",
  "public-or-press",
  "qualified-investor-or-buyer-under-review",
  "customer-specific-recipient",
  "protected-boundary-release-evidence-intake-packet-sharing",
  "protected-boundary-release-evidence-intake-packet",
  "/api/pilot-workspaces/{workspaceSlug}/boundary-release-evidence-intake/packet",
  "withhold-until-qualified-review",
  "protected boundary-release packet is public-shareable",
  "boundary release approved",
  "boundaryReleaseEvidenceIntakePacketProofStackStatus",
  "boundaryReleaseEvidenceIntakeStorageAuthority",
  "boundaryReleaseEvidenceIntakeReleaseAuthority",
  "tokenMaterialCaptured: false",
  "productionApproval: false",
  "requiredControls",
  "shareInstructions",
  "blockedClaims"
]) {
  requireIncludes(
    "app/lib/diligencePacketShareGuard.ts",
    files["app/lib/diligencePacketShareGuard.ts"],
    expected
  );
}

for (const expected of [
  "RecipientQualificationMatrixSummary",
  "recipient-qualification-matrix-active-no-secret",
  "/api/release-continuity/recipient-qualification-matrix",
  "/api/release-continuity/recipient-qualification-matrix/brief",
  "recipient-qualification-",
  "qualified-recipient-review-required",
  "not-stored-in-scrimed",
  "blocked-until-customer-authorization",
  "blocked-until-qualified-review",
  "public-or-press",
  "qualified-investor-or-buyer-under-review",
  "customer-specific-recipient",
  "protected Boundary Release Evidence Intake Packet route metadata",
  "recipient qualification matrix is distribution approval",
  "boundary release approved",
  "tokenMaterialCaptured: false",
  "productionApproval: false",
  "preflightChecklist",
  "blockedClaims",
  "revocationPolicy"
]) {
  requireIncludes(
    "app/lib/recipientQualificationMatrix.ts",
    files["app/lib/recipientQualificationMatrix.ts"],
    expected
  );
}

for (const expected of [
  "DiligenceReleaseGateSummary",
  "diligence-release-gate-active-no-production-approval",
  "/api/release-continuity/diligence-gate",
  "/api/release-continuity/diligence-gate/brief",
  "go-no-secret-buyer-diligence",
  "no-go-until-human-aal2-retained-packet",
  "no-go-until-qualified-review",
  "no-go-not-release-approval",
  "no-go-not-authorized-live-care",
  "tokenMaterialCaptured: false",
  "productionApproval: false",
  "blockedClaims",
  "requiredNextActions"
]) {
  requireIncludes(
    "app/lib/diligenceReleaseGate.ts",
    files["app/lib/diligenceReleaseGate.ts"],
    expected
  );
}

for (const expected of [
  "openai",
  "anthropic",
  "google",
  "nvidia-nemotron",
  "azure",
  "aws",
  "open-model",
  "synthetic-fallback",
  "FAST_LOW_COST",
  "ENTERPRISE_REASONING",
  "CLINICAL_REVIEW_SYNTHETIC",
  "CYBER_DEFENSE_SYNTHETIC",
  "RESEARCH_SIMULATION_SYNTHETIC",
  "blocked-by-safety-policy",
  "blocked-by-cost-guardrail"
]) {
  requireIncludes("app/lib/modelAgnosticRouter.ts", files["app/lib/modelAgnosticRouter.ts"], expected);
}

for (const expected of [
  "/investor-readiness",
  "/api/investor-readiness/status",
  "EnterpriseDiligenceSnapshot",
  "company: \"SCRIMED\"",
  "status: \"synthetic-demo-ready\"",
  "phi_status: \"not_enabled\"",
  "clinical_action_status: \"not_enabled\"",
  "audit_readiness: true",
  "execution_evidence_binding: true",
  "deployment_readiness: \"buyer_diligence_ready\"",
  "knownNoGoBoundaries",
  "getQaAal2SmokeReadinessPacket",
  "aal2SmokeReadiness",
  "deploymentReleaseChecklist",
  "getReleaseEvidenceLedgerSummary",
  "getReleaseEvidencePromotionSummary",
  "getReleaseEvidenceFreshnessGuardSummary",
  "getReleaseAuthorizationChainSummary",
  "getDiligenceReleaseGateSummary",
  "getDiligencePacketManifestSummary",
  "getDiligencePacketShareGuardSummary",
  "getRecipientQualificationMatrixSummary",
  "releaseEvidenceLedger",
  "releaseEvidencePromotion",
  "releaseEvidenceFreshnessGuard",
  "releaseAuthorizationChain",
  "diligenceReleaseGate",
  "diligencePacketManifest",
  "diligencePacketShareGuard",
  "recipientQualificationMatrix",
  "releaseEvidenceLedgerStatus",
  "aal2-smoke-readiness-preflight",
  "npm run smoke:aal2:readiness",
  "npm run smoke:aal2:durable-store:strict",
  "/api/qa-evidence/aal2-smoke-readiness",
  "/api/release-continuity/diligence-packet-manifest",
  "/api/release-continuity/diligence-packet-share-guard",
  "/api/release-continuity/recipient-qualification-matrix",
  "/api/release-continuity/evidence-freshness-guard",
  "/api/release-continuity/authorization-chain",
  "Diligence Packet Manifest",
  "Diligence Packet Share Guard",
  "Recipient Qualification Matrix",
  "Release Evidence Freshness Guard",
  "Release Authorization Chain",
  "riskRegister",
  "productReadiness",
  "not investment advice"
]) {
  requireIncludes(
    "app/lib/investorReadinessCommandCenter.ts",
    files["app/lib/investorReadinessCommandCenter.ts"],
    expected
  );
}

for (const expected of [
  "ReleaseEvidenceLedgerEntry",
  "release-evidence-ledger-active-no-secret",
  "/api/release-continuity/evidence-ledger",
  "/api/release-continuity/evidence-ledger/brief",
  "syntheticEvidenceHash",
  "release-evidence-",
  "nonsecret-regression-suite",
  "execution-attempt-durable-store-contract",
  "aal2-smoke-readiness-preflight",
  "strict-aal2-durable-store-smoke",
  "strict-stored-vector-rpc-smoke",
  "tokenMaterialCaptured: false",
  "productionApproval: false",
  "not-authorized-production-phi",
  "not-authorized-live-care"
]) {
  requireIncludes(
    "app/lib/releaseEvidenceLedger.ts",
    files["app/lib/releaseEvidenceLedger.ts"],
    expected
  );
}

for (const expected of [
  "ReleaseEvidencePromotionQueueItem",
  "release-evidence-promotion-queue-active-human-gated",
  "/api/release-continuity/evidence-promotion",
  "/api/release-continuity/evidence-promotion/brief",
  "buyer-diligence-candidate",
  "protected-operator-proof-required",
  "qualified-external-review-required",
  "shareable-no-secret-metadata",
  "blocked-until-retained-aal2-proof",
  "blocked-until-qualified-review",
  "tokenMaterialCaptured: false",
  "productionApproval: false",
  "protected-buyer-diligence-only-after-review",
  "not-authorized-public-claim",
  "withheldMaterial"
]) {
  requireIncludes(
    "app/lib/releaseEvidencePromotion.ts",
    files["app/lib/releaseEvidencePromotion.ts"],
    expected
  );
}

for (const expected of [
  "ReleaseEvidenceFreshnessGuardSummary",
  "release-evidence-freshness-guard-active-no-secret",
  "/api/release-continuity/evidence-freshness-guard",
  "/api/release-continuity/evidence-freshness-guard/brief",
  "freshness-",
  "fresh-rerun-required-before-external-use",
  "fresh-for-internal-readiness",
  "refresh-required-before-external-sharing",
  "blocked-until-human-aal2-refresh",
  "blocked-until-qualified-review-refresh",
  "tokenMaterialCaptured: false",
  "productionApproval: false",
  "not-authorized-production-phi",
  "not-authorized-live-care",
  "not-authorized-without-customer-permission",
  "freshnessRules",
  "blockedClaims"
]) {
  requireIncludes(
    "app/lib/releaseEvidenceFreshnessGuard.ts",
    files["app/lib/releaseEvidenceFreshnessGuard.ts"],
    expected
  );
}

for (const expected of [
  "ReleaseAuthorizationChainSummary",
  "release-authorization-chain-active-no-release-approval",
  "/api/release-continuity/authorization-chain",
  "/api/release-continuity/authorization-chain/brief",
  "release-authorization-",
  "no-secret-metadata-chain-not-release-approval",
  "metadata-ready-internal-review",
  "human-review-required",
  "operator-required",
  "external-review-required",
  "blocked-by-design",
  "weakestLink",
  "buyerDiligenceMetadataLane",
  "protectedProofLane",
  "not-authorized-without-customer-permission",
  "not-authorized-production-phi",
  "not-authorized-live-care",
  "not-security-certified",
  "tokenMaterialCaptured: false",
  "productionApproval: false",
  "recipient approved without human review",
  "boundary release approved",
  "requiredBeforeExternalReference"
]) {
  requireIncludes(
    "app/lib/releaseAuthorizationChain.ts",
    files["app/lib/releaseAuthorizationChain.ts"],
    expected
  );
}

for (const expected of [
  "QaAal2SmokeReadinessPacket",
  "aal2-smoke-readiness-preflight-ready-no-secret",
  "SCRIMED AAL2 Smoke Readiness is a no-secret operator preflight",
  "strictAttemptReady: false",
  "tokenMaterialStored: false",
  "tokenMaterialPrinted: false",
  "npm run smoke:aal2:readiness",
  "npm run smoke:aal2:durable-store:strict",
  "/api/qa-evidence/aal2-smoke-readiness"
]) {
  requireIncludes(
    "app/lib/qaAal2RunEvidence.ts",
    files["app/lib/qaAal2RunEvidence.ts"],
    expected
  );
}

for (const expected of [
  "ReleaseContinuityDeploymentChecklistItem",
  "getQaAal2SmokeReadinessPacket",
  "aal2-smoke-readiness-packet",
  "AAL2 smoke readiness preflight",
  "buildReleaseDeploymentChecklist",
  "deploymentReleaseChecklist",
  "releaseEvidenceLedger",
  "releaseEvidencePromotion",
  "releaseEvidenceFreshnessGuard",
  "releaseAuthorizationChain",
  "diligenceReleaseGate",
  "diligencePacketManifest",
  "diligencePacketShareGuard",
  "getReleaseEvidenceLedgerSummary",
  "getReleaseEvidencePromotionSummary",
  "getReleaseEvidenceFreshnessGuardSummary",
  "getReleaseAuthorizationChainSummary",
  "getDiligenceReleaseGateSummary",
  "getDiligencePacketManifestSummary",
  "getDiligencePacketShareGuardSummary",
  "getRecipientQualificationMatrixSummary",
  "Release Evidence Ledger",
  "Release Evidence Promotion Queue",
  "Release Evidence Freshness Guard",
  "Release Authorization Chain",
  "Diligence Release Gate",
  "Diligence Packet Manifest",
  "Diligence Packet Share Guard",
  "Recipient Qualification Matrix",
  "strict-aal2-durable-store-smoke",
  "strict-stored-vector-rpc-smoke",
  "npm run smoke:aal2:readiness",
  "npm run smoke:aal2:durable-store:strict",
  "/api/qa-evidence/aal2-smoke-readiness",
  "/api/release-continuity/diligence-packet-manifest",
  "/api/release-continuity/diligence-packet-share-guard",
  "/api/release-continuity/recipient-qualification-matrix",
  "/api/release-continuity/evidence-freshness-guard",
  "/api/release-continuity/authorization-chain",
  "no-token-values-exposed-or-retained"
]) {
  requireIncludes(
    "app/lib/releaseContinuity.ts",
    files["app/lib/releaseContinuity.ts"],
    expected
  );
}

for (const expected of [
  "PHI/privacy",
  "clinical safety",
  "model hallucination",
  "model drift",
  "bias",
  "cybersecurity",
  "vendor dependency",
  "cost spike/API abuse",
  "auditability",
  "regulatory claims",
  "EHR integration",
  "payer workflow",
  "deployment security",
  "blocked-before-production"
]) {
  requireIncludes("app/lib/enterpriseRiskRegister.ts", files["app/lib/enterpriseRiskRegister.ts"], expected);
}

for (const expected of [
  "SCRIMED OS",
  "Sanar AI",
  "MyVitals AI",
  "DocuTwin",
  "CareExplain",
  "Ambient Scribe",
  "Co-Pilot Intake",
  "Perfect Chart",
  "Trust Engine",
  "TrialCore",
  "Onco-ID",
  "Clinical MCP Adapter",
  "Trust QA Loop",
  "Agent Commander",
  "Edge Runtime",
  "InsightLoop",
  "RCM / Payer Agent",
  "Referral Intelligence",
  "Clinical Robustness Lab",
  "Investor Readiness Command Center",
  "blockedProductionMode",
  "investorNarrative"
]) {
  requireIncludes("app/lib/productReadinessRegistry.ts", files["app/lib/productReadinessRegistry.ts"], expected);
}

for (const expected of [
  "Research/demo use only. Not for diagnosis, treatment, prescribing, or live patient care.",
  "missing-labs-risk",
  "missing-imaging-risk",
  "note-only-blind-spot",
  "citation-reference-quality",
  "guideline-grounding",
  "demographic-bias-risk",
  "data-freshness",
  "model-disagreement",
  "human-review-requirement"
]) {
  requireIncludes("app/lib/clinicalRobustnessLab.ts", files["app/lib/clinicalRobustnessLab.ts"], expected);
}

for (const expected of [
  "ExecutionAttemptEvidenceAuditTrail",
  "attempt_id",
  "allowed_blocked_decision",
  "policy_version",
  "input_classification",
  "phi_detected",
  "model_provider_selected",
  "output_hash",
  "evidence_envelope_hash",
  "evidenceAuditTrailCount"
]) {
  requireIncludes("app/lib/executionAttemptEnvelope.ts", files["app/lib/executionAttemptEnvelope.ts"], expected);
}

for (const expected of [
  "evaluateScrimedSafetyGate",
  "scrimedSafetyHeaders",
  "execution-attempt-durable-record-blocked"
]) {
  requireIncludes(
    "app/api/workflows/execution-attempts/durable-store/record/route.ts",
    files["app/api/workflows/execution-attempts/durable-store/record/route.ts"],
    expected
  );
}

for (const expected of [
  "evaluateScrimedSafetyGate",
  "scrimedSafetyHeaders",
  "execution-attempt-durable-replay-blocked"
]) {
  requireIncludes(
    "app/api/workflows/execution-attempts/durable-store/replay/route.ts",
    files["app/api/workflows/execution-attempts/durable-store/replay/route.ts"],
    expected
  );
}

for (const expected of [
  "evaluateScrimedSafetyGate",
  "scrimedSafetyHeaders",
  "execution-attempt-review-disposition-blocked"
]) {
  requireIncludes(
    "app/api/workflows/execution-attempts/durable-store/review-disposition/route.ts",
    files["app/api/workflows/execution-attempts/durable-store/review-disposition/route.ts"],
    expected
  );
}

for (const expected of [
  "Investor Readiness Command Center",
  "Enterprise diligence snapshot",
  "AAL2 Smoke Readiness",
  "Deployment release checklist",
  "summary.deploymentReleaseChecklist",
  "summary.aal2SmokeReadiness",
  "summary.releaseEvidenceLedger",
  "summary.releaseEvidencePromotion",
  "summary.releaseEvidenceFreshnessGuard",
  "summary.diligenceReleaseGate",
  "summary.diligencePacketManifest",
  "summary.diligencePacketShareGuard",
  "summary.recipientQualificationMatrix",
  "Evidence Ledger",
  "Promotion Queue",
  "Freshness Guard",
  "Diligence Gate",
  "Packet Manifest",
  "Recipient Matrix",
  "Share Guard",
  "Diligence packet manifest",
  "Diligence packet share guard",
  "Recipient qualification matrix",
  "Release evidence freshness guard",
  "Release authorization chain",
  "summary.releaseAuthorizationChain",
  "Authorization Chain",
  "NO-GO boundaries",
  "/api/investor-readiness/status"
]) {
  requireIncludes("app/investor-readiness/page.tsx", files["app/investor-readiness/page.tsx"], expected);
}

for (const expected of [
  "Release Continuity",
  "AAL2 Smoke Readiness",
  "Deployment release checklist",
  "summary.deploymentReleaseChecklist",
  "summary.aal2SmokeReadiness",
  "summary.releaseEvidenceLedger",
  "summary.releaseEvidencePromotion",
  "summary.releaseEvidenceFreshnessGuard",
  "summary.releaseAuthorizationChain",
  "summary.diligenceReleaseGate",
  "summary.diligencePacketManifest",
  "summary.diligencePacketShareGuard",
  "summary.recipientQualificationMatrix",
  "release-evidence-ledger",
  "release-evidence-promotion",
  "release-evidence-freshness-guard",
  "release-authorization-chain",
  "diligence-release-gate",
  "diligence-packet-manifest",
  "diligence-packet-share-guard",
  "recipient-qualification-matrix",
  "Packet Manifest",
  "Authorization Chain",
  "Recipient Matrix",
  "Protected Boundary Release Evidence Intake Packet",
  "Share Guard",
  "Freshness Guard",
  "human AAL2 required"
]) {
  requireIncludes("app/release-continuity/page.tsx", files["app/release-continuity/page.tsx"], expected);
}

for (const expected of [
  "Enterprise Risk Register",
  "/api/risk-register",
  "Risk tracking is not approval"
]) {
  requireIncludes("app/risk-register/page.tsx", files["app/risk-register/page.tsx"], expected);
}

for (const expected of [
  "X-SCRIMED-Investor-Readiness",
  "evaluateScrimedSafetyGate",
  "evaluateCostApiGuardrail",
  "getInvestorReadinessCommandCenterSummary"
]) {
  requireIncludes("app/api/investor-readiness/status/route.ts", files["app/api/investor-readiness/status/route.ts"], expected);
}

for (const expected of [
  "X-SCRIMED-Risk-Register",
  "getEnterpriseRiskRegisterSummary",
  "evaluateScrimedSafetyGate"
]) {
  requireIncludes("app/api/risk-register/route.ts", files["app/api/risk-register/route.ts"], expected);
}

for (const expected of [
  "X-SCRIMED-Product-Readiness",
  "getProductReadinessRegistrySummary",
  "evaluateScrimedSafetyGate"
]) {
  requireIncludes("app/api/products/readiness/route.ts", files["app/api/products/readiness/route.ts"], expected);
}

for (const expected of [
  "X-SCRIMED-Release-Continuity",
  "getReleaseContinuitySummary",
  "not-authorized-production-phi",
  "no-token-values-exposed-or-retained"
]) {
  requireIncludes("app/api/release-continuity/route.ts", files["app/api/release-continuity/route.ts"], expected);
}

for (const expected of [
  "buildReleaseContinuityBrief",
  "brief-operator-boundary",
  "not-authorized-production-phi",
  "no-token-values-exposed-or-retained"
]) {
  requireIncludes(
    "app/api/release-continuity/brief/route.ts",
    files["app/api/release-continuity/brief/route.ts"],
    expected
  );
}

for (const expected of [
  "X-SCRIMED-Release-Evidence-Ledger",
  "getReleaseEvidenceLedgerSummary",
  "releaseEvidenceLedgerStatus",
  "not-authorized-production-phi",
  "no-token-values-exposed-or-retained"
]) {
  requireIncludes(
    "app/api/release-continuity/evidence-ledger/route.ts",
    files["app/api/release-continuity/evidence-ledger/route.ts"],
    expected
  );
}

for (const expected of [
  "X-SCRIMED-Release-Evidence-Ledger",
  "buildReleaseEvidenceLedgerBrief",
  "releaseEvidenceLedgerStatus",
  "text/markdown",
  "not-authorized-production-phi",
  "no-token-values-exposed-or-retained"
]) {
  requireIncludes(
    "app/api/release-continuity/evidence-ledger/brief/route.ts",
    files["app/api/release-continuity/evidence-ledger/brief/route.ts"],
    expected
  );
}

for (const expected of [
  "X-SCRIMED-Diligence-Release-Gate",
  "getDiligenceReleaseGateSummary",
  "diligenceReleaseGateStatus",
  "not-authorized-production-phi",
  "not-release-approval",
  "no-token-values-exposed-or-retained"
]) {
  requireIncludes(
    "app/api/release-continuity/diligence-gate/route.ts",
    files["app/api/release-continuity/diligence-gate/route.ts"],
    expected
  );
}

for (const expected of [
  "X-SCRIMED-Diligence-Release-Gate",
  "buildDiligenceReleaseGateBrief",
  "diligenceReleaseGateStatus",
  "text/markdown",
  "not-authorized-production-phi",
  "not-release-approval",
  "no-token-values-exposed-or-retained"
]) {
  requireIncludes(
    "app/api/release-continuity/diligence-gate/brief/route.ts",
    files["app/api/release-continuity/diligence-gate/brief/route.ts"],
    expected
  );
}

for (const expected of [
  "X-SCRIMED-Diligence-Packet-Manifest",
  "getDiligencePacketManifestSummary",
  "diligencePacketManifestStatus",
  "not-authorized-production-phi",
  "not-release-approval",
  "not-authorized",
  "not-security-certified",
  "no-token-values-exposed-or-retained"
]) {
  requireIncludes(
    "app/api/release-continuity/diligence-packet-manifest/route.ts",
    files["app/api/release-continuity/diligence-packet-manifest/route.ts"],
    expected
  );
}

for (const expected of [
  "X-SCRIMED-Diligence-Packet-Manifest",
  "buildDiligencePacketManifestBrief",
  "diligencePacketManifestStatus",
  "text/markdown",
  "not-authorized-production-phi",
  "not-release-approval",
  "not-authorized",
  "not-security-certified",
  "no-token-values-exposed-or-retained"
]) {
  requireIncludes(
    "app/api/release-continuity/diligence-packet-manifest/brief/route.ts",
    files["app/api/release-continuity/diligence-packet-manifest/brief/route.ts"],
    expected
  );
}

for (const expected of [
  "X-SCRIMED-Diligence-Packet-Share-Guard",
  "X-SCRIMED-Recipient-Authorization",
  "getDiligencePacketShareGuardSummary",
  "diligencePacketShareGuardStatus",
  "not-authorized-production-phi",
  "not-release-approval",
  "not-authorized",
  "recipient-specific-human-approval-required",
  "not-security-certified",
  "no-token-values-exposed-or-retained"
]) {
  requireIncludes(
    "app/api/release-continuity/diligence-packet-share-guard/route.ts",
    files["app/api/release-continuity/diligence-packet-share-guard/route.ts"],
    expected
  );
}

for (const expected of [
  "X-SCRIMED-Diligence-Packet-Share-Guard",
  "X-SCRIMED-Recipient-Authorization",
  "buildDiligencePacketShareGuardBrief",
  "diligencePacketShareGuardStatus",
  "text/markdown",
  "not-authorized-production-phi",
  "not-release-approval",
  "not-authorized",
  "recipient-specific-human-approval-required",
  "not-security-certified",
  "no-token-values-exposed-or-retained"
]) {
  requireIncludes(
    "app/api/release-continuity/diligence-packet-share-guard/brief/route.ts",
    files["app/api/release-continuity/diligence-packet-share-guard/brief/route.ts"],
    expected
  );
}

for (const expected of [
  "X-SCRIMED-Recipient-Qualification",
  "X-SCRIMED-Recipient-Identifier-Storage",
  "getRecipientQualificationMatrixSummary",
  "recipientQualificationMatrixStatus",
  "not-authorized-production-phi",
  "not-release-approval",
  "not-authorized",
  "not-stored-in-scrimed",
  "not-security-certified",
  "no-token-values-exposed-or-retained"
]) {
  requireIncludes(
    "app/api/release-continuity/recipient-qualification-matrix/route.ts",
    files["app/api/release-continuity/recipient-qualification-matrix/route.ts"],
    expected
  );
}

for (const expected of [
  "X-SCRIMED-Recipient-Qualification",
  "X-SCRIMED-Recipient-Identifier-Storage",
  "buildRecipientQualificationMatrixBrief",
  "recipientQualificationMatrixStatus",
  "text/markdown",
  "not-authorized-production-phi",
  "not-release-approval",
  "not-authorized",
  "not-stored-in-scrimed",
  "not-security-certified",
  "no-token-values-exposed-or-retained"
]) {
  requireIncludes(
    "app/api/release-continuity/recipient-qualification-matrix/brief/route.ts",
    files["app/api/release-continuity/recipient-qualification-matrix/brief/route.ts"],
    expected
  );
}

for (const expected of [
  "X-SCRIMED-Release-Evidence-Promotion",
  "getReleaseEvidencePromotionSummary",
  "releaseEvidencePromotionStatus",
  "human-gated-no-secret-metadata-only",
  "not-authorized-production-phi",
  "no-token-values-exposed-or-retained"
]) {
  requireIncludes(
    "app/api/release-continuity/evidence-promotion/route.ts",
    files["app/api/release-continuity/evidence-promotion/route.ts"],
    expected
  );
}

for (const expected of [
  "X-SCRIMED-Release-Evidence-Promotion",
  "buildReleaseEvidencePromotionBrief",
  "releaseEvidencePromotionStatus",
  "text/markdown",
  "human-gated-no-secret-metadata-only",
  "not-authorized-production-phi",
  "no-token-values-exposed-or-retained"
]) {
  requireIncludes(
    "app/api/release-continuity/evidence-promotion/brief/route.ts",
    files["app/api/release-continuity/evidence-promotion/brief/route.ts"],
    expected
  );
}

for (const expected of [
  "X-SCRIMED-Release-Evidence-Freshness-Guard",
  "X-SCRIMED-Freshness-Authority",
  "getReleaseEvidenceFreshnessGuardSummary",
  "releaseEvidenceFreshnessGuardStatus",
  "fresh-rerun-required-before-external-use",
  "not-authorized-production-phi",
  "not-release-approval",
  "not-authorized",
  "not-security-certified",
  "no-token-values-exposed-or-retained"
]) {
  requireIncludes(
    "app/api/release-continuity/evidence-freshness-guard/route.ts",
    files["app/api/release-continuity/evidence-freshness-guard/route.ts"],
    expected
  );
}

for (const expected of [
  "X-SCRIMED-Release-Evidence-Freshness-Guard",
  "X-SCRIMED-Freshness-Authority",
  "buildReleaseEvidenceFreshnessGuardBrief",
  "releaseEvidenceFreshnessGuardStatus",
  "text/markdown",
  "fresh-rerun-required-before-external-use",
  "not-authorized-production-phi",
  "not-release-approval",
  "not-authorized",
  "not-security-certified",
  "no-token-values-exposed-or-retained"
]) {
  requireIncludes(
    "app/api/release-continuity/evidence-freshness-guard/brief/route.ts",
    files["app/api/release-continuity/evidence-freshness-guard/brief/route.ts"],
    expected
  );
}

for (const expected of [
  "X-SCRIMED-Authorization-Chain",
  "getReleaseAuthorizationChainSummary",
  "releaseAuthorizationChainStatus",
  "synthetic-and-metadata-only",
  "not-authorized-production-phi",
  "not-release-approval",
  "not-authorized-without-customer-permission",
  "not-authorized",
  "not-security-certified",
  "no-token-values-exposed-or-retained"
]) {
  requireIncludes(
    "app/api/release-continuity/authorization-chain/route.ts",
    files["app/api/release-continuity/authorization-chain/route.ts"],
    expected
  );
}

for (const expected of [
  "X-SCRIMED-Authorization-Chain",
  "buildReleaseAuthorizationChainBrief",
  "releaseAuthorizationChainStatus",
  "text/markdown",
  "synthetic-and-metadata-only",
  "not-authorized-production-phi",
  "not-release-approval",
  "not-authorized-without-customer-permission",
  "not-authorized",
  "not-security-certified",
  "no-token-values-exposed-or-retained"
]) {
  requireIncludes(
    "app/api/release-continuity/authorization-chain/brief/route.ts",
    files["app/api/release-continuity/authorization-chain/brief/route.ts"],
    expected
  );
}

for (const expected of [
  "Investor Command",
  "/investor-readiness",
  "Risk Register",
  "/risk-register"
]) {
  requireIncludes("app/lib/siteNavigation.ts", files["app/lib/siteNavigation.ts"], expected);
}

for (const docPath of [
  "docs/ENTERPRISE_READINESS.md",
  "docs/SAFETY_BOUNDARIES.md",
  "docs/INVESTOR_DILIGENCE.md",
  "docs/MODEL_ROUTER.md",
  "docs/RISK_REGISTER.md",
  "docs/NO_PHI_POLICY.md",
  "docs/release-continuity.md"
]) {
  for (const expected of ["SCRIMED", "NO-GO", "PHI"]) {
    requireIncludes(docPath, files[docPath], expected);
  }
}

for (const expected of [
  "/api/qa-evidence/aal2-smoke-readiness",
  "/api/release-continuity/evidence-ledger",
  "/api/release-continuity/evidence-promotion",
  "/api/release-continuity/evidence-freshness-guard",
  "/api/release-continuity/authorization-chain",
  "/api/release-continuity/diligence-gate",
  "/api/release-continuity/diligence-packet-manifest",
  "/api/pilot-workspaces/{workspaceSlug}/boundary-release-evidence-intake/packet",
  "/api/release-continuity/recipient-qualification-matrix",
  "/api/release-continuity/diligence-packet-share-guard",
  "Release evidence ledger",
  "Release evidence promotion",
  "Release evidence freshness guard",
  "Release Authorization Chain",
  "Diligence Release Gate",
  "Diligence Packet Manifest",
  "Protected Boundary Release Evidence Intake Packet",
  "Recipient Qualification Matrix",
  "Diligence Packet Share Guard",
  "AAL2 smoke readiness",
  "strict protected smoke",
  "no-secret"
]) {
  requireIncludes("docs/INVESTOR_DILIGENCE.md", files["docs/INVESTOR_DILIGENCE.md"], expected);
  requireIncludes("docs/ENTERPRISE_READINESS.md", files["docs/ENTERPRISE_READINESS.md"], expected);
}

for (const expected of [
  "/api/qa-evidence/aal2-smoke-readiness",
  "/api/release-continuity/evidence-ledger",
  "/api/release-continuity/evidence-promotion",
  "/api/release-continuity/evidence-freshness-guard",
  "/api/release-continuity/authorization-chain",
  "/api/release-continuity/diligence-gate",
  "/api/release-continuity/diligence-packet-manifest",
  "/api/release-continuity/recipient-qualification-matrix",
  "/api/release-continuity/diligence-packet-share-guard",
  "Deployment Release Checklist",
  "Release Evidence Ledger",
  "Release Evidence Promotion Queue",
  "Release Evidence Freshness Guard",
  "Release Authorization Chain",
  "Diligence Release Gate",
  "Diligence Packet Manifest",
  "Recipient Qualification Matrix",
  "Diligence Packet Share Guard",
  "npm run smoke:aal2:readiness",
  "npm run smoke:aal2:durable-store:strict"
]) {
  requireIncludes("docs/release-continuity.md", files["docs/release-continuity.md"], expected);
}

for (const expected of [
  "\"smoke:enterprise-readiness\": \"node scripts/enterprise-readiness-contract-check.mjs\""
]) {
  requireIncludes("package.json", files["package.json"], expected);
}

for (const expected of [
  "scripts/enterprise-readiness-contract-check.mjs"
]) {
  requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", files["scripts/scrimed-nonsecret-test-suite.mjs"], expected);
}

console.log("pass enterprise readiness contract check");
