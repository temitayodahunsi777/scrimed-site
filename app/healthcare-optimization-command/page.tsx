import Link from "next/link";
import { getHealthcareOptimizationCommandSummary } from "../lib/healthcareOptimizationCommand";

export const metadata = {
  title: "SCRIMED Healthcare Optimization Command",
  description:
    "Synthetic-only command layer for clinical workflow optimization, patient engagement, hospital operations, agents, innovation, and interoperability."
};

export default function HealthcareOptimizationCommandPage() {
  const summary = getHealthcareOptimizationCommandSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">Healthcare Optimization Command</p>
        <h1>SCRIMED converts healthcare complexity into governed optimization lanes.</h1>
        <p className="hero-text">
          This command layer connects problem solving, agent capability growth, clinical workflow optimization,
          patient engagement analysis, hospital operations intelligence, innovation intake, and interoperable
          solution planning without touching live PHI or granting production authority.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>
            Download Optimization Brief
          </a>
          <a className="secondary-action" href={summary.apiRoute}>
            Inspect API
          </a>
          <Link className="secondary-action" href="/strategic-problem-resolution">
            Problem Resolution
          </Link>
          <Link className="secondary-action" href="/enterprise-healthcare-infrastructure">
            Infrastructure
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Healthcare optimization command summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Optimization lanes</span>
          <strong>{summary.laneCount}</strong>
        </article>
        <article>
          <span>Playbooks</span>
          <strong>{summary.playbookCount}</strong>
        </article>
        <article>
          <span>Innovation tracks</span>
          <strong>{summary.innovationTrackCount}</strong>
        </article>
        <article>
          <span>Agent capabilities</span>
          <strong>{summary.agentCapabilityCount}</strong>
        </article>
        <article>
          <span>Interop standards</span>
          <strong>{summary.interoperableStandardCount}</strong>
        </article>
        <article>
          <span>Outcome metrics</span>
          <strong>{summary.measurableOutcomeCount}</strong>
        </article>
        <article>
          <span>Human review</span>
          <strong>{summary.humanReviewRequiredCount}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Optimization boundary">
        <div>
          <p className="eyebrow">Safety boundary</p>
          <h2>Optimization is allowed; autonomous clinical or production action remains blocked.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {Object.entries(summary.authority).map(([name, status], index) => (
            <div className="layer-row" key={name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{name}: {status}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Healthcare optimization lanes">
        <div className="section-heading">
          <p className="eyebrow">Optimization lanes</p>
          <h2>Clinical workflow, patient engagement, hospital operations, interoperability, agents, innovation, and product packaging move through one governed map.</h2>
          <p className="section-copy">{summary.nextBestMove}</p>
        </div>
        {summary.lanes.map((lane) => (
          <article className="module-row" key={lane.id}>
            <div>
              <span>{lane.domain}</span>
              <h2>{lane.name}</h2>
            </div>
            <p>{lane.optimizationThesis}</p>
            <div>
              <strong>Priority {lane.priorityScore} - {lane.readiness}</strong>
              <ul className="compact-list">
                <li>Buyer problem: {lane.buyerProblem}</li>
                <li>Automation: {lane.safeAutomationMode}</li>
                <li>Commercial motion: {lane.commercialMotion}</li>
                <li>Next: {lane.nextBuildStep}</li>
                <li>Proof routes: {lane.proofRoutes.join(", ")}</li>
                <li>Audit: {lane.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Governed healthcare playbooks">
        <div className="section-heading">
          <p className="eyebrow">Governed playbooks</p>
          <h2>Playbooks give operators a safe path from signal to review without executing live actions.</h2>
        </div>
        {summary.playbooks.map((playbook) => (
          <article className="module-row" key={playbook.id}>
            <div>
              <span>{playbook.targetTeam}</span>
              <h2>{playbook.title}</h2>
            </div>
            <p>{playbook.triggerSignal}</p>
            <div>
              <strong>{playbook.humanGate}</strong>
              <ul className="compact-list">
                {playbook.governedWorkflow.map((step) => (
                  <li key={step}>{step}</li>
                ))}
                <li>Assist: {playbook.automationAssist}</li>
                <li>Fallback: {playbook.fallbackPath}</li>
                <li>Proof: {playbook.proofRoute}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Healthcare innovation tracks">
        <div className="section-heading">
          <p className="eyebrow">Innovation tracks</p>
          <h2>Novel capabilities move through evidence, simulation, review, and pilot packaging before they become external commitments.</h2>
        </div>
        {summary.innovationTracks.map((track) => (
          <article className="module-row" key={track.id}>
            <div>
              <span>{track.owner}</span>
              <h2>{track.title}</h2>
            </div>
            <p>{track.opportunity}</p>
            <div>
              <strong>{track.retainedBoundary}</strong>
              <ul className="compact-list">
                {track.validationPath.map((step) => (
                  <li key={step}>{step}</li>
                ))}
                <li>Evidence: {track.requiredEvidence.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
