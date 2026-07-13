import { getApprovalsReadinessSummary } from "./approvalsReadiness";
import { getClientOnboardingCommunicationsSummary } from "./clientOnboardingCommunications";
import { getEnterpriseBusinessOpsSummary } from "./enterpriseBusinessOperations";
import { getEnterpriseScalabilityOperationsSummary } from "./enterpriseScalabilityOperations";
import { getGlobalCertificationReadinessSummary } from "./globalCertificationReadiness";
import { getHealthRecordsSafetyExchangeSummary } from "./healthRecordsSafetyExchange";
import { getLimitationsWorkaroundSummary } from "./limitationsWorkaroundOperations";
import { getNavigationAuditSummary } from "./navigationAudit";
import { getOperationalEfficiencySummary } from "./operationalEfficiency";
import { getPlatformPowerSummary } from "./platformPowerOperations";
import { getProductServicePortfolioSummary } from "./productServicePortfolio";
import { getReleaseContinuitySummary } from "./releaseContinuity";
import { getServiceReliabilitySummary } from "./serviceReliability";

export type LaunchReadinessTrack = {
  name: string;
  status: "ready" | "contained" | "operator-required" | "external-review-required";
  launchQuestion: string;
  control: string;
  owner: string;
  proofRoutes: string[];
  goNoGoGate: string;
  workaround: string;
  hardStop: string;
};

export type LaunchDnsControl = {
  name: string;
  status: "strict-primary-required" | "fallback-contained" | "operator-required";
  issue: string;
  detection: string;
  primaryTarget: string;
  fallbackTarget: string;
  command: string;
  passCondition: string;
  launchRule: string;
  workaround: string;
  retainedBoundary: string;
};

export type LaunchServicePath = {
  phase: string;
  owner: string;
  requiredProof: string;
  servicePosture: string;
  customerVisibleOutput: string;
  internalFallback: string;
};

export type LaunchRisk = {
  risk: string;
  severity: "critical" | "high" | "medium";
  owner: string;
  containment: string;
  graduationGate: string;
};

export const launchReadinessRoute = "/launch-readiness";
export const launchReadinessApiRoute = "/api/launch-readiness";
export const launchReadinessBriefRoute = "/api/launch-readiness/brief";
export const launchReadinessStatus = "launch-readiness-control-plane-active";
export const launchReadinessBriefStatus = "launch-readiness-brief-ready";
export const launchReadinessUpdatedAt = "2026-06-26";
export const launchPrimaryDomain = "https://app.scrimedsolutions.com";
export const launchFallbackDomain = "https://scrimed-site.vercel.app";

export const launchReadinessBoundary =
  "SCRIMED Launch Readiness organizes launch structure, product readiness, service readiness, functional verification, DNS/domain checks, sandbox limitations, and workarounds into one go/no-go control plane. It is operating-readiness evidence only. It does not bypass sandbox restrictions, override DNS, approve production clinical use, authorize PHI processing, certify security or compliance, create a contractual SLA, approve production connectors, approve customer release, provide legal/accounting/tax advice, guarantee revenue or profit, or replace qualified human launch review.";

