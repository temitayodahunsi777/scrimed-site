import type { PilotAuditEventRecord } from "./protectedPilotWorkspace";
import {
  isValidQaManualRunEvidenceRunId,
  isValidQaManualRunEvidenceWorkflowUrl,
  qaManualRunEvidenceWorkflowUrlRequirement,
  type QaManualRunEvidencePacketRecord
} from "./qaEvidenceLedger";
import {
  deriveQaActivationSealDecision,
  qaActivationSealRoute,
  qaActivationSealStatus,
  type QaActivationSealDecisionState
} from "./qaActivationSeal";
import {
  evaluateQaClaim,
  qaClaimGuardRoute,
  qaClaimGuardStatus,
  type QaClaimGuardDecisionState
} from "./qaClaimGuard";
import {
  deriveQaProofPromotionDecision,
  qaProofPromotionRoute,
  qaProofPromotionStatus,
  type QaProofPromotionState
} from "./qaProofPromotion";

export type QaBuyerProofReleaseState =
  | "locked-retained-packet-required"
  | "review-audit-signal-without-visible-packet"
  | "candidate-ready-protected-verification-required"
  | "release-review-required"
  | "ready-for-protected-buyer-diligence-export"
  | "blocked-boundary-violation";

export type QaBuyerProofReleaseCriterion = {
  id: string;
  name: string;
  status: "passed" | "blocked" | "review";
  evidence: string;
  nextAction: string;
};

export type QaBuyerProofReleaseDecision = {
  state: QaBuyerProofReleaseState;
  protectedVerificationRequired: boolean;
  buyerDiligenceExportAllowed: boolean;
  externalDistributionAllowed: false;
  publicClaimAllowed: false;
  clinicalAuthorityGranted: false;
  phiAuthorityGranted: false;
  reimbursementAuthorityGranted: false;
  securityCertificationGranted: false;
  packetCount: number;
  auditSignalCount: number;
  latestPacketHash: string;
  latestWorkflowRunId: string;
  latestWorkflowKind: string;
  latestPacketAuditEventId: string;
  latestCreatedAt: string;
  proofPromotionState: QaProofPromotionState;
  activationSealState: QaActivationSealDecisionState;
  claimDecisionState: QaClaimGuardDecisionState;
  releaseCriteria: QaBuyerProofReleaseCriterion[];
  missingEvidence: string[];
  requiredEvidence: string[];
  hardStops: string[];
  blockedClaims: string[];
  buyerSafeClaim: string;
  nextAction: string;
  protectedReleaseRoute: string;
  buyerDiligencePacketRoute: string;
  boundary: string;
};

export type QaBuyerProofReleaseCandidateEvaluation = {
  service: "scrimed-qa-buyer-proof-release";
  status: typeof qaBuyerProofReleaseStatus;
  releaseDecisionState: QaBuyerProofReleaseState;
  candidateComplete: boolean;
  publicVerificationOnly: true;
  protectedVerificationRequired: true;
  buyerDiligenceExportAllowed: false;
  externalDistributionAllowed: false;
  publicClaimAllowed: false;
  clinicalAuthorityGranted: false;
  phiAuthorityGranted: false;
  reimbursementAuthorityGranted: false;
  securityCertificationGranted: false;
  matchedRisks: string[];
  missingEvidence: string[];
  requiredEvidence: string[];
  saferLanguage: string;
  nextAction: string;
  boundary: string;
};

export const qaBuyerProofReleaseStatus =
  "manual-aal2-qa-buyer-proof-release-gate-ready";
export const qaBuyerProofReleaseProofStackStatus =
  "manual-aal2-qa-buyer-proof-release-retained-packet-gate";
export const qaBuyerProofReleaseBriefProofStackStatus =
  "manual-aal2-qa-buyer-proof-release-brief-no-public-release";

export const qaBuyerProofReleaseRoute = "/qa-buyer-proof-release";
export const qaBuyerProofReleaseApiRoute = "/api/qa-evidence/buyer-proof-release";
export const qaBuyerProofReleaseBriefRoute =
  "/api/qa-evidence/buyer-proof-release/brief";
export const qaBuyerProofReleaseProtectedRoute =
  "/api/pilot-workspaces/{workspaceSlug}/qa-evidence/buyer-proof-release";
export const qaBuyerProofReleaseBuyerPacketRoute =
  "/api/pilot-workspaces/{workspaceSlug}/buyer-room/packet";

