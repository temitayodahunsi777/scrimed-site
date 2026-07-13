import { getClinicalRobustnessLabSummary } from "./clinicalRobustnessLab";
import { getCostApiGuardrailSummary } from "./costApiGuardrails";
import { getDiligencePacketManifestSummary } from "./diligencePacketManifest";
import { getDiligencePacketShareGuardSummary } from "./diligencePacketShareGuard";
import { getDiligenceReleaseGateSummary } from "./diligenceReleaseGate";
import { getEnterpriseRiskRegisterSummary } from "./enterpriseRiskRegister";
import { getExecutionAttemptDurableStoreSummary } from "./executionAttemptDurableStore";
import { getExecutionAttemptEnvelopeSummary } from "./executionAttemptEnvelope";
import { getModelRouterSummary } from "./modelAgnosticRouter";
import { getProductReadinessRegistrySummary } from "./productReadinessRegistry";
import {
  getQaAal2SmokeReadinessPacket,
  qaAal2RunEvidenceRoute
} from "./qaAal2RunEvidence";
import { getRecipientQualificationMatrixSummary } from "./recipientQualificationMatrix";
import {
  getReleaseEvidenceLedgerSummary,
  releaseEvidenceLedgerStatus
} from "./releaseEvidenceLedger";
import { getReleaseAuthorizationChainSummary } from "./releaseAuthorizationChain";
import { getReleaseEvidenceFreshnessGuardSummary } from "./releaseEvidenceFreshnessGuard";
import { getReleaseEvidencePromotionSummary } from "./releaseEvidencePromotion";
import {
  getScrimedSafetyGovernanceSummary,
  scrimedNoGoBoundaries
} from "./scrimedSafetyGovernance";

export const investorReadinessCommandCenterRoute = "/investor-readiness";
export const investorReadinessCommandCenterApiRoute =
  "/api/investor-readiness/status";
export const investorReadinessCommandCenterStatus =
  "synthetic-demo-ready";
export const investorReadinessCommandCenterUpdatedAt = "2026-06-29";

export type EnterpriseDiligenceSnapshot = {
  company: "SCRIMED";
  status: "synthetic-demo-ready";
  phi_status: "not_enabled";
  clinical_action_status: "not_enabled";
  audit_readiness: true;
  execution_evidence_binding: true;
  deployment_readiness: "buyer_diligence_ready";
  no_go_boundaries: string[];
};

export const scrimedEnterpriseDiligenceSnapshot: EnterpriseDiligenceSnapshot = {
  company: "SCRIMED",
  status: "synthetic-demo-ready",
  phi_status: "not_enabled",
  clinical_action_status: "not_enabled",
  audit_readiness: true,
  execution_evidence_binding: true,
  deployment_readiness: "buyer_diligence_ready",
  no_go_boundaries: scrimedNoGoBoundaries
};

