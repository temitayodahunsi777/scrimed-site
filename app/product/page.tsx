import Link from "next/link";
import { getProductConsoleSummary } from "../lib/productConsole";

export default function ProductConsolePage() {
  const summary = getProductConsoleSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/hub">Hub</Link>
        <p className="eyebrow">SCRIMED product proof for serious healthcare buyers</p>
        <h1>See what SCRIMED can sell, prove, and pilot for your organization.</h1>
        <p className="hero-text">
          Start here when your team wants to understand the product, compare offers, inspect proof, choose a demo, and move toward a governed pilot without handing over PHI or accepting unsupported clinical claims.
        </p>
        <div className="hero-actions">
          <Link className="primary-action" href={summary.pilotDemoCommercialReadinessRoute}>
            Find Your Pilot Path
          </Link>
          <Link className="secondary-action" href="/offerings">
            See Offers
          </Link>
          <Link className="secondary-action" href="/demos">
            Watch Demos
          </Link>
          <Link className="secondary-action" href={summary.p33IntegratedRoute}>
            Inspect p.33 Controls
          </Link>
          <Link className="secondary-action" href={summary.p34IntegratedRoute}>
            Inspect p.34 Clinical OS
          </Link>
          <a className="secondary-action" href={summary.pilotDemoCommercialReadinessBriefRoute}>
            Download Buyer Brief
          </a>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED product summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Runtime</span>
          <strong>Node {summary.nodeMajor ?? "unknown"}</strong>
        </article>
        <article>
          <span>Environment</span>
          <strong>{summary.runtimeEnvironment}</strong>
        </article>
        <article>
          <span>Runtime assurance</span>
          <strong>{summary.runtimeCompatibilityLabel}</strong>
        </article>
        <article>
          <span>Vercel status</span>
          <strong>{summary.vercelProjectStatus}</strong>
        </article>
        <article>
          <span>Vercel build</span>
          <strong>{summary.vercelBuildStatus}</strong>
        </article>
        <article>
          <span>Release fingerprint</span>
          <strong title={summary.runtimeReleaseFingerprint}>
            {summary.runtimeReleaseFingerprint.slice(0, 12)}
          </strong>
        </article>
        <article>
          <span>p.33 controls</span>
          <strong>{summary.p33IntegratedStatus}</strong>
        </article>
        <article>
          <span>p.33 opportunities</span>
          <strong>{summary.p33OpportunityModuleCount}</strong>
        </article>
        <article>
          <span>p.33 blocked gates</span>
          <strong>{summary.p33BlockedGateCount}</strong>
        </article>
        <article>
          <span>p.34 controls</span>
          <strong>{summary.p34IntegratedStatus}</strong>
        </article>
        <article>
          <span>p.34 local passes</span>
          <strong>{summary.p34PassedGateCount}</strong>
        </article>
        <article>
          <span>p.34 blocked gates</span>
          <strong>{summary.p34BlockedGateCount}</strong>
        </article>
        <article>
          <span>Exact review</span>
          <strong>{summary.p34ReviewReadiness.review.state}</strong>
        </article>
        <article>
          <span>Synthetic pilot</span>
          <strong>{summary.syntheticPilotReadiness.status}</strong>
        </article>
        <article>
          <span>Company score</span>
          <strong>{summary.companyAssessmentOverallScore}</strong>
        </article>
        <article>
          <span>Company dimensions</span>
          <strong>{summary.companyAssessmentDimensionCount}</strong>
        </article>
        <article>
          <span>Company workstreams</span>
          <strong>{summary.companyAssessmentUpgradeWorkstreamCount}</strong>
        </article>
        <article>
          <span>Company hard stops</span>
          <strong>{summary.companyAssessmentHardStopCount}</strong>
        </article>
        <article>
          <span>Clinical production</span>
          <strong>{summary.clinicalProductionReady ? "ready" : "not ready"}</strong>
        </article>
        <article>
          <span>Clinical tasks</span>
          <strong>{summary.clinicalProductionTaskCount}</strong>
        </article>
        <article>
          <span>Critical open</span>
          <strong>{summary.clinicalProductionCriticalOpenTaskCount}</strong>
        </article>
        <article>
          <span>Current motions</span>
          <strong>{summary.clinicalProductionCurrentCapabilityMotionCount}</strong>
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
          <span>Demo paths</span>
          <strong>{summary.pilotDemoCommercialReadinessDemoPathCount}</strong>
        </article>
        <article>
          <span>Market benchmarks</span>
          <strong>{summary.pilotDemoCommercialReadinessMarketBenchmarkCount}</strong>
        </article>
        <article>
          <span>Pricing alignments</span>
          <strong>{summary.pilotDemoCommercialReadinessPricingAlignmentCount}</strong>
        </article>
        <article>
          <span>Path score</span>
          <strong>{summary.pilotDemoCommercialReadinessStandardPathScore}%</strong>
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
          <span>Authority domains</span>
          <strong>{summary.clinicalAuthorityDomainCount}</strong>
        </article>
        <article>
          <span>Authority fixes</span>
          <strong>{summary.clinicalAuthorityBoundaryResolutionCount}</strong>
        </article>
        <article>
          <span>Approval tracks</span>
          <strong>{summary.approvalsReadinessTrackCount}</strong>
        </article>
        <article>
          <span>Approval agents</span>
          <strong>{summary.approvalsReadinessAgentControlCount}</strong>
        </article>
        <article>
          <span>Approval blocked</span>
          <strong>{summary.approvalsReadinessBlockedBeforeApprovalCount}</strong>
        </article>
        <article>
          <span>Release gates</span>
          <strong>{summary.releaseContinuityGateCount}</strong>
        </article>
        <article>
          <span>Release checks</span>
          <strong>{summary.releaseContinuityPassedCheckCount}/{summary.releaseContinuityCheckCount}</strong>
        </article>
        <article>
          <span>AAL2 operator gate</span>
          <strong>{summary.releaseContinuityOperatorRequiredGateCount}</strong>
        </article>
        <article>
          <span>Navigation pages</span>
          <strong>{summary.navigationAuditPageRouteCount}</strong>
        </article>
        <article>
          <span>API route patterns</span>
          <strong>{summary.navigationAuditApiRoutePatternCount}</strong>
        </article>
        <article>
          <span>Navigation groups</span>
          <strong>{summary.navigationAuditGroupCount}</strong>
        </article>
        <article>
          <span>Smoke HTML routes</span>
          <strong>{summary.navigationAuditSmokeCoveredHtmlRouteCount}</strong>
        </article>
        <article>
          <span>Launch tracks</span>
          <strong>{summary.launchReadinessTrackCount}</strong>
        </article>
        <article>
          <span>DNS controls</span>
          <strong>{summary.launchReadinessDnsControlCount}</strong>
        </article>
        <article>
          <span>Service paths</span>
          <strong>{summary.launchReadinessServicePathCount}</strong>
        </article>
        <article>
          <span>Launch hard stops</span>
          <strong>{summary.launchReadinessHardStopCount}</strong>
        </article>
        <article>
          <span>Threat profiles</span>
          <strong>{summary.competitiveDefenseThreatProfileCount}</strong>
        </article>
        <article>
          <span>Cyber controls</span>
          <strong>{summary.competitiveDefenseLegalPrivacyCyberControlCount}</strong>
        </article>
        <article>
          <span>Defense layers</span>
          <strong>{summary.competitiveDefenseInfiltrationDeterrenceLayerCount}</strong>
        </article>
        <article>
          <span>Defense hard stops</span>
          <strong>{summary.competitiveDefenseHardStopCount}</strong>
        </article>
        <article>
          <span>Reliability controls</span>
          <strong>{summary.serviceReliabilityControlCount}</strong>
        </article>
        <article>
          <span>Reliability gates</span>
          <strong>{summary.serviceReliabilityOpenGateCount}</strong>
        </article>
        <article>
          <span>Fault classes</span>
          <strong>{summary.serviceReliabilityFaultClassCount}</strong>
        </article>
        <article>
          <span>Efficiency fixes</span>
          <strong>{summary.serviceReliabilityEfficiencyImprovementCount}</strong>
        </article>
        <article>
          <span>Autonomy lanes</span>
          <strong>{summary.automationAutopilotCapabilityCount}</strong>
        </article>
        <article>
          <span>Auto readiness</span>
          <strong>{summary.automationAutopilotAverageReadinessScore}</strong>
        </article>
        <article>
          <span>Autonomy blocked</span>
          <strong>{summary.automationAutopilotProductionAuthorityBlockedCount}</strong>
        </article>
        <article>
          <span>Workarounds</span>
          <strong>{summary.automationAutopilotBottleneckWorkaroundCount}</strong>
        </article>
        <article>
          <span>Problem queue</span>
          <strong>{summary.strategicProblemResolutionProblemCount}</strong>
        </article>
        <article>
          <span>Critical problems</span>
          <strong>{summary.strategicProblemResolutionCriticalProblemCount}</strong>
        </article>
        <article>
          <span>Priority score</span>
          <strong>{summary.strategicProblemResolutionAveragePriorityScore}</strong>
        </article>
        <article>
          <span>Review problems</span>
          <strong>{summary.strategicProblemResolutionHumanReviewRequiredCount}</strong>
        </article>
        <article>
          <span>Optimization lanes</span>
          <strong>{summary.healthcareOptimizationCommandLaneCount}</strong>
        </article>
        <article>
          <span>Agent capabilities</span>
          <strong>{summary.healthcareOptimizationCommandAgentCapabilityCount}</strong>
        </article>
        <article>
          <span>Interop standards</span>
          <strong>{summary.healthcareOptimizationCommandInteroperableStandardCount}</strong>
        </article>
        <article>
          <span>Outcome metrics</span>
          <strong>{summary.healthcareOptimizationCommandMeasurableOutcomeCount}</strong>
        </article>
        <article>
          <span>Value metrics</span>
          <strong>{summary.healthcareValueRealizationMetricCount}</strong>
        </article>
        <article>
          <span>Value packages</span>
          <strong>{summary.healthcareValueRealizationPackageCount}</strong>
        </article>
        <article>
          <span>ROI controls</span>
          <strong>{summary.healthcareValueRealizationRiskControlCount}</strong>
        </article>
        <article>
          <span>Evidence score</span>
          <strong>{summary.healthcareValueRealizationAverageEvidenceScore}</strong>
        </article>
        <article>
          <span>Pilot packets</span>
          <strong>{summary.pilotValueEvidencePacketCount}</strong>
        </article>
        <article>
          <span>Evidence artifacts</span>
          <strong>{summary.pilotValueEvidenceArtifactCount}</strong>
        </article>
        <article>
          <span>Claim controls</span>
          <strong>{summary.pilotValueEvidenceClaimControlCount}</strong>
        </article>
        <article>
          <span>Packet review</span>
          <strong>{summary.pilotValueEvidenceReviewerCheckpointCount}</strong>
        </article>
        <article>
          <span>Activation plans</span>
          <strong>{summary.pilotActivationPlannerPlanCount}</strong>
        </article>
        <article>
          <span>Activation steps</span>
          <strong>{summary.pilotActivationPlannerStepCount}</strong>
        </article>
        <article>
          <span>Activation blockers</span>
          <strong>{summary.pilotActivationPlannerBlockerCount}</strong>
        </article>
        <article>
          <span>Activation handoffs</span>
          <strong>{summary.pilotActivationPlannerHandoffCount}</strong>
        </article>
        <article>
          <span>Handoff packets</span>
          <strong>{summary.pilotHandoffCommandPacketCount}</strong>
        </article>
        <article>
          <span>Handoff checks</span>
          <strong>{summary.pilotHandoffCommandChecklistCount}</strong>
        </article>
        <article>
          <span>Handoff risks</span>
          <strong>{summary.pilotHandoffCommandRiskControlCount}</strong>
        </article>
        <article>
          <span>Handoff stops</span>
          <strong>{summary.pilotHandoffCommandHardStopCount}</strong>
        </article>
        <article>
          <span>Success reviews</span>
          <strong>{summary.pilotSuccessReviewCommandReviewPlanCount}</strong>
        </article>
        <article>
          <span>Evidence gaps</span>
          <strong>{summary.pilotSuccessReviewCommandEvidenceGapCount}</strong>
        </article>
        <article>
          <span>Expansion items</span>
          <strong>{summary.pilotSuccessReviewCommandExpansionReadinessCount}</strong>
        </article>
        <article>
          <span>Blocked claims</span>
          <strong>{summary.pilotSuccessReviewCommandBlockedClaimCount}</strong>
        </article>
        <article>
          <span>Capital revenue</span>
          <strong>{summary.capitalVitalityRevenueCapabilityCount}</strong>
        </article>
        <article>
          <span>Packaged revenue</span>
          <strong>{summary.capitalVitalityPackagedRevenueCapabilityCount}</strong>
        </article>
        <article>
          <span>Moat signals</span>
          <strong>{summary.capitalVitalityMoatSignalCount}</strong>
        </article>
        <article>
          <span>Investor milestones</span>
          <strong>{summary.capitalVitalityInvestorMilestoneCount}</strong>
        </article>
        <article>
          <span>Funding streams</span>
          <strong>{summary.capitalVitalityFundingWorkstreamCount}</strong>
        </article>
        <article>
          <span>Capital review gates</span>
          <strong>{summary.capitalVitalityRetainedExternalReviewCount}</strong>
        </article>
        <article>
          <span>Growth plays</span>
          <strong>{summary.growthEnginePlayCount}</strong>
        </article>
        <article>
          <span>Execute-now plays</span>
          <strong>{summary.growthEngineExecuteNowPlayCount}</strong>
        </article>
        <article>
          <span>Growth lanes</span>
          <strong>{summary.growthEngineConversionLaneCount}</strong>
        </article>
        <article>
          <span>Revenue proof steps</span>
          <strong>{summary.growthEngineProofLadderStepCount}</strong>
        </article>
        <article>
          <span>Growth bottlenecks</span>
          <strong>{summary.growthEngineBottleneckCount}</strong>
        </article>
        <article>
          <span>Growth proof routes</span>
          <strong>{summary.growthEngineProofRouteCount}</strong>
        </article>
        <article>
          <span>Weakness tracks</span>
          <strong>{summary.investorAudienceWeaknessTrackCount}</strong>
        </article>
        <article>
          <span>Investor packets</span>
          <strong>{summary.investorAudiencePacketCount}</strong>
        </article>
        <article>
          <span>Ready packets</span>
          <strong>{summary.investorAudienceReadyNowPacketCount}</strong>
        </article>
        <article>
          <span>Audience gates</span>
          <strong>{summary.investorAudienceReadinessGateCount}</strong>
        </article>
        <article>
          <span>Portfolio offers</span>
          <strong>{summary.productServicePortfolioOfferCount}</strong>
        </article>
        <article>
          <span>Portfolio packages</span>
          <strong>{summary.productServicePortfolioPackageCount}</strong>
        </article>
        <article>
          <span>Portfolio controls</span>
          <strong>{summary.productServicePortfolioMarginControlCount}</strong>
        </article>
        <article>
          <span>Portfolio proof</span>
          <strong>{summary.productServicePortfolioProofRouteCount}</strong>
        </article>
        <article>
          <span>Delivery offers</span>
          <strong>{summary.serviceDeliveryOfferCount}</strong>
        </article>
        <article>
          <span>Delivery phases</span>
          <strong>{summary.serviceDeliveryPhaseCount}</strong>
        </article>
        <article>
          <span>Work orders</span>
          <strong>{summary.serviceDeliveryWorkOrderTemplateCount}</strong>
        </article>
        <article>
          <span>Delivery gates</span>
          <strong>{summary.serviceDeliveryActivationGateCount}</strong>
        </article>
        <article>
          <span>Delivery hard stops</span>
          <strong>{summary.serviceDeliveryHardStopCount}</strong>
        </article>
        <article>
          <span>Onboarding stages</span>
          <strong>{summary.clientOnboardingStageCount}</strong>
        </article>
        <article>
          <span>Comms templates</span>
          <strong>{summary.clientOnboardingTemplateCount}</strong>
        </article>
        <article>
          <span>Calendar packets</span>
          <strong>{summary.clientOnboardingCalendarPacketCount}</strong>
        </article>
        <article>
          <span>Client handoffs</span>
          <strong>{summary.clientOnboardingHandoffCount}</strong>
        </article>
        <article>
          <span>Scale domains</span>
          <strong>{summary.enterpriseScalabilityDomainCount}</strong>
        </article>
        <article>
          <span>Scale controls</span>
          <strong>{summary.enterpriseScalabilityControlCount}</strong>
        </article>
        <article>
          <span>Scale workstreams</span>
          <strong>{summary.enterpriseScalabilityWorkstreamCount}</strong>
        </article>
        <article>
          <span>Scale bottlenecks</span>
          <strong>{summary.enterpriseScalabilityOpenBottleneckCount}</strong>
        </article>
        <article>
          <span>Platform pillars</span>
          <strong>{summary.platformPowerPillarCount}</strong>
        </article>
        <article>
          <span>Platform controls</span>
          <strong>{summary.platformPowerControlCount}</strong>
        </article>
        <article>
          <span>AI/UI/API workstreams</span>
          <strong>{summary.platformPowerWorkstreamCount}</strong>
        </article>
        <article>
          <span>Platform bottlenecks</span>
          <strong>{summary.platformPowerOpenBottleneckCount}</strong>
        </article>
        <article>
          <span>Workaround tracks</span>
          <strong>{summary.limitationsWorkaroundTrackCount}</strong>
        </article>
        <article>
          <span>Workaround packets</span>
          <strong>{summary.limitationsWorkaroundPacketCount}</strong>
        </article>
        <article>
          <span>Open workaround risks</span>
          <strong>{summary.limitationsWorkaroundOpenRiskCount}</strong>
        </article>
        <article>
          <span>Workaround stops</span>
          <strong>{summary.limitationsWorkaroundHardStopCount}</strong>
        </article>
        <article>
          <span>Boundary records</span>
          <strong>{summary.boundaryResolutionRecordCount}</strong>
        </article>
        <article>
          <span>Boundary gates</span>
          <strong>{summary.boundaryResolutionExternalGateCount}</strong>
        </article>
        <article>
          <span>AAL2 gates</span>
          <strong>{summary.boundaryResolutionHumanAal2RequiredCount}</strong>
        </article>
        <article>
          <span>QA run stages</span>
          <strong>{summary.qaExecutionReadinessStageCount}</strong>
        </article>
        <article>
          <span>QA workflows</span>
          <strong>{summary.qaExecutionReadinessWorkflowCount}</strong>
        </article>
        <article>
          <span>QA run gates</span>
          <strong>{summary.qaRunControlGateCount}</strong>
        </article>
        <article>
          <span>QA commands</span>
          <strong>{summary.qaRunControlCommandTemplateCount}</strong>
        </article>
        <article>
          <span>QA launch phases</span>
          <strong>{summary.qaLaunchKitPhaseCount}</strong>
        </article>
        <article>
          <span>QA safe fields</span>
          <strong>{summary.qaLaunchKitSafeCopyFieldCount}</strong>
        </article>
        <article>
          <span>QA run packets</span>
          <strong>{summary.qaHumanRunPacketWorkflowCount}</strong>
        </article>
        <article>
          <span>QA run controls</span>
          <strong>{summary.qaHumanRunPacketControlCount}</strong>
        </article>
        <article>
          <span>Run hard stops</span>
          <strong>{summary.qaHumanRunPacketHardStopControlCount}</strong>
        </article>
        <article>
          <span>QA bridge gates</span>
          <strong>{summary.qaCompletionBridgeCheckpointCount}</strong>
        </article>
        <article>
          <span>QA bridge hard stops</span>
          <strong>{summary.qaCompletionBridgeHardStopCount}</strong>
        </article>
        <article>
          <span>QA claim rules</span>
          <strong>{summary.qaClaimGuardRuleCount}</strong>
        </article>
        <article>
          <span>Blocked claims</span>
          <strong>{summary.qaClaimGuardBlockedAuthorityClaimCount}</strong>
        </article>
        <article>
          <span>QA seal rules</span>
          <strong>{summary.qaActivationSealRuleCount}</strong>
        </article>
        <article>
          <span>QA seal stops</span>
          <strong>{summary.qaActivationSealHardStopRuleCount}</strong>
        </article>
        <article>
          <span>QA seal evidence</span>
          <strong>{summary.qaActivationSealRequiredEvidenceCount}</strong>
        </article>
        <article>
          <span>QA proof rules</span>
          <strong>{summary.qaProofPromotionRuleCount}</strong>
        </article>
        <article>
          <span>QA hard stops</span>
          <strong>{summary.qaProofPromotionHardStopRuleCount}</strong>
        </article>
        <article>
          <span>QA blocked claims</span>
          <strong>{summary.qaProofPromotionBlockedClaimCount}</strong>
        </article>
        <article>
          <span>Buyer proof release</span>
          <strong>{summary.qaBuyerProofReleaseSummary.releaseDecisionState}</strong>
        </article>
        <article>
          <span>QA execution console</span>
          <strong>{summary.qaManualExecutionConsoleSummary.consoleState}</strong>
        </article>
        <article>
          <span>Console stages</span>
          <strong>{summary.qaManualExecutionConsoleStageCount}</strong>
        </article>
        <article>
          <span>Console hard stops</span>
          <strong>{summary.qaManualExecutionConsoleHardStopCount}</strong>
        </article>
        <article>
          <span>Release hard stops</span>
          <strong>{summary.qaBuyerProofReleaseHardStopCount}</strong>
        </article>
        <article>
          <span>Release evidence</span>
          <strong>{summary.qaBuyerProofReleaseRequiredEvidenceCount}</strong>
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
          <span>Command lanes</span>
          <strong>{summary.operatingCommandCenterLaneCount}</strong>
        </article>
        <article>
          <span>P0 command</span>
          <strong>{summary.operatingCommandCenterP0LaneCount}</strong>
        </article>
        <article>
          <span>Review-gated lanes</span>
          <strong>{summary.operatingCommandCenterHighControlLaneCount}</strong>
        </article>
        <article>
          <span>Command packets</span>
          <strong>{summary.operatingCommandCenterEvidencePacketCount}</strong>
        </article>
        <article>
          <span>Protected packets</span>
          <strong>{summary.operatingCommandCenterProtectedEvidencePacketCount}</strong>
        </article>
        <article>
          <span>Boundary packets</span>
          <strong>{summary.operatingCommandCenterBoundaryReleaseEvidencePacketCount}</strong>
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
          <span>Global regions</span>
          <strong>{summary.globalRegionCount}</strong>
        </article>
        <article>
          <span>Buyer packs</span>
          <strong>{summary.globalBuyerPackCount}</strong>
        </article>
        <article>
          <span>Partner paths</span>
          <strong>{summary.globalPartnerChannelCount}</strong>
        </article>
        <article>
          <span>Global command</span>
          <strong>{summary.globalEnterpriseCommandRegionCount}</strong>
        </article>
        <article>
          <span>Global sales</span>
          <strong>{summary.globalEnterpriseCommandSalesPlaybookCount}</strong>
        </article>
        <article>
          <span>Global interop</span>
          <strong>{summary.globalEnterpriseCommandInteroperabilityLaneCount}</strong>
        </article>
        <article>
          <span>Global comms</span>
          <strong>{summary.globalEnterpriseCommandCommunicationLaneCount}</strong>
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

      <section className="table-section" aria-label="SCRIMED p.34 clinical operating system controls">
        <div className="section-heading">
          <p className="eyebrow">Clinical operating system</p>
          <h2>Authority, evidence, isolation, and review remain visible at the point of work.</h2>
          <div className="form-actions">
            <Link className="primary-action" href={summary.p34IntegratedRoute}>
              Open p.34 Console
            </Link>
            <a className="secondary-action" href={summary.p34IntegratedApiRoute}>
              Inspect p.34 API
            </a>
          </div>
        </div>
        <article className="module-row">
          <div><span>{summary.p34ClinicalOperatingSystem.autonomy.decision}</span><h2>Autonomy and approval</h2></div>
          <p>{summary.p34ClinicalOperatingSystem.autonomy.stoppingCondition}</p>
          <div><strong>{summary.p34ClinicalOperatingSystem.autonomy.grantedTier}</strong><p>{summary.p34ClinicalOperatingSystem.autonomy.authorizationState}</p></div>
        </article>
        <article className="module-row">
          <div><span>{summary.p34ClinicalOperatingSystem.phi.egress.decision}</span><h2>PHI route and sandbox</h2></div>
          <p>Startup classification {summary.p34ClinicalOperatingSystem.phi.startupValidation.decision}; provider calls remain disabled.</p>
          <div><strong>{summary.p34ClinicalOperatingSystem.sandbox.decision}</strong><p>default-deny egress</p></div>
        </article>
        <article className="module-row">
          <div><span>{summary.p34ClinicalOperatingSystem.externalValidation.decision}</span><h2>External validation and oversight</h2></div>
          <p>Clinical production eligibility remains blocked while local oversight stays at {(summary.p34ClinicalOperatingSystem.oversight.reviewedActionPercentage * 100).toFixed(0)}%.</p>
          <div><strong>{summary.p34ClinicalOperatingSystem.patientTakeHome.decision}</strong><p>patient preview review state</p></div>
        </article>
        <article className="module-row">
          <div><span>{summary.p34ControlPlane2.killSwitchMode}</span><h2>Release and kill switch</h2></div>
          <p>{summary.p34ControlPlane2.release.resultingState}; writes and A3 authority remain unavailable.</p>
          <div><strong>{summary.p34ControlPlane2.runtime.reviewState}</strong><p>exact-candidate review state</p></div>
        </article>
        <article className="module-row">
          <div><span>{summary.p34AtomicApproval.decision}</span><h2>Atomic approval evidence</h2></div>
          <p>An in-process synthetic self-test rejects replay within one store; durable replay protection and execution authority remain unavailable.</p>
          <div><strong>{summary.p34EgressFirewall.decision}</strong><p>shared egress firewall</p></div>
        </article>
        <article className="module-row">
          <div><span>{summary.p34ReviewState}</span><h2>Exact candidate identity</h2></div>
          <p>Branch {summary.runtimeBranch ?? "unbound local runtime"}; commit {summary.runtimeCandidateCommit?.slice(0, 12) ?? "unbound"}.</p>
          <div><strong>{summary.runtimeCandidateFingerprintVerificationStatus}</strong><p>candidate fingerprint evidence</p></div>
        </article>
        <article className="module-row">
          <div><span>{summary.p34PreviewState}</span><h2>External assurance state</h2></div>
          <p>{summary.p34MigrationState}; {summary.p34Aal2State}.</p>
          <div><strong>OPERATOR_REQUIRED</strong><p>{summary.p34SupabaseSecurityState}</p></div>
        </article>
      </section>

      <section className="table-section" aria-label="SCRIMED p.34 review readiness">
        <div className="section-heading">
          <p className="eyebrow">Exact-head review readiness</p>
          <h2>Machine assurance is visible without being mistaken for independent human approval.</h2>
          <div className="form-actions">
            <a className="primary-action" href={summary.p34ReviewReadinessApiRoute}>Inspect Review API</a>
            <Link className="secondary-action" href={summary.p34IntegratedRoute}>Open p.34 Console</Link>
          </div>
        </div>
        <article className="module-row">
          <div><span>PR #{summary.p34ReviewReadiness.pullRequest.number}</span><h2>Candidate identity</h2></div>
          <p>Commit {summary.p34ReviewReadiness.candidate.commitSha?.slice(0, 12) ?? "runtime unbound"}; candidate {summary.p34ReviewReadiness.candidate.fingerprint?.slice(0, 12) ?? "runtime unbound"}.</p>
          <div><strong>{summary.p34ReviewReadiness.candidate.runtimeBindingStatus}</strong><p>merge authority: blocked</p></div>
        </article>
        <article className="module-row">
          <div><span>{summary.p34ReviewReadiness.review.state}</span><h2>Independent review</h2></div>
          <p>Requested head {summary.p34ReviewReadiness.review.requestedHead?.slice(0, 12) ?? "not runtime-attested"}; reviewer {summary.p34ReviewReadiness.review.reviewerIdentity ?? "not recorded"}; request age {summary.p34ReviewReadiness.review.requestAgeHours} hours.</p>
          <div><strong>{summary.p34ReviewReadiness.review.evidenceFreshness}</strong><p>runtime never self-approves</p></div>
        </article>
        <article className="module-row">
          <div><span>{summary.p34PreviewAcceptance.previewReady ? "READY" : "NOT READY"}</span><h2>Protected preview acceptance</h2></div>
          <p>Deployment {summary.p34PreviewAcceptance.deploymentId}; exact runtime match {summary.p34PreviewAcceptance.runtimeMatchesFrozenTarget ? "yes" : "no"}.</p>
          <div><strong>{summary.p34PreviewAcceptance.previewAccepted ? "YES" : "NO"}</strong><p>production alias: no; production authority: no</p></div>
        </article>
        <article className="module-row">
          <div><span>{summary.p34ReviewReadiness.scope.authoritativePrInventoryObserved} files</span><h2>Review surface</h2></div>
          <p>The reviewer map separates the whole inherited PR from the direct p.34 gap-closure and generated evidence lanes.</p>
          <div><strong>{summary.p34ReviewReadiness.scope.authoritativeGapClosureBaselineObserved} baseline direct files</strong><p>unexpected files prohibited</p></div>
        </article>
        {summary.p34ReviewReadiness.operatorActions.map((action) => (
          <article className="module-row" key={action.id}>
            <div><span>{action.state}</span><h2>{action.id.replaceAll("-", " ")}</h2></div>
            <p>Owner: {action.owner}</p>
            <div><strong>external accountability</strong><p>no delegated production authority</p></div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED commercial readiness">
        <div className="section-heading">
          <p className="eyebrow">Commercial readiness</p>
          <h2>Sell bounded evidence work now while protected and production activity remains gated.</h2>
          <div className="form-actions">
            <Link className="primary-action" href={summary.syntheticPilotRoute}>Open Synthetic Pilot</Link>
            <a className="secondary-action" href={summary.syntheticPilotApiRoute}>Inspect Pilot API</a>
          </div>
        </div>
        <article className="module-row">
          <div><span>{summary.commercialReadiness.assessment}</span><h2>Workflow Intelligence Assessment</h2></div>
          <p>{summary.syntheticPilotReadiness.commercialPosture.assessment.price}</p>
          <div><strong>human scoped</strong><p>subject to written agreement</p></div>
        </article>
        <article className="module-row">
          <div><span>{summary.commercialReadiness.syntheticPilot}</span><h2>SCRIMED Synthetic Workflow Pilot</h2></div>
          <p>{summary.syntheticPilotReadiness.commercialPosture.syntheticPilot.price}; no PHI, clinical execution, or production connector.</p>
          <div><strong>{summary.syntheticPilotReadiness.readiness.score}/100</strong><p>synthetic readiness score</p></div>
        </article>
        <article className="module-row">
          <div><span>{summary.syntheticPilotReadiness.pilotOperatingSystem.manifestDecision.status}</span><h2>Pilot control contract</h2></div>
          <p>{summary.syntheticPilotReadiness.pilotOperatingSystem.templateRegistry.templateCount} reusable templates bind scope, objective metrics, cost ceilings, exclusions, evidence, and human authority.</p>
          <div><strong>{summary.syntheticPilotReadiness.pilotOperatingSystem.successCriteria.passedCount}/{summary.syntheticPilotReadiness.pilotOperatingSystem.successCriteria.criterionCount}</strong><p>synthetic objective criteria</p></div>
        </article>
        <article className="module-row">
          <div><span>{summary.syntheticPilotReadiness.pilotOperatingSystem.costGovernor.status}</span><h2>Cost and expansion governor</h2></div>
          <p>Estimated spend ${summary.syntheticPilotReadiness.pilotOperatingSystem.costGovernor.totalSpendUsd?.toLocaleString() ?? "unavailable"}; protected-pilot prerequisites remain independent gates.</p>
          <div><strong>{summary.syntheticPilotReadiness.pilotOperatingSystem.expansion.decision}</strong><p>customer activation: blocked</p></div>
        </article>
        <article className="module-row">
          <div><span>{summary.commercialReadiness.protectedPilot}</span><h2>Protected Enterprise Pilot</h2></div>
          <p>{summary.syntheticPilotReadiness.commercialPosture.protectedPilot.price}.</p>
          <div><strong>{summary.commercialReadiness.customerActivation}</strong><p>customer activation</p></div>
        </article>
        <article className="module-row">
          <div><span>{summary.p34SupabasePosture.authSecurity}</span><h2>Supabase posture</h2></div>
          <p>{summary.p34SupabasePosture.rlsAssurance}; migrations remain production-unapplied.</p>
          <div><strong>{summary.p34SupabasePosture.productionMutationState}</strong><p>{summary.p34SupabasePosture.migrationState}</p></div>
        </article>
      </section>

      <section className="table-section" aria-label="SCRIMED operating command center">
        <div className="section-heading">
          <p className="eyebrow">Operating command</p>
          <h2>Product, service, agent, infrastructure, and UI work now rolls through owner-bound command lanes.</h2>
          <p className="section-copy">{summary.operatingCommandCenterSummary.boundary}</p>
          <p className="section-copy">{summary.operatingCommandCenterNextBuildStep}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.operatingCommandCenterRoute}>
              Open Command Center
            </Link>
            <a className="secondary-action" href={summary.operatingCommandCenterBriefRoute}>
              Download Command Brief
            </a>
          </div>
        </div>
        {summary.operatingCommandCenterSummary.lanes.slice(0, 6).map((lane) => (
          <article className="module-row" key={lane.id}>
            <div>
              <span>{lane.priority}</span>
              <h2>{lane.title}</h2>
            </div>
            <p>{lane.nextSafeAction}</p>
            <div>
              <strong>{lane.owner}</strong>
              <ul className="compact-list">
                <li>Status: {lane.status}</li>
                <li>Mode: {lane.safeAutomationMode}</li>
                <li>Human review required: {lane.humanReviewRequired ? "yes" : "no"}</li>
                <li>Proof routes: {lane.proofRoutes.join(", ")}</li>
                <li>Blocked: {lane.blockedActions.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
        {summary.operatingCommandCenterSummary.evidencePackets.slice(0, 6).map((packet) => (
          <article className="module-row" key={packet.packetId}>
            <div>
              <span>{packet.releaseStage}</span>
              <h2>{packet.packetId}</h2>
            </div>
            <p>{packet.safeOutput}</p>
            <div>
              <strong>{packet.evidenceState}</strong>
              <ul className="compact-list">
                <li>Lane: {packet.laneId}</li>
                <li>Missing evidence: {packet.missingEvidence.length ? packet.missingEvidence.join(", ") : "none"}</li>
                <li>AAL2 required: {packet.aal2Required ? "yes" : "no"}</li>
                <li>Boundary release required: {packet.boundaryReleaseRequired ? "yes" : "no"}</li>
                <li>Hash: {packet.packetHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED automation autopilot">
        <div className="section-heading">
          <p className="eyebrow">Automation Autopilot</p>
          <h2>Safe autonomy is scored, gated, and blocked before any production authority is considered.</h2>
          <p className="section-copy">{summary.automationAutopilotSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.automationAutopilotRoute}>
              Open Automation Autopilot
            </Link>
            <a className="secondary-action" href={summary.automationAutopilotBriefRoute}>
              Download Autopilot Brief
            </a>
            <Link className="secondary-action" href="/scrimed-agent-governance">
              Review Agent Governance
            </Link>
          </div>
        </div>
        {summary.automationAutopilotSummary.capabilities.slice(0, 6).map((capability) => (
          <article className="module-row" key={capability.id}>
            <div>
              <span>{capability.mode}</span>
              <h2>{capability.name}</h2>
            </div>
            <p>{capability.bottleneckReduced}</p>
            <div>
              <strong>{capability.owner}</strong>
              <ul className="compact-list">
                <li>Domain: {capability.domain}</li>
                <li>Readiness: {capability.readinessScore}</li>
                <li>Human review required: {capability.humanReviewRequired ? "yes" : "no"}</li>
                <li>Production authority: blocked</li>
                <li>Next: {capability.nextAutomationStep}</li>
              </ul>
            </div>
          </article>
        ))}
        {summary.automationAutopilotSummary.bottleneckWorkarounds.map((workaround) => (
          <article className="module-row" key={workaround.id}>
            <div>
              <span>{workaround.owner}</span>
              <h2>{workaround.bottleneck}</h2>
            </div>
            <p>{workaround.safeWorkaround}</p>
            <div>
              <strong>{workaround.automationAssist}</strong>
              <ul className="compact-list">
                <li>Current limit: {workaround.currentLimit}</li>
                <li>Escalation: {workaround.escalationTrigger}</li>
                <li>Proof route: {workaround.proofRoute}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED strategic problem resolution">
        <div className="section-heading">
          <p className="eyebrow">Strategic problem resolution</p>
          <h2>Every weakness now becomes an owner-bound problem record, safe workaround, proof route, and next action.</h2>
          <p className="section-copy">{summary.strategicProblemResolutionSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.strategicProblemResolutionRoute}>
              Open Problem Resolution
            </Link>
            <a className="secondary-action" href={summary.strategicProblemResolutionBriefRoute}>
              Download Resolution Brief
            </a>
            <Link className="secondary-action" href={summary.limitationsWorkaroundRoute}>
              Review Workarounds
            </Link>
          </div>
        </div>
        {summary.strategicProblemResolutionSummary.topProblems.map((problem) => (
          <article className="module-row" key={problem.id}>
            <div>
              <span>{problem.severity}</span>
              <h2>{problem.title}</h2>
            </div>
            <p>{problem.safeWorkaround}</p>
            <div>
              <strong>{problem.owner}</strong>
              <ul className="compact-list">
                <li>Status: {problem.status}</li>
                <li>Priority: {problem.priorityScore}</li>
                <li>Human review: {problem.status === "human-review-required" ? "required" : "tracked"}</li>
                <li>Next: {problem.nextAction}</li>
                <li>Proof routes: {problem.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED healthcare optimization command">
        <div className="section-heading">
          <p className="eyebrow">Healthcare optimization command</p>
          <h2>Clinical workflow, patient engagement, hospital operations, agents, innovation, and interoperability now share one governed execution map.</h2>
          <p className="section-copy">{summary.healthcareOptimizationCommandSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.healthcareOptimizationCommandRoute}>
              Open Optimization Command
            </Link>
            <a className="secondary-action" href={summary.healthcareOptimizationCommandBriefRoute}>
              Download Optimization Brief
            </a>
            <Link className="secondary-action" href="/enterprise-healthcare-infrastructure">
              Infrastructure
            </Link>
          </div>
        </div>
        {summary.healthcareOptimizationCommandSummary.topLanes.map((lane) => (
          <article className="module-row" key={lane.id}>
            <div>
              <span>{lane.domain}</span>
              <h2>{lane.name}</h2>
            </div>
            <p>{lane.optimizationThesis}</p>
            <div>
              <strong>Priority {lane.priorityScore} - {lane.readiness}</strong>
              <ul className="compact-list">
                <li>Mode: {lane.safeAutomationMode}</li>
                <li>Commercial motion: {lane.commercialMotion}</li>
                <li>Next: {lane.nextBuildStep}</li>
                <li>Proof routes: {lane.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED healthcare value realization">
        <div className="section-heading">
          <p className="eyebrow">Healthcare value realization</p>
          <h2>Buyer-ready metrics and proof packages translate optimization work into measurable, reviewable value evidence.</h2>
          <p className="section-copy">{summary.healthcareValueRealizationSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.healthcareValueRealizationRoute}>
              Open Value Realization
            </Link>
            <a className="secondary-action" href={summary.healthcareValueRealizationBriefRoute}>
              Download Value Brief
            </a>
            <Link className="secondary-action" href="/pilot-demo-commercial-readiness">
              Pilot Readiness
            </Link>
          </div>
        </div>
        {summary.healthcareValueRealizationSummary.topPackages.map((valuePackage) => (
          <article className="module-row" key={valuePackage.id}>
            <div>
              <span>{valuePackage.buyerAudience}</span>
              <h2>{valuePackage.name}</h2>
            </div>
            <p>{valuePackage.valueThesis}</p>
            <div>
              <strong>{valuePackage.commercialMotion}</strong>
              <ul className="compact-list">
                <li>Artifact: {valuePackage.pilotArtifact}</li>
                <li>Boundary: {valuePackage.retainedBoundary}</li>
                <li>Metrics: {valuePackage.includedMetrics.join(", ")}</li>
                <li>Proof routes: {valuePackage.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED pilot value evidence">
        <div className="section-heading">
          <p className="eyebrow">Pilot value evidence</p>
          <h2>Buyer-ready evidence packets translate value metrics into acceptance criteria, reviewer gates, and safe commercial next steps.</h2>
          <p className="section-copy">{summary.pilotValueEvidenceSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.pilotValueEvidenceRoute}>
              Open Evidence Packets
            </Link>
            <a className="secondary-action" href={summary.pilotValueEvidenceBriefRoute}>
              Download Evidence Brief
            </a>
            <Link className="secondary-action" href="/healthcare-value-realization">
              Value Realization
            </Link>
          </div>
        </div>
        {summary.pilotValueEvidenceSummary.topPackets.map((packet) => (
          <article className="module-row" key={packet.id}>
            <div>
              <span>{packet.pilotWindow}</span>
              <h2>{packet.name}</h2>
            </div>
            <p>{packet.packetPurpose}</p>
            <div>
              <strong>{packet.buyerSegment}</strong>
              <ul className="compact-list">
                <li>Review gate: {packet.humanReviewGate}</li>
                <li>Commercial next step: {packet.commercialNextStep}</li>
                <li>Boundary: {packet.retainedBoundary}</li>
                <li>Acceptance: {packet.acceptanceCriteria.join(" ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED pilot activation planner">
        <div className="section-heading">
          <p className="eyebrow">Pilot activation planner</p>
          <h2>Evidence packets now flow into owner-bound activation plans, blocker workarounds, and human-reviewed handoffs.</h2>
          <p className="section-copy">{summary.pilotActivationPlannerSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.pilotActivationPlannerRoute}>
              Open Activation Planner
            </Link>
            <a className="secondary-action" href={summary.pilotActivationPlannerBriefRoute}>
              Download Activation Brief
            </a>
            <Link className="secondary-action" href={summary.pilotValueEvidenceRoute}>
              Evidence Packets
            </Link>
          </div>
        </div>
        {summary.pilotActivationPlannerSummary.topPlans.map((plan) => (
          <article className="module-row" key={plan.id}>
            <div>
              <span>{plan.buyerSegment}</span>
              <h2>{plan.name}</h2>
            </div>
            <p>{plan.activationThesis}</p>
            <div>
              <strong>{plan.handoffOwner}</strong>
              <ul className="compact-list">
                <li>Source: {plan.sourcePacket}</li>
                <li>Next: {plan.nextAction}</li>
                <li>Boundary: {plan.retainedBoundary}</li>
                <li>Success: {plan.successCriteria.join(" ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED pilot handoff command">
        <div className="section-heading">
          <p className="eyebrow">Pilot handoff command</p>
          <h2>Activation plans now become owner-bound handoff packets with hard stops before any external send.</h2>
          <p className="section-copy">{summary.pilotHandoffCommandSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.pilotHandoffCommandRoute}>
              Open Handoff Command
            </Link>
            <a className="secondary-action" href={summary.pilotHandoffCommandBriefRoute}>
              Download Handoff Brief
            </a>
            <Link className="secondary-action" href={summary.pilotActivationPlannerRoute}>
              Activation Planner
            </Link>
          </div>
        </div>
        {summary.pilotHandoffCommandSummary.topPackets.map((packet) => (
          <article className="module-row" key={packet.id}>
            <div>
              <span>{packet.audience}</span>
              <h2>{packet.title}</h2>
            </div>
            <p>{packet.purpose}</p>
            <div>
              <strong>{packet.status}</strong>
              <ul className="compact-list">
                <li>Review gate: {packet.reviewGate}</li>
                <li>Delivery: {packet.deliveryChannel}</li>
                <li>Blocked: {packet.blockedUse}</li>
                <li>Proof routes: {packet.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED pilot success review command">
        <div className="section-heading">
          <p className="eyebrow">Pilot success review command</p>
          <h2>Handoff packets become 30/60/90-day success reviews, evidence-gap controls, and claims-safe expansion paths.</h2>
          <p className="section-copy">{summary.pilotSuccessReviewCommandSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.pilotSuccessReviewCommandRoute}>
              Open Success Review
            </Link>
            <a className="secondary-action" href={summary.pilotSuccessReviewCommandBriefRoute}>
              Download Success Brief
            </a>
            <Link className="secondary-action" href={summary.pilotHandoffCommandRoute}>
              Handoff Command
            </Link>
          </div>
        </div>
        {summary.pilotSuccessReviewCommandSummary.topReviewPlans.map((plan) => (
          <article className="module-row" key={plan.id}>
            <div>
              <span>{plan.window} - {plan.domain}</span>
              <h2>{plan.name}</h2>
            </div>
            <p>{plan.reviewQuestion}</p>
            <div>
              <strong>{plan.status}</strong>
              <ul className="compact-list">
                <li>Reviewer: {plan.reviewerRole}</li>
                <li>Safe output: {plan.claimSafeOutput}</li>
                <li>Blocked: {plan.blockedClaim}</li>
                <li>Proof routes: {plan.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band split-band" aria-label="Company assessment posture">
        <div>
          <p className="eyebrow">Company assessment</p>
          <h2>{summary.companyAssessmentSummary.readinessBand}</h2>
          <p className="section-copy">{summary.companyAssessmentSummary.recommendedCompanyPosture}</p>
        </div>
        <div className="layer-list">
          {summary.companyAssessmentSummary.prioritySequence.map((step, index) => (
            <div className="layer-row" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band split-band" aria-label="Clinical production readiness posture">
        <div>
          <p className="eyebrow">Clinical production readiness</p>
          <h2>{summary.clinicalProductionReady ? "clinical-production-ready" : "not-clinical-production-ready"}</h2>
          <p className="section-copy">{summary.clinicalProductionReadinessSummary.nextCompanyMove}</p>
          <p className="section-copy">{summary.clinicalProductionReadinessSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.clinicalProductionReadinessRoute}>
              Open task ledger
            </Link>
            <a className="secondary-action" href={summary.clinicalProductionReadinessBriefRoute}>
              Download ledger
            </a>
          </div>
        </div>
        <div className="layer-list">
          {summary.clinicalProductionReadinessSummary.nextTasks.map((task, index) => (
            <div className="layer-row" key={task.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{task.id}: {task.task}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Pilot demo commercial readiness">
        <div className="section-heading">
          <p className="eyebrow">Pilot demo accelerator</p>
          <h2>Demos now map directly to pilot packages, price bands, proof assets, and no-PHI intake routes.</h2>
          <p className="section-copy">{summary.pilotDemoCommercialReadinessSummary.recommendedMarketPosition}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.pilotDemoCommercialReadinessRoute}>
              Open Accelerator
            </Link>
            <a className="secondary-action" href={summary.pilotDemoCommercialReadinessBriefRoute}>
              Download Accelerator Brief
            </a>
            <Link className="secondary-action" href={summary.pricingRoute}>
              Pricing
            </Link>
          </div>
        </div>
        {summary.pilotDemoCommercialReadinessSummary.demoOfferPaths.slice(0, 5).map((path) => (
          <article className="module-row" key={path.slug}>
            <div>
              <span>{path.recommendedOffer}</span>
              <h2>{path.name}</h2>
            </div>
            <p>{path.buyerFit}</p>
            <div>
              <strong>{path.pricingBand}</strong>
              <ul className="compact-list">
                <li>Pilot: {path.recommendedPilotName}</li>
                <li>{path.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED launch readiness">
        <div className="section-heading">
          <p className="eyebrow">Launch readiness</p>
          <h2>Launch structure now separates sandbox DNS false negatives from branded-domain go/no-go proof.</h2>
          <p className="section-copy">{summary.launchReadinessSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.launchReadinessRoute}>
              Open Launch Readiness
            </Link>
            <a className="secondary-action" href={summary.launchReadinessBriefRoute}>
              Download Launch Brief
            </a>
            <Link className="secondary-action" href={summary.releaseContinuityRoute}>
              Release Continuity
            </Link>
          </div>
        </div>
        {summary.launchReadinessSummary.launchDnsControls.map((control) => (
          <article className="module-row" key={control.name}>
            <div>
              <span>{control.status}</span>
              <h2>{control.name}</h2>
            </div>
            <p>{control.issue}</p>
            <div>
              <strong>{control.launchRule}</strong>
              <ul className="compact-list">
                <li>Command: {control.command}</li>
                <li>Pass: {control.passCondition}</li>
                <li>{control.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
        {summary.launchReadinessSummary.launchReadinessTracks.slice(0, 5).map((track) => (
          <article className="module-row" key={track.name}>
            <div>
              <span>{track.status}</span>
              <h2>{track.name}</h2>
            </div>
            <p>{track.launchQuestion}</p>
            <div>
              <strong>{track.owner}</strong>
              <ul className="compact-list">
                <li>Gate: {track.goNoGoGate}</li>
                <li>Workaround: {track.workaround}</li>
                <li>Hard stop: {track.hardStop}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED competitive defense">
        <div className="section-heading">
          <p className="eyebrow">Competitive defense</p>
          <h2>Competitor pressure now feeds legal, privacy, cybersecurity, and infiltration-deterrence hardening.</h2>
          <p className="section-copy">{summary.competitiveDefenseSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.competitiveDefenseRoute}>
              Open Competitive Defense
            </Link>
            <a className="secondary-action" href={summary.competitiveDefenseBriefRoute}>
              Download Defense Brief
            </a>
            <Link className="secondary-action" href="/claims">
              Claims Register
            </Link>
          </div>
        </div>
        {summary.competitiveDefenseSummary.threatProfiles.slice(0, 5).map((profile) => (
          <article className="module-row" key={profile.competitor}>
            <div>
              <span>{profile.category}</span>
              <h2>{profile.competitor}</h2>
            </div>
            <p>{profile.scrimedWeaknessExposed}</p>
            <div>
              <strong>{profile.counterPosition}</strong>
              <ul className="compact-list">
                <li>Hardening: {profile.hardeningMove}</li>
                <li>Boundary: {profile.legalPrivacyCyberBoundary}</li>
                <li>Proof: {profile.proofRoute}</li>
              </ul>
            </div>
          </article>
        ))}
        {summary.competitiveDefenseSummary.legalPrivacyCyberControls.slice(0, 5).map((control) => (
          <article className="module-row" key={control.control}>
            <div>
              <span>{control.status}</span>
              <h2>{control.control}</h2>
            </div>
            <p>{control.riskReduced}</p>
            <div>
              <strong>{control.deterrenceMechanism}</strong>
              <ul className="compact-list">
                <li>Owner: {control.owner}</li>
                <li>Evidence: {control.evidenceRoute}</li>
                <li>{control.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED service delivery workbench">
        <div className="section-heading">
          <p className="eyebrow">Service delivery</p>
          <h2>Packaged offers now resolve into work orders, acceptance criteria, artifacts, and retained gates.</h2>
          <p className="section-copy">{summary.serviceDeliverySummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.serviceDeliveryRoute}>
              Open Service Delivery
            </Link>
            <a className="secondary-action" href={summary.serviceDeliveryBriefRoute}>
              Download Delivery Brief
            </a>
            <Link className="secondary-action" href={summary.productServicePortfolioRoute}>
              Offerings Portfolio
            </Link>
          </div>
        </div>
        {summary.serviceDeliverySummary.serviceDeliveryOffers.slice(0, 4).map((offer) => (
          <article className="module-row" key={offer.slug}>
            <div>
              <span>{offer.status}</span>
              <h2>{offer.name}</h2>
            </div>
            <p>{offer.buyerPromise}</p>
            <div>
              <strong>{offer.serviceOwner}</strong>
              <ul className="compact-list">
                <li>Window: {offer.deliveryWindow}</li>
                <li>Acceptance: {offer.acceptanceCriteria.join(", ")}</li>
                <li>Margin: {offer.marginProtection.join(", ")}</li>
                <li>{offer.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
        {summary.serviceDeliverySummary.serviceDeliveryWorkOrderTemplates.slice(0, 3).map((template) => (
          <article className="module-row" key={template.slug}>
            <div>
              <span>{template.status}</span>
              <h2>{template.title}</h2>
            </div>
            <p>{template.tasks.join(" ")}</p>
            <div>
              <strong>{template.outputArtifact}</strong>
              <ul className="compact-list">
                <li>Owner: {template.owner}</li>
                <li>Hard stops: {template.hardStops.join(", ")}</li>
                <li>Proof: {template.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED client onboarding and communications">
        <div className="section-heading">
          <p className="eyebrow">Client onboarding and communications</p>
          <h2>Buyer meetings, demos, pilots, decks, emails, calendar agendas, and handoffs now share one controlled path.</h2>
          <p className="section-copy">{summary.clientOnboardingCommunicationsSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.clientOnboardingCommunicationsRoute}>
              Open Client Onboarding
            </Link>
            <a className="secondary-action" href={summary.clientOnboardingCommunicationsBriefRoute}>
              Download Onboarding Brief
            </a>
            <Link className="secondary-action" href="/demos">
              Demo Center
            </Link>
          </div>
        </div>
        {summary.clientOnboardingCommunicationsSummary.clientOnboardingStages.slice(0, 5).map((stage) => (
          <article className="module-row" key={stage.slug}>
            <div>
              <span>{stage.status}</span>
              <h2>{stage.name}</h2>
            </div>
            <p>{stage.objective}</p>
            <div>
              <strong>{stage.owner}</strong>
              <ul className="compact-list">
                <li>Buyer outputs: {stage.buyerOutputs.join(", ")}</li>
                <li>Internal outputs: {stage.internalOutputs.join(", ")}</li>
                <li>Hard stops: {stage.hardStops.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED product and services portfolio">
        <div className="section-heading">
          <p className="eyebrow">Product and services portfolio</p>
          <h2>Sellable packages now connect offer scope, proof routes, delivery gates, and margin controls.</h2>
          <p className="section-copy">{summary.productServicePortfolioSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.productServicePortfolioRoute}>
              Open Offerings
            </Link>
            <a className="secondary-action" href={summary.productServicePortfolioBriefRoute}>
              Download Portfolio Brief
            </a>
            <Link className="secondary-action" href={summary.enterpriseBusinessOpsRoute}>
              Business Ops
            </Link>
          </div>
        </div>
        {summary.productServicePortfolioSummary.productServicePackages.slice(0, 4).map((pack) => (
          <article className="module-row" key={pack.slug}>
            <div>
              <span>{pack.status}</span>
              <h2>{pack.name}</h2>
            </div>
            <p>{pack.bestFor}</p>
            <div>
              <strong>{pack.commercialModel}</strong>
              <ul className="compact-list">
                <li>Window: {pack.deliveryWindow}</li>
                <li>Includes: {pack.includedOffers.join(", ")}</li>
                <li>Expansion: {pack.expansionPath}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED commercial growth engine">
        <div className="section-heading">
          <p className="eyebrow">Commercial growth engine</p>
          <h2>Growth execution now has prioritized plays, conversion lanes, revenue proof steps, and retained gates.</h2>
          <p className="section-copy">{summary.growthEngineSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.growthEngineRoute}>
              Open Growth Engine
            </Link>
            <a className="secondary-action" href={summary.growthEngineBriefRoute}>
              Download Growth Brief
            </a>
            <Link className="secondary-action" href={summary.capitalVitalityRoute}>
              Capital Vitality
            </Link>
          </div>
        </div>
        {summary.growthEngineSummary.growthPlays.slice(0, 4).map((play) => (
          <article className="module-row" key={play.name}>
            <div>
              <span>{play.status}</span>
              <h2>{play.name}</h2>
            </div>
            <p>{play.revenueMotion}</p>
            <div>
              <strong>{play.primaryOffer}</strong>
              <ul className="compact-list">
                <li>{play.buyerSegment}</li>
                <li>{play.blockedBoundary}</li>
                <li>Next: {play.nextAction}</li>
                <li>Proof routes: {play.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED investor and audience readiness">
        <div className="section-heading">
          <p className="eyebrow">Investor and audience readiness</p>
          <h2>Weaknesses, competitive edge, and sellable value now route into audience-specific packets.</h2>
          <p className="section-copy">{summary.investorAudienceReadinessSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.investorAudienceReadinessRoute}>
              Open Investor Readiness
            </Link>
            <a className="secondary-action" href={summary.investorAudienceReadinessBriefRoute}>
              Download Audience Brief
            </a>
            <Link className="secondary-action" href={summary.enterpriseBusinessOpsRoute}>
              Business Ops
            </Link>
          </div>
        </div>
        {summary.investorAudienceReadinessSummary.investorAudiencePackets.slice(0, 5).map((packet) => (
          <article className="module-row" key={packet.audience}>
            <div>
              <span>{packet.readinessStatus}</span>
              <h2>{packet.audience}</h2>
            </div>
            <p>{packet.pitchAngle}</p>
            <div>
              <strong>{packet.sellableValue}</strong>
              <ul className="compact-list">
                <li>Packet: {packet.diligencePacket.join(", ")}</li>
                <li>Review: {packet.requiredReview}</li>
                <li>Next: {packet.nextMove}</li>
                <li>Blocked: {packet.blockedClaims.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED capital vitality">
        <div className="section-heading">
          <p className="eyebrow">Capital vitality</p>
          <h2>Revenue capabilities, moat evidence, investor milestones, and funding workstreams are now one governed growth lane.</h2>
          <p className="section-copy">{summary.capitalVitalitySummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.capitalVitalityRoute}>
              Open Capital Vitality
            </Link>
            <a className="secondary-action" href={summary.capitalVitalityBriefRoute}>
              Download Capital Brief
            </a>
            <Link className="secondary-action" href={summary.publicMarketReadinessRoute}>
              Public Market Readiness
            </Link>
          </div>
        </div>
        {summary.capitalVitalitySummary.revenueCapabilities.slice(0, 5).map((capability) => (
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
                <li>Proof routes: {capability.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
        {summary.capitalVitalitySummary.fundingVitalityWorkstreams.slice(0, 4).map((workstream) => (
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

      <section className="table-section" aria-label="SCRIMED service reliability">
        <div className="section-heading">
          <p className="eyebrow">Service reliability</p>
          <h2>Every product/service barrier now has an owner, mitigation, proof route, and retained boundary.</h2>
          <p className="section-copy">{summary.serviceReliabilitySummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.serviceReliabilityRoute}>
              Open Service Reliability
            </Link>
            <a className="secondary-action" href={summary.serviceReliabilityBriefRoute}>
              Download Reliability Brief
            </a>
            <Link className="secondary-action" href={summary.navigationAuditRoute}>
              Audit Navigation
            </Link>
          </div>
        </div>
        {summary.serviceReliabilitySummary.productServiceControls.slice(0, 6).map((control) => (
          <article className="module-row" key={control.name}>
            <div>
              <span>{control.status}</span>
              <h2>{control.name}</h2>
            </div>
            <p>{control.barrier}</p>
            <div>
              <strong>{control.mitigation}</strong>
              <ul className="compact-list">
                <li>Owner: {control.owner}</li>
                <li>Proof routes: {control.proofRoutes.join(", ")}</li>
                <li>{control.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED enterprise scalability operations">
        <div className="section-heading">
          <p className="eyebrow">Enterprise scalability</p>
          <h2>Capacity, tenant scale, SLO readiness, incident/change operations, support load, region, and cost controls now share one lane.</h2>
          <p className="section-copy">{summary.enterpriseScalabilityOperationsSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.enterpriseScalabilityOperationsRoute}>
              Open Enterprise Scale
            </Link>
            <a className="secondary-action" href={summary.enterpriseScalabilityOperationsBriefRoute}>
              Download Scale Brief
            </a>
            <Link className="secondary-action" href={summary.enterpriseBusinessOpsRoute}>
              Business Ops
            </Link>
          </div>
        </div>
        {summary.enterpriseScalabilityOperationsSummary.domains.slice(0, 5).map((domain) => (
          <article className="module-row" key={domain.slug}>
            <div>
              <span>{domain.status}</span>
              <h2>{domain.name}</h2>
            </div>
            <p>{domain.scaleQuestion}</p>
            <div>
              <strong>{domain.owner}</strong>
              <ul className="compact-list">
                <li>Control: {domain.operatingControl}</li>
                <li>Boundary: {domain.retainedBoundary}</li>
                <li>Proof routes: {domain.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
        {summary.enterpriseScalabilityOperationsSummary.bottlenecks.slice(0, 3).map((bottleneck) => (
          <article className="module-row" key={bottleneck.slug}>
            <div>
              <span>{bottleneck.status}</span>
              <h2>{bottleneck.name}</h2>
            </div>
            <p>{bottleneck.impact}</p>
            <div>
              <strong>{bottleneck.owner}</strong>
              <ul className="compact-list">
                <li>Workaround: {bottleneck.workaround}</li>
                <li>Gate: {bottleneck.graduationGate}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED API UI AI platform power operations">
        <div className="section-heading">
          <p className="eyebrow">API, UI, and AI platform power</p>
          <h2>API contracts, operator UI, model-route readiness, agent approvals, evals, evidence, and cost controls now share one lane.</h2>
          <p className="section-copy">{summary.platformPowerSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.platformPowerRoute}>
              Open Platform Power
            </Link>
            <a className="secondary-action" href={summary.platformPowerBriefRoute}>
              Download Platform Brief
            </a>
            <Link className="secondary-action" href="/agents">
              AgentOS
            </Link>
          </div>
        </div>
        {summary.platformPowerSummary.pillars.slice(0, 5).map((pillar) => (
          <article className="module-row" key={pillar.slug}>
            <div>
              <span>{pillar.status}</span>
              <h2>{pillar.name}</h2>
            </div>
            <p>{pillar.ambition}</p>
            <div>
              <strong>{pillar.owner}</strong>
              <ul className="compact-list">
                <li>Control: {pillar.operatingControl}</li>
                <li>Boundary: {pillar.retainedBoundary}</li>
                <li>Proof routes: {pillar.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
        {summary.platformPowerSummary.bottlenecks.slice(0, 3).map((bottleneck) => (
          <article className="module-row" key={bottleneck.slug}>
            <div>
              <span>{bottleneck.status}</span>
              <h2>{bottleneck.name}</h2>
            </div>
            <p>{bottleneck.impact}</p>
            <div>
              <strong>{bottleneck.owner}</strong>
              <ul className="compact-list">
                <li>Workaround: {bottleneck.workaround}</li>
                <li>Gate: {bottleneck.graduationGate}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED limitations and workaround operations">
        <div className="section-heading">
          <p className="eyebrow">Limitations and workarounds</p>
          <h2>Blocked requests now resolve to safe packets, escalation owners, proof routes, and graduation gates.</h2>
          <p className="section-copy">{summary.limitationsWorkaroundSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.limitationsWorkaroundRoute}>
              Open Workarounds
            </Link>
            <a className="secondary-action" href={summary.limitationsWorkaroundBriefRoute}>
              Download Workaround Brief
            </a>
            <Link className="secondary-action" href={summary.boundaryResolutionRoute}>
              Boundary Register
            </Link>
          </div>
        </div>
        {summary.limitationsWorkaroundSummary.tracks.slice(0, 6).map((track) => (
          <article className="module-row" key={track.slug}>
            <div>
              <span>{track.severity} / {track.state}</span>
              <h2>{track.title}</h2>
            </div>
            <p>{track.riskIfIgnored}</p>
            <div>
              <strong>{track.owner}</strong>
              <ul className="compact-list">
                <li>Workaround: {track.safeWorkaround}</li>
                <li>Gate: {track.graduationGate}</li>
                <li>Proof routes: {track.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
        {summary.limitationsWorkaroundSummary.packets.slice(0, 4).map((packet) => (
          <article className="module-row" key={packet.slug}>
            <div>
              <span>packet</span>
              <h2>{packet.name}</h2>
            </div>
            <p>{packet.usedWhen}</p>
            <div>
              <strong>{packet.owner}</strong>
              <ul className="compact-list">
                <li>Output: {packet.output}</li>
                <li>Expiry: {packet.expiryRule}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED manual QA execution console">
        <div className="section-heading">
          <p className="eyebrow">Manual QA execution console</p>
          <h2>AAL2 QA execution now has a protected command lane before buyer proof release.</h2>
          <p className="section-copy">{summary.qaManualExecutionConsoleSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.qaManualExecutionConsoleRoute}>
              Open Execution Console
            </Link>
            <a className="secondary-action" href={summary.qaManualExecutionConsoleBriefRoute}>
              Download Console Brief
            </a>
            <Link className="secondary-action" href="/pilot-workspace/access">
              Protected Workspace
            </Link>
          </div>
        </div>
        <article className="module-row">
          <div>
            <span>{summary.qaManualExecutionConsoleSummary.consoleState}</span>
            <h2>{summary.qaManualExecutionConsoleSummary.buyerSafeCurrentLanguage}</h2>
          </div>
          <p>{summary.qaManualExecutionConsoleSummary.decision.nextAction}</p>
          <div>
            <strong>Protected route: {summary.qaManualExecutionConsoleProtectedRoute}</strong>
            <ul className="compact-list">
              <li>Protected workspace anchor: {summary.qaManualExecutionConsoleProtectedWorkspaceRoute}</li>
              <li>Buyer proof ready: {summary.qaManualExecutionConsoleSummary.decision.buyerProofReleaseReady ? "yes" : "no"}</li>
            </ul>
          </div>
        </article>
        {summary.qaManualExecutionConsoleSummary.decision.stages.map((stage) => (
          <article className="module-row" key={stage.id}>
            <div>
              <span>{stage.status}</span>
              <h2>{stage.name}</h2>
            </div>
            <p>{stage.evidence}</p>
            <div>
              <strong>{stage.owner}</strong>
              <ul className="compact-list">
                <li>{stage.action}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED QA buyer proof release">
        <div className="section-heading">
          <p className="eyebrow">QA buyer proof release</p>
          <h2>Buyer Diligence now has a single protected release gate for retained manual QA proof.</h2>
          <p className="section-copy">{summary.qaBuyerProofReleaseSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.qaBuyerProofReleaseRoute}>
              Open Buyer Proof Release
            </Link>
            <a className="secondary-action" href={summary.qaBuyerProofReleaseBriefRoute}>
              Download Release Brief
            </a>
          </div>
        </div>
        <article className="module-row">
          <div>
            <span>{summary.qaBuyerProofReleaseSummary.releaseDecisionState}</span>
            <h2>{summary.qaBuyerProofReleaseSummary.decision.buyerSafeClaim}</h2>
          </div>
          <p>{summary.qaBuyerProofReleaseSummary.decision.nextAction}</p>
          <div>
            <strong>
              Buyer export: {summary.qaBuyerProofReleaseSummary.buyerDiligenceExportAllowed ? "allowed" : "blocked"}
            </strong>
            <ul className="compact-list">
              <li>Protected route: {summary.qaBuyerProofReleaseProtectedRoute}</li>
              <li>Buyer packet: {summary.qaBuyerProofReleaseBuyerPacketRoute}</li>
              <li>Public release: {summary.qaBuyerProofReleaseSummary.publicClaimAllowed ? "allowed" : "blocked"}</li>
            </ul>
          </div>
        </article>
        {summary.qaBuyerProofReleaseSummary.decision.releaseCriteria.map((criterion) => (
          <article className="module-row" key={criterion.id}>
            <div>
              <span>{criterion.status}</span>
              <h2>{criterion.name}</h2>
            </div>
            <p>{criterion.evidence}</p>
            <div>
              <strong>{criterion.nextAction}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED buyer release-control runbook">
        <div className="section-heading">
          <p className="eyebrow">Buyer release control</p>
          <h2>Buyer-specific sharing now has an operator-ready release-control runbook.</h2>
          <p className="section-copy">{summary.buyerReleaseControlRunSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.buyerReleaseControlRunRoute}>
              Open Release Control
            </Link>
            <a className="secondary-action" href={summary.buyerReleaseControlRunBriefRoute}>
              Download Runbook
            </a>
          </div>
        </div>
        <article className="module-row">
          <div>
            <span>{summary.buyerReleaseControlRunSummary.status}</span>
            <h2>{summary.buyerReleaseControlRunSummary.shareDecision}</h2>
          </div>
          <p>{summary.buyerReleaseControlRunSummary.nextRecommendedAction}</p>
          <div>
            <strong>{summary.buyerReleaseControlRunSummary.executionDecision}</strong>
            <ul className="compact-list">
              <li>Steps: {summary.buyerReleaseControlRunStepCount}</li>
              <li>Protected routes: {summary.buyerReleaseControlRunProtectedRouteCount}</li>
              <li>Packet routes: {summary.buyerReleaseControlRunPacketRouteCount}</li>
              <li>Verifier: {summary.buyerReleaseControlRunProtectedVerifierRoute}</li>
              <li>Verifier packet: {summary.buyerReleaseControlRunProtectedVerifierPacketRoute}</li>
              <li>Timeline: {summary.buyerReleaseControlRunProtectedVerifierTimelineRoute}</li>
              <li>Hard stops: {summary.buyerReleaseControlRunHardStopCount}</li>
            </ul>
          </div>
        </article>
        {summary.buyerReleaseControlRunSummary.steps.slice(0, 4).map((step) => (
          <article className="module-row" key={step.id}>
            <div>
              <span>{step.state}</span>
              <h2>{step.label}</h2>
            </div>
            <p>{step.boundary}</p>
            <div>
              <strong>{step.protectedRoute}</strong>
              <ul className="compact-list">
                <li>Packet: {step.packetRoute}</li>
                <li>{step.expectedAuditSignal}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED boundary resolution register">
        <div className="section-heading">
          <p className="eyebrow">Boundary resolution</p>
          <h2>Every known hard gate is tracked with a control, workaround, owner, proof route, and retained gate.</h2>
          <p className="section-copy">{summary.boundaryResolutionSummary.addressedPosition}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.boundaryResolutionRoute}>
              Open Boundary Register
            </Link>
            <a className="secondary-action" href={summary.boundaryResolutionBriefRoute}>
              Download Boundary Brief
            </a>
          </div>
        </div>
        {summary.boundaryResolutionSummary.records
          .filter((record) => record.state !== "active-control")
          .slice(0, 5)
          .map((record) => (
            <article className="module-row" key={record.id}>
              <div>
                <span>{record.state}</span>
                <h2>{record.name}</h2>
              </div>
              <p>{record.currentBoundary}</p>
              <div>
                <strong>{record.remainingGate}</strong>
                <ul className="compact-list">
                  <li>{record.safeWorkaround}</li>
                  <li>Proof routes: {record.proofRoutes.join(", ")}</li>
                </ul>
              </div>
            </article>
          ))}
      </section>

      <section className="table-section" aria-label="SCRIMED manual AAL2 QA execution readiness">
        <div className="section-heading">
          <p className="eyebrow">AAL2 QA execution</p>
          <h2>Authenticated QA is now sequenced as a human-run go/no-go process, not a hidden automation shortcut.</h2>
          <p className="section-copy">{summary.qaExecutionReadinessSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.qaExecutionReadinessRoute}>
              Open QA Execution Readiness
            </Link>
            <a className="secondary-action" href={summary.qaExecutionReadinessBriefRoute}>
              Download QA Execution Brief
            </a>
          </div>
        </div>
        {summary.qaExecutionReadinessSummary.executionStages.slice(0, 5).map((stage) => (
          <article className="module-row" key={stage.stage}>
            <div>
              <span>{stage.state}</span>
              <h2>{stage.stage}</h2>
            </div>
            <p>{stage.operatorAction}</p>
            <div>
              <strong>{stage.owner}</strong>
              <ul className="compact-list">
                <li>Accepted: {stage.evidenceAccepted.join(", ")}</li>
                <li>{stage.productionBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED manual AAL2 QA run control">
        <div className="section-heading">
          <p className="eyebrow">AAL2 QA run control</p>
          <h2>Run Control gives operators the exact no-secret mission brief for the first authenticated synthetic QA run.</h2>
          <p className="section-copy">{summary.qaRunControlSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.qaRunControlRoute}>
              Open QA Run Control
            </Link>
            <a className="secondary-action" href={summary.qaRunControlBriefRoute}>
              Download Run-Control Brief
            </a>
          </div>
        </div>
        {summary.qaRunControlSummary.workflows.map((workflow) => (
          <article className="module-row" key={workflow.workflowKind}>
            <div>
              <span>{workflow.state}</span>
              <h2>{workflow.name}</h2>
            </div>
            <p>{workflow.buyerProofPromotionRule}</p>
            <div>
              <strong>{workflow.dispatchPath}</strong>
              <ul className="compact-list">
                <li>Temporary secret: {workflow.temporarySecret}</li>
                <li>Command templates: 2</li>
                <li>Evidence route: {workflow.evidencePacketRoute}</li>
                <li>Persistence: {workflow.protectedPersistenceRoute}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED manual AAL2 QA launch kit">
        <div className="section-heading">
          <p className="eyebrow">AAL2 QA launch kit</p>
          <h2>Launch Kit turns the human-run AAL2 gate into one exact operator handoff.</h2>
          <p className="section-copy">{summary.qaLaunchKitSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.qaLaunchKitRoute}>
              Open Launch Kit
            </Link>
            <a className="secondary-action" href={summary.qaLaunchKitBriefRoute}>
              Download Launch Kit
            </a>
          </div>
        </div>
        {summary.qaLaunchKitSummary.phases.slice(0, 5).map((phase) => (
          <article className="module-row" key={phase.phase}>
            <div>
              <span>{phase.state}</span>
              <h2>{phase.phase}</h2>
            </div>
            <p>{phase.operatorAction}</p>
            <div>
              <strong>{phase.owner}</strong>
              <ul className="compact-list">
                <li>Pass: {phase.passSignal}</li>
                <li>Fail closed: {phase.failClosedIf}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED QA human run packet">
        <div className="section-heading">
          <p className="eyebrow">QA human run packet</p>
          <h2>Human Run Packet turns launch readiness into a bounded dispatch artifact.</h2>
          <p className="section-copy">{summary.qaHumanRunPacketSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.qaHumanRunPacketRoute}>
              Open Human Run Packet
            </Link>
            <a className="secondary-action" href={summary.qaHumanRunPacketBriefRoute}>
              Download Packet Brief
            </a>
          </div>
        </div>
        {summary.qaHumanRunPacketSummary.controls.map((control) => (
          <article className="module-row" key={control.control}>
            <div>
              <span>{control.state}</span>
              <h2>{control.control}</h2>
            </div>
            <p>{control.passSignal}</p>
            <div>
              <strong>{control.owner}</strong>
              <ul className="compact-list">
                <li>Fail closed: {control.failClosedIf}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED QA completion bridge">
        <div className="section-heading">
          <p className="eyebrow">QA completion bridge</p>
          <h2>Completion Bridge validates post-run evidence before protected persistence and buyer proof.</h2>
          <p className="section-copy">{summary.qaCompletionBridgeSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.qaCompletionBridgeRoute}>
              Open Completion Bridge
            </Link>
            <a className="secondary-action" href={summary.qaCompletionBridgeBriefRoute}>
              Download Bridge Brief
            </a>
          </div>
        </div>
        {summary.qaCompletionBridgeSummary.checkpoints.map((checkpoint) => (
          <article className="module-row" key={checkpoint.checkpoint}>
            <div>
              <span>{checkpoint.state}</span>
              <h2>{checkpoint.checkpoint}</h2>
            </div>
            <p>{checkpoint.evidenceRequired}</p>
            <div>
              <strong>{checkpoint.owner}</strong>
              <ul className="compact-list">
                <li>Pass: {checkpoint.passSignal}</li>
                <li>Fail closed: {checkpoint.failClosedIf}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED QA claim guard">
        <div className="section-heading">
          <p className="eyebrow">QA claim guard</p>
          <h2>Claim Guard keeps buyer, investor, sales, PR, and operator language inside current evidence.</h2>
          <p className="section-copy">{summary.qaClaimGuardSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.qaClaimGuardRoute}>
              Open Claim Guard
            </Link>
            <a className="secondary-action" href={summary.qaClaimGuardBriefRoute}>
              Download Claim Brief
            </a>
          </div>
        </div>
        {summary.qaClaimGuardSummary.rules.map((rule) => (
          <article className="module-row" key={rule.rule}>
            <div>
              <span>{rule.state}</span>
              <h2>{rule.rule}</h2>
            </div>
            <p>{rule.appliesWhen}</p>
            <div>
              <strong>{rule.requiredEvidence}</strong>
              <ul className="compact-list">
                <li>{rule.saferLanguage}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED QA activation seal">
        <div className="section-heading">
          <p className="eyebrow">QA activation seal</p>
          <h2>Activation Seal gives SCRIMED a final no-secret check before packet-backed buyer proof language.</h2>
          <p className="section-copy">{summary.qaActivationSealSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.qaActivationSealRoute}>
              Open Activation Seal
            </Link>
            <a className="secondary-action" href={summary.qaActivationSealBriefRoute}>
              Download Seal Brief
            </a>
          </div>
        </div>
        <article className="module-row">
          <div>
            <span>{summary.qaActivationSealSummary.decisionState}</span>
            <h2>{summary.qaActivationSealSummary.decision.buyerSafeClaim}</h2>
          </div>
          <p>{summary.qaActivationSealSummary.decision.nextAction}</p>
          <div>
            <strong>Seal allowed: {summary.qaActivationSealSummary.sealAllowed ? "yes" : "no"}</strong>
            <ul className="compact-list">
              <li>Buyer use: {summary.qaActivationSealSummary.buyerUseAllowed ? "yes" : "no"}</li>
              <li>Required evidence: {summary.qaActivationSealRequiredEvidenceCount}</li>
              <li>Hard stops: {summary.qaActivationSealHardStopRuleCount}</li>
            </ul>
          </div>
        </article>
        {summary.qaActivationSealSummary.rules.map((rule) => (
          <article className="module-row" key={rule.rule}>
            <div>
              <span>{rule.status}</span>
              <h2>{rule.rule}</h2>
            </div>
            <p>{rule.evidenceRequired}</p>
            <div>
              <strong>{rule.passSignal}</strong>
              <ul className="compact-list">
                <li>Fail closed: {rule.failClosedIf}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED manual QA proof promotion">
        <div className="section-heading">
          <p className="eyebrow">Manual QA proof promotion</p>
          <h2>Buyer proof can reference authenticated QA only after no-secret packet metadata is retained.</h2>
          <p className="section-copy">{summary.qaProofPromotionSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.qaProofPromotionRoute}>
              Open Proof Promotion
            </Link>
            <a className="secondary-action" href={summary.qaProofPromotionBriefRoute}>
              Download Promotion Brief
            </a>
          </div>
        </div>
        <article className="module-row">
          <div>
            <span>{summary.qaProofPromotionSummary.promotionDecisionState}</span>
            <h2>{summary.qaProofPromotionSummary.decision.buyerSafeClaim}</h2>
          </div>
          <p>{summary.qaProofPromotionSummary.decision.buyerProofLanguage}</p>
          <div>
            <strong>{summary.qaProofPromotionSummary.decision.nextAction}</strong>
            <ul className="compact-list">
              <li>Promotion allowed: {summary.qaProofPromotionSummary.promotionAllowed ? "yes" : "no"}</li>
              <li>Hard stops: {summary.qaProofPromotionHardStopRuleCount}</li>
              <li>Blocked claims: {summary.qaProofPromotionBlockedClaimCount}</li>
            </ul>
          </div>
        </article>
        {summary.qaProofPromotionSummary.rules.map((rule) => (
          <article className="module-row" key={rule.rule}>
            <div>
              <span>{rule.status}</span>
              <h2>{rule.rule}</h2>
            </div>
            <p>{rule.beforePromotion}</p>
            <div>
              <strong>{rule.afterPromotion}</strong>
              <ul className="compact-list">
                <li>{rule.boundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED clinical authority readiness">
        <div className="section-heading">
          <p className="eyebrow">Clinical authority readiness</p>
          <h2>Hard gates for live care, PHI, legal approval, regional approval, reimbursement, security certification, and production authorization are now explicit.</h2>
          <p className="section-copy">{summary.clinicalAuthorityReadinessSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.clinicalAuthorityReadinessRoute}>
              Open Authority Readiness
            </Link>
            <a className="secondary-action" href={summary.clinicalAuthorityReadinessBriefRoute}>
              Download Authority Brief
            </a>
          </div>
        </div>
        {summary.clinicalAuthorityReadinessSummary.domains.slice(0, 5).map((domain) => (
          <article className="module-row" key={domain.key}>
            <div>
              <span>{domain.status}</span>
              <h2>{domain.name}</h2>
            </div>
            <p>{domain.currentBoundary}</p>
            <div>
              <strong>{domain.retainedGate}</strong>
              <ul className="compact-list">
                <li>{domain.safeWorkaround}</li>
                <li>Proof routes: {domain.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED buyer and investor navigation paths">
        <div className="section-heading">
          <p className="eyebrow">Navigation paths</p>
          <h2>Choose the right SCRIMED proof path for the person evaluating the company.</h2>
          <p className="section-copy">
            The product is organized for enterprise buyers, security reviewers, investors, and clinical operators, with each path tied to evidence and explicit boundaries.
          </p>
        </div>
        {summary.buyerDecisionPaths.map((path) => (
          <article className="module-row" key={path.audience}>
            <div>
              <span>{path.audience}</span>
              <h2>{path.primaryQuestion}</h2>
            </div>
            <p>{path.recommendedStart} {path.proof}</p>
            <div>
              <Link className="module-link" href={path.route}>
                Start here
              </Link>
              <ul className="compact-list">
                {path.supportingRoutes.map((route) => (
                  <li key={route}>{route}</li>
                ))}
                <li>{path.boundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED global reach">
        <div className="section-heading">
          <p className="eyebrow">Global reach</p>
          <h2>Region, buyer, partner, procurement, and localization readiness are now first-class product evidence.</h2>
          <p className="section-copy">{summary.globalPartnerLocalizationSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.globalReachRoute}>
              Open Global Reach
            </Link>
            <a className="secondary-action" href={summary.globalReachBriefRoute}>
              Download Global Brief
            </a>
          </div>
        </div>
        {summary.globalPartnerLocalizationSummary.buyerPacks.slice(0, 5).map((pack) => (
          <article className="module-row" key={pack.key}>
            <div>
              <span>{pack.priority}</span>
              <h2>{pack.audience}</h2>
            </div>
            <p>{pack.localizedMessage}</p>
            <div>
              <Link className="module-link" href={pack.entryRoute}>
                {pack.recommendedOffer}
              </Link>
              <ul className="compact-list">
                <li>{pack.competitiveEdge}</li>
                <li>Disqualifiers: {pack.disqualifiers.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED global enterprise command">
        <div className="section-heading">
          <p className="eyebrow">Global enterprise command</p>
          <h2>International viability, sales, interoperability, and communication now share one governed execution layer.</h2>
          <p className="section-copy">{summary.globalEnterpriseCommandSummary.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={summary.globalEnterpriseCommandRoute}>
              Open Global Command
            </Link>
            <a className="secondary-action" href={summary.globalEnterpriseCommandBriefRoute}>
              Download Global Command Brief
            </a>
            <Link className="secondary-action" href="/client-onboarding">
              Review Communications
            </Link>
          </div>
        </div>
        {summary.globalEnterpriseCommandSummary.scorecards.map((scorecard) => (
          <article className="module-row" key={scorecard.category}>
            <div>
              <span>{scorecard.owner}</span>
              <h2>{scorecard.category}</h2>
            </div>
            <p>{scorecard.evidence}</p>
            <div>
              <strong>Score {scorecard.score}</strong>
              <ul className="compact-list">
                <li>Risk: {scorecard.risk}</li>
                <li>Next: {scorecard.nextAction}</li>
              </ul>
            </div>
          </article>
        ))}
        {summary.globalEnterpriseCommandSummary.regionalCommands.slice(0, 5).map((command) => (
          <article className="module-row" key={command.slug}>
            <div>
              <span>{command.tier}</span>
              <h2>{command.region}</h2>
            </div>
            <p>{command.nextAction}</p>
            <div>
              <strong>Readiness {command.readinessScore}</strong>
              <ul className="compact-list">
                <li>Sales motion: {command.salesMotion}</li>
                <li>Retained gates: {command.retainedGates.join(", ")}</li>
                <li>Proof: {command.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
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
