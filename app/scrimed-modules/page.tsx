import Link from "next/link";
import { getScrimedModuleRegistrySummary } from "../lib/scrimedModuleRegistry";

export const metadata = {
  title: "SCRIMED Module Registry",
  description:
    "No-PHI architecture registry for SCRIMED ClinicalBench, Evidence Graph, Trust Score, continuous evaluation, memory, multi-agent runtime, and multi-model routing modules."
};

export default function ScrimedModuleRegistryPage() {
  const summary = getScrimedModuleRegistrySummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/scrimed-os">
          SCRIMED OS
        </Link>
        <p className="eyebrow">SCRIMED Module Registry</p>
        <h1>New SCRIMED intelligence modules staged as governed, no-PHI platform capabilities.</h1>
        <p className="hero-text">
          This registry turns the requested ClinicalBench, scientific reasoning, evidence graph, workflow planning, memory,
          trust scoring, multi-agent, and multi-model systems into an auditable build-control surface with clear demo scope,
          production blockers, safety controls, and first engineering milestones.
        </p>
        <div className="hero-actions" aria-label="SCRIMED module registry actions">
          <Link href="/api/scrimed-modules">Inspect Registry API</Link>
          <Link href="/api/scrimed-modules/brief">Download Brief</Link>
          <Link href="/clinical-robustness-lab">Clinical Robustness Lab</Link>
          <Link href="/investor-readiness">Investor Readiness</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED module registry summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Modules</span>
          <strong>{summary.moduleCount}</strong>
        </article>
        <article>
          <span>Domains</span>
          <strong>{Object.keys(summary.domainCounts).length}</strong>
        </article>
        <article>
          <span>Stages</span>
          <strong>{Object.keys(summary.stageCounts).length}</strong>
        </article>
        <article>
          <span>Validation</span>
          <strong>{summary.validation.status}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="SCRIMED module registry boundary">
        <div>
          <p className="eyebrow">GO / NO-GO</p>
          <h2>Module architecture can advance now; live clinical authority remains blocked.</h2>
        </div>
        <div>
          <p>{summary.boundary}</p>
          <p>{summary.currentGoScope}</p>
          <p>{summary.noGoScope}</p>
        </div>
      </section>

      <section className="table-section" aria-label="SCRIMED modules">
        <div className="section-heading">
          <p className="eyebrow">Modules</p>
          <h2>Nineteen requested modules are registered with capabilities, dependencies, safety controls, and milestones.</h2>
        </div>
        {summary.modules.map((module) => (
          <article className="module-row" key={module.slug}>
            <div>
              <span>{module.stage}</span>
              <h2>{module.name}</h2>
            </div>
            <p>{module.objective}</p>
            <div>
              <strong>{module.domain}</strong>
              <ul className="compact-list">
                <li>Capabilities: {module.coreCapabilities.join(", ")}</li>
                <li>Inputs: {module.primaryInputs.join(", ")}</li>
                <li>Outputs: {module.primaryOutputs.join(", ")}</li>
                <li>Dependencies: {module.dependencies.join(", ")}</li>
                <li>Allowed demo mode: {module.allowedDemoMode}</li>
                <li>Blocked production mode: {module.blockedProductionMode}</li>
                <li>First milestone: {module.firstImplementationMilestone}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band principle-grid" aria-label="Module registry validation checks">
        {summary.validation.checks.map((check) => (
          <article key={check.check}>
            <span>{check.passed ? "pass" : "fail"}</span>
            <h3>{check.check}</h3>
            <p>{check.detail}</p>
          </article>
        ))}
      </section>

      <section className="section-band compact-list" aria-label="Next module implementation step">
        <div>
          <p className="eyebrow">Next build step</p>
          <h2>Promote the measurement stack before workflow autonomy expands.</h2>
        </div>
        <p>{summary.nextImplementationStep}</p>
      </section>
    </main>
  );
}
