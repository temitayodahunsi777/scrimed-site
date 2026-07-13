import type { WorkspaceDomain } from "./types";

export type ScheduleDefinition = {
  id: string;
  title: string;
  domain: WorkspaceDomain;
  cadenceExpression: string;
  taskTemplate: string;
  tenant: string;
  enabled: boolean;
  approvalPolicy: string;
  maximumRuntimeMs: number;
  maximumCostUsd: number;
  lastRunAt: string | null;
  nextRunAt: string | null;
  owner: string;
  simulationOnly: true;
};

export const scrimedWorkScheduleDefinitions: ScheduleDefinition[] = [
  {
    id: "morning-oncology-review-prep",
    title: "Morning oncology review preparation",
    domain: "clinical",
    cadenceExpression: "0 6 * * 1-5",
    taskTemplate: "Prepare synthetic oncology review queue with citation and human-review gates.",
    tenant: "synthetic-tenant",
    enabled: false,
    approvalPolicy: "clinician-review-required",
    maximumRuntimeMs: 600_000,
    maximumCostUsd: 0.25,
    lastRunAt: null,
    nextRunAt: null,
    owner: "Clinical Governance",
    simulationOnly: true
  },
  {
    id: "hourly-critical-lab-monitoring-simulation",
    title: "Hourly critical-lab monitoring simulation",
    domain: "clinical",
    cadenceExpression: "0 * * * *",
    taskTemplate: "Simulate critical-lab signal detection without live patient data or outreach.",
    tenant: "synthetic-tenant",
    enabled: false,
    approvalPolicy: "simulation-only-no-alerting",
    maximumRuntimeMs: 300_000,
    maximumCostUsd: 0.05,
    lastRunAt: null,
    nextRunAt: null,
    owner: "Safety Operations",
    simulationOnly: true
  },
  {
    id: "nightly-risk-score-refresh-preview",
    title: "Nightly risk-score refresh preview",
    domain: "operations",
    cadenceExpression: "0 2 * * *",
    taskTemplate: "Refresh synthetic risk-score preview and generate verification report.",
    tenant: "synthetic-tenant",
    enabled: false,
    approvalPolicy: "operator-review-required",
    maximumRuntimeMs: 900_000,
    maximumCostUsd: 0.15,
    lastRunAt: null,
    nextRunAt: null,
    owner: "Operations",
    simulationOnly: true
  },
  {
    id: "weekly-payer-report-preparation",
    title: "Weekly payer report preparation",
    domain: "revenue-cycle",
    cadenceExpression: "0 8 * * 1",
    taskTemplate: "Prepare payer documentation gap report with no submission authority.",
    tenant: "synthetic-tenant",
    enabled: false,
    approvalPolicy: "rcm-compliance-review-required",
    maximumRuntimeMs: 1_200_000,
    maximumCostUsd: 0.2,
    lastRunAt: null,
    nextRunAt: null,
    owner: "RCM Governance",
    simulationOnly: true
  },
  {
    id: "monthly-executive-dashboard-generation",
    title: "Monthly executive dashboard generation",
    domain: "executive",
    cadenceExpression: "0 9 1 * *",
    taskTemplate: "Prepare executive dashboard from verified metadata and retained boundaries.",
    tenant: "synthetic-tenant",
    enabled: false,
    approvalPolicy: "executive-review-required",
    maximumRuntimeMs: 1_800_000,
    maximumCostUsd: 0.3,
    lastRunAt: null,
    nextRunAt: null,
    owner: "Executive Operations",
    simulationOnly: true
  }
];
