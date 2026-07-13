import { getCapitalVitalitySummary } from "./capitalVitality";
import { getGrowthEngineSummary } from "./growthEngine";
import { getPublicMarketReadinessSummary } from "./publicMarketReadiness";

export type EnterpriseBusinessSourceType =
  | "official-government"
  | "official-framework"
  | "official-accounting-body"
  | "official-tax-guidance"
  | "internal-operating-source";

export type EnterpriseBusinessStatus =
  | "active-control-plane"
  | "human-review-required"
  | "qualified-review-required"
  | "blocked-before-approval";

export type EnterpriseBusinessSource = {
  name: string;
  sourceType: EnterpriseBusinessSourceType;
  url: string;
  reviewedAt: string;
  signal: string;
  scrimedApplication: string;
};

export type EnterpriseRevenueCapability = {
  slug: string;
  name: string;
  status: EnterpriseBusinessStatus;
  buyer: string;
  revenueMotion: string;
  marginContribution: string;
  proofRoutes: string[];
  retainedGate: string;
  nextAction: string;
};

export type EnterpriseMarginControl = {
  control: string;
  owner: string;
  status: EnterpriseBusinessStatus;
  marginRisk: string;
  operatingPolicy: string;
  evidenceRoutes: string[];
  blockedUntilReviewed: string[];
};

export type EnterpriseTeamRole = {
  role: string;
  team: "legal" | "finance" | "accounting" | "tax" | "revenue-operations";
  status: EnterpriseBusinessStatus;
  responsibility: string;
  approvalAuthority: string;
  escalationTrigger: string;
};

export type EnterpriseBusinessControl = {
  control: string;
  purpose: string;
  owner: string;
  evidence: string[];
  hardStops: string[];
};

export type EnterpriseOperatingCadence = {
  cadence: string;
  owner: string;
  reviewedSignals: string[];
  decisionOutput: string;
  retainedBoundary: string;
};

export type EnterpriseProfitLever = {
  lever: string;
  useCase: string;
  marginPath: string;
  requiredControl: string;
  blockedClaim: string;
};

export const enterpriseBusinessOpsRoute = "/enterprise-business-ops";
export const enterpriseBusinessOpsApiRoute = "/api/enterprise-business-ops";
export const enterpriseBusinessOpsBriefRoute = "/api/enterprise-business-ops/brief";
export const enterpriseBusinessOpsStatus =
  "enterprise-business-ops-revenue-margin-control-plane-active";
export const enterpriseBusinessOpsBriefStatus =
  "enterprise-business-ops-brief-ready-no-legal-accounting-advice";
export const enterpriseBusinessOpsUpdatedAt = "2026-06-25";

export const enterpriseBusinessOpsBoundary =
  "SCRIMED Enterprise Business Operations organizes revenue capability, profit-margin discipline, legal operations, finance/accounting controls, tax-awareness routing, enterprise deal approval, and audit evidence for qualified human review. It is operating-readiness material only. It is not legal advice, accounting advice, tax advice, audited financial reporting, securities offering material, investment advice, valuation assurance, contract approval, revenue guarantee, profit-margin guarantee, reimbursement assurance, customer permission, certification, PHI processing authority, production connector approval, or live clinical care authorization.";

export const enterpriseBusinessSources: EnterpriseBusinessSource[] = [
  {
    name: "DOJ Evaluation of Corporate Compliance Programs",
    sourceType: "official-government",
    url: "https://www.justice.gov/criminal-fraud/page/file/937501/download",
    reviewedAt: enterpriseBusinessOpsUpdatedAt,
    signal:
      "The September 2024 DOJ guidance evaluates whether a compliance program is well designed, adequately resourced and empowered, and works in practice, with attention to risk assessment, emerging technology, reporting channels, investigations, training, incentives, and internal controls.",
    scrimedApplication:
      "Route enterprise deals, public claims, partner arrangements, AI use, and escalation processes through documented compliance ownership and evidence trails."
  },
  {
    name: "COSO Internal Control - Integrated Framework",
    sourceType: "official-framework",
    url: "https://www.coso.org/guidance-on-ic",
    reviewedAt: enterpriseBusinessOpsUpdatedAt,
    signal:
      "COSO frames internal control as supporting operations, reporting, and compliance objectives, with monitoring, information quality, control activities, and healthcare-provider implementation guidance called out on its official internal-control page.",
    scrimedApplication:
      "Structure finance, quote-to-contract, revenue-recognition review, audit evidence retention, and margin controls as owned control activities rather than informal founder judgment."
  },
  {
    name: "AICPA SOC Suite of Services",
    sourceType: "official-accounting-body",
    url: "https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services",
    reviewedAt: enterpriseBusinessOpsUpdatedAt,
    signal:
      "AICPA describes SOC as service offerings CPAs may provide for system-level controls of a service organization or entity-level controls of other organizations, supporting user assessment of outsourcing risks.",
    scrimedApplication:
      "Keep SOC-related buyer language in readiness mode until an independent qualified CPA firm performs any applicable engagement."
  },
  {
    name: "OECD Transfer Pricing Guidelines",
    sourceType: "official-tax-guidance",
    url: "https://www.oecd.org/en/publications/oecd-transfer-pricing-guidelines-for-multinational-enterprises-and-tax-administrations-2022_0e655865-en.html",
    reviewedAt: enterpriseBusinessOpsUpdatedAt,
    signal:
      "OECD guidance anchors cross-border associated-enterprise pricing to the arm's length principle and helps tax administrations and businesses reduce disputes across jurisdictions.",
    scrimedApplication:
      "Prepare global expansion, partner, reseller, affiliate, and intercompany motions for qualified tax review before SCRIMED enters complex cross-border revenue structures."
  },
  {
    name: "SCRIMED Capital Vitality",
    sourceType: "internal-operating-source",
    url: "/capital-vitality",
    reviewedAt: enterpriseBusinessOpsUpdatedAt,
    signal:
      "SCRIMED already maps revenue capabilities, moat signals, investor milestones, funding workstreams, and external-review gates.",
    scrimedApplication:
      "Tie enterprise business operations to sellable revenue packages without turning readiness language into investor solicitation or audited financial claims."
  },
  {
    name: "SCRIMED Growth Engine",
    sourceType: "internal-operating-source",
    url: "/growth-engine",
    reviewedAt: enterpriseBusinessOpsUpdatedAt,
    signal:
      "SCRIMED already prioritizes buyer segments, sellable offers, conversion lanes, revenue proof steps, bottlenecks, and proof routes.",
    scrimedApplication:
      "Convert commercial execution into deal-desk controls, discount approval gates, and contract-ready handoffs."
  },
  {
    name: "SCRIMED Public Market Readiness",
    sourceType: "internal-operating-source",
    url: "/public-market-readiness",
    reviewedAt: enterpriseBusinessOpsUpdatedAt,
    signal:
      "SCRIMED already defines KPI, unit-economics, model-efficiency, customer proof, board, and finance-methodology readiness without claiming audited financial reporting.",
    scrimedApplication:
      "Feed enterprise margin controls, board packs, and finance methodology gates while preserving no-audit and no-securities boundaries."
  }
];

