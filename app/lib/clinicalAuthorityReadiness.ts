export type ClinicalAuthorityDomainKey =
  | "live-clinical-care-authority"
  | "phi-processing-authority"
  | "legal-contracting-approval"
  | "regional-regulatory-approval"
  | "reimbursement-policy-approval"
  | "security-certification-procurement"
  | "production-clinical-authorization"
  | "certified-health-it-connector-approval";

export type ClinicalAuthorityDomain = {
  key: ClinicalAuthorityDomainKey;
  name: string;
  status:
    | "contained-with-workaround"
    | "customer-specific-required"
    | "external-approval-required"
    | "blocked-before-approval";
  currentBoundary: string;
  preparationNow: string;
  requiredEvidence: string[];
  retainedGate: string;
  safeWorkaround: string;
  accountableOwners: string[];
  proofRoutes: string[];
};

export type ClinicalAuthorityWorkstream = {
  name: string;
  objective: string;
  currentSCRIMEDEvidence: string[];
  missingBeforeClearance: string[];
  nextOperatorAction: string;
};

export type ClinicalAuthoritySourceReference = {
  name: string;
  sourceType: "official-government" | "internal-control";
  url?: string;
  sourceCheckedAt: string;
  readinessImplication: string;
};

export type ClinicalAuthorityOperatingMode = {
  mode: string;
  permittedNow: boolean;
  entryCriteria: string[];
  blockedUntil: string[];
  operatorInstruction: string;
};

export type ClinicalAuthorityEvidencePack = {
  name: string;
  purpose: string;
  route: string;
  packetRoute?: string;
  boundary: string;
};

export type ClinicalAuthorityBoundaryResolution = {
  boundary: string;
  riskIfIgnored: string;
  resolution: string;
  retainedGate: string;
  status: "contained-with-workaround";
};

export const clinicalAuthorityReadinessStatus =
  "clinical-authority-readiness-hard-gates-contained";

export const clinicalAuthorityReadinessBriefStatus =
  "clinical-authority-readiness-brief-no-authority-claim";

export const clinicalAuthorityUpdatedAt = "2026-06-20";

export const clinicalAuthorityBoundary =
  "SCRIMED Clinical Authority Readiness prepares the company for live clinical care authority, PHI processing, legal approval, regional regulatory approval, reimbursement review, security certification, and production clinical authorization. It does not grant any of those authorities. SCRIMED remains synthetic-only and review-gated until signed customer scope, qualified counsel review, privacy/security approval, licensed clinical governance, reimbursement policy review, security certification evidence, regional approval, connector validation, incident response, rollback, monitoring, and explicit go-live approval are complete.";

