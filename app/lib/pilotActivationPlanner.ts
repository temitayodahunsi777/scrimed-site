import { getClientOnboardingCommunicationsSummary } from "./clientOnboardingCommunications";
import { getLaunchReadinessSummary } from "./launchReadinessOperations";
import { getPilotDemoCommercialReadinessSummary } from "./pilotDemoCommercialReadiness";
import { getPilotValueEvidenceSummary } from "./pilotValueEvidence";
import { getServiceDeliverySummary } from "./serviceDelivery";
import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import { scrimedSafetyPolicyVersion } from "./scrimedSafetyGovernance";

export type PilotActivationDomain =
  | "buyer-qualification"
  | "commercial-scope"
  | "security-review"
  | "data-governance"
  | "clinical-governance"
  | "integration-readiness"
  | "implementation-operations"
  | "success-review";

export type PilotActivationReadiness =
  | "ready-for-scope"
  | "review-gated"
  | "external-approval-required"
  | "blocked-before-live";

export type PilotActivationMode =
  | "synthetic-only"
  | "protected-sandbox-planning"
  | "external-approval-required";

export type PilotActivationStep = {
  id: string;
  domain: PilotActivationDomain;
  name: string;
  buyerPrerequisite: string;
  scrimedPrerequisite: string;
  evidenceSource: string;
  requiredOwner: string;
  humanReviewGate: string;
  activationMode: PilotActivationMode;
  blockedActions: string[];
  proofRoutes: string[];
  readiness: PilotActivationReadiness;
  auditHash: string;
};

export type PilotActivationPlan = {
  id: string;
  name: string;
  buyerSegment: string;
  sourcePacket: string;
  activationThesis: string;
  includedSteps: string[];
  kickoffArtifacts: string[];
  successCriteria: string[];
  handoffOwner: string;
  retainedBoundary: string;
  nextAction: string;
  auditHash: string;
};

export type PilotActivationBlocker = {
  id: string;
  blocker: string;
  severity: "medium" | "high" | "critical";
  workaround: string;
  owner: string;
  releaseRequirement: string;
  proofRoute: string;
};

export type PilotActivationHandoff = {
  id: string;
  title: string;
  recipient: string;
  requiredInputs: string[];
  producedOutput: string;
  reviewBeforeSend: string;
};

export const pilotActivationPlannerRoute = "/pilot-activation-planner";
export const pilotActivationPlannerApiRoute = "/api/pilot-activation-planner";
export const pilotActivationPlannerBriefRoute = "/api/pilot-activation-planner/brief";
export const pilotActivationPlannerStatus =
  "pilot-activation-planner-active-synthetic-no-customer-go-live-authority";
export const pilotActivationPlannerBriefStatus =
  "pilot-activation-planner-brief-ready-no-production-activation-authority";
export const pilotActivationPlannerUpdatedAt = "2026-07-09";

export const pilotActivationPlannerBoundary =
  "SCRIMED Pilot Activation Planner turns synthetic pilot value evidence into review-gated activation plans, prerequisites, owners, blockers, handoffs, and success criteria. It does not authorize live PHI, autonomous clinical care, diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, final imaging interpretation, production deployment, customer activation, certification claims, audited financial reporting, valuation assurance, revenue guarantees, profit guarantees, ROI guarantees, binding commercial offers, or legal/procurement approval.";

const blockedPilotActivationActions = [
  "live PHI processing",
  "autonomous clinical care",
  "diagnosis, treatment, prescribing, or triage",
  "patient outreach without consent and human approval",
  "payer submission or coverage determination",
  "EHR, RIS, PACS, HIS, pharmacy, or production connector writeback",
  "final imaging interpretation",
  "production deployment or customer activation",
  "legal, procurement, or contract approval",
  "certification, legal, or regulatory approval claim",
  "audited financial statement",
  "ROI guarantee",
  "revenue guarantee",
  "profit guarantee",
  "valuation assurance",
  "binding commercial offer"
];

