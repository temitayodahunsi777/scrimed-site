import Link from "next/link";
import { getScrimedMarketExecutionSummary } from "../lib/scrimedMarketExecution";

export const metadata = {
  title: "SCRIMED Market Execution Engine",
  description:
    "Clean-room SCRIMED market execution engine for competitor-informed sales, revenue, proof, privacy, public relations, and investor-readiness actions."
};

export default function ScrimedMarketExecutionPage() {
  const summary = getScrimedMarketExecutionSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/competitive-intelligence">
          Competitive Intelligence
        </Link>
        <p className="eyebrow">SCRIMED Market Execution Engine</p>
        <h1>Turn clean-room competitor research into sales action, proof, trust, and investor confidence.</h1>
        <p className="hero-text">{summary.boundary}</p>
        <div className="hero-actions" aria-label="SCRIMED Market Execution actions">
          <Link href={summary.apiRoute}>Inspect API</Link>
          <Link href={summary.briefRoute}>Download Brief</Link>
          <Link href="/scrimed-enterprise-acceleration">Enterprise Acceleration</Link>
          <Link href="/scrimed-guided-execution">Guided Execution</Link>
          <Link href="/pilot-demo-commercial-readiness">Demo to Pilot</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED Market Execution scorecard">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Market freshness</span>
          <strong>{summary.scorecard.marketSignalFreshness}</strong>
        </article>
        <article>
          <span>Clean-room</span>
          <strong>{summary.scorecard.cleanRoomDiscipline}</strong>
        </article>
        <article>
          <span>Buyer conversion</span>
          <strong>{summary.scorecard.buyerConversionReadiness}</strong>
        </article>
        <article>
          <span>Revenue activation</span>
          <strong>{summary.scorecard.revenueActivationReadiness}</strong>
        </article>
        <article>
          <span>Investor narrative</span>
          <strong>{summary.scorecard.investorNarrativeReadiness}</strong>
        </article>
        <article>
          <span>Privacy trust</span>
          <strong>{summary.scorecard.privacyTrustReadiness}</strong>
        </article>
        <article>
          <span>Production</span>
          <strong>{String(summary.scorecard.productionReadiness)}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="SCRIMED Market Execution operating doctrine">
        <div>
          <p className="eyebrow">Clean-Room Doctrine</p>
          <h2>Public patterns enter SCRIMED only as original strategy, proof, and governance actions.</h2>
          <p className="section-copy">{summary.competitiveBoundary}</p>
        </div>
        <div>
          <p>{summary.recommendedNextBuildStep}</p>
          <p>
            Production readiness remains false. Every market action remains synthetic/business-metadata only and requires
            human review before sensitive sales, legal, clinical, payer, public, or investor use.
          </p>
        </div>
      </section>

      <section className="table-section" aria-label="Market execution lanes">
        <div className="section-heading">
          <p className="eyebrow">Execution Lanes</p>
          <h2>Each competitor-informed insight becomes a SCRIMED-owned product system, proof artifact, sales motion, and trust control.</h2>
        </div>
        {summary.lanes.map((lane) => (
          <article className="module-row" key={lane.slug}>
            <div>
              <span>{lane.priority}</span>
              <h2>{lane.slug}</h2>
            </div>
            <p>{lane.sourcePattern}</p>
            <div>
              <strong>{lane.targetAudience}</strong>
              <ul className="compact-list">
                <li>Stage: {lane.stage}</li>
                <li>Product system: {lane.productSystem}</li>
                <li>Sales motion: {lane.salesMotion}</li>
                <li>Revenue lever: {lane.revenueLever}</li>
                <li>Investor narrative: {lane.investorNarrative}</li>
                <li>Privacy/legal control: {lane.privacyLegalControl}</li>
                <li>Public relations: {lane.publicRelationsPosition}</li>
                <li>Proof artifact: {lane.proofArtifact}</li>
                <li>Implementation sprint: {lane.implementationSprint}</li>
                <li>Human review: {String(lane.humanReviewRequired)}</li>
                <li>Audit hash: {lane.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Market execution risk controls">
        <div className="section-heading">
          <p className="eyebrow">Risk Controls</p>
          <h2>SCRIMED can move aggressively in the market without copying, overclaiming, or crossing clinical boundaries.</h2>
        </div>
        {summary.riskControls.map((control) => (
          <article className="module-row" key={control.id}>
            <div>
              <span>{control.owner}</span>
              <h2>{control.id}</h2>
            </div>
            <p>{control.control}</p>
            <div>
              <strong>{control.enforcement}</strong>
              <ul className="compact-list">
                <li>Reason: {control.reason}</li>
                <li>Owner: {control.owner}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Market execution blocked actions">
        <div className="section-heading">
          <p className="eyebrow">Hard Stops</p>
          <h2>These boundaries preserve SCRIMED&apos;s current safety, legal, privacy, and diligence posture.</h2>
        </div>
        {summary.blockedActions.map((action) => (
          <article className="module-row" key={action}>
            <div>
              <span>blocked</span>
              <h2>{action}</h2>
            </div>
            <p>Human review and qualified external approval are required before any related production authority can be considered.</p>
            <div>
              <strong>Production readiness: {String(summary.productionReadiness)}</strong>
              <ul className="compact-list">
                <li>No-PHI confirmed: {String(summary.noPhiConfirmed)}</li>
                <li>Human review required: {String(summary.humanReviewRequired)}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
