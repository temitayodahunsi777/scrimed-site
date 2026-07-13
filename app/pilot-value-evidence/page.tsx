import Link from "next/link";
import { getPilotValueEvidenceSummary } from "../lib/pilotValueEvidence";

export const metadata = {
  title: "SCRIMED Pilot Value Evidence",
  description:
    "Synthetic-only pilot value evidence packets for buyer-ready metrics, acceptance criteria, reviewer checkpoints, and claim controls."
};

export default function PilotValueEvidencePage() {
  const summary = getPilotValueEvidenceSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">Pilot Value Evidence</p>
        <h1>SCRIMED packages buyer-ready value proof without overclaiming authority.</h1>
        <p className="hero-text">
          This surface converts synthetic value metrics into pilot packets with acceptance criteria,
          reviewer checkpoints, blocked claims, and audit hashes so buyers can understand measurable
          pilot potential without receiving ROI, revenue, clinical, production, or customer-activation claims.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>
            Download Evidence Brief
          </a>
          <a className="secondary-action" href={summary.apiRoute}>
            Inspect API
          </a>
          <Link className="secondary-action" href="/healthcare-value-realization">
            Value Realization
          </Link>
          <Link className="secondary-action" href="/pilot-demo-commercial-readiness">
            Pilot Readiness
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Pilot value evidence summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Artifacts</span>
          <strong>{summary.artifactCount}</strong>
        </article>
        <article>
          <span>Packets</span>
          <strong>{summary.packetCount}</strong>
        </article>
        <article>
          <span>Checkpoints</span>
          <strong>{summary.reviewerCheckpointCount}</strong>
        </article>
        <article>
          <span>Claim controls</span>
          <strong>{summary.claimControlCount}</strong>
        </article>
        <article>
          <span>Evidence score</span>
          <strong>{summary.averageEvidenceScore}</strong>
        </article>
        <article>
          <span>Proof routes</span>
          <strong>{summary.proofRouteCount}</strong>
        </article>
        <article>
          <span>Review gates</span>
          <strong>{summary.humanReviewRequiredCount}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Pilot value evidence boundary">
        <div>
          <p className="eyebrow">Distribution boundary</p>
          <h2>Evidence packets are buyer-ready, but still synthetic and review-gated.</h2>
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

      <section className="table-section" aria-label="Pilot evidence packets">
        <div className="section-heading">
          <p className="eyebrow">Evidence packets</p>
          <h2>Each packet has a buyer segment, pilot window, acceptance criteria, human review gate, and retained boundary.</h2>
          <p className="section-copy">{summary.nextBestMove}</p>
        </div>
        {summary.packets.map((packet) => (
          <article className="module-row" key={packet.id}>
            <div>
              <span>{packet.pilotWindow}</span>
              <h2>{packet.name}</h2>
            </div>
            <p>{packet.packetPurpose}</p>
            <div>
              <strong>{packet.buyerSegment}</strong>
              <ul className="compact-list">
                <li>Review gate: {packet.humanReviewGate}</li>
                <li>Commercial next step: {packet.commercialNextStep}</li>
                <li>Boundary: {packet.retainedBoundary}</li>
                <li>Artifacts: {packet.evidenceArtifacts.join(", ")}</li>
                <li>Audit: {packet.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Pilot evidence artifacts">
        <div className="section-heading">
          <p className="eyebrow">Evidence artifacts</p>
          <h2>Artifacts preserve baseline proxies, target evidence, measurement plans, and blocked claims.</h2>
        </div>
        {summary.topArtifacts.map((artifact) => (
          <article className="module-row" key={artifact.id}>
            <div>
              <span>{artifact.stage}</span>
              <h2>{artifact.title}</h2>
            </div>
            <p>{artifact.measurementPlan}</p>
            <div>
              <strong>{artifact.reviewerRole} - score {artifact.evidenceScore}</strong>
              <ul className="compact-list">
                <li>Baseline: {artifact.baselineProxy}</li>
                <li>Target: {artifact.targetEvidence}</li>
                <li>Allowed: {artifact.allowedUse}</li>
                <li>Blocked: {artifact.blockedClaims.join(", ")}</li>
                <li>Proof routes: {artifact.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Pilot value review and claim controls">
        <div className="section-heading">
          <p className="eyebrow">Claim controls</p>
          <h2>Reviewer checkpoints prevent sales, pilot, and investor packets from drifting into unsupported promises.</h2>
        </div>
        {summary.claimControls.map((control) => (
          <article className="module-row" key={control.claimRisk}>
            <div>
              <span>blocked phrase</span>
              <h2>{control.claimRisk}</h2>
            </div>
            <p>{control.blockedPhrase}</p>
            <div>
              <strong>{control.safeReplacement}</strong>
              <ul className="compact-list">
                <li>Required evidence: {control.requiredEvidence}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
