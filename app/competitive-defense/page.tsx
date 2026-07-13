import Link from "next/link";
import { getCompetitiveDefenseSummary } from "../lib/competitiveDefense";

export const metadata = {
  title: "SCRIMED Competitive Defense",
  description:
    "SCRIMED competitor counter-positioning, weakness relief, legal/privacy/cybersecurity controls, and infiltration-deterrence hardening."
};

export default function CompetitiveDefensePage() {
  const summary = getCompetitiveDefenseSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/competitive-intelligence">Competitive Intelligence</Link>
        <p className="eyebrow">Competitive Defense</p>
        <h1>SCRIMED turns competitor pressure into legal, privacy, cybersecurity, and product hardening.</h1>
        <p className="hero-text">
          This lane analyzes the healthcare AI companies buyers will compare us against, names the weakness each exposes, and converts the answer into original SCRIMED proof, no-copy boundaries, privacy gates, security controls, and infiltration-deterrence layers.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Defense Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/claims">Claims Register</Link>
          <Link className="secondary-action" href="/trust-center">Trust Center</Link>
          <Link className="secondary-action" href="/global-certification-readiness">Certification Readiness</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Competitive defense summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Threat profiles</span>
          <strong>{summary.competitorThreatProfileCount}</strong>
        </article>
        <article>
          <span>Strength tracks</span>
          <strong>{summary.strengthHardeningTrackCount}</strong>
        </article>
        <article>
          <span>Harden now</span>
          <strong>{summary.hardenNowCount}</strong>
        </article>
        <article>
          <span>Legal/privacy/cyber</span>
          <strong>{summary.legalPrivacyCyberControlCount}</strong>
        </article>
        <article>
          <span>Deterrence layers</span>
          <strong>{summary.infiltrationDeterrenceLayerCount}</strong>
        </article>
        <article>
          <span>Review gates</span>
          <strong>{summary.externalReviewGateCount}</strong>
        </article>
        <article>
          <span>Hard stops</span>
          <strong>{summary.hardStopCount}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Competitive defense boundary">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>No-copy, no-PHI, no-certification, no-false-parity.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {Object.entries(summary.noAuthority).map(([key, value], index) => (
            <div className="layer-row" key={key}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{key}: {value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Competitor threat profiles">
        <div className="section-heading">
          <p className="eyebrow">Biggest competitor pressure</p>
          <h2>Each competitor is translated into a SCRIMED counter-position and hardening move.</h2>
        </div>
        {summary.threatProfiles.map((profile) => (
          <article className="module-row" key={profile.competitor}>
            <div>
              <span>{profile.category}</span>
              <h2>{profile.competitor}</h2>
            </div>
            <p>{profile.marketStrength}</p>
            <div>
              <strong>{profile.counterPosition}</strong>
              <ul className="compact-list">
                <li>Weakness exposed: {profile.scrimedWeaknessExposed}</li>
                <li>Hardening: {profile.hardeningMove}</li>
                <li>Boundary: {profile.legalPrivacyCyberBoundary}</li>
                <li>Proof: {profile.proofRoute}</li>
              </ul>
              <a className="module-link" href={profile.officialSource}>Open official source</a>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Strength hardening tracks">
        <div className="section-heading">
          <p className="eyebrow">Strength hardening</p>
          <h2>SCRIMED strengths now have weakness relief, owners, proof routes, and retained boundaries.</h2>
        </div>
        {summary.strengthHardeningTracks.map((track) => (
          <article className="module-row" key={track.pillar}>
            <div>
              <span>{track.status}</span>
              <h2>{track.pillar}</h2>
            </div>
            <p>{track.existingStrength}</p>
            <div>
              <strong>{track.hardeningMove}</strong>
              <ul className="compact-list">
                <li>Weakness: {track.weaknessToRelieve}</li>
                <li>Owner: {track.owner}</li>
                <li>Proof: {track.proofRoute}</li>
                <li>{track.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Legal privacy and cybersecurity controls">
        <div className="section-heading">
          <p className="eyebrow">Legal, privacy, cyber</p>
          <h2>Legal protection, privacy discipline, and cybersecurity are treated as product controls.</h2>
        </div>
        {summary.legalPrivacyCyberControls.map((control) => (
          <article className="module-row" key={control.control}>
            <div>
              <span>{control.status}</span>
              <h2>{control.control}</h2>
            </div>
            <p>{control.riskReduced}</p>
            <div>
              <strong>{control.implementation}</strong>
              <ul className="compact-list">
                <li>Alignment: {control.frameworkAlignment.join(", ")}</li>
                <li>Deterrence: {control.deterrenceMechanism}</li>
                <li>Owner: {control.owner}</li>
                <li>Evidence: {control.evidenceRoute}</li>
                <li>{control.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Infiltration deterrence layers">
        <div className="section-heading">
          <p className="eyebrow">Infiltration deterrence</p>
          <h2>Likely attack paths are paired with prevention, detection, response, and hard stops.</h2>
        </div>
        {summary.infiltrationDeterrenceLayers.map((layer) => (
          <article className="module-row" key={layer.layer}>
            <div>
              <span>{layer.status}</span>
              <h2>{layer.layer}</h2>
            </div>
            <p>{layer.likelyAttackPath}</p>
            <div>
              <strong>{layer.hardStop}</strong>
              <ul className="compact-list">
                <li>Prevent: {layer.prevention}</li>
                <li>Detect: {layer.detection}</li>
                <li>Respond: {layer.response}</li>
                <li>Evidence: {layer.evidenceRoute}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="External review gates">
        <div className="section-heading">
          <p className="eyebrow">External review</p>
          <h2>Claims, privacy, security, and customer evidence cannot graduate without qualified review.</h2>
        </div>
        {summary.externalReviewGates.map((gate) => (
          <article className="module-row" key={gate.name}>
            <div>
              <span>{gate.status}</span>
              <h2>{gate.name}</h2>
            </div>
            <p>{gate.trigger}</p>
            <div>
              <strong>{gate.owner}</strong>
              <ul className="compact-list">
                <li>Output: {gate.output}</li>
                <li>Blocked: {gate.blockedUntilComplete.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band split-band" aria-label="Framework source alignment">
        <div>
          <p className="eyebrow">Framework alignment</p>
          <h2>{summary.nextHardeningMove}</h2>
        </div>
        <div className="layer-list">
          {summary.frameworkSourceAlignment.map((source, index) => (
            <div className="layer-row" key={source.name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{source.name}: {source.implication}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
