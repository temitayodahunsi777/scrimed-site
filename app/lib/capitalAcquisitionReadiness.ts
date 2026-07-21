import {
  federalContractOfficialSourceIds,
  getFederalContractReadinessSummary
} from "./federalContractReadiness";

export type CapitalAccessLaneId =
  | "institutional-private-capital"
  | "strategic-corporate-capital"
  | "federal-prime-contract"
  | "federal-subcontracting"
  | "federal-grant"
  | "sbir-sttr"
  | "state-local-public-sector";

export type PublicSectorOpportunityLane =
  | "federal-prime-contract"
  | "federal-subcontracting"
  | "federal-grant"
  | "sbir-sttr"
  | "state-local-public-sector";

export type EvidenceState = "unknown" | "verified-current" | "missing" | "expired";
export type ReviewState = "not-started" | "in-review" | "approved" | "rejected";

export type OfficialReadinessSource = {
  id: string;
  authority: string;
  title: string;
  url: string;
  readinessUse: string;
  reviewedAt: string;
  freshnessPolicy: string;
};

export type CapitalAccessLane = {
  id: CapitalAccessLaneId;
  name: string;
  capitalType: "dilutive" | "strategic" | "contract-revenue" | "non-dilutive";
  status: "internal-readiness-active" | "external-evidence-required" | "qualified-review-required";
  fit: string;
  requiredEvidence: string[];
  requiredReviewers: string[];
  officialSourceIds: string[];
  blockedClaims: string[];
  nextAction: string;
};

export type PublicSectorReadinessGate = {
  id: string;
  name: string;
  stage: "entity" | "market" | "proposal" | "assurance" | "award";
  defaultStatus: "not-verified" | "qualified-review-required";
  owner: string;
  requiredEvidence: string[];
  officialSourceIds: string[];
  blocksSubmission: boolean;
  blockedClaims: string[];
  nextAction: string;
};

export type PublicSectorOpportunityInputs = {
  lane: PublicSectorOpportunityLane;
  officialNotice: EvidenceState;
  deadline: "unknown" | "open" | "closed";
  scopeFit: "unknown" | "low" | "medium" | "high";
  applicableRegistration: EvidenceState;
  programEligibility: "unknown" | "verified-eligible" | "not-eligible";
  solicitationCompliance: ReviewState;
  securityPrivacyReview: ReviewState;
  financeDeliveryReview: ReviewState;
  evidenceReadiness: ReviewState;
  humanBidApproval: ReviewState;
  requiresLivePhi: boolean;
  requiresAutonomousClinicalAction: boolean;
  requiresEhrWriteback: boolean;
  requiresPayerSubmission: boolean;
};

export type PublicSectorOpportunityDecision =
  | "input-required"
  | "blocked-no-bid"
  | "research-and-remediation-required"
  | "qualified-bid-review-required"
  | "ready-for-human-submission-review";

export type PublicSectorOpportunityAssessment = {
  decision: PublicSectorOpportunityDecision;
  externalSubmissionAuthorized: false;
  contractAwardAuthority: "not-contract-award";
  grantAwardAuthority: "not-grant-award";
  registrationAuthority: "not-registration-verification";
  certificationAuthority: "not-certification-verification";
  completedGateCount: number;
  totalGateCount: number;
  missingGateIds: string[];
  hardStops: string[];
  reviewWarnings: string[];
  nextAction: string;
};

export const capitalAcquisitionReadinessVersion = "scrimed-capital-acquisition-readiness-v2";
export const capitalAcquisitionReadinessUpdatedAt = "2026-07-20";
export const capitalAcquisitionReadinessStatus =
  "capital-and-public-sector-readiness-active-evidence-gated";

export const capitalAcquisitionReadinessBoundary =
  "SCRIMED Capital Acquisition Readiness organizes internal fundraising diligence and public-sector opportunity qualification. It does not verify SAM.gov registration, a Unique Entity ID, CAGE assignment, small-business status, certification, grant eligibility, contract eligibility, past performance, proposal compliance, award status, funding availability, securities compliance, or government endorsement. It never submits applications, bids, proposals, claims, outreach, or external communications. Every external use requires current official evidence and named human review.";

