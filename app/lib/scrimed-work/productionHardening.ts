import { createHmac, timingSafeEqual } from "node:crypto";

import { getScrimedWorkDurableStorageMode, isScrimedWorkDurableStoreEnabled } from "./durableStore";
import {
  scrimedWorkCsrfBoundary,
  scrimedWorkCsrfPolicyVersion,
  scrimedWorkRequestContextHeader
} from "./csrfProtection";
import {
  getScrimedWorkCanaryAuthenticationMessage,
  getScrimedWorkRuntimeReleaseSha,
  isScrimedWorkCanaryEvidenceId,
  normalizeScrimedWorkCanaryTimestamp,
  normalizeScrimedWorkCanaryWorkspaceSlug,
  normalizeScrimedWorkReleaseSha,
  parseScrimedWorkCanaryEvidenceId,
  scrimedWorkCanaryClockSkewMinutes,
  scrimedWorkCanaryMaxAgeHours
} from "./canaryAttestation";
import { getScrimedWorkFeatureFlags } from "./featureFlags";
import {
  getScrimedWorkRateLimitPosture,
  scrimedWorkMutationRateLimitBoundary,
  scrimedWorkMutationRateLimitPolicyVersion,
  type ScrimedWorkRateLimitPosture
} from "./rateLimitPolicy";
import {
  getScrimedWorkMigrationSetStatus,
  SCRIMED_WORK_REQUIRED_MIGRATIONS,
  SCRIMED_WORK_REQUIRED_MIGRATION_SET_VERSION
} from "./migrationSet";

export type ScrimedWorkHardeningStatus =
  | "evidence_ready"
  | "operator_required"
  | "blocked"
  | "not_applicable";

export type ScrimedWorkHardeningGate = {
  gateId: string;
  domain:
    | "safety"
    | "auth"
    | "abuse-control"
    | "durable-store"
    | "operator-runtime"
    | "verification"
    | "release-control";
  title: string;
  status: ScrimedWorkHardeningStatus;
  severity: "low" | "medium" | "high" | "critical";
  requiredFor: string;
  evidence: string[];
  blocker: string | null;
  operatorAction: string;
  automationSafe: boolean;
  retainedBoundary: string;
};

export type ScrimedWorkProductionHardeningGate = {
  service: "scrimed-work-production-hardening-gate";
  status: "evidence_ready" | "operator_action_required" | "blocked";
  generatedAt: string;
  storageMode: string;
  canRunStrictNonProductionSmoke: boolean;
  canaryEligible: boolean;
  noProductionAuthorization: true;
  noPhiAuthority: true;
  noAutonomousClinicalAuthority: true;
  migrationSet: {
    requiredVersion: typeof SCRIMED_WORK_REQUIRED_MIGRATION_SET_VERSION;
    requiredCount: number;
    configuredCurrent: boolean;
    verified: boolean;
  };
  mutationRateLimit: ScrimedWorkRateLimitPosture;
  releaseBinding: {
    currentReleaseShaFingerprint: string;
    canaryReleaseShaFingerprint: string;
    evidenceIdFormatValid: boolean;
    evidenceIdAuthenticated: boolean;
    workspaceSlug: string;
    workspaceBound: boolean;
    completedAt: string | null;
    ageHours: number | null;
    maxAgeHours: typeof scrimedWorkCanaryMaxAgeHours;
    fresh: boolean;
    matched: boolean;
  };
  summary: {
    totalGates: number;
    evidenceReady: number;
    operatorRequired: number;
    blocked: number;
    automationSafeGates: number;
  };
  gates: ScrimedWorkHardeningGate[];
  nextOperatorActions: string[];
  strictSmokeCommands: string[];
  retainedBoundaries: string[];
};

function envPresent(name: string, env: NodeJS.ProcessEnv) {
  return typeof env[name] === "string" && env[name]?.trim().length > 0;
}

function envTrue(name: string, env: NodeJS.ProcessEnv) {
  return env[name] === "true";
}

function nonsecretEvidenceId(value: string | undefined) {
  const normalized = value?.trim() ?? "";
  return /^[a-z0-9][a-z0-9._:-]{7,120}$/i.test(normalized) ? normalized : "";
}

function gate(input: ScrimedWorkHardeningGate): ScrimedWorkHardeningGate {
  return input;
}

