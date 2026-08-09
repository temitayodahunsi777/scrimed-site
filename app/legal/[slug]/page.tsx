import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { applicationUrl } from "../../lib/companyIdentity";
import {
  getInterimLegalPolicy,
  interimLegalNotice,
  interimLegalPolicies
} from "../../lib/legalPolicies";

export function generateStaticParams() {
  return interimLegalPolicies.map((policy) => ({ slug: policy.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const policy = getInterimLegalPolicy(slug);

  if (!policy) return {};

  return {
    title: `${policy.title} | SCRIMED`,
    description: policy.summary,
    alternates: {
      canonical: applicationUrl(`/legal/${policy.slug}`)
    }
  };
}

export default async function InterimLegalPolicyPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const policy = getInterimLegalPolicy(slug);

  if (!policy) notFound();

  return (
    <main>
      <section className="page-hero trust-hero">
        <Link className="back-link" href="/legal">Legal and Policy Center</Link>
        <p className="eyebrow">{policy.effectiveLabel}</p>
        <h1>{policy.title}</h1>
        <p className="hero-text">{policy.summary}</p>
        <p className="section-copy">{interimLegalNotice}</p>
      </section>

      {policy.sections.map((section) => (
        <section className="section-band" key={section.heading}>
          <div className="section-heading">
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => <p className="section-copy" key={paragraph}>{paragraph}</p>)}
            {section.bullets ? (
              <ul className="compact-list">
                {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
            ) : null}
          </div>
        </section>
      ))}
    </main>
  );
}