export const officialReadinessSources: OfficialReadinessSource[] = [
  {
    id: "sec-capital-raising-building-blocks",
    authority: "U.S. Securities and Exchange Commission",
    title: "Capital Raising Building Blocks",
    url: "https://www.sec.gov/resources-small-businesses/building-blocks",
    readinessUse: "Qualified counsel uses the current SEC materials when selecting and reviewing a capital-raising pathway.",
    reviewedAt: capitalAcquisitionReadinessUpdatedAt,
    freshnessPolicy: "Recheck before any fundraising solicitation, financing instrument, Form D analysis, or external release."
  },
  {
    id: "sam-entity-registration",
    authority: "U.S. General Services Administration",
    title: "SAM.gov Entity Registration",
    url: "https://sam.gov/entity-registration",
    readinessUse: "Operator verifies the current entity-registration path and retains status evidence outside public SCRIMED surfaces.",
    reviewedAt: capitalAcquisitionReadinessUpdatedAt,
    freshnessPolicy: "Recheck registration status and current SAM.gov instructions before every federal submission."
  },
  {
    id: "sam-entity-registration-checklist",
    authority: "U.S. General Services Administration",
    title: "SAM.gov Entity Registration Checklist",
    url: "https://sam.gov/sites/default/files/2024-11/entity-checklist.pdf",
    readinessUse: "Authorized entity administrator prepares Core, Assertions, representations and certifications, contacts, validation, and applicable CAGE/NCAGE information.",
    reviewedAt: capitalAcquisitionReadinessUpdatedAt,
    freshnessPolicy: "Download the current checklist from SAM.gov before starting or renewing registration."
  },
  {
    id: "far-sam-registration",
    authority: "Federal Acquisition Regulatory Council",
    title: "FAR 52.204-7 System for Award Management",
    url: "https://www.acquisition.gov/far/52.204-7",
    readinessUse: "Qualified reviewer confirms the current prime-offer registration requirement and the elements of an Active SAM record.",
    reviewedAt: capitalAcquisitionReadinessUpdatedAt,
    freshnessPolicy: "Recheck the effective FAR text and solicitation-specific deviations before every offer."
  },
  {
    id: "far-sam-maintenance",
    authority: "Federal Acquisition Regulatory Council",
    title: "FAR 52.204-13 System for Award Management Maintenance",
    url: "https://www.acquisition.gov/far/52.204-13",
    readinessUse: "Contracts owner tracks annual review, record accuracy, contract-performance maintenance, and change notification requirements.",
    reviewedAt: capitalAcquisitionReadinessUpdatedAt,
    freshnessPolicy: "Recheck the effective clause and contract-specific requirements before award and throughout performance."
  },
  {
    id: "sam-contract-opportunities",
    authority: "U.S. General Services Administration",
    title: "SAM.gov Contract Opportunities",
    url: "https://sam.gov/opportunities",
    readinessUse: "Procurement owner validates the authoritative notice, amendments, deadline, agency contact, and submission path.",
    reviewedAt: capitalAcquisitionReadinessUpdatedAt,
    freshnessPolicy: "Recheck the notice and every amendment immediately before bid/no-bid and submission review."
  },
  {
    id: "sba-federal-contracting",
    authority: "U.S. Small Business Administration",
    title: "Federal Contracting Guide",
    url: "https://www.sba.gov/federal-contracting/contracting-guide",
    readinessUse: "Procurement owner reviews current basic requirements, size standards, assistance, prime, and subcontracting paths.",
    reviewedAt: capitalAcquisitionReadinessUpdatedAt,
    freshnessPolicy: "Recheck applicable SBA requirements and program rules before making eligibility or set-aside claims."
  },
  {
    id: "sba-how-to-win-contracts",
    authority: "U.S. Small Business Administration",
    title: "How to Win Contracts",
    url: "https://www.sba.gov/federal-contracting/contracting-guide/how-win-contracts",
    readinessUse: "Capture owner prepares an accurate SBA business profile, researches official opportunities and forecasts, and targets agencies with supported capabilities.",
    reviewedAt: capitalAcquisitionReadinessUpdatedAt,
    freshnessPolicy: "Recheck current SBA market-entry guidance and each authoritative opportunity before capture activity."
  },
  {
    id: "sba-prime-subcontracting",
    authority: "U.S. Small Business Administration",
    title: "Prime and Subcontracting",
    url: "https://www.sba.gov/federal-contracting/contracting-guide/prime-subcontracting",
    readinessUse: "Capture owner distinguishes prime registration obligations from subcontracting, teaming, workshare, flowdown, and reporting requirements.",
    reviewedAt: capitalAcquisitionReadinessUpdatedAt,
    freshnessPolicy: "Recheck current prime, subcontracting, flowdown, and reporting guidance before any teaming representation."
  },
  {
    id: "far-current",
    authority: "Federal Acquisition Regulatory Council",
    title: "Federal Acquisition Regulation",
    url: "https://www.acquisition.gov/browse/index/far",
    readinessUse: "Qualified procurement counsel maps the current solicitation clauses, agency supplements, flowdowns, and obligations.",
    reviewedAt: capitalAcquisitionReadinessUpdatedAt,
    freshnessPolicy: "Use the current effective FAR and applicable agency supplements for each opportunity."
  },
  {
    id: "grants-applicant-registration",
    authority: "Grants.gov",
    title: "Applicant Registration",
    url: "https://www.grants.gov/quick-start-guide/applicants",
    readinessUse: "Authorized grant administrators verify current organizational registration and workspace requirements.",
    reviewedAt: capitalAcquisitionReadinessUpdatedAt,
    freshnessPolicy: "Recheck registration and opportunity-specific instructions before every grant application."
  },
  {
    id: "sbir-sttr-eligibility",
    authority: "U.S. Small Business Administration",
    title: "SBIR/STTR Eligibility Requirements",
    url: "https://www.sbir.gov/faq/eligibility-requirements",
    readinessUse: "Qualified program reviewer validates company, ownership, workshare, research-partner, and agency-specific eligibility.",
    reviewedAt: capitalAcquisitionReadinessUpdatedAt,
    freshnessPolicy: "Recheck the current policy directive and the issuing agency solicitation before self-certification."
  }
];

