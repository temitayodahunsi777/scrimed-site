import Link from "next/link";
import { getScrimedEnterpriseAccelerationSummary } from "../lib/scrimedEnterpriseAcceleration";

export const metadata = {
  title: "SCRIMED Enterprise Acceleration",
  description:
    "Synthetic-only SCRIMED Enterprise Acceleration Command for systems, agents, UI, performance, validity, investor confidence, sales demos, revenue motions, and production-readiness boundaries."
};

export default function ScrimedEnterpriseAccelerationPage() {
  const summary = getScrimedEnterpriseAccelerationSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/scrimed-operating-command">
          Operating Command
        </Link>
        <p className="eyebrow">SCRIMED Enterprise Acceleration</p>
        <h1>Turn systems, agents, proof, demos, revenue, and investor confidence into one operating command.</h1>
        <p className="hero-text">{summary.boundary}</p>
        <div className="hero-actions" aria-label="SCRIMED Enterprise Acceleration actions">
          <Link href={summary.apiRoute}>Inspect API</Link>
          <Link href={summary.briefRoute}>Download Brief</Link>
          <Link href="/investor-readiness">Investor Command</Link>
          <Link href="/pilot-demo-commercial-readiness">Demo to Pilot</Link>
          <Link href="/offerings">Offerings</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED Enterprise Acceleration scorecard">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Investor confidence</span>
          <strong>{summary.scorecard.investorConfidence}</strong>
        </article>
        <article>
          <span>Buyer draw</span>
          <strong>{summary.scorecard.buyerDraw}</strong>
        </article>
        <article>
          <span>Sales readiness</span>
          <strong>{summary.scorecard.salesReadiness}</strong>
        </article>
        <article>
          <span>System vitality</span>
          <strong>{summary.scorecard.systemVitality}</strong>
        </article>
        <article>
          <span>Production</span>
          <strong>{summary.scorecard.productionReadiness}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="SCRIMED Enterprise Acceleration boundary">
        <div>
          <p className="eyebrow">Strategic Posture</p>
          <h2>{summary.scorecard.summary}</h2>
        </div>
        <div>
          <p>{summary.recommendedNextBuildStep}</p>
          <p>
            Production readiness remains false in code. SCRIMED can use these assets for buyer diligence, investor
            readiness, no-PHI demos, and scoped pilot preparation only.
          </p>
        </div>
      </section>

      <section className="table-section" aria-label="Enterprise acceleration lanes">
        <div className="section-heading">
          <p className="eyebrow">Acceleration Lanes</p>
          <h2>Every operating improvement is tied to an owner, asset, outcome, and retained safety boundary.</h2>
        </div>
        {summary.lanes.map((lane) => (
          <article className="module-row" key={lane.id}>
            <div>
              <span>{lane.status}</span>
              <h2>{lane.title}</h2>
            </div>
            <p>{lane.objective}</p>
            <div>
              <strong>{lane.measurableOutcome}</strong>
              <ul className="compact-list">
                <li>Asset: {lane.currentBuildAsset}</li>
                <li>Next: {lane.nextUpgrade}</li>
                <li>Owner: {lane.owner}</li>
                <li>Hash: {lane.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Pitch and demo assets">
        <div className="section-heading">
          <p className="eyebrow">Pitches + Demos</p>
          <h2>Investor and sales narratives are evidence-backed, concise, and boundary-safe.</h2>
        </div>
        {summary.pitchAssets.map((asset) => (
          <article className="module-row" key={asset.id}>
            <div>
              <span>{asset.assetType}</span>
              <h2>{asset.headline}</h2>
            </div>
            <p>{asset.purpose}</p>
            <div>
              <strong>{asset.callToAction}</strong>
              <ul className="compact-list">
                <li>Audience: {asset.audience}</li>
                <li>Proof: {asset.proofPoints.join(", ")}</li>
                <li>Hard stops: {asset.hardStops.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Revenue motions">
        <div className="section-heading">
          <p className="eyebrow">Revenue Motions</p>
          <h2>Each sellable motion has a target, value driver, sales trigger, and margin lever.</h2>
        </div>
        {summary.revenueMotions.map((motion) => (
          <article className="module-row" key={motion.id}>
            <div>
              <span>revenue</span>
              <h2>{motion.offer}</h2>
            </div>
            <p>{motion.valueDriver}</p>
            <div>
              <strong>{motion.targetAudience}</strong>
              <ul className="compact-list">
                <li>Trigger: {motion.salesTrigger}</li>
                <li>Margin lever: {motion.marginLever}</li>
                <li>Boundary: {motion.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
