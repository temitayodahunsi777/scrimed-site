import Link from "next/link";
import { getStrategicPlatformIntelligenceSummary } from "../lib/strategicPlatformIntelligence";

export const metadata = {
  title: "SCRIMED Strategic Platform Intelligence",
  description:
    "Source-informed strategic platform intelligence for SCRIMED healthcare AI infrastructure, interoperability, agents, governance, and deployment readiness."
};

export default function StrategicIntelligencePage() {
  const summary = getStrategicPlatformIntelligenceSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">Strategic Platform Intelligence</p>
        <h1>SCRIMED converts market signals into governed healthcare infrastructure build paths.</h1>
        <p className="hero-text">
          This surface records how public platform patterns translate into SCRIMED AgentOS, Atlas, interoperability,
          protected workspaces, evidence, and commercial proof without claiming partnerships, certifications, or live
          clinical execution.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.apiRoute}>
            Inspect API
          </a>
          <Link className="secondary-action" href="/agent-workspace">
            Open Agent Workspace
          </Link>
          <Link className="secondary-action" href="/interoperability">
            Review Interoperability
          </Link>
          <Link className="secondary-action" href={summary.competitiveMarketIntelligenceRoute}>
            Market Intelligence
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Strategic intelligence summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Sources</span>
          <strong>{summary.sourceCount}</strong>
        </article>
        <article>
          <span>Patterns</span>
          <strong>{summary.patternCount}</strong>
        </article>
        <article>
          <span>Execution bets</span>
          <strong>{summary.executionBetCount}</strong>
        </article>
        <article>
          <span>Now bets</span>
          <strong>{summary.executeNowBetCount}</strong>
        </article>
        <article>
          <span>Decision gates</span>
          <strong>{summary.decisionGateCount}</strong>
        </article>
        <article>
          <span>Commands</span>
          <strong>{summary.executionCommandCount}</strong>
        </article>
        <article>
          <span>Critical commands</span>
          <strong>{summary.criticalExecutionCommandCount}</strong>
        </article>
        <article>
          <span>Scorecards</span>
          <strong>{summary.executionScorecardCount}</strong>
        </article>
        <article>
          <span>Proof-ready</span>
          <strong>{summary.proofReadyExecutionScorecardCount}</strong>
        </article>
        <article>
          <span>External review</span>
          <strong>{summary.externalReviewExecutionScorecardCount}</strong>
        </article>
        <article>
          <span>Market sources</span>
          <strong>{summary.competitorSourceCount}</strong>
        </article>
        <article>
          <span>Market patterns</span>
          <strong>{summary.competitorBuildPatternCount}</strong>
        </article>
        <article>
          <span>Standards</span>
          <strong>{summary.standards.length}</strong>
        </article>
        <article>
          <span>Agents</span>
          <strong>{summary.agents.length}</strong>
        </article>
        <article>
          <span>Routes</span>
          <strong>{summary.routes.length}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>{summary.nextBuildStep}</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.roadmap.map((item, index) => (
            <div className="layer-row" key={item.phase}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>
                {item.phase}: {item.objective}
              </strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Strategic execution bets">
        <div className="section-heading">
          <p className="eyebrow">Strategic execution bets</p>
          <h2>{summary.recommendedStrategicSequence}</h2>
          <p className="section-copy">
            Each bet must retain a proof metric, stop condition, owner set, proof route, and boundary before it moves
            into buyer-facing execution.
          </p>
        </div>
        {summary.executionBets.map((bet) => (
          <article className="module-row" key={bet.slug}>
            <div>
              <span>{bet.horizon}</span>
              <h2>{bet.name}</h2>
            </div>
            <p>{bet.thesis}</p>
            <div>
              <strong>{bet.buildMotion}</strong>
              <ul className="compact-list">
                <li>Sell: {bet.sellMotion}</li>
                <li>Metric: {bet.proofMetric}</li>
                <li>Stop: {bet.stopCondition}</li>
                <li>Owners: {bet.owners.join(", ")}</li>
                <li>Proof: {bet.proofRoutes.join(", ")}</li>
                <li>Boundary: {bet.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Strategic execution command plan">
        <div className="section-heading">
          <p className="eyebrow">Command plan</p>
          <h2>Strategy becomes an execution queue with horizons, proof, owners, revenue motions, and blocked expansion.</h2>
          <p className="section-copy">
            Run critical this-week commands first, then expand only when the matching decision gates and proof routes
            are complete.
          </p>
        </div>
        {summary.executionCommands.map((command) => (
          <article className="module-row" key={command.slug}>
            <div>
              <span>
                {command.horizon} / {command.priority}
              </span>
              <h2>{command.lane}</h2>
            </div>
            <p>{command.objective}</p>
            <div>
              <strong>{command.executionMove}</strong>
              <ul className="compact-list">
                <li>Commercial outcome: {command.commercialOutcome}</li>
                <li>Cadence: {command.operatingCadence}</li>
                <li>Owners: {command.owners.join(", ")}</li>
                <li>Proof routes: {command.proofRoutes.join(", ")}</li>
                <li>Required proof: {command.requiredProof.join(", ")}</li>
                <li>Decision gates: {command.decisionGateSlugs.join(", ")}</li>
                <li>Revenue motion: {command.revenueMotion}</li>
                <li>Metric: {command.successMetric}</li>
                <li>Blocked expansion: {command.blockedExpansion.join(", ")}</li>
                <li>Boundary: {command.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Strategic execution scorecards">
        <div className="section-heading">
          <p className="eyebrow">Execution scorecards</p>
          <h2>Each strategic command carries proof state, missing evidence, escalation path, and promotion criteria.</h2>
          <p className="section-copy">
            Scorecards keep this work honest: current proof can sell the next step, missing proof blocks overreach, and
            demotion triggers preserve safety when evidence weakens.
          </p>
        </div>
        {summary.executionScorecards.map((scorecard) => (
          <article className="module-row" key={scorecard.commandSlug}>
            <div>
              <span>
                {scorecard.scoreState} / {scorecard.evidenceState}
              </span>
              <h2>{scorecard.commandLane}</h2>
            </div>
            <p>{scorecard.strategicSignal}</p>
            <div>
              <strong>{scorecard.nextCheckpoint}</strong>
              <ul className="compact-list">
                <li>Current proof: {scorecard.currentProof.join(", ")}</li>
                <li>Missing proof: {scorecard.missingProof.join(", ")}</li>
                <li>Leading: {scorecard.leadingIndicator}</li>
                <li>Lagging: {scorecard.laggingIndicator}</li>
                <li>Escalation: {scorecard.escalationPath}</li>
                <li>Promotion: {scorecard.promotionCriteria.join(", ")}</li>
                <li>Demotion: {scorecard.demotionTriggers.join(", ")}</li>
                <li>Boundary: {scorecard.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Strategic decision gates">
        <div className="section-heading">
          <p className="eyebrow">Strategic decision gates</p>
          <h2>Every strategic move has an allow condition, a block condition, and an accountable review owner.</h2>
        </div>
        {summary.decisionGates.map((gate) => (
          <article className="module-row" key={gate.slug}>
            <div>
              <span>{gate.decisionOwner}</span>
              <h2>{gate.gate}</h2>
            </div>
            <p>{gate.trigger}</p>
            <div>
              <strong>Allow: {gate.allowIf}</strong>
              <ul className="compact-list">
                <li>Required: {gate.requiredEvidence.join(", ")}</li>
                <li>Block: {gate.blockIf}</li>
                <li>Proof: {gate.proofRoutes.join(", ")}</li>
                <li>Boundary: {gate.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Competitive market intelligence feed">
        <div className="section-heading">
          <p className="eyebrow">Competitive feed</p>
          <h2>Public competitor signals now feed SCRIMED strategy, product build, proof metrics, and guardrails.</h2>
          <p className="section-copy">{summary.competitiveMarketIntelligence.boundary}</p>
        </div>
        {summary.competitiveMarketIntelligence.patterns.slice(0, 3).map((pattern) => (
          <article className="module-row" key={pattern.slug}>
            <div>
              <span>{pattern.priority}</span>
              <h2>{pattern.title}</h2>
            </div>
            <p>{pattern.healthcareIntelligenceUpgrade}</p>
            <div>
              <Link className="module-link" href={summary.competitiveMarketIntelligenceRoute}>
                Inspect competitive intelligence
              </Link>
              <ul className="compact-list">
                <li>Infrastructure: {pattern.infrastructureMoves.slice(0, 3).join(", ")}</li>
                <li>Metrics: {pattern.proofMetrics.slice(0, 3).join(", ")}</li>
                <li>Gates: {pattern.governanceGates.slice(0, 3).join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Strategic platform patterns">
        <div className="section-heading">
          <p className="eyebrow">Coded patterns</p>
          <h2>Source-informed ideas become SCRIMED-specific product work, proof metrics, and guardrails.</h2>
        </div>
        {summary.patterns.map((pattern) => (
          <article className="module-row" key={pattern.slug}>
            <div>
              <span>{pattern.priority}</span>
              <h2>{pattern.title}</h2>
            </div>
            <p>{pattern.productThesis}</p>
            <div>
              <strong>{pattern.scrimedImplementation}</strong>
              <ul className="compact-list">
                <li>Sources: {pattern.sourceNames.join(", ")}</li>
                <li>Agents: {pattern.agents.join(", ")}</li>
                <li>Standards: {pattern.interoperabilityStandards.join(", ")}</li>
                <li>Next: {pattern.nextBuildStep}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Source review">
        <div className="section-heading">
          <p className="eyebrow">Source review</p>
          <h2>Public sources are used as strategy inputs, not implied partnerships or copied product claims.</h2>
        </div>
        {summary.sources.map((source) => (
          <article className="module-row" key={source.name}>
            <div>
              <span>source</span>
              <h2>{source.name}</h2>
            </div>
            <p>{source.observedPattern}</p>
            <div>
              <a className="module-link" href={source.url}>
                Open source
              </a>
              <p>{source.scrimedInterpretation}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
