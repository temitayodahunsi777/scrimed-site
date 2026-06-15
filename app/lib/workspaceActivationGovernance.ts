import {
  agentWorkspaceGovernanceWorkflowPacks,
  getGovernanceWorkflowPackBySlug,
  governanceWorkflowPackBoundary,
  type GovernanceWorkflowPack,
  type GovernanceWorkflowPackStatus
} from "./agentWorkspaceGovernancePacks";
import type {
  AgentWorkspaceGovernanceLedgerInput,
  AgentWorkspaceGovernanceLedgerRecord
} from "./persistentAgentWorkspace";
import type { PilotWorkspaceRecord } from "./protectedPilotWorkspace";

export type WorkspaceActivationGovernanceProfile = {
  workspace: {
    id: string;
    slug: string;
    name: string;
    tenantId: string;
    tenantName: string;
    status: PilotWorkspaceRecord["status"];
  };
  selectedPack: {
    slug: string;
    name: string;
    status: GovernanceWorkflowPackStatus;
    buyerSegment: string;
    route: string;
    briefRoute: string;
  };
  retentionUntil: string;
  retentionHorizonDays: number;
  retentionPolicyTemplate: GovernanceWorkflowPack["retentionPolicyTemplate"];
  requiredApprovals: string[];
  externalGates: string[];
  incidentExportReleaseGate: string;
  evidenceArtifacts: string[];
  automationBoundaries: string[];
  blockedClaims: string[];
  activationOwner: string;
  sourceIntakeId: string;
  sourceOpportunityId: string;
  notes: string;
  boundary: string;
};

export type WorkspaceActivationGovernanceSummary = {
  service: "scrimed-workspace-activation-governance";
  status:
    | "activation-governance-ready"
    | "activation-governance-recorded"
    | "activation-governance-unavailable";
  route: string;
  apiRoute: string;
  boundary: string;
  profile: WorkspaceActivationGovernanceProfile;
  existingActivationLedgerRecords: AgentWorkspaceGovernanceLedgerRecord[];
  recommendedPacks: Array<{
    slug: string;
    name: string;
    status: GovernanceWorkflowPackStatus;
    buyerSegment: string;
    defaultRetention: string;
  }>;
  nextAction: string;
};

export const workspaceActivationGovernanceEventKind =
  "workspace-activation-governance-pack-selected";

export const defaultWorkspaceActivationGovernancePackSlug = "enterprise-baa-dpa-readiness";

const retentionDaysByPackSlug: Record<string, number> = {
  "provider-operations-retention-review": 180,
  "payer-rcm-incident-export": 365,
  "trialcore-research-legal-hold": 365,
  "public-sector-sovereign-retention": 365,
  "enterprise-baa-dpa-readiness": 365
};

function addDays(base: Date, days: number) {
  const next = new Date(base);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString();
}

function safeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

export function resolveWorkspaceActivationGovernancePack(slug?: string | null) {
  const requestedSlug = safeText(slug, 96) || defaultWorkspaceActivationGovernancePackSlug;
  return getGovernanceWorkflowPackBySlug(requestedSlug);
}

export function getWorkspaceActivationGovernanceRecommendedPacks() {
  return agentWorkspaceGovernanceWorkflowPacks.map((pack) => ({
    slug: pack.slug,
    name: pack.name,
    status: pack.status,
    buyerSegment: pack.buyerSegment,
    defaultRetention: pack.retentionPolicyTemplate.defaultDuration
  }));
}

export function buildWorkspaceActivationGovernanceProfile({
  workspace,
  governanceWorkflowPackSlug,
  activationOwner,
  sourceIntakeId,
  sourceOpportunityId,
  notes,
  now = new Date()
}: {
  workspace: PilotWorkspaceRecord;
  governanceWorkflowPackSlug?: string | null;
  activationOwner?: string | null;
  sourceIntakeId?: string | null;
  sourceOpportunityId?: string | null;
  notes?: string | null;
  now?: Date;
}): WorkspaceActivationGovernanceProfile {
  const pack =
    resolveWorkspaceActivationGovernancePack(governanceWorkflowPackSlug) ??
    getGovernanceWorkflowPackBySlug(defaultWorkspaceActivationGovernancePackSlug);

  if (!pack) {
    throw new Error("Default workspace activation governance pack is unavailable.");
  }

  const retentionHorizonDays = retentionDaysByPackSlug[pack.slug] ?? 365;

  return {
    workspace: {
      id: workspace.id,
      slug: workspace.slug,
      name: workspace.name,
      tenantId: workspace.tenantId,
      tenantName: workspace.tenantName,
      status: workspace.status
    },
    selectedPack: {
      slug: pack.slug,
      name: pack.name,
      status: pack.status,
      buyerSegment: pack.buyerSegment,
      route: "/governance-packs",
      briefRoute: "/api/agent-workspace/governance-packs/brief"
    },
    retentionUntil: addDays(now, retentionHorizonDays),
    retentionHorizonDays,
    retentionPolicyTemplate: pack.retentionPolicyTemplate,
    requiredApprovals: pack.legalReviewWorkflow.requiredApprovals,
    externalGates: pack.legalReviewWorkflow.externalGates,
    incidentExportReleaseGate: pack.incidentExportWorkflow.releaseGate,
    evidenceArtifacts: pack.evidenceArtifacts,
    automationBoundaries: pack.automationBoundaries,
    blockedClaims: pack.blockedClaims,
    activationOwner: safeText(activationOwner, 160) || "tenant-admin",
    sourceIntakeId: safeText(sourceIntakeId, 120),
    sourceOpportunityId: safeText(sourceOpportunityId, 120),
    notes: safeText(notes, 1000),
    boundary: governanceWorkflowPackBoundary
  };
}

