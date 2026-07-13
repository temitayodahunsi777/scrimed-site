import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import { scrimedSafetyPolicyVersion } from "./scrimedSafetyGovernance";
import { getInteroperabilityConformanceEvaluationSummary } from "./interoperabilityConformanceEvaluations";

export type EnterpriseInfrastructureDomain =
  | "interoperability"
  | "imaging"
  | "patient_admin"
  | "revenue_cycle"
  | "network_security"
  | "compute_runtime"
  | "data_platform"
  | "agent_orchestration"
  | "market_motion";

export type EnterpriseInfrastructureReadinessStatus =
  | "ready_for_synthetic_demo"
  | "implementation_ready_metadata"
  | "requires_customer_discovery"
  | "blocked_until_approval";

export type EnterpriseInfrastructureCapability = {
  id: string;
  domain: EnterpriseInfrastructureDomain;
  name: string;
  buyerProblem: string;
  standardsOrSystems: string[];
  currentScrimedAsset: string;
  readinessStatus: EnterpriseInfrastructureReadinessStatus;
  syntheticDemoPath: string;
  requiredCustomerInputs: string[];
  integrationPattern: string;
  validationMethod: string;
  safetyBoundary: string;
  revenueMotion: string;
  competitivePattern: string;
  nextBuildStep: string;
  humanReviewRequired: true;
  blockedActions: string[];
  auditHash: string;
};

export type EnterpriseInfrastructureIntegrationPath = {
  id: string;
  from: string;
  through: string;
  to: string;
  payloadClass: "synthetic_event" | "metadata_only" | "deidentified_fixture" | "customer_discovery_artifact";
  allowedMode: string;
  blockedMode: string;
  requiredApprovals: string[];
  fallbackPath: string;
  observability: string[];
};

export type EnterpriseInfrastructureScorecard = {
  totalCapabilities: number;
  syntheticReadyCount: number;
  customerDiscoveryRequiredCount: number;
  blockedCount: number;
  standardsCovered: string[];
  buyerReadinessScore: number;
  integrationReadinessScore: number;
  securityReadinessScore: number;
  revenueReadinessScore: number;
  productionAuthority: false;
  auditHash: string;
};

export type EnterpriseInfrastructureSalesMotion = {
  id: string;
  buyer: string;
  pitch: string;
  proofRoute: string;
  revenueStream: string;
  expansionPath: string;
  evidenceRequiredBeforeClaim: string;
};

export type EnterpriseInfrastructureDiscoveryQuestion = {
  id: string;
  category:
    | "systems_inventory"
    | "interoperability"
    | "imaging"
    | "payer_rcm"
    | "network_security"
    | "compute_runtime"
    | "governance"
    | "commercial_fit";
  prompt: string;
  acceptedInput: string;
  forbiddenInput: string;
  whyItMatters: string;
  mapsToCapabilityIds: string[];
  humanReviewRequired: true;
};

export type EnterpriseInfrastructurePilotScope = {
  id: string;
  name: string;
  buyerTrigger: string;
  includedCapabilities: string[];
  syntheticInputs: string[];
  proofOutputs: string[];
  acceptanceCriteria: string[];
  commercialModel: string;
  priceBandSignal: string;
  noGoBoundary: string;
  nextHumanAction: string;
  auditHash: string;
};

export type EnterpriseInfrastructureProofPacketItem = {
  id: string;
  artifact: string;
  owner: string;
  requiredBefore: string;
  noPhiRule: string;
  reviewGate: string;
};

export type EnterpriseInfrastructurePilotRecommendationInput = {
  id: string;
  buyerRole: string;
  systemsMentioned: string[];
  workflowPriorities: string[];
  deploymentConstraints: string[];
  desiredOutcome: string;
};

export type EnterpriseInfrastructurePilotRecommendation = {
  inputId: string;
  recommendedPilotScopeId: string;
  runnerUpPilotScopeIds: string[];
  score: number;
  rationale: string;
  requiredDiscoveryQuestionIds: string[];
  proofPacketItemIds: string[];
  revenueMotion: string;
  humanReviewRequired: true;
  noGoBoundaries: string[];
  auditHash: string;
};

export type EnterpriseInfrastructureBuyerPacket = {
  id: string;
  recommendationInputId: string;
  buyerRole: string;
  recommendedPilotScopeId: string;
  meetingAgenda: string[];
  demoSequence: string[];
  decisionCriteria: string[];
  requiredArtifacts: string[];
  followUpOutline: string[];
  commercialPosition: string;
  blockedClaims: string[];
  nextSafeAction: string;
  humanReviewRequired: true;
  auditHash: string;
};

export type EnterpriseInfrastructureDecisionReadinessScorecard = {
  id: string;
  buyerPacketId: string;
  buyerRole: string;
  recommendedPilotScopeId: string;
  readinessStage: "buyer_review_ready" | "evidence_collection_required" | "blocked_until_qualified_review";
  procurementReadinessScore: number;
  securityReviewScore: number;
  clinicalSafetyScore: number;
  commercialReadinessScore: number;
  evidenceCompletenessScore: number;
  blockedDecisionReasons: string[];
  requiredNextEvidence: string[];
  executiveDecisionPrompt: string;
  safeClosePlan: string[];
  humanReviewRequired: true;
  productionAuthority: false;
  auditHash: string;
};

export type EnterpriseInfrastructureProcurementActionPlan = {
  id: string;
  decisionScorecardId: string;
  buyerPacketId: string;
  buyerRole: string;
  recommendedPilotScopeId: string;
  ownerRoles: string[];
  gateSequence: string[];
  targetWindow: string;
  evidenceToCollect: string[];
  blockerToResolve: string[];
  escalationTrigger: string;
  completionCriteria: string[];
  safeOperatorScript: string[];
  handoffArtifacts: string[];
  humanReviewRequired: true;
  productionAuthority: false;
  auditHash: string;
};

export type EnterpriseInfrastructureConformanceControlPack = {
  id: string;
  status: "synthetic_evidence_ready" | "attention_required";
  evaluationCount: number;
  syntheticPassed: number;
  liveBlocked: number;
  supportedLanes: string[];
  requiredReviewRoles: string[];
  evidenceRoutes: string[];
  releaseCriteria: string[];
  commercialOffer: string;
  expansionPath: string;
  humanReviewRequired: true;
  productionAuthority: false;
  auditHash: string;
};

export type EnterpriseInfrastructureCompetitiveDesignPattern = {
  id: string;
  sourceOrganization: string;
  publicSourceUrl: string;
  observedMarketPattern: string;
  scrimedApplication: string;
  scrimedDifferentiation: string;
  safetyBoundary: string;
};

export const enterpriseHealthcareInfrastructureApiRoute = "/api/enterprise-healthcare-infrastructure";
export const enterpriseHealthcareInfrastructureBriefRoute = "/api/enterprise-healthcare-infrastructure/brief";
export const enterpriseHealthcareInfrastructurePageRoute = "/enterprise-healthcare-infrastructure";
export const enterpriseHealthcareInfrastructureStatus =
  "enterprise-healthcare-infrastructure-readiness-active-no-phi";

export const enterpriseHealthcareInfrastructureBoundary =
  "SCRIMED Enterprise Healthcare Infrastructure Readiness maps hospital IT, interoperability, imaging, security, compute, data, agent, and sales readiness into original SCRIMED proof surfaces. It is synthetic/metadata-only and does not authorize live PHI, production EHR/PACS/RIS/HIS/VPN/database/firewall connector use, autonomous clinical care, final imaging interpretation, payer submission, EHR writeback, certification claims, customer go-live, or competitor proprietary copying.";

const blockedActions = [
  "No live PHI, ePHI, source charts, production patient identifiers, or raw connector payloads",
  "No autonomous diagnosis, treatment, prescribing, triage, patient outreach, or final imaging interpretation",
  "No EHR writeback, PACS/RIS/HIS mutation, payer submission, claim filing, prior-authorization submission, or billing submission",
  "No production connector approval for HL7, FHIR, DICOM, DICOMweb, X12, VPN, Virtual Machines, databases, firewalls, or integration engines",
  "No HIPAA, SOC 2, HITRUST, FDA, ONC, clinical validation, customer go-live, revenue guarantee, or security assurance claim"
];

const standardsCovered = [
  "FHIR",
  "HL7 v2 ADT",
  "HL7 v2 ORM/ORU",
  "DICOM",
  "DICOMweb",
  "X12",
  "XICOM alias mapping for X12/DICOM conversations",
  "RIS",
  "HIS",
  "PACS",
  "VNA",
  "Integration Engines",
  "VPN",
  "Virtual Machines",
  "Client/Server Architecture",
  "Databases",
  "Firewalls",
  "Customer VPC",
  "Air-gapped edge runtime"
];

