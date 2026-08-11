import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import {
  getP32TechnicalGateCatalog,
  scrimedP32ExternalGateIds
} from "../scrimed-work/p32TechnicalGates";
import { platformPortfolioScorecards } from "./platformStrategy";

export const strategicDecisionIntelligenceVersion =
  "scrimed-strategic-decision-intelligence-v1-2026-08-11";
export const strategicDecisionIntelligenceBoundary =
  "Internal planning only. This system does not provide investment, securities, legal, clinical, regulatory, accounting, tax, procurement, partnership, valuation, revenue, customer, distribution, migration, deployment, or go-live authority.";

export type HumanGateClass =
  | "HUMAN_ACCOUNTABILITY_REQUIRED"
  | "COMMERCIAL_AUTHORITY_REQUIRED"
  | "OPERATOR_ACTION_REQUIRED"
  | "AUTOMATED_GATE";

const gateClassification: Record<(typeof scrimedP32ExternalGateIds)[number], HumanGateClass> = {
  "clean-reviewed-commit-provenance": "HUMAN_ACCOUNTABILITY_REQUIRED",
  "named-independent-reviewer": "HUMAN_ACCOUNTABILITY_REQUIRED",
  "aal2-operator-evidence": "OPERATOR_ACTION_REQUIRED",
  "migration-approval": "HUMAN_ACCOUNTABILITY_REQUIRED",
  "intended-use-approval": "HUMAN_ACCOUNTABILITY_REQUIRED",
  "clinical-safety-approval": "HUMAN_ACCOUNTABILITY_REQUIRED",
  "privacy-approval": "HUMAN_ACCOUNTABILITY_REQUIRED",
  "legal-regulatory-approval": "HUMAN_ACCOUNTABILITY_REQUIRED",
  "security-approval": "HUMAN_ACCOUNTABILITY_REQUIRED",
  "baa-subprocessor-residency-approval": "HUMAN_ACCOUNTABILITY_REQUIRED",
  "deployment-authorization": "HUMAN_ACCOUNTABILITY_REQUIRED",
  "post-deployment-smoke-validation": "OPERATOR_ACTION_REQUIRED",
  "customer-go-live-authorization": "COMMERCIAL_AUTHORITY_REQUIRED"
};

const externalGateAutomation = {
  "clean-reviewed-commit-provenance": {
    automatableEvidence: ["source manifest", "candidate hash", "validation manifest", "review packet"],
    irreducibleAction: "A distinct named reviewer approves the exact candidate."
  },
  "named-independent-reviewer": {
    automatableEvidence: ["review-lane manifest", "risk summary", "staleness and fingerprint checks"],
    irreducibleAction: "A competent independent reviewer records a candidate-bound decision."
  },
  "aal2-operator-evidence": {
    automatableEvidence: ["claim parser", "freshness", "nonce", "audience", "role and candidate-binding checks"],
    irreducibleAction: "An authorized operator completes real second-factor authentication."
  },
  "migration-approval": {
    automatableEvidence: ["static SQL review", "checksum", "ordering", "disposable forward and recovery test"],
    irreducibleAction: "Database and release authorities approve the exact migration packet."
  },
  "intended-use-approval": {
    automatableEvidence: ["intended-use register", "prohibited-use checks", "candidate binding"],
    irreducibleAction: "The accountable clinical/product owner adopts the exact intended use."
  },
  "clinical-safety-approval": {
    automatableEvidence: ["safety benchmarks", "worst-cell report", "abstention and review-path tests"],
    irreducibleAction: "A qualified clinical safety reviewer accepts the bounded use."
  },
  "privacy-approval": {
    automatableEvidence: ["data-flow inventory", "no-PHI tests", "retention and processor register"],
    irreducibleAction: "The accountable privacy authority accepts the scoped data posture."
  },
  "legal-regulatory-approval": {
    automatableEvidence: ["claims register", "jurisdiction questions", "intended-use and contract packet"],
    irreducibleAction: "Qualified counsel records a scoped legal decision."
  },
  "security-approval": {
    automatableEvidence: ["threat model", "security tests", "SBOM", "incident and rollback packet"],
    irreducibleAction: "The accountable security authority accepts residual risk."
  },
  "baa-subprocessor-residency-approval": {
    automatableEvidence: ["provider passport", "subprocessor inventory", "residency and retention controls"],
    irreducibleAction: "Legal, privacy, security, and customer authorities approve the exact provider scope."
  },
  "deployment-authorization": {
    automatableEvidence: ["exact artifact manifest", "environment diff", "monitoring and rollback checks"],
    irreducibleAction: "The deployment authority approves target, window, owner, and rollback."
  },
  "post-deployment-smoke-validation": {
    automatableEvidence: ["health", "policy denial", "tenant isolation", "no-PHI logs", "rollback smoke"],
    irreducibleAction: "An authorized operator runs checks against an actual authorized deployment."
  },
  "customer-go-live-authorization": {
    automatableEvidence: ["acceptance criteria", "training", "support", "environment and rollback packet"],
    irreducibleAction: "Customer and SCRIMED authorities approve the specific go-live."
  }
} as const;

