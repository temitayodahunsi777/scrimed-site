#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "supabase/migrations/20260630173000_scrimed_stored_vector_lookup_rpc.sql",
  "app/lib/scrimedStrategicExecutionLayer.ts",
  "app/api/scrimed-build-roadmap/stored-vector-rpc-smoke/route.ts",
  "app/scrimed-build-roadmap/page.tsx",
  "docs/scrimed-build-roadmap.md",
  "package.json",
  "scripts/scrimed-stored-vector-rpc-authenticated-smoke.mjs",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required SCRIMED stored-vector RPC text: ${expected}`);
  }
}

function requireExcludes(path, text, prohibited) {
  if (text.includes(prohibited)) {
    throw new Error(`${path} contains prohibited SCRIMED stored-vector RPC text: ${prohibited}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const migration = files["supabase/migrations/20260630173000_scrimed_stored_vector_lookup_rpc.sql"];
const source = files["app/lib/scrimedStrategicExecutionLayer.ts"];
const apiRoute = files["app/api/scrimed-build-roadmap/stored-vector-rpc-smoke/route.ts"];
const page = files["app/scrimed-build-roadmap/page.tsx"];
const docs = files["docs/scrimed-build-roadmap.md"];
const packageJson = files["package.json"];
const authenticatedSmoke = files["scripts/scrimed-stored-vector-rpc-authenticated-smoke.mjs"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "create extension if not exists vector",
  "private.scrimed_stored_vectors",
  "private.scrimed_stored_vector_lookup_events",
  "embedding vector(1536) not null",
  "using hnsw (embedding vector_cosine_ops)",
  "alter table private.scrimed_stored_vectors enable row level security",
  "scrimed_stored_vectors_deny_all",
  "using (false)",
  "with check (false)",
  "revoke all on private.scrimed_stored_vectors from public, anon, authenticated",
  "revoke all on private.scrimed_stored_vector_lookup_events from public, anon, authenticated",
  "private.scrimed_stored_vector_lookup_boundary",
  "private.reject_scrimed_stored_vector_prohibited_text",
  "private.register_scrimed_synthetic_stored_vector",
  "private.search_scrimed_stored_vectors",
  "public.register_scrimed_synthetic_stored_vector",
  "public.scrimed_match_stored_vector",
  "public.scrimed_search_similar_documents",
  "public.scrimed_search_clinical_evidence",
  "public.scrimed_search_payer_policy",
  "public.scrimed_search_recommendation_memory",
  "private.has_valid_governance_session()",
  "private.require_sales_server_token()",
  "private.require_governance_workspace",
  "private.has_pilot_role",
  "array['tenant-admin', 'pilot-lead']",
  "array['tenant-admin', 'pilot-lead', 'reviewer']",
  "synthetic_only boolean not null default true check (synthetic_only)",
  "no_phi_assertion boolean not null default true check (no_phi_assertion)",
  "human_review_required boolean not null default true check (human_review_required)",
  "not-authorized-production-phi",
  "not-authorized-live-care",
  "recommendation-only-human-review",
  "stored-vector-search-executed",
  "stored-vector-registered",
  "embeddingReturned', false",
  "No raw embeddings, PHI, secrets, or connector payloads are logged",
  "No live identity resolution authority",
  "not for diagnosis, treatment, prescribing, or live patient care",
  "no prior-auth submission, appeal filing, or coverage guarantee",
  "Human review remains required",
  "grant execute on function public.scrimed_match_stored_vector",
  "grant execute on function public.scrimed_search_recommendation_memory",
  "security invoker"
]) {
  requireIncludes("supabase/migrations/20260630173000_scrimed_stored_vector_lookup_rpc.sql", migration, expected);
}

for (const expected of [
  "patient-matching",
  "document-similarity",
  "clinical-retrieval",
  "payer-policy-lookup",
  "recommendation-search"
]) {
  requireIncludes("supabase/migrations/20260630173000_scrimed_stored_vector_lookup_rpc.sql", migration, expected);
}

