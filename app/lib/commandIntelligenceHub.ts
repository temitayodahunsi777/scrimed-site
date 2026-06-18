import { getAgentOSSummary } from "./agentOS";
import { deriveBuyerPilotRoom } from "./buyerPilotRoom";
import type { PilotDemoReadinessSnapshotRecord } from "./pilotDemoReadiness";
import type {
  PilotAuditEventRecord,
  PilotSessionRecord,
  PilotWorkspaceRecord
} from "./protectedPilotWorkspace";
import type { QaManualRunEvidencePacketRecord } from "./qaEvidenceLedger";

export type CommandIntelligenceState = "ready" | "review" | "blocked";
export type CommandSignalType = "agent" | "buyer" | "evaluation" | "governance" | "safe-mode" | "tooling";

export type CommandIntelligenceMetric = {
  label: string;
  value: string;
  detail: string;
};

export type CommandIntelligenceWorkstream = {
  id: string;
  name: string;
  state: CommandIntelligenceState;
  signalType: CommandSignalType;
  owner: string;
  evidence: string;
  confidenceLevel: "high" | "medium" | "low";
  riskScore: number;
  humanReviewTrigger: string;
  auditSignal: string;
  limitation: string;
  workaround: string;
  nextAction: string;
};

export type CommandTrustEngineOutput = {
  id: string;
  recommendation: string;
  confidenceLevel: "high" | "medium" | "low";
  evidenceSource: string;
  riskScore: number;
  humanReviewTrigger: string;
  auditLog: string;
  validationStatus: "synthetic-validated" | "human-review-required" | "production-gated";
  lastUpdated: string;
};

export type CommandEvaluationGate = {
  id: string;
  name: string;
  state: CommandIntelligenceState;
  metric: string;
  evidence: string;
  threshold: string;
  currentControl: string;
  nextStep: string;
};

export type CommandToolAccessPlan = {
  id: string;
  domain: string;
  status: "contract-ready" | "synthetic-only" | "approval-required" | "blocked";
  standards: string[];
  safeMode: string;
  requiredControls: string[];
  blockedUntil: string;
};

export type CommandSafeModeControl = {
  control: string;
  status: "enforced" | "manual-gate" | "external-approval-required";
  blockedAction: string;
  workaround: string;
  productionGate: string;
};

export type CommandNextAction = {
  priority: "P0" | "P1" | "P2";
  action: string;
  owner: string;
  route: string;
  expectedOutcome: string;
};

export type CommandIntelligenceHubSummary = {
  service: "scrimed-command-intelligence-hub";
  status: "protected-command-intelligence-ready";
  route: "/pilot-workspace/access";
  apiRoute: string;
  proofStackStatus: typeof commandIntelligenceHubProofStackStatus;
  state: CommandIntelligenceState;
  score: number;
  mission: string;
  workspace: {
    tenantName: string;
    workspaceName: string;
    workspaceSlug: string;
    workspaceStatus: string;
  };
  metrics: CommandIntelligenceMetric[];
  evidenceCounts: {
    sessions: number;
    auditEvents: number;
    demoSnapshots: number;
    manualQaEvidencePackets: number;
    packetExports: number;
    unavailableSections: number;
  };
  agentCommander: {
    status: CommandIntelligenceState;
    controlPlaneAgents: number;
    specialistServices: number;
    planner: string;
    router: string;
    memoryLayers: number;
    mcpConnectors: number;
    approvalCheckpoints: number;
    observabilitySignals: number;
    coordinationModel: string;
  };
  buyerRoomReadiness: {
    state: CommandIntelligenceState;
    score: number;
    exportRoute: string;
    latestSnapshot: string;
  };
  workstreams: CommandIntelligenceWorkstream[];
  trustEngineOutputs: CommandTrustEngineOutput[];
  evaluationPipeline: CommandEvaluationGate[];
  toolAccessPlans: CommandToolAccessPlan[];
  safeModeControls: CommandSafeModeControl[];
  observability: {
    runtimeTraceSource: string;
    auditTraceCount: number;
    exportHistory: Array<{
      eventType: string;
      createdAt: string;
      actorUserId: string;
    }>;
    manualQaPacketHashes: string[];
    degradedSections: string[];
  };
  buyerDiligenceExport: {
    label: string;
    route: string;
    status: CommandIntelligenceState;
    includedArtifacts: string[];
    withheldItems: string[];
  };
  nextActions: CommandNextAction[];
  limitations: Array<{
    limitation: string;
    workaround: string;
    productionGate: string;
  }>;
  boundary: string;
  updatedAt: string;
};

export const commandIntelligenceHubProofStackStatus = "aal2-command-intelligence-hub";

export const commandIntelligenceHubBoundary =
  "SCRIMED Command Intelligence Hub is a protected synthetic-pilot command posture. It unifies tenant-scoped evidence, agents, Trust Engine outputs, QA posture, buyer diligence, MCP/tool-access plans, observability, and safe-mode boundaries. It does not accept PHI, store credentials, certify security or compliance, guarantee reimbursement, approve production connectors, or authorize live clinical, payer, imaging, device, or patient-facing execution.";

