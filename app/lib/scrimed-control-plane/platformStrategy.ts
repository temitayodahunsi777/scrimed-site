import { getProductServicePortfolioSummary, productServiceOfferings } from "../productServicePortfolio";
import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import { getHealthcareValueRealizationSummary } from "../healthcareValueRealization";
import { controlPlaneAgentRegistry, controlPlaneWorkflowRegistry } from "./registries";
import type {
  PlatformCapabilityDefinition,
  PlatformMoatDefinition,
  PlatformPlane,
  PlatformPortfolioDisposition,
  PortfolioScore,
  PortfolioScorecardEntry,
  StrategicMetricDefinition
} from "./types";

export const scrimedPlatformStrategyVersion = "scrimed-platform-strategy-v1-2026-08-08";

export const scrimedPlatformStrategyBoundary =
  "This registry describes SCRIMED's locally implemented, synthetic/no-PHI platform foundations and evidence paths. It does not authorize PHI, autonomous clinical care, diagnosis, treatment, prescribing, payer submission, EHR writeback, medical-device connectivity, production deployment, certification claims, customer activation, investor outreach, valuation claims, or revenue guarantees.";

const platformPlanes: PlatformPlane[] = [
  "clinical-experience",
  "workflows-agents",
  "data-interoperability",
  "model-compute",
  "trust-governance",
  "evidence-learning",
  "developer-ecosystem",
  "partner-marketplace",
  "research-trials",
  "business-capital",
  "operations-continuity"
];

const productByPlane: Record<PlatformPlane, string> = {
  "clinical-experience": "SCRIMED Healthcare Intelligence OS",
  "workflows-agents": "SCRIMED Work",
  "data-interoperability": "SCRIMED Interoperability Control Plane",
  "model-compute": "SCRIMED Compute Fabric",
  "trust-governance": "SCRIMED Trust Engine",
  "evidence-learning": "SCRIMED EvidenceOps",
  "developer-ecosystem": "SCRIMED Studio",
  "partner-marketplace": "SCRIMED Partner Platform",
  "research-trials": "TrialCore",
  "business-capital": "SCRIMED Capital and Commercial Intelligence",
  "operations-continuity": "SCRIMED Release and Continuity Operations"
};

function capability(
  input: Omit<
    PlatformCapabilityDefinition,
    | "auditHash"
    | "externalActionsEnabled"
    | "externalSideEffects"
    | "permittedJurisdictions"
    | "product"
  >
): PlatformCapabilityDefinition {
  const definition = {
    ...input,
    product: productByPlane[input.plane],
    permittedJurisdictions: ["synthetic-internal-global"],
    externalSideEffects: [] as string[],
    externalActionsEnabled: false as const
  };

  return {
    ...definition,
    auditHash: createClinicalEvidenceHash({
      ...definition,
      boundary: scrimedPlatformStrategyBoundary,
      version: scrimedPlatformStrategyVersion
    })
  };
}

