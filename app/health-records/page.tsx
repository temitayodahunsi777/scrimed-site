import Link from "next/link";
import { getHealthRecordsSafetyExchangeSummary } from "../lib/healthRecordsSafetyExchange";

export const metadata = {
  title: "SCRIMED Health Records Safety Exchange",
  description:
    "No-PHI health-record interoperability, extraction, patient-safety, and live-data boundary controls for SCRIMED."
};

export default function HealthRecordsSafetyExchangePage() {
  const summary = getHealthRecordsSafetyExchangeSummary();

  return (
    <main>
      <section className="page-hero trust-hero">
        <Link className="back-link" href="/interoperability">Interoperability</Link>
        <p className="eyebrow">Health Records Safety Exchange</p>
        <h1>Health-record extraction becomes safe, source-attributed, and reviewable before it becomes live.</h1>
        <p className="hero-text">{summary.boundary}</p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Health Records Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <a className="secondary-action" href={summary.extractRoute}>Synthetic extraction API</a>
          <Link className="secondary-action" href="/clinical-care-activation">Clinical Gates</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Health records safety exchange summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Capabilities</span>
          <strong>{summary.capabilityCount}</strong>
        </article>
        <article>
          <span>Safety checks</span>
          <strong>{summary.safetyCheckCount}</strong>
        </article>
        <article>
          <span>Workarounds</span>
          <strong>{summary.workaroundCount}</strong>
        </article>
        <article>
          <span>Blocked actions</span>
          <strong>{summary.blockedActionCount}</strong>
        </article>
        <article>
          <span>Live blocked</span>
          <strong>{summary.liveBlockedCapabilityCount}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Operating Rules</p>
          <h2>SCRIMED can improve extraction and interoperability without touching live records.</h2>
          <p className="section-copy">
            The exchange supports synthetic FHIR, HL7 v2, C-CDA, DICOM metadata, X12/prior-auth, CSV, and note
            extraction planning while preserving PHI, connector, clinical, payer, and writeback hard stops.
          </p>
        </div>
        <div className="layer-list">
          {summary.operatingRules.map((rule, index) => (
            <div className="layer-row" key={rule}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{rule}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Health record extraction capabilities">
        <div className="section-heading">
          <p className="eyebrow">Capabilities</p>
          <h2>Every record capability carries standards, extraction targets, safety controls, workarounds, and blocked actions.</h2>
        </div>
        {summary.capabilities.map((capability) => (
          <article className="module-row" key={capability.slug}>
            <div>
              <span>{capability.status}</span>
              <h2>{capability.name}</h2>
            </div>
            <p>{capability.standardBindings.join(", ")}</p>
            <div>
              <strong>{capability.extractionTargets.slice(0, 3).join(" · ")}</strong>
              <ul className="compact-list">
                <li>Formats: {capability.sourceFormats.join(", ")}</li>
                <li>Workaround: {capability.workarounds[0]}</li>
                <li>Blocked: {capability.blockedActions.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Extraction pipeline">
        <div className="section-heading">
          <p className="eyebrow">Extraction Pipeline</p>
          <h2>The path from source declaration to reviewer packet is gated at each step.</h2>
        </div>
        {summary.extractionStages.map((stage) => (
          <article className="module-row" key={stage.stage}>
            <div>
              <span>{stage.owner}</span>
              <h2>{stage.stage}</h2>
            </div>
            <p>{stage.inputBoundary}</p>
            <div>
              <strong>{stage.output}</strong>
              <ul className="compact-list">
                <li>{stage.safetyGate}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band principle-grid" aria-label="Patient safety checks">
        {summary.safetyChecks.map((check) => (
          <article key={check.id}>
            <span>{check.severity}</span>
            <h3>{check.name}</h3>
            <p>{check.trigger}</p>
            <ul className="compact-list">
              <li>{check.mitigation}</li>
              <li>{check.workaround}</li>
            </ul>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Health records boundary workarounds">
        <div className="section-heading">
          <p className="eyebrow">Limitations and Workarounds</p>
          <h2>Each hard stop has a safe path forward and a retained approval gate.</h2>
        </div>
        {summary.boundaryResolutions.map((resolution) => (
          <article className="module-row" key={resolution.boundary}>
            <div>
              <span>{resolution.owner}</span>
              <h2>{resolution.boundary}</h2>
            </div>
            <p>{resolution.riskIfIgnored}</p>
            <div>
              <strong>{resolution.safeWorkaround}</strong>
              <ul className="compact-list">
                <li>Control: {resolution.currentControl}</li>
                <li>Gate: {resolution.remainingGate}</li>
                <li>Proof: {resolution.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Official health records source references">
        <div className="section-heading">
          <p className="eyebrow">Source References</p>
          <h2>Standards and policy references are treated as implementation constraints, not approval claims.</h2>
        </div>
        {summary.sourceReferences.map((reference) => (
          <article className="module-row" key={reference.name}>
            <div>
              <span>{reference.checkedAt}</span>
              <h2>{reference.name}</h2>
            </div>
            <p>{reference.implication}</p>
            <a className="module-link" href={reference.url}>{reference.url}</a>
          </article>
        ))}
      </section>
    </main>
  );
}
