import { getApprovalsReadinessSummary } from "../approvalsReadiness";
import { getGlobalCertificationReadinessSummary } from "../globalCertificationReadiness";
import { createAuditHash } from "../scrimed-work";

export type ApprovalAuthorityType =
  | "automated-technical-gate"
  | "internal-human-approval"
  | "qualified-external-review"
  | "regulator-or-certification-body"
  | "buyer-specific-authority";

export type ApprovalAchievementStatus =
  | "achieved-automated-technical"
  | "evidence-complete-awaiting-human-signoff"
  | "evidence-build-active"
  | "external-review-required"
  | "blocked-before-scope-change";

export type ApprovalEvidence = {
  id: string;
  label: string;
  status: "passed" | "present-review-required" | "missing" | "not-applicable";
  evidenceReference: string;
  checkedAt: string;
  expiresAt: string;
};

export type ApprovalNode = {
  id: string;
  title: string;
  authorityType: ApprovalAuthorityType;
  jurisdiction: string;
  status: ApprovalAchievementStatus;
  priority: "now" | "next" | "strategic" | "scope-triggered";
  dependsOn: string[];
  unlocks: string[];
  commercialValue: string;
  accountableOwners: string[];
  externalAuthority: string | null;
  evidence: ApprovalEvidence[];
  missingEvidence: string[];
  requiredHumanSignoffs: string[];
  nextAction: string;
  safeCurrentMotion: string;
  blockedActions: string[];
  refreshCadence: string;
  approvalClaimAllowed: boolean;
  auditHash: string;
};

const evidenceCheckedAt = "2026-07-11T00:00:00.000Z";
const technicalEvidenceExpiresAt = "2026-07-18T00:00:00.000Z";

const technicalEvidence: ApprovalEvidence[] = [
  { id: "control-plane-contract", label: "Control-plane contract", status: "passed", evidenceReference: "node scripts/scrimed-control-plane-contract-check.mjs: 27 files verified", checkedAt: evidenceCheckedAt, expiresAt: technicalEvidenceExpiresAt },
  { id: "nonsecret-suite", label: "Full nonsecret suite", status: "passed", evidenceReference: "node scripts/scrimed-nonsecret-test-suite.mjs", checkedAt: evidenceCheckedAt, expiresAt: technicalEvidenceExpiresAt },
  { id: "typecheck", label: "TypeScript typecheck", status: "passed", evidenceReference: "node node_modules/typescript/bin/tsc --noEmit", checkedAt: evidenceCheckedAt, expiresAt: technicalEvidenceExpiresAt },
  { id: "lint", label: "ESLint", status: "passed", evidenceReference: "node node_modules/eslint/bin/eslint.js .", checkedAt: evidenceCheckedAt, expiresAt: technicalEvidenceExpiresAt },
  { id: "build", label: "Next.js production build", status: "passed", evidenceReference: "445 static/generated pages built", checkedAt: evidenceCheckedAt, expiresAt: technicalEvidenceExpiresAt },
  { id: "compiled-smoke", label: "Compiled control-plane smoke", status: "passed", evidenceReference: "read surfaces passed; unauthenticated POST paths failed closed", checkedAt: evidenceCheckedAt, expiresAt: technicalEvidenceExpiresAt },
  { id: "workspace-hygiene", label: "Generated integrity and workspace hygiene", status: "passed", evidenceReference: "generated integrity, workspace hygiene, and git diff checks", checkedAt: evidenceCheckedAt, expiresAt: technicalEvidenceExpiresAt }
];

function approvalNode(input: Omit<ApprovalNode, "auditHash">): ApprovalNode {
  return { ...input, auditHash: createAuditHash(input) };
}

function missing(label: string): ApprovalEvidence {
  return {
    id: label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    label,
    status: "missing",
    evidenceReference: "No approved evidence reference recorded.",
    checkedAt: evidenceCheckedAt,
    expiresAt: "not-started"
  };
}

