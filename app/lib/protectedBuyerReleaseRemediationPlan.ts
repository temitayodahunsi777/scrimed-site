import type {
  ProtectedBuyerReleaseControlGate,
  ProtectedBuyerReleaseControlRun
} from "./protectedBuyerReleaseControlRun";
import type { PilotWorkspaceRecord } from "./protectedPilotWorkspace";

export type ProtectedBuyerReleaseRemediationStepState =
  | "complete"
  | "blocked"
  | "waiting-on-human";

export type ProtectedBuyerReleaseRemediationStep = {
  gateId: string;
  label: string;
  sequence: number;
  priority: "critical" | "high" | "medium";
  state: ProtectedBuyerReleaseRemediationStepState;
  currentEvidence: string;
  requiredAction: string;
  safeMetadataToCollect: string[];
  blockedData: string[];
  safeWorkaround: string;
  protectedRoute: string;
  packetRoute: string;
  canBypass: boolean;
  bypassDecision: string;
  humanApprovalRequired: boolean;
  boundary: string;
};

export type ProtectedBuyerReleaseRemediationPlan = {
  service: "scrimed-protected-buyer-release-remediation-plan";
  status: "operator-remediation-required" | "qualified-human-review-ready";
  proofStackStatus: "aal2-protected-remediation-plan-no-release-approval";
  workspace: {
    name: string;
    slug: string;
    status: string;
  };
  chainState: ProtectedBuyerReleaseControlRun["chainState"];
  releaseDecision: ProtectedBuyerReleaseControlRun["releaseDecision"];
  score: number;
  readyGateCount: number;
  blockedGateCount: number;
  operatorDecision: "do-not-share" | "pause-for-qualified-human-release-review";
  nextStep: string;
  steps: ProtectedBuyerReleaseRemediationStep[];
  readyEvidence: ProtectedBuyerReleaseRemediationStep[];
  unresolvedBoundaries: string[];
  safeWorkarounds: string[];
  boundary: string;
  updated: "2026-06-23";
};

const remediationBoundary =
  "Protected Buyer Release Remediation Plan converts verifier output into no-PHI operator actions. It is not release approval, legal approval, privacy approval, security certification, HIPAA/SOC/FDA certification, advertising substantiation, securities material approval, reimbursement certainty, PHI authority, production connector approval, live clinical care authority, or autonomous clinical execution authority.";

const genericBlockedData = [
  "PHI or patient-identifiable data",
  "secrets, bearer tokens, passwords, credentials, private keys, or connection strings",
  "signed contracts, legal opinions, security reports, recipient lists, raw logs, URLs, IP addresses, device IDs, or private customer artifacts",
  "claims of HIPAA, SOC, FDA, security certification, reimbursement certainty, production connector approval, live clinical care authority, or autonomous clinical execution authority"
];

const gateMetadata: Record<
  string,
  {
    priority: "critical" | "high" | "medium";
    requiredAction: string;
    safeMetadataToCollect: string[];
    blockedData?: string[];
    safeWorkaround: string;
  }