export function getHumanGateMinimizationReport() {
  const gateCatalog = getP32TechnicalGateCatalog();
  const gates = scrimedP32ExternalGateIds.map((gateId) => {
    const definition = gateCatalog.find((entry) => entry.gateId === gateId)!;
    const automation = externalGateAutomation[gateId];
    const record = {
      gateId,
      classification: gateClassification[gateId],
      ownerRole: definition.ownerRole,
      currentStatus: "PENDING_EXTERNAL_EVIDENCE" as const,
      automatableEvidence: automation.automatableEvidence,
      irreducibleAction: automation.irreducibleAction,
      automationDisposition: "EVIDENCE_CAN_BE_PREPARED_BUT_AUTHORITY_CANNOT_BE_AUTOMATED" as const,
      exactCandidateBindingRequired: true as const,
      syntheticFixtureCanSatisfy: false as const
    };
    return { ...record, auditHash: createClinicalEvidenceHash(record) };
  });
  const report = {
    service: "scrimed-human-gate-minimization",
    version: strategicDecisionIntelligenceVersion,
    totalGateCount: gates.length,
    counts: {
      humanAccountability: gates.filter((entry) => entry.classification === "HUMAN_ACCOUNTABILITY_REQUIRED").length,
      commercialAuthority: gates.filter((entry) => entry.classification === "COMMERCIAL_AUTHORITY_REQUIRED").length,
      operatorAction: gates.filter((entry) => entry.classification === "OPERATOR_ACTION_REQUIRED").length,
      automatedGate: gates.filter((entry) => entry.classification === "AUTOMATED_GATE").length
    },
    gates,
    designObjective: "Fewer, narrower, higher-quality human decisions supported by machine-verifiable evidence.",
    boundary: strategicDecisionIntelligenceBoundary,
    externalApprovalsAchievedByThisReport: 0 as const
  };
  return { ...report, auditHash: createClinicalEvidenceHash(report) };
}

export type CeoDecision = {
  decisionId: string;
  category: "investor" | "funding" | "partnership" | "customer" | "legal" | "product-strategy" | "production" | "security" | "regulatory" | "capital";
  decisionRequired: string;
  context: string;
  evidence: string[];
  recommendation: string;
  alternatives: string[];
  financialImpact: string;
  strategicImpact: string;
  regulatoryImpact: string;
  risk: "moderate" | "high";
  urgency: "now" | "next" | "defer-until-trigger";
  deadline: string | null;
  defaultSafeAction: string;
  status: "FOUNDER_DECISION_REQUIRED" | "DEFERRED_BY_SAFE_DEFAULT";
  auditHash: string;
};

function ceoDecision(input: Omit<CeoDecision, "auditHash">): CeoDecision {
  return { ...input, auditHash: createClinicalEvidenceHash(input) };
}

