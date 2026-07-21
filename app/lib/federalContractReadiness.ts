import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";
import { containsPhiRisk, containsTokenLikeField } from "./scrimed-work/schemas";

export type FederalContractCheckpointState =
  | "not-started"
  | "in-progress"
  | "evidence-recorded"
  | "expired"
  | "rejected";

export type FederalContractCheckpointId =
  | "sam-account-and-authorized-administrator"
  | "legal-entity-validation"
  | "uei-assigned"
  | "cage-or-ncage-assigned"
  | "core-data-complete"
  | "assertions-complete"
  | "representations-certifications-complete"
  | "points-of-contact-complete"
  | "government-validation-complete"
  | "sam-record-active"
  | "annual-renewal-maintenance-plan"
  | "exclusions-responsibility-review"
  | "sba-business-profile"
  | "capability-statement-and-naics-psc";

export type FederalContractReviewState = "not-started" | "in-review" | "approved" | "rejected";

export type FederalContractReadinessInput = {
  checkpointStates: Record<FederalContractCheckpointId, FederalContractCheckpointState>;
  authorizedAdministratorReview: FederalContractReviewState;
  representationsReview: FederalContractReviewState;
  financeReview: FederalContractReviewState;
};

export type FederalContractReadinessDecision =
  | "operator-input-required"
  | "blocked-remediation-required"
  | "registration-renewal-required"
  | "sam-registration-preparation-required"
  | "sam-registration-in-progress"
  | "market-profile-remediation-required"
  | "qualified-human-review-required"
  | "federal-market-entry-review-ready";

export type FederalContractCheckpointDefinition = {
  id: FederalContractCheckpointId;
  name: string;
  stage: "identity" | "registration" | "maintenance" | "market-entry";
  owner: string;
  officialSourceIds: string[];
  requiredForActiveRegistration: boolean;
  requiredForMarketEntry: boolean;
  evidenceRequirement: string;
  nextAction: string;
};

export type FederalContractControlledAction = {
  actionId: string;
  owner: string;
  system: "SAM.gov" | "internal-qualified-review";
  status: "operator-required";
  officialUrl: string;
  externalMutationRequired: boolean;
  executionAuthorized: false;
  instruction: string;
};

export type FederalContractReadinessAssessment = {
  decision: FederalContractReadinessDecision;
  completedCheckpointCount: number;
  totalCheckpointCount: number;
  registrationCheckpointCount: number;
  completedRegistrationCheckpointCount: number;
  unresolvedCheckpointIds: FederalContractCheckpointId[];
  expiredCheckpointIds: FederalContractCheckpointId[];
  rejectedCheckpointIds: FederalContractCheckpointId[];
  hardStops: string[];
  warnings: string[];
  controlledNextAction: FederalContractControlledAction;
  evidenceAuditHash: string;
  authority: {
    samRegistrationVerified: false;
    ueiVerified: false;
    cageOrNcageVerified: false;
    representationsCertifiedByScrimed: false;
    primeOfferAuthorized: false;
    externalSubmissionAuthorized: false;
    contractAwardAuthority: "not-contract-award";
    governmentEndorsementAuthority: "not-government-endorsement";
  };
};

export type FederalContractReadinessPacket = {
  packetVersion: typeof federalContractReadinessVersion;
  preparedAsOf: typeof federalContractReadinessUpdatedAt;
  assessment: FederalContractReadinessAssessment;
  checkpointStates: Record<FederalContractCheckpointId, FederalContractCheckpointState>;
  reviews: {
    authorizedAdministrator: FederalContractReviewState;
    representations: FederalContractReviewState;
    finance: FederalContractReviewState;
  };
  contentBoundary: {
    containsUei: false;
    containsCageOrNcage: false;
    containsTin: false;
    containsBankingData: false;
    containsCredentials: false;
    containsProposalText: false;
    containsPhi: false;
  };
  externalReleaseAuthorized: false;
  externalSubmissionAuthorized: false;
  packetHashSha256: string;
  boundary: typeof federalContractReadinessBoundary;
};