export const capitalAccessLanes: CapitalAccessLane[] = [
  {
    id: "institutional-private-capital",
    name: "Institutional and private capital",
    capitalType: "dilutive",
    status: "qualified-review-required",
    fit: "Founder-approved financing for product, security, clinical-governance, go-to-market, and enterprise delivery milestones.",
    requiredEvidence: ["reconciled financial model", "current cap table", "IP ownership review", "use-of-funds plan", "exact-fingerprint diligence packet"],
    requiredReviewers: ["founder", "qualified securities counsel", "finance reviewer", "release steward"],
    officialSourceIds: ["sec-capital-raising-building-blocks"],
    blockedClaims: ["approved offering", "guaranteed return", "audited forecast", "valuation assurance"],
    nextAction: "Complete the existing investor diligence manifest and retain counsel review before any solicitation or financing terms are distributed."
  },
  {
    id: "strategic-corporate-capital",
    name: "Strategic corporate capital",
    capitalType: "strategic",
    status: "qualified-review-required",
    fit: "Capital paired with distribution, infrastructure, interoperability, or healthcare-enterprise operating leverage.",
    requiredEvidence: ["strategic-fit thesis", "data-rights boundary", "IP boundary", "non-exclusivity position", "integration and security review plan"],
    requiredReviewers: ["founder", "qualified counsel", "product owner", "security reviewer"],
    officialSourceIds: ["sec-capital-raising-building-blocks"],
    blockedClaims: ["partnership approved", "investment committed", "exclusive rights granted", "procurement approved"],
    nextAction: "Use target-specific meeting packets, then separate nonbinding strategic fit from investment, commercial, data-rights, and exclusivity terms."
  },
  {
    id: "federal-prime-contract",
    name: "Federal prime contracting",
    capitalType: "contract-revenue",
    status: "external-evidence-required",
    fit: "Synthetic evaluation, governance, workflow analysis, research support, and other scoped services that fit an authoritative solicitation.",
    requiredEvidence: ["current applicable registration", "official opportunity notice", "eligibility determination", "clause matrix", "delivery and pricing approval"],
    requiredReviewers: ["procurement owner", "qualified government-contracts counsel", "security/privacy", "finance", "delivery owner"],
    officialSourceIds: ["sam-entity-registration", "sam-contract-opportunities", "sba-federal-contracting", "far-current"],
    blockedClaims: ["registered federal contractor", "eligible bidder", "responsive offer", "contract award", "government endorsement"],
    nextAction: "Verify entity status outside public surfaces, select one official notice, and run the local weakest-link opportunity assessment before spending proposal effort."
  },
  {
    id: "federal-subcontracting",
    name: "Federal subcontracting and teaming",
    capitalType: "contract-revenue",
    status: "qualified-review-required",
    fit: "A lower-friction path to contribute governed healthcare AI capabilities through an experienced prime contractor.",
    requiredEvidence: ["prime sponsor authority", "flowdown review", "workshare", "data-rights terms", "security boundary", "delivery capacity"],
    requiredReviewers: ["procurement owner", "qualified counsel", "security/privacy", "finance", "delivery owner"],
    officialSourceIds: ["sba-federal-contracting", "far-current"],
    blockedClaims: ["approved subcontractor", "teaming agreement executed", "prime sponsorship", "past performance inherited"],
    nextAction: "Qualify primes by mission and vehicle fit, then require a reviewed teaming or subcontract path before representing access or authority."
  },
  {
    id: "federal-grant",
    name: "Federal grant and cooperative-agreement funding",
    capitalType: "non-dilutive",
    status: "external-evidence-required",
    fit: "Mission-aligned research, evidence, public-health, workforce, or infrastructure programs where SCRIMED is an eligible applicant or partner.",
    requiredEvidence: ["current applicable registration", "Grants.gov organization profile", "opportunity eligibility", "program narrative", "budget and reporting plan"],
    requiredReviewers: ["grant owner", "qualified grant counsel or administrator", "finance", "research/clinical owner", "security/privacy"],
    officialSourceIds: ["sam-entity-registration", "grants-applicant-registration"],
    blockedClaims: ["grant eligible", "grant approved", "funding awarded", "government endorsement"],
    nextAction: "Confirm current organizational eligibility and registration, then build one opportunity-specific compliance matrix and evidence-backed narrative."
  },
  {
    id: "sbir-sttr",
    name: "SBIR/STTR research commercialization",
    capitalType: "non-dilutive",
    status: "external-evidence-required",
    fit: "Healthcare AI research and commercialization aligned with a current participating-agency topic and program rules.",
    requiredEvidence: ["program-specific eligibility", "agency topic fit", "research plan", "commercialization plan", "workshare and principal-investigator review"],
    requiredReviewers: ["research owner", "qualified SBIR/STTR reviewer", "finance", "qualified counsel", "clinical safety"],
    officialSourceIds: ["sam-entity-registration", "sbir-sttr-eligibility"],
    blockedClaims: ["SBIR eligible", "STTR eligible", "award expected", "agency validation"],
    nextAction: "Run program-specific eligibility review against the current agency solicitation before self-certification or proposal drafting."
  },
  {
    id: "state-local-public-sector",
    name: "State, local, and public-health procurement",
    capitalType: "contract-revenue",
    status: "qualified-review-required",
    fit: "Governed workflow assessments and synthetic pilots aligned with a named jurisdiction's health, access, or operations need.",
    requiredEvidence: ["jurisdiction registration", "official notice", "local terms", "security/privacy requirements", "delivery and reporting plan"],
    requiredReviewers: ["procurement owner", "regional counsel", "security/privacy", "finance", "delivery owner"],
    officialSourceIds: [],
    blockedClaims: ["approved vendor", "eligible bidder", "public-health endorsement", "contract award"],
    nextAction: "Add the named jurisdiction's official sources and requirements before qualification; federal sources must not be reused as a substitute."
  }
];

