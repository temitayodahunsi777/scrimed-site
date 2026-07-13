import {
  productServiceOfferings,
  productServicePackages,
  productServicePortfolioRoute
} from "./productServicePortfolio";

export type ServiceDeliveryStatus =
  | "ready-to-scope"
  | "active-delivery-template"
  | "protected-gated"
  | "external-review-required"
  | "blocked-before-approval";

export type ServiceDeliveryOffer = {
  slug: string;
  name: string;
  portfolioOfferSlug: string;
  status: ServiceDeliveryStatus;
  serviceOwner: string;
  deliveryWindow: string;
  buyerPromise: string;
  kickoffInputs: string[];
  deliverables: string[];
  acceptanceCriteria: string[];
  evidenceRoutes: string[];
  escalationTriggers: string[];
  marginProtection: string[];
  retainedBoundary: string;
};

export type ServiceDeliveryPhase = {
  phase: string;
  status: ServiceDeliveryStatus;
  owner: string;
  purpose: string;
  entryCriteria: string[];
  exitCriteria: string[];
  proofRoutes: string[];
  hardStop: string;
};

export type ServiceDeliveryWorkOrderTemplate = {
  slug: string;
  title: string;
  status: ServiceDeliveryStatus;
  owner: string;
  appliesToOfferSlugs: string[];
  tasks: string[];
  acceptanceCriteria: string[];
  outputArtifact: string;
  proofRoutes: string[];
  hardStops: string[];
};

export type ServiceDeliveryArtifact = {
  slug: string;
  artifact: string;
  owner: string;
  purpose: string;
  requiredFields: string[];
  releaseRule: string;
  retainedBoundary: string;
};

export type ServiceDeliveryActivationGate = {
  gate: string;
  status: ServiceDeliveryStatus;
  owner: string;
  trigger: string;
  passCondition: string;
  failClosedAction: string;
  retainedBoundary: string;
};

export type ServiceDeliveryPackageBinding = {
  packageSlug: string;
  packageName: string;
  deliveryLane: string;
  workOrderTemplates: string[];
  buyerHandoff: string;
  marginRule: string;
  retainedBoundary: string;
};

export type ServiceDeliveryLiveActivationStatus =
  | "public-demo-ready"
  | "no-phi-service-ready"
  | "protected-pilot-candidate"
  | "blocked-before-live-production";

export type ServiceDeliveryLiveActivationPlan = {
  slug: string;
  offerSlug: string;
  offerName: string;
  activationStatus: ServiceDeliveryLiveActivationStatus;
  deploymentPosture: "public_route_ready" | "no_phi_delivery_ready" | "protected_workspace_required" | "external_approval_required";
  salesReadinessScore: number;
  deliveryReadinessScore: number;
  revenueReadinessScore: number;
  supportReadinessScore: number;
  requiredBeforeLive: string[];
  nextSafeGoLiveStep: string;
  safeLaunchMotion: string;
  revenueMotion: string;
  supportMotion: string;
  blockedBeforeGoLive: string[];
  proofRoutes: string[];
  humanReviewRequired: true;
  productionAuthority: false;
};

export const serviceDeliveryRoute = "/service-delivery";
export const serviceDeliveryApiRoute = "/api/service-delivery";
export const serviceDeliveryBriefRoute = "/api/service-delivery/brief";
export const serviceDeliveryStatus = "service-delivery-workbench-active";
export const serviceDeliveryBriefStatus = "service-delivery-brief-ready-no-sla-authority";
export const serviceDeliveryUpdatedAt = "2026-06-26";

export const serviceDeliveryBoundary =
  "SCRIMED Service Delivery Workbench converts packaged offers into scoped work orders, delivery phases, acceptance criteria, buyer handoffs, proof routes, margin protections, and retained healthcare authority gates. It is a product and services execution control surface only. It is not a statement of work, contract approval, legal advice, accounting advice, tax advice, audited financial reporting, contractual SLA, uptime guarantee, managed-service commitment, customer permission, revenue guarantee, profit-margin guarantee, clinical validation, compliance certification, security certification, PHI processing authority, production connector approval, EHR writeback approval, payer submission approval, or live clinical care authorization.";

export const serviceDeliveryHardStops = [
  "No PHI, patient identifiers, production credentials, or live endpoints in public intake.",
  "No delivery starts without named sponsor, owner, scope, package, and acceptance criteria.",
  "No buyer-facing value, ROI, clinical, reimbursement, certification, or security claim without qualified review.",
  "No contract, SOW, pricing, revenue-recognition, accounting, tax, or payment promise without qualified business review.",
  "No protected evidence release without AAL2 workspace, reviewer signoff, release decision, recipient control, and access-log path.",
  "No production connector, EHR writeback, payer submission, patient outreach, diagnosis, treatment, or live clinical workflow.",
  "No public quantum, autonomous-remediation, managed SOC/MDR, attack-proof, or error-free AI claim.",
  "No custom implementation expansion unless a change order or separately scoped work order exists."
];

