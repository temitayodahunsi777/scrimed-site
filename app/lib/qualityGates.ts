import { getSyntheticValidationResults } from "./syntheticValidation";

export type QualityGate = {
  name: string;
  route: string;
  state: "active" | "bypassed" | "watch" | "planned";
  role: string;
  replacement?: string;
};

export const qualityGates: QualityGate[] = [
  {
    name: "Vercel deployment",
    route: "https://vercel.com/temitayo-dahunsis-projects/scrimed-site",
    state: "active",
    role: "Primary deploy gate while the site is being built and verified."
  },
  {
    name: "Synthetic clinical scenarios",
    route: "/synthetic/validation",
    state: "active",
    role: "Executable workflow validation without live patient data."
  },
  {
    name: "Integration contracts",
    route: "/integrations",
    state: "active",
    role: "Interface boundary before FHIR, HL7, claims, pricing, or synthetic connectors are implemented."
  },
  {
    name: "Hub readiness checks",
    route: "/hub/readiness",
    state: "active",
    role: "Operational readiness visibility for product, API, and integration foundations."
  },
  {
    name: "GitHub Actions CI",
    route: "https://github.com/temitayodahunsi777/scrimed-site/blob/main/.github/workflows/ci.yml",
    state: "bypassed",
    role: "Secondary build verification once workflow visibility and lockfile support are available.",
    replacement: "Vercel deployment plus executable synthetic validation are the current active quality path."
  },
  {
    name: "Live clinical integrations",
    route: "/integrations",
    state: "planned",
    role: "Future connector validation after synthetic scenarios and contracts are stable.",
    replacement: "Synthetic fixtures and contract pages remain the gate until live integration work is explicitly approved."
  }
];

export function getQualityGateSummary() {
  const syntheticValidation = getSyntheticValidationResults();

  return {
    service: "scrimed-quality-gates",
    status: syntheticValidation.status === "pass" ? "active-with-managed-bypass" : "attention-required",
    gates: qualityGates,
    active: qualityGates.filter((gate) => gate.state === "active").length,
    bypassed: qualityGates.filter((gate) => gate.state === "bypassed").length,
    planned: qualityGates.filter((gate) => gate.state === "planned").length,
    syntheticValidation,
    updated: "2026-05-29"
  };
}
