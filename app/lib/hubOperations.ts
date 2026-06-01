export type ReadinessCheck = {
  name: string;
  status: "pass" | "planned" | "watch";
  detail: string;
};

export type HubEvent = {
  id: string;
  type: "repository" | "product" | "operations" | "integration" | "deployment";
  summary: string;
  date: string;
};

export const readinessChecks: ReadinessCheck[] = [
  { name: "nextjs_baseline", status: "pass", detail: "App Router baseline is present." },
  { name: "health_endpoint", status: "pass", detail: "/api/health is available." },
  { name: "status_endpoint", status: "pass", detail: "/api/status is available." },
  { name: "hub_console", status: "pass", detail: "/hub and /api/hub/summary are available." },
  { name: "product_pages", status: "pass", detail: "Platform, trust, and module pages are available." },
  { name: "operating_context", status: "pass", detail: "/operating-context and /api/operating-context are available." },
  { name: "official_website", status: "pass", detail: "The official SCRIMED SOLUTIONS website is recorded as https://www.scrimedsolutions.com through Wix." },
  { name: "atlas_faithcore_models", status: "pass", detail: "/atlas and /faithcore are available with explicit operating boundaries." },
  { name: "agent_workflow_registry", status: "pass", detail: "/agents and /api/agents/workflows are available with permissions, audit events, and human-review boundaries." },
  { name: "workflow_execution_surface", status: "pass", detail: "/workflows and /api/workflows/executions stage synthetic-only workflow execution readiness for CarePath AI, DocuTwin, and TrialCore." },
  { name: "workflow_execution_results", status: "pass", detail: "/workflows/results and /api/workflows/results expose deterministic synthetic result fixtures." },
  { name: "workflow_result_validation", status: "pass", detail: "/workflows/results/validation and /api/workflows/results/validation compare expected outputs, traces, blocked actions, and review states." },
  { name: "workflow_promotion_review", status: "pass", detail: "/workflows/promotion-review and /api/workflows/promotion-review record synthetic-only promotion approval before live automation." },
  { name: "workflow_execution_contracts", status: "pass", detail: "/workflows/contracts and /api/workflows/contracts define governed execution API contracts while keeping live automation blocked." },
  { name: "identity_access_readiness", status: "watch", detail: "/workflows/identity-access and /api/workflows/identity-access define the production identity, tenant, role, service-auth, consent, break-glass, audit-linkage, and regional identity decisions required before execution moves beyond deny-by-default." },
  { name: "workflow_execution_deny_stubs", status: "pass", detail: "/workflows/implementation-readiness and /api/workflows/governed-execution/[slug] reject execution before body parsing, connector access, workflow mutation, or patient-facing action." },
  { name: "workflow_execution_audit_boundary", status: "pass", detail: "/workflows/execution-audit and /api/workflows/execution-audit define metadata-only evidence headers, audit envelope fields, and never-capture policy for denied execution attempts." },
  { name: "audit_persistence_readiness", status: "watch", detail: "/workflows/audit-persistence and /api/workflows/audit-persistence define the durable audit storage decisions required before execution moves beyond deny-by-default." },
  { name: "integration_contracts", status: "pass", detail: "/integrations and /api/contracts are available." },
  { name: "integration_fixtures", status: "pass", detail: "/integrations/fixtures and /api/integration-fixtures are available for non-synthetic connector contracts." },
  { name: "integration_fixture_validation", status: "pass", detail: "/integrations/fixture-validation and /api/integration-fixtures/validation expose coverage, safeguard mapping, and diff fingerprints." },
  { name: "fixture_change_review", status: "pass", detail: "/fixtures/change-review and /api/fixtures/change-review expose expected-output fingerprint review." },
  { name: "synthetic_environment", status: "pass", detail: "/synthetic and /api/synthetic/scenarios are available." },
  { name: "synthetic_fixtures", status: "pass", detail: "/synthetic/fixtures and /api/synthetic/fixtures are available." },
  { name: "synthetic_assertions", status: "pass", detail: "/synthetic/validation and /api/synthetic/validation are available." },
  { name: "quality_gates", status: "pass", detail: "/quality and /api/quality/gates are available with a managed bypass path for CI visibility gaps." },
  { name: "github_actions", status: "watch", detail: "CI is configured, but run visibility is not confirmed in this session." },
  { name: "clinical_integrations", status: "planned", detail: "FHIR, HL7, and clinical data connectors are not active yet." }
];