export const platformCapabilityRegistry: PlatformCapabilityDefinition[] = [
  capability({
    id: "trust-evidence-control",
    name: "Trust Engine and EvidenceOps",
    plane: "trust-governance",
    purpose: "Bind policies, evidence, reviewers, audit lineage, and fail-closed release decisions.",
    owner: "Trust Engineering + Clinical Governance",
    riskTier: "high",
    environmentSupport: ["local", "test", "preview", "protected-pilot"],
    requiredApprovals: ["named reviewer for consequential artifacts", "release authority for production promotion"],
    allowedDataClassifications: ["public", "internal", "deidentified-clinical"],
    allowedProviderClasses: ["deterministic", "local-private", "specialist"],
    allowedToolClasses: ["read-only", "reversible-write"],
    requiredEvidence: ["policy decision", "source lineage", "verification result", "review disposition", "rollback evidence"],
    jurisdictionConstraints: ["tenant policy", "intended-use scope", "approved region before protected use"],
    activationStatus: "protected-pilot-gated",
    publicClaimStatus: "approved-safe-description",
    maturity: "protected-pilot",
    dependencies: [],
    agentIds: ["evidence-validator", "clinical-safety", "policy-reviewer"],
    workflowIds: ["clinical-documentation-preparation", "research-brief-generation"],
    customerTypes: ["health systems", "payers", "research organizations", "public-sector programs"],
    monetizationPath: "Governance assessment, evidence packet, protected pilot, and annual control-plane subscription.",
    moatContribution: "Compounds policy, evaluation, reviewer, and provenance evidence across governed workflows.",
    evidenceStatus: "local-verified",
    proofRoutes: ["/scrimed-control-plane", "/validation-evidence", "/approvals-readiness"],
    featureFlag: "SCRIMED_CONTROL_PLANE_ENABLED",
    highRiskDefaultOff: true
  }),
  capability({
    id: "governed-agent-runtime",
    name: "Governed Agent Runtime",
    plane: "workflows-agents",
    purpose: "Run bounded planner-specialist-verifier workflows with least privilege and human gates.",
    owner: "Platform Engineering + Trust Engineering",
    riskTier: "high",
    environmentSupport: ["local", "test", "preview", "protected-pilot"],
    requiredApprovals: ["action-specific review policy", "human approval for consequential use"],
    allowedDataClassifications: ["public", "internal", "deidentified-clinical"],
    allowedProviderClasses: ["frontier", "balanced", "fast", "specialist", "local-private", "deterministic"],
    allowedToolClasses: ["read-only", "reversible-write"],
    requiredEvidence: ["definition of done", "capability scope", "tool history", "verification result", "audit receipt"],
    jurisdictionConstraints: ["tenant isolation", "purpose limitation", "no silent provider downgrade"],
    activationStatus: "protected-pilot-gated",
    publicClaimStatus: "approved-safe-description",
    maturity: "protected-pilot",
    dependencies: ["trust-evidence-control"],
    agentIds: ["coordinator", "evidence-validator", "policy-reviewer"],
    workflowIds: ["referral-coordination", "prior-authorization-preparation", "research-brief-generation"],
    customerTypes: ["health systems", "care teams", "payers", "research teams"],
    monetizationPath: "Workflow-specific protected pilot followed by governed workflow subscription.",
    moatContribution: "Turns reusable healthcare workflows into policy-bound, verifiable operating assets.",
    evidenceStatus: "local-verified",
    proofRoutes: ["/scrimed-work", "/scrimed-agent-governance", "/scrimed-llmops-observability"],
    featureFlag: "SCRIMED_MULTI_AGENT_ENABLED",
    highRiskDefaultOff: true
  }),
  capability({
    id: "clinical-context-lens",
    name: "Clinical Context Lens",
    plane: "clinical-experience",
    purpose: "Prepare cited, freshness-aware context and decision-support drafts inside existing workflows.",
    owner: "Clinical Product + Clinical Governance",
    riskTier: "high",
    environmentSupport: ["local", "test", "preview", "protected-pilot"],
    requiredApprovals: ["clinical reviewer for recommendation-like output", "tenant purpose-of-use approval"],
    allowedDataClassifications: ["public", "deidentified-clinical"],
    allowedProviderClasses: ["specialist", "frontier", "local-private", "deterministic"],
    allowedToolClasses: ["read-only", "reversible-write"],
    requiredEvidence: ["citations", "freshness", "missing evidence", "uncertainty", "clinician review"],
    jurisdictionConstraints: ["no public/clinical index crossover", "minimum necessary", "approved tenant and region"],
    activationStatus: "protected-pilot-gated",
    publicClaimStatus: "evidence-pending",
    maturity: "review-ready",
    dependencies: ["trust-evidence-control", "data-interoperability-fabric"],
    agentIds: ["clinical-context", "clinical-safety", "documentation"],
    workflowIds: ["clinical-documentation-preparation", "patient-education-drafting", "referral-coordination"],
    customerTypes: ["clinicians", "care teams", "health systems", "patients through reviewed experiences"],
    monetizationPath: "Role-specific workflow pilot with evidence and review burden measured before expansion.",
    moatContribution: "Connects source-grounded context, human review, and workflow outcomes without creating clinical authority.",
    evidenceStatus: "synthetic-verified",
    proofRoutes: ["/healthcare-intelligence-os", "/scrimed-patient-context-gateway", "/clinical-context-gateway"],
    featureFlag: "SCRIMED_CONTEXT_FABRIC_ENABLED",
    highRiskDefaultOff: true
  }),
  capability({
    id: "data-interoperability-fabric",
    name: "Healthcare Data and Interoperability Fabric",
    plane: "data-interoperability",
    purpose: "Normalize synthetic FHIR, HL7, DICOM metadata, documents, and provenance into reviewable contracts.",
    owner: "Interoperability + Data Governance",
    riskTier: "high",
    environmentSupport: ["local", "test", "preview", "protected-pilot"],
    requiredApprovals: ["connector scope review", "privacy and security review before protected data"],
    allowedDataClassifications: ["public", "internal", "deidentified-clinical"],
    allowedProviderClasses: ["deterministic", "specialist", "local-private"],
    allowedToolClasses: ["read-only", "reversible-write"],
    requiredEvidence: ["source identifiers", "transformation version", "schema validation", "tenant isolation", "de-identification result"],
    jurisdictionConstraints: ["regional data policy", "no raw connector payload logging", "no EHR writeback"],
    activationStatus: "protected-pilot-gated",
    publicClaimStatus: "approved-safe-description",
    maturity: "review-ready",
    dependencies: ["trust-evidence-control"],
    agentIds: ["interoperability", "evidence-validator"],
    workflowIds: ["referral-coordination", "clinical-documentation-preparation"],
    customerTypes: ["health systems", "clinics", "research sites", "integration partners"],
    monetizationPath: "Interoperability readiness assessment, conformance sprint, and protected integration pilot.",
    moatContribution: "Builds reusable healthcare semantics, lineage, and connector-policy evidence.",
    evidenceStatus: "synthetic-verified",
    proofRoutes: ["/clinical-data-fabric", "/interoperability", "/enterprise-healthcare-infrastructure"],
    featureFlag: "SCRIMED_CONTEXT_FABRIC_ENABLED",
    highRiskDefaultOff: true
  }),
  capability({
    id: "model-compute-gateway",
    name: "Model Gateway and Compute Fabric",
    plane: "model-compute",
    purpose: "Select configured model classes by validated task fit, privacy, latency, risk, and effective cost.",
    owner: "AI Platform + Reliability",
    riskTier: "moderate",
    environmentSupport: ["local", "test", "preview", "protected-pilot"],
    requiredApprovals: ["model qualification", "provider policy review", "clinical review for high-risk tasks"],
    allowedDataClassifications: ["public", "internal", "deidentified-clinical"],
    allowedProviderClasses: ["frontier", "balanced", "fast", "specialist", "local-private", "deterministic"],
    allowedToolClasses: ["read-only"],
    requiredEvidence: ["model passport", "task evaluation", "route rationale", "fallback compatibility", "effective cost"],
    jurisdictionConstraints: ["provider allowlist", "residency policy", "no privacy downgrade", "no unapproved PHI route"],
    activationStatus: "review-ready",
    publicClaimStatus: "approved-safe-description",
    maturity: "integrated",
    dependencies: ["trust-evidence-control"],
    agentIds: ["infrastructure-observer", "policy-reviewer"],
    workflowIds: ["research-brief-generation", "executive-reporting"],
    customerTypes: ["health systems", "research organizations", "technology partners"],
    monetizationPath: "Included platform control with private deployment and capacity options priced separately.",
    moatContribution: "Keeps SCRIMED model-independent while retaining validated workflow and cost evidence.",
    evidenceStatus: "local-verified",
    proofRoutes: ["/scrimed-compute-fabric", "/scrimed-model-router", "/scrimed-control-plane"],
    featureFlag: "SCRIMED_MODEL_ROUTER_ENABLED",
    highRiskDefaultOff: false
  }),
  capability({
    id: "outcome-learning-loop",
    name: "Outcome Intelligence and Learning Loop",
    plane: "evidence-learning",
    purpose: "Measure verified outcomes and convert reviewed failures into versioned improvement proposals.",
    owner: "Evaluation + Product Operations",
    riskTier: "moderate",
    environmentSupport: ["local", "test", "preview", "protected-pilot"],
    requiredApprovals: ["reviewed correction", "evaluation pass", "promotion approval"],
    allowedDataClassifications: ["public", "internal", "deidentified-clinical"],
    allowedProviderClasses: ["deterministic", "balanced", "specialist"],
    allowedToolClasses: ["read-only", "reversible-write"],
    requiredEvidence: ["baseline", "accepted outcome", "correction", "regression test", "rollout status"],
    jurisdictionConstraints: ["no automatic self-modification", "no causal claim without approved analysis"],
    activationStatus: "review-ready",
    publicClaimStatus: "evidence-pending",
    maturity: "integrated",
    dependencies: ["trust-evidence-control", "governed-agent-runtime"],
    agentIds: ["evidence-validator", "policy-reviewer"],
    workflowIds: ["research-brief-generation", "executive-reporting"],
    customerTypes: ["health systems", "payers", "research teams", "executive sponsors"],
    monetizationPath: "Outcome review and continuous governance subscription after an approved pilot baseline.",
    moatContribution: "Compounds reviewed corrections, benchmark cases, and outcome evidence rather than raw conversation memory.",
    evidenceStatus: "synthetic-verified",
    proofRoutes: ["/healthcare-value-realization", "/scrimed-clinical-benchmark-suite", "/validation-evidence"],
    featureFlag: "SCRIMED_LEARNING_LOOP_ENABLED",
    highRiskDefaultOff: false
  }),
  capability({
    id: "developer-conformance-platform",
    name: "Developer and Conformance Platform",
    plane: "developer-ecosystem",
    purpose: "Expose read-only schemas, registries, synthetic fixtures, and conformance checks for governed extension.",
    owner: "Developer Experience + Security",
    riskTier: "moderate",
    environmentSupport: ["local", "test", "preview"],
    requiredApprovals: ["connector policy review", "security review for new tools"],
    allowedDataClassifications: ["public", "internal"],
    allowedProviderClasses: ["deterministic", "fast", "local-private"],
    allowedToolClasses: ["read-only", "reversible-write"],
    requiredEvidence: ["schema conformance", "permission manifest", "synthetic evaluation", "audit contract"],
    jurisdictionConstraints: ["no live clinical tool exposure", "no broad filesystem or network access"],
    activationStatus: "review-ready",
    publicClaimStatus: "internal-only",
    maturity: "foundation",
    dependencies: ["trust-evidence-control", "governed-agent-runtime"],
    agentIds: ["interoperability", "infrastructure-observer", "policy-reviewer"],
    workflowIds: ["research-brief-generation"],
    customerTypes: ["integration partners", "developers", "research collaborators"],
    monetizationPath: "Partner conformance assessment and governed extension program; no public marketplace yet.",
    moatContribution: "Makes safety, evidence, and interoperability contracts portable while retaining platform governance.",
    evidenceStatus: "local-verified",
    proofRoutes: ["/scrimed-studio", "/scrimed-governance-learning-loop", "/scrimed-control-plane"],
    featureFlag: "SCRIMED_CONTROL_PLANE_ENABLED",
    highRiskDefaultOff: false
  }),
  capability({
    id: "governed-partner-marketplace",
    name: "Governed Agent and Partner Marketplace",
    plane: "partner-marketplace",
    purpose: "Prepare a future admission path for externally developed agents and connectors.",
    owner: "Partnerships + Security + Clinical Governance",
    riskTier: "high",
    environmentSupport: ["local", "test"],
    requiredApprovals: ["legal terms review", "security review", "clinical review where applicable", "commercial approval"],
    allowedDataClassifications: ["public", "internal"],
    allowedProviderClasses: ["deterministic", "local-private"],
    allowedToolClasses: ["read-only"],
    requiredEvidence: ["signed manifest", "SBOM or ML-BOM", "evaluation evidence", "owner", "kill switch", "rollback"],
    jurisdictionConstraints: ["disabled until partner and regional terms are approved", "no inherited clinical authority"],
    activationStatus: "disabled-external-gate",
    publicClaimStatus: "internal-only",
    maturity: "foundation",
    dependencies: ["developer-conformance-platform", "trust-evidence-control"],
    agentIds: ["policy-reviewer", "infrastructure-observer"],
    workflowIds: [],
    customerTypes: ["technology partners", "model providers", "implementation partners"],
    monetizationPath: "Future admission, validation, and revenue-share model only after legal and governance approval.",
    moatContribution: "Can expand distribution while preserving SCRIMED's evidence and admission standards.",
    evidenceStatus: "external-validation-required",
    proofRoutes: ["/scrimed-studio", "/approvals-readiness"],
    featureFlag: "SCRIMED_CONSEQUENTIAL_ACTIONS_ENABLED",
    highRiskDefaultOff: true
  }),
  capability({
    id: "trialcore-research-operations",
    name: "TrialCore and ResearchOps",
    plane: "research-trials",
    purpose: "Prepare source-grounded trial evidence, preliminary matching, and research workflow artifacts.",
    owner: "Research Operations + Clinical Governance",
    riskTier: "high",
    environmentSupport: ["local", "test", "preview", "protected-pilot"],
    requiredApprovals: ["research protocol review", "human eligibility confirmation", "consent and site authorization"],
    allowedDataClassifications: ["public", "internal", "deidentified-clinical"],
    allowedProviderClasses: ["specialist", "frontier", "local-private", "deterministic"],
    allowedToolClasses: ["read-only", "reversible-write"],
    requiredEvidence: ["protocol version", "source citations", "eligibility uncertainty", "human review", "audit lineage"],
    jurisdictionConstraints: ["no auto-enrollment", "research separated from clinical care", "site and consent policy"],
    activationStatus: "protected-pilot-gated",
    publicClaimStatus: "evidence-pending",
    maturity: "review-ready",
    dependencies: ["trust-evidence-control", "data-interoperability-fabric", "outcome-learning-loop"],
    agentIds: ["research", "clinical-context", "evidence-validator"],
    workflowIds: ["research-brief-generation"],
    customerTypes: ["research sites", "academic medical centers", "life-science organizations"],
    monetizationPath: "Research workflow evaluation and site-readiness pilot; no enrollment authority.",
    moatContribution: "Links trial evidence, workflow traces, and reviewed outcomes into reproducible research operations.",
    evidenceStatus: "synthetic-verified",
    proofRoutes: ["/research", "/scrimed-clinical-benchmark-suite", "/validation-evidence"],
    featureFlag: "SCRIMED_CONTEXT_FABRIC_ENABLED",
    highRiskDefaultOff: true
  }),
  capability({
    id: "capital-commercial-intelligence",
    name: "Capital and Commercial Intelligence",
    plane: "business-capital",
    purpose: "Prepare claims-safe investor, buyer, pricing, and diligence materials for human approval.",
    owner: "Founder + Capital Strategy",
    riskTier: "high",
    environmentSupport: ["local", "test", "preview"],
    requiredApprovals: ["founder approval", "finance review", "legal review for external materials"],
    allowedDataClassifications: ["public", "internal", "confidential"],
    allowedProviderClasses: ["frontier", "balanced", "deterministic"],
    allowedToolClasses: ["read-only", "reversible-write"],
    requiredEvidence: ["claim provenance", "financial assumptions", "approval status", "recipient scope"],
    jurisdictionConstraints: ["no securities solicitation", "no valuation assurance", "no autonomous outreach"],
    activationStatus: "review-ready",
    publicClaimStatus: "internal-only",
    maturity: "integrated",
    dependencies: ["trust-evidence-control", "outcome-learning-loop"],
    agentIds: ["capital-intelligence", "executive-intelligence", "policy-reviewer"],
    workflowIds: ["investor-diligence-preparation", "executive-reporting"],
    customerTypes: ["investors", "strategic partners", "health-system executives", "public-sector buyers"],
    monetizationPath: "Internal commercial operating system supporting paid assessments, pilots, and enterprise subscriptions.",
    moatContribution: "Connects product proof, claims governance, pricing, and diligence without overstating traction.",
    evidenceStatus: "local-verified",
    proofRoutes: ["/investor-audience-readiness", "/offerings", "/capital-vitality"],
    featureFlag: "SCRIMED_CAPITAL_INTELLIGENCE_ENABLED",
    highRiskDefaultOff: true
  }),
  capability({
    id: "continuity-release-operations",
    name: "Continuity and Release Operations",
    plane: "operations-continuity",
    purpose: "Prioritize safe next actions, explain blockers, and preserve exact release and rollback evidence.",
    owner: "Engineering Release Steward + Security",
    riskTier: "moderate",
    environmentSupport: ["local", "test", "preview", "protected-pilot"],
    requiredApprovals: ["action-specific review", "separate deployment authority for production"],
    allowedDataClassifications: ["public", "internal", "confidential"],
    allowedProviderClasses: ["deterministic", "fast", "balanced"],
    allowedToolClasses: ["read-only", "reversible-write"],
    requiredEvidence: ["source manifest", "validation summary", "dependency evidence", "rollback plan", "named owner"],
    jurisdictionConstraints: ["no self-approval", "no production mutation from advisory output"],
    activationStatus: "active-synthetic",
    publicClaimStatus: "internal-only",
    maturity: "integrated",
    dependencies: ["trust-evidence-control"],
    agentIds: ["coordinator", "infrastructure-observer", "policy-reviewer"],
    workflowIds: ["executive-reporting"],
    customerTypes: ["internal operators", "reviewers", "security and release owners"],
    monetizationPath: "Embedded control supporting every paid offer and protected pilot.",
    moatContribution: "Makes governance operational by translating evidence and gates into deterministic next actions.",
    evidenceStatus: "local-verified",
    proofRoutes: ["/scrimed-work", "/release-continuity", "/deployment-drift-guard"],
    featureFlag: "SCRIMED_CONTROL_PLANE_ENABLED",
    highRiskDefaultOff: false
  }),
  capability({
    id: "documentation-authorization-wedge",
    name: "Documentation Before Authorization",
    plane: "workflows-agents",
    purpose: "Detect missing documentation and prepare evidence-grounded authorization drafts before human submission.",
    owner: "Revenue Cycle Governance + Clinical Documentation",
    riskTier: "high",
    environmentSupport: ["local", "test", "preview", "protected-pilot"],
    requiredApprovals: ["qualified reviewer", "payer workflow owner before any external use"],
    allowedDataClassifications: ["public", "internal", "deidentified-clinical"],
    allowedProviderClasses: ["balanced", "specialist", "frontier", "local-private", "deterministic"],
    allowedToolClasses: ["read-only", "reversible-write"],
    requiredEvidence: ["payer policy citation", "documentation gap list", "uncertainty", "human review", "blocked submission proof"],
    jurisdictionConstraints: ["no coverage determination", "no payer submission", "no billing mutation"],
    activationStatus: "protected-pilot-gated",
    publicClaimStatus: "approved-safe-description",
    maturity: "protected-pilot",
    dependencies: ["governed-agent-runtime", "clinical-context-lens", "trust-evidence-control"],
    agentIds: ["revenue-cycle", "clinical-context", "evidence-validator", "policy-reviewer"],
    workflowIds: ["prior-authorization-preparation", "denial-analysis"],
    customerTypes: ["health systems", "specialty practices", "revenue-cycle teams", "payer operations teams"],
    monetizationPath: "Workflow Intelligence Assessment to fixed-scope no-PHI pilot to governed annual workflow subscription.",
    moatContribution: "Combines payer criteria, documentation evidence, human review, and outcome measurement in one workflow wedge.",
    evidenceStatus: "local-verified",
    proofRoutes: ["/documentation-before-authorization", "/offerings", "/healthcare-value-realization"],
    featureFlag: "SCRIMED_CONSEQUENTIAL_ACTIONS_ENABLED",
    highRiskDefaultOff: true
  })
];

