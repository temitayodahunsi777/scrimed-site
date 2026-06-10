import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getReadinessDomainBySlug,
  getReadinessDomains
} from "../../lib/enterpriseReadiness";

export function generateStaticParams() {
  return getReadinessDomains().map((domain) => ({ slug: domain.slug }));
}

export default async function ReadinessDomainPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const domain = getReadinessDomainBySlug(slug);

  if (!domain) {
    notFound();
  }

  const active = domain.requirements.filter((item) => item.state === "active-control").length;
  const decisions = domain.requirements.filter((item) => item.state === "decision-required").length;
  const external = domain.requirements.filter(
    (item) => item.state === "external-review-required"
  ).length;

  return (
    <main>
      <section className="page-hero trust-hero">
        <Link className="back-link" href="/trust-center">Trust Center</Link>
        <p className="eyebrow">{domain.status}</p>
        <h1>{domain.name}</h1>
        <p className="hero-text">{domain.objective}</p>
      </section>

      <section className="section-band hub-summary" aria-label={`${domain.name} summary`}>
        <article>
          <span>Owner</span>
          <strong>{domain.owner}</strong>
        </article>
        <article>
          <span>Requirements</span>
          <strong>{domain.requirements.length}</strong>
        </article>
        <article>
          <span>Active controls</span>
          <strong>{active}</strong>
        </article>
        <article>
          <span>Decisions / external</span>
          <strong>{decisions} / {external}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Current posture</p>
          <h2>{domain.currentPosture}</h2>
        </div>
        <div>
          <p className="eyebrow">Public commitments</p>
          <ul className="compact-list">
            {domain.publicCommitments.map((commitment) => <li key={commitment}>{commitment}</li>)}
          </ul>
        </div>
      </section>

      <section className="table-section" aria-label={`${domain.name} requirements`}>
        <div className="section-heading">
          <p className="eyebrow">Control register</p>
          <h2>Evidence, required actions, and launch gates stay linked.</h2>
        </div>
        {domain.requirements.map((requirement) => (
          <article className="module-row" key={requirement.id}>
            <div>
              <span>{requirement.state}</span>
              <h2>{requirement.name}</h2>
            </div>
            <p>{requirement.currentEvidence}</p>
            <div>
              <strong>{requirement.requiredAction}</strong>
              <ul className="compact-list">
                <li>Owner: {requirement.owner}</li>
                <li>Launch gate: {requirement.launchGate}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Prohibited actions</p>
          <h2>These actions remain blocked.</h2>
          <ul className="compact-list">
            {domain.prohibitedActions.map((action) => <li key={action}>{action}</li>)}
          </ul>
        </div>
        <div>
          <p className="eyebrow">Authoritative references</p>
          {domain.sourceUrls.length > 0 ? (
            <div className="layer-list">
              {domain.sourceUrls.map((url, index) => (
                <a className="layer-row" href={url} key={url}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{new URL(url).hostname}</strong>
                </a>
              ))}
            </div>
          ) : (
            <p className="section-copy">
              Internal brand standards and qualified external review are required for this domain.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
