import type { Metadata } from "next";
import Link from "next/link";
import { applicationUrl } from "../lib/companyIdentity";
import { getInterimLegalSummary, interimLegalNotice } from "../lib/legalPolicies";

export const metadata: Metadata = {
  title: "Legal and Policy Center | SCRIMED",
  description: "Interim SCRIMED privacy, terms, cookie, accessibility, refund, healthcare, and AI policies.",
  alternates: {
    canonical: applicationUrl("/legal")
  }
};

export default function LegalCenterPage() {
  const summary = getInterimLegalSummary();

  return (
    <main>
      <section className="page-hero trust-hero">
        <Link className="back-link" href="/trust-center">Trust Center</Link>
        <p className="eyebrow">Legal and Policy Center</p>
        <h1>Interim policies for SCRIMED&apos;s pre-commercial, synthetic-only experience.</h1>
        <p className="hero-text">{interimLegalNotice}</p>
      </section>

      <section className="table-section" aria-label="Interim SCRIMED policies">
        <div className="section-heading">
          <p className="eyebrow">Policies</p>
          <h2>Use the current boundaries now; obtain qualified review before commercial healthcare deployment.</h2>
        </div>
        {summary.policies.map((policy) => (
          <article className="module-row" key={policy.slug}>
            <div>
              <span>{policy.effectiveLabel}</span>
              <h2>{policy.title}</h2>
            </div>
            <p>{policy.summary}</p>
            <Link className="module-link" href={policy.route}>Read interim policy</Link>
          </article>
        ))}
      </section>
    </main>
  );
}
