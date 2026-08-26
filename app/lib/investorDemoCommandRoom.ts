import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import {
  assessInvestorDemoRehearsal,
  buildInvestorDemoRunOfShow,
  investorDemoModes,
  investorDemoRunOfShowBoundary,
  type InvestorDemoMode
} from "./investorDemoRunOfShow";

export type InvestorDemoProofCheckOutcome = "not-checked" | "pass" | "fail";

export type InvestorDemoProofCheck = {
  route: string;
  outcome: InvestorDemoProofCheckOutcome;
  httpStatus: number | null;
  boundaryHeadersValid: boolean;
};

export type InvestorDemoOperatorConfirmationId =
  | "audience-and-ask-confirmed"
  | "meeting-device-ready"
  | "claim-boundaries-reviewed"
  | "artifact-distribution-contained";

export type InvestorDemoOperatorConfirmation = {
  id: InvestorDemoOperatorConfirmationId;
  label: string;
  detail: string;
  confirmed: boolean;
};

export type InvestorDemoCommandRoomCheck = {
  id:
    | "rehearsal-contract"
    | "proof-route-contract"
    | "proof-route-boundaries"
    | "operator-confirmations"
    | "retained-authority-boundaries";
  label: string;
  status: "pass" | "pending" | "fail";
  evidence: string;
};

export type InvestorDemoCommandRoomStage =
  | "setup-required"
  | "blocked"
  | "ready-to-present"
  | "presentation-in-progress"
  | "presentation-complete";

export type InvestorDemoCommandRoomInput = {
  mode: InvestorDemoMode;
  proofChecks: InvestorDemoProofCheck[];
  confirmations: InvestorDemoOperatorConfirmation[];
  completedChapterIds: string[];
  elapsedSeconds: number;
};

export type InvestorDemoCommandRoomAssessment = {
  version: typeof investorDemoCommandRoomVersion;
  mode: InvestorDemoMode;
  stage: InvestorDemoCommandRoomStage;
  eligibleToBegin: boolean;
  presentationComplete: boolean;
  checks: InvestorDemoCommandRoomCheck[];
  blockers: string[];
  warnings: string[];
  requiredProofRoutes: string[];
  completedChapterIds: string[];
  completedChapterCount: number;
  chapterCount: number;
  elapsedSeconds: number;
  plannedSeconds: number;
  proofCheckAuditHash: string;
  operatorConfirmationAuditHash: string;
  syntheticOnly: true;
  phiAllowed: false;
  clinicalExecutionAllowed: false;
  externalSendAuthorized: false;
  investmentSolicitationAuthorized: false;
  productionReleaseAuthorized: false;
  independentApprovalRecorded: false;
  auditHash: string;
};

export const investorDemoCommandRoomVersion =
  "scrimed-investor-demo-command-room-v1-2026-08-10";

export const investorDemoCommandRoomBoundary =
  `${investorDemoRunOfShowBoundary} Command-room confirmations are reversible operator self-attestations, not independent review, investor approval, permission to distribute artifacts, or evidence of an external meeting outcome.`;

export const investorDemoOperatorConfirmationDefinitions: Array<
  Omit<InvestorDemoOperatorConfirmation, "confirmed">
> = [
  {
    id: "audience-and-ask-confirmed",
    label: "Audience and next ask confirmed",
    detail: "The presenter has selected one audience, one meeting objective, and one human-owned next step."
  },
  {
    id: "meeting-device-ready",
    label: "Meeting device prepared",
    detail: "The presenter has checked screen sharing, browser tabs, connectivity, and the selected timebox on this device."
  },
  {
    id: "claim-boundaries-reviewed",
    label: "Claims reviewed against current evidence",
    detail: "Customer, financial, partnership, clinical, security, and market statements stay inside current evidence and permission."
  },
  {
    id: "artifact-distribution-contained",
    label: "Artifact distribution contained",
    detail: "Downloads remain internal unless a separate recipient-specific human release decision exists."
  }
];

