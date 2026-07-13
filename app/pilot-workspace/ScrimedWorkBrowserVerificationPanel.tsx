"use client";

import type { Session } from "@supabase/supabase-js";
import { useMemo, useState } from "react";
import {
  buildScrimedWorkBrowserVerificationPayload,
  classifyScrimedWorkBrowserResponse,
  isScrimedWorkBrowserVerificationComplete,
  scrimedWorkBrowserVerificationBoundary,
  scrimedWorkBrowserVerificationChecks,
  scrimedWorkBrowserVerificationVersion,
  type ScrimedWorkBrowserCheckStatus,
  type ScrimedWorkBrowserVerificationCheckId
} from "../lib/scrimed-work/browserVerification";
import type { PilotWorkspaceRecord } from "../lib/protectedPilotWorkspace";

type VerificationState = "idle" | "running" | "complete" | "blocked" | "failed";

type CheckResult = {
  id: ScrimedWorkBrowserVerificationCheckId;
  label: string;
  purpose: string;
  mutation: boolean;
  status: ScrimedWorkBrowserCheckStatus;
  detail: string;
};

type JsonRecord = Record<string, unknown>;

const requestTimeoutMs = 20000;

function initialResults(): CheckResult[] {
  return scrimedWorkBrowserVerificationChecks.map((check) => ({
    ...check,
    status: "pending",
    detail: "Not run"
  }));
}

function statusClass(status: ScrimedWorkBrowserCheckStatus) {
  if (status === "pass") return "status-pill status-pill-pass";
  if (status === "blocked") return "status-pill status-pill-warn";
  if (status === "fail") return "status-pill status-pill-fail";
  return "status-pill";
}

function statusLabel(status: ScrimedWorkBrowserCheckStatus) {
  if (status === "pass") return "Pass";
  if (status === "blocked") return "Blocked";
  if (status === "fail") return "Fail";
  return "Pending";
}

function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : null;
}

async function readJson(response: Response): Promise<JsonRecord | null> {
  try {
    return asRecord(await response.json());
  } catch {
    return null;
  }
}

function nestedRecord(parent: JsonRecord | null, key: string) {
  return asRecord(parent?.[key]);
}

