import Link from "next/link";
import { getQaLaunchKitSummary } from "../lib/qaLaunchKit";

export const metadata = {
  title: "SCRIMED Manual AAL2 QA Launch Kit",
  description:
    "No-secret human-run launch packet for SCRIMED manual AAL2 synthetic QA workflows, evidence retention, and proof promotion."
};

function JsonBlock({ value }: { value: unknown }) {
  return <pre className="code-block">{JSON.stringify(value, null, 2)}</pre>;
}

export default function QaLaunchKitPage() {
  const summary = getQaLaunchKitSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/qa-run-control">Run Control</Link>
        <p className="eyebrow">Manual AAL2 QA Launch Kit</p>
        <h1>SCRIMED now has a single no-secret launch packet for the first human AAL2 QA run.</h1>
        <p className="hero-text">
          The Launch Kit packages dispatch inputs, command templates, safe evidence fields, secret-disposal checks,
          packet persistence, and Proof Promotion into one operator handoff while keeping clinical, PHI, security,
          reimbursement, connector, and production authority blocked.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Launch Kit</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/qa-run-control">Run Control</Link>
          <Link className="secondary-action" href="/qa-completion-bridge">Completion Bridge</Link>
          <Link className="secondary-action" href="/qa-claim-guard">Claim Guard</Link>
          <Link className="secondary-action" href="/qa-activation-seal">Activation Seal</Link>
          <Link className="secondary-action" href="/qa-proof-promotion">Proof Promotion</Link>
          <Link className="secondary-action" href="/pilot-workspace/access">Protected Workspace</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Manual AAL2 QA launch summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Decision</span>
          <strong>{summary.launchDecision}</strong>
        </article>
        <article>
          <span>Workflows</span>
          <strong>{summary.workflowCount}</strong>
        </article>
        <article>
          <span>Phases</span>
          <strong>{summary.phaseCount}</strong>
        </article>
        <article>
          <span>Hard stops</span>
          <strong>{summary.hardStopPhaseCount}</strong>
        </article>
        <article>
          <span>Safe fields</span>
          <strong>{summary.safeCopyFieldCount}</strong>
        </article>
        <article>
          <span>Blocked claims</span>
          <strong>{summary.blockedClaimCount}</strong>
        </article>
        <article>
          <span>Proof state</span>
          <strong>{summary.proofPromotionState}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>Operator-ready still means human-required, no-token-storage, and not-retained-proof.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.launchRules.map((rule, index) => (
            <div className="layer-row" key={rule}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{rule}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Manual AAL2 QA launch phases">
        <div className="section-heading">
          <p className="eyebrow">Launch phases</p>
          <h2>Every phase has an owner, pass signal, and fail-closed condition.</h2>
        </div>
        {summary.phases.map((phase) => (
          <article className="module-row" key={phase.phase}>
            <div>
              <span>{phase.state}</span>
              <h2>{phase.phase}</h2>
            </div>
            <p>{phase.operatorAction}</p>
            <div>
              <strong>{phase.owner}</strong>
              <ul className="compact-list">
                <li>Pass: {phase.passSignal}</li>
                <li>Fail closed: {phase.failClosedIf}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Manual AAL2 QA launch workflows">
        <div className="section-heading">
          <p className="eyebrow">Workflow launch packets</p>
          <h2>Operators get exact dispatch inputs, command templates, and safe evidence payloads.</h2>
        </div>
        {summary.workflows.map((workflow) => (
          <article className="module-row module-row-stack" key={workflow.workflowKind}>
            <div>
              <span>{workflow.workflowKind}</span>
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
                <span>Safe packet</span>
                <h3>{workflow.protectedPersistenceRoute}</h3>
                <JsonBlock value={workflow.safeEvidenceTemplate} />
              </article>
              <article>
                <span>Safe copy fields</span>
                <h3>{workflow.postRunSafeCopyFields.length} fields</h3>
                <ul className="compact-list">
                  {workflow.postRunSafeCopyFields.map((field) => (
                    <li key={field}>{field}</li>
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

      <section className="section-band" aria-label="Manual AAL2 QA launch blocked claims">
        <div className="section-heading">
          <p className="eyebrow">Blocked claims</p>
          <h2>The launch kit improves execution readiness; it does not create clinical or production authority.</h2>
        </div>
        <div className="layer-list">
          {summary.blockedClaims.map((claim, index) => (
            <div className="layer-row" key={claim}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{claim}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
