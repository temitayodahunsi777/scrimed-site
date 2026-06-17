import type { BuyerDemoExecutionPath } from "./buyerDemoExecutionPath";
import type { SalesAuditEvent, SalesOpportunity } from "./salesOperations";

export type SalesBuyerDemoSessionStatus =
  | "recorded"
  | "ready-for-follow-up"
  | "follow-up-needed"
  | "blocked-review-required";

export type SalesBuyerDemoSession = {
  id: string;
  tenantId: string;
  intakeId: string;
  workspaceId: string | null;
  workspaceSlug: string;
  workspaceMappingMode: "default-synthetic-workspace" | "buyer-specific-workspace";
  demoStatus: SalesBuyerDemoSessionStatus;
  pathStatus: BuyerDemoExecutionPath["status"];
  readinessScore: number;
  dealRoomReadinessScore: number;
  completedStepCount: number;
  executableStepCount: number;
  selectedStepIds: string[];
  selectedPacketRoutes: string[];
  operatorNotes: string;
  buyerQuestions: string[];
  blockers: string[];
  workarounds: string[];
  nextActions: string[];
  followUpPlan: {
    owner?: string;
    nextStep?: string;
    dueAt?: string;
    commercialMotion?: string;
  };
  hardGates: string[];
  targetAudiences: string[];
  revenuePath: string[];
  demoRunbook: string[];
  pathSnapshot: BuyerDemoExecutionPath;
  lastPacketGeneratedAt: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string | null;
  boundary: string;
};

export type SalesBuyerDemoSessionResult = {
  buyerDemoSession: SalesBuyerDemoSession;
  created: boolean;
  auditEventId: string | null;
  boundary: string;
};

export type SalesBuyerDemoSessionInput = {
  operatorNotes?: string;
  buyerQuestions?: string[];
  selectedStepIds?: string[];
  selectedPacketRoutes?: string[];
  nextActions?: string[];
  followUpPlan?: SalesBuyerDemoSession["followUpPlan"];
};

export const buyerDemoSessionProofStackStatus = "aal2-persisted-buyer-demo-sessions";
export const buyerDemoSessionPacketProofStackStatus =
  "aal2-audited-buyer-demo-session-packets";

export const buyerDemoSessionsApiRoute =
  "/api/sales-operations/opportunities/{intakeId}/demo-sessions";
export const buyerDemoSessionPacketApiRoute =
  "/api/sales-operations/opportunities/{intakeId}/demo-sessions/{sessionId}/packet";

export const buyerDemoSessionBoundary =
  "Persisted Buyer Demo Sessions retain no-PHI operator notes, synthetic proof-packet selections, buyer questions, blockers, workarounds, next actions, and follow-up plans for governed synthetic pilot sales only. They do not store PHI, patient identifiers, live clinical records, payer member data, diagnosis details, medical-record excerpts, source contracts, secrets, credentials, legal advice, compliance certification, reimbursement determinations, patient outreach approval, autonomous care approval, or live healthcare execution authorization.";

const prohibitedDemoTextPatterns = [
  /\b(?:phi|ephi|mrn|dob|ssn)\b/i,
  /\bmedical record\b/i,
  /\bpatient identifier\b/i,
  /\bmember id\b/i,
  /\bpayer member\b/i,
  /\bdiagnosis details?\b/i,
  /\bdiagnosed with\b/i,
  /\bdate of birth\b/i,
  /\bprotected health information\b/i,
  /\bclinical note\b/i,
  /\blab result\b/i,
  /\bradiology report\b/i,
  /\bprescription number\b/i
];

function cleanText(value: unknown, limit = 800) {
  if (typeof value !== "string") return "";
  return value.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim().slice(0, limit);
}

function cleanList(value: unknown, limit = 8, itemLimit = 240) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => cleanText(item, itemLimit))
    .filter(Boolean)
    .slice(0, limit);
}

export function containsProhibitedDemoSessionText(value: unknown) {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? {});
  return prohibitedDemoTextPatterns.some((pattern) => pattern.test(text));
}

function selectedDefaultStepIds(path: BuyerDemoExecutionPath) {
  return path.steps
    .filter((step) => step.status === "complete" || step.status === "available")
    .map((step) => step.id);
}

function selectedDefaultPacketRoutes(path: BuyerDemoExecutionPath) {
  return path.steps
    .flatMap((step) => [step.primaryRoute, step.packetRoute].filter(Boolean) as string[])
    .filter((route) => route.includes("/packet") || route.includes("/proposal") || route.includes("/brief"))
    .slice(0, 12);
}

