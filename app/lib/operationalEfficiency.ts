import { getBoundaryResolutionSummary } from "./boundaryResolution";
import { getContinuousReviewAuditSummary } from "./continuousReviewAudit";
import { getEnterpriseBusinessOpsSummary } from "./enterpriseBusinessOperations";
import { getEnterpriseScalabilityOperationsSummary } from "./enterpriseScalabilityOperations";
import { getGrowthEngineSummary } from "./growthEngine";
import { getHealthRecordsSafetyExchangeSummary } from "./healthRecordsSafetyExchange";
import { getLimitationsWorkaroundSummary } from "./limitationsWorkaroundOperations";
import { getNavigationAuditSummary } from "./navigationAudit";
import { getPlatformPowerSummary } from "./platformPowerOperations";
import { getProductServicePortfolioSummary } from "./productServicePortfolio";
import { getClientOnboardingCommunicationsSummary } from "./clientOnboardingCommunications";
import { getReleaseContinuitySummary } from "./releaseContinuity";
import { getServiceReliabilitySummary } from "./serviceReliability";

export type OperationalEfficiencyStatus =
  | "resolved"
  | "active-control"
  | "contained"
  | "operator-required"
  | "protected-gated"
  | "external-review-required"
  | "blocked-by-design";

export type OperationalEfficiencyDomain =
  | "release-quality"
  | "route-coverage"
  | "service-reliability"
  | "offering-packaging"
  | "client-onboarding"
  | "enterprise-scalability"
  | "platform-power"
  | "limitations-workarounds"
  | "commercial-throughput"
  | "enterprise-operations"
  | "continuous-review"
  | "health-records-safety"
  | "boundary-control";

export type OperationalEfficiencyRecord = {
  id: string;
  domain: OperationalEfficiencyDomain;
  name: string;
  status: OperationalEfficiencyStatus;
  sourceSurface: string;
  impact: string;
  inefficiency: string;
  currentControl: string;
  resolutionPath: string;
  owner: string;
  proofRoutes: string[];
  hardStops: string[];
  nextAction: string;
};

export type OperationalEfficiencySprint = {
  lane: string;
  owner: string;
  objective: string;
  sequence: string[];
  proofRoutes: string[];
  expectedGain: string;
  boundary: string;
};

export type OperationalEfficiencyMetric = {
  metric: string;
  currentSignal: string;
  targetSignal: string;
  evidenceRoute: string;
  boundary: string;
};

export type OperationalEfficiencyTriageItem = {
  id: string;
  severity: "critical" | "high" | "medium";
  signal: string;
  discrepancy: string;
  immediateContainment: string;
  rootCauseProbe: string;
  permanentControl: string;
  owner: string;
  proofRoutes: string[];
  promotionTrigger: string;
  retainedBoundary: string;
};

export const operationalEfficiencyRoute = "/operational-efficiency";
export const operationalEfficiencyApiRoute = "/api/operational-efficiency";
export const operationalEfficiencyBriefRoute = "/api/operational-efficiency/brief";
export const operationalEfficiencyStatus =
  "operational-efficiency-bottleneck-resolution-control-plane-active";
export const operationalEfficiencyBriefStatus =
  "operational-efficiency-brief-ready-no-autonomous-authority";
export const operationalEfficiencyUpdatedAt = "2026-06-25";
export const operationalEfficiencyClientOnboardingReleaseAt = "2026-06-26";
export const operationalEfficiencyTriageReleaseAt = "2026-06-27";

export const operationalEfficiencyBoundary =
  "SCRIMED Operational Efficiency organizes known gaps, inefficiencies, bottlenecks, fault classes, release gates, onboarding and communication handoffs, scalability constraints, API contract gaps, UI command friction, AI model-route limits, agent approval gates, evidence retrieval constraints, SLO/SLA and support boundaries, growth constraints, enterprise controls, and continuous-review hard stops into one operating resolution lane. It improves execution discipline only. It does not authorize autonomous production remediation, bypass AAL2, process PHI, approve live clinical care, certify security, certify accessibility, send email, create calendar invites, approve contracts, create public API SLAs, create contractual SLAs, guarantee uptime, approve live autonomous AI, approve production model routing, commit managed-service coverage, approve production hosting or residency, provide legal/accounting/tax advice, approve production connectors, guarantee revenue, guarantee profit margin, approve buyer release, claim trillion-dollar-scale equivalence, or replace qualified human review.";