export const publicSectorReadinessGates: PublicSectorReadinessGate[] = [
  {
    id: "entity-registration",
    name: "Applicable entity registration",
    stage: "entity",
    defaultStatus: "not-verified",
    owner: "Founder + authorized registration administrator",
    requiredEvidence: ["current status reference", "legal-entity match", "renewal or expiry date", "authorized administrator"],
    officialSourceIds: ["sam-entity-registration"],
    blocksSubmission: true,
    blockedClaims: ["SAM registration active", "UEI assigned", "CAGE assigned", "state vendor registration active"],
    nextAction: "Verify the applicable registration in the authoritative system and retain only a protected evidence reference, not credentials or tax identifiers."
  },
  {
    id: "small-business-and-program-eligibility",
    name: "Small-business and program eligibility",
    stage: "entity",
    defaultStatus: "qualified-review-required",
    owner: "Founder + qualified eligibility reviewer",
    requiredEvidence: ["current size analysis", "ownership/control review", "program-specific criteria", "signed certification authority"],
    officialSourceIds: ["sba-federal-contracting", "sbir-sttr-eligibility"],
    blocksSubmission: true,
    blockedClaims: ["small-business eligible", "set-aside eligible", "SBIR eligible", "STTR eligible"],
    nextAction: "Complete opportunity-specific eligibility review before any certification or set-aside representation."
  },
  {
    id: "certification-evidence",
    name: "Certification and socioeconomic-program evidence",
    stage: "entity",
    defaultStatus: "not-verified",
    owner: "Founder + qualified certification reviewer",
    requiredEvidence: ["issuing authority", "program", "status", "effective date", "expiry or renewal date"],
    officialSourceIds: ["sba-federal-contracting"],
    blocksSubmission: false,
    blockedClaims: ["8(a) certified", "HUBZone certified", "WOSB certified", "VOSB/SDVOSB certified"],
    nextAction: "Do not claim or target a certification-restricted opportunity until the issuing authority's current evidence is retained."
  },
  {
    id: "opportunity-source-and-amendments",
    name: "Official opportunity and amendment control",
    stage: "market",
    defaultStatus: "not-verified",
    owner: "Capture or grant owner",
    requiredEvidence: ["official notice", "notice identifier", "amendment log", "deadline", "authorized submission method"],
    officialSourceIds: ["sam-contract-opportunities", "grants-applicant-registration"],
    blocksSubmission: true,
    blockedClaims: ["opportunity open", "deadline confirmed", "submission path confirmed"],
    nextAction: "Bind qualification and proposal work to the current official notice and every amendment."
  },
  {
    id: "bid-no-bid",
    name: "Evidence-based bid/no-bid",
    stage: "market",
    defaultStatus: "qualified-review-required",
    owner: "Founder + capture owner + delivery owner",
    requiredEvidence: ["mission fit", "buyer need", "solution boundary", "win strategy", "proposal cost", "delivery capacity", "conflicts"],
    officialSourceIds: [],
    blocksSubmission: true,
    blockedClaims: ["qualified opportunity", "competitive position", "win probability"],
    nextAction: "Approve proposal spend only when scope, safety, capacity, economics, and evidence clear the weakest-link review."
  },
  {
    id: "solicitation-compliance",
    name: "Solicitation and clause compliance matrix",
    stage: "proposal",
    defaultStatus: "qualified-review-required",
    owner: "Proposal manager + qualified procurement counsel",
    requiredEvidence: ["instruction matrix", "evaluation-factor matrix", "FAR/agency clause review", "representations", "exceptions"],
    officialSourceIds: ["far-current"],
    blocksSubmission: true,
    blockedClaims: ["responsive proposal", "terms accepted", "FAR compliant", "agency supplement compliant"],
    nextAction: "Create a solicitation-specific matrix; do not generalize one contract's clauses to another."
  },
  {
    id: "security-privacy-data",
    name: "Security, privacy, data, and AI terms review",
    stage: "assurance",
    defaultStatus: "qualified-review-required",
    owner: "Security + privacy + legal + clinical governance",
    requiredEvidence: ["data classification", "hosting/residency", "incident terms", "AI restrictions", "PHI boundary", "subcontractor terms"],
    officialSourceIds: [],
    blocksSubmission: true,
    blockedClaims: ["security approved", "privacy approved", "PHI authorized", "compliance certified"],
    nextAction: "Reject or qualify scopes that require authority SCRIMED does not currently hold."
  },
  {
    id: "pricing-accounting-capacity",
    name: "Pricing, accounting, cash-flow, and capacity review",
    stage: "proposal",
    defaultStatus: "qualified-review-required",
    owner: "Finance + delivery + deal desk",
    requiredEvidence: ["cost build-up", "price approval", "payment timing", "staffing", "subcontractors", "reporting burden", "margin floor"],
    officialSourceIds: [],
    blocksSubmission: true,
    blockedClaims: ["price approved", "delivery capacity committed", "revenue recognized", "margin assured"],
    nextAction: "Model total pursuit and delivery cost before proposal approval, including compliance, reporting, review, and payment timing."
  },
  {
    id: "capability-and-past-performance",
    name: "Capability and past-performance evidence",
    stage: "proposal",
    defaultStatus: "not-verified",
    owner: "Proposal manager + release steward",
    requiredEvidence: ["permissioned capability statement", "verified references", "scope relevance", "performance period", "claim approval"],
    officialSourceIds: [],
    blocksSubmission: false,
    blockedClaims: ["federal past performance", "customer outcome", "agency experience", "customer endorsement"],
    nextAction: "Use synthetic capability proof until permissioned, exact-scope past-performance evidence exists."
  },
  {
    id: "human-submission-authorization",
    name: "Named human submission authorization",
    stage: "proposal",
    defaultStatus: "qualified-review-required",
    owner: "Authorized company official",
    requiredEvidence: ["exact proposal fingerprint", "named approver", "approval timestamp", "recipient/opportunity scope", "expiry"],
    officialSourceIds: [],
    blocksSubmission: true,
    blockedClaims: ["proposal authorized", "application submitted", "representations certified"],
    nextAction: "A named authorized official must review the exact final packet in the external submission system."
  },
  {
    id: "award-and-start-control",
    name: "Award, protest, onboarding, and start control",
    stage: "award",
    defaultStatus: "not-verified",
    owner: "Founder + contracts + finance + delivery",
    requiredEvidence: ["signed award", "notice to proceed", "funding", "onboarding", "security approval", "billing trigger"],
    officialSourceIds: [],
    blocksSubmission: false,
    blockedClaims: ["contract awarded", "grant awarded", "work authorized", "funding obligated", "government customer"],
    nextAction: "Do not start work, publish an award, recognize revenue, or name a government customer until exact external evidence is retained and reviewed."
  }
];

