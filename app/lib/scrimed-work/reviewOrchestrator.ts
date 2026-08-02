import { createAuditHash } from "./audit";

export const scrimedReviewOrchestratorVersion =
  "scrimed-independent-review-orchestrator-v1-2026-08-01";

export type ReviewLaneId =
  | "principal-engineering"
  | "api-architecture"
  | "database"
  | "application-security"
  | "privacy-engineering"
  | "clinical-safety"
  | "legal-public-claims"
  | "ci-platform"
  | "product-ui"
  | "documentation"
  | "release-stewardship"
  | "finance-cost-controls";

export type AiReviewDisposition =
  | "AI REVIEW PASS"
  | "AI REVIEW PASS WITH CONDITIONS"
  | "AI REVIEW BLOCKED"
  | "AI REVIEW FAIL";

export type ReviewSeverity = "critical" | "high" | "medium" | "low";

export type ReviewLaneDefinition = {
  laneId: ReviewLaneId;
  title: string;
  independentPrompt: string;
  acceptanceRubric: string[];
  accountableHumanSignoffRequired: boolean;
  requiredHumanQualification: string;
};

export const scrimedReviewLaneDefinitions: ReviewLaneDefinition[] = [
  {
    laneId: "principal-engineering",
    title: "Principal Engineering",
    independentPrompt:
      "Challenge architecture integrity, compatibility, failure handling, maintainability, and whether tests prove the implemented behavior.",
    acceptanceRubric: [
      "Repository-native architecture is preserved",
      "Behavior is typed, deterministic, and backward compatible",
      "Failure and rollback paths are evidenced"
    ],
    accountableHumanSignoffRequired: true,
    requiredHumanQualification: "Named principal engineer accountable for the candidate"
  },
  {
    laneId: "api-architecture",
    title: "API Architecture",
    independentPrompt:
      "Review request validation, authorization, response contracts, idempotency, tenant isolation, errors, and compatibility without relying on another lane.",
    acceptanceRubric: [
      "API authorization is enforced server-side",
      "Contracts fail closed on malformed or unauthorized input",
      "Compatibility and idempotency are tested"
    ],
    accountableHumanSignoffRequired: false,
    requiredHumanQualification: "API contract owner"
  },
  {
    laneId: "database",
    title: "Database",
    independentPrompt:
      "Challenge migration ordering, checksums, RLS, grants, locking, append-only guarantees, recovery, and tenant isolation.",
    acceptanceRubric: [
      "Migration order and checksums are exact",
      "RLS and privilege boundaries are fail closed",
      "Disposable forward and recovery evidence exists before production"
    ],
    accountableHumanSignoffRequired: true,
    requiredHumanQualification: "Named database owner with migration authority"
  },
  {
    laneId: "application-security",
    title: "Security",
    independentPrompt:
      "Attempt authorization bypass, prompt injection, privilege escalation, replay, secret exposure, unsafe egress, and policy mutation.",
    acceptanceRubric: [
      "Least privilege and separation of duties hold",
      "Secrets and PHI are absent from normal evidence",
      "Adversarial paths terminate safely"
    ],
    accountableHumanSignoffRequired: true,
    requiredHumanQualification: "Named security reviewer accountable for production risk"
  },
  {
    laneId: "privacy-engineering",
    title: "Privacy Engineering",
    independentPrompt:
      "Review data minimization, purpose limitation, retention, redaction, consent, tenant boundaries, and secondary-use restrictions.",
    acceptanceRubric: [
      "Synthetic-only and no-PHI defaults are enforced",
      "Telemetry and review evidence are minimum necessary",
      "Production privacy activation remains externally gated"
    ],
    accountableHumanSignoffRequired: true,
    requiredHumanQualification: "Named privacy reviewer with authority for the intended use"
  },
  {
    laneId: "clinical-safety",
    title: "Clinical Safety",
    independentPrompt:
      "Challenge unsupported clinical claims, weak evidence, missing abstention, human-review bypass, and patient-impacting authority.",
    acceptanceRubric: [
      "Clinical output remains decision support only",
      "Unsupported or incomplete evidence causes abstention or review",
      "Diagnosis, treatment, emergency, payer, and EHR actions remain blocked"
    ],
    accountableHumanSignoffRequired: true,
    requiredHumanQualification: "Qualified clinical safety reviewer for the intended workflow"
  },
  {
    laneId: "legal-public-claims",
    title: "Legal And Public Claims",
    independentPrompt:
      "Challenge legal, regulatory, certification, customer, investor, outcome, and production claims against exact evidence and permissions.",
    acceptanceRubric: [
      "Prohibited claims are absent from public output",
      "Estimated and synthetic evidence is visibly qualified",
      "Binding legal adoption remains counsel controlled"
    ],
    accountableHumanSignoffRequired: true,
    requiredHumanQualification: "Qualified healthcare counsel or delegated claims reviewer"
  },
  {
    laneId: "ci-platform",
    title: "CI And Platform",
    independentPrompt:
      "Review reproducibility, supply-chain evidence, build integrity, release checks, platform drift, and rollback without assuming external settings.",
    acceptanceRubric: [
      "Required checks are deterministic and registered",
      "Warnings and unavailable external checks are not hidden",
      "Deployment remains fingerprint and authorization bound"
    ],
    accountableHumanSignoffRequired: false,
    requiredHumanQualification: "CI or platform owner"
  },
  {
    laneId: "product-ui",
    title: "Product And UI",
    independentPrompt:
      "Review task usability, accessibility, responsive behavior, accurate status language, safe actions, and product coherence.",
    acceptanceRubric: [
      "Status and evidence limitations are visible",
      "Controls do not imply unavailable authority",
      "Desktop and mobile verification has an executable path"
    ],
    accountableHumanSignoffRequired: false,
    requiredHumanQualification: "Product or UI owner"
  },
  {
    laneId: "documentation",
    title: "Documentation",
    independentPrompt:
      "Verify that documentation matches implemented behavior, commands, limitations, owners, and activation boundaries.",
    acceptanceRubric: [
      "Documents cite executable source or evidence",
      "Operator actions are exact and non-destructive",
      "No documentation upgrades an external gate"
    ],
    accountableHumanSignoffRequired: false,
    requiredHumanQualification: "Documentation owner"
  },
  {
    laneId: "release-stewardship",
    title: "Release Stewardship",
    independentPrompt:
      "Challenge candidate attribution, evidence freshness, fingerprint alignment, approval sequencing, and rollback readiness.",
    acceptanceRubric: [
      "Every artifact is bound to the same candidate",
      "Dirty or stale evidence cannot promote",
      "Release, deployment, migration, and go-live authority remain separate"
    ],
    accountableHumanSignoffRequired: true,
    requiredHumanQualification: "Named release steward accountable for promotion"
  },
  {
    laneId: "finance-cost-controls",
    title: "Finance And Cost Controls",
    independentPrompt:
      "Challenge spend ceilings, retry cost, provider concentration, cost attribution, evidence tags, and unsupported ROI claims.",
    acceptanceRubric: [
      "Cost and retry ceilings are explicit",
      "Economic values carry evidence status",
      "No modeled value is represented as audited ROI"
    ],
    accountableHumanSignoffRequired: true,
    requiredHumanQualification: "Named finance reviewer for external economic claims"
  }
];