const updatedAt = "2026-06-18";

function hasAuditEvent(events: PilotAuditEventRecord[], eventType: string) {
  return events.some((event) => event.eventType === eventType);
}

function hasAnyAuditEvent(events: PilotAuditEventRecord[], eventTypes: string[]) {
  return events.some((event) => eventTypes.includes(event.eventType));
}

function stateScore(state: CommandIntelligenceState) {
  if (state === "ready") return 100;
  if (state === "review") return 65;
  return 25;
}

function rollupState(workstreams: CommandIntelligenceWorkstream[]): CommandIntelligenceState {
  if (workstreams.some((workstream) => workstream.state === "blocked")) return "blocked";
  if (workstreams.some((workstream) => workstream.state === "review")) return "review";
  return "ready";
}

function scoreWorkstreams(workstreams: CommandIntelligenceWorkstream[], unavailableSections: string[]) {
  const baseScore =
    workstreams.length === 0
      ? 0
      : Math.round(
          workstreams.reduce((total, workstream) => total + stateScore(workstream.state), 0) /
            workstreams.length
        );
  const degradedPenalty = Math.min(20, unavailableSections.length * 5);

  return Math.max(0, baseScore - degradedPenalty);
}

function latestSnapshotLabel(demoSnapshots: PilotDemoReadinessSnapshotRecord[]) {
  const snapshot = demoSnapshots[0];

  if (!snapshot) {
    return "No demo readiness snapshot retained yet.";
  }

  return `${snapshot.readinessState}, ${snapshot.readinessScore}%, ${snapshot.createdAt}`;
}

function packetExportEvents(auditEvents: PilotAuditEventRecord[]) {
  return auditEvents.filter((event) => event.eventType.includes("packet"));
}

