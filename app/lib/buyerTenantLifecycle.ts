import type { SalesAuditEvent, SalesOpportunity } from "./salesOperations";

export type BuyerTenantLifecycleStatus = "activated" | "archived";
export type BuyerTenantMode = "buyer-dedicated-logical-tenant";
export type BuyerDeploymentMode = "protected-synthetic-evaluation";

export type BuyerTenantSsoPolicy = {
  status: "domain-policy-ready";
  allowedDomains: string[];
  providerStrategy: "buyer-idp-or-passkey";
  enforcement: string[];
  productionGate: string;
};

export type BuyerTenantInvitationDeliveryPolicy = {
  mode: "manual-packet-gated";
  directEmailSend: false;
  approvalRequired: string[];
  deliveryChannels: string[];
  productionGate: string;
};

export type BuyerTenantAccessReviewPolicy = {
  cadenceDays: number;
  nextReviewDueAt: string;
  requiredReviewers: string[];
  staleAccessAction: "disable-before-expansion";
};

export type BuyerTenantRetentionArchivePolicy = {
  retentionUntil: string;
  archiveEligibleAt: string;
  legalHoldSupported: true;
  archiveControls: string[];
  deletionGate: string;
};

export type BuyerTenantCompetitiveAdvantageSignal = {
  pillar: string;
  buyerValue: string;
  proof: string;
};

export type SalesBuyerTenantLifecycle = {
  id: string;
  tenantId: string;
  intakeId: string;
  workspaceProvisioningId: string;
  workspaceId: string;
  workspaceSlug: string;
  tenantMode: BuyerTenantMode;
  deploymentMode: BuyerDeploymentMode;
  lifecycleStatus: BuyerTenantLifecycleStatus;
  ssoPolicy: BuyerTenantSsoPolicy;
  invitationDeliveryPolicy: BuyerTenantInvitationDeliveryPolicy;
  accessReviewPolicy: BuyerTenantAccessReviewPolicy;
  retentionArchivePolicy: BuyerTenantRetentionArchivePolicy;
  activationChecklist: string[];
  competitiveAdvantageSignals: BuyerTenantCompetitiveAdvantageSignal[];
  lastPacketGeneratedAt: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string | null;
  boundary: string;
};

export type SalesBuyerTenantLifecycleResult = {
  buyerTenantLifecycle: SalesBuyerTenantLifecycle;
  created: boolean;
  auditEventId: string | null;
  boundary: string;
};

export const buyerTenantLifecycleProofStackStatus =
  "aal2-buyer-tenant-lifecycle-automation";
export const buyerTenantLifecyclePacketProofStackStatus =
  "aal2-audited-buyer-tenant-lifecycle-packets";

export const buyerTenantLifecycleApiRoute =
  "/api/sales-operations/opportunities/{intakeId}/tenant-lifecycle";
export const buyerTenantLifecyclePacketApiRoute =
  "/api/sales-operations/opportunities/{intakeId}/tenant-lifecycle/packet";

export const buyerTenantLifecycleBoundary =
  "Buyer Tenant Lifecycle Automation creates opportunity-specific tenant lifecycle controls for governed synthetic enterprise evaluations only. It does not create PHI authorization, live clinical execution, autonomous diagnosis, payer submission, patient outreach, legal advice, regulatory certification, reimbursement guarantees, or production connector approval.";

export function isTenantLifecycleEligible(opportunity: SalesOpportunity) {
  return Boolean(opportunity.workspaceProvisioning);
}

function appBase(baseUrl: string) {
  return baseUrl.replace(/\/$/, "");
}

export function tenantLifecycleRouteForOpportunity({
  appBaseUrl,
  intakeId
}: {
  appBaseUrl: string;
  intakeId: string;
}) {
  return `${appBase(appBaseUrl)}/api/sales-operations/opportunities/${encodeURIComponent(
    intakeId
  )}/tenant-lifecycle`;
}

export function tenantLifecyclePacketRouteForOpportunity({
  appBaseUrl,
  intakeId
}: {
  appBaseUrl: string;
  intakeId: string;
}) {
  return `${tenantLifecycleRouteForOpportunity({ appBaseUrl, intakeId })}/packet`;
}

function markdownList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function auditLines(events: SalesAuditEvent[]) {
  if (events.length === 0) return "- No recent sales audit events are visible for this opportunity.";

  return events
    .slice(0, 20)
    .map((event) => `- ${event.createdAt}: ${event.eventType} by ${event.actorUserId}`)
    .join("\n");
}

function signalLines(signals: BuyerTenantCompetitiveAdvantageSignal[]) {
  return signals
    .map((signal) => `- ${signal.pillar}: ${signal.buyerValue} Proof: ${signal.proof}`)
    .join("\n");
}

