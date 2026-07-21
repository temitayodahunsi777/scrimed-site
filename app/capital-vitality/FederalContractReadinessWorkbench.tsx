"use client";

import { useMemo, useState } from "react";
import {
  buildFederalContractReadinessPacketMarkdown,
  evaluateFederalContractReadiness,
  federalContractCheckpoints,
  federalContractReadinessBoundary,
  federalContractReadinessInputTemplate,
  type FederalContractCheckpointId,
  type FederalContractCheckpointState,
  type FederalContractReadinessInput,
  type FederalContractReviewState
} from "../lib/federalContractReadiness";

const checkpointOptions: Array<{ value: FederalContractCheckpointState; label: string }> = [
  { value: "not-started", label: "Not started" },
  { value: "in-progress", label: "In progress in authorized system" },
  { value: "evidence-recorded", label: "Protected evidence reference recorded" },
  { value: "expired", label: "Expired or stale" },
  { value: "rejected", label: "Rejected or failed" }
];

const reviewOptions: Array<{ value: FederalContractReviewState; label: string }> = [
  { value: "not-started", label: "Not started" },
  { value: "in-review", label: "In qualified review" },
  { value: "approved", label: "Approved for internal progression" },
  { value: "rejected", label: "Rejected" }
];

const reviewFields: Array<{
  field: "authorizedAdministratorReview" | "representationsReview" | "financeReview";
  label: string;
  owner: string;
}> = [
  {
    field: "authorizedAdministratorReview",
    label: "Authorized administrator review",
    owner: "Founder + authorized entity administrator"
  },
  {
    field: "representationsReview",
    label: "Representations and certifications review",
    owner: "Authorized company official + qualified government-contracts counsel"
  },
  {
    field: "financeReview",
    label: "Tax, payment, and finance control review",
    owner: "Finance owner + authorized company official"
  }
];

function freshTemplate(): FederalContractReadinessInput {
  return {
    ...federalContractReadinessInputTemplate,
    checkpointStates: { ...federalContractReadinessInputTemplate.checkpointStates }
  };
}

