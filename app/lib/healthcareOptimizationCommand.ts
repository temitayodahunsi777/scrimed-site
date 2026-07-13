import { getClinicalContextGatewaySummary } from "./clinicalContextGateway";
import { getEnterpriseHealthcareInfrastructureSummary } from "./enterpriseHealthcareInfrastructure";
import { getHealthRecordsSafetyExchangeSummary } from "./healthRecordsSafetyExchange";
import { getHealthcareIntelligenceOSSummary } from "./healthcareIntelligenceOS";
import { getScrimedAutomationAutopilotSummary } from "./scrimedAutomationAutopilot";
import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import { scrimedSafetyPolicyVersion } from "./scrimedSafetyGovernance";
import { getStrategicProblemResolutionSummary } from "./strategicProblemResolution";

export type HealthcareOptimizationDomain =
  | "clinical-workflow"
  | "patient-engagement"
  | "hospital-operations"
  | "interoperability"
  | "agent-capability"
  | "innovation-pipeline"
  | "health-tech-solution";

export type HealthcareOptimizationReadiness =
  | "synthetic-ready"
  | "review-gated"
  | "customer-sandbox-required"
  | "external-approval-required";

export type HealthcareOptimizationLane = {
  id: string;
  domain: HealthcareOptimizationDomain;
  name: string;
  buyerProblem: string;
  optimizationThesis: string;
  currentScrimedAssets: string[];
  agentCapabilities: string[];
  workflowInputs: string[];
  interoperableStandards: string[];
  measurableOutcomes: string[];
  patientSafetyControls: string[];
  humanReviewRequired: true;
  readiness: HealthcareOptimizationReadiness;
  safeAutomationMode: "recommendation-only" | "human-reviewed-draft" | "synthetic-orchestration";
  blockedActions: string[];
  proofRoutes: string[];
  nextBuildStep: string;
  commercialMotion: string;
  priorityScore: number;
  auditHash: string;
};

export type HealthcareOptimizationPlaybook = {
  id: string;
  title: string;
  targetTeam: string;
  triggerSignal: string;
  governedWorkflow: string[];
  automationAssist: string;
  humanGate: string;
  proofRoute: string;
  fallbackPath: string;
};

export type HealthcareInnovationTrack = {
  id: string;
  title: string;
  opportunity: string;
  validationPath: string[];
  requiredEvidence: string[];
  retainedBoundary: string;
  owner: string;
};

export const healthcareOptimizationCommandRoute = "/healthcare-optimization-command";
export const healthcareOptimizationCommandApiRoute = "/api/healthcare-optimization-command";
export const healthcareOptimizationCommandBriefRoute =
  "/api/healthcare-optimization-command/brief";
export const healthcareOptimizationCommandStatus =
  "healthcare-optimization-command-active-synthetic-no-production-authority";
export const healthcareOptimizationCommandBriefStatus =
  "healthcare-optimization-command-brief-ready-no-live-action";
export const healthcareOptimizationCommandUpdatedAt = "2026-07-09";

export const healthcareOptimizationCommandBoundary =
  "SCRIMED Healthcare Optimization Command coordinates synthetic-only clinical workflow optimization, patient engagement analysis, hospital operations intelligence, agent capability growth, innovation intake, health-tech solution packaging, and interoperable solution planning. It does not authorize live PHI, autonomous clinical care, diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, imaging interpretation, production connector approval, production deployment, certification claims, valuation assurance, revenue guarantees, profit guarantees, or customer go-live.";

const blockedHealthcareActions = [
  "live PHI processing",
  "autonomous diagnosis, treatment, prescribing, triage, or clinical action",
  "patient outreach without human approval and consent controls",
  "payer submission, claim submission, or coverage determination",
  "EHR, RIS, PACS, HIS, pharmacy, or production connector writeback",
  "final imaging interpretation or clinical signoff",
  "production deployment or customer go-live approval",
  "certification, valuation, revenue, profit, or market-size guarantee"
];

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function optimizationHash(id: string, thesis: string) {
  return generateScrimedAuditHash({
    id,
    thesis,
    boundary: healthcareOptimizationCommandBoundary,
    policyVersion: scrimedSafetyPolicyVersion,
    updated: healthcareOptimizationCommandUpdatedAt
  });
}

