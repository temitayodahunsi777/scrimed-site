import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import type { PilotDemoProofPreflightResult } from "./pilotDemoProofPreflight";
import type { PilotDemoRehearsalEvaluation } from "./pilotDemoRehearsal";
import {
  buildPilotDemoSessionPlan,
  pilotDemoSessionAudienceOptions,
  pilotDemoSessionFocusOptions,
  pilotDemoSessionLengthOptions,
  type PilotDemoSessionAudience,
  type PilotDemoSessionCatalogEntry,
  type PilotDemoSessionFocus,
  type PilotDemoSessionLength,
  type PilotDemoSessionPlan
} from "./pilotDemoSessionPlanner";

export type PilotDemoProtectedHandoff = {
  version: "pilot-demo-handoff-v1";
  source: "public-rehearsal-metadata";
  demoSlug: string;
  audience: PilotDemoSessionAudience;
  focus: PilotDemoSessionFocus;
  durationMinutes: PilotDemoSessionLength;
  planId: string;
  planAuditHash: string;
  proofPreflightAuditHash: string;
  rehearsalAuditHash: string;
  proofTargetCount: number;
  readinessScore: 100;
  syntheticOnly: true;
  humanReviewRequired: true;
  automaticPersistenceAuthorized: false;
  externalSendAuthorized: false;
  releaseAuthorityGranted: false;
  handoffFingerprint: string;
};

export type ValidatedPilotDemoProtectedHandoff = PilotDemoProtectedHandoff & {
  validationStatus: "canonical-plan-identity-validated";
  evidenceStatus: "client-rehearsal-reference-not-independent-verification";
  canonicalDemoName: string;
  canonicalAudienceLabel: string;
  canonicalFocusLabel: string;
};

export type PilotDemoProtectedHandoffValidation =
  | {
      status: "accepted-metadata-draft";
      handoff: ValidatedPilotDemoProtectedHandoff;
      plan: PilotDemoSessionPlan;
      warning: string;
    }
  | {
      status: "rejected";
      code:
        | "missing-handoff"
        | "oversized-handoff"
        | "unknown-field"
        | "duplicate-field"
        | "invalid-shape"
        | "unknown-demo"
        | "invalid-plan-identity"
        | "invalid-fingerprint";
      message: string;
    };

export class PilotDemoProtectedHandoffError extends Error {
  readonly code: "rehearsal-incomplete" | "evidence-mismatch";

  constructor(code: "rehearsal-incomplete" | "evidence-mismatch", message: string) {
    super(message);
    this.name = "PilotDemoProtectedHandoffError";
    this.code = code;
  }
}

export const pilotDemoProtectedHandoffStatus = "canonical-metadata-draft-handoff-active";
export const pilotDemoProtectedHandoffBaseRoute = "/sales-operations";
export const pilotDemoProtectedHandoffAnchor = "authenticated-buyer-demo-execution";
export const pilotDemoProtectedHandoffMaximumQueryLength = 1_800;

export const pilotDemoProtectedHandoffQueryKeys = {
  version: "demoHandoffVersion",
  source: "demoHandoffSource",
  demoSlug: "demo",
  audience: "audience",
  focus: "focus",
  durationMinutes: "duration",
  planId: "planId",
  planAuditHash: "planHash",
  proofPreflightAuditHash: "preflightHash",
  rehearsalAuditHash: "rehearsalHash",
  proofTargetCount: "proofTargets",
  readinessScore: "readiness",
  handoffFingerprint: "handoffHash"
} as const;

const expectedQueryKeys: string[] = Object.values(pilotDemoProtectedHandoffQueryKeys);
const auditHashPattern = /^scrimed-intel-[0-9a-f]{8}$/;
const planIdPattern = /^demo-session-[0-9a-f]{8}$/;

