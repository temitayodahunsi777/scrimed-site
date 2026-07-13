import Link from "next/link";
import { getLaunchReadinessSummary } from "../lib/launchReadinessOperations";

export const metadata = {
  title: "SCRIMED Launch Readiness",
  description:
    "SCRIMED launch structure, sandbox DNS workaround, strict production-domain gates, service readiness, product readiness, and launch hard stops."
};

export default function LaunchReadinessPage() {
  const summary = getLaunchReadinessSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/hub">Hub</Link>
        <p className="eyebrow">Launch readiness</p>
        <h1>SCRIMED now separates sandbox DNS limits from real launch go/no-go proof.</h1>
        <p className="hero-text">
          This control plane keeps launch structure, product readiness, service readiness, strict branded-domain verification, DNS fallback evidence, protected AAL2 proof, and authority boundaries in one operator-reviewed lane.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Launch Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/release-continuity">Release Continuity</Link>
          <Link className="secondary-action" href="/operations">Operations</Link>
          <Link className="secondary-action" href="/limitations-workarounds">Workarounds</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Launch readiness summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Launch tracks</span>
          <strong>{summary.launchTrackCount}</strong>
        </article>
        <article>
          <span>Ready</span>
          <strong>{summary.readyTrackCount}</strong>
        </article>
        <article>
          <span>Contained</span>
          <strong>{summary.containedTrackCount}</strong>
        </article>
        <article>
          <span>Operator gates</span>
          <strong>{summary.operatorRequiredTrackCount}</strong>
        </article>
        <article>
          <span>External review</span>
          <strong>{summary.externalReviewRequiredTrackCount}</strong>
        </article>
        <article>
          <span>DNS controls</span>
          <strong>{summary.dnsControlCount}</strong>
        </article>
        <article>
          <span>Service paths</span>
          <strong>{summary.servicePathCount}</strong>
        </article>
        <article>
          <span>Launch risks</span>
          <strong>{summary.riskCount}</strong>
        </article>
        <article>
          <span>Proof routes</span>
          <strong>{summary.proofRouteCount}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Launch boundary and domains">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>Fallback proof is useful; branded-domain proof is mandatory.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>01</span>
            <strong>Primary: {summary.primaryDomain}</strong>
          </div>
          <div className="layer-row">
            <span>02</span>
            <strong>Fallback: {summary.fallbackDomain}</strong>
          </div>
          <div className="layer-row">
            <span>03</span>
            <strong>Launch approval: {summary.authority.launchApprovalAuthority}</strong>
          </div>
          <div className="layer-row">
            <span>04</span>
            <strong>Fallback authority: {summary.authority.fallbackAuthority}</strong>
          </div>
        </div>
      </section>

      <section className="table-section" aria-label="DNS and sandbox controls">
        <div className="section-heading">
          <p className="eyebrow">DNS and sandbox controls</p>
          <h2>Restricted DNS failures are classified, while the branded launch gate stays strict.</h2>
        </div>
        {summary.launchDnsControls.map((control) => (
          <article className="module-row" key={control.name}>
            <div>
              <span>{control.status}</span>
              <h2>{control.name}</h2>
            </div>
            <p>{control.issue}</p>
            <div>
              <strong>{control.launchRule}</strong>
              <ul className="compact-list">
                <li>Detection: {control.detection}</li>
                <li>Command: {control.command}</li>
                <li>Pass condition: {control.passCondition}</li>
                <li>Workaround: {control.workaround}</li>
                <li>{control.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Launch readiness tracks">
        <div className="section-heading">
          <p className="eyebrow">Launch tracks</p>
          <h2>Every launch surface now has an owner, gate, workaround, and hard stop.</h2>
          <p className="section-copy">{summary.nextLaunchMove}</p>
        </div>
        {summary.launchReadinessTracks.map((track) => (
          <article className="module-row" key={track.name}>
            <div>
              <span>{track.status}</span>
              <h2>{track.name}</h2>
            </div>
            <p>{track.launchQuestion}</p>
            <div>
              <strong>{track.owner}</strong>
              <ul className="compact-list">
                <li>Control: {track.control}</li>
                <li>Gate: {track.goNoGoGate}</li>
                <li>Workaround: {track.workaround}</li>
                <li>Hard stop: {track.hardStop}</li>
                <li>Proof: {track.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Launch service paths">
        <div className="section-heading">
          <p className="eyebrow">Service paths</p>
          <h2>Launch is treated as product, service, diligence, proposal, and authority operations.</h2>
        </div>
        {summary.launchServicePaths.map((path) => (
          <article className="module-row" key={path.phase}>
            <div>
              <span>service</span>
              <h2>{path.phase}</h2>
            </div>
            <p>{path.requiredProof}</p>
            <div>
              <strong>{path.owner}</strong>
              <ul className="compact-list">
                <li>{path.servicePosture}</li>
                <li>Customer output: {path.customerVisibleOutput}</li>
                <li>Fallback: {path.internalFallback}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Launch risks">
        <div className="section-heading">
          <p className="eyebrow">Launch risks</p>
          <h2>Known launch risks are contained before they become launch promises.</h2>
        </div>
        {summary.launchRisks.map((risk) => (
          <article className="module-row" key={risk.risk}>
            <div>
              <span>{risk.severity}</span>
              <h2>{risk.risk}</h2>
            </div>
            <p>{risk.containment}</p>
            <div>
              <strong>{risk.owner}</strong>
              <ul className="compact-list">
                <li>Gate: {risk.graduationGate}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