function createLane(
  lane: Omit<HealthcareOptimizationLane, "auditHash" | "priorityScore"> & {
    valueScore: number;
    safetyScore: number;
    interoperabilityScore: number;
    commercialScore: number;
  }
): HealthcareOptimizationLane {
  const priorityScore = clampScore(
    lane.valueScore * 0.34 +
      lane.safetyScore * 0.24 +
      lane.interoperabilityScore * 0.22 +
      lane.commercialScore * 0.2
  );

  return {
    id: lane.id,
    domain: lane.domain,
    name: lane.name,
    buyerProblem: lane.buyerProblem,
    optimizationThesis: lane.optimizationThesis,
    currentScrimedAssets: lane.currentScrimedAssets,
    agentCapabilities: lane.agentCapabilities,
    workflowInputs: lane.workflowInputs,
    interoperableStandards: lane.interoperableStandards,
    measurableOutcomes: lane.measurableOutcomes,
    patientSafetyControls: lane.patientSafetyControls,
    humanReviewRequired: lane.humanReviewRequired,
    readiness: lane.readiness,
    safeAutomationMode: lane.safeAutomationMode,
    blockedActions: lane.blockedActions,
    proofRoutes: lane.proofRoutes,
    nextBuildStep: lane.nextBuildStep,
    commercialMotion: lane.commercialMotion,
    priorityScore,
    auditHash: optimizationHash(lane.id, lane.optimizationThesis)
  };
}

