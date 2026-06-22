import {
  salesDemoSessionQaApiRoute,
  salesDemoSessionQaBoundary,
  salesDemoSessionQaControls,
  salesDemoSessionQaProofStackStatus,
  salesDemoSessionQaTokenPolicy
} from "./salesDemoSessionQa";

export type QaEvidenceStatus = "passed" | "fail-closed" | "manual-gate" | "workaround-active";

export type QaEvidenceEntry = {
  id: string;
  name: string;
  status: QaEvidenceStatus;
  owner: string;
  recordedAt: string;
  artifact: string;
  routes: string[];
  evidence: string;
  limitation: string;
  workaround: string;
  nextAction: string;
};

export type QaKnownLimitation = {
  title: string;
  impact: string;
  currentControl: string;
  resolutionPath: string;
  status: "contained" | "manual-action-required" | "external-review-required";
};

export type QaManualRunWorkflowKind =
  | "sales-demo-session-qa"
  | "authority-reference-qa";

export type QaEvidenceActivationWorkflow = {
  workflowKind: QaManualRunWorkflowKind;
  name: string;
  status: "ready-for-human-aal2-run";
  workflowPath: string;
  preflightScript: string;
  smokeScript: string;
  targetInput: string;
  requiredSecretName: string;
  protectedRoutes: string[];
  safeEvidenceFields: string[];
  prohibitedInputs: string[];
  operatorSteps: string[];
  persistenceTarget: string;
  buyerDiligenceImpact: string;
  currentBoundary: string;
  workaround: string;
  nextAction: string;
};

export type QaManualRunEvidenceInput = {
  workflowKind?: QaManualRunWorkflowKind;
  workflowRunId: string;
  workflowRunUrl: string;
  executedAt: string;
  baseUrl: string;
  intakeId: string;
  createdSessionId: string;
  packetAuditEventId: string;
  evidenceTargetLabel?: string;
  evidenceObjectLabel?: string;
  packetAuditEventLabel?: string;
  evidenceRoute?: string;
  packetRoute?: string;
  operatorRunbook?: string;
  qaOutcome: "pass";
  operatorAttestation: "no-secrets-no-phi-aal2-human-run";
  tokenDisposalAttestation: "temporary-token-deleted-or-rotated";
  dataBoundary: "synthetic-business-workflow-only";
};

export type QaManualRunEvidencePacketRecord = QaManualRunEvidenceInput & {
  id: string;
  tenantId: string;
  workspaceId: string;
  packetMarkdown: string;
  packetSha256: string;
  createdBy: string;
  createdAt: string;
  boundary: string;
};

export const qaEvidenceLedgerRoute = "/qa-evidence";
export const qaEvidenceLedgerApiRoute = "/api/qa-evidence";
export const qaEvidenceLedgerBriefRoute = "/api/qa-evidence/brief";
export const qaEvidenceActivationPlanApiRoute = "/api/qa-evidence/activation-plan";
export const qaEvidenceActivationPlanBriefRoute =
  "/api/qa-evidence/activation-plan/brief";
export const qaManualRunEvidencePacketApiRoute = "/api/qa-evidence/manual-run-packet";
export const qaManualRunEvidencePersistenceApiRoute =
  "/api/pilot-workspaces/{workspaceSlug}/qa-evidence/manual-run-packets";

export const qaEvidenceLedgerStatus = "qa-evidence-ledger-active";
export const qaEvidenceLedgerProofStackStatus =
  "dated-qa-evidence-ledger-with-manual-aal2-gate";
export const qaManualRunEvidencePacketStatus =
  "manual-aal2-run-evidence-packet-ready";
export const qaManualRunEvidencePersistenceStatus =
  "tenant-scoped-aal2-manual-qa-evidence-ledger";
export const qaAuthorityReferenceEvidenceBridgeStatus =
  "authority-reference-qa-evidence-bridge-ready";
export const qaEvidenceActivationPlanStatus =
  "manual-aal2-qa-evidence-activation-plan-ready";

export const qaEvidenceLedgerBoundary =
  "SCRIMED QA Evidence Ledger records synthetic-only release, smoke, token-policy, fail-closed, and operator-gate evidence. It is not a clinical validation report, security certification, legal opinion, SOC report, HIPAA attestation, or authorization for live healthcare execution.";

