#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const args = new Set(process.argv.slice(2));
const allowedArgs = new Set(["--strict", "--deployment-aware", "--self-test", "--json"]);
const unknownArgs = [...args].filter((arg) => !allowedArgs.has(arg));

if (unknownArgs.length > 0) {
  throw new Error(`Unsupported release provenance option: ${unknownArgs.join(", ")}`);
}

function isSha(value) {
  return typeof value === "string" && /^[0-9a-f]{40}$/i.test(value);
}

export function evaluateReleaseProvenance(input) {
  const production = input.vercelEnvironment === "production";
  const mustBeClean = input.strict || input.ci || production;
  const checks = [
    {
      id: "git-repository-present",
      required: mustBeClean,
      passed: input.gitAvailable,
      detail: input.gitAvailable ? "Git metadata is available." : "Git metadata is unavailable."
    },
    {
      id: "working-tree-clean",
      required: mustBeClean,
      passed: input.gitAvailable && input.dirtyEntryCount === 0,
      detail: input.dirtyEntryCount === 0
        ? "Working tree is clean."
        : `Working tree contains ${input.dirtyEntryCount} modified or untracked entries.`
    },
    {
      id: "head-sha-valid",
      required: mustBeClean,
      passed: isSha(input.headSha),
      detail: isSha(input.headSha) ? "HEAD is an immutable Git SHA." : "HEAD SHA is unavailable or invalid."
    },
    {
      id: "github-sha-matches-head",
      required: input.ci,
      passed: !input.ci || (isSha(input.githubSha) && input.githubSha === input.headSha),
      detail: !input.ci
        ? "Not evaluated outside CI."
        : input.githubSha === input.headSha
          ? "GitHub workflow SHA matches HEAD."
          : "GitHub workflow SHA does not match HEAD."
    },
    {
      id: "production-attestation-enabled",
      required: production,
      passed: !production || input.provenanceEnforced,
      detail: !production
        ? "Not evaluated outside a Vercel production build."
        : input.provenanceEnforced
          ? "Production release attestation is enabled."
          : "SCRIMED_RELEASE_PROVENANCE_ENFORCED must be true for production."
    },
    {
      id: "approved-release-sha-valid",
      required: production,
      passed: !production || isSha(input.approvedReleaseSha),
      detail: !production
        ? "Not evaluated outside a Vercel production build."
        : isSha(input.approvedReleaseSha)
          ? "Approved release SHA is present."
          : "SCRIMED_APPROVED_RELEASE_SHA must be a full 40-character SHA."
    },
    {
      id: "vercel-sha-matches-approved-release",
      required: production,
      passed: !production || (
        isSha(input.vercelGitCommitSha)
        && input.vercelGitCommitSha === input.approvedReleaseSha
        && (!isSha(input.headSha) || input.headSha === input.vercelGitCommitSha)
      ),
      detail: !production
        ? "Not evaluated outside a Vercel production build."
        : input.vercelGitCommitSha === input.approvedReleaseSha
          ? "Vercel commit SHA matches the approved release SHA."
          : "Vercel commit SHA does not match the approved release SHA."
    },
    {
      id: "production-main-branch-only",
      required: production,
      passed: !production || input.vercelGitCommitRef === "main",
      detail: !production
        ? "Not evaluated outside a Vercel production build."
        : input.vercelGitCommitRef === "main"
          ? "Production build targets main."
          : "Production builds are restricted to main."
    }
  ];
  const failedRequiredChecks = checks.filter((check) => check.required && !check.passed);
  const sourceReady = input.gitAvailable && input.dirtyEntryCount === 0 && isSha(input.headSha);
  const releasePromotionAllowed = sourceReady && failedRequiredChecks.length === 0;

  return {
    service: "scrimed-release-provenance-preflight",
    status: releasePromotionAllowed
      ? "release-provenance-satisfied"
      : failedRequiredChecks.length > 0
        ? "release-provenance-blocked"
        : "release-provenance-observed-drift",
    allowed: failedRequiredChecks.length === 0,
    releasePromotionAllowed,
    mode: production ? "vercel-production" : input.ci ? "ci" : input.strict ? "local-strict" : "local-report-only",
    headFingerprint: isSha(input.headSha) ? input.headSha.slice(0, 12) : "unavailable",
    dirtyEntryCount: input.dirtyEntryCount,
    checks,
    failedRequiredChecks: failedRequiredChecks.map((check) => check.id),
    secretsPrinted: false,
    productionMutationPerformed: false,
    boundary: "Release provenance verifies source identity only. It does not commit, push, deploy, migrate a database, approve customer go-live, or grant PHI or clinical authority."
  };
}

