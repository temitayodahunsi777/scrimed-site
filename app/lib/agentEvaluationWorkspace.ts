import {
  buildAgentOSTaskPlan,
  getAgentOSSummary,
  type AgentOSTaskPlan,
  type ExecutionMode,
  validateAgentOSTaskPayload
} from "./agentOS";
import {
  atlasEvidenceSources,
  atlasTrustCards,
  continuousValidationMetrics,
  structuralIntelligenceEngine,
  type DocumentFamily,
  type EvidenceSource,
  type StructuralParser,
  type TrustCard
} from "./atlasIntelligenceCore";
import {
  evaluateTrustOSRequest,
  type TrustOSDecisionRecord
} from "./trustOS";

export type EvaluationStatus = "synthetic-evaluation-created" | "production-request-denied";

export type EvaluationScenario = {
  slug: string;
  name: string;
  buyer: string;
  taskType: string;
  documentFamily: DocumentFamily;
  workflowTarget: string;
  objective: string;
  syntheticDocumentSummary: string;
  trustCardSlug: string;
  expectedBuyerValue: string;
  outcomeSignals: string[];
};

export type AgentEvaluationRequest = {
  scenarioSlug: string;
  organizationId?: string;
  requestedByRole?: string;
  mode: ExecutionMode;
  taskType?: string;
  workflowTarget?: string;
  objective?: string;
  documentFamily?: DocumentFamily;
  syntheticDocumentSummary?: string;
  dataBoundaryAcknowledged: boolean;
};

export type AgentEvaluationRecord = {
  evaluationId: string;
  status: EvaluationStatus;
  createdAt: string;
  boundary: string;
  scenario: EvaluationScenario;
  taskPlan: AgentOSTaskPlan;
  documentIntelligence: StructuralParser;
  trustCard: TrustCard;
  trustOSDecision: TrustOSDecisionRecord;
  evidenceSources: EvidenceSource[];
  observabilityRecord: {
    outcomeSignals: string[];
    metrics: string[];
    measurementBoundary: string;
  };
  auditPreview: string[];
  humanApprovals: string[];
  deniedCapabilities: string[];
  nextActions: string[];
};

export type EvaluationValidationResult =
  | {
      valid: true;
      record: AgentEvaluationRecord;
    }
  | {
      valid: false;
      errors: string[];
    };

export type AgentEvaluationWorkspaceSummary = {
  service: string;
  route: string;
  apiRoute: string;
  status: string;
  boundary: string;
  scenarios: EvaluationScenario[];
  taskTemplates: ReturnType<typeof getAgentOSSummary>["taskExecutionEngine"];
  documentFamilies: DocumentFamily[];
  trustCards: TrustCard[];
  observabilityMetrics: typeof continuousValidationMetrics;
  updated: string;
};

export const evaluationBoundary =
  "SCRIMED AgentOS Evaluation Workspace accepts synthetic document packets and workflow-scope descriptions only. It does not ingest live PHI, parse production medical records, submit payer transactions, contact patients, or execute clinical care.";

