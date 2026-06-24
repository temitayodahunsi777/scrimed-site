import Link from "next/link";
import { getNavigationAuditSummary } from "../lib/navigationAudit";

export const metadata = {
  title: "SCRIMED Navigation Audit",
  description:
    "SCRIMED navigation audit for page routes, API route patterns, smoke coverage, protected fail-closed checks, and retained approval boundaries."
};

export default function NavigationAuditPage() {
  const summary = getNavigationAuditSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/hub">Hub</Link>
        <p className="eyebrow">Navigation Audit</p>
        <h1>SCRIMED keeps its operating surfaces discoverable, smoke-covered, and boundary-aware.</h1>
        <p className="hero-text">
          This route organizes the current page inventory, API route pattern count, navigation groups,
          public smoke coverage, protected fail-closed checks, and the remaining AAL2 or external-review
          boundaries that cannot be solved by code alone.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Audit Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/product">Product Console</Link>
          <Link className="secondary-action" href="/release-continuity">Release Continuity</Link>
          <Link className="secondary-action" href="/pilot-workspace/access">Protected Workspace</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Navigation audit summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Page routes</span>
          <strong>{summary.sourceTotals.pageRouteCount}</strong>
        </article>
        <article>
          <span>API handlers</span>
          <strong>{summary.sourceTotals.apiRoutePatternCount}</strong>
        </article>
        <article>
          <span>Dynamic pages</span>
          <strong>{summary.sourceTotals.dynamicPageRouteCount}</strong>
        </article>
        <article>
          <span>Groups</span>
          <strong>{summary.coverage.navigationGroupCount}</strong>
        </article>
        <article>
          <span>Audited links</span>
          <strong>{summary.coverage.auditedNavigationRouteCount}</strong>
        </article>
        <article>
          <span>Smoke pages</span>
          <strong>{summary.coverage.smokeCoveredHtmlRouteCount}</strong>
        </article>
        <article>
          <span>Open bottlenecks</span>
          <strong>{summary.operatorRequiredBottleneckCount + summary.externalReviewBottleneckCount}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>Navigation proof is a route-control layer, not approval authority.</h2>
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

      <section className="table-section" aria-label="Navigation groups">
        <div className="section-heading">
          <p className="eyebrow">Route groups</p>
          <h2>Every major operating surface now has an owner, proof posture, and retained boundary.</h2>
        </div>
        {summary.groups.map((group) => (
          <article className="module-row" key={group.name}>
            <div>
              <span>{group.auditStatus}</span>
              <h2>{group.name}</h2>
            </div>
            <p>{group.purpose}</p>
            <div>
              <strong>{group.evidence}</strong>
              <ul className="compact-list">
                <li>Owner: {group.owner}</li>
                <li>Boundary: {group.retainedBoundary}</li>
                <li>Routes: {group.routes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Navigation bottlenecks">
        <div className="section-heading">
          <p className="eyebrow">Bottlenecks</p>
          <h2>Limitations are explicit, contained, and assigned instead of hidden inside navigation.</h2>
        </div>
        {summary.bottlenecks.map((bottleneck) => (
          <article className="module-row" key={bottleneck.name}>
            <div>
              <span>{bottleneck.status}</span>
              <h2>{bottleneck.name}</h2>
            </div>
            <p>{bottleneck.impact}</p>
            <div>
              <strong>{bottleneck.workaround}</strong>
              <ul className="compact-list">
                <li>Owner: {bottleneck.owner}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Page route inventory">
        <div className="section-heading">
          <p className="eyebrow">Page inventory</p>
          <h2>Current App Router page routes under audit.</h2>
        </div>
        <ul className="compact-list route-inventory-list">
          {summary.pageRouteInventory.map((route) => (
            <li key={route}>{route}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
