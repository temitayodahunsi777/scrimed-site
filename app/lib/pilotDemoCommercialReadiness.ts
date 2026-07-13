import {
  getDemoPilotProgramSummary,
  getPilotProgramBySlug,
  getProductDemoBySlug,
  pilotPrograms,
  productDemos
} from "./demoPilotPrograms";
import { getCommercialStrategySummary } from "./commercialStrategy";
import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";

export type PilotDemoAcceleratorStatus =
  | "active"
  | "human-review-required"
  | "external-review-required"
  | "blocked-before-approval";

export type PilotDemoMarketBenchmark = {
  competitor: string;
  segment: string;
  publicPricingSignal: string;
  observedCapability: string;
  sourceUrl: string;
  scrimedPricingImplication: string;
};

export type PilotDemoConversionStep = {
  step: string;
  buyerAction: string;
  scrimedAction: string;
  proofRoute: string;
  pricingSignal: string;
  retainedBoundary: string;
};

export type PilotDemoOfferPath = {
  slug: string;
  name: string;
  demoRoute: string;
  recommendedPilotSlug: string;
  recommendedPilotName: string;
  recommendedPilotRoute: string;
  recommendedOffer: string;
  pricingBand: string;
  buyerFit: string;
  fastPathCta: string;
  proofAssets: string[];
  objectionHandling: string[];
  retainedBoundary: string;
};

export type PilotDemoPricingTierAlignment = {
  tier: string;
  oldRisk: string;
  recommendedBand: string;
  marketRationale: string;
  marginRule: string;
  buyerFriendlyPositioning: string;
};

export type PilotDemoBuyerConversionPacket = {
  id: string;
  demoSlug: string;
  demoName: string;
  recommendedPilotSlug: string;
  recommendedPilotName: string;
  buyerSegment: string;
  sponsorRole: string;
  workflowOwnerRole: string;
  reviewCadence: string;
  decisionWindow: string;
  proofBundle: string[];
  acceptanceCriteria: string[];
  noPhiIntakeFields: string[];
  paidDiligenceTriggers: string[];
  disqualifiers: string[];
  pricingGuardrail: string;
  minimumPaidStep: string;
  closePlan: string;
  retainedBoundary: string;
  humanReviewRequired: true;
  syntheticOnly: true;
  auditHash: string;
};

export const pilotDemoCommercialReadinessRoute = "/pilot-demo-commercial-readiness";
export const pilotDemoCommercialReadinessApiRoute = "/api/pilot-demo-commercial-readiness";
export const pilotDemoCommercialReadinessBriefRoute = "/api/pilot-demo-commercial-readiness/brief";
export const pilotDemoCommercialReadinessStatus =
  "pilot-demo-commercial-accelerator-active";
export const pilotDemoCommercialReadinessBriefStatus =
  "pilot-demo-commercial-brief-ready-no-guarantee";
export const pilotDemoCommercialReadinessUpdatedAt = "2026-06-26";

export const pilotDemoCommercialReadinessBoundary =
  "SCRIMED Pilot Demo Commercial Readiness turns demos, pilot programs, pricing tiers, market benchmarks, proof routes, onboarding steps, and margin controls into a seamless no-PHI buyer path. It is commercial readiness and pricing guidance only. It does not create a signed quote, contract, legal advice, accounting advice, tax advice, audited financial reporting, securities material, investment advice, valuation assurance, revenue guarantee, profit guarantee, ROI guarantee, reimbursement guarantee, customer permission, procurement approval, security certification, PHI processing authority, production connector approval, EHR writeback approval, payer submission approval, or live clinical care authorization.";

