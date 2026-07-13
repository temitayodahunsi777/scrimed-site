import { createHash } from "node:crypto";
import {
  executionAttemptEnvelopes
} from "../executionAttemptEnvelope";
import {
  executionAttemptDurableStoreBoundary,
  executionAttemptDurableStoreRecordRoute,
  executionAttemptDurableStoreReplayRoute,
  executionAttemptDurableStoreReviewDispositionRoute,
  validateExecutionAttemptDurableStoreRecordRequest,
  validateExecutionAttemptDurableStoreReplayRequest,
  validateExecutionAttemptDurableStoreReviewRequest
} from "../executionAttemptDurableStore";
import {
  detectSyntheticOperationalSignals
} from "./signal-engine";
import {
  buildSelfHealingRecommendations
} from "./self-healing-workflows";
import {
  validateTrustOpsReviewPacket,
  type SelfHealingRecommendation,
  type SyntheticOperationalSignal,
  type TrustOpsReviewPacket
} from "./trustops-schema";

const trustOpsPacketVersion = "scrimed-trustops-review-packet-v1";
const trustOpsPacketCreatedAt = "2026-06-30T00:00:00.000Z";
const trustOpsWorkspaceSlug = "atlas-synthetic-evaluation";
const trustOpsRetentionUntil = "2026-12-31T00:00:00.000Z";
const trustOpsReviewPacketBoundary =
  "Synthetic TrustOps review packet only. Recommendation-only remediation requires human review and does not authorize live PHI, autonomous clinical action, payer submission, billing submission, EHR writeback, patient outreach, production connector use, certification, clinical validation, or customer go-live.";

const moduleIdsBySignal: Record<string, string[]> = {
  denied_claim_spike: ["rcm-denials", "governance-compliance", "signal-detection", "self-healing-operations"],
  referral_delay: ["referral-management", "patient-access", "signal-detection", "self-healing-operations"],
  prior_auth_stalled: ["prior-authorization", "rcm-denials", "signal-detection", "self-healing-operations"],
  missing_documentation: ["clinical-intelligence", "quality-hedis-star", "signal-detection", "self-healing-operations"],
  imaging_turnaround_delay: ["imaging-intelligence", "signal-detection", "self-healing-operations"],
  care_gap_detected: ["population-health", "quality-hedis-star", "signal-detection", "governance-compliance"],
  failed_api_sync: ["secure-middleware-gateway", "semantic-intelligence-graph", "signal-detection", "self-healing-operations"],
  duplicate_patient_context: ["patient-journey-memory", "semantic-intelligence-graph", "governance-compliance", "self-healing-operations"],
  low_confidence_agent_output: ["clinical-intelligence", "governance-compliance", "signal-detection", "self-healing-operations"],
  compliance_sensitive_task: ["governance-compliance", "secure-middleware-gateway", "semantic-intelligence-graph", "self-healing-operations"]
};

function stableHash(parts: string[]) {
  return createHash("sha256").update(parts.join("|")).digest("hex");
}

function trustOpsDurableEnvelope() {
  return executionAttemptEnvelopes.find(
    (envelope) => envelope.workflowSlug === "trustops-signal-remediation-review"
  );
}

function reasonCodeForSignal(signalId: string) {
  return `trustops-${signalId.replaceAll("_", "-")}`.slice(0, 80);
}

function dispositionForSignal(signal: SyntheticOperationalSignal) {
  if (signal.severity === "critical") {
    return "escalated" as const;
  }

  return "changes-requested" as const;
}

function reviewNoteForSignal(
  signal: SyntheticOperationalSignal,
  recommendation: SelfHealingRecommendation
) {
  return [
    `Synthetic TrustOps packet for ${signal.id}.`,
    `Recommended owner: ${signal.recommendedOwner}.`,
    `Recommended action: ${recommendation.action}.`,
    "Human review is required before any protected workflow moves beyond synthetic mode."
  ].join(" ");
}

