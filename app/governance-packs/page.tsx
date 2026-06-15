import Link from "next/link";
import { getAgentWorkspaceGovernancePacksSummary } from "../lib/agentWorkspaceGovernancePacks";

export const metadata = {
  title: "SCRIMED Governance Workflow Packs",
  description:
    "Customer-tailorable SCRIMED Agent Workspace governance workflow packs for retention, legal review, legal hold, incident export, evidence artifacts, and blocked claims."
};

export default function GovernancePacksPage() {
  const summary = getAgentWorkspaceGovernancePacksSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/agent-workspace">Agent Workspace</Link>
        <p className="eyebrow">Governance workflow packs</p>
        <h1>Customer-tailored retention, legal-review, legal-hold, and incident-export operating packs.</h1>
        <p className="hero-text">
          SCRIMED governance workflow packs help enterprise buyers translate synthetic pilot evidence into retained,
          human-reviewed operational controls while legal, privacy, security, and production approvals remain explicit.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>
            Download Governance Packs Brief
          </a>
          <a className="secondary-action" href={summary.apiRoute}>
            Inspect Governance Packs API
          </a>
          <Link className="secondary-action" href="/pilot-workspace">
            Open Protected Workspace
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Governance packs summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Packs</span>
          <strong>{summary.packCount}</strong>
        </article>
        <article>
          <span>Boundary</span>
          <strong>synthetic only</strong>
        </article>
        <article>
          <span>CI secret</span>
          <strong>{summary.ciSecretContract.bearerTokenSecret}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Product boundary</p>
          <h2>Governance packs are reusable operating templates, not legal conclusions.</h2>
          <p className="section-copy">{summary.boundary}</p>
          <p className="section-copy">{summary.nextImplementationStep}</p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>01</span>
            <strong>Attach pack to buyer intake and protected pilot scope.</strong>
          </div>
          <div className="layer-row">
            <span>02</span>
            <strong>Tailor retention, legal review, incident owner, and reviewer authority.</strong>
          </div>
          <div className="layer-row">
            <span>03</span>
            <strong>Record approved actions in the Agent Workspace governance ledger.</strong>
          </div>
          <div className="layer-row">
            <span>04</span>
            <strong>Release proof packets and incident exports only through audited routes.</strong>
          </div>
        </div>
      </section>

      <section className="table-section" aria-label="Customer governance workflow packs">
        <div className="section-heading">
          <p className="eyebrow">Packs</p>
          <h2>Each pack defines customer inputs, retention template, legal review, incident export, evidence, boundaries, and blocked claims.</h2>
        </div>
        {summary.packs.map((pack) => (
          <article className="module-row" key={pack.slug}>
            <div>
              <span>{pack.status}</span>
              <h2>{pack.name}</h2>
            </div>
            <p>
              {pack.buyerSegment}. {pack.scope}
            </p>
            <div>
              <strong>{pack.retentionPolicyTemplate.defaultDuration}</strong>
              <ul className="compact-list">
                <li>Inputs: {pack.customerInputsRequired.join(", ")}</li>
                <li>Approvals: {pack.legalReviewWorkflow.requiredApprovals.join(", ")}</li>
                <li>Release gate: {pack.incidentExportWorkflow.releaseGate}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="CI smoke contract">
        <div className="section-heading">
          <p className="eyebrow">Authenticated smoke contract</p>
          <h2>CI is ready to enforce the authenticated governance-ledger path once the approved AAL2 tenant token is stored.</h2>
        </div>
        <div className="principle-grid">
          <article>
            <span>secret</span>
            <h3>{summary.ciSecretContract.bearerTokenSecret}</h3>
            <p>Tenant-admin or pilot-lead AAL2 bearer token used only by the CI smoke workflow.</p>
          </article>
          <article>
            <span>variable</span>
            <h3>{summary.ciSecretContract.optionalBaseUrlVariable}</h3>
            <p>Optional override for the app base URL. The smoke script defaults to app.scrimedsolutions.com.</p>
          </article>
          <article>
            <span>variable</span>
            <h3>{summary.ciSecretContract.optionalWorkspaceSlugVariable}</h3>
            <p>Optional override for the protected workspace slug. The default workspace is atlas-synthetic-evaluation.</p>
          </article>
          <article>
            <span>flag</span>
            <h3>{summary.ciSecretContract.requiredSmokeFlag}</h3>
            <p>When enabled, the smoke script fails if the authenticated token is missing instead of skipping.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
