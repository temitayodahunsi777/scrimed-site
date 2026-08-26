import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";

export type InvestorDemoMode =
  | "executive-preview"
  | "technical-walkthrough"
  | "diligence-walkthrough";

export type InvestorDemoProofRoute = {
  label: string;
  route: string;
};

export type InvestorDemoChapter = {
  id: "workflow-wedge" | "governance-moat" | "commercial-path";
  order: number;
  title: string;
  durationSeconds: number;
  decisionPoint: string;
  talkTrack: string;
  evidenceStatement: string;
  primaryProof: InvestorDemoProofRoute;
  supportingProof: InvestorDemoProofRoute[];
  retainedBoundary: string;
};

export type InvestorDemoRunOfShow = {
  version: typeof investorDemoRunOfShowVersion;
  mode: InvestorDemoMode;
  modeLabel: string;
  durationMinutes: 3 | 12 | 30;
  durationSeconds: number;
  status: "ready-for-synthetic-guided-demonstration";
  audience: string;
  openingQuestion: string;
  chapters: InvestorDemoChapter[];
  evidenceMap: InvestorDemoEvidenceMapItem[];
  closingDecision: string;
  evidenceStandard: string;
  blockedClaims: string[];
  syntheticOnly: true;
  phiAllowed: false;
  clinicalExecutionAllowed: false;
  investmentSolicitationAuthorized: false;
  externalSendAuthorized: false;
  humanReviewRequired: true;
  auditHash: string;
};

export type InvestorDemoRehearsalCheck = {
  id:
    | "timebox-integrity"
    | "chapter-sequence"
    | "proof-route-scope"
    | "evidence-and-decision"
    | "evidence-map-completeness"
    | "boundary-coverage";
  label: string;
  status: "pass" | "fail";
  evidence: string;
};

export type InvestorDemoRehearsalAssessment = {
  mode: InvestorDemoMode;
  status: "ready-for-internal-rehearsal" | "blocked";
  internalRehearsalReady: boolean;
  automatedChecksPassed: number;
  automatedCheckCount: number;
  checks: InvestorDemoRehearsalCheck[];
  requiredHumanActions: string[];
  externalArtifactDistributionAuthorized: false;
  investmentSolicitationAuthorized: false;
  auditHash: string;
};

export const investorDemoRunOfShowVersion =
  "scrimed-investor-demo-run-of-show-v2-2026-08-12";

export type InvestorDemoEvidenceMapItem = {
  id:
    | "problem"
    | "workflow"
    | "synthetic-input"
    | "agents"
    | "model-routing"
    | "trust-engine"
    | "evidence"
    | "cost"
    | "value"
    | "safety-boundaries"
    | "pilot-conversion";
  label: string;
  statement: string;
  proofRoutes: string[];
  evidenceStatus: "synthetic-verified" | "implemented-local" | "human-review-required";
};

export const investorDemoRunOfShowBoundary =
  "This guided demonstration uses public, synthetic, and readiness metadata only. It is not investment advice, securities offering material, solicitation, audited financial reporting, valuation assurance, customer evidence, clinical validation, PHI authorization, live-care authority, payer submission, EHR writeback, production deployment approval, or customer go-live authorization.";

export const investorDemoModes: Array<{
  id: InvestorDemoMode;
  label: string;
  description: string;
  durationMinutes: 3 | 12 | 30;
}> = [
  {
    id: "executive-preview",
    label: "3-minute preview",
    description: "The wedge, the trust moat, and the next diligence decision.",
    durationMinutes: 3
  },
  {
    id: "technical-walkthrough",
    label: "12-minute walkthrough",
    description: "Architecture, agent controls, model routing, evidence, and pilot mechanics.",
    durationMinutes: 12
  },
  {
    id: "diligence-walkthrough",
    label: "30-minute diligence",
    description: "A controlled product, security, evidence, economics, and risk review.",
    durationMinutes: 30
  }
];

const durationAllocations: Record<InvestorDemoMode, readonly [number, number, number]> = {
  "executive-preview": [60, 75, 45],
  "technical-walkthrough": [300, 270, 150],
  "diligence-walkthrough": [720, 660, 420]
};

