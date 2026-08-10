import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";

export type PilotDemoSessionAudience =
  | "executive-sponsor"
  | "clinical-operations"
  | "technology-security"
  | "financial-operations"
  | "research-operations";

export type PilotDemoSessionFocus =
  | "workflow-proof"
  | "governance-controls"
  | "technical-evidence"
  | "commercial-scope";

export type PilotDemoSessionLength = 15 | 30 | 45;

export type PilotDemoSessionOption<T extends string | number> = {
  id: T;
  label: string;
  description: string;
};

export type PilotDemoSessionProofRoute = {
  label: string;
  route: string;
  evidence: string;
};

export type PilotDemoSessionCatalogEntry = {
  demoSlug: string;
  demoName: string;
  demoRoute: string;
  runRoute: string;
  runLabel: string;
  buyerFit: string;
  sponsorRole: string;
  workflowOwnerRole: string;
  recommendedPilotName: string;
  recommendedPilotRoute: string;
  pricingBand: string;
  proofRoutes: PilotDemoSessionProofRoute[];
  acceptanceCriteria: string[];
  closePlan: string;
  retainedBoundary: string;
  noPhiIntakeRoute: string;
};

export type PilotDemoSessionPlanStep = {
  id: "buyer-context" | "product-walkthrough" | "evidence-review" | "boundary-check" | "pilot-decision";
  title: string;
  minutes: number;
  objective: string;
  talkTrack: string;
  proof: PilotDemoSessionProofRoute;
};

export type PilotDemoSessionPlan = {
  planId: string;
  status: "ready-for-synthetic-guided-demo";
  demoSlug: string;
  demoName: string;
  audience: PilotDemoSessionAudience;
  audienceLabel: string;
  focus: PilotDemoSessionFocus;
  focusLabel: string;
  durationMinutes: PilotDemoSessionLength;
  decisionQuestion: string;
  sponsorRole: string;
  workflowOwnerRole: string;
  recommendedPilotName: string;
  recommendedPilotRoute: string;
  noPhiIntakeRoute: string;
  pricingBand: string;
  agenda: PilotDemoSessionPlanStep[];
  successCriteria: string[];
  buyerQuestions: string[];
  retainedBoundary: string;
  blockedActions: string[];
  syntheticOnly: true;
  humanReviewRequired: true;
  bindingQuoteAuthorized: false;
  externalSendAuthorized: false;
  releaseAuthorityGranted: false;
  auditHash: string;
};

export class PilotDemoSessionPlanError extends Error {
  readonly code:
    | "unknown-demo"
    | "unsupported-audience"
    | "unsupported-focus"
    | "unsupported-duration";

  constructor(
    code:
      | "unknown-demo"
      | "unsupported-audience"
      | "unsupported-focus"
      | "unsupported-duration",
    message: string
  ) {
    super(message);
    this.name = "PilotDemoSessionPlanError";
    this.code = code;
  }
}

export const pilotDemoSessionAudienceOptions: PilotDemoSessionOption<PilotDemoSessionAudience>[] = [
  {
    id: "executive-sponsor",
    label: "Executive sponsor",
    description: "Lead with operating value, accountable ownership, governance, and a finite buying decision."
  },
  {
    id: "clinical-operations",
    label: "Clinical operations",
    description: "Lead with workflow fit, review burden, source evidence, and preserved clinician control."
  },
  {
    id: "technology-security",
    label: "Technology and security",
    description: "Lead with architecture, isolation, provenance, interoperability, and denied production capabilities."
  },
  {
    id: "financial-operations",
    label: "Financial operations",
    description: "Lead with measurable workflow friction, review effort, scope discipline, and nonbinding economics."
  },
  {
    id: "research-operations",
    label: "Research operations",
    description: "Lead with evidence trace, missing-data visibility, review queues, and research governance."
  }
];

