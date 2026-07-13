import { getClientOnboardingCommunicationsSummary } from "./clientOnboardingCommunications";
import { getPilotActivationPlannerSummary } from "./pilotActivationPlanner";
import { getServiceDeliverySummary } from "./serviceDelivery";
import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import { scrimedSafetyPolicyVersion } from "./scrimedSafetyGovernance";

export type PilotHandoffAudience =
  | "buyer-sponsor"
  | "security-reviewer"
  | "clinical-governance"
  | "implementation-owner"
  | "rcm-lead"
  | "investor-reviewer"
  | "internal-founder";

export type PilotHandoffStatus =
  | "draft-ready"
  | "review-required"
  | "external-approval-required"
  | "blocked-before-send";

export type PilotHandoffAuthorityFlags = {
  phiAuthority: "not-authorized-production-phi";
  clinicalCareAuthority: "not-authorized-live-care";
  externalSendAuthority: "human-review-required";
  patientOutreachAuthority: "human-review-and-consent-required";
  payerAuthority: "not-authorized";
  ehrWritebackAuthority: "not-authorized";
  commercialAuthority: "not-binding-commercial-offer";
  customerActivationAuthority: "not-customer-go-live-approval";
  legalAuthority: "qualified-review-required";
};

export type PilotHandoffPacket = {
  id: string;
  title: string;
  audience: PilotHandoffAudience;
  sourcePlanId: string;
  sourceStepIds: string[];
  purpose: string;
  requiredInputs: string[];
  producedOutputs: string[];
  reviewGate: string;
  deliveryChannel: string;
  allowedUse: string;
  blockedUse: string;
  status: PilotHandoffStatus;
  authorityFlags: PilotHandoffAuthorityFlags;
  proofRoutes: string[];
  auditHash: string;
};

export type PilotHandoffChecklistItem = {
  id: string;
  category: "buyer-readiness" | "security" | "clinical-governance" | "implementation" | "commercial" | "success-review";
  requirement: string;
  owner: string;
  status: PilotHandoffStatus;
  evidenceRoute: string;
  hardStopIfMissing: boolean;
};

export type PilotHandoffRiskControl = {
  id: string;
  risk: string;
  control: string;
  owner: string;
  hardStop: boolean;
  proofRoute: string;
};

export const pilotHandoffCommandRoute = "/pilot-handoff-command";
export const pilotHandoffCommandApiRoute = "/api/pilot-handoff-command";
export const pilotHandoffCommandBriefRoute = "/api/pilot-handoff-command/brief";
export const pilotHandoffCommandStatus =
  "pilot-handoff-command-active-synthetic-human-review-required";
export const pilotHandoffCommandBriefStatus =
  "pilot-handoff-command-brief-ready-no-external-send-authority";
export const pilotHandoffCommandUpdatedAt = "2026-07-09";

export const pilotHandoffCommandBoundary =
  "SCRIMED Pilot Handoff Command converts synthetic pilot activation plans into role-specific handoff packets, review gates, owner checklists, and safe next actions. It does not send external communications, authorize live PHI, approve patient outreach, submit payer actions, mutate EHR/RIS/PACS/HIS records, grant live clinical authority, approve customer activation, certify compliance, create audited financial reporting, guarantee ROI, guarantee revenue, guarantee profit, assure valuation, or create binding commercial offers.";

const authorityFlags: PilotHandoffAuthorityFlags = {
  phiAuthority: "not-authorized-production-phi",
  clinicalCareAuthority: "not-authorized-live-care",
  externalSendAuthority: "human-review-required",
  patientOutreachAuthority: "human-review-and-consent-required",
  payerAuthority: "not-authorized",
  ehrWritebackAuthority: "not-authorized",
  commercialAuthority: "not-binding-commercial-offer",
  customerActivationAuthority: "not-customer-go-live-approval",
  legalAuthority: "qualified-review-required"
};

