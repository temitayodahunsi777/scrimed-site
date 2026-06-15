"use client";

import type { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  AgentWorkspaceGovernanceActionType,
  AgentWorkspaceGovernanceLedgerDashboard,
  AgentWorkspaceGovernanceLedgerRecord,
  AgentWorkspaceGovernanceStatus,
  AgentWorkspaceIncidentSeverity,
  AgentWorkspaceWorkOrderDashboard,
  AgentWorkspaceWorkOrderEventType,
  AgentWorkspaceWorkOrderEventRecord,
  AgentWorkspaceWorkOrderFilters,
  AgentWorkspaceWorkOrderRecord,
  AgentWorkOrderState,
  AgentWorkOrderType
} from "../lib/persistentAgentWorkspace";
import type { PilotWorkspaceRecord } from "../lib/protectedPilotWorkspace";

type WorkOrderListResponse = {
  dashboard?: AgentWorkspaceWorkOrderDashboard;
  filters?: AgentWorkspaceWorkOrderFilters;
  workOrders?: AgentWorkspaceWorkOrderRecord[];
  error?: { code?: string; message?: string; fields?: string[] };
};

type WorkOrderDetailResponse = {
  workOrder?: AgentWorkspaceWorkOrderRecord;
  events?: AgentWorkspaceWorkOrderEventRecord[];
  error?: { code?: string; message?: string };
};

type WorkOrderMutationResponse = WorkOrderDetailResponse & {
  status?: string;
  eventId?: string;
  error?: { code?: string; message?: string; fields?: string[] };
};

type GovernanceLedgerResponse = {
  dashboard?: AgentWorkspaceGovernanceLedgerDashboard;
  ledgerRecords?: AgentWorkspaceGovernanceLedgerRecord[];
  ledgerId?: string;
  ledgerRecord?: AgentWorkspaceGovernanceLedgerRecord | null;
  error?: { code?: string; message?: string; fields?: string[] };
};

type DashboardStatus = "loading" | "ready" | "saving" | "error";

type FilterState = {
  state: AgentWorkOrderState | "all";
  workOrderType: AgentWorkOrderType | "all";
  assignedReviewerId: string;
  minRetryCount: string;
  governanceStatus: AgentWorkspaceGovernanceStatus | "all";
};

type WorkOrderOption = {
  type: AgentWorkOrderType;
  name: string;
  agentOwner: string;
  defaultObjective: string;
  modelRouterPolicy: string;
  memoryScopes: string[];
  toolScopes: string[];
  reviewerCheckpoints: string[];
  blockedActions: string[];
  trustCardRequirement: string;
  salesPackage: string;
  predictiveBoundary: string;
};

type CreateFormState = {
  workOrderType: AgentWorkOrderType;
  objective: string;
};

type TransitionFormState = {
  nextState: AgentWorkOrderState;
  eventType: AgentWorkspaceWorkOrderEventType | "auto";
  assignedReviewerId: string;
  resultSummary: string;
  failureReason: string;
  timeSavedMinutes: string;
  frictionReducedPct: string;
  revenueImpactUsd: string;
  escalationRatePct: string;
  overrideRatePct: string;
  confidenceScore: string;
};

type GovernanceLedgerFormState = {
  actionType: AgentWorkspaceGovernanceActionType;
  reason: string;
  workOrderId: string;
  retentionUntil: string;
  legalHoldUntil: string;
  incidentSeverity: AgentWorkspaceIncidentSeverity;
};

const defaultFilters: FilterState = {
  state: "all",
  workOrderType: "all",
  assignedReviewerId: "",
  minRetryCount: "",
  governanceStatus: "all"
};

const agentWorkOrderStates: AgentWorkOrderState[] = [
  "drafted",
  "planned",
  "routed",
  "sandboxed",
  "trustqa-held",
  "human-review",
  "proof-ready",
  "blocked",
  "closed"
];

const transitionEventOptions: Array<{ value: AgentWorkspaceWorkOrderEventType | "auto"; label: string }> = [
  { value: "auto", label: "Auto by state" },
  { value: "state-transitioned", label: "State transitioned" },
  { value: "reviewer-assigned", label: "Reviewer assigned" },
  { value: "reviewer-disposition-recorded", label: "Reviewer disposition recorded" },
  { value: "retry-recorded", label: "Retry recorded" },
  { value: "work-order-blocked", label: "Work order blocked" },
  { value: "work-order-closed", label: "Work order closed" }
];

const agentWorkspaceGovernanceStatuses: AgentWorkspaceGovernanceStatus[] = [
  "active",
  "needs-review",
  "blocked",
  "proof-ready",
  "closed"
];

const governanceActionOptions: Array<{ value: AgentWorkspaceGovernanceActionType; label: string }> = [
  { value: "retention-policy-recorded", label: "Retention policy recorded" },
  { value: "legal-hold-recorded", label: "Legal hold recorded" },
  { value: "legal-hold-released", label: "Legal hold released" },
  { value: "incident-export-requested", label: "Incident export requested" }
];

