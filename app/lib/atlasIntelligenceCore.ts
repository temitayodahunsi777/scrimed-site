import { sandboxRuntimes, specialistServiceRegistry } from "./agentOS";
import { integrationContracts } from "./integrationContracts";

export type AtlasCoreStatus = "foundation-online" | "synthetic-ready" | "production-gated";
export type DocumentFamily =
  | "forms"
  | "tables"
  | "contracts"
  | "referrals"
  | "claims"
  | "prior-authorizations"
  | "medical-records";
export type EvidenceSourceType = "guideline" | "protocol" | "publication" | "policy" | "standard" | "buyer-source";
export type ValidationStatus = "validated" | "needs-review" | "synthetic-only" | "stale-source";

export type StructuralParser = {
  family: DocumentFamily;
  status: AtlasCoreStatus;
  layoutUnderstanding: string[];
  extractionPolicy: string;
  reviewBoundary: string;
};

export type EvidenceSource = {
  id: string;
  title: string;
  type: EvidenceSourceType;
  owner: string;
  url: string;
  version: string;
  validationTimestamp: string;
  usageBoundary: string;
};

export type EvidenceAnswerContract = {
  field: string;
  required: boolean;
  purpose: string;
};

export type TrustCard = {
  slug: string;
  recommendation: string;
  workflow: string;
  confidence: number;
  sourceIds: string[];
  sourceAttribution: string;
  guidelineVersion: string;
  validationStatus: ValidationStatus;
  lastUpdated: string;
  humanReview: string;
};

export type ContinuousValidationMetric = {
  metric: string;
  route: string;
  measurement: string;
  pilotUse: string;
  productionGate: string;
};

export type AiAsset = {
  id: string;
  asset: string;
  owner: string;
  type: "agent" | "model" | "prompt" | "connector" | "knowledge-source" | "workflow";
  status: "registered" | "planned" | "requires-review";
  shadowAiSignals: string[];
  auditEvents: string[];
};

export type ReimbursementCapability = {
  capability: string;
  status: AtlasCoreStatus;
  supportedSignals: string[];
  evidenceNeeds: string[];
  boundary: string;
};

export type AtlasSubsystem = {
  name: string;
  status: AtlasCoreStatus;
  route: string;
  purpose: string;
  controls: string[];
};

export const atlasCoreBoundary =
  "SCRIMED Atlas Intelligence Core v1 is a synthetic pilot and enterprise assessment operating layer. Medical-record, claims, payer, wearable, and telehealth workflows remain gated until tenant approval, BAA readiness, live connector controls, durable audit, and human review are approved.";

export const structuralIntelligenceEngine: StructuralParser[] = [
  {
    family: "forms",
    status: "synthetic-ready",
    layoutUnderstanding: ["field grouping", "checkbox state", "signature blocks", "required field detection"],
    extractionPolicy: "Parse layout, labels, tables, and visual grouping before LLM extraction.",
    reviewBoundary: "Business and synthetic healthcare forms only until live document controls are approved."
  },
  {
    family: "tables",
    status: "synthetic-ready",
    layoutUnderstanding: ["row-column mapping", "merged cells", "header inference", "numeric unit detection"],
    extractionPolicy: "Preserve table structure and source cell references before summarization.",
    reviewBoundary: "No autonomous financial, billing, clinical, or coverage decision from extracted tables."
  },
  {
    family: "contracts",
    status: "foundation-online",
    layoutUnderstanding: ["section hierarchy", "defined terms", "obligations", "dates", "exceptions"],
    extractionPolicy: "Extract clauses with page/section source references and governance review status.",
    reviewBoundary: "Contract intelligence supports legal and operational review; it is not legal advice."
  },
  {
    family: "referrals",
    status: "synthetic-ready",
    layoutUnderstanding: ["referral source", "requested specialty", "missing attachments", "routing cues"],
    extractionPolicy: "Structure referral context into review queues with missing-information detection.",
    reviewBoundary: "No autonomous referral acceptance, clinical triage replacement, or patient outreach."
  },
  {
    family: "claims",
    status: "synthetic-ready",
    layoutUnderstanding: ["claim lines", "denial codes", "payer reason text", "supporting documentation references"],
    extractionPolicy: "Structure claims context into denial-risk and reviewer queues.",
    reviewBoundary: "No final coding, billing, appeal, or reimbursement action without qualified review."
  },
  {
    family: "prior-authorizations",
    status: "synthetic-ready",
    layoutUnderstanding: ["payer policy fields", "requested service", "evidence checklist", "authorization status"],
    extractionPolicy: "Map prior authorization packets to policy evidence, missing support, and reviewer checkpoints.",
    reviewBoundary: "No payer submission, coverage guarantee, or medical-necessity determination."
  },
  {
    family: "medical-records",
    status: "production-gated",
    layoutUnderstanding: ["note sections", "medication tables", "lab tables", "problem list structure", "source provenance"],
    extractionPolicy: "Medical-record parsing requires approved tenant controls and must preserve provenance before LLM extraction.",
    reviewBoundary: "No live medical-record ingestion in current synthetic pilot mode."
  }
];