export const pilotDemoMarketBenchmarks: PilotDemoMarketBenchmark[] = [
  {
    competitor: "Freed",
    segment: "Clinician AI scribe",
    publicPricingSignal:
      "Individual clinician plans publicly start at $39/month, Core is $79/month, Premier is $104/month, and Groups are custom.",
    observedCapability:
      "Consumer-like individual clinician entry with EHR push, coding support, group SSO, admin dashboards, and account management in higher tiers.",
    sourceUrl: "https://www.getfreed.ai/pricing",
    scrimedPricingImplication:
      "Do not price SCRIMED like a single-seat scribe; use those prices as a floor for narrow clinician utility and keep SCRIMED positioned around enterprise governance, workflow proof, interoperability, and buyer diligence."
  },
  {
    competitor: "Tali",
    segment: "AI scribe and clinical assistant",
    publicPricingSignal:
      "Free tier, paid clinician tiers around CA $50 to CA $150/month, and enterprise custom pricing for multi-clinician organizations.",
    observedCapability:
      "Usage-limited free entry, individual subscription upgrade, EHR assistant, analytics, onboarding, training, and response commitments in enterprise.",
    sourceUrl: "https://tali.ai/pricing",
    scrimedPricingImplication:
      "Keep public demos free and frictionless, but route organization-level proof, analytics, custom packets, governance, and onboarding into paid assessment or pilot scope."
  },
  {
    competitor: "Heidi Health",
    segment: "AI scribe, evidence, and enterprise practice plans",
    publicPricingSignal:
      "Public plan architecture includes Free, Evidence Plus, Clinician, and Practice plans with team, EHR integration, SSO, service availability, and custom hosting features in higher tiers.",
    observedCapability:
      "Shows market expectation for free trial, self-serve entry, clinician workflow depth, and enterprise controls.",
    sourceUrl: "https://www.heidihealth.com/pricing",
    scrimedPricingImplication:
      "SCRIMED should preserve a free public product preview while making enterprise controls, evidence rooms, and protected work explicitly sales-led."
  },
  {
    competitor: "Suki",
    segment: "End-to-end AI assistant for clinicians",
    publicPricingSignal:
      "Enterprise-oriented pricing is sales-led; public product copy spans pre-visit, encounter, post-visit, EHR delivery, order staging, coding, and multilingual instructions.",
    observedCapability:
      "The market is moving from note generation into broad clinical workflow assistance and EHR-adjacent execution.",
    sourceUrl: "https://www.suki.ai/clinicians/",
    scrimedPricingImplication:
      "SCRIMED should price pilots by workflow family, governance burden, proof depth, and connector/readiness complexity rather than by seat alone."
  },
  {
    competitor: "Ambience Healthcare",
    segment: "Enterprise documentation, coding, and revenue integrity platform",
    publicPricingSignal:
      "Sales-led enterprise motion with published outcome claims around utilization, charting time, coding, EHR integration, and revenue integrity.",
    observedCapability:
      "Enterprise buyers expect specialty coverage, deep EHR integration, coding/revenue integrity, measurable ROI evidence, and compliance posture.",
    sourceUrl: "https://www.ambiencehealthcare.com/",
    scrimedPricingImplication:
      "SCRIMED can command enterprise pricing only when claims stay evidence-backed, buyer-permitted, and scoped to no-PHI pilots until clinical production gates are complete."
  },
  {
    competitor: "Redox",
    segment: "Healthcare data integration infrastructure",
    publicPricingSignal:
      "Custom pricing for healthcare integration needs, with scale signals around transactions, connected organizations, uptime, EHR connections, HITRUST, and SOC 2.",
    observedCapability:
      "Integration infrastructure is sold through custom enterprise pricing because security, reliability, partner access, and implementation scope drive cost.",
    sourceUrl: "https://redoxengine.com/",
    scrimedPricingImplication:
      "Keep SCRIMED connector, data exchange, and production integration work out of standard pilot fees until separately reviewed and priced."
  },
  {
    competitor: "Berta open-source scribe deployment",
    segment: "Health-system-owned AI documentation infrastructure",
    publicPricingSignal:
      "The 2026 arXiv paper reports commercial AI scribes at $99-$600 per physician per month and an internal operating-cost benchmark below $30 per physician per month.",
    observedCapability:
      "Health systems can compare vendor cost, data sovereignty, workflow control, and internal infrastructure economics.",
    sourceUrl: "https://arxiv.org/abs/2603.23513",
    scrimedPricingImplication:
      "SCRIMED must defend price through enterprise operating value: proof, governance, workflow redesign, interoperability readiness, safety controls, and margin-transparent implementation."
  }
];

export const pilotDemoConversionSteps: PilotDemoConversionStep[] = [
  {
    step: "Choose the buyer problem",
    buyerAction: "Select the closest demo from access, documentation, research, interoperability, or AgentOS governance.",
    scrimedAction: "Route the buyer to a single demo path with proof assets, success questions, and blocked claims.",
    proofRoute: "/demos",
    pricingSignal: "Free public preview; no custom work starts here.",
    retainedBoundary: "No PHI, patient identifiers, production credentials, or customer claims."
  },
  {
    step: "Run the proof path",
    buyerAction: "Inspect the executable surface, result route, and downloadable demo brief.",
    scrimedAction: "Keep proof one click away and convert questions into a recommended package.",
    proofRoute: "/pilot-demo-commercial-readiness",
    pricingSignal: "Guided demo is free for qualified buyers; custom demo prep becomes paid diligence.",
    retainedBoundary: "Demo proof is synthetic and does not show clinical validation or production authorization."
  },
  {
    step: "Match the pilot package",
    buyerAction: "Pick a 30-day sprint, 45-90 day synthetic pilot, or protected enterprise planning path.",
    scrimedAction: "Attach recommended price band, scope cap, owner map, and buyer inputs before intake.",
    proofRoute: "/pilots",
    pricingSignal: "Package price band is shown before custom SOW expansion.",
    retainedBoundary: "Final quote, SOW, payment terms, and buyer approval require human review."
  },
  {
    step: "Submit no-PHI intake",
    buyerAction: "Provide organization, sponsor, workflow, timeline, and governance context without patient data.",
    scrimedAction: "Convert intake into CRM-safe follow-up, onboarding stage, and service-delivery handoff.",
    proofRoute: "/pilot",
    pricingSignal: "No unpaid implementation or security questionnaire work before package selection.",
    retainedBoundary: "Intake is not contract approval, procurement approval, or PHI authorization."
  },
  {
    step: "Open buyer deal room",
    buyerAction: "Review proof packet needs, diligence lane, pricing posture, security questions, and next decision.",
    scrimedAction: "Route custom proof, release review, evidence-room work, and procurement support as paid scope.",
    proofRoute: "/pilot-deal-room",
    pricingSignal: "Paid diligence or activation retainer protects margin before enterprise proof work expands.",
    retainedBoundary: "No external distribution, customer permission, security certification, or production approval implied."
  },
  {
    step: "Kick off scoped delivery",
    buyerAction: "Approve package, owners, cadence, acceptance criteria, and boundaries.",
    scrimedAction: "Move into service delivery with artifacts, gates, hard stops, and escalation rules.",
    proofRoute: "/service-delivery",
    pricingSignal: "Implementation, connectors, support, and review retainers stay separate from license fees.",
    retainedBoundary: "Delivery work is not an SLA, live-care authorization, or production connector approval."
  }
];