function handoffIdentity(handoff: Omit<PilotDemoProtectedHandoff, "handoffFingerprint">) {
  return {
    version: handoff.version,
    source: handoff.source,
    demoSlug: handoff.demoSlug,
    audience: handoff.audience,
    focus: handoff.focus,
    durationMinutes: handoff.durationMinutes,
    planId: handoff.planId,
    planAuditHash: handoff.planAuditHash,
    proofPreflightAuditHash: handoff.proofPreflightAuditHash,
    rehearsalAuditHash: handoff.rehearsalAuditHash,
    proofTargetCount: handoff.proofTargetCount,
    readinessScore: handoff.readinessScore,
    syntheticOnly: handoff.syntheticOnly,
    humanReviewRequired: handoff.humanReviewRequired,
    automaticPersistenceAuthorized: handoff.automaticPersistenceAuthorized,
    externalSendAuthorized: handoff.externalSendAuthorized,
    releaseAuthorityGranted: handoff.releaseAuthorityGranted
  };
}

function reject(
  code: Extract<PilotDemoProtectedHandoffValidation, { status: "rejected" }>["code"],
  message: string
): PilotDemoProtectedHandoffValidation {
  return { status: "rejected", code, message };
}

function isAudience(value: unknown): value is PilotDemoSessionAudience {
  return typeof value === "string" && pilotDemoSessionAudienceOptions.some((option) => option.id === value);
}

function isFocus(value: unknown): value is PilotDemoSessionFocus {
  return typeof value === "string" && pilotDemoSessionFocusOptions.some((option) => option.id === value);
}

function isDuration(value: unknown): value is PilotDemoSessionLength {
  return typeof value === "number" && pilotDemoSessionLengthOptions.some((option) => option.id === value);
}

export function buildPilotDemoProtectedHandoff({
  plan,
  proofPreflight,
  rehearsal
}: {
  plan: PilotDemoSessionPlan;
  proofPreflight: PilotDemoProofPreflightResult;
  rehearsal: PilotDemoRehearsalEvaluation;
}): PilotDemoProtectedHandoff {
  const evidenceMatches =
    proofPreflight.planId === plan.planId &&
    rehearsal.planId === plan.planId &&
    proofPreflight.status === "passed" &&
    proofPreflight.targetCount > 0 &&
    proofPreflight.reachableCount === proofPreflight.targetCount &&
    proofPreflight.routeChecks.every((check) => check.passed) &&
    rehearsal.criteria.every((criterion) => criterion.status === "pass") &&
    rehearsal.blockers.length === 0;

  if (!evidenceMatches) {
    throw new PilotDemoProtectedHandoffError(
      "evidence-mismatch",
      "Protected handoff metadata requires matching plan, proof-preflight, and rehearsal evidence."
    );
  }

  if (rehearsal.status !== "ready-for-protected-handoff" || rehearsal.readinessScore !== 100) {
    throw new PilotDemoProtectedHandoffError(
      "rehearsal-incomplete",
      "Protected handoff metadata is unavailable until the rehearsal gate reaches 100 percent."
    );
  }

  const base: Omit<PilotDemoProtectedHandoff, "handoffFingerprint"> = {
    version: "pilot-demo-handoff-v1",
    source: "public-rehearsal-metadata",
    demoSlug: plan.demoSlug,
    audience: plan.audience,
    focus: plan.focus,
    durationMinutes: plan.durationMinutes,
    planId: plan.planId,
    planAuditHash: plan.auditHash,
    proofPreflightAuditHash: proofPreflight.auditHash,
    rehearsalAuditHash: rehearsal.auditHash,
    proofTargetCount: proofPreflight.targetCount,
    readinessScore: 100,
    syntheticOnly: true,
    humanReviewRequired: true,
    automaticPersistenceAuthorized: false,
    externalSendAuthorized: false,
    releaseAuthorityGranted: false
  };

  return {
    ...base,
    handoffFingerprint: generateScrimedAuditHash(handoffIdentity(base))
  };
}

