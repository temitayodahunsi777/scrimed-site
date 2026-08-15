import {
  limitationControlLinks,
  siteNavigationJourneys,
  siteNavigationSections
} from "./siteNavigation";

export type NavigationAuditStatus =
  | "linked"
  | "smoke-covered"
  | "protected-fail-closed"
  | "operator-required"
  | "external-review-required"
  | "compile-covered";

export type NavigationGroup = {
  name: string;
  purpose: string;
  owner: string;
  routes: string[];
  auditStatus: NavigationAuditStatus;
  evidence: string;
  retainedBoundary: string;
};

export type NavigationBottleneck = {
  name: string;
  status: "resolved" | "contained" | "operator-required" | "external-review-required";
  impact: string;
  workaround: string;
  owner: string;
};

export const navigationAuditProofStackStatus = "route-navigation-audit-active";
export const navigationAuditBriefProofStackStatus = "route-navigation-audit-brief-ready";
export const navigationAuditUpdatedAt = "2026-08-12";
export const expectedApiRoutePatternCount = 452;

export const navigationAuditBoundary =
  "SCRIMED Navigation Audit organizes page routes, API route patterns, smoke coverage, protected fail-closed checks, and retained approval boundaries into one operating map. It is an audit and navigation control surface only. It does not certify that every protected workflow has been executed, bypass AAL2, approve public release, authorize PHI processing, grant legal or clinical authority, certify security/compliance, or approve production connectors.";

export const pageRouteInventory = [
  "/",
  "/agent-workspace",
  "/agents",
  "/agents/[slug]",
  "/approvals-readiness",
  "/atlas",
  "/attribution-analytics",
  "/audit",
  "/boundary-release-approvals",
  "/boundary-resolution",
  "/buyer-release-control-run",
  "/capital-vitality",
  "/claims",
  "/client-onboarding",
  "/clinical-authority-readiness",
  "/clinical-assurance-control-plane",
  "/clinical-care-activation",
  "/clinical-production-readiness",
  "/clinical-robustness-lab",
  "/company-assessment",
  "/competitive-edge",
  "/competitive-defense",
  "/competitive-intelligence",
  "/scrimed-market-execution",
  "/scrimed-execution-focus",
  "/continuous-review-audit",
  "/contracts/[slug]",
  "/demos",
  "/demos/[slug]",
  "/deployment-profiles",
  "/documentation-before-authorization",
  "/enterprise-business-ops",
  "/enterprise-healthcare-infrastructure",
  "/enterprise-scalability",
  "/evaluation",
  "/faithcore",
  "/fixtures/change-review",
  "/global-certification-readiness",
  "/global-enterprise-command",
  "/global-reach",
  "/governance-packs",
  "/health-records",
  "/healthcare-optimization-command",
  "/healthcare-value-realization",
  "/pilot-activation-planner",
  "/pilot-handoff-command",
  "/pilot-success-review-command",
  "/pilot-value-evidence",
  "/growth-engine",
  "/healthcare-intelligence-os",
  "/hub",
  "/hub/events",
  "/hub/readiness",
  "/integrations",
  "/integrations/fixture-validation",
  "/integrations/fixtures",
  "/integrations/fixtures/[slug]",
  "/interoperability",
  "/interoperability/[slug]",
  "/interoperability/evaluations",
  "/interoperability/evaluations/[slug]",
  "/investor-audience-readiness",
  "/investor-demo-command-room",
  "/investor-readiness",
  "/launch-readiness",
  "/legal",
  "/legal/[slug]",
  "/limitations-workarounds",
  "/market-activation",
  "/memory",
  "/modules/carepath-ai",
  "/modules/clinical-copilot",
  "/modules/docutwin",
  "/modules/trialcore",
  "/modules/watchtower",
  "/navigation",
  "/observability",
  "/omega-audit",
  "/operating-context",
  "/operational-efficiency",
  "/operations",
  "/offerings",
  "/pilot",
  "/pilot-demo-commercial-readiness",
  "/pilot-deal-room",
  "/pilot-evidence",
  "/pilot-workspace",
  "/pilot-workspace/access",
  "/pilots",
  "/pilots/[slug]",
  "/platform",
  "/platform-power",
  "/pricing",
  "/production-architecture",
  "/product",
  "/public-market-readiness",
  "/qa-aal2-run-evidence",
  "/qa-activation-seal",
  "/qa-buyer-proof-release",
  "/qa-claim-guard",
  "/qa-completion-bridge",
  "/qa-evidence",
  "/qa-execution-readiness",
  "/qa-human-run-packet",
  "/qa-launch-kit",
  "/qa-manual-execution-console",
  "/qa-proof-promotion",
  "/qa-run-control",
  "/quality",
  "/release-continuity",
  "/deployment-drift-guard",
  "/risk-register",
  "/sales-attribution",
  "/sales-operations",
  "/scrimed-agent-governance",
  "/scrimed-ai-infrastructure-watchtower",
  "/scrimed-automation-autopilot",
  "/scrimed-build-roadmap",
  "/scrimed-clinical-benchmark-suite",
  "/scrimed-cyber-defense",
  "/scrimed-enterprise-acceleration",
  "/scrimed-governance-learning-loop",
  "/scrimed-guided-execution",
  "/scrimed-hybrid-retrieval",
  "/scrimed-intelligence-platform",
  "/scrimed-intelligence-safety-stack",
  "/scrimed-llmops-observability",
  "/scrimed-modules",
  "/scrimed-operating-command",
  "/scrimed-work",
  "/scrimed-control-plane",
  "/scrimed-os",
  "/scrimed-p33",
  "/scrimed-patient-context-gateway",
  "/scrimed-proof-packet-studio",
  "/scrimed-reasoning-stability",
  "/scrimed-trustops",
  "/scrimed-upgrade-implementation-plan",
  "/service-delivery",
  "/service-reliability",
  "/source-intelligence",
  "/strategic-problem-resolution",
  "/strategic-intelligence",
  "/synthetic",
  "/synthetic/[slug]",
  "/synthetic/fixtures",
  "/synthetic/fixtures/[slug]",
  "/synthetic/validation",
  "/trust",
  "/trust-center",
  "/trust-center/[slug]",
  "/trust-os",
  "/trust-safety-operations",
  "/validation-evidence",
  "/workflows",
  "/workflows/[slug]",
  "/workflows/audit-persistence",
  "/workflows/contracts",
  "/workflows/contracts/[slug]",
  "/workflows/execution-attempts",
  "/workflows/execution-audit",
  "/workflows/execution-audit/[slug]",
  "/workflows/identity-access",
  "/workflows/implementation-readiness",
  "/workflows/implementation-readiness/[slug]",
  "/workflows/promotion-review",
  "/workflows/results",
  "/workflows/results/[slug]",
  "/workflows/results/validation",
  "/workflows/runtime-safety"
];

