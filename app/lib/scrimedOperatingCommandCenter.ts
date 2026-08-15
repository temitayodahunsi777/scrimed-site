import { createHash } from "node:crypto";
import { getScrimedNodeRuntimeStatus } from "./platform/nodeRuntime";

export type ScrimedOperatingDomain =
  | "agent-runtime"
  | "infrastructure"
  | "workflow"
  | "product"
  | "service-delivery"
  | "ui-interface"
  | "governance"
  | "revenue-ops"
  | "interoperability"
  | "mlops";

export type ScrimedOperatingPriority = "P0" | "P1" | "P2";

export type ScrimedOperatingStatus =
  | "ready-for-synthetic-execution"
  | "in-progress"
  | "blocked-by-approval"
  | "protected-operator-required";

export type ScrimedSafeAutomationMode =
  | "read_only_metadata"
  | "synthetic_recommendation_only"
  | "human_review_queue_only"
  | "protected_operator_run_required";

export type ScrimedOperatingKpi = {
  metric: string;
  target: string;
  measurementMode: "synthetic" | "metadata" | "protected-after-approval";
};

export type ScrimedOperatingLane = {
  id: string;
  title: string;
  domain: ScrimedOperatingDomain;
  priority: ScrimedOperatingPriority;
  status: ScrimedOperatingStatus;
  owner: string;
  upgradeTargets: string[];
  currentCapability: string;
  nextSafeAction: string;
  agentImpact: string;
  workflowImpact: string;
  infrastructureImpact: string;
  interfaceImpact: string;
  requiredGates: string[];
  proofRoutes: string[];
  apiRoutes: string[];
  blockedActions: string[];
  safeAutomationMode: ScrimedSafeAutomationMode;
  humanReviewRequired: boolean;
  noGoBoundary: string;
  kpis: ScrimedOperatingKpi[];
};

export type ScrimedOperatingCadence = {
  cadence: "daily" | "weekly" | "release-candidate" | "quarterly";
  owner: string;
  reviewQuestion: string;
  requiredEvidence: string[];
  failClosedTrigger: string;
};

export type ScrimedOperatingValidationCheck = {
  check: string;
  passed: boolean;
  detail: string;
};

export type ScrimedOperatingEvidenceStage =
  | "synthetic-ready"
  | "synthetic-qa-required"
  | "protected-operator-required"
  | "external-approval-required"
  | "blocked-before-production";

export type ScrimedOperatingEvidencePacket = {
  packetId: string;
  laneId: string;
  releaseStage: ScrimedOperatingEvidenceStage;
  evidenceState: "complete-for-synthetic" | "missing-required-evidence" | "approval-blocked";
  requiredEvidence: string[];
  missingEvidence: string[];
  aal2Required: boolean;
  boundaryReleaseRequired: boolean;
  protectedOperatorRequired: boolean;
  safeOutput: string;
  blockedEscalations: string[];
  nextReviewAction: string;
  packetHash: string;
};

export const scrimedOperatingCommandCenterStatus =
  "scrimed-operating-command-center-ready-no-phi";

export const scrimedOperatingCommandCenterApiRoute =
  "/api/scrimed-operating-command";

export const scrimedOperatingCommandCenterBriefRoute =
  "/api/scrimed-operating-command/brief";

export const scrimedOperatingCommandCenterBoundary =
  "SCRIMED Operating Command Center is a synthetic/no-PHI execution planning layer. It improves systems, agents, infrastructure, workflows, services, products, UI, and interfaces without authorizing live PHI, autonomous diagnosis, treatment, prescribing, patient outreach, payer submission, billing submission, EHR writeback, production connector approval, certification claims, clinical validation claims, or customer go-live.";