export function buildWorkspaceActivationGovernanceLedgerSeed(
  profile: WorkspaceActivationGovernanceProfile
): AgentWorkspaceGovernanceLedgerInput {
  return {
    actionType: "retention-policy-recorded",
    reason: `Workspace activation governance pack selected: ${profile.selectedPack.name}. This metadata-only retention seed establishes buyer-specific proof controls before any protected pilot evidence is released.`,
    workOrderId: null,
    retentionUntil: profile.retentionUntil,
    legalHoldUntil: null,
    incidentSeverity: "not-applicable",
    eventMetadata: {
      eventKind: workspaceActivationGovernanceEventKind,
      workspaceSlug: profile.workspace.slug,
      workspaceStatus: profile.workspace.status,
      governanceWorkflowPackSlug: profile.selectedPack.slug,
      governanceWorkflowPackName: profile.selectedPack.name,
      governanceWorkflowPackStatus: profile.selectedPack.status,
      governanceWorkflowPackRoute: profile.selectedPack.route,
      governanceWorkflowPackBriefRoute: profile.selectedPack.briefRoute,
      retentionHorizonDays: profile.retentionHorizonDays,
      retentionPolicyTemplate: profile.retentionPolicyTemplate,
      requiredApprovals: profile.requiredApprovals,
      externalGates: profile.externalGates,
      incidentExportReleaseGate: profile.incidentExportReleaseGate,
      evidenceArtifacts: profile.evidenceArtifacts,
      automationBoundaries: profile.automationBoundaries,
      blockedClaims: profile.blockedClaims,
      activationOwner: profile.activationOwner,
      sourceIntakeId: profile.sourceIntakeId,
      sourceOpportunityId: profile.sourceOpportunityId,
      notes: profile.notes,
      syntheticPilotBoundary: true,
      noPhiBoundary: true,
      humanReviewRequired: true,
      noAutonomousDiagnosis: true,
      noLiveConnectorExecution: true
    }
  };
}

export function isWorkspaceActivationGovernanceLedgerRecord(
  record: AgentWorkspaceGovernanceLedgerRecord
) {
  return record.eventMetadata.eventKind === workspaceActivationGovernanceEventKind;
}

export function findWorkspaceActivationGovernanceLedgerRecords(
  ledgerRecords: AgentWorkspaceGovernanceLedgerRecord[]
) {
  return ledgerRecords.filter(isWorkspaceActivationGovernanceLedgerRecord);
}

export function buildWorkspaceActivationGovernanceSummary({
  workspace,
  profile,
  ledgerRecords
}: {
  workspace: PilotWorkspaceRecord;
  profile: WorkspaceActivationGovernanceProfile;
  ledgerRecords: AgentWorkspaceGovernanceLedgerRecord[];
}): WorkspaceActivationGovernanceSummary {
  const existingActivationLedgerRecords =
    findWorkspaceActivationGovernanceLedgerRecords(ledgerRecords);

  return {
    service: "scrimed-workspace-activation-governance",
    status:
      existingActivationLedgerRecords.length > 0
        ? "activation-governance-recorded"
        : "activation-governance-ready",
    route: "/pilot-workspace/access",
    apiRoute: `/api/pilot-workspaces/${workspace.slug}/activation-governance`,
    boundary: governanceWorkflowPackBoundary,
    profile,
    existingActivationLedgerRecords,
    recommendedPacks: getWorkspaceActivationGovernanceRecommendedPacks(),
    nextAction:
      existingActivationLedgerRecords.length > 0
        ? "Continue buyer activation, onboarding packet generation, and proof export."
        : "Record the selected governance pack as the first protected-pilot activation ledger event."
  };
}