export const atlasEvidenceSources: EvidenceSource[] = [
  {
    id: "cms-interoperability-prior-auth-2024",
    title: "CMS Interoperability and Prior Authorization Final Rule",
    type: "policy",
    owner: "Centers for Medicare & Medicaid Services",
    url: "https://www.cms.gov/priorities/key-initiatives/burden-reduction/interoperability/policies-and-regulations/cms-interoperability-and-prior-authorization-final-rule-cms-0057-f",
    version: "CMS-0057-F",
    validationTimestamp: "2026-06-02T00:00:00.000Z",
    usageBoundary: "Used for interoperability and prior authorization operating-context awareness, not payer submission authority."
  },
  {
    id: "cms-access-model",
    title: "CMS ACCESS Model",
    type: "policy",
    owner: "Centers for Medicare & Medicaid Services Innovation Center",
    url: "https://www.cms.gov/priorities/innovation/innovation-models/access-model",
    version: "CMS Innovation Center public model page",
    validationTimestamp: "2026-06-02T00:00:00.000Z",
    usageBoundary: "Used for reimbursement-layer posture and outcome-reporting awareness, not reimbursement guarantees."
  },
  {
    id: "hl7-fhir-standard",
    title: "HL7 FHIR Standard",
    type: "standard",
    owner: "HL7 International",
    url: "https://hl7.org/fhir/",
    version: "FHIR standard reference",
    validationTimestamp: "2026-06-02T00:00:00.000Z",
    usageBoundary: "Used for interoperability planning and connector contract design."
  },
  {
    id: "buyer-policy-repository",
    title: "Buyer Policy and Protocol Repository",
    type: "buyer-source",
    owner: "Enterprise buyer governance owner",
    url: "tenant://knowledge/policies",
    version: "Tenant-managed",
    validationTimestamp: "2026-06-02T00:00:00.000Z",
    usageBoundary: "Requires tenant source ownership, version metadata, and TrustQA validation before use."
  },
  {
    id: "clinical-guideline-repository",
    title: "Approved Clinical Guideline Repository",
    type: "guideline",
    owner: "Clinical governance owner",
    url: "tenant://knowledge/guidelines",
    version: "Tenant-approved",
    validationTimestamp: "2026-06-02T00:00:00.000Z",
    usageBoundary: "Guideline-backed outputs remain review-only and require licensed clinician review."
  }
];

export const evidenceAnswerContract: EvidenceAnswerContract[] = [
  {
    field: "answer",
    required: true,
    purpose: "Short operational answer or recommendation framed for human review."
  },
  {
    field: "citations",
    required: true,
    purpose: "Source IDs, titles, URLs, and relevant evidence snippets or section references."
  },
  {
    field: "confidenceScore",
    required: true,
    purpose: "Numerical confidence score with explanation of uncertainty and missing evidence."
  },
  {
    field: "sourceAttribution",
    required: true,
    purpose: "Named source owner, version, validation timestamp, and scope boundary."
  },
  {
    field: "validationTimestamp",
    required: true,
    purpose: "Timestamp for when source freshness and TrustQA checks were last evaluated."
  },
  {
    field: "humanReviewRequirement",
    required: true,
    purpose: "Reviewer role and checkpoint required before any external, clinical, payer, or patient-facing action."
  }
];

export const atlasTrustCards: TrustCard[] = [
  {
    slug: "prior-authorization-support",
    recommendation: "Prepare a reviewable prior authorization packet with policy citation and missing-evidence checklist.",
    workflow: "Prior authorization support",
    confidence: 0.78,
    sourceIds: ["cms-interoperability-prior-auth-2024", "buyer-policy-repository"],
    sourceAttribution: "CMS policy awareness plus buyer policy repository when configured.",
    guidelineVersion: "Policy-specific; tenant validation required.",
    validationStatus: "synthetic-only",
    lastUpdated: "2026-06-02T00:00:00.000Z",
    humanReview: "RCM or payer operations reviewer approval required before any payer-facing action."
  },
  {
    slug: "documentation-quality-review",
    recommendation: "Generate draft-only documentation review prompts with source trace and clinician review requirement.",
    workflow: "Ambient documentation review",
    confidence: 0.74,
    sourceIds: ["clinical-guideline-repository", "buyer-policy-repository"],
    sourceAttribution: "Tenant-approved clinical and documentation policies when configured.",
    guidelineVersion: "Tenant-approved guideline version required.",
    validationStatus: "needs-review",
    lastUpdated: "2026-06-02T00:00:00.000Z",
    humanReview: "Licensed clinician review required before note finalization or EHR filing."
  },
  {
    slug: "access-monitoring-readiness",
    recommendation: "Assess chronic-care, telehealth, wearable, and outcome-reporting readiness without reimbursement claims.",
    workflow: "ACCESS-aligned monitoring assessment",
    confidence: 0.68,
    sourceIds: ["cms-access-model", "hl7-fhir-standard", "buyer-policy-repository"],
    sourceAttribution: "CMS model awareness, interoperability standards, and buyer policy repository.",
    guidelineVersion: "CMS public model page plus tenant policy version.",
    validationStatus: "needs-review",
    lastUpdated: "2026-06-02T00:00:00.000Z",
    humanReview: "Clinical, compliance, finance, and executive review required before reimbursement program use."
  }
];