function activationHash(id: string, label: string) {
  return generateScrimedAuditHash({
    id,
    label,
    boundary: pilotActivationPlannerBoundary,
    policyVersion: scrimedSafetyPolicyVersion,
    updated: pilotActivationPlannerUpdatedAt
  });
}

function createStep(step: Omit<PilotActivationStep, "auditHash">): PilotActivationStep {
  return {
    ...step,
    auditHash: activationHash(step.id, step.name)
  };
}

function createPlan(plan: Omit<PilotActivationPlan, "auditHash">): PilotActivationPlan {
  return {
    ...plan,
    auditHash: activationHash(plan.id, plan.name)
  };
}

export function getPilotActivationPlannerSummary() {
  const valueEvidence = getPilotValueEvidenceSummary();
  const pilotReadiness = getPilotDemoCommercialReadinessSummary();
  const serviceDelivery = getServiceDeliverySummary();
  const onboarding = getClientOnboardingCommunicationsSummary();
  const launchReadiness = getLaunchReadinessSummary();

  const steps: PilotActivationStep[] = [
    createStep({
      id: "qualified-buyer-intake",
      domain: "buyer-qualification",
      name: "Qualified buyer intake validation",
      buyerPrerequisite: "Named buyer sponsor, use case, audience, timeline, and no-PHI pilot intent.",
      scrimedPrerequisite: "Pilot intake route, demo history, value evidence packet, and retained boundary summary.",
      evidenceSource: "Pilot Demo Commercial Readiness and Pilot Value Evidence.",
      requiredOwner: "Sales + Founder",
      humanReviewGate: "Founder review required before pilot scope is prepared.",
      activationMode: "synthetic-only",
      blockedActions: blockedPilotActivationActions,
      proofRoutes: [pilotReadiness.route, valueEvidence.route, "/pilot"],
      readiness: "ready-for-scope"
    }),
    createStep({
      id: "evidence-packet-selection",
      domain: "commercial-scope",
      name: "Evidence packet selection",
      buyerPrerequisite: "Buyer has selected a workflow, RCM, patient access, interoperability, or investor evidence packet.",
      scrimedPrerequisite: "Packet includes acceptance criteria, reviewer gate, blocked claims, and audit hash.",
      evidenceSource: "Pilot Value Evidence packet registry.",
      requiredOwner: "Delivery Lead",
      humanReviewGate: "Delivery lead confirms the packet matches the buyer problem before external sharing.",
      activationMode: "synthetic-only",
      blockedActions: blockedPilotActivationActions,
      proofRoutes: [valueEvidence.route, "/healthcare-value-realization", serviceDelivery.route],
      readiness: "review-gated"
    }),
    createStep({
      id: "nonbinding-commercial-scope",
      domain: "commercial-scope",
      name: "Non-binding pilot scope draft",
      buyerPrerequisite: "Buyer confirms pilot window, team availability, and acceptable synthetic/no-PHI boundaries.",
      scrimedPrerequisite: "Service delivery work order, acceptance criteria, pricing lane, and margin guardrails.",
      evidenceSource: "Service Delivery and Product Console.",
      requiredOwner: "Commercial Operations",
      humanReviewGate: "Qualified review required before sending any scope, pricing, or legal-adjacent language.",
      activationMode: "synthetic-only",
      blockedActions: blockedPilotActivationActions,
      proofRoutes: [serviceDelivery.route, "/pricing", "/offerings"],
      readiness: "review-gated"
    }),
    createStep({
      id: "security-privacy-review",
      domain: "security-review",
      name: "Security and privacy review packet",
      buyerPrerequisite: "Buyer security contact, questionnaire path, data classification, and deployment expectation.",
      scrimedPrerequisite: "Security diligence evidence, no-secret public proof, PHI boundary, and protected-route fail-closed posture.",
      evidenceSource: "Cyber Defense, Trust Center, and public smoke fail-closed checks.",
      requiredOwner: "Security + Trust",
      humanReviewGate: "Security reviewer approves packet before buyer security distribution.",
      activationMode: "external-approval-required",
      blockedActions: blockedPilotActivationActions,
      proofRoutes: ["/scrimed-cyber-defense", "/trust-center", "/deployment-drift-guard"],
      readiness: "external-approval-required"
    }),
    createStep({
      id: "data-governance-boundary",
      domain: "data-governance",
      name: "Data governance boundary confirmation",
      buyerPrerequisite: "Buyer confirms no live PHI and no raw connector payloads will be provided for this pilot phase.",
      scrimedPrerequisite: "Synthetic fixture plan, redaction boundary, data handling statement, and no-PHI validation.",
      evidenceSource: "Clinical Data Governance, Health Records Safety Exchange, and On-Device De-Identification controls.",
      requiredOwner: "Data Governance",
      humanReviewGate: "Data governance owner approves before any artifact crosses organizational boundary.",
      activationMode: "protected-sandbox-planning",
      blockedActions: blockedPilotActivationActions,
      proofRoutes: ["/clinical-data-governance", "/health-records", "/scrimed-intelligence-safety-stack"],
      readiness: "blocked-before-live"
    }),
    createStep({
      id: "clinical-governance-boundary",
      domain: "clinical-governance",
      name: "Clinical governance boundary confirmation",
      buyerPrerequisite: "Buyer clinical sponsor accepts decision-support-only, reviewer-gated, no-live-care pilot mode.",
      scrimedPrerequisite: "Clinical authority readiness, clinical production task ledger, and robustness lab evidence.",
      evidenceSource: "Clinical Production Readiness, Clinical Authority Readiness, and Clinical Robustness Lab.",
      requiredOwner: "Clinical Governance",
      humanReviewGate: "Clinical reviewer approves all clinical-facing language before sharing.",
      activationMode: "external-approval-required",
      blockedActions: blockedPilotActivationActions,
      proofRoutes: ["/clinical-production-readiness", "/clinical-authority-readiness", "/clinical-robustness-lab"],
      readiness: "blocked-before-live"
    }),
    createStep({
      id: "integration-readiness-discovery",
      domain: "integration-readiness",
      name: "Integration readiness discovery",
      buyerPrerequisite: "Buyer provides interface inventory at a metadata level only: FHIR, HL7, DICOM, X12, RIS, HIS, PACS, VPN, VM, database, and firewall context.",
      scrimedPrerequisite: "Interoperability readiness matrix, no-writeback boundary, and external approval blocker map.",
      evidenceSource: "Enterprise Healthcare Infrastructure and Clinical Data Fabric.",
      requiredOwner: "Interoperability + Security",
      humanReviewGate: "Integration security reviewer approves before technical discovery moves beyond metadata.",
      activationMode: "external-approval-required",
      blockedActions: blockedPilotActivationActions,
      proofRoutes: ["/enterprise-healthcare-infrastructure", "/clinical-data-fabric", "/pilot-value-evidence"],
      readiness: "external-approval-required"
    }),
    createStep({
      id: "implementation-kickoff-plan",
      domain: "implementation-operations",
      name: "Implementation kickoff plan",
      buyerPrerequisite: "Buyer names implementation owner, reviewer group, meeting cadence, and communication channel.",
      scrimedPrerequisite: "Onboarding communication packet, service delivery owner, pilot scope, and escalation path.",
      evidenceSource: "Client Onboarding Communications and Service Delivery.",
      requiredOwner: "Implementation Lead",
      humanReviewGate: "Implementation lead approves all meeting, email, calendar, and handoff drafts before send.",
      activationMode: "synthetic-only",
      blockedActions: blockedPilotActivationActions,
      proofRoutes: [onboarding.route, serviceDelivery.route, "/client-onboarding"],
      readiness: "ready-for-scope"
    }),
    createStep({
      id: "success-review-loop",
      domain: "success-review",
      name: "Pilot success review loop",
      buyerPrerequisite: "Buyer agrees to review packet outcomes, evidence gaps, and next milestone after the pilot window.",
      scrimedPrerequisite: "Success criteria, proof routes, reviewer checkpoints, and no-claim controls are attached.",
      evidenceSource: "Pilot Value Evidence and Healthcare Value Realization.",
      requiredOwner: "Customer Success + Founder",
      humanReviewGate: "Founder or qualified reviewer approves any outcome summary before external distribution.",
      activationMode: "synthetic-only",
      blockedActions: blockedPilotActivationActions,
      proofRoutes: [valueEvidence.route, "/healthcare-value-realization", "/investor-audience-readiness"],
      readiness: "review-gated"
    })
  ];

  const plans: PilotActivationPlan[] = [
    createPlan({
      id: "workflow-discovery-activation",
      name: "Workflow discovery activation plan",
      buyerSegment: "Clinical operations and CMIO",
      sourcePacket: "Workflow discovery evidence packet",
      activationThesis: "Move a buyer from demo interest to a 30-day no-PHI workflow discovery assessment.",
      includedSteps: [
        "qualified-buyer-intake",
        "evidence-packet-selection",
        "nonbinding-commercial-scope",
        "clinical-governance-boundary",
        "implementation-kickoff-plan",
        "success-review-loop"
      ],
      kickoffArtifacts: [
        "workflow evidence packet",
        "reviewer-gated acceptance criteria",
        "no-PHI pilot scope draft",
        "kickoff agenda"
      ],
      successCriteria: [
        "Buyer agrees to synthetic-only scope.",
        "Clinical reviewer gate is documented.",
        "Pilot outputs remain decision-support and measurement framework evidence."
      ],
      handoffOwner: "Clinical Workflow Delivery",
      retainedBoundary: "Not live clinical care, audited savings, staffing reduction guarantee, or customer activation.",
      nextAction: "Create buyer-specific workflow discovery packet and schedule human-reviewed scope call."
    }),
    createPlan({
      id: "rcm-documentation-activation",
      name: "RCM documentation activation plan",
      buyerSegment: "RCM and prior authorization teams",
      sourcePacket: "RCM documentation evidence packet",
      activationThesis: "Translate prior authorization and denial-review evidence into a review-gated RCM readiness pilot.",
      includedSteps: [
        "qualified-buyer-intake",
        "evidence-packet-selection",
        "nonbinding-commercial-scope",
        "security-privacy-review",
        "data-governance-boundary",
        "implementation-kickoff-plan",
        "success-review-loop"
      ],
      kickoffArtifacts: [
        "RCM documentation evidence map",
        "blocked payer submission statement",
        "reviewer role matrix",
        "draft acceptance rubric"
      ],
      successCriteria: [
        "No payer submission or claim submission occurs.",
        "Documentation completeness is scored against synthetic requirements only.",
        "RCM compliance reviewer approves external summaries."
      ],
      handoffOwner: "RCM Delivery",
      retainedBoundary: "No payer submission, claim submission, coverage determination, reimbursement guarantee, or payment assurance.",
      nextAction: "Attach buyer policy examples as synthetic metadata requirements, not live payer submission instructions."
    }),
    createPlan({
      id: "patient-access-activation",
      name: "Patient access activation plan",
      buyerSegment: "Patient access and care coordination",
      sourcePacket: "Patient access evidence packet",
      activationThesis: "Turn referral and follow-up evidence into a no-outreach patient access pilot plan.",
      includedSteps: [
        "qualified-buyer-intake",
        "evidence-packet-selection",
        "data-governance-boundary",
        "clinical-governance-boundary",
        "implementation-kickoff-plan",
        "success-review-loop"
      ],
      kickoffArtifacts: [
        "synthetic patient journey packet",
        "human review and consent boundary",
        "care coordination owner map",
        "follow-up risk rubric"
      ],
      successCriteria: [
        "No live patient outreach occurs.",
        "All patient-facing education remains draft and review-gated.",
        "Follow-up and referral signals remain synthetic or metadata-only."
      ],
      handoffOwner: "Patient Access Delivery",
      retainedBoundary: "No patient outreach, appointment scheduling command, care-plan modification, or patient-specific medical advice.",
      nextAction: "Prepare accessibility-aware synthetic journey demos for the buyer's care coordination lane."
    }),
    createPlan({
      id: "interoperability-discovery-activation",
      name: "Interoperability discovery activation plan",
      buyerSegment: "CIO, integration, security, and data governance teams",
      sourcePacket: "Interoperability diligence packet",
      activationThesis: "Convert integration complexity into metadata-only discovery, approval blockers, and technical owner mapping.",
      includedSteps: [
        "qualified-buyer-intake",
        "evidence-packet-selection",
        "security-privacy-review",
        "data-governance-boundary",
        "integration-readiness-discovery",
        "implementation-kickoff-plan",
        "success-review-loop"
      ],
      kickoffArtifacts: [
        "standards and interface inventory",
        "no-writeback statement",
        "security questionnaire packet",
        "approval blocker map"
      ],
      successCriteria: [
        "Only metadata-level interface information is used.",
        "No raw schemas or connector payloads are exposed.",
        "External technical approval remains required before implementation."
      ],
      handoffOwner: "Interoperability Delivery",
      retainedBoundary: "Not production connector approval, EHR writeback, raw schema review, or live PHI authorization.",
      nextAction: "Create a buyer-specific interoperability discovery worksheet."
    }),
    createPlan({
      id: "investor-diligence-activation",
      name: "Investor diligence activation plan",
      buyerSegment: "Angel, strategic, private, clinic, and partner investors",
      sourcePacket: "Investor diligence evidence packet",
      activationThesis: "Turn proof routes, buyer evidence, risk controls, and milestones into claims-safe investor diligence support.",
      includedSteps: [
        "qualified-buyer-intake",
        "evidence-packet-selection",
        "security-privacy-review",
        "nonbinding-commercial-scope",
        "success-review-loop"
      ],
      kickoffArtifacts: [
        "diligence proof manifest",
        "no-go boundary map",
        "validated route list",
        "next milestone ledger"
      ],
      successCriteria: [
        "No securities, valuation, or investment-advice language is included.",
        "No certification, customer activation, or production deployment claims are included.",
        "Every proof claim links to a route or reviewer gate."
      ],
      handoffOwner: "Founder + Investor Relations",
      retainedBoundary: "Not securities material, valuation assurance, investment advice, certification, or customer activation approval.",
      nextAction: "Prepare claims-safe investor appendix with validation commands and proof routes."
    })
  ];

  const blockers: PilotActivationBlocker[] = [
    {
      id: "missing-buyer-owner",
      blocker: "Buyer has not named a sponsor, reviewer, security contact, or implementation owner.",
      severity: "high",
      workaround: "Hold activation in discovery and request owner mapping before any scope language is sent.",
      owner: "Sales + Founder",
      releaseRequirement: "Named owners and meeting cadence.",
      proofRoute: onboarding.route
    },
    {
      id: "phi-requested-too-early",
      blocker: "Buyer requests live PHI, raw payloads, or production records before approval path is complete.",
      severity: "critical",
      workaround: "Use synthetic fixtures, metadata-only discovery, or de-identified examples after qualified review.",
      owner: "Data Governance + Security",
      releaseRequirement: "Approved data governance path, BAA/contract controls if applicable, and protected workspace evidence.",
      proofRoute: "/clinical-data-governance"
    },
    {
      id: "clinical-authority-gap",
      blocker: "Buyer wants diagnosis, treatment, prescribing, triage, or clinical action authority.",
      severity: "critical",
      workaround: "Keep the pilot decision-support-only and route live-care expansion to clinical authority readiness.",
      owner: "Clinical Governance",
      releaseRequirement: "Clinical governance signoff, validation evidence, and retained human final authority.",
      proofRoute: "/clinical-authority-readiness"
    },
    {
      id: "payer-action-gap",
      blocker: "Buyer wants payer submission, claim submission, or coverage determination.",
      severity: "critical",
      workaround: "Offer documentation completeness review and draft packet QA without submission.",
      owner: "RCM Compliance",
      releaseRequirement: "Human approval workflow and payer action authorization outside this public planner.",
      proofRoute: "/scrimed-clinical-benchmark-suite"
    },
    {
      id: "production-connector-gap",
      blocker: "Buyer wants live connector, EHR writeback, PACS/RIS/HIS writeback, or production integration.",
      severity: "critical",
      workaround: "Run metadata-only interoperability discovery and keep writeback blocked.",
      owner: "Interoperability + Security",
      releaseRequirement: "External technical approval, security review, connector contract, and protected activation evidence.",
      proofRoute: "/enterprise-healthcare-infrastructure"
    },
    {
      id: "commercial-claim-gap",
      blocker: "Buyer or investor asks for guaranteed ROI, revenue, profit, valuation, certification, or binding commercial approval.",
      severity: "high",
      workaround: "Use measurement-framework, readiness, and claims-safe language with qualified review.",
      owner: "Founder + Finance/Legal Review",
      releaseRequirement: "Qualified finance/legal review and evidence-backed language.",
      proofRoute: "/pilot-value-evidence"
    }
  ];

  const handoffs: PilotActivationHandoff[] = [
    {
      id: "scope-call-handoff",
      title: "Scope call handoff",
      recipient: "Buyer sponsor and SCRIMED delivery owner",
      requiredInputs: ["selected evidence packet", "buyer problem", "pilot window", "reviewer owners"],
      producedOutput: "Human-reviewed pilot scope call agenda.",
      reviewBeforeSend: "Founder or delivery lead approval required before external send."
    },
    {
      id: "security-review-handoff",
      title: "Security review handoff",
      recipient: "Buyer security and SCRIMED Trust/Security",
      requiredInputs: ["data classification", "deployment expectation", "questionnaire path", "no-PHI boundary"],
      producedOutput: "Security/privacy packet for qualified buyer review.",
      reviewBeforeSend: "Security owner approval required before distribution."
    },
    {
      id: "implementation-kickoff-handoff",
      title: "Implementation kickoff handoff",
      recipient: "Implementation lead and buyer operations owner",
      requiredInputs: ["acceptance criteria", "meeting cadence", "communication channel", "escalation path"],
      producedOutput: "No-PHI kickoff plan and reviewer matrix.",
      reviewBeforeSend: "Implementation lead approval required before scheduling or messaging."
    },
    {
      id: "success-review-handoff",
      title: "Success review handoff",
      recipient: "Buyer sponsor, delivery owner, and founder",
      requiredInputs: ["completed evidence artifacts", "review notes", "blocked claims", "next milestone"],
      producedOutput: "Claims-safe success review packet.",
      reviewBeforeSend: "Qualified reviewer approval required before buyer or investor distribution."
    }
  ];

  return {
    service: "scrimed-pilot-activation-planner",
    status: pilotActivationPlannerStatus,
    briefStatus: pilotActivationPlannerBriefStatus,
    route: pilotActivationPlannerRoute,
    apiRoute: pilotActivationPlannerApiRoute,
    briefRoute: pilotActivationPlannerBriefRoute,
    updated: pilotActivationPlannerUpdatedAt,
    boundary: pilotActivationPlannerBoundary,
    policyVersion: scrimedSafetyPolicyVersion,
    authority: {
      phiAuthority: "not-authorized-production-phi",
      clinicalCareAuthority: "not-authorized-live-care",
      commercialAuthority: "not-binding-commercial-offer",
      customerActivationAuthority: "not-customer-go-live-approval",
      productionAuthority: "not-production-authorized",
      payerAuthority: "not-authorized",
      ehrWritebackAuthority: "not-authorized",
      patientOutreachAuthority: "human-review-and-consent-required",
      financialAuthority: "not-audited-financial-report",
      roiAuthority: "not-roi-guarantee",
      revenueAuthority: "not-revenue-guarantee",
      legalAuthority: "qualified-review-required"
    },
    sourceAlignment: {
      pilotValueEvidenceStatus: valueEvidence.status,
      pilotValuePacketCount: valueEvidence.packetCount,
      pilotReadinessStatus: pilotReadiness.status,
      serviceDeliveryStatus: serviceDelivery.status,
      onboardingStatus: onboarding.status,
      launchReadinessStatus: launchReadiness.status
    },
    stepCount: steps.length,
    planCount: plans.length,
    blockerCount: blockers.length,
    handoffCount: handoffs.length,
    blockedActionCount: blockedPilotActivationActions.length,
    humanReviewRequiredCount: steps.length + plans.length + handoffs.length,
    externalApprovalRequiredCount: steps.filter(
      (step) => step.readiness === "external-approval-required" || step.activationMode === "external-approval-required"
    ).length,
    blockedBeforeLiveCount: steps.filter((step) => step.readiness === "blocked-before-live").length,
    proofRouteCount: new Set([
      ...steps.flatMap((step) => step.proofRoutes),
      ...blockers.map((blocker) => blocker.proofRoute)
    ]).size,
    steps,
    topSteps: steps.slice(0, 6),
    plans,
    topPlans: plans.slice(0, 4),
    blockers,
    handoffs,
    blockedActions: blockedPilotActivationActions,
    nextBestMove:
      "Choose the buyer segment, attach the matching evidence packet, confirm owners, run the blocker checklist, and prepare a human-reviewed kickoff agenda before any external commitment."
  };
}

