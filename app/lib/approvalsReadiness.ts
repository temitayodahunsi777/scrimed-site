export type ApprovalTrackStatus =
  | "public-operations-ready"
  | "evidence-build-required"
  | "external-review-required"
  | "blocked-before-approval";

export type ApprovalTrack = {
  key: string;
  name: string;
  status: ApprovalTrackStatus;
  operatingGoal: string;
  currentBoundary: string;
  safeWorkaround: string;
  requiredEvidence: string[];
  nextAction: string;
  accountableOwners: string[];
  proofRoutes: string[];
};

export type ApprovalAgentControl = {
  agent: string;
  mission: string;
  allowedNow: string[];
  blockedActions: string[];
  evidenceOutput: string;
  humanCheckpoint: string;
};

export type ApprovalProcess = {
  phase: string;
  objective: string;
  entryCriteria: string[];
  exitCriteria: string[];
  hardStop: string;
};

export type ApprovalSourceReference = {
  name: string;
  sourceType: "official-government" | "assurance-standard" | "internal-control";
  url?: string;
  sourceCheckedAt: string;
  readinessImplication: string;
};

export const approvalsReadinessStatus = "approvals-readiness-operating-ladder-active";
export const approvalsReadinessBriefStatus = "approvals-readiness-brief-no-approval-claim";
export const approvalsReadinessUpdatedAt = "2026-06-23";

export const approvalsReadinessBoundary =
  "SCRIMED Approvals Readiness organizes public operating posture, HIPAA/BAA preparation, SOC 2 and HITRUST readiness, FDA/CDS/SaMD classification, ONC and connector certification planning, state care-delivery review, and buyer-specific release evidence. It does not grant legal approval, HIPAA compliance certification, SOC 2/HITRUST certification, FDA clearance, ONC certification, reimbursement certainty, PHI processing authority, production connector approval, public customer permission, or live clinical care authority.";

