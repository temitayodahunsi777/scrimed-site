import type { SalesAuditEvent, SalesOpportunity } from "./salesOperations";

export type SecureEvidenceVaultReadinessStatus =
  | "planned"
  | "controls-review-required"
  | "ready-for-procurement";

export type SecureEvidenceVaultControlStatus =
  | "not-started"
  | "designed"
  | "buyer-review-required"
  | "scrimed-review-required"
  | "blocked";

export type SecureEvidenceVaultControl = {
  status: SecureEvidenceVaultControlStatus;
  owner: string;
  requiredControls: string[];
  acceptedMetadata: string[];
  blockedUntil: string[];
  productionGate: string;
};

export type SecureEvidenceVaultCommercialSignal = {
  audience: string;
  buyerValue: string;
  revenuePath: string;
  proof: string;
};

export type SalesSecureEvidenceVaultReadiness = {
  id: string;
  tenantId: string;
  intakeId: string;
  buyerDiligenceRoomId: string;
  customerActivationApprovalId: string;
  productionActivationReadinessId: string;
  buyerTenantLifecycleId: string;
  workspaceId: string;
  workspaceSlug: string;
  readinessStatus: SecureEvidenceVaultReadinessStatus;
  vaultMode: "disabled-metadata-only";
  evidenceBoundary: string;
  storageProviderDecision: SecureEvidenceVaultControl;
  encryptionKeyManagement: SecureEvidenceVaultControl;
  dlpMalwareScanning: SecureEvidenceVaultControl;
  retentionLegalHold: SecureEvidenceVaultControl;
  accessReviewPolicy: SecureEvidenceVaultControl;
  evidenceClassificationPolicy: SecureEvidenceVaultControl;
  uploadApprovalWorkflow: SecureEvidenceVaultControl;
  incidentResponseRunbook: SecureEvidenceVaultControl;
  regionalDataResidency: SecureEvidenceVaultControl;
  targetAudienceSignals: SecureEvidenceVaultCommercialSignal[];
  retainedBlockers: string[];
  nextRequiredApprovals: string[];
  lastPacketGeneratedAt: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string | null;
  boundary: string;
};

export type SalesSecureEvidenceVaultReadinessResult = {
  secureEvidenceVaultReadiness: SalesSecureEvidenceVaultReadiness;
  created: boolean;
  auditEventId: string | null;
  boundary: string;
};

export const secureEvidenceVaultReadinessProofStackStatus =
  "aal2-secure-evidence-vault-readiness-disabled-by-default";
export const secureEvidenceVaultReadinessPacketProofStackStatus =
  "aal2-audited-secure-evidence-vault-readiness-packets";

export const secureEvidenceVaultReadinessApiRoute =
  "/api/sales-operations/opportunities/{intakeId}/evidence-vault-readiness";
export const secureEvidenceVaultReadinessPacketApiRoute =
  "/api/sales-operations/opportunities/{intakeId}/evidence-vault-readiness/packet";

export const secureEvidenceVaultReadinessBoundary =
  "Secure Evidence Vault Readiness organizes storage, encryption, DLP, malware scanning, retention, legal hold, access review, classification, upload approval, incident response, regional residency, target-audience, and revenue-path controls before SCRIMED accepts sensitive buyer evidence. Vault readiness is disabled-by-default and metadata-only; it does not store PHI, patient identifiers, live clinical records, payer member data, IdP certificates, private keys, production credentials, legal advice, compliance certification, breach determination, customer SSO cutover approval, production connector authorization, patient outreach approval, payer submission, autonomous care approval, or live healthcare execution authorization.";

export function isSecureEvidenceVaultReadinessEligible(opportunity: SalesOpportunity) {
  return Boolean(opportunity.buyerDiligenceRoom);
}

function appBase(baseUrl: string) {
  return baseUrl.replace(/\/$/, "");
}

export function secureEvidenceVaultReadinessRouteForOpportunity({
  appBaseUrl,
  intakeId
}: {
  appBaseUrl: string;
  intakeId: string;
}) {
  return `${appBase(appBaseUrl)}/api/sales-operations/opportunities/${encodeURIComponent(
    intakeId
  )}/evidence-vault-readiness`;
}

