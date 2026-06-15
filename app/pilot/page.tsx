import Link from "next/link";
import { getPilotIntakeSummary } from "../lib/pilotIntake";
import PilotIntakeForm from "./PilotIntakeForm";

export const metadata = {
  title: "SCRIMED Pilot Intake | Enterprise Healthcare AI Evaluation",
  description:
    "Request a governed SCRIMED synthetic pilot, workflow intelligence assessment, AI readiness audit, or clinical operations automation blueprint."
};

type PilotIntakePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PilotIntakePage({ searchParams }: PilotIntakePageProps) {
  const summary = getPilotIntakeSummary();
  const params = await searchParams;
  const prefill = {
    offer: firstParamValue(params.offer),
    workflow: firstParamValue(params.workflow)
  };

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">Enterprise pilot intake</p>
        <h1>Request a governed SCRIMED synthetic pilot or enterprise assessment.</h1>
        <p className="hero-text">
          This intake packages buyer segment, target workflows, readiness needs, governance requirements, and
          source-aware follow-up routing for SCRIMED Atlas pilots and healthcare AI operating-layer evaluations.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED pilot intake summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Offers</span>
          <strong>{summary.serviceOffers.length}</strong>
        </article>
        <article>
          <span>Workflow targets</span>
          <strong>{summary.workflowTargets.length}</strong>
        </article>
        <article>
          <span>CRM mode</span>
          <strong>{summary.crmRouting.currentMode}</strong>
        </article>
        <article>
          <span>Attribution</span>
          <strong>{summary.attribution.status}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>Business intake only. No PHI. No live clinical execution.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.requiredAcknowledgements.map((acknowledgement, index) => (
            <div className="layer-row" key={acknowledgement}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{acknowledgement}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band pilot-intake-band" aria-label="SCRIMED enterprise pilot intake form">
        <div className="section-heading">
          <p className="eyebrow">Intake workflow</p>
          <h2>Convert enterprise interest into a CRM-ready pilot scope.</h2>
          <p className="section-copy">
            Submissions are validated for business-contact and workflow-scope data, screened for PHI markers,
            scored for pilot readiness, attributed to safe source signals, and routed to durable storage, CRM, or a manual no-PHI review packet when needed.
          </p>
        </div>
        <PilotIntakeForm prefill={prefill} summary={summary} />
      </section>

      <section className="table-section" aria-label="SCRIMED pilot routing outcomes">
        <div className="section-heading">
          <p className="eyebrow">Routing outcomes</p>
          <h2>Each intake produces an actionable enterprise follow-up packet.</h2>
        </div>
        <article className="module-row">
          <div>
            <span>1. Validate</span>
            <h2>Safe capture</h2>
          </div>
          <p>Business-contact, organization, workflow, readiness, and governance fields are validated before routing.</p>
          <strong>No PHI, patient identifiers, live clinical records, or payer member identifiers are accepted.</strong>
        </article>
        <article className="module-row">
          <div>
            <span>2. Qualify</span>
            <h2>Pilot fit</h2>
          </div>
          <p>SCRIMED classifies the request as assessment-first, governance-first, or synthetic-pilot-qualified.</p>
          <strong>Qualification supports commercial follow-up; it is not clinical advice or production approval.</strong>
        </article>
        <article className="module-row">
          <div>
            <span>3. Route</span>
            <h2>Durable intake, attribution, CRM handoff, or manual review</h2>
          </div>
          <p>Accepted no-PHI intake is packaged with source attribution, target audience, deployment profile, and sales cadence context. When durable storage or CRM routing is configured, retention is confirmed in the handoff result.</p>
          <strong>If durable retention is unavailable, the API returns a manual-review-required packet and marks retention as unconfirmed.</strong>
        </article>
      </section>
    </main>
  );
}

function firstParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
