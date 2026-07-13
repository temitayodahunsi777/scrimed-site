export type ProductServiceOfferStatus =
  | "sellable-now"
  | "package-ready"
  | "pilot-ready"
  | "protected-gated"
  | "external-review-required"
  | "internal-only";

export type ProductServiceOfferType =
  | "assessment"
  | "sprint"
  | "pilot"
  | "retainer"
  | "enterprise-layer"
  | "research";

export type ProductServicePackageStatus =
  | "entry"
  | "growth"
  | "enterprise"
  | "strategic"
  | "retained";

export type ProductServiceControlStatus =
  | "active-control"
  | "human-review-required"
  | "external-review-required"
  | "blocked-before-approval";

export type ProductServiceOffer = {
  slug: string;
  name: string;
  type: ProductServiceOfferType;
  status: ProductServiceOfferStatus;
  buyer: string;
  trigger: string;
  outcome: string;
  deliverables: string[];
  activationPath: string[];
  proofRoutes: string[];
  qualificationGates: string[];
  marginLevers: string[];
  blockedClaims: string[];
  boundary: string;
};

export type ProductServicePackage = {
  slug: string;
  name: string;
  status: ProductServicePackageStatus;
  bestFor: string;
  commercialModel: string;
  deliveryWindow: string;
  includedOffers: string[];
  entryCriteria: string[];
  proofRoutes: string[];
  retainedBoundaries: string[];
  expansionPath: string;
};

export type ProductServiceMarginControl = {
  slug: string;
  control: string;
  status: ProductServiceControlStatus;
  owner: string;
  marginRisk: string;
  operatingPolicy: string;
  evidenceRoutes: string[];
  hardStops: string[];
};

export type ProductServiceBoundaryResolution = {
  slug: string;
  boundary: string;
  status: ProductServiceControlStatus;
  riskIfIgnored: string;
  currentControl: string;
  safeWorkaround: string;
  remainingGate: string;
  owner: string;
  proofRoutes: string[];
  prohibitedClaims: string[];
};

export type ProductServiceDeliveryPlaybook = {
  phase: string;
  owner: string;
  purpose: string;
  buyerCommitment: string;
  internalOutput: string;
  proofRoutes: string[];
  retainedBoundary: string;
};

export const productServicePortfolioRoute = "/offerings";
export const productServicePortfolioApiRoute = "/api/offerings";
export const productServicePortfolioBriefRoute = "/api/offerings/brief";
export const productServicePortfolioStatus =
  "product-service-portfolio-upgrade-active";
export const productServicePortfolioBriefStatus =
  "product-service-portfolio-brief-ready-no-advice";
export const productServicePortfolioUpdatedAt = "2026-06-26";

export const productServicePortfolioBoundary =
  "SCRIMED Product and Services Portfolio organizes sellable offers, service packages, delivery paths, proof routes, margin controls, qualification gates, and retained approval boundaries for governed synthetic evaluations, readiness work, protected pilots, and enterprise operating-layer expansion. It is product, service, and commercial operating readiness only. It is not legal advice, accounting advice, tax advice, audited financial reporting, securities offering material, investment advice, valuation assurance, customer permission, revenue guarantee, profit-margin guarantee, reimbursement assurance, clinical validation, compliance certification, security certification, PHI processing authority, production connector approval, EHR writeback approval, payer submission approval, or live clinical care authorization.";

export const productServiceBlockedClaims = [
  "guaranteed revenue",
  "guaranteed ROI",
  "guaranteed profit margin",
  "audited financial reporting",
  "legal advice",
  "accounting advice",
  "tax advice",
  "securities offering material",
  "investment advice",
  "valuation assurance",
  "HIPAA certified",
  "SOC 2 certified",
  "HITRUST certified",
  "FDA cleared",
  "ONC certified",
  "GDPR compliant as a certified claim",
  "PHI processing approved",
  "production EHR connector approved",
  "EHR writeback approved",
  "payer submission approved",
  "autonomous diagnosis",
  "autonomous treatment",
  "live clinical care authorized",
  "public quantum capability"
];

