import type { SalesAuditEvent, SalesOpportunity } from "./salesOperations";

export type CustomerActivationApprovalStatus =
  | "approved-for-paid-pilot-setup"
  | "enterprise-review-required";

export type CustomerActivationApprovalDomain = {
  status: "approved" | "review-required" | "blocked";
  approvedFor: string[];
  approvalEvidence: string[];
  retainedBlockers: string[];
  owner: string;
  productionGate: string;
};

export type CustomerActivationApprovalFinalGate = {
  status: "approved-for-paid-pilot-setup";
  approvalScope: "paid-pilot-setup-only";
  allowedActions: string[];
  explicitlyBlockedActions: string[];
  approvalSource: "scrimed-founder-written-approval";
  buyerApprovalRequiredBeforeExpansion: true;
  productionGate: string;
};

export type CustomerActivationCompetitiveSignal = {
  pillar: string;
  buyerValue: string;
  proof: string;
};

export type SalesCustomerActivationApprovals = {
  id: string;
  tenantId: string;
  intakeId: string;
  productionActivationReadinessId: string;
  buyerTenantLifecycleId: string;
  workspaceId: string;
  workspaceSlug: string;
  approvalStatus: CustomerActivationApprovalStatus;
  approvalScope: "paid-pilot-setup-only";
  domainEvidenceApproval: CustomerActivationApprovalDomain;
  idpMetadataApproval: CustomerActivationApprovalDomain;
  invitationTemplateApproval: CustomerActivationApprovalDomain;
  transactionalProviderApproval: CustomerActivationApprovalDomain;
  legalPrivacySecurityApproval: CustomerActivationApprovalDomain;
  finalSetupGate: CustomerActivationApprovalFinalGate;
  retainedBlockers: string[];
  competitiveAdvantageSignals: CustomerActivationCompetitiveSignal[];
  lastPacketGeneratedAt: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string | null;
  boundary: string;
};

export type SalesCustomerActivationApprovalsResult = {
  customerActivationApprovals: SalesCustomerActivationApprovals;
  created: boolean;
  auditEventId: string | null;
  boundary: string;
};

export const customerActivationApprovalsProofStackStatus =
  "aal2-paid-pilot-activation-approvals";
export const customerActivationApprovalsPacketProofStackStatus =
  "aal2-audited-activation-approval-packets";

export const customerActivationApprovalsApiRoute =
  "/api/sales-operations/opportunities/{intakeId}/activation-approvals";
export const customerActivationApprovalsPacketApiRoute =
  "/api/sales-operations/opportunities/{intakeId}/activation-approvals/packet";

export const customerActivationApprovalsBoundary =
  "Customer Activation Approvals record SCRIMED written approval for paid pilot setup only after buyer tenant lifecycle and production readiness controls exist. They do not authorize PHI, live clinical records, autonomous diagnosis, treatment decisions, payer submission, patient outreach, production connectors, customer SSO cutover, automated bulk invitations, legal advice, compliance certification, or reimbursement determinations.";

export function isCustomerActivationApprovalEligible(opportunity: SalesOpportunity) {
  return Boolean(opportunity.productionActivationReadiness);
}

function appBase(baseUrl: string) {
  return baseUrl.replace(/\/$/, "");
}

export function customerActivationApprovalsRouteForOpportunity({
  appBaseUrl,
  intakeId
}: {
  appBaseUrl: string;
  intakeId: string;
}) {
  return `${appBase(appBaseUrl)}/api/sales-operations/opportunities/${encodeURIComponent(
    intakeId
  )}/activation-approvals`;
}

