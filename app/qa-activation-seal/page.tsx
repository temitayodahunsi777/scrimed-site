import Link from "next/link";
import { getQaActivationSealSummary } from "../lib/qaActivationSeal";

export const metadata = {
  title: "SCRIMED QA Activation Seal",
  description:
    "Boundary-safe activation seal for manual AAL2 QA proof, protected packet visibility, and buyer diligence readiness."
};

export default function QaActivationSealPage() {
  const summary = getQaActivationSealSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/qa-evidence">QA Evidence</Link>
        <p className="eyebrow">QA Activation Seal</p>
        <h1>SCRIMED now has a final seal gate before packet-backed buyer proof language.</h1>
        <p className="hero-text">
          The seal separates candidate completeness from protected evidence visibility, keeping SCRIMED activation-ready
          until a human AAL2 run, protected packet hash, Proof Promotion, and Claim Guard all line up.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Seal Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href={summary.launchKitRoute}>Launch Kit</Link>
          <Link className="secondary-action" href={summary.completionBridgeRoute}>Completion Bridge</Link>
          <Link className="secondary-action" href={summary.claimGuardRoute}>Claim Guard</Link>
          <Link className="secondary-action" href={summary.proofPromotionRoute}>Proof Promotion</Link>
          <Link className="secondary-action" href="/qa-buyer-proof-release">Buyer Proof Release</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="QA activation seal summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Decision</span>
          <strong>{summary.decisionState}</strong>
        </article>
        <article>
          <span>Seal allowed</span>
          <strong>{summary.sealAllowed ? "yes" : "no"}</strong>
        </article>
        <article>
          <span>Buyer use</span>
          <strong>{summary.buyerUseAllowed ? "yes" : "no"}</strong>
        </article>
        <article>
          <span>Rules</span>
          <strong>{summary.ruleCount}</strong>
        </article>
        <article>
          <span>Hard stops</span>
          <strong>{summary.hardStopRuleCount}</strong>
        </article>
        <article>
          <span>Evidence fields</span>
          <strong>{summary.requiredEvidenceCount}</strong>
        </article>
        <article>
          <span>Blocked claims</span>
          <strong>{summary.hardStopClaimCount}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>Public checks cannot create a sealed state; protected packet visibility is required.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>01</span>
            <strong>{summary.launchKitStatus}</strong>
          </div>
          <div className="layer-row">
            <span>02</span>
            <strong>{summary.completionBridgeStatus}</strong>
          </div>
          <div className="layer-row">
            <span>03</span>
            <strong>{summary.claimGuardStatus}</strong>
          </div>
          <div className="layer-row">
            <span>04</span>
            <strong>{summary.proofPromotionStatus}</strong>
          </div>
        </div>
      </section>

      <section className="table-section" aria-label="QA activation seal decision">
        <div className="section-heading">
          <p className="eyebrow">Current decision</p>
          <h2>{summary.decision.buyerSafeClaim}</h2>
          <p className="section-copy">{summary.decision.nextAction}</p>
        </div>
        <article className="module-row">
          <div>
            <span>{summary.decision.state}</span>
            <h2>Seal remains buyer-safe because it is unsealed until retained proof is visible.</h2>
          </div>
          <p>Latest packet hash: {summary.decision.latestPacketHash}</p>
          <div>
            <strong>Missing evidence</strong>
            <ul className="compact-list">
              {summary.decision.missingEvidence.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </article>
      </section>

      <section className="table-section" aria-label="QA activation seal rules">
        <div className="section-heading">
          <p className="eyebrow">Seal rules</p>
          <h2>The seal requires protected packet evidence and keeps clinical authority blocked.</h2>
        </div>
        {summary.rules.map((rule) => (
          <article className="module-row" key={rule.rule}>
            <div>
              <span>{rule.status}</span>
              <h2>{rule.rule}</h2>
            </div>
            <p>{rule.evidenceRequired}</p>
            <div>
              <strong>{rule.passSignal}</strong>
              <ul className="compact-list">
                <li>Fail closed: {rule.failClosedIf}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="QA activation seal evidence">
        <div className="section-heading">
          <p className="eyebrow">Required evidence</p>
          <h2>Buyer proof should not move past activation-ready language until every item is visible.</h2>
        </div>
        <div className="principle-grid">
          <article>
            <span>Required evidence</span>
            <h3>{summary.requiredEvidenceCount} checks</h3>
            <ul className="compact-list">
              {summary.requiredEvidence.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article>
            <span>Hard-stop claims</span>
            <h3>Blocked</h3>
            <ul className="compact-list">
              {summary.hardStopClaims.map((claim) => (
                <li key={claim}>{claim}</li>
              ))}
            </ul>
          </article>
          <article>
            <span>Safe language</span>
            <h3>Current posture</h3>
            <p>{summary.buyerSafeCurrentLanguage}</p>
          </article>
        </div>
      </section>
    </main>
  );
}
