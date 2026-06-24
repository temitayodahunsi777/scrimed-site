export type NavigationAuditStatus =
  | "linked"
  | "smoke-covered"
  | "protected-fail-closed"
  | "operator-required"
  | "external-review-required"
  | "compile-covered";

export type NavigationGroup = {
  name: string;
  purpose: string;
  owner: string;
  routes: string[];
  auditStatus: NavigationAuditStatus;
  evidence: string;
  retainedBoundary: string;
};

export type NavigationBottleneck = {
  name: string;
  status: "resolved" | "contained" | "operator-required" | "external-review-required";
  impact: string;
  workaround: string;
  owner: string;
};

export const navigationAuditProofStackStatus = "route-navigation-audit-active";
export const navigationAuditBriefProofStackStatus = "route-navigation-audit-brief-ready";
export const navigationAuditUpdatedAt = "2026-06-23";
export const expectedApiRoutePatternCount = 241;

export const navigationAuditBoundary =
  "SCRIMED Navigation Audit organizes page routes, API route patterns, smoke coverage, protected fail-closed checks, and retained approval boundaries into one operating map. It is an audit and navigation control surface only. It does not certify that every protected workflow has been executed, bypass AAL2, approve public release, authorize PHI processing, grant legal or clinical authority, certify security/compliance, or approve production connectors.";

export const pageRouteInventory = [
  "/",
  "/agent-workspace",
  "/agents",
  "/agents/[slug]",
  "/approvals-readiness",
  "/atlas",
  "/attribution-analytics",
  "/audit",
  "/boundary-resolution",
  "/buyer-release-control-run",
  "/claims",
  "/clinical-authority-readiness",
  "/clinical-care-activation",
  "/competitive-edge",
  "/contracts/[slug]",
  "/demos",
  "/demos/[slug]",
  "/deployment-profiles",
  "/evaluation",
  "/faithcore",
  "/fixtures/change-review",
  "/global-reach",
  "/governance-packs",
  "/healthcare-intelligence-os",
  "/hub",
  "/hub/events",
  "/hub/readiness",
  "/integrations",
  "/integrations/fixture-validation",
  "/integrations/fixtures",
  "/integrations/fixtures/[slug]",
  "/interoperability",
  "/interoperability/[slug]",
  "/interoperability/evaluations",
  "/interoperability/evaluations/[slug]",
  "/market-activation",
  "/memory",
  "/modules/carepath-ai",
  "/modules/clinical-copilot",
  "/modules/docutwin",
  "/modules/trialcore",
  "/modules/watchtower",
  "/navigation",
  "/observability",
  "/operating-context",
  "/operations",
  "/pilot",
  "/pilot-deal-room",
  "/pilot-evidence",
  "/pilot-workspace",
  "/pilot-workspace/access",
  "/pilots",
  "/pilots/[slug]",
  "/platform",
  "/pricing",
  "/product",
  "/public-market-readiness",
  "/qa-aal2-run-evidence",
  "/qa-activation-seal",
  "/qa-buyer-proof-release",
  "/qa-claim-guard",
  "/qa-completion-bridge",
  "/qa-evidence",
  "/qa-execution-readiness",
  "/qa-human-run-packet",
  "/qa-launch-kit",
  "/qa-manual-execution-console",
  "/qa-proof-promotion",
  "/qa-run-control",
  "/quality",
  "/release-continuity",
  "/sales-attribution",
  "/sales-operations",
  "/source-intelligence",
  "/strategic-intelligence",
  "/synthetic",
  "/synthetic/[slug]",
  "/synthetic/fixtures",
  "/synthetic/fixtures/[slug]",
  "/synthetic/validation",
  "/trust",
  "/trust-center",
  "/trust-center/[slug]",
  "/trust-os",
  "/trust-safety-operations",
  "/workflows",
  "/workflows/[slug]",
  "/workflows/audit-persistence",
  "/workflows/contracts",
  "/workflows/contracts/[slug]",
  "/workflows/execution-attempts",
  "/workflows/execution-audit",
  "/workflows/execution-audit/[slug]",
  "/workflows/identity-access",
  "/workflows/implementation-readiness",
  "/workflows/implementation-readiness/[slug]",
  "/workflows/promotion-review",
  "/workflows/results",
  "/workflows/results/[slug]",
  "/workflows/results/validation",
  "/workflows/runtime-safety"
];

