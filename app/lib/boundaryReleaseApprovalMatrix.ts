import { createHash } from "node:crypto";

export type BoundaryReleasePathStatus =
  | "approval-path-documented"
  | "internal-readiness-prepared"
  | "customer-required"
  | "external-approval-required"
  | "blocked-fail-closed";

export type BoundaryReleaseStepStatus =
  | "prepared"
  | "tracked"
  | "customer_required"
  | "external_required"
  | "blocked_pending_evidence";

export type BoundaryReleaseSignoffStatus =
  | "not_required"
  | "pending_internal"
  | "pending_customer"
  | "pending_external"
  | "approved";

export type BoundaryReleaseSignoffLane =
  | "legal"
  | "clinical"
  | "security"
  | "privacy"
  | "regulatory"
  | "customer"
  | "engineering"
  | "payer"
  | "research"
  | "finance"
  | "operations";

export type BoundaryReleaseApprovalStep = {
  id: string;
  order: number;
  name: string;
  purpose: string;
  requiredEvidence: string[];
  owner: string;
  status: BoundaryReleaseStepStatus;
  matrixStepDocumented: true;
  releaseEvidenceSatisfied: boolean;
  blockingCondition: string;
  proofRoutes: string[];
};

export type BoundaryReleaseSignoff = {
  lane: BoundaryReleaseSignoffLane;
  required: boolean;
  status: BoundaryReleaseSignoffStatus;
  evidenceRequired: string;
};

export type BoundaryReleaseApprovalPath = {
  id: string;
  name: string;
  preservedBoundary: string;
  currentSafeMode: string;
  releaseDecision: "blocked-fail-closed";
  status: BoundaryReleasePathStatus;
  canRelieveBoundary: false;
  unlocksOnlyAfter: string;
  approvalSteps: BoundaryReleaseApprovalStep[];
  requiredSignoffs: BoundaryReleaseSignoff[];
  evidenceArtifacts: string[];
  sourceReferences: string[];
  blockedUntil: string[];
  safeWorkaround: string;
  releaseHash: string;
};

export type BoundaryReleaseEvidenceWorkItemStatus =
  | "internal-evidence-required"
  | "customer-evidence-required"
  | "external-evidence-required"
  | "blocked-sensitive-storage";

export type BoundaryReleaseEvidenceWorkItemKind =
  | "approval-step-evidence"
  | "signoff-evidence";

export type BoundaryReleaseEvidenceWorkItem = {
  id: string;
  boundaryId: string;
  boundaryName: string;
  kind: BoundaryReleaseEvidenceWorkItemKind;
  sourceId: string;
  evidenceName: string;
  owner: string;
  priority: "critical" | "high" | "medium";
  status: BoundaryReleaseEvidenceWorkItemStatus;
  requiredBeforeRelease: true;
  acceptsRawEvidence: false;
  evidenceStorageBoundary: string;
  redactionRule: string;
  missingBecause: string;
  proofRoutes: string[];
  workItemHash: string;
};

export const boundaryReleaseApprovalMatrixStatus =
  "boundary-release-approval-matrix-active-fail-closed";
export const boundaryReleaseApprovalMatrixRoute = "/boundary-release-approvals";
export const boundaryReleaseApprovalMatrixApiRoute = "/api/boundary-release-approvals";
export const boundaryReleaseApprovalMatrixBriefRoute = "/api/boundary-release-approvals/brief";
export const boundaryReleaseApprovalMatrixBoundary =
  "SCRIMED Boundary Release Approval Matrix documents the approval path for preserved NO-GO boundaries. It does not grant PHI authority, clinical authority, payer submission authority, EHR writeback authority, production connector approval, certification claims, or customer go-live approval.";

const noGoClaims = [
  "live PHI approved",
  "autonomous clinical care approved",
  "diagnosis approved",
  "treatment or prescribing approved",
  "imaging interpretation approved",
  "EHR writeback approved",
  "payer submission approved",
  "production connector approved",
  "certification claim approved",
  "customer go-live approved"
];