export const pilotDemoPricingTierAlignments: PilotDemoPricingTierAlignment[] = [
  {
    tier: "Public Product Preview",
    oldRisk: "Free preview could look like a full product trial if the next action is unclear.",
    recommendedBand: "Free, self-guided, no-PHI, no account required; qualified guided demo stays no-cost when it is standard.",
    marketRationale:
      "Freed, Tali, and Heidi show that healthcare AI buyers expect a low-friction entry path before enterprise review.",
    marginRule:
      "Keep standard demo labor capped; move custom demo prep, questionnaires, and buyer-specific proof packets into paid diligence.",
    buyerFriendlyPositioning:
      "Use public demos to reduce buyer uncertainty, then ask for paid scope only when SCRIMED starts doing buyer-specific work."
  },
  {
    tier: "Workflow Intelligence Assessment",
    oldRisk: "Too-low sprint pricing can underprice founder/product time and create bespoke consulting drag.",
    recommendedBand: "$25k-$75k standard; $12.5k-$25k mission clinic access path for one no-PHI workflow; $75k-$150k for multi-workflow enterprise assessment.",
    marketRationale:
      "Individual scribe subscriptions are cheap, but enterprise assessment value sits in workflow redesign, governance, interoperability, and executive decision support.",
    marginRule:
      "Cap workflows, meetings, artifacts, and review cycles; discount only by reducing scope.",
    buyerFriendlyPositioning:
      "A fast, finite way to decide whether a full pilot is worth funding."
  },
  {
    tier: "Synthetic Pilot Evaluation",
    oldRisk: "Old ranges diverged across pricing and pilot pages, confusing buyers and weakening deal discipline.",
    recommendedBand: "$125k-$350k standard for 45-90 days; $350k-$500k when multiple workflows, extra diligence, or executive proof packets are included.",
    marketRationale:
      "Enterprise AI workflow pilots should sit well above seat-based scribe tools while staying below production integration commitments.",
    marginRule:
      "Limit workflow count and evidence cadence; separately price custom data modeling, legal/security packet labor, and implementation planning.",
    buyerFriendlyPositioning:
      "A decision-grade enterprise evaluation before the buyer funds protected production work."
  },
  {
    tier: "Protected Enterprise Pilot",
    oldRisk: "Low protected-pilot ranges can ignore security, privacy, evidence-room, tenant, connector, and support costs.",
    recommendedBand: "$400k-$1.25M for 90-180 days; $1.25M-$2M+ when buyer-specific protected diligence, sandbox planning, or multi-site scope expands.",
    marketRationale:
      "Redox and enterprise AI vendors use custom pricing because integration, security, governance, reliability, and implementation scope drive cost.",
    marginRule:
      "Separate license, services, support, connectors, evidence-room labor, customer success, and change orders.",
    buyerFriendlyPositioning:
      "A controlled enterprise activation path that prepares production without pretending production is already approved."
  },
  {
    tier: "Enterprise Operating License",
    oldRisk: "A single giant range can feel arbitrary before pilots prove value.",
    recommendedBand: "$1.5M-$6M annual for initial enterprise operating layer; $6M-$12M+ for multi-department or multi-region expansion.",
    marketRationale:
      "Ambience, Suki, Redox, and similar enterprise motions compete on workflow breadth, EHR adjacency, trust, uptime, data exchange, and measurable operational outcomes.",
    marginRule:
      "Annual license is separate from implementation services, model usage, support tier, connector work, and continuous review retainer.",
    buyerFriendlyPositioning:
      "Start with validated workflows, then expand as evidence, authority, and operational coverage mature."
  },
  {
    tier: "Strategic Platform Partnership",
    oldRisk: "Strategic pricing can overpromise national or global deployment before regional authority exists.",
    recommendedBand: "$8M-$25M+ multi-year, sales-led, region-aware, and external-review-gated.",
    marketRationale:
      "National, payer, sovereign, and platform partnerships are not scribe subscriptions; they are multi-stakeholder infrastructure and governance programs.",
    marginRule:
      "Regional legal, tax, hosting, support, partner economics, and certification work require separate review.",
    buyerFriendlyPositioning:
      "Strategic partnership follows proven pilot evidence and clear authority boundaries."
  }
];