function verifyCanaryEvidenceAuthentication(input: {
  evidenceId: string;
  releaseSha: string;
  signingSecret: string;
  workspaceSlug: string;
  completedAt: string;
}) {
  const parsed = parseScrimedWorkCanaryEvidenceId(input.evidenceId);
  if (
    !parsed ||
    !input.releaseSha ||
    !input.workspaceSlug ||
    !input.completedAt ||
    input.signingSecret.length < 24
  ) return false;

  const expected = createHmac("sha256", input.signingSecret)
    .update(getScrimedWorkCanaryAuthenticationMessage({
      evidenceDigest: parsed.evidenceDigest,
      releaseSha: input.releaseSha,
      workspaceSlug: input.workspaceSlug,
      completedAt: input.completedAt
    }))
    .digest();
  const provided = Buffer.from(parsed.authenticationTag, "hex");
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}

function getCanaryFreshness(completedAt: string, evaluatedAt: string) {
  if (!completedAt || !evaluatedAt) {
    return { ageHours: null, fresh: false } as const;
  }

  const ageMs = Date.parse(evaluatedAt) - Date.parse(completedAt);
  const maxAgeMs = scrimedWorkCanaryMaxAgeHours * 60 * 60 * 1000;
  const clockSkewMs = scrimedWorkCanaryClockSkewMinutes * 60 * 1000;
  return {
    ageHours: Math.max(0, ageMs / (60 * 60 * 1000)),
    fresh: ageMs >= -clockSkewMs && ageMs <= maxAgeMs
  } as const;
}

