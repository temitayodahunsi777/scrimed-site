export const scrimedWorkCompletionEvidencePolicyVersion =
  "scrimed-work-completion-evidence-v2026-07-16";

export const scrimedWorkCompletionEvidenceBoundary =
  "SCRIMED Work Completion Evidence is an AAL2-gated, tenant-admin/pilot-lead, tenant-scoped view of immutable completion references for synthetic/no-PHI internal work. It exposes bounded hashes, identifiers, timestamps, and verification facts only; it grants no artifact-content access, external distribution, payer submission, EHR writeback, clinical authority, connector approval, certification claim, customer go-live, or production authorization.";

export type ScrimedWorkCompletionEvidenceItem = {
  sessionId: string;
  artifactId: string;
  artifactType: string;
  title: string;
  workspaceDomain: string;
  riskLevel: string;
  sessionStatus: "completed";
  reviewStatus: "reviewed";
  reviewDisposition: "approved_for_internal_use";
  verificationAllPass: true;
  verificationEligible: true;
  verificationPassRate: 100;
  reviewEvidenceBound: true;
  reviewerSeparationEnforced: true;
  completionEvidenceBound: true;
  reviewEventId: string;
  completionEventId: string;
  reviewDecisionHash: string;
  lifecycleDecisionHash: string;
  evidencePacketHash: string;
  reviewedAt: string;
  completedAt: string;
  syntheticOnly: true;
  noPhi: true;
  humanReviewRequired: true;
  internalUseOnly: true;
  externalDistributionAllowed: false;
  payerSubmissionAllowed: false;
  ehrWritebackAllowed: false;
};

export type ScrimedWorkCompletionEvidence = {
  items: ScrimedWorkCompletionEvidenceItem[];
  count: number;
  limit: number;
  auditEventId: string;
  policyVersion: typeof scrimedWorkCompletionEvidencePolicyVersion;
  workspaceSlug: string;
  operatorRoleRequired: true;
  allowedMemberRoles: ["tenant-admin", "pilot-lead"];
  completedSessionsOnly: true;
  independentReviewRequired: true;
  verificationRequired: true;
  immutableEvidenceReferences: true;
  internalUseOnly: true;
  syntheticOnly: true;
  noPhi: true;
  externalDistributionAllowed: false;
  payerSubmissionAllowed: false;
  ehrWritebackAllowed: false;
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

function isIsoTimestamp(value: unknown): value is string {
  return isString(value) && Number.isFinite(Date.parse(value));
}

function parseItem(value: unknown): ScrimedWorkCompletionEvidenceItem | null {
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
    item.sessionStatus === "completed" &&
    item.reviewStatus === "reviewed" &&
    item.reviewDisposition === "approved_for_internal_use" &&
    item.verificationAllPass === true &&
    item.verificationEligible === true &&
    item.verificationPassRate === 100 &&
    item.reviewEvidenceBound === true &&
    item.reviewerSeparationEnforced === true &&
    item.completionEvidenceBound === true &&
    isString(item.reviewEventId, /^[a-f0-9-]{36}$/i) &&
    isString(item.completionEventId, /^[a-f0-9-]{36}$/i) &&
    isString(item.reviewDecisionHash, /^scrimed-work-artifact-review-[a-f0-9]{64}$/) &&
    isString(item.lifecycleDecisionHash, /^scrimed-work-lifecycle-[a-f0-9]{8}$/) &&
    isString(item.evidencePacketHash, /^scrimed-work-completion-evidence-[a-f0-9]{64}$/) &&
    isIsoTimestamp(item.reviewedAt) &&
    isIsoTimestamp(item.completedAt) &&
    item.syntheticOnly === true &&
    item.noPhi === true &&
    item.humanReviewRequired === true &&
    item.internalUseOnly === true &&
    item.externalDistributionAllowed === false &&
    item.payerSubmissionAllowed === false &&
    item.ehrWritebackAllowed === false;

  return valid ? (item as unknown as ScrimedWorkCompletionEvidenceItem) : null;
}

export function parseScrimedWorkCompletionEvidencePayload(
  value: unknown
): ScrimedWorkCompletionEvidence | null {
  const evidence = asRecord(value);
  if (!evidence || !Array.isArray(evidence.items)) return null;

  const items = evidence.items.map(parseItem);
  const limit = Number(evidence.limit);
  const count = Number(evidence.count);
  const roles = evidence.allowedMemberRoles;
  const valid =
    items.every((item): item is ScrimedWorkCompletionEvidenceItem => item !== null) &&
    Number.isInteger(limit) &&
    limit >= 1 &&
    limit <= 50 &&
    Number.isInteger(count) &&
    count === items.length &&
    count <= limit &&
    isString(evidence.auditEventId, /^[a-f0-9-]{36}$/i) &&
    evidence.policyVersion === scrimedWorkCompletionEvidencePolicyVersion &&
    isString(evidence.workspaceSlug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/) &&
    evidence.operatorRoleRequired === true &&
    Array.isArray(roles) &&
    roles.length === 2 &&
    roles[0] === "tenant-admin" &&
    roles[1] === "pilot-lead" &&
    evidence.completedSessionsOnly === true &&
    evidence.independentReviewRequired === true &&
    evidence.verificationRequired === true &&
    evidence.immutableEvidenceReferences === true &&
    evidence.internalUseOnly === true &&
    evidence.syntheticOnly === true &&
    evidence.noPhi === true &&
    evidence.externalDistributionAllowed === false &&
    evidence.payerSubmissionAllowed === false &&
    evidence.ehrWritebackAllowed === false &&
    isString(evidence.boundary);

  if (!valid) return null;

  return {
    ...(evidence as unknown as Omit<ScrimedWorkCompletionEvidence, "items">),
    items
  };
}