export type FederalContractReadinessResult =
  | { ok: true; assessment: FederalContractReadinessAssessment }
  | {
      ok: false;
      errors: string[];
      externalReleaseAuthorized: false;
      externalSubmissionAuthorized: false;
    };

export const federalContractReadinessVersion = "scrimed-federal-contract-readiness-v1";
export const federalContractReadinessUpdatedAt = "2026-07-20";
export const federalContractReadinessStatus =
  "sam-far-readiness-active-operator-evidence-required";
export const federalContractReadinessBoundary =
  "SCRIMED Federal Contract Readiness is a local, metadata-only preparation control. It records checkpoint states, not UEIs, CAGE/NCAGE codes, TINs, banking data, credentials, proposal text, controlled information, PHI, or government-system responses. It does not register an entity, verify SAM status, certify representations, determine eligibility, submit an offer, authorize work, prove an award, or imply government endorsement. Authorized operators and qualified reviewers must complete every external action in the official system.";

export const federalContractOfficialSourceIds = [
  "sam-entity-registration",
  "sam-entity-registration-checklist",
  "far-sam-registration",
  "far-sam-maintenance",
  "sba-federal-contracting",
  "sba-how-to-win-contracts",
  "sba-prime-subcontracting"
] as const;

export const federalContractCheckpoints: FederalContractCheckpointDefinition[] = [
  {
    id: "sam-account-and-authorized-administrator",
    name: "SAM.gov account and authorized entity administrator",
    stage: "identity",
    owner: "Founder + authorized entity administrator",
    officialSourceIds: ["sam-entity-registration"],
    requiredForActiveRegistration: true,
    requiredForMarketEntry: true,
    evidenceRequirement: "Authorized administrator and role evidence retained in an access-controlled system.",
    nextAction: "Designate the authorized entity administrator and use Login.gov to access the official SAM.gov workflow."
  },
  {
    id: "legal-entity-validation",
    name: "Legal entity validation",
    stage: "identity",
    owner: "Authorized entity administrator",
    officialSourceIds: ["sam-entity-registration", "sam-entity-registration-checklist"],
    requiredForActiveRegistration: true,
    requiredForMarketEntry: true,
    evidenceRequirement: "Legal business name, physical address, start year, and formation evidence match authoritative records.",
    nextAction: "Gather authoritative entity documents and complete entity validation without copying identifiers into SCRIMED."
  },
  {
    id: "uei-assigned",
    name: "Unique Entity ID assigned",
    stage: "registration",
    owner: "Authorized entity administrator",
    officialSourceIds: ["sam-entity-registration", "far-sam-registration"],
    requiredForActiveRegistration: true,
    requiredForMarketEntry: true,
    evidenceRequirement: "Protected evidence reference confirms assignment; the UEI value stays outside SCRIMED.",
    nextAction: "Complete the SAM.gov entity path that assigns a UEI; retain only a protected evidence reference."
  },
  {
    id: "cage-or-ncage-assigned",
    name: "CAGE or NCAGE assignment complete",
    stage: "registration",
    owner: "Authorized entity administrator",
    officialSourceIds: ["sam-entity-registration-checklist", "far-sam-registration"],
    requiredForActiveRegistration: true,
    requiredForMarketEntry: true,
    evidenceRequirement: "Protected evidence reference confirms the applicable CAGE/NCAGE state without storing the code.",
    nextAction: "Complete the applicable CAGE or NCAGE workflow and monitor external validation status."
  },
  {
    id: "core-data-complete",
    name: "SAM Core data complete",
    stage: "registration",
    owner: "Authorized entity administrator + finance",
    officialSourceIds: ["sam-entity-registration-checklist", "far-sam-registration"],
    requiredForActiveRegistration: true,
    requiredForMarketEntry: true,
    evidenceRequirement: "Core-section completion state is reviewed externally; sensitive values remain only in authorized systems.",
    nextAction: "Complete and independently review the Core section in SAM.gov."
  },
  {
    id: "assertions-complete",
    name: "SAM Assertions complete",
    stage: "registration",
    owner: "Authorized entity administrator + capture owner",
    officialSourceIds: ["sam-entity-registration-checklist", "far-sam-registration"],
    requiredForActiveRegistration: true,
    requiredForMarketEntry: true,
    evidenceRequirement: "Assertions, NAICS/PSC posture, and size inputs receive qualified review.",
    nextAction: "Complete Assertions using current business facts and qualified size/status review."
  },
  {
    id: "representations-certifications-complete",
    name: "Representations and certifications complete",
    stage: "registration",
    owner: "Authorized company official + qualified government-contracts counsel",
    officialSourceIds: ["sam-entity-registration-checklist", "far-sam-registration"],
    requiredForActiveRegistration: true,
    requiredForMarketEntry: true,
    evidenceRequirement: "Authorized official and qualified reviewer approve current representations and certifications.",
    nextAction: "Review every representation against current facts before an authorized official certifies it in SAM.gov."
  },
  {
    id: "points-of-contact-complete",
    name: "Points of Contact complete",
    stage: "registration",
    owner: "Authorized entity administrator",
    officialSourceIds: ["sam-entity-registration-checklist", "far-sam-registration"],
    requiredForActiveRegistration: true,
    requiredForMarketEntry: true,
    evidenceRequirement: "Required contacts are current in SAM.gov; personal contact values are not copied into SCRIMED.",
    nextAction: "Confirm required points of contact and continuity coverage in the official record."
  },
  {
    id: "government-validation-complete",
    name: "Government field validation complete",
    stage: "registration",
    owner: "Authorized entity administrator + finance",
    officialSourceIds: ["far-sam-registration"],
    requiredForActiveRegistration: true,
    requiredForMarketEntry: true,
    evidenceRequirement: "External status confirms mandatory validation, including IRS TIN validation, without retaining the TIN.",
    nextAction: "Resolve official validation issues through SAM.gov or the Federal Service Desk and retain only status evidence."
  },
  {
    id: "sam-record-active",
    name: "SAM record marked Active",
    stage: "registration",
    owner: "Authorized entity administrator",
    officialSourceIds: ["sam-entity-registration", "far-sam-registration"],
    requiredForActiveRegistration: true,
    requiredForMarketEntry: true,
    evidenceRequirement: "A current protected status reference shows Active; SCRIMED does not infer or verify the status.",
    nextAction: "Check the authoritative SAM.gov entity status and record a protected evidence reference and expiry."
  },
  {
    id: "annual-renewal-maintenance-plan",
    name: "Annual renewal and maintenance control",
    stage: "maintenance",
    owner: "Authorized entity administrator + contracts owner",
    officialSourceIds: ["sam-entity-registration", "far-sam-maintenance"],
    requiredForActiveRegistration: false,
    requiredForMarketEntry: true,
    evidenceRequirement: "Named owner, renewal date, change-control procedure, and continuity reminder are retained securely.",
    nextAction: "Assign renewal ownership and schedule review before the 365-day registration interval expires."
  },
  {
    id: "exclusions-responsibility-review",
    name: "Exclusions and responsibility review",
    stage: "maintenance",
    owner: "Qualified government-contracts counsel + authorized official",
    officialSourceIds: ["sam-entity-registration", "sam-entity-registration-checklist"],
    requiredForActiveRegistration: false,
    requiredForMarketEntry: true,
    evidenceRequirement: "Current exclusions/responsibility and disclosure review is retained by an authorized reviewer.",
    nextAction: "Review exclusions, responsibility information, legal proceedings, and disclosure obligations before representations or offers."
  },
  {
    id: "sba-business-profile",
    name: "SBA business profile complete",
    stage: "market-entry",
    owner: "Capture owner + authorized company official",
    officialSourceIds: ["sba-how-to-win-contracts", "sba-prime-subcontracting"],
    requiredForActiveRegistration: false,
    requiredForMarketEntry: true,
    evidenceRequirement: "Current profile accurately describes capabilities, keywords, NAICS codes, certifications, and permitted performance history.",
    nextAction: "Complete the SBA business profile using approved claims and current SAM data."
  },
  {
    id: "capability-statement-and-naics-psc",
    name: "Capability statement and NAICS/PSC targeting",
    stage: "market-entry",
    owner: "Capture owner + claims/legal reviewer",
    officialSourceIds: ["sba-how-to-win-contracts", "sba-prime-subcontracting"],
    requiredForActiveRegistration: false,
    requiredForMarketEntry: true,
    evidenceRequirement: "Claims-approved capability narrative, keywords, codes, differentiators, and permitted proof references.",
    nextAction: "Create a one-page government capability statement and target only codes supported by current delivery evidence."
  }
];