export const qaEvidenceActivationWorkflows: QaEvidenceActivationWorkflow[] = [
  {
    workflowKind: "sales-demo-session-qa",
    name: "Sales Demo Session QA activation",
    status: "ready-for-human-aal2-run",
    workflowPath: ".github/workflows/sales-demo-session-qa-smoke.yml",
    preflightScript: "scripts/sales-demo-session-qa-token-preflight.mjs",
    smokeScript: "scripts/sales-demo-session-qa-smoke.mjs",
    targetInput: "intake_id",
    requiredSecretName: "SCRIMED_SALES_QA_BEARER_TOKEN",
    protectedRoutes: [salesDemoSessionQaApiRoute, "/sales-operations", "/pilot-deal-room"],
    safeEvidenceFields: [
      "workflowKind=sales-demo-session-qa",
      "workflowRunId",
      "workflowRunUrl",
      "executedAt",
      "baseUrl",
      "intakeId",
      "createdSessionId",
      "packetAuditEventId",
      "packetSha256 after protected persistence"
    ],
    prohibitedInputs: [
      "bearer tokens",
      "refresh tokens",
      "passwords",
      "patient identifiers",
      "payer member identifiers",
      "source contracts",
      "clinical records",
      "legal conclusions"
    ],
    operatorSteps: [
      "Open Sales Operations with an approved AAL2 tenant-admin session.",
      "Select one explicit synthetic buyer opportunity and capture its intake ID.",
      "Create a temporary masked GitHub secret only for the short-lived AAL2 token.",
      "Dispatch the Sales Demo Session QA workflow with require_authenticated_path enabled.",
      "Confirm preflight and smoke pass; copy only safe IDs from workflow output.",
      "Delete or rotate the temporary secret immediately after the workflow finishes.",
      "Persist the safe metadata through /pilot-workspace/access -> Manual QA Evidence.",
      "Export Buyer Diligence so the retained packet hash and audit trail appear in buyer proof."
    ],
    persistenceTarget: qaManualRunEvidencePersistenceApiRoute,
    buyerDiligenceImpact:
      "Adds tenant-scoped evidence that SCRIMED can create and audit a governed synthetic buyer demo session under human AAL2 control.",
    currentBoundary:
      "No authenticated sales-demo CI evidence can be claimed until a human runs the workflow with a fresh short-lived AAL2 token.",
    workaround:
      "All surrounding controls remain verified by public smoke and fail-closed checks; the activation plan prevents token material from becoming evidence.",
    nextAction:
      "Run the manual workflow once a fresh AAL2 tenant-admin token and safe synthetic intake target are available."
  },
  {
    workflowKind: "authority-reference-qa",
    name: "Authority Reference QA activation",
    status: "ready-for-human-aal2-run",
    workflowPath: ".github/workflows/authority-reference-qa-smoke.yml",
    preflightScript: "scripts/authority-artifact-reference-qa-token-preflight.mjs",
    smokeScript: "scripts/authority-artifact-reference-qa-smoke.mjs",
    targetInput: "workspace_slug",
    requiredSecretName: "SCRIMED_BEARER_TOKEN",
    protectedRoutes: [
      "/api/pilot-workspaces/{workspaceSlug}/authority-artifact-references",
      "/api/pilot-workspaces/{workspaceSlug}/authority-artifact-references/renewal-queue",
      "/api/pilot-workspaces/{workspaceSlug}/authority-artifact-references/packet"
    ],
    safeEvidenceFields: [
      "workflowKind=authority-reference-qa",
      "workflowRunId",
      "workflowRunUrl",
      "executedAt",
      "baseUrl",
      "workspace slug as intakeId",
      "created authority reference UUID as createdSessionId",
      "authority packet audit event UUID as packetAuditEventId",
      "packetSha256 after protected persistence"
    ],
    prohibitedInputs: [
      "bearer tokens",
      "refresh tokens",
      "artifact URLs",
      "signed approvals",
      "legal opinions",
      "security reports",
      "reimbursement determinations",
      "PHI",
      "production credentials"
    ],
    operatorSteps: [
      "Open /pilot-workspace/access with an approved AAL2 tenant governance session.",
      "Use the protected workspace slug as the explicit workflow target.",
      "Create a temporary masked GitHub secret only for the short-lived AAL2 token.",
      "Dispatch the Authority Reference QA workflow with require_authenticated_path enabled.",
      "Confirm the workflow records one synthetic metadata-only reference, verifies the renewal queue, and downloads the audited packet.",
      "Copy only the printed safe evidence fields: workflow kind, workspace target, reference UUID, and packet audit event UUID.",
      "Delete or rotate the temporary secret immediately after the workflow finishes.",
      "Persist the safe metadata through /pilot-workspace/access -> Manual QA Evidence in authority-reference mode.",
      "Export Buyer Diligence so authority-reference QA evidence appears with the retained hard-gate boundaries."
    ],
    persistenceTarget: qaManualRunEvidencePersistenceApiRoute,
    buyerDiligenceImpact:
      "Adds tenant-scoped evidence that SCRIMED can record and audit no-PHI authority-reference readiness metadata under human AAL2 control.",
    currentBoundary:
      "No authenticated authority-reference CI evidence can be claimed until a human runs the workflow with a fresh short-lived AAL2 token.",
    workaround:
      "The renewal queue, fail-closed protected routes, stateless packet generation, and no-secret persistence bridge are already verified without storing credentials.",
    nextAction:
      "Run the manual workflow once a fresh AAL2 tenant governance token and synthetic workspace target are available."
  }
];

