import { diligencePacketShareGuardApiRoute } from "./diligencePacketShareGuard";

export type RecipientQualificationDecision =
  | "eligible-internal-no-secret"
  | "eligible-after-human-review"
  | "blocked-until-customer-authorization"
  | "blocked-until-qualified-review"
  | "blocked";

export type RecipientQualificationClass =
  | "internal-release-steward"
  | "qualified-investor-or-buyer-under-review"
  | "customer-specific-recipient"
  | "public-or-press"
  | "clinical-production-reviewer"
  | "security-certification-reviewer";

export type RecipientQualificationEntry = {
  id: string;
  recipientClass: RecipientQualificationClass;
  packetLane: string;
  defaultDecision: RecipientQualificationDecision;
  requiredEvidence: string[];
  allowedPayload: string[];
  blockedPayload: string[];
  requiredReviewer: string;
  expiryPolicy: string;
  revocationPolicy: string;
  auditExpectation: string;
  safetyBoundary: string;
  nextAction: string;
};

export type RecipientQualificationMatrixSummary = {
  service: "scrimed-recipient-qualification-matrix";
  status: typeof recipientQualificationMatrixStatus;
  route: typeof recipientQualificationMatrixRoute;
  apiRoute: typeof recipientQualificationMatrixApiRoute;
  briefRoute: typeof recipientQualificationMatrixBriefRoute;
  generatedAt: "static-no-secret-recipient-qualification";
  noPhiConfirmed: true;
  tokenMaterialCaptured: false;
  productionApproval: false;
  externalShareAuthority: "qualified-recipient-review-required";
  publicDistributionAuthority: "not-authorized";
  recipientIdentifierStorage: "not-stored-in-scrimed";
  customerSpecificAuthority: "not-authorized-without-customer-permission";
  clinicalCareAuthority: "not-authorized-live-care";
  phiAuthority: "not-authorized-production-phi";
  securityCertification: "not-security-certified";
  qualificationHash: string;
  recipientClassCount: number;
  qualifiedReviewRequiredCount: number;
  blockedRecipientCount: number;
  revocationRequiredCount: number;
  entries: RecipientQualificationEntry[];
  preflightChecklist: string[];
  blockedClaims: string[];
  boundary: typeof recipientQualificationMatrixBoundary;
};

export const recipientQualificationMatrixStatus =
  "recipient-qualification-matrix-active-no-secret";
export const recipientQualificationMatrixRoute =
  "/release-continuity#recipient-qualification-matrix";
export const recipientQualificationMatrixApiRoute =
  "/api/release-continuity/recipient-qualification-matrix";
export const recipientQualificationMatrixBriefRoute =
  "/api/release-continuity/recipient-qualification-matrix/brief";

export const recipientQualificationMatrixBoundary =
  "SCRIMED Recipient Qualification Matrix is a no-secret recipient policy preflight for diligence packet sharing. It does not store recipient names, recipient emails, access grants, raw access logs, bearer tokens, PHI, customer data, signed approvals, legal opinions, certification evidence, production connector payloads, public distribution approval, customer go-live approval, or live clinical care authorization.";

const noSecretAllowedPayload = [
  "artifact label",
  "route",
  "status",
  "safe boundary",
  "review owner",
  "blocked claims",
  "deterministic evidence hash",
  "metadata-only next action"
];

const blockedPayload = [
  "recipient names",
  "recipient emails",
  "recipient lists",
  "access grants",
  "raw access logs",
  "IP addresses",
  "device identifiers",
  "bearer tokens",
  "JWTs",
  "refresh tokens",
  "Supabase keys",
  "service-role keys",
  "passwords",
  "PHI",
  "patient identifiers",
  "customer data",
  "signed legal approvals",
  "certification evidence",
  "production connector payloads",
  "protected packet bodies",
  "boundary-release approval language"
];

