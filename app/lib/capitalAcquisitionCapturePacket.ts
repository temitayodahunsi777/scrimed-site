import {
  capitalAccessLanes,
  capitalAcquisitionReadinessBoundary,
  capitalAcquisitionReadinessUpdatedAt,
  capitalAcquisitionReadinessVersion,
  evaluatePublicSectorOpportunity,
  officialReadinessSources,
  publicSectorReadinessGates,
  type PublicSectorOpportunityInputs,
  type PublicSectorOpportunityLane
} from "./capitalAcquisitionReadiness";
import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import { containsPhiRisk, containsTokenLikeField } from "./scrimed-work/schemas";

export type CapitalCapturePacketReadiness =
  | "template-input-required"
  | "blocked-no-bid"
  | "internal-remediation-packet-ready"
  | "internal-qualified-review-packet-ready"
  | "internal-human-submission-review-packet-ready";

export type CapitalCaptureFingerprintBundle = {
  opportunityReferenceSha256?: string;
  candidateSha256?: string;
  sourceTreeSha256?: string;
  packetArtifactSha256?: string;
};

export type CapitalCapturePacketInput = {
  opportunity: PublicSectorOpportunityInputs;
  fingerprints?: CapitalCaptureFingerprintBundle;
};

export type CapitalCapturePacketArtifact = {
  id: string;
  label: string;
  route: string;
  purpose: string;
  shareability: "internal-metadata-only" | "qualified-review-required";
};

export type CapitalCapturePacket = {
  packetId: string;
  packetVersion: typeof capitalAcquisitionCapturePacketVersion;
  preparedAsOf: typeof capitalAcquisitionReadinessUpdatedAt;
  lane: PublicSectorOpportunityLane;
  laneName: string;
  readiness: CapitalCapturePacketReadiness;
  assessment: ReturnType<typeof evaluatePublicSectorOpportunity>;
  officialSources: Array<{
    id: string;
    authority: string;
    title: string;
    url: string;
    freshnessPolicy: string;
  }>;
  sourceGap: string | null;
  requiredEvidence: string[];
  requiredReviewers: string[];
  complianceMatrix: Array<{
    gateId: string;
    gate: string;
    stage: string;
    owner: string;
    blocksSubmission: boolean;
    requiredEvidence: string[];
  }>;
  proofArtifacts: CapitalCapturePacketArtifact[];
  blockedClaims: string[];
  fingerprints: CapitalCaptureFingerprintBundle;
  fingerprintBinding:
    | "missing-exact-fingerprints"
    | "partial-exact-fingerprints"
    | "complete-unverified-human-review-required";
  releaseControls: {
    internalUseOnly: true;
    containsRawProposal: false;
    containsRegistrationIdentifiers: false;
    containsCredentials: false;
    containsPhi: false;
    externalReleaseAuthorized: false;
    investorSolicitationAuthorized: false;
    externalSubmissionAuthorized: false;
    contractAwardAuthority: "not-contract-award";
    grantAwardAuthority: "not-grant-award";
    governmentEndorsementAuthority: "not-government-endorsement";
    humanReviewRequired: true;
  };
  nextActions: string[];
  packetAuditHash: string;
  boundary: typeof capitalAcquisitionCapturePacketBoundary;
};

export type CapitalCapturePacketBuildResult =
  | { ok: true; packet: CapitalCapturePacket }
  | { ok: false; errors: string[]; externalReleaseAuthorized: false; externalSubmissionAuthorized: false };

export const capitalAcquisitionCapturePacketVersion = "scrimed-capital-acquisition-capture-packet-v1";
export const capitalAcquisitionCapturePacketStatus =
  "capital-acquisition-capture-packet-active-internal-metadata-only";
export const capitalAcquisitionCapturePacketBoundary =
  "SCRIMED Capital Acquisition Capture Packet creates an internal, metadata-only opportunity qualification artifact. It stores no proposal text, registration identifiers, tax identifiers, credentials, controlled information, PHI, pricing, or customer data. It cannot authorize fundraising outreach, securities solicitation, government submission, representation, certification, contract or grant award, government endorsement, work start, production deployment, payer submission, EHR writeback, or live clinical care.";

