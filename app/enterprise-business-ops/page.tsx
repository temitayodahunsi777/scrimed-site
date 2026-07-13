import Link from "next/link";
import { getEnterpriseBusinessOpsSummary } from "../lib/enterpriseBusinessOperations";

export const metadata = {
  title: "SCRIMED Enterprise Business Operations",
  description:
    "SCRIMED enterprise business operations control plane for revenue capability, margin discipline, legal operations, finance/accounting controls, tax-awareness routing, deal approvals, and audit evidence."
};

export default function EnterpriseBusinessOpsPage() {
  const summary = getEnterpriseBusinessOpsSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/hub">Hub</Link>
        <p className="eyebrow">Enterprise Business Operations</p>
        <h1>SCRIMED now has a revenue, margin, legal, finance, and accounting control plane.</h1>
        <p className="hero-text">
          This lane turns enterprise selling into governed quote-to-contract execution, price-floor discipline, counsel review, accounting and tax routing, billing readiness, margin controls, and blocked claims before commitments reach buyers.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Business Ops Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/growth-engine">Growth Engine</Link>
          <Link className="secondary-action" href="/capital-vitality">Capital Vitality</Link>
          <Link className="secondary-action" href="/public-market-readiness">Public Market Readiness</Link>
          <Link className="secondary-action" href="/sales-operations">Sales Operations</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Enterprise business operations summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Sources</span>
          <strong>{summary.sourceCount}</strong>
        </article>
        <article>
          <span>Revenue capabilities</span>
          <strong>{summary.revenueCapabilityCount}</strong>
        </article>
        <article>
          <span>Margin controls</span>
          <strong>{summary.marginControlCount}</strong>
        </article>
        <article>
          <span>Team roles</span>
          <strong>{summary.teamRoleCount}</strong>
        </article>
        <article>
          <span>Enterprise controls</span>
          <strong>{summary.enterpriseControlCount}</strong>
        </article>
        <article>
          <span>Cadences</span>
          <strong>{summary.operatingCadenceCount}</strong>
        </article>
        <article>
          <span>Profit levers</span>
          <strong>{summary.profitLeverCount}</strong>
        </article>
        <article>
          <span>Blocked claims</span>
          <strong>{summary.blockedClaimCount}</strong>
        </article>
        <article>
          <span>Proof routes</span>
          <strong>{summary.proofRouteCount}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>Enterprise business maturity only works when authority is explicit.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>01</span>
            <strong>{summary.authority.legalAuthority}</strong>
          </div>
          <div className="layer-row">
            <span>02</span>
            <strong>{summary.authority.accountingAuthority}</strong>
          </div>
          <div className="layer-row">
            <span>03</span>
            <strong>{summary.authority.taxAuthority}</strong>
          </div>
          <div className="layer-row">
            <span>04</span>
            <strong>{summary.authority.profitAuthority}</strong>
          </div>
          <div className="layer-row">
            <span>05</span>
            <strong>{summary.authority.contractAuthority}</strong>
          </div>
        </div>
      </section>

      <section className="table-section" aria-label="Official and internal business operations sources">
        <div className="section-heading">
          <p className="eyebrow">Source-backed posture</p>
          <h2>Legal, accounting, tax, control, and assurance signals are mapped to SCRIMED operating work.</h2>
          <p className="section-copy">
            {summary.nextBusinessMove}
          </p>
        </div>
        {summary.sources.map((source) => (
          <article className="module-row" key={source.name}>
            <div>
              <span>{source.sourceType}</span>
              <h2>{source.name}</h2>
            </div>
            <p>{source.signal}</p>
            <div>
              <strong>{source.scrimedApplication}</strong>
              <ul className="compact-list">
                <li>Reviewed: {source.reviewedAt}</li>
                <li>Source: {source.url}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Revenue capabilities">
        <div className="section-heading">
          <p className="eyebrow">Revenue capabilities</p>
          <h2>Enterprise revenue improves when every motion has a margin reason and retained gate.</h2>
        </div>
        {summary.revenueCapabilities.map((capability) => (
          <article className="module-row" key={capability.slug}>
            <div>
              <span>{capability.status}</span>
              <h2>{capability.name}</h2>
            </div>
            <p>{capability.revenueMotion}</p>
            <div>
              <strong>{capability.marginContribution}</strong>
              <ul className="compact-list">
                <li>Buyer: {capability.buyer}</li>
                <li>Gate: {capability.retainedGate}</li>
                <li>Next: {capability.nextAction}</li>
                <li>Proof routes: {capability.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Margin controls">
        <div className="section-heading">
          <p className="eyebrow">Margin discipline</p>
          <h2>Profit protection is built into price, scope, billing, support, model cost, and contract review.</h2>
        </div>
        {summary.marginControls.map((control) => (
          <article className="module-row" key={control.control}>
            <div>
              <span>{control.status}</span>
              <h2>{control.control}</h2>
            </div>
            <p>{control.marginRisk}</p>
            <div>
              <strong>{control.operatingPolicy}</strong>
              <ul className="compact-list">
                <li>Owner: {control.owner}</li>
                <li>Hard stops: {control.blockedUntilReviewed.join(", ")}</li>
                <li>Evidence routes: {control.evidenceRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Enterprise legal finance accounting tax roles">
        <div className="section-heading">
          <p className="eyebrow">Team model</p>
          <h2>World-class business execution needs named authority, not vague review.</h2>
        </div>
        {summary.teamRoles.map((role) => (
          <article className="module-row" key={role.role}>
            <div>
              <span>{role.team}</span>
              <h2>{role.role}</h2>
            </div>
            <p>{role.responsibility}</p>
            <div>
              <strong>{role.approvalAuthority}</strong>
              <ul className="compact-list">
                <li>Status: {role.status}</li>
                <li>Escalate: {role.escalationTrigger}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Enterprise controls and profit levers">
        <div className="section-heading">
          <p className="eyebrow">Controls and levers</p>
          <h2>Controls prevent loss; profit levers compound the right work.</h2>
        </div>
        {summary.enterpriseControls.map((control) => (
          <article className="module-row" key={control.control}>
            <div>
              <span>control</span>
              <h2>{control.control}</h2>
            </div>
            <p>{control.purpose}</p>
            <div>
              <strong>{control.owner}</strong>
              <ul className="compact-list">
                <li>Evidence: {control.evidence.join(", ")}</li>
                <li>Hard stops: {control.hardStops.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
        {summary.profitLevers.map((lever) => (
          <article className="module-row" key={lever.lever}>
            <div>
              <span>profit lever</span>
              <h2>{lever.lever}</h2>
            </div>
            <p>{lever.useCase}</p>
            <div>
              <strong>{lever.marginPath}</strong>
              <ul className="compact-list">
                <li>Control: {lever.requiredControl}</li>
                <li>Blocked claim: {lever.blockedClaim}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Operating cadences">
        <div className="section-heading">
          <p className="eyebrow">Operating cadence</p>
          <h2>Enterprise maturity is reviewed every week, month, quarter, and year.</h2>
        </div>
        {summary.operatingCadences.map((cadence) => (
          <article className="module-row" key={cadence.cadence}>
            <div>
              <span>{cadence.cadence}</span>
              <h2>{cadence.owner}</h2>
            </div>
            <p>{cadence.decisionOutput}</p>
            <div>
              <strong>{cadence.retainedBoundary}</strong>
              <ul className="compact-list">
                <li>Signals: {cadence.reviewedSignals.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