export const smokeCoveredHtmlRoutes = [
  "/validation-evidence",
  "/legal",
  "/company-assessment",
  "/clinical-production-readiness",
  "/pilot-demo-commercial-readiness",
  "/navigation",
  "/pilot-workspace/access",
  "/sales-operations",
  "/competitive-edge",
  "/competitive-defense",
  "/competitive-intelligence",
  "/scrimed-market-execution",
  "/scrimed-execution-focus",
  "/continuous-review-audit",
  "/enterprise-business-ops",
  "/enterprise-healthcare-infrastructure",
  "/enterprise-scalability",
  "/platform-power",
  "/production-architecture",
  "/pilot-deal-room",
  "/qa-evidence",
  "/clinical-authority-readiness",
  "/clinical-care-activation",
  "/public-market-readiness",
  "/global-enterprise-command",
  "/global-reach",
  "/global-certification-readiness",
  "/health-records",
  "/healthcare-optimization-command",
  "/healthcare-value-realization",
  "/pilot-activation-planner",
  "/pilot-handoff-command",
  "/pilot-success-review-command",
  "/pilot-value-evidence",
  "/scrimed-work",
  "/scrimed-p33",
  "/offerings",
  "/client-onboarding",
  "/boundary-release-approvals",
  "/boundary-resolution",
  "/limitations-workarounds",
  "/approvals-readiness",
  "/release-continuity",
  "/deployment-drift-guard",
  "/service-delivery",
  "/service-reliability",
  "/operational-efficiency",
  "/capital-vitality",
  "/growth-engine",
  "/investor-audience-readiness",
  "/launch-readiness",
  "/qa-execution-readiness",
  "/qa-run-control",
  "/qa-launch-kit",
  "/qa-human-run-packet",
  "/qa-completion-bridge",
  "/qa-claim-guard",
  "/qa-activation-seal",
  "/qa-proof-promotion",
  "/qa-buyer-proof-release",
  "/buyer-release-control-run",
  "/qa-manual-execution-console",
  "/qa-aal2-run-evidence",
  "/scrimed-intelligence-platform",
  "/scrimed-agent-governance",
  "/scrimed-reasoning-stability",
  "/scrimed-clinical-benchmark-suite",
  "/scrimed-automation-autopilot",
  "/scrimed-enterprise-acceleration",
  "/scrimed-governance-learning-loop",
  "/scrimed-guided-execution",
  "/scrimed-proof-packet-studio",
  "/scrimed-cyber-defense",
  "/scrimed-hybrid-retrieval",
  "/scrimed-llmops-observability",
  "/scrimed-ai-infrastructure-watchtower",
  "/scrimed-patient-context-gateway",
  "/documentation-before-authorization",
  "/strategic-problem-resolution"
];

