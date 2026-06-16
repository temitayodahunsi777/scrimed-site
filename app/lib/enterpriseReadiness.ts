export type ReadinessDomainSlug =
  | "legal"
  | "security"
  | "privacy"
  | "branding"
  | "governance"
  | "marketing"
  | "public-relations"
  | "sales"
  | "advertising";

export type ReadinessState =
  | "active-control"
  | "decision-required"
  | "external-review-required"
  | "planned";

export type ClaimState =
  | "approved-current-boundary"
  | "evidence-required"
  | "prohibited";

export type ReadinessRequirement = {
  id: string;
  name: string;
  state: ReadinessState;
  owner: string;
  currentEvidence: string;
  requiredAction: string;
  launchGate: string;
};

export type ReadinessDomain = {
  slug: ReadinessDomainSlug;
  name: string;
  route: string;
  apiRoute: string;
  status: ReadinessState;
  owner: string;
  objective: string;
  currentPosture: string;
  requirements: ReadinessRequirement[];
  publicCommitments: string[];
  prohibitedActions: string[];
  sourceUrls: string[];
};

export type PublicClaim = {
  id: string;
  claim: string;
  state: ClaimState;
  channels: string[];
  evidenceRoute: string;
  requiredQualifier: string;
  prohibitedVariant: string;
};

export const enterpriseReadinessBoundary =
  "This center is an operational readiness and claims-control register for SCRIMED's governed synthetic evaluation product. It is not legal advice, a compliance certification, a regulatory determination, or authorization for live clinical execution.";

const sources = {
  copyrightRegistration: "https://www.copyright.gov/registration/",
  usptoTrademarkBasics: "https://www.uspto.gov/trademarks/basics",
  hipaaSecurity: "https://www.hhs.gov/hipaa/for-professionals/security/index.html",
  hipaaPrivacy: "https://www.hhs.gov/hipaa/for-professionals/privacy/index.html",
  hipaaBreach: "https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html",
  ftcHealthBreach:
    "https://www.ftc.gov/business-guidance/resources/health-breach-notification-rule-basics-business",
  ftcHealthClaims:
    "https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance",
  fdaCds:
    "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software",
  nistCsf: "https://www.nist.gov/cyberframework",
  nistAiRmf: "https://www.nist.gov/itl/ai-risk-management-framework",
  gdpr: "https://commission.europa.eu/law/law-topic/data-protection/data-protection-eu_en",
  informationBlocking: "https://www.healthit.gov/topic/information-blocking"
};

