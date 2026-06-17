import type { SalesAuditEvent, SalesOpportunity } from "./salesOperations";

export type BuyerDiligenceRoomStatus =
  | "prepared"
  | "signed-controls-review-required"
  | "ready-for-contract-review";

export type BuyerDiligenceEvidenceDomain = {
  status: "metadata-ready" | "buyer-evidence-required" | "scrimed-review-required" | "blocked";
  requiredEvidence: string[];
  acceptedEvidenceMetadata: string[];
  prohibitedUploads: string[];
  owner: string;
  productionGate: string;
};

export type BuyerDiligenceControlDecision = {
  status: "not-started" | "in-review" | "approved-for-planning" | "blocked";
  requiredApprovals: string[];
  signedControlArtifacts: string[];
  retainedBlockers: string[];
  productionGate: string;
};

export type BuyerDiligenceCompetitiveSignal = {
  pillar: string;
  buyerValue: string;
  proof: string;
};

export type SalesBuyerDiligenceRoom = {
  id: string;
  tenantId: string;
  intakeId: string;
  customerActivationApprovalId: string;
  productionActivationReadinessId: string;
  buyerTenantLifecycleId: string;
  workspaceId: string;
  workspaceSlug: string;
  diligenceStatus: BuyerDiligenceRoomStatus;
  evidenceScope: "metadata-only";
  evidenceSubmissionPolicy: BuyerDiligenceEvidenceDomain;
  domainProofEvidence: BuyerDiligenceEvidenceDomain;
  idpMetadataEvidence: BuyerDiligenceEvidenceDomain;
  legalPrivacySecurityControls: BuyerDiligenceControlDecision;
  baaDpaStatus: BuyerDiligenceControlDecision;
  transactionalProviderDecision: BuyerDiligenceControlDecision;
  productionConnectorReadiness: BuyerDiligenceControlDecision;
  signedControlsRegister: BuyerDiligenceControlDecision;
  retainedBlockers: string[];
  nextRequiredApprovals: string[];
  competitiveAdvantageSignals: BuyerDiligenceCompetitiveSignal[];
  lastPacketGeneratedAt: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string | null;
  boundary: string;
};

export type SalesBuyerDiligenceRoomResult = {
  buyerDiligenceRoom: SalesBuyerDiligenceRoom;
  created: boolean;
  auditEventId: string | null;
  boundary: string;
};

export const buyerDiligenceRoomProofStackStatus =
  "aal2-buyer-evidence-signed-controls-diligence-room";
export const buyerDiligenceRoomPacketProofStackStatus =
  "aal2-audited-buyer-diligence-packets";

export const buyerDiligenceRoomApiRoute =
  "/api/sales-operations/opportunities/{intakeId}/buyer-diligence";
export const buyerDiligenceRoomPacketApiRoute =
  "/api/sales-operations/opportunities/{intakeId}/buyer-diligence/packet";

export const buyerDiligenceRoomBoundary =
  "Buyer Evidence and Signed Controls Diligence Rooms organize metadata-only buyer evidence requirements, signed-control status, BAA/DPA posture, IdP/domain proof needs, transactional provider decisions, and production connector readiness after SCRIMED paid-pilot setup approval. They do not accept PHI, patient identifiers, live clinical records, secrets, private keys, IdP certificates, production credentials, legal advice, compliance certification, payer authorization, patient outreach approval, autonomous care approval, or live healthcare execution authorization.";

export function isBuyerDiligenceRoomEligible(opportunity: SalesOpportunity) {
  return Boolean(opportunity.customerActivationApprovals);
}

function appBase(baseUrl: string) {
  return baseUrl.replace(/\/$/, "");
}

export function buyerDiligenceRoomRouteForOpportunity({
  appBaseUrl,
  intakeId
}: {
  appBaseUrl: string;
  intakeId: string;
}) {
  return `${appBase(appBaseUrl)}/api/sales-operations/opportunities/${encodeURIComponent(
    intakeId
  )}/buyer-diligence`;
}

