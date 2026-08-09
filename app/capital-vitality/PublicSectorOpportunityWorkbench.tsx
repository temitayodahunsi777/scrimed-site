"use client";

import { useMemo, useState } from "react";
import {
  capitalAcquisitionReadinessBoundary,
  evaluatePublicSectorOpportunity,
  publicSectorOpportunityInputTemplate,
  type PublicSectorOpportunityInputs
} from "../lib/capitalAcquisitionReadiness";
import {
  buildCapitalAcquisitionCapturePacket,
  buildCapitalAcquisitionCapturePacketMarkdown,
  capitalAcquisitionCapturePacketBoundary
} from "../lib/capitalAcquisitionCapturePacket";

type SelectField = Exclude<
  keyof PublicSectorOpportunityInputs,
  "requiresLivePhi" | "requiresAutonomousClinicalAction" | "requiresEhrWriteback" | "requiresPayerSubmission"
>;

const selectFields: Array<{
  field: SelectField;
  label: string;
  hint: string;
  options: Array<{ value: string; label: string }>;
}> = [
  {
    field: "lane",
    label: "Opportunity lane",
    hint: "Choose the actual acquisition path; requirements vary by program and jurisdiction.",
    options: [
      { value: "federal-prime-contract", label: "Federal prime contract" },
      { value: "federal-subcontracting", label: "Federal subcontract or teaming" },
      { value: "federal-grant", label: "Federal grant or cooperative agreement" },
      { value: "sbir-sttr", label: "SBIR/STTR" },
      { value: "state-local-public-sector", label: "State, local, or public health" }
    ]
  },
  {
    field: "officialNotice",
    label: "Official notice",
    hint: "Verify in the authoritative government source, including all amendments.",
    options: [
      { value: "unknown", label: "Unknown" },
      { value: "verified-current", label: "Verified current" },
      { value: "missing", label: "Missing" },
      { value: "expired", label: "Stale or expired" }
    ]
  },
  {
    field: "deadline",
    label: "Deadline",
    hint: "Use the deadline in the current official notice or amendment.",
    options: [
      { value: "unknown", label: "Unknown" },
      { value: "open", label: "Verified open" },
      { value: "closed", label: "Closed" }
    ]
  },
  {
    field: "scopeFit",
    label: "Current SCRIMED scope fit",
    hint: "Rate only current sellable, supportable, and safely bounded capabilities.",
    options: [
      { value: "unknown", label: "Unknown" },
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" }
    ]
  },
  {
    field: "applicableRegistration",
    label: "Applicable registration",
    hint: "SAM.gov or jurisdiction-specific evidence must be checked externally and remain current.",
    options: [
      { value: "unknown", label: "Unknown" },
      { value: "verified-current", label: "Verified current" },
      { value: "missing", label: "Missing" },
      { value: "expired", label: "Expired" }
    ]
  },
  {
    field: "programEligibility",
    label: "Program eligibility",
    hint: "Use a qualified, opportunity-specific review; do not infer eligibility from company size alone.",
    options: [
      { value: "unknown", label: "Unknown" },
      { value: "verified-eligible", label: "Verified for this opportunity" },
      { value: "not-eligible", label: "Not eligible" }
    ]
  },
  ...[
    ["solicitationCompliance", "Solicitation and clause review"],
    ["securityPrivacyReview", "Security, privacy, and data review"],
    ["financeDeliveryReview", "Finance, pricing, and delivery review"],
    ["evidenceReadiness", "Capability and evidence review"],
    ["humanBidApproval", "Named human bid approval"]
  ].map(([field, label]) => ({
    field: field as SelectField,
    label,
    hint: "Approval must come from the named qualified owner for the exact opportunity and packet.",
    options: [
      { value: "not-started", label: "Not started" },
      { value: "in-review", label: "In review" },
      { value: "approved", label: "Approved for internal progression" },
      { value: "rejected", label: "Rejected" }
    ]
  }))
];

const boundaryFields: Array<{
  field: "requiresLivePhi" | "requiresAutonomousClinicalAction" | "requiresEhrWriteback" | "requiresPayerSubmission";
  label: string;
}> = [
  { field: "requiresLivePhi", label: "Scope requires live PHI authority" },
  { field: "requiresAutonomousClinicalAction", label: "Scope requires autonomous clinical action" },
  { field: "requiresEhrWriteback", label: "Scope requires production EHR writeback" },
  { field: "requiresPayerSubmission", label: "Scope requires autonomous payer submission" }
];

