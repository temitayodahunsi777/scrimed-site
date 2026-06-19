import {
  protectedOperatorMetricCaptureStatus,
  protectedOperatorMetricCatalog
} from "./protectedOperatorMetrics";
import {
  protectedMetricRollupPacketProofStackStatus,
  protectedMetricRollupStatus
} from "./protectedMetricRollups";
import {
  protectedMetricTrendPacketProofStackStatus,
  protectedMetricTrendReviewStatus
} from "./protectedMetricTrends";
import {
  protectedBoardScorecardPacketProofStackStatus,
  protectedBoardScorecardStatus
} from "./protectedBoardScorecards";
import {
  protectedFinanceMethodologyPacketProofStackStatus,
  protectedFinanceMethodologyStatus
} from "./protectedFinanceMethodology";

export type PublicMarketMetricCategory =
  | "unit-economics"
  | "workflow-value"
  | "cost-control"
  | "compliance-governance"
  | "customer-proof"
  | "margin-discipline";

export type PublicMarketMetricMaturity =
  | "definition-ready"
  | "synthetic-measurement-ready"
  | "protected-pilot-measurement-required"
  | "external-finance-review-required";

export type PublicMarketOperatingMetric = {
  id: string;
  name: string;
  category: PublicMarketMetricCategory;
  unit: string;
  formula: string;
  targetDirection: "lower-is-better" | "higher-is-better" | "within-approved-band";
  currentMaturity: PublicMarketMetricMaturity;
  auditSource: string;
  proofRoute: string;
  boundary: string;
};

export type PublicMarketUnitEconomicsPackage = {
  packageName: string;
  commercialStage: string;
  priceSignal: string;
  measurableValue: string[];
  costDrivers: string[];
  marginDiscipline: string;
  proofRoutes: string[];
  boundary: string;
};

export type PublicMarketModelEfficiencyControl = {
  control: string;
  operatingPolicy: string;
  costControl: string;
  safetyControl: string;
  proofRoute: string;
};

export type PublicMarketComplianceLog = {
  log: string;
  owner: string;
  currentSource: string;
  proofRoute: string;
  metricUse: string;
  boundary: string;
};

export type PublicMarketCustomerProofStage = {
  stage: string;
  buyerCommitment: string;
  scrimedProof: string;
  revenueSignal: string;
  nextGate: string;
};

export type PublicMarketBoardCadence = {
  cadence: string;
  owner: string;
  reviewedSignals: string[];
  decisionOutput: string;
};

export type PublicMarketLimitation = {
  limitation: string;
  impact: string;
  workaround: string;
  graduationGate: string;
};

export const publicMarketReadinessProofStackStatus =
  "public-market-readiness-capital-efficiency-kpi-stack";
export const publicMarketReadinessBriefProofStackStatus =
  "public-market-readiness-board-brief-no-financial-advice";

export const publicMarketReadinessBoundary =
  "SCRIMED Public Market Readiness organizes KPI definitions, unit-economics discipline, compliance logs, customer proof, governance documentation, model-efficiency controls, and investor narrative for enterprise operating maturity. It is not audited financial reporting, securities offering material, investment advice, accounting advice, tax advice, a valuation guarantee, clinical validation, reimbursement assurance, compliance certification, or live clinical execution authorization.";

export const publicMarketInvestorThesis =
  "While frontier labs burn billions to build general intelligence, SCRIMED captures healthcare-specific value by owning the workflow, trust layer, data loops, governance evidence, interoperability path, and measurable outcomes around healthcare operations.";