function hashRecord(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function step(
  id: string,
  order: number,
  name: string,
  purpose: string,
  requiredEvidence: string[],
  owner: string,
  status: BoundaryReleaseStepStatus,
  releaseEvidenceSatisfied: boolean,
  blockingCondition: string,
  proofRoutes: string[]
): BoundaryReleaseApprovalStep {
  return {
    id,
    order,
    name,
    purpose,
    requiredEvidence,
    owner,
    status,
    matrixStepDocumented: true,
    releaseEvidenceSatisfied,
    blockingCondition,
    proofRoutes
  };
}

function signoff(
  lane: BoundaryReleaseSignoffLane,
  status: BoundaryReleaseSignoffStatus,
  evidenceRequired: string,
  required = true
): BoundaryReleaseSignoff {
  return {
    lane,
    required,
    status,
    evidenceRequired
  };
}

function withReleaseHash(path: Omit<BoundaryReleaseApprovalPath, "releaseHash">): BoundaryReleaseApprovalPath {
  return {
    ...path,
    releaseHash: hashRecord({
      id: path.id,
      steps: path.approvalSteps.map((approvalStep) => [
        approvalStep.id,
        approvalStep.status,
        approvalStep.releaseEvidenceSatisfied
      ]),
      signoffs: path.requiredSignoffs.map((approvalSignoff) => [
        approvalSignoff.lane,
        approvalSignoff.status
      ]),
      releaseDecision: path.releaseDecision
    })
  };
}

function evidencePriority(path: BoundaryReleaseApprovalPath) {
  if (["live-phi", "autonomous-clinical-action", "customer-go-live"].includes(path.id)) {
    return "critical";
  }

  if (["clinical-decision-support", "ehr-writeback", "payer-submission"].includes(path.id)) {
    return "high";
  }

  return "medium";
}

function stepEvidenceStatus(status: BoundaryReleaseStepStatus): BoundaryReleaseEvidenceWorkItemStatus {
  if (status === "customer_required") {
    return "customer-evidence-required";
  }

  if (status === "external_required") {
    return "external-evidence-required";
  }

  if (status === "blocked_pending_evidence") {
    return "blocked-sensitive-storage";
  }

  return "internal-evidence-required";
}

function signoffEvidenceStatus(status: BoundaryReleaseSignoffStatus): BoundaryReleaseEvidenceWorkItemStatus {
  if (status === "pending_customer") {
    return "customer-evidence-required";
  }

  if (status === "pending_external") {
    return "external-evidence-required";
  }

  return "internal-evidence-required";
}

function evidenceWorkItemHash(item: Omit<BoundaryReleaseEvidenceWorkItem, "workItemHash">) {
  return hashRecord({
    boundaryId: item.boundaryId,
    kind: item.kind,
    sourceId: item.sourceId,
    evidenceName: item.evidenceName,
    status: item.status,
    requiredBeforeRelease: item.requiredBeforeRelease,
    acceptsRawEvidence: item.acceptsRawEvidence
  });
}

function createEvidenceWorkItem(
  item: Omit<BoundaryReleaseEvidenceWorkItem, "workItemHash">
): BoundaryReleaseEvidenceWorkItem {
  return {
    ...item,
    workItemHash: evidenceWorkItemHash(item)
  };
}

const commonSafeMode =
  "synthetic, metadata-only, no-PHI, human-reviewed readiness material with fail-closed production behavior";

export const boundaryReleaseApprovalPaths: BoundaryReleaseApprovalPath[] = [
  withReleaseHash({
    id: "live-phi",
    name: "Live PHI / ePHI processing",
    preservedBoundary:
      "No live PHI, patient identifiers, source medical records, production credentials, or raw connector payloads.",
    currentSafeMode: commonSafeMode,
    releaseDecision: "blocked-fail-closed",
    status: "external-approval-required",
    canRelieveBoundary: false,
    unlocksOnlyAfter:
      "HIPAA security risk analysis, BAA coverage, tenant isolation, privacy/security review, customer authorization, and incident-response evidence are complete.",
    approvalSteps: [
      step(
        "phi-data-inventory",
        1,
        "PHI data inventory and classification",
        "Identify every data type, storage location, processor, subprocesser, retention rule, and access path before live data is accepted.",
        ["data-flow diagram", "PHI/PII classification table", "retention map", "subprocessor inventory"],
        "Privacy, security, platform, and customer data owner",
        "prepared",
        true,
        "No live data until all PHI stores and flows are documented.",
        ["/health-records", "/clinical-production-readiness", "/api/health-records"]
      ),
      step(
        "hipaa-risk-analysis",
        2,
        "HIPAA security risk analysis",
        "Complete a formal risk analysis and remediation register before handling ePHI.",
        ["risk analysis report", "risk treatment plan", "control evidence", "executive acceptance record"],
        "Security officer and qualified HIPAA advisor",
        "external_required",
        false,
        "No PHI authority until qualified security/privacy review signs the risk analysis.",
        ["/global-certification-readiness", "/risk-register", "/trust-center"]
      ),
      step(
        "baa-subprocessor-coverage",
        3,
        "BAA and subprocessor coverage",
        "Ensure every covered entity, business associate, and subprocessor relationship has the right contractual boundary.",
        ["executed BAA", "subprocessor BAA/DPA", "vendor security review", "contract owner approval"],
        "Legal, privacy, vendor management, and customer sponsor",
        "external_required",
        false,
        "No live PHI until signed agreements exist and are retained outside public code.",
        ["/enterprise-business-ops", "/boundary-resolution", "/api/boundary-resolution"]
      ),
      step(
        "phi-tenant-isolation",
        4,
        "Tenant isolation, audit, and incident response",
        "Prove least privilege, tenant separation, audit trails, encryption, alerting, breach response, and access reviews.",
        ["RLS/RBAC evidence", "audit-log packet", "incident response tabletop", "access review evidence"],
        "Platform, security, privacy, and tenant admin",
        "blocked_pending_evidence",
        false,
        "No PHI workflow until protected runtime controls are tested with customer-specific approval.",
        ["/qa-evidence", "/release-continuity", "/pilot-workspace/access"]
      )
    ],
    requiredSignoffs: [
      signoff("privacy", "pending_external", "Privacy officer approval and live-data processing basis."),
      signoff("security", "pending_external", "Security risk acceptance and remediation closure."),
      signoff("legal", "pending_external", "BAA/DPA and subprocessor agreement approval."),
      signoff("customer", "pending_customer", "Customer tenant authorization for live PHI scope."),
      signoff("engineering", "pending_internal", "Protected runtime, RLS, audit, and incident evidence.")
    ],
    evidenceArtifacts: ["HIPAA risk analysis", "BAA register", "tenant isolation proof", "audit log packet"],
    sourceReferences: [
      "HHS HIPAA Security Rule risk analysis guidance",
      "HHS sample business associate agreement provisions"
    ],
    blockedUntil: ["all signoffs are approved", "all release evidence is satisfied", "customer scope is explicit"],
    safeWorkaround:
      "Use synthetic fixtures, de-identified metadata planning, and no-PHI Health Records Safety Exchange reviews."
  }),
  withReleaseHash({
    id: "clinical-decision-support",
    name: "Clinical decision support",
    preservedBoundary:
      "No final diagnosis, treatment recommendation, triage replacement, clinical validation claim, or autonomous clinical authority.",
    currentSafeMode:
      "synthetic clinical readiness scoring, evidence cards, uncertainty display, and human-review-only clinical workflow support",
    releaseDecision: "blocked-fail-closed",
    status: "external-approval-required",
    canRelieveBoundary: false,
    unlocksOnlyAfter:
      "Intended use, FDA/CDS analysis, clinical safety case, validation protocol, evidence visibility, and clinician governance are approved.",
    approvalSteps: [
      step(
        "cds-intended-use",
        1,
        "Intended-use and user-control definition",
        "Define whether SCRIMED informs, drafts, prioritizes, recommends, or drives a clinical action.",
        ["intended-use statement", "user role map", "clinical authority map", "claim guard review"],
        "Clinical product, medical director, regulatory counsel, and claim guard owner",
        "prepared",
        true,
        "No CDS expansion until intended use and claim boundaries are explicit.",
        ["/clinical-authority-readiness", "/qa-claim-guard", "/clinical-robustness-lab"]
      ),
      step(
        "cds-regulatory-classification",
        2,
        "FDA/CDS/SaMD classification review",
        "Determine whether the workflow remains non-device CDS or requires regulated software review.",
        ["regulatory memo", "SaMD/CDS assessment", "excluded/regulated rationale", "external counsel review"],
        "Regulatory counsel, clinical safety, and executive approver",
        "external_required",
        false,
        "No public clinical authority claim until regulatory classification is complete.",
        ["/global-certification-readiness", "/boundary-resolution", "/risk-register"]
      ),
      step(
        "clinical-validation-protocol",
        3,
        "Clinical validation and safety protocol",
        "Test performance, contraindications, bias, missing-data behavior, evidence grounding, and escalation criteria.",
        ["validation protocol", "synthetic and retrospective test plan", "bias analysis", "clinical safety case"],
        "Clinical QA, specialty reviewer, data science, and safety officer",
        "external_required",
        false,
        "No clinical validation claim until protocol results are reviewed and approved.",
        ["/clinical-robustness-lab", "/scrimed-os", "/api/scrimed-os/upgrade-batch"]
      ),
      step(
        "clinician-final-authority",
        4,
        "Clinician final authority workflow",
        "Keep final judgment with the licensed clinician and make evidence, uncertainty, and limitations inspectable.",
        ["human-in-the-loop policy", "review queue evidence", "escalation policy", "evidence card requirements"],
        "Medical director, clinical governance, Trust Engine owner, and product owner",
        "tracked",
        false,
        "High-risk clinical outputs remain blocked unless reviewed.",
        ["/scrimed-trustops", "/trust-center", "/clinical-care-activation"]
      )
    ],
    requiredSignoffs: [
      signoff("clinical", "pending_external", "Medical director and specialty reviewer signoff."),
      signoff("regulatory", "pending_external", "FDA/CDS/SaMD classification approval."),
      signoff("legal", "pending_external", "External-use claim language approval."),
      signoff("security", "pending_internal", "No-PHI/PHI runtime boundary validation."),
      signoff("customer", "pending_customer", "Customer clinical governance approval for exact workflow.")
    ],
    evidenceArtifacts: ["intended-use memo", "regulatory classification", "clinical safety case", "validation report"],
    sourceReferences: ["FDA Clinical Decision Support Software guidance"],
    blockedUntil: ["clinical safety case approved", "regulatory classification complete", "customer governance signed"],
    safeWorkaround:
      "Offer synthetic Clinical Robustness Lab reviews, evidence summaries, and clinician-reviewed draft support only."
  }),
  withReleaseHash({
    id: "autonomous-clinical-action",
    name: "Autonomous diagnosis, treatment, prescribing, or imaging interpretation",
    preservedBoundary:
      "No autonomous diagnosis, treatment, prescribing, order placement, pharmacy action, or imaging interpretation.",
    currentSafeMode:
      "recommendation-free readiness analysis, safety linting, draft-only education, and clinician-governed review queues",
    releaseDecision: "blocked-fail-closed",
    status: "blocked-fail-closed",
    canRelieveBoundary: false,
    unlocksOnlyAfter:
      "A separate regulated clinical product pathway, malpractice coverage, medical governance, prescribing compliance, and production safety case are approved.",
    approvalSteps: [
      step(
        "autonomous-authority-ban",
        1,
        "Autonomous authority ban retained",
        "Keep SCRIMED from acting as the clinician of record or final medical authority.",
        ["hard-stop policy", "route headers", "human-review queue", "clinical authority audit"],
        "Clinical governance and platform safety",
        "prepared",
        true,
        "Autonomous care remains blocked by design.",
        ["/clinical-authority-readiness", "/clinical-care-activation", "/api/scrimed-os/upgrade-batch"]
      ),
      step(
        "regulated-product-pathway",
        2,
        "Regulated product pathway",
        "Create a separate regulatory strategy before any autonomous medical action is considered.",
        ["regulatory strategy", "quality management plan", "clinical evaluation plan", "post-market monitoring plan"],
        "Regulatory counsel, medical director, quality, and executive sponsor",
        "external_required",
        false,
        "No autonomous action until applicable regulator and clinical governance path is complete.",
        ["/global-certification-readiness", "/risk-register"]
      ),
      step(
        "prescribing-ehr-pharmacy-compliance",
        3,
        "Prescribing, ordering, EHR, and pharmacy compliance",
        "Separate prescribing and medication action workflows from educational or draft-only support.",
        ["EPCS/e-prescribing review", "order-entry controls", "malpractice coverage", "pharmacy workflow approval"],
        "Medical director, legal, pharmacy compliance, and customer clinical lead",
        "external_required",
        false,
        "No prescribing or medication action without licensed clinician and required legal/compliance evidence.",
        ["/health-records", "/boundary-resolution"]
      )
    ],
    requiredSignoffs: [
      signoff("clinical", "pending_external", "Medical director and specialty governance approval."),
      signoff("regulatory", "pending_external", "Applicable regulated product pathway approval."),
      signoff("legal", "pending_external", "Malpractice, prescribing, and product-liability review."),
      signoff("customer", "pending_customer", "Customer clinical governance and workflow approval.")
    ],
    evidenceArtifacts: ["regulated product strategy", "clinical governance charter", "malpractice review", "post-market plan"],
    sourceReferences: ["FDA CDS/SaMD analysis", "DEA EPCS review if controlled substances are in scope"],
    blockedUntil: ["separate regulated pathway approved", "licensed clinician workflow established"],
    safeWorkaround:
      "Use draft-only education, documentation support, and clinician-reviewed safety/evidence summaries."
  }),
  withReleaseHash({
    id: "ehr-writeback",
    name: "EHR writeback and production connector activation",
    preservedBoundary:
      "No EHR writeback, chart filing, record mutation, order entry, or production connector approval.",
    currentSafeMode:
      "readiness architecture, sandbox-only connector planning, synthetic FHIR validation, and human-reviewed writeback design",
    releaseDecision: "blocked-fail-closed",
    status: "external-approval-required",
    canRelieveBoundary: false,
    unlocksOnlyAfter:
      "Customer authorization, EHR vendor app registration, scoped SMART/FHIR permissions, sandbox validation, rollback plan, and clinical signoff are complete.",
    approvalSteps: [
      step(
        "ehr-read-only-sandbox",
        1,
        "Read-only sandbox validation",
        "Start with non-production FHIR/SMART testing before any write scope is requested.",
        ["sandbox app registration", "read-only scope list", "FHIR conformance results", "audit trace"],
        "Interoperability, platform, and customer IT",
        "tracked",
        false,
        "No writeback until read-only sandbox behavior is proven.",
        ["/interoperability", "/clinical-data-fabric", "/health-records"]
      ),
      step(
        "write-scope-approval",
        2,
        "Write-scope and change-control approval",
        "Approve exact FHIR resources, fields, users, rollback behavior, and human signoff rules.",
        ["scope request", "change-control ticket", "rollback plan", "human signoff policy"],
        "Customer IT, clinical informatics, security, and SCRIMED platform",
        "customer_required",
        false,
        "No write scope without customer and EHR governance approval.",
        ["/clinical-care-activation", "/release-continuity", "/qa-evidence"]
      ),
      step(
        "ehr-production-connector-review",
        3,
        "Production connector review",
        "Complete vendor security review, tenant-specific secrets handling, and connector release evidence.",
        ["vendor approval", "security review", "secret-handling proof", "tenant admin approval"],
        "Customer IT, vendor relations, security, and release engineering",
        "external_required",
        false,
        "No production connector activation without external approval evidence.",
        ["/pilot-workspace/access", "/release-continuity", "/boundary-resolution"]
      )
    ],
    requiredSignoffs: [
      signoff("customer", "pending_customer", "Customer IT, clinical informatics, and tenant admin approval."),
      signoff("security", "pending_external", "Vendor/customer security review approval."),
      signoff("clinical", "pending_customer", "Clinical workflow owner approval."),
      signoff("engineering", "pending_internal", "Sandbox, rollback, and audit evidence.")
    ],
    evidenceArtifacts: ["SMART/FHIR app registration", "scope approval", "sandbox test evidence", "rollback plan"],
    sourceReferences: ["ONC API/FHIR certification criteria", "EHR vendor app approval process"],
    blockedUntil: ["customer write-scope approval exists", "vendor connector approval exists", "rollback tested"],
    safeWorkaround:
      "Generate draft packets and human-readable summaries for manual review outside SCRIMED writeback paths."
  }),
  withReleaseHash({
    id: "payer-submission",
    name: "Payer submission, prior authorization, claims, and appeals",
    preservedBoundary:
      "No autonomous payer submission, claim filing, prior authorization submission, appeal filing, or reimbursement guarantee.",
    currentSafeMode:
      "synthetic payer workflow planning, draft packets, RCM intelligence, and human-reviewed payer readiness material",
    releaseDecision: "blocked-fail-closed",
    status: "external-approval-required",
    canRelieveBoundary: false,
    unlocksOnlyAfter:
      "Trading partner agreement, payer/clearinghouse approval, X12/FHIR validation, provider attestation, and human submitter approval are complete.",
    approvalSteps: [
      step(
        "payer-workflow-scope",
        1,
        "Payer workflow scope and provider attestation",
        "Separate draft support from actual claim, prior-auth, or appeal submission.",
        ["workflow scope", "provider attestation policy", "submitter role map", "claim guard review"],
        "RCM owner, legal, customer billing leader, and provider submitter",
        "prepared",
        true,
        "No payer transmission until authorized submitter workflow is approved.",
        ["/offerings", "/platform-power", "/qa-claim-guard"]
      ),
      step(
        "trading-partner-approval",
        2,
        "Trading partner and payer approval",
        "Complete payer or clearinghouse onboarding before any production transaction.",
        ["trading partner agreement", "payer enrollment", "clearinghouse approval", "test transaction evidence"],
        "Customer RCM, payer relations, clearinghouse/vendor owner, and legal",
        "external_required",
        false,
        "No payer submission without payer/clearinghouse authorization.",
        ["/enterprise-business-ops", "/boundary-resolution"]
      ),
      step(
        "x12-fhir-validation",
        3,
        "X12/FHIR validation and human review",
        "Validate transaction format, attachments, provenance, and reviewer disposition before production transmission.",
        ["X12/FHIR conformance", "attachment validation", "audit envelope", "human reviewer signoff"],
        "Interoperability, RCM operations, and human submitter",
        "blocked_pending_evidence",
        false,
        "No automated submission until conformance and human review evidence exist.",
        ["/clinical-data-fabric", "/workflows/execution-attempts", "/qa-evidence"]
      )
    ],
    requiredSignoffs: [
      signoff("payer", "pending_external", "Payer or clearinghouse trading-partner approval."),
      signoff("customer", "pending_customer", "Customer RCM and provider submitter approval."),
      signoff("legal", "pending_external", "Submission authority and contract review."),
      signoff("engineering", "pending_internal", "X12/FHIR validation, audit, and fail-closed evidence.")
    ],
    evidenceArtifacts: ["trading partner agreement", "test transaction packet", "human submitter policy", "audit envelope"],
    sourceReferences: ["CMS Interoperability and Prior Authorization final rule", "X12/FHIR transaction validation"],
    blockedUntil: ["payer/clearinghouse approval exists", "human submitter approved", "transaction validation passed"],
    safeWorkaround:
      "Create draft prior-auth and claims packets for human review without transmitting to payers."
  }),
  withReleaseHash({
    id: "clinical-research-outcomes-learning",
    name: "Clinical research, outcomes learning, and human-subject data",
    preservedBoundary:
      "No live patient research, outcomes learning from identifiable data, or human-subject research claims without protocol review.",
    currentSafeMode:
      "synthetic research workflows, literature synthesis planning, and no-PHI evaluation registries",
    releaseDecision: "blocked-fail-closed",
    status: "external-approval-required",
    canRelieveBoundary: false,
    unlocksOnlyAfter:
      "IRB determination or approval, consent/waiver analysis, protocol, privacy review, and data-minimization controls are complete.",
    approvalSteps: [
      step(
        "research-purpose-protocol",
        1,
        "Research purpose and protocol",
        "Define whether the activity is quality improvement, operations, research, or human-subject research.",
        ["research/operations determination", "protocol", "dataset description", "analysis plan"],
        "Research lead, clinical operations, privacy, and principal investigator if required",
        "tracked",
        false,
        "No live outcomes learning until protocol classification is complete.",
        ["/scrimed-os", "/clinical-robustness-lab", "/risk-register"]
      ),
      step(
        "irb-consent-review",
        2,
        "IRB, consent, and waiver review",
        "Obtain independent determination or approval when human-subject research may be involved.",
        ["IRB determination", "consent or waiver memo", "data-use agreement", "privacy review"],
        "IRB, principal investigator, privacy, and legal",
        "external_required",
        false,
        "No human-subject data use until IRB/consent path is resolved.",
        ["/global-certification-readiness", "/boundary-resolution"]
      ),
      step(
        "outcome-learning-governance",
        3,
        "Outcome learning governance",
        "Govern feedback loops so models do not silently drift or learn from unauthorized patient data.",
        ["model update policy", "dataset lineage", "drift monitoring", "human review queue"],
        "MLOps, clinical QA, privacy, and research governance",
        "blocked_pending_evidence",
        false,
        "No continuous learning from live data until governance and monitoring are approved.",
        ["/scrimed-trustops", "/api/scrimed-build-roadmap/strategic-execution", "/observability"]
      )
    ],
    requiredSignoffs: [
      signoff("research", "pending_external", "IRB or research governance determination."),
      signoff("privacy", "pending_external", "Consent, waiver, DUA, and privacy review."),
      signoff("clinical", "pending_external", "Clinical governance approval for outcome endpoints."),
      signoff("engineering", "pending_internal", "Dataset lineage, drift monitoring, and rollback evidence.")
    ],
    evidenceArtifacts: ["IRB determination", "protocol", "DUA", "dataset lineage", "drift monitoring report"],
    sourceReferences: ["HHS 45 CFR 46 Common Rule"],
    blockedUntil: ["IRB/consent path complete", "privacy review complete", "learning governance approved"],
    safeWorkaround:
      "Use synthetic scenarios, public literature, and reviewer-created SME expectations without live patient data."
  }),
  withReleaseHash({
    id: "security-certification-claims",
    name: "SOC 2, HIPAA, HITRUST, ISO, FDA, ONC, and certification claims",
    preservedBoundary:
      "No certification, clearance, validation, compliance-completion, or audited-report claims unless independently verified.",
    currentSafeMode:
      "readiness mapping, evidence collection, control preparation, and claim-safe diligence material",
    releaseDecision: "blocked-fail-closed",
    status: "external-approval-required",
    canRelieveBoundary: false,
    unlocksOnlyAfter:
      "Qualified auditor, assessor, regulator, or certification body evidence exists for the exact claim and scope.",
    approvalSteps: [
      step(
        "claim-inventory",
        1,
        "Claim inventory and prohibited language control",
        "Map every external trust, privacy, security, clinical, and regulatory claim to evidence and authority.",
        ["claim register", "approved language list", "prohibited claim list", "release owner"],
        "Legal, security, marketing, and executive approver",
        "prepared",
        true,
        "No external claim without claim guard evidence.",
        ["/qa-claim-guard", "/trust-center", "/public-market-readiness"]
      ),
      step(
        "soc2-readiness-audit",
        2,
        "SOC 2 readiness and audit path",
        "Prepare controls and evidence before pursuing a Type I or Type II attestation report.",
        ["control matrix", "evidence vault", "auditor engagement", "management assertion"],
        "Security, compliance, finance, legal, and independent CPA auditor",
        "external_required",
        false,
        "No SOC 2 claim until the independent report exists.",
        ["/enterprise-readiness", "/risk-register", "/release-continuity"]
      ),
      step(
        "regulatory-certification-review",
        3,
        "Regulatory and certification body review",
        "Route FDA, ONC, HITRUST, ISO, accessibility, and global claims to the right authority.",
        ["scope memo", "assessor/regulator evidence", "scope limitations", "approved public language"],
        "Regulatory counsel, compliance, assessor, and executive approver",
        "external_required",
        false,
        "No certification or clearance language until independent authority is retained.",
        ["/global-certification-readiness", "/approvals-readiness", "/boundary-resolution"]
      )
    ],
    requiredSignoffs: [
      signoff("legal", "pending_external", "Approved external-use claim language."),
      signoff("security", "pending_external", "Security auditor/assessor evidence."),
      signoff("regulatory", "pending_external", "Regulator or certification body evidence where applicable."),
      signoff("finance", "pending_external", "Auditor engagement and report handling where SOC/audit applies.")
    ],
    evidenceArtifacts: ["claim register", "control matrix", "auditor report", "certification scope memo"],
    sourceReferences: ["AICPA SOC suite", "applicable regulator/certification body scope"],
    blockedUntil: ["independent report or certification evidence exists", "claim language approved"],
    safeWorkaround:
      "Say SCRIMED is preparing for audit/readiness review; do not claim certification, clearance, or compliance completion."
  }),
  withReleaseHash({
    id: "global-operation",
    name: "Global operation, data residency, GDPR, EHDS, and EU AI Act readiness",
    preservedBoundary:
      "No global launch, regional regulatory approval, data-residency approval, public-sector procurement approval, or EU AI Act compliance claim.",
    currentSafeMode:
      "regional readiness mapping, synthetic localization, data-residency planning, and qualified-review routing",
    releaseDecision: "blocked-fail-closed",
    status: "external-approval-required",
    canRelieveBoundary: false,
    unlocksOnlyAfter:
      "Regional counsel, privacy review, DPA/SCCs where needed, DPIA, data-residency decision, AI Act classification, and customer approval are complete.",
    approvalSteps: [
      step(
        "regional-data-map",
        1,
        "Regional data map and lawful basis",
        "Define region, entity, data categories, processors, cross-border transfer path, and lawful basis.",
        ["regional data map", "lawful basis memo", "processor list", "transfer mechanism"],
        "Privacy, legal, regional counsel, and customer sponsor",
        "tracked",
        false,
        "No regional launch claim until the data map and lawful basis are reviewed.",
        ["/global-reach", "/global-certification-readiness", "/deployment-profiles"]
      ),
      step(
        "dpia-dpa-residency",
        2,
        "DPIA, DPA/SCCs, and data residency review",
        "Document privacy risk, processor commitments, transfer controls, and hosting/residency decision.",
        ["DPIA", "DPA/SCCs", "residency decision", "hosting control evidence"],
        "Privacy, legal, security, hosting owner, and customer data protection officer",
        "external_required",
        false,
        "No regional processing until privacy and residency evidence exists.",
        ["/enterprise-scalability", "/production-architecture", "/risk-register"]
      ),
      step(
        "eu-ai-act-classification",
        3,
        "AI Act and regional AI classification",
        "Classify the AI use case and document obligations before public regional claims.",
        ["AI Act classification", "high-risk obligation map if applicable", "human oversight plan", "post-market monitoring plan"],
        "Regulatory counsel, AI governance, clinical safety, and regional owner",
        "external_required",
        false,
        "No EU AI Act or regional AI compliance claim until classification is approved.",
        ["/scrimed-os", "/scrimed-trustops", "/global-certification-readiness"]
      )
    ],
    requiredSignoffs: [
      signoff("privacy", "pending_external", "DPIA, DPA/SCCs, data-residency, and lawful-basis review."),
      signoff("legal", "pending_external", "Regional counsel approval."),
      signoff("regulatory", "pending_external", "AI Act/regional AI classification approval."),
      signoff("customer", "pending_customer", "Customer regional deployment authorization."),
      signoff("security", "pending_external", "Hosting and transfer-control evidence.")
    ],
    evidenceArtifacts: ["DPIA", "DPA/SCCs", "AI Act classification", "regional deployment profile"],
    sourceReferences: ["GDPR framework", "EU AI Act", "regional health-data rules"],
    blockedUntil: ["regional counsel approves", "privacy transfer basis approved", "customer regional scope approved"],
    safeWorkaround:
      "Use synthetic regional readiness packs and keep production data inside the approved existing environment."
  }),
  withReleaseHash({
    id: "customer-go-live",
    name: "Customer go-live and production release",
    preservedBoundary:
      "No customer go-live approval, production connector approval, production clinical workflow approval, or managed-service commitment.",
    currentSafeMode:
      "buyer diligence, synthetic pilots, protected AAL2 evidence, and human-reviewed release packets",
    releaseDecision: "blocked-fail-closed",
    status: "customer-required",
    canRelieveBoundary: false,
    unlocksOnlyAfter:
      "Customer acceptance, security review, clinical/operational owner signoff, rollback plan, support plan, and release authority are complete.",
    approvalSteps: [
      step(
        "pilot-acceptance-criteria",
        1,
        "Pilot acceptance criteria and scope control",
        "Define exact users, data boundary, workflows, excluded actions, success metrics, and rollback conditions.",
        ["pilot charter", "acceptance criteria", "excluded action list", "measurement plan"],
        "Customer sponsor, SCRIMED delivery, product, and legal",
        "prepared",
        true,
        "No go-live without signed pilot/customer scope.",
        ["/pilot-demo-commercial-readiness", "/service-delivery", "/client-onboarding"]
      ),
      step(
        "release-readiness-evidence",
        2,
        "Release readiness evidence",
        "Run smoke, security, support, rollback, audit, and protected workspace checks before release decision.",
        ["release packet", "smoke evidence", "security review", "rollback plan", "support runbook"],
        "Release engineering, security, support, and customer IT",
        "blocked_pending_evidence",
        false,
        "No customer go-live until current evidence packet is complete and approved.",
        ["/release-continuity", "/qa-evidence", "/launch-readiness"]
      ),
      step(
        "formal-go-live-approval",
        3,
        "Formal go-live approval",
        "Collect named approval from customer, SCRIMED executive owner, security, support, and clinical/operational owner if applicable.",
        ["release decision", "named approvals", "customer acceptance", "communication plan"],
        "Customer sponsor, SCRIMED executive, release owner, and support lead",
        "customer_required",
        false,
        "No go-live before named approvals are retained.",
        ["/pilot-workspace/access", "/boundary-resolution", "/investor-readiness"]
      )
    ],
    requiredSignoffs: [
      signoff("customer", "pending_customer", "Named customer go-live approval."),
      signoff("security", "pending_external", "Customer/security release review."),
      signoff("engineering", "pending_internal", "Smoke, rollback, observability, and support evidence."),
      signoff("operations", "pending_internal", "Support, incident, and communication runbook."),
      signoff("legal", "pending_external", "Contract and service-scope approval.")
    ],
    evidenceArtifacts: ["pilot charter", "release packet", "rollback plan", "customer acceptance", "support runbook"],
    sourceReferences: ["customer contract", "release authority packet", "security review"],
    blockedUntil: ["customer acceptance exists", "release packet approved", "support and rollback are proven"],
    safeWorkaround:
      "Run synthetic demos, no-PHI pilots, and protected diligence rooms until customer go-live authority exists."
  })
];

function pathReleaseEligible(path: BoundaryReleaseApprovalPath) {
  const stepsSatisfied = path.approvalSteps.every((approvalStep) => approvalStep.releaseEvidenceSatisfied);
  const signoffsSatisfied = path.requiredSignoffs.every(
    (approvalSignoff) => !approvalSignoff.required || approvalSignoff.status === "approved"
  );

  return stepsSatisfied && signoffsSatisfied;
}

export function buildBoundaryReleaseEvidenceWorkQueue() {
  const stepWorkItems = boundaryReleaseApprovalPaths.flatMap((path) =>
    path.approvalSteps
      .filter((approvalStep) => !approvalStep.releaseEvidenceSatisfied)
      .flatMap((approvalStep) =>
        approvalStep.requiredEvidence.map((evidenceName) =>
          createEvidenceWorkItem({
            id: `${path.id}:${approvalStep.id}:${evidenceName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
            boundaryId: path.id,
            boundaryName: path.name,
            kind: "approval-step-evidence",
            sourceId: approvalStep.id,
            evidenceName,
            owner: approvalStep.owner,
            priority: evidencePriority(path),
            status: stepEvidenceStatus(approvalStep.status),
            requiredBeforeRelease: true,
            acceptsRawEvidence: false,
            evidenceStorageBoundary:
              "Store only metadata references, reviewer names/roles, artifact fingerprints, and external evidence-room links. Do not store PHI, credentials, raw contracts, raw clinical records, bearer tokens, or raw connector payloads.",
            redactionRule:
              "Redact patient identifiers, secrets, credentials, claim numbers, payer member IDs, production connector payloads, and raw legal or clinical documents before SCRIMED metadata entry.",
            missingBecause: approvalStep.blockingCondition,
            proofRoutes: approvalStep.proofRoutes
          })
        )
      )
  );

  const signoffWorkItems = boundaryReleaseApprovalPaths.flatMap((path) =>
    path.requiredSignoffs
      .filter((approvalSignoff) => approvalSignoff.required && approvalSignoff.status !== "approved")
      .map((approvalSignoff) =>
        createEvidenceWorkItem({
          id: `${path.id}:signoff:${approvalSignoff.lane}`,
          boundaryId: path.id,
          boundaryName: path.name,
          kind: "signoff-evidence",
          sourceId: approvalSignoff.lane,
          evidenceName: approvalSignoff.evidenceRequired,
          owner: `${approvalSignoff.lane} approver`,
          priority: evidencePriority(path),
          status: signoffEvidenceStatus(approvalSignoff.status),
          requiredBeforeRelease: true,
          acceptsRawEvidence: false,
          evidenceStorageBoundary:
            "Store only signoff metadata, approval role, external artifact reference, date, and hash. Sensitive approvals remain in the external evidence room.",
          redactionRule:
            "Never paste signatures, PHI, contracts, credential material, production tokens, legal memos, or customer-confidential artifacts into public SCRIMED surfaces.",
          missingBecause: `Required ${approvalSignoff.lane} signoff is ${approvalSignoff.status}.`,
          proofRoutes: [boundaryReleaseApprovalMatrixRoute, boundaryReleaseApprovalMatrixApiRoute]
        })
      )
  );

  return [...stepWorkItems, ...signoffWorkItems];
}

export function evaluateBoundaryReleaseRequest(boundaryId: string) {
  const path = boundaryReleaseApprovalPaths.find((approvalPath) => approvalPath.id === boundaryId);

  if (!path) {
    return {
      allowed: false,
      status: "blocked-unknown-boundary",
      statusCode: 404,
      reason: "Unknown boundary release request. SCRIMED fails closed when the boundary is not in the approval matrix."
    } as const;
  }

  return {
    allowed: false,
    status: "blocked-fail-closed",
    statusCode: 403,
    boundaryId: path.id,
    reason: pathReleaseEligible(path)
      ? "Boundary is tracked but automatic release is still disabled. Named human approval must create a separate release decision."
      : "Boundary remains blocked until every required approval step, evidence artifact, and signoff is satisfied.",
    missingSteps: path.approvalSteps
      .filter((approvalStep) => !approvalStep.releaseEvidenceSatisfied)
      .map((approvalStep) => approvalStep.id),
    pendingSignoffs: path.requiredSignoffs
      .filter((approvalSignoff) => approvalSignoff.required && approvalSignoff.status !== "approved")
      .map((approvalSignoff) => approvalSignoff.lane),
    releaseDecision: path.releaseDecision
  } as const;
}

export function getBoundaryReleaseApprovalMatrixSummary() {
  const releaseDecisions = boundaryReleaseApprovalPaths.map((path) => evaluateBoundaryReleaseRequest(path.id));
  const approvalSteps = boundaryReleaseApprovalPaths.flatMap((path) => path.approvalSteps);
  const signoffs = boundaryReleaseApprovalPaths.flatMap((path) => path.requiredSignoffs);
  const evidenceWorkQueue = buildBoundaryReleaseEvidenceWorkQueue();
  const internallyPreparedSteps = approvalSteps.filter(
    (approvalStep) => approvalStep.status === "prepared" && approvalStep.releaseEvidenceSatisfied
  );
  const pendingExternalSteps = approvalSteps.filter((approvalStep) =>
    ["customer_required", "external_required", "blocked_pending_evidence"].includes(approvalStep.status)
  );
  const pendingApprovalStepCount = approvalSteps.filter((approvalStep) => !approvalStep.releaseEvidenceSatisfied).length;
  const pendingRequiredSignoffCount = signoffs.filter(
    (approvalSignoff) => approvalSignoff.required && approvalSignoff.status !== "approved"
  ).length;

  return {
    service: "scrimed-boundary-release-approval-matrix",
    route: boundaryReleaseApprovalMatrixRoute,
    apiRoute: boundaryReleaseApprovalMatrixApiRoute,
    briefRoute: boundaryReleaseApprovalMatrixBriefRoute,
    status: boundaryReleaseApprovalMatrixStatus,
    boundary: boundaryReleaseApprovalMatrixBoundary,
    dataBoundary: "synthetic-metadata-only-no-live-phi",
    releaseAuthority: "not-authorized-boundary-release",
    allApprovalStepsDocumented: approvalSteps.every((approvalStep) => approvalStep.matrixStepDocumented),
    releaseCandidateCount: boundaryReleaseApprovalPaths.length,
    releasedBoundaryCount: 0,
    blockedBoundaryCount: boundaryReleaseApprovalPaths.length,
    stepCount: approvalSteps.length,
    internallyPreparedStepCount: internallyPreparedSteps.length,
    pendingExternalOrCustomerStepCount: pendingExternalSteps.length,
    signoffCount: signoffs.length,
    pendingSignoffCount: pendingRequiredSignoffCount,
    evidenceWorkQueue,
    evidenceWorkQueueSummary: {
      status: "metadata-only-evidence-work-queue-active",
      workItemCount: evidenceWorkQueue.length,
      criticalWorkItemCount: evidenceWorkQueue.filter((item) => item.priority === "critical").length,
      externalEvidenceRequiredCount: evidenceWorkQueue.filter((item) => item.status === "external-evidence-required").length,
      customerEvidenceRequiredCount: evidenceWorkQueue.filter((item) => item.status === "customer-evidence-required").length,
      internalEvidenceRequiredCount: evidenceWorkQueue.filter((item) => item.status === "internal-evidence-required").length,
      blockedSensitiveStorageCount: evidenceWorkQueue.filter((item) => item.status === "blocked-sensitive-storage").length,
      acceptsRawEvidence: false,
      allWorkItemsRequiredBeforeRelease: evidenceWorkQueue.every((item) => item.requiredBeforeRelease),
      allWorkItemsMetadataOnly: evidenceWorkQueue.every((item) => item.acceptsRawEvidence === false)
    },
    noGoClaims,
    approvalPaths: boundaryReleaseApprovalPaths,
    releaseDecisions,
    selfTest: {
      unknownBoundaryFailsClosed: evaluateBoundaryReleaseRequest("unknown-boundary").allowed === false,
      livePhiFailsClosed: evaluateBoundaryReleaseRequest("live-phi").allowed === false,
      clinicalDecisionSupportFailsClosed: evaluateBoundaryReleaseRequest("clinical-decision-support").allowed === false,
      customerGoLiveFailsClosed: evaluateBoundaryReleaseRequest("customer-go-live").allowed === false,
      noAutomaticRelease: releaseDecisions.every((decision) => decision.allowed === false),
      everyPathHasHash: boundaryReleaseApprovalPaths.every((path) => path.releaseHash.length === 64),
      everyPathHasRequiredSignoffs: boundaryReleaseApprovalPaths.every((path) =>
        ["legal", "security"].some((lane) => path.requiredSignoffs.some((signoffRecord) => signoffRecord.lane === lane))
      ),
      everyPendingStepHasEvidenceWorkItem:
        evidenceWorkQueue.filter((item) => item.kind === "approval-step-evidence").length >= pendingApprovalStepCount,
      everyPendingSignoffHasEvidenceWorkItem:
        evidenceWorkQueue.filter((item) => item.kind === "signoff-evidence").length === pendingRequiredSignoffCount,
      noWorkItemAcceptsRawEvidence: evidenceWorkQueue.every((item) => item.acceptsRawEvidence === false),
      workQueueCannotReleaseBoundaries: releaseDecisions.every((decision) => decision.allowed === false)
    },
    operatorRule:
      "The matrix can complete the approval path documentation, but it cannot relieve a boundary. A separate named human release decision must be created after all evidence and signoffs are approved.",
    nextAction:
      "Attach each preserved boundary to its evidence packet, assign the missing signoff owners, and keep the runtime fail-closed until approved release decisions exist.",
    updated: "2026-07-03"
  };
}

function renderPath(path: BoundaryReleaseApprovalPath) {
  return [
    `### ${path.name}`,
    `- Boundary: ${path.preservedBoundary}`,
    `- Decision: ${path.releaseDecision}`,
    `- Can relieve boundary now: ${path.canRelieveBoundary}`,
    `- Current safe mode: ${path.currentSafeMode}`,
    `- Unlocks only after: ${path.unlocksOnlyAfter}`,
    `- Release hash: ${path.releaseHash}`,
    "- Steps:",
    ...path.approvalSteps.map(
      (approvalStep) =>
        `  ${approvalStep.order}. ${approvalStep.name} - ${approvalStep.status}; evidence satisfied: ${approvalStep.releaseEvidenceSatisfied}; blocker: ${approvalStep.blockingCondition}`
    ),
    "- Required signoffs:",
    ...path.requiredSignoffs.map(
      (approvalSignoff) =>
        `  - ${approvalSignoff.lane}: ${approvalSignoff.status}; evidence: ${approvalSignoff.evidenceRequired}`
    ),
    `- Safe workaround: ${path.safeWorkaround}`
  ].join("\n");
}

function renderEvidenceWorkItem(item: BoundaryReleaseEvidenceWorkItem) {
  return `- ${item.boundaryName} / ${item.evidenceName} (${item.kind}, ${item.priority}, ${item.status}): ${item.missingBecause} Owner: ${item.owner}. Hash: ${item.workItemHash}.`;
}

export function buildBoundaryReleaseApprovalMatrixBrief() {
  const summary = getBoundaryReleaseApprovalMatrixSummary();

  return [
    "# SCRIMED Boundary Release Approval Matrix",
    "",
    `Status: ${summary.status}`,
    `Boundary: ${summary.boundary}`,
    `Release authority: ${summary.releaseAuthority}`,
    `Release candidates: ${summary.releaseCandidateCount}`,
    `Released boundaries: ${summary.releasedBoundaryCount}`,
    `Blocked boundaries: ${summary.blockedBoundaryCount}`,
    `Approval steps documented: ${summary.allApprovalStepsDocumented}`,
    "",
    "## Operator Rule",
    summary.operatorRule,
    "",
    "## Approval Paths",
    ...summary.approvalPaths.map(renderPath),
    "",
    "## Evidence Work Queue",
    `Status: ${summary.evidenceWorkQueueSummary.status}`,
    `Work items: ${summary.evidenceWorkQueueSummary.workItemCount}`,
    `Accepts raw evidence: ${summary.evidenceWorkQueueSummary.acceptsRawEvidence}`,
    ...summary.evidenceWorkQueue.slice(0, 40).map(renderEvidenceWorkItem),
    "",
    "## NO-GO Claims Still Preserved",
    ...summary.noGoClaims.map((claim) => `- ${claim}`),
    "",
    "## Next Action",
    summary.nextAction
  ].join("\n");
}
