import {
  pricingTiers,
  productAccessRoutes,
  type PricingTier
} from "./commercialStrategy";
import type {
  PilotAuditEventRecord,
  PilotSessionRecord,
  PilotWorkspaceRecord
} from "./protectedPilotWorkspace";
import type { PilotDemoReadinessSnapshotRecord } from "./pilotDemoReadiness";
import type { QaManualRunEvidencePacketRecord } from "./qaEvidenceLedger";
import type { CommandIntelligenceSnapshotRecord } from "./commandIntelligenceHub";

export type BuyerPilotRoomState = "ready" | "review" | "blocked";

export type BuyerPilotRoomCheck = {
  id: string;
  label: string;
  state: BuyerPilotRoomState;
  evidence: string;
  action: string;
};

export type BuyerPilotRoomCompetitiveEdge = {
  pillar: string;
  claim: string;
  proof: string;
  route: string;
  blockedClaim: string;
};

export type BuyerPilotRoomCommercialStep = {
  step: string;
  offer: string;
  priceRange: string;
  buyerCommitment: string;
  proofRequired: string;
};

export type BuyerPilotRoomLimitation = {
  limitation: string;
  workaround: string;
  owner: string;
  productionGate: string;
};

export type BuyerPilotRoomDiligenceControl = {
  domain: string;
  status: BuyerPilotRoomState;
  buyerQuestion: string;
  evidence: string;
  boundary: string;
  workaround: string;
  productionGate: string;
};

export type BuyerPilotRoomSummary = {
  state: BuyerPilotRoomState;
  score: number;
  passed: number;
  review: number;
  blocked: number;
  executiveThesis: string;
  workspace: {
    tenantName: string;
    workspaceName: string;
    workspaceSlug: string;
    workspaceStatus: string;
  };
  evidenceCounts: {
    sessions: number;
    auditEvents: number;
    demoSnapshots: number;
    commandSnapshots: number;
    commandPacketExports: number;
    manualQaEvidencePackets: number;
    unavailableSections: number;
  };
  latestSnapshot: {
    id: string;
    state: BuyerPilotRoomState;
    score: number;
    createdAt: string;
  } | null;
  checks: BuyerPilotRoomCheck[];
  competitiveEdges: BuyerPilotRoomCompetitiveEdge[];
  commercialPath: BuyerPilotRoomCommercialStep[];
  buyerActions: Array<{
    label: string;
    href: string;
    purpose: string;
  }>;
  diligenceExport: {
    label: string;
    route: string;
    status: BuyerPilotRoomState;
    oneClickAction: string;
    includedArtifacts: string[];
    requiredHumanActions: string[];
    withheldItems: string[];
  };
  diligenceControls: BuyerPilotRoomDiligenceControl[];
  commandIntelligence: {
    snapshotCount: number;
    latestSnapshotId: string | null;
    latestState: BuyerPilotRoomState | null;
    latestScore: number | null;
    latestCreatedAt: string | null;
    scoreDelta: number | null;
    trend: "improving" | "stable" | "declining" | "insufficient-history";
    packetExports: number;
    nextAction: string;
  };
  limitations: BuyerPilotRoomLimitation[];
  unavailableSections: string[];
  boundary: string;
  updatedAt: string;
};

export const buyerPilotRoomProofStackStatus = "aal2-buyer-room-evidence-bundle";
export const buyerPilotRoomPacketProofStackStatus = "aal2-audited-buyer-diligence-export";

export const buyerPilotRoomBoundary =
  "Buyer Pilot Rooms package tenant-scoped synthetic evaluation evidence, pricing posture, competitive positioning, readiness snapshots, and audit history for enterprise diligence only. They do not accept PHI, authorize live clinical execution, submit payer transactions, contact patients, certify compliance, guarantee reimbursement, or provide medical, legal, or regulatory advice.";