export const approvalTracks: ApprovalTrack[] = [
  {
    key: "public-claims-boundary",
    name: "Public claims and intended-use boundary",
    status: "public-operations-ready",
    operatingGoal:
      "Keep SCRIMED publicly sellable as healthcare operations intelligence, governed synthetic pilots, evidence organization, and buyer diligence.",
    currentBoundary:
      "Public copy cannot claim diagnosis, treatment, clinical triage, PHI processing, compliance certification, reimbursement certainty, production connector approval, or live clinical care.",
    safeWorkaround:
      "Use operations-first language and route regulated claims through Claim Guard, Boundary Resolution, and qualified release authority.",
    requiredEvidence: [
      "Approved Intended Use Memo",
      "Claims register with allowed, evidence-required, and prohibited language",
      "Qualified reviewer sign-off for customer-specific or public claims"
    ],
    nextAction:
      "Create the first founder-approved Intended Use Memo and use it as the source of truth for website, deck, demo, and buyer-room language.",
    accountableOwners: ["Founder", "Product", "Legal reviewer", "Clinical governance reviewer"],
    proofRoutes: ["/claims", "/boundary-resolution", "/qa-claim-guard", "/public-market-readiness"]
  },
  {
    key: "hipaa-baa-security-rule",
    name: "HIPAA, BAA, and Security Rule readiness",
    status: "evidence-build-required",
    operatingGoal:
      "Prepare SCRIMED to handle healthcare buyer diligence and future PHI/ePHI scopes without enabling PHI by default.",
    currentBoundary:
      "SCRIMED does not currently claim HIPAA compliance certification or production PHI processing authority.",
    safeWorkaround:
      "Keep public/product flows synthetic-only or metadata-only while building risk analysis, safeguards, BAA/DPA, breach, access, and vendor evidence.",
    requiredEvidence: [
      "HIPAA Security Risk Analysis",
      "Administrative, physical, and technical safeguard map",
      "BAA/DPA templates or written non-PHI determination",
      "Breach notification and incident response process",
      "Subprocessor and vendor-risk register"
    ],
    nextAction:
      "Stand up a HIPAA readiness evidence room with policy owners, risk register, access review cadence, incident runbook, and BAA/DPA templates.",
    accountableOwners: ["Privacy", "Security", "Legal", "Operations"],
    proofRoutes: ["/trust-center", "/trust-safety-operations", "/pilot-workspace/access", "/clinical-authority-readiness"]
  },
  {
    key: "soc2-hitrust-security-assurance",
    name: "SOC 2, HITRUST, and security assurance",
    status: "evidence-build-required",
    operatingGoal:
      "Create a buyer-trust path from readiness controls to independent assurance evidence.",
    currentBoundary:
      "SCRIMED has security and procurement readiness surfaces, but it is not SOC 2 certified, HITRUST certified, ISO certified, FedRAMP authorized, or penetration-test approved unless issued evidence exists.",
    safeWorkaround:
      "Use a readiness packet, control inventory, audit logs, vendor-risk responses, and no-sensitive-artifact references before formal attestation.",
    requiredEvidence: [
      "SOC 2 readiness assessment and control owner map",
      "Security, availability, confidentiality, privacy, and change-management control evidence",
      "Penetration-test scope and remediation evidence when required",
      "HITRUST target-level decision after SOC 2 readiness",
      "Customer vendor-risk acceptance record"
    ],
    nextAction:
      "Run SOC 2 readiness first, collect 60 to 90 days of control evidence, then choose SOC 2 Type I/Type II timing and HITRUST i1/r2 only when buyer demand justifies it.",
    accountableOwners: ["Security", "Operations", "Engineering", "External auditor"],
    proofRoutes: ["/trust-safety-operations", "/public-market-readiness", "/pilot-workspace/access"]
  },
  {
    key: "fda-cds-samd-classification",
    name: "FDA CDS/SaMD classification",
    status: "external-review-required",
    operatingGoal:
      "Keep clinical-regulatory exposure controlled while deciding whether any SCRIMED function should intentionally pursue regulated clinical authority.",
    currentBoundary:
      "SCRIMED must not make patient-specific diagnosis, treatment, triage, or autonomous clinical action claims before intended-use and FDA classification review.",
    safeWorkaround:
      "Frame current product as operations intelligence and synthetic evaluation; keep clinical outputs draft-only, transparent, and human-reviewed.",
    requiredEvidence: [
      "Intended Use Memo",
      "Clinical decision support criteria analysis",
      "SaMD risk classification memo",
      "Human factors, transparency, validation, and hazard analysis plan",
      "FDA Q-Submission or regulatory counsel recommendation if regulated"
    ],
    nextAction:
      "Hire a digital-health regulatory advisor to classify SCRIMED modules before clinical claims, patient-specific pilots, or medical-device language are used.",
    accountableOwners: ["Product", "Regulatory advisor", "Clinical governance", "Legal"],
    proofRoutes: ["/clinical-authority-readiness", "/clinical-care-activation", "/trust-os", "/workflows"]
  },
  {
    key: "onc-interoperability-connectors",
    name: "ONC, interoperability, and connector approval",
    status: "external-review-required",
    operatingGoal:
      "Prepare connector, EHR, FHIR, HL7, DICOM, X12, and health IT claims without implying certification or live exchange authority.",
    currentBoundary:
      "Synthetic conformance kits do not equal ONC certification, EHR marketplace approval, payer connection approval, or production data exchange authority.",
    safeWorkaround:
      "Use synthetic fixtures, connector contracts, conformance evidence, and partner/customer acceptance gates before live integration.",
    requiredEvidence: [
      "Target connector scope and purpose-of-use map",
      "FHIR/HL7/DICOM/X12 conformance evidence",
      "Customer sandbox test plan",
      "EHR, payer, marketplace, or certification-body acceptance where required",
      "Monitoring, reconciliation, least-privilege, and rollback plan"
    ],
    nextAction:
      "Pick one connector path and build a certification/marketplace decision memo before claiming certified health IT or production integration.",
    accountableOwners: ["Interoperability", "Security", "Customer integration", "Platform partner"],
    proofRoutes: ["/interoperability", "/interoperability/evaluations", "/integrations", "/deployment-profiles"]
  },
  {
    key: "state-care-delivery-and-telehealth",
    name: "State care-delivery and telehealth review",
    status: "blocked-before-approval",
    operatingGoal:
      "Prevent product, agent, or workflow expansion from accidentally becoming unauthorized care delivery.",
    currentBoundary:
      "SCRIMED does not provide care, prescribe, contact patients, route emergencies, employ clinical judgment, or operate as a telehealth provider.",
    safeWorkaround:
      "Keep workflows as enterprise operations planning and clinician-reviewed support until care-delivery counsel, licensed governance, and customer approval exist.",
    requiredEvidence: [
      "State-by-state clinical practice and telehealth review if care delivery is introduced",
      "Corporate practice of medicine analysis where relevant",
      "Licensed clinician role model and malpractice coverage review",
      "Patient consent, emergency escalation, and adverse-event policies",
      "Customer clinical operating procedure and shutdown authority"
    ],
    nextAction:
      "Keep this track blocked and only reopen it after the Intended Use Memo deliberately includes care-delivery scope.",
    accountableOwners: ["Healthcare counsel", "Clinical governance", "Operations", "Customer sponsor"],
    proofRoutes: ["/clinical-care-activation", "/clinical-authority-readiness", "/operations"]
  },
  {
    key: "buyer-specific-release-chain",
    name: "Buyer-specific release chain",
    status: "evidence-build-required",
    operatingGoal:
      "Convert protected proof into shareable buyer evidence only after external approvals, release decisions, reviewers, recipient controls, and audit logs are retained.",
    currentBoundary:
      "Buyer diligence can use protected no-PHI evidence, but buyer-specific external sharing is blocked until release-control gates are satisfied.",
    safeWorkaround:
      "Use the protected Buyer Release Control Runbook, verifier, remediation plan, metadata drafts, and checklist without bypassing AAL2 or human review.",
    requiredEvidence: [
      "Retained Buyer Diligence Export audit",
      "External approval evidence references",
      "Versioned release decision",
      "Named reviewer sign-offs",
      "Recipient attestations and access-log reconciliation"
    ],
    nextAction:
      "Complete the buyer release-control chain before any customer-specific public proof, case study, distribution, or external room sharing.",
    accountableOwners: ["Founder", "Sales", "Legal reviewer", "Security reviewer"],
    proofRoutes: ["/buyer-release-control-run", "/pilot-workspace/access", "/qa-buyer-proof-release"]
  }
];