const checkpointStateValues = new Set<FederalContractCheckpointState>([
  "not-started",
  "in-progress",
  "evidence-recorded",
  "expired",
  "rejected"
]);
const reviewStateValues = new Set<FederalContractReviewState>([
  "not-started",
  "in-review",
  "approved",
  "rejected"
]);

export const federalContractReadinessInputTemplate: FederalContractReadinessInput = {
  checkpointStates: Object.fromEntries(
    federalContractCheckpoints.map((checkpoint) => [checkpoint.id, "not-started"])
  ) as Record<FederalContractCheckpointId, FederalContractCheckpointState>,
  authorizedAdministratorReview: "not-started",
  representationsReview: "not-started",
  financeReview: "not-started"
};

function validateFederalContractReadinessInput(input: FederalContractReadinessInput) {
  const errors: string[] = [];

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return ["Federal contract readiness input must be an object."];
  }
  if (containsTokenLikeField(input) || containsPhiRisk(input)) {
    errors.push("Federal contract readiness rejects credentials, direct identifiers, contact details, and PHI.");
  }

  const allowedTopLevelKeys = new Set([
    "checkpointStates",
    "authorizedAdministratorReview",
    "representationsReview",
    "financeReview"
  ]);
  const unknownTopLevelKeys = Object.keys(input).filter((key) => !allowedTopLevelKeys.has(key));
  if (unknownTopLevelKeys.length > 0) errors.push("Federal contract readiness input contains unsupported fields.");

  if (!input.checkpointStates || typeof input.checkpointStates !== "object" || Array.isArray(input.checkpointStates)) {
    errors.push("Checkpoint states must be an object.");
  } else {
    const expectedIds = new Set(federalContractCheckpoints.map((checkpoint) => checkpoint.id));
    const actualIds = Object.keys(input.checkpointStates);
    if (actualIds.length !== expectedIds.size || actualIds.some((id) => !expectedIds.has(id as FederalContractCheckpointId))) {
      errors.push("Checkpoint states must contain exactly the registered federal readiness checkpoints.");
    }
    for (const checkpoint of federalContractCheckpoints) {
      if (!checkpointStateValues.has(input.checkpointStates[checkpoint.id])) {
        errors.push(`Checkpoint ${checkpoint.id} has an invalid state.`);
      }
    }
  }

  for (const [label, review] of [
    ["Authorized administrator", input.authorizedAdministratorReview],
    ["Representations", input.representationsReview],
    ["Finance", input.financeReview]
  ] as const) {
    if (!reviewStateValues.has(review)) errors.push(`${label} review has an invalid state.`);
  }

  return Array.from(new Set(errors));
}