export const productServiceOfferings: ProductServiceOffer[] = [
  {
    slug: "workflow-intelligence-assessment",
    name: "Workflow Intelligence Assessment",
    type: "assessment",
    status: "sellable-now",
    buyer: "Health system operations, access, revenue-cycle, documentation, and transformation leaders",
    trigger:
      "Buyer has a high-friction workflow but is not ready for live data, production connectors, or an enterprise pilot.",
    outcome:
      "A fixed-scope workflow map, automation candidate scorecard, governance gap register, value-measurement plan, and next-package recommendation.",
    deliverables: [
      "Workflow friction map for one to three workflows",
      "Automation candidate scorecard",
      "No-PHI evidence inventory and missing-data register",
      "Interoperability target map",
      "Executive findings call and next-scope decision packet"
    ],
    activationPath: [
      "Qualify sponsor, workflow owner, and buyer problem",
      "Confirm no-PHI scope and current-state baseline questions",
      "Run synthetic workflow and governance review",
      "Return fixed deliverables and pilot recommendation"
    ],
    proofRoutes: ["/product", "/pricing", "/pilot", "/growth-engine", "/interoperability"],
    qualificationGates: [
      "Named sponsor",
      "One to three workflow targets",
      "No PHI or production credentials",
      "Buyer-approved measurement questions"
    ],
    marginLevers: [
      "Fixed fee and capped scope",
      "Template-driven discovery",
      "No custom connector build",
      "Clear upgrade path to synthetic pilot"
    ],
    blockedClaims: ["medical advice", "guaranteed savings", "live workflow approval"],
    boundary:
      "Operational intelligence for human leaders only; no clinical advice, PHI processing, live care, or production automation approval."
  },
  {
    slug: "health-records-safety-assessment",
    name: "Health Records Safety Assessment",
    type: "assessment",
    status: "package-ready",
    buyer: "CMIO, clinical informatics, health information management, interoperability, privacy, and safety teams",
    trigger:
      "Buyer wants extraction, summarization, reconciliation, or source attribution across clinical records without exposing live patient data yet.",
    outcome:
      "A no-PHI extraction map, source-attribution plan, patient-safety lint checklist, standards crosswalk, and live-data approval path.",
    deliverables: [
      "Document and record-source inventory",
      "FHIR, HL7, DICOM, X12, terminology, and document-type crosswalk",
      "Synthetic extraction test plan",
      "Patient-safety lint checklist",
      "Live-data gate and workaround map"
    ],
    activationPath: [
      "Classify source systems and file types",
      "Reject PHI, identifiers, production credentials, and live endpoints",
      "Run synthetic extraction planner",
      "Route live-data gates to named owners"
    ],
    proofRoutes: ["/health-records", "/interoperability", "/clinical-authority-readiness", "/boundary-resolution"],
    qualificationGates: [
      "No live PHI in discovery",
      "Named privacy or security owner",
      "Source system class identified",
      "Clinical reviewer owner for safety questions"
    ],
    marginLevers: [
      "Reusable extraction checklists",
      "Synthetic fixtures first",
      "Separate connector approval from assessment work",
      "Paid upgrade for sandbox or protected-pilot planning"
    ],
    blockedClaims: [
      "live PHI ingestion authorized",
      "patient matching approved",
      "EHR writeback approved",
      "payer submission approved"
    ],
    boundary:
      "No-PHI extraction planning only; no patient matching, production connector use, EHR writeback, payer submission, or clinical action."
  },
  {
    slug: "interoperability-readiness-sprint",
    name: "Interoperability Readiness Sprint",
    type: "sprint",
    status: "package-ready",
    buyer: "Integration, platform, IT, EHR, payer, data, and architecture teams",
    trigger:
      "Buyer needs a standards-aware implementation path before committing to a protected pilot or production connector work.",
    outcome:
      "A connector readiness map, standard bindings, data-boundary decisions, synthetic conformance checks, and implementation sequence.",
    deliverables: [
      "Integration contract review",
      "FHIR, SMART, HL7, DICOM, X12, terminology, and fixture mapping",
      "Synthetic conformance evidence",
      "Connector risk and approval register",
      "Implementation sequence with data-boundary assumptions"
    ],
    activationPath: [
      "Select target integration pattern",
      "Map standards and conformance evidence",
      "Run fixture validation",
      "Prepare connector gate packet"
    ],
    proofRoutes: ["/interoperability", "/interoperability/evaluations", "/integrations/fixture-validation", "/health-records"],
    qualificationGates: [
      "Target standards named",
      "Integration owner assigned",
      "No production endpoint access required",
      "Security and privacy review path known"
    ],
    marginLevers: [
      "Standards templates",
      "No custom live connector build in sprint",
      "Separate production connector SOW",
      "Reuse conformance evidence"
    ],
    blockedClaims: ["production connector approved", "certified interoperability", "live PHI exchange approved"],
    boundary:
      "Readiness and synthetic conformance only; production connector, PHI, security, and customer environment approval remain external gates."
  },
  {
    slug: "trustos-ai-governance-audit",
    name: "TrustOS AI Governance Audit",
    type: "assessment",
    status: "sellable-now",
    buyer: "Compliance, privacy, legal, security, clinical governance, innovation, and executive AI oversight teams",
    trigger:
      "Buyer needs to govern AI adoption, vendor claims, model-risk decisions, and workflow promotion before clinical or operational expansion.",
    outcome:
      "A governance gap report, claims register, model/workflow oversight map, audit evidence plan, and approval-gate ladder.",
    deliverables: [
      "AI governance gap register",
      "Claims and prohibited-language review",
      "Runtime safety and auditability map",
      "Human-review responsibility model",
      "Approval and certification readiness path"
    ],
    activationPath: [
      "Collect no-sensitive-policy and workflow context",
      "Run TrustOS and claims boundary review",
      "Classify retained gates",
      "Return governance action plan"
    ],
    proofRoutes: ["/trust-os", "/approvals-readiness", "/global-certification-readiness", "/qa-claim-guard", "/boundary-resolution"],
    qualificationGates: [
      "Governance sponsor",
      "Intended-use language",
      "No confidential policy upload required",
      "Qualified review owner for legal or regulatory conclusions"
    ],
    marginLevers: [
      "Repeatable TrustOS framework",
      "Reusable claims-control templates",
      "Paid retainer path for continuous review",
      "External-review work explicitly excluded unless scoped"
    ],
    blockedClaims: ["legal approval", "regulatory approval", "security certification", "clinical validation"],
    boundary:
      "Governance readiness only; legal, regulatory, security, certification, and clinical authority require qualified external review."
  },
  {
    slug: "synthetic-pilot-evaluation",
    name: "Synthetic Pilot Evaluation",
    type: "pilot",
    status: "sellable-now",
    buyer: "Enterprise buyers ready to test governed workflow intelligence before live integration",
    trigger:
      "Buyer has sponsor, review team, workflow scope, decision criteria, and enough budget authority for a 45 to 90 day synthetic pilot.",
    outcome:
      "A governed synthetic pilot with workflow packets, Trust Cards, QA evidence, operating metrics, proof routes, and protected-pilot recommendation.",
    deliverables: [
      "Synthetic workflow packet",
      "AgentOS task plan and Atlas evidence mapping",
      "TrustOS decision and QA evidence packet",
      "Operational metric baseline plan",
      "Protected-pilot or enterprise-license decision register"
    ],
    activationPath: [
      "Confirm sponsor, review team, and target workflow",
      "Approve synthetic scenario and decision metrics",
      "Run governed workflow evaluation",
      "Package evidence and next commitment"
    ],
    proofRoutes: ["/pilots", "/evaluation", "/workflows/results", "/qa-evidence", "/pilot-deal-room"],
    qualificationGates: [
      "Named sponsor",
      "Review team",
      "Approved synthetic packet",
      "No production connector required",
      "Buyer-approved success metrics"
    ],
    marginLevers: [
      "Pilot playbook reuse",
      "Synthetic data first",
      "Capped workflow count",
      "Paid diligence and protected workspace add-ons"
    ],
    blockedClaims: ["clinical validation", "guaranteed ROI", "production readiness approved", "customer value claim without permission"],
    boundary:
      "Synthetic evaluation only; no diagnosis, treatment, payer submission, patient outreach, live PHI, or production connector execution."
  },
  {
    slug: "clinical-operations-automation-blueprint",
    name: "Clinical Operations Automation Blueprint",
    type: "sprint",
    status: "protected-gated",
    buyer: "Clinical operations, transformation, care navigation, documentation, revenue-cycle, and public-sector program teams",
    trigger:
      "Buyer wants a safe automation roadmap before approving protected pilot, staffing, connector, or implementation commitments.",
    outcome:
      "A phased operating blueprint with workflow ownership, agent responsibilities, review queues, staffing assumptions, connector plan, and change-order triggers.",
    deliverables: [
      "Prioritized automation roadmap",
      "Agent responsibility map",
      "Human-review operating design",
      "Implementation labor and support assumptions",
      "Connector and protected-pilot approval path"
    ],
    activationPath: [
      "Select workflow family and operating owner",
      "Map current-state handoffs",
      "Define review queues and safety boundaries",
      "Prepare implementation blueprint"
    ],
    proofRoutes: ["/healthcare-intelligence-os", "/product", "/clinical-care-activation", "/enterprise-business-ops"],
    qualificationGates: [
      "Clinical governance owner",
      "Operations owner",
      "Implementation budget discussion",
      "No live-care authority assumed"
    ],
    marginLevers: [
      "Blueprint as paid capped-scope service",
      "Implementation labor separated from license",
      "Change-order triggers",
      "Support tier mapped before pilot expansion"
    ],
    blockedClaims: ["live care authorized", "autonomous clinical workflow", "implementation approved without SOW"],
    boundary:
      "Blueprint planning only; protected pilot, live clinical authority, connectors, staffing, and production procedures require approved scope and controls."
  },
  {
    slug: "enterprise-proof-deal-room-activation",
    name: "Enterprise Proof and Deal Room Activation",
    type: "retainer",
    status: "pilot-ready",
    buyer: "Procurement, security, legal, executive sponsors, investor diligence, and enterprise buying committees",
    trigger:
      "Buyer due diligence requires custom proof packets, evidence rooms, release decisions, security review, and quote-to-contract packaging.",
    outcome:
      "A paid diligence and deal-room package that routes proof, access, recipient controls, release decisions, quote, SOW, data boundary, and next action.",
    deliverables: [
      "Buyer proof route map",
      "Diligence packet inventory",
      "Release decision checklist",
      "Quote-to-contract packet inputs",
      "Evidence-room access and recipient-control assumptions"
    ],
    activationPath: [
      "Qualify buying committee and diligence scope",
      "Attach proof routes and protected workspace path",
      "Route external release decisions",
      "Produce quote-to-contract handoff"
    ],
    proofRoutes: ["/pilot-deal-room", "/pilot-workspace/access", "/buyer-release-control-run", "/enterprise-business-ops", "/sales-operations"],
    qualificationGates: [
      "Buyer-specific diligence request",
      "Customer permission path",
      "AAL2 protected workspace owner",
      "Legal and security review owner"
    ],
    marginLevers: [
      "Paid diligence line item",
      "Custom packet labor priced separately",
      "Release decisions before external sharing",
      "Scope cap and expiration date"
    ],
    blockedClaims: ["customer permission granted", "external sharing approved", "security certification complete"],
    boundary:
      "Diligence activation only; buyer-specific external sharing, customer permission, security certification, signed contracts, and production activation remain gated."
  },
  {
    slug: "global-certification-readiness-pack",
    name: "Global Certification Readiness Pack",
    type: "sprint",
    status: "external-review-required",
    buyer: "Global health systems, sovereign programs, public-sector buyers, regional partners, and compliance teams",
    trigger:
      "Buyer asks how SCRIMED prepares for HIPAA, SOC 2, HITRUST, ISO, FDA, GDPR, EU AI Act, NHS, MHRA, Australia, or regional procurement gates.",
    outcome:
      "A region-aware readiness packet that maps evidence, blocked claims, local review owners, deployment profile, procurement questions, and certification sequence.",
    deliverables: [
      "Global approval and certification track map",
      "Regional buyer pack",
      "Deployment profile and data-boundary assumptions",
      "Blocked claims and evidence gap register",
      "Qualified external-review routing plan"
    ],
    activationPath: [
      "Identify region and buyer type",
      "Map requested approval or certification language",
      "Route external review owner",
      "Package readiness-only evidence"
    ],
    proofRoutes: ["/global-certification-readiness", "/global-reach", "/deployment-profiles", "/approvals-readiness", "/boundary-resolution"],
    qualificationGates: [
      "Region or procurement path named",
      "No approval claim requested",
      "Legal, privacy, security, or regional owner assigned",
      "Deployment profile selected"
    ],
    marginLevers: [
      "Readiness pack priced separately from certification work",
      "Regional variation controlled",
      "Partner economics reviewed",
      "External review scoped explicitly"
    ],
    blockedClaims: ["certified compliance", "regional legal approval", "government endorsement", "public-sector procurement approved"],
    boundary:
      "Readiness-only global planning; local legal, privacy, security, certification, procurement, hosting, and clinical approvals remain external gates."
  },
  {
    slug: "continuous-review-innovation-retainer",
    name: "Continuous Review and Innovation Retainer",
    type: "retainer",
    status: "package-ready",
    buyer: "Enterprise sponsors, trust operations, governance teams, product leadership, and internal research stakeholders",
    trigger:
      "Buyer or internal leadership needs ongoing review loops for accuracy, evidence attribution, claims, defects, security drift, and future capability research.",
    outcome:
      "A retained operating cadence for agent-assisted review, issue routing, evidence updates, claims guard, incident learning, and internal innovation research assignments.",
    deliverables: [
      "Review loop cadence and ownership map",
      "Accuracy and evidence-attribution issue queue",
      "Claims and public-language drift review",
      "Security and dependency drift triage",
      "Internal research backlog with quantum kept internal until approved"
    ],
    activationPath: [
      "Select review loops and owners",
      "Define escalation rules",
      "Attach evidence routes",
      "Run human-approved innovation backlog"
    ],
    proofRoutes: ["/continuous-review-audit", "/service-reliability", "/operational-efficiency", "/qa-evidence", "/boundary-resolution"],
    qualificationGates: [
      "Accountable owner",
      "No autonomous remediation promise",
      "No public quantum claim",
      "Human approval path for changes"
    ],
    marginLevers: [
      "Recurring retainer",
      "Automation-assisted review with human gates",
      "Innovation research separated from production commitments",
      "Escalations priced when they create implementation work"
    ],
    blockedClaims: ["error-free AI", "managed SOC/MDR", "autonomous remediation", "public quantum capability"],
    boundary:
      "Agent-assisted and internal-research cadence only; humans approve remediation, public claims, production changes, and innovation disclosures."
  },
  {
    slug: "enterprise-operating-layer-license",
    name: "Enterprise Operating Layer License",
    type: "enterprise-layer",
    status: "external-review-required",
    buyer: "Large health systems, payers, government health agencies, and multi-site healthcare organizations",
    trigger:
      "Buyer has completed protected validation and wants a governed annual or multi-year operating layer across workflows, agents, connectors, support, and governance.",
    outcome:
      "A proposed annual operating license with workflow packages, implementation services, support tier, governance cadence, connector plan, and expansion gates.",
    deliverables: [
      "Annual license scope",
      "Workflow and agent package plan",
      "Implementation and connector SOW assumptions",
      "Support and review cadence",
      "Expansion and renewal evidence path"
    ],
    activationPath: [
      "Validate pilot and protected workspace evidence",
      "Confirm security, privacy, legal, and implementation controls",
      "Approve license scope and payment terms",
      "Run quote-to-contract and production-readiness review"
    ],
    proofRoutes: ["/pricing", "/enterprise-business-ops", "/pilot-workspace/access", "/public-market-readiness", "/sales-operations"],
    qualificationGates: [
      "Protected pilot validated",
      "Security and privacy review path",
      "Legal and finance review",
      "Implementation owner and budget",
      "Customer approval path"
    ],
    marginLevers: [
      "Annual prepay or multi-year options",
      "Implementation services separated from license",
      "Support tier priced",
      "Usage and model-cost thresholds",
      "Change-order controls"
    ],
    blockedClaims: ["contract approved", "production authorized", "profit margin guaranteed", "customer value claim without permission"],
    boundary:
      "License proposal only until contracts, security, privacy, legal, finance, connector, support, and production authority are approved."
  }
];