export const ceoDecisionRegister: CeoDecision[] = [
  ceoDecision({
    decisionId: "capital-path-and-authorized-materials",
    category: "funding",
    decisionRequired: "Select the fundraising path, target amount, authorized recipients, and counsel-reviewed material set.",
    context: "Engineering can prepare diligence evidence but cannot authorize a securities offer or distribution.",
    evidence: ["/investor-audience-readiness", "/investor-demo-command-room", "/scrimed-proof-packet-studio"],
    recommendation: "Use controlled relationship-building and diligence demonstrations while qualified counsel prepares the fundraising lane.",
    alternatives: ["strategic partnership discussions", "non-dilutive programs", "defer formal raise"],
    financialImpact: "Determines capital runway, dilution, legal cost, and diligence scope; no amount is assumed here.",
    strategicImpact: "Concentrates outreach on investors whose platform capabilities complement SCRIMED's governed healthcare infrastructure.",
    regulatoryImpact: "Securities and solicitation review required before offering materials are distributed.",
    risk: "high",
    urgency: "now",
    deadline: null,
    defaultSafeAction: "Keep materials internal and use nonbinding product demonstrations only.",
    status: "FOUNDER_DECISION_REQUIRED"
  }),
  ceoDecision({
    decisionId: "commercial-entry-wedge",
    category: "product-strategy",
    decisionRequired: "Adopt Workflow Intelligence Assessment as the primary entry wedge for the next commercial cycle.",
    context: "The current portfolio scorecard ranks bounded administrative workflow intelligence ahead of protected clinical execution.",
    evidence: ["/offerings", "/documentation-before-authorization", "/healthcare-value-realization"],
    recommendation: "Lead with a fixed-scope no-PHI assessment and synthetic evaluation, then expand only on verified buyer evidence.",
    alternatives: ["governance-only assessment", "synthetic benchmark engagement", "defer commercial activity"],
    financialImpact: "Supports a scoped starting-price conversation without creating a binding quote or revenue forecast.",
    strategicImpact: "Creates a focused route from demo to measurable workflow proof.",
    regulatoryImpact: "Keeps live PHI, clinical authority, payer submission, and EHR writeback outside current scope.",
    risk: "moderate",
    urgency: "now",
    deadline: null,
    defaultSafeAction: "Continue internal rehearsal and nonbinding discovery only.",
    status: "FOUNDER_DECISION_REQUIRED"
  }),
  ceoDecision({
    decisionId: "production-phi-activation",
    category: "production",
    decisionRequired: "Authorize whether SCRIMED should begin the external program required for a future production-PHI scope.",
    context: "Current platform policy is synthetic/no-PHI and no production clinical execution.",
    evidence: ["/clinical-production-readiness", "/approvals-readiness", "/security-posture"],
    recommendation: "Keep PHI disabled and fund formal privacy, security, legal, clinical, provider, and customer readiness only after a qualified buyer need exists.",
    alternatives: ["remain no-PHI", "commission readiness assessment", "buyer-sponsored bounded readiness program"],
    financialImpact: "Would add external counsel, security, infrastructure, assurance, and operating costs.",
    strategicImpact: "Could unlock protected workflows later, but premature activation would increase risk and dilute commercial focus.",
    regulatoryImpact: "Requires separate privacy, security, contractual, residency, intended-use, and customer approvals.",
    risk: "high",
    urgency: "defer-until-trigger",
    deadline: null,
    defaultSafeAction: "Keep live PHI and production connectors disabled.",
    status: "DEFERRED_BY_SAFE_DEFAULT"
  }),
  ceoDecision({
    decisionId: "public-legal-identity",
    category: "legal",
    decisionRequired: "Confirm the final legal entity name, public-address posture, governing jurisdiction, and privacy contact for counsel review.",
    context: "Repository policy intentionally avoids inventing unverified legal identity fields.",
    evidence: ["/privacy", "/terms", "docs/CEO_AND_COUNSEL_DECISIONS_REQUIRED.md"],
    recommendation: "Adopt a no-street-address public posture until verified business details and counsel-approved policies exist.",
    alternatives: ["verified registered-agent/business address", "verified operating address", "no public street address"],
    financialImpact: "Primarily legal and operating readiness cost.",
    strategicImpact: "Improves diligence consistency and public credibility.",
    regulatoryImpact: "Counsel must determine entity and jurisdiction-specific notice requirements.",
    risk: "high",
    urgency: "next",
    deadline: null,
    defaultSafeAction: "Publish no unverified address, telephone, or final-compliance claim.",
    status: "FOUNDER_DECISION_REQUIRED"
  })
];

