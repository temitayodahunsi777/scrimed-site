export type GlobalRegionPriority = "launch" | "strategic" | "watch";

export type GlobalRegionFocus = {
  slug: string;
  region: string;
  priority: GlobalRegionPriority;
  buyerFit: string;
  deploymentThesis: string;
  compliancePosture: string;
  procurementFocus: string[];
  languageAndCulture: string[];
  partnerMotion: string;
  proofRoutes: string[];
  retainedGates: string[];
};

export type GlobalBuyerAudienceKey =
  | "provider-health-system"
  | "payer-plan"
  | "government-public-health"
  | "life-sciences-research"
  | "employer-benefits"
  | "global-channel-partner"
  | "investor-board-review";

export type GlobalBuyerLocalizationPack = {
  key: GlobalBuyerAudienceKey;
  audience: string;
  priority: "primary" | "strategic" | "secondary";
  buyingCommittee: string[];
  trigger: string;
  localizedMessage: string;
  recommendedOffer: string;
  entryRoute: string;
  proofRoutes: string[];
  procurementQuestions: string[];
  disqualifiers: string[];
  competitiveEdge: string;
  safeConversionPath: string;
};

export type GlobalPartnerChannel = {
  name: string;
  status: "ready-for-controlled-outreach" | "qualification-required";
  partnerType: string;
  idealPartner: string;
  valueExchange: string;
  activationPath: string;
  proofRoutes: string[];
  blockedClaims: string[];
};

export type GlobalBoundaryResolution = {
  boundary: string;
  impact: string;
  resolution: string;
  retainedGate: string;
  owner: string;
  status: "contained-with-workaround" | "external-approval-required";
};

export type GlobalCompetitiveEdge = {
  pillar: string;
  buyerSignal: string;
  scrimedAdvantage: string;
  proofRoute: string;
  blockedClaim: string;
};

export type GlobalActivationStep = {
  step: string;
  objective: string;
  exitCriteria: string;
  evidence: string[];
};

export const globalPartnerLocalizationStatus =
  "global-partner-localization-layer-ready";

export const globalPartnerLocalizationBriefStatus =
  "global-partner-localization-brief-ready-no-legal-advice";

export const globalPartnerLocalizationBoundary =
  "SCRIMED Global Reach organizes region, buyer, partner, procurement, deployment, and localization readiness for governed synthetic pilots and enterprise evaluations. It is not legal advice, privacy advice, tax advice, regional regulatory approval, public-sector procurement approval, reimbursement assurance, compliance certification, clinical validation, production authorization, or live clinical execution authority.";

