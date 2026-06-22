import Link from "next/link";
import { getQaClaimGuardSummary } from "../lib/qaClaimGuard";

export const metadata = {
  title: "SCRIMED QA Claim Guard",
  description:
    "Current-state claim control for SCRIMED manual AAL2 QA posture, buyer proof language, and blocked authority claims."
};

export default function QaClaimGuardPage() {
  const summary = getQaClaimGuardSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/qa-evidence">QA Evidence</Link>
        <p className="eyebrow">QA Claim Guard</p>
        <h1>SCRIMED now has a claim guard for buyer, investor, sales, and operator language.</h1>
        <p className="hero-text">
          Claim Guard keeps current language bounded to synthetic, no-secret, activation-ready proof until retained
          packet hashes are visible and Proof Promotion allows packet-backed language.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Claim Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href={summary.launchKitRoute}>Launch Kit</Link>
          <Link className="secondary-action" href={summary.completionBridgeRoute}>Completion Bridge</Link>
          <Link className="secondary-action" href="/qa-activation-seal">Activation Seal</Link>
          <Link className="secondary-action" href={summary.proofPromotionRoute}>Proof Promotion</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="QA claim guard summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Claim posture</span>
          <strong>{summary.buyerClaimPosture}</strong>
        </article>
        <article>
          <span>Rules</span>
          <strong>{summary.ruleCount}</strong>
        </article>
        <article>
          <span>Safe claims</span>
          <strong>{summary.safeCurrentClaimCount}</strong>
        </article>
        <article>
          <span>Packet-gated</span>
          <strong>{summary.retainedPacketClaimCount}</strong>
        </article>
        <article>
          <span>Blocked claims</span>
          <strong>{summary.blockedAuthorityClaimCount}</strong>
        </article>
        <article>
          <span>Review triggers</span>
          <strong>{summary.reviewTriggerCount}</strong>
        </article>
        <article>
          <span>Authority</span>
          <strong>guidance only</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>Claim guidance is not legal approval, certification, clinical authority, or retained proof.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.rules.map((rule, index) => (
            <div className="layer-row" key={rule.rule}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{rule.rule}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="QA claim guard rules">
        <div className="section-heading">
          <p className="eyebrow">Claim rules</p>
          <h2>Every claim is routed to current-safe, packet-required, blocked, or review-required language.</h2>
        </div>
        {summary.rules.map((rule) => (
          <article className="module-row" key={rule.rule}>
            <div>
              <span>{rule.state}</span>
              <h2>{rule.rule}</h2>
            </div>
            <p>{rule.appliesWhen}</p>
            <div>
              <strong>{rule.requiredEvidence}</strong>
              <ul className="compact-list">
                <li>Safer language: {rule.saferLanguage}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="QA claim guard language inventory">
        <div className="section-heading">
          <p className="eyebrow">Language inventory</p>
          <h2>Use the safe current claims now; hold packet-backed and authority claims until evidence exists.</h2>
        </div>
        <div className="principle-grid">
          <article>
            <span>Safe current claims</span>
            <h3>Allowed now</h3>
            <ul className="compact-list">
              {summary.safeCurrentClaims.map((claim) => (
                <li key={claim}>{claim}</li>
              ))}
            </ul>
          </article>
          <article>
            <span>Packet-gated claims</span>
            <h3>Require retained packet hash</h3>
            <ul className="compact-list">
              {summary.retainedPacketClaims.map((claim) => (
                <li key={claim}>{claim}</li>
              ))}
            </ul>
          </article>
          <article>
            <span>Blocked authority claims</span>
            <h3>Require external authority</h3>
            <ul className="compact-list">
              {summary.blockedAuthorityClaims.map((claim) => (
                <li key={claim}>{claim}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="section-band" aria-label="QA claim guard review triggers">
        <div className="section-heading">
          <p className="eyebrow">Review triggers</p>
          <h2>External-use language must move through qualified release controls before distribution.</h2>
        </div>
        <div className="layer-list">
          {summary.reviewTriggers.map((trigger, index) => (
            <div className="layer-row" key={trigger}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{trigger}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