const investorDemoEvidenceMap: InvestorDemoEvidenceMapItem[] = [
  { id: "problem", label: "Problem", statement: "Administrative evidence gaps delay review and increase avoidable rework.", proofRoutes: ["/documentation-before-authorization"], evidenceStatus: "implemented-local" },
  { id: "workflow", label: "Workflow", statement: "A bounded synthetic workflow prepares evidence while retaining human decision authority.", proofRoutes: ["/demos/prior-authorization-support"], evidenceStatus: "synthetic-verified" },
  { id: "synthetic-input", label: "Synthetic input", statement: "Demonstration records contain no PHI and are explicitly labeled synthetic.", proofRoutes: ["/demos"], evidenceStatus: "synthetic-verified" },
  { id: "agents", label: "Agents", statement: "Specialists operate through scoped tools, bounded delegation, checkpoints, and review gates.", proofRoutes: ["/scrimed-work"], evidenceStatus: "implemented-local" },
  { id: "model-routing", label: "Model routing", statement: "Provider-neutral routing requires task qualification and cannot silently lower safety constraints.", proofRoutes: ["/scrimed-work"], evidenceStatus: "implemented-local" },
  { id: "trust-engine", label: "Trust Engine", statement: "Policy, evidence, approvals, audit, and rollback determine permitted execution.", proofRoutes: ["/trust-os", "/atlas"], evidenceStatus: "implemented-local" },
  { id: "evidence", label: "Evidence", statement: "Claims and outputs remain linked to inspectable routes, provenance, and current limitations.", proofRoutes: ["/validation-evidence"], evidenceStatus: "implemented-local" },
  { id: "cost", label: "Cost", statement: "Cost is evaluated per accepted evidence-backed output and remains synthetic until measured in an approved pilot.", proofRoutes: ["/pricing"], evidenceStatus: "human-review-required" },
  { id: "value", label: "Value", statement: "Baseline and outcome evidence are required before SCRIMED represents realized customer value.", proofRoutes: ["/pilot-value-evidence"], evidenceStatus: "human-review-required" },
  { id: "safety-boundaries", label: "Safety boundaries", statement: "No PHI, autonomous clinical care, payer submission, EHR writeback, or customer activation is authorized.", proofRoutes: ["/quality"], evidenceStatus: "synthetic-verified" },
  { id: "pilot-conversion", label: "Pilot conversion", statement: "The controlled next step is a scoped synthetic evaluation with acceptance criteria and named owners.", proofRoutes: ["/pilot-demo-commercial-readiness"], evidenceStatus: "human-review-required" }
];

const chapterDefinitions: Array<Omit<InvestorDemoChapter, "durationSeconds">> = [
  {
    id: "workflow-wedge",
    order: 1,
    title: "Start with one costly administrative workflow",
    decisionPoint: "Is the problem narrow, frequent, measurable, and safe enough for synthetic evaluation?",
    talkTrack:
      "Show how SCRIMED identifies documentation gaps before authorization preparation while keeping submission and medical-necessity judgment under human control.",
    evidenceStatement:
      "The demonstration exposes required documentation, missing evidence, review state, and retained payer boundaries using synthetic records.",
    primaryProof: {
      label: "Documentation Before Authorization",
      route: "/documentation-before-authorization"
    },
    supportingProof: [
      { label: "Prior authorization support demo", route: "/demos/prior-authorization-support" },
      { label: "Demo registry", route: "/demos" }
    ],
    retainedBoundary:
      "No payer submission, diagnosis, treatment recommendation, coding mutation, or medical-necessity determination."
  },
  {
    id: "governance-moat",
    order: 2,
    title: "Show governance as operating infrastructure",
    decisionPoint: "Can an enterprise inspect why an agent acted, what it used, and where it stopped?",
    talkTrack:
      "Move from the workflow into Atlas and TrustOS to show policy decisions, evidence provenance, human review, auditability, and fail-closed execution boundaries.",
    evidenceStatement:
      "SCRIMED differentiates through governed workflow structure, evidence controls, and replaceable model routing rather than dependence on one model vendor.",
    primaryProof: { label: "Atlas", route: "/atlas" },
    supportingProof: [
      { label: "TrustOS", route: "/trust-os" },
      { label: "Quality gates", route: "/quality" }
    ],
    retainedBoundary:
      "Governance readiness is not certification, regulatory approval, clinical validation, or deployment authority."
  },
  {
    id: "commercial-path",
    order: 3,
    title: "End with a finite evidence-producing next step",
    decisionPoint: "Is there enough proof to schedule diligence or scope a synthetic design-partner evaluation?",
    talkTrack:
      "Use the Demo-to-Pilot accelerator to connect workflow proof to a bounded package, accountable buyer roles, acceptance criteria, price-band context, and no-PHI intake.",
    evidenceStatement:
      "The next step is a governed synthetic evaluation with explicit proof requirements, not a promise of clinical outcomes or production deployment.",
    primaryProof: {
      label: "Demo-to-Pilot Accelerator",
      route: "/pilot-demo-commercial-readiness"
    },
    supportingProof: [
      { label: "Pilot packages", route: "/pilots" },
      { label: "Pricing context", route: "/pricing" }
    ],
    retainedBoundary:
      "No binding quote, securities solicitation, ROI guarantee, customer activation, PHI intake, or production commitment."
  }
];