> = {
  "buyer-diligence-export": {
    priority: "medium",
    requiredAction:
      "Keep the retained Buyer Diligence Export as internal proof only until every downstream release-control gate is complete.",
    safeMetadataToCollect: [
      "packet audit event ID",
      "packet type",
      "packet hash or digest if available",
      "generated timestamp",
      "workspace slug",
      "review status label"
    ],
    safeWorkaround:
      "Use the internal packet audit reference in a live review; do not send the export externally while any release-control gate remains blocked."
  },
  "external-approval-evidence": {
    priority: "high",
    requiredAction:
      "Retain a no-PHI metadata reference for each required external approval domain and route those references to the release decision gate.",
    safeMetadataToCollect: [
      "approval domain",
      "external system label",
      "approval owner role",
      "reference label or locator",
      "validation status",
      "review timestamp",
      "no-PHI attestation"
    ],
    blockedData: [
      "legal opinions",
      "privacy approvals",
      "security reports",
      "signed customer approval artifacts"
    ],
    safeWorkaround:
      "If the artifact is confidential, store only a metadata pointer and keep the source document in the approved external system of record."
  },
  "release-decision": {
    priority: "high",
    requiredAction:
      "Record bounded claim language and a versioned release decision that stays inside qualified release review, not public release.",
    safeMetadataToCollect: [
      "claim version",
      "distribution scope",
      "release decision state",
      "linked approval-domain reference IDs",
      "owner role",
      "review timestamp",
      "no-public-release attestation"
    ],
    safeWorkaround:
      "Use conservative buyer-diligence wording and keep the release decision disabled for public distribution until authority signoff is complete."
  },
  "named-reviewer-signoffs": {
    priority: "critical",
    requiredAction:
      "Retain metadata signoffs for every required reviewer role before staging any distribution lockbox.",
    safeMetadataToCollect: [
      "reviewer role",
      "organization or function label",
      "external reference label or locator",
      "artifact scope",
      "approved claim version",
      "distribution scope",
      "expiration date or review window",
      "no-PHI attestation"
    ],
    blockedData: [
      "actual signatures",
      "named private reviewers where confidentiality requires external retention",
      "signed legal artifacts",
      "raw approval documents"
    ],
    safeWorkaround:
      "Use role-scoped metadata references and keep the named human approval artifact in the external approval system."
  },
  "distribution-lockbox": {
    priority: "critical",
    requiredAction:
      "Create or reconcile a disabled distribution lockbox that proves the packet is staged but not externally distributed.",
    safeMetadataToCollect: [
      "linked signoff record IDs",
      "distribution audience label",
      "manifest version",
      "artifact manifest label or locator",
      "customer permission reference",
      "counsel review reference",
      "distribution window",
      "revocation plan",
      "distribution-disabled attestation"
    ],
    blockedData: [
      "customer access grants",
      "download links",
      "private evidence-room URLs",
      "signed customer permission documents"
    ],
    safeWorkaround:
      "Stage only a disabled manifest and use live screen-share review for qualified buyers until the lockbox is approved outside SCRIMED."
  },
  "release-authority-attestations": {
    priority: "critical",
    requiredAction:
      "Retain no-PHI authority attestations for every required release authority domain before recipient controls are considered complete.",
    safeMetadataToCollect: [
      "authority domain",
      "release authority owner role",
      "external reference label or locator",
      "distribution audience label",
      "manifest version",
      "release scope",
      "approval window",
      "revocation trigger",
      "release-disabled attestation"
    ],
    blockedData: [
      "final release approval artifacts",
      "security certification documents",
      "legal approval documents",
      "customer permission artifacts"
    ],
    safeWorkaround:
      "Keep the release disabled and store only authority-domain metadata until legal, privacy, security, and commercial owners approve externally."
  },
  "recipient-attestations": {
    priority: "critical",
    requiredAction:
      "Record recipient-segment controls without storing exact recipient identifiers, lists, emails, or access grants.",
    safeMetadataToCollect: [
      "recipient segment label",
      "evidence-room reference label",
      "packet reference",
      "access window",
      "revocation state",
      "recipient-control owner role",
      "no-recipient-list attestation"
    ],
    blockedData: [
      "exact recipient names",
      "email addresses",
      "access grants",
      "private invite links",
      "customer identity artifacts"
    ],
    safeWorkaround:
      "Use segment-level attestations and keep exact recipient management in the external evidence-room system."
  },
  "access-log-reconciliation": {
    priority: "critical",
    requiredAction:
      "Reconcile evidence-room access-log metadata and resolve anomalies before any buyer-specific sharing decision.",
    safeMetadataToCollect: [
      "external log system label",
      "access-log reference label or locator",
      "reconciliation window",
      "observed event count",
      "expected segment count",
      "anomaly state",
      "escalation path",
      "raw-logs-external attestation"
    ],
    blockedData: [
      "raw logs",
      "IP addresses",
      "device identifiers",
      "URLs",
      "recipient identities",
      "access tokens"
    ],
    safeWorkaround:
      "Store only reconciliation metadata and keep raw evidence-room logs in the external security/audit system of record."
  }
};