export const smokeCoveredHtmlRoutes = [
  "/navigation",
  "/pilot-workspace/access",
  "/sales-operations",
  "/competitive-edge",
  "/pilot-deal-room",
  "/qa-evidence",
  "/clinical-authority-readiness",
  "/clinical-care-activation",
  "/public-market-readiness",
  "/global-reach",
  "/boundary-resolution",
  "/approvals-readiness",
  "/release-continuity",
  "/qa-execution-readiness",
  "/qa-run-control",
  "/qa-launch-kit",
  "/qa-human-run-packet",
  "/qa-completion-bridge",
  "/qa-claim-guard",
  "/qa-activation-seal",
  "/qa-proof-promotion",
  "/qa-buyer-proof-release",
  "/buyer-release-control-run",
  "/qa-manual-execution-console",
  "/qa-aal2-run-evidence"
];

export const navigationGroups: NavigationGroup[] = [
  {
    name: "Executive command",
    purpose: "Give founders, buyers, operators, and reviewers a short path into the active operating surfaces.",
    owner: "Founder + Product Console",
    routes: ["/", "/hub", "/product", "/navigation", "/pilot-evidence"],
    auditStatus: "linked",
    evidence: "Homepage, Hub, Product Console, and this audit route cross-link the highest-signal operating lanes.",
    retainedBoundary: "Navigation links are operating guidance, not proof of protected execution."
  },
  {
    name: "Commercial buyer motion",
    purpose: "Move qualified buyers from public product proof into demos, pricing, deal-room context, and pilot intake.",
    owner: "Sales operations + Buyer Diligence",
    routes: [
      "/pilot-deal-room",
      "/pricing",
      "/demos",
      "/demos/[slug]",
      "/pilots",
      "/pilots/[slug]",
      "/pilot",
      "/sales-operations"
    ],
    auditStatus: "smoke-covered",
    evidence: "Public smoke covers the Deal Room and Sales Operations route; dynamic demo and pilot detail pages compile in the App Router build.",
    retainedBoundary: "Commercial routes cannot claim customer permission, production activation, or external distribution approval."
  },
  {
    name: "Approval and authority readiness",
    purpose: "Keep legal, regulatory, clinical, security, reimbursement, and buyer-release boundaries visible before claims expand.",
    owner: "Legal, security, clinical governance, and release stewardship",
    routes: [
      "/approvals-readiness",
      "/boundary-resolution",
      "/clinical-authority-readiness",
      "/clinical-care-activation",
      "/public-market-readiness",
      "/release-continuity"
    ],
    auditStatus: "smoke-covered",
    evidence: "Public smoke checks HTML, JSON APIs, Markdown briefs, boundary headers, and Product Console proof-stack posture for these lanes.",
    retainedBoundary: "These routes prepare approvals; they do not grant legal approval, clinical authority, certification, or live-care authorization."
  },
  {
    name: "Protected workspace and AAL2 proof",
    purpose: "Separate public visibility from tenant-scoped protected evidence, packets, release decisions, and operator-only workflows.",
    owner: "Tenant admin, pilot lead, TrustOS, and release steward",
    routes: [
      "/pilot-workspace",
      "/pilot-workspace/access",
      "/buyer-release-control-run",
      "/qa-manual-execution-console",
      "/qa-aal2-run-evidence"
    ],
    auditStatus: "operator-required",
    evidence: "Unauthenticated smoke verifies protected APIs fail closed; successful mutation and packet proof require a fresh human AAL2 session.",
    retainedBoundary: "No code path may mint, retain, print, or reuse operator bearer tokens to bypass AAL2."
  },
  {
    name: "QA and release proof",
    purpose: "Keep manual QA execution, claim guard, activation seal, proof promotion, and buyer proof release staged before any claim expansion.",
    owner: "TrustOS, release engineering, buyer diligence, and claims governance",
    routes: [
      "/qa-evidence",
      "/qa-execution-readiness",
      "/qa-run-control",
      "/qa-launch-kit",
      "/qa-human-run-packet",
      "/qa-completion-bridge",
      "/qa-claim-guard",
      "/qa-activation-seal",
      "/qa-proof-promotion",
      "/qa-buyer-proof-release"
    ],
    auditStatus: "smoke-covered",
    evidence: "Public smoke validates all listed QA pages, APIs, briefs, secret rejection paths, and no-authority headers.",
    retainedBoundary: "QA routes can prove readiness and no-secret handling; retained authenticated proof remains protected and AAL2 gated."
  },
  {
    name: "Agent and workflow OS",
    purpose: "Expose AgentOS, Agent Workspace, memory, audit, observability, workflow contracts, execution readiness, results, and runtime safety.",
    owner: "AgentOS + Workflow Runtime",
    routes: [
      "/agents",
      "/agents/[slug]",
      "/agent-workspace",
      "/evaluation",
      "/memory",
      "/audit",
      "/observability",
      "/workflows",
      "/workflows/[slug]",
      "/workflows/contracts",
      "/workflows/identity-access",
      "/workflows/execution-attempts",
      "/workflows/execution-audit",
      "/workflows/audit-persistence",
      "/workflows/results",
      "/workflows/results/validation",
      "/workflows/promotion-review",
      "/workflows/runtime-safety"
    ],
    auditStatus: "compile-covered",
    evidence: "Next build, TypeScript, ESLint, workflow APIs, and protected Agent Workspace fail-closed smoke cover the operating surface.",
    retainedBoundary: "Workflow execution stays synthetic and deny-by-default until identity, runtime safety, audit, connector, and review gates are approved."
  },
  {
    name: "Interoperability, integrations, and synthetic validation",
    purpose: "Keep standards, connector contracts, fixture validation, and synthetic clinical workflows inspectable before production data connections.",
    owner: "Interoperability control plane + Validation Trust Lab",
    routes: [
      "/interoperability",
      "/interoperability/[slug]",
      "/interoperability/evaluations",
      "/interoperability/evaluations/[slug]",
      "/integrations",
      "/integrations/fixture-validation",
      "/integrations/fixtures",
      "/integrations/fixtures/[slug]",
      "/synthetic",
      "/synthetic/[slug]",
      "/synthetic/fixtures",
      "/synthetic/fixtures/[slug]",
      "/synthetic/validation"
    ],
    auditStatus: "compile-covered",
    evidence: "Static build and existing validation APIs cover connector contracts, fixture diffs, and synthetic route rendering.",
    retainedBoundary: "Synthetic validation does not authorize production connectors, PHI ingestion, payer submission, or live clinical workflow execution."
  },
  {
    name: "Trust, market, operations, and platform context",
    purpose: "Maintain public trust posture, market activation, source intelligence, deployment profiles, operations blockers, and platform modules.",
    owner: "Operations, Trust Safety Ops, and Market Activation",
    routes: [
      "/trust-center",
      "/trust-center/[slug]",
      "/trust",
      "/trust-os",
      "/trust-safety-operations",
      "/claims",
      "/market-activation",
      "/global-reach",
      "/sales-attribution",
      "/attribution-analytics",
      "/source-intelligence",
      "/deployment-profiles",
      "/operations",
      "/quality",
      "/operating-context",
      "/healthcare-intelligence-os",
      "/platform",
      "/governance-packs",
      "/faithcore",
      "/modules/clinical-copilot",
      "/modules/docutwin",
      "/modules/carepath-ai",
      "/modules/trialcore",
      "/modules/watchtower"
    ],
    auditStatus: "linked",
    evidence: "Hub route inventory, Product Console summaries, and public smoke for Global Reach and quality-critical lanes keep these surfaces discoverable.",
    retainedBoundary: "Public trust and market pages remain claims-controlled and cannot self-certify legal, security, or regulatory approvals."
  }
];