export const launchReadinessTracks: LaunchReadinessTrack[] = [
  {
    name: "Custom domain and DNS preflight",
    status: "contained",
    launchQuestion: "Can operators distinguish a restricted sandbox DNS failure from a real production-domain outage?",
    control:
      "Run strict production smoke against the branded domain when network DNS is available, and run the launch domain preflight to classify DNS, HTTP, and fallback deployment posture.",
    owner: "Release Steward + Domain/DNS Administrator",
    proofRoutes: ["/release-continuity", "/operations", "/navigation", "/api/launch-readiness"],
    goNoGoGate:
      "Primary branded domain must resolve and pass smoke from an unrestricted network before public launch approval.",
    workaround:
      "When the managed sandbox returns ENOTFOUND, rerun production smoke with approved network access and use the fallback Vercel alias only as supporting evidence, not as launch approval.",
    hardStop: "Do not mark launch green from fallback-only proof when the branded domain cannot be verified."
  },
  {
    name: "Source, build, and route inventory",
    status: "ready",
    launchQuestion: "Does the deployed product match the source and expose navigable launch-critical routes?",
    control:
      "Keep build, typecheck, route inventory, API route pattern count, persistent navigation, and smoke-covered HTML routes aligned before promotion.",
    owner: "Engineering + Product Console",
    proofRoutes: ["/navigation", "/product", "/api/navigation-audit", "/api/product/console"],
    goNoGoGate:
      "Typecheck, lint, build, navigation inventory, public smoke, and route counts must agree before external promotion.",
    workaround:
      "If one dynamic detail route cannot be smoked, keep the canonical route smoke-covered and rely on build/typecheck for the dynamic segment until it becomes buyer-critical.",
    hardStop: "Do not launch with missing primary navigation, stale route counts, or broken canonical buyer paths."
  },
  {
    name: "Product and offer packaging",
    status: "ready",
    launchQuestion: "Can a buyer understand what SCRIMED sells without internal explanation?",
    control:
      "Use the Product Console, Offerings Portfolio, demos, pilots, pricing, and proof stack as the first buyer-facing product path.",
    owner: "Product Console + Revenue Operations",
    proofRoutes: ["/product", "/offerings", "/demos", "/pilots", "/pricing", "/pilot-deal-room"],
    goNoGoGate:
      "Every launch conversation has a sellable package, scope boundary, proof route, and next buyer action.",
    workaround:
      "Use assessment or synthetic pilot packages when production connectors, PHI, customer proof, or live-care authority are not approved.",
    hardStop: "Do not sell live clinical execution, EHR writeback, payer submission, or autonomous patient outreach."
  },
  {
    name: "Service delivery and onboarding",
    status: "ready",
    launchQuestion: "Can SCRIMED handle demos, pilots, meetings, handoffs, and follow-up without ad hoc process?",
    control:
      "Route client onboarding through human-reviewed emails, calendar-ready agendas, demo scripts, pilot workshops, follow-up SLAs, and handoff controls.",
    owner: "Customer Operations + Sales Engineering",
    proofRoutes: ["/client-onboarding", "/sales-operations", "/pilot", "/pilot-workspace/access"],
    goNoGoGate:
      "Each opportunity has owner, stage, communication packet, proof routes, scope, retained boundary, and next meeting artifact.",
    workaround:
      "Use manual human-send communications and no-PHI meeting packets until email/calendar automation and CRM sync are approved.",
    hardStop: "Do not auto-send emails, create calendar invites, bind contracts, store PHI, or promise procurement approval."
  },
  {
    name: "Enterprise operations and margin control",
    status: "external-review-required",
    launchQuestion: "Can SCRIMED scale revenue operations without letting contracts, margin, tax, or accounting risk drift?",
    control:
      "Run every serious opportunity through deal desk, price floor, margin review, legal/accounting/tax routing, billing readiness, and blocked-claim checks.",
    owner: "Founder + Legal Ops + Finance + Accounting + Revenue Operations",
    proofRoutes: ["/enterprise-business-ops", "/capital-vitality", "/public-market-readiness", "/growth-engine"],
    goNoGoGate:
      "No enterprise proposal expands beyond approved package, price floor, review owner, contract posture, and margin exposure.",
    workaround:
      "Use non-binding readiness packets and qualified-review labels until counsel, accounting, tax, and finance reviewers approve templates.",
    hardStop:
      "Do not imply audited financials, legal approval, tax advice, revenue guarantee, profit guarantee, securities material, or contract approval."
  },
  {
    name: "Scale, support, and reliability posture",
    status: "contained",
    launchQuestion: "Can SCRIMED discuss enterprise scale without accidentally promising an SLA or managed service?",
    control:
      "Use scale domains, service reliability controls, incident/change operations, support-tier review, cost thresholds, and regional gates before commitments expand.",
    owner: "Platform + Service Reliability + Customer Operations",
    proofRoutes: ["/enterprise-scalability", "/service-reliability", "/operational-efficiency", "/platform-power"],
    goNoGoGate:
      "Support, uptime, SLO, region, residency, DR, and cost commitments must be contract-reviewed before buyer use.",
    workaround:
      "Offer launch-window support plans and review cadences as readiness language, not contractual SLA language.",
    hardStop: "Do not claim 24/7 production support, SOC/MDR coverage, uptime guarantee, or data-residency approval."
  },
  {
    name: "Healthcare data, interoperability, and patient safety",
    status: "external-review-required",
    launchQuestion: "Can SCRIMED show strong health-record capability while keeping live-data and clinical authority blocked?",
    control:
      "Keep health records, interoperability, extraction, patient-safety lint, and clinical activation on synthetic/no-PHI tracks until buyer-specific authority exists.",
    owner: "Clinical Governance + Interoperability + Privacy + Security",
    proofRoutes: ["/health-records", "/interoperability", "/clinical-authority-readiness", "/clinical-care-activation"],
    goNoGoGate:
      "Live PHI, EHR/HIE/payer connectors, matching, writeback, patient outreach, payer submission, or clinical action require explicit buyer, legal, privacy, security, and clinical approval.",
    workaround:
      "Use no-PHI synthetic extraction, metadata-only artifact references, standards mapping, and external evidence pointers.",
    hardStop:
      "Do not process PHI, diagnose, triage emergencies, prescribe, mutate records, submit claims, or represent clinical validation."
  },
  {
    name: "Approvals, certifications, and global launch readiness",
    status: "external-review-required",
    launchQuestion: "Can domestic and global launch claims stay prepared without claiming approval?",
    control:
      "Route HIPAA/BAA, SOC 2, HITRUST, ISO, FDA, ONC, EU AI Act, GDPR, NHS, MHRA, Australia, public-sector, and region-specific questions through evidence tracks.",
    owner: "Legal + Security + Privacy + Regional Counsel + AI Governance",
    proofRoutes: ["/approvals-readiness", "/global-certification-readiness", "/global-reach", "/trust-center"],
    goNoGoGate:
      "External certification, conformity, regulatory, legal, privacy, procurement, and security claims must cite qualified evidence before use.",
    workaround:
      "Use preparation packets, official-source checklists, and external-review-required headers until formal approvals exist.",
    hardStop:
      "Do not claim HIPAA certification, SOC 2/HITRUST/ISO certification, FDA clearance, ONC certification, GDPR assurance, EU AI Act conformity, NHS/MHRA/Australia approval, or public-sector procurement approval."
  },
  {
    name: "AI, API, UI, agents, and continuous review",
    status: "contained",
    launchQuestion: "Can the platform feel enterprise-grade while keeping live AI authority and autonomous remediation blocked?",
    control:
      "Keep API contracts, UI command paths, model-route controls, agent approval, eval/red-team loops, evidence retrieval, review agents, and incident learning wired into launch proof.",
    owner: "Platform Engineering + TrustOS + QA + Internal Research Team",
    proofRoutes: ["/platform-power", "/agents", "/continuous-review-audit", "/qa-claim-guard"],
    goNoGoGate:
      "Launch messaging must show agent-assisted review and AI readiness while preserving human approval, no-PHI, no-live-AI, and no-public-quantum boundaries.",
    workaround:
      "Assign speculative technology such as quantum-safe readiness to internal research with no public capability claim.",
    hardStop:
      "Do not claim live autonomous AI authority, production model approval, public API SLA, trillion-scale equivalence, security certification, or public quantum capability."
  },
  {
    name: "Protected proof and customer release",
    status: "operator-required",
    launchQuestion: "Can SCRIMED prove diligence value without exposing protected artifacts or customer-specific claims?",
    control:
      "Keep protected buyer proof, release decisions, reviewer signoffs, distribution lockbox, recipient attestations, access logs, provider adapters, procurement evidence, and AAL2 proof fail-closed publicly.",
    owner: "Buyer Diligence + TrustOps + Release Steward + Approved AAL2 Operator",
    proofRoutes: ["/pilot-workspace/access", "/buyer-release-control-run", "/qa-buyer-proof-release", "/qa-manual-execution-console"],
    goNoGoGate:
      "Customer-specific proof must have permission, reviewer signoff, recipient scope, release authority, and access-log reconciliation before external sharing.",
    workaround:
      "Use public proof routes, synthetic evidence, and metadata-only protected summaries until customer release is approved.",
    hardStop:
      "Do not share named customer proof, confidential buyer artifacts, protected packets, or authenticated evidence without retained approval chain."
  }
];

