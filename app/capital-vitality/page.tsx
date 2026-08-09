import Link from "next/link";
import { getCapitalVitalitySummary } from "../lib/capitalVitality";
import CapitalReadinessWorkbench from "./CapitalReadinessWorkbench";
import FederalContractReadinessWorkbench from "./FederalContractReadinessWorkbench";
import PublicSectorOpportunityWorkbench from "./PublicSectorOpportunityWorkbench";

export const metadata = {
  title: "SCRIMED Capital Vitality",
  description:
    "SCRIMED capital vitality map for investor readiness, funding workstreams, public-sector acquisition readiness, and retained external-review gates."
};

export default function CapitalVitalityPage() {
  const summary = getCapitalVitalitySummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/hub">Hub</Link>
        <p className="eyebrow">Capital Vitality</p>
        <h1>SCRIMED turns revenue, moat, and funding readiness into one governed growth lane.</h1>
        <p className="hero-text">
          This lane packages sellable revenue capabilities, competitive proof, investor diligence, capital-source strategy, and public-sector opportunity qualification while keeping securities, procurement, registration, award, PHI, security, and live-care boundaries explicit.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Capital Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/product">Product Console</Link>
          <Link className="secondary-action" href="/pricing">Pricing</Link>
          <Link className="secondary-action" href="/public-market-readiness">Public Market Readiness</Link>
          <Link className="secondary-action" href="/pilot-deal-room">Deal Room</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Capital vitality summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Revenue capabilities</span>
          <strong>{summary.revenueCapabilityCount}</strong>
        </article>
        <article>
          <span>Packaged</span>
          <strong>{summary.packagedRevenueCapabilityCount}</strong>
        </article>
        <article>
          <span>Protected gated</span>
          <strong>{summary.protectedGatedRevenueCapabilityCount}</strong>
        </article>
        <article>
          <span>Moat signals</span>
          <strong>{summary.moatSignalCount}</strong>
        </article>
        <article>
          <span>High moat</span>
          <strong>{summary.highMoatSignalCount}</strong>
        </article>
        <article>
          <span>Investor milestones</span>
          <strong>{summary.investorMilestoneCount}</strong>
        </article>
        <article>
          <span>Funding workstreams</span>
          <strong>{summary.fundingWorkstreamCount}</strong>
        </article>
        <article>
          <span>External review gates</span>
          <strong>{summary.retainedExternalReviewCount}</strong>
        </article>
        <article>
          <span>Proof routes</span>
          <strong>{summary.proofRouteCount}</strong>
        </article>
        <article>
          <span>Diligence artifacts</span>
          <strong>{summary.investorDiligenceManifest.artifactCount}</strong>
        </article>
        <article>
          <span>Funding release blockers</span>
          <strong>{summary.investorDiligenceManifest.blockingArtifactCount}</strong>
        </article>
        <article>
          <span>Capital access lanes</span>
          <strong>{summary.capitalAcquisitionReadiness.capitalAccessLaneCount}</strong>
        </article>
        <article>
          <span>Public-sector gates</span>
          <strong>{summary.capitalAcquisitionReadiness.readinessGateCount}</strong>
        </article>
        <article>
          <span>Capture proof artifacts</span>
          <strong>{summary.capitalAcquisitionCapturePacket.proofArtifactCount}</strong>
        </article>
        <article>
          <span>Federal readiness checkpoints</span>
          <strong>{summary.capitalAcquisitionReadiness.federalContractReadiness.checkpointCount}</strong>
        </article>
        <article>
          <span>Default SAM decision</span>
          <strong>{summary.capitalAcquisitionReadiness.federalContractReadiness.defaultDecision}</strong>
        </article>
      </section>

      <CapitalReadinessWorkbench />

      <section className="table-section" aria-label="Capital access lanes">
        <div className="section-heading">
          <p className="eyebrow">Capital access strategy</p>
          <h2>Use distinct evidence and review paths for private capital, strategic capital, contract revenue, and non-dilutive funding.</h2>
          <p className="section-copy">
            No lane below is an eligibility, registration, offering, award, or partnership claim. Each lane remains tied to current official evidence, exact artifacts, and named human reviewers.
          </p>
        </div>
        {summary.capitalAcquisitionReadiness.capitalAccessLanes.map((lane) => (
          <article className="module-row" key={lane.id}>
            <div>
              <span>{lane.status}</span>
              <h2>{lane.name}</h2>
            </div>
            <p>{lane.fit}</p>
            <div>
              <strong>{lane.capitalType}</strong>
              <ul className="compact-list">
                <li>Required evidence: {lane.requiredEvidence.join(", ")}</li>
                <li>Reviewers: {lane.requiredReviewers.join(", ")}</li>
                <li>Blocked claims: {lane.blockedClaims.join(", ")}</li>
                <li>Next: {lane.nextAction}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <FederalContractReadinessWorkbench />

      <PublicSectorOpportunityWorkbench />

      <section className="table-section" aria-label="Public-sector readiness gates">
        <div className="section-heading">
          <p className="eyebrow">Government acquisition controls</p>
          <h2>Registration, eligibility, compliance, economics, evidence, and authorization remain weakest-link gates.</h2>
          <p className="section-copy">{summary.capitalAcquisitionReadiness.boundary}</p>
        </div>
        {summary.capitalAcquisitionReadiness.publicSectorReadinessGates.map((gate) => (
          <article className="module-row" key={gate.id}>
            <div>
              <span>{gate.defaultStatus}</span>
              <h2>{gate.name}</h2>
            </div>
            <p>{gate.nextAction}</p>
            <div>
              <strong>{gate.owner}</strong>
              <ul className="compact-list">
                <li>Stage: {gate.stage}</li>
                <li>Blocks submission: {gate.blocksSubmission ? "yes" : "no"}</li>
                <li>Required evidence: {gate.requiredEvidence.join(", ")}</li>
                <li>Blocked claims: {gate.blockedClaims.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Official capital and public-sector sources">
        <div className="section-heading">
          <p className="eyebrow">Official source registry</p>
          <h2>Current authority comes from the official source, not from an internal readiness score.</h2>
        </div>
        {summary.capitalAcquisitionReadiness.officialReadinessSources.map((source) => (
          <article className="module-row" key={source.id}>
            <div>
              <span>reviewed {source.reviewedAt}</span>
              <h2>{source.title}</h2>
            </div>
            <p>{source.readinessUse}</p>
            <div>
              <strong>{source.authority}</strong>
              <ul className="compact-list">
                <li><a href={source.url} rel="noreferrer" target="_blank">Open official source</a></li>
                <li>{source.freshnessPolicy}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>Growth readiness is not a funding solicitation, valuation claim, or approval claim.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>01</span>
            <strong>{summary.fundingVitalityPosture}</strong>
          </div>
          <div className="layer-row">
            <span>02</span>
            <strong>{summary.authority.securitiesAuthority}</strong>
          </div>
          <div className="layer-row">
            <span>03</span>
            <strong>{summary.authority.investmentAdvice}</strong>
          </div>
          <div className="layer-row">
            <span>04</span>
            <strong>{summary.authority.valuationAuthority}</strong>
          </div>
        </div>
      </section>

      <section className="table-section" aria-label="Revenue capabilities">
        <div className="section-heading">
          <p className="eyebrow">Revenue capability</p>
          <h2>Sellable paths are packaged around synthetic, governed, and review-only value before production authority.</h2>
        </div>
        {summary.revenueCapabilities.map((capability) => (
          <article className="module-row" key={capability.name}>
            <div>
              <span>{capability.status}</span>
              <h2>{capability.name}</h2>
            </div>
            <p>{capability.revenueMotion}</p>
            <div>
              <strong>{capability.buyer}</strong>
              <ul className="compact-list">
                <li>{capability.priceLogic}</li>
                <li>{capability.limitation}</li>
                <li>Next: {capability.nextAction}</li>
                <li>Proof routes: {capability.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Competitive moat signals">
        <div className="section-heading">
          <p className="eyebrow">Competitive edge</p>
          <h2>The moat is proof-backed workflow infrastructure, not broad market language.</h2>
        </div>
        {summary.competitiveMoatSignals.map((signal) => (
          <article className="module-row" key={signal.name}>
            <div>
              <span>{signal.strength}</span>
              <h2>{signal.name}</h2>
            </div>
            <p>{signal.evidence}</p>
            <div>
              <strong>{signal.defendability}</strong>
              <ul className="compact-list">
                <li>{signal.retainedBoundary}</li>
                <li>Proof routes: {signal.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Investor readiness milestones">
        <div className="section-heading">
          <p className="eyebrow">Investor readiness</p>
          <h2>Funding vitality improves when every investor question points to current proof and retained limits.</h2>
        </div>
        {summary.investorReadinessMilestones.map((milestone) => (
          <article className="module-row" key={milestone.name}>
            <div>
              <span>{milestone.status}</span>
              <h2>{milestone.name}</h2>
            </div>
            <p>{milestone.investorQuestion}</p>
            <div>
              <strong>{milestone.evidence}</strong>
              <ul className="compact-list">
                <li>{milestone.fundingImpact}</li>
                <li>{milestone.retainedBoundary}</li>
                <li>Proof routes: {milestone.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Funding vitality workstreams">
        <div className="section-heading">
          <p className="eyebrow">Funding workstreams</p>
          <h2>Capital readiness is operationalized as owned work, proof routes, and explicit review gates.</h2>
          <p className="section-copy">{summary.nextCapitalMove}</p>
        </div>
        {summary.fundingVitalityWorkstreams.map((workstream) => (
          <article className="module-row" key={workstream.name}>
            <div>
              <span>{workstream.status}</span>
              <h2>{workstream.name}</h2>
            </div>
            <p>{workstream.capability}</p>
            <div>
              <strong>{workstream.owner}</strong>
              <ul className="compact-list">
                <li>Proof: {workstream.proof}</li>
                <li>{workstream.limitation}</li>
                <li>Next: {workstream.nextAction}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Investor diligence manifest">
        <div className="section-heading">
          <p className="eyebrow">Investor diligence manifest</p>
          <h2>Every financing blocker now has an owner, metadata contract, reviewer roles, and one safe next action.</h2>
          <p className="section-copy">
            The manifest stores no raw financial statements, contracts, cap tables, customer records, PHI, credentials, or security findings. External fundraising release remains blocked until qualified systems retain approved references and a separate recipient-scoped release decision exists.
          </p>
        </div>
        {summary.investorDiligenceManifest.artifacts.map((artifact) => (
          <article className="module-row" key={artifact.id}>
            <div>
              <span>{artifact.status}</span>
              <h2>{artifact.title}</h2>
            </div>
            <p>{artifact.nextAction}</p>
            <div>
              <strong>{artifact.owner}</strong>
              <ul className="compact-list">
                <li>Shareability: {artifact.shareability}</li>
                <li>Reviewer roles: {artifact.requiredReviewerRoles.join(", ")}</li>
                <li>Required metadata: {artifact.requiredMetadata.join(", ")}</li>
                <li>Blocks external fundraising release: {artifact.blocksExternalFundraisingRelease ? "yes" : "no"}</li>
                <li>Proof routes: {artifact.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
        <div className="workbench-export-lock">
          <strong>{summary.investorDiligenceManifest.releaseAssessment.decision}</strong>
          <p>{summary.investorDiligenceManifest.releaseAssessment.nextAction}</p>
          <p>External release authorized: no.</p>
        </div>
      </section>
    </main>
  );
}