export const qaEvidenceEntries: QaEvidenceEntry[] = [
  {
    id: "public-production-smoke",
    name: "Public production smoke",
    status: "passed",
    owner: "Release engineering",
    recordedAt: "2026-06-18",
    artifact: "scripts/public-production-smoke.mjs",
    routes: [
      "/pilot-workspace/access",
      "/sales-operations",
      "/competitive-edge",
      "/pilot-deal-room",
      "/api/product/console",
      "/api/pilot-workspaces/readiness"
    ],
    evidence:
      "Production smoke verified public HTML, product console proof-stack posture, readiness APIs, and protected-route fail-closed behavior on app.scrimedsolutions.com.",
    limitation: "Does not authenticate or mutate tenant-admin records.",
    workaround:
      "Protected routes must return a fail-closed response without credentials; authenticated mutation evidence is isolated behind AAL2 operator-token QA.",
    nextAction: "Run after each release and keep the product proof-stack assertion current."
  },
  {
    id: "local-production-build-smoke",
    name: "Local production build and smoke",
    status: "passed",
    owner: "Engineering",
    recordedAt: "2026-06-18",
    artifact: "next build --webpack plus local production smoke",
    routes: ["/quality", "/pilot-evidence", qaEvidenceLedgerRoute, qaEvidenceLedgerApiRoute],
    evidence:
      "TypeScript, ESLint, generated integrity, production build, and local production smoke passed using the bundled Node runtime when the managed shell omitted node/npm from PATH.",
    limitation: "The local Codex shell may not expose npm or node on PATH consistently.",
    workaround:
      "Use the bundled Node absolute path for local verification; GitHub Actions and Vercel continue to run standard Node 22 commands.",
    nextAction: "Restore normal local package-manager PATH when convenient; keep absolute-Node fallback documented."
  },
  {
    id: "sales-demo-session-token-policy",
    name: "Sales demo session token policy",
    status: "passed",
    owner: "Trust engineering",
    recordedAt: "2026-06-18",
    artifact: salesDemoSessionQaTokenPolicy.preflightScript,
    routes: [
      salesDemoSessionQaTokenPolicy.workflowPath,
      salesDemoSessionQaTokenPolicy.runbookPath,
      salesDemoSessionQaApiRoute
    ],
    evidence:
      "Short-lived AAL2 JWT preflight, no-secret safe skip, policy self-test, explicit intake targeting, and manual-only GitHub workflow are implemented.",
    limitation:
      "Static preflight decodes claims but does not verify JWT signature; protected SCRIMED APIs and Supabase Auth remain the verification authority.",
    workaround:
      "Preflight blocks weak token shape before network access; authenticated route verification still happens inside the protected API.",
    nextAction: "Mint a fresh AAL2 operator token only for a deliberate manual QA workflow run."
  },
  {
    id: "sales-demo-session-authenticated-ci",
    name: "First authenticated Sales Demo Session QA CI run",
    status: "manual-gate",
    owner: "SCRIMED operator",
    recordedAt: "2026-06-18",
    artifact: ".github/workflows/sales-demo-session-qa-smoke.yml",
    routes: [salesDemoSessionQaApiRoute, "/sales-operations", "/pilot-deal-room"],
    evidence:
      "The runnable workflow, token preflight, smoke harness, and protected API path are present; the first live authenticated CI run still requires a fresh AAL2 operator session and explicit buyer-opportunity target.",
    limitation:
      "No long-lived bearer token should be stored in repo, docs, runtime config, or unattended CI.",
    workaround:
      "Keep the workflow manual, store the token only as a temporary masked GitHub Actions secret, run against one explicit intake ID, then delete or rotate the secret immediately after evidence capture.",
    nextAction: "Run the manual workflow once a fresh AAL2 token and safe synthetic intake target are available."
  },
  {
    id: "authority-reference-authenticated-ci",
    name: "Authenticated Authority Reference QA run",
    status: "manual-gate",
    owner: "SCRIMED operator",
    recordedAt: "2026-06-21",
    artifact: ".github/workflows/authority-reference-qa-smoke.yml",
    routes: [
      "/api/pilot-workspaces/{workspaceSlug}/authority-artifact-references",
      "/api/pilot-workspaces/{workspaceSlug}/authority-artifact-references/renewal-queue",
      "/api/pilot-workspaces/{workspaceSlug}/authority-artifact-references/packet"
    ],
    evidence:
      "The protected authority-reference QA script, renewal queue, packet audit path, and manual workflow wrapper are present; the first authenticated run still requires a fresh short-lived AAL2 tenant token.",
    limitation:
      "No long-lived bearer token should be stored in source, runtime config, docs, or unattended CI.",
    workaround:
      "Run the manual workflow with a temporary masked GitHub Actions secret, capture only the workflow run ID, created authority reference ID, packet audit event ID, and packet hash, then delete or rotate the secret.",
    nextAction:
      "Run the authority-reference QA workflow once a fresh AAL2 token is available, then persist the safe metadata through the Manual QA Evidence panel in authority-reference mode."
  },
  {
    id: "manual-aal2-qa-activation-plan",
    name: "Manual AAL2 QA evidence activation plan",
    status: "workaround-active",
    owner: "Release engineering",
    recordedAt: "2026-06-21",
    artifact: qaEvidenceActivationPlanApiRoute,
    routes: [
      qaEvidenceActivationPlanApiRoute,
      qaEvidenceActivationPlanBriefRoute,
      ".github/workflows/sales-demo-session-qa-smoke.yml",
      ".github/workflows/authority-reference-qa-smoke.yml"
    ],
    evidence:
      "A no-secret activation plan now gives operators workflow-specific target inputs, token preflight paths, safe evidence fields, prohibited content, persistence route, Buyer Diligence impact, and retained boundaries before any AAL2 run.",
    limitation:
      "The activation plan coordinates the human run; it does not mint tokens, execute passkey ceremonies, or create authenticated proof by itself.",
    workaround:
      "Use the plan as the mandatory bridge between manual GitHub workflow execution, secret disposal, protected Manual QA Evidence persistence, and Buyer Diligence export.",
    nextAction:
      "Run each manual AAL2 QA workflow from the plan, persist only safe metadata, then export Buyer Diligence after packet hashes appear."
  },
  {
    id: "manual-run-evidence-capture",
    name: "Manual AAL2 run evidence capture",
    status: "workaround-active",
    owner: "Release engineering",
    recordedAt: "2026-06-18",
    artifact: qaManualRunEvidencePacketApiRoute,
    routes: [
      qaManualRunEvidencePacketApiRoute,
      qaEvidenceLedgerRoute,
      salesDemoSessionQaApiRoute,
      "/api/pilot-workspaces/{workspaceSlug}/authority-artifact-references/renewal-queue"
    ],
    evidence:
      "A stateless evidence packet generator validates non-secret workflow run metadata, created evidence object ID, packet audit event ID, operator attestation, token-disposal attestation, and workflow kind after the manual QA workflow completes.",
    limitation:
      "The packet generator does not execute the authenticated QA run by itself.",
    workaround:
      "Use it immediately after the manual workflow run to produce a sanitized packet, then persist the same non-secret run metadata through the protected tenant-scoped evidence route.",
    nextAction:
      "After the first manual workflow pass for Sales Demo Session QA or Authority Reference QA, POST the non-secret run metadata to the packet route, then persist it through the workspace evidence route for buyer-room visibility."
  },
  {
    id: "manual-run-evidence-persistence",
    name: "Tenant-scoped manual QA evidence persistence",
    status: "workaround-active",
    owner: "Trust engineering",
    recordedAt: "2026-06-18",
    artifact: qaManualRunEvidencePersistenceApiRoute,
    routes: [qaManualRunEvidencePersistenceApiRoute, "/api/pilot-workspaces/{workspaceSlug}/buyer-room"],
    evidence:
      "A protected AAL2 workspace route can persist sanitized manual QA evidence packets into tenant-scoped audit storage and surface the resulting packet/audit signal inside Buyer Pilot Rooms.",
    limitation:
      "Persistence is intentionally unavailable without a verified AAL2 tenant governance session and server-held runtime authorization.",
    workaround:
      "Keep the public packet generator stateless for no-secret packet creation; use the protected persistence route only after human AAL2 QA has completed.",
    nextAction:
      "Run the first AAL2 Sales Demo Session QA workflow, persist the evidence packet, then export a Buyer Diligence Export with the manual QA evidence signal included."
  },
  {
    id: "protected-routes-fail-closed",
    name: "Protected route fail-closed coverage",
    status: "fail-closed",
    owner: "TrustOS",
    recordedAt: "2026-06-18",
    artifact: "scripts/public-production-smoke.mjs",
    routes: [
      "/api/sales-operations/qa/buyer-demo-sessions",
      "/api/pilot-workspaces/{workspaceSlug}/buyer-room",
      "/api/agent-workspaces/{workspaceSlug}/work-orders"
    ],
    evidence:
      "Unauthenticated protected APIs return 401 or dependency-safe 503 responses with data-boundary headers instead of silently mutating records.",
    limitation: "Fail-closed evidence proves containment, not successful authenticated workflow execution.",
    workaround:
      "Pair fail-closed checks with manual AAL2 QA runs and packet-level audit evidence before customer-facing proof release.",
    nextAction: "Add dated authenticated proof entries after the first short-lived-token QA workflow passes."
  },
  {
    id: "runtime-error-watch",
    name: "Production runtime error watch",
    status: "passed",
    owner: "Operations",
    recordedAt: "2026-06-18",
    artifact: "Vercel production runtime logs",
    routes: ["/observability", "/operations", "/trust-safety-operations"],
    evidence:
      "Production runtime logs were checked after deployment with no error or fatal events returned for the verification window.",
    limitation:
      "Current check is operator-run evidence, not a contractual 24/7 managed SOC or customer-specific alerting program.",
    workaround:
      "Keep public proof bounded to release verification and target-operating-model language until monitoring ownership, notification policy, and support agreements are approved.",
    nextAction: "Add customer-specific alerting and incident response evidence before production customer deployment claims."
  }
];