export const serviceDeliveryOffers: ServiceDeliveryOffer[] = [
  {
    slug: "workflow-intelligence-assessment-delivery",
    name: "Workflow Intelligence Assessment Delivery",
    portfolioOfferSlug: "workflow-intelligence-assessment",
    status: "ready-to-scope",
    serviceOwner: "Product Console and Revenue Operations",
    deliveryWindow: "2 to 4 weeks",
    buyerPromise:
      "Turn one to three operational pain points into a no-PHI workflow map, automation scorecard, evidence inventory, and next-package decision.",
    kickoffInputs: [
      "Named sponsor and workflow owner",
      "Target workflow list",
      "Current-state questions and pain points",
      "No-PHI discovery boundary acknowledgement"
    ],
    deliverables: [
      "Workflow friction map",
      "Automation candidate scorecard",
      "Evidence inventory and missing-data register",
      "Pilot or readiness-sprint recommendation"
    ],
    acceptanceCriteria: [
      "All scoped workflows have owner, friction, evidence, and next action recorded",
      "Buyer confirms no PHI or production credentials were provided",
      "Recommendation is tied to a proof route and retained boundary"
    ],
    evidenceRoutes: ["/offerings", "/product", "/growth-engine", "/operational-efficiency"],
    escalationTriggers: [
      "Buyer requests PHI review",
      "Buyer asks for guaranteed savings or ROI",
      "Scope expands beyond three workflows"
    ],
    marginProtection: [
      "Fixed fee",
      "Capped workflow count",
      "Change order for expanded mapping"
    ],
    retainedBoundary:
      "Operational intelligence only; no clinical advice, production automation, PHI processing, or guaranteed savings."
  },
  {
    slug: "health-records-safety-assessment-delivery",
    name: "Health Records Safety Assessment Delivery",
    portfolioOfferSlug: "health-records-safety-assessment",
    status: "active-delivery-template",
    serviceOwner: "Health Records Safety Exchange, Interoperability, Privacy, and Clinical Governance",
    deliveryWindow: "2 to 5 weeks",
    buyerPromise:
      "Map safe record extraction, source attribution, patient-safety linting, interoperability standards, and live-data approval gates without accepting PHI.",
    kickoffInputs: [
      "Source system class",
      "Document or record-type inventory",
      "Privacy/security owner",
      "Clinical reviewer owner for safety questions"
    ],
    deliverables: [
      "No-PHI extraction map",
      "FHIR/HL7/DICOM/X12/terminology crosswalk",
      "Source-attribution test plan",
      "Live-data gate and workaround map"
    ],
    acceptanceCriteria: [
      "Every source type has a safety check and retained approval gate",
      "Synthetic extraction path is separated from live-data path",
      "Blocked actions are visible in the handoff"
    ],
    evidenceRoutes: ["/health-records", "/interoperability", "/clinical-authority-readiness", "/boundary-resolution"],
    escalationTriggers: [
      "Buyer submits PHI",
      "Buyer requests patient matching",
      "Buyer requests writeback, payer submission, or live clinical action"
    ],
    marginProtection: [
      "Assessment excludes live connector build",
      "Separate protected-pilot or connector SOW",
      "Reusable extraction checklist"
    ],
    retainedBoundary:
      "No-PHI extraction planning only; patient matching, production connectors, writeback, payer submission, and clinical action remain blocked."
  },
  {
    slug: "interoperability-readiness-sprint-delivery",
    name: "Interoperability Readiness Sprint Delivery",
    portfolioOfferSlug: "interoperability-readiness-sprint",
    status: "active-delivery-template",
    serviceOwner: "Interoperability Control Plane and Platform Engineering",
    deliveryWindow: "30 to 45 days",
    buyerPromise:
      "Prepare a standards-aware connector path, synthetic conformance evidence, and implementation sequence before production access is requested.",
    kickoffInputs: [
      "Target integration pattern",
      "Standards named by buyer",
      "Integration owner",
      "Security and privacy review path"
    ],
    deliverables: [
      "Connector readiness map",
      "Standards binding register",
      "Synthetic conformance evidence",
      "Implementation sequence and open gates"
    ],
    acceptanceCriteria: [
      "Every target standard has evidence route, owner, and gate",
      "No live endpoint dependency exists inside sprint scope",
      "Production connector approval is separated from readiness work"
    ],
    evidenceRoutes: ["/interoperability", "/interoperability/evaluations", "/integrations/fixture-validation", "/platform-power"],
    escalationTriggers: [
      "Buyer asks for live endpoint credentials",
      "Buyer requests public API SLA",
      "Security or privacy reviewer flags unresolved control"
    ],
    marginProtection: [
      "Conformance templates reused",
      "No custom live connector in sprint",
      "Connector SOW priced separately"
    ],
    retainedBoundary:
      "Readiness and synthetic conformance only; production connector, PHI, security, privacy, and customer environment approval remain external gates."
  },
  {
    slug: "trustos-ai-governance-audit-delivery",
    name: "TrustOS AI Governance Audit Delivery",
    portfolioOfferSlug: "trustos-ai-governance-audit",
    status: "ready-to-scope",
    serviceOwner: "TrustOS, Claim Guard, Legal Ops, Security, and Clinical Governance",
    deliveryWindow: "2 to 4 weeks",
    buyerPromise:
      "Create a governed AI adoption review with claims controls, oversight map, audit evidence plan, and approval-gate ladder.",
    kickoffInputs: [
      "Intended-use language",
      "AI workflow or vendor context",
      "Governance sponsor",
      "Qualified reviewer owner"
    ],
    deliverables: [
      "AI governance gap register",
      "Claims and prohibited-language review",
      "Human-review responsibility model",
      "Approval and certification readiness path"
    ],
    acceptanceCriteria: [
      "Claims are classified as approved, evidence-required, or prohibited",
      "Human review ownership is explicit",
      "Legal, security, clinical, and regulatory conclusions are routed to qualified reviewers"
    ],
    evidenceRoutes: ["/trust-os", "/qa-claim-guard", "/approvals-readiness", "/global-certification-readiness"],
    escalationTriggers: [
      "Buyer requests legal approval",
      "Buyer requests certification language",
      "Clinical authority or medical-device language appears"
    ],
    marginProtection: [
      "Repeatable TrustOS review pack",
      "External review excluded unless scoped",
      "Retainer path for continuous review"
    ],
    retainedBoundary:
      "Governance readiness only; legal, regulatory, security, certification, and clinical authority require qualified external review."
  },
  {
    slug: "synthetic-pilot-evaluation-delivery",
    name: "Synthetic Pilot Evaluation Delivery",
    portfolioOfferSlug: "synthetic-pilot-evaluation",
    status: "protected-gated",
    serviceOwner: "Product Console, AgentOS, Atlas, TrustOS, QA, and Buyer Diligence",
    deliveryWindow: "45 to 90 days",
    buyerPromise:
      "Run governed synthetic workflow evaluation with workflow packets, Trust Cards, QA evidence, metrics, and protected-pilot recommendation.",
    kickoffInputs: [
      "Sponsor and review team",
      "Synthetic packet approval",
      "Workflow count and success metrics",
      "Protected evidence and release owners"
    ],
    deliverables: [
      "Synthetic workflow packet",
      "AgentOS task plan",
      "Atlas evidence mapping",
      "TrustOS decision and QA evidence packet",
      "Protected-pilot or license recommendation"
    ],
    acceptanceCriteria: [
      "Synthetic scenarios are approved before execution",
      "QA evidence and claim guard are complete before buyer proof language",
      "Protected evidence release remains AAL2 gated"
    ],
    evidenceRoutes: ["/pilots", "/evaluation", "/qa-evidence", "/qa-buyer-proof-release", "/pilot-workspace/access"],
    escalationTriggers: [
      "Buyer requests live data",
      "Buyer requests customer-specific external release",
      "Buyer changes success metrics mid-run"
    ],
    marginProtection: [
      "Paid pilot",
      "Capped workflow count",
      "Evidence-room and custom diligence priced separately"
    ],
    retainedBoundary:
      "Synthetic evaluation only; no diagnosis, treatment, payer submission, patient outreach, live PHI, or production connector execution."
  },
  {
    slug: "enterprise-proof-deal-room-delivery",
    name: "Enterprise Proof and Deal Room Delivery",
    portfolioOfferSlug: "enterprise-proof-deal-room-activation",
    status: "protected-gated",
    serviceOwner: "Buyer Diligence, Sales Operations, Release Steward, Legal Ops, and Security",
    deliveryWindow: "2 to 8 weeks depending on buyer diligence",
    buyerPromise:
      "Package buyer-specific diligence, proof packets, release decisions, protected evidence-room boundaries, quote-to-contract inputs, and next action.",
    kickoffInputs: [
      "Buying committee",
      "Diligence request list",
      "Release decision owner",
      "Protected workspace access path"
    ],
    deliverables: [
      "Buyer proof route map",
      "Diligence packet inventory",
      "Release decision checklist",
      "Quote-to-contract handoff inputs"
    ],
    acceptanceCriteria: [
      "Every external packet has release authority, recipient control, and access-log route",
      "Custom claims are routed to Claim Guard",
      "Contract and pricing commitments are separated from proof work"
    ],
    evidenceRoutes: ["/pilot-deal-room", "/buyer-release-control-run", "/pilot-workspace/access", "/enterprise-business-ops"],
    escalationTriggers: [
      "Buyer asks for customer names or protected evidence",
      "Buyer requests security certification or penetration-test claim",
      "Buyer asks for signed terms or pricing commitment"
    ],
    marginProtection: [
      "Paid diligence line item",
      "Expiration date on custom packet labor",
      "Legal/security review scoped separately"
    ],
    retainedBoundary:
      "Diligence activation only; external sharing, customer permission, certification, signed contracts, and production activation remain gated."
  },
  {
    slug: "continuous-review-innovation-retainer-delivery",
    name: "Continuous Review and Innovation Retainer Delivery",
    portfolioOfferSlug: "continuous-review-innovation-retainer",
    status: "active-delivery-template",
    serviceOwner: "TrustOps, QA, Security, Claim Guard, and Internal Research Team",
    deliveryWindow: "Monthly retained cadence",
    buyerPromise:
      "Operate agent-assisted accuracy review, evidence attribution, claims drift, security drift, incident learning, and internal innovation backlog with human approval gates.",
    kickoffInputs: [
      "Accountable owner",
      "Review loop selection",
      "Escalation rule",
      "Innovation research disclosure boundary"
    ],
    deliverables: [
      "Review loop cadence",
      "Accuracy and attribution issue queue",
      "Claims drift review",
      "Security and dependency drift triage",
      "Internal innovation backlog"
    ],
    acceptanceCriteria: [
      "Human owner approves every remediation or public claim",
      "Quantum or future research stays internal unless approved",
      "Escalations become separately scoped work when implementation labor is required"
    ],
    evidenceRoutes: ["/continuous-review-audit", "/service-reliability", "/operational-efficiency", "/qa-evidence"],
    escalationTriggers: [
      "Production remediation requested",
      "Security incident suspected",
      "Public future-tech claim requested"
    ],
    marginProtection: [
      "Recurring retainer",
      "Escalation labor priced separately",
      "Research backlog separated from production commitments"
    ],
    retainedBoundary:
      "Agent-assisted and internal-research cadence only; humans approve remediation, public claims, production changes, and innovation disclosures."
  }
];

