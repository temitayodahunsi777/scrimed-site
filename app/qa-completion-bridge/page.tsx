import Link from "next/link";
import {
  getQaCompletionBridgeSummary,
  sampleQaCompletionBridgePayload
} from "../lib/qaCompletionBridge";

export const metadata = {
  title: "SCRIMED QA Completion Bridge",
  description:
    "No-secret completion bridge for validating manual AAL2 synthetic QA evidence before protected persistence and buyer proof promotion."
};

function JsonBlock({ value }: { value: unknown }) {
  return <pre className="code-block">{JSON.stringify(value, null, 2)}</pre>;
}

export default function QaCompletionBridgePage() {
  const summary = getQaCompletionBridgeSummary();
  const salesPayload = sampleQaCompletionBridgePayload("sales-demo-session-qa");
  const authorityPayload = sampleQaCompletionBridgePayload("authority-reference-qa");

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/qa-launch-kit">Launch Kit</Link>
        <p className="eyebrow">QA Completion Bridge</p>
        <h1>SCRIMED now has a no-secret bridge from human AAL2 run completion to protected proof.</h1>
        <p className="hero-text">
          The bridge validates candidate post-run metadata, generates a preview hash, and keeps buyer proof blocked
          until the same no-secret metadata is persisted through the protected workspace and approved by Proof Promotion.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Bridge Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href={summary.launchKitRoute}>Launch Kit</Link>
          <Link className="secondary-action" href="/qa-claim-guard">Claim Guard</Link>
          <Link className="secondary-action" href={summary.proofPromotionRoute}>Proof Promotion</Link>
          <Link className="secondary-action" href="/pilot-workspace/access">Protected Workspace</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="QA completion bridge summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Decision</span>
          <strong>{summary.completionDecisionState}</strong>
        </article>
        <article>
          <span>Checkpoints</span>
          <strong>{summary.checkpointCount}</strong>
        </article>
        <article>
          <span>Hard stops</span>
          <strong>{summary.hardStopCount}</strong>
        </article>
        <article>
          <span>Safe fields</span>
          <strong>{summary.safeFieldCount}</strong>
        </article>
        <article>
          <span>Blocked claims</span>
          <strong>{summary.blockedClaimCount}</strong>
        </article>
        <article>
          <span>Persistence</span>
          <strong>protected only</strong>
        </article>
        <article>
          <span>Buyer proof</span>
          <strong>packet hash required</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>The bridge validates readiness; it does not become the retained proof system.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.bridgeRules.map((rule, index) => (
            <div className="layer-row" key={rule}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{rule}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="QA completion bridge checkpoints">
        <div className="section-heading">
          <p className="eyebrow">Completion checkpoints</p>
          <h2>Each transition from run output to buyer proof has a pass signal and a fail-closed condition.</h2>
        </div>
        {summary.checkpoints.map((checkpoint) => (
          <article className="module-row" key={checkpoint.checkpoint}>
            <div>
              <span>{checkpoint.state}</span>
              <h2>{checkpoint.checkpoint}</h2>
            </div>
            <p>{checkpoint.evidenceRequired}</p>
            <div>
              <strong>{checkpoint.owner}</strong>
              <ul className="compact-list">
                <li>Pass: {checkpoint.passSignal}</li>
                <li>Fail closed: {checkpoint.failClosedIf}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="QA completion bridge sample payloads">
        <div className="section-heading">
          <p className="eyebrow">No-secret payload examples</p>
          <h2>Operators can validate the post-run candidate before protected persistence.</h2>
          <p className="section-copy">
            These examples are shape references only. Replace IDs after the human AAL2 workflow completes, then POST the
            candidate to {summary.apiRoute}. The bridge never accepts tokens, PHI, payer data, approvals, reports, or
            production credentials.
          </p>
        </div>
        <div className="principle-grid">
          <article>
            <span>Sales Demo Session QA</span>
            <h3>Candidate payload</h3>
            <JsonBlock value={salesPayload} />
          </article>
          <article>
            <span>Authority Reference QA</span>
            <h3>Candidate payload</h3>
            <JsonBlock value={authorityPayload} />
          </article>
        </div>
      </section>

      <section className="section-band" aria-label="QA completion bridge blocked claims">
        <div className="section-heading">
          <p className="eyebrow">Blocked claims</p>
          <h2>Completion readiness is not clinical, security, legal, reimbursement, or production authority.</h2>
        </div>
        <div className="layer-list">
          {summary.blockedClaims.map((claim, index) => (
            <div className="layer-row" key={claim}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{claim}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