function runGit(gitArgs) {
  const result = spawnSync("git", gitArgs, { encoding: "utf8", shell: false });
  return result.status === 0 ? result.stdout.trim() : null;
}

function inspectRepository() {
  const headSha = runGit(["rev-parse", "HEAD"]);
  const status = runGit(["status", "--porcelain=v1", "--untracked-files=all"]);

  return {
    gitAvailable: headSha !== null && status !== null,
    headSha,
    dirtyEntryCount: status ? status.split(/\r?\n/).filter(Boolean).length : status === "" ? 0 : -1
  };
}

function runSelfTest() {
  const base = {
    strict: true,
    ci: false,
    gitAvailable: true,
    headSha: "a".repeat(40),
    dirtyEntryCount: 0,
    githubSha: null,
    vercelEnvironment: null,
    provenanceEnforced: false,
    approvedReleaseSha: null,
    vercelGitCommitSha: null,
    vercelGitCommitRef: null
  };
  const clean = evaluateReleaseProvenance(base);
  const dirty = evaluateReleaseProvenance({ ...base, dirtyEntryCount: 2 });
  const productionMissingApproval = evaluateReleaseProvenance({
    ...base,
    strict: false,
    vercelEnvironment: "production",
    vercelGitCommitSha: base.headSha,
    vercelGitCommitRef: "main"
  });
  const productionApproved = evaluateReleaseProvenance({
    ...base,
    strict: false,
    vercelEnvironment: "production",
    provenanceEnforced: true,
    approvedReleaseSha: base.headSha,
    vercelGitCommitSha: base.headSha,
    vercelGitCommitRef: "main"
  });

  if (
    !clean.allowed
    || !clean.releasePromotionAllowed
    || dirty.allowed
    || dirty.releasePromotionAllowed
    || productionMissingApproval.allowed
    || !productionApproved.allowed
    || !productionApproved.releasePromotionAllowed
  ) {
    throw new Error("Release provenance self-test failed.");
  }

  console.log("pass SCRIMED release provenance self-test");
}

if (args.has("--self-test")) {
  runSelfTest();
  process.exit(0);
}

const repository = inspectRepository();
const report = evaluateReleaseProvenance({
  ...repository,
  strict: args.has("--strict"),
  ci: process.env.CI === "true" || process.env.CI === "1",
  githubSha: process.env.GITHUB_SHA ?? null,
  vercelEnvironment: process.env.VERCEL_ENV ?? null,
  provenanceEnforced: process.env.SCRIMED_RELEASE_PROVENANCE_ENFORCED === "true",
  approvedReleaseSha: process.env.SCRIMED_APPROVED_RELEASE_SHA ?? null,
  vercelGitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  vercelGitCommitRef: process.env.VERCEL_GIT_COMMIT_REF ?? null
});

if (args.has("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`${report.releasePromotionAllowed ? "pass" : report.allowed ? "report" : "blocked"} SCRIMED release provenance: ${report.status}`);
  console.log(`mode=${report.mode} head_fingerprint=${report.headFingerprint} dirty_entries=${report.dirtyEntryCount}`);
  for (const check of report.checks.filter((item) => item.required)) {
    console.log(`${check.passed ? "pass" : "fail"} ${check.id}: ${check.detail}`);
  }
  console.log(report.boundary);
  console.log(`release_promotion_allowed=${report.releasePromotionAllowed}`);
}

if (!report.allowed) {
  process.exitCode = 1;
}
