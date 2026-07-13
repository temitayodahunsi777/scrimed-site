export type CompetitorCategory =
  | "ambient-clinical-intelligence"
  | "agent-workforce"
  | "data-and-ai-platform"
  | "imaging-ai"
  | "interoperability-network"
  | "platform-incumbent"
  | "revenue-cycle"
  | "payer-operations"
  | "safety-agent-platform"
  | "trust-and-security";

export type CompetitiveInitiativeStatus =
  | "implemented"
  | "package-next"
  | "protected-gated"
  | "external-review-required";

export type CompetitorMarketSource = {
  name: string;
  category: CompetitorCategory;
  url: string;
  observedPattern: string;
  scrimedTranslation: string;
  noCopyBoundary: string;
};

export type CompetitiveBuildPattern = {
  slug: string;
  title: string;
  priority: "now" | "next" | "platform";
  sourceNames: string[];
  marketSignal: string;
  productTranslation: string;
  buildImplementation: string;
  productSurfaces: string[];
  agents: string[];
  infrastructureMoves: string[];
  healthcareIntelligenceUpgrade: string;
  salesPitchUpgrade: string;
  proofMetrics: string[];
  governanceGates: string[];
  blockedClaims: string[];
  nextImplementation: string;
};

export type CompetitiveInitiative = {
  name: string;
  status: CompetitiveInitiativeStatus;
  owner: string;
  buyerSegment: string;
  productSurface: string;
  whyItImprovesScrimed: string;
  implementation: string;
  proofRoute: string;
  nextAction: string;
};

export type CompetitiveTargetAudienceStrategy = {
  slug: string;
  priority: "immediate" | "near-term" | "protected";
  targetAudience: string;
  buyerRole: string;
  competitorPressure: string[];
  primaryPain: string;
  scrimedCounterPosition: string;
  offerMotion: string;
  proofRoutes: string[];
  salesMessage: string;
  conversionTrigger: string;
  strategicFollowThrough: string;
  retainedBoundary: string;
  blockedClaims: string[];
};

export type CleanRoomCompetitivePlay = {
  slug: string;
  priority: "immediate" | "near-term" | "strategic";
  marketPattern: string;
  publicSources: string[];
  legalExtractionRule: string;
  prohibitedCopying: string[];
  scrimedOriginalImplementation: string;
  productSystemsToUpgrade: string[];
  revenueMotion: string;
  salesPitchUpgrade: string;
  investorConfidenceSignal: string;
  privacyAndTrustControl: string;
  proofMetric: string;
  nextBuildAction: string;
  retainedBoundary: string;
};

export type CompetitiveResearchSignal = {
  sourceName: string;
  sourceUrl: string;
  category: CompetitorCategory;
  currentPublicSignal: string;
  scrimedImplication: string;
  implementationStatus: "implemented" | "package-next" | "monitor";
  lastReviewed: string;
};

export const competitiveMarketIntelligenceBoundary =
  "SCRIMED Competitive Market Intelligence translates public competitor positioning, product packaging, API posture, healthcare intelligence themes, sales motions, target-audience needs, and trust patterns into original SCRIMED build priorities. It does not copy third-party code, proprietary workflows, private APIs, branding, datasets, model weights, customer proof, security certifications, regulatory approvals, partnerships, or live clinical authority.";

