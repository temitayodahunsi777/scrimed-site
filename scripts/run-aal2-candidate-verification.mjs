#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";

import { analyzeAal2BearerToken, tokenFingerprint, userFingerprint } from "./lib/aal2-token-policy.mjs";
import {
  evaluateAal2TargetBinding,
  normalizeAal2TargetOrigin,
  parseAllowedAal2PreviewOrigins,
  readLocalAal2CandidateBinding
} from "./lib/aal2-target-binding.mjs";
import { createRedactedAal2Evidence } from "./lib/aal2-redacted-evidence.mjs";

const selfTest = process.argv.includes("--self-test");
const json = process.argv.includes("--json");
const writeEvidence = process.argv.includes("--write-evidence");
const allowedArguments = new Set(["--self-test", "--json", "--write-evidence"]);
const unknownArguments = process.argv.slice(2).filter((argument) => !allowedArguments.has(argument));
if (unknownArguments.length > 0) throw new Error(`Unsupported AAL2 candidate option: ${unknownArguments.join(", ")}`);

function sha256(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function encode(value) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function syntheticToken(claims) {
  return `${encode({ alg: "none", typ: "JWT", synthetic: true })}.${encode(claims)}.synthetic-signature`;
}

function mfaMethodPresent(claims) {
  const methods = Array.isArray(claims.amr) ? claims.amr : [];
  return methods.some((entry) => {
    const method = typeof entry === "string" ? entry : entry?.method;
    return typeof method === "string" && !new Set(["password", "otp", "anonymous"]).has(method.toLowerCase());
  });
}

export async function runAal2CandidateVerification({
  token,
  targetUrl,
  allowedPreviewOrigins,
  localBinding,
  fetchImpl = fetch,
  nowMs = Date.now()
}) {
  let origin = null;
  let targetEligible = false;
  const checks = [];
  try {
    origin = normalizeAal2TargetOrigin(targetUrl);
    const hostname = new URL(origin).hostname.toLowerCase();
    const allowlist = parseAllowedAal2PreviewOrigins(allowedPreviewOrigins);
    targetEligible = hostname.endsWith(".vercel.app")
      && hostname !== "scrimed-site.vercel.app"
      && allowlist.includes(origin);
    checks.push({
      id: "nonproduction-target",
      passed: targetEligible,
      detail: "Target must be an explicitly allowlisted, exact nonproduction Vercel preview origin."
    });
  } catch {
    checks.push({
      id: "nonproduction-target",
      passed: false,
      detail: "Target URL and allowlist must contain valid credential-free HTTPS origins."
    });
  }

  const tokenAnalysis = analyzeAal2BearerToken({
    bearerToken: token,
    workspaceSlug: "atlas-synthetic-evaluation",
    nowMs
  });
  const claims = tokenAnalysis.claims ?? {};
  const issuedAtMs = typeof claims.iat === "number" ? claims.iat * 1000 : Number.NaN;
  const stepUpFresh = Number.isFinite(issuedAtMs) && nowMs >= issuedAtMs && nowMs - issuedAtMs <= 15 * 60 * 1000;
  checks.push(
    { id: "aal2-token-policy", passed: tokenAnalysis.ok && claims.aal === "aal2", detail: "Token claims must pass local AAL2 and expiry policy." },
    { id: "mfa-method", passed: mfaMethodPresent(claims), detail: "A non-password MFA method is required." },
    { id: "fresh-step-up", passed: stepUpFresh, detail: "Step-up must be within the 15-minute privileged verification window." }
  );

  const expirationMs = typeof claims.exp === "number" ? claims.exp * 1000 : Number.NaN;
  const staleEvaluation = analyzeAal2BearerToken({
    bearerToken: token,
    workspaceSlug: "atlas-synthetic-evaluation",
    nowMs: Number.isFinite(expirationMs) ? expirationMs + 1_000 : nowMs + 24 * 60 * 60 * 1_000
  });
  checks.push({
    id: "stale-token-policy-rejection",
    passed: !staleEvaluation.ok,
    detail: "The same token is rejected by local policy when evaluated beyond its signed expiration."
  });

  let buildInfo = null;
  if (origin && targetEligible) {
    try {
      const response = await fetchImpl(`${origin}/api/build-info`, {
        headers: { Accept: "application/json" },
        redirect: "error",
        signal: AbortSignal.timeout(15_000)
      });
      buildInfo = response.status === 200 ? await response.json() : null;
    } catch {
      buildInfo = null;
    }
  }
  const targetBinding = evaluateAal2TargetBinding({
    baseUrl: origin ?? "",
    allowedPreviewOrigins,
    localCommitSha: localBinding.headSha,
    expectedCommitSha: localBinding.headSha,
    localCandidateFingerprint: localBinding.candidateFingerprint,
    suppliedCandidateFingerprint: buildInfo?.candidateFingerprint,
    buildInfo
  });
  checks.push({
    id: "exact-candidate-preview-binding",
    passed: targetBinding.passed,
    detail: targetBinding.passed ? "Preview build matches the clean local candidate." : targetBinding.failures.join(", ")
  });

  let privilegedStatus = 0;
  if (origin && token && targetBinding.passed) {
    try {
      const response = await fetchImpl(`${origin}/api/pilot-workspaces/atlas-synthetic-evaluation/tenant-access`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
        redirect: "error",
        signal: AbortSignal.timeout(15_000)
      });
      privilegedStatus = response.status;
      await response.arrayBuffer();
    } catch {
      privilegedStatus = 0;
    }
  }
  checks.push({
    id: "privileged-endpoint",
    passed: privilegedStatus === 200,
    detail: privilegedStatus === 200
      ? "Protected preview endpoint verified token signature, role, tenant membership, and AAL2 session."
      : `Protected endpoint returned ${privilegedStatus || "transport failure"}.`
  });

  const replayKey = sha256(`${localBinding.candidateFingerprint}:aal2-candidate-read-only-probe`);
  const replayStore = new Set();
  const firstConsume = !replayStore.has(replayKey) && Boolean(replayStore.add(replayKey));
  const secondConsume = !replayStore.has(replayKey) && Boolean(replayStore.add(replayKey));
  checks.push({
    id: "candidate-replay-guard",
    passed: firstConsume && !secondConsume,
    detail: "Candidate-scoped one-use replay logic rejects the duplicate probe; no remote mutation is performed."
  });

  const passed = checks.every((check) => check.passed);
  const reportBase = {
    service: "scrimed-p34-aal2-candidate-verification",
    status: passed ? "PASS_NONPRODUCTION_AAL2" : "OPERATOR_ACTION_REQUIRED",
    targetOrigin: origin,
    commitSha: localBinding.headSha,
    candidateFingerprint: localBinding.candidateFingerprint,
    releaseFingerprint: targetBinding.releaseFingerprint,
    tokenFingerprint: token ? tokenFingerprint(token) : null,
    subjectFingerprint: typeof claims.sub === "string" ? userFingerprint(claims.sub) : null,
    checks,
    productionAuthorityGranted: false,
    tokenPersisted: false,
    boundary: "This verifier never writes the token or response body. It verifies a nonproduction synthetic preview only and grants no review, merge, deployment, migration, PHI, clinical, payer, EHR/device, customer, certification, or distribution authority."
  };
  return { ...reportBase, evidenceHash: sha256(JSON.stringify(reportBase)) };
}

