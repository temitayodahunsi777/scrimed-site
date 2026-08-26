import { spawnSync } from "node:child_process";

const gitShaPattern = /^[0-9a-f]{40}$/i;
const sha256Pattern = /^[0-9a-f]{64}$/i;
const knownProductionHosts = new Set([
  "app.scrimedsolutions.com",
  "scrimed-site.vercel.app",
  "scrimedsolutions.com",
  "www.scrimedsolutions.com"
]);

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    encoding: "utf8",
    shell: false,
    maxBuffer: 16 * 1024 * 1024,
    ...options
  });
}

export function normalizeAal2TargetOrigin(value) {
  if (!value) throw new Error("AAL2 target verification requires SCRIMED_BASE_URL.");
  const parsed = new URL(value);
  if (
    parsed.protocol !== "https:"
    || parsed.username
    || parsed.password
    || parsed.pathname !== "/"
    || parsed.search
    || parsed.hash
  ) {
    throw new Error("AAL2 target must be a credential-free HTTPS origin with no path, query, or fragment.");
  }
  return parsed.origin;
}

export function parseAllowedAal2PreviewOrigins(value) {
  const origins = String(value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map(normalizeAal2TargetOrigin);
  return [...new Set(origins)];
}

export function readLocalAal2CandidateBinding(env = process.env) {
  const headResult = run("git", ["rev-parse", "HEAD"]);
  const headSha = headResult.status === 0 ? headResult.stdout.trim().toLowerCase() : "";
  if (!gitShaPattern.test(headSha)) {
    throw new Error("AAL2 target verification could not resolve the local Git HEAD.");
  }

  const manifestEnv = {
    HOME: env.HOME,
    PATH: env.PATH,
    SCRIMED_RELEASE_CANDIDATE_BASE_REF: env.SCRIMED_RELEASE_CANDIDATE_BASE_REF
  };
  const manifestResult = run(
    process.execPath,
    ["scripts/release-candidate-manifest.mjs", "--json", "--strict"],
    { env: Object.fromEntries(Object.entries(manifestEnv).filter(([, value]) => typeof value === "string")) }
  );
  if (manifestResult.status !== 0) {
    throw new Error(`AAL2 target verification could not generate the local candidate manifest: ${manifestResult.stderr.trim() || "unknown manifest error"}`);
  }

  let manifest;
  try {
    manifest = JSON.parse(manifestResult.stdout);
  } catch {
    throw new Error("AAL2 target verification received malformed candidate-manifest JSON.");
  }
  if (!sha256Pattern.test(manifest.candidateDigestSha256 ?? "")) {
    throw new Error("AAL2 target verification requires an exact local candidate SHA-256.");
  }
  if (manifest.baseHeadSha !== headSha || manifest.strictProvenanceEligible !== true) {
    throw new Error("AAL2 target verification requires a clean candidate manifest bound to the local Git HEAD.");
  }

  return {
    headSha,
    candidateFingerprint: manifest.candidateDigestSha256.toLowerCase(),
    sourceFingerprint: manifest.sourceCandidateDigestSha256?.toLowerCase() ?? null,
    treeSha: manifest.headTreeSha?.toLowerCase() ?? null
  };
}

export function evaluateAal2TargetBinding(input) {
  const failures = [];
  let origin = null;
  let allowedOrigins = [];

  try {
    origin = normalizeAal2TargetOrigin(input.baseUrl);
  } catch {
    failures.push("TARGET_ORIGIN_INVALID");
  }
  try {
    allowedOrigins = parseAllowedAal2PreviewOrigins(input.allowedPreviewOrigins);
  } catch {
    failures.push("ALLOWED_ORIGIN_CONFIGURATION_INVALID");
  }

  const hostname = origin ? new URL(origin).hostname.toLowerCase() : null;
  if (allowedOrigins.length === 0) failures.push("ALLOWED_PREVIEW_ORIGIN_REQUIRED");
  if (origin && !allowedOrigins.includes(origin)) failures.push("TARGET_NOT_ALLOWLISTED");
  if (hostname && knownProductionHosts.has(hostname)) failures.push("PRODUCTION_ALIAS_PROHIBITED");
  if (!gitShaPattern.test(input.localCommitSha ?? "")) failures.push("LOCAL_COMMIT_SHA_INVALID");
  if (!gitShaPattern.test(input.expectedCommitSha ?? "")) failures.push("EXPECTED_COMMIT_SHA_INVALID");
  if (
    gitShaPattern.test(input.localCommitSha ?? "")
    && gitShaPattern.test(input.expectedCommitSha ?? "")
    && input.localCommitSha.toLowerCase() !== input.expectedCommitSha.toLowerCase()
  ) {
    failures.push("WORKFLOW_COMMIT_MISMATCH");
  }
  if (!sha256Pattern.test(input.localCandidateFingerprint ?? "")) failures.push("LOCAL_CANDIDATE_FINGERPRINT_INVALID");
  if (!sha256Pattern.test(input.suppliedCandidateFingerprint ?? "")) failures.push("SUPPLIED_CANDIDATE_FINGERPRINT_INVALID");
  if (
    sha256Pattern.test(input.localCandidateFingerprint ?? "")
    && sha256Pattern.test(input.suppliedCandidateFingerprint ?? "")
    && input.localCandidateFingerprint.toLowerCase() !== input.suppliedCandidateFingerprint.toLowerCase()
  ) {
    failures.push("CANDIDATE_FINGERPRINT_MISMATCH");
  }

  const build = input.buildInfo ?? {};
  if (build.environment !== "preview") failures.push("NON_PREVIEW_ENVIRONMENT");
  if (build.project !== "scrimed-site") failures.push("PROJECT_IDENTITY_MISMATCH");
  if (build.candidateBound !== true) failures.push("TARGET_NOT_CANDIDATE_BOUND");
  if (build.nodeMajor !== 24) failures.push("NODE24_RUNTIME_REQUIRED");
  if (build.productionReleaseAuthorized !== false || build.customerActivationAuthorized !== false) {
    failures.push("TARGET_AUTHORITY_BOUNDARY_FAILED");
  }
  if (
    gitShaPattern.test(input.expectedCommitSha ?? "")
    && build.commitSha?.toLowerCase() !== input.expectedCommitSha.toLowerCase()
  ) {
    failures.push("TARGET_COMMIT_MISMATCH");
  }

  return {
    passed: failures.length === 0,
    failures,
    origin,
    commitSha: gitShaPattern.test(input.expectedCommitSha ?? "") ? input.expectedCommitSha.toLowerCase() : null,
    candidateFingerprint: sha256Pattern.test(input.localCandidateFingerprint ?? "")
      ? input.localCandidateFingerprint.toLowerCase()
      : null,
    releaseFingerprint: sha256Pattern.test(build.releaseFingerprint ?? "") ? build.releaseFingerprint.toLowerCase() : null,
    environment: typeof build.environment === "string" ? build.environment : null,
    productionAuthorityGranted: false
  };
}

export async function verifyAal2TargetBinding({ env = process.env, fetchImpl = fetch } = {}) {
  const local = readLocalAal2CandidateBinding(env);
  const expectedCommitSha = env.SCRIMED_AAL2_EXPECTED_COMMIT_SHA?.trim().toLowerCase() ?? "";
  const baseUrl = env.SCRIMED_BASE_URL?.trim() ?? "";
  let origin;

  try {
    origin = normalizeAal2TargetOrigin(baseUrl);
  } catch {
    return evaluateAal2TargetBinding({
      baseUrl,
      allowedPreviewOrigins: env.SCRIMED_AAL2_ALLOWED_PREVIEW_ORIGINS,
      localCommitSha: local.headSha,
      expectedCommitSha,
      localCandidateFingerprint: local.candidateFingerprint,
      suppliedCandidateFingerprint: env.SCRIMED_AAL2_CANDIDATE_SHA256,
      buildInfo: null
    });
  }

  let response;
  let buildInfo = null;
  let transportFailure = null;
  try {
    response = await fetchImpl(`${origin}/api/build-info`, {
      headers: { Accept: "application/json" },
      redirect: "follow",
      signal: AbortSignal.timeout(15_000)
    });
    const finalUrl = new URL(response.url || `${origin}/api/build-info`);
    if (response.status !== 200 || finalUrl.origin !== origin || finalUrl.pathname !== "/api/build-info") {
      transportFailure = "BUILD_INFO_RESPONSE_INVALID";
    } else {
      buildInfo = await response.json();
    }
  } catch {
    transportFailure = "BUILD_INFO_UNAVAILABLE";
  }

  const result = evaluateAal2TargetBinding({
    baseUrl: origin,
    allowedPreviewOrigins: env.SCRIMED_AAL2_ALLOWED_PREVIEW_ORIGINS,
    localCommitSha: local.headSha,
    expectedCommitSha,
    localCandidateFingerprint: local.candidateFingerprint,
    suppliedCandidateFingerprint: env.SCRIMED_AAL2_CANDIDATE_SHA256,
    buildInfo
  });
  if (transportFailure) result.failures.unshift(transportFailure);
  result.passed = result.failures.length === 0;
  return result;
}