export const navigationBottlenecks: NavigationBottleneck[] = [
  {
    name: "Route sprawl",
    status: "resolved",
    impact: "High-value pages and proof routes were harder to discover as the App Router surface grew.",
    workaround: "Use /navigation as the source-indexed route map and wire it through Homepage, Hub, Product Console, API, brief, README, systems map, and smoke coverage.",
    owner: "Product Console + Release Steward"
  },
  {
    name: "Protected happy-path proof",
    status: "operator-required",
    impact: "Unauthenticated checks can prove fail-closed behavior, but not successful tenant-scoped protected mutations.",
    workaround: "Use /pilot-workspace/access with an active human AAL2 browser session or a deliberate one-time short-lived token run without retaining token values.",
    owner: "Approved tenant-admin or pilot-lead operator"
  },
  {
    name: "Dynamic detail route coverage",
    status: "contained",
    impact: "Dynamic pages compile, but public smoke focuses on canonical entry points instead of crawling every slug variant.",
    workaround: "Keep route inventory visible here, use typecheck/build for every dynamic segment, and add targeted slug smoke when a dynamic route becomes buyer-critical.",
    owner: "Release Steward"
  },
  {
    name: "External approvals and certifications",
    status: "external-review-required",
    impact: "Navigation can show approval tracks, but SCRIMED cannot self-certify legal, security, HIPAA, FDA, ONC, reimbursement, or clinical-use authority.",
    workaround: "Keep approval routes claims-controlled, attach only qualified external evidence, and preserve no-authority headers until formal approval exists.",
    owner: "Founder + qualified external reviewers"
  },
  {
    name: "Local shell runtime path",
    status: "contained",
    impact: "The managed local shell may omit node/npm from PATH even though the bundled runtime works.",
    workaround: "Use the bundled Node path for local checks and keep npm lifecycle scripts documented through Release Continuity and Operations readiness.",
    owner: "Release Steward"
  }
];