export function getScrimedWorkProductionHardeningGate(
  env: NodeJS.ProcessEnv = process.env,
  generatedAt = new Date().toISOString()
): ScrimedWorkProductionHardeningGate {
  const evaluatedAt = normalizeScrimedWorkCanaryTimestamp(generatedAt) || new Date().toISOString();
  const flags = getScrimedWorkFeatureFlags(env);
  const mutationRateLimit = getScrimedWorkRateLimitPosture(env);
  const durableStoreEnabled = isScrimedWorkDurableStoreEnabled(env);
  const protectedWritesEnabled = envTrue("SCRIMED_WORK_PROTECTED_WRITES_ENABLED", env);
  const supabaseConfigured = envPresent("NEXT_PUBLIC_SUPABASE_URL", env) && envPresent("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", env);
  const runtimeToken = env["SCRIMED_PILOT_INTAKE_PERSISTENCE_TOKEN"] ?? "";
  const runtimeTokenConfigured = envPresent("SCRIMED_PILOT_INTAKE_PERSISTENCE_TOKEN", env);
  const workspaceConfigured = envPresent("SCRIMED_WORKSPACE_SLUG", env) || envPresent("SCRIMED_WORK_DEFAULT_WORKSPACE_SLUG", env);
  const canaryWorkspaceSlug = normalizeScrimedWorkCanaryWorkspaceSlug(
    env["SCRIMED_WORKSPACE_SLUG"]
  );
  const bearerProvided = envPresent("SCRIMED_BEARER_TOKEN", env);
  const reviewerBearerProvided = envPresent("SCRIMED_REVIEWER_BEARER_TOKEN", env);
  const migrationEvidenceId = nonsecretEvidenceId(env["SCRIMED_WORK_MIGRATION_EVIDENCE_ID"]);
  const migrationSetStatus = getScrimedWorkMigrationSetStatus(env);
  const migrationSetCurrent = migrationSetStatus.configuredCurrent;
  const reviewApprovalMigrationEvidenceId = nonsecretEvidenceId(
    env["SCRIMED_WORK_REVIEW_QUEUE_APPROVAL_MIGRATION_EVIDENCE_ID"]
  );
  const migrationsVerified = migrationSetStatus.verified;
  const twoIdentityCanaryEvidenceId =
    env["SCRIMED_WORK_TWO_IDENTITY_CANARY_EVIDENCE_ID"]?.trim() ?? "";
  const twoIdentityCanaryEvidenceIdValid = isScrimedWorkCanaryEvidenceId(
    twoIdentityCanaryEvidenceId
  );
  const currentReleaseSha = getScrimedWorkRuntimeReleaseSha(env);
  const twoIdentityCanaryReleaseSha = normalizeScrimedWorkReleaseSha(
    env["SCRIMED_WORK_TWO_IDENTITY_CANARY_RELEASE_SHA"]
  );
  const twoIdentityCanaryCompletedAt = normalizeScrimedWorkCanaryTimestamp(
    env["SCRIMED_WORK_TWO_IDENTITY_CANARY_COMPLETED_AT"]
  );
  const canaryFreshness = getCanaryFreshness(twoIdentityCanaryCompletedAt, evaluatedAt);
  const canaryReleaseMatches =
    currentReleaseSha.length > 0 &&
    twoIdentityCanaryReleaseSha.length > 0 &&
    currentReleaseSha === twoIdentityCanaryReleaseSha;
  const twoIdentityCanaryEvidenceIdAuthenticated = verifyCanaryEvidenceAuthentication({
    evidenceId: twoIdentityCanaryEvidenceId,
    releaseSha: twoIdentityCanaryReleaseSha,
    signingSecret: runtimeToken,
    workspaceSlug: canaryWorkspaceSlug,
    completedAt: twoIdentityCanaryCompletedAt
  });
  const twoIdentityCanaryVerified =
    envTrue("SCRIMED_WORK_TWO_IDENTITY_CANARY_VERIFIED", env) &&
    twoIdentityCanaryEvidenceIdValid &&
    twoIdentityCanaryEvidenceIdAuthenticated &&
    canaryWorkspaceSlug.length > 0 &&
    canaryFreshness.fresh &&
    canaryReleaseMatches;

  const gates: ScrimedWorkHardeningGate[] = [
    gate({
      gateId: "scrimed-work-boundary-controls",
      domain: "safety",
      title: "Safety boundaries remain enforced",
      status: "evidence_ready",
      severity: "critical",
      requiredFor: "Any SCRIMED Work demo, buyer diligence, or protected non-production smoke.",
      evidence: [
        "X-SCRIMED-Clinical-Care-Authority=not-authorized-live-care",
        "X-SCRIMED-EHR-Writeback=not-authorized",
        "X-SCRIMED-Payer-Submission=not-authorized",
        "X-SCRIMED-Consequential-Actions=disabled-by-default"
      ],
      blocker: null,
      operatorAction: "Keep boundary headers and fail-closed checks in every new SCRIMED Work route.",
      automationSafe: true,
      retainedBoundary: "No live PHI, autonomous clinical action, payer submission, EHR writeback, certification claim, or customer go-live authority."
    }),
    gate({
      gateId: "scrimed-work-browser-mutation-csrf",
      domain: "auth",
      title: "Browser mutation origin enforcement",
      status: "evidence_ready",
      severity: "critical",
      requiredFor: "Every protected SCRIMED Work browser mutation and non-browser release canary.",
      evidence: [
        `policyVersion=${scrimedWorkCsrfPolicyVersion}`,
        "browser mutations require an exact same-origin Origin header",
        "cross-origin, null-origin, navigational, and incomplete browser requests fail closed",
        `non-browser smoke requires ${scrimedWorkRequestContextHeader}=operator-smoke-v1`,
        "request provenance never replaces AAL2, RBAC, RLS, idempotency, or durable audit"
      ],
      blocker: null,
      operatorAction: "Keep protected browser mutations same-origin and add the fixed nonsecret request-context header only to approved CLI smoke clients.",
      automationSafe: true,
      retainedBoundary: scrimedWorkCsrfBoundary
    }),
    gate({
      gateId: "scrimed-work-distributed-mutation-rate-limit",
      domain: "abuse-control",
      title: "Actor and tenant mutation abuse controls",
      status: !mutationRateLimit.configurationValid
        ? "blocked"
        : mutationRateLimit.mode === "distributed-required" &&
            mutationRateLimit.distributedProviderConfigured
          ? "evidence_ready"
          : "operator_required",
      severity: "critical",
      requiredFor: "Every authenticated SCRIMED Work mutation in a production runtime.",
      evidence: [
        `policyVersion=${scrimedWorkMutationRateLimitPolicyVersion}`,
        `mode=${mutationRateLimit.mode}`,
        `actorLimit=${mutationRateLimit.actorLimit}/${mutationRateLimit.windowSeconds}s`,
        `tenantLimit=${mutationRateLimit.tenantLimit}/${mutationRateLimit.windowSeconds}s`,
        `distributedProviderConfigured=${mutationRateLimit.distributedProviderConfigured}`,
        `failClosedOnProviderUnavailable=${mutationRateLimit.failClosedOnProviderUnavailable}`,
        "stable tenant, workspace, and actor identifiers are hashed before counter storage",
        "production configuration cannot downgrade to bounded process memory"
      ],
      blocker: !mutationRateLimit.configurationValid
        ? "SCRIMED_WORK_RATE_LIMIT_MODE is invalid; protected mutations fail closed until configuration is corrected."
        : mutationRateLimit.mode !== "distributed-required"
          ? "Bounded process memory supports local/test validation only and does not establish distributed production enforcement."
          : mutationRateLimit.distributedProviderConfigured
            ? null
            : "The required distributed Upstash rate-limit provider is not configured; production mutations fail closed.",
      operatorAction:
        mutationRateLimit.mode === "distributed-required" &&
        mutationRateLimit.distributedProviderConfigured
          ? "Retain provider configuration evidence and verify allowed, exhausted, and provider-unavailable behavior in the release canary."
          : "Configure approved Upstash REST credentials and SCRIMED_WORK_RATE_LIMIT_MODE=distributed-required in the protected runtime; never expose provider tokens.",
      automationSafe: false,
      retainedBoundary: scrimedWorkMutationRateLimitBoundary
    }),
    gate({
      gateId: "scrimed-work-definition-of-done",
      domain: "verification",
      title: "Definition-of-Done and verification are mandatory",
      status: "evidence_ready",
      severity: "high",
      requiredFor: "Agentic session planning, artifact generation, and completion decisions.",
      evidence: [
        "DefinitionOfDoneContract",
        "verifyScrimedWorkResult",
        "detectDoomLoop",
        "human-approval-state check"
      ],
      blocker: null,
      operatorAction: "Keep completion blocked unless schema, citation, policy, rollback, budget, loop, and approval checks pass.",
      automationSafe: true,
      retainedBoundary: "An agent narrative alone is never sufficient proof of completion."
    }),
    gate({
      gateId: "scrimed-work-protected-writes-flag",
      domain: "operator-runtime",
      title: "Protected write feature flag",
      status: protectedWritesEnabled ? "evidence_ready" : "operator_required",
      severity: "high",
      requiredFor: "Authenticated protected session, transition, and artifact write smokes.",
      evidence: protectedWritesEnabled
        ? ["SCRIMED_WORK_PROTECTED_WRITES_ENABLED=true"]
        : ["Protected writes are currently disabled by default."],
      blocker: protectedWritesEnabled ? null : "SCRIMED_WORK_PROTECTED_WRITES_ENABLED is not true.",
      operatorAction: "Enable SCRIMED_WORK_PROTECTED_WRITES_ENABLED=true only in an approved non-production target.",
      automationSafe: false,
      retainedBoundary: "Protected writes cannot enable consequential clinical, payer, EHR, outreach, or customer go-live actions."
    }),
    gate({
      gateId: "scrimed-work-lifecycle-integrity",
      domain: "verification",
      title: "Authoritative lifecycle and independent review",
      status: "evidence_ready",
      severity: "critical",
      requiredFor: "Every protected session transition and completion decision.",
      evidence: [
        "evaluateWorkSessionTransition",
        "authoritative durable read before mutation",
        "database row lock and append-only status history",
        "tenant-scoped transition idempotency ledger",
        "independent reviewer separation of duties"
      ],
      blocker: null,
      operatorAction: "Keep the TypeScript policy and database transition matrix aligned through the lifecycle behavior test and migration preflight.",
      automationSafe: true,
      retainedBoundary: "High-risk clinical approval stays blocked until a separately verified clinician-reviewer identity can be bound."
    }),
    gate({
      gateId: "scrimed-work-artifact-review-binding",
      domain: "verification",
      title: "Durable independent artifact review binding",
      status: "evidence_ready",
      severity: "critical",
      requiredFor: "Verified internal completion of any protected SCRIMED Work artifact.",
      evidence: [
        "reviewer-only AAL2 durable RPC",
        "creator/reviewer separation of duties",
        "database-verifiable reviewer and decision hashes",
        "immutable artifact mutation scope",
        "mandatory verification before internal-use approval",
        "external distribution and payer submission fixed false"
      ],
      blocker: null,
      operatorAction: "Keep review and completion behind separate AAL2 reviewer identity, idempotency, authoritative durable state, and mandatory verification.",
      automationSafe: true,
      retainedBoundary: "Reviewed means verified for internal synthetic use only; it grants no payer, EHR, clinical, connector, external-distribution, certification, or go-live authority."
    }),
    gate({
      gateId: "scrimed-work-reviewer-queue",
      domain: "verification",
      title: "Reviewer-only artifact queue",
      status: "evidence_ready",
      severity: "critical",
      requiredFor: "Operationally usable separation of duties for protected SCRIMED Work artifacts.",
      evidence: [
        "reviewer-only AAL2 and tenant-scoped queue RPC",
        "bounded synthetic/no-PHI metadata response",
        "creator/reviewer exclusion in application and database policy",
        "audit event on every queue read",
        "no raw artifact payload or free-text reviewer input",
        "external distribution and payer submission fixed false"
      ],
      blocker: null,
      operatorAction: "Retain reviewer-queue migration and advisor evidence, then validate the queue with a separately enrolled reviewer identity.",
      automationSafe: true,
      retainedBoundary: "Queue visibility and internal review grant no live-PHI, clinical, payer, EHR, connector, external-distribution, certification, go-live, or production authority."
    }),
    gate({
      gateId: "scrimed-work-durable-store-flag",
      domain: "durable-store",
      title: "Durable store feature flag",
      status: durableStoreEnabled ? "evidence_ready" : "operator_required",
      severity: "high",
      requiredFor: "Supabase RPC-backed SCRIMED Work persistence.",
      evidence: durableStoreEnabled
        ? ["SCRIMED_WORK_DURABLE_STORE_ENABLED=true", `storageMode=${getScrimedWorkDurableStorageMode()}`]
        : ["Durable writes are currently using deterministic-in-memory-adapter."],
      blocker: durableStoreEnabled ? null : "SCRIMED_WORK_DURABLE_STORE_ENABLED is not true.",
      operatorAction: "Enable SCRIMED_WORK_DURABLE_STORE_ENABLED=true only after the non-production migration is applied.",
      automationSafe: false,
      retainedBoundary: "Durable persistence stores metadata-only sessions, artifacts, audit events, and verification evidence."
    }),
    gate({
      gateId: "scrimed-work-supabase-runtime",
      domain: "auth",
      title: "Supabase runtime configuration",
      status: supabaseConfigured ? "evidence_ready" : "operator_required",
      severity: "critical",
      requiredFor: "AAL2 RBAC/RLS protected durable-store smoke.",
      evidence: supabaseConfigured
        ? ["NEXT_PUBLIC_SUPABASE_URL configured", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY configured"]
        : ["Supabase URL and publishable key are missing locally."],
      blocker: supabaseConfigured ? null : "Supabase public runtime env is not configured for this local workspace.",
      operatorAction: "Configure only the approved non-production Supabase URL and publishable key.",
      automationSafe: false,
      retainedBoundary: "No Supabase service-role key or secret key may be exposed to browser code, logs, tests, or chat."
    }),
    gate({
      gateId: "scrimed-work-runtime-authorization-token",
      domain: "auth",
      title: "Server-held runtime authorization token",
      status: runtimeTokenConfigured ? "evidence_ready" : "operator_required",
      severity: "critical",
      requiredFor: "Protected Supabase RPC mutation routes.",
      evidence: runtimeTokenConfigured
        ? ["SCRIMED_PILOT_INTAKE_PERSISTENCE_TOKEN configured"]
        : ["Server runtime authorization token is missing locally."],
      blocker: runtimeTokenConfigured ? null : "SCRIMED_PILOT_INTAKE_PERSISTENCE_TOKEN is not configured.",
      operatorAction: "Set the runtime token through secure local or Vercel environment handling; never commit it.",
      automationSafe: false,
      retainedBoundary: "Token values are never printed, persisted in source, or included in telemetry."
    }),
    gate({
      gateId: "scrimed-work-aal2-operator-session",
      domain: "auth",
      title: "Fresh AAL2 operator bearer session",
      status: twoIdentityCanaryVerified ? "evidence_ready" : "operator_required",
      severity: "critical",
      requiredFor: "Strict authenticated durable-store smoke.",
      evidence: twoIdentityCanaryVerified
        ? [
            `twoIdentityCanaryEvidenceId=${twoIdentityCanaryEvidenceId}`,
            `releaseShaFingerprint=${currentReleaseSha.slice(0, 12)}`
          ]
        : bearerProvided
          ? ["SCRIMED_BEARER_TOKEN is present but must be verified by protected API during strict smoke."]
          : ["SCRIMED_BEARER_TOKEN is missing or expired."],
      blocker: twoIdentityCanaryVerified
        ? null
        : bearerProvided
          ? "Protected API verification still required."
          : "Fresh tenant-admin or pilot-lead AAL2 bearer token required.",
      operatorAction: twoIdentityCanaryVerified
        ? "Retain the protected two-identity canary evidence; refresh the operator token only for a new canary run."
        : "Generate a fresh short-lived tenant-admin or pilot-lead AAL2 bearer token immediately before strict smoke.",
      automationSafe: false,
      retainedBoundary: "A bearer token alone does not grant production authority or bypass tenant role checks."
    }),
    gate({
      gateId: "scrimed-work-aal2-reviewer-session",
      domain: "auth",
      title: "Distinct AAL2 reviewer bearer session",
      status: twoIdentityCanaryVerified ? "evidence_ready" : "operator_required",
      severity: "critical",
      requiredFor: "Reviewer-only queue, independent approval, artifact review, and completion evidence.",
      evidence: twoIdentityCanaryVerified
        ? [
            `twoIdentityCanaryEvidenceId=${twoIdentityCanaryEvidenceId}`,
            `releaseShaFingerprint=${currentReleaseSha.slice(0, 12)}`
          ]
        : reviewerBearerProvided
          ? ["SCRIMED_REVIEWER_BEARER_TOKEN is present but reviewer role and separation must be verified by protected API."]
          : ["A distinct SCRIMED_REVIEWER_BEARER_TOKEN is missing or expired."],
      blocker: twoIdentityCanaryVerified
        ? null
        : reviewerBearerProvided
          ? "Protected reviewer-role and different-user verification still required."
          : "A separately enrolled human reviewer with fresh AAL2 is required.",
      operatorAction: twoIdentityCanaryVerified
        ? "Retain the reviewer queue, approval, review, verification, and completion evidence."
        : "Enroll a genuinely separate reviewer, activate reviewer membership, then capture a fresh reviewer AAL2 token without printing it.",
      automationSafe: false,
      retainedBoundary: "Aliases, duplicated sessions, and a second token for the same user do not satisfy independent review."
    }),
    gate({
      gateId: "scrimed-work-workspace-scope",
      domain: "auth",
      title: "Tenant workspace scope",
      status: workspaceConfigured ? "evidence_ready" : "operator_required",
      severity: "high",
      requiredFor: "Tenant-isolated SCRIMED Work durable mutation routes.",
      evidence: workspaceConfigured
        ? ["SCRIMED_WORKSPACE_SLUG or SCRIMED_WORK_DEFAULT_WORKSPACE_SLUG configured"]
        : ["Workspace slug is missing."],
      blocker: workspaceConfigured ? null : "A tenant workspace slug is required.",
      operatorAction: "Set the approved non-production workspace slug, usually atlas-synthetic-evaluation.",
      automationSafe: false,
      retainedBoundary: "Cross-tenant context leakage remains prohibited."
    }),
    gate({
      gateId: "scrimed-work-migration-application",
      domain: "durable-store",
      title: "Non-production migration application",
      status: migrationsVerified ? "evidence_ready" : "operator_required",
      severity: "critical",
      requiredFor: "Real Supabase durable-store validation.",
      evidence: [
        `requiredMigrationSetVersion=${SCRIMED_WORK_REQUIRED_MIGRATION_SET_VERSION}`,
        `requiredMigrationCount=${SCRIMED_WORK_REQUIRED_MIGRATIONS.length}`,
        ...SCRIMED_WORK_REQUIRED_MIGRATIONS.map((path) => `${path} exists`),
        "scripts/scrimed-work-durable-store-preflight.mjs validates migration posture",
        ...(migrationsVerified
          ? [
              "configuredMigrationSetVersion=current",
              `migrationEvidenceId=${migrationEvidenceId}`,
              `reviewApprovalMigrationEvidenceId=${reviewApprovalMigrationEvidenceId}`
            ]
          : [])
      ],
      blocker: migrationsVerified
        ? null
        : migrationSetCurrent
          ? "All ten ordered migrations must be applied and bound to reviewed, nonsecret evidence from an approved no-PHI target."
          : `SCRIMED_WORK_MIGRATION_SET_VERSION must equal ${SCRIMED_WORK_REQUIRED_MIGRATION_SET_VERSION} after all ten migrations are reviewed.`,
      operatorAction: migrationsVerified
        ? "Retain migration history, RLS/grant checks, and post-migration advisor evidence with this release."
        : `Apply all ten migrations in order to an approved no-PHI Supabase project/branch, run Supabase advisors, then set SCRIMED_WORK_MIGRATION_SET_VERSION=${SCRIMED_WORK_REQUIRED_MIGRATION_SET_VERSION}, both migration verification flags, and the nonsecret evidence identifiers.`,
      automationSafe: false,
      retainedBoundary: "This code path does not mutate live Supabase, apply migrations, or approve production deployment."
    }),
    gate({
      gateId: "scrimed-work-canary-release",
      domain: "release-control",
      title: "No-PHI canary workspace",
      status: twoIdentityCanaryVerified ? "evidence_ready" : "operator_required",
      severity: "high",
      requiredFor: "Buyer-facing protected workflow readiness.",
      evidence: twoIdentityCanaryVerified
        ? [
            `twoIdentityCanaryEvidenceId=${twoIdentityCanaryEvidenceId}`,
            `releaseShaFingerprint=${currentReleaseSha.slice(0, 12)}`,
            `workspaceSlug=${canaryWorkspaceSlug}`,
            `completedAt=${twoIdentityCanaryCompletedAt}`,
            `ageHours=${canaryFreshness.ageHours?.toFixed(2) ?? "unavailable"}`,
            "The server-held runtime authority authenticated the evidence identifier without exposing its secret.",
            "Strict canary proved distinct users, reviewer-only queue access, self-approval denial, independent review, verification, and internal completion.",
            `Evidence is within the ${scrimedWorkCanaryMaxAgeHours}-hour promotion window.`
          ]
        : [
            "Canary requires strict preflight plus two-identity authenticated lifecycle success.",
            "Immutable completion evidence must derive a release-, workspace-, and freshness-bound canary identifier.",
            "The attested release SHA and workspace must match the current deployment.",
            `Completion evidence must be no older than ${scrimedWorkCanaryMaxAgeHours} hours.`
          ],
      blocker: twoIdentityCanaryVerified
        ? null
        : twoIdentityCanaryEvidenceIdValid && !twoIdentityCanaryCompletedAt
          ? "Canary completion timestamp is missing or malformed."
          : twoIdentityCanaryEvidenceIdValid && !canaryWorkspaceSlug
            ? "Canary evidence requires an explicit valid SCRIMED_WORKSPACE_SLUG."
          : twoIdentityCanaryEvidenceIdValid && !canaryReleaseMatches
          ? "Canary evidence is not bound to the exact current release SHA."
          : twoIdentityCanaryEvidenceIdValid && !twoIdentityCanaryEvidenceIdAuthenticated
            ? "Canary evidence was not authenticated by the current server-held runtime authority."
            : twoIdentityCanaryEvidenceIdValid && !canaryFreshness.fresh
              ? `Canary evidence is outside the ${scrimedWorkCanaryMaxAgeHours}-hour freshness window or is future-dated beyond clock-skew tolerance.`
              : "A protected two-identity lifecycle canary has not been bound to derived, authenticated, release-, workspace-, and freshness-specific nonsecret evidence.",
      operatorAction: twoIdentityCanaryVerified
        ? "Retain the nonsecret evidence identifier with release provenance; do not retain bearer tokens."
        : "Run one no-PHI protected workspace canary with distinct operator and reviewer identities, load its immutable completion evidence, and bind the derived evidence identifier, exact release SHA, workspace, and completion time before buyer-facing mutations.",
      automationSafe: false,
      retainedBoundary: "Canary success is not certification, clinical validation, production connector approval, or customer go-live."
    })
  ];

  const evidenceReady = gates.filter((item) => item.status === "evidence_ready").length;
  const operatorRequired = gates.filter((item) => item.status === "operator_required").length;
  const blocked = gates.filter((item) => item.status === "blocked").length;
  const canRunStrictNonProductionSmoke =
    protectedWritesEnabled &&
    durableStoreEnabled &&
    supabaseConfigured &&
    runtimeTokenConfigured &&
    workspaceConfigured &&
    migrationsVerified &&
    bearerProvided &&
    reviewerBearerProvided &&
    mutationRateLimit.readyForProtectedMutations &&
    flags.consequentialActionsEnabled === false;

  return {
    service: "scrimed-work-production-hardening-gate",
    status: blocked > 0 ? "blocked" : operatorRequired > 0 ? "operator_action_required" : "evidence_ready",
    generatedAt: evaluatedAt,
    storageMode: getScrimedWorkDurableStorageMode(env),
    canRunStrictNonProductionSmoke,
    canaryEligible: canRunStrictNonProductionSmoke,
    noProductionAuthorization: true,
    noPhiAuthority: true,
    noAutonomousClinicalAuthority: true,
    migrationSet: {
      requiredVersion: SCRIMED_WORK_REQUIRED_MIGRATION_SET_VERSION,
      requiredCount: SCRIMED_WORK_REQUIRED_MIGRATIONS.length,
      configuredCurrent: migrationSetCurrent,
      verified: migrationsVerified
    },
    mutationRateLimit,
    releaseBinding: {
      currentReleaseShaFingerprint: currentReleaseSha.slice(0, 12) || "unavailable",
      canaryReleaseShaFingerprint: twoIdentityCanaryReleaseSha.slice(0, 12) || "unavailable",
      evidenceIdFormatValid: twoIdentityCanaryEvidenceIdValid,
      evidenceIdAuthenticated: twoIdentityCanaryEvidenceIdAuthenticated,
      workspaceSlug: canaryWorkspaceSlug || "unavailable",
      workspaceBound: twoIdentityCanaryEvidenceIdAuthenticated && canaryWorkspaceSlug.length > 0,
      completedAt: twoIdentityCanaryCompletedAt || null,
      ageHours: canaryFreshness.ageHours,
      maxAgeHours: scrimedWorkCanaryMaxAgeHours,
      fresh: canaryFreshness.fresh,
      matched: canaryReleaseMatches
    },
    summary: {
      totalGates: gates.length,
      evidenceReady,
      operatorRequired,
      blocked,
      automationSafeGates: gates.filter((item) => item.automationSafe).length
    },
    gates,
    nextOperatorActions: [
      twoIdentityCanaryVerified
        ? `Retain reviewed two-identity canary evidence ${twoIdentityCanaryEvidenceId} for release ${currentReleaseSha.slice(0, 12)}.`
        : "Refresh short-lived AAL2 tokens for a tenant-admin or pilot-lead operator and a genuinely separate reviewer immediately before strict smoke, then derive the release-bound evidence identifier from the protected completion-evidence response.",
      "Configure non-production Supabase URL, publishable key, runtime authorization token, workspace slug, protected writes flag, and durable-store flag.",
      mutationRateLimit.mode === "distributed-required" && mutationRateLimit.distributedProviderConfigured
        ? "Retain distributed mutation rate-limit configuration evidence without recording provider credentials."
        : "Configure the distributed mutation rate-limit provider before any production protected-write target; local bounded-memory counters are non-production only.",
      migrationsVerified
        ? `Retain reviewed migration evidence ${migrationEvidenceId} with the release packet.`
        : `Apply all ten SCRIMED Work migrations in order only to an approved no-PHI Supabase target, set SCRIMED_WORK_MIGRATION_SET_VERSION=${SCRIMED_WORK_REQUIRED_MIGRATION_SET_VERSION}, and bind both migration reviews to nonsecret evidence identifiers.`,
      "Run npm run smoke:scrimed-work:durable-store-preflight:strict.",
      "Run npm run smoke:scrimed-work:strict.",
      "Run npm run smoke:scrimed-work:two-identity:strict and retain its no-secret audit identifiers.",
      "Bind successful two-identity evidence to SCRIMED_WORK_TWO_IDENTITY_CANARY_EVIDENCE_ID, SCRIMED_WORK_TWO_IDENTITY_CANARY_RELEASE_SHA, SCRIMED_WORK_TWO_IDENTITY_CANARY_COMPLETED_AT, and the explicit SCRIMED_WORKSPACE_SLUG before release promotion."
    ],
    strictSmokeCommands: [
      "npm run smoke:scrimed-work:durable-store-preflight:strict",
      "npm run smoke:scrimed-work:strict",
      "npm run smoke:scrimed-work:two-identity:strict"
    ],
    retainedBoundaries: [
      "No live PHI.",
      "No autonomous diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, or final imaging interpretation.",
      "No production connector approval, certification claim, clinical validation claim, or customer go-live claim.",
      "No secrets, bearer tokens, Supabase keys, raw connector payloads, or sensitive document text in logs, telemetry, tests, docs, or UI."
    ]
  };
}
