import { getOperationalEfficiencySummary } from "./operationalEfficiency";
import { getServiceDeliverySummary } from "./serviceDelivery";
import { getServiceReliabilitySummary } from "./serviceReliability";
import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import { scrimedSafetyPolicyVersion } from "./scrimedSafetyGovernance";

export type ScrimedAutomationAutopilotDomain =
  | "release-readiness"
  | "service-delivery"
  | "sales-revenue"
  | "agent-operations"
  | "security-governance"
  | "interoperability"
  | "clinical-safety"
  | "support-operations"
  | "cost-control"
  | "proof-packaging";

export type ScrimedAutomationAutopilotMode =
  | "manual-only"
  | "recommendation-only"
  | "review-gated-automation"
  | "synthetic-autopilot";

export type ScrimedAutomationAuthorityDecision =
  | "allow-synthetic-autopilot"
  | "require-human-review"
  | "block-production-action";

export type ScrimedAutomationAutopilotCapability = {
  id: string;
  name: string;
  domain: ScrimedAutomationAutopilotDomain;
  mode: ScrimedAutomationAutopilotMode;
  readinessScore: number;
  reliabilityScore: number;
  revenueImpactScore: number;
  bottleneckReductionScore: number;
  safetyRiskScore: number;
  allowedAutonomy: string[];
  blockedAutonomy: string[];
  triggerSignals: string[];
  approvalGate: string;
  humanReviewRequired: boolean;
  productionAuthority: false;
  owner: string;
  proofRoutes: string[];
  bottleneckReduced: string;
  nextAutomationStep: string;
  auditHash: string;
};

export type ScrimedAutomationBottleneckWorkaround = {
  id: string;
  bottleneck: string;
  currentLimit: string;
  safeWorkaround: string;
  automationAssist: string;
  escalationTrigger: string;
  owner: string;
  proofRoute: string;
};

export type ScrimedAutomationAutopilotDecision = {
  requestId: string;
  action: string;
  domain: ScrimedAutomationAutopilotDomain;
  decision: ScrimedAutomationAuthorityDecision;
  reason: string;
  requiredHumanApproval: boolean;
  allowedMode: ScrimedAutomationAutopilotMode;
  blockedActions: string[];
  auditHash: string;
};

export const scrimedAutomationAutopilotRoute = "/scrimed-automation-autopilot";
export const scrimedAutomationAutopilotApiRoute = "/api/scrimed-automation-autopilot";
export const scrimedAutomationAutopilotBriefRoute = "/api/scrimed-automation-autopilot/brief";
export const scrimedAutomationAutopilotStatus = "scrimed-automation-autopilot-active-synthetic-no-phi";
export const scrimedAutomationAutopilotBriefStatus = "scrimed-automation-autopilot-brief-ready";
export const scrimedAutomationAutopilotUpdatedAt = "2026-07-09";

export const scrimedAutomationAutopilotBoundary =
  "SCRIMED Automation Autopilot is a synthetic/no-PHI autonomy and automation readiness control plane. It can score readiness, recommend safe next actions, prepare proof packets, route approvals, and queue human-reviewed tasks. It does not process live PHI, perform autonomous clinical care, diagnose, treat, prescribe, contact patients, submit payer actions, write to EHRs, approve production connectors, rotate credentials, deploy production, guarantee revenue, guarantee uptime, or approve customer go-live.";

const universalBlockedAutonomy = [
  "live PHI processing",
  "autonomous diagnosis, treatment, prescribing, or triage",
  "patient outreach or external communications",
  "payer submission, claim submission, or prior authorization submission",
  "EHR, RIS, PACS, HIS, or production connector writeback",
  "credential rotation, IAM mutation, schema migration, or production deploy",
  "certification, validation, SLA, revenue, ROI, profit, or customer go-live claims"
];

function autopilotHash(id: string, domain: string, action: string) {
  return generateScrimedAuditHash({
    id,
    domain,
    action,
    boundary: scrimedAutomationAutopilotBoundary,
    policyVersion: scrimedSafetyPolicyVersion
  });
}

