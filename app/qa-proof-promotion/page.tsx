import Link from "next/link";
import { getQaProofPromotionSummary } from "../lib/qaProofPromotion";

export const metadata = {
  title: "SCRIMED Manual QA Proof Promotion",
  description:
    "Retained-packet promotion rules for SCRIMED manual AAL2 synthetic QA evidence, Buyer Diligence exports, and blocked clinical or compliance claims."
};

export default function QaProofPromotionPage() {
  const summary = getQaProofPromotionSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/qa-run-control">Run Control</Link>
        <p className="eyebrow">Manual QA Proof Promotion</p>
        <h1>SCRIMED now has a clear rule for when manual AAL2 QA evidence can become buyer proof.</h1>
        <p className="hero-text">
          Proof Promotion keeps the current state honest: activation-ready until a protected no-secret packet hash is
          retained, buyer-ready only after packet visibility, and still blocked for clinical, PHI, security,
          reimbursement, or production authorization claims.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Promotion Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/qa-run-control">Run Control</Link>
          <Link className="secondary-action" href="/qa-launch-kit">Launch Kit</Link>
          <Link className="secondary-action" href="/qa-completion-bridge">Completion Bridge</Link>
          <Link className="secondary-action" href="/qa-claim-guard">Claim Guard</Link>
          <Link className="secondary-action" href="/qa-activation-seal">Activation Seal</Link>
          <Link className="secondary-action" href="/qa-buyer-proof-release">Buyer Proof Release</Link>
          <Link className="secondary-action" href="/pilot-workspace/access">Protected Workspace</Link>
          <Link className="secondary-action" href="/boundary-resolution">Boundary Register</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Manual QA proof promotion summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Decision</span>
          <strong>{summary.promotionDecisionState}</strong>
        </article>
        <article>
          <span>Promotion</span>
          <strong>{summary.promotionAllowed ? "allowed" : "blocked"}</strong>
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
          <strong>{summary.requiredEvidence.length}</strong>
        </article>
        <article>
          <span>Blocked claims</span>
          <strong>{summary.blockedClaims.length}</strong>
        </article>
        <article>
          <span>Boundary</span>
          <strong>synthetic only</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Current decision</p>
          <h2>{summary.decision.buyerSafeClaim}</h2>
          <p className="section-copy">{summary.decision.buyerProofLanguage}</p>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.claimRules.map((rule, index) => (
            <div className="layer-row" key={rule}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{rule}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Manual QA proof promotion rules">
        <div className="section-heading">
          <p className="eyebrow">Promotion rules</p>
          <h2>Buyer proof changes only after a retained no-secret packet hash is visible.</h2>
        </div>
        {summary.rules.map((rule) => (
          <article className="module-row" key={rule.rule}>
            <div>
              <span>{rule.status}</span>
              <h2>{rule.rule}</h2>
            </div>
            <p>{rule.beforePromotion}</p>
            <div>
              <strong>{rule.afterPromotion}</strong>
              <ul className="compact-list">
                <li>{rule.boundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Manual QA proof required evidence">
        <div className="section-heading">
          <p className="eyebrow">Required evidence</p>
          <h2>The packet must contain only safe metadata before buyer proof can reference it.</h2>
        </div>
        {summary.requiredEvidence.map((evidence, index) => (
          <article className="module-row" key={evidence}>
            <div>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h2>{evidence}</h2>
            </div>
            <p>Required for retained synthetic QA proof promotion.</p>
            <strong>Do not add secrets, PHI, clinical records, approvals, contracts, or payer data.</strong>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Manual QA proof blocked claims">
        <div className="section-heading">
          <p className="eyebrow">Blocked claims</p>
          <h2>Retained QA proof improves diligence; it does not unlock production clinical authority.</h2>
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