const sharedNoAuthorityHardStops = [
  "PHI or patient identifier introduced",
  "live clinical care authority implied",
  "AAL2 bypass attempted",
  "certification or approval claimed without external evidence",
  "revenue, ROI, or profit guarantee represented",
  "live autonomous AI authority implied",
  "public API SLA implied"
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function mapReleaseStatus(status: string): OperationalEfficiencyStatus {
  if (status === "resolved") {
    return "resolved";
  }

  if (status === "blocked-by-design") {
    return "blocked-by-design";
  }

  if (status === "operator-required") {
    return "operator-required";
  }

  return "external-review-required";
}

function mapNavigationStatus(status: string): OperationalEfficiencyStatus {
  if (status === "resolved") {
    return "resolved";
  }

  if (status === "contained") {
    return "contained";
  }

  if (status === "operator-required") {
    return "operator-required";
  }

  return "external-review-required";
}

function mapReliabilityStatus(status: string): OperationalEfficiencyStatus {
  if (["active", "resolved"].includes(status)) {
    return status === "resolved" ? "resolved" : "active-control";
  }

  if (status === "contained") {
    return "contained";
  }

  if (status === "operator-required") {
    return "operator-required";
  }

  if (status === "protected-gated") {
    return "protected-gated";
  }

  return "external-review-required";
}

function mapGrowthStatus(status: string): OperationalEfficiencyStatus {
  if (status === "contained") {
    return "contained";
  }

  if (status === "operator-required") {
    return "operator-required";
  }

  if (status === "protected-gated") {
    return "protected-gated";
  }

  return "external-review-required";
}

function mapProductServiceStatus(status: string): OperationalEfficiencyStatus {
  if (status === "active-control") {
    return "active-control";
  }

  if (status === "human-review-required") {
    return "operator-required";
  }

  if (status === "blocked-before-approval") {
    return "blocked-by-design";
  }

  return "external-review-required";
}

function mapClientOnboardingStatus(status: string): OperationalEfficiencyStatus {
  if (status === "ready") {
    return "active-control";
  }

  if (status === "human-review-required" || status === "buyer-input-required") {
    return "operator-required";
  }

  if (status === "blocked-before-approval") {
    return "blocked-by-design";
  }

  return "external-review-required";
}

function mapEnterpriseStatus(status: string): OperationalEfficiencyStatus {
  if (status === "active-control-plane") {
    return "active-control";
  }

  if (status === "human-review-required") {
    return "operator-required";
  }

  return "external-review-required";
}

function mapContinuousStatus(status: string): OperationalEfficiencyStatus {
  if (status === "active-control-plane") {
    return "active-control";
  }

  if (status === "human-review-required") {
    return "operator-required";
  }

  if (status === "internal-research-only") {
    return "blocked-by-design";
  }

  return "external-review-required";
}

function countByStatus(records: OperationalEfficiencyRecord[]) {
  return records.reduce(
    (counts, record) => ({
      ...counts,
      [record.status]: counts[record.status] + 1
    }),
    {
      resolved: 0,
      "active-control": 0,
      contained: 0,
      "operator-required": 0,
      "protected-gated": 0,
      "external-review-required": 0,
      "blocked-by-design": 0
    } satisfies Record<OperationalEfficiencyStatus, number>
  );
}

function countByDomain(records: OperationalEfficiencyRecord[]) {
  return records.reduce(
    (counts, record) => ({
      ...counts,
      [record.domain]: counts[record.domain] + 1
    }),
    {
      "release-quality": 0,
      "route-coverage": 0,
      "service-reliability": 0,
      "offering-packaging": 0,
      "client-onboarding": 0,
      "enterprise-scalability": 0,
      "platform-power": 0,
      "limitations-workarounds": 0,
      "commercial-throughput": 0,
      "enterprise-operations": 0,
      "continuous-review": 0,
      "health-records-safety": 0,
      "boundary-control": 0
    } satisfies Record<OperationalEfficiencyDomain, number>
  );
}

function markdownItems(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function recordLines(records: OperationalEfficiencyRecord[]) {
  return records
    .map(
      (record) =>
        `- ${record.name} (${record.domain}, ${record.status}): ${record.inefficiency} Control: ${record.currentControl} Resolution: ${record.resolutionPath} Owner: ${record.owner}`
    )
    .join("\n");
}

export function getOperationalEfficiencySummary() {
  const navigationAudit = getNavigationAuditSummary();
  const serviceReliability = getServiceReliabilitySummary();
  const releaseContinuity = getReleaseContinuitySummary();
  const productServicePortfolio = getProductServicePortfolioSummary();
  const clientOnboarding = getClientOnboardingCommunicationsSummary();
  const enterpriseScalability = getEnterpriseScalabilityOperationsSummary();
  const platformPower = getPlatformPowerSummary();
  const limitationsWorkarounds = getLimitationsWorkaroundSummary();
  const growthEngine = getGrowthEngineSummary();
  const enterpriseBusinessOps = getEnterpriseBusinessOpsSummary();
  const continuousReview = getContinuousReviewAuditSummary();
  const healthRecords = getHealthRecordsSafetyExchangeSummary();
  const boundaryResolution = getBoundaryResolutionSummary();

  const releaseRecords: OperationalEfficiencyRecord[] = releaseContinuity.gates.map((gate) => ({
    id: `release-${gate.key}`,
    domain: "release-quality",
    name: gate.name,
    status: mapReleaseStatus(gate.status),
    sourceSurface: "Release Continuity",
    impact: gate.proof,
    inefficiency: gate.bottleneck,
    currentControl: gate.workaround,
    resolutionPath: gate.workaround,
    owner: gate.owner,
    proofRoutes: gate.proofRoutes,
    hardStops: sharedNoAuthorityHardStops,
    nextAction: gate.workaround
  }));

  const navigationRecords: OperationalEfficiencyRecord[] = navigationAudit.bottlenecks.map((bottleneck) => ({
    id: `navigation-${slugify(bottleneck.name)}`,
    domain: "route-coverage",
    name: bottleneck.name,
    status: mapNavigationStatus(bottleneck.status),
    sourceSurface: "Navigation Audit",
    impact: bottleneck.impact,
    inefficiency: bottleneck.impact,
    currentControl: bottleneck.workaround,
    resolutionPath: bottleneck.workaround,
    owner: bottleneck.owner,
    proofRoutes: [navigationAudit.route, navigationAudit.apiRoute, navigationAudit.briefRoute],
    hardStops: ["route missing from inventory", "buyer-critical route absent from smoke", ...sharedNoAuthorityHardStops],
    nextAction: bottleneck.workaround
  }));

  const serviceControlRecords: OperationalEfficiencyRecord[] =
    serviceReliability.productServiceControls.map((control) => ({
      id: `service-control-${slugify(control.name)}`,
      domain: "service-reliability",
      name: control.name,
      status: mapReliabilityStatus(control.status),
      sourceSurface: control.productSurface,
      impact: control.barrier,
      inefficiency: control.barrier,
      currentControl: control.mitigation,
      resolutionPath: control.nextAction,
      owner: control.owner,
      proofRoutes: control.proofRoutes,
      hardStops: ["missing owner", "missing proof route", "claim expanded before retained boundary", ...sharedNoAuthorityHardStops],
      nextAction: control.nextAction
    }));

  const faultRecords: OperationalEfficiencyRecord[] = serviceReliability.faultClasses.map((faultClass) => ({
    id: `fault-${slugify(faultClass.name)}`,
    domain: "service-reliability",
    name: faultClass.name,
    status: faultClass.severity === "high" ? "operator-required" : "contained",
    sourceSurface: "Service Reliability",
    impact: faultClass.likelySource,
    inefficiency: faultClass.likelySource,
    currentControl: faultClass.control,
    resolutionPath: faultClass.failClosedBehavior,
    owner: "Release Steward + domain owner",
    proofRoutes: faultClass.detectionRoutes,
    hardStops: ["fault repeated without control", "fail-closed behavior missing", ...sharedNoAuthorityHardStops],
    nextAction: faultClass.failClosedBehavior
  }));

  const offeringPackagingRecords: OperationalEfficiencyRecord[] =
    productServicePortfolio.productServiceMarginControls.map((control) => ({
      id: `offering-${control.slug}`,
      domain: "offering-packaging",
      name: control.control,
      status: mapProductServiceStatus(control.status),
      sourceSurface: "Product and Services Portfolio",
      impact: control.marginRisk,
      inefficiency: control.marginRisk,
      currentControl: control.operatingPolicy,
      resolutionPath: control.hardStops.join(", "),
      owner: control.owner,
      proofRoutes: control.evidenceRoutes,
      hardStops: control.hardStops,
      nextAction: control.operatingPolicy
    }));

  const clientOnboardingControlRecords: OperationalEfficiencyRecord[] =
    clientOnboarding.clientOnboardingControls.map((control) => ({
      id: `client-onboarding-control-${slugify(control.control)}`,
      domain: "client-onboarding",
      name: control.control,
      status: mapClientOnboardingStatus(control.status),
      sourceSurface: "Client Onboarding and Communications",
      impact: control.purpose,
      inefficiency: control.hardStops.join(", "),
      currentControl: control.requiredEvidence.join(", "),
      resolutionPath: control.hardStops.join(", "),
      owner: control.owner,
      proofRoutes: [clientOnboarding.route, clientOnboarding.apiRoute, clientOnboarding.briefRoute],
      hardStops: [...control.hardStops, ...sharedNoAuthorityHardStops],
      nextAction: control.requiredEvidence[0] ?? control.purpose
    }));

  const clientOnboardingHandoffRecords: OperationalEfficiencyRecord[] =
    clientOnboarding.clientOnboardingHandoffs.map((handoff) => ({
      id: `client-onboarding-handoff-${slugify(handoff.slug)}`,
      domain: "client-onboarding",
      name: `${handoff.from} to ${handoff.to}`,
      status: handoff.hardStops.length > 2 ? "operator-required" : "active-control",
      sourceSurface: "Client Onboarding and Communications",
      impact: handoff.trigger,
      inefficiency: handoff.hardStops.join(", "),
      currentControl: handoff.requiredArtifacts.join(", "),
      resolutionPath: handoff.nextAction,
      owner: handoff.to,
      proofRoutes: handoff.proofRoutes,
      hardStops: [...handoff.hardStops, ...sharedNoAuthorityHardStops],
      nextAction: handoff.nextAction
    }));

  const enterpriseScalabilityControlRecords: OperationalEfficiencyRecord[] =
    enterpriseScalability.controls.map((control) => ({
      id: `enterprise-scale-control-${slugify(control.control)}`,
      domain: "enterprise-scalability",
      name: control.control,
      status: mapEnterpriseStatus(control.status),
      sourceSurface: "Enterprise Scalability Operations",
      impact: control.purpose,
      inefficiency: control.hardStops.join(", "),
      currentControl: control.requiredEvidence.join(", "),
      resolutionPath: control.hardStops.join(", "),
      owner: control.owner,
      proofRoutes: [enterpriseScalability.route, enterpriseScalability.apiRoute, enterpriseScalability.briefRoute],
      hardStops: [...control.hardStops, ...sharedNoAuthorityHardStops],
      nextAction: control.requiredEvidence[0] ?? control.purpose
    }));

  const enterpriseScalabilityBottleneckRecords: OperationalEfficiencyRecord[] =
    enterpriseScalability.bottlenecks.map((bottleneck) => ({
      id: `enterprise-scale-bottleneck-${bottleneck.slug}`,
      domain: "enterprise-scalability",
      name: bottleneck.name,
      status: mapEnterpriseStatus(bottleneck.status),
      sourceSurface: "Enterprise Scalability Operations",
      impact: bottleneck.impact,
      inefficiency: bottleneck.impact,
      currentControl: bottleneck.workaround,
      resolutionPath: bottleneck.graduationGate,
      owner: bottleneck.owner,
      proofRoutes: bottleneck.proofRoutes,
      hardStops: ["contractual SLA implied", "managed service implied", "production support guaranteed", ...sharedNoAuthorityHardStops],
      nextAction: bottleneck.graduationGate
    }));

  const platformPowerControlRecords: OperationalEfficiencyRecord[] =
    platformPower.controls.map((control) => ({
      id: `platform-power-control-${slugify(control.control)}`,
      domain: "platform-power",
      name: control.control,
      status: mapEnterpriseStatus(control.status),
      sourceSurface: "Platform Power Operations",
      impact: control.purpose,
      inefficiency: control.hardStops.join(", "),
      currentControl: control.requiredEvidence.join(", "),
      resolutionPath: control.hardStops.join(", "),
      owner: control.owner,
      proofRoutes: [platformPower.route, platformPower.apiRoute, platformPower.briefRoute],
      hardStops: [...control.hardStops, ...sharedNoAuthorityHardStops],
      nextAction: control.requiredEvidence[0] ?? control.purpose
    }));

  const platformPowerBottleneckRecords: OperationalEfficiencyRecord[] =
    platformPower.bottlenecks.map((bottleneck) => ({
      id: `platform-power-bottleneck-${bottleneck.slug}`,
      domain: "platform-power",
      name: bottleneck.name,
      status: mapEnterpriseStatus(bottleneck.status),
      sourceSurface: "Platform Power Operations",
      impact: bottleneck.impact,
      inefficiency: bottleneck.impact,
      currentControl: bottleneck.workaround,
      resolutionPath: bottleneck.graduationGate,
      owner: bottleneck.owner,
      proofRoutes: bottleneck.proofRoutes,
      hardStops: [
        "public API SLA implied",
        "live autonomous AI implied",
        "production model routing implied",
        "accessibility certification implied",
        "trillion-dollar-scale equivalence claimed",
        ...sharedNoAuthorityHardStops
      ],
      nextAction: bottleneck.graduationGate
    }));

  const limitationsWorkaroundTrackRecords: OperationalEfficiencyRecord[] =
    limitationsWorkarounds.tracks.map((track) => ({
      id: `limitations-workaround-track-${track.slug}`,
      domain: "limitations-workarounds",
      name: track.title,
      status: track.state === "workaround-active" || track.state === "resolved-with-control"
        ? "contained"
        : track.state === "human-review-required"
          ? "operator-required"
          : track.state === "blocked-until-approved"
            ? "blocked-by-design"
            : "external-review-required",
      sourceSurface: "Limitations and Workaround Operations",
      impact: track.riskIfIgnored,
      inefficiency: track.limitation,
      currentControl: track.operatingControl,
      resolutionPath: track.safeWorkaround,
      owner: track.owner,
      proofRoutes: [limitationsWorkarounds.route, limitationsWorkarounds.apiRoute, limitationsWorkarounds.briefRoute, ...track.proofRoutes],
      hardStops: [...track.blockedClaims, ...sharedNoAuthorityHardStops],
      nextAction: track.escalationTrigger
    }));

  const limitationsWorkaroundPacketRecords: OperationalEfficiencyRecord[] =
    limitationsWorkarounds.packets.map((packet) => ({
      id: `limitations-workaround-packet-${packet.slug}`,
      domain: "limitations-workarounds",
      name: packet.name,
      status: packet.hardStops.length > 3 ? "operator-required" : "active-control",
      sourceSurface: "Limitations and Workaround Operations",
      impact: packet.usedWhen,
      inefficiency: packet.hardStops.join(", "),
      currentControl: packet.safeInputs.join(", "),
      resolutionPath: packet.output,
      owner: packet.owner,
      proofRoutes: packet.proofRoutes,
      hardStops: [...packet.hardStops, ...sharedNoAuthorityHardStops],
      nextAction: packet.expiryRule
    }));

  const growthRecords: OperationalEfficiencyRecord[] = growthEngine.growthBottlenecks.map((bottleneck) => ({
    id: `growth-${slugify(bottleneck.name)}`,
    domain: "commercial-throughput",
    name: bottleneck.name,
    status: mapGrowthStatus(bottleneck.status),
    sourceSurface: "Growth Engine",
    impact: bottleneck.impact,
    inefficiency: bottleneck.impact,
    currentControl: bottleneck.workaround,
    resolutionPath: bottleneck.graduationGate,
    owner: bottleneck.owner,
    proofRoutes: [growthEngine.route, growthEngine.apiRoute, growthEngine.briefRoute],
    hardStops: ["unsupported revenue claim", "buyer proof without protected release", ...sharedNoAuthorityHardStops],
    nextAction: bottleneck.graduationGate
  }));

  const enterpriseRecords: OperationalEfficiencyRecord[] =
    enterpriseBusinessOps.marginControls.map((control) => ({
      id: `enterprise-margin-${slugify(control.control)}`,
      domain: "enterprise-operations",
      name: control.control,
      status: mapEnterpriseStatus(control.status),
      sourceSurface: "Enterprise Business Operations",
      impact: control.marginRisk,
      inefficiency: control.marginRisk,
      currentControl: control.operatingPolicy,
      resolutionPath: control.blockedUntilReviewed.join(", "),
      owner: control.owner,
      proofRoutes: control.evidenceRoutes,
      hardStops: control.blockedUntilReviewed,
      nextAction: control.operatingPolicy
    }));

  const enterpriseControlRecords: OperationalEfficiencyRecord[] =
    enterpriseBusinessOps.enterpriseControls.map((control) => ({
      id: `enterprise-control-${slugify(control.control)}`,
      domain: "enterprise-operations",
      name: control.control,
      status: control.hardStops.length > 2 ? "operator-required" : "active-control",
      sourceSurface: "Enterprise Business Operations",
      impact: control.purpose,
      inefficiency: control.purpose,
      currentControl: control.evidence.join(", "),
      resolutionPath: control.hardStops.join(", "),
      owner: control.owner,
      proofRoutes: [enterpriseBusinessOps.route, enterpriseBusinessOps.apiRoute, enterpriseBusinessOps.briefRoute],
      hardStops: control.hardStops,
      nextAction: control.evidence[0] ?? control.purpose
    }));

  const continuousRecords: OperationalEfficiencyRecord[] = continuousReview.controls.map((control) => ({
    id: `continuous-control-${slugify(control.control)}`,
    domain: "continuous-review",
    name: control.control,
    status: mapContinuousStatus(control.status),
    sourceSurface: "Continuous Review and Audit",
    impact: control.purpose,
    inefficiency: control.hardStops.join(", "),
    currentControl: control.requiredEvidence.join(", "),
    resolutionPath: control.hardStops.join(", "),
    owner: control.owner,
    proofRoutes: [continuousReview.route, continuousReview.apiRoute, continuousReview.briefRoute],
    hardStops: control.hardStops,
    nextAction: control.requiredEvidence[0] ?? control.purpose
  }));

  const healthRecordsRecords: OperationalEfficiencyRecord[] =
    healthRecords.boundaryResolutions.map((resolution) => ({
      id: `health-records-${slugify(resolution.boundary)}`,
      domain: "health-records-safety",
      name: resolution.boundary,
      status: "external-review-required",
      sourceSurface: "Health Records Safety Exchange",
      impact: resolution.riskIfIgnored,
      inefficiency: resolution.riskIfIgnored,
      currentControl: resolution.currentControl,
      resolutionPath: resolution.safeWorkaround,
      owner: resolution.owner,
      proofRoutes: resolution.proofRoutes,
      hardStops: [
        resolution.remainingGate,
        "live PHI ingestion requested",
        "production connector requested",
        "patient matching requested",
        "EHR writeback or payer submission requested",
        ...sharedNoAuthorityHardStops
      ],
      nextAction: resolution.safeWorkaround
    }));

  const boundaryRecords: OperationalEfficiencyRecord[] = [
    {
      id: "boundary-central-register",
      domain: "boundary-control",
      name: "Central limitation register coverage",
      status: "active-control",
      sourceSurface: "Boundary Resolution Register",
      impact:
        "Known limitations stay visible across clinical, certification, continuous review, enterprise, commercial, and release systems.",
      inefficiency:
        "High-value limits become slower to manage when they are scattered across docs, APIs, and route copy.",
      currentControl:
        `${boundaryResolution.recordCount} boundary records across ${Object.keys(boundaryResolution.countsByCategory).length} categories.`,
      resolutionPath:
        "Require every new buyer, investor, operational, approval, certification, or clinical claim to land in a boundary record before external use.",
      owner: "Claims governance + domain owner",
      proofRoutes: [boundaryResolution.route, boundaryResolution.apiRoute, boundaryResolution.briefRoute],
      hardStops: boundaryResolution.operatingRules,
      nextAction: boundaryResolution.nextRecommendedBuildStep
    }
  ];

  const records = [
    ...releaseRecords,
    ...navigationRecords,
    ...serviceControlRecords,
    ...faultRecords,
    ...offeringPackagingRecords,
    ...clientOnboardingControlRecords,
    ...clientOnboardingHandoffRecords,
    ...enterpriseScalabilityControlRecords,
    ...enterpriseScalabilityBottleneckRecords,
    ...platformPowerControlRecords,
    ...platformPowerBottleneckRecords,
    ...limitationsWorkaroundTrackRecords,
    ...limitationsWorkaroundPacketRecords,
    ...growthRecords,
    ...enterpriseRecords,
    ...enterpriseControlRecords,
    ...continuousRecords,
    ...healthRecordsRecords,
    ...boundaryRecords
  ];
  const countsByStatus = countByStatus(records);
  const countsByDomain = countByDomain(records);
  const proofRoutes = unique(records.flatMap((record) => record.proofRoutes));
  const hardStops = unique(records.flatMap((record) => record.hardStops));
  const owners = unique(records.map((record) => record.owner));
  const openBottleneckCount =
    countsByStatus["operator-required"] +
    countsByStatus["protected-gated"] +
    countsByStatus["external-review-required"] +
    countsByStatus["blocked-by-design"];

  const discrepancyFaultTriageQueue: OperationalEfficiencyTriageItem[] = [
    {
      id: "route-api-smoke-drift",
      severity: "critical",
      signal: "A public page, API route, Product Console count, docs entry, or smoke assertion no longer agrees with the source route inventory.",
      discrepancy:
        "Navigation, Product Console, API response, README, docs, and smoke can drift when a new route or control is added in only one surface.",
      immediateContainment:
        "Freeze external release language for the affected surface and run route inventory, typecheck, build, and public smoke before promotion.",
      rootCauseProbe:
        "Compare Navigation Audit page/API counts, Product Console proof stack, route handlers, docs, and smoke expectations for the missing route or count.",
      permanentControl:
        "Every buyer-critical route must update navigation, Product Console, route/API brief, docs, and smoke in the same release.",
      owner: "Release Steward + Product Console + Navigation Audit",
      proofRoutes: ["/navigation", "/product", "/release-continuity", operationalEfficiencyRoute],
      promotionTrigger: "Any page/API count mismatch, missing smoke coverage, or Product Console count regression.",
      retainedBoundary: "Route alignment is release evidence only; it does not approve protected execution, PHI, connectors, or clinical use."
    },
    {
      id: "protected-auth-status-mismatch",
      severity: "critical",
      signal: "Protected API returns an unexpected status, exposes data without AAL2, or fails differently between local and branded production.",
      discrepancy:
        "Local sandbox, production auth, and protected workspace behavior can differ, especially around 401 versus 503 fail-closed responses.",
      immediateContainment:
        "Treat the protected path as unavailable for external proof until fail-closed behavior, AAL2 requirement, and no-secret boundaries are verified.",
      rootCauseProbe:
        "Check auth guard, workspace slug, token path, environment variables, protected route handler, and smoke fail-closed expectation.",
      permanentControl:
        "Keep protected route smoke tolerant only of approved fail-closed statuses while requiring authenticated happy-path evidence from a human AAL2 session.",
      owner: "TrustOS + Security + Release Steward",
      proofRoutes: ["/pilot-workspace/access", "/qa-buyer-proof-release", "/release-continuity", "/service-reliability"],
      promotionTrigger: "Any protected route returns 200 without approved auth or changes fail-closed status without documented reason.",
      retainedBoundary: "Fail-closed verification does not bypass AAL2, create customer permission, or authorize buyer proof release."
    },
    {
      id: "claims-boundary-drift",
      severity: "critical",
      signal: "Public, buyer, investor, demo, or API copy implies certification, PHI authority, ROI, live clinical use, uptime, or autonomous remediation.",
      discrepancy:
        "Growth copy can outpace retained evidence when marketing, sales, investor, and product surfaces are edited independently.",
      immediateContainment:
        "Route the claim through Claim Guard and Boundary Resolution, replace the language with current-state proof, and block release until reviewed.",
      rootCauseProbe:
        "Search changed copy for prohibited claims and compare against hard stops in Company Assessment, Clinical Production Readiness, and Boundary Resolution.",
      permanentControl:
        "Every strategic copy change must include approved no-authority language and a proof route before it is exposed to buyers or investors.",
      owner: "Claim Guard + Legal Ops + Product Marketing",
      proofRoutes: ["/qa-claim-guard", "/boundary-resolution", "/company-assessment", "/clinical-production-readiness"],
      promotionTrigger: "Any unsupported legal, financial, clinical, security, PHI, connector, SLA, revenue, or certification claim.",
      retainedBoundary: "Claim triage is not legal advice, certification, security assurance, audited financial reporting, or clinical validation."
    },
    {
      id: "buyer-handoff-stall",
      severity: "high",
      signal: "A demo, pilot, assessment, diligence request, meeting follow-up, or proposal lacks owner, next action, package, or response SLA.",
      discrepancy:
        "Client onboarding, service delivery, pricing, sales operations, and enterprise deal desk can diverge if buyer motion is not forced into one package path.",
      immediateContainment:
        "Assign the buyer stage, package, owner, follow-up SLA, no-PHI intake route, and deal-desk review before any new commitment is made.",
      rootCauseProbe:
        "Check Client Onboarding stage, Service Delivery work order, Offering package, Pricing path, and Enterprise Business Ops review status.",
      permanentControl:
        "Every buyer handoff must resolve to one of: no-PHI assessment, synthetic pilot, protected enterprise pilot, diligence package, license, or retainer.",
      owner: "Revenue Operations + Customer Operations + Deal Desk",
      proofRoutes: ["/client-onboarding", "/service-delivery", "/offerings", "/enterprise-business-ops"],
      promotionTrigger: "Any buyer record stays ownerless, unpriced, unscoped, or without next action after the review window.",
      retainedBoundary: "Buyer handoff control does not send email, create invites, approve contracts, or guarantee revenue."
    },
    {
      id: "scale-support-overcommit",
      severity: "high",
      signal: "Buyer or investor language implies production SLA, managed service, uptime, global region support, tenant capacity, or incident response readiness.",
      discrepancy:
        "Enterprise scalability, service reliability, platform power, finance, and legal review can move at different speeds during expansion conversations.",
      immediateContainment:
        "Replace commitment language with readiness language and route the request through scale, support, cost, legal, and deal-desk owners.",
      rootCauseProbe:
        "Review capacity assumption, support tier, SLO/SLA boundary, incident/change path, regional gate, cost guardrail, and contract authority.",
      permanentControl:
        "No scale or support promise leaves SCRIMED without tenant owner, queue/backpressure model, incident path, support tier, cost guardrail, and no-SLA boundary.",
      owner: "Enterprise Scalability + Service Reliability + Finance + Legal Ops",
      proofRoutes: ["/enterprise-scalability", "/service-reliability", "/platform-power", "/enterprise-business-ops"],
      promotionTrigger: "Any unsupported SLA, uptime, managed service, region, production support, or capacity claim appears in external language.",
      retainedBoundary: "Scale triage is not contractual SLA approval, uptime guarantee, managed-service commitment, hosting approval, or profit assurance."
    },
    {
      id: "interoperability-live-data-slip",
      severity: "critical",
      signal: "Health-record, EHR, HIE, payer, imaging, device, patient matching, or writeback requests move beyond no-PHI sandbox planning.",
      discrepancy:
        "Interoperability readiness can be mistaken for production connector authority if live data, credentials, or patient-impacting steps are requested.",
      immediateContainment:
        "Reject live PHI, credentials, endpoints, patient matching, payer submission, and writeback until customer authority and qualified review exist.",
      rootCauseProbe:
        "Classify the data type, standard, source system, patient-safety impact, connector authority, PHI scope, and customer approval evidence.",
      permanentControl:
        "Every integration conversation must start with no-PHI fixtures, standards map, source attribution, patient-safety lint, and live-data gate list.",
      owner: "Interoperability + Health Records Safety + Privacy + Clinical Governance",
      proofRoutes: ["/health-records", "/interoperability", "/clinical-authority-readiness", "/clinical-production-readiness"],
      promotionTrigger: "Any live data, credential, writeback, payer submission, patient matching, or production connector request.",
      retainedBoundary: "Interoperability triage is not PHI authority, connector approval, payer submission approval, EHR mutation approval, or live care."
    },
    {
      id: "agent-autonomy-overreach",
      severity: "high",
      signal: "Agent, model-route, review-loop, or innovation language implies autonomous production action, live clinical judgment, public quantum capability, or unmanaged remediation.",
      discrepancy:
        "Internal innovation and continuous review can be misread as public autonomous capability when controls are not explicit.",
      immediateContainment:
        "Keep the pathway internal or human-gated, block public quantum/autonomous claims, and require evaluation plus owner approval before promotion.",
      rootCauseProbe:
        "Inspect model route, tool access, allowed data, blocked data, eval pack, human approval trigger, cost owner, and public language.",
      permanentControl:
        "Every agent or model path must carry allowed data, blocked data, evaluation evidence, human approval trigger, and no-autonomous-authority boundary.",
      owner: "AI Platform + TrustOS + Internal Research Team",
      proofRoutes: ["/platform-power", "/continuous-review-audit", "/agents", "/evaluation"],
      promotionTrigger: "Any agent or model path requests protected action, production remediation, live clinical judgment, or public quantum claim.",
      retainedBoundary: "Agent triage is not live autonomous AI approval, production model routing, clinical authorization, or public quantum capability."
    },
    {
      id: "finance-margin-leak",
      severity: "high",
      signal: "Custom scope, free diligence labor, discounting, payment terms, investor language, tax language, or revenue-recognition questions bypass deal desk.",
      discrepancy:
        "Sales urgency can create margin leakage when finance, legal, accounting, tax, and delivery controls are not pulled into the same decision.",
      immediateContainment:
        "Pause proposal release, assign package and scope, run price-floor and margin review, and route finance/legal/tax/accounting exceptions.",
      rootCauseProbe:
        "Review package, price floor, discount, work order, acceptance criteria, billing trigger, payment terms, tax implications, and blocked claims.",
      permanentControl:
        "Every enterprise proposal must include margin model, billing readiness, contract authority, tax/accounting triage, and blocked-claim review.",
      owner: "Finance + Deal Desk + Legal Ops + Revenue Operations",
      proofRoutes: ["/enterprise-business-ops", "/capital-vitality", "/service-delivery", "/growth-engine"],
      promotionTrigger: "Any unpriced custom work, margin exception, financial claim, investor claim, or unreviewed payment term.",
      retainedBoundary: "Finance triage is not accounting advice, tax advice, audited financial reporting, securities material, valuation assurance, or revenue guarantee."
    }
  ];

  const sprints: OperationalEfficiencySprint[] = [
    {
      lane: "Release and route preflight",
      owner: "Release Steward + Product Console",
      objective:
        "Prevent route drift, missing smoke coverage, stale boundary headers, and untracked protected gates before deployment.",
      sequence: [
        "Update route inventory and smoke-covered HTML routes",
        "Run typecheck, lint, build, and public smoke",
        "Verify boundary headers on buyer-critical APIs",
        "Retain Vercel deploy and custom-domain smoke evidence"
      ],
      proofRoutes: ["/navigation", "/release-continuity", "/service-reliability", operationalEfficiencyRoute],
      expectedGain: "Fewer release regressions and faster go/no-go decisions.",
      boundary: "Preflight evidence does not approve protected happy-path execution or bypass AAL2."
    },
    {
      lane: "Commercial throughput",
      owner: "Founder + Revenue Operations",
      objective:
        "Shorten the path from qualified buyer interest to scoped, priced, and governed next action.",
      sequence: [
        "Attach each buyer to one package, one offer, one proof route, one margin control, and one disqualifier check",
        "Route non-standard terms through deal desk",
        "Price diligence and implementation work explicitly",
        "Keep ROI, reimbursement, and revenue claims behind reviewed evidence"
      ],
      proofRoutes: ["/offerings", "/growth-engine", "/enterprise-business-ops", "/pilot-deal-room", operationalEfficiencyRoute],
      expectedGain: "Less custom-sales drag, clearer price floors, and fewer margin leaks.",
      boundary: "Commercial acceleration is not a revenue guarantee, ROI guarantee, or customer permission."
    },
    {
      lane: "Client onboarding and communication cadence",
      owner: "Revenue Operations + Sales Engineering + Customer Operations",
      objective:
        "Turn buyer interest into governed discovery, demo, pilot, diligence, kickoff, and renewal communication without losing owners or crossing authority boundaries.",
      sequence: [
        "Classify the buyer stage and selected package",
        "Use a human-reviewed email or calendar-ready packet",
        "Assign meeting owner, follow-up SLA, and handoff owner",
        "Route PHI, security, contract, procurement, legal, finance, or clinical requests to the proper boundary owner"
      ],
      proofRoutes: ["/client-onboarding", "/offerings", "/sales-operations", operationalEfficiencyRoute],
      expectedGain: "Faster first response, tighter demo follow-up, cleaner pilot scoping, and fewer informal commitments.",
      boundary: "Onboarding acceleration does not send messages, create invites, approve contracts, process PHI, or authorize clinical use."
    },
    {
      lane: "Enterprise scalability and support readiness",
      owner: "Platform + service reliability + customer operations",
      objective:
        "Prevent enterprise traffic, tenant growth, support expectations, SLO/SLA language, regional hosting, incident response, and usage costs from outpacing evidence.",
      sequence: [
        "Attach capacity forecast, route class, queue/backpressure controls, and rollback path",
        "Review tenant owner, access cadence, AAL2 path, support tier, and escalation matrix",
        "Keep SLO language internal until contract and staffing review approve exact commitments",
        "Route regional hosting, residency, DR, and cost thresholds to qualified owners"
      ],
      proofRoutes: ["/enterprise-scalability", "/service-reliability", "/client-onboarding", "/enterprise-business-ops", operationalEfficiencyRoute],
      expectedGain: "Fewer unsupported scale promises, cleaner support economics, and faster enterprise readiness review.",
      boundary: "Scale readiness is not a contractual SLA, managed service commitment, production hosting approval, PHI authority, or profit guarantee."
    },
    {
      lane: "API, UI, and AI platform power",
      owner: "Platform engineering + Product Console + AI platform + TrustOS",
      objective:
        "Raise SCRIMED's platform power through contract-backed APIs, operator-grade UI, model-route readiness, agent approval workflows, eval loops, evidence retrieval, and cost telemetry.",
      sequence: [
        "Promote buyer-critical APIs into an owner, schema, version, auth, boundary, and smoke contract register",
        "Make platform-power routes visible in primary nav, hub, product console, role journeys, and limitation controls",
        "Attach every model or agent path to allowed data, blocked data, eval pack, human approval trigger, and cost owner",
        "Route public API SLA, live AI, PHI, accessibility, security, and trillion-scale claims through Boundary Resolution"
      ],
      proofRoutes: ["/platform-power", "/navigation", "/product", "/agents", "/trust-os", operationalEfficiencyRoute],
      expectedGain: "Sharper enterprise technical diligence, less UI friction, clearer AI authority, and stronger cost discipline.",
      boundary:
        "Platform power is not public API SLA approval, live autonomous AI authority, production model routing, PHI processing, accessibility certification, security certification, or trillion-scale equivalence."
    },
    {
      lane: "Limitations workaround containment",
      owner: "Boundary owner + Operational Efficiency + Product Console",
      objective:
        "Turn blocked requests, boundaries, issues, and repeated bottlenecks into safe packets, escalation owners, proof routes, expiration rules, and graduation gates.",
      sequence: [
        "Classify issue by category, severity, state, owner, and proof route",
        "Select the reusable workaround packet or create a new one with hard stops",
        "Attach escalation trigger, expiry rule, and graduation gate",
        "Promote repeated workarounds into smoke, navigation, boundary, platform, reliability, or service controls"
      ],
      proofRoutes: ["/limitations-workarounds", "/boundary-resolution", operationalEfficiencyRoute, "/platform-power"],
      expectedGain: "Less stalled work, fewer informal exceptions, and clearer safe paths when authority is missing.",
      boundary:
        "Workaround containment does not authorize PHI, live care, legal/finance advice, certification, public SLA, autonomous remediation, live AI, or buyer release."
    },
    {
      lane: "Continuous defect-to-control loop",
      owner: "QA Regression Agent + TrustOps",
      objective:
        "Turn repeated mistakes, buyer questions, incidents, and source drift into deterministic controls.",
      sequence: [
        "Classify the defect or near miss",
        "Attach owner, route, and hard stop",
        "Add or update smoke coverage where deterministic",
        "Promote recurring patterns into the boundary or reliability register"
      ],
      proofRoutes: ["/continuous-review-audit", "/qa-evidence", "/trust-safety-operations", operationalEfficiencyRoute],
      expectedGain: "Fewer repeated defects and clearer accountability for each new risk.",
      boundary: "Agent-assisted review may route and recommend; humans retain remediation and approval authority."
    },
    {
      lane: "Health-record extraction and safety",
      owner: "Interoperability + TrustOS + clinical governance",
      objective:
        "Turn buyer health-record, EHR, HIE, payer, imaging, and document requests into no-PHI extraction plans with safety checks and retained live-data gates.",
      sequence: [
        "Classify source format and standard bindings",
        "Reject PHI, identifiers, production credentials, live endpoints, and record mutation requests",
        "Run synthetic extraction planning and patient-safety lint",
        "Route sandbox, PHI, connector, clinical, payer, and writeback gates to named owners"
      ],
      proofRoutes: ["/health-records", "/interoperability", "/clinical-care-activation", operationalEfficiencyRoute],
      expectedGain: "Faster integration scoping with fewer unsafe data asks and clearer customer sandbox workarounds.",
      boundary: "Health-record extraction planning does not authorize PHI, live connectors, patient matching, payer submission, EHR writeback, or clinical action."
    },
    {
      lane: "Enterprise margin and control discipline",
      owner: "Finance + Legal Ops + Deal Desk",
      objective:
        "Stop margin leakage, unfunded diligence labor, weak payment terms, and unsupported business claims before proposals leave SCRIMED.",
      sequence: [
        "Run price-floor and margin review",
        "Confirm scope, SOW, billing trigger, and payment terms",
        "Route accounting, tax, securities, and counsel exceptions",
        "Retain approval evidence and blocked-claim language"
      ],
      proofRoutes: ["/enterprise-business-ops", "/capital-vitality", "/public-market-readiness", operationalEfficiencyRoute],
      expectedGain: "Better cash discipline and fewer unpriced enterprise commitments.",
      boundary: "Business controls are not legal, accounting, tax, audit, or securities advice."
    }
  ];

  const metrics: OperationalEfficiencyMetric[] = [
    {
      metric: "Open bottleneck pressure",
      currentSignal: `${openBottleneckCount} open or retained-gate records in the efficiency register.`,
      targetSignal: "Open records have owner, proof route, next action, and hard stop before external use.",
      evidenceRoute: operationalEfficiencyApiRoute,
      boundary: "A lower count is operational posture, not approval or certification."
    },
    {
      metric: "Proof-route density",
      currentSignal: `${proofRoutes.length} unique proof routes are attached to gap records.`,
      targetSignal: "Every high-impact gap resolves to a live route, API, or protected evidence path.",
      evidenceRoute: "/navigation",
      boundary: "Proof routes organize evidence; they do not create protected execution proof by themselves."
    },
    {
      metric: "Hard-stop visibility",
      currentSignal: `${hardStops.length} unique hard stops are surfaced from source systems.`,
      targetSignal: "Each hard stop has a named owner and escalation path before release or buyer use.",
      evidenceRoute: "/boundary-resolution",
      boundary: "Hard-stop visibility does not waive external review."
    },
    {
      metric: "Sprint execution readiness",
      currentSignal: `${sprints.length} cross-functional efficiency sprints are ready for operator sequencing.`,
      targetSignal: "Each sprint produces retained evidence, not informal process memory.",
      evidenceRoute: operationalEfficiencyRoute,
      boundary: "Sprint plans do not authorize autonomous production changes."
    }
  ];

  return {
    service: "scrimed-operational-efficiency",
    route: operationalEfficiencyRoute,
    apiRoute: operationalEfficiencyApiRoute,
    briefRoute: operationalEfficiencyBriefRoute,
    status: operationalEfficiencyStatus,
    briefStatus: operationalEfficiencyBriefStatus,
    boundary: operationalEfficiencyBoundary,
    authority: {
      autonomyAuthority: "no-autonomous-production-remediation",
      dataBoundary: "synthetic-and-metadata-only",
      clinicalCareAuthority: "not-authorized-live-care",
      phiAuthority: "not-authorized-production-phi",
      approvalAuthority: "external-review-required",
      securityCertification: "not-security-certified",
      revenueAuthority: "not-revenue-guarantee",
      profitAuthority: "not-profit-margin-guarantee",
      financialAuthority: "not-audited-financial-report",
      legalAuthority: "qualified-review-required"
    },
    recordCount: records.length,
    openBottleneckCount,
    resolvedCount: countsByStatus.resolved + countsByStatus["active-control"] + countsByStatus.contained,
    countsByStatus,
    countsByDomain,
    proofRouteCount: proofRoutes.length,
    hardStopCount: hardStops.length,
    ownerCount: owners.length,
    sprintCount: sprints.length,
    metricCount: metrics.length,
    discrepancyFaultTriageCount: discrepancyFaultTriageQueue.length,
    criticalDiscrepancyFaultTriageCount: discrepancyFaultTriageQueue.filter(
      (item) => item.severity === "critical"
    ).length,
    highDiscrepancyFaultTriageCount: discrepancyFaultTriageQueue.filter(
      (item) => item.severity === "high"
    ).length,
    sourceAlignment: {
      navigationRouteCount: navigationAudit.sourceTotals.pageRouteCount,
      smokeCoveredHtmlRouteCount: navigationAudit.coverage.smokeCoveredHtmlRouteCount,
      serviceOpenGateCount: serviceReliability.openGateCount,
      serviceFaultClassCount: serviceReliability.faultClassCount,
      releaseGateCount: releaseContinuity.gateCount,
      productServiceOfferCount: productServicePortfolio.offerCount,
      productServicePackageCount: productServicePortfolio.packageCount,
      productServiceMarginControlCount: productServicePortfolio.marginControlCount,
      clientOnboardingStageCount: clientOnboarding.stageCount,
      clientOnboardingTemplateCount: clientOnboarding.templateCount,
      clientOnboardingHandoffCount: clientOnboarding.handoffCount,
      enterpriseScalabilityDomainCount: enterpriseScalability.domainCount,
      enterpriseScalabilityControlCount: enterpriseScalability.controlCount,
      enterpriseScalabilityBottleneckCount: enterpriseScalability.bottleneckCount,
      platformPowerPillarCount: platformPower.pillarCount,
      platformPowerControlCount: platformPower.controlCount,
      platformPowerBottleneckCount: platformPower.bottleneckCount,
      limitationsWorkaroundTrackCount: limitationsWorkarounds.trackCount,
      limitationsWorkaroundPacketCount: limitationsWorkarounds.packetCount,
      limitationsWorkaroundOpenRiskCount: limitationsWorkarounds.openRiskCount,
      growthBottleneckCount: growthEngine.growthBottleneckCount,
      enterpriseControlCount: enterpriseBusinessOps.enterpriseControlCount,
      continuousAuditControlCount: continuousReview.controlCount,
      boundaryRecordCount: boundaryResolution.recordCount
    },
    records,
    discrepancyFaultTriageQueue,
    sprints,
    metrics,
    proofRoutes,
    hardStops,
    owners,
    nextBuildStep:
      "Run discrepancy and fault triage first for any conflicting signal, then run the efficiency sprints in sequence: release and route preflight, commercial throughput, client onboarding and communication cadence, enterprise scalability and support readiness, API/UI/AI platform power, limitations workaround containment, continuous defect-to-control, health-record extraction and safety, and enterprise margin discipline; promote any repeated gap into smoke, boundary, portfolio, onboarding, workaround, platform-power, scale, or reliability controls before claims expand.",
    updated: operationalEfficiencyTriageReleaseAt
  };
}

export function buildOperationalEfficiencyBrief() {
  const summary = getOperationalEfficiencySummary();

  return [
    "# SCRIMED Operational Efficiency Brief",
    "",
    `Status: ${summary.status}`,
    `Updated: ${summary.updated}`,
    `Records: ${summary.recordCount}`,
    `Open bottlenecks: ${summary.openBottleneckCount}`,
    `Proof routes: ${summary.proofRouteCount}`,
    `Hard stops: ${summary.hardStopCount}`,
    `Sprints: ${summary.sprintCount}`,
    `Discrepancy and fault triage items: ${summary.discrepancyFaultTriageCount}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is not autonomous production remediation, AAL2 bypass, PHI processing authority, live clinical care authority, legal/accounting/tax advice, security certification, compliance certification, production connector approval, revenue guarantee, profit-margin guarantee, buyer release approval, or permission to bypass qualified human review.",
    "",
    "## Counts By Status",
    ...Object.entries(summary.countsByStatus).map(([status, count]) => `- ${status}: ${count}`),
    "",
    "## Counts By Domain",
    ...Object.entries(summary.countsByDomain).map(([domain, count]) => `- ${domain}: ${count}`),
    "",
    "## Efficiency Sprints",
    ...summary.sprints.map(
      (sprint) =>
        `- ${sprint.lane}: ${sprint.objective} Owner: ${sprint.owner}. Gain: ${sprint.expectedGain} Boundary: ${sprint.boundary}`
    ),
    "",
    "## Metrics",
    ...summary.metrics.map(
      (metric) =>
        `- ${metric.metric}: ${metric.currentSignal} Target: ${metric.targetSignal} Boundary: ${metric.boundary}`
    ),
    "",
    "## Discrepancy And Fault Triage",
    ...summary.discrepancyFaultTriageQueue.map(
      (item) =>
        `- ${item.id} (${item.severity}): Signal: ${item.signal} Discrepancy: ${item.discrepancy} Containment: ${item.immediateContainment} Root cause probe: ${item.rootCauseProbe} Permanent control: ${item.permanentControl} Owner: ${item.owner}. Trigger: ${item.promotionTrigger} Boundary: ${item.retainedBoundary}`
    ),
    "",
    "## Records",
    recordLines(summary.records),
    "",
    "## Hard Stops",
    markdownItems(summary.hardStops),
    "",
    "## Next Build Step",
    summary.nextBuildStep
  ].join("\n");
}
