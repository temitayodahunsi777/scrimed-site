import { agentWorkflows, getAgentWorkflowSummary } from "./agentWorkflows";
import { getAgentEvaluationWorkspaceSummary } from "./agentEvaluationWorkspace";
import { getAgentOSSummary } from "./agentOS";
import { getAtlasIntelligenceCoreSummary } from "./atlasIntelligenceCore";
import { getCommercialStrategySummary } from "./commercialStrategy";
import { getCompanyOperationsSummary } from "./companyOperations";
import { getRuntimeSafetyReadinessSummary } from "./runtimeSafetyReadiness";
import { getWorkflowExecutionContractSummary } from "./workflowExecutionContracts";
import { getWorkflowExecutionResultSummary } from "./workflowExecutionResults";
import { getWorkflowExecutionSummary, workflowExecutions } from "./workflowExecutions";
import { getWorkflowResultValidationResults } from "./workflowResultValidation";
import { getQualityGateSummary } from "./qualityGates";
import { getInteroperabilitySummary } from "./interoperabilityStandards";
import { getInteroperabilityConformanceEvaluationSummary } from "./interoperabilityConformanceEvaluations";
import { getDemoPilotProgramSummary } from "./demoPilotPrograms";
import {
  getPilotDemoCommercialReadinessSummary,
  pilotDemoCommercialReadinessBriefStatus,
  pilotDemoCommercialReadinessStatus
} from "./pilotDemoCommercialReadiness";
import { getEnterpriseReadinessSummary } from "./enterpriseReadiness";
import { getProtectedPilotWorkspaceSummary } from "./protectedPilotWorkspace";
import { getSalesOperationsSummary } from "./salesOperations";
import { getTrustOSSummary } from "./trustOS";
import { getPersistentAgentWorkspaceSummary } from "./persistentAgentWorkspace";
import { getScrimedOperatingCommandCenterSummary } from "./scrimedOperatingCommandCenter";
import { getStrategicPlatformIntelligenceSummary } from "./strategicPlatformIntelligence";
import { getCompetitiveMarketIntelligenceSummary } from "./competitiveMarketIntelligence";
import { getDeploymentProfileSummary } from "./deploymentProfiles";
import { getMarketActivationSummary } from "./marketActivation";
import {
  getGlobalPartnerLocalizationSummary,
  globalPartnerLocalizationBriefStatus,
  globalPartnerLocalizationStatus
} from "./globalPartnerLocalization";
import {
  getGlobalEnterpriseCommandSummary,
  globalEnterpriseCommandBriefStatus,
  globalEnterpriseCommandStatus
} from "./globalEnterpriseCommand";
import {
  approvalsReadinessBriefStatus,
  approvalsReadinessStatus,
  getApprovalsReadinessSummary
} from "./approvalsReadiness";
import {
  getGlobalCertificationReadinessSummary,
  globalCertificationReadinessBriefStatus,
  globalCertificationReadinessStatus
} from "./globalCertificationReadiness";
import { getHealthcareIntelligenceOSSummary } from "./healthcareIntelligenceOS";
import {
  getHealthRecordsSafetyExchangeSummary,
  healthRecordsSafetyExchangeBriefStatus,
  healthRecordsSafetyExchangeExtractionStatus,
  healthRecordsSafetyExchangeStatus
} from "./healthRecordsSafetyExchange";
import {
  continuousReviewAuditBriefStatus,
  continuousReviewAuditStatus,
  getContinuousReviewAuditSummary
} from "./continuousReviewAudit";
import {
  getReleaseContinuitySummary,
  releaseContinuityBriefProofStackStatus,
  releaseContinuityProofStackStatus
} from "./releaseContinuity";
import { getScrimedBuildInfo } from "./release/vercelReleaseAssurance";
import { getP34PreviewAcceptanceSummary } from "./release/previewAcceptance";
import {
  getNavigationAuditSummary,
  navigationAuditBriefProofStackStatus,
  navigationAuditProofStackStatus
} from "./navigationAudit";
import {
  getServiceReliabilitySummary,
  serviceReliabilityBriefProofStackStatus,
  serviceReliabilityProofStackStatus
} from "./serviceReliability";
import {
  getOperationalEfficiencySummary,
  operationalEfficiencyBriefStatus,
  operationalEfficiencyStatus
} from "./operationalEfficiency";
import {
  getScrimedAutomationAutopilotSummary,
  scrimedAutomationAutopilotBriefStatus,
  scrimedAutomationAutopilotStatus
} from "./scrimedAutomationAutopilot";
import {
  getStrategicProblemResolutionSummary,
  strategicProblemResolutionBriefStatus,
  strategicProblemResolutionStatus
} from "./strategicProblemResolution";
import {
  getHealthcareOptimizationCommandSummary,
  healthcareOptimizationCommandBriefStatus,
  healthcareOptimizationCommandStatus
} from "./healthcareOptimizationCommand";
import {
  getHealthcareValueRealizationSummary,
  healthcareValueRealizationBriefStatus,
  healthcareValueRealizationStatus
} from "./healthcareValueRealization";
import {
  getPilotValueEvidenceSummary,
  pilotValueEvidenceBriefStatus,
  pilotValueEvidenceStatus
} from "./pilotValueEvidence";
import {
  getPilotActivationPlannerSummary,
  pilotActivationPlannerBriefStatus,
  pilotActivationPlannerStatus
} from "./pilotActivationPlanner";
import {
  getPilotHandoffCommandSummary,
  pilotHandoffCommandBriefStatus,
  pilotHandoffCommandStatus
} from "./pilotHandoffCommand";
import {
  getPilotSuccessReviewCommandSummary,
  pilotSuccessReviewCommandBriefStatus,
  pilotSuccessReviewCommandStatus
} from "./pilotSuccessReviewCommand";
import {
  getLimitationsWorkaroundSummary,
  limitationsWorkaroundBriefStatus,
  limitationsWorkaroundStatus
} from "./limitationsWorkaroundOperations";
import {
  getInvestorAudienceReadinessSummary,
  investorAudienceReadinessBriefStatus,
  investorAudienceReadinessStatus
} from "./investorAudienceReadiness";
import {
  getLaunchReadinessSummary,
  launchReadinessBriefStatus,
  launchReadinessStatus
} from "./launchReadinessOperations";
import {
  competitiveDefenseBriefStatus,
  competitiveDefenseStatus,
  getCompetitiveDefenseSummary
} from "./competitiveDefense";
import {
  capitalVitalityBriefProofStackStatus,
  capitalVitalityProofStackStatus,
  getCapitalVitalitySummary
} from "./capitalVitality";
import {
  getGrowthEngineSummary,
  growthEngineBriefProofStackStatus,
  growthEngineProofStackStatus
} from "./growthEngine";
import {
  companyAssessmentBriefStatus,
  companyAssessmentStatus,
  getCompanyAssessmentSummary
} from "./companyAssessment";
import {
  clinicalProductionReadinessBriefStatus,
  clinicalProductionReadinessStatus,
  getClinicalProductionReadinessSummary
} from "./clinicalProductionReadiness";
import {
  getProductServicePortfolioSummary,
  productServicePortfolioBriefStatus,
  productServicePortfolioStatus
} from "./productServicePortfolio";
import {
  getServiceDeliverySummary,
  serviceDeliveryBriefStatus,
  serviceDeliveryStatus
} from "./serviceDelivery";
import {
  clientOnboardingCommunicationsBriefStatus,
  clientOnboardingCommunicationsStatus,
  getClientOnboardingCommunicationsSummary
} from "./clientOnboardingCommunications";
import {
  enterpriseBusinessOpsBriefStatus,
  enterpriseBusinessOpsStatus,
  getEnterpriseBusinessOpsSummary
} from "./enterpriseBusinessOperations";
import {
  enterpriseScalabilityOperationsBriefStatus,
  enterpriseScalabilityOperationsStatus,
  getEnterpriseScalabilityOperationsSummary
} from "./enterpriseScalabilityOperations";
import {
  getPlatformPowerSummary,
  platformPowerBriefStatus,
  platformPowerStatus
} from "./platformPowerOperations";
import {
  getProductionArchitectureSummary,
  productionArchitectureBriefStatus,
  productionArchitectureStatus
} from "./productionArchitecture";
import {
  executionAttemptEnvelopeBriefStatus,
  executionAttemptEnvelopeStatus,
  getExecutionAttemptEnvelopeSummary
} from "./executionAttemptEnvelope";
import {
  executionAttemptDurableStoreBriefStatus,
  executionAttemptDurableStoreStatus,
  getExecutionAttemptDurableStoreSummary
} from "./executionAttemptDurableStore";
import {
  boundaryResolutionBriefProofStackStatus,
  boundaryResolutionProofStackStatus,
  getBoundaryResolutionSummary
} from "./boundaryResolution";
import {
  clinicalAuthorityReadinessBriefStatus,
  clinicalAuthorityReadinessStatus,
  getClinicalAuthorityReadinessSummary
} from "./clinicalAuthorityReadiness";
import { getSalesAttributionSummary } from "./salesAttribution";
import { getSourceIntelligenceSummary } from "./sourceIntelligence";
import { getAttributionAnalyticsSummary } from "./attributionAnalytics";
import { getTrustSafetyOperationsSummary } from "./trustSafetyOperations";
import { getP33IntegratedSummary } from "./scrimed-p33/index";
import { getP34AdaptiveGovernanceSummary } from "./scrimed-p34/index";
import { getP34ReviewReadinessSummary } from "./scrimed-p34/reviewReadiness";
import { getSyntheticPilotReadinessSummary } from "./commercial/syntheticPilotReadiness";
import {
  pilotDemoReadinessPacketProofStackStatus,
  pilotDemoReadinessProofStackStatus
} from "./pilotDemoReadiness";
import {
  buyerPilotRoomCompetitiveEdges,
  buyerPilotRoomPacketProofStackStatus,
  buyerPilotRoomProofStackStatus
} from "./buyerPilotRoom";
import {
  commandIntelligenceHubProofStackStatus,
  commandIntelligencePacketProofStackStatus,
  commandIntelligenceSnapshotProofStackStatus
} from "./commandIntelligenceHub";
import {
  getSalesDealRoomSummary,
  salesDealRoomPacketProofStackStatus,
  salesDealRoomProofStackStatus
} from "./salesDealRoom";
import {
  salesCommandCenterApiRoute,
  salesCommandCenterProofStackStatus
} from "./salesCommandCenter";
import {
  opportunityWorkspaceProvisioningPacketProofStackStatus,
  opportunityWorkspaceProvisioningProofStackStatus
} from "./opportunityWorkspaceProvisioning";
import {
  buyerTenantLifecyclePacketProofStackStatus,
  buyerTenantLifecycleProofStackStatus
} from "./buyerTenantLifecycle";
import {
  productionActivationReadinessPacketProofStackStatus,
  productionActivationReadinessProofStackStatus
} from "./productionActivationReadiness";
import {
  customerActivationApprovalsPacketProofStackStatus,
  customerActivationApprovalsProofStackStatus
} from "./customerActivationApprovals";
import {
  buyerDiligenceRoomPacketProofStackStatus,
  buyerDiligenceRoomProofStackStatus
} from "./buyerDiligenceRoom";
import {
  secureEvidenceVaultReadinessPacketProofStackStatus,
  secureEvidenceVaultReadinessProofStackStatus
} from "./secureEvidenceVaultReadiness";
import {
  buyerDemoExecutionBriefApiRoute,
  buyerDemoExecutionBriefProofStackStatus,
  buyerDemoExecutionPathApiRoute,
  buyerDemoExecutionPathProofStackStatus
} from "./buyerDemoExecutionPath";
import {
  buyerDemoSessionPacketApiRoute,
  buyerDemoSessionPacketProofStackStatus,
  buyerDemoSessionProofStackStatus,
  buyerDemoSessionsApiRoute
} from "./buyerDemoSessions";
import {
  salesDemoSessionQaApiRoute,
  salesDemoSessionQaProofStackStatus,
  salesDemoSessionQaTokenPolicyStatus
} from "./salesDemoSessionQa";
import {
  getQaEvidenceLedger,
  qaAuthorityReferenceEvidenceBridgeStatus,
  qaEvidenceActivationPlanStatus,
  qaEvidenceLedgerProofStackStatus,
  qaManualRunEvidencePersistenceStatus
} from "./qaEvidenceLedger";
import {
  getQaExecutionReadinessSummary,
  qaExecutionReadinessBriefProofStackStatus,
  qaExecutionReadinessProofStackStatus
} from "./qaExecutionReadiness";
import {
  getQaRunControlSummary,
  qaRunControlBriefProofStackStatus,
  qaRunControlProofStackStatus
} from "./qaRunControl";
import {
  getQaLaunchKitSummary,
  qaLaunchKitBriefProofStackStatus,
  qaLaunchKitProofStackStatus
} from "./qaLaunchKit";
import {
  getQaHumanRunPacketSummary,
  qaHumanRunPacketBriefProofStackStatus,
  qaHumanRunPacketProofStackStatus
} from "./qaHumanRunPacket";
import {
  getQaCompletionBridgeSummary,
  qaCompletionBridgeBriefProofStackStatus,
  qaCompletionBridgeProofStackStatus
} from "./qaCompletionBridge";
import {
  getQaClaimGuardSummary,
  qaClaimGuardBriefProofStackStatus,
  qaClaimGuardProofStackStatus
} from "./qaClaimGuard";
import {
  getQaActivationSealSummary,
  qaActivationSealBriefProofStackStatus,
  qaActivationSealProofStackStatus
} from "./qaActivationSeal";
import {
  getQaProofPromotionSummary,
  qaProofPromotionBriefProofStackStatus,
  qaProofPromotionProofStackStatus
} from "./qaProofPromotion";
import {
  getQaBuyerProofReleaseSummary,
  qaBuyerProofReleaseBriefProofStackStatus,
  qaBuyerProofReleaseProofStackStatus
} from "./qaBuyerProofRelease";
import {
  buyerReleaseControlRunBriefProofStackStatus,
  buyerReleaseControlRunProofStackStatus,
  getBuyerReleaseControlRunSummary
} from "./buyerReleaseControlRun";
import {
  protectedBuyerReleaseControlRunPacketProofStackStatus,
  protectedBuyerReleaseControlRunProofStackStatus
} from "./protectedBuyerReleaseControlRun";
import {
  protectedBuyerReleaseReadinessTimelineProofStackStatus
} from "./protectedBuyerReleaseReadinessTimeline";
import {
  getQaManualExecutionConsoleSummary,
  qaManualExecutionConsoleBriefProofStackStatus,
  qaManualExecutionConsoleProofStackStatus
} from "./qaManualExecutionConsole";
import {
  clinicalCareActivationProofStackStatus,
  getClinicalCareActivationSummary
} from "./clinicalCareActivation";
import { clinicalActivationDossierProofStackStatus } from "./clinicalActivationDossier";
import { clinicalActivationApprovalWorkflowProofStackStatus } from "./clinicalActivationApprovals";
import {
  getPublicMarketReadinessSummary,
  publicMarketReadinessBriefProofStackStatus,
  publicMarketReadinessProofStackStatus
} from "./publicMarketReadiness";
import { protectedOperatorMetricCaptureStatus } from "./protectedOperatorMetrics";
import {
  protectedMetricRollupPacketProofStackStatus,
  protectedMetricRollupStatus
} from "./protectedMetricRollups";
import {
  protectedMetricTrendPacketProofStackStatus,
  protectedMetricTrendReviewStatus
} from "./protectedMetricTrends";
import {
  protectedBoardScorecardPacketProofStackStatus,
  protectedBoardScorecardStatus
} from "./protectedBoardScorecards";
import {
  protectedFinanceMethodologyPacketProofStackStatus,
  protectedFinanceMethodologyStatus
} from "./protectedFinanceMethodology";
import {
  protectedExternalApprovalEvidencePacketProofStackStatus,
  protectedExternalApprovalEvidenceStatus
} from "./protectedExternalApprovalEvidence";
import {
  protectedReleaseDecisionPacketProofStackStatus,
  protectedReleaseDecisionWorkflowStatus
} from "./protectedReleaseDecisionWorkflow";
import {
  protectedNamedReviewerSignoffPacketProofStackStatus,
  protectedNamedReviewerSignoffStatus
} from "./protectedNamedReviewerSignoffs";
import {
  protectedDistributionLockboxPacketProofStackStatus,
  protectedDistributionLockboxStatus
} from "./protectedDistributionLockbox";
import {
  protectedReleaseAuthorityAttestationPacketProofStackStatus,
  protectedReleaseAuthorityAttestationStatus
} from "./protectedReleaseAuthorityAttestations";
import {
  protectedEvidenceRoomRecipientAttestationPacketProofStackStatus,
  protectedEvidenceRoomRecipientAttestationStatus
} from "./protectedEvidenceRoomRecipientAttestations";
import {
  protectedEvidenceRoomAccessLogReconciliationPacketProofStackStatus,
  protectedEvidenceRoomAccessLogReconciliationStatus
} from "./protectedEvidenceRoomAccessLogReconciliation";
import {
  protectedEvidenceRoomProviderAdapterPacketProofStackStatus,
  protectedEvidenceRoomProviderAdapterStatus
} from "./protectedEvidenceRoomProviderAdapters";
import {
  protectedProviderSecurityReviewPacketProofStackStatus,
  protectedProviderSecurityReviewStatus
} from "./protectedProviderSecurityReviews";
import {
  protectedProcurementEvidenceRegistryPacketProofStackStatus,
  protectedProcurementEvidenceRegistryStatus
} from "./protectedProcurementEvidenceRegistry";
import {
  protectedClinicalAuthorityEvidenceRoomPacketStatus,
  protectedClinicalAuthorityEvidenceRoomStatus
} from "./protectedClinicalAuthorityEvidenceRoom";
import {
  protectedClinicalAuthorityOwnerMatrixPacketStatus,
  protectedClinicalAuthorityOwnerMatrixStatus
} from "./protectedClinicalAuthorityOwnerMatrix";
import {
  protectedClinicalAuthorityArtifactIntakePacketStatus,
  protectedClinicalAuthorityArtifactIntakeStatus
} from "./protectedClinicalAuthorityArtifactIntake";
import {
  protectedAuthorityArtifactReferencePacketStatus,
  protectedAuthorityArtifactReferenceQaHarnessStatus,
  protectedAuthorityArtifactReferenceRenewalQueueStatus,
  protectedAuthorityArtifactReferenceStatus
} from "./protectedAuthorityArtifactReferences";

export type ProductOfferStatus = "sellable-pilot" | "staged-demo" | "foundation";

export type ProductOffer = {
  name: string;
  status: ProductOfferStatus;
  buyer: string;
  problem: string;
  offer: string;
  pilotOutcome: string;
  proofRoutes: string[];
};

export type ProductWorkflow = {
  name: string;
  module: string;
  buyerValue: string;
  workflowRoute: string;
  resultRoute: string;
  commercialUse: string;
  productionBoundary: string;
};

export type DeploymentStage = {
  stage: string;
  buyerDecision: string;
  scrimedProof: string;
};

export type ProductAgent = {
  name: string;
  status: string;
  domain: string;
  owner: string;
  capability: string;
  workflowRoute: string;
  governanceFlags: string[];
};

export type EnterpriseServiceOffer = {
  name: string;
  status: "sellable" | "assessment" | "blueprint";
  buyer: string;
  deliverable: string;
  proof: string;
  boundary: string;
};

export type WorkflowEngineExample = {
  name: string;
  status: "synthetic-ready" | "design-ready";
  agent: string;
  buyerValue: string;
  inspectableOutput: string;
  governanceBoundary: string;
};

export type GovernanceControl = {
  control: string;
  status: "active" | "planned" | "required";
  detail: string;
};

export type EvidenceMetric = {
  metric: string;
  signal: string;
  proof: string;
  measurementBoundary: string;
};

export type BuyerAction = {
  label: string;
  href: string;
  purpose: string;
  boundary: string;
};

export type BuyerDecisionPath = {
  audience: string;
  primaryQuestion: string;
  recommendedStart: string;
  route: string;
  supportingRoutes: string[];
  proof: string;
  boundary: string;
};

export const productOffers: ProductOffer[] = [
  {
    name: "SCRIMED Atlas Pilot",
    status: "sellable-pilot",
    buyer: "Hospitals, governments, payers, and enterprise healthcare operators",
    problem:
      "Healthcare leaders need a governed way to evaluate AI workflows before connecting live systems or exposing patients to automation.",
    offer:
      "A 30 to 90 day operating-system pilot that maps high-value workflows, runs synthetic evidence, exposes readiness gates, and produces an executive governance report.",
    pilotOutcome:
      "Buyer receives workflow maps, governance gaps, interoperability targets, safety controls, and a production-readiness decision pack.",
    proofRoutes: ["/product", "/hub", "/quality", "/workflows", "/workflows/runtime-safety"]
  },
  {
    name: "CarePath Command",
    status: "staged-demo",
    buyer: "Patient access, care navigation, discharge, and population health teams",
    problem:
      "High-risk patients and operational queues often move through fragmented intake, routing, scheduling, and follow-up processes.",
    offer:
      "A governed care-navigation workflow console that shows intake signals, routing rationale, human review, Watchtower trace, and blocked unsafe actions.",
    pilotOutcome:
      "Buyer can inspect a reviewable care-navigation queue without live patient routing or autonomous outreach.",
    proofRoutes: [
      "/workflows/carepath-high-risk-followup-routing",
      "/workflows/results/carepath-high-risk-followup-routing",
      "/modules/carepath-ai"
    ]
  },
  {
    name: "DocuTwin Review",
    status: "staged-demo",
    buyer: "Clinical documentation, ambulatory operations, and quality teams",
    problem:
      "Clinicians need documentation support that preserves authorship, source traceability, review control, and compliance boundaries.",
    offer:
      "A draft-only documentation workflow that produces synthetic note evidence, missing-context prompts, source trace, and review state.",
    pilotOutcome:
      "Buyer can evaluate documentation workflow value while final notes, EHR filing, and clinical claims remain blocked.",
    proofRoutes: [
      "/workflows/docutwin-draft-note-review",
      "/workflows/results/docutwin-draft-note-review",
      "/modules/docutwin"
    ]
  },
  {
    name: "TrialCore Queue",
    status: "staged-demo",
    buyer: "Research operations, oncology programs, academic medical centers, and trial networks",
    problem:
      "Trial screening is slow, fragmented, and hard to explain when evidence gaps and eligibility rationale are not structured.",
    offer:
      "A synthetic eligibility review queue that preserves criteria trace, missing evidence, exclusion flags, and research review requirements.",
    pilotOutcome:
      "Buyer can inspect trial-screening operations without patient outreach, enrollment claims, or treatment recommendations.",
    proofRoutes: [
      "/workflows/trialcore-eligibility-review-queue",
      "/workflows/results/trialcore-eligibility-review-queue",
      "/modules/trialcore"
    ]
  }
];

export const enterpriseServiceOffers: EnterpriseServiceOffer[] = [
  {
    name: "Synthetic Pilot Evaluation",
    status: "sellable",
    buyer: "Enterprise healthcare leaders evaluating governed AI workflow value before live integration.",
    deliverable:
      "A 30 to 90 day synthetic pilot with workflow maps, agent scopes, validation evidence, risk controls, and executive findings.",
    proof: "Product Console, workflow fixtures, result validation, quality gates, and readiness brief.",
    boundary:
      "Synthetic data only; no live patient routing, diagnosis, order entry, payer submission, or autonomous clinical execution."
  },
  {
    name: "Workflow Intelligence Assessment",
    status: "assessment",
    buyer: "Operations, clinical transformation, access, revenue, and research teams with fragmented workflow queues.",
    deliverable:
      "Workflow inventory, friction map, automation candidate scorecard, interoperability targets, and human-review design.",
    proof: "Workflow Engine examples, agent registry, integration fixture contracts, and buyer-specific operating map.",
    boundary:
      "Assessment output is operational intelligence for human leaders; it is not clinical advice or a production automation approval."
  },
  {
    name: "AI Readiness + Governance Audit",
    status: "assessment",
    buyer: "Compliance, security, clinical governance, innovation, and executive sponsors preparing AI deployment policy.",
    deliverable:
      "Governance gap report covering privacy posture, auditability, role controls, runtime safety, model/workflow oversight, and approval gates.",
    proof: "Trust and governance controls, runtime safety register, identity register, audit persistence register, and quality gate stack.",
    boundary:
      "Audit identifies readiness and risk controls; production use requires buyer approval, security review, and implementation validation."
  },
  {
    name: "Clinical Operations Automation Blueprint",
    status: "blueprint",
    buyer: "Hospitals, clinics, payers, and public-sector health teams planning safe automation roadmaps.",
    deliverable:
      "Prioritized automation roadmap with agent responsibilities, connector plan, review queues, safety boundaries, and phased deployment path.",
    proof: "Agent registry, deployment stages, service offers, proof stack, and synthetic workflow demonstrations.",
    boundary:
      "Blueprint remains review-only until approved production controls, live connectors, and human operating procedures are in place."
  }
];

export const workflowEngineExamples: WorkflowEngineExample[] = [
  {
    name: "Referral intake automation",
    status: "design-ready",
    agent: "Scheduling Agent",
    buyerValue: "Organizes incoming referral context, missing information, urgency signals, and routing constraints for review.",
    inspectableOutput: "Referral workqueue state, missing-evidence list, routing rationale, and escalation reason.",
    governanceBoundary: "No autonomous referral acceptance, clinical triage replacement, or patient-facing action."
  },
  {
    name: "Prior authorization support",
    status: "design-ready",
    agent: "Prior Authorization Agent",
    buyerValue: "Prepares reviewable authorization packets from policy context, order details, and supporting documentation.",
    inspectableOutput: "Packet draft, cited policy rationale, missing-evidence list, and reviewer approval state.",
    governanceBoundary: "No payer submission, coverage guarantee, or clinical necessity determination without human approval."
  },
  {
    name: "Patient onboarding triage",
    status: "synthetic-ready",
    agent: "Scheduling Agent",
    buyerValue: "Routes synthetic onboarding profiles into operational queues based on access needs, constraints, and review triggers.",
    inspectableOutput: "Navigation recommendation, urgency rationale, Watchtower trace, and human-review requirement.",
    governanceBoundary: "No live patient routing, diagnosis, emergency triage replacement, or autonomous outreach."
  },
  {
    name: "Ambient documentation review",
    status: "synthetic-ready",
    agent: "Documentation Agent",
    buyerValue: "Creates draft-only documentation support with source trace, missing context, and clinician review prompts.",
    inspectableOutput: "Draft note, source trace, missing-data prompts, review checklist, and blocked final-signature state.",
    governanceBoundary: "No final note, EHR filing, diagnosis insertion, or record update without licensed clinician review."
  },
  {
    name: "RCM denial risk review",
    status: "design-ready",
    agent: "Revenue Cycle Agent",
    buyerValue: "Surfaces documentation, policy, and claim-workqueue risk signals before revenue leakage compounds.",
    inspectableOutput: "Denial-risk rationale, documentation gap list, appeal draft outline, and coding-review queue.",
    governanceBoundary: "No final coding, billing, appeal, claim submission, or reimbursement claim without qualified review."
  },
  {
    name: "Care gap detection",
    status: "design-ready",
    agent: "Clinical Intelligence Agent",
    buyerValue: "Identifies reviewable care-gap signals from structured context and care-pathway rules for human teams.",
    inspectableOutput: "Care-gap signal list, context summary, review prompt, source trace, and escalation boundary.",
    governanceBoundary: "No diagnosis, treatment recommendation, order entry, or patient instruction without licensed clinician review."
  }
];

export const governanceControls: GovernanceControl[] = [
  {
    control: "Human review required",
    status: "active",
    detail: "Every staged workflow and agent action remains review-gated before external, clinical, payer, or patient-facing use."
  },
  {
    control: "Synthetic data only",
    status: "active",
    detail: "Current pilots use deterministic synthetic fixtures and do not ingest production clinical records."
  },
  {
    control: "No autonomous diagnosis",
    status: "active",
    detail: "SCRIMED surfaces operational intelligence and review prompts; it does not diagnose or replace clinician judgment."
  },
  {
    control: "Audit trail enabled",
    status: "active",
    detail: "Workflow, result, denial, and quality surfaces retain inspectable traces and metadata-only evidence boundaries."
  },
  {
    control: "HIPAA-ready posture",
    status: "required",
    detail: "Architecture is designed toward HIPAA-grade privacy, security, and audit controls before live protected health information."
  },
  {
    control: "Privacy-by-design",
    status: "active",
    detail: "The product keeps clinical execution gated, avoids request-body capture in denied execution paths, and minimizes data exposure."
  },
  {
    control: "Protected-pilot role-based access active",
    status: "active",
    detail: "Tenant-isolated protected pilots enforce approved roles through Supabase Auth and Postgres row-level security. Production workflow use still requires service auth, consent, break-glass, and deployment-specific access approval."
  }
];

export const evidenceMetrics: EvidenceMetric[] = [
  {
    metric: "Time saved",
    signal: "Manual workflow review effort targeted for reduction.",
    proof: "Synthetic workqueue states show missing evidence, next action, reviewer owner, and blocked unsafe actions.",
    measurementBoundary: "Time savings must be measured in buyer pilots against approved baseline workflows."
  },
  {
    metric: "Workflow friction reduced",
    signal: "Fragmented intake, referral, authorization, documentation, and research queues become structured for review.",
    proof: "Workflow Engine examples map inputs, outputs, agents, review gates, and interoperability targets.",
    measurementBoundary: "Friction reduction is an operational pilot metric, not a live-care outcome claim."
  },
  {
    metric: "Documentation quality improved",
    signal: "Draft-only documentation can preserve source trace, missing-context prompts, and review state.",
    proof: "DocuTwin fixtures retain source trace, missing-data prompts, clinician review, and no final signature.",
    measurementBoundary: "Quality improvement requires clinician review and buyer-approved documentation scoring."
  },
  {
    metric: "Revenue leakage identified",
    signal: "RCM workqueues can surface denial risk, missing documentation, and policy gaps before escalation.",
    proof: "Revenue Cycle Agent boundaries support gap detection and appeal drafts without final billing action.",
    measurementBoundary: "Financial impact must be validated against buyer revenue-cycle data under approved controls."
  },
  {
    metric: "Patient access bottlenecks surfaced",
    signal: "Access workflows can expose scheduling constraints, referral gaps, and care-navigation barriers.",
    proof: "CarePath and Scheduling Agent examples create reviewable routing states without autonomous outreach.",
    measurementBoundary: "Access impact is measured during protected pilots after privacy, consent, and review workflows are approved."
  }
];

