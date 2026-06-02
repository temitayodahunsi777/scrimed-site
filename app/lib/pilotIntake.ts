export type PilotIntakeOption = {
  value: string;
  label: string;
  description: string;
};

export type PilotIntakeSubmission = {
  fullName: string;
  workEmail: string;
  organization: string;
  role: string;
  phone: string;
  website: string;
  buyerSegment: string;
  organizationSize: string;
  region: string;
  offerInterest: string;
  workflowTargets: string[];
  readinessNeeds: string[];
  governanceRequirements: string[];
  timeline: string;
  interoperabilityContext: string;
  pilotGoals: string;
  boundaryAcknowledged: boolean;
  contactConsent: boolean;
  source: string;
};

export type PilotIntakeValidationError = {
  field: string;
  message: string;
};

export type PilotIntakeAssessment = {
  qualification: "synthetic-pilot-qualified" | "assessment-first" | "governance-first";
  recommendedOffer: string;
  recommendedNextStep: string;
  governanceGates: string[];
  riskFlags: string[];
  crmTags: string[];
};

export type PilotIntakeHandoffPayload = {
  intakeId: string;
  receivedAt: string;
  boundary: string;
  contact: {
    fullName: string;
    workEmail: string;
    phone: string;
    role: string;
  };
  organization: {
    name: string;
    website: string;
    buyerSegment: string;
    organizationSize: string;
    region: string;
  };
  scope: {
    offerInterest: string;
    workflowTargets: string[];
    readinessNeeds: string[];
    governanceRequirements: string[];
    timeline: string;
    interoperabilityContext: string;
    pilotGoals: string;
  };
  assessment: PilotIntakeAssessment;
  source: string;
};

export const pilotIntakeBoundary =
  "SCRIMED pilot intake captures business-contact and workflow-scope information only. Do not submit protected health information, patient identifiers, medical-record content, diagnosis details, payer member identifiers, or live clinical data. Submission does not initiate diagnosis, care delivery, patient outreach, payer submission, or autonomous clinical execution.";

export const pilotServiceOffers: PilotIntakeOption[] = [
  {
    value: "synthetic-pilot-evaluation",
    label: "Synthetic Pilot Evaluation",
    description:
      "A 30 to 90 day governed evaluation using synthetic workflow evidence, scoped agents, and executive findings."
  },
  {
    value: "workflow-intelligence-assessment",
    label: "Workflow Intelligence Assessment",
    description:
      "Workflow inventory, friction mapping, automation-candidate scoring, and interoperability target definition."
  },
  {
    value: "ai-readiness-governance-audit",
    label: "AI Readiness + Governance Audit",
    description:
      "Privacy, auditability, safety, role-control, and production-readiness gaps before live healthcare AI deployment."
  },
  {
    value: "clinical-operations-automation-blueprint",
    label: "Clinical Operations Automation Blueprint",
    description:
      "Phased automation roadmap with agent responsibilities, connector boundaries, review queues, and safety gates."
  }
];

export const pilotBuyerSegments: PilotIntakeOption[] = [
  {
    value: "health-system",
    label: "Health system / hospital",
    description: "Hospitals, IDNs, specialty centers, and enterprise care-delivery operators."
  },
  {
    value: "payer",
    label: "Payer / health plan",
    description: "Health plans, utilization management, claims, and care-management organizations."
  },
  {
    value: "clinic-network",
    label: "Clinic network",
    description: "Ambulatory, primary care, specialty, urgent care, or multi-site clinic groups."
  },
  {
    value: "government-public-health",
    label: "Government / public health",
    description: "Public-sector health teams, ministries, agencies, and regional health authorities."
  },
  {
    value: "research-life-sciences",
    label: "Research / life sciences",
    description: "Academic medical centers, research operations, trial networks, and life-sciences teams."
  },
  {
    value: "investor-partner",
    label: "Investor / strategic partner",
    description: "Investment, venture, strategic partnership, accelerator, and ecosystem stakeholders."
  }
];

