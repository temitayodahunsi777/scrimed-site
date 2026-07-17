export const scrimedWorkCompletionQueuePolicyVersion =
  "scrimed-work-completion-queue-v2026-07-16";

export const scrimedWorkCompletionQueueBoundary =
  "SCRIMED Work Completion Queue is an AAL2-gated, tenant-admin/pilot-lead, tenant-scoped view of bounded synthetic/no-PHI completion metadata. It lists only independently approved artifacts with current mandatory verification evidence, records every queue read, and grants no raw-payload access, external distribution, payer submission, EHR writeback, clinical authority, connector approval, certification claim, customer go-live, or production authorization.";

export type ScrimedWorkCompletionReadMode = "ready" | "evidence";

export type ScrimedWorkCompletionQueueItem = {
  sessionId: string;
  artifactId: string;
  artifactType: string;
  title: string;
  workspaceDomain: string;
  riskLevel: string;
  sessionStatus: "verifying";
  reviewStatus: "reviewed";
  reviewDisposition: "approved_for_internal_use";
  verificationEligible: true;
  verificationPassRate: 100;
  reviewEvidenceBound: true;
  completionReady: true;
  reviewedAt: string;
  syntheticOnly: true;
  noPhi: true;
  humanReviewRequired: true;
  externalDistributionAllowed: false;
  payerSubmissionAllowed: false;
  ehrWritebackAllowed: false;
};

export type ScrimedWorkCompletionQueue = {
  items: ScrimedWorkCompletionQueueItem[];
  count: number;
  limit: number;
  auditEventId: string;
  policyVersion: typeof scrimedWorkCompletionQueuePolicyVersion;
  workspaceSlug: string;
  operatorRoleRequired: true;
  allowedMemberRoles: ["tenant-admin", "pilot-lead"];
  independentReviewRequired: true;
  verificationRequired: true;
  syntheticOnly: true;
  noPhi: true;
  externalDistributionAllowed: false;
  payerSubmissionAllowed: false;
  ehrWritebackAllowed: false;
  boundary: string;
};

type JsonRecord = Record<string, unknown>;

export function isScrimedWorkCompletionOperator(
  memberRole: string,
  actorRole?: string
) {
  const memberAllowed = memberRole === "tenant-admin" || memberRole === "pilot-lead";
  const actorAllowed = actorRole === undefined || actorRole === "admin" || actorRole === "operator";
  return memberAllowed && actorAllowed;
}

function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function isString(value: unknown, pattern?: RegExp): value is string {
  return typeof value === "string" && value.length > 0 && (!pattern || pattern.test(value));
}

function parseItem(value: unknown): ScrimedWorkCompletionQueueItem | null {
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
    item.reviewStatus === "reviewed" &&
    item.reviewDisposition === "approved_for_internal_use" &&
    item.verificationEligible === true &&
    item.verificationPassRate === 100 &&
    item.reviewEvidenceBound === true &&
    item.completionReady === true &&
    isString(item.reviewedAt) &&
    Number.isFinite(Date.parse(item.reviewedAt)) &&
    item.syntheticOnly === true &&
    item.noPhi === true &&
    item.humanReviewRequired === true &&
    item.externalDistributionAllowed === false &&
    item.payerSubmissionAllowed === false &&
    item.ehrWritebackAllowed === false;

  return valid ? (item as unknown as ScrimedWorkCompletionQueueItem) : null;
}

export function parseScrimedWorkCompletionQueuePayload(
  value: unknown
): ScrimedWorkCompletionQueue | null {
  const queue = asRecord(value);
  if (!queue || !Array.isArray(queue.items)) return null;

  const items = queue.items.map(parseItem);
  const limit = Number(queue.limit);
  const count = Number(queue.count);
  const roles = queue.allowedMemberRoles;
  const valid =
    items.every((item): item is ScrimedWorkCompletionQueueItem => item !== null) &&
    Number.isInteger(limit) &&
    limit >= 1 &&
    limit <= 50 &&
    Number.isInteger(count) &&
    count === items.length &&
    count <= limit &&
    isString(queue.auditEventId, /^[a-f0-9-]{36}$/i) &&
    queue.policyVersion === scrimedWorkCompletionQueuePolicyVersion &&
    isString(queue.workspaceSlug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/) &&
    queue.operatorRoleRequired === true &&
    Array.isArray(roles) &&
    roles.length === 2 &&
    roles[0] === "tenant-admin" &&
    roles[1] === "pilot-lead" &&
    queue.independentReviewRequired === true &&
    queue.verificationRequired === true &&
    queue.syntheticOnly === true &&
    queue.noPhi === true &&
    queue.externalDistributionAllowed === false &&
    queue.payerSubmissionAllowed === false &&
    queue.ehrWritebackAllowed === false &&
    isString(queue.boundary);

  if (!valid) return null;

  return {
    ...(queue as unknown as Omit<ScrimedWorkCompletionQueue, "items">),
    items
  };
}

export function parseScrimedWorkCompletionQueueLimit(value: string | null) {
  if (value === null || value.trim() === "") {
    return { ok: true as const, value: 25 };
  }

  if (!/^\d{1,2}$/.test(value)) {
    return {
      ok: false as const,
      reason: "Completion queue limit must be an integer from 1 through 50."
    };
  }

  const parsed = Number(value);
  if (parsed < 1 || parsed > 50) {
    return {
      ok: false as const,
      reason: "Completion queue limit must be an integer from 1 through 50."
    };
  }

  return { ok: true as const, value: parsed };
}

export function parseScrimedWorkCompletionReadMode(value: string | null) {
  if (value === null || value.trim() === "" || value === "ready") {
    return { ok: true as const, value: "ready" as const };
  }

  if (value === "evidence") {
    return { ok: true as const, value: "evidence" as const };
  }

  return {
    ok: false as const,
    reason: "Completion read mode must be ready or evidence."
  };
}
