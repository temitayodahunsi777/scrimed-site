import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import { getP33AgentPortabilitySummary } from "./agentPortability";
import { getP33ChangeControlSummary } from "./changeControl";
import { getP33ClinicalTrajectorySummary } from "./clinicalTrajectoryLab";
import { getP33ContinuousAssuranceSummary } from "./continuousAssurance";
import { getP33ContextFabricSummary } from "./contextFabric";
import { getP33DecisionEvidenceSummary } from "./decisionEvidenceLedger";
import { getP33OpportunitySummary } from "./opportunityModules";
import { getP33PilotProfileSummary } from "./pilotProfiles";
import { getP33RegulatoryOversightSummary } from "./regulatoryOversight";
import type { P33GateStatus } from "./types";

export * from "./types";
export * from "./contextFabric";
export * from "./decisionEvidenceLedger";
export * from "./regulatoryOversight";
export * from "./changeControl";
export * from "./agentPortability";
export * from "./clinicalTrajectoryLab";
export * from "./continuousAssurance";
export * from "./opportunityModules";
export * from "./pilotProfiles";

export const p33IntegratedUpgradesVersion =
  "scrimed-p33-integrated-upgrades-v2-2026-08-15";
export const p33IntegratedRoute = "/scrimed-p33";
export const p33IntegratedApiRoute = "/api/scrimed-control-plane/p33";
export const p33IntegratedBriefRoute = "/api/scrimed-control-plane/p33/brief";

export const p33IntegratedBoundary =
  "SCRIMED p.33 integrates synthetic clinical context, signal compression, evidence, regulatory-label, oversight, change-control, portable-agent, trajectory-evaluation, opportunity, and pilot-profile controls. It walks with doctors rather than replacing them and does not authorize live PHI, autonomous diagnosis, treatment, prescribing, triage, coverage, payer submission, claims submission, EHR writeback, production deployment, customer activation, certification claims, or external distribution.";