export const globalRegionFocuses: GlobalRegionFocus[] = [
  {
    slug: "united-states",
    region: "United States",
    priority: "launch",
    buyerFit:
      "Provider systems, payers, employers, revenue-cycle leaders, clinical operations teams, and healthcare AI governance buyers.",
    deploymentThesis:
      "Start with synthetic workflow intelligence assessments and protected enterprise pilots before PHI, payer, or EHR integration.",
    compliancePosture:
      "HIPAA-ready architecture posture, BAA/DPA review path, role controls, audit logging, and no-PHI public intake.",
    procurementFocus: [
      "vendor risk",
      "security questionnaire",
      "privacy and BAA path",
      "workflow ROI methodology",
      "integration-readiness evidence"
    ],
    languageAndCulture: [
      "English-first enterprise buyer materials",
      "clinician-safe, non-diagnostic messaging",
      "clear separation of vision, pilots, and production authority"
    ],
    partnerMotion:
      "Direct enterprise sales supported by advisors, implementation partners, provider champions, and payer innovation teams.",
    proofRoutes: ["/product", "/pilot-deal-room", "/public-market-readiness", "/trust-center"],
    retainedGates: [
      "signed enterprise scope",
      "BAA/DPA where applicable",
      "security review",
      "clinical governance review",
      "production connector approval"
    ]
  },
  {
    slug: "united-arab-emirates",
    region: "UAE",
    priority: "strategic",
    buyerFit:
      "Government health programs, premium provider networks, innovation authorities, and enterprise healthcare groups.",
    deploymentThesis:
      "Position SCRIMED Atlas as a sovereign-ready healthcare intelligence operating layer evaluated through synthetic evidence.",
    compliancePosture:
      "Jurisdiction-specific privacy, hosting, procurement, and cross-border transfer review required before production data movement.",
    procurementFocus: [
      "sovereign deployment profile",
      "public-sector diligence",
      "regional hosting model",
      "Arabic-localized executive pack",
      "partner implementation path"
    ],
    languageAndCulture: [
      "Arabic and English executive materials",
      "public-sector transformation framing",
      "regional governance and data-residency sensitivity"
    ],
    partnerMotion:
      "Strategic partnership and government-facing channel qualification before public claims or national-program positioning.",
    proofRoutes: ["/deployment-profiles", "/global-reach", "/governance-packs", "/trust-center"],
    retainedGates: [
      "regional counsel review",
      "hosting and residency approval",
      "public-sector procurement process",
      "qualified local implementation partner",
      "translation and claims review"
    ]
  },
  {
    slug: "saudi-arabia",
    region: "Saudi Arabia",
    priority: "strategic",
    buyerFit:
      "National transformation programs, hospital networks, payers, and healthcare infrastructure partners.",
    deploymentThesis:
      "Lead with strategic platform partnership, workforce efficiency, governance, and sovereign deployment readiness.",
    compliancePosture:
      "Regional legal, privacy, cybersecurity, data-residency, and government procurement review required before production commitments.",
    procurementFocus: [
      "strategic platform partnership",
      "sovereign/private-cloud readiness",
      "national-scale governance",
      "Arabic-localized buyer narrative",
      "enterprise proof packet"
    ],
    languageAndCulture: [
      "Arabic and English materials",
      "mission-scale healthcare transformation language",
      "careful public claims and approval language"
    ],
    partnerMotion:
      "Executive partnership route through qualified regional advisors, implementation partners, and public-sector relationship holders.",
    proofRoutes: ["/global-reach", "/deployment-profiles", "/healthcare-intelligence-os", "/trust-safety-operations"],
    retainedGates: [
      "regional counsel review",
      "government procurement authority",
      "data-residency approval",
      "cybersecurity review",
      "partner authority validation"
    ]
  },
  {
    slug: "kuwait",
    region: "Kuwait",
    priority: "strategic",
    buyerFit:
      "Provider groups, government health stakeholders, payers, and specialty care networks.",
    deploymentThesis:
      "Use a controlled synthetic evaluation to prove workflow intelligence before local hosting or production integration decisions.",
    compliancePosture:
      "Jurisdiction-specific privacy, procurement, hosting, and clinical-governance review required.",
    procurementFocus: [
      "executive readiness brief",
      "localized procurement pack",
      "private deployment profile",
      "security and privacy posture",
      "human-review operating model"
    ],
    languageAndCulture: [
      "Arabic and English executive materials",
      "health-system operations language",
      "clear no-live-care boundary"
    ],
    partnerMotion:
      "Qualified local partner discovery with controlled outreach and no public customer or government approval claims.",
    proofRoutes: ["/global-reach", "/pilot-evidence", "/trust-center", "/pricing"],
    retainedGates: [
      "qualified local partner",
      "regional counsel review",
      "buyer procurement process",
      "data residency decision",
      "customer go-live approval"
    ]
  },
  {
    slug: "nigeria",
    region: "Nigeria",
    priority: "launch",
    buyerFit:
      "Provider networks, public health programs, private clinics, diaspora-backed health ventures, employers, and training partners.",
    deploymentThesis:
      "Lead with access, workflow efficiency, education, FaithCore optionality, and lightweight synthetic pilots before production data integrations.",
    compliancePosture:
      "Local privacy, hosting, consent, partnership, and public-sector approval review required for production deployments.",
    procurementFocus: [
      "access and workforce efficiency",
      "implementation blueprint",
      "training and SCRIMED University path",
      "FaithCore opt-in boundary",
      "affordable deployment profile"
    ],
    languageAndCulture: [
      "English-first materials with local market examples",
      "community trust and access framing",
      "faith-aligned optionality with clinical boundaries"
    ],
    partnerMotion:
      "Blend direct founder-led relationships with channel partners, health entrepreneurs, faith-aligned institutions, and training partners.",
    proofRoutes: ["/global-reach", "/faithcore", "/market-activation", "/pilots"],
    retainedGates: [
      "local privacy review",
      "public-sector authority where applicable",
      "customer data-processing agreement",
      "clinical governance reviewer",
      "production support model"
    ]
  },
  {
    slug: "kenya",
    region: "Kenya",
    priority: "strategic",
    buyerFit:
      "Digital health networks, provider groups, public health programs, employers, and regional innovation partners.",
    deploymentThesis:
      "Use interoperability, workflow intelligence, population-health readiness, and education partnerships as the entry wedge.",
    compliancePosture:
      "Local privacy, data-transfer, procurement, and clinical-governance review required before live data or patient-facing workflows.",
    procurementFocus: [
      "digital health partner pack",
      "population intelligence readiness",
      "implementation blueprint",
      "training path",
      "privacy and consent review"
    ],
    languageAndCulture: [
      "English-first materials",
      "regional digital-health ecosystem language",
      "access and operational resilience framing"
    ],
    partnerMotion:
      "Regional channel partner and public-health advisor route before production implementation.",
    proofRoutes: ["/global-reach", "/interoperability", "/healthcare-intelligence-os", "/demos"],
    retainedGates: [
      "local counsel review",
      "partner authority validation",
      "data-sharing approval",
      "clinical governance review",
      "production incident-response plan"
    ]
  },
  {
    slug: "rwanda",
    region: "Rwanda",
    priority: "strategic",
    buyerFit:
      "Government innovation programs, digital health initiatives, provider networks, and regional health infrastructure partners.",
    deploymentThesis:
      "Position as healthcare intelligence infrastructure for public-sector innovation, synthetic pilots, and carefully governed deployment planning.",
    compliancePosture:
      "Public-sector procurement, privacy, hosting, data-sharing, and regional implementation review required.",
    procurementFocus: [
      "public-sector transformation brief",
      "sovereign-ready profile",
      "implementation partner plan",
      "training and education model",
      "governance evidence pack"
    ],
    languageAndCulture: [
      "English-first executive materials",
      "public-sector trust and accountability framing",
      "training and workforce enablement narrative"
    ],
    partnerMotion:
      "Public-sector and ecosystem partner qualification before any government or national-program claims.",
    proofRoutes: ["/global-reach", "/deployment-profiles", "/trust-center", "/pilot-evidence"],
    retainedGates: [
      "public-sector procurement review",
      "local counsel review",
      "implementation partner qualification",
      "data-residency decision",
      "official approval before public naming"
    ]
  },
  {
    slug: "ghana",
    region: "Ghana",
    priority: "strategic",
    buyerFit:
      "Provider groups, public health stakeholders, employers, clinics, and regional training partners.",
    deploymentThesis:
      "Lead with access, administrative workflow intelligence, training, and protected synthetic pilots before live healthcare data.",
    compliancePosture:
      "Local privacy, consent, hosting, procurement, and clinical-governance review required before production workflows.",
    procurementFocus: [
      "workflow intelligence assessment",
      "training partner pack",
      "privacy and consent posture",
      "implementation blueprint",
      "affordable operating model"
    ],
    languageAndCulture: [
      "English-first materials",
      "community access and operational efficiency framing",
      "strong patient-safety language"
    ],
    partnerMotion:
      "Channel partner and provider champion route with explicit no-PHI and no-live-care public boundary.",
    proofRoutes: ["/global-reach", "/pilots", "/faithcore", "/trust-center"],
    retainedGates: [
      "local privacy review",
      "clinical governance reviewer",
      "production support owner",
      "customer approval",
      "partner authority validation"
    ]
  },
  {
    slug: "europe",
    region: "European Union and United Kingdom",
    priority: "watch",
    buyerFit:
      "Provider groups, payers, life sciences, research networks, employers, and AI governance buyers with mature diligence expectations.",
    deploymentThesis:
      "Use compliance-forward synthetic evaluations and private/sovereign deployment planning before any production data handling.",
    compliancePosture:
      "GDPR, UK privacy, AI governance, data residency, DPA, security, and clinical-safety classification review required before production use.",
    procurementFocus: [
      "GDPR/DPA review pack",
      "model governance evidence",
      "private cloud or sovereign deployment profile",
      "clinical safety case placeholder",
      "data-processing minimization"
    ],
    languageAndCulture: [
      "English-first with localization plan by country",
      "privacy, explainability, and safety-first language",
      "clear separation of evaluation from clinical deployment"
    ],
    partnerMotion:
      "Governance-led enterprise and research partner qualification before market-wide claims.",
    proofRoutes: ["/global-reach", "/trust-center", "/deployment-profiles", "/public-market-readiness"],
    retainedGates: [
      "regional counsel review",
      "DPA and transfer assessment",
      "clinical safety classification",
      "AI governance review",
      "country-level localization approval"
    ]
  }
];