export const publicSectorOpportunityInputTemplate: PublicSectorOpportunityInputs = {
  lane: "federal-prime-contract",
  officialNotice: "unknown",
  deadline: "unknown",
  scopeFit: "unknown",
  applicableRegistration: "unknown",
  programEligibility: "unknown",
  solicitationCompliance: "not-started",
  securityPrivacyReview: "not-started",
  financeDeliveryReview: "not-started",
  evidenceReadiness: "not-started",
  humanBidApproval: "not-started",
  requiresLivePhi: false,
  requiresAutonomousClinicalAction: false,
  requiresEhrWriteback: false,
  requiresPayerSubmission: false
};

const opportunityGateChecks: Array<{
  id: string;
  passes: (inputs: PublicSectorOpportunityInputs) => boolean;
}> = [
  { id: "official-notice-current", passes: (inputs) => inputs.officialNotice === "verified-current" },
  { id: "deadline-open", passes: (inputs) => inputs.deadline === "open" },
  { id: "scope-fit-supported", passes: (inputs) => inputs.scopeFit === "medium" || inputs.scopeFit === "high" },
  { id: "applicable-registration-current", passes: (inputs) => inputs.applicableRegistration === "verified-current" },
  { id: "program-eligibility-verified", passes: (inputs) => inputs.programEligibility === "verified-eligible" },
  { id: "solicitation-compliance-approved", passes: (inputs) => inputs.solicitationCompliance === "approved" },
  { id: "security-privacy-approved", passes: (inputs) => inputs.securityPrivacyReview === "approved" },
  { id: "finance-delivery-approved", passes: (inputs) => inputs.financeDeliveryReview === "approved" },
  { id: "evidence-readiness-approved", passes: (inputs) => inputs.evidenceReadiness === "approved" },
  { id: "human-bid-approval-retained", passes: (inputs) => inputs.humanBidApproval === "approved" }
];

