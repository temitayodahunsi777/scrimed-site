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
  limitations: BuyerPilotRoomLimitation[];
  unavailableSections: string[];
  boundary: string;
  updatedAt: string;
};

export const buyerPilotRoomProofStackStatus = "aal2-buyer-room-evidence-bundle";
export const buyerPilotRoomPacketProofStackStatus = "aal2-audited-buyer-room-packets";

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
      "Pricing tiers, pilot intake, Sales Operations, attribution analytics, enterprise proof packets, and buyer-room packets connect product evidence to commercial execution.",
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
      proofRequired: "Durable sessions, demo readiness snapshot, enterprise packet, and buyer room packet."
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
  unavailableSections
}: {
  workspace: PilotWorkspaceRecord;
  sessions: PilotSessionRecord[];
  auditEvents: PilotAuditEventRecord[];
  demoSnapshots: PilotDemoReadinessSnapshotRecord[];
  unavailableSections: string[];
}): BuyerPilotRoomSummary {
  const hasSession = sessions.length > 0;
  const hasSessionAudit = hasAuditEvent(auditEvents, "synthetic-session-created");
  const hasEnterprisePacket = hasAuditEvent(auditEvents, "enterprise-proof-packet-downloaded");
  const hasDemoSnapshot = demoSnapshots.length > 0;
  const hasDemoPacket = hasAuditEvent(auditEvents, "demo-readiness-packet-downloaded");
  const hasBuyerPacket = hasAuditEvent(auditEvents, "buyer-pilot-room-packet-downloaded");
  const hasTrustOps =
    hasAuditEvent(auditEvents, "trust-safety-incident-created") ||
    hasAuditEvent(auditEvents, "trust-safety-incident-updated") ||
    hasAuditEvent(auditEvents, "trust-safety-incident-packet-downloaded");
  const hasAgentWorkspace =
    hasAuditEvent(auditEvents, "agent-work-order-created") ||
    hasAuditEvent(auditEvents, "agent-work-order-transitioned") ||
    hasAuditEvent(auditEvents, "agent-work-order-proof-packet-downloaded");

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
        : "Download the Buyer Room Packet after this room is reviewed."
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
    limitations: [
      {
        limitation: "Authenticated CI happy-path checks cannot safely run without a short-lived AAL2 tenant token.",
        workaround:
          "Use human browser-session tenant verification, public fail-closed smoke checks, and audited packet downloads instead of storing reusable bearer tokens.",
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
    updatedAt: "2026-06-16"
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
  recentAuditEvents
}: {
  generatedAt: string;
  auditEventId: string;
  actorUserId: string;
  appBaseUrl: string;
  workspace: PilotWorkspaceRecord;
  room: BuyerPilotRoomSummary;
  recentAuditEvents: PilotAuditEventRecord[];
}) {
  const baseUrl = appBaseUrl.replace(/\/$/, "");

  return `# SCRIMED Buyer Pilot Room Packet

## Packet Control
- Generated: ${generatedAt}
- Packet audit event ID: ${auditEventId}
- Generated by: ${actorUserId}
- Product route: ${baseUrl}/pilot-workspace/access
- Buyer room API: ${baseUrl}/api/pilot-workspaces/${workspace.slug}/buyer-room
- Data boundary: synthetic-only, metadata-only, tenant-scoped

## Executive Thesis
${room.executiveThesis}

## Tenant Workspace
- Tenant: ${workspace.tenantName}
- Workspace: ${workspace.name}
- Workspace slug: ${workspace.slug}
- Workspace status: ${workspace.status}
- Workspace created: ${workspace.createdAt}

## Buyer Room Readiness
- State: ${room.state}
- Score: ${room.score}%
- Passed checks: ${room.passed}
- Review checks: ${room.review}
- Blocked checks: ${room.blocked}
- Durable synthetic sessions: ${room.evidenceCounts.sessions}
- Append-only audit events: ${room.evidenceCounts.auditEvents}
- Demo readiness snapshots: ${room.evidenceCounts.demoSnapshots}
- Degraded evidence sections: ${room.evidenceCounts.unavailableSections}
- Latest demo snapshot: ${
    room.latestSnapshot
      ? `${room.latestSnapshot.id}, ${room.latestSnapshot.state}, ${room.latestSnapshot.score}%, ${room.latestSnapshot.createdAt}`
      : "not available"
  }

## Readiness Checks
${checkLines(room.checks)}

## Competitive Edge
${edgeLines(room.competitiveEdges)}

## Commercial Path
${commercialLines(room.commercialPath)}

## Buyer Actions
${room.buyerActions.map((action) => `- ${action.label}: ${action.purpose} Route: ${action.href}`).join("\n")}

## Known Limitations And Workarounds
${limitationLines(room.limitations)}

## Unavailable Or Degraded Sections
${markdownItems(room.unavailableSections)}

## Recent Append-Only Audit Events
${recentAuditLines(recentAuditEvents)}

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