function buildWorkstreams({
  auditEvents,
  buyerRoomScore,
  buyerRoomState,
  demoSnapshots,
  manualQaEvidencePackets,
  sessions,
  unavailableSections
}: {
  auditEvents: PilotAuditEventRecord[];
  buyerRoomScore: number;
  buyerRoomState: CommandIntelligenceState;
  demoSnapshots: PilotDemoReadinessSnapshotRecord[];
  manualQaEvidencePackets: QaManualRunEvidencePacketRecord[];
  sessions: PilotSessionRecord[];
  unavailableSections: string[];
}): CommandIntelligenceWorkstream[] {
  const hasSession = sessions.length > 0;
  const hasAuditTrail = auditEvents.length > 0;
  const hasBuyerExport = hasAuditEvent(auditEvents, "buyer-pilot-room-packet-downloaded");
  const hasEnterpriseExport = hasAuditEvent(auditEvents, "enterprise-proof-packet-downloaded");
  const hasDemoSnapshot = demoSnapshots.length > 0;
  const hasManualQa = manualQaEvidencePackets.length > 0 || hasAuditEvent(auditEvents, "manual-qa-evidence-packet-recorded");
  const hasAgentWorkspace = hasAnyAuditEvent(auditEvents, [
    "agent-work-order-created",
    "agent-work-order-transitioned",
    "agent-work-order-proof-packet-downloaded"
  ]);
  const hasTrustOps = hasAnyAuditEvent(auditEvents, [
    "trust-safety-incident-created",
    "trust-safety-incident-updated",
    "trust-safety-incident-packet-downloaded"
  ]);

  return [
    {
      id: "agent-commander",
      name: "Agent Commander Orchestration",
      state: hasAgentWorkspace ? "ready" : "review",
      signalType: "agent",
      owner: "SCRIMED AgentOS",
      evidence: hasAgentWorkspace
        ? "Agent Workspace audit activity is visible for persistent, human-reviewed work orders."
        : "AgentOS planner, router, registry, memory, approvals, sandbox, and audit contracts are active; create a synthetic work order to show durable agent coordination.",
      confidenceLevel: "high",
      riskScore: hasAgentWorkspace ? 18 : 35,
      humanReviewTrigger: "Any workflow transition, production connector request, or reviewer override.",
      auditSignal: hasAgentWorkspace ? "agent-workspace event present" : "agent-workspace event pending",
      limitation: "Command posture does not grant live tool credentials or autonomous clinical authority.",
      workaround: "Run synthetic work orders with reviewer checkpoints and packet exports.",
      nextAction: hasAgentWorkspace
        ? "Use the latest work-order event trail during operator review."
        : "Create a no-PHI work order for the highest-value buyer workflow."
    },
    {
      id: "buyer-room-readiness",
      name: "Buyer Room Readiness",
      state: buyerRoomState,
      signalType: "buyer",
      owner: "Enterprise Sales And Trust",
      evidence: `Buyer room score is ${buyerRoomScore}% with ${sessions.length} sessions, ${auditEvents.length} audit events, ${demoSnapshots.length} demo snapshots, and ${hasEnterpriseExport ? "an audited enterprise proof export" : "no audited enterprise proof export yet"}.`,
      confidenceLevel: hasSession && hasAuditTrail ? "high" : "medium",
      riskScore: buyerRoomState === "ready" ? 15 : buyerRoomState === "review" ? 42 : 72,
      humanReviewTrigger: "Any export sent externally, buyer-specific claim, live-data request, or production-readiness decision.",
      auditSignal: hasBuyerExport
        ? "buyer-pilot-room-packet-downloaded"
        : hasEnterpriseExport
          ? "enterprise-proof-packet-downloaded"
          : "buyer export not released yet",
      limitation: "Buyer readiness is based on synthetic pilot evidence, not live clinical or financial outcome validation.",
      workaround: "Pair buyer diligence export with explicit limitations, workarounds, and production gates.",
      nextAction: hasBuyerExport ? "Attach the latest export ID to buyer follow-up." : "Review the hub, then download the Buyer Diligence Export."
    },
    {
      id: "trust-engine",
      name: "Trust Engine Outputs",
      state: hasDemoSnapshot && hasAuditTrail ? "ready" : "review",
      signalType: "governance",
      owner: "TrustOS",
      evidence: hasDemoSnapshot
        ? "Demo readiness snapshot, audit events, Trust Cards, and human-review gates are available for diligence."
        : "Trust Card and policy contracts exist; a durable demo readiness snapshot is still recommended.",
      confidenceLevel: hasDemoSnapshot ? "high" : "medium",
      riskScore: hasDemoSnapshot ? 20 : 38,
      humanReviewTrigger: "Confidence below approved threshold, missing evidence, high uncertainty, or clinical/reimbursement language.",
      auditSignal: hasAuditTrail ? "append-only pilot audit activity present" : "audit trail pending first workspace action",
      limitation: "Trust Engine scores are governance posture signals, not clinical validation scores.",
      workaround: "Use human-review labels, source attribution, and blocked-claim language before external release.",
      nextAction: hasDemoSnapshot ? "Keep Trust Card evidence current before export." : "Save a demo readiness snapshot from the command center."
    },
    {
      id: "continuous-evaluation",
      name: "Continuous Evaluation Pipeline",
      state: hasManualQa && hasDemoSnapshot ? "ready" : "review",
      signalType: "evaluation",
      owner: "Quality Engineering",
      evidence: hasManualQa
        ? `${manualQaEvidencePackets.length} manual QA evidence packet${manualQaEvidencePackets.length === 1 ? "" : "s"} retained with no-secret attestations.`
        : "Public smoke, protected fail-closed checks, and manual QA packet scaffolding are active; the first retained AAL2 manual QA packet is still recommended.",
      confidenceLevel: hasManualQa ? "high" : "medium",
      riskScore: hasManualQa ? 22 : 44,
      humanReviewTrigger: "Failed smoke, missing AAL2 proof, unresolved safety gate, or degraded evidence section.",
      auditSignal: hasManualQa ? "manual QA packet retained or audited" : "manual QA packet pending",
      limitation: "Evaluation remains workflow-evidence focused and does not claim external clinical benchmark superiority.",
      workaround: "Measure workflow success, safety gates, latency/cost posture, and human approvals before broader claims.",
      nextAction: hasManualQa ? "Use packet hashes in the buyer export." : "Persist the first no-secret manual QA packet after a human AAL2 run."
    },
    {
      id: "mcp-tool-access",
      name: "MCP And Tool Access Architecture",
      state: "review",
      signalType: "tooling",
      owner: "Interoperability Engineering",
      evidence: "FHIR, HL7, DICOM/DICOMweb, claims, payer, research, scheduling, prior-authorization, and device tool plans are scaffolded as approval-gated contracts.",
      confidenceLevel: "medium",
      riskScore: 50,
      humanReviewTrigger: "Any request for live connector credentials, PHI-bearing source data, EHR writeback, payer submission, or imaging ingestion.",
      auditSignal: "tool access remains contract-only",
      limitation: "No production EHR, payer, imaging, device, or research connector is authorized in protected synthetic pilots.",
      workaround: "Use synthetic fixtures, connector contracts, conformance evidence, and customer-specific security review.",
      nextAction: "Promote the first customer-requested connector into a scoped connector design packet."
    },
    {
      id: "observability",
      name: "Observability And Export History",
      state: hasAuditTrail ? "ready" : "review",
      signalType: "governance",
      owner: "Operations",
      evidence: `${auditEvents.length} workspace audit event${auditEvents.length === 1 ? "" : "s"} and ${packetExportEvents(auditEvents).length} packet export event${packetExportEvents(auditEvents).length === 1 ? "" : "s"} are visible.`,
      confidenceLevel: hasAuditTrail ? "high" : "medium",
      riskScore: hasAuditTrail ? 18 : 40,
      humanReviewTrigger: "Runtime error, degraded evidence query, export mismatch, or audit trail gap.",
      auditSignal: hasAuditTrail ? "workspace audit trail visible" : "audit trail empty",
      limitation: "Runtime log monitoring is currently operator-run evidence, not a staffed managed SOC/MDR commitment.",
      workaround: "Use release smoke, Vercel log checks, audit-event review, and manual QA evidence until monitoring ownership is approved.",
      nextAction: unavailableSections.length > 0
        ? "Investigate degraded evidence sections before buyer export."
        : "Keep smoke and audit review attached to each release."
    },
    {
      id: "trust-safety-operations",
      name: "Trust Safety Operations",
      state: hasTrustOps ? "ready" : "review",
      signalType: "governance",
      owner: "Trust Safety Operations",
      evidence: hasTrustOps
        ? "TrustOps incident activity or review-packet evidence is visible in the workspace audit trail."
        : "TrustOps operating model is available, but no tenant incident activity is visible for this workspace yet.",
      confidenceLevel: hasTrustOps ? "high" : "medium",
      riskScore: hasTrustOps ? 20 : 38,
      humanReviewTrigger: "Security, privacy, safety, legal, support, or incident-response question.",
      auditSignal: hasTrustOps ? "trust-safety tenant event present" : "trust-safety tenant event pending",
      limitation: "TrustOps pilot evidence is not a staffed 24/7 managed SOC/MDR commitment.",
      workaround: "Use synthetic incident records, review packets, and clear escalation ownership during pilots.",
      nextAction: hasTrustOps
        ? "Use the latest TrustOps incident evidence in diligence."
        : "Create or review a synthetic TrustOps incident for security and safety buyer review."
    },
    {
      id: "operator-safe-mode",
      name: "Operator Safe Mode",
      state: "ready",
      signalType: "safe-mode",
      owner: "Security, Privacy, Legal, Clinical Governance",
      evidence: "PHI, payer member data, production credentials, autonomous diagnosis, live patient outreach, payer submissions, and reimbursement guarantees remain denied.",
      confidenceLevel: "high",
      riskScore: 12,
      humanReviewTrigger: "Any attempt to introduce live clinical data, production credentials, patient-facing execution, or compliance/security certification claims.",
      auditSignal: "safe-mode boundary enforced in protected workspace copy, exports, and route headers",
      limitation: "Safe mode limits automation depth until enterprise approvals exist.",
      workaround: "Advance with synthetic pilots, metadata-only diligence, manual QA packets, and signed production gates.",
      nextAction: "Keep every buyer-facing packet within the synthetic-only boundary."
    }
  ];
}

