import { getScrimedWorkDurableStorageMode, isScrimedWorkDurableStoreEnabled } from "./durableStore";
import { getScrimedWorkFeatureFlags } from "./featureFlags";

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

export function getScrimedWorkProductionHardeningGate(
  env: NodeJS.ProcessEnv = process.env,
  generatedAt = "2026-07-13T00:00:00.000Z"
): ScrimedWorkProductionHardeningGate {
  const flags = getScrimedWorkFeatureFlags(env);
  const durableStoreEnabled = isScrimedWorkDurableStoreEnabled(env);
  const protectedWritesEnabled = envTrue("SCRIMED_WORK_PROTECTED_WRITES_ENABLED", env);
  const supabaseConfigured = envPresent("NEXT_PUBLIC_SUPABASE_URL", env) && envPresent("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", env);
  const runtimeTokenConfigured = envPresent("SCRIMED_PILOT_INTAKE_PERSISTENCE_TOKEN", env);
  const workspaceConfigured = envPresent("SCRIMED_WORKSPACE_SLUG", env) || envPresent("SCRIMED_WORK_DEFAULT_WORKSPACE_SLUG", env);
  const bearerProvided = envPresent("SCRIMED_BEARER_TOKEN", env);
  const migrationEvidenceId = nonsecretEvidenceId(env["SCRIMED_WORK_MIGRATION_EVIDENCE_ID"]);
  const migrationsVerified = envTrue("SCRIMED_WORK_MIGRATIONS_VERIFIED", env) && migrationEvidenceId.length > 0;

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
      status: "operator_required",
      severity: "critical",
      requiredFor: "Strict authenticated durable-store smoke.",
      evidence: bearerProvided
        ? ["SCRIMED_BEARER_TOKEN is present but must be verified by protected API during strict smoke."]
        : ["SCRIMED_BEARER_TOKEN is missing or expired."],
      blocker: bearerProvided ? "Protected API verification still required." : "Fresh tenant-admin, pilot-lead, or reviewer AAL2 bearer token required.",
      operatorAction: "Generate a fresh short-lived AAL2 bearer token immediately before strict smoke.",
      automationSafe: false,
      retainedBoundary: "A bearer token alone does not grant production authority or bypass tenant role checks."
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
        "supabase/migrations/20260709193000_scrimed_work_durable_store.sql exists",
        "supabase/migrations/20260713160000_scrimed_work_lifecycle_hardening.sql exists",
        "supabase/migrations/20260713163000_scrimed_work_advisor_index_hardening.sql exists",
        "scripts/scrimed-work-durable-store-preflight.mjs validates migration posture",
        ...(migrationsVerified ? [`migrationEvidenceId=${migrationEvidenceId}`] : [])
      ],
      blocker: migrationsVerified
        ? null
        : "All three ordered migrations must be applied and bound to reviewed, nonsecret evidence from an approved non-production target.",
      operatorAction: migrationsVerified
        ? "Retain migration history, RLS/grant checks, and post-migration advisor evidence with this release."
        : "Apply all three migrations in order to a non-production Supabase project/branch, run Supabase advisors, then set the verified flag and nonsecret evidence identifier.",
      automationSafe: false,
      retainedBoundary: "This code path does not mutate live Supabase, apply migrations, or approve production deployment."
    }),
    gate({
      gateId: "scrimed-work-canary-release",
      domain: "release-control",
      title: "No-PHI canary workspace",
      status: "operator_required",
      severity: "high",
      requiredFor: "Buyer-facing protected workflow readiness.",
      evidence: ["Canary requires strict preflight plus authenticated strict smoke success."],
      blocker: "Strict durable-store smoke has not been completed in an approved non-production target.",
      operatorAction: "Run one no-PHI protected workspace canary after strict smoke passes; collect evidence before buyer-facing mutations.",
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
    flags.consequentialActionsEnabled === false;

  return {
    service: "scrimed-work-production-hardening-gate",
    status: blocked > 0 ? "blocked" : operatorRequired > 0 ? "operator_action_required" : "evidence_ready",
    generatedAt,
    storageMode: getScrimedWorkDurableStorageMode(env),
    canRunStrictNonProductionSmoke,
    canaryEligible: false,
    noProductionAuthorization: true,
    noPhiAuthority: true,
    noAutonomousClinicalAuthority: true,
    summary: {
      totalGates: gates.length,
      evidenceReady,
      operatorRequired,
      blocked,
      automationSafeGates: gates.filter((item) => item.automationSafe).length
    },
    gates,
    nextOperatorActions: [
      "Refresh the short-lived AAL2 bearer token immediately before strict smoke.",
      "Configure non-production Supabase URL, publishable key, runtime authorization token, workspace slug, protected writes flag, and durable-store flag.",
      migrationsVerified
        ? `Retain reviewed migration evidence ${migrationEvidenceId} with the release packet.`
        : "Apply all three SCRIMED Work migrations in order only to an approved non-production Supabase target and bind the advisor review to a nonsecret evidence identifier.",
      "Run npm run smoke:scrimed-work:durable-store-preflight:strict.",
      "Run npm run smoke:scrimed-work:strict.",
      "Canary one no-PHI protected workspace and attach the evidence to buyer diligence materials."
    ],
    strictSmokeCommands: [
      "npm run smoke:scrimed-work:durable-store-preflight:strict",
      "npm run smoke:scrimed-work:strict"
    ],
    retainedBoundaries: [
      "No live PHI.",
      "No autonomous diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, or final imaging interpretation.",
      "No production connector approval, certification claim, clinical validation claim, or customer go-live claim.",
      "No secrets, bearer tokens, Supabase keys, raw connector payloads, or sensitive document text in logs, telemetry, tests, docs, or UI."
    ]
  };
}
