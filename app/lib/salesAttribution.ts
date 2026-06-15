import { deploymentProfiles } from "./deploymentProfiles";
import {
  advertisingCampaigns,
  communicationsPlaybook,
  revenueStreams,
  targetAudiences
} from "./marketActivation";
import { getSourceIntelligenceSummary, type SourceIntelligenceSignal } from "./sourceIntelligence";

export type AttributionPriority = "immediate" | "high" | "standard" | "nurture";

export type SalesAttributionInput = {
  source: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  buyerSegment: string;
  organizationSize: string;
  region: string;
  offerInterest: string;
  workflowTargets: string[];
  readinessNeeds: string[];
  governanceRequirements: string[];
  timeline: string;
  receivedAt: string;
};

export type SalesAttribution = {
  version: "2026-06-15.sales-attribution-v1";
  noPhiBoundary: true;
  capturedAt: string;
  sourceRoute: string;
  referrerHost: string;
  sourceCategory: string;
  campaign: {
    source: string;
    medium: string;
    campaign: string;
    term: string;
    content: string;
    confidence: "explicit-utm" | "route-inferred" | "direct";
    matchedChannel: string;
    landingRoute: string;
    conversionEvent: string;
  };
  market: {
    revenueStream: string;
    targetAudience: string;
    primaryOffer: string;
    message: string;
    proofRoute: string;
  };
  deployment: {
    profileSlug: string;
    profileName: string;
    profileStatus: string;
    rationale: string;
    productionGates: string[];
    blockedClaims: string[];
  };
  cadence: {
    priority: AttributionPriority;
    firstResponseSla: string;
    nextActionTemplate: string;
    recommendedOwner: string;
    nurtureCadence: string;
    disqualificationChecks: string[];
  };
  sourceSignals: Array<Pick<SourceIntelligenceSignal, "sourceName" | "category" | "scrimedApplication">>;
  crmSafeFields: string[];
  blockedFields: string[];
  crmTags: string[];
};

export const salesAttributionBoundary =
  "SCRIMED sales attribution captures no-PHI source, campaign, route, offer, audience, deployment-profile, source-intelligence, and follow-up cadence metadata. It must not store PHI, patient identifiers, clinical records, diagnosis details, payer member identifiers, ad-platform sensitive health inferences, or live production healthcare data.";

const campaignFallback = {
  source: "direct",
  medium: "owned-product",
  campaign: "scrimed-product-intake",
  term: "",
  content: ""
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function sanitizeRoute(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "/pilot";
  }

  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      const url = new URL(trimmed);
      return `${url.pathname}${url.search ? "?tracked" : ""}`;
    }
  } catch {
    return "/pilot";
  }

  return trimmed.startsWith("/") ? trimmed.slice(0, 240) : `/${trimmed.slice(0, 239)}`;
}

function extractHost(value: string) {
  if (!value.trim()) {
    return "";
  }

  try {
    return new URL(value).host;
  } catch {
    return "";
  }
}

function includesAny(values: string[], candidates: string[]) {
  const haystack = values.map(normalize).join(" ");
  return candidates.some((candidate) => haystack.includes(normalize(candidate)));
}

function selectRevenueStream(input: SalesAttributionInput) {
  const offer = normalize(input.offerInterest);
  const size = normalize(input.organizationSize);
  const segment = normalize(input.buyerSegment);

  if (offer.includes("synthetic-pilot")) {
    return revenueStreams.find((stream) => stream.name === "Synthetic Pilot Evaluation") ?? revenueStreams[1];
  }

  if (offer.includes("governance") || input.governanceRequirements.length >= 4) {
    return revenueStreams.find((stream) => stream.name === "Workflow Intelligence Assessment") ?? revenueStreams[0];
  }

  if (size.includes("5000") || segment.includes("government")) {
    return revenueStreams.find((stream) => stream.name === "Protected Enterprise Pilot") ?? revenueStreams[2];
  }

  return revenueStreams.find((stream) => stream.name === "Workflow Intelligence Assessment") ?? revenueStreams[0];
}

function selectTargetAudience(input: SalesAttributionInput) {
  const segment = normalize(input.buyerSegment);
  const workflow = input.workflowTargets.map(normalize).join(" ");
  const readiness = input.readinessNeeds.map(normalize).join(" ");

  if (segment.includes("government")) {
    return targetAudiences.find((audience) => audience.segment === "Government and public-sector healthcare leaders") ?? targetAudiences[3];
  }

  if (segment.includes("payer") || workflow.includes("denial") || workflow.includes("authorization")) {
    return targetAudiences.find((audience) => audience.segment === "Payer and revenue cycle leaders") ?? targetAudiences[1];
  }

  if (readiness.includes("security") || readiness.includes("governance")) {
    return targetAudiences.find((audience) => audience.segment === "Security, privacy, legal, and governance buyers") ?? targetAudiences[2];
  }

  if (segment.includes("faith")) {
    return targetAudiences.find((audience) => audience.segment === "Faith-aligned care, community, and patient-experience leaders") ?? targetAudiences[4];
  }

  return targetAudiences.find((audience) => audience.segment === "Health system operations executives") ?? targetAudiences[0];
}

