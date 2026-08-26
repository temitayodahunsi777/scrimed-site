#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  evaluateTrustReadiness,
  getTrustReadinessSummary
} from "../app/lib/scrimed-control-plane/trustReadiness.ts";
import {
  ceoDecisionRegister,
  getHumanGateMinimizationReport,
  getInvestorReadinessEngine,
  getStrategicDecisionIntelligenceSummary,
  strategicPartnerReadinessProfiles
} from "../app/lib/scrimed-control-plane/strategicDecisionIntelligence.ts";

const trust = getTrustReadinessSummary();
assert.deepEqual(trust.decisions, { allowSynthetic: 1, requireHuman: 1, blocked: 1 });
assert.equal(trust.productionAuthorityGranted, false);
assert.equal(trust.scenarios.find((entry) => entry.decision === "BLOCK")?.certificationClaimAllowed, false);

const prohibited = evaluateTrustReadiness({
  capabilityId: "clinical-context-lens",
  environment: "production",
  dataClassification: "phi-prohibited",
  providerClass: "frontier",
  toolClass: "clinical",
  jurisdiction: "unapproved",
  evidenceReferences: [],
  approvalReferences: [],
  reviewFresh: false,
  candidateBound: false,
  rollbackAvailable: false,
  externalDistributionRequested: true
});
assert.equal(prohibited.decision, "BLOCK");
assert.ok(prohibited.blockedReasonCodes.includes("PRODUCTION_AUTHORITY_NOT_GRANTED"));
assert.ok(prohibited.blockedReasonCodes.includes("PHI_OR_PROHIBITED_DATA_BLOCKED"));
assert.equal(prohibited.productionAuthorityGranted, false);
assert.equal(prohibited.distributionAuthorityGranted, false);

const gateReport = getHumanGateMinimizationReport();
assert.equal(gateReport.totalGateCount, 13);
assert.equal(gateReport.externalApprovalsAchievedByThisReport, 0);
assert.equal(gateReport.gates.every((gate) => gate.syntheticFixtureCanSatisfy === false), true);
assert.equal(gateReport.counts.humanAccountability, 10);
assert.equal(gateReport.counts.commercialAuthority, 1);
assert.equal(gateReport.counts.operatorAction, 2);

const investor = getInvestorReadinessEngine();
assert.equal(investor.dimensions.length, 15);
assert.equal(investor.investmentProbabilityCalculated, false);
assert.equal(investor.distributionAuthorized, false);
assert.match(investor.auditHash, /^[0-9a-f]{64}$/);

assert.equal(strategicPartnerReadinessProfiles.length, 14);
assert.ok(strategicPartnerReadinessProfiles.every((profile) => profile.externalRelationshipVerified === false));
assert.ok(strategicPartnerReadinessProfiles.every((profile) => profile.outreachAuthorized === false));
assert.ok(strategicPartnerReadinessProfiles.every((profile) => profile.label.includes("no partnership implied")));
assert.ok(ceoDecisionRegister.every((decision) => decision.defaultSafeAction.length > 0));

const summary = getStrategicDecisionIntelligenceSummary();
assert.equal(summary.productionAuthorityGranted, false);
assert.equal(summary.externalDistributionAuthorityGranted, false);
assert.equal(summary.partnershipClaimsAllowed, false);
assert.equal(summary.valuationCalculated, false);

console.log(
  "pass SCRIMED strategic decision policy tests (Trust Readiness, 13 human gates, CEO decisions, 15 investor dimensions, 14 partner profiles, and retained authority boundaries)"
);
