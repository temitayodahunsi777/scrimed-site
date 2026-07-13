#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import {
  aal2SignatureVerification,
  analyzeAal2BearerToken,
  formatAal2TokenReport,
  redactSensitive
} from "./lib/aal2-token-policy.mjs";
import { loadLocalEnv } from "./lib/local-env.mjs";

loadLocalEnv();

const strict = process.argv.includes("--strict");
const migrationPath = "supabase/migrations/20260709193000_scrimed_work_durable_store.sql";
const lifecycleMigrationPath = "supabase/migrations/20260713160000_scrimed_work_lifecycle_hardening.sql";
const advisorIndexMigrationPath = "supabase/migrations/20260713163000_scrimed_work_advisor_index_hardening.sql";
const requiredEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SCRIMED_PILOT_INTAKE_PERSISTENCE_TOKEN",
  "SCRIMED_WORK_PROTECTED_WRITES_ENABLED",
  "SCRIMED_WORK_DURABLE_STORE_ENABLED",
  "SCRIMED_WORK_MIGRATIONS_VERIFIED",
  "SCRIMED_WORK_MIGRATION_EVIDENCE_ID",
  "SCRIMED_WORKSPACE_SLUG"
];
const trueOnlyEnv = new Set([
  "SCRIMED_WORK_PROTECTED_WRITES_ENABLED",
  "SCRIMED_WORK_DURABLE_STORE_ENABLED",
  "SCRIMED_WORK_MIGRATIONS_VERIFIED"
]);

function hasEnv(name) {
  return typeof process.env[name] === "string" && process.env[name].trim().length > 0;
}

function check(condition, checkName, detail, severity = "required") {
  return {
    check: checkName,
    passed: Boolean(condition),
    severity,
    detail
  };
}

function requireIncludes(text, needle) {
  return text.includes(needle);
}

function requireRegex(text, pattern) {
  return pattern.test(text);
}

function summarizeEnvironment() {
  return Object.fromEntries(
    requiredEnv.map((name) => [
      name,
      trueOnlyEnv.has(name) ? process.env[name] === "true" : hasEnv(name)
    ])
  );
}

const migration = await readFile(migrationPath, "utf8");
const lifecycleMigration = await readFile(lifecycleMigrationPath, "utf8");
const advisorIndexMigration = await readFile(advisorIndexMigrationPath, "utf8");
const tokenAnalysis = analyzeAal2BearerToken({
  bearerToken: process.env.SCRIMED_BEARER_TOKEN,
  workspaceSlug: process.env.SCRIMED_WORKSPACE_SLUG ?? process.env.SCRIMED_WORK_DEFAULT_WORKSPACE_SLUG ?? ""
});
const checks = [
  check(requireIncludes(migration, "private.scrimed_work_sessions"), "migration-sessions-table", "Private session table exists."),
  check(requireIncludes(migration, "private.scrimed_work_artifacts"), "migration-artifacts-table", "Private artifact table exists."),
  check(requireIncludes(migration, "private.scrimed_work_audit_events"), "migration-audit-events-table", "Private audit event table exists."),
  check(requireRegex(migration, /alter table private\.scrimed_work_sessions enable row level security/i), "rls-sessions-enabled", "RLS is enabled for sessions."),
  check(requireRegex(migration, /alter table private\.scrimed_work_artifacts enable row level security/i), "rls-artifacts-enabled", "RLS is enabled for artifacts."),
  check(requireRegex(migration, /alter table private\.scrimed_work_audit_events enable row level security/i), "rls-audit-enabled", "RLS is enabled for audit events."),
  check(requireIncludes(migration, "create policy scrimed_work_sessions_deny_all"), "sessions-deny-policy", "Restrictive deny policy exists for sessions."),
  check(requireIncludes(migration, "create policy scrimed_work_artifacts_deny_all"), "artifacts-deny-policy", "Restrictive deny policy exists for artifacts."),
  check(requireIncludes(migration, "create policy scrimed_work_audit_events_deny_all"), "audit-deny-policy", "Restrictive deny policy exists for audit events."),
  check(requireIncludes(migration, "revoke all on private.scrimed_work_sessions from public, anon, authenticated"), "direct-session-access-revoked", "Direct session table access is revoked."),
  check(requireIncludes(migration, "private.require_governance_workspace"), "aal2-governance-workspace-gate", "RPCs delegate to the existing AAL2 governance workspace gate."),
  check(requireIncludes(migration, "private.reject_scrimed_work_prohibited_text"), "prohibited-content-guard", "SQL content guard blocks PHI/token-like values."),
  check(requireIncludes(migration, "public.record_scrimed_work_session"), "record-session-rpc", "Public record session RPC exists."),
  check(requireIncludes(migration, "public.get_scrimed_work_session"), "get-session-rpc", "Public get session RPC exists."),
  check(requireIncludes(migration, "public.transition_scrimed_work_session"), "transition-session-rpc", "Public transition session RPC exists."),
  check(requireIncludes(migration, "public.record_scrimed_work_artifact"), "record-artifact-rpc", "Public artifact RPC exists."),
  check(!/function public\.[\s\S]*?security definer/i.test(migration), "public-rpc-security-invoker-only", "Public RPC wrappers do not use SECURITY DEFINER."),
  check(requireRegex(migration, /security invoker/i), "public-rpc-security-invoker-present", "Public RPC wrappers use SECURITY INVOKER."),
  check(requireIncludes(migration, "grant execute on function public.record_scrimed_work_session"), "authenticated-execute-grant", "Authenticated execute grant exists for public wrapper."),
  check(!/service_role;\s*grant execute on function public/i.test(migration), "service-role-not-publicly-expanded", "Migration does not grant public wrappers to service_role."),
  check(requireIncludes(lifecycleMigration, "private.scrimed_work_transition_keys"), "lifecycle-idempotency-ledger", "Private transition idempotency ledger exists."),
  check(requireRegex(lifecycleMigration, /alter table private\.scrimed_work_transition_keys enable row level security/i), "lifecycle-ledger-rls", "RLS is enabled for the transition ledger."),
  check(requireIncludes(lifecycleMigration, "scrimed_work_transition_keys_deny_all"), "lifecycle-ledger-deny-policy", "Transition ledger has a restrictive deny policy."),
  check(requireIncludes(lifecycleMigration, "private.scrimed_work_transition_allowed"), "lifecycle-state-machine", "Database lifecycle state machine exists."),
  check(requireIncludes(lifecycleMigration, "for update"), "lifecycle-authoritative-lock", "Transitions lock the authoritative durable session."),
  check(requireIncludes(lifecycleMigration, "scrimed-work-status-history-conflict"), "lifecycle-append-only-history", "Append-only status history is enforced."),
  check(requireIncludes(lifecycleMigration, "scrimed-work-independent-reviewer-required"), "lifecycle-separation-of-duties", "Independent reviewer separation is enforced."),
  check(requireIncludes(lifecycleMigration, "idempotentReplay"), "lifecycle-idempotent-replay", "Transition replay returns explicit idempotency metadata."),
  check(requireIncludes(advisorIndexMigration, "scrimed_work_artifacts_tenant_created_idx"), "advisor-artifact-tenant-index", "Artifact tenant foreign key has a covering index."),
  check(requireIncludes(advisorIndexMigration, "scrimed_work_audit_events_tenant_created_idx"), "advisor-audit-tenant-index", "Audit tenant foreign key has a covering index."),
  check(requireIncludes(advisorIndexMigration, "scrimed_work_audit_events_artifact_idx"), "advisor-audit-artifact-index", "Audit artifact foreign key has a covering index.")
];