export const evaluationScenarios: EvaluationScenario[] = [
  {
    slug: "prior-auth-packet-readiness",
    name: "Prior Authorization Packet Readiness",
    buyer: "Payer operations, RCM, and access leaders",
    taskType: "prior-authorization-packet-plan",
    documentFamily: "prior-authorizations",
    workflowTarget: "Prior authorization support",
    objective:
      "Create a reviewable synthetic prior authorization packet plan with policy evidence, missing support, reviewer checkpoints, and blocked payer-facing actions.",
    syntheticDocumentSummary:
      "Synthetic prior authorization packet for a non-production orthopedic imaging request. Includes mock payer policy fields, requested service category, evidence checklist, authorization status placeholder, and missing documentation notes.",
    trustCardSlug: "prior-authorization-support",
    expectedBuyerValue:
      "Shows how SCRIMED can surface authorization friction, missing evidence, policy attribution, and review ownership before a protected pilot.",
    outcomeSignals: ["time saved", "denial risk surfaced", "revenue leakage identified", "trust completeness"]
  },
  {
    slug: "documentation-review-readiness",
    name: "Ambient Documentation Review Readiness",
    buyer: "Clinical documentation, ambulatory operations, and quality leaders",
    taskType: "documentation-review-plan",
    documentFamily: "forms",
    workflowTarget: "Ambient documentation review",
    objective:
      "Create a draft-only synthetic documentation review plan with source trace, missing-context prompts, clinician approval checkpoint, and final-signature block.",
    syntheticDocumentSummary:
      "Synthetic encounter documentation packet with mock section headings, draft note outline, source-trace placeholders, incomplete context fields, and clinician-review checklist.",
    trustCardSlug: "documentation-quality-review",
    expectedBuyerValue:
      "Shows how SCRIMED can improve documentation review quality while preserving authorship, traceability, and clinician control.",
    outcomeSignals: ["documentation quality improved", "override rate", "trust completeness", "review friction"]
  },
  {
    slug: "access-monitoring-readiness",
    name: "ACCESS-Aligned Monitoring Readiness",
    buyer: "Population health, telehealth, and chronic-care transformation leaders",
    taskType: "access-monitoring-plan",
    documentFamily: "tables",
    workflowTarget: "ACCESS-aligned monitoring assessment",
    objective:
      "Create a synthetic chronic-care monitoring readiness plan that maps telehealth, wearable, outcome-reporting, evidence, and review requirements without reimbursement claims.",
    syntheticDocumentSummary:
      "Synthetic chronic-care operations packet with mock monitoring cadence table, telehealth workflow fields, wearable signal availability, escalation thresholds, and outcome-reporting placeholders.",
    trustCardSlug: "access-monitoring-readiness",
    expectedBuyerValue:
      "Shows how SCRIMED can translate chronic-care operations into evidence-backed readiness, monitoring, and outcome-reporting design.",
    outcomeSignals: ["access bottlenecks surfaced", "time saved", "escalation rate", "trust completeness"]
  },
  {
    slug: "enterprise-workflow-assessment",
    name: "Enterprise Workflow Assessment",
    buyer: "Executives, transformation teams, and AI governance owners",
    taskType: "enterprise-workflow-assessment",
    documentFamily: "contracts",
    workflowTarget: "Enterprise healthcare workflow assessment",
    objective:
      "Create a synthetic enterprise workflow assessment plan with governance requirements, integration targets, evidence gaps, reviewer ownership, and production-readiness gates.",
    syntheticDocumentSummary:
      "Synthetic enterprise workflow packet with mock operating requirements, department queue notes, governance constraints, integration targets, and executive decision criteria.",
    trustCardSlug: "prior-authorization-support",
    expectedBuyerValue:
      "Shows how SCRIMED converts fragmented enterprise workflow context into a governed operating-system evaluation plan.",
    outcomeSignals: ["workflow friction reduced", "governance gaps surfaced", "time saved", "trust completeness"]
  }
];

const allowedDocumentFamilies: DocumentFamily[] = [
  "forms",
  "tables",
  "contracts",
  "referrals",
  "claims",
  "prior-authorizations",
  "medical-records"
];

const restrictedEvaluationPatterns = [
  /\b(ssn|social security)\b/i,
  /\b(mrn|medical record number)\b/i,
  /\b(date of birth|dob)\b/i,
  /\b(patient name|patient identifier|member id|insurance id|policy number)\b/i,
  /\b(live chart|clinical record|progress note|lab result)\b/i,
  /\b(production patient|real patient|actual patient)\b/i
];

function safeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isDocumentFamily(value: string): value is DocumentFamily {
  return allowedDocumentFamilies.includes(value as DocumentFamily);
}

function containsRestrictedEvaluationData(value: string) {
  return restrictedEvaluationPatterns.some((pattern) => pattern.test(value));
}

function resolveScenario(slug: string): EvaluationScenario {
  return evaluationScenarios.find((scenario) => scenario.slug === slug) ?? evaluationScenarios[0]!;
}

function resolveDocumentIntelligence(family: DocumentFamily): StructuralParser {
  return (
    structuralIntelligenceEngine.find((parser) => parser.family === family) ??
    structuralIntelligenceEngine[0]!
  );
}

function resolveTrustCard(slug: string): TrustCard {
  return atlasTrustCards.find((card) => card.slug === slug) ?? atlasTrustCards[0]!;
}