export const competitorMarketSources: CompetitorMarketSource[] = [
  {
    name: "Abridge",
    category: "ambient-clinical-intelligence",
    url: "https://www.abridge.com/",
    observedPattern:
      "Abridge packages ambient clinical intelligence as a full care workflow across pre-visit context, encounter documentation, post-visit actions, clinician documentation, revenue-cycle specificity, nursing workflows, customer outcomes, and research-backed evaluation.",
    scrimedTranslation:
      "SCRIMED should make every workflow demo feel like a full operating loop: intake or context, agent execution, evidence trace, human review, buyer outcome, and downstream readiness packet.",
    noCopyBoundary:
      "Do not copy clinical documentation models, customer claims, private datasets, specialty rubrics, branding, or partnership language."
  },
  {
    name: "Ambience Healthcare",
    category: "ambient-clinical-intelligence",
    url: "https://www.ambiencehealthcare.com/",
    observedPattern:
      "Ambience emphasizes documentation plus coding, competitive bake-off proof, specialty adoption, utilization, NPS, charting-time reduction, and compliance-oriented clinical standards.",
    scrimedTranslation:
      "SCRIMED should turn pilots into scored specialty bake-offs with buyer-defined baseline metrics, time-to-value evidence, review utilization, and no-PHI proof packets.",
    noCopyBoundary:
      "Do not reuse Ambience comparative claims, customer quotes, or specialty implementation details; build SCRIMED-specific synthetic measurements."
  },
  {
    name: "Nabla",
    category: "ambient-clinical-intelligence",
    url: "https://www.nabla.com/",
    observedPattern:
      "Nabla surfaces web, mobile, extension, EHR integration, developer API, security, privacy, and governance posture as part of the product buying motion.",
    scrimedTranslation:
      "SCRIMED should present API, connector, identity, mobile-adjacent, and security-readiness signals as first-class product primitives before live integration.",
    noCopyBoundary:
      "Do not claim Nabla-compatible integrations, certifications, or product parity; use public API posture as a market expectation only."
  },
  {
    name: "Suki",
    category: "ambient-clinical-intelligence",
    url: "https://www.suki.ai/",
    observedPattern:
      "Suki positions ambient clinical intelligence as AI infrastructure across documentation, assisted revenue cycle, clinical reasoning, major EHR integrations, partner tooling, enterprise security, and measurable clinical and financial ROI.",
    scrimedTranslation:
      "SCRIMED should answer with governed workflow intelligence that pairs documentation-adjacent demos with revenue, reasoning, interoperability, and security gates rather than a narrow note-taking story.",
    noCopyBoundary:
      "Do not copy Suki integration claims, ROI claims, trust-portal claims, EHR embedding language, UI, partner toolkit, or customer proof."
  },
  {
    name: "Microsoft Dragon Copilot",
    category: "platform-incumbent",
    url: "https://www.microsoft.com/en-us/ai/health",
    observedPattern:
      "Microsoft positions healthcare AI around trusted AI, Dragon Copilot clinical workflow assistance, health-data protection, Azure-scale platform services, Microsoft Fabric, Defender, Teams, Power Platform, and enterprise customer stories.",
    scrimedTranslation:
      "SCRIMED should not try to sound larger than Microsoft; it should win with a sharper healthcare operating layer, faster no-PHI buyer proof, evidence-first agent governance, and clean integration boundaries.",
    noCopyBoundary:
      "Do not imply Microsoft partnership, Azure equivalence, Dragon Copilot parity, Fabric replacement, Defender-managed security, or enterprise-scale certification."
  },
  {
    name: "Oracle Health",
    category: "platform-incumbent",
    url: "https://www.oracle.com/health/",
    observedPattern:
      "Oracle Health positions healthcare AI as an enterprise-grade cloud, EHR, interoperability, payer, financial, population health, security, services, and data-platform ecosystem.",
    scrimedTranslation:
      "SCRIMED should frame itself as an overlay intelligence and proof layer that complements incumbent systems while preparing connector, payer, financial, and security evidence before production use.",
    noCopyBoundary:
      "Do not imply Oracle certification, EHR replacement, ONC-certified status, Oracle Health integration, clinical-suite parity, or enterprise security certification."
  },
  {
    name: "Hippocratic AI",
    category: "safety-agent-platform",
    url: "https://www.hippocraticai.com/",
    observedPattern:
      "Hippocratic AI foregrounds safety-first healthcare agents, human escalation, broad agent libraries, non-diagnosis/non-prescribing boundaries, clinical validation claims, customer logos, and capital strength.",
    scrimedTranslation:
      "SCRIMED should turn TrustOS, human review, escalation, and no-live-care boundaries into a product strength while avoiding public claims that require clinical validation, licensure, or customer approval.",
    noCopyBoundary:
      "Do not copy agent catalogs, safety benchmarks, clinical validation claims, customer logos, call examples, funding claims, or voice-agent experience."
  },
  {
    name: "Notable",
    category: "agent-workforce",
    url: "https://www.notablehealth.com/",
    observedPattern:
      "Notable sells an AI agent workforce across patient access, revenue cycle, care operations, contact center, low-code flow building, connector hub integration, and measurable operational outcomes.",
    scrimedTranslation:
      "SCRIMED should package AgentOS as a governed workforce builder with reusable workflow templates, connector contracts, operator approval gates, and buyer-owned success metrics.",
    noCopyBoundary:
      "Do not copy Notable Flow Builder, connector implementation, UI, customer results, or automation claims; build original templates and proofs."
  },
  {
    name: "Commure",
    category: "revenue-cycle",
    url: "https://www.commure.com/",
    observedPattern:
      "Commure packages front-end patient access, mid-cycle clinical intelligence, and back-end revenue integrity around one data model, EHR breadth, ambient AI, RCM automation, and quantified scale.",
    scrimedTranslation:
      "SCRIMED should make the patient-access-to-ledger story inspectable through synthetic workflows that connect access friction, documentation evidence, payer friction, and financial-risk review.",
    noCopyBoundary:
      "Do not copy Commure scale claims, EHR counts, customer logos, billing automation, or end-to-end RCM implementation claims."
  },
  {
    name: "Innovaccer",
    category: "data-and-ai-platform",
    url: "https://innovaccer.com/",
    observedPattern:
      "Innovaccer positions an agentic cloud built on unified data, real-time context, governed activation, enterprise identity resolution, and launchable AI agents.",
    scrimedTranslation:
      "SCRIMED should strengthen Atlas as a governed context layer and AgentOS as the activation layer for synthetic-to-protected enterprise pilots.",
    noCopyBoundary:
      "Do not imply unified enterprise data ingestion, identity resolution, or production cloud deployment until customer-approved connectors exist."
  },
  {
    name: "SmarterDx",
    category: "revenue-cycle",
    url: "https://www.smarterdx.com/",
    observedPattern:
      "SmarterDx focuses on clinical evidence hidden in patient records, 100% chart coverage, diagnosis and charge validation, denials, utilization, ROI proof, and secure revenue-cycle trust.",
    scrimedTranslation:
      "SCRIMED should turn PayerIQ and Atlas into evidence-first revenue-risk demos with chart-story completeness, denial-root-cause explanation, and finance-methodology gates.",
    noCopyBoundary:
      "Do not reuse SmarterDx ROI claims, security claims, chart algorithms, or customer proof; keep SCRIMED metrics buyer-reviewed and synthetic."
  },
  {
    name: "Cohere Health",
    category: "payer-operations",
    url: "https://www.coherehealth.com/",
    observedPattern:
      "Cohere Health connects utilization management, prior authorization, payment integrity, appeals, care management, quality, claims operations, APIs, and policy tooling with humans in control.",
    scrimedTranslation:
      "SCRIMED should make payer and plan workflows policy-aware, API-shaped, appeal-ready, specialty-scoped, and explicitly human-controlled before production authority.",
    noCopyBoundary:
      "Do not copy Cohere portals, policy rules, payer criteria, network claims, or real-time authorization claims."
  },
  {
    name: "Freed",
    category: "ambient-clinical-intelligence",
    url: "https://www.getfreed.ai/",
    observedPattern:
      "Freed sells simple AI medical scribe value to individual clinicians and smaller practices through a low-friction product promise, quick documentation relief, and self-serve buying motion.",
    scrimedTranslation:
      "SCRIMED should keep a lower-friction clinic path that sells no-PHI readiness, workflow relief, and mission-aligned governance without forcing every prospect into a large enterprise package.",
    noCopyBoundary:
      "Do not copy Freed pricing, self-serve funnel claims, documentation output, UI, customer claims, or small-practice adoption language."
  },
  {
    name: "Qventus",
    category: "agent-workforce",
    url: "https://www.qventus.com/",
    observedPattern:
      "Qventus positions healthcare operations automation around capacity, perioperative flow, inpatient operations, discharge, and measurable operational improvements for hospitals.",
    scrimedTranslation:
      "SCRIMED should make patient access, operations, throughput, and staffing-friction workflows visible as governed synthetic operating loops with human review and no managed-service guarantee.",
    noCopyBoundary:
      "Do not copy Qventus operational models, hospital customer claims, implementation playbooks, ROI claims, or capacity-management algorithms."
  },
  {
    name: "Redox",
    category: "interoperability-network",
    url: "https://redoxengine.com/",
    observedPattern:
      "Redox positions interoperability as real-time healthcare data exchange, cloud data activation, network reach, managed services, API documentation, security posture, and marketplace availability.",
    scrimedTranslation:
      "SCRIMED should make its integration posture more inspectable through connector trust labels, fixture status, standards mapping, security prerequisites, and buyer-ready API boundaries.",
    noCopyBoundary:
      "Do not copy Redox APIs, network claims, uptime claims, certification claims, customer quotes, partner marketplace claims, or live integration claims."
  },
  {
    name: "Health Gorilla",
    category: "interoperability-network",
    url: "https://healthgorilla.com/",
    observedPattern:
      "Health Gorilla makes national data exchange, TEFCA/QHIN-style positioning, productized clinical data categories, payer/provider markets, API docs, and security posture visible in the sales motion.",
    scrimedTranslation:
      "SCRIMED should track TEFCA, HIE, EHR, lab, ADT, pharmacy, SDOH, and patient-access data readiness as approval-path metadata until live exchange is authorized.",
    noCopyBoundary:
      "Do not imply QHIN/QHIO status, TEFCA participation, government designation, national network participation, lab network connectivity, or patient data access."
  },
  {
    name: "Aidoc",
    category: "imaging-ai",
    url: "https://www.aidoc.com/",
    observedPattern:
      "Aidoc packages imaging AI as a clinical workflow and care-team activation platform across radiology, cardiology, neurovascular, vascular, notifications, follow-up, governance, and strategy resources.",
    scrimedTranslation:
      "SCRIMED should frame imaging intelligence as imaging-to-action workflow readiness: metadata ingestion, triage workflow simulation, care-team handoff, audit, and human radiology authority boundaries.",
    noCopyBoundary:
      "Do not copy Aidoc algorithms, FDA-cleared indications, customer outcomes, care-team workflow implementation, clinical claims, or imaging interpretation authority."
  },
  {
    name: "Notable Trust Center",
    category: "trust-and-security",
    url: "https://trust.notablehealth.com/",
    observedPattern:
      "Notable exposes a trust center with security review workflow, compliance badges, risk profile, reports, product security, data privacy, access control, infrastructure, endpoint security, policies, and vulnerability reporting.",
    scrimedTranslation:
      "SCRIMED should keep building its Trust Center, Cyber Defense Command Center, security evidence packet, no-secret contracts, and external-evidence gaps as buyer-visible trust assets.",
    noCopyBoundary:
      "Do not copy third-party trust center content, badges, reports, customer logos, policy documents, certification claims, or downloadable security artifacts."
  }
];