export const enterpriseInfrastructureCompetitiveDesignPatterns: EnterpriseInfrastructureCompetitiveDesignPattern[] = [
  {
    id: "unified-data-workflow-intelligence",
    sourceOrganization: "Oracle Health",
    publicSourceUrl: "https://www.oracle.com/health/clinical-suite/clinical-ai-agent/",
    observedMarketPattern:
      "Leading healthcare platforms unify clinical, operational, and financial context before coordinating specialized AI workflows.",
    scrimedApplication:
      "Bind SCRIMED context, interoperability, workflow, TrustOps, and revenue-cycle modules through one governed evidence envelope.",
    scrimedDifferentiation:
      "SCRIMED keeps every consequential action approval-gated and makes retained NO-GO boundaries machine-readable.",
    safetyBoundary: "Public architecture pattern only; no proprietary implementation, content, customer data, or claims are copied."
  },
  {
    id: "one-integration-governed-orchestration",
    sourceOrganization: "Aidoc",
    publicSourceUrl: "https://www.aidoc.com/platform/aios/",
    observedMarketPattern:
      "Enterprise buyers value one integration surface that orchestrates workflows and exposes validation, drift, override, and impact signals.",
    scrimedApplication:
      "Use one SCRIMED integration control pack across FHIR, SMART, HL7 v2, DICOMweb, X12, integration engines, and human review.",
    scrimedDifferentiation:
      "SCRIMED covers clinical, patient-access, payer, operational, and trust workflows while preserving no-authority defaults.",
    safetyBoundary: "No imaging algorithm, diagnostic claim, regulatory status, or proprietary workflow is mirrored."
  },
  {
    id: "grounded-healthcare-orchestrator",
    sourceOrganization: "Microsoft",
    publicSourceUrl: "https://learn.microsoft.com/en-us/azure/health-bot/overview",
    observedMarketPattern:
      "Healthcare-adapted orchestration is grounded in organization-controlled sources and connects through governed customer data interfaces.",
    scrimedApplication:
      "Treat retrieved documents and connector data as untrusted evidence, validate them, attach provenance, and route only approved context to agents.",
    scrimedDifferentiation:
      "SCRIMED remains model-agnostic and supports cloud, customer VPC, air-gapped, and edge deployment planning.",
    safetyBoundary: "No vendor service is called and no provider compliance or availability is assumed."
  },
  {
    id: "profile-based-procurement-language",
    sourceOrganization: "IHE International",
    publicSourceUrl: "https://www.ihe.net/resources/profiles/",
    observedMarketPattern:
      "Profiles, actors, transactions, test evidence, and integration statements give buyers precise language for multi-vendor interoperability procurement.",
    scrimedApplication:
      "Express every SCRIMED connector lane as a versioned contract, synthetic fixture, deterministic evaluation, evidence list, and live blocker set.",
    scrimedDifferentiation:
      "The same conformance evidence is reused in buyer packets, approval queues, audit trails, and pilot acceptance criteria.",
    safetyBoundary: "Synthetic evaluation is not IHE conformance, certification, Connectathon testing, or partner acceptance."
  }
];

function infrastructureHash(id: string, lane: string) {
  return generateScrimedAuditHash({
    id,
    lane,
    policyVersion: scrimedSafetyPolicyVersion,
    boundary: enterpriseHealthcareInfrastructureBoundary
  });
}

function capability(input: Omit<EnterpriseInfrastructureCapability, "humanReviewRequired" | "blockedActions" | "auditHash">) {
  return {
    ...input,
    humanReviewRequired: true,
    blockedActions,
    auditHash: infrastructureHash(input.id, input.domain)
  } satisfies EnterpriseInfrastructureCapability;
}