function buildTrustEngineOutputs({
  auditEvents,
  demoSnapshots,
  manualQaEvidencePackets,
  sessions
}: {
  auditEvents: PilotAuditEventRecord[];
  demoSnapshots: PilotDemoReadinessSnapshotRecord[];
  manualQaEvidencePackets: QaManualRunEvidencePacketRecord[];
  sessions: PilotSessionRecord[];
}): CommandTrustEngineOutput[] {
  return [
    {
      id: "synthetic-workflow-readiness",
      recommendation:
        sessions.length > 0
          ? "Proceed with synthetic buyer workflow review under human supervision."
          : "Create a synthetic evaluation session before external buyer proof review.",
      confidenceLevel: sessions.length > 0 ? "high" : "medium",
      evidenceSource: `${sessions.length} durable synthetic session${sessions.length === 1 ? "" : "s"}.`,
      riskScore: sessions.length > 0 ? 20 : 58,
      humanReviewTrigger: "No retained session, buyer-specific claim, or production workflow request.",
      auditLog: hasAuditEvent(auditEvents, "synthetic-session-created")
        ? "synthetic-session-created"
        : "synthetic session audit pending",
      validationStatus: sessions.length > 0 ? "synthetic-validated" : "human-review-required",
      lastUpdated: updatedAt
    },
    {
      id: "buyer-export-release",
      recommendation:
        demoSnapshots.length > 0
          ? "Buyer Diligence Export can be prepared after operator review."
          : "Save a demo readiness snapshot before releasing diligence externally.",
      confidenceLevel: demoSnapshots.length > 0 ? "high" : "medium",
      evidenceSource: `${demoSnapshots.length} demo readiness snapshot${demoSnapshots.length === 1 ? "" : "s"}.`,
      riskScore: demoSnapshots.length > 0 ? 24 : 45,
      humanReviewTrigger: "External packet release, legal/privacy/security question, or pricing commitment.",
      auditLog: hasAuditEvent(auditEvents, "buyer-pilot-room-packet-downloaded")
        ? "buyer-pilot-room-packet-downloaded"
        : "buyer export release audit pending",
      validationStatus: "human-review-required",
      lastUpdated: updatedAt
    },
    {
      id: "manual-qa-posture",
      recommendation:
        manualQaEvidencePackets.length > 0
          ? "Manual QA evidence can be cited by packet hash."
          : "Retain the first no-secret manual QA packet after the next human AAL2 workflow run.",
      confidenceLevel: manualQaEvidencePackets.length > 0 ? "high" : "medium",
      evidenceSource: `${manualQaEvidencePackets.length} retained manual QA evidence packet${manualQaEvidencePackets.length === 1 ? "" : "s"}.`,
      riskScore: manualQaEvidencePackets.length > 0 ? 18 : 42,
      humanReviewTrigger: "Missing manual QA evidence, failed smoke, or token-handling question.",
      auditLog: hasAuditEvent(auditEvents, "manual-qa-evidence-packet-recorded")
        ? "manual-qa-evidence-packet-recorded"
        : "manual QA evidence record pending",
      validationStatus: manualQaEvidencePackets.length > 0 ? "synthetic-validated" : "human-review-required",
      lastUpdated: updatedAt
    },
    {
      id: "production-execution-boundary",
      recommendation: "Do not activate live clinical, payer, EHR, imaging, device, or patient-facing execution.",
      confidenceLevel: "high",
      evidenceSource: "Protected pilot workspace boundary and safe-mode controls.",
      riskScore: 8,
      humanReviewTrigger: "Any PHI, production credential, connector authorization, reimbursement, or clinical authority request.",
      auditLog: "production request must be denied or escalated",
      validationStatus: "production-gated",
      lastUpdated: updatedAt
    }
  ];
}