export const globalBuyerLocalizationPacks: GlobalBuyerLocalizationPack[] = [
  {
    key: "provider-health-system",
    audience: "Provider and health-system executives",
    priority: "primary",
    buyingCommittee: ["COO", "CMIO", "CIO", "CMO", "quality", "security", "privacy", "operations"],
    trigger:
      "Access delays, documentation burden, referral leakage, RCM friction, workforce strain, and AI governance pressure.",
    localizedMessage:
      "SCRIMED turns fragmented care operations into governed, human-reviewed intelligence that can be evaluated safely before live integrations.",
    recommendedOffer: "Workflow Intelligence Assessment -> Synthetic Pilot Evaluation -> Protected Enterprise Pilot",
    entryRoute: "/product",
    proofRoutes: ["/product", "/demos", "/pilot-evidence", "/clinical-care-activation"],
    procurementQuestions: [
      "Which workflows are highest friction?",
      "Which systems would eventually require connectors?",
      "Who owns clinical governance and human review?",
      "What evidence is required before pilot funding?"
    ],
    disqualifiers: [
      "Requests autonomous diagnosis",
      "Requires live PHI in public intake",
      "Wants immediate EHR writeback without governance"
    ],
    competitiveEdge:
      "Provider buyers see a full operating layer: AgentOS, TrustOS, interoperability, protected workspaces, proof packets, and clinical activation gates.",
    safeConversionPath:
      "Route to `/pilot` with synthetic-only workflow scope, then Sales Operations qualifies buyer, region, proof needs, and protected workspace fit."
  },
  {
    key: "payer-plan",
    audience: "Payers, plans, and revenue-cycle leaders",
    priority: "primary",
    buyingCommittee: ["RCM", "utilization management", "claims", "medical policy", "finance", "legal", "security"],
    trigger:
      "Prior authorization friction, denial risk, documentation gaps, policy evidence burden, and revenue leakage.",
    localizedMessage:
      "SCRIMED organizes policy, workflow, and evidence gaps into reviewable operational intelligence without payer submission or reimbursement guarantees.",
    recommendedOffer: "Synthetic Pilot Evaluation -> RCM and Prior Authorization Blueprint -> Protected Enterprise Pilot",
    entryRoute: "/pricing",
    proofRoutes: ["/agents/revenue-cycle-agent", "/workflows/results", "/pricing", "/public-market-readiness"],
    procurementQuestions: [
      "Which denial or authorization workflows can be measured safely?",
      "Which policy sources are approved for pilot use?",
      "Who reviews output before external action?",
      "What finance methodology can validate value?"
    ],
    disqualifiers: [
      "Requests reimbursement guarantee",
      "Requires payer submission automation before approval",
      "Asks SCRIMED to make coverage determinations"
    ],
    competitiveEdge:
      "Payer and RCM buyers get review-gated evidence, cost-per-workflow discipline, policy attribution, and finance methodology boundaries.",
    safeConversionPath:
      "Start with a synthetic RCM workflow pack, then require finance, legal, policy, and security review before protected pilot expansion."
  },
  {
    key: "government-public-health",
    audience: "Government and public-sector healthcare leaders",
    priority: "strategic",
    buyingCommittee: ["health ministry", "digital health authority", "procurement", "privacy", "cybersecurity", "public health"],
    trigger:
      "National access, workforce constraints, sovereign data requirements, population health, and digital transformation mandates.",
    localizedMessage:
      "SCRIMED Atlas can be evaluated as healthcare intelligence infrastructure through synthetic evidence before sovereign deployment decisions.",
    recommendedOffer: "Strategic Platform Partnership",
    entryRoute: "/deployment-profiles",
    proofRoutes: ["/global-reach", "/deployment-profiles", "/strategic-intelligence", "/trust-center"],
    procurementQuestions: [
      "Which authority owns procurement?",
      "Which regional data-hosting model is acceptable?",
      "Which public claims require approval?",
      "Which partner can support implementation locally?"
    ],
    disqualifiers: [
      "Requests government approval claim before authorization",
      "Requires public health reporting before implementation review",
      "Needs live citizen data in evaluation"
    ],
    competitiveEdge:
      "Public-sector buyers see sovereign deployment optionality, governance-first evaluation, region packs, and public-claim controls.",
    safeConversionPath:
      "Founder-led executive briefing, regional counsel review, public-sector procurement mapping, synthetic evaluation, then protected deployment planning."
  },
  {
    key: "life-sciences-research",
    audience: "Life sciences, research networks, oncology programs, and trial operations",
    priority: "strategic",
    buyingCommittee: ["research operations", "clinical trials", "oncology", "IRB/compliance", "data governance", "informatics"],
    trigger:
      "Eligibility screening burden, evidence gaps, trial access friction, research operations delay, and explainability needs.",
    localizedMessage:
      "SCRIMED TrialCore and Atlas can structure reviewable research operations evidence without patient outreach, enrollment claims, or treatment recommendations.",
    recommendedOffer: "TrialCore Research Operations Synthetic Pilot",
    entryRoute: "/modules/trialcore",
    proofRoutes: ["/modules/trialcore", "/demos/trialcore-research-operations", "/synthetic", "/trust"],
    procurementQuestions: [
      "Which protocol criteria are approved for synthetic evaluation?",
      "Which reviewers own research governance?",
      "What IRB or ethics review is required before live data?",
      "Which outputs must remain draft-only?"
    ],
    disqualifiers: [
      "Requests patient enrollment action",
      "Requires treatment recommendation",
      "Bypasses research governance or ethics review"
    ],
    competitiveEdge:
      "Research buyers get evidence trails, eligibility rationale, missing-data prompts, and explicit no-enrollment boundaries.",
    safeConversionPath:
      "Use synthetic criteria packs and trial operations demos before data-governance, ethics, and customer authorization review."
  },
  {
    key: "employer-benefits",
    audience: "Employers and benefits leaders",
    priority: "secondary",
    buyingCommittee: ["benefits", "population health", "finance", "privacy", "legal", "broker/consultant"],
    trigger:
      "Rising cost, access friction, care navigation gaps, chronic condition support, and vendor consolidation pressure.",
    localizedMessage:
      "SCRIMED can help employers evaluate operational intelligence for access, navigation, care gaps, and workforce health programs without patient-facing medical advice.",
    recommendedOffer: "Workflow Intelligence Assessment",
    entryRoute: "/pilot",
    proofRoutes: ["/global-reach", "/pilot-evidence", "/market-activation", "/trust-center"],
    procurementQuestions: [
      "Which benefits workflow is measurable without member data?",
      "Which broker or plan partner must approve?",
      "How will employee privacy be protected?",
      "Which outcomes are operational, not clinical?"
    ],
    disqualifiers: [
      "Requests employee diagnosis",
      "Requires member data before agreements",
      "Wants patient outreach without consent"
    ],
    competitiveEdge:
      "Employer buyers see a privacy-first path to workflow and care-navigation intelligence without becoming a medical decision-maker.",
    safeConversionPath:
      "Start with no-member-data workflow assessment, then require plan, privacy, legal, and consent review before any protected pilot."
  },
  {
    key: "global-channel-partner",
    audience: "Global channel partners and healthcare implementers",
    priority: "strategic",
    buyingCommittee: ["systems integrator", "consulting partner", "regional distributor", "implementation lead", "security", "legal"],
    trigger:
      "Need for differentiated healthcare AI infrastructure, regional delivery capability, and trust-first buyer evidence.",
    localizedMessage:
      "SCRIMED can equip qualified partners with governed synthetic proof paths, deployment profiles, buyer packs, and safe regional positioning.",
    recommendedOffer: "Strategic Platform Partnership",
    entryRoute: "/global-reach",
    proofRoutes: ["/global-reach", "/deployment-profiles", "/pilot-deal-room", "/trust-safety-operations"],
    procurementQuestions: [
      "Which region and vertical does the partner cover?",
      "What regulated implementation capability exists?",
      "What claims can the partner make?",
      "How will handoffs, support, and audit evidence work?"
    ],
    disqualifiers: [
      "Claims unauthorized SCRIMED partnership",
      "Requests resale before legal review",
      "Cannot support healthcare-grade security and governance"
    ],
    competitiveEdge:
      "Partner buyers get a serious operating layer, not a demo wrapper: proof packets, region packs, deployment profiles, claims controls, and safety boundaries.",
    safeConversionPath:
      "Qualify partner scope, region, authority, support model, and claims permissions before any co-selling or external announcement."
  },
  {
    key: "investor-board-review",
    audience: "Investors, advisors, and board reviewers",
    priority: "primary",
    buyingCommittee: ["investor", "advisor", "board", "finance", "legal", "operator"],
    trigger:
      "Need to understand SCRIMED's market size, defensibility, operating discipline, global wedge, and proof-to-revenue path.",
    localizedMessage:
      "SCRIMED is healthcare intelligence infrastructure: workflow ownership, trust layer, data loops, interoperability, and buyer proof compound across regions.",
    recommendedOffer: "Investor and Board Readiness Review",
    entryRoute: "/public-market-readiness",
    proofRoutes: ["/public-market-readiness", "/competitive-edge", "/global-reach", "/pilot-deal-room"],
    procurementQuestions: [
      "Which audiences have the clearest paid pilot path?",
      "Which regions are priority versus watch?",
      "Which claims are approved and which require evidence?",
      "Which metrics prove capital efficiency?"
    ],
    disqualifiers: [
      "Requests valuation guarantee",
      "Treats operating metrics as audited financials",
      "Uses materials as securities offering content"
    ],
    competitiveEdge:
      "Investor reviewers see a public-market-style operating stack, premium pricing, global buyer map, and retained hard gates.",
    safeConversionPath:
      "Use Public Market Readiness and Global Reach briefs for diligence preparation while keeping financial and securities boundaries explicit."
  }
];