function hasOpportunityInput(inputs: PublicSectorOpportunityInputs) {
  return (
    inputs.officialNotice !== "unknown" ||
    inputs.deadline !== "unknown" ||
    inputs.scopeFit !== "unknown" ||
    inputs.applicableRegistration !== "unknown" ||
    inputs.programEligibility !== "unknown" ||
    inputs.solicitationCompliance !== "not-started" ||
    inputs.securityPrivacyReview !== "not-started" ||
    inputs.financeDeliveryReview !== "not-started" ||
    inputs.evidenceReadiness !== "not-started" ||
    inputs.humanBidApproval !== "not-started" ||
    inputs.requiresLivePhi ||
    inputs.requiresAutonomousClinicalAction ||
    inputs.requiresEhrWriteback ||
    inputs.requiresPayerSubmission
  );
}

export function evaluatePublicSectorOpportunity(
  inputs: PublicSectorOpportunityInputs
): PublicSectorOpportunityAssessment {
  const passedGateIds = opportunityGateChecks
    .filter((gate) => gate.passes(inputs))
    .map((gate) => gate.id);
  const missingGateIds = opportunityGateChecks
    .filter((gate) => !gate.passes(inputs))
    .map((gate) => gate.id);
  const hardStops: string[] = [];

  if (inputs.deadline === "closed") hardStops.push("The authoritative opportunity deadline is closed.");
  if (inputs.scopeFit === "low") hardStops.push("The opportunity has low verified fit with SCRIMED's current sellable scope.");
  if (inputs.programEligibility === "not-eligible") hardStops.push("Program eligibility is not satisfied.");
  if (inputs.officialNotice === "expired") hardStops.push("The retained opportunity notice is stale or expired.");
  if (inputs.applicableRegistration === "expired") hardStops.push("The applicable registration evidence is expired.");
  if (inputs.requiresLivePhi) hardStops.push("The opportunity requires live PHI authority SCRIMED does not currently hold.");
  if (inputs.requiresAutonomousClinicalAction) hardStops.push("The opportunity requires autonomous clinical authority that SCRIMED prohibits.");
  if (inputs.requiresEhrWriteback) hardStops.push("The opportunity requires production EHR writeback that remains blocked.");
  if (inputs.requiresPayerSubmission) hardStops.push("The opportunity requires autonomous payer submission that remains blocked.");
  if ([inputs.solicitationCompliance, inputs.securityPrivacyReview, inputs.financeDeliveryReview, inputs.evidenceReadiness, inputs.humanBidApproval].includes("rejected")) {
    hardStops.push("At least one mandatory human review rejected the opportunity or proposal path.");
  }

  const coreGateIds = new Set([
    "official-notice-current",
    "deadline-open",
    "scope-fit-supported",
    "applicable-registration-current",
    "program-eligibility-verified"
  ]);
  const coreGatesPass = [...coreGateIds].every((gateId) => passedGateIds.includes(gateId));
  const allGatesPass = missingGateIds.length === 0;
  const hasInput = hasOpportunityInput(inputs);

  let decision: PublicSectorOpportunityDecision;
  if (!hasInput) decision = "input-required";
  else if (hardStops.length > 0) decision = "blocked-no-bid";
  else if (allGatesPass) decision = "ready-for-human-submission-review";
  else if (coreGatesPass) decision = "qualified-bid-review-required";
  else decision = "research-and-remediation-required";

  const reviewWarnings = [
    "A numerical score cannot override a failed registration, eligibility, safety, legal, security, finance, evidence, or human-approval gate.",
    "The evaluator stores no opportunity identifiers, registration identifiers, proposal text, pricing, credentials, or submission data.",
    "Current official instructions and opportunity amendments control; this internal model is not legal or procurement advice."
  ];

  return {
    decision,
    externalSubmissionAuthorized: false,
    contractAwardAuthority: "not-contract-award",
    grantAwardAuthority: "not-grant-award",
    registrationAuthority: "not-registration-verification",
    certificationAuthority: "not-certification-verification",
    completedGateCount: passedGateIds.length,
    totalGateCount: opportunityGateChecks.length,
    missingGateIds,
    hardStops,
    reviewWarnings,
    nextAction:
      decision === "input-required"
        ? "Select a real opportunity lane and enter only nonconfidential readiness states verified by named owners."
        : decision === "blocked-no-bid"
          ? "Stop proposal work. A named owner must resolve the hard stop or record a no-bid disposition."
          : decision === "research-and-remediation-required"
            ? "Verify the official notice, current registration, eligibility, deadline, and mission fit before spending proposal resources."
            : decision === "qualified-bid-review-required"
              ? "Complete solicitation, security/privacy, finance/delivery, evidence, and named human bid reviews."
              : "Bind the exact proposal fingerprint to an authorized human review in the official external submission system; SCRIMED does not submit it."
  };
}