export const qaBuyerProofReleaseBoundary =
  "SCRIMED QA Buyer Proof Release decides whether protected buyer diligence may reference retained no-secret manual AAL2 synthetic QA evidence. Public checks validate candidate metadata only. Protected release requires tenant-governed AAL2 access, visible retained packet metadata, Proof Promotion, Activation Seal, Claim Guard, and unchanged clinical/PHI/security/reimbursement boundaries.";

const requiredEvidence = [
  "protected Manual QA Evidence packet SHA-256",
  "protected packet audit event UUID",
  "workflow run ID and run URL",
  "synthetic target or workspace label",
  "human AAL2 no-secret operator attestation",
  "temporary token deleted or rotated",
  "Proof Promotion ready-for-buyer-diligence decision",
  "Activation Seal sealed-for-buyer-diligence decision",
  "Claim Guard safe or retained-packet-gated language result",
  "protected Buyer Diligence packet route",
  "external distribution remains separately gated",
  "clinical, PHI, reimbursement, certification, connector, and production authority remain blocked"
];

const hardStops = [
  "bearer token or refresh token submitted",
  "API key, password, credential, or production secret submitted",
  "PHI, patient identifier, payer member identifier, medical record, claim, image, or regulated clinical content submitted",
  "public release requested without qualified approval",
  "live clinical care authorization claimed",
  "PHI processing authorization claimed",
  "HIPAA, SOC 2, security, FDA, regional, or legal approval claimed",
  "reimbursement certainty or payer submission authority claimed",
  "production connector approval claimed",
  "autonomous diagnosis, treatment, patient outreach, or clinical execution claimed"
];

const blockedClaims = [
  "SCRIMED is authorized for live clinical care",
  "SCRIMED can process production PHI",
  "SCRIMED is HIPAA certified or SOC 2 certified",
  "SCRIMED guarantees reimbursement or payer approval",
  "SCRIMED has FDA, regional regulatory, or legal approval",
  "SCRIMED production connectors are approved",
  "SCRIMED can autonomously diagnose, treat, submit claims, or contact patients",
  "public claims can reference retained AAL2 proof without qualified review"
];

export const qaBuyerProofReleaseRules: QaBuyerProofReleaseCriterion[] = [
  {
    id: "retained-packet",
    name: "Retained protected packet visible",
    status: "blocked",
    evidence: "Manual QA Evidence packet SHA-256 must be visible from the protected workspace.",
    nextAction: "Persist safe metadata through protected Manual QA Evidence after the human AAL2 run."
  },
  {
    id: "proof-promotion",
    name: "Proof Promotion permits buyer diligence",
    status: "blocked",
    evidence: "Proof Promotion must be ready-for-buyer-diligence.",
    nextAction: "Confirm Proof Promotion after retained packet metadata appears."
  },
  {
    id: "activation-seal",
    name: "Activation Seal allows buyer use",
    status: "blocked",
    evidence: "Activation Seal must be sealed-for-buyer-diligence inside the protected workspace.",
    nextAction: "Run the protected release check after packet persistence."
  },
  {
    id: "claim-guard",
    name: "Claim Guard keeps language bounded",
    status: "blocked",
    evidence: "Claim Guard must avoid clinical, PHI, reimbursement, security-certification, connector, and public-release overclaims.",
    nextAction: "Use current-state or retained-packet-gated wording only."
  },
  {
    id: "external-authority",
    name: "External authority remains separately gated",
    status: "review",
    evidence: "Buyer proof release does not grant public distribution, clinical authority, PHI authority, reimbursement certainty, certification, or production authorization.",
    nextAction: "Route public, legal, privacy, security, clinical, reimbursement, regional, connector, and customer go-live claims through protected authority controls."
  }
];

function hasManualQaAuditSignal(auditEvents: PilotAuditEventRecord[]) {
  return auditEvents.filter((event) => event.eventType === "manual-qa-evidence-packet-recorded").length;
}

function criterion(
  id: string,
  name: string,
  passed: boolean,
  evidence: string,
  nextAction: string,
  review = false
): QaBuyerProofReleaseCriterion {
  return {
    id,
    name,
    status: passed ? "passed" : review ? "review" : "blocked",
    evidence,
    nextAction
  };
}

function releaseDefaults() {
  return {
    externalDistributionAllowed: false,
    publicClaimAllowed: false,
    clinicalAuthorityGranted: false,
    phiAuthorityGranted: false,
    reimbursementAuthorityGranted: false,
    securityCertificationGranted: false
  } as const;
}