export const navigationGroups: NavigationGroup[] = [
  {
    name: "Executive command",
    purpose: "Give founders, buyers, operators, and reviewers a short path into the active operating surfaces.",
    owner: "Founder + Product Console",
    routes: [
      "/",
      "/hub",
      "/company-assessment",
      "/clinical-production-readiness",
      "/pilot-demo-commercial-readiness",
      "/product",
      "/offerings",
      "/service-delivery",
      "/client-onboarding",
      "/competitive-defense",
      "/competitive-intelligence",
      "/global-enterprise-command",
      "/global-certification-readiness",
      "/continuous-review-audit",
      "/enterprise-business-ops",
      "/enterprise-healthcare-infrastructure",
      "/enterprise-scalability",
      "/platform-power",
      "/limitations-workarounds",
      "/launch-readiness",
      "/navigation",
      "/deployment-drift-guard",
      "/service-reliability",
      "/operational-efficiency",
      "/capital-vitality",
      "/growth-engine",
      "/investor-audience-readiness",
      "/scrimed-intelligence-platform",
      "/scrimed-intelligence-safety-stack",
      "/scrimed-operating-command",
      "/scrimed-work",
      "/scrimed-p33",
      "/clinical-assurance-control-plane",
      "/scrimed-control-plane",
      "/scrimed-automation-autopilot",
      "/strategic-problem-resolution",
      "/healthcare-optimization-command",
      "/healthcare-value-realization",
      "/pilot-activation-planner",
      "/pilot-handoff-command",
      "/pilot-success-review-command",
      "/pilot-value-evidence",
      "/scrimed-upgrade-implementation-plan",
      "/scrimed-agent-governance",
      "/scrimed-reasoning-stability",
      "/scrimed-clinical-benchmark-suite",
      "/scrimed-enterprise-acceleration",
      "/scrimed-governance-learning-loop",
      "/scrimed-guided-execution",
      "/scrimed-proof-packet-studio",
      "/scrimed-cyber-defense",
      "/scrimed-hybrid-retrieval",
      "/scrimed-llmops-observability",
      "/scrimed-ai-infrastructure-watchtower",
      "/scrimed-patient-context-gateway",
      "/pilot-evidence"
    ],
    auditStatus: "linked",
    evidence: "Homepage, Hub, Product Console, and this audit route cross-link the highest-signal operating lanes.",
    retainedBoundary: "Navigation links are operating guidance, not proof of protected execution."
  },
  {
    name: "Commercial buyer motion",
    purpose: "Move qualified buyers from public product proof into demos, pricing, deal-room context, and pilot intake.",
    owner: "Sales operations + Buyer Diligence",
    routes: [
      "/pilot-deal-room",
      "/offerings",
      "/service-delivery",
      "/client-onboarding",
      "/launch-readiness",
      "/competitive-defense",
      "/pricing",
      "/pilot-demo-commercial-readiness",
      "/demos",
      "/demos/[slug]",
      "/documentation-before-authorization",
      "/pilots",
      "/pilots/[slug]",
      "/pilot",
      "/competitive-intelligence",
      "/capital-vitality",
      "/growth-engine",
      "/company-assessment",
      "/clinical-production-readiness",
      "/pilot-demo-commercial-readiness",
      "/enterprise-business-ops",
      "/enterprise-healthcare-infrastructure",
      "/enterprise-scalability",
      "/platform-power",
      "/limitations-workarounds",
      "/scrimed-automation-autopilot",
      "/operational-efficiency",
      "/sales-operations",
      "/scrimed-proof-packet-studio",
      "/scrimed-cyber-defense",
      "/healthcare-value-realization",
      "/pilot-activation-planner",
      "/pilot-handoff-command",
      "/pilot-success-review-command",
      "/pilot-value-evidence"
    ],
    auditStatus: "smoke-covered",
    evidence: "Public smoke covers the Deal Room, Client Onboarding, and Sales Operations route; dynamic demo and pilot detail pages compile in the App Router build.",
    retainedBoundary: "Commercial routes cannot claim customer permission, production activation, autonomous email send, calendar invite creation, or external distribution approval."
  },
  {
    name: "Approval and authority readiness",
    purpose: "Keep legal, regulatory, clinical, security, reimbursement, and buyer-release boundaries visible before claims expand.",
    owner: "Legal, security, clinical governance, and release stewardship",
    routes: [
      "/approvals-readiness",
      "/company-assessment",
      "/clinical-production-readiness",
      "/competitive-defense",
      "/global-certification-readiness",
      "/continuous-review-audit",
      "/boundary-release-approvals",
      "/boundary-resolution",
      "/limitations-workarounds",
      "/launch-readiness",
      "/clinical-authority-readiness",
      "/clinical-care-activation",
      "/health-records",
      "/public-market-readiness",
      "/capital-vitality",
      "/growth-engine",
      "/enterprise-business-ops",
      "/enterprise-scalability",
      "/platform-power",
      "/limitations-workarounds",
      "/client-onboarding",
      "/service-delivery",
      "/release-continuity",
      "/deployment-drift-guard",
      "/launch-readiness",
      "/service-reliability",
      "/operational-efficiency",
      "/strategic-problem-resolution",
      "/healthcare-value-realization",
      "/pilot-activation-planner",
      "/pilot-handoff-command",
      "/pilot-success-review-command",
      "/pilot-value-evidence"
    ],
    auditStatus: "smoke-covered",
    evidence: "Public smoke checks HTML, JSON APIs, Markdown briefs, boundary headers, and Product Console proof-stack posture for these lanes.",
    retainedBoundary: "These routes prepare approvals; they do not grant legal approval, clinical authority, certification, or live-care authorization."
  },
  {
    name: "Protected workspace and AAL2 proof",
    purpose: "Separate public visibility from tenant-scoped protected evidence, packets, release decisions, and operator-only workflows.",
    owner: "Tenant admin, pilot lead, TrustOS, and release steward",
    routes: [
      "/pilot-workspace",
      "/pilot-workspace/access",
      "/buyer-release-control-run",
      "/qa-manual-execution-console",
      "/qa-aal2-run-evidence"
    ],
    auditStatus: "operator-required",
    evidence: "Unauthenticated smoke verifies protected APIs fail closed; successful mutation and packet proof require a fresh human AAL2 session.",
    retainedBoundary: "No code path may mint, retain, print, or reuse operator bearer tokens to bypass AAL2."
  },
  {
    name: "QA and release proof",
    purpose: "Keep manual QA execution, claim guard, activation seal, proof promotion, and buyer proof release staged before any claim expansion.",
    owner: "TrustOS, release engineering, buyer diligence, and claims governance",
    routes: [
      "/qa-evidence",
      "/qa-execution-readiness",
      "/qa-run-control",
      "/continuous-review-audit",
      "/qa-launch-kit",
      "/qa-human-run-packet",
      "/qa-completion-bridge",
      "/qa-claim-guard",
      "/qa-activation-seal",
      "/qa-proof-promotion",
      "/qa-buyer-proof-release"
    ],
    auditStatus: "smoke-covered",
    evidence: "Public smoke validates all listed QA pages, APIs, briefs, secret rejection paths, and no-authority headers.",
    retainedBoundary: "QA routes can prove readiness and no-secret handling; retained authenticated proof remains protected and AAL2 gated."
  },
  {
    name: "Agent and workflow OS",
    purpose: "Expose AgentOS, Agent Workspace, memory, audit, observability, workflow contracts, execution readiness, results, and runtime safety.",
    owner: "AgentOS + Workflow Runtime",
    routes: [
      "/agents",
      "/competitive-defense",
      "/platform-power",
      "/production-architecture",
      "/scrimed-intelligence-platform",
      "/scrimed-operating-command",
      "/scrimed-work",
      "/scrimed-control-plane",
      "/scrimed-automation-autopilot",
      "/limitations-workarounds",
      "/launch-readiness",
      "/agents/[slug]",
      "/agent-workspace",
      "/evaluation",
      "/documentation-before-authorization",
      "/memory",
      "/audit",
      "/observability",
      "/workflows",
      "/workflows/[slug]",
      "/workflows/contracts",
      "/workflows/identity-access",
      "/workflows/execution-attempts",
      "/workflows/execution-audit",
      "/workflows/audit-persistence",
      "/workflows/results",
      "/workflows/results/validation",
      "/workflows/promotion-review",
      "/workflows/runtime-safety"
    ],
    auditStatus: "compile-covered",
    evidence: "Next build, TypeScript, ESLint, workflow APIs, and protected Agent Workspace fail-closed smoke cover the operating surface.",
    retainedBoundary: "Workflow execution stays synthetic and deny-by-default until identity, runtime safety, audit, connector, and review gates are approved."
  },
  {
    name: "Interoperability, integrations, and synthetic validation",
    purpose: "Keep standards, connector contracts, fixture validation, and synthetic clinical workflows inspectable before production data connections.",
    owner: "Interoperability control plane + Validation Trust Lab",
    routes: [
      "/interoperability",
      "/enterprise-healthcare-infrastructure",
      "/health-records",
      "/interoperability/[slug]",
      "/interoperability/evaluations",
      "/interoperability/evaluations/[slug]",
      "/integrations",
      "/integrations/fixture-validation",
      "/integrations/fixtures",
      "/integrations/fixtures/[slug]",
      "/synthetic",
      "/synthetic/[slug]",
      "/synthetic/fixtures",
      "/synthetic/fixtures/[slug]",
      "/synthetic/validation"
    ],
    auditStatus: "compile-covered",
    evidence: "Static build and existing validation APIs cover connector contracts, fixture diffs, and synthetic route rendering.",
    retainedBoundary: "Synthetic validation does not authorize production connectors, PHI ingestion, payer submission, or live clinical workflow execution."
  },
  {
    name: "Trust, market, operations, and platform context",
    purpose: "Maintain public trust posture, market activation, source intelligence, deployment profiles, operations blockers, and platform modules.",
    owner: "Operations, Trust Safety Ops, and Market Activation",
    routes: [
      "/trust-center",
      "/trust-center/[slug]",
      "/trust",
      "/company-assessment",
      "/clinical-production-readiness",
      "/pilot-demo-commercial-readiness",
      "/trust-os",
      "/trust-safety-operations",
      "/claims",
      "/limitations-workarounds",
      "/launch-readiness",
      "/competitive-defense",
      "/competitive-intelligence",
      "/continuous-review-audit",
      "/enterprise-business-ops",
  "/enterprise-scalability",
  "/platform-power",
  "/production-architecture",
  "/workflows/execution-attempts",
  "/limitations-workarounds",
      "/offerings",
      "/client-onboarding",
      "/service-delivery",
      "/service-reliability",
      "/operational-efficiency",
      "/scrimed-automation-autopilot",
      "/market-activation",
      "/global-certification-readiness",
      "/global-reach",
      "/sales-attribution",
      "/attribution-analytics",
      "/source-intelligence",
      "/deployment-profiles",
      "/operations",
      "/quality",
      "/operating-context",
      "/health-records",
      "/healthcare-optimization-command",
      "/healthcare-intelligence-os",
      "/production-architecture",
      "/scrimed-intelligence-platform",
      "/scrimed-operating-command",
      "/platform",
      "/governance-packs",
      "/faithcore",
      "/modules/clinical-copilot",
      "/modules/docutwin",
      "/modules/carepath-ai",
      "/modules/trialcore",
      "/modules/watchtower"
    ],
    auditStatus: "linked",
    evidence: "Hub route inventory, Product Console summaries, and public smoke for Global Reach and quality-critical lanes keep these surfaces discoverable.",
    retainedBoundary: "Public trust and market pages remain claims-controlled and cannot self-certify legal, security, or regulatory approvals."
  }
];

