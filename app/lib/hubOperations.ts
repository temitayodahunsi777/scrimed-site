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
  { name: "integration_contracts", status: "pass", detail: "/integrations and /api/contracts are available." },
  { name: "synthetic_environment", status: "pass", detail: "/synthetic and /api/synthetic/scenarios are available." },
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
    recommendation: "Use Vercel as the current deploy gate and validate workflow behavior through synthetic scenarios before clinical workflow integration.",
    updated: "2026-05-29"
  };
}

export function getEventSummary() {
  return {
    service: "scrimed-site",
    events: hubEvents,
    count: hubEvents.length
  };
}
