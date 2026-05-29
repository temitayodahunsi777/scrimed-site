import { integrationContracts } from "./integrationContracts";
import { syntheticScenarios } from "./syntheticClinical";
import { getSyntheticValidationResults } from "./syntheticValidation";

export type HubModule = {
  name: string;
  route: string;
  phase: "foundation" | "staged" | "planned";
  status: "active-concept" | "design" | "planned";
  owner: string;
  objective: string;
};

export type HubSignal = {
  name: string;
  value: string;
  tone: "good" | "watch" | "planned";
};

export const hubModules: HubModule[] = [
  {
    name: "Clinical Copilot",
    route: "/modules/clinical-copilot",
    phase: "staged",
    status: "design",
    owner: "Clinical intelligence",
    objective: "Summarize patient context and support clinician decision workflows."
  },
  {
    name: "DocuTwin",
    route: "/modules/docutwin",
    phase: "staged",
    status: "design",
    owner: "Documentation automation",
    objective: "Generate reviewable medical documentation from structured and conversational inputs."
  },
  {
    name: "CarePath AI",
    route: "/modules/carepath-ai",
    phase: "staged",
    status: "design",
    owner: "Care navigation",
    objective: "Support intake, triage, routing, and care pathway coordination."
  },
  {
    name: "TrialCore",
    route: "/modules/trialcore",
    phase: "staged",
    status: "design",
    owner: "Research operations",
    objective: "Map patient signals to clinical trial discovery and matching workflows."
  },
  {
    name: "Watchtower",
    route: "/modules/watchtower",
    phase: "foundation",
    status: "active-concept",
    owner: "Trust infrastructure",
    objective: "Monitor drift, regressions, runtime traces, cost, latency, and safety signals."
  }
];

export const hubSignals: HubSignal[] = [
  { name: "Deployment", value: "Vercel success", tone: "good" },
  { name: "Quality gates", value: "managed bypass active", tone: "good" },
  { name: "Repository", value: "main baseline clean", tone: "good" },
  { name: "Synthetic validation", value: "assertions passing", tone: "good" },
  { name: "Build verification", value: "Vercel active, CI bypassed", tone: "watch" },
  { name: "Integration contracts", value: "foundation defined", tone: "good" },
  { name: "Clinical integrations", value: "not connected", tone: "planned" }
];

const contractRoutes = integrationContracts.flatMap((contract) => [
  contract.route,
  `/api${contract.route}`
]);

const syntheticRoutes = syntheticScenarios.flatMap((scenario) => [
  scenario.route,
  `/api/synthetic/scenarios/${scenario.id}`,
  `/api/synthetic/validation/${scenario.id}`
]);

export const hubRoutes = [
  "/",
  "/hub",
  "/hub/readiness",
  "/hub/events",
  "/platform",
  "/trust",
  "/integrations",
  "/synthetic",
  "/synthetic/validation",
  "/quality",
  ...syntheticScenarios.map((scenario) => scenario.route),
  ...integrationContracts.map((contract) => contract.route),
  "/modules/clinical-copilot",
  "/modules/docutwin",
  "/modules/carepath-ai",
  "/modules/trialcore",
  "/modules/watchtower",
  "/api/health",
  "/api/status",
  "/api/readiness",
  "/api/events",
  "/api/contracts",
  ...contractRoutes.filter((route) => route.startsWith("/api/contracts/")),
  "/api/synthetic/scenarios",
  "/api/synthetic/validation",
  ...syntheticRoutes.filter((route) => route.startsWith("/api/synthetic/")),
  "/api/quality/gates",
  "/api/hub/summary"
];

export function getHubSummary() {
  const activeModules = hubModules.filter((module) => module.phase === "foundation").length;
  const stagedModules = hubModules.filter((module) => module.phase === "staged").length;
  const syntheticValidation = getSyntheticValidationResults();

  return {
    service: "scrimed-os-hub",
    status: "foundation-online",
    baseline: "nextjs-app-router",
    activeModules,
    stagedModules,
    moduleCount: hubModules.length,
    routes: hubRoutes,
    signals: hubSignals,
    syntheticValidation,
    modules: hubModules,
    updated: "2026-05-29"
  };
}
