import Link from "next/link";
import { getClaimsRegister } from "../lib/enterpriseReadiness";

export const metadata = {
  title: "SCRIMED Claims Register",
  description:
    "Approved, evidence-required, and prohibited SCRIMED claims for public, buyer, marketing, PR, sales, and advertising use."
};

export default function ClaimsPage() {
  const claims = getClaimsRegister();
  const states = [
    {
      state: "approved-current-boundary" as const,
      eyebrow: "Approved current-boundary claims",
      heading: "These claims may be used with the required qualifier."
    },
    {
      state: "evidence-required" as const,
      eyebrow: "Evidence required",
      heading: "These claims require a dated, approved evidence packet before publication."
    },
    {
      state: "prohibited" as const,
      eyebrow: "Prohibited claims",
      heading: "These claims cannot be used under the current product boundary."
    }
  ];

  return (
    <main>
      <section className="page-hero trust-hero">
        <Link className="back-link" href="/trust-center">Trust Center</Link>
        <p className="eyebrow">SCRIMED Claims Control</p>
        <h1>Every public statement must remain inside the evidence.</h1>
        <p className="hero-text">
          This register governs website copy, sales conversations, marketing, public relations,
          partnerships, and advertising. Aspirational strategy is not a current capability claim.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="Claims summary">
        <article>
          <span>Approved</span>
          <strong>{claims.filter((claim) => claim.state === "approved-current-boundary").length}</strong>
        </article>
        <article>
          <span>Evidence required</span>
          <strong>{claims.filter((claim) => claim.state === "evidence-required").length}</strong>
        </article>
        <article>
          <span>Prohibited</span>
          <strong>{claims.filter((claim) => claim.state === "prohibited").length}</strong>
        </article>
        <article>
          <span>Controlled claims</span>
          <strong>{claims.length}</strong>
        </article>
      </section>

      {states.map((group) => (
        <section className="table-section" aria-label={group.eyebrow} key={group.state}>
          <div className="section-heading">
            <p className="eyebrow">{group.eyebrow}</p>
            <h2>{group.heading}</h2>
          </div>
          {claims.filter((claim) => claim.state === group.state).map((claim) => (
            <article className="module-row" key={claim.id}>
              <div>
                <span>{claim.state}</span>
                <h2>{claim.claim}</h2>
              </div>
              <p>{claim.requiredQualifier}</p>
              <div>
                <Link className="module-link" href={claim.evidenceRoute}>
                  Inspect evidence route
                </Link>
                <ul className="compact-list">
                  <li>Channels: {claim.channels.join(", ")}</li>
                  <li>Do not say: {claim.prohibitedVariant}</li>
                </ul>
              </div>
            </article>
          ))}
        </section>
      ))}
    </main>
  );
}
