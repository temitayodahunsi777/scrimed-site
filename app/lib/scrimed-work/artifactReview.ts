import { createHash } from "node:crypto";

import { createAuditHash, nowIso } from "./audit";
import { containsPhiRisk, containsTokenLikeField } from "./schemas";
import { getCurrentWorkSessionStatus } from "./sessionLifecycle";
import { verifyScrimedWorkResult } from "./verificationEngine";
import type { ActorIdentity, WorkArtifact, WorkSession } from "./types";

export const scrimedWorkArtifactReviewPolicyVersion = "scrimed-work-artifact-review-v2026-07-13";
export const scrimedWorkArtifactReviewBoundary =
  "SCRIMED Work artifact review binds a separately authenticated AAL2 reviewer disposition to synthetic/no-PHI artifact metadata. Review never authorizes payer submission, EHR writeback, patient outreach, diagnosis, treatment, prescribing, production connectors, customer go-live, certification claims, or external distribution.";

export type ArtifactReviewDisposition =
  | "approved_for_internal_use"
  | "changes_requested"
  | "rejected";

export type ArtifactReviewReasonCode =
  | "evidence_and_boundaries_confirmed"
  | "missing_required_evidence"
  | "scope_or_policy_conflict"
  | "unsafe_or_unsupported_claim"
  | "revision_required";

export type ArtifactReviewInput = {
  disposition: ArtifactReviewDisposition;
  reasonCode: ArtifactReviewReasonCode;
};

export type ArtifactReviewDecision = {
  allowed: boolean;
  code:
    | "artifact-review-allowed"
    | "artifact-review-invalid-input"
    | "artifact-review-state-conflict"
    | "artifact-reviewer-role-required"
    | "artifact-review-separation-required"
    | "artifact-review-artifact-missing"
    | "artifact-review-approval-required"
    | "artifact-review-verification-required";
  disposition: ArtifactReviewDisposition;
  reasonCode: ArtifactReviewReasonCode;
  artifactId: string;
  sessionId: string;
  reviewerIdentityHash: string;
  reviewDecisionHash: string;
  verificationEligible: boolean;
  externalDistributionAllowed: false;
  payerSubmissionAllowed: false;
  policyVersion: typeof scrimedWorkArtifactReviewPolicyVersion;
  boundary: typeof scrimedWorkArtifactReviewBoundary;
  reviewedArtifact: WorkArtifact | null;
};

