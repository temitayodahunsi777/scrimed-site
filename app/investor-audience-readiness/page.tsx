import Link from "next/link";
import { getInvestorAudienceReadinessSummary } from "../lib/investorAudienceReadiness";

export const metadata = {
  title: "SCRIMED Investor and Audience Readiness",
  description:
    "SCRIMED weakness relief, competitive edge, sellable value, and audience-specific readiness packets for investors, clinics, buyers, and partners."
};

export default function InvestorAudienceReadinessPage() {
  const summary = getInvestorAudienceReadinessSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/hub">Hub</Link>
        <p className="eyebrow">Investor and audience readiness</p>
        <h1>SCRIMED now turns weaknesses into owned relief tracks and investor-ready audience packets.</h1>
        <p className="hero-text">
          This control plane packages angel, corporate strategic, private investor, faith-based clinic, health system, payer, public-sector, clinician, global partner, and transformation-sponsor paths while preserving no-securities, no-solicitation, no-tax-advice, no-PHI, and no-live-care boundaries.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Audience Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/capital-vitality">Capital Vitality</Link>
          <Link className="secondary-action" href="/growth-engine">Growth Engine</Link>
          <Link className="secondary-action" href="/enterprise-business-ops">Business Ops</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Investor audience readiness summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Weakness tracks</span>
          <strong>{summary.weaknessTrackCount}</strong>
        </article>
        <article>
          <span>High severity</span>
          <strong>{summary.highWeaknessCount}</strong>
        </article>
        <article>
          <span>Edge signals</span>
          <strong>{summary.competitiveEdgeSignalCount}</strong>
        </article>
        <article>
          <span>Audience packets</span>
          <strong>{summary.audiencePacketCount}</strong>
        </article>
        <article>
          <span>Ready now</span>
          <strong>{summary.readyNowAudienceCount}</strong>
        </article>
        <article>
          <span>Package next</span>
          <strong>{summary.packageNextAudienceCount}</strong>
        </article>
        <article>
          <span>External review</span>
          <strong>{summary.externalReviewAudienceCount}</strong>
        </article>
        <article>
          <span>Readiness gates</span>
          <strong>{summary.readinessGateCount}</strong>
        </article>
        <article>
          <span>Blocked claims</span>
          <strong>{summary.blockedClaimCount}</strong>
        </article>
        <article>
          <span>Strategic targets</span>
          <strong>{summary.strategicTargetCount}</strong>
        </article>
        <article>
          <span>Meeting packets</span>
          <strong>{summary.strategicMeetingPacketCount}</strong>
        </article>
        <article>
          <span>Diligence ready</span>
          <strong>{summary.diligenceEvidenceReadyCount}</strong>
        </article>
        <article>
          <span>Review still required</span>
          <strong>{summary.diligenceReviewRequiredCount}</strong>
        </article>
        <article>
          <span>Funding release blockers</span>
          <strong>{summary.fundingReleaseBlockerCount}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Investor audience boundary">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>Investment and audience preparation stays powerful because it does not overstep authority.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>01</span>
            <strong>{summary.authority.securitiesAuthority}</strong>
          </div>
          <div className="layer-row">
            <span>02</span>
            <strong>{summary.authority.solicitationAuthority}</strong>
          </div>
          <div className="layer-row">
            <span>03</span>
            <strong>{summary.authority.taxAuthority}</strong>
          </div>
          <div className="layer-row">
            <span>04</span>
            <strong>{summary.authority.phiAuthority}</strong>
          </div>
        </div>
      </section>

      <section className="table-section" aria-label="Strategic investor ecosystem targets">
        <div className="section-heading">
          <p className="eyebrow">Strategic outreach</p>
          <h2>Four company-specific theses replace generic logo outreach.</h2>
          <p className="section-copy">
            Each path names the official ecosystem program, a specific evidence-backed ask, the proof routes to open, and the claims that must stay blocked. No outreach has been sent and no investment or partnership is implied.
          </p>
        </div>
        {summary.strategicInvestorOutreach.targets.map((target) => (
          <article className="module-row" key={target.id}>
            <div>
              <span>{target.outreachStatus}</span>
              <h2>{target.organization}</h2>
            </div>
            <p>{target.proofThesis}</p>
            <div>
              <strong>{target.specificAsk}</strong>
              <ul className="compact-list">
                <li>Strategic fit: {target.strategicFit}</li>
                <li>Official path: <a href={target.officialSource} rel="noreferrer" target="_blank">{target.officialProgram}</a></li>
                <li>Proof: {target.proofRoutes.join(", ")}</li>
                <li>Diligence: {target.diligenceRequirements.join(", ")}</li>
                <li>Boundary: {target.claimBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Strategic investor meeting room">
        <div className="section-heading">
          <p className="eyebrow">Meeting room</p>
          <h2>Each strategic conversation now has an objective, proof sequence, hard questions, exact ask, and controlled next step.</h2>
          <p className="section-copy">
            OpenAI is approached through verified startup and healthcare ecosystem paths first. A direct investment path is not assumed, every packet remains an internal preparation artifact, and external release still requires founder, legal, finance, claims, and provenance approval.
          </p>
        </div>
        {summary.strategicInvestorOutreach.meetingProfiles.map((profile) => (
          <article className="module-row" key={profile.targetId}>
            <div>
              <span>{profile.packetStatus}</span>
              <h2>{profile.organization}</h2>
            </div>
            <p>{profile.openingNarrative}</p>
            <div>
              <strong>{profile.specificAsk}</strong>
              <ul className="compact-list">
                <li>Objective: {profile.firstMeetingObjective}</li>
                <li>Non-goal: {profile.firstMeetingNonGoal}</li>
                <li>Engagement lane: {profile.engagementLane}</li>
                <li>Funding path: {profile.fundingPathStatus}</li>
                <li>Proof sequence: {profile.demoSequence.map((step) => step.route).join(" -> ")}</li>
                <li>Mutual next step: {profile.mutualNextStep}</li>
                <li>External release authorized: {profile.externalReleaseAuthorized ? "yes" : "no"}</li>
              </ul>
              <a
                className="secondary-action"
                href={`${summary.strategicInvestorOutreach.meetingPacketRoute}?target=${profile.targetId}&format=markdown`}
              >
                Download {profile.organization} Meeting Brief
              </a>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Funding release controls">
        <div className="section-heading">
          <p className="eyebrow">Funding release controls</p>
          <h2>Meeting preparation is ready; external fundraising material remains blocked until the weakest evidence links close.</h2>
          <p className="section-copy">
            This ledger prevents a polished presentation from outrunning financial reconciliation, securities review, permissioned customer evidence, independent assurance, or immutable packet provenance.
          </p>
        </div>
        {summary.strategicInvestorOutreach.fundingReadinessControls.map((control) => (
          <article className="module-row" key={control.id}>
            <div>
              <span>{control.status}</span>
              <h2>{control.title}</h2>
            </div>
            <p>{control.requiredEvidence}</p>
            <div>
              <strong>{control.owner}</strong>
              <ul className="compact-list">
                <li>Completion: {control.completionRule}</li>
                <li>Blocks fundraising release: {control.blocksFundraisingRelease ? "yes" : "no"}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Strategic diligence manifest">
        <div className="section-heading">
          <p className="eyebrow">Diligence manifest</p>
          <h2>What is ready, what needs qualified review, and what still needs external evidence.</h2>
          <p className="section-copy">{summary.strategicInvestorOutreach.boundary}</p>
        </div>
        {summary.strategicInvestorOutreach.diligenceManifest.map((item) => (
          <article className="module-row" key={item.id}>
            <div>
              <span>{item.status}</span>
              <h2>{item.title}</h2>
            </div>
            <p>{item.nextEvidence}</p>
            <div>
              <strong>{item.owner}</strong>
              <ul className="compact-list">
                <li>Category: {item.category}</li>
                <li>Evidence: {item.evidenceRoutes.join(", ")}</li>
                <li>Boundary: {item.disclosureBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band split-band" aria-label="Strategic pitch and outreach sequence">
        <div>
          <p className="eyebrow">Pitch architecture</p>
          <h2>A twelve-question deck earns the next diligence step.</h2>
          <div className="layer-list">
            {summary.strategicInvestorOutreach.pitchOutline.map((slide) => (
              <div className="layer-row" key={slide.order}>
                <span>{String(slide.order).padStart(2, "0")}</span>
                <strong>{slide.title}: {slide.decisionQuestion}</strong>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="eyebrow">Controlled outreach</p>
          <h2>Every external step remains human-approved.</h2>
          <div className="layer-list">
            {summary.strategicInvestorOutreach.outreachStages.map((stage) => (
              <div className="layer-row" key={stage.order}>
                <span>{String(stage.order).padStart(2, "0")}</span>
                <strong>{stage.stage}: {stage.exitEvidence}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="table-section" aria-label="Weakness relief tracks">
        <div className="section-heading">
          <p className="eyebrow">Weakness relief</p>
          <h2>Each weakness now has an owner, workaround, proof route, success metric, and graduation gate.</h2>
          <p className="section-copy">{summary.nextInvestorMove}</p>
        </div>
        {summary.weaknessReliefTracks.map((track) => (
          <article className="module-row" key={track.weakness}>
            <div>
              <span>{track.severity}</span>
              <h2>{track.weakness}</h2>
            </div>
            <p>{track.currentExposure}</p>
            <div>
              <strong>{track.reliefSystem}</strong>
              <ul className="compact-list">
                <li>Owner: {track.owner}</li>
                <li>Workaround: {track.workaround}</li>
                <li>Metric: {track.successMetric}</li>
                <li>Gate: {track.graduationGate}</li>
                <li>Proof: {track.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Competitive edge signals">
        <div className="section-heading">
          <p className="eyebrow">Competitive edge</p>
          <h2>The sellable story is healthcare workflow infrastructure with proof, governance, and audience packaging.</h2>
        </div>
        {summary.competitiveEdgeSignals.map((signal) => (
          <article className="module-row" key={signal.signal}>
            <div>
              <span>edge</span>
              <h2>{signal.signal}</h2>
            </div>
            <p>{signal.pitchLine}</p>
            <div>
              <strong>{signal.sellableValue}</strong>
              <ul className="compact-list">
                <li>{signal.uniqueness}</li>
                <li>{signal.defensibility}</li>
                <li>{signal.retainedBoundary}</li>
                <li>Proof: {signal.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Investor and buyer audience packets">
        <div className="section-heading">
          <p className="eyebrow">Audience packets</p>
          <h2>Each target audience gets a distinct value story, diligence packet, next move, and blocked-claim list.</h2>
        </div>
        {summary.investorAudiencePackets.map((packet) => (
          <article className="module-row" key={packet.audience}>
            <div>
              <span>{packet.readinessStatus}</span>
              <h2>{packet.audience}</h2>
            </div>
            <p>{packet.primaryQuestion}</p>
            <div>
              <strong>{packet.sellableValue}</strong>
              <ul className="compact-list">
                <li>Pitch: {packet.pitchAngle}</li>
                <li>Packet: {packet.diligencePacket.join(", ")}</li>
                <li>Next: {packet.nextMove}</li>
                <li>Review: {packet.requiredReview}</li>
                <li>Blocked: {packet.blockedClaims.join(", ")}</li>
                <li>Proof: {packet.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Investor readiness gates">
        <div className="section-heading">
          <p className="eyebrow">Readiness gates</p>
          <h2>Official and internal guardrails keep fundraising, faith-clinic, and diligence work reviewable.</h2>
        </div>
        {summary.investorReadinessGates.map((gate) => (
          <article className="module-row" key={gate.gate}>
            <div>
              <span>{gate.owner}</span>
              <h2>{gate.gate}</h2>
            </div>
            <p>{gate.readinessUse}</p>
            <div>
              <strong>{gate.source}</strong>
              <ul className="compact-list">
                <li>Source: {gate.sourceUrl}</li>
                <li>Hard stop: {gate.hardStop}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