export function getP33GateMatrix(
  continuousAssurance = getP33ContinuousAssuranceSummary()
): Array<{
  gateId: string;
  status: P33GateStatus;
  ownerRole: string;
  evidence: string[];
  reason: string;
}> {
  return [
    {
      gateId: "p33-local-contracts",
      status: "PASS" as const,
      ownerRole: "principal-engineer",
      evidence: ["p33 module integrity hashes", "policy and contract tests"],
      reason: "Deterministic local contracts emit valid integrity evidence; full candidate validation remains separately reported."
    },
    {
      gateId: "named-technical-review",
      status: "OPERATOR_REQUIRED" as const,
      ownerRole: "independent-technical-reviewer",
      evidence: ["P33_REVIEW_PACKET.md", "exact candidate fingerprint"],
      reason: "A distinct named reviewer must approve the exact candidate."
    },
    {
      gateId: "named-clinical-safety-review",
      status: "OPERATOR_REQUIRED" as const,
      ownerRole: "qualified-clinical-safety-reviewer",
      evidence: ["clinical release-gate tests", "Regulatory Label Twin", "ClinicalTrajectory report"],
      reason: "Clinical-safety authority cannot be self-issued by software."
    },
    {
      gateId: "claims-legal-review",
      status: "OPERATOR_REQUIRED" as const,
      ownerRole: "counsel-and-claims-owner",
      evidence: ["public claims registry", "investor deck source and artifact fingerprint"],
      reason: "Counsel and the claims owner must approve public and investor-facing language."
    },
    {
      gateId: "security-privacy-review",
      status: "OPERATOR_REQUIRED" as const,
      ownerRole: "security-privacy-reviewer",
      evidence: ["secret scan", "RLS contracts", "no-PHI tests", "decision-ledger tests"],
      reason: "Named security/privacy review remains external."
    },
    {
      gateId: "platform-review",
      status: "OPERATOR_REQUIRED" as const,
      ownerRole: "platform-owner",
      evidence: ["provider portability", "local worker admission", "Vercel preview evidence"],
      reason: "Platform owner review is required before activation or promotion."
    },
    {
      gateId: "investor-deck-review",
      status: "OPERATOR_REQUIRED" as const,
      ownerRole: "founder-counsel-finance",
      evidence: ["evidence-bound deck source", "automated deck review", "exact artifact fingerprint"],
      reason: "Founder, counsel, and finance must review the exact artifact before distribution."
    },
    {
      gateId: "disposable-migration-dry-run",
      status: "BLOCKED" as const,
      ownerRole: "database-owner",
      evidence: ["pending migration packet", "disposable PostgreSQL execution"],
      reason: "Static analysis is available, but disposable-database execution and owner approval remain outstanding."
    },
    {
      gateId: "fresh-protected-aal2-evidence",
      status: "OPERATOR_REQUIRED" as const,
      ownerRole: "authorized-aal2-operator",
      evidence: ["fresh candidate-bound AAL2 receipt"],
      reason: "Real operator evidence cannot be minted or simulated by the repository."
    },
    {
      gateId: "supabase-leaked-password-protection",
      status: "BLOCKED" as const,
      ownerRole: "supabase-project-owner",
      evidence: ["non-sensitive setting evidence"],
      reason: "Connected project setting remains an external operator action."
    },
    {
      gateId: "vercel-preview-authorization",
      status: "OPERATOR_REQUIRED" as const,
      ownerRole: "vercel-project-owner",
      evidence: ["exact-SHA preview deployment authorization", "preview smoke evidence"],
      reason: "No Vercel deployment or production mutation is authorized in this candidate."
    },
    {
      gateId: "production-promotion",
      status: "BLOCKED" as const,
      ownerRole: "release-owner",
      evidence: ["deployment authorization", "all prerequisite approvals"],
      reason: "Production promotion remains prohibited."
    },
    {
      gateId: "post-deployment-evidence",
      status: "BLOCKED" as const,
      ownerRole: "release-owner",
      evidence: ["authorized deployment", "post-deployment smoke and rollback evidence"],
      reason: "Cannot exist before an authorized deployment."
    },
    {
      gateId: "customer-activation",
      status: "BLOCKED" as const,
      ownerRole: "customer-and-scrimed-authorities",
      evidence: ["customer-specific intended use", "contracts", "operator training", "acceptance evidence"],
      reason: "Customer activation requires separate authorization."
    },
    {
      gateId: "phi-capable-pilot",
      status: "BLOCKED" as const,
      ownerRole: "privacy-security-clinical-owners",
      evidence: ["BAA", "eligible product path", "AAL2", "RLS", "retention", "incident", "named reviews"],
      reason: "PHI-capable pilot remains fail-closed with no bypass."
    },
    {
      gateId: "linux-local-agent-pilot",
      status: "BLOCKED" as const,
      ownerRole: "platform-security-owner",
      evidence: ["official platform support", "sandbox", "filesystem", "network", "update", "audit controls"],
      reason: "Linux local-agent pilot remains fail-closed with no bypass."
    },
    ...continuousAssurance.strategicGates.map((gate) => ({
      gateId: gate.gateId,
      status: gate.status,
      ownerRole: gate.ownerRole,
      evidence: gate.observedEvidence,
      reason: gate.reasonCodes.length
        ? `${gate.description} ${gate.reasonCodes.join(", ")}.`
        : gate.description
    }))
  ];
}

