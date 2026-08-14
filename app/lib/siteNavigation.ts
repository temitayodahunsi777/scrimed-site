export type SiteNavigationLink = {
  label: string;
  href: string;
  description: string;
  boundary?: string;
};

export type SiteNavigationSection = {
  label: string;
  intent: string;
  links: SiteNavigationLink[];
};

export type SiteNavigationJourney = {
  audience: string;
  start: string;
  route: string;
  sequence: string[];
  outcome: string;
  limitationRoute: string;
  boundary: string;
};

export const siteNavigationPrimaryLinks: SiteNavigationLink[] = [
  {
    label: "Validation and Evidence",
    href: "/validation-evidence",
    description: "Current technical evidence, governance methods, pilot methodology, limitations, and product status.",
    boundary: "Synthetic and methodological evidence only; not clinical validation, certification, customer proof, or production authorization."
  },
  {
    label: "Legal and Policy Center",
    href: "/legal",
    description: "Interim privacy, terms, cookie, accessibility, refund, healthcare, and AI policies.",
    boundary: "Interim policy drafts require qualified legal review before commercial healthcare deployment."
  },
  {
    label: "Demos",
    href: "/demos",
    description: "Public no-PHI product demos for healthcare workflow buyers."
  },
  {
    label: "Pilots",
    href: "/pilots",
    description: "Packaged assessment, synthetic pilot, protected pilot, and governance paths."
  },
  {
    label: "Demo to Pilot",
    href: "/pilot-demo-commercial-readiness",
    description: "Seamless demo-to-pilot path with market-aligned pricing, proof assets, no-PHI intake, and margin-safe hard stops.",
    boundary: "Commercial readiness only; not a signed quote, contract, procurement approval, ROI guarantee, revenue guarantee, PHI authority, production connector approval, or live clinical authority."
  },
  {
    label: "Pricing",
    href: "/pricing",
    description: "Market-aligned assessment, pilot, enterprise-license, and strategic partnership ranges."
  },
  {
    label: "Offerings",
    href: "/offerings",
    description: "Packaged offers, delivery paths, margin controls, and retained boundaries."
  },
  {
    label: "Request Pilot",
    href: "/pilot",
    description: "Governed synthetic pilot request intake."
  },
  {
    label: "Investors",
    href: "/investor-audience-readiness",
    description: "Weakness relief, competitive edge, sellable value, and audience-specific investor and clinic packets.",
    boundary: "Readiness only; not investment advice, securities material, solicitation, valuation assurance, legal advice, tax advice, donor advice, or approval."
  },
  {
    label: "Investor Demo Command",
    href: "/investor-demo-command-room",
    description: "Timed investor presentation control with proof-route preflight, chapter progress, human confirmations, and an internal rehearsal receipt.",
    boundary: "Synthetic operator rehearsal only; not securities material, solicitation, external-send authority, independent approval, PHI authority, clinical authority, production release, or customer go-live."
  },
  {
    label: "Investor Command",
    href: "/investor-readiness",
    description: "Enterprise diligence snapshot for deployment, smoke, safety, PHI, clinical, evidence, model, integration, risk, product, and no-go readiness.",
    boundary: "Diligence readiness only; not investment advice, securities material, audited financial reporting, certification, clinical validation, PHI authority, production connector approval, or customer go-live approval."
  },
  {
    label: "Acceleration",
    href: "/scrimed-enterprise-acceleration",
    description: "Enterprise acceleration command for systems, agents, UI, performance, validity, investor confidence, sales demos, revenue, and pitch readiness.",
    boundary: "Synthetic strategy and operating control only; not PHI authority, autonomous clinical authority, payer submission, EHR writeback, production deploy claim, certification claim, investment advice, or customer go-live."
  },
  {
    label: "Market Execution",
    href: "/scrimed-market-execution",
    description: "Clean-room market execution engine for competitor-informed product packaging, proof artifacts, sales motions, revenue levers, privacy controls, PR language, and investor narratives.",
    boundary: "Synthetic business and market metadata only; not PHI authority, autonomous clinical authority, payer submission, EHR writeback, production connector approval, certification claim, investment advice, competitor proprietary copying, revenue guarantee, valuation assurance, or customer go-live."
  },
  {
    label: "Infra Readiness",
    href: "/enterprise-healthcare-infrastructure",
    description: "Hospital IT infrastructure readiness across HL7/FHIR, DICOM/PACS/RIS/HIS, ADT, X12, integration engines, VPN, VMs, databases, firewalls, and governed agents.",
    boundary: "Synthetic infrastructure readiness only; not PHI authority, live connector approval, EHR writeback, payer submission, final imaging interpretation, certification claim, competitor proprietary copying, or customer go-live."
  },
  {
    label: "Focus Engine",
    href: "/scrimed-execution-focus",
    description: "Ranked execution queue for proof routes, buyer conversion, investor confidence, trust controls, operating hygiene, and retained approval boundaries.",
    boundary: "Synthetic prioritization metadata only; not PHI authority, clinical authority, payer submission, EHR writeback, production connector approval, certification claim, investment advice, revenue guarantee, or customer go-live."
  },
  {
    label: "Strategic Problem Resolution",
    href: "/strategic-problem-resolution",
    description: "owner-bound execution layer for root-cause problem solving, safe workarounds, proof routes, and retained authority gates.",
    boundary: "Metadata-only strategic control; not PHI authority, clinical authority, payer submission, EHR writeback, production deploy approval, legal approval, certification claim, valuation assurance, revenue guarantee, or customer go-live."
  },
  {
    label: "Healthcare Optimization",
    href: "/healthcare-optimization-command",
    description: "Synthetic command layer for clinical workflow optimization, patient engagement analysis, hospital operations, agent capability growth, innovation intake, and interoperable solution packaging.",
    boundary: "Synthetic healthcare optimization only; not PHI authority, autonomous clinical care, patient outreach approval, payer submission, EHR writeback, final imaging interpretation, production connector approval, certification claim, valuation assurance, revenue guarantee, or customer go-live."
  },
  {
    label: "Value Realization",
    href: "/healthcare-value-realization",
    description: "Synthetic healthcare value realization engine for buyer outcome evidence, pilot proof packages, risk controls, and investor confidence.",
    boundary: "Measurement framework only; not PHI authority, autonomous clinical care, audited financial reporting, ROI guarantee, revenue guarantee, payer submission, EHR writeback, production connector approval, certification claim, valuation assurance, or customer go-live."
  },
  {
    label: "Pilot Value Evidence",
    href: "/pilot-value-evidence",
    description: "Synthetic pilot evidence packets with acceptance criteria, reviewer checkpoints, audit hashes, claim controls, and buyer-ready proof.",
    boundary: "Synthetic pilot packet evidence only; not PHI authority, autonomous clinical care, audited financial reporting, ROI guarantee, revenue guarantee, binding commercial offer, payer submission, EHR writeback, production connector approval, certification claim, valuation assurance, or customer go-live."
  },
  {
    label: "Pilot Activation",
    href: "/pilot-activation-planner",
    description: "Review-gated activation planner for review-gated activation plans that turn pilot evidence into scoped owner handoffs, blocker workarounds, and safe buyer next steps.",
    boundary: "Synthetic activation planning only; not PHI authority, autonomous clinical care, patient outreach approval, payer submission, EHR writeback, production deployment, customer activation, certification claim, binding commercial offer, legal approval, ROI guarantee, revenue guarantee, or valuation assurance."
  },
  {
    label: "Pilot Handoff",
    href: "/pilot-handoff-command",
    description: "Human-reviewed handoff command for human-reviewed handoff packets that turn activation plans into buyer, security, clinical, implementation, RCM, and investor packet drafts with hard stops.",
    boundary: "Synthetic handoff preparation only; not external-send authority, PHI authority, patient outreach approval, autonomous clinical care, payer submission, EHR writeback, production deployment, customer activation, certification claim, binding commercial offer, ROI guarantee, revenue guarantee, or valuation assurance."
  },
  {
    label: "Pilot Success Review",
    href: "/pilot-success-review-command",
    description: "claims-safe success review command for 30/60/90-day reviews, evidence gaps, expansion readiness, and buyer or investor follow-up.",
    boundary: "Synthetic success review planning only; not PHI authority, autonomous clinical care, patient outreach approval, payer submission, EHR writeback, production deployment, customer activation, audited financial reporting, certification claim, binding commercial offer, ROI guarantee, revenue guarantee, or valuation assurance."
  },
  {
    label: "Deployment Drift",
    href: "/deployment-drift-guard",
    description: "No-secret release guard that detects stale deployments before SCRIMED uses public routes as buyer, investor, or operator proof.",
    boundary: "Route alignment evidence only; not deploy authority, commit authority, migration authority, PHI authority, clinical authority, certification, or customer go-live."
  },
  {
    label: "Governance Loop",
    href: "/scrimed-governance-learning-loop",
    description: "Governance, learning-loop, contextual policy, A2A/MCP, AI visibility, value pricing, regulatory watch, radiology workflow, wearables, and skills activation control plane.",
    boundary: "Synthetic governance and learning control only; not PHI authority, autonomous clinical action, payer submission, EHR writeback, final imaging interpretation, certification claim, production connector approval, or customer go-live."
  },
  {
    label: "Guided Execution",
    href: "/scrimed-guided-execution",
    description: "Audience-specific paths that map buyers, investors, clinics, pilots, partners, and operators to demos, proof routes, pricing motions, and safe next actions.",
    boundary: "Synthetic guidance only; not PHI authority, autonomous clinical authority, payer submission, EHR writeback, production connector approval, certification claim, investment advice, or customer go-live."
  },
  {
    label: "Proof Packets",
    href: "/scrimed-proof-packet-studio",
    description: "Audience-specific proof packet studio for investor pitch, buyer demo, pilot scope, partner implementation, and internal execution packets.",
    boundary: "Synthetic proof packaging only; not PHI authority, autonomous clinical authority, payer submission, EHR writeback, production connector approval, certification claim, investment advice, revenue guarantee, or customer go-live."
  },
  {
    label: "Cyber Defense",
    href: "/scrimed-cyber-defense",
    description: "Security operating control plane for browser hardening, proxy sanitization, protected-route monitoring, token redaction, and incident readiness.",
    boundary: "Synthetic/no-PHI security readiness only; not security certification, breach guarantee, PHI authority, production connector approval, or customer go-live."
  },
  {
    label: "Trust",
    href: "/trust-center",
    description: "Enterprise readiness, evidence, claims controls, and diligence gates."
  },
  {
    label: "Product",
    href: "/product",
    description: "Product Console, offers, agents, proof stack, and buyer actions."
  },
  {
    label: "Ops Command",
    href: "/scrimed-operating-command",
    description: "Operating command center for systems, agents, infrastructure, workflows, services, products, UI, and interface execution.",
    boundary: "Synthetic metadata only; not PHI authority, autonomous clinical action, payer submission, EHR writeback, production connector approval, certification, or customer go-live."
  },
  {
    label: "SCRIMED Work",
    href: "/scrimed-work",
    description: "Unified work-session control plane for governed long-running healthcare work, model and tool routing, context, verification, artifacts, schedules, voice simulation, and value telemetry.",
    boundary: "Synthetic/no-PHI work intelligence only; not autonomous clinical care, patient outreach, payer submission, EHR writeback, external model authorization, production connector approval, certification, or customer go-live."
  },
  {
    label: "Clinical Assurance",
    href: "/clinical-assurance-control-plane",
    description: "CAL, sovereign enclave, model passport, capacity, concentration, kill-switch, worst-cell evidence, and independent-failover control plane.",
    boundary: "Internal synthetic assurance controls only; not an external certification, live-PHI authorization, clinical authority, payer submission, EHR writeback, production connector approval, or customer go-live."
  },
  {
    label: "Intelligence Control Plane",
    href: "/scrimed-control-plane",
    description: "Executive mission control for governed agents, skills, workflows, context, routing, verification, ConsequenceBench, capital intelligence, compute resilience, learning, outcomes, and audit evidence.",
    boundary: "Synthetic/de-identified metadata only; consequential actions, investor outreach, clinical authority, payer submission, EHR writeback, production deployment, certification, and customer activation remain blocked."
  },
  {
    label: "p.33 Integrated Upgrades",
    href: "/scrimed-p33",
    description: "Shared clinical context, signal compression, decision evidence, regulatory labels, oversight drift, portable agents, trajectory evaluation, opportunity workflows, and pilot gates.",
    boundary: "Synthetic/no-PHI decision support only; no autonomous clinical care, provider calls, payer submission, EHR writeback, PHI-capable pilot, Linux local-agent pilot, production promotion, or external distribution."
  },
  {
    label: "Automation Autopilot",
    href: "/scrimed-automation-autopilot",
    description: "Automation control plane for autonomy scoring, approval routing, bottleneck workarounds, and review-gated service execution.",
    boundary: "Synthetic/no-PHI recommendations only; not autonomous clinical care, production remediation, patient outreach, payer submission, EHR writeback, certification, revenue guarantee, SLA, or customer go-live."
  },
  {
    label: "Omega Audit",
    href: "/omega-audit",
    description: "Complete product, module, API, agent, workflow, UI, backend, infrastructure, safety, and upgrade audit.",
    boundary: "Readiness control only; not PHI authority, live clinical authority, certification, production connector approval, public SLA, or buyer release."
  },
  {
    label: "Robustness Lab",
    href: "/clinical-robustness-lab",
    description: "No-PHI adversarial clinical readiness lab for missing data, conflicting data, wrong units, noisy notes, multilingual notes, and hallucination risk.",
    boundary: "Synthetic evaluation only; not clinical validation, PHI authority, diagnosis, treatment, triage, EHR writeback, certification, or live clinical approval."
  },
  {
    label: "Architecture",
    href: "/production-architecture",
    description: "Production-grade agent, context, trust, model routing, evaluation, ClinSecOps, and workflow architecture.",
    boundary: "Architecture contract only; not PHI authority, production model-routing approval, certification, clinical production approval, or autonomous clinical authority."
  },
  {
    label: "SCRIMED OS",
    href: "/scrimed-os",
    description: "Healthcare Intelligence Operating System implementation plan across event mesh, identities, MCP, CodeMode, registries, clinical workflows, observability, and deployment.",
    boundary: "Implementation plan only; not PHI authority, live clinical authority, production connector approval, infrastructure mutation, certification, clinical validation, or customer go-live."
  },
  {
    label: "Intelligence Platform",
    href: "/scrimed-intelligence-platform",
    description: "Synthetic-only intelligence mesh, clinical memory graph, provenance, flight recorder, evaluation, model routing, and outcome KPI control surface.",
    boundary: "Synthetic metadata only; not PHI authority, live clinical authority, external model approval, payer submission, EHR writeback, certification, or customer go-live."
  },
  {
    label: "Safety Stack",
    href: "/scrimed-intelligence-safety-stack",
    description: "Project SENTINEL, AI Flight Recorder, clinical correctness safeguards, data adapters, outcomes, orchestration, and compliance guardrails.",
    boundary: "Synthetic metadata only; not PHI authority, irreversible action authority, clinical authority, payer submission, EHR writeback, production deploy, certification, or customer go-live."
  },
  {
    label: "Modules",
    href: "/scrimed-modules",
    description: "SCRIMED module registry for ClinicalBench, Evidence Graph, Trust Score, Continuous Evaluation, memory, and multi-agent/multi-model systems.",
    boundary: "No-PHI module architecture only; not live clinical authority, PHI authority, production connector approval, certification, clinical validation, or customer go-live."
  },
  {
    label: "TrustOps",
    href: "/scrimed-trustops",
    description: "Synthetic TrustOps Intelligence Layer for module governance, scoring, signal detection, semantic intelligence, and recommendation-only remediation.",
    boundary: "Synthetic governance only; not live PHI, autonomous clinical action, patient outreach, payer submission, billing submission, EHR writeback, production connector use, certification, or clinical validation."
  },
  {
    label: "Build Roadmap",
    href: "/scrimed-build-roadmap",
    description: "No-PHI roadmap for LLM interface boundaries, world models, ontology, semantic graph, decision memory, context injection, workforce, resource, and benchmark layers.",
    boundary: "Roadmap planning only; not PHI authority, autonomous clinical action, patient outreach, payer submission, billing submission, EHR writeback, production connector approval, certification, clinical validation, or customer go-live."
  },
  {
    label: "Upgrade Plan",
    href: "/scrimed-upgrade-implementation-plan",
    description: "Newest implementation plan for secure agent runtime, contextual policy, observability, clinical evals, routing, knowledge, workflows, DevSecOps, edge AI, and strategy.",
    boundary: "Synthetic architecture only; not PHI authority, autonomous clinical action, payer submission, EHR writeback, production deploy, certification, clinical validation, or customer go-live."
  },
  {
    label: "Delivery",
    href: "/service-delivery",
    description: "Scoped work orders, acceptance criteria, buyer handoffs, delivery artifacts, margin protections, and authority gates.",
    boundary: "Execution control only; not a statement of work, contract approval, SLA, PHI authority, production connector approval, customer permission, revenue guarantee, profit guarantee, or live clinical authority."
  },
  {
    label: "Company",
    href: "/company-assessment",
    description: "Whole-company assessment across product, revenue, margin, approvals, cybersecurity, AI, health-record safety, investors, launch, operations, and proof routes.",
    boundary: "Operating assessment only; not legal advice, audited financial reporting, investment advice, securities material, certification, security assurance, PHI authority, launch approval, revenue guarantee, profit guarantee, or live clinical authority."
  },
  {
    label: "Onboarding",
    href: "/client-onboarding",
    description: "Client onboarding, demos, pilots, meetings, decks, email, and calendar-ready controls."
  },
  {
    label: "Clinical Production",
    href: "/clinical-production-readiness",
    description: "Tracked task ledger for the work required before PHI, live care, production connectors, clinical AI, customer go-live, and global clinical deployment.",
    boundary: "Task tracking only; not legal advice, medical advice, regulatory approval, HIPAA compliance, security certification, PHI authority, connector approval, customer permission, launch approval, or live clinical authority."
  },
  {
    label: "Limitations",
    href: "/boundary-resolution",
    description: "Central boundary register for what SCRIMED cannot claim or do yet.",
    boundary: "Limitation control only; not approval, certification, PHI authority, or clinical authority."
  },
  {
    label: "Approval Matrix",
    href: "/boundary-release-approvals",
    description: "Fail-closed approval path for relieving preserved SCRIMED boundaries.",
    boundary: "Approval-path documentation only; not PHI authority, clinical authority, payer submission, EHR writeback, production connector approval, certification claim, or customer go-live approval."
  }
];