export const enterpriseRevenueCapabilities: EnterpriseRevenueCapability[] = [
  {
    slug: "enterprise-pricing-packaging",
    name: "Enterprise pricing and packaging architecture",
    status: "active-control-plane",
    buyer: "Health systems, payers, government health programs, and strategic platform partners",
    revenueMotion:
      "Package assessment, synthetic pilot, protected diligence room, implementation blueprint, and enterprise operating license as separate value steps.",
    marginContribution:
      "Improves price realization by preventing custom enterprise work from being bundled into low-margin pilots.",
    proofRoutes: ["/pricing", "/growth-engine", "/capital-vitality"],
    retainedGate: "Qualified commercial, legal, and finance review before external price commitments or buyer-specific discount promises.",
    nextAction:
      "Attach each opportunity to one approved package, price floor, deliverable boundary, and upgrade path before proposal release."
  },
  {
    slug: "deal-desk-quote-to-contract",
    name: "Deal desk and quote-to-contract control",
    status: "human-review-required",
    buyer: "Enterprise buying committees, procurement, security, legal, and finance stakeholders",
    revenueMotion:
      "Move qualified opportunities from sales discovery into counsel-reviewable order form, SOW, data boundary, and implementation assumptions.",
    marginContribution:
      "Reduces margin leakage from uncontrolled custom terms, scope creep, weak payment terms, and unapproved concessions.",
    proofRoutes: ["/sales-operations", "/pilot-deal-room", "/enterprise-business-ops"],
    retainedGate: "Human executive approval, qualified counsel review, finance review, and customer sign-off required before contract execution.",
    nextAction:
      "Create a quote-to-contract packet with package, scope, pricing, discount rationale, billing terms, data boundary, and approval trail."
  },
  {
    slug: "annual-prepay-and-multiyear",
    name: "Annual prepay and multi-year enterprise commitments",
    status: "qualified-review-required",
    buyer: "CFO, CIO, procurement, transformation sponsors, and budget owners",
    revenueMotion:
      "Use annual prepay and multi-year optionality for qualified enterprise pilots and operating licenses after scope and renewal gates are clear.",
    marginContribution:
      "Improves cash conversion, lowers collection risk, and creates implementation runway without claiming guaranteed savings.",
    proofRoutes: ["/capital-vitality", "/public-market-readiness", "/pricing"],
    retainedGate: "Finance, accounting, tax, and legal review before payment-term, revenue-recognition, or renewal language leaves SCRIMED.",
    nextAction:
      "Prepare payment term menu with finance-approved cash, recognition, refund, cancellation, and renewal assumptions."
  },
  {
    slug: "protected-diligence-monetization",
    name: "Protected buyer diligence monetization",
    status: "human-review-required",
    buyer: "Procurement, security reviewers, legal reviewers, investor diligence teams, and executive sponsors",
    revenueMotion:
      "Convert high-effort diligence, proof packets, security review, and evidence-room packaging into an explicit paid diligence or enterprise activation line item.",
    marginContribution:
      "Prevents expensive evidence packaging from becoming unpaid sales labor while reinforcing trust posture.",
    proofRoutes: ["/pilot-workspace/access", "/buyer-release-control-run", "/qa-buyer-proof-release"],
    retainedGate: "AAL2 protected workspace, release decisions, reviewer signoffs, and customer permission before buyer-specific external sharing.",
    nextAction:
      "Price buyer-diligence packaging separately when procurement, security, legal, or investor review requires custom packet work."
  },
  {
    slug: "implementation-services-margin",
    name: "Implementation services and blueprint attach",
    status: "active-control-plane",
    buyer: "Clinical operations, transformation, interoperability, and revenue-cycle leaders",
    revenueMotion:
      "Attach implementation blueprint, workflow design, governance design, and integration-readiness planning to pilots before production scope.",
    marginContribution:
      "Separates high-touch services from license economics and makes labor assumptions visible before commitments expand.",
    proofRoutes: ["/product", "/healthcare-intelligence-os", "/interoperability"],
    retainedGate: "SOW, staffing, deliverables, timeline, data boundary, and implementation acceptance criteria must be approved before delivery.",
    nextAction:
      "Template the implementation blueprint as a paid, capped-scope service with clear assumptions and change-order triggers."
  },
  {
    slug: "renewal-expansion-discipline",
    name: "Renewal and expansion discipline",
    status: "active-control-plane",
    buyer: "Customer sponsors, finance owners, operations leaders, and executive steering committees",
    revenueMotion:
      "Tie renewal and expansion to buyer-approved evidence, adopted workflows, governance completion, and implementation milestones.",
    marginContribution:
      "Improves net retention while avoiding unsupported ROI, reimbursement, or customer-revenue claims.",
    proofRoutes: ["/public-market-readiness", "/pilot-evidence", "/sales-operations"],
    retainedGate: "Buyer finance methodology, customer permission, and legal review before any external customer-value claim.",
    nextAction:
      "Create a renewal health packet with adoption, workflow volume, support load, model cost, reviewed value signals, and next expansion gate."
  },
  {
    slug: "channel-and-partner-economics",
    name: "Channel and partner economics",
    status: "qualified-review-required",
    buyer: "Health system networks, regional partners, services firms, sovereign programs, and marketplace channels",
    revenueMotion:
      "Model reseller, referral, integration, and implementation partner economics before SCRIMED enters margin-sharing agreements.",
    marginContribution:
      "Prevents channel discounts, partner delivery cost, tax complexity, and indemnity terms from eroding enterprise margins.",
    proofRoutes: ["/global-reach", "/deployment-profiles", "/enterprise-business-ops"],
    retainedGate: "Qualified counsel, finance, tax, privacy, security, and regional review before partner or reseller terms are represented externally.",
    nextAction:
      "Maintain a partner economics worksheet with referral fee, reseller margin, implementation owner, data role, liability, and tax-review state."
  },
  {
    slug: "usage-and-model-cost-alignment",
    name: "Usage-based value aligned to model cost",
    status: "active-control-plane",
    buyer: "Enterprise buyers with high workflow volume, review queues, and AI cost sensitivity",
    revenueMotion:
      "Tie high-volume packages to workflow count, reviewer volume, proof-packet output, and model-routing cost assumptions.",
    marginContribution:
      "Keeps AI unit cost, infrastructure, support, and reviewer labor aligned with price bands and overage policy.",
    proofRoutes: ["/public-market-readiness", "/service-reliability", "/workflows/results"],
    retainedGate: "Finance review of cost model, support tier, model-route assumptions, and overage language before proposal release.",
    nextAction:
      "Add unit-cost review to every high-volume proposal and require approval when projected gross margin falls below threshold."
  },
  {
    slug: "public-sector-enterprise-procurement",
    name: "Public-sector and sovereign procurement readiness",
    status: "qualified-review-required",
    buyer: "Government health systems, public payers, sovereign healthcare programs, and procurement authorities",
    revenueMotion:
      "Create readiness-only procurement packs for jurisdiction-specific buying paths, security questionnaires, data residency, and external approval gates.",
    marginContribution:
      "Prevents under-scoped public-sector pursuits from consuming enterprise resources without a realistic procurement and compliance path.",
    proofRoutes: ["/global-certification-readiness", "/global-reach", "/pilot-deal-room"],
    retainedGate: "Qualified public-sector procurement, regional legal, privacy, security, tax, and compliance review before pursuing binding commitments.",
    nextAction:
      "Score every public-sector opportunity against approval complexity, security burden, payment timing, implementation effort, and strategic value."
  }
];