export const competitiveResearchSignals: CompetitiveResearchSignal[] = [
  {
    sourceName: "Abridge",
    sourceUrl: "https://www.abridge.com/",
    category: "ambient-clinical-intelligence",
    currentPublicSignal:
      "Ambient AI leaders are selling an end-to-end clinical conversation platform: pre-visit context, live encounter support, post-visit documentation, coding specificity, patient summaries, outcomes reporting, and research-backed evaluation.",
    scrimedImplication:
      "SCRIMED should sell governed care-workflow intelligence, not isolated note generation: context, execution, evidence, human review, downstream readiness, and blocked-authority clarity.",
    implementationStatus: "implemented",
    lastReviewed: "2026-07-08"
  },
  {
    sourceName: "Ambience Healthcare",
    sourceUrl: "https://www.ambiencehealthcare.com/",
    category: "ambient-clinical-intelligence",
    currentPublicSignal:
      "Ambient vendors are using utilization, charting-time reduction, NPS, specialty fit, coding, compliance, and competitive bake-off narratives as enterprise buyer proof.",
    scrimedImplication:
      "SCRIMED should turn demos into buyer-defined scorecards and synthetic specialty bake-offs with reviewer confidence, evidence quality, workflow value, and claim safety metrics.",
    implementationStatus: "package-next",
    lastReviewed: "2026-07-08"
  },
  {
    sourceName: "Cohere Health",
    sourceUrl: "https://www.coherehealth.com/",
    category: "payer-operations",
    currentPublicSignal:
      "Payer-operation platforms are connecting utilization management, payment integrity, appeals, care management, quality, claims operations, policy intelligence, and human-in-control workflows.",
    scrimedImplication:
      "SCRIMED should upgrade PayerIQ around documentation-before-authorization, denial-risk explanations, appeal packet readiness, payment-integrity review, and explicit no-submission gates.",
    implementationStatus: "package-next",
    lastReviewed: "2026-07-08"
  },
  {
    sourceName: "Innovaccer",
    sourceUrl: "https://innovaccer.com/",
    category: "data-and-ai-platform",
    currentPublicSignal:
      "Healthcare AI platforms are converging around unified data foundations, real-time context, voice and workflow agents, activation in weeks, and cross-domain healthcare operations.",
    scrimedImplication:
      "SCRIMED should make Atlas, AgentOS, TrustOS, and protected workspaces feel like one governed context-to-agent-to-proof operating system.",
    implementationStatus: "implemented",
    lastReviewed: "2026-07-08"
  },
  {
    sourceName: "Redox",
    sourceUrl: "https://redoxengine.com/",
    category: "interoperability-network",
    currentPublicSignal:
      "Integration vendors are selling real-time healthcare data movement, cloud activation, API documentation, network breadth, security posture, and managed integration services.",
    scrimedImplication:
      "SCRIMED should strengthen its connector trust catalog and be explicit about synthetic-ready, contract-ready, protected-gated, and live-use-blocked integration states.",
    implementationStatus: "package-next",
    lastReviewed: "2026-07-08"
  },
  {
    sourceName: "Health Gorilla",
    sourceUrl: "https://healthgorilla.com/",
    category: "interoperability-network",
    currentPublicSignal:
      "Health data network buyers expect TEFCA, HIE, payer, provider, lab, pharmacy, ADT, SDOH, API, and security readiness to be easy to inspect.",
    scrimedImplication:
      "SCRIMED should track national exchange and data-category readiness as an approvals roadmap while clearly blocking live exchange and network claims.",
    implementationStatus: "monitor",
    lastReviewed: "2026-07-08"
  },
  {
    sourceName: "Aidoc",
    sourceUrl: "https://www.aidoc.com/",
    category: "imaging-ai",
    currentPublicSignal:
      "Imaging AI leaders are moving beyond algorithm lists into care-team activation, follow-up, workflow prioritization, governance, and outcome-oriented clinical operations.",
    scrimedImplication:
      "SCRIMED should build imaging-to-action simulations: imaging metadata, routing, handoff, follow-up, governance, and no-final-interpretation safeguards.",
    implementationStatus: "package-next",
    lastReviewed: "2026-07-08"
  },
  {
    sourceName: "Notable Trust Center",
    sourceUrl: "https://trust.notablehealth.com/",
    category: "trust-and-security",
    currentPublicSignal:
      "Enterprise buyers expect a structured trust center, report request workflow, risk profile, access control, product security, data privacy, infrastructure, endpoint security, policies, and vulnerability reporting.",
    scrimedImplication:
      "SCRIMED should continue turning trust into a product surface through Cyber Defense, Security Diligence Evidence Packet, Trust Center, no-secret checks, and blocked external evidence lanes.",
    implementationStatus: "implemented",
    lastReviewed: "2026-07-08"
  }
];

export const cleanRoomCompetitivePlays: CleanRoomCompetitivePlay[] = [
  {
    slug: "proof-before-pilot-command",
    priority: "immediate",
    marketPattern:
      "Leading competitors convert vague AI value into buyer-visible proof: utilization, time saved, workflow coverage, adoption, policy friction, and operational outcomes.",
    publicSources: ["Abridge", "Ambience Healthcare", "Cohere Health", "Aidoc"],
    legalExtractionRule:
      "Use only the general public pattern of proof-first selling; create SCRIMED-original metrics, copy, workflows, and evidence packets.",
    prohibitedCopying: [
      "competitor charts",
      "customer quotes",
      "customer logos",
      "private benchmark rubrics",
      "ROI claims",
      "clinical validation claims"
    ],
    scrimedOriginalImplementation:
      "Package SCRIMED demos as proof-before-pilot scorecards with baseline, synthetic scenario, workflow loop, evidence coverage, human review, and blocked authority.",
    productSystemsToUpgrade: ["/pilot-deal-room", "/qa-evidence", "/public-market-readiness", "/investor-audience-readiness"],
    revenueMotion:
      "Sell a fixed-scope no-PHI proof sprint before larger protected pilots, then convert qualified buyers into department-specific packages.",
    salesPitchUpgrade:
      "Before you expose data or commit to production, SCRIMED shows exactly what can be proven, reviewed, and blocked.",
    investorConfidenceSignal:
      "Demonstrates disciplined enterprise sales motion and reduces perceived execution risk.",
    privacyAndTrustControl:
      "No-PHI scenarios only, redacted artifacts, claim guard, human review, and no production authority language.",
    proofMetric: "buyer-proof-packet-completeness",
    nextBuildAction:
      "Add a proof-before-pilot packet to Pilot Deal Room that pulls from QA Evidence, Competitive Intelligence, and Security Diligence Evidence.",
    retainedBoundary:
      "No live PHI, no customer proof claims, no unsupported ROI assurance, no clinical validation claim, and no production go-live authority."
  },
  {
    slug: "trust-center-as-sales-asset",
    priority: "immediate",
    marketPattern:
      "Enterprise healthcare vendors increasingly make trust centers, security reports, risk profiles, privacy posture, access control, and vulnerability reporting part of the buying journey.",
    publicSources: ["Notable Trust Center", "Redox", "Ambience Healthcare"],
    legalExtractionRule:
      "Use the general enterprise-buying expectation for a trust surface; publish only SCRIMED-owned statuses, gaps, evidence, and no-go boundaries.",
    prohibitedCopying: [
      "third-party trust center layout",
      "badges",
      "security report names",
      "certification claims",
      "policy text",
      "customer review artifacts"
    ],
    scrimedOriginalImplementation:
      "Expand SCRIMED Trust Center with security evidence packet, release readiness ladder, external evidence checklist, and buyer-safe redaction rules.",
    productSystemsToUpgrade: ["/trust-center", "/scrimed-cyber-defense", "/api/scrimed-cyber-defense/evidence-packet"],
    revenueMotion:
      "Shorten security-review friction by giving buyers a redacted diligence path before procurement stalls.",
    salesPitchUpgrade:
      "SCRIMED does not hide its limits; it packages trust evidence and blocked authority so buyers can review safely.",
    investorConfidenceSignal:
      "Signals enterprise procurement maturity without overstating certification or production status.",
    privacyAndTrustControl:
      "Metadata-only evidence, no raw logs, no tokens, no secrets, no connector payloads, and external review gates.",
    proofMetric: "security-diligence-evidence-ready-count",
    nextBuildAction:
      "Link Security Diligence Evidence Packet into Trust Center and buyer deal-room packet manifests.",
    retainedBoundary:
      "No certification claim, no breach-proof claim, no PHI authority, no raw security artifact sharing, and no customer go-live approval."
  },
  {
    slug: "connector-trust-catalog",
    priority: "near-term",
    marketPattern:
      "Interoperability leaders make APIs, network scope, standards coverage, cloud activation, security posture, and data categories visible early.",
    publicSources: ["Redox", "Health Gorilla", "Nabla", "Innovaccer"],
    legalExtractionRule:
      "Use the public buyer expectation for inspectable integration readiness; do not claim connectivity, network participation, designation, or implementation parity.",
    prohibitedCopying: [
      "API schemas",
      "network claims",
      "standardized integration code",
      "EHR connection lists",
      "QHIN/QHIO designation language",
      "uptime claims"
    ],
    scrimedOriginalImplementation:
      "Create SCRIMED connector trust labels for FHIR, HL7, DICOM, X12, SMART, MCP, HIE, lab, pharmacy, ADT, SDOH, and payer data categories.",
    productSystemsToUpgrade: ["/interoperability", "/integrations", "/health-records", "/deployment-profiles"],
    revenueMotion:
      "Offer integration readiness reviews as paid pre-implementation work that reduces buyer uncertainty and scopes services cleanly.",
    salesPitchUpgrade:
      "SCRIMED shows which integrations are synthetic-ready, contract-ready, protected-gated, or blocked before anyone touches live systems.",
    investorConfidenceSignal:
      "Turns interoperability from a vague promise into a visible implementation moat and service revenue path.",
    privacyAndTrustControl:
      "No raw connector payloads, no live data exchange, data-minimization review, customer approval gate, and security evidence prerequisite.",
    proofMetric: "connector-readiness-label-coverage",
    nextBuildAction:
      "Add connector trust catalog data to interoperability fixture cards and deployment profile pages.",
    retainedBoundary:
      "No live exchange, no production connector approval, no network participation claim, no EHR writeback, and no PHI processing."
  },
  {
    slug: "payer-policy-evidence-loop",
    priority: "immediate",
    marketPattern:
      "Payer and RCM competitors connect prior authorization, documentation precision, payment integrity, appeals, quality, claims operations, and human-in-control decisioning.",
    publicSources: ["Cohere Health", "SmarterDx", "Commure", "Notable"],
    legalExtractionRule:
      "Use the public workflow pattern of connected payer evidence; create SCRIMED-original synthetic rules, packets, review gates, and human boundaries.",
    prohibitedCopying: [
      "payer criteria libraries",
      "portal behavior",
      "payment-integrity algorithms",
      "claims workflows",
      "customer ROI proof",
      "submission logic"
    ],
    scrimedOriginalImplementation:
      "Upgrade PayerIQ into a documentation-before-authorization and denial-risk evidence loop with missing evidence, medical-necessity phrasing gaps, appeal packet readiness, and human signoff.",
    productSystemsToUpgrade: ["/workflows/results", "/agents/revenue-cycle-agent", "/pricing", "/capital-vitality"],
    revenueMotion:
      "Sell payer-friction assessments and protected revenue-cycle pilots priced around workflow volume and review complexity.",
    salesPitchUpgrade:
      "SCRIMED helps find missing evidence and payer friction before submission, while final action stays with qualified humans.",
    investorConfidenceSignal:
      "Creates a concrete revenue wedge with clear margin potential and safety gates.",
    privacyAndTrustControl:
      "Synthetic scenarios, no payer submission, no reimbursement guarantee, finance methodology review, and qualified human approval.",
    proofMetric: "payer-evidence-gap-resolution-rate",
    nextBuildAction:
      "Add one synthetic payer-policy evidence loop to the competitive demo queue and public-market readiness proof map.",
    retainedBoundary:
      "No payer submission, no claim filing, no automated approval, no reimbursement guarantee, and no final coding authority."
  },
  {
    slug: "imaging-to-action-without-interpretation",
    priority: "near-term",
    marketPattern:
      "Imaging AI leaders package value around workflow prioritization, care-team activation, follow-up, governance, and measurable operational impact.",
    publicSources: ["Aidoc", "Rad AI", "PathAI"],
    legalExtractionRule:
      "Use the general workflow idea of moving from imaging metadata to governed follow-up actions; do not copy algorithms, clinical indications, or regulated claims.",
    prohibitedCopying: [
      "imaging models",
      "regulated indications",
      "triage algorithms",
      "clinical outcome claims",
      "customer workflows",
      "final interpretation language"
    ],
    scrimedOriginalImplementation:
      "Build an imaging-to-action readiness scaffold: DICOM metadata intake, synthetic finding label, routing simulation, care-team handoff, follow-up queue, audit, and radiologist authority boundary.",
    productSystemsToUpgrade: ["/scrimed-ai-infrastructure-watchtower", "/clinical-data-fabric", "/trust-os"],
    revenueMotion:
      "Package imaging workflow readiness as a governance and operations assessment for radiology, cardiology, oncology, and specialty service lines.",
    salesPitchUpgrade:
      "SCRIMED can help govern the work around imaging AI before claiming interpretation authority.",
    investorConfidenceSignal:
      "Keeps SCRIMED in high-value imaging workflows while avoiding premature regulated-device claims.",
    privacyAndTrustControl:
      "Metadata-only demos, no diagnostic interpretation, human specialist review, no live DICOM, and no regulated-device claim.",
    proofMetric: "imaging-handoff-audit-coverage",
    nextBuildAction:
      "Add imaging-to-action synthetic workflow metadata to the Clinical Data Fabric and AI Infrastructure Watchtower.",
    retainedBoundary:
      "No final imaging interpretation, no FDA claim, no diagnosis, no live DICOM, and no treatment recommendation."
  },
  {
    slug: "audience-specific-revenue-packaging",
    priority: "strategic",
    marketPattern:
      "Competitors sell by audience: enterprise health systems, payer operations, independent clinicians, public sector, implementation partners, investors, and specialty workflows.",
    publicSources: ["Abridge", "Ambience Healthcare", "Freed", "Innovaccer", "Cohere Health"],
    legalExtractionRule:
      "Use only the general segmentation strategy; create SCRIMED-original offers, names, prices, success criteria, and disclaimers.",
    prohibitedCopying: [
      "pricing tables",
      "package names",
      "conversion funnels",
      "customer proof",
      "logo walls",
      "trademarked program language"
    ],
    scrimedOriginalImplementation:
      "Strengthen SCRIMED’s offer ladder: clinic starter, executive assessment, specialty bake-off, payer evidence review, connector trust review, protected pilot, and enterprise diligence room.",
    productSystemsToUpgrade: ["/pricing", "/offerings", "/client-onboarding", "/sales-operations", "/investor-audience-readiness"],
    revenueMotion:
      "Create margin-protected paid assessments that ladder into pilots and enterprise subscriptions without requiring live PHI first.",
    salesPitchUpgrade:
      "SCRIMED meets each buyer at the right risk level: starter proof, governed pilot, or enterprise diligence.",
    investorConfidenceSignal:
      "Shows diversified revenue paths and a practical path from no-PHI proof to enterprise expansion.",
    privacyAndTrustControl:
      "Each offer has a data boundary, approval gate, proof artifact, blocked claim list, and required reviewer role.",
    proofMetric: "offer-to-proof-route-completeness",
    nextBuildAction:
      "Add clean-room competitor-response offers to pricing and sales-operations packets.",
    retainedBoundary:
      "No securities solicitation, no revenue guarantee, no customer activation promise, no PHI use, and no clinical production claim."
  }
];