export const scrimedOperatingCommandLanes: ScrimedOperatingLane[] = [
  {
    id: "agent-runtime-context-binding",
    title: "Bind every synthetic agent run to context, policy, and proof",
    domain: "agent-runtime",
    priority: "P0",
    status: "ready-for-synthetic-execution",
    owner: "AgentOS + TrustOS",
    upgradeTargets: ["Agent Runtime", "Context Engine", "Trust Engine", "AI Flight Recorder"],
    currentCapability:
      "Agent and model metadata exists across the Intelligence Platform, Strategic Execution Layer, TrustOps, and execution-attempt evidence binding.",
    nextSafeAction:
      "Require every synthetic agent response to include context manifest id, policy version, blocked-action list, proof route, and audit hash.",
    agentImpact:
      "Agents become easier to supervise because identity, permissions, context source, and validation evidence travel together.",
    workflowImpact:
      "Workflow handoffs can reject orphaned agent outputs before they enter review queues.",
    infrastructureImpact:
      "No new external services; this is a typed metadata contract enforced by route and contract checks.",
    interfaceImpact:
      "Operator pages can show one status line for context, policy, proof, and human review state.",
    requiredGates: ["synthetic-only input", "policy version present", "audit hash present", "human review for high-risk lanes"],
    proofRoutes: ["/scrimed-intelligence-platform", "/scrimed-trustops", "/workflows/execution-attempts"],
    apiRoutes: ["/api/scrimed-intelligence-platform", "/api/scrimed-trustops", "/api/workflows/execution-attempts/envelope"],
    blockedActions: ["live PHI", "autonomous clinical decision", "EHR writeback", "patient outreach"],
    safeAutomationMode: "synthetic_recommendation_only",
    humanReviewRequired: true,
    noGoBoundary:
      "No agent output becomes clinical authority or external action without qualified human review and future approval.",
    kpis: [
      { metric: "agent_outputs_with_policy_version", target: "100%", measurementMode: "metadata" },
      { metric: "agent_outputs_with_audit_hash", target: "100%", measurementMode: "metadata" },
      { metric: "high_risk_outputs_review_gated", target: "100%", measurementMode: "synthetic" }
    ]
  },
  {
    id: "workflow-orchestration-release-train",
    title: "Create a governed release train for workflows and services",
    domain: "workflow",
    priority: "P0",
    status: "ready-for-synthetic-execution",
    owner: "Workflow Runtime + Service Delivery",
    upgradeTargets: ["Clinical Workflow Orchestrator", "Service Delivery", "Release Continuity", "Boundary Approvals"],
    currentCapability:
      "SCRIMED exposes workflow contracts, release continuity, service delivery, boundary-release approvals, and protected evidence intake.",
    nextSafeAction:
      "Promote workflows through draft, synthetic QA, protected operator run, buyer proof, and external approval stages with explicit demotion triggers.",
    agentImpact:
      "Agents receive a deterministic stage boundary before recommending next workflow steps.",
    workflowImpact:
      "Workflow progress is no longer an informal checklist; every service lane has gates, rollback criteria, and proof routes.",
    infrastructureImpact:
      "Release state remains metadata-only until protected durable-store evidence is approved.",
    interfaceImpact:
      "Dashboards can show stage, owner, next gate, and blocked action per workflow.",
    requiredGates: ["synthetic QA pass", "no-secret output", "AAL2 for protected operator runs", "boundary release approval before expansion"],
    proofRoutes: ["/service-delivery", "/release-continuity", "/boundary-release-approvals", "/qa-evidence"],
    apiRoutes: [
      "/api/service-delivery",
      "/api/release-continuity",
      "/api/boundary-release-approvals",
      "/api/qa-evidence"
    ],
    blockedActions: ["payer submission", "billing submission", "EHR writeback", "customer go-live approval"],
    safeAutomationMode: "human_review_queue_only",
    humanReviewRequired: true,
    noGoBoundary:
      "Workflow orchestration may queue and recommend; it cannot submit, outreach, mutate records, or activate customers.",
    kpis: [
      { metric: "workflow_lanes_with_stage", target: "100%", measurementMode: "metadata" },
      { metric: "release_demotions_triggered_on_missing_evidence", target: "100%", measurementMode: "synthetic" },
      { metric: "protected_actions_without_aal2", target: "0", measurementMode: "metadata" }
    ]
  },
  {
    id: "infrastructure-reliability-control-loop",
    title: "Harden infrastructure readiness with cleanup, integrity, and smoke gates",
    domain: "infrastructure",
    priority: "P0",
    status: "in-progress",
    owner: "Platform Reliability",
    upgradeTargets: ["CI", "Generated Integrity", "Build Pipeline", "Smoke Tests"],
    currentCapability:
      "The repo now cleans disposable generated artifacts, blocks duplicate generated roots, and runs the nonsecret contract suite in CI.",
    nextSafeAction:
      "Add release-candidate health evidence to the operating console and require generated-integrity pass before build/typecheck.",
    agentImpact:
      "Agent-generated code is checked against deterministic quality gates before it can be treated as reviewable.",
    workflowImpact:
      "Build and smoke failures become workflow blockers rather than manual afterthoughts.",
    infrastructureImpact:
      "CI runs generated integrity, nonsecret contracts, lint, typecheck, and build without needing secrets.",
    interfaceImpact:
      "Operators can see infrastructure gate status as part of product readiness rather than a separate terminal-only concern.",
    requiredGates: ["generated integrity pass", "nonsecret contracts pass", "lint pass", "typecheck pass", "build pass"],
    proofRoutes: ["/production-architecture", "/release-candidate-readiness", "/navigation"],
    apiRoutes: ["/api/production-architecture", "/api/release-candidate-readiness", "/api/navigation-audit"],
    blockedActions: ["deploy without gates", "secret-dependent CI path", "unreviewed generated artifacts"],
    safeAutomationMode: "read_only_metadata",
    humanReviewRequired: false,
    noGoBoundary:
      "Passing local gates does not authorize production deploy, customer go-live, security certification, or PHI processing.",
    kpis: [
      { metric: "nonsecret_contracts_in_ci", target: "enabled", measurementMode: "metadata" },
      { metric: "generated_artifact_drift", target: "0 duplicate roots", measurementMode: "metadata" },
      { metric: "release_candidate_build_gate", target: "pass before deploy consideration", measurementMode: "metadata" }
    ]
  },
  {
    id: "product-interface-command-surface",
    title: "Make product and UI readiness navigable from one command surface",
    domain: "ui-interface",
    priority: "P1",
    status: "ready-for-synthetic-execution",
    owner: "Product Engineering + UX",
    upgradeTargets: ["Product Console", "Hub", "Navigation", "Operating Command UI"],
    currentCapability:
      "SCRIMED has many strong routes, but operators need a shorter path from strategy to the next safe action.",
    nextSafeAction:
      "Expose a single command surface that ranks active lanes, shows proof links, and clarifies the retained boundary per lane.",
    agentImpact:
      "Agents can refer users to the correct operating surface rather than scattering route suggestions.",
    workflowImpact:
      "Operators move from product, service, trust, and infrastructure lanes without losing the approval context.",
    infrastructureImpact:
      "No client-side state or external API required; the page renders from typed local metadata.",
    interfaceImpact:
      "The UI becomes more executive-operable: status cards, lane rows, proof links, cadence, and boundary copy.",
    requiredGates: ["accessible links", "boundary text visible", "API and brief available", "navigation inventory updated"],
    proofRoutes: ["/product", "/hub", "/navigation", "/scrimed-operating-command"],
    apiRoutes: ["/api/product/console", "/api/hub/summary", "/api/navigation-audit", "/api/scrimed-operating-command"],
    blockedActions: ["hidden authority expansion", "claims without evidence", "route sprawl without navigation"],
    safeAutomationMode: "read_only_metadata",
    humanReviewRequired: false,
    noGoBoundary:
      "A better interface is not customer permission, production readiness approval, or regulatory approval.",
    kpis: [
      { metric: "command_lanes_with_proof_links", target: "100%", measurementMode: "metadata" },
      { metric: "operator_next_action_visible", target: "100%", measurementMode: "metadata" },
      { metric: "boundary_copy_visible", target: "100%", measurementMode: "metadata" }
    ]
  },
  {
    id: "service-product-packaging-loop",
    title: "Tie products, services, demos, pilots, and pricing to delivery proof",
    domain: "service-delivery",
    priority: "P1",
    status: "ready-for-synthetic-execution",
    owner: "Revenue Operations + Delivery",
    upgradeTargets: ["Offerings", "Pricing", "Demos", "Pilots", "Service Delivery"],
    currentCapability:
      "SCRIMED has packaged offerings, demo/pilot readiness, pricing ranges, and service-delivery scope controls.",
    nextSafeAction:
      "For every buyer-facing product, require one demo path, one pilot path, one proof packet, one delivery artifact, and one no-go statement.",
    agentImpact:
      "Sales and support agents can recommend package paths without inventing claims or custom scope.",
    workflowImpact:
      "Demo-to-pilot conversion can be measured by package, proof packet, and accepted scope rather than raw interest.",
    infrastructureImpact:
      "No payment, CRM, email, or calendar mutation is enabled; the loop stays document and metadata based.",
    interfaceImpact:
      "Buyer pages can state the next commercial step and proof needed without overclaiming readiness.",
    requiredGates: ["deal desk review", "scope boundary", "proof packet exists", "no PHI in intake"],
    proofRoutes: ["/offerings", "/pricing", "/demos", "/pilots", "/service-delivery"],
    apiRoutes: ["/api/offerings", "/api/commercial/pricing", "/api/demos", "/api/pilots", "/api/service-delivery"],
    blockedActions: ["signed contract creation", "calendar invite automation", "autonomous email send", "revenue guarantee"],
    safeAutomationMode: "synthetic_recommendation_only",
    humanReviewRequired: true,
    noGoBoundary:
      "Commercial packaging cannot imply signed customer authority, ROI guarantee, legal approval, or production activation.",
    kpis: [
      { metric: "products_with_demo_pilot_proof_path", target: "100%", measurementMode: "metadata" },
      { metric: "intakes_with_no_phi_assertion", target: "100%", measurementMode: "metadata" },
      { metric: "margin_floor_exceptions_without_review", target: "0", measurementMode: "metadata" }
    ]
  },
  {
    id: "interoperability-safety-adapter-lane",
    title: "Advance interoperability through validation adapters, not raw connector access",
    domain: "interoperability",
    priority: "P1",
    status: "blocked-by-approval",
    owner: "Interoperability + Security",
    upgradeTargets: ["FHIR", "HL7", "DICOM", "X12", "Clinical Data Fabric", "Health Records"],
    currentCapability:
      "SCRIMED has synthetic clinical data fabric, health-record exchange boundaries, and standards-oriented readiness routes.",
    nextSafeAction:
      "Route all connector work through schema validation, de-identification, provenance, and approval artifacts before any production integration.",
    agentImpact:
      "Agents reason over canonical concepts and validation results, not raw connector payloads.",
    workflowImpact:
      "Connector evaluation becomes a staged artifact workflow with fail-closed evidence requirements.",
    infrastructureImpact:
      "Production connector credentials remain out of scope; adapters are validation and metadata shells until approval.",
    interfaceImpact:
      "Interoperability pages show supported standards, mapped status, blocked status, and required approvals.",
    requiredGates: ["connector approval", "security review", "BAA/customer authority if PHI", "data residency review"],
    proofRoutes: ["/clinical-data-fabric", "/health-records", "/interoperability", "/clinical-data-governance"],
    apiRoutes: ["/api/clinical-data-fabric", "/api/health-records", "/api/interoperability/standards", "/api/clinical-data-governance"],
    blockedActions: ["raw connector payload logging", "live PHI ingestion", "production connector activation", "EHR writeback"],
    safeAutomationMode: "protected_operator_run_required",
    humanReviewRequired: true,
    noGoBoundary:
      "Synthetic adapter readiness does not authorize live FHIR, HL7, DICOM, X12, EHR, payer, or device connections.",
    kpis: [
      { metric: "adapter_specs_with_schema_validation", target: "100%", measurementMode: "metadata" },
      { metric: "raw_payloads_logged", target: "0", measurementMode: "metadata" },
      { metric: "production_connectors_without_approval", target: "0", measurementMode: "protected-after-approval" }
    ]
  },
  {
    id: "mlops-evaluation-feedback-loop",
    title: "Turn model usage, evaluation, and feedback into governed MLOps",
    domain: "mlops",
    priority: "P1",
    status: "ready-for-synthetic-execution",
    owner: "MLOps + Clinical QA",
    upgradeTargets: ["Model Router", "Evaluation Pipeline", "Clinical Robustness Lab", "Observability"],
    currentCapability:
      "SCRIMED has model routing metadata, clinical robustness lab contracts, MedLog-style usage fields, and benchmark scaffolds.",
    nextSafeAction:
      "Require every model route to emit cost class, latency class, confidence, correctness caveat, fallback, and reviewer outcome placeholder.",
    agentImpact:
      "Agents can select models by task and risk while preserving external validation requirements.",
    workflowImpact:
      "Model upgrades cannot silently promote to clinical authority or bypass review queues.",
    infrastructureImpact:
      "No real provider calls are enabled by this lane; provider calls remain disabled unless explicitly configured elsewhere.",
    interfaceImpact:
      "Dashboards can show model readiness by task, risk, cost, latency, and rollback posture.",
    requiredGates: ["synthetic eval pass", "provider call kill switch honored", "reviewer outcome field", "rollback available"],
    proofRoutes: ["/scrimed-intelligence-platform", "/scrimed-build-roadmap", "/clinical-robustness-lab", "/observability"],
    apiRoutes: [
      "/api/scrimed-intelligence-platform",
      "/api/scrimed-build-roadmap/strategic-execution",
      "/api/clinical-robustness-lab",
      "/api/observability"
    ],
    blockedActions: ["silent model promotion", "external model call with PHI", "clinical authority", "benchmark-only readiness claim"],
    safeAutomationMode: "read_only_metadata",
    humanReviewRequired: true,
    noGoBoundary:
      "MLOps evidence can support review but cannot replace clinical validation, security review, or customer approval.",
    kpis: [
      { metric: "model_routes_with_fallback", target: "100%", measurementMode: "metadata" },
      { metric: "model_outputs_with_confidence_and_uncertainty", target: "100%", measurementMode: "synthetic" },
      { metric: "high_risk_model_routes_without_human_review", target: "0", measurementMode: "metadata" }
    ]
  },
  {
    id: "governance-revenue-approval-stack",
    title: "Protect revenue expansion with claims, approvals, and risk controls",
    domain: "governance",
    priority: "P0",
    status: "ready-for-synthetic-execution",
    owner: "Executive Operating Council + Legal/Security Advisors",
    upgradeTargets: ["Risk Register", "Approvals", "Investor Readiness", "Boundary Release", "Enterprise Business Ops"],
    currentCapability:
      "SCRIMED exposes risk, investor readiness, boundary release, global certification readiness, enterprise business operations, and no-go boundaries.",
    nextSafeAction:
      "Before a revenue claim expands, require owner, evidence route, risk category, allowed wording, blocked wording, and approval state.",
    agentImpact:
      "Pitch, support, and investor agents can use claims-safe language tied to evidence instead of improvising.",
    workflowImpact:
      "Revenue and approval work share a single release path, reducing scope drift and unsafe claims.",
    infrastructureImpact:
      "No legal, accounting, clinical, or security certification is asserted by the system.",
    interfaceImpact:
      "Buyer and investor surfaces can show readiness with preserved no-go boundaries.",
    requiredGates: ["claims review", "risk owner", "evidence link", "external qualified review before certification language"],
    proofRoutes: ["/risk-register", "/approvals-readiness", "/investor-readiness", "/enterprise-business-ops"],
    apiRoutes: ["/api/risk-register", "/api/approvals-readiness", "/api/investor-readiness/status", "/api/enterprise-business-ops"],
    blockedActions: ["certification claim", "clinical validation claim", "investment advice", "audited financial claim"],
    safeAutomationMode: "human_review_queue_only",
    humanReviewRequired: true,
    noGoBoundary:
      "Governance can prepare diligence and claims controls; it cannot create legal approval, audited finance, or certification status.",
    kpis: [
      { metric: "expanded_claims_with_evidence_route", target: "100%", measurementMode: "metadata" },
      { metric: "blocked_claims_released", target: "0", measurementMode: "metadata" },
      { metric: "risk_register_categories_with_owner", target: "100%", measurementMode: "metadata" }
    ]
  }
];