const sha256Pattern = /^[a-f0-9]{64}$/;
const publicSectorLanes = new Set<PublicSectorOpportunityLane>([
  "federal-prime-contract",
  "federal-subcontracting",
  "federal-grant",
  "sbir-sttr",
  "state-local-public-sector"
]);
const evidenceStates = new Set(["unknown", "verified-current", "missing", "expired"]);
const deadlines = new Set(["unknown", "open", "closed"]);
const scopeFits = new Set(["unknown", "low", "medium", "high"]);
const eligibilityStates = new Set(["unknown", "verified-eligible", "not-eligible"]);
const reviewStates = new Set(["not-started", "in-review", "approved", "rejected"]);

const proofArtifacts: CapitalCapturePacketArtifact[] = [
  {
    id: "capital-vitality",
    label: "Capital Vitality control plane",
    route: "/capital-vitality",
    purpose: "Bind opportunity qualification to SCRIMED's capital, pricing, margin, and retained-authority controls.",
    shareability: "internal-metadata-only"
  },
  {
    id: "proof-packet-studio",
    label: "Proof Packet Studio",
    route: "/scrimed-proof-packet-studio",
    purpose: "Select route-backed proof, owners, acceptance criteria, and limitation disclosures.",
    shareability: "internal-metadata-only"
  },
  {
    id: "diligence-packet-manifest",
    label: "Diligence Packet Manifest",
    route: "/api/release-continuity/diligence-packet-manifest",
    purpose: "Separate metadata-safe evidence from AAL2-protected or qualified-review-only material.",
    shareability: "qualified-review-required"
  },
  {
    id: "diligence-share-guard",
    label: "Diligence Packet Share Guard",
    route: "/api/release-continuity/diligence-packet-share-guard",
    purpose: "Keep recipient class, reviewer ownership, withheld material, and distribution authority explicit.",
    shareability: "qualified-review-required"
  },
  {
    id: "trust-center",
    label: "Trust Center",
    route: "/trust-center",
    purpose: "Present safety and security readiness without implying certification or external approval.",
    shareability: "qualified-review-required"
  }
];

function validateOpportunityInput(input: PublicSectorOpportunityInputs) {
  const errors: string[] = [];

  if (!publicSectorLanes.has(input.lane)) errors.push("Select a supported public-sector opportunity lane.");
  if (!evidenceStates.has(input.officialNotice)) errors.push("Official notice state is invalid.");
  if (!deadlines.has(input.deadline)) errors.push("Deadline state is invalid.");
  if (!scopeFits.has(input.scopeFit)) errors.push("Scope-fit state is invalid.");
  if (!evidenceStates.has(input.applicableRegistration)) errors.push("Registration state is invalid.");
  if (!eligibilityStates.has(input.programEligibility)) errors.push("Program eligibility state is invalid.");

  for (const [label, value] of [
    ["Solicitation compliance", input.solicitationCompliance],
    ["Security/privacy", input.securityPrivacyReview],
    ["Finance/delivery", input.financeDeliveryReview],
    ["Evidence readiness", input.evidenceReadiness],
    ["Human bid approval", input.humanBidApproval]
  ] as const) {
    if (!reviewStates.has(value)) errors.push(`${label} review state is invalid.`);
  }

  for (const [label, value] of [
    ["Live PHI", input.requiresLivePhi],
    ["Autonomous clinical action", input.requiresAutonomousClinicalAction],
    ["EHR writeback", input.requiresEhrWriteback],
    ["Payer submission", input.requiresPayerSubmission]
  ] as const) {
    if (typeof value !== "boolean") errors.push(`${label} boundary must be a boolean.`);
  }

  return errors;
}

function validateFingerprints(fingerprints: CapitalCaptureFingerprintBundle) {
  return Object.entries(fingerprints).flatMap(([field, value]) => {
    if (value === undefined || value === "") return [];
    return sha256Pattern.test(value) ? [] : [`${field} must be a lowercase 64-character SHA-256 digest.`];
  });
}

function captureReadiness(
  decision: ReturnType<typeof evaluatePublicSectorOpportunity>["decision"]
): CapitalCapturePacketReadiness {
  switch (decision) {
    case "input-required":
      return "template-input-required";
    case "blocked-no-bid":
      return "blocked-no-bid";
    case "research-and-remediation-required":
      return "internal-remediation-packet-ready";
    case "qualified-bid-review-required":
      return "internal-qualified-review-packet-ready";
    case "ready-for-human-submission-review":
      return "internal-human-submission-review-packet-ready";
  }
}

function fingerprintBinding(fingerprints: CapitalCaptureFingerprintBundle) {
  const expected = [
    fingerprints.opportunityReferenceSha256,
    fingerprints.candidateSha256,
    fingerprints.sourceTreeSha256,
    fingerprints.packetArtifactSha256
  ];
  const present = expected.filter(Boolean).length;

  if (present === 0) return "missing-exact-fingerprints" as const;
  if (present < expected.length) return "partial-exact-fingerprints" as const;
  return "complete-unverified-human-review-required" as const;
}