export function getInvestorDemoProofRoutes(mode: InvestorDemoMode) {
  const plan = buildInvestorDemoRunOfShow(mode);

  return Array.from(
    new Set(
      plan.chapters.flatMap((chapter) => [
        chapter.primaryProof.route,
        ...chapter.supportingProof.map((proof) => proof.route)
      ])
    )
  );
}

export function createInvestorDemoOperatorConfirmations(
  confirmedIds: InvestorDemoOperatorConfirmationId[] = []
): InvestorDemoOperatorConfirmation[] {
  const confirmed = new Set(confirmedIds);

  return investorDemoOperatorConfirmationDefinitions.map((definition) => ({
    ...definition,
    confirmed: confirmed.has(definition.id)
  }));
}

function commandRoomCheck(
  id: InvestorDemoCommandRoomCheck["id"],
  label: string,
  status: InvestorDemoCommandRoomCheck["status"],
  evidence: string
): InvestorDemoCommandRoomCheck {
  return { id, label, status, evidence };
}

function validateElapsedSeconds(elapsedSeconds: number) {
  if (!Number.isInteger(elapsedSeconds) || elapsedSeconds < 0) {
    throw new Error("elapsedSeconds must be a non-negative whole number");
  }
}

export function assessInvestorDemoCommandRoom(
  input: InvestorDemoCommandRoomInput
): InvestorDemoCommandRoomAssessment {
  validateElapsedSeconds(input.elapsedSeconds);

  const plan = buildInvestorDemoRunOfShow(input.mode);
  const rehearsal = assessInvestorDemoRehearsal(input.mode);
  const requiredProofRoutes = getInvestorDemoProofRoutes(input.mode);
  const requiredRouteSet = new Set(requiredProofRoutes);
  const receivedRoutes = input.proofChecks.map((check) => check.route);
  const receivedRouteSet = new Set(receivedRoutes);
  const proofCheckShapeValid = input.proofChecks.every(
    (check) =>
      typeof check.route === "string" &&
      ["not-checked", "pass", "fail"].includes(check.outcome) &&
      (check.httpStatus === null ||
        (Number.isInteger(check.httpStatus) &&
          check.httpStatus >= 100 &&
          check.httpStatus <= 599)) &&
      typeof check.boundaryHeadersValid === "boolean"
  );
  const proofRouteContractValid =
    proofCheckShapeValid &&
    receivedRoutes.length === receivedRouteSet.size &&
    receivedRouteSet.size === requiredRouteSet.size &&
    receivedRoutes.every((route) => requiredRouteSet.has(route));
  const anyProofFailure = input.proofChecks.some(
    (check) => check.outcome === "fail"
  );
  const allProofChecksPassed =
    proofRouteContractValid &&
    input.proofChecks.every(
      (check) =>
        check.outcome === "pass" &&
        check.boundaryHeadersValid &&
        check.httpStatus !== null &&
        check.httpStatus >= 200 &&
        check.httpStatus < 400
    );
  const allProofChecksCompleted = input.proofChecks.every(
    (check) => check.outcome !== "not-checked"
  );

  const expectedConfirmationIds = new Set(
    investorDemoOperatorConfirmationDefinitions.map((entry) => entry.id)
  );
  const expectedConfirmations = new Map(
    investorDemoOperatorConfirmationDefinitions.map((entry) => [entry.id, entry])
  );
  const receivedConfirmationIds = input.confirmations.map((entry) => entry.id);
  const confirmationContractValid =
    receivedConfirmationIds.length === new Set(receivedConfirmationIds).size &&
    receivedConfirmationIds.length === expectedConfirmationIds.size &&
    input.confirmations.every((confirmation) => {
      const expected = expectedConfirmations.get(confirmation.id);
      return (
        expected !== undefined &&
        confirmation.label === expected.label &&
        confirmation.detail === expected.detail &&
        typeof confirmation.confirmed === "boolean"
      );
    });
  const allConfirmationsComplete =
    confirmationContractValid &&
    input.confirmations.every((confirmation) => confirmation.confirmed === true);

  const expectedChapterIds = plan.chapters.map((chapter) => chapter.id);
  const expectedChapterSet = new Set<string>(expectedChapterIds);
  const uniqueCompletedChapterIds = Array.from(
    new Set(input.completedChapterIds)
  );
  const chapterContractValid =
    uniqueCompletedChapterIds.length === input.completedChapterIds.length &&
    uniqueCompletedChapterIds.every((id) => expectedChapterSet.has(id));
  const completedChapterIds = expectedChapterIds.filter((id) =>
    uniqueCompletedChapterIds.includes(id)
  );
  const completedInSequence = completedChapterIds.every(
    (id, index) => id === expectedChapterIds[index]
  );
  const chapterProgressValid = chapterContractValid && completedInSequence;

  const proofContractStatus: InvestorDemoCommandRoomCheck["status"] =
    !proofRouteContractValid
      ? "fail"
      : allProofChecksCompleted
        ? "pass"
        : "pending";
  const proofBoundaryStatus: InvestorDemoCommandRoomCheck["status"] =
    anyProofFailure ||
    input.proofChecks.some(
      (check) =>
        check.outcome === "pass" &&
        (!check.boundaryHeadersValid ||
          check.httpStatus === null ||
          check.httpStatus < 200 ||
          check.httpStatus >= 400)
    )
      ? "fail"
      : allProofChecksPassed
        ? "pass"
        : "pending";
  const confirmationStatus: InvestorDemoCommandRoomCheck["status"] =
    !confirmationContractValid
      ? "fail"
      : allConfirmationsComplete
        ? "pass"
        : "pending";

  const checks: InvestorDemoCommandRoomCheck[] = [
    commandRoomCheck(
      "rehearsal-contract",
      "The selected run of show passes the deterministic rehearsal contract.",
      rehearsal.internalRehearsalReady ? "pass" : "fail",
      `${rehearsal.automatedChecksPassed}/${rehearsal.automatedCheckCount} rehearsal checks pass.`
    ),
    commandRoomCheck(
      "proof-route-contract",
      "Every canonical proof route is checked exactly once.",
      proofContractStatus,
      `${input.proofChecks.length}/${requiredProofRoutes.length} route records supplied.`
    ),
    commandRoomCheck(
      "proof-route-boundaries",
      "Every proof route is reachable and retains no-PHI, no-live-care, and no-production-connector headers.",
      proofBoundaryStatus,
      `${input.proofChecks.filter((check) => check.outcome === "pass" && check.boundaryHeadersValid).length}/${requiredProofRoutes.length} routes satisfy reachability and boundary checks.`
    ),
    commandRoomCheck(
      "operator-confirmations",
      "The human presenter confirms audience, device, claims, and distribution controls.",
      confirmationStatus,
      `${input.confirmations.filter((entry) => entry.confirmed).length}/${investorDemoOperatorConfirmationDefinitions.length} operator confirmations recorded.`
    ),
    commandRoomCheck(
      "retained-authority-boundaries",
      "The command room grants no external-send, solicitation, PHI, clinical, deployment, or independent-approval authority.",
      "pass",
      "All consequential authorities remain false in the command-room contract."
    )
  ];

  const hasHardFailure =
    checks.some((check) => check.status === "fail") || !chapterProgressValid;
  const setupComplete = checks.every((check) => check.status === "pass");
  const presentationComplete =
    setupComplete && completedChapterIds.length === plan.chapters.length;
  let stage: InvestorDemoCommandRoomStage = "setup-required";

  if (hasHardFailure) {
    stage = "blocked";
  } else if (setupComplete && presentationComplete) {
    stage = "presentation-complete";
  } else if (setupComplete && completedChapterIds.length > 0) {
    stage = "presentation-in-progress";
  } else if (setupComplete) {
    stage = "ready-to-present";
  }

  const blockers = [
    ...checks
      .filter((check) => check.status !== "pass")
      .map((check) => check.label),
    ...(!chapterProgressValid
      ? ["Presented chapters must be unique, known, and completed in run-of-show order."]
      : [])
  ];
  const warnings = [
    "Operator confirmations are reversible self-attestations and do not replace independent review.",
    ...(input.elapsedSeconds > plan.durationSeconds
      ? [
          `The presentation is ${input.elapsedSeconds - plan.durationSeconds} seconds beyond the selected timebox.`
        ]
      : [])
  ];
  const unsigned: Omit<InvestorDemoCommandRoomAssessment, "auditHash"> = {
    version: investorDemoCommandRoomVersion,
    mode: input.mode,
    stage,
    eligibleToBegin: setupComplete && !hasHardFailure,
    presentationComplete,
    checks,
    blockers,
    warnings,
    requiredProofRoutes,
    completedChapterIds,
    completedChapterCount: completedChapterIds.length,
    chapterCount: plan.chapters.length,
    elapsedSeconds: input.elapsedSeconds,
    plannedSeconds: plan.durationSeconds,
    proofCheckAuditHash: generateScrimedAuditHash(input.proofChecks),
    operatorConfirmationAuditHash: generateScrimedAuditHash(input.confirmations),
    syntheticOnly: true,
    phiAllowed: false,
    clinicalExecutionAllowed: false,
    externalSendAuthorized: false,
    investmentSolicitationAuthorized: false,
    productionReleaseAuthorized: false,
    independentApprovalRecorded: false
  };

  return {
    ...unsigned,
    auditHash: generateScrimedAuditHash(unsigned)
  };
}

