"use client";

import type { Session } from "@supabase/supabase-js";
import { useMemo, useState } from "react";
import type {
  ProtectedBuyerReleaseReadinessTimeline,
  ProtectedBuyerReleaseReadinessTimelineEvent
} from "../lib/protectedBuyerReleaseReadinessTimeline";
import type {
  ProtectedBuyerReleaseControlGate,
  ProtectedBuyerReleaseControlGateState,
  ProtectedBuyerReleaseControlRun
} from "../lib/protectedBuyerReleaseControlRun";
import type {
  ProtectedBuyerReleaseGateReconciliation
} from "../lib/protectedBuyerReleaseGateReconciliation";
import type {
  ProtectedBuyerReleaseMetadataDraftSet
} from "../lib/protectedBuyerReleaseMetadataDrafts";
import type {
  ProtectedBuyerReleaseDraftChecklist
} from "../lib/protectedBuyerReleaseDraftChecklist";
import type {
  ProtectedBuyerReleaseRemediationPlan,
  ProtectedBuyerReleaseRemediationStepState
} from "../lib/protectedBuyerReleaseRemediationPlan";
import type { PilotWorkspaceRecord } from "../lib/protectedPilotWorkspace";

type VerifierStatus = "idle" | "loading" | "ready" | "downloading" | "error";

type VerifierResponse = {
  boundary?: string;
  error?: { code?: string; message?: string };
  run?: ProtectedBuyerReleaseControlRun;
  status?: string;
};

type TimelineResponse = {
  boundary?: string;
  error?: { code?: string; message?: string };
  status?: string;
  timeline?: ProtectedBuyerReleaseReadinessTimeline;
};

type RemediationResponse = {
  boundary?: string;
  error?: { code?: string; message?: string };
  remediationPlan?: ProtectedBuyerReleaseRemediationPlan;
  run?: ProtectedBuyerReleaseControlRun;
  status?: string;
};

type ReconciliationResponse = {
  boundary?: string;
  error?: { code?: string; message?: string };
  reconciliation?: ProtectedBuyerReleaseGateReconciliation;
  remediationPlan?: ProtectedBuyerReleaseRemediationPlan;
  run?: ProtectedBuyerReleaseControlRun;
  status?: string;
};

type MetadataDraftsResponse = {
  boundary?: string;
  error?: { code?: string; message?: string };
  metadataDrafts?: ProtectedBuyerReleaseMetadataDraftSet;
  reconciliation?: ProtectedBuyerReleaseGateReconciliation;
  remediationPlan?: ProtectedBuyerReleaseRemediationPlan;
  run?: ProtectedBuyerReleaseControlRun;
  status?: string;
};

type DraftChecklistResponse = {
  boundary?: string;
  draftChecklist?: ProtectedBuyerReleaseDraftChecklist;
  error?: { code?: string; message?: string };
  metadataDrafts?: ProtectedBuyerReleaseMetadataDraftSet;
  reconciliation?: ProtectedBuyerReleaseGateReconciliation;
  remediationPlan?: ProtectedBuyerReleaseRemediationPlan;
  run?: ProtectedBuyerReleaseControlRun;
  status?: string;
};

const boundary =
  "This verifier uses the active AAL2 browser session to read tenant-scoped release-control metadata. It does not store bearer tokens, approve external sharing, authorize PHI processing, certify security, guarantee reimbursement, or permit live clinical execution.";

function stateLabel(state: ProtectedBuyerReleaseControlGateState) {
  if (state === "ready") return "Ready";
  if (state === "blocked") return "Blocked";
  return "Review";
}

function stateClass(state: ProtectedBuyerReleaseControlGateState) {
  if (state === "ready") return "status-pill status-pill-pass";
  if (state === "blocked") return "status-pill status-pill-fail";
  return "status-pill status-pill-warn";
}

function safeFilename(value: string) {
  return value.replace(/[^a-z0-9-]/gi, "-").slice(0, 80) || "workspace";
}

async function readErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as VerifierResponse;
    return body.error?.message ?? body.error?.code ?? response.statusText;
  } catch {
    return response.statusText;
  }
}

