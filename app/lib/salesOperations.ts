import { getPilotProgramBySlug, type PilotProgram } from "./demoPilotPrograms";
import {
  recommendGovernanceWorkflowPack,
  type GovernanceWorkflowPackRecommendation
} from "./agentWorkspaceGovernancePacks";
import type { PilotIntakeHandoffPayload } from "./pilotIntake";
import { getSalesAttributionSummary } from "./salesAttribution";
import type { SalesOpportunityWorkspaceProvisioning } from "./opportunityWorkspaceProvisioning";
import {
  opportunityWorkspaceProvisioningApiRoute,
  opportunityWorkspaceProvisioningPacketApiRoute,
  opportunityWorkspaceProvisioningPacketProofStackStatus,
  opportunityWorkspaceProvisioningProofStackStatus
} from "./opportunityWorkspaceProvisioning";
import type { SalesBuyerTenantLifecycle } from "./buyerTenantLifecycle";
import {
  buyerTenantLifecycleApiRoute,
  buyerTenantLifecyclePacketApiRoute,
  buyerTenantLifecyclePacketProofStackStatus,
  buyerTenantLifecycleProofStackStatus
} from "./buyerTenantLifecycle";
import type { SalesProductionActivationReadiness } from "./productionActivationReadiness";
import {
  productionActivationReadinessApiRoute,
  productionActivationReadinessPacketApiRoute,
  productionActivationReadinessPacketProofStackStatus,
  productionActivationReadinessProofStackStatus
} from "./productionActivationReadiness";
import type { SalesCustomerActivationApprovals } from "./customerActivationApprovals";
import {
  customerActivationApprovalsApiRoute,
  customerActivationApprovalsPacketApiRoute,
  customerActivationApprovalsPacketProofStackStatus,
  customerActivationApprovalsProofStackStatus
} from "./customerActivationApprovals";
import type { SalesBuyerDiligenceRoom } from "./buyerDiligenceRoom";
import {
  buyerDiligenceRoomApiRoute,
  buyerDiligenceRoomPacketApiRoute,
  buyerDiligenceRoomPacketProofStackStatus,
  buyerDiligenceRoomProofStackStatus
} from "./buyerDiligenceRoom";
import type { SalesSecureEvidenceVaultReadiness } from "./secureEvidenceVaultReadiness";
import {
  secureEvidenceVaultReadinessApiRoute,
  secureEvidenceVaultReadinessPacketApiRoute,
  secureEvidenceVaultReadinessPacketProofStackStatus,
  secureEvidenceVaultReadinessProofStackStatus
} from "./secureEvidenceVaultReadiness";
import {
  buyerDemoSessionPacketApiRoute,
  buyerDemoSessionPacketProofStackStatus,
  buyerDemoSessionProofStackStatus,
  buyerDemoSessionsApiRoute
} from "./buyerDemoSessions";
import {
  salesDemoSessionQaApiRoute,
  salesDemoSessionQaBoundary,
  salesDemoSessionQaControls,
  salesDemoSessionQaProofStackStatus
} from "./salesDemoSessionQa";

export const salesOperationsBoundary =
  "SCRIMED Sales Operations manages business-contact and workflow-scope opportunities only. Do not enter PHI, patient identifiers, live clinical records, diagnosis details, payer member identifiers, or production healthcare data. Every offer remains a governed synthetic pilot or enterprise evaluation until production controls are separately approved.";

export const salesOperationsNoStoreHeaders = {
  "Cache-Control": "private, no-store",
  Vary: "Authorization",
  "X-SCRIMED-Data-Boundary": "business-contact-and-workflow-scope-only"
} as const;

export const salesPipelineStages = [
  "new",
  "qualified",
  "discovery",
  "proposal",
  "pilot-planning",
  "won",
  "closed-lost"
] as const;

export type SalesPipelineStage = (typeof salesPipelineStages)[number];
export type SalesCrmSyncStatus = "not-attempted" | "synced" | "failed" | "not-configured";

