export type ClinicalCareActivationGateStatus =
  | "foundation-ready"
  | "external-review-required"
  | "customer-specific"
  | "blocked";

export type ClinicalCareActivationGateCategory =
  | "regulatory"
  | "clinical-governance"
  | "privacy-security"
  | "identity-access"
  | "interoperability"
  | "safety-monitoring"
  | "legal-commercial"
  | "operations";

export type ClinicalCareActivationGate = {
  id: string;
  category: ClinicalCareActivationGateCategory;
  name: string;
  status: ClinicalCareActivationGateStatus;
  owner: string;
  evidence: string;
  requiredBefore: string;
  blockedCapabilities: string[];
  safeWorkaround: string;
};

export type ClinicalCareActivationCapability = {
  name: string;
  status: "authorized-current-boundary" | "blocked-before-clinical-go-live";
  boundary: string;
  proofRoute: string;
};

export type ClinicalCareActivationPhase = {
  phase: string;
  status: ClinicalCareActivationGateStatus;
  objective: string;
  requiredEvidence: string[];
  exitCriteria: string;
};

export type ClinicalCareActivationTrustCard = {
  outputClass: string;
  confidence: "high-for-boundary" | "not-clinically-validated";
  riskScore: "low" | "medium" | "high" | "critical";
  sourceAttribution: string[];
  validationTimestamp: string;
  reviewerStatus: string;
  humanReviewTrigger: string;
  auditEvent: string;
};

export type ClinicalCareActivationAuthority = {
  name: string;
  sourceType: "external-authority" | "internal-control";
  url?: string;
  currentAsOf: string;
  implication: string;
};

export const clinicalCareActivationProofStackStatus =
  "clinical-care-activation-readiness-gated";

export const clinicalCareActivationUpdatedAt = "2026-06-19";

export const clinicalCareActivationBoundary =
  "SCRIMED Clinical Care Activation Readiness prepares regulated clinical deployment, but it does not authorize live clinical care, PHI processing, diagnosis, treatment, order entry, patient outreach, emergency triage, medical-device use, payer submission, record mutation, or autonomous clinical execution. Production clinical care requires signed customer scope, BAA/DPA where applicable, privacy/security/legal review, regulatory classification, licensed clinical governance, validated human-review workflow, approved connectors, monitoring, incident response, rollback, and explicit customer go-live approval.";

export const clinicalCareSourceAuthorities: ClinicalCareActivationAuthority[] = [
  {
    name: "FDA Clinical Decision Support Software Guidance",
    sourceType: "external-authority",
    url: "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software",
    currentAsOf: "2026-01-29",
    implication:
      "SCRIMED must classify intended use and clinical decision-support boundaries before any clinical deployment claim."
  },
  {
    name: "HHS HIPAA Security Rule Summary",
    sourceType: "external-authority",
    url: "https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html",
    currentAsOf: "2026-06-19",
    implication:
      "SCRIMED must map administrative, physical, and technical safeguards before processing ePHI."
  },
  {
    name: "SCRIMED TrustOS, Product Console, and Protected Pilot Workspace",
    sourceType: "internal-control",
    currentAsOf: clinicalCareActivationUpdatedAt,
    implication:
      "Current product evidence supports governed synthetic pilots, audit trails, human review, protected operator workflows, and proof packets."
  }
];

