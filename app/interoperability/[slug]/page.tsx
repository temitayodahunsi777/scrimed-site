import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getInteroperabilityStandardBySlug,
  interoperabilityStandards
} from "../../lib/interoperabilityStandards";
import { integrationContracts } from "../../lib/integrationContracts";

export function generateStaticParams() {
  return interoperabilityStandards.map((standard) => ({ slug: standard.slug }));
}

export default async function InteroperabilityStandardPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const standard = getInteroperabilityStandardBySlug(slug);

  if (!standard) {
    notFound();
  }

  const linkedContracts = integrationContracts.filter((contract) =>
    contract.standardIds.includes(standard.slug)
  );

  return (
    <main>
      <section className="page-hero trust-hero">
        <Link className="back-link" href="/interoperability">Interoperability</Link>
        <p className="eyebrow">{standard.kind} standard</p>
        <h1>{standard.acronym}: {standard.name}</h1>
        <p className="hero-text">{standard.implementationTarget}</p>
      </section>

      <section className="section-band hub-summary" aria-label="Standard summary">
        <article>
          <span>Status</span>
          <strong>{standard.status}</strong>
        </article>
        <article>
          <span>Steward</span>
          <strong>{standard.steward}</strong>
        </article>
        <article>
          <span>Profiles</span>
          <strong>{standard.versionsAndProfiles.length}</strong>
        </article>
        <article>
          <span>Linked contracts</span>
          <strong>{linkedContracts.length}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Versions and profiles</p>
          <h2>Deployment scope must be selected and verified before live exchange.</h2>
        </div>
        <div className="layer-list">
          {standard.versionsAndProfiles.map((profile, index) => (
            <div className="layer-row" key={profile}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{profile}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band principle-grid" aria-label="Conformance evidence and controls">
        <article>
          <span>Capabilities</span>
          <h3>Approved exchange scope</h3>
          <ul className="compact-list">
            {standard.capabilities.map((capability) => <li key={capability}>{capability}</li>)}
          </ul>
        </article>
        <article>
          <span>Evidence</span>
          <h3>Required conformance artifacts</h3>
          <ul className="compact-list">
            {standard.conformanceEvidence.map((evidence) => <li key={evidence}>{evidence}</li>)}
          </ul>
        </article>
        <article>
          <span>Controls</span>
          <h3>Required before live use</h3>
          <ul className="compact-list">
            {standard.requiredControls.map((control) => <li key={control}>{control}</li>)}
          </ul>
        </article>
      </section>

      <section className="table-section" aria-label="Linked connector contracts">
        <div className="section-heading">
          <p className="eyebrow">Contract bindings</p>
          <h2>Connector contracts using this standard.</h2>
        </div>
        {linkedContracts.length > 0 ? linkedContracts.map((contract) => (
          <article className="module-row" key={contract.route}>
            <div>
              <span>{contract.status}</span>
              <h2>{contract.name}</h2>
            </div>
            <p>{contract.sourceType}</p>
            <Link className="module-link" href={contract.route}>{contract.purpose}</Link>
          </article>
        )) : (
          <article className="module-row">
            <div>
              <span>registry-only</span>
              <h2>No connector contract yet</h2>
            </div>
            <p>planning boundary</p>
            <Link className="module-link" href="/integrations">
              This standard remains visible for future scoped contract work.
            </Link>
          </article>
        )}
      </section>

      <section className="section-band" aria-label="Official standard references">
        <div className="section-heading">
          <p className="eyebrow">Primary sources</p>
          <h2>Official references retained for implementation review.</h2>
        </div>
        <div className="layer-list">
          {standard.sourceUrls.map((url, index) => (
            <div className="layer-row" key={url}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong><a href={url}>{url}</a></strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
