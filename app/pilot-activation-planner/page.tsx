import Link from "next/link";
import { getPilotActivationPlannerSummary } from "../lib/pilotActivationPlanner";

export const metadata = {
  title: "SCRIMED Pilot Activation Planner",
  description:
    "Synthetic-only pilot activation planner for prerequisites, owners, blockers, handoffs, success criteria, and review-gated next actions."
};

export default function PilotActivationPlannerPage() {
  const summary = getPilotActivationPlannerSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">Pilot Activation Planner</p>
        <h1>SCRIMED turns buyer evidence into review-gated pilot activation plans.</h1>
        <p className="hero-text">
          This planner connects evidence packets, buyer prerequisites, SCRIMED owners, blocker workarounds,
          kickoff handoffs, and success criteria without granting live PHI, production, customer activation,
          payer, EHR, legal, financial, or clinical authority.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>
            Download Activation Brief
          </a>
          <a className="secondary-action" href={summary.apiRoute}>
            Inspect API
          </a>
          <Link className="secondary-action" href="/pilot-value-evidence">
            Evidence Packets
          </Link>
          <Link className="secondary-action" href="/client-onboarding">
            Onboarding
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Pilot activation planner summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Steps</span>
          <strong>{summary.stepCount}</strong>
        </article>
        <article>
          <span>Plans</span>
          <strong>{summary.planCount}</strong>
        </article>
        <article>
          <span>Blockers</span>
          <strong>{summary.blockerCount}</strong>
        </article>
        <article>
          <span>Handoffs</span>
          <strong>{summary.handoffCount}</strong>
        </article>
        <article>
          <span>External approvals</span>
          <strong>{summary.externalApprovalRequiredCount}</strong>
        </article>
        <article>
          <span>Blocked before live</span>
          <strong>{summary.blockedBeforeLiveCount}</strong>
        </article>
        <article>
          <span>Review gates</span>
          <strong>{summary.humanReviewRequiredCount}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Pilot activation planner boundary">
        <div>
          <p className="eyebrow">Activation boundary</p>
          <h2>Activation planning is allowed; customer go-live and live-system authority remain blocked.</h2>
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

      <section className="table-section" aria-label="Pilot activation plans">
        <div className="section-heading">
          <p className="eyebrow">Activation plans</p>
          <h2>Plans tie buyer segment, source packet, scope, owners, and success criteria to retained boundaries.</h2>
          <p className="section-copy">{summary.nextBestMove}</p>
        </div>
        {summary.plans.map((plan) => (
          <article className="module-row" key={plan.id}>
            <div>
              <span>{plan.buyerSegment}</span>
              <h2>{plan.name}</h2>
            </div>
            <p>{plan.activationThesis}</p>
            <div>
              <strong>{plan.handoffOwner}</strong>
              <ul className="compact-list">
                <li>Source packet: {plan.sourcePacket}</li>
                <li>Artifacts: {plan.kickoffArtifacts.join(", ")}</li>
                <li>Success: {plan.successCriteria.join(" ")}</li>
                <li>Boundary: {plan.retainedBoundary}</li>
                <li>Next: {plan.nextAction}</li>
                <li>Audit: {plan.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Pilot activation steps">
        <div className="section-heading">
          <p className="eyebrow">Activation steps</p>
          <h2>Each step names buyer prerequisites, SCRIMED prerequisites, owner, review gate, mode, and proof routes.</h2>
        </div>
        {summary.topSteps.map((step) => (
          <article className="module-row" key={step.id}>
            <div>
              <span>{step.domain}</span>
              <h2>{step.name}</h2>
            </div>
            <p>{step.buyerPrerequisite}</p>
            <div>
              <strong>{step.readiness} - {step.activationMode}</strong>
              <ul className="compact-list">
                <li>SCRIMED prerequisite: {step.scrimedPrerequisite}</li>
                <li>Owner: {step.requiredOwner}</li>
                <li>Review gate: {step.humanReviewGate}</li>
                <li>Proof routes: {step.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Pilot activation blockers">
        <div className="section-heading">
          <p className="eyebrow">Blockers and workarounds</p>
          <h2>Blocked states are useful because they keep sales speed from outrunning approvals.</h2>
        </div>
        {summary.blockers.map((blocker) => (
          <article className="module-row" key={blocker.id}>
            <div>
              <span>{blocker.severity}</span>
              <h2>{blocker.blocker}</h2>
            </div>
            <p>{blocker.workaround}</p>
            <div>
              <strong>{blocker.owner}</strong>
              <ul className="compact-list">
                <li>Release requirement: {blocker.releaseRequirement}</li>
                <li>Proof route: {blocker.proofRoute}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