export const approvalAgentControls: ApprovalAgentControl[] = [
  {
    agent: "Claim Guard Agent",
    mission:
      "Prevents sales, investor, PR, website, and operator language from crossing into unsupported regulated claims.",
    allowedNow: ["Classify claims", "Route review triggers", "Suggest operations-first wording"],
    blockedActions: ["Approve public claims", "Claim certification", "Claim live clinical authority"],
    evidenceOutput: "Allowed/evidence-required/prohibited claim decision with retained gate.",
    humanCheckpoint: "Founder or qualified reviewer approval before public release."
  },
  {
    agent: "Approval Evidence Router",
    mission:
      "Maps every future approval artifact to the right external system of record and stores only safe metadata references.",
    allowedNow: ["Create evidence checklists", "Track owner labels", "Track expiration and renewal posture"],
    blockedActions: ["Store PHI", "Store signed sensitive artifacts", "Treat metadata references as approval"],
    evidenceOutput: "No-PHI evidence route, owner, status, expiration, and renewal action.",
    humanCheckpoint: "Legal/security/privacy review before artifact retention or external sharing."
  },
  {
    agent: "Regulatory Classification Agent",
    mission:
      "Keeps intended-use and FDA/CDS/SaMD classification questions visible before clinical language enters product or sales motion.",
    allowedNow: ["Prepare classification questions", "Compare intended-use boundaries", "Identify review triggers"],
    blockedActions: ["Provide legal/regulatory opinion", "Submit to FDA", "Approve clinical claims"],
    evidenceOutput: "Classification memo draft inputs and trigger list for qualified advisor review.",
    humanCheckpoint: "Digital-health regulatory advisor sign-off."
  },
  {
    agent: "Security Assurance Agent",
    mission:
      "Organizes SOC 2/HITRUST readiness evidence and routes gaps to owners.",
    allowedNow: ["Map controls", "Track evidence freshness", "Flag missing audit artifacts"],
    blockedActions: ["Claim certification", "Issue audit opinion", "Accept customer vendor risk"],
    evidenceOutput: "Control owner map, missing evidence, and readiness sequence.",
    humanCheckpoint: "External auditor or customer vendor-risk acceptance."
  },
  {
    agent: "Buyer Release Steward",
    mission:
      "Sequences buyer-specific release gates without bypassing AAL2, qualified review, recipient control, or audit logging.",
    allowedNow: ["Read verifier status", "Generate remediation plans", "Prepare safe metadata drafts"],
    blockedActions: ["Approve release", "Share externally", "Store recipient lists or raw logs"],
    evidenceOutput: "Gate status, blocked items, next action, and packet route.",
    humanCheckpoint: "Named reviewer and release authority sign-off."
  }
];