export const clinicalAuthorityDomains: ClinicalAuthorityDomain[] = [
  {
    key: "live-clinical-care-authority",
    name: "Live clinical care authority",
    status: "blocked-before-approval",
    currentBoundary:
      "SCRIMED may demonstrate synthetic workflow intelligence and readiness planning, but it may not deliver care, triage emergencies, diagnose, treat, prescribe, order, or communicate patient instructions.",
    preparationNow:
      "Clinical-care gates, Trust Cards, blocked capability lists, human-review controls, and protected clinical activation dossiers are available for review.",
    requiredEvidence: [
      "Named licensed clinical governance board or medical director",
      "Approved intended-use statement and care-setting scope",
      "Clinical safety case with hazard log and escalation policy",
      "Prospective pilot protocol and reviewer rubric",
      "Customer go-live approver list and rollback plan"
    ],
    retainedGate:
      "No patient-impacting workflow until licensed clinical sign-off and customer go-live approval are recorded.",
    safeWorkaround:
      "Sell synthetic pilot evaluation, workflow intelligence assessment, and draft-only clinician-reviewed planning.",
    accountableOwners: ["Clinical governance", "Product", "Legal", "Customer clinical sponsor"],
    proofRoutes: ["/clinical-care-activation", "/pilot-workspace/access", "/trust-os"]
  },
  {
    key: "phi-processing-authority",
    name: "PHI and ePHI processing authority",
    status: "customer-specific-required",
    currentBoundary:
      "Public routes, demos, smoke checks, and readiness packets remain synthetic-only or metadata-only. No live patient identifiers, payer member records, or production clinical records are authorized.",
    preparationNow:
      "Protected workspaces, AAL2 gates, audit logs, evidence-room metadata controls, provider security review, and procurement evidence registry are in place.",
    requiredEvidence: [
      "BAA or written non-PHI determination",
      "Data processing agreement where applicable",
      "Data classification and retention schedule",
      "Encryption, key management, deletion, backup, and legal hold procedures",
      "HIPAA Security Rule risk analysis and safeguard mapping"
    ],
    retainedGate:
      "No PHI, ePHI, patient record, payer member data, or production credential enters SCRIMED until legal and privacy/security authorization is signed.",
    safeWorkaround:
      "Use synthetic fixtures, de-identified data only when contract-approved, and no-sensitive-artifact evidence links.",
    accountableOwners: ["Privacy", "Security", "Legal", "Customer compliance"],
    proofRoutes: ["/trust-center", "/public-market-readiness", "/pilot-workspace/access"]
  },
  {
    key: "legal-contracting-approval",
    name: "Legal approval and contracting authority",
    status: "customer-specific-required",
    currentBoundary:
      "SCRIMED materials can describe readiness, pilots, and retained gates. They are not legal advice, executed contracting authority, certification, or production authorization.",
    preparationNow:
      "Approved/prohibited claim controls, release decisions, named reviewer sign-offs, distribution lockbox, release authority attestations, and external approval evidence links are active.",
    requiredEvidence: [
      "Master services agreement and statement of work",
      "BAA/DPA or non-PHI determination",
      "Approved claims register",
      "Customer-specific service boundaries",
      "Advertising, PR, case-study, and public release approvals"
    ],
    retainedGate:
      "No public customer claim, live care claim, certified compliance claim, or production deployment claim without qualified release approval.",
    safeWorkaround:
      "Use controlled buyer packets with explicit boundaries and no public customer or certification claims.",
    accountableOwners: ["Legal", "Sales", "Founder", "Customer executive sponsor"],
    proofRoutes: ["/trust-center", "/public-market-readiness", "/global-reach"]
  },
  {
    key: "regional-regulatory-approval",
    name: "Regional regulatory approval",
    status: "external-approval-required",
    currentBoundary:
      "Global Reach maps priority regions and localization requirements, but it does not create regional legal, procurement, privacy, data-residency, or clinical authorization.",
    preparationNow:
      "Region packs, deployment profiles, sovereign-readiness posture, localization questions, and retained approval gates are organized.",
    requiredEvidence: [
      "Region-specific counsel review",
      "Data residency and cross-border transfer review",
      "Public-sector procurement path where applicable",
      "Localized patient, clinician, and buyer language review",
      "Qualified local implementation partner validation"
    ],
    retainedGate:
      "No production regional launch, government program claim, or local clinical deployment claim until the region-specific authority path is approved.",
    safeWorkaround:
      "Run synthetic executive evaluations and partner qualification without live data, public authority claims, or production integrations.",
    accountableOwners: ["Regional counsel", "Global partnerships", "Security", "Customer sponsor"],
    proofRoutes: ["/global-reach", "/deployment-profiles", "/market-activation"]
  },
  {
    key: "reimbursement-policy-approval",
    name: "Reimbursement, coverage, coding, and payer policy approval",
    status: "customer-specific-required",
    currentBoundary:
      "SCRIMED can support draft operational intelligence for prior authorization, denial risk, and revenue-cycle review, but it cannot guarantee reimbursement or submit claims without authorized human review.",
    preparationNow:
      "Finance methodology gates, KPI definitions, no-guarantee language, protected metric rollups, and public-market operating discipline are available.",
    requiredEvidence: [
      "CMS, payer, and local policy review for the specific workflow",
      "Coding and billing compliance review",
      "Revenue-cycle human reviewer assignment",
      "No-guarantee reimbursement language",
      "Customer-approved baseline, measurement window, and financial methodology"
    ],
    retainedGate:
      "No coverage determination, final coding, claim submission, denial appeal submission, or reimbursement claim without qualified review.",
    safeWorkaround:
      "Deliver denial-risk review, prior-authorization packet drafting, and revenue leakage analysis as human-reviewed draft support.",
    accountableOwners: ["Revenue cycle", "Finance", "Legal", "Customer operations"],
    proofRoutes: ["/public-market-readiness", "/pricing", "/pilot-deal-room"]
  },
  {
    key: "security-certification-procurement",
    name: "Security certification and procurement approval",
    status: "external-approval-required",
    currentBoundary:
      "SCRIMED has security-ready architecture evidence and protected review workflows, but it does not claim SOC 2, ISO, HITRUST, FedRAMP, penetration-test approval, or customer vendor-risk approval unless those artifacts are actually issued.",
    preparationNow:
      "Provider security review, procurement evidence registry, access-log reconciliation, Trust Safety Ops, incident workspaces, and audit packets are active.",
    requiredEvidence: [
      "Independent security assessment or certification scope",
      "Vendor-risk questionnaire completion",
      "Penetration-test and remediation evidence where requested",
      "Incident response, breach response, backup, recovery, and monitoring evidence",
      "Subprocessor, access review, change-management, and audit-control documentation"
    ],
    retainedGate:
      "No security certification, procurement approval, or production security acceptance claim without issued evidence and customer acceptance.",
    safeWorkaround:
      "Present readiness posture, control inventory, and no-sensitive-artifact evidence links while independent certification remains pending.",
    accountableOwners: ["Security", "Procurement", "Compliance", "Customer vendor-risk team"],
    proofRoutes: ["/trust-safety-operations", "/public-market-readiness", "/pilot-workspace/access"]
  },
  {
    key: "production-clinical-authorization",
    name: "Production clinical authorization",
    status: "blocked-before-approval",
    currentBoundary:
      "Production clinical execution is denied. No live workflow may write records, message patients, submit payer transactions, or affect clinical operations without final authorization.",
    preparationNow:
      "Customer activation approvals, production SSO readiness, buyer diligence room, command intelligence packets, and clinical activation approval workflow are linked.",
    requiredEvidence: [
      "Production go-live checklist and signed release decision",
      "Customer SSO and RBAC acceptance",
      "Connector validation and monitoring acceptance",
      "24/7 support, incident response, rollback, and escalation coverage",
      "Post-launch review cadence and shutdown authority"
    ],
    retainedGate:
      "No production tenant go-live until customer, clinical, legal, privacy, security, support, and SCRIMED release authority sign off.",
    safeWorkaround:
      "Use protected pilot rooms, command snapshots, and readiness packets to prepare the go-live decision without activating production care.",
    accountableOwners: ["Operations", "Security", "Clinical governance", "Customer executive sponsor"],
    proofRoutes: ["/pilot-workspace/access", "/clinical-care-activation", "/operations"]
  },
  {
    key: "certified-health-it-connector-approval",
    name: "Certified health IT and connector approval",
    status: "external-approval-required",
    currentBoundary:
      "SCRIMED can demonstrate synthetic FHIR, HL7, DICOM, X12, and EHR-readiness concepts, but it does not claim ONC certification, EHR marketplace approval, payer connection approval, or live connector certification.",
    preparationNow:
      "Interoperability standards registry, synthetic conformance kits, integration contracts, and deployment profile evidence are active.",
    requiredEvidence: [
      "Customer sandbox access and test plan",
      "FHIR, HL7, DICOM, X12, payer, or EHR-specific conformance results",
      "Interface monitoring and reconciliation plan",
      "Purpose-of-use and least-privilege connector policy",
      "EHR, payer, marketplace, or certification-body approval where applicable"
    ],
    retainedGate:
      "No production connector read, write, order, referral, claim, imaging retrieval, or record mutation until customer and platform approval are complete.",
    safeWorkaround:
      "Use synthetic conformance tests, fixture validation, and connector contracts with live connector actions denied.",
    accountableOwners: ["Interoperability", "Security", "Customer integration", "Platform partner"],
    proofRoutes: ["/interoperability", "/interoperability/evaluations", "/integrations/fixture-validation"]
  }
];