export const clinicalCareActivationGates: ClinicalCareActivationGate[] = [
  {
    id: "intended-use-regulatory-classification",
    category: "regulatory",
    name: "Intended-use and regulatory classification review",
    status: "external-review-required",
    owner: "Regulatory counsel and clinical governance",
    evidence:
      "FDA CDS/SaMD boundary review, intended-use statement, public claim review, labeling scope, and product-risk memo.",
    requiredBefore: "Any clinical decision-support, diagnostic, treatment, or medical-device-like deployment claim.",
    blockedCapabilities: ["clinical decision support claims", "diagnosis support", "treatment recommendations"],
    safeWorkaround:
      "Keep outputs framed as operational intelligence, synthetic evaluation, draft support, or clinician-reviewed planning until classification is approved."
  },
  {
    id: "licensed-clinical-governance",
    category: "clinical-governance",
    name: "Licensed clinical governance board and accountable medical director",
    status: "blocked",
    owner: "Clinical governance",
    evidence:
      "Named licensed reviewers, approval charter, escalation policy, scope-specific protocols, and sign-off records.",
    requiredBefore: "Any care-team workflow that influences patient-specific clinical decisions.",
    blockedCapabilities: ["live patient triage", "care-plan recommendation", "clinical safety scoring"],
    safeWorkaround:
      "Run buyer demos and synthetic workflow reviews with clear non-clinical boundary language."
  },
  {
    id: "clinical-safety-case",
    category: "clinical-governance",
    name: "Clinical safety case, hazard analysis, and escalation model",
    status: "external-review-required",
    owner: "Clinical safety, legal, privacy, security, and product leadership",
    evidence:
      "Hazard log, unsafe-output taxonomy, clinician escalation policy, emergency boundary, safety acceptance criteria, and rollback plan.",
    requiredBefore: "Prospective clinical pilots, patient-specific risk prompts, or human-reviewed clinical workflows.",
    blockedCapabilities: ["patient-specific risk horizon prompts", "emergency guidance", "clinical escalation automation"],
    safeWorkaround:
      "Use TrustOS blocked-action traces and synthetic risk examples without patient-specific execution."
  },
  {
    id: "signed-customer-clinical-scope",
    category: "legal-commercial",
    name: "Signed customer clinical scope and care-setting authorization",
    status: "customer-specific",
    owner: "Enterprise sales, legal, customer sponsor, and clinical operations",
    evidence:
      "Executed statement of work, care-setting scope, allowed users, excluded workflows, pilot objectives, and go-live approvers.",
    requiredBefore: "Any customer-environment clinical pilot or production workflow.",
    blockedCapabilities: ["customer production pilot", "site-specific workflow execution", "customer go-live"],
    safeWorkaround:
      "Sell and deliver synthetic pilot evaluation, readiness assessment, governance audit, and implementation blueprint packages."
  },
  {
    id: "baa-dpa-privacy-review",
    category: "privacy-security",
    name: "BAA/DPA path, privacy notices, retention, residency, and processing register",
    status: "customer-specific",
    owner: "Privacy, legal, security, and customer compliance",
    evidence:
      "BAA or non-PHI determination, DPA where applicable, privacy notice review, retention schedule, data residency map, and processor register.",
    requiredBefore: "Any PHI, ePHI, payer member data, live clinical record, or patient identifier enters SCRIMED systems.",
    blockedCapabilities: ["PHI processing", "patient identifiers", "payer member data", "live clinical records"],
    safeWorkaround:
      "Keep public and pilot routes synthetic-only and metadata-only until the customer-specific data path is signed."
  },
  {
    id: "hipaa-security-safeguard-map",
    category: "privacy-security",
    name: "HIPAA Security Rule safeguard mapping",
    status: "external-review-required",
    owner: "Security, privacy, compliance, and qualified external reviewer",
    evidence:
      "Administrative, physical, and technical safeguard mapping; risk analysis; access controls; audit controls; transmission security; and contingency plan.",
    requiredBefore: "Any ePHI processing or production healthcare customer security review.",
    blockedCapabilities: ["ePHI workflows", "clinical data storage", "production tenant PHI processing"],
    safeWorkaround:
      "Use current TrustOS, protected workspace, audit, rate-limit, passkey/AAL2, and no-PHI controls as readiness evidence, not compliance certification."
  },
  {
    id: "production-identity-access",
    category: "identity-access",
    name: "Production identity, RBAC, AAL2/SSO, and access review",
    status: "foundation-ready",
    owner: "Security engineering and customer identity administrator",
    evidence:
      "Supabase Auth, passkey or magic-link sign-in, AAL2 gates for protected actions, tenant-admin checks, and access-review planning.",
    requiredBefore: "Customer users access protected clinical or operational workspaces.",
    blockedCapabilities: ["broad customer user onboarding", "patient-context access", "break-glass access"],
    safeWorkaround:
      "Continue protected synthetic pilots with tenant-admin AAL2 and explicit role boundaries while customer SSO remains gated."
  },
  {
    id: "phi-data-architecture",
    category: "privacy-security",
    name: "PHI-ready data architecture, encryption, deletion, legal hold, and regional controls",
    status: "blocked",
    owner: "Security architecture, privacy, platform engineering, and customer compliance",
    evidence:
      "Data classification, encryption/key management, DLP, malware scanning, deletion workflow, legal hold, residency, backup, and restore testing.",
    requiredBefore: "Any live clinical data persistence, evidence vault upload, or production workspace memory.",
    blockedCapabilities: ["clinical memory persistence", "medical-record storage", "evidence vault PHI upload"],
    safeWorkaround:
      "Keep evidence vault readiness metadata-only and disable sensitive document upload until signed controls exist."
  },
  {
    id: "connector-validation",
    category: "interoperability",
    name: "FHIR, HL7, DICOM, X12, payer, and EHR connector validation",
    status: "blocked",
    owner: "Interoperability engineering, customer integration team, and clinical operations",
    evidence:
      "Conformance testing, customer sandbox acceptance, interface monitoring, reconciliation, mapping review, purpose-of-use policy, and partner sign-off.",
    requiredBefore: "Any production connector reads, writes, orders, referrals, payer transactions, imaging retrieval, or record mutation.",
    blockedCapabilities: ["EHR writeback", "order entry", "referral submission", "claim submission", "imaging retrieval"],
    safeWorkaround:
      "Use deterministic synthetic conformance kits, integration fixtures, and connector contracts until a customer sandbox is approved."
  },
  {
    id: "human-authority-override",
    category: "clinical-governance",
    name: "Human authority model, reviewer workflow, and override logging",
    status: "foundation-ready",
    owner: "TrustOS, clinical operations, and customer workflow owner",
    evidence:
      "Human review required controls, reviewer status fields, blocked actions, Trust Cards, audit traces, and protected packet exports.",
    requiredBefore: "Any AI-assisted workflow that influences clinical, payer, or operational actions.",
    blockedCapabilities: ["autonomous clinical decisions", "autonomous outreach", "autonomous payer submission"],
    safeWorkaround:
      "Keep every output draft-only, recommendation-like, evidence-backed, and review-required."
  },
  {
    id: "clinical-validation-protocol",
    category: "safety-monitoring",
    name: "Clinical validation protocol and licensed sign-off",
    status: "blocked",
    owner: "Clinical validation lead, customer medical leadership, and quality team",
    evidence:
      "Validation cohort, inclusion/exclusion criteria, source truth, reviewer rubric, acceptance thresholds, bias/equity review, and sign-off.",
    requiredBefore: "Any patient-specific output is used in care delivery or clinical operations.",
    blockedCapabilities: ["clinical correctness scoring in care", "risk prediction", "care-gap scoring"],
    safeWorkaround:
      "Measure workflow outcomes on synthetic or approved de-identified data while clinical correctness remains unvalidated."
  },
  {
    id: "incident-response-playbook",
    category: "safety-monitoring",
    name: "Clinical, privacy, security, and AI incident response playbooks",
    status: "external-review-required",
    owner: "Trust safety operations, security, privacy, legal, and clinical governance",
    evidence:
      "Severity model, notification matrix, breach analysis path, adverse-event escalation, containment actions, legal hold, and post-incident review.",
    requiredBefore: "Any production clinical, PHI, or customer-integrated workflow.",
    blockedCapabilities: ["24/7 clinical operations", "production PHI incident handling", "adverse-event handling"],
    safeWorkaround:
      "Use current Trust Safety Operations incident workspaces for no-PHI synthetic issues and readiness rehearsal."
  },
  {
    id: "continuous-monitoring-outcomes",
    category: "safety-monitoring",
    name: "Continuous validation, monitoring, drift, and outcome learning",
    status: "foundation-ready",
    owner: "TrustOS, QA, product analytics, and customer operations",
    evidence:
      "QA evidence ledger, manual run evidence capture, workflow outcome metrics, command snapshots, trust metrics, and escalation rates.",
    requiredBefore: "Scaled pilots, model-route changes, and production workflow expansion.",
    blockedCapabilities: ["automated scale-up", "model route auto-promotion", "unmonitored workflow execution"],
    safeWorkaround:
      "Retain synthetic QA and buyer-demo evidence while production observability remains customer-specific."
  },
  {
    id: "reimbursement-claims-review",
    category: "legal-commercial",
    name: "Reimbursement, claims, coding, and payer policy review",
    status: "customer-specific",
    owner: "Revenue cycle expert, payer policy lead, legal, and customer operations",
    evidence:
      "Payer policy sources, CMS/coverage review, coding compliance review, no-guarantee reimbursement language, and human approval.",
    requiredBefore: "Any prior authorization, claim, coding, denial appeal, reimbursement, or payer-submission workflow.",
    blockedCapabilities: ["coverage determination", "claim submission", "billing finalization", "reimbursement guarantee"],
    safeWorkaround:
      "Provide denial-risk review and prior-auth support as draft, evidence-backed, human-reviewed operational intelligence."
  },
  {
    id: "patient-communication-consent",
    category: "clinical-governance",
    name: "Patient communication, consent, accessibility, and emergency-care boundary",
    status: "blocked",
    owner: "Clinical operations, legal, privacy, patient experience, and customer sponsor",
    evidence:
      "Consent model, communication templates, accessibility review, language support, patient-safety disclaimers, and emergency escalation policy.",
    requiredBefore: "Any patient-facing outreach, education, triage, scheduling, or care-plan communication.",
    blockedCapabilities: ["patient outreach", "patient education delivery", "triage messaging", "emergency advice"],
    safeWorkaround:
      "Keep patient-facing materials as internal draft templates for authorized human review."
  },
  {
    id: "go-live-rollback-approval",
    category: "operations",
    name: "Production go-live approval, rollback plan, and post-launch controls",
    status: "customer-specific",
    owner: "SCRIMED operator, customer executive sponsor, clinical sponsor, security, privacy, and legal",
    evidence:
      "Go-live checklist, launch approval packet, rollback plan, monitoring dashboard, support coverage, and post-launch review cadence.",
    requiredBefore: "Any live clinical-care production launch.",
    blockedCapabilities: ["production launch", "expanded production rollout", "customer-wide activation"],
    safeWorkaround:
      "Use buyer diligence exports, command intelligence packets, and clinical activation readiness briefs to prepare for approval."
  }
];