export const buyerPilotRoomCompetitiveEdges: BuyerPilotRoomCompetitiveEdge[] = [
  {
    pillar: "Healthcare Intelligence Infrastructure",
    claim:
      "SCRIMED is positioned as a governed healthcare intelligence operating layer, not another chatbot, ambient note feature, or isolated automation tool.",
    proof:
      "AgentOS, Atlas Intelligence Core, TrustOS, persistent workspaces, interoperability contracts, and audit packets are exposed as one operating stack.",
    route: "/healthcare-intelligence-os",
    blockedClaim: "Does not claim autonomous clinical execution or replacement of healthcare professionals."
  },
  {
    pillar: "Trust-First Enterprise Proof",
    claim:
      "Every buyer-facing proof artifact is designed around human review, tenant isolation, synthetic-only boundaries, and write-before-release audit evidence.",
    proof:
      "Protected pilot workspaces use Supabase Auth, AAL2 assurance, tenant-scoped RLS, durable sessions, audit events, demo snapshots, and proof packets.",
    route: "/pilot-workspace/access",
    blockedClaim: "Does not claim HIPAA certification, SOC 2 certification, FDA clearance, or production authorization."
  },
  {
    pillar: "Interoperability Sidecar Strategy",
    claim:
      "SCRIMED can sit beside existing EHR, payer, imaging, device, and analytics systems as a review-gated intelligence layer instead of replacing the record of truth.",
    proof:
      "FHIR, HL7 v2, DICOM/DICOMweb, X12, C-CDA, LOINC, SNOMED CT, RxNorm, ICD, and CPT/HCPCS readiness are represented through synthetic contracts and conformance routes.",
    route: "/interoperability",
    blockedClaim: "Does not claim certified live connector status or production EHR writeback during synthetic pilots."
  },
  {
    pillar: "Evidence-To-Revenue Motion",
    claim:
      "SCRIMED sells high-value enterprise evaluation, protected pilots, and operating licenses anchored to workflow value, governance scope, and measurable proof.",
    proof:
      "Pricing tiers, pilot intake, Sales Operations, attribution analytics, enterprise proof packets, and the Buyer Diligence Export connect product evidence to commercial execution.",
    route: "/pricing",
    blockedClaim: "Does not guarantee savings, reimbursement, denial reduction, or clinical outcomes."
  },
  {
    pillar: "FaithCore And Atlas Trust Positioning",
    claim:
      "SCRIMED can serve enterprise-neutral buyers through Atlas while preserving a distinct spiritually aligned FaithCore pathway for organizations that explicitly want it.",
    proof:
      "FaithCore and Atlas remain separate positioning lanes, keeping enterprise compliance language professional while allowing faith-aligned encouragement where appropriate.",
    route: "/faithcore",
    blockedClaim: "Does not mix spiritual support with diagnosis, treatment, emergency triage, or clinical authority."
  },
  {
    pillar: "Global Deployment Optionality",
    claim:
      "SCRIMED is being shaped for cloud, private cloud, sovereign cloud, hospital-controlled, and edge/on-prem evaluation paths.",
    proof:
      "Deployment profiles, strategic platform intelligence, runtime safety gates, and no-live-data synthetic evaluations preserve buyer optionality before production scope.",
    route: "/deployment-profiles",
    blockedClaim: "Does not claim region-specific compliance approval until legal, privacy, security, and customer deployment review are complete."
  }
];

function hasAuditEvent(events: PilotAuditEventRecord[], eventType: string) {
  return events.some((event) => event.eventType === eventType);
}

function commandSnapshotPosture(
  commandSnapshots: CommandIntelligenceSnapshotRecord[],
  auditEvents: PilotAuditEventRecord[]
): BuyerPilotRoomSummary["commandIntelligence"] {
  const latest = commandSnapshots[0] ?? null;
  const previous = commandSnapshots[1] ?? null;
  const scoreDelta =
    latest && previous ? latest.commandScore - previous.commandScore : null;
  const packetExports = auditEvents.filter(
    (event) => event.eventType === "command-intelligence-packet-downloaded"
  ).length;

  return {
    snapshotCount: commandSnapshots.length,
    latestSnapshotId: latest?.id ?? null,
    latestState: latest?.commandState ?? null,
    latestScore: latest?.commandScore ?? null,
    latestCreatedAt: latest?.createdAt ?? null,
    scoreDelta,
    trend:
      scoreDelta === null
        ? "insufficient-history"
        : scoreDelta > 0
          ? "improving"
          : scoreDelta < 0
            ? "declining"
            : "stable",
    packetExports,
    nextAction:
      commandSnapshots.length === 0
        ? "Save a human-reviewed Command Intelligence snapshot before buyer diligence."
        : packetExports === 0
          ? "Download the latest Command Intelligence packet after operator review."
          : "Use the latest command packet and buyer export together in diligence follow-up."
  };
}

function rollupState(checks: BuyerPilotRoomCheck[]): BuyerPilotRoomState {
  if (checks.some((check) => check.state === "blocked")) return "blocked";
  if (checks.some((check) => check.state === "review")) return "review";
  return "ready";
}

function commercialTier(name: string): PricingTier {
  const tier = pricingTiers.find((candidate) => candidate.name === name);

  if (!tier) {
    return pricingTiers[0];
  }

  return tier;
}

function buildCommercialPath(state: BuyerPilotRoomState): BuyerPilotRoomCommercialStep[] {
  const assessment = commercialTier("Workflow Intelligence Assessment");
  const syntheticPilot = commercialTier("Synthetic Pilot Evaluation");
  const protectedPilot = commercialTier("Protected Enterprise Pilot");
  const license = commercialTier("Enterprise Operating License");

  return [
    {
      step: "1. Qualify",
      offer: assessment.name,
      priceRange: assessment.recommendedDisplayPrice,
      buyerCommitment: "Name sponsor, workflow owners, target workflows, and governance concerns.",
      proofRequired: "Product Console, pricing, Trust Center, and buyer intake evidence."
    },
    {
      step: "2. Prove",
      offer: syntheticPilot.name,
      priceRange: syntheticPilot.recommendedDisplayPrice,
      buyerCommitment: "Approve synthetic scenarios, success metrics, review roles, and no-PHI boundary.",
      proofRequired: "Durable sessions, demo readiness snapshot, enterprise packet, and Buyer Diligence Export."
    },
    {
      step: "3. Govern",
      offer: protectedPilot.name,
      priceRange: protectedPilot.recommendedDisplayPrice,
      buyerCommitment:
        state === "ready"
          ? "Move into protected enterprise pilot diligence with security, privacy, legal, and workflow review."
          : "Close readiness gaps before protected enterprise pilot diligence.",
      proofRequired: "Tenant identity, AAL2, role controls, audit trail, activation proof, and TrustOps posture."
    },
    {
      step: "4. Expand",
      offer: license.name,
      priceRange: license.recommendedDisplayPrice,
      buyerCommitment: "Approve annual platform license, connector scope, human-review operating model, and value reviews.",
      proofRequired: "Production gates, signed controls, approved connectors, monitoring, and governance runbooks."
    }
  ];
}

