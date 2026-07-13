import Link from "next/link";
import { getEnterpriseHealthcareInfrastructureSummary } from "../lib/enterpriseHealthcareInfrastructure";

export const metadata = {
  title: "SCRIMED Enterprise Healthcare Infrastructure Readiness",
  description:
    "Synthetic SCRIMED hospital IT readiness map across FHIR, HL7, DICOM, PACS, RIS, HIS, X12, VPNs, firewalls, databases, edge runtime, and governed agents."
};

export default function EnterpriseHealthcareInfrastructurePage() {
  const summary = getEnterpriseHealthcareInfrastructureSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/interoperability">
          Interoperability
        </Link>
        <p className="eyebrow">SCRIMED Enterprise Healthcare Infrastructure Readiness</p>
        <h1>Map hospital IT reality into governed SCRIMED proof, pilots, and revenue paths.</h1>
        <p className="hero-text">{summary.boundary}</p>
        <div className="hero-actions" aria-label="Enterprise Healthcare Infrastructure actions">
          <Link href={summary.apiRoute}>Inspect API</Link>
          <Link href={summary.briefRoute}>Download Brief</Link>
          <Link href="/interoperability/evaluations">Conformance Kits</Link>
          <Link href="/scrimed-cyber-defense">Cyber Defense</Link>
          <Link href="/health-records">Health Records</Link>
          <Link href="/scrimed-proof-packet-studio">Proof Packets</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Enterprise Healthcare Infrastructure scorecard">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Capabilities</span>
          <strong>{summary.scorecard.totalCapabilities}</strong>
        </article>
        <article>
          <span>Synthetic-ready</span>
          <strong>{summary.scorecard.syntheticReadyCount}</strong>
        </article>
        <article>
          <span>Discovery required</span>
          <strong>{summary.scorecard.customerDiscoveryRequiredCount}</strong>
        </article>
        <article>
          <span>Buyer score</span>
          <strong>{summary.scorecard.buyerReadinessScore}</strong>
        </article>
        <article>
          <span>Integration score</span>
          <strong>{summary.scorecard.integrationReadinessScore}</strong>
        </article>
        <article>
          <span>Conformance kits</span>
          <strong>{summary.conformanceControlPack.evaluationCount}</strong>
        </article>
        <article>
          <span>Synthetic passes</span>
          <strong>{summary.conformanceControlPack.syntheticPassed}</strong>
        </article>
        <article>
          <span>Security score</span>
          <strong>{summary.scorecard.securityReadinessScore}</strong>
        </article>
        <article>
          <span>Production authority</span>
          <strong>{String(summary.scorecard.productionAuthority)}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Infrastructure operating position">
        <div>
          <p className="eyebrow">Operating Position</p>
          <h2>SCRIMED should meet enterprise buyers where their systems already live.</h2>
          <p className="section-copy">
            This layer organizes FHIR, HL7 ADT, DICOM, DICOMweb, PACS, RIS, HIS, X12, Integration Engines, VPNs,
            Virtual Machines, Client/Server Architecture, Databases, Firewalls, private runtime, and governed agent
            orchestration into one diligence-ready map.
          </p>
        </div>
        <div>
          <p>{summary.buyerConfidenceMessage}</p>
          <p>
            No live PHI, no EHR writeback, no payer submission, no final imaging interpretation, and no production
            connector approval are preserved until qualified review and formal authorization.
          </p>
          <p>Audit hash: {summary.scorecard.auditHash}</p>
        </div>
      </section>

      <section className="table-section" aria-label="Hospital integration conformance control pack">
        <div className="section-heading">
          <p className="eyebrow">Hospital Integration Conformance Control Pack</p>
          <h2>Executable synthetic evidence for FHIR, SMART, HL7 v2, DICOMweb, and X12, with every live lane blocked.</h2>
        </div>
        <article className="module-row">
          <div>
            <span>{summary.conformanceControlPack.status}</span>
            <h2>One governed integration surface</h2>
          </div>
          <p>{summary.conformanceControlPack.commercialOffer}</p>
          <div>
            <strong>
              {summary.conformanceControlPack.syntheticPassed}/{summary.conformanceControlPack.evaluationCount} synthetic evaluations pass
            </strong>
            <ul className="compact-list">
              <li>Live lanes blocked: {summary.conformanceControlPack.liveBlocked}</li>
              <li>Supported lanes: {summary.conformanceControlPack.supportedLanes.join(", ")}</li>
              <li>Reviewers: {summary.conformanceControlPack.requiredReviewRoles.join(", ")}</li>
              <li>Evidence: {summary.conformanceControlPack.evidenceRoutes.join(", ")}</li>
              <li>Expansion: {summary.conformanceControlPack.expansionPath}</li>
              <li>Human review required: {String(summary.conformanceControlPack.humanReviewRequired)}</li>
              <li>Production authority: {String(summary.conformanceControlPack.productionAuthority)}</li>
              <li>Audit hash: {summary.conformanceControlPack.auditHash}</li>
            </ul>
          </div>
        </article>
        {summary.conformanceControlPack.releaseCriteria.map((criterion, index) => (
          <article className="module-row" key={criterion}>
            <div>
              <span>gate {String(index + 1).padStart(2, "0")}</span>
              <h2>Required before live partner testing</h2>
            </div>
            <p>{criterion}</p>
            <div>
              <strong>Fail closed</strong>
              <p>Qualified human approval and retained evidence are required.</p>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Independently applied market design patterns">
        <div className="section-heading">
          <p className="eyebrow">Competitive Architecture Intelligence</p>
          <h2>Public market patterns are applied independently, with SCRIMED governance as the differentiator.</h2>
        </div>
        {summary.competitiveDesignPatterns.map((pattern) => (
          <article className="module-row" key={pattern.id}>
            <div>
              <span>{pattern.sourceOrganization}</span>
              <h2>{pattern.id}</h2>
            </div>
            <p>{pattern.observedMarketPattern}</p>
            <div>
              <strong>{pattern.scrimedApplication}</strong>
              <ul className="compact-list">
                <li>Differentiation: {pattern.scrimedDifferentiation}</li>
                <li>Boundary: {pattern.safetyBoundary}</li>
                <li>
                  <a href={pattern.publicSourceUrl} rel="noreferrer" target="_blank">
                    Public source
                  </a>
                </li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Enterprise infrastructure capabilities">
        <div className="section-heading">
          <p className="eyebrow">Hospital Infrastructure Map</p>
          <h2>Each capability ties buyer pain, standards, proof route, revenue motion, and retained boundary together.</h2>
        </div>
        {summary.capabilities.map((capability) => (
          <article className="module-row" key={capability.id}>
            <div>
              <span>{capability.domain}</span>
              <h2>{capability.name}</h2>
            </div>
            <p>{capability.buyerProblem}</p>
            <div>
              <strong>{capability.readinessStatus}</strong>
              <ul className="compact-list">
                <li>Systems: {capability.standardsOrSystems.join(", ")}</li>
                <li>SCRIMED asset: {capability.currentScrimedAsset}</li>
                <li>Proof route: {capability.syntheticDemoPath}</li>
                <li>Integration pattern: {capability.integrationPattern}</li>
                <li>Validation: {capability.validationMethod}</li>
                <li>Revenue motion: {capability.revenueMotion}</li>
                <li>Competitive pattern: {capability.competitivePattern}</li>
                <li>Next build: {capability.nextBuildStep}</li>
                <li>Human review required: {String(capability.humanReviewRequired)}</li>
                <li>Audit hash: {capability.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Enterprise integration paths">
        <div className="section-heading">
          <p className="eyebrow">Integration Paths</p>
          <h2>SCRIMED routes messy hospital infrastructure through governed middleware before agents can reason over it.</h2>
        </div>
        {summary.integrationPaths.map((path) => (
          <article className="module-row" key={path.id}>
            <div>
              <span>{path.payloadClass}</span>
              <h2>{path.id}</h2>
            </div>
            <p>
              {path.from} to {path.to} through {path.through}
            </p>
            <div>
              <strong>{path.allowedMode}</strong>
              <ul className="compact-list">
                <li>Blocked: {path.blockedMode}</li>
                <li>Approvals: {path.requiredApprovals.join(", ")}</li>
                <li>Fallback: {path.fallbackPath}</li>
                <li>Observability: {path.observability.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Enterprise sales motions">
        <div className="section-heading">
          <p className="eyebrow">Revenue and Diligence</p>
          <h2>Infrastructure readiness becomes a sales asset when every pitch is tied to proof and review gates.</h2>
        </div>
        {summary.salesMotions.map((motion) => (
          <article className="module-row" key={motion.id}>
            <div>
              <span>{motion.buyer}</span>
              <h2>{motion.id}</h2>
            </div>
            <p>{motion.pitch}</p>
            <div>
              <strong>{motion.revenueStream}</strong>
              <ul className="compact-list">
                <li>Proof route: {motion.proofRoute}</li>
                <li>Expansion path: {motion.expansionPath}</li>
                <li>Evidence required: {motion.evidenceRequiredBeforeClaim}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="No-PHI discovery intake">
        <div className="section-heading">
          <p className="eyebrow">No-PHI Discovery Intake</p>
          <h2>SCRIMED can scope the right pilot without collecting patient data, credentials, or raw connector payloads.</h2>
        </div>
        {summary.discoveryQuestions.map((question) => (
          <article className="module-row" key={question.id}>
            <div>
              <span>{question.category}</span>
              <h2>{question.id}</h2>
            </div>
            <p>{question.prompt}</p>
            <div>
              <strong>{question.whyItMatters}</strong>
              <ul className="compact-list">
                <li>Accepted: {question.acceptedInput}</li>
                <li>Forbidden: {question.forbiddenInput}</li>
                <li>Maps to: {question.mapsToCapabilityIds.join(", ")}</li>
                <li>Human review required: {String(question.humanReviewRequired)}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Scoped pilot packages">
        <div className="section-heading">
          <p className="eyebrow">Scoped Pilot Packages</p>
          <h2>Each pilot keeps one measurable outcome, one proof packet, one commercial motion, and one retained boundary.</h2>
        </div>
        {summary.pilotScopes.map((scope) => (
          <article className="module-row" key={scope.id}>
            <div>
              <span>no-PHI pilot</span>
              <h2>{scope.name}</h2>
            </div>
            <p>{scope.buyerTrigger}</p>
            <div>
              <strong>{scope.commercialModel}</strong>
              <ul className="compact-list">
                <li>Capabilities: {scope.includedCapabilities.join(", ")}</li>
                <li>Synthetic inputs: {scope.syntheticInputs.join(", ")}</li>
                <li>Proof outputs: {scope.proofOutputs.join(", ")}</li>
                <li>Acceptance: {scope.acceptanceCriteria.join("; ")}</li>
                <li>Price signal: {scope.priceBandSignal}</li>
                <li>Boundary: {scope.noGoBoundary}</li>
                <li>Next action: {scope.nextHumanAction}</li>
                <li>Audit hash: {scope.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Pilot recommendation engine">
        <div className="section-heading">
          <p className="eyebrow">Pilot Recommendation Engine</p>
          <h2>Metadata-only buyer signals route to one recommended pilot, two runner-ups, and a proof packet.</h2>
        </div>
        {summary.pilotRecommendations.map((recommendation) => (
          <article className="module-row" key={recommendation.inputId}>
            <div>
              <span>recommended</span>
              <h2>{recommendation.recommendedPilotScopeId}</h2>
            </div>
            <p>{recommendation.rationale}</p>
            <div>
              <strong>{recommendation.revenueMotion}</strong>
              <ul className="compact-list">
                <li>Input: {recommendation.inputId}</li>
                <li>Score: {recommendation.score}</li>
                <li>Runner-ups: {recommendation.runnerUpPilotScopeIds.join(", ")}</li>
                <li>Discovery questions: {recommendation.requiredDiscoveryQuestionIds.join(", ")}</li>
                <li>Proof packet items: {recommendation.proofPacketItemIds.join(", ")}</li>
                <li>Human review required: {String(recommendation.humanReviewRequired)}</li>
                <li>NO-GO: {recommendation.noGoBoundaries.join(" ")}</li>
                <li>Audit hash: {recommendation.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Buyer packet composer">
        <div className="section-heading">
          <p className="eyebrow">Buyer Packet Composer</p>
          <h2>Every recommendation becomes a meeting agenda, demo path, follow-up outline, and claims-safe next action.</h2>
        </div>
        {summary.buyerPackets.map((packet) => (
          <article className="module-row" key={packet.id}>
            <div>
              <span>{packet.buyerRole}</span>
              <h2>{packet.recommendedPilotScopeId}</h2>
            </div>
            <p>{packet.nextSafeAction}</p>
            <div>
              <strong>{packet.commercialPosition}</strong>
              <ul className="compact-list">
                <li>Agenda: {packet.meetingAgenda.join("; ")}</li>
                <li>Demo sequence: {packet.demoSequence.join("; ")}</li>
                <li>Decision criteria: {packet.decisionCriteria.join("; ")}</li>
                <li>Required artifacts: {packet.requiredArtifacts.join("; ")}</li>
                <li>Follow-up: {packet.followUpOutline.join("; ")}</li>
                <li>Blocked claims: {packet.blockedClaims.join("; ")}</li>
                <li>Human review required: {String(packet.humanReviewRequired)}</li>
                <li>Audit hash: {packet.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Decision readiness scorecards">
        <div className="section-heading">
          <p className="eyebrow">Decision Readiness Scorecards</p>
          <h2>SCRIMED turns buyer packets into measurable review evidence without expanding production authority.</h2>
        </div>
        {summary.decisionReadinessScorecards.map((scorecard) => (
          <article className="module-row" key={scorecard.id}>
            <div>
              <span>{scorecard.readinessStage}</span>
              <h2>{scorecard.buyerRole}</h2>
            </div>
            <p>{scorecard.executiveDecisionPrompt}</p>
            <div>
              <strong>Procurement readiness: {scorecard.procurementReadinessScore}</strong>
              <ul className="compact-list">
                <li>Recommended pilot: {scorecard.recommendedPilotScopeId}</li>
                <li>Buyer packet: {scorecard.buyerPacketId}</li>
                <li>Security review: {scorecard.securityReviewScore}</li>
                <li>Clinical safety: {scorecard.clinicalSafetyScore}</li>
                <li>Commercial readiness: {scorecard.commercialReadinessScore}</li>
                <li>Evidence completeness: {scorecard.evidenceCompletenessScore}</li>
                <li>Required next evidence: {scorecard.requiredNextEvidence.join("; ")}</li>
                <li>Blocked reasons: {scorecard.blockedDecisionReasons.join("; ")}</li>
                <li>Safe close plan: {scorecard.safeClosePlan.join("; ")}</li>
                <li>Production authority: {String(scorecard.productionAuthority)}</li>
                <li>Human review required: {String(scorecard.humanReviewRequired)}</li>
                <li>Audit hash: {scorecard.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Procurement action plans">
        <div className="section-heading">
          <p className="eyebrow">Procurement Action Plans</p>
          <h2>Each decision scorecard becomes a concrete next-step plan with owners, gates, evidence, and escalation triggers.</h2>
        </div>
        {summary.procurementActionPlans.map((plan) => (
          <article className="module-row" key={plan.id}>
            <div>
              <span>{plan.targetWindow}</span>
              <h2>{plan.buyerRole}</h2>
            </div>
            <p>{plan.escalationTrigger}</p>
            <div>
              <strong>{plan.recommendedPilotScopeId}</strong>
              <ul className="compact-list">
                <li>Owners: {plan.ownerRoles.join("; ")}</li>
                <li>Gate sequence: {plan.gateSequence.join("; ")}</li>
                <li>Evidence to collect: {plan.evidenceToCollect.join("; ")}</li>
                <li>Blockers to resolve: {plan.blockerToResolve.join("; ")}</li>
                <li>Completion criteria: {plan.completionCriteria.join("; ")}</li>
                <li>Safe operator script: {plan.safeOperatorScript.join("; ")}</li>
                <li>Handoff artifacts: {plan.handoffArtifacts.join("; ")}</li>
                <li>Production authority: {String(plan.productionAuthority)}</li>
                <li>Human review required: {String(plan.humanReviewRequired)}</li>
                <li>Audit hash: {plan.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Infrastructure proof packet checklist">
        <div className="section-heading">
          <p className="eyebrow">Proof Packet Checklist</p>
          <h2>Every external packet should carry enough evidence to sell confidence without expanding authority.</h2>
        </div>
        {summary.proofPacketChecklist.map((item) => (
          <article className="module-row" key={item.id}>
            <div>
              <span>{item.owner}</span>
              <h2>{item.artifact}</h2>
            </div>
            <p>{item.requiredBefore}</p>
            <div>
              <strong>{item.noPhiRule}</strong>
              <ul className="compact-list">
                <li>Review gate: {item.reviewGate}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Enterprise infrastructure hard stops">
        <div className="section-heading">
          <p className="eyebrow">Hard Stops</p>
          <h2>Infrastructure credibility increases when SCRIMED says exactly what remains blocked.</h2>
        </div>
        {summary.blockedActions.map((action) => (
          <article className="module-row" key={action}>
            <div>
              <span>blocked</span>
              <h2>{action}</h2>
            </div>
            <p>Human review, customer authorization, and qualified external approval are required before this boundary can move.</p>
            <div>
              <strong>Production authority: {String(summary.productionAuthority)}</strong>
              <ul className="compact-list">
                <li>No-PHI confirmed: {String(summary.noPhiConfirmed)}</li>
                <li>Human review required: {String(summary.humanReviewRequired)}</li>
                <li>Policy version: {summary.policyVersion}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