export function createInvestorDemoCommandRoomReceipt(
  assessment: InvestorDemoCommandRoomAssessment,
  generatedAt = new Date().toISOString()
) {
  const checkLines = assessment.checks
    .map(
      (check) =>
        `- ${check.label}: ${check.status.toUpperCase()} (${check.evidence})`
    )
    .join("\n");

  return `# SCRIMED Investor Demo Command Room Receipt

- Evidence class: INTERNAL_OPERATOR_REHEARSAL
- Generated: ${generatedAt}
- Mode: ${assessment.mode}
- Stage: ${assessment.stage}
- Presentation complete: ${assessment.presentationComplete ? "yes" : "no"}
- Chapters presented: ${assessment.completedChapterCount}/${assessment.chapterCount}
- Time: ${assessment.elapsedSeconds}/${assessment.plannedSeconds} seconds
- Proof-check hash: ${assessment.proofCheckAuditHash}
- Operator-confirmation hash: ${assessment.operatorConfirmationAuditHash}
- Audit hash: ${assessment.auditHash}

## Checks

${checkLines}

## Retained boundary

${investorDemoCommandRoomBoundary}

This receipt contains no buyer identity, contact data, PHI, credentials, external-send authority, investment-solicitation authority, production authority, or independent approval.
`;
}

export function getInvestorDemoCommandRoomSummary() {
  return {
    service: "scrimed-investor-demo-command-room",
    status: "operator-command-room-ready-for-synthetic-rehearsal",
    version: investorDemoCommandRoomVersion,
    modes: investorDemoModes.map((mode) => ({
      ...mode,
      requiredProofRoutes: getInvestorDemoProofRoutes(mode.id)
    })),
    operatorConfirmations: createInvestorDemoOperatorConfirmations(),
    routeCheckPolicy: {
      method: "HEAD",
      sameOriginOnly: true,
      timeoutMs: 5000,
      requiredBoundaryHeaders: {
        "x-scrimed-clinical-care-authority": "not-authorized-live-care",
        "x-scrimed-phi-authority": "not-authorized-production-phi",
        "x-scrimed-production-connector-authority":
          "not-production-connector-approved"
      }
    },
    syntheticOnly: true,
    phiAllowed: false,
    clinicalExecutionAllowed: false,
    externalSendAuthorized: false,
    investmentSolicitationAuthorized: false,
    productionReleaseAuthorized: false,
    independentApprovalRecorded: false,
    boundary: investorDemoCommandRoomBoundary
  };
}
