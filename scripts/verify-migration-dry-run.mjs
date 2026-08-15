#!/usr/bin/env node

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const rawArgs = process.argv.slice(2);
const flags = new Set(rawArgs.filter((arg) => !arg.includes("=")));
const allowedFlags = new Set(["--self-test", "--execute", "--strict", "--json"]);
const unknown = [...flags].filter((flag) => !allowedFlags.has(flag));
if (unknown.length) throw new Error(`Unsupported migration dry-run option: ${unknown.join(", ")}`);

const valueArg = (name, fallback) =>
  rawArgs.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const canonicalHash = (value) => sha256(JSON.stringify(value));

export function validateDisposableDatabaseUrl(value, explicitDisposableMarker) {
  const parsed = new URL(value);
  const localHost = new Set(["127.0.0.1", "localhost", "postgres"]).has(parsed.hostname);
  const disposableName = /^scrimed_(?:migration_)?(?:ci|test|disposable)/.test(parsed.pathname.slice(1));
  if (
    !new Set(["postgres:", "postgresql:"]).has(parsed.protocol) ||
    !localHost ||
    !disposableName ||
    explicitDisposableMarker !== "true"
  ) {
    throw new Error("Migration dry-run refuses nonlocal or non-disposable database targets.");
  }
  return parsed.toString();
}

async function collectMigrations() {
  const names = (await readdir("supabase/migrations"))
    .filter((name) => /^\d+_[A-Za-z0-9_]+\.sql$/.test(name))
    .sort();
  return Promise.all(
    names.map(async (name) => {
      const migrationPath = `supabase/migrations/${name}`;
      const sql = await readFile(migrationPath, "utf8");
      return { name, path: migrationPath, sql, sha256: sha256(sql) };
    })
  );
}

export function verifyPendingMigrationChecksums(migrations, authorization) {
  const byPath = new Map(migrations.map((migration) => [migration.path, migration]));
  const mismatches = authorization.migrations
    .filter((entry) => byPath.get(entry.path)?.sha256 !== entry.sha256)
    .map((entry) => entry.path);
  const ordered = authorization.migrations.every(
    (entry, index, entries) => index === 0 || entries[index - 1].path < entry.path
  );
  return { valid: ordered && mismatches.length === 0, ordered, mismatches };
}

function runPsql(databaseUrl, args, input = null) {
  const result = spawnSync("psql", [databaseUrl, "--set", "ON_ERROR_STOP=1", ...args], {
    encoding: "utf8",
    input,
    maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, PGPASSWORD: new URL(databaseUrl).password }
  });
  if (result.status !== 0) {
    throw new Error(`Disposable migration command failed: ${result.stderr.trim() || result.stdout.trim()}`);
  }
  return result.stdout.trim();
}

const bootstrapSql = `
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end $$;
create schema if not exists auth;
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create table if not exists auth.users (
  id uuid primary key default extensions.gen_random_uuid(),
  email text,
  created_at timestamptz not null default now()
);
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
create or replace function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb)
$$;
`;

function applyMigrations(databaseUrl, migrations) {
  runPsql(databaseUrl, ["--command", bootstrapSql]);
  for (const migration of migrations) runPsql(databaseUrl, ["--file", migration.path]);
}

function inspectSchema(databaseUrl) {
  const rows = runPsql(databaseUrl, [
    "--tuples-only",
    "--no-align",
    "--field-separator=|",
    "--command",
    `select 'tables', count(*) from pg_tables where schemaname in ('public','auth')
     union all select 'indexes', count(*) from pg_indexes where schemaname in ('public','private','auth')
     union all select 'constraints', count(*) from pg_constraint c join pg_namespace n on n.oid=c.connamespace where n.nspname in ('public','private','auth')
     union all select 'grants', count(*) from information_schema.role_table_grants where table_schema in ('public','private')
     union all select 'rls', count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','private') and c.relrowsecurity
     union all select 'functions', count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','auth')
     union all select 'triggers', count(*) from pg_trigger where not tgisinternal
     union all select 'policies', count(*) from pg_policies where schemaname in ('public','private')
     order by 1;`
  ]);
  const summary = Object.fromEntries(
    rows.split(/\r?\n/).filter(Boolean).map((line) => {
      const [key, value] = line.split("|");
      return [key, Number(value)];
    })
  );
  return { summary, fingerprint: canonicalHash(summary) };
}