const preflightChecklist = [
  "Classify the recipient before selecting packet sections.",
  "Confirm no recipient identifiers, access grants, raw logs, PHI, customer data, tokens, or credentials are stored in SCRIMED.",
  `Apply the Diligence Packet Share Guard at ${diligencePacketShareGuardApiRoute} before referencing any artifact externally.`,
  "Require Claim Guard review for every buyer, investor, public, clinical, security, certification, PHI, production, connector, or go-live statement.",
  "Use qualified external systems for named recipients, invitations, access grants, revocation evidence, and raw access logs.",
  "Expire recipient-scoped packet references unless release steward review renews the metadata-only authorization.",
  "Treat protected Boundary Release Evidence Intake Packet route metadata as withheld until human AAL2 evidence and qualified review exist."
];

const blockedClaims = [
  "recipient qualification matrix is distribution approval",
  "recipient is authorized without human review",
  "public sharing approved",
  "customer-specific sharing approved",
  "boundary release approved",
  "protected packet can be shared publicly",
  "strict AAL2 proof retained",
  "PHI processing authorized",
  "live clinical care authorized",
  "security or compliance certified",
  "production connector approved",
  "customer go-live approved"
];

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => stableSerialize(item)).join(",")}]`;

  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, item]) => `${JSON.stringify(key)}:${stableSerialize(item)}`)
    .join(",")}}`;
}