export const serviceDeliveryPhases: ServiceDeliveryPhase[] = [
  {
    phase: "Qualify",
    status: "ready-to-scope",
    owner: "Revenue Operations",
    purpose: "Confirm buyer, sponsor, package, budget posture, no-PHI boundary, and decision owner before work is promised.",
    entryCriteria: ["Inbound request", "Buyer segment", "Target offer"],
    exitCriteria: ["Sponsor named", "Scope lane selected", "Boundary accepted"],
    proofRoutes: ["/client-onboarding", "/offerings", "/sales-operations"],
    hardStop: "Stop when sponsor, package, or no-PHI boundary is missing."
  },
  {
    phase: "Scope",
    status: "active-delivery-template",
    owner: "Product Console and Delivery Lead",
    purpose: "Translate buyer interest into capped workflow count, deliverables, acceptance criteria, proof routes, and excluded work.",
    entryCriteria: ["Qualified sponsor", "Offer selected", "Discovery notes"],
    exitCriteria: ["Scope matrix approved", "Acceptance criteria recorded", "Excluded claims listed"],
    proofRoutes: ["/service-delivery", "/offerings", "/enterprise-business-ops"],
    hardStop: "Stop when requested work requires contract, legal, finance, PHI, connector, or clinical authority approval."
  },
  {
    phase: "Kickoff",
    status: "active-delivery-template",
    owner: "Delivery Lead and Customer Operations",
    purpose: "Set owner map, cadence, artifacts, review checkpoints, communication path, and escalation rules.",
    entryCriteria: ["Scope matrix", "Buyer owners", "Review cadence"],
    exitCriteria: ["Kickoff brief", "Work-order board", "Human-review owners"],
    proofRoutes: ["/client-onboarding", "/service-delivery", "/continuous-review-audit"],
    hardStop: "Stop when buyer requests autonomous communication, calendar send, or unsupported SLA commitments."
  },
  {
    phase: "Configure",
    status: "protected-gated",
    owner: "Platform, AgentOS, Atlas, TrustOS, and QA",
    purpose: "Prepare synthetic fixtures, task plans, evidence routes, TrustOS gates, and QA checks for scoped work orders.",
    entryCriteria: ["Approved work order", "Synthetic scenario", "Evidence route"],
    exitCriteria: ["Fixture plan", "Agent task map", "QA checklist", "Blocked action list"],
    proofRoutes: ["/evaluation", "/qa-evidence", "/platform-power"],
    hardStop: "Stop when live endpoints, production credentials, PHI, or patient identifiers are requested."
  },
  {
    phase: "Execute",
    status: "protected-gated",
    owner: "Delivery Lead, AgentOS, TrustOS, and named human reviewers",
    purpose: "Run scoped no-PHI work orders, collect evidence, route issues, and prevent claim expansion.",
    entryCriteria: ["Configured work order", "Reviewer owner", "QA checklist"],
    exitCriteria: ["Evidence packet", "Issue queue", "Acceptance memo candidate"],
    proofRoutes: ["/qa-run-control", "/qa-completion-bridge", "/qa-claim-guard"],
    hardStop: "Stop when a result would imply diagnosis, treatment, reimbursement, certification, security approval, or production authorization."
  },
  {
    phase: "Review",
    status: "external-review-required",
    owner: "Claim Guard, Legal Ops, Security, Finance, and Clinical Governance as needed",
    purpose: "Approve or block buyer-facing language, external packet release, business terms, security claims, and clinical implications.",
    entryCriteria: ["Evidence packet", "Draft claims", "Release audience"],
    exitCriteria: ["Release decision", "Blocked claims", "Qualified-review notes"],
    proofRoutes: ["/qa-buyer-proof-release", "/buyer-release-control-run", "/enterprise-business-ops"],
    hardStop: "Stop when qualified review is missing for legal, security, finance, tax, clinical, regulatory, or certification language."
  },
  {
    phase: "Handoff",
    status: "active-delivery-template",
    owner: "Delivery Lead, Revenue Operations, and Customer Operations",
    purpose: "Deliver artifacts, confirm acceptance, route unresolved gates, and recommend next paid package or retainer.",
    entryCriteria: ["Release decision", "Acceptance evidence", "Open gates"],
    exitCriteria: ["Buyer handoff packet", "Expansion recommendation", "Retained boundary register"],
    proofRoutes: ["/growth-engine", "/pilot-deal-room", "/service-delivery"],
    hardStop: "Stop when buyer asks for implementation expansion without change order, SOW, protected pilot, or license approval."
  }
];