export const demoOfferPaths: PilotDemoOfferPath[] = [
  {
    slug: "carepath-access-operations",
    name: "CarePath Access Operations Demo",
    demoRoute: "/demos/carepath-access-operations",
    recommendedPilotSlug: "60-day-governed-automation-pilot",
    recommendedPilotName: "60-Day Governed Automation Pilot",
    recommendedPilotRoute: "/pilots/60-day-governed-automation-pilot",
    recommendedOffer: "Synthetic Pilot Evaluation",
    pricingBand: "$125k-$350k for 45-90 days after sponsor and workflow owner are confirmed.",
    buyerFit: "Access, care navigation, discharge, population health, and throughput leaders.",
    fastPathCta: "/pilot?offer=synthetic-pilot-evaluation&demo=carepath-access-operations",
    proofAssets: [
      "/workflows/results/carepath-high-risk-followup-routing",
      "/modules/carepath-ai",
      "/synthetic/validation",
      "/service-delivery"
    ],
    objectionHandling: [
      "This is not emergency triage or patient outreach.",
      "Pilot value is measured against routing friction, missing evidence, escalation clarity, and reviewer ownership.",
      "Live patient routing waits for clinical authority and customer production approval."
    ],
    retainedBoundary: "No autonomous outreach, diagnosis, treatment, emergency routing, PHI, or live workflow execution."
  },
  {
    slug: "docutwin-documentation-review",
    name: "DocuTwin Documentation Review Demo",
    demoRoute: "/demos/docutwin-documentation-review",
    recommendedPilotSlug: "60-day-governed-automation-pilot",
    recommendedPilotName: "60-Day Governed Automation Pilot",
    recommendedPilotRoute: "/pilots/60-day-governed-automation-pilot",
    recommendedOffer: "Synthetic Pilot Evaluation",
    pricingBand: "$125k-$350k standard; custom note-quality, source-trace, or specialty packet work priced separately.",
    buyerFit: "Clinical documentation, ambulatory operations, quality, and CMIO teams.",
    fastPathCta: "/pilot?offer=synthetic-pilot-evaluation&demo=docutwin-documentation-review",
    proofAssets: [
      "/workflows/results/docutwin-draft-note-review",
      "/modules/docutwin",
      "/evaluation",
      "/qa-claim-guard"
    ],
    objectionHandling: [
      "SCRIMED does not compete as a commodity monthly scribe seat.",
      "The value is governed draft review, source trace, missing context, and implementation readiness.",
      "Final note signature and EHR filing remain out of scope."
    ],
    retainedBoundary: "No final note, EHR filing, diagnosis insertion, autonomous documentation, PHI, or clinical validation claim."
  },
  {
    slug: "trialcore-research-operations",
    name: "TrialCore Research Operations Demo",
    demoRoute: "/demos/trialcore-research-operations",
    recommendedPilotSlug: "60-day-governed-automation-pilot",
    recommendedPilotName: "60-Day Governed Automation Pilot",
    recommendedPilotRoute: "/pilots/60-day-governed-automation-pilot",
    recommendedOffer: "Synthetic Pilot Evaluation",
    pricingBand: "$125k-$350k standard; research-network or multi-study scope requires custom pricing.",
    buyerFit: "Research operations, oncology programs, academic medical centers, and trial networks.",
    fastPathCta: "/pilot?offer=synthetic-pilot-evaluation&demo=trialcore-research-operations",
    proofAssets: [
      "/workflows/results/trialcore-eligibility-review-queue",
      "/modules/trialcore",
      "/workflows/results/validation",
      "/clinical-production-readiness"
    ],
    objectionHandling: [
      "This is operational screening support, not enrollment approval.",
      "Pilot success is evidence-gap clarity, criteria trace, and review throughput.",
      "Patient outreach and enrollment require separate research governance and customer authority."
    ],
    retainedBoundary: "No patient outreach, enrollment decision, treatment recommendation, PHI, or production research-record mutation."
  },
  {
    slug: "atlas-interoperability-readiness",
    name: "Atlas Interoperability Readiness Demo",
    demoRoute: "/demos/atlas-interoperability-readiness",
    recommendedPilotSlug: "ai-governance-interoperability-readiness",
    recommendedPilotName: "AI Governance + Interoperability Readiness Pilot",
    recommendedPilotRoute: "/pilots/ai-governance-interoperability-readiness",
    recommendedOffer: "Interoperability Readiness Sprint",
    pricingBand: "$75k-$225k for readiness; production connector work requires separate reviewed scope.",
    buyerFit: "CIOs, integration leaders, EHR teams, health tech platforms, and security teams.",
    fastPathCta: "/pilot?offer=interoperability-readiness-sprint&demo=atlas-interoperability-readiness",
    proofAssets: [
      "/interoperability/evaluations",
      "/interoperability/evaluations/fhir-r4-us-core-intake",
      "/health-records",
      "/global-certification-readiness"
    ],
    objectionHandling: [
      "Redox-style integration economics prove connector work belongs in custom scope.",
      "The sprint produces standards-aware readiness, not partner acceptance.",
      "Live exchange, certification, and production endpoints remain gated."
    ],
    retainedBoundary: "No live healthcare data exchange, connector certification, trading-partner acceptance, or production mutation."
  },
  {
    slug: "agentos-governance-evaluation",
    name: "AgentOS Governance Evaluation Demo",
    demoRoute: "/demos/agentos-governance-evaluation",
    recommendedPilotSlug: "ai-governance-interoperability-readiness",
    recommendedPilotName: "AI Governance + Interoperability Readiness Pilot",
    recommendedPilotRoute: "/pilots/ai-governance-interoperability-readiness",
    recommendedOffer: "TrustOS AI Governance Audit",
    pricingBand: "$75k-$225k for governance and interoperability readiness; protected pilot scope starts above this.",
    buyerFit: "AI governance, compliance, innovation, clinical transformation, and executive leaders.",
    fastPathCta: "/pilot?offer=trustos-ai-governance-audit&demo=agentos-governance-evaluation",
    proofAssets: ["/agents", "/audit", "/trust", "/continuous-review-audit"],
    objectionHandling: [
      "The demo proves governance structure, not autonomous live AI authority.",
      "AI asset inventory, claims review, and approval gates are sellable now.",
      "Production AI authorization waits for the clinical production readiness ledger."
    ],
    retainedBoundary: "No live PHI ingestion, autonomous clinical execution, production connector access, or payer/patient action."
  }
];