export const clinicalCareActivationCapabilities: ClinicalCareActivationCapability[] = [
  {
    name: "Synthetic clinical workflow simulation",
    status: "authorized-current-boundary",
    boundary:
      "Uses synthetic scenarios and fixtures only; does not process live PHI or patient-specific data.",
    proofRoute: "/synthetic/validation"
  },
  {
    name: "Enterprise clinical-care readiness planning",
    status: "authorized-current-boundary",
    boundary:
      "Supports buyer diligence, gate tracking, governance planning, and pilot design without delivering care.",
    proofRoute: "/clinical-care-activation"
  },
  {
    name: "Human-reviewed operational intelligence pilots",
    status: "authorized-current-boundary",
    boundary:
      "May be sold as governed synthetic or approved de-identified evaluation work; patient-impacting action remains blocked.",
    proofRoute: "/pilot-deal-room"
  },
  {
    name: "Live diagnosis, treatment, order entry, record mutation, and patient outreach",
    status: "blocked-before-clinical-go-live",
    boundary:
      "Requires the full activation gate set, signed customer scope, licensed clinical governance, PHI/security approval, connector validation, monitoring, and explicit go-live approval.",
    proofRoute: "/api/clinical-care-activation"
  }
];

export const clinicalCareActivationPhases: ClinicalCareActivationPhase[] = [
  {
    phase: "Current: governed synthetic evaluation",
    status: "foundation-ready",
    objective:
      "Use the sellable product, demos, proof stack, TrustOS, protected workspaces, and buyer diligence rooms without live patient data.",
    requiredEvidence: [
      "Product Console proof stack",
      "QA evidence ledger",
      "Buyer Diligence Export",
      "Clinical activation readiness brief"
    ],
    exitCriteria:
      "Buyer, legal, privacy, security, regulatory, and clinical leaders agree on a scoped activation plan."
  },
  {
    phase: "Shadow-mode clinical readiness",
    status: "customer-specific",
    objective:
      "Run SCRIMED in a customer-approved environment against de-identified or contract-approved data without impacting care.",
    requiredEvidence: [
      "BAA/DPA or non-PHI determination",
      "Customer data-flow approval",
      "Clinician reviewer rubric",
      "Connector sandbox acceptance"
    ],
    exitCriteria:
      "Outputs are measured against reviewer ground truth, error taxonomy, latency, safety, and workflow outcomes."
  },
  {
    phase: "Clinician-supervised prospective pilot",
    status: "external-review-required",
    objective:
      "Introduce human-reviewed, scope-limited workflow support where authorized clinicians remain responsible for all decisions.",
    requiredEvidence: [
      "Clinical safety case",
      "Licensed sign-off",
      "Patient communication policy where applicable",
      "Incident response and rollback plan"
    ],
    exitCriteria:
      "No severe unresolved safety issues, acceptable override/escalation rates, and signed continuation approval."
  },
  {
    phase: "Limited production go-live",
    status: "blocked",
    objective:
      "Run only the approved workflow, tenant, user group, connector set, and care setting with active monitoring.",
    requiredEvidence: [
      "Production go-live packet",
      "Connector conformance",
      "Monitoring dashboard",
      "Support and rollback coverage"
    ],
    exitCriteria:
      "Customer approves expansion after post-launch review, quality evidence, and safety review."
  }
];