export const buyerActions: BuyerAction[] = [
  {
    label: "Review Launch Readiness",
    href: "/launch-readiness",
    purpose:
      "Verify launch structure, sandbox DNS classification, strict branded-domain gates, product/service readiness, protected proof boundaries, and go/no-go hard stops.",
    boundary:
      "Launch Readiness is operating evidence only; it does not bypass sandbox DNS, approve launch, create SLAs, authorize PHI, certify compliance, approve connectors, approve customer release, or authorize live clinical care."
  },
  {
    label: "Audit Navigation",
    href: "/navigation",
    purpose: "Review page route inventory, API route pattern counts, route groups, smoke coverage, protected fail-closed checks, and retained AAL2 or external-review bottlenecks.",
    boundary: "Navigation Audit is route-control evidence only; it is not release approval, protected execution proof, certification, PHI authority, or live clinical authorization."
  },
  {
    label: "Review Service Reliability",
    href: "/service-reliability",
    purpose:
      "Review product and service controls, known fault classes, efficiency improvements, owners, proof routes, and retained approval boundaries.",
    boundary:
      "Service Reliability strengthens operating discipline only; it is not approval, certification, PHI authority, buyer release authority, or live clinical authorization."
  },
  {
    label: "Resolve Bottlenecks",
    href: "/operational-efficiency",
    purpose:
      "Review cross-system gaps, inefficiencies, bottlenecks, fault classes, hard stops, owners, proof routes, and resolution sprints.",
    boundary:
      "Operational Efficiency improves execution discipline only; it does not authorize autonomous remediation, AAL2 bypass, PHI processing, legal/accounting/tax advice, certification, revenue guarantees, profit guarantees, or live clinical care."
  },
  {
    label: "Open Workarounds",
    href: "/limitations-workarounds",
    purpose:
      "Use safe workaround packets, owners, escalation triggers, proof routes, expiration rules, and graduation gates when issues, boundaries, or limitations block execution.",
    boundary:
      "Limitations Workarounds is containment only; it does not authorize PHI, live care, legal/accounting/tax advice, certification, public API SLAs, autonomous remediation, live AI, revenue guarantees, profit guarantees, or buyer release."
  },
  {
    label: "Review Capital Vitality",
    href: "/capital-vitality",
    purpose:
      "Review revenue capabilities, competitive moat evidence, investor-readiness milestones, funding workstreams, proof routes, and retained external-review gates.",
    boundary:
      "Capital Vitality is readiness material only; it is not investment advice, securities offering material, audited financial reporting, valuation assurance, legal advice, or revenue guarantee."
  },
  {
    label: "Open Growth Engine",
    href: "/growth-engine",
    purpose:
      "Prioritize buyer segments, sellable offers, conversion lanes, revenue proof steps, bottlenecks, owners, and proof routes.",
    boundary:
      "Commercial Growth Engine is execution readiness only; it is not a revenue guarantee, investment advice, securities offering material, audited financial reporting, valuation assurance, legal advice, tax advice, or customer permission."
  },
  {
    label: "Open Investor Readiness",
    href: "/investor-audience-readiness",
    purpose:
      "Route weaknesses, competitive edge, sellable value, and angel, corporate strategic, private investor, faith-based clinic, health-system, payer, public-sector, clinician, global partner, and transformation-sponsor packets.",
    boundary:
      "Investor and Audience Readiness is operating-readiness only; it is not investment advice, securities offering material, solicitation, audited financial reporting, valuation assurance, legal advice, tax advice, donor advice, customer permission, or approval."
  },
  {
    label: "Open Offerings Portfolio",
    href: "/offerings",
    purpose:
      "Package product and services offers, delivery paths, proof routes, qualification gates, margin controls, and retained boundaries before pricing, pilots, diligence, or implementation work expands.",
    boundary:
      "Product and Services Portfolio is packaging readiness only; it does not approve contracts, PHI processing, production connectors, legal/accounting/tax conclusions, revenue, profit, reimbursement, certification, or live clinical authority."
  },
  {
    label: "Open Service Delivery",
    href: "/service-delivery",
    purpose:
      "Convert packaged offers into scoped work orders, acceptance criteria, delivery artifacts, buyer handoffs, margin protections, and retained authority gates.",
    boundary:
      "Service Delivery Workbench is execution control only; it is not a statement of work, contract approval, SLA, managed-service commitment, PHI authority, production connector approval, customer permission, revenue guarantee, profit guarantee, or live clinical authority."
  },
  {
    label: "Open Client Onboarding",
    href: "/client-onboarding",
    purpose:
      "Use human-reviewed email, calendar-ready agendas, demo scripts, pilot workshop notes, presentation packets, meeting cadences, follow-up SLAs, and handoffs for every buyer path.",
    boundary:
      "Client Onboarding drafts and routes communications only; it does not send email, create calendar invites, approve contracts, approve procurement, process PHI, certify security, or authorize live clinical care."
  },
  {
    label: "Open Business Ops",
    href: "/enterprise-business-ops",
    purpose:
      "Review revenue capability, profit-margin discipline, deal desk, legal operations, finance/accounting controls, tax-awareness routing, contract authority, and audit evidence.",
    boundary:
      "Enterprise Business Operations is operating readiness only; it is not legal advice, accounting advice, tax advice, audited financial reporting, securities material, contract approval, revenue guarantee, profit-margin guarantee, or customer permission."
  },
  {
    label: "Review Enterprise Scale",
    href: "/enterprise-scalability",
    purpose:
      "Review capacity planning, tenant scale, queueing, observability, SLO readiness, support load, incident/change operations, global deployment, and cost controls.",
    boundary:
      "Enterprise Scalability Operations is readiness only; it is not a contractual SLA, managed service commitment, production support guarantee, security certification, PHI authority, production connector approval, revenue guarantee, or profit-margin guarantee."
  },
  {
    label: "Open Platform Power",
    href: "/platform-power",
    purpose:
      "Review API contracts, UI command paths, AI model-route readiness, agent approval, eval loops, evidence retrieval, and platform cost controls.",
    boundary:
      "Platform Power Operations is readiness only; it is not public API SLA authority, live autonomous AI authority, production model-routing approval, PHI authority, accessibility certification, security certification, or trillion-scale equivalence proof."
  },
  {
    label: "Review Pilot Evidence",
    href: "/pilot-evidence",
    purpose: "Inspect the enterprise evidence dashboard tying SCRIMED offers, AgentOS, Atlas, TrustOS, protected workspaces, demos, pilots, readiness, and measurable outcomes together.",
    boundary: "Evidence supports governed synthetic pilots and enterprise evaluation; it is not clinical validation, certification, or live execution authorization."
  },
  {
    label: "Open Agent Workspace",
    href: "/agent-workspace",
    purpose: "Review Persistent Agent Workspace v1 work orders, resumable state, model-router decisions, reviewer checkpoints, audit timelines, proof packets, and limitation-resolution paths.",
    boundary: "Workspace v1 coordinates governed synthetic work orders and proof. It does not authorize PHI, autonomous care, payer submission, patient outreach, or production connector execution."
  },
  {
    label: "Open Healthcare Intelligence OS",
    href: "/healthcare-intelligence-os",
    purpose: "Review SCRIMED's operating-system architecture, Clinical Knowledge Graph foundation, Validation Trust Lab, model routing, sovereign deployment, and production gates.",
    boundary: "Architecture is production-shaped but current execution remains synthetic, review-gated, and non-diagnostic."
  },
  {
    label: "Run TrustOS Decision",
    href: "/trust-os",
    purpose: "Evaluate a synthetic agent action through policy, PHI, tool, clinical, model-route, explainability, and trace controls.",
    boundary: "TrustOS evaluation does not authorize live healthcare data, production tools, or autonomous clinical execution."
  },
  {
    label: "Open Sales Operations Console",
    href: "/sales-operations",
    purpose: "Manage retained buyer opportunities, ownership, pipeline stage, audited proposals, buyer workspaces, tenant lifecycle packets, and controlled CRM synchronization.",
    boundary: "Approved SCRIMED tenant-admin identity is required. Business-contact and workflow-scope data only; no PHI or live clinical execution."
  },
  {
    label: "Review Protected Pilot Workspace",
    href: "/pilot-workspace",
    purpose: "Inspect tenant isolation, durable synthetic sessions, append-only audit controls, onboarding packets, activation proof packets, and downloadable session proof packets.",
    boundary: "Protected synthetic-pilot mutations are active and verified; live clinical execution and PHI-enabled production workflows remain denied."
  },
  {
    label: "Open Buyer Pilot Room",
    href: "/pilot-workspace/access",
    purpose:
      "Package tenant-scoped readiness, pricing path, competitive edge, evidence counts, known limitations, and proof-packet audit into one protected buyer-diligence workspace.",
    boundary:
      "Buyer Pilot Room evidence is synthetic-only and tenant-scoped; packet export requires authenticated AAL2 workspace access."
  },
  {
    label: "Broadcast Competitive Edge",
    href: "/competitive-edge",
    purpose:
      "Review SCRIMED's public enterprise positioning across healthcare intelligence infrastructure, TrustOS, interoperability, premium sales motion, FaithCore, and global deployment optionality.",
    boundary:
      "Competitive positioning does not imply third-party partnership, certified compliance, live clinical execution, or production connector authorization."
  },
  {
    label: "Review Competitive Market Intelligence",
    href: "/competitive-intelligence",
    purpose:
      "Inspect public competitor patterns translated into SCRIMED-specific product build paths, proof metrics, API posture, payer workflows, and no-copy guardrails.",
    boundary:
      "Competitive market intelligence uses public signals as strategy input only; it does not copy proprietary products, assert partnerships, certify compliance, or authorize live clinical execution."
  },
  {
    label: "Review Competitive Defense",
    href: "/competitive-defense",
    purpose:
      "Review competitor threat profiles, weakness relief, claims-safe counter-positioning, legal/privacy/cyber controls, and infiltration-deterrence hard stops.",
    boundary:
      "Competitive Defense is readiness only; it does not provide legal advice, authorize PHI, certify security, approve penetration testing, assert competitor partnerships, guarantee protection, or authorize live clinical care."
  },
  {
    label: "Review Public Market Readiness",
    href: "/public-market-readiness",
    purpose:
      "Inspect SCRIMED's KPI stack, unit economics, compliance logs, customer proof ladder, margin discipline, model-efficiency controls, and investor narrative.",
    boundary:
      "Public Market Readiness is operating discipline and diligence preparation, not audited financial reporting, securities offering material, investment advice, or valuation assurance."
  },
  {
    label: "Review Clinical Authority Readiness",
    href: "/clinical-authority-readiness",
    purpose:
      "Inspect hard-gate preparation for live clinical care authority, PHI processing, legal approval, regional regulatory approval, reimbursement review, security certification, connector acceptance, and production clinical authorization.",
    boundary:
      "Authority Readiness prepares evidence and safe workarounds; it does not grant legal approval, PHI processing authority, security certification, reimbursement certainty, regional approval, or live clinical execution."
  },
  {
    label: "Review Approvals Readiness",
    href: "/approvals-readiness",
    purpose:
      "Inspect the public operating ladder for intended use, HIPAA/BAA, SOC 2/HITRUST, FDA/CDS/SaMD, ONC/connectors, state care-delivery review, and buyer-specific release gates.",
    boundary:
      "Approvals Readiness organizes evidence and workarounds; it is not legal approval, HIPAA certification, FDA clearance, ONC certification, security certification, PHI authority, or live clinical authority."
  },
  {
    label: "Review Global Certification Readiness",
    href: "/global-certification-readiness",
    purpose:
      "Inspect domestic and global approval preparation across HIPAA/BAA, FDA CDS/SaMD, SOC 2, HITRUST, ISO 27001, ISO 42001, EU AI Act, GDPR, NHS DTAC, MHRA, Australia Essential Eight, and regional buyer gates.",
    boundary:
      "Global Certification Readiness organizes future evidence work only; it is not legal advice, certification, conformity, regulatory approval, PHI authority, public-sector approval, reimbursement assurance, or production clinical authority."
  },
  {
    label: "Open Continuous Review & Audit Loop",
    href: "/continuous-review-audit",
    purpose:
      "Inspect 24/7 agent-assisted accuracy review, evidence attribution, claims guard, security drift, QA regression, incident learning, and internal innovation research loops.",
    boundary:
      "Continuous Review and Audit improves accuracy and future readiness; it is not managed SOC/MDR coverage, autonomous production remediation, legal advice, certification, PHI authority, live-care authority, or a public quantum capability claim."
  },
  {
    label: "Review Release Continuity",
    href: "/release-continuity",
    purpose:
      "Inspect the live production checkpoint, GitHub release marker, public smoke posture, protected AAL2 boundary, and operator workaround path.",
    boundary:
      "Release Continuity proves operational readiness and source alignment; it does not mint tokens, bypass AAL2, approve buyer release, certify compliance, authorize PHI, or authorize live clinical care."
  },
  {
    label: "Inspect Product Demos",
    href: "/demos",
    purpose: "Review executable buyer demos with guided steps, proof routes, outcomes, and explicit production exclusions.",
    boundary: "Demos use governed synthetic evidence and do not represent live clinical execution."
  },
  {
    label: "Compare Pilot Programs",
    href: "/pilots",
    purpose: "Compare structured enterprise programs by duration, deliverables, buyer inputs, metrics, and governance gates.",
    boundary: "Pilot programs remain synthetic or protected-evaluation engagements until production controls are approved."
  },
  {
    label: "Inspect Conformance Evidence",
    href: "/interoperability/evaluations",
    purpose: "Review executable synthetic test kits, passed checks, evidence artifacts, and exact production blockers.",
    boundary: "Synthetic conformance evidence does not represent live connector certification, partner acceptance, or production data exchange."
  },
  {
    label: "Request Pilot",
    href: "/pilot?offer=synthetic-pilot-evaluation",
    purpose: "Start a synthetic SCRIMED Atlas Pilot conversation for a healthcare organization.",
    boundary: "Pilot scope remains synthetic and review-only until production controls are approved."
  },
  {
    label: "Review Pricing",
    href: "/pricing",
    purpose: "Review SCRIMED's recommended enterprise tiers, sales motion, value metrics, and commercial guardrails.",
    boundary: "Pricing is framed for governed evaluations and enterprise pilots, not live autonomous clinical execution."
  },
  {
    label: "Review Operations Readiness",
    href: "/operations",
    purpose: "Inspect go-live blockers, owners, fallbacks, Wix routing, domain readiness, and deployment-protection decisions.",
    boundary: "Operations readiness manages product launch risk; it does not authorize live clinical execution."
  },
  {
    label: "Review Trust Center",
    href: "/trust-center",
    purpose: "Inspect enterprise readiness, accountable owners, approved claims, prohibited claims, launch gates, and external-review requirements.",
    boundary: "Trust Center readiness is not legal advice, certification, or authorization for live clinical execution."
  },
  {
    label: "Review Trust Safety Ops",
    href: "/trust-safety-operations",
    purpose: "Inspect 24/7 trust, safety, copyright, legal, security, monitoring, auditing, escalation, and continuous-improvement operations.",
    boundary:
      "Trust Safety Ops defines the operating model and current controls; managed 24/7 production coverage still requires approved staffing and external readiness."
  },
  {
    label: "Run AgentOS Evaluation",
    href: "/evaluation",
    purpose: "Generate a synthetic AgentOS plan, Atlas Trust Card, audit preview, and observability packet.",
    boundary: "Evaluation uses synthetic workflow packets only and keeps production execution denied."
  },
  {
    label: "Record Operator Metrics",
    href: "/pilot-workspace/access",
    purpose: "Capture no-PHI operating metrics for cost discipline, workflow volume, proof output, and finance-readiness review.",
    boundary:
      "Protected operator metrics are internal operating metadata, not audited financial statements or securities offering material."
  },
  {
    label: "View Product Console",
    href: "/product",
    purpose: "Review the live product surface, agents, workflows, proof stack, and governance posture.",
    boundary: "Console evidence is for enterprise evaluation and does not represent live clinical execution."
  },
  {
    label: "Book Enterprise Assessment",
    href: "/pilot?offer=workflow-intelligence-assessment",
    purpose: "Discuss workflow intelligence, AI readiness, governance, and automation roadmap needs.",
    boundary: "Assessment output is operational planning and governance guidance, not clinical advice."
  },
  {
    label: "Download Readiness Brief",
    href: "/api/product/readiness-brief",
    purpose: "Export a concise readiness brief for executive, investor, or buyer review.",
    boundary: "Brief summarizes current synthetic-pilot readiness and production gates."
  }
];

export const buyerDecisionPaths: BuyerDecisionPath[] = [
  {
    audience: "Launch owner or executive sponsor",
    primaryQuestion: "Is SCRIMED structurally, product-wise, service-wise, and functionally ready to launch without confusing sandbox DNS with app failure?",
    recommendedStart: "Start with Launch Readiness, then inspect Product Console, Release Continuity, Operations, and Navigation Audit.",
    route: "/launch-readiness",
    supportingRoutes: ["/product", "/release-continuity", "/operations", "/navigation", "/service-reliability", "/limitations-workarounds", "/pilot-workspace/access"],
    proof:
      "Strict branded-domain gate, sandbox DNS classifier, fallback continuity rule, launch tracks, service paths, source/build alignment, product packaging, protected proof boundaries, and hard stops.",
    boundary:
      "Launch readiness does not approve launch, bypass sandbox restrictions, create contractual SLAs, authorize PHI, approve connectors, certify compliance, approve customer release, or authorize live clinical care."
  },
  {
    audience: "Healthcare executive buyer",
    primaryQuestion: "Can SCRIMED turn fragmented workflows into governed operational intelligence?",
    recommendedStart: "Start with the Product Console and Pilot Evidence Dashboard.",
    route: "/product",
    supportingRoutes: ["/pilot-evidence", "/service-reliability", "/demos", "/pilots", "/pricing"],
    proof:
      "Sellable pilot offers, workflow demos, outcome metrics, pricing posture, and production boundaries.",
    boundary:
      "Evaluation remains synthetic and review-gated; no autonomous diagnosis, patient routing, payer submission, or live care."
  },
  {
    audience: "Security, privacy, and compliance reviewer",
    primaryQuestion: "Can SCRIMED pass enterprise diligence without exposing sensitive artifacts?",
    recommendedStart: "Start with Approvals Readiness, the Trust Center, and protected workspace access path.",
    route: "/approvals-readiness",
    supportingRoutes: ["/trust-center", "/public-market-readiness", "/pilot-workspace/access", "/trust-safety-operations"],
    proof:
      "Claims controls, HIPAA/BAA readiness, security assurance tracks, protected provider security reviews, audit logs, review packets, and no-PHI evidence-room boundaries.",
    boundary:
      "Readiness metadata is not security approval, legal advice, compliance certification, executed BAA/DPA, or production authorization."
  },
  {
    audience: "Legal, privacy, cyber, and competitor-defense reviewer",
    primaryQuestion: "Can SCRIMED harden against competitors and infiltrations without creating legal, privacy, or cybersecurity overclaims?",
    recommendedStart: "Start with Competitive Defense, then inspect Claims, Trust Center, Global Certification Readiness, Health Records, Platform Power, and TrustOS.",
    route: "/competitive-defense",
    supportingRoutes: ["/claims", "/trust-center", "/global-certification-readiness", "/health-records", "/platform-power", "/trust-os", "/release-continuity"],
    proof:
      "Competitor threat profiles, weakness relief tracks, legal/privacy/cyber controls, infiltration-deterrence layers, external review gates, no-copy boundaries, no-PHI gates, and no-certification hard stops.",
    boundary:
      "Competitive defense is readiness only; it is not legal advice, privacy approval, security certification, penetration-test authorization, competitor partnership, protection guarantee, PHI authority, or live-care authority."
  },
  {
    audience: "QA, audit, and innovation owner",
    primaryQuestion: "How does SCRIMED keep reviewing accuracy, reducing mistakes, and researching future infrastructure around the clock?",
    recommendedStart: "Start with Continuous Review and Audit, then inspect QA Evidence, Source Intelligence, and Trust Safety Operations.",
    route: "/continuous-review-audit",
    supportingRoutes: ["/qa-evidence", "/source-intelligence", "/trust-safety-operations", "/global-certification-readiness", "/service-reliability"],
    proof:
      "Continuous review agents, source-backed loops, audit hard stops, smoke-oriented regression design, incident learning, and internal-only innovation assignments.",
    boundary:
      "Agent-assisted review does not replace qualified human approval, managed SOC/MDR coverage, legal review, clinical review, certification, or production remediation authority."
  },
  {
    audience: "Operational efficiency and bottleneck owner",
    primaryQuestion: "Which gaps, inefficiencies, bottlenecks, and hard stops should SCRIMED resolve first?",
    recommendedStart: "Start with Operational Efficiency and Limitations Workarounds, then inspect Service Reliability, Navigation Audit, Growth Engine, and Enterprise Business Ops.",
    route: "/operational-efficiency",
    supportingRoutes: ["/limitations-workarounds", "/service-reliability", "/enterprise-scalability", "/navigation", "/release-continuity", "/growth-engine", "/enterprise-business-ops", "/continuous-review-audit", "/boundary-resolution"],
    proof:
      "Cross-system gap records, safe workaround packets, open-bottleneck pressure, proof-route density, hard-stop visibility, owners, and resolution sprints.",
    boundary:
      "Operational efficiency routing is execution discipline only; it is not autonomous remediation, AAL2 bypass, PHI authority, certification, legal/accounting/tax advice, revenue guarantee, profit guarantee, buyer release approval, or clinical authority."
  },
  {
    audience: "Boundary, limitation, or workaround owner",
    primaryQuestion: "A request is blocked. What can SCRIMED safely do today?",
    recommendedStart: "Start with Limitations Workarounds, then inspect Boundary Resolution, Operational Efficiency, Platform Power, and Client Onboarding.",
    route: "/limitations-workarounds",
    supportingRoutes: ["/boundary-resolution", "/operational-efficiency", "/platform-power", "/client-onboarding", "/health-records", "/qa-claim-guard"],
    proof:
      "Issue tracks, workaround packets, escalation triggers, expiration rules, proof routes, hard stops, blocked claims, and graduation gates.",
    boundary:
      "Workaround ownership is containment only; it does not create approval, certification, PHI authority, clinical authority, legal/finance advice, live AI authority, public SLA, or buyer release."
  },
  {
    audience: "Founder or release operator",
    primaryQuestion: "Is the production release checkpointed, smoke-tested, and safely bounded for protected proof?",
    recommendedStart: "Start with Service Reliability, Navigation Audit, and Release Continuity, then run protected workspace checks from the browser AAL2 session.",
    route: "/service-reliability",
    supportingRoutes: ["/navigation", "/release-continuity", "/product", "/pilot-workspace/access", "/buyer-release-control-run", "/qa-run-control"],
    proof:
      "Product/service controls, fault classes, page inventory, API route count, production domain, source-control baseline, smoke checks, fail-closed protected routes, token-handling boundary, and AAL2 operator workaround.",
    boundary:
      "Navigation and release continuity are operational evidence only; protected happy-path proof still requires an approved human AAL2 session and no token storage."
  },
  {
    audience: "Investor or board reviewer",
    primaryQuestion: "Is SCRIMED building defensible healthcare intelligence infrastructure with a clear audience-specific capital story?",
    recommendedStart: "Start with Investor Audience Readiness, then inspect Capital Vitality, Enterprise Business Ops, Public Market Readiness, and Competitive Edge.",
    route: "/investor-audience-readiness",
    supportingRoutes: ["/capital-vitality", "/enterprise-business-ops", "/public-market-readiness", "/competitive-edge", "/market-activation", "/pilot-deal-room"],
    proof:
      "Weakness relief tracks, audience packets, revenue capability map, margin controls, legal/finance/accounting/tax roles, enterprise controls, moat evidence, investor milestones, KPI stack, unit economics, model-efficiency controls, and buyer-room evidence.",
    boundary:
      "Investor materials are operating-readiness evidence, not audited financial reporting, securities offering material, solicitation, valuation assurance, legal advice, tax advice, or investment advice."
  },
  {
    audience: "Faith-based clinic investor or mission-led clinic sponsor",
    primaryQuestion: "Can SCRIMED support clinic stewardship, access, and workflow capacity without overclaiming nonprofit, donor, or clinical authority?",
    recommendedStart: "Start with Investor Audience Readiness, then inspect FaithCore, Client Onboarding, Market Activation, and Health Records.",
    route: "/investor-audience-readiness",
    supportingRoutes: ["/faithcore", "/client-onboarding", "/market-activation", "/health-records", "/limitations-workarounds", "/qa-claim-guard"],
    proof:
      "Mission-fit packet, no-PHI clinic workflow assessment, stewardship value map, nonprofit/tax review checklist, communication templates, and blocked-claim controls.",
    boundary:
      "Faith-based clinic readiness is not donor advice, tax advice, charitable approval, religious endorsement, PHI authority, production connector approval, reimbursement assurance, or live clinical authority."
  },
  {
    audience: "Legal, finance, and enterprise operators",
    primaryQuestion: "Can SCRIMED manage enterprise deals, margins, contracts, tax/accounting review, and cash discipline at scale?",
    recommendedStart: "Start with Enterprise Business Ops and Enterprise Scalability, then inspect Growth Engine, Sales Operations, and Public Market Readiness.",
    route: "/enterprise-business-ops",
    supportingRoutes: ["/enterprise-scalability", "/growth-engine", "/sales-operations", "/public-market-readiness", "/capital-vitality", "/pilot-deal-room"],
    proof:
      "Deal desk, quote-to-contract approvals, price floors, revenue-recognition triage, billing controls, legal review roles, tax-awareness routing, margin controls, operating cadences, and blocked claims.",
    boundary:
      "Business operations evidence is not legal advice, accounting advice, tax advice, audited financial reporting, contract approval, revenue guarantee, profit-margin guarantee, securities material, or customer permission."
  },
  {
    audience: "Enterprise scale, support, and platform operators",
    primaryQuestion: "Can SCRIMED scale tenants, support, reliability evidence, incident response, regional deployment, and cost controls without overcommitting?",
    recommendedStart: "Start with Enterprise Scalability and Platform Power, then inspect Service Reliability, Release Continuity, Client Onboarding, and Enterprise Business Ops.",
    route: "/enterprise-scalability",
    supportingRoutes: ["/platform-power", "/service-reliability", "/release-continuity", "/client-onboarding", "/enterprise-business-ops", "/operational-efficiency", "/global-certification-readiness"],
    proof:
      "Capacity domains, scale controls, API contract readiness, UI command paths, AI model-route controls, workstreams, cadences, bottlenecks, SLO/SLA guardrails, support tier review, region gates, and cost/margin controls.",
    boundary:
      "Enterprise scale readiness is not a contractual SLA, uptime guarantee, managed service commitment, production support guarantee, security certification, PHI authority, production connector approval, revenue guarantee, or profit-margin guarantee."
  },
  {
    audience: "API, UI, and AI platform operators",
    primaryQuestion: "Can SCRIMED make its API, UI, and AI platform feel enterprise-grade without overclaiming live authority?",
    recommendedStart: "Start with Platform Power, then inspect AgentOS, TrustOS, Navigation Audit, Service Reliability, and Continuous Review.",
    route: "/platform-power",
    supportingRoutes: ["/agents", "/trust-os", "/navigation", "/service-reliability", "/continuous-review-audit", "/boundary-resolution", "/enterprise-scalability"],
    proof:
      "API contract register, role-based UI command paths, model-route readiness, agent approval controls, eval/red-team loops, evidence retrieval, and platform cost/latency controls.",
    boundary:
      "Platform power readiness is not public API SLA approval, live autonomous AI approval, production model routing, PHI processing, EHR access, accessibility certification, security certification, or trillion-dollar-scale equivalence."
  },
  {
    audience: "Clinical transformation operator",
    primaryQuestion: "How does SCRIMED move from demos toward controlled clinical operations safely?",
    recommendedStart: "Start with Clinical Authority Readiness and Clinical Care Activation.",
    route: "/clinical-authority-readiness",
    supportingRoutes: ["/clinical-care-activation", "/healthcare-intelligence-os", "/agents", "/workflows", "/interoperability"],
    proof:
      "Hard authority gates, human-review controls, AgentOS roles, workflow contracts, interoperability standards, and blocked live execution controls.",
    boundary:
      "Clinical authority readiness is a gated preparation layer; it does not authorize PHI ingestion, treatment decisions, EHR mutation, reimbursement claims, certification claims, or autonomous clinical execution."
  },
  {
    audience: "Global buyer or channel partner",
    primaryQuestion: "Which approvals, certifications, region, buyer pack, and procurement path must SCRIMED prepare for?",
    recommendedStart: "Start with Global Certification Readiness, Global Reach, and Deployment Profiles.",
    route: "/global-certification-readiness",
    supportingRoutes: ["/global-reach", "/deployment-profiles", "/market-activation", "/pilot-deal-room", "/trust-center"],
    proof:
      "Domestic and global approval tracks, official-source evidence implications, region focus, buyer localization packs, partner channel paths, procurement questions, and retained approval gates.",
    boundary:
      "Global Certification Readiness and Global Reach are preparation layers only; they are not legal advice, regional regulatory approval, procurement approval, compliance certification, conformity, PHI authority, or production clinical authority."
  }
];

export const deploymentStages: DeploymentStage[] = [
  {
    stage: "1. Synthetic demo",
    buyerDecision: "Does SCRIMED solve a real operational workflow with understandable evidence?",
    scrimedProof: "Synthetic workflows, result fixtures, quality gates, and blocked-action lists."
  },
  {
    stage: "2. Protected pilot",
    buyerDecision: "Can SCRIMED operate inside the buyer's governance, security, and interoperability constraints?",
    scrimedProof: "Identity, runtime safety, audit persistence, connector contracts, and human-review approvals."
  },
  {
    stage: "3. Governed production",
    buyerDecision: "Which workflows can safely move from review-only to controlled execution?",
    scrimedProof: "Approved runtime safety, durable audit, production connectors, monitoring, incident response, and restoration policy."
  }
];

export function getProductAgents(): ProductAgent[] {
  return agentWorkflows.map((workflow) => ({
    name: workflow.name,
    status: workflow.status,
    domain: workflow.domain,
    owner: workflow.owner,
    capability: workflow.objective,
    workflowRoute: workflow.route,
    governanceFlags: [
      workflow.humanReview.required ? "Human review required" : "Human review policy required",
      workflow.guardrails[0],
      workflow.guardrails[1] ?? "Audit trail required"
    ]
  }));
}

export function getProductWorkflows(): ProductWorkflow[] {
  return workflowExecutions.map((workflow) => ({
    name: workflow.name,
    module: workflow.module,
    buyerValue: workflow.objective,
    workflowRoute: workflow.route,
    resultRoute: `/workflows/results/${workflow.slug}`,
    commercialUse:
      "Demonstrates a sellable workflow with deterministic evidence, human review, and blocked unsafe actions.",
    productionBoundary: workflow.humanReview
  }));
}

export function getProductRuntimePresentation(
  buildInfo: ReturnType<typeof getScrimedBuildInfo> = getScrimedBuildInfo()
) {
  const previewRuntimeActive =
    buildInfo.environment === "preview" &&
    buildInfo.candidateBound &&
    buildInfo.nodeMajor === 24 &&
    buildInfo.runtimeCompatibilityStatus === "NODE24_CERTIFIED_RUNTIME_ACTIVE";

  return {
    runtimeCompatibilityLabel: previewRuntimeActive
      ? "verified in preview"
      : buildInfo.runtimeCompatibilityStatus === "NODE24_CERTIFIED_RUNTIME_ACTIVE"
        ? "certified locally"
        : "upgrade required",
    vercelBuildStatus: previewRuntimeActive ? "preview active" : "preview pending"
  };
}