export default function FederalContractReadinessWorkbench() {
  const [input, setInput] = useState<FederalContractReadinessInput>(freshTemplate);
  const result = useMemo(() => evaluateFederalContractReadiness(input), [input]);
  const assessment = result.ok ? result.assessment : null;

  function updateCheckpoint(id: FederalContractCheckpointId, state: FederalContractCheckpointState) {
    setInput((current) => ({
      ...current,
      checkpointStates: {
        ...current.checkpointStates,
        [id]: state
      }
    }));
  }

  function updateReview(
    field: (typeof reviewFields)[number]["field"],
    state: FederalContractReviewState
  ) {
    setInput((current) => ({ ...current, [field]: state }));
  }

  function downloadReadinessPacket() {
    const markdown = buildFederalContractReadinessPacketMarkdown(input);
    const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "scrimed-federal-contract-readiness-internal.md";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="table-section" id="federal-contract-readiness" aria-label="Federal contract readiness workbench">
      <div className="section-heading">
        <p className="eyebrow">Federal contract readiness</p>
        <h2>Turn SAM registration and federal market entry into a controlled, evidence-gated operating sequence.</h2>
        <p className="section-copy">
          This local workbench records checkpoint states only. Never enter a UEI, CAGE/NCAGE code, TIN, banking data, credentials, proposal text, controlled information, PHI, or personal contact details. Selecting evidence recorded does not make SCRIMED the verifier of the external record.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href="https://sam.gov/entity-registration" rel="noreferrer" target="_blank">
            Open official SAM registration
          </a>
          <a className="secondary-action" href="https://sam.gov/sites/default/files/2024-11/entity-checklist.pdf" rel="noreferrer" target="_blank">
            Open registration checklist
          </a>
          <a className="secondary-action" href="https://www.sba.gov/federal-contracting/contracting-guide/prime-subcontracting" rel="noreferrer" target="_blank">
            Compare prime and subcontract paths
          </a>
        </div>
      </div>

      {assessment ? (
        <>
          <div className="hub-summary" aria-label="Federal contract readiness summary">
            <article>
              <span>Decision</span>
              <strong>{assessment.decision}</strong>
            </article>
            <article>
              <span>All checkpoints</span>
              <strong>{assessment.completedCheckpointCount}/{assessment.totalCheckpointCount}</strong>
            </article>
            <article>
              <span>Registration checkpoints</span>
              <strong>{assessment.completedRegistrationCheckpointCount}/{assessment.registrationCheckpointCount}</strong>
            </article>
            <article>
              <span>External submission</span>
              <strong>not authorized</strong>
            </article>
          </div>

          <div className="workbench-notice" aria-live="polite">
            <strong>Next controlled action: {assessment.controlledNextAction.actionId}</strong>
            <p>{assessment.controlledNextAction.instruction}</p>
            <ul className="compact-list">
              <li>Owner: {assessment.controlledNextAction.owner}</li>
              <li>System: {assessment.controlledNextAction.system}</li>
              <li>Operator required: yes</li>
              <li>Execution authorized by SCRIMED: no</li>
              <li>Evidence audit hash: {assessment.evidenceAuditHash}</li>
            </ul>
          </div>
        </>
      ) : (
        <div className="workbench-export-lock" role="alert">
          <strong>Federal readiness input blocked</strong>
          <ul className="compact-list">
            {result.ok ? null : result.errors.map((error) => <li key={error}>{error}</li>)}
          </ul>
        </div>
      )}

      <form onSubmit={(event) => event.preventDefault()}>
        <div className="section-heading">
          <p className="eyebrow">Registration and market checkpoints</p>
          <h2>Record status evidence without copying government identifiers into the product.</h2>
        </div>
        <div className="form-grid">
          {federalContractCheckpoints.map((checkpoint) => (
            <label className="form-field" key={checkpoint.id}>
              <span>{checkpoint.name}</span>
              <select
                value={input.checkpointStates[checkpoint.id]}
                onChange={(event) => updateCheckpoint(
                  checkpoint.id,
                  event.target.value as FederalContractCheckpointState
                )}
              >
                {checkpointOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <small>{checkpoint.owner}. {checkpoint.nextAction}</small>
            </label>
          ))}
        </div>

        <div className="section-heading">
          <p className="eyebrow">Qualified reviews</p>
          <h2>Internal progression still requires named authority over registration, representations, and finance.</h2>
        </div>
        <div className="form-grid">
          {reviewFields.map((review) => (
            <label className="form-field" key={review.field}>
              <span>{review.label}</span>
              <select
                value={input[review.field]}
                onChange={(event) => updateReview(
                  review.field,
                  event.target.value as FederalContractReviewState
                )}
              >
                {reviewOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <small>{review.owner}. Approval applies only to internal progression and cannot submit or certify.</small>
            </label>
          ))}
        </div>

        <div className="hero-actions">
          <button className="secondary-action" type="button" onClick={() => setInput(freshTemplate())}>
            Clear readiness states
          </button>
          <button className="secondary-action" type="button" onClick={downloadReadinessPacket}>
            Download internal federal readiness packet
          </button>
        </div>
      </form>

      {assessment?.hardStops.length ? (
        <div className="workbench-export-lock">
          <strong>Fail-closed inconsistencies</strong>
          <ul className="compact-list">
            {assessment.hardStops.map((hardStop) => <li key={hardStop}>{hardStop}</li>)}
          </ul>
        </div>
      ) : null}

      <div className="workbench-export-lock">
        <strong>Retained authority boundary</strong>
        <p>{federalContractReadinessBoundary}</p>
        {assessment ? (
          <ul className="compact-list">
            {assessment.warnings.map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