export const publicMarketOperatingMetrics: PublicMarketOperatingMetric[] = [
  {
    id: "cost-per-workflow",
    name: "Cost per governed workflow",
    category: "unit-economics",
    unit: "USD per completed workflow packet",
    formula:
      "(model cost + infrastructure cost + review labor + support allocation) / completed governed workflow packets",
    targetDirection: "lower-is-better",
    currentMaturity: "synthetic-measurement-ready",
    auditSource: "AgentOS task trace, QA evidence ledger, proof-packet release audit, and workflow result validation.",
    proofRoute: "/workflows/results",
    boundary: "Synthetic and protected-pilot workflows only until buyer-approved production baselines exist."
  },
  {
    id: "cost-per-patient-interaction",
    name: "Cost per patient interaction equivalent",
    category: "unit-economics",
    unit: "USD per synthetic or approved pilot interaction",
    formula:
      "(agent execution cost + routing cost + human-review cost) / synthetic or approved pilot interaction count",
    targetDirection: "lower-is-better",
    currentMaturity: "protected-pilot-measurement-required",
    auditSource: "Protected pilot sessions, buyer demo sessions, and approved customer baselines.",
    proofRoute: "/pilot-workspace/access",
    boundary:
      "No live patient interaction is authorized. Current use is a pilot-equivalent metric definition."
  },
  {
    id: "cost-per-chart",
    name: "Cost per chart review",
    category: "unit-economics",
    unit: "USD per synthetic or approved chart-review work order",
    formula:
      "(document intelligence cost + model extraction cost + TrustQA review cost + reviewer time) / chart-review work orders",
    targetDirection: "lower-is-better",
    currentMaturity: "synthetic-measurement-ready",
    auditSource: "DocuTwin work orders, Trust Cards, and manual QA evidence packets.",
    proofRoute: "/modules/docutwin",
    boundary: "No PHI, record mutation, diagnosis insertion, or final note filing is authorized."
  },
  {
    id: "cost-per-prior-auth",
    name: "Cost per prior authorization support packet",
    category: "unit-economics",
    unit: "USD per packet draft",
    formula:
      "(policy retrieval cost + document parsing cost + model drafting cost + reviewer time) / prior-auth packet drafts",
    targetDirection: "lower-is-better",
    currentMaturity: "synthetic-measurement-ready",
    auditSource: "Agent Workspace work orders, Atlas evidence layer, and proof packet audit.",
    proofRoute: "/agent-workspace",
    boundary: "No payer submission, coverage determination, or medical-necessity decision is authorized."
  },
  {
    id: "cost-per-denial-appeal",
    name: "Cost per denial appeal support draft",
    category: "unit-economics",
    unit: "USD per reviewable appeal draft",
    formula:
      "(claim-context parsing + policy evidence retrieval + draft generation + qualified review allocation) / appeal-support drafts",
    targetDirection: "lower-is-better",
    currentMaturity: "synthetic-measurement-ready",
    auditSource: "RCM Agent work orders, TrustOS reviewer checkpoints, and governance packets.",
    proofRoute: "/workflows/results",
    boundary: "No final coding, billing, appeal submission, or reimbursement guarantee is authorized."
  },
  {
    id: "time-saved-per-clinician",
    name: "Time saved per clinician",
    category: "workflow-value",
    unit: "minutes saved per reviewed workflow",
    formula:
      "buyer-approved baseline minutes - SCRIMED-assisted minutes for the same governed workflow",
    targetDirection: "higher-is-better",
    currentMaturity: "protected-pilot-measurement-required",
    auditSource: "Buyer baseline, protected pilot result packet, reviewer sign-off, and QA evidence.",
    proofRoute: "/pilot-evidence",
    boundary: "This is an operational-efficiency metric, not a clinical outcome claim."
  },
  {
    id: "revenue-protected",
    name: "Revenue protected per payer or provider workflow",
    category: "workflow-value",
    unit: "USD at-risk revenue surfaced for qualified review",
    formula:
      "reviewed denial risk, missing-evidence exposure, or leakage opportunity identified under buyer-approved methodology",
    targetDirection: "higher-is-better",
    currentMaturity: "protected-pilot-measurement-required",
    auditSource: "Revenue workflow result packets, buyer finance review, and approved value methodology.",
    proofRoute: "/pricing",
    boundary:
      "Revenue protected is a reviewed operational signal, not a reimbursement promise or audited financial result."
  },
  {
    id: "compliance-log-completeness",
    name: "Compliance log completeness",
    category: "compliance-governance",
    unit: "percentage of governed events with required metadata",
    formula: "governed events with required audit metadata / total governed events",
    targetDirection: "higher-is-better",
    currentMaturity: "synthetic-measurement-ready",
    auditSource: "Protected pilot audit events, TrustOS decisions, QA packets, and activation attestations.",
    proofRoute: "/audit",
    boundary: "Log completeness does not equal compliance certification or regulator acceptance."
  },
  {
    id: "gross-margin-by-offer",
    name: "Gross margin by offer",
    category: "margin-discipline",
    unit: "percentage margin by package",
    formula:
      "(contracted package revenue - model cost - infrastructure cost - implementation labor - support allocation - reviewer allocation) / contracted package revenue",
    targetDirection: "within-approved-band",
    currentMaturity: "external-finance-review-required",
    auditSource: "Pricing model, sales deal room, finance review, usage logs, and delivery time tracking.",
    proofRoute: "/pricing",
    boundary:
      "Requires finance-reviewed cost accounting before external reporting or investor diligence use."
  },
  {
    id: "model-cost-per-trust-card",
    name: "Model cost per Trust Card",
    category: "cost-control",
    unit: "USD per evidence-backed recommendation card",
    formula:
      "(retrieval cost + model route cost + validation cost + reviewer allocation) / Trust Cards generated",
    targetDirection: "lower-is-better",
    currentMaturity: "definition-ready",
    auditSource: "Atlas Trust Cards, model-router logs, validation records, and reviewer status.",
    proofRoute: "/atlas",
    boundary: "Trust Cards remain review support, not autonomous clinical decisions."
  }
];

