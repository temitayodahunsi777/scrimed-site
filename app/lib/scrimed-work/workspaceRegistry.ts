import type { WorkspaceDomain } from "./types";

export type ScrimedWorkWorkspace = {
  workspaceId: string;
  domain: WorkspaceDomain;
  title: string;
  purpose: string;
  allowedDataClassifications: string[];
  defaultRiskLevel: string;
  humanReviewDefault: boolean;
  retainedBoundary: string;
};

export const scrimedWorkspaces: ScrimedWorkWorkspace[] = [
  {
    workspaceId: "clinical-work",
    domain: "clinical",
    title: "Clinical Work",
    purpose: "Decision-support preparation, care coordination drafts, education drafts, and synthetic clinical context review.",
    allowedDataClassifications: ["synthetic-no-phi", "metadata-only", "deidentified"],
    defaultRiskLevel: "high",
    humanReviewDefault: true,
    retainedBoundary: "No diagnosis, treatment, prescribing, triage, final imaging interpretation, or live patient care."
  },
  {
    workspaceId: "executive-work",
    domain: "executive",
    title: "Executive Work",
    purpose: "Board, investor, buyer, value, and operating reports with evidence and claims controls.",
    allowedDataClassifications: ["metadata-only", "synthetic-no-phi"],
    defaultRiskLevel: "moderate",
    humanReviewDefault: true,
    retainedBoundary: "No audited financials, securities material, valuation assurance, or customer go-live approval."
  },
  {
    workspaceId: "research-work",
    domain: "research",
    title: "Research Work",
    purpose: "Cited research briefs, contradiction detection, trial-readiness summaries, and evidence grading.",
    allowedDataClassifications: ["metadata-only", "synthetic-no-phi"],
    defaultRiskLevel: "moderate",
    humanReviewDefault: true,
    retainedBoundary: "No therapeutic claims, enrollment decisions, or clinical validation claims."
  },
  {
    workspaceId: "operations-work",
    domain: "operations",
    title: "Operations Work",
    purpose: "Operational playbooks, patient access workflows, scheduling simulations, and service delivery reports.",
    allowedDataClassifications: ["metadata-only", "synthetic-no-phi"],
    defaultRiskLevel: "moderate",
    humanReviewDefault: true,
    retainedBoundary: "No autonomous outreach, booking, external communication, or production mutation."
  },
  {
    workspaceId: "scrimed-studio",
    domain: "trust-governance",
    title: "SCRIMED Studio",
    purpose: "Read-only registries for agents, tools, providers, policies, artifact templates, and schedule templates.",
    allowedDataClassifications: ["metadata-only", "synthetic-no-phi"],
    defaultRiskLevel: "low",
    humanReviewDefault: false,
    retainedBoundary: "Registry visibility only; not tool execution or approval authority."
  }
];

export function getWorkspaceByDomain(domain: WorkspaceDomain) {
  return scrimedWorkspaces.find((workspace) => workspace.domain === domain) ?? scrimedWorkspaces[0];
}
