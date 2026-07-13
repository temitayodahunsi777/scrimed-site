import Link from "next/link";
import { getScrimedOperatingCommandCenterSummary } from "../lib/scrimedOperatingCommandCenter";

export const metadata = {
  title: "SCRIMED Operating Command Center",
  description:
    "Synthetic-only SCRIMED operating command center for systems, agents, infrastructure, workflows, services, products, UI, and interface execution."
};

export default function ScrimedOperatingCommandPage() {
  const summary = getScrimedOperatingCommandCenterSummary();
  const p0Lanes = summary.lanes.filter((lane) => lane.priority === "P0");

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/scrimed-build-roadmap">
          Build Roadmap
        </Link>
        <p className="eyebrow">SCRIMED Operating Command Center</p>
        <h1>One execution surface for upgrading SCRIMED systems, agents, infrastructure, workflows, services, products, and UI.</h1>
        <p className="hero-text">
          This command center converts SCRIMED strategy into owner-bound operating lanes with proof routes,
          measurable KPIs, review gates, interface impact, infrastructure impact, and retained safety boundaries.
        </p>
        <div className="hero-actions" aria-label="SCRIMED Operating Command actions">
          <Link href="/api/scrimed-operating-command">Inspect Command API</Link>
          <Link href="/api/scrimed-operating-command/brief">Download Brief</Link>
          <Link href="/scrimed-intelligence-platform">Intelligence Platform</Link>
          <Link href="/scrimed-trustops">TrustOps</Link>
          <Link href="/production-architecture">Architecture</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED Operating Command summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Lanes</span>
          <strong>{summary.laneCount}</strong>
        </article>
        <article>
          <span>P0 lanes</span>
          <strong>{summary.p0LaneCount}</strong>
        </article>
        <article>
          <span>Review gated</span>
          <strong>{summary.highControlLaneCount}</strong>
        </article>
        <article>
          <span>Evidence packets</span>
          <strong>{summary.evidencePacketCount}</strong>
        </article>
        <article>
          <span>Protected packets</span>
          <strong>{summary.protectedOperatorEvidencePacketCount}</strong>
        </article>
        <article>
          <span>Boundary packets</span>
          <strong>{summary.boundaryReleaseEvidencePacketCount}</strong>
        </article>
        <article>
          <span>Synthetic complete</span>
          <strong>{summary.syntheticCompleteEvidencePacketCount}</strong>
        </article>
        <article>
          <span>Cadence</span>
          <strong>{summary.cadence.length}</strong>
        </article>
        <article>
          <span>Validation</span>
          <strong>{summary.validation.status}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="SCRIMED Operating Command boundary">
        <div>
          <p className="eyebrow">GO / NO-GO</p>
          <h2>SCRIMED can plan, prioritize, and verify operating work; protected execution remains gated.</h2>
        </div>
        <div>
          <p>{summary.boundary}</p>
          <p>{summary.recommendedNextBuildStep}</p>
        </div>
      </section>

      <section className="table-section" aria-label="SCRIMED operating evidence packets">
        <div className="section-heading">
          <p className="eyebrow">Evidence Packets</p>
          <h2>Each operating lane has a packet that keeps proof state, missing evidence, AAL2, boundary release, and blocked escalation visible.</h2>
          <p>
            These packets are read-only planning evidence. They do not mutate records, submit claims, contact patients,
            approve connectors, or grant production authority.
          </p>
        </div>
        {summary.evidencePackets.map((packet) => (
          <article className="module-row" key={packet.packetId}>
            <div>
              <span>{packet.releaseStage}</span>
              <h2>{packet.packetId}</h2>
            </div>
            <p>{packet.nextReviewAction}</p>
            <div>
              <strong>{packet.evidenceState}</strong>
              <ul className="compact-list">
                <li>Lane: {packet.laneId}</li>
                <li>Missing evidence: {packet.missingEvidence.length ? packet.missingEvidence.join(", ") : "none"}</li>
                <li>AAL2 required: {packet.aal2Required ? "yes" : "no"}</li>
                <li>Boundary release required: {packet.boundaryReleaseRequired ? "yes" : "no"}</li>
                <li>Protected operator required: {packet.protectedOperatorRequired ? "yes" : "no"}</li>
                <li>Packet hash: {packet.packetHash}</li>
              </ul>
            </div>
            <div>
              <strong>Blocked escalations</strong>
              <ul className="compact-list">
                {packet.blockedEscalations.map((blocked) => (
                  <li key={`${packet.packetId}-${blocked}`}>{blocked}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="P0 operating lanes">
        <div className="section-heading">
          <p className="eyebrow">P0 Operating Lanes</p>
          <h2>Highest-leverage work is tied to owner, gates, KPIs, proof routes, and blocked actions.</h2>
        </div>
        {p0Lanes.map((lane) => (
          <article className="module-row" key={lane.id}>
            <div>
              <span>{lane.status}</span>
              <h2>{lane.title}</h2>
            </div>
            <p>{lane.nextSafeAction}</p>
            <div>
              <strong>{lane.owner}</strong>
              <ul className="compact-list">
                <li>Domain: {lane.domain}</li>
                <li>Mode: {lane.safeAutomationMode}</li>
                <li>Human review required: {lane.humanReviewRequired ? "yes" : "no"}</li>
                <li>Audit: {lane.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="All SCRIMED operating lanes">
        <div className="section-heading">
          <p className="eyebrow">Execution Stack</p>
          <h2>Each lane describes the system upgrade, agent impact, workflow impact, infrastructure impact, and UI impact.</h2>
        </div>
        {summary.lanes.map((lane) => (
          <article className="module-row" key={lane.id}>
            <div>
              <span>{lane.priority}</span>
              <h2>{lane.id}</h2>
            </div>
            <p>{lane.currentCapability}</p>
            <div>
              <strong>{lane.domain}</strong>
              <ul className="compact-list">
                <li>Agent: {lane.agentImpact}</li>
                <li>Workflow: {lane.workflowImpact}</li>
                <li>Infrastructure: {lane.infrastructureImpact}</li>
                <li>Interface: {lane.interfaceImpact}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Operating lane proof and KPIs">
        <div className="section-heading">
          <p className="eyebrow">Proof + Metrics</p>
          <h2>Every lane keeps measurable KPIs and direct evidence routes in front of the operator.</h2>
        </div>
        {summary.lanes.map((lane) => (
          <article className="module-row" key={`${lane.id}-proof`}>
            <div>
              <span>{lane.safeAutomationMode}</span>
              <h2>{lane.title}</h2>
            </div>
            <p>{lane.noGoBoundary}</p>
            <div>
              <strong>Proof routes</strong>
              <ul className="compact-list">
                <li>{lane.proofRoutes.join(", ")}</li>
                <li>APIs: {lane.apiRoutes.join(", ")}</li>
                <li>Gates: {lane.requiredGates.join(", ")}</li>
                <li>Blocked: {lane.blockedActions.join(", ")}</li>
              </ul>
            </div>
            <div>
              <strong>KPIs</strong>
              <ul className="compact-list">
                {lane.kpis.map((kpi) => (
                  <li key={`${lane.id}-${kpi.metric}`}>
                    {kpi.metric}: {kpi.target} ({kpi.measurementMode})
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band principle-grid" aria-label="Operating cadence">
        {summary.cadence.map((item) => (
          <article key={item.cadence}>
            <span>{item.cadence}</span>
            <h3>{item.owner}</h3>
            <p>{item.reviewQuestion}</p>
            <ul className="compact-list">
              <li>Evidence: {item.requiredEvidence.join(", ")}</li>
              <li>Fail closed: {item.failClosedTrigger}</li>
            </ul>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED Operating Command validation">
        <div className="section-heading">
          <p className="eyebrow">Validation</p>
          <h2>Contract checks keep this console measurable, review-gated, and boundary-preserving.</h2>
        </div>
        {summary.validation.checks.map((check) => (
          <article className="module-row" key={check.check}>
            <div>
              <span>{check.passed ? "pass" : "fail"}</span>
              <h2>{check.check}</h2>
            </div>
            <p>{check.detail}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
