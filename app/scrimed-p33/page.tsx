import Link from "next/link";

import { getP33IntegratedSummary } from "../lib/scrimed-p33/index";

export const metadata = {
  title: "SCRIMED p.33 Integrated Upgrades",
  description:
    "Synthetic, human-supervised controls for clinical context, evidence, oversight, portable agents, trajectory evaluation, opportunity workflows, and pilot eligibility."
};

function Status({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  return <span className={`status ${normalized.includes("pass") || normalized.includes("valid") || normalized.includes("active") ? "ready" : normalized.includes("block") || normalized.includes("fail") ? "blocked" : "review"}`}>{value}</span>;
}

export default function ScrimedP33Page() {
  const summary = getP33IntegratedSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/scrimed-control-plane">Intelligence Control Plane</Link>
        <p className="eyebrow">SCRIMED p.33</p>
        <h1>Context, evidence, and oversight that walk with doctors.</h1>
        <p className="hero-text">
          One integrated, synthetic-only operating view across source-grounded context, clinical signal
          compression, decision evidence, regulatory labels, oversight drift, portable agents,
          trajectory evaluation, opportunity workflows, and pilot gates.
        </p>
        <div className="hero-actions" aria-label="p.33 resources">
          <Link href={summary.apiRoute}>Inspect API</Link>
          <Link href={summary.briefRoute}>Download Brief</Link>
          <Link href="/product">Open Product Console</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="p.33 status">
        <article><span>Status</span><strong>{summary.status}</strong></article>
        <article><span>Context facts</span><strong>{summary.contextFabric.artifact.facts.length}</strong></article>
        <article><span>Evidence records</span><strong>{summary.decisionEvidence.verification.recordCount}</strong></article>
        <article><span>Opportunity modules</span><strong>{summary.opportunities.modules.length}</strong></article>
        <article><span>External actions</span><strong>{summary.opportunities.externalActionModuleCount}</strong></article>
        <article><span>Local pass gates</span><strong>{summary.gateCounts.PASS}</strong></article>
        <article><span>Operator gates</span><strong>{summary.gateCounts.OPERATOR_REQUIRED}</strong></article>
        <article><span>Blocked gates</span><strong>{summary.gateCounts.BLOCKED}</strong></article>
      </section>

      <section className="section-band split-band" aria-label="p.33 boundary">
        <div>
          <p className="eyebrow">Human Authority</p>
          <h2>{summary.mission}</h2>
        </div>
        <div>
          <p>{summary.boundary}</p>
          <ul className="compact-list">
            <li>Optimization target: {summary.optimizationTarget}</li>
            <li>Production readiness: no</li>
            <li>External distribution: blocked</li>
            <li>Provider calls executed: no</li>
          </ul>
        </div>
      </section>

      <section className="table-section" aria-label="Clinical context fabric">
        <div className="section-heading">
          <p className="eyebrow">Clinical Context Fabric v2</p>
          <h2>Build context once, then serve only purpose-bound, minimum-necessary views.</h2>
        </div>
        <article className="module-row">
          <div><Status value={summary.contextFabric.status} /><h2>Shared context artifact</h2></div>
          <p>{summary.contextFabric.boundary}</p>
          <div><strong>Evidence</strong><ul className="compact-list"><li>{summary.contextFabric.artifact.sourceDocuments.length} source documents</li><li>{summary.contextFabric.artifact.sourceSpans.length} source spans</li><li>{summary.contextFabric.artifact.timeline.length} timeline events</li></ul></div>
          <div><strong>Integrity</strong><p>{summary.contextFabric.artifact.integrityHash}</p></div>
        </article>
        <article className="module-row">
          <div><Status value={summary.contextFabric.releaseGate.status} /><h2>Clinical signal compression</h2></div>
          <p>Compression preserves source links, timeline position, uncertainty, missing information, contradictions, and every omitted section.</p>
          <div><strong>Coverage</strong><ul className="compact-list"><li>{summary.contextFabric.compression.summaryFacts.length} retained facts</li><li>{summary.contextFabric.compression.omittedSectionIds.length} declared omissions</li><li>{summary.contextFabric.compression.sourceSpanIds.length} citations</li></ul></div>
          <div><strong>Release reasons</strong><p>{summary.contextFabric.releaseGate.reasonCodes.join(", ")}</p></div>
        </article>
      </section>

      <section className="table-section" aria-label="Decision evidence and oversight">
        <div className="section-heading">
          <p className="eyebrow">Evidence + Oversight</p>
          <h2>Every consequential decision remains attributable, replayable, and reviewable.</h2>
        </div>
        <article className="module-row">
          <div><Status value={summary.decisionEvidence.status} /><h2>Decision Evidence Ledger</h2></div>
          <p>{summary.decisionEvidence.boundary}</p>
          <div><strong>Chain</strong><ul className="compact-list"><li>Valid: {summary.decisionEvidence.verification.valid ? "yes" : "no"}</li><li>Ledgers: {summary.decisionEvidence.verification.ledgerCount}</li><li>Failures: {summary.decisionEvidence.verification.failures.length}</li></ul></div>
          <div><strong>Privacy</strong><p>No raw PHI, secrets, prompts, or hidden reasoning.</p></div>
        </article>
        <article className="module-row">
          <div><Status value={summary.regulatoryOversight.labelDecision.decision} /><h2>Regulatory Label Twin</h2></div>
          <p>{summary.regulatoryOversight.label.intendedUse.join(", ")}</p>
          <div><strong>Excluded uses</strong><p>{summary.regulatoryOversight.label.excludedUses.join(", ")}</p></div>
          <div><strong>Missing gate</strong><p>{summary.regulatoryOversight.labelDecision.reasonCodes.join(", ")}</p></div>
        </article>
        <article className="module-row">
          <div><Status value={summary.regulatoryOversight.oversightResult.decision} /><h2>Oversight Drift Sentinel</h2></div>
          <p>Fixed sentinel cohorts and risk-based review floors cannot disappear because model accuracy improves.</p>
          <div><strong>Sentinels</strong><p>{summary.regulatoryOversight.oversightPolicy.fixedSentinelCohortIds.join(", ")}</p></div>
          <div><strong>Automatic reduction</strong><p>{summary.regulatoryOversight.oversightResult.automaticOversightReductionAllowed ? "allowed" : "blocked"}</p></div>
        </article>
      </section>

      <section className="table-section" aria-label="Portable agent execution">
        <div className="section-heading">
          <p className="eyebrow">Portable Agent Runtime</p>
          <h2>Capability, locality, quality, budget, and safety determine the route.</h2>
        </div>
        <article className="module-row">
          <div><Status value={summary.portableAgents.routeDecision.status} /><h2>Model-harness-task route</h2></div>
          <p>{summary.portableAgents.routeDecision.routingRationale.join(" ")}</p>
          <div><strong>Selected route</strong><p>{summary.portableAgents.routeDecision.routeId ?? "safe refusal"}</p></div>
          <div><strong>Provider call</strong><p>{summary.portableAgents.routeDecision.providerCallExecuted ? "executed" : "not executed"}</p></div>
        </article>
        <article className="module-row">
          <div><Status value={summary.portableAgents.localWorkerAdmission.decision} /><h2>Local worker admission</h2></div>
          <p>{summary.portableAgents.boundary}</p>
          <div><strong>Isolation</strong><ul className="compact-list"><li>Network default: deny</li><li>Sandbox: required</li><li>Kill switch: armed</li></ul></div>
          <div><strong>Confidential compute</strong><p>{summary.portableAgents.localWorkerAdmission.confidentialComputeCapability}</p></div>
        </article>
      </section>

      <section className="table-section" aria-label="Clinical trajectory evaluation">
        <div className="section-heading">
          <p className="eyebrow">Trace-to-Eval Foundry</p>
          <h2>Synthetic longitudinal trajectories test specificity, grounding, omissions, and harm.</h2>
        </div>
        <article className="module-row">
          <div><Status value={summary.clinicalTrajectory.evaluation.decision} /><h2>ClinicalTrajectory evaluation</h2></div>
          <p>{summary.clinicalTrajectory.boundary}</p>
          <div><strong>Scores</strong><ul className="compact-list"><li>Semantic match: {summary.clinicalTrajectory.evaluation.semanticMatch.toFixed(2)}</li><li>Required steps: {summary.clinicalTrajectory.evaluation.requiredStepSpecificity.toFixed(2)}</li><li>Groundedness: {summary.clinicalTrajectory.evaluation.groundedness.toFixed(2)}</li></ul></div>
          <div><strong>Promotion</strong><p>{summary.clinicalTrajectory.evaluation.promotionEligible ? "eligible" : "qualified human review required"}</p></div>
        </article>
      </section>

      <section className="table-section" aria-label="Opportunity modules">
        <div className="section-heading">
          <p className="eyebrow">Opportunity + Operations</p>
          <h2>Real typed workflows, restrained claims, and measurable operational value.</h2>
        </div>
        {summary.opportunities.modules.map((module) => (
          <article className="module-row" key={module.moduleId}>
            <div><span>{module.priority} · {module.enabledByDefault ? "synthetic active" : "default off"}</span><h2>{module.title}</h2></div>
            <p>{module.whyInvestorsCare}</p>
            <div><strong>Workflow</strong><p>{module.workflow.join(" → ")}</p></div>
            <div><strong>Boundary</strong><p>{module.boundary}</p></div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Pilot profiles and gates">
        <div className="section-heading">
          <p className="eyebrow">Pilot Profiles + Release Gates</p>
          <h2>Restricted profiles stay disabled with no bypass.</h2>
        </div>
        {summary.pilotProfiles.profiles.map((profile) => (
          <article className="module-row" key={profile.profileId}>
            <div><Status value={profile.status} /><h2>{profile.profileId}</h2></div>
            <p>{profile.reasonCodes.join(", ") || "Local synthetic technical evidence satisfies this profile."}</p>
            <div><strong>Required evidence</strong><p>{profile.requiredEvidence.join(", ")}</p></div>
            <div><strong>Authority</strong><p>Live PHI: no · Live clinical operation: no · Bypass: no</p></div>
          </article>
        ))}
        {summary.gateMatrix.map((gate) => (
          <article className="module-row" key={gate.gateId}>
            <div><Status value={gate.status} /><h2>{gate.gateId}</h2></div>
            <p>{gate.reason}</p>
            <div><strong>Owner</strong><p>{gate.ownerRole}</p></div>
            <div><strong>Evidence</strong><p>{gate.evidence.join(", ")}</p></div>
          </article>
        ))}
      </section>
    </main>
  );
}
