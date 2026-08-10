import Link from "next/link";
import { getPr25ReviewerDashboardSummary } from "../../lib/postPr25PlatformAdvance";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "PR #25 Exact-Head Review | SCRIMED Work",
  description:
    "Read-only exact-head review summary for the frozen SCRIMED PR #25 candidate."
};

export default function ScrimedWorkReviewPage() {
  const summary = getPr25ReviewerDashboardSummary();
  const candidate = summary.frozenCandidate;

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/scrimed-work">
          SCRIMED Work
        </Link>
        <p className="eyebrow">Exact-Head Reviewer Brief</p>
        <h1>Review the frozen PR #25 candidate without changing its authority.</h1>
        <p className="hero-text">
          This read-only view binds the review target to one commit and its evidence
          fingerprints. It cannot approve, merge, deploy, migrate, process PHI, activate a
          customer, or enable clinical, payer, EHR, or device actions.
        </p>
        <div className="hero-actions" aria-label="Reviewer resources">
          <Link href="/api/scrimed-work/review">Inspect Review API</Link>
          <Link href="/validation-evidence">Validation Evidence</Link>
          <Link href="/approvals-readiness">Approval Boundaries</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Frozen candidate status">
        <article>
          <span>Release state</span>
          <strong>{summary.releaseState.currentState}</strong>
        </article>
        <article>
          <span>Review</span>
          <strong>{summary.review.status}</strong>
        </article>
        <article>
          <span>Detached validation</span>
          <strong>
            {candidate.validation.detachedCleanStagesPassed}/
            {candidate.validation.detachedCleanStagesTotal}
          </strong>
        </article>
        <article>
          <span>GitHub Actions</span>
          <strong>
            {candidate.validation.githubActionsPassed}/
            {candidate.validation.githubActionsTotal}
          </strong>
        </article>
        <article>
          <span>Secret findings</span>
          <strong>{candidate.validation.secretScanFindings}</strong>
        </article>
        <article>
          <span>SBOM components</span>
          <strong>{candidate.validation.sbomComponents}</strong>
        </article>
        <article>
          <span>Review coverage</span>
          <strong>
            {candidate.validation.reviewCoverageFiles}/
            {candidate.validation.reviewCoverageTotal}
          </strong>
        </article>
        <article>
          <span>Merge preflight</span>
          <strong>{summary.mergeReadiness.status}</strong>
        </article>
      </section>

      <section
        className="section-band split-band exact-head-identity"
        aria-label="Exact candidate identity"
      >
        <div>
          <p className="eyebrow">Frozen identity</p>
          <h2>Every disposition must name this exact head.</h2>
        </div>
        <div>
          <p>
            Commit: <code>{candidate.headSha}</code>
          </p>
          <p>
            Candidate: <code>{candidate.fingerprints.candidate}</code>
          </p>
          <p>
            Source: <code>{candidate.fingerprints.source}</code>
          </p>
          <p>
            Validation: <code>{candidate.fingerprints.validation}</code>
          </p>
          <p>
            Review packet: <code>{candidate.fingerprints.reviewPacket}</code>
          </p>
          <p>
            SBOM: <code>{candidate.fingerprints.sbom}</code>
          </p>
        </div>
      </section>

      <section className="table-section" aria-label="Architecture deltas">
        {summary.architectureDeltas.map((delta, index) => (
          <article className="module-row" key={delta}>
            <div>
              <span>Delta {index + 1}</span>
              <h2>{delta}</h2>
            </div>
            <p>Review implementation and evidence in the frozen pull request.</p>
          </article>
        ))}
      </section>

      <section className="section-band split-band" aria-label="Safety boundaries">
        <div>
          <p className="eyebrow">Retained boundaries</p>
          <h2>Approval is for exact-head review only.</h2>
        </div>
        <div>
          {candidate.retainedBoundaries.map((boundary) => (
            <p key={boundary}>{boundary}</p>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Unresolved issues">
        {summary.unresolvedIssues.map((issue) => (
          <article className="module-row" key={issue}>
            <div>
              <span>Open</span>
              <h2>{issue}</h2>
            </div>
            <p>Fail closed until exact evidence or the named external action exists.</p>
          </article>
        ))}
      </section>

      <section className="section-band split-band" aria-label="Reviewer disposition">
        <div>
          <p className="eyebrow">Disposition vocabulary</p>
          <h2>The authoritative review remains outside this read-only page.</h2>
        </div>
        <div>
          {summary.review.allowedDispositions.map((disposition) => (
            <p key={disposition}>{disposition}</p>
          ))}
          <p>{summary.review.recommendedDisposition}</p>
        </div>
      </section>
    </main>
  );
}
