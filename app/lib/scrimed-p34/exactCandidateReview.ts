import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import { evaluateTrustedTimeWindow, type TrustedClock } from "./trustedClock";

export type P34ExactCandidateBinding = {
  pullRequestNumber: number;
  commitSha: string;
  treeSha: string;
  candidateFingerprint: string;
  sourceFingerprint: string;
  validationFingerprint: string;
  reviewPacketFingerprint: string;
  sbomFingerprint: string;
  gatePacketFingerprint: string;
};

export type P34ExactCandidateReviewApproval = {
  schemaVersion: "scrimed-p34-exact-candidate-review-v2";
  approvalId: string;
  binding: P34ExactCandidateBinding;
  reviewerIdentityHash: string;
  authorIdentityHash: string;
  reviewerRole: "independent-technical-reviewer";
  decision: "APPROVED_FOR_MERGE_AUTHORIZATION_REVIEW" | "CHANGES_REQUESTED";
  issuedAt: string;
  expiresAt: string;
  nonce: string;
  signature: string;
};

export type P34ExactCandidateReviewStore = {
  readonly trustClass: "synthetic-test-only" | "trusted-external";
  consume(bindingHash: string): boolean;
};

export type P34ExactCandidateReviewVerifier = {
  readonly verifierId: string;
  readonly trustClass: "synthetic-test-only" | "trusted-external";
  verify(approval: P34ExactCandidateReviewApproval): {
    valid: boolean;
    authenticatedSignerIdentityHash: string;
    authenticatedSignerRole: "independent-technical-reviewer" | "invalid";
  };
};

export type P34ExactCandidateReviewDecision = {
  status: "PASS" | "EXACT_REVIEW_REQUIRED" | "FAIL";
  structurallyVerified: boolean;
  approvalConsumed: boolean;
  exactCandidateReviewed: boolean;
  mergeAuthorized: false;
  deploymentAuthorized: false;
  productionAuthorityGranted: false;
  reasonCodes: string[];
  evaluatedAt: string;
  bindingHash: string;
  receiptHash: string;
};

const sha256Pattern = /^[0-9a-f]{64}$/i;
const gitShaPattern = /^[0-9a-f]{40}$/i;
const idPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,159}$/;
const fingerprintKeys = [
  "candidateFingerprint",
  "sourceFingerprint",
  "validationFingerprint",
  "reviewPacketFingerprint",
  "sbomFingerprint",
  "gatePacketFingerprint"
] as const satisfies readonly (keyof P34ExactCandidateBinding)[];
const bindingKeys = [
  "pullRequestNumber",
  "commitSha",
  "treeSha",
  ...fingerprintKeys
] as const satisfies readonly (keyof P34ExactCandidateBinding)[];
const approvalKeys = [
  "schemaVersion",
  "approvalId",
  "binding",
  "reviewerIdentityHash",
  "authorIdentityHash",
  "reviewerRole",
  "decision",
  "issuedAt",
  "expiresAt",
  "nonce",
  "signature"
] as const satisfies readonly (keyof P34ExactCandidateReviewApproval)[];

function isSha256(value: unknown): value is string {
  return typeof value === "string" && sha256Pattern.test(value);
}

function isGitSha(value: unknown): value is string {
  return typeof value === "string" && gitShaPattern.test(value);
}

function isBoundedIdentifier(value: unknown): value is string {
  return typeof value === "string" && idPattern.test(value);
}

function hasExactOwnKeys(value: unknown, keys: readonly string[]) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function canonicalHash(value: unknown) {
  return typeof value === "string" ? value.toLowerCase() : "invalid";
}

function canonicalBinding(binding: Partial<P34ExactCandidateBinding>) {
  return {
    pullRequestNumber: Number.isSafeInteger(binding.pullRequestNumber) ? binding.pullRequestNumber : 0,
    commitSha: canonicalHash(binding.commitSha),
    treeSha: canonicalHash(binding.treeSha),
    candidateFingerprint: canonicalHash(binding.candidateFingerprint),
    sourceFingerprint: canonicalHash(binding.sourceFingerprint),
    validationFingerprint: canonicalHash(binding.validationFingerprint),
    reviewPacketFingerprint: canonicalHash(binding.reviewPacketFingerprint),
    sbomFingerprint: canonicalHash(binding.sbomFingerprint),
    gatePacketFingerprint: canonicalHash(binding.gatePacketFingerprint)
  };
}