export const navigationBottlenecks: NavigationBottleneck[] = [
  {
    name: "Whole-company operating fragmentation",
    status: "contained",
    impact:
      "Product, service, launch, revenue, legal, certification, cybersecurity, AI, health-record, investor, and scale decisions can fragment when teams inspect only one lane at a time.",
    workaround:
      "Use /company-assessment as the top-level operating cockpit before routing into Product Console, Offerings, Service Delivery, Enterprise Business Ops, Platform Power, Health Records, Launch Readiness, Approvals, Global Certification, Continuous Review, Workarounds, or protected proof release.",
    owner: "Executive Operating Council + Product Console + TrustOS"
  },
  {
    name: "Clinical production readiness incompleteness",
    status: "external-review-required",
    impact:
      "Current no-PHI pilots, demos, diligence packets, and readiness services are usable now, but clinical production requires a separate task ledger, qualified external review, customer authority, and live-data controls.",
    workaround:
      "Use /clinical-production-readiness before PHI, live-care, connector, clinical AI, certification, customer go-live, or global production language expands; use current capability motions for safe revenue while the task ledger remains incomplete.",
    owner: "Clinical production readiness owner + qualified external reviewers"
  },
  {
    name: "Demo-to-pilot pricing friction",
    status: "contained",
    impact:
      "Buyers can stall when public demos, pilot programs, price bands, proof assets, intake steps, and custom diligence boundaries are not tied together before a call.",
    workaround:
      "Use /pilot-demo-commercial-readiness before demo, pilot, or pricing conversations so each buyer path has one demo, one recommended pilot, one price band, one proof list, one no-PHI intake route, and one hard-stop boundary.",
    owner: "Revenue Operations + Product Console + Deal Desk"
  },
  {
    name: "Service delivery scope drift",
    status: "contained",
    impact:
      "Sellable offers can become low-margin custom work or unsupported commitments if scope, acceptance criteria, artifacts, and authority gates are not attached before kickoff.",
    workaround:
      "Use /service-delivery to bind every package to no-PHI intake, scope matrix, work-order templates, buyer handoff, margin controls, release gates, and no-SLA/no-contract/no-live-care boundaries.",
    owner: "Delivery Lead + Product Console + Revenue Operations"
  },
  {
    name: "Route sprawl",
    status: "resolved",
    impact: "High-value pages and proof routes were harder to discover as the App Router surface grew.",
    workaround: "Use /navigation as the source-indexed route map and wire it through Homepage, Hub, Product Console, API, brief, README, systems map, and smoke coverage.",
    owner: "Product Console + Release Steward"
  },
  {
    name: "Deployment drift",
    status: "contained",
    impact:
      "A reviewed local build can pass while the live production target still serves an older deployment or returns 404 for new buyer-critical routes.",
    workaround:
      "Use /deployment-drift-guard, /api/deployment-drift-guard, and npm run smoke:deployment-drift-guard against local and production targets before buyer, investor, launch, or proof-packet promotion.",
    owner: "Release Steward + Platform Engineering"
  },
  {
    name: "Protected happy-path proof",
    status: "operator-required",
    impact: "Unauthenticated checks can prove fail-closed behavior, but not successful tenant-scoped protected mutations.",
    workaround: "Use /pilot-workspace/access with an active human AAL2 browser session or a deliberate one-time short-lived token run without retaining token values.",
    owner: "Approved tenant-admin or pilot-lead operator"
  },
  {
    name: "Dynamic detail route coverage",
    status: "contained",
    impact: "Dynamic pages compile, but public smoke focuses on canonical entry points instead of crawling every slug variant.",
    workaround: "Keep route inventory visible here, use typecheck/build for every dynamic segment, and add targeted slug smoke when a dynamic route becomes buyer-critical.",
    owner: "Release Steward"
  },
  {
    name: "External approvals and certifications",
    status: "external-review-required",
    impact: "Navigation can show approval and certification tracks, but SCRIMED cannot self-certify legal, security, HIPAA, FDA, ONC, EU AI Act, GDPR, NHS, MHRA, Australia, reimbursement, procurement, or clinical-use authority.",
    workaround: "Keep approval and certification routes claims-controlled, attach only qualified external evidence, and preserve no-authority headers until formal approval exists.",
    owner: "Founder + qualified external reviewers"
  },
  {
    name: "Capital and securities boundaries",
    status: "external-review-required",
    impact:
      "Revenue, moat, investor, and funding readiness can be mistaken for securities offering material, audited financial reporting, valuation assurance, or investment advice.",
    workaround:
      "Use /capital-vitality for readiness-only proof, keep no-securities/no-advice headers visible, and route fundraising, valuation, legal, tax, and investor-solicitation materials through qualified counsel.",
    owner: "Founder + qualified counsel + finance reviewers"
  },
  {
    name: "Growth execution concentration",
    status: "operator-required",
    impact:
      "Proof depth can diffuse commercial focus unless buyer segments, sellable offers, conversion lanes, and next actions stay prioritized.",
    workaround:
      "Use /growth-engine to keep founder-led assessment outreach, synthetic pilot pipeline, governance audit packaging, and protected diligence upgrades in one operating lane.",
    owner: "Founder + Product Console + Sales Operations"
  },
  {
    name: "Enterprise legal and finance operating depth",
    status: "external-review-required",
    impact:
      "Enterprise revenue, margins, contracts, accounting, tax, investor, and board materials can create risk if authority is informal or claims outrun qualified review.",
    workaround:
      "Use /enterprise-business-ops to route deal desk, price floors, margin controls, legal/accounting/tax roles, billing readiness, and blocked business claims through named owners before commitments expand.",
    owner: "Founder + qualified counsel + finance/accounting/tax reviewers"
  },
  {
    name: "Enterprise scalability commitment boundaries",
    status: "external-review-required",
    impact:
      "Capacity, SLO, support, region, residency, disaster recovery, and managed-service language can become accidental commitments if not routed before buyer use.",
    workaround:
      "Use /enterprise-scalability to attach capacity assumptions, tenant owners, support-tier review, no-SLA language, regional gates, cost thresholds, and qualified contract review before commitments expand.",
    owner: "Platform + service reliability + customer operations + legal ops"
  },
  {
    name: "API UI AI platform power authority boundaries",
    status: "external-review-required",
    impact:
      "API contracts, UI improvements, live AI, model routing, agent tool use, accessibility, and scale-positioning language can become unsupported enterprise claims if they are not routed through proof and authority controls.",
    workaround:
      "Use /platform-power to attach API owners, UI role journeys, model-route registers, agent approval triggers, eval evidence, cost owners, and no-live-AI/no-PHI/no-SLA boundaries before claims expand.",
    owner: "Platform engineering + Product Console + TrustOS + security + finance"
  },
  {
    name: "Limitations workaround drift",
    status: "contained",
    impact:
      "Safe alternatives can turn into informal permission when workaround packets do not have expiration rules, escalation triggers, and graduation gates.",
    workaround:
      "Use /limitations-workarounds to attach every repeated issue to a packet, owner, proof route, cadence, hard stop, and promotion path before buyer or release language expands.",
    owner: "Boundary owner + Operational Efficiency + Product Console"
  },
  {
    name: "Autonomy expansion pressure",
    status: "contained",
    impact:
      "Automation can accelerate SCRIMED, but unsafely expanding it could imply production remediation, patient outreach, payer submission, EHR writeback, credential mutation, clinical authority, or customer go-live.",
    workaround:
      "Use /scrimed-automation-autopilot to classify every automation lane as manual-only, recommendation-only, review-gated automation, or synthetic autopilot before action authority expands.",
    owner: "TrustOS + Platform Engineering + Release Steward"
  },
  {
    name: "Local shell runtime path",
    status: "contained",
    impact: "The managed local shell may omit node/npm from PATH even though the bundled runtime works.",
    workaround: "Use the bundled Node path for local checks and keep npm lifecycle scripts documented through Release Continuity and Operations readiness.",
    owner: "Release Steward"
  },
  {
    name: "Sandbox DNS resolution",
    status: "contained",
    impact:
      "Restricted local sandbox execution can return ENOTFOUND for app.scrimedsolutions.com even when the branded production domain passes from approved network access.",
    workaround:
      "Use /launch-readiness and the launch-domain preflight to classify sandbox DNS separately, require strict branded-domain smoke from approved network access before launch, and treat fallback Vercel URL success as continuity-only evidence.",
    owner: "Release Steward + Domain/DNS administrator"
  }
];