export const productServicePackages: ProductServicePackage[] = [
  {
    slug: "assessment-package",
    name: "Assessment Package",
    status: "entry",
    bestFor: "Buyers validating workflow pain, governance pressure, record extraction, or AI readiness before a pilot.",
    commercialModel: "Fixed-fee package with capped workflows and no-PHI discovery.",
    deliveryWindow: "2 to 4 weeks",
    includedOffers: [
      "Workflow Intelligence Assessment",
      "Health Records Safety Assessment",
      "TrustOS AI Governance Audit"
    ],
    entryCriteria: ["Named sponsor", "No PHI", "One to three workflow questions", "Decision owner"],
    proofRoutes: ["/offerings", "/pricing", "/pilot", "/health-records", "/approvals-readiness"],
    retainedBoundaries: [
      "No live clinical care",
      "No PHI",
      "No legal, accounting, tax, security, or regulatory approval",
      "No guaranteed savings"
    ],
    expansionPath: "Synthetic Pilot Evaluation or Interoperability Readiness Sprint"
  },
  {
    slug: "sprint-package",
    name: "Readiness Sprint Package",
    status: "growth",
    bestFor: "Teams preparing standards, health-record safety, implementation blueprint, governance, or global readiness before protected work.",
    commercialModel: "Scoped sprint with clear deliverables, owner map, and upgrade gates.",
    deliveryWindow: "30 to 45 days",
    includedOffers: [
      "Interoperability Readiness Sprint",
      "Clinical Operations Automation Blueprint",
      "Global Certification Readiness Pack"
    ],
    entryCriteria: ["Owner assigned", "Target domain selected", "No production endpoint dependency", "External-review lane known"],
    proofRoutes: ["/interoperability", "/clinical-care-activation", "/global-certification-readiness", "/enterprise-business-ops"],
    retainedBoundaries: [
      "No certified compliance claim",
      "No production connector approval",
      "No regional approval claim",
      "No implementation work without SOW"
    ],
    expansionPath: "Synthetic Pilot Evaluation or Enterprise Proof and Deal Room Activation"
  },
  {
    slug: "synthetic-pilot-package",
    name: "Synthetic Pilot Package",
    status: "enterprise",
    bestFor: "Qualified enterprise buyers ready to evaluate governed workflow intelligence with synthetic evidence.",
    commercialModel: "Paid synthetic pilot with workflow count, evidence cadence, and decision criteria.",
    deliveryWindow: "45 to 90 days",
    includedOffers: [
      "Synthetic Pilot Evaluation",
      "TrustOS AI Governance Audit",
      "Enterprise Proof and Deal Room Activation"
    ],
    entryCriteria: ["Named sponsor", "Review team", "Synthetic packet approved", "Buyer-approved success metrics"],
    proofRoutes: ["/pilots", "/evaluation", "/pilot-deal-room", "/qa-evidence", "/sales-operations"],
    retainedBoundaries: [
      "Synthetic only",
      "No autonomous clinical action",
      "No customer-value claim without permission",
      "No protected evidence release without AAL2 gate"
    ],
    expansionPath: "Protected Enterprise Pilot or Enterprise Operating Layer License"
  },
  {
    slug: "enterprise-activation-package",
    name: "Enterprise Activation Package",
    status: "strategic",
    bestFor: "Buying committees moving from pilot proof into protected diligence, contract review, implementation, and annual license planning.",
    commercialModel: "Enterprise proposal with license, implementation, diligence, support, and usage assumptions separated.",
    deliveryWindow: "90 to 180 days depending on buyer controls",
    includedOffers: [
      "Enterprise Proof and Deal Room Activation",
      "Clinical Operations Automation Blueprint",
      "Enterprise Operating Layer License"
    ],
    entryCriteria: ["Protected workspace path", "Legal and finance review", "Security review", "Implementation owner", "Payment path"],
    proofRoutes: ["/enterprise-business-ops", "/pilot-workspace/access", "/buyer-release-control-run", "/public-market-readiness"],
    retainedBoundaries: [
      "No contract approval without executive and counsel review",
      "No production activation without customer authority",
      "No PHI without approved BAA/security controls",
      "No margin or revenue guarantee"
    ],
    expansionPath: "Multi-year enterprise operating license or strategic platform partnership"
  },
  {
    slug: "continuous-review-retainer",
    name: "Continuous Review Retainer",
    status: "retained",
    bestFor: "Customers or internal teams that need ongoing accuracy, evidence, claims, safety, and innovation review loops.",
    commercialModel: "Monthly or quarterly retainer with human-approved review loops and separately scoped implementation work.",
    deliveryWindow: "Ongoing cadence",
    includedOffers: [
      "Continuous Review and Innovation Retainer",
      "TrustOS AI Governance Audit",
      "Enterprise Proof and Deal Room Activation"
    ],
    entryCriteria: ["Accountable owner", "Escalation rules", "Review scope", "No autonomous remediation promise"],
    proofRoutes: ["/continuous-review-audit", "/service-reliability", "/operational-efficiency", "/qa-evidence"],
    retainedBoundaries: [
      "No managed SOC/MDR claim",
      "No error-free AI claim",
      "No autonomous production change",
      "Quantum and frontier research stay internal until approved"
    ],
    expansionPath: "Enterprise operating cadence, renewal health packet, or internal research roadmap"
  }
];

