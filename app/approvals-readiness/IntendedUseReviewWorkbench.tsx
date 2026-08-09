"use client";

import { useMemo, useState } from "react";
import {
  evaluateIntendedUseReview,
  intendedUseActionOptions,
  intendedUseAudienceOptions,
  intendedUseAutonomyOptions,
  intendedUseDataClassificationOptions,
  intendedUseEvidencePostureOptions,
  intendedUseOperatingModeOptions,
  intendedUseReviewBoundary,
  intendedUseReviewInputTemplate,
  intendedUseWorkflowOptions,
  type IntendedUseAudience,
  type IntendedUseAutonomyLevel,
  type IntendedUseDataClassification,
  type IntendedUseEvidencePosture,
  type IntendedUseOperatingMode,
  type IntendedUseRequestedAction,
  type IntendedUseReviewInput,
  type IntendedUseWorkflow
} from "../lib/intendedUseReview";

function initialInputs(): IntendedUseReviewInput {
  return {
    ...intendedUseReviewInputTemplate,
    requestedActions: [...intendedUseReviewInputTemplate.requestedActions]
  };
}

export default function IntendedUseReviewWorkbench() {
  const [inputs, setInputs] = useState<IntendedUseReviewInput>(initialInputs);
  const evaluation = useMemo(() => evaluateIntendedUseReview(inputs), [inputs]);

  function updateInput<Key extends keyof Omit<IntendedUseReviewInput, "requestedActions">>(
    key: Key,
    value: IntendedUseReviewInput[Key]
  ) {
    setInputs((current) => ({ ...current, [key]: value }));
  }

  function toggleAction(action: IntendedUseRequestedAction) {
    setInputs((current) => ({
      ...current,
      requestedActions: current.requestedActions.includes(action)
        ? current.requestedActions.filter((currentAction) => currentAction !== action)
        : [...current.requestedActions, action]
    }));
  }

  return (
    <section className="table-section" id="intended-use-review-workbench" aria-label="Intended Use review workbench">
      <div className="section-heading">
        <p className="eyebrow">First approval dependency</p>
        <h2>Turn a proposed product scope into a controlled packet for founder, counsel, and clinical governance review.</h2>
        <p className="section-copy">
          Choose only controlled, no-PHI options. Nothing entered here is sent, persisted, cached, signed, or approved. The workbench identifies prohibited scope, evidence gaps, required reviewers, and the next qualified-review action.
        </p>
      </div>

      <form onSubmit={(event) => event.preventDefault()}>
        <div className="form-grid">
          <label className="form-field">
            <span>Workflow</span>
            <select
              value={inputs.workflow}
              onChange={(event) => updateInput("workflow", event.target.value as IntendedUseWorkflow)}
            >
              {intendedUseWorkflowOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
            <small>{intendedUseWorkflowOptions.find((option) => option.id === inputs.workflow)?.description}</small>
          </label>

          <label className="form-field">
            <span>Operating mode</span>
            <select
              value={inputs.operatingMode}
              onChange={(event) => updateInput("operatingMode", event.target.value as IntendedUseOperatingMode)}
            >
              {intendedUseOperatingModeOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
            <small>{intendedUseOperatingModeOptions.find((option) => option.id === inputs.operatingMode)?.description}</small>
          </label>

          <label className="form-field">
            <span>Data classification</span>
            <select
              value={inputs.dataClassification}
              onChange={(event) => updateInput("dataClassification", event.target.value as IntendedUseDataClassification)}
            >
              {intendedUseDataClassificationOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
            <small>{intendedUseDataClassificationOptions.find((option) => option.id === inputs.dataClassification)?.description}</small>
          </label>

          <label className="form-field">
            <span>Audience</span>
            <select
              value={inputs.audience}
              onChange={(event) => updateInput("audience", event.target.value as IntendedUseAudience)}
            >
              {intendedUseAudienceOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
            <small>{intendedUseAudienceOptions.find((option) => option.id === inputs.audience)?.description}</small>
          </label>

          <label className="form-field">
            <span>Maximum autonomy</span>
            <select
              value={inputs.autonomyLevel}
              onChange={(event) => updateInput("autonomyLevel", event.target.value as IntendedUseAutonomyLevel)}
            >
              {intendedUseAutonomyOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
            <small>{intendedUseAutonomyOptions.find((option) => option.id === inputs.autonomyLevel)?.description}</small>
          </label>

          <label className="form-field">
            <span>Evidence posture</span>
            <select
              value={inputs.evidencePosture}
              onChange={(event) => updateInput("evidencePosture", event.target.value as IntendedUseEvidencePosture)}
            >
              {intendedUseEvidencePostureOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
            <small>{intendedUseEvidencePostureOptions.find((option) => option.id === inputs.evidencePosture)?.description}</small>
          </label>

          <fieldset className="checklist-group form-field-wide">
            <legend>Requested actions</legend>
            <p>Select every action the proposed scope would permit. Prohibited actions fail closed.</p>
            <div className="checkbox-grid">
              {intendedUseActionOptions.map((option) => (
                <label className="checkbox-card" key={option.id}>
                  <input
                    type="checkbox"
                    checked={inputs.requestedActions.includes(option.id)}
                    onChange={() => toggleAction(option.id)}
                  />
                  <span>
                    <strong>{option.label}</strong>
                    <small>{option.classification}: {option.description}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="hero-actions">
          <button className="secondary-action" type="button" onClick={() => setInputs(initialInputs())}>
            Reset to current safe scope
          </button>
        </div>
      </form>

      <div className="workbench-notice" aria-live="polite">
        <strong>{evaluation.decision}</strong>
        <p>{evaluation.nextAction}</p>
      </div>

      <div className="hub-summary" aria-label="Intended Use review result">
        <article>
          <span>Review entry</span>
          <strong>{evaluation.canEnterQualifiedReview ? "ready" : "blocked"}</strong>
        </article>
        <article>
          <span>Prohibited-scope blockers</span>
          <strong>{evaluation.blockers.length}</strong>
        </article>
        <article>
          <span>Evidence gaps</span>
          <strong>{evaluation.evidenceGaps.length}</strong>
        </article>
        <article>
          <span>Required reviewers</span>
          <strong>{evaluation.requiredReviewers.length}</strong>
        </article>
        <article>
          <span>PHI authority</span>
          <strong>not granted</strong>
        </article>
        <article>
          <span>External use</span>
          <strong>not authorized</strong>
        </article>
      </div>

      {evaluation.blockers.length > 0 ? (
        <div className="workbench-export-lock">
          <strong>Prohibited scope must be removed or separately authorized</strong>
          <ul className="compact-list">
            {evaluation.blockers.map((blocker) => <li key={blocker}>{blocker}</li>)}
          </ul>
        </div>
      ) : null}

      {evaluation.evidenceGaps.length > 0 ? (
        <div className="workbench-export-lock">
          <strong>Evidence required before qualified review</strong>
          <ul className="compact-list">
            {evaluation.evidenceGaps.map((gap) => <li key={gap}>{gap}</li>)}
          </ul>
        </div>
      ) : null}

      <article className="module-row">
        <div>
          <span>review packet</span>
          <h2>{evaluation.packet.workflow}</h2>
        </div>
        <p>{evaluation.packet.intendedUseStatement}</p>
        <div>
          <strong>{evaluation.packet.humanOversight}</strong>
          <ul className="compact-list">
            <li>Mode: {evaluation.packet.operatingMode}</li>
            <li>Data boundary: {evaluation.packet.dataBoundary}</li>
            <li>Audience: {evaluation.packet.audience}</li>
            <li>Autonomy: {evaluation.packet.autonomyBoundary}</li>
            <li>Actions: {evaluation.packet.requestedActions.join(", ") || "none selected"}</li>
          </ul>
        </div>
      </article>

      <article className="module-row">
        <div>
          <span>qualified review</span>
          <h2>Named human authority remains mandatory.</h2>
        </div>
        <p>{evaluation.requiredReviewers.join(", ")}</p>
        <div>
          <strong>Required evidence</strong>
          <ul className="compact-list">
            {evaluation.requiredEvidence.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </article>

      <div className="workbench-export-lock">
        <strong>No self-approval or authority transfer</strong>
        <p>{intendedUseReviewBoundary}</p>
      </div>
    </section>
  );
}