export const publicMarketUnitEconomicsPackages: PublicMarketUnitEconomicsPackage[] = [
  {
    packageName: "Workflow Intelligence Assessment",
    commercialStage: "paid assessment",
    priceSignal: "Starts at $50k; typical range $75k-$150k fixed fee",
    measurableValue: [
      "workflow friction map",
      "automation candidate scorecard",
      "governance gap register",
      "pilot success criteria"
    ],
    costDrivers: ["discovery hours", "workflow analysis", "buyer workshops", "executive findings"],
    marginDiscipline:
      "Keep scope fixed, cap workshop hours, reuse SCRIMED assessment templates, and convert qualified accounts into higher-value pilots.",
    proofRoutes: ["/pricing", "/pilot-deal-room", "/pilot"],
    boundary: "Assessment output is operational intelligence, not legal, clinical, or regulatory advice."
  },
  {
    packageName: "Synthetic Pilot Evaluation",
    commercialStage: "sellable pilot",
    priceSignal: "Starts at $150k; typical range $200k-$500k for 45-90 days",
    measurableValue: [
      "cost per governed workflow",
      "time saved estimate",
      "workflow friction reduced",
      "Trust Card completeness",
      "production-readiness gates"
    ],
    costDrivers: ["agent runs", "synthetic workflow design", "proof packets", "review meetings", "QA evidence"],
    marginDiscipline:
      "Use task-specific agents, deterministic synthetic fixtures, bounded model routes, and reusable governance packets.",
    proofRoutes: ["/product", "/evaluation", "/qa-evidence", "/demos"],
    boundary: "Synthetic data only; no PHI, diagnosis, payer submission, patient outreach, or live execution."
  },
  {
    packageName: "Protected Enterprise Pilot",
    commercialStage: "protected pilot",
    priceSignal: "Starts at $750k; typical range $1M-$2.5M for 90-180 days",
    measurableValue: [
      "buyer-approved workflow baseline",
      "reviewer acceptance rate",
      "override and escalation rates",
      "cost per work order",
      "readiness gates closed"
    ],
    costDrivers: ["tenant setup", "identity controls", "human review", "security diligence", "governance operations"],
    marginDiscipline:
      "Charge separately for connectors, implementation, evidence vault controls, custom support, and regional compliance work.",
    proofRoutes: ["/pilot-workspace/access", "/clinical-care-activation", "/trust-safety-operations"],
    boundary:
      "Protected pilot does not authorize live clinical execution until external approvals and customer-specific controls pass."
  },
  {
    packageName: "Enterprise Operating License",
    commercialStage: "annual platform license",
    priceSignal: "Annual platform license starts at $2.5M; enterprise range $3M-$12M+",
    measurableValue: [
      "workflows under governance",
      "departments served",
      "model cost per workflow",
      "audit completeness",
      "expansion revenue"
    ],
    costDrivers: ["platform support", "workflow count", "connectors", "monitoring", "customer success"],
    marginDiscipline:
      "Separate platform license from implementation services and charge add-ons for workflow, connector, region, and support expansion.",
    proofRoutes: ["/pricing", "/observability", "/deployment-profiles"],
    boundary: "Production terms require signed scope, security review, privacy controls, and human-review operating procedures."
  }
];

