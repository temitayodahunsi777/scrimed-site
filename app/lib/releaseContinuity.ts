export type ReleaseContinuityGateStatus =
  | "resolved"
  | "operator-required"
  | "blocked-by-design"
  | "external-review-required";

export type ReleaseContinuityGate = {
  key: string;
  name: string;
  status: ReleaseContinuityGateStatus;
  proof: string;
  bottleneck: string;
  workaround: string;
  owner: string;
  proofRoutes: string[];
};

export type ReleaseContinuityCheck = {
  name: string;
  status: "passed" | "requires-aal2-operator" | "external-review-required";
  evidence: string;
  nextAction: string;
};

export const releaseContinuityProofStackStatus =
  "release-continuity-checkpointed-aal2-boundary";
export const releaseContinuityBriefProofStackStatus =
  "release-continuity-brief-operator-ready";
export const releaseContinuityUpdatedAt = "2026-06-23";

export const releaseContinuityBoundary =
  "SCRIMED Release Continuity ties live production, source-control checkpoints, no-secret smoke checks, and protected AAL2 operator gates into one operating view. It does not mint tokens, store secrets, bypass AAL2, approve buyer release, authorize PHI processing, certify security or compliance, grant legal approval, or authorize live clinical care.";

export const releaseContinuitySource = {
  productionDomain: "https://app.scrimedsolutions.com",
  baselineDeploymentId: "dpl_EjfSCM5YKpWhHKDAa6FGmNDPnJ7K",
  baselineCommit: "6219f3616e71d163edd047e4d55074cc5089e2b8",
  baselineShortCommit: "6219f36",
  baselineTag: "scrimed-code-pt2-approvals-readiness-20260623",
  runtimeCommit:
    process.env.VERCEL_GIT_COMMIT_SHA ?? "runtime-commit-unset-local-or-preview",
  runtimeBranch:
    process.env.VERCEL_GIT_COMMIT_REF ?? "runtime-branch-unset-local-or-preview",
  runtimeDeploymentUrl: process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "runtime-deployment-url-unset-local-or-custom-domain"
};

export const releaseContinuityGates: ReleaseContinuityGate[] = [
  {
    key: "source-control-drift",
    name: "Source-control drift",
    status: "resolved",
    proof:
      "The approvals readiness and buyer release-control release was committed, tagged, pushed, and verified against origin/main.",
    bottleneck:
      "Production-only changes can become hard to audit if Vercel history moves ahead of GitHub.",
    workaround:
      "Keep every production release checkpointed by commit, tag, production smoke, and briefed release boundary.",
    owner: "Founder + Release Steward",
    proofRoutes: ["/product", "/api/product/console", "/api/release-continuity"]
  },
  {
    key: "public-production-smoke",
    name: "Public production smoke",
    status: "resolved",
    proof:
      "Public smoke validates the custom domain, HTML routes, JSON APIs, Markdown briefs, fail-closed protected routes, and approval boundaries.",
    bottleneck:
      "Public readiness can look healthy while protected writes still require explicit AAL2 proof.",
    workaround:
      "Pair public smoke with protected fail-closed checks and a separate AAL2 operator run when a fresh session exists.",
    owner: "Release Steward",
    proofRoutes: ["/api/release-continuity", "/api/product/console", "/qa-evidence"]
  },
  {
    key: "protected-aal2-happy-path",
    name: "Protected AAL2 happy path",
    status: "operator-required",
    proof:
      "TrustOps, Agent Workspace, and Buyer Release Control fail closed without a tenant-admin or pilot-lead AAL2 session.",
    bottleneck:
      "A terminal cannot safely create or retain a fresh human AAL2 bearer token without crossing the no-secret boundary.",
    workaround:
      "Use the protected browser workspace for no-secret verification, or run the CLI smoke only with a fresh external AAL2 token and dispose of it immediately after the run.",
    owner: "Approved tenant-admin or pilot-lead operator",
    proofRoutes: [
      "/pilot-workspace/access",
      "/buyer-release-control-run",
      "/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run"
    ]
  },
  {
    key: "secret-handling",
    name: "Secret handling",
    status: "blocked-by-design",
    proof:
      "Release scripts skip authenticated mutations unless a deliberate short-lived token is supplied outside the product and outside source control.",
    bottleneck:
      "Automating protected happy-path evidence with stored long-lived tokens would weaken the trust boundary.",
    workaround:
      "Prefer browser AAL2 operator panels; when CLI evidence is necessary, use explicit environment variables for one run and never write token values to docs, chat, CI logs, or code.",
    owner: "Security + Operator",
    proofRoutes: ["/qa-run-control", "/qa-launch-kit", "/qa-human-run-packet"]
  },
  {
    key: "regulated-approval-claims",
    name: "Regulated approval claims",
    status: "external-review-required",
    proof:
      "Approvals Readiness and Boundary Resolution keep legal, HIPAA, SOC 2, HITRUST, FDA, ONC, reimbursement, and public customer-permission claims externally gated.",
    bottleneck:
      "SCRIMED can prepare approval evidence, but it cannot self-certify or self-authorize regulated claims.",
    workaround:
      "Route public copy through Claim Guard, keep intended use narrow, retain external approval references, and require qualified reviewer sign-off before any claim expansion.",
    owner: "Founder + Legal/Security/Regulatory reviewers",
    proofRoutes: ["/approvals-readiness", "/boundary-resolution", "/qa-claim-guard"]
  }
];