function reviewEvidence(id: string, label: string, reference: string): ApprovalEvidence {
  return {
    id,
    label,
    status: "present-review-required",
    evidenceReference: reference,
    checkedAt: evidenceCheckedAt,
    expiresAt: "approval-dependent"
  };
}

export const approvalSourceSnapshot = [
  {
    id: "hhs-security-rule",
    authority: "HHS OCR",
    checkedAt: "2026-07-11",
    url: "https://www.hhs.gov/hipaa/for-professionals/security/hipaa-security-rule-nprm/index.html",
    currentSignal: "The current HIPAA Security Rule remains in effect while the cybersecurity strengthening rule remains a proposal.",
    scrimedAction: "Maintain current-rule readiness and track the proposal without representing proposed controls as final law."
  },
  {
    id: "fda-cds-2026",
    authority: "U.S. FDA",
    checkedAt: "2026-07-11",
    url: "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software",
    currentSignal: "FDA issued final Clinical Decision Support Software guidance in January 2026.",
    scrimedAction: "Obtain qualified intended-use and CDS/device classification before expanding patient-specific clinical claims."
  },
  {
    id: "onc-hti",
    authority: "ASTP/ONC",
    checkedAt: "2026-07-11",
    url: "https://healthit.gov/regulations/hti-rules/",
    currentSignal: "HTI-1 through HTI-4 final-rule materials and current certification criteria affect algorithm transparency, USCDI, TEFCA, prescribing, and prior authorization scope.",
    scrimedAction: "Create a connector-specific certification decision memo; do not infer ONC certification from FHIR or HL7 conformance."
  },
  {
    id: "eu-ai-act",
    authority: "European Commission",
    checkedAt: "2026-07-11",
    url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
    currentSignal: "AI Act obligations are phased and implementation dates remain subject to current adopted law and active simplification measures.",
    scrimedAction: "Require current EU counsel confirmation, AI-system role mapping, risk classification, transparency, human oversight, logging, and technical documentation before EU launch."
  },
  {
    id: "nhs-dtac",
    authority: "NHS England",
    checkedAt: "2026-07-11",
    url: "https://www.england.nhs.uk/long-read/medical-devices-and-digital-tools/",
    currentSignal: "DTAC is a baseline procurement assessment spanning clinical safety, data protection, technical security, interoperability, usability, and accessibility.",
    scrimedAction: "Prepare a buyer-specific DTAC evidence pack; do not treat readiness mapping as NHS approval."
  },
  {
    id: "australia-essential-eight",
    authority: "Australian Signals Directorate / ACSC",
    checkedAt: "2026-07-11",
    url: "https://www.cyber.gov.au/resources-business-and-government/essential-cyber-security/essential-eight",
    currentSignal: "Essential Eight provides baseline cyber mitigation and maturity guidance rather than a universal healthcare certification.",
    scrimedAction: "Map controls to buyer-required maturity and obtain local privacy, hosting, procurement, and health-sector review."
  }
] as const;

const technicalGateAchieved = technicalEvidence.every((item) => item.status === "passed");