function unique(values: string[]) {
  return Array.from(new Set(values));
}

export function getNavigationAuditSummary() {
  const auditedNavigationRoutes = unique(navigationGroups.flatMap((group) => group.routes));
  const missingInventoryLinks = auditedNavigationRoutes.filter(
    (route) => !pageRouteInventory.includes(route)
  );
  const operatorRequiredBottleneckCount = navigationBottlenecks.filter(
    (bottleneck) => bottleneck.status === "operator-required"
  ).length;
  const externalReviewBottleneckCount = navigationBottlenecks.filter(
    (bottleneck) => bottleneck.status === "external-review-required"
  ).length;
  const containedBottleneckCount = navigationBottlenecks.filter(
    (bottleneck) => bottleneck.status === "contained"
  ).length;
  const resolvedBottleneckCount = navigationBottlenecks.filter(
    (bottleneck) => bottleneck.status === "resolved"
  ).length;

  return {
    service: "scrimed-navigation-audit",
    route: "/navigation",
    apiRoute: "/api/navigation-audit",
    briefRoute: "/api/navigation-audit/brief",
    status: navigationAuditProofStackStatus,
    briefStatus: navigationAuditBriefProofStackStatus,
    boundary: navigationAuditBoundary,
    sourceTotals: {
      pageRouteCount: pageRouteInventory.length,
      apiRoutePatternCount: expectedApiRoutePatternCount,
      dynamicPageRouteCount: pageRouteInventory.filter((route) => route.includes("[")).length
    },
    coverage: {
      navigationGroupCount: navigationGroups.length,
      siteNavigationSectionCount: siteNavigationSections.length,
      roleJourneyCount: siteNavigationJourneys.length,
      limitationControlCount: limitationControlLinks.length,
      auditedNavigationRouteCount: auditedNavigationRoutes.length,
      smokeCoveredHtmlRouteCount: smokeCoveredHtmlRoutes.length,
      missingInventoryLinkCount: missingInventoryLinks.length,
      pageInventoryStatus:
        missingInventoryLinks.length === 0 ? "all-navigation-links-in-inventory" : "inventory-gap",
      apiRouteCoverageStatus: "typecheck-build-and-targeted-smoke",
      protectedCoverageStatus: "fail-closed-publicly-aal2-required-for-happy-path",
      releaseAuthority: "not-release-approval",
      phiAuthority: "not-authorized-production-phi",
      clinicalCareAuthority: "not-authorized-live-care",
      securityCertification: "not-security-certified",
      approvalAuthority: "external-review-required"
    },
    bottleneckCount: navigationBottlenecks.length,
    resolvedBottleneckCount,
    containedBottleneckCount,
    operatorRequiredBottleneckCount,
    externalReviewBottleneckCount,
    groups: navigationGroups,
    siteNavigationSections,
    roleJourneys: siteNavigationJourneys,
    limitationControls: limitationControlLinks,
    bottlenecks: navigationBottlenecks,
    pageRouteInventory,
    smokeCoveredHtmlRoutes,
    auditedNavigationRoutes,
    missingInventoryLinks,
    nextOperatorActions: [
      "Use /navigation before each release to check route inventory, source counts, smoke scope, and retained limitations.",
      "Use /launch-readiness before public launch, buyer campaigns, investor packet release, or board review to separate sandbox DNS false negatives from real production-domain launch gates.",
      "Use /competitive-defense before public competitor comparisons, security claims, privacy claims, investor packets, sales decks, or launch expansion to keep no-copy, no-PHI, no-certification, no-partnership, and qualified-review gates explicit.",
      "Use the persistent site navigation to move buyers, operators, reviewers, and global partners into their role-specific paths from every page.",
      "Add new high-value routes to the right navigation group and public smoke when they become buyer-critical.",
      "Use /platform-power before API, UI, AI, model-route, agent-tool, accessibility, or scale-equivalence claims expand.",
      "Use /limitations-workarounds when a request is blocked so the safe path, escalation owner, proof route, and graduation gate are explicit.",
      "Use /investor-audience-readiness when preparing angel, corporate strategic, private investor, faith-based clinic, public-sector, payer, health-system, clinician, global partner, or transformation-sponsor conversations.",
      "Keep protected routes fail-closed publicly and run happy-path proof only through an active human AAL2 session.",
      "Keep approval, PHI, clinical-care, connector, release, and security-certification claims gated until qualified external evidence exists."
    ],
    updated: navigationAuditUpdatedAt
  };
}

