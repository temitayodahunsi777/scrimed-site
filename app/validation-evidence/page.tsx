import type { Metadata } from "next";
import Link from "next/link";
import { applicationUrl } from "../lib/companyIdentity";
import { getValidationEvidenceSummary } from "../lib/validationEvidence";

export const metadata: Metadata = {
  title: "Validation and Evidence | SCRIMED",
  description:
    "Inspect SCRIMED research, technical validation, safety governance, pilot methodology, benchmarks, current product status, and evidence limitations.",
  alternates: {
    canonical: applicationUrl("/validation-evidence")
  },
  openGraph: {
    type: "website",
    title: "Validation and Evidence | SCRIMED",
    description:
      "Inspect SCRIMED research, technical validation, safety governance, pilot methodology, benchmarks, current product status, and evidence limitations.",
    url: applicationUrl("/validation-evidence")
  }
};

export default function ValidationEvidencePage() {
  const summary = getValidationEvidenceSummary();

  return (
    <main>
      <section className="page-hero trust-hero">
        <Link className="back-link" href="/trust-center">Trust Center</Link>
        <p className="eyebrow">Validation and Evidence</p>
        <h1>Building with clinicians, health systems, and innovators.</h1>
        <p className="hero-text">
          SCRIMED is developing trustworthy healthcare intelligence designed to support clinicians, care
          teams, health systems, and patients. Verified pilot outcomes, case studies, and customer success
          stories will be published only when supporting evidence and publication permissions are available.
        </p>
        <div className="hero-actions">
          <Link className="primary-action" href="/clinical-robustness-lab">Inspect Synthetic Evaluation</Link>
          <Link className="secondary-action" href="/claims">Review Claims Register</Link>
          <Link className="secondary-action" href="/api/validation-evidence">View JSON Evidence</Link>
        </div>
      </section>

      <section className="section-band" aria-label="Current SCRIMED product status">
        <div className="section-heading">
          <p className="eyebrow">Current product status</p>
          <h2>{summary.currentProductStatus}</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
      </section>

      <section className="table-section" aria-label="SCRIMED validation and evidence categories">
        <div className="section-heading">
          <p className="eyebrow">Evidence categories</p>
          <h2>Inspect what exists, what remains limited, and what still requires formal validation.</h2>
        </div>
        {summary.sections.map((section) => (
          <article className="module-row" key={section.id}>
            <div>
              <span>{section.status}</span>
              <h2>{section.title}</h2>
            </div>
            <p>{section.summary}</p>
            <div>
              <ul className="compact-list">
                {section.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
              </ul>
              <div className="hero-actions">
                {section.evidenceRoutes.slice(0, 2).map((route) => (
                  <Link className="module-link" href={route} key={route}>Inspect evidence</Link>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