export const enterpriseHealthcareInfrastructureCapabilities: EnterpriseInfrastructureCapability[] = [
  capability({
    id: "hl7-fhir-context-gateway",
    domain: "interoperability",
    name: "HL7/FHIR Context Gateway",
    buyerProblem:
      "Health systems need SCRIMED to understand ADT, orders, observations, encounters, coverage, and clinical context without exposing raw schemas to agents.",
    standardsOrSystems: ["FHIR", "HL7 v2 ADT", "HL7 v2 ORM/ORU", "SMART on FHIR", "Integration Engines"],
    currentScrimedAsset: "Clinical Context Gateway, Clinical Data Fabric, Patient Context Gateway, Interoperability route",
    readinessStatus: "ready_for_synthetic_demo",
    syntheticDemoPath: "/clinical-context-gateway",
    requiredCustomerInputs: ["interface inventory", "message-event catalog", "FHIR resource scope", "test-tenant boundary"],
    integrationPattern:
      "Route synthetic ADT/FHIR events through a governed context gateway before agents receive normalized concepts.",
    validationMethod: "Schema contract, provenance check, PHI-blocking check, and human-reviewed integration worksheet.",
    safetyBoundary: "FHIR/HL7 readiness only; no live PHI, patient matching authority, writeback, or connector approval.",
    revenueMotion: "Paid interoperability readiness assessment followed by no-PHI pilot and protected connector discovery.",
    competitivePattern: "Mirrors the market shift from point tools toward a healthcare intelligence layer across systems.",
    nextBuildStep: "Add customer-specific interface inventory template and synthetic ADT-to-FHIR transformation fixtures."
  }),
  capability({
    id: "dicom-pacs-ris-workflow",
    domain: "imaging",
    name: "DICOM/PACS/RIS Imaging Workflow Readiness",
    buyerProblem:
      "Radiology leaders need imaging-to-action workflow visibility without SCRIMED claiming final medical interpretation.",
    standardsOrSystems: ["DICOM", "DICOMweb", "PACS", "RIS", "VNA", "HL7 v2 ORM/ORU"],
    currentScrimedAsset: "Compute Fabric, AI Infrastructure Watchtower, Market Execution imaging-to-action lane",
    readinessStatus: "implementation_ready_metadata",
    syntheticDemoPath: "/scrimed-ai-infrastructure-watchtower",
    requiredCustomerInputs: ["PACS/RIS topology", "DICOMweb availability", "study-status codes", "radiology follow-up SOPs"],
    integrationPattern:
      "Use DICOM metadata, accession status, and report-event fixtures to coordinate queue triage, follow-up, and operational alerts.",
    validationMethod: "DICOM metadata conformance, no-diagnostic-output rule, and radiology-ops human review.",
    safetyBoundary: "Workflow coordination only; no final imaging interpretation, diagnosis, result release, or patient communication.",
    revenueMotion: "Radiology operations assessment, imaging workflow pilot, and enterprise operational intelligence license.",
    competitivePattern: "Uses imaging AI category momentum while positioning SCRIMED as governed action infrastructure.",
    nextBuildStep: "Add synthetic DICOM metadata packet and accession-status lifecycle examples."
  }),
  capability({
    id: "his-ris-adt-operating-map",
    domain: "patient_admin",
    name: "HIS/RIS/ADT Operating Map",
    buyerProblem:
      "Hospitals need patient-administration state machines for arrivals, transfers, scheduling, service-line handoffs, and discharge planning.",
    standardsOrSystems: ["HIS", "RIS", "HL7 v2 ADT", "Scheduling", "Client/Server Architecture"],
    currentScrimedAsset: "Guided Execution, Patient Context Gateway, Enterprise Scalability, Operational Efficiency",
    readinessStatus: "ready_for_synthetic_demo",
    syntheticDemoPath: "/scrimed-guided-execution",
    requiredCustomerInputs: ["ADT trigger matrix", "facility map", "role matrix", "scheduling status vocabulary"],
    integrationPattern:
      "Convert synthetic ADT and scheduling events into a governed workflow-state map for agents and dashboards.",
    validationMethod: "Event-sequence replay, duplicate-context detection, and no-writeback gate.",
    safetyBoundary: "Administrative state support only; no patient outreach, EHR mutation, or live-care authority.",
    revenueMotion: "Patient access workflow assessment and care-coordination operating pilot.",
    competitivePattern: "Adopts the agent-workforce pattern for patient access while preserving approvals.",
    nextBuildStep: "Create synthetic ADT journey fixture for elderly/complex-care continuity and referral handoffs."
  }),
  capability({
    id: "x12-payer-rcm-rail",
    domain: "revenue_cycle",
    name: "X12 / RCM / Payer Evidence Rail",
    buyerProblem:
      "Revenue-cycle teams need eligibility, documentation, prior-auth, denial, and appeal intelligence without automated payer submission.",
    standardsOrSystems: ["X12", "RCM", "Eligibility", "Prior Authorization", "Claims", "Appeals"],
    currentScrimedAsset: "Documentation-Before-Authorization, Market Execution payer-policy-evidence-loop, Business Ops",
    readinessStatus: "implementation_ready_metadata",
    syntheticDemoPath: "/scrimed-market-execution",
    requiredCustomerInputs: ["payer-policy examples", "denial reason taxonomy", "submission workflow owners", "review thresholds"],
    integrationPattern:
      "Detect documentation-risk gaps and packet completeness using policy metadata, then route to human review before any payer action.",
    validationMethod: "Documentation checklist, source-citation requirement, and no-submission contract smoke.",
    safetyBoundary: "Drafting and readiness only; no claim filing, payer submission, reimbursement assurance, or billing action.",
    revenueMotion: "RCM readiness assessment, prior-auth documentation pilot, denial prevention service, and enterprise license.",
    competitivePattern: "Turns automation-agent messaging into governed documentation-before-authorization proof.",
    nextBuildStep: "Add payer-specific documentation risk templates with reviewer-required statuses."
  }),
  capability({
    id: "integration-engine-adapter",
    domain: "interoperability",
    name: "Integration Engine Adapter Readiness",
    buyerProblem:
      "Implementation teams need a clean handoff between SCRIMED agents and existing interface engines without exposing raw systems directly.",
    standardsOrSystems: ["Integration Engines", "FHIR", "HL7 v2", "REST", "Webhook", "Queue"],
    currentScrimedAsset: "Clinical Data Fabric, Secure MCP readiness, Agent Governance, Safety Stack",
    readinessStatus: "requires_customer_discovery",
    syntheticDemoPath: "/clinical-data-fabric",
    requiredCustomerInputs: ["engine vendor", "channel list", "message retention policy", "network/security design"],
    integrationPattern:
      "Place a governed middleware adapter between agents and interface-engine channels with deny-by-default tools.",
    validationMethod: "Tool-permission contract, replayable event envelope, audit hash, and connector authority gate.",
    safetyBoundary: "Adapter design only; no production engine connection, credential handling, or channel mutation.",
    revenueMotion: "Integration architecture workshop and protected pilot scoping fee.",
    competitivePattern: "Strengthens SCRIMED's platform story beyond thin MCP connectors through ingest-time enrichment.",
    nextBuildStep: "Create integration-engine discovery worksheet and synthetic channel manifest schema."
  }),
  capability({
    id: "secure-networking-vpn-firewall",
    domain: "network_security",
    name: "VPN / Firewall / Network Trust Readiness",
    buyerProblem:
      "Enterprise buyers expect network segmentation, allowlists, private connectivity, audit evidence, and least-privilege access before pilots.",
    standardsOrSystems: ["VPN", "Firewalls", "Private Link", "Customer VPC", "Zero Trust", "Audit Ledger"],
    currentScrimedAsset: "Cyber Defense, Security Assurance, Security Release Readiness, Deployment Drift Guard",
    readinessStatus: "implementation_ready_metadata",
    syntheticDemoPath: "/scrimed-cyber-defense",
    requiredCustomerInputs: ["network diagram", "allowlist process", "VPN requirements", "firewall review owner"],
    integrationPattern:
      "Package SCRIMED access boundaries, route headers, protected-fail-closed checks, and network assumptions into buyer-ready evidence.",
    validationMethod: "No-secret smoke, protected-route fail-closed checks, token redaction, and firewall/VPN review worksheet.",
    safetyBoundary: "Security readiness only; not a penetration test, firewall deployment, network approval, or security certification.",
    revenueMotion: "Security diligence packet, enterprise pilot security review, and compliance-prep services.",
    competitivePattern: "Converts cybersecurity posture into a sales accelerator rather than a late procurement blocker.",
    nextBuildStep: "Add buyer security intake form and deployment-mode mapping for cloud, VPC, air-gapped, and edge."
  }),
  capability({
    id: "vm-edge-runtime",
    domain: "compute_runtime",
    name: "Virtual Machine / Edge Runtime Blueprint",
    buyerProblem:
      "Hospitals need private inference, local de-identification, and downtime-tolerant deployment options for sensitive workflows.",
    standardsOrSystems: ["Virtual Machines", "Kubernetes", "Edge Runtime", "GPU", "Local Models", "Air-gapped"],
    currentScrimedAsset: "Compute Fabric, On-Device De-Identification, AI Infrastructure Watchtower",
    readinessStatus: "requires_customer_discovery",
    syntheticDemoPath: "/scrimed-compute-fabric",
    requiredCustomerInputs: ["hosting preference", "GPU/CPU capacity", "data-residency rules", "offline requirements"],
    integrationPattern:
      "Route PHI-heavy or air-gapped workflows to private/local model lanes with no external model call by default.",
    validationMethod: "Deployment-mode matrix, model-router audit event, and provider-call kill switch.",
    safetyBoundary: "Architecture blueprint only; no live PHI processing, local appliance claim, or production deployment claim.",
    revenueMotion: "Private AI deployment design package, edge readiness audit, and future managed appliance subscription.",
    competitivePattern: "Matches buyer demand for private AI while remaining model-agnostic and safety-gated.",
    nextBuildStep: "Add edge runtime sizing worksheet and synthetic de-identification benchmark fixture."
  }),
  capability({
    id: "database-audit-ledger",
    domain: "data_platform",
    name: "Database / Audit Ledger Readiness",
    buyerProblem:
      "Healthcare reviewers need durable evidence that agent actions, decisions, provenance, costs, and boundaries are traceable.",
    standardsOrSystems: ["Databases", "Postgres", "RLS", "Immutable Audit Logs", "Data Lineage", "Retention Policies"],
    currentScrimedAsset: "Execution Attempt Durable Store, AI Flight Recorder, TrustOps, Investor Readiness",
    readinessStatus: "ready_for_synthetic_demo",
    syntheticDemoPath: "/workflows/execution-attempts",
    requiredCustomerInputs: ["retention policy", "audit export format", "role matrix", "evidence review workflow"],
    integrationPattern:
      "Bind every synthetic execution attempt to policy version, route, output hash, evidence hash, and human-review disposition.",
    validationMethod: "Durable-store contract, AAL2 smoke path, no-token logging, and evidence envelope replay.",
    safetyBoundary: "Synthetic evidence only; no live patient audit, PHI storage, or compliance certification claim.",
    revenueMotion: "Trust audit readiness subscription and enterprise diligence evidence packet.",
    competitivePattern: "Makes traceability a product moat and investor proof point.",
    nextBuildStep: "Add audit-export manifest for buyer diligence packets without secrets or PHI."
  }),
  capability({
    id: "agent-orchestration-command",
    domain: "agent_orchestration",
    name: "Agent Orchestration Command Layer",
    buyerProblem:
      "Buyers want automation speed, but hospitals need identity, approvals, scoped tools, escalation, and audit before agents touch operations.",
    standardsOrSystems: ["MCP", "A2A", "Agent Identity", "Scoped Tools", "Human Approval", "Audit Trail"],
    currentScrimedAsset: "Agent Governance, Governance Learning Loop, Safety Stack, Operating Command",
    readinessStatus: "implementation_ready_metadata",
    syntheticDemoPath: "/scrimed-agent-governance",
    requiredCustomerInputs: ["role hierarchy", "approval matrix", "tool inventory", "escalation policy"],
    integrationPattern:
      "Every agent action passes identity, contextual policy, permission, scoped-tool, execution, and audit layers.",
    validationMethod: "Deny-by-default policy smoke, human-review requirements, and blocked-action contract checks.",
    safetyBoundary: "Recommendation and workflow support only; no irreversible action execution without approval.",
    revenueMotion: "Agent governance assessment, departmental pilot, and per-workflow automation license.",
    competitivePattern: "Turns chatbot demand into a governed healthcare meta-harness.",
    nextBuildStep: "Add work-order templates for patient access, referral, RCM, and imaging-ops agent workflows."
  }),
  capability({
    id: "buyer-proof-sales-path",
    domain: "market_motion",
    name: "Buyer Proof / Investor Diligence Sales Path",
    buyerProblem:
      "SCRIMED needs a tight route from public trust messaging to demo, proof packet, pilot scope, security review, and priced expansion.",
    standardsOrSystems: ["Sales Operations", "Proof Packet", "Pricing", "Investor Narrative", "Trust Center"],
    currentScrimedAsset: "Market Execution, Proof Packet Studio, Guided Execution, Pilot Demo Commercial Readiness",
    readinessStatus: "ready_for_synthetic_demo",
    syntheticDemoPath: "/scrimed-proof-packet-studio",
    requiredCustomerInputs: ["buyer role", "target workflow", "timeline", "success metrics", "procurement/security contacts"],
    integrationPattern:
      "Map every buyer path to one demo, one proof packet, one safety boundary, one pilot offer, and one next human action.",
    validationMethod: "Proof-route contract, claims-safe copy review, and no-guarantee pricing boundary.",
    safetyBoundary: "Sales readiness only; not contract approval, procurement approval, investment advice, or ROI guarantee.",
    revenueMotion: "Assessment fee, synthetic pilot, protected enterprise pilot, enterprise license, and strategic partnership path.",
    competitivePattern: "Makes enterprise purchasing easier by packaging outcomes, governance, and evidence together.",
    nextBuildStep: "Add infrastructure-readiness proof packet to demo and investor packet sequences."
  })
];

export const enterpriseInfrastructureIntegrationPaths: EnterpriseInfrastructureIntegrationPath[] = [
  {
    id: "adt-to-context",
    from: "HL7 v2 ADT fixture",
    through: "Clinical Context Gateway + Integration Engine Adapter",
    to: "Patient Journey Memory and Human Oversight Queue",
    payloadClass: "synthetic_event",
    allowedMode: "Synthetic replay, schema validation, workflow-state visualization, and audit hash generation.",
    blockedMode: "Live ADT feed, patient matching authority, source-chart ingestion, or EHR writeback.",
    requiredApprovals: ["interface owner", "privacy/security reviewer", "clinical operations reviewer"],
    fallbackPath: "Manual CSV/FHIR fixture upload with PHI redaction and human review.",
    observability: ["trace_id", "policy_version", "message_type", "provenance_hash", "review_status"]
  },
  {
    id: "dicom-metadata-to-action",
    from: "DICOM/DICOMweb metadata fixture",
    through: "Imaging Workflow Readiness + Safety Queue",
    to: "Radiology operations follow-up dashboard",
    payloadClass: "metadata_only",
    allowedMode: "Operational queue readiness, turnaround-time signal, and follow-up routing recommendation.",
    blockedMode: "Final imaging interpretation, diagnosis, report release, or patient communication.",
    requiredApprovals: ["radiology operations", "clinical safety reviewer", "security reviewer"],
    fallbackPath: "Static synthetic accession packet and manual radiology-ops worksheet.",
    observability: ["accession_hash", "modality", "latency_class", "safety_boundary", "human_review_required"]
  },
  {
    id: "payer-policy-to-documentation-risk",
    from: "Payer policy and X12 workflow metadata",
    through: "Documentation-Before-Authorization Engine",
    to: "RCM reviewer packet",
    payloadClass: "customer_discovery_artifact",
    allowedMode: "Documentation-risk checklist, missing-evidence flag, and human-reviewed draft packet.",
    blockedMode: "Claim filing, prior-auth submission, appeal submission, or reimbursement assurance.",
    requiredApprovals: ["RCM owner", "legal/compliance reviewer", "payer workflow reviewer"],
    fallbackPath: "Manual documentation completeness checklist with source citations.",
    observability: ["policy_hash", "missing_evidence_count", "reviewer_role", "submission_blocked"]
  },
  {
    id: "private-runtime-route",
    from: "Customer VPC / VPN / edge runtime discovery",
    through: "Compute Fabric model-router policy",
    to: "Private inference architecture decision",
    payloadClass: "metadata_only",
    allowedMode: "Deployment-mode scoring, cost/latency estimate, and private-model fallback plan.",
    blockedMode: "Processing PHI in public models, deploying credentials, or changing cloud IAM/firewall rules.",
    requiredApprovals: ["security lead", "infrastructure owner", "privacy officer"],
    fallbackPath: "No-model synthetic runbook and offline de-identification readiness checklist.",
    observability: ["deployment_mode", "phi_policy", "provider_calls_enabled", "fallback_model_path"]
  }
];

