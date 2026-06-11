import { createHash } from "node:crypto";
import { atlasEvidenceSources, type EvidenceSource } from "./atlasIntelligenceCore";
import type { ExecutionMode } from "./agentOS";

export type TrustDecision = "allow-synthetic" | "escalate-human-review" | "deny";
export type TrustControlStatus = "pass" | "review" | "block";
export type DataClassification =
  | "synthetic"
  | "business-confidential"
  | "live-healthcare-data"
  | "unknown";
export type ActionRisk = "low" | "moderate" | "high" | "prohibited";
export type ModelRouteProfile =
  | "balanced-enterprise"
  | "evidence-reasoning"
  | "low-latency-operations"
  | "sovereign-local";

export type TrustOSRequest = {
  mode: ExecutionMode;
  workflow: string;
  objective: string;
  requestedAction: string;
  dataClassification: DataClassification;
  actionRisk: ActionRisk;
  requestedTools: string[];
  requestedModelProfile: ModelRouteProfile;
  evidenceSourceIds: string[];
  humanReviewRole: string;
  dataBoundaryAcknowledged: boolean;
  context?: string;
};

export type TrustControlResult = {
  control: string;
  component: string;
  status: TrustControlStatus;
  reason: string;
  requiredAction: string;
};

export type ModelRouteDecision = {
  requestedProfile: ModelRouteProfile;
  selectedRoute: string;
  fallbackRoute: string;
  status: "evaluation-route-selected" | "production-route-denied";
  scores: {
    taskSuitability: number;
    latency: number;
    costEfficiency: number;
    complianceReadiness: number;
  };
  rationale: string;
  productionGate: string;
};

export type ClinicalTrace = {
  traceId: string;
  requestFingerprint: string;
  createdAt: string;
  decision: TrustDecision;
  policyEvents: string[];
  plannedToolCalls: string[];
  evidenceReferences: string[];
  approvalCheckpoints: string[];
  confidence: number;
  uncertainty: number;
  outcomeLearningHooks: string[];
  captureBoundary: string;
};

export type TrustOSDecisionRecord = {
  decisionId: string;
  decision: TrustDecision;
  confidence: number;
  uncertainty: number;
  summary: string;
  controls: TrustControlResult[];
  modelRoute: ModelRouteDecision;
  evidence: EvidenceSource[];
  escalationReasons: string[];
  deniedReasons: string[];
  clinicalTrace: ClinicalTrace;
  boundary: string;
};

export type TrustOSValidationResult =
  | { valid: true; request: TrustOSRequest }
  | { valid: false; errors: string[] };

export const trustOSBoundary =
  "SCRIMED TrustOS evaluates synthetic pilot and enterprise assessment requests only. It does not authorize live PHI processing, autonomous diagnosis or treatment, patient outreach, payer submission, production connector writes, or unreviewed clinical action.";

export const trustOSComponents = [
  {
    name: "Clinical Guardian",
    purpose: "Escalates clinical, patient-facing, payer-facing, and high-uncertainty actions to accountable human reviewers."
  },
  {
    name: "Agent Firewall",
    purpose: "Blocks prohibited tools, production writes, prompt-boundary overrides, and unsafe agent actions."
  },
  {
    name: "PHI Shield",
    purpose: "Rejects live healthcare data, patient identifiers, and clinical free text from synthetic evaluation paths."
  },
  {
    name: "Policy Engine",
    purpose: "Applies execution mode, action-risk, evidence, human-review, and data-boundary policy."
  },
  {
    name: "Explainability Engine",
    purpose: "Produces control-level reasons, uncertainty, evidence attribution, and required next actions."
  },
  {
    name: "Audit Engine",
    purpose: "Creates metadata-only Clinical Trace records without retaining raw request context."
  },
  {
    name: "Compliance Monitoring",
    purpose: "Keeps production use gated behind tenant, privacy, security, BAA, connector, and regional controls."
  },
  {
    name: "Agent Registry",
    purpose: "Requires governed agent, tool, model-profile, workflow, and evidence-source registration."
  }
] as const;

