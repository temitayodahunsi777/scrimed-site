import Link from "next/link";
import { getGlobalEnterpriseCommandSummary } from "../lib/globalEnterpriseCommand";

export const metadata = {
  title: "SCRIMED Global Enterprise Command",
  description:
    "International enterprise readiness, global sales, localization, interoperability, communication, and partner-readiness command surface for SCRIMED."
};

export default function GlobalEnterpriseCommandPage() {
  const summary = getGlobalEnterpriseCommandSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/global-reach">Global Reach</Link>
        <p className="eyebrow">Global Enterprise Command</p>
        <h1>SCRIMED turns international demand into governed, localized, enterprise-ready execution.</h1>
        <p className="hero-text">
          This command surface connects global region strategy, buyer localization, certification readiness,
          interoperability posture, and human-reviewed communication so SCRIMED can sell globally without
          crossing legal, privacy, clinical, procurement, connector, or production boundaries.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>
            Download Global Brief
          </a>
          <a className="secondary-action" href={summary.apiRoute}>
            Inspect API
          </a>
          <Link className="secondary-action" href="/global-certification-readiness">
            Approval Readiness
          </Link>
          <Link className="secondary-action" href="/interoperability">
            Interoperability
          </Link>
          <Link className="secondary-action" href="/client-onboarding">
            Communications
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Global enterprise command summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Region commands</span>
          <strong>{summary.regionCommandCount}</strong>
        </article>
        <article>
          <span>Launch regions</span>
          <strong>{summary.launchRegionCommandCount}</strong>
        </article>
        <article>
          <span>Strategic regions</span>
          <strong>{summary.strategicRegionCommandCount}</strong>
        </article>
        <article>
          <span>Sales playbooks</span>
          <strong>{summary.salesPlaybookCount}</strong>
        </article>
        <article>
          <span>Interop lanes</span>
          <strong>{summary.interoperabilityLaneCount}</strong>
        </article>
        <article>
          <span>Communication lanes</span>
          <strong>{summary.communicationLaneCount}</strong>
        </article>
        <article>
          <span>Blocked claims</span>
          <strong>{summary.blockedClaimCount}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Global authority boundary">
        <div>
          <p className="eyebrow">Authority boundary</p>
          <h2>International expansion is a governed readiness motion, not approval authority.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.scorecards.map((scorecard, index) => (
            <div className="layer-row" key={scorecard.category}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>
                {scorecard.category}: {scorecard.score} - {scorecard.nextAction}
              </strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Global region commands">
        <div className="section-heading">
          <p className="eyebrow">Region commands</p>
          <h2>Each region gets a readiness score, sales motion, proof path, and retained approval gates.</h2>
        </div>
        {summary.regionalCommands.map((command) => (
          <article className="module-row" key={command.slug}>
            <div>
              <span>{command.tier}</span>
              <h2>{command.region}</h2>
            </div>
            <p>{command.internationalDraw}</p>
            <div>
              <strong>Readiness {command.readinessScore}</strong>
              <ul className="compact-list">
                <li>Sales motion: {command.salesMotion}</li>
                <li>Interoperability: {command.interoperabilityPath}</li>
                <li>Communication: {command.communicationPlan}</li>
                <li>Retained gates: {command.retainedGates.join(", ")}</li>
                <li>Audit: {command.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Global enterprise sales playbooks">
        <div className="section-heading">
          <p className="eyebrow">Global sales performance</p>
          <h2>Buyer-specific playbooks keep international pitch, proof, offer, and review gates aligned.</h2>
        </div>
        {summary.salesPlaybooks.map((playbook) => (
          <article className="module-row" key={playbook.audience}>
            <div>
              <span>{playbook.priority}</span>
              <h2>{playbook.audience}</h2>
            </div>
            <p>{playbook.globalPitch}</p>
            <div>
              <strong>{playbook.recommendedOffer}</strong>
              <ul className="compact-list">
                <li>Trigger: {playbook.buyerTrigger}</li>
                <li>Gate: {playbook.humanReviewGate}</li>
                <li>Proof: {playbook.proofRoutes.join(", ")}</li>
                <li>Next: {playbook.nextAction}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Global interoperability readiness">
        <div className="section-heading">
          <p className="eyebrow">Global interoperability</p>
          <h2>Standards lanes stay synthetic until profiles, licenses, regions, and customer authority are approved.</h2>
        </div>
        {summary.interoperabilityLanes.map((lane) => (
          <article className="module-row" key={lane.standard}>
            <div>
              <span>{lane.readiness}</span>
              <h2>{lane.standard}</h2>
            </div>
            <p>{lane.globalUse}</p>
            <div>
              <strong>{lane.retainedBoundary}</strong>
              <ul className="compact-list">
                <li>Evidence: {lane.proofEvidence.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Global communication readiness">
        <div className="section-heading">
          <p className="eyebrow">Global communication</p>
          <h2>Every international message remains human-reviewed, localized, and claims-safe before send.</h2>
        </div>
        {summary.communicationLanes.map((lane) => (
          <article className="module-row" key={lane.channel}>
            <div>
              <span>human review</span>
              <h2>{lane.channel}</h2>
            </div>
            <p>{lane.purpose}</p>
            <div>
              <strong>{lane.localizationRequirement}</strong>
              <ul className="compact-list">
                <li>Human review required: {lane.humanReviewRequired ? "yes" : "no"}</li>
                <li>Next: {lane.nextAction}</li>
                <li>Blocked: {lane.blockedContent.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band split-band" aria-label="Global next build step">
        <div>
          <p className="eyebrow">Next build step</p>
          <h2>Move from international interest to governed, region-specific proof packets.</h2>
          <p className="section-copy">{summary.nextBuildStep}</p>
        </div>
        <div className="layer-list">
          {summary.blockedClaims.slice(0, 8).map((claim, index) => (
            <div className="layer-row" key={claim}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>Blocked claim: {claim}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