export const globalPartnerChannels: GlobalPartnerChannel[] = [
  {
    name: "Healthcare systems integrator channel",
    status: "qualification-required",
    partnerType: "Systems integrator or healthcare transformation consultancy",
    idealPartner:
      "Already trusted by hospitals, payers, governments, or life-sciences customers and able to support regulated deployment planning.",
    valueExchange:
      "SCRIMED supplies healthcare intelligence infrastructure, trust evidence, demos, and pilot packs; partner supplies regional implementation access and customer operating context.",
    activationPath:
      "Partner qualification -> legal and claims review -> synthetic demo enablement -> co-sell pilot -> protected implementation plan.",
    proofRoutes: ["/global-reach", "/deployment-profiles", "/pilot-deal-room"],
    blockedClaims: [
      "official SCRIMED partner without signed agreement",
      "certified implementation partner",
      "authorized production deployment partner"
    ]
  },
  {
    name: "Public-sector and sovereign health channel",
    status: "qualification-required",
    partnerType: "Government relations, public health, or sovereign cloud implementation partner",
    idealPartner:
      "Can navigate public-sector procurement, data-residency expectations, and local health authority relationships responsibly.",
    valueExchange:
      "SCRIMED provides synthetic healthcare intelligence evidence and governance architecture; partner provides regional process and implementation legitimacy.",
    activationPath:
      "Authority mapping -> regional counsel review -> public-sector proof pack -> procurement pathway -> synthetic evaluation.",
    proofRoutes: ["/global-reach", "/deployment-profiles", "/trust-center"],
    blockedClaims: [
      "government approved",
      "national platform selected",
      "public-sector authorization granted"
    ]
  },
  {
    name: "Faith-aligned community and care channel",
    status: "ready-for-controlled-outreach",
    partnerType: "Faith-aligned care, community, education, or patient-experience institution",
    idealPartner:
      "Values dignity, encouragement, trust, education, and whole-person support while respecting professional clinical boundaries.",
    valueExchange:
      "SCRIMED provides FaithCore as opt-in trust and encouragement infrastructure; partner provides community context and ethical deployment feedback.",
    activationPath:
      "FaithCore briefing -> consent and boundary review -> community education pilot -> clinical-governance review for any care-adjacent workflows.",
    proofRoutes: ["/faithcore", "/global-reach", "/trust-center"],
    blockedClaims: [
      "spiritual guidance replaces care",
      "emergency support",
      "clinical advice through FaithCore"
    ]
  },
  {
    name: "Research and life-sciences channel",
    status: "qualification-required",
    partnerType: "Academic medical center, trial network, CRO, oncology program, or research informatics partner",
    idealPartner:
      "Can validate review-only research workflows, evidence trails, and eligibility operations without patient enrollment automation.",
    valueExchange:
      "SCRIMED supplies TrialCore, Atlas evidence, and governed workspaces; partner supplies protocol context and research governance review.",
    activationPath:
      "Synthetic protocol pack -> research governance review -> evidence-gap demo -> protected pilot design.",
    proofRoutes: ["/modules/trialcore", "/global-reach", "/trust"],
    blockedClaims: [
      "patient enrollment guarantee",
      "treatment recommendation",
      "IRB approval"
    ]
  }
];