export function customerActivationApprovalsPacketRouteForOpportunity({
  appBaseUrl,
  intakeId
}: {
  appBaseUrl: string;
  intakeId: string;
}) {
  return `${customerActivationApprovalsRouteForOpportunity({ appBaseUrl, intakeId })}/packet`;
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

function approvalDomainLines(approval: CustomerActivationApprovalDomain) {
  return [
    `- Status: ${approval.status}`,
    `- Owner: ${approval.owner}`,
    `- Approved for: ${approval.approvedFor.join(", ")}`,
    `- Evidence: ${approval.approvalEvidence.join(", ")}`,
    `- Retained blockers: ${approval.retainedBlockers.join(", ")}`,
    `- Production gate: ${approval.productionGate}`
  ].join("\n");
}

function signalLines(signals: CustomerActivationCompetitiveSignal[]) {
  return signals
    .map((signal) => `- ${signal.pillar}: ${signal.buyerValue} Proof: ${signal.proof}`)
    .join("\n");
}

export function buildCustomerActivationApprovalsPacket({
  generatedAt,
  auditEventId,
  generatedBy,
  opportunity,
  approvals,
  appBaseUrl,
  auditEvents
}: {
  generatedAt: string;
  auditEventId: string;
  generatedBy: string;
  opportunity: SalesOpportunity;
  approvals: SalesCustomerActivationApprovals;
  appBaseUrl: string;
  auditEvents: SalesAuditEvent[];
}) {
  const approvalsRoute = customerActivationApprovalsRouteForOpportunity({
    appBaseUrl,
    intakeId: opportunity.intakeId
  });
  const approvalsPacketRoute = customerActivationApprovalsPacketRouteForOpportunity({
    appBaseUrl,
    intakeId: opportunity.intakeId
  });

  return `# SCRIMED Customer Activation Approval Packet

## Packet Control
- Generated: ${generatedAt}
- Packet audit event ID: ${auditEventId}
- Generated by: ${generatedBy}
- Opportunity ID: ${opportunity.intakeId}
- Proof status: ${customerActivationApprovalsPacketProofStackStatus}
- Data boundary: business-contact and workflow-scope only

## Approval Record
- Organization: ${opportunity.payload.organization.name}
- Buyer contact: ${opportunity.payload.contact.fullName}
- Buyer email: ${opportunity.payload.contact.workEmail}
- Workspace slug: ${approvals.workspaceSlug}
- Approval status: ${approvals.approvalStatus}
- Approval scope: ${approvals.approvalScope}
- Approval API: ${approvalsRoute}
- Approval packet API: ${approvalsPacketRoute}

## Domain Evidence Approval
${approvalDomainLines(approvals.domainEvidenceApproval)}

## IdP Metadata Approval
${approvalDomainLines(approvals.idpMetadataApproval)}

## Invitation Template Approval
${approvalDomainLines(approvals.invitationTemplateApproval)}

## Transactional Provider Approval
${approvalDomainLines(approvals.transactionalProviderApproval)}

## Legal, Privacy, And Security Approval
${approvalDomainLines(approvals.legalPrivacySecurityApproval)}

## Final Paid Pilot Setup Gate
- Status: ${approvals.finalSetupGate.status}
- Scope: ${approvals.finalSetupGate.approvalScope}
- Approval source: ${approvals.finalSetupGate.approvalSource}
- Buyer approval required before expansion: ${approvals.finalSetupGate.buyerApprovalRequiredBeforeExpansion ? "yes" : "no"}
- Allowed actions:
${markdownList(approvals.finalSetupGate.allowedActions)}
- Explicitly blocked actions:
${markdownList(approvals.finalSetupGate.explicitlyBlockedActions)}
- Production gate: ${approvals.finalSetupGate.productionGate}

## Retained Blockers
${markdownList(approvals.retainedBlockers)}

## Competitive Advantage Signals
${signalLines(approvals.competitiveAdvantageSignals)}

## Buyer Scope
- Offer interest: ${opportunity.payload.scope.offerInterest}
- Timeline: ${opportunity.payload.scope.timeline}
- Workflow targets: ${opportunity.payload.scope.workflowTargets.join(", ")}
- Readiness needs: ${opportunity.payload.scope.readinessNeeds.join(", ")}
- Governance requirements: ${opportunity.payload.scope.governanceRequirements.join(", ")}
- Interoperability context: ${opportunity.payload.scope.interoperabilityContext || "To be confirmed"}
- Pilot goals: ${opportunity.payload.scope.pilotGoals}

## Required Controls Before Expansion
- Keep paid pilot setup limited to synthetic evaluation and business-scope operating artifacts.
- Confirm buyer sponsor, buyer security owner, legal/privacy contact, and SCRIMED tenant-admin before expanding users.
- Keep automated bulk invitations disabled until transactional provider, sender domain, abuse monitoring, and customer notification controls are separately approved.
- Keep customer SSO cutover blocked until buyer IdP metadata, callback URLs, emergency access, and session policy are approved.
- Keep PHI, production connectors, payer submission, patient outreach, autonomous diagnosis, and live workflow execution blocked until separate written buyer and SCRIMED approvals are recorded.

## Recent Sales Audit Events
${auditLines(auditEvents)}

## Boundary
${approvals.boundary}

${customerActivationApprovalsBoundary}

This packet is a non-binding paid-pilot setup approval artifact. It records SCRIMED authorization to continue activation work inside the governed synthetic evaluation boundary; it does not authorize live healthcare operations.
`;
}