export const enterpriseMarginControls: EnterpriseMarginControl[] = [
  {
    control: "Price floor and discount approval",
    owner: "Founder + CFO/FP&A + Deal Desk",
    status: "human-review-required",
    marginRisk: "Enterprise urgency can create unmanaged discounts, free diligence work, and low-margin custom scope.",
    operatingPolicy:
      "Every proposal must show list price, discount, approval reason, gross-margin estimate, and expiration date.",
    evidenceRoutes: ["/pricing", "/sales-operations", "/enterprise-business-ops"],
    blockedUntilReviewed: ["discount below floor", "free paid-diligence package", "unapproved multi-year concession"]
  },
  {
    control: "Revenue-recognition review gate",
    owner: "Controller + Revenue Accounting Lead",
    status: "qualified-review-required",
    marginRisk: "Bundled services, cancellation rights, success fees, refunds, or variable pricing can create accounting and reporting risk.",
    operatingPolicy:
      "Contract terms that affect timing, deliverables, performance obligations, variable consideration, or refunds require accounting review.",
    evidenceRoutes: ["/public-market-readiness", "/enterprise-business-ops"],
    blockedUntilReviewed: ["audited revenue claim", "recognized revenue guidance", "financial statement treatment claim"]
  },
  {
    control: "Implementation labor and scope control",
    owner: "Implementation Lead + Finance",
    status: "active-control-plane",
    marginRisk: "Unbounded implementation work can turn high-value pilots into services-heavy margin drains.",
    operatingPolicy:
      "Each implementation package needs capped hours, change-order triggers, named deliverables, and staffing assumptions.",
    evidenceRoutes: ["/product", "/growth-engine", "/interoperability"],
    blockedUntilReviewed: ["uncapped implementation promise", "unpriced integration work", "live connector timeline guarantee"]
  },
  {
    control: "AI and cloud unit-cost routing",
    owner: "Product Engineering + FP&A",
    status: "active-control-plane",
    marginRisk: "Model routing, retries, large-context workflows, and proof-packet generation can silently compress margins.",
    operatingPolicy:
      "High-volume workflows must include model-route assumptions, usage guardrails, cached evidence reuse, and cost-per-workflow review.",
    evidenceRoutes: ["/public-market-readiness", "/service-reliability", "/continuous-review-audit"],
    blockedUntilReviewed: ["unbounded model usage", "free high-volume pilot", "cost target represented as guarantee"]
  },
  {
    control: "Support tier and success coverage",
    owner: "Customer Success + Finance",
    status: "active-control-plane",
    marginRisk: "Premium customer expectations can create unfunded white-glove support obligations.",
    operatingPolicy:
      "Support coverage, response windows, executive reporting, and escalation channels must map to paid tier and staffing model.",
    evidenceRoutes: ["/sales-operations", "/trust-safety-operations", "/service-reliability"],
    blockedUntilReviewed: ["24/7 managed support claim", "unpriced executive reporting", "unapproved SLA commitment"]
  },
  {
    control: "Billing, collections, and cash conversion",
    owner: "Billing/AR Owner + CFO",
    status: "human-review-required",
    marginRisk: "Weak payment terms, delayed invoicing, or uncollected receivables can make profitable contracts cash-negative.",
    operatingPolicy:
      "Contract packet must include invoice schedule, payment term, late-payment path, purchase-order requirements, and collections owner.",
    evidenceRoutes: ["/enterprise-business-ops", "/sales-operations"],
    blockedUntilReviewed: ["start work without billing trigger", "non-standard payment term", "customer procurement blocker ignored"]
  },
  {
    control: "Vendor and subprocessor spend approval",
    owner: "Procurement + Security + Finance",
    status: "qualified-review-required",
    marginRisk: "Enterprise buyer requirements can create unmanaged vendor, audit, storage, security, or regional hosting costs.",
    operatingPolicy:
      "New vendors, subprocessors, hosting regions, and evidence-vault costs require security, privacy, finance, and legal review.",
    evidenceRoutes: ["/deployment-profiles", "/trust-center", "/enterprise-business-ops"],
    blockedUntilReviewed: ["new subprocessor commitment", "unpriced dedicated environment", "unsupported data-residency claim"]
  },
  {
    control: "Legal template and indemnity guardrails",
    owner: "General Counsel / Outside Counsel",
    status: "qualified-review-required",
    marginRisk: "Uncapped liability, unsupported warranties, IP terms, or data obligations can overwhelm contract value.",
    operatingPolicy:
      "Non-standard liability, warranty, indemnity, IP, privacy, regulated-use, and publicity terms require qualified counsel review.",
    evidenceRoutes: ["/approvals-readiness", "/global-certification-readiness", "/enterprise-business-ops"],
    blockedUntilReviewed: ["uncapped liability", "unsupported compliance warranty", "customer-publicity claim"]
  },
  {
    control: "Tax nexus and transfer pricing triage",
    owner: "Tax Advisor + CFO",
    status: "qualified-review-required",
    marginRisk: "Cross-border enterprise, reseller, affiliate, and sovereign deals can create tax exposure and profit allocation complexity.",
    operatingPolicy:
      "Global revenue structures require qualified tax review for nexus, withholding, VAT/GST, transfer pricing, and local filing implications.",
    evidenceRoutes: ["/global-reach", "/global-certification-readiness", "/enterprise-business-ops"],
    blockedUntilReviewed: ["tax advice claim", "cross-border reseller margin", "intercompany pricing commitment"]
  },
  {
    control: "Board, investor, and fundraising material review",
    owner: "Founder + CFO + Securities Counsel",
    status: "qualified-review-required",
    marginRisk: "Revenue, margin, customer, market, and valuation language can create securities, investor, or audit risk.",
    operatingPolicy:
      "Investor materials must stay counsel-reviewed, source-backed, and clearly separated from audited financial reporting or securities offering claims.",
    evidenceRoutes: ["/capital-vitality", "/public-market-readiness", "/enterprise-business-ops"],
    blockedUntilReviewed: ["securities offering material", "valuation assurance", "audited financial statement claim"]
  }
];

