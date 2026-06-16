import { getPilotPrograms } from "./demoPilotPrograms";
import {
  buildSalesAttribution,
  getSalesAttributionSummary,
  type SalesAttribution
} from "./salesAttribution";
import {
  salesPipelineStages,
  type SalesOpportunity,
  type SalesPipelineStage
} from "./salesOperations";
import { getSourceIntelligenceSummary } from "./sourceIntelligence";

export type AttributionAnalyticsMode = "synthetic-public-fixture" | "tenant-durable-opportunity";

export type AttributionAnalyticsDimension =
  | "sourceCategory"
  | "campaign"
  | "buyerType"
  | "deploymentProfile"
  | "offer"
  | "cadence"
  | "proofPacket"
  | "salesOutcome";

export type AttributionSalesOutcome =
  | "new-opportunity"
  | "active-discovery"
  | "proposal-ready"
  | "pilot-planning"
  | "won"
  | "closed-lost";

export type AttributionAnalyticsRecord = {
  id: string;
  capturedAt: string;
  sourceCategory: string;
  sourceRoute: string;
  campaignSource: string;
  campaignMedium: string;
  campaignName: string;
  campaignChannel: string;
  buyerType: string;
  organizationSize: string;
  region: string;
  deploymentProfile: string;
  offer: string;
  cadence: string;
  firstResponseSla: string;
  proofPacketRoute: string;
  pilotProgramRoute: string;
  pipelineStage: SalesPipelineStage;
  assessmentStatus: string;
  salesOutcome: AttributionSalesOutcome;
  sourceSignals: string[];
  retentionState: "synthetic-fixture" | "durably-retained" | "manual-review-required" | "legacy-unattributed";
  noPhiBoundary: true;
};

export type AttributionAnalyticsCohort = {
  dimension: AttributionAnalyticsDimension;
  key: string;
  label: string;
  recordCount: number;
  shareOfRecords: number;
  openCount: number;
  proposalCount: number;
  pilotPlanningCount: number;
  wonCount: number;
  closedLostCount: number;
  stageCounts: Record<SalesPipelineStage, number>;
  proofPacketRoutes: string[];
  sourceSignals: string[];
  sampleRecordIds: string[];
  recommendedAction: string;
  governanceBoundary: string;
};

export type AttributionAnalyticsReport = {
  service: "scrimed-attribution-analytics";
  status: "cohort-analytics-ready" | "tenant-cohort-analytics-ready" | "tenant-cohort-analytics-empty";
  route: "/attribution-analytics";
  apiRoute: "/api/attribution-analytics";
  authenticatedApiRoute: "/api/sales-operations/attribution-analytics";
  authenticatedPacketApiRoute: "/api/sales-operations/opportunities/{intakeId}/attribution-analytics-packet";
  mode: AttributionAnalyticsMode;
  generatedAt: string;
  updated: "2026-06-15";
  boundary: string;
  persistence: {
    publicMode: string;
    tenantMode: string;
    durableSource: string;
    authenticatedRoute: string;
    fallback: string;
  };
  totals: {
    recordCount: number;
    attributedRecordCount: number;
    sourceCoveragePercent: number;
    proofPacketCoveragePercent: number;
    openPipelineCount: number;
    proposalCount: number;
    pilotPlanningCount: number;
    wonCount: number;
    closedLostCount: number;
  };
  funnel: Array<{
    stage: SalesPipelineStage;
    count: number;
    shareOfRecords: number;
  }>;
  dimensions: AttributionAnalyticsDimension[];
  cohorts: AttributionAnalyticsCohort[];
  proofRecommendations: Array<{
    cohort: string;
    route: string;
    reason: string;
    nextAction: string;
    boundary: string;
  }>;
  records: AttributionAnalyticsRecord[];
  limitations: string[];
  nextBuildStep: string;
};

export const attributionAnalyticsBoundary =
  "SCRIMED attribution analytics reports CRM-safe, no-PHI buyer-source and sales-process metadata only. Public analytics use synthetic fixtures. Authenticated tenant analytics may derive from persisted no-PHI pilot-intake opportunities, but must not expose PHI, patient identifiers, clinical records, diagnosis details, payer member identifiers, ad-platform sensitive health inferences, guaranteed ROI, or customer-identifying outcomes without approval.";