export type ReviewEvidenceReference = {
  evidenceId: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  testOrArtifactReference: string;
};

export type ReviewFinding = {
  findingId: string;
  severity: ReviewSeverity;
  title: string;
  evidenceIds: string[];
  state: "resolved" | "open" | "escalated";
  resolution: string;
};

export type ReviewRubricResult = {
  criterion: string;
  mandatory: true;
  result: "pass" | "fail" | "not-assessed";
  evidenceIds: string[];
};

export type AiReviewPacket = {
  packetId: string;
  laneId: ReviewLaneId;
  candidateFingerprint: string;
  sourceFingerprint: string;
  reviewerId: string;
  reviewerType: "ai-assisted";
  implementationActorIds: string[];
  modelProvider: string;
  modelId: string;
  promptVersion: string;
  reviewedAt: string;
  expiresAt: string;
  rubric: ReviewRubricResult[];
  evidence: ReviewEvidenceReference[];
  findings: ReviewFinding[];
  disposition: AiReviewDisposition;
  conditions: string[];
  unresolvedRisks: string[];
  humanApprovalClaimed: false;
  humanSignoffSatisfied: false;
  packetHash: string;
};

type AiReviewPacketInput = Omit<AiReviewPacket, "packetHash">;

const sha256Pattern = /^[0-9a-f]{64}$/i;

function assertNonempty(value: string, label: string) {
  if (!value.trim()) throw new Error(`${label} is required.`);
}

function canonicalPacket(packet: AiReviewPacketInput) {
  return {
    ...packet,
    implementationActorIds: [...new Set(packet.implementationActorIds)].sort(),
    rubric: [...packet.rubric].sort((left, right) => left.criterion.localeCompare(right.criterion)),
    evidence: [...packet.evidence].sort((left, right) => left.evidenceId.localeCompare(right.evidenceId)),
    findings: [...packet.findings].sort((left, right) => left.findingId.localeCompare(right.findingId)),
    conditions: [...new Set(packet.conditions)].sort(),
    unresolvedRisks: [...new Set(packet.unresolvedRisks)].sort()
  };
}

