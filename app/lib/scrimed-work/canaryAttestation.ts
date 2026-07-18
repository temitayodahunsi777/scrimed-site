import {
  scrimedWorkCompletionEvidencePolicyVersion,
  type ScrimedWorkCompletionEvidence,
  type ScrimedWorkCompletionEvidenceItem
} from "./completionEvidence";

export const scrimedWorkCanaryAttestationPolicyVersion =
  "scrimed-work-release-bound-canary-v2-2026-07-17";

export const scrimedWorkCanaryHmacContext =
  "scrimed-work-release-bound-canary-hmac-v2";

export const scrimedWorkCanaryMaxAgeHours = 72 as const;
export const scrimedWorkCanaryClockSkewMinutes = 5 as const;

export const scrimedWorkCanaryAttestationBoundary =
  "SCRIMED Work release-bound canary attestation derives a deterministic nonsecret identifier from immutable synthetic/no-PHI completion evidence, the exact tenant workspace, and the exact deployed commit. Release promotion requires authenticated evidence completed within 72 hours. It requires separate AAL2 operator and reviewer evidence, grants internal-use evidence only, and grants no PHI, clinical, payer, EHR, connector, external-distribution, certification, customer go-live, or production authority.";

export const scrimedWorkCanaryEnvironment = {
  verified: "SCRIMED_WORK_TWO_IDENTITY_CANARY_VERIFIED",
  evidenceId: "SCRIMED_WORK_TWO_IDENTITY_CANARY_EVIDENCE_ID",
  releaseSha: "SCRIMED_WORK_TWO_IDENTITY_CANARY_RELEASE_SHA",
  completedAt: "SCRIMED_WORK_TWO_IDENTITY_CANARY_COMPLETED_AT",
  workspaceSlug: "SCRIMED_WORKSPACE_SLUG"
} as const;

export type ScrimedWorkCanaryAttestationStatus =
  | "verified_release_bound"
  | "completion_evidence_required"
  | "completion_evidence_stale"
  | "release_identity_required"
  | "signing_authority_required";

export type ScrimedWorkCanaryAttestationSource = {
  sessionId: string;
  artifactId: string;
  reviewEventId: string;
  completionEventId: string;
  reviewDecisionHash: string;
  lifecycleDecisionHash: string;
  evidencePacketHash: string;
  reviewedAt: string;
  completedAt: string;
  readAuditEventId: string;
};

export type ScrimedWorkCanaryAttestation = {
  service: "scrimed-work-release-bound-canary-attestation";
  status: ScrimedWorkCanaryAttestationStatus;
  eligibleForReleaseBinding: boolean;
  policyVersion: typeof scrimedWorkCanaryAttestationPolicyVersion;
  completionEvidencePolicyVersion: typeof scrimedWorkCompletionEvidencePolicyVersion;
  workspaceSlug: string;
  releaseSha: string | null;
  releaseShaFingerprint: string;
  evidenceId: string | null;
  source: ScrimedWorkCanaryAttestationSource | null;
  freshness: {
    completedAt: string | null;
    evaluatedAt: string;
    ageHours: number | null;
    maxAgeHours: typeof scrimedWorkCanaryMaxAgeHours;
    clockSkewMinutes: typeof scrimedWorkCanaryClockSkewMinutes;
    fresh: boolean;
  };
  configuration: {
    variableNames: typeof scrimedWorkCanaryEnvironment;
    values: {
      verified: "true";
      evidenceId: string;
      releaseSha: string;
      completedAt: string;
      workspaceSlug: string;
    } | null;
  };
  controls: {
    immutableCompletionEvidenceRequired: true;
    independentReviewerRequired: true;
    exactReleaseRequired: true;
    exactWorkspaceRequired: true;
    freshnessRequired: true;
    aal2Required: true;
    tenantScoped: true;
    syntheticOnly: true;
    noPhi: true;
    internalUseOnly: true;
    externalDistributionAllowed: false;
    payerSubmissionAllowed: false;
    ehrWritebackAllowed: false;
    productionAuthorization: false;
  };
  boundary: typeof scrimedWorkCanaryAttestationBoundary;
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

export function normalizeScrimedWorkReleaseSha(value: string | undefined | null) {
  const normalized = value?.trim().toLowerCase() ?? "";
  return /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(normalized) ? normalized : "";
}

export function normalizeScrimedWorkCanaryWorkspaceSlug(value: string | undefined | null) {
  const normalized = value?.trim().toLowerCase() ?? "";
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized) ? normalized : "";
}

