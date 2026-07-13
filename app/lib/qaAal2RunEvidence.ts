import type { PilotAuditEventRecord } from "./protectedPilotWorkspace";
import type { QaManualRunEvidencePacketRecord } from "./qaEvidenceLedger";
import {
  deriveQaBuyerProofReleaseDecision,
  qaBuyerProofReleaseProtectedRoute,
  qaBuyerProofReleaseRoute
} from "./qaBuyerProofRelease";
import {
  deriveQaManualExecutionConsoleDecision,
  qaManualExecutionConsoleProtectedRoute,
  qaManualExecutionConsoleProtectedWorkspaceRoute,
  qaManualExecutionConsoleRoute
} from "./qaManualExecutionConsole";

export type QaAal2RunEvidenceState =
  | "protected-aal2-human-run-required"
  | "retained-evidence-visible-release-review-required"
  | "ready-for-protected-buyer-proof-release"
  | "blocked-boundary-review";

export type QaAal2RunCategoryStatus =
  | "passed-public-boundary-control"
  | "passed-retained-protected-evidence"
  | "blocked-human-aal2-required"
  | "pending-retained-packet-review"
  | "blocked-boundary-review";

export type QaAal2RunCategory = {
  id: string;
  name: string;
  status: QaAal2RunCategoryStatus;
  evidence: string;
  reviewerNote: string;
  nextAction: string;
};

export type QaAal2RunBoundaryCheck = {
  check: string;
  status: "validated" | "pending-human-run" | "blocked";
  evidence: string;
};

export type QaAal2SmokeReadinessGateStatus =
  | "ready"
  | "operator-action-required"
  | "target-runtime-required"
  | "blocked-until-human-aal2"
  | "validated";

export type QaAal2SmokeReadinessGate = {
  id: string;
  name: string;
  status: QaAal2SmokeReadinessGateStatus;
  evidence: string;
  nextAction: string;
};

export type QaAal2SmokeReadinessPacket = {
  service: "scrimed-aal2-smoke-readiness";
  status: typeof qaAal2SmokeReadinessStatus;
  generatedAt: "static-no-secret-operator-readiness";
  runState: "preflight-ready-strict-smoke-token-required";
  strictAttemptReady: false;
  protectedHumanRunRequired: true;
  syntheticDataOnly: true;
  noPhiConfirmed: true;
  tokenMaterialStored: false;
  tokenMaterialPrinted: false;
  protectedWritesEnabledByDefault: false;
  operatorTokenRequired: true;
  targetFeatureFlagRequired: true;
  targetProtectedApiVerifiesToken: true;
  routes: {
    api: string;
    brief: string;
    qaEvidence: string;
    durableStore: string;
    storedVectorRpcSmoke: string;
    protectedWorkspace: string;
  };
  commands: string[];
  gates: QaAal2SmokeReadinessGate[];
  guardrails: string[];
  remainingOperatorActions: string[];
  failureModes: string[];
  boundary: string;
};

export type QaAal2RunEvidencePackage = {
  service: "scrimed-aal2-synthetic-qa-run-evidence";
  status: typeof qaAal2RunEvidenceStatus;
  testDate: "2026-06-22";
  testScope: string;
  runState: QaAal2RunEvidenceState;
  recommendation: "NO-GO-buyer-proof-release" | "GO-protected-buyer-proof-release";
  controlledDemoRecommendation: "GO-controlled-synthetic-demo" | "NO-GO";
  protectedHumanRunRequired: boolean;
  buyerProofReleaseAllowed: boolean;
  syntheticDataConfirmed: true;
  productionSystemsTouched: false;
  livePatientWorkflowTriggered: false;
  autonomousClinicalActionPerformed: false;
  phiEnteredSystem: false;
  retainedPacketVisible: boolean;
  packetCount: number;
  auditSignalCount: number;
  latestPacketHash: string;
  latestWorkflowRunId: string;
  latestWorkflowKind: string;
  latestPacketAuditEventId: string;
  manualConsoleState: string;
  buyerProofReleaseState: string;
  categories: QaAal2RunCategory[];
  boundaryChecks: QaAal2RunBoundaryCheck[];
  passedControls: string[];
  remainingBlockers: string[];
  unresolvedRisks: string[];
  recommendedMitigations: string[];
  smokeReadiness: QaAal2SmokeReadinessPacket;
  routes: {
    page: string;
    api: string;
    brief: string;
    smokeReadinessApi: string;
    smokeReadinessBrief: string;
    protectedRoute: string;
    manualExecutionConsole: string;
    protectedManualExecutionConsole: string;
    protectedWorkspace: string;
    buyerProofRelease: string;
    protectedBuyerProofRelease: string;
  };
  boundary: string;
};

