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

export const qaEvidenceLedgerRoute = "/qa-evidence";
export const qaEvidenceLedgerApiRoute = "/api/qa-evidence";
export const qaEvidenceLedgerBriefRoute = "/api/qa-evidence/brief";

export const qaEvidenceLedgerStatus = "qa-evidence-ledger-active";
export const qaEvidenceLedgerProofStackStatus =
  "dated-qa-evidence-ledger-with-manual-aal2-gate";

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
    entries: qaEvidenceEntries,
    knownLimitations: qaKnownLimitations,
    buyerSafeSummary:
      "SCRIMED verifies release health, protected-route containment, and token-policy readiness today; the only remaining authenticated QA evidence step is a deliberate short-lived AAL2 operator run against a synthetic buyer opportunity.",
    nextRecommendedBuildStep:
      "Capture the first successful manual Sales Demo Session QA workflow run with a fresh AAL2 token, then add the resulting run ID, timestamp, intake target, created session ID, and packet audit event ID to this ledger.",
    updated: "2026-06-18"
  };
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