export const clinicalCareActivationTrustCards: ClinicalCareActivationTrustCard[] = [
  {
    outputClass: "Readiness gate decision",
    confidence: "high-for-boundary",
    riskScore: "medium",
    sourceAttribution: ["SCRIMED Product Console", "TrustOS controls", "FDA CDS guidance", "HHS HIPAA Security Rule summary"],
    validationTimestamp: clinicalCareActivationUpdatedAt,
    reviewerStatus: "operator-review-required",
    humanReviewTrigger: "Any move from synthetic evaluation to customer clinical environment.",
    auditEvent: "clinical-care-activation-readiness-reviewed"
  },
  {
    outputClass: "Clinical recommendation-like output",
    confidence: "not-clinically-validated",
    riskScore: "critical",
    sourceAttribution: ["Atlas Evidence Layer contract", "Validation and Trust Lab contract"],
    validationTimestamp: clinicalCareActivationUpdatedAt,
    reviewerStatus: "blocked-before-licensed-clinical-review",
    humanReviewTrigger: "Always required before patient-specific use.",
    auditEvent: "clinical-output-blocked-before-authorization"
  }
];

export const blockedClinicalCareCapabilities = [
  "live diagnosis",
  "live treatment recommendation",
  "emergency triage or emergency advice",
  "order entry",
  "prescribing or medication changes",
  "EHR writeback or production record mutation",
  "patient outreach or patient instruction",
  "patient-specific risk prediction",
  "autonomous clinical decision support",
  "payer submission, claim submission, or coverage determination",
  "imaging interpretation for care",
  "medical-device functionality",
  "PHI or ePHI processing"
];