export const qaKnownLimitations: QaKnownLimitation[] = [
  {
    title: "First authenticated Sales Demo Session QA CI evidence is pending",
    impact:
      "SCRIMED has the workflow and token policy, but cannot claim an authenticated CI mutation run until a fresh AAL2 operator token is used deliberately.",
    currentControl:
      "Manual-only GitHub workflow, short-lived JWT preflight, explicit intake targeting, fail-closed public smoke, and no long-lived secret storage.",
    resolutionPath:
      "Mint a fresh AAL2 token from the tenant-admin session, run the workflow once against a synthetic intake ID, archive the result, and delete or rotate the token secret.",
    status: "manual-action-required"
  },
  {
    title: "First authenticated Authority Reference QA CI evidence is pending",
    impact:
      "SCRIMED has the protected authority-reference QA harness and renewal queue, but cannot claim an authenticated authority-reference mutation run until a fresh AAL2 operator token is used deliberately.",
    currentControl:
      "Manual-only GitHub workflow, short-lived JWT preflight, workspace targeting, fail-closed public smoke, and no long-lived secret storage.",
    resolutionPath:
      "Mint a fresh AAL2 token from the tenant-admin session, run the authority-reference QA workflow once against a synthetic workspace, archive only safe IDs and packet hash, then delete or rotate the token secret.",
    status: "manual-action-required"
  },
  {
    title: "Managed local shell may omit npm/node from PATH",
    impact:
      "Local package scripts can fail even when the repository, CI, and Vercel build path are healthy.",
    currentControl:
      "Bundled Node absolute path verifies TypeScript, ESLint, generated integrity, Next build, and smoke scripts without changing the product.",
    resolutionPath:
      "Restore PATH in the local Codex shell when available; keep CI and Vercel on standard Node 22.",
    status: "contained"
  },
  {
    title: "Live clinical execution remains intentionally blocked",
    impact:
      "SCRIMED remains sellable as a governed synthetic pilot and enterprise evaluation product, not live diagnosis, treatment, payer submission, or autonomous care execution.",
    currentControl:
      "Synthetic-only evidence, human-review boundaries, protected route fail-closed behavior, claims controls, and clinical/legal/privacy/security review gates.",
    resolutionPath:
      "Complete customer-specific identity, privacy, BAA, connector, audit, clinical validation, risk, and human operating controls before any production healthcare workflow.",
    status: "external-review-required"
  }
];

