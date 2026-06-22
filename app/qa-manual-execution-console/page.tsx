import Link from "next/link";
import { getQaManualExecutionConsoleSummary } from "../lib/qaManualExecutionConsole";

export const metadata = {
  title: "SCRIMED Manual QA Execution Console",
  description:
    "Human AAL2 synthetic QA command console for protected execution, no-secret evidence capture, and Buyer Proof Release readiness."
};

export default function QaManualExecutionConsolePage() {
  const summary = getQaManualExecutionConsoleSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/qa-buyer-proof-release">Buyer Proof Release</Link>
        <p className="eyebrow">Manual QA Execution Console</p>
        <h1>SCRIMED now has one protected command lane for human AAL2 synthetic QA execution.</h1>
        <p className="hero-text">
          The console ties operator readiness, manual workflow dispatch, no-secret evidence capture, retained packet
          visibility, audit signals, and Buyer Proof Release into one bounded execution path.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>
            Download Console Brief
          </a>
          <a className="secondary-action" href={summary.apiRoute}>
            Inspect API
          </a>
          <Link className="secondary-action" href="/qa-human-run-packet">
            Human Run Packet
          </Link>
          <Link className="secondary-action" href="/qa-completion-bridge">
            Completion Bridge
          </Link>
          <Link className="secondary-action" href="/pilot-workspace/access">
            Protected Workspace
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Manual QA execution console summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Console state</span>
          <strong>{summary.consoleState}</strong>
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
          <span>Hard stops</span>
          <strong>{summary.hardStopCount}</strong>
        </article>
        <article>
          <span>Blocked claims</span>
          <strong>{summary.blockedAuthorityClaimCount}</strong>
        </article>
        <article>
          <span>Buyer proof</span>
          <strong>{summary.decision.buyerProofReleaseReady ? "ready" : "locked"}</strong>
        </article>
        <article>
          <span>Data boundary</span>
          <strong>synthetic only</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>{summary.buyerSafeCurrentLanguage}</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.decision.stages.map((stage, index) => (
            <div className="layer-row" key={stage.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>
                {stage.name}: {stage.status}
              </strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Manual QA execution console stages">
        <div className="section-heading">
          <p className="eyebrow">Execution stages</p>
          <h2>The console is built around retained packet visibility, not operator assertions.</h2>
        </div>
        {summary.decision.stages.map((stage) => (
          <article className="module-row" key={stage.id}>
            <div>
              <span>{stage.status}</span>
              <h2>{stage.name}</h2>
            </div>
            <p>{stage.evidence}</p>
            <div>
              <strong>{stage.owner}</strong>
              <ul className="compact-list">
                <li>{stage.action}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Manual QA execution console workflows">
        <div className="section-heading">
          <p className="eyebrow">Approved workflows</p>
          <h2>Only two synthetic AAL2 QA workflows are currently allowed through this console.</h2>
        </div>
        {summary.workflows.map((workflow) => (
          <article className="module-row module-row-stack" key={workflow.workflowKind}>
            <div>
              <span>{workflow.workflowKind}</span>
              <h2>{workflow.name}</h2>
            </div>
            <p>
              Target {workflow.defaultSyntheticTarget}. Temporary secret {workflow.temporarySecret}. Buyer proof stays
              locked until the protected workspace can read retained packet metadata.
            </p>
            <div className="principle-grid">
              <article>
                <span>preflight</span>
                <h3>{workflow.dispatchPath}</h3>
                <pre className="code-block">{workflow.preflightCommandTemplate}</pre>
              </article>
              <article>
                <span>smoke</span>
                <h3>{workflow.protectedPersistenceRoute}</h3>
                <pre className="code-block">{workflow.smokeCommandTemplate}</pre>
              </article>
              <article>
                <span>safe evidence</span>
                <h3>{workflow.safeEvidenceFields.length} fields</h3>
                <ul className="compact-list">
                  {workflow.safeEvidenceFields.map((field) => (
                    <li key={field}>{field}</li>
                  ))}
                </ul>
              </article>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Manual QA execution console hard stops">
        <div className="section-heading">
          <p className="eyebrow">Hard stops</p>
          <h2>The console refuses proof promotion when safety, privacy, or authority boundaries are unclear.</h2>
        </div>
        <div className="layer-list">
          {summary.hardStops.map((item, index) => (
            <div className="layer-row" key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
