import Link from "next/link";
import { getSalesDealRoomSummary, salesDealRoomPublicSummary } from "../lib/salesDealRoom";

export const metadata = {
  title: "SCRIMED Pilot Deal Room",
  description:
    "SCRIMED Pilot Deal Room organizes the buyer path from public product proof to governed synthetic pilot, protected buyer room, and audited commercial packet."
};

export default function PilotDealRoomPage() {
  const summary = getSalesDealRoomSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">SCRIMED Pilot Deal Room</p>
        <h1>Turn buyer interest into a governed, auditable enterprise pilot path.</h1>
        <p className="hero-text">{summary.executiveThesis}</p>
        <div className="hero-actions" aria-label="Pilot deal room actions">
          <Link className="primary-action" href="/pilot">
            Request Pilot
          </Link>
          <Link className="secondary-action" href="/competitive-edge">
            View Competitive Edge
          </Link>
          <Link className="secondary-action" href="/pricing">
            Review Pricing
          </Link>
          <Link className="secondary-action" href="/pilot-workspace/access">
            Open Protected Workspace
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Pilot deal room summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Proof stack</span>
          <strong>{summary.proofStackStatus}</strong>
        </article>
        <article>
          <span>Buyer room</span>
          <strong>{summary.buyerRoomProofStackStatus}</strong>
        </article>
        <article>
          <span>Packet audit</span>
          <strong>{summary.buyerRoomPacketProofStackStatus}</strong>
        </article>
        <article>
          <span>Workspace provisioning</span>
          <strong>{summary.opportunityWorkspaceProvisioningProofStackStatus}</strong>
        </article>
        <article>
          <span>Workspace fallback</span>
          <strong>{summary.defaultWorkspaceSlug}</strong>
        </article>
        <article>
          <span>Protected API</span>
          <strong>{summary.protectedPacketRoute}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="Buyer journey">
        <div className="section-heading">
          <p className="eyebrow">Buyer journey</p>
          <h2>One organized path from public interest to paid synthetic pilot.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        {summary.stages.map((stage) => (
          <article className="module-row" key={stage.stage}>
            <div>
              <span>{stage.stage}</span>
              <h2>{stage.buyerQuestion}</h2>
            </div>
            <p>{stage.scrimedProof}</p>
            <div>
              <Link className="module-link" href={stage.primaryRoute}>
                Open proof route
              </Link>
              <p>{stage.gatedBoundary}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band split-band" aria-label="Site organization">
        <div>
          <p className="eyebrow">Site organization</p>
          <h2>SCRIMED now separates brand, product, protected workspace, and sales operations clearly.</h2>
          <p className="section-copy">
            Buyers do not need Vercel. They move from the official website into SCRIMED&apos;s product app when they want proof,
            demos, pricing, intake, or a protected pilot workspace.
          </p>
        </div>
        <div className="layer-list">
          {summary.siteLanes.map((lane, index) => (
            <div className="layer-row" key={lane.lane}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{lane.lane}: {lane.purpose}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Competitive edge for deal rooms">
        <div className="section-heading">
          <p className="eyebrow">Competitive edge</p>
          <h2>Broadcast SCRIMED as healthcare intelligence infrastructure, not another point solution.</h2>
        </div>
        {summary.competitiveEdges.map((edge) => (
          <article className="module-row" key={edge.pillar}>
            <div>
              <span>edge</span>
              <h2>{edge.pillar}</h2>
            </div>
            <p>{edge.claim}</p>
            <div>
              <Link className="module-link" href={edge.route}>
                Inspect proof
              </Link>
              <p>{edge.blockedClaim}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Sales motion">
        <div className="section-heading">
          <p className="eyebrow">Sales motion</p>
          <h2>Every public page should move a qualified buyer toward a governed paid evaluation.</h2>
        </div>
        {salesDealRoomPublicSummary.motions.map((motion) => (
          <article className="module-row" key={`${motion.phase}-${motion.name}`}>
            <div>
              <span>{motion.phase}</span>
              <h2>{motion.name}</h2>
            </div>
            <p>{motion.nextCommitment}</p>
            <strong>{motion.route}</strong>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Known limitations and workarounds">
        <div className="section-heading">
          <p className="eyebrow">Known limitations</p>
          <h2>Limitations are made visible, routed, and gated instead of hidden.</h2>
        </div>
        {summary.limitations.map((item) => (
          <article className="module-row" key={item.limitation}>
            <div>
              <span>workaround active</span>
              <h2>{item.limitation}</h2>
            </div>
            <p>{item.resolution}</p>
            <strong>{item.productionGate}</strong>
          </article>
        ))}
      </section>
    </main>
  );
}