function unsignedApproval(approval: P34ExactCandidateReviewApproval) {
  return {
    schemaVersion: approval.schemaVersion,
    approvalId: approval.approvalId,
    binding: approval.binding,
    reviewerIdentityHash: approval.reviewerIdentityHash,
    authorIdentityHash: approval.authorIdentityHash,
    reviewerRole: approval.reviewerRole,
    decision: approval.decision,
    issuedAt: approval.issuedAt,
    expiresAt: approval.expiresAt,
    nonce: approval.nonce
  };
}

function validateBinding(binding: Partial<P34ExactCandidateBinding>, label: "APPROVAL" | "EXPECTED") {
  const reasonCodes: string[] = [];
  if (!hasExactOwnKeys(binding, bindingKeys)) reasonCodes.push(`${label}_BINDING_FIELDS_INVALID`);
  if (!Number.isSafeInteger(binding.pullRequestNumber) || (binding.pullRequestNumber ?? 0) <= 0) {
    reasonCodes.push(`${label}_PULL_REQUEST_INVALID`);
  }
  if (!isGitSha(binding.commitSha)) reasonCodes.push(`${label}_COMMIT_SHA_INVALID`);
  if (!isGitSha(binding.treeSha)) reasonCodes.push(`${label}_TREE_SHA_INVALID`);
  for (const key of fingerprintKeys) {
    if (!isSha256(binding[key])) reasonCodes.push(`${label}_${key.replace(/[A-Z]/g, (value) => `_${value}`).toUpperCase()}_INVALID`);
  }
  return reasonCodes;
}

export function createSyntheticExactReviewSignature(
  approval: Omit<P34ExactCandidateReviewApproval, "signature">,
  verifierId: string
) {
  return createClinicalEvidenceHash({
    type: "p34-synthetic-exact-review-signature",
    verifierId,
    approval
  });
}

export function createSyntheticExactReviewVerifier(verifierId: string): P34ExactCandidateReviewVerifier {
  if (!isBoundedIdentifier(verifierId)) throw new Error("Synthetic exact-review verifier ID must be bounded");
  return {
    verifierId,
    trustClass: "synthetic-test-only",
    verify(approval) {
      return {
        valid: approval.signature === createSyntheticExactReviewSignature(unsignedApproval(approval), verifierId),
        authenticatedSignerIdentityHash: canonicalHash(approval.reviewerIdentityHash),
        authenticatedSignerRole: approval.reviewerRole === "independent-technical-reviewer"
          ? "independent-technical-reviewer"
          : "invalid"
      };
    }
  };
}

export class InMemorySyntheticExactCandidateReviewStore implements P34ExactCandidateReviewStore {
  readonly trustClass = "synthetic-test-only" as const;
  readonly #consumed = new Set<string>();

