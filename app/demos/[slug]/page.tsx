import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductDemoBySlug,
  getProductDemos
} from "../../lib/demoPilotPrograms";

export function generateStaticParams() {
  return getProductDemos().map((demo) => ({ slug: demo.slug }));
}

export default async function DemoDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const demo = getProductDemoBySlug(slug);

  if (!demo) {
    notFound();
  }

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/demos">Demo Center</Link>
        <p className="eyebrow">{demo.product} · {demo.status}</p>
        <h1>{demo.name}</h1>
        <p className="hero-text">{demo.objective}</p>
      </section>

      <section className="section-band hub-summary" aria-label="Product demo summary">
        <article>
          <span>Buyer</span>
          <strong>{demo.buyer}</strong>
        </article>
        <article>
          <span>Agent</span>
          <strong>{demo.agent}</strong>
        </article>
        <article>
          <span>Proof routes</span>
          <strong>{demo.proofRoutes.length}</strong>
        </article>
        <article>
          <span>Exclusions</span>
          <strong>{demo.productionExclusions.length}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Synthetic scenario</p>
          <h2>{demo.scenario}</h2>
          <Link className="primary-action" href={demo.runRoute}>{demo.runLabel}</Link>
        </div>
        <div className="layer-list">
          {demo.guidedSteps.map((step, index) => (
            <div className="layer-row" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Demo proof routes">
        <div className="section-heading">
          <p className="eyebrow">Inspectable proof</p>
          <h2>Workflow, result, governance, and quality evidence remain one click away.</h2>
        </div>
        {demo.proofRoutes.map((proof) => (
          <article className="module-row" key={proof.route}>
            <div>
              <span>proof route</span>
              <h2>{proof.label}</h2>
            </div>
            <p>{proof.evidence}</p>
            <Link className="module-link" href={proof.route}>Inspect {proof.label}</Link>
          </article>
        ))}
      </section>

      <section className="section-band principle-grid" aria-label="Demo outcomes">
        {demo.inspectableOutcomes.map((outcome, index) => (
          <article key={outcome}>
            <span>Outcome {String(index + 1).padStart(2, "0")}</span>
            <h3>{outcome}</h3>
            <p>{demo.successSignals[index] ?? "Measured against a buyer-approved pilot baseline."}</p>
          </article>
        ))}
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Governance boundary</p>
          <h2>Human-reviewed synthetic evaluation only.</h2>
          <ul className="compact-list">
            {demo.governanceBoundaries.map((boundary) => <li key={boundary}>{boundary}</li>)}
          </ul>
        </div>
        <div className="layer-list">
          {demo.productionExclusions.map((exclusion, index) => (
            <div className="layer-row" key={exclusion}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{exclusion}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band product-actions" aria-label="Demo buyer actions">
        <div className="action-grid">
          <Link className="action-card" href={demo.runRoute}>
            <span>Run</span>
            <strong>{demo.runLabel}</strong>
            <p>Inspect the current executable synthetic product surface.</p>
          </Link>
          <Link className="action-card" href="/pilots">
            <span>Pilot</span>
            <strong>Compare pilot programs</strong>
            <p>Choose a structured engagement with outcomes, inputs, gates, and exclusions.</p>
          </Link>
          <Link className="action-card" href="/pilot?offer=synthetic-pilot-evaluation">
            <span>Request</span>
            <strong>Request this evaluation</strong>
            <p>Start a governed buyer intake without submitting PHI.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