export const releaseContinuityChecks: ReleaseContinuityCheck[] = [
  {
    name: "npm audit",
    status: "passed",
    evidence: "0 vulnerabilities at moderate threshold.",
    nextAction: "Repeat before each production release."
  },
  {
    name: "Generated integrity",
    status: "passed",
    evidence: "Generated workspace integrity check passed.",
    nextAction: "Keep generated cache cleanup in the build lifecycle."
  },
  {
    name: "TypeScript and ESLint",
    status: "passed",
    evidence: "TypeScript noEmit and ESLint completed cleanly.",
    nextAction: "Keep static checks required before deploy."
  },
  {
    name: "Production public smoke",
    status: "passed",
    evidence: "Custom-domain public smoke passed across release, approval, QA, and fail-closed protected surfaces.",
    nextAction: "Run after each deploy and tag."
  },
  {
    name: "Protected happy path",
    status: "requires-aal2-operator",
    evidence: "Fail-closed checks pass; authenticated mutation proof requires fresh human AAL2.",
    nextAction: "Use browser protected workspace or one-time short-lived AAL2 token run."
  },
  {
    name: "External certifications and approvals",
    status: "external-review-required",
    evidence: "Approval tracks are organized but not certified or cleared.",
    nextAction: "Move through qualified legal, security, regulatory, buyer, and certification-body review."
  }
];

export function getReleaseContinuitySummary() {
  const resolvedGateCount = releaseContinuityGates.filter(
    (gate) => gate.status === "resolved"
  ).length;
  const operatorRequiredGateCount = releaseContinuityGates.filter(
    (gate) => gate.status === "operator-required"
  ).length;
  const blockedByDesignGateCount = releaseContinuityGates.filter(
    (gate) => gate.status === "blocked-by-design"
  ).length;
  const externalReviewGateCount = releaseContinuityGates.filter(
    (gate) => gate.status === "external-review-required"
  ).length;
  const passedCheckCount = releaseContinuityChecks.filter(
    (check) => check.status === "passed"
  ).length;

  return {
    service: "scrimed-release-continuity",
    route: "/release-continuity",
    apiRoute: "/api/release-continuity",
    briefRoute: "/api/release-continuity/brief",
    status: releaseContinuityProofStackStatus,
    briefStatus: releaseContinuityBriefProofStackStatus,
    authorizationStatus: "public-release-evidence-only-protected-aal2-required",
    clinicalCareAuthority: "not-authorized-live-care",
    phiAuthority: "not-authorized-production-phi",
    releaseAuthority: "not-release-approval",
    securityCertification: "not-security-certified",
    approvalAuthority: "external-review-required",
    tokenHandling: "no-token-values-exposed-or-retained",
    boundary: releaseContinuityBoundary,
    source: releaseContinuitySource,
    gateCount: releaseContinuityGates.length,
    resolvedGateCount,
    operatorRequiredGateCount,
    blockedByDesignGateCount,
    externalReviewGateCount,
    checkCount: releaseContinuityChecks.length,
    passedCheckCount,
    gates: releaseContinuityGates,
    checks: releaseContinuityChecks,
    nextOperatorActions: [
      "Use /release-continuity before and after each production deployment.",
      "Run public production smoke on the custom domain after every deploy.",
      "Use /pilot-workspace/access for browser-session AAL2 protected verification when possible.",
      "Use SCRIMED_BEARER_TOKEN only for a deliberate one-time CLI smoke, then dispose of it outside the product.",
      "Keep approval, PHI, clinical, certification, and buyer-release claims gated until qualified external evidence exists."
    ],
    updated: releaseContinuityUpdatedAt
  };
}

export function buildReleaseContinuityBrief() {
  const summary = getReleaseContinuitySummary();

  return [
    "# SCRIMED Release Continuity Brief",
    "",
    `Status: ${summary.status}`,
    `Authorization status: ${summary.authorizationStatus}`,
    `Clinical care authority: ${summary.clinicalCareAuthority}`,
    `PHI authority: ${summary.phiAuthority}`,
    `Release authority: ${summary.releaseAuthority}`,
    `Security certification: ${summary.securityCertification}`,
    `Approval authority: ${summary.approvalAuthority}`,
    `Token handling: ${summary.tokenHandling}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is not release approval, legal approval, security certification, HIPAA certification, FDA clearance, ONC certification, PHI processing approval, token authorization, or live clinical authorization.",
    "",
    "## Source Checkpoint",
    `- Production domain: ${summary.source.productionDomain}`,
    `- Baseline deployment: ${summary.source.baselineDeploymentId}`,
    `- Baseline commit: ${summary.source.baselineCommit}`,
    `- Baseline tag: ${summary.source.baselineTag}`,
    `- Runtime commit: ${summary.source.runtimeCommit}`,
    `- Runtime branch: ${summary.source.runtimeBranch}`,
    `- Runtime deployment URL: ${summary.source.runtimeDeploymentUrl}`,
    "",
    "## Gates",
    ...summary.gates.map(
      (gate) =>
        `- ${gate.name} (${gate.status}): ${gate.proof} Bottleneck: ${gate.bottleneck} Workaround: ${gate.workaround} Owner: ${gate.owner}`
    ),
    "",
    "## Checks",
    ...summary.checks.map(
      (check) =>
        `- ${check.name} (${check.status}): ${check.evidence} Next: ${check.nextAction}`
    ),
    "",
    "## Next Operator Actions",
    ...summary.nextOperatorActions.map((action) => `- ${action}`)
  ].join("\n");
}