export const pilotDemoHardStops = [
  "Do not accept PHI, patient identifiers, payer member identifiers, production credentials, secrets, or live records in demo or pilot intake.",
  "Do not quote custom SOWs, implementation work, connector work, security questionnaire labor, or evidence-room release without package selection and human deal review.",
  "Do not benchmark SCRIMED against low monthly AI-scribe seats as if SCRIMED were only documentation automation.",
  "Do not imply guaranteed ROI, revenue lift, reimbursement, clinical outcome improvement, customer permission, certification, production readiness, or legal approval.",
  "Do not open protected workspace evidence externally without AAL2 controls, release decision, recipient rules, and customer permission path."
];

export const pilotDemoNextActions = [
  "Make /pilot-demo-commercial-readiness the internal and buyer-safe command page before demos or pilot calls.",
  "Start every buyer call with the closest demo path and end with one recommended package, price band, proof asset list, and no-PHI intake route.",
  "Use updated ranges as floors unless finance, legal, and founder review approve scope reduction.",
  "Route any custom proof, questionnaire, security review, or executive packet work into paid diligence or Enterprise Proof and Deal Room Activation.",
  "Keep enterprise license pricing separate from services, connectors, support, usage, and continuous review retainers."
];

const conversionPacketOverrides: Record<
  string,
  Pick<
    PilotDemoBuyerConversionPacket,
    | "sponsorRole"
    | "workflowOwnerRole"
    | "reviewCadence"
    | "decisionWindow"
    | "minimumPaidStep"
    | "acceptanceCriteria"
    | "paidDiligenceTriggers"
    | "disqualifiers"
    | "closePlan"
  >