function buildEvaluationPipeline({
  demoSnapshots,
  manualQaEvidencePackets,
  sessions
}: {
  demoSnapshots: PilotDemoReadinessSnapshotRecord[];
  manualQaEvidencePackets: QaManualRunEvidencePacketRecord[];
  sessions: PilotSessionRecord[];
}): CommandEvaluationGate[] {
  return [
    {
      id: "groundedness",
      name: "Evidence Groundedness",
      state: sessions.length > 0 ? "ready" : "review",
      metric: "Synthetic outputs must map to evidence sources, Trust Cards, and blocked claims.",
      evidence: `${sessions.length} retained synthetic session${sessions.length === 1 ? "" : "s"} available for review.`,
      threshold: "No external claim without source attribution and human release review.",
      currentControl: "Trust Card fields, evidence source attribution, buyer export control matrix.",
      nextStep: "Add row-level scorer outputs once production evaluation traces are approved."
    },
    {
      id: "hallucination-safety",
      name: "Hallucination And Safety Guard",
      state: "ready",
      metric: "Unsafe clinical, legal, reimbursement, credential, and production claims must be blocked.",
      evidence: "Safe-mode boundary denies autonomous diagnosis, treatment, payer submission, and PHI ingestion.",
      threshold: "Fail closed on high-risk claims or unsupported recommendations.",
      currentControl: "Operator Safe Mode, TrustOS language boundaries, and protected route fail-closed smoke.",
      nextStep: "Add adversarial prompt fixtures and unsafe-claim regression cases."
    },
    {
      id: "workflow-success",
      name: "Workflow Success",
      state: demoSnapshots.length > 0 ? "ready" : "review",
      metric: "Buyer workflow proof should include readiness score, required actions, and evidence counts.",
      evidence: `${demoSnapshots.length} demo readiness snapshot${demoSnapshots.length === 1 ? "" : "s"} retained.`,
      threshold: "Formal buyer review should include a recent snapshot or documented empty-state workaround.",
      currentControl: "Pilot Demo Readiness Command Center and durable snapshot packets.",
      nextStep: "Tie future customer pilots to before/after workflow baselines."
    },
    {
      id: "latency-cost",
      name: "Latency And Cost Tracking",
      state: "review",
      metric: "Each agent task should capture model/provider, latency, token/cost estimate, retry count, and fallback.",
      evidence: "Model-router and observability contracts exist; live provider telemetry is not yet connected.",
      threshold: "Production pilots require per-task cost and latency traces before scaling.",
      currentControl: "Synthetic model-router policy and command workstream risk scoring.",
      nextStep: "Persist model/provider and task-cost metadata on future work-order events."
    },
    {
      id: "drift-monitoring",
      name: "Drift And Regression Monitoring",
      state: "review",
      metric: "Track changed outputs, degraded evidence retrieval, safety overrides, and reviewer disagreement.",
      evidence: "Manual QA packets and audit events create the first release evidence ledger.",
      threshold: "No production claim until online monitoring, alert routing, and owner SLAs are approved.",
      currentControl: "Public smoke, manual QA evidence packets, and TrustOps operating model.",
      nextStep: "Add scheduled evaluation-set replay after CI token governance is approved."
    },
    {
      id: "human-feedback",
      name: "Human Feedback And Review",
      state: manualQaEvidencePackets.length > 0 ? "ready" : "review",
      metric: "Human review status, overrides, disposition, and improvement actions must be retained.",
      evidence: `${manualQaEvidencePackets.length} no-secret manual QA evidence packet${manualQaEvidencePackets.length === 1 ? "" : "s"} retained.`,
      threshold: "Human approval required before external packet release or production promotion.",
      currentControl: "AAL2 manual QA capture, TrustOS reviewer dispositions, and protected packet downloads.",
      nextStep: "Promote reviewer disposition analytics into the command hub once enough pilot history exists."
    }
  ];
}

