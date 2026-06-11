import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getDemosForPilot,
  getPilotProgramBySlug,
  getPilotPrograms
} from "../../lib/demoPilotPrograms";

export function generateStaticParams() {
  return getPilotPrograms().map((pilot) => ({ slug: pilot.slug }));
}

export default async function PilotProgramDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pilot = getPilotProgramBySlug(slug);

  if (!pilot) {
    notFound();
  }

  const demos = getDemosForPilot(pilot);

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/pilots">Pilot Programs</Link>
        <p className="eyebrow">{pilot.status} · {pilot.duration}</p>
        <h1>{pilot.name}</h1>
        <p className="hero-text">{pilot.objective}</p>
      </section>

      <section className="section-band hub-summary" aria-label="Pilot program summary">
        <article>
          <span>Duration</span>
          <strong>{pilot.duration}</strong>
        </article>
        <article>
          <span>Engagement</span>
          <strong>{pilot.engagementModel}</strong>
        </article>
        <article>
          <span>Included demos</span>
          <strong>{demos.length}</strong>
        </article>
        <article>
          <span>Decision metrics</span>
          <strong>{pilot.successMetrics.length}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Target buyer</p>
          <h2>{pilot.buyer}</h2>
          <Link className="primary-action" href={pilot.requestRoute}>Request this pilot</Link>
        </div>
        <div className="layer-list">
          {pilot.deliverables.map((deliverable, index) => (
            <div className="layer-row" key={deliverable}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{deliverable}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Included product demos">
        <div className="section-heading">
          <p className="eyebrow">Included product proof</p>
          <h2>Inspectable demos ground the pilot in real product surfaces.</h2>
        </div>
        {demos.map((demo) => (
          <article className="module-row" key={demo.slug}>
            <div>
              <span>{demo.status}</span>
              <h2>{demo.name}</h2>
            </div>
            <p>{demo.product} · {demo.agent}</p>
            <Link className="module-link" href={demo.route}>{demo.objective}</Link>
          </article>
        ))}
      </section>

      <section className="section-band principle-grid" aria-label="Pilot success metrics">
        {pilot.successMetrics.map((metric, index) => (
          <article key={metric}>
            <span>Decision metric {String(index + 1).padStart(2, "0")}</span>
            <h3>{metric}</h3>
            <p>Measured against a buyer-approved operational baseline and governance boundary.</p>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Pilot buyer inputs and governance gates">
        <div className="section-heading">
          <p className="eyebrow">Activation requirements</p>
          <h2>The pilot starts only when buyer inputs and governance gates are explicit.</h2>
        </div>
        <article className="module-row">
          <div>
            <span>Buyer inputs</span>
            <h2>Required context</h2>
          </div>
          <p>Business, workflow, and operating information needed to produce decision-grade evidence.</p>
          <ul className="compact-list">
            {pilot.buyerInputs.map((input) => <li key={input}>{input}</li>)}
          </ul>
        </article>
        <article className="module-row">
          <div>
            <span>Governance gates</span>
            <h2>Required controls</h2>
          </div>
          <p>Conditions that keep the engagement auditable, human-reviewed, and healthcare-safe.</p>
          <ul className="compact-list">
            {pilot.governanceGates.map((gate) => <li key={gate}>{gate}</li>)}
          </ul>
        </article>
        <article className="module-row">
          <div>
            <span>Production exclusions</span>
            <h2>Not included</h2>
          </div>
          <p>Capabilities that remain denied or require a separate protected-production approval path.</p>
          <ul className="compact-list">
            {pilot.productionExclusions.map((exclusion) => <li key={exclusion}>{exclusion}</li>)}
          </ul>
        </article>
      </section>

      <section className="section-band product-actions" aria-label="Pilot program actions">
        <div className="action-grid">
          <a className="action-card" href={`/api/pilots/${pilot.slug}/proposal`}>
            <span>Proposal</span>
            <strong>Download pilot proposal</strong>
            <p>Share the proposed scope, commercial model, metrics, inputs, gates, and exclusions.</p>
          </a>
          <Link className="action-card" href={pilot.requestRoute}>
            <span>Start</span>
            <strong>Request this pilot</strong>
            <p>Open the governed enterprise intake with the closest matching service offer selected.</p>
          </Link>
          <Link className="action-card" href="/demos">
            <span>Proof</span>
            <strong>Inspect all demos</strong>
            <p>Review the product evidence that can be packaged into the engagement.</p>
          </Link>
          <Link className="action-card" href="/pricing">
            <span>Commercial</span>
            <strong>Review pricing strategy</strong>
            <p>Inspect expansion paths from evaluation into protected pilot and enterprise license.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