function selectDeploymentProfile(input: SalesAttributionInput) {
  const region = normalize(input.region);
  const segment = normalize(input.buyerSegment);
  const context = [
    ...input.workflowTargets,
    ...input.readinessNeeds,
    ...input.governanceRequirements,
    input.utmCampaign,
    input.utmTerm,
    input.utmContent
  ].map(normalize);

  if (segment.includes("government") || region.includes("global") || region.includes("middle-east") || region.includes("africa") || region.includes("europe")) {
    return deploymentProfiles.find((profile) => profile.slug === "sovereign-cloud") ?? deploymentProfiles[3];
  }

  if (includesAny(context, ["dicom", "device", "imaging", "lab", "edge", "on-prem"])) {
    return deploymentProfiles.find((profile) => profile.slug === "edge-on-prem") ?? deploymentProfiles[4];
  }

  if (includesAny(context, ["integration-map", "ehr", "hl7", "smart", "fhir"])) {
    return deploymentProfiles.find((profile) => profile.slug === "hospital-controlled") ?? deploymentProfiles[2];
  }

  return deploymentProfiles.find((profile) => profile.slug === "managed-cloud") ?? deploymentProfiles[0];
}

function selectCampaign(input: SalesAttributionInput, sourceRoute: string) {
  const utmMedium = normalize(input.utmMedium);

  if (utmMedium.includes("paid") || utmMedium.includes("cpc") || input.utmSource || input.utmCampaign) {
    return advertisingCampaigns.find((campaign) => normalize(campaign.channel).includes("search")) ?? advertisingCampaigns[1];
  }

  if (sourceRoute.includes("faithcore")) {
    return advertisingCampaigns.find((campaign) => normalize(campaign.channel).includes("faithcore")) ?? advertisingCampaigns[2];
  }

  if (sourceRoute.includes("pilot")) {
    return communicationsPlaybook.find((playbook) => playbook.channel === "Enterprise sales outreach") ?? advertisingCampaigns[0];
  }

  return advertisingCampaigns.find((campaign) => normalize(campaign.channel).includes("linkedin")) ?? advertisingCampaigns[0];
}

function sourceCategory(sourceRoute: string, input: SalesAttributionInput) {
  if (input.utmSource || input.utmCampaign) {
    return "campaign-attributed";
  }

  if (sourceRoute.includes("market-activation")) {
    return "market-activation";
  }

  if (sourceRoute.includes("deployment-profiles")) {
    return "deployment-profile";
  }

  if (sourceRoute.includes("faithcore")) {
    return "faithcore";
  }

  if (sourceRoute.includes("pricing")) {
    return "pricing-review";
  }

  if (sourceRoute.includes("product")) {
    return "product-console";
  }

  if (sourceRoute.includes("pilot")) {
    return "direct-pilot-intake";
  }

  return "owned-product-route";
}

function selectSignals(input: SalesAttributionInput) {
  const summary = getSourceIntelligenceSummary();
  const context = [
    input.buyerSegment,
    input.offerInterest,
    input.region,
    ...input.workflowTargets,
    ...input.readinessNeeds,
    ...input.governanceRequirements
  ].map(normalize).join(" ");

  const preferred = summary.signals.filter((signal) => {
    if (context.includes("fhir") || context.includes("hl7") || context.includes("integration")) {
      return signal.category === "interoperability" || signal.category === "data-cloud";
    }

    if (context.includes("trial") || context.includes("oncology") || context.includes("research")) {
      return signal.category === "healthcare-domain" || signal.category === "model-governance";
    }

    if (context.includes("governance") || context.includes("security")) {
      return signal.category === "model-governance" || signal.category === "design-quality";
    }

    if (context.includes("payer") || context.includes("denial") || context.includes("authorization")) {
      return signal.category === "sales-experience" || signal.category === "interoperability";
    }

    return signal.category === "agent-operations" || signal.category === "sales-experience";
  });

  return (preferred.length ? preferred : summary.signals).slice(0, 4).map((signal) => ({
    sourceName: signal.sourceName,
    category: signal.category,
    scrimedApplication: signal.scrimedApplication
  }));
}