export const publicMarketModelEfficiencyControls: PublicMarketModelEfficiencyControl[] = [
  {
    control: "Task-specific agent routing",
    operatingPolicy:
      "Route narrow workflow tasks to specialized agents instead of a single large general-purpose agent.",
    costControl:
      "Use deterministic preprocessing, small-model classification, and retrieval-before-generation before escalating to premium models.",
    safetyControl: "Escalate uncertainty and high-risk clinical-adjacent content to human review.",
    proofRoute: "/agents"
  },
  {
    control: "Open and closed model optionality",
    operatingPolicy:
      "Keep model-provider abstraction so SCRIMED can route between frontier APIs, healthcare-specific models, open-weight models, and future sovereign deployments.",
    costControl: "Choose the least expensive route that satisfies safety, latency, context, and evidence requirements.",
    safetyControl: "Do not route PHI-sensitive or regulated tasks without approved deployment controls.",
    proofRoute: "/healthcare-intelligence-os"
  },
  {
    control: "Token and evidence budgets",
    operatingPolicy:
      "Attach workflow-level budgets for context size, evidence retrieval depth, model calls, retries, and reviewer effort.",
    costControl: "Track cost per workflow, Trust Card, chart, prior-auth packet, and denial draft.",
    safetyControl: "Block budget-driven shortcuts that remove citations, confidence, or review gates.",
    proofRoute: "/observability"
  },
  {
    control: "Workflow-owned data loops",
    operatingPolicy:
      "Optimize around customer workflow outcomes rather than generic benchmark scores.",
    costControl:
      "Invest in reusable workflow traces, corrections, and governance packets that improve future runs without retraining foundation models.",
    safetyControl: "Use deidentified or synthetic feedback until privacy and customer data rights are approved.",
    proofRoute: "/pilot-evidence"
  }
];

export const publicMarketComplianceLogs: PublicMarketComplianceLog[] = [
  {
    log: "Protected pilot audit events",
    owner: "TrustOS, engineering, and tenant admins",
    currentSource: "Tenant-scoped Supabase audit events and proof-packet release logs.",
    proofRoute: "/pilot-workspace/access",
    metricUse: "Compliance log completeness, customer proof, and buyer diligence.",
    boundary: "No PHI, secrets, or live medical records are stored in current protected packets."
  },
  {
    log: "QA evidence ledger",
    owner: "Engineering and trust operations",
    currentSource: "Dated smoke, build, manual-run, and no-secret QA evidence.",
    proofRoute: "/qa-evidence",
    metricUse: "Release discipline, defect visibility, and investor diligence.",
    boundary: "QA evidence is product reliability evidence, not certification."
  },
  {
    log: "Clinical activation dossier and approvals",
    owner: "Clinical governance, legal, security, privacy, and operations",
    currentSource: "No-PHI AAL2 clinical activation readiness attestations and packets.",
    proofRoute: "/clinical-care-activation",
    metricUse: "Hard-gate closure, readiness posture, and regulated deployment planning.",
    boundary: "Readiness attestations do not authorize live clinical care."
  },
  {
    log: "Buyer diligence and secure evidence vault readiness",
    owner: "Sales operations, legal, privacy, and security",
    currentSource: "Buyer room, diligence packets, and disabled-by-default vault readiness controls.",
    proofRoute: "/pilot-deal-room",
    metricUse: "Customer proof, revenue-stage maturity, and enterprise procurement readiness.",
    boundary: "Sensitive buyer document storage remains disabled until approved controls exist."
  },
  {
    log: "Protected operator metric ledger",
    owner: "Founder, finance advisor, product, and trust operations",
    currentSource:
      "AAL2 tenant-scoped no-PHI captures for model cost, review time, delivery hours, proof-packet count, and workflow volume.",
    proofRoute: "/pilot-workspace/access",
    metricUse: "Unit-economics discipline, board review, pricing posture, and finance-readiness coverage.",
    boundary:
      "Operator metrics are aggregate operating metadata, not audited financial reporting, securities offering material, valuation assurance, reimbursement assurance, or clinical validation."
  },
  {
    log: "Trust Safety Operations",
    owner: "Trust, safety, legal, security, communications, and executive leadership",
    currentSource: "Incident, copyright, public-claims, safety, escalation, and continuous-improvement registers.",
    proofRoute: "/trust-safety-operations",
    metricUse: "Public-company operating discipline and brand-risk control.",
    boundary: "Current registers do not replace managed 24/7 SOC, counsel review, or insurance decisions."
  }
];

