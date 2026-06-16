import type { SalesAuditEvent, SalesOpportunity } from "./salesOperations";

export type ProductionActivationReadinessStatus = "prepared" | "enterprise-review-required";

export type ProductionDomainVerificationPolicy = {
  status: "buyer-domain-review-required";
  allowedDomains: string[];
  requiredEvidence: string[];
  blockedDomains: string[];
  ownerApprovalRequired: string[];
  productionGate: string;
};

export type ProductionSsoRedirectPolicy = {
  status: "origin-registry-ready";
  allowedRedirectOrigins: string[];
  allowedCallbackPaths: string[];
  allowedLogoutRedirectOrigins: string[];
  enforcement: string[];
  productionGate: string;
};

export type ProductionInvitationTemplatePolicy = {
  status: "legal-security-review-required";
  templateFamily: "enterprise-pilot-access";
  requiredApprovals: string[];
  requiredDisclosures: string[];
  prohibitedContent: string[];
  productionGate: string;
};

export type ProductionTransactionalDeliveryPolicy = {
  status: "provider-approval-required";
  providerStrategy: "approved-transactional-provider-required";
  directSendEnabled: false;
  fromDomain: string;
  abuseControls: string[];
  monitoringControls: string[];
  rateLimits: string[];
  productionGate: string;
};

export type ProductionAccessReviewAutomation = {
  status: "attestation-reminder-ready";
  cadenceDays: number;
  nextAttestationDueAt: string;
  requiredAttestors: string[];
  staleAccessAction: "disable-before-expansion";
  automationControls: string[];
  productionGate: string;
};

export type ProductionArchiveExecutionPolicy = {
  status: "manual-archive-ready";
  archiveEligibleAt: string;
  archiveRunbook: string[];
  legalHoldSupported: true;
  deletionGate: string;
  productionGate: string;
};

export type ProductionReadinessCompetitiveSignal = {
  pillar: string;
  buyerValue: string;
  proof: string;
};

export type SalesProductionActivationReadiness = {
  id: string;
  tenantId: string;
  intakeId: string;
  buyerTenantLifecycleId: string;
  workspaceId: string;
  workspaceSlug: string;
  readinessStatus: ProductionActivationReadinessStatus;
  domainVerificationPolicy: ProductionDomainVerificationPolicy;
  ssoRedirectPolicy: ProductionSsoRedirectPolicy;
  invitationTemplatePolicy: ProductionInvitationTemplatePolicy;
  transactionalDeliveryPolicy: ProductionTransactionalDeliveryPolicy;
  accessReviewAutomation: ProductionAccessReviewAutomation;
  archiveExecutionPolicy: ProductionArchiveExecutionPolicy;
  launchBlockers: string[];
  competitiveAdvantageSignals: ProductionReadinessCompetitiveSignal[];
  lastPacketGeneratedAt: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string | null;
  boundary: string;
};

export type SalesProductionActivationReadinessResult = {
  productionActivationReadiness: SalesProductionActivationReadiness;
  created: boolean;
  auditEventId: string | null;
  boundary: string;
};

export const productionActivationReadinessProofStackStatus =
  "aal2-production-sso-invitation-readiness";
export const productionActivationReadinessPacketProofStackStatus =
  "aal2-audited-production-readiness-packets";

export const productionActivationReadinessApiRoute =
  "/api/sales-operations/opportunities/{intakeId}/production-readiness";
export const productionActivationReadinessPacketApiRoute =
  "/api/sales-operations/opportunities/{intakeId}/production-readiness/packet";

export const productionActivationReadinessBoundary =
  "Production SSO and Invitation Delivery Readiness prepares buyer-specific domain, SSO redirect, invitation template, delivery, access-review, and archive controls for governed enterprise evaluations only. It does not enable automated email sending, approve customer SSO, authorize PHI, create a BAA or DPA, certify compliance, execute live clinical workflows, submit payer transactions, contact patients, or make medical, legal, security, regulatory, or reimbursement determinations.";