export const enterpriseInfrastructureSalesMotions: EnterpriseInfrastructureSalesMotion[] = [
  {
    id: "cio-cmio-platform-readiness",
    buyer: "CIO, CMIO, Chief Digital Officer, and innovation sponsor",
    pitch:
      "SCRIMED is a governed healthcare intelligence operating layer that prepares agents, evidence, context, and workflows before touching live systems.",
    proofRoute: "/enterprise-healthcare-infrastructure",
    revenueStream: "Infrastructure readiness assessment, synthetic pilot, protected enterprise pilot, and enterprise license.",
    expansionPath: "Interoperability, agent governance, TrustOps, workflow automation, and private AI deployment readiness.",
    evidenceRequiredBeforeClaim: "Route smoke, safety headers, buyer discovery worksheet, no-PHI proof packet, and human-reviewed pilot scope."
  },
  {
    id: "radiology-operations",
    buyer: "Radiology operations, imaging service-line leader, and PACS/RIS owner",
    pitch:
      "SCRIMED coordinates imaging workflow signals and follow-up operations without making final interpretation claims.",
    proofRoute: "/scrimed-ai-infrastructure-watchtower",
    revenueStream: "Imaging workflow assessment, operational-intelligence pilot, and service-line expansion.",
    expansionPath: "DICOM metadata readiness, turnaround-time signals, referral follow-up, and safety-review queues.",
    evidenceRequiredBeforeClaim: "Synthetic DICOM metadata fixture, no-interpretation boundary, and radiology-ops reviewer signoff."
  },
  {
    id: "rcm-payer-intelligence",
    buyer: "Revenue cycle leader, prior-auth director, payer ops, and CFO sponsor",
    pitch:
      "SCRIMED finds documentation and policy-risk gaps before teams submit, reducing avoidable friction while keeping humans in control.",
    proofRoute: "/scrimed-market-execution",
    revenueStream: "RCM readiness assessment, documentation-before-authorization pilot, denial-prevention package, and enterprise license.",
    expansionPath: "X12 workflow readiness, medical-necessity packet review, appeal readiness, and RCM operations intelligence.",
    evidenceRequiredBeforeClaim: "No-submission smoke, policy citation packet, reviewer workflow, and outcome KPI definition."
  },
  {
    id: "security-procurement",
    buyer: "Security, compliance, procurement, and legal reviewers",
    pitch:
      "SCRIMED makes network, identity, audit, and connector boundaries visible early so enterprise review happens before risk expands.",
    proofRoute: "/scrimed-cyber-defense",
    revenueStream: "Security diligence packet, protected pilot review, and enterprise readiness services.",
    expansionPath: "VPN/firewall discovery, AAL2 protected evidence, audit exports, and deployment-mode approval planning.",
    evidenceRequiredBeforeClaim: "No-secret checks, protected fail-closed results, token redaction, route headers, and human approvals."
  }
];

export const enterpriseInfrastructureDiscoveryQuestions: EnterpriseInfrastructureDiscoveryQuestion[] = [
  {
    id: "systems-inventory",
    category: "systems_inventory",
    prompt: "Which systems are in scope for the no-PHI readiness conversation: EHR, HIS, RIS, PACS, VNA, interface engine, RCM, scheduling, call center, data warehouse, or analytics?",
    acceptedInput: "System names, owners, environments, and high-level workflow purpose without PHI, credentials, URLs, or raw payloads.",
    forbiddenInput: "Patient identifiers, production exports, screenshots with PHI, VPN credentials, database credentials, API keys, or raw connector messages.",
    whyItMatters: "SCRIMED can scope the right proof path only after the buyer's systems-of-record and systems-of-action are mapped.",
    mapsToCapabilityIds: ["hl7-fhir-context-gateway", "his-ris-adt-operating-map", "integration-engine-adapter"],
    humanReviewRequired: true
  },
  {
    id: "hl7-fhir-event-scope",
    category: "interoperability",
    prompt: "Which synthetic HL7/FHIR events should the pilot mirror: ADT, ORM, ORU, encounters, observations, coverage, claims, appointments, referrals, or care plans?",
    acceptedInput: "Message/resource names, event purpose, sample field labels, and desired workflow triggers using synthetic examples only.",
    forbiddenInput: "Live HL7 messages, production FHIR bundles, MRNs, accession numbers tied to real patients, or source-chart extracts.",
    whyItMatters: "This selects the minimum useful fixture set and keeps SCRIMED from overbuilding broad connectors before buyer proof exists.",
    mapsToCapabilityIds: ["hl7-fhir-context-gateway", "integration-engine-adapter", "database-audit-ledger"],
    humanReviewRequired: true
  },
  {
    id: "imaging-workflow-scope",
    category: "imaging",
    prompt: "Which imaging workflow pain should be evaluated: turnaround time, follow-up leakage, unread queue visibility, report finalization delay, referral routing, or service-line capacity?",
    acceptedInput: "Operational issue, role owners, status vocabulary, modality categories, and synthetic accession lifecycle examples.",
    forbiddenInput: "Images, DICOM studies from real patients, diagnostic reports, final interpretations, or patient outreach instructions.",
    whyItMatters: "SCRIMED can sell imaging-to-action workflow value without crossing into final radiology interpretation.",
    mapsToCapabilityIds: ["dicom-pacs-ris-workflow", "his-ris-adt-operating-map", "agent-orchestration-command"],
    humanReviewRequired: true
  },
  {
    id: "payer-rcm-risk-scope",
    category: "payer_rcm",
    prompt: "Which RCM workflow needs evidence support: eligibility, prior authorization, documentation completeness, denial prevention, appeal readiness, or collections friction?",
    acceptedInput: "Policy labels, denial categories, documentation checklist examples, reviewer roles, and synthetic payer-policy snippets.",
    forbiddenInput: "Claims submissions, member IDs, payer portal credentials, patient-specific medical necessity narratives, or payment-outcome promises.",
    whyItMatters: "SCRIMED can position documentation-before-authorization while preserving no payer-submission authority.",
    mapsToCapabilityIds: ["x12-payer-rcm-rail", "agent-orchestration-command", "buyer-proof-sales-path"],
    humanReviewRequired: true
  },
  {
    id: "network-security-discovery",
    category: "network_security",
    prompt: "Which connectivity model is preferred for a future protected pilot: SCRIMED cloud, customer VPC, VPN, private link, air-gapped edge, or local VM?",
    acceptedInput: "Preferred deployment mode, security review owner, firewall/allowlist process, and high-level network constraints.",
    forbiddenInput: "Secrets, private keys, firewall rule exports, VPN credentials, production IP allowlists, or cloud IAM changes.",
    whyItMatters: "Security readiness should become an early sales accelerator rather than a late procurement blocker.",
    mapsToCapabilityIds: ["secure-networking-vpn-firewall", "vm-edge-runtime", "database-audit-ledger"],
    humanReviewRequired: true
  },
  {
    id: "compute-runtime-discovery",
    category: "compute_runtime",
    prompt: "Which runtime constraints matter most: low latency, private inference, local de-identification, GPU availability, offline mode, data residency, or cost ceiling?",
    acceptedInput: "Runtime goals, deployment preference, non-PHI benchmark targets, and review owners.",
    forbiddenInput: "Live PHI workloads, production credentials, direct model API keys, or approval to process patient data.",
    whyItMatters: "SCRIMED can route future model and agent choices by privacy, cost, latency, and risk before any PHI is introduced.",
    mapsToCapabilityIds: ["vm-edge-runtime", "secure-networking-vpn-firewall", "agent-orchestration-command"],
    humanReviewRequired: true
  },
  {
    id: "governance-approval-map",
    category: "governance",
    prompt: "Who must review future boundary changes: clinical safety, privacy, security, legal, reimbursement, IT, radiology, RCM, procurement, or executive sponsor?",
    acceptedInput: "Role names, approval lanes, meeting cadence, and evidence preferences without personal sensitive data.",
    forbiddenInput: "Bearer tokens, signatures granting authority, patient examples, or instructions to bypass review.",
    whyItMatters: "Every high-stakes SCRIMED expansion must have a named human approval path before production work begins.",
    mapsToCapabilityIds: ["database-audit-ledger", "agent-orchestration-command", "buyer-proof-sales-path"],
    humanReviewRequired: true
  },
  {
    id: "commercial-fit",
    category: "commercial_fit",
    prompt: "Which business outcome should the no-PHI pilot prove: time saved, denials avoided, leakage detected, follow-up completion, documentation quality, security readiness, or integration feasibility?",
    acceptedInput: "Target workflow, baseline estimate, stakeholder owner, pilot duration, and success metric definition.",
    forbiddenInput: "Assured savings, payment-outcome promises, live patient cohort, signed production approval, or investor solicitation language.",
    whyItMatters: "A pilot should have one measurable outcome, one proof packet, one review lane, and one paid expansion path.",
    mapsToCapabilityIds: ["buyer-proof-sales-path", "x12-payer-rcm-rail", "dicom-pacs-ris-workflow"],
    humanReviewRequired: true
  }
];