> = {
  "carepath-access-operations": {
    sponsorRole: "VP Access, Chief Operating Officer, or Population Health leader",
    workflowOwnerRole: "Access operations manager or care coordination director",
    reviewCadence: "Weekly workflow review with synthetic queue metrics and escalation notes",
    decisionWindow: "Two buyer meetings after the no-PHI demo",
    minimumPaidStep: "Synthetic Pilot Evaluation",
    acceptanceCriteria: [
      "Buyer names a workflow owner and reviewer role.",
      "Synthetic queue or routing fixture is accepted as the pilot input boundary.",
      "Pilot success metrics include routing friction, escalation clarity, and documentation completeness.",
      "Patient outreach and emergency routing remain blocked."
    ],
    paidDiligenceTriggers: [
      "Buyer asks for site-specific workflow mapping.",
      "Buyer asks for executive proof packet or security questionnaire support.",
      "Buyer wants a multi-department access or discharge-safety scope."
    ],
    disqualifiers: [
      "Buyer wants live patient routing before clinical authority approval.",
      "Buyer requests patient outreach automation.",
      "Buyer cannot assign a workflow owner."
    ],
    closePlan: "Confirm one access workflow, sponsor, reviewer role, price band, and no-PHI intake before opening scoped pilot work."
  },
  "docutwin-documentation-review": {
    sponsorRole: "CMIO, documentation improvement leader, ambulatory operations leader, or quality executive",
    workflowOwnerRole: "Clinical documentation manager or physician champion",
    reviewCadence: "Weekly note-quality review with source-trace and missing-context findings",
    decisionWindow: "One demo review plus one packet-scoping call",
    minimumPaidStep: "Synthetic Pilot Evaluation",
    acceptanceCriteria: [
      "Buyer agrees final note signature and EHR filing remain out of scope.",
      "Synthetic note fixtures and source traces are accepted for the pilot.",
      "Pilot success metrics include missing context, reviewer time, and source attribution quality.",
      "Clinician review remains required for any clinical-facing output."
    ],
    paidDiligenceTriggers: [
      "Buyer asks for specialty-specific note packets.",
      "Buyer asks for custom scoring rubrics or executive summary packets.",
      "Buyer wants implementation readiness mapped to existing documentation workflows."
    ],
    disqualifiers: [
      "Buyer wants autonomous chart filing.",
      "Buyer wants live PHI note review before authorization.",
      "Buyer treats the demo as clinical validation."
    ],
    closePlan: "Convert the buyer to a governed documentation pilot with capped note fixtures, reviewer role, and source-trace acceptance criteria."
  },
  "trialcore-research-operations": {
    sponsorRole: "Research operations leader, oncology program leader, or clinical trials executive",
    workflowOwnerRole: "Trial operations manager or protocol-review lead",
    reviewCadence: "Weekly criteria-gap review with reviewer signoff and evidence trace",
    decisionWindow: "Two research-operations scoping sessions after demo review",
    minimumPaidStep: "Synthetic Pilot Evaluation",
    acceptanceCriteria: [
      "Buyer agrees SCRIMED supports review queue operations only.",
      "Synthetic eligibility and protocol fixtures are accepted.",
      "Pilot success metrics include criteria traceability, evidence gaps, and reviewer throughput.",
      "Enrollment decisions and outreach remain outside scope."
    ],
    paidDiligenceTriggers: [
      "Buyer asks for multi-study mapping.",
      "Buyer needs research-network or partner implementation scope.",
      "Buyer wants custom reviewer packets or protocol comparison."
    ],
    disqualifiers: [
      "Buyer wants enrollment approval automation.",
      "Buyer wants patient outreach or treatment routing.",
      "Buyer cannot name a research reviewer."
    ],
    closePlan: "Scope a research-operations pilot around criteria trace, reviewer queue, evidence gaps, and no-PHI fixtures."
  },
  "atlas-interoperability-readiness": {
    sponsorRole: "CIO, integration leader, digital health executive, or platform owner",
    workflowOwnerRole: "FHIR, HL7, or integration architecture lead",
    reviewCadence: "Biweekly standards-readiness review with proof routes and connector-boundary decisions",
    decisionWindow: "One technical scoping session after the demo",
    minimumPaidStep: "Interoperability Readiness Sprint",
    acceptanceCriteria: [
      "Buyer agrees readiness does not equal production connector approval.",
      "Synthetic FHIR/HL7/DICOM metadata fixtures are used.",
      "Pilot success metrics include mapping clarity, validation gaps, and writeback-denial evidence.",
      "Production endpoints and trading-partner acceptance remain blocked."
    ],
    paidDiligenceTriggers: [
      "Buyer asks for source-system mapping.",
      "Buyer requests implementation partner review.",
      "Buyer wants security, privacy, or data-residency packet support."
    ],
    disqualifiers: [
      "Buyer wants live exchange before connector approval.",
      "Buyer wants production endpoint testing in the readiness sprint.",
      "Buyer cannot provide a technical owner."
    ],
    closePlan: "Move to a standards-readiness sprint with one data-family target, proof route, owner, and connector-boundary memo."
  },
  "agentos-governance-evaluation": {
    sponsorRole: "Chief AI officer, compliance executive, innovation leader, or clinical transformation leader",
    workflowOwnerRole: "AI governance program owner or compliance reviewer",
    reviewCadence: "Weekly governance review with policy decisions, audit evidence, and blocked-action register",
    decisionWindow: "One governance demo plus one executive readiness review",
    minimumPaidStep: "TrustOS AI Governance Audit",
    acceptanceCriteria: [
      "Buyer agrees the output is governance readiness, not production AI authorization.",
      "Synthetic agent actions and policy decisions are used.",
      "Pilot success metrics include policy coverage, auditability, and human-review clarity.",
      "Autonomous clinical execution remains blocked."
    ],
    paidDiligenceTriggers: [
      "Buyer asks for AI inventory mapping.",
      "Buyer wants policy review, board packet, or executive risk register.",
      "Buyer needs implementation roadmap or governance operating model."
    ],
    disqualifiers: [
      "Buyer wants autonomous clinical agent approval.",
      "Buyer wants payer or EHR production action enabled.",
      "Buyer treats the audit as regulatory certification."
    ],
    closePlan: "Convert to a governance audit with inventory scope, policy stack, reviewer role, and no-production-authority boundary."
  }
};