export function validatePilotDemoProtectedHandoff(
  candidate: unknown,
  catalog: PilotDemoSessionCatalogEntry[]
): PilotDemoProtectedHandoffValidation {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return reject("invalid-shape", "The protected handoff draft must be a metadata object.");
  }

  const record = candidate as Record<string, unknown>;
  const allowedFields = new Set([
    "version",
    "source",
    "demoSlug",
    "audience",
    "focus",
    "durationMinutes",
    "planId",
    "planAuditHash",
    "proofPreflightAuditHash",
    "rehearsalAuditHash",
    "proofTargetCount",
    "readinessScore",
    "syntheticOnly",
    "humanReviewRequired",
    "automaticPersistenceAuthorized",
    "externalSendAuthorized",
    "releaseAuthorityGranted",
    "handoffFingerprint"
  ]);

  if (Object.keys(record).some((key) => !allowedFields.has(key))) {
    return reject("unknown-field", "The protected handoff draft contains an unsupported field.");
  }

  if (
    record.version !== "pilot-demo-handoff-v1" ||
    record.source !== "public-rehearsal-metadata" ||
    typeof record.demoSlug !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.demoSlug) ||
    !isAudience(record.audience) ||
    !isFocus(record.focus) ||
    !isDuration(record.durationMinutes) ||
    typeof record.planId !== "string" ||
    !planIdPattern.test(record.planId) ||
    typeof record.planAuditHash !== "string" ||
    !auditHashPattern.test(record.planAuditHash) ||
    typeof record.proofPreflightAuditHash !== "string" ||
    !auditHashPattern.test(record.proofPreflightAuditHash) ||
    typeof record.rehearsalAuditHash !== "string" ||
    !auditHashPattern.test(record.rehearsalAuditHash) ||
    !Number.isInteger(record.proofTargetCount) ||
    Number(record.proofTargetCount) < 1 ||
    Number(record.proofTargetCount) > 8 ||
    record.readinessScore !== 100 ||
    record.syntheticOnly !== true ||
    record.humanReviewRequired !== true ||
    record.automaticPersistenceAuthorized !== false ||
    record.externalSendAuthorized !== false ||
    record.releaseAuthorityGranted !== false ||
    typeof record.handoffFingerprint !== "string" ||
    !auditHashPattern.test(record.handoffFingerprint)
  ) {
    return reject("invalid-shape", "The protected handoff draft failed its bounded metadata contract.");
  }

  let plan: PilotDemoSessionPlan;
  try {
    plan = buildPilotDemoSessionPlan(catalog, {
      demoSlug: record.demoSlug,
      audience: record.audience,
      focus: record.focus,
      durationMinutes: record.durationMinutes
    });
  } catch {
    return reject("unknown-demo", "The protected handoff draft is not present in the governed demo catalog.");
  }

  if (plan.planId !== record.planId || plan.auditHash !== record.planAuditHash) {
    return reject("invalid-plan-identity", "The protected handoff draft does not match the canonical demo plan.");
  }

  const handoff = record as PilotDemoProtectedHandoff;
  if (generateScrimedAuditHash(handoffIdentity(handoff)) !== handoff.handoffFingerprint) {
    return reject("invalid-fingerprint", "The protected handoff draft fingerprint does not match its metadata.");
  }

  return {
    status: "accepted-metadata-draft",
    handoff: {
      ...handoff,
      validationStatus: "canonical-plan-identity-validated",
      evidenceStatus: "client-rehearsal-reference-not-independent-verification",
      canonicalDemoName: plan.demoName,
      canonicalAudienceLabel: plan.audienceLabel,
      canonicalFocusLabel: plan.focusLabel
    },
    plan,
    warning:
      "Canonical plan identity is valid. Preflight and rehearsal fingerprints remain client-origin references until an AAL2 operator reviews and records the session."
  };
}

export function buildPilotDemoProtectedHandoffRoute(handoff: PilotDemoProtectedHandoff) {
  const params = new URLSearchParams();
  params.set(pilotDemoProtectedHandoffQueryKeys.version, handoff.version);
  params.set(pilotDemoProtectedHandoffQueryKeys.source, handoff.source);
  params.set(pilotDemoProtectedHandoffQueryKeys.demoSlug, handoff.demoSlug);
  params.set(pilotDemoProtectedHandoffQueryKeys.audience, handoff.audience);
  params.set(pilotDemoProtectedHandoffQueryKeys.focus, handoff.focus);
  params.set(pilotDemoProtectedHandoffQueryKeys.durationMinutes, String(handoff.durationMinutes));
  params.set(pilotDemoProtectedHandoffQueryKeys.planId, handoff.planId);
  params.set(pilotDemoProtectedHandoffQueryKeys.planAuditHash, handoff.planAuditHash);
  params.set(pilotDemoProtectedHandoffQueryKeys.proofPreflightAuditHash, handoff.proofPreflightAuditHash);
  params.set(pilotDemoProtectedHandoffQueryKeys.rehearsalAuditHash, handoff.rehearsalAuditHash);
  params.set(pilotDemoProtectedHandoffQueryKeys.proofTargetCount, String(handoff.proofTargetCount));
  params.set(pilotDemoProtectedHandoffQueryKeys.readinessScore, String(handoff.readinessScore));
  params.set(pilotDemoProtectedHandoffQueryKeys.handoffFingerprint, handoff.handoffFingerprint);

  return `${pilotDemoProtectedHandoffBaseRoute}?${params.toString()}#${pilotDemoProtectedHandoffAnchor}`;
}

