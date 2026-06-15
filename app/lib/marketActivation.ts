export type MarketActivationStatus =
  | "ready-for-controlled-use"
  | "approval-required"
  | "external-review-required";

export type RevenueStream = {
  name: string;
  status: MarketActivationStatus;
  buyer: string;
  offer: string;
  priceSignal: string;
  conversionPath: string;
  proofRoute: string;
  owner: string;
  guardrails: string[];
};

export type TargetAudience = {
  segment: string;
  priority: "primary" | "secondary" | "strategic";
  buyerTrigger: string;
  pain: string;
  primaryOffer: string;
  message: string;
  proofRoutes: string[];
  disqualifiers: string[];
};

export type MessageHouse = {
  coreMessage: string;
  positioning: string;
  approvedProofPoints: string[];
  toneRules: string[];
  prohibitedClaims: string[];
};

export type CommunicationsPlaybook = {
  channel: string;
  status: MarketActivationStatus;
  audience: string;
  message: string;
  proofAsset: string;
  approvalGate: string;
};

export type AdvertisingCampaign = {
  channel: string;
  status: MarketActivationStatus;
  targetAudience: string;
  objective: string;
  landingRoute: string;
  budgetPosture: string;
  conversionEvent: string;
  claimControl: string;
  blockedClaims: string[];
};

export type FaithCoreMarketProgram = {
  name: string;
  status: MarketActivationStatus;
  audience: string;
  message: string;
  useCase: string;
  revenueUse: string;
  route: string;
  boundaries: string[];
};

export const marketActivationBoundary =
  "SCRIMED market activation governs revenue, messaging, public relations, communications, advertising, and target-audience strategy for synthetic evaluations, readiness assessments, and protected pilots. It does not authorize medical claims, compliance certification claims, live clinical execution, payer submission, or patient outreach.";

export const revenueStreams: RevenueStream[] = [
  {
    name: "Workflow Intelligence Assessment",
    status: "ready-for-controlled-use",
    buyer: "Hospitals, clinics, payers, and healthcare transformation leaders with visible operational friction.",
    offer: "Fixed-fee workflow mapping, AI readiness, governance review, and executive decision packet.",
    priceSignal: "$50k floor; typical $75k-$150k.",
    conversionPath: "Official website -> Product Console -> Pilot Intake -> Sales Operations -> assessment invitation.",
    proofRoute: "/pricing",
    owner: "Enterprise sales",
    guardrails: [
      "Do not request PHI.",
      "Do not promise savings.",
      "Frame findings as operational intelligence for human leaders."
    ]
  },
  {
    name: "Synthetic Pilot Evaluation",
    status: "ready-for-controlled-use",
    buyer: "Enterprise teams ready to test SCRIMED against synthetic workflows before integration.",
    offer: "45-90 day governed synthetic pilot with AgentOS, Atlas Trust Cards, proof packets, and observability.",
    priceSignal: "$150k floor; typical $200k-$500k.",
    conversionPath: "Demo Center -> Pilot Program -> no-PHI intake -> governance pack -> protected workspace planning.",
    proofRoute: "/pilots",
    owner: "Sales engineering and delivery",
    guardrails: [
      "Synthetic data only.",
      "No diagnosis, treatment, payer submission, or patient outreach.",
      "Pilot metrics are directional business evidence."
    ]
  },
  {
    name: "Protected Enterprise Pilot",
    status: "approval-required",
    buyer: "Large health systems, payers, employers, and public-sector programs preparing controlled deployment.",
    offer: "Tenant-authenticated workspace, durable audit, activation governance, role-based review, and deployment profile planning.",
    priceSignal: "$750k floor; typical $1M-$2.5M.",
    conversionPath: "Synthetic pilot proof -> security/legal/privacy review -> protected workspace -> enterprise license proposal.",
    proofRoute: "/pilot-workspace",
    owner: "Enterprise sales, security, privacy, and implementation",
    guardrails: [
      "Requires legal, privacy, security, and governance review.",
      "Live PHI requires written approval and appropriate agreements.",
      "Human review remains required."
    ]
  },
  {
    name: "Annual Healthcare Intelligence OS License",
    status: "approval-required",
    buyer: "Multi-site organizations expanding from one workflow to operating-layer adoption.",
    offer: "Annual platform access for AgentOS, Atlas, TrustOS, workflow modules, governance, observability, and support.",
    priceSignal: "$2.5M floor; enterprise range $3M-$12M+.",
    conversionPath: "Protected pilot -> value review -> deployment profile -> annual license -> expansion roadmap.",
    proofRoute: "/product",
    owner: "Executive enterprise sales",
    guardrails: [
      "Separate platform license from implementation services.",
      "Scope workflows, connectors, and support explicitly.",
      "Do not imply unrestricted production permissions."
    ]
  },
  {
    name: "Strategic Platform Partnership",
    status: "external-review-required",
    buyer: "Governments, national programs, major payers, and strategic healthcare networks.",
    offer: "Multi-year healthcare intelligence infrastructure partnership with regional governance and deployment planning.",
    priceSignal: "$10M+ multi-year; national or ecosystem programs $25M+.",
    conversionPath: "Executive briefing -> sovereign/public-sector profile -> legal/procurement review -> strategic program.",
    proofRoute: "/deployment-profiles",
    owner: "Founder and strategic partnerships",
    guardrails: [
      "No government approval claim.",
      "Jurisdiction-specific legal and data-residency review required.",
      "Public-sector claims must be reviewed before publication."
    ]
  }
];