export function getProductConsoleSummary() {
  const buildInfo = getScrimedBuildInfo();
  const runtimePresentation = getProductRuntimePresentation(buildInfo);
  const p33IntegratedSummary = getP33IntegratedSummary();
  const p34IntegratedSummary = getP34AdaptiveGovernanceSummary();
  const p34ReviewReadinessSummary = getP34ReviewReadinessSummary();
  const p34PreviewAcceptanceSummary = getP34PreviewAcceptanceSummary();
  const syntheticPilotReadinessSummary = getSyntheticPilotReadinessSummary();
  const workflowExecutionSummary = getWorkflowExecutionSummary();
  const workflowExecutionResultSummary = getWorkflowExecutionResultSummary();
  const workflowResultValidationSummary = getWorkflowResultValidationResults();
  const workflowExecutionContractSummary = getWorkflowExecutionContractSummary();
  const runtimeSafetyReadiness = getRuntimeSafetyReadinessSummary();
  const agentWorkflowSummary = getAgentWorkflowSummary();
  const agentEvaluationWorkspaceSummary = getAgentEvaluationWorkspaceSummary();
  const agentOSSummary = getAgentOSSummary();
  const atlasIntelligenceCoreSummary = getAtlasIntelligenceCoreSummary();
  const commercialStrategySummary = getCommercialStrategySummary();
  const companyOperationsSummary = getCompanyOperationsSummary();
  const qualityGateSummary = getQualityGateSummary();
  const interoperabilitySummary = getInteroperabilitySummary();
  const interoperabilityConformanceSummary = getInteroperabilityConformanceEvaluationSummary();
  const demoPilotProgramSummary = getDemoPilotProgramSummary();
  const pilotDemoCommercialReadinessSummary = getPilotDemoCommercialReadinessSummary();
  const enterpriseReadinessSummary = getEnterpriseReadinessSummary();
  const protectedPilotWorkspaceSummary = getProtectedPilotWorkspaceSummary();
  const salesOperationsSummary = getSalesOperationsSummary();
  const trustOSSummary = getTrustOSSummary();
  const persistentAgentWorkspaceSummary = getPersistentAgentWorkspaceSummary();
  const operatingCommandCenterSummary = getScrimedOperatingCommandCenterSummary();
  const strategicPlatformIntelligenceSummary = getStrategicPlatformIntelligenceSummary();
  const competitiveMarketIntelligenceSummary = getCompetitiveMarketIntelligenceSummary();
  const deploymentProfileSummary = getDeploymentProfileSummary();
  const marketActivationSummary = getMarketActivationSummary();
  const globalPartnerLocalizationSummary = getGlobalPartnerLocalizationSummary();
  const globalEnterpriseCommandSummary = getGlobalEnterpriseCommandSummary();
  const approvalsReadinessSummary = getApprovalsReadinessSummary();
  const globalCertificationReadinessSummary = getGlobalCertificationReadinessSummary();
  const healthcareIntelligenceOSSummary = getHealthcareIntelligenceOSSummary();
  const healthRecordsSafetyExchangeSummary = getHealthRecordsSafetyExchangeSummary();
  const continuousReviewAuditSummary = getContinuousReviewAuditSummary();
  const releaseContinuitySummary = getReleaseContinuitySummary();
  const navigationAuditSummary = getNavigationAuditSummary();
  const serviceReliabilitySummary = getServiceReliabilitySummary();
  const operationalEfficiencySummary = getOperationalEfficiencySummary();
  const automationAutopilotSummary = getScrimedAutomationAutopilotSummary();
  const strategicProblemResolutionSummary = getStrategicProblemResolutionSummary();
  const healthcareOptimizationCommandSummary = getHealthcareOptimizationCommandSummary();
  const healthcareValueRealizationSummary = getHealthcareValueRealizationSummary();
  const pilotValueEvidenceSummary = getPilotValueEvidenceSummary();
  const pilotActivationPlannerSummary = getPilotActivationPlannerSummary();
  const pilotHandoffCommandSummary = getPilotHandoffCommandSummary();
  const pilotSuccessReviewCommandSummary = getPilotSuccessReviewCommandSummary();
  const limitationsWorkaroundSummary = getLimitationsWorkaroundSummary();
  const investorAudienceReadinessSummary = getInvestorAudienceReadinessSummary();
  const launchReadinessSummary = getLaunchReadinessSummary();
  const competitiveDefenseSummary = getCompetitiveDefenseSummary();
  const capitalVitalitySummary = getCapitalVitalitySummary();
  const growthEngineSummary = getGrowthEngineSummary();
  const companyAssessmentSummary = getCompanyAssessmentSummary();
  const clinicalProductionReadinessSummary = getClinicalProductionReadinessSummary();
  const productServicePortfolioSummary = getProductServicePortfolioSummary();
  const serviceDeliverySummary = getServiceDeliverySummary();
  const clientOnboardingCommunicationsSummary = getClientOnboardingCommunicationsSummary();
  const enterpriseBusinessOpsSummary = getEnterpriseBusinessOpsSummary();
  const enterpriseScalabilityOperationsSummary = getEnterpriseScalabilityOperationsSummary();
  const platformPowerSummary = getPlatformPowerSummary();
  const productionArchitectureSummary = getProductionArchitectureSummary();
  const executionAttemptEnvelopeSummary = getExecutionAttemptEnvelopeSummary();
  const executionAttemptDurableStoreSummary = getExecutionAttemptDurableStoreSummary();
  const boundaryResolutionSummary = getBoundaryResolutionSummary();
  const clinicalAuthorityReadinessSummary = getClinicalAuthorityReadinessSummary();
  const salesAttributionSummary = getSalesAttributionSummary();
  const sourceIntelligenceSummary = getSourceIntelligenceSummary();
  const attributionAnalyticsSummary = getAttributionAnalyticsSummary();
  const trustSafetyOperationsSummary = getTrustSafetyOperationsSummary();
  const salesDealRoomSummary = getSalesDealRoomSummary();
  const qaEvidenceLedger = getQaEvidenceLedger();
  const qaExecutionReadinessSummary = getQaExecutionReadinessSummary();
  const qaRunControlSummary = getQaRunControlSummary();
  const qaLaunchKitSummary = getQaLaunchKitSummary();
  const qaHumanRunPacketSummary = getQaHumanRunPacketSummary();
  const qaCompletionBridgeSummary = getQaCompletionBridgeSummary();
  const qaClaimGuardSummary = getQaClaimGuardSummary();
  const qaActivationSealSummary = getQaActivationSealSummary();
  const qaProofPromotionSummary = getQaProofPromotionSummary();
  const qaBuyerProofReleaseSummary = getQaBuyerProofReleaseSummary();
  const buyerReleaseControlRunSummary = getBuyerReleaseControlRunSummary();
  const qaManualExecutionConsoleSummary = getQaManualExecutionConsoleSummary();
  const clinicalCareActivationSummary = getClinicalCareActivationSummary();
  const publicMarketReadinessSummary = getPublicMarketReadinessSummary();
  const productAgents = getProductAgents();
  const productWorkflows = getProductWorkflows();
  const sellablePilots = productOffers.filter((offer) => offer.status === "sellable-pilot").length;
  const p34PriorityGates = [
    {
      id: "candidate",
      label: "Candidate",
      state: buildInfo.commitSha && buildInfo.candidateFingerprintDeclared
        ? "EXACT_BINDING_REQUIRED"
        : "CANDIDATE_EVIDENCE_REQUIRED",
      owner: "release-steward",
      href: "/api/build-info"
    },
    {
      id: "review",
      label: "Review",
      state: p34ReviewReadinessSummary.review.state,
      owner: "independent-technical-reviewer",
      href: p34ReviewReadinessSummary.route
    },
    {
      id: "preview",
      label: "Preview",
      state: p34PreviewAcceptanceSummary.status,
      owner: "release-steward",
      href: "/api/readiness"
    },
    {
      id: "security",
      label: "Security",
      state: "AUTOMATED_ASSURANCE_COMPLETE",
      owner: "security-owner",
      href: "/trust-safety-operations"
    },
    {
      id: "aal2",
      label: "AAL2",
      state: "OPERATOR_ACTION_REQUIRED",
      owner: "authorized-preview-operator",
      href: "/pilot-workspace/access"
    },
    {
      id: "supabase",
      label: "Supabase",
      state: "OPERATOR_ACTION_REQUIRED",
      owner: "supabase-project-owner",
      href: "/approvals-readiness"
    },
    {
      id: "migrations",
      label: "Migrations",
      state: "PRODUCTION_MIGRATION_AUTHORIZATION_REQUIRED",
      owner: "database-release-owner",
      href: "/approvals-readiness"
    },
    {
      id: "synthetic-pilot",
      label: "Synthetic Pilot Readiness",
      state: syntheticPilotReadinessSummary.status,
      owner: "synthetic-pilot-owner",
      href: syntheticPilotReadinessSummary.route
    },
    {
      id: "commercial",
      label: "Commercial Readiness",
      state: syntheticPilotReadinessSummary.commercialReadiness.assessment,
      owner: "commercial-owner",
      href: "/pilot-deal-room"
    },
    {
      id: "protected-pilot",
      label: "Protected Pilot Readiness",
      state: "PROTECTED_PILOT_AUTHORIZATION_REQUIRED",
      owner: "privacy-security-clinical-owners",
      href: "/pilot-workspace/access"
    },
    {
      id: "production",
      label: "Production Authority",
      state: "PRODUCTION_AUTHORIZATION_REQUIRED",
      owner: "release-authority",
      href: "/clinical-production-readiness"
    }
  ] as const;

  return {
    service: "scrimed-product-console",
    runtime: buildInfo.runtime,
    nodeMajor: buildInfo.nodeMajor,
    runtimeEnvironment: buildInfo.environment,
    runtimeCompatibilityStatus: buildInfo.runtimeCompatibilityStatus,
    runtimeCompatibilityLabel: runtimePresentation.runtimeCompatibilityLabel,
    runtimeReleaseFingerprint: buildInfo.releaseFingerprint,
    runtimeCandidateCommit: buildInfo.commitSha,
    runtimeCandidateFingerprint: buildInfo.candidateFingerprint,
    runtimeCandidateFingerprintDeclared: buildInfo.candidateFingerprintDeclared,
    runtimeCandidateFingerprintBound: buildInfo.candidateFingerprintBound,
    runtimeCandidateFingerprintVerificationStatus: buildInfo.candidateFingerprintVerificationStatus,
    runtimeBranch: buildInfo.branch,
    vercelProjectStatus: "Node 24 pinned",
    vercelBuildStatus: runtimePresentation.vercelBuildStatus,
    p33IntegratedRoute: p33IntegratedSummary.route,
    p33IntegratedApiRoute: p33IntegratedSummary.apiRoute,
    p33IntegratedStatus: p33IntegratedSummary.status,
    p33OpportunityModuleCount: p33IntegratedSummary.opportunities.modules.length,
    p33BlockedGateCount: p33IntegratedSummary.gateCounts.BLOCKED,
    p34IntegratedRoute: p34IntegratedSummary.route,
    p34IntegratedApiRoute: p34IntegratedSummary.apiRoute,
    p34IntegratedStatus: p34IntegratedSummary.status,
    p34PassedGateCount: p34IntegratedSummary.gateCounts.PASS,
    p34BlockedGateCount: p34IntegratedSummary.gateCounts.BLOCKED,
    p34OperatorRequiredGateCount: p34IntegratedSummary.gateCounts.OPERATOR_REQUIRED,
    p34ClinicalOperatingSystem: p34IntegratedSummary.clinicalOperatingSystem,
    p34ControlPlane2: p34IntegratedSummary.controlPlane2,
    p34AtomicApproval: p34IntegratedSummary.atomicApproval,
    p34ExactCandidateReview: p34IntegratedSummary.exactCandidateReview,
    p34EgressFirewall: p34IntegratedSummary.egressFirewall,
    p34AutonomyCeiling: p34IntegratedSummary.controlPlane2.action.a3Available ? "A3" : "A2_REVIEW_ONLY",
    p34ReviewState: p34IntegratedSummary.exactCandidateReview.status,
    p34MigrationState: "THREE_UNAPPLIED_STATIC_REVIEW_READY_OPERATOR_AUTHORIZATION_REQUIRED",
    p34PreviewState: p34PreviewAcceptanceSummary.status,
    p34PreviewAcceptance: p34PreviewAcceptanceSummary,
    p34Aal2State: "FRESH_EXACT_TARGET_OPERATOR_EVIDENCE_REQUIRED",
    p34SupabaseSecurityState: "LEAKED_PASSWORD_PROTECTION_OPERATOR_ACTION_AND_LIVE_RECHECK_REQUIRED",
    p34ReviewReadiness: p34ReviewReadinessSummary,
    p34ReviewReadinessApiRoute: p34ReviewReadinessSummary.route,
    p34SupabasePosture: {
      project: "scrimed-protected-pilot",
      authSecurity: "LEAKED_PASSWORD_PROTECTION_OPERATOR_ACTION_REQUIRED",
      rlsAssurance: "REPOSITORY_CONTRACTS_PASS_LIVE_POSTURE_NOT_IMPLIED",
      migrationState: "THREE_PENDING_PRODUCTION_UNAPPLIED",
      productionMutationState: "DISABLED"
    },
    syntheticPilotReadiness: syntheticPilotReadinessSummary,
    syntheticPilotRoute: syntheticPilotReadinessSummary.route,
    syntheticPilotApiRoute: syntheticPilotReadinessSummary.apiRoute,
    commercialReadiness: syntheticPilotReadinessSummary.commercialReadiness,
    p34PriorityGates,
    route: "/product",
    apiRoute: "/api/product/console",
    pilotIntakeRoute: "/pilot",
    pilotIntakeApiRoute: "/api/pilot/intake",
    evaluationRoute: agentEvaluationWorkspaceSummary.route,
    evaluationApiRoute: agentEvaluationWorkspaceSummary.apiRoute,
    pricingRoute: commercialStrategySummary.route,
    pricingApiRoute: commercialStrategySummary.apiRoute,
    operationsRoute: companyOperationsSummary.route,
    operationsApiRoute: companyOperationsSummary.apiRoute,
    trustCenterRoute: enterpriseReadinessSummary.route,
    trustCenterApiRoute: enterpriseReadinessSummary.apiRoute,
    trustSafetyOperationsRoute: trustSafetyOperationsSummary.route,
    trustSafetyOperationsApiRoute: trustSafetyOperationsSummary.apiRoute,
    trustSafetyIncidentReportApiRoute: trustSafetyOperationsSummary.incidentReportApiRoute,
    trustSafetyTenantIncidentDashboardApiRoute: trustSafetyOperationsSummary.tenantIncidentDashboardApiRoute,
    trustSafetyTenantIncidentMutationApiRoute: trustSafetyOperationsSummary.tenantIncidentMutationApiRoute,
    trustSafetyTenantIncidentReviewPacketApiRoute: trustSafetyOperationsSummary.tenantIncidentReviewPacketApiRoute,
    demoRoute: demoPilotProgramSummary.demoRoute,
    demoApiRoute: demoPilotProgramSummary.demoApiRoute,
    pilotProgramRoute: demoPilotProgramSummary.pilotRoute,
    pilotProgramApiRoute: demoPilotProgramSummary.pilotApiRoute,
    pilotDemoCommercialReadinessRoute: pilotDemoCommercialReadinessSummary.route,
    pilotDemoCommercialReadinessApiRoute: pilotDemoCommercialReadinessSummary.apiRoute,
    pilotDemoCommercialReadinessBriefRoute: pilotDemoCommercialReadinessSummary.briefRoute,
    protectedPilotWorkspaceRoute: protectedPilotWorkspaceSummary.route,
    salesOperationsRoute: salesOperationsSummary.route,
    healthcareIntelligenceOSRoute: healthcareIntelligenceOSSummary.route,
    healthcareIntelligenceOSApiRoute: healthcareIntelligenceOSSummary.apiRoute,
    healthcareIntelligenceOSBriefRoute: "/api/healthcare-intelligence-os/brief",
    healthRecordsSafetyExchangeRoute: healthRecordsSafetyExchangeSummary.route,
    healthRecordsSafetyExchangeApiRoute: healthRecordsSafetyExchangeSummary.apiRoute,
    healthRecordsSafetyExchangeBriefRoute: healthRecordsSafetyExchangeSummary.briefRoute,
    healthRecordsSafetyExchangeExtractRoute: healthRecordsSafetyExchangeSummary.extractRoute,
    releaseContinuityRoute: releaseContinuitySummary.route,
    releaseContinuityApiRoute: releaseContinuitySummary.apiRoute,
    releaseContinuityBriefRoute: releaseContinuitySummary.briefRoute,
    navigationAuditRoute: navigationAuditSummary.route,
    navigationAuditApiRoute: navigationAuditSummary.apiRoute,
    navigationAuditBriefRoute: navigationAuditSummary.briefRoute,
    serviceReliabilityRoute: serviceReliabilitySummary.route,
    serviceReliabilityApiRoute: serviceReliabilitySummary.apiRoute,
    serviceReliabilityBriefRoute: serviceReliabilitySummary.briefRoute,
    operationalEfficiencyRoute: operationalEfficiencySummary.route,
    operationalEfficiencyApiRoute: operationalEfficiencySummary.apiRoute,
    operationalEfficiencyBriefRoute: operationalEfficiencySummary.briefRoute,
    automationAutopilotSummary,
    automationAutopilotRoute: automationAutopilotSummary.route,
    automationAutopilotApiRoute: automationAutopilotSummary.apiRoute,
    automationAutopilotBriefRoute: automationAutopilotSummary.briefRoute,
    automationAutopilotCapabilityCount: automationAutopilotSummary.capabilityCount,
    automationAutopilotAverageReadinessScore:
      automationAutopilotSummary.averageReadinessScore,
    automationAutopilotSyntheticAutopilotCount:
      automationAutopilotSummary.syntheticAutopilotCount,
    automationAutopilotReviewGatedCount: automationAutopilotSummary.reviewGatedCount,
    automationAutopilotReviewRequiredCount:
      automationAutopilotSummary.reviewRequiredCount,
    automationAutopilotProductionAuthorityBlockedCount:
      automationAutopilotSummary.productionAuthorityBlockedCount,
    automationAutopilotBottleneckWorkaroundCount:
      automationAutopilotSummary.bottleneckWorkaroundCount,
    strategicProblemResolutionSummary,
    strategicProblemResolutionRoute: strategicProblemResolutionSummary.route,
    strategicProblemResolutionApiRoute: strategicProblemResolutionSummary.apiRoute,
    strategicProblemResolutionBriefRoute: strategicProblemResolutionSummary.briefRoute,
    strategicProblemResolutionProblemCount: strategicProblemResolutionSummary.problemCount,
    strategicProblemResolutionCriticalProblemCount:
      strategicProblemResolutionSummary.criticalProblemCount,
    strategicProblemResolutionHighProblemCount:
      strategicProblemResolutionSummary.highProblemCount,
    strategicProblemResolutionAveragePriorityScore:
      strategicProblemResolutionSummary.averagePriorityScore,
    strategicProblemResolutionHumanReviewRequiredCount:
      strategicProblemResolutionSummary.humanReviewRequiredCount,
    strategicProblemResolutionExternalApprovalRequiredCount:
      strategicProblemResolutionSummary.externalApprovalRequiredCount,
    strategicProblemResolutionProofRouteCount:
      strategicProblemResolutionSummary.proofRouteCount,
    healthcareOptimizationCommandSummary,
    healthcareOptimizationCommandRoute: healthcareOptimizationCommandSummary.route,
    healthcareOptimizationCommandApiRoute: healthcareOptimizationCommandSummary.apiRoute,
    healthcareOptimizationCommandBriefRoute: healthcareOptimizationCommandSummary.briefRoute,
    healthcareOptimizationCommandLaneCount: healthcareOptimizationCommandSummary.laneCount,
    healthcareOptimizationCommandPlaybookCount:
      healthcareOptimizationCommandSummary.playbookCount,
    healthcareOptimizationCommandInnovationTrackCount:
      healthcareOptimizationCommandSummary.innovationTrackCount,
    healthcareOptimizationCommandAveragePriorityScore:
      healthcareOptimizationCommandSummary.averagePriorityScore,
    healthcareOptimizationCommandAgentCapabilityCount:
      healthcareOptimizationCommandSummary.agentCapabilityCount,
    healthcareOptimizationCommandInteroperableStandardCount:
      healthcareOptimizationCommandSummary.interoperableStandardCount,
    healthcareOptimizationCommandMeasurableOutcomeCount:
      healthcareOptimizationCommandSummary.measurableOutcomeCount,
    healthcareOptimizationCommandHumanReviewRequiredCount:
      healthcareOptimizationCommandSummary.humanReviewRequiredCount,
    healthcareOptimizationCommandProofRouteCount:
      healthcareOptimizationCommandSummary.proofRouteCount,
    healthcareValueRealizationSummary,
    healthcareValueRealizationRoute: healthcareValueRealizationSummary.route,
    healthcareValueRealizationApiRoute: healthcareValueRealizationSummary.apiRoute,
    healthcareValueRealizationBriefRoute: healthcareValueRealizationSummary.briefRoute,
    healthcareValueRealizationMetricCount: healthcareValueRealizationSummary.metricCount,
    healthcareValueRealizationPackageCount: healthcareValueRealizationSummary.packageCount,
    healthcareValueRealizationRiskControlCount:
      healthcareValueRealizationSummary.riskControlCount,
    healthcareValueRealizationAverageEvidenceScore:
      healthcareValueRealizationSummary.averageEvidenceScore,
    healthcareValueRealizationHumanReviewRequiredCount:
      healthcareValueRealizationSummary.humanReviewRequiredCount,
    healthcareValueRealizationProofRouteCount:
      healthcareValueRealizationSummary.proofRouteCount,
    pilotValueEvidenceSummary,
    pilotValueEvidenceRoute: pilotValueEvidenceSummary.route,
    pilotValueEvidenceApiRoute: pilotValueEvidenceSummary.apiRoute,
    pilotValueEvidenceBriefRoute: pilotValueEvidenceSummary.briefRoute,
    pilotValueEvidenceArtifactCount: pilotValueEvidenceSummary.artifactCount,
    pilotValueEvidencePacketCount: pilotValueEvidenceSummary.packetCount,
    pilotValueEvidenceReviewerCheckpointCount:
      pilotValueEvidenceSummary.reviewerCheckpointCount,
    pilotValueEvidenceClaimControlCount: pilotValueEvidenceSummary.claimControlCount,
    pilotValueEvidenceAverageEvidenceScore:
      pilotValueEvidenceSummary.averageEvidenceScore,
    pilotValueEvidenceHumanReviewRequiredCount:
      pilotValueEvidenceSummary.humanReviewRequiredCount,
    pilotValueEvidenceProofRouteCount: pilotValueEvidenceSummary.proofRouteCount,
    pilotActivationPlannerSummary,
    pilotActivationPlannerRoute: pilotActivationPlannerSummary.route,
    pilotActivationPlannerApiRoute: pilotActivationPlannerSummary.apiRoute,
    pilotActivationPlannerBriefRoute: pilotActivationPlannerSummary.briefRoute,
    pilotActivationPlannerStepCount: pilotActivationPlannerSummary.stepCount,
    pilotActivationPlannerPlanCount: pilotActivationPlannerSummary.planCount,
    pilotActivationPlannerBlockerCount: pilotActivationPlannerSummary.blockerCount,
    pilotActivationPlannerHandoffCount: pilotActivationPlannerSummary.handoffCount,
    pilotActivationPlannerExternalApprovalRequiredCount:
      pilotActivationPlannerSummary.externalApprovalRequiredCount,
    pilotActivationPlannerBlockedBeforeLiveCount:
      pilotActivationPlannerSummary.blockedBeforeLiveCount,
    pilotActivationPlannerHumanReviewRequiredCount:
      pilotActivationPlannerSummary.humanReviewRequiredCount,
    pilotActivationPlannerProofRouteCount:
      pilotActivationPlannerSummary.proofRouteCount,
    pilotHandoffCommandSummary,
    pilotHandoffCommandRoute: pilotHandoffCommandSummary.route,
    pilotHandoffCommandApiRoute: pilotHandoffCommandSummary.apiRoute,
    pilotHandoffCommandBriefRoute: pilotHandoffCommandSummary.briefRoute,
    pilotHandoffCommandPacketCount: pilotHandoffCommandSummary.packetCount,
    pilotHandoffCommandChecklistCount: pilotHandoffCommandSummary.checklistCount,
    pilotHandoffCommandRiskControlCount: pilotHandoffCommandSummary.riskControlCount,
    pilotHandoffCommandReviewRequiredPacketCount:
      pilotHandoffCommandSummary.reviewRequiredPacketCount,
    pilotHandoffCommandExternalApprovalRequiredPacketCount:
      pilotHandoffCommandSummary.externalApprovalRequiredPacketCount,
    pilotHandoffCommandBlockedBeforeSendPacketCount:
      pilotHandoffCommandSummary.blockedBeforeSendPacketCount,
    pilotHandoffCommandHardStopCount: pilotHandoffCommandSummary.hardStopCount,
    pilotHandoffCommandProofRouteCount: pilotHandoffCommandSummary.proofRouteCount,
    pilotSuccessReviewCommandSummary,
    pilotSuccessReviewCommandRoute: pilotSuccessReviewCommandSummary.route,
    pilotSuccessReviewCommandApiRoute: pilotSuccessReviewCommandSummary.apiRoute,
    pilotSuccessReviewCommandBriefRoute: pilotSuccessReviewCommandSummary.briefRoute,
    pilotSuccessReviewCommandReviewPlanCount:
      pilotSuccessReviewCommandSummary.reviewPlanCount,
    pilotSuccessReviewCommandEvidenceGapCount:
      pilotSuccessReviewCommandSummary.evidenceGapCount,
    pilotSuccessReviewCommandExpansionReadinessCount:
      pilotSuccessReviewCommandSummary.expansionReadinessCount,
    pilotSuccessReviewCommandBlockedClaimCount:
      pilotSuccessReviewCommandSummary.blockedClaimCount,
    pilotSuccessReviewCommandBlockedBeforeClaimCount:
      pilotSuccessReviewCommandSummary.blockedBeforeClaimCount,
    pilotSuccessReviewCommandExternalApprovalRequiredCount:
      pilotSuccessReviewCommandSummary.externalApprovalRequiredCount,
    pilotSuccessReviewCommandProofRouteCount:
      pilotSuccessReviewCommandSummary.proofRouteCount,
    limitationsWorkaroundRoute: limitationsWorkaroundSummary.route,
    limitationsWorkaroundApiRoute: limitationsWorkaroundSummary.apiRoute,
    limitationsWorkaroundBriefRoute: limitationsWorkaroundSummary.briefRoute,
    launchReadinessRoute: launchReadinessSummary.route,
    launchReadinessApiRoute: launchReadinessSummary.apiRoute,
    launchReadinessBriefRoute: launchReadinessSummary.briefRoute,
    competitiveMarketIntelligenceRoute: competitiveMarketIntelligenceSummary.route,
    competitiveMarketIntelligenceApiRoute: competitiveMarketIntelligenceSummary.apiRoute,
    competitiveDefenseRoute: competitiveDefenseSummary.route,
    competitiveDefenseApiRoute: competitiveDefenseSummary.apiRoute,
    competitiveDefenseBriefRoute: competitiveDefenseSummary.briefRoute,
    investorAudienceReadinessRoute: investorAudienceReadinessSummary.route,
    investorAudienceReadinessApiRoute: investorAudienceReadinessSummary.apiRoute,
    investorAudienceReadinessBriefRoute: investorAudienceReadinessSummary.briefRoute,
    capitalVitalityRoute: capitalVitalitySummary.route,
    capitalVitalityApiRoute: capitalVitalitySummary.apiRoute,
    capitalVitalityBriefRoute: capitalVitalitySummary.briefRoute,
    growthEngineRoute: growthEngineSummary.route,
    growthEngineApiRoute: growthEngineSummary.apiRoute,
    growthEngineBriefRoute: growthEngineSummary.briefRoute,
    companyAssessmentRoute: companyAssessmentSummary.route,
    companyAssessmentApiRoute: companyAssessmentSummary.apiRoute,
    companyAssessmentBriefRoute: companyAssessmentSummary.briefRoute,
    clinicalProductionReadinessRoute: clinicalProductionReadinessSummary.route,
    clinicalProductionReadinessApiRoute: clinicalProductionReadinessSummary.apiRoute,
    clinicalProductionReadinessBriefRoute: clinicalProductionReadinessSummary.briefRoute,
    productServicePortfolioRoute: productServicePortfolioSummary.route,
    productServicePortfolioApiRoute: productServicePortfolioSummary.apiRoute,
    productServicePortfolioBriefRoute: productServicePortfolioSummary.briefRoute,
    serviceDeliveryRoute: serviceDeliverySummary.route,
    serviceDeliveryApiRoute: serviceDeliverySummary.apiRoute,
    serviceDeliveryBriefRoute: serviceDeliverySummary.briefRoute,
    clientOnboardingCommunicationsRoute: clientOnboardingCommunicationsSummary.route,
    clientOnboardingCommunicationsApiRoute: clientOnboardingCommunicationsSummary.apiRoute,
    clientOnboardingCommunicationsBriefRoute: clientOnboardingCommunicationsSummary.briefRoute,
    enterpriseBusinessOpsRoute: enterpriseBusinessOpsSummary.route,
    enterpriseBusinessOpsApiRoute: enterpriseBusinessOpsSummary.apiRoute,
    enterpriseBusinessOpsBriefRoute: enterpriseBusinessOpsSummary.briefRoute,
    enterpriseScalabilityOperationsRoute: enterpriseScalabilityOperationsSummary.route,
    enterpriseScalabilityOperationsApiRoute: enterpriseScalabilityOperationsSummary.apiRoute,
    enterpriseScalabilityOperationsBriefRoute: enterpriseScalabilityOperationsSummary.briefRoute,
    platformPowerRoute: platformPowerSummary.route,
    platformPowerApiRoute: platformPowerSummary.apiRoute,
    platformPowerBriefRoute: platformPowerSummary.briefRoute,
    productionArchitectureRoute: productionArchitectureSummary.route,
    productionArchitectureApiRoute: productionArchitectureSummary.apiRoute,
    productionArchitectureBriefRoute: productionArchitectureSummary.briefRoute,
    executionAttemptEnvelopeRoute: executionAttemptEnvelopeSummary.route,
    executionAttemptEnvelopeApiRoute: executionAttemptEnvelopeSummary.apiRoute,
    executionAttemptEnvelopeBriefRoute: executionAttemptEnvelopeSummary.briefRoute,
    executionAttemptDurableStoreApiRoute: executionAttemptDurableStoreSummary.apiRoute,
    executionAttemptDurableStoreBriefRoute: executionAttemptDurableStoreSummary.briefRoute,
    executionAttemptDurableStoreRecordRoute: executionAttemptDurableStoreSummary.recordRoute,
    executionAttemptDurableStoreReplayRoute: executionAttemptDurableStoreSummary.replayRoute,
    executionAttemptDurableStoreReviewDispositionRoute:
      executionAttemptDurableStoreSummary.reviewDispositionRoute,
    approvalsReadinessRoute: approvalsReadinessSummary.route,
    approvalsReadinessApiRoute: approvalsReadinessSummary.apiRoute,
    approvalsReadinessBriefRoute: approvalsReadinessSummary.briefRoute,
    globalCertificationReadinessRoute: globalCertificationReadinessSummary.route,
    globalCertificationReadinessApiRoute: globalCertificationReadinessSummary.apiRoute,
    globalCertificationReadinessBriefRoute: globalCertificationReadinessSummary.briefRoute,
    continuousReviewAuditRoute: continuousReviewAuditSummary.route,
    continuousReviewAuditApiRoute: continuousReviewAuditSummary.apiRoute,
    continuousReviewAuditBriefRoute: continuousReviewAuditSummary.briefRoute,
    clinicalAuthorityReadinessRoute: clinicalAuthorityReadinessSummary.route,
    clinicalAuthorityReadinessApiRoute: clinicalAuthorityReadinessSummary.apiRoute,
    clinicalAuthorityReadinessBriefRoute: clinicalAuthorityReadinessSummary.briefRoute,
    clinicalCareActivationRoute: clinicalCareActivationSummary.route,
    clinicalCareActivationApiRoute: clinicalCareActivationSummary.apiRoute,
    clinicalCareActivationBriefRoute: clinicalCareActivationSummary.briefRoute,
    clinicalActivationDossierRoute: "/pilot-workspace/access",
    clinicalActivationDossierApiRoute:
      "/api/pilot-workspaces/{workspaceSlug}/clinical-activation-dossier",
    clinicalActivationDossierPacketRoute:
      "/api/pilot-workspaces/{workspaceSlug}/clinical-activation-dossier/packet",
    clinicalActivationApprovalWorkflowRoute: "/pilot-workspace/access",
    clinicalActivationApprovalWorkflowApiRoute:
      "/api/pilot-workspaces/{workspaceSlug}/clinical-activation-approvals",
    clinicalActivationApprovalWorkflowPacketRoute:
      "/api/pilot-workspaces/{workspaceSlug}/clinical-activation-approvals/packet",
    publicMarketReadinessRoute: publicMarketReadinessSummary.route,
    publicMarketReadinessApiRoute: publicMarketReadinessSummary.apiRoute,
    publicMarketReadinessBriefRoute: publicMarketReadinessSummary.briefRoute,
    protectedOperatorMetricsRoute: publicMarketReadinessSummary.protectedOperatorMetricRoute,
    protectedOperatorMetricsApiRoute: publicMarketReadinessSummary.protectedOperatorMetricApiRoute,
    protectedMetricRollupsRoute: publicMarketReadinessSummary.protectedMetricRollupRoute,
    protectedMetricRollupsApiRoute: publicMarketReadinessSummary.protectedMetricRollupApiRoute,
    protectedMetricRollupPacketApiRoute:
      publicMarketReadinessSummary.protectedMetricRollupPacketApiRoute,
    protectedMetricTrendsRoute: publicMarketReadinessSummary.protectedMetricTrendRoute,
    protectedMetricTrendsApiRoute: publicMarketReadinessSummary.protectedMetricTrendApiRoute,
    protectedMetricTrendPacketApiRoute:
      publicMarketReadinessSummary.protectedMetricTrendPacketApiRoute,
    protectedBoardScorecardsRoute: publicMarketReadinessSummary.protectedBoardScorecardRoute,
    protectedBoardScorecardsApiRoute: publicMarketReadinessSummary.protectedBoardScorecardApiRoute,
    protectedBoardScorecardPacketApiRoute:
      publicMarketReadinessSummary.protectedBoardScorecardPacketApiRoute,
    protectedFinanceMethodologyRoute:
      publicMarketReadinessSummary.protectedFinanceMethodologyRoute,
    protectedFinanceMethodologyApiRoute:
      publicMarketReadinessSummary.protectedFinanceMethodologyApiRoute,
    protectedFinanceMethodologyPacketApiRoute:
      publicMarketReadinessSummary.protectedFinanceMethodologyPacketApiRoute,
    protectedExternalApprovalEvidenceRoute:
      publicMarketReadinessSummary.protectedExternalApprovalEvidenceRoute,
    protectedExternalApprovalEvidenceApiRoute:
      publicMarketReadinessSummary.protectedExternalApprovalEvidenceApiRoute,
    protectedExternalApprovalEvidencePacketApiRoute:
      publicMarketReadinessSummary.protectedExternalApprovalEvidencePacketApiRoute,
    protectedReleaseDecisionRoute: publicMarketReadinessSummary.protectedReleaseDecisionRoute,
    protectedReleaseDecisionApiRoute: publicMarketReadinessSummary.protectedReleaseDecisionApiRoute,
    protectedReleaseDecisionPacketApiRoute:
      publicMarketReadinessSummary.protectedReleaseDecisionPacketApiRoute,
    protectedNamedReviewerSignoffRoute:
      publicMarketReadinessSummary.protectedNamedReviewerSignoffRoute,
    protectedNamedReviewerSignoffApiRoute:
      publicMarketReadinessSummary.protectedNamedReviewerSignoffApiRoute,
    protectedNamedReviewerSignoffPacketApiRoute:
      publicMarketReadinessSummary.protectedNamedReviewerSignoffPacketApiRoute,
    protectedDistributionLockboxRoute:
      publicMarketReadinessSummary.protectedDistributionLockboxRoute,
    protectedDistributionLockboxApiRoute:
      publicMarketReadinessSummary.protectedDistributionLockboxApiRoute,
    protectedDistributionLockboxPacketApiRoute:
      publicMarketReadinessSummary.protectedDistributionLockboxPacketApiRoute,
    protectedReleaseAuthorityAttestationRoute:
      publicMarketReadinessSummary.protectedReleaseAuthorityAttestationRoute,
    protectedReleaseAuthorityAttestationApiRoute:
      publicMarketReadinessSummary.protectedReleaseAuthorityAttestationApiRoute,
    protectedReleaseAuthorityAttestationPacketApiRoute:
      publicMarketReadinessSummary.protectedReleaseAuthorityAttestationPacketApiRoute,
    protectedEvidenceRoomRecipientAttestationRoute:
      publicMarketReadinessSummary.protectedEvidenceRoomRecipientAttestationRoute,
    protectedEvidenceRoomRecipientAttestationApiRoute:
      publicMarketReadinessSummary.protectedEvidenceRoomRecipientAttestationApiRoute,
    protectedEvidenceRoomRecipientAttestationPacketApiRoute:
      publicMarketReadinessSummary.protectedEvidenceRoomRecipientAttestationPacketApiRoute,
    protectedEvidenceRoomAccessLogReconciliationRoute:
      publicMarketReadinessSummary.protectedEvidenceRoomAccessLogReconciliationRoute,
    protectedEvidenceRoomAccessLogReconciliationApiRoute:
      publicMarketReadinessSummary.protectedEvidenceRoomAccessLogReconciliationApiRoute,
    protectedEvidenceRoomAccessLogReconciliationPacketApiRoute:
      publicMarketReadinessSummary.protectedEvidenceRoomAccessLogReconciliationPacketApiRoute,
    protectedEvidenceRoomProviderAdapterRoute:
      publicMarketReadinessSummary.protectedEvidenceRoomProviderAdapterRoute,
    protectedEvidenceRoomProviderAdapterApiRoute:
      publicMarketReadinessSummary.protectedEvidenceRoomProviderAdapterApiRoute,
    protectedEvidenceRoomProviderAdapterPacketApiRoute:
      publicMarketReadinessSummary.protectedEvidenceRoomProviderAdapterPacketApiRoute,
    protectedProviderSecurityReviewRoute:
      publicMarketReadinessSummary.protectedProviderSecurityReviewRoute,
    protectedProviderSecurityReviewApiRoute:
      publicMarketReadinessSummary.protectedProviderSecurityReviewApiRoute,
    protectedProviderSecurityReviewPacketApiRoute:
      publicMarketReadinessSummary.protectedProviderSecurityReviewPacketApiRoute,
    protectedProcurementEvidenceRegistryRoute:
      publicMarketReadinessSummary.protectedProcurementEvidenceRegistryRoute,
    protectedProcurementEvidenceRegistryApiRoute:
      publicMarketReadinessSummary.protectedProcurementEvidenceRegistryApiRoute,
    protectedProcurementEvidenceRegistryPacketApiRoute:
      publicMarketReadinessSummary.protectedProcurementEvidenceRegistryPacketApiRoute,
    protectedClinicalAuthorityEvidenceRoomRoute: "/pilot-workspace/access",
    protectedClinicalAuthorityEvidenceRoomApiRoute:
      "/api/pilot-workspaces/{workspaceSlug}/clinical-authority-evidence-room",
    protectedClinicalAuthorityEvidenceRoomPacketApiRoute:
      "/api/pilot-workspaces/{workspaceSlug}/clinical-authority-evidence-room/packet",
    protectedClinicalAuthorityOwnerMatrixRoute:
      "/pilot-workspace/access#clinical-authority-owner-matrix",
    protectedClinicalAuthorityOwnerMatrixApiRoute:
      "/api/pilot-workspaces/{workspaceSlug}/clinical-authority-owner-matrix",
    protectedClinicalAuthorityOwnerMatrixPacketApiRoute:
      "/api/pilot-workspaces/{workspaceSlug}/clinical-authority-owner-matrix/packet",
    protectedClinicalAuthorityArtifactIntakeRoute:
      "/pilot-workspace/access#clinical-authority-artifact-intake",
    protectedClinicalAuthorityArtifactIntakeApiRoute:
      "/api/pilot-workspaces/{workspaceSlug}/clinical-authority-artifact-intake",
    protectedClinicalAuthorityArtifactIntakePacketApiRoute:
      "/api/pilot-workspaces/{workspaceSlug}/clinical-authority-artifact-intake/packet",
    protectedAuthorityArtifactReferenceRoute:
      "/pilot-workspace/access#authority-artifact-references",
    protectedAuthorityArtifactReferenceApiRoute:
      "/api/pilot-workspaces/{workspaceSlug}/authority-artifact-references",
    protectedAuthorityArtifactReferenceRenewalQueueApiRoute:
      "/api/pilot-workspaces/{workspaceSlug}/authority-artifact-references/renewal-queue",
    protectedAuthorityArtifactReferencePacketApiRoute:
      "/api/pilot-workspaces/{workspaceSlug}/authority-artifact-references/packet",
    persistentAgentWorkspaceRoute: persistentAgentWorkspaceSummary.route,
    operatingCommandCenterSummary,
    operatingCommandCenterRoute: operatingCommandCenterSummary.apiRoute.replace("/api", ""),
    operatingCommandCenterApiRoute: operatingCommandCenterSummary.apiRoute,
    operatingCommandCenterBriefRoute: operatingCommandCenterSummary.briefRoute,
    operatingCommandCenterLaneCount: operatingCommandCenterSummary.laneCount,
    operatingCommandCenterP0LaneCount: operatingCommandCenterSummary.p0LaneCount,
    operatingCommandCenterHighControlLaneCount:
      operatingCommandCenterSummary.highControlLaneCount,
    operatingCommandCenterEvidencePacketCount:
      operatingCommandCenterSummary.evidencePacketCount,
    operatingCommandCenterProtectedEvidencePacketCount:
      operatingCommandCenterSummary.protectedOperatorEvidencePacketCount,
    operatingCommandCenterBoundaryReleaseEvidencePacketCount:
      operatingCommandCenterSummary.boundaryReleaseEvidencePacketCount,
    operatingCommandCenterSyntheticCompleteEvidencePacketCount:
      operatingCommandCenterSummary.syntheticCompleteEvidencePacketCount,
    operatingCommandCenterValidationStatus: operatingCommandCenterSummary.validation.status,
    operatingCommandCenterNextBuildStep:
      operatingCommandCenterSummary.recommendedNextBuildStep,
    strategicIntelligenceRoute: strategicPlatformIntelligenceSummary.route,
    strategicIntelligenceApiRoute: strategicPlatformIntelligenceSummary.apiRoute,
    deploymentProfilesRoute: deploymentProfileSummary.route,
    deploymentProfilesApiRoute: deploymentProfileSummary.apiRoute,
    marketActivationRoute: marketActivationSummary.route,
    marketActivationApiRoute: marketActivationSummary.apiRoute,
    globalReachRoute: globalPartnerLocalizationSummary.route,
    globalReachApiRoute: globalPartnerLocalizationSummary.apiRoute,
    globalReachBriefRoute: globalPartnerLocalizationSummary.briefRoute,
    globalEnterpriseCommandSummary,
    globalEnterpriseCommandRoute: globalEnterpriseCommandSummary.route,
    globalEnterpriseCommandApiRoute: globalEnterpriseCommandSummary.apiRoute,
    globalEnterpriseCommandBriefRoute: globalEnterpriseCommandSummary.briefRoute,
    globalEnterpriseCommandRegionCount: globalEnterpriseCommandSummary.regionCommandCount,
    globalEnterpriseCommandLaunchRegionCount:
      globalEnterpriseCommandSummary.launchRegionCommandCount,
    globalEnterpriseCommandStrategicRegionCount:
      globalEnterpriseCommandSummary.strategicRegionCommandCount,
    globalEnterpriseCommandSalesPlaybookCount:
      globalEnterpriseCommandSummary.salesPlaybookCount,
    globalEnterpriseCommandInteroperabilityLaneCount:
      globalEnterpriseCommandSummary.interoperabilityLaneCount,
    globalEnterpriseCommandCommunicationLaneCount:
      globalEnterpriseCommandSummary.communicationLaneCount,
    globalEnterpriseCommandAverageReadinessScore:
      globalEnterpriseCommandSummary.averageRegionReadinessScore,
    boundaryResolutionRoute: boundaryResolutionSummary.route,
    boundaryResolutionApiRoute: boundaryResolutionSummary.apiRoute,
    boundaryResolutionBriefRoute: boundaryResolutionSummary.briefRoute,
    salesAttributionRoute: salesAttributionSummary.route,
    salesAttributionApiRoute: salesAttributionSummary.apiRoute,
    attributionAnalyticsRoute: attributionAnalyticsSummary.route,
    attributionAnalyticsApiRoute: attributionAnalyticsSummary.apiRoute,
    attributionAnalyticsAuthenticatedApiRoute: attributionAnalyticsSummary.authenticatedApiRoute,
    sourceIntelligenceRoute: sourceIntelligenceSummary.route,
    sourceIntelligenceApiRoute: sourceIntelligenceSummary.apiRoute,
    pilotEvidenceRoute: "/pilot-evidence",
    qaEvidenceRoute: qaEvidenceLedger.route,
    qaEvidenceApiRoute: qaEvidenceLedger.apiRoute,
    qaEvidenceBriefRoute: qaEvidenceLedger.briefRoute,
    qaEvidenceActivationPlanRoute: qaEvidenceLedger.activationPlan.route,
    qaEvidenceActivationPlanBriefRoute: qaEvidenceLedger.activationPlan.briefRoute,
    qaExecutionReadinessRoute: qaExecutionReadinessSummary.route,
    qaExecutionReadinessApiRoute: qaExecutionReadinessSummary.apiRoute,
    qaExecutionReadinessBriefRoute: qaExecutionReadinessSummary.briefRoute,
    qaRunControlRoute: qaRunControlSummary.route,
    qaRunControlApiRoute: qaRunControlSummary.apiRoute,
    qaRunControlBriefRoute: qaRunControlSummary.briefRoute,
    qaLaunchKitRoute: qaLaunchKitSummary.route,
    qaLaunchKitApiRoute: qaLaunchKitSummary.apiRoute,
    qaLaunchKitBriefRoute: qaLaunchKitSummary.briefRoute,
    qaHumanRunPacketRoute: qaHumanRunPacketSummary.route,
    qaHumanRunPacketApiRoute: qaHumanRunPacketSummary.apiRoute,
    qaHumanRunPacketBriefRoute: qaHumanRunPacketSummary.briefRoute,
    qaCompletionBridgeRoute: qaCompletionBridgeSummary.route,
    qaCompletionBridgeApiRoute: qaCompletionBridgeSummary.apiRoute,
    qaCompletionBridgeBriefRoute: qaCompletionBridgeSummary.briefRoute,
    qaClaimGuardRoute: qaClaimGuardSummary.route,
    qaClaimGuardApiRoute: qaClaimGuardSummary.apiRoute,
    qaClaimGuardBriefRoute: qaClaimGuardSummary.briefRoute,
    qaActivationSealRoute: qaActivationSealSummary.route,
    qaActivationSealApiRoute: qaActivationSealSummary.apiRoute,
    qaActivationSealBriefRoute: qaActivationSealSummary.briefRoute,
    qaProofPromotionRoute: qaProofPromotionSummary.route,
    qaProofPromotionApiRoute: qaProofPromotionSummary.apiRoute,
    qaProofPromotionBriefRoute: qaProofPromotionSummary.briefRoute,
    qaBuyerProofReleaseRoute: qaBuyerProofReleaseSummary.route,
    qaBuyerProofReleaseApiRoute: qaBuyerProofReleaseSummary.apiRoute,
    qaBuyerProofReleaseBriefRoute: qaBuyerProofReleaseSummary.briefRoute,
    qaBuyerProofReleaseProtectedRoute: qaBuyerProofReleaseSummary.protectedReleaseRoute,
    qaBuyerProofReleaseBuyerPacketRoute: qaBuyerProofReleaseSummary.buyerDiligencePacketRoute,
    buyerReleaseControlRunRoute: buyerReleaseControlRunSummary.route,
    buyerReleaseControlRunApiRoute: buyerReleaseControlRunSummary.apiRoute,
    buyerReleaseControlRunBriefRoute: buyerReleaseControlRunSummary.briefRoute,
    buyerReleaseControlRunProtectedVerifierRoute:
      buyerReleaseControlRunSummary.protectedVerifierRoute,
    buyerReleaseControlRunProtectedVerifierPacketRoute:
      buyerReleaseControlRunSummary.protectedVerifierPacketRoute,
    buyerReleaseControlRunProtectedVerifierTimelineRoute:
      buyerReleaseControlRunSummary.protectedVerifierTimelineRoute,
    qaManualExecutionConsoleRoute: qaManualExecutionConsoleSummary.route,
    qaManualExecutionConsoleApiRoute: qaManualExecutionConsoleSummary.apiRoute,
    qaManualExecutionConsoleBriefRoute: qaManualExecutionConsoleSummary.briefRoute,
    qaManualExecutionConsoleProtectedRoute: qaManualExecutionConsoleSummary.protectedRoute,
    qaManualExecutionConsoleProtectedWorkspaceRoute:
      qaManualExecutionConsoleSummary.protectedWorkspaceRoute,
    qaManualRunEvidencePacketRoute: qaEvidenceLedger.manualRunEvidenceCapture.route,
    qaManualRunEvidencePersistenceRoute:
      qaEvidenceLedger.manualRunEvidenceCapture.protectedPersistenceRoute,
    clinicalCareActivationStatus: clinicalCareActivationSummary.status,
    clinicalCareActivationGateCount: clinicalCareActivationSummary.gateCount,
    clinicalCareActivationBlockedCapabilityCount: clinicalCareActivationSummary.blockedCapabilities.length,
    releaseContinuityGateCount: releaseContinuitySummary.gateCount,
    releaseContinuityResolvedGateCount: releaseContinuitySummary.resolvedGateCount,
    releaseContinuityOperatorRequiredGateCount:
      releaseContinuitySummary.operatorRequiredGateCount,
    releaseContinuityCheckCount: releaseContinuitySummary.checkCount,
    releaseContinuityPassedCheckCount: releaseContinuitySummary.passedCheckCount,
    navigationAuditPageRouteCount: navigationAuditSummary.sourceTotals.pageRouteCount,
    navigationAuditApiRoutePatternCount: navigationAuditSummary.sourceTotals.apiRoutePatternCount,
    navigationAuditGroupCount: navigationAuditSummary.coverage.navigationGroupCount,
    navigationAuditSmokeCoveredHtmlRouteCount:
      navigationAuditSummary.coverage.smokeCoveredHtmlRouteCount,
    navigationAuditOperatorRequiredBottleneckCount:
      navigationAuditSummary.operatorRequiredBottleneckCount,
    navigationAuditExternalReviewBottleneckCount:
      navigationAuditSummary.externalReviewBottleneckCount,
    serviceReliabilityControlCount: serviceReliabilitySummary.controlCount,
    serviceReliabilityOpenGateCount: serviceReliabilitySummary.openGateCount,
    serviceReliabilityFaultClassCount: serviceReliabilitySummary.faultClassCount,
    serviceReliabilityHighSeverityFaultClassCount:
      serviceReliabilitySummary.highSeverityFaultClassCount,
    serviceReliabilityEfficiencyImprovementCount:
      serviceReliabilitySummary.efficiencyImprovementCount,
    serviceReliabilityOperatorRequiredControlCount:
      serviceReliabilitySummary.operatorRequiredControlCount,
    serviceReliabilityExternalReviewControlCount:
      serviceReliabilitySummary.externalReviewControlCount,
    serviceReliabilityProtectedGateControlCount:
      serviceReliabilitySummary.protectedGateControlCount,
    operationalEfficiencyRecordCount: operationalEfficiencySummary.recordCount,
    operationalEfficiencyOpenBottleneckCount: operationalEfficiencySummary.openBottleneckCount,
    operationalEfficiencySprintCount: operationalEfficiencySummary.sprintCount,
    operationalEfficiencyHardStopCount: operationalEfficiencySummary.hardStopCount,
    operationalEfficiencyProofRouteCount: operationalEfficiencySummary.proofRouteCount,
    operationalEfficiencyOwnerCount: operationalEfficiencySummary.ownerCount,
    operationalEfficiencyMetricCount: operationalEfficiencySummary.metricCount,
    operationalEfficiencyDiscrepancyFaultTriageCount:
      operationalEfficiencySummary.discrepancyFaultTriageCount,
    limitationsWorkaroundTrackCount: limitationsWorkaroundSummary.trackCount,
    limitationsWorkaroundPacketCount: limitationsWorkaroundSummary.packetCount,
    limitationsWorkaroundBoundaryEscalationCount:
      limitationsWorkaroundSummary.boundaryEscalationCount,
    limitationsResolutionWorkOrderCount:
      limitationsWorkaroundSummary.resolutionWorkOrderCount,
    limitationsUnresolvedResolutionWorkOrderCount:
      limitationsWorkaroundSummary.unresolvedResolutionWorkOrderCount,
    limitationsWorkaroundExecutionLedgerCount:
      limitationsWorkaroundSummary.executionLedgerCount,
    limitationsWorkaroundResolvedExecutionLedgerCount:
      limitationsWorkaroundSummary.resolvedExecutionLedgerCount,
    limitationsWorkaroundOpenRiskCount: limitationsWorkaroundSummary.openRiskCount,
    limitationsWorkaroundCriticalTrackCount: limitationsWorkaroundSummary.criticalTrackCount,
    limitationsWorkaroundHardStopCount: limitationsWorkaroundSummary.hardStopCount,
    limitationsWorkaroundProofRouteCount: limitationsWorkaroundSummary.proofRouteCount,
    launchReadinessTrackCount: launchReadinessSummary.launchTrackCount,
    launchReadinessReadyTrackCount: launchReadinessSummary.readyTrackCount,
    launchReadinessContainedTrackCount: launchReadinessSummary.containedTrackCount,
    launchReadinessOperatorRequiredTrackCount: launchReadinessSummary.operatorRequiredTrackCount,
    launchReadinessExternalReviewTrackCount:
      launchReadinessSummary.externalReviewRequiredTrackCount,
    launchReadinessDnsControlCount: launchReadinessSummary.dnsControlCount,
    launchReadinessServicePathCount: launchReadinessSummary.servicePathCount,
    launchReadinessRiskCount: launchReadinessSummary.riskCount,
    launchReadinessHighRiskCount: launchReadinessSummary.highRiskCount,
    launchReadinessHardStopCount: launchReadinessSummary.hardStopCount,
    competitiveMarketSourceCount: competitiveMarketIntelligenceSummary.sourceCount,
    competitiveMarketBuildPatternCount: competitiveMarketIntelligenceSummary.patternCount,
    competitiveMarketInitiativeCount: competitiveMarketIntelligenceSummary.initiativeCount,
    competitiveTargetAudienceStrategyCount:
      competitiveMarketIntelligenceSummary.targetAudienceStrategyCount,
    competitiveTargetAudienceSegmentCount:
      competitiveMarketIntelligenceSummary.targetAudienceSegmentCount,
    competitiveTargetAudienceProofRouteCount:
      competitiveMarketIntelligenceSummary.targetAudienceProofRouteCount,
    competitiveTargetAudienceBlockedClaimCount:
      competitiveMarketIntelligenceSummary.targetAudienceBlockedClaimCount,
    competitiveDefenseThreatProfileCount: competitiveDefenseSummary.competitorThreatProfileCount,
    competitiveDefenseStrengthHardeningTrackCount:
      competitiveDefenseSummary.strengthHardeningTrackCount,
    competitiveDefenseLegalPrivacyCyberControlCount:
      competitiveDefenseSummary.legalPrivacyCyberControlCount,
    competitiveDefenseInfiltrationDeterrenceLayerCount:
      competitiveDefenseSummary.infiltrationDeterrenceLayerCount,
    competitiveDefenseExternalReviewGateCount: competitiveDefenseSummary.externalReviewGateCount,
    competitiveDefenseHardenNowCount: competitiveDefenseSummary.hardenNowCount,
    competitiveDefenseExternalReviewRequiredCount:
      competitiveDefenseSummary.externalReviewRequiredCount,
    competitiveDefenseHardStopCount: competitiveDefenseSummary.hardStopCount,
    investorAudienceWeaknessTrackCount: investorAudienceReadinessSummary.weaknessTrackCount,
    investorAudienceHighWeaknessCount: investorAudienceReadinessSummary.highWeaknessCount,
    investorAudienceCompetitiveEdgeSignalCount:
      investorAudienceReadinessSummary.competitiveEdgeSignalCount,
    investorAudiencePacketCount: investorAudienceReadinessSummary.audiencePacketCount,
    investorAudienceReadyNowPacketCount: investorAudienceReadinessSummary.readyNowAudienceCount,
    investorAudienceExternalReviewPacketCount:
      investorAudienceReadinessSummary.externalReviewAudienceCount,
    investorAudienceReadinessGateCount: investorAudienceReadinessSummary.readinessGateCount,
    investorAudienceBlockedClaimCount: investorAudienceReadinessSummary.blockedClaimCount,
    healthcareIntelligenceClinicalWorkflowTrackCount:
      healthcareIntelligenceOSSummary.clinicalWorkflowAutomation.trackCount,
    healthcareIntelligencePatientSafetyControlCount:
      healthcareIntelligenceOSSummary.clinicalWorkflowAutomation.patientSafetyControlCount,
    healthcareIntelligencePatientEngagementSignalCount:
      healthcareIntelligenceOSSummary.clinicalWorkflowAutomation.patientEngagementAnalysisSignalCount,
    healthcareIntelligenceInteroperabilityBindingCount:
      healthcareIntelligenceOSSummary.clinicalWorkflowAutomation.interoperabilityBindingCount,
    healthcareIntelligenceClinicianBurdenReductionCount:
      healthcareIntelligenceOSSummary.clinicalWorkflowAutomation.clinicianBurdenReductionMotionCount,
    healthcareIntelligenceOperationsOptimizationLeverCount:
      healthcareIntelligenceOSSummary.clinicalWorkflowAutomation.operationsOptimizationLeverCount,
    healthcareIntelligenceWorkflowBlockedActionCount:
      healthcareIntelligenceOSSummary.clinicalWorkflowAutomation.blockedActionCount,
    healthRecordsCapabilityCount: healthRecordsSafetyExchangeSummary.capabilityCount,
    healthRecordsSafetyCheckCount: healthRecordsSafetyExchangeSummary.safetyCheckCount,
    healthRecordsBoundaryResolutionCount:
      healthRecordsSafetyExchangeSummary.boundaryResolutionCount,
    healthRecordsWorkaroundCount: healthRecordsSafetyExchangeSummary.workaroundCount,
    healthRecordsBlockedActionCount: healthRecordsSafetyExchangeSummary.blockedActionCount,
    capitalVitalityRevenueCapabilityCount: capitalVitalitySummary.revenueCapabilityCount,
    capitalVitalityPackagedRevenueCapabilityCount:
      capitalVitalitySummary.packagedRevenueCapabilityCount,
    capitalVitalityProtectedGatedRevenueCapabilityCount:
      capitalVitalitySummary.protectedGatedRevenueCapabilityCount,
    capitalVitalityExternalReviewRevenueCapabilityCount:
      capitalVitalitySummary.externalReviewRevenueCapabilityCount,
    capitalVitalityMoatSignalCount: capitalVitalitySummary.moatSignalCount,
    capitalVitalityHighMoatSignalCount: capitalVitalitySummary.highMoatSignalCount,
    capitalVitalityInvestorMilestoneCount: capitalVitalitySummary.investorMilestoneCount,
    capitalVitalityReadyInvestorMilestoneCount:
      capitalVitalitySummary.readyInvestorMilestoneCount,
    capitalVitalityFundingWorkstreamCount: capitalVitalitySummary.fundingWorkstreamCount,
    capitalVitalityActiveFundingWorkstreamCount:
      capitalVitalitySummary.activeFundingWorkstreamCount,
    capitalVitalityRetainedExternalReviewCount:
      capitalVitalitySummary.retainedExternalReviewCount,
    growthEnginePlayCount: growthEngineSummary.growthPlayCount,
    growthEngineExecuteNowPlayCount: growthEngineSummary.executeNowPlayCount,
    growthEngineConversionLaneCount: growthEngineSummary.conversionLaneCount,
    growthEngineProofLadderStepCount: growthEngineSummary.proofLadderStepCount,
    growthEngineBottleneckCount: growthEngineSummary.growthBottleneckCount,
    growthEngineProofRouteCount: growthEngineSummary.proofRouteCount,
    companyAssessmentOverallScore: companyAssessmentSummary.overallScore,
    companyAssessmentDimensionCount: companyAssessmentSummary.dimensionCount,
    companyAssessmentStrongDimensionCount: companyAssessmentSummary.strongDimensionCount,
    companyAssessmentWatchDimensionCount: companyAssessmentSummary.watchDimensionCount,
    companyAssessmentUpgradeNowDimensionCount: companyAssessmentSummary.upgradeNowDimensionCount,
    companyAssessmentExternalReviewDimensionCount:
      companyAssessmentSummary.externalReviewDimensionCount,
    companyAssessmentProtectedGatedDimensionCount:
      companyAssessmentSummary.protectedGatedDimensionCount,
    companyAssessmentWeaknessCount: companyAssessmentSummary.weaknessCount,
    companyAssessmentCriticalWeaknessCount: companyAssessmentSummary.criticalWeaknessCount,
    companyAssessmentHighWeaknessCount: companyAssessmentSummary.highWeaknessCount,
    companyAssessmentUpgradeWorkstreamCount: companyAssessmentSummary.upgradeWorkstreamCount,
    companyAssessmentAuditFindingCount: companyAssessmentSummary.auditFindingCount,
    companyAssessmentRevenueBuilderCount: companyAssessmentSummary.revenueBuilderCount,
    companyAssessmentCompetitiveEdgeAmplifierCount:
      companyAssessmentSummary.competitiveEdgeAmplifierCount,
    companyAssessmentImprovementPriorityCount: companyAssessmentSummary.improvementPriorityCount,
    companyAssessmentMissingCapabilityClosureCount:
      companyAssessmentSummary.missingCapabilityClosureCount,
    companyAssessmentCriticalMissingCapabilityClosureCount:
      companyAssessmentSummary.criticalMissingCapabilityClosureCount,
    companyAssessmentHardStopCount: companyAssessmentSummary.hardStopCount,
    companyAssessmentTeamLaneCount: companyAssessmentSummary.teamLaneCount,
    companyAssessmentEvidenceRouteCount: companyAssessmentSummary.evidenceRouteCount,
    clinicalProductionReady: clinicalProductionReadinessSummary.clinicalProductionReady,
    clinicalProductionReadinessScore: clinicalProductionReadinessSummary.readinessScore,
    clinicalProductionTaskCount: clinicalProductionReadinessSummary.taskCount,
    clinicalProductionIncompleteTaskCount: clinicalProductionReadinessSummary.incompleteTaskCount,
    clinicalProductionCriticalOpenTaskCount: clinicalProductionReadinessSummary.criticalOpenTaskCount,
    clinicalProductionExternalReviewTaskCount:
      clinicalProductionReadinessSummary.externalReviewTaskCount,
    clinicalProductionBlockedTaskCount: clinicalProductionReadinessSummary.blockedTaskCount,
    clinicalProductionCurrentCapabilityMotionCount:
      clinicalProductionReadinessSummary.currentCapabilityMotionCount,
    clinicalProductionActivateNowMotionCount:
      clinicalProductionReadinessSummary.activateNowMotionCount,
    clinicalProductionGateCount: clinicalProductionReadinessSummary.gateCount,
    clinicalProductionSourceReferenceCount:
      clinicalProductionReadinessSummary.sourceReferenceCount,
    productServicePortfolioOfferCount: productServicePortfolioSummary.offerCount,
    productServicePortfolioSellableNowOfferCount:
      productServicePortfolioSummary.sellableNowOfferCount,
    productServicePortfolioPackageCount: productServicePortfolioSummary.packageCount,
    productServicePortfolioMarginControlCount:
      productServicePortfolioSummary.marginControlCount,
    productServicePortfolioBoundaryResolutionCount:
      productServicePortfolioSummary.boundaryResolutionCount,
    productServicePortfolioProofRouteCount: productServicePortfolioSummary.proofRouteCount,
    productServicePortfolioBlockedClaimCount: productServicePortfolioSummary.blockedClaimCount,
    productServicePortfolioDeliveryPlaybookCount:
      productServicePortfolioSummary.deliveryPlaybookCount,
    serviceDeliveryOfferCount: serviceDeliverySummary.deliveryOfferCount,
    serviceDeliveryPhaseCount: serviceDeliverySummary.phaseCount,
    serviceDeliveryWorkOrderTemplateCount: serviceDeliverySummary.workOrderTemplateCount,
    serviceDeliveryArtifactCount: serviceDeliverySummary.artifactCount,
    serviceDeliveryActivationGateCount: serviceDeliverySummary.activationGateCount,
    serviceDeliveryBlockedBeforeApprovalGateCount:
      serviceDeliverySummary.blockedBeforeApprovalGateCount,
    serviceDeliveryPackageBindingCount: serviceDeliverySummary.packageBindingCount,
    serviceDeliveryEvidenceRouteCount: serviceDeliverySummary.evidenceRouteCount,
    serviceDeliveryAcceptanceCriteriaCount: serviceDeliverySummary.acceptanceCriteriaCount,
    serviceDeliveryMarginProtectionCount: serviceDeliverySummary.marginProtectionCount,
    serviceDeliveryHardStopCount: serviceDeliverySummary.hardStopCount,
    clientOnboardingStageCount: clientOnboardingCommunicationsSummary.stageCount,
    clientOnboardingTemplateCount: clientOnboardingCommunicationsSummary.templateCount,
    clientOnboardingCalendarPacketCount:
      clientOnboardingCommunicationsSummary.calendarPacketCount,
    clientOnboardingMeetingCadenceCount:
      clientOnboardingCommunicationsSummary.meetingCadenceCount,
    clientOnboardingPresentationPacketCount:
      clientOnboardingCommunicationsSummary.presentationPacketCount,
    clientOnboardingControlCount: clientOnboardingCommunicationsSummary.controlCount,
    clientOnboardingHandoffCount: clientOnboardingCommunicationsSummary.handoffCount,
    clientOnboardingBlockedContentCount:
      clientOnboardingCommunicationsSummary.blockedContentCount,
    clientOnboardingProofRouteCount: clientOnboardingCommunicationsSummary.proofRouteCount,
    enterpriseBusinessOpsRevenueCapabilityCount:
      enterpriseBusinessOpsSummary.revenueCapabilityCount,
    enterpriseBusinessOpsMarginControlCount: enterpriseBusinessOpsSummary.marginControlCount,
    enterpriseBusinessOpsTeamRoleCount: enterpriseBusinessOpsSummary.teamRoleCount,
    enterpriseBusinessOpsLegalRoleCount: enterpriseBusinessOpsSummary.legalRoleCount,
    enterpriseBusinessOpsFinanceAccountingTaxRoleCount:
      enterpriseBusinessOpsSummary.financeAccountingTaxRoleCount,
    enterpriseBusinessOpsEnterpriseControlCount:
      enterpriseBusinessOpsSummary.enterpriseControlCount,
    enterpriseBusinessOpsOperatingCadenceCount:
      enterpriseBusinessOpsSummary.operatingCadenceCount,
    enterpriseBusinessOpsProfitLeverCount: enterpriseBusinessOpsSummary.profitLeverCount,
    enterpriseBusinessOpsBlockedClaimCount: enterpriseBusinessOpsSummary.blockedClaimCount,
    enterpriseBusinessOpsSourceCount: enterpriseBusinessOpsSummary.sourceCount,
    enterpriseBusinessOpsOfficialSourceCount: enterpriseBusinessOpsSummary.officialSourceCount,
    enterpriseScalabilityDomainCount: enterpriseScalabilityOperationsSummary.domainCount,
    enterpriseScalabilityControlCount: enterpriseScalabilityOperationsSummary.controlCount,
    enterpriseScalabilityWorkstreamCount: enterpriseScalabilityOperationsSummary.workstreamCount,
    enterpriseScalabilityCadenceCount: enterpriseScalabilityOperationsSummary.cadenceCount,
    enterpriseScalabilityBottleneckCount: enterpriseScalabilityOperationsSummary.bottleneckCount,
    enterpriseScalabilityOpenBottleneckCount:
      enterpriseScalabilityOperationsSummary.openBottleneckCount,
    enterpriseScalabilityProofRouteCount: enterpriseScalabilityOperationsSummary.proofRouteCount,
    enterpriseScalabilityHardStopCount: enterpriseScalabilityOperationsSummary.hardStopCount,
    enterpriseScalabilityBlockedClaimCount: enterpriseScalabilityOperationsSummary.blockedClaimCount,
    platformPowerPillarCount: platformPowerSummary.pillarCount,
    platformPowerControlCount: platformPowerSummary.controlCount,
    platformPowerWorkstreamCount: platformPowerSummary.workstreamCount,
    platformPowerCadenceCount: platformPowerSummary.cadenceCount,
    platformPowerBottleneckCount: platformPowerSummary.bottleneckCount,
    platformPowerOpenBottleneckCount: platformPowerSummary.openBottleneckCount,
    platformPowerProofRouteCount: platformPowerSummary.proofRouteCount,
    platformPowerHardStopCount: platformPowerSummary.hardStopCount,
    platformPowerBlockedClaimCount: platformPowerSummary.blockedClaimCount,
    productionArchitectureLayerCount: productionArchitectureSummary.layerCount,
    productionArchitectureModelProviderCount: productionArchitectureSummary.modelProviderCount,
    productionArchitectureContextDomainCount: productionArchitectureSummary.contextDomainCount,
    productionArchitectureTrustControlCount: productionArchitectureSummary.trustControlCount,
    productionArchitectureEvaluationScenarioCount:
      productionArchitectureSummary.evaluationScenarioCount,
    productionArchitectureClinSecOpsControlCount:
      productionArchitectureSummary.clinSecOpsControlCount,
    productionArchitectureWorkflowTrackCount: productionArchitectureSummary.workflowTrackCount,
    productionArchitectureBlockedAutonomyCount: productionArchitectureSummary.blockedAutonomyCount,
    productionArchitectureValidationStatus: productionArchitectureSummary.validation.status,
    executionAttemptEnvelopeCount: executionAttemptEnvelopeSummary.envelopeCount,
    executionAttemptEnvelopeAcceptedCount:
      executionAttemptEnvelopeSummary.acceptedEnvelopeCount,
    executionAttemptEnvelopeReplayReadyCount: executionAttemptEnvelopeSummary.replayReadyCount,
    executionAttemptEnvelopeModelRouteTelemetryCount:
      executionAttemptEnvelopeSummary.modelRouteTelemetryCount,
    executionAttemptEnvelopeHumanReviewGateCount:
      executionAttemptEnvelopeSummary.humanReviewGateCount,
    executionAttemptEnvelopeScorecardCount: executionAttemptEnvelopeSummary.scorecardCount,
    executionAttemptEnvelopePassingScorecardCount:
      executionAttemptEnvelopeSummary.passingScorecardCount,
    executionAttemptEnvelopeBlockedCapabilityCount:
      executionAttemptEnvelopeSummary.blockedCapabilityCount,
    executionAttemptEnvelopeReleaseDecision:
      executionAttemptEnvelopeSummary.releaseDecision,
    executionAttemptDurableStoreRecordableEnvelopeCount:
      executionAttemptDurableStoreSummary.recordableEnvelopeCount,
    executionAttemptDurableStorePriorityCount:
      executionAttemptDurableStoreSummary.healthcareAIPriorityCount,
    executionAttemptDurableStoreValidationStatus:
      executionAttemptDurableStoreSummary.validation.status,
    approvalsReadinessStatus: approvalsReadinessSummary.status,
    approvalsReadinessTrackCount: approvalsReadinessSummary.trackCount,
    approvalsReadinessAgentControlCount: approvalsReadinessSummary.agentControlCount,
    approvalsReadinessExternalReviewCount: approvalsReadinessSummary.externalReviewCount,
    approvalsReadinessBlockedBeforeApprovalCount:
      approvalsReadinessSummary.blockedBeforeApprovalCount,
    globalCertificationReadinessStatus: globalCertificationReadinessSummary.status,
    globalCertificationReadinessTrackCount: globalCertificationReadinessSummary.trackCount,
    globalCertificationReadinessSourceCount: globalCertificationReadinessSummary.sourceCount,
    globalCertificationReadinessGateCount: globalCertificationReadinessSummary.gateCount,
    globalCertificationReadinessRegionalPackCount:
      globalCertificationReadinessSummary.regionalPackCount,
    globalCertificationReadinessBlockedClaimCount:
      globalCertificationReadinessSummary.blockedClaimCount,
    globalCertificationReadinessExternalReviewCount:
      globalCertificationReadinessSummary.externalReviewRequiredCount,
    continuousReviewAuditStatus: continuousReviewAuditSummary.status,
    continuousReviewAuditAgentCount: continuousReviewAuditSummary.agentCount,
    continuousReviewAuditLoopCount: continuousReviewAuditSummary.loopCount,
    continuousReviewAuditControlCount: continuousReviewAuditSummary.controlCount,
    continuousReviewAuditInnovationTrackCount:
      continuousReviewAuditSummary.innovationTrackCount,
    continuousReviewAuditInternalResearchAssignmentCount:
      continuousReviewAuditSummary.internalResearchAssignmentCount,
    continuousReviewAuditSourceCount: continuousReviewAuditSummary.sourceCount,
    continuousReviewAuditBlockedClaimCount: continuousReviewAuditSummary.blockedClaimCount,
    continuousReviewAuditHumanReviewRequiredAgentCount:
      continuousReviewAuditSummary.humanReviewRequiredAgentCount,
    clinicalAuthorityReadinessStatus: clinicalAuthorityReadinessSummary.status,
    clinicalAuthorityDomainCount: clinicalAuthorityReadinessSummary.authorityDomainCount,
    clinicalAuthorityBoundaryResolutionCount:
      clinicalAuthorityReadinessSummary.containedWithWorkaroundCount,
    clinicalAuthorityBlockedBeforeApprovalCount:
      clinicalAuthorityReadinessSummary.blockedBeforeApprovalCount,
    publicMarketKpiCount: publicMarketReadinessSummary.metricCount,
    publicMarketUnitEconomicsPackageCount: publicMarketReadinessSummary.unitEconomicsPackageCount,
    publicMarketComplianceLogCount: publicMarketReadinessSummary.complianceLogCount,
    publicMarketCustomerProofStageCount: publicMarketReadinessSummary.customerProofStageCount,
    publicMarketOperatorMetricCatalogCount: publicMarketReadinessSummary.operatorMetricCatalogCount,
    qaExecutionReadinessWorkflowCount: qaExecutionReadinessSummary.workflowCount,
    qaExecutionReadinessStageCount: qaExecutionReadinessSummary.stageCount,
    qaExecutionReadinessHumanRequiredStageCount:
      qaExecutionReadinessSummary.humanRequiredStages,
    qaRunControlWorkflowCount: qaRunControlSummary.workflowCount,
    qaRunControlGateCount: qaRunControlSummary.gateCount,
    qaRunControlCommandTemplateCount: qaRunControlSummary.commandTemplateCount,
    qaRunControlEvidenceTemplateCount: qaRunControlSummary.evidenceTemplateCount,
    qaLaunchKitPhaseCount: qaLaunchKitSummary.phaseCount,
    qaLaunchKitWorkflowCount: qaLaunchKitSummary.workflowCount,
    qaLaunchKitSafeCopyFieldCount: qaLaunchKitSummary.safeCopyFieldCount,
    qaLaunchKitBlockedClaimCount: qaLaunchKitSummary.blockedClaimCount,
    qaHumanRunPacketWorkflowCount: qaHumanRunPacketSummary.workflowCount,
    qaHumanRunPacketControlCount: qaHumanRunPacketSummary.controlCount,
    qaHumanRunPacketHardStopControlCount: qaHumanRunPacketSummary.hardStopControlCount,
    qaHumanRunPacketPostRunRouteCount: qaHumanRunPacketSummary.postRunRouteCount,
    qaHumanRunPacketBlockedClaimCount: qaHumanRunPacketSummary.blockedClaimCount,
    qaCompletionBridgeCheckpointCount: qaCompletionBridgeSummary.checkpointCount,
    qaCompletionBridgeHardStopCount: qaCompletionBridgeSummary.hardStopCount,
    qaCompletionBridgeSafeFieldCount: qaCompletionBridgeSummary.safeFieldCount,
    qaCompletionBridgeBlockedClaimCount: qaCompletionBridgeSummary.blockedClaimCount,
    qaClaimGuardRuleCount: qaClaimGuardSummary.ruleCount,
    qaClaimGuardSafeCurrentClaimCount: qaClaimGuardSummary.safeCurrentClaimCount,
    qaClaimGuardRetainedPacketClaimCount: qaClaimGuardSummary.retainedPacketClaimCount,
    qaClaimGuardBlockedAuthorityClaimCount: qaClaimGuardSummary.blockedAuthorityClaimCount,
    qaClaimGuardReviewTriggerCount: qaClaimGuardSummary.reviewTriggerCount,
    qaActivationSealRuleCount: qaActivationSealSummary.ruleCount,
    qaActivationSealHardStopRuleCount: qaActivationSealSummary.hardStopRuleCount,
    qaActivationSealRequiredEvidenceCount: qaActivationSealSummary.requiredEvidenceCount,
    qaActivationSealHardStopClaimCount: qaActivationSealSummary.hardStopClaimCount,
    qaProofPromotionRuleCount: qaProofPromotionSummary.ruleCount,
    qaProofPromotionHardStopRuleCount: qaProofPromotionSummary.hardStopRuleCount,
    qaProofPromotionBlockedClaimCount: qaProofPromotionSummary.blockedClaims.length,
    qaBuyerProofReleaseRuleCount: qaBuyerProofReleaseSummary.ruleCount,
    qaBuyerProofReleaseHardStopCount: qaBuyerProofReleaseSummary.hardStopCount,
    qaBuyerProofReleaseRequiredEvidenceCount: qaBuyerProofReleaseSummary.requiredEvidenceCount,
    qaBuyerProofReleaseBlockedClaimCount: qaBuyerProofReleaseSummary.blockedClaimCount,
    buyerReleaseControlRunStepCount: buyerReleaseControlRunSummary.stepCount,
    buyerReleaseControlRunProtectedRouteCount:
      buyerReleaseControlRunSummary.protectedWriteRouteCount,
    buyerReleaseControlRunPacketRouteCount: buyerReleaseControlRunSummary.packetRouteCount,
    buyerReleaseControlRunHardStopCount: buyerReleaseControlRunSummary.hardStopCount,
    qaManualExecutionConsoleStageCount: qaManualExecutionConsoleSummary.stageCount,
    qaManualExecutionConsoleHardStopCount: qaManualExecutionConsoleSummary.hardStopCount,
    qaManualExecutionConsoleWorkflowCount: qaManualExecutionConsoleSummary.workflowCount,
    qaManualExecutionConsoleBlockedClaimCount:
      qaManualExecutionConsoleSummary.blockedAuthorityClaimCount,
    status: "commercial-pilot-ready",
    offerCount: productOffers.length,
    serviceOfferCount: enterpriseServiceOffers.length,
    agentCount: productAgents.length,
    sellablePilots,
    demoCount: demoPilotProgramSummary.demoCount,
    executableDemos: demoPilotProgramSummary.executableDemos,
    pilotProgramCount: demoPilotProgramSummary.pilotCount,
    pilotDemoCommercialReadinessDemoPathCount:
      pilotDemoCommercialReadinessSummary.demoPathCount,
    pilotDemoCommercialReadinessMarketBenchmarkCount:
      pilotDemoCommercialReadinessSummary.marketBenchmarkCount,
    pilotDemoCommercialReadinessConversionStepCount:
      pilotDemoCommercialReadinessSummary.conversionStepCount,
    pilotDemoCommercialReadinessPricingAlignmentCount:
      pilotDemoCommercialReadinessSummary.pricingAlignmentCount,
    pilotDemoCommercialReadinessHardStopCount:
      pilotDemoCommercialReadinessSummary.hardStopCount,
    pilotDemoCommercialReadinessStandardPathScore:
      pilotDemoCommercialReadinessSummary.standardPathScore,
    workflowCount: productWorkflows.length,
    workflowEngineCount: workflowEngineExamples.length,
    buyerPilotRoomCompetitiveEdgeCount: buyerPilotRoomCompetitiveEdges.length,
    agentOSControlPlaneCount: agentOSSummary.controlPlane.length,
    atlasSubsystemCount: atlasIntelligenceCoreSummary.subsystems.length,
    trustCardCount: atlasIntelligenceCoreSummary.trustCards.length,
    trustOSControlCount: trustOSSummary.components.length,
    persistentAgentWorkspaceWorkOrderCount: persistentAgentWorkspaceSummary.workOrderCount,
    persistentAgentWorkspaceLimitationCount: persistentAgentWorkspaceSummary.limitationCount,
    strategicIntelligencePatternCount: strategicPlatformIntelligenceSummary.patternCount,
    strategicExecutionBetCount: strategicPlatformIntelligenceSummary.executionBetCount,
    strategicDecisionGateCount: strategicPlatformIntelligenceSummary.decisionGateCount,
    strategicExecutionCommandCount: strategicPlatformIntelligenceSummary.executionCommandCount,
    strategicCriticalExecutionCommandCount:
      strategicPlatformIntelligenceSummary.criticalExecutionCommandCount,
    strategicThisWeekExecutionCommandCount:
      strategicPlatformIntelligenceSummary.thisWeekExecutionCommandCount,
    strategicExecutionCommandProofRouteCount:
      strategicPlatformIntelligenceSummary.executionCommandProofRouteCount,
    strategicExecutionCommandBlockedExpansionCount:
      strategicPlatformIntelligenceSummary.executionCommandBlockedExpansionCount,
    strategicExecutionScorecardCount: strategicPlatformIntelligenceSummary.executionScorecardCount,
    strategicActiveExecutionScorecardCount:
      strategicPlatformIntelligenceSummary.activeExecutionScorecardCount,
    strategicProofReadyExecutionScorecardCount:
      strategicPlatformIntelligenceSummary.proofReadyExecutionScorecardCount,
    strategicExternalReviewExecutionScorecardCount:
      strategicPlatformIntelligenceSummary.externalReviewExecutionScorecardCount,
    strategicExecutionScorecardMissingProofCount:
      strategicPlatformIntelligenceSummary.executionScorecardMissingProofCount,
    deploymentProfileCount: deploymentProfileSummary.profileCount,
    revenueStreamCount: marketActivationSummary.revenueStreamCount,
    targetAudienceCount: marketActivationSummary.targetAudienceCount,
    globalRegionCount: globalPartnerLocalizationSummary.regionCount,
    globalBuyerPackCount: globalPartnerLocalizationSummary.buyerPackCount,
    globalPartnerChannelCount: globalPartnerLocalizationSummary.partnerChannelCount,
    globalBoundaryResolutionCount: globalPartnerLocalizationSummary.boundaryResolutionCount,
    boundaryResolutionRecordCount: boundaryResolutionSummary.recordCount,
    boundaryResolutionExternalGateCount: boundaryResolutionSummary.externalGateCount,
    boundaryResolutionHumanAal2RequiredCount: boundaryResolutionSummary.humanAal2RequiredCount,
    boundaryResolutionSafeWorkaroundCount: boundaryResolutionSummary.safeWorkaroundCount,
    sourceIntelligenceSourceCount: sourceIntelligenceSummary.sourceCount,
    attributionCapturedFieldCount: salesAttributionSummary.capturedFields.length,
    attributionAnalyticsRecordCount: attributionAnalyticsSummary.totals.recordCount,
    attributionCohortCount: attributionAnalyticsSummary.cohorts.length,
    trustSafetyAgentCount: trustSafetyOperationsSummary.agentCount,
    trustSafetyControlCount: trustSafetyOperationsSummary.controlCount,
    trustSafetyTargetAudienceCount: trustSafetyOperationsSummary.targetAudienceCount,
    trustSafetyIncidentCount: trustSafetyOperationsSummary.incidentCount,
    trustSafetyOpenIncidentCount: trustSafetyOperationsSummary.openIncidentCount,
    trustSafetyContainedIncidentCount: trustSafetyOperationsSummary.containedIncidentCount,
    trustSafetyLegalHoldWatchCount: trustSafetyOperationsSummary.legalHoldWatchCount,
    governanceControlCount: governanceControls.length,
    evidenceMetricCount: evidenceMetrics.length,
    buyerSegments: Array.from(new Set(productOffers.map((offer) => offer.buyer))),
    buyerPilotRoomRoute: "/pilot-workspace/access",
    buyerPilotRoomApiRoute: "/api/pilot-workspaces/{workspaceSlug}/buyer-room",
    buyerPilotRoomPacketApiRoute: "/api/pilot-workspaces/{workspaceSlug}/buyer-room/packet",
    commandIntelligenceHubRoute: "/pilot-workspace/access",
    commandIntelligenceHubApiRoute: "/api/pilot-workspaces/{workspaceSlug}/command-intelligence",
    commandIntelligenceSnapshotPacketApiRoute:
      "/api/pilot-workspaces/{workspaceSlug}/command-intelligence/{snapshotId}/packet",
    salesCommandCenterApiRoute,
    salesDealRoomRoute: salesDealRoomSummary.route,
    salesDealRoomApiRoute: salesDealRoomSummary.apiRoute,
    salesDealRoomProtectedPacketRoute: salesDealRoomSummary.protectedPacketRoute,
    opportunityWorkspaceProvisioningRoute: salesDealRoomSummary.workspaceProvisioningRoute,
    opportunityWorkspaceProvisioningPacketRoute: salesDealRoomSummary.workspaceProvisioningPacketRoute,
    buyerTenantLifecycleRoute: salesDealRoomSummary.buyerTenantLifecycleRoute,
    buyerTenantLifecyclePacketRoute: salesDealRoomSummary.buyerTenantLifecyclePacketRoute,
    productionActivationReadinessRoute: salesDealRoomSummary.productionActivationReadinessRoute,
    productionActivationReadinessPacketRoute:
      salesDealRoomSummary.productionActivationReadinessPacketRoute,
    customerActivationApprovalsRoute: salesDealRoomSummary.customerActivationApprovalsRoute,
    customerActivationApprovalsPacketRoute:
      salesDealRoomSummary.customerActivationApprovalsPacketRoute,
    buyerDiligenceRoomRoute: salesDealRoomSummary.buyerDiligenceRoomRoute,
    buyerDiligenceRoomPacketRoute: salesDealRoomSummary.buyerDiligenceRoomPacketRoute,
    secureEvidenceVaultReadinessRoute: salesDealRoomSummary.secureEvidenceVaultReadinessRoute,
    secureEvidenceVaultReadinessPacketRoute:
      salesDealRoomSummary.secureEvidenceVaultReadinessPacketRoute,
    buyerDemoExecutionPathRoute: buyerDemoExecutionPathApiRoute,
    buyerDemoExecutionBriefRoute: buyerDemoExecutionBriefApiRoute,
    buyerDemoSessionsRoute: buyerDemoSessionsApiRoute,
    buyerDemoSessionPacketRoute: buyerDemoSessionPacketApiRoute,
    buyerDemoSessionQaRoute: salesDemoSessionQaApiRoute,
    competitiveEdgeRoute: "/competitive-edge",
    productOffers,
    enterpriseServiceOffers,
    productAgents,
    productWorkflows,
    workflowEngineExamples,
    buyerPilotRoomCompetitiveEdges,
    governanceControls,
    evidenceMetrics,
    buyerActions,
    buyerDecisionPaths,
    deploymentStages,
    agentEvaluationWorkspaceSummary,
    agentOSSummary,
    atlasIntelligenceCoreSummary,
    trustOSSummary,
    commercialStrategySummary,
    companyOperationsSummary,
    enterpriseReadinessSummary,
    demoPilotProgramSummary,
    pilotDemoCommercialReadinessSummary,
    interoperabilitySummary,
    interoperabilityConformanceSummary,
    protectedPilotWorkspaceSummary,
    salesOperationsSummary,
    salesDealRoomSummary,
    persistentAgentWorkspaceSummary,
    strategicPlatformIntelligenceSummary,
    deploymentProfileSummary,
    marketActivationSummary,
    globalPartnerLocalizationSummary,
    releaseContinuitySummary,
    healthcareIntelligenceOSSummary,
    healthRecordsSafetyExchangeSummary,
    navigationAuditSummary,
    serviceReliabilitySummary,
    operationalEfficiencySummary,
    limitationsWorkaroundSummary,
    launchReadinessSummary,
    competitiveMarketIntelligenceSummary,
    competitiveDefenseSummary,
    capitalVitalitySummary,
    companyAssessmentSummary,
    clinicalProductionReadinessSummary,
    productServicePortfolioSummary,
    serviceDeliverySummary,
    clientOnboardingCommunicationsSummary,
    approvalsReadinessSummary,
    globalCertificationReadinessSummary,
    continuousReviewAuditSummary,
    boundaryResolutionSummary,
    enterpriseBusinessOpsSummary,
    enterpriseScalabilityOperationsSummary,
    platformPowerSummary,
    productionArchitectureSummary,
    executionAttemptEnvelopeSummary,
    executionAttemptDurableStoreSummary,
    clinicalAuthorityReadinessSummary,
    salesAttributionSummary,
    attributionAnalyticsSummary,
    trustSafetyOperationsSummary,
    sourceIntelligenceSummary,
    qaEvidenceLedger,
    qaExecutionReadinessSummary,
    qaRunControlSummary,
    qaLaunchKitSummary,
    qaHumanRunPacketSummary,
    qaCompletionBridgeSummary,
    qaClaimGuardSummary,
    qaActivationSealSummary,
    qaProofPromotionSummary,
    qaBuyerProofReleaseSummary,
    buyerReleaseControlRunSummary,
    qaManualExecutionConsoleSummary,
    clinicalCareActivationSummary,
    publicMarketReadinessSummary,
    investorAudienceReadinessSummary,
    growthEngineSummary,
    proofStack: {
      releaseContinuity: releaseContinuityProofStackStatus,
      releaseContinuityBrief: releaseContinuityBriefProofStackStatus,
      navigationAudit: navigationAuditProofStackStatus,
      navigationAuditBrief: navigationAuditBriefProofStackStatus,
      serviceReliability: serviceReliabilityProofStackStatus,
      serviceReliabilityBrief: serviceReliabilityBriefProofStackStatus,
      operationalEfficiency: operationalEfficiencyStatus,
      operationalEfficiencyBrief: operationalEfficiencyBriefStatus,
      automationAutopilot: scrimedAutomationAutopilotStatus,
      automationAutopilotBrief: scrimedAutomationAutopilotBriefStatus,
      strategicProblemResolution: strategicProblemResolutionStatus,
      strategicProblemResolutionBrief: strategicProblemResolutionBriefStatus,
      healthcareOptimizationCommand: healthcareOptimizationCommandStatus,
      healthcareOptimizationCommandBrief: healthcareOptimizationCommandBriefStatus,
      healthcareValueRealization: healthcareValueRealizationStatus,
      healthcareValueRealizationBrief: healthcareValueRealizationBriefStatus,
      pilotValueEvidence: pilotValueEvidenceStatus,
      pilotValueEvidenceBrief: pilotValueEvidenceBriefStatus,
      pilotActivationPlanner: pilotActivationPlannerStatus,
      pilotActivationPlannerBrief: pilotActivationPlannerBriefStatus,
      pilotHandoffCommand: pilotHandoffCommandStatus,
      pilotHandoffCommandBrief: pilotHandoffCommandBriefStatus,
      pilotSuccessReviewCommand: pilotSuccessReviewCommandStatus,
      pilotSuccessReviewCommandBrief: pilotSuccessReviewCommandBriefStatus,
      limitationsWorkarounds: limitationsWorkaroundStatus,
      limitationsWorkaroundsBrief: limitationsWorkaroundBriefStatus,
      launchReadiness: launchReadinessStatus,
      launchReadinessBrief: launchReadinessBriefStatus,
      globalEnterpriseCommand: globalEnterpriseCommandStatus,
      globalEnterpriseCommandBrief: globalEnterpriseCommandBriefStatus,
      competitiveMarketIntelligence: competitiveMarketIntelligenceSummary.status,
      competitiveDefense: competitiveDefenseStatus,
      competitiveDefenseBrief: competitiveDefenseBriefStatus,
      investorAudienceReadiness: investorAudienceReadinessStatus,
      investorAudienceReadinessBrief: investorAudienceReadinessBriefStatus,
      capitalVitality: capitalVitalityProofStackStatus,
      capitalVitalityBrief: capitalVitalityBriefProofStackStatus,
      growthEngine: growthEngineProofStackStatus,
      growthEngineBrief: growthEngineBriefProofStackStatus,
      companyAssessment: companyAssessmentStatus,
      companyAssessmentBrief: companyAssessmentBriefStatus,
      clinicalProductionReadiness: clinicalProductionReadinessStatus,
      clinicalProductionReadinessBrief: clinicalProductionReadinessBriefStatus,
      pilotDemoCommercialReadiness: pilotDemoCommercialReadinessStatus,
      pilotDemoCommercialReadinessBrief: pilotDemoCommercialReadinessBriefStatus,
      productServicePortfolio: productServicePortfolioStatus,
      productServicePortfolioBrief: productServicePortfolioBriefStatus,
      serviceDelivery: serviceDeliveryStatus,
      serviceDeliveryBrief: serviceDeliveryBriefStatus,
      clientOnboardingCommunications: clientOnboardingCommunicationsStatus,
      clientOnboardingCommunicationsBrief: clientOnboardingCommunicationsBriefStatus,
      enterpriseBusinessOps: enterpriseBusinessOpsStatus,
      enterpriseBusinessOpsBrief: enterpriseBusinessOpsBriefStatus,
      enterpriseScalabilityOperations: enterpriseScalabilityOperationsStatus,
      enterpriseScalabilityOperationsBrief: enterpriseScalabilityOperationsBriefStatus,
      platformPower: platformPowerStatus,
      platformPowerBrief: platformPowerBriefStatus,
      productionArchitecture: productionArchitectureStatus,
      productionArchitectureBrief: productionArchitectureBriefStatus,
      executionAttemptEnvelope: executionAttemptEnvelopeStatus,
      executionAttemptEnvelopeBrief: executionAttemptEnvelopeBriefStatus,
      executionAttemptDurableStore: executionAttemptDurableStoreStatus,
      executionAttemptDurableStoreBrief: executionAttemptDurableStoreBriefStatus,
      approvalsReadiness: approvalsReadinessStatus,
      approvalsReadinessBrief: approvalsReadinessBriefStatus,
      globalCertificationReadiness: globalCertificationReadinessStatus,
      globalCertificationReadinessBrief: globalCertificationReadinessBriefStatus,
      healthcareIntelligenceOS: healthcareIntelligenceOSSummary.status,
      healthcareClinicalWorkflowAutomation:
        healthcareIntelligenceOSSummary.clinicalWorkflowAutomation.status,
      healthRecordsSafetyExchange: healthRecordsSafetyExchangeStatus,
      healthRecordsSafetyExchangeBrief: healthRecordsSafetyExchangeBriefStatus,
      healthRecordsSyntheticExtraction: healthRecordsSafetyExchangeExtractionStatus,
      continuousReviewAudit: continuousReviewAuditStatus,
      continuousReviewAuditBrief: continuousReviewAuditBriefStatus,
      clinicalAuthorityReadiness: clinicalAuthorityReadinessStatus,
      clinicalAuthorityReadinessBrief: clinicalAuthorityReadinessBriefStatus,
      clinicalCareActivation: clinicalCareActivationProofStackStatus,
      clinicalActivationDossier: clinicalActivationDossierProofStackStatus,
      clinicalActivationApprovals: clinicalActivationApprovalWorkflowProofStackStatus,
      publicMarketReadiness: publicMarketReadinessProofStackStatus,
      publicMarketReadinessBrief: publicMarketReadinessBriefProofStackStatus,
      protectedOperatorMetrics: protectedOperatorMetricCaptureStatus,
      protectedMetricRollups: protectedMetricRollupStatus,
      protectedMetricRollupPackets: protectedMetricRollupPacketProofStackStatus,
      protectedMetricTrends: protectedMetricTrendReviewStatus,
      protectedMetricTrendPackets: protectedMetricTrendPacketProofStackStatus,
      protectedBoardScorecards: protectedBoardScorecardStatus,
      protectedBoardScorecardPackets: protectedBoardScorecardPacketProofStackStatus,
      protectedFinanceMethodologyGates: protectedFinanceMethodologyStatus,
      protectedFinanceMethodologyPackets: protectedFinanceMethodologyPacketProofStackStatus,
      protectedExternalApprovalEvidence: protectedExternalApprovalEvidenceStatus,
      protectedExternalApprovalEvidencePackets:
        protectedExternalApprovalEvidencePacketProofStackStatus,
      protectedReleaseDecisions: protectedReleaseDecisionWorkflowStatus,
      protectedReleaseDecisionPackets: protectedReleaseDecisionPacketProofStackStatus,
      protectedNamedReviewerSignoffs: protectedNamedReviewerSignoffStatus,
      protectedNamedReviewerSignoffPackets: protectedNamedReviewerSignoffPacketProofStackStatus,
      protectedDistributionLockboxes: protectedDistributionLockboxStatus,
      protectedDistributionLockboxPackets: protectedDistributionLockboxPacketProofStackStatus,
      protectedReleaseAuthorityAttestations: protectedReleaseAuthorityAttestationStatus,
      protectedReleaseAuthorityAttestationPackets:
        protectedReleaseAuthorityAttestationPacketProofStackStatus,
      protectedEvidenceRoomRecipientAttestations:
        protectedEvidenceRoomRecipientAttestationStatus,
      protectedEvidenceRoomRecipientAttestationPackets:
        protectedEvidenceRoomRecipientAttestationPacketProofStackStatus,
      protectedEvidenceRoomAccessLogReconciliations:
        protectedEvidenceRoomAccessLogReconciliationStatus,
      protectedEvidenceRoomAccessLogReconciliationPackets:
        protectedEvidenceRoomAccessLogReconciliationPacketProofStackStatus,
      protectedEvidenceRoomProviderAdapters:
        protectedEvidenceRoomProviderAdapterStatus,
      protectedEvidenceRoomProviderAdapterPackets:
        protectedEvidenceRoomProviderAdapterPacketProofStackStatus,
      protectedProviderSecurityReviews:
        protectedProviderSecurityReviewStatus,
      protectedProviderSecurityReviewPackets:
        protectedProviderSecurityReviewPacketProofStackStatus,
      protectedProcurementEvidenceRegistry:
        protectedProcurementEvidenceRegistryStatus,
      protectedProcurementEvidenceRegistryPackets:
        protectedProcurementEvidenceRegistryPacketProofStackStatus,
      protectedClinicalAuthorityEvidenceRoom:
        protectedClinicalAuthorityEvidenceRoomStatus,
      protectedClinicalAuthorityEvidenceRoomPackets:
        protectedClinicalAuthorityEvidenceRoomPacketStatus,
      protectedClinicalAuthorityOwnerMatrix:
        protectedClinicalAuthorityOwnerMatrixStatus,
      protectedClinicalAuthorityOwnerMatrixPackets:
        protectedClinicalAuthorityOwnerMatrixPacketStatus,
      protectedClinicalAuthorityArtifactIntake:
        protectedClinicalAuthorityArtifactIntakeStatus,
      protectedClinicalAuthorityArtifactIntakePackets:
        protectedClinicalAuthorityArtifactIntakePacketStatus,
      protectedAuthorityArtifactReferences:
        protectedAuthorityArtifactReferenceStatus,
      protectedAuthorityArtifactReferenceRenewalQueue:
        protectedAuthorityArtifactReferenceRenewalQueueStatus,
      protectedAuthorityArtifactReferencePackets:
        protectedAuthorityArtifactReferencePacketStatus,
      protectedAuthorityArtifactReferenceQaHarness:
        protectedAuthorityArtifactReferenceQaHarnessStatus,
      boundaryResolutionRegister: boundaryResolutionProofStackStatus,
      boundaryResolutionBrief: boundaryResolutionBriefProofStackStatus,
      globalPartnerLocalization: globalPartnerLocalizationStatus,
      globalPartnerLocalizationBrief: globalPartnerLocalizationBriefStatus,
      sourceIntelligence: sourceIntelligenceSummary.status,
      salesAttribution: salesAttributionSummary.status,
      attributionAnalytics: attributionAnalyticsSummary.status,
      trustSafetyOperations: trustSafetyOperationsSummary.status,
      tenantTrustOpsIncidents: "private-schema-rpc-guarded",
      passkeyTenantAuthentication: "passkey-or-magic-link-plus-aal2",
      passkeyManagement: "self-service-list-rename-register-revoke",
      enterpriseProofPackets: "tenant-admin-aggregate-write-before-release",
      tenantSessionVerification: "browser-aal2-no-secret-protected-route-checks",
      pilotDemoReadinessCommandCenter: pilotDemoReadinessProofStackStatus,
      pilotDemoReadinessPackets: pilotDemoReadinessPacketProofStackStatus,
      buyerPilotRoom: buyerPilotRoomProofStackStatus,
      buyerPilotRoomPackets: buyerPilotRoomPacketProofStackStatus,
      commandIntelligenceHub: commandIntelligenceHubProofStackStatus,
      commandIntelligenceSnapshots: commandIntelligenceSnapshotProofStackStatus,
      commandIntelligencePackets: commandIntelligencePacketProofStackStatus,
      salesCommandCenter: salesCommandCenterProofStackStatus,
      salesDealRoom: salesDealRoomProofStackStatus,
      salesDealRoomPackets: salesDealRoomPacketProofStackStatus,
      opportunityWorkspaceProvisioning: opportunityWorkspaceProvisioningProofStackStatus,
      opportunityWorkspaceProvisioningPackets: opportunityWorkspaceProvisioningPacketProofStackStatus,
      buyerTenantLifecycle: buyerTenantLifecycleProofStackStatus,
      buyerTenantLifecyclePackets: buyerTenantLifecyclePacketProofStackStatus,
      productionActivationReadiness: productionActivationReadinessProofStackStatus,
      productionActivationReadinessPackets: productionActivationReadinessPacketProofStackStatus,
      customerActivationApprovals: customerActivationApprovalsProofStackStatus,
      customerActivationApprovalPackets: customerActivationApprovalsPacketProofStackStatus,
      buyerDiligenceRoom: buyerDiligenceRoomProofStackStatus,
      buyerDiligenceRoomPackets: buyerDiligenceRoomPacketProofStackStatus,
      secureEvidenceVaultReadiness: secureEvidenceVaultReadinessProofStackStatus,
      secureEvidenceVaultReadinessPackets: secureEvidenceVaultReadinessPacketProofStackStatus,
      buyerDemoExecutionPath: buyerDemoExecutionPathProofStackStatus,
      buyerDemoExecutionBrief: buyerDemoExecutionBriefProofStackStatus,
      buyerDemoSessions: buyerDemoSessionProofStackStatus,
      buyerDemoSessionPackets: buyerDemoSessionPacketProofStackStatus,
      buyerDemoSessionQa: salesDemoSessionQaProofStackStatus,
      buyerDemoSessionQaTokenPolicy: salesDemoSessionQaTokenPolicyStatus,
      qaEvidenceLedger: qaEvidenceLedgerProofStackStatus,
      qaManualRunEvidencePacket: qaEvidenceLedger.manualRunEvidenceCapture.status,
      qaManualRunEvidencePersistence: qaManualRunEvidencePersistenceStatus,
      qaAuthorityReferenceEvidenceBridge: qaAuthorityReferenceEvidenceBridgeStatus,
      qaEvidenceActivationPlan: qaEvidenceActivationPlanStatus,
      qaExecutionReadiness: qaExecutionReadinessProofStackStatus,
      qaExecutionReadinessBrief: qaExecutionReadinessBriefProofStackStatus,
      qaRunControl: qaRunControlProofStackStatus,
      qaRunControlBrief: qaRunControlBriefProofStackStatus,
      qaLaunchKit: qaLaunchKitProofStackStatus,
      qaLaunchKitBrief: qaLaunchKitBriefProofStackStatus,
      qaHumanRunPacket: qaHumanRunPacketProofStackStatus,
      qaHumanRunPacketBrief: qaHumanRunPacketBriefProofStackStatus,
      qaCompletionBridge: qaCompletionBridgeProofStackStatus,
      qaCompletionBridgeBrief: qaCompletionBridgeBriefProofStackStatus,
      qaClaimGuard: qaClaimGuardProofStackStatus,
      qaClaimGuardBrief: qaClaimGuardBriefProofStackStatus,
      qaActivationSeal: qaActivationSealProofStackStatus,
      qaActivationSealBrief: qaActivationSealBriefProofStackStatus,
      qaProofPromotion: qaProofPromotionProofStackStatus,
      qaProofPromotionBrief: qaProofPromotionBriefProofStackStatus,
      qaBuyerProofRelease: qaBuyerProofReleaseProofStackStatus,
      qaBuyerProofReleaseBrief: qaBuyerProofReleaseBriefProofStackStatus,
      buyerReleaseControlRun: buyerReleaseControlRunProofStackStatus,
      buyerReleaseControlRunBrief: buyerReleaseControlRunBriefProofStackStatus,
      protectedBuyerReleaseControlRun: protectedBuyerReleaseControlRunProofStackStatus,
      protectedBuyerReleaseControlRunPackets:
        protectedBuyerReleaseControlRunPacketProofStackStatus,
      protectedBuyerReleaseReadinessTimeline:
        protectedBuyerReleaseReadinessTimelineProofStackStatus,
      qaManualExecutionConsole: qaManualExecutionConsoleProofStackStatus,
      qaManualExecutionConsoleBrief: qaManualExecutionConsoleBriefProofStackStatus,
      publicProductionSmoke: "no-secret-route-readiness-and-fail-closed-checks",
      trustSafetyIncidentQueue: `${trustSafetyOperationsSummary.incidentCount} incident controls`,
      strategicPlatformIntelligence: strategicPlatformIntelligenceSummary.status,
      deploymentProfiles: deploymentProfileSummary.status,
      marketActivation: marketActivationSummary.status,
      persistentAgentWorkspace: persistentAgentWorkspaceSummary.status,
      pilotEvidenceDashboard: "enterprise-evidence-ready",
      pricingAndSales: commercialStrategySummary.status,
      demosAndPilots: demoPilotProgramSummary.status,
      operationsReadiness: companyOperationsSummary.status,
      enterpriseReadiness: enterpriseReadinessSummary.status,
      agentOS: agentOSSummary.status,
      agentEvaluationWorkspace: agentEvaluationWorkspaceSummary.status,
      atlasIntelligenceCore: atlasIntelligenceCoreSummary.status,
      trustOS: trustOSSummary.status,
      workflowExecution: workflowExecutionSummary.status,
      workflowResults: workflowExecutionResultSummary.status,
      resultValidation: workflowResultValidationSummary.status,
      executionContracts: workflowExecutionContractSummary.status,
      runtimeSafety: runtimeSafetyReadiness.status,
      agentGovernance: agentWorkflowSummary.status,
      interoperability: interoperabilitySummary.status,
      interoperabilityConformance: interoperabilityConformanceSummary.status,
      protectedPilotWorkspaces: protectedPilotWorkspaceSummary.status,
      salesOperations: salesOperationsSummary.status,
      qualityGates: qualityGateSummary.status
    },
    productionBoundary:
      "SCRIMED is sellable today as a governed synthetic pilot and enterprise operating-system evaluation surface; live clinical execution remains gated until customer scope, clinical governance, regulatory classification, identity, runtime safety, durable audit, privacy, connector, monitoring, rollback, and human-review controls are approved.",
    nextCommercialMove:
      "Use Pilot Demo Commercial Readiness before every demo, pilot, pricing, or buyer-call conversation so each demo resolves to one recommended pilot path, price band, proof asset list, no-PHI intake route, market benchmark, margin rule, and hard stop before custom work expands; use Clinical Production Readiness before any PHI, live-care, connector, clinical AI, certification, global production, customer go-live, or clinical-production language expands so required tasks, incomplete gates, external-review needs, current capability motions, source references, and hard stops stay explicit while SCRIMED keeps selling no-PHI demos, paid readiness services, synthetic pilots, diligence packets, and governance assessments; use Company Assessment first before launch, buyer campaigns, investor packet release, service expansion, board review, platform claims, certification conversations, protected proof release, or broader app promotion so product, service, revenue, margin, legal, finance, accounting, tax, security, AI, health-record, launch, approval, investor, limitation, team-lane, and hard-stop posture is explicit; use Launch Readiness before public launch, buyer campaigns, investor packet release, board review, or broader app promotion so branded-domain smoke, sandbox DNS classification, fallback-only boundaries, product/service launch tracks, and protected proof hard stops are explicit; use Competitive Defense before public competitor comparisons, sales decks, investor packets, privacy/security claims, or launch expansion so biggest-competitor threat profiles, weakness relief, no-copy boundaries, legal/privacy/cyber controls, infiltration-deterrence layers, and external review gates are explicit without creating partnership, parity, PHI, security-certification, penetration-test, legal, privacy, or protection-guarantee claims; use Service Delivery Workbench before any paid service kickoff so every package has no-PHI intake, scope matrix, acceptance criteria, work-order templates, artifacts, margin protections, buyer handoff, and retained no-SLA, no-contract, no-PHI, no-live-care gates; use Enterprise Business Ops to route every enterprise opportunity through deal desk, price floor, margin model, counsel review, accounting/revenue-recognition triage, tax awareness, billing readiness, contract authority, and blocked-claim controls before proposal release; use Growth Engine to prioritize buyer segments, sellable offers, conversion lanes, revenue proof steps, bottlenecks, owners, and proof routes without crossing revenue guarantee, securities, valuation, legal, tax, reimbursement, PHI, security, connector, or live-care boundaries; use Investor and Audience Readiness to turn weaknesses into owned relief tracks and route angel, corporate strategic, private investor, faith-based clinic, public-sector, payer, health-system, clinician, global-partner, and transformation-sponsor conversations into the right packet without crossing securities, solicitation, valuation, tax, legal, donor, customer-permission, PHI, clinical, reimbursement, certification, partnership, revenue, or profit boundaries; use Capital Vitality to keep revenue capabilities, competitive moat evidence, investor-readiness milestones, funding workstreams, and external-review gates visible without crossing securities, valuation, legal, reimbursement, PHI, security, or live-care boundaries; use Service Reliability to keep product and service controls, fault classes, efficiency improvements, owners, proof routes, open gates, and retained approval boundaries visible before claims expand; use Operational Efficiency to centralize cross-system gaps, inefficiencies, bottlenecks, hard stops, proof-route density, owners, and resolution sprints before work becomes informal process memory; use Limitations and Workaround Operations whenever a request is blocked so SCRIMED has a safe packet, escalation owner, proof route, expiration rule, and graduation gate instead of informal exceptions; use Navigation Audit to keep the page route inventory, API route count, navigation groups, smoke scope, protected fail-closed checks, and retained AAL2 or external-review boundaries visible before each release; use Release Continuity to keep production, GitHub, smoke checks, and AAL2 operator boundaries checkpointed after every deploy; use Approvals Readiness as the public operating ladder for intended use, HIPAA/BAA, SOC 2/HITRUST, FDA/CDS/SaMD, ONC/connectors, state care-delivery review, and buyer-specific release gates; use Global Certification Readiness to turn HIPAA, FDA, SOC 2, HITRUST, ISO, EU AI Act, GDPR, NHS DTAC, MHRA, Australia Essential Eight, and regional certification questions into evidence packets without claiming approval early; use Continuous Review and Audit to run 24/7 agent-assisted accuracy review, evidence attribution, claims guard, security drift, QA regression, incident learning, and internal innovation research without autonomous production remediation or public quantum claims; use Boundary Resolution Register to keep every known hard gate owned, evidenced, and safely worked around; use Clinical Authority Readiness to prepare live-care, PHI, legal, regional, reimbursement, security-certification, connector, and production-authorization gates without crossing them; use Global Reach to choose region, buyer pack, partner channel, procurement path, and retained approval gates; use Sales Attribution to convert every safe buyer signal into source-aware opportunity routing; use Attribution Analytics to compare source-to-pilot cohorts; use Tenant TrustOps incident workspaces to prove enterprise risk governance; use Market Activation to focus message; use Sales Operations to qualify retained buyer intake; use Deployment Profiles to scope infrastructure readiness; use Manual AAL2 QA Launch Kit to hand an approved operator exact no-secret dispatch, evidence, and secret-disposal instructions; use QA Human Run Packet to validate the bounded human AAL2 dispatch before workflow execution; use the protected Manual QA Execution Console as the operator command lane for dispatch, retained packet visibility, audit signals, and Buyer Proof Release state; use QA Completion Bridge to validate the post-run candidate before protected persistence; use QA Claim Guard to prevent sales, investor, buyer, PR, and operator overclaims while retained packet proof is pending; use QA Activation Seal as the final no-secret seal check before buyer proof language; use Manual QA Proof Promotion to prevent retained authenticated QA claims until protected no-secret packet hashes are visible; use QA Buyer Proof Release as the protected go/no-go gate before Buyer Diligence references retained QA proof; use Buyer Release Control Runbook to complete the external approval, release decision, reviewer signoff, lockbox, authority, recipient, and access-log chain before any buyer-specific external sharing; then use the authenticated Buyer Demo Execution Path plus persisted Buyer Demo Sessions, AAL2 buyer-demo QA harness, external approval evidence linkage, and protected release decision claim registry to sequence, record, verify, and release audited Pilot Deal Room, Buyer Pilot Room, lifecycle, production-readiness, paid-pilot activation approval, buyer diligence, and secure evidence vault readiness packets before any customer SSO, automated invitation, signed document storage, public distribution, or production connector step.",
    updated: "2026-06-26"
  };
}

