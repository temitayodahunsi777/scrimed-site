"use client";

import type { Session } from "@supabase/supabase-js";
import { useState } from "react";

import {
  parseScrimedWorkCanaryAttestationPayload,
  scrimedWorkCanaryAttestationBoundary,
  type ScrimedWorkCanaryAttestation
} from "../lib/scrimed-work/canaryAttestation";
import {
  parseScrimedWorkCompletionQueuePayload,
  scrimedWorkCompletionQueueBoundary,
  type ScrimedWorkCompletionQueue
} from "../lib/scrimed-work/completionQueue";
import {
  parseScrimedWorkCompletionEvidencePayload,
  scrimedWorkCompletionEvidenceBoundary,
  type ScrimedWorkCompletionEvidence
} from "../lib/scrimed-work/completionEvidence";
import type { PilotWorkspaceRecord } from "../lib/protectedPilotWorkspace";

type QueueState = "idle" | "loading" | "ready" | "denied" | "failed";
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

function currentSessionStatus(session: JsonRecord | null) {
  const history = Array.isArray(session?.statusHistory) ? session.statusHistory : [];
  const current = asRecord(history.at(-1));
  return typeof current?.status === "string" ? current.status : null;
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

export default function ScrimedWorkCompletionQueuePanel({
  onAuditChanged,
  session,
  workspace
}: {
  onAuditChanged: () => Promise<void>;
  session: Session;
  workspace: PilotWorkspaceRecord;
}) {
  const [state, setState] = useState<QueueState>("idle");
  const [queue, setQueue] = useState<ScrimedWorkCompletionQueue | null>(null);
  const [completionEvidence, setCompletionEvidence] =
    useState<ScrimedWorkCompletionEvidence | null>(null);
  const [canaryAttestation, setCanaryAttestation] =
    useState<ScrimedWorkCanaryAttestation | null>(null);
  const [message, setMessage] = useState(
    "Tenant-admin or pilot-lead membership and fresh AAL2 are checked when readiness is loaded."
  );
  const [completingSessionId, setCompletingSessionId] = useState<string | null>(null);

  const protectedHeaders = {
    Authorization: `Bearer ${session.access_token}`,
    "x-scrimed-workspace-slug": workspace.slug
  };

  async function loadQueue() {
    setState("loading");
    setMessage("Loading completion readiness and immutable synthetic/no-PHI evidence references.");

    try {
      const response = await boundedFetch(
        "/api/scrimed-work/completion-queue?limit=25&mode=ready",
        {
          headers: protectedHeaders,
          cache: "no-store"
        }
      );
      const body = await readJson(response);
      const data = asRecord(body?.data);
      const parsedQueue = parseScrimedWorkCompletionQueuePayload(data?.queue);

      if (response.status === 403) {
        setQueue(null);
        setCompletionEvidence(null);
        setCanaryAttestation(null);
        setState("denied");
        setMessage("Tenant-admin or pilot-lead membership with fresh AAL2 is required. Completion records remained closed.");
        return;
      }

      if (!response.ok || !parsedQueue) {
        setQueue(null);
        setCompletionEvidence(null);
        setCanaryAttestation(null);
        setState("failed");
        setMessage(`The completion queue failed closed: ${safeError(response, body)}.`);
        return;
      }

      setQueue(parsedQueue);
      setState("ready");

      let evidenceResponse: Response;
      try {
        evidenceResponse = await boundedFetch(
          "/api/scrimed-work/completion-queue?limit=25&mode=evidence",
          {
            headers: protectedHeaders,
            cache: "no-store"
          }
        );
      } catch {
        setCompletionEvidence(null);
        setCanaryAttestation(null);
        setMessage(
          `${parsedQueue.count} session${parsedQueue.count === 1 ? " is" : "s are"} ready for mandatory verification. Completed evidence could not be reached and remained closed.`
        );
        await onAuditChanged().catch(() => undefined);
        return;
      }

      const evidenceBody = await readJson(evidenceResponse);
      const evidenceData = asRecord(evidenceBody?.data);
      const parsedEvidence = parseScrimedWorkCompletionEvidencePayload(evidenceData?.evidence);
      const parsedCanaryAttestation = parseScrimedWorkCanaryAttestationPayload(
        evidenceData?.canaryAttestation
      );

      if (!evidenceResponse.ok || !parsedEvidence || !parsedCanaryAttestation) {
        setCompletionEvidence(null);
        setCanaryAttestation(null);
        setMessage(
          `${parsedQueue.count} session${parsedQueue.count === 1 ? " is" : "s are"} ready for mandatory verification. Completed evidence remained closed: ${safeError(evidenceResponse, evidenceBody)}.`
        );
        await onAuditChanged().catch(() => undefined);
        return;
      }

      setCompletionEvidence(parsedEvidence);
      setCanaryAttestation(parsedCanaryAttestation);
      setMessage(
        `${parsedQueue.count} session${parsedQueue.count === 1 ? " is" : "s are"} ready for mandatory verification; ${parsedEvidence.count} completed internal evidence record${parsedEvidence.count === 1 ? " is" : "s are"} retained; release binding is ${parsedCanaryAttestation.status.replaceAll("_", " ")}.`
      );
      await onAuditChanged().catch(() => undefined);
    } catch {
      setQueue(null);
      setCompletionEvidence(null);
      setCanaryAttestation(null);
      setState("failed");
      setMessage("Completion records could not be reached and remained closed.");
    }
  }

  async function verifyAndComplete(sessionId: string) {
    if (
      !window.confirm(
        "Run current mandatory verification and, only if every criterion passes, complete this synthetic work for internal use?"
      )
    ) {
      return;
    }

    setCompletingSessionId(sessionId);
    setMessage("Running mandatory verification. Completion remains blocked unless every criterion passes.");

    try {
      const verificationResponse = await boundedFetch(
        `/api/scrimed-work/sessions/${encodeURIComponent(sessionId)}/verify`,
        {
          method: "POST",
          headers: protectedHeaders
        }
      );
      const verificationBody = await readJson(verificationResponse);
      const verification = asRecord(verificationBody?.data);
      const failedCriteria = Array.isArray(verification?.failedCriteria)
        ? verification.failedCriteria
        : [];

      if (
        !verificationResponse.ok ||
        verification?.allPass !== true ||
        verification?.eligibleForCompletion !== true ||
        failedCriteria.length !== 0
      ) {
        setMessage(
          verificationResponse.ok
            ? "Mandatory verification did not pass every criterion. The session remained uncompleted."
            : `Mandatory verification failed closed: ${safeError(verificationResponse, verificationBody)}.`
        );
        return;
      }

      setMessage("Verification passed. Recording the bounded internal completion transition.");
      const completionResponse = await boundedFetch(
        `/api/scrimed-work/sessions/${encodeURIComponent(sessionId)}/complete`,
        {
          method: "POST",
          headers: {
            ...protectedHeaders,
            "Content-Type": "application/json",
            "idempotency-key": `scrimed-work-ui-complete-${crypto.randomUUID()}`
          },
          body: JSON.stringify({ workspaceSlug: workspace.slug })
        }
      );
      const completionBody = await readJson(completionResponse);
      const completionData = asRecord(completionBody?.data);
      const completedSession = asRecord(completionData?.session);

      if (!completionResponse.ok || currentSessionStatus(completedSession) !== "completed") {
        setMessage(`Internal completion failed closed: ${safeError(completionResponse, completionBody)}.`);
        return;
      }

      setMessage(
        "Verified internal completion recorded. External distribution, payer submission, EHR writeback, clinical authority, and customer go-live remain disabled."
      );
      await onAuditChanged().catch(() => undefined);
      await loadQueue();
    } catch {
      setMessage("Completion could not be confirmed and remained uncommitted.");
    } finally {
      setCompletingSessionId(null);
    }
  }

  return (
    <section className="table-section" aria-label="SCRIMED Work completion queue">
      <div className="section-heading">
        <p className="eyebrow">Verified internal completion</p>
        <h2>SCRIMED Work Completion Queue</h2>
        <p className="section-copy">
          Tenant admins and pilot leads can finalize only independently reviewed synthetic work. The platform
          recomputes mandatory verification immediately before the transition and records all access and lifecycle
          evidence.
        </p>
        <div className="form-actions">
          <button
            className="primary-action"
            disabled={state === "loading" || completingSessionId !== null}
            onClick={loadQueue}
            type="button"
          >
            {state === "loading" ? "Checking Completion Control" : "Load Completion Control"}
          </button>
        </div>
        <p role="status">{message}</p>
      </div>

      {queue?.items.map((item) => (
        <article className="module-row" key={item.sessionId}>
          <div>
            <span>{item.artifactType}</span>
            <h2>{item.title}</h2>
          </div>
          <p>
            {item.workspaceDomain} · {item.riskLevel} risk · independently reviewed
          </p>
          <strong>Verification evidence is eligible; the server will recompute it before completion.</strong>
          <div className="form-actions" aria-label={`Completion action for ${item.title}`}>
            <button
              className="primary-action"
              disabled={completingSessionId !== null}
              onClick={() => verifyAndComplete(item.sessionId)}
              type="button"
            >
              {completingSessionId === item.sessionId
                ? "Verifying and Completing"
                : "Verify and Complete Internal Work"}
            </button>
          </div>
        </article>
      ))}

      {state === "ready" && queue?.count === 0 ? (
        <article className="module-row">
          <div>
            <span>queue clear</span>
            <h2>No sessions ready for completion</h2>
          </div>
          <p>Unreviewed, failed-verification, cross-tenant, and consequential records are excluded.</p>
          <strong>The final lifecycle gate remains closed.</strong>
        </article>
      ) : null}

      {completionEvidence?.count ? (
        <div className="section-heading">
          <p className="eyebrow">Immutable metadata references</p>
          <h2>Completed Internal Evidence</h2>
          <p className="section-copy">
            These records bind independent review, mandatory verification, and the final lifecycle transition.
            They contain no artifact content and provide no external-use authority.
          </p>
        </div>
      ) : null}

      {completionEvidence?.items.map((item) => (
        <article className="module-row" key={`${item.sessionId}-${item.artifactId}`}>
          <div>
            <span>completed internal evidence</span>
            <h2>{item.title}</h2>
          </div>
          <p>
            {item.artifactType} · {item.workspaceDomain} · {item.riskLevel} risk · completed {item.completedAt}
          </p>
          <strong>Independent review and 100% mandatory verification are bound.</strong>
          <p style={{ overflowWrap: "anywhere" }}>Packet hash: {item.evidencePacketHash}</p>
          <p style={{ overflowWrap: "anywhere" }}>
            Review event: {item.reviewEventId} · Completion event: {item.completionEventId}
          </p>
          <p>
            Internal use only. External distribution, payer submission, EHR writeback, and clinical authority remain
            disabled.
          </p>
        </article>
      ))}

      {state === "ready" && completionEvidence?.count === 0 ? (
        <article className="module-row">
          <div>
            <span>evidence history clear</span>
            <h2>No completed evidence records yet</h2>
          </div>
          <p>Only fully verified, independently reviewed, completed synthetic sessions can appear here.</p>
          <strong>Incomplete and cross-tenant records remain excluded.</strong>
        </article>
      ) : null}

      {canaryAttestation ? (
        <article className="module-row">
          <div>
            <span>release-bound canary</span>
            <h2>
              {canaryAttestation.eligibleForReleaseBinding
                ? "Derived Evidence Ready"
                : "Release Binding Still Required"}
            </h2>
          </div>
          <p>
            Status: {canaryAttestation.status.replaceAll("_", " ")} · release {canaryAttestation.releaseShaFingerprint}
          </p>
          <p>
            Workspace: {canaryAttestation.workspaceSlug} · completed {canaryAttestation.freshness.completedAt ?? "unavailable"}
          </p>
          <p>
            Freshness: {canaryAttestation.freshness.fresh ? "within promotion window" : "stale or unavailable"} · age {canaryAttestation.freshness.ageHours?.toFixed(2) ?? "unavailable"} hours · maximum {canaryAttestation.freshness.maxAgeHours} hours
          </p>
          <strong>
            {canaryAttestation.eligibleForReleaseBinding
              ? "Immutable completion evidence is bound to this exact workspace and deployed commit within the required freshness window."
              : "No release-ready canary identifier is issued until immutable completion evidence, workspace, deployment identity, and freshness are all valid."}
          </strong>
          {canaryAttestation.evidenceId ? (
            <p style={{ overflowWrap: "anywhere" }}>Evidence ID: {canaryAttestation.evidenceId}</p>
          ) : null}
          <p>
            This attestation is metadata-only and internal-use-only. It does not authorize PHI, live care,
            external distribution, payer submission, EHR writeback, certification, or customer go-live.
          </p>
        </article>
      ) : null}

      <p className="section-copy">{scrimedWorkCompletionQueueBoundary}</p>
      <p className="section-copy">{scrimedWorkCompletionEvidenceBoundary}</p>
      <p className="section-copy">{scrimedWorkCanaryAttestationBoundary}</p>
    </section>
  );
}
