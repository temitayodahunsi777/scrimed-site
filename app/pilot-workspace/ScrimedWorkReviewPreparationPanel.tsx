"use client";

import type { Session } from "@supabase/supabase-js";
import { useMemo, useState } from "react";

import {
  buildScrimedWorkReviewPreparationPayload,
  isScrimedWorkReviewPreparationReady,
  scrimedWorkReviewPreparationBoundary,
  scrimedWorkReviewPreparationChecks,
  type ScrimedWorkReviewPreparationCheckId,
  type ScrimedWorkReviewPreparationCheckStatus
} from "../lib/scrimed-work/reviewPreparation";
import type { PilotWorkspaceRecord } from "../lib/protectedPilotWorkspace";

type PreparationState = "idle" | "running" | "ready" | "blocked" | "failed";
type JsonRecord = Record<string, unknown>;

type CheckResult = {
  id: ScrimedWorkReviewPreparationCheckId;
  label: string;
  purpose: string;
  status: ScrimedWorkReviewPreparationCheckStatus;
  detail: string;
};

const requestTimeoutMs = 20_000;

function initialResults(): CheckResult[] {
  return scrimedWorkReviewPreparationChecks.map((check) => ({
    ...check,
    status: "pending",
    detail: "Not run"
  }));
}

function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function nestedRecord(parent: JsonRecord | null, key: string) {
  return asRecord(parent?.[key]);
}

function sessionStatus(session: JsonRecord | null) {
  const history = Array.isArray(session?.statusHistory) ? session.statusHistory : [];
  const latest = asRecord(history.at(-1));
  return typeof latest?.status === "string" ? latest.status : "";
}

async function readJson(response: Response): Promise<JsonRecord | null> {
  try {
    return asRecord(await response.json());
  } catch {
    return null;
  }
}

function safeFailureDetail(response: Response, body: JsonRecord | null) {
  const error = nestedRecord(body, "error");
  const rawCode = typeof error?.code === "string" ? error.code : "request-denied";
  const code = /^[a-z0-9_-]{3,100}$/i.test(rawCode) ? rawCode : "request-denied";
  return `${response.status} ${code}`;
}