export const clinicalAuthorityWorkstreams: ClinicalAuthorityWorkstream[] = [
  {
    name: "Authority evidence packet",
    objective:
      "Bundle clinical, PHI, legal, regional, reimbursement, security, connector, and production gates into one buyer-reviewable authority packet.",
    currentSCRIMEDEvidence: [
      "Clinical Activation Dossier",
      "Protected External Approval Evidence",
      "Protected Procurement Evidence Registry",
      "Protected Provider Security Reviews"
    ],
    missingBeforeClearance: [
      "Actual signed approvals",
      "Customer-specific scope",
      "Qualified external review",
      "Issued certification artifacts where applicable"
    ],
    nextOperatorAction:
      "Use the protected workspace to collect metadata-only evidence links and reviewer status, not sensitive artifacts."
  },
  {
    name: "PHI processing launch track",
    objective:
      "Prepare the minimum path for legally authorized ePHI handling without enabling PHI by default.",
    currentSCRIMEDEvidence: [
      "AAL2 protected actions",
      "Tenant-scoped audit events",
      "No-sensitive-artifact evidence-room posture",
      "Synthetic-only smoke checks"
    ],
    missingBeforeClearance: [
      "BAA/DPA or non-PHI determination",
      "Risk analysis and safeguard map",
      "Data retention and deletion approval",
      "Customer security acceptance"
    ],
    nextOperatorAction:
      "Keep PHI disabled and create customer-specific data-flow diagrams during sales engineering."
  },
  {
    name: "Clinical safety and governance track",
    objective:
      "Convert clinical ambition into reviewer assignments, safety case evidence, and human authority controls.",
    currentSCRIMEDEvidence: [
      "Blocked clinical capability list",
      "Trust Cards",
      "Clinical activation gates",
      "Named reviewer sign-off workflow"
    ],
    missingBeforeClearance: [
      "Licensed medical director",
      "Clinical safety board charter",
      "Prospective validation protocol",
      "Emergency and adverse-event escalation policy"
    ],
    nextOperatorAction:
      "Recruit qualified clinical governance and lock a narrow intended-use statement before any patient-specific pilot."
  },
  {
    name: "Security certification and procurement track",
    objective:
      "Prepare certification and vendor-risk evidence without claiming certification before independent evidence exists.",
    currentSCRIMEDEvidence: [
      "Provider security review workbench",
      "Procurement evidence registry",
      "Evidence-room access log reconciliation",
      "Trust Safety Operations"
    ],
    missingBeforeClearance: [
      "External audit scope",
      "Control test evidence",
      "Penetration-test evidence if required",
      "Customer vendor-risk acceptance"
    ],
    nextOperatorAction:
      "Run a control-gap assessment and map current evidence to target frameworks before starting an audit."
  }
];

