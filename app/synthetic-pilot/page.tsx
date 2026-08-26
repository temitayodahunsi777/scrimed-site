import type { Metadata } from "next";
import Link from "next/link";

import { getSyntheticPilotReadinessSummary } from "../lib/commercial/syntheticPilotReadiness";

export const metadata: Metadata = {
  title: "SCRIMED Synthetic Workflow Pilot | Governed No-PHI Evaluation",
  description:
    "Inspect a bounded, no-PHI SCRIMED workflow pilot with synthetic scenarios, explicit controls, reproducible evidence, and human-approved commercial next steps.",
  alternates: { canonical: "https://app.scrimedsolutions.com/synthetic-pilot" }
};

function readable(value: string) {
  return value.toLowerCase().replaceAll("_", " ");
}

export default function SyntheticPilotPage() {
  const summary = getSyntheticPilotReadinessSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">SYNTHETIC / NON-PRODUCTION</p>
        <h1>SCRIMED Synthetic Workflow Pilot</h1>
        <p className="hero-text">
          Evaluate one healthcare workflow with synthetic scenarios, bounded agents, inspectable evidence,
          and retained human authority. No PHI, live clinical execution, production connector, or binding
          commercial commitment is created.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href="#pilot-evidence">Inspect Evidence</a>
          <Link className="secondary-action" href="/pilot">Request Human Scoping</Link>
          <a className="secondary-action" href={summary.apiRoute}>Open Read-Only API</a>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Synthetic pilot readiness summary">
        <article><span>Readiness</span><strong>{summary.status}</strong></article>
        <article><span>Score</span><strong>{summary.readiness.score}/100</strong></article>
        <article><span>Data</span><strong>No PHI</strong></article>
        <article><span>Environment</span><strong>Nonproduction</strong></article>
        <article><span>Budget</span><strong>{summary.budgetDecision.status}</strong></article>
        <article><span>Customer activation</span><strong>{summary.commercialReadiness.customerActivation}</strong></article>
      </section>

      <section className="section-band split-band" aria-label="Pilot package and buyer problem">
        <div>
          <p className="eyebrow">Buyer problem</p>
          <h2>{summary.activeProfile.title}</h2>
          <p className="section-copy">{summary.activeProfile.problem}</p>
          <p className="section-copy">{summary.valueHypothesis.pain}</p>
        </div>
        <div className="layer-list" aria-label="Pilot package deliverables">
          {summary.package.deliverables.map((deliverable, index) => (
            <div className="layer-row" key={deliverable}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{deliverable}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Synthetic pilot lifecycle">
        <div className="section-heading">
          <p className="eyebrow">Bounded lifecycle</p>
          <h2>Every stage produces reviewable evidence. No stage grants production authority.</h2>
        </div>
        {summary.lifecycle.map((stage, index) => (
          <article className="module-row" key={stage}>
            <div><span>{String(index + 1).padStart(2, "0")}</span><h2>{readable(stage)}</h2></div>
            <p>{index < summary.lifecycle.length - 1 ? `Requires the evidence and owner decision needed before ${readable(summary.lifecycle[index + 1])}.` : "Ends with a human expansion, remediation, or stop decision."}</p>
            <div><strong>human controlled</strong><p>production authority: none</p></div>
          </article>
        ))}
      </section>

      <section className="section-band" id="pilot-evidence" aria-label="Synthetic pilot evidence">
        <div className="section-heading">
          <p className="eyebrow">Evidence graph</p>
          <h2>Each result binds scenario, model, agent, workflow, evaluation, metric, and source.</h2>
          <p className="section-copy evidence-fingerprint">
            Evidence hash: {summary.evidencePack.evidenceHash}
          </p>
        </div>
        <div className="principle-grid">
          {summary.evidencePack.evidenceLinks.map((link) => (
            <article key={link.scenarioId}>
              <span>{link.metricId}</span>
              <h3>{link.scenarioId}</h3>
              <p>{link.workflowId}</p>
              <ul className="compact-list">
                <li>Agent: {link.agentId}</li>
                <li>Model: {link.modelId}</li>
                <li>Evaluation: {link.evaluationId}</li>
                <li>Source: {link.evidenceSourceId}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band" aria-label="Pilot metrics and economics">
        <div className="section-heading">
          <p className="eyebrow">Synthetic metrics</p>
          <h2>Value and economics remain assumption-bound, inspectable, and nonbinding.</h2>
        </div>
        <div className="principle-grid">
          <article>
            <span>Verified intelligence yield</span>
            <h3>{summary.verifiedIntelligenceYield.verifiedIntelligenceYield ?? "Not calculable"}</h3>
            <p>{summary.verifiedIntelligenceYield.boundary}</p>
          </article>
          <article>
            <span>Scenario cost floor</span>
            <h3>${summary.economics.breakEvenPriceUsd?.toLocaleString() ?? "Not calculable"}</h3>
            <p>{summary.economics.boundary}</p>
          </article>
          <article>
            <span>Time returned</span>
            <h3>{summary.healthcareValueReturned.simulatedTimeReturnedMinutes} minutes</h3>
            <p>Simulated from declared assumptions; no customer or clinical outcome claim is authorized.</p>
          </article>
        </div>
      </section>

      <section className="table-section" aria-label="Strategic synthetic pilot profiles">
        <div className="section-heading">
          <p className="eyebrow">Strategic profiles</p>
          <h2>Choose a low-exposure workflow wedge, then narrow it to one measurable problem.</h2>
        </div>
        {summary.profiles.map((profile) => (
          <article className="module-row" key={profile.id}>
            <div><span>{profile.buyerSegments.length} buyer lanes</span><h2>{profile.title}</h2></div>
            <p>{profile.problem}</p>
            <div><strong>{profile.evidenceOutputs.length} evidence outputs</strong><p>Claim and production authority blocked</p></div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Commercial authority and retained boundaries">
        <div className="section-heading">
          <p className="eyebrow">Commercial authority</p>
          <h2>Agents prepare. Named humans decide and commit.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="principle-grid">
          <article>
            <span>Assessment</span>
            <h3>{summary.commercialPosture.assessment.name}</h3>
            <p>{summary.commercialPosture.assessment.price}</p>
          </article>
          <article>
            <span>Synthetic pilot</span>
            <h3>{summary.commercialPosture.syntheticPilot.name}</h3>
            <p>{summary.commercialPosture.syntheticPilot.price}</p>
          </article>
          <article>
            <span>Protected pilot</span>
            <h3>{summary.commercialPosture.protectedPilot.name}</h3>
            <p>{summary.commercialPosture.protectedPilot.price}</p>
          </article>
        </div>
      </section>
    </main>
  );
}