export const enterpriseTeamRoles: EnterpriseTeamRole[] = [
  {
    role: "General Counsel / Outside Counsel",
    team: "legal",
    status: "qualified-review-required",
    responsibility: "Own contract authority, legal risk routing, claim review, dispute posture, and privileged escalation.",
    approvalAuthority: "Can recommend or approve legal language only within qualified engagement scope.",
    escalationTrigger: "Non-standard legal term, regulated-use claim, customer dispute, public claim, or investor/fundraising material."
  },
  {
    role: "Commercial Contracts Counsel",
    team: "legal",
    status: "qualified-review-required",
    responsibility: "Review order forms, SOWs, MSAs, DPAs, BAAs, partner agreements, and procurement terms.",
    approvalAuthority: "Qualified counsel review required before contract execution or legal term representation.",
    escalationTrigger: "Liability, warranty, indemnity, data-use, IP, publicity, payment, termination, or regulated workflow term."
  },
  {
    role: "Privacy and Security Counsel",
    team: "legal",
    status: "qualified-review-required",
    responsibility: "Review HIPAA/BAA, DPA, cross-border data transfer, subprocessor, evidence-room, and security questionnaire language.",
    approvalAuthority: "Can approve privacy/security legal posture only within qualified review scope.",
    escalationTrigger: "PHI/ePHI, personal data, data residency, subprocessor, incident, breach, or security warranty request."
  },
  {
    role: "Corporate and Securities Counsel",
    team: "legal",
    status: "qualified-review-required",
    responsibility: "Review fundraising, investor, board, equity, governance, corporate authority, and securities-sensitive materials.",
    approvalAuthority: "Required for securities, investment, valuation, financing, or corporate-governance claims.",
    escalationTrigger: "Investor deck, financing discussion, valuation language, shareholder material, or public market narrative."
  },
  {
    role: "CFO / Finance Lead",
    team: "finance",
    status: "human-review-required",
    responsibility: "Own pricing floors, margin model, cash plan, board finance pack, vendor spend, billing posture, and financial controls.",
    approvalAuthority: "Approves business economics but does not issue audited financial statements or tax/accounting advice alone.",
    escalationTrigger: "Discount below floor, gross-margin risk, cash exposure, vendor spend, financing, or board-level financial metric."
  },
  {
    role: "Controller",
    team: "accounting",
    status: "qualified-review-required",
    responsibility: "Own close process, chart of accounts, revenue recognition review, billing reconciliation, and audit evidence discipline.",
    approvalAuthority: "Controls accounting process but audited opinions require qualified external auditor where applicable.",
    escalationTrigger: "Revenue treatment, deferred revenue, refund/cancellation term, close exception, audit evidence gap, or financial report."
  },
  {
    role: "Revenue Accounting Lead",
    team: "accounting",
    status: "qualified-review-required",
    responsibility: "Review contract deliverables, performance obligations, variable consideration, credits, refunds, and recognition timing.",
    approvalAuthority: "Accounting review required before SCRIMED presents revenue treatment or financial reporting posture externally.",
    escalationTrigger: "Bundled deliverables, success fees, usage tiers, refund rights, non-standard acceptance, or multi-year contract."
  },
  {
    role: "FP&A and Margin Analyst",
    team: "finance",
    status: "active-control-plane",
    responsibility: "Maintain offer-level margin model, unit-cost assumptions, implementation labor allocation, and scenario analysis.",
    approvalAuthority: "Recommends margin thresholds and exceptions for CFO/executive approval.",
    escalationTrigger: "Projected margin below floor, model cost spike, support burden, unpriced service work, or high-volume buyer proposal."
  },
  {
    role: "Tax Advisor",
    team: "tax",
    status: "qualified-review-required",
    responsibility: "Review sales tax, VAT/GST, withholding, nexus, transfer pricing, entity, and cross-border revenue implications.",
    approvalAuthority: "Qualified tax review required before tax treatment, cross-border structure, or intercompany pricing is represented.",
    escalationTrigger: "New country, reseller/channel agreement, sovereign buyer, affiliate/intercompany motion, or marketplace payout."
  },
  {
    role: "Deal Desk and Revenue Operations",
    team: "revenue-operations",
    status: "human-review-required",
    responsibility: "Coordinate quote-to-contract packets, approvals, scope, pricing, discount evidence, billing triggers, and CRM hygiene.",
    approvalAuthority: "Can route and validate process completion but cannot approve legal/accounting/tax exceptions independently.",
    escalationTrigger: "Missing approver, stale quote, unapproved discount, customer procurement blocker, or unsupported sales claim."
  },
  {
    role: "Billing and Accounts Receivable Owner",
    team: "finance",
    status: "human-review-required",
    responsibility: "Own invoice schedule, purchase-order readiness, collection workflow, payment status, and cash exception reporting.",
    approvalAuthority: "Can enforce billing controls and escalate non-payment; cannot alter contract economics without approval.",
    escalationTrigger: "Late payment, missing PO, invoice dispute, payment-term exception, or work starting before billing trigger."
  }
];