function qualificationHash(payload: unknown) {
  const serialized = stableSerialize(payload);
  let hash = 0x811c9dc5;

  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return `recipient-qualification-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function qualificationEntry(input: RecipientQualificationEntry): RecipientQualificationEntry {
  return input;
}

function buildQualificationEntries(): RecipientQualificationEntry[] {
  return [
    qualificationEntry({
      id: "internal-release-steward-preflight",
      recipientClass: "internal-release-steward",
      packetLane: "internal-no-secret-review",
      defaultDecision: "eligible-internal-no-secret",
      requiredEvidence: [
        "release steward identity",
        "artifact list",
        "blocked-claim review",
        "no-secret boundary acknowledgement"
      ],
      allowedPayload: noSecretAllowedPayload,
      blockedPayload,
      requiredReviewer: "release steward",
      expiryPolicy: "Expires when artifact hash, blocked claims, or release status changes.",
      revocationPolicy: "Revoke internal draft if any withheld material is detected.",
      auditExpectation: "Retain no-secret packet hash, reviewer role, timestamp, and decision label.",
      safetyBoundary:
        "Internal review may prepare metadata only; it cannot approve public sharing, customer sharing, clinical authority, PHI authority, certification, or production release.",
      nextAction: "Prepare metadata-only packet draft and route to share guard."
    }),
    qualificationEntry({
      id: "qualified-buyer-investor-preflight",
      recipientClass: "qualified-investor-or-buyer-under-review",
      packetLane: "protected-diligence-metadata-review",
      defaultDecision: "eligible-after-human-review",
      requiredEvidence: [
        "recipient class selected",
        "business purpose",
        "human release-steward approval",
        "Claim Guard review",
        "access lane selected outside SCRIMED"
      ],
      allowedPayload: noSecretAllowedPayload,
      blockedPayload,
      requiredReviewer: "release steward + claim guard reviewer",
      expiryPolicy: "Seven-day metadata review window unless renewed by release steward.",
      revocationPolicy:
        "Revoke if purpose changes, recipient scope changes, claims expand, or artifact freshness expires.",
      auditExpectation:
        "Retain no-secret recipient class, purpose, packet hash, reviewer roles, expiry, and revocation status.",
      safetyBoundary:
        "Qualified buyer or investor review is diligence support only; it is not securities material, public distribution approval, certification, PHI authority, or customer go-live approval.",
      nextAction:
        "Share only reviewed metadata-safe sections through a protected external diligence lane."
    }),
    qualificationEntry({
      id: "customer-specific-recipient-preflight",
      recipientClass: "customer-specific-recipient",
      packetLane: "customer-authorized-diligence-review",
      defaultDecision: "blocked-until-customer-authorization",
      requiredEvidence: [
        "customer permission retained outside SCRIMED",
        "named-recipient authorization retained outside SCRIMED",
        "access-log path retained outside SCRIMED",
        "release decision",
        "legal/privacy review"
      ],
      allowedPayload: ["metadata-only customer-safe artifact labels after explicit permission"],
      blockedPayload,
      requiredReviewer: "buyer authorization owner + legal/privacy reviewer + release steward",
      expiryPolicy: "Expires at customer permission expiry or seven days, whichever comes first.",
      revocationPolicy:
        "Immediate revocation required when permission, recipient role, legal basis, or packet scope changes.",
      auditExpectation:
        "SCRIMED may retain only no-secret permission status, reviewer roles, packet hash, expiry, and revocation status.",
      safetyBoundary:
        "Customer-specific sharing is blocked until explicit customer permission and external access controls exist; it does not authorize PHI, EHR access, connector production, or go-live.",
      nextAction: "Route to protected buyer release control and external evidence-room access workflow."
    }),
    qualificationEntry({
      id: "public-press-recipient-preflight",
      recipientClass: "public-or-press",
      packetLane: "public-distribution-blocked",
      defaultDecision: "blocked",
      requiredEvidence: [
        "qualified legal review",
        "qualified privacy review",
        "qualified security review",
        "qualified clinical/regulatory review when clinical language exists",
        "approved exact public copy"
      ],
      allowedPayload: [],
      blockedPayload,
      requiredReviewer: "qualified legal/privacy/security/clinical/release reviewers",
      expiryPolicy: "No expiry because public distribution is blocked by default.",
      revocationPolicy: "Block immediately if any diligence packet material is proposed for public use.",
      auditExpectation: "Retain blocked decision, proposed claim category, reviewer route, and safe rewrite request.",
      safetyBoundary:
        "Public or press recipients cannot receive diligence packets, protected proof, security claims, certification claims, customer-specific artifacts, PHI claims, or clinical authority claims from this matrix.",
      nextAction: "Use public-market copy only after exact-language qualified review; do not share packets."
    }),
    qualificationEntry({
      id: "clinical-production-reviewer-preflight",
      recipientClass: "clinical-production-reviewer",
      packetLane: "clinical-authority-review-blocked",
      defaultDecision: "blocked-until-qualified-review",
      requiredEvidence: [
        "clinical governance reviewer",
        "regulatory reviewer",
        "intended-use statement",
        "clinical validation plan",
        "human-in-the-loop requirement"
      ],
      allowedPayload: [
        "synthetic use notice",
        "current NO-GO boundaries",
        "clinical review requirements",
        "research/demo-only artifact references"
      ],
      blockedPayload,
      requiredReviewer: "clinical governance + regulatory reviewer",
      expiryPolicy: "Expires when intended use, clinical claim, workflow risk, or model behavior changes.",
      revocationPolicy:
        "Revoke if material implies diagnosis, treatment, prescribing, imaging interpretation, patient outreach, clinical validation, or live patient care.",
      auditExpectation: "Retain reviewer role, intended-use category, blocked claims, and escalation decision.",
      safetyBoundary:
        "Clinical reviewer access supports governance planning only; it is not clinical validation, diagnosis, treatment, prescribing, imaging interpretation, or live-care approval.",
      nextAction: "Share only research/demo language and route clinical claims to the approval path."
    }),
    qualificationEntry({
      id: "security-certification-reviewer-preflight",
      recipientClass: "security-certification-reviewer",
      packetLane: "security-review-metadata-only",
      defaultDecision: "blocked-until-qualified-review",
      requiredEvidence: [
        "qualified security/privacy reviewer",
        "control scope",
        "evidence freshness check",
        "withheld-material review",
        "certification-claim block"
      ],
      allowedPayload: [
        "no-secret control list",
        "safety headers",
        "fail-closed smoke status",
        "known limitations",
        "blocked certification claims"
      ],
      blockedPayload,
      requiredReviewer: "qualified security/privacy reviewer + release steward",
      expiryPolicy: "Expires when controls, dependencies, deployment, environment, or evidence freshness changes.",
      revocationPolicy:
        "Revoke if material implies HIPAA certification, SOC 2 completion, HITRUST certification, penetration-test pass, or production security approval.",
      auditExpectation: "Retain reviewer role, scope, evidence hash, blocked claims, and expiry status.",
      safetyBoundary:
        "Security reviewer access is current-state review support only; it is not security certification, compliance certification, HIPAA certification, SOC 2 completion, or production approval.",
      nextAction: "Share no-secret control posture and route certification language to qualified external review."
    })
  ];
}

export function getRecipientQualificationMatrixSummary(): RecipientQualificationMatrixSummary {
  const entries = buildQualificationEntries();
  const reviewRequiredDecisions: RecipientQualificationDecision[] = [
    "eligible-after-human-review",
    "blocked-until-customer-authorization",
    "blocked-until-qualified-review"
  ];

  return {
    service: "scrimed-recipient-qualification-matrix",
    status: recipientQualificationMatrixStatus,
    route: recipientQualificationMatrixRoute,
    apiRoute: recipientQualificationMatrixApiRoute,
    briefRoute: recipientQualificationMatrixBriefRoute,
    generatedAt: "static-no-secret-recipient-qualification",
    noPhiConfirmed: true,
    tokenMaterialCaptured: false,
    productionApproval: false,
    externalShareAuthority: "qualified-recipient-review-required",
    publicDistributionAuthority: "not-authorized",
    recipientIdentifierStorage: "not-stored-in-scrimed",
    customerSpecificAuthority: "not-authorized-without-customer-permission",
    clinicalCareAuthority: "not-authorized-live-care",
    phiAuthority: "not-authorized-production-phi",
    securityCertification: "not-security-certified",
    qualificationHash: qualificationHash({
      status: recipientQualificationMatrixStatus,
      entries: entries.map((entry) => ({
        id: entry.id,
        recipientClass: entry.recipientClass,
        defaultDecision: entry.defaultDecision,
        packetLane: entry.packetLane,
        requiredReviewer: entry.requiredReviewer
      }))
    }),
    recipientClassCount: entries.length,
    qualifiedReviewRequiredCount: entries.filter((entry) =>
      reviewRequiredDecisions.includes(entry.defaultDecision)
    ).length,
    blockedRecipientCount: entries.filter((entry) =>
      ["blocked", "blocked-until-customer-authorization", "blocked-until-qualified-review"].includes(
        entry.defaultDecision
      )
    ).length,
    revocationRequiredCount: entries.filter((entry) => entry.revocationPolicy.length > 0).length,
    entries,
    preflightChecklist,
    blockedClaims,
    boundary: recipientQualificationMatrixBoundary
  };
}

export function buildRecipientQualificationMatrixBrief() {
  const summary = getRecipientQualificationMatrixSummary();

  return [
    "# SCRIMED Recipient Qualification Matrix",
    "",
    `Status: ${summary.status}`,
    `Generated: ${summary.generatedAt}`,
    `Qualification hash: ${summary.qualificationHash}`,
    `External share authority: ${summary.externalShareAuthority}`,
    `Public distribution authority: ${summary.publicDistributionAuthority}`,
    `Recipient identifier storage: ${summary.recipientIdentifierStorage}`,
    `Customer-specific authority: ${summary.customerSpecificAuthority}`,
    `Clinical care authority: ${summary.clinicalCareAuthority}`,
    `PHI authority: ${summary.phiAuthority}`,
    `Security certification: ${summary.securityCertification}`,
    `Production approval: ${summary.productionApproval}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Recipient Classes",
    ...summary.entries.map(
      (entry) =>
        `- ${entry.id} (${entry.recipientClass}; ${entry.defaultDecision}): lane ${entry.packetLane}. Reviewer: ${entry.requiredReviewer}. Expiry: ${entry.expiryPolicy} Revocation: ${entry.revocationPolicy} Next: ${entry.nextAction}`
    ),
    "",
    "## Preflight Checklist",
    ...summary.preflightChecklist.map((item) => `- ${item}`),
    "",
    "## Blocked Claims",
    ...summary.blockedClaims.map((claim) => `- ${claim}`)
  ].join("\n");
}