const investorDimensions = [
  ["architecture", 88, "high", ["/scrimed-control-plane", "/enterprise-scalability"], "Exact committed-candidate evidence remains pending."],
  ["product-clarity", 82, "high", ["/offerings", "/product"], "Founder adoption of the primary wedge remains pending."],
  ["customer-value-hypothesis", 68, "medium", ["/healthcare-value-realization", "/commercial-strategy"], "No buyer-approved baseline or outcome exists."],
  ["technical-moat", 81, "medium", ["/validation-evidence", "/scrimed-control-plane"], "Compounding external evidence remains limited."],
  ["healthcare-differentiation", 79, "medium", ["/healthcare-intelligence-os", "/clinical-data-fabric"], "No comparative buyer study has been approved."],
  ["governance", 90, "high", ["/approvals-readiness", "/trust-center"], "Human and external gates remain pending."],
  ["security", 76, "medium", ["/security-posture", "/enterprise-readiness"], "Leaked-password protection and independent assurance remain open."],
  ["evidence", 73, "high", ["/validation-evidence", "/scrimed-proof-packet-studio"], "Current working-tree evidence is mutable until committed and reviewed."],
  ["commercialization", 64, "medium", ["/offerings", "/pilot-demo-commercial-readiness"], "No contracted customer or verified revenue is represented."],
  ["capital-efficiency", 61, "low", ["/scrimed-llmops-observability", "/healthcare-value-realization"], "Measured operating cost baseline is incomplete."],
  ["model-portability", 84, "high", ["/scrimed-model-router", "/scrimed-compute-fabric"], "Provider conformance evidence remains configuration-dependent."],
  ["ecosystem-readiness", 66, "medium", ["/global-reach", "/interoperability"], "No partnership, procurement, or integration approval is implied."],
  ["regulatory-discipline", 88, "high", ["/clinical-production-readiness", "/global-certification-readiness"], "Discipline is implemented; approvals and classifications remain external."],
  ["release-discipline", 86, "high", ["/release-continuity", "/approvals-readiness"], "Exact-head review and immutable candidate provenance remain pending."],
  ["ip-maturity", 57, "low", ["/scrimed-control-plane", "/validation-evidence"], "Inventions are inventor-asserted and require qualified IP review."]
] as const;

export function getInvestorReadinessEngine() {
  const dimensions = investorDimensions.map(([id, score, confidence, evidence, gap]) => ({
    id,
    score,
    confidence,
    evidence,
    gap,
    nextAction: `Close the stated ${id} gap with dated, attributable, independently reviewable evidence.`
  }));
  const score = Math.round(dimensions.reduce((sum, entry) => sum + entry.score, 0) / dimensions.length);
  const result = {
    service: "scrimed-investor-readiness-engine",
    version: strategicDecisionIntelligenceVersion,
    status: "INTERNAL_HEURISTIC_REVIEW_REQUIRED" as const,
    score,
    scoreMeaning: "Internal evidence-completeness heuristic only; not a probability of investment, valuation, endorsement, or fundraising outcome.",
    dimensions,
    materialNoGoCount: dimensions.filter((entry) => entry.score < 70).length,
    investmentProbabilityCalculated: false as const,
    distributionAuthorized: false as const,
    boundary: strategicDecisionIntelligenceBoundary
  };
  return { ...result, auditHash: createClinicalEvidenceHash(result) };
}

const partnerNames = [
  "NVIDIA",
  "Apple",
  "Microsoft",
  "OpenAI",
  "Anthropic",
  "Siemens",
  "Siemens Healthineers",
  "Philips",
  "GE HealthCare",
  "Emory",
  "academic medical centers",
  "hyperscalers",
  "sovereign AI platforms",
  "payers"
] as const;