export const enterpriseInfrastructurePilotScopes: EnterpriseInfrastructurePilotScope[] = [
  {
    id: "hl7-fhir-context-sprint",
    name: "HL7/FHIR Context Sprint",
    buyerTrigger: "The buyer needs to prove SCRIMED can understand encounter, ADT, observation, and coverage context before a protected connector review.",
    includedCapabilities: ["hl7-fhir-context-gateway", "integration-engine-adapter", "database-audit-ledger"],
    syntheticInputs: ["synthetic ADT event matrix", "synthetic FHIR resource bundle", "interface inventory worksheet"],
    proofOutputs: ["context-map brief", "schema validation evidence", "policy decision log", "human-review checklist"],
    acceptanceCriteria: [
      "No PHI or raw production messages are used",
      "Every event has provenance, policy version, and audit hash",
      "No writeback, patient matching authority, or connector approval is claimed"
    ],
    commercialModel: "Paid readiness assessment followed by a fixed-scope no-PHI pilot.",
    priceBandSignal: "Assessment/pilot pricing signal only; not a quote, procurement approval, or revenue guarantee.",
    noGoBoundary: "No live HL7/FHIR feed, production credentials, EHR writeback, or PHI processing.",
    nextHumanAction: "Schedule integration-owner discovery and select the minimum synthetic event set.",
    auditHash: infrastructureHash("hl7-fhir-context-sprint", "pilot-scope")
  },
  {
    id: "dicom-pacs-ris-ops-sprint",
    name: "DICOM/PACS/RIS Operations Sprint",
    buyerTrigger: "Radiology operations wants workflow visibility, follow-up routing, or turnaround-time intelligence without final interpretation claims.",
    includedCapabilities: ["dicom-pacs-ris-workflow", "his-ris-adt-operating-map", "agent-orchestration-command"],
    syntheticInputs: ["synthetic DICOM metadata packet", "accession lifecycle fixture", "radiology status vocabulary"],
    proofOutputs: ["imaging workflow map", "follow-up queue design", "no-interpretation safety card", "reviewer signoff packet"],
    acceptanceCriteria: [
      "No images or real DICOM studies are ingested",
      "Outputs are operational and never diagnostic",
      "Radiology-ops human review is required before any external use"
    ],
    commercialModel: "Radiology operations assessment with optional service-line workflow pilot.",
    priceBandSignal: "Commercial planning signal only; not a quote, SLA, ROI guarantee, or clinical validation.",
    noGoBoundary: "No final imaging interpretation, report release, diagnosis, patient notification, or PACS/RIS mutation.",
    nextHumanAction: "Choose one imaging workflow pain and confirm radiology operations reviewer.",
    auditHash: infrastructureHash("dicom-pacs-ris-ops-sprint", "pilot-scope")
  },
  {
    id: "x12-rcm-evidence-sprint",
    name: "X12 / RCM Evidence Sprint",
    buyerTrigger: "Revenue cycle needs documentation-risk visibility before prior auth, denial, appeal, or claim work expands.",
    includedCapabilities: ["x12-payer-rcm-rail", "agent-orchestration-command", "buyer-proof-sales-path"],
    syntheticInputs: ["synthetic payer policy", "documentation checklist", "denial reason taxonomy", "reviewer role map"],
    proofOutputs: ["missing-evidence matrix", "packet-readiness scorecard", "submission-blocked safety log", "RCM review workflow"],
    acceptanceCriteria: [
      "No member IDs, payer credentials, or claims are submitted",
      "Every recommendation is a human-reviewed documentation readiness signal",
      "No reimbursement assurance is stated"
    ],
    commercialModel: "RCM readiness assessment, documentation-before-authorization pilot, and expansion package.",
    priceBandSignal: "Planning range signal only; not a reimbursement promise, signed quote, or financial advice.",
    noGoBoundary: "No payer submission, claim filing, appeal filing, billing submission, or reimbursement guarantee.",
    nextHumanAction: "Select one payer-policy workflow and define the reviewer-required packet checklist.",
    auditHash: infrastructureHash("x12-rcm-evidence-sprint", "pilot-scope")
  },
  {
    id: "private-runtime-readiness-sprint",
    name: "Private Runtime Readiness Sprint",
    buyerTrigger: "Security or IT wants to understand cloud, customer VPC, VPN, VM, air-gapped, or edge options before sensitive workflow design.",
    includedCapabilities: ["secure-networking-vpn-firewall", "vm-edge-runtime", "database-audit-ledger"],
    syntheticInputs: ["deployment-mode worksheet", "network review checklist", "synthetic runtime benchmark goals"],
    proofOutputs: ["private-runtime matrix", "provider-call kill-switch plan", "security-review checklist", "cost/latency class estimate"],
    acceptanceCriteria: [
      "No secrets, network rules, or production credentials are collected",
      "No PHI workload is authorized",
      "Deployment mode remains architecture readiness until formal approval"
    ],
    commercialModel: "Security/infrastructure diligence package and protected pilot architecture workshop.",
    priceBandSignal: "Architecture planning signal only; not procurement approval, infrastructure deployment, or security certification.",
    noGoBoundary: "No cloud IAM change, firewall change, credential rotation, production deploy, or live PHI processing.",
    nextHumanAction: "Confirm deployment preference and security review owner.",
    auditHash: infrastructureHash("private-runtime-readiness-sprint", "pilot-scope")
  },
  {
    id: "audit-ledger-trust-sprint",
    name: "Audit Ledger / Trust Evidence Sprint",
    buyerTrigger: "Procurement, security, or investors need proof that SCRIMED can trace decisions, policies, outputs, costs, and review status.",
    includedCapabilities: ["database-audit-ledger", "agent-orchestration-command", "buyer-proof-sales-path"],
    syntheticInputs: ["synthetic execution attempts", "policy-decision fixtures", "review disposition examples"],
    proofOutputs: ["evidence ledger packet", "audit hash inventory", "review queue map", "boundary-preservation report"],
    acceptanceCriteria: [
      "All records are synthetic or metadata-only",
      "No bearer tokens, secrets, or PHI appear in logs",
      "Every sensitive expansion requires human review"
    ],
    commercialModel: "Trust audit readiness package and enterprise diligence subscription path.",
    priceBandSignal: "Diligence planning signal only; not a compliance certification, audit opinion, or legal assurance.",
    noGoBoundary: "No compliance certification, live patient audit trail, production retention approval, or security guarantee.",
    nextHumanAction: "Select evidence recipients and agree on the no-secret/no-PHI packet format.",
    auditHash: infrastructureHash("audit-ledger-trust-sprint", "pilot-scope")
  }
];

export const enterpriseInfrastructureProofPacketChecklist: EnterpriseInfrastructureProofPacketItem[] = [
  {
    id: "no-phi-discovery-intake",
    artifact: "No-PHI infrastructure discovery intake",
    owner: "Founder + implementation lead",
    requiredBefore: "Any pilot recommendation or buyer-facing workflow scope",
    noPhiRule: "Collect system names, owners, workflow purpose, and synthetic examples only.",
    reviewGate: "Implementation lead confirms no credentials, PHI, raw connector payloads, or production exports."
  },
  {
    id: "standards-scope-map",
    artifact: "FHIR/HL7/DICOM/X12 standards scope map",
    owner: "Interoperability lead",
    requiredBefore: "Any integration architecture workshop",
    noPhiRule: "Use resource names, message types, and synthetic fixtures only.",
    reviewGate: "Interoperability reviewer confirms no live feed, source chart, or connector approval claim."
  },
  {
    id: "security-runtime-review",
    artifact: "VPN/firewall/VM/private-runtime review worksheet",
    owner: "Security lead",
    requiredBefore: "Any protected pilot architecture or private inference discussion",
    noPhiRule: "Document constraints and review owners without secrets, keys, IP exports, or IAM changes.",
    reviewGate: "Security reviewer confirms architecture-readiness scope only."
  },
  {
    id: "pilot-acceptance-criteria",
    artifact: "Synthetic pilot acceptance criteria",
    owner: "Product + buyer champion",
    requiredBefore: "Any priced pilot proposal",
    noPhiRule: "Define success metrics without live patient cohorts, production claims, or guaranteed outcomes.",
    reviewGate: "Buyer champion and SCRIMED owner approve one measurable outcome and one retained boundary."
  },
  {
    id: "boundary-and-approval-card",
    artifact: "Boundary and approval card",
    owner: "Trust Safety + legal/compliance reviewer",
    requiredBefore: "Any external demo, packet, proposal, or investor diligence share",
    noPhiRule: "State preserved boundaries plainly and exclude customer secrets or regulated claims.",
    reviewGate: "Human reviewer verifies no certification, clinical validation, production connector, payer, or go-live claim."
  }
];