function missingFromCriteria(criteria: QaBuyerProofReleaseCriterion[]) {
  return criteria
    .filter((item) => item.status !== "passed")
    .map((item) => item.name);
}

export function deriveQaBuyerProofReleaseDecision({
  auditEvents = [],
  manualQaEvidencePackets = [],
  workspaceSlug = "{workspaceSlug}"
}: {
  auditEvents?: PilotAuditEventRecord[];
  manualQaEvidencePackets?: QaManualRunEvidencePacketRecord[];
  workspaceSlug?: string;
}): QaBuyerProofReleaseDecision {
  const latest = manualQaEvidencePackets[0] ?? null;
  const auditSignalCount = hasManualQaAuditSignal(auditEvents);
  const proofPromotion = deriveQaProofPromotionDecision({
    auditEvents,
    manualQaEvidencePackets,
    workspaceSlug
  });
  const activationSeal = deriveQaActivationSealDecision({
    manualQaEvidencePackets,
    workspaceSlug
  });
  const claimGuard = evaluateQaClaim({
    claim:
      "SCRIMED buyer diligence may reference retained manual AAL2 QA proof only after protected packet visibility."
  });
  const claimGuardCompatible = [
    "safe-current-claim",
    "requires-retained-packet"
  ].includes(claimGuard.decisionState);
  const releaseCriteria = [
    criterion(
      "retained-packet",
      "Retained protected packet visible",
      Boolean(latest),
      latest
        ? `Packet ${latest.packetSha256} is visible for workflow ${latest.workflowRunId}.`
        : "No protected packet SHA-256 is visible to the release gate.",
      "Persist safe metadata through protected Manual QA Evidence after the human AAL2 run."
    ),
    criterion(
      "proof-promotion",
      "Proof Promotion permits buyer diligence",
      proofPromotion.promotionAllowed,
      `Proof Promotion state: ${proofPromotion.state}.`,
      proofPromotion.nextAction
    ),
    criterion(
      "activation-seal",
      "Activation Seal allows buyer use",
      activationSeal.sealAllowed && activationSeal.buyerUseAllowed,
      `Activation Seal state: ${activationSeal.state}.`,
      activationSeal.nextAction
    ),
    criterion(
      "claim-guard",
      "Claim Guard keeps language bounded",
      claimGuardCompatible,
      `Claim Guard state: ${claimGuard.decisionState}.`,
      claimGuard.nextAction
    ),
    criterion(
      "external-authority",
      "External authority remains separately gated",
      true,
      "External distribution, public claims, live clinical care, PHI processing, reimbursement, certification, connector, and production authority remain false.",
      "Route external-use claims through qualified release, legal, privacy, security, clinical, reimbursement, regional, connector, and customer go-live controls."
    )
  ];
  const allProtectedGatesPassed = releaseCriteria
    .filter((item) => item.id !== "external-authority")
    .every((item) => item.status === "passed");
  const buyerDiligenceExportAllowed = allProtectedGatesPassed;
  const state: QaBuyerProofReleaseState = !latest && auditSignalCount > 0
    ? "review-audit-signal-without-visible-packet"
    : !latest
      ? "locked-retained-packet-required"
      : allProtectedGatesPassed
        ? "ready-for-protected-buyer-diligence-export"
        : "release-review-required";

  return {
    state,
    protectedVerificationRequired: state !== "ready-for-protected-buyer-diligence-export",
    buyerDiligenceExportAllowed,
    ...releaseDefaults(),
    packetCount: manualQaEvidencePackets.length,
    auditSignalCount,
    latestPacketHash: latest?.packetSha256 ?? "pending",
    latestWorkflowRunId: latest?.workflowRunId ?? "pending",
    latestWorkflowKind: latest?.workflowKind ?? "pending",
    latestPacketAuditEventId: latest?.packetAuditEventId ?? "pending",
    latestCreatedAt: latest?.createdAt ?? "pending",
    proofPromotionState: proofPromotion.state,
    activationSealState: activationSeal.state,
    claimDecisionState: claimGuard.decisionState,
    releaseCriteria,
    missingEvidence: missingFromCriteria(releaseCriteria),
    requiredEvidence,
    hardStops,
    blockedClaims,
    buyerSafeClaim: buyerDiligenceExportAllowed
      ? "SCRIMED protected buyer diligence may reference retained no-secret manual AAL2 synthetic QA metadata for this workspace."
      : "SCRIMED remains activation-ready; retained manual AAL2 QA proof cannot be used in buyer diligence until the protected release gate passes.",
    nextAction: buyerDiligenceExportAllowed
      ? "Export Buyer Diligence from the protected workspace and include only workflow run ID, packet hash, audit event reference, synthetic boundary, and blocked authority language."
      : "Complete the human AAL2 run, persist no-secret metadata, then verify Proof Promotion, Activation Seal, Claim Guard, and this release gate before Buyer Diligence export.",
    protectedReleaseRoute: qaBuyerProofReleaseProtectedRoute.replace("{workspaceSlug}", workspaceSlug),
    buyerDiligencePacketRoute: qaBuyerProofReleaseBuyerPacketRoute.replace("{workspaceSlug}", workspaceSlug),
    boundary: qaBuyerProofReleaseBoundary
  };
}

