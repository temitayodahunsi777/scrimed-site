#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const required = {
  "next.config.js": ["Content-Security-Policy", "worker-src 'self' blob:"],
  "app/lib/release/vercelReleaseAssurance.ts": ["getScrimedHealth", "getScrimedReleaseReadiness", "productionReleaseAuthorized: false"],
  "app/api/build-info/route.ts": ["getScrimedBuildInfo", "no-store"],
  "app/icon.svg": ["aria-label=\"SCRIMED\"", "#0b3d2a"],
  "app/lib/observability/logger.ts": ["redactForTelemetry", "no raw prompts"],
  "app/lib/reliability/errorBudget.ts": ["contractualSla: false", "p95-latency"],
  "scripts/verify-vercel-preview.mjs": ["CANDIDATE_SHA_MISMATCH", "DESKTOP_MOBILE_UI_EVIDENCE_REQUIRED", "--self-test"],
  "scripts/verify-supabase-security.mjs": ["RLS_NOT_ENABLED", "EXTERNAL_WARNING_OPEN", "SERVICE_ROLE_REFERENCE"],
  "tests/security/supabase-rls-contract.test.mjs": ["deny-by-default fixture", "client secret boundary"],
  "scripts/verify-migration-dry-run.mjs": ["DRY_RUN_PASSED", "indexesInspected", "constraintsInspected"],
  "scripts/verify-aal2-evidence.mjs": ["mfa-challenge", "replay-rejection", "privileged-endpoint"],
  "app/lib/evidence/publicSurfaceClaimRegistry.ts": ["MISSING_EVIDENCE", "publicationPermission", "registryFingerprint"],
  "app/lib/design-system/tokens.ts": ["minimumTouchTargetPx", "SPEC_READY_VIEW_ONLY_NO_CANVAS_MUTATION"],
  "artifacts/design/design-tokens.json": ["scrimed-design-system-v1-2026-08-12"],
  "artifacts/design/code-connect-manifest.json": ["READY_FOR_FIGMA_MAPPING", "figmaWritePerformed"],
  "app/lib/investorDemoRunOfShow.ts": ["technical-walkthrough", "30-minute diligence", "evidenceMap"],
  "scripts/rehearse-investor-demo.mjs": ["READY_FOR_BROWSER_REHEARSAL", "no-http-5xx"],
  "app/lib/proofPacketShareReadiness.ts": ["READY_FOR_AUTHORIZATION", "READY_FOR_AUTHORIZATION is not AUTHORIZED", "explicitDistributionAuthorizationVerified"],
  "app/lib/scrimed-control-plane/trustReadiness.ts": ["SECURITY_GATE_FAILED", "AAL2_EVIDENCE_REQUIRED", "PUBLIC_CLAIMS_GATE_FAILED"],
  "app/lib/scrimed-control-plane/platformGraph.ts": ["forbidden-dependency-cycle", "model-without-qualification-path", "route-without-capability"],
  "app/lib/scrimed-work/agentExecution.ts": ["createAgentRunControl", "checkpointAgentRun", "emergencyStopAgentRun"],
  "app/lib/scrimed-work/modelQualification.ts": ["scrimedModelBenchmarkLanes", "environment-flag-cannot-promote-model"],
  "app/lib/scrimed-control-plane/outcomeIntelligence.ts": ["verified-intelligence-yield", "SYNTHETIC MODEL - NOT AN OBSERVED CUSTOMER OUTCOME"],
  "docs/release/CURRENT_EXTERNAL_AND_REPOSITORY_BASELINE.md": ["Vercel", "Supabase", "Figma"],
  "docs/release/CANDIDATE_BRANCH_DECISION.md": ["agent/scrimed-enterprise-gap-closure"],
  "docs/release/ENTERPRISE_GAP_CLOSURE_COMMIT_MANIFEST.md": ["70 attributable", "does not include a Supabase setting change"],
  "docs/release/ENTERPRISE_GAP_CLOSURE_IMPLEMENTATION_REPORT.md": ["Distribution Lockbox", "Production promotion"],
  "docs/design/FIGMA_SYNC_SPEC.md": ["view-only", "Code Connect"],
  "docs/operators/VERCEL_PREVIEW_RELEASE_ASSURANCE.md": ["exact 40-character candidate", "does not authorize production"],
  "docs/operators/SEARCH_INDEX_RECONCILIATION.md": ["canonical", "reindexing"]
};

if ((await readFile("next.config.js", "utf8")).includes("prefetch-src")) {
  throw new Error("next.config.js contains obsolete CSP directive prefetch-src");
}

for (const [filePath, expectedValues] of Object.entries(required)) {
  const content = await readFile(filePath, "utf8");
  for (const expected of expectedValues) {
    if (!content.includes(expected)) throw new Error(`${filePath} missing enterprise gap-closure contract: ${expected}`);
  }
}

const packageJson = await readFile("package.json", "utf8");
for (const script of [
  "test:scrimed-enterprise-gap-closure",
  "contract:scrimed-enterprise-gap-closure",
  "verify:vercel-preview",
  "verify:supabase-security",
  "check:design-system-artifacts",
  "rehearse:investor-demo"
]) {
  if (!packageJson.includes(`\"${script}\"`)) throw new Error(`package.json missing ${script}`);
}

console.log(`pass SCRIMED enterprise gap-closure contract (${Object.keys(required).length} files verified)`);