export const clinicalAuthoritySourceReferences: ClinicalAuthoritySourceReference[] = [
  {
    name: "HHS HIPAA Security Rule Summary",
    sourceType: "official-government",
    url: "https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html",
    sourceCheckedAt: clinicalAuthorityUpdatedAt,
    readinessImplication:
      "PHI/ePHI readiness must include administrative, physical, and technical safeguards, risk analysis, access review, and incident detection before production processing."
  },
  {
    name: "HHS Business Associate Contracts",
    sourceType: "official-government",
    url: "https://www.hhs.gov/hipaa/for-professionals/covered-entities/sample-business-associate-agreement-provisions/index.html",
    sourceCheckedAt: clinicalAuthorityUpdatedAt,
    readinessImplication:
      "A BAA path or non-PHI determination is a retained gate before SCRIMED can receive, maintain, transmit, or create PHI for a covered entity or business associate workflow."
  },
  {
    name: "FDA Clinical Decision Support Software Guidance",
    sourceType: "official-government",
    url: "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software",
    sourceCheckedAt: clinicalAuthorityUpdatedAt,
    readinessImplication:
      "Intended use, clinical claims, user role, output transparency, and medical-device boundaries must be reviewed before patient-specific clinical decision support claims."
  },
  {
    name: "ONC Health IT Certification Program",
    sourceType: "official-government",
    url: "https://healthit.gov/certification-health-it/",
    sourceCheckedAt: clinicalAuthorityUpdatedAt,
    readinessImplication:
      "Connector, certified-health-IT, and interoperability claims require conformance evidence and appropriate certification, marketplace, or customer acceptance where applicable."
  },
  {
    name: "NIST Cybersecurity Framework 2.0",
    sourceType: "official-government",
    url: "https://www.nist.gov/cyberframework",
    sourceCheckedAt: clinicalAuthorityUpdatedAt,
    readinessImplication:
      "Security certification preparation should map governance, identification, protection, detection, response, and recovery evidence before procurement or production claims."
  },
  {
    name: "CMS Medicare Coverage Determination Process",
    sourceType: "official-government",
    url: "https://www.cms.gov/medicare/coverage/determination-process",
    sourceCheckedAt: clinicalAuthorityUpdatedAt,
    readinessImplication:
      "Reimbursement and coverage claims must remain workflow-specific and policy-reviewed; SCRIMED should not guarantee coverage, payment, coding, or claim outcomes."
  },
  {
    name: "SCRIMED protected workspace, TrustOS, and clinical activation controls",
    sourceType: "internal-control",
    sourceCheckedAt: clinicalAuthorityUpdatedAt,
    readinessImplication:
      "Current product evidence supports synthetic pilot diligence, human review, auditability, protected packets, and retained gates, not live clinical authorization."
  }
];