export const qaManualRunEvidenceContract = {
  route: qaManualRunEvidencePacketApiRoute,
  protectedPersistenceRoute: qaManualRunEvidencePersistenceApiRoute,
  status: qaManualRunEvidencePacketStatus,
  authorityReferenceBridgeStatus: qaAuthorityReferenceEvidenceBridgeStatus,
  supportedWorkflowKinds: [
    "sales-demo-session-qa",
    "authority-reference-qa"
  ] satisfies QaManualRunWorkflowKind[],
  persistenceStatus: qaManualRunEvidencePersistenceStatus,
  requiredFields: [
    "workflowKind",
    "workflowRunId",
    "workflowRunUrl",
    "executedAt",
    "baseUrl",
    "intakeId",
    "createdSessionId",
    "packetAuditEventId",
    "qaOutcome",
    "operatorAttestation",
    "tokenDisposalAttestation",
    "dataBoundary"
  ],
  acceptedAttestations: {
    qaOutcome: "pass",
    operatorAttestation: "no-secrets-no-phi-aal2-human-run",
    tokenDisposalAttestation: "temporary-token-deleted-or-rotated",
    dataBoundary: "synthetic-business-workflow-only"
  },
  forbiddenContent:
    "Do not submit bearer tokens, refresh tokens, passwords, API keys, PHI, patient identifiers, payer member identifiers, source contracts, credentials, or legal/security conclusions.",
  persistenceBoundary:
    "The public route validates and returns a Markdown evidence packet without storing data. The protected workspace route persists the same sanitized metadata only after AAL2 tenant governance authorization and server-side storage controls.",
  authorityReferencePersistence:
    "For authority-reference QA, createdSessionId carries the created authority reference UUID and packetAuditEventId carries the authority reference packet audit event UUID. The packet labels these fields explicitly; the database column names remain generic legacy storage."
};

export function getQaEvidenceActivationPlan() {
  return {
    service: "scrimed-qa-evidence-activation-plan",
    status: qaEvidenceActivationPlanStatus,
    route: qaEvidenceActivationPlanApiRoute,
    briefRoute: qaEvidenceActivationPlanBriefRoute,
    boundary:
      "The QA Evidence Activation Plan is a no-secret operator runbook for governed synthetic AAL2 QA only. It does not store or reveal bearer tokens, execute passkey ceremonies, authorize PHI processing, certify compliance, or grant live clinical authority.",
    activationPrinciple:
      "Human AAL2 session plus short-lived token plus explicit synthetic target plus no-secret evidence persistence.",
    workflowCount: qaEvidenceActivationWorkflows.length,
    workflows: qaEvidenceActivationWorkflows,
    sharedControls: [
      "Use only fresh short-lived AAL2 tokens.",
      "Keep workflows manual-only; do not schedule authenticated mutation checks.",
      "Target exactly one explicit synthetic opportunity or protected workspace.",
      "Run preflight before any authenticated request.",
      "Copy only safe evidence IDs into SCRIMED.",
      "Delete or rotate temporary GitHub secrets immediately after the run.",
      "Persist evidence only through the protected Manual QA Evidence route.",
      "Export Buyer Diligence only after safe metadata is retained and packet hashes are visible."
    ],
    forbiddenContent:
      "Never paste bearer tokens, refresh tokens, passwords, API keys, PHI, patient identifiers, payer member identifiers, artifact URLs, signed approvals, legal opinions, security reports, reimbursement determinations, source contracts, production credentials, or clinical records into QA evidence fields.",
    completionCriteria: [
      "Preflight passed for the short-lived AAL2 token.",
      "Authenticated smoke passed against the explicit synthetic target.",
      "Temporary secret was deleted or rotated after run completion.",
      "Manual QA Evidence packet was persisted through the protected workspace session.",
      "Packet hash and append-only audit event are visible in Buyer Pilot Room.",
      "Buyer Diligence Export was generated after persistence."
    ],
    unresolvedBoundary:
      "Authenticated QA evidence remains pending until a human operator performs the AAL2 run; code must not bypass this with committed credentials or long-lived secrets.",
    nextAction:
      "Use this activation plan to run Sales Demo Session QA and Authority Reference QA with fresh AAL2 tokens, persist only safe metadata, then export Buyer Diligence.",
    updated: "2026-06-21"
  };
}

function getCurrentDeploymentEvidence() {
  return {
    environment: process.env.VERCEL_ENV ?? "local-or-unset",
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? "local-or-unset",
    commitRef: process.env.VERCEL_GIT_COMMIT_REF ?? "local-or-unset",
    deploymentUrl: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "local-or-unset"
  };
}

