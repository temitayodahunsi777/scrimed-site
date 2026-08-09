export type IntendedUseWorkflow =
  | "workflow-intelligence"
  | "synthetic-clinical-robustness"
  | "documentation-support"
  | "patient-education-drafting"
  | "prior-authorization-drafting"
  | "interoperability-preview"
  | "research-evidence-synthesis";

export type IntendedUseOperatingMode =
  | "public-no-phi"
  | "internal-synthetic"
  | "protected-no-phi-pilot"
  | "production-live";

export type IntendedUseDataClassification =
  | "public"
  | "synthetic"
  | "metadata-only"
  | "irreversibly-deidentified"
  | "phi"
  | "restricted-clinical";

export type IntendedUseAudience =
  | "internal-governance"
  | "buyer-diligence"
  | "public-marketing"
  | "customer-workflow"
  | "live-care";

export type IntendedUseAutonomyLevel = "read-only" | "recommend" | "prepare" | "execute";

export type IntendedUseEvidencePosture =
  | "source-cited-and-verified"
  | "source-cited-unverified"
  | "unsourced";

export type IntendedUseRequestedAction =
  | "workflow-assessment"
  | "evidence-organization"
  | "administrative-draft"
  | "patient-education-draft"
  | "clinical-decision-support-draft"
  | "interoperability-preview"
  | "diagnosis"
  | "treatment-selection"
  | "prescribing"
  | "final-imaging-interpretation"
  | "patient-outreach"
  | "payer-submission"
  | "ehr-writeback"
  | "external-communication"
  | "customer-go-live"
  | "certification-claim";

export type IntendedUseReviewInput = {
  workflow: IntendedUseWorkflow;
  operatingMode: IntendedUseOperatingMode;
  dataClassification: IntendedUseDataClassification;
  audience: IntendedUseAudience;
  autonomyLevel: IntendedUseAutonomyLevel;
  evidencePosture: IntendedUseEvidencePosture;
  requestedActions: IntendedUseRequestedAction[];
};

export type IntendedUseReviewDecision =
  | "input-required"
  | "blocked-prohibited-scope"
  | "evidence-required"
  | "qualified-review-packet-ready";

type LabeledOption<T extends string> = {
  id: T;
  label: string;
  description: string;
};

export type IntendedUseReviewEvaluation = {
  service: "scrimed-intended-use-review";
  status: typeof intendedUseReviewStatus;
  memoVersion: typeof intendedUseMemoVersion;
  memoReference: typeof intendedUseMemoReference;
  decision: IntendedUseReviewDecision;
  canEnterQualifiedReview: boolean;
  approved: false;
  approvalClaimAllowed: false;
  externalUseAuthorized: false;
  phiAuthority: false;
  clinicalAuthority: false;
  productionAuthority: false;
  blockers: string[];
  evidenceGaps: string[];
  requiredReviewers: string[];
  requiredEvidence: string[];
  packet: {
    intendedUseStatement: string;
    workflow: string;
    operatingMode: string;
    dataBoundary: string;
    audience: string;
    autonomyBoundary: string;
    requestedActions: string[];
    explicitExclusions: string[];
    humanOversight: string;
    reviewExpiry: string;
  };
  nextAction: string;
  boundary: typeof intendedUseReviewBoundary;
};

export const intendedUseReviewStatus = "intended-use-review-packet-safe-draft-only";
export const intendedUseMemoVersion = "0.1";
export const intendedUseMemoReference = "docs/SCRIMED_INTENDED_USE_MEMO.md";
export const intendedUseReviewUpdatedAt = "2026-07-18";

export const intendedUseReviewBoundary =
  "SCRIMED Intended Use Review creates a controlled, no-PHI scope assessment and qualified-review packet. It cannot approve itself, provide legal or regulatory advice, authorize PHI, grant clinical authority, approve production use, clear public claims, replace qualified reviewers, or record signatures. Final reviewer identities, decisions, dates, evidence references, effective date, and expiry must remain in an approved external system of record.";