export function buildNavigationAuditBrief() {
  const summary = getNavigationAuditSummary();

  return [
    "# SCRIMED Navigation Audit Brief",
    "",
    `Status: ${summary.status}`,
    `Page route count: ${summary.sourceTotals.pageRouteCount}`,
    `API route pattern count: ${summary.sourceTotals.apiRoutePatternCount}`,
    `Dynamic page route count: ${summary.sourceTotals.dynamicPageRouteCount}`,
    `Navigation groups: ${summary.coverage.navigationGroupCount}`,
    `Site navigation sections: ${summary.coverage.siteNavigationSectionCount}`,
    `Role journeys: ${summary.coverage.roleJourneyCount}`,
    `Limitation controls: ${summary.coverage.limitationControlCount}`,
    `Audited navigation routes: ${summary.coverage.auditedNavigationRouteCount}`,
    `Smoke-covered HTML routes: ${summary.coverage.smokeCoveredHtmlRouteCount}`,
    `Protected coverage: ${summary.coverage.protectedCoverageStatus}`,
    `Release authority: ${summary.coverage.releaseAuthority}`,
    `PHI authority: ${summary.coverage.phiAuthority}`,
    `Clinical care authority: ${summary.coverage.clinicalCareAuthority}`,
    `Security certification: ${summary.coverage.securityCertification}`,
    `Approval authority: ${summary.coverage.approvalAuthority}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is not release approval, legal approval, security certification, HIPAA certification, FDA clearance, ONC certification, production connector approval, PHI processing approval, token authorization, or live clinical authorization.",
    "",
    "## Navigation Groups",
    ...summary.groups.map(
      (group) =>
        `- ${group.name} (${group.auditStatus}): ${group.purpose} Routes: ${group.routes.join(", ")} Boundary: ${group.retainedBoundary}`
    ),
    "",
    "## Role Journeys",
    ...summary.roleJourneys.map(
      (journey) =>
        `- ${journey.audience}: start at ${journey.route}; sequence ${journey.sequence.join(" -> ")}. Outcome: ${journey.outcome} Boundary: ${journey.boundary}`
    ),
    "",
    "## Limitation Controls",
    ...summary.limitationControls.map(
      (link) =>
        `- ${link.label}: ${link.href}. ${link.description} Boundary: ${link.boundary ?? "review required"}`
    ),
    "",
    "## Bottlenecks",
    ...summary.bottlenecks.map(
      (bottleneck) =>
        `- ${bottleneck.name} (${bottleneck.status}): ${bottleneck.impact} Workaround: ${bottleneck.workaround} Owner: ${bottleneck.owner}`
    ),
    "",
    "## Page Route Inventory",
    ...summary.pageRouteInventory.map((route) => `- ${route}`),
    "",
    "## Next Operator Actions",
    ...summary.nextOperatorActions.map((action) => `- ${action}`)
  ].join("\n");
}