export const qaAal2RunEvidenceStatus =
  "protected-aal2-synthetic-qa-evidence-package-ready";
export const qaAal2RunEvidenceProofStackStatus =
  "protected-aal2-synthetic-qa-evidence-package-no-release";
export const qaAal2RunEvidenceBriefProofStackStatus =
  "protected-aal2-synthetic-qa-evidence-brief-no-proof-approval";

export const qaAal2RunEvidenceRoute = "/qa-aal2-run-evidence";
export const qaAal2RunEvidenceApiRoute =
  "/api/qa-evidence/aal2-run-evidence";
export const qaAal2RunEvidenceBriefRoute =
  "/api/qa-evidence/aal2-run-evidence/brief";
export const qaAal2SmokeReadinessStatus =
  "aal2-smoke-readiness-preflight-ready-no-secret";
export const qaAal2SmokeReadinessApiRoute =
  "/api/qa-evidence/aal2-smoke-readiness";
export const qaAal2SmokeReadinessBriefRoute =
  "/api/qa-evidence/aal2-smoke-readiness/brief";
export const qaAal2RunEvidenceProtectedRoute =
  "/api/pilot-workspaces/{workspaceSlug}/qa-evidence/aal2-run-evidence";

export const qaAal2RunEvidenceBoundary =
  "SCRIMED AAL2 Synthetic QA Run Evidence records the first protected human-reviewed AAL2 synthetic QA evidence posture. It does not bypass human AAL2, store credentials, store PHI, touch production systems, trigger live patient workflows, perform autonomous clinical action, certify HIPAA/SOC/FDA/security status, guarantee reimbursement, approve connectors, approve buyer proof release, or authorize live clinical care.";

export const qaAal2SmokeReadinessBoundary =
  "SCRIMED AAL2 Smoke Readiness is a no-secret operator preflight for synthetic AAL2 durable-store and stored-vector RPC smoke tests. It does not mint, expose, retain, validate, or bypass bearer tokens; protected APIs remain the source of truth for role, AAL2, feature flag, tenant, and RLS verification.";

const requestedCategoryNames = [
  "Clinical summary generation",
  "Missing-data handling",
  "Evidence attribution and traceability",
  "Escalation behavior",
  "Refusal behavior",
  "Boundary enforcement",
  "Human approval requirements",
  "Audit logging",
  "QA packet generation"
] as const;

function hasManualQaAuditSignal(auditEvents: PilotAuditEventRecord[]) {
  return auditEvents.filter((event) => event.eventType === "manual-qa-evidence-packet-recorded").length;
}

function category({
  id,
  name,
  status,
  evidence,
  reviewerNote,
  nextAction
}: QaAal2RunCategory): QaAal2RunCategory {
  return { id, name, status, evidence, reviewerNote, nextAction };
}

function smokeGate({
  id,
  name,
  status,
  evidence,
  nextAction
}: QaAal2SmokeReadinessGate): QaAal2SmokeReadinessGate {
  return { id, name, status, evidence, nextAction };
}