function buildDiligenceControls({
  auditEvents,
  commandSnapshots,
  demoSnapshots,
  hasAgentWorkspace,
  hasManualQaEvidence,
  hasSession,
  hasTrustOps,
  manualQaEvidencePackets,
  sessions,
  state,
  unavailableSections
}: {
  auditEvents: PilotAuditEventRecord[];
  commandSnapshots: CommandIntelligenceSnapshotRecord[];
  demoSnapshots: PilotDemoReadinessSnapshotRecord[];
  hasAgentWorkspace: boolean;
  hasManualQaEvidence: boolean;
  hasSession: boolean;
  hasTrustOps: boolean;
  manualQaEvidencePackets: QaManualRunEvidencePacketRecord[];
  sessions: PilotSessionRecord[];
  state: BuyerPilotRoomState;
  unavailableSections: string[];
}): BuyerPilotRoomDiligenceControl[] {
  const commandPosture = commandSnapshotPosture(commandSnapshots, auditEvents);

  return [
    {
      domain: "Identity And Access",
      status: "ready",
      buyerQuestion: "Can SCRIMED prove that protected buyer evidence requires authenticated tenant access?",
      evidence: "Buyer room APIs require workspace membership and fresh AAL2 governance context before data is returned.",
      boundary: "This does not replace customer SSO approval, production IdP configuration, or access-review signoff.",
      workaround: "Use the current browser-session verification panel for buyer demos instead of exporting bearer tokens.",
      productionGate: "Signed tenant access model, SSO/domain configuration, access reviews, and support process approval."
    },
    {
      domain: "Synthetic Product Proof",
      status: hasSession ? "ready" : "blocked",
      buyerQuestion: "Is there retained product evidence for a no-PHI workflow evaluation?",
      evidence: `${sessions.length} durable synthetic session${sessions.length === 1 ? "" : "s"} visible in the workspace.`,
      boundary: "Synthetic sessions are not live clinical care, payer transactions, or production workflow execution.",
      workaround: "Create a synthetic session in the protected workspace before a formal buyer review.",
      productionGate: "Customer-approved workflow scope, production connector authorization, and human-review operating model."
    },
    {
      domain: "Demo And Pilot Readiness",
      status: demoSnapshots.length > 0 ? "ready" : "review",
      buyerQuestion: "Can SCRIMED show a prepared pilot path rather than a one-off demo?",
      evidence: `${demoSnapshots.length} demo readiness snapshot${demoSnapshots.length === 1 ? "" : "s"} retained.`,
      boundary: "Demo readiness does not approve production launch, live data access, or customer-facing automation.",
      workaround: "Persist a fresh readiness snapshot from the browser session before executive buyer follow-up.",
      productionGate: "Signed pilot scope, reviewer assignments, success metrics, and customer data boundary approval."
    },
    {
      domain: "Manual QA Evidence",
      status: hasManualQaEvidence ? "ready" : "review",
      buyerQuestion: "Can SCRIMED show human-run QA evidence without storing secrets in CI?",
      evidence: `${manualQaEvidencePackets.length} tenant-scoped manual QA evidence packet${manualQaEvidencePackets.length === 1 ? "" : "s"} retained or audited.`,
      boundary: "Manual QA evidence contains no bearer tokens, credentials, PHI, payer member identifiers, or source contracts.",
      workaround: "Use the Manual QA Evidence panel after a human AAL2 run; do not paste secrets into packet fields.",
      productionGate: "Approved short-lived token policy, identity operations, and optional CI-held token process."
    },
    {
      domain: "Auditability",
      status: auditEvents.length > 0 ? "ready" : "review",
      buyerQuestion: "Can diligence evidence be tied to an append-only event trail?",
      evidence: `${auditEvents.length} append-only audit event${auditEvents.length === 1 ? "" : "s"} visible to this tenant session.`,
      boundary: "Audit logs document synthetic pilot activity; they are not a SOC 2 report or compliance certification.",
      workaround: "Use write-before-release packet downloads and retain packet audit IDs in buyer follow-up.",
      productionGate: "Formal retention, legal hold, monitoring, incident response, and compliance-review operating controls."
    },
    {
      domain: "Command Intelligence Posture",
      status: commandPosture.snapshotCount > 0 ? "ready" : "review",
      buyerQuestion: "Can SCRIMED show command-posture improvement over time, not only point-in-time demos?",
      evidence:
        commandPosture.snapshotCount > 0
          ? `${commandPosture.snapshotCount} retained Command Intelligence snapshot${commandPosture.snapshotCount === 1 ? "" : "s"}; latest score ${commandPosture.latestScore}% with ${commandPosture.trend} trend.`
          : "No retained Command Intelligence snapshot is visible yet.",
      boundary:
        "Command posture is synthetic-pilot operating evidence and does not certify clinical, security, compliance, or reimbursement outcomes.",
      workaround:
        commandPosture.snapshotCount > 0
          ? "Pair the latest snapshot with the Buyer Diligence Export and explicit production gates."
          : "Save a command snapshot from the protected workspace before formal buyer diligence.",
      productionGate:
        "Production operating metrics require signed scope, live connector approval, monitoring ownership, and customer validation."
    },
    {
      domain: "Trust And Safety Operations",
      status: hasTrustOps ? "ready" : "review",
      buyerQuestion: "Can SCRIMED show a process for monitoring, escalation, and improvement?",
      evidence: hasTrustOps
        ? "TrustOps incident or packet activity is visible in the audit trail."
        : "No TrustOps incident activity is visible in this workspace yet.",
      boundary: "TrustOps pilot evidence is not a staffed 24/7 managed production service commitment.",
      workaround: "Create or review a synthetic TrustOps incident when security, safety, or legal reviewers attend.",
      productionGate: "Approved staffing, customer escalation matrix, MDR/SOC process, and incident response review."
    },
    {
      domain: "Agent Workspace Governance",
      status: hasAgentWorkspace ? "ready" : "review",
      buyerQuestion: "Can SCRIMED govern long-running agent work rather than only answer prompts?",
      evidence: hasAgentWorkspace
        ? "Agent Workspace work-order activity is visible in the audit trail."
        : "No Agent Workspace work-order activity is visible in this workspace yet.",
      boundary: "Agent work orders are synthetic, human-reviewed, and do not autonomously execute clinical care.",
      workaround: "Create a synthetic work order for buyers evaluating long-running agent task operations.",
      productionGate: "Approved tools, scoped credentials, customer environment boundary, and reviewer approval workflow."
    },
    {
      domain: "Pricing And Commercial Posture",
      status: "ready",
      buyerQuestion: "Is the commercial path premium, clear, and tied to evidence?",
      evidence: "Assessment, synthetic pilot, protected enterprise pilot, and operating license steps are packaged in the room.",
      boundary: "Pricing posture is not a savings guarantee, reimbursement guarantee, or binding contract.",
      workaround: "Use measured pilot value, scoped deliverables, and buyer-specific governance before final contracting.",
      productionGate: "Signed order form, MSA/BAA/DPA path where applicable, and approved statement of work."
    },
    {
      domain: "Legal, Privacy, And Security Boundary",
      status: "ready",
      buyerQuestion: "Does the export clearly separate diligence support from legal or compliance certification?",
      evidence: "The export states no medical, legal, regulatory, compliance, security, or production authorization claims.",
      boundary: "SCRIMED does not accept PHI or production credentials in this protected synthetic pilot workspace.",
      workaround: "Use metadata-only evidence, blocked claims, review gates, and signed controls before production promotion.",
      productionGate: "Customer legal, privacy, security, clinical governance, retention, and incident response approval."
    },
    {
      domain: "Unavailable Evidence Handling",
      status: unavailableSections.length === 0 ? "ready" : "review",
      buyerQuestion: "What happens if part of the evidence stack is unavailable during diligence?",
      evidence:
        unavailableSections.length === 0
          ? "No degraded evidence section is currently reported."
          : `${unavailableSections.length} evidence section${unavailableSections.length === 1 ? "" : "s"} degraded.`,
      boundary: "Degraded evidence must be disclosed rather than hidden in buyer-facing exports.",
      workaround: "Export visible evidence with explicit degraded-section disclosure and follow-up owners.",
      productionGate: "Operational monitoring, alerting, retry policy, and customer communication process."
    },
    {
      domain: "Production Activation",
      status: state === "ready" ? "review" : "blocked",
      buyerQuestion: "Can the diligence export be used to start live clinical, payer, or patient-facing operations?",
      evidence: "The export intentionally preserves production hard gates and live-use exclusions.",
      boundary: "No autonomous diagnosis, treatment, patient outreach, payer submission, EHR writeback, or live data processing.",
      workaround: "Use the export to progress evaluation and contracting while production controls are reviewed separately.",
      productionGate: "Signed authorization, BAA/DPA path, live connector approval, clinical safety review, and launch approval."
    }
  ];
}

