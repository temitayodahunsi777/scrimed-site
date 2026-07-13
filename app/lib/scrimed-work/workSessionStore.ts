import { buildApprovalCheckpoint } from "./approvalEngine";
import { createAuditHash, nowIso } from "./audit";
import { buildScrimedWorkArtifact } from "./artifactEngine";
import { searchScrimedWorkContext } from "./contextEngine";
import { routeScrimedWorkModel } from "./modelRouter";
import { buildAgentPlan, buildToolCallPlan } from "./orchestrationEngine";
import { scoreAutonomy } from "./autonomyPolicy";
import { buildScrimedWorkSessionId } from "./sessionIdentifier";
import { applyWorkSessionTransition, type WorkSessionTransitionDecision } from "./sessionLifecycle";
import { calculateValueTelemetry } from "./valueTelemetry";
import type {
  DefinitionOfDoneContract,
  EvidenceRecord,
  WorkSession
} from "./types";

const defaultDefinitionOfDone: DefinitionOfDoneContract = {
  goal: "Prepare a verified synthetic care coordination brief with citations and human review.",
  allowedScope: ["synthetic context retrieval", "draft artifact generation", "human review queue"],
  prohibitedActions: ["live PHI", "diagnosis", "treatment", "prescribing", "patient outreach", "payer submission", "EHR writeback"],
  requiredEvidence: ["care coordination SOP", "FHIR preview boundary"],
  successCriteria: ["evidence", "boundaries", "human review"],
  stoppingConditions: ["PHI detected", "missing citations", "policy denial", "loop detected"],
  timeoutMs: 300_000,
  maximumSteps: 8,
  maximumToolCalls: 10,
  maximumEstimatedCostUsd: 0.1,
  humanApprovalRequired: true,
  rollbackPlan: "Cancel draft, preserve audit metadata, and retain no external distribution.",
  verificationChecks: ["schema validity", "citation presence", "PHI leakage", "policy compliance", "human approval state"]
};

function buildEvidence(sessionId: string): EvidenceRecord[] {
  const context = searchScrimedWorkContext({
    query: "care coordination FHIR preview human review",
    tenant: "synthetic-tenant",
    limit: 3
  });

  return context.records.map((record) => ({
    evidenceId: `evidence_${record.sourceId}`,
    sourceId: record.sourceId,
    title: record.title,
    citation: record.citation,
    trustTier: record.trustTier,
    supports: "Definition of Done evidence requirement",
    dataClassification: record.dataClassification,
    auditHash: createAuditHash({ sessionId, sourceId: record.sourceId, citation: record.citation })
  }));
}