function safeFailureDetail(response: Response, body: JsonRecord | null) {
  const error = nestedRecord(body, "error");
  const rawCode = typeof error?.code === "string" ? error.code : "request-denied";
  const code = /^[a-z0-9_-]{3,80}$/i.test(rawCode) ? rawCode : "request-denied";
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

export default function ScrimedWorkBrowserVerificationPanel({
  onAuditChanged,
  session,
  workspace
}: {
  onAuditChanged: () => Promise<void>;
  session: Session;
  workspace: PilotWorkspaceRecord;
}) {
  const [state, setState] = useState<VerificationState>("idle");
  const [message, setMessage] = useState("");
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

  async function runVerification() {
    let working = initialResults();
    let createdSessionId: string | null = null;
    let cleanupAttempted = false;
    const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 12);
    const createPayload = buildScrimedWorkBrowserVerificationPayload(workspace.slug, suffix);
    const createIdempotencyKey = `scrimed-work-browser-create-${suffix}`;
    const authenticatedHeaders = {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      "idempotency-key": createIdempotencyKey,
      "x-scrimed-workspace-slug": workspace.slug
    };
    const protectedReadHeaders = {
      Authorization: `Bearer ${session.access_token}`,
      "x-scrimed-workspace-slug": workspace.slug
    };

    const record = (id: ScrimedWorkBrowserVerificationCheckId, status: ScrimedWorkBrowserCheckStatus, detail: string) => {
      working = working.map((result) => (result.id === id ? { ...result, status, detail } : result));
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
    setMessage("Running bounded SCRIMED Work verification with the active AAL2 browser session.");

    try {
      const summaryResponse = await boundedFetch("/api/scrimed-work");
      const summaryBody = await readJson(summaryResponse);
      const summaryData = nestedRecord(summaryBody, "data") ?? summaryBody;
      const persistence = nestedRecord(summaryData, "persistence");
      const durableEnabled = persistence?.durableStoreEnabled === true;

      if (summaryResponse.status !== 200) {
        record("platform-summary", "fail", `${summaryResponse.status} route unavailable`);
        blockPending("Awaiting a reviewed deployment containing SCRIMED Work routes.");
      } else if (!durableEnabled) {
        record("platform-summary", "blocked", "200 durable store disabled by operator policy");
      } else {
        record("platform-summary", "pass", "200 durable store enabled");
      }

      if (summaryResponse.status === 200) {
        const unauthenticatedResponse = await boundedFetch("/api/scrimed-work/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "idempotency-key": `scrimed-work-browser-unauth-${suffix}`,
            "x-scrimed-workspace-slug": workspace.slug
          },
          body: JSON.stringify(createPayload)
        });
        const unauthenticatedBody = await readJson(unauthenticatedResponse);
        const unauthenticatedStatus = classifyScrimedWorkBrowserResponse({
          actualStatus: unauthenticatedResponse.status,
          expectedStatuses: [401],
          blockedStatuses: [503]
        });
        record(
          "unauthenticated-fail-closed",
          unauthenticatedStatus === "blocked" ? "pass" : unauthenticatedStatus,
          unauthenticatedStatus === "fail"
            ? safeFailureDetail(unauthenticatedResponse, unauthenticatedBody)
            : `${unauthenticatedResponse.status} fail-closed`
        );

        if (!durableEnabled) {
          blockPending("Protected durable writes remain disabled by operator policy.");
        } else {
          const createResponse = await boundedFetch("/api/scrimed-work/sessions", {
            method: "POST",
            headers: authenticatedHeaders,
            body: JSON.stringify(createPayload)
          });
          const createBody = await readJson(createResponse);
          const createData = nestedRecord(createBody, "data");
          const createdSession = nestedRecord(createData, "session");
          const createStore = nestedRecord(createData, "durableStore");
          createdSessionId = typeof createdSession?.id === "string" ? createdSession.id : null;

          if ([200, 201].includes(createResponse.status) && createdSessionId && createStore?.persisted === true) {
            record("durable-create", "pass", `${createResponse.status} tenant-scoped session persisted`);
          } else {
            record("durable-create", "fail", safeFailureDetail(createResponse, createBody));
            blockPending("Create failed; dependent lifecycle checks were not attempted.");
          }

          if (createdSessionId) {
            const replayResponse = await boundedFetch("/api/scrimed-work/sessions", {
              method: "POST",
              headers: authenticatedHeaders,
              body: JSON.stringify(createPayload)
            });
            const replayBody = await readJson(replayResponse);
            const replayStore = nestedRecord(nestedRecord(replayBody, "data"), "durableStore");
            record(
              "idempotent-create",
              replayResponse.status === 200 && replayStore?.idempotentReplay === true ? "pass" : "fail",
              replayResponse.status === 200 && replayStore?.idempotentReplay === true
                ? "200 prior create decision reused"
                : safeFailureDetail(replayResponse, replayBody)
            );

            const readResponse = await boundedFetch(`/api/scrimed-work/sessions/${createdSessionId}`, {
              headers: protectedReadHeaders
            });
            const readBody = await readJson(readResponse);
            const readSession = nestedRecord(readBody, "data");
            record(
              "durable-read",
              readResponse.status === 200 && readSession?.id === createdSessionId ? "pass" : "fail",
              readResponse.status === 200 && readSession?.id === createdSessionId
                ? "200 authoritative tenant-scoped session retrieved"
                : safeFailureDetail(readResponse, readBody)
            );

            const verificationResponse = await boundedFetch(`/api/scrimed-work/sessions/${createdSessionId}/verify`, {
              method: "POST",
              headers: protectedReadHeaders
            });
            const verificationBody = await readJson(verificationResponse);
            const verification = nestedRecord(verificationBody, "data");
            const failedCriteria = Array.isArray(verification?.failedCriteria) ? verification.failedCriteria : [];
            const reviewGateHeld =
              verification?.allPass === false &&
              verification?.eligibleForCompletion === false &&
              failedCriteria.includes("human-approval-state");
            record(
              "verification-evidence",
              verificationResponse.status === 200 && reviewGateHeld ? "pass" : "fail",
              verificationResponse.status === 200 && reviewGateHeld
                ? "200 verification evaluated; pending human review blocks completion"
                : safeFailureDetail(verificationResponse, verificationBody)
            );

            const planIdempotencyKey = `scrimed-work-browser-plan-${suffix}`;
            const planHeaders = { ...authenticatedHeaders, "idempotency-key": planIdempotencyKey };
            const planResponse = await boundedFetch(`/api/scrimed-work/sessions/${createdSessionId}/plan`, {
              method: "POST",
              headers: planHeaders,
              body: JSON.stringify({ workspaceSlug: workspace.slug })
            });
            const planBody = await readJson(planResponse);
            const planStore = nestedRecord(nestedRecord(planBody, "data"), "durableStore");
            record(
              "plan-transition",
              planResponse.status === 200 && planStore?.transitioned === true ? "pass" : "fail",
              planResponse.status === 200 && planStore?.transitioned === true
                ? "200 draft to planning recorded"
                : safeFailureDetail(planResponse, planBody)
            );

            const planReplayResponse = await boundedFetch(`/api/scrimed-work/sessions/${createdSessionId}/plan`, {
              method: "POST",
              headers: planHeaders,
              body: JSON.stringify({ workspaceSlug: workspace.slug })
            });
            const planReplayBody = await readJson(planReplayResponse);
            const planReplayStore = nestedRecord(nestedRecord(planReplayBody, "data"), "durableStore");
            record(
              "transition-replay",
              planReplayResponse.status === 200 && planReplayStore?.idempotentReplay === true ? "pass" : "fail",
              planReplayResponse.status === 200 && planReplayStore?.idempotentReplay === true
                ? "200 prior transition decision reused"
                : safeFailureDetail(planReplayResponse, planReplayBody)
            );

            const invalidResponse = await boundedFetch(`/api/scrimed-work/sessions/${createdSessionId}/resume`, {
              method: "POST",
              headers: { ...authenticatedHeaders, "idempotency-key": `scrimed-work-browser-invalid-${suffix}` },
              body: JSON.stringify({ workspaceSlug: workspace.slug })
            });
            const invalidBody = await readJson(invalidResponse);
            const invalidStatus = classifyScrimedWorkBrowserResponse({
              actualStatus: invalidResponse.status,
              expectedStatuses: [409, 422]
            });
            record(
              "invalid-resume-denied",
              invalidStatus,
              invalidStatus === "pass"
                ? `${invalidResponse.status} lifecycle state machine denied resume`
                : safeFailureDetail(invalidResponse, invalidBody)
            );

            const artifactResponse = await boundedFetch("/api/scrimed-work/artifacts", {
              method: "POST",
              headers: { ...authenticatedHeaders, "idempotency-key": `scrimed-work-browser-artifact-${suffix}` },
              body: JSON.stringify({
                workspaceSlug: workspace.slug,
                sessionId: createdSessionId,
                type: "executive-report",
                title: `SCRIMED Work browser verification artifact ${suffix}`
              })
            });
            const artifactBody = await readJson(artifactResponse);
            const artifactData = nestedRecord(artifactBody, "data");
            const artifact = nestedRecord(artifactData, "artifact");
            const artifactStore = nestedRecord(artifactData, "durableStore");
            record(
              "artifact-evidence",
              [200, 201].includes(artifactResponse.status) &&
                typeof artifact?.artifactId === "string" &&
                artifactStore?.persisted === true
                ? "pass"
                : "fail",
              [200, 201].includes(artifactResponse.status) && artifactStore?.persisted === true
                ? `${artifactResponse.status} synthetic artifact metadata persisted`
                : safeFailureDetail(artifactResponse, artifactBody)
            );
          }
        }
      }
    } catch (error) {
      blockPending(error instanceof DOMException && error.name === "AbortError" ? "Verification request timed out." : "Verification stopped on a network or response error.");
    } finally {
      if (createdSessionId) {
        cleanupAttempted = true;

        try {
          const cancelResponse = await boundedFetch(`/api/scrimed-work/sessions/${createdSessionId}/cancel`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
              "idempotency-key": `scrimed-work-browser-cancel-${suffix}`,
              "x-scrimed-workspace-slug": workspace.slug
            },
            body: JSON.stringify({ workspaceSlug: workspace.slug })
          });
          const cancelBody = await readJson(cancelResponse);
          const cancelStore = nestedRecord(nestedRecord(cancelBody, "data"), "durableStore");
          record(
            "cancellation-cleanup",
            cancelResponse.status === 200 && cancelStore?.transitioned === true ? "pass" : "fail",
            cancelResponse.status === 200 && cancelStore?.transitioned === true
              ? "200 verification session cancelled"
              : safeFailureDetail(cancelResponse, cancelBody)
          );
        } catch {
          record("cancellation-cleanup", "fail", "Cancellation cleanup could not be confirmed.");
        }
      }
    }

    if (!cleanupAttempted && working.find((result) => result.id === "cancellation-cleanup")?.status === "pending") {
      record("cancellation-cleanup", "blocked", "No session was created, so cleanup was not required.");
    }

    const complete = isScrimedWorkBrowserVerificationComplete(working);
    const failed = working.some((result) => result.status === "fail");
    const blocked = working.some((result) => result.status === "blocked");
    setState(complete ? "complete" : failed ? "failed" : blocked ? "blocked" : "failed");
    setMessage(
      complete
        ? "SCRIMED Work browser verification passed. The synthetic session was cancelled and evidence retained."
        : failed
          ? "Verification found a failure. Keep SCRIMED Work release promotion blocked."
          : "Verification is blocked by deployment or operator configuration; no unsafe fallback was attempted."
    );

    if (createdSessionId) await onAuditChanged();
  }

  return (
    <section className="table-section" id="scrimed-work-browser-verification" aria-label="SCRIMED Work browser verification">
      <div className="section-heading">
        <p className="eyebrow">SCRIMED Work release verification</p>
        <h2>Validate the durable work lifecycle without exporting a bearer token.</h2>
        <p className="section-copy">{scrimedWorkBrowserVerificationBoundary}</p>
        <div className="form-actions">
          <button className="primary-action" disabled={state === "running"} onClick={runVerification} type="button">
            {state === "running" ? "Running Bounded Verification" : "Run SCRIMED Work Verification"}
          </button>
        </div>
        {message ? <div className="intake-alert">{message}</div> : null}
      </div>

      <div className="hub-summary verification-summary" aria-label="SCRIMED Work verification summary">
        <article><span>Checks</span><strong>{summary.total}</strong></article>
        <article><span>Passed</span><strong>{summary.passed}</strong></article>
        <article><span>Blocked</span><strong>{summary.blocked}</strong></article>
        <article><span>Failed</span><strong>{summary.failed}</strong></article>
      </div>

      {results.map((result) => (
        <article className="module-row" key={result.id}>
          <div>
            <span>{result.mutation ? "bounded synthetic write" : "control check"}</span>
            <h2>{result.label}</h2>
            <p>{result.purpose}</p>
          </div>
          <strong className={statusClass(result.status)}>{statusLabel(result.status)}</strong>
          <p>{result.detail}</p>
        </article>
      ))}

      <p className="section-copy">
        Policy {scrimedWorkBrowserVerificationVersion}. No live PHI, clinical authority, payer submission, EHR writeback,
        patient outreach, production connector approval, certification claim, or customer go-live authority is granted.
      </p>
    </section>
  );
}