export default function PublicSectorOpportunityWorkbench() {
  const [inputs, setInputs] = useState<PublicSectorOpportunityInputs>(publicSectorOpportunityInputTemplate);
  const assessment = useMemo(() => evaluatePublicSectorOpportunity(inputs), [inputs]);
  const capturePacketResult = useMemo(
    () => buildCapitalAcquisitionCapturePacket({ opportunity: inputs }),
    [inputs]
  );

  function updateSelect(field: SelectField, value: string) {
    setInputs((current) => ({ ...current, [field]: value } as PublicSectorOpportunityInputs));
  }

  function updateBoundary(field: (typeof boundaryFields)[number]["field"], value: boolean) {
    setInputs((current) => ({ ...current, [field]: value }));
  }

  function downloadInternalCapturePacket() {
    const packet = buildCapitalAcquisitionCapturePacketMarkdown({ opportunity: inputs });
    const url = URL.createObjectURL(new Blob([packet], { type: "text/markdown;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `scrimed-${inputs.lane}-internal-capture-packet.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="table-section" id="public-sector-opportunity-workbench" aria-label="Public-sector opportunity workbench">
      <div className="section-heading">
        <p className="eyebrow">Public-sector opportunity workbench</p>
        <h2>Qualify one real opportunity by its weakest gate before spending proposal time.</h2>
        <p className="section-copy">
          This browser-only evaluator stores and transmits nothing. Enter readiness states only, never proposal text, UEIs, CAGE codes, tax identifiers, credentials, controlled information, PHI, pricing, or customer data. It cannot submit, certify, sign, contact, or award anything.
        </p>
      </div>

      <form onSubmit={(event) => event.preventDefault()}>
        <div className="form-grid">
          {selectFields.map((definition) => (
            <label className="form-field" key={definition.field}>
              <span>{definition.label}</span>
              <select
                value={String(inputs[definition.field])}
                onChange={(event) => updateSelect(definition.field, event.target.value)}
              >
                {definition.options.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <small>{definition.hint}</small>
            </label>
          ))}
        </div>

        <fieldset className="workbench-notice">
          <legend>Current NO-GO requirements</legend>
          <p>Check any capability the opportunity requires. A checked boundary produces a no-bid hard stop in the current product state.</p>
          {boundaryFields.map((definition) => (
            <label className="form-field" key={definition.field}>
              <span>
                <input
                  checked={inputs[definition.field]}
                  type="checkbox"
                  onChange={(event) => updateBoundary(definition.field, event.target.checked)}
                />{" "}
                {definition.label}
              </span>
            </label>
          ))}
        </fieldset>

        <div className="hero-actions">
          <button
            className="secondary-action"
            type="button"
            onClick={() => setInputs(publicSectorOpportunityInputTemplate)}
          >
            Clear readiness states
          </button>
          <button
            className="secondary-action"
            type="button"
            onClick={downloadInternalCapturePacket}
          >
            Download internal capture packet
          </button>
        </div>
      </form>

      <div className="workbench-notice" aria-live="polite">
        <strong>{assessment.decision}</strong>
        <p>{assessment.nextAction}</p>
        <p>{capitalAcquisitionReadinessBoundary}</p>
      </div>

      <div className="hub-summary" aria-label="Public-sector qualification summary">
        <article>
          <span>Passed gates</span>
          <strong>{assessment.completedGateCount}/{assessment.totalGateCount}</strong>
        </article>
        <article>
          <span>Missing gates</span>
          <strong>{assessment.missingGateIds.length}</strong>
        </article>
        <article>
          <span>Hard stops</span>
          <strong>{assessment.hardStops.length}</strong>
        </article>
        <article>
          <span>External submission</span>
          <strong>not authorized</strong>
        </article>
      </div>

      {assessment.hardStops.length > 0 ? (
        <div className="workbench-export-lock">
          <strong>No-bid hard stops</strong>
          <ul className="compact-list">
            {assessment.hardStops.map((hardStop) => <li key={hardStop}>{hardStop}</li>)}
          </ul>
        </div>
      ) : null}

      {assessment.missingGateIds.length > 0 ? (
        <div className="workbench-export-lock">
          <strong>Unresolved gates</strong>
          <p>{assessment.missingGateIds.join(", ")}</p>
        </div>
      ) : null}

      <div className="workbench-export-lock">
        <strong>Human authority remains mandatory</strong>
        <ul className="compact-list">
          {assessment.reviewWarnings.map((warning) => <li key={warning}>{warning}</li>)}
          <li>Contract award authority: {assessment.contractAwardAuthority}</li>
          <li>Grant award authority: {assessment.grantAwardAuthority}</li>
          <li>Registration authority: {assessment.registrationAuthority}</li>
          <li>Certification authority: {assessment.certificationAuthority}</li>
        </ul>
      </div>

      <div className="section-heading">
        <p className="eyebrow">Internal capture packet</p>
        <h2>Package qualification, reviewers, proof routes, and blocked claims without creating external authority.</h2>
        <p className="section-copy">{capitalAcquisitionCapturePacketBoundary}</p>
      </div>

      {capturePacketResult.ok ? (
        <div className="hub-summary" aria-label="Capital acquisition capture packet summary">
          <article>
            <span>Packet readiness</span>
            <strong>{capturePacketResult.packet.readiness}</strong>
          </article>
          <article>
            <span>Audit hash</span>
            <strong>{capturePacketResult.packet.packetAuditHash}</strong>
          </article>
          <article>
            <span>Fingerprint binding</span>
            <strong>{capturePacketResult.packet.fingerprintBinding}</strong>
          </article>
          <article>
            <span>External release</span>
            <strong>not authorized</strong>
          </article>
        </div>
      ) : (
        <div className="workbench-export-lock" role="alert">
          <strong>Capture packet blocked</strong>
          <ul className="compact-list">
            {capturePacketResult.errors.map((error) => <li key={error}>{error}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}