function buildPacket(
  signal: SyntheticOperationalSignal,
  recommendation: SelfHealingRecommendation
): TrustOpsReviewPacket | null {
  const envelope = trustOpsDurableEnvelope();

  if (!envelope) {
    return null;
  }

  const moduleIds = moduleIdsBySignal[signal.id] ?? ["signal-detection", "self-healing-operations", "governance-compliance"];
  const packetHash = stableHash([
    trustOpsPacketVersion,
    signal.id,
    recommendation.id,
    envelope.attemptId,
    signal.affectedWorkflow,
    recommendation.action
  ]);
  const evidenceEnvelopeHash = stableHash([
    packetHash,
    envelope.evidenceAuditTrail.evidence_envelope_hash,
    envelope.contextFingerprint,
    ...moduleIds
  ]);

  return {
    packetId: `trustops_packet_${packetHash.slice(0, 16)}`,
    packetVersion: trustOpsPacketVersion,
    createdAt: trustOpsPacketCreatedAt,
    signalId: signal.id,
    recommendationId: recommendation.id,
    moduleIds,
    affectedWorkflow: signal.affectedWorkflow,
    severity: signal.severity,
    recommendedOwner: signal.recommendedOwner,
    reviewerQueue: `${signal.recommendedOwner} human review queue`,
    syntheticOnly: true,
    humanReviewRequired: true,
    automationExecutionAllowed: false,
    signal,
    recommendation,
    evidenceRefs: [
      "scrimed-trustops-module-registry",
      "scrimed-trustops-signal-engine",
      "scrimed-trustops-self-healing-recommendation",
      "scrimed-execution-attempt-durable-store"
    ],
    durableEvidenceBinding: {
      attemptId: envelope.attemptId,
      idempotencyKey: envelope.idempotencyKey,
      replayToken: envelope.replayMetadata.replayToken,
      workflowSlug: envelope.workflowSlug,
      durableStoreRecordRoute: executionAttemptDurableStoreRecordRoute,
      durableStoreReplayRoute: executionAttemptDurableStoreReplayRoute,
      durableStoreReviewDispositionRoute: executionAttemptDurableStoreReviewDispositionRoute,
      recordRequest: {
        workspaceSlug: trustOpsWorkspaceSlug,
        attemptId: envelope.attemptId,
        idempotencyKey: envelope.idempotencyKey,
        region: "us",
        retentionUntil: trustOpsRetentionUntil
      },
      replayRequest: {
        workspaceSlug: trustOpsWorkspaceSlug,
        replayToken: envelope.replayMetadata.replayToken
      },
      reviewDispositionRequest: {
        workspaceSlug: trustOpsWorkspaceSlug,
        attemptId: envelope.attemptId,
        disposition: dispositionForSignal(signal),
        reviewerRole: "TrustOps reviewer",
        reasonCode: reasonCodeForSignal(signal.id),
        reviewNote: reviewNoteForSignal(signal, recommendation),
        humanReviewAttestation: "no-phi-human-review-no-clinical-authority"
      },
      packetHash,
      evidenceEnvelopeHash,
      persistenceStatus: "ready-for-aal2-protected-durable-store-not-persisted",
      safetyBoundary: executionAttemptDurableStoreBoundary
    },
    safetyBoundary: trustOpsReviewPacketBoundary
  };
}

export function buildTrustOpsReviewPackets() {
  const signals = detectSyntheticOperationalSignals();
  const recommendations = buildSelfHealingRecommendations(signals);

  return signals
    .map((signal) => {
      const recommendation = recommendations.find((item) => item.signalId === signal.id);

      return recommendation ? buildPacket(signal, recommendation) : null;
    })
    .filter((packet): packet is TrustOpsReviewPacket => Boolean(packet));
}

export function validateTrustOpsReviewPacketSet(packets = buildTrustOpsReviewPackets()) {
  const packetValidations = packets.map(validateTrustOpsReviewPacket);
  const durableRecordValidations = packets.map((packet) =>
    validateExecutionAttemptDurableStoreRecordRequest(packet.durableEvidenceBinding.recordRequest)
  );
  const durableReplayValidations = packets.map((packet) =>
    validateExecutionAttemptDurableStoreReplayRequest(packet.durableEvidenceBinding.replayRequest)
  );
  const durableReviewValidations = packets.map((packet) =>
    validateExecutionAttemptDurableStoreReviewRequest(packet.durableEvidenceBinding.reviewDispositionRequest)
  );
  const checks = [
    {
      check: "trustops-review-packets-generated",
      passed: packets.length === detectSyntheticOperationalSignals().length && packets.length > 0,
      detail: "Every synthetic TrustOps signal has a replayable review packet."
    },
    {
      check: "trustops-review-packets-schema-valid",
      passed: packetValidations.every((result) => result.valid),
      detail: "Every TrustOps review packet passes structured validation."
    },
    {
      check: "durable-record-payloads-valid",
      passed: durableRecordValidations.every((result) => result.ok),
      detail: "Every TrustOps review packet includes a durable-store record payload that references the server-known TrustOps envelope."
    },
    {
      check: "durable-replay-payloads-valid",
      passed: durableReplayValidations.every((result) => result.ok),
      detail: "Every TrustOps review packet includes a valid metadata-only replay payload."
    },
    {
      check: "durable-review-disposition-payloads-valid",
      passed: durableReviewValidations.every((result) => result.ok),
      detail: "Every TrustOps review packet includes a valid no-PHI human-review disposition payload."
    },
    {
      check: "recommendation-only-no-execution",
      passed: packets.every((packet) => packet.automationExecutionAllowed === false),
      detail: "TrustOps review packets cannot execute real-world remediation."
    }
  ];

  return {
    status: checks.every((check) => check.passed) ? "pass" : "fail",
    checks,
    packetValidations,
    durableRecordValidations,
    durableReplayValidations,
    durableReviewValidations
  };
}

export function getTrustOpsReviewPacketSummary() {
  const packets = buildTrustOpsReviewPackets();
  const validation = validateTrustOpsReviewPacketSet(packets);

  return {
    service: "scrimed-trustops-review-packets",
    status: "trustops-review-packets-ready-for-aal2-protected-persistence",
    packetCount: packets.length,
    durableEnvelope: trustOpsDurableEnvelope(),
    durableStoreRoutes: {
      record: executionAttemptDurableStoreRecordRoute,
      replay: executionAttemptDurableStoreReplayRoute,
      reviewDisposition: executionAttemptDurableStoreReviewDispositionRoute
    },
    persistenceBoundary:
      "Review packets are ready for AAL2 protected durable-store record/replay/review-disposition routes, but this public TrustOps layer does not write protected storage or bypass authentication.",
    packets,
    validation
  };
}
