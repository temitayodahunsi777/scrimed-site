import { getCompanyAssessmentSummary } from "./companyAssessment";
import { getGlobalEnterpriseCommandSummary } from "./globalEnterpriseCommand";
import { getLimitationsWorkaroundSummary } from "./limitationsWorkaroundOperations";
import { getOperationalEfficiencySummary } from "./operationalEfficiency";
import { getScrimedAutomationAutopilotSummary } from "./scrimedAutomationAutopilot";
import { getServiceReliabilitySummary } from "./serviceReliability";
import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import { scrimedSafetyPolicyVersion } from "./scrimedSafetyGovernance";

export type StrategicProblemDomain =
  | "go-live-readiness"
  | "sales-conversion"
  | "global-expansion"
  | "interoperability"
  | "clinical-safety"
  | "security-diligence"
  | "automation"
  | "delivery-margin"
  | "release-quality"
  | "investor-proof";

export type StrategicProblemSeverity = "critical" | "high" | "medium";

export type StrategicResolutionStatus =
  | "ready-for-contained-execution"
  | "human-review-required"
  | "external-approval-required"
  | "blocked-until-evidence";

export type StrategicProblemRecord = {
  id: string;
  domain: StrategicProblemDomain;
  severity: StrategicProblemSeverity;
  title: string;
  problem: string;
  rootCause: string;
  businessImpact: string;
  resolutionPath: string;
  safeWorkaround: string;
  automationAssist: string;
  owner: string;
  proofRoutes: string[];
  blockedActions: string[];
  businessImpactScore: number;
  riskScore: number;
  urgencyScore: number;
  proofReadinessScore: number;
  priorityScore: number;
  status: StrategicResolutionStatus;
  nextAction: string;
  auditHash: string;
};

export type StrategicExecutionOperatingRule = {
  rule: string;
  purpose: string;
  enforcement: string;
  proofRoute: string;
};

export type StrategicResolutionSprint = {
  name: string;
  horizon: "now" | "7-days" | "30-days";
  objective: string;
  sequence: string[];
  successSignal: string;
  owner: string;
  retainedBoundary: string;
};

export const strategicProblemResolutionRoute = "/strategic-problem-resolution";
export const strategicProblemResolutionApiRoute = "/api/strategic-problem-resolution";
export const strategicProblemResolutionBriefRoute = "/api/strategic-problem-resolution/brief";
export const strategicProblemResolutionStatus =
  "strategic-problem-resolution-engine-active-no-production-authority";
export const strategicProblemResolutionBriefStatus =
  "strategic-problem-resolution-brief-ready-no-execution-claim";
export const strategicProblemResolutionUpdatedAt = "2026-07-09";

export const strategicProblemResolutionBoundary =
  "SCRIMED Strategic Problem Resolution Engine converts known weaknesses, bottlenecks, risks, launch constraints, global expansion gaps, sales friction, interoperability questions, automation pressure, and investor-proof needs into owner-bound execution records. It is an operating control plane only. It does not authorize live PHI, autonomous clinical care, diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, production connector approval, production deployment, legal approval, certification claims, securities claims, valuation assurance, revenue guarantees, profit guarantees, or customer go-live.";

const universalBlockedActions = [
  "live PHI processing",
  "autonomous diagnosis, treatment, prescribing, triage, or clinical action",
  "patient outreach or external communication without human approval",
  "payer submission, claim submission, or coverage determination",
  "EHR, RIS, PACS, HIS, or production connector writeback",
  "production deployment or customer go-live approval",
  "legal, tax, accounting, certification, valuation, revenue, profit, or securities claims"
];

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function calculatePriorityScore(input: {
  businessImpactScore: number;
  riskScore: number;
  urgencyScore: number;
  proofReadinessScore: number;
}) {
  return clampScore(
    input.businessImpactScore * 0.34 +
      input.riskScore * 0.28 +
      input.urgencyScore * 0.24 +
      input.proofReadinessScore * 0.14
  );
}