export const targetAudiences: TargetAudience[] = [
  {
    segment: "Health system operations executives",
    priority: "primary",
    buyerTrigger: "Referral leakage, access delays, documentation burden, capacity strain, and fragmented work queues.",
    pain: "Operational teams lack decision-grade visibility across workflows before bottlenecks become expensive.",
    primaryOffer: "Workflow Intelligence Assessment",
    message:
      "SCRIMED transforms fragmented operational workflows into governed, human-reviewed intelligence that leaders can act on.",
    proofRoutes: ["/product", "/demos", "/pilot-evidence"],
    disqualifiers: ["Buyer wants autonomous clinical decisions", "Buyer requires live PHI in public intake"]
  },
  {
    segment: "Payer and revenue cycle leaders",
    priority: "primary",
    buyerTrigger: "Denials, prior authorization friction, documentation gaps, and revenue leakage.",
    pain: "Administrative teams lose time and revenue when policy evidence and workflow risk are hard to see.",
    primaryOffer: "Synthetic Pilot Evaluation",
    message:
      "SCRIMED helps revenue and payer teams surface denial-risk, missing evidence, and policy friction through governed synthetic workflows.",
    proofRoutes: ["/agents/revenue-cycle-agent", "/workflows/results", "/pricing"],
    disqualifiers: ["Buyer expects reimbursement guarantees", "Buyer wants payer submission automation before approval"]
  },
  {
    segment: "Security, privacy, legal, and governance buyers",
    priority: "primary",
    buyerTrigger: "AI adoption pressure, shadow AI risk, vendor diligence, BAA/DPA planning, and audit requirements.",
    pain: "Healthcare organizations need AI controls they can inspect before data exposure.",
    primaryOffer: "AI Readiness + Governance Audit",
    message:
      "SCRIMED gives healthcare AI buyers an inspectable trust layer with claims controls, audit trails, role boundaries, and activation governance.",
    proofRoutes: ["/trust-center", "/claims", "/governance-packs"],
    disqualifiers: ["Buyer asks for compliance certification without audit", "Buyer refuses human-review boundaries"]
  },
  {
    segment: "Government and public-sector healthcare leaders",
    priority: "strategic",
    buyerTrigger: "National access, population health, sovereign data, workforce constraints, and digital transformation mandates.",
    pain: "Public systems need healthcare intelligence infrastructure that can be regionally governed and trusted.",
    primaryOffer: "Strategic Platform Partnership",
    message:
      "SCRIMED is building a healthcare intelligence infrastructure layer that can be evaluated with synthetic evidence before sovereign deployment decisions.",
    proofRoutes: ["/deployment-profiles", "/strategic-intelligence", "/governance-packs"],
    disqualifiers: ["Buyer needs immediate public health reporting", "Buyer requires jurisdictional approval before scoping"]
  },
  {
    segment: "Faith-aligned care, community, and patient-experience leaders",
    priority: "secondary",
    buyerTrigger: "Desire for dignity, trust, encouragement, spiritual support, and culturally sensitive patient experience.",
    pain: "Faith-aligned support is often disconnected from clinical safety, consent, and professional boundaries.",
    primaryOffer: "FaithCore Trust And Encouragement Layer",
    message:
      "FaithCore provides opt-in spiritual encouragement and dignity-centered trust support while keeping clinical judgment and emergency care with qualified professionals.",
    proofRoutes: ["/faithcore", "/operating-context", "/trust-center"],
    disqualifiers: ["Buyer wants spiritual guidance to replace clinical care", "Buyer does not accept opt-in consent boundaries"]
  }
];