export const siteNavigationSections: SiteNavigationSection[] = [
  {
    label: "Command",
    intent: "Fastest path into the operating surfaces used by founders, buyers, and reviewers.",
    links: [
      { label: "Company Assessment", href: "/company-assessment", description: "Whole-company score, strengths, weakness relief, workstreams, team lanes, and hard stops." },
      { label: "Clinical Production Readiness", href: "/clinical-production-readiness", description: "Required task ledger, current capability motions, go-live gates, hard stops, and source references for future clinical production." },
      { label: "Pilot Demo Accelerator", href: "/pilot-demo-commercial-readiness", description: "Market-aligned demo, pilot, pricing, proof, no-PHI intake, and margin-protection command surface." },
      { label: "Product Console", href: "/product", description: "Offers, workflows, proof stack, and buyer actions." },
      { label: "Omega Audit", href: "/omega-audit", description: "Complete platform product audit, 12-lens checks, upgrade lanes, and hard stops." },
      { label: "Clinical Robustness Lab", href: "/clinical-robustness-lab", description: "Adversarial no-PHI clinical readiness scorecards for SCRIMED agents and clinical products." },
      { label: "Launch Readiness", href: "/launch-readiness", description: "Strict production-domain gate, sandbox DNS workaround, launch tracks, service paths, and hard stops." },
      { label: "Competitive Defense", href: "/competitive-defense", description: "Competitor pressure, weakness relief, legal/privacy/cyber hardening, and infiltration-deterrence controls." },
      { label: "Platform Power", href: "/platform-power", description: "API, UI, and AI platform-power control plane." },
      { label: "Production Architecture", href: "/production-architecture", description: "Agent runtime, context engine, Trust Engine v2, model router, evals, ClinSecOps, and workflow controls." },
      { label: "SCRIMED OS Plan", href: "/scrimed-os", description: "Implementation roadmap for event mesh, agent identity, MCP, CodeMode, registries, clinical orchestration, observability, IaC, Kubernetes, and safety sandbox." },
      { label: "Intelligence Platform", href: "/scrimed-intelligence-platform", description: "Governed intelligence mesh, memory graph, provenance, flight recorder, evaluation pipeline, synthetic patient studio, outcome KPIs, and model-router foundation." },
      { label: "Intelligence Safety Stack", href: "/scrimed-intelligence-safety-stack", description: "Project SENTINEL zero-trust agent execution, AI Flight Recorder, clinical correctness envelopes, data adapters, outcomes, orchestration state, and compliance safeguards." },
      { label: "SCRIMED Modules", href: "/scrimed-modules", description: "Canonical registry for ClinicalBench, Evidence Graph, Trust Score, Continuous Evaluation, memory, multi-agent runtime, and multi-model routing." },
      { label: "TrustOps Intelligence", href: "/scrimed-trustops", description: "Synthetic signal detection, module scoring, governance checks, semantic intelligence, and recommendation-only self-healing workflows." },
      { label: "Build Roadmap", href: "/scrimed-build-roadmap", description: "LLM interface boundaries, world models, semantic graph, decision memory, dynamic context injection, workforce/resource intelligence, and benchmark layers." },
      { label: "Upgrade Implementation Plan", href: "/scrimed-upgrade-implementation-plan", description: "Secure runtime, contextual policies, observability, clinical evals, routing, knowledge compounding, DevSecOps, edge AI, and workflow automation." },
      { label: "Agent Governance", href: "/scrimed-agent-governance", description: "CODE pt. 4 contextual policy, agent identity, session-state risk, approval, and allow/deny/review control plane." },
      { label: "Reasoning Stability", href: "/scrimed-reasoning-stability", description: "CODE pt. 4 loop, repetition, consistency, hallucination-risk, retry, confidence, and safety-status layer." },
      { label: "Clinical Benchmark Suite", href: "/scrimed-clinical-benchmark-suite", description: "CODE pt. 4 synthetic clinical, administrative, specialty, interoperability, research, and compliance benchmark registry." },
      { label: "Hybrid Retrieval", href: "/scrimed-hybrid-retrieval", description: "CODE pt. 4 evidence-first retrieval with BM25, vector, ontology, graph, citation, and source-trust ranking metadata." },
      { label: "LLMOps Observability", href: "/scrimed-llmops-observability", description: "CODE pt. 4 synthetic trace, model, cost, token, safety, policy, benchmark, rollback, and readiness telemetry." },
      { label: "AI Infrastructure Watchtower", href: "/scrimed-ai-infrastructure-watchtower", description: "CODE pt. 4 strategic infrastructure watch across chips, local models, regulations, energy, cybersecurity, funding, imaging, and drug discovery." },
      { label: "Patient Context Gateway", href: "/scrimed-patient-context-gateway", description: "CODE pt. 4 no-PHI patient story continuity, provenance, HIE concept, FHIR abstraction, consent, and no-writeback gateway." },
      { label: "Operating Command", href: "/scrimed-operating-command", description: "Owner-bound operating lanes for systems, agents, infrastructure, workflows, products, services, UI, KPIs, proof routes, and retained gates." },
      { label: "SCRIMED Work", href: "/scrimed-work", description: "Governed work-session platform for Definition of Done, agents, model routing, context, verification, artifacts, schedules, voice simulation, audit, rollback, and value telemetry." },
      { label: "Clinical Assurance", href: "/clinical-assurance-control-plane", description: "Inspect CAL resolution, sovereign enclaves, exact model passports, capacity and concentration admission, kill switches, worst-cell evidence, and independent fallback." },
      { label: "PayerIQ Workbench", href: "/documentation-before-authorization", description: "Interactive synthetic documentation completeness, evidence-gap, reviewer-queue, and no-submission workflow for prior-authorization teams." },
      { label: "Intelligence Control Plane", href: "/scrimed-control-plane", description: "Unified executive control plane for agent, skill, workflow, context, model, benchmark, capital, compute, outcome, and audit governance." },
      { label: "Automation Autopilot", href: "/scrimed-automation-autopilot", description: "Automation control for safe autonomy modes, human approval gates, bottleneck workarounds, proof routes, and no-production-authority decisions." },
      { label: "Workarounds", href: "/limitations-workarounds", description: "Safe alternatives for blocked issues, hard limits, and retained gates." },
      { label: "Service Delivery", href: "/service-delivery", description: "Scoped work orders, artifacts, acceptance criteria, and delivery gates." },
      { label: "Investor Readiness", href: "/investor-audience-readiness", description: "Weakness relief, moat, sellable value, and audience-specific capital or clinic packets." },
      { label: "Investor Demo Command", href: "/investor-demo-command-room", description: "Preflight proof routes, hold the timebox, advance the guided story, and retain a no-PII internal rehearsal receipt." },
      { label: "Investor Command", href: "/investor-readiness", description: "Enterprise diligence snapshot, readiness evidence, no-go boundaries, model/router status, risk register, and product readiness." },
      { label: "Enterprise Acceleration", href: "/scrimed-enterprise-acceleration", description: "Strategic command for systems, agents, UI, performance, validity, revenue motions, demo assets, sales pitch, and investor confidence." },
      { label: "Market Execution", href: "/scrimed-market-execution", description: "Clean-room market execution lanes that turn competitor research into sales motions, revenue levers, proof artifacts, privacy controls, PR language, and investor narratives." },
      { label: "Global Enterprise Command", href: "/global-enterprise-command", description: "international enterprise readiness command for global sales, localization, interoperability, communication, partner qualification, and retained approval gates." },
      { label: "Infrastructure Readiness", href: "/enterprise-healthcare-infrastructure", description: "Hospital IT readiness across HL7/FHIR, DICOM/PACS/RIS/HIS, ADT, X12, integration engines, VPNs, VMs, databases, firewalls, and governed agents." },
      { label: "Value Realization", href: "/healthcare-value-realization", description: "Turn optimization lanes into buyer-ready outcome evidence, pilot proof packages, risk controls, and no-ROI-guarantee value metrics." },
      { label: "Pilot Value Evidence", href: "/pilot-value-evidence", description: "Package buyer-ready evidence artifacts, acceptance criteria, reviewer gates, and claim controls before external sharing." },
      { label: "Pilot Activation", href: "/pilot-activation-planner", description: "Convert selected evidence packets into scoped activation plans, owner handoffs, blocker workarounds, and review gates." },
      { label: "Pilot Handoff", href: "/pilot-handoff-command", description: "Convert activation plans into human-reviewed buyer, security, implementation, RCM, clinical, and investor handoff packets." },
      { label: "Pilot Success Review", href: "/pilot-success-review-command", description: "Convert handoff packets into 30/60/90-day review plans, evidence gaps, expansion readiness, and claims-safe follow-up." },
      { label: "Execution Focus", href: "/scrimed-execution-focus", description: "Ranked now/next/blocked operating queue for proof routes, buyer conversion, trust evidence, investor readiness, and retained boundaries." },
      { label: "Deployment Drift", href: "/deployment-drift-guard", description: "No-secret route-alignment guard for catching stale deployments before buyer, investor, or operator promotion." },
      { label: "Governance Learning Loop", href: "/scrimed-governance-learning-loop", description: "Governance-as-moat loop for memory, learning, policy, A2A/MCP, AI visibility, value pricing, regulatory watch, and activated skills." },
      { label: "Guided Execution", href: "/scrimed-guided-execution", description: "Audience-specific execution paths for buyers, investors, pilots, partners, clinics, and internal operators." },
      { label: "Proof Packet Studio", href: "/scrimed-proof-packet-studio", description: "Package investor, buyer, pilot, partner, and internal execution narratives with route-backed proof, owners, pricing motions, and retained boundaries." },
      { label: "Cyber Defense", href: "/scrimed-cyber-defense", description: "Security controls, proxy sanitization, incident lanes, token protection, and residual-risk tracking for diligence." },
      { label: "OS Hub", href: "/hub", description: "Whole-platform route index and operating signals." },
      { label: "Navigation Audit", href: "/navigation", description: "Route inventory, smoke coverage, and navigation bottlenecks." },
      { label: "Operational Efficiency", href: "/operational-efficiency", description: "Cross-system gaps, bottlenecks, hard stops, and resolution sprints." }
    ]
  },
  {
    label: "Buy",
    intent: "Move from public interest to demo, pricing, diligence, and governed pilot intake.",
    links: [
      { label: "Company Assessment", href: "/company-assessment", description: "Company posture, proof routes, risks, buyer-safe strengths, and retained boundaries." },
      { label: "Clinical Production Readiness", href: "/clinical-production-readiness", description: "Separate current sellable no-PHI motions from future clinical-production requirements." },
      { label: "Pilot Demo Accelerator", href: "/pilot-demo-commercial-readiness", description: "Turn every demo into one pilot recommendation, price band, proof packet, and intake route." },
      { label: "Guided Execution", href: "/scrimed-guided-execution", description: "Map buyer or investor intent to the right demo sequence, proof route, pricing motion, and human next step." },
      { label: "Proof Packet Studio", href: "/scrimed-proof-packet-studio", description: "Create the buyer or investor packet that ties narrative, demo path, proof evidence, pricing motion, acceptance criteria, and follow-up action together." },
      { label: "Offerings", href: "/offerings", description: "Sellable packages, proof routes, margin controls, and delivery boundaries." },
      { label: "Service Delivery", href: "/service-delivery", description: "Convert selected offers into scoped work orders, artifacts, acceptance criteria, and buyer handoffs." },
      { label: "Production Architecture", href: "/production-architecture", description: "Show buyers SCRIMED's governed runtime, trust, model routing, eval, and workflow control posture." },
      { label: "Infrastructure Readiness", href: "/enterprise-healthcare-infrastructure", description: "Show how SCRIMED understands hospital IT, interoperability, imaging, payer, network, compute, and data boundaries before live systems." },
      { label: "Value Realization", href: "/healthcare-value-realization", description: "Show measurable synthetic outcome evidence, pilot value packages, and risk controls without ROI or revenue guarantees." },
      { label: "Pilot Value Evidence", href: "/pilot-value-evidence", description: "Show packetized pilot evidence, acceptance criteria, review gates, and safe next commercial actions." },
      { label: "Pilot Activation", href: "/pilot-activation-planner", description: "Show how packetized evidence becomes a scoped, review-gated pilot activation path without granting live authority." },
      { label: "Pilot Handoff", href: "/pilot-handoff-command", description: "Show how activation plans become reviewed handoff packets before any buyer-facing send or live authority." },
      { label: "Pilot Success Review", href: "/pilot-success-review-command", description: "Show how reviewed handoffs become success-review plans, evidence-gap controls, and safe expansion recommendations." },
      { label: "Cyber Defense", href: "/scrimed-cyber-defense", description: "Show security readiness, hardening controls, protected-route boundaries, and incident response posture without certification claims." },
      { label: "Launch Readiness", href: "/launch-readiness", description: "Buyer-facing launch path, branded-domain verification, service readiness, and fallback posture." },
      { label: "Onboarding", href: "/client-onboarding", description: "Human-reviewed email, calendar, demo, pilot, deck, meeting, and handoff path." },
      { label: "Demos", href: "/demos", description: "Executable governed product demos." },
      { label: "PayerIQ Workbench", href: "/documentation-before-authorization", description: "Run the no-PHI documentation-before-authorization product and inspect its governed pilot path." },
      { label: "Programs", href: "/pilots", description: "Structured enterprise pilot programs." },
      { label: "Pricing", href: "/pricing", description: "Enterprise tiers, sales motion, and commercial guardrails." },
      { label: "Deal Room", href: "/pilot-deal-room", description: "Buyer path from proof to activation." },
      { label: "Market Intelligence", href: "/competitive-intelligence", description: "Competitor-informed build paths, target-audience plays, proof routes, and no-copy guardrails." },
      { label: "Competitive Defense", href: "/competitive-defense", description: "Claims-safe competitor counter-positioning, legal/privacy/cyber gates, and hard stops." },
      { label: "Investor Readiness", href: "/investor-audience-readiness", description: "Audience-ready value packets for angels, strategics, private investors, clinics, and partners." },
      { label: "Global Enterprise Command", href: "/global-enterprise-command", description: "Show international buyers the region, sales, interoperability, communication, and proof route map without claiming local approval." },
      { label: "Request Pilot", href: "/pilot", description: "Validated buyer intake with no-PHI boundary." }
    ]
  },
  {
    label: "Trust",
    intent: "Keep claims, approvals, certifications, global readiness, and clinical authority boundaries visible.",
    links: [
      { label: "Company Assessment", href: "/company-assessment", description: "Top-level operating boundary across legal, finance, security, clinical, product, and launch readiness." },
      { label: "Clinical Production Readiness", href: "/clinical-production-readiness", description: "Task ledger for PHI, clinical safety, FDA/CDS/SaMD, HIPAA, ONC, security assurance, global privacy, support, and go-live gates." },
      { label: "Pilot Demo Accelerator", href: "/pilot-demo-commercial-readiness", description: "Protect commercial claims, price floors, market comparisons, and pilot-package boundaries." },
      { label: "Trust Center", href: "/trust-center", description: "Enterprise readiness, owners, evidence, and launch gates." },
      { label: "TrustOps Intelligence", href: "/scrimed-trustops", description: "Synthetic TrustOps governance, module scoring, signal detection, validation, and remediation recommendations." },
      { label: "Governance Learning Loop", href: "/scrimed-governance-learning-loop", description: "Memory-versus-learning, contextual policy, audit, regulatory watch, value pricing, and human-review learning loop." },
      { label: "Proof Packet Studio", href: "/scrimed-proof-packet-studio", description: "Keep investor, buyer, pilot, partner, and internal proof packets claims-safe, no-PHI, and review-ready." },
      { label: "Cyber Defense", href: "/scrimed-cyber-defense", description: "Browser hardening, request sanitization, token redaction, protected-route monitoring, incident readiness, and residual-risk controls." },
      { label: "Infrastructure Readiness", href: "/enterprise-healthcare-infrastructure", description: "Infrastructure, connector, DICOM/PACS/RIS/HIS, HL7/FHIR, X12, network, and database boundaries for enterprise review." },
      { label: "Launch Readiness", href: "/launch-readiness", description: "Launch hard stops, no-authority headers, DNS fallback boundary, and qualified-review gates." },
      { label: "Competitive Defense", href: "/competitive-defense", description: "Legal, privacy, cyber, no-copy, no-PHI, no-certification, and no-attack-guarantee boundaries." },
      { label: "Production Architecture", href: "/production-architecture", description: "No-PHI architecture contract for agents, context, trust, model routing, evals, ClinSecOps, and workflows." },
      { label: "Omega Audit", href: "/omega-audit", description: "Whole-platform audit across products, modules, agents, workflows, APIs, UI, backend, infrastructure, and compliance." },
      { label: "Clinical Robustness Lab", href: "/clinical-robustness-lab", description: "Adversarial synthetic clinical evaluation coverage, reviewer queues, and no-authority gates." },
      { label: "Risk Register", href: "/risk-register", description: "Enterprise risk register across PHI/privacy, clinical safety, model, bias, cybersecurity, vendor, cost, audit, EHR, payer, and deployment risk." },
      { label: "Claims", href: "/claims", description: "Approved, evidence-required, and prohibited claims." },
      { label: "Limitations", href: "/boundary-resolution", description: "Central boundary register and safe workarounds." },
      { label: "Approval Matrix", href: "/boundary-release-approvals", description: "Boundary-release approval path, required evidence, signoff lanes, safe workarounds, and fail-closed release decisions." },
      { label: "Workarounds", href: "/limitations-workarounds", description: "Operator-ready workaround packets, escalation triggers, and graduation gates." },
      { label: "Approvals", href: "/approvals-readiness", description: "Public claims, HIPAA/BAA, SOC 2/HITRUST, FDA, ONC, and release gates." },
      { label: "Global Enterprise Command", href: "/global-enterprise-command", description: "Global readiness command for international viability, localization, communication, interoperability, and approval-boundary tracking." },
      { label: "Global Certifications", href: "/global-certification-readiness", description: "Domestic and global approval/certification readiness." },
      { label: "Clinical Authority", href: "/clinical-authority-readiness", description: "Hard gates for PHI, live care, reimbursement, security, connectors, and production." }
    ]
  },
  {
    label: "Operate",
    intent: "Run release, reliability, QA, business, and protected-workspace operating controls.",
    links: [
      { label: "Company Assessment", href: "/company-assessment", description: "Whole-company command review, workstreams, team lanes, hard stops, and priority sequence." },
      { label: "Clinical Production Readiness", href: "/clinical-production-readiness", description: "Track incomplete clinical-production tasks while maximizing current no-PHI pilots, diligence packets, and readiness services." },
      { label: "Pilot Demo Accelerator", href: "/pilot-demo-commercial-readiness", description: "Run demo, pilot, pricing, proof, and margin controls before buyer calls." },
      { label: "Launch Readiness", href: "/launch-readiness", description: "Primary-domain smoke, DNS preflight, service paths, protected proof boundaries, and launch go/no-go gates." },
      { label: "Competitive Defense", href: "/competitive-defense", description: "Competitor-aware hardening, cyber controls, incident gates, and legal/privacy review paths." },
      { label: "Release Continuity", href: "/release-continuity", description: "Production/source checkpoint, public smoke, and AAL2 operator boundary." },
      { label: "Deployment Drift", href: "/deployment-drift-guard", description: "Detect stale deployments, route 404s, and source-to-target drift before external proof promotion." },
      { label: "Service Reliability", href: "/service-reliability", description: "Controls, fault classes, efficiency improvements, and retained boundaries." },
      { label: "Enterprise Scale", href: "/enterprise-scalability", description: "Capacity, tenancy, queues, SLO readiness, support, region, incident, and cost operating controls." },
      { label: "Platform Power", href: "/platform-power", description: "API contracts, UI command paths, AI model routing, agent approval, evals, and cost controls." },
      { label: "Production Architecture", href: "/production-architecture", description: "Release-facing architecture contract with validation checks and hard stops." },
      { label: "Infrastructure Readiness", href: "/enterprise-healthcare-infrastructure", description: "Operationalize hospital IT discovery, integration paths, private runtime assumptions, and infrastructure proof packets." },
      { label: "Attempt Store", href: "/workflows/execution-attempts", description: "No-PHI envelopes, durable idempotency, replay lookup, human review dispositions, audit traces, and scorecards." },
      { label: "Investor Command", href: "/investor-readiness", description: "Enterprise readiness, risk, product, model, safety, and evidence command center." },
      { label: "Workarounds", href: "/limitations-workarounds", description: "Reusable no-PHI, AAL2, API, model-route, deal-desk, and regional workaround packets." },
      { label: "Service Delivery", href: "/service-delivery", description: "Repeatable delivery work orders, acceptance gates, artifacts, and margin-safe handoffs." },
      { label: "24/7 Review", href: "/continuous-review-audit", description: "Agent-assisted accuracy review, audit, incident learning, and internal innovation." },
      { label: "TrustOps Intelligence", href: "/scrimed-trustops", description: "Synthetic operational signals, self-healing recommendations, TrustOps scoring, and human-review gates." },
      { label: "Governance Learning Loop", href: "/scrimed-governance-learning-loop", description: "Policy event, audit, correction artifact, retest, monitoring, and skill activation loop for safer operations." },
      { label: "Guided Execution", href: "/scrimed-guided-execution", description: "Weekly operating map tying proof routes, demos, sales motions, and next actions to each audience." },
      { label: "Proof Packet Studio", href: "/scrimed-proof-packet-studio", description: "Turn weekly operating priorities into audience-specific packet manifests with owners, evidence routes, limitations, and next actions." },
      { label: "Cyber Defense", href: "/scrimed-cyber-defense", description: "Run cyber control posture, threat matrix, incident lanes, and no-secret readiness from one route." },
      { label: "Business Ops", href: "/enterprise-business-ops", description: "Deal desk, margin controls, legal/accounting/tax routing, and billing readiness." },
      { label: "Investor Readiness", href: "/investor-audience-readiness", description: "Capital, clinic, buyer, and partner packet routing with qualified-review boundaries." },
      { label: "Growth", href: "/growth-engine", description: "Buyer segments, offers, conversion lanes, bottlenecks, and proof routes." },
      { label: "Protected Workspace", href: "/pilot-workspace/access", description: "AAL2 protected no-PHI buyer diligence and operator evidence." }
    ]
  },
  {
    label: "Build",
    intent: "Inspect the AI, workflow, interoperability, and evaluation architecture.",
    links: [
      { label: "Company Assessment", href: "/company-assessment", description: "Cross-lane assessment tying platform, AI, interoperability, health records, delivery, and operations together." },
      { label: "Clinical Production Readiness", href: "/clinical-production-readiness", description: "Clinical production task ledger tying AI, interoperability, privacy/security, clinical safety, support, and regulated claims together." },
      { label: "Pilot Demo Accelerator", href: "/pilot-demo-commercial-readiness", description: "Commercial bridge from executable demos into priced pilot packages and no-PHI intake." },
      { label: "Platform Power", href: "/platform-power", description: "API, UI, AI, model route, agent approval, retrieval, eval, and cost readiness." },
      { label: "Competitive Defense", href: "/competitive-defense", description: "LLM threat model, API attack paths, supply-chain hardening, and protected evidence boundaries." },
      { label: "Production Architecture", href: "/production-architecture", description: "Agent Runtime, Context Engine, Trust Engine v2, Model Router, Evaluation Engine, ClinSecOps, and Workflow Engine." },
      { label: "SCRIMED OS Plan", href: "/scrimed-os", description: "Production-ready roadmap and starter architecture for the Healthcare Intelligence Operating System." },
      { label: "Intelligence Platform", href: "/scrimed-intelligence-platform", description: "Synthetic-only SCRIMED intelligence control surface for mesh routing, memory graph, provenance, tracing, evals, outcomes, model routing, and education." },
      { label: "SCRIMED Work", href: "/scrimed-work", description: "Open the unified workspace for long-running governed sessions, verification-first autonomy, artifact generation, schedules, voice simulation, and SCRIMED Studio registries." },
      { label: "Clinical Assurance", href: "/clinical-assurance-control-plane", description: "Open the internal assurance control plane for CAL, enclaves, model and capacity passports, concentration budgets, kill switches, and continuity drills." },
      { label: "PayerIQ Workbench", href: "/documentation-before-authorization", description: "Run enumerated synthetic authorization scenarios through documentation scoring, evidence tracing, human review, audit, and payer-action denial." },
      { label: "Intelligence Control Plane", href: "/scrimed-control-plane", description: "Inspect the consolidated mission-control view across Work, Context Fabric, ConsequenceBench, model policy, capital intelligence, compute resilience, learning, and outcomes." },
      { label: "SCRIMED Modules", href: "/scrimed-modules", description: "No-PHI module registry for benchmark, evidence, memory, trust, workflow, research, multi-agent, and multi-model platform systems." },
      { label: "TrustOps Intelligence", href: "/scrimed-trustops", description: "Module governance, trust scoring, synthetic signal detection, structured validation, semantic graphing, and recommendation-only remediation." },
      { label: "Governance Learning Loop", href: "/scrimed-governance-learning-loop", description: "Control plane for agent memory, reviewed learning, policy decisions, A2A/MCP readiness, AI visibility, and value-based pricing." },
      { label: "Guided Execution", href: "/scrimed-guided-execution", description: "Route-aware execution layer for audience runbooks, proof paths, pricing motions, and demo follow-up artifacts." },
      { label: "Proof Packet Studio", href: "/scrimed-proof-packet-studio", description: "Structured packet layer for proof-backed sales, investor, pilot, partner, and internal execution artifacts." },
      { label: "Cyber Defense", href: "/scrimed-cyber-defense", description: "Security headers, proxy sanitization, protected fail-closed behavior, token redaction, and incident response architecture." },
      { label: "Build Roadmap", href: "/scrimed-build-roadmap", description: "No-PHI world models, active ontology, semantic graph, memory, context injection, workforce/resource modules, and operational benchmarks." },
      { label: "Omega Audit", href: "/omega-audit", description: "Product registry, audit lenses, implementation lanes, proof routes, and hard-stop controls." },
      { label: "Clinical Robustness Lab", href: "/clinical-robustness-lab", description: "Adversarial clinical-readiness scenarios for missing, conflicting, noisy, multilingual, unit, temporal, and hallucination failures." },
      { label: "Attempt Store", href: "/workflows/execution-attempts", description: "Metadata-only attempt envelopes, tenant-scoped durable store, replay tokens, model-route telemetry, human review, and scorecards." },
      { label: "AgentOS", href: "/agents", description: "Agent registry, roles, governance controls, and workflows." },
      { label: "Evaluation", href: "/evaluation", description: "Synthetic AgentOS plan, Trust Card, audit preview, and observability packet." },
      { label: "Workflows", href: "/workflows", description: "Workflow engine, contracts, results, runtime safety, and promotion controls." },
      { label: "Interoperability", href: "/interoperability", description: "FHIR, SMART, HL7, DICOM, X12, terminology, and connector governance." },
      { label: "Infrastructure Readiness", href: "/enterprise-healthcare-infrastructure", description: "FHIR, HL7 ADT, DICOM/PACS/RIS/HIS, X12, VPN, VM, database, firewall, and integration-engine readiness map." },
      { label: "Health Records", href: "/health-records", description: "No-PHI extraction, record safety, source attribution, and live-data workarounds." },
      { label: "TrustOS", href: "/trust-os", description: "Executable AI governance through policy, PHI, tool, clinical, model, and trace controls." },
      { label: "Automation Autopilot", href: "/scrimed-automation-autopilot", description: "Keep autonomy synthetic, review-gated, and blocked before PHI, live care, production remediation, or customer go-live." },
      { label: "Atlas", href: "/atlas", description: "Structural document intelligence, evidence attribution, validation, and governance." }
    ]
  }
];