export const strategicMetricRegistry: StrategicMetricDefinition[] = [
  {
    id: "verified-intelligence-yield",
    name: "Verified intelligence yield",
    formula: "verified outputs accepted by a qualified reviewer / all attempted outputs",
    numerator: "Count of outputs passing mandatory verification and receiving the required human disposition.",
    denominator: "Count of all bounded output attempts, including failures, abstentions, retries, and rejections.",
    currentValue: null,
    evidenceStatus: "baseline-not-collected",
    owner: "Evaluation + Trust Engineering",
    humanReviewRequired: true,
    syntheticOnly: true,
    blockedInterpretation: "Not clinical accuracy, customer impact, production reliability, or a universal model score."
  },
  {
    id: "healthcare-value-returned",
    name: "Healthcare value returned",
    formula: "reviewed operational, financial, patient, and clinical value evidenced / total verified workflow cost",
    numerator: "Approved baseline-to-observed value supported by outcome evidence and attributable workflow records.",
    denominator: "Inference, retrieval, infrastructure, retry, reviewer-time, failure, and maintenance cost for verified work.",
    currentValue: null,
    evidenceStatus: "baseline-not-collected",
    owner: "Outcome Intelligence + Finance Review",
    humanReviewRequired: true,
    syntheticOnly: true,
    blockedInterpretation: "Not an ROI, savings, revenue, reimbursement, clinical-outcome, or valuation guarantee."
  },
  {
    id: "cost-per-verified-successful-task",
    name: "Cost per verified successful task",
    formula: "total effective workflow cost / verified successful tasks",
    numerator: "Provider, hosting, retrieval, validation, review, retry, latency, and failure cost.",
    denominator: "Tasks meeting mandatory policy, evidence, quality, and human-acceptance criteria.",
    currentValue: null,
    evidenceStatus: "baseline-not-collected",
    owner: "AI Platform + Product Finance",
    humanReviewRequired: true,
    syntheticOnly: true,
    blockedInterpretation: "Not token price, provider leaderboard rank, margin guarantee, or audited cost evidence."
  }
];