function buildToolAccessPlans(): CommandToolAccessPlan[] {
  return [
    {
      id: "ehr-fhir-hl7",
      domain: "EHR And Clinical Records",
      status: "contract-ready",
      standards: ["FHIR R4/US Core", "SMART App Launch", "HL7 v2", "C-CDA", "SNOMED CT", "LOINC", "RxNorm", "ICD-10/ICD-11"],
      safeMode: "Synthetic fixtures and conformance contracts only.",
      requiredControls: ["BAA/DPA path where applicable", "Purpose-of-use policy", "Consent and break-glass model", "No writeback until approved"],
      blockedUntil: "Customer security, privacy, clinical governance, connector validation, and launch authorization are signed."
    },
    {
      id: "claims-prior-auth",
      domain: "Claims, Prior Authorization, And Payer Operations",
      status: "synthetic-only",
      standards: ["X12 270/271", "X12 278", "X12 835/837", "FHIR Da Vinci patterns", "CPT/HCPCS", "ICD-10"],
      safeMode: "No payer submission, reimbursement determination, or member-data processing.",
      requiredControls: ["Payer test environment", "Human review", "No guarantee language", "Appeal/authorization trace evidence"],
      blockedUntil: "Payer-specific authorization, legal review, and production transaction controls are complete."
    },
    {
      id: "imaging-dicom",
      domain: "Imaging And Diagnostic Workflows",
      status: "approval-required",
      standards: ["DICOM", "DICOMweb", "IHE profiles", "Customer-specific XICOM-labeled exchange contracts"],
      safeMode: "No diagnostic imaging ingestion, interpretation, or autonomous radiology claims.",
      requiredControls: ["De-identification plan", "Imaging viewer/data contract", "Radiologist governance", "FDA/intended-use review"],
      blockedUntil: "Qualified clinical, regulatory, privacy, and imaging partner review approves the scope."
    },
    {
      id: "research-trials",
      domain: "Research, Trials, And Publications",
      status: "contract-ready",
      standards: ["ClinicalTrials.gov-style metadata", "FHIR ResearchStudy/ResearchSubject", "PubMed/source attribution"],
      safeMode: "Synthetic matching and evidence retrieval only; no patient outreach or enrollment claim.",
      requiredControls: ["IRB/customer policy review where applicable", "Human coordinator approval", "Evidence provenance", "Eligibility uncertainty labels"],
      blockedUntil: "Research governance and trial sponsor/customer authorization are complete."
    },
    {
      id: "scheduling-referrals",
      domain: "Scheduling, Referrals, And Access",
      status: "synthetic-only",
      standards: ["FHIR Scheduling", "FHIR ServiceRequest", "HL7 referral messages", "Provider directory contracts"],
      safeMode: "No patient contact, scheduling mutation, or live referral routing.",
      requiredControls: ["Queue ownership", "Patient consent", "Notification policy", "Manual release gate"],
      blockedUntil: "Customer workflow owners approve patient-facing operations and escalation processes."
    },
    {
      id: "wearables-devices",
      domain: "Wearables, Devices, And Remote Monitoring",
      status: "approval-required",
      standards: ["FHIR Observation", "IEEE 11073", "Device-specific APIs", "CMS ACCESS-aligned reporting concepts"],
      safeMode: "No remote monitoring claim, emergency triage, billing assurance, or medical-device integration.",
      requiredControls: ["Device vendor agreement", "Alert fatigue policy", "Clinician review", "Reimbursement/legal review"],
      blockedUntil: "Device, clinical safety, reimbursement, and customer operating controls are signed."
    }
  ];
}

function buildSafeModeControls(): CommandSafeModeControl[] {
  return [
    {
      control: "No PHI Or Patient Identifiers",
      status: "enforced",
      blockedAction: "Uploading, pasting, storing, or processing live PHI, payer member identifiers, medical records, or imaging.",
      workaround: "Use synthetic fixtures, metadata-only packets, and de-identified contract samples only after review.",
      productionGate: "Signed BAA/DPA path where applicable, privacy review, data classification, retention, and incident response approval."
    },
    {
      control: "No Production Credentials",
      status: "enforced",
      blockedAction: "Storing EHR, payer, imaging, device, IdP, SMTP, API, or model provider secrets in the app or packets.",
      workaround: "Use local operator sessions, Vercel-managed runtime variables, and no-secret packet attestations.",
      productionGate: "Approved secret manager, rotation, scoped credentials, access review, and monitoring."
    },
    {
      control: "No Autonomous Clinical Authority",
      status: "enforced",
      blockedAction: "Diagnosis, treatment, clinical decision execution, patient triage, emergency guidance, or care-plan execution.",
      workaround: "Use human-reviewed draft intelligence and explicit uncertainty labels.",
      productionGate: "Clinical governance, intended-use review, validation, licensed reviewer workflow, and launch approval."
    },
    {
      control: "No Payer Submission Or Reimbursement Guarantee",
      status: "enforced",
      blockedAction: "Submitting claims, prior authorizations, appeals, billing changes, or guaranteed reimbursement outcomes.",
      workaround: "Use synthetic RCM review, denial-risk intelligence, and buyer-approved measurement baselines.",
      productionGate: "Payer/customer authorization, billing compliance review, transaction controls, and human release workflow."
    },
    {
      control: "No Security Or Compliance Certification Claim",
      status: "manual-gate",
      blockedAction: "Claiming SOC 2, HIPAA certification, FDA clearance, breach determination, or legal conclusion.",
      workaround: "Use HIPAA-ready/SOC 2-ready posture language, evidence packets, and qualified external review gates.",
      productionGate: "Qualified legal, security, privacy, regulatory, and audit review."
    }
  ];
}

