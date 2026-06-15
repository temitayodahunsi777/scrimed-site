export type SourceIntelligenceCategory =
  | "interoperability"
  | "agent-operations"
  | "design-quality"
  | "model-governance"
  | "healthcare-domain"
  | "data-cloud"
  | "sales-experience";

export type SourceIntelligenceSignal = {
  sourceName: string;
  sourceUrl: string;
  category: SourceIntelligenceCategory;
  observedPattern: string;
  scrimedApplication: string;
  implementationPath: string[];
  governanceBoundary: string;
};

export const sourceIntelligenceBoundary =
  "SCRIMED source intelligence converts public, official product and standards signals into SCRIMED-specific product strategy. It does not copy proprietary code, assets, trade secrets, private documentation, or imply a partnership, certification, endorsement, live connector, medical-device authorization, or clinical approval.";

export const sourceIntelligenceSignals: SourceIntelligenceSignal[] = [
  {
    sourceName: "HL7 FHIR",
    sourceUrl: "https://www.hl7.org/fhir/overview.html",
    category: "interoperability",
    observedPattern:
      "FHIR uses modular resources, profiles, capability statements, terminology, conformance, security, clinical, financial, and workflow modules for implementable health data exchange.",
    scrimedApplication:
      "Make every SCRIMED workflow declare standards fit, capability expectations, profile assumptions, terminology dependencies, and synthetic conformance gates before live connectors.",
    implementationPath: [
      "Attach deployment-profile and workflow metadata to FHIR, HL7 v2, DICOMweb, X12, IHE, and terminology targets.",
      "Keep synthetic conformance tests separate from vendor certification or production data exchange.",
      "Use capability-statement style summaries for customer integration planning."
    ],
    governanceBoundary:
      "Interoperability readiness is synthetic and contractual until EHR, device, payer, customer, legal, privacy, and security approvals are completed."
  },
  {
    sourceName: "Notion",
    sourceUrl: "https://www.notion.com/",
    category: "agent-operations",
    observedPattern:
      "AI workspace positioning combines agents, enterprise search, knowledge base, projects, docs, integrations, and multilingual availability into one operating surface.",
    scrimedApplication:
      "Package SCRIMED as a healthcare intelligence workspace where agents, knowledge, proof packets, project cadence, governance, and buyer follow-up live together.",
    implementationPath: [
      "Add source-aware attribution and cadence so every buyer intake becomes a retained operating object.",
      "Keep product proof, sales activity, governance packs, and deployment profiles connected.",
      "Design future internal knowledge operations around one governed source of truth."
    ],
    governanceBoundary:
      "Workspace intelligence may organize business and workflow context, but it must not collect PHI through public intake or replace clinical review."
  },
  {
    sourceName: "Figma Release Notes",
    sourceUrl: "https://www.figma.com/release-notes/",
    category: "design-quality",
    observedPattern:
      "Recent Figma releases emphasize planning before generation, live context fetch with approvals, queued instructions, accessibility suggestions, and design-system mismatch detection.",
    scrimedApplication:
      "Turn SCRIMED product changes into plan-first, approval-gated releases with accessibility, claims-control, design-system, and buyer-path checks before deployment.",
    implementationPath: [
      "Retain source-intelligence plans for major product surfaces.",
      "Add accessibility, content-claims, and route-smoke checks as release gates.",
      "Keep generated ideas reviewable before they become buyer-facing product copy."
    ],
    governanceBoundary:
      "Design and planning controls improve product quality; they do not create legal, clinical, privacy, or compliance approval."
  },
  {
    sourceName: "Cursor",
    sourceUrl: "https://cursor.com/",
    category: "agent-operations",
    observedPattern:
      "AI software work is moving toward codebase-aware agents, review queues, cloud/CLI workflows, enterprise security, and large-scale codebase understanding.",
    scrimedApplication:
      "Use SCRIMED AgentOS patterns for product build operations: indexed context, plan generation, review states, durable audit, and release checks.",
    implementationPath: [
      "Treat every strategic build as a work order with context, plan, changes, tests, deployment, and rollback notes.",
      "Expose known limitations and fallbacks rather than relying on a single local toolchain.",
      "Keep code-generation output behind lint, typecheck, build, smoke, and deployment verification."
    ],
    governanceBoundary:
      "Build agents can accelerate engineering, but production healthcare workflows still require human review, audit, security, and clinical governance."
  },
  {
    sourceName: "Hugging Face",
    sourceUrl: "https://huggingface.co/",
    category: "model-governance",
    observedPattern:
      "Model ecosystems combine models, datasets, applications, inference providers, compute, enterprise security, access controls, audit logs, and open-source tooling.",
    scrimedApplication:
      "Advance SCRIMED Model Router into a governed model and dataset registry with provider choice, audit logs, evaluation fixtures, and future private deployment options.",
    implementationPath: [
      "Keep model-provider routing abstracted from product workflows.",
      "Track model, dataset, prompt, evaluation, and deployment metadata as AI assets.",
      "Separate open-model experimentation from protected healthcare data use."
    ],
    governanceBoundary:
      "Model availability does not authorize PHI processing, medical advice, autonomous care, or clinical validation."
  },
  {
    sourceName: "Siemens Healthineers",
    sourceUrl: "https://www.siemens-healthineers.com/",
    category: "healthcare-domain",
    observedPattern:
      "Large healthcare technology portfolios span imaging, cancer care, diagnostics, point-of-care testing, digital automation, healthcare IT, services, education, cybersecurity, and global operations.",
    scrimedApplication:
      "Build SCRIMED as a domain-aware intelligence layer that can evaluate imaging, oncology, lab, device, education, workforce, and operational workflows without claiming device control.",
    implementationPath: [
      "Expand synthetic scenarios for oncology operations, imaging workflow, lab result routing, and device-adjacent evidence.",
      "Keep DICOM, DICOMweb, HL7 v2, FHIR Device, lab, and IHE boundaries explicit.",
      "Use global deployment profiles for region, residency, support, and public-sector readiness."
    ],
    governanceBoundary:
      "Healthcare-domain depth does not permit diagnosis, imaging interpretation, device control, treatment planning, or medical-device claims."
  },
  {
    sourceName: "Siemens Healthineers Cancer Care",
    sourceUrl: "https://cancercare.siemens-healthineers.com/",
    category: "healthcare-domain",
    observedPattern:
      "Cancer-care ecosystems include oncology management, treatment planning, patient engagement, analytics, quality assurance, theranostics, and interoperability.",
    scrimedApplication:
      "Strengthen TrialCore and Onco-ID roadmap planning around oncology workflow intelligence, eligibility review, missing evidence, analytics, QA, and survivorship coordination.",
    implementationPath: [
      "Add oncology-specific synthetic proof scenarios with clinical-review and research-review ownership.",
      "Attach evidence provenance, reviewer status, and no-treatment-recommendation boundaries.",
      "Prepare oncology buyer messaging around workflow intelligence rather than autonomous cancer care."
    ],
    governanceBoundary:
      "Oncology intelligence remains synthetic, operational, and review-gated until licensed clinical validation and regulatory review are completed."
  },
  {
    sourceName: "Snowflake Developers",
    sourceUrl: "https://www.snowflake.com/en/developers/",
    category: "data-cloud",
    observedPattern:
      "Modern data platforms expose AI/ML, application development, collaboration, data engineering, governance, notebooks, Snowpark, Streamlit, Cortex, tasks, and marketplace-style distribution.",
    scrimedApplication:
      "Prepare SCRIMED Healthcare Intelligence Graph and analytics layers for governed data-cloud deployment, customer warehouses, native apps, and reusable data products.",
    implementationPath: [
      "Keep data-cloud connectors optional and customer-approved.",
      "Design analytics outputs as governed data products with lineage, retention, and residency metadata.",
      "Use synthetic notebooks or app-style demos before any customer warehouse integration."
    ],
    governanceBoundary:
      "Data-cloud readiness is not permission to move PHI, train models on customer data, or bypass data-processing agreements."
  },
  {
    sourceName: "Sierra",
    sourceUrl: "https://sierra.ai/",
    category: "sales-experience",
    observedPattern:
      "Enterprise agent platforms emphasize multichannel deployment, agent memory, customer data, recommendations, proactive engagement, observability, experiments, monitors, and outcome-based pricing.",
    scrimedApplication:
      "Make SCRIMED buyer, patient-experience, and workflow agents measurable by outcome signals, channel, cadence, observability, and human escalation.",
    implementationPath: [
      "Attach attribution, source route, campaign, target audience, and sales cadence to every buyer opportunity.",
      "Use outcome-based proof metrics for pilots while blocking guaranteed ROI or reimbursement claims.",
      "Add monitors for escalation, override, time saved, revenue leakage surfaced, and trust completeness."
    ],
    governanceBoundary:
      "Agent experience patterns can improve commercial and operational workflow design, but healthcare actions remain human-reviewed and non-autonomous."
  },
  {
    sourceName: "Anthropic",
    sourceUrl: "https://www.anthropic.com/",
    category: "model-governance",
    observedPattern:
      "AI platforms increasingly publish safety, responsible scaling, transparency, security, compliance, developer, and model-family materials as part of enterprise trust.",
    scrimedApplication:
      "Evolve SCRIMED TrustOS and Model Router with explicit safety policy, model-family abstraction, escalation thresholds, transparency packets, and security evidence.",
    implementationPath: [
      "Add model-route metadata to AI outputs and proof packets.",
      "Document safety thresholds for when SCRIMED escalates instead of answering.",
      "Keep trust center, claims register, and evidence packets aligned with actual current capability."
    ],
    governanceBoundary:
      "AI safety architecture supports trust, but it is not a substitute for healthcare regulatory review, clinical validation, or customer governance approval."
  }
];