const blockedClaims = [
  "Customer outcomes or deployments not supported by permissioned evidence",
  "Clinical validation, certification, clearance, or compliance status",
  "Guaranteed revenue, ROI, valuation, reimbursement, or investment return",
  "Production PHI, payer, EHR, device, or autonomous-care authority",
  "Investment, customer, or strategic relationships that have not been formally established"
];

export function buildInvestorDemoRunOfShow(
  mode: InvestorDemoMode
): InvestorDemoRunOfShow {
  const modeDefinition = investorDemoModes.find((entry) => entry.id === mode);
  if (!modeDefinition) {
    throw new Error(`Unsupported investor demo mode: ${mode}`);
  }

  const allocations = durationAllocations[mode];
  const chapters = chapterDefinitions.map((chapter, index) => ({
    ...chapter,
    durationSeconds: allocations[index]
  }));
  const durationSeconds = chapters.reduce(
    (total, chapter) => total + chapter.durationSeconds,
    0
  );

  const unsigned: Omit<InvestorDemoRunOfShow, "auditHash"> = {
    version: investorDemoRunOfShowVersion,
    mode,
    modeLabel: modeDefinition.label,
    durationMinutes: modeDefinition.durationMinutes,
    durationSeconds,
    status: "ready-for-synthetic-guided-demonstration" as const,
    audience:
      mode === "executive-preview"
        ? "Investor, strategic sponsor, or executive first meeting"
        : mode === "technical-walkthrough"
          ? "Technical, product, security, or clinical-operations follow-up"
          : "Structured technical, commercial, governance, and risk diligence",
    openingQuestion:
      "Can SCRIMED turn a measurable healthcare workflow problem into governed evidence without crossing live-care boundaries?",
    chapters,
    evidenceMap: investorDemoEvidenceMap,
    closingDecision:
      mode === "executive-preview"
        ? "Schedule a focused workflow and technical diligence session."
        : mode === "technical-walkthrough"
          ? "Define the evidence and integration questions for a synthetic design-partner evaluation."
          : "Record diligence findings, owners, unresolved risks, and the exact evidence needed for the next controlled decision.",
    evidenceStandard:
      "Use inspectable product behavior and clearly labeled synthetic evidence. State unknowns and blocked claims directly.",
    blockedClaims,
    syntheticOnly: true as const,
    phiAllowed: false as const,
    clinicalExecutionAllowed: false as const,
    investmentSolicitationAuthorized: false as const,
    externalSendAuthorized: false as const,
    humanReviewRequired: true as const
  };

  return {
    ...unsigned,
    auditHash: generateScrimedAuditHash(unsigned)
  };
}

function buildRehearsalCheck(
  id: InvestorDemoRehearsalCheck["id"],
  label: string,
  passed: boolean,
  evidence: string
): InvestorDemoRehearsalCheck {
  return {
    id,
    label,
    status: passed ? "pass" : "fail",
    evidence
  };
}