export function normalizeScrimedWorkCanaryTimestamp(value: string | undefined | null) {
  const timestamp = Date.parse(value?.trim() ?? "");
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : "";
}

export function isScrimedWorkCanaryEvidenceId(value: string | undefined | null) {
  return parseScrimedWorkCanaryEvidenceId(value) !== null;
}

export function parseScrimedWorkCanaryEvidenceId(value: string | undefined | null) {
  const match = /^scrimed-work-canary-([a-f0-9]{64})\.([a-f0-9]{64})$/.exec(
    value?.trim() ?? ""
  );
  return match
    ? {
        evidenceDigest: match[1],
        authenticationTag: match[2]
      }
    : null;
}

export function getScrimedWorkCanaryAuthenticationMessage(input: {
  evidenceDigest: string;
  releaseSha: string;
  workspaceSlug: string;
  completedAt: string;
}) {
  return [
    scrimedWorkCanaryHmacContext,
    scrimedWorkCanaryAttestationPolicyVersion,
    input.releaseSha,
    input.workspaceSlug,
    input.completedAt,
    input.evidenceDigest
  ].join("\n");
}

export function getScrimedWorkRuntimeReleaseSha(env: NodeJS.ProcessEnv = process.env) {
  return normalizeScrimedWorkReleaseSha(
    env.VERCEL_GIT_COMMIT_SHA ?? env.SCRIMED_APPROVED_RELEASE_SHA
  );
}

