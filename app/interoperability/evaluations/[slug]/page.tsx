import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getInteroperabilityConformanceEvaluationBySlug,
  getInteroperabilityConformanceEvaluations
} from "../../../lib/interoperabilityConformanceEvaluations";

export function generateStaticParams() {
  return getInteroperabilityConformanceEvaluations().map((evaluation) => ({
    slug: evaluation.slug
  }));
}

export default async function InteroperabilityEvaluationDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const evaluation = getInteroperabilityConformanceEvaluationBySlug(slug);

  if (!evaluation) {
    notFound();
  }

  return (
    <main>
      <section className="page-hero trust-hero">
        <Link className="back-link" href="/interoperability/evaluations">Conformance evaluations</Link>
        <p className="eyebrow">{evaluation.agentOwner}</p>
        <h1>{evaluation.name}</h1>
        <p className="hero-text">{evaluation.boundary}</p>
      </section>

      <section className="section-band hub-summary" aria-label="Conformance evaluation result">
        <article>
          <span>Synthetic status</span>
          <strong>{evaluation.status}</strong>
        </article>
        <article>
          <span>Live readiness</span>
          <strong>{evaluation.liveReadiness}</strong>
        </article>
        <article>
          <span>Checks passed</span>
          <strong>{evaluation.passedChecks}</strong>
        </article>
        <article>
          <span>Pre-live blockers</span>
          <strong>{evaluation.blockedChecks}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="Conformance evaluation checks">
        <div className="section-heading">
          <p className="eyebrow">Deterministic checks</p>
          <h2>{evaluation.targetProfile}</h2>
        </div>
        {evaluation.checks.map((check) => (
          <article className="module-row" key={check.id}>
            <div>
              <span>{check.status}</span>
              <h2>{check.label}</h2>
            </div>
            <p>{check.scope} · {check.category}</p>
            <div>
              <strong>{check.evidence}</strong>
              <ul className="compact-list">
                <li>{check.detail}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band principle-grid" aria-label="Required conformance evidence">
        {evaluation.requiredEvidence.map((artifact) => (
          <article key={artifact.label}>
            <span>{artifact.status}</span>
            <h3>{artifact.label}</h3>
            <p>{artifact.detail}</p>
            {artifact.route ? (
              <Link className="module-link" href={artifact.route}>Inspect evidence</Link>
            ) : null}
          </article>
        ))}
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Required before live exchange</p>
          <h2>Production use remains denied until every deployment-specific blocker is resolved.</h2>
        </div>
        <div className="layer-list">
          {evaluation.liveBlockers.map((blocker, index) => (
            <div className="layer-row" key={blocker}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{blocker}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Linked controls</p>
          <h2>Contract, fixture, and standards evidence remain inspectable.</h2>
        </div>
        <div className="layer-list">
          <Link className="layer-row" href={evaluation.contractRoute}>
            <span>01</span>
            <strong>Connector contract</strong>
          </Link>
          <Link className="layer-row" href={evaluation.fixtureRoute}>
            <span>02</span>
            <strong>Synthetic fixture</strong>
          </Link>
          {evaluation.standardIds.map((standardId, index) => (
            <Link className="layer-row" href={`/interoperability/${standardId}`} key={standardId}>
              <span>{String(index + 3).padStart(2, "0")}</span>
              <strong>{standardId}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-band" aria-label="Official conformance references">
        <div className="section-heading">
          <p className="eyebrow">Primary sources</p>
          <h2>Official references retained for implementation and partner review.</h2>
        </div>
        <div className="layer-list">
          {evaluation.sourceUrls.map((url, index) => (
            <div className="layer-row" key={url}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong><a href={url}>{url}</a></strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