export function getQaEvidenceLedger() {
  const passed = qaEvidenceEntries.filter((entry) => entry.status === "passed").length;
  const failClosed = qaEvidenceEntries.filter((entry) => entry.status === "fail-closed").length;
  const manualGates = qaEvidenceEntries.filter((entry) => entry.status === "manual-gate").length;
  const workaroundActive = qaEvidenceEntries.filter((entry) => entry.status === "workaround-active").length;

  return {
    service: "scrimed-qa-evidence-ledger",
    route: qaEvidenceLedgerRoute,
    apiRoute: qaEvidenceLedgerApiRoute,
    briefRoute: qaEvidenceLedgerBriefRoute,
    status: qaEvidenceLedgerStatus,
    proofStackStatus: qaEvidenceLedgerProofStackStatus,
    boundary: qaEvidenceLedgerBoundary,
    currentDeployment: getCurrentDeploymentEvidence(),
    recordedEvidenceCount: qaEvidenceEntries.length,
    passed,
    failClosed,
    manualGates,
    workaroundActive,
    unresolvedHardGateCount: manualGates,
    salesDemoSessionQaStatus: salesDemoSessionQaProofStackStatus,
    salesDemoSessionQaBoundary,
    salesDemoSessionQaControls,
    tokenPolicy: salesDemoSessionQaTokenPolicy,
    activationPlan: getQaEvidenceActivationPlan(),
    manualRunEvidenceCapture: qaManualRunEvidenceContract,
    manualRunEvidencePersistence: {
      route: qaManualRunEvidencePersistenceApiRoute,
      status: qaManualRunEvidencePersistenceStatus,
      boundary:
        "Tenant-scoped durable storage requires AAL2 governance authorization, server-held runtime authorization, RLS membership checks, append-only audit events, no-secret validation, and synthetic-only metadata."
    },
    entries: qaEvidenceEntries,
    knownLimitations: qaKnownLimitations,
    buyerSafeSummary:
      "SCRIMED verifies release health, protected-route containment, token-policy readiness, and no-secret evidence capture today; remaining authenticated QA evidence requires deliberate short-lived AAL2 operator runs against synthetic targets.",
    nextRecommendedBuildStep:
      "Run the Sales Demo Session QA and Authority Reference QA manual workflows with fresh short-lived AAL2 tokens, generate no-secret manual-run evidence packets, persist them through the protected workspace evidence route, then export the Buyer Diligence Export with the manual QA evidence signal included.",
    updated: "2026-06-21"
  };
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function hasForbiddenKey(value: unknown) {
  if (!value || typeof value !== "object") {
    return false;
  }

  const forbiddenKeys = new Set([
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
    "credentials"
  ]);

  return Object.keys(value).some((key) => forbiddenKeys.has(key));
}

function hasForbiddenContent(value: unknown) {
  const text = JSON.stringify(value ?? "");

  return [
    /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
    /sk-[A-Za-z0-9_-]{12,}/,
    /sbp_[A-Za-z0-9_-]{12,}/,
    /Bearer\s+[A-Za-z0-9._-]+/i,
    /patient\s*(id|identifier|mrn)/i,
    /member\s*(id|identifier)/i
  ].some((pattern) => pattern.test(text));
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isSafeIntakeId(value: string) {
  return /^[A-Za-z0-9][A-Za-z0-9_-]{5,127}$/.test(value);
}

function isSafeOptionalEvidenceText(value: string, maxLength = 160) {
  return (
    value.length === 0 ||
    (value.length <= maxLength && /^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]*$/.test(value))
  );
}

function isSafeOptionalRoute(value: string) {
  return value.length === 0 || /^\/[A-Za-z0-9/_{}.[\]-]{1,220}$/.test(value);
}

function isValidWorkflowUrl(value: string) {
  return /^https:\/\/github\.com\/temitayodahunsi777\/scrimed-site\/actions\/runs\/[0-9]+$/.test(value);
}

function isValidBaseUrl(value: string) {
  return value === "https://app.scrimedsolutions.com" || /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(value);
}

function isValidIsoTimestamp(value: string) {
  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return false;
  }

  return Math.abs(Date.now() - timestamp) <= 1000 * 60 * 60 * 24 * 14;
}

function normalizeQaManualRunEvidenceInput(value: unknown): QaManualRunEvidenceInput {
  const record = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const workflowKind = cleanText(record.workflowKind) as QaManualRunWorkflowKind;

  return {
    workflowKind: workflowKind || "sales-demo-session-qa",
    workflowRunId: cleanText(record.workflowRunId),
    workflowRunUrl: cleanText(record.workflowRunUrl),
    executedAt: cleanText(record.executedAt),
    baseUrl: cleanText(record.baseUrl),
    intakeId: cleanText(record.intakeId),
    createdSessionId: cleanText(record.createdSessionId),
    packetAuditEventId: cleanText(record.packetAuditEventId),
    evidenceTargetLabel: cleanText(record.evidenceTargetLabel),
    evidenceObjectLabel: cleanText(record.evidenceObjectLabel),
    packetAuditEventLabel: cleanText(record.packetAuditEventLabel),
    evidenceRoute: cleanText(record.evidenceRoute),
    packetRoute: cleanText(record.packetRoute),
    operatorRunbook: cleanText(record.operatorRunbook),
    qaOutcome: cleanText(record.qaOutcome) as QaManualRunEvidenceInput["qaOutcome"],
    operatorAttestation: cleanText(record.operatorAttestation) as QaManualRunEvidenceInput["operatorAttestation"],
    tokenDisposalAttestation:
      cleanText(record.tokenDisposalAttestation) as QaManualRunEvidenceInput["tokenDisposalAttestation"],
    dataBoundary: cleanText(record.dataBoundary) as QaManualRunEvidenceInput["dataBoundary"]
  };
}