export const launchDnsControls: LaunchDnsControl[] = [
  {
    name: "Sandbox DNS classifier",
    status: "fallback-contained",
    issue:
      "Restricted Codex sandbox execution can return getaddrinfo ENOTFOUND for app.scrimedsolutions.com even when the production app is reachable from an approved network.",
    detection:
      "The launch domain preflight first resolves the primary host, then requests health endpoints, then tests a fallback Vercel alias when the sandbox cannot resolve DNS.",
    primaryTarget: launchPrimaryDomain,
    fallbackTarget: launchFallbackDomain,
    command:
      "SCRIMED_PRIMARY_BASE_URL=https://app.scrimedsolutions.com SCRIMED_FALLBACK_BASE_URL=https://scrimed-site.vercel.app npm run smoke:launch-domain-preflight",
    passCondition:
      "Primary domain resolves and returns SCRIMED health/readiness, or sandbox DNS failure is explicitly classified while fallback health/readiness passes for internal continuity.",
    launchRule:
      "Fallback success is not sufficient for launch approval; unrestricted primary-domain smoke is still required.",
    workaround:
      "Request approved network execution for production smoke, run the fallback preflight for continuity evidence, and keep the branded domain as the buyer-facing target.",
    retainedBoundary: "This does not bypass DNS, alter external records, or convert fallback-only evidence into launch approval."
  },
  {
    name: "Strict production smoke",
    status: "strict-primary-required",
    issue:
      "A green local build does not prove the branded production app, headers, routes, protected fail-closed checks, and public pages are reachable.",
    detection:
      "Run the public production smoke against https://app.scrimedsolutions.com from a network that can resolve DNS.",
    primaryTarget: launchPrimaryDomain,
    fallbackTarget: launchFallbackDomain,
    command:
      "SCRIMED_BASE_URL=https://app.scrimedsolutions.com SCRIMED_WORKSPACE_SLUG=atlas-synthetic-evaluation npm run smoke:public",
    passCondition: "All public HTML routes, JSON APIs, Markdown briefs, headers, and protected fail-closed checks pass.",
    launchRule: "Required before external launch, buyer campaign activation, investor demo packet distribution, or board-readiness claim.",
    workaround:
      "If sandbox DNS blocks this command, rerun with approved network access and attach the preflight classification to the launch note.",
    retainedBoundary: "The smoke suite does not approve protected AAL2 happy-path mutations or production clinical authority."
  },
  {
    name: "Domain ownership and route fallback",
    status: "operator-required",
    issue:
      "Custom-domain routing, SSL, Vercel aliasing, and Wix CTA routing are external systems and can drift independently of source code.",
    detection:
      "Verify app.scrimedsolutions.com health, product, launch-readiness, and pilot routes after every DNS, Vercel, or Wix CTA change.",
    primaryTarget: launchPrimaryDomain,
    fallbackTarget: launchFallbackDomain,
    command:
      "curl -L --max-time 20 -s -I https://app.scrimedsolutions.com/api/launch-readiness",
    passCondition: "The branded domain returns launch-readiness headers and buyer routes load without Vercel-auth friction.",
    launchRule: "Buyer-facing launch material should use the branded domain only after this verification is current.",
    workaround:
      "Use direct Vercel deployment URLs or authenticated share links for internal review while branded DNS or CTA routing is repaired.",
    retainedBoundary: "Fallback routes are continuity aids, not a replacement for branded-domain launch readiness."
  }
];