export const scrimedAutomationAutopilotCapabilities: ScrimedAutomationAutopilotCapability[] = [
  {
    id: "release-smoke-autopilot",
    name: "Release Smoke Autopilot",
    domain: "release-readiness",
    mode: "synthetic-autopilot",
    readinessScore: 92,
    reliabilityScore: 94,
    revenueImpactScore: 78,
    bottleneckReductionScore: 88,
    safetyRiskScore: 18,
    allowedAutonomy: [
      "run local no-secret contract checks",
      "compare source route counts with navigation inventory",
      "recommend stale-deployment remediation",
      "prepare release evidence summaries"
    ],
    blockedAutonomy: universalBlockedAutonomy,
    triggerSignals: ["route count drift", "public smoke failure", "brief route missing", "deployment drift"],
    approvalGate: "Human release steward must approve production deploy or external proof promotion.",
    humanReviewRequired: true,
    productionAuthority: false,
    owner: "Release Steward + Platform Engineering",
    proofRoutes: ["/release-continuity", "/deployment-drift-guard", "/navigation", "/api/status"],
    bottleneckReduced: "Manual route and smoke verification delay before buyer or investor proof promotion.",
    nextAutomationStep: "Generate a no-secret release checklist from the latest local validation run.",
    auditHash: autopilotHash("release-smoke-autopilot", "release-readiness", "prepare release evidence")
  },
  {
    id: "service-delivery-autopilot",
    name: "Service Delivery Autopilot",
    domain: "service-delivery",
    mode: "review-gated-automation",
    readinessScore: 89,
    reliabilityScore: 87,
    revenueImpactScore: 92,
    bottleneckReductionScore: 91,
    safetyRiskScore: 24,
    allowedAutonomy: [
      "draft no-PHI work orders",
      "map offers to acceptance criteria",
      "flag missing buyer inputs",
      "prepare kickoff and handoff checklists"
    ],
    blockedAutonomy: universalBlockedAutonomy,
    triggerSignals: ["scope creep", "missing acceptance criteria", "unsupported SLA language", "custom work without price floor"],
    approvalGate: "Delivery lead and qualified commercial reviewer approve SOW, contract language, and customer commitments.",
    humanReviewRequired: true,
    productionAuthority: false,
    owner: "Delivery Lead + Revenue Operations",
    proofRoutes: ["/service-delivery", "/offerings", "/client-onboarding", "/qa-claim-guard"],
    bottleneckReduced: "Manual conversion from demo interest to scoped, margin-safe delivery package.",
    nextAutomationStep: "Attach every sellable package to a repeatable no-PHI work-order starter.",
    auditHash: autopilotHash("service-delivery-autopilot", "service-delivery", "draft no-phi work orders")
  },
  {
    id: "buyer-follow-up-autopilot",
    name: "Buyer Follow-Up Autopilot",
    domain: "sales-revenue",
    mode: "recommendation-only",
    readinessScore: 84,
    reliabilityScore: 82,
    revenueImpactScore: 95,
    bottleneckReductionScore: 86,
    safetyRiskScore: 32,
    allowedAutonomy: [
      "draft buyer-safe follow-up summaries",
      "select proof packet routes",
      "recommend pricing motion",
      "queue human-reviewed next steps"
    ],
    blockedAutonomy: universalBlockedAutonomy,
    triggerSignals: ["demo completed without next step", "buyer objection unanswered", "pricing motion missing", "trust question unresolved"],
    approvalGate: "Human sales owner must approve and send all external communications.",
    humanReviewRequired: true,
    productionAuthority: false,
    owner: "Sales Operations + Founder",
    proofRoutes: ["/scrimed-guided-execution", "/pilot-deal-room", "/pricing", "/scrimed-proof-packet-studio"],
    bottleneckReduced: "Slow post-demo follow-up and inconsistent proof packet selection.",
    nextAutomationStep: "Create one human-reviewed follow-up packet per buyer audience.",
    auditHash: autopilotHash("buyer-follow-up-autopilot", "sales-revenue", "draft buyer follow-up")
  },
  {
    id: "agent-approval-autopilot",
    name: "Agent Approval Autopilot",
    domain: "agent-operations",
    mode: "review-gated-automation",
    readinessScore: 88,
    reliabilityScore: 90,
    revenueImpactScore: 75,
    bottleneckReductionScore: 83,
    safetyRiskScore: 36,
    allowedAutonomy: [
      "score agent action risk",
      "recommend allowed tools",
      "prepare audit packet",
      "route protected work to human approval"
    ],
    blockedAutonomy: universalBlockedAutonomy,
    triggerSignals: ["tool outside scope", "clinical-facing output", "external action", "cost threshold exceeded"],
    approvalGate: "Agent owner and human reviewer approve any irreversible or sensitive action.",
    humanReviewRequired: true,
    productionAuthority: false,
    owner: "AgentOS + TrustOS",
    proofRoutes: ["/scrimed-agent-governance", "/scrimed-intelligence-safety-stack", "/workflows/runtime-safety"],
    bottleneckReduced: "Manual classification of agent permissions and approval thresholds.",
    nextAutomationStep: "Precompute allow/deny/review decisions from session state before tool execution.",
    auditHash: autopilotHash("agent-approval-autopilot", "agent-operations", "route agent approvals")
  },
  {
    id: "security-evidence-autopilot",
    name: "Security Evidence Autopilot",
    domain: "security-governance",
    mode: "recommendation-only",
    readinessScore: 86,
    reliabilityScore: 89,
    revenueImpactScore: 82,
    bottleneckReductionScore: 80,
    safetyRiskScore: 29,
    allowedAutonomy: [
      "assemble security diligence evidence map",
      "flag missing controls",
      "prepare buyer questionnaire starters",
      "route claims to qualified review"
    ],
    blockedAutonomy: universalBlockedAutonomy,
    triggerSignals: ["security claim requested", "buyer questionnaire opened", "protected route changed", "token-handling proof requested"],
    approvalGate: "Security lead and qualified reviewer approve external trust language.",
    humanReviewRequired: true,
    productionAuthority: false,
    owner: "Security Lead + Trust Safety Ops",
    proofRoutes: ["/scrimed-cyber-defense", "/trust-center", "/qa-claim-guard"],
    bottleneckReduced: "Repeated security diligence packet assembly and claim review delay.",
    nextAutomationStep: "Bind security evidence to buyer-safe questionnaire answer starters.",
    auditHash: autopilotHash("security-evidence-autopilot", "security-governance", "prepare security evidence")
  },
  {
    id: "integration-readiness-autopilot",
    name: "Integration Readiness Autopilot",
    domain: "interoperability",
    mode: "recommendation-only",
    readinessScore: 81,
    reliabilityScore: 84,
    revenueImpactScore: 79,
    bottleneckReductionScore: 78,
    safetyRiskScore: 42,
    allowedAutonomy: [
      "map synthetic standards readiness",
      "flag connector approval gaps",
      "prepare no-PHI integration discovery questions",
      "recommend FHIR/HL7/DICOM evidence routes"
    ],
    blockedAutonomy: universalBlockedAutonomy,
    triggerSignals: ["connector requested", "FHIR scope missing", "DICOM/PACS claim requested", "raw payload logging risk"],
    approvalGate: "Interoperability owner, security, privacy, and customer system owner approve live connector movement.",
    humanReviewRequired: true,
    productionAuthority: false,
    owner: "Interoperability Control Plane + Security",
    proofRoutes: ["/enterprise-healthcare-infrastructure", "/health-records", "/interoperability", "/clinical-data-fabric"],
    bottleneckReduced: "Unclear transition from synthetic conformance to live integration requirements.",
    nextAutomationStep: "Generate a no-PHI connector discovery packet with retained production-approval blockers.",
    auditHash: autopilotHash("integration-readiness-autopilot", "interoperability", "prepare integration readiness")
  },
  {
    id: "clinical-safety-queue-autopilot",
    name: "Clinical Safety Queue Autopilot",
    domain: "clinical-safety",
    mode: "recommendation-only",
    readinessScore: 83,
    reliabilityScore: 86,
    revenueImpactScore: 76,
    bottleneckReductionScore: 77,
    safetyRiskScore: 55,
    allowedAutonomy: [
      "flag high-risk clinical-facing outputs",
      "require clinician review status",
      "prepare evidence completeness checklist",
      "recommend refusal or escalation wording"
    ],
    blockedAutonomy: universalBlockedAutonomy,
    triggerSignals: ["clinical recommendation requested", "missing evidence", "human review absent", "unsupported safety claim"],
    approvalGate: "Licensed clinical reviewer remains final authority for clinical content and workflow use.",
    humanReviewRequired: true,
    productionAuthority: false,
    owner: "Clinical Safety + Trust Engine",
    proofRoutes: ["/clinical-robustness-lab", "/clinical-authority-readiness", "/scrimed-clinical-benchmark-suite"],
    bottleneckReduced: "Late discovery of clinical-risk gaps in demos and synthetic evaluations.",
    nextAutomationStep: "Attach clinical safety queue metadata to every clinical-facing synthetic output.",
    auditHash: autopilotHash("clinical-safety-queue-autopilot", "clinical-safety", "route clinical safety review")
  },
  {
    id: "support-operations-autopilot",
    name: "Support Operations Autopilot",
    domain: "support-operations",
    mode: "manual-only",
    readinessScore: 74,
    reliabilityScore: 79,
    revenueImpactScore: 73,
    bottleneckReductionScore: 72,
    safetyRiskScore: 38,
    allowedAutonomy: [
      "recommend triage category",
      "draft internal support runbook",
      "flag missing escalation owner",
      "prepare incident review notes"
    ],
    blockedAutonomy: universalBlockedAutonomy,
    triggerSignals: ["buyer support expectation", "incident lane missing", "SLA language requested", "managed-service coverage implied"],
    approvalGate: "Support lead and contract reviewer approve support tier, SLA, and coverage commitments.",
    humanReviewRequired: true,
    productionAuthority: false,
    owner: "Service Reliability + Customer Operations",
    proofRoutes: ["/service-reliability", "/enterprise-scalability", "/trust-safety-operations"],
    bottleneckReduced: "Support commitment ambiguity before protected pilots and customer-facing services.",
    nextAutomationStep: "Create support-tier readiness packets before any managed-service language expands.",
    auditHash: autopilotHash("support-operations-autopilot", "support-operations", "prepare support runbook")
  },
  {
    id: "cost-guardrail-autopilot",
    name: "Cost Guardrail Autopilot",
    domain: "cost-control",
    mode: "synthetic-autopilot",
    readinessScore: 87,
    reliabilityScore: 85,
    revenueImpactScore: 86,
    bottleneckReductionScore: 81,
    safetyRiskScore: 22,
    allowedAutonomy: [
      "estimate synthetic workflow cost class",
      "flag budget-threshold risk",
      "recommend lower-cost routing for low-risk work",
      "prepare margin-protection notes"
    ],
    blockedAutonomy: universalBlockedAutonomy,
    triggerSignals: ["cost threshold exceeded", "model route too expensive", "uncapped custom work", "margin floor missing"],
    approvalGate: "Finance or founder approval required before paid provider spend, custom scope, or pricing exceptions expand.",
    humanReviewRequired: true,
    productionAuthority: false,
    owner: "Finance Ops + Model Router",
    proofRoutes: ["/platform-power", "/enterprise-business-ops", "/capital-vitality"],
    bottleneckReduced: "Unbounded AI/provider spend and margin leakage during demos and pilots.",
    nextAutomationStep: "Attach cost threshold classes to buyer demos and protected pilot packages.",
    auditHash: autopilotHash("cost-guardrail-autopilot", "cost-control", "estimate cost guardrails")
  },
  {
    id: "proof-packet-autopilot",
    name: "Proof Packet Autopilot",
    domain: "proof-packaging",
    mode: "review-gated-automation",
    readinessScore: 91,
    reliabilityScore: 88,
    revenueImpactScore: 93,
    bottleneckReductionScore: 90,
    safetyRiskScore: 26,
    allowedAutonomy: [
      "assemble audience-specific proof route list",
      "detect missing evidence",
      "draft no-PHI proof packet outline",
      "queue release and claims review"
    ],
    blockedAutonomy: universalBlockedAutonomy,
    triggerSignals: ["buyer asks for proof", "investor diligence packet needed", "claim evidence missing", "release sharing requested"],
    approvalGate: "Release steward and qualified reviewers approve any external proof distribution.",
    humanReviewRequired: true,
    productionAuthority: false,
    owner: "Proof Packet Studio + Buyer Diligence",
    proofRoutes: ["/scrimed-proof-packet-studio", "/qa-buyer-proof-release", "/buyer-release-control-run"],
    bottleneckReduced: "Slow conversion from platform evidence to buyer-safe or investor-safe packet.",
    nextAutomationStep: "Generate packet manifests that preserve claims, release, and no-PHI boundaries.",
    auditHash: autopilotHash("proof-packet-autopilot", "proof-packaging", "assemble proof packet")
  }
];