function unique(values: string[]) {
  return Array.from(new Set(values));
}

export function getNavigationAuditSummary() {
  const auditedNavigationRoutes = unique(navigationGroups.flatMap((group) => group.routes));
  const missingInventoryLinks = auditedNavigationRoutes.filter(
    (route) => !pageRouteInventory.includes(route)
  );
  const operatorRequiredBottleneckCount = navigationBottlenecks.filter(
    (bottleneck) => bottleneck.status === "operator-required"
  ).length;
  const externalReviewBottleneckCount = navigationBottlenecks.filter(
    (bottleneck) => bottleneck.status === "external-review-required"
  ).length;
  const containedBottleneckCount = navigationBottlenecks.filter(
    (bottleneck) => bottleneck.status === "contained"
  ).length;
  const resolvedBottleneckCount = navigationBottlenecks.filter(
    (bottleneck) => bottleneck.status === "resolved"
  ).length;

  return {
    service: "scrimed-navigation-audit",
    route: "/navigation",
    apiRoute: "/api/navigation-audit",
    briefRoute: "/api/navigation-audit/brief",
    status: navigationAuditProofStackStatus,
    briefStatus: navigationAuditBriefProofStackStatus,
    boundary: navigationAuditBoundary,
    sourceTotals: {
      pageRouteCount: pageRouteInventory.length,
      apiRoutePatternCount: expectedApiRoutePatternCount,
      dynamicPageRouteCount: pageRouteInventory.filter((route) => route.includes("[")).length
    },
    coverage: {
      navigationGroupCount: navigationGroups.length,
      auditedNavigationRouteCount: auditedNavigationRoutes.length,
      smokeCoveredHtmlRouteCount: smokeCoveredHtmlRoutes.length,
      missingInventoryLinkCount: missingInventoryLinks.length,
      pageInventoryStatus:
        missingInventoryLinks.length === 0 ? "all-navigation-links-in-inventory" : "inventory-gap",
      apiRouteCoverageStatus: "typecheck-build-and-targeted-smoke",
      protectedCoverageStatus: "fail-closed-publicly-aal2-required-for-happy-path",
      releaseAuthority: "not-release-approval",
      phiAuthority: "not-authorized-production-phi",
      clinicalCareAuthority: "not-authorized-live-care",
      securityCertification: "not-security-certified",
      approvalAuthority: "external-review-required"
    },
    bottleneckCount: navigationBottlenecks.length,
    resolvedBottleneckCount,
    containedBottleneckCount,
    operatorRequiredBottleneckCount,
    externalReviewBottleneckCount,
    groups: navigationGroups,
    bottlenecks: navigationBottlenecks,
    pageRouteInventory,
    smokeCoveredHtmlRoutes,
    auditedNavigationRoutes,
    missingInventoryLinks,
    nextOperatorActions: [
      "Use /navigation before each release to check route inventory, source counts, smoke scope, and retained limitations.",
      "Add new high-value routes to the right navigation group and public smoke when they become buyer-critical.",
      "Keep protected routes fail-closed publicly and run happy-path proof only through an active human AAL2 session.",
      "Keep approval, PHI, clinical-care, connector, release, and security-certification claims gated until qualified external evidence exists."
    ],
    updated: navigationAuditUpdatedAt
  };
}