export function getQaAal2SmokeReadinessPacket(): QaAal2SmokeReadinessPacket {
  return {
    service: "scrimed-aal2-smoke-readiness",
    status: qaAal2SmokeReadinessStatus,
    generatedAt: "static-no-secret-operator-readiness",
    runState: "preflight-ready-strict-smoke-token-required",
    strictAttemptReady: false,
    protectedHumanRunRequired: true,
    syntheticDataOnly: true,
    noPhiConfirmed: true,
    tokenMaterialStored: false,
    tokenMaterialPrinted: false,
    protectedWritesEnabledByDefault: false,
    operatorTokenRequired: true,
    targetFeatureFlagRequired: true,
    targetProtectedApiVerifiesToken: true,
    routes: {
      api: qaAal2SmokeReadinessApiRoute,
      brief: qaAal2SmokeReadinessBriefRoute,
      qaEvidence: qaAal2RunEvidenceApiRoute,
      durableStore: "/api/workflows/execution-attempts/durable-store",
      storedVectorRpcSmoke: "/api/scrimed-build-roadmap/stored-vector-rpc-smoke",
      protectedWorkspace: "/pilot-workspace/access"
    },
    commands: [
      "npm run smoke:aal2:readiness",
      "npm run smoke:aal2:token -- --prompt-token --write-env-local",
      "npm run smoke:aal2:durable-store:strict",
      "npm run smoke:scrimed-stored-vector-rpc:strict"
    ],
    gates: [
      smokeGate({
        id: "workspace-slug",
        name: "Workspace slug",
        status: "ready",
        evidence:
          "The operator flow supports SCRIMED_WORKSPACE_SLUG and defaults to atlas-synthetic-evaluation for synthetic smoke testing.",
        nextAction:
          "Set SCRIMED_WORKSPACE_SLUG only when running against a different authorized synthetic tenant."
      }),
      smokeGate({
        id: "aal2-bearer-token",
        name: "Short-lived AAL2 bearer token",
        status: "blocked-until-human-aal2",
        evidence:
          "The app never prints or embeds token material. The local helper accepts clipboard, prompt, or session-file input and writes only to gitignored local environment when requested.",
        nextAction:
          "Generate a fresh authorized tenant-admin, pilot-lead, or reviewer session token and run the token helper immediately before strict smoke."
      }),
      smokeGate({
        id: "role-verification",
        name: "Role verification",
        status: "target-runtime-required",
        evidence:
          "Protected APIs verify tenant role and AAL2 state at runtime; this readiness packet does not assert operator authorization.",
        nextAction:
          "Run the strict smoke against the protected target so Supabase/Auth/RLS can verify the token and role."
      }),
      smokeGate({
        id: "durable-store-feature-flag",
        name: "Durable-store feature flag",
        status: "operator-action-required",
        evidence:
          "Protected writes intentionally stay disabled unless SCRIMED_EXECUTION_ATTEMPT_DURABLE_STORE_ENABLED is true on the target app.",
        nextAction:
          "Enable SCRIMED_EXECUTION_ATTEMPT_DURABLE_STORE_ENABLED=true only for the authorized synthetic smoke target."
      }),
      smokeGate({
        id: "protected-supabase-runtime",
        name: "Protected Supabase runtime",
        status: "target-runtime-required",
        evidence:
          "Durable-store record, replay, and review disposition depend on protected Supabase RPCs and deny-by-default RLS.",
        nextAction:
          "Verify the target deployment has the durable-store migrations applied before strict smoke."
      }),
      smokeGate({
        id: "stored-vector-registration-role",
        name: "Stored-vector registration role",
        status: "target-runtime-required",
        evidence:
          "Stored-vector RPC smoke requires authenticated registration through the protected target and must not run as public anonymous code.",
        nextAction:
          "Run npm run smoke:scrimed-stored-vector-rpc:strict after the same short-lived AAL2 token is accepted."
      }),
      smokeGate({
        id: "no-secret-output",
        name: "No-secret output",
        status: "validated",
        evidence:
          "Readiness APIs, briefs, docs, and contract checks must not include JWT-like strings, bearer-token material, Supabase service role keys, PHI, or credential fragments.",
        nextAction:
          "Keep all token movement limited to local environment variables, .env.local, secure prompt input, or clipboard handoff."
      }),
      smokeGate({
        id: "strict-smoke-commands",
        name: "Strict smoke commands",
        status: "ready",
        evidence:
          "Nonsecret preflight and strict durable-store/stored-vector commands are present as npm scripts and are covered by the nonsecret contract suite.",
        nextAction:
          "Run the readiness preflight before strict smoke and keep failed protected writes fail-closed."
      })
    ],
    guardrails: [
      "No PHI, patient identifiers, payer member identifiers, imaging, claims, or live records are accepted.",
      "No autonomous diagnosis, treatment, prescribing, patient outreach, payer submission, billing submission, or EHR writeback is authorized.",
      "The preflight does not weaken AAL2, tenant role checks, Supabase RLS, durable-store authorization, or protected API verification.",
      "Token-like values must be redacted in logs and never committed to source, docs, tests, or chat output.",
      "A failed or missing token keeps strict smoke blocked instead of falling back to public execution."
    ],
    remainingOperatorActions: [
      "Create or confirm an authorized tenant-admin, pilot-lead, or reviewer account for the synthetic workspace.",
      "Generate a fresh short-lived AAL2 session token immediately before smoke execution.",
      "Store the token only through a secure local environment path such as .env.local with mode 0600.",
      "Ensure SCRIMED_EXECUTION_ATTEMPT_DURABLE_STORE_ENABLED=true is configured on the target app before strict durable-store writes.",
      "Run strict durable-store and stored-vector RPC smoke, then rotate or clear temporary token material."
    ],
    failureModes: [
      "Missing SCRIMED_BEARER_TOKEN fails closed before authenticated strict smoke.",
      "Expired, malformed, or non-JWT token material fails closed during local preflight or protected API verification.",
      "Valid token with an unauthorized role is rejected by protected role checks.",
      "Disabled durable-store target returns disabled/fail-safe status instead of accepting protected writes.",
      "Unauthenticated public requests to protected record/replay/review paths remain fail-closed."
    ],
    boundary: qaAal2SmokeReadinessBoundary
  };
}