export function getInvestorReadinessCommandCenterSummary() {
  const safety = getScrimedSafetyGovernanceSummary();
  const costGuardrails = getCostApiGuardrailSummary();
  const modelRouter = getModelRouterSummary();
  const clinicalRobustnessLab = getClinicalRobustnessLabSummary();
  const executionEnvelope = getExecutionAttemptEnvelopeSummary();
  const durableStore = getExecutionAttemptDurableStoreSummary();
  const riskRegister = getEnterpriseRiskRegisterSummary();
  const productReadiness = getProductReadinessRegistrySummary();
  const aal2SmokeReadiness = getQaAal2SmokeReadinessPacket();
  const releaseEvidenceLedger = getReleaseEvidenceLedgerSummary();
  const releaseEvidencePromotion = getReleaseEvidencePromotionSummary();
  const releaseEvidenceFreshnessGuard = getReleaseEvidenceFreshnessGuardSummary();
  const releaseAuthorizationChain = getReleaseAuthorizationChainSummary();
  const diligenceReleaseGate = getDiligenceReleaseGateSummary();
  const diligencePacketManifest = getDiligencePacketManifestSummary();
  const diligencePacketShareGuard = getDiligencePacketShareGuardSummary();
  const recipientQualificationMatrix = getRecipientQualificationMatrixSummary();
  const deploymentReleaseChecklist = [
    {
      id: "public-production-smoke",
      label: "Public production smoke",
      status: "required-before-release",
      evidence:
        "Public smoke remains the no-secret availability and fail-closed boundary check for buyer-facing deployments.",
      command: "npm run smoke:public",
      route: "/api/release-continuity",
      humanReviewRequired: false
    },
    {
      id: "aal2-smoke-readiness-preflight",
      label: "AAL2 smoke readiness preflight",
      status: aal2SmokeReadiness.status,
      evidence:
        "No-secret readiness API exposes strict-smoke gates, safe commands, and fail-closed modes without token material.",
      command: "npm run smoke:aal2:readiness",
      route: "/api/qa-evidence/aal2-smoke-readiness",
      humanReviewRequired: true
    },
    {
      id: "strict-aal2-durable-store-smoke",
      label: "Strict AAL2 durable-store smoke",
      status: "blocked-until-human-aal2-and-feature-flag",
      evidence:
        "Authenticated durable-store record, replay, and review disposition proof remains blocked until a fresh authorized AAL2 operator token and target feature flag exist.",
      command: "npm run smoke:aal2:durable-store:strict",
      route: durableStore.apiRoute,
      humanReviewRequired: true
    },
    {
      id: "stored-vector-rpc-strict-smoke",
      label: "Stored-vector RPC strict smoke",
      status: "blocked-until-human-aal2",
      evidence:
        "Stored-vector lookup proof remains protected by the same short-lived AAL2 operator boundary.",
      command: "npm run smoke:scrimed-stored-vector-rpc:strict",
      route: aal2SmokeReadiness.routes.storedVectorRpcSmoke,
      humanReviewRequired: true
    }
  ];

  return {
    service: "scrimed-investor-readiness-command-center",
    route: investorReadinessCommandCenterRoute,
    apiRoute: investorReadinessCommandCenterApiRoute,
    status: investorReadinessCommandCenterStatus,
    updated: investorReadinessCommandCenterUpdatedAt,
    enterpriseDiligenceSnapshot: scrimedEnterpriseDiligenceSnapshot,
    deploymentStatus: {
      status: "production-deployed-confirmed-before-this-increment",
      deploymentReadiness: "buyer_diligence_ready",
      currentProductionUseBoundary:
        "Production site may show synthetic/no-PHI readiness evidence only. It is not approved for live PHI, live patient care, payer submission, patient outreach, or EHR writeback."
    },
    smokeTestStatus: {
      lastKnownStatus: "passed-confirmed-2026-06-29",
      aal2SmokeReadinessStatus: aal2SmokeReadiness.status,
      aal2StrictAttemptReady: aal2SmokeReadiness.strictAttemptReady,
      aal2ProtectedHumanRunRequired:
        aal2SmokeReadiness.protectedHumanRunRequired,
      aal2ReadinessApiRoute: aal2SmokeReadiness.routes.api,
      aal2ReadinessBriefRoute: aal2SmokeReadiness.routes.brief,
      requiredCommands: [
        "npm run smoke:clinical-robustness-lab",
        "npm run smoke:execution-attempt-durable-store",
        "npm run smoke:aal2:readiness",
        "npm run lint",
        "npm run typecheck",
        "npm run test:nonsecret",
        "npm run build"
      ],
      protectedOperatorCommands: aal2SmokeReadiness.commands,
      evidenceBoundary:
        "Smoke status is build/readiness evidence only and does not certify compliance, security, clinical validation, or customer go-live approval."
    },
    safetyStatus: {
      policyVersion: safety.policyVersion,
      status: safety.status,
      failClosedVerified: safety.selfTest.failClosedVerified,
      blockedActionCount: Object.keys(safety.blockedActions).length
    },
    phiReadinessStatus: {
      status: "not_enabled",
      boundary:
        "No live PHI workflows are enabled. PHI authority requires BAA/DPA, tenant controls, data classification, retention/deletion, incident response, and customer authorization."
    },
    clinicalReadinessStatus: {
      status: "synthetic-readiness-only",
      averageClinicalReadinessScore:
        clinicalRobustnessLab.averageClinicalReadinessScore,
      scenarioCount: clinicalRobustnessLab.scenarioCount,
      perturbationCoverage:
        `${clinicalRobustnessLab.coveredPerturbationCount}/${clinicalRobustnessLab.perturbationCount}`,
      notice: clinicalRobustnessLab.useNotice
    },
    evidenceArtifacts: [
      {
        label: "Clinical Robustness Lab",
        route: "/clinical-robustness-lab",
        apiRoute: "/api/clinical-robustness-lab",
        status: clinicalRobustnessLab.status
      },
      {
        label: "Execution Attempt Envelope",
        route: executionEnvelope.route,
        apiRoute: executionEnvelope.apiRoute,
        status: executionEnvelope.status
      },
      {
        label: "Execution Attempt Durable Store",
        route: durableStore.route,
        apiRoute: durableStore.apiRoute,
        status: durableStore.status
      },
      {
        label: "AAL2 Smoke Readiness",
        route: qaAal2RunEvidenceRoute,
        apiRoute: aal2SmokeReadiness.routes.api,
        status: aal2SmokeReadiness.status
      },
      {
        label: "Release Evidence Ledger",
        route: releaseEvidenceLedger.route,
        apiRoute: releaseEvidenceLedger.apiRoute,
        status: releaseEvidenceLedger.status
      },
      {
        label: "Release Evidence Promotion Queue",
        route: releaseEvidencePromotion.route,
        apiRoute: releaseEvidencePromotion.apiRoute,
        status: releaseEvidencePromotion.status
      },
      {
        label: "Release Evidence Freshness Guard",
        route: releaseEvidenceFreshnessGuard.route,
        apiRoute: releaseEvidenceFreshnessGuard.apiRoute,
        status: releaseEvidenceFreshnessGuard.status
      },
      {
        label: "Release Authorization Chain",
        route: releaseAuthorizationChain.route,
        apiRoute: releaseAuthorizationChain.apiRoute,
        status: releaseAuthorizationChain.status
      },
      {
        label: "Diligence Release Gate",
        route: diligenceReleaseGate.route,
        apiRoute: diligenceReleaseGate.apiRoute,
        status: diligenceReleaseGate.status
      },
      {
        label: "Diligence Packet Manifest",
        route: diligencePacketManifest.route,
        apiRoute: diligencePacketManifest.apiRoute,
        status: diligencePacketManifest.status
      },
      {
        label: "Diligence Packet Share Guard",
        route: diligencePacketShareGuard.route,
        apiRoute: diligencePacketShareGuard.apiRoute,
        status: diligencePacketShareGuard.status
      },
      {
        label: "Recipient Qualification Matrix",
        route: recipientQualificationMatrix.route,
        apiRoute: recipientQualificationMatrix.apiRoute,
        status: recipientQualificationMatrix.status
      },
      {
        label: "Enterprise Risk Register",
        route: riskRegister.route,
        apiRoute: riskRegister.apiRoute,
        status: riskRegister.status
      },
      {
        label: "Product Readiness Registry",
        route: "/product",
        apiRoute: productReadiness.apiRoute,
        status: productReadiness.status
      }
    ],
    auditLogs: {
      envelopeAuditTraceCount: executionEnvelope.auditTraceCount,
      evidenceAuditTrailCount: executionEnvelope.evidenceAuditTrailCount,
      durableStoreValidationStatus: durableStore.validation.status,
      retainedBoundary:
        "Audit evidence is metadata-only and no-PHI. It does not contain raw chart text, patient identifiers, production connector payloads, secrets, or credentials."
    },
    executionAttemptDurability: {
      protectedWritesEnabled: durableStore.protectedWritesEnabled,
      envelopeCount: durableStore.envelopeCount,
      replayReadyCount: durableStore.replayReadyCount,
      supportedReviewDispositions: durableStore.supportedReviewDispositions,
      activationControls: durableStore.activationControls.map((control) => control.gate)
    },
    aal2SmokeReadiness: {
      status: aal2SmokeReadiness.status,
      route: qaAal2RunEvidenceRoute,
      apiRoute: aal2SmokeReadiness.routes.api,
      briefRoute: aal2SmokeReadiness.routes.brief,
      strictAttemptReady: aal2SmokeReadiness.strictAttemptReady,
      protectedHumanRunRequired: aal2SmokeReadiness.protectedHumanRunRequired,
      operatorTokenRequired: aal2SmokeReadiness.operatorTokenRequired,
      targetFeatureFlagRequired: aal2SmokeReadiness.targetFeatureFlagRequired,
      gateCount: aal2SmokeReadiness.gates.length,
      commandCount: aal2SmokeReadiness.commands.length,
      noSecretBoundary: aal2SmokeReadiness.boundary
    },
    deploymentReleaseChecklist,
    releaseEvidenceLedger: {
      status: releaseEvidenceLedgerStatus,
      route: releaseEvidenceLedger.route,
      apiRoute: releaseEvidenceLedger.apiRoute,
      briefRoute: releaseEvidenceLedger.briefRoute,
      entryCount: releaseEvidenceLedger.entryCount,
      passedNoSecretCount: releaseEvidenceLedger.passedNoSecretCount,
      operatorRequiredCount: releaseEvidenceLedger.operatorRequiredCount,
      externalReviewRequiredCount:
        releaseEvidenceLedger.externalReviewRequiredCount,
      tokenMaterialCaptured: releaseEvidenceLedger.tokenMaterialCaptured,
      productionApproval: releaseEvidenceLedger.productionApproval,
      boundary: releaseEvidenceLedger.boundary
    },
    releaseEvidencePromotion: {
      status: releaseEvidencePromotion.status,
      route: releaseEvidencePromotion.route,
      apiRoute: releaseEvidencePromotion.apiRoute,
      briefRoute: releaseEvidencePromotion.briefRoute,
      queueCount: releaseEvidencePromotion.queueCount,
      shareableNoSecretCount: releaseEvidencePromotion.shareableNoSecretCount,
      operatorProofRequiredCount:
        releaseEvidencePromotion.operatorProofRequiredCount,
      externalReviewRequiredCount:
        releaseEvidencePromotion.externalReviewRequiredCount,
      tokenMaterialCaptured: releaseEvidencePromotion.tokenMaterialCaptured,
      productionApproval: releaseEvidencePromotion.productionApproval,
      buyerDistributionAuthority:
        releaseEvidencePromotion.buyerDistributionAuthority,
      externalDistributionAuthority:
        releaseEvidencePromotion.externalDistributionAuthority,
      publicClaimAuthority: releaseEvidencePromotion.publicClaimAuthority,
      boundary: releaseEvidencePromotion.boundary
    },
    releaseEvidenceFreshnessGuard: {
      status: releaseEvidenceFreshnessGuard.status,
      route: releaseEvidenceFreshnessGuard.route,
      apiRoute: releaseEvidenceFreshnessGuard.apiRoute,
      briefRoute: releaseEvidenceFreshnessGuard.briefRoute,
      freshnessHash: releaseEvidenceFreshnessGuard.freshnessHash,
      freshnessAuthority: releaseEvidenceFreshnessGuard.freshnessAuthority,
      publicDistributionAuthority:
        releaseEvidenceFreshnessGuard.publicDistributionAuthority,
      customerSpecificAuthority:
        releaseEvidenceFreshnessGuard.customerSpecificAuthority,
      cardCount: releaseEvidenceFreshnessGuard.cardCount,
      internalFreshCount: releaseEvidenceFreshnessGuard.internalFreshCount,
      refreshRequiredCount: releaseEvidenceFreshnessGuard.refreshRequiredCount,
      humanAal2RefreshCount:
        releaseEvidenceFreshnessGuard.humanAal2RefreshCount,
      qualifiedReviewRefreshCount:
        releaseEvidenceFreshnessGuard.qualifiedReviewRefreshCount,
      tokenMaterialCaptured:
        releaseEvidenceFreshnessGuard.tokenMaterialCaptured,
      productionApproval: releaseEvidenceFreshnessGuard.productionApproval,
      clinicalCareAuthority: releaseEvidenceFreshnessGuard.clinicalCareAuthority,
      phiAuthority: releaseEvidenceFreshnessGuard.phiAuthority,
      securityCertification: releaseEvidenceFreshnessGuard.securityCertification,
      boundary: releaseEvidenceFreshnessGuard.boundary
    },
    diligenceReleaseGate: {
      status: diligenceReleaseGate.status,
      route: diligenceReleaseGate.route,
      apiRoute: diligenceReleaseGate.apiRoute,
      briefRoute: diligenceReleaseGate.briefRoute,
      buyerDiligenceGate: diligenceReleaseGate.buyerDiligenceGate,
      protectedAal2Gate: diligenceReleaseGate.protectedAal2Gate,
      publicDistributionGate: diligenceReleaseGate.publicDistributionGate,
      productionReleaseGate: diligenceReleaseGate.productionReleaseGate,
      clinicalProductionGate: diligenceReleaseGate.clinicalProductionGate,
      gateCount: diligenceReleaseGate.gateCount,
      goCount: diligenceReleaseGate.goCount,
      reviewRequiredCount: diligenceReleaseGate.reviewRequiredCount,
      noGoCount: diligenceReleaseGate.noGoCount,
      tokenMaterialCaptured: diligenceReleaseGate.tokenMaterialCaptured,
      productionApproval: diligenceReleaseGate.productionApproval,
      boundary: diligenceReleaseGate.boundary
    },
    diligencePacketManifest: {
      status: diligencePacketManifest.status,
      route: diligencePacketManifest.route,
      apiRoute: diligencePacketManifest.apiRoute,
      briefRoute: diligencePacketManifest.briefRoute,
      manifestHash: diligencePacketManifest.manifestHash,
      packetUseAuthority: diligencePacketManifest.packetUseAuthority,
      publicDistributionAuthority:
        diligencePacketManifest.publicDistributionAuthority,
      clinicalCareAuthority: diligencePacketManifest.clinicalCareAuthority,
      phiAuthority: diligencePacketManifest.phiAuthority,
      securityCertification: diligencePacketManifest.securityCertification,
      itemCount: diligencePacketManifest.itemCount,
      includeNoSecretCount: diligencePacketManifest.includeNoSecretCount,
      summaryOnlyCount: diligencePacketManifest.summaryOnlyCount,
      withholdUntilHumanAal2Count:
        diligencePacketManifest.withholdUntilHumanAal2Count,
      withholdUntilQualifiedReviewCount:
        diligencePacketManifest.withholdUntilQualifiedReviewCount,
      noGoCount: diligencePacketManifest.noGoCount,
      tokenMaterialCaptured: diligencePacketManifest.tokenMaterialCaptured,
      productionApproval: diligencePacketManifest.productionApproval,
      boundary: diligencePacketManifest.boundary
    },
    diligencePacketShareGuard: {
      status: diligencePacketShareGuard.status,
      route: diligencePacketShareGuard.route,
      apiRoute: diligencePacketShareGuard.apiRoute,
      briefRoute: diligencePacketShareGuard.briefRoute,
      guardHash: diligencePacketShareGuard.guardHash,
      externalShareAuthority: diligencePacketShareGuard.externalShareAuthority,
      recipientAuthorizationAuthority:
        diligencePacketShareGuard.recipientAuthorizationAuthority,
      publicDistributionAuthority:
        diligencePacketShareGuard.publicDistributionAuthority,
      customerSpecificAuthority:
        diligencePacketShareGuard.customerSpecificAuthority,
      clinicalCareAuthority: diligencePacketShareGuard.clinicalCareAuthority,
      phiAuthority: diligencePacketShareGuard.phiAuthority,
      securityCertification: diligencePacketShareGuard.securityCertification,
      cardCount: diligencePacketShareGuard.cardCount,
      noGoCount: diligencePacketShareGuard.noGoCount,
      reviewRequiredCount: diligencePacketShareGuard.reviewRequiredCount,
      internalAllowCount: diligencePacketShareGuard.internalAllowCount,
      tokenMaterialCaptured: diligencePacketShareGuard.tokenMaterialCaptured,
      productionApproval: diligencePacketShareGuard.productionApproval,
      boundary: diligencePacketShareGuard.boundary
    },
    recipientQualificationMatrix: {
      status: recipientQualificationMatrix.status,
      route: recipientQualificationMatrix.route,
      apiRoute: recipientQualificationMatrix.apiRoute,
      briefRoute: recipientQualificationMatrix.briefRoute,
      qualificationHash: recipientQualificationMatrix.qualificationHash,
      externalShareAuthority:
        recipientQualificationMatrix.externalShareAuthority,
      publicDistributionAuthority:
        recipientQualificationMatrix.publicDistributionAuthority,
      recipientIdentifierStorage:
        recipientQualificationMatrix.recipientIdentifierStorage,
      customerSpecificAuthority:
        recipientQualificationMatrix.customerSpecificAuthority,
      clinicalCareAuthority: recipientQualificationMatrix.clinicalCareAuthority,
      phiAuthority: recipientQualificationMatrix.phiAuthority,
      securityCertification: recipientQualificationMatrix.securityCertification,
      recipientClassCount: recipientQualificationMatrix.recipientClassCount,
      qualifiedReviewRequiredCount:
        recipientQualificationMatrix.qualifiedReviewRequiredCount,
      blockedRecipientCount: recipientQualificationMatrix.blockedRecipientCount,
      revocationRequiredCount:
        recipientQualificationMatrix.revocationRequiredCount,
      tokenMaterialCaptured: recipientQualificationMatrix.tokenMaterialCaptured,
      productionApproval: recipientQualificationMatrix.productionApproval,
      boundary: recipientQualificationMatrix.boundary
    },
    releaseAuthorizationChain: {
      status: releaseAuthorizationChain.status,
      route: releaseAuthorizationChain.route,
      apiRoute: releaseAuthorizationChain.apiRoute,
      briefRoute: releaseAuthorizationChain.briefRoute,
      authorizationHash: releaseAuthorizationChain.authorizationHash,
      safeUseLabel: releaseAuthorizationChain.safeUseLabel,
      chainDecision: releaseAuthorizationChain.chainDecision,
      weakestLink: releaseAuthorizationChain.weakestLink,
      buyerDiligenceMetadataLane:
        releaseAuthorizationChain.buyerDiligenceMetadataLane,
      protectedProofLane: releaseAuthorizationChain.protectedProofLane,
      publicDistributionAuthority:
        releaseAuthorizationChain.publicDistributionAuthority,
      customerSpecificAuthority:
        releaseAuthorizationChain.customerSpecificAuthority,
      releaseAuthority: releaseAuthorizationChain.releaseAuthority,
      clinicalCareAuthority: releaseAuthorizationChain.clinicalCareAuthority,
      phiAuthority: releaseAuthorizationChain.phiAuthority,
      securityCertification: releaseAuthorizationChain.securityCertification,
      controlCount: releaseAuthorizationChain.controlCount,
      passedNoSecretCount: releaseAuthorizationChain.passedNoSecretCount,
      humanReviewRequiredCount:
        releaseAuthorizationChain.humanReviewRequiredCount,
      operatorRequiredCount: releaseAuthorizationChain.operatorRequiredCount,
      externalReviewRequiredCount:
        releaseAuthorizationChain.externalReviewRequiredCount,
      blockedByDesignCount: releaseAuthorizationChain.blockedByDesignCount,
      tokenMaterialCaptured: releaseAuthorizationChain.tokenMaterialCaptured,
      productionApproval: releaseAuthorizationChain.productionApproval,
      boundary: releaseAuthorizationChain.boundary
    },
    modelProviderReadiness: {
      status: modelRouter.status,
      supportedTiers: modelRouter.supportedTiers,
      providerCount: modelRouter.providers.length,
      externalCallsEnabled: modelRouter.externalCallsEnabled,
      noSecretTestMode: modelRouter.noSecretTestMode,
      costGuardrails: {
        version: costGuardrails.version,
        failClosedVerified: costGuardrails.failClosedVerified,
        providerCallsEnabled: costGuardrails.config.providerCallsEnabled,
        costGuardrailsEnabled: costGuardrails.config.costGuardrailsEnabled
      }
    },
    integrationReadiness: {
      currentStatus: "synthetic-and-metadata-only",
      readyFor:
        "FHIR/HL7/DICOM/X12 architecture review, buyer diligence, and no-PHI connector planning.",
      notReadyFor:
        "Production EHR writeback, payer submission, patient outreach, device ingestion, live scheduling, or customer connector activation."
    },
    knownNoGoBoundaries: scrimedEnterpriseDiligenceSnapshot.no_go_boundaries,
    nextMilestones: [
      "Run /api/release-continuity/authorization-chain before any external packet reference so the weakest-link state is visible across evidence, freshness, manifest, recipient, share, and AAL2 controls.",
      "Run /api/release-continuity/evidence-freshness-guard before evidence is reused in buyer, investor, clinical, security, public, or customer-specific contexts.",
      "Use /api/release-continuity/recipient-qualification-matrix before external packet references so recipient class, expiry, revocation, and no-identifier storage are explicit.",
      "Use /api/release-continuity/diligence-packet-share-guard before buyer, investor, public, customer-specific, clinical, or security packet references leave SCRIMED.",
      "Use /api/release-continuity/diligence-packet-manifest to assemble buyer and investor packets from allowed no-secret fields while withholding AAL2 proof, public claims, certification claims, PHI, and clinical authority.",
      "Use the Diligence Release Gate to present no-secret buyer-diligence GO items separately from AAL2, public-distribution, production, and clinical NO-GO items.",
      "Use the Release Evidence Promotion Queue to separate shareable metadata, operator proof blockers, and qualified-review blockers before buyer distribution.",
      "Promote AAL2 smoke readiness and strict-smoke outcomes into protected buyer workspaces with tenant RBAC.",
      "Add OAuth scoped-token MCP gateway with revocation and tool-level authorization.",
      "Add reviewer-calibrated evaluation datasets and release-blocking regression checks.",
      "Prepare legal, privacy, security, and clinical governance packets before any PHI or production connector approval."
    ],
    riskRegister: {
      riskCount: riskRegister.riskCount,
      criticalCount: riskRegister.criticalCount,
      blockedBeforeProductionCount: riskRegister.blockedBeforeProductionCount,
      apiRoute: riskRegister.apiRoute
    },
    productReadiness: {
      productCount: productReadiness.productCount,
      stageCounts: productReadiness.stageCounts,
      apiRoute: productReadiness.apiRoute
    },
    boundary:
      "Investor Readiness Command Center is a no-PHI diligence and operating-readiness surface. It is not investment advice, securities material, audited financial reporting, compliance certification, clinical validation, live patient-care authority, PHI authority, customer go-live approval, or production connector approval."
  };
}