export const serviceDeliveryWorkOrderTemplates: ServiceDeliveryWorkOrderTemplate[] = [
  {
    slug: "buyer-discovery-no-phi-intake",
    title: "Buyer Discovery and No-PHI Intake",
    status: "active-delivery-template",
    owner: "Revenue Operations",
    appliesToOfferSlugs: serviceDeliveryOffers.map((offer) => offer.portfolioOfferSlug),
    tasks: [
      "Capture buyer problem, sponsor, owner, offer, and desired decision",
      "Reject PHI, patient identifiers, production credentials, and live endpoints",
      "Map requested claims to approved, evidence-required, or prohibited language"
    ],
    acceptanceCriteria: [
      "Sponsor and owner are recorded",
      "No-PHI boundary is acknowledged",
      "Offer and package are selected"
    ],
    outputArtifact: "Scoped intake sheet",
    proofRoutes: ["/client-onboarding", "/offerings", "/claims"],
    hardStops: ["PHI in intake", "No sponsor", "Unsupported claim requested"]
  },
  {
    slug: "scope-matrix-and-acceptance-plan",
    title: "Scope Matrix and Acceptance Plan",
    status: "active-delivery-template",
    owner: "Product Console",
    appliesToOfferSlugs: serviceDeliveryOffers.map((offer) => offer.portfolioOfferSlug),
    tasks: [
      "Convert offer into capped workflow count, deliverables, review owners, and evidence routes",
      "Define acceptance criteria and excluded work",
      "Attach margin protections and escalation triggers"
    ],
    acceptanceCriteria: [
      "Deliverables and acceptance criteria are paired",
      "Excluded work is explicit",
      "Escalation triggers are mapped"
    ],
    outputArtifact: "Scope matrix",
    proofRoutes: ["/service-delivery", "/enterprise-business-ops", "/operational-efficiency"],
    hardStops: ["Uncapped scope", "No acceptance criteria", "Contract-like commitment without review"]
  },
  {
    slug: "workflow-and-system-boundary-map",
    title: "Workflow and System Boundary Map",
    status: "active-delivery-template",
    owner: "Delivery Lead and Interoperability",
    appliesToOfferSlugs: [
      "workflow-intelligence-assessment",
      "health-records-safety-assessment",
      "interoperability-readiness-sprint",
      "clinical-operations-automation-blueprint"
    ],
    tasks: [
      "Map current-state workflow, source systems, handoffs, and blocked actions",
      "Separate synthetic, protected, and production paths",
      "Identify standards or record-safety dependencies"
    ],
    acceptanceCriteria: [
      "Every handoff has owner and evidence route",
      "Every live-data dependency has retained approval gate",
      "Every blocked action has workaround"
    ],
    outputArtifact: "Workflow boundary map",
    proofRoutes: ["/interoperability", "/health-records", "/limitations-workarounds"],
    hardStops: ["Live endpoint dependency", "No owner for clinical or data gate", "No workaround for blocked action"]
  },
  {
    slug: "synthetic-fixture-and-evidence-plan",
    title: "Synthetic Fixture and Evidence Plan",
    status: "protected-gated",
    owner: "AgentOS, Atlas, and QA",
    appliesToOfferSlugs: [
      "synthetic-pilot-evaluation",
      "interoperability-readiness-sprint",
      "health-records-safety-assessment"
    ],
    tasks: [
      "Select synthetic scenarios and expected outputs",
      "Map evidence references and TrustOS checkpoints",
      "Define QA pass/fail and retained packet requirements"
    ],
    acceptanceCriteria: [
      "Synthetic scenarios are no-PHI",
      "Expected outputs have evidence references",
      "QA and claim guard are attached before buyer proof"
    ],
    outputArtifact: "Synthetic evidence plan",
    proofRoutes: ["/evaluation", "/qa-evidence", "/qa-completion-bridge"],
    hardStops: ["PHI scenario", "No evidence reference", "No QA checkpoint"]
  },
  {
    slug: "standards-and-record-safety-crosswalk",
    title: "Standards and Record Safety Crosswalk",
    status: "active-delivery-template",
    owner: "Interoperability, Health Records Safety, and Clinical Governance",
    appliesToOfferSlugs: [
      "health-records-safety-assessment",
      "interoperability-readiness-sprint",
      "global-certification-readiness-pack"
    ],
    tasks: [
      "Map record types and standards",
      "Attach source-attribution and patient-safety lint checks",
      "Route live-data, connector, and writeback gates"
    ],
    acceptanceCriteria: [
      "Standards are named",
      "Source attribution is planned",
      "Writeback, payer submission, and live clinical actions are blocked"
    ],
    outputArtifact: "Standards and safety crosswalk",
    proofRoutes: ["/health-records", "/interoperability", "/clinical-authority-readiness"],
    hardStops: ["Patient matching requested", "EHR writeback requested", "Payer submission requested"]
  },
  {
    slug: "trustos-claim-and-authority-review",
    title: "TrustOS Claim and Authority Review",
    status: "external-review-required",
    owner: "TrustOS, Claim Guard, Legal Ops, Security, and Clinical Governance",
    appliesToOfferSlugs: [
      "trustos-ai-governance-audit",
      "synthetic-pilot-evaluation",
      "enterprise-proof-deal-room-activation",
      "enterprise-operating-layer-license"
    ],
    tasks: [
      "Classify claims and authority language",
      "Route legal, security, certification, clinical, and regulatory claims to qualified review",
      "Block unsupported buyer-facing proof statements"
    ],
    acceptanceCriteria: [
      "Every public or buyer-facing claim has status",
      "Qualified-review needs are explicit",
      "Blocked claims are present in handoff"
    ],
    outputArtifact: "Claim and authority review memo",
    proofRoutes: ["/qa-claim-guard", "/approvals-readiness", "/global-certification-readiness"],
    hardStops: ["Legal advice requested", "Certification claim requested", "Clinical authority claim requested"]
  },
  {
    slug: "buyer-proof-packet-release",
    title: "Buyer Proof Packet and Release Control",
    status: "protected-gated",
    owner: "Buyer Diligence and Release Steward",
    appliesToOfferSlugs: [
      "synthetic-pilot-evaluation",
      "enterprise-proof-deal-room-activation",
      "enterprise-operating-layer-license"
    ],
    tasks: [
      "Assemble evidence inventory and buyer-facing summary",
      "Attach release decision, reviewer signoff, recipient rules, and access-log path",
      "Prevent customer-specific external sharing until AAL2 release chain is complete"
    ],
    acceptanceCriteria: [
      "Release decision exists",
      "Recipient control exists",
      "Access-log route exists",
      "Claim guard is complete"
    ],
    outputArtifact: "Buyer proof packet",
    proofRoutes: ["/qa-buyer-proof-release", "/buyer-release-control-run", "/pilot-workspace/access"],
    hardStops: ["No release decision", "No recipient control", "No AAL2 protected route"]
  },
  {
    slug: "delivery-retro-expansion-recommendation",
    title: "Delivery Retro and Expansion Recommendation",
    status: "active-delivery-template",
    owner: "Delivery Lead and Growth Engine",
    appliesToOfferSlugs: serviceDeliveryOffers.map((offer) => offer.portfolioOfferSlug),
    tasks: [
      "Compare acceptance criteria to delivered artifacts",
      "Record unresolved gates, risks, margin lessons, and buyer next action",
      "Recommend next package, protected pilot, retainer, or stop"
    ],
    acceptanceCriteria: [
      "Acceptance result is recorded",
      "Unresolved gates remain visible",
      "Expansion recommendation does not create a contract or revenue guarantee"
    ],
    outputArtifact: "Delivery handoff and expansion memo",
    proofRoutes: ["/growth-engine", "/offerings", "/service-delivery"],
    hardStops: ["Implementation expansion without SOW", "Revenue guarantee requested", "Unreviewed public claim"]
  }
];

