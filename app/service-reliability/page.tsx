import Link from "next/link";
import { getServiceReliabilitySummary } from "../lib/serviceReliability";

export const metadata = {
  title: "SCRIMED Service Reliability",
  description:
    "SCRIMED service reliability map for product controls, fault classes, efficiency improvements, owners, proof routes, and retained authority boundaries."
};

export default function ServiceReliabilityPage() {
  const summary = getServiceReliabilitySummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/hub">Hub</Link>
        <p className="eyebrow">Service Reliability</p>
        <h1>SCRIMED turns product barriers, faults, and inefficiencies into owned operating controls.</h1>
        <p className="hero-text">
          This lane maps products, services, agents, fault classes, mitigations, owners, proof routes, and retained approval boundaries so the platform can keep hardening without overclaiming authority.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Reliability Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/product">Product Console</Link>
          <Link className="secondary-action" href="/navigation">Navigation Audit</Link>
          <Link className="secondary-action" href="/release-continuity">Release Continuity</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Service reliability summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Controls</span>
          <strong>{summary.controlCount}</strong>
        </article>
        <article>
          <span>Open gates</span>
          <strong>{summary.openGateCount}</strong>
        </article>
        <article>
          <span>Fault classes</span>
          <strong>{summary.faultClassCount}</strong>
        </article>
        <article>
          <span>High severity</span>
          <strong>{summary.highSeverityFaultClassCount}</strong>
        </article>
        <article>
          <span>Efficiency work</span>
          <strong>{summary.efficiencyImprovementCount}</strong>
        </article>
        <article>
          <span>Page routes</span>
          <strong>{summary.sourceAlignment.pageRouteCount}</strong>
        </article>
        <article>
          <span>API patterns</span>
          <strong>{summary.sourceAlignment.apiRoutePatternCount}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>Reliability hardening strengthens SCRIMED; it does not grant authority.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.nextOperatorActions.map((action, index) => (
            <div className="layer-row" key={action}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{action}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Product and service reliability controls">
        <div className="section-heading">
          <p className="eyebrow">Product controls</p>
          <h2>Each product and service lane now has a barrier, mitigation, owner, proof route, and retained boundary.</h2>
        </div>
        {summary.productServiceControls.map((control) => (
          <article className="module-row" key={control.name}>
            <div>
              <span>{control.status}</span>
              <h2>{control.name}</h2>
            </div>
            <p>{control.barrier}</p>
            <div>
              <strong>{control.mitigation}</strong>
              <ul className="compact-list">
                <li>Surface: {control.productSurface}</li>
                <li>Owner: {control.owner}</li>
                <li>Next: {control.nextAction}</li>
                <li>Boundary: {control.retainedBoundary}</li>
                <li>Proof routes: {control.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Reliability fault classes">
        <div className="section-heading">
          <p className="eyebrow">Fault classes</p>
          <h2>Known fault patterns are classified before they become release surprises.</h2>
        </div>
        {summary.faultClasses.map((faultClass) => (
          <article className="module-row" key={faultClass.name}>
            <div>
              <span>{faultClass.severity}</span>
              <h2>{faultClass.name}</h2>
            </div>
            <p>{faultClass.likelySource}</p>
            <div>
              <strong>{faultClass.control}</strong>
              <ul className="compact-list">
                <li>Fail closed: {faultClass.failClosedBehavior}</li>
                <li>Detection routes: {faultClass.detectionRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Efficiency improvements">
        <div className="section-heading">
          <p className="eyebrow">Efficiency</p>
          <h2>Reliability improvements reduce operator drag while keeping hard boundaries visible.</h2>
        </div>
        {summary.efficiencyImprovements.map((improvement) => (
          <article className="module-row" key={improvement.name}>
            <div>
              <span>improvement</span>
              <h2>{improvement.name}</h2>
            </div>
            <p>{improvement.impact}</p>
            <div>
              <strong>{improvement.proof}</strong>
              <ul className="compact-list">
                <li>Owner: {improvement.owner}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
