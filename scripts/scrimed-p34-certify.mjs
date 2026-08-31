#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
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
const npmCli = process.env.npm_execpath
  ?? resolve(dirname(process.execPath), "../lib/node_modules/npm/bin/npm-cli.js");
const env = {
  ...process.env,
  SCRIMED_RELEASE_CANDIDATE_BASE_REF: initialState.base,
  SCRIMED_SBOM_BASE_REF: initialState.base,
  CI: "1"
};
const checks = [];
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
  ["p34-gap-policy", process.execPath, [npmCli, "run", "test:scrimed-p34-gap-closure"]],
  ["p34-gap-contract", process.execPath, [npmCli, "run", "contract:scrimed-p34-gap-closure"]],
  ["p34-precision-policy", process.execPath, [npmCli, "run", "test:scrimed-p34-precision-wave"]],
  ["p34-precision-contract", process.execPath, [npmCli, "run", "contract:scrimed-p34-precision-wave"]],
  ["p34-post-review-policy", process.execPath, [npmCli, "run", "test:scrimed-p34-post-review-readiness"]],
  ["p34-post-review-contract", process.execPath, [npmCli, "run", "contract:scrimed-p34-post-review-readiness"]],
  ["p34-follow-on-contract", process.execPath, [npmCli, "run", "contract:scrimed-p34-follow-on"]],
  ["p34-adversarial-fuzz-concurrency", process.execPath, [npmCli, "run", "test:scrimed-p34-pilot-adversarial"]],
  ["product-console-payload-budget", process.execPath, [npmCli, "run", "test:product-console-payload-budget"]],
  ["p34-canary", process.execPath, ["scripts/scrimed-p34-canary.mjs"]],
  ["generated-integrity-prebuild", process.execPath, ["scripts/check-generated-integrity.mjs"]],
  ["typecheck", process.execPath, [npmCli, "run", "typecheck"]],
  ["lint", process.execPath, [npmCli, "run", "lint"]],
  ["nonsecret-suite", process.execPath, [npmCli, "run", "test:nonsecret"]],
  ["production-build", process.execPath, [npmCli, "run", "build"]],
  ["node24-certification", process.execPath, ["scripts/verify-node24-vercel-build.mjs"]],
  ["p34-build-inventory", process.execPath, ["scripts/generate-p34-build-inventory.mjs", "--check"]],
  ["local-public-smoke", process.execPath, ["scripts/scrimed-local-public-smoke-runner.mjs", "--port=3054"]],
  ["secret-scan", process.execPath, ["scripts/scrimed-secret-scan.mjs"]],
  ["dependency-audit", process.execPath, [npmCli, "audit", "--audit-level=moderate"]],
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
  supabaseLeakedPasswordProtectionOperatorActionRequired: true,
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