export const pilotDemoSessionFocusOptions: PilotDemoSessionOption<PilotDemoSessionFocus>[] = [
  {
    id: "workflow-proof",
    label: "Workflow proof",
    description: "Show the synthetic workflow, deterministic result, and buyer-visible operating outcome."
  },
  {
    id: "governance-controls",
    label: "Governance controls",
    description: "Show policy decisions, human review, traceability, and blocked consequential actions."
  },
  {
    id: "technical-evidence",
    label: "Technical evidence",
    description: "Show contracts, validation evidence, interoperability posture, and production blockers."
  },
  {
    id: "commercial-scope",
    label: "Commercial scope",
    description: "Show the bounded pilot, acceptance criteria, buyer owners, and safe next decision."
  }
];

export const pilotDemoSessionLengthOptions: PilotDemoSessionOption<PilotDemoSessionLength>[] = [
  { id: 15, label: "15 min", description: "Executive preview" },
  { id: 30, label: "30 min", description: "Standard buyer demo" },
  { id: 45, label: "45 min", description: "Working session" }
];

const meetingAllocations: Record<
  PilotDemoSessionLength,
  readonly [number, number, number, number, number]
> = {
  15: [2, 6, 3, 2, 2],
  30: [4, 12, 6, 4, 4],
  45: [5, 18, 10, 6, 6]
};

const audienceDecisionQuestions: Record<PilotDemoSessionAudience, string> = {
  "executive-sponsor":
    "Is there enough governed workflow proof to sponsor a finite, measurable synthetic pilot?",
  "clinical-operations":
    "Can this workflow reduce review friction while preserving qualified human control and source visibility?",
  "technology-security":
    "Does the evidence justify technical diligence without weakening tenant, data, connector, or execution boundaries?",
  "financial-operations":
    "Can the buyer define a measurable baseline and bounded paid evaluation without relying on ROI or reimbursement guarantees?",
  "research-operations":
    "Can structured evidence and review queues improve research operations without making enrollment or treatment decisions?"
};

const audienceQuestions: Record<PilotDemoSessionAudience, string> = {
  "executive-sponsor": "Which executive decision must this pilot make easier within one review cycle?",
  "clinical-operations": "Which qualified reviewer owns acceptance, correction, and escalation?",
  "technology-security": "Which architecture or assurance question must be resolved before any protected-data review?",
  "financial-operations": "Which buyer-approved baseline captures current effort, rework, delay, or exception burden?",
  "research-operations": "Which protocol, evidence, or review-queue bottleneck should the synthetic evaluation isolate?"
};

function findOption<T extends string | number>(
  options: PilotDemoSessionOption<T>[],
  id: T
): PilotDemoSessionOption<T> | undefined {
  return options.find((option) => option.id === id);
}

function selectFocusProof(
  entry: PilotDemoSessionCatalogEntry,
  focus: PilotDemoSessionFocus
): PilotDemoSessionProofRoute {
  if (focus === "commercial-scope") {
    return {
      label: "Recommended pilot",
      route: entry.recommendedPilotRoute,
      evidence: `${entry.recommendedPilotName}. ${entry.pricingBand}`
    };
  }

  const routeSignals: Record<Exclude<PilotDemoSessionFocus, "commercial-scope">, string[]> = {
    "workflow-proof": ["result", "workflow", "module"],
    "governance-controls": ["trust", "audit", "quality", "governance"],
    "technical-evidence": ["validation", "interoperability", "contract", "evaluation"]
  };
  const signals = routeSignals[focus];
  const matched = entry.proofRoutes.find((proof) => {
    const searchable = `${proof.label} ${proof.route} ${proof.evidence}`.toLowerCase();
    return signals.some((signal) => searchable.includes(signal));
  });

  if (matched) return matched;

  if (focus === "governance-controls") {
    return {
      label: "Quality and governance controls",
      route: "/quality",
      evidence: "Deterministic quality gates, human review, and retained production exclusions."
    };
  }

  if (focus === "technical-evidence") {
    return {
      label: "Production architecture evidence",
      route: "/production-architecture",
      evidence: "Typed architecture, provider-neutral controls, and explicit activation gates."
    };
  }

  return entry.proofRoutes[0] ?? {
    label: "Demo evidence",
    route: entry.demoRoute,
    evidence: "Synthetic workflow evidence and buyer-visible retained boundaries."
  };
}

