#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const migrationPath = "supabase/migrations/20260711224500_stored_vector_advisor_index_hardening.sql";
const vectorSchemaMigrationPath = "supabase/migrations/20260713190000_vector_extension_schema_hardening.sql";
const docsPath = "docs/supabase-advisor-remediation.md";
const requiredFiles = [
  migrationPath,
  vectorSchemaMigrationPath,
  docsPath,
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];
const files = Object.fromEntries(
  await Promise.all(requiredFiles.map(async (path) => [path, await readFile(path, "utf8")]))
);

function requireIncludes(path, expected) {
  if (!files[path].includes(expected)) {
    throw new Error(`${path} missing Supabase advisor remediation control: ${expected}`);
  }
}

for (const expected of [
  "begin;",
  "to_regclass('private.scrimed_stored_vectors')",
  "to_regclass('private.scrimed_stored_vector_lookup_events')",
  "scrimed_stored_vectors_created_by_idx",
  "on private.scrimed_stored_vectors(created_by)",
  "scrimed_stored_vector_events_tenant_idx",
  "on private.scrimed_stored_vector_lookup_events(tenant_id)",
  "commit;"
]) {
  requireIncludes(migrationPath, expected);
}

for (const expected of [
  "set local lock_timeout = '5s'",
  "set local statement_timeout = '30s'",
  "extension_relocatable",
  "alter extension vector set schema extensions",
  "scrimed-vector-extension-unexpected-schema",
  "scrimed-stored-vector-type-relocation-not-verified",
  "has_schema_privilege('anon', 'extensions', 'USAGE')",
  "has_schema_privilege('authenticated', 'extensions', 'USAGE')",
  "has_schema_privilege('service_role', 'extensions', 'USAGE')",
  "commit;"
]) {
  requireIncludes(vectorSchemaMigrationPath, expected);
}

for (const expected of [
  "Pro Plan and above",
  "not a SQL migration",
  "does not issue an automatic",
  "transactional relocation migration",
  "no longer reports `extension_in_public`",
  "auth_leaked_password_protection",
  "nonproduction",
  "rollback",
  "post-change verification",
  "no-PHI protected-pilot"
]) {
  requireIncludes(docsPath, expected);
}

requireIncludes("package.json", '"smoke:supabase-advisor-remediation": "node scripts/supabase-advisor-remediation-contract-check.mjs"');
requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", "scripts/supabase-advisor-remediation-contract-check.mjs");

console.log(`pass SCRIMED Supabase advisor remediation contract check (${requiredFiles.length} files verified)`);
