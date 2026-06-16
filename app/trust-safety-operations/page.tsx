import Link from "next/link";
import { getTrustSafetyOperationsSummary } from "../lib/trustSafetyOperations";

export const metadata = {
  title: "SCRIMED Trust & Safety Operations",
  description:
    "24/7 trust, safety, copyright, legal, security, monitoring, auditing, fixing, and continuous improvement operating model for SCRIMED."
};

export default function TrustSafetyOperationsPage() {
  const summary = getTrustSafetyOperationsSummary();

  return (
    <main>
      <section className="page-hero trust-hero">
        <Link className="back-link" href="/trust-center">Trust Center</Link>
        <p className="eyebrow">Trust & Safety Operations</p>
        <h1>SCRIMED agents must monitor, audit, fix, improve, and escalate around the clock.</h1>
        <p className="hero-text">{summary.boundary}</p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/claims">Claims Register</Link>
          <Link className="secondary-action" href="/audit">Audit Layer</Link>
          <Link className="secondary-action" href="/observability">Observability</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Trust and safety operations summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Agents</span>
          <strong>{summary.agentCount}</strong>
        </article>
        <article>
          <span>Controls</span>
          <strong>{summary.controlCount}</strong>
        </article>
        <article>
          <span>Channels</span>
          <strong>{summary.channelCount}</strong>
        </article>
        <article>
          <span>Active controls</span>
          <strong>{summary.activeControls}</strong>
        </article>
        <article>
          <span>Watch required</span>
          <strong>{summary.watchRequired}</strong>
        </article>
        <article>
          <span>Production gated</span>
          <strong>{summary.productionGated}</strong>
        </article>
        <article>
          <span>Loop stages</span>
          <strong>{summary.loopStageCount}</strong>
        </article>
        <article>
          <span>Incidents</span>
          <strong>{summary.incidentCount}</strong>
        </article>
        <article>
          <span>Open incidents</span>
          <strong>{summary.openIncidentCount}</strong>
        </article>
        <article>
          <span>Contained</span>
          <strong>{summary.containedIncidentCount}</strong>
        </article>
        <article>
          <span>Legal-hold watch</span>
          <strong>{summary.legalHoldWatchCount}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Operating posture</p>
          <h2>24/7 is the operating design; production managed coverage still requires staffing and external readiness.</h2>
          <p className="section-copy">{summary.operatingPosture}</p>
        </div>
        <div className="layer-list">
          {summary.continuousImprovementLoops.map((loop, index) => (
            <div className="layer-row" key={loop.stage}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{loop.stage}: {loop.action}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Trust safety incident queue">
        <div className="section-heading">
          <p className="eyebrow">Incident queue</p>
          <h2>Trust, safety, copyright, legal, security, and improvement signals become owned incidents.</h2>
          <p className="section-copy">
            These records are no-PHI product-control incidents for synthetic evaluations and enterprise readiness. Regulated
            production incidents still require customer-approved storage, counsel, privacy, security, and notification workflow.
          </p>
        </div>
        {summary.incidents.map((incident) => (
          <article className="module-row" key={incident.id}>
            <div>
              <span>{incident.severity} / {incident.status}</span>
              <h2>{incident.title}</h2>
            </div>
            <p>{incident.buyerImpact}</p>
            <div>
              <a className="module-link" href={incident.reportRoute}>
                Download incident report
              </a>
              <ul className="compact-list">
                <li>Owner: {incident.owner}</li>
                <li>Agent: {incident.accountableAgent}</li>
                <li>Containment: {incident.containmentAction}</li>
                <li>Legal hold: {incident.legalHoldStatus}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Trust safety severity SLA">
        <div className="section-heading">
          <p className="eyebrow">Severity SLA</p>
          <h2>Each severity level has a response target, containment target, and reviewer set.</h2>
        </div>
        {summary.incidentSlas.map((sla) => (
          <article className="module-row" key={sla.severity}>
            <div>
              <span>{sla.severity}</span>
              <h2>{sla.responseTarget}</h2>
            </div>
            <p>{sla.containmentTarget}</p>
            <div>
              <strong>{sla.executiveEscalation}</strong>
              <ul className="compact-list">
                <li>Reviewers: {sla.requiredReviewers.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Trust and safety agents">
        <div className="section-heading">
          <p className="eyebrow">Trust agents</p>
          <h2>Specialized agents watch for security, safety, legal, copyright, claims, and workflow risk.</h2>
        </div>
        {summary.agents.map((agent) => (
          <article className="module-row" key={agent.name}>
            <div>
              <span>{agent.status}</span>
              <h2>{agent.name}</h2>
            </div>
            <p>{agent.mission}</p>
            <div>
              <strong>{agent.monitoringCadence}</strong>
              <ul className="compact-list">
                <li>Watches: {agent.watches.join(", ")}</li>
                <li>Escalates: {agent.escalationTriggers.join(", ")}</li>
                <li>Blocks: {agent.blockedActions.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Trust and safety controls">
        <div className="section-heading">
          <p className="eyebrow">Protection controls</p>
          <h2>Copyright, security, safety, legal, evidence, and agent controls stay visible before scale.</h2>
        </div>
        {summary.controls.map((control) => (
          <article className="module-row" key={control.name}>
            <div>
              <span>{control.status}</span>
              <h2>{control.name}</h2>
            </div>
            <p>{control.purpose}</p>
            <div>
              <strong>Owner: {control.owner}</strong>
              <ul className="compact-list">
                <li>{control.requiredNextStep}</li>
                <li>Evidence: {control.evidence.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Trust and safety monitoring channels">
        <div className="section-heading">
          <p className="eyebrow">Monitoring channels</p>
          <h2>Every signal has a source, escalation path, and containment expectation.</h2>
        </div>
        {summary.channels.map((channel) => (
          <article className="module-row" key={channel.name}>
            <div>
              <span>{channel.status}</span>
              <h2>{channel.name}</h2>
            </div>
            <p>{channel.source}</p>
            <div>
              <strong>{channel.signal}</strong>
              <ul className="compact-list">
                <li>{channel.escalation}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Trust safety known limitations">
        <div className="section-heading">
          <p className="eyebrow">Limitations</p>
          <h2>Known gaps stay visible until they are resolved, replaced, or governed by a better process.</h2>
        </div>
        <article className="module-row">
          <div>
            <span>resolved</span>
            <h2>Resolved limitations</h2>
          </div>
          <p>Recent trust-ops limitations that now have a product-control path.</p>
          <ul className="compact-list">
            {summary.resolvedLimitations.map((item) => (
              <li key={item.limitation}>{item.limitation} {item.resolution}</li>
            ))}
          </ul>
        </article>
        <article className="module-row">
          <div>
            <span>remaining</span>
            <h2>Remaining production gates</h2>
          </div>
          <p>These are intentionally not bypassed because they protect buyers, patients, SCRIMED, and future enterprise scale.</p>
          <ul className="compact-list">
            {summary.remainingLimitations.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
