"use client";

import { useCallback, useEffect, useState } from "react";
import type { PilotWorkspaceRecord } from "../lib/protectedPilotWorkspace";
import type { P32SupplementalEvidenceFile } from "../lib/scrimedP32EvidenceAttestation";

type CandidateReviewSummary = {
  reviewerIdentityHash: string;
  fingerprints: {
    sourceCommit: string;
    sourceTreeFingerprint: string;
    artifactFingerprint: string;
    validationEvidenceFingerprint: string;
    reviewPacketFingerprint: string;
  };
  issuer: {
    issuer: string;
    keyId: string;
    publicKeyFingerprint: string;
  };
  actorCapabilities: {
    workspaceRole: "tenant-admin" | "pilot-lead" | "reviewer" | "observer";
    accessMode: "assign-review" | "record-review" | "read-only";
    canAssignReview: boolean;
    canRecordDecision: boolean;
  };
  boundary: string;
};

type CandidateReviewResponse = Partial<CandidateReviewSummary> & {
  assignment?: {
    assignmentId: string;
    expiresAt: string;
  };
  evidenceFile?: P32SupplementalEvidenceFile;
  receipt?: {
    auditHash: string;
    assignmentId?: string;
    approvalId?: string;
  };
  error?: { code?: string; message?: string };
};

type Props = {
  accessToken: string;
  workspace: PilotWorkspaceRecord;
};

const assignmentIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function shortHash(value: string | undefined) {
  return value ? `${value.slice(0, 12)}...${value.slice(-8)}` : "Unavailable";
}

function displayWorkspaceRole(role: CandidateReviewSummary["actorCapabilities"]["workspaceRole"]) {
  return role.split("-").map((part) => `${part[0].toUpperCase()}${part.slice(1)}`).join(" ");
}