export const serviceDeliveryArtifacts: ServiceDeliveryArtifact[] = [
  {
    slug: "scoped-intake-sheet",
    artifact: "Scoped Intake Sheet",
    owner: "Revenue Operations",
    purpose: "Capture buyer, sponsor, target offer, workflow questions, and no-PHI boundary.",
    requiredFields: ["Sponsor", "Workflow target", "Offer", "No-PHI acknowledgement", "Decision owner"],
    releaseRule: "Internal and buyer-facing after no-PHI check.",
    retainedBoundary: "Does not create contract, SOW, or production authorization."
  },
  {
    slug: "scope-matrix",
    artifact: "Scope Matrix",
    owner: "Product Console and Delivery Lead",
    purpose: "Tie deliverables to acceptance criteria, proof routes, excluded work, margin protections, and escalation triggers.",
    requiredFields: ["Deliverables", "Acceptance criteria", "Excluded work", "Proof routes", "Margin controls"],
    releaseRule: "Buyer-facing only after delivery lead and business owner review.",
    retainedBoundary: "Does not approve price, legal terms, accounting, tax, or revenue recognition."
  },
  {
    slug: "work-order-board",
    artifact: "Work Order Board",
    owner: "Delivery Lead",
    purpose: "Track tasks, owners, status, evidence links, hard stops, and human-review checkpoints.",
    requiredFields: ["Task", "Owner", "Status", "Evidence", "Hard stop", "Review owner"],
    releaseRule: "Internal by default; buyer snapshot allowed when sensitive content is absent.",
    retainedBoundary: "Does not contain PHI, secrets, production credentials, or customer confidential artifacts."
  },
  {
    slug: "evidence-packet",
    artifact: "Evidence Packet",
    owner: "AgentOS, Atlas, TrustOS, and QA",
    purpose: "Package synthetic fixtures, outputs, source attribution, TrustOS decisions, QA checks, and blocked actions.",
    requiredFields: ["Scenario", "Output", "Evidence reference", "TrustOS decision", "QA status", "Blocked action"],
    releaseRule: "Protected route or public-safe summary depending on buyer release decision.",
    retainedBoundary: "Does not authorize customer-specific release, clinical validation, security certification, or live workflow use."
  },
  {
    slug: "claim-and-authority-memo",
    artifact: "Claim and Authority Memo",
    owner: "Claim Guard, Legal Ops, Security, Finance, and Clinical Governance",
    purpose: "Classify sales, buyer, investor, legal, financial, clinical, security, and regulatory language before external use.",
    requiredFields: ["Claim", "Status", "Evidence", "Reviewer", "Blocked language", "External review need"],
    releaseRule: "External use requires authorized claim status or qualified-review completion.",
    retainedBoundary: "Does not replace legal, accounting, tax, security, clinical, regulatory, or certification review."
  },
  {
    slug: "acceptance-and-handoff-memo",
    artifact: "Acceptance and Handoff Memo",
    owner: "Delivery Lead and Customer Operations",
    purpose: "Close scoped work, record acceptance result, unresolved gates, buyer next action, and recommended expansion package.",
    requiredFields: ["Delivered artifacts", "Acceptance result", "Open gates", "Buyer next action", "Recommended package"],
    releaseRule: "Buyer-facing after delivery and claim review.",
    retainedBoundary: "Does not create implementation approval, contract commitment, customer permission, revenue guarantee, or profit guarantee."
  },
  {
    slug: "retainer-research-backlog",
    artifact: "Retainer and Internal Research Backlog",
    owner: "TrustOps and Internal Research Team",
    purpose: "Route recurring review loops, innovation work, and future research assignments without public commitments.",
    requiredFields: ["Research topic", "Owner", "Risk", "Disclosure status", "Approval gate"],
    releaseRule: "Internal-only unless founder and qualified reviewers approve disclosure.",
    retainedBoundary: "Does not create public quantum capability, production roadmap commitment, or autonomous remediation promise."
  }
];