export const launchServicePaths: LaunchServicePath[] = [
  {
    phase: "Public buyer entry",
    owner: "Founder + Product Console",
    requiredProof: "Homepage, Product Console, Offerings, Demos, Pilots, Pricing, and Pilot intake load from branded domain.",
    servicePosture: "Public, no-PHI, synthetic-only, claims-controlled.",
    customerVisibleOutput: "Clear buyer path from interest to product proof and pilot request.",
    internalFallback: "Share direct product, demo, pricing, and pilot URLs if Wix CTA routing is delayed."
  },
  {
    phase: "Guided demo and pilot scoping",
    owner: "Sales Engineering + Customer Operations",
    requiredProof: "Client Onboarding packets, demo scripts, meeting agendas, pilot workshop notes, and follow-up controls are ready.",
    servicePosture: "Human-reviewed communications, no automatic send, no calendar mutation.",
    customerVisibleOutput: "Professional demo, pilot scope, presentation, and next-step artifacts.",
    internalFallback: "Manual email/calendar send using approved no-PHI packets."
  },
  {
    phase: "Protected diligence and evidence",
    owner: "Buyer Diligence + TrustOps",
    requiredProof: "Protected workspace fail-closed publicly; AAL2 operator run produces no-secret retained proof when approved.",
    servicePosture: "AAL2 protected, tenant-scoped, no-PHI, metadata-only where external artifacts are referenced.",
    customerVisibleOutput: "Controlled diligence packet or public proof map, depending on release authority.",
    internalFallback: "Public proof routes and synthetic evidence summaries until protected release gates pass."
  },
  {
    phase: "Enterprise proposal and contract review",
    owner: "Legal Ops + Finance + Revenue Operations",
    requiredProof: "Enterprise Business Ops, price floors, margin controls, blocked claims, and qualified-review owners are attached.",
    servicePosture: "Non-binding until executive, legal, accounting, tax, and buyer authority reviews complete.",
    customerVisibleOutput: "Scope, proof, assumptions, price logic, retained boundaries, and review path.",
    internalFallback: "Readiness-only proposal packet and review calendar before formal contracting."
  },
  {
    phase: "Clinical and global expansion readiness",
    owner: "Clinical Governance + Regional Counsel + Security",
    requiredProof: "Approvals, Global Certification, Clinical Authority, Health Records, and Interoperability gates are visible.",
    servicePosture: "Preparation only until qualified external evidence exists.",
    customerVisibleOutput: "Region, approval, privacy, security, data, and clinical-authority plan.",
    internalFallback: "Synthetic, metadata-only, and external-reference evidence lanes until local approvals exist."
  }
];