export const messageHouse: MessageHouse = {
  coreMessage:
    "SCRIMED is the governed healthcare intelligence operating layer that turns fragmented workflows into evidence-backed, human-reviewed operational intelligence.",
  positioning:
    "Not a chatbot, not an ambient scribe alone, and not a consulting wrapper. SCRIMED is an AI-native healthcare infrastructure platform for workflows, agents, interoperability, trust, and proof.",
  approvedProofPoints: [
    "Governed synthetic pilots and enterprise evaluations are available now.",
    "AgentOS, Atlas, TrustOS, protected workspaces, proof packets, and governance packs are inspectable in the product.",
    "SCRIMED maintains clear boundaries: synthetic-only public flows, human review, no autonomous diagnosis, no payer submission, and no live clinical execution without approvals.",
    "Revenue value is measured through time saved, workflow friction reduced, documentation quality, denial-risk signals, access bottlenecks, and trust completeness."
  ],
  toneRules: [
    "Use confident enterprise language without hype.",
    "Lead with trust, outcomes, interoperability, and operational intelligence.",
    "Use FaithCore only as opt-in dignity, encouragement, and trust support.",
    "Separate vision from current capability."
  ],
  prohibitedClaims: [
    "HIPAA certified",
    "SOC 2 certified",
    "FDA cleared",
    "guaranteed revenue",
    "guaranteed reimbursement",
    "autonomous diagnosis",
    "treats patients",
    "government approved"
  ]
};

export const communicationsPlaybook: CommunicationsPlaybook[] = [
  {
    channel: "Official website",
    status: "ready-for-controlled-use",
    audience: "Executives, buyers, advisors, investors, and partners.",
    message: messageHouse.coreMessage,
    proofAsset: "/product",
    approvalGate: "Claims must match the public claims register before publishing."
  },
  {
    channel: "Founder and investor narrative",
    status: "ready-for-controlled-use",
    audience: "Investors, advisors, strategic partners, and enterprise champions.",
    message:
      "SCRIMED is building the trusted healthcare intelligence infrastructure layer for global healthcare workflows.",
    proofAsset: "/strategic-intelligence",
    approvalGate: "Vision statements must remain separate from current sellable pilot capability."
  },
  {
    channel: "Public relations",
    status: "approval-required",
    audience: "Healthcare business media, innovation leaders, community stakeholders, and ecosystem partners.",
    message:
      "SCRIMED is advancing governed AI for healthcare operations through synthetic pilots, trust controls, and interoperability-first product design.",
    proofAsset: "/trust-center",
    approvalGate: "Legal, privacy, brand, and claims-control review before distribution."
  },
  {
    channel: "Enterprise sales outreach",
    status: "ready-for-controlled-use",
    audience: "Named healthcare executives and workflow owners.",
    message:
      "SCRIMED can run a governed synthetic evaluation of high-friction workflows before live data, production connectors, or clinical execution are considered.",
    proofAsset: "/pilot",
    approvalGate: "No PHI requests, no guarantees, and no compliance certification claims."
  },
  {
    channel: "Incident, trust, and public response",
    status: "approval-required",
    audience: "Customers, public stakeholders, regulators, and partners where applicable.",
    message:
      "SCRIMED communicates boundaries, evidence, impact, and corrective actions through a documented trust and governance process.",
    proofAsset: "/claims",
    approvalGate: "Security, privacy, legal, and communications approval required."
  }
];

export const advertisingCampaigns: AdvertisingCampaign[] = [
  {
    channel: "LinkedIn executive demand generation",
    status: "approval-required",
    targetAudience: "Health system operations, payer operations, revenue cycle, AI governance, and healthcare transformation executives.",
    objective: "Drive qualified enterprise pilot intake and assessment calls.",
    landingRoute: "/pilot",
    budgetPosture: "Start with controlled small-budget tests after abuse monitoring and claim review.",
    conversionEvent: "No-PHI pilot intake with boundary acknowledgement.",
    claimControl: "Use approved pilot, workflow, trust, and interoperability claims only.",
    blockedClaims: ["clinical outcome guarantees", "HIPAA certified", "reimbursement guaranteed"]
  },
  {
    channel: "Search advertising",
    status: "approval-required",
    targetAudience: "Buyers searching for healthcare AI governance, workflow automation, prior authorization AI, RCM AI, and interoperability readiness.",
    objective: "Capture high-intent buyer research and route to Product Console or Pilot Intake.",
    landingRoute: "/product",
    budgetPosture: "Delay scale until intake abuse controls, CRM routing, and campaign review are active.",
    conversionEvent: "Product console engagement or pilot intake.",
    claimControl: "Avoid disease, treatment, diagnosis, and guaranteed savings language.",
    blockedClaims: ["diagnosis automation", "patient treatment", "guaranteed ROI"]
  },
  {
    channel: "FaithCore community awareness",
    status: "approval-required",
    targetAudience: "Faith-aligned health leaders, patient-experience teams, community health organizations, and chaplaincy-adjacent stakeholders.",
    objective: "Position FaithCore as opt-in dignity and encouragement support with clear clinical boundaries.",
    landingRoute: "/faithcore",
    budgetPosture: "Use careful organic and partner-led education before paid campaigns.",
    conversionEvent: "FaithCore discovery call or enterprise trust assessment.",
    claimControl: "Spiritual encouragement only; no medical, mental health, emergency, or pastoral authority claims.",
    blockedClaims: ["replaces clinician", "replaces chaplain", "heals", "emergency support"]
  }
];

