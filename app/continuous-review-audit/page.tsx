import Link from "next/link";
import { getContinuousReviewAuditSummary } from "../lib/continuousReviewAudit";

export const metadata = {
  title: "SCRIMED Continuous Review, Audit, and Innovation",
  description:
    "24/7 agent-assisted review, audit, error reduction, human escalation, and internal future research control plane for SCRIMED."
};

export default function ContinuousReviewAuditPage() {
  const summary = getContinuousReviewAuditSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/trust-safety-operations">Trust Safety Operations</Link>
        <p className="eyebrow">24/7 Continuous Review, Audit, and Innovation</p>
        <h1>SCRIMED reviews, audits, learns, and researches continuously without bypassing human authority.</h1>
        <p className="hero-text">
          {summary.boundary}
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Review Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/trust-safety-operations">TrustOps</Link>
          <Link className="secondary-action" href="/qa-evidence">QA Evidence</Link>
          <Link className="secondary-action" href="/source-intelligence">Source Intelligence</Link>
          <Link className="secondary-action" href="/global-certification-readiness">Global Certifications</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Continuous review and audit summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Agents</span>
          <strong>{summary.agentCount}</strong>
        </article>
        <article>
          <span>Loops</span>
          <strong>{summary.loopCount}</strong>
        </article>
        <article>
          <span>Controls</span>
          <strong>{summary.controlCount}</strong>
        </article>
        <article>
          <span>Innovation tracks</span>
          <strong>{summary.innovationTrackCount}</strong>
        </article>
        <article>
          <span>Research teams</span>
          <strong>{summary.internalResearchAssignmentCount}</strong>
        </article>
        <article>
          <span>Blocked claims</span>
          <strong>{summary.blockedClaimCount}</strong>
        </article>
        <article>
          <span>Sources</span>
          <strong>{summary.sourceCount}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Operating boundary</p>
          <h2>Continuous review improves accuracy without turning agents into regulators, clinicians, or unmanaged production operators.</h2>
          <p className="section-copy">
            The control plane is designed to catch stale facts, unsupported claims, source drift, security drift,
            regression risk, incident learnings, and future opportunities while retaining human review before
            public claims, production changes, live care, PHI, or certification language.
          </p>
        </div>
        <div className="layer-list">
          {summary.loops.map((loop, index) => (
            <div className="layer-row" key={loop.stage}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{loop.stage}: {loop.errorReductionMechanism}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Continuous review agents">
        <div className="section-heading">
          <p className="eyebrow">Review agents</p>
          <h2>Specialized agents watch accuracy, evidence, claims, security, QA, incidents, and future signals.</h2>
        </div>
        {summary.agents.map((agent) => (
          <article className="module-row" key={agent.slug}>
            <div>
              <span>{agent.status}</span>
              <h2>{agent.name}</h2>
            </div>
            <p>{agent.mission}</p>
            <div>
              <strong>{agent.cadence}</strong>
              <ul className="compact-list">
                <li>Watches: {agent.watches.join(", ")}</li>
                <li>Allowed: {agent.allowedActions.join(", ")}</li>
                <li>Escalates: {agent.escalationTriggers.join(", ")}</li>
                <li>Blocks: {agent.blockedActions.join(", ")}</li>
                <li>Evidence: {agent.evidenceRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Continuous audit controls">
        <div className="section-heading">
          <p className="eyebrow">Audit controls</p>
          <h2>Every high-risk loop has a human-owned hard stop and retained evidence requirement.</h2>
        </div>
        {summary.controls.map((control) => (
          <article className="module-row" key={control.control}>
            <div>
              <span>{control.status}</span>
              <h2>{control.control}</h2>
            </div>
            <p>{control.purpose}</p>
            <div>
              <strong>Owner: {control.owner}</strong>
              <ul className="compact-list">
                <li>Evidence: {control.requiredEvidence.join(", ")}</li>
                <li>Hard stops: {control.hardStops.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Internal innovation research tracks">
        <div className="section-heading">
          <p className="eyebrow">Internal innovation</p>
          <h2>Future-facing research is assigned internally first, including quantum-safe readiness.</h2>
          <p className="section-copy">
            Quantum remains an internal research lane focused on post-quantum cryptography readiness, vendor posture,
            key lifecycles, and claim guards. SCRIMED does not make public quantum capability or clinical-advantage claims.
          </p>
        </div>
        {summary.innovationTracks.map((track) => (
          <article className="module-row" key={track.slug}>
            <div>
              <span>{track.visibility}</span>
              <h2>{track.title}</h2>
            </div>
            <p>{track.researchQuestion}</p>
            <div>
              <strong>{track.owner}</strong>
              <ul className="compact-list">
                <li>Near-term work: {track.nearTermWork.join(", ")}</li>
                <li>Promotion gate: {track.promotionGate.join(", ")}</li>
                <li>Blocked: {track.blockedClaims.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Internal research assignments">
        <div className="section-heading">
          <p className="eyebrow">Research teams</p>
          <h2>Research assignments convert horizon signals into governed prototypes, metrics, and claim guards.</h2>
        </div>
        {summary.internalResearchAssignments.map((assignment) => (
          <article className="module-row" key={assignment.team}>
            <div>
              <span>{assignment.cadence}</span>
              <h2>{assignment.team}</h2>
            </div>
            <p>{assignment.focus}</p>
            <div>
              <strong>Outputs: {assignment.outputs.join(", ")}</strong>
              <ul className="compact-list">
                <li>Restrictions: {assignment.restrictions.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Source review">
        <div className="section-heading">
          <p className="eyebrow">Source review</p>
          <h2>Official frameworks and internal operating sources drive the review loop without creating approval claims.</h2>
        </div>
        {summary.sources.map((source) => (
          <article className="module-row" key={source.name}>
            <div>
              <span>{source.sourceType}</span>
              <h2>{source.name}</h2>
            </div>
            <p>{source.signal}</p>
            <div>
              <strong>{source.scrimedApplication}</strong>
              <ul className="compact-list">
                <li>Reviewed: {source.reviewedAt}</li>
                <li>
                  <a href={source.url}>Source</a>
                </li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