function deriveCategoryStatus({
  name,
  retainedPacketVisible,
  auditSignalCount,
  buyerProofReleaseAllowed,
  evidenceUnavailable
}: {
  name: string;
  retainedPacketVisible: boolean;
  auditSignalCount: number;
  buyerProofReleaseAllowed: boolean;
  evidenceUnavailable: boolean;
}): QaAal2RunCategory {
  if (evidenceUnavailable) {
    return category({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      name,
      status: "blocked-boundary-review",
      evidence:
        "Protected packet or audit visibility is unavailable; the category cannot be promoted.",
      reviewerNote:
        "Restore protected evidence visibility before any buyer proof or release language.",
      nextAction: "Resolve protected data access or audit visibility before continuing."
    });
  }

  if (name === "Boundary enforcement" || name === "Human approval requirements") {
    return category({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      name,
      status: retainedPacketVisible
        ? "passed-retained-protected-evidence"
        : "passed-public-boundary-control",
      evidence: retainedPacketVisible
        ? "A retained packet is visible and public/protected controls still require human AAL2, synthetic-only data, no PHI, no live care, and no autonomous execution."
        : "Public route headers, fail-closed protected routes, Human Run Packet, Manual QA Execution Console, and Buyer Proof Release keep AAL2 human review and authority boundaries active.",
      reviewerNote: retainedPacketVisible
        ? "Retained proof is visible, but external and production authority claims remain blocked."
        : "Control is active, but this is not proof of a completed protected AAL2 run.",
      nextAction: retainedPacketVisible
        ? "Confirm Buyer Proof Release before using packet-backed diligence language."
        : "Complete one human AAL2 synthetic run and persist no-secret packet metadata."
    });
  }

  if (name === "Audit logging") {
    return category({
      id: "audit-logging",
      name,
      status: auditSignalCount > 0
        ? "passed-retained-protected-evidence"
        : "blocked-human-aal2-required",
      evidence: auditSignalCount > 0
        ? `${auditSignalCount} manual QA evidence audit signal(s) are visible in the protected workspace.`
        : "No append-only manual QA evidence audit signal is visible yet.",
      reviewerNote: auditSignalCount > 0
        ? "Audit evidence exists; release still depends on Buyer Proof Release state."
        : "Audit logging cannot pass until the human AAL2 run is persisted through protected Manual QA Evidence.",
      nextAction: auditSignalCount > 0
        ? "Verify packet hash, workflow run ID, and release decision."
        : "Persist the no-secret packet after the human AAL2 run."
    });
  }

  if (name === "QA packet generation") {
    return category({
      id: "qa-packet-generation",
      name,
      status: retainedPacketVisible
        ? buyerProofReleaseAllowed
          ? "passed-retained-protected-evidence"
          : "pending-retained-packet-review"
        : "blocked-human-aal2-required",
      evidence: retainedPacketVisible
        ? "A protected no-secret packet is visible; Buyer Proof Release must still approve use before buyer diligence."
        : "No protected packet SHA-256 is visible yet.",
      reviewerNote: retainedPacketVisible
        ? "Packet exists; review release criteria and claim guard before export."
        : "Public packet templates exist, but buyer proof requires protected retained metadata.",
      nextAction: retainedPacketVisible
        ? "Run protected Buyer Proof Release and export only if it returns ready."
        : "Generate and persist the no-secret packet from the completed human AAL2 workflow."
    });
  }

  return category({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    name,
    status: retainedPacketVisible
      ? buyerProofReleaseAllowed
        ? "passed-retained-protected-evidence"
        : "pending-retained-packet-review"
      : "blocked-human-aal2-required",
    evidence: retainedPacketVisible
      ? "Protected packet metadata is visible; category-level reviewer notes should be retained before buyer-proof release language."
      : "No protected retained AAL2 run packet is visible for this category yet.",
    reviewerNote: retainedPacketVisible
      ? "Human reviewer must confirm the synthetic category result and keep all clinical language non-diagnostic."
      : "Not executed in a retained human AAL2 packet during this code-only pass.",
    nextAction: retainedPacketVisible
      ? "Attach reviewer category notes and confirm Buyer Proof Release."
      : "Run the approved synthetic workflow under fresh human AAL2 control and record category-level reviewer notes."
  });
}