export const competitiveBuildPatterns: CompetitiveBuildPattern[] = [
  {
    slug: "full-workflow-operating-loop",
    title: "Full Workflow Operating Loop",
    priority: "now",
    sourceNames: ["Abridge", "Commure", "Notable"],
    marketSignal:
      "Winning healthcare AI platforms show the complete path from context to action to downstream operational result, not a single chat or document feature.",
    productTranslation:
      "Every SCRIMED demo and pilot should show context intake, agent execution, evidence trace, human review, operational output, and retained buyer decision evidence.",
    buildImplementation:
      "Expose a competitor-informed workflow loop that links Product Console, Demo Center, AgentOS evaluation, workflow results, pilot deal room, and protected workspace evidence.",
    productSurfaces: ["/product", "/demos", "/evaluation", "/workflows/results", "/pilot-deal-room"],
    agents: ["Agent Commander", "Clinical Intelligence Agent", "Revenue Integrity Agent", "TrustOS Reviewer"],
    infrastructureMoves: [
      "workflow loop schema",
      "evidence trace packet",
      "human-review checkpoint",
      "downstream readiness register"
    ],
    healthcareIntelligenceUpgrade:
      "Move from feature list to operating-loop proof that shows how healthcare work becomes governed intelligence.",
    salesPitchUpgrade:
      "SCRIMED is not an isolated scribe or chatbot; it is a review-gated operating loop for healthcare workflows.",
    proofMetrics: [
      "workflow steps completed",
      "evidence trace coverage",
      "human-review turnaround",
      "downstream blocker count",
      "buyer decision readiness"
    ],
    governanceGates: [
      "synthetic-only input",
      "no live writeback",
      "human reviewer required",
      "claim guard",
      "protected release decision"
    ],
    blockedClaims: [
      "autonomous clinical action",
      "production EHR integration",
      "unsupported downstream savings assurance",
      "customer-approved live deployment"
    ],
    nextImplementation:
      "Add a visible operating-loop summary to Demo Center and Pilot Deal Room cards."
  },
  {
    slug: "specialty-bakeoff-scorecards",
    title: "Specialty Bake-Off Scorecards",
    priority: "now",
    sourceNames: ["Ambience Healthcare", "Abridge", "SmarterDx"],
    marketSignal:
      "Healthcare buyers expect specialty-level proof, adoption metrics, time saved, evidence quality, and comparative readiness before scaling an AI platform.",
    productTranslation:
      "SCRIMED should provide buyer-defined synthetic bake-off scorecards for access, documentation, revenue cycle, payer, research, and governance workflows.",
    buildImplementation:
      "Use existing protected metric rollups, board scorecards, QA evidence, and public-market readiness metrics as the foundation for scorecard-style sales proof.",
    productSurfaces: [
      "/public-market-readiness",
      "/pilot-workspace/access",
      "/qa-evidence",
      "/capital-vitality"
    ],
    agents: ["Metric Analyst Agent", "Atlas Evidence Agent", "QA Reviewer", "Revenue Integrity Agent"],
    infrastructureMoves: [
      "buyer baseline capture",
      "scorecard metric dictionary",
      "specialty scenario tags",
      "finance methodology gate"
    ],
    healthcareIntelligenceUpgrade:
      "Convert broad AI claims into specialty-scoped, reviewer-owned measurements that can survive buyer diligence.",
    salesPitchUpgrade:
      "Run SCRIMED against your workflow criteria before exposing data or asking your teams to trust a production claim.",
    proofMetrics: [
      "baseline metric captured",
      "scenario completion rate",
      "reviewer confidence",
      "documentation completeness",
      "denial-risk signal quality"
    ],
    governanceGates: [
      "buyer metric owner",
      "external-use approval",
      "finance methodology review",
      "no unsupported ROI assurance",
      "no certification claim"
    ],
    blockedClaims: [
      "best-in-market benchmark",
      "unsupported ROI assurance",
      "clinical superiority",
      "certified specialty performance"
    ],
    nextImplementation:
      "Create a competitive bake-off packet template for no-PHI workflow pilots."
  },
  {
    slug: "api-and-connector-trust-catalog",
    title: "API and Connector Trust Catalog",
    priority: "next",
    sourceNames: ["Nabla", "Cohere Health", "Notable", "Innovaccer"],
    marketSignal:
      "Competitors make APIs, EHR connectivity, connector hubs, policy tooling, and trust posture visible early in the sales cycle.",
    productTranslation:
      "SCRIMED should display connector intent, API shape, standards coverage, live-use blockers, security prerequisites, and synthetic fixture readiness in one buyer catalog.",
    buildImplementation:
      "Extend existing integration fixtures, interoperability conformance, contracts, deployment profiles, and protected provider security review into a buyer-facing connector trust catalog.",
    productSurfaces: [
      "/integrations",
      "/interoperability",
      "/workflows/contracts",
      "/deployment-profiles",
      "/trust-center"
    ],
    agents: ["Interoperability Agent", "Contract Analyst", "Security Reviewer", "Deployment Planner"],
    infrastructureMoves: [
      "connector trust schema",
      "API readiness labels",
      "standards mapping",
      "live-use blocker register"
    ],
    healthcareIntelligenceUpgrade:
      "Make interoperability feel like a governed product asset rather than a future implementation promise.",
    salesPitchUpgrade:
      "Buyers can inspect exactly which connectors are synthetic-ready, contract-ready, or blocked before production.",
    proofMetrics: [
      "fixture coverage",
      "contract completeness",
      "blocked live-use controls",
      "standards mapped",
      "security prerequisites retained"
    ],
    governanceGates: [
      "security review",
      "BAA/DPA readiness",
      "customer connector approval",
      "data-minimization review",
      "no live PHI until approved"
    ],
    blockedClaims: [
      "certified EHR integration",
      "live API availability",
      "payer network connectivity",
      "production PHI processing"
    ],
    nextImplementation:
      "Add connector trust labels to interoperability and integration fixture cards."
  },
  {
    slug: "revenue-and-payer-evidence-engine",
    title: "Revenue and Payer Evidence Engine",
    priority: "now",
    sourceNames: ["SmarterDx", "Cohere Health", "Commure", "Notable"],
    marketSignal:
      "Revenue-cycle and payer competitors win by making policy evidence, documentation specificity, denials, appeals, utilization, and payment integrity operationally measurable.",
    productTranslation:
      "SCRIMED should sharpen PayerIQ into a synthetic evidence engine for prior authorization support, denial root-cause analysis, appeal packet preparation, and revenue-risk review.",
    buildImplementation:
      "Route PayerIQ through Atlas evidence attribution, workflow result validation, finance methodology gates, and human reviewer controls.",
    productSurfaces: [
      "/agents/revenue-cycle-agent",
      "/workflows/results",
      "/pricing",
      "/public-market-readiness",
      "/pilot-workspace/access"
    ],
    agents: ["PayerIQ", "Revenue Integrity Agent", "Policy Evidence Agent", "Appeals Reviewer"],
    infrastructureMoves: [
      "policy evidence map",
      "denial root-cause taxonomy",
      "appeal packet draft boundary",
      "financial-impact guardrail"
    ],
    healthcareIntelligenceUpgrade:
      "Turn payer and RCM workflows into evidence-backed operating intelligence without submitting claims or promising reimbursement.",
    salesPitchUpgrade:
      "SCRIMED helps teams find missing evidence and payer friction before value leaks, while keeping final payer actions with humans.",
    proofMetrics: [
      "policy references mapped",
      "missing evidence surfaced",
      "denial-risk reasons explained",
      "appeal draft completeness",
      "human override rate"
    ],
    governanceGates: [
      "no payer submission",
      "no reimbursement guarantee",
      "finance reviewer signoff",
      "qualified coding review",
      "human final action"
    ],
    blockedClaims: [
      "unsupported reimbursement assurance",
      "automated payer approval",
      "final coding decision",
      "payment integrity certification"
    ],
    nextImplementation:
      "Package one no-PHI denial-risk and prior-auth evidence demo for enterprise revenue-cycle buyers."
  },
  {
    slug: "governed-context-and-agent-activation",
    title: "Governed Context and Agent Activation",
    priority: "platform",
    sourceNames: ["Innovaccer", "Nabla", "Abridge", "Cohere Health"],
    marketSignal:
      "Enterprise AI platforms are converging on unified context, governed activation, reusable agents, identity, auditability, and human-in-control assurances.",
    productTranslation:
      "SCRIMED should position Atlas as the context and evidence layer, AgentOS as the activation layer, TrustOS as the decision-control layer, and protected workspaces as the enterprise operating boundary.",
    buildImplementation:
      "Make the route map explicit across Atlas, AgentOS, TrustOS, deployment profiles, protected workspaces, audit, observability, and release governance.",
    productSurfaces: [
      "/atlas",
      "/agents",
      "/trust-os",
      "/deployment-profiles",
      "/agent-workspace",
      "/observability"
    ],
    agents: ["Atlas Evidence Agent", "Agent Commander", "TrustOS Reviewer", "Deployment Planner"],
    infrastructureMoves: [
      "context layer declaration",
      "agent activation policy",
      "identity and audit map",
      "deployment profile gate"
    ],
    healthcareIntelligenceUpgrade:
      "Define the healthcare intelligence OS as layered infrastructure with governed context, activation, trust, and deployment controls.",
    salesPitchUpgrade:
      "SCRIMED gives buyers a healthcare AI operating layer they can inspect before it touches live systems.",
    proofMetrics: [
      "context sources attributed",
      "agent actions audited",
      "trust decisions retained",
      "deployment blockers resolved",
      "protected workspace controls active"
    ],
    governanceGates: [
      "role-based access",
      "AAL2 operator proof",
      "append-only audit",
      "release control",
      "external approval evidence"
    ],
    blockedClaims: [
      "unified live enterprise data",
      "autonomous deployment",
      "unapproved security attestation",
      "regulatory approved"
    ],
    nextImplementation:
      "Add the layered architecture pitch to Strategic Intelligence and Competitive Edge."
  }
];