function partnerProfile(name: (typeof partnerNames)[number]) {
  const imaging = ["Siemens", "Siemens Healthineers", "Philips", "GE HealthCare"].includes(name);
  const modelPlatform = ["NVIDIA", "Microsoft", "OpenAI", "Anthropic", "hyperscalers", "sovereign AI platforms"].includes(name);
  const research = ["Emory", "academic medical centers"].includes(name);
  const profile = {
    name,
    label: "Internal strategic readiness profile — no partnership implied." as const,
    technicalFit: imaging ? "governed imaging metadata and workflow conformance" : modelPlatform ? "model portability, compute, identity, and governed deployment" : research ? "synthetic workflow research and evidence generation" : "administrative workflow and policy intelligence",
    complementaryValue: "SCRIMED contributes healthcare workflow governance, evidence, evaluation, and integration controls.",
    probableIntegrationSurface: imaging ? "read-only DICOM/DICOMweb and FHIR metadata contracts" : modelPlatform ? "provider-neutral model gateway and deployment profiles" : research ? "synthetic evaluation and study governance" : "read-only payer policy and workflow adapters",
    missingProof: ["organization-specific technical validation", "approved commercial thesis", "named security/legal owner", "permissioned introduction"],
    procurementConsiderations: ["data rights", "security review", "contract authority", "intended use", "support and rollback"],
    securityExpectations: ["least privilege", "tenant isolation", "signed artifacts", "auditability", "no silent fallback"],
    interoperabilityRequirements: imaging ? ["DICOM", "DICOMweb", "FHIR ImagingStudy", "Provenance"] : ["scoped APIs", "portable export", "identity", "audit receipts"],
    strategicUpside: "Could accelerate validated distribution or infrastructure leverage only after mutual diligence and written authorization.",
    externalRelationshipVerified: false as const,
    outreachAuthorized: false as const
  };
  return { ...profile, auditHash: createClinicalEvidenceHash(profile) };
}

export const strategicPartnerReadinessProfiles = partnerNames.map(partnerProfile);

export const strategicRoadmap = {
  NOW: [
    "Create a clean exact-source candidate and independent review packet.",
    "Rehearse the Workflow Intelligence Assessment for three buyer archetypes.",
    "Collect measured baseline, reviewer burden, acceptance, latency, and cost inputs from synthetic runs.",
    "Complete AAL2 and disposable migration evidence without activating production scope."
  ],
  NEXT: [
    "Secure counsel-reviewed fundraising and commercial authority boundaries.",
    "Run one buyer-approved synthetic evaluation with explicit acceptance criteria.",
    "Qualify provider and connector adapters through conformance and failure testing.",
    "Commission privacy and security readiness reviews when a qualified buyer requires protected scope."
  ],
  LATER: [
    "Advance a protected no-PHI pilot after identity, migration, tenant, reviewer, and buyer gates pass.",
    "Build external outcome evidence and renewal dossiers from approved cases.",
    "Expand sovereign and edge profiles only where measured demand supports the cost."
  ],
  OPTIONALITY: [
    "Clinical experience catalog modules remain synthetic demonstrations until use-specific evidence and authority exist.",
    "Partner marketplace remains deferred until one read-only adapter passes governance and commercial validation.",
    "Production PHI and device integration remain prohibited until separately approved."
  ]
} as const;

export function getStrategicDecisionIntelligenceSummary() {
  const humanGateMinimization = getHumanGateMinimizationReport();
  const investorReadiness = getInvestorReadinessEngine();
  const rankedPortfolio = [...platformPortfolioScorecards].sort((a, b) => b.priorityScore - a.priorityScore);
  const summary = {
    service: "scrimed-strategic-decision-intelligence",
    version: strategicDecisionIntelligenceVersion,
    status: "INTERNAL_DECISION_SUPPORT_ACTIVE" as const,
    humanGateMinimization,
    ceoDecisions: ceoDecisionRegister,
    investorReadiness,
    strategicPartnerReadinessProfiles,
    strategicRoadmap,
    continuityPlanner: {
      bestNextAction: rankedPortfolio[0]?.nextAction ?? "Retain safe defaults.",
      bestRevenueAction: rankedPortfolio.find((entry) => entry.id === "workflow-intelligence-entry-wedge")?.nextAction ?? "Retain safe defaults.",
      bestMoatAction: rankedPortfolio.find((entry) => entry.category === "STRATEGIC_MOAT")?.nextAction ?? "Retain safe defaults.",
      bestEvidenceAction: rankedPortfolio.find((entry) => entry.id === "governed-synthetic-evaluation")?.nextAction ?? "Retain safe defaults.",
      bestInvestorAction: "Bind the canonical demo, proof packet, source manifest, limitations, commercial wedge, and next milestone to one reviewed candidate.",
      bestLowRiskAction: "Complete deterministic buyer rehearsals and synthetic evidence collection without external distribution or protected data."
    },
    productionAuthorityGranted: false as const,
    externalDistributionAuthorityGranted: false as const,
    partnershipClaimsAllowed: false as const,
    valuationCalculated: false as const,
    boundary: strategicDecisionIntelligenceBoundary
  };
  return { ...summary, auditHash: createClinicalEvidenceHash(summary) };
}