export const platformPortfolioRationalization: PlatformPortfolioDisposition[] = [
  {
    id: "workflow-intelligence-entry-wedge",
    name: "Workflow Intelligence Assessment",
    sourceOfferSlug: "workflow-intelligence-assessment",
    disposition: "sell-now",
    rationale: "Lowest-risk path to paid discovery, buyer evidence, and a measurable follow-on pilot without requiring PHI or production connectors.",
    buyer: "Health-system operations, access, RCM, documentation, and transformation leaders.",
    proofRoutes: ["/offerings", "/documentation-before-authorization", "/pilot-demo-commercial-readiness"],
    nextMilestone: "Complete three buyer-specific synthetic rehearsals with baseline, acceptance rubric, reviewer burden, and expansion gate.",
    retainedBoundary: "No live data, payer submission, production connector, clinical outcome, or ROI claim."
  },
  {
    id: "governed-synthetic-evaluation",
    name: "Governed Synthetic Evaluation",
    sourceOfferSlug: "synthetic-pilot-evaluation",
    disposition: "sell-now",
    rationale: "Turns platform safety and verification into a reviewable service while collecting product-fit and workflow evidence.",
    buyer: "Innovation, clinical informatics, security, governance, and procurement teams.",
    proofRoutes: ["/offerings", "/validation-evidence", "/scrimed-control-plane"],
    nextMilestone: "Package exact scope, price floor, acceptance criteria, delivery capacity, and evidence-room index.",
    retainedBoundary: "No certification, clinical validation, production readiness, or customer-go-live claim."
  },
  {
    id: "protected-workflow-pilots",
    name: "Protected Workflow Pilots",
    sourceOfferSlug: null,
    disposition: "advance-after-gates",
    rationale: "Best route to outcome and renewal evidence after identity, migration, tenant, security, and reviewer gates are independently satisfied.",
    buyer: "Qualified health-system, clinic, payer, and research pilot sponsors.",
    proofRoutes: ["/pilot-workspace/access", "/approvals-readiness", "/clinical-production-readiness"],
    nextMilestone: "Close named review, leaked-password protection, disposable migration evidence, and exact-candidate preview validation.",
    retainedBoundary: "No customer activation, PHI, live clinical execution, payer action, or production writeback."
  },
  {
    id: "clinical-experience-catalog",
    name: "Clinical and Patient Experience Catalog",
    sourceOfferSlug: null,
    disposition: "demo-only",
    rationale: "Preserve compelling role-specific demonstrations while concentrating commercialization on one measurable workflow wedge.",
    buyer: "Clinicians, care teams, patient-access leaders, and executive sponsors.",
    proofRoutes: ["/demos", "/healthcare-intelligence-os", "/scrimed-patient-context-gateway"],
    nextMilestone: "Select only the modules required for each buyer story and retire unsupported claims, not reusable infrastructure.",
    retainedBoundary: "Synthetic demonstration only; no diagnosis, treatment, monitoring, clinical authority, or patient-specific action."
  },
  {
    id: "partner-agent-marketplace",
    name: "Agent and Partner Marketplace",
    sourceOfferSlug: null,
    disposition: "incubate",
    rationale: "Potential distribution leverage is real, but admission, liability, security, quality, and commercial controls are not externally approved.",
    buyer: "Future technology, implementation, data, and model partners.",
    proofRoutes: ["/scrimed-studio", "/approvals-readiness"],
    nextMilestone: "Validate one read-only partner adapter through conformance, security, legal, rollback, and operator review.",
    retainedBoundary: "No public marketplace, partner certification, revenue share, or inherited clinical authority."
  }
];

