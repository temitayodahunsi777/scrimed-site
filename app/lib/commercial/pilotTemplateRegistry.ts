import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";

export const pilotTemplateRegistryVersion =
  "scrimed-p34-pilot-template-registry-v1-2026-08-27";

export type PilotTemplateRisk = "low" | "moderate" | "high";

export type PilotTemplate = {
  templateId: string;
  title: string;
  scope: string;
  buyerArchetypes: string[];
  syntheticInputs: string[];
  measurements: string[];
  exclusions: string[];
  evidenceOutputs: string[];
  risk: PilotTemplateRisk;
  pricingPosture: {
    mode: "public-starting-point" | "custom-human-approved";
    statement: string;
    bindingQuoteAuthorized: false;
  };
  expansionPath: string[];
  templateHash: string;
};

const universalExclusions = [
  "PHI or live patient data",
  "live clinical execution, diagnosis, treatment, prescribing, or triage",
  "customer-system, EHR, device, payer, claim, RIS, PACS, or RCM writeback",
  "binding quote, discount, contract acceptance, or delivery-date commitment",
  "production deployment, customer activation, certification, or unsupported outcome claim"
];

function template(input: Omit<PilotTemplate, "templateHash">): PilotTemplate {
  return {
    ...input,
    templateHash: createClinicalEvidenceHash({
      version: pilotTemplateRegistryVersion,
      input
    })
  };
}