export const scrimedAutomationBottleneckWorkarounds: ScrimedAutomationBottleneckWorkaround[] = [
  {
    id: "go-live-approval-friction",
    bottleneck: "Customer go-live readiness can be confused with demo readiness.",
    currentLimit: "No customer go-live authority exists until customer-specific controls, contracts, security review, and support model are approved.",
    safeWorkaround: "Keep launches framed as no-PHI services, readiness assessments, demos, or protected-pilot candidates.",
    automationAssist: "Autopilot classifies service activation status and produces missing-evidence tasks.",
    escalationTrigger: "Any buyer asks to connect live systems, process PHI, or rely on SCRIMED for care delivery.",
    owner: "Release Steward + Delivery Lead",
    proofRoute: "/service-delivery"
  },
  {
    id: "manual-evidence-assembly",
    bottleneck: "Operator time is lost assembling the same proof routes for buyers, investors, and reviewers.",
    currentLimit: "Proof packets remain human-reviewed and cannot be externally distributed automatically.",
    safeWorkaround: "Autopilot drafts packet manifests and queues release review before sharing.",
    automationAssist: "Selects proof routes, claim boundaries, missing artifacts, and audience-specific next actions.",
    escalationTrigger: "External distribution, buyer-specific diligence, or claims language expansion is requested.",
    owner: "Proof Packet Studio + Claims Governance",
    proofRoute: "/scrimed-proof-packet-studio"
  },
  {
    id: "unsafe-autonomy-pressure",
    bottleneck: "Pressure to automate can blur safe internal automation and prohibited healthcare actions.",
    currentLimit: "High-risk clinical, payer, outreach, connector, credential, and production actions remain blocked.",
    safeWorkaround: "Autopilot emits allow/review/block decisions before action execution.",
    automationAssist: "Precomputes risk score, approval gate, blocked actions, and audit hash per capability.",
    escalationTrigger: "Action touches patient safety, legal, billing, external communication, infrastructure mutation, or production systems.",
    owner: "TrustOS + Security + Clinical Safety",
    proofRoute: "/scrimed-agent-governance"
  },
  {
    id: "cost-margin-leakage",
    bottleneck: "Custom work, provider spend, and model route expansion can erode pilot margins.",
    currentLimit: "Pricing exceptions and external provider spend require human finance review.",
    safeWorkaround: "Autopilot flags budget thresholds and routes low-risk synthetic work to cheaper model tiers.",
    automationAssist: "Creates cost-class metadata before buyer demos and protected pilot scope expands.",
    escalationTrigger: "Projected spend, custom scope, or model route exceeds the package guardrail.",
    owner: "Finance Ops + Model Router",
    proofRoute: "/enterprise-business-ops"
  }
];