const pilotRecommendationRules: Record<string, { keywords: string[]; discoveryQuestionIds: string[]; proofPacketItemIds: string[] }> = {
  "hl7-fhir-context-sprint": {
    keywords: ["adt", "fhir", "hl7", "encounter", "observation", "coverage", "interface", "integration", "ehr", "context"],
    discoveryQuestionIds: ["systems-inventory", "hl7-fhir-event-scope", "governance-approval-map"],
    proofPacketItemIds: ["no-phi-discovery-intake", "standards-scope-map", "boundary-and-approval-card"]
  },
  "dicom-pacs-ris-ops-sprint": {
    keywords: ["dicom", "pacs", "ris", "vna", "radiology", "imaging", "accession", "modality", "follow-up", "turnaround"],
    discoveryQuestionIds: ["systems-inventory", "imaging-workflow-scope", "governance-approval-map"],
    proofPacketItemIds: ["no-phi-discovery-intake", "standards-scope-map", "pilot-acceptance-criteria", "boundary-and-approval-card"]
  },
  "x12-rcm-evidence-sprint": {
    keywords: ["x12", "rcm", "payer", "denial", "prior auth", "appeal", "claim", "eligibility", "documentation", "collections"],
    discoveryQuestionIds: ["systems-inventory", "payer-rcm-risk-scope", "commercial-fit", "governance-approval-map"],
    proofPacketItemIds: ["no-phi-discovery-intake", "standards-scope-map", "pilot-acceptance-criteria", "boundary-and-approval-card"]
  },
  "private-runtime-readiness-sprint": {
    keywords: ["vpn", "firewall", "vpc", "private", "air-gapped", "edge", "vm", "virtual machine", "local", "offline", "gpu"],
    discoveryQuestionIds: ["network-security-discovery", "compute-runtime-discovery", "governance-approval-map"],
    proofPacketItemIds: ["no-phi-discovery-intake", "security-runtime-review", "boundary-and-approval-card"]
  },
  "audit-ledger-trust-sprint": {
    keywords: ["audit", "trace", "ledger", "procurement", "security review", "investor", "evidence", "review", "governance", "compliance"],
    discoveryQuestionIds: ["governance-approval-map", "commercial-fit", "network-security-discovery"],
    proofPacketItemIds: ["no-phi-discovery-intake", "pilot-acceptance-criteria", "boundary-and-approval-card"]
  }
};

function recommendationSignal(input: EnterpriseInfrastructurePilotRecommendationInput) {
  return [
    input.buyerRole,
    input.desiredOutcome,
    ...input.systemsMentioned,
    ...input.workflowPriorities,
    ...input.deploymentConstraints
  ]
    .join(" ")
    .toLowerCase();
}

function pilotScopeById(scopeId: string) {
  return enterpriseInfrastructurePilotScopes.find((scope) => scope.id === scopeId) ?? enterpriseInfrastructurePilotScopes[0];
}

export function recommendEnterpriseInfrastructurePilot(
  input: EnterpriseInfrastructurePilotRecommendationInput
): EnterpriseInfrastructurePilotRecommendation {
  const signal = recommendationSignal(input);
  const scored = Object.entries(pilotRecommendationRules)
    .map(([scopeId, rule]) => {
      const score = rule.keywords.reduce((total, keyword) => {
        return signal.includes(keyword) ? total + 10 : total;
      }, 0);

      return { scopeId, score };
    })
    .sort((left, right) => right.score - left.score || left.scopeId.localeCompare(right.scopeId));
  const winningScopeId = scored[0]?.scopeId ?? "audit-ledger-trust-sprint";
  const winningScore = scored[0]?.score ?? 0;
  const recommendedScope = pilotScopeById(winningScopeId);
  const rules = pilotRecommendationRules[winningScopeId];
  const runnerUpPilotScopeIds = scored
    .slice(1, 3)
    .map((candidate) => candidate.scopeId)
    .filter((scopeId) => scopeId !== winningScopeId);

  return {
    inputId: input.id,
    recommendedPilotScopeId: winningScopeId,
    runnerUpPilotScopeIds,
    score: winningScore,
    rationale:
      winningScore > 0
        ? `Metadata signals align most strongly to ${recommendedScope.name}: ${recommendedScope.buyerTrigger}`
        : `Default to ${recommendedScope.name} until buyer discovery creates clearer no-PHI signal.`,
    requiredDiscoveryQuestionIds: rules.discoveryQuestionIds,
    proofPacketItemIds: rules.proofPacketItemIds,
    revenueMotion: recommendedScope.commercialModel,
    humanReviewRequired: true,
    noGoBoundaries: [recommendedScope.noGoBoundary, "No PHI, live connector, payer submission, EHR writeback, final imaging interpretation, or customer go-live authority."],
    auditHash: infrastructureHash(input.id, "pilot-recommendation")
  };
}

export const enterpriseInfrastructurePilotRecommendationInputs: EnterpriseInfrastructurePilotRecommendationInput[] = [
  {
    id: "cio-integration-buyer",
    buyerRole: "CIO and CMIO",
    systemsMentioned: ["EHR", "interface engine", "FHIR", "HL7 ADT", "coverage"],
    workflowPriorities: ["context map", "encounter readiness", "integration feasibility"],
    deploymentConstraints: ["no PHI", "synthetic fixtures first"],
    desiredOutcome: "Prove SCRIMED can understand hospital context before protected connector review."
  },
  {
    id: "radiology-ops-buyer",
    buyerRole: "Radiology operations and PACS/RIS owner",
    systemsMentioned: ["PACS", "RIS", "DICOM", "VNA"],
    workflowPriorities: ["turnaround", "follow-up", "accession status", "service-line capacity"],
    deploymentConstraints: ["no images", "no final interpretation"],
    desiredOutcome: "Prove imaging workflow coordination without diagnostic authority."
  },
  {
    id: "rcm-cfo-buyer",
    buyerRole: "CFO, RCM leader, and prior authorization director",
    systemsMentioned: ["X12", "payer policy", "claims", "eligibility"],
    workflowPriorities: ["denial prevention", "documentation completeness", "appeal readiness"],
    deploymentConstraints: ["no payer submission", "reviewer-required packet"],
    desiredOutcome: "Prove documentation-before-authorization value before submission workflows expand."
  },
  {
    id: "security-private-ai-buyer",
    buyerRole: "Security, infrastructure, and procurement reviewer",
    systemsMentioned: ["VPN", "firewall", "customer VPC", "Virtual Machines"],
    workflowPriorities: ["private inference", "local de-identification", "cost ceiling"],
    deploymentConstraints: ["air-gapped option", "no secrets", "no IAM changes"],
    desiredOutcome: "Prove private runtime feasibility before sensitive workflow design."
  },
  {
    id: "investor-trust-reviewer",
    buyerRole: "Investor diligence and enterprise procurement reviewer",
    systemsMentioned: ["audit ledger", "database", "review queue"],
    workflowPriorities: ["evidence packet", "traceability", "governance", "human review"],
    deploymentConstraints: ["metadata only", "no certification claim"],
    desiredOutcome: "Prove SCRIMED can trace policies, decisions, outputs, review status, and boundaries."
  }
];

export const enterpriseInfrastructurePilotRecommendations: EnterpriseInfrastructurePilotRecommendation[] =
  enterpriseInfrastructurePilotRecommendationInputs.map(recommendEnterpriseInfrastructurePilot);

function packetForRecommendation(
  input: EnterpriseInfrastructurePilotRecommendationInput,
  recommendation: EnterpriseInfrastructurePilotRecommendation
): EnterpriseInfrastructureBuyerPacket {
  const scope = pilotScopeById(recommendation.recommendedPilotScopeId);
  const proofItems = enterpriseInfrastructureProofPacketChecklist.filter((item) =>
    recommendation.proofPacketItemIds.includes(item.id)
  );
  const discoveryQuestions = enterpriseInfrastructureDiscoveryQuestions.filter((question) =>
    recommendation.requiredDiscoveryQuestionIds.includes(question.id)
  );

  return {
    id: `${input.id}-buyer-packet`,
    recommendationInputId: input.id,
    buyerRole: input.buyerRole,
    recommendedPilotScopeId: recommendation.recommendedPilotScopeId,
    meetingAgenda: [
      `Confirm buyer role and target outcome: ${input.desiredOutcome}`,
      `Review systems mentioned without PHI or credentials: ${input.systemsMentioned.join(", ")}`,
      `Validate deployment constraints: ${input.deploymentConstraints.join(", ")}`,
      `Select or revise the recommended no-PHI pilot: ${scope.name}`,
      "Confirm human reviewers and retained NO-GO boundaries before any next step"
    ],
    demoSequence: [
      "Open Enterprise Healthcare Infrastructure Readiness route",
      "Show standards and systems coverage",
      "Show No-PHI Discovery Intake",
      `Show recommended pilot: ${scope.name}`,
      "Show Proof Packet Checklist and Hard Stops"
    ],
    decisionCriteria: [
      "Buyer agrees no PHI, credentials, raw connector payloads, or production exports are needed for first proof",
      "Buyer can name one workflow owner and one reviewer",
      "Pilot scope has one measurable synthetic outcome",
      "Proof artifacts are sufficient for the next internal buyer review",
      "No production connector, clinical, payer, security, certification, or customer go-live claim is required"
    ],
    requiredArtifacts: [
      ...proofItems.map((item) => item.artifact),
      ...discoveryQuestions.map((question) => question.prompt)
    ],
    followUpOutline: [
      `Thank the buyer for reviewing ${scope.name}`,
      "Restate that the first step is synthetic and metadata-only",
      "List the accepted discovery inputs and explicitly exclude PHI, credentials, and raw payloads",
      "Attach or link the proof packet checklist",
      "Ask the buyer to confirm reviewer roles and one target success metric"
    ],
    commercialPosition: `${scope.commercialModel} ${scope.priceBandSignal}`,
    blockedClaims: [
      "No live PHI authority",
      "No autonomous clinical care or final imaging interpretation",
      "No payer submission, claim filing, or billing submission",
      "No EHR, PACS, RIS, HIS, database, VPN, firewall, or cloud mutation",
      "No certification, clinical validation, customer go-live, revenue, payment, or security assurance claim"
    ],
    nextSafeAction: scope.nextHumanAction,
    humanReviewRequired: true,
    auditHash: infrastructureHash(`${input.id}-buyer-packet`, "buyer-packet")
  };
}

