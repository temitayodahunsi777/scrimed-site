import { createHash } from "node:crypto";
import type {
  ProtectedDistributionAudience,
  ProtectedDistributionChannelControl
} from "./protectedDistributionLockbox";
import {
  protectedRequiredReviewerRoles,
  type ProtectedReviewerRole
} from "./protectedNamedReviewerSignoffs";
import {
  getScrimedProofPacketManifest,
  scrimedProofPacketManifests,
  type ScrimedProofPacketManifest
} from "./scrimedProofPacketStudio";

export type ProofPacketRecipientClass =
  | "investor-diligence-reviewer"
  | "health-system-buyer"
  | "community-clinic-buyer"
  | "pilot-sponsor"
  | "implementation-partner";

export type ProofPacketSharePurpose =
  | "investor-diligence"
  | "buyer-demo-follow-up"
  | "pilot-scoping"
  | "partner-diligence";

export type ProofPacketShareReadinessDecision =
  | "BLOCKED"
  | "READY_FOR_PROTECTED_INTAKE";

export type ProofPacketShareReadinessInput = {
  packetId: string;
  packetAuditHash: string;
  recipientClass: ProofPacketRecipientClass;
  purpose: ProofPacketSharePurpose;
  channelControl: ProtectedDistributionChannelControl;
  routeFreshnessConfirmed: boolean;
  limitationDisclosuresConfirmed: boolean;
  recipientClassConfirmed: boolean;
  noSensitiveDataConfirmed: boolean;
  protectedHandoffOnlyConfirmed: boolean;
};

export type ProofPacketShareReadinessValidation =
  | { ok: true; input: ProofPacketShareReadinessInput }
  | { ok: false; errors: string[] };

export type ProofPacketShareReadinessOption = {
  packetId: string;
  title: string;
  audience: ScrimedProofPacketManifest["audience"];
  auditHash: string;
  recipientClass: ProofPacketRecipientClass;
  purpose: ProofPacketSharePurpose;
  distributionAudience: ProtectedDistributionAudience;
  allowedChannels: ProtectedDistributionChannelControl[];
  proofRouteCount: number;
};

export type ProofPacketShareReadinessAssessment = {
  service: "scrimed-proof-packet-share-readiness";
  status: typeof proofPacketShareReadinessStatus;
  decision: ProofPacketShareReadinessDecision;
  reasonCodes: string[];
  packet: {
    id: string;
    title: string;
    audience: ScrimedProofPacketManifest["audience"];
    auditHash: string;
    proofRoutes: string[];
  };
  request: {
    recipientClass: ProofPacketRecipientClass;
    purpose: ProofPacketSharePurpose;
    channelControl: ProtectedDistributionChannelControl;
  };
  requiredReviewerRoles: ProtectedReviewerRole[];
  missingExternalEvidence: string[];
  protectedHandoff: {
    route: typeof protectedDistributionLockboxRoute;
    panel: "Protected Distribution Lockbox";
    distributionAudience: ProtectedDistributionAudience;
    channelControl: ProtectedDistributionChannelControl;
    manifestVersion: string;
    manifestTitle: string;
    artifactManifestLabel: string;
    artifactManifestLocator: string;
    recipientScope: ProofPacketRecipientClass;
    revocationPlan: string;
    distributionDisabled: true;
    lockboxRecordCreated: false;
  };
  postMeetingCapture: {
    route: "/sales-operations";
    allowedOutcomes: readonly [
      "follow-up-requested",
      "diligence-requested",
      "pilot-scoping-requested",
      "not-a-fit",
      "no-decision"
    ];
    externalSendAuthorized: false;
  };
  authorities: {
    externalDistributionAuthorized: false;
    investorSolicitationAuthorized: false;
    customerPermissionCreated: false;
    productionReleaseAuthorized: false;
    phiAuthorized: false;
    liveClinicalExecutionAuthorized: false;
  };
  assessmentHash: string;
  assessedAt: string;
  boundary: typeof proofPacketShareReadinessBoundary;
};

type PacketSharePolicy = {
  packetId: string;
  recipientClass: ProofPacketRecipientClass;
  purpose: ProofPacketSharePurpose;
  distributionAudience: ProtectedDistributionAudience;
  allowedChannels: ProtectedDistributionChannelControl[];
};

