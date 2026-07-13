import { getClientOnboardingCommunicationsSummary } from "./clientOnboardingCommunications";
import { getGlobalCertificationReadinessSummary } from "./globalCertificationReadiness";
import { getGlobalPartnerLocalizationSummary } from "./globalPartnerLocalization";
import { getInteroperabilitySummary } from "./interoperabilityStandards";
import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import { scrimedSafetyPolicyVersion } from "./scrimedSafetyGovernance";

export type GlobalEnterpriseReadinessTier =
  | "launch-ready-for-synthetic-outreach"
  | "strategic-partner-review"
  | "watchlist-requires-localization";

export type GlobalEnterpriseRegionCommand = {
  slug: string;
  region: string;
  tier: GlobalEnterpriseReadinessTier;
  readinessScore: number;
  internationalDraw: string;
  salesMotion: string;
  interoperabilityPath: string;
  communicationPlan: string;
  retainedGates: string[];
  blockedClaims: string[];
  proofRoutes: string[];
  nextAction: string;
  auditHash: string;
};

export type GlobalEnterpriseSalesPlaybook = {
  audience: string;
  priority: string;
  buyerTrigger: string;
  globalPitch: string;
  recommendedOffer: string;
  proofRoutes: string[];
  humanReviewGate: string;
  blockedClaims: string[];
  nextAction: string;
};

export type GlobalEnterpriseInteroperabilityLane = {
  standard: string;
  readiness: "mapped-for-synthetic-evaluation" | "profile-selection-required" | "license-or-partner-review-required";
  globalUse: string;
  proofEvidence: string[];
  retainedBoundary: string;
};

export type GlobalEnterpriseCommunicationLane = {
  channel: string;
  purpose: string;
  humanReviewRequired: true;
  localizationRequirement: string;
  blockedContent: string[];
  nextAction: string;
};

export type GlobalEnterpriseScorecard = {
  category: string;
  score: number;
  evidence: string;
  risk: string;
  owner: string;
  nextAction: string;
};

export const globalEnterpriseCommandRoute = "/global-enterprise-command";
export const globalEnterpriseCommandApiRoute = "/api/global-enterprise-command";
export const globalEnterpriseCommandBriefRoute = "/api/global-enterprise-command/brief";
export const globalEnterpriseCommandStatus =
  "global-enterprise-command-active-no-production-authority";
export const globalEnterpriseCommandBriefStatus =
  "global-enterprise-command-brief-ready-no-approval-claim";
export const globalEnterpriseCommandUpdatedAt = "2026-07-09";

export const globalEnterpriseCommandBoundary =
  "SCRIMED Global Enterprise Command coordinates international viability, sales readiness, localization, interoperability, communication, and partner-readiness for synthetic evaluations and enterprise diligence. It is not legal advice, tax advice, regional regulatory approval, public-sector procurement approval, GDPR compliance assurance, HIPAA certification, SOC 2 certification, FDA clearance, NHS approval, production deployment approval, live PHI authority, live clinical care authority, payer submission authority, EHR writeback authority, reseller authorization, revenue guarantee, or customer go-live approval.";

const blockedGlobalClaims = [
  "regional legal approval",
  "public-sector procurement approval",
  "GDPR compliance assurance",
  "claiming HIPAA certification",
  "claiming SOC 2 certification",
  "claiming FDA clearance",
  "claiming NHS approval",
  "live PHI approved",
  "production connector approved",
  "autonomous clinical care",
  "claiming payer submission authority",
  "claiming EHR writeback authority",
  "claiming customer go-live approval",
  "revenue guarantee"
];

function auditHash(id: string, action: string) {
  return generateScrimedAuditHash({
    id,
    action,
    boundary: globalEnterpriseCommandBoundary,
    policyVersion: scrimedSafetyPolicyVersion,
    updated: globalEnterpriseCommandUpdatedAt
  });
}