function selectCadence(input: SalesAttributionInput, revenueStreamName: string, targetAudience: string): SalesAttribution["cadence"] {
  const timeline = normalize(input.timeline);
  const governanceHeavy = input.governanceRequirements.length >= 4 || includesAny(input.readinessNeeds, ["security-review"]);

  if (timeline.includes("now")) {
    return {
      priority: "immediate",
      firstResponseSla: "same business day",
      nextActionTemplate:
        "Respond with a no-PHI discovery boundary, confirm executive sponsor, and schedule a governed assessment conversation.",
      recommendedOwner: revenueStreamName.includes("Strategic") ? "Founder and strategic partnerships" : "Enterprise sales",
      nurtureCadence: "Human follow-up within one business day, then weekly until discovery outcome is recorded.",
      disqualificationChecks: [
        "Buyer expects autonomous clinical decisions",
        "Buyer requests public intake of PHI",
        "Buyer asks for guarantees, certification, or payer submission before review"
      ]
    };
  }

  if (timeline.includes("30-90") || governanceHeavy) {
    return {
      priority: "high",
      firstResponseSla: "two business days",
      nextActionTemplate:
        "Send an assessment agenda, confirm workflow owners, and attach governance, deployment, and attribution context to sales operations.",
      recommendedOwner: targetAudience.includes("Security") ? "Security, privacy, and governance lead" : "Sales engineering and delivery",
      nurtureCadence: "Two-touch sequence over ten business days, then move to monthly executive nurture if inactive.",
      disqualificationChecks: [
        "No identifiable workflow owner",
        "No buyer-approved synthetic pilot boundary",
        "No privacy or security reviewer for protected pilot planning"
      ]
    };
  }

  if (timeline.includes("exploratory")) {
    return {
      priority: "nurture",
      firstResponseSla: "five business days",
      nextActionTemplate:
        "Send a concise product proof path and ask which workflow, region, and governance problem matters most.",
      recommendedOwner: "Founder and strategic partnerships",
      nurtureCadence: "Monthly source-informed update until a concrete workflow owner or sponsor emerges.",
      disqualificationChecks: [
        "No healthcare operating problem identified",
        "Interest is only generic AI curiosity",
        "Buyer rejects SCRIMED governance boundaries"
      ]
    };
  }

  return {
    priority: "standard",
    firstResponseSla: "three business days",
    nextActionTemplate:
      "Route to workflow intelligence assessment and confirm buyer goals, proof routes, and governance gates.",
    recommendedOwner: "Enterprise sales",
    nurtureCadence: "Three-touch sequence over fifteen business days with proof packet and readiness brief.",
    disqualificationChecks: [
      "No operational buyer",
      "No synthetic evaluation scope",
      "Request conflicts with claims register"
    ]
  };
}

export function buildSalesAttribution(input: SalesAttributionInput): SalesAttribution {
  const sourceRoute = sanitizeRoute(input.source);
  const campaignSource = input.utmSource.trim() || campaignFallback.source;
  const campaignMedium = input.utmMedium.trim() || campaignFallback.medium;
  const campaignName = input.utmCampaign.trim() || campaignFallback.campaign;
  const matchedCampaign = selectCampaign(input, sourceRoute);
  const revenueStream = selectRevenueStream(input);
  const targetAudience = selectTargetAudience(input);
  const deploymentProfile = selectDeploymentProfile(input);
  const campaign =
    "landingRoute" in matchedCampaign
      ? matchedCampaign
      : {
          channel: matchedCampaign.channel,
          landingRoute: matchedCampaign.proofAsset,
          conversionEvent: matchedCampaign.message
        };
  const cadence = selectCadence(input, revenueStream.name, targetAudience.segment);
  const category = sourceCategory(sourceRoute, input);
  const sourceSignals = selectSignals(input);

  return {
    version: "2026-06-15.sales-attribution-v1",
    noPhiBoundary: true,
    capturedAt: input.receivedAt,
    sourceRoute,
    referrerHost: extractHost(input.referrer),
    sourceCategory: category,
    campaign: {
      source: campaignSource,
      medium: campaignMedium,
      campaign: campaignName,
      term: input.utmTerm.trim(),
      content: input.utmContent.trim(),
      confidence: input.utmSource || input.utmCampaign ? "explicit-utm" : sourceRoute ? "route-inferred" : "direct",
      matchedChannel: campaign.channel,
      landingRoute: campaign.landingRoute,
      conversionEvent: campaign.conversionEvent
    },
    market: {
      revenueStream: revenueStream.name,
      targetAudience: targetAudience.segment,
      primaryOffer: targetAudience.primaryOffer,
      message: targetAudience.message,
      proofRoute: revenueStream.proofRoute
    },
    deployment: {
      profileSlug: deploymentProfile.slug,
      profileName: deploymentProfile.name,
      profileStatus: deploymentProfile.status,
      rationale: deploymentProfile.deploymentThesis,
      productionGates: deploymentProfile.productionGates,
      blockedClaims: deploymentProfile.blockedClaims
    },
    cadence,
    sourceSignals,
    crmSafeFields: [
      "sourceRoute",
      "referrerHost",
      "utmSource",
      "utmMedium",
      "utmCampaign",
      "market.revenueStream",
      "market.targetAudience",
      "deployment.profileSlug",
      "cadence.priority",
      "cadence.firstResponseSla"
    ],
    blockedFields: [
      "PHI",
      "patient identifiers",
      "clinical records",
      "diagnosis details",
      "payer member identifiers",
      "ad-platform sensitive health inferences",
      "production healthcare data"
    ],
    crmTags: [
      `source:${category}`,
      `utm-source:${normalize(campaignSource)}`,
      `utm-medium:${normalize(campaignMedium)}`,
      `utm-campaign:${normalize(campaignName)}`,
      `revenue:${normalize(revenueStream.name)}`,
      `audience:${normalize(targetAudience.segment)}`,
      `deployment:${deploymentProfile.slug}`,
      `cadence:${cadence.priority}`,
      ...sourceSignals.map((signal) => `signal:${normalize(signal.sourceName)}`)
    ]
  };
}

