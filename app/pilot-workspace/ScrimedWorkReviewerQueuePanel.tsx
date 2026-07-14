"use client";

import type { Session } from "@supabase/supabase-js";
import { useState } from "react";

import {
  parseScrimedWorkReviewQueuePayload,
  scrimedWorkReviewQueueBoundary,
  type ScrimedWorkReviewQueue
} from "../lib/scrimed-work/reviewQueue";
import type { PilotWorkspaceRecord } from "../lib/protectedPilotWorkspace";

type QueueState = "idle" | "loading" | "ready" | "denied" | "failed";
type ReviewDisposition = "approved_for_internal_use" | "changes_requested" | "rejected";
type JsonRecord = Record<string, unknown>;
const requestTimeoutMs = 20_000;

function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

async function readJson(response: Response) {
  try {
    return asRecord(await response.json());
  } catch {
    return null;
  }
}

function safeError(response: Response, body: JsonRecord | null) {
  const error = asRecord(body?.error);
  const code = typeof error?.code === "string" && /^[a-z0-9_-]{3,100}$/i.test(error.code)
    ? error.code
    : "request-denied";
  return `${response.status} ${code}`;
}

function reviewReason(disposition: ReviewDisposition) {
  if (disposition === "approved_for_internal_use") return "evidence_and_boundaries_confirmed";
  if (disposition === "changes_requested") return "revision_required";
  return "unsafe_or_unsupported_claim";
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

export default function ScrimedWorkReviewerQueuePanel({
  onAuditChanged,
  session,
  workspace
}: {
  onAuditChanged: () => Promise<void>;
  session: Session;
  workspace: PilotWorkspaceRecord;
}) {
  const [state, setState] = useState<QueueState>("idle");
  const [queue, setQueue] = useState<ScrimedWorkReviewQueue | null>(null);
  const [message, setMessage] = useState("Reviewer membership and fresh AAL2 are checked when the queue is loaded.");
  const [reviewingArtifactId, setReviewingArtifactId] = useState<string | null>(null);

  const protectedHeaders = {
    Authorization: `Bearer ${session.access_token}`,
    "x-scrimed-workspace-slug": workspace.slug
  };

  async function loadQueue() {
    setState("loading");
    setMessage("Loading bounded synthetic/no-PHI review metadata through the tenant-scoped gate.");

    try {
      const response = await boundedFetch("/api/scrimed-work/review-queue?limit=25", {
        headers: protectedHeaders,
        cache: "no-store"
      });
      const body = await readJson(response);
      const data = asRecord(body?.data);
      const parsedQueue = parseScrimedWorkReviewQueuePayload(data?.queue);

      if (response.status === 403) {
        setQueue(null);
        setState("denied");
        setMessage("Reviewer membership with fresh AAL2 is required. The queue remained closed.");
        return;
      }

      if (!response.ok || !parsedQueue) {
        setQueue(null);
        setState("failed");
        setMessage(`The review queue failed closed: ${safeError(response, body)}.`);
        return;
      }

      setQueue(parsedQueue);
      setState("ready");
      setMessage(
        parsedQueue.count === 0
          ? "No independently reviewable artifacts are waiting in this workspace."
          : `${parsedQueue.count} independently reviewable artifact${parsedQueue.count === 1 ? "" : "s"} loaded.`
      );
      await onAuditChanged().catch(() => undefined);
    } catch {
      setQueue(null);
      setState("failed");
      setMessage("The review queue could not be reached and remained closed.");
    }
  }

  async function recordReview(
    sessionId: string,
    artifactId: string,
    disposition: ReviewDisposition
  ) {
    const actionLabel = disposition === "approved_for_internal_use"
      ? "approve this artifact for internal use only"
      : disposition === "changes_requested"
        ? "request changes"
        : "reject this artifact";

    if (!window.confirm(`Record an immutable reviewer decision to ${actionLabel}?`)) return;

    setReviewingArtifactId(artifactId);
    setMessage("Recording the bounded reviewer disposition. External distribution remains blocked.");

    try {
      const response = await boundedFetch(
        `/api/scrimed-work/sessions/${encodeURIComponent(sessionId)}/artifacts/${encodeURIComponent(artifactId)}/review`,
        {
          method: "POST",
          headers: {
            ...protectedHeaders,
            "Content-Type": "application/json",
            "idempotency-key": `scrimed-work-review-${crypto.randomUUID()}`
          },
          body: JSON.stringify({
            disposition,
            reasonCode: reviewReason(disposition)
          })
        }
      );
      const body = await readJson(response);

      if (!response.ok) {
        setMessage(`The reviewer disposition failed closed: ${safeError(response, body)}.`);
        return;
      }

      setMessage("Reviewer disposition recorded with durable evidence and retained safety boundaries.");
      await loadQueue();
    } catch {
      setMessage("The reviewer disposition could not be confirmed and remained uncommitted.");
    } finally {
      setReviewingArtifactId(null);
    }
  }

  return (
    <section className="table-section" aria-label="SCRIMED Work independent reviewer queue">
      <div className="section-heading">
        <p className="eyebrow">Independent review</p>
        <h2>SCRIMED Work Reviewer Queue</h2>
        <p className="section-copy">
          Reviewers can load bounded metadata for synthetic artifacts created by another actor. Every queue read is
          audited; no raw artifact payload, PHI, payer submission, EHR writeback, or external distribution authority
          is exposed here.
        </p>
        <div className="form-actions">
          <button
            className="primary-action"
            disabled={state === "loading" || reviewingArtifactId !== null}
            onClick={loadQueue}
            type="button"
          >
            {state === "loading" ? "Checking Reviewer Access" : "Load Review Queue"}
          </button>
        </div>
        <p role="status">{message}</p>
      </div>

      {queue?.items.map((item) => {
        const busy = reviewingArtifactId === item.artifactId;
        const actionsBlocked = reviewingArtifactId !== null || !item.approvalsReady;

        return (
          <article className="module-row" key={item.artifactId}>
            <div>
              <span>{item.artifactType}</span>
              <h2>{item.title}</h2>
            </div>
            <p>
              {item.workspaceDomain} · {item.riskLevel} risk · {item.reviewStatus.replaceAll("_", " ")}
            </p>
            <strong>
              {item.approvalsReady
                ? "Session approvals are ready; verification is recomputed when the disposition is recorded."
                : "Session approvals are incomplete; disposition controls remain locked."}
            </strong>
            <div className="form-actions" aria-label={`Review actions for ${item.title}`}>
              <button
                className="secondary-action"
                disabled={actionsBlocked}
                onClick={() => recordReview(item.sessionId, item.artifactId, "changes_requested")}
                type="button"
              >
                Request Changes
              </button>
              <button
                className="secondary-action"
                disabled={actionsBlocked}
                onClick={() => recordReview(item.sessionId, item.artifactId, "rejected")}
                type="button"
              >
                Reject
              </button>
              <button
                className="primary-action"
                disabled={actionsBlocked}
                onClick={() => recordReview(item.sessionId, item.artifactId, "approved_for_internal_use")}
                type="button"
              >
                {busy ? "Recording Review" : "Approve Internal Use"}
              </button>
            </div>
          </article>
        );
      })}

      {state === "ready" && queue?.count === 0 ? (
        <article className="module-row">
          <div>
            <span>queue clear</span>
            <h2>No reviewable synthetic artifacts</h2>
          </div>
          <p>Artifacts authored by this reviewer and records outside the tenant or safety boundary are excluded.</p>
          <strong>Separation of duties remains enforced.</strong>
        </article>
      ) : null}

      <p className="section-copy">{scrimedWorkReviewQueueBoundary}</p>
    </section>
  );
}
