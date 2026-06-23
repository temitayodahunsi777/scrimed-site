import Link from "next/link";
import { getReleaseContinuitySummary } from "../lib/releaseContinuity";

export const metadata = {
  title: "SCRIMED Release Continuity",
  description:
    "SCRIMED release continuity checkpoint for live production proof, source-control alignment, fail-closed protected routes, AAL2 operator boundaries, and approval-safe workarounds."
};

export default function ReleaseContinuityPage() {
  const summary = getReleaseContinuitySummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">Release Continuity</p>
        <h1>SCRIMED keeps live production, source checkpoints, and protected AAL2 proof in one release lane.</h1>
        <p className="hero-text">
          This page closes the gap between public smoke, GitHub checkpoints, production deployment proof,
          and the human AAL2 boundary required for protected happy-path evidence.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Continuity Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/pilot-workspace/access">Protected Workspace</Link>
          <Link className="secondary-action" href="/buyer-release-control-run">Buyer Release Control</Link>
          <Link className="secondary-action" href="/approvals-readiness">Approvals Readiness</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Release continuity summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Gates</span>
          <strong>{summary.gateCount}</strong>
        </article>
        <article>
          <span>Resolved</span>
          <strong>{summary.resolvedGateCount}</strong>
        </article>
        <article>
          <span>AAL2 required</span>
          <strong>{summary.operatorRequiredGateCount}</strong>
        </article>
        <article>
          <span>Blocked by design</span>
          <strong>{summary.blockedByDesignGateCount}</strong>
        </article>
        <article>
          <span>External review</span>
          <strong>{summary.externalReviewGateCount}</strong>
        </article>
        <article>
          <span>Checks</span>
          <strong>{summary.checkCount}</strong>
        </article>
        <article>
          <span>Passed</span>
          <strong>{summary.passedCheckCount}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>Continuity proof is operational evidence, not release or clinical authority.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.nextOperatorActions.map((action, index) => (
            <div className="layer-row" key={action}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{action}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Release source checkpoint">
        <div className="section-heading">
          <p className="eyebrow">Source checkpoint</p>
          <h2>Production proof stays tied to commit, tag, deployment, and runtime metadata.</h2>
        </div>
        <div className="principle-grid">
          <article>
            <span>Production domain</span>
            <h3>{summary.source.productionDomain}</h3>
            <p>Custom-domain smoke remains the release truth for public availability.</p>
          </article>
          <article>
            <span>Baseline deployment</span>
            <h3>{summary.source.baselineDeploymentId}</h3>
            <p>Last checkpointed production deployment before this continuity layer.</p>
          </article>
          <article>
            <span>Baseline commit</span>
            <h3>{summary.source.baselineShortCommit}</h3>
            <p>{summary.source.baselineTag}</p>
          </article>
          <article>
            <span>Runtime commit</span>
            <h3>{summary.source.runtimeCommit}</h3>
            <p>{summary.source.runtimeBranch}</p>
          </article>
        </div>
      </section>

      <section className="table-section" aria-label="Release continuity gates">
        <div className="section-heading">
          <p className="eyebrow">Gates</p>
          <h2>Every remaining limitation has an explicit owner and workaround.</h2>
        </div>
        {summary.gates.map((gate) => (
          <article className="module-row" key={gate.key}>
            <div>
              <span>{gate.status}</span>
              <h2>{gate.name}</h2>
            </div>
            <p>{gate.proof}</p>
            <div>
              <strong>{gate.workaround}</strong>
              <ul className="compact-list">
                <li>Bottleneck: {gate.bottleneck}</li>
                <li>Owner: {gate.owner}</li>
                <li>Proof: {gate.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Release checks">
        <div className="section-heading">
          <p className="eyebrow">Checks</p>
          <h2>Release evidence separates automated confidence from human-gated proof.</h2>
        </div>
        {summary.checks.map((check) => (
          <article className="module-row" key={check.name}>
            <div>
              <span>{check.status}</span>
              <h2>{check.name}</h2>
            </div>
            <p>{check.evidence}</p>
            <div>
              <strong>{check.nextAction}</strong>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
