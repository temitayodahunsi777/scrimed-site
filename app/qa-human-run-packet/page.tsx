import Link from "next/link";
import { getQaHumanRunPacketSummary } from "../lib/qaHumanRunPacket";

export const metadata = {
  title: "SCRIMED QA Human Run Packet",
  description:
    "No-secret dispatch packet for approved human AAL2 synthetic QA workflows, protected evidence persistence, and buyer proof boundaries."
};

function JsonBlock({ value }: { value: unknown }) {
  return <pre className="code-block">{JSON.stringify(value, null, 2)}</pre>;
}

export default function QaHumanRunPacketPage() {
  const summary = getQaHumanRunPacketSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/qa-launch-kit">Launch Kit</Link>
        <p className="eyebrow">QA Human Run Packet</p>
        <h1>SCRIMED now has a no-secret dispatch packet for the first approved human AAL2 synthetic QA run.</h1>
        <p className="hero-text">
          The Human Run Packet converts Launch Kit readiness into an operator-ready dispatch artifact while keeping
          execution human-required, proof claims blocked, and clinical, PHI, reimbursement, certification, connector,
          and production authority outside the product boundary.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>
            Download Packet Brief
          </a>
          <a className="secondary-action" href={summary.apiRoute}>
            Inspect API
          </a>
          <Link className="secondary-action" href="/qa-run-control">
            Run Control
          </Link>
          <Link className="secondary-action" href="/qa-completion-bridge">
            Completion Bridge
          </Link>
          <Link className="secondary-action" href="/qa-activation-seal">
            Activation Seal
          </Link>
          <Link className="secondary-action" href="/qa-proof-promotion">
            Proof Promotion
          </Link>
          <Link className="secondary-action" href="/qa-claim-guard">
            Claim Guard
          </Link>
          <Link className="secondary-action" href="/pilot-workspace/access">
            Protected Workspace
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="QA human run packet summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Decision</span>
          <strong>{summary.decisionState}</strong>
        </article>
        <article>
          <span>Workflows</span>
          <strong>{summary.workflowCount}</strong>
        </article>
        <article>
          <span>Controls</span>
          <strong>{summary.controlCount}</strong>
        </article>
        <article>
          <span>Hard stops</span>
          <strong>{summary.hardStopControlCount}</strong>
        </article>
        <article>
          <span>Attestations</span>
          <strong>{summary.requiredAttestationCount}</strong>
        </article>
        <article>
          <span>Post-run routes</span>
          <strong>{summary.postRunRouteCount}</strong>
        </article>
        <article>
          <span>Proof claim</span>
          <strong>{summary.proofClaimAllowed ? "allowed" : "blocked"}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>Dispatch-ready still means human AAL2 required and not retained authenticated proof.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.dispatchRules.map((rule, index) => (
            <div className="layer-row" key={rule}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{rule}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="QA human run packet controls">
        <div className="section-heading">
          <p className="eyebrow">Dispatch controls</p>
          <h2>Every dispatch condition has an owner, pass signal, and fail-closed rule.</h2>
        </div>
        {summary.controls.map((control) => (
          <article className="module-row" key={control.control}>
            <div>
              <span>{control.state}</span>
              <h2>{control.control}</h2>
            </div>
            <p>{control.passSignal}</p>
            <div>
              <strong>{control.owner}</strong>
              <ul className="compact-list">
                <li>Fail closed: {control.failClosedIf}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="QA human run packet workflows">
        <div className="section-heading">
          <p className="eyebrow">Workflow packets</p>
          <h2>The packet names the workflow, target, command templates, safe evidence, and post-run proof gates.</h2>
        </div>
        {summary.workflows.map((workflow) => (
          <article className="module-row module-row-stack" key={workflow.workflowKind}>
            <div>
              <span>{workflow.workflowKind}</span>
              <h2>{workflow.name}</h2>
            </div>
            <p>
              Default synthetic target: {workflow.defaultSyntheticTarget}. Buyer proof remains blocked until protected
              packet SHA-256 and append-only audit event visibility exist.
            </p>
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
                <h3>{workflow.manualPacketRoute}</h3>
                <pre className="code-block">{workflow.smokeCommandTemplate}</pre>
              </article>
            </div>
            <div className="principle-grid">
              <article>
                <span>Safe evidence</span>
                <h3>{workflow.protectedPersistenceRoute}</h3>
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

      <section className="section-band" aria-label="QA human run packet post-run routes">
        <div className="section-heading">
          <p className="eyebrow">Post-run route chain</p>
          <h2>The packet is only complete after protected persistence and proof gates are checked.</h2>
        </div>
        <div className="layer-list">
          {summary.postRunRoutes.map((route, index) => (
            <div className="layer-row" key={route}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{route}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band" aria-label="QA human run packet blocked claims">
        <div className="section-heading">
          <p className="eyebrow">Blocked claims</p>
          <h2>The run packet cannot be used as production authority or retained proof by itself.</h2>
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
