import Link from "next/link";
import { getStrategicProblemResolutionSummary } from "../lib/strategicProblemResolution";

export const metadata = {
  title: "SCRIMED Strategic Problem Resolution",
  description:
    "Founder-grade operating layer for ranking, resolving, and safely working around SCRIMED execution problems without crossing healthcare boundaries."
};

export default function StrategicProblemResolutionPage() {
  const summary = getStrategicProblemResolutionSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">Strategic Problem Resolution</p>
        <h1>SCRIMED turns constraints into owner-bound execution instead of informal friction.</h1>
        <p className="hero-text">
          This engine ranks high-impact problems, names root causes, maps safe workarounds,
          assigns owners, links proof routes, and blocks unsafe healthcare, production, legal,
          valuation, and certification actions before they become operating drift.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>
            Download Resolution Brief
          </a>
          <a className="secondary-action" href={summary.apiRoute}>
            Inspect API
          </a>
          <Link className="secondary-action" href="/limitations-workarounds">
            Workarounds
          </Link>
          <Link className="secondary-action" href="/operational-efficiency">
            Efficiency
          </Link>
          <Link className="secondary-action" href="/scrimed-automation-autopilot">
            Automation Autopilot
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Strategic problem resolution summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Problems</span>
          <strong>{summary.problemCount}</strong>
        </article>
        <article>
          <span>Critical</span>
          <strong>{summary.criticalProblemCount}</strong>
        </article>
        <article>
          <span>High</span>
          <strong>{summary.highProblemCount}</strong>
        </article>
        <article>
          <span>Avg priority</span>
          <strong>{summary.averagePriorityScore}</strong>
        </article>
        <article>
          <span>Human review</span>
          <strong>{summary.humanReviewRequiredCount}</strong>
        </article>
        <article>
          <span>External approval</span>
          <strong>{summary.externalApprovalRequiredCount}</strong>
        </article>
        <article>
          <span>Proof routes</span>
          <strong>{summary.proofRouteCount}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Resolution boundary">
        <div>
          <p className="eyebrow">Execution boundary</p>
          <h2>World-class execution keeps pressure high and authority boundaries higher.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.operatingRules.map((rule, index) => (
            <div className="layer-row" key={rule.rule}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{rule.rule}: {rule.enforcement}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Priority problem queue">
        <div className="section-heading">
          <p className="eyebrow">Priority queue</p>
          <h2>Every major constraint has root cause, owner, proof, workaround, and next action.</h2>
        </div>
        {summary.problems.map((problem) => (
          <article className="module-row" key={problem.id}>
            <div>
              <span>{problem.severity}</span>
              <h2>{problem.title}</h2>
            </div>
            <p>{problem.problem}</p>
            <div>
              <strong>Priority {problem.priorityScore} - {problem.status}</strong>
              <ul className="compact-list">
                <li>Root cause: {problem.rootCause}</li>
                <li>Resolution: {problem.resolutionPath}</li>
                <li>Workaround: {problem.safeWorkaround}</li>
                <li>Owner: {problem.owner}</li>
                <li>Next: {problem.nextAction}</li>
                <li>Audit: {problem.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Resolution sprints">
        <div className="section-heading">
          <p className="eyebrow">Resolution sprints</p>
          <h2>Top constraints become repeatable execution loops, not one-off memory.</h2>
        </div>
        {summary.sprints.map((sprint) => (
          <article className="module-row" key={sprint.name}>
            <div>
              <span>{sprint.horizon}</span>
              <h2>{sprint.name}</h2>
            </div>
            <p>{sprint.objective}</p>
            <div>
              <strong>{sprint.owner}</strong>
              <ul className="compact-list">
                {sprint.sequence.map((step) => (
                  <li key={step}>{step}</li>
                ))}
                <li>Success: {sprint.successSignal}</li>
                <li>{sprint.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band split-band" aria-label="Blocked actions">
        <div>
          <p className="eyebrow">Hard stops</p>
          <h2>Speed does not convert blocked authority into permission.</h2>
          <p className="section-copy">{summary.nextBuildStep}</p>
        </div>
        <div className="layer-list">
          {summary.blockedActions.map((action, index) => (
            <div className="layer-row" key={action}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{action}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
