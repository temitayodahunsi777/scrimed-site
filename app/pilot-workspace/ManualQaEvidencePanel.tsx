"use client";

import type { Session } from "@supabase/supabase-js";
import { useMemo, useState, type FormEvent } from "react";
import type {
  QaManualRunEvidenceInput,
  QaManualRunEvidencePacketRecord
} from "../lib/qaEvidenceLedger";
import type { PilotWorkspaceRecord } from "../lib/protectedPilotWorkspace";

type ManualQaEvidenceResponse = {
  packetCount?: number;
  packets?: QaManualRunEvidencePacketRecord[];
  packet?: QaManualRunEvidencePacketRecord;
  auditEventId?: string;
  evidencePacketMarkdown?: string;
  errors?: string[];
  error?: { code?: string; message?: string };
};

type FormState = {
  workflowRunId: string;
  workflowRunUrl: string;
  executedAt: string;
  baseUrl: string;
  intakeId: string;
  createdSessionId: string;
  packetAuditEventId: string;
};

const defaultFormState = (): FormState => ({
  workflowRunId: "",
  workflowRunUrl: "",
  executedAt: new Date().toISOString(),
  baseUrl: "https://app.scrimedsolutions.com",
  intakeId: "",
  createdSessionId: "",
  packetAuditEventId: ""
});

const fixedAttestations = {
  qaOutcome: "pass",
  operatorAttestation: "no-secrets-no-phi-aal2-human-run",
  tokenDisposalAttestation: "temporary-token-deleted-or-rotated",
  dataBoundary: "synthetic-business-workflow-only"
} as const;