function strategicHash(id: string, resolutionPath: string) {
  return generateScrimedAuditHash({
    id,
    resolutionPath,
    boundary: strategicProblemResolutionBoundary,
    policyVersion: scrimedSafetyPolicyVersion,
    updated: strategicProblemResolutionUpdatedAt
  });
}

function createProblem(input: Omit<StrategicProblemRecord, "auditHash" | "priorityScore">) {
  const priorityScore = calculatePriorityScore(input);

  return {
    ...input,
    priorityScore,
    auditHash: strategicHash(input.id, input.resolutionPath)
  };
}

export function getStrategicProblemResolutionSummary() {
  const operationalEfficiency = getOperationalEfficiencySummary();
  const limitations = getLimitationsWorkaroundSummary();
  const reliability = getServiceReliabilitySummary();
  const companyAssessment = getCompanyAssessmentSummary();
  const automation = getScrimedAutomationAutopilotSummary();
  const globalCommand = getGlobalEnterpriseCommandSummary();

  const problems: StrategicProblemRecord[] = [
    createProblem({
      id: "clinical-production-boundary-pressure",
      domain: "clinical-safety",
      severity: "critical",
      title: "Clinical production pressure before approvals are complete",
      problem:
        "Buyer and founder pressure can blur synthetic-demo readiness with live clinical production readiness.",
      rootCause:
        "SCRIMED has many strong no-PHI proof surfaces, but clinical authority still depends on external approvals, customer governance, legal review, and validated clinical-safety evidence.",
      businessImpact:
        "Keeping this boundary crisp protects trust, investor diligence, health-system credibility, and long-term enterprise value.",
      resolutionPath:
        "Route every clinical-production request through Clinical Production Readiness, Clinical Authority Readiness, Global Certification Readiness, and protected customer-specific approval gates.",
      safeWorkaround:
        "Sell no-PHI workflow assessments, synthetic pilots, readiness packages, and protected-pilot candidates while approval evidence matures.",
      automationAssist:
        "Use Automation Autopilot to classify requests as allowed synthetic work, human-review-required, or blocked production action.",
      owner: "Clinical Safety + TrustOS + Founder",
      proofRoutes: [
        "/clinical-production-readiness",
        "/clinical-authority-readiness",
        "/global-certification-readiness",
        "/scrimed-automation-autopilot"
      ],
      blockedActions: universalBlockedActions,
      businessImpactScore: 96,
      riskScore: 98,
      urgencyScore: 94,
      proofReadinessScore: 82,
      status: "human-review-required",
      nextAction:
        "Add every live-care, PHI, diagnosis, treatment, prescribing, payer, or EHR request to the approval path before any sales or delivery promise expands."
    }),
    createProblem({
      id: "global-expansion-claim-control",
      domain: "global-expansion",
      severity: "high",
      title: "International expansion requires claims-safe localization",
      problem:
        "Global buyer interest can create pressure to imply local legal, regulatory, procurement, or public-sector approval before evidence exists.",
      rootCause:
        "Regional buyer narratives, partner authority, data residency, interoperability assumptions, and translation review must be synchronized.",
      businessImpact:
        "A governed international command lane increases global draw while reducing legal and trust risk.",
      resolutionPath:
        "Use Global Enterprise Command before regional outreach, partner qualification, public-sector conversations, or international buyer packets.",
      safeWorkaround:
        "Use localized no-PHI executive packets with explicit retained gates, human-reviewed language, and proof routes.",
      automationAssist:
        "Generate region command manifests, blocked-claim checks, and human-review communication tasks from metadata only.",
      owner: "Global Enterprise Lead + Legal/Privacy Reviewer",
      proofRoutes: [
        "/global-enterprise-command",
        "/global-reach",
        "/global-certification-readiness",
        "/client-onboarding"
      ],
      blockedActions: universalBlockedActions,
      businessImpactScore: 91,
      riskScore: 88,
      urgencyScore: 82,
      proofReadinessScore: globalCommand.averageRegionReadinessScore,
      status: "human-review-required",
      nextAction:
        "Package the top launch and strategic regions into localized, no-PHI, human-reviewed proof packets."
    }),
    createProblem({
      id: "sales-to-delivery-friction",
      domain: "sales-conversion",
      severity: "high",
      title: "Sales interest must convert into scoped, margin-safe delivery",
      problem:
        "Demos, buyer calls, and investor interest can produce vague next steps unless every conversation maps to a package, proof route, owner, and acceptance criteria.",
      rootCause:
        "SCRIMED has many valuable surfaces; the conversion risk is scattering buyer attention instead of routing to the correct paid path.",
      businessImpact:
        "Tight sales-to-delivery handoff improves revenue, margin discipline, buyer trust, and implementation velocity.",
      resolutionPath:
        "Route qualified interest through Pilot Demo Commercial Readiness, Service Delivery, Client Onboarding, Proof Packet Studio, and Growth Engine.",
      safeWorkaround:
        "Use no-PHI demo recap packets, predefined price bands, work-order templates, and human-approved follow-up before custom scope expands.",
      automationAssist:
        "Autopilot can draft internal packet manifests and follow-up recommendations, but humans send external communications.",
      owner: "Revenue Operations + Delivery Lead",
      proofRoutes: [
        "/pilot-demo-commercial-readiness",
        "/service-delivery",
        "/client-onboarding",
        "/scrimed-proof-packet-studio"
      ],
      blockedActions: universalBlockedActions,
      businessImpactScore: 94,
      riskScore: 72,
      urgencyScore: 91,
      proofReadinessScore: 88,
      status: "ready-for-contained-execution",
      nextAction:
        "Tie every demo to one recommended package, one price band, one proof packet, one owner, and one dated follow-up task."
    }),
    createProblem({
      id: "route-contract-drift",
      domain: "release-quality",
      severity: "high",
      title: "Route inventory drift can break buyer and operator confidence",
      problem:
        "A large route surface makes stale navigation, route-count drift, missing smoke coverage, and deployment mismatch more likely.",
      rootCause:
        "SCRIMED is expanding quickly, so every new command surface must update navigation, public smoke, contracts, and Product Console proof stack.",
      businessImpact:
        "Reliable navigation and smoke coverage protect demos, investor diligence, and launch posture.",
      resolutionPath:
        "Keep Navigation Audit, Release Continuity, Deployment Drift Guard, and public smoke as mandatory proof gates after route changes.",
      safeWorkaround:
        "Add contract checks before external promotion; treat stale deployment as contained until smoke passes on the target domain.",
      automationAssist:
        "Autopilot can run no-secret route checks and draft release evidence, but deploy promotion remains human-approved.",
      owner: "Release Steward + Platform Engineering",
      proofRoutes: ["/navigation", "/release-continuity", "/deployment-drift-guard", "/scrimed-automation-autopilot"],
      blockedActions: universalBlockedActions,
      businessImpactScore: 82,
      riskScore: 78,
      urgencyScore: 88,
      proofReadinessScore: 92,
      status: "ready-for-contained-execution",
      nextAction:
        "Run route inventory, generated integrity, typecheck, lint, build, and public smoke before any buyer-facing route promotion."
    }),
    createProblem({
      id: "interoperability-expectation-gap",
      domain: "interoperability",
      severity: "critical",
      title: "Health-system interoperability expectations must stay synthetic until approved",
      problem:
        "FHIR, HL7, DICOM, X12, PACS/RIS/HIS, ADT, integration engine, VPN, VM, database, and firewall questions can be mistaken for connector approval.",
      rootCause:
        "Enterprise buyers ask infrastructure-specific questions early, but live connectors require security, privacy, customer, regional, and production approvals.",
      businessImpact:
        "Clear interoperability planning wins technical trust without exposing SCRIMED to unsafe live-system commitments.",
      resolutionPath:
        "Answer with Enterprise Healthcare Infrastructure, Interoperability, Health Records, Platform Power, and Limitations Workarounds proof routes.",
      safeWorkaround:
        "Use synthetic conformance, architecture diagrams, connection questionnaires, and no-PHI fixture validation before live endpoints.",
      automationAssist:
        "Generate connector-readiness checklists and profile-selection tasks from metadata only.",
      owner: "Interoperability Lead + Security + Customer Technical Owner",
      proofRoutes: [
        "/enterprise-healthcare-infrastructure",
        "/interoperability",
        "/health-records",
        "/limitations-workarounds"
      ],
      blockedActions: universalBlockedActions,
      businessImpactScore: 93,
      riskScore: 94,
      urgencyScore: 84,
      proofReadinessScore: 80,
      status: "external-approval-required",
      nextAction:
        "Attach connector questions to a no-PHI technical diligence packet with explicit profile, license, security, and customer-approval gates."
    }),
    createProblem({
      id: "investor-proof-fragmentation",
      domain: "investor-proof",
      severity: "high",
      title: "Investor proof must show operating depth without overclaiming",
      problem:
        "A broad platform can look scattered unless its value, safety, proof routes, limitations, and next milestones are packaged coherently.",
      rootCause:
        "SCRIMED has many real diligence assets, but investor narratives need a concise proof hierarchy and blocked-claim discipline.",
      businessImpact:
        "Clear proof packaging improves investor confidence, enterprise buyer confidence, and partner credibility.",
      resolutionPath:
        "Use Investor Readiness, Product Console, Proof Packet Studio, Company Assessment, and Public Market Readiness to tell the evidence-backed story.",
      safeWorkaround:
        "Use investor-safe packets with route-backed evidence, milestone language, and no valuation/security/certification guarantees.",
      automationAssist:
        "Prepare packet manifests and missing-evidence lists, then route to human claim review before sharing.",
      owner: "Founder + Investor Diligence + Claim Guard",
      proofRoutes: [
        "/investor-audience-readiness",
        "/product",
        "/scrimed-proof-packet-studio",
        "/company-assessment"
      ],
      blockedActions: universalBlockedActions,
      businessImpactScore: 95,
      riskScore: 76,
      urgencyScore: 90,
      proofReadinessScore: 86,
      status: "human-review-required",
      nextAction:
        "Create a one-page investor proof ladder from Product Console, Public Market Readiness, and Proof Packet Studio."
    }),
    createProblem({
      id: "automation-authority-creep",
      domain: "automation",
      severity: "critical",
      title: "Automation must accelerate work without gaining unsafe authority",
      problem:
        "Agentic automation can reduce bottlenecks, but irreversible, clinical, payer, EHR, external, credential, or production actions cannot run autonomously.",
      rootCause:
        "The faster SCRIMED becomes, the more important scoped permissions, approval gates, and audit logs become.",
      businessImpact:
        "Safe automation improves speed and margins while preserving trust and enterprise defensibility.",
      resolutionPath:
        "Use Automation Autopilot, Agent Governance, TrustOps, and Runtime Safety to classify every action before execution.",
      safeWorkaround:
        "Allow metadata-only draft generation, internal packet assembly, and no-secret checks; require humans for external or irreversible steps.",
      automationAssist:
        "Autopilot provides allow/review/block decisions, but production authority remains blocked.",
      owner: "AgentOS + TrustOS + Security",
      proofRoutes: [
        "/scrimed-automation-autopilot",
        "/scrimed-agent-governance",
        "/scrimed-trustops",
        "/workflows/runtime-safety"
      ],
      blockedActions: universalBlockedActions,
      businessImpactScore: 91,
      riskScore: 96,
      urgencyScore: 87,
      proofReadinessScore: automation.averageReadinessScore,
      status: "human-review-required",
      nextAction:
        "Route new automation requests through the Autopilot decision evaluator before implementation."
    }),
    createProblem({
      id: "service-reliability-fault-containment",
      domain: "go-live-readiness",
      severity: "high",
      title: "Fault classes need owner-bound containment before launch posture expands",
      problem:
        "Reliability issues, open gates, and protected dependencies must not be hidden behind broad launch language.",
      rootCause:
        "Enterprise services require visible fault classes, owner assignments, fallback paths, and proof routes before external trust expands.",
      businessImpact:
        "Reliability transparency increases buyer trust and reduces operational surprises.",
      resolutionPath:
        "Keep Service Reliability, Operational Efficiency, Release Continuity, and Launch Readiness aligned before public promotion.",
      safeWorkaround:
        "Frame unresolved items as known gates with workarounds, owner, proof route, and graduation criteria.",
      automationAssist:
        "Generate owner-bound fault packets and route unresolved controls into the next operating sprint.",
      owner: "Service Reliability + Release Steward",
      proofRoutes: ["/service-reliability", "/operational-efficiency", "/release-continuity", "/launch-readiness"],
      blockedActions: universalBlockedActions,
      businessImpactScore: 84,
      riskScore: 82,
      urgencyScore: 86,
      proofReadinessScore: 84,
      status: "ready-for-contained-execution",
      nextAction:
        "Prioritize the highest-severity reliability control with an owner, workaround, proof route, and next validation command."
    })
  ].sort((left, right) => right.priorityScore - left.priorityScore);

  const operatingRules: StrategicExecutionOperatingRule[] = [
    {
      rule: "Every problem needs a root cause and proof route",
      purpose: "Prevent vague execution and make progress reviewable.",
      enforcement: "Reject problem records without rootCause, resolutionPath, owner, proofRoutes, and nextAction.",
      proofRoute: strategicProblemResolutionRoute
    },
    {
      rule: "Every blocked request gets a safe workaround",
      purpose: "Preserve momentum without crossing authority boundaries.",
      enforcement: "Route hard-stop requests to limitations, approvals, and human review instead of informal exceptions.",
      proofRoute: "/limitations-workarounds"
    },
    {
      rule: "Automation recommends; humans approve high-stakes actions",
      purpose: "Increase speed while preserving clinical, legal, payer, production, and security controls.",
      enforcement: "Require allow/review/block classification for each agentic workflow before execution.",
      proofRoute: "/scrimed-automation-autopilot"
    },
    {
      rule: "Investor and buyer claims must be evidence-bound",
      purpose: "Protect trust, diligence quality, and company value.",
      enforcement: "Use proof packets and claim guard before external distribution.",
      proofRoute: "/scrimed-proof-packet-studio"
    }
  ];

  const sprints: StrategicResolutionSprint[] = [
    {
      name: "P0 boundary clarity sprint",
      horizon: "now",
      objective:
        "Resolve clinical, PHI, production, payer, EHR, certification, and go-live ambiguity before any external promise expands.",
      sequence: [
        "Review top critical problems",
        "Attach proof routes",
        "Assign owner and next action",
        "Run no-secret validation",
        "Update buyer/investor packet language"
      ],
      successSignal: "No P0 request lacks owner, proof route, workaround, and blocked-action list.",
      owner: "Founder + TrustOS + Release Steward",
      retainedBoundary: strategicProblemResolutionBoundary
    },
    {
      name: "Revenue conversion sprint",
      horizon: "7-days",
      objective:
        "Convert sales and global interest into scoped packages, proof packets, and human-reviewed follow-up.",
      sequence: [
        "Pick top buyer segment",
        "Select offer and price band",
        "Build proof packet",
        "Draft human-reviewed follow-up",
        "Route security/procurement questions"
      ],
      successSignal: "Every demo has one package, one owner, one proof packet, and one dated next step.",
      owner: "Revenue Operations + Delivery Lead",
      retainedBoundary: "No contract, SLA, PHI, clinical, legal, revenue, or go-live authority is created."
    },
    {
      name: "Enterprise proof compounding sprint",
      horizon: "30-days",
      objective:
        "Turn repeated issue resolution into reusable proof, contracts, smoke checks, and buyer-safe operating evidence.",
      sequence: [
        "Harvest resolved problems",
        "Create regression or contract checks",
        "Update Product Console proof stack",
        "Update investor and buyer briefs",
        "Review residual risks"
      ],
      successSignal: "Resolved problems become reusable controls, not one-off memory.",
      owner: "Product Console + Engineering + Buyer Diligence",
      retainedBoundary: strategicProblemResolutionBoundary
    }
  ];

  const statusCounts = problems.reduce<Record<StrategicResolutionStatus, number>>(
    (counts, problem) => ({
      ...counts,
      [problem.status]: counts[problem.status] + 1
    }),
    {
      "ready-for-contained-execution": 0,
      "human-review-required": 0,
      "external-approval-required": 0,
      "blocked-until-evidence": 0
    }
  );

  return {
    service: "scrimed-strategic-problem-resolution",
    status: strategicProblemResolutionStatus,
    briefStatus: strategicProblemResolutionBriefStatus,
    route: strategicProblemResolutionRoute,
    apiRoute: strategicProblemResolutionApiRoute,
    briefRoute: strategicProblemResolutionBriefRoute,
    updated: strategicProblemResolutionUpdatedAt,
    boundary: strategicProblemResolutionBoundary,
    policyVersion: scrimedSafetyPolicyVersion,
    sourceAlignment: {
      operationalEfficiencyStatus: operationalEfficiency.status,
      limitationTrackCount: limitations.trackCount,
      serviceReliabilityControlCount: reliability.controlCount,
      companyAssessmentScore: companyAssessment.overallScore,
      automationAutopilotReadinessScore: automation.averageReadinessScore,
      globalEnterpriseReadinessScore: globalCommand.averageRegionReadinessScore
    },
    problemCount: problems.length,
    criticalProblemCount: problems.filter((problem) => problem.severity === "critical").length,
    highProblemCount: problems.filter((problem) => problem.severity === "high").length,
    averagePriorityScore: clampScore(
      problems.reduce((total, problem) => total + problem.priorityScore, 0) / problems.length
    ),
    humanReviewRequiredCount: statusCounts["human-review-required"],
    externalApprovalRequiredCount: statusCounts["external-approval-required"],
    containedExecutionCount: statusCounts["ready-for-contained-execution"],
    operatingRuleCount: operatingRules.length,
    sprintCount: sprints.length,
    proofRouteCount: new Set(problems.flatMap((problem) => problem.proofRoutes)).size,
    blockedActionCount: universalBlockedActions.length,
    authority: {
      problemResolutionAuthority: "recommendation-and-control-plane-only",
      productionAuthority: "not-production-authorized",
      phiAuthority: "not-authorized-production-phi",
      clinicalCareAuthority: "not-authorized-live-care",
      communicationAuthority: "human-review-required-before-send",
      payerAuthority: "not-authorized",
      ehrWritebackAuthority: "not-authorized",
      certificationAuthority: "not-certified",
      valuationAuthority: "not-valuation-assurance"
    },
    problems,
    topProblems: problems.slice(0, 5),
    operatingRules,
    sprints,
    blockedActions: universalBlockedActions,
    nextBuildStep:
      "Turn the highest-priority problem into a reusable proof packet, contract check, owner-bound sprint, and Product Console evidence update before expanding external claims."
  };
}

