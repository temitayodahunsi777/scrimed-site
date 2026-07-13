import Link from "next/link";
import { getPlatformPowerSummary } from "../lib/platformPowerOperations";

export const metadata = {
  title: "SCRIMED Platform Power Operations",
  description:
    "SCRIMED API, UI, and AI platform-power control plane for enterprise API contracts, operator UI, AI routing readiness, agent approval, evaluation, and safety boundaries."
};

export default function PlatformPowerPage() {
  const summary = getPlatformPowerSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">API, UI, and AI platform power</p>
        <h1>SCRIMED upgrades its platform core without pretending live AI authority is already approved.</h1>
        <p className="hero-text">
          This lane turns trillion-dollar-company ambition into owned controls: API contracts,
          tenant-safe auth posture, rate limits, operator-grade UI, AI model-routing readiness,
          agent approvals, evaluation loops, evidence retrieval, and platform cost discipline.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>
            Download platform brief
          </a>
          <Link className="secondary-action" href="/agents">
            Review AgentOS
          </Link>
          <Link className="secondary-action" href="/trust-os">
            Run TrustOS
          </Link>
          <Link className="secondary-action" href="/service-reliability">
            Review Reliability
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Platform power summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Pillars</span>
          <strong>{summary.pillarCount}</strong>
        </article>
        <article>
          <span>Controls</span>
          <strong>{summary.controlCount}</strong>
        </article>
        <article>
          <span>Workstreams</span>
          <strong>{summary.workstreamCount}</strong>
        </article>
        <article>
          <span>Cadences</span>
          <strong>{summary.cadenceCount}</strong>
        </article>
        <article>
          <span>Bottlenecks</span>
          <strong>{summary.bottleneckCount}</strong>
        </article>
        <article>
          <span>Open bottlenecks</span>
          <strong>{summary.openBottleneckCount}</strong>
        </article>
        <article>
          <span>Proof routes</span>
          <strong>{summary.proofRouteCount}</strong>
        </article>
        <article>
          <span>Hard stops</span>
          <strong>{summary.hardStopCount}</strong>
        </article>
        <article>
          <span>Blocked claims</span>
          <strong>{summary.blockedClaimCount}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Platform power operating boundary">
        <div>
          <p className="eyebrow">Operating rule</p>
          <h2>API, UI, and AI upgrades stay powerful, observable, and bounded until external authority exists.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.recommendedOperatingPath.map((step, index) => (
            <div className="layer-row" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Platform power pillars">
        <div className="section-heading">
          <p className="eyebrow">Pillars</p>
          <h2>API, UI, AI, evidence, agent, cost, and review power now share one owner-backed operating map.</h2>
        </div>
        {summary.pillars.map((pillar) => (
          <article className="module-row" key={pillar.slug}>
            <div>
              <span>{pillar.status}</span>
              <h2>{pillar.name}</h2>
            </div>
            <p>{pillar.ambition}</p>
            <div>
              <strong>{pillar.owner}</strong>
              <ul className="compact-list">
                <li>Control: {pillar.operatingControl}</li>
                <li>Evidence: {pillar.evidence.join(", ")}</li>
                <li>Proof routes: {pillar.proofRoutes.join(", ")}</li>
                <li>Boundary: {pillar.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Platform power controls">
        <div className="section-heading">
          <p className="eyebrow">Controls</p>
          <h2>Every platform-power claim needs evidence, hard stops, and a human or external gate where authority is missing.</h2>
        </div>
        {summary.controls.map((control) => (
          <article className="module-row" key={control.slug}>
            <div>
              <span>{control.status}</span>
              <h2>{control.control}</h2>
            </div>
            <p>{control.purpose}</p>
            <div>
              <strong>{control.owner}</strong>
              <ul className="compact-list">
                <li>Required evidence: {control.requiredEvidence.join(", ")}</li>
                <li>Hard stops: {control.hardStops.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Platform power workstreams">
        <div className="section-heading">
          <p className="eyebrow">Workstreams</p>
          <h2>Execution moves across API productization, UI command, AI orchestration, evidence, evals, margin, and external review.</h2>
        </div>
        <div className="principle-grid">
          {summary.workstreams.map((workstream) => (
            <article key={workstream.slug}>
              <span>{workstream.owner}</span>
              <h3>{workstream.name}</h3>
              <p>{workstream.objective}</p>
              <ul className="compact-list">
                <li>Sequence: {workstream.sequence.join(", ")}</li>
                <li>Proof routes: {workstream.proofRoutes.join(", ")}</li>
                <li>{workstream.retainedBoundary}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Platform power cadences and bottlenecks">
        <div className="section-heading">
          <p className="eyebrow">Cadences and bottlenecks</p>
          <h2>Review loops keep API drift, UI friction, AI risk, accessibility gaps, cost pressure, and scale claims under control.</h2>
        </div>
        {summary.cadences.map((cadence) => (
          <article className="module-row" key={cadence.cadence}>
            <div>
              <span>cadence</span>
              <h2>{cadence.cadence}</h2>
            </div>
            <p>{cadence.decisionOutput}</p>
            <div>
              <strong>{cadence.owner}</strong>
              <ul className="compact-list">
                <li>Signals: {cadence.reviewedSignals.join(", ")}</li>
                <li>Hard stops: {cadence.hardStops.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
        {summary.bottlenecks.map((bottleneck) => (
          <article className="module-row" key={bottleneck.slug}>
            <div>
              <span>{bottleneck.status}</span>
              <h2>{bottleneck.name}</h2>
            </div>
            <p>{bottleneck.impact}</p>
            <div>
              <strong>{bottleneck.owner}</strong>
              <ul className="compact-list">
                <li>Workaround: {bottleneck.workaround}</li>
                <li>Graduation gate: {bottleneck.graduationGate}</li>
                <li>Proof routes: {bottleneck.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