export const clinicalAuthorityOperatingModes: ClinicalAuthorityOperatingMode[] = [
  {
    mode: "Governed synthetic evaluation",
    permittedNow: true,
    entryCriteria: [
      "Synthetic fixtures only",
      "Human review required",
      "No patient identifiers",
      "No production connectors"
    ],
    blockedUntil: ["None for current product boundary"],
    operatorInstruction:
      "Use this as the default sellable pilot and enterprise evaluation motion."
  },
  {
    mode: "De-identified or customer-approved shadow evaluation",
    permittedNow: false,
    entryCriteria: [
      "Written non-PHI or approved de-identification determination",
      "Customer data-flow approval",
      "Security and privacy review",
      "Reviewer rubric"
    ],
    blockedUntil: [
      "Customer-specific legal approval",
      "Privacy/security acceptance",
      "Validation protocol approval"
    ],
    operatorInstruction:
      "Prepare the packet now, but do not ingest data until the determination and scope are signed."
  },
  {
    mode: "Clinician-supervised prospective pilot",
    permittedNow: false,
    entryCriteria: [
      "Licensed clinical governance",
      "Clinical safety case",
      "Incident response and rollback",
      "Customer go-live approval"
    ],
    blockedUntil: [
      "Regulatory classification review",
      "Clinical protocol approval",
      "PHI and connector authorization where applicable"
    ],
    operatorInstruction:
      "Keep all outputs draft-only and human-reviewed; no autonomous clinical action."
  },
  {
    mode: "Production clinical execution",
    permittedNow: false,
    entryCriteria: [
      "All authority domains cleared",
      "Signed release decision",
      "Monitoring and shutdown authority",
      "Post-launch review cadence"
    ],
    blockedUntil: [
      "Customer, legal, privacy, security, clinical, reimbursement, regional, connector, and operational approvals"
    ],
    operatorInstruction:
      "Do not activate until every retained gate has an accountable signed approval record."
  }
];

export const clinicalAuthorityEvidencePacks: ClinicalAuthorityEvidencePack[] = [
  {
    name: "Protected clinical authority evidence room",
    purpose:
      "AAL2-protected no-PHI control plane that assembles reviewer owners, evidence links, expiration posture, retained gates, and audit history across every clinical authority hard gate.",
    route: "/pilot-workspace/access#clinical-authority-evidence-room",
    packetRoute: "/api/pilot-workspaces/{workspaceSlug}/clinical-authority-evidence-room/packet",
    boundary: "Protected metadata-only authority readiness; not clinical, legal, PHI, reimbursement, security, regional, connector, or production approval."
  },
  {
    name: "Clinical activation dossier",
    purpose:
      "Tenant-scoped no-PHI evidence packet for clinical go-live planning, reviewer assignments, unsigned approvals, and blocked capabilities.",
    route: "/pilot-workspace/access",
    packetRoute: "/api/pilot-workspaces/{workspaceSlug}/clinical-activation-dossier/packet",
    boundary: "AAL2-protected and no-PHI; not live clinical authorization."
  },
  {
    name: "External approval evidence",
    purpose:
      "Protected metadata-only evidence links for counsel, certification, buyer, clinical, security, and finance approval artifacts.",
    route: "/pilot-workspace/access",
    packetRoute: "/api/pilot-workspaces/{workspaceSlug}/external-approval-evidence/packet",
    boundary: "Stores evidence references and reviewer status, not sensitive source artifacts."
  },
  {
    name: "Provider security review",
    purpose:
      "Security and procurement readiness workbench for vendor-risk review, control evidence, and customer security questions.",
    route: "/pilot-workspace/access",
    packetRoute: "/api/pilot-workspaces/{workspaceSlug}/provider-security-reviews/packet",
    boundary: "Readiness evidence only; not security certification."
  },
  {
    name: "Procurement evidence registry",
    purpose:
      "Metadata-only registry for SOC, ISO, HITRUST, pentest, legal, privacy, and procurement artifacts before buyer review.",
    route: "/pilot-workspace/access",
    packetRoute: "/api/pilot-workspaces/{workspaceSlug}/procurement-evidence/packet",
    boundary: "No sensitive artifact storage and no certification claim."
  },
  {
    name: "Clinical authority readiness brief",
    purpose:
      "Public executive brief summarizing hard gates, safe workarounds, source references, and next operator actions.",
    route: "/clinical-authority-readiness",
    packetRoute: "/api/clinical-authority-readiness/brief",
    boundary: "Public readiness summary; not legal advice or production authorization."
  }
];