function latestSnapshot(
  snapshots: PilotDemoReadinessSnapshotRecord[]
): BuyerPilotRoomSummary["latestSnapshot"] {
  const snapshot = snapshots[0];

  if (!snapshot) return null;

  return {
    id: snapshot.id,
    state: snapshot.readinessState,
    score: snapshot.readinessScore,
    createdAt: snapshot.createdAt
  };
}

export function deriveBuyerPilotRoom({
  workspace,
  sessions,
  auditEvents,
  demoSnapshots,
  commandSnapshots = [],
  manualQaEvidencePackets,
  unavailableSections
}: {
  workspace: PilotWorkspaceRecord;
  sessions: PilotSessionRecord[];
  auditEvents: PilotAuditEventRecord[];
  demoSnapshots: PilotDemoReadinessSnapshotRecord[];
  commandSnapshots?: CommandIntelligenceSnapshotRecord[];
  manualQaEvidencePackets: QaManualRunEvidencePacketRecord[];
  unavailableSections: string[];
}): BuyerPilotRoomSummary {
  const hasSession = sessions.length > 0;
  const hasSessionAudit = hasAuditEvent(auditEvents, "synthetic-session-created");
  const hasEnterprisePacket = hasAuditEvent(auditEvents, "enterprise-proof-packet-downloaded");
  const hasDemoSnapshot = demoSnapshots.length > 0;
  const hasDemoPacket = hasAuditEvent(auditEvents, "demo-readiness-packet-downloaded");
  const hasBuyerPacket = hasAuditEvent(auditEvents, "buyer-pilot-room-packet-downloaded");
  const hasManualQaEvidence =
    manualQaEvidencePackets.length > 0 ||
    hasAuditEvent(auditEvents, "manual-qa-evidence-packet-recorded");
  const hasTrustOps =
    hasAuditEvent(auditEvents, "trust-safety-incident-created") ||
    hasAuditEvent(auditEvents, "trust-safety-incident-updated") ||
    hasAuditEvent(auditEvents, "trust-safety-incident-packet-downloaded");
  const hasAgentWorkspace =
    hasAuditEvent(auditEvents, "agent-work-order-created") ||
    hasAuditEvent(auditEvents, "agent-work-order-transitioned") ||
    hasAuditEvent(auditEvents, "agent-work-order-proof-packet-downloaded");
  const commandPosture = commandSnapshotPosture(commandSnapshots, auditEvents);

  const checks: BuyerPilotRoomCheck[] = [
    {
      id: "tenant-access",
      label: "Tenant-authenticated buyer room access",
      state: "ready",
      evidence: "This room is returned only after tenant membership and fresh AAL2 governance context are verified.",
      action: "Keep passkey or magic-link plus authenticator assurance fresh before buyer diligence calls."
    },
    {
      id: "synthetic-evidence",
      label: "Durable synthetic product evidence",
      state: hasSession && hasSessionAudit ? "ready" : hasSession ? "review" : "blocked",
      evidence: `${sessions.length} retained synthetic session${sessions.length === 1 ? "" : "s"} and ${hasSessionAudit ? "a" : "no"} synthetic-session-created audit event.`,
      action: hasSession
        ? "Confirm the top retained session maps to the buyer's target workflow."
        : "Create a synthetic session before presenting buyer-room proof."
    },
    {
      id: "demo-readiness",
      label: "Demo readiness snapshot",
      state: hasDemoSnapshot ? "ready" : "review",
      evidence: hasDemoSnapshot
        ? `${demoSnapshots.length} durable demo readiness snapshot${demoSnapshots.length === 1 ? "" : "s"} available.`
        : "No durable demo readiness snapshot is available yet.",
      action: hasDemoSnapshot
        ? "Use the latest snapshot as the demo opening posture."
        : "Save a demo readiness snapshot before formal buyer diligence."
    },
    {
      id: "packet-proof",
      label: "Audited packet proof",
      state: hasEnterprisePacket && hasDemoPacket ? "ready" : hasEnterprisePacket || hasDemoPacket ? "review" : "blocked",
      evidence: `${hasEnterprisePacket ? "Enterprise packet audited" : "Enterprise packet not audited"}; ${hasDemoPacket ? "demo readiness packet audited" : "demo readiness packet not audited"}.`,
      action: hasEnterprisePacket && hasDemoPacket
        ? "Attach packet IDs to the buyer follow-up."
        : "Download the missing packet type before a formal enterprise follow-up."
    },
    {
      id: "manual-qa-evidence",
      label: "Manual QA evidence persistence",
      state: hasManualQaEvidence ? "ready" : "review",
      evidence: hasManualQaEvidence
        ? `${manualQaEvidencePackets.length} tenant-scoped manual QA evidence packet${manualQaEvidencePackets.length === 1 ? "" : "s"} retained or audited.`
        : "No tenant-scoped manual QA evidence packet is visible yet.",
      action: hasManualQaEvidence
        ? "Attach the latest workflow run ID and packet hash to the buyer diligence follow-up."
        : "After the human AAL2 QA workflow passes, persist the no-secret packet through the protected workspace evidence route."
    },
    {
      id: "agent-workspace",
      label: "Persistent Agent Workspace evidence",
      state: hasAgentWorkspace ? "ready" : "review",
      evidence: hasAgentWorkspace
        ? "Agent Workspace work-order activity is visible in the audit trail."
        : "No Agent Workspace work-order activity is visible yet.",
      action: hasAgentWorkspace
        ? "Show work-order review, retry, closure, and packet controls when relevant."
        : "Create a synthetic work order if the buyer is evaluating long-running agent tasks."
    },
    {
      id: "trustops",
      label: "Trust Safety operating evidence",
      state: hasTrustOps ? "ready" : "review",
      evidence: hasTrustOps
        ? "TrustOps incident activity or packet evidence is visible."
        : "TrustOps tenant incident evidence is not yet visible in this workspace.",
      action: hasTrustOps
        ? "Use TrustOps as proof of monitoring, escalation, and improvement discipline."
        : "Create or review a synthetic TrustOps incident for security, safety, or legal-readiness demos."
    },
    {
      id: "buyer-room-packet",
      label: "Buyer room packet release",
      state: hasBuyerPacket ? "ready" : "review",
      evidence: hasBuyerPacket
        ? "A buyer-room packet download audit event exists."
        : "No buyer-room packet download audit event exists yet.",
      action: hasBuyerPacket
        ? "Use the most recent packet as buyer-diligence follow-up."
        : "Download the Buyer Diligence Export after this room is reviewed."
    },
    {
      id: "command-intelligence-timeline",
      label: "Command Intelligence posture timeline",
      state: commandPosture.snapshotCount > 0 ? "ready" : "review",
      evidence:
        commandPosture.snapshotCount > 0
          ? `${commandPosture.snapshotCount} command snapshot${commandPosture.snapshotCount === 1 ? "" : "s"} retained; latest score ${commandPosture.latestScore}% and trend ${commandPosture.trend}.`
          : "No Command Intelligence snapshot is retained for this workspace yet.",
      action: commandPosture.nextAction
    },
    {
      id: "degraded-sections",
      label: "Unavailable evidence sections",
      state: unavailableSections.length === 0 ? "ready" : "review",
      evidence:
        unavailableSections.length === 0
          ? "All buyer-room evidence queries returned data or empty-state evidence."
          : `${unavailableSections.length} evidence section${unavailableSections.length === 1 ? "" : "s"} degraded.`,
      action:
        unavailableSections.length === 0
          ? "No workaround required."
          : "Use visible evidence and mark degraded sections for follow-up before buyer packet release."
    }
  ];
  const passed = checks.filter((check) => check.state === "ready").length;
  const review = checks.filter((check) => check.state === "review").length;
  const blocked = checks.filter((check) => check.state === "blocked").length;
  const state = rollupState(checks);
  const score = Math.round((passed / checks.length) * 100);
  const diligenceControls = buildDiligenceControls({
    auditEvents,
    commandSnapshots,
    demoSnapshots,
    hasAgentWorkspace,
    hasManualQaEvidence,
    hasSession,
    hasTrustOps,
    manualQaEvidencePackets,
    sessions,
    state,
    unavailableSections
  });

  return {
    state,
    score,
    passed,
    review,
    blocked,
    executiveThesis:
      "SCRIMED transforms fragmented healthcare workflows into decision-grade, human-reviewed operational intelligence with tenant isolation, synthetic proof, audit trails, interoperability readiness, and enterprise pricing discipline.",
    workspace: {
      tenantName: workspace.tenantName,
      workspaceName: workspace.name,
      workspaceSlug: workspace.slug,
      workspaceStatus: workspace.status
    },
    evidenceCounts: {
      sessions: sessions.length,
      auditEvents: auditEvents.length,
      demoSnapshots: demoSnapshots.length,
      commandSnapshots: commandSnapshots.length,
      commandPacketExports: commandPosture.packetExports,
      manualQaEvidencePackets: manualQaEvidencePackets.length,
      unavailableSections: unavailableSections.length
    },
    latestSnapshot: latestSnapshot(demoSnapshots),
    checks,
    competitiveEdges: buyerPilotRoomCompetitiveEdges,
    commercialPath: buildCommercialPath(state),
    buyerActions: [
      {
        label: "Request Pilot",
        href: "/pilot?offer=synthetic-pilot-evaluation",
        purpose: "Convert buyer interest into a scoped no-PHI synthetic evaluation."
      },
      {
        label: "View Product Console",
        href: "/product",
        purpose: "Review the public product proof surface before protected diligence."
      },
      {
        label: "Book Enterprise Assessment",
        href: "/pilot?offer=workflow-intelligence-assessment",
        purpose: "Scope workflow intelligence, governance, and automation blueprint needs."
      },
      {
        label: "Open Official Website",
        href: productAccessRoutes[0]?.route ?? "https://www.scrimedsolutions.com",
        purpose: "Return to the SCRIMED public brand and communications surface."
      }
    ],
    diligenceExport: {
      label: "Buyer Diligence Export",
      route: `/api/pilot-workspaces/${workspace.slug}/buyer-room/packet`,
      status: state === "blocked" ? "review" : state,
      oneClickAction:
        "Download one audited Markdown export from the protected Buyer Pilot Room after AAL2 tenant authorization.",
      includedArtifacts: [
        "Executive thesis and tenant workspace posture",
        "Readiness score, checks, blockers, and workaround owners",
        "Manual QA evidence counts, workflow run IDs, and packet hashes when retained",
        "Demo readiness, durable synthetic session, and append-only audit evidence",
        "Command Intelligence snapshot timeline, score trend, and packet export posture",
        "Pricing path from assessment through protected pilot and operating license",
        "Competitive edge pillars with proof routes and blocked claims",
        "Legal, privacy, security, safety, and production activation boundaries",
        "Recent audit trail and degraded-section disclosure"
      ],
      requiredHumanActions: [
        "Keep the tenant browser session at AAL2 before download",
        "Review the export for buyer-specific context before sending externally",
        "Use manual QA evidence capture for human-run proof instead of storing bearer tokens",
        "Escalate any live-data, PHI, payer, EHR, imaging, device, legal, or clinical request"
      ],
      withheldItems: [
        "Bearer tokens, credentials, secrets, and source contracts",
        "PHI, patient identifiers, payer member data, and production customer records",
        "Legal advice, compliance certification, security certification, or reimbursement guarantees",
        "Production launch approval, autonomous clinical action, or live connector authorization"
      ]
    },
    diligenceControls,
    commandIntelligence: commandPosture,
    limitations: [
      {
        limitation: "Authenticated CI happy-path checks cannot safely run without a short-lived AAL2 tenant token.",
        workaround:
          "Use human browser-session tenant verification, public fail-closed smoke checks, audited packet downloads, and the protected no-secret manual QA evidence packet route instead of storing reusable bearer tokens.",
        owner: "SCRIMED operator",
        productionGate: "Enterprise CI token handling requires approved secret rotation, session policy, and identity operations."
      },
      {
        limitation: "Direct invitation email remains gated.",
        workaround:
          "Use audited onboarding packets and manual external delivery until custom SMTP sender controls, abuse monitoring, and legal copy are approved.",
        owner: "Tenant admin",
        productionGate: "Enable direct send only after domain, compliance, and monitoring approval."
      },
      {
        limitation: "Live PHI, payer, EHR, imaging, device, and patient-facing execution are not authorized.",
        workaround:
          "Run synthetic fixtures, connector contracts, conformance evidence, and protected-pilot governance before live promotion.",
        owner: "Clinical, legal, security, and privacy reviewers",
        productionGate: "Signed scope, BAA/DPA path where applicable, production controls, and human-review procedures."
      },
      {
        limitation: "24/7 managed production monitoring is not yet a staffed commercial service.",
        workaround:
          "Use Trust Safety Ops as the operating model, incident register, runbook, and readiness artifact during pilots.",
        owner: "Trust operations lead",
        productionGate: "Approved staffing, SOC/MDR process, customer escalation matrix, and incident response review."
      },
      {
        limitation: "Compliance and reimbursement outcomes cannot be promised.",
        workaround:
          "Use approved claims, blocked claims, measured pilot signals, and buyer-specific review rather than guarantees.",
        owner: "Commercial and governance leads",
        productionGate: "External legal, compliance, payer, and clinical validation before production assertions."
      }
    ],
    unavailableSections,
    boundary: buyerPilotRoomBoundary,
    updatedAt: "2026-06-18"
  };
}