export const proofPacketShareReadinessApiRoute =
  "/api/scrimed-proof-packet-studio/share-readiness";
export const proofPacketShareReadinessStatus =
  "proof-packet-share-readiness-active-no-send-no-phi";
export const proofPacketShareReadinessPolicyVersion =
  "scrimed-proof-share-policy-2026-08-11.1";
export const protectedDistributionLockboxRoute = "/pilot-workspace/access";
export const proofPacketShareReadinessBoundary =
  "Proof Packet Share Readiness validates a no-PII handoff draft for the existing protected Distribution Lockbox. It never sends a packet, names a recipient, records an external approval, creates customer permission, authorizes investment solicitation, releases protected material, enables PHI, approves production use, or authorizes live clinical execution.";

const requiredInputKeys = [
  "packetId",
  "packetAuditHash",
  "recipientClass",
  "purpose",
  "channelControl",
  "routeFreshnessConfirmed",
  "limitationDisclosuresConfirmed",
  "recipientClassConfirmed",
  "noSensitiveDataConfirmed",
  "protectedHandoffOnlyConfirmed"
] as const;

const recipientClasses: ProofPacketRecipientClass[] = [
  "investor-diligence-reviewer",
  "health-system-buyer",
  "community-clinic-buyer",
  "pilot-sponsor",
  "implementation-partner"
];

const purposes: ProofPacketSharePurpose[] = [
  "investor-diligence",
  "buyer-demo-follow-up",
  "pilot-scoping",
  "partner-diligence"
];

const channelControls: ProtectedDistributionChannelControl[] = [
  "external-data-room",
  "counsel-reviewed-room",
  "procurement-portal",
  "board-governance-room",
  "marketing-release-queue",
  "pr-release-queue",
  "customer-permission-room"
];

const packetSharePolicies: PacketSharePolicy[] = [
  {
    packetId: "investor-platform-packet",
    recipientClass: "investor-diligence-reviewer",
    purpose: "investor-diligence",
    distributionAudience: "investor-data-room",
    allowedChannels: ["counsel-reviewed-room", "external-data-room"]
  },
  {
    packetId: "hospital-buyer-demo-packet",
    recipientClass: "health-system-buyer",
    purpose: "buyer-demo-follow-up",
    distributionAudience: "buyer-diligence-room",
    allowedChannels: ["counsel-reviewed-room", "external-data-room", "procurement-portal"]
  },
  {
    packetId: "faith-clinic-readiness-packet",
    recipientClass: "community-clinic-buyer",
    purpose: "buyer-demo-follow-up",
    distributionAudience: "buyer-diligence-room",
    allowedChannels: ["counsel-reviewed-room", "external-data-room"]
  },
  {
    packetId: "pilot-scope-packet",
    recipientClass: "pilot-sponsor",
    purpose: "pilot-scoping",
    distributionAudience: "buyer-diligence-room",
    allowedChannels: ["counsel-reviewed-room", "external-data-room", "procurement-portal"]
  },
  {
    packetId: "partner-implementation-packet",
    recipientClass: "implementation-partner",
    purpose: "partner-diligence",
    distributionAudience: "buyer-diligence-room",
    allowedChannels: ["counsel-reviewed-room", "external-data-room", "procurement-portal"]
  }
];

const postMeetingOutcomes = [
  "follow-up-requested",
  "diligence-requested",
  "pilot-scoping-requested",
  "not-a-fit",
  "no-decision"
] as const;

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(",")}]`;
  }

  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, item]) => `${JSON.stringify(key)}:${stableSerialize(item)}`)
    .join(",")}}`;
}