export function isProductionReadinessEligible(opportunity: SalesOpportunity) {
  return Boolean(opportunity.buyerTenantLifecycle);
}

function appBase(baseUrl: string) {
  return baseUrl.replace(/\/$/, "");
}

export function productionReadinessRouteForOpportunity({
  appBaseUrl,
  intakeId
}: {
  appBaseUrl: string;
  intakeId: string;
}) {
  return `${appBase(appBaseUrl)}/api/sales-operations/opportunities/${encodeURIComponent(
    intakeId
  )}/production-readiness`;
}

export function productionReadinessPacketRouteForOpportunity({
  appBaseUrl,
  intakeId
}: {
  appBaseUrl: string;
  intakeId: string;
}) {
  return `${productionReadinessRouteForOpportunity({ appBaseUrl, intakeId })}/packet`;
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

function signalLines(signals: ProductionReadinessCompetitiveSignal[]) {
  return signals
    .map((signal) => `- ${signal.pillar}: ${signal.buyerValue} Proof: ${signal.proof}`)
    .join("\n");
}

export function buildProductionActivationReadinessPacket({
  generatedAt,
  auditEventId,
  generatedBy,
  opportunity,
  readiness,
  appBaseUrl,
  auditEvents
}: {
  generatedAt: string;
  auditEventId: string;
  generatedBy: string;
  opportunity: SalesOpportunity;
  readiness: SalesProductionActivationReadiness;
  appBaseUrl: string;
  auditEvents: SalesAuditEvent[];
}) {
  const readinessRoute = productionReadinessRouteForOpportunity({
    appBaseUrl,
    intakeId: opportunity.intakeId
  });
  const readinessPacketRoute = productionReadinessPacketRouteForOpportunity({
    appBaseUrl,
    intakeId: opportunity.intakeId
  });

  return `# SCRIMED Production SSO And Invitation Delivery Readiness Packet

## Packet Control
- Generated: ${generatedAt}
- Packet audit event ID: ${auditEventId}
- Generated by: ${generatedBy}
- Opportunity ID: ${opportunity.intakeId}
- Proof status: ${productionActivationReadinessPacketProofStackStatus}
- Data boundary: business-contact and workflow-scope only

## Buyer Readiness Record
- Organization: ${opportunity.payload.organization.name}
- Buyer contact: ${opportunity.payload.contact.fullName}
- Buyer email: ${opportunity.payload.contact.workEmail}
- Workspace slug: ${readiness.workspaceSlug}
- Readiness status: ${readiness.readinessStatus}
- Readiness API: ${readinessRoute}
- Readiness packet API: ${readinessPacketRoute}

## Domain Verification
- Status: ${readiness.domainVerificationPolicy.status}
- Allowed domains: ${readiness.domainVerificationPolicy.allowedDomains.join(", ")}
- Required evidence: ${readiness.domainVerificationPolicy.requiredEvidence.join(", ")}
- Blocked domains: ${readiness.domainVerificationPolicy.blockedDomains.join(", ") || "None"}
- Owner approval required: ${readiness.domainVerificationPolicy.ownerApprovalRequired.join(", ")}
- Production gate: ${readiness.domainVerificationPolicy.productionGate}

## SSO Redirect And Origin Registry
- Status: ${readiness.ssoRedirectPolicy.status}
- Allowed redirect origins: ${readiness.ssoRedirectPolicy.allowedRedirectOrigins.join(", ")}
- Callback paths: ${readiness.ssoRedirectPolicy.allowedCallbackPaths.join(", ")}
- Logout redirect origins: ${readiness.ssoRedirectPolicy.allowedLogoutRedirectOrigins.join(", ")}
- Enforcement: ${readiness.ssoRedirectPolicy.enforcement.join(", ")}
- Production gate: ${readiness.ssoRedirectPolicy.productionGate}

## Invitation Template And Messaging Controls
- Status: ${readiness.invitationTemplatePolicy.status}
- Template family: ${readiness.invitationTemplatePolicy.templateFamily}
- Required approvals: ${readiness.invitationTemplatePolicy.requiredApprovals.join(", ")}
- Required disclosures: ${readiness.invitationTemplatePolicy.requiredDisclosures.join(", ")}
- Prohibited content: ${readiness.invitationTemplatePolicy.prohibitedContent.join(", ")}
- Production gate: ${readiness.invitationTemplatePolicy.productionGate}

## Transactional Delivery Controls
- Status: ${readiness.transactionalDeliveryPolicy.status}
- Provider strategy: ${readiness.transactionalDeliveryPolicy.providerStrategy}
- Direct send enabled: ${readiness.transactionalDeliveryPolicy.directSendEnabled ? "yes" : "no"}
- From domain: ${readiness.transactionalDeliveryPolicy.fromDomain}
- Abuse controls: ${readiness.transactionalDeliveryPolicy.abuseControls.join(", ")}
- Monitoring controls: ${readiness.transactionalDeliveryPolicy.monitoringControls.join(", ")}
- Rate limits: ${readiness.transactionalDeliveryPolicy.rateLimits.join(", ")}
- Production gate: ${readiness.transactionalDeliveryPolicy.productionGate}

## Access Review Automation
- Status: ${readiness.accessReviewAutomation.status}
- Cadence: every ${readiness.accessReviewAutomation.cadenceDays} days
- Next attestation due: ${readiness.accessReviewAutomation.nextAttestationDueAt}
- Required attestors: ${readiness.accessReviewAutomation.requiredAttestors.join(", ")}
- Stale access action: ${readiness.accessReviewAutomation.staleAccessAction}
- Automation controls: ${readiness.accessReviewAutomation.automationControls.join(", ")}
- Production gate: ${readiness.accessReviewAutomation.productionGate}

## Archive Execution
- Status: ${readiness.archiveExecutionPolicy.status}
- Archive eligible at: ${readiness.archiveExecutionPolicy.archiveEligibleAt}
- Legal hold supported: ${readiness.archiveExecutionPolicy.legalHoldSupported ? "yes" : "no"}
- Archive runbook:
${markdownList(readiness.archiveExecutionPolicy.archiveRunbook)}
- Deletion gate: ${readiness.archiveExecutionPolicy.deletionGate}
- Production gate: ${readiness.archiveExecutionPolicy.productionGate}

## Launch Blockers That Must Remain Visible
${markdownList(readiness.launchBlockers)}

## Competitive Advantage Signals
${signalLines(readiness.competitiveAdvantageSignals)}

## Buyer Scope
- Offer interest: ${opportunity.payload.scope.offerInterest}
- Timeline: ${opportunity.payload.scope.timeline}
- Workflow targets: ${opportunity.payload.scope.workflowTargets.join(", ")}
- Readiness needs: ${opportunity.payload.scope.readinessNeeds.join(", ")}
- Governance requirements: ${opportunity.payload.scope.governanceRequirements.join(", ")}
- Interoperability context: ${opportunity.payload.scope.interoperabilityContext || "To be confirmed"}
- Pilot goals: ${opportunity.payload.scope.pilotGoals}

## Required Controls Before Automated Invitations Or Production SSO
- Verify buyer domain ownership and authorized security contact.
- Approve transactional provider, sending domain, template copy, rate limits, bounce/complaint monitoring, and abuse response process.
- Register only approved redirect origins and callback paths.
- Confirm customer IdP, SAML/OIDC configuration, session policy, and emergency access procedure.
- Keep direct-send invitations disabled until legal, security, privacy, and tenant-admin approvals are recorded.
- Keep PHI, production connectors, patient outreach, payer submission, autonomous diagnosis, and live workflow execution blocked until separately approved in writing.

## Recent Sales Audit Events
${auditLines(auditEvents)}

## Boundary
${readiness.boundary}

${productionActivationReadinessBoundary}

This packet is a non-binding production-readiness artifact. Final customer SSO configuration, transactional email setup, legal terms, security controls, privacy agreements, retention enforcement, production connector authorization, and live workflow permissions require written buyer and SCRIMED approval.
`;
}
