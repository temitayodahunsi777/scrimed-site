import Link from "next/link";
import { getProductConsoleSummary } from "../lib/productConsole";

export default function ProductConsolePage() {
  const summary = getProductConsoleSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/hub">Hub</Link>
        <p className="eyebrow">SCRIMED Product Console</p>
        <h1>SCRIMED Product Console packages a sellable healthcare operating-system pilot.</h1>
        <p className="hero-text">
          This console turns SCRIMED from a readiness foundation into a commercial product surface: buyer offers, workflow demos, proof routes, deployment stages, and production safety boundaries.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED product summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Ops blockers</span>
          <strong>{summary.companyOperationsSummary.blocked}</strong>
        </article>
        <article>
          <span>Ops actions</span>
          <strong>{summary.companyOperationsSummary.manualAction}</strong>
        </article>
        <article>
          <span>Services</span>
          <strong>{summary.serviceOfferCount}</strong>
        </article>
        <article>
          <span>Agents</span>
          <strong>{summary.agentCount}</strong>
        </article>
        <article>
          <span>Workflow engine</span>
          <strong>{summary.workflowEngineCount}</strong>
        </article>
        <article>
          <span>Product demos</span>
          <strong>{summary.executableDemos}</strong>
        </article>
        <article>
          <span>Pilot programs</span>
          <strong>{summary.pilotProgramCount}</strong>
        </article>
        <article>
          <span>Protected workspace</span>
          <strong>{summary.protectedPilotWorkspaceSummary.infrastructure.protectedMutationsEnabled ? "connected" : "contract ready"}</strong>
        </article>
        <article>
          <span>Conformance kits</span>
          <strong>{summary.interoperabilityConformanceSummary.syntheticPassed}</strong>
        </article>
        <article>
          <span>Live connectors</span>
          <strong>{summary.interoperabilityConformanceSummary.liveBlocked} blocked</strong>
        </article>
        <article>
          <span>Readiness domains</span>
          <strong>{summary.enterpriseReadinessSummary.domainCount}</strong>
        </article>
        <article>
          <span>Clinical care gates</span>
          <strong>{summary.clinicalCareActivationGateCount}</strong>
        </article>
        <article>
          <span>Clinical blocked</span>
          <strong>{summary.clinicalCareActivationBlockedCapabilityCount}</strong>
        </article>
        <article>
          <span>Strategic patterns</span>
          <strong>{summary.strategicIntelligencePatternCount}</strong>
        </article>
        <article>
          <span>Deployment profiles</span>
          <strong>{summary.deploymentProfileCount}</strong>
        </article>
        <article>
          <span>Revenue streams</span>
          <strong>{summary.revenueStreamCount}</strong>
        </article>
        <article>
          <span>Audiences</span>
          <strong>{summary.targetAudienceCount}</strong>
        </article>
        <article>
          <span>Source signals</span>
          <strong>{summary.sourceIntelligenceSourceCount}</strong>
        </article>
        <article>
          <span>Attribution fields</span>
          <strong>{summary.attributionCapturedFieldCount}</strong>
        </article>
        <article>
          <span>Attribution cohorts</span>
          <strong>{summary.attributionCohortCount}</strong>
        </article>
        <article>
          <span>Analytics records</span>
          <strong>{summary.attributionAnalyticsRecordCount}</strong>
        </article>
        <article>
          <span>Trust agents</span>
          <strong>{summary.trustSafetyAgentCount}</strong>
        </article>
        <article>
          <span>Safety controls</span>
          <strong>{summary.trustSafetyControlCount}</strong>
        </article>
        <article>
          <span>Trust audiences</span>
          <strong>{summary.trustSafetyTargetAudienceCount}</strong>
        </article>
        <article>
          <span>Trust incidents</span>
          <strong>{summary.trustSafetyIncidentCount}</strong>
        </article>
        <article>
          <span>Open trust issues</span>
          <strong>{summary.trustSafetyOpenIncidentCount}</strong>
        </article>
        <article>
          <span>Contained issues</span>
          <strong>{summary.trustSafetyContainedIncidentCount}</strong>
        </article>
        <article>
          <span>Legal-hold watch</span>
          <strong>{summary.trustSafetyLegalHoldWatchCount}</strong>
        </article>
        <article>
          <span>TrustOS controls</span>
          <strong>{summary.trustOSControlCount}</strong>
        </article>
        <article>
          <span>Approved claims</span>
          <strong>{summary.enterpriseReadinessSummary.claims.approved}</strong>
        </article>
        <article>
          <span>External reviews</span>
          <strong>{summary.enterpriseReadinessSummary.externalReviewsRequired}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="SCRIMED competitive edge">
        <div className="section-heading">
          <p className="eyebrow">Competitive edge</p>
          <h2>SCRIMED presents as healthcare intelligence infrastructure, not another healthcare chatbot.</h2>
          <p className="section-copy">
            The product edge is the combination of governed agents, trust infrastructure, interoperability readiness,
            premium enterprise sales motion, faith-aligned optionality, and protected buyer proof.
          </p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.competitiveEdgeRoute}>
              Broadcast Competitive Edge
            </Link>
            <Link className="secondary-action" href={summary.buyerPilotRoomRoute}>
              Open Buyer Pilot Room
            </Link>
          </div>
        </div>
        {summary.buyerPilotRoomCompetitiveEdges.map((edge) => (
          <article className="module-row" key={edge.pillar}>
            <div>
              <span>SCRIMED edge</span>
              <h2>{edge.pillar}</h2>
            </div>
            <p>{edge.claim}</p>
            <div>
              <Link className="module-link" href={edge.route}>
                Inspect proof
              </Link>
              <p>{edge.blockedClaim}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED pilot deal room">
        <div className="section-heading">
          <p className="eyebrow">Pilot deal room</p>
          <h2>Sales, proof, pricing, and protected buyer-room evidence now move through one organized path.</h2>
          <p className="section-copy">{summary.salesDealRoomSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.salesDealRoomRoute}>
              Open Pilot Deal Room
            </Link>
            <Link className="secondary-action" href={summary.salesOperationsRoute}>
              Open Sales Operations
            </Link>
          </div>
        </div>
        {summary.salesDealRoomSummary.stages.map((stage) => (
          <article className="module-row" key={stage.stage}>
            <div>
              <span>{stage.stage}</span>
              <h2>{stage.buyerQuestion}</h2>
            </div>
            <p>{stage.scrimedProof}</p>
            <div>
              <Link className="module-link" href={stage.primaryRoute}>
                {stage.primaryRoute}
              </Link>
              <p>{stage.gatedBoundary}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED trust and safety operations">
        <div className="section-heading">
          <p className="eyebrow">Trust safety operations</p>
          <h2>Copyright, security, safety, legal, monitoring, auditing, fixing, and improvement are agent-operated controls.</h2>
          <p className="section-copy">{summary.trustSafetyOperationsSummary.boundary}</p>
        </div>
        <article className="module-row">
          <div>
            <span>{summary.trustSafetyOperationsSummary.status}</span>
            <h2>{summary.trustSafetyOperationsSummary.operatingPosture}</h2>
          </div>
          <p>
            SCRIMED defines a 24/7 trust-ops model while keeping production managed monitoring gated until staffing,
            SOC/MDR, customer-specific runbooks, and external readiness are approved.
          </p>
          <div>
            <Link className="module-link" href={summary.trustSafetyOperationsRoute}>
              Open Trust Safety Ops
            </Link>
          <ul className="compact-list">
              <li>Agents: {summary.trustSafetyAgentCount}</li>
              <li>Controls: {summary.trustSafetyControlCount}</li>
              <li>Tenant dashboard: {summary.trustSafetyTenantIncidentDashboardApiRoute}</li>
              <li>Tenant packet: {summary.trustSafetyTenantIncidentReviewPacketApiRoute}</li>
              <li>Incident reports: {summary.trustSafetyIncidentCount}</li>
              <li>Open issues: {summary.trustSafetyOpenIncidentCount}</li>
              <li>Channels: {summary.trustSafetyOperationsSummary.channelCount}</li>
              <li>Next: {summary.trustSafetyOperationsSummary.nextBuildStep}</li>
            </ul>
          </div>
        </article>
        {summary.trustSafetyOperationsSummary.incidents.slice(0, 4).map((incident) => (
          <article className="module-row" key={incident.id}>
            <div>
              <span>{incident.severity} / {incident.status}</span>
              <h2>{incident.title}</h2>
            </div>
            <p>{incident.containmentAction}</p>
            <div>
              <a className="module-link" href={incident.reportRoute}>
                Download incident report
              </a>
              <ul className="compact-list">
                <li>Owner: {incident.owner}</li>
                <li>Agent: {incident.accountableAgent}</li>
              </ul>
            </div>
          </article>
        ))}
        <article className="module-row">
          <div>
            <span>tenant durable</span>
            <h2>Tenant TrustOps incident workspaces turn trust into buyer-inspectable evidence.</h2>
          </div>
          <p>{summary.trustSafetyOperationsSummary.durableTenantStorage}</p>
          <div>
            <Link className="module-link" href={summary.trustSafetyOperationsRoute}>
              Review TrustOps controls
            </Link>
            <ul className="compact-list">
              {summary.trustSafetyOperationsSummary.durableTrustOpsControls.slice(0, 5).map((control) => (
                <li key={control}>{control}</li>
              ))}
            </ul>
          </div>
        </article>
        {summary.trustSafetyOperationsSummary.targetAudienceSignals.slice(0, 3).map((signal) => (
          <article className="module-row" key={signal.audience}>
            <div>
              <span>buyer fit</span>
              <h2>{signal.audience}</h2>
            </div>
            <p>{signal.appeal}</p>
            <Link className="module-link" href={summary.trustSafetyOperationsRoute}>
              Inspect TrustOps proof
            </Link>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED attribution analytics">
        <div className="section-heading">
          <p className="eyebrow">Attribution analytics</p>
          <h2>Source-to-pilot cohorts connect campaign signal, buyer type, deployment profile, proof packet, and sales outcome.</h2>
          <p className="section-copy">{summary.attributionAnalyticsSummary.boundary}</p>
        </div>
        <article className="module-row">
          <div>
            <span>{summary.attributionAnalyticsSummary.status}</span>
            <h2>{summary.attributionAnalyticsSummary.mode}</h2>
          </div>
          <p>
            Public cohorts remain synthetic for investor and buyer review. Authenticated tenant-admin analytics derive from persisted no-PHI Sales Operations opportunities.
          </p>
          <div>
            <Link className="module-link" href={summary.attributionAnalyticsRoute}>
              Open attribution analytics
            </Link>
            <ul className="compact-list">
              <li>Records: {summary.attributionAnalyticsRecordCount}</li>
              <li>Cohorts: {summary.attributionCohortCount}</li>
              <li>Source coverage: {summary.attributionAnalyticsSummary.totals.sourceCoveragePercent}%</li>
              <li>Proof coverage: {summary.attributionAnalyticsSummary.totals.proofPacketCoveragePercent}%</li>
              <li>Protected API: {summary.attributionAnalyticsAuthenticatedApiRoute}</li>
            </ul>
          </div>
        </article>
        {summary.attributionAnalyticsSummary.proofRecommendations.slice(0, 4).map((recommendation) => (
          <article className="module-row" key={recommendation.cohort}>
            <div>
              <span>proof route</span>
              <h2>{recommendation.cohort}</h2>
            </div>
            <p>{recommendation.nextAction}</p>
            <Link className="module-link" href={recommendation.route}>
              {recommendation.route}
            </Link>
          </article>
        ))}
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Commercial offer</p>
          <h2>{summary.nextCommercialMove}</h2>
          <p className="section-copy">{summary.productionBoundary}</p>
        </div>
        <div className="layer-list">
          {Object.entries(summary.proofStack).map(([name, status], index) => (
            <div className="layer-row" key={name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{name}: {status}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="SCRIMED clinical care activation readiness">
        <div className="section-heading">
          <p className="eyebrow">Clinical care activation</p>
          <h2>SCRIMED has a controlled path toward clinical care without pretending live care is already authorized.</h2>
          <p className="section-copy">{summary.clinicalCareActivationSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.clinicalCareActivationRoute}>
              Open Clinical Activation
            </Link>
            <a className="secondary-action" href={summary.clinicalCareActivationBriefRoute}>
              Download Readiness Brief
            </a>
          </div>
        </div>
        {summary.clinicalCareActivationSummary.activationPhases.map((phase) => (
          <article className="module-row" key={phase.phase}>
            <div>
              <span>{phase.status}</span>
              <h2>{phase.phase}</h2>
            </div>
            <p>{phase.objective}</p>
            <div>
              <strong>{phase.exitCriteria}</strong>
              <ul className="compact-list">
                {phase.requiredEvidence.map((evidence) => (
                  <li key={evidence}>{evidence}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED sales attribution">
        <div className="section-heading">
          <p className="eyebrow">Sales attribution</p>
          <h2>Safe buyer signals now route into source-aware revenue, audience, deployment, and follow-up cadence.</h2>
          <p className="section-copy">{summary.salesAttributionSummary.boundary}</p>
        </div>
        <article className="module-row">
          <div>
            <span>{summary.salesAttributionSummary.status}</span>
            <h2>{summary.salesAttributionSummary.sampleAttribution.market.revenueStream}</h2>
          </div>
          <p>{summary.salesAttributionSummary.sampleAttribution.market.message}</p>
          <div>
            <Link className="module-link" href={summary.salesAttributionRoute}>
              Open attribution layer
            </Link>
            <ul className="compact-list">
              <li>Source: {summary.salesAttributionSummary.sampleAttribution.sourceCategory}</li>
              <li>Audience: {summary.salesAttributionSummary.sampleAttribution.market.targetAudience}</li>
              <li>Deployment: {summary.salesAttributionSummary.sampleAttribution.deployment.profileName}</li>
              <li>Cadence: {summary.salesAttributionSummary.sampleAttribution.cadence.firstResponseSla}</li>
            </ul>
          </div>
        </article>
      </section>

      <section className="table-section" aria-label="SCRIMED source intelligence">
        <div className="section-heading">
          <p className="eyebrow">Source intelligence</p>
          <h2>Public standards and platform signals are translated into SCRIMED implementation themes.</h2>
          <p className="section-copy">{summary.sourceIntelligenceSummary.boundary}</p>
        </div>
        {summary.sourceIntelligenceSummary.signals.slice(0, 5).map((signal) => (
          <article className="module-row" key={signal.sourceName}>
            <div>
              <span>{signal.category}</span>
              <h2>{signal.sourceName}</h2>
            </div>
            <p>{signal.scrimedApplication}</p>
            <div>
              <Link className="module-link" href={summary.sourceIntelligenceRoute}>
                Review source-informed strategy
              </Link>
              <ul className="compact-list">
                <li>{signal.implementationPath[0]}</li>
                <li>{signal.governanceBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED market activation">
        <div className="section-heading">
          <p className="eyebrow">Market activation</p>
          <h2>Revenue, message, audiences, FaithCore, communications, PR, and advertising stay tied to claims controls.</h2>
          <p className="section-copy">{summary.marketActivationSummary.boundary}</p>
        </div>
        {summary.marketActivationSummary.revenueStreams.map((stream) => (
          <article className="module-row" key={stream.name}>
            <div>
              <span>{stream.status}</span>
              <h2>{stream.name}</h2>
            </div>
            <p>{stream.buyer}. {stream.offer}</p>
            <div>
              <Link className="module-link" href={summary.marketActivationRoute}>
                {stream.priceSignal}
              </Link>
              <ul className="compact-list">
                <li>{stream.conversionPath}</li>
                <li>{stream.guardrails.join(" ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED deployment profiles">
        <div className="section-heading">
          <p className="eyebrow">Deployment profiles</p>
          <h2>Cloud, private, hospital-controlled, sovereign, and edge paths are scoped before production claims.</h2>
          <p className="section-copy">{summary.deploymentProfileSummary.boundary}</p>
        </div>
        {summary.deploymentProfileSummary.profiles.map((profile) => (
          <article className="module-row" key={profile.slug}>
            <div>
              <span>{profile.status}</span>
              <h2>{profile.name}</h2>
            </div>
            <p>{profile.buyer}. {profile.deploymentThesis}</p>
            <div>
              <Link className="module-link" href={summary.deploymentProfilesRoute}>
                {profile.revenueUse}
              </Link>
              <ul className="compact-list">
                <li>{profile.environment}</li>
                <li>{profile.costModel}</li>
                <li>Blocked claims: {profile.blockedClaims.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED strategic platform intelligence">
        <div className="section-heading">
          <p className="eyebrow">Strategic intelligence</p>
          <h2>Public platform signals are converted into SCRIMED-specific architecture, proof metrics, and guardrails.</h2>
          <p className="section-copy">
            The strategic intelligence layer keeps source-informed product direction inspectable while preserving the synthetic pilot boundary and avoiding implied third-party partnerships.
          </p>
        </div>
        {summary.strategicPlatformIntelligenceSummary.patterns.map((pattern) => (
          <article className="module-row" key={pattern.slug}>
            <div>
              <span>{pattern.priority}</span>
              <h2>{pattern.title}</h2>
            </div>
            <p>{pattern.productThesis}</p>
            <div>
              <Link className="module-link" href={summary.strategicIntelligenceRoute}>
                {pattern.nextBuildStep}
              </Link>
              <ul className="compact-list">
                <li>Sources: {pattern.sourceNames.join(", ")}</li>
                <li>Proof metrics: {pattern.proofMetrics.join(", ")}</li>
                <li>Blocked claims: {pattern.blockedClaims.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED investor and buyer proof">
        <div className="section-heading">
          <p className="eyebrow">Investor and buyer proof</p>
          <h2>{summary.demoPilotProgramSummary.investorReadiness.thesis}</h2>
          <p className="section-copy">
            {summary.demoPilotProgramSummary.investorReadiness.demoToPilotConversionPath}
          </p>
        </div>
        {summary.demoPilotProgramSummary.investorReadiness.proofSignals.map((signal) => (
          <article className="module-row" key={signal.label}>
            <div>
              <span>{signal.status}</span>
              <h2>{signal.label}</h2>
            </div>
            <p>{signal.evidence}</p>
            <Link className="module-link" href={signal.route}>Open proof surface</Link>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED product demos">
        <div className="section-heading">
          <p className="eyebrow">Product demos</p>
          <h2>Buyer-facing product evidence is executable, guided, and explicitly governed.</h2>
          <p className="section-copy">
            Each demo connects a buyer problem to a named product, agent, workflow, proof routes, measurable signals, and retained production exclusions.
          </p>
        </div>
        {summary.demoPilotProgramSummary.productDemos.map((demo) => (
          <article className="module-row" key={demo.slug}>
            <div>
              <span>{demo.status}</span>
              <h2>{demo.name}</h2>
            </div>
            <p>{demo.buyer}</p>
            <div>
              <Link className="module-link" href={demo.route}>{demo.objective}</Link>
              <ul className="compact-list">
                <li>{demo.product} · {demo.agent}</li>
                <li>{demo.proofRoutes.length} linked proof routes</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED pilot programs">
        <div className="section-heading">
          <p className="eyebrow">Pilot programs</p>
          <h2>Sellable programs translate product proof into a governed enterprise decision.</h2>
        </div>
        {summary.demoPilotProgramSummary.pilotPrograms.map((pilot) => (
          <article className="module-row" key={pilot.slug}>
            <div>
              <span>{pilot.status} · {pilot.duration}</span>
              <h2>{pilot.name}</h2>
            </div>
            <p>{pilot.engagementModel}</p>
            <Link className="module-link" href={pilot.route}>{pilot.objective}</Link>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED enterprise services and offers">
        <div className="section-heading">
          <p className="eyebrow">Services and offers</p>
          <h2>Sellable enterprise packages for governed healthcare AI transformation.</h2>
          <p className="section-copy">
            SCRIMED can be sold today as a synthetic pilot, workflow intelligence assessment, governance audit, and automation blueprint while live clinical execution stays gated.
          </p>
        </div>
        {summary.enterpriseServiceOffers.map((offer) => (
          <article className="module-row" key={offer.name}>
            <div>
              <span>{offer.status}</span>
              <h2>{offer.name}</h2>
            </div>
            <p>{offer.buyer}</p>
            <div>
              <Link className="module-link" href="/product">{offer.deliverable}</Link>
              <ul className="compact-list">
                <li>{offer.proof}</li>
                <li>{offer.boundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED agents">
        <div className="section-heading">
          <p className="eyebrow">SCRIMED Agents</p>
          <h2>Named agents with scoped capabilities, workflow ownership, and governance flags.</h2>
          <p className="section-copy">
            Agents are specialized by workflow domain and remain auditable, review-gated, and bounded to non-diagnostic operational intelligence.
          </p>
        </div>
        {summary.productAgents.map((agent) => (
          <article className="module-row" key={agent.name}>
            <div>
              <span>{agent.status}</span>
              <h2>{agent.name}</h2>
            </div>
            <p>{agent.domain}. {agent.owner}</p>
            <div>
              <Link className="module-link" href={agent.workflowRoute}>{agent.capability}</Link>
              <ul className="compact-list">
                {agent.governanceFlags.map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED workflow engine examples">
        <div className="section-heading">
          <p className="eyebrow">Workflow engine</p>
          <h2>Example workflows turn fragmented healthcare work into decision-grade review queues.</h2>
          <p className="section-copy">
            These workflows demonstrate the operating layer without claiming autonomous treatment, diagnosis, payer submission, or live patient execution.
          </p>
        </div>
        {summary.workflowEngineExamples.map((workflow) => (
          <article className="module-row" key={workflow.name}>
            <div>
              <span>{workflow.status}</span>
              <h2>{workflow.name}</h2>
            </div>
            <p>{workflow.agent}. {workflow.buyerValue}</p>
            <div>
              <strong>{workflow.inspectableOutput}</strong>
              <ul className="compact-list">
                <li>{workflow.governanceBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="SCRIMED trust and governance controls">
        <div className="section-heading">
          <p className="eyebrow">Trust and governance</p>
          <h2>Clinical safety boundaries stay visible before any production execution.</h2>
          <p className="section-copy">
            SCRIMED presents as healthcare operational intelligence with human oversight, synthetic-first validation, auditability, privacy discipline, and planned role-based controls.
          </p>
        </div>
        <div className="principle-grid">
          {summary.governanceControls.map((control) => (
            <article key={control.control}>
              <span>{control.status}</span>
              <h3>{control.control}</h3>
              <p>{control.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="SCRIMED enterprise readiness">
        <div className="section-heading">
          <p className="eyebrow">Enterprise readiness</p>
          <h2>Commercial momentum stays tied to legal, security, privacy, brand, governance, and claims controls.</h2>
          <p className="section-copy">{summary.enterpriseReadinessSummary.boundary}</p>
        </div>
        {summary.enterpriseReadinessSummary.domains.map((domain) => (
          <article className="module-row" key={domain.slug}>
            <div>
              <span>{domain.status}</span>
              <h2>{domain.name}</h2>
            </div>
            <p>{domain.currentPosture}</p>
            <Link className="module-link" href={domain.route}>{domain.objective}</Link>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="SCRIMED evidence and proof stack">
        <div className="section-heading">
          <p className="eyebrow">Evidence and proof stack</p>
          <h2>Buyer value is framed as measurable pilot evidence, not unsupported clinical claims.</h2>
        </div>
        <div className="principle-grid">
          {summary.evidenceMetrics.map((metric) => (
            <article key={metric.metric}>
              <span>Evidence</span>
              <h3>{metric.metric}</h3>
              <p>{metric.signal}</p>
              <ul className="compact-list">
                <li>{metric.proof}</li>
                <li>{metric.measurementBoundary}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band product-actions" aria-label="SCRIMED buyer actions">
        <div className="section-heading">
          <p className="eyebrow">Buyer actions</p>
          <h2>Move from evaluation to a governed enterprise pilot.</h2>
        </div>
        <div className="action-grid">
          {summary.buyerActions.map((action) => (
            <Link className="action-card" href={action.href} key={action.label}>
              <span>{action.label}</span>
              <strong>{action.purpose}</strong>
              <p>{action.boundary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="SCRIMED sellable product offers">
        <div className="section-heading">
          <p className="eyebrow">Product offers</p>
          <h2>Pilot offers connect buyer problems to proof routes and governed synthetic demonstrations.</h2>
        </div>
        {summary.productOffers.map((offer) => (
          <article className="module-row" key={offer.name}>
            <div>
              <span>{offer.status}</span>
              <h2>{offer.name}</h2>
            </div>
            <p>{offer.buyer}. {offer.problem}</p>
            <Link className="module-link" href={offer.proofRoutes[0]}>
              {offer.pilotOutcome}
            </Link>
          </article>
        ))}
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Buyer workflow demos</p>
          <h2>Each demo connects a business problem to a governed workflow and inspectable result.</h2>
        </div>
        <div className="layer-list">
          {summary.productWorkflows.map((workflow, index) => (
            <Link className="layer-row" href={workflow.workflowRoute} key={workflow.name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{workflow.module}: {workflow.name}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="SCRIMED deployment stages">
        {summary.deploymentStages.map((stage) => (
          <article className="module-row" key={stage.stage}>
            <div>
              <span>deployment</span>
              <h2>{stage.stage}</h2>
            </div>
            <p>{stage.buyerDecision}</p>
            <Link className="module-link" href="/quality">
              {stage.scrimedProof}
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