export function buildBuyerDemoSessionPayload({
  path,
  input
}: {
  path: BuyerDemoExecutionPath;
  input: SalesBuyerDemoSessionInput;
}) {
  const selectedStepIds = cleanList(input.selectedStepIds, 24, 120);
  const selectedPacketRoutes = cleanList(input.selectedPacketRoutes, 24, 500);
  const buyerQuestions = cleanList(input.buyerQuestions, 8, 300);
  const nextActions = cleanList(input.nextActions, 8, 300);
  const operatorNotes = cleanText(input.operatorNotes, 3000);
  const blockerLines = [
    path.currentBlockingGate,
    ...path.knownLimits.map((item) => item.limit)
  ].filter(Boolean);
  const workaroundLines = path.knownLimits.map((item) => item.workaround);
  const followUpPlan = {
    owner: cleanText(input.followUpPlan?.owner, 160) || "SCRIMED sales operator",
    nextStep: cleanText(input.followUpPlan?.nextStep, 300) || path.nextBestAction,
    dueAt: cleanText(input.followUpPlan?.dueAt, 80),
    commercialMotion:
      cleanText(input.followUpPlan?.commercialMotion, 180) || path.revenuePath[0] || "Synthetic Pilot Evaluation"
  };

  return {
    workspaceSlug: path.workspaceSlug,
    workspaceMappingMode: path.workspaceMappingMode,
    demoStatus: path.status === "sequenced-blockers-visible" ? "follow-up-needed" : "recorded",
    pathStatus: path.status,
    readinessScore: path.readinessScore,
    dealRoomReadinessScore: path.dealRoomReadinessScore,
    completedStepCount: path.completedStepCount,
    executableStepCount: path.executableStepCount,
    selectedStepIds: selectedStepIds.length > 0 ? selectedStepIds : selectedDefaultStepIds(path),
    selectedPacketRoutes:
      selectedPacketRoutes.length > 0 ? selectedPacketRoutes : selectedDefaultPacketRoutes(path),
    operatorNotes,
    buyerQuestions,
    blockers: blockerLines.slice(0, 12),
    workarounds: workaroundLines.slice(0, 12),
    nextActions: nextActions.length > 0 ? nextActions : [path.nextBestAction],
    followUpPlan,
    hardGates: path.hardGates,
    targetAudiences: path.targetAudiences,
    revenuePath: path.revenuePath,
    demoRunbook: path.demoRunbook,
    pathSnapshot: path
  };
}

function markdownList(items: string[]) {
  if (items.length === 0) return "- None recorded.";
  return items.map((item) => `- ${item}`).join("\n");
}

function auditLines(events: SalesAuditEvent[]) {
  if (events.length === 0) return "- No recent sales audit events are visible for this opportunity.";

  return events
    .slice(0, 20)
    .map((event) => `- ${event.createdAt}: ${event.eventType} by ${event.actorUserId}`)
    .join("\n");
}

function packetRouteLines(routes: string[]) {
  if (routes.length === 0) return "- No packet routes were selected.";
  return routes.map((route) => `- ${route}`).join("\n");
}

export function buildBuyerDemoSessionPacket({
  generatedAt,
  auditEventId,
  generatedBy,
  opportunity,
  session,
  auditEvents
}: {
  generatedAt: string;
  auditEventId: string;
  generatedBy: string;
  opportunity: SalesOpportunity;
  session: SalesBuyerDemoSession;
  auditEvents: SalesAuditEvent[];
}) {
  return `# SCRIMED Buyer Demo Session Packet

## Packet Control
- Generated: ${generatedAt}
- Packet audit event ID: ${auditEventId}
- Generated by: ${generatedBy}
- Opportunity ID: ${session.intakeId}
- Demo session ID: ${session.id}
- Proof status: ${buyerDemoSessionPacketProofStackStatus}
- Data boundary: business-contact, workflow-scope, synthetic proof metadata, and no-PHI operator notes only

## Buyer And Opportunity
- Organization: ${opportunity.payload.organization.name}
- Buyer contact: ${opportunity.payload.contact.fullName}
- Buyer email: ${opportunity.payload.contact.workEmail}
- Buyer role: ${opportunity.payload.contact.role}
- Buyer segment: ${opportunity.payload.organization.buyerSegment}
- Pipeline stage: ${opportunity.pipelineStage}
- Assigned owner: ${opportunity.assignedOwner || "Unassigned"}
- Next action: ${opportunity.nextAction || "Confirm buyer decision path"}
- Next action due: ${opportunity.nextActionDueAt ?? "not set"}

## Demo Session
- Demo status: ${session.demoStatus}
- Path status: ${session.pathStatus}
- Readiness score: ${session.readinessScore}%
- Deal-room readiness score: ${session.dealRoomReadinessScore}%
- Completed executable steps: ${session.completedStepCount}/${session.executableStepCount}
- Workspace slug: ${session.workspaceSlug}
- Workspace mapping mode: ${session.workspaceMappingMode}
- Last packet generated: ${session.lastPacketGeneratedAt ?? "not previously generated"}
- Created: ${session.createdAt}

## Operator Notes
${session.operatorNotes || "No operator notes recorded."}

## Buyer Questions
${markdownList(session.buyerQuestions)}

## Selected Demo Steps
${markdownList(session.selectedStepIds)}

## Selected Packet Routes
${packetRouteLines(session.selectedPacketRoutes)}

## Blockers
${markdownList(session.blockers)}

## Workarounds
${markdownList(session.workarounds)}

## Next Actions
${markdownList(session.nextActions)}

## Follow-Up Plan
- Owner: ${session.followUpPlan.owner ?? "Not recorded"}
- Next step: ${session.followUpPlan.nextStep ?? "Not recorded"}
- Due at: ${session.followUpPlan.dueAt || "Not set"}
- Commercial motion: ${session.followUpPlan.commercialMotion ?? "Not recorded"}

## Revenue Path
${markdownList(session.revenuePath)}

## Target Audiences
${markdownList(session.targetAudiences)}

## Retained Hard Gates
${markdownList(session.hardGates)}

## Demo Runbook
${markdownList(session.demoRunbook)}

## Recent Sales Audit Events
${auditLines(auditEvents)}

## Session Boundary
${session.boundary}

This packet is a no-PHI sales and enterprise diligence artifact. It does not authorize PHI processing, production clinical use, autonomous diagnosis or treatment decisions, payer submission, patient outreach, customer SSO cutover, sensitive evidence storage, legal conclusions, compliance certification, reimbursement determinations, or live healthcare execution.
`;
}