export const siteNavigationJourneys: SiteNavigationJourney[] = [
  {
    audience: "Clinical production readiness owner",
    start: "Track what must be complete before clinical production",
    route: "/clinical-production-readiness",
    sequence: ["/clinical-production-readiness", "/clinical-robustness-lab", "/company-assessment", "/clinical-authority-readiness", "/global-certification-readiness", "/health-records", "/platform-power", "/continuous-review-audit", "/service-reliability", "/enterprise-business-ops", "/service-delivery", "/qa-buyer-proof-release", "/pilot-workspace/access"],
    outcome: "Keep PHI, live care, connector, AI, regulatory, support, customer go-live, and commercial-legal tasks tracked while current no-PHI capabilities continue to generate value.",
    limitationRoute: "/clinical-production-readiness",
    boundary: "Clinical production readiness tracking is not legal advice, medical advice, regulatory approval, PHI authority, connector approval, certification, customer permission, launch approval, or live clinical authority."
  },
  {
    audience: "Founder, executive sponsor, or company operator",
    start: "Assess SCRIMED as a whole",
    route: "/company-assessment",
    sequence: ["/company-assessment", "/product", "/offerings", "/service-delivery", "/enterprise-business-ops", "/platform-power", "/health-records", "/launch-readiness", "/approvals-readiness", "/global-certification-readiness", "/continuous-review-audit", "/limitations-workarounds", "/qa-buyer-proof-release"],
    outcome: "Move from whole-company posture to product, revenue, delivery, platform, safety, launch, approval, review, limitation, and protected proof decisions without losing boundaries.",
    limitationRoute: "/company-assessment",
    boundary: "Company assessment is operating readiness only and does not create legal, financial, certification, PHI, launch, revenue, profit, or clinical authority."
  },
  {
    audience: "Healthcare buyer",
    start: "Understand SCRIMED quickly",
    route: "/product",
    sequence: ["/product", "/pilot-demo-commercial-readiness", "/platform-power", "/limitations-workarounds", "/offerings", "/service-delivery", "/client-onboarding", "/demos", "/pilots", "/pricing", "/pilot-deal-room", "/pilot"],
    outcome: "Move from product understanding to governed onboarding, demo, pilot, diligence, and intake without needing to know SCRIMED's internal route map.",
    limitationRoute: "/limitations-workarounds",
    boundary: "Buyer navigation remains synthetic-evaluation only and does not authorize production clinical use."
  },
  {
    audience: "Demo, pilot, or pricing owner",
    start: "Convert demo interest into a priced pilot path",
    route: "/pilot-demo-commercial-readiness",
    sequence: ["/pilot-demo-commercial-readiness", "/demos", "/pilots", "/pricing", "/offerings", "/client-onboarding", "/pilot-deal-room", "/service-delivery", "/pilot"],
    outcome: "Map each buyer conversation to one demo, one recommended pilot, one price band, one proof list, one no-PHI intake route, and one retained boundary before custom work expands.",
    limitationRoute: "/pilot-demo-commercial-readiness",
    boundary: "Demo and pricing navigation is commercial readiness only and does not create quotes, contracts, procurement approval, revenue or ROI guarantees, PHI authority, connector approval, or clinical authority."
  },
  {
    audience: "Security or compliance reviewer",
    start: "Find diligence and limits",
    route: "/trust-center",
    sequence: ["/trust-center", "/competitive-defense", "/claims", "/approvals-readiness", "/global-certification-readiness", "/boundary-resolution", "/limitations-workarounds", "/pilot-workspace/access"],
    outcome: "Review evidence, prohibited claims, future approval tracks, and protected no-PHI diligence controls in one path.",
    limitationRoute: "/competitive-defense",
    boundary: "Readiness pages do not create legal advice, certification, PHI authority, or approval."
  },
  {
    audience: "Release or operator owner",
    start: "Check launch posture",
    route: "/launch-readiness",
    sequence: ["/launch-readiness", "/navigation", "/release-continuity", "/service-reliability", "/scrimed-automation-autopilot", "/enterprise-scalability", "/platform-power", "/limitations-workarounds", "/operational-efficiency", "/continuous-review-audit", "/qa-evidence"],
    outcome: "Move from launch go/no-go checks to route inventory, release proof, DNS workaround evidence, reliability controls, scale operations, efficiency bottlenecks, review loops, and QA evidence.",
    limitationRoute: "/launch-readiness",
    boundary: "Operational navigation is not release approval and cannot bypass AAL2 or qualified human review."
  },
  {
    audience: "Launch owner or executive sponsor",
    start: "Decide whether SCRIMED is launch-structured enough to promote",
    route: "/launch-readiness",
    sequence: ["/launch-readiness", "/product", "/offerings", "/service-delivery", "/client-onboarding", "/release-continuity", "/navigation", "/operations", "/service-reliability", "/enterprise-business-ops", "/global-certification-readiness", "/pilot-workspace/access"],
    outcome: "Review product packaging, service readiness, branded-domain smoke, sandbox DNS workaround, operations blockers, enterprise controls, external-review gates, and protected proof boundaries before launch promotion.",
    limitationRoute: "/launch-readiness",
    boundary: "Launch readiness is human-reviewed operating evidence only; it is not branded-domain launch approval, sandbox bypass, contractual SLA, certification, PHI authority, customer release, or live clinical authority."
  },
  {
    audience: "Founder, sales, or board reviewer",
    start: "Focus revenue and margin work",
    route: "/enterprise-business-ops",
    sequence: ["/enterprise-business-ops", "/enterprise-scalability", "/platform-power", "/competitive-defense", "/limitations-workarounds", "/offerings", "/service-delivery", "/client-onboarding", "/growth-engine", "/capital-vitality", "/investor-audience-readiness", "/public-market-readiness", "/competitive-intelligence", "/pilot-deal-room"],
    outcome: "Connect revenue capability, scale readiness, onboarding discipline, price floors, proof ladders, capital readiness, audience-specific packets, market position, and buyer diligence.",
    limitationRoute: "/enterprise-business-ops",
    boundary: "Business navigation is not legal, accounting, tax, audited financial, securities, revenue, or profit advice."
  },
  {
    audience: "Legal, privacy, cyber, or competitor-defense owner",
    start: "Harden strengths without creating legal or security exposure",
    route: "/competitive-defense",
    sequence: ["/competitive-defense", "/competitive-intelligence", "/claims", "/trust-center", "/global-certification-readiness", "/health-records", "/platform-power", "/trust-os", "/service-reliability", "/release-continuity", "/pilot-workspace/access"],
    outcome: "Move from competitor pressure and weakness relief to claims control, privacy gates, cyber controls, LLM threat modeling, incident response, supply-chain checks, and protected evidence release.",
    limitationRoute: "/competitive-defense",
    boundary: "Competitive defense is readiness only; it is not legal advice, privacy approval, security certification, penetration-test authorization, PHI authority, competitor partnership, or protection guarantee."
  },
  {
    audience: "Investor, strategic partner, or faith-based clinic sponsor",
    start: "Understand SCRIMED's investable and sellable value safely",
    route: "/investor-audience-readiness",
    sequence: ["/investor-audience-readiness", "/capital-vitality", "/growth-engine", "/enterprise-business-ops", "/public-market-readiness", "/client-onboarding", "/pilot-deal-room", "/qa-claim-guard"],
    outcome: "Match angel, corporate strategic, private, faith-based clinic, public-sector, payer, health-system, clinician, global-partner, or transformation-sponsor questions to proof, next moves, and retained review gates.",
    limitationRoute: "/investor-audience-readiness",
    boundary: "Investor and audience navigation is readiness only; it is not securities offering material, solicitation, investment advice, valuation assurance, legal advice, tax advice, donor advice, customer permission, or approval."
  },
  {
    audience: "Service delivery owner",
    start: "Turn a sold or scoped offer into accepted delivery work",
    route: "/service-delivery",
    sequence: ["/service-delivery", "/offerings", "/client-onboarding", "/enterprise-business-ops", "/qa-claim-guard", "/qa-buyer-proof-release", "/pilot-workspace/access", "/growth-engine"],
    outcome: "Move from packaged offer to scoped work order, kickoff inputs, artifacts, acceptance criteria, release gates, handoff, and next paid package.",
    limitationRoute: "/service-delivery",
    boundary: "Service delivery navigation is execution control only and does not create SOW, contract, SLA, PHI, production connector, customer release, revenue, profit, or live-care authority."
  },
  {
    audience: "Global partner or regional buyer",
    start: "Validate expansion readiness",
    route: "/global-enterprise-command",
    sequence: ["/global-enterprise-command", "/global-reach", "/global-certification-readiness", "/deployment-profiles", "/trust-center", "/approvals-readiness", "/pilot"],
    outcome: "Find region commands, buyer localization, deployment options, certification tracks, communication lanes, interoperability assumptions, and retained approval gates.",
    limitationRoute: "/global-certification-readiness",
    boundary: "Global navigation is preparation only and does not claim local legal, procurement, regulatory, or clinical approval."
  },
  {
    audience: "Integration, data, or records owner",
    start: "Validate record extraction safely",
    route: "/health-records",
    sequence: ["/health-records", "/enterprise-healthcare-infrastructure", "/interoperability", "/platform-power", "/limitations-workarounds", "/interoperability/evaluations", "/integrations/fixture-validation", "/clinical-care-activation", "/boundary-resolution"],
    outcome: "Move from no-PHI record extraction planning to standards mapping, synthetic conformance, safety gates, and retained live-data approvals.",
    limitationRoute: "/limitations-workarounds",
    boundary: "Health-record navigation supports synthetic and sandbox planning only; it does not authorize live PHI, patient matching, writeback, payer submission, or clinical action."
  },
  {
    audience: "Boundary or workaround owner",
    start: "Resolve a blocked request safely",
    route: "/limitations-workarounds",
    sequence: ["/limitations-workarounds", "/boundary-resolution", "/boundary-release-approvals", "/operational-efficiency", "/scrimed-automation-autopilot", "/platform-power", "/service-reliability", "/continuous-review-audit"],
    outcome: "Convert limitations, issues, and bottlenecks into safe workaround packets, escalation owners, approval paths, proof routes, and graduation gates.",
    limitationRoute: "/limitations-workarounds",
    boundary: "Workaround navigation is containment only and does not create authority, certification, PHI access, live AI, or release approval."
  }
];