export const clinicalAuthorityBoundaryResolutions: ClinicalAuthorityBoundaryResolution[] = [
  {
    boundary: "Live clinical care authority",
    riskIfIgnored: "Unauthorized patient-impacting use, clinical harm, regulatory exposure, and buyer trust failure.",
    resolution:
      "Keep live care blocked and require intended-use review, licensed governance, safety case, validation protocol, and signed go-live approval.",
    retainedGate: "Licensed clinical sign-off and customer release decision.",
    status: "contained-with-workaround"
  },
  {
    boundary: "PHI processing",
    riskIfIgnored: "Unauthorized PHI exposure, privacy breach, contract breach, and security liability.",
    resolution:
      "Keep PHI disabled; use synthetic data, metadata-only evidence links, BAA/DPA path, data-flow approval, and safeguard mapping.",
    retainedGate: "Signed BAA/DPA or non-PHI determination plus security acceptance.",
    status: "contained-with-workaround"
  },
  {
    boundary: "Legal approval",
    riskIfIgnored: "Unapproved claims, scope mismatch, public misrepresentation, and contract exposure.",
    resolution:
      "Route claims, PR, case studies, public releases, and customer-specific statements through protected release authority workflows.",
    retainedGate: "Qualified legal and release-authority approval.",
    status: "contained-with-workaround"
  },
  {
    boundary: "Regional regulatory approval",
    riskIfIgnored: "Improper regional deployment, data-residency violations, procurement failure, or invalid public-sector claims.",
    resolution:
      "Use Global Reach for localization and regional readiness while requiring counsel, residency, procurement, and partner validation.",
    retainedGate: "Region-specific counsel and customer/procurement acceptance.",
    status: "contained-with-workaround"
  },
  {
    boundary: "Reimbursement certainty",
    riskIfIgnored: "Improper billing, false buyer expectations, payer disputes, and compliance risk.",
    resolution:
      "Keep reimbursement outputs draft-only and human-reviewed with no-guarantee language and policy-specific review.",
    retainedGate: "Revenue-cycle, legal, payer-policy, and customer approval.",
    status: "contained-with-workaround"
  },
  {
    boundary: "Security certification",
    riskIfIgnored: "False certification claims, procurement failure, and customer security rejection.",
    resolution:
      "Present readiness controls, evidence references, and gap mapping; do not claim SOC 2, ISO, HITRUST, FedRAMP, or pentest approval without issued evidence.",
    retainedGate: "Issued artifact, scoped assessment, and customer vendor-risk acceptance.",
    status: "contained-with-workaround"
  },
  {
    boundary: "Production clinical authorization",
    riskIfIgnored: "Unsafe go-live, record mutation errors, unsupported incidents, and uncontrolled rollout.",
    resolution:
      "Require final release decision, production SSO/RBAC, connector acceptance, monitoring, rollback, incident response, and post-launch review.",
    retainedGate: "All-domain go-live packet signed by SCRIMED and customer owners.",
    status: "contained-with-workaround"
  }
];