export const enterpriseBusinessControls: EnterpriseBusinessControl[] = [
  {
    control: "Quote-to-contract approval packet",
    purpose: "Tie package, price, discount, SOW, payment terms, data boundary, implementation scope, and approvals together.",
    owner: "Deal Desk + CFO + Counsel",
    evidence: ["approved quote", "SOW", "discount approval", "data-boundary memo", "billing schedule"],
    hardStops: ["missing counsel review", "missing finance approval", "unapproved non-standard term"]
  },
  {
    control: "Revenue-recognition intake",
    purpose: "Route contract features that affect recognition or reporting to qualified accounting review.",
    owner: "Controller + Revenue Accounting Lead",
    evidence: ["contract checklist", "deliverable map", "payment terms", "acceptance criteria", "review signoff"],
    hardStops: ["audited revenue claim", "accounting treatment represented without review", "unclear performance obligation"]
  },
  {
    control: "Discount and concession approval",
    purpose: "Prevent uncontrolled discounting, extended trials, free diligence work, and unfunded success coverage.",
    owner: "CFO + Founder",
    evidence: ["list price", "discount rationale", "margin estimate", "expiration", "approval record"],
    hardStops: ["below-floor discount", "unpriced custom work", "open-ended concession"]
  },
  {
    control: "Payment and collections control",
    purpose: "Keep profitable contracts from becoming cash-negative because billing triggers or collections paths are missing.",
    owner: "Billing/AR Owner + CFO",
    evidence: ["invoice schedule", "PO requirement", "payment term", "collections owner", "exception log"],
    hardStops: ["work begins before billing trigger", "missing invoice owner", "unapproved payment term"]
  },
  {
    control: "Vendor and subprocessor spend approval",
    purpose: "Prevent enterprise-specific vendor, storage, audit, hosting, and security obligations from eroding margin.",
    owner: "Procurement + Security + Finance",
    evidence: ["vendor review", "subprocessor review", "spend approval", "security review", "data-boundary impact"],
    hardStops: ["new subprocessor without review", "dedicated environment without pricing", "unsupported data-residency commitment"]
  },
  {
    control: "Customer diligence and legal artifact workflow",
    purpose: "Route security, procurement, legal, and compliance artifacts through metadata-only protected evidence paths.",
    owner: "Buyer Diligence + Legal Ops",
    evidence: ["artifact owner", "review status", "expiration", "release decision", "recipient controls"],
    hardStops: ["sensitive artifact stored publicly", "expired artifact represented as current", "external sharing without release decision"]
  },
  {
    control: "Board and investor material review",
    purpose: "Separate operating metrics from securities material, valuation assurance, audited financial reporting, and investment advice.",
    owner: "Founder + CFO + Securities Counsel",
    evidence: ["source-backed metric", "boundary language", "counsel review", "version log", "recipient context"],
    hardStops: ["securities claim without counsel", "audited metric claim without audit", "valuation assurance claim"]
  },
  {
    control: "Audit evidence retention and legal hold routing",
    purpose: "Preserve business decisions, approvals, evidence packets, and exceptions for qualified audit, legal, or diligence review.",
    owner: "Controller + Legal Ops + TrustOps",
    evidence: ["approval trail", "packet hash", "retention label", "legal-hold flag", "owner attestation"],
    hardStops: ["delete relevant evidence under hold", "untracked approval exception", "missing packet owner"]
  },
  {
    control: "Tax nexus and transfer pricing triage",
    purpose: "Make global revenue, reseller, affiliate, and sovereign motions visible to qualified tax advisors before commitments expand.",
    owner: "Tax Advisor + CFO",
    evidence: ["jurisdiction checklist", "buyer location", "partner economics", "VAT/GST flag", "transfer-pricing review"],
    hardStops: ["tax advice without advisor", "cross-border reseller commitment", "intercompany price represented externally"]
  },
  {
    control: "Enterprise claims and authority guard",
    purpose: "Keep sales, investor, legal, accounting, tax, revenue, margin, certification, and customer-proof claims inside retained evidence.",
    owner: "Claim Guard + Legal + Finance",
    evidence: ["claim classification", "source", "owner", "review status", "blocked claim list"],
    hardStops: ["guaranteed profit margin", "legal approval without counsel", "audited financial statements claim"]
  }
];