function buildNextActions({
  demoSnapshots,
  manualQaEvidencePackets,
  sessions
}: {
  demoSnapshots: PilotDemoReadinessSnapshotRecord[];
  manualQaEvidencePackets: QaManualRunEvidencePacketRecord[];
  sessions: PilotSessionRecord[];
}): CommandNextAction[] {
  return [
    {
      priority: sessions.length === 0 ? "P0" : "P1",
      action: sessions.length === 0 ? "Create the first synthetic evaluation session" : "Refresh the synthetic session set before buyer review",
      owner: "Pilot operator",
      route: "/pilot-workspace/access",
      expectedOutcome: "Durable no-PHI product evidence for the protected workspace."
    },
    {
      priority: demoSnapshots.length === 0 ? "P0" : "P1",
      action: demoSnapshots.length === 0 ? "Save a demo readiness snapshot" : "Keep the latest demo readiness snapshot current",
      owner: "Demo lead",
      route: "/pilot-workspace/access",
      expectedOutcome: "A retained readiness score, required actions, buyer brief, and runbook."
    },
    {
      priority: manualQaEvidencePackets.length === 0 ? "P1" : "P2",
      action: manualQaEvidencePackets.length === 0 ? "Persist the first manual AAL2 QA evidence packet" : "Use retained manual QA packet hashes in diligence",
      owner: "Quality engineering",
      route: "/pilot-workspace/access",
      expectedOutcome: "No-secret human-run QA proof visible in Buyer Diligence Export."
    },
    {
      priority: "P1",
      action: "Create a synthetic Agent Workspace work order for the buyer's priority workflow",
      owner: "Agent Commander",
      route: "/pilot-workspace/access",
      expectedOutcome: "Persistent task orchestration evidence with reviewer checkpoints and audit history."
    },
    {
      priority: "P2",
      action: "Promote one MCP connector into a scoped design packet",
      owner: "Interoperability engineering",
      route: "/interoperability",
      expectedOutcome: "Customer-ready connector plan with standards, blocked claims, controls, and production gates."
    }
  ];
}