export function getClinicalAuthorityReadinessSummary() {
  const customerSpecificCount = clinicalAuthorityDomains.filter(
    (domain) => domain.status === "customer-specific-required"
  ).length;
  const externalApprovalCount = clinicalAuthorityDomains.filter(
    (domain) => domain.status === "external-approval-required"
  ).length;
  const blockedBeforeApprovalCount = clinicalAuthorityDomains.filter(
    (domain) => domain.status === "blocked-before-approval"
  ).length;
  const containedWithWorkaroundCount = clinicalAuthorityBoundaryResolutions.length;

  return {
    service: "scrimed-clinical-authority-readiness",
    route: "/clinical-authority-readiness",
    apiRoute: "/api/clinical-authority-readiness",
    briefRoute: "/api/clinical-authority-readiness/brief",
    status: clinicalAuthorityReadinessStatus,
    briefStatus: clinicalAuthorityReadinessBriefStatus,
    authorizationStatus: "not-authorized-live-clinical-care",
    phiStatus: "not-authorized-production-phi-processing",
    legalStatus: "external-counsel-and-contracting-required",
    regionalStatus: "region-specific-approval-required",
    reimbursementStatus: "no-reimbursement-guarantee",
    securityCertificationStatus: "not-security-certified",
    productionClinicalStatus: "production-clinical-authorization-blocked",
    dataBoundary: "synthetic-only",
    boundary: clinicalAuthorityBoundary,
    authorityDomainCount: clinicalAuthorityDomains.length,
    customerSpecificCount,
    externalApprovalCount,
    blockedBeforeApprovalCount,
    containedWithWorkaroundCount,
    domains: clinicalAuthorityDomains,
    workstreams: clinicalAuthorityWorkstreams,
    sourceReferences: clinicalAuthoritySourceReferences,
    operatingModes: clinicalAuthorityOperatingModes,
    evidencePacks: clinicalAuthorityEvidencePacks,
    boundaryResolutions: clinicalAuthorityBoundaryResolutions,
    nextOperatorActions: [
      "Keep all current buyer demos, public APIs, and pilot workflows synthetic-only or metadata-only.",
      "Use this readiness layer as the front door for hard-gate discussions with buyers, counsel, security, clinical governance, and reimbursement reviewers.",
      "Select one narrow intended use and care setting before any regulatory or clinical approval discussion.",
      "Prepare BAA/DPA, data-flow, risk-analysis, and safeguard mapping before any PHI request is accepted.",
      "Collect external approval evidence as protected metadata links, not sensitive documents, until the storage authority path is signed.",
      "Require signed release authority before any public claim, security certification claim, regional launch claim, reimbursement claim, or production clinical go-live."
    ],
    updated: clinicalAuthorityUpdatedAt
  };
}

export function buildClinicalAuthorityReadinessBrief() {
  const summary = getClinicalAuthorityReadinessSummary();

  return [
    "# SCRIMED Clinical Authority Readiness Brief",
    "",
    `Status: ${summary.status}`,
    `Authorization status: ${summary.authorizationStatus}`,
    `PHI status: ${summary.phiStatus}`,
    `Legal status: ${summary.legalStatus}`,
    `Regional status: ${summary.regionalStatus}`,
    `Reimbursement status: ${summary.reimbursementStatus}`,
    `Security certification status: ${summary.securityCertificationStatus}`,
    `Production clinical status: ${summary.productionClinicalStatus}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is not legal advice, privacy advice, reimbursement advice, security certification, clinical validation, regional regulatory approval, or live clinical authorization.",
    "",
    "## Authority Domains",
    ...summary.domains.map(
      (domain) =>
        `- ${domain.name} (${domain.status}): ${domain.currentBoundary} Preparation: ${domain.preparationNow} Retained gate: ${domain.retainedGate}`
    ),
    "",
    "## Boundary Resolutions",
    ...summary.boundaryResolutions.map(
      (resolution) =>
        `- ${resolution.boundary}: ${resolution.resolution} Gate: ${resolution.retainedGate}`
    ),
    "",
    "## Evidence Packs",
    ...summary.evidencePacks.map(
      (pack) => `- ${pack.name}: ${pack.route}${pack.packetRoute ? ` / ${pack.packetRoute}` : ""}. ${pack.boundary}`
    ),
    "",
    "## Operating Modes",
    ...summary.operatingModes.map(
      (mode) =>
        `- ${mode.mode}: permitted now = ${mode.permittedNow ? "yes" : "no"}. ${mode.operatorInstruction}`
    ),
    "",
    "## Source References",
    ...summary.sourceReferences.map((source) =>
      source.url
        ? `- ${source.name}: ${source.readinessImplication} ${source.url}`
        : `- ${source.name}: ${source.readinessImplication}`
    ),
    "",
    "## Next Operator Actions",
    ...summary.nextOperatorActions.map((action) => `- ${action}`)
  ].join("\n");
}