function markdownItems(items: string[]) {
  if (items.length === 0) return "- None recorded.";

  return items.map((item) => `- ${item}`).join("\n");
}

function checkLines(checks: BuyerPilotRoomCheck[]) {
  return checks
    .map((check) => `- ${check.label}: ${check.state}. Evidence: ${check.evidence} Action: ${check.action}`)
    .join("\n");
}

function edgeLines(edges: BuyerPilotRoomCompetitiveEdge[]) {
  return edges
    .map(
      (edge) =>
        `- ${edge.pillar}: ${edge.claim} Proof: ${edge.proof} Route: ${edge.route} Blocked claim: ${edge.blockedClaim}`
    )
    .join("\n");
}

function commercialLines(steps: BuyerPilotRoomCommercialStep[]) {
  return steps
    .map(
      (step) =>
        `${step.step}. ${step.offer} (${step.priceRange}): ${step.buyerCommitment} Proof required: ${step.proofRequired}`
    )
    .join("\n");
}

function limitationLines(limitations: BuyerPilotRoomLimitation[]) {
  return limitations
    .map(
      (limitation) =>
        `- ${limitation.limitation} Workaround: ${limitation.workaround} Owner: ${limitation.owner}. Gate: ${limitation.productionGate}`
    )
    .join("\n");
}