  consume(bindingHash: string) {
    if (!isSha256(bindingHash) || this.#consumed.has(bindingHash)) return false;
    this.#consumed.add(bindingHash);
    return true;
  }
}

export function verifyExactCandidateReview(input: {
  approval: P34ExactCandidateReviewApproval;
  expected: P34ExactCandidateBinding;
  expectedAuthorIdentityHash: string;
  clock: TrustedClock;
  store: P34ExactCandidateReviewStore;
  verifier: P34ExactCandidateReviewVerifier;
}): P34ExactCandidateReviewDecision {
  const reasonCodes: string[] = [];
  const record = (input && typeof input === "object" ? input : {}) as Partial<typeof input>;
  const approval = (record.approval && typeof record.approval === "object"
    ? record.approval
    : {}) as P34ExactCandidateReviewApproval;
  const binding = (approval.binding && typeof approval.binding === "object"
    ? approval.binding
    : {}) as Partial<P34ExactCandidateBinding>;
  const expected = (record.expected && typeof record.expected === "object"
    ? record.expected
    : {}) as Partial<P34ExactCandidateBinding>;
  const store = (record.store && typeof record.store === "object"
    ? record.store
    : {}) as Partial<P34ExactCandidateReviewStore>;
  const verifier = (record.verifier && typeof record.verifier === "object"
    ? record.verifier
    : {}) as Partial<P34ExactCandidateReviewVerifier>;

  if (record !== input || approval !== record.approval || binding !== approval.binding || expected !== record.expected) {
    reasonCodes.push("EXACT_REVIEW_RECORD_INVALID");
  }
  if (!hasExactOwnKeys(approval, approvalKeys)) reasonCodes.push("EXACT_REVIEW_APPROVAL_FIELDS_INVALID");
  if (approval.schemaVersion !== "scrimed-p34-exact-candidate-review-v2") {
    reasonCodes.push("EXACT_REVIEW_SCHEMA_INVALID");
  }
  reasonCodes.push(...validateBinding(binding, "APPROVAL"), ...validateBinding(expected, "EXPECTED"));
  if (!isBoundedIdentifier(approval.approvalId) || !isBoundedIdentifier(approval.nonce)) {
    reasonCodes.push("EXACT_REVIEW_IDENTIFIER_INVALID");
  }
  if (!isSha256(approval.reviewerIdentityHash) || !isSha256(approval.authorIdentityHash) ||
      !isSha256(record.expectedAuthorIdentityHash)) {
    reasonCodes.push("EXACT_REVIEW_IDENTITY_INVALID");
  } else {
    const reviewerIdentity = approval.reviewerIdentityHash.toLowerCase();
    const authorIdentity = approval.authorIdentityHash.toLowerCase();
    const expectedAuthorIdentity = record.expectedAuthorIdentityHash.toLowerCase();
    if (reviewerIdentity === authorIdentity) reasonCodes.push("EXACT_REVIEW_SELF_REVIEW_PROHIBITED");
    if (authorIdentity !== expectedAuthorIdentity) reasonCodes.push("EXACT_REVIEW_AUTHOR_IDENTITY_MISMATCH");
  }
  if (approval.reviewerRole !== "independent-technical-reviewer") {
    reasonCodes.push("EXACT_REVIEW_ROLE_INVALID");
  }
  if (approval.decision !== "APPROVED_FOR_MERGE_AUTHORIZATION_REVIEW" && approval.decision !== "CHANGES_REQUESTED") {
    reasonCodes.push("EXACT_REVIEW_DECISION_INVALID");
  }
  if (!isSha256(approval.signature)) reasonCodes.push("EXACT_REVIEW_SIGNATURE_FORMAT_INVALID");

  const canonicalApprovalBinding = canonicalBinding(binding);
  const canonicalExpectedBinding = canonicalBinding(expected);
  if (canonicalApprovalBinding.pullRequestNumber !== canonicalExpectedBinding.pullRequestNumber) reasonCodes.push("EXACT_REVIEW_PR_MISMATCH");
  if (canonicalApprovalBinding.commitSha !== canonicalExpectedBinding.commitSha) reasonCodes.push("EXACT_REVIEW_COMMIT_MISMATCH");
  if (canonicalApprovalBinding.treeSha !== canonicalExpectedBinding.treeSha) reasonCodes.push("EXACT_REVIEW_TREE_MISMATCH");
  for (const key of fingerprintKeys) {
    if (canonicalApprovalBinding[key] !== canonicalExpectedBinding[key]) {
      reasonCodes.push(`EXACT_REVIEW_${key.replace("Fingerprint", "").replace(/[A-Z]/g, (value) => `_${value}`).toUpperCase()}_MISMATCH`);
    }
  }

  const time = evaluateTrustedTimeWindow({
    issuedAt: approval.issuedAt,
    expiresAt: approval.expiresAt,
    maximumWindowMs: 7 * 24 * 60 * 60 * 1_000,
    maximumAgeMs: 7 * 24 * 60 * 60 * 1_000
  }, record.clock as TrustedClock);
  reasonCodes.push(...time.reasonCodes.map((reason) => `EXACT_REVIEW_${reason}`));

  if (!isBoundedIdentifier(verifier.verifierId) || typeof verifier.verify !== "function") {
    reasonCodes.push("EXACT_REVIEW_VERIFIER_INVALID");
  }
  let signatureVerified = false;
  let authenticatedSignerIdentityHash = "invalid";
  let authenticatedSignerRole: "independent-technical-reviewer" | "invalid" = "invalid";
  try {
    const verification = typeof verifier.verify === "function" ? verifier.verify(approval) : null;
    signatureVerified = verification?.valid === true;
    authenticatedSignerIdentityHash = isSha256(verification?.authenticatedSignerIdentityHash)
      ? verification.authenticatedSignerIdentityHash.toLowerCase()
      : "invalid";
    authenticatedSignerRole = verification?.authenticatedSignerRole === "independent-technical-reviewer"
      ? verification.authenticatedSignerRole
      : "invalid";
  } catch {
    reasonCodes.push("EXACT_REVIEW_VERIFIER_FAILURE");
  }
  if (!signatureVerified) reasonCodes.push("EXACT_REVIEW_SIGNATURE_INVALID");
  if (authenticatedSignerIdentityHash === "invalid" || authenticatedSignerRole === "invalid") {
    reasonCodes.push("EXACT_REVIEW_AUTHENTICATED_SIGNER_INVALID");
  }
  if (isSha256(approval.reviewerIdentityHash) &&
      authenticatedSignerIdentityHash !== approval.reviewerIdentityHash.toLowerCase()) {
    reasonCodes.push("EXACT_REVIEW_AUTHENTICATED_SIGNER_MISMATCH");
  }

  const verifierTrustValid = verifier.trustClass === "synthetic-test-only" || verifier.trustClass === "trusted-external";
  const storeTrustValid = store.trustClass === "synthetic-test-only" || store.trustClass === "trusted-external";
  if (!verifierTrustValid || !storeTrustValid) reasonCodes.push("EXACT_REVIEW_TRUST_CLASS_INVALID");
  if (verifier.trustClass !== store.trustClass) reasonCodes.push("EXACT_REVIEW_TRUST_CLASS_MISMATCH");
  if ((verifier.trustClass === "trusted-external" || store.trustClass === "trusted-external") &&
      time.source !== "server-runtime") {
    reasonCodes.push("EXACT_REVIEW_SERVER_RUNTIME_CLOCK_REQUIRED");
  }

  const bindingHash = createClinicalEvidenceHash({
    type: "p34-exact-candidate-review-binding",
    approval: unsignedApproval(approval),
    expected: canonicalExpectedBinding,
    expectedAuthorIdentityHash: canonicalHash(record.expectedAuthorIdentityHash),
    authenticatedSignerIdentityHash,
    authenticatedSignerRole
  });
  let approvalConsumed = false;
  if (reasonCodes.length === 0) {
    try {
      approvalConsumed = typeof store.consume === "function" && store.consume(bindingHash);
    } catch {
      reasonCodes.push("EXACT_REVIEW_STORE_FAILURE");
    }
    if (!approvalConsumed) reasonCodes.push("EXACT_REVIEW_APPROVAL_REPLAYED");
  }
  if (approval.decision === "CHANGES_REQUESTED") reasonCodes.push("EXACT_REVIEW_CHANGES_REQUESTED");
  if (approvalConsumed && store.trustClass === "synthetic-test-only") {
    reasonCodes.push("SYNTHETIC_EXACT_REVIEW_CANNOT_SATISFY_GATE");
  }

  const normalizedReasons = [...new Set(reasonCodes)].sort();
  const structuralExclusions = new Set([
    "SYNTHETIC_EXACT_REVIEW_CANNOT_SATISFY_GATE"
  ]);
  const structurallyVerified = approvalConsumed && normalizedReasons.every((reason) => structuralExclusions.has(reason));
  const exactCandidateReviewed = approvalConsumed && normalizedReasons.length === 0 &&
    store.trustClass === "trusted-external" && verifier.trustClass === "trusted-external";
  const status = exactCandidateReviewed
    ? "PASS" as const
    : structurallyVerified
      ? "EXACT_REVIEW_REQUIRED" as const
      : "FAIL" as const;
  const receipt = {
    approvalId: isBoundedIdentifier(approval.approvalId) ? approval.approvalId : "invalid",
    bindingHash,
    status,
    structurallyVerified,
    approvalConsumed,
    exactCandidateReviewed,
    evaluatedAt: time.evaluatedAt,
    verifierId: isBoundedIdentifier(verifier.verifierId) ? verifier.verifierId : "invalid",
    trustClass: storeTrustValid ? store.trustClass : "invalid",
    reasonCodes: normalizedReasons
  };
  return {
    status,
    structurallyVerified,
    approvalConsumed,
    exactCandidateReviewed,
    mergeAuthorized: false,
    deploymentAuthorized: false,
    productionAuthorityGranted: false,
    reasonCodes: normalizedReasons,
    evaluatedAt: time.evaluatedAt,
    bindingHash,
    receiptHash: createClinicalEvidenceHash({ type: "p34-exact-candidate-review-receipt", receipt })
  };
}