export const enterpriseInfrastructureBuyerPackets: EnterpriseInfrastructureBuyerPacket[] =
  enterpriseInfrastructurePilotRecommendationInputs.map((input) => {
    const recommendation = enterpriseInfrastructurePilotRecommendations.find(
      (pilotRecommendation) => pilotRecommendation.inputId === input.id
    ) ?? recommendEnterpriseInfrastructurePilot(input);

    return packetForRecommendation(input, recommendation);
  });

function scorecardForBuyerPacket(packet: EnterpriseInfrastructureBuyerPacket): EnterpriseInfrastructureDecisionReadinessScorecard {
  const securityHeavy = packet.recommendedPilotScopeId === "private-runtime-readiness-sprint";
  const clinicalWorkflow = packet.recommendedPilotScopeId === "dicom-pacs-ris-ops-sprint";
  const rcmWorkflow = packet.recommendedPilotScopeId === "x12-rcm-evidence-sprint";
  const evidenceCompletenessScore = Math.min(94, 72 + packet.requiredArtifacts.length * 2);
  const securityReviewScore = securityHeavy ? 88 : 82;
  const clinicalSafetyScore = clinicalWorkflow ? 86 : rcmWorkflow ? 83 : 90;
  const commercialReadinessScore = packet.commercialPosition.includes("Paid") ? 89 : 84;
  const procurementReadinessScore = Math.round(
    (evidenceCompletenessScore + securityReviewScore + clinicalSafetyScore + commercialReadinessScore) / 4
  );
  const readinessStage =
    procurementReadinessScore >= 88
      ? "buyer_review_ready"
      : evidenceCompletenessScore >= 82
        ? "evidence_collection_required"
        : "blocked_until_qualified_review";

  return {
    id: `${packet.id}-decision-scorecard`,
    buyerPacketId: packet.id,
    buyerRole: packet.buyerRole,
    recommendedPilotScopeId: packet.recommendedPilotScopeId,
    readinessStage,
    procurementReadinessScore,
    securityReviewScore,
    clinicalSafetyScore,
    commercialReadinessScore,
    evidenceCompletenessScore,
    blockedDecisionReasons: [
      "No live PHI authority",
      "No production connector authority",
      "No autonomous clinical, payer, imaging, outreach, or writeback authority",
      "No certification, clinical validation, customer go-live, reimbursement, revenue, or security assurance claim",
      "Qualified human review is required before any protected pilot or procurement movement"
    ],
    requiredNextEvidence: [
      ...packet.requiredArtifacts.slice(0, 4),
      "Named buyer-side reviewer and SCRIMED reviewer",
      "One measurable synthetic pilot success metric",
      "Claims-safe follow-up packet with blocked-boundary card"
    ],
    executiveDecisionPrompt:
      readinessStage === "buyer_review_ready"
        ? `Review ${packet.recommendedPilotScopeId} as a no-PHI buyer-review package, then decide whether to schedule a protected-scope discovery call.`
        : `Collect the missing no-PHI evidence for ${packet.recommendedPilotScopeId}, then rerun human review before buyer escalation.`,
    safeClosePlan: [
      "Restate the synthetic/metadata-only boundary in the meeting recap",
      "Attach the buyer packet, proof checklist, and decision scorecard",
      "Ask for one workflow owner, one security/procurement reviewer, and one measurable outcome",
      "Keep production, clinical, payer, connector, certification, and go-live authority blocked until qualified approval"
    ],
    humanReviewRequired: true,
    productionAuthority: false,
    auditHash: infrastructureHash(`${packet.id}-decision-scorecard`, "decision-readiness")
  };
}

export const enterpriseInfrastructureDecisionReadinessScorecards: EnterpriseInfrastructureDecisionReadinessScorecard[] =
  enterpriseInfrastructureBuyerPackets.map(scorecardForBuyerPacket);

function procurementActionPlanForScorecard(
  scorecard: EnterpriseInfrastructureDecisionReadinessScorecard
): EnterpriseInfrastructureProcurementActionPlan {
  const clinicalOrImaging = scorecard.recommendedPilotScopeId === "dicom-pacs-ris-ops-sprint";
  const rcm = scorecard.recommendedPilotScopeId === "x12-rcm-evidence-sprint";
  const privateRuntime = scorecard.recommendedPilotScopeId === "private-runtime-readiness-sprint";
  const ownerRoles = [
    "SCRIMED founder/operator",
    "buyer champion",
    privateRuntime ? "security/procurement reviewer" : "workflow owner",
    clinicalOrImaging ? "radiology operations reviewer" : rcm ? "RCM/reimbursement reviewer" : "implementation reviewer"
  ];

  return {
    id: `${scorecard.id}-procurement-action-plan`,
    decisionScorecardId: scorecard.id,
    buyerPacketId: scorecard.buyerPacketId,
    buyerRole: scorecard.buyerRole,
    recommendedPilotScopeId: scorecard.recommendedPilotScopeId,
    ownerRoles,
    gateSequence: [
      "Confirm no-PHI buyer discovery scope",
      "Collect only approved metadata and synthetic examples",
      "Review the decision scorecard and blocked-decision reasons",
      "Select one measurable synthetic pilot outcome",
      "Prepare claims-safe follow-up and proof packet",
      "Escalate to qualified review before any protected pilot or procurement movement"
    ],
    targetWindow:
      scorecard.readinessStage === "buyer_review_ready"
        ? "1-2 business days for buyer-review follow-up"
        : "3-5 business days for evidence collection before buyer escalation",
    evidenceToCollect: [
      ...scorecard.requiredNextEvidence,
      "Buyer-approved no-PHI meeting recap",
      "Named reviewer roles and decision owner",
      "Boundary card attached to buyer follow-up"
    ],
    blockerToResolve: scorecard.blockedDecisionReasons,
    escalationTrigger:
      "Escalate when the buyer requests PHI, live connector access, credentials, EHR/PACS/RIS/HIS changes, payer submission, clinical authority, certification claims, or customer go-live language.",
    completionCriteria: [
      "No PHI, credentials, raw connector payloads, or production exports are present",
      "All required evidence is present as metadata or synthetic examples",
      "One buyer owner and one SCRIMED reviewer are named",
      "The pilot outcome is measurable without live patient data",
      "The buyer follow-up preserves all blocked authority claims"
    ],
    safeOperatorScript: [
      `Position ${scorecard.recommendedPilotScopeId} as a no-PHI readiness path, not production approval.`,
      "Ask for system names, workflow priorities, reviewer roles, and success metric only.",
      "Decline requests to process patient data, submit to payers, mutate systems, or claim certification.",
      "Offer a human-reviewed proof packet and protected-scope discovery call as the next step."
    ],
    handoffArtifacts: [
      scorecard.buyerPacketId,
      scorecard.id,
      "no-phi-discovery-intake",
      "boundary-and-approval-card",
      "claims-safe-follow-up-outline"
    ],
    humanReviewRequired: true,
    productionAuthority: false,
    auditHash: infrastructureHash(`${scorecard.id}-procurement-action-plan`, "procurement-action-plan")
  };
}

export const enterpriseInfrastructureProcurementActionPlans: EnterpriseInfrastructureProcurementActionPlan[] =
  enterpriseInfrastructureDecisionReadinessScorecards.map(procurementActionPlanForScorecard);

export function getEnterpriseInfrastructureConformanceControlPack(): EnterpriseInfrastructureConformanceControlPack {
  const conformance = getInteroperabilityConformanceEvaluationSummary();
  const supportedLanes = conformance.evaluations.map((evaluation) => evaluation.slug);

  return {
    id: "hospital-integration-conformance-control-pack",
    status:
      conformance.syntheticPassed === conformance.evaluationCount
        ? "synthetic_evidence_ready"
        : "attention_required",
    evaluationCount: conformance.evaluationCount,
    syntheticPassed: conformance.syntheticPassed,
    liveBlocked: conformance.liveBlocked,
    supportedLanes,
    requiredReviewRoles: [
      "interoperability architect",
      "interface engine owner",
      "imaging informatics owner",
      "revenue cycle or payer operations owner",
      "security and privacy reviewer",
      "clinical governance reviewer"
    ],
    evidenceRoutes: [
      "/api/interoperability/conformance",
      "/interoperability/evaluations",
      "/integrations/fixture-validation",
      enterpriseHealthcareInfrastructureApiRoute,
      enterpriseHealthcareInfrastructureBriefRoute
    ],
    releaseCriteria: [
      "Every synthetic evaluation passes its deterministic checks.",
      "Deployment-specific profiles, versions, actors, transactions, and endpoint roles are selected.",
      "Partner acceptance covers errors, acknowledgements, retries, duplicates, replay, monitoring, and rollback.",
      "Tenant identity, purpose-of-use, consent, least privilege, retention, and durable audit are approved.",
      "Human owners approve the exact no-PHI pilot scope and retain all live connector, clinical, payer, and write boundaries."
    ],
    commercialOffer:
      "Fixed-scope Hospital Integration Conformance Readiness assessment with a synthetic evidence packet and human-reviewed pilot recommendation.",
    expansionPath:
      "Assessment -> synthetic conformance sprint -> protected no-PHI pilot -> partner acceptance planning -> separately approved enterprise integration.",
    humanReviewRequired: true,
    productionAuthority: false,
    auditHash: infrastructureHash("hospital-integration-conformance-control-pack", "conformance-control-pack")
  };
}