function nextControlledAction(checkpoint: FederalContractCheckpointDefinition | undefined): FederalContractControlledAction {
  if (checkpoint) {
    return {
      actionId: `resolve-${checkpoint.id}`,
      owner: checkpoint.owner,
      system: checkpoint.stage === "market-entry" ? "internal-qualified-review" : "SAM.gov",
      status: "operator-required",
      officialUrl: checkpoint.stage === "market-entry"
        ? "https://www.sba.gov/federal-contracting/contracting-guide/how-win-contracts"
        : "https://sam.gov/entity-registration",
      externalMutationRequired: checkpoint.stage !== "market-entry",
      executionAuthorized: false,
      instruction: checkpoint.nextAction
    };
  }

  return {
    actionId: "verify-active-registration-and-select-opportunity",
    owner: "Authorized entity administrator + capture owner + qualified government-contracts counsel",
    system: "internal-qualified-review",
    status: "operator-required",
    officialUrl: "https://sam.gov/opportunities",
    externalMutationRequired: false,
    executionAuthorized: false,
    instruction:
      "Reverify the active SAM record, bind one current official opportunity and amendments, and complete the existing weakest-link bid/no-bid review."
  };
}

export function evaluateFederalContractReadiness(
  input: FederalContractReadinessInput
): FederalContractReadinessResult {
  const errors = validateFederalContractReadinessInput(input);
  if (errors.length > 0) {
    return {
      ok: false,
      errors,
      externalReleaseAuthorized: false,
      externalSubmissionAuthorized: false
    };
  }

  const checkpointState = (id: FederalContractCheckpointId) => input.checkpointStates[id];
  const completedCheckpointIds = federalContractCheckpoints
    .filter((checkpoint) => checkpointState(checkpoint.id) === "evidence-recorded")
    .map((checkpoint) => checkpoint.id);
  const unresolvedCheckpointIds = federalContractCheckpoints
    .filter((checkpoint) => checkpointState(checkpoint.id) !== "evidence-recorded")
    .map((checkpoint) => checkpoint.id);
  const expiredCheckpointIds = federalContractCheckpoints
    .filter((checkpoint) => checkpointState(checkpoint.id) === "expired")
    .map((checkpoint) => checkpoint.id);
  const rejectedCheckpointIds = federalContractCheckpoints
    .filter((checkpoint) => checkpointState(checkpoint.id) === "rejected")
    .map((checkpoint) => checkpoint.id);
  const registrationCheckpoints = federalContractCheckpoints.filter(
    (checkpoint) => checkpoint.requiredForActiveRegistration
  );
  const registrationComplete = registrationCheckpoints.every(
    (checkpoint) => checkpointState(checkpoint.id) === "evidence-recorded"
  );
  const marketEntryComplete = federalContractCheckpoints
    .filter((checkpoint) => checkpoint.requiredForMarketEntry)
    .every((checkpoint) => checkpointState(checkpoint.id) === "evidence-recorded");
  const reviews = [
    input.authorizedAdministratorReview,
    input.representationsReview,
    input.financeReview
  ];
  const allReviewsApproved = reviews.every((review) => review === "approved");
  const hasAnyInput = completedCheckpointIds.length > 0
    || Object.values(input.checkpointStates).some((state) => state !== "not-started")
    || reviews.some((review) => review !== "not-started");
  const hardStops: string[] = [];

  if (rejectedCheckpointIds.length > 0) {
    hardStops.push("At least one federal readiness checkpoint was rejected.");
  }
  if (reviews.includes("rejected")) {
    hardStops.push("At least one mandatory human review rejected the registration or market-entry path.");
  }
  const activeRecordPrerequisites = registrationCheckpoints.filter(
    (checkpoint) => checkpoint.id !== "sam-record-active"
  );
  if (
    checkpointState("sam-record-active") === "evidence-recorded"
    && activeRecordPrerequisites.some((checkpoint) => checkpointState(checkpoint.id) !== "evidence-recorded")
  ) {
    hardStops.push("An Active SAM state cannot be accepted while a mandatory registration prerequisite is unresolved.");
  }
  if (allReviewsApproved && !marketEntryComplete) {
    hardStops.push("Human review approvals cannot predate unresolved mandatory evidence checkpoints.");
  }

  let decision: FederalContractReadinessDecision;
  if (hardStops.length > 0) decision = "blocked-remediation-required";
  else if (expiredCheckpointIds.length > 0) decision = "registration-renewal-required";
  else if (!hasAnyInput) decision = "operator-input-required";
  else if (!registrationComplete) {
    decision = Object.values(input.checkpointStates).includes("in-progress") || completedCheckpointIds.length > 0
      ? "sam-registration-in-progress"
      : "sam-registration-preparation-required";
  } else if (!marketEntryComplete) decision = "market-profile-remediation-required";
  else if (!allReviewsApproved) decision = "qualified-human-review-required";
  else decision = "federal-market-entry-review-ready";

  const firstUnresolvedCheckpoint = federalContractCheckpoints.find(
    (checkpoint) => checkpointState(checkpoint.id) !== "evidence-recorded"
  );
  const controlledNextAction = nextControlledAction(firstUnresolvedCheckpoint);
  const auditPayload = {
    version: federalContractReadinessVersion,
    checkpointStates: input.checkpointStates,
    reviews: {
      authorizedAdministrator: input.authorizedAdministratorReview,
      representations: input.representationsReview,
      finance: input.financeReview
    },
    decision,
    hardStops,
    controlledActionId: controlledNextAction.actionId,
    externalSubmissionAuthorized: false
  };

  return {
    ok: true,
    assessment: {
      decision,
      completedCheckpointCount: completedCheckpointIds.length,
      totalCheckpointCount: federalContractCheckpoints.length,
      registrationCheckpointCount: registrationCheckpoints.length,
      completedRegistrationCheckpointCount: registrationCheckpoints.filter(
        (checkpoint) => checkpointState(checkpoint.id) === "evidence-recorded"
      ).length,
      unresolvedCheckpointIds,
      expiredCheckpointIds,
      rejectedCheckpointIds,
      hardStops,
      warnings: [
        "Evidence recorded means an operator retained a protected reference; SCRIMED has not verified the underlying government record.",
        "An active SAM registration must be maintained during performance and through final payment, with annual review and update.",
        "Registration and market readiness do not replace opportunity-specific clauses, agency supplements, security review, or named bid authorization.",
        "Subcontracting may offer an earlier path, but the prime's flowdowns, workshare, data rights, security terms, and approval still control."
      ],
      controlledNextAction,
      evidenceAuditHash: createClinicalEvidenceHash(auditPayload),
      authority: {
        samRegistrationVerified: false,
        ueiVerified: false,
        cageOrNcageVerified: false,
        representationsCertifiedByScrimed: false,
        primeOfferAuthorized: false,
        externalSubmissionAuthorized: false,
        contractAwardAuthority: "not-contract-award",
        governmentEndorsementAuthority: "not-government-endorsement"
      }
    }
  };
}