function markdownItems(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function getDemoPathCoverage() {
  return demoOfferPaths.map((path) => ({
    ...path,
    demo: getProductDemoBySlug(path.slug),
    recommendedPilot: getPilotProgramBySlug(path.recommendedPilotSlug)
  }));
}

export function buildPilotDemoBuyerConversionPackets(): PilotDemoBuyerConversionPacket[] {
  return demoOfferPaths.map((path) => {
    const override = conversionPacketOverrides[path.slug];
    const proofBundle = Array.from(new Set([path.demoRoute, path.recommendedPilotRoute, ...path.proofAssets, "/scrimed-proof-packet-studio"]));
    const auditHash = generateScrimedAuditHash({
      id: `${path.slug}-buyer-conversion-packet`,
      demoSlug: path.slug,
      recommendedPilotSlug: path.recommendedPilotSlug,
      pricingBand: path.pricingBand,
      retainedBoundary: path.retainedBoundary,
      minimumPaidStep: override.minimumPaidStep
    });

    return {
      id: `${path.slug}-buyer-conversion-packet`,
      demoSlug: path.slug,
      demoName: path.name,
      recommendedPilotSlug: path.recommendedPilotSlug,
      recommendedPilotName: path.recommendedPilotName,
      buyerSegment: path.buyerFit,
      sponsorRole: override.sponsorRole,
      workflowOwnerRole: override.workflowOwnerRole,
      reviewCadence: override.reviewCadence,
      decisionWindow: override.decisionWindow,
      proofBundle,
      acceptanceCriteria: override.acceptanceCriteria,
      noPhiIntakeFields: [
        "organization name",
        "buyer sponsor role",
        "workflow owner role",
        "target workflow family",
        "desired timeline",
        "governance reviewer role",
        "non-PHI operating pain statement"
      ],
      paidDiligenceTriggers: override.paidDiligenceTriggers,
      disqualifiers: override.disqualifiers,
      pricingGuardrail: path.pricingBand,
      minimumPaidStep: override.minimumPaidStep,
      closePlan: override.closePlan,
      retainedBoundary: path.retainedBoundary,
      humanReviewRequired: true,
      syntheticOnly: true,
      auditHash
    };
  });
}

export function getPilotDemoCommercialReadinessSummary() {
  const demoPilotSummary = getDemoPilotProgramSummary();
  const commercialSummary = getCommercialStrategySummary();
  const coveredDemoSlugs = new Set(demoOfferPaths.map((path) => path.slug));
  const uncoveredDemos = productDemos.filter((demo) => !coveredDemoSlugs.has(demo.slug));
  const buyerConversionPackets = buildPilotDemoBuyerConversionPackets();
  const pilotPriceBands = pilotPrograms.map((pilot) => ({
    slug: pilot.slug,
    name: pilot.name,
    route: pilot.route,
    status: pilot.status,
    duration: pilot.duration,
    engagementModel: pilot.engagementModel,
    requestRoute: pilot.requestRoute
  }));
  const standardPathScore = Math.round(
    ((demoOfferPaths.length + pilotDemoConversionSteps.length + pilotDemoPricingTierAlignments.length) /
      (productDemos.length + 6 + 6)) *
      100
  );

  return {
    service: "scrimed-pilot-demo-commercial-readiness",
    route: pilotDemoCommercialReadinessRoute,
    apiRoute: pilotDemoCommercialReadinessApiRoute,
    briefRoute: pilotDemoCommercialReadinessBriefRoute,
    status: pilotDemoCommercialReadinessStatus,
    briefStatus: pilotDemoCommercialReadinessBriefStatus,
    boundary: pilotDemoCommercialReadinessBoundary,
    authority: {
      dataBoundary: "synthetic-business-and-metadata-only",
      clinicalCareAuthority: "not-authorized-live-care",
      phiAuthority: "not-authorized-production-phi",
      contractAuthority: "not-contract-approval",
      quoteAuthority: "not-binding-quote",
      procurementAuthority: "not-procurement-approval",
      revenueAuthority: "not-revenue-guarantee",
      profitAuthority: "not-profit-margin-guarantee",
      roiAuthority: "not-roi-guarantee",
      reimbursementAuthority: "no-reimbursement-guarantee",
      securityCertification: "not-security-certified",
      connectorAuthority: "not-production-connector-approved"
    },
    demoCount: demoPilotSummary.demoCount,
    pilotCount: demoPilotSummary.pilotCount,
    demoPathCount: demoOfferPaths.length,
    buyerConversionPacketCount: buyerConversionPackets.length,
    uncoveredDemoCount: uncoveredDemos.length,
    marketBenchmarkCount: pilotDemoMarketBenchmarks.length,
    conversionStepCount: pilotDemoConversionSteps.length,
    pricingAlignmentCount: pilotDemoPricingTierAlignments.length,
    hardStopCount: pilotDemoHardStops.length,
    nextActionCount: pilotDemoNextActions.length,
    standardPathScore,
    recommendedCommercialModel: commercialSummary.recommendedModel,
    recommendedMarketPosition:
      "SCRIMED should use free self-guided demos to compete with low-friction AI scribe entry, then price paid work as enterprise workflow intelligence, governance, interoperability readiness, proof packaging, and protected pilot infrastructure.",
    currentPricingDecision:
      "Keep public demos free, guided standard demos no-cost for qualified buyers, assessments at $25k-$150k depending on scope, synthetic pilots at $125k-$500k, protected pilots at $400k-$2M+, annual licenses at $1.5M-$12M+, and strategic partnerships at $8M-$25M+.",
    demoOfferPaths: getDemoPathCoverage(),
    buyerConversionPackets,
    pilotPriceBands,
    conversionSteps: pilotDemoConversionSteps,
    pricingTierAlignments: pilotDemoPricingTierAlignments,
    marketBenchmarks: pilotDemoMarketBenchmarks,
    hardStops: pilotDemoHardStops,
    nextActions: pilotDemoNextActions,
    sourceRoutes: [
      "/demos",
      "/pilots",
      "/pricing",
      "/offerings",
      "/service-delivery",
      "/client-onboarding",
      "/pilot-deal-room",
      "/scrimed-execution-focus",
      "/scrimed-proof-packet-studio",
      "/clinical-production-readiness"
    ],
    updated: pilotDemoCommercialReadinessUpdatedAt
  };
}

export function buildPilotDemoCommercialReadinessBrief() {
  const summary = getPilotDemoCommercialReadinessSummary();

  return [
    "# SCRIMED Pilot Demo Commercial Readiness Brief",
    "",
    `Status: ${summary.status}`,
    `Updated: ${summary.updated}`,
    `Demos: ${summary.demoCount}`,
    `Pilots: ${summary.pilotCount}`,
    `Demo offer paths: ${summary.demoPathCount}`,
    `Buyer conversion packets: ${summary.buyerConversionPacketCount}`,
    `Market benchmarks: ${summary.marketBenchmarkCount}`,
    `Pricing alignments: ${summary.pricingAlignmentCount}`,
    `Standard path score: ${summary.standardPathScore}%`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is not a signed quote, contract, legal advice, accounting advice, tax advice, audited financial reporting, securities material, investment advice, valuation assurance, revenue guarantee, profit guarantee, ROI guarantee, reimbursement guarantee, customer permission, procurement approval, security certification, PHI processing authority, production connector approval, EHR writeback approval, payer submission approval, or live clinical care authorization.",
    "",
    "## Recommended Market Position",
    summary.recommendedMarketPosition,
    "",
    "## Pricing Decision",
    summary.currentPricingDecision,
    "",
    "## Seamless Conversion Steps",
    ...summary.conversionSteps.map(
      (step, index) =>
        `${index + 1}. ${step.step}: buyer ${step.buyerAction} SCRIMED ${step.scrimedAction} Proof: ${step.proofRoute}. Pricing: ${step.pricingSignal}. Boundary: ${step.retainedBoundary}`
    ),
    "",
    "## Demo Offer Paths",
    ...summary.demoOfferPaths.map(
      (path) =>
        `- ${path.name}: recommend ${path.recommendedPilotName} (${path.pricingBand}). CTA: ${path.fastPathCta}. Boundary: ${path.retainedBoundary}`
    ),
    "",
    "## Buyer Conversion Packets",
    ...summary.buyerConversionPackets.map(
      (packet) =>
        `- ${packet.demoName}: sponsor=${packet.sponsorRole}; owner=${packet.workflowOwnerRole}; paid step=${packet.minimumPaidStep}; guardrail=${packet.pricingGuardrail}; close=${packet.closePlan}; audit=${packet.auditHash}`
    ),
    "",
    "## Pricing Tier Alignment",
    ...summary.pricingTierAlignments.map(
      (alignment) =>
        `- ${alignment.tier}: ${alignment.recommendedBand}. Rationale: ${alignment.marketRationale}. Margin rule: ${alignment.marginRule}`
    ),
    "",
    "## Market Benchmarks",
    ...summary.marketBenchmarks.map(
      (benchmark) =>
        `- ${benchmark.competitor} (${benchmark.segment}): ${benchmark.publicPricingSignal} Implication: ${benchmark.scrimedPricingImplication} Source: ${benchmark.sourceUrl}`
    ),
    "",
    "## Hard Stops",
    markdownItems(summary.hardStops),
    "",
    "## Next Actions",
    markdownItems(summary.nextActions)
  ].join("\n");
}
