import Link from "next/link";
import { getQaRunControlSummary } from "../lib/qaRunControl";

export const metadata = {
  title: "SCRIMED Manual AAL2 QA Run Control",
  description:
    "No-secret operator run control for SCRIMED manual AAL2 synthetic QA workflows, evidence templates, buyer proof promotion, and hard-stop boundaries."
};

function JsonBlock({ value }: { value: unknown }) {
  return <pre className="code-block">{JSON.stringify(value, null, 2)}</pre>;
}

export default function QaRunControlPage() {
  const summary = getQaRunControlSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/qa-evidence">QA Evidence</Link>
        <p className="eyebrow">Manual AAL2 QA Run Control</p>
        <h1>SCRIMED now has a no-secret mission-control layer for the first human AAL2 QA run.</h1>
        <p className="hero-text">
          Run Control translates execution readiness into workflow-specific dispatch inputs, preflight commands, smoke
          commands, safe evidence templates, abort conditions, and buyer-proof promotion rules while keeping clinical,
          PHI, security, reimbursement, and production authority blocked.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Run-Control Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/qa-execution-readiness">Execution Readiness</Link>
          <Link className="secondary-action" href="/qa-launch-kit">Launch Kit</Link>
          <Link className="secondary-action" href="/qa-completion-bridge">Completion Bridge</Link>
          <Link className="secondary-action" href="/qa-claim-guard">Claim Guard</Link>
          <Link className="secondary-action" href="/qa-activation-seal">Activation Seal</Link>
          <Link className="secondary-action" href="/qa-proof-promotion">Proof Promotion</Link>
          <Link className="secondary-action" href="/pilot-workspace/access">Protected Workspace</Link>
          <Link className="secondary-action" href="/boundary-resolution">Boundary Register</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Manual AAL2 QA run-control summary">
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
          <span>Gates</span>
          <strong>{summary.gateCount}</strong>
        </article>
        <article>
          <span>Hard stops</span>
          <strong>{summary.hardStopGateCount}</strong>
        </article>
        <article>
          <span>Commands</span>
          <strong>{summary.commandTemplateCount}</strong>
        </article>
        <article>
          <span>Rejected fields</span>
          <strong>{summary.forbiddenEvidenceCount}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>Operator-ready does not mean authenticated proof has been created or retained.</h2>
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

      <section className="table-section" aria-label="Manual AAL2 QA run-control gates">
        <div className="section-heading">
          <p className="eyebrow">Run gates</p>
          <h2>Every run has explicit pass signals, fail signals, owners, and retained boundaries.</h2>
        </div>
        {summary.gates.map((gate) => (
          <article className="module-row" key={gate.gate}>
            <div>
              <span>{gate.state}</span>
              <h2>{gate.gate}</h2>
            </div>
            <p>{gate.boundary}</p>
            <div>
              <strong>{gate.owner}</strong>
              <ul className="compact-list">
                <li>Pass: {gate.passSignal}</li>
                <li>Fail: {gate.failSignal}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Manual AAL2 QA workflow controls">
        <div className="section-heading">
          <p className="eyebrow">Workflow controls</p>
          <h2>Each workflow gives operators the exact no-secret fields needed before, during, and after the run.</h2>
        </div>
        {summary.workflows.map((workflow) => (
          <article className="module-row module-row-stack" key={workflow.workflowKind}>
            <div>
              <span>{workflow.state}</span>
              <h2>{workflow.name}</h2>
            </div>
            <p>{workflow.buyerProofPromotionRule}</p>
            <div className="principle-grid">
              <article>
                <span>Dispatch</span>
                <h3>{workflow.dispatchPath}</h3>
                <JsonBlock value={workflow.dispatchInputs} />
              </article>
              <article>
                <span>Preflight</span>
                <h3>{workflow.temporarySecret}</h3>
                <pre className="code-block">{workflow.preflightCommandTemplate}</pre>
              </article>
              <article>
                <span>Smoke</span>
                <h3>{workflow.evidencePacketRoute}</h3>
                <pre className="code-block">{workflow.smokeCommandTemplate}</pre>
              </article>
            </div>
            <div className="principle-grid">
              <article>
                <span>Evidence template</span>
                <h3>{workflow.workflowKind}</h3>
                <JsonBlock value={workflow.safeEvidenceTemplate} />
              </article>
              <article>
                <span>Operator sequence</span>
                <h3>{workflow.operatorSequence.length} steps</h3>
                <ul className="compact-list">
                  {workflow.operatorSequence.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </article>
              <article>
                <span>Abort if</span>
                <h3>{workflow.abortConditions.length} hard stops</h3>
                <ul className="compact-list">
                  {workflow.abortConditions.map((condition) => (
                    <li key={condition}>{condition}</li>
                  ))}
                </ul>
              </article>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Manual AAL2 QA operator brief routes">
        <div className="section-heading">
          <p className="eyebrow">Operator packet path</p>
          <h2>Use these brief routes before touching a short-lived AAL2 token.</h2>
        </div>
        <div className="layer-list">
          {summary.operatorBriefRoutes.map((route, index) => (
            <div className="layer-row" key={route}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{route}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
