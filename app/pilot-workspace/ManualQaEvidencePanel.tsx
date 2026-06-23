"use client";

import type { Session } from "@supabase/supabase-js";
import { useMemo, useState, type FormEvent } from "react";
import type {
  QaManualRunWorkflowKind,
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
  workflowKind: QaManualRunWorkflowKind;
  workflowRunId: string;
  workflowRunUrl: string;
  executedAt: string;
  baseUrl: string;
  intakeId: string;
  createdSessionId: string;
  packetAuditEventId: string;
};

const defaultFormState = (): FormState => ({
  workflowKind: "sales-demo-session-qa",
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

function workflowLabels(workflowKind: QaManualRunWorkflowKind, workspaceSlug: string) {
  if (workflowKind === "authority-reference-qa") {
    return {
      heading: "Persist the AAL2 Authority Reference QA run without copying bearer tokens into scripts.",
      copy:
        "Use this mode after the manual Authority Reference QA workflow records one synthetic reference, verifies the renewal queue, downloads the audited packet, and deletes or rotates the temporary AAL2 token.",
      targetLabel: "Workspace target",
      targetHelp: "Use the protected workspace slug that was tested.",
      objectLabel: "Created authority reference ID",
      objectHelp: "Use the referenceId printed by the authority QA smoke.",
      auditLabel: "Authority packet audit event ID",
      route: `/api/pilot-workspaces/${workspaceSlug}/authority-artifact-references/renewal-queue`,
      packetRoute: `/api/pilot-workspaces/${workspaceSlug}/authority-artifact-references/packet`,
      runbook: "/docs/protected-authority-artifact-references.md"
    };
  }

  return {
    heading: "Persist the AAL2 Sales Demo Session QA run without copying bearer tokens into scripts.",
    copy:
      "Use this mode after the manual Sales Demo Session QA workflow creates a synthetic demo session, downloads its audited packet, and deletes or rotates the temporary AAL2 token.",
    targetLabel: "Target intake ID",
    targetHelp: "Use the explicit Sales Operations intake ID that was tested.",
    objectLabel: "Created session ID",
    objectHelp: "Use the created session UUID returned by the QA route.",
    auditLabel: "Packet audit event ID",
    route: "/api/sales-operations/qa/buyer-demo-sessions",
    packetRoute: "/api/sales-operations/opportunities/{intakeId}/demo-sessions/{sessionId}/packet",
    runbook: "/docs/operator-token-rotation.md"
  };
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
  const labels = workflowLabels(form.workflowKind, workspace.slug);

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
      workflowKind: form.workflowKind,
      workflowRunId: form.workflowRunId.trim(),
      workflowRunUrl: workflowUrl,
      executedAt: form.executedAt.trim(),
      baseUrl: form.baseUrl.trim(),
      intakeId: form.intakeId.trim(),
      createdSessionId: form.createdSessionId.trim(),
      packetAuditEventId: form.packetAuditEventId.trim(),
      evidenceTargetLabel: labels.targetLabel,
      evidenceObjectLabel: labels.objectLabel,
      packetAuditEventLabel: labels.auditLabel,
      evidenceRoute: labels.route,
      packetRoute: labels.packetRoute,
      operatorRunbook: labels.runbook,
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
        `scrimed-${safeFilename(workspace.slug)}-${safeFilename(payload.workflowKind ?? "qa")}-${safeFilename(payload.workflowRunId)}-manual-qa-evidence.md`,
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
        <h2>{labels.heading}</h2>
        <p className="section-copy">
          {labels.copy} This workflow uses the current protected browser session, stores
          only synthetic workflow metadata, and records a tenant-scoped audit event. It
          rejects secrets, PHI, patient identifiers, payer member identifiers, legal
          conclusions, compliance certification, and live healthcare authorization.
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
        <article>
          <span>Mode</span>
          <strong>{form.workflowKind}</strong>
        </article>
      </div>

      <form className="evaluation-form" onSubmit={persistPacket}>
        <div className="form-section">
          <label className="form-field form-field-wide">
            <span>QA workflow kind</span>
            <select
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  workflowKind: event.target.value as QaManualRunWorkflowKind,
                  intakeId:
                    event.target.value === "authority-reference-qa"
                      ? workspace.slug
                      : current.intakeId
                }))
              }
              value={form.workflowKind}
            >
              <option value="sales-demo-session-qa">Sales Demo Session QA</option>
              <option value="authority-reference-qa">Authority Reference QA</option>
            </select>
            <small>
              Authority Reference QA uses the created reference UUID in the created-object field.
            </small>
          </label>
          <label className="form-field">
            <span>Manual QA run ID</span>
            <input
              inputMode="numeric"
              onChange={(event) => updateField("workflowRunId", event.target.value.replace(/\D/g, ""))}
              required
              value={form.workflowRunId}
            />
            <small>Use either the GitHub Actions run ID or a SCRIMED Run Control numeric witness ID.</small>
          </label>
          <label className="form-field">
            <span>Workflow run URL</span>
            <input
              onChange={(event) => updateField("workflowRunUrl", event.target.value)}
              placeholder="Auto-filled from run ID"
              value={form.workflowRunUrl}
            />
            <small>
              {workflowUrl ||
                "Enter the GitHub Actions URL, or use https://app.scrimedsolutions.com/qa-run-control?runId={numericRunId} for a local Run Control witness."}
            </small>
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
            <span>{labels.targetLabel}</span>
            <input
              onChange={(event) => updateField("intakeId", event.target.value)}
              required
              value={form.intakeId}
            />
            <small>{labels.targetHelp}</small>
          </label>
          <label className="form-field">
            <span>{labels.objectLabel}</span>
            <input
              onChange={(event) => updateField("createdSessionId", event.target.value)}
              required
              value={form.createdSessionId}
            />
            <small>{labels.objectHelp}</small>
          </label>
          <label className="form-field">
            <span>{labels.auditLabel}</span>
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
          <a className="secondary-action" href="/qa-run-control">
            Open Run Control
          </a>
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
                {packet.createdAt}. Target {packet.intakeId}. Packet hash {packet.packetSha256}.
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
          <p>Run an AAL2 QA workflow, then capture its non-secret metadata here.</p>
          <strong>Do not paste bearer tokens, credentials, PHI, patient identifiers, or payer member data.</strong>
        </article>
      )}
    </section>
  );
}