function newestEvidenceItem(items: ScrimedWorkCompletionEvidenceItem[]) {
  return [...items].sort((left, right) => {
    const timeDifference = Date.parse(right.completedAt) - Date.parse(left.completedAt);
    return timeDifference || right.evidencePacketHash.localeCompare(left.evidencePacketHash);
  })[0] ?? null;
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hmacSha256(secret: string, value: string) {
  const encoder = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await globalThis.crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function sourceFromEvidence(
  evidence: ScrimedWorkCompletionEvidence,
  item: ScrimedWorkCompletionEvidenceItem
): ScrimedWorkCanaryAttestationSource {
  return {
    sessionId: item.sessionId,
    artifactId: item.artifactId,
    reviewEventId: item.reviewEventId,
    completionEventId: item.completionEventId,
    reviewDecisionHash: item.reviewDecisionHash,
    lifecycleDecisionHash: item.lifecycleDecisionHash,
    evidencePacketHash: item.evidencePacketHash,
    reviewedAt: item.reviewedAt,
    completedAt: item.completedAt,
    readAuditEventId: evidence.auditEventId
  };
}

function calculateCanaryFreshness(input: {
  completedAt?: string | null;
  evaluatedAt?: string | null;
}) {
  const evaluatedAt = normalizeScrimedWorkCanaryTimestamp(input.evaluatedAt) || new Date().toISOString();
  const completedAt = normalizeScrimedWorkCanaryTimestamp(input.completedAt);
  if (!completedAt) {
    return {
      completedAt: null,
      evaluatedAt,
      ageHours: null,
      maxAgeHours: scrimedWorkCanaryMaxAgeHours,
      clockSkewMinutes: scrimedWorkCanaryClockSkewMinutes,
      fresh: false
    } as const;
  }

  const ageMs = Date.parse(evaluatedAt) - Date.parse(completedAt);
  const clockSkewMs = scrimedWorkCanaryClockSkewMinutes * 60 * 1000;
  const maxAgeMs = scrimedWorkCanaryMaxAgeHours * 60 * 60 * 1000;
  return {
    completedAt,
    evaluatedAt,
    ageHours: Math.max(0, ageMs / (60 * 60 * 1000)),
    maxAgeHours: scrimedWorkCanaryMaxAgeHours,
    clockSkewMinutes: scrimedWorkCanaryClockSkewMinutes,
    fresh: ageMs >= -clockSkewMs && ageMs <= maxAgeMs
  } as const;
}

function baseAttestation(input: {
  evidence: ScrimedWorkCompletionEvidence;
  releaseSha: string;
  source: ScrimedWorkCanaryAttestationSource | null;
  freshness: ScrimedWorkCanaryAttestation["freshness"];
  status: Exclude<ScrimedWorkCanaryAttestationStatus, "verified_release_bound">;
}): ScrimedWorkCanaryAttestation {
  return {
    service: "scrimed-work-release-bound-canary-attestation",
    status: input.status,
    eligibleForReleaseBinding: false,
    policyVersion: scrimedWorkCanaryAttestationPolicyVersion,
    completionEvidencePolicyVersion: scrimedWorkCompletionEvidencePolicyVersion,
    workspaceSlug: input.evidence.workspaceSlug,
    releaseSha: input.releaseSha || null,
    releaseShaFingerprint: input.releaseSha ? input.releaseSha.slice(0, 12) : "unavailable",
    evidenceId: null,
    source: input.source,
    freshness: input.freshness,
    configuration: {
      variableNames: scrimedWorkCanaryEnvironment,
      values: null
    },
    controls: {
      immutableCompletionEvidenceRequired: true,
      independentReviewerRequired: true,
      exactReleaseRequired: true,
      exactWorkspaceRequired: true,
      freshnessRequired: true,
      aal2Required: true,
      tenantScoped: true,
      syntheticOnly: true,
      noPhi: true,
      internalUseOnly: true,
      externalDistributionAllowed: false,
      payerSubmissionAllowed: false,
      ehrWritebackAllowed: false,
      productionAuthorization: false
    },
    boundary: scrimedWorkCanaryAttestationBoundary
  };
}

export async function buildScrimedWorkCanaryAttestation(input: {
  evidence: ScrimedWorkCompletionEvidence;
  releaseSha?: string | null;
  signingSecret?: string | null;
  evaluatedAt?: string | null;
}): Promise<ScrimedWorkCanaryAttestation> {
  const releaseSha = normalizeScrimedWorkReleaseSha(input.releaseSha);
  const item = newestEvidenceItem(input.evidence.items);
  const source = item ? sourceFromEvidence(input.evidence, item) : null;
  const freshness = calculateCanaryFreshness({
    completedAt: source?.completedAt,
    evaluatedAt: input.evaluatedAt
  });
  const completedAt = freshness.completedAt;

  if (!item) {
    return baseAttestation({
      evidence: input.evidence,
      releaseSha,
      source: null,
      freshness,
      status: "completion_evidence_required"
    });
  }

  if (!freshness.fresh || !completedAt) {
    return baseAttestation({
      evidence: input.evidence,
      releaseSha,
      source,
      freshness,
      status: "completion_evidence_stale"
    });
  }

  if (!releaseSha) {
    return baseAttestation({
      evidence: input.evidence,
      releaseSha: "",
      source,
      freshness,
      status: "release_identity_required"
    });
  }

  if (typeof input.signingSecret !== "string" || input.signingSecret.length < 24) {
    return baseAttestation({
      evidence: input.evidence,
      releaseSha,
      source,
      freshness,
      status: "signing_authority_required"
    });
  }

  const evidenceDigest = await sha256(JSON.stringify({
    policyVersion: scrimedWorkCanaryAttestationPolicyVersion,
    completionEvidencePolicyVersion: input.evidence.policyVersion,
    workspaceSlug: input.evidence.workspaceSlug,
    releaseSha,
    sessionId: item.sessionId,
    artifactId: item.artifactId,
    reviewEventId: item.reviewEventId,
    completionEventId: item.completionEventId,
    reviewDecisionHash: item.reviewDecisionHash,
    lifecycleDecisionHash: item.lifecycleDecisionHash,
    evidencePacketHash: item.evidencePacketHash,
    reviewedAt: item.reviewedAt,
    completedAt: item.completedAt,
    syntheticOnly: true,
    noPhi: true,
    internalUseOnly: true,
    externalDistributionAllowed: false,
    payerSubmissionAllowed: false,
    ehrWritebackAllowed: false
  }));
  const authenticationTag = await hmacSha256(
    input.signingSecret,
    getScrimedWorkCanaryAuthenticationMessage({
      evidenceDigest,
      releaseSha,
      workspaceSlug: input.evidence.workspaceSlug,
      completedAt
    })
  );
  const evidenceId = `scrimed-work-canary-${evidenceDigest}.${authenticationTag}`;

  return {
    ...baseAttestation({
      evidence: input.evidence,
      releaseSha,
      source,
      freshness,
      status: "release_identity_required"
    }),
    status: "verified_release_bound",
    eligibleForReleaseBinding: true,
    evidenceId,
    configuration: {
      variableNames: scrimedWorkCanaryEnvironment,
      values: {
        verified: "true",
        evidenceId,
        releaseSha,
        completedAt,
        workspaceSlug: input.evidence.workspaceSlug
      }
    }
  };
}

function parseSource(value: unknown): ScrimedWorkCanaryAttestationSource | null {
  const source = asRecord(value);
  if (!source) return null;

  const valid =
    isString(source.sessionId, /^work_session_[a-z0-9_]{8,80}$/) &&
    isString(source.artifactId, /^artifact_[a-z0-9_]{8,100}$/) &&
    isString(source.reviewEventId, /^[a-f0-9-]{36}$/i) &&
    isString(source.completionEventId, /^[a-f0-9-]{36}$/i) &&
    source.reviewEventId !== source.completionEventId &&
    isString(source.reviewDecisionHash, /^scrimed-work-artifact-review-[a-f0-9]{64}$/) &&
    isString(source.lifecycleDecisionHash, /^scrimed-work-lifecycle-[a-f0-9]{8}$/) &&
    isString(source.evidencePacketHash, /^scrimed-work-completion-evidence-[a-f0-9]{64}$/) &&
    isIsoTimestamp(source.reviewedAt) &&
    isIsoTimestamp(source.completedAt) &&
    Date.parse(source.reviewedAt) <= Date.parse(source.completedAt) &&
    isString(source.readAuditEventId, /^[a-f0-9-]{36}$/i);

  return valid ? (source as unknown as ScrimedWorkCanaryAttestationSource) : null;
}

export function parseScrimedWorkCanaryAttestationPayload(
  value: unknown
): ScrimedWorkCanaryAttestation | null {
  const attestation = asRecord(value);
  if (!attestation) return null;

  const status = attestation.status;
  const verified = status === "verified_release_bound";
  const unverified =
    status === "completion_evidence_required" ||
    status === "completion_evidence_stale" ||
    status === "release_identity_required" ||
    status === "signing_authority_required";
  if (!verified && !unverified) return null;

  const releaseSha = attestation.releaseSha === null
    ? ""
    : normalizeScrimedWorkReleaseSha(String(attestation.releaseSha ?? ""));
  const evidenceId = typeof attestation.evidenceId === "string" ? attestation.evidenceId : null;
  const source = attestation.source === null ? null : parseSource(attestation.source);
  const freshness = asRecord(attestation.freshness);
  const freshnessCompletedAt = freshness?.completedAt === null
    ? ""
    : normalizeScrimedWorkCanaryTimestamp(String(freshness?.completedAt ?? ""));
  const freshnessEvaluatedAt = normalizeScrimedWorkCanaryTimestamp(
    String(freshness?.evaluatedAt ?? "")
  );
  const expectedAgeHours = freshnessCompletedAt && freshnessEvaluatedAt
    ? Math.max(
        0,
        (Date.parse(freshnessEvaluatedAt) - Date.parse(freshnessCompletedAt)) /
          (60 * 60 * 1000)
      )
    : null;
  const ageHours = typeof freshness?.ageHours === "number" && Number.isFinite(freshness.ageHours)
    ? freshness.ageHours
    : null;
  const clockSkewMs = scrimedWorkCanaryClockSkewMinutes * 60 * 1000;
  const maxAgeMs = scrimedWorkCanaryMaxAgeHours * 60 * 60 * 1000;
  const freshnessAgeMs = freshnessCompletedAt && freshnessEvaluatedAt
    ? Date.parse(freshnessEvaluatedAt) - Date.parse(freshnessCompletedAt)
    : null;
  const expectedFresh = freshnessAgeMs !== null &&
    freshnessAgeMs >= -clockSkewMs &&
    freshnessAgeMs <= maxAgeMs;
  const validFreshness =
    freshness !== null &&
    Boolean(freshnessEvaluatedAt) &&
    freshness.maxAgeHours === scrimedWorkCanaryMaxAgeHours &&
    freshness.clockSkewMinutes === scrimedWorkCanaryClockSkewMinutes &&
    freshness.fresh === expectedFresh &&
    (source === null
      ? freshness.completedAt === null && ageHours === null && expectedAgeHours === null
      : freshnessCompletedAt === normalizeScrimedWorkCanaryTimestamp(source.completedAt) &&
        ageHours !== null &&
        ageHours >= 0 &&
        expectedAgeHours !== null &&
        Math.abs(ageHours - expectedAgeHours) < 0.000001);
  const configuration = asRecord(attestation.configuration);
  const variableNames = asRecord(configuration?.variableNames);
  const values = configuration?.values === null ? null : asRecord(configuration?.values);
  const controls = asRecord(attestation.controls);
  const valid =
    attestation.service === "scrimed-work-release-bound-canary-attestation" &&
    attestation.eligibleForReleaseBinding === verified &&
    attestation.policyVersion === scrimedWorkCanaryAttestationPolicyVersion &&
    attestation.completionEvidencePolicyVersion === scrimedWorkCompletionEvidencePolicyVersion &&
    isString(attestation.workspaceSlug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/) &&
    attestation.releaseShaFingerprint === (releaseSha ? releaseSha.slice(0, 12) : "unavailable") &&
    validFreshness &&
    (verified
      ? Boolean(releaseSha) && isScrimedWorkCanaryEvidenceId(evidenceId) && source !== null && expectedFresh
      : evidenceId === null &&
        (status === "completion_evidence_required"
          ? source === null
          : status === "completion_evidence_stale"
            ? source !== null && !expectedFresh
          : status === "release_identity_required"
            ? source !== null && expectedFresh && !releaseSha
            : source !== null && expectedFresh && Boolean(releaseSha))) &&
    variableNames?.verified === scrimedWorkCanaryEnvironment.verified &&
    variableNames?.evidenceId === scrimedWorkCanaryEnvironment.evidenceId &&
    variableNames?.releaseSha === scrimedWorkCanaryEnvironment.releaseSha &&
    variableNames?.completedAt === scrimedWorkCanaryEnvironment.completedAt &&
    variableNames?.workspaceSlug === scrimedWorkCanaryEnvironment.workspaceSlug &&
    (verified
      ? values?.verified === "true" &&
        values?.evidenceId === evidenceId &&
        values?.releaseSha === releaseSha &&
        values?.completedAt === freshnessCompletedAt &&
        values?.workspaceSlug === attestation.workspaceSlug
      : values === null) &&
    controls?.immutableCompletionEvidenceRequired === true &&
    controls?.independentReviewerRequired === true &&
    controls?.exactReleaseRequired === true &&
    controls?.exactWorkspaceRequired === true &&
    controls?.freshnessRequired === true &&
    controls?.aal2Required === true &&
    controls?.tenantScoped === true &&
    controls?.syntheticOnly === true &&
    controls?.noPhi === true &&
    controls?.internalUseOnly === true &&
    controls?.externalDistributionAllowed === false &&
    controls?.payerSubmissionAllowed === false &&
    controls?.ehrWritebackAllowed === false &&
    controls?.productionAuthorization === false &&
    attestation.boundary === scrimedWorkCanaryAttestationBoundary;

  return valid ? (attestation as unknown as ScrimedWorkCanaryAttestation) : null;
}
