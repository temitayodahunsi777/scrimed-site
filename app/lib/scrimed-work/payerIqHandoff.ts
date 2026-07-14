import {
  runDocumentationBeforeAuthorizationWorkbench,
  type DocumentationBeforeAuthorizationReviewPacket,
  type DocumentationBeforeAuthorizationWorkbenchRequest
} from "../documentationBeforeAuthorization";
import { createAuditHash, nowIso } from "./audit";
import { buildScrimedWorkArtifact } from "./artifactEngine";
import { buildApprovalCheckpoint } from "./approvalEngine";
import { containsPhiRisk, containsTokenLikeField } from "./schemas";
import { verifyScrimedWorkResult } from "./verificationEngine";
import { buildWorkSessionFromContract } from "./workSessionStore";
import type { ActorIdentity, EvidenceRecord, WorkArtifact, WorkSession } from "./types";

export const payerIqProtectedHandoffStatus = "payeriq-protected-handoff-aal2-review-required";
export const payerIqProtectedHandoffBoundary =
  "PayerIQ protected handoff persists registered synthetic/no-PHI documentation-readiness evidence into SCRIMED Work for independent review. It never authorizes payer submission, claim filing, external communication, EHR writeback, medical-necessity determination, reimbursement claims, production connectors, or customer go-live.";
export const payerIqProtectedHandoffAuthority = {
  externalDistributionAllowed: false,
  payerSubmissionAllowed: false
} as const;