function countByCategory(category: SourceIntelligenceCategory) {
  return sourceIntelligenceSignals.filter((signal) => signal.category === category).length;
}

export function getSourceIntelligenceSummary() {
  const categories: SourceIntelligenceCategory[] = [
    "interoperability",
    "agent-operations",
    "design-quality",
    "model-governance",
    "healthcare-domain",
    "data-cloud",
    "sales-experience"
  ];

  return {
    service: "scrimed-source-intelligence",
    status: "source-informed-strategy-ready",
    route: "/source-intelligence",
    apiRoute: "/api/source-intelligence",
    boundary: sourceIntelligenceBoundary,
    sourceCount: sourceIntelligenceSignals.length,
    categories: categories.map((category) => ({
      category,
      count: countByCategory(category)
    })),
    signals: sourceIntelligenceSignals,
    implementationThemes: [
      "Standards-first interoperability",
      "Governed agent workspace operations",
      "Plan-first product release quality",
      "Model-router and AI asset governance",
      "Healthcare domain depth without clinical overclaiming",
      "Data-cloud and sovereign deployment readiness",
      "Outcome-measured sales and workflow activation"
    ],
    nextBuildStep:
      "Connect source-informed patterns to sales attribution, pilot intake, product proof packets, and release-quality gates.",
    updated: "2026-06-15"
  };
}

export function getSourceSignalsByCategory(category: SourceIntelligenceCategory) {
  return sourceIntelligenceSignals.filter((signal) => signal.category === category);
}

export function buildSourceIntelligenceBrief() {
  const summary = getSourceIntelligenceSummary();

  return [
    "# SCRIMED Source Intelligence Brief",
    "",
    `Status: ${summary.status}`,
    `Boundary: ${summary.boundary}`,
    "",
    "## Implementation Themes",
    ...summary.implementationThemes.map((theme) => `- ${theme}`),
    "",
    "## Source Signals",
    ...summary.signals.map(
      (signal) =>
        `- ${signal.sourceName} (${signal.category}): ${signal.scrimedApplication} Boundary: ${signal.governanceBoundary}`
    ),
    "",
    "## Next Build Step",
    summary.nextBuildStep
  ].join("\n");
}