export const globalBoundaryResolutions: GlobalBoundaryResolution[] = [
  {
    boundary: "Regional legal and privacy approval",
    impact:
      "SCRIMED cannot claim jurisdictional compliance, data-transfer approval, DPA adequacy, or public-sector legal readiness from product metadata alone.",
    resolution:
      "Use region packs as intake and diligence routing only; require qualified regional counsel, customer legal review, and externally retained approval artifacts before production.",
    retainedGate: "Regional counsel and customer legal approval.",
    owner: "Legal, privacy, and executive sponsor",
    status: "contained-with-workaround"
  },
  {
    boundary: "PHI, patient identifiers, payer member data, and production records",
    impact:
      "Global pilots could create data-leakage and regulatory risk if early buyer materials invite real records or member data.",
    resolution:
      "Keep all public and global intake synthetic-only; route any protected data request to gated enterprise scope, BAA/DPA path, security review, and production data architecture.",
    retainedGate: "Signed customer scope, data-processing agreement, and PHI architecture approval.",
    owner: "Privacy, security, and implementation",
    status: "contained-with-workaround"
  },
  {
    boundary: "Clinical execution authority",
    impact:
      "Global messaging could be misread as care delivery, medical-device function, diagnosis, treatment, or patient triage authority.",
    resolution:
      "Keep all region and audience packs review-only, non-diagnostic, and human-supervised; route care-adjacent requests to Clinical Care Activation gates.",
    retainedGate: "Licensed clinical governance, regulatory classification, validated workflow, and customer go-live approval.",
    owner: "Clinical governance and TrustOS",
    status: "contained-with-workaround"
  },
  {
    boundary: "Security certification and procurement approval",
    impact:
      "Buyers may ask for SOC reports, pentest details, questionnaire answers, or procurement approval before SCRIMED is ready to store sensitive artifacts.",
    resolution:
      "Use Protected Procurement Evidence Registry and Provider Security Reviews to store metadata-only routing while sensitive artifacts remain externally retained.",
    retainedGate: "Qualified security review, approved artifact storage, and buyer procurement decision.",
    owner: "Security, procurement, and buyer sponsor",
    status: "contained-with-workaround"
  },
  {
    boundary: "Reimbursement, ROI, and audited financial claims",
    impact:
      "Payer, provider, employer, and investor materials may overstate savings, revenue protection, reimbursement, or valuation.",
    resolution:
      "Route financial claims through Public Market Readiness, finance methodology gates, external approval evidence, and release decision workflow.",
    retainedGate: "Finance review, buyer-approved methodology, counsel review, and external-use approval.",
    owner: "Finance, legal, and sales",
    status: "contained-with-workaround"
  },
  {
    boundary: "Localization, language, and cultural review",
    impact:
      "Global materials can lose trust or create claims risk if translated or culturally adapted without review.",
    resolution:
      "Treat localized copy as draft until region-specific review covers language, claims, clinical boundaries, faith posture, and public-sector sensitivities.",
    retainedGate: "Qualified translation, regional reviewer, claims register update, and release decision.",
    owner: "Marketing, regional partner, and claims reviewer",
    status: "contained-with-workaround"
  },
  {
    boundary: "Partner authority and channel claims",
    impact:
      "Partners may imply authorization, certification, resale rights, or government/customer approval without signed agreements.",
    resolution:
      "Require partner qualification, legal agreement, claims permissions, support ownership, and evidence-room controls before co-selling or public announcement.",
    retainedGate: "Signed partner agreement and approved partner claims pack.",
    owner: "Partnerships, legal, and executive sponsor",
    status: "contained-with-workaround"
  },
  {
    boundary: "Public relations, advertising, and case-study release",
    impact:
      "Global growth can create pressure to publish customer, region, partner, revenue, or clinical claims before evidence is approved.",
    resolution:
      "Route all external-use claims through release decisions, named reviewer sign-offs, distribution lockbox, and release authority attestations.",
    retainedGate: "Customer permission, counsel review, marketing-claims approval, and distribution release.",
    owner: "PR, marketing, legal, and customer sponsor",
    status: "contained-with-workaround"
  }
];