export const pilotTemplateRegistry: PilotTemplate[] = [
  template({
    templateId: "workflow-intelligence-assessment",
    title: "Workflow Intelligence Assessment",
    scope: "Map one bounded healthcare-adjacent workflow and quantify handoffs, delays, rework, evidence gaps, and safe automation candidates.",
    buyerArchetypes: ["health-system", "outpatient-network", "academic-medical-center"],
    syntheticInputs: ["synthetic work items", "declared process map", "synthetic timing and rework observations"],
    measurements: ["workflow steps", "processing time", "rework", "review burden", "evidence completeness"],
    exclusions: universalExclusions,
    evidenceOutputs: ["current-state map", "bottleneck register", "measurement plan", "pilot recommendation"],
    risk: "low",
    pricingPosture: {
      mode: "public-starting-point",
      statement: "Starting at $25K, subject to written agreement",
      bindingQuoteAuthorized: false
    },
    expansionPath: ["human scope review", "synthetic pilot", "protected-pilot diligence when separately authorized"]
  }),
  template({
    templateId: "rcm-workflow-intelligence",
    title: "RCM Workflow Intelligence",
    scope: "Evaluate synthetic documentation completeness, claim-quality preparation, denial-pattern hypotheses, and payer-policy mapping without submitting or mutating a claim.",
    buyerArchetypes: ["health-system", "payer", "revenue-cycle-group"],
    syntheticInputs: ["synthetic claim records", "public or approved policy excerpts", "synthetic denial reasons"],
    measurements: ["missing evidence", "review time", "simulated rework", "accepted outputs", "cost per accepted result"],
    exclusions: [...universalExclusions, "coverage determination", "medical-necessity assertion", "financial adjustment"],
    evidenceOutputs: ["documentation gap matrix", "denial-pattern analysis", "human review queue", "policy evidence map"],
    risk: "moderate",
    pricingPosture: {
      mode: "custom-human-approved",
      statement: "Custom enterprise scope; human commercial and finance approval required",
      bindingQuoteAuthorized: false
    },
    expansionPath: ["synthetic evidence review", "extend synthetic pilot", "protected RCM diligence when separately authorized"]
  }),
  template({
    templateId: "enterprise-ai-governance",
    title: "Enterprise AI Governance",
    scope: "Inventory synthetic model, agent, tool, policy, evidence, approval, cost, audit, and release-control records in one governed assessment.",
    buyerArchetypes: ["health-system", "payer", "healthcare-oem", "public-sector"],
    syntheticInputs: ["synthetic model inventory", "synthetic agent inventory", "policy fixtures", "release-gate fixtures"],
    measurements: ["inventory coverage", "evidence freshness", "unowned risk", "review burden", "gate completeness"],
    exclusions: universalExclusions,
    evidenceOutputs: ["AI inventory", "risk classification", "evidence ledger", "gate matrix", "executive readout"],
    risk: "low",
    pricingPosture: {
      mode: "custom-human-approved",
      statement: "Custom enterprise scope; human commercial and finance approval required",
      bindingQuoteAuthorized: false
    },
    expansionPath: ["governance gap remediation", "repeatable assurance cadence", "protected integration diligence"]
  }),
  template({
    templateId: "documentation-quality",
    title: "Documentation Quality",
    scope: "Compare synthetic documentation variants against a declared rubric and measure omissions, corrections, acceptance, and reviewer effort.",
    buyerArchetypes: ["health-system", "outpatient-network", "academic-medical-center"],
    syntheticInputs: ["synthetic encounter facts", "synthetic draft notes", "review rubric"],
    measurements: ["omission rate", "unsupported statement rate", "edit distance", "acceptance", "review minutes"],
    exclusions: [...universalExclusions, "record finalization", "coding or billing release"],
    evidenceOutputs: ["quality rubric", "omission report", "correction ledger", "review-burden summary"],
    risk: "moderate",
    pricingPosture: {
      mode: "custom-human-approved",
      statement: "Custom enterprise scope; human commercial and finance approval required",
      bindingQuoteAuthorized: false
    },
    expansionPath: ["rubric refinement", "larger synthetic scenario set", "protected workflow diligence"]
  }),
  template({
    templateId: "model-agent-assurance",
    title: "Model/Agent Assurance",
    scope: "Run reproducible non-PHI task-fit, safety-floor, conformance, failure-mode, latency, and cost evaluation for disabled candidate routes.",
    buyerArchetypes: ["health-system", "healthcare-oem", "academic-medical-center", "public-sector"],
    syntheticInputs: ["deterministic task fixtures", "disabled model profiles", "tool-contract fixtures"],
    measurements: ["task correctness", "tool accuracy", "reliability", "latency", "cost per accepted result"],
    exclusions: [...universalExclusions, "model promotion without named approval", "public benchmark-only selection"],
    evidenceOutputs: ["benchmark card", "provider conformance report", "routing rationale", "abstention evidence"],
    risk: "moderate",
    pricingPosture: {
      mode: "custom-human-approved",
      statement: "Custom enterprise scope; human commercial and finance approval required",
      bindingQuoteAuthorized: false
    },
    expansionPath: ["challenger remediation", "shadow evaluation", "named promotion review"]
  }),
  template({
    templateId: "public-sector-workflow-intelligence",
    title: "Public-Sector Workflow Intelligence",
    scope: "Map synthetic workflow, accessibility, residency, auditability, procurement-evidence, continuity, and unresolved authorization requirements.",
    buyerArchetypes: ["public-sector"],
    syntheticInputs: ["synthetic workflow fixtures", "approved public procurement references", "accessibility test evidence"],
    measurements: ["evidence coverage", "accessibility checks", "unresolved owner actions", "continuity readiness", "review burden"],
    exclusions: [...universalExclusions, "FedRAMP, purchasing-eligibility, authorization, or compliance claim"],
    evidenceOutputs: ["readiness profile", "evidence owner map", "procurement artifact inventory", "authorization gap register"],
    risk: "moderate",
    pricingPosture: {
      mode: "custom-human-approved",
      statement: "Custom scope after procurement, legal, and security review",
      bindingQuoteAuthorized: false
    },
    expansionPath: ["owner evidence closure", "synthetic evaluation", "authorized procurement diligence"]
  })
];

export function getPilotTemplate(templateId: string) {
  return pilotTemplateRegistry.find((entry) => entry.templateId === templateId) ?? null;
}

export function getPilotTemplateRegistrySummary() {
  const payload = {
    version: pilotTemplateRegistryVersion,
    templateCount: pilotTemplateRegistry.length,
    templates: pilotTemplateRegistry,
    allNoPhi: pilotTemplateRegistry.every((entry) => entry.exclusions.includes("PHI or live patient data")),
    allNonbinding: pilotTemplateRegistry.every((entry) => !entry.pricingPosture.bindingQuoteAuthorized),
    productionAuthorityGranted: false as const
  };
  return {
    ...payload,
    registryHash: createClinicalEvidenceHash(payload)
  };
}