function metadataFor(gate: ProtectedBuyerReleaseControlGate) {
  return (
    gateMetadata[gate.id] ?? {
      priority: "medium" as const,
      requiredAction: gate.nextAction,
      safeMetadataToCollect: ["external reference label", "owner role", "review timestamp", "no-PHI attestation"],
      safeWorkaround:
        "Use a no-PHI metadata reference and keep sensitive artifacts in the external system of record."
    }
  );
}

function stepState(gate: ProtectedBuyerReleaseControlGate): ProtectedBuyerReleaseRemediationStepState {
  if (gate.state === "ready") return "complete";
  if (gate.state === "review") return "waiting-on-human";
  return "blocked";
}

function bypassDecision(gate: ProtectedBuyerReleaseControlGate) {
  if (gate.state === "ready") return "No bypass needed; retain as internal proof only.";
  if (gate.state === "review") return "Do not bypass; qualified human review remains required.";
  return "Do not bypass; collect safe metadata references or hold a protected live review.";
}

function buildStep(
  gate: ProtectedBuyerReleaseControlGate,
  sequence: number
): ProtectedBuyerReleaseRemediationStep {
  const metadata = metadataFor(gate);
  const state = stepState(gate);

  return {
    gateId: gate.id,
    label: gate.label,
    sequence,
    priority: metadata.priority,
    state,
    currentEvidence: gate.evidence,
    requiredAction: state === "complete" ? gate.nextAction : metadata.requiredAction,
    safeMetadataToCollect: metadata.safeMetadataToCollect,
    blockedData: [...genericBlockedData, ...(metadata.blockedData ?? [])],
    safeWorkaround: metadata.safeWorkaround,
    protectedRoute: gate.protectedRoute,
    packetRoute: gate.packetRoute,
    canBypass: false,
    bypassDecision: bypassDecision(gate),
    humanApprovalRequired: gate.state !== "ready" || gate.id !== "buyer-diligence-export",
    boundary: gate.boundary
  };
}

export function deriveProtectedBuyerReleaseRemediationPlan({
  run,
  workspace
}: {
  run: ProtectedBuyerReleaseControlRun;
  workspace: PilotWorkspaceRecord;
}): ProtectedBuyerReleaseRemediationPlan {
  const steps = run.gates.map((gate, index) => buildStep(gate, index + 1));
  const blockedSteps = steps.filter((step) => step.state === "blocked");
  const reviewSteps = steps.filter((step) => step.state === "waiting-on-human");
  const readyEvidence = steps.filter((step) => step.state === "complete");
  const qualifiedReady = blockedSteps.length === 0 && reviewSteps.length === 0;

  return {
    service: "scrimed-protected-buyer-release-remediation-plan",
    status: qualifiedReady ? "qualified-human-review-ready" : "operator-remediation-required",
    proofStackStatus: "aal2-protected-remediation-plan-no-release-approval",
    workspace: {
      name: workspace.name,
      slug: workspace.slug,
      status: workspace.status
    },
    chainState: run.chainState,
    releaseDecision: run.releaseDecision,
    score: run.score,
    readyGateCount: run.readyGateCount,
    blockedGateCount: run.blockedGateCount,
    operatorDecision: qualifiedReady ? "pause-for-qualified-human-release-review" : "do-not-share",
    nextStep:
      blockedSteps[0]?.requiredAction ??
      reviewSteps[0]?.requiredAction ??
      "Pause for qualified human release review in the approved external authority channel; this remains not release approval.",
    steps,
    readyEvidence,
    unresolvedBoundaries: run.unresolvedBoundaries,
    safeWorkarounds: run.safeWorkarounds,
    boundary: remediationBoundary,
    updated: "2026-06-23"
  };
}