function sha256(value: unknown) {
  return createHash("sha256").update(stableSerialize(value)).digest("hex");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isEnumValue<T extends string>(values: readonly T[], value: unknown): value is T {
  return typeof value === "string" && values.includes(value as T);
}

function getPacketSharePolicy(packetId: string) {
  return packetSharePolicies.find((policy) => policy.packetId === packetId);
}

function getPacketProofRoutes(packet: ScrimedProofPacketManifest) {
  return Array.from(
    new Set([
      packet.guidedPathRoute,
      ...packet.demoScript,
      ...packet.proofArtifacts.map((artifact) => artifact.route)
    ])
  );
}

export function validateProofPacketShareReadinessInput(
  value: unknown
): ProofPacketShareReadinessValidation {
  if (!isRecord(value)) {
    return { ok: false, errors: ["Request body must be an object."] };
  }

  const errors: string[] = [];
  const unknownKeys = Object.keys(value).filter(
    (key) => !requiredInputKeys.includes(key as (typeof requiredInputKeys)[number])
  );

  if (unknownKeys.length > 0) {
    errors.push("Unexpected fields are not accepted; recipient names, email addresses, notes, and free text are prohibited.");
  }

  const packetId = typeof value.packetId === "string" ? value.packetId.trim() : "";
  const packetAuditHash =
    typeof value.packetAuditHash === "string" ? value.packetAuditHash.trim() : "";
  const packet = getScrimedProofPacketManifest(packetId);
  const policy = getPacketSharePolicy(packetId);

  if (!packet || !policy) {
    errors.push("Packet is not eligible for external share-readiness assessment.");
  }

  if (packet && packet.auditHash !== packetAuditHash) {
    errors.push("Packet fingerprint does not match the current canonical manifest.");
  }

  if (!isEnumValue(recipientClasses, value.recipientClass)) {
    errors.push("Recipient class is unsupported.");
  }

  if (!isEnumValue(purposes, value.purpose)) {
    errors.push("Share purpose is unsupported.");
  }

  if (!isEnumValue(channelControls, value.channelControl)) {
    errors.push("Distribution channel is unsupported.");
  }

  if (policy && value.recipientClass !== policy.recipientClass) {
    errors.push("Recipient class does not match the packet policy.");
  }

  if (policy && value.purpose !== policy.purpose) {
    errors.push("Share purpose does not match the packet policy.");
  }

  if (
    policy &&
    isEnumValue(channelControls, value.channelControl) &&
    !policy.allowedChannels.includes(value.channelControl)
  ) {
    errors.push("Distribution channel is not allowed for this packet policy.");
  }

  for (const field of [
    "routeFreshnessConfirmed",
    "limitationDisclosuresConfirmed",
    "recipientClassConfirmed",
    "noSensitiveDataConfirmed",
    "protectedHandoffOnlyConfirmed"
  ] as const) {
    if (typeof value[field] !== "boolean") {
      errors.push(`${field} must be a boolean.`);
    }
  }

  if (errors.length > 0 || !packet || !policy) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    input: {
      packetId,
      packetAuditHash,
      recipientClass: value.recipientClass as ProofPacketRecipientClass,
      purpose: value.purpose as ProofPacketSharePurpose,
      channelControl: value.channelControl as ProtectedDistributionChannelControl,
      routeFreshnessConfirmed: value.routeFreshnessConfirmed as boolean,
      limitationDisclosuresConfirmed: value.limitationDisclosuresConfirmed as boolean,
      recipientClassConfirmed: value.recipientClassConfirmed as boolean,
      noSensitiveDataConfirmed: value.noSensitiveDataConfirmed as boolean,
      protectedHandoffOnlyConfirmed: value.protectedHandoffOnlyConfirmed as boolean
    }
  };
}