function calculatePortfolioPriority(scores: PortfolioScore) {
  return Math.round(
    scores.buyerUrgency * 0.15 +
      scores.differentiation * 0.12 +
      scores.evidenceMaturity * 0.1 +
      scores.technicalReadiness * 0.11 +
      (100 - scores.regulatoryBurden) * 0.1 +
      (100 - scores.integrationEffort) * 0.08 +
      scores.monetization * 0.13 +
      scores.grossMarginPotential * 0.08 +
      scores.expansionValue * 0.08 +
      scores.timeToMeasurableRoi * 0.05
  );
}

function portfolioScorecard(
  input: Omit<PortfolioScorecardEntry, "auditHash" | "externalAuthorityGranted" | "priorityScore">
): PortfolioScorecardEntry {
  const definition = {
    ...input,
    priorityScore: calculatePortfolioPriority(input.scores),
    externalAuthorityGranted: false as const
  };

  return {
    ...definition,
    auditHash: createClinicalEvidenceHash({
      ...definition,
      boundary: scrimedPlatformStrategyBoundary,
      version: scrimedPlatformStrategyVersion
    })
  };
}

export const platformPortfolioScorecards: PortfolioScorecardEntry[] = [
  portfolioScorecard({
    id: "governance-evidence-platform",
    category: "CORE_PLATFORM",
    scores: {
      buyerUrgency: 86,
      differentiation: 91,
      evidenceMaturity: 78,
      technicalReadiness: 84,
      regulatoryBurden: 48,
      integrationEffort: 46,
      monetization: 82,
      grossMarginPotential: 84,
      expansionValue: 94,
      timeToMeasurableRoi: 72
    },
    confidence: "high",
    evidenceRoutes: ["/scrimed-control-plane", "/validation-evidence", "/trust-center"],
    rationale: "Governance, evidence, policy, and release assurance connect every other SCRIMED product and remain useful across model vendors.",
    nextAction: "Package the control plane as the common evidence and governance layer behind every paid assessment and synthetic pilot."
  }),
  portfolioScorecard({
    id: "workflow-intelligence-entry-wedge",
    category: "NEAR_TERM_COMMERCIAL",
    scores: {
      buyerUrgency: 92,
      differentiation: 82,
      evidenceMaturity: 74,
      technicalReadiness: 88,
      regulatoryBurden: 24,
      integrationEffort: 28,
      monetization: 90,
      grossMarginPotential: 86,
      expansionValue: 87,
      timeToMeasurableRoi: 91
    },
    confidence: "high",
    evidenceRoutes: ["/offerings", "/documentation-before-authorization", "/pilot-demo-commercial-readiness"],
    rationale: "A bounded no-PHI workflow assessment reaches urgent administrative pain with the lowest current activation burden.",
    nextAction: "Run three buyer-specific rehearsals and retain baseline, acceptance, reviewer-burden, and expansion evidence."
  }),
  portfolioScorecard({
    id: "governed-synthetic-evaluation",
    category: "NEAR_TERM_COMMERCIAL",
    scores: {
      buyerUrgency: 84,
      differentiation: 88,
      evidenceMaturity: 80,
      technicalReadiness: 86,
      regulatoryBurden: 30,
      integrationEffort: 32,
      monetization: 84,
      grossMarginPotential: 82,
      expansionValue: 90,
      timeToMeasurableRoi: 83
    },
    confidence: "high",
    evidenceRoutes: ["/validation-evidence", "/scrimed-control-plane", "/scrimed-clinical-benchmark-suite"],
    rationale: "Synthetic evaluation converts SCRIMED's governance infrastructure into buyer-reviewable proof without requiring live data.",
    nextAction: "Standardize one fixed-scope benchmark and evidence-readout package for the commercial wedge."
  }),
  portfolioScorecard({
    id: "protected-workflow-pilots",
    category: "ENTERPRISE_EXPANSION",
    scores: {
      buyerUrgency: 88,
      differentiation: 90,
      evidenceMaturity: 60,
      technicalReadiness: 72,
      regulatoryBurden: 78,
      integrationEffort: 76,
      monetization: 92,
      grossMarginPotential: 76,
      expansionValue: 96,
      timeToMeasurableRoi: 56
    },
    confidence: "medium",
    evidenceRoutes: ["/pilot-workspace/access", "/approvals-readiness", "/clinical-production-readiness"],
    rationale: "Protected pilots can create renewal evidence, but identity, migration, buyer, legal, privacy, security, and reviewer gates remain material.",
    nextAction: "Complete disposable migration evidence and one exact-candidate AAL2 protected workflow rehearsal before requesting pilot activation."
  }),
  portfolioScorecard({
    id: "healthcare-evidence-graph",
    category: "STRATEGIC_MOAT",
    scores: {
      buyerUrgency: 80,
      differentiation: 94,
      evidenceMaturity: 67,
      technicalReadiness: 77,
      regulatoryBurden: 54,
      integrationEffort: 60,
      monetization: 79,
      grossMarginPotential: 88,
      expansionValue: 98,
      timeToMeasurableRoi: 61
    },
    confidence: "medium",
    evidenceRoutes: ["/validation-evidence", "/clinical-data-fabric", "/scrimed-hybrid-retrieval"],
    rationale: "Evidence lineage, contradictions, expiry, and approvals can compound across products even as models change.",
    nextAction: "Bind one assessment workflow's claims, source lineage, review, value metric, and release artifact into the platform graph."
  }),
  portfolioScorecard({
    id: "clinical-experience-catalog",
    category: "R_AND_D_OPTION",
    scores: {
      buyerUrgency: 76,
      differentiation: 84,
      evidenceMaturity: 48,
      technicalReadiness: 70,
      regulatoryBurden: 86,
      integrationEffort: 74,
      monetization: 64,
      grossMarginPotential: 71,
      expansionValue: 89,
      timeToMeasurableRoi: 43
    },
    confidence: "medium",
    evidenceRoutes: ["/demos", "/healthcare-intelligence-os", "/scrimed-patient-context-gateway"],
    rationale: "The catalog strengthens buyer storytelling, but broad commercialization would dilute focus and increase evidence and regulatory burden.",
    nextAction: "Retain only the modules needed for a specific buyer narrative and keep them synthetic demonstration-only."
  }),
  portfolioScorecard({
    id: "partner-agent-marketplace",
    category: "DEFER",
    scores: {
      buyerUrgency: 48,
      differentiation: 82,
      evidenceMaturity: 32,
      technicalReadiness: 52,
      regulatoryBurden: 88,
      integrationEffort: 86,
      monetization: 58,
      grossMarginPotential: 70,
      expansionValue: 91,
      timeToMeasurableRoi: 28
    },
    confidence: "medium",
    evidenceRoutes: ["/scrimed-studio", "/approvals-readiness"],
    rationale: "Marketplace upside does not yet outweigh admission, liability, security, quality, and commercial complexity.",
    nextAction: "Validate one read-only partner adapter before revisiting marketplace activation."
  })
];