export function buildPilotActivationPlannerBrief() {
  const summary = getPilotActivationPlannerSummary();

  return [
    "# SCRIMED Pilot Activation Planner Brief",
    "",
    `Status: ${summary.status}`,
    `Updated: ${summary.updated}`,
    `Activation steps: ${summary.stepCount}`,
    `Activation plans: ${summary.planCount}`,
    `Blockers: ${summary.blockerCount}`,
    `Handoffs: ${summary.handoffCount}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is synthetic-only pilot activation planning. It does not authorize live PHI, autonomous clinical care, diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, final imaging interpretation, production deployment, customer activation, certification claims, audited financial reporting, valuation assurance, revenue guarantees, profit guarantees, ROI guarantees, binding commercial offers, or legal/procurement approval.",
    "",
    "## Activation Plans",
    ...summary.plans.map(
      (plan) =>
        `- ${plan.name}: ${plan.activationThesis} Boundary: ${plan.retainedBoundary} Next: ${plan.nextAction}`
    ),
    "",
    "## Activation Steps",
    ...summary.topSteps.map(
      (step) =>
        `- ${step.name} (${step.readiness}, ${step.activationMode}): ${step.buyerPrerequisite} Review: ${step.humanReviewGate}`
    ),
    "",
    "## Blockers",
    ...summary.blockers.map(
      (blocker) =>
        `- ${blocker.blocker} (${blocker.severity}): ${blocker.workaround} Release requirement: ${blocker.releaseRequirement}`
    ),
    "",
    "## Handoffs",
    ...summary.handoffs.map(
      (handoff) =>
        `- ${handoff.title}: ${handoff.producedOutput} Review before send: ${handoff.reviewBeforeSend}`
    ),
    "",
    `Next best move: ${summary.nextBestMove}`
  ].join("\n");
}