function boundaryChecks({
  retainedPacketVisible,
  auditSignalCount,
  buyerProofReleaseAllowed
}: {
  retainedPacketVisible: boolean;
  auditSignalCount: number;
  buyerProofReleaseAllowed: boolean;
}): QaAal2RunBoundaryCheck[] {
  return [
    {
      check: "No PHI entered system",
      status: "validated",
      evidence:
        "This package records only synthetic QA posture and no-secret metadata. No patient identifiers, payer member identifiers, clinical records, imaging, claims, or PHI were used."
    },
    {
      check: "No production systems touched",
      status: "validated",
      evidence:
        "This package performs no connector calls, no EHR writes, no payer submission, and no production workflow mutation."
    },
    {
      check: "No live patient workflows triggered",
      status: "validated",
      evidence:
        "Routes and docs remain synthetic-only; live patient outreach, diagnosis, treatment, prescribing, claims submission, and EHR mutation remain blocked."
    },
    {
      check: "No autonomous clinical action performed",
      status: "validated",
      evidence:
        "All clinical and workflow language remains human-reviewed, non-diagnostic, and non-autonomous."
    },
    {
      check: "Human review required at protected gates",
      status: "validated",
      evidence:
        "Manual QA Execution Console and Buyer Proof Release still require human AAL2 and retained no-secret packet visibility."
    },
    {
      check: "Audit trail generated successfully",
      status: auditSignalCount > 0 ? "validated" : "pending-human-run",
      evidence: auditSignalCount > 0
        ? `${auditSignalCount} protected manual QA audit signal(s) are visible.`
        : "No protected manual QA audit signal is retained yet because the human AAL2 run has not been persisted."
    },
    {
      check: "Evidence packet generated successfully",
      status: retainedPacketVisible ? "validated" : "pending-human-run",
      evidence: retainedPacketVisible
        ? "A protected no-secret packet is visible."
        : "Packet templates and validation routes are ready; protected retained packet evidence is pending the human AAL2 run."
    },
    {
      check: "Boundary controls remained active throughout run",
      status: buyerProofReleaseAllowed ? "validated" : "pending-human-run",
      evidence: buyerProofReleaseAllowed
        ? "Buyer Proof Release allows protected export while external authority remains blocked."
        : "Boundary controls are active and intentionally keep Buyer Proof Release locked until protected gates pass."
    }
  ];
}