function stringify(value: unknown) {
  try {
    return JSON.stringify(value ?? "");
  } catch {
    return "";
  }
}

function readString(record: Record<string, unknown>, key: string) {
  const value = record[key];

  return typeof value === "string" ? value.trim() : "";
}

function hasUnsafeKey(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;

  const forbidden = new Set([
    "accessToken",
    "access_token",
    "bearerToken",
    "bearer_token",
    "refreshToken",
    "refresh_token",
    "jwt",
    "secret",
    "password",
    "credential",
    "credentials",
    "phi",
    "patientId",
    "patient_id",
    "memberId",
    "member_id",
    "mrn",
    "medicalRecordNumber"
  ]);
  const stack: unknown[] = [value];

  while (stack.length > 0) {
    const current = stack.pop();

    if (!current || typeof current !== "object") continue;

    for (const [key, nestedValue] of Object.entries(current as Record<string, unknown>)) {
      if (forbidden.has(key)) return true;
      if (nestedValue && typeof nestedValue === "object") stack.push(nestedValue);
    }
  }

  return false;
}

function matchedRiskSignals(value: unknown) {
  const text = stringify(value);
  const lower = text.toLowerCase();
  const authorityRiskPhrases = [
    "live clinical care authorized",
    "phi processing authorized",
    "hipaa certified",
    "hipaa compliant",
    "soc 2 certified",
    "security certified",
    "fda cleared",
    "fda approved",
    "regional regulatory approval completed",
    "legal approval completed",
    "reimbursement guaranteed",
    "payer submission authorized",
    "production connector approved",
    "autonomous diagnosis authorized",
    "autonomous treatment authorized",
    "patient outreach authorized"
  ];
  const matchedHardStops = authorityRiskPhrases.filter((phrase) => lower.includes(phrase));
  const secretPatterns = [
    /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
    /Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i,
    /sk-[A-Za-z0-9_-]{12,}/,
    /sbp_[A-Za-z0-9_-]{12,}/,
    /access[_ -]?token["'\s:=]+[A-Za-z0-9._-]{10,}/i,
    /refresh[_ -]?token["'\s:=]+[A-Za-z0-9._-]{10,}/i,
    /password["'\s:=]+[^"',}\s]{8,}/i,
    /credential["'\s:=]+[^"',}\s]{8,}/i,
    /patient\s*(id|identifier|mrn)/i,
    /member\s*(id|identifier)/i
  ];
  const patternRisks = secretPatterns.some((pattern) => pattern.test(text))
    ? ["secret-like or regulated identifier content"]
    : [];
  const keyRisks = hasUnsafeKey(value) ? ["forbidden secret-or-regulated key"] : [];

  return Array.from(new Set([...matchedHardStops, ...patternRisks, ...keyRisks]));
}

function missingCandidateEvidence(value: unknown) {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  const missing: string[] = [];
  const requiredFields = [
    "workflowRunId",
    "workflowRunUrl",
    "packetSha256",
    "packetAuditEventId",
    "protectedWorkspaceSlug",
    "proofPromotionState",
    "activationSealState",
    "claimDecisionState",
    "operatorAttestation",
    "tokenDisposalAttestation",
    "dataBoundary"
  ];

  for (const field of requiredFields) {
    if (!readString(record, field)) missing.push(field);
  }

  if (readString(record, "proofPromotionState") !== "ready-for-buyer-diligence") {
    missing.push("proofPromotionState=ready-for-buyer-diligence");
  }

  if (readString(record, "activationSealState") !== "sealed-for-buyer-diligence") {
    missing.push("activationSealState=sealed-for-buyer-diligence");
  }

  if (!["safe-current-claim", "requires-retained-packet"].includes(readString(record, "claimDecisionState"))) {
    missing.push("claimDecisionState=safe-current-claim-or-requires-retained-packet");
  }

  if (readString(record, "operatorAttestation") !== "no-secrets-no-phi-aal2-human-run") {
    missing.push("operatorAttestation=no-secrets-no-phi-aal2-human-run");
  }

  if (readString(record, "tokenDisposalAttestation") !== "temporary-token-deleted-or-rotated") {
    missing.push("tokenDisposalAttestation=temporary-token-deleted-or-rotated");
  }

  if (readString(record, "dataBoundary") !== "synthetic-business-workflow-only") {
    missing.push("dataBoundary=synthetic-business-workflow-only");
  }

  if (!/^[a-f0-9]{64}$/i.test(readString(record, "packetSha256"))) {
    missing.push("packetSha256 valid SHA-256");
  }

  if (!isValidQaManualRunEvidenceRunId(readString(record, "workflowRunId"))) {
    missing.push("workflowRunId numeric SCRIMED manual QA run ID");
  }

  if (!isValidQaManualRunEvidenceWorkflowUrl(readString(record, "workflowRunUrl"))) {
    missing.push(qaManualRunEvidenceWorkflowUrlRequirement());
  }

  return Array.from(new Set(missing));
}

export function evaluateQaBuyerProofReleaseCandidate(
  value: unknown
): QaBuyerProofReleaseCandidateEvaluation {
  const matchedRisks = matchedRiskSignals(value);

  if (matchedRisks.length > 0) {
    return {
      service: "scrimed-qa-buyer-proof-release",
      status: qaBuyerProofReleaseStatus,
      releaseDecisionState: "blocked-boundary-violation",
      candidateComplete: false,
      publicVerificationOnly: true,
      protectedVerificationRequired: true,
      buyerDiligenceExportAllowed: false,
      ...releaseDefaults(),
      matchedRisks,
      missingEvidence: requiredEvidence,
      requiredEvidence,
      saferLanguage:
        "SCRIMED remains in governed synthetic pilot and enterprise evaluation posture; remove secrets, regulated data, and authority claims before release review.",
      nextAction:
        "Remove unsafe content, validate through Completion Bridge, persist only safe metadata, then run the protected Buyer Proof Release gate.",
      boundary: qaBuyerProofReleaseBoundary
    };
  }

  const missingEvidence = missingCandidateEvidence(value);

  if (missingEvidence.length > 0) {
    return {
      service: "scrimed-qa-buyer-proof-release",
      status: qaBuyerProofReleaseStatus,
      releaseDecisionState: "locked-retained-packet-required",
      candidateComplete: false,
      publicVerificationOnly: true,
      protectedVerificationRequired: true,
      buyerDiligenceExportAllowed: false,
      ...releaseDefaults(),
      matchedRisks: [],
      missingEvidence,
      requiredEvidence,
      saferLanguage:
        "SCRIMED has a release-gated buyer proof path, but public candidate metadata cannot release Buyer Diligence without protected packet visibility.",
      nextAction:
        "Complete missing fields, keep the packet no-secret and synthetic-only, then verify the same evidence inside the protected workspace.",
      boundary: qaBuyerProofReleaseBoundary
    };
  }

  return {
    service: "scrimed-qa-buyer-proof-release",
    status: qaBuyerProofReleaseStatus,
    releaseDecisionState: "candidate-ready-protected-verification-required",
    candidateComplete: true,
    publicVerificationOnly: true,
    protectedVerificationRequired: true,
    buyerDiligenceExportAllowed: false,
    ...releaseDefaults(),
    matchedRisks: [],
    missingEvidence: ["protected workspace server-side release decision"],
    requiredEvidence,
    saferLanguage:
      "The no-secret candidate appears complete, but SCRIMED should not release buyer proof until protected workspace verification reads retained packet evidence.",
    nextAction:
      "Run the protected Buyer Proof Release gate for the workspace, then export Buyer Diligence only if it returns ready-for-protected-buyer-diligence-export.",
    boundary: qaBuyerProofReleaseBoundary
  };
}

function markdownItems(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

export function getQaBuyerProofReleaseSummary() {
  const decision = deriveQaBuyerProofReleaseDecision({});

  return {
    service: "scrimed-qa-buyer-proof-release",
    route: qaBuyerProofReleaseRoute,
    apiRoute: qaBuyerProofReleaseApiRoute,
    briefRoute: qaBuyerProofReleaseBriefRoute,
    protectedReleaseRoute: qaBuyerProofReleaseProtectedRoute,
    buyerDiligencePacketRoute: qaBuyerProofReleaseBuyerPacketRoute,
    status: qaBuyerProofReleaseStatus,
    proofStackStatus: qaBuyerProofReleaseProofStackStatus,
    briefProofStackStatus: qaBuyerProofReleaseBriefProofStackStatus,
    boundary: qaBuyerProofReleaseBoundary,
    decision,
    releaseDecisionState: decision.state,
    buyerDiligenceExportAllowed: decision.buyerDiligenceExportAllowed,
    protectedVerificationRequired: decision.protectedVerificationRequired,
    externalDistributionAllowed: decision.externalDistributionAllowed,
    publicClaimAllowed: decision.publicClaimAllowed,
    clinicalAuthorityGranted: decision.clinicalAuthorityGranted,
    phiAuthorityGranted: decision.phiAuthorityGranted,
    reimbursementAuthorityGranted: decision.reimbursementAuthorityGranted,
    securityCertificationGranted: decision.securityCertificationGranted,
    requiredEvidence,
    requiredEvidenceCount: requiredEvidence.length,
    hardStops,
    hardStopCount: hardStops.length,
    blockedClaims,
    blockedClaimCount: blockedClaims.length,
    rules: qaBuyerProofReleaseRules,
    ruleCount: qaBuyerProofReleaseRules.length,
    sourceActivationSealRoute: qaActivationSealRoute,
    sourceActivationSealStatus: qaActivationSealStatus,
    sourceProofPromotionRoute: qaProofPromotionRoute,
    sourceProofPromotionStatus: qaProofPromotionStatus,
    sourceClaimGuardRoute: qaClaimGuardRoute,
    sourceClaimGuardStatus: qaClaimGuardStatus,
    buyerSafeCurrentLanguage:
      "SCRIMED has a governed synthetic QA path and a protected release gate; retained packet proof remains unavailable for buyer diligence until the gate passes inside the tenant workspace.",
    nextRecommendedBuildStep:
      "After the approved human AAL2 run is persisted, run the protected Buyer Proof Release gate, then export Buyer Diligence only when the gate returns ready-for-protected-buyer-diligence-export.",
    updated: "2026-06-22"
  };
}

export function buildQaBuyerProofReleaseBrief() {
  const summary = getQaBuyerProofReleaseSummary();

  return [
    "# SCRIMED QA Buyer Proof Release Brief",
    "",
    `Status: ${summary.status}`,
    `Release decision: ${summary.releaseDecisionState}`,
    `Buyer Diligence export allowed: ${summary.buyerDiligenceExportAllowed ? "yes" : "no"}`,
    `Protected verification required: ${summary.protectedVerificationRequired ? "yes" : "no"}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Current Decision",
    `- Buyer-safe claim: ${summary.decision.buyerSafeClaim}`,
    `- Next action: ${summary.decision.nextAction}`,
    "",
    "## Required Evidence",
    markdownItems(summary.requiredEvidence),
    "",
    "## Release Criteria",
    ...summary.decision.releaseCriteria.map(
      (item) =>
        `- ${item.name} (${item.status}): ${item.evidence} Next: ${item.nextAction}`
    ),
    "",
    "## Hard Stops",
    markdownItems(summary.hardStops),
    "",
    "## Blocked Claims",
    markdownItems(summary.blockedClaims),
    "",
    "## Routes",
    `- Public page: ${summary.route}`,
    `- Public API: ${summary.apiRoute}`,
    `- Protected release route: ${summary.protectedReleaseRoute}`,
    `- Buyer Diligence packet: ${summary.buyerDiligencePacketRoute}`,
    `- Activation Seal: ${summary.sourceActivationSealRoute}`,
    `- Proof Promotion: ${summary.sourceProofPromotionRoute}`,
    `- Claim Guard: ${summary.sourceClaimGuardRoute}`,
    "",
    "## Next Recommended Build Step",
    summary.nextRecommendedBuildStep
  ].join("\n");
}