export const launchRisks: LaunchRisk[] = [
  {
    risk: "Sandbox DNS false negative blocks confidence even when production is healthy.",
    severity: "high",
    owner: "Release Steward",
    containment:
      "Classify DNS lookup failure separately from application failure and require unrestricted-network smoke before launch approval.",
    graduationGate: "Primary branded domain resolves and public smoke passes from approved network."
  },
  {
    risk: "Fallback deployment URL could be mistaken for buyer-ready launch proof.",
    severity: "high",
    owner: "Product Console + Domain Administrator",
    containment:
      "Label fallback as continuity-only and keep branded-domain proof as the go/no-go requirement.",
    graduationGate: "Domain, SSL, Vercel alias, Wix CTA, and launch-readiness API headers verified."
  },
  {
    risk: "Launch breadth overwhelms first-time buyers or investors.",
    severity: "medium",
    owner: "Founder + Revenue Operations",
    containment:
      "Route audiences into Product, Offerings, Client Onboarding, Investor Readiness, or Pilot Deal Room instead of exposing the full route map first.",
    graduationGate: "Each launch audience has one packet, one proof ladder, one owner, and one next action."
  },
  {
    risk: "Product claims outrun approvals, certifications, or healthcare authority.",
    severity: "critical",
    owner: "TrustOS + Claim Guard + Qualified Reviewers",
    containment:
      "Keep no-authority headers, blocked claims, Claim Guard, approval tracks, and clinical/global gates visible in every launch-critical lane.",
    graduationGate: "External evidence and qualified reviewer signoff exist for any expanded claim."
  },
  {
    risk: "Service delivery grows faster than support, margin, or governance.",
    severity: "high",
    owner: "Customer Operations + Finance + Legal Ops",
    containment:
      "Tie every demo, pilot, assessment, and proposal to onboarding controls, price floors, support posture, and margin review.",
    graduationGate: "Repeatable onboarding, support, billing, contract, and margin processes are approved for the target segment."
  }
];

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function countTracksByStatus(status: LaunchReadinessTrack["status"]) {
  return launchReadinessTracks.filter((track) => track.status === status).length;
}

function countRisksBySeverity(severity: LaunchRisk["severity"]) {
  return launchRisks.filter((risk) => risk.severity === severity).length;
}