export function validateQaManualRunEvidenceInput(value: unknown) {
  const input = normalizeQaManualRunEvidenceInput(value);
  const errors: string[] = [];

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    errors.push("Body must be a JSON object.");
  }

  if (hasForbiddenKey(value)) {
    errors.push("Body must not include token, secret, password, credential, bearer, or refresh fields.");
  }

  if (hasForbiddenContent(value)) {
    errors.push("Body appears to contain secret-like, bearer-token-like, or regulated identifier content.");
  }

  if (!/^[0-9]{6,32}$/.test(input.workflowRunId)) {
    errors.push("workflowRunId must be the numeric GitHub Actions run ID.");
  }

  if (!isValidWorkflowUrl(input.workflowRunUrl)) {
    errors.push("workflowRunUrl must point to the SCRIMED GitHub Actions run URL.");
  }

  if (!isValidIsoTimestamp(input.executedAt)) {
    errors.push("executedAt must be an ISO timestamp within 14 days of packet generation.");
  }

  if (!isValidBaseUrl(input.baseUrl)) {
    errors.push("baseUrl must be https://app.scrimedsolutions.com or a Vercel deployment URL.");
  }

  if (!isSafeIntakeId(input.intakeId)) {
    errors.push("intakeId must be an explicit alphanumeric, underscore, or hyphen target between 6 and 128 characters.");
  }

  if (!isUuid(input.createdSessionId)) {
    errors.push("createdSessionId must be a UUID returned by the QA route.");
  }

  if (!isUuid(input.packetAuditEventId)) {
    errors.push("packetAuditEventId must be a UUID returned by the audited packet route.");
  }

  if (input.qaOutcome !== qaManualRunEvidenceContract.acceptedAttestations.qaOutcome) {
    errors.push("qaOutcome must equal pass.");
  }

  if (input.operatorAttestation !== qaManualRunEvidenceContract.acceptedAttestations.operatorAttestation) {
    errors.push("operatorAttestation must equal no-secrets-no-phi-aal2-human-run.");
  }

  if (
    input.tokenDisposalAttestation !==
    qaManualRunEvidenceContract.acceptedAttestations.tokenDisposalAttestation
  ) {
    errors.push("tokenDisposalAttestation must equal temporary-token-deleted-or-rotated.");
  }

  if (input.dataBoundary !== qaManualRunEvidenceContract.acceptedAttestations.dataBoundary) {
    errors.push("dataBoundary must equal synthetic-business-workflow-only.");
  }

  if (!qaManualRunEvidenceContract.supportedWorkflowKinds.includes(input.workflowKind ?? "sales-demo-session-qa")) {
    errors.push("workflowKind must be sales-demo-session-qa or authority-reference-qa.");
  }

  if (!isSafeOptionalEvidenceText(input.evidenceTargetLabel ?? "")) {
    errors.push("evidenceTargetLabel must be bounded no-secret metadata.");
  }

  if (!isSafeOptionalEvidenceText(input.evidenceObjectLabel ?? "")) {
    errors.push("evidenceObjectLabel must be bounded no-secret metadata.");
  }

  if (!isSafeOptionalEvidenceText(input.packetAuditEventLabel ?? "")) {
    errors.push("packetAuditEventLabel must be bounded no-secret metadata.");
  }

  if (!isSafeOptionalRoute(input.evidenceRoute ?? "")) {
    errors.push("evidenceRoute must be a relative SCRIMED route without URL, secret, or query content.");
  }

  if (!isSafeOptionalRoute(input.packetRoute ?? "")) {
    errors.push("packetRoute must be a relative SCRIMED route without URL, secret, or query content.");
  }

  if (!isSafeOptionalRoute(input.operatorRunbook ?? "")) {
    errors.push("operatorRunbook must be a relative SCRIMED route without URL, secret, or query content.");
  }

  return {
    ok: errors.length === 0,
    errors,
    input
  };
}

export function buildQaManualRunEvidencePacket(input: QaManualRunEvidenceInput) {
  const workflowKind = input.workflowKind ?? "sales-demo-session-qa";
  const isAuthorityReference = workflowKind === "authority-reference-qa";
  const title = isAuthorityReference
    ? "SCRIMED Manual Authority Reference QA Evidence Packet"
    : "SCRIMED Manual Sales Demo Session QA Evidence Packet";
  const evidenceTargetLabel =
    input.evidenceTargetLabel ||
    (isAuthorityReference ? "Authority workspace target" : "Intake target");
  const evidenceObjectLabel =
    input.evidenceObjectLabel ||
    (isAuthorityReference ? "Created authority reference ID" : "Created session ID");
  const packetAuditEventLabel =
    input.packetAuditEventLabel ||
    (isAuthorityReference ? "Authority reference packet audit event ID" : "Packet audit event ID");
  const controls = isAuthorityReference
    ? [
        "AAL2 tenant governance session required.",
        "Synthetic metadata-only reference recorded through protected workspace route.",
        "Renewal queue verified after write.",
        "Audited authority reference packet downloaded after audit event commit.",
        "No PHI, artifact, URL, credential, signature, legal opinion, security report, or live-care authority stored.",
        "Temporary bearer token must be deleted or rotated after the run."
      ]
    : salesDemoSessionQaControls;

  return [
    `# ${title}`,
    "",
    `Status: ${qaManualRunEvidencePacketStatus}`,
    `Workflow kind: ${workflowKind}`,
    `Boundary: ${qaEvidenceLedgerBoundary}`,
    "",
    "## Run Evidence",
    `- Workflow run ID: ${input.workflowRunId}`,
    `- Workflow run URL: ${input.workflowRunUrl}`,
    `- Executed at: ${input.executedAt}`,
    `- Base URL: ${input.baseUrl}`,
    `- ${evidenceTargetLabel}: ${input.intakeId}`,
    `- ${evidenceObjectLabel}: ${input.createdSessionId}`,
    `- ${packetAuditEventLabel}: ${input.packetAuditEventId}`,
    ...(input.evidenceRoute ? [`- Evidence route: ${input.evidenceRoute}`] : []),
    ...(input.packetRoute ? [`- Packet route: ${input.packetRoute}`] : []),
    ...(input.operatorRunbook ? [`- Operator runbook: ${input.operatorRunbook}`] : []),
    `- QA outcome: ${input.qaOutcome}`,
    "",
    "## Attestations",
    `- Operator attestation: ${input.operatorAttestation}`,
    `- Token disposal attestation: ${input.tokenDisposalAttestation}`,
    `- Data boundary: ${input.dataBoundary}`,
    "",
    "## Controls",
    ...controls.map((control) => `- ${control}`),
    "",
    "## Remaining Boundaries",
    "- This packet does not contain bearer tokens, refresh tokens, passwords, credentials, PHI, patient identifiers, payer member identifiers, source contracts, or regulated healthcare records.",
    "- This packet documents a synthetic QA run only. It does not authorize live clinical execution, autonomous diagnosis, payer submission, patient outreach, compliance certification, security certification, reimbursement certainty, public distribution, or production connector activation.",
    "- Durable evidence storage remains gated until approved storage, retention, access review, legal hold, incident response, regional residency, and buyer authorization controls are complete."
  ].join("\n");
}