export const productServiceMarginControls: ProductServiceMarginControl[] = [
  {
    slug: "package-before-custom-sow",
    control: "Package before custom SOW",
    status: "active-control",
    owner: "Revenue operations + Product Console",
    marginRisk: "Custom buyer requests can sprawl into unpaid discovery or unpriced implementation work.",
    operatingPolicy:
      "Map each opportunity to an approved package, included offers, excluded work, price floor, and expansion path before custom language leaves SCRIMED.",
    evidenceRoutes: ["/offerings", "/enterprise-business-ops", "/growth-engine"],
    hardStops: ["custom SOW before package selected", "unpriced implementation work", "unsupported success fee"]
  },
  {
    slug: "data-boundary-price-floor",
    control: "Data-boundary price floor",
    status: "human-review-required",
    owner: "Finance + Legal Ops + Privacy",
    marginRisk: "PHI, sandbox, connector, or production requests create security, review, support, and liability costs.",
    operatingPolicy:
      "Keep no-PHI work in standard packages; move sandbox, PHI, connector, or production work into separately reviewed paid scope.",
    evidenceRoutes: ["/health-records", "/clinical-authority-readiness", "/enterprise-business-ops"],
    hardStops: ["PHI requested", "production connector requested", "BAA/security scope missing"]
  },
  {
    slug: "diligence-work-monetization",
    control: "Diligence work monetization",
    status: "active-control",
    owner: "Buyer Diligence + Sales Operations",
    marginRisk: "Security, legal, procurement, and investor packets can become unpaid enterprise sales labor.",
    operatingPolicy:
      "Price custom proof packets, evidence-room work, buyer-specific release review, and security questionnaire effort as paid diligence or activation scope.",
    evidenceRoutes: ["/pilot-deal-room", "/pilot-workspace/access", "/buyer-release-control-run"],
    hardStops: ["custom packet work without paid scope", "external sharing before release decision", "recipient controls missing"]
  },
  {
    slug: "license-services-separation",
    control: "License and services separation",
    status: "active-control",
    owner: "Finance + Product + Implementation",
    marginRisk: "High-touch services can erode platform license margin if bundled into the annual fee.",
    operatingPolicy:
      "Separate annual operating license, implementation services, connector work, training, support tier, and continuous review retainer on every enterprise proposal.",
    evidenceRoutes: ["/pricing", "/enterprise-business-ops", "/public-market-readiness"],
    hardStops: ["services bundled into license", "support tier undefined", "implementation acceptance criteria missing"]
  },
  {
    slug: "claims-review-before-proof",
    control: "Claims review before proof expansion",
    status: "external-review-required",
    owner: "Claims governance + Counsel + Finance",
    marginRisk: "Unsupported ROI, reimbursement, customer value, certification, or investor claims can create legal and trust risk.",
    operatingPolicy:
      "Keep external claims in readiness mode until buyer-approved baselines, customer permission, counsel review, finance review, and release decisions exist.",
    evidenceRoutes: ["/qa-claim-guard", "/boundary-resolution", "/public-market-readiness"],
    hardStops: ["ROI guarantee", "reimbursement guarantee", "customer claim without permission", "certification claim without authority"]
  },
  {
    slug: "model-cost-usage-review",
    control: "Model cost and usage review",
    status: "active-control",
    owner: "Product Engineering + Finance",
    marginRisk: "Large-context extraction, repeated evaluations, and proof-packet generation can silently compress margins.",
    operatingPolicy:
      "Attach usage assumptions, model routing, caching, volume thresholds, and overage review to pilots, retainers, and enterprise licenses.",
    evidenceRoutes: ["/service-reliability", "/operational-efficiency", "/public-market-readiness"],
    hardStops: ["uncapped high-volume usage", "model-cost spike", "usage threshold missing"]
  },
  {
    slug: "global-partner-economics-review",
    control: "Global partner economics review",
    status: "external-review-required",
    owner: "Strategic Partnerships + Finance + Tax + Regional Counsel",
    marginRisk: "Partner discounts, reseller terms, regional hosting, tax exposure, and delivery obligations can erode margin.",
    operatingPolicy:
      "Route reseller, referral, sovereign, affiliate, regional hosting, and implementation partner economics through finance, tax, counsel, and delivery review.",
    evidenceRoutes: ["/global-reach", "/global-certification-readiness", "/enterprise-business-ops"],
    hardStops: ["cross-border margin-sharing commitment", "regional tax review missing", "partner delivery owner missing"]
  },
  {
    slug: "retainer-escalation-scope",
    control: "Retainer escalation scope",
    status: "human-review-required",
    owner: "TrustOps + Product + Revenue Operations",
    marginRisk: "Continuous review can turn into unbounded remediation, support, or innovation work.",
    operatingPolicy:
      "Keep review loops, escalation routing, remediation, implementation, incident response, and innovation research as separate scope classes with approval gates.",
    evidenceRoutes: ["/continuous-review-audit", "/service-reliability", "/operational-efficiency"],
    hardStops: ["autonomous remediation promised", "managed SOC/MDR claim", "implementation work hidden in retainer"]
  }
];

