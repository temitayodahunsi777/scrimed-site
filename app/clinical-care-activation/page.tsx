import Link from "next/link";
import { getClinicalCareActivationSummary } from "../lib/clinicalCareActivation";

export const metadata = {
  title: "SCRIMED Clinical Care Activation Readiness",
  description:
    "Review SCRIMED's gated path from governed synthetic healthcare AI pilots toward regulated, human-reviewed clinical-care activation readiness."
};

export default function ClinicalCareActivationPage() {
  const summary = getClinicalCareActivationSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">SCRIMED Clinical Care Activation</p>
        <h1>Clinical-care execution is a regulated activation path, not a switch.</h1>
        <p className="hero-text">
          SCRIMED can prepare enterprise buyers for governed clinical deployment through readiness gates, Trust Cards,
          human-review controls, evidence packets, and staged pilot planning. Live clinical care remains blocked until
          customer, legal, privacy, security, regulatory, clinician-governance, connector, monitoring, and go-live
          approvals are complete.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>
            Download Readiness Brief
          </a>
          <a className="secondary-action" href={summary.apiRoute}>
            Inspect Activation API
          </a>
          <Link className="secondary-action" href="/pilot-deal-room">
            Open Pilot Deal Room
          </Link>
          <Link className="secondary-action" href="/trust-os">
            Review TrustOS
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Clinical care activation summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Care authority</span>
          <strong>{summary.careExecutionAuthority}</strong>
        </article>
        <article>
          <span>Readiness score</span>
          <strong>{summary.readinessScore}%</strong>
        </article>
        <article>
          <span>Hard gates</span>
          <strong>{summary.gateCount}</strong>
        </article>
        <article>
          <span>Foundation ready</span>
          <strong>{summary.foundationReadyGateCount}</strong>
        </article>
        <article>
          <span>External review</span>
          <strong>{summary.externalReviewGateCount}</strong>
        </article>
        <article>
          <span>Customer specific</span>
          <strong>{summary.customerSpecificGateCount}</strong>
        </article>
        <article>
          <span>Blocked</span>
          <strong>{summary.blockedGateCount}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Hard boundary</p>
          <h2>SCRIMED is not authorized for live clinical care from the current product boundary.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.blockedCapabilities.map((capability, index) => (
            <div className="layer-row" key={capability}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{capability}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Clinical care activation capabilities">
        <div className="section-heading">
          <p className="eyebrow">Capability boundary</p>
          <h2>Current capabilities support readiness, not unsupervised patient-impacting execution.</h2>
        </div>
        {summary.capabilities.map((capability) => (
          <article className="module-row" key={capability.name}>
            <div>
              <span>{capability.status}</span>
              <h2>{capability.name}</h2>
            </div>
            <p>{capability.boundary}</p>
            <Link className="module-link" href={capability.proofRoute}>
              Inspect proof route
            </Link>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Clinical care hard gates">
        <div className="section-heading">
          <p className="eyebrow">Clinical hard gates</p>
          <h2>Every live-care capability stays gated until evidence, owners, and approvals are complete.</h2>
          <p className="section-copy">
            Foundation-ready means SCRIMED has useful product evidence today. It does not mean the gate is fully cleared
            for production clinical care.
          </p>
        </div>
        {summary.gates.map((gate) => (
          <article className="module-row" key={gate.id}>
            <div>
              <span>{gate.category} / {gate.status}</span>
              <h2>{gate.name}</h2>
            </div>
            <p>{gate.evidence}</p>
            <div>
              <strong>{gate.requiredBefore}</strong>
              <ul className="compact-list">
                <li>Owner: {gate.owner}</li>
                <li>Safe workaround: {gate.safeWorkaround}</li>
                <li>Blocked: {gate.blockedCapabilities.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Clinical care activation path">
        <div className="section-heading">
          <p className="eyebrow">Activation path</p>
          <h2>Move from synthetic evaluation to supervised care only through staged evidence.</h2>
        </div>
        {summary.activationPhases.map((phase) => (
          <article className="module-row" key={phase.phase}>
            <div>
              <span>{phase.status}</span>
              <h2>{phase.phase}</h2>
            </div>
            <p>{phase.objective}</p>
            <div>
              <strong>{phase.exitCriteria}</strong>
              <ul className="compact-list">
                {phase.requiredEvidence.map((evidence) => (
                  <li key={evidence}>{evidence}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Clinical care Trust Cards">
        <div className="section-heading">
          <p className="eyebrow">Trust Cards</p>
          <h2>Clinical activation outputs carry confidence, risk, evidence, reviewer state, and audit events.</h2>
        </div>
        <div className="principle-grid">
          {summary.trustCards.map((card) => (
            <article key={card.outputClass}>
              <span>{card.riskScore}</span>
              <h3>{card.outputClass}</h3>
              <p>{card.humanReviewTrigger}</p>
              <ul className="compact-list">
                <li>Confidence: {card.confidence}</li>
                <li>Reviewer: {card.reviewerStatus}</li>
                <li>Audit: {card.auditEvent}</li>
                <li>Validated: {card.validationTimestamp}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Clinical care activation source authorities">
        <div className="section-heading">
          <p className="eyebrow">Source authorities</p>
          <h2>Activation planning is anchored to external authority and SCRIMED internal controls.</h2>
        </div>
        {summary.sourceAuthorities.map((source) => (
          <article className="module-row" key={source.name}>
            <div>
              <span>{source.sourceType}</span>
              <h2>{source.name}</h2>
            </div>
            <p>{source.implication}</p>
            {source.url ? (
              <a className="module-link" href={source.url}>
                Source current as of {source.currentAsOf}
              </a>
            ) : (
              <strong>Current as of {source.currentAsOf}</strong>
            )}
          </article>
        ))}
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Operator actions</p>
          <h2>Best next move: sell readiness and synthetic pilots while clinical activation gates mature.</h2>
          <p className="section-copy">
            This protects SCRIMED legally, clinically, and commercially while building toward real customer production
            deployments.
          </p>
        </div>
        <div className="layer-list">
          {summary.nextOperatorActions.map((action, index) => (
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