function regionTier(priority: string): GlobalEnterpriseReadinessTier {
  if (priority === "launch") {
    return "launch-ready-for-synthetic-outreach";
  }

  if (priority === "strategic") {
    return "strategic-partner-review";
  }

  return "watchlist-requires-localization";
}

function regionReadinessScore(priority: string, retainedGateCount: number, proofRouteCount: number) {
  const base = priority === "launch" ? 82 : priority === "strategic" ? 76 : 66;
  const proofLift = Math.min(8, proofRouteCount * 2);
  const gatePenalty = Math.min(10, retainedGateCount);

  return Math.max(55, Math.min(92, base + proofLift - gatePenalty));
}

export function getGlobalEnterpriseCommandSummary() {
  const localization = getGlobalPartnerLocalizationSummary();
  const certification = getGlobalCertificationReadinessSummary();
  const interoperability = getInteroperabilitySummary();
  const communications = getClientOnboardingCommunicationsSummary();

  const regionalCommands: GlobalEnterpriseRegionCommand[] = localization.regions.map((region) => ({
    slug: region.slug,
    region: region.region,
    tier: regionTier(region.priority),
    readinessScore: regionReadinessScore(
      region.priority,
      region.retainedGates.length,
      region.proofRoutes.length
    ),
    internationalDraw: `${region.buyerFit} ${region.deploymentThesis}`,
    salesMotion: region.partnerMotion,
    interoperabilityPath:
      "Use FHIR/HL7/DICOM/X12/IHE profile selection, deployment-region review, and synthetic conformance before any live-system integration.",
    communicationPlan: region.languageAndCulture.join("; "),
    retainedGates: region.retainedGates,
    blockedClaims: blockedGlobalClaims,
    proofRoutes: region.proofRoutes,
    nextAction:
      "Prepare a localized no-PHI executive packet, map regional authority owners, and route any production data, legal, procurement, or clinical request to qualified review.",
    auditHash: auditHash(region.slug, "regional command readiness")
  }));

  const salesPlaybooks: GlobalEnterpriseSalesPlaybook[] = localization.buyerPacks.map((pack) => ({
    audience: pack.audience,
    priority: pack.priority,
    buyerTrigger: pack.trigger,
    globalPitch: pack.localizedMessage,
    recommendedOffer: pack.recommendedOffer,
    proofRoutes: pack.proofRoutes,
    humanReviewGate:
      "Founder or qualified revenue owner reviews regional claims, pricing, proof routes, and external communication before send.",
    blockedClaims: [...pack.disqualifiers, ...blockedGlobalClaims],
    nextAction: pack.safeConversionPath
  }));

  const interoperabilityLanes: GlobalEnterpriseInteroperabilityLane[] =
    interoperability.standards.slice(0, 10).map((standard) => ({
      standard: `${standard.acronym}: ${standard.name}`,
      readiness:
        standard.status === "registry-defined"
          ? "mapped-for-synthetic-evaluation"
          : standard.status === "license-review-required"
            ? "license-or-partner-review-required"
            : "profile-selection-required",
      globalUse: standard.implementationTarget,
      proofEvidence: standard.conformanceEvidence,
      retainedBoundary: interoperability.boundary
    }));

  const communicationLanes: GlobalEnterpriseCommunicationLane[] = [
    {
      channel: "regional executive email",
      purpose: "Introduce SCRIMED as governed healthcare intelligence infrastructure using no-PHI proof routes.",
      humanReviewRequired: true,
      localizationRequirement: "Use region-specific buyer language and counsel-reviewed claims before external send.",
      blockedContent: blockedGlobalClaims,
      nextAction: "Draft from /client-onboarding templates and queue founder or revenue-owner review."
    },
    {
      channel: "bilingual executive briefing",
      purpose: "Support Arabic/English and country-specific executive conversations for strategic regions.",
      humanReviewRequired: true,
      localizationRequirement: "Translation must be reviewed for clinical, legal, privacy, public-sector, and partner-authority claims.",
      blockedContent: blockedGlobalClaims,
      nextAction: "Prepare a localized proof packet with region gates and no-production-authority language."
    },
    {
      channel: "partner qualification workshop",
      purpose: "Validate channel partner authority, implementation fit, data-residency assumptions, and procurement path.",
      humanReviewRequired: true,
      localizationRequirement: "Require partner authority register and no-reseller-claim language until agreement review.",
      blockedContent: blockedGlobalClaims,
      nextAction: "Use /global-reach partner channels and /trust-center proof routes before any public relationship claim."
    },
    {
      channel: "security and procurement review",
      purpose: "Answer enterprise diligence questions with evidence routes, open gates, and owner assignments.",
      humanReviewRequired: true,
      localizationRequirement: "Adapt evidence packet to regional privacy, AI governance, security, hosting, and procurement expectations.",
      blockedContent: blockedGlobalClaims,
      nextAction: "Route requests to /global-certification-readiness, /scrimed-cyber-defense, and /enterprise-healthcare-infrastructure."
    }
  ];

  const scorecards: GlobalEnterpriseScorecard[] = [
    {
      category: "International draw",
      score: Math.round(
        regionalCommands.reduce((total, command) => total + command.readinessScore, 0) /
          regionalCommands.length
      ),
      evidence: `${regionalCommands.length} region commands and ${salesPlaybooks.length} buyer playbooks are mapped to proof routes.`,
      risk: "Regional counsel, procurement, privacy, and public-sector authority are still external-review gates.",
      owner: "Founder + global partner lead",
      nextAction: "Package the top launch and strategic regions into localized no-PHI outreach packets."
    },
    {
      category: "Global interoperability",
      score: Math.min(90, 60 + interoperability.standardCount + interoperability.activeControls),
      evidence: `${interoperability.standardCount} standards and ${interoperability.activeControls} active controls are available for synthetic conformance work.`,
      risk: "Live connectors, profile selection, licensing, regional exchange participation, and writeback remain blocked.",
      owner: "Interoperability lead + security + customer technical owner",
      nextAction: "Attach regional interoperability lanes to deployment profiles and buyer diligence packets."
    },
    {
      category: "Global communication",
      score: Math.min(92, 62 + communications.templateCount + communications.approvalGateCount),
      evidence: `${communications.templateCount} templates, ${communications.calendarPacketCount} calendar packets, and ${communications.approvalGateCount} approval gates support human-reviewed outreach.`,
      risk: "External communications, translations, partner claims, pricing, legal language, and clinical statements require review.",
      owner: "Revenue operations + founder + legal reviewer",
      nextAction: "Use the communication lanes for every regional buyer, partner, investor, and public-sector conversation."
    },
    {
      category: "Global assurance",
      score: Math.min(88, 55 + certification.trackCount + certification.gateCount + certification.regionalPackCount),
      evidence: `${certification.trackCount} approval tracks, ${certification.gateCount} gates, and ${certification.regionalPackCount} regional packs are tracked.`,
      risk: "No certification, regulatory approval, public-sector procurement approval, or clinical validation claim is authorized.",
      owner: "Privacy + security + legal + clinical governance",
      nextAction: "Create evidence-room packets for the regions with the strongest commercial pull."
    }
  ];

  return {
    service: "scrimed-global-enterprise-command",
    status: globalEnterpriseCommandStatus,
    briefStatus: globalEnterpriseCommandBriefStatus,
    route: globalEnterpriseCommandRoute,
    apiRoute: globalEnterpriseCommandApiRoute,
    briefRoute: globalEnterpriseCommandBriefRoute,
    updated: globalEnterpriseCommandUpdatedAt,
    boundary: globalEnterpriseCommandBoundary,
    policyVersion: scrimedSafetyPolicyVersion,
    sourceAlignment: {
      globalReachStatus: localization.status,
      certificationStatus: certification.status,
      interoperabilityStatus: interoperability.status,
      communicationsStatus: communications.status
    },
    regionCommandCount: regionalCommands.length,
    launchRegionCommandCount: regionalCommands.filter(
      (command) => command.tier === "launch-ready-for-synthetic-outreach"
    ).length,
    strategicRegionCommandCount: regionalCommands.filter(
      (command) => command.tier === "strategic-partner-review"
    ).length,
    salesPlaybookCount: salesPlaybooks.length,
    interoperabilityLaneCount: interoperabilityLanes.length,
    communicationLaneCount: communicationLanes.length,
    scorecardCount: scorecards.length,
    retainedGateCount: regionalCommands.reduce(
      (total, command) => total + command.retainedGates.length,
      0
    ),
    blockedClaimCount: blockedGlobalClaims.length,
    averageRegionReadinessScore: Math.round(
      regionalCommands.reduce((total, command) => total + command.readinessScore, 0) /
        regionalCommands.length
    ),
    authority: {
      globalAuthority: "readiness-only-not-legal-approval",
      communicationAuthority: "human-reviewed-templates-only",
      interoperabilityAuthority: "synthetic-conformance-only",
      productionAuthority: "not-production-authorized",
      phiAuthority: "not-authorized-production-phi",
      clinicalCareAuthority: "not-authorized-live-care",
      certificationAuthority: "not-certified",
      customerGoLiveAuthority: "not-customer-go-live-approval"
    },
    regionalCommands,
    salesPlaybooks,
    interoperabilityLanes,
    communicationLanes,
    scorecards,
    blockedClaims: blockedGlobalClaims,
    nextBuildStep:
      "Turn the highest-scoring global region commands into localized no-PHI proof packets with region counsel review, interoperability assumptions, human-reviewed communication templates, and protected partner qualification records."
  };
}

