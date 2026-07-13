import Link from "next/link";
import { getCompanyAssessmentSummary } from "../lib/companyAssessment";

export const metadata = {
  title: "SCRIMED Company Assessment",
  description:
    "SCRIMED company operating assessment for product, revenue, compliance, AI, delivery, security, scale, investor, and launch readiness."
};

export default function CompanyAssessmentPage() {
  const summary = getCompanyAssessmentSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/hub">Hub</Link>
        <p className="eyebrow">Company operating assessment</p>
        <h1>SCRIMED now has a company-wide cockpit for strengths, gaps, upgrades, risks, and proof routes.</h1>
        <p className="hero-text">
          This layer assesses SCRIMED across product, service delivery, revenue, margin,
          approvals, cybersecurity posture, health-record safety, AI platform power, launch
          readiness, investor readiness, limitations, and enterprise operations.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>
            Download company brief
          </a>
          <a className="secondary-action" href={summary.apiRoute}>
            Inspect API
          </a>
          <Link className="secondary-action" href="/product">
            Open Product Console
          </Link>
          <Link className="secondary-action" href="/service-delivery">
            Open delivery workbench
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Company assessment summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Readiness score</span>
          <strong>{summary.overallScore}</strong>
        </article>
        <article>
          <span>Dimensions</span>
          <strong>{summary.dimensionCount}</strong>
        </article>
        <article>
          <span>Strong lanes</span>
          <strong>{summary.strongDimensionCount}</strong>
        </article>
        <article>
          <span>Watch lanes</span>
          <strong>{summary.watchDimensionCount}</strong>
        </article>
        <article>
          <span>Upgrade lanes</span>
          <strong>{summary.upgradeNowDimensionCount}</strong>
        </article>
        <article>
          <span>Workstreams</span>
          <strong>{summary.upgradeWorkstreamCount}</strong>
        </article>
        <article>
          <span>Audit findings</span>
          <strong>{summary.auditFindingCount}</strong>
        </article>
        <article>
          <span>Revenue builders</span>
          <strong>{summary.revenueBuilderCount}</strong>
        </article>
        <article>
          <span>Edge amplifiers</span>
          <strong>{summary.competitiveEdgeAmplifierCount}</strong>
        </article>
        <article>
          <span>Priority fixes</span>
          <strong>{summary.improvementPriorityCount}</strong>
        </article>
        <article>
          <span>Missing closures</span>
          <strong>{summary.missingCapabilityClosureCount}</strong>
        </article>
        <article>
          <span>Hard stops</span>
          <strong>{summary.hardStopCount}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Company posture">
        <div>
          <p className="eyebrow">Company posture</p>
          <h2>{summary.readinessBand}</h2>
          <p className="section-copy">{summary.recommendedCompanyPosture}</p>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {Object.entries(summary.authority).map(([key, value], index) => (
            <div className="layer-row" key={key}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{key}: {value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Assessment dimensions">
        <div className="section-heading">
          <p className="eyebrow">Assessment dimensions</p>
          <h2>Each company lane has a score, owner, weakness, upgrade path, evidence route, and retained boundary.</h2>
        </div>
        {summary.dimensions.map((dimension) => (
          <article className="module-row" key={dimension.name}>
            <div>
              <span>{dimension.status}</span>
              <h2>{dimension.name}</h2>
            </div>
            <p>{dimension.currentStrength}</p>
            <div>
              <strong>{dimension.score}/100 - {dimension.owner}</strong>
              <ul className="compact-list">
                <li>Weakness: {dimension.weakness}</li>
                <li>Upgrade: {dimension.upgrade}</li>
                <li>Evidence: {dimension.evidenceSnapshot}</li>
                <li>Routes: {dimension.evidenceRoutes.join(", ")}</li>
                <li>{dimension.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Company strengths">
        <div className="section-heading">
          <p className="eyebrow">Strengths to harden</p>
          <h2>The assessment converts current advantages into owned operating assets.</h2>
        </div>
        <div className="principle-grid">
          {summary.companyStrengths.map((strength, index) => (
            <article key={strength}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{strength}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Whole company audit findings">
        <div className="section-heading">
          <p className="eyebrow">Whole-company audit</p>
          <h2>Strengths, weaknesses, revenue impact, and competitor pressure are now reviewed in one place.</h2>
        </div>
        {summary.companyAuditFindings.map((finding) => (
          <article className="module-row" key={finding.area}>
            <div>
              <span>{finding.rating}</span>
              <h2>{finding.area}</h2>
            </div>
            <p>{finding.strength}</p>
            <div>
              <strong>{finding.revenueImpact}</strong>
              <ul className="compact-list">
                <li>Weakness: {finding.weakness}</li>
                <li>Improve: {finding.improvement}</li>
                <li>Market signal: {finding.competitiveSignal}</li>
                <li>Proof: {finding.proofRoutes.join(", ")}</li>
                <li>{finding.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Revenue builders">
        <div className="section-heading">
          <p className="eyebrow">Revenue builders</p>
          <h2>Current capabilities now resolve into concrete paid motions with margin levers and conversion paths.</h2>
        </div>
        {summary.revenueBuilders.map((builder) => (
          <article className="module-row" key={builder.name}>
            <div>
              <span>paid motion</span>
              <h2>{builder.name}</h2>
            </div>
            <p>{builder.packageMotion}</p>
            <div>
              <strong>{builder.marginLever}</strong>
              <ul className="compact-list">
                <li>Buyer: {builder.buyer}</li>
                <li>Conversion: {builder.conversionPath}</li>
                <li>Proof: {builder.proofRoutes.join(", ")}</li>
                <li>{builder.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Competitive edge amplifiers">
        <div className="section-heading">
          <p className="eyebrow">Competitive edge</p>
          <h2>Make SCRIMED differentiators obvious before buyers compare us to point solutions or incumbents.</h2>
        </div>
        <div className="principle-grid">
          {summary.competitiveEdgeAmplifiers.map((edge) => (
            <article key={edge.name}>
              <span>amplifier</span>
              <h3>{edge.name}</h3>
              <p>{edge.scrimedEdge}</p>
              <ul className="compact-list">
                <li>Action: {edge.makeApparentBy}</li>
                <li>Pressure: {edge.marketPressure}</li>
                <li>Proof: {edge.buyerProof}</li>
                <li>Routes: {edge.proofRoutes.join(", ")}</li>
                <li>{edge.retainedBoundary}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Improvement priorities">
        <div className="section-heading">
          <p className="eyebrow">Priority fixes</p>
          <h2>These are the highest-leverage improvements to increase buyer clarity, revenue quality, and defensibility.</h2>
        </div>
        {summary.improvementPriorities.map((priority) => (
          <article className="module-row" key={priority.name}>
            <div>
              <span>{priority.priority}</span>
              <h2>{priority.name}</h2>
            </div>
            <p>{priority.gap}</p>
            <div>
              <strong>{priority.owner}</strong>
              <ul className="compact-list">
                <li>Move: {priority.unblockMove}</li>
                <li>Success: {priority.successSignal}</li>
                <li>Proof: {priority.proofRoutes.join(", ")}</li>
                <li>{priority.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Weakness relief queue">
        <div className="section-heading">
          <p className="eyebrow">Weakness relief</p>
          <h2>Weaknesses become owned relief moves instead of vague risk.</h2>
        </div>
        {summary.weaknessReliefQueue.map((weakness) => (
          <article className="module-row" key={weakness.name}>
            <div>
              <span>{weakness.severity}</span>
              <h2>{weakness.name}</h2>
            </div>
            <p>{weakness.currentImpact}</p>
            <div>
              <strong>{weakness.owner}</strong>
              <ul className="compact-list">
                <li>Relief: {weakness.reliefMove}</li>
                <li>Proof: {weakness.proofRoutes.join(", ")}</li>
                <li>{weakness.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Missing capability closure register">
        <div className="section-heading">
          <p className="eyebrow">Missing capability closure</p>
          <h2>Known missing pieces are now paired with current workarounds, permanent builds, owners, and block conditions.</h2>
        </div>
        {summary.missingCapabilityClosures.map((capability) => (
          <article className="module-row" key={capability.slug}>
            <div>
              <span>{capability.severity}</span>
              <h2>{capability.capability}</h2>
            </div>
            <p>{capability.whyItMatters}</p>
            <div>
              <strong>{capability.owner}</strong>
              <ul className="compact-list">
                <li>Now: {capability.currentWorkaround}</li>
                <li>Build: {capability.permanentBuild}</li>
                <li>Success: {capability.successMetric}</li>
                <li>Blocked until: {capability.blockedUntil}</li>
                <li>Proof: {capability.proofRoutes.join(", ")}</li>
                <li>{capability.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Company upgrade workstreams">
        <div className="section-heading">
          <p className="eyebrow">Upgrade workstreams</p>
          <h2>Near-term work is sequenced across company command, approvals, revenue, proof, platform, and scale.</h2>
        </div>
        {summary.upgradeWorkstreams.map((workstream) => (
          <article className="module-row" key={workstream.name}>
            <div>
              <span>{workstream.horizon}</span>
              <h2>{workstream.name}</h2>
            </div>
            <p>{workstream.objective}</p>
            <div>
              <strong>{workstream.owner}</strong>
              <ul className="compact-list">
                <li>Sequence: {workstream.sequence.join(", ")}</li>
                <li>Success: {workstream.successSignal}</li>
                <li>Proof: {workstream.proofRoutes.join(", ")}</li>
                <li>{workstream.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Team operating lanes">
        <div className="section-heading">
          <p className="eyebrow">Team lanes</p>
          <h2>Enterprise-grade execution needs named teams, cadence, roles, stops, and proof routes.</h2>
        </div>
        <div className="principle-grid">
          {summary.companyAssessmentTeamLanes.map((lane) => (
            <article key={lane.team}>
              <span>{lane.operatingCadence}</span>
              <h3>{lane.team}</h3>
              <p>{lane.mandate}</p>
              <ul className="compact-list">
                <li>Roles: {lane.requiredRoles.join(", ")}</li>
                <li>Stops: {lane.approvalStops.join(", ")}</li>
                <li>Proof: {lane.proofRoutes.join(", ")}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band" aria-label="Company hard stops">
        <div className="section-heading">
          <p className="eyebrow">Hard stops</p>
          <h2>These boundaries protect sales, delivery, investors, healthcare trust, and product credibility.</h2>
        </div>
        <div className="layer-list">
          {summary.hardStops.map((hardStop, index) => (
            <div className="layer-row" key={hardStop}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{hardStop}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band" aria-label="Priority sequence">
        <div className="section-heading">
          <p className="eyebrow">Priority sequence</p>
          <h2>{summary.nextCompanyMove}</h2>
        </div>
        <div className="principle-grid">
          {summary.prioritySequence.map((step, index) => (
            <article key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{step}</h3>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