export default function P32CandidateReviewPanel({ accessToken, workspace }: Props) {
  const [summary, setSummary] = useState<CandidateReviewSummary | null>(null);
  const [reviewerHash, setReviewerHash] = useState("");
  const [assignmentId, setAssignmentId] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<P32SupplementalEvidenceFile | null>(null);
  const [message, setMessage] = useState("Loading candidate-review readiness.");
  const [busy, setBusy] = useState<"loading" | "assigning" | "deciding" | null>("loading");

  const endpoint = `/api/pilot-workspaces/${encodeURIComponent(
    workspace.slug
  )}/qa-evidence/p32-candidate-review`;

  const loadSummary = useCallback(async () => {
    setBusy("loading");
    try {
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store"
      });
      const body = (await response.json()) as CandidateReviewResponse;
      if (
        !response.ok ||
        !body.reviewerIdentityHash ||
        !body.fingerprints ||
        !body.issuer ||
        !body.actorCapabilities
      ) {
        setSummary(null);
        setMessage(
          body.error?.message ??
            "Candidate review is unavailable until the protected feature, exact candidate, key, and ledger are provisioned."
        );
        return;
      }
      setSummary(body as CandidateReviewSummary);
      if (body.actorCapabilities.canAssignReview) {
        setMessage("Candidate-bound assignment controls are ready for a distinct reviewer.");
      } else if (body.actorCapabilities.canRecordDecision) {
        setMessage("Copy your protected identity hash, then use the assignment ID supplied by the administrator.");
      } else {
        setMessage("Candidate-review evidence is available in read-only mode for this workspace role.");
      }
    } catch {
      setSummary(null);
      setMessage(
        "Candidate-review readiness could not be verified. No action was recorded."
      );
    } finally {
      setBusy(null);
    }
  }, [accessToken, endpoint]);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => void loadSummary(), 0);
    return () => window.clearTimeout(loadTimer);
  }, [loadSummary]);

  async function copyReviewerIdentity() {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary.reviewerIdentityHash);
      setMessage("Reviewer identity hash copied. It contains no email address or raw user ID.");
    } catch {
      setMessage("Select and copy the read-only reviewer identity hash manually.");
    }
  }

  async function assignReviewer() {
    if (!/^[0-9a-f]{64}$/.test(reviewerHash)) {
      setMessage("Enter the 64-character identity hash shown in the assigned reviewer’s panel.");
      return;
    }
    setBusy("assigning");
    try {
      const response = await fetch(`${endpoint}?action=assign`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID()
        },
        body: JSON.stringify({ reviewerIdentityHash: reviewerHash })
      });
      const body = (await response.json()) as CandidateReviewResponse;
      if (!response.ok || !body.assignment?.assignmentId) {
        setMessage(body.error?.message ?? "Candidate-review assignment failed closed.");
        return;
      }
      setAssignmentId(body.assignment.assignmentId);
      setMessage(
        `Assignment recorded. It expires ${new Date(body.assignment.expiresAt).toLocaleString()}. Send only the assignment ID to the reviewer.`
      );
    } catch {
      setMessage("Candidate-review assignment could not be verified. No action was recorded.");
    } finally {
      setBusy(null);
    }
  }

  async function copyAssignmentId() {
    if (!assignmentIdPattern.test(assignmentId)) {
      setMessage("Record a candidate-review assignment before copying its ID.");
      return;
    }
    try {
      await navigator.clipboard.writeText(assignmentId);
      setMessage("Assignment ID copied. Send it only to the assigned reviewer.");
    } catch {
      setMessage("Select and copy the read-only assignment ID manually.");
    }
  }

  async function recordDecision(decision: "approved" | "rejected") {
    if (!assignmentIdPattern.test(assignmentId)) {
      setMessage("Enter the candidate-review assignment ID supplied by the assigning administrator.");
      return;
    }
    const prompt = decision === "approved"
      ? "Record an immutable approval for source review only? This does not authorize deployment, migration, PHI, or clinical action."
      : "Record an immutable rejection requiring material changes?";
    if (!window.confirm(prompt)) return;

    setBusy("deciding");
    try {
      const response = await fetch(`${endpoint}?action=decide`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID()
        },
        body: JSON.stringify({
          assignmentId,
          decision,
          reasonCode:
            decision === "approved"
              ? "review-complete-no-material-blockers"
              : "material-changes-required"
        })
      });
      const body = (await response.json()) as CandidateReviewResponse;
      if (!response.ok || !body.evidenceFile || !body.receipt?.auditHash) {
        setMessage(body.error?.message ?? "Candidate-review decision failed closed.");
        return;
      }
      setEvidenceFile(body.evidenceFile);
      setMessage(
        `${decision === "approved" ? "Approval" : "Rejection"} recorded with append-only audit receipt ${shortHash(body.receipt.auditHash)}.`
      );
    } catch {
      setMessage("Candidate-review decision could not be verified. No action was recorded.");
    } finally {
      setBusy(null);
    }
  }

  function downloadEvidence() {
    if (!evidenceFile) return;
    const blob = new Blob([`${JSON.stringify(evidenceFile, null, 2)}\n`], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `scrimed-p32-candidate-review-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="section-band" aria-labelledby="p32-candidate-review-heading">
      <div>
        <p className="eyebrow">P.32 Candidate Review</p>
        <h2 id="p32-candidate-review-heading">Bind source review to one exact candidate.</h2>
        <p className="section-copy">
          Admins assign a candidate to a distinct active reviewer. The reviewer records one
          AAL2 decision against exact source, artifact, validation, and packet fingerprints.
          This control never grants release or production authority.
        </p>
        <div className="intake-alert" role="status" aria-live="polite">{message}</div>
      </div>

      {summary ? (
        <div className="evaluation-form">
          <div className="hub-summary">
            <article>
              <span>Source commit</span>
              <strong>{shortHash(summary.fingerprints.sourceCommit)}</strong>
            </article>
            <article>
              <span>Source tree</span>
              <strong>{shortHash(summary.fingerprints.sourceTreeFingerprint)}</strong>
            </article>
            <article>
              <span>Review packet</span>
              <strong>{shortHash(summary.fingerprints.reviewPacketFingerprint)}</strong>
            </article>
            <article>
              <span>Issuer key</span>
              <strong>{summary.issuer.keyId}</strong>
            </article>
            <article>
              <span>Your workspace role</span>
              <strong>{displayWorkspaceRole(summary.actorCapabilities.workspaceRole)}</strong>
            </article>
          </div>

          {summary.actorCapabilities.canRecordDecision ? (
            <div className="form-section">
              <label className="form-field">
                <span>Your protected reviewer identity</span>
                <input readOnly spellCheck={false} value={summary.reviewerIdentityHash} />
                <small>Hashed workspace identity only; no email address or raw user ID.</small>
              </label>
              <div className="form-actions">
                <button className="secondary-action" onClick={copyReviewerIdentity} type="button">
                  Copy Identity Hash
                </button>
              </div>
            </div>
          ) : null}

          {summary.actorCapabilities.canAssignReview ? (
            <div className="form-section">
              <div>
                <h3>Assign distinct reviewer</h3>
                <p className="section-copy">
                  The database denies self-assignment and requires an active reviewer membership.
                </p>
              </div>
              <label className="form-field">
                <span>Reviewer identity hash</span>
                <input
                  autoComplete="off"
                  maxLength={64}
                  onChange={(event) => setReviewerHash(event.target.value.trim().toLowerCase())}
                  placeholder="64-character SHA-256 identity hash"
                  spellCheck={false}
                  value={reviewerHash}
                />
              </label>
              <div className="form-actions">
                <button
                  className="secondary-action"
                  disabled={busy !== null}
                  onClick={assignReviewer}
                  type="button"
                >
                  {busy === "assigning" ? "Recording Assignment" : "Assign Candidate Review"}
                </button>
                <button
                  className="secondary-action"
                  disabled={busy !== null || !assignmentIdPattern.test(assignmentId)}
                  onClick={copyAssignmentId}
                  type="button"
                >
                  Copy Assignment ID
                </button>
              </div>
            </div>
          ) : null}

          {summary.actorCapabilities.canRecordDecision ? (
            <div className="form-section">
              <div>
                <h3>Reviewer disposition</h3>
                <p className="section-copy">
                  The exact candidate and assignment must remain current.
                </p>
              </div>
              <label className="form-field">
                <span>Assignment ID</span>
                <input
                  autoComplete="off"
                  onChange={(event) => setAssignmentId(event.target.value.trim())}
                  pattern={assignmentIdPattern.source}
                  placeholder="Candidate-review assignment UUID"
                  spellCheck={false}
                  value={assignmentId}
                />
              </label>
              <div className="form-actions">
                <button
                  className="primary-action"
                  disabled={busy !== null || !assignmentIdPattern.test(assignmentId)}
                  onClick={() => recordDecision("approved")}
                  type="button"
                >
                  Approve Source Review
                </button>
                <button
                  className="secondary-action"
                  disabled={busy !== null || !assignmentIdPattern.test(assignmentId)}
                  onClick={() => recordDecision("rejected")}
                  type="button"
                >
                  Reject Candidate
                </button>
              </div>
            </div>
          ) : null}

          {summary.actorCapabilities.accessMode === "read-only" ? (
            <div className="form-section">
              <div>
                <h3>Read-only candidate evidence</h3>
                <p className="section-copy">
                  Observer access can inspect candidate fingerprints but cannot assign or decide a review.
                </p>
              </div>
            </div>
          ) : null}

          {evidenceFile ? (
            <div className="form-section">
              <div>
                <h3>Signed review evidence</h3>
                <p className="section-copy">
                  Short-lived transfer artifact. Store it only in the approved evidence channel.
                </p>
              </div>
              <div className="form-actions">
                <button className="secondary-action" onClick={downloadEvidence} type="button">
                  Download Review Evidence
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <button
          className="secondary-action"
          disabled={busy === "loading"}
          onClick={() => void loadSummary()}
          type="button"
        >
          {busy === "loading" ? "Checking Readiness" : "Retry Readiness Check"}
        </button>
      )}
    </section>
  );
}