export function buildGlobalEnterpriseCommandBrief() {
  const summary = getGlobalEnterpriseCommandSummary();

  return [
    "# SCRIMED Global Enterprise Command Brief",
    "",
    `Status: ${summary.status}`,
    `Updated: ${summary.updated}`,
    `Average region readiness: ${summary.averageRegionReadinessScore}`,
    `Region commands: ${summary.regionCommandCount}`,
    `Sales playbooks: ${summary.salesPlaybookCount}`,
    `Interoperability lanes: ${summary.interoperabilityLaneCount}`,
    `Communication lanes: ${summary.communicationLaneCount}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief supports international diligence, localization, partner qualification, and no-PHI enterprise evaluation only. It does not authorize live PHI, production deployment, clinical care, diagnosis, treatment, prescribing, payer submission, EHR writeback, regional legal approval, certification, public-sector procurement approval, reseller authority, revenue guarantees, or customer go-live.",
    "",
    "## Scorecards",
    ...summary.scorecards.map(
      (scorecard) =>
        `- ${scorecard.category}: ${scorecard.score}. Evidence: ${scorecard.evidence} Risk: ${scorecard.risk} Next: ${scorecard.nextAction}`
    ),
    "",
    "## Regional Commands",
    ...summary.regionalCommands.map(
      (command) =>
        `- ${command.region} (${command.tier}, readiness ${command.readinessScore}): ${command.nextAction} Retained gates: ${command.retainedGates.join(", ")}`
    ),
    "",
    "## Sales Playbooks",
    ...summary.salesPlaybooks.map(
      (playbook) =>
        `- ${playbook.audience}: ${playbook.recommendedOffer}. Gate: ${playbook.humanReviewGate} Next: ${playbook.nextAction}`
    ),
    "",
    "## Interoperability Lanes",
    ...summary.interoperabilityLanes.map(
      (lane) =>
        `- ${lane.standard} (${lane.readiness}): ${lane.globalUse} Evidence: ${lane.proofEvidence.join(", ")}`
    ),
    "",
    "## Communication Lanes",
    ...summary.communicationLanes.map(
      (lane) =>
        `- ${lane.channel}: ${lane.purpose} Review required: ${lane.humanReviewRequired}. Next: ${lane.nextAction}`
    ),
    "",
    "## Blocked Claims",
    ...summary.blockedClaims.map((claim) => `- ${claim}`),
    "",
    `Next build step: ${summary.nextBuildStep}`
  ].join("\n");
}