export function getHealthcareOptimizationCommandSummary() {
  const healthcareOS = getHealthcareIntelligenceOSSummary();
  const healthRecords = getHealthRecordsSafetyExchangeSummary();
  const infrastructure = getEnterpriseHealthcareInfrastructureSummary();
  const contextGateway = getClinicalContextGatewaySummary();
  const automation = getScrimedAutomationAutopilotSummary();
  const problemResolution = getStrategicProblemResolutionSummary();

  const lanes: HealthcareOptimizationLane[] = [
    createLane({
      id: "clinical-workflow-burden-reduction",
      domain: "clinical-workflow",
      name: "Clinical workflow burden reduction",
      buyerProblem:
        "Clinicians lose time to documentation, handoffs, referrals, prior authorization preparation, and fragmented record review.",
      optimizationThesis:
        "Use semantic context, evidence requirements, and review-gated agents to draft packets and summaries while clinicians retain final authority.",
      currentScrimedAssets: [
        healthcareOS.route,
        contextGateway.route,
        "/clinical-production-readiness",
        "/scrimed-automation-autopilot"
      ],
      agentCapabilities: [
        "Clinical workflow planner",
        "Documentation completeness checker",
        "Referral packet assembler",
        "Prior authorization risk detector",
        "Clinical QA verifier"
      ],
      workflowInputs: [
        "synthetic encounter timeline",
        "synthetic problem list",
        "synthetic medication/allergy context",
        "synthetic payer policy metadata"
      ],
      interoperableStandards: ["FHIR R4", "HL7 v2 ORU/ORM", "C-CDA", "LOINC", "SNOMED CT", "RxNorm"],
      measurableOutcomes: [
        "documentation time saved",
        "missing-documentation risk reduced",
        "review packet completion",
        "clinician burden proxy"
      ],
      patientSafetyControls: [
        "decision support only",
        "source provenance required",
        "human clinical review required",
        "no diagnosis or treatment authority"
      ],
      humanReviewRequired: true,
      readiness: "review-gated",
      safeAutomationMode: "human-reviewed-draft",
      blockedActions: blockedHealthcareActions,
      proofRoutes: [healthcareOS.route, contextGateway.route, "/scrimed-agent-governance"],
      nextBuildStep:
        "Bind each burden-reduction workflow to a structured review packet, evidence card, and clinician signoff state.",
      commercialMotion:
        "Sell as a no-PHI clinical workflow assessment and documentation optimization pilot.",
      valueScore: 96,
      safetyScore: 92,
      interoperabilityScore: 88,
      commercialScore: 94
    }),
    createLane({
      id: "patient-engagement-continuity",
      domain: "patient-engagement",
      name: "Patient engagement continuity intelligence",
      buyerProblem:
        "Patients often leave visits with unclear next steps, low comprehension, missing follow-up, or access barriers.",
      optimizationThesis:
        "Analyze synthetic journeys for education gaps, follow-up risk, language/access needs, and consent-gated outreach readiness without contacting patients.",
      currentScrimedAssets: [
        "/scrimed-patient-context-gateway",
        "/health-records",
        "/client-onboarding",
        "/healthcare-intelligence-os"
      ],
      agentCapabilities: [
        "Education readability reviewer",
        "Follow-up risk analyzer",
        "Accessibility signal detector",
        "Consent gate checker",
        "Human handoff recommender"
      ],
      workflowInputs: [
        "synthetic discharge instruction",
        "synthetic appointment state",
        "synthetic health literacy signal",
        "synthetic language/access preference"
      ],
      interoperableStandards: ["FHIR Communication", "FHIR Consent", "FHIR CarePlan", "USCDI", "SMART on FHIR"],
      measurableOutcomes: [
        "education comprehension score",
        "follow-up completion readiness",
        "accessibility gap count",
        "patient navigation queue quality"
      ],
      patientSafetyControls: [
        "no autonomous patient outreach",
        "human review before communication",
        "consent-required flag",
        "emergency escalation language review"
      ],
      humanReviewRequired: true,
      readiness: "synthetic-ready",
      safeAutomationMode: "recommendation-only",
      blockedActions: blockedHealthcareActions,
      proofRoutes: ["/scrimed-patient-context-gateway", healthRecords.route, "/client-onboarding"],
      nextBuildStep:
        "Create patient-engagement review packets that separate education drafts from any outreach authority.",
      commercialMotion:
        "Package as patient access, education, and care-navigation improvement assessment.",
      valueScore: 90,
      safetyScore: 94,
      interoperabilityScore: 84,
      commercialScore: 88
    }),
    createLane({
      id: "hospital-operations-throughput",
      domain: "hospital-operations",
      name: "Hospital operations throughput intelligence",
      buyerProblem:
        "Hospitals need earlier signals for capacity, staffing, bed flow, scheduling friction, referral delays, and service-line bottlenecks.",
      optimizationThesis:
        "Turn synthetic operational events into bottleneck signals, owner-bound playbooks, and review-gated recommendations for operations leaders.",
      currentScrimedAssets: [
        "/operational-efficiency",
        "/service-reliability",
        "/scrimed-trustops",
        "/strategic-problem-resolution"
      ],
      agentCapabilities: [
        "Capacity signal detector",
        "Referral delay monitor",
        "Scheduling friction analyzer",
        "Staffing risk reviewer",
        "Service-line bottleneck mapper"
      ],
      workflowInputs: [
        "synthetic ADT event",
        "synthetic scheduling queue",
        "synthetic referral status",
        "synthetic staffing/capacity metadata"
      ],
      interoperableStandards: ["HL7 v2 ADT", "HL7 SIU", "FHIR Encounter", "FHIR Slot", "FHIR Schedule"],
      measurableOutcomes: [
        "referral cycle time",
        "scheduling capacity",
        "handoff delay signal",
        "operations owner resolution rate"
      ],
      patientSafetyControls: [
        "no autonomous routing",
        "operations review required",
        "no live patient movement authority",
        "no staffing command authority"
      ],
      humanReviewRequired: true,
      readiness: "synthetic-ready",
      safeAutomationMode: "synthetic-orchestration",
      blockedActions: blockedHealthcareActions,
      proofRoutes: ["/operational-efficiency", "/service-reliability", "/scrimed-trustops"],
      nextBuildStep:
        "Add an operations signal catalog that converts synthetic events into owner, severity, fallback, and evidence requirements.",
      commercialMotion:
        "Sell as hospital operations optimization and service-line intelligence readiness.",
      valueScore: 92,
      safetyScore: 90,
      interoperabilityScore: 86,
      commercialScore: 91
    }),
    createLane({
      id: "interoperable-solution-accelerator",
      domain: "interoperability",
      name: "Interoperable solution accelerator",
      buyerProblem:
        "Health systems need confidence that AI workflows understand FHIR, HL7, DICOM, X12, PACS/RIS/HIS, integration engines, networks, and governance.",
      optimizationThesis:
        "Use standards-aware synthetic fixtures and discovery packets to prove architecture fit before live endpoint approval.",
      currentScrimedAssets: [
        infrastructure.pageRoute,
        healthRecords.route,
        "/interoperability",
        "/clinical-context-gateway"
      ],
      agentCapabilities: [
        "FHIR validation agent",
        "HL7 event mapper",
        "DICOM metadata readiness agent",
        "X12 policy packet reviewer",
        "Connector approval gatekeeper"
      ],
      workflowInputs: [
        "synthetic FHIR bundle",
        "synthetic HL7 ADT/ORU/SIU",
        "synthetic DICOM metadata",
        "synthetic X12 authorization metadata"
      ],
      interoperableStandards: [
        "FHIR R4",
        "HL7 v2",
        "DICOM/DICOMweb",
        "X12",
        "SMART on FHIR",
        "TEFCA/QHIN readiness"
      ],
      measurableOutcomes: [
        "source contract completeness",
        "schema-to-semantic mapping quality",
        "integration discovery readiness",
        "governance gate closure"
      ],
      patientSafetyControls: [
        "no raw connector payload logging",
        "no production endpoint use",
        "semantic context only",
        "customer sandbox required before live work"
      ],
      humanReviewRequired: true,
      readiness: "customer-sandbox-required",
      safeAutomationMode: "recommendation-only",
      blockedActions: blockedHealthcareActions,
      proofRoutes: [infrastructure.pageRoute, healthRecords.route, contextGateway.route],
      nextBuildStep:
        "Create a buyer-specific integration discovery packet that maps standards, systems, VPN/VM/firewall needs, and owner approvals.",
      commercialMotion:
        "Package as interoperability readiness and hospital IT discovery before protected pilot scope.",
      valueScore: 94,
      safetyScore: 93,
      interoperabilityScore: 98,
      commercialScore: 92
    }),
    createLane({
      id: "agent-capability-expansion",
      domain: "agent-capability",
      name: "Agent capability expansion with approval gates",
      buyerProblem:
        "Healthcare teams need agents that can coordinate work, not chatbots that produce unreviewed text.",
      optimizationThesis:
        "Expand specialized agents with declared scope, allowed tools, blocked actions, traceability, cost controls, and human approval gates.",
      currentScrimedAssets: [
        automation.route,
        "/scrimed-agent-governance",
        "/scrimed-trustops",
        "/scrimed-intelligence-safety-stack"
      ],
      agentCapabilities: [
        "Supervisor agent",
        "Clinical workflow agent",
        "Patient access agent",
        "Hospital operations agent",
        "Interoperability validation agent",
        "Innovation reviewer agent"
      ],
      workflowInputs: [
        "synthetic task intent",
        "agent scope registry",
        "policy decision",
        "audit trace metadata"
      ],
      interoperableStandards: ["MCP", "A2A", "FHIR-ready tool contracts", "OpenTelemetry-compatible trace metadata"],
      measurableOutcomes: [
        "tool-call authorization rate",
        "human-review routing quality",
        "agent trace completeness",
        "cost and latency guardrail adherence"
      ],
      patientSafetyControls: [
        "deny-by-default permissions",
        "human approval for irreversible actions",
        "kill-switch escalation",
        "no autonomous clinical authority"
      ],
      humanReviewRequired: true,
      readiness: "review-gated",
      safeAutomationMode: "synthetic-orchestration",
      blockedActions: blockedHealthcareActions,
      proofRoutes: [automation.route, "/scrimed-agent-governance", "/scrimed-trustops"],
      nextBuildStep:
        "Register each healthcare optimization agent with owner, scope, allowed data class, blocked tools, and audit hash.",
      commercialMotion:
        "Demonstrate governed agents as enterprise workflow infrastructure rather than simple chat automation.",
      valueScore: 93,
      safetyScore: 95,
      interoperabilityScore: 90,
      commercialScore: 93
    }),
    createLane({
      id: "innovation-to-pilot-pipeline",
      domain: "innovation-pipeline",
      name: "Innovation-to-pilot pipeline",
      buyerProblem:
        "High-value ideas can stall or become unsafe when they do not move through evidence, risk, simulation, review, and pilot packaging.",
      optimizationThesis:
        "Route every new idea through a repeatable funnel: intake, boundary check, synthetic scenario, evaluation, proof packet, human approval, and pilot scope.",
      currentScrimedAssets: [
        problemResolution.route,
        "/scrimed-proof-packet-studio",
        "/pilot-demo-commercial-readiness",
        "/investor-readiness"
      ],
      agentCapabilities: [
        "Innovation intake classifier",
        "Risk boundary mapper",
        "Synthetic scenario generator",
        "Evaluation harness linker",
        "Proof packet assembler"
      ],
      workflowInputs: [
        "idea brief",
        "target buyer",
        "risk class",
        "synthetic fixture plan",
        "expected outcome metric"
      ],
      interoperableStandards: ["FHIR when clinical", "HL7 when event-driven", "DICOM when imaging metadata", "X12 when payer"],
      measurableOutcomes: [
        "idea-to-proof cycle time",
        "evidence completeness",
        "buyer narrative clarity",
        "pilot readiness score"
      ],
      patientSafetyControls: [
        "boundary check before build",
        "human review before external pitch",
        "synthetic-only fixtures",
        "no production commitment"
      ],
      humanReviewRequired: true,
      readiness: "synthetic-ready",
      safeAutomationMode: "recommendation-only",
      blockedActions: blockedHealthcareActions,
      proofRoutes: [problemResolution.route, "/scrimed-proof-packet-studio", "/pilot-demo-commercial-readiness"],
      nextBuildStep:
        "Add innovation intake scoring that ranks ideas by buyer value, safety, feasibility, proof routes, and margin potential.",
      commercialMotion:
        "Use as a founder and enterprise innovation command lane for buyer-specific pilot design.",
      valueScore: 91,
      safetyScore: 91,
      interoperabilityScore: 84,
      commercialScore: 95
    }),
    createLane({
      id: "health-tech-solution-packaging",
      domain: "health-tech-solution",
      name: "Health-tech solution packaging",
      buyerProblem:
        "A broad platform needs clear, sellable solution packages that map to buyer pain, workflow outcomes, proof, price band, and boundaries.",
      optimizationThesis:
        "Turn SCRIMED capabilities into buyer-specific packages for clinics, hospitals, payers, life sciences, public-sector teams, and faith-based clinics.",
      currentScrimedAssets: ["/offerings", "/pricing", "/service-delivery", "/client-onboarding"],
      agentCapabilities: [
        "Buyer segment router",
        "Offer fit scorer",
        "Proof packet selector",
        "Delivery scope guard",
        "Margin risk reviewer"
      ],
      workflowInputs: [
        "buyer segment",
        "workflow pain",
        "current proof routes",
        "implementation constraints",
        "safe package boundary"
      ],
      interoperableStandards: ["FHIR", "HL7", "DICOM", "X12", "SMART on FHIR where relevant"],
      measurableOutcomes: [
        "qualified buyer path",
        "package-to-proof alignment",
        "implementation scope clarity",
        "margin protection"
      ],
      patientSafetyControls: [
        "no unsupported production claim",
        "no live-care authority",
        "no patient data required for assessment",
        "reviewed buyer communication"
      ],
      humanReviewRequired: true,
      readiness: "synthetic-ready",
      safeAutomationMode: "human-reviewed-draft",
      blockedActions: blockedHealthcareActions,
      proofRoutes: ["/offerings", "/pricing", "/service-delivery", "/client-onboarding"],
      nextBuildStep:
        "Attach each package to one buyer path, one proof bundle, one pricing band, and one no-go boundary.",
      commercialMotion:
        "Use as the product packaging engine for enterprise, clinic, investor, partner, and public-sector conversations.",
      valueScore: 90,
      safetyScore: 88,
      interoperabilityScore: 82,
      commercialScore: 97
    })
  ].sort((left, right) => right.priorityScore - left.priorityScore);

  const playbooks: HealthcareOptimizationPlaybook[] = [
    {
      id: "documentation-completeness-playbook",
      title: "Documentation completeness before prior authorization or referral",
      targetTeam: "Clinical operations, prior authorization, referral coordinators",
      triggerSignal: "Missing symptom language, functional status, visit timing, medical necessity, or supporting evidence.",
      governedWorkflow: [
        "detect documentation gap",
        "map required evidence",
        "draft missing-evidence checklist",
        "queue human review",
        "bind proof packet"
      ],
      automationAssist: "Generate review-ready checklist only.",
      humanGate: "Clinician or authorized reviewer approves before external use.",
      proofRoute: "/api/scrimed-build-roadmap/strategic-execution",
      fallbackPath: "Queue manual verification and pause submission-related language."
    },
    {
      id: "patient-education-playbook",
      title: "Patient education clarity and access review",
      targetTeam: "Patient engagement, discharge, access center",
      triggerSignal: "Low readability, language/access mismatch, missing follow-up plan, or consent ambiguity.",
      governedWorkflow: [
        "score comprehension risk",
        "draft plain-language education",
        "flag access barriers",
        "queue human review",
        "record audit hash"
      ],
      automationAssist: "Recommend education improvements without contacting patients.",
      humanGate: "Human review and consent controls before any communication.",
      proofRoute: "/scrimed-patient-context-gateway",
      fallbackPath: "Route to care team verification."
    },
    {
      id: "hospital-throughput-playbook",
      title: "Hospital throughput and referral delay review",
      targetTeam: "Hospital operations, patient access, service-line leadership",
      triggerSignal: "Referral delay, scheduling backlog, handoff risk, capacity pressure, or failed sync.",
      governedWorkflow: [
        "classify operational signal",
        "rank severity",
        "assign owner",
        "recommend safe remediation",
        "track closure"
      ],
      automationAssist: "Recommend owner-bound actions; do not mutate operational systems.",
      humanGate: "Operations owner approves action.",
      proofRoute: "/operational-efficiency",
      fallbackPath: "Open manual investigation ticket."
    },
    {
      id: "interoperability-discovery-playbook",
      title: "Interoperability discovery before connector work",
      targetTeam: "Hospital IT, security, integration engine teams",
      triggerSignal: "FHIR/HL7/DICOM/X12, PACS/RIS/HIS, VPN, VM, database, firewall, or integration-engine request.",
      governedWorkflow: [
        "capture systems inventory",
        "select standards profile",
        "map customer approvals",
        "run synthetic conformance",
        "produce discovery packet"
      ],
      automationAssist: "Generate discovery packet from metadata and synthetic fixtures.",
      humanGate: "Security, privacy, customer, and technical owners approve before live work.",
      proofRoute: "/enterprise-healthcare-infrastructure",
      fallbackPath: "Use no-PHI fixture validation only."
    }
  ];

  const innovationTracks: HealthcareInnovationTrack[] = [
    {
      id: "agentic-workflow-automation",
      title: "Agentic workflow automation",
      opportunity:
        "Move from chatbot interactions to governed workflow execution across intake, referrals, prior auth, RCM, support, and operations.",
      validationPath: ["scope agent", "declare tools", "simulate run", "evaluate trace", "queue human approval"],
      requiredEvidence: ["agent identity", "permissions", "tool registry", "audit hash", "human approval status"],
      retainedBoundary: "No irreversible, clinical, payer, outreach, or EHR action without approval.",
      owner: "AgentOS + TrustOS"
    },
    {
      id: "local-first-deidentification",
      title: "Local-first de-identification",
      opportunity:
        "Prepare browser, desktop, mobile, and edge pathways for redaction before external inference or indexing.",
      validationPath: ["detect PHI class", "redact locally", "verify layout", "hash artifact", "queue reviewer"],
      requiredEvidence: ["redaction coverage", "layout preservation", "no raw payload logging", "review disposition"],
      retainedBoundary: "No live PHI in public demos or unauthenticated workflows.",
      owner: "Security + Data Governance"
    },
    {
      id: "pre-indexed-healthcare-intelligence",
      title: "Pre-indexed healthcare intelligence",
      opportunity:
        "Build enriched indexes that preserve structure, provenance, standards mapping, and retrieval evaluation before agent use.",
      validationPath: ["ingest synthetic source", "preserve structure", "map ontology", "score retrieval", "bind provenance"],
      requiredEvidence: ["source attribution", "semantic mapping", "retrieval score", "evidence card"],
      retainedBoundary: "No raw connector payloads or production database schemas exposed to agents.",
      owner: "Clinical Data Fabric + Retrieval"
    },
    {
      id: "healthcare-world-models",
      title: "Healthcare world models",
      opportunity:
        "Represent time, geography, capacity, payer rules, patient journey state, and workflow state for better operational reasoning.",
      validationPath: ["define state model", "attach synthetic events", "evaluate transitions", "require evidence", "monitor drift"],
      requiredEvidence: ["state schema", "transition rules", "audit trace", "human review gate"],
      retainedBoundary: "Decision support only; no autonomous care, outreach, or operations command.",
      owner: "Clinical Intelligence + Operations"
    }
  ];

  const domainCounts = lanes.reduce<Record<HealthcareOptimizationDomain, number>>(
    (counts, lane) => ({
      ...counts,
      [lane.domain]: counts[lane.domain] + 1
    }),
    {
      "clinical-workflow": 0,
      "patient-engagement": 0,
      "hospital-operations": 0,
      interoperability: 0,
      "agent-capability": 0,
      "innovation-pipeline": 0,
      "health-tech-solution": 0
    }
  );

  return {
    service: "scrimed-healthcare-optimization-command",
    status: healthcareOptimizationCommandStatus,
    briefStatus: healthcareOptimizationCommandBriefStatus,
    route: healthcareOptimizationCommandRoute,
    apiRoute: healthcareOptimizationCommandApiRoute,
    briefRoute: healthcareOptimizationCommandBriefRoute,
    updated: healthcareOptimizationCommandUpdatedAt,
    boundary: healthcareOptimizationCommandBoundary,
    policyVersion: scrimedSafetyPolicyVersion,
    authority: {
      phiAuthority: "not-authorized-production-phi",
      clinicalCareAuthority: "not-authorized-live-care",
      patientOutreachAuthority: "human-review-and-consent-required",
      payerAuthority: "not-authorized",
      ehrWritebackAuthority: "not-authorized",
      imagingAuthority: "not-final-medical-interpretation",
      productionAuthority: "not-production-authorized",
      certificationAuthority: "not-certified",
      valuationAuthority: "not-valuation-assurance"
    },
    sourceAlignment: {
      healthcareIntelligenceOSStatus: healthcareOS.status,
      healthRecordsCapabilityCount: healthRecords.capabilityCount,
      infrastructureCapabilityCount: infrastructure.capabilities.length,
      clinicalContextGatewayStatus: contextGateway.status,
      automationAutopilotReadinessScore: automation.averageReadinessScore,
      strategicProblemCount: problemResolution.problemCount
    },
    laneCount: lanes.length,
    playbookCount: playbooks.length,
    innovationTrackCount: innovationTracks.length,
    domainCounts,
    averagePriorityScore: clampScore(
      lanes.reduce((total, lane) => total + lane.priorityScore, 0) / lanes.length
    ),
    humanReviewRequiredCount: lanes.filter((lane) => lane.humanReviewRequired).length,
    reviewGatedLaneCount: lanes.filter((lane) => lane.readiness === "review-gated").length,
    customerSandboxRequiredCount: lanes.filter((lane) => lane.readiness === "customer-sandbox-required").length,
    interoperableStandardCount: new Set(lanes.flatMap((lane) => lane.interoperableStandards)).size,
    agentCapabilityCount: new Set(lanes.flatMap((lane) => lane.agentCapabilities)).size,
    measurableOutcomeCount: new Set(lanes.flatMap((lane) => lane.measurableOutcomes)).size,
    proofRouteCount: new Set(lanes.flatMap((lane) => lane.proofRoutes)).size,
    blockedActionCount: blockedHealthcareActions.length,
    lanes,
    topLanes: lanes.slice(0, 5),
    playbooks,
    innovationTracks,
    blockedActions: blockedHealthcareActions,
    nextBestMove:
      "Promote the top optimization lane into a buyer-specific no-PHI proof packet with workflow inputs, agent scope, interoperability assumptions, human-review gate, outcome metric, and retained boundary."
  };
}