export const intendedUseWorkflowOptions: ReadonlyArray<LabeledOption<IntendedUseWorkflow>> = [
  {
    id: "workflow-intelligence",
    label: "Workflow intelligence",
    description: "Operational assessment, bottleneck analysis, and governed workflow preparation."
  },
  {
    id: "synthetic-clinical-robustness",
    label: "Synthetic clinical robustness",
    description: "Synthetic evaluation of evidence, uncertainty, safety, and review requirements."
  },
  {
    id: "documentation-support",
    label: "Documentation support",
    description: "Human-reviewed drafting and missing-documentation preparation."
  },
  {
    id: "patient-education-drafting",
    label: "Patient education drafting",
    description: "Source-grounded educational drafts requiring licensed clinical review."
  },
  {
    id: "prior-authorization-drafting",
    label: "Prior authorization drafting",
    description: "Documentation-before-authorization preparation without payer submission."
  },
  {
    id: "interoperability-preview",
    label: "Interoperability preview",
    description: "Synthetic FHIR, HL7, DICOM, and X12 mapping or conformance previews."
  },
  {
    id: "research-evidence-synthesis",
    label: "Research evidence synthesis",
    description: "Cited research organization without clinical recommendation authority."
  }
];

export const intendedUseOperatingModeOptions: ReadonlyArray<LabeledOption<IntendedUseOperatingMode>> = [
  { id: "public-no-phi", label: "Public no-PHI", description: "Public information or synthetic demonstration only." },
  { id: "internal-synthetic", label: "Internal synthetic", description: "Internal engineering, evaluation, and governance review." },
  {
    id: "protected-no-phi-pilot",
    label: "Protected no-PHI pilot",
    description: "Buyer-scoped synthetic pilot behind authorization and release controls."
  },
  { id: "production-live", label: "Production or live", description: "Outside the current approved operating boundary." }
];

export const intendedUseDataClassificationOptions: ReadonlyArray<LabeledOption<IntendedUseDataClassification>> = [
  { id: "public", label: "Public", description: "Publicly available, authorized information." },
  { id: "synthetic", label: "Synthetic", description: "Deterministic records that do not represent real people." },
  { id: "metadata-only", label: "Metadata only", description: "No raw sensitive content or identifiers." },
  {
    id: "irreversibly-deidentified",
    label: "Irreversibly de-identified",
    description: "Requires qualified privacy determination before use."
  },
  { id: "phi", label: "PHI or ePHI", description: "Blocked in the current operating posture." },
  { id: "restricted-clinical", label: "Restricted clinical", description: "Blocked pending separate authority and controls." }
];

export const intendedUseAudienceOptions: ReadonlyArray<LabeledOption<IntendedUseAudience>> = [
  { id: "internal-governance", label: "Internal governance", description: "Internal product, engineering, and control review." },
  { id: "buyer-diligence", label: "Buyer diligence", description: "Controlled diligence subject to recipient and release gates." },
  { id: "public-marketing", label: "Public marketing", description: "Requires claims, counsel, and release review." },
  { id: "customer-workflow", label: "Customer workflow", description: "Buyer-specific scope and named owner review required." },
  { id: "live-care", label: "Live care", description: "Outside the current authorized scope." }
];

export const intendedUseAutonomyOptions: ReadonlyArray<LabeledOption<IntendedUseAutonomyLevel>> = [
  { id: "read-only", label: "Read only", description: "Observe and organize without action." },
  { id: "recommend", label: "Recommend", description: "Prepare reviewable recommendations for an authorized human." },
  { id: "prepare", label: "Prepare", description: "Draft reversible artifacts without submission or external action." },
  { id: "execute", label: "Execute", description: "Consequential execution is blocked by the current memo." }
];