export const globalCompetitiveEdges: GlobalCompetitiveEdge[] = [
  {
    pillar: "Global buyer packs",
    buyerSignal:
      "Enterprise buyers need region and audience-specific proof paths, not generic AI positioning.",
    scrimedAdvantage:
      "SCRIMED maps each buyer segment to offer, proof routes, procurement questions, disqualifiers, and safe conversion path.",
    proofRoute: "/global-reach",
    blockedClaim: "Does not mean local legal, privacy, procurement, or clinical approval is complete."
  },
  {
    pillar: "Sovereign-ready architecture story",
    buyerSignal:
      "Governments and regulated buyers increasingly ask whether healthcare intelligence can run under local control.",
    scrimedAdvantage:
      "Deployment profiles and region packs let SCRIMED sell cloud, private, hospital-controlled, sovereign, and edge/on-prem planning without moving live data.",
    proofRoute: "/deployment-profiles",
    blockedClaim: "Does not mean any sovereign deployment has been approved or implemented."
  },
  {
    pillar: "Procurement-safe expansion",
    buyerSignal:
      "Security, privacy, legal, and vendor-risk teams need diligence evidence before sensitive artifacts are exchanged.",
    scrimedAdvantage:
      "Protected procurement and provider-security routes capture metadata-only readiness while sensitive artifacts stay externally retained.",
    proofRoute: "/pilot-workspace/access",
    blockedClaim: "Does not store SOC reports, pentest findings, signed contracts, credentials, or questionnaire answers."
  },
  {
    pillar: "FaithCore optionality",
    buyerSignal:
      "Some markets value dignity, encouragement, spiritual support, and community trust when handled safely.",
    scrimedAdvantage:
      "FaithCore is positioned as opt-in trust and encouragement support while clinical judgment remains with qualified professionals.",
    proofRoute: "/faithcore",
    blockedClaim: "Does not replace clinical care, emergency support, counseling, or medical advice."
  },
  {
    pillar: "Capital-efficient global motion",
    buyerSignal:
      "Investors and board reviewers want global reach without expensive, unfocused market entry.",
    scrimedAdvantage:
      "SCRIMED prioritizes region packs, partner channels, premium pilots, and proof-to-revenue metrics before scaling spend.",
    proofRoute: "/public-market-readiness",
    blockedClaim: "Does not guarantee valuation, fundraising, revenue, reimbursement, or audited financial outcomes."
  }
];