const cohortDimensions: AttributionAnalyticsDimension[] = [
  "sourceCategory",
  "campaign",
  "buyerType",
  "deploymentProfile",
  "offer",
  "cadence",
  "proofPacket",
  "salesOutcome"
];

function emptyStageCounts(): Record<SalesPipelineStage, number> {
  return {
    "new": 0,
    "qualified": 0,
    "discovery": 0,
    "proposal": 0,
    "pilot-planning": 0,
    "won": 0,
    "closed-lost": 0
  };
}

function percent(part: number, whole: number) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

function stageToOutcome(stage: SalesPipelineStage): AttributionSalesOutcome {
  if (stage === "new") return "new-opportunity";
  if (stage === "qualified" || stage === "discovery") return "active-discovery";
  if (stage === "proposal") return "proposal-ready";
  if (stage === "pilot-planning") return "pilot-planning";
  if (stage === "won") return "won";
  return "closed-lost";
}

function pilotProgramRouteForOffer(offer: string) {
  const normalized = offer.toLowerCase();
  const pilot = getPilotPrograms().find((program) => {
    if (normalized.includes("synthetic")) return program.slug === "60-day-governed-automation-pilot";
    if (normalized.includes("workflow")) return program.slug === "30-day-workflow-intelligence-sprint";
    if (normalized.includes("governance") || normalized.includes("readiness")) {
      return program.slug === "ai-governance-interoperability-readiness";
    }
    if (normalized.includes("blueprint") || normalized.includes("enterprise")) {
      return program.slug === "90-day-enterprise-atlas-pilot";
    }

    return false;
  });

  return pilot?.route ?? "/pilots";
}

function normalizeLabel(value: string) {
  return value.trim() || "Unspecified";
}

function dimensionValue(record: AttributionAnalyticsRecord, dimension: AttributionAnalyticsDimension) {
  if (dimension === "campaign") return normalizeLabel(record.campaignChannel);
  if (dimension === "proofPacket") return normalizeLabel(record.proofPacketRoute);
  return normalizeLabel(String(record[dimension]));
}

function actionForCohort(dimension: AttributionAnalyticsDimension, label: string, cohort: AttributionAnalyticsCohort) {
  if (dimension === "sourceCategory") {
    return `Keep ${label} routed into no-PHI intake and compare first-response completion against proof-packet readiness.`;
  }

  if (dimension === "campaign") {
    return `Use ${label} as a controlled campaign cohort; review claim language, conversion quality, and disqualification reasons before scaling.`;
  }

  if (dimension === "buyerType") {
    return `Build a buyer-specific proof packet for ${label} and assign an owner for discovery, governance, and deployment profile review.`;
  }

  if (dimension === "deploymentProfile") {
    return `Attach ${label} readiness gates to every opportunity before proposal, including residency, security, connector, and review requirements.`;
  }

  if (dimension === "offer") {
    return `Track ${label} from intake through proposal and pilot planning; compare requested workflows against deliverable scope.`;
  }

  if (dimension === "cadence") {
    return `Audit whether ${label} follow-up commitments are met and escalate overdue enterprise opportunities.`;
  }

  if (dimension === "proofPacket") {
    return `Keep ${label} current with source attribution, blocked claims, governance gates, and buyer-specific next decisions.`;
  }

  if (cohort.wonCount > 0) {
    return `Convert ${label} into a reusable post-sale operating pattern only after written approval and outcome evidence.`;
  }

  if (cohort.closedLostCount > 0) {
    return `Review ${label} losses for disqualifiers, unclear value, missing proof, pricing mismatch, or unsafe expectations.`;
  }

  return `Advance ${label} only through governed human-reviewed sales operations.`;
}