export function assessInvestorDemoRehearsal(
  mode: InvestorDemoMode
): InvestorDemoRehearsalAssessment {
  const plan = buildInvestorDemoRunOfShow(mode);
  const proofRoutes = plan.chapters.flatMap((chapter) => [
    chapter.primaryProof.route,
    ...chapter.supportingProof.map((proof) => proof.route)
  ]);
  const checks: InvestorDemoRehearsalCheck[] = [
    buildRehearsalCheck(
      "timebox-integrity",
      "The chapter allocations match the selected meeting timebox.",
      plan.durationSeconds === plan.durationMinutes * 60,
      `${plan.durationSeconds} seconds allocated across ${plan.chapters.length} chapters.`
    ),
    buildRehearsalCheck(
      "chapter-sequence",
      "The workflow, governance, and commercial chapters are ordered and unique.",
      plan.chapters.map((chapter) => chapter.order).join(",") === "1,2,3" &&
        new Set(plan.chapters.map((chapter) => chapter.id)).size === 3,
      plan.chapters.map((chapter) => chapter.id).join(" -> ")
    ),
    buildRehearsalCheck(
      "proof-route-scope",
      "Every proof stop is an internal SCRIMED route.",
      proofRoutes.every(
        (route) => route.startsWith("/") && !route.startsWith("//")
      ),
      `${proofRoutes.length} internal proof routes checked.`
    ),
    buildRehearsalCheck(
      "evidence-and-decision",
      "Every chapter names inspectable evidence and a decision question.",
      plan.chapters.every(
        (chapter) =>
          chapter.evidenceStatement.trim().length > 0 &&
          chapter.decisionPoint.trim().endsWith("?")
      ),
      `${plan.chapters.length} evidence statements and decision questions checked.`
    ),
    buildRehearsalCheck(
      "evidence-map-completeness",
      "The plan covers the complete investor evidence narrative without presenting estimates as outcomes.",
      plan.evidenceMap.length === 11 &&
        new Set(plan.evidenceMap.map((item) => item.id)).size === 11 &&
        plan.evidenceMap.every((item) => item.proofRoutes.length > 0),
      `${plan.evidenceMap.length} evidence dimensions mapped to inspectable routes.`
    ),
    buildRehearsalCheck(
      "boundary-coverage",
      "Every chapter retains an explicit authority boundary.",
      plan.chapters.every((chapter) => chapter.retainedBoundary.length > 40) &&
        plan.syntheticOnly &&
        !plan.phiAllowed &&
        !plan.clinicalExecutionAllowed &&
        !plan.externalSendAuthorized,
      "Synthetic-only, no-PHI, no-clinical-execution, and no-external-send controls retained."
    )
  ];
  const automatedChecksPassed = checks.filter(
    (check) => check.status === "pass"
  ).length;
  const internalRehearsalReady = automatedChecksPassed === checks.length;
  const unsigned = {
    mode,
    status: internalRehearsalReady
      ? ("ready-for-internal-rehearsal" as const)
      : ("blocked" as const),
    internalRehearsalReady,
    automatedChecksPassed,
    automatedCheckCount: checks.length,
    checks,
    requiredHumanActions: [
      "Founder or approved presenter confirms the audience, meeting objective, and one specific next-step ask.",
      "Presenter opens every proof route on the actual meeting device and rehearses the selected timebox.",
      "Founder verifies that any customer, financial, partnership, clinical, security, and market statements have current evidence and permission.",
      "Keep downloadable artifacts internal unless a separate recipient-specific release decision authorizes distribution."
    ],
    externalArtifactDistributionAuthorized: false as const,
    investmentSolicitationAuthorized: false as const
  };

  return {
    ...unsigned,
    auditHash: generateScrimedAuditHash(unsigned)
  };
}

export function getInvestorDemoRunOfShowSummary() {
  const plans = investorDemoModes.map((mode) =>
    buildInvestorDemoRunOfShow(mode.id)
  );
  const rehearsalAssessments = investorDemoModes.map((mode) =>
    assessInvestorDemoRehearsal(mode.id)
  );
  const recommendedRehearsalAssessment = assessInvestorDemoRehearsal(
    "executive-preview"
  );

  return {
    service: "scrimed-investor-demo-run-of-show",
    status: "guided-synthetic-investor-demo-ready",
    recommendedMode: "executive-preview" as const,
    modeCount: plans.length,
    proofChapterCount: chapterDefinitions.length,
    plans,
    rehearsalAssessments,
    recommendedRehearsalAssessment,
    boundary: investorDemoRunOfShowBoundary
  };
}