export const scrimedOperatingCadence: ScrimedOperatingCadence[] = [
  {
    cadence: "daily",
    owner: "Platform Reliability",
    reviewQuestion: "Did any generated artifact, smoke, typecheck, lint, or build gate regress?",
    requiredEvidence: ["generated integrity", "nonsecret contract suite", "lint", "typecheck"],
    failClosedTrigger: "Any gate fails or emits secret/token-like output."
  },
  {
    cadence: "weekly",
    owner: "Product + Revenue Operations",
    reviewQuestion: "Which product/service lane has the highest safe revenue impact this week?",
    requiredEvidence: ["offer proof route", "demo path", "pilot path", "no-PHI intake", "margin guardrail"],
    failClosedTrigger: "Missing proof packet, unclear boundary, or unsupported buyer claim."
  },
  {
    cadence: "release-candidate",
    owner: "Release Steward + TrustOS",
    reviewQuestion: "Can this capability move from synthetic readiness to protected operator evidence review?",
    requiredEvidence: ["release candidate readiness", "boundary approval matrix", "protected smoke plan", "rollback criteria"],
    failClosedTrigger: "AAL2 missing, durable evidence incomplete, or preserved boundary requested without approval."
  },
  {
    cadence: "quarterly",
    owner: "Executive Operating Council",
    reviewQuestion: "Which approvals, certifications, security controls, clinical reviews, and partnerships unblock the next market stage?",
    requiredEvidence: ["risk register", "global certification readiness", "clinical production readiness", "investor readiness"],
    failClosedTrigger: "Any claim depends on unverified certification, clinical validation, production connector approval, or customer authority."
  }
];

