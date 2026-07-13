import Link from "next/link";
import { getInvestorAudienceReadinessSummary } from "../lib/investorAudienceReadiness";

export const metadata = {
  title: "SCRIMED Investor and Audience Readiness",
  description:
    "SCRIMED weakness relief, competitive edge, sellable value, and audience-specific readiness packets for investors, clinics, buyers, and partners."
};

export default function InvestorAudienceReadinessPage() {
  const summary = getInvestorAudienceReadinessSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/hub">Hub</Link>
        <p className="eyebrow">Investor and audience readiness</p>
        <h1>SCRIMED now turns weaknesses into owned relief tracks and investor-ready audience packets.</h1>
        <p className="hero-text">
          This control plane packages angel, corporate strategic, private investor, faith-based clinic, health system, payer, public-sector, clinician, global partner, and transformation-sponsor paths while preserving no-securities, no-solicitation, no-tax-advice, no-PHI, and no-live-care boundaries.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Audience Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/capital-vitality">Capital Vitality</Link>
          <Link className="secondary-action" href="/growth-engine">Growth Engine</Link>
          <Link className="secondary-action" href="/enterprise-business-ops">Business Ops</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Investor audience readiness summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Weakness tracks</span>
          <strong>{summary.weaknessTrackCount}</strong>
        </article>
        <article>
          <span>High severity</span>
          <strong>{summary.highWeaknessCount}</strong>
        </article>
        <article>
          <span>Edge signals</span>
          <strong>{summary.competitiveEdgeSignalCount}</strong>
        </article>
        <article>
          <span>Audience packets</span>
          <strong>{summary.audiencePacketCount}</strong>
        </article>
        <article>
          <span>Ready now</span>
          <strong>{summary.readyNowAudienceCount}</strong>
        </article>
        <article>
          <span>Package next</span>
          <strong>{summary.packageNextAudienceCount}</strong>
        </article>
        <article>
          <span>External review</span>
          <strong>{summary.externalReviewAudienceCount}</strong>
        </article>
        <article>
          <span>Readiness gates</span>
          <strong>{summary.readinessGateCount}</strong>
        </article>
        <article>
          <span>Blocked claims</span>
          <strong>{summary.blockedClaimCount}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Investor audience boundary">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>Investment and audience preparation stays powerful because it does not overstep authority.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>01</span>
            <strong>{summary.authority.securitiesAuthority}</strong>
          </div>
          <div className="layer-row">
            <span>02</span>
            <strong>{summary.authority.solicitationAuthority}</strong>
          </div>
          <div className="layer-row">
            <span>03</span>
            <strong>{summary.authority.taxAuthority}</strong>
          </div>
          <div className="layer-row">
            <span>04</span>
            <strong>{summary.authority.phiAuthority}</strong>
          </div>
        </div>
      </section>

      <section className="table-section" aria-label="Weakness relief tracks">
        <div className="section-heading">
          <p className="eyebrow">Weakness relief</p>
          <h2>Each weakness now has an owner, workaround, proof route, success metric, and graduation gate.</h2>
          <p className="section-copy">{summary.nextInvestorMove}</p>
        </div>
        {summary.weaknessReliefTracks.map((track) => (
          <article className="module-row" key={track.weakness}>
            <div>
              <span>{track.severity}</span>
              <h2>{track.weakness}</h2>
            </div>
            <p>{track.currentExposure}</p>
            <div>
              <strong>{track.reliefSystem}</strong>
              <ul className="compact-list">
                <li>Owner: {track.owner}</li>
                <li>Workaround: {track.workaround}</li>
                <li>Metric: {track.successMetric}</li>
                <li>Gate: {track.graduationGate}</li>
                <li>Proof: {track.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Competitive edge signals">
        <div className="section-heading">
          <p className="eyebrow">Competitive edge</p>
          <h2>The sellable story is healthcare workflow infrastructure with proof, governance, and audience packaging.</h2>
        </div>
        {summary.competitiveEdgeSignals.map((signal) => (
          <article className="module-row" key={signal.signal}>
            <div>
              <span>edge</span>
              <h2>{signal.signal}</h2>
            </div>
            <p>{signal.pitchLine}</p>
            <div>
              <strong>{signal.sellableValue}</strong>
              <ul className="compact-list">
                <li>{signal.uniqueness}</li>
                <li>{signal.defensibility}</li>
                <li>{signal.retainedBoundary}</li>
                <li>Proof: {signal.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Investor and buyer audience packets">
        <div className="section-heading">
          <p className="eyebrow">Audience packets</p>
          <h2>Each target audience gets a distinct value story, diligence packet, next move, and blocked-claim list.</h2>
        </div>
        {summary.investorAudiencePackets.map((packet) => (
          <article className="module-row" key={packet.audience}>
            <div>
              <span>{packet.readinessStatus}</span>
              <h2>{packet.audience}</h2>
            </div>
            <p>{packet.primaryQuestion}</p>
            <div>
              <strong>{packet.sellableValue}</strong>
              <ul className="compact-list">
                <li>Pitch: {packet.pitchAngle}</li>
                <li>Packet: {packet.diligencePacket.join(", ")}</li>
                <li>Next: {packet.nextMove}</li>
                <li>Review: {packet.requiredReview}</li>
                <li>Blocked: {packet.blockedClaims.join(", ")}</li>
                <li>Proof: {packet.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Investor readiness gates">
        <div className="section-heading">
          <p className="eyebrow">Readiness gates</p>
          <h2>Official and internal guardrails keep fundraising, faith-clinic, and diligence work reviewable.</h2>
        </div>
        {summary.investorReadinessGates.map((gate) => (
          <article className="module-row" key={gate.gate}>
            <div>
              <span>{gate.owner}</span>
              <h2>{gate.gate}</h2>
            </div>
            <p>{gate.readinessUse}</p>
            <div>
              <strong>{gate.source}</strong>
              <ul className="compact-list">
                <li>Source: {gate.sourceUrl}</li>
                <li>Hard stop: {gate.hardStop}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