export const limitationControlLinks: SiteNavigationLink[] = [
  {
    label: "Pilot Demo Commercial Readiness",
    href: "/pilot-demo-commercial-readiness",
    description: "Seamless demo-to-pilot package routing, market-aligned price bands, proof assets, margin rules, and hard stops.",
    boundary: "Does not create signed quotes, contracts, procurement approval, customer permission, revenue guarantees, ROI guarantees, PHI authority, production connector approval, security certification, or live clinical care."
  },
  {
    label: "Clinical Production Readiness",
    href: "/clinical-production-readiness",
    description: "Required clinical-production task ledger, go-live gates, current capability motions, source references, and hard stops.",
    boundary: "Does not provide legal advice, medical advice, regulatory approval, HIPAA compliance, security certification, FDA clearance, ONC certification, EU AI Act conformity, GDPR assurance, PHI authority, connector approval, customer permission, launch approval, reimbursement assurance, revenue guarantee, profit guarantee, or live clinical care."
  },
  {
    label: "Clinical Robustness Lab",
    href: "/clinical-robustness-lab",
    description: "Adversarial no-PHI clinical readiness scorecards for missing data, conflicting data, abbreviations, noisy notes, wrong units, multilingual notes, incomplete records, temporal inconsistencies, and hallucination risk.",
    boundary: "Does not provide clinical validation, medical advice, PHI authority, diagnosis, treatment, triage, patient outreach, signed documentation, payer submission, EHR writeback, certification, or live clinical authority."
  },
  {
    label: "Company Assessment",
    href: "/company-assessment",
    description: "Whole-company readiness score, strengths, weakness relief, upgrade workstreams, team lanes, hard stops, and authority boundaries.",
    boundary: "Does not provide legal advice, accounting advice, tax advice, audited financial reporting, investment advice, securities material, certification, security assurance, PHI authority, launch approval, customer permission, revenue guarantees, profit guarantees, or live clinical care."
  },
  {
    label: "Competitive Defense",
    href: "/competitive-defense",
    description: "Competitor threats, weakness relief, legal/privacy/cyber controls, infiltration-deterrence layers, and external review gates.",
    boundary: "Does not provide legal advice, privacy approval, security certification, penetration-test authorization, PHI authority, competitor partnership, protection guarantee, customer release, or clinical authority."
  },
  {
    label: "Launch Readiness",
    href: "/launch-readiness",
    description: "Launch structure, DNS sandbox classification, strict branded-domain gate, service paths, risks, workarounds, and hard stops.",
    boundary: "Does not bypass sandbox DNS, override domain records, approve launch, create SLAs, authorize PHI, certify compliance, approve connectors, or approve customer release."
  },
  {
    label: "Investor Audience Readiness",
    href: "/investor-audience-readiness",
    description: "Weakness relief, competitive edge, sellable value, and audience packets for investors, clinics, buyers, and partners.",
    boundary: "Does not create investment advice, securities material, solicitation, valuation assurance, legal/tax/accounting advice, donor advice, customer permission, approval, PHI authority, or clinical authority."
  },
  {
    label: "Limitations Workarounds",
    href: "/limitations-workarounds",
    description: "Safe workaround packets, escalation triggers, owners, proof routes, and graduation gates for blocked work.",
    boundary: "Does not grant approval, certification, PHI authority, live clinical authority, legal/finance advice, SLA, live AI, or release authority."
  },
  {
    label: "Boundary Resolution",
    href: "/boundary-resolution",
    description: "Central limitation register, hard stops, safe workarounds, and prohibited claims.",
    boundary: "Does not grant approval, certification, production authorization, PHI authority, or live clinical authority."
  },
  {
    label: "Boundary Release Approval Matrix",
    href: "/boundary-release-approvals",
    description: "Approval paths, required evidence, owner signoffs, safe workarounds, release hashes, and fail-closed boundary decisions.",
    boundary: "Does not relieve preserved boundaries or grant PHI, clinical, payer, EHR, connector, certification, or customer go-live authority."
  },
  {
    label: "Operational Efficiency",
    href: "/operational-efficiency",
    description: "Known gaps, inefficiencies, bottlenecks, proof-route gaps, hard stops, and resolution sprints.",
    boundary: "Does not authorize autonomous remediation, AAL2 bypass, buyer release, or qualified-review replacement."
  },
  {
    label: "Automation Autopilot",
    href: "/scrimed-automation-autopilot",
    description: "Safe autonomy readiness, approval routing, bottleneck workarounds, proof-route selection, and production-action blocking.",
    boundary: "Does not authorize live PHI, autonomous clinical care, production remediation, patient outreach, payer submission, EHR writeback, credential mutation, production deploy, SLA, certification, revenue guarantee, or customer go-live."
  },
  {
    label: "Offerings",
    href: "/offerings",
    description: "Packaged product/service offers, proof routes, margin controls, and retained approval boundaries.",
    boundary: "Does not approve contracts, PHI processing, production connectors, customer claims, revenue, profit, legal, accounting, tax, or clinical authority."
  },
  {
    label: "Service Delivery",
    href: "/service-delivery",
    description: "Scoped work orders, acceptance criteria, artifacts, buyer handoffs, margin protections, and authority gates.",
    boundary: "Does not create SOWs, contract approval, SLAs, managed-service commitments, PHI authority, production connector approval, customer permission, revenue guarantees, profit guarantees, or live clinical authority."
  },
  {
    label: "Client Onboarding",
    href: "/client-onboarding",
    description: "Human-reviewed onboarding, demo, pilot, meeting, presentation, email, calendar-ready, and handoff controls.",
    boundary: "Does not send email, create calendar invites, approve contracts, approve procurement, process PHI, approve security posture, or authorize live clinical care."
  },
  {
    label: "Enterprise Scalability",
    href: "/enterprise-scalability",
    description: "Capacity, tenancy, queueing, observability, SLO readiness, support, region, incident, and cost controls.",
    boundary: "Does not create contractual SLAs, managed service coverage, security certification, production hosting approval, PHI authority, connector approval, revenue guarantees, or profit guarantees."
  },
  {
    label: "API UI AI Platform Power",
    href: "/platform-power",
    description: "API contracts, UI command paths, AI model routing, agent approval, evidence retrieval, evals, and cost controls.",
    boundary: "Does not create public API SLA authority, live autonomous AI authority, production model approval, PHI authority, accessibility certification, security certification, connector approval, or trillion-scale equivalence claims."
  },
  {
    label: "Approvals Readiness",
    href: "/approvals-readiness",
    description: "Approval ladder for public claims, HIPAA/BAA, SOC 2/HITRUST, FDA/CDS/SaMD, ONC, and buyer release.",
    boundary: "Does not create legal approval, certification, FDA clearance, ONC certification, PHI authority, or live-care authority."
  },
  {
    label: "Clinical Authority",
    href: "/clinical-authority-readiness",
    description: "Live-care, PHI, legal, regional, reimbursement, security, connector, and production clinical gates.",
    boundary: "Does not authorize PHI processing, live clinical care, reimbursement, connectors, or production clinical use."
  },
  {
    label: "Health Records",
    href: "/health-records",
    description: "No-PHI health-record extraction, interoperability, safety checks, and live-data workarounds.",
    boundary: "Does not authorize live PHI, patient matching, production connectors, EHR writeback, payer submission, or clinical action."
  },
  {
    label: "Global Enterprise Command",
    href: "/global-enterprise-command",
    description: "International enterprise readiness, global sales, localization, interoperability, communication, and partner-readiness command surface.",
    boundary: "Does not claim regional legal approval, procurement approval, certification, production deployment, PHI authority, clinical authority, reseller authority, or customer go-live."
  },
  {
    label: "Global Certification",
    href: "/global-certification-readiness",
    description: "Domestic and global certification/approval preparation across key jurisdictions and frameworks.",
    boundary: "Does not claim HIPAA, SOC 2, HITRUST, ISO, FDA, GDPR, EU AI Act, NHS, MHRA, or Australian approval."
  }
];

export const siteNavigationFooterLinks = [
  ...siteNavigationPrimaryLinks,
  { label: "Official Website", href: "https://www.scrimedsolutions.com", description: "Public SCRIMED Solutions website." },
  { label: "API Status", href: "/api/status", description: "Application status API." }
];
