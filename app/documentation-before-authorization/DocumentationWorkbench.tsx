"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";

import type {
  DocumentationBeforeAuthorizationRequirement,
  DocumentationBeforeAuthorizationRequirementId,
  DocumentationBeforeAuthorizationReviewPacket,
  DocumentationBeforeAuthorizationSyntheticPacket
} from "../lib/documentationBeforeAuthorization";

type WorkbenchSummary = {
  workbench: {
    apiRoute: string;
  };
  requirements: DocumentationBeforeAuthorizationRequirement[];
  syntheticPackets: DocumentationBeforeAuthorizationSyntheticPacket[];
};

type WorkbenchResponse = {
  status?: string;
  packet?: DocumentationBeforeAuthorizationReviewPacket;
  error?: {
    code: string;
    message: string;
    details?: string[];
  };
};

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function DocumentationWorkbench({ summary }: { summary: WorkbenchSummary }) {
  const initialScenario = summary.syntheticPackets[0]!;
  const [scenarioId, setScenarioId] = useState(initialScenario.packetId);
  const [documentedRequirementIds, setDocumentedRequirementIds] = useState<
    DocumentationBeforeAuthorizationRequirementId[]
  >(initialScenario.documentedRequirementIds);
  const [reviewerStatus, setReviewerStatus] = useState<
    DocumentationBeforeAuthorizationSyntheticPacket["reviewerStatus"]
  >(initialScenario.reviewerStatus);
  const [requestedAction, setRequestedAction] = useState<
    DocumentationBeforeAuthorizationSyntheticPacket["requestedAction"]
  >(initialScenario.requestedAction);
  const [acknowledged, setAcknowledged] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<DocumentationBeforeAuthorizationReviewPacket | null>(null);

  const selectedScenario =
    summary.syntheticPackets.find((packet) => packet.packetId === scenarioId) ?? initialScenario;

  function changeScenario(nextScenarioId: string) {
    const nextScenario =
      summary.syntheticPackets.find((packet) => packet.packetId === nextScenarioId) ?? initialScenario;

    setScenarioId(nextScenario.packetId);
    setDocumentedRequirementIds(nextScenario.documentedRequirementIds);
    setReviewerStatus(nextScenario.reviewerStatus);
    setRequestedAction(nextScenario.requestedAction);
    setResult(null);
    setMessage("");
    setStatus("idle");
  }

  function toggleRequirement(requirementId: DocumentationBeforeAuthorizationRequirementId) {
    setDocumentedRequirementIds((current) =>
      current.includes(requirementId)
        ? current.filter((id) => id !== requirementId)
        : [...current, requirementId]
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");
    setResult(null);

    try {
      const response = await fetch(summary.workbench.apiRoute, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioPacketId: selectedScenario.packetId,
          documentedRequirementIds,
          reviewerStatus,
          requestedAction,
          dataBoundaryAcknowledged: acknowledged
        })
      });
      const body = (await response.json()) as WorkbenchResponse;

      if (body.packet) {
        setResult(body.packet);
        setStatus("success");
        setMessage(
          response.status === 423
            ? "Payer action was denied as designed; the blocked review packet is shown below."
            : "Synthetic documentation review packet prepared. Human review remains required."
        );
        return;
      }

      setMessage(
        body.error?.details?.join(" ") ??
          body.error?.message ??
          "The documentation packet could not be evaluated."
      );
      setStatus("error");
    } catch {
      setMessage("PayerIQ could not reach the documentation readiness endpoint.");
      setStatus("error");
    }
  }

  return (
    <div className="evaluation-workspace">
      <form className="evaluation-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <p className="eyebrow">Synthetic packet setup</p>
          <h2>Choose a scenario, then mark which documentation elements are present.</h2>
          <div className="form-grid">
            <label className="form-field form-field-wide">
              <span>Registered scenario</span>
              <select onChange={(event) => changeScenario(event.target.value)} value={scenarioId}>
                {summary.syntheticPackets.map((packet) => (
                  <option key={packet.packetId} value={packet.packetId}>
                    {packet.procedureFamily}
                  </option>
                ))}
              </select>
              <small>{selectedScenario.scenario}</small>
            </label>
            <label className="form-field">
              <span>Reviewer state</span>
              <select
                onChange={(event) =>
                  setReviewerStatus(
                    event.target.value as DocumentationBeforeAuthorizationSyntheticPacket["reviewerStatus"]
                  )
                }
                value={reviewerStatus}
              >
                <option value="not_reviewed">Not reviewed</option>
                <option value="queued">Queued for review</option>
                <option value="reviewed_for_demo">Reviewed for synthetic demo</option>
              </select>
            </label>
            <label className="form-field">
              <span>Workbench action</span>
              <select
                onChange={(event) =>
                  setRequestedAction(
                    event.target.value as DocumentationBeforeAuthorizationSyntheticPacket["requestedAction"]
                  )
                }
                value={requestedAction}
              >
                <option value="pre_submission_gap_check">Run gap check</option>
                <option value="draft_reviewer_packet">Prepare review packet</option>
                <option value="payer_submission_blocked">Test blocked payer action</option>
              </select>
            </label>
          </div>
        </div>

        <fieldset className="requirement-checklist">
          <legend>Documentation requirements</legend>
          {summary.requirements.map((requirement) => (
            <label key={requirement.id}>
              <input
                checked={documentedRequirementIds.includes(requirement.id)}
                onChange={() => toggleRequirement(requirement.id)}
                type="checkbox"
              />
              <span>
                <strong>{requirement.label}</strong>
                <small>
                  {requirement.required ? "Required" : "Conditional"} · {requirement.owner.replaceAll("_", " ")}
                </small>
                <small>{requirement.purpose}</small>
              </span>
            </label>
          ))}
        </fieldset>

        <div className="intake-acknowledgement">
          <label>
            <input
              checked={acknowledged}
              onChange={(event) => setAcknowledged(event.target.checked)}
              type="checkbox"
            />
            <span>
              I acknowledge this workbench uses registered synthetic scenarios only. It does not accept PHI,
              determine medical necessity, contact payers, submit authorizations, write to an EHR, or guarantee reimbursement.
            </span>
          </label>
        </div>

        {message ? (
          <div className={status === "error" ? "intake-alert" : "workbench-notice"} aria-live="polite">
            {message}
          </div>
        ) : null}

        <div className="form-actions">
          <button className="primary-action" disabled={status === "submitting"} type="submit">
            {status === "submitting" ? "Evaluating Packet" : "Evaluate Documentation Readiness"}
          </button>
          <a className="secondary-action" href={summary.workbench.apiRoute}>
            Inspect API
          </a>
          <Link className="secondary-action" href="/pilots/60-day-governed-automation-pilot">
            View Pilot Path
          </Link>
        </div>
      </form>

      <aside className="evaluation-preview">
        <span>PayerIQ workflow</span>
        <h2>{selectedScenario.procedureFamily}</h2>
        <p>{selectedScenario.scenario}</p>
        <ul className="compact-list">
          <li>{documentedRequirementIds.length} documentation elements marked present</li>
          <li>Human review required</li>
          <li>Payer transmission disabled</li>
          <li>SCRIMED Work handoff is prepare-only</li>
        </ul>
      </aside>

      {result ? <DocumentationReviewResult packet={result} /> : null}
    </div>
  );
}