let productConsoleApiSummaryCache: Record<string, unknown> | null = null;

function withFreshP34ReviewReadiness(summary: Record<string, unknown>) {
  const review = getP34ReviewReadinessSummary();
  const preview = getP34PreviewAcceptanceSummary();
  summary.p34ReviewReadiness = review;
  summary.p34PreviewAcceptance = preview;
  if (Array.isArray(summary.priorityGates)) {
    summary.priorityGates = summary.priorityGates.map((gate) => {
      if (!gate || typeof gate !== "object") return gate;
      const record = gate as { id?: string; state?: string };
      if (record.id === "review") return { ...record, state: review.review.state };
      if (record.id === "preview") return { ...record, state: preview.status };
      return record;
    });
  }
  summary.p34CurrentCandidatePosture = {
    branch: summary.runtimeBranch ?? null,
    commitSha: review.candidate.commitSha,
    candidateFingerprint: review.candidate.fingerprint,
    currentPullRequest: review.currentPullRequest,
    predecessorPullRequest: review.predecessorPullRequest,
    reviewState: review.review.state,
    previewState: preview.status,
    aal2State: "OPERATOR_ACTION_REQUIRED",
    supabaseLeakedPasswordProtection: "OPERATOR_ACTION_REQUIRED",
    migrationState: "THREE_PENDING_PRODUCTION_UNAPPLIED",
    autonomyCeiling: "A2_REVIEW_ONLY",
    syntheticPilotAuthority: "BOUNDED_SCOPE_APPROVAL_REQUIRED",
    protectedPilotAuthority: false,
    productionAuthority: false,
    customerActivationAuthority: false
  };
  return summary;
}