export const enterpriseReadinessDomains: ReadinessDomain[] = [
  {
    slug: "legal",
    name: "Legal Readiness",
    route: "/trust-center/legal",
    apiRoute: "/api/enterprise-readiness/legal",
    status: "external-review-required",
    owner: "Founder, executive leadership, and qualified counsel",
    objective:
      "Establish the contracts, ownership, regulatory classification, and external review needed to sell and operate SCRIMED responsibly.",
    currentPosture:
      "The product boundary and prohibited clinical claims are explicit. Final legal documents and regulatory determinations require qualified counsel.",
    requirements: [
      {
        id: "legal-entity-ip",
        name: "Entity, ownership, and intellectual-property register",
        state: "external-review-required",
        owner: "Founder and counsel",
        currentEvidence: "SCRIMED SOLUTIONS, founder identity, product names, slogan, repositories, and operating context are documented.",
        requiredAction: "Verify entity records, invention assignment, contractor agreements, copyright registration candidates, trademark strategy, domains, and repository ownership.",
        launchGate: "Required before institutional financing, material partnerships, or enterprise contracting."
      },
      {
        id: "legal-copyright-provenance",
        name: "Copyright, license, and provenance control",
        state: "external-review-required",
        owner: "Founder, product, engineering, brand, and qualified IP counsel",
        currentEvidence: "Trust Safety Ops defines a Copyright And IP Sentinel for source, generated asset, logo, dataset, code, and publication provenance.",
        requiredAction: "Create an IP inventory, asset-source register, copyright registration queue, third-party license review, generated-content provenance process, and takedown/escalation workflow.",
        launchGate: "Required before publishing external decks, training materials, datasets, customer artifacts, or broad marketing campaigns."
      },
      {
        id: "legal-contract-stack",
        name: "Enterprise contract stack",
        state: "external-review-required",
        owner: "Counsel and sales operations",
        currentEvidence: "Offers, buyer path, pilot boundaries, deliverables, and production exclusions are structured in the product.",
        requiredAction: "Approve NDA, evaluation agreement, MSA, SOW, DPA, BAA when applicable, acceptable-use terms, and order form.",
        launchGate: "Executed agreement required before receiving confidential buyer data or beginning a paid engagement."
      },
      {
        id: "legal-regulatory-classification",
        name: "Product and regulatory classification",
        state: "external-review-required",
        owner: "Regulatory counsel and product governance",
        currentEvidence: "Current product is framed as synthetic operational intelligence with human review and no autonomous diagnosis.",
        requiredAction: "Document intended use, user, workflow, claims, decision-support role, and device/non-device assessment for every promoted capability.",
        launchGate: "Classification review required before changing intended use or entering live clinical workflows."
      },
      {
        id: "legal-insurance",
        name: "Enterprise insurance posture",
        state: "decision-required",
        owner: "Executive leadership",
        currentEvidence: "No insurance attestation is made in the current product.",
        requiredAction: "Select appropriate general liability, cyber, technology E&O, and other coverage with qualified advisors.",
        launchGate: "Coverage decision required before protected pilots and enterprise contract commitments."
      }
    ],
    publicCommitments: [
      "Use written scope, boundaries, and acceptance criteria for each engagement.",
      "Preserve human review and synthetic-only boundaries until approved controls exist.",
      "Do not present readiness artifacts as legal opinions or certifications."
    ],
    prohibitedActions: [
      "Claiming HIPAA compliance, FDA clearance, certification, or regulatory approval without documented basis.",
      "Accepting PHI or confidential buyer data without an approved agreement and data-handling path.",
      "Changing intended use through marketing copy without regulatory and governance review."
    ],
    sourceUrls: [
      sources.copyrightRegistration,
      sources.usptoTrademarkBasics,
      sources.fdaCds,
      sources.hipaaPrivacy,
      sources.informationBlocking
    ]
  },
  {
    slug: "security",
    name: "Security Readiness",
    route: "/trust-center/security",
    apiRoute: "/api/enterprise-readiness/security",
    status: "decision-required",
    owner: "Security and engineering",
    objective:
      "Move from secure-by-default synthetic evaluation into an evidence-backed enterprise security program before protected use.",
    currentPosture:
      "The application maintains synthetic-only boundaries, deny-by-default execution routes, reproducible builds, and baseline browser security headers. A formal security program and independent testing remain required.",
    requirements: [
      {
        id: "security-risk-program",
        name: "Security risk-management program",
        state: "decision-required",
        owner: "Security leader",
        currentEvidence: "Security blockers, identity decisions, runtime safety, audit boundaries, and connector gates are visible in product readiness registers.",
        requiredAction: "Approve risk assessment method, control owners, risk register, review cadence, and executive acceptance process.",
        launchGate: "Required before protected enterprise pilots."
      },
      {
        id: "security-incident-response",
        name: "Incident response and breach operations",
        state: "decision-required",
        owner: "Security, privacy, legal, and communications",
        currentEvidence: "Trust Safety Ops defines incident detection, triage, containment, fixing, and improvement loops; no final managed 24/7 SOC/MDR coverage is asserted.",
        requiredAction: "Approve incident taxonomy, response roles, 24/7 on-call coverage, evidence preservation, notification analysis, communications, exercises, and post-incident review.",
        launchGate: "Tabletop-tested plan required before processing protected or confidential data."
      },
      {
        id: "security-testing",
        name: "Vulnerability management and independent testing",
        state: "external-review-required",
        owner: "Security and independent assessor",
        currentEvidence: "Dependency audit, CI, lint, typecheck, build checks, security headers, and Vercel deployment verification are active.",
        requiredAction: "Implement vulnerability SLAs, dependency monitoring, secrets review, SAST/DAST as appropriate, penetration testing, and remediation evidence.",
        launchGate: "Independent testing and remediation required before production healthcare use."
      },
      {
        id: "security-public-intake",
        name: "Public intake abuse and availability controls",
        state: "decision-required",
        owner: "Security and engineering",
        currentEvidence: "Pilot intake validates content type, payload size, fields, synthetic boundary, and webhook timeout.",
        requiredAction: "Add rate limiting, bot protection, monitoring, abuse response, and protected CRM delivery before scaling public campaigns.",
        launchGate: "Required before paid advertising or high-volume public intake."
      }
    ],
    publicCommitments: [
      "Operate public product surfaces without PHI.",
      "Keep live execution denied until identity, tenant, audit, runtime, and connector controls are approved.",
      "Publish security posture as readiness evidence, not certification."
    ],
    prohibitedActions: [
      "Requesting credentials, secrets, PHI, or patient records through public intake.",
      "Representing baseline headers or dependency audits as a complete security program.",
      "Opening production execution routes before approval gates pass."
    ],
    sourceUrls: [sources.hipaaSecurity, sources.nistCsf, sources.hipaaBreach]
  },
  {
    slug: "privacy",
    name: "Privacy Readiness",
    route: "/trust-center/privacy",
    apiRoute: "/api/enterprise-readiness/privacy",
    status: "decision-required",
    owner: "Privacy, legal, security, and product",
    objective:
      "Define transparent data practices, rights, retention, processing roles, and regional obligations before protected data enters SCRIMED.",
    currentPosture:
      "Public product flows prohibit PHI and minimize captured data. Final notices, processing records, retention schedules, and regional assessments remain required.",
    requirements: [
      {
        id: "privacy-data-inventory",
        name: "Data inventory and processing register",
        state: "decision-required",
        owner: "Privacy and product",
        currentEvidence: "Current public intake fields and prohibited PHI categories are documented.",
        requiredAction: "Map every data category, source, purpose, legal basis, processor, recipient, region, retention period, and deletion path.",
        launchGate: "Required before adding persistence, analytics, authentication, or protected integrations."
      },
      {
        id: "privacy-notices-rights",
        name: "Privacy notices and individual rights",
        state: "external-review-required",
        owner: "Privacy counsel",
        currentEvidence: "No final legal privacy notice is represented by the current product.",
        requiredAction: "Approve audience-specific privacy notices, rights-request workflow, consent choices, and contact path.",
        launchGate: "Required before collecting personal information beyond limited business-contact intake."
      },
      {
        id: "privacy-retention-deletion",
        name: "Retention, deletion, and data minimization",
        state: "decision-required",
        owner: "Privacy, security, and engineering",
        currentEvidence: "Synthetic-first design and metadata-only denied-execution boundaries reduce current exposure.",
        requiredAction: "Approve retention schedules, deletion verification, backup handling, legal holds, and minimum-necessary rules.",
        launchGate: "Required before durable storage."
      },
      {
        id: "privacy-regional",
        name: "Regional privacy and transfer assessment",
        state: "external-review-required",
        owner: "Privacy counsel and regional operations",
        currentEvidence: "Global target regions are documented; no universal compliance claim is made.",
        requiredAction: "Map applicable US state, HIPAA role, FTC, GDPR, and priority-region requirements, including cross-border transfer and localization decisions.",
        launchGate: "Assessment required before entering each new region or customer data environment."
      }
    ],
    publicCommitments: [
      "Collect only necessary business and evaluation information on public routes.",
      "Reject PHI-style content from public pilot intake.",
      "Keep protected data processing gated behind approved agreements and controls."
    ],
    prohibitedActions: [
      "Using public-intake data for unrelated purposes without notice and approval.",
      "Assuming HIPAA applicability excludes FTC or regional privacy obligations.",
      "Claiming global privacy compliance without jurisdiction-specific evidence."
    ],
    sourceUrls: [sources.hipaaPrivacy, sources.ftcHealthBreach, sources.gdpr]
  },
  {
    slug: "branding",
    name: "Brand Readiness",
    route: "/trust-center/branding",
    apiRoute: "/api/enterprise-readiness/branding",
    status: "external-review-required",
    owner: "Founder, brand leadership, and counsel",
    objective:
      "Protect a coherent SCRIMED identity while separating enterprise, product, and faith-aligned experiences clearly.",
    currentPosture:
      "Company name, slogan, visual language, official Wix site, branded product domain, Atlas, and FaithCore boundaries are documented.",
    requirements: [
      {
        id: "brand-architecture",
        name: "Brand architecture and naming system",
        state: "active-control",
        owner: "Founder and product",
        currentEvidence: "SCRIMED, SCRIMED Atlas, FaithCore, AgentOS, and named product modules have explicit roles and audience boundaries.",
        requiredAction: "Maintain a canonical naming, capitalization, audience, and endorsement register.",
        launchGate: "Required for every new product, service, or campaign."
      },
      {
        id: "brand-trademark",
        name: "Trademark clearance and protection",
        state: "external-review-required",
        owner: "Trademark counsel",
        currentEvidence: "Product and company names are consistently used; no trademark clearance claim is made.",
        requiredAction: "Perform clearance, select filing strategy, secure priority domains and handles, and define enforcement process.",
        launchGate: "Review required before major campaigns, licensing, or geographic expansion."
      },
      {
        id: "brand-copyright-assets",
        name: "Copyrighted asset and generated-media provenance",
        state: "decision-required",
        owner: "Brand, product, engineering, and counsel",
        currentEvidence: "Trust Safety Ops blocks unapproved third-party content, logos, screenshots, datasets, generated media, and public source excerpts.",
        requiredAction: "Approve asset provenance metadata, license records, generated-media prompts/sources, approval owners, and removal workflow.",
        launchGate: "Required before public campaign creative, decks, demo videos, and customer-facing proof packets."
      },
      {
        id: "brand-standards",
        name: "Visual and verbal standards",
        state: "decision-required",
        owner: "Brand and communications",
        currentEvidence: "The product app uses a consistent visual system and enterprise-safe tone.",
        requiredAction: "Approve logo usage, colors, typography, imagery, messaging hierarchy, accessibility, and partner co-branding standards.",
        launchGate: "Required before delegating external creative production."
      },
      {
        id: "brand-faithcore-separation",
        name: "Atlas and FaithCore audience separation",
        state: "active-control",
        owner: "Product governance",
        currentEvidence: "Atlas is faith-neutral and enterprise-focused; FaithCore is opt-in and cannot replace clinical care or consent.",
        requiredAction: "Review every cross-brand use for audience clarity, professional standards, and opt-in controls.",
        launchGate: "Required before any FaithCore enterprise integration."
      }
    ],
    publicCommitments: [
      "Present SCRIMED as trustworthy healthcare operational intelligence.",
      "Keep Atlas enterprise-neutral and FaithCore explicitly opt-in.",
      "Use consistent product names and approved boundaries."
    ],
    prohibitedActions: [
      "Using unreviewed medical authority signals or implied endorsements.",
      "Blurring faith support with diagnosis, treatment, emergency care, or clinical consent.",
      "Launching new names without brand and legal review."
    ],
    sourceUrls: [sources.copyrightRegistration, sources.usptoTrademarkBasics]
  },
  {
    slug: "governance",
    name: "AI & Enterprise Governance",
    route: "/trust-center/governance",
    apiRoute: "/api/enterprise-readiness/governance",
    status: "active-control",
    owner: "Executive, clinical, security, privacy, and AI governance",
    objective:
      "Make every AI asset, workflow, decision boundary, owner, evidence source, and human approval inspectable.",
    currentPosture:
      "Agent registry, TrustQA, Trust Cards, AI Asset Registry, audit surfaces, human approvals, deny-by-default routes, and quality gates are active for synthetic evaluation.",
    requirements: [
      {
        id: "governance-ai-assets",
        name: "AI Asset Registry and shadow-AI control",
        state: "active-control",
        owner: "AI governance",
        currentEvidence: "Atlas and Audit surfaces expose AI assets, owners, usage boundaries, and shadow-AI detection posture.",
        requiredAction: "Require registration and approval before every model, prompt, agent, connector, tool, and knowledge source enters a workflow.",
        launchGate: "Required before evaluation or production use."
      },
      {
        id: "governance-accountability",
        name: "Accountable owners and decision rights",
        state: "decision-required",
        owner: "Executive leadership",
        currentEvidence: "Product registers identify owners and review roles at a control level.",
        requiredAction: "Approve enterprise RACI, risk acceptance authority, clinical safety ownership, escalation, and board reporting.",
        launchGate: "Required before protected pilots."
      },
      {
        id: "governance-human-oversight",
        name: "Human oversight and override",
        state: "active-control",
        owner: "Product and workflow owners",
        currentEvidence: "Current agents and workflows remain human-review gated with blocked unsafe actions.",
        requiredAction: "Define reviewer competence, approval authority, override evidence, escalation, and monitoring per workflow.",
        launchGate: "Required before every pilot and production workflow."
      },
      {
        id: "governance-continuous-validation",
        name: "Continuous validation and change control",
        state: "active-control",
        owner: "Quality, Watchtower, and product",
        currentEvidence: "Synthetic validations, conformance kits, fixture fingerprints, promotion reviews, proof routes, and outcome metrics are inspectable.",
        requiredAction: "Bind production changes to versioned approvals, monitored outcomes, incident thresholds, and rollback decisions.",
        launchGate: "Production promotion remains blocked until approved."
      }
    ],
    publicCommitments: [
      "Require accountable ownership and human review.",
      "Attach provenance, confidence, validation, and boundaries to recommendations.",
      "Measure workflow outcomes and override behavior, not benchmark scores alone."
    ],
    prohibitedActions: [
      "Deploying unregistered agents, models, prompts, or knowledge sources.",
      "Allowing autonomous diagnosis, treatment, or patient-facing action.",
      "Promoting a workflow without evidence, approval, monitoring, and rollback controls."
    ],
    sourceUrls: [sources.nistAiRmf, sources.nistCsf]
  },
  {
    slug: "marketing",
    name: "Marketing Readiness",
    route: "/trust-center/marketing",
    apiRoute: "/api/enterprise-readiness/marketing",
    status: "active-control",
    owner: "Marketing, product, legal, and clinical governance",
    objective:
      "Explain SCRIMED's value clearly while keeping every healthcare, performance, and compliance statement evidence-backed.",
    currentPosture:
      "Product copy consistently presents governed synthetic evaluations, operational intelligence, human review, and explicit production exclusions.",
    requirements: [
      {
        id: "marketing-message-house",
        name: "Approved message house",
        state: "active-control",
        owner: "Brand and product",
        currentEvidence: "Mission, slogan, audience, product boundary, offers, and claims register are centralized.",
        requiredAction: "Use the claims register as the source of truth for websites, decks, content, events, and partner materials.",
        launchGate: "Claims review required before publication."
      },
      {
        id: "marketing-outcome-evidence",
        name: "Outcome and performance substantiation",
        state: "active-control",
        owner: "Product, analytics, and legal",
        currentEvidence: "Time, friction, quality, revenue, and access signals are framed as buyer-validated pilot metrics.",
        requiredAction: "Retain baseline, method, sample, limitations, validation date, approval, and source for every quantified statement.",
        launchGate: "Evidence packet required before quantified publication."
      },
      {
        id: "marketing-audience-segmentation",
        name: "Audience and regional review",
        state: "decision-required",
        owner: "Marketing and regional governance",
        currentEvidence: "Buyer segments and priority regions are documented.",
        requiredAction: "Approve audience, region, channel, language, accessibility, and regulatory review before campaign launch.",
        launchGate: "Required for each new campaign."
      },
      {
        id: "marketing-analytics-consent",
        name: "Marketing analytics and consent",
        state: "decision-required",
        owner: "Marketing and privacy",
        currentEvidence: "No broad analytics or behavioral advertising claim is made in the product.",
        requiredAction: "Approve analytics inventory, consent approach, cookie controls, retention, processors, and opt-out path.",
        launchGate: "Required before adding non-essential tracking."
      }
    ],
    publicCommitments: [
      "State the synthetic evaluation boundary prominently.",
      "Treat outcome statements as measured pilot evidence, not guarantees.",
      "Use the claims register before publishing."
    ],
    prohibitedActions: [
      "Publishing unsupported health, financial, performance, or compliance claims.",
      "Hiding material limitations or production exclusions.",
      "Using buyer logos, quotes, or results without written approval."
    ],
    sourceUrls: [sources.ftcHealthClaims, sources.fdaCds]
  },
  {
    slug: "public-relations",
    name: "Public Relations Readiness",
    route: "/trust-center/public-relations",
    apiRoute: "/api/enterprise-readiness/public-relations",
    status: "decision-required",
    owner: "Founder, communications, legal, security, and governance",
    objective:
      "Give SCRIMED a disciplined public voice for launches, partnerships, issues, and incidents.",
    currentPosture:
      "The mission, product boundary, official website, founder, and approved claims are documented. Formal media and crisis processes remain to be approved.",
    requirements: [
      {
        id: "pr-fact-sheet",
        name: "Approved company and product fact sheet",
        state: "active-control",
        owner: "Communications and product",
        currentEvidence: "Company mission, slogan, founder, product routes, offers, boundaries, and claims are centralized.",
        requiredAction: "Maintain a dated fact sheet and route all public factual statements through it.",
        launchGate: "Required before media outreach."
      },
      {
        id: "pr-spokesperson",
        name: "Spokesperson and approval protocol",
        state: "decision-required",
        owner: "Founder and communications",
        currentEvidence: "Founder and CEO is documented; no formal spokesperson matrix is asserted.",
        requiredAction: "Approve spokespersons, subject boundaries, briefing process, quote approval, and media-log retention.",
        launchGate: "Required before proactive media engagement."
      },
      {
        id: "pr-crisis",
        name: "Crisis and incident communications",
        state: "decision-required",
        owner: "Communications, security, privacy, legal, and executive leadership",
        currentEvidence: "Incident response and public claims are tracked as readiness requirements.",
        requiredAction: "Approve severity-based holding statements, notification coordination, stakeholder channels, decision rights, and simulation cadence.",
        launchGate: "Exercise required before protected pilots."
      },
      {
        id: "pr-partnerships",
        name: "Partnership and announcement controls",
        state: "decision-required",
        owner: "Partnerships, communications, and legal",
        currentEvidence: "No unapproved partner endorsements or customer claims are used.",
        requiredAction: "Require written approval for names, logos, quotes, results, launch timing, and material claims.",
        launchGate: "Required before every partnership announcement."
      }
    ],
    publicCommitments: [
      "Use dated, approved facts and disclose material product boundaries.",
      "Coordinate incident communications with legal, privacy, and security analysis.",
      "Respect buyer confidentiality and announcement rights."
    ],
    prohibitedActions: [
      "Announcing customers, partners, approvals, or outcomes without written authorization.",
      "Speculating publicly during an active security, privacy, or safety incident.",
      "Using aspirational roadmap items as current product capabilities."
    ],
    sourceUrls: [sources.hipaaBreach, sources.ftcHealthBreach]
  },
  {
    slug: "sales",
    name: "Sales Readiness",
    route: "/trust-center/sales",
    apiRoute: "/api/enterprise-readiness/sales",
    status: "active-control",
    owner: "Founder, sales, product, legal, security, and privacy",
    objective:
      "Sell a clear, repeatable synthetic evaluation product with disciplined qualification, claims, diligence, contracts, and handoffs.",
    currentPosture:
      "Pricing, offers, demos, pilot programs, no-PHI intake, branded product routing, readiness brief, and proof stack are available.",
    requirements: [
      {
        id: "sales-offer-catalog",
        name: "Approved offer catalog and qualification",
        state: "active-control",
        owner: "Sales and product",
        currentEvidence: "Four sellable services, buyer segments, pilot programs, pricing strategy, proof routes, and boundaries are published.",
        requiredAction: "Qualify buyer problem, workflow, sponsor, data boundary, success metric, diligence needs, and contracting path before proposal.",
        launchGate: "Required before proposal."
      },
      {
        id: "sales-diligence",
        name: "Security, privacy, legal, and governance diligence",
        state: "active-control",
        owner: "Sales operations and control owners",
        currentEvidence: "Trust Center, claims register, readiness registers, and downloadable diligence brief expose current posture and gaps.",
        requiredAction: "Answer diligence from evidence; route unresolved questions to accountable owners; never invent a control or certification.",
        launchGate: "Required before contract signature."
      },
      {
        id: "sales-crm-routing",
        name: "CRM routing and pipeline controls",
        state: "decision-required",
        owner: "Sales operations",
        currentEvidence: "Pilot intake produces a sanitized CRM-ready handoff and supports a configurable secure webhook.",
        requiredAction: "Select CRM, configure secure delivery, deduplication, ownership, response SLA, consent, retention, and reporting.",
        launchGate: "Required before scaling lead volume."
      },
      {
        id: "sales-contract-handoff",
        name: "Contract-to-delivery handoff",
        state: "decision-required",
        owner: "Sales, legal, delivery, security, and product",
        currentEvidence: "Programs define buyer inputs, deliverables, success metrics, governance gates, and production exclusions.",
        requiredAction: "Create signed-scope handoff, change control, acceptance, risk, escalation, and closeout checklist.",
        launchGate: "Required before kickoff."
      }
    ],
    publicCommitments: [
      "Sell the current governed synthetic evaluation product truthfully.",
      "Use buyer-approved success metrics and production exclusions.",
      "Answer diligence with evidence and named owners."
    ],
    prohibitedActions: [
      "Selling live clinical execution, autonomous care, or production connectors that do not exist.",
      "Promising guaranteed outcomes, compliance, reimbursement, or deployment timing.",
      "Accepting PHI through public sales channels."
    ],
    sourceUrls: [sources.ftcHealthClaims, sources.hipaaPrivacy, sources.hipaaSecurity]
  },
  {
    slug: "advertising",
    name: "Advertising Readiness",
    route: "/trust-center/advertising",
    apiRoute: "/api/enterprise-readiness/advertising",
    status: "external-review-required",
    owner: "Advertising, marketing, privacy, legal, and clinical governance",
    objective:
      "Scale awareness without creating unsupported healthcare claims, privacy risk, endorsement risk, or buyer confusion.",
    currentPosture:
      "Approved and prohibited claims are centralized. Paid campaign controls, substantiation packets, targeting policy, and review workflow remain required.",
    requirements: [
      {
        id: "advertising-substantiation",
        name: "Claim substantiation packet",
        state: "external-review-required",
        owner: "Legal, clinical governance, product, and analytics",
        currentEvidence: "Current outcome language is limited to pilot measurement targets and inspectable product evidence.",
        requiredAction: "Create evidence packet and approval for every express or implied health, performance, financial, comparative, and compliance statement.",
        launchGate: "Required before paid publication."
      },
      {
        id: "advertising-disclosures",
        name: "Disclosures and material limitations",
        state: "external-review-required",
        owner: "Legal and marketing",
        currentEvidence: "Synthetic-only and no-autonomous-care boundaries are prominent in product copy.",
        requiredAction: "Approve clear, proximate disclosures by format, audience, channel, and region.",
        launchGate: "Required before campaign launch."
      },
      {
        id: "advertising-endorsements",
        name: "Testimonials, endorsements, and results",
        state: "external-review-required",
        owner: "Legal, communications, and customer success",
        currentEvidence: "No unapproved testimonials or endorsements are used.",
        requiredAction: "Verify typicality, material connections, written permissions, result context, and required disclosures.",
        launchGate: "Required before publishing any endorsement."
      },
      {
        id: "advertising-targeting",
        name: "Targeting, tracking, and landing-page controls",
        state: "decision-required",
        owner: "Privacy, marketing, and security",
        currentEvidence: "Public intake prohibits PHI and paid advertising has not been represented as active.",
        requiredAction: "Approve targeting exclusions, sensitive-data policy, tracking consent, rate limiting, bot protection, landing-page review, and lead retention.",
        launchGate: "Required before paid campaigns."
      }
    ],
    publicCommitments: [
      "Use clear disclosures and evidence-backed claims.",
      "Avoid sensitive-health targeting and PHI collection.",
      "Route every campaign through claims, privacy, security, and legal review."
    ],
    prohibitedActions: [
      "Implying diagnosis, treatment, guaranteed outcomes, or regulatory approval.",
      "Using sensitive health data for targeting without an approved lawful basis and controls.",
      "Launching paid traffic before public intake abuse controls are approved."
    ],
    sourceUrls: [sources.ftcHealthClaims, sources.ftcHealthBreach, sources.fdaCds]
  }
];