export function runAgentEvaluation(payload: unknown): EvaluationValidationResult {
  const errors: string[] = [];

  if (!payload || typeof payload !== "object") {
    return {
      valid: false,
      errors: ["Payload must be a JSON object."]
    };
  }

  const body = payload as Record<string, unknown>;
  const scenario = resolveScenario(safeString(body.scenarioSlug));
  const documentFamilyInput = safeString(body.documentFamily);
  const documentFamily = isDocumentFamily(documentFamilyInput)
    ? documentFamilyInput
    : scenario.documentFamily;
  const syntheticDocumentSummary = safeString(body.syntheticDocumentSummary) || scenario.syntheticDocumentSummary;
  const mode = safeString(body.mode) as ExecutionMode;
  const taskType = safeString(body.taskType) || scenario.taskType;
  const workflowTarget = safeString(body.workflowTarget) || scenario.workflowTarget;
  const objective = safeString(body.objective) || scenario.objective;
  const dataBoundaryAcknowledged = body.dataBoundaryAcknowledged === true;
  const fullPayloadText = JSON.stringify(body);

  if (syntheticDocumentSummary.length < 40) {
    errors.push("syntheticDocumentSummary must describe the synthetic packet at workflow level.");
  }

  if (syntheticDocumentSummary.length > 2400) {
    errors.push("syntheticDocumentSummary must stay under 2400 characters.");
  }

  if (documentFamily === "medical-records") {
    errors.push("medical-records documentFamily remains production-gated and cannot be used in this evaluation workspace.");
  }

  if (containsRestrictedEvaluationData(fullPayloadText)) {
    errors.push("Payload appears to include restricted health data or patient-level identifiers.");
  }

  const taskValidation = validateAgentOSTaskPayload({
    taskType,
    organizationId: safeString(body.organizationId),
    requestedByRole: safeString(body.requestedByRole),
    mode,
    workflowTarget,
    objective,
    context: syntheticDocumentSummary,
    dataBoundaryAcknowledged,
    humanApprovalRequired: true
  });

  if (!taskValidation.valid || !taskValidation.submission) {
    errors.push(...taskValidation.errors);
  }

  if (errors.length > 0 || !taskValidation.submission) {
    return {
      valid: false,
      errors
    };
  }

  const taskPlan = buildAgentOSTaskPlan(taskValidation.submission);
  const trustCard = resolveTrustCard(scenario.trustCardSlug);
  const documentIntelligence = resolveDocumentIntelligence(documentFamily);
  const evidenceSources = atlasEvidenceSources.filter((source) => trustCard.sourceIds.includes(source.id));
  const now = new Date().toISOString();
  const productionDenied = taskPlan.status === "denied-production-request";
  const trustOSDecision = evaluateTrustOSRequest({
    mode,
    workflow: workflowTarget,
    objective,
    requestedAction: productionDenied
      ? "Execute the requested workflow against a production healthcare environment."
      : "Create a review-only synthetic workflow evaluation packet.",
    dataClassification: productionDenied ? "live-healthcare-data" : "synthetic",
    actionRisk: productionDenied ? "prohibited" : "moderate",
    requestedTools: productionDenied
      ? ["connector-write"]
      : ["document-parser", "workflow-planner", "evidence-retrieval"],
    requestedModelProfile: "evidence-reasoning",
    evidenceSourceIds: trustCard.sourceIds,
    humanReviewRole: taskPlan.approvalCheckpoints[0] ?? "Governance reviewer",
    dataBoundaryAcknowledged,
    context: syntheticDocumentSummary
  });

  return {
    valid: true,
    record: {
      evaluationId: `SCRIMED-EVAL-${now.replace(/[-:.TZ]/g, "").slice(0, 14)}`,
      status: productionDenied ? "production-request-denied" : "synthetic-evaluation-created",
      createdAt: now,
      boundary: productionDenied ? taskPlan.boundary : evaluationBoundary,
      scenario: {
        ...scenario,
        documentFamily,
        taskType,
        workflowTarget,
        objective,
        syntheticDocumentSummary
      },
      taskPlan,
      documentIntelligence,
      trustCard,
      trustOSDecision,
      evidenceSources,
      observabilityRecord: {
        outcomeSignals: scenario.outcomeSignals,
        metrics: continuousValidationMetrics.map((metric) => metric.metric),
        measurementBoundary:
          "Outcome metrics are simulated pilot-planning signals until buyer baselines, reviewer dispositions, and approved methodology are configured."
      },
      auditPreview: [
        "synthetic packet received",
        "document family selected",
        "layout-first parser assigned",
        "AgentOS task plan generated",
        "Trust Card attached",
        `TrustOS decision: ${trustOSDecision.decision}`,
        productionDenied ? "production request denied" : "synthetic evaluation created"
      ],
      humanApprovals: taskPlan.approvalCheckpoints,
      deniedCapabilities: taskPlan.deniedCapabilities,
      nextActions: productionDenied
        ? [
            "Switch to synthetic-pilot or enterprise-assessment mode.",
            "Complete tenant identity, BAA, connector, durable audit, privacy, and human operating controls before production execution."
          ]
        : [
            "Review the Trust Card with the enterprise sponsor.",
            "Confirm evidence-source ownership and validation timestamps.",
            "Choose the protected pilot workflow and success metric baseline.",
            "Keep live PHI, payer submission, patient outreach, and autonomous clinical execution disabled."
          ]
    }
  };
}

export function getAgentEvaluationWorkspaceSummary(): AgentEvaluationWorkspaceSummary {
  const agentOS = getAgentOSSummary();

  return {
    service: "scrimed-agentos-evaluation-workspace",
    route: "/evaluation",
    apiRoute: "/api/agent-os/evaluation",
    status: "interactive-synthetic-evaluation-ready",
    boundary: evaluationBoundary,
    scenarios: evaluationScenarios,
    taskTemplates: agentOS.taskExecutionEngine,
    documentFamilies: allowedDocumentFamilies.filter((family) => family !== "medical-records"),
    trustCards: atlasTrustCards,
    observabilityMetrics: continuousValidationMetrics,
    updated: "2026-06-02"
  };
}