export const enterpriseOperatingCadences: EnterpriseOperatingCadence[] = [
  {
    cadence: "Weekly deal desk",
    owner: "Founder + Revenue Ops + Counsel + Finance",
    reviewedSignals: ["qualified opportunities", "discount requests", "scope exceptions", "legal blockers", "payment terms"],
    decisionOutput: "Approve, revise, hold, or disqualify enterprise proposal before buyer release.",
    retainedBoundary: "Deal desk review is not contract execution or legal approval without qualified counsel."
  },
  {
    cadence: "Weekly pipeline and margin review",
    owner: "Founder + CFO/FP&A",
    reviewedSignals: ["pipeline stage", "expected package", "unit economics", "support burden", "implementation hours"],
    decisionOutput: "Prioritized account list with price floor, margin threshold, and next approved action.",
    retainedBoundary: "Forecast review is internal operating planning, not revenue assurance."
  },
  {
    cadence: "Daily billing and collections exception sweep",
    owner: "Billing/AR Owner",
    reviewedSignals: ["missing PO", "invoice due", "late payment", "billing trigger", "contract start date"],
    decisionOutput: "Exception queue with owner, customer action, and work-start or hold status.",
    retainedBoundary: "Collections workflow does not alter contract terms without approved amendment."
  },
  {
    cadence: "Monthly close readiness",
    owner: "Controller + CFO",
    reviewedSignals: ["invoices", "deferred revenue", "expenses", "vendor accruals", "contract changes", "metric evidence"],
    decisionOutput: "Close checklist, unresolved exceptions, and external accountant review packet where needed.",
    retainedBoundary: "Close readiness is not audited financial reporting."
  },
  {
    cadence: "Monthly gross-margin review",
    owner: "FP&A + Product Engineering + Customer Success",
    reviewedSignals: ["cost per workflow", "model spend", "cloud spend", "support load", "implementation hours", "price realization"],
    decisionOutput: "Offer-level margin actions, routing changes, support tier changes, and pricing update candidates.",
    retainedBoundary: "Margin review guides decisions but does not guarantee customer margin or company profit."
  },
  {
    cadence: "Quarterly board and finance pack",
    owner: "Founder + CFO + Controller",
    reviewedSignals: ["pipeline", "cash", "gross margin", "unit economics", "risk register", "customer proof", "blocked claims"],
    decisionOutput: "Board-ready operating pack with counsel/accounting boundaries attached.",
    retainedBoundary: "Board pack is not securities offering material unless separately prepared and approved."
  },
  {
    cadence: "Quarterly legal and compliance review",
    owner: "General Counsel / Outside Counsel + TrustOps",
    reviewedSignals: ["contract exceptions", "claims", "incidents", "privacy/security issues", "approvals", "regional expansion"],
    decisionOutput: "Updated legal risk register, claim constraints, contract template changes, and escalation tasks.",
    retainedBoundary: "Internal review does not replace jurisdiction-specific legal advice."
  },
  {
    cadence: "Annual tax, audit, and assurance readiness",
    owner: "CFO + Controller + Tax Advisor + External Accountant/Auditor",
    reviewedSignals: ["revenue contracts", "entity structure", "cross-border activity", "vendor spend", "SOC readiness", "audit evidence"],
    decisionOutput: "Advisor-reviewed annual readiness plan for tax, accounting, audit, and assurance priorities.",
    retainedBoundary: "Readiness plan is not tax advice, audited financial statements, or SOC certification."
  }
];