export function buildFederalContractReadinessPacket(
  input: FederalContractReadinessInput
): { ok: true; packet: FederalContractReadinessPacket } | FederalContractReadinessResult {
  const result = evaluateFederalContractReadiness(input);
  if (!result.ok) return result;

  const packetCore: Omit<FederalContractReadinessPacket, "packetHashSha256"> = {
    packetVersion: federalContractReadinessVersion,
    preparedAsOf: federalContractReadinessUpdatedAt,
    assessment: result.assessment,
    checkpointStates: input.checkpointStates,
    reviews: {
      authorizedAdministrator: input.authorizedAdministratorReview,
      representations: input.representationsReview,
      finance: input.financeReview
    },
    contentBoundary: {
      containsUei: false as const,
      containsCageOrNcage: false as const,
      containsTin: false as const,
      containsBankingData: false as const,
      containsCredentials: false as const,
      containsProposalText: false as const,
      containsPhi: false as const
    },
    externalReleaseAuthorized: false as const,
    externalSubmissionAuthorized: false as const,
    boundary: federalContractReadinessBoundary
  };

  return {
    ok: true,
    packet: {
      ...packetCore,
      packetHashSha256: createClinicalEvidenceHash(packetCore)
    }
  };
}

export function buildFederalContractReadinessPacketMarkdown(input: FederalContractReadinessInput) {
  const result = buildFederalContractReadinessPacket(input);
  if (!result.ok || !("packet" in result)) {
    return [
      "# SCRIMED Federal Contract Readiness Packet",
      "",
      "Status: blocked-invalid-input",
      "External submission authorized: no",
      ...(result.ok ? [] : result.errors.map((error) => `- ${error}`)),
      "",
      federalContractReadinessBoundary
    ].join("\n");
  }

  return [
    "# SCRIMED Federal Contract Readiness Packet",
    "",
    "Internal metadata-only artifact. Do not add UEI, CAGE/NCAGE, TIN, banking, credentials, proposal text, controlled information, PHI, or personal contact data.",
    "",
    `Decision: ${result.packet.assessment.decision}`,
    `Completed checkpoints: ${result.packet.assessment.completedCheckpointCount}/${result.packet.assessment.totalCheckpointCount}`,
    `Registration checkpoints: ${result.packet.assessment.completedRegistrationCheckpointCount}/${result.packet.assessment.registrationCheckpointCount}`,
    `External submission authorized: ${result.packet.externalSubmissionAuthorized ? "yes" : "no"}`,
    `Evidence audit hash: ${result.packet.assessment.evidenceAuditHash}`,
    `Packet hash: ${result.packet.packetHashSha256}`,
    "",
    "## Controlled Next Action",
    `- Owner: ${result.packet.assessment.controlledNextAction.owner}`,
    `- System: ${result.packet.assessment.controlledNextAction.system}`,
    `- Instruction: ${result.packet.assessment.controlledNextAction.instruction}`,
    `- Official source: ${result.packet.assessment.controlledNextAction.officialUrl}`,
    `- Execution authorized by SCRIMED: ${result.packet.assessment.controlledNextAction.executionAuthorized ? "yes" : "no"}`,
    "",
    "## Checkpoints",
    ...federalContractCheckpoints.map(
      (checkpoint) => `- ${checkpoint.name}: ${result.packet.checkpointStates[checkpoint.id]}. Owner: ${checkpoint.owner}. Next: ${checkpoint.nextAction}`
    ),
    "",
    "## Human Reviews",
    `- Authorized administrator: ${result.packet.reviews.authorizedAdministrator}`,
    `- Representations and certifications: ${result.packet.reviews.representations}`,
    `- Finance and payment controls: ${result.packet.reviews.finance}`,
    "",
    "## Boundary",
    result.packet.boundary
  ].join("\n");
}

