import Link from "next/link";
import { getServiceDeliverySummary } from "../lib/serviceDelivery";

export const metadata = {
  title: "SCRIMED Service Delivery Workbench",
  description:
    "SCRIMED service delivery workbench for scoped work orders, acceptance criteria, buyer handoffs, delivery artifacts, margin protections, and healthcare authority gates."
};

export default function ServiceDeliveryPage() {
  const summary = getServiceDeliverySummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/offerings">Offerings</Link>
        <p className="eyebrow">Service delivery workbench</p>
        <h1>SCRIMED turns packaged offers into scoped work orders buyers can fund, review, and accept.</h1>
        <p className="hero-text">
          This workbench converts product and service packages into delivery phases, work-order
          templates, acceptance criteria, artifacts, buyer handoffs, margin protections, and retained
          healthcare approval gates.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>
            Download delivery brief
          </a>
          <a className="secondary-action" href={summary.apiRoute}>
            Inspect API
          </a>
          <Link className="secondary-action" href="/client-onboarding">
            Start onboarding
          </Link>
          <Link className="secondary-action" href="/pilot">
            Request scoped intake
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Service delivery summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Delivery offers</span>
          <strong>{summary.deliveryOfferCount}</strong>
        </article>
        <article>
          <span>Phases</span>
          <strong>{summary.phaseCount}</strong>
        </article>
        <article>
          <span>Work orders</span>
          <strong>{summary.workOrderTemplateCount}</strong>
        </article>
        <article>
          <span>Artifacts</span>
          <strong>{summary.artifactCount}</strong>
        </article>
        <article>
          <span>Activation gates</span>
          <strong>{summary.activationGateCount}</strong>
        </article>
        <article>
          <span>Package bindings</span>
          <strong>{summary.packageBindingCount}</strong>
        </article>
        <article>
          <span>Live activation plans</span>
          <strong>{summary.liveActivationPlanCount}</strong>
        </article>
        <article>
          <span>Hard stops</span>
          <strong>{summary.hardStopCount}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Service delivery boundary">
        <div>
          <p className="eyebrow">Delivery rule</p>
          <h2>Every service starts with scope, acceptance criteria, proof route, and retained boundary.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {Object.entries(summary.authority).map(([key, value], index) => (
            <div className="layer-row" key={key}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{key}: {value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Service delivery offers">
        <div className="section-heading">
          <p className="eyebrow">Delivery offers</p>
          <h2>Each offer now has kickoff inputs, deliverables, acceptance criteria, margin rules, and stops.</h2>
        </div>
        {summary.serviceDeliveryOffers.map((offer) => (
          <article className="module-row" key={offer.slug}>
            <div>
              <span>{offer.status}</span>
              <h2>{offer.name}</h2>
            </div>
            <p>{offer.buyerPromise}</p>
            <div>
              <strong>{offer.serviceOwner}</strong>
              <ul className="compact-list">
                <li>Window: {offer.deliveryWindow}</li>
                <li>Inputs: {offer.kickoffInputs.join(", ")}</li>
                <li>Acceptance: {offer.acceptanceCriteria.join(", ")}</li>
                <li>Margin: {offer.marginProtection.join(", ")}</li>
                <li>{offer.retainedBoundary}</li>
              </ul>
              <div className="form-actions">
                <Link className="module-link" href={`/pilot?offer=${offer.portfolioOfferSlug}`}>
                  Scope this service
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Delivery phases">
        <div className="section-heading">
          <p className="eyebrow">Delivery phases</p>
          <h2>Delivery is repeatable from qualification through handoff without drifting into unsupported commitments.</h2>
        </div>
        <div className="principle-grid">
          {summary.serviceDeliveryPhases.map((phase) => (
            <article key={phase.phase}>
              <span>{phase.status}</span>
              <h3>{phase.phase}</h3>
              <p>{phase.purpose}</p>
              <ul className="compact-list">
                <li>Owner: {phase.owner}</li>
                <li>Exit: {phase.exitCriteria.join(", ")}</li>
                <li>Hard stop: {phase.hardStop}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Work order templates">
        <div className="section-heading">
          <p className="eyebrow">Work orders</p>
          <h2>Work orders make service execution concrete enough to assign, audit, and accept.</h2>
        </div>
        {summary.serviceDeliveryWorkOrderTemplates.map((template) => (
          <article className="module-row" key={template.slug}>
            <div>
              <span>{template.status}</span>
              <h2>{template.title}</h2>
            </div>
            <p>{template.tasks.join(" ")}</p>
            <div>
              <strong>{template.outputArtifact}</strong>
              <ul className="compact-list">
                <li>Owner: {template.owner}</li>
                <li>Acceptance: {template.acceptanceCriteria.join(", ")}</li>
                <li>Hard stops: {template.hardStops.join(", ")}</li>
                <li>Proof: {template.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Activation gates">
        <div className="section-heading">
          <p className="eyebrow">Activation gates</p>
          <h2>Service delivery fails closed before PHI, clinical action, contracts, unsupported SLAs, or production connectors.</h2>
        </div>
        {summary.serviceDeliveryActivationGates.map((gate) => (
          <article className="module-row" key={gate.gate}>
            <div>
              <span>{gate.status}</span>
              <h2>{gate.gate}</h2>
            </div>
            <p>{gate.trigger}</p>
            <div>
              <strong>{gate.passCondition}</strong>
              <ul className="compact-list">
                <li>Owner: {gate.owner}</li>
                <li>Fail closed: {gate.failClosedAction}</li>
                <li>{gate.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Delivery artifacts">
        <div className="section-heading">
          <p className="eyebrow">Artifacts</p>
          <h2>Every service leaves behind reviewable evidence, not informal process memory.</h2>
        </div>
        <div className="principle-grid">
          {summary.serviceDeliveryArtifacts.map((artifact) => (
            <article key={artifact.slug}>
              <span>{artifact.owner}</span>
              <h3>{artifact.artifact}</h3>
              <p>{artifact.purpose}</p>
              <ul className="compact-list">
                <li>Fields: {artifact.requiredFields.join(", ")}</li>
                <li>Release: {artifact.releaseRule}</li>
                <li>{artifact.retainedBoundary}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Package bindings">
        <div className="section-heading">
          <p className="eyebrow">Package bindings</p>
          <h2>Packages stay profitable because handoffs, templates, and boundaries are attached up front.</h2>
        </div>
        {summary.serviceDeliveryPackageBindings.map((binding) => (
          <article className="module-row" key={binding.packageSlug}>
            <div>
              <span>{binding.deliveryLane}</span>
              <h2>{binding.packageName}</h2>
            </div>
            <p>{binding.buyerHandoff}</p>
            <div>
              <strong>{binding.marginRule}</strong>
              <ul className="compact-list">
                <li>Templates: {binding.workOrderTemplates.join(", ")}</li>
                <li>{binding.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Live service activation matrix">
        <div className="section-heading">
          <p className="eyebrow">Live Service Activation Matrix</p>
          <h2>Every service has a safe deployment posture before SCRIMED discusses go-live, revenue, or support.</h2>
        </div>
        {summary.serviceDeliveryLiveActivationMatrix.map((plan) => (
          <article className="module-row" key={plan.slug}>
            <div>
              <span>{plan.activationStatus}</span>
              <h2>{plan.offerName}</h2>
            </div>
            <p>{plan.nextSafeGoLiveStep}</p>
            <div>
              <strong>{plan.deploymentPosture}</strong>
              <ul className="compact-list">
                <li>Sales readiness: {plan.salesReadinessScore}</li>
                <li>Delivery readiness: {plan.deliveryReadinessScore}</li>
                <li>Revenue readiness: {plan.revenueReadinessScore}</li>
                <li>Support readiness: {plan.supportReadinessScore}</li>
                <li>Required before live: {plan.requiredBeforeLive.join("; ")}</li>
                <li>Safe launch motion: {plan.safeLaunchMotion}</li>
                <li>Revenue motion: {plan.revenueMotion}</li>
                <li>Support motion: {plan.supportMotion}</li>
                <li>Blocked before go-live: {plan.blockedBeforeGoLive.join("; ")}</li>
                <li>Proof routes: {plan.proofRoutes.join(", ")}</li>
                <li>Production authority: {String(plan.productionAuthority)}</li>
                <li>Human review required: {String(plan.humanReviewRequired)}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