export const continuousValidationMetrics: ContinuousValidationMetric[] = [
  {
    metric: "Denial reduction",
    route: "/observability#denials",
    measurement: "Compare denied or at-risk prior authorization and claims queues before and after pilot workflow review.",
    pilotUse: "Synthetic and buyer-approved baseline measurement only.",
    productionGate: "Requires payer workflow controls, audit persistence, reviewer disposition, and approved financial methodology."
  },
  {
    metric: "Time saved",
    route: "/observability#time-saved",
    measurement: "Track manual minutes avoided across intake, review, missing-evidence detection, and packet drafting.",
    pilotUse: "Measured as an operational workflow metric, not a clinical outcome claim.",
    productionGate: "Requires buyer baseline, reviewer calibration, and workflow-volume normalization."
  },
  {
    metric: "Revenue impact",
    route: "/observability#revenue-impact",
    measurement: "Surface potential leakage from documentation gaps, denial risk, and unworked queues.",
    pilotUse: "Opportunity sizing only until buyer finance validates.",
    productionGate: "Requires finance-approved methodology and no unsupported reimbursement claims."
  },
  {
    metric: "Escalation rate",
    route: "/observability#escalations",
    measurement: "Track how often outputs require clinical, RCM, governance, or security escalation.",
    pilotUse: "Measures workflow ambiguity and safety friction.",
    productionGate: "Requires threshold policy and accountable escalation owners."
  },
  {
    metric: "Override rate",
    route: "/observability#overrides",
    measurement: "Track human modifications, rejections, and accepted recommendations by workflow and agent.",
    pilotUse: "Used to tune workflow scope and trust thresholds.",
    productionGate: "Requires reviewer identity, disposition taxonomy, and model/workflow drift monitoring."
  },
  {
    metric: "Trust metrics",
    route: "/observability#trust",
    measurement: "Measure citation completeness, confidence distribution, source freshness, and TrustQA release blocks.",
    pilotUse: "Evaluates readiness of evidence-backed reasoning.",
    productionGate: "Requires source governance, source retirement policy, and monitored trust-card freshness."
  }
];

export const aiAssetRegistry: AiAsset[] = [
  {
    id: "asset-agentos-planner",
    asset: "Planner Agent",
    owner: "AgentOS control plane",
    type: "agent",
    status: "registered",
    shadowAiSignals: ["unregistered planner prompt", "workflow plan generated outside audit trail"],
    auditEvents: ["asset registered", "prompt version attached", "approval checkpoint mapped"]
  },
  {
    id: "asset-atlas-evidence-layer",
    asset: "Atlas Evidence Layer",
    owner: "Atlas Trust Systems Stack",
    type: "knowledge-source",
    status: "registered",
    shadowAiSignals: ["uncited source used", "stale policy source", "tenant document missing owner"],
    auditEvents: ["source registered", "source validated", "source retired"]
  },
  {
    id: "asset-prior-auth-workflow",
    asset: "Prior Authorization Support Workflow",
    owner: "PayerIQ",
    type: "workflow",
    status: "requires-review",
    shadowAiSignals: ["payer packet drafted outside approved sandbox", "policy version missing", "manual submission unlogged"],
    auditEvents: ["workflow registered", "policy evidence checked", "RCM approval requested"]
  },
  {
    id: "asset-mcp-connector-framework",
    asset: "MCP Connector Framework",
    owner: "Interoperability Agent",
    type: "connector",
    status: "planned",
    shadowAiSignals: ["unregistered API token", "unapproved connector endpoint", "missing BAA control"],
    auditEvents: ["connector proposed", "risk reviewed", "tenant scope approved"]
  }
];