export const competitiveInitiatives: CompetitiveInitiative[] = [
  {
    name: "Competitor-informed product proof route",
    status: "implemented",
    owner: "Product strategy",
    buyerSegment: "Enterprise evaluators, investors, advisors, and sales reviewers",
    productSurface: "/competitive-intelligence",
    whyItImprovesScrimed:
      "It turns competitor analysis into an inspectable product surface that shows what SCRIMED will build, prove, and refuse to overclaim.",
    implementation:
      "Typed market sources, build patterns, initiatives, API route, and buyer-facing page.",
    proofRoute: "/api/competitive-intelligence",
    nextAction:
      "Keep sources reviewed monthly and tie each next build step to a sprint owner."
  },
  {
    name: "Synthetic specialty bake-off packet",
    status: "package-next",
    owner: "Sales engineering",
    buyerSegment: "Clinical operations, documentation, revenue-cycle, and payer leaders",
    productSurface: "/pilot-deal-room",
    whyItImprovesScrimed:
      "It gives buyers a credible way to compare SCRIMED against incumbent categories without requiring live PHI or production connectors.",
    implementation:
      "No-PHI scorecard template using baseline metric, specialty scenario, evidence completeness, reviewer confidence, and governance blockers.",
    proofRoute: "/qa-evidence",
    nextAction:
      "Add a downloadable bake-off packet to the Pilot Deal Room after claim-guard review."
  },
  {
    name: "Connector trust catalog",
    status: "package-next",
    owner: "Interoperability and security",
    buyerSegment: "CIO, CTO, security, procurement, and implementation teams",
    productSurface: "/integrations",
    whyItImprovesScrimed:
      "It answers the buyer's API, EHR, data, and security questions before a call becomes implementation ambiguity.",
    implementation:
      "Synthetic-ready, contract-ready, protected-gated, and blocked-live-use labels for each connector family.",
    proofRoute: "/interoperability",
    nextAction:
      "Attach trust labels to FHIR, HL7, X12, DICOM, SMART, and MCP fixture cards."
  },
  {
    name: "PayerIQ evidence demo",
    status: "package-next",
    owner: "Revenue-cycle product",
    buyerSegment: "Payer operations, prior authorization, denials, appeals, and revenue integrity buyers",
    productSurface: "/agents/revenue-cycle-agent",
    whyItImprovesScrimed:
      "It gives SCRIMED a sharper wedge against revenue-cycle and payer platforms while staying review-gated.",
    implementation:
      "One synthetic scenario for policy evidence mapping, missing documentation detection, denial root-cause explanation, and appeal draft boundary.",
    proofRoute: "/workflows/results",
    nextAction:
      "Create a no-PHI scenario packet and route every financial-impact phrase through finance methodology gates."
  },
  {
    name: "Healthcare intelligence OS layered pitch",
    status: "implemented",
    owner: "Founder and product marketing",
    buyerSegment: "Executives, board reviewers, public-sector partners, and strategic health systems",
    productSurface: "/strategic-intelligence",
    whyItImprovesScrimed:
      "It lets SCRIMED mirror the platform-level clarity of mature competitors while keeping a distinct governance-first category.",
    implementation:
      "Atlas context layer, AgentOS activation layer, TrustOS control layer, protected workspace boundary, and proof-packet release layer.",
    proofRoute: "/competitive-edge",
    nextAction:
      "Use this language in founder-led sales calls and keep claims aligned with the claims register."
  }
];

