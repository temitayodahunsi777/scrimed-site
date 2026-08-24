import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import { evaluateTrustedTimeWindow, type TrustedClock } from "./trustedClock";

export type AtomicApprovalSideEffect =
  | "none"
  | "reversible-synthetic-internal-write"
  | "external-communication"
  | "clinical-system-write"
  | "payer-system-write"
  | "ehr-or-device-write"
  | "production-mutation"
  | "external-distribution";

export type AtomicApprovalToken = {
  schemaVersion: "scrimed-p34-atomic-approval-v2";
  approvalId: string;
  candidateFingerprint: string;
  actionId: string;
  resourceId: string;
  tenantId: string;
  environmentId: string;
  requesterClass: string;
  autonomyLevel: "A0" | "A1" | "A2" | "A3";
  maturityLevel:
    | "EXPERIMENTAL"
    | "SYNTHETIC_VALIDATED"
    | "REVIEW_READY"
    | "PILOT_READY"
    | "PRODUCTION_CANDIDATE"
    | "AUTHORIZED_PRODUCTION";
  issuedAt: string;
  expiresAt: string;
  permittedSideEffect: AtomicApprovalSideEffect;
  nonce: string;
  approverIdentityHash: string;
  policyDecisionHash: string;
  signature: string;
};

export type AtomicApprovalExpectation = Pick<
  AtomicApprovalToken,
  | "candidateFingerprint"
  | "actionId"
  | "resourceId"
  | "tenantId"
  | "environmentId"
  | "requesterClass"
  | "autonomyLevel"
  | "maturityLevel"
  | "permittedSideEffect"
  | "approverIdentityHash"
  | "policyDecisionHash"
>;

export type AtomicApprovalStore = {
  readonly trustClass: "synthetic-test-only" | "trusted-external";
  consume(bindingHash: string): boolean;
};

export type AtomicApprovalSignatureVerifier = {
  readonly verifierId: string;
  readonly trustClass: "synthetic-test-only" | "trusted-external";
  verify(token: AtomicApprovalToken): boolean;
};

export type AtomicApprovalDecision = {
  decision: "REQUIRE_HUMAN" | "BLOCK";
  structurallyVerified: boolean;
  approvalConsumed: boolean;
  executionAuthorized: false;
  clinicalAuthorityGranted: false;
  productionAuthorityGranted: false;
  reasonCodes: string[];
  evaluatedAt: string;
  receiptHash: string;
};

const sha256Pattern = /^[0-9a-f]{64}$/i;
const idPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,159}$/;
const sideEffectClasses = new Set<AtomicApprovalSideEffect>([
  "none",
  "reversible-synthetic-internal-write",
  "external-communication",
  "clinical-system-write",
  "payer-system-write",
  "ehr-or-device-write",
  "production-mutation",
  "external-distribution"
]);
const autonomyLevels = new Set<AtomicApprovalToken["autonomyLevel"]>(["A0", "A1", "A2", "A3"]);
const maturityLevels = new Set<AtomicApprovalToken["maturityLevel"]>([
  "EXPERIMENTAL",
  "SYNTHETIC_VALIDATED",
  "REVIEW_READY",
  "PILOT_READY",
  "PRODUCTION_CANDIDATE",
  "AUTHORIZED_PRODUCTION"
]);

function isBoundedIdentifier(value: unknown): value is string {
  return typeof value === "string" && idPattern.test(value);
}

function isSha256(value: unknown): value is string {
  return typeof value === "string" && sha256Pattern.test(value);
}

function unsignedToken(token: AtomicApprovalToken) {
  return {
    schemaVersion: token.schemaVersion,
    approvalId: token.approvalId,
    candidateFingerprint: token.candidateFingerprint,
    actionId: token.actionId,
    resourceId: token.resourceId,
    tenantId: token.tenantId,
    environmentId: token.environmentId,
    requesterClass: token.requesterClass,
    autonomyLevel: token.autonomyLevel,
    maturityLevel: token.maturityLevel,
    issuedAt: token.issuedAt,
    expiresAt: token.expiresAt,
    permittedSideEffect: token.permittedSideEffect,
    nonce: token.nonce,
    approverIdentityHash: token.approverIdentityHash,
    policyDecisionHash: token.policyDecisionHash
  };
}

export function createSyntheticApprovalSignature(token: Omit<AtomicApprovalToken, "signature">, verifierId: string) {
  return createClinicalEvidenceHash({
    type: "p34-synthetic-approval-signature",
    verifierId,
    token
  });
}

export function createSyntheticApprovalVerifier(verifierId: string): AtomicApprovalSignatureVerifier {
  if (!isBoundedIdentifier(verifierId)) throw new Error("Synthetic approval verifier ID must be bounded");
  return {
    verifierId,
    trustClass: "synthetic-test-only",
    verify(token) {
      return token.signature === createSyntheticApprovalSignature(unsignedToken(token), verifierId);
    }
  };
}