export const productServiceBoundaryResolutions: ProductServiceBoundaryResolution[] = [
  {
    slug: "package-confusion",
    boundary: "Offer sprawl and buyer confusion",
    status: "active-control",
    riskIfIgnored:
      "Buyers, sales, delivery, and reviewers may discuss different scopes, causing slower deals and higher delivery risk.",
    currentControl:
      "One portfolio registry maps offers, packages, delivery windows, proof routes, and retained boundaries.",
    safeWorkaround:
      "Route every buyer conversation to /offerings before pricing, pilot, diligence, or implementation scope expands.",
    remainingGate:
      "Buyer-specific SOW, price, payment terms, and approval trail before commitment.",
    owner: "Product Console + Revenue Operations",
    proofRoutes: ["/offerings", "/api/offerings", "/pricing", "/growth-engine"],
    prohibitedClaims: ["custom scope approved without review", "implementation included by default"]
  },
  {
    slug: "custom-scope-margin-leak",
    boundary: "Custom scope margin leakage",
    status: "human-review-required",
    riskIfIgnored:
      "Enterprise urgency can move SCRIMED into unpaid diligence, weak payment terms, or unpriced implementation labor.",
    currentControl:
      "Margin controls require package selection, price-floor review, scope cap, diligence pricing, and services/license separation.",
    safeWorkaround:
      "Offer a capped assessment, readiness sprint, synthetic pilot, or paid diligence package before custom SOW work.",
    remainingGate:
      "Finance, legal, executive, and customer approval for custom scope and payment terms.",
    owner: "Finance + Legal Ops + Deal Desk",
    proofRoutes: ["/offerings", "/enterprise-business-ops", "/pilot-deal-room"],
    prohibitedClaims: ["discount approved", "profit margin guaranteed", "contract approved"]
  },
  {
    slug: "clinical-data-ask",
    boundary: "Buyer asks for PHI, live records, connectors, EHR writeback, or payer submission",
    status: "blocked-before-approval",
    riskIfIgnored:
      "Unsafe data exposure or unauthorized healthcare action could cross privacy, security, clinical, reimbursement, and connector boundaries.",
    currentControl:
      "Health Records Safety Assessment and Interoperability Readiness Sprint keep work no-PHI and synthetic until live-data owners approve.",
    safeWorkaround:
      "Use synthetic fixtures, metadata-only system descriptions, sandbox planning, source attribution, and live-data gate mapping.",
    remainingGate:
      "BAA/privacy/security approval, customer environment approval, clinical authority, connector acceptance, payer or EHR authorization as applicable.",
    owner: "Privacy + Security + Interoperability + Clinical Governance",
    proofRoutes: ["/health-records", "/interoperability", "/clinical-authority-readiness", "/boundary-resolution"],
    prohibitedClaims: [
      "PHI processing approved",
      "production connector approved",
      "EHR writeback approved",
      "payer submission approved"
    ]
  },
  {
    slug: "roi-reimbursement-overclaim",
    boundary: "ROI, reimbursement, customer value, and revenue overclaim",
    status: "external-review-required",
    riskIfIgnored:
      "Sales, investor, or buyer language could outrun evidence and create legal, trust, reimbursement, or securities risk.",
    currentControl:
      "Claims review, buyer-approved baseline questions, finance methodology gates, and no-guarantee headers keep claims qualified.",
    safeWorkaround:
      "Use measured pilot signals, directional workflow metrics, and readiness-only language until customer permission and qualified review exist.",
    remainingGate:
      "Buyer-approved baseline, retained measurement evidence, customer permission, counsel review, finance review, and release decision.",
    owner: "Claims Governance + Finance + Counsel + Customer Sponsor",
    proofRoutes: ["/qa-claim-guard", "/public-market-readiness", "/enterprise-business-ops", "/boundary-resolution"],
    prohibitedClaims: ["ROI guaranteed", "reimbursement guaranteed", "revenue guaranteed", "customer value claim approved"]
  },
  {
    slug: "certification-approval-overclaim",
    boundary: "Certification, approval, and regional authority overclaim",
    status: "external-review-required",
    riskIfIgnored:
      "SCRIMED could appear to claim HIPAA, SOC 2, HITRUST, FDA, ONC, GDPR, EU AI Act, NHS, MHRA, Australia, or regional approval before qualified evidence exists.",
    currentControl:
      "Global Certification Readiness Pack keeps requests in evidence-building and external-review mode.",
    safeWorkaround:
      "Package readiness tracks, blocked claims, evidence gaps, and external-review owners without saying approval exists.",
    remainingGate:
      "Qualified external authority, applicable audit or certification process, regional counsel, security/privacy review, and buyer-specific acceptance.",
    owner: "Legal + Security + Privacy + Regional Counsel + Qualified Reviewers",
    proofRoutes: ["/global-certification-readiness", "/approvals-readiness", "/global-reach", "/boundary-resolution"],
    prohibitedClaims: ["HIPAA certified", "SOC 2 certified", "FDA cleared", "regional approval granted"]
  },
  {
    slug: "continuous-review-autonomy-overclaim",
    boundary: "Continuous review and innovation overclaim",
    status: "human-review-required",
    riskIfIgnored:
      "24/7 review loops or internal research could be mistaken for error-free AI, managed SOC/MDR coverage, autonomous remediation, or public quantum capability.",
    currentControl:
      "Continuous Review and Innovation Retainer separates agent-assisted review, human approval, remediation scope, and internal research.",
    safeWorkaround:
      "Use agents to flag, route, recommend, and preserve evidence; keep humans in charge of changes and keep quantum research internal.",
    remainingGate:
      "Human approval, security review, customer permission, evidence retention, and claims review before public or production use.",
    owner: "TrustOps + QA + Security + Internal Research Team",
    proofRoutes: ["/continuous-review-audit", "/service-reliability", "/operational-efficiency", "/boundary-resolution"],
    prohibitedClaims: ["error-free AI", "managed SOC/MDR", "autonomous remediation", "public quantum capability"]
  }
];