export function getSalesAttributionSummary() {
  const sourceSummary = getSourceIntelligenceSummary();

  return {
    service: "scrimed-sales-attribution",
    status: "crm-safe-attribution-ready",
    route: "/sales-attribution",
    apiRoute: "/api/sales-attribution",
    boundary: salesAttributionBoundary,
    sourceIntelligenceRoute: sourceSummary.route,
    sourceIntelligenceApiRoute: sourceSummary.apiRoute,
    sourceSignalCount: sourceSummary.sourceCount,
    revenueStreamCount: revenueStreams.length,
    targetAudienceCount: targetAudiences.length,
    deploymentProfileCount: deploymentProfiles.length,
    capturedFields: [
      "source route",
      "referrer host",
      "UTM source",
      "UTM medium",
      "UTM campaign",
      "UTM term",
      "UTM content",
      "offer",
      "audience",
      "deployment profile",
      "source-informed strategic signals",
      "human follow-up cadence"
    ],
    blockedFields: [
      "PHI",
      "patient identifiers",
      "live clinical records",
      "diagnosis details",
      "payer member identifiers",
      "sensitive ad-platform health inferences",
      "production clinical data"
    ],
    sampleAttribution: buildSalesAttribution({
      source: "/product",
      referrer: "https://www.scrimedsolutions.com",
      utmSource: "wix",
      utmMedium: "owned-website",
      utmCampaign: "product-console-cta",
      utmTerm: "",
      utmContent: "request-pilot",
      buyerSegment: "health-system",
      organizationSize: "501-5000",
      region: "united-states",
      offerInterest: "synthetic-pilot-evaluation",
      workflowTargets: ["prior-authorization", "rcm-denial-risk"],
      readinessNeeds: ["workflow-map", "synthetic-demo", "security-review"],
      governanceRequirements: ["human-review", "synthetic-only", "audit-trail", "no-autonomous-diagnosis"],
      timeline: "30-90-days",
      receivedAt: "2026-06-15T00:00:00.000Z"
    }),
    nextBuildStep:
      "Persist attribution trends into dashboard-level cohort reporting and connect them to buyer-specific proof packet recommendations.",
    updated: "2026-06-15"
  };
}

export function buildSalesAttributionBrief() {
  const summary = getSalesAttributionSummary();

  return [
    "# SCRIMED Sales Attribution Brief",
    "",
    `Status: ${summary.status}`,
    `Boundary: ${summary.boundary}`,
    "",
    "## Captured Fields",
    ...summary.capturedFields.map((field) => `- ${field}`),
    "",
    "## Blocked Fields",
    ...summary.blockedFields.map((field) => `- ${field}`),
    "",
    "## Sample Attribution",
    `- Source: ${summary.sampleAttribution.sourceCategory}`,
    `- Revenue stream: ${summary.sampleAttribution.market.revenueStream}`,
    `- Target audience: ${summary.sampleAttribution.market.targetAudience}`,
    `- Deployment profile: ${summary.sampleAttribution.deployment.profileName}`,
    `- First response SLA: ${summary.sampleAttribution.cadence.firstResponseSla}`,
    "",
    "## Next Build Step",
    summary.nextBuildStep
  ].join("\n");
}