export function buyerDiligenceRoomPacketRouteForOpportunity({
  appBaseUrl,
  intakeId
}: {
  appBaseUrl: string;
  intakeId: string;
}) {
  return `${buyerDiligenceRoomRouteForOpportunity({ appBaseUrl, intakeId })}/packet`;
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

function evidenceDomainLines(domain: BuyerDiligenceEvidenceDomain) {
  return [
    `- Status: ${domain.status}`,
    `- Owner: ${domain.owner}`,
    `- Required evidence: ${domain.requiredEvidence.join(", ")}`,
    `- Accepted metadata: ${domain.acceptedEvidenceMetadata.join(", ")}`,
    `- Prohibited uploads: ${domain.prohibitedUploads.join(", ")}`,
    `- Production gate: ${domain.productionGate}`
  ].join("\n");
}

function controlDecisionLines(decision: BuyerDiligenceControlDecision) {
  return [
    `- Status: ${decision.status}`,
    `- Required approvals: ${decision.requiredApprovals.join(", ")}`,
    `- Signed-control artifacts: ${decision.signedControlArtifacts.join(", ")}`,
    `- Retained blockers: ${decision.retainedBlockers.join(", ")}`,
    `- Production gate: ${decision.productionGate}`
  ].join("\n");
}

function signalLines(signals: BuyerDiligenceCompetitiveSignal[]) {
  return signals
    .map((signal) => `- ${signal.pillar}: ${signal.buyerValue} Proof: ${signal.proof}`)
    .join("\n");
}

export function buildBuyerDiligenceRoomPacket({
  generatedAt,
  auditEventId,
  generatedBy,
  opportunity,
  diligenceRoom,
  appBaseUrl,
  auditEvents
}: {
  generatedAt: string;
  auditEventId: string;
  generatedBy: string;
  opportunity: SalesOpportunity;
  diligenceRoom: SalesBuyerDiligenceRoom;
  appBaseUrl: string;
  auditEvents: SalesAuditEvent[];
}) {
  const diligenceRoute = buyerDiligenceRoomRouteForOpportunity({
    appBaseUrl,
    intakeId: opportunity.intakeId
  });
  const packetRoute = buyerDiligenceRoomPacketRouteForOpportunity({
    appBaseUrl,
    intakeId: opportunity.intakeId
  });

  return `# SCRIMED Buyer Evidence And Signed Controls Diligence Packet

## Packet Control
- Generated: ${generatedAt}
- Packet audit event ID: ${auditEventId}
- Generated by: ${generatedBy}
- Opportunity ID: ${opportunity.intakeId}
- Proof status: ${buyerDiligenceRoomPacketProofStackStatus}
- Data boundary: business-contact, workflow-scope, and diligence metadata only

## Diligence Room Record
- Organization: ${opportunity.payload.organization.name}
- Buyer contact: ${opportunity.payload.contact.fullName}
- Buyer email: ${opportunity.payload.contact.workEmail}
- Workspace slug: ${diligenceRoom.workspaceSlug}
- Diligence status: ${diligenceRoom.diligenceStatus}
- Evidence scope: ${diligenceRoom.evidenceScope}
- Diligence API: ${diligenceRoute}
- Diligence packet API: ${packetRoute}

## Evidence Submission Policy
${evidenceDomainLines(diligenceRoom.evidenceSubmissionPolicy)}

## Buyer Domain Proof
${evidenceDomainLines(diligenceRoom.domainProofEvidence)}

## IdP Metadata Readiness
${evidenceDomainLines(diligenceRoom.idpMetadataEvidence)}

## Legal, Privacy, And Security Controls
${controlDecisionLines(diligenceRoom.legalPrivacySecurityControls)}

## BAA / DPA Status
${controlDecisionLines(diligenceRoom.baaDpaStatus)}

## Transactional Provider Decision
${controlDecisionLines(diligenceRoom.transactionalProviderDecision)}

## Production Connector Readiness
${controlDecisionLines(diligenceRoom.productionConnectorReadiness)}

## Signed Controls Register
${controlDecisionLines(diligenceRoom.signedControlsRegister)}

## Next Required Approvals
${markdownList(diligenceRoom.nextRequiredApprovals)}

## Retained Blockers
${markdownList(diligenceRoom.retainedBlockers)}

## Competitive Advantage Signals
${signalLines(diligenceRoom.competitiveAdvantageSignals)}

## Buyer Scope
- Offer interest: ${opportunity.payload.scope.offerInterest}
- Timeline: ${opportunity.payload.scope.timeline}
- Workflow targets: ${opportunity.payload.scope.workflowTargets.join(", ")}
- Readiness needs: ${opportunity.payload.scope.readinessNeeds.join(", ")}
- Governance requirements: ${opportunity.payload.scope.governanceRequirements.join(", ")}
- Interoperability context: ${opportunity.payload.scope.interoperabilityContext || "To be confirmed"}
- Pilot goals: ${opportunity.payload.scope.pilotGoals}

## Workaround For Current Limitations
- Use this packet as the metadata-only diligence tracker when automated evidence upload, signed document storage, or unattended AAL2 mutation smoke is unavailable.
- Exchange sensitive buyer documents through buyer-approved secure channels outside SCRIMED until storage, DLP, malware scanning, retention, legal hold, and access controls are separately approved.
- Record only status, owners, timestamps, approvals, and required actions inside SCRIMED at this stage.

## Recent Sales Audit Events
${auditLines(auditEvents)}

## Boundary
${diligenceRoom.boundary}

${buyerDiligenceRoomBoundary}

This packet is a non-binding diligence artifact. It helps SCRIMED and the buyer organize signed controls before production-adjacent activation; it does not authorize live healthcare operations.
`;
}