export const publicClaimsRegister: PublicClaim[] = [
  {
    id: "claim-synthetic-evaluations",
    claim: "SCRIMED provides governed synthetic healthcare workflow evaluations.",
    state: "approved-current-boundary",
    channels: ["website", "sales", "marketing", "PR", "advertising"],
    evidenceRoute: "/demos",
    requiredQualifier: "Current product boundary is synthetic evaluation and enterprise assessment.",
    prohibitedVariant: "SCRIMED autonomously executes healthcare workflows."
  },
  {
    id: "claim-human-review",
    claim: "Human review is required for current SCRIMED workflow and agent outputs.",
    state: "approved-current-boundary",
    channels: ["website", "sales", "marketing", "PR", "advertising"],
    evidenceRoute: "/trust",
    requiredQualifier: "Human review requirements vary by governed workflow and remain mandatory before external action.",
    prohibitedVariant: "SCRIMED replaces clinicians or independently makes care decisions."
  },
  {
    id: "claim-synthetic-data",
    claim: "Current public demos and evaluations use synthetic data.",
    state: "approved-current-boundary",
    channels: ["website", "sales", "marketing", "PR", "advertising"],
    evidenceRoute: "/synthetic/validation",
    requiredQualifier: "No live PHI or production clinical records are authorized in the current public product.",
    prohibitedVariant: "SCRIMED currently processes live patient records."
  },
  {
    id: "claim-interoperability-readiness",
    claim: "SCRIMED supports interoperability readiness and synthetic conformance evaluation.",
    state: "approved-current-boundary",
    channels: ["website", "sales", "marketing", "PR"],
    evidenceRoute: "/interoperability/evaluations",
    requiredQualifier: "Synthetic pass does not mean a live connector is implemented, certified, or partner-approved.",
    prohibitedVariant: "SCRIMED has certified live FHIR, DICOM, HL7, or payer connectors."
  },
  {
    id: "claim-friction",
    claim: "SCRIMED helps organizations surface operational workflow friction.",
    state: "approved-current-boundary",
    channels: ["website", "sales", "marketing", "PR", "advertising"],
    evidenceRoute: "/workflows",
    requiredQualifier: "Buyer validation and workflow-specific measurement are required.",
    prohibitedVariant: "SCRIMED eliminates healthcare workflow friction."
  },
  {
    id: "claim-time-saved",
    claim: "SCRIMED can measure time saved during a buyer-approved pilot.",
    state: "evidence-required",
    channels: ["sales", "marketing", "PR", "advertising"],
    evidenceRoute: "/observability",
    requiredQualifier: "Any number must identify baseline, method, sample, limitations, and validation date.",
    prohibitedVariant: "SCRIMED guarantees time savings."
  },
  {
    id: "claim-denial-reduction",
    claim: "SCRIMED can evaluate denial-risk workflow signals during a governed pilot.",
    state: "evidence-required",
    channels: ["sales", "marketing", "PR", "advertising"],
    evidenceRoute: "/product",
    requiredQualifier: "No denial reduction, coverage, payment, coding, or reimbursement outcome is guaranteed.",
    prohibitedVariant: "SCRIMED prevents denials or guarantees reimbursement."
  },
  {
    id: "claim-outcomes",
    claim: "SCRIMED can measure buyer-approved operational outcome signals.",
    state: "evidence-required",
    channels: ["sales", "marketing", "PR", "advertising"],
    evidenceRoute: "/observability",
    requiredQualifier: "Operational pilot metrics are not clinical-outcome claims.",
    prohibitedVariant: "SCRIMED improves patient outcomes without validated evidence."
  },
  {
    id: "claim-compliance",
    claim: "SCRIMED is HIPAA compliant, certified, or approved.",
    state: "prohibited",
    channels: ["website", "sales", "marketing", "PR", "advertising"],
    evidenceRoute: "/trust-center",
    requiredQualifier: "Describe specific implemented controls and remaining requirements instead.",
    prohibitedVariant: "Any unsupported compliance, certification, approval, or clearance claim."
  },
  {
    id: "claim-production-ready",
    claim: "SCRIMED is production-ready for live clinical execution.",
    state: "prohibited",
    channels: ["website", "sales", "marketing", "PR", "advertising"],
    evidenceRoute: "/workflows/implementation-readiness",
    requiredQualifier: "Sellable today as a governed synthetic pilot and enterprise evaluation product.",
    prohibitedVariant: "SCRIMED treats patients, files records, submits claims, or executes care autonomously."
  },
  {
    id: "claim-zero-errors",
    claim: "SCRIMED has zero errors, flaws, risks, or failures.",
    state: "prohibited",
    channels: ["website", "sales", "marketing", "PR", "advertising"],
    evidenceRoute: "/quality",
    requiredQualifier: "Describe active controls, known limitations, monitoring, and remediation paths.",
    prohibitedVariant: "Any absolute guarantee of perfection, safety, security, availability, or accuracy."
  }
];