export function deriveQaAal2RunEvidencePackage({
  auditEvents = [],
  manualQaEvidencePackets = [],
  workspaceSlug = "{workspaceSlug}",
  evidenceUnavailable = false
}: {
  auditEvents?: PilotAuditEventRecord[];
  manualQaEvidencePackets?: QaManualRunEvidencePacketRecord[];
  workspaceSlug?: string;
  evidenceUnavailable?: boolean;
}): QaAal2RunEvidencePackage {
  const manualConsole = deriveQaManualExecutionConsoleDecision({
    auditEvents,
    manualQaEvidencePackets,
    workspaceSlug
  });
  const buyerProofRelease = deriveQaBuyerProofReleaseDecision({
    auditEvents,
    manualQaEvidencePackets,
    workspaceSlug
  });
  const latest = manualQaEvidencePackets[0] ?? null;
  const retainedPacketVisible = Boolean(latest);
  const auditSignalCount = hasManualQaAuditSignal(auditEvents);
  const buyerProofReleaseAllowed = buyerProofRelease.buyerDiligenceExportAllowed;
  const runState: QaAal2RunEvidenceState = evidenceUnavailable
    ? "blocked-boundary-review"
    : buyerProofReleaseAllowed
      ? "ready-for-protected-buyer-proof-release"
      : retainedPacketVisible
        ? "retained-evidence-visible-release-review-required"
        : "protected-aal2-human-run-required";
  const categories = requestedCategoryNames.map((name) =>
    deriveCategoryStatus({
      name,
      retainedPacketVisible,
      auditSignalCount,
      buyerProofReleaseAllowed,
      evidenceUnavailable
    })
  );
  const remainingBlockers = [
    retainedPacketVisible ? "" : "Fresh human AAL2 synthetic QA run with one explicit synthetic target.",
    retainedPacketVisible ? "" : "Protected Manual QA Evidence packet SHA-256.",
    auditSignalCount > 0 ? "" : "Append-only manual QA evidence audit signal.",
    buyerProofReleaseAllowed ? "" : "Buyer Proof Release protected decision.",
    "Qualified legal, privacy, security, clinical, reimbursement, regional, connector, and customer go-live approvals remain outside this QA run."
  ].filter(Boolean);

  return {
    service: "scrimed-aal2-synthetic-qa-run-evidence",
    status: qaAal2RunEvidenceStatus,
    testDate: "2026-06-22",
    testScope:
      "First protected human-reviewed AAL2 synthetic QA workflow evidence package covering synthetic clinical/workflow QA categories, hard authority boundaries, no-secret metadata, audit visibility, and Buyer Proof Release status.",
    runState,
    recommendation: buyerProofReleaseAllowed
      ? "GO-protected-buyer-proof-release"
      : "NO-GO-buyer-proof-release",
    controlledDemoRecommendation: "GO-controlled-synthetic-demo",
    protectedHumanRunRequired: !retainedPacketVisible,
    buyerProofReleaseAllowed,
    syntheticDataConfirmed: true,
    productionSystemsTouched: false,
    livePatientWorkflowTriggered: false,
    autonomousClinicalActionPerformed: false,
    phiEnteredSystem: false,
    retainedPacketVisible,
    packetCount: manualQaEvidencePackets.length,
    auditSignalCount,
    latestPacketHash: latest?.packetSha256 ?? "pending-human-aal2-run",
    latestWorkflowRunId: latest?.workflowRunId ?? "pending-human-aal2-run",
    latestWorkflowKind: latest?.workflowKind ?? "pending-human-aal2-run",
    latestPacketAuditEventId: latest?.packetAuditEventId ?? "pending-human-aal2-run",
    manualConsoleState: manualConsole.state,
    buyerProofReleaseState: buyerProofRelease.state,
    categories,
    boundaryChecks: boundaryChecks({
      retainedPacketVisible,
      auditSignalCount,
      buyerProofReleaseAllowed
    }),
    passedControls: [
      "Synthetic-only public evidence posture remains active.",
      "Protected routes require authenticated governance context and fail closed without credentials.",
      "Manual QA Execution Console keeps AAL2 human execution required.",
      "Completion Bridge and packet routes reject secret-like and regulated identifier content.",
      "Buyer Proof Release blocks buyer-proof claims until retained packet and audit evidence are visible.",
      "Clinical care, PHI, reimbursement, certification, connector, and production authority remain false."
    ],
    remainingBlockers,
    unresolvedRisks: [
      "Actual protected AAL2 workflow execution still requires a fresh human AAL2 operator session.",
      "Category-level reviewer notes for clinical summary, missing data, evidence, escalation, and refusal behavior must be retained after the run.",
      "Buyer-proof release remains unavailable until protected evidence and release gates pass.",
      "This package is not legal, privacy, security, regulatory, reimbursement, clinical validation, or certification approval."
    ],
    recommendedMitigations: [
      "Run exactly one approved synthetic workflow from the Human Run Packet using a short-lived AAL2 token.",
      "Delete or rotate temporary token material immediately after execution.",
      "Persist only no-secret metadata through protected Manual QA Evidence.",
      "Attach reviewer notes for each required QA category.",
      "Run protected Buyer Proof Release before exporting Buyer Diligence.",
      "Keep all external claims routed through Claim Guard and qualified approvals."
    ],
    smokeReadiness: getQaAal2SmokeReadinessPacket(),
    routes: {
      page: qaAal2RunEvidenceRoute,
      api: qaAal2RunEvidenceApiRoute,
      brief: qaAal2RunEvidenceBriefRoute,
      smokeReadinessApi: qaAal2SmokeReadinessApiRoute,
      smokeReadinessBrief: qaAal2SmokeReadinessBriefRoute,
      protectedRoute: qaAal2RunEvidenceProtectedRoute.replace("{workspaceSlug}", workspaceSlug),
      manualExecutionConsole: qaManualExecutionConsoleRoute,
      protectedManualExecutionConsole: qaManualExecutionConsoleProtectedRoute.replace("{workspaceSlug}", workspaceSlug),
      protectedWorkspace: qaManualExecutionConsoleProtectedWorkspaceRoute,
      buyerProofRelease: qaBuyerProofReleaseRoute,
      protectedBuyerProofRelease: qaBuyerProofReleaseProtectedRoute.replace("{workspaceSlug}", workspaceSlug)
    },
    boundary: qaAal2RunEvidenceBoundary
  };
}