export const platformMoatRegistry: PlatformMoatDefinition[] = [
  {
    id: "governance-evidence-runtime",
    name: "Governance and evidence runtime",
    basis: "Policy-before-action, exact evidence binding, independent review, audit receipts, rollback, and release gates.",
    status: "implemented-foundation",
    evidenceRoutes: ["/scrimed-work", "/scrimed-control-plane", "/validation-evidence"],
    compoundingMechanism: "Each reviewed workflow contributes reusable policy, benchmark, failure, and approval evidence.",
    replicationFriction: "Requires integrated product, security, clinical, data, reviewer, and release controls rather than a prompt layer.",
    blockedClaim: "Does not prove certification, regulatory approval, customer adoption, or production safety."
  },
  {
    id: "healthcare-semantics-provenance",
    name: "Healthcare semantics and provenance",
    basis: "FHIR, HL7, DICOM metadata, payer-policy, ontology, citation, and source-lineage contracts.",
    status: "evidence-in-progress",
    evidenceRoutes: ["/clinical-data-fabric", "/interoperability", "/scrimed-hybrid-retrieval"],
    compoundingMechanism: "Validated mappings and source contracts improve retrieval, verification, and implementation reuse.",
    replicationFriction: "Depends on clinical semantics, tenant isolation, transformation lineage, and workflow-specific acceptance tests.",
    blockedClaim: "Does not prove live EHR integration, medical-device interoperability, or standards certification."
  },
  {
    id: "workflow-outcome-learning",
    name: "Workflow outcome learning",
    basis: "Case evidence, accepted outcomes, corrections, worst-cell evaluation, reviewer burden, and value telemetry.",
    status: "evidence-in-progress",
    evidenceRoutes: ["/healthcare-value-realization", "/scrimed-clinical-benchmark-suite", "/documentation-before-authorization"],
    compoundingMechanism: "Reviewed failures become regression cases and workflow improvements without online clinical self-modification.",
    replicationFriction: "Requires longitudinal evidence and operator adoption, not merely access to the same model.",
    blockedClaim: "Does not establish causality, clinical outcomes, ROI, revenue, or customer traction before formal evidence."
  },
  {
    id: "model-compute-portability",
    name: "Model and compute portability",
    basis: "Provider-neutral routing, task qualification, no privacy downgrade, bounded fallback, and effective-cost accounting.",
    status: "implemented-foundation",
    evidenceRoutes: ["/scrimed-compute-fabric", "/scrimed-model-router", "/scrimed-control-plane"],
    compoundingMechanism: "Per-task evidence improves model eligibility and cost choices while preserving replaceability.",
    replicationFriction: "Requires workflow-specific evaluation and policy-compatible failover across model and deployment classes.",
    blockedClaim: "Does not prove provider availability, BAA eligibility, PHI approval, or production-scale performance."
  },
  {
    id: "regulated-buyer-operating-evidence",
    name: "Regulated buyer operating evidence",
    basis: "Claims-safe offers, intended-use records, review packets, security gates, migration evidence, and controlled pilot operations.",
    status: "external-validation-required",
    evidenceRoutes: ["/offerings", "/approvals-readiness", "/investor-audience-readiness"],
    compoundingMechanism: "Approved buyer and pilot evidence can shorten later diligence only when permission and scope remain current.",
    replicationFriction: "Requires trustworthy execution history with named owners and independent review.",
    blockedClaim: "Does not imply customers, partners, revenue, procurement approval, investment, or commercial deployment."
  }
];