export function buildInvestorReadinessCommandCenterBrief() {
  const summary = getInvestorReadinessCommandCenterSummary();

  return [
    "# SCRIMED Investor Readiness Command Center",
    "",
    `Status: ${summary.status}`,
    `Updated: ${summary.updated}`,
    `Snapshot: ${JSON.stringify(summary.enterpriseDiligenceSnapshot)}`,
    "",
    "## Deployment",
    `- ${summary.deploymentStatus.deploymentReadiness}: ${summary.deploymentStatus.currentProductionUseBoundary}`,
    "",
    "## Safety",
    `- Policy: ${summary.safetyStatus.policyVersion}`,
    `- Fail closed verified: ${summary.safetyStatus.failClosedVerified}`,
    `- PHI: ${summary.phiReadinessStatus.status}`,
    `- Clinical action: ${summary.enterpriseDiligenceSnapshot.clinical_action_status}`,
    "",
    "## Evidence",
    ...summary.evidenceArtifacts.map(
      (artifact) => `- ${artifact.label}: ${artifact.status} (${artifact.apiRoute})`
    ),
    "",
    "## AAL2 Smoke Readiness",
    `- Status: ${summary.aal2SmokeReadiness.status}`,
    `- Strict attempt ready: ${summary.aal2SmokeReadiness.strictAttemptReady}`,
    `- Human run required: ${summary.aal2SmokeReadiness.protectedHumanRunRequired}`,
    `- API: ${summary.aal2SmokeReadiness.apiRoute}`,
    "",
    "## Deployment Release Checklist",
    ...summary.deploymentReleaseChecklist.map(
      (item) =>
        `- ${item.label} (${item.status}): ${item.command} via ${item.route}. Human review required: ${item.humanReviewRequired}`
    ),
    "",
    "## Release Evidence Ledger",
    `- Status: ${summary.releaseEvidenceLedger.status}`,
    `- Entries: ${summary.releaseEvidenceLedger.entryCount}`,
    `- Passed no-secret: ${summary.releaseEvidenceLedger.passedNoSecretCount}`,
    `- Operator required: ${summary.releaseEvidenceLedger.operatorRequiredCount}`,
    `- API: ${summary.releaseEvidenceLedger.apiRoute}`,
    "",
    "## Release Evidence Promotion Queue",
    `- Status: ${summary.releaseEvidencePromotion.status}`,
    `- Queue entries: ${summary.releaseEvidencePromotion.queueCount}`,
    `- Shareable no-secret: ${summary.releaseEvidencePromotion.shareableNoSecretCount}`,
    `- Operator proof required: ${summary.releaseEvidencePromotion.operatorProofRequiredCount}`,
    `- External review required: ${summary.releaseEvidencePromotion.externalReviewRequiredCount}`,
    `- API: ${summary.releaseEvidencePromotion.apiRoute}`,
    "",
    "## Release Evidence Freshness Guard",
    `- Status: ${summary.releaseEvidenceFreshnessGuard.status}`,
    `- Freshness hash: ${summary.releaseEvidenceFreshnessGuard.freshnessHash}`,
    `- Freshness authority: ${summary.releaseEvidenceFreshnessGuard.freshnessAuthority}`,
    `- Cards: ${summary.releaseEvidenceFreshnessGuard.cardCount}`,
    `- Internal fresh: ${summary.releaseEvidenceFreshnessGuard.internalFreshCount}`,
    `- Refresh required: ${summary.releaseEvidenceFreshnessGuard.refreshRequiredCount}`,
    `- Human AAL2 refresh: ${summary.releaseEvidenceFreshnessGuard.humanAal2RefreshCount}`,
    `- Qualified review refresh: ${summary.releaseEvidenceFreshnessGuard.qualifiedReviewRefreshCount}`,
    `- API: ${summary.releaseEvidenceFreshnessGuard.apiRoute}`,
    "",
    "## Release Authorization Chain",
    `- Status: ${summary.releaseAuthorizationChain.status}`,
    `- Chain decision: ${summary.releaseAuthorizationChain.chainDecision}`,
    `- Weakest link: ${summary.releaseAuthorizationChain.weakestLink}`,
    `- Authorization hash: ${summary.releaseAuthorizationChain.authorizationHash}`,
    `- Safe use: ${summary.releaseAuthorizationChain.safeUseLabel}`,
    `- Controls: ${summary.releaseAuthorizationChain.controlCount}`,
    `- Passed no-secret: ${summary.releaseAuthorizationChain.passedNoSecretCount}`,
    `- Human review required: ${summary.releaseAuthorizationChain.humanReviewRequiredCount}`,
    `- Operator required: ${summary.releaseAuthorizationChain.operatorRequiredCount}`,
    `- External review required: ${summary.releaseAuthorizationChain.externalReviewRequiredCount}`,
    `- Blocked by design: ${summary.releaseAuthorizationChain.blockedByDesignCount}`,
    `- API: ${summary.releaseAuthorizationChain.apiRoute}`,
    "",
    "## Diligence Release Gate",
    `- Status: ${summary.diligenceReleaseGate.status}`,
    `- Buyer diligence: ${summary.diligenceReleaseGate.buyerDiligenceGate}`,
    `- Protected AAL2: ${summary.diligenceReleaseGate.protectedAal2Gate}`,
    `- Public distribution: ${summary.diligenceReleaseGate.publicDistributionGate}`,
    `- Production release: ${summary.diligenceReleaseGate.productionReleaseGate}`,
    `- Clinical production: ${summary.diligenceReleaseGate.clinicalProductionGate}`,
    `- API: ${summary.diligenceReleaseGate.apiRoute}`,
    "",
    "## Diligence Packet Manifest",
    `- Status: ${summary.diligencePacketManifest.status}`,
    `- Manifest hash: ${summary.diligencePacketManifest.manifestHash}`,
    `- Packet use authority: ${summary.diligencePacketManifest.packetUseAuthority}`,
    `- Public distribution: ${summary.diligencePacketManifest.publicDistributionAuthority}`,
    `- Packet items: ${summary.diligencePacketManifest.itemCount}`,
    `- Withhold human AAL2: ${summary.diligencePacketManifest.withholdUntilHumanAal2Count}`,
    `- Withhold qualified review: ${summary.diligencePacketManifest.withholdUntilQualifiedReviewCount}`,
    `- API: ${summary.diligencePacketManifest.apiRoute}`,
    "",
    "## Diligence Packet Share Guard",
    `- Status: ${summary.diligencePacketShareGuard.status}`,
    `- Guard hash: ${summary.diligencePacketShareGuard.guardHash}`,
    `- External share: ${summary.diligencePacketShareGuard.externalShareAuthority}`,
    `- Recipient authorization: ${summary.diligencePacketShareGuard.recipientAuthorizationAuthority}`,
    `- Public distribution: ${summary.diligencePacketShareGuard.publicDistributionAuthority}`,
    `- Share cards: ${summary.diligencePacketShareGuard.cardCount}`,
    `- Review required: ${summary.diligencePacketShareGuard.reviewRequiredCount}`,
    `- API: ${summary.diligencePacketShareGuard.apiRoute}`,
    "",
    "## Recipient Qualification Matrix",
    `- Status: ${summary.recipientQualificationMatrix.status}`,
    `- Qualification hash: ${summary.recipientQualificationMatrix.qualificationHash}`,
    `- External share: ${summary.recipientQualificationMatrix.externalShareAuthority}`,
    `- Recipient identifier storage: ${summary.recipientQualificationMatrix.recipientIdentifierStorage}`,
    `- Recipient classes: ${summary.recipientQualificationMatrix.recipientClassCount}`,
    `- Blocked recipients: ${summary.recipientQualificationMatrix.blockedRecipientCount}`,
    `- Revocation policies: ${summary.recipientQualificationMatrix.revocationRequiredCount}`,
    `- API: ${summary.recipientQualificationMatrix.apiRoute}`,
    "",
    "## Model and Cost Guardrails",
    `- Router: ${summary.modelProviderReadiness.status}`,
    `- External calls enabled: ${summary.modelProviderReadiness.externalCallsEnabled}`,
    `- Cost guardrails enabled: ${summary.modelProviderReadiness.costGuardrails.costGuardrailsEnabled}`,
    "",
    "## NO-GO Boundaries",
    ...summary.knownNoGoBoundaries.map((boundary) => `- ${boundary}`),
    "",
    "## Next Milestones",
    ...summary.nextMilestones.map((milestone) => `- ${milestone}`),
    "",
    "## Boundary",
    summary.boundary,
    ""
  ].join("\n");
}