export function getEnterpriseHealthcareInfrastructureScorecard(): EnterpriseInfrastructureScorecard {
  const syntheticReadyCount = enterpriseHealthcareInfrastructureCapabilities.filter(
    (capabilityItem) => capabilityItem.readinessStatus === "ready_for_synthetic_demo"
  ).length;
  const customerDiscoveryRequiredCount = enterpriseHealthcareInfrastructureCapabilities.filter(
    (capabilityItem) => capabilityItem.readinessStatus === "requires_customer_discovery"
  ).length;
  const blockedCount = enterpriseHealthcareInfrastructureCapabilities.filter(
    (capabilityItem) => capabilityItem.readinessStatus === "blocked_until_approval"
  ).length;

  return {
    totalCapabilities: enterpriseHealthcareInfrastructureCapabilities.length,
    syntheticReadyCount,
    customerDiscoveryRequiredCount,
    blockedCount,
    standardsCovered,
    buyerReadinessScore: 89,
    integrationReadinessScore: 84,
    securityReadinessScore: 88,
    revenueReadinessScore: 87,
    productionAuthority: false,
    auditHash: infrastructureHash("enterprise-healthcare-infrastructure-scorecard", "scorecard")
  };
}

export function getEnterpriseHealthcareInfrastructureSummary() {
  const scorecard = getEnterpriseHealthcareInfrastructureScorecard();
  const conformanceControlPack = getEnterpriseInfrastructureConformanceControlPack();
  const blockedCapabilityIds = enterpriseHealthcareInfrastructureCapabilities
    .filter((capabilityItem) => capabilityItem.readinessStatus === "blocked_until_approval")
    .map((capabilityItem) => capabilityItem.id);
  const discoveryCapabilityIds = enterpriseHealthcareInfrastructureCapabilities
    .filter((capabilityItem) => capabilityItem.readinessStatus === "requires_customer_discovery")
    .map((capabilityItem) => capabilityItem.id);

  return {
    service: "enterprise-healthcare-infrastructure",
    status: enterpriseHealthcareInfrastructureStatus,
    apiRoute: enterpriseHealthcareInfrastructureApiRoute,
    briefRoute: enterpriseHealthcareInfrastructureBriefRoute,
    pageRoute: enterpriseHealthcareInfrastructurePageRoute,
    boundary: enterpriseHealthcareInfrastructureBoundary,
    scorecard,
    conformanceControlPack,
    competitiveDesignPatterns: enterpriseInfrastructureCompetitiveDesignPatterns,
    standardsCovered,
    capabilities: enterpriseHealthcareInfrastructureCapabilities,
    integrationPaths: enterpriseInfrastructureIntegrationPaths,
    salesMotions: enterpriseInfrastructureSalesMotions,
    discoveryQuestions: enterpriseInfrastructureDiscoveryQuestions,
    pilotScopes: enterpriseInfrastructurePilotScopes,
    proofPacketChecklist: enterpriseInfrastructureProofPacketChecklist,
    pilotRecommendationInputs: enterpriseInfrastructurePilotRecommendationInputs,
    pilotRecommendations: enterpriseInfrastructurePilotRecommendations,
    buyerPackets: enterpriseInfrastructureBuyerPackets,
    decisionReadinessScorecards: enterpriseInfrastructureDecisionReadinessScorecards,
    procurementActionPlans: enterpriseInfrastructureProcurementActionPlans,
    blockedActions,
    blockedCapabilityIds,
    discoveryCapabilityIds,
    nextBestMove:
      "Use the Hospital Integration Conformance Control Pack as SCRIMED's infrastructure proof packet: pair hospital IT discovery with executable synthetic FHIR/SMART/HL7/DICOM/X12 evaluations, security review, one priced no-PHI pilot path, a human-reviewed buyer decision scorecard, and a procurement action plan.",
    buyerConfidenceMessage:
      "SCRIMED can demonstrate how the platform understands healthcare infrastructure without asking for PHI or promising live connector authority.",
    productionAuthority: false,
    noPhiConfirmed: true,
    humanReviewRequired: true,
    policyVersion: scrimedSafetyPolicyVersion
  };
}

export function buildEnterpriseHealthcareInfrastructureBrief() {
  const summary = getEnterpriseHealthcareInfrastructureSummary();

  return [
    "# SCRIMED Enterprise Healthcare Infrastructure Readiness",
    "",
    summary.boundary,
    "",
    "## Scorecard",
    `- Status: ${summary.status}`,
    `- Total capabilities: ${summary.scorecard.totalCapabilities}`,
    `- Synthetic-ready capabilities: ${summary.scorecard.syntheticReadyCount}`,
    `- Customer-discovery capabilities: ${summary.scorecard.customerDiscoveryRequiredCount}`,
    `- Buyer readiness score: ${summary.scorecard.buyerReadinessScore}`,
    `- Integration readiness score: ${summary.scorecard.integrationReadinessScore}`,
    `- Security readiness score: ${summary.scorecard.securityReadinessScore}`,
    `- Revenue readiness score: ${summary.scorecard.revenueReadinessScore}`,
    `- Production authority: ${summary.scorecard.productionAuthority}`,
    "",
    "## Standards and Systems Covered",
    ...summary.standardsCovered.map((standard) => `- ${standard}`),
    "",
    "## Hospital Integration Conformance Control Pack",
    `- Status: ${summary.conformanceControlPack.status}`,
    `- Synthetic evaluations passed: ${summary.conformanceControlPack.syntheticPassed}/${summary.conformanceControlPack.evaluationCount}`,
    `- Live connector lanes blocked: ${summary.conformanceControlPack.liveBlocked}`,
    `- Supported lanes: ${summary.conformanceControlPack.supportedLanes.join(", ")}`,
    `- Commercial offer: ${summary.conformanceControlPack.commercialOffer}`,
    `- Expansion path: ${summary.conformanceControlPack.expansionPath}`,
    `- Production authority: ${summary.conformanceControlPack.productionAuthority}`,
    "",
    "## Independently Applied Market Patterns",
    ...summary.competitiveDesignPatterns.map(
      (pattern) =>
        `- ${pattern.id}: observed=${pattern.observedMarketPattern}; SCRIMED=${pattern.scrimedApplication}; boundary=${pattern.safetyBoundary}`
    ),
    "",
    "## Capabilities",
    ...summary.capabilities.map(
      (capabilityItem) =>
        `- ${capabilityItem.id}: ${capabilityItem.name}; status=${capabilityItem.readinessStatus}; systems=${capabilityItem.standardsOrSystems.join(", ")}; next=${capabilityItem.nextBuildStep}`
    ),
    "",
    "## Integration Paths",
    ...summary.integrationPaths.map(
      (path) => `- ${path.id}: ${path.from} -> ${path.through} -> ${path.to}; blocked=${path.blockedMode}`
    ),
    "",
    "## Sales Motions",
    ...summary.salesMotions.map((motion) => `- ${motion.id}: buyer=${motion.buyer}; revenue=${motion.revenueStream}`),
    "",
    "## Discovery Questions",
    ...summary.discoveryQuestions.map(
      (question) =>
        `- ${question.id}: ${question.prompt} Accepted=${question.acceptedInput} Forbidden=${question.forbiddenInput}`
    ),
    "",
    "## Pilot Scopes",
    ...summary.pilotScopes.map(
      (scope) =>
        `- ${scope.id}: ${scope.name}; trigger=${scope.buyerTrigger}; commercial=${scope.commercialModel}; boundary=${scope.noGoBoundary}`
    ),
    "",
    "## Proof Packet Checklist",
    ...summary.proofPacketChecklist.map(
      (item) => `- ${item.id}: ${item.artifact}; required before=${item.requiredBefore}; review=${item.reviewGate}`
    ),
    "",
    "## Pilot Recommendation Engine",
    ...summary.pilotRecommendations.map(
      (recommendation) =>
        `- ${recommendation.inputId}: recommended=${recommendation.recommendedPilotScopeId}; score=${recommendation.score}; discovery=${recommendation.requiredDiscoveryQuestionIds.join(", ")}; proof=${recommendation.proofPacketItemIds.join(", ")}`
    ),
    "",
    "## Buyer Packet Composer",
    ...summary.buyerPackets.map(
      (packet) =>
        `- ${packet.id}: buyer=${packet.buyerRole}; recommended=${packet.recommendedPilotScopeId}; next=${packet.nextSafeAction}; artifacts=${packet.requiredArtifacts.length}`
    ),
    "",
    "## Decision Readiness Scorecards",
    ...summary.decisionReadinessScorecards.map(
      (scorecard) =>
        `- ${scorecard.id}: buyer=${scorecard.buyerRole}; stage=${scorecard.readinessStage}; procurement=${scorecard.procurementReadinessScore}; security=${scorecard.securityReviewScore}; clinical_safety=${scorecard.clinicalSafetyScore}; evidence=${scorecard.evidenceCompletenessScore}; production_authority=${scorecard.productionAuthority}`
    ),
    "",
    "## Procurement Action Plans",
    ...summary.procurementActionPlans.map(
      (plan) =>
        `- ${plan.id}: buyer=${plan.buyerRole}; pilot=${plan.recommendedPilotScopeId}; owners=${plan.ownerRoles.join(", ")}; target=${plan.targetWindow}; production_authority=${plan.productionAuthority}`
    ),
    "",
    "## Blocked Actions",
    ...summary.blockedActions.map((action) => `- ${action}`),
    "",
    "## Next Best Move",
    summary.nextBestMove,
    "",
    "This is synthetic/metadata-only infrastructure readiness. It does not authorize live PHI, EHR writeback, payer submission, final imaging interpretation, production connector approval, certification claims, customer go-live, or competitor proprietary copying."
  ].join("\n");
}