export function assessProofPacketShareReadiness(
  input: ProofPacketShareReadinessInput,
  assessedAt = new Date().toISOString()
): ProofPacketShareReadinessAssessment {
  const packet = getScrimedProofPacketManifest(input.packetId);
  const policy = getPacketSharePolicy(input.packetId);

  if (!packet || !policy || packet.auditHash !== input.packetAuditHash) {
    throw new Error("Proof packet share-readiness input was not validated.");
  }

  const confirmationResults = [
    ["route-freshness-not-confirmed", input.routeFreshnessConfirmed],
    ["limitation-disclosures-not-confirmed", input.limitationDisclosuresConfirmed],
    ["recipient-class-not-confirmed", input.recipientClassConfirmed],
    ["no-sensitive-data-not-confirmed", input.noSensitiveDataConfirmed],
    ["protected-handoff-only-not-confirmed", input.protectedHandoffOnlyConfirmed]
  ] as const;
  const failedConfirmationCodes = confirmationResults
    .filter(([, passed]) => !passed)
    .map(([reasonCode]) => reasonCode);
  const decision: ProofPacketShareReadinessDecision =
    failedConfirmationCodes.length === 0
      ? "READY_FOR_PROTECTED_INTAKE"
      : "BLOCKED";
  const proofRoutes = getPacketProofRoutes(packet);
  const manifestVersion = `proof-${packet.auditHash.replace("scrimed-intel-", "")}`;
  const assessmentHash = sha256({
    channelControl: input.channelControl,
    confirmationResults,
    packetAuditHash: packet.auditHash,
    packetId: packet.id,
    policyVersion: proofPacketShareReadinessPolicyVersion,
    purpose: input.purpose,
    recipientClass: input.recipientClass
  });

  return {
    service: "scrimed-proof-packet-share-readiness",
    status: proofPacketShareReadinessStatus,
    decision,
    reasonCodes:
      decision === "READY_FOR_PROTECTED_INTAKE"
        ? ["preflight-complete-protected-review-still-required"]
        : failedConfirmationCodes,
    packet: {
      id: packet.id,
      title: packet.title,
      audience: packet.audience,
      auditHash: packet.auditHash,
      proofRoutes
    },
    request: {
      recipientClass: input.recipientClass,
      purpose: input.purpose,
      channelControl: input.channelControl
    },
    requiredReviewerRoles: [...protectedRequiredReviewerRoles],
    missingExternalEvidence: [
      "Named reviewer sign-off references bound to the exact packet fingerprint",
      "Customer or recipient permission retained outside SCRIMED where required",
      "Counsel and finance review retained where applicable",
      "AAL2-protected Distribution Lockbox record",
      "Time-bounded release decision and revocation owner"
    ],
    protectedHandoff: {
      route: protectedDistributionLockboxRoute,
      panel: "Protected Distribution Lockbox",
      distributionAudience: policy.distributionAudience,
      channelControl: input.channelControl,
      manifestVersion,
      manifestTitle: packet.title,
      artifactManifestLabel: "SCRIMED proof packet manifest",
      artifactManifestLocator: `internal-proof-packet:${packet.id}:${packet.auditHash}`,
      recipientScope: input.recipientClass,
      revocationPlan:
        "Revoke access in the approved external channel, freeze further sharing, and retain the protected audit receipt.",
      distributionDisabled: true,
      lockboxRecordCreated: false
    },
    postMeetingCapture: {
      route: "/sales-operations",
      allowedOutcomes: postMeetingOutcomes,
      externalSendAuthorized: false
    },
    authorities: {
      externalDistributionAuthorized: false,
      investorSolicitationAuthorized: false,
      customerPermissionCreated: false,
      productionReleaseAuthorized: false,
      phiAuthorized: false,
      liveClinicalExecutionAuthorized: false
    },
    assessmentHash,
    assessedAt,
    boundary: proofPacketShareReadinessBoundary
  };
}

export function getProofPacketShareReadinessSummary() {
  return {
    service: "scrimed-proof-packet-share-readiness",
    status: proofPacketShareReadinessStatus,
    policyVersion: proofPacketShareReadinessPolicyVersion,
    apiRoute: proofPacketShareReadinessApiRoute,
    protectedDistributionLockboxRoute,
    boundary: proofPacketShareReadinessBoundary,
    eligiblePackets: packetSharePolicies.map((policy): ProofPacketShareReadinessOption => {
      const packet = scrimedProofPacketManifests.find(
        (candidate) => candidate.id === policy.packetId
      );

      if (!packet) {
        throw new Error(`Missing proof packet manifest ${policy.packetId}.`);
      }

      return {
        packetId: packet.id,
        title: packet.title,
        audience: packet.audience,
        auditHash: packet.auditHash,
        recipientClass: policy.recipientClass,
        purpose: policy.purpose,
        distributionAudience: policy.distributionAudience,
        allowedChannels: policy.allowedChannels,
        proofRouteCount: getPacketProofRoutes(packet).length
      };
    }),
    requiredConfirmations: [
      "Canonical proof routes were checked for freshness.",
      "Packet limitation disclosures remain visible.",
      "Only the recipient category, not identity or contact data, is represented.",
      "The packet contains no PHI, credentials, secrets, or protected workspace payloads.",
      "This result prepares protected intake and does not authorize or send an external share."
    ],
    requiredReviewerRoles: [...protectedRequiredReviewerRoles],
    authorities: {
      externalDistributionAuthorized: false,
      investorSolicitationAuthorized: false,
      customerPermissionCreated: false,
      productionReleaseAuthorized: false,
      phiAuthorized: false,
      liveClinicalExecutionAuthorized: false
    }
  };
}
