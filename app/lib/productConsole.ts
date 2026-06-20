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
import { getEnterpriseReadinessSummary } from "./enterpriseReadiness";
import { getProtectedPilotWorkspaceSummary } from "./protectedPilotWorkspace";
import { getSalesOperationsSummary } from "./salesOperations";
import { getTrustOSSummary } from "./trustOS";
import { getPersistentAgentWorkspaceSummary } from "./persistentAgentWorkspace";
import { getStrategicPlatformIntelligenceSummary } from "./strategicPlatformIntelligence";
import { getDeploymentProfileSummary } from "./deploymentProfiles";
import { getMarketActivationSummary } from "./marketActivation";
import { getSalesAttributionSummary } from "./salesAttribution";
import { getSourceIntelligenceSummary } from "./sourceIntelligence";
import { getAttributionAnalyticsSummary } from "./attributionAnalytics";
import { getTrustSafetyOperationsSummary } from "./trustSafetyOperations";
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
  qaEvidenceLedgerProofStackStatus,
  qaManualRunEvidencePersistenceStatus
} from "./qaEvidenceLedger";
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
    label: "Review Public Market Readiness",
    href: "/public-market-readiness",
    purpose:
      "Inspect SCRIMED's KPI stack, unit economics, compliance logs, customer proof ladder, margin discipline, model-efficiency controls, and investor narrative.",
    boundary:
      "Public Market Readiness is operating discipline and diligence preparation, not audited financial reporting, securities offering material, investment advice, or valuation assurance."
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