export type SalesOpportunity = {
  intakeId: string;
  receivedAt: string;
  pipelineStage: SalesPipelineStage;
  assignedOwner: string;
  nextAction: string;
  nextActionDueAt: string | null;
  nextActionCompletedAt: string | null;
  updatedAt: string;
  updatedBy: string | null;
  lastCrmSyncAt: string | null;
  lastCrmSyncStatus: SalesCrmSyncStatus;
  lastCrmSyncDetail: string;
  lastCrmExportAt: string | null;
  lastAttributionAnalyticsPacketAt?: string | null;
  lastBuyerDealRoomPacketAt?: string | null;
  workspaceProvisioning?: SalesOpportunityWorkspaceProvisioning | null;
  buyerTenantLifecycle?: SalesBuyerTenantLifecycle | null;
  productionActivationReadiness?: SalesProductionActivationReadiness | null;
  customerActivationApprovals?: SalesCustomerActivationApprovals | null;
  buyerDiligenceRoom?: SalesBuyerDiligenceRoom | null;
  secureEvidenceVaultReadiness?: SalesSecureEvidenceVaultReadiness | null;
  assessmentStartAt: string | null;
  assessmentDurationMinutes: number;
  assessmentMeetingUrl: string;
  assessmentStatus: "not-scheduled" | "invitation-prepared" | "confirmed" | "completed" | "cancelled";
  retentionUntil: string;
  payload: PilotIntakeHandoffPayload;
};

export type SalesAuditEvent = {
  id: string;
  intakeId: string;
  actorUserId: string;
  eventType:
    | "opportunity-updated"
    | "proposal-downloaded"
    | "crm-sync-recorded"
    | "crm-export-downloaded"
    | "follow-up-draft-downloaded"
    | "follow-up-completed"
    | "assessment-invitation-downloaded"
    | "attribution-analytics-packet-downloaded"
    | "buyer-deal-room-packet-downloaded"
    | "opportunity-workspace-provisioned"
    | "opportunity-workspace-packet-downloaded"
    | "buyer-tenant-lifecycle-activated"
    | "buyer-tenant-lifecycle-packet-downloaded"
    | "production-readiness-prepared"
    | "production-readiness-packet-downloaded"
    | "customer-activation-approvals-recorded"
    | "customer-activation-approvals-packet-downloaded"
    | "buyer-diligence-room-prepared"
    | "buyer-diligence-packet-downloaded"
    | "secure-evidence-vault-readiness-prepared"
    | "secure-evidence-vault-readiness-packet-downloaded"
    | "sales-demo-session-recorded"
    | "sales-demo-session-packet-downloaded";
  eventMetadata: Record<string, unknown>;
  createdAt: string;
};

export type SalesOperationsDashboard = {
  tenantId: string;
  summary: {
    opportunityCount: number;
    openCount: number;
    proposalCount: number;
    pilotPlanningCount: number;
    wonCount: number;
    dueActionCount: number;
    overdueActionCount: number;
    scheduledAssessmentCount: number;
  };
  security: {
    authentication: string;
    assuranceLevel: string;
    maximumSessionHours: number;
    inactivityHours: number;
    passwordAuthentication: boolean;
  };
  opportunities: SalesOpportunity[];
  auditEvents: SalesAuditEvent[];
  boundary: string;
};

export type SalesOpportunityUpdate = {
  pipelineStage: SalesPipelineStage;
  assignedOwner: string;
  nextAction: string;
  nextActionDueAt: string | null;
};

export type SalesAssessmentSchedule = {
  startAt: string;
  durationMinutes: number;
  meetingUrl: string;
};

const offerPilotMap: Record<string, string> = {
  "synthetic-pilot-evaluation": "60-day-governed-automation-pilot",
  "Synthetic Pilot Evaluation": "60-day-governed-automation-pilot",
  "workflow-intelligence-assessment": "30-day-workflow-intelligence-sprint",
  "Workflow Intelligence Assessment": "30-day-workflow-intelligence-sprint",
  "ai-readiness-governance-audit": "ai-governance-interoperability-readiness",
  "AI Readiness + Governance Audit": "ai-governance-interoperability-readiness",
  "clinical-operations-automation-blueprint": "90-day-enterprise-atlas-pilot",
  "Clinical Operations Automation Blueprint": "90-day-enterprise-atlas-pilot"
};

const prohibitedSalesTextPatterns = [
  /\bmedical record\b/i,
  /\bpatient identifier\b/i,
  /\bmember id\b/i,
  /\bdiagnos(?:is|ed)\b/i,
  /\bdate of birth\b/i,
  /\b(?:dob|mrn)\b/i,
  /\bprotected health information\b/i,
  /\bphi\b/i
];

