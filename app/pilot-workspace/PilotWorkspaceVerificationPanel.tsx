"use client";

import type { Session } from "@supabase/supabase-js";
import { useMemo, useState } from "react";
import type { TenantSessionVerificationReadiness } from "../lib/pilotDemoReadiness";
import type { PilotWorkspaceRecord } from "../lib/protectedPilotWorkspace";

type VerificationStatus = "idle" | "running" | "complete" | "error";
type CheckStatus = "pending" | "pass" | "warn" | "fail";

type VerificationCheck = {
  id: string;
  label: string;
  route: string;
  expected: number[];
  status: CheckStatus;
  detail: string;
  audited: boolean;
};

type ErrorBody = {
  error?: { code?: string; message?: string };
};

const verificationBoundary =
  "This verification uses the current tenant browser session to validate protected synthetic-pilot controls. It does not store bearer tokens in CI, does not accept PHI, and does not authorize live clinical execution.";

function initialChecks(workspaceSlug: string): VerificationCheck[] {
  return [
    {
      id: "sessions",
      label: "Durable Sessions",
      route: `/api/pilot-workspaces/${workspaceSlug}/sessions`,
      expected: [200],
      status: "pending",
      detail: "Not run",
      audited: false
    },
    {
      id: "audit",
      label: "Append-only Audit",
      route: `/api/pilot-workspaces/${workspaceSlug}/audit`,
      expected: [200],
      status: "pending",
      detail: "Not run",
      audited: false
    },
    {
      id: "work-orders",
      label: "Agent Work Orders",
      route: `/api/agent-workspaces/${workspaceSlug}/work-orders`,
      expected: [200],
      status: "pending",
      detail: "Not run",
      audited: false
    },
    {
      id: "governance-ledger",
      label: "Governance Ledger",
      route: `/api/agent-workspaces/${workspaceSlug}/governance-ledger`,
      expected: [200],
      status: "pending",
      detail: "Not run",
      audited: false
    },
    {
      id: "trustops",
      label: "TrustOps Incidents",
      route: `/api/pilot-workspaces/${workspaceSlug}/trust-safety-incidents`,
      expected: [200],
      status: "pending",
      detail: "Not run",
      audited: false
    },
    {
      id: "tenant-access",
      label: "Tenant Access",
      route: `/api/pilot-workspaces/${workspaceSlug}/tenant-access`,
      expected: [200, 403],
      status: "pending",
      detail: "Not run",
      audited: false
    },
    {
      id: "enterprise-proof",
      label: "Enterprise Proof Packet",
      route: `/api/pilot-workspaces/${workspaceSlug}/enterprise-proof-packet`,
      expected: [200],
      status: "pending",
      detail: "Not run",
      audited: true
    }
  ];
}

function statusLabel(status: CheckStatus) {
  if (status === "pass") return "Pass";
  if (status === "warn") return "Review";
  if (status === "fail") return "Fail";
  return "Pending";
}

function statusClass(status: CheckStatus) {
  if (status === "pass") return "status-pill status-pill-pass";
  if (status === "warn") return "status-pill status-pill-warn";
  if (status === "fail") return "status-pill status-pill-fail";
  return "status-pill";
}

async function readErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as ErrorBody;
    return body.error?.message ?? body.error?.code ?? response.statusText;
  } catch {
    return response.statusText;
  }
}