for (const name of requiredEnv) {
  const configured = hasEnv(name);
  const trueOnly = trueOnlyEnv.has(name);
  const enabledFlag = trueOnly ? process.env[name] === "true" : true;

  checks.push(
    check(
      configured && enabledFlag,
      `env-${name.toLowerCase()}`,
      trueOnly
        ? `${name} must be explicitly true for strict durable-store smoke.`
        : `${name} must be configured for strict durable-store smoke.`,
      "operator"
    )
  );
}

checks.push(
  check(
    tokenAnalysis.ok,
    "aal2-token-preflight",
    tokenAnalysis.ok
      ? `AAL2 token preflight passed: ${formatAal2TokenReport(tokenAnalysis)}`
      : `AAL2 token preflight not ready: ${tokenAnalysis.errors.join(" ")}`,
    "operator"
  )
);

const requiredFailures = checks.filter((item) => item.severity === "required" && !item.passed);
const operatorFailures = checks.filter((item) => item.severity === "operator" && !item.passed);
const status = requiredFailures.length > 0 ? "fail" : operatorFailures.length > 0 ? "operator-action-required" : "ready";
const report = {
  service: "scrimed-work-durable-store-preflight",
  status,
  strict,
  migrationPath,
  migrationPaths: [migrationPath, lifecycleMigrationPath, advisorIndexMigrationPath],
  environment: summarizeEnvironment(),
  token: {
    provided: hasEnv("SCRIMED_BEARER_TOKEN"),
    ok: tokenAnalysis.ok,
    fingerprint: tokenAnalysis.tokenFingerprint ?? "missing",
    signature: tokenAnalysis.ok
      ? aal2SignatureVerification.localPreflight
      : "not-verified-invalid-or-missing"
  },
  checks,
  next:
    status === "ready"
      ? "Reviewed non-production migration evidence is configured; run npm run smoke:scrimed-work:strict, then retain the no-PHI canary evidence."
      : "Configure missing operator inputs, confirm reviewed migration history and evidence for every SCRIMED Work migration on the approved no-PHI target, then rerun this preflight in strict mode.",
  boundaries: [
    "No secrets, bearer tokens, Supabase keys, PHI, raw connector payloads, or patient data are printed.",
    "This preflight does not apply migrations, mutate Supabase, approve production use, or authorize live clinical workflows."
  ]
};

console.log(redactSensitive(JSON.stringify(report, null, 2)));

if (requiredFailures.length > 0 || (strict && operatorFailures.length > 0)) {
  process.exit(1);
}
