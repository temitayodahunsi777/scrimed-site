import Link from "next/link";
import { getBuyerReleaseControlRunSummary } from "../lib/buyerReleaseControlRun";

export const metadata = {
  title: "SCRIMED Buyer Release Control Runbook",
  description:
    "Metadata-only buyer-specific release-control runbook for protected AAL2 release decisions, reviewer signoffs, lockbox controls, authority attestations, recipient controls, access-log reconciliation, and Buyer Diligence refresh."
};

function JsonBlock({ value }: { value: unknown }) {
  return <pre className="code-block">{JSON.stringify(value, null, 2)}</pre>;
}

export default function BuyerReleaseControlRunPage() {
  const summary = getBuyerReleaseControlRunSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">
          Product Console
        </Link>
        <p className="eyebrow">Buyer Release Control</p>
        <h1>SCRIMED now has a no-secret operator runbook for buyer-specific proof release.</h1>
        <p className="hero-text">
          The runbook sequences external approval references, release decision, named reviewer
          signoffs, distribution lockbox, release authority, recipient controls, access-log
          reconciliation, and Buyer Diligence refresh while keeping external sharing, clinical
          authority, PHI authority, reimbursement, public claims, and certification claims blocked.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>
            Download Runbook
          </a>
          <a className="secondary-action" href={summary.apiRoute}>
            Inspect API
          </a>
          <Link className="secondary-action" href="/pilot-workspace/access">
            Protected Workspace
          </Link>
          <Link className="secondary-action" href="/qa-buyer-proof-release">
            Buyer Proof Release
          </Link>
          <Link className="secondary-action" href="/boundary-resolution">
            Boundary Register
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Buyer release-control summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Execution</span>
          <strong>{summary.executionDecision}</strong>
        </article>
        <article>
          <span>Share decision</span>
          <strong>{summary.shareDecision}</strong>
        </article>
        <article>
          <span>Steps</span>
          <strong>{summary.stepCount}</strong>
        </article>
        <article>
          <span>Protected routes</span>
          <strong>{summary.protectedWriteRouteCount}</strong>
        </article>
        <article>
          <span>Packet routes</span>
          <strong>{summary.packetRouteCount}</strong>
        </article>
        <article>
          <span>Hard stops</span>
          <strong>{summary.hardStopCount}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>Public runbook access does not create buyer release authority.</h2>
          <p className="section-copy">{summary.boundary}</p>
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

      <section className="table-section" aria-label="Buyer release-control operator sequence">
        <div className="section-heading">
          <p className="eyebrow">Operator sequence</p>
          <h2>Use this order when the protected AAL2 session is available.</h2>
        </div>
        <div className="layer-list">
          {summary.operatorSequence.map((step, index) => (
            <div className="layer-row" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Buyer release-control steps">
        <div className="section-heading">
          <p className="eyebrow">Release-control chain</p>
          <h2>Every step has a protected route, packet route, payload template, and retained hard stop.</h2>
        </div>
        {summary.steps.map((step) => (
          <article className="module-row module-row-stack" key={step.id}>
            <div>
              <span>{step.state}</span>
              <h2>
                {step.order}. {step.label}
              </h2>
            </div>
            <p>{step.boundary}</p>
            <div className="principle-grid">
              <article>
                <span>Protected route</span>
                <h3>{step.protectedRoute}</h3>
                <p>{step.operatorAction}</p>
              </article>
              <article>
                <span>Packet route</span>
                <h3>{step.packetRoute}</h3>
                <p>{step.expectedAuditSignal}</p>
              </article>
              <article>
                <span>Prerequisite</span>
                <h3>{step.expectedPacketType}</h3>
                <p>{step.prerequisite}</p>
              </article>
            </div>
            <div className="principle-grid">
              <article>
                <span>Safe payload template</span>
                <h3>{step.id}</h3>
                <JsonBlock value={step.safePayloadTemplate} />
              </article>
              <article>
                <span>Hard stops</span>
                <h3>{step.hardStops.length} checks</h3>
                <ul className="compact-list">
                  {step.hardStops.map((stop) => (
                    <li key={stop}>{stop}</li>
                  ))}
                </ul>
              </article>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Buyer release-control workarounds">
        <div className="section-heading">
          <p className="eyebrow">Safe workarounds</p>
          <h2>Known operational limits are routed through safer evidence processes.</h2>
          <p className="section-copy">{summary.nextRecommendedAction}</p>
        </div>
        <div className="layer-list">
          {summary.workarounds.map((workaround, index) => (
            <div className="layer-row" key={workaround}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{workaround}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