export const publicMarketCustomerProofStages: PublicMarketCustomerProofStage[] = [
  {
    stage: "Public product proof",
    buyerCommitment: "Self-guided inspection",
    scrimedProof: "Product console, demos, pricing, Trust Center, and public market readiness.",
    revenueSignal: "Qualified buyer enters pilot intake or sales conversation.",
    nextGate: "Paid assessment scope and no-PHI acknowledgement."
  },
  {
    stage: "Paid assessment",
    buyerCommitment: "Fixed-fee workflow intelligence engagement",
    scrimedProof: "Workflow maps, governance gap register, KPI baseline plan, and pilot recommendation.",
    revenueSignal: "Assessment revenue plus qualified pilot conversion.",
    nextGate: "Synthetic pilot success criteria and sponsor approval."
  },
  {
    stage: "Synthetic pilot",
    buyerCommitment: "45-90 day governed evaluation",
    scrimedProof: "Synthetic workflow packets, Trust Cards, QA evidence, observability, and buyer diligence export.",
    revenueSignal: "Pilot revenue and expansion case.",
    nextGate: "Protected pilot data boundary, security, legal, privacy, and identity approvals."
  },
  {
    stage: "Protected enterprise pilot",
    buyerCommitment: "Tenant-isolated governed pilot",
    scrimedProof: "AAL2 access, audit events, approval workflow, command intelligence, and proof packets.",
    revenueSignal: "Protected pilot revenue and enterprise license proposal.",
    nextGate: "Signed production controls, human-review SOP, connector validation, and go-live approval."
  },
  {
    stage: "Enterprise operating license",
    buyerCommitment: "Annual or multi-year platform agreement",
    scrimedProof: "Measured workflow value, margin discipline, governance reporting, and expansion roadmap.",
    revenueSignal: "Recurring platform revenue, modules, connectors, regions, and support expansion.",
    nextGate: "Board-level value review and multi-workflow expansion."
  }
];

export const publicMarketBoardCadence: PublicMarketBoardCadence[] = [
  {
    cadence: "Weekly operating review",
    owner: "Founder, product, engineering, sales, and trust operations",
    reviewedSignals: [
      "build and smoke status",
      "protected route failures",
      "sales intake quality",
      "buyer proof packet readiness",
      "known blockers"
    ],
    decisionOutput: "fix list, release gate, buyer follow-up, and next build step"
  },
  {
    cadence: "Monthly metric review",
    owner: "Founder, finance advisor, sales, product, and delivery",
    reviewedSignals: [
      "cost per workflow",
      "pilot conversion",
      "time saved signal",
      "model cost trend",
      "delivery effort by package"
    ],
    decisionOutput: "pricing adjustments, margin guardrails, and pilot scope standards"
  },
  {
    cadence: "Quarterly governance review",
    owner: "Executive leadership, counsel, security, privacy, clinical advisors, and board advisors",
    reviewedSignals: [
      "claims register",
      "clinical activation gates",
      "security/privacy blockers",
      "incident trends",
      "enterprise-readiness gaps"
    ],
    decisionOutput: "approved claims, prohibited claims, risk acceptances, and production readiness decisions"
  },
  {
    cadence: "Investor diligence review",
    owner: "Founder, finance, legal, product, and investor relations",
    reviewedSignals: [
      "customer proof ladder",
      "unit economics maturity",
      "gross margin assumptions",
      "recurring revenue path",
      "competitive edge"
    ],
    decisionOutput: "board memo, investor packet, and external-review queue"
  }
];

