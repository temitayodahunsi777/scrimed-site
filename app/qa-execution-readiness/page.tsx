import Link from "next/link";
import { getQaExecutionReadinessSummary } from "../lib/qaExecutionReadiness";

export const metadata = {
  title: "SCRIMED Manual AAL2 QA Execution Readiness",
  description:
    "A no-secret go/no-go readiness layer for SCRIMED human-run AAL2 QA workflows, evidence capture, and buyer diligence sequencing."
};

export default function QaExecutionReadinessPage() {
  const summary = getQaExecutionReadinessSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/qa-evidence">QA Evidence</Link>
        <p className="eyebrow">Manual AAL2 QA Execution Readiness</p>
        <h1>SCRIMED is ready for a human-run AAL2 QA workflow without storing secrets or crossing clinical boundaries.</h1>
        <p className="hero-text">
          This layer converts the remaining authenticated QA boundary into an operator go/no-go path: human session,
          explicit synthetic target, token preflight, manual workflow dispatch, secret disposal, no-secret evidence
          persistence, and Buyer Diligence export.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Execution Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/qa-evidence">QA Ledger</Link>
          <Link className="secondary-action" href="/pilot-workspace/access">Protected Workspace</Link>
          <Link className="secondary-action" href="/boundary-resolution">Boundary Register</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Manual AAL2 QA execution readiness summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Decision</span>
          <strong>{summary.executionDecision}</strong>
        </article>
        <article>
          <span>Claim status</span>
          <strong>{summary.buyerClaimStatus}</strong>
        </article>
        <article>
          <span>Workflows</span>
          <strong>{summary.workflowCount}</strong>
        </article>
        <article>
          <span>Stages</span>
          <strong>{summary.stageCount}</strong>
        </article>
        <article>
          <span>Human gates</span>
          <strong>{summary.humanRequiredStages}</strong>
        </article>
        <article>
          <span>Post-run gates</span>
          <strong>{summary.postRunStages}</strong>
        </article>
        <article>
          <span>Manual QA gates</span>
          <strong>{summary.remainingManualGateCount}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>Ready for human execution does not mean authenticated proof has been retained.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.claimRules.map((rule, index) => (
            <div className="layer-row" key={rule}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{rule}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Manual AAL2 QA dispatch workflows">
        <div className="section-heading">
          <p className="eyebrow">Dispatch workflows</p>
          <h2>Each workflow has a target input, preflight, temporary secret, accepted evidence fields, and hard stops.</h2>
        </div>
        {summary.dispatchWorkflows.map((workflow) => (
          <article className="module-row" key={workflow.workflowKind}>
            <div>
              <span>{workflow.state}</span>
              <h2>{workflow.name}</h2>
            </div>
            <p>{workflow.buyerProofImpact}</p>
            <div>
              <strong>{workflow.dispatchPath}</strong>
              <ul className="compact-list">
                <li>Target: {workflow.targetInput}</li>
                <li>Preflight: {workflow.preflightScript}</li>
                <li>Smoke: {workflow.smokeScript}</li>
                <li>Temporary secret: {workflow.temporarySecret}</li>
                <li>Safe fields: {workflow.safeEvidenceFields.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Manual AAL2 QA execution stages">
        <div className="section-heading">
          <p className="eyebrow">Execution stages</p>
          <h2>The path is intentionally human-run, narrow, auditable, and synthetic-only.</h2>
        </div>
        {summary.executionStages.map((stage) => (
          <article className="module-row" key={stage.stage}>
            <div>
              <span>{stage.state}</span>
              <h2>{stage.stage}</h2>
            </div>
            <p>{stage.operatorAction}</p>
            <div>
              <strong>{stage.owner}</strong>
              <ul className="compact-list">
                <li>Accepted: {stage.evidenceAccepted.join(", ")}</li>
                <li>Rejected: {stage.evidenceRejected.join(", ")}</li>
                <li>{stage.productionBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Manual AAL2 QA hard stops">
        <div className="section-heading">
          <p className="eyebrow">Hard stops</p>
          <h2>These rules prevent the execution process from becoming a secret, PHI, or false-proof path.</h2>
        </div>
        {summary.hardStopRules.map((rule, index) => (
          <article className="module-row" key={rule}>
            <div>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h2>Hard stop</h2>
            </div>
            <p>{rule}</p>
            <Link className="module-link" href="/boundary-resolution">
              Review boundary register
            </Link>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Buyer diligence sequence">
        <div className="section-heading">
          <p className="eyebrow">Buyer diligence sequence</p>
          <h2>Authenticated QA can appear in buyer proof only after safe packet metadata is retained.</h2>
        </div>
        <div className="layer-list">
          {summary.buyerDiligenceSequence.map((step, index) => (
            <div className="layer-row" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