function gateSummary(gates: ProtectedBuyerReleaseControlGate[]) {
  const firstBlocked = gates.find((gate) => gate.state === "blocked");
  const firstReview = gates.find((gate) => gate.state === "review");

  if (firstBlocked) return firstBlocked.nextAction;
  if (firstReview) return firstReview.nextAction;
  return "All verifier gates are ready for qualified human release review; this remains not release approval.";
}

function timelineKindLabel(kind: ProtectedBuyerReleaseReadinessTimelineEvent["kind"]) {
  if (kind === "verifier-read") return "Verifier read";
  if (kind === "gate-record") return "Gate record";
  if (kind === "gate-packet") return "Gate packet";
  if (kind === "chain-packet") return "Chain packet";
  return "Human review";
}

function remediationStateLabel(state: ProtectedBuyerReleaseRemediationStepState) {
  if (state === "complete") return "Complete";
  if (state === "waiting-on-human") return "Human review";
  return "Blocked";
}

function remediationStateClass(state: ProtectedBuyerReleaseRemediationStepState) {
  if (state === "complete") return "status-pill status-pill-pass";
  if (state === "waiting-on-human") return "status-pill status-pill-warn";
  return "status-pill status-pill-fail";
}

function metadataValueLabel(value: string | number | boolean | string[]) {
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "none";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function draftChecklistStatusLabel(
  state: ProtectedBuyerReleaseDraftChecklist["items"][number]["schemaStatus"]
) {
  if (state === "schema-ready-human-review-required") return "Schema ready";
  if (state === "blocked-on-prerequisite-records") return "Prerequisite";
  if (state === "blocked-on-draft-corrections") return "Correction";
  return "Unsupported";
}

function draftChecklistStatusClass(
  state: ProtectedBuyerReleaseDraftChecklist["items"][number]["schemaStatus"]
) {
  if (state === "schema-ready-human-review-required") return "status-pill status-pill-pass";
  if (state === "blocked-on-prerequisite-records") return "status-pill status-pill-warn";
  return "status-pill status-pill-fail";
}

export default function ProtectedBuyerReleaseControlRunPanel({
  onAuditChanged,
  session,
  workspace
}: {
  onAuditChanged: () => Promise<void>;
  session: Session;
  workspace: PilotWorkspaceRecord;
}) {
  const [status, setStatus] = useState<VerifierStatus>("idle");
  const [message, setMessage] = useState("");
  const [run, setRun] = useState<ProtectedBuyerReleaseControlRun | null>(null);
  const [reconciliation, setReconciliation] = useState<ProtectedBuyerReleaseGateReconciliation | null>(null);
  const [metadataDrafts, setMetadataDrafts] = useState<ProtectedBuyerReleaseMetadataDraftSet | null>(null);
  const [draftChecklist, setDraftChecklist] = useState<ProtectedBuyerReleaseDraftChecklist | null>(null);
  const [remediationPlan, setRemediationPlan] = useState<ProtectedBuyerReleaseRemediationPlan | null>(null);
  const [timeline, setTimeline] = useState<ProtectedBuyerReleaseReadinessTimeline | null>(null);
  const [verifiedAt, setVerifiedAt] = useState<string | null>(null);

  const verifierRoute = `/api/pilot-workspaces/${workspace.slug}/buyer-release-control-run`;
  const packetRoute = `/api/pilot-workspaces/${workspace.slug}/buyer-release-control-run/packet`;
  const timelineRoute = `/api/pilot-workspaces/${workspace.slug}/buyer-release-control-run/timeline`;
  const remediationRoute = `/api/pilot-workspaces/${workspace.slug}/buyer-release-control-run/remediation`;
  const reconciliationRoute = `/api/pilot-workspaces/${workspace.slug}/buyer-release-control-run/reconciliation`;
  const metadataDraftsRoute = `/api/pilot-workspaces/${workspace.slug}/buyer-release-control-run/metadata-drafts`;
  const draftChecklistRoute = `/api/pilot-workspaces/${workspace.slug}/buyer-release-control-run/metadata-drafts/checklist`;
  const summary = useMemo(
    () =>
      run
        ? {
            blocked: run.blockedGateCount,
            next: gateSummary(run.gates),
            ready: run.readyGateCount,
            review: run.reviewGateCount,
            score: run.score,
            total: run.gateCount
          }
        : {
            blocked: 0,
            next: "Run the verifier with the active workspace session.",
            ready: 0,
            review: 0,
            score: 0,
            total: 8
          },
    [run]
  );

  async function loadTimeline({ quiet = false }: { quiet?: boolean } = {}) {
    if (!quiet) {
      setStatus("loading");
      setMessage("Loading release-readiness timeline with the active AAL2 browser session.");
    }

    try {
      const response = await fetch(timelineRoute, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const detail = await readErrorMessage(response);
        setStatus("error");
        setMessage(`${response.status} ${detail}`);
        return null;
      }

      const body = (await response.json()) as TimelineResponse;

      if (!body.timeline) {
        setStatus("error");
        setMessage("The timeline response did not include release-readiness events.");
        return null;
      }

      setTimeline(body.timeline);
      setStatus("ready");

      if (!quiet) {
        setMessage(
          "Release-readiness timeline loaded. Verifier reads are ephemeral; audited packets remain the durable proof path."
        );
      }

      return body.timeline;
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Release-readiness timeline failed to load.");
      return null;
    }
  }

  async function loadRemediationPlan({ quiet = false }: { quiet?: boolean } = {}) {
    if (!quiet) {
      setStatus("loading");
      setMessage("Loading release-control remediation plan with the active AAL2 browser session.");
    }

    try {
      const response = await fetch(remediationRoute, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const detail = await readErrorMessage(response);
        setStatus("error");
        setMessage(`${response.status} ${detail}`);
        return null;
      }

      const body = (await response.json()) as RemediationResponse;

      if (!body.remediationPlan) {
        setStatus("error");
        setMessage("The remediation response did not include an operator plan.");
        return null;
      }

      setRemediationPlan(body.remediationPlan);

      if (body.run) {
        setRun(body.run);
        setVerifiedAt(new Date().toISOString());
      }

      setStatus("ready");

      if (!quiet) {
        setMessage(
          body.remediationPlan.operatorDecision === "do-not-share"
            ? "Remediation plan loaded. Buyer sharing stays disabled while blocked gates remain."
            : "Remediation plan loaded. Pause for qualified human release review; this is still not release approval."
        );
      }

      return body.remediationPlan;
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Release-control remediation plan failed to load.");
      return null;
    }
  }

  async function loadReconciliation({ quiet = false }: { quiet?: boolean } = {}) {
    if (!quiet) {
      setStatus("loading");
      setMessage("Loading gate evidence reconciliation with the active AAL2 browser session.");
    }

    try {
      const response = await fetch(reconciliationRoute, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const detail = await readErrorMessage(response);
        setStatus("error");
        setMessage(`${response.status} ${detail}`);
        return null;
      }

      const body = (await response.json()) as ReconciliationResponse;

      if (!body.reconciliation) {
        setStatus("error");
        setMessage("The reconciliation response did not include gate evidence.");
        return null;
      }

      setReconciliation(body.reconciliation);

      if (body.remediationPlan) {
        setRemediationPlan(body.remediationPlan);
      }

      if (body.run) {
        setRun(body.run);
        setVerifiedAt(new Date().toISOString());
      }

      setStatus("ready");

      if (!quiet) {
        setMessage(
          body.reconciliation.operatorDecision === "do-not-share"
            ? "Gate reconciliation loaded. Missing items must be resolved before buyer sharing."
            : "Gate reconciliation loaded. Pause for qualified human release review; this is still not release approval."
        );
      }

      return body.reconciliation;
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Gate evidence reconciliation failed to load.");
      return null;
    }
  }

  async function loadMetadataDrafts({ quiet = false }: { quiet?: boolean } = {}) {
    if (!quiet) {
      setStatus("loading");
      setMessage("Loading safe metadata drafts with the active AAL2 browser session.");
    }

    try {
      const response = await fetch(metadataDraftsRoute, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const detail = await readErrorMessage(response);
        setStatus("error");
        setMessage(`${response.status} ${detail}`);
        return null;
      }

      const body = (await response.json()) as MetadataDraftsResponse;

      if (!body.metadataDrafts) {
        setStatus("error");
        setMessage("The metadata draft response did not include draft guidance.");
        return null;
      }

      setMetadataDrafts(body.metadataDrafts);

      if (body.reconciliation) {
        setReconciliation(body.reconciliation);
      }

      if (body.remediationPlan) {
        setRemediationPlan(body.remediationPlan);
      }

      if (body.run) {
        setRun(body.run);
        setVerifiedAt(new Date().toISOString());
      }

      setStatus("ready");

      if (!quiet) {
        setMessage(
          body.metadataDrafts.operatorDecision === "draft-only-do-not-share"
            ? "Safe metadata drafts loaded. Drafts are guidance only and must be reviewed before protected recording."
            : "Metadata drafts loaded. Pause for qualified human release review; this is still not release approval."
        );
      }

      return body.metadataDrafts;
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Safe metadata drafts failed to load.");
      return null;
    }
  }

  async function loadDraftChecklist({ quiet = false }: { quiet?: boolean } = {}) {
    if (!quiet) {
      setStatus("loading");
      setMessage("Prechecking metadata drafts against target protected write schemas.");
    }

    try {
      const response = await fetch(draftChecklistRoute, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const detail = await readErrorMessage(response);
        setStatus("error");
        setMessage(`${response.status} ${detail}`);
        return null;
      }

      const body = (await response.json()) as DraftChecklistResponse;

      if (!body.draftChecklist) {
        setStatus("error");
        setMessage("The draft checklist response did not include schema precheck results.");
        return null;
      }

      setDraftChecklist(body.draftChecklist);

      if (body.metadataDrafts) {
        setMetadataDrafts(body.metadataDrafts);
      }

      if (body.reconciliation) {
        setReconciliation(body.reconciliation);
      }

      if (body.remediationPlan) {
        setRemediationPlan(body.remediationPlan);
      }

      if (body.run) {
        setRun(body.run);
        setVerifiedAt(new Date().toISOString());
      }

      setStatus("ready");

      if (!quiet) {
        setMessage(
          body.draftChecklist.operatorDecision === "record-ready-after-qualified-human-review"
            ? "Draft checklist passed schema precheck. Qualified human review is still required before recording."
            : "Draft checklist loaded. Resolve prerequisites or corrections before recording protected metadata."
        );
      }

      return body.draftChecklist;
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Draft checklist failed to load.");
      return null;
    }
  }

  async function runVerifier() {
    setStatus("loading");
    setMessage("Reading release-control chain with the active AAL2 browser session.");

    try {
      const response = await fetch(verifierRoute, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const detail = await readErrorMessage(response);
        setStatus("error");
        setMessage(`${response.status} ${detail}`);
        return;
      }

      const body = (await response.json()) as VerifierResponse;

      if (!body.run) {
        setStatus("error");
        setMessage("The verifier response did not include a release-control run.");
        return;
      }

      setRun(body.run);
      setVerifiedAt(new Date().toISOString());
      setStatus("ready");
      await loadTimeline({ quiet: true });
      await loadRemediationPlan({ quiet: true });
      await loadReconciliation({ quiet: true });
      await loadMetadataDrafts({ quiet: true });
      await loadDraftChecklist({ quiet: true });
      setMessage(
        body.run.chainState === "ready"
          ? "Release-control chain is ready for qualified human release review. This is still not release approval."
          : "Release-control chain loaded. Resolve blocked or review gates before external buyer sharing."
      );
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Release-control verification failed.");
    }
  }

  async function downloadPacket() {
    setStatus("downloading");
    setMessage("Generating audited release-control chain packet with the active AAL2 browser session.");

    try {
      const response = await fetch(packetRoute, {
        headers: {
          Accept: "text/markdown",
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const detail = await readErrorMessage(response);
        setStatus("error");
        setMessage(`${response.status} ${detail}`);
        return;
      }

      const text = await response.text();
      const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `scrimed-${safeFilename(workspace.slug)}-buyer-release-control-chain.md`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      await onAuditChanged();
      await loadTimeline({ quiet: true });
      setStatus("ready");
      setMessage("Audited release-control chain packet downloaded and audit events refreshed.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Release-control packet download failed.");
    }
  }

  return (
    <section
      className="table-section buyer-release-control-panel"
      id="buyer-release-control-verifier"
      aria-label="Protected buyer release-control verifier"
    >
      <div className="section-heading">
        <p className="eyebrow">Buyer release-control verifier</p>
        <h2>Verify buyer-specific sharing gates without copying bearer tokens.</h2>
        <p className="section-copy">{run?.boundary ?? boundary}</p>
        <div className="form-actions">
          <button
            className="primary-action"
            disabled={status === "loading" || status === "downloading"}
            onClick={runVerifier}
            type="button"
          >
            {status === "loading" ? "Running Verifier" : "Run Chain Verifier"}
          </button>
          <button
            className="secondary-action"
            disabled={status === "loading" || status === "downloading"}
            onClick={() => void loadTimeline()}
            type="button"
          >
            Load Readiness Timeline
          </button>
          <button
            className="secondary-action"
            disabled={status === "loading" || status === "downloading"}
            onClick={() => void loadRemediationPlan()}
            type="button"
          >
            Load Remediation Plan
          </button>
          <button
            className="secondary-action"
            disabled={status === "loading" || status === "downloading"}
            onClick={() => void loadReconciliation()}
            type="button"
          >
            Load Gate Reconciliation
          </button>
          <button
            className="secondary-action"
            disabled={status === "loading" || status === "downloading"}
            onClick={() => void loadMetadataDrafts()}
            type="button"
          >
            Load Metadata Drafts
          </button>
          <button
            className="secondary-action"
            disabled={status === "loading" || status === "downloading"}
            onClick={() => void loadDraftChecklist()}
            type="button"
          >
            Load Draft Checklist
          </button>
          <button
            className="secondary-action"
            disabled={status === "loading" || status === "downloading"}
            onClick={downloadPacket}
            type="button"
          >
            {status === "downloading" ? "Preparing Packet" : "Download Audited Chain Packet"}
          </button>
        </div>
        {message ? <div className="intake-alert">{message}</div> : null}
      </div>

      <div className="hub-summary demo-readiness-summary" aria-label="Buyer release-control verifier summary">
        <article>
          <span>Chain state</span>
          <strong>{run ? stateLabel(run.chainState) : "Pending"}</strong>
        </article>
        <article>
          <span>Score</span>
          <strong>{summary.score}%</strong>
        </article>
        <article>
          <span>Ready gates</span>
          <strong>
            {summary.ready}/{summary.total}
          </strong>
        </article>
        <article>
          <span>Review gates</span>
          <strong>{summary.review}</strong>
        </article>
        <article>
          <span>Blocked gates</span>
          <strong>{summary.blocked}</strong>
        </article>
        <article>
          <span>Verified</span>
          <strong>{verifiedAt ?? "not run"}</strong>
        </article>
      </div>

      <article className="module-row">
        <div>
          <span>{run?.releaseDecision ?? "protected-chain-pending"}</span>
          <h2>{run?.shareState ?? "Qualified human review required before buyer sharing."}</h2>
        </div>
        <strong className={run ? stateClass(run.chainState) : "status-pill"}>{run ? stateLabel(run.chainState) : "Pending"}</strong>
        <p>{run?.nextAction ?? summary.next}</p>
      </article>

      <div className="demo-runbook" aria-label="Buyer release-control gates">
        {(run?.gates ?? []).length > 0 ? (
          run?.gates.map((gate) => (
            <article className="module-row" key={gate.id}>
              <div>
                <span>{gate.latestAt ?? "pending signal"}</span>
                <h2>{gate.label}</h2>
              </div>
              <strong className={stateClass(gate.state)}>{stateLabel(gate.state)}</strong>
              <p>{gate.evidence}</p>
              <div>
                <strong>{gate.protectedRoute}</strong>
                <ul className="compact-list">
                  <li>Packet: {gate.packetRoute}</li>
                  <li>Records: {gate.recordCount}</li>
                  <li>Packet audits: {gate.packetCount}</li>
                  <li>Missing: {gate.missingCount}</li>
                  <li>Next: {gate.nextAction}</li>
                </ul>
              </div>
            </article>
          ))
        ) : (
          <article className="module-row">
            <div>
              <span>not run</span>
              <h2>No release-control verifier result loaded.</h2>
            </div>
            <strong className="status-pill">Pending</strong>
            <p>
              Run the verifier after the release decision, named reviewer, lockbox, authority, recipient, and
              access-log controls have been reviewed. Packet download records an audit event.
            </p>
          </article>
        )}
      </div>

      {run ? (
        <div className="demo-runbook" aria-label="Buyer release-control boundaries and workarounds">
          <div className="section-heading">
            <p className="eyebrow">Boundaries and workarounds</p>
            <h2>Keep release evidence useful without crossing clinical, legal, privacy, or security gates.</h2>
          </div>
          {run.unresolvedBoundaries.slice(0, 4).map((item) => (
            <article className="module-row" key={item}>
              <div>
                <span>boundary</span>
                <h2>{item}</h2>
              </div>
              <strong className="status-pill status-pill-warn">retained</strong>
              <p>This remains a governed synthetic pilot control until external approvals are retained.</p>
            </article>
          ))}
          {run.safeWorkarounds.slice(0, 4).map((item) => (
            <article className="module-row" key={item}>
              <div>
                <span>workaround</span>
                <h2>{item}</h2>
              </div>
              <strong className="status-pill status-pill-pass">safe path</strong>
              <p>Use this path to advance buyer readiness without storing secrets, PHI, or signed artifacts.</p>
            </article>
          ))}
        </div>
      ) : null}

      {remediationPlan ? (
        <div className="demo-runbook" aria-label="Buyer release-control remediation plan">
          <div className="section-heading">
            <p className="eyebrow">Release-control remediation plan</p>
            <h2>Resolve blocked gates with no-PHI metadata references and mandatory human review.</h2>
            <p className="section-copy">
              Decision: {remediationPlan.operatorDecision}. Score: {remediationPlan.score}%. Next:{" "}
              {remediationPlan.nextStep}
            </p>
          </div>
          {remediationPlan.steps.map((step) => (
            <article className="module-row" key={step.gateId}>
              <div>
                <span>
                  Step {step.sequence} / {step.priority}
                </span>
                <h2>{step.label}</h2>
              </div>
              <strong className={remediationStateClass(step.state)}>
                {remediationStateLabel(step.state)}
              </strong>
              <p>{step.requiredAction}</p>
              <div>
                <strong>{step.canBypass ? "Bypass available" : "Bypass blocked"}</strong>
                <ul className="compact-list">
                  <li>Bypass decision: {step.bypassDecision}</li>
                  <li>Human approval: {step.humanApprovalRequired ? "required" : "not required"}</li>
                  <li>Protected route: {step.protectedRoute}</li>
                  <li>Packet route: {step.packetRoute}</li>
                  <li>Safe metadata: {step.safeMetadataToCollect.slice(0, 5).join(", ")}</li>
                  <li>Never collect: {step.blockedData.slice(0, 4).join(", ")}</li>
                  <li>Workaround: {step.safeWorkaround}</li>
                </ul>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {reconciliation ? (
        <div className="demo-runbook" aria-label="Buyer release-control gate evidence reconciliation">
          <div className="section-heading">
            <p className="eyebrow">Gate evidence reconciliation</p>
            <h2>Pinpoint retained evidence, missing controls, and safe metadata templates.</h2>
            <p className="section-copy">
              Decision: {reconciliation.operatorDecision}. Missing items:{" "}
              {reconciliation.missingItemCount}. Latest signal:{" "}
              {reconciliation.latestSignal?.id ?? "not available"}.
            </p>
          </div>
          {reconciliation.gates.map((gate) => (
            <article className="module-row" key={gate.gateId}>
              <div>
                <span>{gate.latestSignal?.createdAt ?? "pending signal"}</span>
                <h2>{gate.label}</h2>
              </div>
              <strong className={stateClass(gate.state)}>{stateLabel(gate.state)}</strong>
              <p>{gate.currentEvidence}</p>
              <div>
                <strong>{gate.canBypass ? "Bypass available" : "No bypass"}</strong>
                <ul className="compact-list">
                  {gate.evidenceMetrics.map((metric) => (
                    <li key={metric.label}>
                      {metric.label}: {metric.value ?? "not available"}
                      {metric.target === undefined ? "" : ` / ${metric.target}`} ({metric.state})
                    </li>
                  ))}
                  <li>Latest audit: {gate.latestSignal?.eventType ?? "not retained"}</li>
                  <li>Audit event: {gate.latestSignal?.id ?? "not available"}</li>
                  <li>Next: {gate.nextAction}</li>
                </ul>
              </div>
              <div>
                <strong>Missing items</strong>
                <ul className="compact-list">
                  {gate.missingItems.length > 0 ? (
                    gate.missingItems.slice(0, 8).map((item) => (
                      <li key={item.id}>
                        {item.label}: {item.scope}
                      </li>
                    ))
                  ) : (
                    <li>No missing item labels detected for this gate.</li>
                  )}
                </ul>
              </div>
              <div>
                <strong>Safe template</strong>
                <ul className="compact-list">
                  {gate.safeMetadataTemplate.slice(0, 6).map((field) => (
                    <li key={field.key}>
                      {field.label}: {field.value}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {metadataDrafts ? (
        <div className="demo-runbook" aria-label="Buyer release-control safe metadata drafts">
          <div className="section-heading">
            <p className="eyebrow">Safe metadata drafts</p>
            <h2>Prepare missing release-control references without auto-submitting or weakening boundaries.</h2>
            <p className="section-copy">
              Decision: {metadataDrafts.operatorDecision}. Drafts: {metadataDrafts.draftCount}. Missing
              items: {metadataDrafts.missingItemCount}. Auto-submit:{" "}
              {metadataDrafts.canAutoSubmit ? "available" : "blocked"}.
            </p>
          </div>
          <article className="module-row">
            <div>
              <span>{metadataDrafts.proofStackStatus}</span>
              <h2>{metadataDrafts.nextAction}</h2>
            </div>
            <strong className="status-pill status-pill-warn">Human review</strong>
            <p>{metadataDrafts.boundary}</p>
          </article>
          {metadataDrafts.drafts.length > 0 ? (
            metadataDrafts.drafts.slice(0, 12).map((draft) => (
              <article className="module-row" key={draft.draftId}>
                <div>
                  <span>{draft.gateLabel}</span>
                  <h2>{draft.missingItemLabel}</h2>
                </div>
                <strong className="status-pill status-pill-warn">Draft only</strong>
                <p>
                  Target: {draft.targetProtectedRoute}. Packet: {draft.packetRoute}.
                </p>
                <div>
                  <strong>Recommended payload</strong>
                  <ul className="compact-list">
                    {draft.payloadFields.slice(0, 10).map((field) => (
                      <li key={`${draft.draftId}-${field.key}`}>
                        {field.key}: {metadataValueLabel(field.value)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Operator steps</strong>
                  <ul className="compact-list">
                    {draft.operatorSteps.slice(0, 5).map((step) => (
                      <li key={`${draft.draftId}-${step}`}>{step}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Blocked data</strong>
                  <ul className="compact-list">
                    {draft.blockedData.slice(0, 5).map((item) => (
                      <li key={`${draft.draftId}-${item}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))
          ) : (
            <article className="module-row">
              <div>
                <span>no draft gaps</span>
                <h2>No missing metadata drafts are currently required.</h2>
              </div>
              <strong className="status-pill status-pill-pass">Ready</strong>
              <p>Pause for qualified human release review before any external buyer sharing.</p>
            </article>
          )}
        </div>
      ) : null}

      {draftChecklist ? (
        <div className="demo-runbook" aria-label="Buyer release-control draft schema checklist">
          <div className="section-heading">
            <p className="eyebrow">Draft-to-record checklist</p>
            <h2>Validate draft payloads against protected write schemas before any human records them.</h2>
            <p className="section-copy">
              Decision: {draftChecklist.operatorDecision}. Schema ready:{" "}
              {draftChecklist.schemaReadyCount}/{draftChecklist.draftCount}. Prerequisite blocked:{" "}
              {draftChecklist.prerequisiteBlockedCount}. Corrections:{" "}
              {draftChecklist.correctionBlockedCount}. Auto-submit:{" "}
              {draftChecklist.canAutoSubmit ? "available" : "blocked"}.
            </p>
          </div>
          <article className="module-row">
            <div>
              <span>{draftChecklist.proofStackStatus}</span>
              <h2>{draftChecklist.nextAction}</h2>
            </div>
            <strong className="status-pill status-pill-warn">No auto-submit</strong>
            <p>{draftChecklist.boundary}</p>
          </article>
          {draftChecklist.items.length > 0 ? (
            draftChecklist.items.slice(0, 12).map((item) => (
              <article className="module-row" key={item.draftId}>
                <div>
                  <span>{item.targetWriteSchema}</span>
                  <h2>{item.missingItemLabel}</h2>
                </div>
                <strong className={draftChecklistStatusClass(item.schemaStatus)}>
                  {draftChecklistStatusLabel(item.schemaStatus)}
                </strong>
                <p>
                  Target: {item.targetProtectedRoute}. Packet: {item.packetRoute}. Record after human
                  review: {item.canRecordAfterHumanReview ? "yes" : "not yet"}.
                </p>
                <div>
                  <strong>Prerequisites</strong>
                  <ul className="compact-list">
                    {item.prerequisiteErrors.length > 0 ? (
                      item.prerequisiteErrors.map((error) => (
                        <li key={`${item.draftId}-prereq-${error}`}>{error}</li>
                      ))
                    ) : (
                      <li>No prerequisite record ID blockers detected.</li>
                    )}
                  </ul>
                </div>
                <div>
                  <strong>Corrections</strong>
                  <ul className="compact-list">
                    {item.correctionErrors.length > 0 ? (
                      item.correctionErrors.map((error) => (
                        <li key={`${item.draftId}-correction-${error}`}>{error}</li>
                      ))
                    ) : (
                      <li>No draft field corrections detected.</li>
                    )}
                  </ul>
                </div>
                <div>
                  <strong>Checklist</strong>
                  <ul className="compact-list">
                    {item.checklist.slice(0, 5).map((step) => (
                      <li key={`${item.draftId}-check-${step}`}>{step}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))
          ) : (
            <article className="module-row">
              <div>
                <span>no drafts</span>
                <h2>No draft payloads currently require schema precheck.</h2>
              </div>
              <strong className="status-pill status-pill-pass">No action</strong>
              <p>Pause for qualified human release review before any external buyer sharing.</p>
            </article>
          )}
        </div>
      ) : null}

      {timeline ? (
        <div className="demo-runbook" aria-label="Buyer release-readiness timeline">
          <div className="section-heading">
            <p className="eyebrow">Release readiness timeline</p>
            <h2>Separate durable packet evidence from browser-session verifier reads.</h2>
            <p className="section-copy">
              {timeline.durableAuditEventCount} audit event(s), {timeline.durablePacketAuditCount} packet
              audit event(s), verifier capture: {timeline.verifierRunCapture}.{" "}
              {timeline.durableRunWorkaround}
            </p>
          </div>
          <article className="module-row">
            <div>
              <span>{timeline.releaseDecision}</span>
              <h2>{timeline.nextHumanApproval}</h2>
            </div>
            <strong className={stateClass(timeline.chainState)}>{stateLabel(timeline.chainState)}</strong>
            <p>
              Timeline generated {timeline.generatedAt}. Latest signal:{" "}
              {timeline.latestSignalId ?? "not available"} at {timeline.latestSignalAt ?? "not available"}.
            </p>
          </article>
          {timeline.events.slice(0, 12).map((event) => (
            <article className="module-row" key={event.id}>
              <div>
                <span>{timelineKindLabel(event.kind)}</span>
                <h2>{event.label}</h2>
              </div>
              <strong
                className={
                  event.state === "review-required" ? "status-pill status-pill-warn" : stateClass(event.state)
                }
              >
                {event.state === "review-required" ? "Review" : stateLabel(event.state)}
              </strong>
              <p>{event.evidence}</p>
              <div>
                <strong>{event.auditEventId ?? "No durable audit event"}</strong>
                <ul className="compact-list">
                  <li>Time: {event.occurredAt ?? "pending"}</li>
                  <li>Event: {event.eventType ?? "not persisted"}</li>
                  <li>Packet: {event.packetType ?? "not applicable"}</li>
                  <li>Next: {event.nextAction}</li>
                </ul>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