const incidentSeverityOptions: Array<{ value: AgentWorkspaceIncidentSeverity; label: string }> = [
  { value: "not-applicable", label: "Not applicable" },
  { value: "low", label: "Low" },
  { value: "moderate", label: "Moderate" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" }
];

const workOrderOptions: WorkOrderOption[] = [
  {
    type: "rcm-denial-appeal-generation",
    name: "RCM denial appeal generation",
    agentOwner: "PayerIQ + RCM Agent",
    defaultObjective:
      "Draft a reviewable denial appeal outline from synthetic claim context, payer policy evidence, missing documentation, and reviewer disposition.",
    modelRouterPolicy: "Metadata-only payer workflow; deny if live claim identifiers, member IDs, or PHI appear.",
    memoryScopes: ["session", "operational", "knowledge"],
    toolScopes: ["policy evidence retrieval", "claims metadata parser", "appeal outline generator"],
    reviewerCheckpoints: ["Payer or RCM review", "Governance review"],
    blockedActions: ["final coding", "payer submission", "reimbursement guarantee", "coverage determination"],
    trustCardRequirement: "Policy source, confidence, missing evidence, reviewer status, and no guarantee boundary.",
    salesPackage: "Synthetic Pilot Evaluation",
    predictiveBoundary: "Denial-risk signal review only; no coverage, coding, or reimbursement determination."
  },
  {
    type: "clinical-trial-matching",
    name: "Clinical trial matching",
    agentOwner: "TrialCore",
    defaultObjective:
      "Create a reviewable eligibility work order with criteria trace, exclusion flags, missing evidence, and research-review queue.",
    modelRouterPolicy:
      "Synthetic research workflow; deny patient outreach, enrollment claims, or treatment recommendation.",
    memoryScopes: ["session", "knowledge"],
    toolScopes: ["criteria parser", "trial evidence registry", "eligibility gap detector"],
    reviewerCheckpoints: ["Research review", "Clinical review", "Governance review"],
    blockedActions: [
      "patient outreach",
      "enrollment recommendation",
      "treatment recommendation",
      "live record ingestion"
    ],
    trustCardRequirement: "Trial source, eligibility criteria version, confidence, uncertainty, and research reviewer state.",
    salesPackage: "Workflow Intelligence Assessment",
    predictiveBoundary: "Eligibility gap surfacing only; no trial enrollment recommendation or patient contact."
  },
  {
    type: "pre-visit-chart-review",
    name: "Pre-visit chart review",
    agentOwner: "Sanar AI + CareExplain",
    defaultObjective:
      "Prepare a synthetic chart-review work order with risk signals, missing data, agenda prompts, and clinician review boundary.",
    modelRouterPolicy: "PHI-blocked until BAA, consent, FHIR profile validation, and clinician governance are approved.",
    memoryScopes: ["session", "operational", "knowledge"],
    toolScopes: ["FHIR context mapper", "missing-data detector", "agenda prompt generator"],
    reviewerCheckpoints: ["Clinical review", "Governance review"],
    blockedActions: ["diagnosis", "treatment recommendation", "patient instruction", "medical-record mutation"],
    trustCardRequirement: "Source trace, confidence, missing context, guideline/source version, and clinician reviewer status.",
    salesPackage: "AI Readiness + Governance Audit",
    predictiveBoundary: "Missing-data and risk-signal prompts only; no diagnosis, prognosis, or treatment guidance."
  },
  {
    type: "post-visit-care-plan-drafting",
    name: "Post-visit care plan drafting",
    agentOwner: "CareExplain + Perfect Chart",
    defaultObjective:
      "Draft review-only follow-up and care-plan support from synthetic context while preserving clinician authorship.",
    modelRouterPolicy: "PHI-blocked and clinician-held; deny autonomous patient instruction or order entry.",
    memoryScopes: ["session", "operational"],
    toolScopes: ["care-plan outline generator", "follow-up task planner", "patient education draft support"],
    reviewerCheckpoints: ["Clinical review", "Governance review"],
    blockedActions: ["order entry", "patient outreach", "final care plan", "clinical advice without clinician review"],
    trustCardRequirement: "Clinician reviewer status, source trace, uncertainty, patient-facing boundary, and blocked actions.",
    salesPackage: "Clinical Operations Automation Blueprint",
    predictiveBoundary: "Follow-up workflow drafting only; no autonomous patient instruction or care-plan finalization."
  },
  {
    type: "investor-outreach-tracking",
    name: "Investor outreach tracking",
    agentOwner: "Investor Agent",
    defaultObjective:
      "Track investor outreach tasks, diligence artifacts, follow-up state, proof surfaces, and non-confidential messaging boundaries.",
    modelRouterPolicy: "Business-contact and non-confidential company context only; deny PHI, secrets, and unsupported claims.",
    memoryScopes: ["session", "operational"],
    toolScopes: ["diligence brief builder", "follow-up tracker", "proof-route selector"],
    reviewerCheckpoints: ["Executive sponsor review", "Governance review"],
    blockedActions: [
      "financial misrepresentation",
      "unsupported medical claims",
      "PHI disclosure",
      "confidential buyer disclosure"
    ],
    trustCardRequirement: "Claims register status, proof route, update timestamp, and reviewer status.",
    salesPackage: "Investor and Enterprise Diligence Readiness",
    predictiveBoundary: "Pipeline forecasting support only; no investment advice or unsupported financial projections."
  },
  {
    type: "security-scan",
    name: "Security scan",
    agentOwner: "Governance Agent + Watchtower",
    defaultObjective:
      "Create a repeatable security-review work order that tracks headers, dependency posture, route boundaries, logs, and evidence gaps.",
    modelRouterPolicy: "No secrets in prompts; deny credential handling and production access tokens.",
    memoryScopes: ["operational", "knowledge"],
    toolScopes: ["quality gate runner", "runtime log review", "security-header inspector"],
    reviewerCheckpoints: ["Security review", "Governance review"],
    blockedActions: [
      "secrets capture",
      "credential rotation without owner",
      "claiming SOC 2/HIPAA certification",
      "destructive remediation"
    ],
    trustCardRequirement: "Evidence route, scan timestamp, severity, reviewer status, and remediation boundary.",
    salesPackage: "Enterprise Security Diligence",
    predictiveBoundary: "Control-gap trend detection only; no certification or formal risk rating."
  },
  {
    type: "data-transformation-job",
    name: "Data transformation job",
    agentOwner: "Interoperability Agent + DocuTwin",
    defaultObjective:
      "Plan synthetic transformations across forms, tables, referrals, claims, FHIR resources, HL7 messages, and evidence packets.",
    modelRouterPolicy: "Synthetic fixture transformation only; deny production data movement without connector and privacy approval.",
    memoryScopes: ["session", "operational", "knowledge"],
    toolScopes: ["schema mapper", "FHIR/HL7 validator", "fixture diff checker"],
    reviewerCheckpoints: ["Integration architect review", "Privacy review", "Governance review"],
    blockedActions: ["production data movement", "PHI export", "record mutation", "connector certification claim"],
    trustCardRequirement: "Source schema, target schema, validation status, fixture fingerprint, and reviewer status.",
    salesPackage: "Interoperability Readiness Assessment",
    predictiveBoundary: "Transformation-gap forecasting only; no production connector movement or record mutation."
  }
];

const readinessControls = [
  {
    area: "Legal",
    status: "Production-gated",
    control: "No work order is legal advice, regulatory advice, BAA approval, or production authorization.",
    nextGate: "Qualified counsel, customer contract, BAA/DPA path, and retention schedule approval."
  },
  {
    area: "Sales",
    status: "Pilot-ready",
    control: "Packets support non-binding enterprise diligence with claims-safe product language.",
    nextGate: "Buyer-specific scope, success criteria, procurement route, and final commercial terms."
  },
  {
    area: "Auditing",
    status: "Active control",
    control:
      "Create, transition, close, packet, retention, legal-hold, and incident-export actions write append-only evidence.",
    nextGate: "Customer-specific retention schedule, legal hold procedure, and incident owner approval."
  },
  {
    area: "Processing",
    status: "Synthetic-only",
    control: "No live PHI, payer submission, patient outreach, record mutation, or production connector execution.",
    nextGate: "Customer-approved processing register, consent path, connector review, and regional controls."
  },
  {
    area: "Continuous improvement",
    status: "Metric-capture ready",
    control: "Transitions capture outcome metrics for time saved, friction, revenue signal, escalation, override, and trust.",
    nextGate: "Validated metric definitions, reviewer QA, baseline comparison, and customer reporting cadence."
  },
  {
    area: "Predictive analytics",
    status: "Governed signal-only",
    control: "Predictive fields are limited to operational risk signals and missing-data prompts.",
    nextGate: "Clinical validation, model risk management, calibration, monitoring, and authorized human review."
  }
];

function displayValue(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function buildFilterQuery(filters: FilterState) {
  const params = new URLSearchParams();

  if (filters.state !== "all") {
    params.set("state", filters.state);
  }

  if (filters.workOrderType !== "all") {
    params.set("workOrderType", filters.workOrderType);
  }

  if (filters.assignedReviewerId.trim()) {
    params.set("assignedReviewerId", filters.assignedReviewerId.trim());
  }

  if (filters.minRetryCount.trim()) {
    params.set("minRetryCount", filters.minRetryCount.trim());
  }

  if (filters.governanceStatus !== "all") {
    params.set("governanceStatus", filters.governanceStatus);
  }

  return params.toString();
}

function latestEventSummary(events: AgentWorkspaceWorkOrderEventRecord[]) {
  const latestEvent = events[0];

  if (!latestEvent) {
    return "No work-order events are visible yet.";
  }

  return `${displayValue(latestEvent.eventType)} at ${formatDate(latestEvent.createdAt)}`;
}

function optionalMetric(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
}

function compactMetrics(metrics: Record<string, number | string | boolean | undefined>) {
  return Object.fromEntries(
    Object.entries(metrics).filter(([, value]) => value !== undefined && value !== "")
  );
}

function isoTimestampFromInput(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : value;
}

function selectedOptionForType(workOrderType: AgentWorkOrderType) {
  return workOrderOptions.find((option) => option.type === workOrderType) ?? workOrderOptions[0];
}

export default function AgentWorkspaceDashboardPanel({
  session,
  workspace,
  onAuditChanged
}: {
  session: Session;
  workspace: PilotWorkspaceRecord;
  onAuditChanged: () => Promise<void>;
}) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [createForm, setCreateForm] = useState<CreateFormState>({
    workOrderType: workOrderOptions[0].type,
    objective: workOrderOptions[0].defaultObjective
  });
  const [transitionForm, setTransitionForm] = useState<TransitionFormState>({
    nextState: "human-review",
    eventType: "auto",
    assignedReviewerId: "",
    resultSummary: "",
    failureReason: "",
    timeSavedMinutes: "",
    frictionReducedPct: "",
    revenueImpactUsd: "",
    escalationRatePct: "",
    overrideRatePct: "",
    confidenceScore: ""
  });
  const [governanceForm, setGovernanceForm] = useState<GovernanceLedgerFormState>({
    actionType: "retention-policy-recorded",
    reason:
      "Record synthetic pilot governance evidence for enterprise diligence and human-reviewed controls.",
    workOrderId: "",
    retentionUntil: "",
    legalHoldUntil: "",
    incidentSeverity: "moderate"
  });
  const [dashboard, setDashboard] = useState<AgentWorkspaceWorkOrderDashboard | null>(null);
  const [workOrders, setWorkOrders] = useState<AgentWorkspaceWorkOrderRecord[]>([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<AgentWorkspaceWorkOrderRecord | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<AgentWorkspaceWorkOrderEventRecord[]>([]);
  const [governanceLedgerDashboard, setGovernanceLedgerDashboard] =
    useState<AgentWorkspaceGovernanceLedgerDashboard | null>(null);
  const [governanceLedgerRecords, setGovernanceLedgerRecords] = useState<
    AgentWorkspaceGovernanceLedgerRecord[]
  >([]);
  const [status, setStatus] = useState<DashboardStatus>("loading");
  const [message, setMessage] = useState("");
  const query = useMemo(() => buildFilterQuery(filters), [filters]);
  const selectedTemplate = useMemo(
    () => selectedOptionForType(createForm.workOrderType),
    [createForm.workOrderType]
  );

  const loadWorkOrderDetail = useCallback(async (workOrder: AgentWorkspaceWorkOrderRecord, clearMessage = true) => {
    setSelectedWorkOrder(workOrder);
    if (clearMessage) setMessage("");
    const response = await fetch(
      `/api/agent-workspaces/${workspace.slug}/work-orders/${workOrder.id}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    const body = (await response.json()) as WorkOrderDetailResponse;

    if (!response.ok || !body.workOrder) {
      setMessage(body.error?.message ?? "The selected work-order event trail could not be loaded.");
      setSelectedEvents([]);
      return;
    }

    setSelectedWorkOrder(body.workOrder);
    setSelectedEvents(body.events ?? []);
  }, [session.access_token, workspace.slug]);

  const loadGovernanceLedger = useCallback(async (showErrors = false) => {
    const response = await fetch(`/api/agent-workspaces/${workspace.slug}/governance-ledger`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });
    const body = (await response.json()) as GovernanceLedgerResponse;

    if (!response.ok) {
      setGovernanceLedgerDashboard(null);
      setGovernanceLedgerRecords([]);
      if (showErrors) {
        setMessage(body.error?.message ?? "The Agent Workspace governance ledger could not be loaded.");
      }
      return;
    }

    setGovernanceLedgerDashboard(body.dashboard ?? null);
    setGovernanceLedgerRecords(body.ledgerRecords ?? []);
  }, [session.access_token, workspace.slug]);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setStatus("loading");
      setMessage("");
      const response = await fetch(
        `/api/agent-workspaces/${workspace.slug}/work-orders${query ? `?${query}` : ""}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      );
      const body = (await response.json()) as WorkOrderListResponse;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setStatus("error");
        setDashboard(null);
        setWorkOrders([]);
        setSelectedWorkOrder(null);
        setSelectedEvents([]);
        setMessage(
          body.error?.fields?.join(", ") ??
            body.error?.message ??
            "Agent Workspace work orders could not be loaded."
        );
        return;
      }

      const nextWorkOrders = body.workOrders ?? [];
      setDashboard(body.dashboard ?? null);
      setWorkOrders(nextWorkOrders);
      setStatus("ready");

      const nextSelected =
        nextWorkOrders.find((workOrder) => workOrder.id === selectedWorkOrder?.id) ??
        nextWorkOrders[0] ??
        null;

      if (nextSelected) {
        await loadWorkOrderDetail(nextSelected, false);
      } else {
        setSelectedWorkOrder(null);
        setSelectedEvents([]);
      }

      await loadGovernanceLedger();
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [loadGovernanceLedger, loadWorkOrderDetail, query, selectedWorkOrder?.id, session.access_token, workspace.slug]);

  async function refreshDashboard(successMessage?: string, preferredWorkOrderId?: string) {
    setStatus("loading");
    const response = await fetch(
      `/api/agent-workspaces/${workspace.slug}/work-orders${query ? `?${query}` : ""}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    const body = (await response.json()) as WorkOrderListResponse;

    if (!response.ok) {
      setStatus("error");
      setMessage(body.error?.message ?? "Agent Workspace work orders could not be refreshed.");
      return;
    }

    const nextWorkOrders = body.workOrders ?? [];
    const nextSelected =
      nextWorkOrders.find((workOrder) => workOrder.id === preferredWorkOrderId) ??
      nextWorkOrders.find((workOrder) => workOrder.id === selectedWorkOrder?.id) ??
      nextWorkOrders[0] ??
      null;
    setDashboard(body.dashboard ?? null);
    setWorkOrders(nextWorkOrders);

    if (nextSelected) {
      await loadWorkOrderDetail(nextSelected, false);
    } else {
      setSelectedWorkOrder(null);
      setSelectedEvents([]);
    }

    setStatus("ready");
    setMessage(successMessage ?? "");
    await loadGovernanceLedger();
  }

  function applyQueueFilter(nextFilters: Partial<FilterState>) {
    setFilters((current) => ({ ...current, ...nextFilters }));
  }

  async function createWorkOrder() {
    setStatus("saving");
    setMessage("");
    const response = await fetch(`/api/agent-workspaces/${workspace.slug}/work-orders`, {
      body: JSON.stringify({
        workOrderType: createForm.workOrderType,
        objective: createForm.objective.trim() || selectedTemplate.defaultObjective,
        agentOwner: selectedTemplate.agentOwner,
        modelRouterPolicy: selectedTemplate.modelRouterPolicy,
        memoryScopes: selectedTemplate.memoryScopes,
        toolScopes: selectedTemplate.toolScopes,
        reviewerCheckpoints: selectedTemplate.reviewerCheckpoints,
        blockedActions: selectedTemplate.blockedActions,
        trustCard: {
          requirement: selectedTemplate.trustCardRequirement,
          validationStatus: "human-review-required",
          sourceAttribution: "SCRIMED governed synthetic work-order template",
          confidence: "not-clinically-validated",
          salesPackage: selectedTemplate.salesPackage,
          predictiveAnalyticsBoundary: selectedTemplate.predictiveBoundary,
          legalBoundary: "Not legal advice, clinical advice, certification, or production authorization.",
          syntheticOnly: true,
          updated: new Date().toISOString()
        }
      }),
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });
    const body = (await response.json()) as WorkOrderMutationResponse;

    if (!response.ok) {
      setStatus("error");
      setMessage(
        body.error?.fields?.join(", ") ??
          body.error?.message ??
          "The governed work order could not be created."
      );
      return;
    }

    const createdId = body.workOrder?.id;
    await refreshDashboard("Governed synthetic work order created and committed to audit.", createdId);
    await onAuditChanged();
  }

  async function transitionSelectedWorkOrder() {
    if (!selectedWorkOrder) {
      setMessage("Select a work order before recording a governed transition.");
      return;
    }

    setStatus("saving");
    setMessage("");
    const outcomeMetrics = compactMetrics({
      timeSavedMinutes: optionalMetric(transitionForm.timeSavedMinutes),
      workflowFrictionReducedPct: optionalMetric(transitionForm.frictionReducedPct),
      revenueImpactUsd: optionalMetric(transitionForm.revenueImpactUsd),
      escalationRatePct: optionalMetric(transitionForm.escalationRatePct),
      overrideRatePct: optionalMetric(transitionForm.overrideRatePct),
      confidenceScore: optionalMetric(transitionForm.confidenceScore),
      syntheticOnly: true
    });
    const payload: Record<string, unknown> = {
      nextState: transitionForm.nextState,
      eventMetadata: {
        governancePurpose: "tenant-agent-workspace-transition",
        legalBoundary: "Not legal advice, clinical advice, compliance certification, or production authorization.",
        salesBoundary: "Non-binding pilot evidence only; final sales terms and success criteria require written approval.",
        auditBoundary: "Append-only synthetic work-order event and pilot audit event.",
        processingBoundary: "Synthetic-only; no live PHI, payer submission, patient outreach, or record mutation.",
        continuousImprovement: "Outcome metrics are directional pilot evidence until customer baseline validation.",
        predictiveAnalyticsBoundary:
          selectedOptionForType(selectedWorkOrder.workOrderType).predictiveBoundary,
        syntheticOnly: true
      },
      resultSummary: transitionForm.resultSummary,
      outcomeMetrics,
      failureReason: transitionForm.failureReason,
      assignedReviewerId: transitionForm.assignedReviewerId.trim() || null
    };

    if (transitionForm.eventType !== "auto") {
      payload.eventType = transitionForm.eventType;
    }

    const response = await fetch(
      `/api/agent-workspaces/${workspace.slug}/work-orders/${selectedWorkOrder.id}`,
      {
        body: JSON.stringify(payload),
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        method: "PATCH"
      }
    );
    const body = (await response.json()) as WorkOrderMutationResponse;

    if (!response.ok) {
      setStatus("error");
      setMessage(
        body.error?.fields?.join(", ") ??
          body.error?.message ??
          "The governed work-order transition could not be recorded."
      );
      return;
    }

    setTransitionForm((current) => ({
      ...current,
      resultSummary: "",
      failureReason: "",
      timeSavedMinutes: "",
      frictionReducedPct: "",
      revenueImpactUsd: "",
      escalationRatePct: "",
      overrideRatePct: "",
      confidenceScore: ""
    }));
    await refreshDashboard("Governed work-order transition recorded with audit evidence.", selectedWorkOrder.id);
    await onAuditChanged();
  }

  function governanceLedgerPayload(actionType: AgentWorkspaceGovernanceActionType = governanceForm.actionType) {
    return {
      actionType,
      reason: governanceForm.reason,
      workOrderId: governanceForm.workOrderId || null,
      retentionUntil:
        actionType === "retention-policy-recorded"
          ? isoTimestampFromInput(governanceForm.retentionUntil)
          : null,
      legalHoldUntil:
        actionType === "legal-hold-recorded"
          ? isoTimestampFromInput(governanceForm.legalHoldUntil)
          : null,
      incidentSeverity:
        actionType === "incident-export-requested" ? governanceForm.incidentSeverity : "not-applicable",
      eventMetadata: {
        governancePurpose: "agent-workspace-control-evidence",
        selectedWorkOrderId: governanceForm.workOrderId || null,
        dashboardVisibleWorkOrders: dashboard?.visibleWorkOrders ?? workOrders.length,
        activeLegalHolds: governanceLedgerDashboard?.activeLegalHolds ?? 0,
        activeRetentionPolicies: governanceLedgerDashboard?.activeRetentionPolicies ?? 0,
        legalBoundary: "Not legal advice, regulatory advice, compliance certification, or production authorization.",
        processingBoundary: "Synthetic-only; no live PHI, payer submission, patient outreach, or record mutation.",
        syntheticOnly: true,
        recordedFrom: "pilot-workspace-agent-workspace-dashboard",
        recordedAt: new Date().toISOString()
      }
    };
  }

  async function recordGovernanceLedgerAction() {
    setStatus("saving");
    setMessage("");
    const response = await fetch(`/api/agent-workspaces/${workspace.slug}/governance-ledger`, {
      body: JSON.stringify(governanceLedgerPayload()),
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });
    const body = (await response.json()) as GovernanceLedgerResponse;

    if (!response.ok) {
      setStatus("error");
      setMessage(
        body.error?.fields?.join(", ") ??
          body.error?.message ??
          "The governance-ledger action could not be recorded."
      );
      return;
    }

    await loadGovernanceLedger(true);
    setStatus("ready");
    setMessage("Server-audited governance ledger action recorded.");
    await onAuditChanged();
  }

  async function downloadIncidentExport() {
    setStatus("saving");
    setMessage("");
    const response = await fetch(
      `/api/agent-workspaces/${workspace.slug}/governance-ledger/incident-export`,
      {
        body: JSON.stringify(governanceLedgerPayload("incident-export-requested")),
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        method: "POST"
      }
    );

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as GovernanceLedgerResponse;
      setStatus("error");
      setMessage(body.error?.message ?? "The server-audited incident export could not be downloaded.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${workspace.slug}-agent-workspace-incident-export.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    await loadGovernanceLedger(true);
    setStatus("ready");
    setMessage("Server-audited incident export downloaded and governance ledger evidence committed.");
    await onAuditChanged();
  }

  function downloadGovernanceExport() {
    const generatedAt = new Date().toISOString();
    const selectedWorkOrderSection = selectedWorkOrder
      ? [
          `## Selected Work Order`,
          `- ID: ${selectedWorkOrder.id}`,
          `- Type: ${displayValue(selectedWorkOrder.workOrderType)}`,
          `- State: ${displayValue(selectedWorkOrder.state)}`,
          `- Agent owner: ${selectedWorkOrder.agentOwner}`,
          `- Reviewer: ${selectedWorkOrder.assignedReviewerId ?? "Unassigned"}`,
          `- Retry count: ${selectedWorkOrder.retryCount}`,
          `- Latest event: ${latestEventSummary(selectedEvents)}`,
          `- Predictive analytics boundary: ${selectedOptionForType(selectedWorkOrder.workOrderType).predictiveBoundary}`
        ].join("\n")
      : "## Selected Work Order\n- None selected.";
    const exportText = [
      `# SCRIMED Agent Workspace Governance Export`,
      ``,
      `Generated: ${generatedAt}`,
      `Workspace: ${workspace.name} (${workspace.slug})`,
      `Boundary: synthetic pilot and enterprise evaluation only.`,
      ``,
      `## Dashboard Snapshot`,
      `- Visible work orders: ${dashboard?.visibleWorkOrders ?? workOrders.length}`,
      `- Review held: ${dashboard?.reviewerQueue.reviewHeld ?? 0}`,
      `- Retry queue: ${dashboard?.retryQueue.workOrdersWithRetries ?? 0}`,
      `- Unassigned: ${dashboard?.reviewerQueue.unassigned ?? 0}`,
      `- Governance ledger entries: ${governanceLedgerDashboard?.totalLedgerEntries ?? governanceLedgerRecords.length}`,
      `- Active legal holds: ${governanceLedgerDashboard?.activeLegalHolds ?? 0}`,
      `- Active retention policies: ${governanceLedgerDashboard?.activeRetentionPolicies ?? 0}`,
      `- Incident exports: ${governanceLedgerDashboard?.incidentExports ?? 0}`,
      ``,
      selectedWorkOrderSection,
      ``,
      `## Enterprise Readiness Controls`,
      ...readinessControls.map(
        (control) =>
          `- ${control.area}: ${control.status}. ${control.control} Next gate: ${control.nextGate}`
      ),
      ``,
      `## Limitations`,
      `- This export is local dashboard evidence, not a server-audited proof-packet event.`,
      `- Use work-order proof packets and server incident exports for audited packet evidence.`,
      `- Live PHI, autonomous clinical execution, payer submission, patient outreach, and production connector use remain blocked.`
    ].join("\n");
    const blob = new Blob([exportText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${workspace.slug}-agent-workspace-governance-export.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMessage("Governance export generated locally. Audited evidence remains tied to server packet downloads.");
  }

  async function downloadWorkOrderProofPacket(workOrder: AgentWorkspaceWorkOrderRecord) {
    setStatus("saving");
    setMessage("");
    const response = await fetch(
      `/api/agent-workspaces/${workspace.slug}/work-orders/${workOrder.id}/proof-packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as WorkOrderDetailResponse;
      setStatus("error");
      setMessage(body.error?.message ?? "The audited Agent Workspace proof packet could not be downloaded.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${workspace.slug}-${workOrder.id}-work-order-proof-packet.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    await refreshDashboard("Work-order proof packet downloaded and append-only audit evidence committed.");
    await onAuditChanged();
  }

  return (
    <section
      className="table-section decision-ledger agent-workspace-dashboard"
      aria-label="Agent Workspace work-order dashboard"
    >
      <div className="section-heading">
        <p className="eyebrow">Agent Workspace dashboard</p>
        <h2>Review persistent work orders, queue state, and retained audit evidence.</h2>
        <p className="section-copy">
          This tenant dashboard reads from RLS-scoped work-order records and downloads proof packets only after an
          append-only audit event is committed. Synthetic-only boundaries remain active.
        </p>
      </div>

      <div className="decision-ledger-summary">
        <article>
          <span>Visible work orders</span>
          <strong>{dashboard?.visibleWorkOrders ?? workOrders.length}</strong>
        </article>
        <article>
          <span>Review held</span>
          <strong>{dashboard?.reviewerQueue.reviewHeld ?? 0}</strong>
        </article>
        <article>
          <span>Retry queue</span>
          <strong>{dashboard?.retryQueue.workOrdersWithRetries ?? 0}</strong>
        </article>
        <article>
          <span>Unassigned</span>
          <strong>{dashboard?.reviewerQueue.unassigned ?? 0}</strong>
        </article>
      </div>

      <div className="agent-readiness-grid" aria-label="Enterprise readiness controls">
        {readinessControls.map((control) => (
          <article key={control.area}>
            <span>{control.area}</span>
            <strong>{control.status}</strong>
            <p>{control.control}</p>
            <small>{control.nextGate}</small>
          </article>
        ))}
      </div>

      <div className="evaluation-form decision-commit-form">
        <div className="form-section">
          <div>
            <p className="eyebrow">Server-audited governance ledger</p>
            <h3>Record retention, legal-hold, release, and incident-export evidence.</h3>
          </div>
          <div className="decision-ledger-summary">
            <article>
              <span>Ledger entries</span>
              <strong>{governanceLedgerDashboard?.totalLedgerEntries ?? governanceLedgerRecords.length}</strong>
            </article>
            <article>
              <span>Active holds</span>
              <strong>{governanceLedgerDashboard?.activeLegalHolds ?? 0}</strong>
            </article>
            <article>
              <span>Retention active</span>
              <strong>{governanceLedgerDashboard?.activeRetentionPolicies ?? 0}</strong>
            </article>
            <article>
              <span>Incident exports</span>
              <strong>{governanceLedgerDashboard?.incidentExports ?? 0}</strong>
            </article>
          </div>
          <div className="form-grid">
            <label className="form-field">
              <span>Ledger action</span>
              <select
                value={governanceForm.actionType}
                onChange={(event) =>
                  setGovernanceForm((current) => ({
                    ...current,
                    actionType: event.target.value as AgentWorkspaceGovernanceActionType
                  }))
                }
              >
                {governanceActionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Scope</span>
              <select
                value={governanceForm.workOrderId}
                onChange={(event) =>
                  setGovernanceForm((current) => ({ ...current, workOrderId: event.target.value }))
                }
              >
                <option value="">Workspace-level</option>
                {workOrders.map((workOrder) => (
                  <option key={workOrder.id} value={workOrder.id}>
                    {displayValue(workOrder.workOrderType)} - {displayValue(workOrder.state)}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Incident severity</span>
              <select
                disabled={governanceForm.actionType !== "incident-export-requested"}
                value={
                  governanceForm.actionType === "incident-export-requested"
                    ? governanceForm.incidentSeverity
                    : "not-applicable"
                }
                onChange={(event) =>
                  setGovernanceForm((current) => ({
                    ...current,
                    incidentSeverity: event.target.value as AgentWorkspaceIncidentSeverity
                  }))
                }
              >
                {incidentSeverityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Retention until</span>
              <input
                disabled={governanceForm.actionType !== "retention-policy-recorded"}
                onChange={(event) =>
                  setGovernanceForm((current) => ({ ...current, retentionUntil: event.target.value }))
                }
                type="datetime-local"
                value={governanceForm.retentionUntil}
              />
            </label>
            <label className="form-field">
              <span>Legal hold until</span>
              <input
                disabled={governanceForm.actionType !== "legal-hold-recorded"}
                onChange={(event) =>
                  setGovernanceForm((current) => ({ ...current, legalHoldUntil: event.target.value }))
                }
                type="datetime-local"
                value={governanceForm.legalHoldUntil}
              />
            </label>
            <label className="form-field form-field-wide">
              <span>Reason</span>
              <textarea
                onChange={(event) =>
                  setGovernanceForm((current) => ({ ...current, reason: event.target.value }))
                }
                value={governanceForm.reason}
              />
              <small>
                Synthetic pilot control evidence only. Live incident response, legal advice, and regulated data
                handling require authorized counsel, privacy, security, and customer owners.
              </small>
            </label>
          </div>
          <div className="form-actions">
            <button
              className="primary-action"
              disabled={status === "saving"}
              onClick={recordGovernanceLedgerAction}
              type="button"
            >
              Record Governance Ledger
            </button>
            <button
              className="secondary-action"
              disabled={status === "saving"}
              onClick={downloadIncidentExport}
              type="button"
            >
              Download Audited Incident Export
            </button>
            <button className="secondary-action" onClick={() => loadGovernanceLedger(true)} type="button">
              Refresh Ledger
            </button>
          </div>
          <div className="review-event-list">
            <h3>Recent governance ledger trail</h3>
            {governanceLedgerRecords.length > 0 ? (
              governanceLedgerRecords.slice(0, 5).map((record) => (
                <article key={record.id}>
                  <span>{displayValue(record.actionType)}</span>
                  <strong>
                    {record.incidentSeverity} · {record.workOrderId ?? "Workspace-level"}
                  </strong>
                  <small>{formatDate(record.createdAt)}</small>
                </article>
              ))
            ) : (
              <p>No governance ledger entries are visible for this workspace yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="evaluation-form decision-commit-form">
        <div className="form-section">
          <div>
            <p className="eyebrow">Governed work-order creation</p>
            <h3>Create a tenant-scoped synthetic work order.</h3>
          </div>
          <div className="form-grid">
            <label className="form-field">
              <span>Workflow template</span>
              <select
                value={createForm.workOrderType}
                onChange={(event) => {
                  const nextType = event.target.value as AgentWorkOrderType;
                  const nextTemplate = selectedOptionForType(nextType);
                  setCreateForm({
                    workOrderType: nextType,
                    objective: nextTemplate.defaultObjective
                  });
                }}
              >
                {workOrderOptions.map((template) => (
                  <option key={template.type} value={template.type}>
                    {template.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Agent owner</span>
              <input readOnly value={selectedTemplate.agentOwner} />
            </label>
            <label className="form-field form-field-wide">
              <span>Objective</span>
              <textarea
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, objective: event.target.value }))
                }
                value={createForm.objective}
              />
              <small>
                {selectedTemplate.salesPackage}. {selectedTemplate.predictiveBoundary}
              </small>
            </label>
          </div>
          <div className="form-actions">
            <button
              className="primary-action"
              disabled={status === "saving"}
              onClick={createWorkOrder}
              type="button"
            >
              Create Governed Work Order
            </button>
            <button className="secondary-action" onClick={downloadGovernanceExport} type="button">
              Download Governance Export
            </button>
          </div>
        </div>

        <div className="form-section">
          <div>
            <p className="eyebrow">Dashboard filters</p>
            <h3>Review queues, retries, and governance states.</h3>
          </div>
          <div className="form-grid">
            <label className="form-field">
              <span>State</span>
              <select
                value={filters.state}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    state: event.target.value as FilterState["state"]
                  }))
                }
              >
                <option value="all">All states</option>
                {agentWorkOrderStates.map((state) => (
                  <option key={state} value={state}>
                    {displayValue(state)}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Workflow type</span>
              <select
                value={filters.workOrderType}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    workOrderType: event.target.value as FilterState["workOrderType"]
                  }))
                }
              >
                <option value="all">All workflows</option>
                {workOrderOptions.map((template) => (
                  <option key={template.type} value={template.type}>
                    {template.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Governance status</span>
              <select
                value={filters.governanceStatus}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    governanceStatus: event.target.value as FilterState["governanceStatus"]
                  }))
                }
              >
                <option value="all">All governance states</option>
                {agentWorkspaceGovernanceStatuses.map((governanceStatus) => (
                  <option key={governanceStatus} value={governanceStatus}>
                    {displayValue(governanceStatus)}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Reviewer</span>
              <input
                onChange={(event) =>
                  setFilters((current) => ({ ...current, assignedReviewerId: event.target.value }))
                }
                placeholder="UUID or unassigned"
                value={filters.assignedReviewerId}
              />
            </label>
            <label className="form-field">
              <span>Minimum retries</span>
              <input
                inputMode="numeric"
                min="0"
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    minRetryCount: event.target.value.replace(/\D/g, "").slice(0, 2)
                  }))
                }
                placeholder="0"
                type="number"
                value={filters.minRetryCount}
              />
            </label>
          </div>
          <div className="form-actions">
            <button
              className="secondary-action"
              onClick={() => applyQueueFilter({ governanceStatus: "needs-review", state: "all" })}
              type="button"
            >
              Review Queue
            </button>
            <button
              className="secondary-action"
              onClick={() => applyQueueFilter({ assignedReviewerId: "unassigned" })}
              type="button"
            >
              Unassigned
            </button>
            <button
              className="secondary-action"
              onClick={() => applyQueueFilter({ minRetryCount: "1" })}
              type="button"
            >
              Retries
            </button>
            <button className="secondary-action" onClick={() => setFilters(defaultFilters)} type="button">
              Clear Filters
            </button>
          </div>
        </div>
        {message ? <div className="intake-alert">{message}</div> : null}
      </div>

      <div className="decision-ledger-grid">
        <div className="decision-list" aria-label="Agent Workspace work orders">
          {workOrders.length > 0 ? (
            workOrders.map((workOrder) => (
              <button
                className={`decision-list-item${selectedWorkOrder?.id === workOrder.id ? " decision-list-item-active" : ""}`}
                key={workOrder.id}
                onClick={() => loadWorkOrderDetail(workOrder)}
                type="button"
              >
                <span>{displayValue(workOrder.state)}</span>
                <strong>{displayValue(workOrder.workOrderType)}</strong>
                <small>
                  {workOrder.agentOwner} · {formatDate(workOrder.updatedAt)}
                </small>
              </button>
            ))
          ) : (
            <div className="decision-list-empty">
              <strong>{status === "loading" ? "Loading work orders." : "No visible work orders."}</strong>
              <p>
                {status === "error"
                  ? message
                  : "Create or transition persistent synthetic work orders through the protected Agent Workspace API."}
              </p>
            </div>
          )}
        </div>

        <div className="decision-detail">
          {selectedWorkOrder ? (
            <>
              <div className="decision-detail-heading">
                <div>
                  <span>{displayValue(selectedWorkOrder.state)}</span>
                  <h3>{selectedWorkOrder.objective}</h3>
                </div>
                <button
                  className="secondary-action"
                  disabled={status === "saving"}
                  onClick={() => downloadWorkOrderProofPacket(selectedWorkOrder)}
                  type="button"
                >
                  Download Work-Order Packet
                </button>
              </div>

              <div className="decision-metrics">
                <div>
                  <span>Reviewer</span>
                  <strong>{selectedWorkOrder.assignedReviewerId ?? "Unassigned"}</strong>
                </div>
                <div>
                  <span>Retries</span>
                  <strong>{selectedWorkOrder.retryCount}</strong>
                </div>
                <div>
                  <span>Last event</span>
                  <strong>{latestEventSummary(selectedEvents)}</strong>
                </div>
              </div>

              <ul className="compact-list">
                <li>
                  <strong>Agent owner:</strong> {selectedWorkOrder.agentOwner}
                </li>
                <li>
                  <strong>Model-router policy:</strong> {selectedWorkOrder.modelRouterPolicy}
                </li>
                <li>
                  <strong>Memory scopes:</strong> {selectedWorkOrder.memoryScopes.join(", ") || "None recorded"}
                </li>
                <li>
                  <strong>Tool scopes:</strong> {selectedWorkOrder.toolScopes.join(", ") || "None recorded"}
                </li>
                <li>
                  <strong>Blocked actions:</strong> {selectedWorkOrder.blockedActions.join(", ") || "None recorded"}
                </li>
              </ul>

              <div className="evaluation-form governance-review-form">
                <div>
                  <p className="eyebrow">Governed transition</p>
                  <h3>Record reviewer movement, outcome metrics, or controlled blockage.</h3>
                </div>
                <div className="form-grid">
                  <label className="form-field">
                    <span>Next state</span>
                    <select
                      value={transitionForm.nextState}
                      onChange={(event) =>
                        setTransitionForm((current) => ({
                          ...current,
                          nextState: event.target.value as AgentWorkOrderState
                        }))
                      }
                    >
                      {agentWorkOrderStates.map((state) => (
                        <option key={state} value={state}>
                          {displayValue(state)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="form-field">
                    <span>Event type</span>
                    <select
                      value={transitionForm.eventType}
                      onChange={(event) =>
                        setTransitionForm((current) => ({
                          ...current,
                          eventType: event.target.value as TransitionFormState["eventType"]
                        }))
                      }
                    >
                      {transitionEventOptions.map((eventType) => (
                        <option key={eventType.value} value={eventType.value}>
                          {eventType.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="form-field">
                    <span>Assigned reviewer UUID</span>
                    <input
                      onChange={(event) =>
                        setTransitionForm((current) => ({
                          ...current,
                          assignedReviewerId: event.target.value
                        }))
                      }
                      placeholder="Optional reviewer user id"
                      value={transitionForm.assignedReviewerId}
                    />
                  </label>
                  <label className="form-field">
                    <span>Confidence score</span>
                    <input
                      inputMode="decimal"
                      onChange={(event) =>
                        setTransitionForm((current) => ({
                          ...current,
                          confidenceScore: event.target.value
                        }))
                      }
                      placeholder="0-100"
                      value={transitionForm.confidenceScore}
                    />
                  </label>
                  <label className="form-field form-field-wide">
                    <span>Result summary</span>
                    <textarea
                      onChange={(event) =>
                        setTransitionForm((current) => ({
                          ...current,
                          resultSummary: event.target.value
                        }))
                      }
                      placeholder="Reviewer-safe synthetic result summary"
                      value={transitionForm.resultSummary}
                    />
                  </label>
                  <label className="form-field form-field-wide">
                    <span>Failure reason</span>
                    <textarea
                      onChange={(event) =>
                        setTransitionForm((current) => ({
                          ...current,
                          failureReason: event.target.value
                        }))
                      }
                      placeholder="Required when blocking a work order"
                      value={transitionForm.failureReason}
                    />
                  </label>
                  <label className="form-field">
                    <span>Time saved minutes</span>
                    <input
                      inputMode="decimal"
                      onChange={(event) =>
                        setTransitionForm((current) => ({
                          ...current,
                          timeSavedMinutes: event.target.value
                        }))
                      }
                      value={transitionForm.timeSavedMinutes}
                    />
                  </label>
                  <label className="form-field">
                    <span>Friction reduced %</span>
                    <input
                      inputMode="decimal"
                      onChange={(event) =>
                        setTransitionForm((current) => ({
                          ...current,
                          frictionReducedPct: event.target.value
                        }))
                      }
                      value={transitionForm.frictionReducedPct}
                    />
                  </label>
                  <label className="form-field">
                    <span>Revenue signal USD</span>
                    <input
                      inputMode="decimal"
                      onChange={(event) =>
                        setTransitionForm((current) => ({
                          ...current,
                          revenueImpactUsd: event.target.value
                        }))
                      }
                      value={transitionForm.revenueImpactUsd}
                    />
                  </label>
                  <label className="form-field">
                    <span>Escalation rate %</span>
                    <input
                      inputMode="decimal"
                      onChange={(event) =>
                        setTransitionForm((current) => ({
                          ...current,
                          escalationRatePct: event.target.value
                        }))
                      }
                      value={transitionForm.escalationRatePct}
                    />
                  </label>
                  <label className="form-field">
                    <span>Override rate %</span>
                    <input
                      inputMode="decimal"
                      onChange={(event) =>
                        setTransitionForm((current) => ({
                          ...current,
                          overrideRatePct: event.target.value
                        }))
                      }
                      value={transitionForm.overrideRatePct}
                    />
                  </label>
                </div>
                <div className="form-actions">
                  <button
                    className="primary-action"
                    disabled={status === "saving"}
                    onClick={transitionSelectedWorkOrder}
                    type="button"
                  >
                    Record Governed Transition
                  </button>
                </div>
              </div>

              <div className="review-event-list">
                <h3>Retained work-order event trail</h3>
                {selectedEvents.length > 0 ? (
                  selectedEvents.map((event) => (
                    <article key={event.id}>
                      <span>{displayValue(event.eventType)}</span>
                      <strong>
                        {event.priorState ? displayValue(event.priorState) : "Created"} -&gt;{" "}
                        {displayValue(event.nextState)}
                      </strong>
                      <small>{formatDate(event.createdAt)}</small>
                    </article>
                  ))
                ) : (
                  <p>No event trail is visible for this work order yet.</p>
                )}
              </div>
            </>
          ) : (
            <div className="decision-list-empty">
              <strong>Select a work order.</strong>
              <p>Reviewer queue, retry state, Trust Card evidence, and packet export actions will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