export function buildHealthcareOptimizationCommandBrief() {
  const summary = getHealthcareOptimizationCommandSummary();

  return [
    "# SCRIMED Healthcare Optimization Command Brief",
    "",
    `Status: ${summary.status}`,
    `Updated: ${summary.updated}`,
    `Optimization lanes: ${summary.laneCount}`,
    `Agent capabilities: ${summary.agentCapabilityCount}`,
    `Interoperable standards: ${summary.interoperableStandardCount}`,
    `Average priority: ${summary.averagePriorityScore}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief supports synthetic-only healthcare optimization planning. It does not authorize live PHI, autonomous clinical care, diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, final imaging interpretation, production deployment, certification claims, valuation assurance, revenue guarantees, profit guarantees, or customer go-live.",
    "",
    "## Top Optimization Lanes",
    ...summary.topLanes.map(
      (lane) =>
        `- ${lane.name} (${lane.priorityScore}, ${lane.readiness}): ${lane.nextBuildStep} Proof: ${lane.proofRoutes.join(", ")}`
    ),
    "",
    "## Governed Playbooks",
    ...summary.playbooks.map(
      (playbook) =>
        `- ${playbook.title}: ${playbook.triggerSignal} Human gate: ${playbook.humanGate} Proof: ${playbook.proofRoute}`
    ),
    "",
    "## Innovation Tracks",
    ...summary.innovationTracks.map(
      (track) =>
        `- ${track.title}: ${track.opportunity} Owner: ${track.owner} Boundary: ${track.retainedBoundary}`
    ),
    "",
    "## Blocked Actions",
    ...summary.blockedActions.map((action) => `- ${action}`),
    "",
    `Next best move: ${summary.nextBestMove}`
  ].join("\n");
}