export function getFederalContractReadinessSummary() {
  const defaultResult = evaluateFederalContractReadiness(federalContractReadinessInputTemplate);

  return {
    status: federalContractReadinessStatus,
    version: federalContractReadinessVersion,
    updatedAt: federalContractReadinessUpdatedAt,
    boundary: federalContractReadinessBoundary,
    checkpointCount: federalContractCheckpoints.length,
    activeRegistrationCheckpointCount: federalContractCheckpoints.filter(
      (checkpoint) => checkpoint.requiredForActiveRegistration
    ).length,
    marketEntryCheckpointCount: federalContractCheckpoints.filter(
      (checkpoint) => checkpoint.requiredForMarketEntry
    ).length,
    defaultDecision: defaultResult.ok ? defaultResult.assessment.decision : "blocked-remediation-required",
    defaultControlledNextAction: defaultResult.ok ? defaultResult.assessment.controlledNextAction : null,
    officialSourceIds: [...federalContractOfficialSourceIds],
    checkpoints: federalContractCheckpoints,
    entryPaths: [
      {
        id: "federal-prime",
        posture: "registration-and-opportunity-gated",
        requirement:
          "Active SAM registration evidence, qualified representations, opportunity-specific compliance, delivery assurance, and named submission authorization.",
        authority: "not-authorized"
      },
      {
        id: "federal-subcontract",
        posture: "prime-flowdown-and-teaming-gated",
        requirement:
          "Named prime sponsor, reviewed flowdowns, workshare, data rights, security boundary, pricing, and delivery capacity.",
        authority: "not-authorized"
      }
    ],
    authority: {
      samRegistrationVerified: false,
      ueiVerified: false,
      cageOrNcageVerified: false,
      smallBusinessStatusVerified: false,
      socioeconomicCertificationVerified: false,
      primeOfferAuthorized: false,
      subcontractAuthorized: false,
      externalSubmissionAuthorized: false,
      contractAwardVerified: false
    },
    nextAction:
      "Assign an authorized SAM.gov entity administrator, gather legal-entity evidence, and complete the official registration checklist while SCRIMED retains only checkpoint states and protected evidence references."
  };
}