export function getProductConsoleApiSummary() {
  if (productConsoleApiSummaryCache) {
    return withFreshP34ReviewReadiness(productConsoleApiSummaryCache);
  }

  const summary = getProductConsoleSummary();
  const {
    companyAssessmentSummary,
    executionAttemptEnvelopeSummary,
    healthcareIntelligenceOSSummary,
    healthcareOptimizationCommandSummary,
    healthcareValueRealizationSummary,
    pilotActivationPlannerSummary,
    pilotHandoffCommandSummary,
    pilotSuccessReviewCommandSummary,
    pilotValueEvidenceSummary,
    productionArchitectureSummary,
    salesOperationsSummary,
    strategicPlatformIntelligenceSummary
  } = summary;
  // The full page model contains large repeated collections. The API keeps its
  // stable scalar contract and sends callers to dedicated routes for details.
  const apiSummary = Object.fromEntries(
    Object.entries(summary).filter(
      ([key, value]) =>
        !key.endsWith("Summary") &&
        (value === null || ["string", "number", "boolean"].includes(typeof value))
    )
  );

  productConsoleApiSummaryCache = {
    ...apiSummary,
    payloadProfile: "compact-api-v2",
    priorityGates: summary.p34PriorityGates,
    proofStack: summary.proofStack,
    detailRoutes: {
      companyAssessment: companyAssessmentSummary.apiRoute,
      enterpriseBusinessOperations: summary.enterpriseBusinessOpsApiRoute,
      boundaryResolution: summary.boundaryResolutionApiRoute,
      operationalEfficiency: summary.operationalEfficiencyApiRoute,
      growthEngine: summary.growthEngineApiRoute,
      investorAudienceReadiness: summary.investorAudienceReadinessApiRoute
    },
    companyAssessmentSummary: {
      route: companyAssessmentSummary.route,
      apiRoute: companyAssessmentSummary.apiRoute,
      briefRoute: companyAssessmentSummary.briefRoute,
      status: companyAssessmentSummary.status,
      overallScore: companyAssessmentSummary.overallScore,
      dimensionCount: companyAssessmentSummary.dimensionCount,
      weaknessCount: companyAssessmentSummary.weaknessCount,
      hardStopCount: companyAssessmentSummary.hardStopCount,
      boundary: companyAssessmentSummary.boundary,
      detailAvailableAt: companyAssessmentSummary.apiRoute
    },
    healthcareOptimizationCommandSummary: {
      blockedActions: healthcareOptimizationCommandSummary.blockedActions,
      detailAvailableAt: healthcareOptimizationCommandSummary.apiRoute
    },
    healthcareValueRealizationSummary: {
      blockedActions: healthcareValueRealizationSummary.blockedActions,
      detailAvailableAt: healthcareValueRealizationSummary.apiRoute
    },
    pilotValueEvidenceSummary: {
      blockedClaims: pilotValueEvidenceSummary.blockedClaims,
      detailAvailableAt: pilotValueEvidenceSummary.apiRoute
    },
    pilotActivationPlannerSummary: {
      blockedActions: pilotActivationPlannerSummary.blockedActions,
      detailAvailableAt: pilotActivationPlannerSummary.apiRoute
    },
    pilotHandoffCommandSummary: {
      blockedActions: pilotHandoffCommandSummary.blockedActions,
      detailAvailableAt: pilotHandoffCommandSummary.apiRoute
    },
    pilotSuccessReviewCommandSummary: {
      blockedClaims: pilotSuccessReviewCommandSummary.blockedClaims,
      detailAvailableAt: pilotSuccessReviewCommandSummary.apiRoute
    },
    productionArchitectureSummary: {
      readinessAssessment: productionArchitectureSummary.readinessAssessment,
      modelProviderMesh: productionArchitectureSummary.modelProviderMesh.map(({ name }) => ({
        name
      })),
      detailAvailableAt: productionArchitectureSummary.apiRoute
    },
    executionAttemptEnvelopeSummary: {
      boundary: executionAttemptEnvelopeSummary.boundary,
      detailAvailableAt: executionAttemptEnvelopeSummary.apiRoute
    },
    healthcareIntelligenceOSSummary: {
      clinicalWorkflowAutomation: {
        blockedActions: healthcareIntelligenceOSSummary.clinicalWorkflowAutomation.blockedActions
      },
      detailAvailableAt: healthcareIntelligenceOSSummary.apiRoute
    },
    strategicPlatformIntelligenceSummary: {
      executionScorecards: strategicPlatformIntelligenceSummary.executionScorecards.map(
        ({ commandSlug, evidenceState, scoreState }) => ({
          commandSlug,
          evidenceState,
          scoreState
        })
      ),
      recommendedStrategicSequence:
        strategicPlatformIntelligenceSummary.recommendedStrategicSequence,
      executionCommands: strategicPlatformIntelligenceSummary.executionCommands.map(({ slug }) => ({
        slug
      })),
      executionBets: strategicPlatformIntelligenceSummary.executionBets.map(({ slug }) => ({ slug })),
      decisionGates: strategicPlatformIntelligenceSummary.decisionGates.map(({ slug }) => ({ slug })),
      detailAvailableAt: strategicPlatformIntelligenceSummary.apiRoute
    },
    salesOperationsSummary: {
      authentication: salesOperationsSummary.authentication,
      detailAvailableAt: salesOperationsSummary.apiRoute
    }
  };

  return withFreshP34ReviewReadiness(productConsoleApiSummaryCache);
}

