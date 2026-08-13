#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { inspectClientSecretExposure, inspectProtectedMigrationSql } from "../../scripts/verify-supabase-security.mjs";

const authorization = JSON.parse(await readFile("config/pending-migration-authorization.json", "utf8"));
for (const migration of authorization.migrations) {
  const report = inspectProtectedMigrationSql(await readFile(migration.path, "utf8"), migration.path);
  assert.deepEqual(report.findings, [], `${migration.path} violates the protected database contract`);
}

const tenantPolicyFixture = `
  create table if not exists private.synthetic_records (tenant_id uuid not null, id uuid primary key);
  alter table private.synthetic_records enable row level security;
  revoke all on table private.synthetic_records from public, anon, authenticated;
  create policy tenant_member_read on private.synthetic_records for select to authenticated
  using (tenant_id = auth.uid());
`;
assert.equal(inspectProtectedMigrationSql(tenantPolicyFixture).passed, true);
assert.ok(inspectProtectedMigrationSql("create table if not exists private.unsafe (id uuid);").findings.length > 0);
assert.deepEqual(inspectClientSecretExposure([{ path: "app/client.tsx", content: "const url = process.env.NEXT_PUBLIC_SUPABASE_URL" }]), []);
assert.ok(inspectClientSecretExposure([{ path: "app/client.tsx", content: "const secret = process.env.NEXT_PUBLIC_SUPABASE_ADMIN_SECRET" }]).length > 0);

console.log(`pass SCRIMED Supabase RLS contract tests (${authorization.migrations.length} pending migrations, deny-by-default fixture, client secret boundary)`);