export const modelRouteProfiles = [
  {
    profile: "balanced-enterprise" as const,
    selectedRoute: "vendor-neutral balanced reasoning route",
    fallbackRoute: "sovereign/local evaluation route",
    scores: { taskSuitability: 86, latency: 82, costEfficiency: 80, complianceReadiness: 68 },
    rationale: "Balances workflow reasoning, latency, and evaluation cost for general enterprise assessments."
  },
  {
    profile: "evidence-reasoning" as const,
    selectedRoute: "vendor-neutral evidence-intensive reasoning route",
    fallbackRoute: "balanced enterprise evaluation route",
    scores: { taskSuitability: 94, latency: 66, costEfficiency: 62, complianceReadiness: 70 },
    rationale: "Prioritizes evidence synthesis, uncertainty handling, and complex policy reasoning."
  },
  {
    profile: "low-latency-operations" as const,
    selectedRoute: "vendor-neutral low-latency operations route",
    fallbackRoute: "balanced enterprise evaluation route",
    scores: { taskSuitability: 78, latency: 95, costEfficiency: 88, complianceReadiness: 64 },
    rationale: "Prioritizes fast operational classification and routing for low-risk synthetic tasks."
  },
  {
    profile: "sovereign-local" as const,
    selectedRoute: "sovereign/local model evaluation route",
    fallbackRoute: "approved regional managed-model route",
    scores: { taskSuitability: 72, latency: 74, costEfficiency: 76, complianceReadiness: 84 },
    rationale: "Prioritizes regional control and future sovereign-cloud deployment requirements."
  }
];

export const trustOSScenarios: Array<{
  slug: string;
  name: string;
  workflow: string;
  objective: string;
  requestedAction: string;
  actionRisk: ActionRisk;
  requestedTools: string[];
  requestedModelProfile: ModelRouteProfile;
  evidenceSourceIds: string[];
  humanReviewRole: string;
}> = [
  {
    slug: "prior-authorization-support",
    name: "Prior Authorization Evidence Review",
    workflow: "Prior authorization support",
    objective: "Prepare a synthetic evidence-gap and policy-review packet for an RCM reviewer.",
    requestedAction: "Draft a review-only missing-evidence checklist and policy trace.",
    actionRisk: "moderate",
    requestedTools: ["evidence-retrieval", "document-parser", "workflow-planner"],
    requestedModelProfile: "evidence-reasoning",
    evidenceSourceIds: ["cms-interoperability-prior-auth-2024", "buyer-policy-repository"],
    humanReviewRole: "RCM reviewer"
  },
  {
    slug: "documentation-review",
    name: "Documentation Quality Review",
    workflow: "Ambient documentation review",
    objective: "Create draft-only documentation quality prompts from a synthetic packet.",
    requestedAction: "Draft review prompts with source trace and missing-context flags.",
    actionRisk: "moderate",
    requestedTools: ["document-parser", "evidence-retrieval"],
    requestedModelProfile: "balanced-enterprise",
    evidenceSourceIds: ["clinical-guideline-repository", "buyer-policy-repository"],
    humanReviewRole: "Licensed clinician reviewer"
  },
  {
    slug: "production-boundary-test",
    name: "Production Boundary Test",
    workflow: "Production clinical action request",
    objective: "Demonstrate that TrustOS blocks an unsafe live execution request.",
    requestedAction: "Write a final clinical recommendation to a production record.",
    actionRisk: "prohibited",
    requestedTools: ["connector-write"],
    requestedModelProfile: "evidence-reasoning",
    evidenceSourceIds: [],
    humanReviewRole: ""
  }
];

const allowedModes: ExecutionMode[] = ["synthetic-pilot", "enterprise-assessment", "production-request"];
const allowedDataClassifications: DataClassification[] = [
  "synthetic",
  "business-confidential",
  "live-healthcare-data",
  "unknown"
];
const allowedRisks: ActionRisk[] = ["low", "moderate", "high", "prohibited"];
const allowedModelProfiles = modelRouteProfiles.map((profile) => profile.profile);
const prohibitedTools = new Set([
  "connector-write",
  "patient-outreach",
  "payer-submission",
  "order-entry",
  "record-finalization"
]);
const registeredTools = new Set([
  "evidence-retrieval",
  "document-parser",
  "workflow-planner",
  "connector-read",
  ...prohibitedTools
]);
const restrictedDataPatterns = [
  /\b(ssn|social security)\b/i,
  /\b(mrn|medical record number)\b/i,
  /\b(date of birth|dob)\b/i,
  /\b(patient name|patient identifier|member id|insurance id|policy number)\b/i,
  /\b(live chart|clinical record|progress note|lab result)\b/i,
  /\b(production patient|real patient|actual patient)\b/i
];
const clinicalActionPatterns = [
  /\bdiagnos(?:e|is|tic)\b/i,
  /\btreat(?:ment)?\b/i,
  /\bprescrib(?:e|ing)\b/i,
  /\border entry\b/i,
  /\bfinal clinical recommendation\b/i
];

function safeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function safeStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
    : [];
}

function includesPattern(value: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(value));
}

function control(
  component: string,
  status: TrustControlStatus,
  reason: string,
  requiredAction: string
): TrustControlResult {
  return { control: component.toLowerCase().replaceAll(" ", "-"), component, status, reason, requiredAction };
}

function routeModel(request: TrustOSRequest, productionDenied: boolean): ModelRouteDecision {
  const profile =
    modelRouteProfiles.find((candidate) => candidate.profile === request.requestedModelProfile) ??
    modelRouteProfiles[0]!;

  return {
    requestedProfile: profile.profile,
    selectedRoute: productionDenied ? "no model execution route" : profile.selectedRoute,
    fallbackRoute: productionDenied ? "no fallback execution route" : profile.fallbackRoute,
    status: productionDenied ? "production-route-denied" : "evaluation-route-selected",
    scores: profile.scores,
    rationale: productionDenied
      ? "TrustOS denied model execution because the request crossed the current product boundary."
      : profile.rationale,
    productionGate:
      "Production model routing requires approved vendor and model registry entries, BAA and data-processing terms, regional controls, tenant policy, monitoring, and rollback approval."
  };
}

export function validateTrustOSPayload(payload: unknown): TrustOSValidationResult {
  if (!payload || typeof payload !== "object") {
    return { valid: false, errors: ["Payload must be a JSON object."] };
  }

  const body = payload as Record<string, unknown>;
  const mode = safeString(body.mode) as ExecutionMode;
  const workflow = safeString(body.workflow);
  const objective = safeString(body.objective);
  const requestedAction = safeString(body.requestedAction);
  const dataClassification = safeString(body.dataClassification) as DataClassification;
  const actionRisk = safeString(body.actionRisk) as ActionRisk;
  const requestedTools = safeStringArray(body.requestedTools);
  const requestedModelProfile = safeString(body.requestedModelProfile) as ModelRouteProfile;
  const evidenceSourceIds = safeStringArray(body.evidenceSourceIds);
  const humanReviewRole = safeString(body.humanReviewRole);
  const context = safeString(body.context);
  const dataBoundaryAcknowledged = body.dataBoundaryAcknowledged === true;
  const errors: string[] = [];

  if (!allowedModes.includes(mode)) errors.push("mode must be a supported TrustOS execution mode.");
  if (workflow.length < 3) errors.push("workflow is required.");
  if (objective.length < 12) errors.push("objective must describe the workflow-level goal.");
  if (requestedAction.length < 12) errors.push("requestedAction must describe the requested workflow action.");
  if (!allowedDataClassifications.includes(dataClassification)) errors.push("dataClassification is invalid.");
  if (!allowedRisks.includes(actionRisk)) errors.push("actionRisk is invalid.");
  if (!allowedModelProfiles.includes(requestedModelProfile)) errors.push("requestedModelProfile is invalid.");
  if (!dataBoundaryAcknowledged) errors.push("dataBoundaryAcknowledged must be true.");
  if (context.length > 2400) errors.push("context must stay under 2400 characters.");

  return {
    valid: errors.length === 0,
    errors,
    ...(errors.length === 0
      ? {
          request: {
            mode,
            workflow,
            objective,
            requestedAction,
            dataClassification,
            actionRisk,
            requestedTools,
            requestedModelProfile,
            evidenceSourceIds,
            humanReviewRole,
            dataBoundaryAcknowledged,
            context
          }
        }
      : {})
  } as TrustOSValidationResult;
}

