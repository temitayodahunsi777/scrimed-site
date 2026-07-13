import Link from "next/link";
import { getClinicalRobustnessLabSummary } from "../lib/clinicalRobustnessLab";

export default function ClinicalRobustnessLabPage() {
  const summary = getClinicalRobustnessLabSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/omega-audit">
          Omega Audit
        </Link>
        <p className="eyebrow">Clinical Robustness Lab</p>
        <h1>Adversarial clinical readiness testing for SCRIMED agents and products.</h1>
        <p className="hero-text">
          SCRIMED now tracks no-PHI clinical robustness scenarios for missing labs, missing imaging, note-only blind spots, hallucination risk, citation quality, guideline grounding, demographic bias risk, data freshness, model disagreement, and human review.
        </p>
        <p className="hero-text">{summary.useNotice}</p>
        <div className="hero-actions" aria-label="Clinical robustness actions">
          <Link href="/api/clinical-robustness-lab">Inspect API</Link>
          <Link href="/api/clinical-robustness-lab/brief">Download Brief</Link>
          <Link href="/synthetic/validation">Synthetic Validation</Link>
          <Link href="/workflows/execution-attempts">Attempt Store</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Clinical robustness summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Products</span>
          <strong>{summary.productCount}</strong>
        </article>
        <article>
          <span>Scenarios</span>
          <strong>{summary.scenarioCount}</strong>
        </article>
        <article>
          <span>Perturbations</span>
          <strong>
            {summary.coveredPerturbationCount}/{summary.perturbationCount}
          </strong>
        </article>
        <article>
          <span>Clinical readiness score</span>
          <strong>{summary.averageClinicalReadinessScore}</strong>
        </article>
        <article>
          <span>Failed checks</span>
          <strong>{summary.failedChecks}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Clinical robustness boundary">
        <div>
          <p className="eyebrow">Operating boundary</p>
          <h2>Clinical readiness scores are not clinical validation or production approval.</h2>
        </div>
        <p>{summary.boundary}</p>
      </section>

      <section className="section-band principle-grid" aria-label="Perturbation coverage">
        {summary.perturbations.map((perturbation) => (
          <article key={perturbation.slug}>
            <span>{perturbation.slug}</span>
            <h3>{perturbation.label}</h3>
            <p>{perturbation.detectionGoal}</p>
            <p>{perturbation.expectedSafeBehavior}</p>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Clinical robustness product coverage">
        {summary.products.map((product) => (
          <article className="module-row" key={product.slug}>
            <div>
              <span>{product.status}</span>
              <h2>{product.name}</h2>
            </div>
            <p>
              Risk {product.clinicalRisk}; {product.scenarioCount} scenario; score {product.averageScore}; reviewer {product.minimumReviewerRole}.
            </p>
            <Link className="module-link" href={product.route}>
              Review product route
            </Link>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Clinical robustness scenario scorecards">
        {summary.scorecards.map((scorecard) => {
          const scenario = summary.scenarios.find((item) => item.id === scorecard.scenarioId);

          return (
            <article className="module-row" key={scorecard.scenarioId}>
              <div>
                <span>{scorecard.clinicalReadinessBand}</span>
                <h2>{scenario?.title ?? scorecard.scenarioId}</h2>
              </div>
              <p>
                {scorecard.productName}; score {scorecard.readinessScore}; {scorecard.passed} passed and {scorecard.failed} failed. Perturbations: {scenario?.perturbations.join(", ") ?? "not mapped"}.
              </p>
              <Link className="module-link" href="/trust-os">
                Review TrustOS gates
              </Link>
            </article>
          );
        })}
      </section>

      <section className="section-band compact-list" aria-label="Clinical robustness hard stops">
        <div>
          <p className="eyebrow">Hard stops</p>
          <h2>Blocked before clinical production.</h2>
        </div>
        <ul>
          {summary.hardStops.map((stop) => (
            <li key={stop}>{stop}</li>
          ))}
        </ul>
      </section>

      <section className="section-band split-band" aria-label="Clinical robustness next step">
        <div>
          <p className="eyebrow">Next implementation step</p>
          <h2>Bind robustness results to durable execution evidence.</h2>
        </div>
        <p>{summary.nextHighestImpactStep}</p>
      </section>
    </main>
  );
}
