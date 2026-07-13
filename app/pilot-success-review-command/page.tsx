import Link from "next/link";
import { getPilotSuccessReviewCommandSummary } from "../lib/pilotSuccessReviewCommand";

export const metadata = {
  title: "SCRIMED Pilot Success Review Command",
  description:
    "Synthetic-only pilot success review command for 30/60/90-day review plans, evidence gaps, expansion readiness, and claims-safe follow-up."
};

export default function PilotSuccessReviewCommandPage() {
  const summary = getPilotSuccessReviewCommandSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/pilot-handoff-command">Pilot Handoff Command</Link>
        <p className="eyebrow">Pilot Success Review Command</p>
        <h1>SCRIMED turns handoff evidence into reviewable 30/60/90-day success plans.</h1>
        <p className="hero-text">
          This command layer organizes pilot review questions, evidence gaps, expansion readiness, and claims-safe
          follow-up while keeping ROI, revenue, activation, clinical, payer, EHR, and PHI authority blocked.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>
            Download Success Brief
          </a>
          <a className="secondary-action" href={summary.apiRoute}>
            Inspect API
          </a>
          <Link className="secondary-action" href="/pilot-handoff-command">
            Handoff Command
          </Link>
          <Link className="secondary-action" href="/healthcare-value-realization">
            Value Realization
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Pilot success review summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Review plans</span>
          <strong>{summary.reviewPlanCount}</strong>
        </article>
        <article>
          <span>Evidence gaps</span>
          <strong>{summary.evidenceGapCount}</strong>
        </article>
        <article>
          <span>Expansion items</span>
          <strong>{summary.expansionReadinessCount}</strong>
        </article>
        <article>
          <span>Blocked claims</span>
          <strong>{summary.blockedClaimCount}</strong>
        </article>
        <article>
          <span>Blocked before claim</span>
          <strong>{summary.blockedBeforeClaimCount}</strong>
        </article>
        <article>
          <span>External approvals</span>
          <strong>{summary.externalApprovalRequiredCount}</strong>
        </article>
        <article>
          <span>Proof routes</span>
          <strong>{summary.proofRouteCount}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Pilot success review boundary">
        <div>
          <p className="eyebrow">Success review boundary</p>
          <h2>Review summaries can be prepared; outcome claims remain evidence-bound and human-reviewed.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {Object.entries(summary.authority).map(([name, status], index) => (
            <div className="layer-row" key={name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{name}: {status}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Pilot success review plans">
        <div className="section-heading">
          <p className="eyebrow">Review plans</p>
          <h2>Each review plan ties a time window, reviewer, evidence inputs, success signal, and blocked claim together.</h2>
          <p className="section-copy">{summary.nextBestMove}</p>
        </div>
        {summary.reviewPlans.map((plan) => (
          <article className="module-row" key={plan.id}>
            <div>
              <span>{plan.window} - {plan.domain}</span>
              <h2>{plan.name}</h2>
            </div>
            <p>{plan.reviewQuestion}</p>
            <div>
              <strong>{plan.status}</strong>
              <ul className="compact-list">
                <li>Reviewer: {plan.reviewerRole}</li>
                <li>Signal: {plan.successSignal}</li>
                <li>Safe output: {plan.claimSafeOutput}</li>
                <li>Blocked claim: {plan.blockedClaim}</li>
                <li>Proof routes: {plan.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Pilot success evidence gaps">
        <div className="section-heading">
          <p className="eyebrow">Evidence gaps</p>
          <h2>Evidence gaps block overclaims before buyer, investor, or expansion narratives are shared.</h2>
        </div>
        {summary.evidenceGaps.map((gap) => (
          <article className="module-row" key={gap.id}>
            <div>
              <span>{gap.status}</span>
              <h2>{gap.gap}</h2>
            </div>
            <p>{gap.impact}</p>
            <div>
              <strong>{gap.owner}</strong>
              <ul className="compact-list">
                <li>Workaround: {gap.workaround}</li>
                <li>Proof route: {gap.proofRoute}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Pilot expansion readiness">
        <div className="section-heading">
          <p className="eyebrow">Expansion readiness</p>
          <h2>Expansion opportunities are framed as safe next steps, not guarantees or approvals.</h2>
        </div>
        {summary.expansionReadiness.map((item) => (
          <article className="module-row" key={item.id}>
            <div>
              <span>{item.readiness}</span>
              <h2>{item.opportunity}</h2>
            </div>
            <p>{item.prerequisite}</p>
            <div>
              <strong>{item.reviewerOwner}</strong>
              <ul className="compact-list">
                <li>Next: {item.safeCommercialNextStep}</li>
                <li>Blocked: {item.blockedCommercialAction}</li>
                <li>Proof routes: {item.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