function downloadMarkdown(filename: string, markdown: string) {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function safeFilename(value: string) {
  return value.replace(/[^a-z0-9-]/gi, "-").slice(0, 80) || "manual-qa-evidence";
}

function statusClass(hasPackets: boolean) {
  return hasPackets ? "status-pill status-pill-pass" : "status-pill status-pill-warn";
}

export default function ManualQaEvidencePanel({
  onAuditChanged,
  onEvidenceChanged,
  packets,
  session,
  workspace
}: {
  onAuditChanged: () => Promise<void>;
  onEvidenceChanged: (packets: QaManualRunEvidencePacketRecord[]) => void;
  packets: QaManualRunEvidencePacketRecord[];
  session: Session;
  workspace: PilotWorkspaceRecord;
}) {
  const [form, setForm] = useState<FormState>(() => defaultFormState());
  const [status, setStatus] = useState<"idle" | "saving" | "refreshing">("idle");
  const [message, setMessage] = useState("");
  const [latestMarkdown, setLatestMarkdown] = useState("");
  const latestPacket = packets[0] ?? null;
  const hasPackets = packets.length > 0;

  const persistenceRoute = `/api/pilot-workspaces/${workspace.slug}/qa-evidence/manual-run-packets`;
  const workflowUrl = useMemo(() => {
    const trimmedRunId = form.workflowRunId.trim();

    if (form.workflowRunUrl.trim()) {
      return form.workflowRunUrl.trim();
    }

    return trimmedRunId
      ? `https://github.com/temitayodahunsi777/scrimed-site/actions/runs/${trimmedRunId}`
      : "";
  }, [form.workflowRunId, form.workflowRunUrl]);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function refreshPackets() {
    setStatus("refreshing");
    setMessage("");
    const response = await fetch(persistenceRoute, {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });
    const body = (await response.json()) as ManualQaEvidenceResponse;
    setStatus("idle");

    if (!response.ok) {
      setMessage(body.error?.message ?? "Manual QA evidence packets could not be loaded.");
      return;
    }

    onEvidenceChanged(body.packets ?? []);
    setMessage("Manual QA evidence packets refreshed from tenant-scoped storage.");
  }

  async function persistPacket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");
    setLatestMarkdown("");

    const payload: QaManualRunEvidenceInput = {
      workflowRunId: form.workflowRunId.trim(),
      workflowRunUrl: workflowUrl,
      executedAt: form.executedAt.trim(),
      baseUrl: form.baseUrl.trim(),
      intakeId: form.intakeId.trim(),
      createdSessionId: form.createdSessionId.trim(),
      packetAuditEventId: form.packetAuditEventId.trim(),
      ...fixedAttestations
    };

    const response = await fetch(persistenceRoute, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const body = (await response.json()) as ManualQaEvidenceResponse;
    setStatus("idle");

    if (!response.ok) {
      setMessage(
        body.errors?.join(" ") ??
          body.error?.message ??
          "Manual QA evidence packet could not be persisted."
      );
      return;
    }

    if (body.packet) {
      onEvidenceChanged([body.packet, ...packets.filter((packet) => packet.id !== body.packet?.id)]);
    }

    if (body.evidencePacketMarkdown) {
      setLatestMarkdown(body.evidencePacketMarkdown);
      downloadMarkdown(
        `scrimed-${safeFilename(workspace.slug)}-${safeFilename(payload.workflowRunId)}-manual-qa-evidence.md`,
        body.evidencePacketMarkdown
      );
    }

    await onAuditChanged();
    setMessage(
      `Manual QA evidence persisted${body.auditEventId ? ` with audit event ${body.auditEventId}` : ""}.`
    );
  }

  return (
    <section className="table-section" aria-label="Manual QA evidence capture">
      <div className="section-heading">
        <p className="eyebrow">Manual QA Evidence</p>
        <h2>Persist the AAL2 Sales Demo Session QA run without copying bearer tokens into scripts.</h2>
        <p className="section-copy">
          This workflow uses the current protected browser session, stores only synthetic workflow metadata, and
          records a tenant-scoped audit event. It rejects secrets, PHI, patient identifiers, payer member identifiers,
          legal conclusions, compliance certification, and live healthcare authorization.
        </p>
      </div>

      <div className="hub-summary verification-summary" aria-label="Manual QA evidence summary">
        <article>
          <span>Retained packets</span>
          <strong>{packets.length}</strong>
        </article>
        <article>
          <span>Persistence</span>
          <strong className={statusClass(hasPackets)}>{hasPackets ? "Captured" : "Ready"}</strong>
        </article>
        <article>
          <span>Latest hash</span>
          <strong>{latestPacket?.packetSha256.slice(0, 12) ?? "pending"}</strong>
        </article>
        <article>
          <span>Boundary</span>
          <strong>synthetic only</strong>
        </article>
      </div>

      <form className="evaluation-form" onSubmit={persistPacket}>
        <div className="form-section">
          <label className="form-field">
            <span>GitHub workflow run ID</span>
            <input
              inputMode="numeric"
              onChange={(event) => updateField("workflowRunId", event.target.value.replace(/\D/g, ""))}
              required
              value={form.workflowRunId}
            />
          </label>
          <label className="form-field">
            <span>Workflow run URL</span>
            <input
              onChange={(event) => updateField("workflowRunUrl", event.target.value)}
              placeholder="Auto-filled from run ID"
              value={form.workflowRunUrl}
            />
            <small>{workflowUrl || "Enter the numeric run ID to derive the approved GitHub Actions URL."}</small>
          </label>
          <label className="form-field">
            <span>Executed at</span>
            <input
              onChange={(event) => updateField("executedAt", event.target.value)}
              required
              value={form.executedAt}
            />
          </label>
          <label className="form-field">
            <span>Base URL</span>
            <input
              onChange={(event) => updateField("baseUrl", event.target.value)}
              required
              value={form.baseUrl}
            />
          </label>
          <label className="form-field">
            <span>Target intake ID</span>
            <input
              onChange={(event) => updateField("intakeId", event.target.value)}
              required
              value={form.intakeId}
            />
          </label>
          <label className="form-field">
            <span>Created session ID</span>
            <input
              onChange={(event) => updateField("createdSessionId", event.target.value)}
              required
              value={form.createdSessionId}
            />
          </label>
          <label className="form-field">
            <span>Packet audit event ID</span>
            <input
              onChange={(event) => updateField("packetAuditEventId", event.target.value)}
              required
              value={form.packetAuditEventId}
            />
          </label>
        </div>

        <div className="principle-grid" aria-label="Fixed manual QA attestations">
          <article>
            <span>Outcome</span>
            <h3>{fixedAttestations.qaOutcome}</h3>
            <p>Only passed synthetic QA runs can be persisted.</p>
          </article>
          <article>
            <span>Operator</span>
            <h3>{fixedAttestations.operatorAttestation}</h3>
            <p>The run must be human-executed with no secrets and no PHI.</p>
          </article>
          <article>
            <span>Token disposal</span>
            <h3>{fixedAttestations.tokenDisposalAttestation}</h3>
            <p>Temporary token material must be deleted or rotated after the run.</p>
          </article>
        </div>

        <div className="form-actions">
          <button className="primary-action" disabled={status === "saving"} type="submit">
            {status === "saving" ? "Persisting Evidence" : "Persist Manual QA Evidence"}
          </button>
          <button
            className="secondary-action"
            disabled={status === "refreshing"}
            onClick={refreshPackets}
            type="button"
          >
            {status === "refreshing" ? "Refreshing Evidence" : "Refresh Evidence"}
          </button>
          {latestMarkdown ? (
            <button
              className="secondary-action"
              onClick={() =>
                downloadMarkdown(
                  `scrimed-${safeFilename(workspace.slug)}-latest-manual-qa-evidence.md`,
                  latestMarkdown
                )
              }
              type="button"
            >
              Download Latest Packet
            </button>
          ) : null}
        </div>
        {message ? <div className="intake-alert">{message}</div> : null}
      </form>

      {packets.length > 0 ? (
        <div className="demo-runbook" aria-label="Retained manual QA evidence packets">
          {packets.slice(0, 5).map((packet) => (
            <article className="module-row" key={packet.id}>
              <div>
                <span>{packet.qaOutcome}</span>
                <h2>Workflow run {packet.workflowRunId}</h2>
              </div>
              <p>
                {packet.createdAt}. Intake {packet.intakeId}. Packet hash {packet.packetSha256}.
              </p>
              <button
                className="module-link button-link"
                onClick={() =>
                  downloadMarkdown(
                    `scrimed-${safeFilename(workspace.slug)}-${safeFilename(packet.workflowRunId)}-manual-qa-evidence.md`,
                    packet.packetMarkdown
                  )
                }
                type="button"
              >
                Download Packet
              </button>
            </article>
          ))}
        </div>
      ) : (
        <article className="module-row">
          <div>
            <span>ready</span>
            <h2>No manual QA evidence packet has been retained yet.</h2>
          </div>
          <p>Run the AAL2 Sales Demo Session QA workflow, then capture its non-secret metadata here.</p>
          <strong>Do not paste bearer tokens, credentials, PHI, patient identifiers, or payer member data.</strong>
        </article>
      )}
    </section>
  );
}