export function getProductReadinessBrief() {
  const summary = getProductConsoleSummary();

  return [
    "# SCRIMED Product Readiness Brief",
    "",
    `Status: ${summary.status}`,
    `Boundary: ${summary.productionBoundary}`,
    "",
    "## Enterprise Offers",
    ...summary.enterpriseServiceOffers.map((offer) => `- ${offer.name}: ${offer.deliverable}`),
    "",
    "## Product Demos and Pilot Programs",
    `Company Assessment: ${summary.companyAssessmentRoute}`,
    `Company Assessment API: ${summary.companyAssessmentApiRoute}`,
    `Company Assessment Brief: ${summary.companyAssessmentBriefRoute}`,
    `Company Assessment Score: ${summary.companyAssessmentOverallScore}`,
    `Company Assessment Dimensions: ${summary.companyAssessmentDimensionCount}`,
    `Company Assessment Weakness Relief Items: ${summary.companyAssessmentWeaknessCount}`,
    `Company Assessment Upgrade Workstreams: ${summary.companyAssessmentUpgradeWorkstreamCount}`,
    `Company Assessment Audit Findings: ${summary.companyAssessmentAuditFindingCount}`,
    `Company Assessment Revenue Builders: ${summary.companyAssessmentRevenueBuilderCount}`,
    `Company Assessment Competitive Edge Amplifiers: ${summary.companyAssessmentCompetitiveEdgeAmplifierCount}`,
    `Company Assessment Improvement Priorities: ${summary.companyAssessmentImprovementPriorityCount}`,
    `Company Assessment Missing Capability Closures: ${summary.companyAssessmentMissingCapabilityClosureCount}`,
    `Company Assessment Critical Missing Capability Closures: ${summary.companyAssessmentCriticalMissingCapabilityClosureCount}`,
    `Company Assessment Team Lanes: ${summary.companyAssessmentTeamLaneCount}`,
    `Company Assessment Hard Stops: ${summary.companyAssessmentHardStopCount}`,
    summary.companyAssessmentSummary.boundary,
    ...summary.companyAssessmentSummary.dimensions.map(
      (dimension) =>
        `- Company dimension: ${dimension.name} (${dimension.status}, ${dimension.score}/100) -> ${dimension.upgrade}`
    ),
    ...summary.companyAssessmentSummary.weaknessReliefQueue.map(
      (weakness) =>
        `- Company weakness relief: ${weakness.name} (${weakness.severity}) -> ${weakness.reliefMove}`
    ),
    ...summary.companyAssessmentSummary.missingCapabilityClosures.map(
      (capability) =>
        `- Missing capability closure: ${capability.capability} (${capability.severity}) -> ${capability.currentWorkaround}; build ${capability.permanentBuild}`
    ),
    ...summary.companyAssessmentSummary.revenueBuilders.map(
      (builder) =>
        `- Company revenue builder: ${builder.name} -> ${builder.conversionPath}`
    ),
    ...summary.companyAssessmentSummary.competitiveEdgeAmplifiers.map(
      (edge) =>
        `- Company competitive edge: ${edge.name} -> ${edge.makeApparentBy}`
    ),
    `Clinical Production Readiness: ${summary.clinicalProductionReadinessRoute}`,
    `Clinical Production Readiness API: ${summary.clinicalProductionReadinessApiRoute}`,
    `Clinical Production Readiness Brief: ${summary.clinicalProductionReadinessBriefRoute}`,
    `Clinical Production Ready: ${summary.clinicalProductionReady ? "yes" : "no"}`,
    `Clinical Production Readiness Score: ${summary.clinicalProductionReadinessScore}`,
    `Clinical Production Required Tasks: ${summary.clinicalProductionTaskCount}`,
    `Clinical Production Incomplete Tasks: ${summary.clinicalProductionIncompleteTaskCount}`,
    `Clinical Production Critical Open Tasks: ${summary.clinicalProductionCriticalOpenTaskCount}`,
    `Clinical Production External Review Tasks: ${summary.clinicalProductionExternalReviewTaskCount}`,
    `Clinical Production Current Capability Motions: ${summary.clinicalProductionCurrentCapabilityMotionCount}`,
    summary.clinicalProductionReadinessSummary.boundary,
    ...summary.clinicalProductionReadinessSummary.nextTasks.map(
      (task) =>
        `- Clinical production next task: ${task.id} (${task.priority}, ${task.status}) -> ${task.task}`
    ),
    ...summary.clinicalProductionReadinessSummary.currentCapabilityMotions.map(
      (motion) =>
        `- Current capability motion: ${motion.name} (${motion.status}) -> ${motion.nextAction}`
    ),
    `Pilot Demo Commercial Readiness: ${summary.pilotDemoCommercialReadinessRoute}`,
    `Pilot Demo Commercial Readiness API: ${summary.pilotDemoCommercialReadinessApiRoute}`,
    `Pilot Demo Commercial Readiness Brief: ${summary.pilotDemoCommercialReadinessBriefRoute}`,
    `Pilot Demo Commercial Paths: ${summary.pilotDemoCommercialReadinessDemoPathCount}`,
    `Pilot Demo Market Benchmarks: ${summary.pilotDemoCommercialReadinessMarketBenchmarkCount}`,
    `Pilot Demo Pricing Alignments: ${summary.pilotDemoCommercialReadinessPricingAlignmentCount}`,
    `Pilot Demo Standard Path Score: ${summary.pilotDemoCommercialReadinessStandardPathScore}`,
    summary.pilotDemoCommercialReadinessSummary.boundary,
    ...summary.pilotDemoCommercialReadinessSummary.demoOfferPaths.map(
      (path) =>
        `- Demo commercial path: ${path.name} -> ${path.recommendedPilotName}; ${path.pricingBand}`
    ),
    ...summary.pilotDemoCommercialReadinessSummary.pricingTierAlignments.map(
      (alignment) =>
        `- Pricing alignment: ${alignment.tier} -> ${alignment.recommendedBand}`
    ),
    `Launch Readiness: ${summary.launchReadinessRoute}`,
    `Launch Readiness API: ${summary.launchReadinessApiRoute}`,
    `Launch Readiness Brief: ${summary.launchReadinessBriefRoute}`,
    `Launch Tracks: ${summary.launchReadinessTrackCount}`,
    `Launch DNS Controls: ${summary.launchReadinessDnsControlCount}`,
    `Launch Service Paths: ${summary.launchReadinessServicePathCount}`,
    `Launch High Risks: ${summary.launchReadinessHighRiskCount}`,
    `Launch Hard Stops: ${summary.launchReadinessHardStopCount}`,
    summary.launchReadinessSummary.boundary,
    ...summary.launchReadinessSummary.launchDnsControls.map(
      (control) =>
        `- Launch DNS control: ${control.name} (${control.status}) -> ${control.launchRule}`
    ),
    ...summary.launchReadinessSummary.launchReadinessTracks.map(
      (track) => `- Launch track: ${track.name} (${track.status}) -> ${track.goNoGoGate}`
    ),
    `Competitive Market Intelligence: ${summary.competitiveMarketIntelligenceRoute}`,
    `Competitive Market Intelligence API: ${summary.competitiveMarketIntelligenceApiRoute}`,
    `Competitive Market Sources: ${summary.competitiveMarketSourceCount}`,
    `Competitive Market Build Patterns: ${summary.competitiveMarketBuildPatternCount}`,
    `Competitive Target Audience Strategies: ${summary.competitiveTargetAudienceStrategyCount}`,
    `Competitive Target Audience Proof Routes: ${summary.competitiveTargetAudienceProofRouteCount}`,
    summary.competitiveMarketIntelligenceSummary.boundary,
    ...summary.competitiveMarketIntelligenceSummary.targetAudienceStrategies.map(
      (strategy) =>
        `- Competitive audience strategy: ${strategy.targetAudience} (${strategy.priority}) -> ${strategy.salesMessage}; trigger ${strategy.conversionTrigger}`
    ),
    `Competitive Defense: ${summary.competitiveDefenseRoute}`,
    `Competitive Defense API: ${summary.competitiveDefenseApiRoute}`,
    `Competitive Defense Brief: ${summary.competitiveDefenseBriefRoute}`,
    `Competitive Threat Profiles: ${summary.competitiveDefenseThreatProfileCount}`,
    `Competitive Defense Legal Privacy Cyber Controls: ${summary.competitiveDefenseLegalPrivacyCyberControlCount}`,
    `Competitive Defense Infiltration Layers: ${summary.competitiveDefenseInfiltrationDeterrenceLayerCount}`,
    `Competitive Defense Hard Stops: ${summary.competitiveDefenseHardStopCount}`,
    summary.competitiveDefenseSummary.boundary,
    ...summary.competitiveDefenseSummary.threatProfiles.map(
      (profile) => `- Defense profile: ${profile.competitor} -> ${profile.counterPosition}`
    ),
    ...summary.competitiveDefenseSummary.legalPrivacyCyberControls.map(
      (control) => `- Legal/privacy/cyber control: ${control.control} -> ${control.retainedBoundary}`
    ),
    `Enterprise Business Ops: ${summary.enterpriseBusinessOpsRoute}`,
    `Enterprise Business Ops API: ${summary.enterpriseBusinessOpsApiRoute}`,
    `Enterprise Business Ops Brief: ${summary.enterpriseBusinessOpsBriefRoute}`,
    `Enterprise Business Ops Revenue Capabilities: ${summary.enterpriseBusinessOpsRevenueCapabilityCount}`,
    `Enterprise Business Ops Margin Controls: ${summary.enterpriseBusinessOpsMarginControlCount}`,
    `Enterprise Business Ops Team Roles: ${summary.enterpriseBusinessOpsTeamRoleCount}`,
    `Enterprise Business Ops Legal Roles: ${summary.enterpriseBusinessOpsLegalRoleCount}`,
    `Enterprise Business Ops Finance/Accounting/Tax Roles: ${summary.enterpriseBusinessOpsFinanceAccountingTaxRoleCount}`,
    `Enterprise Business Ops Controls: ${summary.enterpriseBusinessOpsEnterpriseControlCount}`,
    `Enterprise Business Ops Cadences: ${summary.enterpriseBusinessOpsOperatingCadenceCount}`,
    `Enterprise Business Ops Profit Levers: ${summary.enterpriseBusinessOpsProfitLeverCount}`,
    `Enterprise Business Ops Blocked Claims: ${summary.enterpriseBusinessOpsBlockedClaimCount}`,
    summary.enterpriseBusinessOpsSummary.boundary,
    ...summary.enterpriseBusinessOpsSummary.revenueCapabilities.map(
      (capability) =>
        `- Business revenue capability: ${capability.name} (${capability.status}) -> ${capability.nextAction}`
    ),
    ...summary.enterpriseBusinessOpsSummary.marginControls.map(
      (control) =>
        `- Margin control: ${control.control} (${control.status}) -> ${control.operatingPolicy}`
    ),
    ...summary.enterpriseBusinessOpsSummary.teamRoles.map(
      (role) => `- Business role: ${role.role} (${role.team}) -> ${role.escalationTrigger}`
    ),
    `Growth Engine: ${summary.growthEngineRoute}`,
    `Growth Engine API: ${summary.growthEngineApiRoute}`,
    `Growth Engine Brief: ${summary.growthEngineBriefRoute}`,
    `Growth Plays: ${summary.growthEnginePlayCount}`,
    `Growth Conversion Lanes: ${summary.growthEngineConversionLaneCount}`,
    `Growth Proof Ladder Steps: ${summary.growthEngineProofLadderStepCount}`,
    `Growth Bottlenecks: ${summary.growthEngineBottleneckCount}`,
    summary.growthEngineSummary.boundary,
    ...summary.growthEngineSummary.growthPlays.map(
      (play) => `- Growth play: ${play.name} (${play.status}) -> ${play.nextAction}`
    ),
    ...summary.growthEngineSummary.revenueProofLadder.map(
      (step) => `- Revenue proof step: ${step.stage} (${step.status}) -> ${step.retainedGate}`
    ),
    `Investor Audience Readiness: ${summary.investorAudienceReadinessRoute}`,
    `Investor Audience Readiness API: ${summary.investorAudienceReadinessApiRoute}`,
    `Investor Audience Readiness Brief: ${summary.investorAudienceReadinessBriefRoute}`,
    `Investor Audience Weakness Tracks: ${summary.investorAudienceWeaknessTrackCount}`,
    `Investor Audience Competitive Edge Signals: ${summary.investorAudienceCompetitiveEdgeSignalCount}`,
    `Investor Audience Packets: ${summary.investorAudiencePacketCount}`,
    `Investor Audience Readiness Gates: ${summary.investorAudienceReadinessGateCount}`,
    summary.investorAudienceReadinessSummary.boundary,
    ...summary.investorAudienceReadinessSummary.weaknessReliefTracks.map(
      (track) =>
        `- Weakness relief: ${track.weakness} (${track.severity}) -> ${track.graduationGate}`
    ),
    ...summary.investorAudienceReadinessSummary.investorAudiencePackets.map(
      (packet) =>
        `- Audience packet: ${packet.audience} (${packet.readinessStatus}) -> ${packet.nextMove}`
    ),
    `Capital Vitality: ${summary.capitalVitalityRoute}`,
    `Capital Vitality API: ${summary.capitalVitalityApiRoute}`,
    `Capital Vitality Brief: ${summary.capitalVitalityBriefRoute}`,
    `Capital Vitality Revenue Capabilities: ${summary.capitalVitalityRevenueCapabilityCount}`,
    `Capital Vitality Moat Signals: ${summary.capitalVitalityMoatSignalCount}`,
    `Capital Vitality Investor Milestones: ${summary.capitalVitalityInvestorMilestoneCount}`,
    `Capital Vitality Funding Workstreams: ${summary.capitalVitalityFundingWorkstreamCount}`,
    summary.capitalVitalitySummary.boundary,
    ...summary.capitalVitalitySummary.revenueCapabilities.map(
      (capability) =>
        `- Capital revenue capability: ${capability.name} (${capability.status}) -> ${capability.nextAction}`
    ),
    ...summary.capitalVitalitySummary.fundingVitalityWorkstreams.map(
      (workstream) =>
        `- Funding workstream: ${workstream.name} (${workstream.status}) -> ${workstream.nextAction}`
    ),
    `Service Delivery Workbench: ${summary.serviceDeliveryRoute}`,
    `Service Delivery API: ${summary.serviceDeliveryApiRoute}`,
    `Service Delivery Brief: ${summary.serviceDeliveryBriefRoute}`,
    `Service Delivery Offers: ${summary.serviceDeliveryOfferCount}`,
    `Service Delivery Phases: ${summary.serviceDeliveryPhaseCount}`,
    `Service Delivery Work Orders: ${summary.serviceDeliveryWorkOrderTemplateCount}`,
    `Service Delivery Artifacts: ${summary.serviceDeliveryArtifactCount}`,
    `Service Delivery Activation Gates: ${summary.serviceDeliveryActivationGateCount}`,
    `Service Delivery Hard Stops: ${summary.serviceDeliveryHardStopCount}`,
    summary.serviceDeliverySummary.boundary,
    ...summary.serviceDeliverySummary.serviceDeliveryOffers.map(
      (offer) => `- Service delivery offer: ${offer.name} (${offer.status}) -> ${offer.buyerPromise}`
    ),
    ...summary.serviceDeliverySummary.serviceDeliveryWorkOrderTemplates.map(
      (template) => `- Work order: ${template.title} (${template.status}) -> ${template.outputArtifact}`
    ),
    `Service Reliability: ${summary.serviceReliabilityRoute}`,
    `Service Reliability API: ${summary.serviceReliabilityApiRoute}`,
    `Service Reliability Brief: ${summary.serviceReliabilityBriefRoute}`,
    `Service Reliability Controls: ${summary.serviceReliabilityControlCount}`,
    `Service Reliability Open Gates: ${summary.serviceReliabilityOpenGateCount}`,
    `Service Reliability Fault Classes: ${summary.serviceReliabilityFaultClassCount}`,
    `Service Reliability Efficiency Improvements: ${summary.serviceReliabilityEfficiencyImprovementCount}`,
    summary.serviceReliabilitySummary.boundary,
    ...summary.serviceReliabilitySummary.productServiceControls.map(
      (control) =>
        `- Reliability control: ${control.name} (${control.status}) -> ${control.mitigation}`
    ),
    `Automation Autopilot: ${summary.automationAutopilotRoute}`,
    `Automation Autopilot API: ${summary.automationAutopilotApiRoute}`,
    `Automation Autopilot Brief: ${summary.automationAutopilotBriefRoute}`,
    `Automation Autopilot Capabilities: ${summary.automationAutopilotCapabilityCount}`,
    `Automation Autopilot Average Readiness: ${summary.automationAutopilotAverageReadinessScore}`,
    `Automation Autopilot Review Required: ${summary.automationAutopilotReviewRequiredCount}`,
    `Automation Autopilot Production Authority Blocked: ${summary.automationAutopilotProductionAuthorityBlockedCount}`,
    `Automation Autopilot Bottleneck Workarounds: ${summary.automationAutopilotBottleneckWorkaroundCount}`,
    summary.automationAutopilotSummary.boundary,
    ...summary.automationAutopilotSummary.capabilities.map(
      (capability) =>
        `- Automation capability: ${capability.name} (${capability.mode}) -> ${capability.nextAutomationStep}`
    ),
    `Limitations Workarounds: ${summary.limitationsWorkaroundRoute}`,
    `Limitations Workarounds API: ${summary.limitationsWorkaroundApiRoute}`,
    `Limitations Workarounds Brief: ${summary.limitationsWorkaroundBriefRoute}`,
    `Limitations Workaround Tracks: ${summary.limitationsWorkaroundTrackCount}`,
    `Limitations Workaround Packets: ${summary.limitationsWorkaroundPacketCount}`,
    `Limitations Boundary Escalations: ${summary.limitationsWorkaroundBoundaryEscalationCount}`,
    `Limitations Workaround Execution Ledger: ${summary.limitationsWorkaroundExecutionLedgerCount}`,
    `Limitations Workaround Resolved Execution Ledger: ${summary.limitationsWorkaroundResolvedExecutionLedgerCount}`,
    `Limitations Workaround Open Risks: ${summary.limitationsWorkaroundOpenRiskCount}`,
    `Limitations Workaround Hard Stops: ${summary.limitationsWorkaroundHardStopCount}`,
    summary.limitationsWorkaroundSummary.boundary,
    ...summary.limitationsWorkaroundSummary.packets.map(
      (packet) =>
        `- Workaround packet: ${packet.name}. Output: ${packet.output} Expiry: ${packet.expiryRule}`
    ),
    `Navigation Audit: ${summary.navigationAuditRoute}`,
    `Navigation Audit API: ${summary.navigationAuditApiRoute}`,
    `Navigation Audit Brief: ${summary.navigationAuditBriefRoute}`,
    `Navigation Page Routes: ${summary.navigationAuditPageRouteCount}`,
    `Navigation API Route Patterns: ${summary.navigationAuditApiRoutePatternCount}`,
    `Navigation Groups: ${summary.navigationAuditGroupCount}`,
    `Navigation Smoke HTML Routes: ${summary.navigationAuditSmokeCoveredHtmlRouteCount}`,
    summary.navigationAuditSummary.boundary,
    ...summary.navigationAuditSummary.bottlenecks.map(
      (bottleneck) =>
        `- Navigation bottleneck: ${bottleneck.name} (${bottleneck.status}) -> ${bottleneck.workaround}`
    ),
    `Release Continuity: ${summary.releaseContinuityRoute}`,
    `Release Continuity API: ${summary.releaseContinuityApiRoute}`,
    `Release Continuity Brief: ${summary.releaseContinuityBriefRoute}`,
    `Release Continuity Gates: ${summary.releaseContinuityGateCount}`,
    `Release Continuity Resolved Gates: ${summary.releaseContinuityResolvedGateCount}`,
    `Release Continuity AAL2 Operator Gates: ${summary.releaseContinuityOperatorRequiredGateCount}`,
    `Release Continuity Checks: ${summary.releaseContinuityCheckCount}`,
    `Release Continuity Passed Checks: ${summary.releaseContinuityPassedCheckCount}`,
    summary.releaseContinuitySummary.boundary,
    ...summary.releaseContinuitySummary.gates.map(
      (gate) => `- Release continuity gate: ${gate.name} (${gate.status}) -> ${gate.workaround}`
    ),
    `Boundary Resolution Register: ${summary.boundaryResolutionRoute}`,
    `Boundary Resolution API: ${summary.boundaryResolutionApiRoute}`,
    `Boundary Resolution Brief: ${summary.boundaryResolutionBriefRoute}`,
    `Boundary Resolution Records: ${summary.boundaryResolutionRecordCount}`,
    `Boundary External Gates: ${summary.boundaryResolutionExternalGateCount}`,
    `Boundary Human AAL2 Gates: ${summary.boundaryResolutionHumanAal2RequiredCount}`,
    `Boundary Safe Workarounds: ${summary.boundaryResolutionSafeWorkaroundCount}`,
    summary.boundaryResolutionSummary.addressedPosition,
    `Approvals Readiness: ${summary.approvalsReadinessRoute}`,
    `Approvals API: ${summary.approvalsReadinessApiRoute}`,
    `Approvals Brief: ${summary.approvalsReadinessBriefRoute}`,
    `Approval Tracks: ${summary.approvalsReadinessTrackCount}`,
    `Approval Agent Controls: ${summary.approvalsReadinessAgentControlCount}`,
    `Approval External Review Tracks: ${summary.approvalsReadinessExternalReviewCount}`,
    `Approval Blocked Tracks: ${summary.approvalsReadinessBlockedBeforeApprovalCount}`,
    summary.approvalsReadinessSummary.boundary,
    ...summary.approvalsReadinessSummary.tracks.map(
      (track) => `- Approval track: ${track.name} (${track.status}) -> ${track.nextAction}`
    ),
    ...summary.approvalsReadinessSummary.agentControls.map(
      (control) => `- Approval agent: ${control.agent}. Checkpoint: ${control.humanCheckpoint}`
    ),
    `Global Certification Readiness: ${summary.globalCertificationReadinessRoute}`,
    `Global Certification API: ${summary.globalCertificationReadinessApiRoute}`,
    `Global Certification Brief: ${summary.globalCertificationReadinessBriefRoute}`,
    `Global Certification Tracks: ${summary.globalCertificationReadinessTrackCount}`,
    `Global Certification Sources: ${summary.globalCertificationReadinessSourceCount}`,
    `Global Certification Gates: ${summary.globalCertificationReadinessGateCount}`,
    `Global Certification Regional Packs: ${summary.globalCertificationReadinessRegionalPackCount}`,
    `Global Certification Blocked Claims: ${summary.globalCertificationReadinessBlockedClaimCount}`,
    summary.globalCertificationReadinessSummary.boundary,
    ...summary.globalCertificationReadinessSummary.tracks.map(
      (track) => `- Global certification track: ${track.title} (${track.status}) -> ${track.nextAction}`
    ),
    ...summary.globalCertificationReadinessSummary.gates.map(
      (gate) => `- Certification gate: ${gate.gate}. Owner: ${gate.owner}`
    ),
    `Continuous Review and Audit: ${summary.continuousReviewAuditRoute}`,
    `Continuous Review API: ${summary.continuousReviewAuditApiRoute}`,
    `Continuous Review Brief: ${summary.continuousReviewAuditBriefRoute}`,
    `Continuous Review Agents: ${summary.continuousReviewAuditAgentCount}`,
    `Continuous Review Loops: ${summary.continuousReviewAuditLoopCount}`,
    `Continuous Audit Controls: ${summary.continuousReviewAuditControlCount}`,
    `Internal Innovation Tracks: ${summary.continuousReviewAuditInnovationTrackCount}`,
    `Internal Research Teams: ${summary.continuousReviewAuditInternalResearchAssignmentCount}`,
    summary.continuousReviewAuditSummary.boundary,
    ...summary.continuousReviewAuditSummary.loops.map(
      (loop) => `- Review loop: ${loop.stage} (${loop.cadence}) -> ${loop.errorReductionMechanism}`
    ),
    ...summary.continuousReviewAuditSummary.innovationTracks.map(
      (track) => `- Internal research: ${track.title} (${track.visibility}) -> ${track.owner}`
    ),
    `Healthcare Intelligence OS: ${summary.healthcareIntelligenceOSRoute}`,
    `Clinical Authority Readiness: ${summary.clinicalAuthorityReadinessRoute}`,
    `Clinical Authority API: ${summary.clinicalAuthorityReadinessApiRoute}`,
    `Clinical Authority Brief: ${summary.clinicalAuthorityReadinessBriefRoute}`,
    `Clinical Authority Domains: ${summary.clinicalAuthorityDomainCount}`,
    `Clinical Authority Boundary Resolutions: ${summary.clinicalAuthorityBoundaryResolutionCount}`,
    ...summary.clinicalAuthorityReadinessSummary.domains.map(
      (domain) => `- Authority domain: ${domain.name} (${domain.status}) -> ${domain.retainedGate}`
    ),
    ...summary.clinicalAuthorityReadinessSummary.boundaryResolutions.map(
      (resolution) => `- Authority boundary: ${resolution.boundary}. Resolution: ${resolution.resolution}`
    ),
    `Clinical Care Activation Readiness: ${summary.clinicalCareActivationRoute}`,
    `Clinical Care Activation API: ${summary.clinicalCareActivationApiRoute}`,
    `Clinical Care Activation Brief: ${summary.clinicalCareActivationBriefRoute}`,
    `Protected Clinical Activation Dossier: ${summary.clinicalActivationDossierRoute}`,
    `Protected Clinical Activation Dossier API: ${summary.clinicalActivationDossierApiRoute}`,
    `Protected Clinical Activation Dossier Packet: ${summary.clinicalActivationDossierPacketRoute}`,
    `Protected Clinical Activation Approval Workflow: ${summary.clinicalActivationApprovalWorkflowRoute}`,
    `Protected Clinical Activation Approval API: ${summary.clinicalActivationApprovalWorkflowApiRoute}`,
    `Protected Clinical Activation Approval Packet: ${summary.clinicalActivationApprovalWorkflowPacketRoute}`,
    `Persistent Agent Workspace: ${summary.persistentAgentWorkspaceRoute}`,
    `Pilot Evidence Dashboard: ${summary.pilotEvidenceRoute}`,
    `Demo Center: ${summary.demoRoute}`,
    `Pilot Programs: ${summary.pilotProgramRoute}`,
    `Pilot Deal Room: ${summary.salesDealRoomRoute}`,
    `Pilot Deal Room API: ${summary.salesDealRoomApiRoute}`,
    `Protected Deal Room Packet: ${summary.salesDealRoomProtectedPacketRoute}`,
    `Opportunity Workspace Provisioning: ${summary.opportunityWorkspaceProvisioningRoute}`,
    `Opportunity Workspace Packet: ${summary.opportunityWorkspaceProvisioningPacketRoute}`,
    `Buyer Tenant Lifecycle: ${summary.buyerTenantLifecycleRoute}`,
    `Buyer Tenant Lifecycle Packet: ${summary.buyerTenantLifecyclePacketRoute}`,
    `Production SSO And Invitation Readiness: ${summary.productionActivationReadinessRoute}`,
    `Production Readiness Packet: ${summary.productionActivationReadinessPacketRoute}`,
    `Customer Activation Approvals: ${summary.customerActivationApprovalsRoute}`,
    `Customer Activation Approval Packet: ${summary.customerActivationApprovalsPacketRoute}`,
    `Buyer Evidence Diligence Room: ${summary.buyerDiligenceRoomRoute}`,
    `Buyer Evidence Diligence Packet: ${summary.buyerDiligenceRoomPacketRoute}`,
    `Secure Evidence Vault Readiness: ${summary.secureEvidenceVaultReadinessRoute}`,
    `Secure Evidence Vault Packet: ${summary.secureEvidenceVaultReadinessPacketRoute}`,
    `Authenticated Buyer Demo Execution Path: ${summary.buyerDemoExecutionPathRoute}`,
    `Buyer Demo Operator Brief: ${summary.buyerDemoExecutionBriefRoute}`,
    `Persisted Buyer Demo Sessions: ${summary.buyerDemoSessionsRoute}`,
    `Buyer Demo Session Packet: ${summary.buyerDemoSessionPacketRoute}`,
    `Buyer Demo Session QA Harness: ${summary.buyerDemoSessionQaRoute}`,
    `QA Evidence Ledger: ${summary.qaEvidenceRoute}`,
    `QA Evidence API: ${summary.qaEvidenceApiRoute}`,
    `QA Evidence Brief: ${summary.qaEvidenceBriefRoute}`,
    `QA Evidence Activation Plan: ${summary.qaEvidenceActivationPlanRoute}`,
    `QA Evidence Activation Brief: ${summary.qaEvidenceActivationPlanBriefRoute}`,
    `Manual AAL2 QA Execution Readiness: ${summary.qaExecutionReadinessRoute}`,
    `Manual AAL2 QA Execution API: ${summary.qaExecutionReadinessApiRoute}`,
    `Manual AAL2 QA Execution Brief: ${summary.qaExecutionReadinessBriefRoute}`,
    `Manual AAL2 QA Execution Workflows: ${summary.qaExecutionReadinessWorkflowCount}`,
    `Manual AAL2 QA Execution Stages: ${summary.qaExecutionReadinessStageCount}`,
    `Manual AAL2 QA Human Required Stages: ${summary.qaExecutionReadinessHumanRequiredStageCount}`,
    summary.qaExecutionReadinessSummary.buyerClaimStatus,
    `Manual AAL2 QA Run Control: ${summary.qaRunControlRoute}`,
    `Manual AAL2 QA Run Control API: ${summary.qaRunControlApiRoute}`,
    `Manual AAL2 QA Run Control Brief: ${summary.qaRunControlBriefRoute}`,
    `Manual AAL2 QA Run Control Workflows: ${summary.qaRunControlWorkflowCount}`,
    `Manual AAL2 QA Run Control Gates: ${summary.qaRunControlGateCount}`,
    `Manual AAL2 QA Run Control Commands: ${summary.qaRunControlCommandTemplateCount}`,
    summary.qaRunControlSummary.buyerClaimStatus,
    `Manual AAL2 QA Launch Kit: ${summary.qaLaunchKitRoute}`,
    `Manual AAL2 QA Launch Kit API: ${summary.qaLaunchKitApiRoute}`,
    `Manual AAL2 QA Launch Kit Brief: ${summary.qaLaunchKitBriefRoute}`,
    `Manual AAL2 QA Launch Kit Phases: ${summary.qaLaunchKitPhaseCount}`,
    `Manual AAL2 QA Launch Kit Workflows: ${summary.qaLaunchKitWorkflowCount}`,
    `Manual AAL2 QA Launch Kit Safe Copy Fields: ${summary.qaLaunchKitSafeCopyFieldCount}`,
    `Manual AAL2 QA Launch Kit Blocked Claims: ${summary.qaLaunchKitBlockedClaimCount}`,
    summary.qaLaunchKitSummary.launchDecision,
    `QA Human Run Packet: ${summary.qaHumanRunPacketRoute}`,
    `QA Human Run Packet API: ${summary.qaHumanRunPacketApiRoute}`,
    `QA Human Run Packet Brief: ${summary.qaHumanRunPacketBriefRoute}`,
    `QA Human Run Packet Workflows: ${summary.qaHumanRunPacketWorkflowCount}`,
    `QA Human Run Packet Controls: ${summary.qaHumanRunPacketControlCount}`,
    `QA Human Run Packet Hard Stops: ${summary.qaHumanRunPacketHardStopControlCount}`,
    `QA Human Run Packet Post-Run Routes: ${summary.qaHumanRunPacketPostRunRouteCount}`,
    `QA Human Run Packet Blocked Claims: ${summary.qaHumanRunPacketBlockedClaimCount}`,
    summary.qaHumanRunPacketSummary.decisionState,
    `QA Completion Bridge: ${summary.qaCompletionBridgeRoute}`,
    `QA Completion Bridge API: ${summary.qaCompletionBridgeApiRoute}`,
    `QA Completion Bridge Brief: ${summary.qaCompletionBridgeBriefRoute}`,
    `QA Completion Bridge Checkpoints: ${summary.qaCompletionBridgeCheckpointCount}`,
    `QA Completion Bridge Hard Stops: ${summary.qaCompletionBridgeHardStopCount}`,
    `QA Completion Bridge Safe Fields: ${summary.qaCompletionBridgeSafeFieldCount}`,
    `QA Completion Bridge Blocked Claims: ${summary.qaCompletionBridgeBlockedClaimCount}`,
    summary.qaCompletionBridgeSummary.buyerClaimStatus,
    `QA Claim Guard: ${summary.qaClaimGuardRoute}`,
    `QA Claim Guard API: ${summary.qaClaimGuardApiRoute}`,
    `QA Claim Guard Brief: ${summary.qaClaimGuardBriefRoute}`,
    `QA Claim Guard Rules: ${summary.qaClaimGuardRuleCount}`,
    `QA Claim Guard Safe Claims: ${summary.qaClaimGuardSafeCurrentClaimCount}`,
    `QA Claim Guard Packet-Gated Claims: ${summary.qaClaimGuardRetainedPacketClaimCount}`,
    `QA Claim Guard Blocked Authority Claims: ${summary.qaClaimGuardBlockedAuthorityClaimCount}`,
    `QA Claim Guard Review Triggers: ${summary.qaClaimGuardReviewTriggerCount}`,
    summary.qaClaimGuardSummary.buyerClaimPosture,
    `QA Activation Seal: ${summary.qaActivationSealRoute}`,
    `QA Activation Seal API: ${summary.qaActivationSealApiRoute}`,
    `QA Activation Seal Brief: ${summary.qaActivationSealBriefRoute}`,
    `QA Activation Seal Rules: ${summary.qaActivationSealRuleCount}`,
    `QA Activation Seal Hard Stops: ${summary.qaActivationSealHardStopRuleCount}`,
    `QA Activation Seal Required Evidence: ${summary.qaActivationSealRequiredEvidenceCount}`,
    `QA Activation Seal Blocked Claims: ${summary.qaActivationSealHardStopClaimCount}`,
    summary.qaActivationSealSummary.decision.buyerSafeClaim,
    `Manual QA Proof Promotion: ${summary.qaProofPromotionRoute}`,
    `Manual QA Proof Promotion API: ${summary.qaProofPromotionApiRoute}`,
    `Manual QA Proof Promotion Brief: ${summary.qaProofPromotionBriefRoute}`,
    `Manual QA Proof Promotion Rules: ${summary.qaProofPromotionRuleCount}`,
    `Manual QA Proof Promotion Hard Stops: ${summary.qaProofPromotionHardStopRuleCount}`,
    `Manual QA Proof Promotion Blocked Claims: ${summary.qaProofPromotionBlockedClaimCount}`,
    `Manual QA Proof Promotion Decision: ${summary.qaProofPromotionSummary.promotionDecisionState}`,
    summary.qaProofPromotionSummary.decision.buyerSafeClaim,
    `QA Buyer Proof Release: ${summary.qaBuyerProofReleaseRoute}`,
    `QA Buyer Proof Release API: ${summary.qaBuyerProofReleaseApiRoute}`,
    `QA Buyer Proof Release Brief: ${summary.qaBuyerProofReleaseBriefRoute}`,
    `Protected QA Buyer Proof Release: ${summary.qaBuyerProofReleaseProtectedRoute}`,
    `QA Buyer Proof Release Buyer Packet: ${summary.qaBuyerProofReleaseBuyerPacketRoute}`,
    `QA Buyer Proof Release Rules: ${summary.qaBuyerProofReleaseRuleCount}`,
    `QA Buyer Proof Release Hard Stops: ${summary.qaBuyerProofReleaseHardStopCount}`,
    `QA Buyer Proof Release Required Evidence: ${summary.qaBuyerProofReleaseRequiredEvidenceCount}`,
    `QA Buyer Proof Release Blocked Claims: ${summary.qaBuyerProofReleaseBlockedClaimCount}`,
    `QA Buyer Proof Release Decision: ${summary.qaBuyerProofReleaseSummary.releaseDecisionState}`,
    summary.qaBuyerProofReleaseSummary.decision.buyerSafeClaim,
    `Buyer Release Control Runbook: ${summary.buyerReleaseControlRunRoute}`,
    `Buyer Release Control API: ${summary.buyerReleaseControlRunApiRoute}`,
    `Buyer Release Control Brief: ${summary.buyerReleaseControlRunBriefRoute}`,
    `Protected Buyer Release Control Verifier: ${summary.buyerReleaseControlRunProtectedVerifierRoute}`,
    `Protected Buyer Release Control Packet: ${summary.buyerReleaseControlRunProtectedVerifierPacketRoute}`,
    `Protected Buyer Release Timeline: ${summary.buyerReleaseControlRunProtectedVerifierTimelineRoute}`,
    `Buyer Release Control Steps: ${summary.buyerReleaseControlRunStepCount}`,
    `Buyer Release Control Protected Routes: ${summary.buyerReleaseControlRunProtectedRouteCount}`,
    `Buyer Release Control Packets: ${summary.buyerReleaseControlRunPacketRouteCount}`,
    `Buyer Release Control Hard Stops: ${summary.buyerReleaseControlRunHardStopCount}`,
    `Buyer Release Control Decision: ${summary.buyerReleaseControlRunSummary.executionDecision}`,
    summary.buyerReleaseControlRunSummary.shareDecision,
    `Manual QA Execution Console: ${summary.qaManualExecutionConsoleRoute}`,
    `Manual QA Execution Console API: ${summary.qaManualExecutionConsoleApiRoute}`,
    `Manual QA Execution Console Brief: ${summary.qaManualExecutionConsoleBriefRoute}`,
    `Protected Manual QA Execution Console: ${summary.qaManualExecutionConsoleProtectedRoute}`,
    `Manual QA Execution Console Stages: ${summary.qaManualExecutionConsoleStageCount}`,
    `Manual QA Execution Console Hard Stops: ${summary.qaManualExecutionConsoleHardStopCount}`,
    `Manual QA Execution Console Workflows: ${summary.qaManualExecutionConsoleWorkflowCount}`,
    `Manual QA Execution Console Decision: ${summary.qaManualExecutionConsoleSummary.consoleState}`,
    summary.qaManualExecutionConsoleSummary.buyerSafeCurrentLanguage,
    `Buyer Pilot Room: ${summary.buyerPilotRoomRoute}`,
    `Competitive Edge: ${summary.competitiveEdgeRoute}`,
    ...summary.buyerPilotRoomCompetitiveEdges.map(
      (edge) => `- Competitive edge: ${edge.pillar} -> ${edge.route}: ${edge.claim}`
    ),
    ...summary.demoPilotProgramSummary.productDemos.map(
      (demo) => `- Demo: ${demo.name} (${demo.status}) -> ${demo.route}`
    ),
    ...summary.demoPilotProgramSummary.pilotPrograms.map(
      (pilot) => `- Pilot: ${pilot.name} (${pilot.duration}) -> ${pilot.route}`
    ),
    `Protected pilot workspace: ${summary.protectedPilotWorkspaceRoute}`,
    `Protected pilot status: ${summary.protectedPilotWorkspaceSummary.status}`,
    `Activation workflow: ${summary.protectedPilotWorkspaceSummary.activationWorkflow
      .map((workflowStep) => workflowStep.step)
      .join(" -> ")}`,
    "",
    "## Investor Readiness",
    `Status: ${summary.demoPilotProgramSummary.investorReadiness.status}`,
    `Thesis: ${summary.demoPilotProgramSummary.investorReadiness.thesis}`,
    `Conversion path: ${summary.demoPilotProgramSummary.investorReadiness.demoToPilotConversionPath}`,
    `Next diligence step: ${summary.demoPilotProgramSummary.investorReadiness.nextDiligenceStep}`,
    ...summary.demoPilotProgramSummary.investorReadiness.proofSignals.map(
      (signal) => `- ${signal.label} (${signal.status}) -> ${signal.route}: ${signal.evidence}`
    ),
    "",
    "## Public Market Readiness",
    `Route: ${summary.publicMarketReadinessRoute}`,
    `API: ${summary.publicMarketReadinessApiRoute}`,
    `Brief: ${summary.publicMarketReadinessBriefRoute}`,
    `Protected metric rollups: ${summary.protectedMetricRollupsRoute}`,
    `Protected metric rollups API: ${summary.protectedMetricRollupsApiRoute}`,
    `Protected metric board packet API: ${summary.protectedMetricRollupPacketApiRoute}`,
    `Protected metric trends: ${summary.protectedMetricTrendsRoute}`,
    `Protected metric trends API: ${summary.protectedMetricTrendsApiRoute}`,
    `Protected metric trend packet API: ${summary.protectedMetricTrendPacketApiRoute}`,
    `Protected board scorecards: ${summary.protectedBoardScorecardsRoute}`,
    `Protected board scorecards API: ${summary.protectedBoardScorecardsApiRoute}`,
    `Protected board scorecard packet API: ${summary.protectedBoardScorecardPacketApiRoute}`,
    `Protected finance methodology gates: ${summary.protectedFinanceMethodologyRoute}`,
    `Protected finance methodology API: ${summary.protectedFinanceMethodologyApiRoute}`,
    `Protected finance methodology packet API: ${summary.protectedFinanceMethodologyPacketApiRoute}`,
    `Protected external approval evidence: ${summary.protectedExternalApprovalEvidenceRoute}`,
    `Protected external approval evidence API: ${summary.protectedExternalApprovalEvidenceApiRoute}`,
    `Protected external approval evidence packet API: ${summary.protectedExternalApprovalEvidencePacketApiRoute}`,
    `Protected release decisions: ${summary.protectedReleaseDecisionRoute}`,
    `Protected release decisions API: ${summary.protectedReleaseDecisionApiRoute}`,
    `Protected release decision packet API: ${summary.protectedReleaseDecisionPacketApiRoute}`,
    `Protected named reviewer sign-offs: ${summary.protectedNamedReviewerSignoffRoute}`,
    `Protected named reviewer sign-offs API: ${summary.protectedNamedReviewerSignoffApiRoute}`,
    `Protected named reviewer sign-off packet API: ${summary.protectedNamedReviewerSignoffPacketApiRoute}`,
    `Protected distribution lockbox: ${summary.protectedDistributionLockboxRoute}`,
    `Protected distribution lockbox API: ${summary.protectedDistributionLockboxApiRoute}`,
    `Protected distribution lockbox packet API: ${summary.protectedDistributionLockboxPacketApiRoute}`,
    `Protected release authority attestations: ${summary.protectedReleaseAuthorityAttestationRoute}`,
    `Protected release authority attestations API: ${summary.protectedReleaseAuthorityAttestationApiRoute}`,
    `Protected release authority attestations packet API: ${summary.protectedReleaseAuthorityAttestationPacketApiRoute}`,
    `Protected evidence-room recipient attestations: ${summary.protectedEvidenceRoomRecipientAttestationRoute}`,
    `Protected evidence-room recipient attestations API: ${summary.protectedEvidenceRoomRecipientAttestationApiRoute}`,
    `Protected evidence-room recipient attestations packet API: ${summary.protectedEvidenceRoomRecipientAttestationPacketApiRoute}`,
    `Protected evidence-room access-log reconciliation: ${summary.protectedEvidenceRoomAccessLogReconciliationRoute}`,
    `Protected evidence-room access-log reconciliation API: ${summary.protectedEvidenceRoomAccessLogReconciliationApiRoute}`,
    `Protected evidence-room access-log reconciliation packet API: ${summary.protectedEvidenceRoomAccessLogReconciliationPacketApiRoute}`,
    `Protected evidence-room provider adapters: ${summary.protectedEvidenceRoomProviderAdapterRoute}`,
    `Protected evidence-room provider adapters API: ${summary.protectedEvidenceRoomProviderAdapterApiRoute}`,
    `Protected evidence-room provider adapters packet API: ${summary.protectedEvidenceRoomProviderAdapterPacketApiRoute}`,
    `Protected provider security reviews: ${summary.protectedProviderSecurityReviewRoute}`,
    `Protected provider security reviews API: ${summary.protectedProviderSecurityReviewApiRoute}`,
    `Protected provider security review packet API: ${summary.protectedProviderSecurityReviewPacketApiRoute}`,
    `Protected procurement evidence registry: ${summary.protectedProcurementEvidenceRegistryRoute}`,
    `Protected procurement evidence registry API: ${summary.protectedProcurementEvidenceRegistryApiRoute}`,
    `Protected procurement evidence registry packet API: ${summary.protectedProcurementEvidenceRegistryPacketApiRoute}`,
    `Protected clinical authority evidence room: ${summary.protectedClinicalAuthorityEvidenceRoomRoute}`,
    `Protected clinical authority evidence room API: ${summary.protectedClinicalAuthorityEvidenceRoomApiRoute}`,
    `Protected clinical authority evidence room packet API: ${summary.protectedClinicalAuthorityEvidenceRoomPacketApiRoute}`,
    `Protected clinical authority owner matrix: ${summary.protectedClinicalAuthorityOwnerMatrixRoute}`,
    `Protected clinical authority owner matrix API: ${summary.protectedClinicalAuthorityOwnerMatrixApiRoute}`,
    `Protected clinical authority owner matrix packet API: ${summary.protectedClinicalAuthorityOwnerMatrixPacketApiRoute}`,
    `Protected clinical authority artifact intake: ${summary.protectedClinicalAuthorityArtifactIntakeRoute}`,
    `Protected clinical authority artifact intake API: ${summary.protectedClinicalAuthorityArtifactIntakeApiRoute}`,
    `Protected clinical authority artifact intake packet API: ${summary.protectedClinicalAuthorityArtifactIntakePacketApiRoute}`,
    `Protected authority artifact references: ${summary.protectedAuthorityArtifactReferenceRoute}`,
    `Protected authority artifact references API: ${summary.protectedAuthorityArtifactReferenceApiRoute}`,
    `Protected authority artifact renewal queue API: ${summary.protectedAuthorityArtifactReferenceRenewalQueueApiRoute}`,
    `Protected authority artifact references packet API: ${summary.protectedAuthorityArtifactReferencePacketApiRoute}`,
    `Status: ${summary.publicMarketReadinessSummary.status}`,
    `Thesis: ${summary.publicMarketReadinessSummary.thesis}`,
    `Investor narrative: ${summary.publicMarketReadinessSummary.investorNarrative}`,
    `KPI definitions: ${summary.publicMarketKpiCount}`,
    `Unit economics packages: ${summary.publicMarketUnitEconomicsPackageCount}`,
    `Compliance logs: ${summary.publicMarketComplianceLogCount}`,
    `Customer proof stages: ${summary.publicMarketCustomerProofStageCount}`,
    ...summary.publicMarketReadinessSummary.operatingMetrics.map(
      (metric) => `- KPI: ${metric.name} (${metric.currentMaturity}) -> ${metric.proofRoute}: ${metric.formula}`
    ),
    ...summary.publicMarketReadinessSummary.limitations.map(
      (limitation) => `- Boundary: ${limitation.limitation}. Workaround: ${limitation.workaround}`
    ),
    "",
    "## Strategic Platform Intelligence",
    `Source Intelligence: ${summary.sourceIntelligenceRoute}`,
    `Source Intelligence API: ${summary.sourceIntelligenceApiRoute}`,
    `Source signals: ${summary.sourceIntelligenceSourceCount}`,
    ...summary.sourceIntelligenceSummary.signals.map(
      (signal) => `- Source: ${signal.sourceName} (${signal.category}) -> ${signal.scrimedApplication}`
    ),
    "",
    `Route: ${summary.strategicIntelligenceRoute}`,
    `API: ${summary.strategicIntelligenceApiRoute}`,
    `Status: ${summary.strategicPlatformIntelligenceSummary.status}`,
    `Patterns: ${summary.strategicPlatformIntelligenceSummary.patternCount}`,
    `Execution bets: ${summary.strategicExecutionBetCount}`,
    `Decision gates: ${summary.strategicDecisionGateCount}`,
    `Execution commands: ${summary.strategicExecutionCommandCount}`,
    `Critical commands: ${summary.strategicCriticalExecutionCommandCount}`,
    `This-week commands: ${summary.strategicThisWeekExecutionCommandCount}`,
    `Command proof routes: ${summary.strategicExecutionCommandProofRouteCount}`,
    `Execution scorecards: ${summary.strategicExecutionScorecardCount}`,
    `Active scorecards: ${summary.strategicActiveExecutionScorecardCount}`,
    `Proof-ready scorecards: ${summary.strategicProofReadyExecutionScorecardCount}`,
    `External-review scorecards: ${summary.strategicExternalReviewExecutionScorecardCount}`,
    `Missing proof items: ${summary.strategicExecutionScorecardMissingProofCount}`,
    `Recommended sequence: ${summary.strategicPlatformIntelligenceSummary.recommendedStrategicSequence}`,
    ...summary.strategicPlatformIntelligenceSummary.patterns.map(
      (pattern) => `- ${pattern.title}: ${pattern.nextBuildStep}`
    ),
    ...summary.strategicPlatformIntelligenceSummary.executionCommands.map(
      (command) =>
        `- Command: ${command.lane} (${command.horizon}, ${command.priority}) -> ${command.revenueMotion}; metric ${command.successMetric}; block ${command.blockedExpansion.join(", ")}`
    ),
    ...summary.strategicPlatformIntelligenceSummary.executionBets.map(
      (bet) => `- Bet: ${bet.name} (${bet.horizon}) -> ${bet.proofMetric}; stop if ${bet.stopCondition}`
    ),
    ...summary.strategicPlatformIntelligenceSummary.executionScorecards.map(
      (scorecard) =>
        `- Scorecard: ${scorecard.commandLane} (${scorecard.scoreState}, ${scorecard.evidenceState}) -> leading ${scorecard.leadingIndicator}; missing ${scorecard.missingProof.join(", ")}; promote ${scorecard.promotionCriteria.join(", ")}; demote ${scorecard.demotionTriggers.join(", ")}`
    ),
    ...summary.strategicPlatformIntelligenceSummary.decisionGates.map(
      (gate) => `- Gate: ${gate.gate} -> allow when ${gate.allowIf}; block when ${gate.blockIf}`
    ),
    "",
    "## Deployment Profiles",
    `Route: ${summary.deploymentProfilesRoute}`,
    `API: ${summary.deploymentProfilesApiRoute}`,
    `Status: ${summary.deploymentProfileSummary.status}`,
    `Profiles: ${summary.deploymentProfileSummary.profileCount}`,
    ...summary.deploymentProfileSummary.profiles.map(
      (profile) => `- ${profile.name} (${profile.status}): ${profile.revenueUse}`
    ),
    "",
    "## Global Certification Readiness",
    `Route: ${summary.globalCertificationReadinessRoute}`,
    `API: ${summary.globalCertificationReadinessApiRoute}`,
    `Brief: ${summary.globalCertificationReadinessBriefRoute}`,
    `Status: ${summary.globalCertificationReadinessSummary.status}`,
    `Tracks: ${summary.globalCertificationReadinessTrackCount}`,
    `Sources: ${summary.globalCertificationReadinessSourceCount}`,
    `Gates: ${summary.globalCertificationReadinessGateCount}`,
    `Regional packs: ${summary.globalCertificationReadinessRegionalPackCount}`,
    `Blocked claims: ${summary.globalCertificationReadinessBlockedClaimCount}`,
    summary.globalCertificationReadinessSummary.boundary,
    ...summary.globalCertificationReadinessSummary.regionalPacks.map(
      (pack) => `- Certification pack: ${pack.region} (${pack.priority}) -> ${pack.safeNearTermMotion}`
    ),
    ...summary.globalCertificationReadinessSummary.sources.map(
      (source) => `- Source: ${source.name} -> ${source.scrimedImplication}`
    ),
    "",
    "## Continuous Review, Audit, and Innovation",
    `Route: ${summary.continuousReviewAuditRoute}`,
    `API: ${summary.continuousReviewAuditApiRoute}`,
    `Brief: ${summary.continuousReviewAuditBriefRoute}`,
    `Status: ${summary.continuousReviewAuditSummary.status}`,
    `Agents: ${summary.continuousReviewAuditAgentCount}`,
    `Loops: ${summary.continuousReviewAuditLoopCount}`,
    `Controls: ${summary.continuousReviewAuditControlCount}`,
    `Innovation tracks: ${summary.continuousReviewAuditInnovationTrackCount}`,
    `Internal research assignments: ${summary.continuousReviewAuditInternalResearchAssignmentCount}`,
    `Quantum posture: ${summary.continuousReviewAuditSummary.quantumTrackStatus}`,
    summary.continuousReviewAuditSummary.boundary,
    ...summary.continuousReviewAuditSummary.agents.map(
      (agent) => `- Review agent: ${agent.name} (${agent.status}) -> ${agent.mission}`
    ),
    ...summary.continuousReviewAuditSummary.controls.map(
      (control) => `- Audit control: ${control.control} (${control.status}) -> ${control.purpose}`
    ),
    "",
    "## Global Reach",
    `Route: ${summary.globalReachRoute}`,
    `API: ${summary.globalReachApiRoute}`,
    `Brief: ${summary.globalReachBriefRoute}`,
    `Status: ${summary.globalPartnerLocalizationSummary.status}`,
    `Regions: ${summary.globalRegionCount}`,
    `Buyer packs: ${summary.globalBuyerPackCount}`,
    `Partner channels: ${summary.globalPartnerChannelCount}`,
    `Boundary resolutions: ${summary.globalBoundaryResolutionCount}`,
    ...summary.globalPartnerLocalizationSummary.regions.map(
      (region) => `- Region: ${region.region} (${region.priority}) -> ${region.deploymentThesis}`
    ),
    ...summary.globalPartnerLocalizationSummary.buyerPacks.map(
      (pack) => `- Buyer pack: ${pack.audience} -> ${pack.recommendedOffer}`
    ),
    ...summary.globalPartnerLocalizationSummary.boundaryResolutions.map(
      (resolution) => `- Global boundary: ${resolution.boundary}. Resolution: ${resolution.resolution}`
    ),
    "",
    "## Global Enterprise Command",
    `Route: ${summary.globalEnterpriseCommandRoute}`,
    `API: ${summary.globalEnterpriseCommandApiRoute}`,
    `Brief: ${summary.globalEnterpriseCommandBriefRoute}`,
    `Status: ${summary.globalEnterpriseCommandSummary.status}`,
    `Region commands: ${summary.globalEnterpriseCommandRegionCount}`,
    `Sales playbooks: ${summary.globalEnterpriseCommandSalesPlaybookCount}`,
    `Interoperability lanes: ${summary.globalEnterpriseCommandInteroperabilityLaneCount}`,
    `Communication lanes: ${summary.globalEnterpriseCommandCommunicationLaneCount}`,
    `Average readiness: ${summary.globalEnterpriseCommandAverageReadinessScore}`,
    summary.globalEnterpriseCommandSummary.boundary,
    ...summary.globalEnterpriseCommandSummary.scorecards.map(
      (scorecard) =>
        `- Global scorecard: ${scorecard.category} (${scorecard.score}) -> ${scorecard.nextAction}`
    ),
    ...summary.globalEnterpriseCommandSummary.regionalCommands.map(
      (command) =>
        `- Region command: ${command.region} (${command.tier}) -> ${command.nextAction}`
    ),
    "",
    "## Market Activation",
    `Route: ${summary.marketActivationRoute}`,
    `API: ${summary.marketActivationApiRoute}`,
    `Status: ${summary.marketActivationSummary.status}`,
    `Core message: ${summary.marketActivationSummary.messageHouse.coreMessage}`,
    ...summary.marketActivationSummary.revenueStreams.map(
      (stream) => `- ${stream.name}: ${stream.priceSignal}`
    ),
    ...summary.marketActivationSummary.targetAudiences.map(
      (audience) => `- Audience: ${audience.segment} -> ${audience.primaryOffer}`
    ),
    "",
    "## Sales Attribution",
    `Route: ${summary.salesAttributionRoute}`,
    `API: ${summary.salesAttributionApiRoute}`,
    `Status: ${summary.salesAttributionSummary.status}`,
    `Captured fields: ${summary.attributionCapturedFieldCount}`,
    `Sample source category: ${summary.salesAttributionSummary.sampleAttribution.sourceCategory}`,
    `Sample revenue stream: ${summary.salesAttributionSummary.sampleAttribution.market.revenueStream}`,
    `Sample deployment profile: ${summary.salesAttributionSummary.sampleAttribution.deployment.profileName}`,
    `Sample cadence: ${summary.salesAttributionSummary.sampleAttribution.cadence.firstResponseSla}`,
    "",
    "## Attribution Analytics",
    `Route: ${summary.attributionAnalyticsRoute}`,
    `API: ${summary.attributionAnalyticsApiRoute}`,
    `Authenticated API: ${summary.attributionAnalyticsAuthenticatedApiRoute}`,
    `Status: ${summary.attributionAnalyticsSummary.status}`,
    `Mode: ${summary.attributionAnalyticsSummary.mode}`,
    `Records: ${summary.attributionAnalyticsRecordCount}`,
    `Cohorts: ${summary.attributionCohortCount}`,
    `Source coverage: ${summary.attributionAnalyticsSummary.totals.sourceCoveragePercent}%`,
    `Proof packet coverage: ${summary.attributionAnalyticsSummary.totals.proofPacketCoveragePercent}%`,
    ...summary.attributionAnalyticsSummary.proofRecommendations.map(
      (recommendation) => `- ${recommendation.cohort} -> ${recommendation.route}: ${recommendation.nextAction}`
    ),
    ...summary.attributionAnalyticsSummary.limitations.map((limitation) => `- Limitation: ${limitation}`),
    "",
    "## Pricing and Sales",
    `Pricing route: ${summary.pricingRoute}`,
    `Pricing API: ${summary.pricingApiRoute}`,
    `Recommended model: ${summary.commercialStrategySummary.recommendedModel}`,
    ...summary.commercialStrategySummary.pricingTiers.map(
      (tier) => `- ${tier.name}: ${tier.recommendedDisplayPrice}`
    ),
    "",
    "## Operations Readiness",
    `Operations route: ${summary.operationsRoute}`,
    `Operations API: ${summary.operationsApiRoute}`,
    `Status: ${summary.companyOperationsSummary.status}`,
    `Blocked actions: ${summary.companyOperationsSummary.blocked}`,
    `Manual actions: ${summary.companyOperationsSummary.manualAction}`,
    ...summary.companyOperationsSummary.operationsBlockers.map(
      (item) => `- ${item.blocker}: ${item.fallback}`
    ),
    "",
    "## Trust and Enterprise Readiness",
    `Trust Center: ${summary.trustCenterRoute}`,
    `Trust Center API: ${summary.trustCenterApiRoute}`,
    `Trust Safety Operations: ${summary.trustSafetyOperationsRoute}`,
    `Trust Safety Operations API: ${summary.trustSafetyOperationsApiRoute}`,
    `Trust Safety Incident Report API: ${summary.trustSafetyIncidentReportApiRoute}`,
    `Tenant TrustOps Incident Dashboard API: ${summary.trustSafetyTenantIncidentDashboardApiRoute}`,
    `Tenant TrustOps Incident Mutation API: ${summary.trustSafetyTenantIncidentMutationApiRoute}`,
    `Tenant TrustOps Review Packet API: ${summary.trustSafetyTenantIncidentReviewPacketApiRoute}`,
    `Trust Safety Agents: ${summary.trustSafetyAgentCount}`,
    `Trust Safety Controls: ${summary.trustSafetyControlCount}`,
    `Trust Safety Target Audiences: ${summary.trustSafetyTargetAudienceCount}`,
    `Trust Safety Incidents: ${summary.trustSafetyIncidentCount}`,
    `Open Trust Safety Incidents: ${summary.trustSafetyOpenIncidentCount}`,
    `Contained Trust Safety Incidents: ${summary.trustSafetyContainedIncidentCount}`,
    `Legal Hold Watch: ${summary.trustSafetyLegalHoldWatchCount}`,
    `Trust Safety Operating Posture: ${summary.trustSafetyOperationsSummary.operatingPosture}`,
    `Tenant TrustOps Durable Storage: ${summary.trustSafetyOperationsSummary.durableTenantStorage}`,
    `Tenant TrustOps Boundary: ${summary.trustSafetyOperationsSummary.tenantIncidentBoundary}`,
    ...summary.trustSafetyOperationsSummary.targetAudienceSignals.map(
      (signal) => `- Target audience: ${signal.audience}. Appeal: ${signal.appeal}`
    ),
    ...summary.trustSafetyOperationsSummary.incidents.map(
      (incident) =>
        `- Incident: ${incident.id} (${incident.severity}/${incident.status}) -> ${incident.reportRoute}: ${incident.title}`
    ),
    ...summary.trustSafetyOperationsSummary.resolvedLimitations.map(
      (item) => `- Resolved limitation: ${item.limitation} Resolution: ${item.resolution}`
    ),
    ...summary.trustSafetyOperationsSummary.remainingLimitations.map(
      (limitation) => `- Remaining limitation: ${limitation}`
    ),
    `Status: ${summary.enterpriseReadinessSummary.status}`,
    `Active controls: ${summary.enterpriseReadinessSummary.activeControls}`,
    `Decisions required: ${summary.enterpriseReadinessSummary.decisionsRequired}`,
    `External reviews required: ${summary.enterpriseReadinessSummary.externalReviewsRequired}`,
    `Legal production ready: ${summary.enterpriseReadinessSummary.legalProductionReady ? "yes" : "no"}`,
    `Production clinical ready: ${summary.enterpriseReadinessSummary.productionClinicalReady ? "yes" : "no"}`,
    "",
    "## Agents",
    ...summary.productAgents.map((agent) => `- ${agent.name} (${agent.status}): ${agent.capability}`),
    "",
    "## Production Architecture",
    `Route: ${summary.productionArchitectureRoute}`,
    `API: ${summary.productionArchitectureApiRoute}`,
    `Brief: ${summary.productionArchitectureBriefRoute}`,
    `Status: ${summary.productionArchitectureSummary.status}`,
    `Validation: ${summary.productionArchitectureValidationStatus}`,
    `Layers: ${summary.productionArchitectureLayerCount}`,
    `Model providers: ${summary.productionArchitectureModelProviderCount}`,
    `Context domains: ${summary.productionArchitectureContextDomainCount}`,
    `Trust controls: ${summary.productionArchitectureTrustControlCount}`,
    `Evaluation scenarios: ${summary.productionArchitectureEvaluationScenarioCount}`,
    `ClinSecOps controls: ${summary.productionArchitectureClinSecOpsControlCount}`,
    `Workflow tracks: ${summary.productionArchitectureWorkflowTrackCount}`,
    `Blocked autonomy controls: ${summary.productionArchitectureBlockedAutonomyCount}`,
    summary.productionArchitectureSummary.readinessAssessment,
    summary.productionArchitectureSummary.boundary,
    ...summary.productionArchitectureSummary.layers.map(
      (layer) => `- ${layer.name} (${layer.status}): ${layer.objective}`
    ),
    "",
    "## Execution Attempt Envelope",
    `Route: ${summary.executionAttemptEnvelopeRoute}`,
    `API: ${summary.executionAttemptEnvelopeApiRoute}`,
    `Brief: ${summary.executionAttemptEnvelopeBriefRoute}`,
    `Status: ${summary.executionAttemptEnvelopeSummary.status}`,
    `Envelopes: ${summary.executionAttemptEnvelopeCount}`,
    `Replay-ready: ${summary.executionAttemptEnvelopeReplayReadyCount}`,
    `Model-route telemetry: ${summary.executionAttemptEnvelopeModelRouteTelemetryCount}`,
    `Human review gates: ${summary.executionAttemptEnvelopeHumanReviewGateCount}`,
    `Scorecards: ${summary.executionAttemptEnvelopePassingScorecardCount}/${summary.executionAttemptEnvelopeScorecardCount}`,
    `Release decision: ${summary.executionAttemptEnvelopeReleaseDecision}`,
    summary.executionAttemptEnvelopeSummary.boundary,
    ...summary.executionAttemptEnvelopeSummary.envelopes.map(
      (envelope) =>
        `- ${envelope.workflowSlug}: ${envelope.lifecycleState}; idempotency ${envelope.idempotencyKey}; replay ${envelope.replayMetadata.replayToken}`
    ),
    "",
    "## Execution Attempt Durable Store",
    `API: ${summary.executionAttemptDurableStoreApiRoute}`,
    `Brief: ${summary.executionAttemptDurableStoreBriefRoute}`,
    `Protected record: ${summary.executionAttemptDurableStoreRecordRoute}`,
    `Protected replay: ${summary.executionAttemptDurableStoreReplayRoute}`,
    `Protected review disposition: ${summary.executionAttemptDurableStoreReviewDispositionRoute}`,
    `Status: ${summary.executionAttemptDurableStoreSummary.status}`,
    `Recordable envelopes: ${summary.executionAttemptDurableStoreRecordableEnvelopeCount}`,
    `Healthcare AI OS lanes: ${summary.executionAttemptDurableStorePriorityCount}`,
    `Validation: ${summary.executionAttemptDurableStoreValidationStatus}`,
    summary.executionAttemptDurableStoreSummary.boundary,
    ...summary.executionAttemptDurableStoreSummary.clinicalAIOperatingSystemFoundation.map(
      (priority) => `- ${priority.priority}: ${priority.implementedBy}`
    ),
    "",
    "## Interoperability",
    `Status: ${summary.interoperabilitySummary.status}`,
    `Standards: ${summary.interoperabilitySummary.standardCount}`,
    `Required before live: ${summary.interoperabilitySummary.requiredBeforeLive}`,
    "Control plane: /interoperability",
    `Synthetic test kits: ${summary.interoperabilityConformanceSummary.evaluationCount}`,
    `Synthetic passes: ${summary.interoperabilityConformanceSummary.syntheticPassed}`,
    `Live blocked: ${summary.interoperabilityConformanceSummary.liveBlocked}`,
    "Conformance evaluations: /interoperability/evaluations",
    `Healthcare Intelligence OS: ${summary.healthcareIntelligenceOSRoute}`,
    `Healthcare Intelligence OS API: ${summary.healthcareIntelligenceOSApiRoute}`,
    `Healthcare Intelligence OS Brief: ${summary.healthcareIntelligenceOSBriefRoute}`,
    `Clinical workflow automation tracks: ${summary.healthcareIntelligenceClinicalWorkflowTrackCount}`,
    `Clinical workflow patient-safety controls: ${summary.healthcareIntelligencePatientSafetyControlCount}`,
    `Patient-engagement analysis signals: ${summary.healthcareIntelligencePatientEngagementSignalCount}`,
    `Interoperability bindings: ${summary.healthcareIntelligenceInteroperabilityBindingCount}`,
    `Clinician burden-reduction motions: ${summary.healthcareIntelligenceClinicianBurdenReductionCount}`,
    `Operations optimization levers: ${summary.healthcareIntelligenceOperationsOptimizationLeverCount}`,
    ...summary.healthcareIntelligenceOSSummary.clinicalWorkflowAutomation.tracks.map(
      (track) =>
        `- Clinical workflow: ${track.lane} (${track.status}) -> ${track.automationScope}; blocked ${track.blockedActions.join(", ")}`
    ),
    `Health Records Safety Exchange: ${summary.healthRecordsSafetyExchangeRoute}`,
    `Health Records API: ${summary.healthRecordsSafetyExchangeApiRoute}`,
    `Health Records Brief: ${summary.healthRecordsSafetyExchangeBriefRoute}`,
    `Synthetic extraction evaluator: ${summary.healthRecordsSafetyExchangeExtractRoute}`,
    `Health record capabilities: ${summary.healthRecordsCapabilityCount}`,
    `Health record safety checks: ${summary.healthRecordsSafetyCheckCount}`,
    `Health record workarounds: ${summary.healthRecordsWorkaroundCount}`,
    "",
    "## Workflow Engine",
    ...summary.workflowEngineExamples.map(
      (workflow) => `- ${workflow.name}: ${workflow.inspectableOutput}`
    ),
    "",
    "## Governance Controls",
    ...summary.governanceControls.map((control) => `- ${control.control}: ${control.detail}`),
    "",
    "## AgentOS v1",
    `Status: ${summary.agentOSSummary.status}`,
    `Control plane agents: ${summary.agentOSControlPlaneCount}`,
    `Task engine: ${summary.agentOSSummary.taskApiRoute}`,
    `Evaluation workspace: ${summary.evaluationRoute}`,
    `Evaluation API: ${summary.evaluationApiRoute}`,
    "",
    "## Persistent Agent Workspace v1",
    `Status: ${summary.persistentAgentWorkspaceSummary.status}`,
    `Route: ${summary.persistentAgentWorkspaceSummary.route}`,
    `API: ${summary.persistentAgentWorkspaceSummary.apiRoute}`,
    `Work orders: ${summary.persistentAgentWorkspaceWorkOrderCount}`,
    `Known limitations tracked: ${summary.persistentAgentWorkspaceLimitationCount}`,
    "",
    "## TrustOS v1",
    `Status: ${summary.trustOSSummary.status}`,
    `Controls: ${summary.trustOSControlCount}`,
    `Decision workspace: ${summary.trustOSSummary.route}`,
    `Evaluation API: ${summary.trustOSSummary.evaluationApiRoute}`,
    "",
    "## Atlas Intelligence Core v1",
    `Status: ${summary.atlasIntelligenceCoreSummary.status}`,
    `Subsystems: ${summary.atlasSubsystemCount}`,
    `Trust Cards: ${summary.trustCardCount}`,
    "",
    "## Evidence Metrics",
    ...summary.evidenceMetrics.map((metric) => `- ${metric.metric}: ${metric.measurementBoundary}`),
    "",
    "## Next Commercial Move",
    summary.nextCommercialMove,
    "",
    "## Enterprise Intake",
    `Pilot intake route: ${summary.pilotIntakeRoute}`,
    `Pilot intake API: ${summary.pilotIntakeApiRoute}`,
    "",
    `Updated: ${summary.updated}`
  ].join("\n");
}
