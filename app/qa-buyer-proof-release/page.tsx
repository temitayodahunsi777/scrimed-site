import Link from "next/link";
import { getQaBuyerProofReleaseSummary } from "../lib/qaBuyerProofRelease";

export const metadata = {
  title: "SCRIMED QA Buyer Proof Release",
  description:
    "Protected retained-packet release gate for SCRIMED manual AAL2 synthetic QA evidence, Buyer Diligence exports, and hard authority boundaries."
};

export default function QaBuyerProofReleasePage() {
  const summary = getQaBuyerProofReleaseSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/qa-evidence">QA Evidence</Link>
        <p className="eyebrow">QA Buyer Proof Release</p>
        <h1>SCRIMED now has a single protected go/no-go gate before retained QA proof enters Buyer Diligence.</h1>
        <p className="hero-text">
          Buyer Proof Release ties retained Manual QA Evidence, Proof Promotion, Activation Seal, and Claim Guard into
          one decision. Public checks remain candidate-only; protected workspace verification is required before Buyer
          Diligence references retained manual AAL2 synthetic QA proof.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Release Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect Public API</a>
          <Link className="secondary-action" href="/qa-manual-execution-console">Execution Console</Link>
          <Link className="secondary-action" href="/qa-human-run-packet">Human Run Packet</Link>
          <Link className="secondary-action" href="/qa-completion-bridge">Completion Bridge</Link>
          <Link className="secondary-action" href="/qa-activation-seal">Activation Seal</Link>
          <Link className="secondary-action" href="/qa-proof-promotion">Proof Promotion</Link>
          <Link className="secondary-action" href="/qa-claim-guard">Claim Guard</Link>
          <Link className="secondary-action" href="/pilot-workspace/access">Protected Workspace</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED QA buyer proof release summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Decision</span>
          <strong>{summary.releaseDecisionState}</strong>
        </article>
        <article>
          <span>Buyer export</span>
          <strong>{summary.buyerDiligenceExportAllowed ? "allowed" : "blocked"}</strong>
        </article>
        <article>
          <span>Protected check</span>
          <strong>{summary.protectedVerificationRequired ? "required" : "passed"}</strong>
        </article>
        <article>
          <span>Rules</span>
          <strong>{summary.ruleCount}</strong>
        </article>
        <article>
          <span>Evidence fields</span>
          <strong>{summary.requiredEvidenceCount}</strong>
        </article>
        <article>
          <span>Hard stops</span>
          <strong>{summary.hardStopCount}</strong>
        </article>
        <article>
          <span>Blocked claims</span>
          <strong>{summary.blockedClaimCount}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Current decision</p>
          <h2>{summary.decision.buyerSafeClaim}</h2>
          <p className="section-copy">{summary.decision.nextAction}</p>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>protected</span>
            <strong>{summary.protectedReleaseRoute}</strong>
          </div>
          <div className="layer-row">
            <span>packet</span>
            <strong>{summary.buyerDiligencePacketRoute}</strong>
          </div>
          <div className="layer-row">
            <span>public</span>
            <strong>candidate validation only</strong>
          </div>
        </div>
      </section>

      <section className="table-section" aria-label="SCRIMED QA buyer proof release criteria">
        <div className="section-heading">
          <p className="eyebrow">Release criteria</p>
          <h2>Buyer proof release stays locked until protected retained evidence and language gates align.</h2>
        </div>
        {summary.decision.releaseCriteria.map((criterion) => (
          <article className="module-row" key={criterion.id}>
            <div>
              <span>{criterion.status}</span>
              <h2>{criterion.name}</h2>
            </div>
            <p>{criterion.evidence}</p>
            <div>
              <strong>{criterion.nextAction}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED QA buyer proof release required evidence">
        <div className="section-heading">
          <p className="eyebrow">Required evidence</p>
          <h2>The release packet can carry safe retained metadata, not secrets, PHI, or authority claims.</h2>
        </div>
        {summary.requiredEvidence.map((evidence, index) => (
          <article className="module-row" key={evidence}>
            <div>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h2>{evidence}</h2>
            </div>
            <p>Required before packet-backed QA proof appears in protected Buyer Diligence.</p>
            <strong>Public release, live care, PHI, reimbursement, certification, connector, and production authority stay separately gated.</strong>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="SCRIMED QA buyer proof release hard stops">
        <div className="section-heading">
          <p className="eyebrow">Hard stops</p>
          <h2>These signals keep buyer proof release blocked even when a retained packet exists.</h2>
        </div>
        <div className="layer-list">
          {summary.hardStops.map((stop, index) => (
            <div className="layer-row" key={stop}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{stop}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
