import { getPilotProgramBySlug, type PilotProgram } from "./demoPilotPrograms";
import type { PilotIntakeHandoffPayload } from "./pilotIntake";

export const salesOperationsBoundary =
  "SCRIMED Sales Operations manages business-contact and workflow-scope opportunities only. Do not enter PHI, patient identifiers, live clinical records, diagnosis details, payer member identifiers, or production healthcare data. Every offer remains a governed synthetic pilot or enterprise evaluation until production controls are separately approved.";

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
  updatedAt: string;
  updatedBy: string | null;
  lastCrmSyncAt: string | null;
  lastCrmSyncStatus: SalesCrmSyncStatus;
  lastCrmSyncDetail: string;
  retentionUntil: string;
  payload: PilotIntakeHandoffPayload;
};

export type SalesAuditEvent = {
  id: string;
  intakeId: string;
  actorUserId: string;
  eventType: "opportunity-updated" | "proposal-downloaded" | "crm-sync-recorded";
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
  };
  opportunities: SalesOpportunity[];
  auditEvents: SalesAuditEvent[];
  boundary: string;
};

export type SalesOpportunityUpdate = {
  pipelineStage: SalesPipelineStage;
  assignedOwner: string;
  nextAction: string;
};

const offerPilotMap: Record<string, string> = {
  "synthetic-pilot-evaluation": "60-day-governed-automation-pilot",
  "workflow-intelligence-assessment": "30-day-workflow-intelligence-sprint",
  "ai-readiness-governance-audit": "ai-governance-interoperability-readiness",
  "clinical-operations-automation-blueprint": "90-day-enterprise-atlas-pilot"
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

  if (!isSalesPipelineStage(pipelineStage)) {
    return { ok: false, message: "Select a supported sales pipeline stage." };
  }

  if (assignedOwner.length > 180 || nextAction.length > 500) {
    return { ok: false, message: "Owner or next action exceeds the allowed business-scope length." };
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
      nextAction
    }
  };
}

export function getPilotProgramForOpportunity(opportunity: SalesOpportunity): PilotProgram | null {
  const pilotSlug = offerPilotMap[opportunity.payload.scope.offerInterest];
  return pilotSlug ? getPilotProgramBySlug(pilotSlug) ?? null : null;
}

export function getSalesOperationsSummary() {
  return {
    service: "scrimed-sales-operations",
    route: "/sales-operations",
    apiRoute: "/api/sales-operations",
    status: "tenant-admin-protected",
    crmConfigured: Boolean(process.env.SCRIMED_PILOT_INTAKE_WEBHOOK_URL),
    pipelineStages: salesPipelineStages,
    boundary: salesOperationsBoundary,
    updated: "2026-06-11"
  };
}

export function buildSalesOpportunityProposal(opportunity: SalesOpportunity) {
  const pilot = getPilotProgramForOpportunity(opportunity);
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

## Buyer Scope
- Offer interest: ${cleanMarkdown(payload.scope.offerInterest)}
- Timeline: ${cleanMarkdown(payload.scope.timeline)}
- Workflow targets: ${payload.scope.workflowTargets.map(cleanMarkdown).join(", ")}
- Readiness needs: ${payload.scope.readinessNeeds.map(cleanMarkdown).join(", ")}
- Governance requirements: ${payload.scope.governanceRequirements.map(cleanMarkdown).join(", ")}
- Interoperability context: ${cleanMarkdown(payload.scope.interoperabilityContext || "To be confirmed")}
- Pilot goals: ${cleanMarkdown(payload.scope.pilotGoals)}

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
    assessment: opportunity.payload.assessment
  };
}