export const serviceDeliveryActivationGates: ServiceDeliveryActivationGate[] = [
  {
    gate: "No-PHI Intake Gate",
    status: "active-delivery-template",
    owner: "Revenue Operations and Privacy",
    trigger: "Every discovery, upload, intake, or buyer workshop.",
    passCondition: "Only synthetic, business-contact, workflow-scope, or metadata inputs are present.",
    failClosedAction: "Reject input, remove sensitive content from scope, and route to protected/privacy review.",
    retainedBoundary: "Does not authorize PHI processing or production data access."
  },
  {
    gate: "Sponsor and Owner Gate",
    status: "ready-to-scope",
    owner: "Revenue Operations",
    trigger: "Before scoping, kickoff, or delivery scheduling.",
    passCondition: "Sponsor, workflow owner, review owner, and decision owner are named.",
    failClosedAction: "Keep request in nurture/onboarding until ownership exists.",
    retainedBoundary: "Does not imply procurement approval or customer permission."
  },
  {
    gate: "Scope and Acceptance Gate",
    status: "active-delivery-template",
    owner: "Product Console and Delivery Lead",
    trigger: "Before a work order starts.",
    passCondition: "Deliverables, acceptance criteria, excluded work, proof routes, and hard stops are recorded.",
    failClosedAction: "Block delivery and return to scope matrix.",
    retainedBoundary: "Does not create a contract, SOW, or implementation authorization."
  },
  {
    gate: "Legal Finance Contract Gate",
    status: "external-review-required",
    owner: "Legal Ops, Finance, Accounting, Tax, and qualified reviewers",
    trigger: "Pricing, SOW, payment, revenue-recognition, tax, contract, investor, or board language appears.",
    passCondition: "Qualified owners approve or route the language.",
    failClosedAction: "Use readiness-only language and remove contract-like commitments.",
    retainedBoundary: "Does not provide legal, accounting, tax, investment, securities, valuation, or audited financial advice."
  },
  {
    gate: "Claim Guard and Authority Gate",
    status: "external-review-required",
    owner: "Claim Guard, TrustOS, Legal Ops, Security, and Clinical Governance",
    trigger: "External claim, buyer proof, investor packet, clinical implication, security statement, or certification language.",
    passCondition: "Claim is approved, evidence-required with controls, or blocked before release.",
    failClosedAction: "Block language and route to qualified review.",
    retainedBoundary: "Does not certify security/compliance or grant clinical, regulatory, reimbursement, or live-care authority."
  },
  {
    gate: "Protected Buyer Evidence Release Gate",
    status: "protected-gated",
    owner: "Release Steward and Buyer Diligence",
    trigger: "Buyer-specific packet, protected proof, customer-specific evidence, or external sharing request.",
    passCondition: "AAL2 workspace, release decision, reviewer signoff, recipient attestation, lockbox, and access-log path exist.",
    failClosedAction: "Share public-safe summary only or keep evidence internal.",
    retainedBoundary: "Does not grant customer permission, external distribution approval, or protected evidence access."
  },
  {
    gate: "Connector and Live Data Gate",
    status: "blocked-before-approval",
    owner: "Platform, Interoperability, Privacy, Security, and Customer Environment Owners",
    trigger: "Production connector, live endpoint, EHR writeback, payer submission, patient matching, or data exchange request.",
    passCondition: "Approved protected or production connector scope exists with qualified privacy/security/customer approvals.",
    failClosedAction: "Use synthetic fixtures, standards mapping, and readiness-only workaround.",
    retainedBoundary: "Does not authorize PHI, production connectors, writeback, payer submission, or patient matching."
  },
  {
    gate: "Clinical Action Gate",
    status: "blocked-before-approval",
    owner: "Clinical Governance and qualified clinical/legal reviewers",
    trigger: "Diagnosis, treatment, patient outreach, triage, prescribing, clinician substitution, or live-care language.",
    passCondition: "Formal clinical authority, intended-use, safety, regulatory, and customer approvals exist.",
    failClosedAction: "Block clinical action and convert to synthetic planning or governance review.",
    retainedBoundary: "Does not authorize live clinical care or autonomous medical decision-making."
  }
];

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function countStatuses<T extends string>(
  values: Array<{ status: T }>
): Record<T, number> {
  return values.reduce(
    (counts, value) => ({
      ...counts,
      [value.status]: (counts[value.status] ?? 0) + 1
    }),
    {} as Record<T, number>
  );
}