export const pilotOrganizationSizes: PilotIntakeOption[] = [
  { value: "1-50", label: "1-50", description: "Small organization or focused innovation team." },
  { value: "51-500", label: "51-500", description: "Multi-team operator or regional care organization." },
  { value: "501-5000", label: "501-5,000", description: "Enterprise organization with multiple departments." },
  { value: "5000-plus", label: "5,000+", description: "Large enterprise, government, or national healthcare operator." }
];

export const pilotRegions: PilotIntakeOption[] = [
  { value: "united-states", label: "United States", description: "US healthcare, payer, provider, or public-sector environment." },
  { value: "middle-east", label: "UAE / Saudi / Kuwait", description: "Middle East enterprise, public-sector, or provider environment." },
  { value: "africa", label: "Nigeria / Kenya / Rwanda / Ghana", description: "African healthcare access, operations, or public health environment." },
  { value: "europe", label: "Europe", description: "European healthcare, research, or governance environment." },
  { value: "global", label: "Global / multi-region", description: "Cross-border or multi-region healthcare operating context." }
];

export const pilotWorkflowTargets: PilotIntakeOption[] = [
  {
    value: "referral-intake",
    label: "Referral intake automation",
    description: "Referral queue structuring, missing information detection, routing rationale, and escalation boundaries."
  },
  {
    value: "prior-authorization",
    label: "Prior authorization support",
    description: "Reviewable packet preparation, policy rationale, missing evidence, and human approval state."
  },
  {
    value: "patient-onboarding",
    label: "Patient onboarding triage",
    description: "Synthetic onboarding profiles, navigation queues, urgency rationale, and review triggers."
  },
  {
    value: "ambient-documentation",
    label: "Ambient documentation review",
    description: "Draft-only documentation support, source trace, missing context, and clinician review prompts."
  },
  {
    value: "rcm-denial-risk",
    label: "RCM denial risk review",
    description: "Denial-risk rationale, documentation gaps, appeal outline, and coding-review queues."
  },
  {
    value: "care-gap-detection",
    label: "Care gap detection",
    description: "Reviewable care-gap signals, context summary, source trace, and escalation boundary."
  },
  {
    value: "trial-matching",
    label: "Trial matching operations",
    description: "Eligibility review queues, criteria trace, missing evidence, and research review requirements."
  },
  {
    value: "governance-operating-layer",
    label: "AI governance operating layer",
    description: "Cross-workflow oversight, auditability, model/workflow controls, and production gates."
  }
];

export const pilotReadinessNeeds: PilotIntakeOption[] = [
  {
    value: "workflow-map",
    label: "Workflow map",
    description: "Current-state workflow inventory, friction points, handoffs, and target operating model."
  },
  {
    value: "synthetic-demo",
    label: "Synthetic demo",
    description: "Deterministic synthetic evidence for buyer-facing evaluation without live clinical data."
  },
  {
    value: "integration-map",
    label: "Integration map",
    description: "FHIR, HL7, claims, EHR, data warehouse, device, or public-health connector planning."
  },
  {
    value: "security-review",
    label: "Security review",
    description: "Privacy, access, encryption, monitoring, incident response, and vendor-risk review."
  },
  {
    value: "executive-brief",
    label: "Executive brief",
    description: "Board, executive, investor, or sponsor-ready summary of value, risk, and next decisions."
  },
  {
    value: "roi-model",
    label: "ROI model",
    description: "Pilot measurement plan for time saved, friction reduced, access bottlenecks, and revenue leakage."
  }
];

export const pilotGovernanceRequirements: PilotIntakeOption[] = [
  {
    value: "human-review",
    label: "Human review required",
    description: "All workflow outputs remain review-gated before external, clinical, payer, or patient-facing action."
  },
  {
    value: "synthetic-only",
    label: "Synthetic data only",
    description: "Initial evaluation avoids production clinical records and protected health information."
  },
  {
    value: "audit-trail",
    label: "Audit trail",
    description: "Inspectable evidence, denied-action records, source trace, and review-state metadata."
  },
  {
    value: "hipaa-ready",
    label: "HIPAA-ready posture",
    description: "Privacy, security, access, vendor, and audit controls before protected health information."
  },
  {
    value: "role-based-access",
    label: "Role-based access",
    description: "Tenant identity, permissions, service auth, consent, break-glass, and least-privilege design."
  },
  {
    value: "no-autonomous-diagnosis",
    label: "No autonomous diagnosis",
    description: "Operational intelligence and review prompts only; no replacement of licensed clinician judgment."
  }
];