function buildCohorts(records: AttributionAnalyticsRecord[]) {
  const cohorts: AttributionAnalyticsCohort[] = [];

  for (const dimension of cohortDimensions) {
    const grouped = new Map<string, AttributionAnalyticsRecord[]>();

    for (const record of records) {
      const key = dimensionValue(record, dimension);
      grouped.set(key, [...(grouped.get(key) ?? []), record]);
    }

    for (const [label, group] of grouped) {
      const stageCounts = emptyStageCounts();

      for (const record of group) {
        stageCounts[record.pipelineStage] += 1;
      }

      const cohort: AttributionAnalyticsCohort = {
        dimension,
        key: `${dimension}:${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        label,
        recordCount: group.length,
        shareOfRecords: percent(group.length, records.length),
        openCount: group.filter((record) => !["won", "closed-lost"].includes(record.pipelineStage)).length,
        proposalCount: stageCounts.proposal,
        pilotPlanningCount: stageCounts["pilot-planning"],
        wonCount: stageCounts.won,
        closedLostCount: stageCounts["closed-lost"],
        stageCounts,
        proofPacketRoutes: Array.from(new Set(group.map((record) => record.proofPacketRoute))).filter(Boolean),
        sourceSignals: Array.from(new Set(group.flatMap((record) => record.sourceSignals))).filter(Boolean),
        sampleRecordIds: group.slice(0, 3).map((record) => record.id),
        recommendedAction: "",
        governanceBoundary: "Cohort analytics guide sales operations and pilot planning; they are not clinical, reimbursement, compliance, or guaranteed outcome claims."
      };

      cohort.recommendedAction = actionForCohort(dimension, label, cohort);
      cohorts.push(cohort);
    }
  }

  return cohorts.sort((left, right) => right.recordCount - left.recordCount || left.label.localeCompare(right.label));
}

function buildRecordFromAttribution({
  id,
  capturedAt,
  attribution,
  buyerType,
  organizationSize,
  region,
  offer,
  pipelineStage,
  assessmentStatus,
  retentionState
}: {
  id: string;
  capturedAt: string;
  attribution: SalesAttribution;
  buyerType: string;
  organizationSize: string;
  region: string;
  offer: string;
  pipelineStage: SalesPipelineStage;
  assessmentStatus: string;
  retentionState: AttributionAnalyticsRecord["retentionState"];
}): AttributionAnalyticsRecord {
  return {
    id,
    capturedAt,
    sourceCategory: attribution.sourceCategory,
    sourceRoute: attribution.sourceRoute,
    campaignSource: attribution.campaign.source,
    campaignMedium: attribution.campaign.medium,
    campaignName: attribution.campaign.campaign,
    campaignChannel: attribution.campaign.matchedChannel,
    buyerType,
    organizationSize,
    region,
    deploymentProfile: attribution.deployment.profileName,
    offer: attribution.market.revenueStream || offer,
    cadence: attribution.cadence.priority,
    firstResponseSla: attribution.cadence.firstResponseSla,
    proofPacketRoute: attribution.market.proofRoute,
    pilotProgramRoute: pilotProgramRouteForOffer(offer),
    pipelineStage,
    assessmentStatus,
    salesOutcome: stageToOutcome(pipelineStage),
    sourceSignals: attribution.sourceSignals.map((signal) => signal.sourceName),
    retentionState,
    noPhiBoundary: true
  };
}

function buildSyntheticRecords(): AttributionAnalyticsRecord[] {
  const fixtures = [
    {
      id: "SYN-ATTR-001",
      source: "/product",
      referrer: "https://www.scrimedsolutions.com",
      utmSource: "wix",
      utmMedium: "owned-website",
      utmCampaign: "product-console-cta",
      utmTerm: "",
      utmContent: "request-pilot",
      buyerSegment: "health-system",
      buyerType: "Health system operations executives",
      organizationSize: "501-5000",
      region: "United States",
      offerInterest: "synthetic-pilot-evaluation",
      workflowTargets: ["prior-authorization", "rcm-denial-risk"],
      readinessNeeds: ["workflow-map", "synthetic-demo", "security-review"],
      governanceRequirements: ["human-review", "synthetic-only", "audit-trail", "no-autonomous-diagnosis"],
      timeline: "30-90-days",
      pipelineStage: "proposal" as SalesPipelineStage,
      assessmentStatus: "invitation-prepared"
    },
    {
      id: "SYN-ATTR-002",
      source: "/pricing",
      referrer: "https://www.linkedin.com",
      utmSource: "linkedin",
      utmMedium: "paid-social",
      utmCampaign: "executive-demand-generation",
      utmTerm: "revenue-cycle-ai",
      utmContent: "pilot-program",
      buyerSegment: "payer",
      buyerType: "Payer and revenue cycle leaders",
      organizationSize: "5000-plus",
      region: "United States",
      offerInterest: "protected-enterprise-pilot",
      workflowTargets: ["prior-authorization", "rcm-denial-risk"],
      readinessNeeds: ["integration-map", "security-review", "roi-model"],
      governanceRequirements: ["human-review", "audit-trail", "role-based-access", "no-autonomous-diagnosis"],
      timeline: "now",
      pipelineStage: "pilot-planning" as SalesPipelineStage,
      assessmentStatus: "confirmed"
    },
    {
      id: "SYN-ATTR-003",
      source: "/faithcore",
      referrer: "https://www.scrimedsolutions.com",
      utmSource: "faithcore",
      utmMedium: "owned-community",
      utmCampaign: "faithcore-awareness",
      utmTerm: "",
      utmContent: "trust-layer",
      buyerSegment: "faith-aligned-care",
      buyerType: "Faith-aligned care, community, and patient-experience leaders",
      organizationSize: "51-500",
      region: "Global / multi-region",
      offerInterest: "workflow-intelligence-assessment",
      workflowTargets: ["patient-onboarding", "care-gap-detection"],
      readinessNeeds: ["workflow-map", "executive-brief"],
      governanceRequirements: ["human-review", "synthetic-only", "no-autonomous-diagnosis"],
      timeline: "exploratory",
      pipelineStage: "discovery" as SalesPipelineStage,
      assessmentStatus: "not-scheduled"
    },
    {
      id: "SYN-ATTR-004",
      source: "/deployment-profiles",
      referrer: "https://www.scrimedsolutions.com",
      utmSource: "direct",
      utmMedium: "executive-briefing",
      utmCampaign: "sovereign-profile-review",
      utmTerm: "sovereign-healthcare-ai",
      utmContent: "deployment-profile",
      buyerSegment: "government-public-health",
      buyerType: "Government and public-sector healthcare leaders",
      organizationSize: "5000-plus",
      region: "Middle East",
      offerInterest: "strategic-platform-partnership",
      workflowTargets: ["governance-operating-layer", "referral-intake"],
      readinessNeeds: ["integration-map", "security-review", "executive-brief"],
      governanceRequirements: ["human-review", "audit-trail", "role-based-access", "hipaa-ready"],
      timeline: "3-6-months",
      pipelineStage: "qualified" as SalesPipelineStage,
      assessmentStatus: "not-scheduled"
    },
    {
      id: "SYN-ATTR-005",
      source: "/trust-center",
      referrer: "https://www.google.com",
      utmSource: "search",
      utmMedium: "paid-search",
      utmCampaign: "ai-governance-readiness",
      utmTerm: "healthcare ai governance audit",
      utmContent: "readiness-brief",
      buyerSegment: "security-governance",
      buyerType: "Security, privacy, legal, and governance buyers",
      organizationSize: "501-5000",
      region: "United States",
      offerInterest: "ai-readiness-governance-audit",
      workflowTargets: ["governance-operating-layer"],
      readinessNeeds: ["security-review", "executive-brief"],
      governanceRequirements: ["human-review", "audit-trail", "role-based-access", "no-autonomous-diagnosis"],
      timeline: "now",
      pipelineStage: "won" as SalesPipelineStage,
      assessmentStatus: "completed"
    },
    {
      id: "SYN-ATTR-006",
      source: "/pilot",
      referrer: "",
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
      utmTerm: "",
      utmContent: "",
      buyerSegment: "clinic-network",
      buyerType: "Clinic network",
      organizationSize: "1-50",
      region: "United States",
      offerInterest: "clinical-operations-automation-blueprint",
      workflowTargets: ["ambient-documentation"],
      readinessNeeds: ["synthetic-demo"],
      governanceRequirements: ["human-review", "synthetic-only"],
      timeline: "exploratory",
      pipelineStage: "closed-lost" as SalesPipelineStage,
      assessmentStatus: "cancelled"
    }
  ];

  return fixtures.map((fixture, index) => {
    const capturedAt = `2026-06-${String(10 + index).padStart(2, "0")}T14:00:00.000Z`;
    const attribution = buildSalesAttribution({
      source: fixture.source,
      referrer: fixture.referrer,
      utmSource: fixture.utmSource,
      utmMedium: fixture.utmMedium,
      utmCampaign: fixture.utmCampaign,
      utmTerm: fixture.utmTerm,
      utmContent: fixture.utmContent,
      buyerSegment: fixture.buyerSegment,
      organizationSize: fixture.organizationSize,
      region: fixture.region,
      offerInterest: fixture.offerInterest,
      workflowTargets: fixture.workflowTargets,
      readinessNeeds: fixture.readinessNeeds,
      governanceRequirements: fixture.governanceRequirements,
      timeline: fixture.timeline,
      receivedAt: capturedAt
    });

    return buildRecordFromAttribution({
      id: fixture.id,
      capturedAt,
      attribution,
      buyerType: fixture.buyerType,
      organizationSize: fixture.organizationSize,
      region: fixture.region,
      offer: fixture.offerInterest,
      pipelineStage: fixture.pipelineStage,
      assessmentStatus: fixture.assessmentStatus,
      retentionState: "synthetic-fixture"
    });
  });
}

export function buildAttributionRecordsFromOpportunities(
  opportunities: SalesOpportunity[]
): AttributionAnalyticsRecord[] {
  return opportunities.map((opportunity) => {
    const attribution = opportunity.payload.attribution;
    const pipelineStage = opportunity.pipelineStage;

    if (!attribution) {
      return {
        id: opportunity.intakeId,
        capturedAt: opportunity.receivedAt,
        sourceCategory: "legacy-unattributed",
        sourceRoute: opportunity.payload.source || "/pilot",
        campaignSource: "",
        campaignMedium: "",
        campaignName: "",
        campaignChannel: "Legacy opportunity",
        buyerType: opportunity.payload.organization.buyerSegment,
        organizationSize: opportunity.payload.organization.organizationSize,
        region: opportunity.payload.organization.region,
        deploymentProfile: "To be confirmed",
        offer: opportunity.payload.scope.offerInterest,
        cadence: "standard",
        firstResponseSla: "To be confirmed",
        proofPacketRoute: pilotProgramRouteForOffer(opportunity.payload.scope.offerInterest),
        pilotProgramRoute: pilotProgramRouteForOffer(opportunity.payload.scope.offerInterest),
        pipelineStage,
        assessmentStatus: opportunity.assessmentStatus,
        salesOutcome: stageToOutcome(pipelineStage),
        sourceSignals: [],
        retentionState: "legacy-unattributed",
        noPhiBoundary: true
      };
    }

    return buildRecordFromAttribution({
      id: opportunity.intakeId,
      capturedAt: opportunity.receivedAt,
      attribution,
      buyerType: opportunity.payload.organization.buyerSegment,
      organizationSize: opportunity.payload.organization.organizationSize,
      region: opportunity.payload.organization.region,
      offer: opportunity.payload.scope.offerInterest,
      pipelineStage,
      assessmentStatus: opportunity.assessmentStatus,
      retentionState: "durably-retained"
    });
  });
}

export function buildAttributionAnalyticsReport(
  records: AttributionAnalyticsRecord[],
  mode: AttributionAnalyticsMode,
  generatedAt = new Date().toISOString()
): AttributionAnalyticsReport {
  const attributionSummary = getSalesAttributionSummary();
  const sourceSummary = getSourceIntelligenceSummary();
  const cohorts = buildCohorts(records);
  const stageCounts = emptyStageCounts();

  for (const record of records) {
    stageCounts[record.pipelineStage] += 1;
  }

  const attributedRecordCount = records.filter((record) => record.sourceCategory !== "legacy-unattributed").length;
  const proofPacketCount = records.filter((record) => record.proofPacketRoute).length;
  const topCohorts = cohorts
    .filter((cohort) => ["sourceCategory", "buyerType", "offer", "deploymentProfile"].includes(cohort.dimension))
    .slice(0, 6);

  return {
    service: "scrimed-attribution-analytics",
    status:
      mode === "tenant-durable-opportunity"
        ? records.length > 0
          ? "tenant-cohort-analytics-ready"
          : "tenant-cohort-analytics-empty"
        : "cohort-analytics-ready",
    route: "/attribution-analytics",
    apiRoute: "/api/attribution-analytics",
    authenticatedApiRoute: "/api/sales-operations/attribution-analytics",
    authenticatedPacketApiRoute: "/api/sales-operations/opportunities/{intakeId}/attribution-analytics-packet",
    mode,
    generatedAt,
    updated: "2026-06-15",
    boundary: attributionAnalyticsBoundary,
    persistence: {
      publicMode: "Synthetic cohort fixtures for public buyer and investor review.",
      tenantMode: "Authenticated tenant-admin analytics derive from persisted no-PHI Sales Operations opportunities.",
      durableSource: "private.pilot_intake_submissions.payload.attribution",
      authenticatedRoute: "/api/sales-operations/attribution-analytics",
      fallback:
        "When durable opportunity volume is low or unavailable, use synthetic fixtures and manual review packets while keeping retention status explicit."
    },
    totals: {
      recordCount: records.length,
      attributedRecordCount,
      sourceCoveragePercent: percent(attributedRecordCount, records.length),
      proofPacketCoveragePercent: percent(proofPacketCount, records.length),
      openPipelineCount: records.filter((record) => !["won", "closed-lost"].includes(record.pipelineStage)).length,
      proposalCount: stageCounts.proposal,
      pilotPlanningCount: stageCounts["pilot-planning"],
      wonCount: stageCounts.won,
      closedLostCount: stageCounts["closed-lost"]
    },
    funnel: salesPipelineStages.map((stage) => ({
      stage,
      count: stageCounts[stage],
      shareOfRecords: percent(stageCounts[stage], records.length)
    })),
    dimensions: cohortDimensions,
    cohorts,
    proofRecommendations: topCohorts.map((cohort) => ({
      cohort: `${cohort.dimension}: ${cohort.label}`,
      route: cohort.proofPacketRoutes[0] ?? attributionSummary.route,
      reason: `${cohort.recordCount} record${cohort.recordCount === 1 ? "" : "s"} with ${cohort.sourceSignals.length || sourceSummary.sourceCount} source-informed signal${cohort.sourceSignals.length === 1 ? "" : "s"}.`,
      nextAction: cohort.recommendedAction,
      boundary: cohort.governanceBoundary
    })),
    records,
    limitations: [
      "Public analytics are synthetic fixtures and do not represent real customers, revenue, or clinical outcomes.",
      "Authenticated tenant analytics require tenant-admin AAL2 access and persisted no-PHI opportunities.",
      "Ad spend, CAC, signed contract value, and customer ROI are not imported until approved finance and CRM connectors exist.",
      "Small cohort counts are directional operating signals, not statistically valid market claims.",
      "No PHI, clinical records, diagnosis details, payer member identifiers, or sensitive ad-platform health inferences are allowed."
    ],
    nextBuildStep:
      "Add tenant-admin cohort visualization inside Sales Operations and export an audited attribution analytics packet for board, investor, and enterprise pipeline reviews."
  };
}

export function getAttributionAnalyticsSummary() {
  return buildAttributionAnalyticsReport(buildSyntheticRecords(), "synthetic-public-fixture", "2026-06-15T00:00:00.000Z");
}

export function buildAttributionAnalyticsFromOpportunities(opportunities: SalesOpportunity[]) {
  return buildAttributionAnalyticsReport(
    buildAttributionRecordsFromOpportunities(opportunities),
    "tenant-durable-opportunity"
  );
}

export function buildAttributionAnalyticsBrief(report = getAttributionAnalyticsSummary()) {
  return [
    "# SCRIMED Attribution Analytics Brief",
    "",
    `Status: ${report.status}`,
    `Mode: ${report.mode}`,
    `Boundary: ${report.boundary}`,
    "",
    "## Totals",
    `- Records: ${report.totals.recordCount}`,
    `- Source coverage: ${report.totals.sourceCoveragePercent}%`,
    `- Proof packet coverage: ${report.totals.proofPacketCoveragePercent}%`,
    `- Open pipeline: ${report.totals.openPipelineCount}`,
    `- Pilot planning: ${report.totals.pilotPlanningCount}`,
    "",
    "## Top Cohorts",
    ...report.cohorts.slice(0, 10).map(
      (cohort) => `- ${cohort.dimension}: ${cohort.label} (${cohort.recordCount}) -> ${cohort.recommendedAction}`
    ),
    "",
    "## Limitations",
    ...report.limitations.map((limitation) => `- ${limitation}`),
    "",
    "## Next Build Step",
    report.nextBuildStep
  ].join("\n");
}

export function buildAttributionAnalyticsPacket({
  report,
  generatedFor,
  generatedBy,
  auditMode
}: {
  report: AttributionAnalyticsReport;
  generatedFor: string;
  generatedBy: string;
  auditMode: "dedicated-event" | "existing-sales-artifact-event";
}) {
  const topCohorts = report.cohorts.slice(0, 12);

  return [
    "# SCRIMED Attribution Analytics Packet",
    "",
    `Generated for: ${generatedFor}`,
    `Generated by: ${generatedBy}`,
    `Generated at: ${report.generatedAt}`,
    `Mode: ${report.mode}`,
    `Status: ${report.status}`,
    `Audit mode: ${auditMode}`,
    "",
    "## Boundary",
    report.boundary,
    "",
    "This packet is for tenant-admin board, investor, sales, and enterprise pipeline review. It is not a clinical, reimbursement, compliance, financial, or guaranteed outcome report.",
    "",
    "## Totals",
    `- Records: ${report.totals.recordCount}`,
    `- Attributed records: ${report.totals.attributedRecordCount}`,
    `- Source coverage: ${report.totals.sourceCoveragePercent}%`,
    `- Proof packet coverage: ${report.totals.proofPacketCoveragePercent}%`,
    `- Open pipeline: ${report.totals.openPipelineCount}`,
    `- Proposal: ${report.totals.proposalCount}`,
    `- Pilot planning: ${report.totals.pilotPlanningCount}`,
    `- Won: ${report.totals.wonCount}`,
    `- Closed lost: ${report.totals.closedLostCount}`,
    "",
    "## Funnel",
    ...report.funnel.map((stage) => `- ${stage.stage}: ${stage.count} (${stage.shareOfRecords}%)`),
    "",
    "## Top Cohorts",
    ...topCohorts.map(
      (cohort) =>
        `- ${cohort.dimension}: ${cohort.label} | records ${cohort.recordCount} | open ${cohort.openCount} | proposal ${cohort.proposalCount} | pilot planning ${cohort.pilotPlanningCount} | action: ${cohort.recommendedAction}`
    ),
    "",
    "## Proof Recommendations",
    ...report.proofRecommendations.map(
      (recommendation) =>
        `- ${recommendation.cohort}: ${recommendation.route} | ${recommendation.nextAction}`
    ),
    "",
    "## Protection Controls",
    "- No PHI, patient identifiers, live clinical records, diagnosis details, payer member identifiers, sensitive ad-platform health inferences, or production healthcare data.",
    "- No customer-identifying outcomes, signed contract value, CAC, ROI, or ad-spend claims without written approval and finance/CRM connector review.",
    "- No autonomous diagnosis, clinical treatment, payer submission, reimbursement guarantee, or production execution claim.",
    "- Public claims must match the claims register and any quantified claim requires a dated evidence packet.",
    "- Copyright, trademark, customer logo, testimonial, screenshot, generated-content, and third-party-source use requires provenance and approval before publication.",
    "",
    "## Limitations",
    ...report.limitations.map((limitation) => `- ${limitation}`),
    "",
    "## Next Step",
    report.nextBuildStep
  ].join("\n");
}
