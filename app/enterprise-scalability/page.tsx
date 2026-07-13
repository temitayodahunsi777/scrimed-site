import Link from "next/link";
import { getEnterpriseScalabilityOperationsSummary } from "../lib/enterpriseScalabilityOperations";

export const metadata = {
  title: "SCRIMED Enterprise Scalability Operations",
  description:
    "SCRIMED enterprise scalability, SLO readiness, tenant scale, incident/change operations, support load, global deployment, and cost control lane."
};

export default function EnterpriseScalabilityPage() {
  const summary = getEnterpriseScalabilityOperationsSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">Enterprise scalability operations</p>
        <h1>SCRIMED prepares enterprise scale without turning readiness into unsupported promises.</h1>
        <p className="hero-text">
          This lane organizes capacity planning, tenant isolation, queueing, observability, SLO
          readiness, incident and change operations, support load, global deployment preparation,
          disaster recovery planning, and usage-cost governance before enterprise commitments expand.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>
            Download scale brief
          </a>
          <Link className="secondary-action" href="/service-reliability">
            Review Reliability
          </Link>
          <Link className="secondary-action" href="/enterprise-business-ops">
            Open Business Ops
          </Link>
          <Link className="secondary-action" href="/operational-efficiency">
            Resolve Bottlenecks
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Enterprise scalability summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Domains</span>
          <strong>{summary.domainCount}</strong>
        </article>
        <article>
          <span>Controls</span>
          <strong>{summary.controlCount}</strong>
        </article>
        <article>
          <span>Workstreams</span>
          <strong>{summary.workstreamCount}</strong>
        </article>
        <article>
          <span>Cadences</span>
          <strong>{summary.cadenceCount}</strong>
        </article>
        <article>
          <span>Bottlenecks</span>
          <strong>{summary.bottleneckCount}</strong>
        </article>
        <article>
          <span>Open bottlenecks</span>
          <strong>{summary.openBottleneckCount}</strong>
        </article>
        <article>
          <span>Proof routes</span>
          <strong>{summary.proofRouteCount}</strong>
        </article>
        <article>
          <span>Hard stops</span>
          <strong>{summary.hardStopCount}</strong>
        </article>
        <article>
          <span>Blocked claims</span>
          <strong>{summary.blockedClaimCount}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Scalability operating boundary">
        <div>
          <p className="eyebrow">Operating rule</p>
          <h2>Scale readiness is internal evidence until contracts, staffing, hosting, and external approvals exist.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.recommendedOperatingPath.map((step, index) => (
            <div className="layer-row" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Enterprise scalability domains">
        <div className="section-heading">
          <p className="eyebrow">Scale domains</p>
          <h2>Every enterprise scale question has an owner, control, proof route, and retained boundary.</h2>
        </div>
        {summary.domains.map((domain) => (
          <article className="module-row" key={domain.slug}>
            <div>
              <span>{domain.status}</span>
              <h2>{domain.name}</h2>
            </div>
            <p>{domain.scaleQuestion}</p>
            <div>
              <strong>{domain.owner}</strong>
              <ul className="compact-list">
                <li>Control: {domain.operatingControl}</li>
                <li>Evidence: {domain.evidence.join(", ")}</li>
                <li>Proof routes: {domain.proofRoutes.join(", ")}</li>
                <li>Boundary: {domain.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Enterprise scalability controls">
        <div className="section-heading">
          <p className="eyebrow">Controls</p>
          <h2>Capacity, queueing, tenancy, SLO language, incidents, support, region, and cost controls stay explicit.</h2>
        </div>
        {summary.controls.map((control) => (
          <article className="module-row" key={control.slug}>
            <div>
              <span>{control.status}</span>
              <h2>{control.control}</h2>
            </div>
            <p>{control.purpose}</p>
            <div>
              <strong>{control.owner}</strong>
              <ul className="compact-list">
                <li>Required evidence: {control.requiredEvidence.join(", ")}</li>
                <li>Hard stops: {control.hardStops.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Enterprise scalability workstreams">
        <div className="section-heading">
          <p className="eyebrow">Workstreams</p>
          <h2>Scale work is sequenced across release, tenancy, runtime, support, global, and margin operations.</h2>
        </div>
        <div className="principle-grid">
          {summary.workstreams.map((workstream) => (
            <article key={workstream.slug}>
              <span>{workstream.owner}</span>
              <h3>{workstream.name}</h3>
              <p>{workstream.objective}</p>
              <ul className="compact-list">
                <li>Sequence: {workstream.sequence.join(", ")}</li>
                <li>Proof routes: {workstream.proofRoutes.join(", ")}</li>
                <li>{workstream.retainedBoundary}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Enterprise scalability cadences and bottlenecks">
        <div className="section-heading">
          <p className="eyebrow">Cadences and bottlenecks</p>
          <h2>Recurring scale reviews catch support drag, SLO drift, regional claims, incidents, retries, and margin pressure.</h2>
        </div>
        {summary.cadences.map((cadence) => (
          <article className="module-row" key={cadence.cadence}>
            <div>
              <span>cadence</span>
              <h2>{cadence.cadence}</h2>
            </div>
            <p>{cadence.decisionOutput}</p>
            <div>
              <strong>{cadence.owner}</strong>
              <ul className="compact-list">
                <li>Signals: {cadence.reviewedSignals.join(", ")}</li>
                <li>Hard stops: {cadence.hardStops.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
        {summary.bottlenecks.map((bottleneck) => (
          <article className="module-row" key={bottleneck.slug}>
            <div>
              <span>{bottleneck.status}</span>
              <h2>{bottleneck.name}</h2>
            </div>
            <p>{bottleneck.impact}</p>
            <div>
              <strong>{bottleneck.owner}</strong>
              <ul className="compact-list">
                <li>Workaround: {bottleneck.workaround}</li>
                <li>Graduation gate: {bottleneck.graduationGate}</li>
                <li>Proof routes: {bottleneck.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
