import { getProductServicePortfolioSummary, productServiceOfferings } from "../productServicePortfolio";
import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import { getHealthcareValueRealizationSummary } from "../healthcareValueRealization";
import { controlPlaneAgentRegistry, controlPlaneWorkflowRegistry } from "./registries";
import type {
  PlatformCapabilityDefinition,
  PlatformMoatDefinition,
  PlatformPlane,
  PlatformPortfolioDisposition,
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

function capability(
  input: Omit<PlatformCapabilityDefinition, "auditHash" | "externalActionsEnabled">
): PlatformCapabilityDefinition {
  const definition = {
    ...input,
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

export const platformMoatRegistry: PlatformMoatDefinition[] = [
  {
    id: "trust-governance-plane",
    name: "Trust and governance plane",
    basis: "Policy-before-action, exact evidence binding, independent review, audit receipts, rollback, and release gates.",
    status: "implemented-foundation",
    maturity: "integrated",
    replicationDifficulty: 5,
    evidenceRoutes: ["/scrimed-work", "/scrimed-control-plane", "/validation-evidence"],
    compoundingMechanism: "Each reviewed workflow contributes reusable policy, benchmark, failure, and approval evidence.",
    replicationFriction: "Requires integrated product, security, clinical, data, reviewer, and release controls rather than a prompt layer.",
    dependencies: ["governed-agent-runtime", "evidence-learning-system", "release-control-plane"],
    evidenceNeeded: ["independent exact-head review", "protected-pilot audit evidence", "external security and privacy review"],
    monetizationRelevance: "Supports governance assessments, protected pilots, and recurring enterprise control-plane subscriptions.",
    blockedClaim: "Does not prove certification, regulatory approval, customer adoption, or production safety."
  },
  {
    id: "healthcare-evidence-graph",
    name: "Healthcare evidence graph",
    basis: "FHIR, HL7, DICOM metadata, payer-policy, ontology, citation, and source-lineage contracts.",
    status: "evidence-in-progress",
    maturity: "integrated",
    replicationDifficulty: 5,
    evidenceRoutes: ["/clinical-data-fabric", "/interoperability", "/scrimed-hybrid-retrieval"],
    compoundingMechanism: "Validated mappings and source contracts improve retrieval, verification, and implementation reuse.",
    replicationFriction: "Depends on clinical semantics, tenant isolation, transformation lineage, and workflow-specific acceptance tests.",
    dependencies: ["data-interoperability-fabric", "context-retrieval-engine", "clinical-ontology-registry"],
    evidenceNeeded: ["graph integrity evidence", "source-to-claim validation", "tenant-isolation tests"],
    monetizationRelevance: "Improves diligence, implementation speed, grounding quality, and reusable evidence services.",
    blockedClaim: "Does not prove live EHR integration, medical-device interoperability, or standards certification."
  },
  {
    id: "longitudinal-benchmark-learning",
    name: "Longitudinal benchmark learning",
    basis: "Case evidence, accepted outcomes, corrections, worst-cell evaluation, reviewer burden, and value telemetry.",
    status: "evidence-in-progress",
    maturity: "foundation",
    replicationDifficulty: 4,
    evidenceRoutes: ["/healthcare-value-realization", "/scrimed-clinical-benchmark-suite", "/documentation-before-authorization"],
    compoundingMechanism: "Reviewed failures become regression cases and workflow improvements without online clinical self-modification.",
    replicationFriction: "Requires longitudinal evidence and operator adoption, not merely access to the same model.",
    dependencies: ["case-evidence-ledger", "clinical-evaluation-harness", "human-review-workflows"],
    evidenceNeeded: ["reviewed failure corpus", "before-and-after benchmark evidence", "multi-site external validation"],
    monetizationRelevance: "Can lower correction burden and strengthen renewal evidence once external outcomes are validated.",
    blockedClaim: "Does not establish causality, clinical outcomes, ROI, revenue, or customer traction before formal evidence."
  },
  {
    id: "multi-model-routing",
    name: "Multi-model routing",
    basis: "Provider-neutral routing, task qualification, no privacy downgrade, bounded fallback, and effective-cost accounting.",
    status: "implemented-foundation",
    maturity: "integrated",
    replicationDifficulty: 4,
    evidenceRoutes: ["/scrimed-compute-fabric", "/scrimed-model-router", "/scrimed-control-plane"],
    compoundingMechanism: "Per-task evidence improves model eligibility and cost choices while preserving replaceability.",
    replicationFriction: "Requires workflow-specific evaluation and policy-compatible failover across model and deployment classes.",
    dependencies: ["model-qualification", "provider-conformance", "effective-cost-telemetry"],
    evidenceNeeded: ["provider outage tests", "task-level quality comparisons", "accepted-outcome cost baselines"],
    monetizationRelevance: "Protects gross-margin scenarios and provider leverage without weakening privacy or safety floors.",
    blockedClaim: "Does not prove provider availability, BAA eligibility, PHI approval, or production-scale performance."
  },
  {
    id: "release-assurance",
    name: "Release assurance",
    basis: "Claims-safe offers, intended-use records, review packets, security gates, migration evidence, and controlled pilot operations.",
    status: "external-validation-required",
    maturity: "review-ready",
    replicationDifficulty: 4,
    evidenceRoutes: ["/offerings", "/approvals-readiness", "/investor-audience-readiness"],
    compoundingMechanism: "Approved buyer and pilot evidence can shorten later diligence only when permission and scope remain current.",
    replicationFriction: "Requires trustworthy execution history with named owners and independent review.",
    dependencies: ["exact-head-review-binding", "release-state-machine", "security-evidence-packets"],
    evidenceNeeded: ["fresh exact-head approval", "merge authorization", "authorized post-deployment evidence"],
    monetizationRelevance: "Reduces enterprise diligence friction while keeping deployment and customer activation separately controlled.",
    blockedClaim: "Does not imply customers, partners, revenue, procurement approval, investment, or commercial deployment."
  },
  {
    id: "governed-agent-orchestration",
    name: "Governed agent orchestration",
    basis: "Bounded planner-specialist-verifier execution with least privilege, checkpoints, approvals, cancellation, and rollback metadata.",
    status: "implemented-foundation",
    maturity: "integrated",
    replicationDifficulty: 5,
    evidenceRoutes: ["/scrimed-work", "/scrimed-agent-governance", "/scrimed-llmops-observability"],
    compoundingMechanism: "Reusable policies, tool receipts, failure classes, and review patterns improve each governed workflow.",
    replicationFriction: "Requires orchestration, identity, policy, evidence, observability, and human operations to work as one system.",
    dependencies: ["trust-governance-plane", "agent-runtime", "approval-engine"],
    evidenceNeeded: ["long-horizon resilience tests", "independent reviewer evidence", "protected-pilot operating metrics"],
    monetizationRelevance: "Enables repeatable workflow subscriptions and governed automation services.",
    blockedClaim: "Does not authorize autonomous clinical, financial, identity, communication, or production actions."
  },
  {
    id: "healthcare-specific-evaluation-corpus",
    name: "Healthcare-specific evaluation corpus",
    basis: "Consequence-weighted synthetic cases, specialty domains, document stress cases, worst-cell gates, and reviewer rubrics.",
    status: "evidence-in-progress",
    maturity: "integrated",
    replicationDifficulty: 4,
    evidenceRoutes: ["/scrimed-clinical-benchmark-suite", "/clinical-robustness-lab", "/validation-evidence"],
    compoundingMechanism: "Reviewed failures and corrections become quarantined regression cases after governance review.",
    replicationFriction: "Requires domain taxonomy, clinical reviewers, contamination controls, and consequence-aware scoring.",
    dependencies: ["eval-core", "document-stress-lab", "clinical-review-rubrics"],
    evidenceNeeded: ["physician grading", "site and specialty validation", "temporal holdouts"],
    monetizationRelevance: "Supports model qualification, diligence services, and safer workflow expansion.",
    blockedClaim: "Synthetic and internal evaluation does not establish clinical validation or universal model superiority."
  },
  {
    id: "model-qualification",
    name: "Model qualification",
    basis: "Task-specific model passports, conformance evidence, worst-cell eligibility, canarying, and rollback controls.",
    status: "implemented-foundation",
    maturity: "review-ready",
    replicationDifficulty: 4,
    evidenceRoutes: ["/scrimed-model-router", "/scrimed-compute-fabric", "/model-intelligence-registry"],
    compoundingMechanism: "Each qualified task cell expands portable routing evidence without granting authority to untested cells.",
    replicationFriction: "Requires model, provider, runtime, prompt, tool, privacy, and workflow evidence to remain version-bound.",
    dependencies: ["multi-model-routing", "healthcare-specific-evaluation-corpus", "model-passport-registry"],
    evidenceNeeded: ["shadow evaluations", "fallback equivalence", "provider documentary review"],
    monetizationRelevance: "Allows cost and quality optimization while preserving model independence.",
    blockedClaim: "No model is approved for live PHI or high-risk clinical authority merely by registration."
  },
  {
    id: "workflow-intelligence",
    name: "Workflow intelligence",
    basis: "Healthcare workflow maps, context packets, documentation gaps, outcome ledgers, and verified artifacts.",
    status: "evidence-in-progress",
    maturity: "review-ready",
    replicationDifficulty: 5,
    evidenceRoutes: ["/documentation-before-authorization", "/healthcare-value-realization", "/scrimed-work"],
    compoundingMechanism: "Each scoped pilot can add reusable workflow steps, evidence requirements, and failure modes.",
    replicationFriction: "Depends on healthcare process expertise, integration semantics, policy, and acceptance evidence.",
    dependencies: ["governed-agent-orchestration", "healthcare-evidence-graph", "outcome-telemetry"],
    evidenceNeeded: ["buyer-specific baselines", "reviewer acceptance", "external pilot outcomes"],
    monetizationRelevance: "Anchors the assessment-to-pilot-to-subscription commercial wedge.",
    blockedClaim: "Does not prove denial reduction, time savings, ROI, or customer outcomes before verified evidence."
  },
  {
    id: "connector-policy-layer",
    name: "Connector policy layer",
    basis: "Capability-scoped connector manifests, official-API rules, read/write separation, terms review, and kill switches.",
    status: "implemented-foundation",
    maturity: "foundation",
    replicationDifficulty: 4,
    evidenceRoutes: ["/enterprise-healthcare-infrastructure", "/interoperability", "/approvals-readiness"],
    compoundingMechanism: "Validated connector policies and conformance receipts can be reused across governed workflows.",
    replicationFriction: "Requires legal, security, identity, data-rights, interoperability, and operational controls.",
    dependencies: ["connector-firewall", "identity-policy", "audit-ledger"],
    evidenceNeeded: ["one read-only adapter conformance run", "terms review", "revocation and rollback test"],
    monetizationRelevance: "Supports protected integration pilots and future governed ecosystem distribution.",
    blockedClaim: "Does not imply live connector access, vendor approval, EHR writeback, or marketplace certification."
  },
  {
    id: "economic-value-telemetry",
    name: "Economic value telemetry",
    basis: "Cost per verified task, reviewer burden, correction burden, workflow value, and provenance-tagged outcome measures.",
    status: "evidence-in-progress",
    maturity: "foundation",
    replicationDifficulty: 3,
    evidenceRoutes: ["/healthcare-value-realization", "/operational-efficiency", "/investor-readiness"],
    compoundingMechanism: "Verified pilot baselines improve pricing, capacity planning, model routing, and renewal evidence.",
    replicationFriction: "Requires trustworthy baselines, complete costs, acceptance evidence, and finance review.",
    dependencies: ["value-telemetry", "case-evidence-ledger", "finance-review"],
    evidenceNeeded: ["measured pilot baselines", "reviewed total-cost inputs", "renewal evidence"],
    monetizationRelevance: "Supports value-based pricing and capital-efficient model selection when evidence exists.",
    blockedClaim: "No simulated or estimated value is a revenue, margin, savings, or ROI guarantee."
  },
  {
    id: "synthetic-scenario-library",
    name: "Synthetic scenario library",
    basis: "No-PHI workflow cases, adversarial variants, buyer rehearsals, role-specific demos, and deterministic fixtures.",
    status: "implemented-foundation",
    maturity: "integrated",
    replicationDifficulty: 3,
    evidenceRoutes: ["/demos", "/pilot-demo-commercial-readiness", "/clinical-robustness-lab"],
    compoundingMechanism: "Each reviewed scenario expands test coverage, demos, evaluation, and pilot discovery without live data.",
    replicationFriction: "Requires domain-realistic cases, boundary coverage, deterministic outcomes, and claims-safe presentation.",
    dependencies: ["synthetic-fixtures", "evaluation-harness", "public-claims-policy"],
    evidenceNeeded: ["buyer-specific rehearsal feedback", "accessibility verification", "scenario coverage trends"],
    monetizationRelevance: "Shortens assessment and pilot preparation while preserving no-PHI operation.",
    blockedClaim: "Synthetic demonstrations are not customer outcomes, clinical validation, or deployment evidence."
  },
  {
    id: "sovereign-deployment-controls",
    name: "Sovereign deployment controls",
    basis: "Assurance levels, enclave policies, residency, egress restrictions, capacity passports, and independent failover.",
    status: "evidence-in-progress",
    maturity: "foundation",
    replicationDifficulty: 5,
    evidenceRoutes: ["/clinical-assurance-control-plane", "/scrimed-compute-fabric", "/global-enterprise-command"],
    compoundingMechanism: "Validated regional and private deployment profiles improve reuse without collapsing jurisdictional controls.",
    replicationFriction: "Requires identity, cryptographic artifacts, private networking, capacity, recovery, and policy evidence.",
    dependencies: ["clinical-assurance-control-plane", "capacity-passports", "provider-portability"],
    evidenceNeeded: ["enclave recovery drill", "materially independent fallback test", "regional legal and security review"],
    monetizationRelevance: "Creates a path to private, regulated, and sovereign enterprise deployments after external approvals.",
    blockedClaim: "Does not establish sovereign certification, government authorization, regional compliance, or production deployment."
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
  }
  for (const item of platformPortfolioRationalization) {
    if (item.sourceOfferSlug && !offerSlugs.has(item.sourceOfferSlug)) {
      failures.push(`unknown-portfolio-offer:${item.id}:${item.sourceOfferSlug}`);
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