export function getClinicalCareActivationSummary() {
  const foundationReadyGateCount = clinicalCareActivationGates.filter(
    (gate) => gate.status === "foundation-ready"
  ).length;
  const externalReviewGateCount = clinicalCareActivationGates.filter(
    (gate) => gate.status === "external-review-required"
  ).length;
  const customerSpecificGateCount = clinicalCareActivationGates.filter(
    (gate) => gate.status === "customer-specific"
  ).length;
  const blockedGateCount = clinicalCareActivationGates.filter((gate) => gate.status === "blocked")
    .length;
  const readinessScore = Math.round((foundationReadyGateCount / clinicalCareActivationGates.length) * 100);

  return {
    service: "scrimed-clinical-care-activation",
    route: "/clinical-care-activation",
    apiRoute: "/api/clinical-care-activation",
    briefRoute: "/api/clinical-care-activation/brief",
    status: "clinical-care-activation-gated",
    proofStackStatus: clinicalCareActivationProofStackStatus,
    careExecutionAuthority: "not-authorized-live-care",
    dataBoundary: "synthetic-only-current-boundary",
    readinessScore,
    gateCount: clinicalCareActivationGates.length,
    foundationReadyGateCount,
    externalReviewGateCount,
    customerSpecificGateCount,
    blockedGateCount,
    boundary: clinicalCareActivationBoundary,
    sourceAuthorities: clinicalCareSourceAuthorities,
    gates: clinicalCareActivationGates,
    capabilities: clinicalCareActivationCapabilities,
    blockedCapabilities: blockedClinicalCareCapabilities,
    activationPhases: clinicalCareActivationPhases,
    trustCards: clinicalCareActivationTrustCards,
    nextOperatorActions: [
      "Keep current demos and pilots synthetic or approved de-identified evaluation only.",
      "Package this readiness brief into buyer diligence before any clinical-care pilot discussion.",
      "Define one narrow intended use and care setting before legal, regulatory, privacy, and clinical review.",
      "Obtain licensed clinician governance and customer approval before any patient-specific workflow.",
      "Complete PHI, connector, monitoring, incident response, and rollback gates before go-live."
    ],
    updated: clinicalCareActivationUpdatedAt
  };
}

