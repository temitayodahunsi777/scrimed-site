#!/usr/bin/env node

import { createHash } from "node:crypto";

import {
  analyzeAal2BearerToken,
  redactSensitive,
  tokenFingerprint,
  userFingerprint
} from "./lib/aal2-token-policy.mjs";
import { readLocalAal2CandidateBinding } from "./lib/aal2-target-binding.mjs";
import { loadLocalEnv } from "./lib/local-env.mjs";

const selfTest = process.argv.includes("--self-test");
const strict = process.argv.includes("--strict");
const json = process.argv.includes("--json");
const sha256Pattern = /^[0-9a-f]{64}$/i;
const noncePattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;

function hash(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function encode(value) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function syntheticToken(claims) {
  return `${encode({ alg: "none", typ: "JWT", synthetic: true })}.${encode(claims)}.synthetic-signature`;
}

export function verifyAal2Evidence(input, nowMs = Date.now()) {
  const tokenAnalysis = analyzeAal2BearerToken({
    bearerToken: input.bearerToken,
    workspaceSlug: input.workspaceSlug,
    nowMs
  });
  const claims = tokenAnalysis.claims ?? {};
  const audience = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  const amr = Array.isArray(claims.amr) ? claims.amr : [];
  const mfaMethodPresent = amr.some((entry) => {
    const method = typeof entry === "string" ? entry : entry?.method;
    return typeof method === "string" && !new Set(["password", "otp", "anonymous"]).has(method.toLowerCase());
  });
  const issuedAt = typeof claims.iat === "number" ? claims.iat * 1000 : Number.NaN;
  const stepUpFresh = Number.isFinite(issuedAt) && nowMs - issuedAt >= 0 && nowMs - issuedAt <= 15 * 60 * 1000;
  const candidateFingerprint = input.candidateFingerprint?.toLowerCase() ?? "";
  const expectedCandidateFingerprint = input.expectedCandidateFingerprint?.toLowerCase() ?? "";
  const candidateBound = sha256Pattern.test(candidateFingerprint)
    && sha256Pattern.test(expectedCandidateFingerprint)
    && candidateFingerprint === expectedCandidateFingerprint;
  const checks = [
    { id: "token-claims", passed: tokenAnalysis.ok, detail: tokenAnalysis.errors.join(" ") || "AAL2 claims and freshness passed local parsing." },
    { id: "mfa-challenge", passed: claims.aal === "aal2" && mfaMethodPresent, detail: "The signed token must represent AAL2 and a non-password MFA method; signature verification remains external." },
    { id: "step-up-freshness", passed: stepUpFresh, detail: "The AAL2 step-up must be recent enough for the privileged verification window." },
    { id: "downgrade-rejection", passed: claims.aal === "aal2", detail: "AAL1 and missing-assurance tokens fail local policy before protected API verification." },
    { id: "expiration", passed: tokenAnalysis.ok && typeof claims.exp === "number" && claims.exp * 1000 > nowMs, detail: "Expired or insufficiently fresh tokens are rejected." },
    { id: "issuer", passed: typeof input.expectedIssuer === "string" && claims.iss === input.expectedIssuer, detail: "Issuer must match the configured protected identity provider." },
    { id: "audience", passed: typeof input.expectedAudience === "string" && audience.includes(input.expectedAudience), detail: "Audience must include the configured protected SCRIMED audience." },
    { id: "subject", passed: typeof claims.sub === "string" && claims.sub.length > 0, detail: "A non-empty authenticated subject is required." },
    { id: "candidate-binding", passed: candidateBound, detail: "The supplied candidate SHA-256 must equal the candidate manifest generated from the exact local Git revision." },
    { id: "nonce", passed: noncePattern.test(input.nonce ?? ""), detail: "A bounded nonce is required; durable replay rejection remains a protected-API responsibility." },
    { id: "mfa-enrollment", passed: false, detail: "MFA enrollment must be verified by Supabase Auth or the protected identity endpoint." },
    { id: "replay-rejection", passed: false, detail: "One-use nonce rejection must be verified against protected durable state." },
    { id: "privileged-endpoint", passed: false, detail: "The candidate-bound protected endpoint must return an authorized AAL2 receipt." },
    { id: "signature-verification", passed: false, detail: "Local parsing cannot verify the token signature; Supabase Auth and the protected SCRIMED API must verify it." },
    { id: "role-and-tenant-authorization", passed: false, detail: "Protected SCRIMED APIs remain the authority for role, tenant membership, feature flags, and action scope." }
  ];
  const externallyVerifiedChecks = new Set([
    "mfa-enrollment",
    "replay-rejection",
    "privileged-endpoint",
    "signature-verification",
    "role-and-tenant-authorization"
  ]);
  const locallyPassed = checks.filter((entry) => !externallyVerifiedChecks.has(entry.id)).every((entry) => entry.passed);
  const report = {
    service: "scrimed-aal2-evidence-verifier",
    status: locallyPassed ? "READY_FOR_PROTECTED_API_VERIFICATION" : "OPERATOR_EVIDENCE_REQUIRED",
    locallyPassed,
    protectedApiVerificationRequired: true,
    productionAuthorityGranted: false,
    candidateFingerprint: candidateBound ? candidateFingerprint : null,
    tokenFingerprint: input.bearerToken ? tokenFingerprint(input.bearerToken) : null,
    subjectFingerprint: typeof claims.sub === "string" ? userFingerprint(claims.sub) : null,
    nonceFingerprint: noncePattern.test(input.nonce ?? "") ? hash(input.nonce).slice(0, 16) : null,
    checks,
    nextCommands: locallyPassed
      ? ["npm run smoke:aal2:durable-store:strict", "npm run smoke:scrimed-work:strict"]
      : ["Complete MFA, refresh the session, and provide candidate-bound nonsecret inputs."],
    retainedBoundary: "No bearer token, raw subject, nonce, PHI, or secret is emitted. Local parsing is not signature verification, approval, distribution authority, deployment authority, or customer activation."
  };
  return { ...report, evidenceHash: hash(report) };
}

if (selfTest) {
  const nowSeconds = 1_800_000_000;
  const candidateFingerprint = "a".repeat(64);
  const valid = verifyAal2Evidence({
    bearerToken: syntheticToken({
      aal: "aal2",
      amr: [{ method: "totp", timestamp: nowSeconds }],
      exp: nowSeconds + 1800,
      iat: nowSeconds,
      session_id: "synthetic-session",
      sub: "synthetic-operator",
      iss: "https://synthetic.invalid/auth/v1",
      aud: "authenticated",
      role: "authenticated"
    }),
    workspaceSlug: "atlas-synthetic-evaluation",
    expectedIssuer: "https://synthetic.invalid/auth/v1",
    expectedAudience: "authenticated",
    candidateFingerprint,
    expectedCandidateFingerprint: candidateFingerprint,
    nonce: "synthetic-nonce-001"
  }, nowSeconds * 1000);
  if (!valid.locallyPassed || valid.status !== "READY_FOR_PROTECTED_API_VERIFICATION") {
    throw new Error("Synthetic AAL2 verifier self-test did not pass local controls.");
  }
  if (valid.checks.find((entry) => entry.id === "signature-verification")?.passed !== false) {
    throw new Error("Local AAL2 verifier must not claim signature verification.");
  }
  const wrongCandidate = verifyAal2Evidence({
    bearerToken: syntheticToken({
      aal: "aal2",
      amr: [{ method: "totp", timestamp: nowSeconds }],
      exp: nowSeconds + 1800,
      iat: nowSeconds,
      session_id: "synthetic-session",
      sub: "synthetic-operator",
      iss: "https://synthetic.invalid/auth/v1",
      aud: "authenticated"
    }),
    workspaceSlug: "atlas-synthetic-evaluation",
    expectedIssuer: "https://synthetic.invalid/auth/v1",
    expectedAudience: "authenticated",
    candidateFingerprint: "b".repeat(64),
    expectedCandidateFingerprint: candidateFingerprint,
    nonce: "synthetic-nonce-002"
  }, nowSeconds * 1000);
  if (wrongCandidate.locallyPassed || wrongCandidate.status !== "OPERATOR_EVIDENCE_REQUIRED") {
    throw new Error("Candidate mismatch did not fail closed.");
  }
  console.log("pass SCRIMED AAL2 evidence verifier self-test (claims, issuer, audience, freshness, candidate binding, nonce, and retained protected-API authority)");
  process.exit(0);
}

loadLocalEnv();
let localCandidateFingerprint = "";
try {
  localCandidateFingerprint = readLocalAal2CandidateBinding().candidateFingerprint;
} catch {
  // The candidate-binding check below fails closed without exposing local repository details.
}
const report = verifyAal2Evidence({
  bearerToken: process.env.SCRIMED_BEARER_TOKEN?.trim() ?? "",
  workspaceSlug: process.env.SCRIMED_WORKSPACE_SLUG?.trim() ?? "",
  expectedIssuer: process.env.SCRIMED_AAL2_EXPECTED_ISSUER?.trim() ?? "",
  expectedAudience: process.env.SCRIMED_AAL2_EXPECTED_AUDIENCE?.trim() ?? "",
  candidateFingerprint: process.env.SCRIMED_AAL2_CANDIDATE_SHA256?.trim() ?? "",
  expectedCandidateFingerprint: localCandidateFingerprint,
  nonce: process.env.SCRIMED_AAL2_EVIDENCE_NONCE?.trim() ?? ""
});

if (json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`SCRIMED AAL2 evidence: ${report.status}`);
  console.log(`candidate=${report.candidateFingerprint ?? "missing"}`);
  console.log(`token_fingerprint=${report.tokenFingerprint ?? "missing"}`);
  console.log(`subject_fingerprint=${report.subjectFingerprint ?? "missing"}`);
  for (const check of report.checks) {
    console.log(`${check.passed ? "pass" : "pending"} ${check.id}: ${redactSensitive(check.detail)}`);
  }
  console.log(report.retainedBoundary);
}

if (strict && !report.locallyPassed) process.exit(1);