export function validatePlatformCapabilityRegistry() {
  const agentIds = new Set(controlPlaneAgentRegistry.map((agent) => agent.id));
  const workflowIds = new Set(controlPlaneWorkflowRegistry.map((workflow) => workflow.id));
  const capabilityIds = new Set(platformCapabilityRegistry.map((entry) => entry.id));
  const offerSlugs = new Set(productServiceOfferings.map((offer) => offer.slug));
  const failures: string[] = [];

  if (capabilityIds.size !== platformCapabilityRegistry.length) failures.push("duplicate-capability-id");
  for (const plane of platformPlanes) {
    if (!platformCapabilityRegistry.some((entry) => entry.plane === plane)) {
      failures.push(`unrepresented-platform-plane:${plane}`);
    }
  }
  for (const entry of platformCapabilityRegistry) {
    for (const dependency of entry.dependencies) {
      if (!capabilityIds.has(dependency)) failures.push(`unknown-capability-dependency:${entry.id}:${dependency}`);
    }
    for (const agentId of entry.agentIds) {
      if (!agentIds.has(agentId)) failures.push(`unknown-agent:${entry.id}:${agentId}`);
    }
    for (const workflowId of entry.workflowIds) {
      if (!workflowIds.has(workflowId)) failures.push(`unknown-workflow:${entry.id}:${workflowId}`);
    }
    if (entry.riskTier === "high" && !entry.highRiskDefaultOff) {
      failures.push(`high-risk-capability-not-default-off:${entry.id}`);
    }
    if (entry.environmentSupport.includes("protected-pilot") && !entry.requiredApprovals.length) {
      failures.push(`protected-pilot-without-approval:${entry.id}`);
    }
    if (entry.externalActionsEnabled !== false) failures.push(`external-action-enabled:${entry.id}`);
    if (!entry.product.trim()) failures.push(`capability-product-missing:${entry.id}`);
    if (!entry.permittedJurisdictions.length) failures.push(`capability-jurisdiction-missing:${entry.id}`);
    if (entry.externalSideEffects.length) failures.push(`capability-side-effect-declared:${entry.id}`);
  }
  for (const item of platformPortfolioRationalization) {
    if (item.sourceOfferSlug && !offerSlugs.has(item.sourceOfferSlug)) {
      failures.push(`unknown-portfolio-offer:${item.id}:${item.sourceOfferSlug}`);
    }
  }
  for (const item of platformPortfolioScorecards) {
    if (item.priorityScore < 0 || item.priorityScore > 100) {
      failures.push(`invalid-portfolio-priority:${item.id}`);
    }
    if (item.externalAuthorityGranted !== false) {
      failures.push(`portfolio-external-authority-granted:${item.id}`);
    }
  }

  return {
    valid: failures.length === 0,
    failures
  };
}