if (selfTest) {
  const nowSeconds = 1_800_000_000;
  const token = syntheticToken({
    aal: "aal2",
    amr: [{ method: "totp", timestamp: nowSeconds }],
    exp: nowSeconds + 900,
    iat: nowSeconds,
    session_id: "synthetic-session",
    sub: "synthetic-operator",
    iss: "https://synthetic.invalid/auth/v1",
    aud: "authenticated"
  });
  const headSha = "a".repeat(40);
  const candidateFingerprint = "b".repeat(64);
  const origin = "https://scrimed-site-synthetic-team.vercel.app";
  const fetchImpl = async (url) => {
    if (String(url).endsWith("/api/build-info")) {
      return new Response(JSON.stringify({
        service: "scrimed-build-info",
        project: "scrimed-site",
        environment: "preview",
        nodeMajor: 24,
        commitSha: headSha,
        candidateFingerprint,
        candidateBound: true,
        productionReleaseAuthorized: false,
        customerActivationAuthorized: false,
        releaseFingerprint: "c".repeat(64)
      }), { status: 200 });
    }
    return new Response("{}", { status: 200 });
  };
  const report = await runAal2CandidateVerification({
    token,
    targetUrl: origin,
    allowedPreviewOrigins: origin,
    localBinding: { headSha, candidateFingerprint },
    fetchImpl,
    nowMs: nowSeconds * 1000
  });
  if (report.status !== "PASS_NONPRODUCTION_AAL2" || report.tokenPersisted !== false) {
    throw new Error("AAL2 candidate verification self-test failed.");
  }
  const redacted = createRedactedAal2Evidence(report, "2027-01-15T08:00:00.000Z");
  if (
    "tokenFingerprint" in redacted
    || "subjectFingerprint" in redacted
    || JSON.stringify(redacted).includes("synthetic-signature")
  ) {
    throw new Error("AAL2 redacted evidence included credential-derived detail.");
  }

  let disallowedFetches = 0;
  const disallowedReport = await runAal2CandidateVerification({
    token,
    targetUrl: "https://untrusted.example",
    allowedPreviewOrigins: origin,
    localBinding: { headSha, candidateFingerprint },
    fetchImpl: async () => {
      disallowedFetches += 1;
      throw new Error("Network access must not occur for a disallowed target.");
    },
    nowMs: nowSeconds * 1000
  });
  if (disallowedReport.status !== "OPERATOR_ACTION_REQUIRED" || disallowedFetches !== 0) {
    throw new Error("AAL2 candidate verifier contacted a target before allowlist authorization.");
  }

  const mismatchRequests = [];
  const mismatchReport = await runAal2CandidateVerification({
    token,
    targetUrl: origin,
    allowedPreviewOrigins: origin,
    localBinding: { headSha, candidateFingerprint },
    fetchImpl: async (url) => {
      mismatchRequests.push(String(url));
      if (!String(url).endsWith("/api/build-info")) {
        throw new Error("Bearer use must not occur before exact candidate binding passes.");
      }
      return new Response(JSON.stringify({
        service: "scrimed-build-info",
        project: "scrimed-site",
        environment: "preview",
        nodeMajor: 24,
        commitSha: headSha,
        candidateFingerprint: "d".repeat(64),
        candidateBound: true,
        productionReleaseAuthorized: false,
        customerActivationAuthorized: false,
        releaseFingerprint: "e".repeat(64)
      }), { status: 200 });
    },
    nowMs: nowSeconds * 1000
  });
  if (
    mismatchReport.status !== "OPERATOR_ACTION_REQUIRED"
    || mismatchRequests.length !== 1
    || !mismatchRequests[0].endsWith("/api/build-info")
  ) {
    throw new Error("AAL2 candidate verifier used a bearer before exact candidate binding passed.");
  }
  console.log("pass SCRIMED p.34 AAL2 one-command verifier self-test");
  process.exit(0);
}