export const intendedUseEvidencePostureOptions: ReadonlyArray<LabeledOption<IntendedUseEvidencePosture>> = [
  {
    id: "source-cited-and-verified",
    label: "Cited and verified",
    description: "Sources, provenance, freshness, and consistency have reviewable evidence."
  },
  {
    id: "source-cited-unverified",
    label: "Cited, not verified",
    description: "Citations exist but independent consistency review is incomplete."
  },
  { id: "unsourced", label: "Unsourced", description: "Insufficient for a qualified review packet." }
];

export const intendedUseActionOptions: ReadonlyArray<
  LabeledOption<IntendedUseRequestedAction> & { classification: "allowed" | "review-required" | "prohibited" }
> = [
  { id: "workflow-assessment", label: "Workflow assessment", description: "Analyze a bounded workflow.", classification: "allowed" },
  { id: "evidence-organization", label: "Evidence organization", description: "Organize cited evidence and provenance.", classification: "allowed" },
  { id: "administrative-draft", label: "Administrative draft", description: "Prepare a human-reviewed draft.", classification: "allowed" },
  { id: "interoperability-preview", label: "Interoperability preview", description: "Preview synthetic mappings without writeback.", classification: "allowed" },
  { id: "patient-education-draft", label: "Patient education draft", description: "Licensed clinical review is mandatory.", classification: "review-required" },
  { id: "clinical-decision-support-draft", label: "Decision-support draft", description: "Decision support only with licensed review.", classification: "review-required" },
  { id: "diagnosis", label: "Diagnosis", description: "Autonomous or final diagnostic authority is prohibited.", classification: "prohibited" },
  { id: "treatment-selection", label: "Treatment selection", description: "Autonomous treatment selection is prohibited.", classification: "prohibited" },
  { id: "prescribing", label: "Prescribing", description: "Prescribing authority is prohibited.", classification: "prohibited" },
  { id: "final-imaging-interpretation", label: "Final imaging interpretation", description: "Final medical interpretation is prohibited.", classification: "prohibited" },
  { id: "patient-outreach", label: "Patient outreach", description: "External patient communication is separately gated.", classification: "prohibited" },
  { id: "payer-submission", label: "Payer submission", description: "Submission to a payer is prohibited.", classification: "prohibited" },
  { id: "ehr-writeback", label: "EHR writeback", description: "Production record mutation is prohibited.", classification: "prohibited" },
  { id: "external-communication", label: "External communication", description: "External sending requires separate release authority.", classification: "prohibited" },
  { id: "customer-go-live", label: "Customer go-live", description: "Customer activation requires separate authorization.", classification: "prohibited" },
  { id: "certification-claim", label: "Certification or clearance claim", description: "Unsupported certification claims are prohibited.", classification: "prohibited" }
];

export const intendedUseReviewInputTemplate: IntendedUseReviewInput = {
  workflow: "workflow-intelligence",
  operatingMode: "internal-synthetic",
  dataClassification: "synthetic",
  audience: "internal-governance",
  autonomyLevel: "recommend",
  evidencePosture: "source-cited-and-verified",
  requestedActions: ["workflow-assessment", "evidence-organization"]
};

const explicitExclusions = [
  "No autonomous diagnosis, treatment selection, prescribing, triage, or final medical decision.",
  "No final imaging interpretation.",
  "No live PHI or restricted clinical data under the current memo.",
  "No patient outreach, payer submission, EHR writeback, appointment booking, or external communication.",
  "No production customer activation, certification, clearance, validation, reimbursement, or outcome claim without issued evidence and qualified authority."
];

const clinicalWorkflows = new Set<IntendedUseWorkflow>([
  "synthetic-clinical-robustness",
  "documentation-support",
  "patient-education-drafting",
  "prior-authorization-drafting"
]);

const actionById = new Map(intendedUseActionOptions.map((option) => [option.id, option]));

function optionLabel<T extends string>(options: ReadonlyArray<LabeledOption<T>>, id: T) {
  return options.find((option) => option.id === id)?.label ?? id;
}

function unique(values: string[]) {
  return [...new Set(values)];
}