for (const prohibited of [
  "grant select on private.scrimed_stored_vectors",
  "grant insert on private.scrimed_stored_vectors",
  "grant update on private.scrimed_stored_vectors",
  "grant delete on private.scrimed_stored_vectors",
  "grant select on private.scrimed_stored_vector_lookup_events",
  "grant insert on private.scrimed_stored_vector_lookup_events",
  "clinicalCareAuthority', 'authorized",
  "phi_authority text not null default 'authorized",
  "returns table (embedding"
]) {
  requireExcludes("supabase/migrations/20260630173000_scrimed_stored_vector_lookup_rpc.sql", migration, prohibited);
}

for (const expected of [
  "storedVectorLookupBackendReadiness",
  "migration-applied-live-db-verified",
  "20260630173000_scrimed_stored_vector_lookup_rpc.sql",
  "Private-schema synthetic/no-PHI pgvector registry",
  "register_scrimed_synthetic_stored_vector",
  "scrimed_search_recommendation_memory",
  "AAL2 governance session required",
  "Run the authenticated stored-vector RPC smoke"
]) {
  requireIncludes("app/lib/scrimedStrategicExecutionLayer.ts", source, expected);
}

for (const expected of [
  "getAuthenticatedGovernanceContext",
  "register_scrimed_synthetic_stored_vector",
  "scrimed_search_similar_documents",
  "stored-vector-rpc-smoke-passed",
  "X-SCRIMED-Embedding-Return",
  "embeddingReturned: false",
  "synthetic/no-PHI only",
  "no raw embedding",
  "tenant-admin or pilot-lead",
  "reviewer-readable",
  "humanReviewRequired: true",
  "scrimedSafetyHeaders",
  "enforceRequestRateLimit"
]) {
  requireIncludes("app/api/scrimed-build-roadmap/stored-vector-rpc-smoke/route.ts", apiRoute, expected);
}

for (const expected of [
  "Stored-vector lookup backend RPCs",
  "storedVectorLookupBackendReadiness",
  "pendingOperationalStep"
]) {
  requireIncludes("app/scrimed-build-roadmap/page.tsx", page, expected);
}

for (const expected of [
  "Stored-Vector Lookup Backend",
  "20260630173000_scrimed_stored_vector_lookup_rpc.sql",
  "Migration applied and structurally verified",
  "/api/scrimed-build-roadmap/stored-vector-rpc-smoke",
  "deny-all RLS",
  "no raw embedding return",
  "stale operator credentials",
  "does not activate live PHI"
]) {
  requireIncludes("docs/scrimed-build-roadmap.md", docs, expected);
}

requireIncludes(
  "package.json",
  packageJson,
  "\"smoke:scrimed-stored-vector-rpc\": \"node scripts/scrimed-stored-vector-rpc-contract-check.mjs\""
);

requireIncludes(
  "package.json",
  packageJson,
  "\"smoke:scrimed-stored-vector-rpc:authenticated\": \"node scripts/scrimed-stored-vector-rpc-authenticated-smoke.mjs\""
);

requireIncludes(
  "package.json",
  packageJson,
  "\"smoke:scrimed-stored-vector-rpc:strict\": \"node scripts/scrimed-stored-vector-rpc-authenticated-smoke.mjs --strict\""
);

for (const expected of [
  "SCRIMED_BEARER_TOKEN",
  "analyzeAal2BearerToken",
  "pass unauthenticated stored-vector RPC smoke fail-closed",
  "skip authenticated stored-vector RPC happy path: ${redactSensitive(tokenFailureMessage)}",
  "stored-vector-rpc-smoke-passed",
  "embeddingReturned !== false",
  "targetMatchScore",
  "redactSensitive"
]) {
  requireIncludes("scripts/scrimed-stored-vector-rpc-authenticated-smoke.mjs", authenticatedSmoke, expected);
}

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/scrimed-stored-vector-rpc-contract-check.mjs"
);

console.log("pass SCRIMED stored-vector RPC contract check");