export function buildPilotDemoSessionPlan(
  catalog: PilotDemoSessionCatalogEntry[],
  input: {
    demoSlug: string;
    audience: PilotDemoSessionAudience;
    focus: PilotDemoSessionFocus;
    durationMinutes: PilotDemoSessionLength;
  }
): PilotDemoSessionPlan {
  const entry = catalog.find((candidate) => candidate.demoSlug === input.demoSlug);
  if (!entry) {
    throw new PilotDemoSessionPlanError("unknown-demo", "The selected demo is not in the governed catalog.");
  }

  const audience = findOption(pilotDemoSessionAudienceOptions, input.audience);
  if (!audience) {
    throw new PilotDemoSessionPlanError("unsupported-audience", "The selected audience is not supported.");
  }

  const focus = findOption(pilotDemoSessionFocusOptions, input.focus);
  if (!focus) {
    throw new PilotDemoSessionPlanError("unsupported-focus", "The selected presentation focus is not supported.");
  }

  const duration = findOption(pilotDemoSessionLengthOptions, input.durationMinutes);
  if (!duration) {
    throw new PilotDemoSessionPlanError("unsupported-duration", "The selected meeting duration is not supported.");
  }

  const allocation = meetingAllocations[input.durationMinutes];
  const focusProof = selectFocusProof(entry, input.focus);
  const agenda: PilotDemoSessionPlanStep[] = [
    {
      id: "buyer-context",
      title: "Frame the buyer decision",
      minutes: allocation[0],
      objective: audienceDecisionQuestions[input.audience],
      talkTrack: `${entry.buyerFit} Start with one workflow decision, one accountable sponsor, and one measurable evaluation boundary.`,
      proof: {
        label: "Demo overview",
        route: entry.demoRoute,
        evidence: entry.buyerFit
      }
    },
    {
      id: "product-walkthrough",
      title: "Run the synthetic workflow",
      minutes: allocation[1],
      objective: "Show the product surface and deterministic workflow result without introducing buyer or patient data.",
      talkTrack: `${entry.runLabel}. Keep the walkthrough on the configured fixture, result state, reviewer handoff, and blocked actions.`,
      proof: {
        label: entry.runLabel,
        route: entry.runRoute,
        evidence: "Executable synthetic product surface with no production mutation."
      }
    },
    {
      id: "evidence-review",
      title: focus.label,
      minutes: allocation[2],
      objective: focus.description,
      talkTrack: `Use inspectable evidence to answer the buyer question. Distinguish demonstrated behavior from future activation requirements.`,
      proof: focusProof
    },
    {
      id: "boundary-check",
      title: "Confirm controls and exclusions",
      minutes: allocation[3],
      objective: "Make the human-review, no-PHI, and no-live-execution boundary explicit before discussing next steps.",
      talkTrack: entry.retainedBoundary,
      proof: {
        label: "Clinical production readiness",
        route: "/clinical-production-readiness",
        evidence: "Current activation gates, external approvals, and retained clinical boundaries."
      }
    },
    {
      id: "pilot-decision",
      title: "Agree on the bounded next decision",
      minutes: allocation[4],
      objective: entry.closePlan,
      talkTrack: `Recommend ${entry.recommendedPilotName} only after the buyer confirms a sponsor, workflow owner, synthetic input boundary, and acceptance criteria.`,
      proof: {
        label: entry.recommendedPilotName,
        route: entry.recommendedPilotRoute,
        evidence: entry.pricingBand
      }
    }
  ];

  const planIdentity = {
    demoSlug: input.demoSlug,
    audience: input.audience,
    focus: input.focus,
    durationMinutes: input.durationMinutes,
    recommendedPilotRoute: entry.recommendedPilotRoute,
    retainedBoundary: entry.retainedBoundary
  };

  return {
    planId: `demo-session-${generateScrimedAuditHash(planIdentity).replace("scrimed-intel-", "")}`,
    status: "ready-for-synthetic-guided-demo",
    demoSlug: entry.demoSlug,
    demoName: entry.demoName,
    audience: input.audience,
    audienceLabel: audience.label,
    focus: input.focus,
    focusLabel: focus.label,
    durationMinutes: input.durationMinutes,
    decisionQuestion: audienceDecisionQuestions[input.audience],
    sponsorRole: entry.sponsorRole,
    workflowOwnerRole: entry.workflowOwnerRole,
    recommendedPilotName: entry.recommendedPilotName,
    recommendedPilotRoute: entry.recommendedPilotRoute,
    noPhiIntakeRoute: entry.noPhiIntakeRoute,
    pricingBand: entry.pricingBand,
    agenda,
    successCriteria: entry.acceptanceCriteria.slice(0, 4),
    buyerQuestions: [
      audienceQuestions[input.audience],
      "Which synthetic or metadata-only input can the buyer approve for evaluation?",
      "What evidence and review result would justify the next paid decision?"
    ],
    retainedBoundary: entry.retainedBoundary,
    blockedActions: [
      "Do not accept PHI, patient identifiers, medical records, production credentials, or live connector payloads.",
      "Do not present synthetic output as diagnosis, treatment, prescribing, emergency monitoring, eligibility, or final clinical interpretation.",
      "Do not enable payer submission, EHR writeback, patient outreach, production connectors, or autonomous consequential actions.",
      "Do not represent this plan as a binding quote, customer approval, certification, validated outcome, or release authorization."
    ],
    syntheticOnly: true,
    humanReviewRequired: true,
    bindingQuoteAuthorized: false,
    externalSendAuthorized: false,
    releaseAuthorityGranted: false,
    auditHash: generateScrimedAuditHash({ ...planIdentity, agenda })
  };
}