export function evaluateIntendedUseReview(input: IntendedUseReviewInput): IntendedUseReviewEvaluation {
  const blockers: string[] = [];
  const evidenceGaps: string[] = [];
  const requiredReviewers = ["Founder/CEO", "Qualified legal reviewer", "Clinical governance reviewer"];
  const requiredEvidence = [
    `Proposed Intended Use Memo ${intendedUseMemoVersion}`,
    "Claims register and QA Claim Guard result",
    "Current no-PHI automated technical quality gate",
    "Reviewer identities, decisions, dates, memo version, effective date, and expiry retained outside source code"
  ];

  if (input.requestedActions.length === 0) {
    evidenceGaps.push("Select at least one bounded requested action.");
  }

  if (input.operatingMode === "production-live") {
    blockers.push("Production or live operation is outside the current Intended Use Memo.");
  }

  if (input.dataClassification === "phi" || input.dataClassification === "restricted-clinical") {
    blockers.push("Live PHI, ePHI, and restricted clinical data remain outside the current authority boundary.");
  }

  if (input.audience === "live-care") {
    blockers.push("Live-care use requires separate clinical, legal, privacy, security, customer, and regulatory authority.");
  }

  if (input.autonomyLevel === "execute") {
    blockers.push("Consequential autonomous execution is prohibited under the current Intended Use Memo.");
  }

  for (const action of input.requestedActions) {
    const option = actionById.get(action);
    if (!option) {
      blockers.push(`Unknown requested action: ${action}.`);
      continue;
    }
    if (option.classification === "prohibited") {
      blockers.push(`${option.label} is outside the current Intended Use Memo.`);
    }
    if (option.classification === "review-required") {
      requiredReviewers.push("Licensed clinical reviewer");
      requiredEvidence.push(`Source-grounded ${option.label.toLowerCase()} review rubric`);
    }
  }

  if (clinicalWorkflows.has(input.workflow)) {
    requiredReviewers.push("Licensed clinical reviewer");
    requiredEvidence.push("Workflow-specific clinical safety and escalation rubric");
    if (input.evidencePosture !== "source-cited-and-verified") {
      evidenceGaps.push("Clinical-facing drafts require cited, independently verified evidence before qualified review.");
    }
  }

  if (input.evidencePosture === "unsourced") {
    evidenceGaps.push("Source citations, provenance, freshness, and consistency evidence are required.");
  } else if (input.evidencePosture === "source-cited-unverified") {
    evidenceGaps.push("Independent source and citation consistency verification remains required.");
  }

  if (input.dataClassification === "irreversibly-deidentified") {
    requiredReviewers.push("Qualified privacy reviewer");
    requiredEvidence.push("External de-identification determination and permitted-use record");
  }

  if (input.operatingMode === "protected-no-phi-pilot") {
    requiredReviewers.push("Security reviewer", "Privacy reviewer", "Buyer sponsor", "Pilot lead");
    requiredEvidence.push(
      "Buyer-approved no-PHI pilot scope and success metrics",
      "Strict AAL2 protected-write smoke evidence",
      "Buyer release-control and rollback packet"
    );
  }

  if (input.audience === "buyer-diligence" || input.audience === "public-marketing") {
    requiredReviewers.push("Claims and communications reviewer", "Release steward");
    requiredEvidence.push("Audience-specific release decision and retained claim evidence");
  }

  if (input.audience === "customer-workflow") {
    requiredReviewers.push("Buyer sponsor", "Pilot lead");
    requiredEvidence.push("Buyer-specific scope, acceptance criteria, owner, and rollback record");
  }

  const decision: IntendedUseReviewDecision = input.requestedActions.length === 0
    ? "input-required"
    : blockers.length > 0
      ? "blocked-prohibited-scope"
      : evidenceGaps.length > 0
        ? "evidence-required"
        : "qualified-review-packet-ready";

  const actionLabels = input.requestedActions.map((action) => actionById.get(action)?.label ?? action);
  const workflowLabel = optionLabel(intendedUseWorkflowOptions, input.workflow);
  const operatingModeLabel = optionLabel(intendedUseOperatingModeOptions, input.operatingMode);
  const dataLabel = optionLabel(intendedUseDataClassificationOptions, input.dataClassification);
  const audienceLabel = optionLabel(intendedUseAudienceOptions, input.audience);
  const autonomyLabel = optionLabel(intendedUseAutonomyOptions, input.autonomyLevel);

  return {
    service: "scrimed-intended-use-review",
    status: intendedUseReviewStatus,
    memoVersion: intendedUseMemoVersion,
    memoReference: intendedUseMemoReference,
    decision,
    canEnterQualifiedReview: decision === "qualified-review-packet-ready",
    approved: false,
    approvalClaimAllowed: false,
    externalUseAuthorized: false,
    phiAuthority: false,
    clinicalAuthority: false,
    productionAuthority: false,
    blockers: unique(blockers),
    evidenceGaps: unique(evidenceGaps),
    requiredReviewers: unique(requiredReviewers),
    requiredEvidence: unique(requiredEvidence),
    packet: {
      intendedUseStatement:
        `SCRIMED may support ${workflowLabel.toLowerCase()} in ${operatingModeLabel.toLowerCase()} mode using ${dataLabel.toLowerCase()} inputs for ${audienceLabel.toLowerCase()}. Outputs remain evidence-grounded, reviewable workflow support and never constitute autonomous clinical authority.`,
      workflow: workflowLabel,
      operatingMode: operatingModeLabel,
      dataBoundary: dataLabel,
      audience: audienceLabel,
      autonomyBoundary: `${autonomyLabel}; consequential actions remain separately approval-gated and disabled by default.`,
      requestedActions: actionLabels,
      explicitExclusions,
      humanOversight:
        "Founder/CEO, qualified legal, and clinical governance approval are mandatory. Licensed clinical, privacy, security, communications, pilot, buyer, or regulatory review is added when the selected scope triggers it.",
      reviewExpiry: "90 days after approval or immediately upon a material scope, claim, data, model, workflow, jurisdiction, or deployment change."
    },
    nextAction: decision === "qualified-review-packet-ready"
      ? "Send the proposed memo and this packet to the named qualified reviewers, then retain identities, decisions, dates, version, effective date, and expiry in an approved external system of record."
      : decision === "evidence-required"
        ? "Close every evidence gap, rerun this assessment, and keep the proposed memo unapproved."
        : decision === "blocked-prohibited-scope"
          ? "Remove prohibited scope or open the separate clinical, privacy, security, customer, and regulatory authorization path. Do not self-approve or weaken the boundary."
          : "Select at least one bounded action before preparing a review packet.",
    boundary: intendedUseReviewBoundary
  };
}

export function getIntendedUseReviewProgram() {
  const defaultEvaluation = evaluateIntendedUseReview(intendedUseReviewInputTemplate);

  return {
    service: "scrimed-intended-use-review",
    status: intendedUseReviewStatus,
    memoVersion: intendedUseMemoVersion,
    memoReference: intendedUseMemoReference,
    updated: intendedUseReviewUpdatedAt,
    inputMode: "controlled-options-no-free-text-no-phi",
    persistence: "none-browser-local-evaluation-only",
    approvalAuthority: "qualified-humans-external-system-of-record-only",
    defaultEvaluation,
    workflowOptions: intendedUseWorkflowOptions,
    operatingModeOptions: intendedUseOperatingModeOptions,
    dataClassificationOptions: intendedUseDataClassificationOptions,
    audienceOptions: intendedUseAudienceOptions,
    autonomyOptions: intendedUseAutonomyOptions,
    evidencePostureOptions: intendedUseEvidencePostureOptions,
    actionOptions: intendedUseActionOptions,
    boundary: intendedUseReviewBoundary
  };
}
