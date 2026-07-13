import Link from "next/link";
import { getGlobalCertificationReadinessSummary } from "../lib/globalCertificationReadiness";

export const metadata = {
  title: "SCRIMED Global Certification Readiness",
  description:
    "SCRIMED global approval and certification readiness for HIPAA/BAA, FDA CDS/SaMD, SOC 2, HITRUST, ISO, EU AI Act, GDPR, NHS DTAC, MHRA, Australia Essential Eight, and regional buyer gates."
};

export default function GlobalCertificationReadinessPage() {
  const summary = getGlobalCertificationReadinessSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/approvals-readiness">Approvals Readiness</Link>
        <p className="eyebrow">Global Approval and Certification Readiness</p>
        <h1>SCRIMED prepares for domestic and global approvals without claiming them early.</h1>
        <p className="hero-text">
          This control plane translates current U.S., EU, UK, Australian, and global assurance
          expectations into SCRIMED-owned tracks, evidence gates, regional buyer packs, proof routes,
          and blocked claims before production healthcare operation.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Certification Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/approvals-readiness">Approvals Ladder</Link>
          <Link className="secondary-action" href="/global-reach">Global Reach</Link>
          <Link className="secondary-action" href="/deployment-profiles">Deployment Profiles</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Global certification readiness summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Sources</span>
          <strong>{summary.sourceCount}</strong>
        </article>
        <article>
          <span>Tracks</span>
          <strong>{summary.trackCount}</strong>
        </article>
        <article>
          <span>Gates</span>
          <strong>{summary.gateCount}</strong>
        </article>
        <article>
          <span>Regions</span>
          <strong>{summary.regionalPackCount}</strong>
        </article>
        <article>
          <span>Roadmap</span>
          <strong>{summary.roadmapPhaseCount}</strong>
        </article>
        <article>
          <span>Blocked claims</span>
          <strong>{summary.blockedClaimCount}</strong>
        </article>
        <article>
          <span>Evidence artifacts</span>
          <strong>{summary.requiredEvidenceCount}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Operating boundary</p>
          <h2>Prepare evidence now; claim approval only after qualified external review.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.roadmap.map((item, index) => (
            <div className="layer-row" key={item.phase}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.objective}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Global approval and certification tracks">
        <div className="section-heading">
          <p className="eyebrow">Tracks</p>
          <h2>Each future approval family has a route, owner, evidence packet, and blocked-claim list.</h2>
        </div>
        {summary.tracks.map((track) => (
          <article className="module-row" key={track.slug}>
            <div>
              <span>{track.jurisdiction}</span>
              <h2>{track.title}</h2>
            </div>
            <p>{track.operatingGoal}</p>
            <div>
              <strong>{track.nextAction}</strong>
              <ul className="compact-list">
                <li>Status: {track.status}</li>
                <li>Evidence: {track.requiredEvidence.join(", ")}</li>
                <li>Proof: {track.proofRoutes.join(", ")}</li>
                <li>Blocked: {track.blockedClaims.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Certification readiness gates">
        <div className="section-heading">
          <p className="eyebrow">Gates</p>
          <h2>SCRIMED cannot cross these lines until evidence, owners, and authority are complete.</h2>
        </div>
        {summary.gates.map((gate) => (
          <article className="module-row" key={gate.gate}>
            <div>
              <span>gate</span>
              <h2>{gate.gate}</h2>
            </div>
            <p>{gate.purpose}</p>
            <div>
              <strong>{gate.owner}</strong>
              <ul className="compact-list">
                <li>Required before: {gate.requiredBefore.join(", ")}</li>
                <li>Evidence: {gate.evidenceArtifacts.join(", ")}</li>
                <li>Blocked: {gate.blockedUntilComplete.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Regional certification packs">
        <div className="section-heading">
          <p className="eyebrow">Regional packs</p>
          <h2>Domestic and global motion stays localized before production, procurement, or data claims expand.</h2>
        </div>
        {summary.regionalPacks.map((pack) => (
          <article className="module-row" key={pack.region}>
            <div>
              <span>{pack.priority}</span>
              <h2>{pack.region}</h2>
            </div>
            <p>{pack.safeNearTermMotion}</p>
            <div>
              <strong>{pack.requiredWorkstreams.join(", ")}</strong>
              <ul className="compact-list">
                <li>Buyer packet: {pack.buyerDiligencePacket.join(", ")}</li>
                <li>Hard stops: {pack.productionHardStops.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Source review">
        <div className="section-heading">
          <p className="eyebrow">Source review</p>
          <h2>Official requirements are reduced to SCRIMED implications and retained evidence work.</h2>
        </div>
        {summary.sources.map((source) => (
          <article className="module-row" key={source.name}>
            <div>
              <span>{source.jurisdiction}</span>
              <h2>{source.name}</h2>
            </div>
            <p>{source.requirementSignal}</p>
            <div>
              <strong>{source.scrimedImplication}</strong>
              <ul className="compact-list">
                <li>Type: {source.sourceType}</li>
                <li>Reviewed: {source.reviewedAt}</li>
                <li>
                  <a href={source.url}>Official source</a>
                </li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
