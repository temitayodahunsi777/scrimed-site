import Link from "next/link";
import { getQaEvidenceLedger } from "../lib/qaEvidenceLedger";

export const metadata = {
  title: "SCRIMED QA Evidence Ledger",
  description:
    "Review SCRIMED release QA evidence, protected-route containment, token-policy readiness, known limitations, and manual AAL2 verification gates."
};

export default function QaEvidencePage() {
  const ledger = getQaEvidenceLedger();
  const commitSha =
    ledger.currentDeployment.commitSha === "local-or-unset"
      ? ledger.currentDeployment.commitSha
      : ledger.currentDeployment.commitSha.slice(0, 12);

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/quality">Quality Gates</Link>
        <p className="eyebrow">QA Evidence Ledger</p>
        <h1>SCRIMED release evidence, fail-closed controls, and operator-token gates stay visible and buyer-safe.</h1>
        <p className="hero-text">
          This ledger records what has passed, what intentionally fails closed, which limitations are contained, and the
          one remaining authenticated QA gate that requires a fresh short-lived AAL2 operator session.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={ledger.briefRoute}>
            Download QA Brief
          </a>
          <a className="secondary-action" href={ledger.apiRoute}>
            Inspect QA API
          </a>
          <a className="secondary-action" href={ledger.manualRunEvidenceCapture.route}>
            Capture Run Packet
          </a>
          <Link className="secondary-action" href="/pilot-evidence">
            Pilot Evidence
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED QA evidence summary">
        <article>
          <span>Status</span>
          <strong>{ledger.status}</strong>
        </article>
        <article>
          <span>Evidence entries</span>
          <strong>{ledger.recordedEvidenceCount}</strong>
        </article>
        <article>
          <span>Passed</span>
          <strong>{ledger.passed}</strong>
        </article>
        <article>
          <span>Fail closed</span>
          <strong>{ledger.failClosed}</strong>
        </article>
        <article>
          <span>Manual gates</span>
          <strong>{ledger.manualGates}</strong>
        </article>
        <article>
          <span>Capture path</span>
          <strong>{ledger.manualRunEvidenceCapture.status}</strong>
        </article>
        <article>
          <span>Data boundary</span>
          <strong>synthetic only</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Current boundary</p>
          <h2>{ledger.buyerSafeSummary}</h2>
          <p className="section-copy">{ledger.boundary}</p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>env</span>
            <strong>{ledger.currentDeployment.environment}</strong>
          </div>
          <div className="layer-row">
            <span>ref</span>
            <strong>{ledger.currentDeployment.commitRef}</strong>
          </div>
          <div className="layer-row">
            <span>sha</span>
            <strong>{commitSha}</strong>
          </div>
        </div>
      </section>

      <section className="table-section" aria-label="SCRIMED QA evidence entries">
        <div className="section-heading">
          <p className="eyebrow">Evidence entries</p>
          <h2>Every check is tied to an artifact, route, limitation, and workaround.</h2>
        </div>
        {ledger.entries.map((entry) => (
          <article className="module-row" key={entry.id}>
            <div>
              <span>{entry.status}</span>
              <h2>{entry.name}</h2>
            </div>
            <p>{entry.evidence}</p>
            <div>
              <strong>{entry.artifact}</strong>
              <ul className="compact-list">
                <li>Owner: {entry.owner}</li>
                <li>Recorded: {entry.recordedAt}</li>
                <li>Limitation: {entry.limitation}</li>
                <li>Workaround: {entry.workaround}</li>
                <li>Next: {entry.nextAction}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="SCRIMED known limitations">
        <div className="section-heading">
          <p className="eyebrow">Known limitations</p>
          <h2>Limitations are either contained, manual-action required, or external-review required.</h2>
        </div>
        <div className="principle-grid">
          {ledger.knownLimitations.map((limitation) => (
            <article key={limitation.title}>
              <span>{limitation.status}</span>
              <h3>{limitation.title}</h3>
              <p>{limitation.impact}</p>
              <ul className="compact-list">
                <li>{limitation.currentControl}</li>
                <li>{limitation.resolutionPath}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band" aria-label="SCRIMED Sales Demo Session QA token policy">
        <div className="section-heading">
          <p className="eyebrow">AAL2 token policy</p>
          <h2>Authenticated QA is deliberately narrow, short-lived, and operator-controlled.</h2>
        </div>
        <div className="principle-grid">
          <article>
            <span>policy</span>
            <h3>{ledger.tokenPolicy.status}</h3>
            <p>{ledger.tokenPolicy.ciMode}</p>
          </article>
          <article>
            <span>claims</span>
            <h3>{ledger.tokenPolicy.requiredClaims.join(", ")}</h3>
            <p>
              Maximum lifetime {ledger.tokenPolicy.maxTokenLifetimeSeconds}s; minimum remaining{" "}
              {ledger.tokenPolicy.minRemainingSeconds}s.
            </p>
          </article>
          <article>
            <span>boundary</span>
            <h3>No long-lived secret</h3>
            <p>{ledger.salesDemoSessionQaBoundary}</p>
          </article>
        </div>
      </section>

      <section className="section-band" aria-label="SCRIMED manual QA evidence capture">
        <div className="section-heading">
          <p className="eyebrow">Manual run packet</p>
          <h2>After the AAL2 workflow passes, SCRIMED can generate a no-secret evidence packet without storing credentials.</h2>
        </div>
        <div className="principle-grid">
          <article>
            <span>status</span>
            <h3>{ledger.manualRunEvidenceCapture.status}</h3>
            <p>{ledger.manualRunEvidenceCapture.persistenceBoundary}</p>
          </article>
          <article>
            <span>route</span>
            <h3>{ledger.manualRunEvidenceCapture.route}</h3>
            <p>{ledger.manualRunEvidenceCapture.forbiddenContent}</p>
          </article>
          <article>
            <span>required</span>
            <h3>{ledger.manualRunEvidenceCapture.requiredFields.length} fields</h3>
            <p>
              Required attestations: {Object.values(ledger.manualRunEvidenceCapture.acceptedAttestations).join(", ")}.
            </p>
          </article>
        </div>
      </section>

      <section className="table-section" aria-label="SCRIMED Sales Demo Session QA controls">
        <div className="section-heading">
          <p className="eyebrow">Controls</p>
          <h2>The QA path records synthetic business workflow evidence only.</h2>
        </div>
        {ledger.salesDemoSessionQaControls.map((control) => (
          <article className="module-row" key={control}>
            <div>
              <span>control</span>
              <h2>{control}</h2>
            </div>
            <p>{ledger.nextRecommendedBuildStep}</p>
            <Link className="module-link" href="/sales-operations">
              Open Sales Operations
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