export function evaluateScrimedAutomationAutopilotRequest(input: {
  requestId: string;
  action: string;
  domain: ScrimedAutomationAutopilotDomain;
  touchesPhi?: boolean;
  irreversible?: boolean;
  externalAction?: boolean;
  clinicalFacing?: boolean;
  productionTarget?: boolean;
}): ScrimedAutomationAutopilotDecision {
  const capability = scrimedAutomationAutopilotCapabilities.find((item) => item.domain === input.domain);
  const sensitive =
    Boolean(input.touchesPhi) ||
    Boolean(input.irreversible) ||
    Boolean(input.externalAction) ||
    Boolean(input.clinicalFacing) ||
    Boolean(input.productionTarget);

  const decision: ScrimedAutomationAuthorityDecision = input.touchesPhi || input.productionTarget
    ? "block-production-action"
    : sensitive
      ? "require-human-review"
      : "allow-synthetic-autopilot";

  return {
    requestId: input.requestId,
    action: input.action,
    domain: input.domain,
    decision,
    reason:
      decision === "allow-synthetic-autopilot"
        ? "The action is metadata-only, synthetic/no-PHI, reversible, and inside the declared autonomy scope."
        : decision === "require-human-review"
          ? "The action is sensitive and must be reviewed before any external, clinical-facing, irreversible, or commercial commitment."
          : "The action touches production authority or PHI risk and remains blocked under SCRIMED's preserved boundaries.",
    requiredHumanApproval: decision !== "allow-synthetic-autopilot",
    allowedMode: capability?.mode ?? "manual-only",
    blockedActions: universalBlockedAutonomy,
    auditHash: autopilotHash(input.requestId, input.domain, input.action)
  };
}