export const competitiveTargetAudienceStrategies: CompetitiveTargetAudienceStrategy[] = [
  {
    slug: "health-system-executive-transformation-sponsors",
    priority: "immediate",
    targetAudience: "Health system executives and transformation sponsors",
    buyerRole: "CEO, COO, chief strategy officer, transformation office, enterprise innovation sponsor",
    competitorPressure: ["Microsoft Dragon Copilot", "Oracle Health", "Abridge", "Notable", "Qventus"],
    primaryPain:
      "Executive buyers see point solutions for notes, incumbent platform suites, and operations vendors, but still need a governed way to evaluate cross-functional AI before production risk expands.",
    scrimedCounterPosition:
      "Position SCRIMED as the healthcare intelligence operating layer that connects synthetic clinical, operational, revenue, safety, and governance proof without asking the buyer to replace an incumbent system.",
    offerMotion:
      "Executive no-PHI company assessment, workflow operating-loop demo, protected pilot deal room, then buyer-scoped enterprise pilot after approvals are defined.",
    proofRoutes: [
      "/company-assessment",
      "/competitive-intelligence",
      "/pilot-demo-commercial-readiness",
      "/pilot-deal-room"
    ],
    salesMessage:
      "SCRIMED helps leadership evaluate healthcare AI as an operating system, not another isolated tool, while keeping production authority, PHI, and customer proof release gated.",
    conversionTrigger:
      "Buyer asks for a multi-department pilot, executive scorecard, board-ready diligence packet, or cross-functional transformation roadmap.",
    strategicFollowThrough:
      "Package a 30-day executive assessment with three no-PHI workflow loops, one risk register, one buyer proof room, and a clear go/no-go production gate.",
    retainedBoundary:
      "Do not claim EHR replacement, enterprise transformation guarantee, customer-approved live deployment, clinical production readiness, or system-wide savings.",
    blockedClaims: [
      "EHR replacement",
      "unsupported system-wide savings assurance",
      "customer-approved live deployment",
      "clinical production ready"
    ]
  },
  {
    slug: "cmio-clinical-documentation-governance",
    priority: "immediate",
    targetAudience: "CMIO, clinical operations, documentation, and quality leaders",
    buyerRole: "CMIO, chief quality officer, nursing documentation leader, medical director, clinical informatics lead",
    competitorPressure: [
      "Abridge",
      "Ambience Healthcare",
      "Nabla",
      "Suki",
      "Microsoft Dragon Copilot",
      "Freed"
    ],
    primaryPain:
      "Ambient documentation is crowded, buyers expect fast relief, and clinical leaders need evidence quality, reviewer control, specialty fit, and downstream safety before trust scales.",
    scrimedCounterPosition:
      "Do not compete as a generic scribe. Sell SCRIMED as the evidence-governed clinical workflow layer that reviews documentation-adjacent outputs, attribution, exceptions, and downstream risk.",
    offerMotion:
      "Specialty bake-off scorecard, no-PHI documentation-adjacent demo, QA evidence review, and clinical-production-readiness gap map.",
    proofRoutes: ["/demos", "/evaluation", "/qa-evidence", "/clinical-production-readiness"],
    salesMessage:
      "SCRIMED lets clinical leaders test whether AI work is explainable, reviewable, and safe to escalate before it touches live patients or records.",
    conversionTrigger:
      "Buyer asks how SCRIMED compares to an ambient scribe, whether specialty workflows can be evaluated, or how safety review is enforced.",
    strategicFollowThrough:
      "Create a specialty scorecard packet for each clinical demo with evidence completeness, reviewer confidence, exception handling, and blocked clinical claims.",
    retainedBoundary:
      "Do not claim autonomous note signing, diagnosis, treatment, certified specialty performance, clinical validation, or live PHI processing.",
    blockedClaims: [
      "autonomous note signing",
      "diagnosis or treatment authority",
      "certified specialty performance",
      "live PHI processing"
    ]
  },
  {
    slug: "revenue-cycle-payer-evidence-buyers",
    priority: "immediate",
    targetAudience: "Revenue-cycle, payer operations, prior authorization, denials, and appeals leaders",
    buyerRole: "VP revenue cycle, payer operations lead, utilization management leader, denials director, finance transformation sponsor",
    competitorPressure: ["Commure", "SmarterDx", "Cohere Health", "Notable"],
    primaryPain:
      "Revenue and payer buyers need policy evidence, missing documentation visibility, denial-root-cause clarity, and financial controls without vendors overpromising reimbursement.",
    scrimedCounterPosition:
      "Position PayerIQ and Atlas as an evidence-first review engine for prior-auth support, denial-risk detection, appeal packet preparation, and finance-methodology discipline.",
    offerMotion:
      "No-PHI denial-risk and prior-auth evidence demo, finance review gate, buyer-defined metric baseline, then protected pilot packet.",
    proofRoutes: ["/agents/revenue-cycle-agent", "/workflows/results", "/pricing", "/public-market-readiness"],
    salesMessage:
      "SCRIMED helps teams find payer friction and missing evidence before value leaks, while final coding, submission, and reimbursement decisions stay with qualified humans.",
    conversionTrigger:
      "Buyer asks for denial reduction, authorization acceleration, documentation specificity, or finance-backed impact evidence.",
    strategicFollowThrough:
      "Build a payer-evidence demo packet with policy references, missing evidence, denial reason taxonomy, appeal draft boundary, and finance signoff rule.",
    retainedBoundary:
      "Do not claim reimbursement assurance, automated payer approval, final coding decision, payment integrity certification, or claim submission authority.",
    blockedClaims: [
      "unsupported reimbursement assurance",
      "automated payer approval",
      "final coding decision",
      "claim submission authority"
    ]
  },
  {
    slug: "cio-cto-security-procurement",
    priority: "immediate",
    targetAudience: "CIO, CTO, CISO, security, procurement, and implementation teams",
    buyerRole: "CIO, CTO, CISO, security architect, procurement lead, integration lead, enterprise architect",
    competitorPressure: ["Microsoft Dragon Copilot", "Oracle Health", "Nabla", "Innovaccer", "Notable"],
    primaryPain:
      "Technical buyers need to know what is real, synthetic, contract-ready, blocked, or externally retained before they let AI vendors near data, identity, or EHR workflows.",
    scrimedCounterPosition:
      "Win with transparency: connector trust labels, API shape, identity and audit boundaries, protected workspace controls, and security/procurement evidence routing.",
    offerMotion:
      "Connector trust review, platform-power API/UI/AI review, enterprise scalability assessment, and protected buyer diligence room.",
    proofRoutes: ["/interoperability", "/trust-center", "/platform-power", "/enterprise-scalability", "/pilot-workspace/access"],
    salesMessage:
      "SCRIMED shows technical reviewers exactly which workflows are synthetic-ready, contract-ready, protected-gated, or blocked before implementation scope expands.",
    conversionTrigger:
      "Buyer asks for API documentation, EHR connector status, security review evidence, audit controls, SSO, data residency, or procurement questionnaire support.",
    strategicFollowThrough:
      "Attach connector trust labels and procurement evidence routing to each technical sales packet before any buyer-specific implementation statement is made.",
    retainedBoundary:
      "Do not claim certified EHR integration, approved security attestation, public API SLA, production PHI processing, or customer SSO readiness before approval.",
    blockedClaims: [
      "certified EHR integration",
      "unapproved security attestation",
      "public API SLA",
      "production PHI processing"
    ]
  },
  {
    slug: "community-independent-faith-clinics",
    priority: "near-term",
    targetAudience: "Independent, community, rural, and faith-based clinics",
    buyerRole: "Clinic owner, practice administrator, medical director, faith-based clinic sponsor, community health operator",
    competitorPressure: ["Freed", "Nabla", "Suki", "Abridge"],
    primaryPain:
      "Smaller clinics want immediate relief and understandable pricing, but they may not have enterprise security teams, procurement staff, or appetite for complex platform sales cycles.",
    scrimedCounterPosition:
      "Offer a simple, mission-aware no-PHI readiness and workflow relief path that can graduate into protected pilots without pretending SCRIMED is already a live clinical system.",
    offerMotion:
      "Clinic readiness assessment, streamlined demo, starter pilot package, onboarding communications kit, and explicit affordability/margin guardrails.",
    proofRoutes: [
      "/pricing",
      "/pilot-demo-commercial-readiness",
      "/investor-audience-readiness",
      "/offerings",
      "/client-onboarding"
    ],
    salesMessage:
      "SCRIMED gives clinics a practical path to evaluate safer healthcare AI without exposing patient data or committing to enterprise-scale implementation first.",
    conversionTrigger:
      "Buyer asks for a lower-cost pilot, mission-aligned service path, faith-based clinic package, or support preparing a donor or sponsor conversation.",
    strategicFollowThrough:
      "Create a clinic starter packet with one demo, one readiness checklist, one support cadence, one price band, and one external-review boundary page.",
    retainedBoundary:
      "Do not claim faith-based endorsement, donor advice, nonprofit tax advice, affordability assurance, clinical savings assurance, or live care authorization.",
    blockedClaims: [
      "faith-based endorsement",
      "donor or nonprofit tax advice",
      "unsupported affordability assurance",
      "live care authorization"
    ]
  },
  {
    slug: "investors-corporate-strategics",
    priority: "immediate",
    targetAudience: "Angel investors, private investors, corporate strategics, and board reviewers",
    buyerRole: "Angel investor, strategic corporate development lead, private investor, advisor, board reviewer",
    competitorPressure: ["Hippocratic AI", "Innovaccer", "Microsoft Dragon Copilot", "Notable", "Commure"],
    primaryPain:
      "Capital audiences compare SCRIMED against funded platforms with customer logos, incumbent infrastructure, and narrow category clarity, so SCRIMED needs proof of category focus and execution discipline.",
    scrimedCounterPosition:
      "Tell the healthcare intelligence OS story with evidence of product surfaces, readiness gates, commercial motions, moat signals, and no-overclaim discipline.",
    offerMotion:
      "Investor audience packet, capital vitality review, company assessment, competitive edge proof, and public-market readiness evidence map.",
    proofRoutes: [
      "/investor-audience-readiness",
      "/capital-vitality",
      "/company-assessment",
      "/competitive-edge",
      "/public-market-readiness"
    ],
    salesMessage:
      "SCRIMED is building governed healthcare intelligence infrastructure with a safer proof ladder, not chasing hype without approval gates.",
    conversionTrigger:
      "Audience asks about moat, traction, revenue model, enterprise readiness, defensibility, clinical risk, or why SCRIMED can win against well-funded competitors.",
    strategicFollowThrough:
      "Maintain a capital packet that separates approved proof, readiness work, open gaps, blocked claims, and next investable milestones.",
    retainedBoundary:
      "Do not provide investment advice, securities offering material, solicitation, valuation assurance, audited financials, revenue guarantee, or acquisition implication.",
    blockedClaims: [
      "securities offering",
      "valuation assurance",
      "revenue guarantee",
      "acquisition interest"
    ]
  },
  {
    slug: "global-public-sector-regional-partners",
    priority: "protected",
    targetAudience: "Global partners, public-sector buyers, NGOs, and regional health systems",
    buyerRole: "Regional health buyer, public-sector sponsor, NGO partner, international procurement reviewer, localization lead",
    competitorPressure: ["Oracle Health", "Microsoft Dragon Copilot", "Innovaccer", "Cohere Health"],
    primaryPain:
      "Global buyers need regional compliance posture, procurement pathway clarity, localization, data-transfer review, and trusted partner structure before adopting healthcare AI.",
    scrimedCounterPosition:
      "Lead with regional readiness packs, certification preparation, public-sector procurement questions, and partner-channel boundaries before any country-specific launch claim.",
    offerMotion:
      "Global reach pack, certification readiness review, approvals map, regional buyer packet, and external legal/privacy review gate.",
    proofRoutes: ["/global-reach", "/global-certification-readiness", "/approvals-readiness", "/trust-center"],
    salesMessage:
      "SCRIMED can prepare a region-specific evaluation path while keeping regulatory approval, procurement authority, PHI, and live clinical execution outside the current product boundary.",
    conversionTrigger:
      "Buyer asks about GDPR, EU AI Act, NHS, MHRA, ISO, public-sector procurement, data residency, or regional partner deployment.",
    strategicFollowThrough:
      "Create a regional opportunity checklist with required approvals, partner role, data boundary, local counsel questions, and blocked public claims.",
    retainedBoundary:
      "Do not claim regional compliance approval, public-sector procurement approval, GDPR assurance, NHS/MHRA approval, ISO certification, or production authority.",
    blockedClaims: [
      "regional compliance approval",
      "public-sector procurement approval",
      "GDPR assurance",
      "NHS or MHRA approval"
    ]
  },
  {
    slug: "ai-platform-innovation-leaders",
    priority: "near-term",
    targetAudience: "AI platform, innovation, research, and transformation leaders",
    buyerRole: "Chief AI officer, innovation leader, research director, platform engineering lead, transformation architect",
    competitorPressure: ["Hippocratic AI", "Innovaccer", "Notable", "Microsoft Dragon Copilot"],
    primaryPain:
      "Innovation leaders want agents, model routing, future-proofing, and research velocity, but they need governance that prevents unsafe production autonomy and public hype claims.",
    scrimedCounterPosition:
      "Sell AgentOS, TrustOS, evaluation loops, evidence retrieval, and internal research lanes, including quantum-safe readiness exploration, as governed innovation infrastructure.",
    offerMotion:
      "Platform Power review, continuous review and audit loop, AgentOS evaluation, TrustOS decision demo, and strategic intelligence roadmap.",
    proofRoutes: ["/continuous-review-audit", "/platform-power", "/agent-os", "/trust-os", "/strategic-intelligence"],
    salesMessage:
      "SCRIMED lets innovation teams move quickly on healthcare AI while every agent, claim, model route, and research theme stays reviewable and bounded.",
    conversionTrigger:
      "Buyer asks about agent workforces, model evaluation, model routing, future AI infrastructure, quantum-safe planning, or innovation governance.",
    strategicFollowThrough:
      "Keep future research internal until proof, approval, and security posture are defined; convert approved research into roadmap evidence only after review.",
    retainedBoundary:
      "Do not claim production model-routing approval, public quantum capability, autonomous clinical agents, model-safety certification, or clinical validation.",
    blockedClaims: [
      "production model-routing approval",
      "public quantum capability",
      "autonomous clinical agents",
      "model-safety certification"
    ]
  },
  {
    slug: "patient-access-contact-center-operations",
    priority: "near-term",
    targetAudience: "Patient access, contact center, operations, and throughput leaders",
    buyerRole: "Patient access director, contact center leader, operations VP, throughput leader, service-line administrator",
    competitorPressure: ["Notable", "Commure", "Qventus"],
    primaryPain:
      "Operations buyers want staffing relief, throughput visibility, patient access improvements, and reliable handoffs, but they cannot accept unsafe autonomous outreach or unsupported SLA claims.",
    scrimedCounterPosition:
      "Offer governed operational workflow templates that expose intake, agent suggestions, human approval, exception handling, and service delivery boundaries.",
    offerMotion:
      "Operations workflow demo, service-delivery work order, client onboarding cadence, operational-efficiency bottleneck review, and protected proof packet.",
    proofRoutes: ["/workflows/results", "/service-delivery", "/client-onboarding", "/operational-efficiency"],
    salesMessage:
      "SCRIMED helps operations teams see where work slows down and how governed agents could help, without turning on autonomous patient contact or promising staffing reductions.",
    conversionTrigger:
      "Buyer asks about call-center automation, intake routing, discharge bottlenecks, scheduling friction, or operational throughput.",
    strategicFollowThrough:
      "Build a patient-access operating-loop demo with human approval, exception queue, handoff artifact, and support-capacity boundary.",
    retainedBoundary:
      "Do not claim autonomous patient outreach, staffing reduction assurance, managed 24/7 operations, contractual SLA, or production scheduling integration.",
    blockedClaims: [
      "autonomous patient outreach",
      "unsupported staffing reduction assurance",
      "managed 24/7 operations",
      "contractual SLA"
    ]
  },
  {
    slug: "clinical-governance-quality-safety-committees",
    priority: "immediate",
    targetAudience: "Clinical governance, quality, safety, and risk committees",
    buyerRole: "Clinical governance chair, quality committee, safety officer, risk manager, legal or compliance reviewer",
    competitorPressure: ["Abridge", "Hippocratic AI", "Suki", "SmarterDx", "Microsoft Dragon Copilot"],
    primaryPain:
      "Safety reviewers need proof that AI claims, workflow outputs, evidence attribution, escalation, and incident learning are controlled before pilots become live clinical programs.",
    scrimedCounterPosition:
      "Make TrustOS, QA Claim Guard, continuous review, and clinical production readiness the approval path for every clinical-adjacent claim and workflow.",
    offerMotion:
      "Clinical governance review packet, QA claim guard run, continuous audit loop, TrustOS decision demo, and clinical production task tracker.",
    proofRoutes: ["/qa-claim-guard", "/continuous-review-audit", "/clinical-production-readiness", "/trust-os"],
    salesMessage:
      "SCRIMED is designed to show what it will not do yet, who must approve escalation, and how every clinical-adjacent output is reviewed before authority expands.",
    conversionTrigger:
      "Reviewer asks about patient safety, validation, escalation, incident response, human review, claims control, or clinical governance.",
    strategicFollowThrough:
      "Tie every clinical-facing pilot packet to QA Claim Guard, TrustOS evidence, clinical production readiness tasks, and incident-learning boundaries.",
    retainedBoundary:
      "Do not claim clinical validation complete, diagnostic authority, IRB approval, trial result proof, live clinical authority, or autonomous care.",
    blockedClaims: [
      "clinical validation complete",
      "diagnostic authority",
      "IRB approval",
      "autonomous care"
    ]
  }
];