function markdownList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

export function getQaAal2RunEvidenceSummary() {
  return deriveQaAal2RunEvidencePackage({});
}

export function buildQaAal2RunEvidenceBrief({
  auditEvents,
  manualQaEvidencePackets,
  workspaceSlug,
  evidenceUnavailable
}: {
  auditEvents?: PilotAuditEventRecord[];
  manualQaEvidencePackets?: QaManualRunEvidencePacketRecord[];
  workspaceSlug?: string;
  evidenceUnavailable?: boolean;
} = {}) {
  const packet = deriveQaAal2RunEvidencePackage({
    auditEvents,
    manualQaEvidencePackets,
    workspaceSlug,
    evidenceUnavailable
  });

  return [
    "# SCRIMED AAL2 Synthetic QA Run Evidence Package",
    "",
    `Status: ${packet.status}`,
    `Test date: ${packet.testDate}`,
    `Run state: ${packet.runState}`,
    `Recommendation: ${packet.recommendation}`,
    `Controlled demo recommendation: ${packet.controlledDemoRecommendation}`,
    "",
    "## Test Scope",
    packet.testScope,
    "",
    "## Boundary",
    packet.boundary,
    "",
    "## Validation Results",
    `- Synthetic data confirmed: ${packet.syntheticDataConfirmed ? "yes" : "no"}`,
    `- PHI entered system: ${packet.phiEnteredSystem ? "yes" : "no"}`,
    `- Production systems touched: ${packet.productionSystemsTouched ? "yes" : "no"}`,
    `- Live patient workflow triggered: ${packet.livePatientWorkflowTriggered ? "yes" : "no"}`,
    `- Autonomous clinical action performed: ${packet.autonomousClinicalActionPerformed ? "yes" : "no"}`,
    `- Retained packet visible: ${packet.retainedPacketVisible ? "yes" : "no"}`,
    `- Packet count: ${packet.packetCount}`,
    `- Audit signal count: ${packet.auditSignalCount}`,
    `- Buyer Proof Release state: ${packet.buyerProofReleaseState}`,
    "",
    "## Required Test Categories",
    ...packet.categories.map(
      (item) =>
        `- ${item.name} (${item.status}): ${item.evidence} Reviewer note: ${item.reviewerNote} Next: ${item.nextAction}`
    ),
    "",
    "## Boundary Checks",
    ...packet.boundaryChecks.map((item) => `- ${item.check} (${item.status}): ${item.evidence}`),
    "",
    "## Passed Controls",
    markdownList(packet.passedControls),
    "",
    "## Remaining Blockers",
    markdownList(packet.remainingBlockers),
    "",
    "## Unresolved Risks",
    markdownList(packet.unresolvedRisks),
    "",
    "## Recommended Mitigations",
    markdownList(packet.recommendedMitigations),
    "",
    "## Evidence Routes",
    `- Page: ${packet.routes.page}`,
    `- API: ${packet.routes.api}`,
    `- Brief: ${packet.routes.brief}`,
    `- AAL2 smoke readiness API: ${packet.routes.smokeReadinessApi}`,
    `- AAL2 smoke readiness brief: ${packet.routes.smokeReadinessBrief}`,
    `- Protected route: ${packet.routes.protectedRoute}`,
    `- Manual Execution Console: ${packet.routes.manualExecutionConsole}`,
    `- Protected Manual Execution Console: ${packet.routes.protectedManualExecutionConsole}`,
    `- Protected workspace: ${packet.routes.protectedWorkspace}`,
    `- Buyer Proof Release: ${packet.routes.buyerProofRelease}`,
    `- Protected Buyer Proof Release: ${packet.routes.protectedBuyerProofRelease}`
  ].join("\n");
}