export const reimbursementLayer: ReimbursementCapability[] = [
  {
    capability: "ACCESS-aligned chronic care monitoring readiness",
    status: "production-gated",
    supportedSignals: ["care-plan adherence", "remote monitoring review", "escalation queue", "outcome reporting"],
    evidenceNeeds: ["CMS program policy", "tenant clinical protocol", "reviewer disposition", "patient consent model"],
    boundary:
      "Supports readiness assessment and outcome-reporting design only; no reimbursement claim or care-management billing guarantee."
  },
  {
    capability: "Telehealth workflow intelligence",
    status: "synthetic-ready",
    supportedSignals: ["visit modality", "follow-up need", "access bottleneck", "documentation completeness"],
    evidenceNeeds: ["tenant telehealth protocol", "state/regional policy review", "documentation policy"],
    boundary: "No autonomous scheduling, patient instruction, billing, or clinical triage."
  },
  {
    capability: "Wearable integration planning",
    status: "production-gated",
    supportedSignals: ["device signal availability", "review thresholds", "escalation policy", "outcome trend"],
    evidenceNeeds: ["device data agreement", "consent model", "clinical protocol", "alert fatigue policy"],
    boundary: "No live device monitoring or emergency-response automation in v1."
  },
  {
    capability: "Outcome reporting layer",
    status: "synthetic-ready",
    supportedSignals: ["time saved", "denial risk surfaced", "access bottleneck", "override rate", "trust completeness"],
    evidenceNeeds: ["baseline method", "buyer-approved metric definitions", "audit trace", "validation timestamp"],
    boundary: "Reports operational pilot outcomes; clinical and financial claims require buyer validation."
  }
];

export const atlasSubsystems: AtlasSubsystem[] = [
  {
    name: "Structural Intelligence Engine",
    status: "synthetic-ready",
    route: "/atlas#structural-intelligence",
    purpose: "Document layout understanding before LLM extraction across forms, tables, contracts, referrals, claims, prior authorizations, and gated medical records.",
    controls: ["layout-first parsing", "source provenance", "field-level review", "no live PHI in synthetic pilots"]
  },
  {
    name: "Atlas Evidence Layer",
    status: "foundation-online",
    route: "/atlas#evidence",
    purpose: "Evidence retrieval from guidelines, protocols, publications, policies, standards, and buyer knowledge sources.",
    controls: ["citations", "confidence score", "source attribution", "validation timestamp"]
  },
  {
    name: "Trust Card System",
    status: "synthetic-ready",
    route: "/trust#trust-cards",
    purpose: "Attach provenance, confidence, source version, validation state, and human-review requirement to recommendations.",
    controls: ["source IDs", "confidence", "guideline version", "last updated", "review gate"]
  },
  {
    name: "Agent Sandbox Runtime",
    status: "synthetic-ready",
    route: "/workflows#sandbox-runtime",
    purpose: "Isolated agent environments with memory, files, tools, audit logs, and workflow-specific boundaries.",
    controls: ["per-task sandbox", "scoped memory", "tool allowlist", "audit log", "blocked live execution"]
  },
  {
    name: "Continuous Validation Engine",
    status: "foundation-online",
    route: "/observability#continuous-validation",
    purpose: "Measure workflow outcomes instead of generic benchmark scores.",
    controls: ["denial reduction", "time saved", "revenue impact", "escalation rate", "override rate", "trust metrics"]
  },
  {
    name: "Governance Layer",
    status: "foundation-online",
    route: "/audit#governance",
    purpose: "AI Asset Registry, shadow AI detection, model/prompt/source inventory, connector tracking, and audit trails.",
    controls: ["asset registry", "shadow AI signals", "complete audit trail", "exception review"]
  },
  {
    name: "Reimbursement Layer",
    status: "production-gated",
    route: "/atlas#reimbursement",
    purpose: "CMS ACCESS-aware chronic care monitoring, telehealth, wearable integration, and outcome reporting readiness.",
    controls: ["policy evidence", "reviewer approval", "consent model", "no reimbursement guarantee"]
  }
];

export function getAtlasIntelligenceCoreSummary() {
  return {
    service: "scrimed-atlas-intelligence-core-v1",
    route: "/atlas",
    apiRoute: "/api/atlas/intelligence-core",
    status: "continuous-validation-operating-layer",
    boundary: atlasCoreBoundary,
    subsystems: atlasSubsystems,
    structuralIntelligenceEngine,
    atlasEvidenceLayer: {
      sources: atlasEvidenceSources,
      answerContract: evidenceAnswerContract
    },
    trustCards: atlasTrustCards,
    agentSandboxRuntime: sandboxRuntimes,
    specialistServices: specialistServiceRegistry,
    continuousValidationMetrics,
    governanceLayer: {
      aiAssetRegistry,
      shadowAiDetection:
        "Detect unregistered tools, models, prompts, integrations, data sources, and manual workflows that bypass approved audit paths.",
      auditTrail:
        "Every registered asset, source, connector, workflow, exception, and approval must produce an auditable event."
    },
    reimbursementLayer,
    interoperabilityContracts: integrationContracts,
    updated: "2026-06-02"
  };
}