export function buildCapitalAcquisitionCapturePacket(
  input: CapitalCapturePacketInput
): CapitalCapturePacketBuildResult {
  const fingerprints = input.fingerprints ?? {};
  const errors = [
    ...validateOpportunityInput(input.opportunity),
    ...validateFingerprints(fingerprints)
  ];

  if (containsTokenLikeField(input) || containsPhiRisk(input)) {
    errors.push("Capture packet input rejects credentials, token-like fields, PHI, and direct identifiers.");
  }

  if (errors.length > 0) {
    return {
      ok: false,
      errors: Array.from(new Set(errors)),
      externalReleaseAuthorized: false,
      externalSubmissionAuthorized: false
    };
  }

  const lane = capitalAccessLanes.find((candidate) => candidate.id === input.opportunity.lane);
  if (!lane) {
    return {
      ok: false,
      errors: ["The selected lane is not configured in SCRIMED Capital Acquisition Readiness."],
      externalReleaseAuthorized: false,
      externalSubmissionAuthorized: false
    };
  }

  const assessment = evaluatePublicSectorOpportunity(input.opportunity);
  const sources = officialReadinessSources
    .filter((source) => lane.officialSourceIds.includes(source.id))
    .map(({ id, authority, title, url, freshnessPolicy }) => ({ id, authority, title, url, freshnessPolicy }));
  const binding = fingerprintBinding(fingerprints);
  const blockedClaims = Array.from(new Set([
    ...lane.blockedClaims,
    "proposal or application authorized",
    "fundraising solicitation authorized",
    "government registration verified by SCRIMED",
    "government endorsement",
    "contract or grant award",
    "customer go-live approved"
  ]));
  const nextActions = [
    assessment.nextAction,
    binding === "complete-unverified-human-review-required"
      ? "Have named qualified reviewers validate the exact fingerprints, evidence, claims, and intended recipient before any external use."
      : "Bind the current official notice, source tree, candidate, and generated packet to exact SHA-256 fingerprints before qualified external-release review.",
    sources.length === 0
      ? "Add and review the named jurisdiction's official procurement or grant sources; federal references cannot substitute for local authority."
      : "Recheck every official source and amendment immediately before final bid/no-bid and human submission review.",
    "Use the Diligence Packet Share Guard for any proposed recipient; this packet cannot send, submit, sign, certify, or release itself."
  ];
  const packetHashPayload = {
    version: capitalAcquisitionCapturePacketVersion,
    lane: input.opportunity.lane,
    assessment: {
      decision: assessment.decision,
      completedGateCount: assessment.completedGateCount,
      missingGateIds: assessment.missingGateIds,
      hardStops: assessment.hardStops
    },
    fingerprints,
    officialSourceIds: sources.map((source) => source.id),
    blockedClaims,
    releaseAuthority: false
  };

  return {
    ok: true,
    packet: {
      packetId: `scrimed-${input.opportunity.lane}-capture-packet`,
      packetVersion: capitalAcquisitionCapturePacketVersion,
      preparedAsOf: capitalAcquisitionReadinessUpdatedAt,
      lane: input.opportunity.lane,
      laneName: lane.name,
      readiness: captureReadiness(assessment.decision),
      assessment,
      officialSources: sources,
      sourceGap: sources.length === 0 ? "named-jurisdiction-official-sources-required" : null,
      requiredEvidence: lane.requiredEvidence,
      requiredReviewers: lane.requiredReviewers,
      complianceMatrix: publicSectorReadinessGates.map((gate) => ({
        gateId: gate.id,
        gate: gate.name,
        stage: gate.stage,
        owner: gate.owner,
        blocksSubmission: gate.blocksSubmission,
        requiredEvidence: gate.requiredEvidence
      })),
      proofArtifacts,
      blockedClaims,
      fingerprints,
      fingerprintBinding: binding,
      releaseControls: {
        internalUseOnly: true,
        containsRawProposal: false,
        containsRegistrationIdentifiers: false,
        containsCredentials: false,
        containsPhi: false,
        externalReleaseAuthorized: false,
        investorSolicitationAuthorized: false,
        externalSubmissionAuthorized: false,
        contractAwardAuthority: "not-contract-award",
        grantAwardAuthority: "not-grant-award",
        governmentEndorsementAuthority: "not-government-endorsement",
        humanReviewRequired: true
      },
      nextActions,
      packetAuditHash: generateScrimedAuditHash(packetHashPayload),
      boundary: capitalAcquisitionCapturePacketBoundary
    }
  };
}