export const approvalAchievementGraph: ApprovalNode[] = [
  approvalNode({
    id: "automated-no-phi-technical-quality-gate",
    title: "No-PHI Control Plane Automated Technical Quality Gate",
    authorityType: "automated-technical-gate",
    jurisdiction: "Internal engineering",
    status: technicalGateAchieved ? "achieved-automated-technical" : "evidence-build-active",
    priority: "now",
    dependsOn: [],
    unlocks: ["internal synthetic demonstrations", "engineering diligence evidence", "review of the proposed Intended Use Memo"],
    commercialValue: "Provides reproducible technical evidence for demos and diligence without implying production, clinical, privacy, or regulatory approval.",
    accountableOwners: ["Platform Engineering", "Security Engineering", "Release Engineering"],
    externalAuthority: null,
    evidence: technicalEvidence,
    missingEvidence: technicalGateAchieved ? [] : technicalEvidence.filter((item) => item.status !== "passed").map((item) => item.label),
    requiredHumanSignoffs: [],
    nextAction: "Rerun the full gate after material source changes and before every protected pilot release candidate.",
    safeCurrentMotion: "Use as internal, date-bounded technical evidence for synthetic/no-PHI demos and diligence.",
    blockedActions: ["production approval", "PHI processing", "clinical authority", "certification claim", "customer go-live"],
    refreshCadence: "Every material change and at least weekly while the worktree remains active.",
    approvalClaimAllowed: false
  }),
  approvalNode({
    id: "intended-use-internal-approval",
    title: "SCRIMED Intended Use Internal Approval",
    authorityType: "internal-human-approval",
    jurisdiction: "Company-wide",
    status: "evidence-complete-awaiting-human-signoff",
    priority: "next",
    dependsOn: ["automated-no-phi-technical-quality-gate"],
    unlocks: ["one source of truth for website, demos, decks, sales, investor diligence, and pilot scoping"],
    commercialValue: "Reduces claim inconsistency, shortens buyer review, and protects credibility across every sales and investor channel.",
    accountableOwners: ["Founder/CEO", "Product", "Legal reviewer", "Clinical governance reviewer"],
    externalAuthority: null,
    evidence: [
      reviewEvidence("intended-use-memo", "Proposed Intended Use Memo", "docs/SCRIMED_INTENDED_USE_MEMO.md"),
      reviewEvidence("intended-use-review-packet", "Controlled Intended Use review packet", "/approvals-readiness#intended-use-review-workbench"),
      reviewEvidence("claims-boundary", "Claims and safety boundary", "/claims and /qa-claim-guard"),
      reviewEvidence("technical-gate", "Automated technical gate", "automated-no-phi-technical-quality-gate")
    ],
    missingEvidence: ["Founder/CEO approval", "qualified legal review", "clinical governance review", "versioned effective date and review expiry"],
    requiredHumanSignoffs: ["Founder/CEO", "Legal reviewer", "Clinical governance reviewer"],
    nextAction: "Review and sign the proposed memo, record reviewer identities and dates outside source code, then align public copy and sales assets to the approved version.",
    safeCurrentMotion: "Use the memo as a proposed internal draft while operations-first and synthetic-only language remains authoritative.",
    blockedActions: ["expanded clinical claims", "PHI claims", "medical-device claims", "autonomous-care claims"],
    refreshCadence: "Quarterly and whenever product scope, claims, data use, or jurisdiction changes.",
    approvalClaimAllowed: false
  }),
  approvalNode({
    id: "no-phi-protected-pilot-release",
    title: "No-PHI Protected Pilot Internal Release",
    authorityType: "internal-human-approval",
    jurisdiction: "Buyer-specific",
    status: "evidence-build-active",
    priority: "next",
    dependsOn: ["intended-use-internal-approval", "automated-no-phi-technical-quality-gate"],
    unlocks: ["buyer-specific synthetic pilot execution", "controlled proof packet", "measured workflow baseline"],
    commercialValue: "Creates the fastest defensible path to paid pilots, referenceable outcomes, and enterprise procurement evidence.",
    accountableOwners: ["Founder/CEO", "Pilot Lead", "Security", "Privacy", "Clinical Governance", "Buyer Sponsor"],
    externalAuthority: "Buyer sponsor and buyer security/privacy authorities",
    evidence: [reviewEvidence("pilot-package", "Synthetic pilot package", "/pilot-demo-commercial-readiness"), reviewEvidence("release-control", "Buyer release control", "/buyer-release-control-run"), missing("Buyer-approved statement of work and acceptance criteria"), missing("Named security, privacy, and clinical reviewers")],
    missingEvidence: ["approved Intended Use Memo", "buyer scope and success metrics", "named reviewer signoffs", "strict AAL2 protected-write smoke", "no-PHI canary evidence"],
    requiredHumanSignoffs: ["Founder/CEO", "Pilot Lead", "Security", "Privacy", "Clinical Governance", "Buyer Sponsor"],
    nextAction: "Complete Intended Use approval, strict nonproduction AAL2 smoke, buyer scope, reviewer assignments, and no-PHI canary packet.",
    safeCurrentMotion: "Sell no-PHI discovery, workflow assessment, synthetic demos, and readiness services while protected execution remains gated.",
    blockedActions: ["live PHI", "production connector", "customer go-live", "patient outreach", "payer submission", "EHR writeback"],
    refreshCadence: "Per buyer and per pilot release.",
    approvalClaimAllowed: false
  }),
  approvalNode({
    id: "hipaa-baa-phi-readiness",
    title: "HIPAA/BAA and Production PHI Readiness",
    authorityType: "qualified-external-review",
    jurisdiction: "United States",
    status: "external-review-required",
    priority: "strategic",
    dependsOn: ["intended-use-internal-approval", "no-phi-protected-pilot-release"],
    unlocks: ["contractually approved PHI scope after technical and buyer controls"],
    commercialValue: "Required for many health-system enterprise workloads, but not needed to sell synthetic assessments and no-PHI pilots now.",
    accountableOwners: ["Privacy", "Security", "Legal", "Operations"],
    externalAuthority: "Qualified healthcare privacy counsel and each covered-entity customer",
    evidence: [missing("HIPAA security risk analysis"), missing("safeguard and data-flow map"), missing("BAA/DPA and subprocessor review"), missing("incident and breach tabletop"), missing("customer authorization")],
    missingEvidence: ["risk analysis", "policy and safeguard evidence", "BAA/DPA path", "vendor review", "customer authorization"],
    requiredHumanSignoffs: ["Privacy Officer", "Security Officer", "Healthcare counsel", "Customer authority"],
    nextAction: "Commission a formal HIPAA readiness assessment while continuing to prohibit PHI in current product flows.",
    safeCurrentMotion: "Continue synthetic/no-PHI commercial services and provide a transparent readiness roadmap.",
    blockedActions: ["production PHI processing", "HIPAA certification claim", "BAA execution claim without signature"],
    refreshCadence: "At least annually and after material system, vendor, threat, or data-flow change.",
    approvalClaimAllowed: false
  }),
  approvalNode({
    id: "soc2-independent-assurance",
    title: "SOC 2 Independent Assurance",
    authorityType: "regulator-or-certification-body",
    jurisdiction: "United States / Global buyer assurance",
    status: "external-review-required",
    priority: "strategic",
    dependsOn: ["automated-no-phi-technical-quality-gate", "intended-use-internal-approval"],
    unlocks: ["stronger enterprise security diligence", "faster procurement with issued report"],
    commercialValue: "High buyer-confidence leverage for Microsoft-, NVIDIA-, OpenAI-, Apple-, Micron-, payer-, and health-system-grade diligence.",
    accountableOwners: ["Security", "Engineering", "Operations", "External CPA firm"],
    externalAuthority: "Independent licensed CPA firm",
    evidence: [missing("SOC 2 readiness assessment"), missing("control owner map"), missing("evidence collection period"), missing("management assertions"), missing("issued report")],
    missingEvidence: ["readiness assessment", "control remediation", "evidence window", "external examination"],
    requiredHumanSignoffs: ["Executive owner", "Security owner", "External CPA"],
    nextAction: "Select a readiness assessor, scope Security/Availability/Confidentiality first, and begin evidence collection without claiming attestation.",
    safeCurrentMotion: "Share control mappings and dated readiness evidence under appropriate confidentiality controls.",
    blockedActions: ["SOC 2 certified claim", "issued-report claim", "customer assurance claim without report scope"],
    refreshCadence: "Continuous controls; examination period and report cadence set with auditor.",
    approvalClaimAllowed: false
  }),
  approvalNode({
    id: "fda-cds-device-classification",
    title: "FDA CDS/Device Classification",
    authorityType: "qualified-external-review",
    jurisdiction: "United States",
    status: "external-review-required",
    priority: "scope-triggered",
    dependsOn: ["intended-use-internal-approval"],
    unlocks: ["approved clinical claim strategy or deliberate non-device CDS boundary"],
    commercialValue: "Protects differentiation and clinical credibility while preventing accidental regulated-device claims.",
    accountableOwners: ["Product", "Clinical Governance", "Regulatory Counsel"],
    externalAuthority: "Qualified digital-health regulatory counsel and FDA pathway if required",
    evidence: [reviewEvidence("fda-guidance", "January 2026 FDA CDS final guidance", "approvalSourceSnapshot:fda-cds-2026"), missing("module-by-module intended-purpose classification"), missing("hazard and human-factors analysis"), missing("regulatory recommendation")],
    missingEvidence: ["qualified classification memo", "module claims map", "clinical evidence plan if regulated"],
    requiredHumanSignoffs: ["Regulatory counsel", "Clinical governance", "Founder/CEO"],
    nextAction: "Keep current functions decision-support/draft-only and obtain a module-level classification memo before clinical claims expand.",
    safeCurrentMotion: "Sell operational intelligence, synthetic evaluation, documentation support, and clinician-governed workflow preparation.",
    blockedActions: ["diagnosis", "treatment selection", "prescribing", "final imaging interpretation", "FDA clearance claim"],
    refreshCadence: "Whenever intended use, user, output, autonomy, or clinical claim changes.",
    approvalClaimAllowed: false
  }),
  approvalNode({
    id: "onc-hti-connector-decision",
    title: "ONC/HTI and Connector Certification Decision",
    authorityType: "qualified-external-review",
    jurisdiction: "United States",
    status: "external-review-required",
    priority: "scope-triggered",
    dependsOn: ["intended-use-internal-approval", "no-phi-protected-pilot-release"],
    unlocks: ["connector-specific certification or marketplace path where applicable"],
    commercialValue: "Turns FHIR, HL7, DICOM, X12, RIS, HIS, and PACS capability into credible integration evidence without overclaiming certification.",
    accountableOwners: ["Interoperability", "Security", "Product", "Customer Integration"],
    externalAuthority: "Applicable ONC-ACB, EHR marketplace, network, payer, or customer authority",
    evidence: [reviewEvidence("hti-current", "Current HTI rule snapshot", "approvalSourceSnapshot:onc-hti"), reviewEvidence("conformance", "Synthetic conformance evidence", "/interoperability/evaluations"), missing("target connector certification decision memo"), missing("customer sandbox acceptance")],
    missingEvidence: ["one selected connector target", "certification applicability memo", "sandbox acceptance", "production monitoring and rollback"],
    requiredHumanSignoffs: ["Interoperability lead", "Security", "Customer integration authority"],
    nextAction: "Select one revenue-linked connector, define whether certification applies, and complete a synthetic customer sandbox acceptance plan.",
    safeCurrentMotion: "Demonstrate synthetic FHIR/HL7/DICOM/X12 conformance and integration architecture without live exchange claims.",
    blockedActions: ["ONC certification claim", "EHR marketplace approval claim", "production writeback", "live patient matching"],
    refreshCadence: "Per connector, standard version, customer, and regulatory update.",
    approvalClaimAllowed: false
  }),
  approvalNode({
    id: "eu-ai-gdpr-regional-release",
    title: "EU AI Act/GDPR Regional Release",
    authorityType: "qualified-external-review",
    jurisdiction: "European Union",
    status: "external-review-required",
    priority: "strategic",
    dependsOn: ["intended-use-internal-approval", "soc2-independent-assurance"],
    unlocks: ["EU buyer diligence and region-specific deployment after legal/technical decisions"],
    commercialValue: "Creates a defensible path to European health-system and life-sciences buyers without premature conformity claims.",
    accountableOwners: ["EU Legal", "Privacy/DPO", "AI Governance", "Security", "Clinical Governance"],
    externalAuthority: "EU counsel, data-protection authority or notified body where applicable, and customer procurement",
    evidence: [reviewEvidence("eu-current", "Current EU AI Act implementation snapshot", "approvalSourceSnapshot:eu-ai-act"), missing("provider/deployer and risk-role map"), missing("GDPR lawful basis and DPIA"), missing("DPA/SCC and residency decision"), missing("human oversight and technical documentation")],
    missingEvidence: ["current legal classification", "DPIA", "data transfer mechanism", "regional deployment profile", "buyer approval"],
    requiredHumanSignoffs: ["EU counsel", "DPO/Privacy", "Security", "Clinical governance", "Buyer authority"],
    nextAction: "Run a no-personal-data EU discovery assessment and commission current legal classification before regional launch language.",
    safeCurrentMotion: "Market no-PHI discovery and synthetic readiness services with explicit regional limitations.",
    blockedActions: ["GDPR compliance assurance", "EU AI Act conformity claim", "CE mark claim", "EU production launch"],
    refreshCadence: "At every material EU legal update and before each regional release.",
    approvalClaimAllowed: false
  }),
  approvalNode({
    id: "uk-nhs-dtac-release",
    title: "UK NHS DTAC/MHRA Buyer Release",
    authorityType: "buyer-specific-authority",
    jurisdiction: "United Kingdom",
    status: "external-review-required",
    priority: "strategic",
    dependsOn: ["intended-use-internal-approval", "soc2-independent-assurance"],
    unlocks: ["UK buyer procurement assessment after product-specific evidence"],
    commercialValue: "Supports NHS and private-provider diligence across clinical safety, security, privacy, interoperability, accessibility, and usability.",
    accountableOwners: ["UK Clinical Safety", "Privacy", "Security", "Interoperability", "Accessibility"],
    externalAuthority: "Commissioning NHS organization, MHRA where applicable, and UK privacy authorities",
    evidence: [reviewEvidence("dtac-current", "Current NHS DTAC signal", "approvalSourceSnapshot:nhs-dtac"), missing("product-specific DTAC pack"), missing("DCB0129 clinical safety case"), missing("UK GDPR/ICO review"), missing("buyer assessment")],
    missingEvidence: ["DTAC evidence", "clinical safety file", "privacy/security review", "buyer-specific acceptance"],
    requiredHumanSignoffs: ["Clinical Safety Officer", "DPO/Privacy", "Security", "Buyer authority"],
    nextAction: "Build a product-specific DTAC evidence index and obtain UK clinical-safety classification before buyer submission.",
    safeCurrentMotion: "Offer synthetic UK readiness workshops and interoperability evidence reviews.",
    blockedActions: ["NHS approval claim", "DTAC passed claim", "MHRA approval claim", "UK production launch"],
    refreshCadence: "Per buyer assessment and product release.",
    approvalClaimAllowed: false
  }),
  approvalNode({
    id: "australia-health-procurement-release",
    title: "Australia Essential Eight and Health Procurement Release",
    authorityType: "buyer-specific-authority",
    jurisdiction: "Australia",
    status: "external-review-required",
    priority: "strategic",
    dependsOn: ["intended-use-internal-approval", "soc2-independent-assurance"],
    unlocks: ["Australian health-sector and public-sector buyer assessment after local review"],
    commercialValue: "Builds a credible regional path through cyber maturity, hosting, privacy, procurement, interoperability, and buyer governance.",
    accountableOwners: ["Security", "Privacy", "Regional Legal", "Interoperability", "Buyer Sponsor"],
    externalAuthority: "Australian buyer, privacy, procurement, and health-sector authorities as applicable",
    evidence: [reviewEvidence("essential-eight-current", "Current Essential Eight source snapshot", "approvalSourceSnapshot:australia-essential-eight"), missing("target maturity assessment"), missing("Australian privacy and hosting decision"), missing("health procurement and buyer acceptance")],
    missingEvidence: ["maturity mapping", "privacy/hosting review", "regional legal review", "buyer-specific acceptance"],
    requiredHumanSignoffs: ["Security", "Regional legal/privacy", "Buyer authority"],
    nextAction: "Choose a target buyer profile and map current controls to the required Essential Eight maturity and health procurement evidence.",
    safeCurrentMotion: "Offer synthetic regional discovery and cyber/interoperability readiness assessments.",
    blockedActions: ["Australian government approval claim", "Essential Eight certification claim", "regional production launch"],
    refreshCadence: "Per maturity-model update, deployment profile, buyer, and release.",
    approvalClaimAllowed: false
  }),
  approvalNode({
    id: "faithcore-faith-health-pilot-governance",
    title: "FaithCore Faith-Health Pilot Governance",
    authorityType: "buyer-specific-authority",
    jurisdiction: "Per faith-based health organization",
    status: "evidence-build-active",
    priority: "next",
    dependsOn: ["intended-use-internal-approval", "no-phi-protected-pilot-release"],
    unlocks: ["faith-hospital and faith-clinic synthetic pilot pathway", "values-aligned governance workshop"],
    commercialValue: "Differentiates SCRIMED through respectful institution-specific governance while retaining clinical, privacy, accessibility, and non-discrimination standards.",
    accountableOwners: ["FaithCore Lead", "Clinical Governance", "Ethics/Chaplaincy Reviewer", "Privacy", "Buyer Sponsor"],
    externalAuthority: "Named faith-health organization governance and clinical authorities",
    evidence: [missing("organization-specific values and ethics charter"), missing("clinical-independence and non-discrimination review"), missing("patient choice and accessibility safeguards"), missing("buyer-approved synthetic pilot scope")],
    missingEvidence: ["faith organization charter", "clinical governance signoff", "patient-choice safeguards", "buyer approval"],
    requiredHumanSignoffs: ["FaithCore Lead", "Clinical Governance", "Ethics/Chaplaincy Reviewer", "Buyer Sponsor"],
    nextAction: "Prepare one organization-specific FaithCore governance charter and synthetic workflow workshop for named human review.",
    safeCurrentMotion: "Offer values-aligned discovery, governance, education, and synthetic workflow assessment without religious, clinical, or outcome claims.",
    blockedActions: ["religious endorsement claim", "clinical-priority override", "discriminatory routing", "patient coercion", "live-care activation"],
    refreshCadence: "Per institution, community, workflow, and pilot release.",
    approvalClaimAllowed: false
  }),
  approvalNode({
    id: "buyer-specific-proof-release",
    title: "Buyer-Specific Proof Release",
    authorityType: "buyer-specific-authority",
    jurisdiction: "Per recipient",
    status: "evidence-build-active",
    priority: "next",
    dependsOn: ["intended-use-internal-approval", "no-phi-protected-pilot-release"],
    unlocks: ["controlled diligence packet sharing", "customer-approved case-study pathway"],
    commercialValue: "Converts platform proof into sales velocity while preserving confidentiality, claims integrity, and recipient control.",
    accountableOwners: ["Founder/CEO", "Sales", "Legal", "Security", "Release Steward"],
    externalAuthority: "Named buyer recipient and buyer authority",
    evidence: [reviewEvidence("release-runbook", "Buyer Release Control Runbook", "/buyer-release-control-run"), missing("recipient-specific approval"), missing("access expiry and revocation"), missing("release decision and log reconciliation")],
    missingEvidence: ["named recipient", "approved packet scope", "reviewer signoffs", "access control", "post-share reconciliation"],
    requiredHumanSignoffs: ["Founder/CEO", "Legal", "Security", "Release Steward", "Buyer recipient"],
    nextAction: "Complete one buyer-specific release packet through the protected runbook without public distribution.",
    safeCurrentMotion: "Use public no-PHI demonstrations and generic diligence materials that contain no customer claims.",
    blockedActions: ["unapproved external sharing", "customer logo or testimonial", "public case study", "confidential artifact distribution"],
    refreshCadence: "Per packet, recipient, and access window.",
    approvalClaimAllowed: false
  })
];