const blockedHandoffActions = [
  "external send without human review",
  "live PHI processing",
  "patient outreach without consent and human approval",
  "autonomous clinical care",
  "diagnosis, treatment, prescribing, or triage",
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

function handoffHash(id: string, label: string) {
  return generateScrimedAuditHash({
    id,
    label,
    boundary: pilotHandoffCommandBoundary,
    policyVersion: scrimedSafetyPolicyVersion,
    updated: pilotHandoffCommandUpdatedAt
  });
}

function createPacket(packet: Omit<PilotHandoffPacket, "auditHash" | "authorityFlags">): PilotHandoffPacket {
  return {
    ...packet,
    authorityFlags,
    auditHash: handoffHash(packet.id, packet.title)
  };
}

export function getPilotHandoffCommandSummary() {
  const activation = getPilotActivationPlannerSummary();
  const onboarding = getClientOnboardingCommunicationsSummary();
  const serviceDelivery = getServiceDeliverySummary();

  const packets: PilotHandoffPacket[] = [
    createPacket({
      id: "buyer-sponsor-scope-handoff",
      title: "Buyer sponsor scope handoff",
      audience: "buyer-sponsor",
      sourcePlanId: "workflow-discovery-activation",
      sourceStepIds: ["qualified-buyer-intake", "evidence-packet-selection", "nonbinding-commercial-scope"],
      purpose: "Prepare a buyer-safe scope call packet that maps the selected evidence packet to the pilot objective, owner map, and no-PHI activation path.",
      requiredInputs: ["buyer problem", "selected evidence packet", "pilot window", "named sponsor", "reviewer owner"],
      producedOutputs: ["scope-call agenda", "owner map", "acceptance criteria draft", "blocked authority note"],
      reviewGate: "Founder or delivery lead approval required before any external send.",
      deliveryChannel: "Human-reviewed email, meeting agenda, or buyer room note only.",
      allowedUse: "Buyer-facing planning and meeting preparation after human review.",
      blockedUse: "No contract approval, pricing commitment, customer activation, live PHI request, or external send without review.",
      status: "review-required",
      proofRoutes: [activation.route, activation.briefRoute, "/pilot-value-evidence", onboarding.route]
    }),
    createPacket({
      id: "security-review-handoff",
      title: "Security and privacy review handoff",
      audience: "security-reviewer",
      sourcePlanId: "interoperability-discovery-activation",
      sourceStepIds: ["security-privacy-review", "data-governance-boundary", "integration-readiness-discovery"],
      purpose: "Collect safe security, privacy, deployment, and data-boundary context before buyer questionnaires or technical discovery progress.",
      requiredInputs: ["security contact", "deployment expectation", "data classification", "questionnaire path", "no-PHI confirmation"],
      producedOutputs: ["security review packet", "data-boundary note", "questionnaire response queue", "technical approval blockers"],
      reviewGate: "Security owner approval required before buyer security distribution.",
      deliveryChannel: "Protected buyer room or human-reviewed email draft only.",
      allowedUse: "Security diligence preparation with synthetic or metadata-only evidence.",
      blockedUse: "No raw schemas, credentials, connector payloads, live PHI, or production integration approval.",
      status: "external-approval-required",
      proofRoutes: [activation.route, "/scrimed-cyber-defense", "/enterprise-healthcare-infrastructure", "/clinical-data-governance"]
    }),
    createPacket({
      id: "clinical-governance-handoff",
      title: "Clinical governance handoff",
      audience: "clinical-governance",
      sourcePlanId: "workflow-discovery-activation",
      sourceStepIds: ["clinical-governance-boundary", "success-review-loop"],
      purpose: "Prepare clinical sponsor review of decision-support-only boundaries, reviewer roles, and no-live-care pilot language.",
      requiredInputs: ["clinical sponsor", "use case", "reviewer role", "decision-support boundary", "synthetic demo evidence"],
      producedOutputs: ["clinical governance note", "reviewer checklist", "clinical boundary language", "escalation criteria"],
      reviewGate: "Clinical governance owner approval required before clinical-facing language is shared.",
      deliveryChannel: "Human-reviewed clinical governance packet only.",
      allowedUse: "Clinical workflow planning and reviewer alignment.",
      blockedUse: "No diagnosis, treatment, prescribing, triage, final imaging interpretation, or live clinical action.",
      status: "blocked-before-send",
      proofRoutes: [activation.route, "/clinical-production-readiness", "/clinical-authority-readiness", "/clinical-robustness-lab"]
    }),
    createPacket({
      id: "implementation-kickoff-handoff",
      title: "Implementation kickoff handoff",
      audience: "implementation-owner",
      sourcePlanId: "patient-access-activation",
      sourceStepIds: ["implementation-kickoff-plan", "success-review-loop"],
      purpose: "Translate activation scope into implementation cadence, owners, artifacts, escalation path, and meeting-ready agenda.",
      requiredInputs: ["implementation owner", "communication channel", "meeting cadence", "acceptance criteria", "escalation path"],
      producedOutputs: ["kickoff agenda", "reviewer matrix", "artifact tracker", "success review calendar draft"],
      reviewGate: "Implementation lead approval required before scheduling or messaging.",
      deliveryChannel: "Human-reviewed agenda or internal workspace packet.",
      allowedUse: "Internal and buyer implementation coordination after review.",
      blockedUse: "No automated calendar invite, patient outreach, production access, or live system activation.",
      status: "draft-ready",
      proofRoutes: [activation.route, serviceDelivery.route, onboarding.route, "/launch-readiness"]
    }),
    createPacket({
      id: "rcm-review-handoff",
      title: "RCM documentation review handoff",
      audience: "rcm-lead",
      sourcePlanId: "rcm-documentation-activation",
      sourceStepIds: ["evidence-packet-selection", "data-governance-boundary", "success-review-loop"],
      purpose: "Prepare a documentation-completeness review packet for RCM and prior authorization teams without payer submission authority.",
      requiredInputs: ["workflow lane", "synthetic documentation scenario", "review owner", "payer-policy metadata boundary"],
      producedOutputs: ["documentation completeness checklist", "prior-auth risk note", "review queue", "blocked submission statement"],
      reviewGate: "RCM compliance reviewer approval required before buyer distribution.",
      deliveryChannel: "Human-reviewed RCM packet only.",
      allowedUse: "Documentation readiness review and workflow gap analysis.",
      blockedUse: "No claim submission, payer submission, coverage determination, reimbursement assurance, or payment execution.",
      status: "external-approval-required",
      proofRoutes: [activation.route, "/scrimed-clinical-benchmark-suite", "/healthcare-value-realization", "/pilot-value-evidence"]
    }),
    createPacket({
      id: "investor-diligence-handoff",
      title: "Investor diligence handoff",
      audience: "investor-reviewer",
      sourcePlanId: "investor-diligence-activation",
      sourceStepIds: ["evidence-packet-selection", "security-privacy-review", "success-review-loop"],
      purpose: "Convert route-backed product proof, boundaries, milestones, and validation commands into a claims-safe investor diligence appendix.",
      requiredInputs: ["audience type", "proof routes", "risk register", "validation commands", "next milestone"],
      producedOutputs: ["investor appendix outline", "proof route table", "boundary map", "milestone ledger"],
      reviewGate: "Founder and qualified reviewer approval required before investor distribution.",
      deliveryChannel: "Human-reviewed diligence packet only.",
      allowedUse: "Investor diligence support and internal preparation.",
      blockedUse: "No securities material, investment advice, valuation assurance, customer activation claim, or audited financial reporting.",
      status: "review-required",
      proofRoutes: [activation.route, "/investor-audience-readiness", "/investor-readiness", "/risk-register"]
    })
  ];

  const checklist: PilotHandoffChecklistItem[] = [
    {
      id: "named-buyer-owner",
      category: "buyer-readiness",
      requirement: "Buyer sponsor, reviewer owner, security contact, and implementation owner are named.",
      owner: "Sales + Founder",
      status: "review-required",
      evidenceRoute: onboarding.route,
      hardStopIfMissing: true
    },
    {
      id: "selected-evidence-packet",
      category: "buyer-readiness",
      requirement: "Selected evidence packet has acceptance criteria, blocked claims, review gate, and audit hash.",
      owner: "Delivery Lead",
      status: "draft-ready",
      evidenceRoute: "/pilot-value-evidence",
      hardStopIfMissing: true
    },
    {
      id: "security-data-boundary",
      category: "security",
      requirement: "No live PHI, raw connector payloads, credentials, or raw schemas are requested for this handoff phase.",
      owner: "Security + Data Governance",
      status: "external-approval-required",
      evidenceRoute: "/clinical-data-governance",
      hardStopIfMissing: true
    },
    {
      id: "clinical-language-review",
      category: "clinical-governance",
      requirement: "Clinical-facing language is framed as decision support, education, workflow support, or review-gated draft output.",
      owner: "Clinical Governance",
      status: "blocked-before-send",
      evidenceRoute: "/clinical-authority-readiness",
      hardStopIfMissing: true
    },
    {
      id: "implementation-cadence",
      category: "implementation",
      requirement: "Meeting cadence, escalation path, artifact tracker, and success review checkpoint are documented.",
      owner: "Implementation Lead",
      status: "review-required",
      evidenceRoute: serviceDelivery.route,
      hardStopIfMissing: false
    },
    {
      id: "commercial-claim-control",
      category: "commercial",
      requirement: "Scope language avoids binding offers, ROI guarantees, revenue guarantees, valuation assurance, and customer activation claims.",
      owner: "Commercial Operations + Qualified Review",
      status: "review-required",
      evidenceRoute: activation.route,
      hardStopIfMissing: true
    },
    {
      id: "success-review-plan",
      category: "success-review",
      requirement: "Success criteria, reviewer notes, blocked claims, and next milestone are attached before any outcome narrative is shared.",
      owner: "Customer Success + Founder",
      status: "review-required",
      evidenceRoute: "/healthcare-value-realization",
      hardStopIfMissing: true
    }
  ];

  const riskControls: PilotHandoffRiskControl[] = [
    {
      id: "external-send-control",
      risk: "Packet is sent externally before qualified human review.",
      control: "Keep every packet in draft/review-required state until an owner approves the recipient, channel, and boundary language.",
      owner: "Founder + Delivery Lead",
      hardStop: true,
      proofRoute: pilotHandoffCommandRoute
    },
    {
      id: "phi-overreach-control",
      risk: "Buyer requests live PHI or raw payloads before the approval path is complete.",
      control: "Substitute synthetic fixtures, metadata-only discovery, or de-identified examples after qualified review.",
      owner: "Security + Data Governance",
      hardStop: true,
      proofRoute: "/clinical-data-governance"
    },
    {
      id: "clinical-authority-control",
      risk: "Handoff language implies clinical authority or autonomous care.",
      control: "Route clinical language through clinical governance and retain human final authority language.",
      owner: "Clinical Governance",
      hardStop: true,
      proofRoute: "/clinical-authority-readiness"
    },
    {
      id: "commercial-overclaim-control",
      risk: "Handoff language implies guaranteed savings, revenue, valuation, approval, or customer activation.",
      control: "Use measurement-framework language and qualified review before external distribution.",
      owner: "Commercial Operations + Qualified Review",
      hardStop: true,
      proofRoute: "/pilot-value-evidence"
    },
    {
      id: "payer-submission-control",
      risk: "RCM handoff is interpreted as payer submission or coverage determination authority.",
      control: "Limit RCM packet to documentation completeness, draft QA, and human review.",
      owner: "RCM Compliance",
      hardStop: true,
      proofRoute: "/scrimed-clinical-benchmark-suite"
    }
  ];

  return {
    service: "scrimed-pilot-handoff-command",
    status: pilotHandoffCommandStatus,
    briefStatus: pilotHandoffCommandBriefStatus,
    route: pilotHandoffCommandRoute,
    apiRoute: pilotHandoffCommandApiRoute,
    briefRoute: pilotHandoffCommandBriefRoute,
    updated: pilotHandoffCommandUpdatedAt,
    boundary: pilotHandoffCommandBoundary,
    policyVersion: scrimedSafetyPolicyVersion,
    authority: authorityFlags,
    sourceAlignment: {
      activationPlannerStatus: activation.status,
      activationPlanCount: activation.planCount,
      activationHandoffCount: activation.handoffCount,
      onboardingStatus: onboarding.status,
      serviceDeliveryStatus: serviceDelivery.status
    },
    packetCount: packets.length,
    checklistCount: checklist.length,
    riskControlCount: riskControls.length,
    reviewRequiredPacketCount: packets.filter((packet) => packet.status === "review-required").length,
    externalApprovalRequiredPacketCount: packets.filter((packet) => packet.status === "external-approval-required").length,
    blockedBeforeSendPacketCount: packets.filter((packet) => packet.status === "blocked-before-send").length,
    hardStopCount: riskControls.filter((control) => control.hardStop).length + checklist.filter((item) => item.hardStopIfMissing).length,
    proofRouteCount: new Set([
      ...packets.flatMap((packet) => packet.proofRoutes),
      ...checklist.map((item) => item.evidenceRoute),
      ...riskControls.map((control) => control.proofRoute)
    ]).size,
    packets,
    topPackets: packets.slice(0, 4),
    checklist,
    riskControls,
    blockedActions: blockedHandoffActions,
    nextBestMove:
      "Select the relevant handoff packet, confirm owner inputs, resolve hard stops, and keep the packet in human review until recipient, channel, and boundary language are approved."
  };
}

export function buildPilotHandoffCommandBrief() {
  const summary = getPilotHandoffCommandSummary();

  return [
    "# SCRIMED Pilot Handoff Command Brief",
    "",
    `Status: ${summary.status}`,
    `Updated: ${summary.updated}`,
    `Packets: ${summary.packetCount}`,
    `Checklist items: ${summary.checklistCount}`,
    `Risk controls: ${summary.riskControlCount}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is synthetic-only handoff preparation. It does not send external communications, authorize live PHI, approve patient outreach, submit payer actions, mutate EHR/RIS/PACS/HIS records, grant live clinical authority, approve customer activation, certify compliance, create audited financial reporting, guarantee ROI, guarantee revenue, guarantee profit, assure valuation, or create binding commercial offers.",
    "",
    "## Handoff Packets",
    ...summary.packets.map(
      (packet) =>
        `- ${packet.title} (${packet.audience}, ${packet.status}): ${packet.purpose} Review: ${packet.reviewGate}`
    ),
    "",
    "## Hard Stops",
    ...summary.riskControls.map(
      (control) =>
        `- ${control.risk}: ${control.control} Owner: ${control.owner} Hard stop: ${control.hardStop ? "yes" : "no"}`
    ),
    "",
    "## Checklist",
    ...summary.checklist.map(
      (item) =>
        `- ${item.requirement} Owner: ${item.owner} Status: ${item.status} Hard stop if missing: ${item.hardStopIfMissing ? "yes" : "no"}`
    ),
    "",
    `Next best move: ${summary.nextBestMove}`
  ].join("\n");
}