function markdownList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function cleanMarkdown(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function cleanHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function csvCell(value: string | number | null) {
  const raw = value === null ? "" : String(value);
  const formulaSafe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return `"${formulaSafe.replaceAll('"', '""')}"`;
}

function escapeCalendar(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

function calendarTimestamp(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function isSalesPipelineStage(value: unknown): value is SalesPipelineStage {
  return typeof value === "string" && salesPipelineStages.includes(value as SalesPipelineStage);
}

export function validateSalesOpportunityUpdate(payload: unknown):
  | { ok: true; update: SalesOpportunityUpdate }
  | { ok: false; message: string } {
  if (!payload || typeof payload !== "object") {
    return { ok: false, message: "Opportunity update must be a JSON object." };
  }

  const candidate = payload as Record<string, unknown>;
  const pipelineStage = candidate.pipelineStage;
  const assignedOwner = typeof candidate.assignedOwner === "string" ? candidate.assignedOwner.trim() : "";
  const nextAction = typeof candidate.nextAction === "string" ? candidate.nextAction.trim() : "";
  const nextActionDueAt =
    candidate.nextActionDueAt === null || candidate.nextActionDueAt === ""
      ? null
      : typeof candidate.nextActionDueAt === "string"
        ? candidate.nextActionDueAt
        : "invalid";

  if (!isSalesPipelineStage(pipelineStage)) {
    return { ok: false, message: "Select a supported sales pipeline stage." };
  }

  if (assignedOwner.length > 180 || nextAction.length > 500) {
    return { ok: false, message: "Owner or next action exceeds the allowed business-scope length." };
  }

  if (nextActionDueAt === "invalid" || (nextActionDueAt && Number.isNaN(Date.parse(nextActionDueAt)))) {
    return { ok: false, message: "Select a valid next-action due date." };
  }

  if (prohibitedSalesTextPatterns.some((pattern) => pattern.test(`${assignedOwner} ${nextAction}`))) {
    return {
      ok: false,
      message: "Remove patient, clinical-record, diagnosis, member, or PHI references from the sales update."
    };
  }

  return {
    ok: true,
    update: {
      pipelineStage,
      assignedOwner,
      nextAction,
      nextActionDueAt
    }
  };
}

export function validateSalesAssessmentSchedule(payload: unknown):
  | { ok: true; schedule: SalesAssessmentSchedule }
  | { ok: false; message: string } {
  if (!payload || typeof payload !== "object") {
    return { ok: false, message: "Assessment schedule must be a JSON object." };
  }

  const candidate = payload as Record<string, unknown>;
  const startAt = typeof candidate.startAt === "string" ? candidate.startAt : "";
  const durationMinutes = Number(candidate.durationMinutes);
  const meetingUrl = typeof candidate.meetingUrl === "string" ? candidate.meetingUrl.trim() : "";

  if (!startAt || Number.isNaN(Date.parse(startAt)) || Date.parse(startAt) < Date.now() - 300_000) {
    return { ok: false, message: "Select a valid future assessment start time." };
  }

  if (!Number.isInteger(durationMinutes) || durationMinutes < 15 || durationMinutes > 240) {
    return { ok: false, message: "Assessment duration must be between 15 and 240 minutes." };
  }

  if (meetingUrl.length > 500 || (meetingUrl && !meetingUrl.startsWith("https://"))) {
    return { ok: false, message: "Use an HTTPS meeting URL or leave the meeting URL empty." };
  }

  return { ok: true, schedule: { startAt, durationMinutes, meetingUrl } };
}

export function getPilotProgramForOpportunity(opportunity: SalesOpportunity): PilotProgram | null {
  const pilotSlug = offerPilotMap[opportunity.payload.scope.offerInterest];
  return pilotSlug ? getPilotProgramBySlug(pilotSlug) ?? null : null;
}

export function getGovernanceWorkflowPackForOpportunity(
  opportunity: SalesOpportunity
): GovernanceWorkflowPackRecommendation {
  return (
    opportunity.payload.assessment.governanceWorkflowPack ??
    recommendGovernanceWorkflowPack({
      buyerSegment: opportunity.payload.organization.buyerSegment,
      organizationSize: opportunity.payload.organization.organizationSize,
      region: opportunity.payload.organization.region,
      offerInterest: opportunity.payload.scope.offerInterest,
      workflowTargets: opportunity.payload.scope.workflowTargets,
      readinessNeeds: opportunity.payload.scope.readinessNeeds,
      governanceRequirements: opportunity.payload.scope.governanceRequirements
    })
  );
}

export function getSalesAttributionForOpportunity(opportunity: SalesOpportunity) {
  return opportunity.payload.attribution ?? null;
}

export function getSalesOperationsSummary() {
  const attributionSummary = getSalesAttributionSummary();

  return {
    service: "scrimed-sales-operations",
    route: "/sales-operations",
    apiRoute: "/api/sales-operations",
    status: "tenant-admin-protected",
    crmConfigured: true,
    crmMode: process.env.SCRIMED_PILOT_INTAKE_WEBHOOK_URL ? "native-export-plus-webhook" : "native-export",
    crmWebhookConfigured: Boolean(process.env.SCRIMED_PILOT_INTAKE_WEBHOOK_URL),
    authentication: "passkey-or-magic-link-plus-totp",
    sessionPolicy: "12-hour maximum; 2-hour inactivity boundary",
    pipelineStages: salesPipelineStages,
    governancePackRouting: {
      status: "enabled",
      source: "buyer-intake-deterministic-router",
      route: "/governance-packs",
      apiRoute: "/api/agent-workspace/governance-packs",
      crmPayloadField: "governanceWorkflowPack"
    },
    attribution: {
      status: attributionSummary.status,
      route: attributionSummary.route,
      apiRoute: attributionSummary.apiRoute,
      sourceSignalCount: attributionSummary.sourceSignalCount,
      crmPayloadField: "attribution",
      noPhiBoundary: true
    },
    dealRoom: {
      status: "sales-to-buyer-room-linkage-ready",
      route: "/pilot-deal-room",
      apiRoute: "/api/pilot-deal-room",
      protectedPacketRoute: "/api/sales-operations/opportunities/{intakeId}/deal-room-packet",
      defaultWorkspaceSlug: "atlas-synthetic-evaluation",
      noPhiBoundary: true
    },
    opportunityWorkspaceProvisioning: {
      status: opportunityWorkspaceProvisioningProofStackStatus,
      apiRoute: opportunityWorkspaceProvisioningApiRoute,
      packetApiRoute: opportunityWorkspaceProvisioningPacketApiRoute,
      packetProofStackStatus: opportunityWorkspaceProvisioningPacketProofStackStatus,
      workspaceMode: "buyer-specific-protected-workspace",
      invitationMode: "manual-onboarding-packet-only",
      noPhiBoundary: true
    },
    buyerTenantLifecycle: {
      status: buyerTenantLifecycleProofStackStatus,
      apiRoute: buyerTenantLifecycleApiRoute,
      packetApiRoute: buyerTenantLifecyclePacketApiRoute,
      packetProofStackStatus: buyerTenantLifecyclePacketProofStackStatus,
      tenantMode: "buyer-dedicated-logical-tenant",
      ssoPolicy: "buyer-domain-policy-ready",
      invitationMode: "manual-packet-gated",
      accessReviewCadenceDays: 30,
      noPhiBoundary: true
    },
    productionActivationReadiness: {
      status: productionActivationReadinessProofStackStatus,
      apiRoute: productionActivationReadinessApiRoute,
      packetApiRoute: productionActivationReadinessPacketApiRoute,
      packetProofStackStatus: productionActivationReadinessPacketProofStackStatus,
      ssoDomainVerification: "buyer-domain-review-required",
      redirectOriginRegistry: "origin-registry-ready",
      invitationTemplateApproval: "legal-security-review-required",
      transactionalDelivery: "provider-approval-required-direct-send-disabled",
      accessReviewAutomation: "attestation-reminder-ready",
      archiveExecution: "manual-archive-ready",
      noPhiBoundary: true
    },
    customerActivationApprovals: {
      status: customerActivationApprovalsProofStackStatus,
      apiRoute: customerActivationApprovalsApiRoute,
      packetApiRoute: customerActivationApprovalsPacketApiRoute,
      packetProofStackStatus: customerActivationApprovalsPacketProofStackStatus,
      approvalScope: "paid-pilot-setup-only",
      allowedActions: [
        "buyer workspace configuration",
        "manual onboarding packet preparation",
        "assessment scheduling",
        "synthetic proof-packet release",
        "legal/privacy/security diligence routing"
      ],
      retainedHardGates: [
        "PHI and live clinical records",
        "production connectors",
        "customer SSO cutover",
        "automated bulk invitations",
        "payer submission",
        "patient outreach",
        "autonomous diagnosis or treatment decisions"
      ],
      noPhiBoundary: true
    },
    buyerDiligenceRoom: {
      status: buyerDiligenceRoomProofStackStatus,
      apiRoute: buyerDiligenceRoomApiRoute,
      packetApiRoute: buyerDiligenceRoomPacketApiRoute,
      packetProofStackStatus: buyerDiligenceRoomPacketProofStackStatus,
      evidenceScope: "metadata-only",
      collects: [
        "buyer domain proof status",
        "IdP metadata request status",
        "legal/privacy/security control status",
        "BAA/DPA posture",
        "transactional provider decision",
        "production connector readiness",
        "signed controls register"
      ],
      prohibitedUploads: [
        "PHI",
        "patient identifiers",
        "live clinical records",
        "IdP certificates",
        "production credentials",
        "private keys",
        "payer member data"
      ],
      noPhiBoundary: true
    },
    secureEvidenceVaultReadiness: {
      status: secureEvidenceVaultReadinessProofStackStatus,
      apiRoute: secureEvidenceVaultReadinessApiRoute,
      packetApiRoute: secureEvidenceVaultReadinessPacketApiRoute,
      packetProofStackStatus: secureEvidenceVaultReadinessPacketProofStackStatus,
      vaultMode: "disabled-metadata-only",
      targetAudiences: [
        "CIO",
        "CISO",
        "privacy officer",
        "legal counsel",
        "compliance leader",
        "clinical operations executive",
        "payer operations leader",
        "government health buyer",
        "investor diligence reviewer"
      ],
      readinessControls: [
        "storage provider decision",
        "encryption and key management",
        "DLP and malware scanning",
        "retention and legal hold",
        "access reviews",
        "evidence classification",
        "upload approval workflow",
        "incident response",
        "regional data residency"
      ],
      revenuePath:
        "Turns sensitive-document handling from a blocker into a paid enterprise implementation workstream without prematurely accepting regulated files.",
      noPhiBoundary: true
    },
    buyerDemoExecutionPath: {
      status: "aal2-authenticated-buyer-demo-execution-path",
      apiRoute: "/api/sales-operations/opportunities/{intakeId}/demo-execution",
      briefApiRoute: "/api/sales-operations/opportunities/{intakeId}/demo-execution/brief",
      briefProofStackStatus:
        "operator-brief-non-audited-existing-packets-remain-source-of-truth",
      sourceOfTruth: "existing audited packet routes and protected workspaces",
      purpose:
        "Sequence no-PHI buyer demos, operator workarounds, audited packet release, and paid implementation gates from one authenticated runbook.",
      noPhiBoundary: true
    },
    buyerDemoSessions: {
      status: buyerDemoSessionProofStackStatus,
      apiRoute: buyerDemoSessionsApiRoute,
      packetApiRoute: buyerDemoSessionPacketApiRoute,
      packetProofStackStatus: buyerDemoSessionPacketProofStackStatus,
      persistedFields: [
        "operator notes",
        "buyer questions",
        "blockers",
        "workarounds",
        "next actions",
        "follow-up plan",
        "demo path snapshot",
        "selected proof packet routes"
      ],
      sourceOfTruth: "private Supabase table with deny-all direct RLS and tenant-admin RPC guards",
      purpose:
        "Persist no-PHI buyer demo run history and release audited Markdown session packets for enterprise proof-of-value follow-up.",
      noPhiBoundary: true
    },
    buyerDemoSessionQa: {
      status: salesDemoSessionQaProofStackStatus,
      apiRoute: salesDemoSessionQaApiRoute,
      mode: "AAL2 browser session or externally supplied short-lived bearer token",
      controls: salesDemoSessionQaControls,
      purpose:
        "Verify the buyer demo session write path and packet-audit path through the same protected tenant-admin controls used by real operator demos.",
      boundary: salesDemoSessionQaBoundary,
      noPhiBoundary: true
    },
    boundary: salesOperationsBoundary,
    updated: "2026-06-18"
  };
}

export function buildCrmOpportunityCsv(opportunity: SalesOpportunity) {
  const governancePack = getGovernanceWorkflowPackForOpportunity(opportunity);
  const attribution = getSalesAttributionForOpportunity(opportunity);
  const headers = [
    "Opportunity ID",
    "Organization",
    "Buyer Name",
    "Buyer Email",
    "Buyer Role",
    "Region",
    "Pipeline Stage",
    "Assigned Owner",
    "Next Action",
    "Next Action Due",
    "Offer Interest",
    "Timeline",
    "Governance Workflow Pack",
    "Governance Workflow Pack Slug",
    "Governance Workflow Pack Status",
    "Governance Routing Reason",
    "Source Category",
    "Source Route",
    "Referrer Host",
    "UTM Source",
    "UTM Medium",
    "UTM Campaign",
    "Matched Campaign Channel",
    "Target Audience",
    "Revenue Stream",
    "Deployment Profile",
    "Attribution Priority",
    "First Response SLA",
    "Workflow Targets",
    "Governance Requirements",
    "Interoperability Context",
    "Product Boundary"
  ];
  const row = [
    opportunity.intakeId,
    opportunity.payload.organization.name,
    opportunity.payload.contact.fullName,
    opportunity.payload.contact.workEmail,
    opportunity.payload.contact.role,
    opportunity.payload.organization.region,
    opportunity.pipelineStage,
    opportunity.assignedOwner,
    opportunity.nextAction,
    opportunity.nextActionDueAt,
    opportunity.payload.scope.offerInterest,
    opportunity.payload.scope.timeline,
    governancePack.name,
    governancePack.slug,
    governancePack.status,
    governancePack.reason,
    attribution?.sourceCategory ?? "legacy-unattributed",
    attribution?.sourceRoute ?? opportunity.payload.source,
    attribution?.referrerHost ?? "",
    attribution?.campaign.source ?? "",
    attribution?.campaign.medium ?? "",
    attribution?.campaign.campaign ?? "",
    attribution?.campaign.matchedChannel ?? "",
    attribution?.market.targetAudience ?? "",
    attribution?.market.revenueStream ?? "",
    attribution?.deployment.profileName ?? "",
    attribution?.cadence.priority ?? "",
    attribution?.cadence.firstResponseSla ?? "",
    opportunity.payload.scope.workflowTargets.join("; "),
    opportunity.payload.scope.governanceRequirements.join("; "),
    opportunity.payload.scope.interoperabilityContext,
    salesOperationsBoundary
  ];

  return `${headers.map(csvCell).join(",")}\r\n${row.map(csvCell).join(",")}\r\n`;
}

export function buildSalesFollowUpDraft(opportunity: SalesOpportunity) {
  const contactName = cleanHeader(opportunity.payload.contact.fullName).split(" ")[0] || "there";
  const organizationName = cleanHeader(opportunity.payload.organization.name);
  const governancePack = getGovernanceWorkflowPackForOpportunity(opportunity);
  const attribution = getSalesAttributionForOpportunity(opportunity);
  const subject = `SCRIMED next step for ${organizationName}`;
  const nextAction = cleanHeader(
    opportunity.nextAction ||
      attribution?.cadence.nextActionTemplate ||
      "confirm the enterprise discovery conversation"
  );

  return `To: ${cleanHeader(opportunity.payload.contact.workEmail)}
Subject: ${subject}
X-SCRIMED-Opportunity-ID: ${cleanHeader(opportunity.intakeId)}
X-SCRIMED-Attribution: ${cleanHeader(attribution?.sourceCategory ?? "legacy-unattributed")}
Content-Type: text/plain; charset="UTF-8"

Hello ${contactName},

Thank you for exploring SCRIMED with ${organizationName}. Our proposed next step is to ${nextAction.toLowerCase()}.

SCRIMED helps healthcare organizations transform fragmented workflows into decision-grade, human-reviewed operational intelligence. This conversation remains within a governed synthetic pilot and enterprise evaluation boundary. Please do not send patient data, PHI, live clinical records, or payer member information.

Recommended governance workflow pack: ${cleanHeader(governancePack.name)}.
${attribution ? `Recommended commercial route: ${cleanHeader(attribution.market.revenueStream)} for ${cleanHeader(attribution.market.targetAudience)}.
Recommended first-response SLA: ${cleanHeader(attribution.cadence.firstResponseSla)}.
Deployment readiness profile: ${cleanHeader(attribution.deployment.profileName)}.` : "Recommended commercial route: confirm during discovery."}

Regards,
${cleanHeader(opportunity.assignedOwner || "SCRIMED Solutions")}
SCRIMED Solutions
Solving For A Better Tomorrow.
`;
}

export function buildAssessmentInvitation(opportunity: SalesOpportunity) {
  if (!opportunity.assessmentStartAt) {
    throw new Error("Assessment start time is required.");
  }

  const start = new Date(opportunity.assessmentStartAt);
  const end = new Date(start.getTime() + opportunity.assessmentDurationMinutes * 60_000);
  const organization = cleanHeader(opportunity.payload.organization.name);
  const governancePack = getGovernanceWorkflowPackForOpportunity(opportunity);
  const attribution = getSalesAttributionForOpportunity(opportunity);
  const meetingUrl = opportunity.assessmentMeetingUrl;
  const description = [
    `Governed SCRIMED enterprise assessment for ${organization}.`,
    `Opportunity: ${opportunity.intakeId}.`,
    `Governance workflow pack: ${governancePack.name}.`,
    attribution ? `Sales attribution: ${attribution.sourceCategory}, ${attribution.market.revenueStream}, ${attribution.deployment.profileName}.` : "Sales attribution: legacy opportunity.",
    "Business-contact and workflow-scope discussion only. Do not share PHI, patient identifiers, live clinical records, diagnosis details, or payer member information.",
    meetingUrl ? `Meeting link: ${meetingUrl}` : "Meeting location to be confirmed."
  ].join("\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SCRIMED Solutions//Enterprise Assessment//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${escapeCalendar(opportunity.intakeId)}@scrimedsolutions.com`,
    `DTSTAMP:${calendarTimestamp(new Date().toISOString())}`,
    `DTSTART:${calendarTimestamp(start.toISOString())}`,
    `DTEND:${calendarTimestamp(end.toISOString())}`,
    `SUMMARY:${escapeCalendar(`SCRIMED Enterprise Assessment - ${organization}`)}`,
    `DESCRIPTION:${escapeCalendar(description)}`,
    `ORGANIZER;CN=SCRIMED Solutions:mailto:scrimedsolutions@gmail.com`,
    `ATTENDEE;CN=${escapeCalendar(opportunity.payload.contact.fullName)};RSVP=TRUE:mailto:${cleanHeader(opportunity.payload.contact.workEmail)}`,
    meetingUrl ? `URL:${escapeCalendar(meetingUrl)}` : "",
    meetingUrl ? `LOCATION:${escapeCalendar(meetingUrl)}` : "LOCATION:To be confirmed",
    "STATUS:TENTATIVE",
    "END:VEVENT",
    "END:VCALENDAR",
    ""
  ].filter(Boolean).join("\r\n");
}

export function buildSalesOpportunityProposal(opportunity: SalesOpportunity) {
  const pilot = getPilotProgramForOpportunity(opportunity);
  const governancePack = getGovernanceWorkflowPackForOpportunity(opportunity);
  const attribution = getSalesAttributionForOpportunity(opportunity);
  const payload = opportunity.payload;
  const pilotSection = pilot
    ? `## Recommended SCRIMED Program
- Program: ${pilot.name}
- Duration: ${pilot.duration}
- Commercial model: ${pilot.engagementModel}
- Status: ${pilot.status}

### Objective
${pilot.objective}

### Deliverables
${markdownList(pilot.deliverables)}

### Decision Metrics
${markdownList(pilot.successMetrics)}

### Governance Gates
${markdownList(pilot.governanceGates)}

### Production Exclusions
${markdownList(pilot.productionExclusions)}`
    : `## Recommended SCRIMED Program
The recommended engagement requires a SCRIMED commercial and governance review before a program is selected.`;

  return `# SCRIMED Opportunity Proposal

## Opportunity
- Opportunity ID: ${cleanMarkdown(opportunity.intakeId)}
- Organization: ${cleanMarkdown(payload.organization.name)}
- Buyer contact: ${cleanMarkdown(payload.contact.fullName)}
- Work email: ${cleanMarkdown(payload.contact.workEmail)}
- Buyer role: ${cleanMarkdown(payload.contact.role)}
- Region: ${cleanMarkdown(payload.organization.region)}
- Pipeline stage: ${opportunity.pipelineStage}
- SCRIMED owner: ${cleanMarkdown(opportunity.assignedOwner || "Unassigned")}
- Next action: ${cleanMarkdown(opportunity.nextAction || "Confirm discovery owner and next meeting")}
- Governance workflow pack: ${cleanMarkdown(governancePack.name)}
- Governance pack slug: ${cleanMarkdown(governancePack.slug)}
- Governance pack status: ${cleanMarkdown(governancePack.status)}

## Buyer Scope
- Offer interest: ${cleanMarkdown(payload.scope.offerInterest)}
- Timeline: ${cleanMarkdown(payload.scope.timeline)}
- Workflow targets: ${payload.scope.workflowTargets.map(cleanMarkdown).join(", ")}
- Readiness needs: ${payload.scope.readinessNeeds.map(cleanMarkdown).join(", ")}
- Governance requirements: ${payload.scope.governanceRequirements.map(cleanMarkdown).join(", ")}
- Interoperability context: ${cleanMarkdown(payload.scope.interoperabilityContext || "To be confirmed")}
- Pilot goals: ${cleanMarkdown(payload.scope.pilotGoals)}

## Governance Workflow Pack
- Recommended pack: ${cleanMarkdown(governancePack.name)}
- Routing reason: ${cleanMarkdown(governancePack.reason)}
- Matched signals: ${governancePack.matchedSignals.map(cleanMarkdown).join(", ") || "provider-operations-default"}
- Customer inputs required: ${governancePack.customerInputsRequired.map(cleanMarkdown).join(", ")}
- Required approvals: ${governancePack.requiredApprovals.map(cleanMarkdown).join(", ")}
- External gates: ${governancePack.externalGates.map(cleanMarkdown).join(", ")}
- Retention template: ${cleanMarkdown(governancePack.retentionPolicyTemplate.defaultDuration)}
- Incident export release gate: ${cleanMarkdown(governancePack.incidentExportReleaseGate)}

## Source Attribution And Sales Cadence
- Source category: ${cleanMarkdown(attribution?.sourceCategory ?? "legacy-unattributed")}
- Source route: ${cleanMarkdown(attribution?.sourceRoute ?? opportunity.payload.source)}
- Campaign channel: ${cleanMarkdown(attribution?.campaign.matchedChannel ?? "Not captured")}
- Target audience: ${cleanMarkdown(attribution?.market.targetAudience ?? "To be confirmed")}
- Revenue stream: ${cleanMarkdown(attribution?.market.revenueStream ?? "To be confirmed")}
- Deployment profile: ${cleanMarkdown(attribution?.deployment.profileName ?? "To be confirmed")}
- First response SLA: ${cleanMarkdown(attribution?.cadence.firstResponseSla ?? "To be confirmed")}
- Recommended owner: ${cleanMarkdown(attribution?.cadence.recommendedOwner ?? "Enterprise sales")}
- Source-informed signals: ${attribution?.sourceSignals.map((signal) => cleanMarkdown(signal.sourceName)).join(", ") ?? "To be confirmed"}

${pilotSection}

## Required Discovery Decisions
- Confirm executive sponsor, workflow owner, and approved review team.
- Confirm baseline metrics, target outcomes, and buyer-approved measurement method.
- Confirm synthetic-only evidence scope and prohibited data.
- Confirm privacy, security, legal, governance, and interoperability decision owners.
- Confirm that production integration and clinical execution remain outside this proposal.

## Product Boundary
${salesOperationsBoundary}

This is a non-binding enterprise scoping proposal. Final scope, pricing, legal terms, success criteria, security requirements, and production permissions require written buyer and SCRIMED approval.
`;
}

export function buildCrmOpportunityPayload(opportunity: SalesOpportunity) {
  const governanceWorkflowPack = getGovernanceWorkflowPackForOpportunity(opportunity);
  const attribution = getSalesAttributionForOpportunity(opportunity);

  return {
    source: "SCRIMED Sales Operations",
    opportunityId: opportunity.intakeId,
    receivedAt: opportunity.receivedAt,
    pipelineStage: opportunity.pipelineStage,
    assignedOwner: opportunity.assignedOwner,
    nextAction: opportunity.nextAction,
    boundary: salesOperationsBoundary,
    contact: opportunity.payload.contact,
    organization: opportunity.payload.organization,
    scope: opportunity.payload.scope,
    governanceWorkflowPack,
    governanceRouting: opportunity.payload.governance?.routing ?? {
      selectedPackSlug: governanceWorkflowPack.slug,
      source: "sales-operations-derived-router",
      noPhiBoundary: true,
      governanceLedgerMetadata: {
        governanceWorkflowPackSlug: governanceWorkflowPack.slug,
        governanceWorkflowPackStatus: governanceWorkflowPack.status,
        governanceWorkflowPackRoute: governanceWorkflowPack.route,
        governanceWorkflowPackBriefRoute: governanceWorkflowPack.briefRoute,
        matchedSignals: governanceWorkflowPack.matchedSignals,
        noPhiBoundary: true,
        syntheticPilotBoundary: true
      }
    },
    attribution,
    assessment: opportunity.payload.assessment
  };
}