function markdownItems(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

export function getServiceDeliveryPackageBindings(): ServiceDeliveryPackageBinding[] {
  return productServicePackages.map((pack) => {
    const includedOfferSlugs = productServiceOfferings
      .filter((offer) => pack.includedOffers.includes(offer.name))
      .map((offer) => offer.slug);
    const templates = serviceDeliveryWorkOrderTemplates
      .filter((template) =>
        template.appliesToOfferSlugs.some((slug) => includedOfferSlugs.includes(slug))
      )
      .map((template) => template.slug);

    return {
      packageSlug: pack.slug,
      packageName: pack.name,
      deliveryLane: pack.status,
      workOrderTemplates: unique(templates),
      buyerHandoff: pack.expansionPath,
      marginRule: pack.commercialModel,
      retainedBoundary: pack.retainedBoundaries.join("; ")
    };
  });
}

function liveActivationPlanForOffer(offer: ServiceDeliveryOffer): ServiceDeliveryLiveActivationPlan {
  const protectedPilot = offer.status === "protected-gated";
  const externalReview = offer.status === "external-review-required" || offer.status === "blocked-before-approval";
  const activeTemplate = offer.status === "active-delivery-template";
  const readyToScope = offer.status === "ready-to-scope";
  const activationStatus: ServiceDeliveryLiveActivationStatus = externalReview
    ? "blocked-before-live-production"
    : protectedPilot
      ? "protected-pilot-candidate"
      : activeTemplate
        ? "no-phi-service-ready"
        : "public-demo-ready";
  const deploymentPosture = externalReview
    ? "external_approval_required"
    : protectedPilot
      ? "protected_workspace_required"
      : activeTemplate
        ? "no_phi_delivery_ready"
        : "public_route_ready";
  const salesReadinessScore = readyToScope ? 82 : activeTemplate ? 90 : protectedPilot ? 86 : 76;
  const deliveryReadinessScore = activeTemplate ? 92 : protectedPilot ? 84 : readyToScope ? 78 : 70;
  const revenueReadinessScore = protectedPilot ? 88 : activeTemplate ? 86 : readyToScope ? 80 : 72;
  const supportReadinessScore = activeTemplate ? 84 : protectedPilot ? 80 : readyToScope ? 74 : 68;

  return {
    slug: `${offer.slug}-live-activation-plan`,
    offerSlug: offer.slug,
    offerName: offer.name,
    activationStatus,
    deploymentPosture,
    salesReadinessScore,
    deliveryReadinessScore,
    revenueReadinessScore,
    supportReadinessScore,
    requiredBeforeLive: [
      "Named buyer sponsor, workflow owner, delivery owner, and review owner",
      "No-PHI intake and scope matrix accepted",
      "Acceptance criteria and proof routes recorded",
      "Claim Guard review for buyer-facing language",
      "Enterprise Business Ops review for pricing, contract, margin, billing, tax, and accounting language",
      "Protected workspace, AAL2 release chain, and customer permission before buyer-specific protected evidence"
    ],
    nextSafeGoLiveStep: protectedPilot
      ? "Prepare protected-pilot workspace plan and AAL2 release chain before any customer-specific evidence or execution."
      : activeTemplate
        ? "Package a no-PHI delivery kickoff with owner map, work-order template, acceptance criteria, and claims-safe follow-up."
        : "Keep this offer in public demo and qualification mode until scope, owner, review, and acceptance evidence are stronger.",
    safeLaunchMotion: "Launch as no-PHI service delivery, buyer demo, readiness assessment, or protected-pilot candidate only.",
    revenueMotion: "Use fixed scope, capped deliverables, paid readiness/pilot packaging, and separate change-order paths for expansion.",
    supportMotion: "Offer launch-window coordination and review cadence; do not promise contractual SLA, 24/7 production support, or managed-service coverage.",
    blockedBeforeGoLive: [
      "PHI processing authority",
      "Production connector approval",
      "EHR writeback, payer submission, patient outreach, diagnosis, treatment, prescribing, or live clinical workflow",
      "Customer go-live approval",
      "Contractual SLA, uptime guarantee, managed-service commitment, security certification, compliance certification, clinical validation, revenue guarantee, or profit guarantee"
    ],
    proofRoutes: unique([serviceDeliveryRoute, productServicePortfolioRoute, ...offer.evidenceRoutes]),
    humanReviewRequired: true,
    productionAuthority: false
  };
}

export function getServiceDeliveryLiveActivationMatrix(): ServiceDeliveryLiveActivationPlan[] {
  return serviceDeliveryOffers.map(liveActivationPlanForOffer);
}

export function getServiceDeliverySummary() {
  const packageBindings = getServiceDeliveryPackageBindings();
  const liveActivationMatrix = getServiceDeliveryLiveActivationMatrix();
  const evidenceRoutes = unique([
    serviceDeliveryRoute,
    serviceDeliveryApiRoute,
    serviceDeliveryBriefRoute,
    productServicePortfolioRoute,
    ...serviceDeliveryOffers.flatMap((offer) => offer.evidenceRoutes),
    ...serviceDeliveryPhases.flatMap((phase) => phase.proofRoutes),
    ...serviceDeliveryWorkOrderTemplates.flatMap((template) => template.proofRoutes)
  ]);
  const acceptanceCriteria = serviceDeliveryOffers.flatMap((offer) => offer.acceptanceCriteria);
  const escalationTriggers = unique(serviceDeliveryOffers.flatMap((offer) => offer.escalationTriggers));
  const marginProtections = unique(serviceDeliveryOffers.flatMap((offer) => offer.marginProtection));
  const hardStops = unique([
    ...serviceDeliveryHardStops,
    ...serviceDeliveryPhases.map((phase) => phase.hardStop),
    ...serviceDeliveryWorkOrderTemplates.flatMap((template) => template.hardStops)
  ]);

  return {
    service: "scrimed-service-delivery-workbench",
    route: serviceDeliveryRoute,
    apiRoute: serviceDeliveryApiRoute,
    briefRoute: serviceDeliveryBriefRoute,
    status: serviceDeliveryStatus,
    briefStatus: serviceDeliveryBriefStatus,
    boundary: serviceDeliveryBoundary,
    authority: {
      dataBoundary: "synthetic-business-and-metadata-only",
      clinicalCareAuthority: "not-authorized-live-care",
      phiAuthority: "not-authorized-production-phi",
      legalAuthority: "qualified-review-required",
      accountingAuthority: "qualified-accounting-review-required",
      taxAuthority: "qualified-tax-review-required",
      financialAuthority: "not-audited-financial-report",
      contractAuthority: "not-contract-approval",
      slaAuthority: "not-contractual-sla",
      customerPermission: "not-customer-permission",
      revenueAuthority: "not-revenue-guarantee",
      profitAuthority: "not-profit-margin-guarantee",
      reimbursementAuthority: "no-reimbursement-guarantee",
      securityCertification: "not-security-certified",
      connectorAuthority: "not-production-connector-approved"
    },
    deliveryOfferCount: serviceDeliveryOffers.length,
    readyToScopeOfferCount: serviceDeliveryOffers.filter((offer) => offer.status === "ready-to-scope").length,
    activeTemplateOfferCount: serviceDeliveryOffers.filter(
      (offer) => offer.status === "active-delivery-template"
    ).length,
    protectedGatedOfferCount: serviceDeliveryOffers.filter((offer) => offer.status === "protected-gated").length,
    phaseCount: serviceDeliveryPhases.length,
    workOrderTemplateCount: serviceDeliveryWorkOrderTemplates.length,
    artifactCount: serviceDeliveryArtifacts.length,
    activationGateCount: serviceDeliveryActivationGates.length,
    blockedBeforeApprovalGateCount: serviceDeliveryActivationGates.filter(
      (gate) => gate.status === "blocked-before-approval"
    ).length,
    packageBindingCount: packageBindings.length,
    liveActivationPlanCount: liveActivationMatrix.length,
    noPhiServiceReadyCount: liveActivationMatrix.filter((plan) => plan.activationStatus === "no-phi-service-ready").length,
    protectedPilotCandidateCount: liveActivationMatrix.filter((plan) => plan.activationStatus === "protected-pilot-candidate").length,
    blockedBeforeLiveProductionCount: liveActivationMatrix.filter(
      (plan) => plan.activationStatus === "blocked-before-live-production"
    ).length,
    evidenceRouteCount: evidenceRoutes.length,
    acceptanceCriteriaCount: acceptanceCriteria.length,
    escalationTriggerCount: escalationTriggers.length,
    marginProtectionCount: marginProtections.length,
    hardStopCount: hardStops.length,
    offerStatusCounts: countStatuses(serviceDeliveryOffers),
    phaseStatusCounts: countStatuses(serviceDeliveryPhases),
    workOrderStatusCounts: countStatuses(serviceDeliveryWorkOrderTemplates),
    gateStatusCounts: countStatuses(serviceDeliveryActivationGates),
    recommendedOperatingRule:
      "No SCRIMED service should move from buyer interest to delivery without a selected package, no-PHI intake, scope matrix, acceptance criteria, work-order template, proof route, margin control, and retained boundary.",
    nextServiceBuildMove:
      "Turn the highest-demand offers into repeatable delivery boards, then attach protected buyer evidence release only after AAL2, claim guard, and qualified review gates pass.",
    serviceDeliveryOffers,
    serviceDeliveryPhases,
    serviceDeliveryWorkOrderTemplates,
    serviceDeliveryArtifacts,
    serviceDeliveryActivationGates,
    serviceDeliveryPackageBindings: packageBindings,
    serviceDeliveryLiveActivationMatrix: liveActivationMatrix,
    evidenceRoutes,
    acceptanceCriteria,
    escalationTriggers,
    marginProtections,
    hardStops,
    updated: serviceDeliveryUpdatedAt
  };
}

export function buildServiceDeliveryBrief() {
  const summary = getServiceDeliverySummary();

  return [
    "# SCRIMED Service Delivery Workbench Brief",
    "",
    `Status: ${summary.status}`,
    `Updated: ${summary.updated}`,
    `Service delivery offers: ${summary.deliveryOfferCount}`,
    `Phases: ${summary.phaseCount}`,
    `Work order templates: ${summary.workOrderTemplateCount}`,
    `Artifacts: ${summary.artifactCount}`,
    `Activation gates: ${summary.activationGateCount}`,
    `Hard stops: ${summary.hardStopCount}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is not a statement of work, contract approval, legal advice, accounting advice, tax advice, audited financial reporting, contractual SLA, uptime guarantee, managed-service commitment, customer permission, revenue guarantee, profit-margin guarantee, clinical validation, compliance certification, security certification, PHI processing authority, production connector approval, EHR writeback approval, payer submission approval, or live clinical care authorization.",
    "",
    "## Operating Rule",
    summary.recommendedOperatingRule,
    "",
    "## Service Delivery Offers",
    ...summary.serviceDeliveryOffers.map(
      (offer) =>
        `- ${offer.name} (${offer.status}): ${offer.buyerPromise} Acceptance: ${offer.acceptanceCriteria.join("; ")} Boundary: ${offer.retainedBoundary}`
    ),
    "",
    "## Delivery Phases",
    ...summary.serviceDeliveryPhases.map(
      (phase) =>
        `- ${phase.phase} (${phase.status}): ${phase.purpose} Exit: ${phase.exitCriteria.join("; ")} Hard stop: ${phase.hardStop}`
    ),
    "",
    "## Work Order Templates",
    ...summary.serviceDeliveryWorkOrderTemplates.map(
      (template) =>
        `- ${template.title} (${template.status}): ${template.outputArtifact}. Hard stops: ${template.hardStops.join(", ")}`
    ),
    "",
    "## Activation Gates",
    ...summary.serviceDeliveryActivationGates.map(
      (gate) =>
        `- ${gate.gate} (${gate.status}): ${gate.passCondition} Fail closed: ${gate.failClosedAction}`
    ),
    "",
    "## Artifacts",
    ...summary.serviceDeliveryArtifacts.map(
      (artifact) =>
        `- ${artifact.artifact}: ${artifact.purpose} Release rule: ${artifact.releaseRule}`
    ),
    "",
    "## Package Bindings",
    ...summary.serviceDeliveryPackageBindings.map(
      (binding) =>
        `- ${binding.packageName}: ${binding.workOrderTemplates.length} work-order templates. Handoff: ${binding.buyerHandoff}. Boundary: ${binding.retainedBoundary}`
    ),
    "",
    "## Live Service Activation Matrix",
    ...summary.serviceDeliveryLiveActivationMatrix.map(
      (plan) =>
        `- ${plan.offerName}: status=${plan.activationStatus}; deployment=${plan.deploymentPosture}; next=${plan.nextSafeGoLiveStep}; production_authority=${plan.productionAuthority}`
    ),
    "",
    "## Hard Stops",
    markdownItems(summary.hardStops)
  ].join("\n");
}