export function createAiReviewPacket(input: AiReviewPacketInput): AiReviewPacket {
  const lane = scrimedReviewLaneDefinitions.find((candidate) => candidate.laneId === input.laneId);
  if (!lane) throw new Error(`Unknown review lane ${input.laneId}.`);
  if (!sha256Pattern.test(input.candidateFingerprint) || !sha256Pattern.test(input.sourceFingerprint)) {
    throw new Error("AI review packets require exact SHA-256 candidate and source fingerprints.");
  }
  for (const [value, label] of [
    [input.packetId, "packetId"],
    [input.reviewerId, "reviewerId"],
    [input.modelProvider, "modelProvider"],
    [input.modelId, "modelId"],
    [input.promptVersion, "promptVersion"]
  ] as const) {
    assertNonempty(value, label);
  }
  if (input.implementationActorIds.includes(input.reviewerId)) {
    throw new Error("AI reviewer identity must be independent from implementation identities.");
  }
  if (input.humanApprovalClaimed !== false || input.humanSignoffSatisfied !== false) {
    throw new Error("AI-assisted review cannot impersonate or satisfy accountable human approval.");
  }
  const reviewedAt = Date.parse(input.reviewedAt);
  const expiresAt = Date.parse(input.expiresAt);
  if (!Number.isFinite(reviewedAt) || !Number.isFinite(expiresAt) || expiresAt <= reviewedAt) {
    throw new Error("AI review packet timestamps are invalid.");
  }
  if (!input.evidence.length || !input.rubric.length) {
    throw new Error("AI review packets require evidence and a completed acceptance rubric.");
  }
  const evidenceIds = new Set<string>();
  for (const evidence of input.evidence) {
    assertNonempty(evidence.evidenceId, "evidenceId");
    assertNonempty(evidence.filePath, "filePath");
    assertNonempty(evidence.testOrArtifactReference, "testOrArtifactReference");
    if (
      evidenceIds.has(evidence.evidenceId) ||
      !Number.isInteger(evidence.lineStart) ||
      !Number.isInteger(evidence.lineEnd) ||
      evidence.lineStart < 1 ||
      evidence.lineEnd < evidence.lineStart
    ) {
      throw new Error("AI review evidence references must be unique and line-bounded.");
    }
    evidenceIds.add(evidence.evidenceId);
  }
  for (const rubric of input.rubric) {
    assertNonempty(rubric.criterion, "rubric criterion");
    if (!rubric.evidenceIds.length || rubric.evidenceIds.some((id) => !evidenceIds.has(id))) {
      throw new Error("Every rubric result must cite packet evidence.");
    }
  }
  for (const finding of input.findings) {
    if (!finding.evidenceIds.length || finding.evidenceIds.some((id) => !evidenceIds.has(id))) {
      throw new Error("Every review finding must cite packet evidence.");
    }
  }

  const mandatoryFailure = input.rubric.some((criterion) => criterion.result !== "pass");
  const unresolvedConsequentialFinding = input.findings.some(
    (finding) =>
      (finding.severity === "critical" || finding.severity === "high") &&
      finding.state !== "resolved"
  );
  if (
    input.disposition === "AI REVIEW PASS" &&
    (mandatoryFailure || unresolvedConsequentialFinding || input.conditions.length > 0 || input.unresolvedRisks.length > 0)
  ) {
    throw new Error("An unconditional AI REVIEW PASS requires complete evidence and no unresolved risk.");
  }
  if (
    input.disposition === "AI REVIEW PASS WITH CONDITIONS" &&
    (mandatoryFailure || unresolvedConsequentialFinding || input.conditions.length === 0)
  ) {
    throw new Error("Conditional review cannot conceal mandatory or consequential failures.");
  }
  if (
    (input.disposition === "AI REVIEW BLOCKED" || input.disposition === "AI REVIEW FAIL") &&
    !mandatoryFailure &&
    !unresolvedConsequentialFinding &&
    input.unresolvedRisks.length === 0
  ) {
    throw new Error("Blocked or failed review requires an evidenced blocker or unresolved risk.");
  }

  const base = canonicalPacket(input);
  return {
    ...base,
    packetHash: createAuditHash({
      type: "scrimed-ai-assisted-review-packet",
      orchestratorVersion: scrimedReviewOrchestratorVersion,
      packet: base
    })
  };
}