export type PayerIqProtectedHandoffInput = DocumentationBeforeAuthorizationWorkbenchRequest & {
  workspaceSlug?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function parsePayerIqProtectedHandoffInput(
  value: unknown
):
  | { ok: true; value: PayerIqProtectedHandoffInput; packet: DocumentationBeforeAuthorizationReviewPacket }
  | { ok: false; reason: string } {
  if (!isRecord(value)) return { ok: false, reason: "PayerIQ handoff input must be an object." };

  const allowedFields = new Set([
    "workspaceSlug",
    "scenarioPacketId",
    "documentedRequirementIds",
    "reviewerStatus",
    "requestedAction",
    "dataBoundaryAcknowledged"
  ]);

  if (Object.keys(value).some((key) => !allowedFields.has(key))) {
    return { ok: false, reason: "PayerIQ handoff accepts enumerated synthetic metadata only." };
  }

  if (containsTokenLikeField(value) || containsPhiRisk(value)) {
    return { ok: false, reason: "PayerIQ handoff rejects credentials, token-like fields, PHI, and direct identifiers." };
  }

  if (value.requestedAction !== "draft_reviewer_packet") {
    return { ok: false, reason: "Protected handoff only accepts draft_reviewer_packet actions." };
  }

  if (value.reviewerStatus !== "queued") {
    return {
      ok: false,
      reason: "Protected handoff requires queued reviewer status; browser-selected review state is not approval authority."
    };
  }

  const workbenchPayload = {
    scenarioPacketId: value.scenarioPacketId,
    documentedRequirementIds: value.documentedRequirementIds,
    reviewerStatus: value.reviewerStatus,
    requestedAction: value.requestedAction,
    dataBoundaryAcknowledged: value.dataBoundaryAcknowledged
  };
  const result = runDocumentationBeforeAuthorizationWorkbench(workbenchPayload);

  if (!result.valid || result.packet.status !== "review-packet-prepared") {
    return {
      ok: false,
      reason: result.valid ? "PayerIQ handoff packet is blocked." : result.errors.join(" ")
    };
  }

  return {
    ok: true,
    value: {
      ...(workbenchPayload as DocumentationBeforeAuthorizationWorkbenchRequest),
      ...(typeof value.workspaceSlug === "string" ? { workspaceSlug: value.workspaceSlug } : {})
    },
    packet: result.packet
  };
}

function buildPayerIqEvidence(packet: DocumentationBeforeAuthorizationReviewPacket): EvidenceRecord[] {
  return packet.evidencePacket.evidenceRefs.map((reference, index) => ({
    evidenceId: `evidence_${createAuditHash({ reference, index }).slice(0, 16)}`,
    sourceId: reference,
    title: `Registered synthetic PayerIQ evidence ${index + 1}`,
    citation: reference,
    trustTier: "synthetic-fixture",
    supports: "PayerIQ documentation-readiness review packet",
    dataClassification: "synthetic-no-phi",
    auditHash: createAuditHash({ reference, packetAuditHash: packet.auditHash })
  }));
}

function buildPayerIqArtifact(session: WorkSession, packet: DocumentationBeforeAuthorizationReviewPacket) {
  const base = buildScrimedWorkArtifact({
    session,
    type: "prior-authorization-draft",
    title: `PayerIQ ${packet.procedureFamily} Review Packet`
  });
  const provisional: WorkArtifact = {
    ...base,
    content: packet.exportPacket.markdown,
    markdown: packet.exportPacket.markdown,
    json: {
      workbenchId: packet.workbenchId,
      sourcePacketId: packet.sourcePacketId,
      scenario: packet.scenario,
      procedureFamily: packet.procedureFamily,
      readinessScore: packet.readinessScore,
      missingRequirements: packet.evidencePacket.missingRequirements,
      evidenceRefs: packet.evidencePacket.evidenceRefs,
      auditHash: packet.auditHash,
      boundary: payerIqProtectedHandoffBoundary
    },
    sourceCitations: packet.evidencePacket.evidenceRefs,
    reviewStatus: "human_review_required",
    exportMetadata: {
      exportable: false,
      exportRequiresHumanReview: true,
      noPhiConfirmed: true
    }
  };

  return {
    ...provisional,
    verification: verifyScrimedWorkResult({ session, artifact: provisional })
  };
}

export function buildPayerIqProtectedWorkSession(input: {
  packet: DocumentationBeforeAuthorizationReviewPacket;
  actor: ActorIdentity;
  tenantId: string;
  workspaceSlug: string;
  idempotencySeed: string;
}): { session: WorkSession; artifact: WorkArtifact } {
  const handoff = input.packet.workSessionHandoff;
  const definitionOfDone = {
    ...handoff.definitionOfDone,
    timeoutMs: 300_000,
    maximumSteps: 8,
    maximumToolCalls: 6,
    maximumEstimatedCostUsd: 0.1
  };
  const baseSession = buildWorkSessionFromContract({
    tenantId: input.tenantId,
    organizationScope: input.workspaceSlug,
    workspaceDomain: handoff.workspaceDomain,
    title: `PayerIQ ${input.packet.procedureFamily} Review`,
    objective: handoff.definitionOfDone.goal,
    actor: input.actor,
    inputClassification: "synthetic-no-phi",
    riskLevel: handoff.riskLevel,
    requestedAutonomy: handoff.requestedAutonomy,
    definitionOfDone,
    idempotencySeed: input.idempotencySeed
  });
  const evidence = buildPayerIqEvidence(input.packet);
  const sessionWithoutArtifact: WorkSession = {
    ...baseSession,
    sourceContextReferences: evidence.map((record) => record.sourceId),
    evidence,
    approvalCheckpoints: [
      buildApprovalCheckpoint({
        session: baseSession,
        action: "review PayerIQ documentation-readiness artifact for internal synthetic use",
        reason: "Independent reviewer approval and verification are required; external distribution and payer submission remain blocked.",
        requiredRole: "reviewer"
      })
    ],
    artifacts: [],
    valueTelemetry: {
      ...baseSession.valueTelemetry,
      estimatedManualMinutes: input.packet.valueTelemetry.estimatedManualReviewMinutes,
      estimatedTimeSavedMinutes: input.packet.valueTelemetry.estimatedReviewMinutesReallocated,
      netTimeSavedMinutes: input.packet.valueTelemetry.estimatedReviewMinutesReallocated,
      artifactCount: 1,
      approvalCount: 1
    },
    updatedAt: nowIso()
  };
  const artifact = buildPayerIqArtifact(sessionWithoutArtifact, input.packet);
  const session = { ...sessionWithoutArtifact, artifacts: [artifact] };

  return { session, artifact };
}