export function buildStrategicProblemResolutionBrief() {
  const summary = getStrategicProblemResolutionSummary();

  return [
    "# SCRIMED Strategic Problem Resolution Brief",
    "",
    `Status: ${summary.status}`,
    `Updated: ${summary.updated}`,
    `Problems: ${summary.problemCount}`,
    `Critical problems: ${summary.criticalProblemCount}`,
    `Average priority score: ${summary.averagePriorityScore}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief supports operating discipline and founder-grade execution only. It does not authorize live PHI, autonomous clinical care, diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, production deployment, certification claims, securities claims, valuation assurance, revenue guarantees, profit guarantees, or customer go-live.",
    "",
    "## Top Problems",
    ...summary.topProblems.map(
      (problem) =>
        `- ${problem.title} (${problem.priorityScore}, ${problem.status}): ${problem.nextAction} Proof: ${problem.proofRoutes.join(", ")}`
    ),
    "",
    "## Operating Rules",
    ...summary.operatingRules.map(
      (rule) => `- ${rule.rule}: ${rule.enforcement} Proof: ${rule.proofRoute}`
    ),
    "",
    "## Resolution Sprints",
    ...summary.sprints.map(
      (sprint) =>
        `- ${sprint.name} (${sprint.horizon}): ${sprint.objective} Success: ${sprint.successSignal}`
    ),
    "",
    "## Blocked Actions",
    ...summary.blockedActions.map((action) => `- ${action}`),
    "",
    `Next build step: ${summary.nextBuildStep}`
  ].join("\n");
}