export function buildClinicalCareActivationBrief() {
  const summary = getClinicalCareActivationSummary();

  return [
    "# SCRIMED Clinical Care Activation Readiness Brief",
    "",
    `Status: ${summary.status}`,
    `Care execution authority: ${summary.careExecutionAuthority}`,
    `Proof stack: ${summary.proofStackStatus}`,
    `Readiness score: ${summary.readinessScore}% foundation-ready gates (${summary.foundationReadyGateCount}/${summary.gateCount})`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Authorized Current-Boundary Capabilities",
    ...summary.capabilities
      .filter((capability) => capability.status === "authorized-current-boundary")
      .map((capability) => `- ${capability.name}: ${capability.boundary}`),
    "",
    "## Blocked Before Clinical Go-Live",
    ...summary.blockedCapabilities.map((capability) => `- ${capability}`),
    "",
    "## Hard Gates",
    ...summary.gates.map(
      (gate) =>
        `- ${gate.name} (${gate.status}): ${gate.requiredBefore} Safe workaround: ${gate.safeWorkaround}`
    ),
    "",
    "## Activation Path",
    ...summary.activationPhases.map(
      (phase) => `- ${phase.phase} (${phase.status}): ${phase.objective} Exit: ${phase.exitCriteria}`
    ),
    "",
    "## Source Authorities",
    ...summary.sourceAuthorities.map((source) =>
      source.url
        ? `- ${source.name} (${source.currentAsOf}): ${source.implication} ${source.url}`
        : `- ${source.name} (${source.currentAsOf}): ${source.implication}`
    ),
    "",
    "## Next Operator Actions",
    ...summary.nextOperatorActions.map((action) => `- ${action}`)
  ].join("\n");
}