export function getScrimedAutomationAutopilotSummary() {
  const serviceDelivery = getServiceDeliverySummary();
  const reliability = getServiceReliabilitySummary();
  const efficiency = getOperationalEfficiencySummary();
  const capabilities = scrimedAutomationAutopilotCapabilities;
  const reviewRequiredCount = capabilities.filter((item) => item.humanReviewRequired).length;
  const productionAuthorityBlockedCount = capabilities.filter((item) => item.productionAuthority === false).length;
  const syntheticAutopilotCount = capabilities.filter((item) => item.mode === "synthetic-autopilot").length;
  const reviewGatedCount = capabilities.filter((item) => item.mode === "review-gated-automation").length;
  const averageReadinessScore = Math.round(
    capabilities.reduce((total, item) => total + item.readinessScore, 0) / capabilities.length
  );

  return {
    service: "scrimed-automation-autopilot",
    route: scrimedAutomationAutopilotRoute,
    apiRoute: scrimedAutomationAutopilotApiRoute,
    briefRoute: scrimedAutomationAutopilotBriefRoute,
    status: scrimedAutomationAutopilotStatus,
    briefStatus: scrimedAutomationAutopilotBriefStatus,
    updated: scrimedAutomationAutopilotUpdatedAt,
    boundary: scrimedAutomationAutopilotBoundary,
    policyVersion: scrimedSafetyPolicyVersion,
    capabilityCount: capabilities.length,
    averageReadinessScore,
    syntheticAutopilotCount,
    reviewGatedCount,
    reviewRequiredCount,
    productionAuthorityBlockedCount,
    bottleneckWorkaroundCount: scrimedAutomationBottleneckWorkarounds.length,
    sourceAlignment: {
      serviceDeliveryOfferCount: serviceDelivery.serviceDeliveryOffers.length,
      liveActivationPlanCount: serviceDelivery.liveActivationPlanCount,
      serviceReliabilityControlCount: reliability.controlCount,
      reliabilityFaultClassCount: reliability.faultClassCount,
      operationalEfficiencyRecordCount: efficiency.recordCount,
      openOperationalBottleneckCount: efficiency.openBottleneckCount
    },
    authority: {
      autonomyAuthority: "synthetic-and-review-gated-only",
      productionRemediationAuthority: "not-authorized",
      clinicalCareAuthority: "not-authorized-live-care",
      phiAuthority: "not-authorized-production-phi",
      payerSubmissionAuthority: "not-authorized",
      ehrWritebackAuthority: "not-authorized",
      customerGoLiveAuthority: "not-customer-go-live-approval",
      revenueAuthority: "not-revenue-guarantee",
      securityCertification: "not-security-certified"
    },
    capabilities,
    bottleneckWorkarounds: scrimedAutomationBottleneckWorkarounds,
    sampleDecisions: [
      evaluateScrimedAutomationAutopilotRequest({
        requestId: "synthetic-release-check",
        action: "run local release smoke and draft internal evidence summary",
        domain: "release-readiness"
      }),
      evaluateScrimedAutomationAutopilotRequest({
        requestId: "buyer-email-draft",
        action: "draft buyer follow-up after demo",
        domain: "sales-revenue",
        externalAction: true
      }),
      evaluateScrimedAutomationAutopilotRequest({
        requestId: "live-ehr-writeback",
        action: "write reviewed note into production EHR",
        domain: "interoperability",
        touchesPhi: true,
        productionTarget: true
      })
    ],
    nextOperatorActions: [
      "Use this surface before expanding autonomy so each automation has a mode, owner, approval gate, blocked actions, and proof routes.",
      "Promote only metadata-only, reversible, no-PHI automation into synthetic autopilot mode.",
      "Keep buyer follow-up, service delivery, proof packets, and clinical-facing artifacts human-reviewed before external use.",
      "Use the bottleneck workarounds to convert unsafe autonomy pressure into review queues, packet drafts, and scoped no-PHI service motions.",
      "Route any PHI, production connector, clinical care, payer, EHR, patient outreach, credential, deploy, SLA, or go-live request to the preserved approval path."
    ]
  };
}