export const globalActivationSequence: GlobalActivationStep[] = [
  {
    step: "1. Segment and region fit",
    objective:
      "Classify the buyer by audience, region, deployment constraint, proof need, and commercial path.",
    exitCriteria:
      "Buyer has a selected localization pack, region focus, and safe first offer without PHI or live clinical scope.",
    evidence: ["Global buyer pack", "region focus", "pilot intake", "sales attribution"]
  },
  {
    step: "2. Claims and procurement preflight",
    objective:
      "Check whether the buyer needs legal, privacy, security, procurement, public-sector, or partner evidence before deeper sales motion.",
    exitCriteria:
      "Required proof routes and retained approval gates are identified before external promises.",
    evidence: ["claims register", "procurement evidence registry", "trust center", "release decision workflow"]
  },
  {
    step: "3. Synthetic pilot or assessment",
    objective:
      "Run a no-PHI evaluation that proves workflow value, buyer fit, deployment path, and evidence quality.",
    exitCriteria:
      "Buyer receives controlled pilot evidence, measurable operational signals, and next-step governance requirements.",
    evidence: ["product console", "pilot evidence", "demo center", "public market readiness"]
  },
  {
    step: "4. Protected enterprise planning",
    objective:
      "Move only qualified buyers into protected workspaces, procurement routing, partner planning, and production-readiness gates.",
    exitCriteria:
      "AAL2 workspace evidence, roles, audit trail, procurement metadata, and retained hard gates are explicit.",
    evidence: ["protected pilot workspace", "buyer pilot room", "provider security reviews", "clinical care activation"]
  }
];