export function getReadinessDomains() {
  return enterpriseReadinessDomains;
}

export function getReadinessDomainBySlug(slug: string) {
  return enterpriseReadinessDomains.find((domain) => domain.slug === slug);
}

export function getClaimsRegister() {
  return publicClaimsRegister;
}

export function getEnterpriseReadinessSummary() {
  const requirements = enterpriseReadinessDomains.flatMap((domain) => domain.requirements);
  const activeControls = requirements.filter((item) => item.state === "active-control").length;
  const decisionsRequired = requirements.filter((item) => item.state === "decision-required").length;
  const externalReviewsRequired = requirements.filter(
    (item) => item.state === "external-review-required"
  ).length;
  const planned = requirements.filter((item) => item.state === "planned").length;

  return {
    service: "scrimed-enterprise-readiness",
    route: "/trust-center",
    apiRoute: "/api/enterprise-readiness",
    status: "synthetic-commercial-readiness-governed",
    boundary: enterpriseReadinessBoundary,
    publicSyntheticSalesReady: true,
    legalProductionReady: false,
    productionClinicalReady: false,
    domains: enterpriseReadinessDomains,
    domainCount: enterpriseReadinessDomains.length,
    requirementCount: requirements.length,
    activeControls,
    decisionsRequired,
    externalReviewsRequired,
    planned,
    claims: {
      route: "/claims",
      apiRoute: "/api/enterprise-readiness/claims",
      approved: publicClaimsRegister.filter((claim) => claim.state === "approved-current-boundary").length,
      evidenceRequired: publicClaimsRegister.filter((claim) => claim.state === "evidence-required").length,
      prohibited: publicClaimsRegister.filter((claim) => claim.state === "prohibited").length,
      total: publicClaimsRegister.length
    },
    updated: "2026-06-15"
  };
}