export const hubEvents: HubEvent[] = [
  {
    id: "scrimed-main-cleanup",
    type: "repository",
    summary: "Closed stale PRs and established PR #10 as the deployment baseline.",
    date: "2026-05-28"
  },
  {
    id: "scrimed-homepage-platform-surface",
    type: "product",
    summary: "Converted the root page into a platform-oriented SCRIMED homepage.",
    date: "2026-05-28"
  },
  {
    id: "scrimed-os-hub-foundation",
    type: "operations",
    summary: "Added the SCRIMED OS Hub console and shared Hub summary endpoint.",
    date: "2026-05-28"
  },
  {
    id: "scrimed-integration-contracts",
    type: "integration",
    summary: "Defined future integration contracts for FHIR, HL7, claims, pricing, and synthetic clinical testing.",
    date: "2026-05-28"
  },
  {
    id: "scrimed-synthetic-validation",
    type: "operations",
    summary: "Added synthetic clinical scenarios to validate workflows without live clinical data.",
    date: "2026-05-29"
  },
  {
    id: "scrimed-quality-gates",
    type: "operations",
    summary: "Added explicit quality gates for Vercel deployment, synthetic validation, integration contracts, readiness checks, and managed CI bypass.",
    date: "2026-05-29"
  },
  {
    id: "scrimed-synthetic-assertion-runner",
    type: "operations",
    summary: "Added deterministic synthetic scenario checks for labels, identifier safety, contract boundaries, trace completeness, assertions, and human review guardrails.",
    date: "2026-05-29"
  },
  {
    id: "scrimed-synthetic-fixture-contracts",
    type: "operations",
    summary: "Added structured synthetic request and expected-output fixtures for CarePath AI, DocuTwin, and TrialCore validation.",
    date: "2026-05-29"
  },
  {
    id: "scrimed-master-operating-context",
    type: "operations",
    summary: "Codified SCRIMED SOLUTIONS mission, quality standard, interoperability strategy, Atlas, FaithCore, global regions, and decision framework.",
    date: "2026-05-29"
  },
  {
    id: "scrimed-agent-workflow-registry",
    type: "operations",
    summary: "Added a governed agent workflow registry with owners, permissions, inputs, outputs, audit events, guardrails, interoperability targets, and human-review policies.",
    date: "2026-05-29"
  },
  {
    id: "scrimed-integration-fixtures",
    type: "integration",
    summary: "Added synthetic request and expected-response fixtures for FHIR, HL7, claims, and pricing integration contracts, with validation diffs before live connector work.",
    date: "2026-05-30"
  },
  {
    id: "scrimed-fixture-review-workflow-execution",
    type: "operations",
    summary: "Added fixture change-review fingerprints and the first synthetic workflow execution readiness surface for CarePath AI.",
    date: "2026-05-30"
  },
  {
    id: "scrimed-workflow-result-fixtures",
    type: "operations",
    summary: "Expanded workflow readiness to CarePath AI, DocuTwin, and TrialCore, then added deterministic execution-result fixtures for each staged workflow.",
    date: "2026-05-31"
  },
  {
    id: "scrimed-workflow-validation-promotion-review",
    type: "operations",
    summary: "Added workflow result validation diffs and synthetic-only promotion review records before production automation.",
    date: "2026-05-31"
  },
  {
    id: "scrimed-governed-execution-contracts",
    type: "operations",
    summary: "Added contract-only governed execution API boundaries for staged workflows after validation and promotion gates passed.",
    date: "2026-05-31"
  },
  {
    id: "scrimed-governed-execution-deny-stubs",
    type: "operations",
    summary: "Added deny-by-default governed execution endpoints that reject workflow execution before processing any request body.",
    date: "2026-05-31"
  },
  {
    id: "scrimed-denied-execution-audit-boundary",
    type: "operations",
    summary: "Added metadata-only audit boundaries and evidence headers for denied governed execution attempts.",
    date: "2026-06-01"
  },
  {
    id: "scrimed-audit-persistence-readiness",
    type: "operations",
    summary: "Added an audit persistence readiness register for storage, retention, access, encryption, incident response, regional residency, and Watchtower alerting decisions.",
    date: "2026-06-01"
  },
  {
    id: "scrimed-identity-access-readiness",
    type: "operations",
    summary: "Added an identity and access readiness register for production authentication, tenant isolation, role permissions, patient-context authorization, service authentication, consent, break-glass access, audit linkage, and regional identity controls.",
    date: "2026-06-01"
  },
  {
    id: "scrimed-official-website-context",
    type: "product",
    summary: "Recorded https://www.scrimedsolutions.com as the official SCRIMED SOLUTIONS website through Wix.",
    date: "2026-05-30"
  },
  {
    id: "scrimed-ci-bypass-vercel-gate",
    type: "deployment",
    summary: "Kept Vercel as the working deploy gate while GitHub Actions visibility remains unresolved.",
    date: "2026-05-29"
  }
];

export function getReadinessSummary() {
  const passed = readinessChecks.filter((check) => check.status === "pass").length;

  return {
    service: "scrimed-site",
    status: "ready-for-foundation-review",
    score: passed / readinessChecks.length,
    checks: readinessChecks,
    recommendation: "Use Vercel, executable synthetic assertions, fixture change review, staged synthetic workflow execution, deterministic execution-result fixtures, workflow result validation, synthetic-only promotion review, governed execution API contracts, identity and access readiness, deny-by-default execution endpoints, denied-execution audit boundaries, audit persistence readiness, the agent workflow registry, integration fixtures, integration contracts, and quality gates as the active deploy-quality path before clinical workflow integration.",
    updated: "2026-06-01"
  };
}

export function getEventSummary() {
  return {
    service: "scrimed-site",
    events: hubEvents,
    count: hubEvents.length
  };
}
