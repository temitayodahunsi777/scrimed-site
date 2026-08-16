#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";

import { getP33IntegratedSummary } from "../app/lib/scrimed-p33/index.ts";

const check = process.argv.includes("--check");
const summary = getP33IntegratedSummary();
const gateMatrixPath = "artifacts/p33/P33_GATE_MATRIX.json";
const validationReportPath = "artifacts/p33/P33_VALIDATION_REPORT.json";

const gateMatrix = {
  schemaVersion: "scrimed-p33-gate-matrix-v2",
  candidateBinding: "generated-before-final-candidate-fingerprint-use-release-tooling-for-exact-binding",
  statusesAllowed: ["PASS", "OPERATOR_REQUIRED", "BLOCKED", "FAIL"],
  counts: summary.gateCounts,
  gates: summary.gateMatrix,
  strategicGates: summary.continuousAssurance.strategicGates,
  productionReadiness: false,
  externalDistributionAuthorized: false,
  summaryHash: summary.summaryHash
};

const validationChecks = [
  {
    id: "context-artifact-integrity",
    passed: /^[0-9a-f]{64}$/.test(summary.contextFabric.artifact.integrityHash),
    evidence: summary.contextFabric.artifact.integrityHash
  },
  {
    id: "source-span-coverage",
    passed: summary.contextFabric.artifact.facts.every((fact) => fact.sourceSpanIds.length > 0),
    evidence: `${summary.contextFabric.artifact.facts.length} span-grounded facts`
  },
  {
    id: "clinical-release-fails-closed",
    passed: summary.contextFabric.releaseGate.decision !== "ALLOW" && summary.contextFabric.releaseGate.clinicalRecordAuthority === false,
    evidence: summary.contextFabric.releaseGate.integrityHash
  },
  {
    id: "decision-ledger-chain",
    passed: summary.decisionEvidence.verification.valid,
    evidence: summary.decisionEvidence.verification.chainHash
  },
  {
    id: "oversight-sentinel",
    passed: summary.regulatoryOversight.oversightResult.automaticOversightReductionAllowed === false,
    evidence: summary.regulatoryOversight.oversightResult.integrityHash
  },
  {
    id: "portable-route-no-provider-call",
    passed: summary.portableAgents.routeDecision.providerCallExecuted === false,
    evidence: summary.portableAgents.routeDecision.resultHash
  },
  {
    id: "local-worker-admission",
    passed: summary.portableAgents.localWorkerAdmission.decision === "ALLOW" && summary.portableAgents.localWorkerAdmission.networkDefault === "deny",
    evidence: summary.portableAgents.localWorkerAdmission.admissionHash
  },
  {
    id: "trajectory-evaluation-boundary",
    passed: summary.clinicalTrajectory.evaluation.promotionEligible === false,
    evidence: summary.clinicalTrajectory.evaluation.evaluationHash
  },
  {
    id: "opportunity-actions-disabled",
    passed: summary.opportunities.externalActionModuleCount === 0,
    evidence: `${summary.opportunities.modules.length} modules`
  },
  {
    id: "restricted-pilots-blocked",
    passed: summary.pilotProfiles.profiles
      .filter((profile) => profile.profileId !== "NON_PHI_CONTROLLED_PILOT")
      .every((profile) => profile.status === "BLOCKED" && profile.bypassAllowed === false),
    evidence: summary.pilotProfiles.profiles.map((profile) => profile.integrityHash).join(",")
  },
  {
    id: "continuous-assurance-ledger-chain",
    passed: summary.continuousAssurance.decisionEvidence.verification.valid,
    evidence: summary.continuousAssurance.decisionEvidence.verification.chainDigest
  },
  {
    id: "strategic-gate-coverage",
    passed: ["G21", "G22", "G23", "G24", "G25"].every((gateId) =>
      summary.continuousAssurance.strategicGates.some((gate) => gate.gateId === gateId)
    ),
    evidence: summary.continuousAssurance.strategicGates.map((gate) => gate.evidenceDigest).join(",")
  },
  {
    id: "candidate-binding-fails-closed",
    passed: summary.continuousAssurance.strategicGates.find((gate) => gate.gateId === "G24")?.status === "BLOCKED",
    evidence: summary.continuousAssurance.candidateBinding.localReferenceHash
  },
  {
    id: "quality-ratchet-no-auto-promotion",
    passed: summary.continuousAssurance.qualityRatchet.automaticPromotionAllowed === false,
    evidence: summary.continuousAssurance.qualityRatchet.decisionHash
  },
  {
    id: "readiness-profiles-retain-authority",
    passed: summary.continuousAssurance.readinessProfiles.every((profile) =>
      profile.livePhiAllowed === false &&
      profile.clinicalActionAllowed === false &&
      profile.deploymentAuthorized === false &&
      profile.customerActivationAuthorized === false
    ),
    evidence: summary.continuousAssurance.readinessProfiles.map((profile) => profile.decisionHash).join(",")
  },
  {
    id: "provider-resilience-drill",
    passed: summary.continuousAssurance.resilienceDrill.status === "PASS" &&
      summary.continuousAssurance.resilienceDrill.primaryReentryAuthorized === false,
    evidence: summary.continuousAssurance.resilienceDrill.drillHash
  },
  {
    id: "shadow-pilot-retains-owner-gate",
    passed: summary.continuousAssurance.shadowRehearsal.technicalStatus === "PASS" &&
      summary.continuousAssurance.shadowRehearsal.status === "OPERATOR_REQUIRED" &&
      summary.continuousAssurance.shadowRehearsal.externalActionsExecuted === false,
    evidence: summary.continuousAssurance.shadowRehearsal.rehearsalHash
  }
];
const validationReport = {
  schemaVersion: "scrimed-p33-validation-report-v2",
  scope: "deterministic-p33-domain-contracts",
  generatedAt: "2026-08-13T00:00:00.000Z",
  status: validationChecks.every((item) => item.passed) ? "PASS" : "FAIL",
  checkCount: validationChecks.length,
  passedCount: validationChecks.filter((item) => item.passed).length,
  failedCount: validationChecks.filter((item) => !item.passed).length,
  checks: validationChecks,
  fullCandidateValidation: "reported-by-release-candidate-validation-after-final-source-mutation",
  externalApprovalsCreated: false,
  productionAuthorityGranted: false,
  summaryHash: summary.summaryHash
};

const outputs = [
  [gateMatrixPath, `${JSON.stringify(gateMatrix, null, 2)}\n`],
  [validationReportPath, `${JSON.stringify(validationReport, null, 2)}\n`]
];

if (check) {
  for (const [filePath, expected] of outputs) {
    assert.equal(await readFile(filePath, "utf8"), expected, `${filePath} is stale`);
  }
  console.log(`pass SCRIMED p.33 artifact integrity (${outputs.length} artifacts)`);
} else {
  for (const [filePath, content] of outputs) await writeFile(filePath, content, "utf8");
  console.log(`generated SCRIMED p.33 artifacts (${outputs.length})`);
}