function markdownList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

export function buildCapitalAcquisitionCapturePacketMarkdown(
  input: CapitalCapturePacketInput
) {
  const result = buildCapitalAcquisitionCapturePacket(input);
  if (!result.ok) {
    return [
      "# SCRIMED Capital Acquisition Capture Packet",
      "",
      "Status: blocked-invalid-input",
      "External release authorized: no",
      "External submission authorized: no",
      "",
      "## Validation Errors",
      markdownList(result.errors),
      "",
      capitalAcquisitionCapturePacketBoundary
    ].join("\n");
  }

  const packet = result.packet;
  return [
    `# ${packet.laneName} Capture Packet`,
    "",
    "Internal metadata-only artifact. Human review is mandatory before any external use.",
    "",
    "## Packet Control",
    `- Packet ID: ${packet.packetId}`,
    `- Packet version: ${packet.packetVersion}`,
    `- Prepared as of: ${packet.preparedAsOf}`,
    `- Readiness: ${packet.readiness}`,
    `- Opportunity decision: ${packet.assessment.decision}`,
    `- Fingerprint binding: ${packet.fingerprintBinding}`,
    `- Packet audit hash: ${packet.packetAuditHash}`,
    "- External release authorized: no",
    "- External submission authorized: no",
    "- Contract or grant award authority: no",
    "",
    "## Exact Fingerprint Bindings",
    `- Opportunity reference SHA-256: ${packet.fingerprints.opportunityReferenceSha256 ?? "not bound"}`,
    `- Candidate SHA-256: ${packet.fingerprints.candidateSha256 ?? "not bound"}`,
    `- Source tree SHA-256: ${packet.fingerprints.sourceTreeSha256 ?? "not bound"}`,
    `- Packet artifact SHA-256: ${packet.fingerprints.packetArtifactSha256 ?? "not bound"}`,
    "",
    "## Gate Status",
    `- Completed gates: ${packet.assessment.completedGateCount}/${packet.assessment.totalGateCount}`,
    `- Missing gates: ${packet.assessment.missingGateIds.join(", ") || "none"}`,
    `- Hard stops: ${packet.assessment.hardStops.join(" | ") || "none"}`,
    "",
    "## Required Evidence",
    markdownList(packet.requiredEvidence),
    "",
    "## Required Reviewers",
    markdownList(packet.requiredReviewers),
    "",
    "## Official Sources",
    packet.officialSources.length > 0
      ? packet.officialSources.map((source) => `- ${source.authority}: ${source.title} (${source.url}). ${source.freshnessPolicy}`).join("\n")
      : "- No lane-specific source is registered. Add the named jurisdiction's official source before qualification.",
    "",
    "## Proof Artifacts",
    ...packet.proofArtifacts.flatMap((artifact) => [
      `### ${artifact.label}`,
      `- Route: ${artifact.route}`,
      `- Use: ${artifact.purpose}`,
      `- Shareability: ${artifact.shareability}`,
      ""
    ]),
    "## Blocked Claims",
    markdownList(packet.blockedClaims),
    "",
    "## Next Actions",
    markdownList(packet.nextActions),
    "",
    "## Boundary",
    packet.boundary,
    "",
    capitalAcquisitionReadinessBoundary
  ].join("\n");
}

export function getCapitalAcquisitionCapturePacketSummary() {
  return {
    status: capitalAcquisitionCapturePacketStatus,
    version: capitalAcquisitionCapturePacketVersion,
    preparedAsOf: capitalAcquisitionReadinessUpdatedAt,
    supportedLaneCount: publicSectorLanes.size,
    proofArtifactCount: proofArtifacts.length,
    complianceGateCount: publicSectorReadinessGates.length,
    defaultExternalReleaseAuthorized: false,
    defaultExternalSubmissionAuthorized: false,
    containsRawProposal: false,
    containsRegistrationIdentifiers: false,
    containsCredentials: false,
    containsPhi: false,
    proofArtifacts,
    fingerprintRequirements: [
      "opportunityReferenceSha256",
      "candidateSha256",
      "sourceTreeSha256",
      "packetArtifactSha256"
    ],
    boundary: capitalAcquisitionCapturePacketBoundary,
    upstreamPolicyVersion: capitalAcquisitionReadinessVersion
  };
}