export function getP33IntegratedSummary() {
  const contextFabric = getP33ContextFabricSummary();
  const decisionEvidence = getP33DecisionEvidenceSummary();
  const regulatoryOversight = getP33RegulatoryOversightSummary();
  const changeControl = getP33ChangeControlSummary();
  const portableAgents = getP33AgentPortabilitySummary();
  const clinicalTrajectory = getP33ClinicalTrajectorySummary();
  const opportunities = getP33OpportunitySummary();
  const pilotProfiles = getP33PilotProfileSummary();
  const continuousAssurance = getP33ContinuousAssuranceSummary();
  const gateMatrix = getP33GateMatrix(continuousAssurance);
  const summary = {
    service: "scrimed-p33-integrated-upgrades" as const,
    version: p33IntegratedUpgradesVersion,
    status: "local-synthetic-integration-human-review-required",
    route: p33IntegratedRoute,
    apiRoute: p33IntegratedApiRoute,
    briefRoute: p33IntegratedBriefRoute,
    mission: "Walk with doctors, not replace them.",
    optimizationTarget: "cost-per-safe-clinically-accepted-outcome",
    contextFabric,
    decisionEvidence,
    regulatoryOversight,
    changeControl,
    portableAgents,
    clinicalTrajectory,
    opportunities,
    pilotProfiles,
    continuousAssurance,
    gateMatrix,
    gateCounts: {
      PASS: gateMatrix.filter((gate) => gate.status === "PASS").length,
      OPERATOR_REQUIRED: gateMatrix.filter((gate) => gate.status === "OPERATOR_REQUIRED").length,
      BLOCKED: gateMatrix.filter((gate) => gate.status === "BLOCKED").length,
      FAIL: gateMatrix.filter((gate) => gate.status === "FAIL").length
    },
    productionReadiness: false,
    externalDistributionAuthorized: false,
    boundary: p33IntegratedBoundary
  };
  return {
    ...summary,
    summaryHash: createClinicalEvidenceHash({
      type: "p33-integrated-summary",
      version: p33IntegratedUpgradesVersion,
      summary
    })
  };
}

export function buildP33IntegratedBrief() {
  const summary = getP33IntegratedSummary();
  return [
    "# SCRIMED p.33 Integrated Upgrades",
    "",
    `Status: ${summary.status}`,
    `Version: ${summary.version}`,
    `Mission: ${summary.mission}`,
    `Optimization target: ${summary.optimizationTarget}`,
    "",
    "## Delivered Local Controls",
    `- Context artifacts: ${summary.contextFabric.artifact.facts.length} synthetic facts across ${summary.contextFabric.artifact.sourceDocuments.length} sources`,
    `- Signal compression: ${summary.contextFabric.compression.summaryFacts.length} cited facts, ${summary.contextFabric.compression.omittedSectionIds.length} omitted sections declared`,
    `- Decision ledger: ${summary.decisionEvidence.verification.recordCount} append-only records; chain valid ${summary.decisionEvidence.verification.valid}`,
    `- Oversight sentinel: ${summary.regulatoryOversight.oversightResult.decision}`,
    `- Portable route: ${summary.portableAgents.routeDecision.status}; provider call executed ${summary.portableAgents.routeDecision.providerCallExecuted}`,
    `- Trajectory evaluation: ${summary.clinicalTrajectory.evaluation.decision}; promotion eligible ${summary.clinicalTrajectory.evaluation.promotionEligible}`,
    `- Opportunity modules: ${summary.opportunities.modules.length}; external actions enabled ${summary.opportunities.externalActionModuleCount}`,
    `- Continuous assurance: ${summary.continuousAssurance.strategicGateCounts.PASS} PASS, ${summary.continuousAssurance.strategicGateCounts.OPERATOR_REQUIRED} OPERATOR_REQUIRED, ${summary.continuousAssurance.strategicGateCounts.BLOCKED} BLOCKED`,
    `- Quality ratchet: ${summary.continuousAssurance.qualityRatchet.decision}; automatic promotion ${summary.continuousAssurance.qualityRatchet.automaticPromotionAllowed}`,
    "",
    "## Gate Matrix",
    `- PASS: ${summary.gateCounts.PASS}`,
    `- OPERATOR_REQUIRED: ${summary.gateCounts.OPERATOR_REQUIRED}`,
    `- BLOCKED: ${summary.gateCounts.BLOCKED}`,
    `- FAIL: ${summary.gateCounts.FAIL}`,
    "",
    "## Boundary",
    summary.boundary
  ].join("\n");
}