export const enterpriseProfitLevers: EnterpriseProfitLever[] = [
  {
    lever: "Package entry work as paid assessment",
    useCase: "Discovery, workflow mapping, governance audit, and buyer readiness before synthetic pilot.",
    marginPath: "Turns early enterprise effort into paid, bounded scope instead of unpaid selling labor.",
    requiredControl: "Assessment SOW, price floor, scope cap, and no-PHI boundary.",
    blockedClaim: "guaranteed conversion to enterprise license"
  },
  {
    lever: "Annual prepay incentive",
    useCase: "Qualified enterprise licenses and protected-pilot extensions with stable scope.",
    marginPath: "Improves cash flow and reduces collection friction without promising financial outcomes.",
    requiredControl: "Finance, accounting, tax, and legal review of payment terms.",
    blockedClaim: "cash-flow or revenue recognition advice"
  },
  {
    lever: "Multi-year renewal architecture",
    useCase: "Large buyers needing budget certainty and staged workflow expansion.",
    marginPath: "Improves retention visibility while keeping implementation milestones explicit.",
    requiredControl: "Renewal terms, cancellation language, scope changes, and acceptance criteria reviewed.",
    blockedClaim: "guaranteed renewal"
  },
  {
    lever: "Paid protected diligence room",
    useCase: "Security, procurement, legal, investor, and executive diligence requiring custom proof packets.",
    marginPath: "Monetizes high-effort trust work and reduces unfunded sales engineering burden.",
    requiredControl: "Release decision, recipient controls, AAL2 workspace, and customer permission.",
    blockedClaim: "public release approved"
  },
  {
    lever: "Implementation templates and change orders",
    useCase: "Workflow blueprint, governance design, interoperability planning, and deployment readiness.",
    marginPath: "Controls labor cost and moves scope expansion into approved paid work.",
    requiredControl: "SOW, assumptions, capped hours, and change-order triggers.",
    blockedClaim: "unlimited implementation included"
  },
  {
    lever: "Margin-aware model routing",
    useCase: "High-volume workflow packets, document intelligence, and evidence generation.",
    marginPath: "Reduces AI unit cost through model selection, caching, prompt discipline, and usage thresholds.",
    requiredControl: "Cost-per-workflow review and finance-approved usage bands.",
    blockedClaim: "fixed cost savings guarantee"
  },
  {
    lever: "Support tiering",
    useCase: "Executive reporting, response windows, incident escalation, and premium customer success coverage.",
    marginPath: "Aligns support obligations with paid tier instead of absorbing enterprise expectations for free.",
    requiredControl: "Support policy, escalation matrix, staffing assumptions, and SLA review.",
    blockedClaim: "managed 24/7 SOC/MDR or clinical support coverage"
  },
  {
    lever: "Usage overage and volume bands",
    useCase: "Buyers with variable workflow volume, proof-packet generation, and reviewer activity.",
    marginPath: "Protects gross margin when usage exceeds original assumptions.",
    requiredControl: "Usage measurement, billing logic, customer notice, and legal/accounting review.",
    blockedClaim: "unlimited usage at fixed pilot price"
  },
  {
    lever: "Channel economics guardrails",
    useCase: "Referral, reseller, implementation partner, and marketplace routes.",
    marginPath: "Keeps partner margin, liability, support, taxes, and delivery ownership visible.",
    requiredControl: "Partner agreement, tax review, discount cap, and delivery responsibility map.",
    blockedClaim: "partner-authorized compliance or government endorsement"
  },
  {
    lever: "Collections-first activation",
    useCase: "Enterprise work that depends on PO, invoice, onboarding, or procurement acceptance.",
    marginPath: "Prevents SCRIMED from starting expensive work before payment path and contract authority are clear.",
    requiredControl: "Billing trigger, PO status, invoice owner, and executive exception approval.",
    blockedClaim: "work started equals contract approved"
  }
];

export const enterpriseBlockedClaims = [
  "guaranteed profit margin",
  "guaranteed revenue",
  "audited financial statements",
  "accounting advice",
  "tax advice",
  "legal approval without counsel",
  "contract approved without executive signature",
  "securities offering material",
  "investment advice",
  "valuation assurance",
  "SOC certified",
  "customer value guaranteed",
  "reimbursement guaranteed",
  "PHI processing authorized",
  "production connector approved",
  "live clinical care authorized"
];

function unique(values: string[]) {
  return Array.from(new Set(values));
}

export function getEnterpriseBusinessOpsSummary() {
  const capitalVitalitySummary = getCapitalVitalitySummary();
  const growthEngineSummary = getGrowthEngineSummary();
  const publicMarketReadinessSummary = getPublicMarketReadinessSummary();
  const allProofRoutes = unique([
    ...enterpriseRevenueCapabilities.flatMap((capability) => capability.proofRoutes),
    ...enterpriseMarginControls.flatMap((control) => control.evidenceRoutes),
    ...enterpriseBusinessSources.map((source) => source.url).filter((url) => url.startsWith("/"))
  ]);

  return {
    service: "scrimed-enterprise-business-operations",
    route: enterpriseBusinessOpsRoute,
    apiRoute: enterpriseBusinessOpsApiRoute,
    briefRoute: enterpriseBusinessOpsBriefRoute,
    status: enterpriseBusinessOpsStatus,
    briefStatus: enterpriseBusinessOpsBriefStatus,
    boundary: enterpriseBusinessOpsBoundary,
    sourceCount: enterpriseBusinessSources.length,
    officialSourceCount: enterpriseBusinessSources.filter((source) =>
      source.sourceType.startsWith("official")
    ).length,
    revenueCapabilityCount: enterpriseRevenueCapabilities.length,
    humanReviewRevenueCapabilityCount: enterpriseRevenueCapabilities.filter(
      (capability) => capability.status === "human-review-required"
    ).length,
    qualifiedReviewRevenueCapabilityCount: enterpriseRevenueCapabilities.filter(
      (capability) => capability.status === "qualified-review-required"
    ).length,
    marginControlCount: enterpriseMarginControls.length,
    qualifiedReviewMarginControlCount: enterpriseMarginControls.filter(
      (control) => control.status === "qualified-review-required"
    ).length,
    teamRoleCount: enterpriseTeamRoles.length,
    legalRoleCount: enterpriseTeamRoles.filter((role) => role.team === "legal").length,
    financeAccountingTaxRoleCount: enterpriseTeamRoles.filter((role) =>
      ["finance", "accounting", "tax"].includes(role.team)
    ).length,
    enterpriseControlCount: enterpriseBusinessControls.length,
    operatingCadenceCount: enterpriseOperatingCadences.length,
    profitLeverCount: enterpriseProfitLevers.length,
    blockedClaimCount: enterpriseBlockedClaims.length,
    proofRouteCount: allProofRoutes.length,
    allProofRoutes,
    sourceCounts: {
      capitalRevenueCapabilityCount: capitalVitalitySummary.revenueCapabilityCount,
      growthEnginePlayCount: growthEngineSummary.growthPlayCount,
      growthEngineConversionLaneCount: growthEngineSummary.conversionLaneCount,
      publicMarketMetricCount: publicMarketReadinessSummary.metricCount,
      publicMarketUnitEconomicsPackageCount:
        publicMarketReadinessSummary.unitEconomicsPackageCount,
      publicMarketCustomerProofStageCount:
        publicMarketReadinessSummary.customerProofStageCount
    },
    authority: {
      legalAuthority: "qualified-counsel-review-required",
      accountingAuthority: "qualified-accounting-review-required",
      taxAuthority: "qualified-tax-review-required",
      financialAuthority: "not-audited-financial-report",
      revenueAuthority: "not-revenue-guarantee",
      profitAuthority: "not-profit-margin-guarantee",
      securitiesAuthority: "not-securities-offering-material",
      investmentAdvice: "not-investment-advice",
      valuationAuthority: "not-valuation-assurance",
      contractAuthority: "human-executive-approval-required",
      dataBoundary: "business-and-metadata-only",
      phiAuthority: "not-authorized-production-phi",
      clinicalCareAuthority: "not-authorized-live-care",
      certificationAuthority: "not-certification"
    },
    nextBusinessMove:
      "Run every enterprise opportunity through Deal Desk, price-floor review, scope control, counsel review, accounting/revenue-recognition triage, tax awareness, billing readiness, and margin review before proposal release; keep all legal, accounting, tax, revenue, profit, securities, valuation, customer-value, reimbursement, PHI, connector, certification, and live-care claims blocked until the qualified authority exists.",
    sources: enterpriseBusinessSources,
    revenueCapabilities: enterpriseRevenueCapabilities,
    marginControls: enterpriseMarginControls,
    teamRoles: enterpriseTeamRoles,
    enterpriseControls: enterpriseBusinessControls,
    operatingCadences: enterpriseOperatingCadences,
    profitLevers: enterpriseProfitLevers,
    blockedClaims: enterpriseBlockedClaims,
    capitalVitalitySummary,
    growthEngineSummary,
    publicMarketReadinessSummary,
    updated: enterpriseBusinessOpsUpdatedAt
  };
}