export function buildQaEvidenceActivationPlanBrief() {
  const plan = getQaEvidenceActivationPlan();

  return [
    "# SCRIMED Manual AAL2 QA Evidence Activation Plan",
    "",
    `Status: ${plan.status}`,
    `Boundary: ${plan.boundary}`,
    `Activation principle: ${plan.activationPrinciple}`,
    "",
    "## Shared Controls",
    ...plan.sharedControls.map((control) => `- ${control}`),
    "",
    "## Forbidden Content",
    plan.forbiddenContent,
    "",
    "## Workflows",
    ...plan.workflows.flatMap((workflow) => [
      `### ${workflow.name}`,
      `- Workflow kind: ${workflow.workflowKind}`,
      `- Status: ${workflow.status}`,
      `- GitHub workflow: ${workflow.workflowPath}`,
      `- Preflight script: ${workflow.preflightScript}`,
      `- Smoke script: ${workflow.smokeScript}`,
      `- Target input: ${workflow.targetInput}`,
      `- Required temporary secret: ${workflow.requiredSecretName}`,
      `- Persistence target: ${workflow.persistenceTarget}`,
      `- Buyer Diligence impact: ${workflow.buyerDiligenceImpact}`,
      `- Current boundary: ${workflow.currentBoundary}`,
      `- Workaround: ${workflow.workaround}`,
      `- Next action: ${workflow.nextAction}`,
      "",
      "Protected routes:",
      ...workflow.protectedRoutes.map((route) => `- ${route}`),
      "",
      "Safe evidence fields:",
      ...workflow.safeEvidenceFields.map((field) => `- ${field}`),
      "",
      "Prohibited inputs:",
      ...workflow.prohibitedInputs.map((field) => `- ${field}`),
      "",
      "Operator steps:",
      ...workflow.operatorSteps.map((step, index) => `${index + 1}. ${step}`),
      ""
    ]),
    "## Completion Criteria",
    ...plan.completionCriteria.map((criterion) => `- ${criterion}`),
    "",
    "## Remaining Boundary",
    plan.unresolvedBoundary,
    "",
    "## Next Action",
    plan.nextAction
  ].join("\n");
}

export function buildQaEvidenceBrief() {
  const ledger = getQaEvidenceLedger();

  return [
    "# SCRIMED QA Evidence Ledger Brief",
    "",
    `Status: ${ledger.status}`,
    `Boundary: ${ledger.boundary}`,
    `Buyer-safe summary: ${ledger.buyerSafeSummary}`,
    "",
    "## Current Deployment Evidence",
    `- Environment: ${ledger.currentDeployment.environment}`,
    `- Commit SHA: ${ledger.currentDeployment.commitSha}`,
    `- Commit ref: ${ledger.currentDeployment.commitRef}`,
    `- Deployment URL: ${ledger.currentDeployment.deploymentUrl}`,
    "",
    "## Evidence Entries",
    ...ledger.entries.map(
      (entry) =>
        `- ${entry.name} (${entry.status}, ${entry.recordedAt}): ${entry.evidence} Artifact: ${entry.artifact}. Limitation: ${entry.limitation}. Workaround: ${entry.workaround}.`
    ),
    "",
    "## Known Limitations",
    ...ledger.knownLimitations.map(
      (limitation) =>
        `- ${limitation.title} (${limitation.status}): ${limitation.impact} Current control: ${limitation.currentControl} Resolution path: ${limitation.resolutionPath}`
    ),
    "",
    "## Token Policy",
    `- Status: ${ledger.tokenPolicy.status}`,
    `- Runbook: ${ledger.tokenPolicy.runbookPath}`,
    `- Workflow: ${ledger.tokenPolicy.workflowPath}`,
    `- Required claims: ${ledger.tokenPolicy.requiredClaims.join(", ")}`,
    `- Max token lifetime seconds: ${ledger.tokenPolicy.maxTokenLifetimeSeconds}`,
    "",
    "## Manual AAL2 QA Activation Plan",
    `- Status: ${ledger.activationPlan.status}`,
    `- Route: ${ledger.activationPlan.route}`,
    `- Brief: ${ledger.activationPlan.briefRoute}`,
    `- Workflow count: ${ledger.activationPlan.workflowCount}`,
    `- Completion criteria: ${ledger.activationPlan.completionCriteria.join("; ")}`,
    `- Boundary: ${ledger.activationPlan.unresolvedBoundary}`,
    "",
    "## Next Recommended Build Step",
    ledger.nextRecommendedBuildStep
  ].join("\n");
}
