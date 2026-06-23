import Link from "next/link";
import { getApprovalsReadinessSummary } from "../lib/approvalsReadiness";

export const metadata = {
  title: "SCRIMED Approvals Readiness",
  description:
    "SCRIMED approvals readiness ladder for public operations, HIPAA/BAA, SOC 2, FDA/CDS/SaMD, ONC, state care-delivery, and buyer release gates."
};

export default function ApprovalsReadinessPage() {
  const summary = getApprovalsReadinessSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">Approvals Readiness</p>
        <h1>SCRIMED can operate publicly while future approvals stay gated and evidence-led.</h1>
        <p className="hero-text">
          This ladder keeps agents, systems, claims, buyer proof, PHI, security assurance, FDA/CDS/SaMD,
          ONC, and state care-delivery questions organized without pretending approvals are complete.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Approvals Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/clinical-authority-readiness">Clinical Authority</Link>
          <Link className="secondary-action" href="/buyer-release-control-run">Buyer Release</Link>
          <Link className="secondary-action" href="/trust-center">Trust Center</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Approvals readiness summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Tracks</span>
          <strong>{summary.trackCount}</strong>
        </article>
        <article>
          <span>Public-ready</span>
          <strong>{summary.publicReadyCount}</strong>
        </article>
        <article>
          <span>Evidence build</span>
          <strong>{summary.evidenceBuildCount}</strong>
        </article>
        <article>
          <span>External review</span>
          <strong>{summary.externalReviewCount}</strong>
        </article>
        <article>
          <span>Blocked</span>
          <strong>{summary.blockedBeforeApprovalCount}</strong>
        </article>
        <article>
          <span>Agent controls</span>
          <strong>{summary.agentControlCount}</strong>
        </article>
        <article>
          <span>Processes</span>
          <strong>{summary.processCount}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Operating posture</p>
          <h2>Move publicly as operations intelligence; move clinically only after evidence and approvals.</h2>
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

      <section className="table-section" aria-label="Approval tracks">
        <div className="section-heading">
          <p className="eyebrow">Tracks</p>
          <h2>Each approval path has an owner, evidence gate, safe workaround, and hard boundary.</h2>
        </div>
        {summary.tracks.map((track) => (
          <article className="module-row" key={track.key}>
            <div>
              <span>{track.status}</span>
              <h2>{track.name}</h2>
            </div>
            <p>{track.operatingGoal}</p>
            <div>
              <strong>{track.nextAction}</strong>
              <ul className="compact-list">
                <li>Boundary: {track.currentBoundary}</li>
                <li>Workaround: {track.safeWorkaround}</li>
                <li>Owners: {track.accountableOwners.join(", ")}</li>
                <li>Proof: {track.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Agent approval controls">
        <div className="section-heading">
          <p className="eyebrow">Agents</p>
          <h2>Approval-aware agents can organize evidence, but humans retain authority.</h2>
        </div>
        {summary.agentControls.map((control) => (
          <article className="module-row" key={control.agent}>
            <div>
              <span>agent control</span>
              <h2>{control.agent}</h2>
            </div>
            <p>{control.mission}</p>
            <div>
              <strong>{control.evidenceOutput}</strong>
              <ul className="compact-list">
                <li>Allowed: {control.allowedNow.join(", ")}</li>
                <li>Blocked: {control.blockedActions.join(", ")}</li>
                <li>Checkpoint: {control.humanCheckpoint}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Approval processes">
        <div className="section-heading">
          <p className="eyebrow">Processes</p>
          <h2>The operating sequence keeps Scrimed moving without crossing approval lines early.</h2>
        </div>
        {summary.processes.map((process) => (
          <article className="module-row" key={process.phase}>
            <div>
              <span>process</span>
              <h2>{process.phase}</h2>
            </div>
            <p>{process.objective}</p>
            <div>
              <strong>{process.hardStop}</strong>
              <ul className="compact-list">
                <li>Entry: {process.entryCriteria.join(", ")}</li>
                <li>Exit: {process.exitCriteria.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
