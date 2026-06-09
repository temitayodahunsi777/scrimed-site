import Link from "next/link";
import { getQualityGateSummary } from "../lib/qualityGates";

export default function QualityPage() {
  const summary = getQualityGateSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/hub">Hub</Link>
        <p className="eyebrow">Quality gates</p>
        <h1>SCRIMED keeps execution moving by replacing blockers with explicit, safer quality gates.</h1>
        <p className="hero-text">
          Local verification, GitHub Actions, Vercel deployment, executable synthetic validation, interoperability conformance, fixture change review, workflow execution evidence, deny-by-default controls, and readiness checks form the current active quality path.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED quality gate summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Active</span>
          <strong>{summary.active}</strong>
        </article>
        <article>
          <span>Bypassed</span>
          <strong>{summary.bypassed}</strong>
        </article>
        <article>
          <span>Synthetic checks</span>
          <strong>{summary.syntheticValidation.passedChecks}</strong>
        </article>
        <article>
          <span>Integration checks</span>
          <strong>{summary.integrationFixtureValidation.passedChecks}</strong>
        </article>
        <article>
          <span>Interop standards</span>
          <strong>{summary.interoperability.standardCount}</strong>
        </article>
        <article>
          <span>Conformance kits</span>
          <strong>{summary.interoperabilityEvaluations.syntheticPassed}</strong>
        </article>
        <article>
          <span>Live blocked</span>
          <strong>{summary.interoperabilityEvaluations.liveBlocked}</strong>
        </article>
        <article>
          <span>Product demos</span>
          <strong>{summary.demoPilotPrograms.executableDemos}</strong>
        </article>
        <article>
          <span>Pilot programs</span>
          <strong>{summary.demoPilotPrograms.pilotCount}</strong>
        </article>
        <article>
          <span>Fixture reviews</span>
          <strong>{summary.fixtureChangeReview.approved}</strong>
        </article>
        <article>
          <span>Workflow ready</span>
          <strong>{summary.workflowExecution.ready}</strong>
        </article>
        <article>
          <span>Result fixtures</span>
          <strong>{summary.workflowExecutionResults.resultCount}</strong>
        </article>
        <article>
          <span>Result checks</span>
          <strong>{summary.workflowResultValidation.passedChecks}</strong>
        </article>
        <article>
          <span>Promotion</span>
          <strong>{summary.workflowPromotionReview.approved}</strong>
        </article>
        <article>
          <span>Contracts</span>
          <strong>{summary.workflowExecutionContracts.ready}</strong>
        </article>
        <article>
          <span>Identity</span>
          <strong>{summary.identityAccessReadiness.status}</strong>
        </article>
        <article>
          <span>Attempts</span>
          <strong>{summary.executionAttemptReadiness.status}</strong>
        </article>
        <article>
          <span>Runtime safety</span>
          <strong>{summary.runtimeSafetyReadiness.status}</strong>
        </article>
        <article>
          <span>Deny stubs</span>
          <strong>{summary.workflowImplementationReadiness.ready}</strong>
        </article>
        <article>
          <span>Audit</span>
          <strong>{summary.workflowExecutionAudit.ready}</strong>
        </article>
        <article>
          <span>Audit store</span>
          <strong>{summary.auditPersistenceReadiness.status}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="SCRIMED quality gates">
        {summary.gates.map((gate) => (
          <article className="module-row" key={gate.name}>
            <div>
              <span>{gate.state}</span>
              <h2>{gate.name}</h2>
            </div>
            <p>{gate.replacement ?? "active gate"}</p>
            <Link className="module-link" href={gate.route}>{gate.role}</Link>
          </article>
        ))}
      </section>
    </main>
  );
}