export const pilotTimelineOptions: PilotIntakeOption[] = [
  { value: "now", label: "Now / active evaluation", description: "Buyer is actively evaluating vendors or pilots." },
  { value: "30-90-days", label: "30-90 days", description: "Pilot or assessment planning is near-term." },
  { value: "3-6-months", label: "3-6 months", description: "Transformation planning is underway." },
  { value: "exploratory", label: "Exploratory", description: "Early-stage discovery, partnership, or investor discussion." }
];

export function getPilotIntakeSummary() {
  const webhookConfigured = Boolean(process.env.SCRIMED_PILOT_INTAKE_WEBHOOK_URL);

  return {
    service: "scrimed-pilot-intake",
    route: "/pilot",
    apiRoute: "/api/pilot/intake",
    status: webhookConfigured ? "crm-routing-configured" : "crm-handoff-ready",
    boundary: pilotIntakeBoundary,
    serviceOffers: pilotServiceOffers,
    buyerSegments: pilotBuyerSegments,
    organizationSizes: pilotOrganizationSizes,
    regions: pilotRegions,
    workflowTargets: pilotWorkflowTargets,
    readinessNeeds: pilotReadinessNeeds,
    governanceRequirements: pilotGovernanceRequirements,
    timelineOptions: pilotTimelineOptions,
    crmRouting: {
      webhookConfigured,
      supportedDestinations: ["HubSpot workflow", "Wix automation", "Zapier/Make", "secure CRM webhook"],
      currentMode: webhookConfigured ? "configured-webhook" : "manual-crm-handoff"
    },
    requiredAcknowledgements: [
      "No protected health information or patient identifiers",
      "Synthetic pilot or assessment only",
      "No autonomous diagnosis, treatment, payer submission, or patient outreach",
      "Human review remains required before production execution"
    ],
    updated: "2026-06-02"
  };
}

export type PilotIntakeSummary = ReturnType<typeof getPilotIntakeSummary>;

