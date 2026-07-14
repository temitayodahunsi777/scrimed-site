export const scrimedWorkReviewQueuePolicyVersion = "scrimed-work-review-queue-v2026-07-14";
export const scrimedWorkReviewQueueBoundary =
  "SCRIMED Work Reviewer Queue is an AAL2-gated, reviewer-only, tenant-scoped view of bounded synthetic/no-PHI artifact metadata. It enforces separation of duties, records queue access, and grants no raw-payload access, external distribution, payer submission, EHR writeback, clinical authority, connector approval, certification claim, customer go-live, or production authorization.";

export type ScrimedWorkReviewQueueItem = {
  sessionId: string;
  artifactId: string;
  artifactType: string;
  title: string;
  workspaceDomain: string;
  riskLevel: string;
  sessionStatus: "verifying";
  reviewStatus: "draft" | "human_review_required";
  approvalsReady: boolean;
  verificationReportedEligible: boolean;
  creatorIdentityHash: string;
  createdAt: string;
  syntheticOnly: true;
  noPhi: true;
  humanReviewRequired: true;
  externalDistributionAllowed: false;
  payerSubmissionAllowed: false;
};

export type ScrimedWorkReviewQueue = {
  items: ScrimedWorkReviewQueueItem[];
  count: number;
  limit: number;
  auditEventId: string;
  policyVersion: typeof scrimedWorkReviewQueuePolicyVersion;
  workspaceSlug: string;
  reviewerRoleRequired: true;
  separationOfDutiesEnforced: true;
  syntheticOnly: true;
  noPhi: true;
  externalDistributionAllowed: false;
  payerSubmissionAllowed: false;
  boundary: string;
};

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function isString(value: unknown, pattern?: RegExp): value is string {
  return typeof value === "string" && value.length > 0 && (!pattern || pattern.test(value));
}

function parseItem(value: unknown): ScrimedWorkReviewQueueItem | null {
  const item = asRecord(value);
  if (!item) return null;

  const valid =
    isString(item.sessionId, /^work_session_[a-z0-9_]{8,80}$/) &&
    isString(item.artifactId, /^artifact_[a-z0-9_]{8,100}$/) &&
    isString(item.artifactType, /^[a-z][a-z0-9-]{2,80}$/) &&
    isString(item.title) &&
    item.title.length <= 220 &&
    isString(item.workspaceDomain, /^[a-z][a-z0-9-]{2,40}$/) &&
    isString(item.riskLevel, /^(low|moderate|high)$/) &&
    item.sessionStatus === "verifying" &&
    (item.reviewStatus === "draft" || item.reviewStatus === "human_review_required") &&
    typeof item.approvalsReady === "boolean" &&
    typeof item.verificationReportedEligible === "boolean" &&
    isString(item.creatorIdentityHash, /^scrimed-actor-[a-f0-9]{64}$/) &&
    isString(item.createdAt) &&
    Number.isFinite(Date.parse(item.createdAt)) &&
    item.syntheticOnly === true &&
    item.noPhi === true &&
    item.humanReviewRequired === true &&
    item.externalDistributionAllowed === false &&
    item.payerSubmissionAllowed === false;

  return valid ? (item as unknown as ScrimedWorkReviewQueueItem) : null;
}

export function parseScrimedWorkReviewQueuePayload(value: unknown): ScrimedWorkReviewQueue | null {
  const queue = asRecord(value);
  if (!queue || !Array.isArray(queue.items)) return null;

  const items = queue.items.map(parseItem);
  const limit = Number(queue.limit);
  const count = Number(queue.count);
  const valid =
    items.every((item): item is ScrimedWorkReviewQueueItem => item !== null) &&
    Number.isInteger(limit) &&
    limit >= 1 &&
    limit <= 50 &&
    Number.isInteger(count) &&
    count === items.length &&
    count <= limit &&
    isString(queue.auditEventId, /^[a-f0-9-]{36}$/i) &&
    queue.policyVersion === scrimedWorkReviewQueuePolicyVersion &&
    isString(queue.workspaceSlug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/) &&
    queue.reviewerRoleRequired === true &&
    queue.separationOfDutiesEnforced === true &&
    queue.syntheticOnly === true &&
    queue.noPhi === true &&
    queue.externalDistributionAllowed === false &&
    queue.payerSubmissionAllowed === false &&
    isString(queue.boundary);

  if (!valid) return null;

  return {
    ...(queue as unknown as Omit<ScrimedWorkReviewQueue, "items">),
    items
  };
}

export function parseScrimedWorkReviewQueueLimit(value: string | null) {
  if (value === null || value.trim() === "") {
    return { ok: true as const, value: 25 };
  }

  if (!/^\d{1,2}$/.test(value)) {
    return { ok: false as const, reason: "Review queue limit must be an integer from 1 through 50." };
  }

  const parsed = Number(value);
  if (parsed < 1 || parsed > 50) {
    return { ok: false as const, reason: "Review queue limit must be an integer from 1 through 50." };
  }

  return { ok: true as const, value: parsed };
}
