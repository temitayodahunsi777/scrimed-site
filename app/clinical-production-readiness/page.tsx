import Link from "next/link";
import { getClinicalProductionReadinessSummary } from "../lib/clinicalProductionReadiness";

export const metadata = {
  title: "SCRIMED Clinical Production Readiness",
  description:
    "SCRIMED clinical production readiness task ledger and current capability maximization control plane."
};

export default function ClinicalProductionReadinessPage() {
  const summary = getClinicalProductionReadinessSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/company-assessment">Company Assessment</Link>
        <p className="eyebrow">Clinical production readiness</p>
        <h1>SCRIMED now has a tracked task ledger for the work required before clinical production.</h1>
        <p className="hero-text">
          This surface separates what SCRIMED can safely sell and operate now from the hard
          requirements still needed for live clinical care, PHI, EHR connectors, regulated
          clinical claims, customer go-live, global approvals, and production support.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>
            Download task ledger
          </a>
          <a className="secondary-action" href={summary.apiRoute}>
            Inspect API
          </a>
          <Link className="secondary-action" href="/service-delivery">
            Package current services
          </Link>
          <Link className="secondary-action" href="/health-records">
            Open health records
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Clinical production readiness summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Production ready</span>
          <strong>{summary.clinicalProductionReady ? "yes" : "no"}</strong>
        </article>
        <article>
          <span>Readiness score</span>
          <strong>{summary.readinessScore}</strong>
        </article>
        <article>
          <span>Required tasks</span>
          <strong>{summary.taskCount}</strong>
        </article>
        <article>
          <span>Incomplete</span>
          <strong>{summary.incompleteTaskCount}</strong>
        </article>
        <article>
          <span>Critical open</span>
          <strong>{summary.criticalOpenTaskCount}</strong>
        </article>
        <article>
          <span>External review</span>
          <strong>{summary.externalReviewTaskCount}</strong>
        </article>
        <article>
          <span>Blocked</span>
          <strong>{summary.blockedTaskCount}</strong>
        </article>
        <article>
          <span>Current motions</span>
          <strong>{summary.currentCapabilityMotionCount}</strong>
        </article>
        <article>
          <span>Activate now</span>
          <strong>{summary.activateNowMotionCount}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Current posture">
        <div>
          <p className="eyebrow">Operating posture</p>
          <h2>{summary.currentOperatingMode}</h2>
          <p className="section-copy">{summary.nextCompanyMove}</p>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {Object.entries(summary.authority).map(([key, value], index) => (
            <div className="layer-row" key={key}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{key}: {value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Required clinical production tasks">
        <div className="section-heading">
          <p className="eyebrow">Tracked tasks</p>
          <h2>Every required task has an owner, status, missing evidence, current safe use, and retained boundary.</h2>
        </div>
        {summary.requiredTasks.map((task) => (
          <article className="module-row" key={task.id}>
            <div>
              <span>{task.priority}</span>
              <h2>{task.id}: {task.task}</h2>
            </div>
            <p>{task.requiredFor}</p>
            <div>
              <strong>{task.status} - {task.productionComplete ? "complete" : "not complete"}</strong>
              <ul className="compact-list">
                <li>Owner: {task.owner}</li>
                <li>Missing: {task.missingBeforeClinicalProduction.join(", ")}</li>
                <li>Criteria: {task.completionCriteria.join(", ")}</li>
                <li>Current use: {task.currentUseWhilePending}</li>
                <li>Proof: {task.currentEvidenceRoutes.join(", ")}</li>
                <li>{task.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Current capability maximization">
        <div className="section-heading">
          <p className="eyebrow">Maximize current capabilities</p>
          <h2>Scrimed can keep growing through no-PHI services, synthetic pilots, diligence packets, and governed readiness offers.</h2>
        </div>
        {summary.currentCapabilityMotions.map((motion) => (
          <article className="module-row" key={motion.name}>
            <div>
              <span>{motion.status}</span>
              <h2>{motion.name}</h2>
            </div>
            <p>{motion.audience}</p>
            <div>
              <strong>{motion.nextAction}</strong>
              <ul className="compact-list">
                <li>Strategic: {motion.strategicUse}</li>
                <li>Financial: {motion.financialUse}</li>
                <li>Structural: {motion.structuralUse}</li>
                <li>Proof: {motion.proofRoutes.join(", ")}</li>
                <li>Blocked claims: {motion.blockedClaims.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Production gates">
        <div className="section-heading">
          <p className="eyebrow">Go-live gates</p>
          <h2>The same five gates block live clinical use until real authority exists.</h2>
        </div>
        <div className="principle-grid">
          {summary.productionGates.map((gate) => (
            <article key={gate.gate}>
              <span>{gate.owner}</span>
              <h3>{gate.gate}</h3>
              <p>{gate.completionSignal}</p>
              <ul className="compact-list">
                <li>Blocks: {gate.blocks.join(", ")}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band" aria-label="Priority tasks">
        <div className="section-heading">
          <p className="eyebrow">Next sequence</p>
          <h2>Work these first while current capability motions continue.</h2>
        </div>
        <div className="layer-list">
          {summary.nextTasks.map((task, index) => (
            <div className="layer-row" key={task.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{task.id}: {task.task} - {task.status}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band" aria-label="Official source references">
        <div className="section-heading">
          <p className="eyebrow">Source references</p>
          <h2>Official sources anchor the task ledger; qualified reviewers still make final determinations.</h2>
        </div>
        <div className="principle-grid">
          {summary.sourceReferences.map((source) => (
            <article key={source.name}>
              <span>{source.jurisdiction}</span>
              <h3>{source.name}</h3>
              <p>{source.readinessUse}</p>
              <a href={source.url}>{source.url}</a>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band" aria-label="Hard stops">
        <div className="section-heading">
          <p className="eyebrow">Hard stops</p>
          <h2>These boundaries stay active until the task ledger, external reviewers, and customer authority close them.</h2>
        </div>
        <div className="layer-list">
          {summary.hardStops.map((hardStop, index) => (
            <div className="layer-row" key={hardStop}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{hardStop}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