export function buildNavigationAuditBrief() {
  const summary = getNavigationAuditSummary();

  return [
    "# SCRIMED Navigation Audit Brief",
    "",
    `Status: ${summary.status}`,
    `Page route count: ${summary.sourceTotals.pageRouteCount}`,
    `API route pattern count: ${summary.sourceTotals.apiRoutePatternCount}`,
    `Dynamic page route count: ${summary.sourceTotals.dynamicPageRouteCount}`,
    `Navigation groups: ${summary.coverage.navigationGroupCount}`,
    `Audited navigation routes: ${summary.coverage.auditedNavigationRouteCount}`,
    `Smoke-covered HTML routes: ${summary.coverage.smokeCoveredHtmlRouteCount}`,
    `Protected coverage: ${summary.coverage.protectedCoverageStatus}`,
    `Release authority: ${summary.coverage.releaseAuthority}`,
    `PHI authority: ${summary.coverage.phiAuthority}`,
    `Clinical care authority: ${summary.coverage.clinicalCareAuthority}`,
    `Security certification: ${summary.coverage.securityCertification}`,
    `Approval authority: ${summary.coverage.approvalAuthority}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is not release approval, legal approval, security certification, HIPAA certification, FDA clearance, ONC certification, production connector approval, PHI processing approval, token authorization, or live clinical authorization.",
    "",
    "## Navigation Groups",
    ...summary.groups.map(
      (group) =>
        `- ${group.name} (${group.auditStatus}): ${group.purpose} Routes: ${group.routes.join(", ")} Boundary: ${group.retainedBoundary}`
    ),
    "",
    "## Bottlenecks",
    ...summary.bottlenecks.map(
      (bottleneck) =>
        `- ${bottleneck.name} (${bottleneck.status}): ${bottleneck.impact} Workaround: ${bottleneck.workaround} Owner: ${bottleneck.owner}`
    ),
    "",
    "## Page Route Inventory",
    ...summary.pageRouteInventory.map((route) => `- ${route}`),
    "",
    "## Next Operator Actions",
    ...summary.nextOperatorActions.map((action) => `- ${action}`)
  ].join("\n");
}