export class InMemorySyntheticAtomicApprovalStore implements AtomicApprovalStore {
  readonly trustClass = "synthetic-test-only" as const;
  readonly #consumed = new Set<string>();

  consume(bindingHash: string) {
    if (!isSha256(bindingHash) || this.#consumed.has(bindingHash)) return false;
    this.#consumed.add(bindingHash);
    return true;
  }
}

export function consumeAtomicApproval(input: {
  token: AtomicApprovalToken;
  expected: AtomicApprovalExpectation;
  clock: TrustedClock;
  store: AtomicApprovalStore;
  verifier: AtomicApprovalSignatureVerifier;
}): AtomicApprovalDecision {
  const reasonCodes: string[] = [];
  const record = (input && typeof input === "object" ? input : {}) as Partial<typeof input>;
  const token = (record.token && typeof record.token === "object" ? record.token : {}) as AtomicApprovalToken;
  const expected = (record.expected && typeof record.expected === "object" ? record.expected : {}) as AtomicApprovalExpectation;
  const verifier = (record.verifier && typeof record.verifier === "object" ? record.verifier : {}) as Partial<AtomicApprovalSignatureVerifier>;
  const store = (record.store && typeof record.store === "object" ? record.store : {}) as Partial<AtomicApprovalStore>;
  if (record !== input || token !== record.token || expected !== record.expected || verifier !== record.verifier || store !== record.store) {
    reasonCodes.push("APPROVAL_RECORD_INVALID");
  }
  if (token.schemaVersion !== "scrimed-p34-atomic-approval-v2") {
    reasonCodes.push("APPROVAL_SCHEMA_VERSION_INVALID");
  }
  for (const value of [token.approvalId, token.actionId, token.resourceId, token.tenantId, token.environmentId, token.requesterClass, token.nonce]) {
    if (!isBoundedIdentifier(value)) reasonCodes.push("APPROVAL_IDENTIFIER_INVALID");
  }
  for (const value of [expected.actionId, expected.resourceId, expected.tenantId, expected.environmentId, expected.requesterClass]) {
    if (!isBoundedIdentifier(value)) reasonCodes.push("APPROVAL_EXPECTATION_INVALID");
  }
  for (const value of [token.candidateFingerprint, token.approverIdentityHash, token.policyDecisionHash, token.signature]) {
    if (!isSha256(value)) reasonCodes.push("APPROVAL_CRYPTOGRAPHIC_BINDING_INVALID");
  }
  for (const value of [expected.candidateFingerprint, expected.approverIdentityHash, expected.policyDecisionHash]) {
    if (!isSha256(value)) reasonCodes.push("APPROVAL_EXPECTATION_INVALID");
  }
  if (!autonomyLevels.has(token.autonomyLevel) || !autonomyLevels.has(expected.autonomyLevel)) {
    reasonCodes.push("APPROVAL_AUTONOMY_INVALID");
  }
  if (!maturityLevels.has(token.maturityLevel) || !maturityLevels.has(expected.maturityLevel)) {
    reasonCodes.push("APPROVAL_MATURITY_INVALID");
  }
  if (!sideEffectClasses.has(token.permittedSideEffect) || !sideEffectClasses.has(expected.permittedSideEffect)) {
    reasonCodes.push("APPROVAL_SIDE_EFFECT_INVALID");
  }
  if (token.candidateFingerprint !== expected.candidateFingerprint) reasonCodes.push("APPROVAL_CANDIDATE_MISMATCH");
  if (token.actionId !== expected.actionId) reasonCodes.push("APPROVAL_ACTION_MISMATCH");
  if (token.resourceId !== expected.resourceId) reasonCodes.push("APPROVAL_RESOURCE_MISMATCH");
  if (token.tenantId !== expected.tenantId) reasonCodes.push("APPROVAL_TENANT_MISMATCH");
  if (token.environmentId !== expected.environmentId) reasonCodes.push("APPROVAL_ENVIRONMENT_MISMATCH");
  if (token.requesterClass !== expected.requesterClass) reasonCodes.push("APPROVAL_REQUESTER_CLASS_MISMATCH");
  if (token.autonomyLevel !== expected.autonomyLevel) reasonCodes.push("APPROVAL_AUTONOMY_MISMATCH");
  if (token.maturityLevel !== expected.maturityLevel) reasonCodes.push("APPROVAL_MATURITY_MISMATCH");
  if (token.permittedSideEffect !== expected.permittedSideEffect) reasonCodes.push("APPROVAL_SIDE_EFFECT_MISMATCH");
  if (token.approverIdentityHash !== expected.approverIdentityHash) reasonCodes.push("APPROVAL_APPROVER_MISMATCH");
  if (token.policyDecisionHash !== expected.policyDecisionHash) reasonCodes.push("APPROVAL_POLICY_DECISION_MISMATCH");

  const time = evaluateTrustedTimeWindow({
    issuedAt: token.issuedAt,
    expiresAt: token.expiresAt,
    maximumWindowMs: 60 * 60 * 1_000,
    maximumAgeMs: 60 * 60 * 1_000
  }, record.clock as TrustedClock);
  reasonCodes.push(...time.reasonCodes.map((reason) => `APPROVAL_${reason}`));
  if (!isBoundedIdentifier(verifier.verifierId) || typeof verifier.verify !== "function") reasonCodes.push("APPROVAL_VERIFIER_INVALID");
  let signatureVerified = false;
  try {
    signatureVerified = typeof verifier.verify === "function" && verifier.verify(token);
  } catch {
    reasonCodes.push("APPROVAL_VERIFIER_FAILURE");
  }
  if (!signatureVerified) reasonCodes.push("APPROVAL_SIGNATURE_INVALID");
  const verifierTrustClassValid = verifier.trustClass === "synthetic-test-only" || verifier.trustClass === "trusted-external";
  const storeTrustClassValid = store.trustClass === "synthetic-test-only" || store.trustClass === "trusted-external";
  if (!verifierTrustClassValid || !storeTrustClassValid) reasonCodes.push("APPROVAL_TRUST_CLASS_INVALID");
  if (verifier.trustClass !== store.trustClass) reasonCodes.push("APPROVAL_TRUST_CLASS_MISMATCH");
  if ((verifier.trustClass === "trusted-external" || store.trustClass === "trusted-external") &&
      time.source !== "server-runtime") {
    reasonCodes.push("APPROVAL_SERVER_RUNTIME_CLOCK_REQUIRED");
  }

  const bindingHash = createClinicalEvidenceHash({
    type: "p34-atomic-approval-binding",
    token: unsignedToken(token),
    expected: {
      candidateFingerprint: expected.candidateFingerprint,
      actionId: expected.actionId,
      resourceId: expected.resourceId,
      tenantId: expected.tenantId,
      environmentId: expected.environmentId,
      requesterClass: expected.requesterClass,
      autonomyLevel: expected.autonomyLevel,
      maturityLevel: expected.maturityLevel,
      permittedSideEffect: expected.permittedSideEffect,
      approverIdentityHash: expected.approverIdentityHash,
      policyDecisionHash: expected.policyDecisionHash
    }
  });
  let approvalConsumed = false;
  if (reasonCodes.length === 0) {
    try {
      approvalConsumed = typeof store.consume === "function" && store.consume(bindingHash);
    } catch {
      reasonCodes.push("APPROVAL_STORE_FAILURE");
    }
    if (!approvalConsumed) reasonCodes.push("APPROVAL_REPLAY_DETECTED");
  }
  if (approvalConsumed && store.trustClass === "synthetic-test-only") {
    reasonCodes.push("SYNTHETIC_APPROVAL_STORE_CANNOT_AUTHORIZE_EXECUTION");
  }

  const normalizedReasons = [...new Set(reasonCodes)].sort();
  const structurallyVerified = approvalConsumed && normalizedReasons.every(
    (reason) => reason === "SYNTHETIC_APPROVAL_STORE_CANNOT_AUTHORIZE_EXECUTION"
  );
  const payload = {
    approvalId: token.approvalId,
    bindingHash,
    expectedHash: createClinicalEvidenceHash({
      candidateFingerprint: expected.candidateFingerprint,
      actionId: expected.actionId,
      resourceId: expected.resourceId,
      tenantId: expected.tenantId,
      environmentId: expected.environmentId,
      requesterClass: expected.requesterClass,
      autonomyLevel: expected.autonomyLevel,
      maturityLevel: expected.maturityLevel,
      permittedSideEffect: expected.permittedSideEffect,
      approverIdentityHash: expected.approverIdentityHash,
      policyDecisionHash: expected.policyDecisionHash
    }),
    approvalConsumed,
    structurallyVerified,
    evaluatedAt: time.evaluatedAt,
    trustClass: storeTrustClassValid ? store.trustClass : "invalid",
    verifierId: isBoundedIdentifier(verifier.verifierId) ? verifier.verifierId : "invalid",
    reasonCodes: normalizedReasons
  };
  return {
    decision: structurallyVerified ? "REQUIRE_HUMAN" : "BLOCK",
    structurallyVerified,
    approvalConsumed,
    executionAuthorized: false,
    clinicalAuthorityGranted: false,
    productionAuthorityGranted: false,
    reasonCodes: normalizedReasons,
    evaluatedAt: time.evaluatedAt,
    receiptHash: createClinicalEvidenceHash({ type: "p34-atomic-approval-receipt", payload })
  };
}