function unique(values: string[]) {
  return Array.from(new Set(values));
}

export function getCompetitiveMarketIntelligenceSummary() {
  const productSurfaces = unique(competitiveBuildPatterns.flatMap((pattern) => pattern.productSurfaces));
  const agents = unique(competitiveBuildPatterns.flatMap((pattern) => pattern.agents));
  const infrastructureMoves = unique(
    competitiveBuildPatterns.flatMap((pattern) => pattern.infrastructureMoves)
  );
  const proofMetrics = unique(competitiveBuildPatterns.flatMap((pattern) => pattern.proofMetrics));
  const governanceGates = unique(competitiveBuildPatterns.flatMap((pattern) => pattern.governanceGates));
  const blockedClaims = unique(competitiveBuildPatterns.flatMap((pattern) => pattern.blockedClaims));
  const sourceCategories = unique(competitorMarketSources.map((source) => source.category));
  const targetAudienceSegments = unique(
    competitiveTargetAudienceStrategies.map((strategy) => strategy.targetAudience)
  );
  const targetAudienceProofRoutes = unique(
    competitiveTargetAudienceStrategies.flatMap((strategy) => strategy.proofRoutes)
  );
  const targetAudienceBlockedClaims = unique(
    competitiveTargetAudienceStrategies.flatMap((strategy) => strategy.blockedClaims)
  );
  const cleanRoomProductSystems = unique(
    cleanRoomCompetitivePlays.flatMap((play) => play.productSystemsToUpgrade)
  );
  const cleanRoomPublicSources = unique(cleanRoomCompetitivePlays.flatMap((play) => play.publicSources));
  const cleanRoomProofMetrics = unique(cleanRoomCompetitivePlays.map((play) => play.proofMetric));
  const cleanRoomRetainedBoundaries = unique(cleanRoomCompetitivePlays.map((play) => play.retainedBoundary));
  const researchSignalCategories = unique(competitiveResearchSignals.map((signal) => signal.category));

  return {
    service: "scrimed-competitive-market-intelligence",
    status: "competitor-informed-build-map-active",
    route: "/competitive-intelligence",
    apiRoute: "/api/competitive-intelligence",
    reviewedAt: "2026-07-08",
    boundary: competitiveMarketIntelligenceBoundary,
    sourceCount: competitorMarketSources.length,
    sourceCategoryCount: sourceCategories.length,
    researchSignalCount: competitiveResearchSignals.length,
    researchSignalCategoryCount: researchSignalCategories.length,
    cleanRoomPlayCount: cleanRoomCompetitivePlays.length,
    cleanRoomImmediatePlayCount: cleanRoomCompetitivePlays.filter((play) => play.priority === "immediate").length,
    cleanRoomNearTermPlayCount: cleanRoomCompetitivePlays.filter((play) => play.priority === "near-term").length,
    cleanRoomStrategicPlayCount: cleanRoomCompetitivePlays.filter((play) => play.priority === "strategic").length,
    cleanRoomProductSystemCount: cleanRoomProductSystems.length,
    cleanRoomPublicSourceCount: cleanRoomPublicSources.length,
    cleanRoomProofMetricCount: cleanRoomProofMetrics.length,
    patternCount: competitiveBuildPatterns.length,
    initiativeCount: competitiveInitiatives.length,
    targetAudienceStrategyCount: competitiveTargetAudienceStrategies.length,
    targetAudienceSegmentCount: targetAudienceSegments.length,
    targetAudienceProofRouteCount: targetAudienceProofRoutes.length,
    targetAudienceBlockedClaimCount: targetAudienceBlockedClaims.length,
    immediateTargetAudienceStrategyCount: competitiveTargetAudienceStrategies.filter(
      (strategy) => strategy.priority === "immediate"
    ).length,
    nearTermTargetAudienceStrategyCount: competitiveTargetAudienceStrategies.filter(
      (strategy) => strategy.priority === "near-term"
    ).length,
    protectedTargetAudienceStrategyCount: competitiveTargetAudienceStrategies.filter(
      (strategy) => strategy.priority === "protected"
    ).length,
    implementedInitiativeCount: competitiveInitiatives.filter(
      (initiative) => initiative.status === "implemented"
    ).length,
    packageNextInitiativeCount: competitiveInitiatives.filter(
      (initiative) => initiative.status === "package-next"
    ).length,
    protectedGatedInitiativeCount: competitiveInitiatives.filter(
      (initiative) => initiative.status === "protected-gated"
    ).length,
    externalReviewInitiativeCount: competitiveInitiatives.filter(
      (initiative) => initiative.status === "external-review-required"
    ).length,
    productSurfaceCount: productSurfaces.length,
    agentCount: agents.length,
    infrastructureMoveCount: infrastructureMoves.length,
    proofMetricCount: proofMetrics.length,
    governanceGateCount: governanceGates.length,
    blockedClaimCount: blockedClaims.length,
    sourceCategories,
    researchSignalCategories,
    productSurfaces,
    agents,
    infrastructureMoves,
    proofMetrics,
    governanceGates,
    blockedClaims,
    targetAudienceSegments,
    targetAudienceProofRoutes,
    targetAudienceBlockedClaims,
    cleanRoomProductSystems,
    cleanRoomPublicSources,
    cleanRoomProofMetrics,
    cleanRoomRetainedBoundaries,
    sources: competitorMarketSources,
    researchSignals: competitiveResearchSignals,
    cleanRoomPlays: cleanRoomCompetitivePlays,
    patterns: competitiveBuildPatterns,
    initiatives: competitiveInitiatives,
    targetAudienceStrategies: competitiveTargetAudienceStrategies,
    nextBuildStep:
      "Package the executive assessment, specialty bake-off scorecard, connector trust catalog, PayerIQ evidence demo, clinic starter packet, and investor/global proof packets as audience-specific conversion routes."
  };
}
