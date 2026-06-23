import Link from "next/link";
import { getQaAal2RunEvidenceSummary } from "../lib/qaAal2RunEvidence";

export const metadata = {
  title: "SCRIMED AAL2 Synthetic QA Run Evidence",
  description:
    "Buyer-safe AAL2 synthetic QA evidence package with protected human-run status, test categories, boundaries, and release recommendation."
};

export default function QaAal2RunEvidencePage() {
  const evidence = getQaAal2RunEvidenceSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/qa-evidence">QA Evidence Ledger</Link>
        <p className="eyebrow">AAL2 Synthetic QA Evidence</p>
        <h1>SCRIMED separates protected AAL2 execution evidence from buyer-proof release approval.</h1>
        <p className="hero-text">
          This package records the first protected AAL2 synthetic QA evidence posture, required test categories, retained
          packet visibility, audit status, and a clear go/no-go recommendation without weakening clinical, PHI, security,
          reimbursement, or production authority boundaries.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={evidence.routes.brief}>
            Download Evidence Brief
          </a>
          <a className="secondary-action" href={evidence.routes.api}>
            Inspect API
          </a>
          <Link className="secondary-action" href={evidence.routes.manualExecutionConsole}>
            Execution Console
          </Link>
          <Link className="secondary-action" href={evidence.routes.buyerProofRelease}>
            Buyer Proof Release
          </Link>
          <Link className="secondary-action" href="/pilot-workspace/access">
            Protected Workspace
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="AAL2 QA evidence summary">
        <article>
          <span>Status</span>
          <strong>{evidence.status}</strong>
        </article>
        <article>
          <span>Run state</span>
          <strong>{evidence.runState}</strong>
        </article>
        <article>
          <span>Recommendation</span>
          <strong>{evidence.recommendation}</strong>
        </article>
        <article>
          <span>Demo posture</span>
          <strong>{evidence.controlledDemoRecommendation}</strong>
        </article>
        <article>
          <span>Packet visible</span>
          <strong>{evidence.retainedPacketVisible ? "yes" : "no"}</strong>
        </article>
        <article>
          <span>Audit signals</span>
          <strong>{evidence.auditSignalCount}</strong>
        </article>
        <article>
          <span>Test categories</span>
          <strong>{evidence.categories.length}</strong>
        </article>
        <article>
          <span>PHI entered</span>
          <strong>{evidence.phiEnteredSystem ? "yes" : "no"}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>{evidence.testScope}</h2>
          <p className="section-copy">{evidence.boundary}</p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>date</span>
            <strong>{evidence.testDate}</strong>
          </div>
          <div className="layer-row">
            <span>console</span>
            <strong>{evidence.manualConsoleState}</strong>
          </div>
          <div className="layer-row">
            <span>release</span>
            <strong>{evidence.buyerProofReleaseState}</strong>
          </div>
          <div className="layer-row">
            <span>packet</span>
            <strong>{evidence.latestPacketHash}</strong>
          </div>
        </div>
      </section>

      <section className="table-section" aria-label="AAL2 QA required test categories">
        <div className="section-heading">
          <p className="eyebrow">Required categories</p>
          <h2>Every requested QA category carries explicit evidence status, reviewer note, and next action.</h2>
        </div>
        {evidence.categories.map((item) => (
          <article className="module-row" key={item.id}>
            <div>
              <span>{item.status}</span>
              <h2>{item.name}</h2>
            </div>
            <p>{item.evidence}</p>
            <div>
              <strong>{item.reviewerNote}</strong>
              <ul className="compact-list">
                <li>{item.nextAction}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="AAL2 QA boundary checks">
        <div className="section-heading">
          <p className="eyebrow">Boundary validation</p>
          <h2>Buyer proof remains blocked until retained packet and audit evidence pass protected gates.</h2>
        </div>
        {evidence.boundaryChecks.map((item) => (
          <article className="module-row" key={item.check}>
            <div>
              <span>{item.status}</span>
              <h2>{item.check}</h2>
            </div>
            <p>{item.evidence}</p>
            <div>
              <strong>Boundary retained</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="AAL2 QA blockers and mitigations">
        <div className="section-heading">
          <p className="eyebrow">Release posture</p>
          <h2>Current recommendation: {evidence.recommendation}.</h2>
        </div>
        <div className="principle-grid">
          <article>
            <span>passed controls</span>
            <h3>{evidence.passedControls.length}</h3>
            <ul className="compact-list">
              {evidence.passedControls.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article>
            <span>remaining blockers</span>
            <h3>{evidence.remainingBlockers.length}</h3>
            <ul className="compact-list">
              {evidence.remainingBlockers.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article>
            <span>mitigations</span>
            <h3>{evidence.recommendedMitigations.length}</h3>
            <ul className="compact-list">
              {evidence.recommendedMitigations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