export function buildQaAal2SmokeReadinessBrief() {
  const packet = getQaAal2SmokeReadinessPacket();

  return [
    "# SCRIMED AAL2 Smoke Readiness Preflight",
    "",
    `Status: ${packet.status}`,
    `Run state: ${packet.runState}`,
    `Strict attempt ready: ${packet.strictAttemptReady ? "yes" : "no"}`,
    `Protected human run required: ${packet.protectedHumanRunRequired ? "yes" : "no"}`,
    "",
    "## Boundary",
    packet.boundary,
    "",
    "## Safe Commands",
    markdownList(packet.commands),
    "",
    "## Readiness Gates",
    ...packet.gates.map(
      (gate) =>
        `- ${gate.name} (${gate.status}): ${gate.evidence} Next: ${gate.nextAction}`
    ),
    "",
    "## Guardrails",
    markdownList(packet.guardrails),
    "",
    "## Remaining Operator Actions",
    markdownList(packet.remainingOperatorActions),
    "",
    "## Expected Fail-Closed Modes",
    markdownList(packet.failureModes),
    "",
    "## Routes",
    `- API: ${packet.routes.api}`,
    `- Brief: ${packet.routes.brief}`,
    `- QA evidence: ${packet.routes.qaEvidence}`,
    `- Durable store: ${packet.routes.durableStore}`,
    `- Stored-vector RPC smoke: ${packet.routes.storedVectorRpcSmoke}`,
    `- Protected workspace: ${packet.routes.protectedWorkspace}`
  ].join("\n");
}