export function getPlatformStrategySummary() {
  const validation = validatePlatformCapabilityRegistry();
  const productPortfolio = getProductServicePortfolioSummary();
  const valueRealization = getHealthcareValueRealizationSummary();
  const countsByPlane = Object.fromEntries(
    platformPlanes.map((plane) => [
      plane,
      platformCapabilityRegistry.filter((entry) => entry.plane === plane).length
    ])
  ) as Record<PlatformPlane, number>;
  const summary = {
    service: "scrimed-platform-capability-registry" as const,
    version: scrimedPlatformStrategyVersion,
    boundary: scrimedPlatformStrategyBoundary,
    validation,
    platformPlanes,
    capabilityCount: platformCapabilityRegistry.length,
    countsByPlane,
    capabilities: platformCapabilityRegistry,
    strategicMetrics: strategicMetricRegistry,
    portfolioRationalization: platformPortfolioRationalization,
    portfolioScorecards: platformPortfolioScorecards,
    moatRegistry: platformMoatRegistry,
    coreWedge: {
      offer: "Workflow Intelligence Assessment",
      offerSlug: "workflow-intelligence-assessment",
      productWorkflow: "Documentation Before Authorization",
      progression: ["paid no-PHI assessment", "governed synthetic evaluation", "protected workflow pilot", "annual governed workflow subscription"],
      proofRoutes: ["/offerings", "/documentation-before-authorization", "/healthcare-value-realization"],
      boundary: "No live PHI, payer submission, EHR writeback, clinical authority, outcome guarantee, or customer activation."
    },
    sourceAlignment: {
      productOfferCount: productPortfolio.offerCount,
      productPackageCount: productPortfolio.packageCount,
      valueMetricCount: valueRealization.metricCount,
      valuePackageCount: valueRealization.packageCount,
      sourceOfferExists: productServiceOfferings.some((offer) => offer.slug === "workflow-intelligence-assessment")
    },
    productionAuthorityGranted: false as const,
    externalActionsExecuted: false as const,
    investorUse: "Internal diligence preparation only; founder, finance, legal, and recipient-specific approval remain required for external distribution.",
    nextBestAction: "Complete one buyer-specific Workflow Intelligence Assessment rehearsal with a baseline, acceptance rubric, reviewer burden, verified-intelligence-yield inputs, healthcare-value-returned inputs, and retained no-go boundary."
  };

  return {
    ...summary,
    auditHash: createClinicalEvidenceHash(summary)
  };
}