export function buildScrimedAutomationAutopilotBrief() {
  const summary = getScrimedAutomationAutopilotSummary();

  return [
    "# SCRIMED Automation Autopilot Brief",
    "",
    `Status: ${summary.status}`,
    `Average readiness score: ${summary.averageReadinessScore}`,
    `Capabilities: ${summary.capabilityCount}`,
    `Synthetic autopilot lanes: ${summary.syntheticAutopilotCount}`,
    `Review-gated lanes: ${summary.reviewGatedCount}`,
    `Human-review-required lanes: ${summary.reviewRequiredCount}`,
    `Production-authority-blocked lanes: ${summary.productionAuthorityBlockedCount}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is recommendation-only and does not authorize live PHI, autonomous clinical care, diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, production connector approval, security certification, revenue guarantees, SLA commitments, production deploys, or customer go-live.",
    "",
    "## Autonomy Capabilities",
    ...summary.capabilities.map(
      (capability) =>
        `- ${capability.name} (${capability.mode}, ${capability.domain}): readiness ${capability.readinessScore}; owner ${capability.owner}; gate ${capability.approvalGate}; next ${capability.nextAutomationStep}; audit ${capability.auditHash}`
    ),
    "",
    "## Bottleneck Workarounds",
    ...summary.bottleneckWorkarounds.map(
      (workaround) =>
        `- ${workaround.bottleneck}: ${workaround.safeWorkaround} Automation assist: ${workaround.automationAssist} Escalation: ${workaround.escalationTrigger}`
    ),
    "",
    "## Sample Decisions",
    ...summary.sampleDecisions.map(
      (decision) =>
        `- ${decision.requestId}: ${decision.decision}; approval required ${decision.requiredHumanApproval}; reason ${decision.reason}; audit ${decision.auditHash}`
    ),
    "",
    "## Next Operator Actions",
    ...summary.nextOperatorActions.map((action) => `- ${action}`)
  ].join("\n");
}
