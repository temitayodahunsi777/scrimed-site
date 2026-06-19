"use client";

import type { ClinicalActivationApprovalWorkflow } from "../lib/clinicalActivationApprovals";

function approvalStatusLabel(status: string) {
  if (status === "readiness-attested-no-phi") return "Readiness Attested";
  if (status === "external-review-required-acknowledged") return "External Review Acknowledged";
  if (status === "customer-specific-required-acknowledged") return "Customer Specific";
  return "Go-Live Blocked";
}

function approvalStatusClass(status: string) {
  if (status === "readiness-attested-no-phi") return "status-pill status-pill-pass";
  if (status === "external-review-required-acknowledged") return "status-pill status-pill-warn";
  if (status === "customer-specific-required-acknowledged") return "status-pill status-pill-warn";
  return "status-pill status-pill-fail";
}

export default function ClinicalActivationApprovalsPanel({
  busyDomainId,
  onDownloadPacket,
  onRecordApproval,
  packetBusy,
  workflow
}: {
  busyDomainId: string | null;
  onDownloadPacket: () => Promise<void>;
  onRecordApproval: (domainId: string) => Promise<void>;
  packetBusy: boolean;
  workflow: ClinicalActivationApprovalWorkflow | null;
}) {
  if (!workflow) {
    return (
      <section className="table-section" aria-label="Clinical activation approval workflow">
        <div className="section-heading">
          <p className="eyebrow">Clinical Approval Workflow</p>
          <h2>No-PHI readiness attestation ledger is loading.</h2>
          <p className="section-copy">
            Approval capture remains blocked until a protected AAL2 workspace session loads the
            current tenant evidence.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="table-section" aria-label="Clinical activation approval workflow">
      <div className="section-heading">
        <p className="eyebrow">Clinical Approval Workflow</p>
        <h2>Capture no-PHI readiness attestations while live care stays blocked.</h2>
        <p className="section-copy">{workflow.boundary}</p>
        <div className="form-actions">
          <button
            className="primary-action"
            disabled={packetBusy}
            onClick={() => void onDownloadPacket()}
            type="button"
          >
            {packetBusy ? "Preparing Approval Packet" : "Download Approval Workflow Packet"}
          </button>
        </div>
      </div>

      <div className="hub-summary demo-readiness-summary" aria-label="Clinical approval workflow summary">
        <article>
          <span>Ledger</span>
          <strong>{workflow.persistenceStatus}</strong>
        </article>
        <article>
          <span>Domains</span>
          <strong>{workflow.summary.domainCount}</strong>
        </article>
        <article>
          <span>Attested</span>
          <strong>{workflow.summary.attestedDomainCount}</strong>
        </article>
        <article>
          <span>Missing</span>
          <strong>{workflow.summary.missingDomainCount}</strong>
        </article>
        <article>
          <span>Retained blockers</span>
          <strong>{workflow.summary.retainedBlockerCount}</strong>
        </article>
        <article>
          <span>Care authority</span>
          <strong>{workflow.clinicalGoLiveAuthority}</strong>
        </article>
      </div>

      <div className="agent-readiness-grid demo-readiness-brief" aria-label="Clinical activation approval domains">
        {workflow.domains.map((domain) => (
          <article key={domain.domainId}>
            <span>{domain.domainId}</span>
            <strong>{domain.domainLabel}</strong>
            <p>{domain.legalClinicalFinancialBrandValue}</p>
            <strong className={approvalStatusClass(domain.approvalStatus)}>
              {approvalStatusLabel(domain.approvalStatus)}
            </strong>
            <p>
              Latest signer: {domain.latestApproval?.signedBy ?? "not recorded"}. Latest signed at:{" "}
              {domain.latestApproval?.signedAt ?? "not recorded"}.
            </p>
            <button
              className="secondary-action"
              disabled={busyDomainId === domain.domainId}
              onClick={() => void onRecordApproval(domain.domainId)}
              type="button"
            >
              {busyDomainId === domain.domainId ? "Recording" : "Record No-PHI Attestation"}
            </button>
          </article>
        ))}
      </div>

      <div className="demo-runbook" aria-label="Clinical activation safe workarounds">
        <div className="section-heading">
          <p className="eyebrow">Safe workarounds</p>
          <h2>Use external signed evidence while production authorization stays gated.</h2>
        </div>
        {workflow.safeWorkarounds.map((workaround) => (
          <article className="module-row" key={workaround}>
            <div>
              <span>workaround</span>
              <h2>{workaround}</h2>
            </div>
          </article>
        ))}
      </div>

      {workflow.unavailableSections.length > 0 ? (
        <article className="module-row">
          <div>
            <span>degraded evidence</span>
            <h2>Some approval workflow sections are using fallback handling.</h2>
          </div>
          <ul className="compact-list">
            {workflow.unavailableSections.map((section) => (
              <li key={section}>{section}</li>
            ))}
          </ul>
        </article>
      ) : null}
    </section>
  );
}
