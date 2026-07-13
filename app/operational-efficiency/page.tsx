import Link from "next/link";
import { getOperationalEfficiencySummary } from "../lib/operationalEfficiency";

export const metadata = {
  title: "SCRIMED Operational Efficiency",
  description:
    "A control plane for SCRIMED gaps, inefficiencies, bottlenecks, fault classes, hard stops, and resolution sprints."
};

export default function OperationalEfficiencyPage() {
  const summary = getOperationalEfficiencySummary();
  const statusEntries = Object.entries(summary.countsByStatus);
  const domainEntries = Object.entries(summary.countsByDomain);
  const priorityRecords = summary.records.filter((record) =>
    ["operator-required", "protected-gated", "external-review-required", "blocked-by-design"].includes(record.status)
  );

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">Operational Efficiency</p>
        <h1>SCRIMED resolves gaps, inefficiencies, and bottlenecks through owned controls and proof routes.</h1>
        <p className="hero-text">
          This lane turns scattered release, route, reliability, growth, enterprise, audit, and boundary constraints
          into one operating map with owners, hard stops, sprints, and retained approval gates.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Efficiency Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/service-reliability">Service Reliability</Link>
          <Link className="secondary-action" href="/growth-engine">Growth Engine</Link>
          <Link className="secondary-action" href="/enterprise-business-ops">Business Ops</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Operational efficiency summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Records</span>
          <strong>{summary.recordCount}</strong>
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
          <span>Sprints</span>
          <strong>{summary.sprintCount}</strong>
        </article>
        <article>
          <span>Triage items</span>
          <strong>{summary.discrepancyFaultTriageCount}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>Efficiency work can move faster without crossing authority boundaries.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {statusEntries.map(([status, count], index) => (
            <div className="layer-row" key={status}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{status}: {count}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Efficiency domains">
        <div className="section-heading">
          <p className="eyebrow">Domains</p>
          <h2>Every bottleneck is assigned to a domain so it can be routed instead of rediscovered.</h2>
        </div>
        {domainEntries.map(([domain, count]) => (
          <article className="module-row" key={domain}>
            <div>
              <span>domain</span>
              <h2>{domain}</h2>
            </div>
            <p>{count} efficiency records are tracked for this operating domain.</p>
            <Link className="module-link" href={summary.apiRoute}>Inspect records</Link>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Discrepancy and fault triage">
        <div className="section-heading">
          <p className="eyebrow">Discrepancy and fault triage</p>
          <h2>Conflicting signals, recurring errors, and fault patterns now have a containment path before release or buyer use.</h2>
        </div>
        {summary.discrepancyFaultTriageQueue.map((item) => (
          <article className="module-row" key={item.id}>
            <div>
              <span>{item.severity}</span>
              <h2>{item.signal}</h2>
            </div>
            <p>{item.discrepancy}</p>
            <div>
              <strong>{item.immediateContainment}</strong>
              <ul className="compact-list">
                <li>Root cause: {item.rootCauseProbe}</li>
                <li>Permanent control: {item.permanentControl}</li>
                <li>Owner: {item.owner}</li>
                <li>Trigger: {item.promotionTrigger}</li>
                <li>Proof: {item.proofRoutes.join(", ")}</li>
                <li>{item.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Efficiency sprints">
        <div className="section-heading">
          <p className="eyebrow">Resolution Sprints</p>
          <h2>Focused sprints turn known friction into repeatable operating controls.</h2>
        </div>
        {summary.sprints.map((sprint) => (
          <article className="module-row" key={sprint.lane}>
            <div>
              <span>{sprint.owner}</span>
              <h2>{sprint.lane}</h2>
            </div>
            <p>{sprint.objective}</p>
            <div>
              <strong>{sprint.expectedGain}</strong>
              <ul className="compact-list">
                {sprint.sequence.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Priority bottleneck records">
        <div className="section-heading">
          <p className="eyebrow">Priority Bottlenecks</p>
          <h2>Open records keep their hard stops visible until the retained path is complete.</h2>
        </div>
        {priorityRecords.slice(0, 18).map((record) => (
          <article className="module-row" key={record.id}>
            <div>
              <span>{record.status}</span>
              <h2>{record.name}</h2>
            </div>
            <p>{record.inefficiency}</p>
            <div>
              <strong>{record.resolutionPath}</strong>
              <ul className="compact-list">
                <li>Owner: {record.owner}</li>
                <li>Source: {record.sourceSurface}</li>
                <li>Proof: {record.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