export const publicMarketLimitations: PublicMarketLimitation[] = [
  {
    limitation: "No audited financial statements inside SCRIMED yet",
    impact: "External investors cannot treat current KPI stack as audited financial reporting.",
    workaround:
      "Use the KPI definitions, pricing tiers, sales audit evidence, and proof packets as operating-readiness material while finance and accounting review is completed.",
    graduationGate: "Finance-reviewed chart of accounts, revenue recognition policy, cost allocation, and audit-ready reporting."
  },
  {
    limitation: "No live clinical outcomes",
    impact: "SCRIMED cannot claim patient-outcome improvement from production deployment.",
    workaround:
      "Report synthetic and protected-pilot operational metrics only, then graduate to customer-approved outcome studies after legal, clinical, privacy, and data rights approval.",
    graduationGate: "Customer-approved clinical governance protocol, IRB or ethics review when required, and signed data-processing path."
  },
  {
    limitation: "No PHI-enabled cost telemetry",
    impact: "Patient-level cost per interaction remains a pilot-equivalent definition.",
    workaround:
      "Use synthetic interactions and buyer-approved aggregate workflow baselines until PHI authorization, BAA/DPA, consent, and production controls exist.",
    graduationGate: "Approved production data boundary, minimum-necessary design, audit controls, and customer authorization."
  },
  {
    limitation: "No securities offering or valuation guarantee",
    impact: "Investor narrative must stay as strategic positioning, not investment solicitation.",
    workaround:
      "Keep public-market readiness language framed as internal operating discipline and diligence preparation, with counsel-reviewed materials before fundraising use.",
    graduationGate: "Qualified securities counsel, approved investor materials, and controlled data-room process."
  },
  {
    limitation: "Secure evidence vault storage remains disabled by default",
    impact: "Sensitive buyer diligence artifacts cannot be uploaded into SCRIMED yet.",
    workaround:
      "Use metadata-only vault readiness and buyer-approved external secure channels until DLP, malware scanning, encryption, retention, legal hold, and access reviews are approved.",
    graduationGate: "Approved storage provider, security controls, legal terms, incident response, and access-review workflow."
  }
];

function markdownList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

