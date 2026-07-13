import Link from "next/link";
import { getScrimedPatientContextGatewaySummary } from "../lib/scrimedPatientContextGateway";

export const metadata = {
  title: "SCRIMED Patient Context Gateway",
  description:
    "Synthetic-only SCRIMED Patient Context Gateway for patient story continuity, provenance, HIE concepts, FHIR abstractions, consent, complex-care continuity, and no EHR writeback."
};

export default function ScrimedPatientContextGatewayPage() {
  const summary = getScrimedPatientContextGatewaySummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/healthcare-intelligence-os">
          Healthcare Intelligence OS
        </Link>
        <p className="eyebrow">SCRIMED CODE pt. 4</p>
        <h1>Patient Context Gateway</h1>
        <p className="hero-text">{summary.boundary}</p>
        <div className="hero-actions" aria-label="SCRIMED Patient Context Gateway actions">
          <Link href={summary.apiRoute}>Inspect API</Link>
          <Link href={summary.briefRoute}>Download Brief</Link>
          <Link href="/health-records">Health Records</Link>
          <Link href="/interoperability">Interoperability</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED Patient Context Gateway summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Boundary</span>
          <strong>{summary.scenario.dataBoundary}</strong>
        </article>
        <article>
          <span>Consent</span>
          <strong>{summary.scenario.consentRequired ? "required" : "not required"}</strong>
        </article>
        <article>
          <span>EHR writeback</span>
          <strong>{summary.scenario.ehrWritebackEnabled ? "enabled" : "blocked"}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Patient context synthetic scenario">
        <div>
          <p className="eyebrow">Synthetic Scenario</p>
          <h2>{summary.scenario.scenarioId}</h2>
        </div>
        <div>
          <p>{summary.scenario.continuityScenario}</p>
          <p>{summary.scenario.patientStoryContinuityModel}</p>
          <p>Audit hash: {summary.scenario.auditHash}</p>
        </div>
      </section>

      <section className="table-section" aria-label="Patient Context Gateway controls">
        <div className="section-heading">
          <p className="eyebrow">Controls</p>
          <h2>Context assembly stays consent-aware, provenance-required, and FHIR-ready.</h2>
        </div>
        {summary.requiredControls.map((control) => (
          <article className="module-row" key={control}>
            <div>
              <span>required</span>
              <h2>{control}</h2>
            </div>
            <p>Protected patient-context capability remains synthetic until external approvals and live-data controls exist.</p>
            <div>
              <strong>FHIR abstraction</strong>
              <p>{summary.scenario.fhirReadyAbstraction.join(", ")}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