export function getGlobalPartnerLocalizationSummary() {
  const containedBoundaryCount = globalBoundaryResolutions.filter(
    (resolution) => resolution.status === "contained-with-workaround"
  ).length;
  const launchRegionCount = globalRegionFocuses.filter(
    (region) => region.priority === "launch"
  ).length;
  const strategicRegionCount = globalRegionFocuses.filter(
    (region) => region.priority === "strategic"
  ).length;

  return {
    service: "scrimed-global-partner-localization",
    status: globalPartnerLocalizationStatus,
    proofStackStatus: globalPartnerLocalizationStatus,
    briefStatus: globalPartnerLocalizationBriefStatus,
    route: "/global-reach",
    apiRoute: "/api/global-reach",
    briefRoute: "/api/global-reach/brief",
    boundary: globalPartnerLocalizationBoundary,
    launchRegionCount,
    strategicRegionCount,
    regionCount: globalRegionFocuses.length,
    buyerPackCount: globalBuyerLocalizationPacks.length,
    partnerChannelCount: globalPartnerChannels.length,
    boundaryResolutionCount: globalBoundaryResolutions.length,
    containedBoundaryCount,
    retainedHardGateCount: globalBoundaryResolutions.length,
    competitiveEdgeCount: globalCompetitiveEdges.length,
    activationStepCount: globalActivationSequence.length,
    regions: globalRegionFocuses,
    buyerPacks: globalBuyerLocalizationPacks,
    partnerChannels: globalPartnerChannels,
    boundaryResolutions: globalBoundaryResolutions,
    competitiveEdges: globalCompetitiveEdges,
    activationSequence: globalActivationSequence,
    nextBuildStep:
      "Add protected partner qualification records and localized buyer-pack packet exports after legal review approves the partner claims workflow.",
    updated: "2026-06-20"
  };
}

export function buildGlobalPartnerLocalizationBrief() {
  const summary = getGlobalPartnerLocalizationSummary();

  return [
    "# SCRIMED Global Partner And Buyer Localization Brief",
    "",
    `Status: ${summary.status}`,
    `Boundary: ${summary.boundary}`,
    "",
    "## Region Focus",
    ...summary.regions.map(
      (region) =>
        `- ${region.region} (${region.priority}): ${region.deploymentThesis} Retained gates: ${region.retainedGates.join(", ")}.`
    ),
    "",
    "## Buyer Packs",
    ...summary.buyerPacks.map(
      (pack) =>
        `- ${pack.audience}: ${pack.recommendedOffer}. Entry: ${pack.entryRoute}. Boundary disqualifiers: ${pack.disqualifiers.join(", ")}.`
    ),
    "",
    "## Partner Channels",
    ...summary.partnerChannels.map(
      (channel) =>
        `- ${channel.name} (${channel.status}): ${channel.activationPath}. Blocked claims: ${channel.blockedClaims.join(", ")}.`
    ),
    "",
    "## Boundary Resolutions",
    ...summary.boundaryResolutions.map(
      (resolution) =>
        `- ${resolution.boundary}: ${resolution.resolution} Retained gate: ${resolution.retainedGate}`
    ),
    "",
    "## Competitive Edge",
    ...summary.competitiveEdges.map(
      (edge) =>
        `- ${edge.pillar}: ${edge.scrimedAdvantage} Proof: ${edge.proofRoute}. Blocked claim: ${edge.blockedClaim}`
    ),
    "",
    "## Activation Sequence",
    ...summary.activationSequence.map(
      (step) => `- ${step.step}: ${step.objective} Exit: ${step.exitCriteria}`
    ),
    "",
    `Next build step: ${summary.nextBuildStep}`
  ].join("\n");
}