export function buildBuyerTenantLifecyclePacket({
  generatedAt,
  auditEventId,
  generatedBy,
  opportunity,
  lifecycle,
  appBaseUrl,
  auditEvents
}: {
  generatedAt: string;
  auditEventId: string;
  generatedBy: string;
  opportunity: SalesOpportunity;
  lifecycle: SalesBuyerTenantLifecycle;
  appBaseUrl: string;
  auditEvents: SalesAuditEvent[];
}) {
  const lifecycleRoute = tenantLifecycleRouteForOpportunity({
    appBaseUrl,
    intakeId: opportunity.intakeId
  });
  const lifecyclePacketRoute = tenantLifecyclePacketRouteForOpportunity({
    appBaseUrl,
    intakeId: opportunity.intakeId
  });

  return `# SCRIMED Buyer Tenant Lifecycle Packet

## Packet Control
- Generated: ${generatedAt}
- Packet audit event ID: ${auditEventId}
- Generated by: ${generatedBy}
- Opportunity ID: ${opportunity.intakeId}
- Proof status: ${buyerTenantLifecyclePacketProofStackStatus}
- Data boundary: business-contact and workflow-scope only

## Buyer Tenant Lifecycle
- Organization: ${opportunity.payload.organization.name}
- Buyer contact: ${opportunity.payload.contact.fullName}
- Buyer email: ${opportunity.payload.contact.workEmail}
- Workspace slug: ${lifecycle.workspaceSlug}
- Tenant mode: ${lifecycle.tenantMode}
- Deployment mode: ${lifecycle.deploymentMode}
- Lifecycle status: ${lifecycle.lifecycleStatus}
- Lifecycle API: ${lifecycleRoute}
- Lifecycle packet API: ${lifecyclePacketRoute}

## SSO And Domain Policy
- Status: ${lifecycle.ssoPolicy.status}
- Provider strategy: ${lifecycle.ssoPolicy.providerStrategy}
- Allowed domains: ${lifecycle.ssoPolicy.allowedDomains.join(", ")}
- Enforcement: ${lifecycle.ssoPolicy.enforcement.join(", ")}
- Production gate: ${lifecycle.ssoPolicy.productionGate}

## Invitation Delivery Policy
- Mode: ${lifecycle.invitationDeliveryPolicy.mode}
- Direct email send enabled: ${lifecycle.invitationDeliveryPolicy.directEmailSend ? "yes" : "no"}
- Approval required: ${lifecycle.invitationDeliveryPolicy.approvalRequired.join(", ")}
- Delivery channels: ${lifecycle.invitationDeliveryPolicy.deliveryChannels.join(", ")}
- Production gate: ${lifecycle.invitationDeliveryPolicy.productionGate}

## Access Review
- Cadence: every ${lifecycle.accessReviewPolicy.cadenceDays} days
- Next review due: ${lifecycle.accessReviewPolicy.nextReviewDueAt}
- Required reviewers: ${lifecycle.accessReviewPolicy.requiredReviewers.join(", ")}
- Stale access action: ${lifecycle.accessReviewPolicy.staleAccessAction}

## Retention And Archive
- Retention until: ${lifecycle.retentionArchivePolicy.retentionUntil}
- Archive eligible at: ${lifecycle.retentionArchivePolicy.archiveEligibleAt}
- Legal hold supported: ${lifecycle.retentionArchivePolicy.legalHoldSupported ? "yes" : "no"}
- Archive controls: ${lifecycle.retentionArchivePolicy.archiveControls.join(", ")}
- Deletion gate: ${lifecycle.retentionArchivePolicy.deletionGate}

## Activation Checklist
${markdownList(lifecycle.activationChecklist)}

## Competitive Advantage Signals
${signalLines(lifecycle.competitiveAdvantageSignals)}

## Buyer Scope
- Offer interest: ${opportunity.payload.scope.offerInterest}
- Timeline: ${opportunity.payload.scope.timeline}
- Workflow targets: ${opportunity.payload.scope.workflowTargets.join(", ")}
- Readiness needs: ${opportunity.payload.scope.readinessNeeds.join(", ")}
- Governance requirements: ${opportunity.payload.scope.governanceRequirements.join(", ")}
- Interoperability context: ${opportunity.payload.scope.interoperabilityContext || "To be confirmed"}
- Pilot goals: ${opportunity.payload.scope.pilotGoals}

## Required Controls Before Paid Expansion
- Confirm buyer legal, privacy, security, SSO, and executive sponsor owners.
- Keep all evaluation material synthetic or business-scope only.
- Use tenant-admin approval for invitations, access reviews, packet release, archive actions, and role changes.
- Keep email delivery manual unless an approved transactional email provider, domain, and abuse controls are configured.
- Block PHI, production connectors, patient outreach, autonomous diagnosis, payer submission, and live workflow execution until separately approved in writing.

## Recent Sales Audit Events
${auditLines(auditEvents)}

## Boundary
${lifecycle.boundary}

${buyerTenantLifecycleBoundary}

This packet is a non-binding lifecycle-readiness artifact. Final customer tenant architecture, pricing, legal terms, SSO configuration, invitation delivery, retention enforcement, security requirements, and production permissions require written buyer and SCRIMED approval.
`;
}