export function getLaunchReadinessSummary() {
  const releaseContinuitySummary = getReleaseContinuitySummary();
  const navigationAuditSummary = getNavigationAuditSummary();
  const serviceReliabilitySummary = getServiceReliabilitySummary();
  const operationalEfficiencySummary = getOperationalEfficiencySummary();
  const limitationsWorkaroundSummary = getLimitationsWorkaroundSummary();
  const productServicePortfolioSummary = getProductServicePortfolioSummary();
  const clientOnboardingCommunicationsSummary = getClientOnboardingCommunicationsSummary();
  const enterpriseBusinessOpsSummary = getEnterpriseBusinessOpsSummary();
  const enterpriseScalabilityOperationsSummary = getEnterpriseScalabilityOperationsSummary();
  const platformPowerSummary = getPlatformPowerSummary();
  const approvalsReadinessSummary = getApprovalsReadinessSummary();
  const globalCertificationReadinessSummary = getGlobalCertificationReadinessSummary();
  const healthRecordsSafetyExchangeSummary = getHealthRecordsSafetyExchangeSummary();
  const proofRoutes = unique([
    ...launchReadinessTracks.flatMap((track) => track.proofRoutes),
    releaseContinuitySummary.route,
    releaseContinuitySummary.apiRoute,
    navigationAuditSummary.route,
    navigationAuditSummary.apiRoute,
    serviceReliabilitySummary.route,
    operationalEfficiencySummary.route,
    limitationsWorkaroundSummary.route,
    productServicePortfolioSummary.route,
    clientOnboardingCommunicationsSummary.route,
    enterpriseBusinessOpsSummary.route,
    enterpriseScalabilityOperationsSummary.route,
    platformPowerSummary.route,
    approvalsReadinessSummary.route,
    globalCertificationReadinessSummary.route,
    healthRecordsSafetyExchangeSummary.route
  ]);
  const hardStops = unique(launchReadinessTracks.map((track) => track.hardStop));

  return {
    service: "scrimed-launch-readiness",
    route: launchReadinessRoute,
    apiRoute: launchReadinessApiRoute,
    briefRoute: launchReadinessBriefRoute,
    status: launchReadinessStatus,
    briefStatus: launchReadinessBriefStatus,
    boundary: launchReadinessBoundary,
    posture: "strict-primary-domain-launch-gate-with-contained-sandbox-dns-workaround",
    authority: {
      sandboxBypassAuthority: "not-authorized",
      dnsAuthority: "verification-and-routing-only",
      launchApprovalAuthority: "human-launch-review-required",
      fallbackAuthority: "continuity-only-not-launch-approval",
      dataBoundary: "synthetic-business-and-metadata-only",
      phiAuthority: "not-authorized-production-phi",
      clinicalCareAuthority: "not-authorized-live-care",
      connectorAuthority: "not-production-connector-approved",
      securityCertification: "not-security-certified",
      slaAuthority: "not-contractual-sla",
      legalAuthority: "qualified-review-required",
      accountingAuthority: "qualified-review-required",
      taxAuthority: "qualified-review-required",
      revenueAuthority: "not-revenue-guarantee",
      profitAuthority: "not-profit-margin-guarantee",
      customerReleaseAuthority: "customer-permission-and-release-control-required"
    },
    sourceAlignment: {
      releaseContinuityGateCount: releaseContinuitySummary.gateCount,
      releaseContinuityPassedCheckCount: releaseContinuitySummary.passedCheckCount,
      navigationPageRouteCount: navigationAuditSummary.sourceTotals.pageRouteCount,
      navigationApiRoutePatternCount: navigationAuditSummary.sourceTotals.apiRoutePatternCount,
      smokeCoveredHtmlRouteCount: navigationAuditSummary.coverage.smokeCoveredHtmlRouteCount,
      serviceReliabilityControlCount: serviceReliabilitySummary.controlCount,
      operationalEfficiencyRecordCount: operationalEfficiencySummary.recordCount,
      workaroundPacketCount: limitationsWorkaroundSummary.packetCount,
      productOfferCount: productServicePortfolioSummary.offerCount,
      onboardingStageCount: clientOnboardingCommunicationsSummary.stageCount,
      businessOpsRevenueCapabilityCount: enterpriseBusinessOpsSummary.revenueCapabilityCount,
      scaleControlCount: enterpriseScalabilityOperationsSummary.controlCount,
      platformPowerControlCount: platformPowerSummary.controlCount,
      approvalsTrackCount: approvalsReadinessSummary.trackCount,
      globalCertificationTrackCount: globalCertificationReadinessSummary.trackCount,
      healthRecordsCapabilityCount: healthRecordsSafetyExchangeSummary.capabilityCount
    },
    primaryDomain: launchPrimaryDomain,
    fallbackDomain: launchFallbackDomain,
    launchTrackCount: launchReadinessTracks.length,
    readyTrackCount: countTracksByStatus("ready"),
    containedTrackCount: countTracksByStatus("contained"),
    operatorRequiredTrackCount: countTracksByStatus("operator-required"),
    externalReviewRequiredTrackCount: countTracksByStatus("external-review-required"),
    dnsControlCount: launchDnsControls.length,
    strictDnsControlCount: launchDnsControls.filter(
      (control) => control.status === "strict-primary-required"
    ).length,
    fallbackDnsControlCount: launchDnsControls.filter(
      (control) => control.status === "fallback-contained"
    ).length,
    servicePathCount: launchServicePaths.length,
    riskCount: launchRisks.length,
    criticalRiskCount: countRisksBySeverity("critical"),
    highRiskCount: countRisksBySeverity("high"),
    proofRouteCount: proofRoutes.length,
    hardStopCount: hardStops.length,
    launchReadinessTracks,
    launchDnsControls,
    launchServicePaths,
    launchRisks,
    proofRoutes,
    hardStops,
    nextLaunchMove:
      "Use Launch Readiness before any public campaign, buyer demo day, investor packet release, or broader app launch: run build/typecheck/lint, run strict branded-domain public smoke from a network with DNS, run launch-domain preflight to classify sandbox ENOTFOUND separately, keep fallback evidence continuity-only, verify no-authority headers, keep protected AAL2 happy-path proof operator-only, and route unresolved legal, finance, clinical, security, certification, PHI, connector, SLA, customer-release, revenue, and profit claims through qualified review.",
    updated: launchReadinessUpdatedAt
  };
}

