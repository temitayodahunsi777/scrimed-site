import Link from "next/link";
import { getScrimedTrustOpsIntelligenceLayerSummary } from "../lib/scrimed/semantic-intelligence-layer";

export const metadata = {
  title: "SCRIMED TrustOps Intelligence Layer",
  description:
    "Synthetic-only TrustOps layer for module governance, scoring, signal detection, semantic intelligence, and recommendation-only self-healing workflows."
};

export default function ScrimedTrustOpsPage() {
  const summary = getScrimedTrustOpsIntelligenceLayerSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/scrimed-modules">
          SCRIMED Modules
        </Link>
        <p className="eyebrow">SCRIMED TrustOps Intelligence Layer</p>
        <h1>Governed module scoring, synthetic signal detection, and recommendation-only remediation for SCRIMED agents.</h1>
        <p className="hero-text">{summary.positioning}</p>
        <div className="hero-actions" aria-label="SCRIMED TrustOps actions">
          <Link href="/api/scrimed-trustops">Inspect TrustOps API</Link>
          <Link href="/api/scrimed-trustops/brief">Download Brief</Link>
          <Link href="/api/scrimed-trustops/review-packets">Review Packets</Link>
          <Link href="/scrimed-modules">Module Registry</Link>
          <Link href="/clinical-robustness-lab">Robustness Lab</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED TrustOps summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Modules</span>
          <strong>{summary.registrySummary.trustOpsModuleCount}</strong>
        </article>
        <article>
          <span>Avg trust</span>
          <strong>{summary.registrySummary.averageTrustScore}</strong>
        </article>
        <article>
          <span>Signals</span>
          <strong>{summary.syntheticSignals.length}</strong>
        </article>
        <article>
          <span>Validation</span>
          <strong>{summary.validation.status}</strong>
        </article>
        <article>
          <span>Packets</span>
          <strong>{summary.reviewPacketSummary.packetCount}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="SCRIMED TrustOps boundary">
        <div>
          <p className="eyebrow">Safety boundary</p>
          <h2>TrustOps can recommend and validate, but it cannot execute real-world healthcare actions.</h2>
        </div>
        <div>
          <p>{summary.safetyBoundaryStatement}</p>
          <p>Scoring formula: {summary.scoringFormula}</p>
        </div>
      </section>

      <section className="table-section" aria-label="TrustOps modules">
        <div className="section-heading">
          <p className="eyebrow">Module scoring</p>
          <h2>Every TrustOps module has trust scoring, governance scoring, interoperability readiness, evidence requirements, and automation-risk posture.</h2>
        </div>
        {summary.modules.map((module) => (
          <article className="module-row" key={module.id}>
            <div>
              <span>{module.category}</span>
              <h2>{module.name}</h2>
            </div>
            <p>{module.description}</p>
            <div>
              <strong>Trust {module.trustScore.total}; governance {module.governanceScore}; automation risk {module.automationRisk}</strong>
              <ul className="compact-list">
                <li>Capabilities: {module.capabilities.join(", ")}</li>
                <li>Structured outputs: {module.structuredOutputs.join(", ")}</li>
                <li>Evidence: {module.evidenceRequirements.join(", ")}</li>
                <li>Next step: {module.recommendedNextBuildStep}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Synthetic operational signals">
        <div className="section-heading">
          <p className="eyebrow">Signal Engine</p>
          <h2>Synthetic-only signals identify operational risk without touching PHI, EHRs, payers, outreach systems, or production connectors.</h2>
        </div>
        {summary.syntheticSignals.map((signal) => (
          <article className="module-row" key={signal.id}>
            <div>
              <span>{signal.severity}</span>
              <h2>{signal.id}</h2>
            </div>
            <p>{signal.reason}</p>
            <div>
              <strong>{signal.affectedWorkflow}</strong>
              <ul className="compact-list">
                <li>Owner: {signal.recommendedOwner}</li>
                <li>Action: {signal.recommendedAction}</li>
                <li>Eligibility: {signal.automationEligibility}</li>
                <li>Human review required: {signal.humanReviewRequired ? "yes" : "no"}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Self-healing workflow recommendations">
        <div className="section-heading">
          <p className="eyebrow">Self-Healing Workflow</p>
          <h2>Remediation is recommendation-only and always routed through a human review gate.</h2>
        </div>
        {summary.selfHealingRecommendations.map((recommendation) => (
          <article className="module-row" key={recommendation.id}>
            <div>
              <span>{recommendation.automationEligibility}</span>
              <h2>{recommendation.action}</h2>
            </div>
            <p>{recommendation.expectedOutcome}</p>
            <div>
              <strong>{recommendation.recommendedOwner}</strong>
              <ul className="compact-list">
                <li>Signal: {recommendation.signalId}</li>
                <li>Steps: {recommendation.steps.join(", ")}</li>
                <li>Blocked actions: {recommendation.blockedActions.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="TrustOps durable review packets">
        <div className="section-heading">
          <p className="eyebrow">Durable evidence binding</p>
          <h2>TrustOps review packets are ready for AAL2 protected record, replay, and review-disposition persistence without public writes.</h2>
        </div>
        {summary.reviewPacketSummary.packets.map((packet) => (
          <article className="module-row" key={packet.packetId}>
            <div>
              <span>{packet.severity}</span>
              <h2>{packet.packetId}</h2>
            </div>
            <p>{packet.safetyBoundary}</p>
            <div>
              <strong>{packet.durableEvidenceBinding.persistenceStatus}</strong>
              <ul className="compact-list">
                <li>Signal: {packet.signalId}</li>
                <li>Recommendation: {packet.recommendation.action}</li>
                <li>Attempt: {packet.durableEvidenceBinding.attemptId}</li>
                <li>Replay token: {packet.durableEvidenceBinding.replayToken}</li>
                <li>Packet hash: {packet.durableEvidenceBinding.packetHash}</li>
                <li>Review route: {packet.durableEvidenceBinding.durableStoreReviewDispositionRoute}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band principle-grid" aria-label="TrustOps governance checklist">
        {summary.governanceChecklist.map((item) => (
          <article key={item}>
            <span>control</span>
            <h3>{item}</h3>
          </article>
        ))}
      </section>

      <section className="section-band principle-grid" aria-label="TrustOps validation checks">
        {summary.validation.checks.map((check) => (
          <article key={check.check}>
            <span>{check.passed ? "pass" : "fail"}</span>
            <h3>{check.check}</h3>
            <p>{check.detail}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
