"use client";

import type { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  AgentWorkspaceGovernanceStatus,
  AgentWorkspaceWorkOrderDashboard,
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

type DashboardStatus = "loading" | "ready" | "saving" | "error";

type FilterState = {
  state: AgentWorkOrderState | "all";
  workOrderType: AgentWorkOrderType | "all";
  assignedReviewerId: string;
  minRetryCount: string;
  governanceStatus: AgentWorkspaceGovernanceStatus | "all";
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

const agentWorkspaceGovernanceStatuses: AgentWorkspaceGovernanceStatus[] = [
  "active",
  "needs-review",
  "blocked",
  "proof-ready",
  "closed"
];

const workOrderOptions: Array<{ type: AgentWorkOrderType; name: string }> = [
  { type: "rcm-denial-appeal-generation", name: "RCM denial appeal generation" },
  { type: "clinical-trial-matching", name: "Clinical trial matching" },
  { type: "pre-visit-chart-review", name: "Pre-visit chart review" },
  { type: "post-visit-care-plan-drafting", name: "Post-visit care plan drafting" },
  { type: "investor-outreach-tracking", name: "Investor outreach tracking" },
  { type: "security-scan", name: "Security scan" },
  { type: "data-transformation-job", name: "Data transformation job" }
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
  const [dashboard, setDashboard] = useState<AgentWorkspaceWorkOrderDashboard | null>(null);
  const [workOrders, setWorkOrders] = useState<AgentWorkspaceWorkOrderRecord[]>([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<AgentWorkspaceWorkOrderRecord | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<AgentWorkspaceWorkOrderEventRecord[]>([]);
  const [status, setStatus] = useState<DashboardStatus>("loading");
  const [message, setMessage] = useState("");
  const query = useMemo(() => buildFilterQuery(filters), [filters]);

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
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [loadWorkOrderDetail, query, selectedWorkOrder?.id, session.access_token, workspace.slug]);

  async function refreshDashboard(successMessage?: string) {
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
  }

  function applyQueueFilter(nextFilters: Partial<FilterState>) {
    setFilters((current) => ({ ...current, ...nextFilters }));
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

      <div className="evaluation-form decision-commit-form">
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
