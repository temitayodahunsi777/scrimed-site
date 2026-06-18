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

export type QaManualRunEvidenceInput = {
  workflowRunId: string;
  workflowRunUrl: string;
  executedAt: string;
  baseUrl: string;
  intakeId: string;
  createdSessionId: string;
  packetAuditEventId: string;
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

export const qaEvidenceLedgerBoundary =
  "SCRIMED QA Evidence Ledger records synthetic-only release, smoke, token-policy, fail-closed, and operator-gate evidence. It is not a clinical validation report, security certification, legal opinion, SOC report, HIPAA attestation, or authorization for live healthcare execution.";

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
    id: "manual-run-evidence-capture",
    name: "Manual AAL2 run evidence capture",
    status: "workaround-active",
    owner: "Release engineering",
    recordedAt: "2026-06-18",
    artifact: qaManualRunEvidencePacketApiRoute,
    routes: [qaManualRunEvidencePacketApiRoute, qaEvidenceLedgerRoute, salesDemoSessionQaApiRoute],
    evidence:
      "A stateless evidence packet generator validates non-secret workflow run metadata, created synthetic session ID, packet audit event ID, operator attestation, and token-disposal attestation after the manual QA workflow completes.",
    limitation:
      "The packet generator does not execute the authenticated QA run by itself.",
    workaround:
      "Use it immediately after the manual workflow run to produce a sanitized packet, then persist the same non-secret run metadata through the protected tenant-scoped evidence route.",
    nextAction:
      "After the first manual workflow pass, POST the non-secret run metadata to the packet route, then persist it through the workspace evidence route for buyer-room visibility."
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
      "Run the first AAL2 Sales Demo Session QA workflow, persist the evidence packet, then export a Buyer Pilot Room packet with the manual QA evidence signal included."
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
  persistenceStatus: qaManualRunEvidencePersistenceStatus,
  requiredFields: [
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
    "The public route validates and returns a Markdown evidence packet without storing data. The protected workspace route persists the same sanitized metadata only after AAL2 tenant governance authorization and server-side storage controls."
};

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
      "SCRIMED verifies release health, protected-route containment, and token-policy readiness today; the only remaining authenticated QA evidence step is a deliberate short-lived AAL2 operator run against a synthetic buyer opportunity.",
    nextRecommendedBuildStep:
      "Capture the first successful manual Sales Demo Session QA workflow run with a fresh AAL2 token, generate the manual-run evidence packet, persist it through the protected workspace evidence route, then export the Buyer Pilot Room packet with the manual QA evidence signal included.",
    updated: "2026-06-18"
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

  return {
    workflowRunId: cleanText(record.workflowRunId),
    workflowRunUrl: cleanText(record.workflowRunUrl),
    executedAt: cleanText(record.executedAt),
    baseUrl: cleanText(record.baseUrl),
    intakeId: cleanText(record.intakeId),
    createdSessionId: cleanText(record.createdSessionId),
    packetAuditEventId: cleanText(record.packetAuditEventId),
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

  return {
    ok: errors.length === 0,
    errors,
    input
  };
}

export function buildQaManualRunEvidencePacket(input: QaManualRunEvidenceInput) {
  return [
    "# SCRIMED Manual Sales Demo Session QA Evidence Packet",
    "",
    `Status: ${qaManualRunEvidencePacketStatus}`,
    `Boundary: ${qaEvidenceLedgerBoundary}`,
    "",
    "## Run Evidence",
    `- Workflow run ID: ${input.workflowRunId}`,
    `- Workflow run URL: ${input.workflowRunUrl}`,
    `- Executed at: ${input.executedAt}`,
    `- Base URL: ${input.baseUrl}`,
    `- Intake target: ${input.intakeId}`,
    `- Created session ID: ${input.createdSessionId}`,
    `- Packet audit event ID: ${input.packetAuditEventId}`,
    `- QA outcome: ${input.qaOutcome}`,
    "",
    "## Attestations",
    `- Operator attestation: ${input.operatorAttestation}`,
    `- Token disposal attestation: ${input.tokenDisposalAttestation}`,
    `- Data boundary: ${input.dataBoundary}`,
    "",
    "## Controls",
    ...salesDemoSessionQaControls.map((control) => `- ${control}`),
    "",
    "## Remaining Boundaries",
    "- This packet does not contain bearer tokens, refresh tokens, passwords, credentials, PHI, patient identifiers, payer member identifiers, source contracts, or regulated healthcare records.",
    "- This packet documents a synthetic buyer-demo QA run only. It does not authorize live clinical execution, autonomous diagnosis, payer submission, patient outreach, compliance certification, or production connector activation.",
    "- Durable evidence storage remains gated until approved storage, retention, access review, legal hold, incident response, regional residency, and buyer authorization controls are complete."
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
    "## Next Recommended Build Step",
    ledger.nextRecommendedBuildStep
  ].join("\n");
}
