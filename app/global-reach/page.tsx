import Link from "next/link";
import { getGlobalPartnerLocalizationSummary } from "../lib/globalPartnerLocalization";

export const metadata = {
  title: "SCRIMED Global Reach",
  description:
    "Region, buyer, partner, procurement, deployment, and localization readiness for SCRIMED governed synthetic pilots and enterprise evaluations."
};

export default function GlobalReachPage() {
  const summary = getGlobalPartnerLocalizationSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">Global Reach</p>
        <h1>SCRIMED global reach turns region, buyer, partner, and procurement fit into a governed expansion path.</h1>
        <p className="hero-text">
          This layer organizes priority regions, buyer packs, partner channels, localization needs, procurement questions,
          competitive edge, and retained approval gates without implying legal, compliance, procurement, or clinical authorization.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/market-activation">Market Activation</Link>
          <Link className="secondary-action" href="/deployment-profiles">Deployment Profiles</Link>
          <Link className="secondary-action" href="/pilot-deal-room">Pilot Deal Room</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Global reach summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Regions</span>
          <strong>{summary.regionCount}</strong>
        </article>
        <article>
          <span>Launch regions</span>
          <strong>{summary.launchRegionCount}</strong>
        </article>
        <article>
          <span>Strategic regions</span>
          <strong>{summary.strategicRegionCount}</strong>
        </article>
        <article>
          <span>Buyer packs</span>
          <strong>{summary.buyerPackCount}</strong>
        </article>
        <article>
          <span>Partner channels</span>
          <strong>{summary.partnerChannelCount}</strong>
        </article>
        <article>
          <span>Boundaries</span>
          <strong>{summary.boundaryResolutionCount}</strong>
        </article>
        <article>
          <span>Edges</span>
          <strong>{summary.competitiveEdgeCount}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Operating boundary</p>
          <h2>Global expansion is controlled by proof, localization, and retained approval gates.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.activationSequence.map((step, index) => (
            <div className="layer-row" key={step.step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step.step}: {step.exitCriteria}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Regional focus">
        <div className="section-heading">
          <p className="eyebrow">Regions</p>
          <h2>Priority regions are mapped to buyer fit, deployment posture, procurement focus, and retained gates.</h2>
        </div>
        {summary.regions.map((region) => (
          <article className="module-row" key={region.slug}>
            <div>
              <span>{region.priority}</span>
              <h2>{region.region}</h2>
            </div>
            <p>{region.buyerFit} {region.deploymentThesis}</p>
            <div>
              <strong>{region.compliancePosture}</strong>
              <ul className="compact-list">
                <li>Procurement: {region.procurementFocus.join(", ")}</li>
                <li>Localization: {region.languageAndCulture.join(", ")}</li>
                <li>Partner motion: {region.partnerMotion}</li>
                <li>Retained gates: {region.retainedGates.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Buyer localization packs">
        <div className="section-heading">
          <p className="eyebrow">Buyer packs</p>
          <h2>Each audience gets a specific buying committee, trigger, offer, proof path, and disqualifier.</h2>
        </div>
        {summary.buyerPacks.map((pack) => (
          <article className="module-row" key={pack.key}>
            <div>
              <span>{pack.priority}</span>
              <h2>{pack.audience}</h2>
            </div>
            <p>{pack.localizedMessage}</p>
            <div>
              <Link className="module-link" href={pack.entryRoute}>
                {pack.recommendedOffer}
              </Link>
              <ul className="compact-list">
                <li>Committee: {pack.buyingCommittee.join(", ")}</li>
                <li>Trigger: {pack.trigger}</li>
                <li>Questions: {pack.procurementQuestions.join(" ")}</li>
                <li>Disqualifiers: {pack.disqualifiers.join(", ")}</li>
                <li>{pack.safeConversionPath}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Partner channels">
        <div className="section-heading">
          <p className="eyebrow">Partner channels</p>
          <h2>SCRIMED can expand through qualified partners without implying reseller, government, or production authority.</h2>
        </div>
        {summary.partnerChannels.map((channel) => (
          <article className="module-row" key={channel.name}>
            <div>
              <span>{channel.status}</span>
              <h2>{channel.name}</h2>
            </div>
            <p>{channel.idealPartner}</p>
            <div>
              <strong>{channel.valueExchange}</strong>
              <ul className="compact-list">
                <li>{channel.partnerType}</li>
                <li>{channel.activationPath}</li>
                <li>Blocked claims: {channel.blockedClaims.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Boundary resolution">
        <div className="section-heading">
          <p className="eyebrow">Boundary resolution</p>
          <h2>Known global expansion risks are contained with operating workarounds and retained graduation gates.</h2>
        </div>
        {summary.boundaryResolutions.map((resolution) => (
          <article className="module-row" key={resolution.boundary}>
            <div>
              <span>{resolution.status}</span>
              <h2>{resolution.boundary}</h2>
            </div>
            <p>{resolution.impact}</p>
            <div>
              <strong>{resolution.resolution}</strong>
              <ul className="compact-list">
                <li>Retained gate: {resolution.retainedGate}</li>
                <li>Owner: {resolution.owner}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Global competitive edge">
        <div className="section-heading">
          <p className="eyebrow">Competitive edge</p>
          <h2>Global reach compounds SCRIMED&apos;s infrastructure thesis without overclaiming current authority.</h2>
        </div>
        {summary.competitiveEdges.map((edge) => (
          <article className="module-row" key={edge.pillar}>
            <div>
              <span>edge</span>
              <h2>{edge.pillar}</h2>
            </div>
            <p>{edge.buyerSignal}</p>
            <div>
              <Link className="module-link" href={edge.proofRoute}>
                {edge.scrimedAdvantage}
              </Link>
              <p>{edge.blockedClaim}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