export function serializePilotDemoSessionPlanMarkdown(plan: PilotDemoSessionPlan): string {
  return [
    `# ${plan.demoName} - Guided Demo Session Plan`,
    "",
    `Status: ${plan.status}`,
    `Audience: ${plan.audienceLabel}`,
    `Focus: ${plan.focusLabel}`,
    `Duration: ${plan.durationMinutes} minutes`,
    `Plan ID: ${plan.planId}`,
    `Audit hash: ${plan.auditHash}`,
    "",
    "## Decision Question",
    plan.decisionQuestion,
    "",
    "## Run of Show",
    ...plan.agenda.map(
      (step, index) =>
        `${index + 1}. ${step.title} (${step.minutes} min) - ${step.objective} Proof: ${step.proof.route}`
    ),
    "",
    "## Buyer Owners",
    `- Sponsor: ${plan.sponsorRole}`,
    `- Workflow owner: ${plan.workflowOwnerRole}`,
    "",
    "## Pilot Path",
    `- Recommended pilot: ${plan.recommendedPilotName}`,
    `- Pricing guidance: ${plan.pricingBand}`,
    `- No-PHI intake: ${plan.noPhiIntakeRoute}`,
    "",
    "## Success Criteria",
    ...plan.successCriteria.map((criterion) => `- ${criterion}`),
    "",
    "## Buyer Questions",
    ...plan.buyerQuestions.map((question) => `- ${question}`),
    "",
    "## Retained Boundary",
    plan.retainedBoundary,
    "",
    "## Blocked Actions",
    ...plan.blockedActions.map((action) => `- ${action}`),
    "",
    "Synthetic demonstration only. Human review is required. This plan does not authorize external distribution, a binding quote, production release, PHI processing, or clinical care."
  ].join("\n");
}