export function secureEvidenceVaultReadinessPacketRouteForOpportunity({
  appBaseUrl,
  intakeId
}: {
  appBaseUrl: string;
  intakeId: string;
}) {
  return `${secureEvidenceVaultReadinessRouteForOpportunity({ appBaseUrl, intakeId })}/packet`;
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

function controlLines(control: SecureEvidenceVaultControl) {
  return [
    `- Status: ${control.status}`,
    `- Owner: ${control.owner}`,
    `- Required controls: ${control.requiredControls.join(", ")}`,
    `- Accepted metadata: ${control.acceptedMetadata.join(", ")}`,
    `- Blocked until: ${control.blockedUntil.join(", ")}`,
    `- Production gate: ${control.productionGate}`
  ].join("\n");
}

function audienceLines(signals: SecureEvidenceVaultCommercialSignal[]) {
  return signals
    .map(
      (signal) =>
        `- ${signal.audience}: ${signal.buyerValue} Revenue path: ${signal.revenuePath}. Proof: ${signal.proof}`
    )
    .join("\n");
}

export function buildSecureEvidenceVaultReadinessPacket({
  generatedAt,
  auditEventId,
  generatedBy,
  opportunity,
  vaultReadiness,
  appBaseUrl,
  auditEvents
}: {
  generatedAt: string;
  auditEventId: string;
  generatedBy: string;
  opportunity: SalesOpportunity;
  vaultReadiness: SalesSecureEvidenceVaultReadiness;
  appBaseUrl: string;
  auditEvents: SalesAuditEvent[];
}) {
  const readinessRoute = secureEvidenceVaultReadinessRouteForOpportunity({
    appBaseUrl,
    intakeId: opportunity.intakeId
  });
  const packetRoute = secureEvidenceVaultReadinessPacketRouteForOpportunity({
    appBaseUrl,
    intakeId: opportunity.intakeId
  });

  return `# SCRIMED Secure Evidence Vault Readiness Packet

## Packet Control
- Generated: ${generatedAt}
- Packet audit event ID: ${auditEventId}
- Generated by: ${generatedBy}
- Opportunity ID: ${opportunity.intakeId}
- Proof status: ${secureEvidenceVaultReadinessPacketProofStackStatus}
- Vault mode: ${vaultReadiness.vaultMode}
- Data boundary: business-contact, workflow-scope, and vault-readiness metadata only

## Readiness Record
- Organization: ${opportunity.payload.organization.name}
- Buyer contact: ${opportunity.payload.contact.fullName}
- Buyer email: ${opportunity.payload.contact.workEmail}
- Workspace slug: ${vaultReadiness.workspaceSlug}
- Readiness status: ${vaultReadiness.readinessStatus}
- Evidence boundary: ${vaultReadiness.evidenceBoundary}
- Readiness API: ${readinessRoute}
- Readiness packet API: ${packetRoute}

## Storage Provider Decision
${controlLines(vaultReadiness.storageProviderDecision)}

## Encryption And Key Management
${controlLines(vaultReadiness.encryptionKeyManagement)}

## DLP And Malware Scanning
${controlLines(vaultReadiness.dlpMalwareScanning)}

## Retention And Legal Hold
${controlLines(vaultReadiness.retentionLegalHold)}

## Access Review Policy
${controlLines(vaultReadiness.accessReviewPolicy)}

## Evidence Classification Policy
${controlLines(vaultReadiness.evidenceClassificationPolicy)}

## Upload Approval Workflow
${controlLines(vaultReadiness.uploadApprovalWorkflow)}

## Incident Response Runbook
${controlLines(vaultReadiness.incidentResponseRunbook)}

## Regional Data Residency
${controlLines(vaultReadiness.regionalDataResidency)}

## Target Audience And Revenue Signals
${audienceLines(vaultReadiness.targetAudienceSignals)}

## Next Required Approvals
${markdownList(vaultReadiness.nextRequiredApprovals)}

## Retained Blockers
${markdownList(vaultReadiness.retainedBlockers)}

## Buyer Scope
- Offer interest: ${opportunity.payload.scope.offerInterest}
- Timeline: ${opportunity.payload.scope.timeline}
- Workflow targets: ${opportunity.payload.scope.workflowTargets.join(", ")}
- Readiness needs: ${opportunity.payload.scope.readinessNeeds.join(", ")}
- Governance requirements: ${opportunity.payload.scope.governanceRequirements.join(", ")}
- Interoperability context: ${opportunity.payload.scope.interoperabilityContext || "To be confirmed"}
- Pilot goals: ${opportunity.payload.scope.pilotGoals}

## Authoritative Alignment
- HHS HIPAA Security Rule summary: https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html
- HHS HIPAA Privacy Rule summary: https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html
- NIST AI Risk Management Framework: https://www.nist.gov/itl/ai-risk-management-framework

## Workaround For Current Limitations
- Use this packet as the vault-readiness tracker while sensitive document storage remains disabled.
- Exchange sensitive buyer artifacts through buyer-approved secure channels outside SCRIMED until vault controls, DLP, malware scanning, retention, legal hold, access review, BAA/DPA path, and counsel-approved processing terms are complete.
- Record only control status, owners, dates, approval routing, external secure-channel labels, and production gates inside SCRIMED at this stage.

## Recent Sales Audit Events
${auditLines(auditEvents)}

## Boundary
${vaultReadiness.boundary}

${secureEvidenceVaultReadinessBoundary}

This packet is a non-binding readiness artifact. It supports enterprise diligence and paid implementation planning; it does not authorize sensitive-file storage, PHI processing, production connectors, patient outreach, payer submission, legal conclusions, compliance certification, or live healthcare operations.
`;
}