export default function PilotWorkspaceVerificationPanel({
  onVerificationChanged,
  session,
  workspace,
  onAuditChanged
}: {
  onVerificationChanged?: (verification: TenantSessionVerificationReadiness) => void;
  session: Session;
  workspace: PilotWorkspaceRecord;
  onAuditChanged: () => Promise<void>;
}) {
  const [status, setStatus] = useState<VerificationStatus>("idle");
  const [message, setMessage] = useState("");
  const [checks, setChecks] = useState<VerificationCheck[]>(() => initialChecks(workspace.slug));

  const summary = useMemo(() => {
    const passed = checks.filter((check) => check.status === "pass").length;
    const warnings = checks.filter((check) => check.status === "warn").length;
    const failed = checks.filter((check) => check.status === "fail").length;

    return { failed, passed, total: checks.length, warnings };
  }, [checks]);

  async function runVerification() {
    const nextChecks = initialChecks(workspace.slug);
    setChecks(nextChecks);
    setStatus("running");
    setMessage("Running tenant-session verification with the current AAL2 browser session.");
    onVerificationChanged?.({
      failed: 0,
      passed: 0,
      status: "running",
      total: nextChecks.length,
      updatedAt: new Date().toISOString(),
      warnings: 0
    });

    const completedChecks: VerificationCheck[] = [];

    for (const check of nextChecks) {
      try {
        const response = await fetch(check.route, {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (!check.expected.includes(response.status)) {
          const detail = await readErrorMessage(response);
          completedChecks.push({
            ...check,
            detail: `${response.status} ${detail}`,
            status: "fail"
          });
          setChecks([...completedChecks, ...nextChecks.slice(completedChecks.length)]);
          continue;
        }

        if (check.id === "enterprise-proof") {
          const text = await response.text();

          if (!text.includes("SCRIMED Enterprise Proof Packet")) {
            throw new Error("Packet heading was missing from the returned artifact.");
          }
        } else {
          await response.text();
        }

        const statusForCheck =
          check.id === "tenant-access" && response.status === 403 ? "warn" : "pass";
        const detail =
          check.id === "tenant-access" && response.status === 403
            ? "Tenant access administration is tenant-admin only for this identity."
            : `${response.status} ${response.statusText || "OK"}`;

        completedChecks.push({
          ...check,
          detail,
          status: statusForCheck
        });
      } catch (error) {
        completedChecks.push({
          ...check,
          detail: error instanceof Error ? error.message : "Verification failed.",
          status: "fail"
        });
      }

      setChecks([...completedChecks, ...nextChecks.slice(completedChecks.length)]);
    }

    await onAuditChanged();
    const failed = completedChecks.filter((check) => check.status === "fail").length;
    const warnings = completedChecks.filter((check) => check.status === "warn").length;
    const passed = completedChecks.filter((check) => check.status === "pass").length;
    setStatus(failed > 0 ? "error" : "complete");
    onVerificationChanged?.({
      failed,
      passed,
      status: failed > 0 ? "error" : "complete",
      total: completedChecks.length,
      updatedAt: new Date().toISOString(),
      warnings
    });
    setMessage(
      failed > 0
        ? "Verification completed with failures. Review failed routes before buyer demo use."
        : warnings > 0
          ? "Verification completed with role-limited warnings."
          : "Verification completed. Protected tenant-session controls are responding."
    );
  }

  return (
    <section className="table-section" id="tenant-session-verification" aria-label="Tenant-session verification">
      <div className="section-heading">
        <p className="eyebrow">Tenant-session verification</p>
        <h2>Run protected workspace checks without storing CI bearer tokens.</h2>
        <p className="section-copy">
          {verificationBoundary} The enterprise proof-packet check intentionally records a packet-download audit
          event before validating the returned Markdown artifact.
        </p>
        <div className="form-actions">
          <button
            className="primary-action"
            disabled={status === "running"}
            onClick={runVerification}
            type="button"
          >
            {status === "running" ? "Running Verification" : "Run Tenant Verification"}
          </button>
        </div>
        {message ? <div className="intake-alert">{message}</div> : null}
      </div>

      <div className="hub-summary verification-summary" aria-label="Verification summary">
        <article>
          <span>Checks</span>
          <strong>{summary.total}</strong>
        </article>
        <article>
          <span>Passed</span>
          <strong>{summary.passed}</strong>
        </article>
        <article>
          <span>Review</span>
          <strong>{summary.warnings}</strong>
        </article>
        <article>
          <span>Failed</span>
          <strong>{summary.failed}</strong>
        </article>
      </div>

      {checks.map((check) => (
        <article className="module-row" key={check.id}>
          <div>
            <span>{check.audited ? "audited check" : "read check"}</span>
            <h2>{check.label}</h2>
            <p>{check.route}</p>
          </div>
          <strong className={statusClass(check.status)}>{statusLabel(check.status)}</strong>
          <p>{check.detail}</p>
        </article>
      ))}
    </section>
  );
}