export function buildSyntheticWorkSession(input?: Partial<WorkSession>): WorkSession {
  const id = input?.id ?? "work_session_care_coordination_synthetic";
  const definitionOfDone = input?.definitionOfDone ?? defaultDefinitionOfDone;
  const model = routeScrimedWorkModel({
    taskType: definitionOfDone.goal,
    risk: input?.riskLevel ?? "high",
    requiredCapability: "reasoning",
    dataClassification: input?.inputClassification ?? "synthetic-no-phi",
    latencyTargetMs: 5_000,
    budgetUsd: definitionOfDone.maximumEstimatedCostUsd,
    tenantPolicy: definitionOfDone.allowedScope.join(" "),
    reasoningRequirement: "high",
    qualityThreshold: 0.9
  });
  const autonomy = scoreAutonomy({
    riskLevel: input?.riskLevel ?? "high",
    requestedAutonomy: input?.requestedAutonomy ?? "prepare",
    definitionOfDone,
    observability: 90,
    testability: 85,
    reversibility: 80,
    evidenceQuality: 82,
    blastRadius: 70,
    privacySensitivity: 60,
    clinicalConsequence: 75,
    financialConsequence: 40,
    providerReliability: 70
  });
  const baseSession: WorkSession = {
    id,
    tenantId: input?.tenantId ?? "synthetic-tenant",
    organizationScope: input?.organizationScope ?? "synthetic-health-system",
    workspaceDomain: input?.workspaceDomain ?? "clinical",
    title: input?.title ?? "Synthetic Care Coordination Work Session",
    objective: input?.objective ?? definitionOfDone.goal,
    actor: input?.actor ?? {
      actorId: "synthetic-operator",
      displayName: "Synthetic Operator",
      role: "synthetic-system",
      tenantId: "synthetic-tenant"
    },
    inputClassification: input?.inputClassification ?? "synthetic-no-phi",
    riskLevel: input?.riskLevel ?? "high",
    requestedAutonomy: input?.requestedAutonomy ?? "prepare",
    approvedAutonomy: autonomy.approvedAutonomy,
    definitionOfDone,
    sourceContextReferences: ["ctx-care-coordination-sop", "ctx-fhir-preview"],
    selectedModel: model,
    plannedSteps: [],
    toolCalls: [],
    evidence: buildEvidence(id),
    approvalCheckpoints: [],
    artifacts: [],
    valueTelemetry: calculateValueTelemetry({
      sessionDurationMinutes: 18,
      steps: 5,
      toolCalls: 3,
      humanReviewMinutes: 8,
      estimatedManualMinutes: 45,
      estimatedTimeSavedMinutes: 25,
      estimatedModelCostUsd: 0,
      latencyMs: 850,
      artifactCount: 1,
      approvalCount: 1,
      contextHitRate: 0.92
    }),
    statusHistory:
      input?.statusHistory ??
      [
        {
          status: "draft",
          at: nowIso(),
          reason: "Synthetic session created with mandatory Definition of Done contract.",
          auditHash: createAuditHash({ id, status: "draft" })
        },
        {
          status: "awaiting_approval",
          at: nowIso(),
          reason: "High-risk clinical-support work requires human review before completion.",
          auditHash: createAuditHash({ id, status: "awaiting_approval" })
        }
      ],
    cancellationState: {
      cancellable: true,
      cancelledAt: null,
      cancellationReason: null,
      cancellationPropagated: false
    },
    rollbackMetadata: {
      rollbackAvailable: true,
      rollbackPlan: definitionOfDone.rollbackPlan,
      lastCheckpointId: "checkpoint_synthetic_start",
      rollbackTested: true
    },
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
  baseSession.plannedSteps = buildAgentPlan(baseSession);
  baseSession.toolCalls = buildToolCallPlan(baseSession);
  baseSession.approvalCheckpoints = [
    buildApprovalCheckpoint({
      session: baseSession,
      action: "review care coordination artifact before external or clinical-facing use",
      reason: "High-risk clinical-support artifact remains decision-support only."
    })
  ];
  baseSession.artifacts = [
    buildScrimedWorkArtifact({
      session: baseSession,
      type: "care-coordination-brief",
      title: "Synthetic Care Coordination Brief"
    })
  ];

  return baseSession;
}

const sessions = new Map<string, WorkSession>([
  ["work_session_care_coordination_synthetic", buildSyntheticWorkSession()],
  [
    "work_session_executive_board_brief",
    buildSyntheticWorkSession({
      id: "work_session_executive_board_brief",
      workspaceDomain: "executive",
      title: "Executive Board Brief Work Session",
      objective: "Prepare claims-safe board brief from verified SCRIMED Work telemetry.",
      riskLevel: "moderate",
      requestedAutonomy: "recommend",
      inputClassification: "metadata-only"
    })
  ]
]);

export function listWorkSessions() {
  return Array.from(sessions.values());
}

export function getWorkSession(sessionId: string) {
  return sessions.get(sessionId) ?? null;
}

type WorkSessionBuildInput = Partial<WorkSession> & {
  definitionOfDone: DefinitionOfDoneContract;
  idempotencySeed?: string;
};

export function createWorkSessionId(input: Pick<WorkSessionBuildInput, "title" | "definitionOfDone" | "idempotencySeed">) {
  const seed = {
    title: input.title,
    goal: input.definitionOfDone.goal,
    idempotencySeed: input.idempotencySeed ?? "deterministic-default"
  };
  return buildScrimedWorkSessionId(
    createAuditHash(seed),
    createAuditHash({ ...seed, partition: "scrimed-work-session-id-v1" })
  );
}

export function buildWorkSessionFromContract(input: WorkSessionBuildInput) {
  const sessionInput = { ...input };
  delete sessionInput.idempotencySeed;
  const id = createWorkSessionId(input);

  return buildSyntheticWorkSession({
    ...sessionInput,
    id,
    statusHistory: [
      {
        status: "draft",
        at: nowIso(),
        reason: "Protected session created with a validated Definition of Done contract.",
        auditHash: createAuditHash({ id, status: "draft", source: "protected-session-create" })
      }
    ]
  });
}

export function saveWorkSession(session: WorkSession) {
  sessions.set(session.id, session);
  return session;
}

export function createWorkSessionFromContract(input: WorkSessionBuildInput) {
  return saveWorkSession(buildWorkSessionFromContract(input));
}

export function buildTransitionedWorkSession(
  session: WorkSession,
  transition: WorkSessionTransitionDecision,
  reason: string
) {
  return applyWorkSessionTransition({ session, transition, reason, transitionedAt: nowIso() });
}

export function transitionWorkSession(
  session: WorkSession,
  transition: WorkSessionTransitionDecision,
  reason: string
) {
  const updated = buildTransitionedWorkSession(session, transition, reason);
  sessions.set(session.id, updated);
  return updated;
}