function resetDisposableSchema(databaseUrl) {
  runPsql(databaseUrl, [
    "--command",
    "drop schema if exists public cascade; drop schema if exists private cascade; drop schema if exists auth cascade; drop schema if exists extensions cascade; create schema public; grant all on schema public to public;"
  ]);
}

if (flags.has("--self-test")) {
  assert.throws(() => validateDisposableDatabaseUrl("postgres://prod.example.com/prod", "true"));
  assert.throws(() => validateDisposableDatabaseUrl("postgres://localhost/scrimed_migration_ci", "false"));
  assert.equal(
    validateDisposableDatabaseUrl("postgres://postgres:postgres@localhost:5432/scrimed_migration_ci", "true").includes("localhost"),
    true
  );
  const migrations = [{ path: "supabase/migrations/1_a.sql", sha256: "a".repeat(64) }];
  assert.equal(
    verifyPendingMigrationChecksums(migrations, {
      migrations: [{ path: "supabase/migrations/1_a.sql", sha256: "a".repeat(64) }]
    }).valid,
    true
  );
  console.log("pass SCRIMED migration dry-run verifier self-test");
  process.exit(0);
}

const migrations = await collectMigrations();
const authorization = JSON.parse(await readFile("config/pending-migration-authorization.json", "utf8"));
const pendingChecksums = verifyPendingMigrationChecksums(migrations, authorization);
if (!pendingChecksums.valid) throw new Error(`Pending migration checksum/order mismatch: ${pendingChecksums.mismatches.join(",")}`);

if (!flags.has("--execute")) {
  console.error("blocked migration dry run: use --execute only inside an approved disposable environment.");
  process.exit(2);
}

const databaseUrl = validateDisposableDatabaseUrl(
  process.env.SCRIMED_DISPOSABLE_DATABASE_URL ?? "",
  process.env.SCRIMED_DISPOSABLE_DATABASE
);
applyMigrations(databaseUrl, migrations);
const initialSchema = inspectSchema(databaseUrl);
resetDisposableSchema(databaseUrl);
applyMigrations(databaseUrl, migrations);
const recoveredSchema = inspectSchema(databaseUrl);
const forwardRecoveryVerified = initialSchema.fingerprint === recoveredSchema.fingerprint;
const generatedAt = new Date().toISOString();
const report = {
  schemaVersion: "scrimed-disposable-migration-dry-run-v2-2026-08-12",
  status: forwardRecoveryVerified ? "DISPOSABLE_DRY_RUN_PASSED" : "DISPOSABLE_DRY_RUN_FAILED",
  generatedAt,
  databaseTargetClass: "local-disposable-postgresql",
  migrationCount: migrations.length,
  migrationSetFingerprint: canonicalHash(migrations.map(({ path: migrationPath, sha256: hash }) => ({ path: migrationPath, sha256: hash }))),
  pendingMigrationChecksums: pendingChecksums,
  pendingMigrations: authorization.migrations.map((entry) => ({
    path: entry.path,
    sha256: entry.sha256,
    classification: forwardRecoveryVerified ? "DRY_RUN_PASSED" : "NEEDS_REVISION"
  })),
  initialSchema,
  recoveredSchema,
  forwardMigrationPassed: true,
  forwardRecoveryVerified,
  rlsInspected: (recoveredSchema.summary.rls ?? 0) > 0,
  policiesInspected: (recoveredSchema.summary.policies ?? 0) > 0,
  indexesInspected: Number.isFinite(recoveredSchema.summary.indexes),
  constraintsInspected: Number.isFinite(recoveredSchema.summary.constraints),
  grantsInspected: Number.isFinite(recoveredSchema.summary.grants),
  functionsInspected: Number.isFinite(recoveredSchema.summary.functions),
  triggersInspected: Number.isFinite(recoveredSchema.summary.triggers),
  productionConnectionUsed: false,
  productionMigrationAuthorized: false
};
const outputPath = path.resolve(valueArg("output", "artifacts/migrations/migration-dry-run.json"));
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
if (flags.has("--json")) console.log(JSON.stringify(report, null, 2));
else console.log(`pass SCRIMED disposable migration dry run migrations=${migrations.length} recovery=${forwardRecoveryVerified}`);
if (flags.has("--strict") && !forwardRecoveryVerified) process.exitCode = 1;