export const faithCoreMarketPrograms: FaithCoreMarketProgram[] = [
  {
    name: "FaithCore Trust And Encouragement Layer",
    status: "ready-for-controlled-use",
    audience: "Opt-in patients, communities, and care teams that value spiritually aligned support.",
    message:
      "FaithCore supports dignity, hope, and trust while keeping clinical care, consent, and emergency decisions with qualified professionals.",
    useCase: "Patient-experience, community trust, culturally sensitive support, and whole-person encouragement.",
    revenueUse: "Add-on to patient-experience, community health, and faith-aligned enterprise pilots after governance review.",
    route: "/faithcore",
    boundaries: [
      "Opt-in only",
      "No diagnosis or treatment",
      "No emergency guidance",
      "No replacement for clinicians, chaplains, counselors, or professional care",
      "Culturally sensitive and faith-aware, not coercive"
    ]
  },
  {
    name: "FaithCore Staff Resilience And Mission Alignment",
    status: "approval-required",
    audience: "Care teams and organizations seeking values-aligned reflection and encouragement.",
    message:
      "FaithCore can support values-based reflection and staff encouragement without becoming HR, clinical, or pastoral authority.",
    useCase: "Staff resilience pilots, mission-centered reflection, and ethical culture support.",
    revenueUse: "Enterprise add-on for organizations that explicitly opt into FaithCore programming.",
    route: "/faithcore",
    boundaries: [
      "No employment advice",
      "No mental health treatment",
      "No coercive faith participation",
      "Human leadership and professional support remain accountable"
    ]
  }
];

export function getMarketActivationSummary() {
  return {
    service: "scrimed-market-activation",
    status: "revenue-message-comms-foundation-ready",
    route: "/market-activation",
    apiRoute: "/api/market-activation",
    boundary: marketActivationBoundary,
    revenueStreamCount: revenueStreams.length,
    targetAudienceCount: targetAudiences.length,
    communicationsChannelCount: communicationsPlaybook.length,
    advertisingCampaignCount: advertisingCampaigns.length,
    faithCoreProgramCount: faithCoreMarketPrograms.length,
    revenueStreams,
    targetAudiences,
    messageHouse,
    communicationsPlaybook,
    advertisingCampaigns,
    faithCoreMarketPrograms,
    nextBuildStep:
      "Use the Sales Attribution layer to convert approved campaigns into CRM-safe source tracking, then build cohort-level reporting across source, audience, deployment profile, and follow-up outcome.",
    updated: "2026-06-15"
  };
}

export function buildMarketActivationBrief() {
  const summary = getMarketActivationSummary();

  return [
    "# SCRIMED Market Activation Brief",
    "",
    `Status: ${summary.status}`,
    `Boundary: ${summary.boundary}`,
    "",
    "## Core Message",
    summary.messageHouse.coreMessage,
    "",
    "## Revenue Streams",
    ...summary.revenueStreams.map(
      (stream) => `- ${stream.name} (${stream.status}): ${stream.priceSignal} -> ${stream.conversionPath}`
    ),
    "",
    "## Target Audiences",
    ...summary.targetAudiences.map(
      (audience) => `- ${audience.segment} (${audience.priority}): ${audience.message}`
    ),
    "",
    "## FaithCore",
    ...summary.faithCoreMarketPrograms.map(
      (program) => `- ${program.name}: ${program.message} Boundaries: ${program.boundaries.join(", ")}.`
    ),
    "",
    "## Advertising Controls",
    ...summary.advertisingCampaigns.map(
      (campaign) => `- ${campaign.channel} (${campaign.status}): ${campaign.claimControl}`
    ),
    "",
    "## Next Build Step",
    summary.nextBuildStep
  ].join("\n");
}