const dispositions = new Set<ArtifactReviewDisposition>([
  "approved_for_internal_use",
  "changes_requested",
  "rejected"
]);
const reasonCodes = new Set<ArtifactReviewReasonCode>([
  "evidence_and_boundaries_confirmed",
  "missing_required_evidence",
  "scope_or_policy_conflict",
  "unsafe_or_unsupported_claim",
  "revision_required"
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function createArtifactReviewerIdentityHash(input: {
  actorId: string;
  tenantId: string;
  role: ActorIdentity["role"];
}) {
  return `scrimed-reviewer-${sha256(
    [
      input.actorId,
      input.tenantId,
      input.role,
      scrimedWorkArtifactReviewPolicyVersion
    ].join("|")
  )}`;
}

export function createArtifactReviewDecisionHash(input: {
  sessionId: string;
  artifactId: string;
  disposition: ArtifactReviewDisposition;
  reasonCode: ArtifactReviewReasonCode;
  reviewerIdentityHash: string;
  verificationEligible: boolean;
}) {
  return `scrimed-work-artifact-review-${sha256(
    [
      input.sessionId,
      input.artifactId,
      input.disposition,
      input.reasonCode,
      input.reviewerIdentityHash,
      String(input.verificationEligible),
      scrimedWorkArtifactReviewPolicyVersion
    ].join("|")
  )}`;
}

export function parseArtifactReviewInput(
  value: unknown
): { ok: true; value: ArtifactReviewInput } | { ok: false; reason: string } {
  if (!isRecord(value)) return { ok: false, reason: "Artifact review input must be an object." };

  const allowedFields = new Set(["workspaceSlug", "disposition", "reasonCode"]);
  if (Object.keys(value).some((key) => !allowedFields.has(key))) {
    return { ok: false, reason: "Artifact review accepts enumerated review metadata only." };
  }

  if (containsTokenLikeField(value) || containsPhiRisk(value)) {
    return { ok: false, reason: "Artifact review rejects credentials, token-like fields, PHI, and direct identifiers." };
  }

  if (!dispositions.has(value.disposition as ArtifactReviewDisposition)) {
    return { ok: false, reason: "Select a supported artifact review disposition." };
  }

  if (!reasonCodes.has(value.reasonCode as ArtifactReviewReasonCode)) {
    return { ok: false, reason: "Select a supported artifact review reason code." };
  }

  if (
    value.disposition === "approved_for_internal_use" &&
    value.reasonCode !== "evidence_and_boundaries_confirmed"
  ) {
    return {
      ok: false,
      reason: "Internal-use approval requires the evidence_and_boundaries_confirmed reason code."
    };
  }

  return {
    ok: true,
    value: {
      disposition: value.disposition as ArtifactReviewDisposition,
      reasonCode: value.reasonCode as ArtifactReviewReasonCode
    }
  };
}

function deniedDecision(input: {
  code: ArtifactReviewDecision["code"];
  session: WorkSession;
  artifactId: string;
  actor: Pick<ActorIdentity, "actorId" | "role">;
  review: ArtifactReviewInput;
}): ArtifactReviewDecision {
  const reviewerIdentityHash = createArtifactReviewerIdentityHash({
    actorId: input.actor.actorId,
    tenantId: input.session.tenantId,
    role: input.actor.role
  });
  const reviewDecisionHash = createAuditHash({
    code: input.code,
    sessionId: input.session.id,
    artifactId: input.artifactId,
    disposition: input.review.disposition,
    reasonCode: input.review.reasonCode,
    reviewerIdentityHash,
    policyVersion: scrimedWorkArtifactReviewPolicyVersion
  });

  return {
    allowed: false,
    code: input.code,
    disposition: input.review.disposition,
    reasonCode: input.review.reasonCode,
    artifactId: input.artifactId,
    sessionId: input.session.id,
    reviewerIdentityHash,
    reviewDecisionHash,
    verificationEligible: false,
    externalDistributionAllowed: false,
    payerSubmissionAllowed: false,
    policyVersion: scrimedWorkArtifactReviewPolicyVersion,
    boundary: scrimedWorkArtifactReviewBoundary,
    reviewedArtifact: null
  };
}

export function evaluateArtifactReview(input: {
  session: WorkSession;
  artifactId: string;
  actor: Pick<ActorIdentity, "actorId" | "role">;
  review: ArtifactReviewInput;
  reviewedAt?: string;
}): ArtifactReviewDecision {
  const artifact = input.session.artifacts.find((item) => item.artifactId === input.artifactId);
  const deny = (code: ArtifactReviewDecision["code"]) =>
    deniedDecision({
      code,
      session: input.session,
      artifactId: input.artifactId,
      actor: input.actor,
      review: input.review
    });

  if (getCurrentWorkSessionStatus(input.session) !== "verifying") {
    return deny("artifact-review-state-conflict");
  }

  if (input.actor.role !== "reviewer") {
    return deny("artifact-reviewer-role-required");
  }

  if (input.actor.actorId === input.session.actor.actorId) {
    return deny("artifact-review-separation-required");
  }

  if (!artifact) {
    return deny("artifact-review-artifact-missing");
  }

  if (
    input.session.approvalCheckpoints.length === 0 ||
    input.session.approvalCheckpoints.some((checkpoint) => checkpoint.status !== "approved")
  ) {
    return deny("artifact-review-approval-required");
  }

  const reviewedAt = input.reviewedAt ?? nowIso();
  const reviewerIdentityHash = createArtifactReviewerIdentityHash({
    actorId: input.actor.actorId,
    tenantId: input.session.tenantId,
    role: input.actor.role
  });
  const provisionalArtifact: WorkArtifact = {
    ...artifact,
    reviewStatus:
      input.review.disposition === "approved_for_internal_use" ? "reviewed" : "blocked",
    exportMetadata: {
      ...artifact.exportMetadata,
      exportable: false,
      exportRequiresHumanReview: true,
      noPhiConfirmed: true
    }
  };
  const sessionWithProvisionalArtifact: WorkSession = {
    ...input.session,
    artifacts: input.session.artifacts.map((item) =>
      item.artifactId === input.artifactId ? provisionalArtifact : item
    )
  };
  const verification = verifyScrimedWorkResult({
    session: sessionWithProvisionalArtifact,
    artifact: provisionalArtifact
  });

  if (
    input.review.disposition === "approved_for_internal_use" &&
    !verification.eligibleForCompletion
  ) {
    return deny("artifact-review-verification-required");
  }

  const reviewDecisionHash = createArtifactReviewDecisionHash({
    sessionId: input.session.id,
    artifactId: input.artifactId,
    disposition: input.review.disposition,
    reasonCode: input.review.reasonCode,
    reviewerIdentityHash,
    verificationEligible: verification.eligibleForCompletion
  });
  const reviewedArtifact: WorkArtifact = {
    ...provisionalArtifact,
    verification,
    reviewMetadata: {
      disposition: input.review.disposition,
      reasonCode: input.review.reasonCode,
      reviewerIdentityHash,
      decisionHash: reviewDecisionHash,
      reviewedAt,
      externalDistributionAllowed: false,
      payerSubmissionAllowed: false
    }
  };

  return {
    allowed: true,
    code: "artifact-review-allowed",
    disposition: input.review.disposition,
    reasonCode: input.review.reasonCode,
    artifactId: input.artifactId,
    sessionId: input.session.id,
    reviewerIdentityHash,
    reviewDecisionHash,
    verificationEligible: verification.eligibleForCompletion,
    externalDistributionAllowed: false,
    payerSubmissionAllowed: false,
    policyVersion: scrimedWorkArtifactReviewPolicyVersion,
    boundary: scrimedWorkArtifactReviewBoundary,
    reviewedArtifact
  };
}