function auditHash(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function evidenceStageForLane(lane: ScrimedOperatingLane): ScrimedOperatingEvidenceStage {
  if (lane.status === "blocked-by-approval") {
    return "external-approval-required";
  }

  if (lane.safeAutomationMode === "protected_operator_run_required") {
    return "protected-operator-required";
  }

  if (lane.humanReviewRequired) {
    return "synthetic-qa-required";
  }

  if (lane.status === "ready-for-synthetic-execution") {
    return "synthetic-ready";
  }

  return "blocked-before-production";
}

function missingEvidenceForLane(lane: ScrimedOperatingLane, releaseStage: ScrimedOperatingEvidenceStage) {
  const missing = [];

  if (lane.humanReviewRequired) {
    missing.push("human-review-disposition");
  }

  if (
    releaseStage === "protected-operator-required" ||
    lane.safeAutomationMode === "protected_operator_run_required" ||
    lane.requiredGates.some((gate) => gate.toLowerCase().includes("aal2"))
  ) {
    missing.push("fresh-aal2-operator-run");
  }

  if (releaseStage === "external-approval-required") {
    missing.push("external-approval-artifact");
  }

  if (lane.status === "in-progress") {
    missing.push("current-gate-pass-evidence");
  }

  return missing;
}

export function buildScrimedOperatingEvidencePackets(): ScrimedOperatingEvidencePacket[] {
  return scrimedOperatingCommandLanes.map((lane) => {
    const releaseStage = evidenceStageForLane(lane);
    const missingEvidence = missingEvidenceForLane(lane, releaseStage);
    const aal2Required =
      releaseStage === "protected-operator-required" ||
      lane.requiredGates.some((gate) => gate.toLowerCase().includes("aal2"));
    const boundaryReleaseRequired =
      releaseStage === "external-approval-required" ||
      lane.requiredGates.some((gate) => gate.toLowerCase().includes("boundary"));
    const protectedOperatorRequired =
      releaseStage === "protected-operator-required" ||
      lane.safeAutomationMode === "protected_operator_run_required";
    const evidenceState =
      releaseStage === "external-approval-required"
        ? "approval-blocked"
        : missingEvidence.length > 0
          ? "missing-required-evidence"
          : "complete-for-synthetic";
    const packetId = `scrimed-operating-evidence-${lane.id}`;
    const packetHash = auditHash(
      `${packetId}:${lane.status}:${releaseStage}:${missingEvidence.join("|")}:${lane.noGoBoundary}`
    );

    return {
      packetId,
      laneId: lane.id,
      releaseStage,
      evidenceState,
      requiredEvidence: [
        ...lane.requiredGates,
        "proof routes reachable",
        "blocked actions visible",
        "safe automation mode visible"
      ],
      missingEvidence,
      aal2Required,
      boundaryReleaseRequired,
      protectedOperatorRequired,
      safeOutput:
        "Read-only operating evidence packet for planning, review, and proof routing. No production mutation or external action.",
      blockedEscalations: lane.blockedActions,
      nextReviewAction:
        missingEvidence.length > 0
          ? `Collect ${missingEvidence[0]} before this lane can advance.`
          : "Keep lane in synthetic execution and monitor the next scheduled cadence review.",
      packetHash
    };
  });
}

export function validateScrimedOperatingCommandCenter() {
  const domains = new Set(scrimedOperatingCommandLanes.map((lane) => lane.domain));
  const p0Lanes = scrimedOperatingCommandLanes.filter((lane) => lane.priority === "P0");
  const evidencePackets = buildScrimedOperatingEvidencePackets();
  const checks: ScrimedOperatingValidationCheck[] = [
    {
      check: "covers-core-operating-domains",
      passed: ["agent-runtime", "infrastructure", "workflow", "product", "service-delivery", "ui-interface"].every((domain) =>
        domains.has(domain as ScrimedOperatingDomain)
      ),
      detail:
        "The command center must cover agents, infrastructure, workflows, products, services, and interface improvements."
    },
    {
      check: "p0-lanes-have-human-or-gate-control",
      passed: p0Lanes.every((lane) => lane.requiredGates.length >= 3 && lane.blockedActions.length >= 3),
      detail: "Highest-priority lanes must have explicit gates and blocked actions."
    },
    {
      check: "no-autonomous-production-execution",
      passed: scrimedOperatingCommandLanes.every(
        (lane) =>
          lane.safeAutomationMode !== "protected_operator_run_required" ||
          lane.humanReviewRequired
      ),
      detail: "Protected lanes require human review and operator authority; no lane executes production actions autonomously."
    },
    {
      check: "proof-and-api-routes-present",
      passed: scrimedOperatingCommandLanes.every((lane) => lane.proofRoutes.length > 0 && lane.apiRoutes.length > 0),
      detail: "Every lane must point to proof routes and APIs so operators can inspect evidence."
    },
    {
      check: "kpis-are-measurable",
      passed: scrimedOperatingCommandLanes.every((lane) => lane.kpis.length >= 3),
      detail: "Every lane needs measurable outcomes instead of broad strategy text."
    },
    {
      check: "preserved-boundaries-explicit",
      passed:
        scrimedOperatingCommandCenterBoundary.includes("live PHI") &&
        scrimedOperatingCommandCenterBoundary.includes("autonomous diagnosis") &&
        scrimedOperatingCommandCenterBoundary.includes("customer go-live"),
      detail: "The command center must preserve SCRIMED no-go boundaries."
    },
    {
      check: "evidence-packets-cover-every-lane",
      passed:
        evidencePackets.length === scrimedOperatingCommandLanes.length &&
        evidencePackets.every((packet) =>
          scrimedOperatingCommandLanes.some((lane) => lane.id === packet.laneId)
        ),
      detail: "Every operating lane must have a deterministic evidence packet."
    },
    {
      check: "protected-packets-require-aal2",
      passed: evidencePackets
        .filter((packet) => packet.protectedOperatorRequired)
        .every(
          (packet) =>
            packet.aal2Required &&
            packet.missingEvidence.includes("fresh-aal2-operator-run") &&
            packet.evidenceState !== "complete-for-synthetic"
        ),
      detail: "Protected operator packets must require fresh AAL2 evidence and stay out of public execution."
    },
    {
      check: "evidence-packets-do-not-authorize-production",
      passed: evidencePackets.every(
        (packet) =>
          packet.safeOutput.includes("No production mutation") &&
          packet.blockedEscalations.length > 0
      ),
      detail: "Evidence packets can plan and route review only; they cannot authorize production actions."
    },
    {
      check: "evidence-packets-have-deterministic-hashes",
      passed: evidencePackets.every((packet) => /^[a-f0-9]{16}$/.test(packet.packetHash)),
      detail: "Every evidence packet must carry a deterministic short audit hash."
    }
  ];

  return {
    status: checks.every((check) => check.passed) ? "pass" : "fail",
    checks
  };
}

export function getScrimedOperatingCommandCenterSummary() {
  const validation = validateScrimedOperatingCommandCenter();
  const runtimeStatus = getScrimedNodeRuntimeStatus();
  const evidencePackets = buildScrimedOperatingEvidencePackets();
  const domainCounts = scrimedOperatingCommandLanes.reduce<Record<ScrimedOperatingDomain, number>>(
    (counts, lane) => {
      counts[lane.domain] = (counts[lane.domain] ?? 0) + 1;
      return counts;
    },
    {
      "agent-runtime": 0,
      infrastructure: 0,
      workflow: 0,
      product: 0,
      "service-delivery": 0,
      "ui-interface": 0,
      governance: 0,
      "revenue-ops": 0,
      interoperability: 0,
      mlops: 0
    }
  );
  const highControlLanes = scrimedOperatingCommandLanes.filter((lane) => lane.humanReviewRequired);

  return {
    service: "scrimed-operating-command-center",
    status: scrimedOperatingCommandCenterStatus,
    apiRoute: scrimedOperatingCommandCenterApiRoute,
    briefRoute: scrimedOperatingCommandCenterBriefRoute,
    boundary: scrimedOperatingCommandCenterBoundary,
    runtimeStatus,
    laneCount: scrimedOperatingCommandLanes.length,
    p0LaneCount: scrimedOperatingCommandLanes.filter((lane) => lane.priority === "P0").length,
    highControlLaneCount: highControlLanes.length,
    evidencePacketCount: evidencePackets.length,
    evidencePackets,
    protectedOperatorEvidencePacketCount: evidencePackets.filter(
      (packet) => packet.protectedOperatorRequired
    ).length,
    boundaryReleaseEvidencePacketCount: evidencePackets.filter(
      (packet) => packet.boundaryReleaseRequired
    ).length,
    syntheticCompleteEvidencePacketCount: evidencePackets.filter(
      (packet) => packet.evidenceState === "complete-for-synthetic"
    ).length,
    domainCounts,
    lanes: scrimedOperatingCommandLanes.map((lane) => ({
      ...lane,
      auditHash: auditHash(`${lane.id}:${lane.status}:${lane.owner}:${lane.noGoBoundary}`)
    })),
    cadence: scrimedOperatingCadence,
    validation,
    recommendedNextBuildStep:
      "Use the evidence packets to drive weekly operating review, then add protected operator persistence only after a fresh AAL2 run and boundary-release approval are available."
  };
}

export function buildScrimedOperatingCommandCenterBrief() {
  const summary = getScrimedOperatingCommandCenterSummary();

  return [
    "# SCRIMED Operating Command Center",
    "",
    `Status: ${summary.status}`,
    `API: ${summary.apiRoute}`,
    `Runtime: Node ${summary.runtimeStatus.actualNodeMajor ?? "unknown"} (${summary.runtimeStatus.compatibilityStatus})`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Operating Lanes",
    ...summary.lanes.map(
      (lane) =>
        `- ${lane.priority} ${lane.id}: ${lane.nextSafeAction} Owner: ${lane.owner}. Mode: ${lane.safeAutomationMode}. Boundary: ${lane.noGoBoundary}`
    ),
    "",
    "## Cadence",
    ...summary.cadence.map(
      (item) =>
        `- ${item.cadence}: ${item.reviewQuestion} Owner: ${item.owner}. Fail closed: ${item.failClosedTrigger}`
    ),
    "",
    "## Evidence Packets",
    ...summary.evidencePackets.map(
      (packet) =>
        `- ${packet.packetId}: ${packet.releaseStage}; state ${packet.evidenceState}; missing ${packet.missingEvidence.join(", ") || "none"}; hash ${packet.packetHash}`
    ),
    "",
    "## Validation",
    ...summary.validation.checks.map(
      (check) => `- ${check.passed ? "PASS" : "FAIL"} ${check.check}: ${check.detail}`
    ),
    "",
    "## Next Build Step",
    summary.recommendedNextBuildStep,
    ""
  ].join("\n");
}