export function getProductConsoleSummary() {
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
  const enterpriseReadinessSummary = getEnterpriseReadinessSummary();
  const protectedPilotWorkspaceSummary = getProtectedPilotWorkspaceSummary();
  const salesOperationsSummary = getSalesOperationsSummary();
  const trustOSSummary = getTrustOSSummary();
  const persistentAgentWorkspaceSummary = getPersistentAgentWorkspaceSummary();
  const strategicPlatformIntelligenceSummary = getStrategicPlatformIntelligenceSummary();
  const deploymentProfileSummary = getDeploymentProfileSummary();
  const marketActivationSummary = getMarketActivationSummary();
  const salesAttributionSummary = getSalesAttributionSummary();
  const sourceIntelligenceSummary = getSourceIntelligenceSummary();
  const attributionAnalyticsSummary = getAttributionAnalyticsSummary();
  const trustSafetyOperationsSummary = getTrustSafetyOperationsSummary();
  const salesDealRoomSummary = getSalesDealRoomSummary();
  const qaEvidenceLedger = getQaEvidenceLedger();
  const clinicalCareActivationSummary = getClinicalCareActivationSummary();
  const publicMarketReadinessSummary = getPublicMarketReadinessSummary();
  const productAgents = getProductAgents();
  const productWorkflows = getProductWorkflows();
  const sellablePilots = productOffers.filter((offer) => offer.status === "sellable-pilot").length;

  return {
    service: "scrimed-product-console",
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
    protectedPilotWorkspaceRoute: protectedPilotWorkspaceSummary.route,
    salesOperationsRoute: salesOperationsSummary.route,
    healthcareIntelligenceOSRoute: "/healthcare-intelligence-os",
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
    persistentAgentWorkspaceRoute: persistentAgentWorkspaceSummary.route,
    strategicIntelligenceRoute: strategicPlatformIntelligenceSummary.route,
    strategicIntelligenceApiRoute: strategicPlatformIntelligenceSummary.apiRoute,
    deploymentProfilesRoute: deploymentProfileSummary.route,
    deploymentProfilesApiRoute: deploymentProfileSummary.apiRoute,
    marketActivationRoute: marketActivationSummary.route,
    marketActivationApiRoute: marketActivationSummary.apiRoute,
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
    qaManualRunEvidencePacketRoute: qaEvidenceLedger.manualRunEvidenceCapture.route,
    qaManualRunEvidencePersistenceRoute:
      qaEvidenceLedger.manualRunEvidenceCapture.protectedPersistenceRoute,
    clinicalCareActivationStatus: clinicalCareActivationSummary.status,
    clinicalCareActivationGateCount: clinicalCareActivationSummary.gateCount,
    clinicalCareActivationBlockedCapabilityCount: clinicalCareActivationSummary.blockedCapabilities.length,
    publicMarketKpiCount: publicMarketReadinessSummary.metricCount,
    publicMarketUnitEconomicsPackageCount: publicMarketReadinessSummary.unitEconomicsPackageCount,
    publicMarketComplianceLogCount: publicMarketReadinessSummary.complianceLogCount,
    publicMarketCustomerProofStageCount: publicMarketReadinessSummary.customerProofStageCount,
    publicMarketOperatorMetricCatalogCount: publicMarketReadinessSummary.operatorMetricCatalogCount,
    status: "commercial-pilot-ready",
    offerCount: productOffers.length,
    serviceOfferCount: enterpriseServiceOffers.length,
    agentCount: productAgents.length,
    sellablePilots,
    demoCount: demoPilotProgramSummary.demoCount,
    executableDemos: demoPilotProgramSummary.executableDemos,
    pilotProgramCount: demoPilotProgramSummary.pilotCount,
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
    deploymentProfileCount: deploymentProfileSummary.profileCount,
    revenueStreamCount: marketActivationSummary.revenueStreamCount,
    targetAudienceCount: marketActivationSummary.targetAudienceCount,
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
    deploymentStages,
    agentEvaluationWorkspaceSummary,
    agentOSSummary,
    atlasIntelligenceCoreSummary,
    trustOSSummary,
    commercialStrategySummary,
    companyOperationsSummary,
    enterpriseReadinessSummary,
    demoPilotProgramSummary,
    interoperabilitySummary,
    interoperabilityConformanceSummary,
    protectedPilotWorkspaceSummary,
    salesOperationsSummary,
    salesDealRoomSummary,
    persistentAgentWorkspaceSummary,
    strategicPlatformIntelligenceSummary,
    deploymentProfileSummary,
    marketActivationSummary,
    salesAttributionSummary,
    attributionAnalyticsSummary,
    trustSafetyOperationsSummary,
    sourceIntelligenceSummary,
    qaEvidenceLedger,
    clinicalCareActivationSummary,
    publicMarketReadinessSummary,
    proofStack: {
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
      publicProductionSmoke: "no-secret-route-readiness-and-fail-closed-checks",
      trustSafetyIncidentQueue: `${trustSafetyOperationsSummary.incidentCount} incident controls`,
      strategicPlatformIntelligence: strategicPlatformIntelligenceSummary.status,
      deploymentProfiles: deploymentProfileSummary.status,
      marketActivation: marketActivationSummary.status,
      healthcareIntelligenceOS: "healthcare-intelligence-os-foundation",
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
      "Use Sales Attribution to convert every safe buyer signal into source-aware opportunity routing, Attribution Analytics to compare source-to-pilot cohorts, Tenant TrustOps incident workspaces to prove enterprise risk governance, Market Activation to focus the audience and message, Sales Operations to qualify retained buyer intake, Deployment Profiles to scope infrastructure readiness, then use the authenticated Buyer Demo Execution Path plus persisted Buyer Demo Sessions, AAL2 buyer-demo QA harness, external approval evidence linkage, and protected release decision claim registry to sequence, record, verify, and release audited Pilot Deal Room, Buyer Pilot Room, lifecycle, production-readiness, paid-pilot activation approval, buyer diligence, and secure evidence vault readiness packets before any customer SSO, automated invitation, signed document storage, public distribution, or production connector step.",
    updated: "2026-06-20"
  };
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
    `Healthcare Intelligence OS: ${summary.healthcareIntelligenceOSRoute}`,
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
    ...summary.strategicPlatformIntelligenceSummary.patterns.map(
      (pattern) => `- ${pattern.title}: ${pattern.nextBuildStep}`
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
    "## Interoperability",
    `Status: ${summary.interoperabilitySummary.status}`,
    `Standards: ${summary.interoperabilitySummary.standardCount}`,
    `Required before live: ${summary.interoperabilitySummary.requiredBeforeLive}`,
    "Control plane: /interoperability",
    `Synthetic test kits: ${summary.interoperabilityConformanceSummary.evaluationCount}`,
    `Synthetic passes: ${summary.interoperabilityConformanceSummary.syntheticPassed}`,
    `Live blocked: ${summary.interoperabilityConformanceSummary.liveBlocked}`,
    "Conformance evaluations: /interoperability/evaluations",
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