function DocumentationReviewResult({ packet }: { packet: DocumentationBeforeAuthorizationReviewPacket }) {
  return (
    <section className="evaluation-result" aria-live="polite">
      <div className="section-heading">
        <p className="eyebrow">{packet.status}</p>
        <h2>{packet.readinessScore}% documentation completeness.</h2>
        <p className="section-copy">{packet.boundary}</p>
      </div>

      <div className="result-grid">
        <div>
          <strong>Risk</strong>
          <p>{packet.evaluation.riskLevel}</p>
        </div>
        <div>
          <strong>Readiness</strong>
          <p>{packet.evaluation.readiness.replaceAll("_", " ")}</p>
        </div>
        <div>
          <strong>Reviewer</strong>
          <p>{packet.reviewQueue.requiredRole.replaceAll("_", " ")}</p>
        </div>
        <div>
          <strong>Submission</strong>
          <p>Blocked</p>
        </div>
        <div>
          <strong>Audit</strong>
          <p>{packet.auditHash}</p>
        </div>
      </div>

      <div className="evaluation-output-grid">
        <article>
          <span>Missing documentation</span>
          <h3>{packet.evidencePacket.missingRequirements.length} required gaps</h3>
          <ul className="compact-list">
            {(packet.evidencePacket.missingRequirements.length
              ? packet.evidencePacket.missingRequirements
              : ["No required gaps detected in the synthetic packet."]
            ).map((requirement) => (
              <li key={requirement}>{requirement}</li>
            ))}
          </ul>
        </article>

        <article>
          <span>Review queue</span>
          <h3>{packet.reviewQueue.status.replaceAll("-", " ")}</h3>
          <ul className="compact-list">
            {packet.reviewQueue.nextActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </article>

        <article>
          <span>SCRIMED Work handoff</span>
          <h3>{packet.workSessionHandoff.artifactType.replaceAll("-", " ")}</h3>
          <p>{packet.workSessionHandoff.definitionOfDone.goal}</p>
          <ul className="compact-list">
            <li>Domain: {packet.workSessionHandoff.workspaceDomain}</li>
            <li>Risk: {packet.workSessionHandoff.riskLevel}</li>
            <li>Autonomy: {packet.workSessionHandoff.requestedAutonomy}</li>
            <li>Human approval required</li>
          </ul>
        </article>

        <article>
          <span>Outcome economics</span>
          <h3>{packet.valueTelemetry.estimatedReviewMinutesReallocated} synthetic minutes reallocated</h3>
          <p>{packet.valueTelemetry.outcomeBoundary}</p>
          <ul className="compact-list">
            <li>Manual assumption: {packet.valueTelemetry.estimatedManualReviewMinutes} minutes</li>
            <li>Assisted assumption: {packet.valueTelemetry.estimatedAssistedReviewMinutes} minutes</li>
            <li>Measurement mode: synthetic only</li>
          </ul>
        </article>

        <article>
          <span>Context Lens</span>
          <h3>{packet.contextPacket.requiredReviewLevel.replaceAll("-", " ")}</h3>
          <p>{packet.contextPacket.abstentionReason ?? "Current synthetic context is ready for qualified review."}</p>
          <ul className="compact-list">
            <li>Mode: {packet.contextPacket.operatingMode}</li>
            <li>Sources: {packet.contextPacket.sources.length}</li>
            <li>Missing data: {packet.contextPacket.missingData.length}</li>
            <li>Authority: decision support only</li>
          </ul>
        </article>

        <article>
          <span>Evidence from first case</span>
          <h3>{packet.caseEvidence.completeness.completenessPercent}% complete</h3>
          <p>Append-only event {packet.caseEvidenceEvent.eventId} is bound to this synthetic run.</p>
          <ul className="compact-list">
            <li>Workflow disposition: {packet.caseEvidence.workflowDisposition.replaceAll("-", " ")}</li>
            <li>Trust QA: {packet.caseEvidence.trustQaStatus.replaceAll("-", " ")}</li>
            <li>Analysis plan: {packet.caseEvidence.analysisPlanStatus.replaceAll("-", " ")}</li>
            <li>Causal and external claims: blocked</li>
          </ul>
        </article>

        <article>
          <span>Clinical assurance preflight</span>
          <h3>{packet.clinicalAssuranceDecision.status.replaceAll("-", " ")}</h3>
          <p>
            Exact model, enclave, capacity, concentration, validated-cell, and fallback evidence are bound to this
            synthetic packet.
          </p>
          <ul className="compact-list">
            <li>CAL: {packet.clinicalAssuranceDecision.resolvedAssuranceLevel}</li>
            <li>
              Independent fallback: {packet.clinicalAssuranceDecision.fallbackMateriallyIndependent ? "verified" : "blocked"}
            </li>
            <li>Human review: required</li>
            <li>External model call: disabled</li>
          </ul>
        </article>
      </div>

      <div className="workbench-export-lock">
        <strong>Review packet held</strong>
        <p>
          The Markdown packet is generated and visible through this response, but export and external distribution
          remain disabled until an authorized human review path is bound.
        </p>
      </div>
    </section>
  );
}