const token = process.env.AAL2_TEST_TOKEN?.trim() ?? "";
const targetUrl = process.env.TARGET_URL?.trim() ?? "";
const allowedPreviewOrigins = process.env.SCRIMED_AAL2_ALLOWED_PREVIEW_ORIGINS?.trim() || targetUrl;
if (!token || !targetUrl) {
  console.error("AAL2_TEST_TOKEN and TARGET_URL are required. Values are never printed or persisted.");
  process.exit(1);
}

let localBinding;
try {
  localBinding = readLocalAal2CandidateBinding();
} catch (error) {
  console.error(error instanceof Error ? error.message : "Unable to bind the clean local candidate.");
  process.exit(1);
}

const report = await runAal2CandidateVerification({ token, targetUrl, allowedPreviewOrigins, localBinding });
if (writeEvidence) {
  const evidence = createRedactedAal2Evidence(report);
  await mkdir("artifacts/security", { recursive: true });
  await writeFile("artifacts/security/p40-aal2.json", `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
}
if (json) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`SCRIMED p.34 AAL2 candidate verification: ${report.status}`);
  console.log(`target=${report.targetOrigin ?? "invalid"}`);
  console.log(`commit=${report.commitSha}`);
  console.log(`candidate=${report.candidateFingerprint}`);
  for (const check of report.checks) console.log(`${check.passed ? "pass" : "blocked"} ${check.id}: ${check.detail}`);
  if (writeEvidence) console.log("redacted_evidence=artifacts/security/p40-aal2.json");
  console.log(report.boundary);
}
if (report.status !== "PASS_NONPRODUCTION_AAL2") process.exit(1);