export function buildLaunchReadinessBrief() {
  const summary = getLaunchReadinessSummary();

  return [
    "# SCRIMED Launch Readiness Brief",
    "",
    `Status: ${summary.status}`,
    `Posture: ${summary.posture}`,
    `Primary domain: ${summary.primaryDomain}`,
    `Fallback domain: ${summary.fallbackDomain}`,
    `Launch tracks: ${summary.launchTrackCount}`,
    `Ready tracks: ${summary.readyTrackCount}`,
    `Contained tracks: ${summary.containedTrackCount}`,
    `Operator-required tracks: ${summary.operatorRequiredTrackCount}`,
    `External-review tracks: ${summary.externalReviewRequiredTrackCount}`,
    `DNS controls: ${summary.dnsControlCount}`,
    `Service paths: ${summary.servicePathCount}`,
    `Risks: ${summary.riskCount}`,
    `Critical risks: ${summary.criticalRiskCount}`,
    `High risks: ${summary.highRiskCount}`,
    `Proof routes: ${summary.proofRouteCount}`,
    `Hard stops: ${summary.hardStopCount}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "Fallback success is continuity evidence only. Launch approval still requires the branded domain to resolve and pass production smoke from an unrestricted or approved network. This brief does not bypass sandbox restrictions, override DNS, approve PHI processing, authorize live clinical care, certify security or compliance, create a contractual SLA, approve production connectors, approve customer release, or replace qualified human launch review.",
    "",
    "## DNS And Sandbox Controls",
    ...summary.launchDnsControls.map(
      (control) =>
        `- ${control.name} (${control.status}): ${control.issue} Command: ${control.command} Launch rule: ${control.launchRule} Workaround: ${control.workaround}`
    ),
    "",
    "## Launch Tracks",
    ...summary.launchReadinessTracks.map(
      (track) =>
        `- ${track.name} (${track.status}): ${track.launchQuestion} Control: ${track.control} Gate: ${track.goNoGoGate} Workaround: ${track.workaround} Hard stop: ${track.hardStop}`
    ),
    "",
    "## Service Paths",
    ...summary.launchServicePaths.map(
      (path) =>
        `- ${path.phase}: Owner: ${path.owner}. Proof: ${path.requiredProof}. Customer output: ${path.customerVisibleOutput}. Fallback: ${path.internalFallback}`
    ),
    "",
    "## Launch Risks",
    ...summary.launchRisks.map(
      (risk) =>
        `- ${risk.risk} (${risk.severity}): Owner: ${risk.owner}. Containment: ${risk.containment}. Gate: ${risk.graduationGate}`
    ),
    "",
    "## Next Launch Move",
    summary.nextLaunchMove,
    "",
    `Updated: ${summary.updated}`
  ].join("\n");
}