export const approvalProcesses: ApprovalProcess[] = [
  {
    phase: "1. Public operations launch",
    objective: "Operate publicly with operations-first language and synthetic evidence.",
    entryCriteria: ["Claims register active", "No PHI", "No clinical authority claims", "Public smoke passes"],
    exitCriteria: ["Approved Intended Use Memo", "Release-control owner assigned"],
    hardStop: "Any diagnosis, treatment, triage, HIPAA certified, FDA cleared, SOC 2 certified, or PHI-ready claim without evidence."
  },
  {
    phase: "2. Healthcare trust foundation",
    objective: "Prepare HIPAA, BAA, security, privacy, incident, and vendor-risk evidence.",
    entryCriteria: ["Security owner assigned", "Data boundary documented", "Subprocessor register started"],
    exitCriteria: ["Risk analysis complete", "BAA/DPA templates ready", "Incident and breach runbooks approved"],
    hardStop: "No production PHI/ePHI or customer credentials before signed authorization."
  },
  {
    phase: "3. Independent assurance",
    objective: "Move from internal controls to SOC 2/HITRUST-ready external evidence.",
    entryCriteria: ["Control inventory", "Audit log evidence", "Change management", "Access reviews"],
    exitCriteria: ["SOC 2 readiness complete", "Audit scope selected", "Evidence window retained"],
    hardStop: "No certification claim before issued report and scoped customer acceptance."
  },
  {
    phase: "4. Clinical/regulatory classification",
    objective: "Decide whether any module intentionally enters FDA/CDS/SaMD or care-delivery review.",
    entryCriteria: ["Narrow intended use", "Human-review model", "Output transparency", "Hazard analysis draft"],
    exitCriteria: ["Qualified regulatory classification memo", "Submission/no-submission decision", "Claim language approved"],
    hardStop: "No patient-specific clinical recommendation or medical-device claim before review."
  },
  {
    phase: "5. Buyer-specific controlled release",
    objective: "Release buyer proof only through retained reviewer, recipient, access, and audit gates.",
    entryCriteria: ["Retained packet evidence", "External approval references", "Named reviewers", "Recipient controls"],
    exitCriteria: ["Versioned release decision", "Access-log reconciliation", "Buyer-safe packet retained"],
    hardStop: "No external sharing, public case study, customer permission claim, or production connector claim before release authority."
  }
];

export const approvalSourceReferences: ApprovalSourceReference[] = [
  {
    name: "FDA Clinical Decision Support Software Guidance",
    sourceType: "official-government",
    url: "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software",
    sourceCheckedAt: approvalsReadinessUpdatedAt,
    readinessImplication:
      "Intended use, transparency, user role, and independent clinical review determine whether CDS stays outside device regulation or needs medical-device review."
  },
  {
    name: "FDA How to Study and Market Your Device",
    sourceType: "official-government",
    url: "https://www.fda.gov/medical-devices/device-advice-comprehensive-regulatory-assistance/how-study-and-market-your-device",
    sourceCheckedAt: approvalsReadinessUpdatedAt,
    readinessImplication:
      "If a SCRIMED function becomes a device, classification and the correct premarket pathway come before marketing regulated claims."
  },
  {
    name: "HHS Covered Entities and Business Associates",
    sourceType: "official-government",
    url: "https://www.hhs.gov/hipaa/for-professionals/covered-entities/index.html",
    sourceCheckedAt: approvalsReadinessUpdatedAt,
    readinessImplication:
      "Healthcare customers may require SCRIMED to operate as a business associate with written contract terms and direct HIPAA obligations."
  },
  {
    name: "HHS HIPAA Security Rule Summary",
    sourceType: "official-government",
    url: "https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html",
    sourceCheckedAt: approvalsReadinessUpdatedAt,
    readinessImplication:
      "Administrative, physical, and technical safeguards plus risk analysis are the trust foundation before ePHI processing."
  },
  {
    name: "ONC Health IT Certification Program",
    sourceType: "official-government",
    url: "https://healthit.gov/certification-health-it/about-onc-health-it-certification-program/",
    sourceCheckedAt: approvalsReadinessUpdatedAt,
    readinessImplication:
      "Certified health IT and interoperability claims require certification criteria, test methods, and applicable acceptance evidence."
  },
  {
    name: "AICPA SOC Suite of Services",
    sourceType: "assurance-standard",
    url: "https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services",
    sourceCheckedAt: approvalsReadinessUpdatedAt,
    readinessImplication:
      "SOC reports provide independent assurance over system-level controls; SCRIMED should complete readiness before audit."
  },
  {
    name: "SCRIMED protected release and boundary systems",
    sourceType: "internal-control",
    sourceCheckedAt: approvalsReadinessUpdatedAt,
    readinessImplication:
      "Current controls support public operations, synthetic evaluation, no-PHI evidence, protected release gates, and future approvals preparation, not final approval."
  }
];

