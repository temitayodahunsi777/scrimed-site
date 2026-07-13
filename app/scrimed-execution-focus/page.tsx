import Link from "next/link";
import { getScrimedExecutionFocusSummary } from "../lib/scrimedExecutionFocus";

export const metadata = {
  title: "SCRIMED Execution Focus Engine",
  description:
    "Synthetic SCRIMED execution focus engine for ranking proof routes, revenue actions, trust controls, investor readiness, operating hygiene, and blocked approval paths."
};

export default function ScrimedExecutionFocusPage() {
  const summary = getScrimedExecutionFocusSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/scrimed-operating-command">
          Operating Command
        </Link>
        <p className="eyebrow">SCRIMED Execution Focus Engine</p>
        <h1>Rank the next safe moves by proof, revenue, trust, investor confidence, and retained boundaries.</h1>
        <p className="hero-text">{summary.boundary}</p>
        <div className="hero-actions" aria-label="SCRIMED Execution Focus actions">
          <Link href={summary.apiRoute}>Inspect API</Link>
          <Link href={summary.briefRoute}>Download Brief</Link>
          <Link href="/pilot-demo-commercial-readiness">Demo to Pilot</Link>
          <Link href="/scrimed-cyber-defense">Cyber Defense</Link>
          <Link href="/investor-readiness">Investor Command</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED Execution Focus scorecard">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Now</span>
          <strong>{summary.scorecard.nowCount}</strong>
        </article>
        <article>
          <span>Next</span>
          <strong>{summary.scorecard.nextCount}</strong>
        </article>
        <article>
          <span>Blocked</span>
          <strong>{summary.scorecard.blockedCount}</strong>
        </article>
        <article>
          <span>Avg now score</span>
          <strong>{summary.scorecard.averageNowFocusScore}</strong>
        </article>
        <article>
          <span>Highest value</span>
          <strong>{summary.scorecard.highestValueLane}</strong>
        </article>
        <article>
          <span>Safety</span>
          <strong>{summary.scorecard.safetyPosture}</strong>
        </article>
        <article>
          <span>Production</span>
          <strong>{String(summary.scorecard.productionReadiness)}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="SCRIMED Execution Focus doctrine">
        <div>
          <p className="eyebrow">Strategic Constraint</p>
          <h2>Build pressure into the actions that make SCRIMED easier to buy, diligence, trust, and operate.</h2>
        </div>
        <div>
          <p>{summary.recommendedNextBuildStep}</p>
          <p>
            This focus layer is deliberately recommendation-only. It gives SCRIMED a ranked operating queue without
            relaxing approval gates, making regulated claims, or turning blocked work into production authority.
          </p>
        </div>
      </section>

      <section className="table-section" aria-label="Now Focus">
        <div className="section-heading">
          <p className="eyebrow">Now Focus</p>
          <h2>Highest-leverage work SCRIMED can advance immediately inside the synthetic, human-reviewed boundary.</h2>
        </div>
        {summary.nowItems.map((item) => (
          <article className="module-row" key={item.id}>
            <div>
              <span>{item.lane}</span>
              <h2>{item.id}</h2>
            </div>
            <p>{item.objective}</p>
            <div>
              <strong>Focus score: {item.focusScore}</strong>
              <ul className="compact-list">
                <li>Why now: {item.whyNow}</li>
                <li>Owner: {item.owner}</li>
                <li>
                  Proof route: <Link href={item.proofRoute}>{item.proofRoute}</Link>
                </li>
                <li>Next action: {item.nextAction}</li>
                <li>Human review: {String(item.humanReviewRequired)}</li>
                <li>Audit hash: {item.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Next Focus">
        <div className="section-heading">
          <p className="eyebrow">Next Focus</p>
          <h2>Work that should follow once the immediate proof, revenue, trust, and operating controls are tighter.</h2>
        </div>
        {summary.nextItems.map((item) => (
          <article className="module-row" key={item.id}>
            <div>
              <span>{item.lane}</span>
              <h2>{item.id}</h2>
            </div>
            <p>{item.objective}</p>
            <div>
              <strong>Focus score: {item.focusScore}</strong>
              <ul className="compact-list">
                <li>Source: {item.sourceSystem}</li>
                <li>Owner: {item.owner}</li>
                <li>Boundary: {item.retainedBoundary}</li>
                <li>API route: {item.apiRoute}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Blocked Until Approved">
        <div className="section-heading">
          <p className="eyebrow">Blocked Until Approved</p>
          <h2>These items remain visible so SCRIMED can build the approval path without pretending the boundary is gone.</h2>
        </div>
        {summary.blockedItems.map((item) => (
          <article className="module-row" key={item.id}>
            <div>
              <span>{item.lane}</span>
              <h2>{item.id}</h2>
            </div>
            <p>{item.objective}</p>
            <div>
              <strong>Focus score capped: {item.focusScore}</strong>
              <ul className="compact-list">
                <li>Retained boundary: {item.retainedBoundary}</li>
                <li>Next workaround: {item.nextAction}</li>
                {item.blockedActions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Operating Rules">
        <div className="section-heading">
          <p className="eyebrow">Operating Rules</p>
          <h2>Focus is only useful when it keeps the company faster and safer at the same time.</h2>
        </div>
        {summary.operatingRules.map((rule) => (
          <article className="module-row" key={rule}>
            <div>
              <span>rule</span>
              <h2>Human-reviewed execution</h2>
            </div>
            <p>{rule}</p>
            <div>
              <strong>Production readiness: {String(summary.productionReadiness)}</strong>
              <ul className="compact-list">
                <li>No-PHI confirmed: {String(summary.noPhiConfirmed)}</li>
                <li>Human review required: {String(summary.humanReviewRequired)}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
