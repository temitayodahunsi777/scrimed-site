import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import type { DecisionEvidenceRecord } from "./types";

export const p33DecisionEvidenceLedgerVersion =
  "scrimed-p33-decision-evidence-ledger-v1-2026-08-13";

export const p33DecisionEvidenceLedgerBoundary =
  "Decision Evidence Ledger records permitted summaries, digests, tools, policies, approvals, outcomes, and replay metadata. It never stores raw PHI, secrets, hidden chain-of-thought, or self-issued clinical authority.";

const hashPattern = /^[0-9a-f]{64}$/i;
const idPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,159}$/;

function canonical(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

function assertHash(value: string | null, label: string) {
  if (value !== null && !hashPattern.test(value)) {
    throw new Error(`${label} must be a SHA-256 fingerprint`);
  }
}

function assertId(value: string, label: string) {
  if (!idPattern.test(value)) throw new Error(`${label} must be a bounded identifier`);
}

export type DecisionEvidenceRecordInput = Omit<
  DecisionEvidenceRecord,
  "containsRawPhi" | "containsSecrets" | "hiddenChainOfThoughtStored" | "recordHash"
>;

function recordPayload(input: DecisionEvidenceRecordInput) {
  return {
    ...input,
    authorizedScope: canonical(input.authorizedScope),
    evidenceReferences: canonical(input.evidenceReferences),
    sourceHashes: canonical(input.sourceHashes),
    toolVersions: canonical(input.toolVersions),
    constraintsApplied: canonical(input.constraintsApplied),
    affectedObjectIds: canonical(input.affectedObjectIds),
    replayRecipe: {
      ...input.replayRecipe,
      fixtureIds: canonical(input.replayRecipe.fixtureIds),
      toolContractIds: canonical(input.replayRecipe.toolContractIds)
    },
    containsRawPhi: false as const,
    containsSecrets: false as const,
    hiddenChainOfThoughtStored: false as const
  };
}

export function createDecisionEvidenceRecord(
  input: DecisionEvidenceRecordInput,
  existingRecords: DecisionEvidenceRecord[] = []
): DecisionEvidenceRecord {
  for (const [label, value] of [
    ["record id", input.recordId],
    ["ledger id", input.ledgerId],
    ["tenant id", input.tenantId],
    ["trace id", input.traceId],
    ["correlation id", input.correlationId]
  ] as const) {
    assertId(value, label);
  }
  for (const [label, value] of [
    ["actor", input.actorIdHash],
    ["accountable human", input.accountableHumanAuthorityHash],
    ["input", input.inputHash],
    ["output", input.outputHash],
    ["previous record", input.previousRecordHash]
  ] as const) {
    assertHash(value, label);
  }
  input.sourceHashes.forEach((hash) => assertHash(hash, "source evidence"));
  if (!Number.isFinite(Date.parse(input.occurredAt))) {
    throw new Error("Decision evidence requires an ISO event timestamp");
  }
  if (!input.authorizedScope.length || !input.intendedUse.trim()) {
    throw new Error("Decision evidence requires authorized scope and intended use");
  }
  if (input.dataClassification === "phi-prohibited") {
    throw new Error("PHI-prohibited inputs cannot be represented as accepted decision evidence");
  }
  if (existingRecords.some((record) => record.recordId === input.recordId)) {
    throw new Error("Decision evidence record IDs are append-only and cannot be reused");
  }
  const tenantRecords = existingRecords.filter(
    (record) => record.ledgerId === input.ledgerId && record.tenantId === input.tenantId
  );
  const previous = tenantRecords.at(-1) ?? null;
  if ((previous?.recordHash ?? null) !== input.previousRecordHash) {
    throw new Error("Decision evidence previous-record hash does not match the ledger head");
  }
  if (
    input.approvalState === "approved" &&
    (!input.accountableHumanAuthorityHash || !input.reviewerRole)
  ) {
    throw new Error("Approved consequential evidence requires accountable human authority and reviewer role");
  }

  const payload = recordPayload(input);
  return {
    ...payload,
    recordHash: createClinicalEvidenceHash({
      type: "p33-decision-evidence-record",
      version: p33DecisionEvidenceLedgerVersion,
      payload
    })
  };
}

export function verifyDecisionEvidenceChain(records: DecisionEvidenceRecord[]) {
  const failures: Array<{ recordId: string; reason: string }> = [];
  const heads = new Map<string, string | null>();
  const seenIds = new Set<string>();

  for (const record of records) {
    const key = `${record.tenantId}:${record.ledgerId}`;
    if (seenIds.has(record.recordId)) {
      failures.push({ recordId: record.recordId, reason: "DUPLICATE_RECORD_ID" });
    }
    seenIds.add(record.recordId);
    const expectedPrevious = heads.get(key) ?? null;
    if (record.previousRecordHash !== expectedPrevious) {
      failures.push({ recordId: record.recordId, reason: "CHAIN_PREDECESSOR_MISMATCH" });
    }
    const { recordHash, ...input } = record;
    const expected = createClinicalEvidenceHash({
      type: "p33-decision-evidence-record",
      version: p33DecisionEvidenceLedgerVersion,
      payload: input
    });
    if (expected !== recordHash) {
      failures.push({ recordId: record.recordId, reason: "RECORD_HASH_MISMATCH" });
    }
    if (record.containsRawPhi || record.containsSecrets || record.hiddenChainOfThoughtStored) {
      failures.push({ recordId: record.recordId, reason: "PROHIBITED_CONTENT_FLAG" });
    }
    heads.set(key, record.recordHash);
  }

  return {
    valid: failures.length === 0,
    recordCount: records.length,
    ledgerCount: heads.size,
    failures,
    chainHash: createClinicalEvidenceHash({
      type: "p33-decision-evidence-chain",
      heads: [...heads.entries()].sort(([left], [right]) => left.localeCompare(right))
    })
  };
}

export function findDecisionEvidenceByAffectedObject(
  records: DecisionEvidenceRecord[],
  input: { tenantId: string; affectedObjectId: string }
) {
  return records.filter(
    (record) =>
      record.tenantId === input.tenantId &&
      record.affectedObjectIds.includes(input.affectedObjectId)
  );
}

export function buildDecisionReplayPacket(record: DecisionEvidenceRecord) {
  return {
    recordId: record.recordId,
    recordHash: record.recordHash,
    tenantId: record.tenantId,
    traceId: record.traceId,
    policyState: {
      policyVersion: record.policyVersion,
      regulatoryLabelVersion: record.regulatoryLabelVersion,
      constraintsApplied: record.constraintsApplied
    },
    runtimeState: {
      modelIdentity: record.modelIdentity,
      providerIdentity: record.providerIdentity,
      harnessIdentity: record.harnessIdentity,
      promptVersion: record.promptVersion,
      toolVersions: record.toolVersions,
      buildIdentity: record.buildIdentity
    },
    evidence: {
      evidenceReferences: record.evidenceReferences,
      sourceHashes: record.sourceHashes,
      inputHash: record.inputHash,
      outputHash: record.outputHash
    },
    replayRecipe: record.replayRecipe,
    rawInputAvailable: false,
    hiddenChainOfThoughtAvailable: false,
    replayExecutionAuthorized: false,
    boundary: p33DecisionEvidenceLedgerBoundary
  };
}

export function createSyntheticDecisionEvidenceFixture() {
  const baseHash = createClinicalEvidenceHash("synthetic-p33-evidence-source");
  const actorHash = createClinicalEvidenceHash("synthetic-agent-commander");
  const humanHash = createClinicalEvidenceHash("synthetic-qualified-reviewer");
  const first = createDecisionEvidenceRecord({
    recordId: "decision-context-compression-001",
    ledgerId: "ledger-synthetic-p33",
    tenantId: "synthetic-tenant",
    traceId: "trace-p33-context-001",
    correlationId: "correlation-p33-context-001",
    actorIdHash: actorHash,
    accountableHumanAuthorityHash: null,
    authorizedScope: ["read-synthetic-context", "prepare-compression"],
    intendedUse: "Prepare a synthetic clinical signal compression for qualified review.",
    policyVersion: "scrimed-p33-clinical-extraction-release-v1-2026-08-13",
    regulatoryLabelVersion: "scrimed-p33-label-signal-compression-v1",
    modelIdentity: "deterministic-policy-fixture-v1",
    providerIdentity: "synthetic-fallback",
    harnessIdentity: "scrimed-context-compression-harness-v1",
    promptVersion: "template-context-compression-v1",
    toolVersions: ["context-fabric-v1", "release-gate-v1"],
    buildIdentity: "local-candidate-unbound",
    dataClassification: "synthetic-no-phi",
    consentState: "not-required-synthetic",
    evidenceReferences: ["ctx-synthetic-discharge-001"],
    sourceHashes: [baseHash],
    inputHash: createClinicalEvidenceHash("synthetic-compression-input"),
    outputHash: createClinicalEvidenceHash("synthetic-compression-output"),
    constraintsApplied: ["no-phi", "decision-support-only", "human-review-required"],
    approvalState: "pending",
    reviewerRole: "qualified-clinical-reviewer",
    outcome: "review-required",
    affectedObjectIds: ["compression-synthetic-discharge-001"],
    reversible: true,
    replayRecipe: {
      fixtureIds: ["ctx-synthetic-discharge-001"],
      policyVersion: "scrimed-p33-clinical-extraction-release-v1-2026-08-13",
      modelProfileId: "deterministic-policy-fixture-v1",
      toolContractIds: ["context-fabric-v1"]
    },
    occurredAt: "2026-08-13T12:00:00.000Z",
    previousRecordHash: null
  });
  const second = createDecisionEvidenceRecord({
    recordId: "decision-context-review-001",
    ledgerId: "ledger-synthetic-p33",
    tenantId: "synthetic-tenant",
    traceId: "trace-p33-context-001",
    correlationId: "correlation-p33-context-001",
    actorIdHash: humanHash,
    accountableHumanAuthorityHash: humanHash,
    authorizedScope: ["review-synthetic-compression"],
    intendedUse: "Record synthetic review disposition without granting clinical record authority.",
    policyVersion: "scrimed-p33-clinical-extraction-release-v1-2026-08-13",
    regulatoryLabelVersion: "scrimed-p33-label-signal-compression-v1",
    modelIdentity: "none-human-review",
    providerIdentity: "scrimed-human-review",
    harnessIdentity: "scrimed-review-harness-v1",
    promptVersion: "none",
    toolVersions: ["decision-evidence-ledger-v1"],
    buildIdentity: "local-candidate-unbound",
    dataClassification: "synthetic-no-phi",
    consentState: "not-required-synthetic",
    evidenceReferences: [first.recordHash],
    sourceHashes: [baseHash],
    inputHash: first.recordHash,
    outputHash: createClinicalEvidenceHash("synthetic-review-disposition"),
    constraintsApplied: ["synthetic-preview-only", "no-ehr-writeback"],
    approvalState: "approved",
    reviewerRole: "qualified-clinical-reviewer",
    outcome: "verified",
    affectedObjectIds: ["compression-synthetic-discharge-001"],
    reversible: true,
    replayRecipe: {
      fixtureIds: ["ctx-synthetic-discharge-001"],
      policyVersion: "scrimed-p33-clinical-extraction-release-v1-2026-08-13",
      modelProfileId: "none-human-review",
      toolContractIds: ["decision-evidence-ledger-v1"]
    },
    occurredAt: "2026-08-13T12:05:00.000Z",
    previousRecordHash: first.recordHash
  }, [first]);
  return [first, second];
}

export function getP33DecisionEvidenceSummary() {
  const records = createSyntheticDecisionEvidenceFixture();
  return {
    version: p33DecisionEvidenceLedgerVersion,
    status: "append-only-synthetic-ledger-valid",
    records,
    verification: verifyDecisionEvidenceChain(records),
    replay: buildDecisionReplayPacket(records[1]),
    boundary: p33DecisionEvidenceLedgerBoundary
  };
}