export function validateAiReviewPacket(
  packet: AiReviewPacket,
  expected: {
    candidateFingerprint: string;
    sourceFingerprint: string;
    modelProvider?: string;
    modelId?: string;
    evaluatedAt: string;
  }
) {
  const { packetHash, ...input } = packet;
  const expectedPacket = createAiReviewPacket(input);
  const reasonCodes: string[] = [];
  if (packetHash !== expectedPacket.packetHash) reasonCodes.push("review-packet-hash-mismatch");
  if (packet.candidateFingerprint !== expected.candidateFingerprint) {
    reasonCodes.push("candidate-fingerprint-mismatch");
  }
  if (packet.sourceFingerprint !== expected.sourceFingerprint) {
    reasonCodes.push("source-fingerprint-mismatch");
  }
  if (expected.modelProvider && packet.modelProvider !== expected.modelProvider) {
    reasonCodes.push("model-provider-mismatch");
  }
  if (expected.modelId && packet.modelId !== expected.modelId) {
    reasonCodes.push("model-id-mismatch");
  }
  const evaluatedAt = Date.parse(expected.evaluatedAt);
  if (!Number.isFinite(evaluatedAt) || Date.parse(packet.expiresAt) <= evaluatedAt) {
    reasonCodes.push("review-expired");
  }
  return {
    valid: reasonCodes.length === 0,
    reasonCodes: [...new Set(reasonCodes)].sort(),
    humanApprovalSatisfied: false as const
  };
}

export function evaluateAiReviewSet(input: {
  packets: AiReviewPacket[];
  candidateFingerprint: string;
  sourceFingerprint: string;
  evaluatedAt: string;
}) {
  const reasonCodes: string[] = [];
  const laneGroups = new Map<ReviewLaneId, AiReviewPacket[]>();
  for (const packet of input.packets) {
    const packets = laneGroups.get(packet.laneId) ?? [];
    packets.push(packet);
    laneGroups.set(packet.laneId, packets);
    const validation = validateAiReviewPacket(packet, {
      candidateFingerprint: input.candidateFingerprint,
      sourceFingerprint: input.sourceFingerprint,
      evaluatedAt: input.evaluatedAt
    });
    reasonCodes.push(...validation.reasonCodes.map((reason) => `${packet.laneId}:${reason}`));
  }

  const missingLanes = scrimedReviewLaneDefinitions
    .filter((lane) => !laneGroups.has(lane.laneId))
    .map((lane) => lane.laneId);
  const conflictingLanes = [...laneGroups.entries()]
    .filter(([, packets]) => new Set(packets.map((packet) => packet.disposition)).size > 1)
    .map(([laneId]) => laneId)
    .sort();
  const duplicateLanes = [...laneGroups.entries()]
    .filter(([, packets]) => packets.length > 1)
    .map(([laneId]) => laneId)
    .sort();
  const blockingPackets = input.packets.filter(
    (packet) =>
      packet.disposition === "AI REVIEW BLOCKED" ||
      packet.disposition === "AI REVIEW FAIL" ||
      packet.findings.some(
        (finding) =>
          (finding.severity === "critical" || finding.severity === "high") &&
          finding.state !== "resolved"
      )
  );

  if (missingLanes.length) reasonCodes.push("required-review-lane-missing");
  if (duplicateLanes.length) reasonCodes.push("duplicate-review-lane");
  if (conflictingLanes.length) reasonCodes.push("conflicting-review-dispositions");
  if (blockingPackets.length) reasonCodes.push("blocking-review-finding");

  const status = reasonCodes.length
    ? "ai-review-set-blocked"
    : "ai-review-set-ready-for-accountable-human-signoff";
  const base = {
    status,
    requiredLaneCount: scrimedReviewLaneDefinitions.length,
    suppliedPacketCount: input.packets.length,
    missingLanes,
    duplicateLanes,
    conflictingLanes,
    blockingPacketIds: blockingPackets.map((packet) => packet.packetId).sort(),
    reasonCodes: [...new Set(reasonCodes)].sort(),
    accountableHumanSignoffRequired: true as const,
    humanApprovalSatisfied: false as const,
    productionAuthorityGranted: false as const
  };
  return {
    ...base,
    reviewSetHash: createAuditHash({
      type: "scrimed-ai-assisted-review-set",
      orchestratorVersion: scrimedReviewOrchestratorVersion,
      candidateFingerprint: input.candidateFingerprint,
      sourceFingerprint: input.sourceFingerprint,
      packetHashes: input.packets.map((packet) => packet.packetHash).sort(),
      base
    })
  };
}

export function getScrimedReviewOrchestratorSummary() {
  return {
    version: scrimedReviewOrchestratorVersion,
    lanes: scrimedReviewLaneDefinitions,
    laneCount: scrimedReviewLaneDefinitions.length,
    selfReviewAllowed: false,
    evidenceRequired: true,
    humanApprovalImpersonationAllowed: false,
    staleReviewAccepted: false,
    productionAuthorityGranted: false,
    boundary:
      "AI-assisted review reduces review burden but never substitutes for accountable legal, clinical, privacy, security, database, finance, release, deployment, PHI, or customer-go-live approval."
  };
}