export function validatePilotIntakePayload(payload: unknown):
  | { ok: true; submission: PilotIntakeSubmission }
  | { ok: false; errors: PilotIntakeValidationError[] } {
  const errors: PilotIntakeValidationError[] = [];

  if (!isRecord(payload)) {
    return {
      ok: false,
      errors: [{ field: "payload", message: "Request body must be a JSON object." }]
    };
  }

  const fullName = readText(payload, "fullName", 120, errors, true);
  const workEmail = readText(payload, "workEmail", 180, errors, true);
  const organization = readText(payload, "organization", 160, errors, true);
  const role = readText(payload, "role", 140, errors, true);
  const phone = readText(payload, "phone", 60, errors, false);
  const website = readText(payload, "website", 180, errors, false);
  const buyerSegment = readOption(payload, "buyerSegment", pilotBuyerSegments, errors);
  const organizationSize = readOption(payload, "organizationSize", pilotOrganizationSizes, errors);
  const region = readOption(payload, "region", pilotRegions, errors);
  const offerInterest = readOption(payload, "offerInterest", pilotServiceOffers, errors);
  const workflowTargets = readOptionList(payload, "workflowTargets", pilotWorkflowTargets, errors, 1, 4);
  const readinessNeeds = readOptionList(payload, "readinessNeeds", pilotReadinessNeeds, errors, 1, 5);
  const governanceRequirements = readOptionList(
    payload,
    "governanceRequirements",
    pilotGovernanceRequirements,
    errors,
    1,
    6
  );
  const timeline = readOption(payload, "timeline", pilotTimelineOptions, errors);
  const interoperabilityContext = readText(payload, "interoperabilityContext", 1000, errors, false);
  const pilotGoals = readText(payload, "pilotGoals", 1200, errors, true);
  const source = readText(payload, "source", 120, errors, false) || "/pilot";
  const boundaryAcknowledged = payload.boundaryAcknowledged === true;
  const contactConsent = payload.contactConsent === true;

  if (workEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail)) {
    errors.push({ field: "workEmail", message: "Use a valid work email address." });
  }

  if (website && !/^(https?:\/\/)?[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(website)) {
    errors.push({ field: "website", message: "Use a valid organization website or leave it blank." });
  }

  if (!boundaryAcknowledged) {
    errors.push({
      field: "boundaryAcknowledged",
      message: "Acknowledge that this intake excludes PHI and remains synthetic/evaluation-only."
    });
  }

  if (!contactConsent) {
    errors.push({
      field: "contactConsent",
      message: "Consent is required so SCRIMED can respond to the enterprise intake."
    });
  }

  const sensitiveFields = [
    { field: "interoperabilityContext", value: interoperabilityContext },
    { field: "pilotGoals", value: pilotGoals }
  ];

  for (const item of sensitiveFields) {
    const marker = detectSensitiveHealthData(item.value);
    if (marker) {
      errors.push({
        field: item.field,
        message: `Remove patient-level or protected health information before submitting. Detected marker: ${marker}.`
      });
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    submission: {
      fullName,
      workEmail,
      organization,
      role,
      phone,
      website,
      buyerSegment,
      organizationSize,
      region,
      offerInterest,
      workflowTargets,
      readinessNeeds,
      governanceRequirements,
      timeline,
      interoperabilityContext,
      pilotGoals,
      boundaryAcknowledged,
      contactConsent,
      source
    }
  };
}

export function buildPilotIntakeAssessment(submission: PilotIntakeSubmission): PilotIntakeAssessment {
  const governanceLabels = submission.governanceRequirements.map((value) =>
    getOptionLabel(pilotGovernanceRequirements, value)
  );
  const workflowLabels = submission.workflowTargets.map((value) => getOptionLabel(pilotWorkflowTargets, value));
  const readinessLabels = submission.readinessNeeds.map((value) => getOptionLabel(pilotReadinessNeeds, value));
  const selectedOffer = getOptionLabel(pilotServiceOffers, submission.offerInterest);
  const hasSecurityReview = submission.readinessNeeds.includes("security-review");
  const hasHipaa = submission.governanceRequirements.includes("hipaa-ready");
  const hasSyntheticOnly = submission.governanceRequirements.includes("synthetic-only");
  const hasMultipleWorkflows = submission.workflowTargets.length > 1;
  const qualification =
    hasSecurityReview || hasHipaa
      ? "governance-first"
      : hasSyntheticOnly && hasMultipleWorkflows
        ? "synthetic-pilot-qualified"
        : "assessment-first";

  return {
    qualification,
    recommendedOffer: selectedOffer,
    recommendedNextStep:
      qualification === "governance-first"
        ? "Run governance and AI-readiness scoping before pilot activation, then define synthetic fixtures and review gates."
        : qualification === "synthetic-pilot-qualified"
          ? "Confirm executive sponsor, synthetic fixture scope, workflow owners, pilot metrics, and review-state responsibilities."
          : "Start with workflow intelligence assessment to map friction, automation candidates, and buyer-specific proof routes.",
    governanceGates: [
      "No PHI or patient identifiers in intake",
      "Synthetic data only until approved production controls",
      "Human review before external, clinical, payer, or patient-facing action",
      ...governanceLabels
    ],
    riskFlags: [
      "Live clinical execution remains gated",
      "CRM handoff contains business-contact and workflow-scope information only",
      "Pilot outcomes must be measured against buyer-approved operational baselines"
    ],
    crmTags: [
      `offer:${submission.offerInterest}`,
      `segment:${submission.buyerSegment}`,
      `timeline:${submission.timeline}`,
      ...workflowLabels.map((label) => `workflow:${label}`),
      ...readinessLabels.map((label) => `readiness:${label}`)
    ]
  };
}

export function buildPilotIntakeHandoffPayload(
  intakeId: string,
  receivedAt: string,
  submission: PilotIntakeSubmission,
  assessment: PilotIntakeAssessment
): PilotIntakeHandoffPayload {
  return {
    intakeId,
    receivedAt,
    boundary: pilotIntakeBoundary,
    contact: {
      fullName: submission.fullName,
      workEmail: submission.workEmail,
      phone: submission.phone,
      role: submission.role
    },
    organization: {
      name: submission.organization,
      website: submission.website,
      buyerSegment: getOptionLabel(pilotBuyerSegments, submission.buyerSegment),
      organizationSize: getOptionLabel(pilotOrganizationSizes, submission.organizationSize),
      region: getOptionLabel(pilotRegions, submission.region)
    },
    scope: {
      offerInterest: getOptionLabel(pilotServiceOffers, submission.offerInterest),
      workflowTargets: submission.workflowTargets.map((value) => getOptionLabel(pilotWorkflowTargets, value)),
      readinessNeeds: submission.readinessNeeds.map((value) => getOptionLabel(pilotReadinessNeeds, value)),
      governanceRequirements: submission.governanceRequirements.map((value) =>
        getOptionLabel(pilotGovernanceRequirements, value)
      ),
      timeline: getOptionLabel(pilotTimelineOptions, submission.timeline),
      interoperabilityContext: submission.interoperabilityContext,
      pilotGoals: submission.pilotGoals
    },
    assessment,
    source: submission.source
  };
}

export function getOptionLabel(options: PilotIntakeOption[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(
  payload: Record<string, unknown>,
  field: string,
  maxLength: number,
  errors: PilotIntakeValidationError[],
  required: boolean
) {
  const value = payload[field];

  if (typeof value !== "string") {
    if (required) {
      errors.push({ field, message: "This field is required." });
    }
    return "";
  }

  const trimmed = value.trim();

  if (required && !trimmed) {
    errors.push({ field, message: "This field is required." });
    return "";
  }

  if (trimmed.length > maxLength) {
    errors.push({ field, message: `Keep this field under ${maxLength} characters.` });
  }

  return trimmed;
}

function readOption(
  payload: Record<string, unknown>,
  field: string,
  options: PilotIntakeOption[],
  errors: PilotIntakeValidationError[]
) {
  const value = readText(payload, field, 120, errors, true);
  const allowedValues = new Set(options.map((option) => option.value));

  if (value && !allowedValues.has(value)) {
    errors.push({ field, message: "Choose a supported option." });
  }

  return value;
}

function readOptionList(
  payload: Record<string, unknown>,
  field: string,
  options: PilotIntakeOption[],
  errors: PilotIntakeValidationError[],
  minItems: number,
  maxItems: number
) {
  const value = payload[field];
  const allowedValues = new Set(options.map((option) => option.value));

  if (!Array.isArray(value)) {
    errors.push({ field, message: "Choose at least one supported option." });
    return [];
  }

  const uniqueValues = Array.from(
    new Set(value.filter((item): item is string => typeof item === "string").map((item) => item.trim()))
  ).filter(Boolean);

  if (uniqueValues.length < minItems) {
    errors.push({ field, message: `Choose at least ${minItems} option.` });
  }

  if (uniqueValues.length > maxItems) {
    errors.push({ field, message: `Choose no more than ${maxItems} options.` });
  }

  for (const item of uniqueValues) {
    if (!allowedValues.has(item)) {
      errors.push({ field, message: "Choose only supported options." });
      break;
    }
  }

  return uniqueValues;
}

function detectSensitiveHealthData(value: string) {
  const markers = [
    { label: "SSN pattern", pattern: /\b\d{3}-\d{2}-\d{4}\b/ },
    { label: "MRN", pattern: /\b(mrn|medical record number)\b/i },
    { label: "date of birth", pattern: /\b(date of birth|dob)\b/i },
    { label: "patient identifier", pattern: /\b(patient|member)\s+(identifier|id|name|dob)\b/i },
    { label: "insurance identifier", pattern: /\b(insurance id|member id|policy number)\b/i }
  ];

  return markers.find((marker) => marker.pattern.test(value))?.label;
}