async function boundedFetch(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

function statusClass(status: ScrimedWorkReviewPreparationCheckStatus) {
  if (status === "pass") return "status-pill status-pill-pass";
  if (status === "blocked") return "status-pill status-pill-warn";
  if (status === "fail") return "status-pill status-pill-fail";
  return "status-pill";
}

function statusLabel(status: ScrimedWorkReviewPreparationCheckStatus) {
  if (status === "pass") return "Pass";
  if (status === "blocked") return "Blocked";
  if (status === "fail") return "Fail";
  return "Pending";
}

export default function ScrimedWorkReviewPreparationPanel({
  onAuditChanged,
  session,
  workspace
}: {
  onAuditChanged: () => Promise<void>;
  session: Session;
  workspace: PilotWorkspaceRecord;
}) {
  const [state, setState] = useState<PreparationState>("idle");
  const [message, setMessage] = useState(
    "Tenant admins and pilot leads can prepare one bounded synthetic artifact for a separate reviewer."
  );
  const [results, setResults] = useState<CheckResult[]>(initialResults);

  const summary = useMemo(
    () => ({
      total: results.length,
      passed: results.filter((result) => result.status === "pass").length,
      blocked: results.filter((result) => result.status === "blocked").length,
      failed: results.filter((result) => result.status === "fail").length
    }),
    [results]
  );

  async function prepareIndependentReview() {
    if (
      !window.confirm(
        "Create one durable synthetic/no-PHI session and artifact, then leave it paused for an independent reviewer?"
      )
    ) {
      return;
    }

    let working = initialResults();
    let createdSessionId: string | null = null;
    let createdArtifactId: string | null = null;
    let prepared = false;
    const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 12);
    const payload = buildScrimedWorkReviewPreparationPayload(workspace.slug, suffix);
    const protectedReadHeaders = {
      Authorization: `Bearer ${session.access_token}`,
      "x-scrimed-workspace-slug": workspace.slug
    };
    const writeHeaders = (action: string) => ({
      ...protectedReadHeaders,
      "Content-Type": "application/json",
      "idempotency-key": `scrimed-work-review-prep-${action}-${suffix}`
    });
    const record = (
      id: ScrimedWorkReviewPreparationCheckId,
      status: ScrimedWorkReviewPreparationCheckStatus,
      detail: string
    ) => {
      working = working.map((result) =>
        result.id === id ? { ...result, status, detail } : result
      );
      setResults(working);
    };
    const blockPending = (detail: string) => {
      working = working.map((result) =>
        result.status === "pending" ? { ...result, status: "blocked", detail } : result
      );
      setResults(working);
    };

    setResults(working);
    setState("running");
    setMessage("Preparing bounded synthetic evidence through the active AAL2 browser session.");

    try {
      const summaryResponse = await boundedFetch("/api/scrimed-work", { cache: "no-store" });
      const summaryBody = await readJson(summaryResponse);
      const summaryData = nestedRecord(summaryBody, "data") ?? summaryBody;
      const persistence = nestedRecord(summaryData, "persistence");

      if (summaryResponse.status !== 200 || persistence?.durableStoreEnabled !== true) {
        record(
          "platform-posture",
          "blocked",
          summaryResponse.status === 200
            ? "Durable store remains disabled by operator policy."
            : safeFailureDetail(summaryResponse, summaryBody)
        );
        blockPending("Protected durable preparation is unavailable; no fallback was attempted.");
        setState("blocked");
        setMessage("Independent review preparation remained blocked and no durable evidence was created.");
        return;
      }

      record("platform-posture", "pass", "Approved no-PHI durable store is enabled.");

      const createResponse = await boundedFetch("/api/scrimed-work/sessions", {
        method: "POST",
        headers: writeHeaders("create"),
        body: JSON.stringify(payload)
      });
      const createBody = await readJson(createResponse);
      const createData = nestedRecord(createBody, "data");
      const createdSession = nestedRecord(createData, "session");
      const createStore = nestedRecord(createData, "durableStore");
      createdSessionId = typeof createdSession?.id === "string" ? createdSession.id : null;

      if (
        ![200, 201].includes(createResponse.status) ||
        !createdSessionId ||
        createStore?.persisted !== true
      ) {
        record("session-created", "fail", safeFailureDetail(createResponse, createBody));
        blockPending("Session creation failed; dependent steps were not attempted.");
        throw new Error("session-create-failed");
      }
      record("session-created", "pass", "Tenant-scoped synthetic session persisted.");

      const planResponse = await boundedFetch(
        `/api/scrimed-work/sessions/${encodeURIComponent(createdSessionId)}/plan`,
        {
          method: "POST",
          headers: writeHeaders("plan"),
          body: JSON.stringify({ workspaceSlug: workspace.slug })
        }
      );
      const planBody = await readJson(planResponse);
      const planData = nestedRecord(planBody, "data");
      const plannedSession = nestedRecord(planData, "session");
      const planStore = nestedRecord(planData, "durableStore");

      if (
        planResponse.status !== 200 ||
        sessionStatus(plannedSession) !== "planning" ||
        planStore?.transitioned !== true
      ) {
        record("session-planned", "fail", safeFailureDetail(planResponse, planBody));
        blockPending("Planning failed; artifact and run steps were not attempted.");
        throw new Error("session-plan-failed");
      }
      record("session-planned", "pass", "Definition-of-Done planning transition persisted.");

      const artifactResponse = await boundedFetch("/api/scrimed-work/artifacts", {
        method: "POST",
        headers: writeHeaders("artifact"),
        body: JSON.stringify({
          workspaceSlug: workspace.slug,
          sessionId: createdSessionId,
          type: "executive-report",
          title: `SCRIMED Work independent review evidence ${suffix}`
        })
      });
      const artifactBody = await readJson(artifactResponse);
      const artifactData = nestedRecord(artifactBody, "data");
      const artifact = nestedRecord(artifactData, "artifact");
      const artifactStore = nestedRecord(artifactData, "durableStore");
      createdArtifactId = typeof artifact?.artifactId === "string" ? artifact.artifactId : null;

      if (
        ![200, 201].includes(artifactResponse.status) ||
        !createdArtifactId ||
        artifactStore?.persisted !== true
      ) {
        record("artifact-created", "fail", safeFailureDetail(artifactResponse, artifactBody));
        blockPending("Artifact persistence failed; the session will be cancelled.");
        throw new Error("artifact-create-failed");
      }
      record("artifact-created", "pass", "Metadata-only internal-review artifact persisted.");

      const runResponse = await boundedFetch(
        `/api/scrimed-work/sessions/${encodeURIComponent(createdSessionId)}/run`,
        {
          method: "POST",
          headers: writeHeaders("run"),
          body: JSON.stringify({ workspaceSlug: workspace.slug })
        }
      );
      const runBody = await readJson(runResponse);
      const runData = nestedRecord(runBody, "data");
      const runSession = nestedRecord(runData, "session");
      const runStore = nestedRecord(runData, "durableStore");

      if (
        runResponse.status !== 200 ||
        sessionStatus(runSession) !== "awaiting_approval" ||
        runStore?.transitioned !== true
      ) {
        record("approval-gate-reached", "fail", safeFailureDetail(runResponse, runBody));
        blockPending("The mandatory approval checkpoint was not confirmed.");
        throw new Error("approval-gate-failed");
      }
      record("approval-gate-reached", "pass", "Session paused for an independent reviewer.");

      const selfApprovalResponse = await boundedFetch(
        `/api/scrimed-work/sessions/${encodeURIComponent(createdSessionId)}/approve`,
        {
          method: "POST",
          headers: writeHeaders("self-approve-denial"),
          body: JSON.stringify({ workspaceSlug: workspace.slug })
        }
      );
      const selfApprovalBody = await readJson(selfApprovalResponse);
      const selfApprovalError = nestedRecord(selfApprovalBody, "error");
      const selfApprovalDenied =
        [403, 422].includes(selfApprovalResponse.status) &&
        typeof selfApprovalError?.code === "string" &&
        selfApprovalError.code.includes("separation_of_duties_required");

      if (!selfApprovalDenied) {
        record(
          "self-approval-denied",
          "fail",
          safeFailureDetail(selfApprovalResponse, selfApprovalBody)
        );
        blockPending("Creator self-approval denial was not proven; the session will be cancelled.");
        throw new Error("self-approval-not-denied");
      }
      record("self-approval-denied", "pass", "Creator self-approval failed closed.");

      const readResponse = await boundedFetch(
        `/api/scrimed-work/sessions/${encodeURIComponent(createdSessionId)}`,
        { headers: protectedReadHeaders, cache: "no-store" }
      );
      const readBody = await readJson(readResponse);
      const authoritativeSession = nestedRecord(readBody, "data");

      if (
        readResponse.status !== 200 ||
        authoritativeSession?.id !== createdSessionId ||
        sessionStatus(authoritativeSession) !== "awaiting_approval"
      ) {
        record("authoritative-state-confirmed", "fail", safeFailureDetail(readResponse, readBody));
        throw new Error("authoritative-state-mismatch");
      }
      record(
        "authoritative-state-confirmed",
        "pass",
        "Durable session remains awaiting independent review."
      );

      prepared = isScrimedWorkReviewPreparationReady({
        checks: working,
        sessionId: createdSessionId,
        artifactId: createdArtifactId
      });

      if (!prepared) throw new Error("preparation-contract-incomplete");

      setState("ready");
      setMessage(
        "Independent review evidence is ready. The separate reviewer should load the queue, approve the session, then record the artifact disposition."
      );
    } catch {
      if (state !== "blocked") {
        setState("failed");
        setMessage(
          "Preparation did not satisfy every safety check. Incomplete work is being cancelled; release remains blocked."
        );
      }
    } finally {
      if (createdSessionId && !prepared) {
        try {
          await boundedFetch(
            `/api/scrimed-work/sessions/${encodeURIComponent(createdSessionId)}/cancel`,
            {
              method: "POST",
              headers: writeHeaders("rollback-cancel"),
              body: JSON.stringify({ workspaceSlug: workspace.slug })
            }
          );
        } catch {
          setMessage(
            "Preparation failed and cancellation could not be confirmed. Keep release blocked and inspect the durable audit trail."
          );
        }
      }

      if (createdSessionId) await onAuditChanged().catch(() => undefined);
    }
  }

  return (
    <section
      className="table-section"
      aria-label="SCRIMED Work independent review preparation"
    >
      <div className="section-heading">
        <p className="eyebrow">Two-person release evidence</p>
        <h2>Prepare a bounded artifact for independent review.</h2>
        <p className="section-copy">
          Create one durable synthetic/no-PHI session and artifact, prove creator self-approval is denied,
          and stop at the independent reviewer checkpoint.
        </p>
        <div className="form-actions">
          <button
            className="primary-action"
            disabled={state === "running"}
            onClick={prepareIndependentReview}
            type="button"
          >
            {state === "running" ? "Preparing Review Evidence" : "Prepare Independent Review"}
          </button>
        </div>
        <p role="status">{message}</p>
      </div>

      <div className="hub-summary verification-summary" aria-label="Review preparation summary">
        <article><span>Checks</span><strong>{summary.total}</strong></article>
        <article><span>Passed</span><strong>{summary.passed}</strong></article>
        <article><span>Blocked</span><strong>{summary.blocked}</strong></article>
        <article><span>Failed</span><strong>{summary.failed}</strong></article>
      </div>

      {results.map((result) => (
        <article className="module-row" key={result.id}>
          <div>
            <span>bounded synthetic control</span>
            <h2>{result.label}</h2>
            <p>{result.purpose}</p>
          </div>
          <strong className={statusClass(result.status)}>{statusLabel(result.status)}</strong>
          <p>{result.detail}</p>
        </article>
      ))}

      <p className="section-copy">{scrimedWorkReviewPreparationBoundary}</p>
    </section>
  );
}