export function evaluateApprovalAchievement(node: ApprovalNode, recordedHumanSignoffs: string[] = []) {
  const evidenceReady = node.evidence.every((item) => item.status === "passed" || item.status === "present-review-required" || item.status === "not-applicable");
  const humanReady = node.requiredHumanSignoffs.every((role) => recordedHumanSignoffs.includes(role));
  const automated = node.authorityType === "automated-technical-gate";
  const achieved = automated && evidenceReady && node.missingEvidence.length === 0;

  return {
    nodeId: node.id,
    achieved,
    evidenceReady,
    humanReady,
    externalAuthorityStillRequired: !automated,
    canAutoPromote: automated,
    claimAllowed: false,
    decision: achieved ? "achieved-within-technical-scope" : evidenceReady && !humanReady ? "awaiting-human-or-external-authority" : "evidence-incomplete",
    auditHash: createAuditHash({ nodeId: node.id, evidenceReady, humanReady, achieved })
  };
}

export function getApprovalAchievementSummary() {
  const approvals = getApprovalsReadinessSummary();
  const global = getGlobalCertificationReadinessSummary();
  const evaluations = approvalAchievementGraph.map((node) => evaluateApprovalAchievement(node));
  const achievedTechnical = evaluations.filter((item) => item.achieved).length;
  const nextApproval = approvalAchievementGraph.find((node) => node.id === "intended-use-internal-approval")!;

  return {
    service: "scrimed-approval-achievement-engine",
    status: "one-automated-technical-gate-achieved-human-and-external-approvals-pending",
    technicalGateAchieved,
    achievedTechnicalGateCount: achievedTechnical,
    humanOrExternalApprovalCount: approvalAchievementGraph.filter((node) => node.authorityType !== "automated-technical-gate").length,
    humanOrExternalApprovalsAchieved: 0,
    nodes: approvalAchievementGraph,
    evaluations,
    criticalPath: [
      "automated-no-phi-technical-quality-gate",
      "intended-use-internal-approval",
      "no-phi-protected-pilot-release",
      "hipaa-baa-phi-readiness or regional release only when scope requires",
      "buyer-specific-proof-release"
    ],
    nextApprovalCandidate: {
      id: nextApproval.id,
      title: nextApproval.title,
      whyNext: "The technical evidence and proposed memo exist; only named founder, legal, and clinical governance review can complete it.",
      requiredSignoffs: nextApproval.requiredHumanSignoffs,
      exactNextAction: nextApproval.nextAction,
      estimatedPath: "One focused review cycle; no automatic approval or completion-date guarantee."
    },
    officialSourceSnapshot: approvalSourceSnapshot,
    sourceReadinessStatus: approvals.status,
    globalReadinessStatus: global.status,
    revenueNow: [
      "no-PHI workflow assessments",
      "synthetic demonstrations",
      "governance and interoperability readiness",
      "clinical robustness evaluation",
      "buyer diligence preparation",
      "protected no-PHI pilot preparation"
    ],
    retainedBoundary: "An automated technical gate is not legal, privacy, clinical, regulatory, security-assurance, buyer, PHI, production, or customer go-live approval.",
    auditHash: createAuditHash({ graph: approvalAchievementGraph.map((node) => node.auditHash), technicalGateAchieved })
  };
}
