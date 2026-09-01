#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import {
  evaluateP34CertificationCompletion,
  inspectP34CandidateState,
  sha256
} from "./lib/p34-candidate-state.mjs";

const maximumOutputBytes = 64 * 1024 * 1024;
const commandTimeoutMs = 30 * 60 * 1_000;

function run(id, command, args, env) {
  console.log(`run ${id}`);
  const result = spawnSync(command, args, {
    encoding: "utf8",
    shell: false,
    maxBuffer: maximumOutputBytes,
    timeout: commandTimeoutMs,
    env
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  const passed = result.status === 0 && !result.error;
  console.log(`${passed ? "pass" : "fail"} ${id}`);
  return {
    id,
    passed,
    exitCode: result.status ?? null,
    timedOut: result.signal === "SIGTERM",
    outputFingerprint: sha256(`${result.stdout ?? ""}\n${result.stderr ?? ""}`)
  };
}

const initialState = inspectP34CandidateState();
const env = {
  ...process.env,
  SCRIMED_RELEASE_CANDIDATE_BASE_REF: initialState.base,
  SCRIMED_SBOM_BASE_REF: initialState.base,
  CI: "1"
};
const checks = [];
const tsLoader = [
  "--disable-warning=ExperimentalWarning",
  "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
  "--experimental-loader=./scripts/lib/ts-extension-loader.mjs"
];
const npmAuditCli = process.env.SCRIMED_NPM_CLI_PATH ?? process.env.npm_execpath;
const dependencyAssuranceCommand = npmAuditCli
  ? ["dependency-audit", process.execPath, [npmAuditCli, "audit", "--audit-level=moderate"]]
  : ["dependency-security-floor", process.execPath, ["scripts/dependency-security-floor-contract-check.mjs"]];
const commands = [
  ["p34-follow-on-artifacts", process.execPath, ["scripts/generate-p34-follow-on-artifacts.mjs", "--check"]],
  ["p34-post-review-artifacts", process.execPath, ["scripts/generate-p34-post-review-artifacts.mjs", "--check"]],
  ["p34-generated-artifacts", process.execPath, [
    "--disable-warning=ExperimentalWarning",
    "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
    "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
    "scripts/scrimed-p34-artifacts.mjs",
    "--check"
  ]],
  ["p34-build-inventory-self-test", process.execPath, ["scripts/generate-p34-build-inventory.mjs", "--self-test"]],
  ["p34-gap-policy", process.execPath, [...tsLoader, "scripts/scrimed-p34-gap-closure-policy-test.mjs"]],
  ["p34-gap-contract", process.execPath, ["scripts/scrimed-p34-gap-closure-contract-check.mjs"]],
  ["p34-precision-policy", process.execPath, [...tsLoader, "scripts/scrimed-p34-precision-wave-policy-test.mjs"]],
  ["p34-precision-contract", process.execPath, ["scripts/scrimed-p34-precision-wave-contract-check.mjs"]],
  ["p34-post-review-policy", process.execPath, [...tsLoader, "scripts/scrimed-p34-post-review-readiness-policy-test.mjs"]],
  ["p34-post-review-contract", process.execPath, ["scripts/scrimed-p34-post-review-readiness-contract-check.mjs"]],
  ["p34-follow-on-contract", process.execPath, ["scripts/scrimed-p34-follow-on-contract-check.mjs"]],
  ["supabase-passwordless-policy", process.execPath, [...tsLoader, "scripts/supabase-passwordless-assurance-policy-test.mjs"]],
  ["supabase-passwordless-contract", process.execPath, ["scripts/supabase-passwordless-assurance-contract-check.mjs"]],
  ["commercial-conversion-assets", process.execPath, ["scripts/p34-commercial-conversion-assets-contract-check.mjs"]],
  ["p34-adversarial-fuzz-concurrency", process.execPath, [...tsLoader, "scripts/scrimed-p34-pilot-assurance-adversarial-test.mjs"]],
  ["product-console-payload-budget", process.execPath, [...tsLoader, "scripts/product-console-payload-budget-test.mjs"]],
  ["p34-canary", process.execPath, ["scripts/scrimed-p34-canary.mjs"]],
  ["generated-integrity-prebuild", process.execPath, ["scripts/check-generated-integrity.mjs"]],
  ["typecheck", process.execPath, ["node_modules/typescript/bin/tsc", "--noEmit"]],
  ["lint", process.execPath, ["node_modules/eslint/bin/eslint.js", "."]],
  ["nonsecret-suite", process.execPath, ["scripts/scrimed-nonsecret-test-suite.mjs"]],
  ["prebuild-cleanup", process.execPath, ["scripts/clean-generated-cache.mjs", "--preserve-next-cache"]],
  ["prebuild-provenance", process.execPath, ["scripts/release-provenance-preflight.mjs", "--deployment-aware"]],
  ["production-build", process.execPath, ["scripts/build-with-p34-inventory.mjs"]],
  ["generated-output-postflight", process.execPath, ["scripts/generated-output-postflight.mjs", "--repair-disposable-conflicts"]],
  ["built-public-release-verification", process.execPath, ["scripts/verify-public-release.mjs", "--require-build"]],
  ["node24-certification", process.execPath, ["scripts/verify-node24-vercel-build.mjs"]],
  ["p34-build-inventory", process.execPath, ["scripts/generate-p34-build-inventory.mjs", "--check"]],
  ["local-public-smoke", process.execPath, ["scripts/scrimed-local-public-smoke-runner.mjs", "--port=3054"]],
  ["secret-scan", process.execPath, ["scripts/scrimed-secret-scan.mjs"]],
  dependencyAssuranceCommand,
  ["sbom", process.execPath, ["scripts/scrimed-sbom.mjs", "--verify", `--base-ref=${initialState.base}`]],
  ["strict-candidate-validation", process.execPath, ["scripts/release-candidate-validation.mjs", "--strict"]],
  ["generated-integrity-postbuild", process.execPath, ["scripts/check-generated-integrity.mjs"]],
  ["git-diff-check", "git", ["diff", "--check"]]
];

for (const [id, command, args] of commands) {
  const result = run(id, command, args, env);
  checks.push(result);
  if (!result.passed) break;
}

const finalState = inspectP34CandidateState();
const { passed, sourceStable, cleanCandidate } = evaluateP34CertificationCompletion({
  checks,
  dependencyAssuranceMode: npmAuditCli ? "REGISTRY_AUDIT" : "STATIC_SECURITY_FLOOR",
  expectedCheckCount: commands.length,
  initialState,
  finalState
});
const reportBase = {
  schemaVersion: "scrimed-p34-certification-v1",
  status: passed ? "AUTOMATED_ASSURANCE_COMPLETE_HUMAN_REVIEW_REQUIRED" : "CERTIFICATION_FAILED_CLOSED",
  commit: finalState.commit,
  tree: finalState.tree,
  candidateFingerprint: finalState.candidateFingerprint,
  sourceFingerprint: finalState.sourceFingerprint,
  routeInventoryFingerprint: finalState.routeInventory?.inventoryFingerprint ?? null,
  generationInventoryFingerprint: finalState.generationInventory?.inventoryFingerprint ?? null,
  sourceStable,
  cleanCandidate,
  initialDirtyEntryCount: initialState.dirtyEntryCount,
  finalDirtyEntryCount: finalState.dirtyEntryCount,
  checks,
  humanReviewRequired: true,
  aal2OperatorEvidenceRequired: true,
  supabasePasswordlessProtectedAccess: "COMPENSATING_CONTROL_ACTIVE",
  supabaseLeakedPasswordProtection: "DEFERRED_PLATFORM_CONTROL",
  supabasePasswordAuthSemanticStatus: "DEFERRED_HARDENING_FOR_PASSWORD_AUTH",
  passwordAuthWithoutVerifiedLeakedPasswordProtection: "DENY",
  previewAcceptanceRequired: true,
  mergeAuthorityGranted: false,
  productionAuthorityGranted: false,
  migrationAuthorityGranted: false,
  phiAuthorityGranted: false,
  customerActivationAuthorized: false,
  boundary: "Automated local no-PHI certification only; no external or consequential authority is granted."
};
const deterministicCertification = {
  schemaVersion: reportBase.schemaVersion,
  status: reportBase.status,
  commit: reportBase.commit,
  tree: reportBase.tree,
  candidateFingerprint: reportBase.candidateFingerprint,
  sourceFingerprint: reportBase.sourceFingerprint,
  routeInventoryFingerprint: reportBase.routeInventoryFingerprint,
  generationInventoryFingerprint: reportBase.generationInventoryFingerprint,
  sourceStable: reportBase.sourceStable,
  cleanCandidate: reportBase.cleanCandidate,
  initialDirtyEntryCount: reportBase.initialDirtyEntryCount,
  finalDirtyEntryCount: reportBase.finalDirtyEntryCount,
  checks: reportBase.checks.map(({ id, passed: checkPassed, exitCode, timedOut }) => ({
    id,
    passed: checkPassed,
    exitCode,
    timedOut
  }))
};
const report = {
  ...reportBase,
  deterministicCertification,
  diagnosticOutputFingerprint: sha256(reportBase.checks.map(({ id, outputFingerprint }) => ({ id, outputFingerprint }))),
  certificationFingerprint: sha256(deterministicCertification)
};
await mkdir("artifacts/release", { recursive: true });
await writeFile("artifacts/release/p34-certification.json", `${JSON.stringify(report, null, 2)}\n`, "utf8");
if (!passed) process.exitCode = 1;
else console.log(`pass p.34 certification fingerprint=${report.certificationFingerprint}`);
