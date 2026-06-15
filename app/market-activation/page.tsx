import Link from "next/link";
import { getMarketActivationSummary } from "../lib/marketActivation";

export const metadata = {
  title: "SCRIMED Market Activation",
  description:
    "Revenue streams, target audiences, FaithCore messaging, communications, PR, advertising, and claims-safe market activation for SCRIMED."
};

export default function MarketActivationPage() {
  const summary = getMarketActivationSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">Market Activation</p>
        <h1>SCRIMED market activation connects revenue, audience, message, FaithCore, communications, and advertising to trust controls.</h1>
        <p className="hero-text">
          This surface keeps growth focused: enterprise revenue streams, high-value healthcare buyers, approved proof points, public-relations gates, controlled advertising, and opt-in FaithCore positioning.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/pricing">Pricing</Link>
          <Link className="secondary-action" href="/faithcore">FaithCore</Link>
          <Link className="secondary-action" href="/claims">Claims Register</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Market activation summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Revenue</span>
          <strong>{summary.revenueStreamCount}</strong>
        </article>
        <article>
          <span>Audiences</span>
          <strong>{summary.targetAudienceCount}</strong>
        </article>
        <article>
          <span>Comms</span>
          <strong>{summary.communicationsChannelCount}</strong>
        </article>
        <article>
          <span>Ad gates</span>
          <strong>{summary.advertisingCampaignCount}</strong>
        </article>
        <article>
          <span>FaithCore</span>
          <strong>{summary.faithCoreProgramCount}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Message house</p>
          <h2>{summary.messageHouse.coreMessage}</h2>
          <p className="section-copy">{summary.messageHouse.positioning}</p>
        </div>
        <div className="layer-list">
          {summary.messageHouse.approvedProofPoints.map((point, index) => (
            <div className="layer-row" key={point}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{point}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Revenue streams">
        <div className="section-heading">
          <p className="eyebrow">Revenue streams</p>
          <h2>SCRIMED monetizes trust, workflow ownership, deployment readiness, and measurable enterprise proof.</h2>
        </div>
        {summary.revenueStreams.map((stream) => (
          <article className="module-row" key={stream.name}>
            <div>
              <span>{stream.status}</span>
              <h2>{stream.name}</h2>
            </div>
            <p>{stream.buyer}. {stream.offer}</p>
            <div>
              <Link className="module-link" href={stream.proofRoute}>
                {stream.priceSignal}
              </Link>
              <ul className="compact-list">
                <li>{stream.conversionPath}</li>
                <li>Owner: {stream.owner}</li>
                <li>{stream.guardrails.join(" ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Target audiences">
        <div className="section-heading">
          <p className="eyebrow">Target audiences</p>
          <h2>Every audience gets a specific trigger, pain, offer, proof path, and disqualifier.</h2>
        </div>
        {summary.targetAudiences.map((audience) => (
          <article className="module-row" key={audience.segment}>
            <div>
              <span>{audience.priority}</span>
              <h2>{audience.segment}</h2>
            </div>
            <p>{audience.pain}</p>
            <div>
              <strong>{audience.message}</strong>
              <ul className="compact-list">
                <li>Trigger: {audience.buyerTrigger}</li>
                <li>Offer: {audience.primaryOffer}</li>
                <li>Disqualifiers: {audience.disqualifiers.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="FaithCore market programs">
        <div className="section-heading">
          <p className="eyebrow">FaithCore</p>
          <h2>FaithCore strengthens SCRIMED&apos;s whole-person trust message without crossing clinical or spiritual authority boundaries.</h2>
        </div>
        {summary.faithCoreMarketPrograms.map((program) => (
          <article className="module-row" key={program.name}>
            <div>
              <span>{program.status}</span>
              <h2>{program.name}</h2>
            </div>
            <p>{program.audience}. {program.message}</p>
            <div>
              <Link className="module-link" href={program.route}>
                {program.revenueUse}
              </Link>
              <ul className="compact-list">
                <li>{program.useCase}</li>
                <li>{program.boundaries.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Communications and advertising">
        <div className="section-heading">
          <p className="eyebrow">Communications and advertising</p>
          <h2>Public momentum is gated by claims control, intake safety, and approval workflows.</h2>
        </div>
        {summary.communicationsPlaybook.map((playbook) => (
          <article className="module-row" key={playbook.channel}>
            <div>
              <span>{playbook.status}</span>
              <h2>{playbook.channel}</h2>
            </div>
            <p>{playbook.audience}</p>
            <div>
              <Link className="module-link" href={playbook.proofAsset}>
                {playbook.message}
              </Link>
              <ul className="compact-list">
                <li>{playbook.approvalGate}</li>
              </ul>
            </div>
          </article>
        ))}
        {summary.advertisingCampaigns.map((campaign) => (
          <article className="module-row" key={campaign.channel}>
            <div>
              <span>{campaign.status}</span>
              <h2>{campaign.channel}</h2>
            </div>
            <p>{campaign.targetAudience}. {campaign.objective}</p>
            <div>
              <Link className="module-link" href={campaign.landingRoute}>
                {campaign.conversionEvent}
              </Link>
              <ul className="compact-list">
                <li>{campaign.budgetPosture}</li>
                <li>{campaign.claimControl}</li>
                <li>Blocked: {campaign.blockedClaims.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