export function deriveCommandIntelligenceHub({
  auditEvents,
  demoSnapshots,
  manualQaEvidencePackets,
  sessions,
  unavailableSections,
  workspace
}: {
  workspace: PilotWorkspaceRecord;
  sessions: PilotSessionRecord[];
  auditEvents: PilotAuditEventRecord[];
  demoSnapshots: PilotDemoReadinessSnapshotRecord[];
  manualQaEvidencePackets: QaManualRunEvidencePacketRecord[];
  unavailableSections: string[];
}): CommandIntelligenceHubSummary {
  const agentOS = getAgentOSSummary();
  const buyerRoom = deriveBuyerPilotRoom({
    workspace,
    sessions,
    auditEvents,
    demoSnapshots,
    manualQaEvidencePackets,
    unavailableSections
  });
  const exports = packetExportEvents(auditEvents);
  const workstreams = buildWorkstreams({
    auditEvents,
    buyerRoomScore: buyerRoom.score,
    buyerRoomState: buyerRoom.state,
    demoSnapshots,
    manualQaEvidencePackets,
    sessions,
    unavailableSections
  });
  const state = rollupState(workstreams);
  const score = scoreWorkstreams(workstreams, unavailableSections);

  return {
    service: "scrimed-command-intelligence-hub",
    status: "protected-command-intelligence-ready",
    route: "/pilot-workspace/access",
    apiRoute: `/api/pilot-workspaces/${workspace.slug}/command-intelligence`,
    proofStackStatus: commandIntelligenceHubProofStackStatus,
    state,
    score,
    mission:
      "Unify SCRIMED agents, tenant evidence, buyer diligence, Trust Engine outputs, safe-mode controls, MCP/tool readiness, observability, and next actions into one protected operating posture.",
    workspace: {
      tenantName: workspace.tenantName,
      workspaceName: workspace.name,
      workspaceSlug: workspace.slug,
      workspaceStatus: workspace.status
    },
    metrics: [
      {
        label: "Command score",
        value: `${score}%`,
        detail: "Weighted from agent, buyer, evaluation, trust, tooling, observability, and safe-mode workstreams."
      },
      {
        label: "Agent Commander",
        value: `${agentOS.controlPlane.length + agentOS.specialistServices.length}`,
        detail: "Control-plane and specialist services governed by AgentOS contracts."
      },
      {
        label: "Trust evidence",
        value: `${auditEvents.length}`,
        detail: "Append-only audit events visible to this tenant workspace."
      },
      {
        label: "Packet exports",
        value: `${exports.length}`,
        detail: "Audited packet-release events available for buyer, demo, enterprise, TrustOps, or work-order diligence."
      },
      {
        label: "Manual QA",
        value: `${manualQaEvidencePackets.length}`,
        detail: "No-secret AAL2 manual QA evidence packets retained in this workspace."
      },
      {
        label: "Safe mode",
        value: "Enforced",
        detail: "No PHI, no live clinical execution, no payer submission, no production credentials, no unsupported certification claims."
      }
    ],
    evidenceCounts: {
      sessions: sessions.length,
      auditEvents: auditEvents.length,
      demoSnapshots: demoSnapshots.length,
      manualQaEvidencePackets: manualQaEvidencePackets.length,
      packetExports: exports.length,
      unavailableSections: unavailableSections.length
    },
    agentCommander: {
      status: workstreams.find((workstream) => workstream.id === "agent-commander")?.state ?? "review",
      controlPlaneAgents: agentOS.controlPlane.length,
      specialistServices: agentOS.specialistServices.length,
      planner: "Planner Agent decomposes requests into governed task plans.",
      router: "Router Agent selects specialist services, MCP/tool contracts, and human checkpoints.",
      memoryLayers: agentOS.memoryFabric.length,
      mcpConnectors: agentOS.mcpConnectorFramework.length,
      approvalCheckpoints: agentOS.humanApprovalCheckpoints.length,
      observabilitySignals: agentOS.observabilitySignals.length,
      coordinationModel:
        "Specialized agents coordinate through shared memory, RBAC permissions, TrustQA, sandbox scopes, audit channels, and human approval checkpoints."
    },
    buyerRoomReadiness: {
      state: buyerRoom.state,
      score: buyerRoom.score,
      exportRoute: buyerRoom.diligenceExport.route,
      latestSnapshot: latestSnapshotLabel(demoSnapshots)
    },
    workstreams,
    trustEngineOutputs: buildTrustEngineOutputs({
      auditEvents,
      demoSnapshots,
      manualQaEvidencePackets,
      sessions
    }),
    evaluationPipeline: buildEvaluationPipeline({
      demoSnapshots,
      manualQaEvidencePackets,
      sessions
    }),
    toolAccessPlans: buildToolAccessPlans(),
    safeModeControls: buildSafeModeControls(),
    observability: {
      runtimeTraceSource:
        "Workspace audit events, manual QA packets, public smoke, protected fail-closed checks, and operator-run deployment log scans.",
      auditTraceCount: auditEvents.length,
      exportHistory: exports.slice(0, 12).map((event) => ({
        eventType: event.eventType,
        createdAt: event.createdAt,
        actorUserId: event.actorUserId
      })),
      manualQaPacketHashes: manualQaEvidencePackets.slice(0, 8).map((packet) => packet.packetSha256),
      degradedSections: unavailableSections
    },
    buyerDiligenceExport: {
      label: buyerRoom.diligenceExport.label,
      route: buyerRoom.diligenceExport.route,
      status: buyerRoom.diligenceExport.status,
      includedArtifacts: [
        ...buyerRoom.diligenceExport.includedArtifacts,
        "Command Intelligence Hub workstreams, Trust Engine outputs, MCP/tool readiness, observability posture, and safe-mode controls"
      ],
      withheldItems: buyerRoom.diligenceExport.withheldItems
    },
    nextActions: buildNextActions({
      demoSnapshots,
      manualQaEvidencePackets,
      sessions
    }),
    limitations: [
      {
        limitation: "The hub is a command posture and diligence layer, not an autonomous execution runtime.",
        workaround: "Use Agent Workspace work orders, human checkpoints, and audited exports for governed synthetic workflow proof.",
        productionGate: "Approved scoped tools, customer-specific credentials, production monitoring, and human operating procedures."
      },
      {
        limitation: "Continuous evaluation is workflow-evidence oriented; it is not an external clinical benchmark or safety certification.",
        workaround: "Use smoke, fail-closed checks, manual QA packets, reviewer dispositions, and future evaluation sets.",
        productionGate: "Licensed clinical review, external validation, regulatory/intended-use review, and customer deployment controls."
      },
      {
        limitation: "MCP/tool connectors are contract-first and synthetic-only until approved.",
        workaround: "Document standards, scopes, blocked actions, approvals, and conformance fixtures before any live connector.",
        productionGate: "BAA/DPA path where applicable, security review, connector validation, tenant credentials, and launch authorization."
      },
      {
        limitation: "Runtime monitoring evidence is operator-run today, not a contracted managed SOC/MDR service.",
        workaround: "Pair release smoke, Vercel runtime log review, TrustOps incidents, and audit trails during pilots.",
        productionGate: "Approved staffing, alert routing, escalation SLAs, incident response, and customer support agreements."
      }
    ],
    boundary: commandIntelligenceHubBoundary,
    updatedAt
  };
}