export function getCapitalAcquisitionReadinessSummary() {
  const defaultAssessment = evaluatePublicSectorOpportunity(publicSectorOpportunityInputTemplate);
  const federalContractReadiness = getFederalContractReadinessSummary();
  const federalContractOfficialSources = officialReadinessSources.filter((source) =>
    federalContractOfficialSourceIds.includes(source.id as (typeof federalContractOfficialSourceIds)[number])
  );

  return {
    status: capitalAcquisitionReadinessStatus,
    version: capitalAcquisitionReadinessVersion,
    boundary: capitalAcquisitionReadinessBoundary,
    officialSourceCount: officialReadinessSources.length,
    capitalAccessLaneCount: capitalAccessLanes.length,
    publicSectorLaneCount: capitalAccessLanes.filter((lane) =>
      ["federal-prime-contract", "federal-subcontracting", "federal-grant", "sbir-sttr", "state-local-public-sector"].includes(lane.id)
    ).length,
    readinessGateCount: publicSectorReadinessGates.length,
    submissionBlockingGateCount: publicSectorReadinessGates.filter((gate) => gate.blocksSubmission).length,
    defaultAssessment,
    authority: {
      registrationsVerified: false,
      certificationsVerified: false,
      eligibilityVerified: false,
      pastPerformanceVerified: false,
      governmentAwardVerified: false,
      externalSubmissionAuthorized: false,
      investorSolicitationAuthorized: false
    },
    federalContractReadiness: {
      ...federalContractReadiness,
      officialSources: federalContractOfficialSources
    },
    officialReadinessSources,
    capitalAccessLanes,
    publicSectorReadinessGates,
    nextAction:
      "Complete founder and counsel-reviewed fundraising evidence in the existing diligence manifest; in parallel, assign an authorized SAM.gov administrator, work through the federal registration readiness checkpoints, and qualify one authoritative opportunity through the weakest-link workbench before proposal spend."
  };
}