export function getEnterpriseDiligenceBrief() {
  const summary = getEnterpriseReadinessSummary();
  const lines = [
    "# SCRIMED Enterprise Readiness and Diligence Brief",
    "",
    `Updated: ${summary.updated}`,
    "",
    "## Current Boundary",
    "",
    summary.boundary,
    "",
    `- Public synthetic sales ready: ${summary.publicSyntheticSalesReady ? "yes" : "no"}`,
    `- Legal production ready: ${summary.legalProductionReady ? "yes" : "no"}`,
    `- Production clinical ready: ${summary.productionClinicalReady ? "yes" : "no"}`,
    `- Active controls: ${summary.activeControls}`,
    `- Decisions required: ${summary.decisionsRequired}`,
    `- External reviews required: ${summary.externalReviewsRequired}`,
    "",
    "## Readiness Domains",
    ""
  ];

  for (const domain of enterpriseReadinessDomains) {
    lines.push(`### ${domain.name}`, "", `Status: ${domain.status}`, "", domain.currentPosture, "");
    for (const requirement of domain.requirements) {
      lines.push(
        `- ${requirement.name} [${requirement.state}]`,
        `  Owner: ${requirement.owner}`,
        `  Required action: ${requirement.requiredAction}`,
        `  Launch gate: ${requirement.launchGate}`
      );
    }
    lines.push("");
  }

  lines.push(
    "## Claims Control",
    "",
    "Approved claims describe the current synthetic evaluation boundary. Quantified outcomes require evidence. Compliance, regulatory approval, autonomous care, guaranteed outcomes, live connector certification, production readiness, and zero-error claims are prohibited without documented authorization.",
    "",
    "## Required External Actions",
    "",
    "- Qualified legal and regulatory counsel review",
    "- Privacy notices, processing register, retention schedule, and regional assessments",
    "- Enterprise agreement stack, including DPA and BAA where applicable",
    "- Trademark clearance and brand standards",
    "- Formal security program, incident response exercise, and independent penetration test",
    "- Public intake rate limiting and bot protection before scaled campaigns",
    "- CRM routing, sales handoff, and campaign approval workflows",
    "",
    "This brief is an operational readiness artifact, not legal advice or certification."
  );

  return lines.join("\n");
}