export function getPublicMarketReadinessSummary() {
  return {
    service: "scrimed-public-market-readiness",
    route: "/public-market-readiness",
    apiRoute: "/api/public-market-readiness",
    briefRoute: "/api/public-market-readiness/brief",
    protectedOperatorMetricRoute: "/pilot-workspace/access",
    protectedOperatorMetricApiRoute: "/api/pilot-workspaces/{workspaceSlug}/operator-metrics",
    protectedMetricRollupRoute: "/pilot-workspace/access",
    protectedMetricRollupApiRoute: "/api/pilot-workspaces/{workspaceSlug}/metric-rollups",
    protectedMetricRollupPacketApiRoute:
      "/api/pilot-workspaces/{workspaceSlug}/metric-rollups/{snapshotId}/packet",
    protectedMetricTrendRoute: "/pilot-workspace/access",
    protectedMetricTrendApiRoute: "/api/pilot-workspaces/{workspaceSlug}/metric-trends",
    protectedMetricTrendPacketApiRoute:
      "/api/pilot-workspaces/{workspaceSlug}/metric-trends/{reviewId}/packet",
    protectedBoardScorecardRoute: "/pilot-workspace/access",
    protectedBoardScorecardApiRoute: "/api/pilot-workspaces/{workspaceSlug}/board-scorecards",
    protectedBoardScorecardPacketApiRoute:
      "/api/pilot-workspaces/{workspaceSlug}/board-scorecards/{scorecardId}/packet",
    protectedFinanceMethodologyRoute: "/pilot-workspace/access",
    protectedFinanceMethodologyApiRoute:
      "/api/pilot-workspaces/{workspaceSlug}/finance-methodology",
    protectedFinanceMethodologyPacketApiRoute:
      "/api/pilot-workspaces/{workspaceSlug}/finance-methodology/packet",
    status: "capital-efficiency-kpi-stack-ready",
    proofStackStatus: publicMarketReadinessProofStackStatus,
    briefProofStackStatus: publicMarketReadinessBriefProofStackStatus,
    protectedOperatorMetricStatus: protectedOperatorMetricCaptureStatus,
    protectedMetricRollupStatus,
    protectedMetricRollupPacketStatus: protectedMetricRollupPacketProofStackStatus,
    protectedMetricTrendStatus: protectedMetricTrendReviewStatus,
    protectedMetricTrendPacketStatus: protectedMetricTrendPacketProofStackStatus,
    protectedBoardScorecardStatus,
    protectedBoardScorecardPacketStatus: protectedBoardScorecardPacketProofStackStatus,
    protectedFinanceMethodologyStatus,
    protectedFinanceMethodologyPacketStatus: protectedFinanceMethodologyPacketProofStackStatus,
    thesis: "SCRIMED is healthcare intelligence infrastructure, not another AI model company.",
    investorNarrative: publicMarketInvestorThesis,
    efficientHealthcareIntelligence:
      "SCRIMED should own healthcare workflows, trust evidence, and outcomes while using model routing, task-specific agents, open/closed model optionality, and token-cost controls to avoid frontier-model dependency.",
    boundary: publicMarketReadinessBoundary,
    metricCount: publicMarketOperatingMetrics.length,
    unitEconomicsPackageCount: publicMarketUnitEconomicsPackages.length,
    modelEfficiencyControlCount: publicMarketModelEfficiencyControls.length,
    complianceLogCount: publicMarketComplianceLogs.length,
    customerProofStageCount: publicMarketCustomerProofStages.length,
    boardCadenceCount: publicMarketBoardCadence.length,
    limitationCount: publicMarketLimitations.length,
    operatorMetricCatalogCount: protectedOperatorMetricCatalog.length,
    operatingMetrics: publicMarketOperatingMetrics,
    operatorMetricCatalog: protectedOperatorMetricCatalog,
    unitEconomicsPackages: publicMarketUnitEconomicsPackages,
    modelEfficiencyControls: publicMarketModelEfficiencyControls,
    complianceLogs: publicMarketComplianceLogs,
    customerProofStages: publicMarketCustomerProofStages,
    boardCadence: publicMarketBoardCadence,
    limitations: publicMarketLimitations,
    nextBuildStep:
      "Add qualified external-use approval evidence vault linkage and versioned finance-reviewed methodology policies once counsel, finance, privacy, security, communications, and customer-specific evidence retention are approved.",
    updated: "2026-06-19"
  };
}

