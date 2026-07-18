import Link from "next/link";

import { getDocumentationBeforeAuthorizationSummary } from "../lib/documentationBeforeAuthorization";
import DocumentationWorkbench from "./DocumentationWorkbench";

export const metadata = {
  title: "PayerIQ Documentation Readiness | SCRIMED",
  description:
    "Evaluate synthetic prior-authorization documentation completeness, evidence gaps, reviewer ownership, and no-submission controls with SCRIMED PayerIQ."
};

export default function DocumentationBeforeAuthorizationPage() {
  const summary = getDocumentationBeforeAuthorizationSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/demos/prior-authorization-support">
          Prior Authorization Demo
        </Link>
        <p className="eyebrow">SCRIMED PayerIQ</p>
        <h1>Find documentation gaps before an authorization packet reaches payer review.</h1>
        <p className="hero-text">
          Run a registered synthetic scenario through requirement scoring, evidence tracing, risk detection,
          reviewer routing, and a prepare-only SCRIMED Work handoff. Payer submission remains disabled.
        </p>
        <div className="hero-actions" aria-label="PayerIQ actions">
          <a className="primary-action" href="#workbench">
            Run Synthetic Workbench
          </a>
          <Link className="secondary-action" href="/pilots/60-day-governed-automation-pilot">
            Review Pilot
          </Link>
          <Link className="secondary-action" href="/healthcare-value-realization">
            Inspect Value Methodology
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="PayerIQ product summary">
        <article>
          <span>Status</span>
          <strong>interactive synthetic</strong>
        </article>
        <article>
          <span>Requirements</span>
          <strong>{summary.requirementCount}</strong>
        </article>
        <article>
          <span>Scenarios</span>
          <strong>{summary.syntheticPacketCount}</strong>
        </article>
        <article>
          <span>Free text</span>
          <strong>not accepted</strong>
        </article>
        <article>
          <span>Human review</span>
          <strong>required</strong>
        </article>
        <article>
          <span>Payer submission</span>
          <strong>blocked</strong>
        </article>
        <article>
          <span>Case evidence</span>
          <strong>emitted from first synthetic run</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="PayerIQ operating model">
        <div>
          <p className="eyebrow">Documentation before authorization</p>
          <h2>Turn policy requirements into a reviewable evidence packet before avoidable rework compounds.</h2>
        </div>
        <div>
          <p>{summary.boundary}</p>
          <ul className="compact-list">
            <li>Registered, deterministic synthetic scenarios only</li>
            <li>Missing symptom, function, timing, rationale, history, evidence, policy, note, and attestation checks</li>
            <li>Reviewer ownership and audit hash on every packet</li>
            <li>Prepare-only revenue-cycle handoff with no payer transmission</li>
          </ul>
        </div>
      </section>

      <section className="section-band split-band" aria-label="Evidence from first case">
        <div>
          <p className="eyebrow">Evidence From First Case</p>
          <h2>Every workbench run produces reviewable evidence, not just an answer.</h2>
          <p>
            The packet captures lineage, versions, reviewer state, descriptive outcomes, safety events,
            missingness, confounders, and subgroup attributes from the first synthetic case.
          </p>
        </div>
        <div>
          <span>{summary.evidenceFromFirstCase.status}</span>
          <ul className="compact-list">
            <li>Human review: required</li>
            <li>Causal claims: blocked</li>
            <li>External distribution: blocked</li>
            <li>Live PHI and payer transmission: blocked</li>
          </ul>
        </div>
      </section>

      <section className="section-band evaluation-band" id="workbench" aria-label="PayerIQ documentation workbench">
        <DocumentationWorkbench summary={summary} />
      </section>

      <section className="section-band product-actions" aria-label="PayerIQ next actions">
        <div className="section-heading">
          <p className="eyebrow">From proof to paid pilot</p>
          <h2>Validate the workflow economics and review design before any protected data or payer connection.</h2>
        </div>
        <div className="action-grid">
          <Link className="action-card" href="/demos/prior-authorization-support">
            <span>Demo brief</span>
            <strong>Inspect product proof</strong>
            <p>Review the buyer problem, guided flow, evidence routes, outcomes, and production exclusions.</p>
          </Link>
          <Link className="action-card" href="/pilots/60-day-governed-automation-pilot">
            <span>Pilot</span>
            <strong>Scope governed automation</strong>
            <p>Measure documentation completeness, reviewer time, evidence quality, and escalation behavior.</p>
          </Link>
          <Link className="action-card" href="/pilot?offer=synthetic-pilot-evaluation&demo=prior-authorization-support">
            <span>Buyer intake</span>
            <strong>Request no-PHI evaluation</strong>
            <p>Submit organization and workflow context without patient, payer-member, or production data.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