export const productServiceDeliveryPlaybooks: ProductServiceDeliveryPlaybook[] = [
  {
    phase: "Qualify",
    owner: "Founder + Revenue Operations",
    purpose: "Classify buyer problem, urgency, sponsor, disqualifiers, data boundary, and best-fit package.",
    buyerCommitment: "Sponsor, workflow, and no-PHI acknowledgement.",
    internalOutput: "Selected package, price floor, proof routes, and blocked claims.",
    proofRoutes: ["/offerings", "/pilot", "/growth-engine"],
    retainedBoundary: "Qualification is not contract approval or clinical approval."
  },
  {
    phase: "Scope",
    owner: "Product Console + Deal Desk",
    purpose: "Translate buyer need into offer, deliverables, assumptions, exclusions, owner map, and upgrade path.",
    buyerCommitment: "Scope review and decision criteria.",
    internalOutput: "Scope packet, deliverable list, excluded work, and approval gates.",
    proofRoutes: ["/offerings", "/enterprise-business-ops", "/pilot-deal-room"],
    retainedBoundary: "Scope packet is not a signed SOW."
  },
  {
    phase: "Prove",
    owner: "Sales Engineering + TrustOS + QA",
    purpose: "Attach proof routes, synthetic evidence, QA controls, claims guard, and release boundaries.",
    buyerCommitment: "Review team and approved metrics.",
    internalOutput: "Synthetic proof packet and claims-safe summary.",
    proofRoutes: ["/evaluation", "/qa-evidence", "/qa-claim-guard"],
    retainedBoundary: "Proof is synthetic or readiness-only until protected evidence and customer permission exist."
  },
  {
    phase: "Convert",
    owner: "Deal Desk + Finance + Legal Ops",
    purpose: "Move qualified buyer into quote-to-contract, paid diligence, pilot, or enterprise activation.",
    buyerCommitment: "Budget owner, procurement route, billing assumptions, and review owners.",
    internalOutput: "Quote, SOW inputs, price floor, margin estimate, and approval trail.",
    proofRoutes: ["/enterprise-business-ops", "/sales-operations", "/public-market-readiness"],
    retainedBoundary: "Conversion materials are not legal, accounting, tax, or audited financial advice."
  },
  {
    phase: "Expand",
    owner: "Customer Operations + Product + TrustOps",
    purpose: "Use retained evidence, adoption signals, support load, safety review, and governance cadence to expand safely.",
    buyerCommitment: "Expansion owner, renewal evidence, and approved next workflow.",
    internalOutput: "Expansion packet, renewal health signal, and next-package recommendation.",
    proofRoutes: ["/continuous-review-audit", "/service-reliability", "/pilot-workspace/access"],
    retainedBoundary: "Expansion does not authorize production clinical use, customer public claims, or connector changes without approvals."
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

export function getProductServicePortfolioSummary() {
  const proofRoutes = unique([
    productServicePortfolioRoute,
    productServicePortfolioApiRoute,
    productServicePortfolioBriefRoute,
    ...productServiceOfferings.flatMap((offer) => offer.proofRoutes),
    ...productServicePackages.flatMap((pack) => pack.proofRoutes),
    ...productServiceMarginControls.flatMap((control) => control.evidenceRoutes),
    ...productServiceBoundaryResolutions.flatMap((resolution) => resolution.proofRoutes),
    ...productServiceDeliveryPlaybooks.flatMap((playbook) => playbook.proofRoutes)
  ]);
  const deliverables = productServiceOfferings.flatMap((offer) => offer.deliverables);
  const qualificationGates = unique(productServiceOfferings.flatMap((offer) => offer.qualificationGates));
  const marginLevers = unique(productServiceOfferings.flatMap((offer) => offer.marginLevers));
  const blockedClaims = unique([
    ...productServiceBlockedClaims,
    ...productServiceOfferings.flatMap((offer) => offer.blockedClaims),
    ...productServiceBoundaryResolutions.flatMap((resolution) => resolution.prohibitedClaims)
  ]);
  const hardStops = unique(productServiceMarginControls.flatMap((control) => control.hardStops));

  return {
    service: "scrimed-product-service-portfolio",
    route: productServicePortfolioRoute,
    apiRoute: productServicePortfolioApiRoute,
    briefRoute: productServicePortfolioBriefRoute,
    status: productServicePortfolioStatus,
    briefStatus: productServicePortfolioBriefStatus,
    boundary: productServicePortfolioBoundary,
    authority: {
      dataBoundary: "synthetic-business-and-metadata-only",
      clinicalCareAuthority: "not-authorized-live-care",
      phiAuthority: "not-authorized-production-phi",
      legalAuthority: "qualified-review-required",
      accountingAuthority: "qualified-accounting-review-required",
      taxAuthority: "qualified-tax-review-required",
      financialAuthority: "not-audited-financial-report",
      revenueAuthority: "not-revenue-guarantee",
      profitAuthority: "not-profit-margin-guarantee",
      reimbursementAuthority: "no-reimbursement-guarantee",
      securitiesAuthority: "not-securities-offering-material",
      securityCertification: "not-security-certified",
      connectorAuthority: "not-production-connector-approved"
    },
    offerCount: productServiceOfferings.length,
    sellableNowOfferCount: productServiceOfferings.filter((offer) => offer.status === "sellable-now").length,
    packageReadyOfferCount: productServiceOfferings.filter((offer) => offer.status === "package-ready").length,
    packageCount: productServicePackages.length,
    deliveryPlaybookCount: productServiceDeliveryPlaybooks.length,
    deliverableCount: deliverables.length,
    qualificationGateCount: qualificationGates.length,
    marginLeverCount: marginLevers.length,
    marginControlCount: productServiceMarginControls.length,
    externalReviewMarginControlCount: productServiceMarginControls.filter(
      (control) => control.status === "external-review-required"
    ).length,
    boundaryResolutionCount: productServiceBoundaryResolutions.length,
    blockedClaimCount: blockedClaims.length,
    proofRouteCount: proofRoutes.length,
    hardStopCount: hardStops.length,
    offerStatusCounts: countStatuses(productServiceOfferings),
    packageStatusCounts: countStatuses(productServicePackages),
    controlStatusCounts: countStatuses(productServiceMarginControls),
    primaryRevenuePath: [
      "Assessment Package",
      "Readiness Sprint Package",
      "Synthetic Pilot Package",
      "Enterprise Activation Package",
      "Enterprise Operating Layer License",
      "Continuous Review Retainer"
    ],
    recommendedPosition:
      "Use /offerings as the canonical packaging layer: every buyer conversation should resolve to one package, one offer, one proof route, one margin control, and one retained boundary before pricing or implementation expands.",
    productServiceOfferings,
    productServicePackages,
    productServiceMarginControls,
    productServiceBoundaryResolutions,
    productServiceDeliveryPlaybooks,
    proofRoutes,
    deliverables,
    qualificationGates,
    marginLevers,
    blockedClaims,
    hardStops,
    updated: productServicePortfolioUpdatedAt
  };
}

export function buildProductServicePortfolioBrief() {
  const summary = getProductServicePortfolioSummary();

  return [
    "# SCRIMED Product And Services Portfolio Brief",
    "",
    `Status: ${summary.status}`,
    `Updated: ${summary.updated}`,
    `Offers: ${summary.offerCount}`,
    `Packages: ${summary.packageCount}`,
    `Margin controls: ${summary.marginControlCount}`,
    `Boundary resolutions: ${summary.boundaryResolutionCount}`,
    `Proof routes: ${summary.proofRouteCount}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is not legal advice, accounting advice, tax advice, audited financial reporting, securities offering material, investment advice, valuation assurance, customer permission, revenue guarantee, profit-margin guarantee, reimbursement assurance, clinical validation, compliance certification, security certification, PHI processing authority, production connector approval, EHR writeback approval, payer submission approval, or live clinical care authorization.",
    "",
    "## Recommended Position",
    summary.recommendedPosition,
    "",
    "## Revenue Path",
    markdownItems(summary.primaryRevenuePath),
    "",
    "## Offers",
    ...summary.productServiceOfferings.map(
      (offer) =>
        `- ${offer.name} (${offer.status}, ${offer.type}): ${offer.outcome} Buyer: ${offer.buyer}. Boundary: ${offer.boundary}`
    ),
    "",
    "## Packages",
    ...summary.productServicePackages.map(
      (pack) =>
        `- ${pack.name} (${pack.status}): ${pack.commercialModel}. Window: ${pack.deliveryWindow}. Expansion: ${pack.expansionPath}`
    ),
    "",
    "## Margin Controls",
    ...summary.productServiceMarginControls.map(
      (control) =>
        `- ${control.control} (${control.status}): ${control.operatingPolicy} Owner: ${control.owner}. Hard stops: ${control.hardStops.join(", ")}`
    ),
    "",
    "## Boundary Resolutions",
    ...summary.productServiceBoundaryResolutions.map(
      (resolution) =>
        `- ${resolution.boundary} (${resolution.status}): ${resolution.safeWorkaround} Remaining gate: ${resolution.remainingGate}`
    ),
    "",
    "## Delivery Playbook",
    ...summary.productServiceDeliveryPlaybooks.map(
      (playbook) =>
        `- ${playbook.phase}: ${playbook.purpose} Owner: ${playbook.owner}. Boundary: ${playbook.retainedBoundary}`
    ),
    "",
    "## Blocked Claims",
    markdownItems(summary.blockedClaims)
  ].join("\n");
}