export function buildPublicMarketReadinessBrief() {
  const summary = getPublicMarketReadinessSummary();

  return `# SCRIMED Public Market Readiness Brief

## Control
- Status: ${summary.status}
- Proof stack: ${summary.proofStackStatus}
- Brief proof stack: ${summary.briefProofStackStatus}
- Protected operator metric capture: ${summary.protectedOperatorMetricStatus}
- Protected metric rollups: ${summary.protectedMetricRollupStatus}
- Protected metric rollup packets: ${summary.protectedMetricRollupPacketStatus}
- Protected metric trend reviews: ${summary.protectedMetricTrendStatus}
- Protected metric trend packets: ${summary.protectedMetricTrendPacketStatus}
- Protected board scorecards: ${summary.protectedBoardScorecardStatus}
- Protected board scorecard packets: ${summary.protectedBoardScorecardPacketStatus}
- Protected finance methodology gates: ${summary.protectedFinanceMethodologyStatus}
- Protected finance methodology packets: ${summary.protectedFinanceMethodologyPacketStatus}
- Route: ${summary.route}
- API: ${summary.apiRoute}
- Protected metric route: ${summary.protectedOperatorMetricRoute}
- Protected metric API: ${summary.protectedOperatorMetricApiRoute}
- Protected rollup route: ${summary.protectedMetricRollupRoute}
- Protected rollup API: ${summary.protectedMetricRollupApiRoute}
- Protected rollup packet API: ${summary.protectedMetricRollupPacketApiRoute}
- Protected trend route: ${summary.protectedMetricTrendRoute}
- Protected trend API: ${summary.protectedMetricTrendApiRoute}
- Protected trend packet API: ${summary.protectedMetricTrendPacketApiRoute}
- Protected scorecard route: ${summary.protectedBoardScorecardRoute}
- Protected scorecard API: ${summary.protectedBoardScorecardApiRoute}
- Protected scorecard packet API: ${summary.protectedBoardScorecardPacketApiRoute}
- Protected finance methodology route: ${summary.protectedFinanceMethodologyRoute}
- Protected finance methodology API: ${summary.protectedFinanceMethodologyApiRoute}
- Protected finance methodology packet API: ${summary.protectedFinanceMethodologyPacketApiRoute}
- Updated: ${summary.updated}

## Thesis
${summary.thesis}

${summary.investorNarrative}

## Efficient Healthcare Intelligence
${summary.efficientHealthcareIntelligence}

## Internal KPI Stack
${summary.operatingMetrics
  .map(
    (metric) => `### ${metric.name}
- ID: ${metric.id}
- Category: ${metric.category}
- Unit: ${metric.unit}
- Formula: ${metric.formula}
- Target direction: ${metric.targetDirection}
- Maturity: ${metric.currentMaturity}
- Audit source: ${metric.auditSource}
- Proof route: ${metric.proofRoute}
- Boundary: ${metric.boundary}`
  )
  .join("\n\n")}

## Protected Operator Metric Capture
${summary.operatorMetricCatalog
  .map(
    (metric) => `- ${metric.label}: ${metric.description} Unit: ${metric.unit}. KPI: ${metric.publicMarketKpiId}. Proof: ${metric.proofRoute}. Discipline: ${metric.costDiscipline}`
  )
  .join("\n")}

## Unit Economics Packages
${summary.unitEconomicsPackages
  .map(
    (offer) => `### ${offer.packageName}
- Commercial stage: ${offer.commercialStage}
- Price signal: ${offer.priceSignal}
- Measurable value:
${markdownList(offer.measurableValue)}
- Cost drivers:
${markdownList(offer.costDrivers)}
- Margin discipline: ${offer.marginDiscipline}
- Proof routes: ${offer.proofRoutes.join(", ")}
- Boundary: ${offer.boundary}`
  )
  .join("\n\n")}

## Model Efficiency Controls
${summary.modelEfficiencyControls
  .map(
    (control) => `- ${control.control}: ${control.operatingPolicy} Cost control: ${control.costControl} Safety control: ${control.safetyControl} Proof: ${control.proofRoute}`
  )
  .join("\n")}

## Compliance Logs
${summary.complianceLogs
  .map(
    (log) => `- ${log.log}: owner ${log.owner}. Source: ${log.currentSource} Metric use: ${log.metricUse} Proof: ${log.proofRoute}. Boundary: ${log.boundary}`
  )
  .join("\n")}

## Customer Proof Ladder
${summary.customerProofStages
  .map(
    (stage) => `- ${stage.stage}: buyer commitment ${stage.buyerCommitment}. Proof: ${stage.scrimedProof}. Revenue signal: ${stage.revenueSignal}. Next gate: ${stage.nextGate}`
  )
  .join("\n")}

## Board Cadence
${summary.boardCadence
  .map(
    (cadence) => `- ${cadence.cadence}: owner ${cadence.owner}. Signals: ${cadence.reviewedSignals.join(", ")}. Output: ${cadence.decisionOutput}`
  )
  .join("\n")}

## Known Boundaries And Workarounds
${summary.limitations
  .map(
    (limitation) => `- ${limitation.limitation}: ${limitation.impact} Workaround: ${limitation.workaround} Graduation gate: ${limitation.graduationGate}`
  )
  .join("\n")}

## Boundary
${summary.boundary}
`;
}