export function toPilotDemoProtectedHandoffCandidate(
  handoff: ValidatedPilotDemoProtectedHandoff
): PilotDemoProtectedHandoff {
  return {
    version: handoff.version,
    source: handoff.source,
    demoSlug: handoff.demoSlug,
    audience: handoff.audience,
    focus: handoff.focus,
    durationMinutes: handoff.durationMinutes,
    planId: handoff.planId,
    planAuditHash: handoff.planAuditHash,
    proofPreflightAuditHash: handoff.proofPreflightAuditHash,
    rehearsalAuditHash: handoff.rehearsalAuditHash,
    proofTargetCount: handoff.proofTargetCount,
    readinessScore: handoff.readinessScore,
    syntheticOnly: handoff.syntheticOnly,
    humanReviewRequired: handoff.humanReviewRequired,
    automaticPersistenceAuthorized: handoff.automaticPersistenceAuthorized,
    externalSendAuthorized: handoff.externalSendAuthorized,
    releaseAuthorityGranted: handoff.releaseAuthorityGranted,
    handoffFingerprint: handoff.handoffFingerprint
  };
}

export function parsePilotDemoProtectedHandoffQuery(
  query: string,
  catalog: PilotDemoSessionCatalogEntry[]
): PilotDemoProtectedHandoffValidation {
  if (!query) {
    return reject("missing-handoff", "No protected handoff metadata was supplied.");
  }

  if (query.length > pilotDemoProtectedHandoffMaximumQueryLength) {
    return reject("oversized-handoff", "The protected handoff metadata exceeds the maximum size.");
  }

  const params = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
  const receivedKeys = [...params.keys()];

  if (receivedKeys.some((key) => !expectedQueryKeys.includes(key))) {
    return reject("unknown-field", "The protected handoff URL contains an unsupported field.");
  }

  if (expectedQueryKeys.some((key) => params.getAll(key).length !== 1)) {
    return reject("duplicate-field", "The protected handoff URL is missing a field or contains duplicates.");
  }

  return validatePilotDemoProtectedHandoff(
    {
      version: params.get(pilotDemoProtectedHandoffQueryKeys.version),
      source: params.get(pilotDemoProtectedHandoffQueryKeys.source),
      demoSlug: params.get(pilotDemoProtectedHandoffQueryKeys.demoSlug),
      audience: params.get(pilotDemoProtectedHandoffQueryKeys.audience),
      focus: params.get(pilotDemoProtectedHandoffQueryKeys.focus),
      durationMinutes: Number(params.get(pilotDemoProtectedHandoffQueryKeys.durationMinutes)),
      planId: params.get(pilotDemoProtectedHandoffQueryKeys.planId),
      planAuditHash: params.get(pilotDemoProtectedHandoffQueryKeys.planAuditHash),
      proofPreflightAuditHash: params.get(pilotDemoProtectedHandoffQueryKeys.proofPreflightAuditHash),
      rehearsalAuditHash: params.get(pilotDemoProtectedHandoffQueryKeys.rehearsalAuditHash),
      proofTargetCount: Number(params.get(pilotDemoProtectedHandoffQueryKeys.proofTargetCount)),
      readinessScore: Number(params.get(pilotDemoProtectedHandoffQueryKeys.readinessScore)),
      syntheticOnly: true,
      humanReviewRequired: true,
      automaticPersistenceAuthorized: false,
      externalSendAuthorized: false,
      releaseAuthorityGranted: false,
      handoffFingerprint: params.get(pilotDemoProtectedHandoffQueryKeys.handoffFingerprint)
    },
    catalog
  );
}