export function evaluateTrustOSRequest(request: TrustOSRequest): TrustOSDecisionRecord {
  const requestText = [
    request.workflow,
    request.objective,
    request.requestedAction,
    request.context ?? ""
  ].join(" ");
  const containsRestrictedData = includesPattern(requestText, restrictedDataPatterns);
  const containsClinicalAction = includesPattern(request.requestedAction, clinicalActionPatterns);
  const hasProhibitedTool = request.requestedTools.some((tool) => prohibitedTools.has(tool));
  const hasUnregisteredTool = request.requestedTools.some((tool) => !registeredTools.has(tool));
  const evidence = atlasEvidenceSources.filter((source) => request.evidenceSourceIds.includes(source.id));
  const evidenceComplete =
    request.evidenceSourceIds.length > 0 && evidence.length === request.evidenceSourceIds.length;
  const deniedReasons: string[] = [];
  const escalationReasons: string[] = [];

  if (request.mode === "production-request") deniedReasons.push("Production execution is not enabled.");
  if (request.dataClassification === "live-healthcare-data") deniedReasons.push("Live healthcare data is prohibited in the current TrustOS evaluation path.");
  if (containsRestrictedData) deniedReasons.push("PHI Shield detected restricted patient or healthcare-data language.");
  if (request.actionRisk === "prohibited") deniedReasons.push("The requested action is classified as prohibited.");
  if (hasProhibitedTool) deniedReasons.push("Agent Firewall detected a prohibited production or external-action tool.");
  if (containsClinicalAction) deniedReasons.push("Clinical Guardian detected a diagnosis, treatment, prescribing, order-entry, or final clinical action.");

  if (request.dataClassification === "unknown") escalationReasons.push("Data classification must be resolved.");
  if (request.actionRisk === "high") escalationReasons.push("High-risk actions require governance and accountable reviewer approval.");
  if (!request.humanReviewRole) escalationReasons.push("A named human-review role is required.");
  if (!evidenceComplete) escalationReasons.push("Evidence sources are missing, unregistered, or incomplete.");
  if (hasUnregisteredTool) escalationReasons.push("One or more requested tools are not registered.");
  if (request.dataClassification === "business-confidential") escalationReasons.push("Business-confidential data requires tenant policy review.");

  const decision: TrustDecision =
    deniedReasons.length > 0
      ? "deny"
      : escalationReasons.length > 0
        ? "escalate-human-review"
        : "allow-synthetic";

  const controls: TrustControlResult[] = [
    control(
      "PHI Shield",
      containsRestrictedData || request.dataClassification === "live-healthcare-data" ? "block" : request.dataClassification === "unknown" ? "review" : "pass",
      containsRestrictedData
        ? "Restricted patient or healthcare-data language was detected."
        : `Data classification is ${request.dataClassification}.`,
      containsRestrictedData || request.dataClassification === "live-healthcare-data"
        ? "Remove live or restricted healthcare data and use a synthetic workflow description."
        : "Maintain the declared data boundary."
    ),
    control(
      "Agent Firewall",
      hasProhibitedTool ? "block" : "pass",
      hasProhibitedTool ? "A prohibited external-action or production-write tool was requested." : "Requested tools stay inside the evaluation allowlist.",
      hasProhibitedTool ? "Remove production-write, patient-outreach, payer-submission, order-entry, or record-finalization tools." : "Retain tool allowlist and sandbox isolation."
    ),
    control(
      "Clinical Guardian",
      containsClinicalAction || request.actionRisk === "prohibited" ? "block" : request.actionRisk === "high" ? "review" : "pass",
      containsClinicalAction ? "A final clinical action was detected." : `Action risk is ${request.actionRisk}.`,
      request.actionRisk === "low" || request.actionRisk === "moderate" ? "Keep the output review-only." : "Route to clinical and governance review."
    ),
    control(
      "Policy Engine",
      request.mode === "production-request" ? "block" : request.dataBoundaryAcknowledged ? "pass" : "block",
      request.mode === "production-request" ? "Production execution is outside the active product boundary." : "The synthetic/evaluation boundary was acknowledged.",
      request.mode === "production-request" ? "Use synthetic-pilot or enterprise-assessment mode." : "Preserve the execution-mode boundary."
    ),
    control(
      "Agent Registry",
      hasProhibitedTool ? "block" : hasUnregisteredTool || request.requestedTools.length === 0 ? "review" : "pass",
      hasProhibitedTool
        ? "A prohibited production or external-action tool was requested."
        : hasUnregisteredTool
        ? "An unregistered tool was requested."
        : request.requestedTools.length > 0
          ? `${request.requestedTools.length} scoped ${request.requestedTools.length === 1 ? "tool was" : "tools were"} declared.`
          : "No tools were declared.",
      "Register every agent, tool, model profile, workflow, and connector before use."
    ),
    control(
      "Explainability Engine",
      evidenceComplete ? "pass" : "review",
      evidenceComplete ? `${evidence.length} registered evidence sources were attributed.` : "Evidence attribution is incomplete.",
      evidenceComplete ? "Retain citations, confidence, uncertainty, and validation timestamps." : "Attach registered evidence before release."
    ),
    control(
      "Audit Engine",
      "pass",
      "A metadata-only Clinical Trace was generated without retaining raw request context.",
      "Persist only approved trace metadata under tenant retention policy."
    ),
    control(
      "Compliance Monitoring",
      request.mode === "production-request" || request.dataClassification === "live-healthcare-data" ? "block" : request.dataClassification === "business-confidential" ? "review" : "pass",
      "Current TrustOS posture is synthetic pilot and enterprise assessment only.",
      "Complete tenant, privacy, security, BAA, connector, regional, and human operating controls before production use."
    )
  ];

  const penalties =
    deniedReasons.length * 18 +
    escalationReasons.length * 8 +
    (evidenceComplete ? 0 : 8) +
    (request.actionRisk === "moderate" ? 3 : request.actionRisk === "high" ? 12 : 0);
  const confidence = Math.max(18, Math.min(96, 92 - penalties));
  const uncertainty = 100 - confidence;
  const now = new Date().toISOString();
  const requestFingerprint = createHash("sha256")
    .update(JSON.stringify({
      mode: request.mode,
      workflow: request.workflow,
      requestedAction: request.requestedAction,
      dataClassification: request.dataClassification,
      actionRisk: request.actionRisk,
      requestedTools: request.requestedTools,
      requestedModelProfile: request.requestedModelProfile,
      evidenceSourceIds: request.evidenceSourceIds,
      humanReviewRole: request.humanReviewRole
    }))
    .digest("hex");
  const traceId = `SCRIMED-TRACE-${requestFingerprint.slice(0, 16).toUpperCase()}`;

  return {
    decisionId: `SCRIMED-TRUST-${requestFingerprint.slice(0, 12).toUpperCase()}`,
    decision,
    confidence,
    uncertainty,
    summary:
      decision === "allow-synthetic"
        ? "TrustOS allows this bounded synthetic evaluation with retained human review and trace controls."
        : decision === "escalate-human-review"
          ? "TrustOS holds this request for accountable human and governance review."
          : "TrustOS denies this request because it crosses the current product, data, tool, or clinical-action boundary.",
    controls,
    modelRoute: routeModel(request, decision === "deny"),
    evidence,
    escalationReasons,
    deniedReasons,
    clinicalTrace: {
      traceId,
      requestFingerprint,
      createdAt: now,
      decision,
      policyEvents: controls.map((item) => `${item.component}: ${item.status}`),
      plannedToolCalls: decision === "deny" ? [] : request.requestedTools,
      evidenceReferences: evidence.map((source) => source.id),
      approvalCheckpoints: request.humanReviewRole
        ? [request.humanReviewRole, "TrustQA Verification Agent", "Governance Agent"]
        : ["TrustQA Verification Agent", "Governance Agent"],
      confidence,
      uncertainty,
      outcomeLearningHooks: [
        "reviewer disposition",
        "override reason",
        "escalation category",
        "evidence-gap category",
        "workflow outcome signal"
      ],
      captureBoundary:
        "Metadata-only trace. Raw request context, PHI, patient identifiers, clinical free text, secrets, and connector payloads are not retained."
    },
    boundary: trustOSBoundary
  };
}

export function getTrustOSSummary() {
  return {
    service: "scrimed-trustos-v1",
    route: "/trust-os",
    apiRoute: "/api/trust-os",
    evaluationApiRoute: "/api/trust-os/evaluate",
    status: "executable-synthetic-governance-ready",
    boundary: trustOSBoundary,
    components: trustOSComponents,
    modelRouteProfiles,
    scenarios: trustOSScenarios,
    evidenceSources: atlasEvidenceSources,
    decisionStates: ["allow-synthetic", "escalate-human-review", "deny"] as TrustDecision[],
    updated: "2026-06-11"
  };
}