function diligenceControlLines(controls: BuyerPilotRoomDiligenceControl[]) {
  return controls
    .map(
      (control) =>
        `- ${control.domain}: ${control.status}. Buyer question: ${control.buyerQuestion} Evidence: ${control.evidence} Boundary: ${control.boundary} Workaround: ${control.workaround} Gate: ${control.productionGate}`
    )
    .join("\n");
}

function recentAuditLines(events: PilotAuditEventRecord[]) {
  if (events.length === 0) {
    return "- No recent audit events are visible to this tenant session.";
  }

  return events
    .slice(0, 25)
    .map(
      (event) =>
        `- ${event.createdAt}: ${event.eventType} by ${event.actorUserId}; session ${event.sessionId ?? "workspace-level"}`
    )
    .join("\n");
}

export function buildBuyerPilotRoomPacket({
  generatedAt,
  auditEventId,
  actorUserId,
  appBaseUrl,
  workspace,
  room,
  recentAuditEvents,
  manualQaEvidencePackets
}: {
  generatedAt: string;
  auditEventId: string;
  actorUserId: string;
  appBaseUrl: string;
  workspace: PilotWorkspaceRecord;
  room: BuyerPilotRoomSummary;
  recentAuditEvents: PilotAuditEventRecord[];
  manualQaEvidencePackets: QaManualRunEvidencePacketRecord[];
}) {
  const baseUrl = appBaseUrl.replace(/\/$/, "");

  return `# SCRIMED Buyer Diligence Export

This audited export is generated from the protected Buyer Pilot Room. It packages the current synthetic pilot evidence, commercial posture, governance boundaries, known limitations, and safe workarounds into one buyer-ready diligence artifact.

## Packet Control
- Generated: ${generatedAt}
- Packet audit event ID: ${auditEventId}
- Generated by: ${actorUserId}
- Product route: ${baseUrl}/pilot-workspace/access
- Buyer room API: ${baseUrl}/api/pilot-workspaces/${workspace.slug}/buyer-room
- Diligence export API: ${baseUrl}${room.diligenceExport.route}
- Export status: ${room.diligenceExport.status}
- Data boundary: synthetic-only, metadata-only, tenant-scoped

## Executive Thesis
${room.executiveThesis}

## Tenant Workspace
- Tenant: ${workspace.tenantName}
- Workspace: ${workspace.name}
- Workspace slug: ${workspace.slug}
- Workspace status: ${workspace.status}
- Workspace created: ${workspace.createdAt}

## One-Click Diligence Export Index
- Label: ${room.diligenceExport.label}
- Action: ${room.diligenceExport.oneClickAction}
- Included artifacts:
${markdownItems(room.diligenceExport.includedArtifacts)}

Required human actions:
${markdownItems(room.diligenceExport.requiredHumanActions)}

Withheld by design:
${markdownItems(room.diligenceExport.withheldItems)}

## Buyer Room Readiness
- State: ${room.state}
- Score: ${room.score}%
- Passed checks: ${room.passed}
- Review checks: ${room.review}
- Blocked checks: ${room.blocked}
- Durable synthetic sessions: ${room.evidenceCounts.sessions}
- Append-only audit events: ${room.evidenceCounts.auditEvents}
- Demo readiness snapshots: ${room.evidenceCounts.demoSnapshots}
- Command Intelligence snapshots: ${room.evidenceCounts.commandSnapshots}
- Command Intelligence packet exports: ${room.evidenceCounts.commandPacketExports}
- Manual QA evidence packets: ${room.evidenceCounts.manualQaEvidencePackets}
- Degraded evidence sections: ${room.evidenceCounts.unavailableSections}
- Latest demo snapshot: ${
    room.latestSnapshot
      ? `${room.latestSnapshot.id}, ${room.latestSnapshot.state}, ${room.latestSnapshot.score}%, ${room.latestSnapshot.createdAt}`
      : "not available"
  }

## Readiness Checks
${checkLines(room.checks)}

## Readiness And QA Evidence Bundle
- Durable synthetic sessions: ${room.evidenceCounts.sessions}
- Append-only audit events: ${room.evidenceCounts.auditEvents}
- Demo readiness snapshots: ${room.evidenceCounts.demoSnapshots}
- Command Intelligence snapshots: ${room.evidenceCounts.commandSnapshots}
- Command Intelligence packet exports: ${room.evidenceCounts.commandPacketExports}
- Manual QA evidence packets: ${room.evidenceCounts.manualQaEvidencePackets}
- Degraded evidence sections: ${room.evidenceCounts.unavailableSections}
- Latest demo snapshot: ${
    room.latestSnapshot
      ? `${room.latestSnapshot.id}, ${room.latestSnapshot.state}, ${room.latestSnapshot.score}%, ${room.latestSnapshot.createdAt}`
      : "not available"
  }

## Command Intelligence Timeline
- Snapshot count: ${room.commandIntelligence.snapshotCount}
- Latest snapshot: ${room.commandIntelligence.latestSnapshotId ?? "not available"}
- Latest state: ${room.commandIntelligence.latestState ?? "not available"}
- Latest score: ${room.commandIntelligence.latestScore === null ? "not available" : `${room.commandIntelligence.latestScore}%`}
- Latest created: ${room.commandIntelligence.latestCreatedAt ?? "not available"}
- Score delta: ${room.commandIntelligence.scoreDelta === null ? "insufficient history" : `${room.commandIntelligence.scoreDelta > 0 ? "+" : ""}${room.commandIntelligence.scoreDelta} points`}
- Trend: ${room.commandIntelligence.trend}
- Packet exports: ${room.commandIntelligence.packetExports}
- Next action: ${room.commandIntelligence.nextAction}

## Legal, Privacy, Security, Safety, And Production Control Matrix
${diligenceControlLines(room.diligenceControls)}

## Competitive Edge
${edgeLines(room.competitiveEdges)}

## Pricing And Commercial Posture
- SCRIMED pricing is positioned as premium enterprise workflow intelligence, governed synthetic evaluation, protected pilot activation, and operating-system licensing.
- Pricing must remain tied to buyer-specific workflow scope, governance obligations, deployment mode, support expectations, integration complexity, and measurable pilot outcomes.
- No savings, reimbursement, denial-reduction, revenue, clinical outcome, or regulatory guarantee is made by this export.

## Commercial Path
${commercialLines(room.commercialPath)}

## Buyer Actions
${room.buyerActions.map((action) => `- ${action.label}: ${action.purpose} Route: ${action.href}`).join("\n")}

## Known Limitations And Workarounds
${limitationLines(room.limitations)}

## Production Hard Gates
- Signed customer authorization and scope.
- BAA/DPA path where applicable.
- Legal, privacy, security, and clinical governance review.
- Human-review workflow approval and reviewer accountability.
- Live connector authorization for EHR, payer, imaging, device, or warehouse integrations.
- Retention, deletion, legal-hold, incident-response, and access-review controls.
- Region, sovereignty, and deployment-mode approval where applicable.

## Unavailable Or Degraded Sections
${markdownItems(room.unavailableSections)}

## Recent Append-Only Audit Events
${recentAuditLines(recentAuditEvents)}

## Manual QA Evidence Packets
${manualQaEvidencePackets.length === 0
    ? "- No tenant-scoped manual QA evidence packets are visible yet."
    : manualQaEvidencePackets
        .slice(0, 10)
        .map(
          (packet) =>
            `- ${packet.createdAt}: workflow ${packet.workflowRunId}, intake ${packet.intakeId}, packet hash ${packet.packetSha256}, created by ${packet.createdBy}`
        )
        .join("\n")}

## Legal, Privacy, Security, And Safety Boundary
- This packet documents governed synthetic pilot evidence and SCRIMED commercial positioning only.
- It is not medical advice, clinical decision support authorization, diagnosis, treatment guidance, patient instruction, payer submission, reimbursement guarantee, legal advice, regulatory advice, compliance certification, production authorization, or security certification.
- SCRIMED does not accept PHI, live patient records, payer credentials, production EHR credentials, imaging files, device streams, or secrets in this protected synthetic pilot workspace.
- Live clinical, payer, imaging, device, EHR, or patient-facing use requires signed customer authorization, BAA/DPA path where applicable, privacy review, security review, clinical governance, legal review, retention policy, incident response, and deployment approval.
- Human review remains required before any buyer-facing interpretation is treated as operational evidence.

## Buyer Room Boundary
${room.boundary}

## Workspace Boundary
${workspace.boundary}
`;
}