export function getApprovalsReadinessSummary() {
  const publicReadyCount = approvalTracks.filter((track) => track.status === "public-operations-ready").length;
  const evidenceBuildCount = approvalTracks.filter((track) => track.status === "evidence-build-required").length;
  const externalReviewCount = approvalTracks.filter((track) => track.status === "external-review-required").length;
  const blockedBeforeApprovalCount = approvalTracks.filter((track) => track.status === "blocked-before-approval").length;

  return {
    service: "scrimed-approvals-readiness",
    route: "/approvals-readiness",
    apiRoute: "/api/approvals-readiness",
    briefRoute: "/api/approvals-readiness/brief",
    status: approvalsReadinessStatus,
    briefStatus: approvalsReadinessBriefStatus,
    authorizationStatus: "public-operations-only-no-regulated-approval",
    clinicalCareAuthority: "not-authorized-live-care",
    phiAuthority: "not-authorized-production-phi",
    securityCertification: "not-security-certified",
    regulatoryAuthority: "external-review-required",
    reimbursementAuthority: "no-reimbursement-guarantee",
    boundary: approvalsReadinessBoundary,
    trackCount: approvalTracks.length,
    publicReadyCount,
    evidenceBuildCount,
    externalReviewCount,
    blockedBeforeApprovalCount,
    agentControlCount: approvalAgentControls.length,
    processCount: approvalProcesses.length,
    sourceReferenceCount: approvalSourceReferences.length,
    tracks: approvalTracks,
    agentControls: approvalAgentControls,
    processes: approvalProcesses,
    sourceReferences: approvalSourceReferences,
    nextOperatorActions: [
      "Use operations-first language as the default public launch posture.",
      "Create a founder-approved Intended Use Memo before expanding claims.",
      "Build HIPAA/BAA and SOC 2 readiness evidence before accepting PHI or certification requests.",
      "Route FDA/CDS/SaMD questions to qualified regulatory review before clinical claims.",
      "Keep buyer-specific release evidence gated behind protected AAL2 workflows and named human review."
    ],
    updated: approvalsReadinessUpdatedAt
  };
}

export function buildApprovalsReadinessBrief() {
  const summary = getApprovalsReadinessSummary();

  return [
    "# SCRIMED Approvals Readiness Brief",
    "",
    `Status: ${summary.status}`,
    `Authorization status: ${summary.authorizationStatus}`,
    `Clinical care authority: ${summary.clinicalCareAuthority}`,
    `PHI authority: ${summary.phiAuthority}`,
    `Security certification: ${summary.securityCertification}`,
    `Regulatory authority: ${summary.regulatoryAuthority}`,
    `Reimbursement authority: ${summary.reimbursementAuthority}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is not legal advice, regulatory approval, HIPAA certification, SOC 2 certification, HITRUST certification, FDA clearance, ONC certification, reimbursement advice, PHI processing approval, or live clinical authorization.",
    "",
    "## Approval Tracks",
    ...summary.tracks.map(
      (track) =>
        `- ${track.name} (${track.status}): ${track.operatingGoal} Boundary: ${track.currentBoundary} Workaround: ${track.safeWorkaround} Next: ${track.nextAction}`
    ),
    "",
    "## Agent Controls",
    ...summary.agentControls.map(
      (control) =>
        `- ${control.agent}: ${control.mission} Output: ${control.evidenceOutput} Human checkpoint: ${control.humanCheckpoint}`
    ),
    "",
    "## Processes",
    ...summary.processes.map(
      (process) =>
        `- ${process.phase}: ${process.objective} Exit: ${process.exitCriteria.join("; ")} Hard stop: ${process.hardStop}`
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