export function buildEnterpriseBusinessOpsBrief() {
  const summary = getEnterpriseBusinessOpsSummary();

  return [
    "# SCRIMED Enterprise Business Operations Brief",
    "",
    `Status: ${summary.status}`,
    `Sources: ${summary.sourceCount}`,
    `Official sources: ${summary.officialSourceCount}`,
    `Revenue capabilities: ${summary.revenueCapabilityCount}`,
    `Margin controls: ${summary.marginControlCount}`,
    `Team roles: ${summary.teamRoleCount}`,
    `Enterprise controls: ${summary.enterpriseControlCount}`,
    `Operating cadences: ${summary.operatingCadenceCount}`,
    `Profit levers: ${summary.profitLeverCount}`,
    `Blocked claims: ${summary.blockedClaimCount}`,
    `Legal authority: ${summary.authority.legalAuthority}`,
    `Accounting authority: ${summary.authority.accountingAuthority}`,
    `Tax authority: ${summary.authority.taxAuthority}`,
    `Financial authority: ${summary.authority.financialAuthority}`,
    `Revenue authority: ${summary.authority.revenueAuthority}`,
    `Profit authority: ${summary.authority.profitAuthority}`,
    `Contract authority: ${summary.authority.contractAuthority}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is not legal, accounting, tax, investment, securities, valuation, revenue, or profit-margin advice. It is not audited financial reporting, contract approval, customer permission, reimbursement assurance, certification, PHI processing authority, production connector approval, or live clinical care authorization.",
    "",
    "## Sources",
    ...summary.sources.map(
      (source) => `- ${source.name} (${source.sourceType}) -> ${source.url}: ${source.scrimedApplication}`
    ),
    "",
    "## Revenue Capabilities",
    ...summary.revenueCapabilities.map(
      (capability) =>
        `- ${capability.name} (${capability.status}): ${capability.revenueMotion} Margin: ${capability.marginContribution} Gate: ${capability.retainedGate} Next: ${capability.nextAction}`
    ),
    "",
    "## Margin Controls",
    ...summary.marginControls.map(
      (control) =>
        `- ${control.control} (${control.status}): ${control.operatingPolicy} Owner: ${control.owner}. Hard stops: ${control.blockedUntilReviewed.join(", ")}`
    ),
    "",
    "## Legal, Finance, Accounting, Tax, and Revenue Ops Roles",
    ...summary.teamRoles.map(
      (role) =>
        `- ${role.role} (${role.team}/${role.status}): ${role.responsibility} Escalate on: ${role.escalationTrigger}`
    ),
    "",
    "## Enterprise Controls",
    ...summary.enterpriseControls.map(
      (control) =>
        `- ${control.control}: ${control.purpose} Owner: ${control.owner}. Hard stops: ${control.hardStops.join(", ")}`
    ),
    "",
    "## Operating Cadence",
    ...summary.operatingCadences.map(
      (cadence) =>
        `- ${cadence.cadence}: ${cadence.decisionOutput} Owner: ${cadence.owner}. Boundary: ${cadence.retainedBoundary}`
    ),
    "",
    "## Profit Levers",
    ...summary.profitLevers.map(
      (lever) =>
        `- ${lever.lever}: ${lever.marginPath} Control: ${lever.requiredControl}. Blocked claim: ${lever.blockedClaim}`
    ),
    "",
    "## Blocked Claims",
    ...summary.blockedClaims.map((claim) => `- ${claim}`),
    "",
    "## Next Business Move",
    summary.nextBusinessMove
  ].join("\n");
}
