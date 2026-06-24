#!/usr/bin/env node

import { readdir } from "node:fs/promises";

const baseUrl = (process.env.SCRIMED_BASE_URL ?? "https://app.scrimedsolutions.com").replace(/\/$/, "");
const workspaceSlug = process.env.SCRIMED_WORKSPACE_SLUG ?? "atlas-synthetic-evaluation";

function endpoint(path) {
  return `${baseUrl}${path}`;
}

async function countRouteFiles(root, fileName) {
  const entries = await readdir(root, { recursive: true, withFileTypes: true });

  return entries.filter((entry) => entry.isFile() && entry.name === fileName).length;
}

async function readResponse(response) {
  const text = await response.text();

  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

async function request(path) {
  const response = await fetch(endpoint(path));
  const body = await readResponse(response);
  return { body, response };
}

async function postJson(path, payload) {
  const response = await fetch(endpoint(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const body = await readResponse(response);
  return { body, response };
}

function requireStatus(label, actual, expected) {
  const expectedValues = Array.isArray(expected) ? expected : [expected];

  if (!expectedValues.includes(actual)) {
    throw new Error(`${label} expected ${expectedValues.join(" or ")} but received ${actual}.`);
  }
}

function requireJson(label, body) {
  if (!body.json) {
    throw new Error(`${label} expected JSON response.`);
  }

  return body.json;
}

function requireContentType(label, response, expected) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes(expected)) {
    throw new Error(`${label} expected content-type containing ${expected} but received ${contentType}.`);
  }
}

function requireSyntheticBoundary(label, response) {
  const boundary = response.headers.get("x-scrimed-data-boundary");

  if (boundary !== "synthetic-only") {
    throw new Error(`${label} expected x-scrimed-data-boundary synthetic-only but received ${boundary}.`);
  }
}

function requireNoClinicalCareAuthority(label, response) {
  const authority = response.headers.get("x-scrimed-clinical-care-authority");

  if (authority !== "not-authorized-live-care") {
    throw new Error(`${label} expected x-scrimed-clinical-care-authority not-authorized-live-care but received ${authority}.`);
  }
}

function requireSalesBoundary(label, response) {
  const boundary = response.headers.get("x-scrimed-data-boundary");

  if (boundary !== "business-contact-and-workflow-scope-only") {
    throw new Error(`${label} expected x-scrimed-data-boundary business-contact-and-workflow-scope-only but received ${boundary}.`);
  }
}

function requirePublicMarketBoundary(label, response) {
  const financialAuthority = response.headers.get("x-scrimed-financial-authority");
  const securitiesAuthority = response.headers.get("x-scrimed-securities-authority");

  requireSyntheticBoundary(label, response);

  if (financialAuthority !== "not-audited-financial-report") {
    throw new Error(`${label} expected x-scrimed-financial-authority not-audited-financial-report but received ${financialAuthority}.`);
  }

  if (securitiesAuthority !== "not-securities-offering-material") {
    throw new Error(`${label} expected x-scrimed-securities-authority not-securities-offering-material but received ${securitiesAuthority}.`);
  }
}

function requireGlobalReachBoundary(label, response) {
  const globalAuthority = response.headers.get("x-scrimed-global-authority");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (globalAuthority !== "localization-readiness-not-legal-approval") {
    throw new Error(`${label} expected x-scrimed-global-authority localization-readiness-not-legal-approval but received ${globalAuthority}.`);
  }
}

function requireClinicalAuthorityBoundary(label, response) {
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const regulatoryAuthority = response.headers.get("x-scrimed-regulatory-authority");
  const reimbursementAuthority = response.headers.get("x-scrimed-reimbursement-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (regulatoryAuthority !== "external-approval-required") {
    throw new Error(`${label} expected x-scrimed-regulatory-authority external-approval-required but received ${regulatoryAuthority}.`);
  }

  if (reimbursementAuthority !== "no-reimbursement-guarantee") {
    throw new Error(`${label} expected x-scrimed-reimbursement-authority no-reimbursement-guarantee but received ${reimbursementAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireBoundaryResolutionBoundary(label, response) {
  const boundaryResolution = response.headers.get("x-scrimed-boundary-resolution");
  const legalAuthority = response.headers.get("x-scrimed-legal-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const reimbursementAuthority = response.headers.get("x-scrimed-reimbursement-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (boundaryResolution !== "active-control-register") {
    throw new Error(`${label} expected x-scrimed-boundary-resolution active-control-register but received ${boundaryResolution}.`);
  }

  if (legalAuthority !== "external-approval-required") {
    throw new Error(`${label} expected x-scrimed-legal-authority external-approval-required but received ${legalAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (reimbursementAuthority !== "no-reimbursement-guarantee") {
    throw new Error(`${label} expected x-scrimed-reimbursement-authority no-reimbursement-guarantee but received ${reimbursementAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireApprovalsReadinessBoundary(label, response) {
  const approvalsReadiness = response.headers.get("x-scrimed-approvals-readiness");
  const legalAuthority = response.headers.get("x-scrimed-legal-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const regulatoryAuthority = response.headers.get("x-scrimed-regulatory-authority");
  const reimbursementAuthority = response.headers.get("x-scrimed-reimbursement-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (!["operating-ladder-active", "brief-no-approval-claim"].includes(approvalsReadiness ?? "")) {
    throw new Error(`${label} expected approvals readiness boundary header but received ${approvalsReadiness}.`);
  }

  if (legalAuthority !== "external-approval-required") {
    throw new Error(`${label} expected x-scrimed-legal-authority external-approval-required but received ${legalAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (regulatoryAuthority !== "external-review-required") {
    throw new Error(`${label} expected x-scrimed-regulatory-authority external-review-required but received ${regulatoryAuthority}.`);
  }

  if (reimbursementAuthority !== "no-reimbursement-guarantee") {
    throw new Error(`${label} expected x-scrimed-reimbursement-authority no-reimbursement-guarantee but received ${reimbursementAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireReleaseContinuityBoundary(label, response) {
  const approvalAuthority = response.headers.get("x-scrimed-approval-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const releaseAuthority = response.headers.get("x-scrimed-release-authority");
  const releaseContinuity = response.headers.get("x-scrimed-release-continuity");
  const securityCertification = response.headers.get("x-scrimed-security-certification");
  const tokenHandling = response.headers.get("x-scrimed-token-handling");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (approvalAuthority !== "external-review-required") {
    throw new Error(`${label} expected x-scrimed-approval-authority external-review-required but received ${approvalAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (releaseAuthority !== "not-release-approval") {
    throw new Error(`${label} expected x-scrimed-release-authority not-release-approval but received ${releaseAuthority}.`);
  }

  if (!["live-checkpointed-aal2-boundary", "brief-operator-boundary"].includes(releaseContinuity ?? "")) {
    throw new Error(`${label} expected release continuity boundary header but received ${releaseContinuity}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }

  if (tokenHandling !== "no-token-values-exposed-or-retained") {
    throw new Error(`${label} expected x-scrimed-token-handling no-token-values-exposed-or-retained but received ${tokenHandling}.`);
  }
}

function requireNavigationAuditBoundary(label, response) {
  const approvalAuthority = response.headers.get("x-scrimed-approval-authority");
  const functionAudit = response.headers.get("x-scrimed-function-audit");
  const navigationAudit = response.headers.get("x-scrimed-navigation-audit");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const releaseAuthority = response.headers.get("x-scrimed-release-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (approvalAuthority !== "external-review-required") {
    throw new Error(`${label} expected x-scrimed-approval-authority external-review-required but received ${approvalAuthority}.`);
  }

  if (![
    "typecheck-build-smoke-plus-protected-fail-closed",
    "brief-typecheck-build-smoke-plus-protected-fail-closed"
  ].includes(functionAudit ?? "")) {
    throw new Error(`${label} expected function audit boundary header but received ${functionAudit}.`);
  }

  if (![
    "route-navigation-audit-active",
    "route-navigation-audit-brief-ready"
  ].includes(navigationAudit ?? "")) {
    throw new Error(`${label} expected navigation audit boundary header but received ${navigationAudit}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (releaseAuthority !== "not-release-approval") {
    throw new Error(`${label} expected x-scrimed-release-authority not-release-approval but received ${releaseAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireServiceReliabilityBoundary(label, response) {
  const approvalAuthority = response.headers.get("x-scrimed-approval-authority");
  const financialAuthority = response.headers.get("x-scrimed-financial-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const releaseAuthority = response.headers.get("x-scrimed-release-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");
  const serviceReliability = response.headers.get("x-scrimed-service-reliability");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (approvalAuthority !== "external-review-required") {
    throw new Error(`${label} expected x-scrimed-approval-authority external-review-required but received ${approvalAuthority}.`);
  }

  if (financialAuthority !== "not-audited-financial-report") {
    throw new Error(`${label} expected x-scrimed-financial-authority not-audited-financial-report but received ${financialAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (releaseAuthority !== "not-release-approval") {
    throw new Error(`${label} expected x-scrimed-release-authority not-release-approval but received ${releaseAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }

  if (![
    "service-reliability-hardening-active",
    "service-reliability-brief-ready"
  ].includes(serviceReliability ?? "")) {
    throw new Error(`${label} expected service reliability boundary header but received ${serviceReliability}.`);
  }
}

function requireQaExecutionBoundary(label, response) {
  const aal2Execution = response.headers.get("x-scrimed-aal2-execution");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const qaProof = response.headers.get("x-scrimed-qa-proof");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (aal2Execution !== "human-required-not-code-bypass") {
    throw new Error(`${label} expected x-scrimed-aal2-execution human-required-not-code-bypass but received ${aal2Execution}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (qaProof !== "activation-ready-not-retained-proof") {
    throw new Error(`${label} expected x-scrimed-qa-proof activation-ready-not-retained-proof but received ${qaProof}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireQaRunControlBoundary(label, response) {
  const aal2Execution = response.headers.get("x-scrimed-aal2-execution");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const qaProof = response.headers.get("x-scrimed-qa-proof");
  const runControl = response.headers.get("x-scrimed-run-control");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (aal2Execution !== "human-required-not-code-bypass") {
    throw new Error(`${label} expected x-scrimed-aal2-execution human-required-not-code-bypass but received ${aal2Execution}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (qaProof !== "operator-brief-ready-not-retained-proof") {
    throw new Error(`${label} expected x-scrimed-qa-proof operator-brief-ready-not-retained-proof but received ${qaProof}.`);
  }

  if (runControl !== "no-secret-operator-brief") {
    throw new Error(`${label} expected x-scrimed-run-control no-secret-operator-brief but received ${runControl}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireQaLaunchKitBoundary(label, response) {
  const aal2Execution = response.headers.get("x-scrimed-aal2-execution");
  const launchKit = response.headers.get("x-scrimed-qa-launch-kit");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const qaProof = response.headers.get("x-scrimed-qa-proof");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (aal2Execution !== "human-required-not-code-bypass") {
    throw new Error(`${label} expected x-scrimed-aal2-execution human-required-not-code-bypass but received ${aal2Execution}.`);
  }

  if (launchKit !== "no-secret-human-aal2-handoff") {
    throw new Error(`${label} expected x-scrimed-qa-launch-kit no-secret-human-aal2-handoff but received ${launchKit}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (qaProof !== "operator-handoff-ready-not-retained-proof") {
    throw new Error(`${label} expected x-scrimed-qa-proof operator-handoff-ready-not-retained-proof but received ${qaProof}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireQaHumanRunPacketBoundary(label, response) {
  const aal2Execution = response.headers.get("x-scrimed-aal2-execution");
  const humanRunPacket = response.headers.get("x-scrimed-qa-human-run-packet");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const qaProof = response.headers.get("x-scrimed-qa-proof");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (aal2Execution !== "human-required-not-code-bypass") {
    throw new Error(`${label} expected x-scrimed-aal2-execution human-required-not-code-bypass but received ${aal2Execution}.`);
  }

  if (humanRunPacket !== "dispatch-ready-human-aal2-required") {
    throw new Error(`${label} expected x-scrimed-qa-human-run-packet dispatch-ready-human-aal2-required but received ${humanRunPacket}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (qaProof !== "dispatch-ready-not-retained-proof") {
    throw new Error(`${label} expected x-scrimed-qa-proof dispatch-ready-not-retained-proof but received ${qaProof}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireQaCompletionBridgeBoundary(label, response) {
  const aal2Execution = response.headers.get("x-scrimed-aal2-execution");
  const completionBridge = response.headers.get("x-scrimed-qa-completion-bridge");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const qaProof = response.headers.get("x-scrimed-qa-proof");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (aal2Execution !== "human-required-not-code-bypass") {
    throw new Error(`${label} expected x-scrimed-aal2-execution human-required-not-code-bypass but received ${aal2Execution}.`);
  }

  if (completionBridge !== "no-secret-pre-persistence-validation") {
    throw new Error(`${label} expected x-scrimed-qa-completion-bridge no-secret-pre-persistence-validation but received ${completionBridge}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (qaProof !== "candidate-ready-not-retained-proof") {
    throw new Error(`${label} expected x-scrimed-qa-proof candidate-ready-not-retained-proof but received ${qaProof}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireQaClaimGuardBoundary(label, response) {
  const aal2Execution = response.headers.get("x-scrimed-aal2-execution");
  const claimAuthority = response.headers.get("x-scrimed-claim-authority");
  const claimGuard = response.headers.get("x-scrimed-qa-claim-guard");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const qaProof = response.headers.get("x-scrimed-qa-proof");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (aal2Execution !== "human-required-not-code-bypass") {
    throw new Error(`${label} expected x-scrimed-aal2-execution human-required-not-code-bypass but received ${aal2Execution}.`);
  }

  if (claimAuthority !== "claim-guidance-not-legal-approval") {
    throw new Error(`${label} expected x-scrimed-claim-authority claim-guidance-not-legal-approval but received ${claimAuthority}.`);
  }

  if (claimGuard !== "current-state-no-overclaim") {
    throw new Error(`${label} expected x-scrimed-qa-claim-guard current-state-no-overclaim but received ${claimGuard}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (qaProof !== "claim-guard-ready-not-retained-proof") {
    throw new Error(`${label} expected x-scrimed-qa-proof claim-guard-ready-not-retained-proof but received ${qaProof}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireQaProofPromotionBoundary(label, response) {
  const aal2Execution = response.headers.get("x-scrimed-aal2-execution");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const qaProof = response.headers.get("x-scrimed-qa-proof");
  const proofPromotion = response.headers.get("x-scrimed-qa-proof-promotion");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (aal2Execution !== "human-required-not-code-bypass") {
    throw new Error(`${label} expected x-scrimed-aal2-execution human-required-not-code-bypass but received ${aal2Execution}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (qaProof !== "promotion-gated-retained-packet-required") {
    throw new Error(`${label} expected x-scrimed-qa-proof promotion-gated-retained-packet-required but received ${qaProof}.`);
  }

  if (proofPromotion !== "retained-packet-required") {
    throw new Error(`${label} expected x-scrimed-qa-proof-promotion retained-packet-required but received ${proofPromotion}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireQaActivationSealBoundary(label, response) {
  const aal2Execution = response.headers.get("x-scrimed-aal2-execution");
  const activationSeal = response.headers.get("x-scrimed-qa-activation-seal");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const qaProof = response.headers.get("x-scrimed-qa-proof");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (aal2Execution !== "human-required-not-code-bypass") {
    throw new Error(`${label} expected x-scrimed-aal2-execution human-required-not-code-bypass but received ${aal2Execution}.`);
  }

  if (activationSeal !== "protected-packet-required") {
    throw new Error(`${label} expected x-scrimed-qa-activation-seal protected-packet-required but received ${activationSeal}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (qaProof !== "activation-seal-ready-not-retained-proof") {
    throw new Error(`${label} expected x-scrimed-qa-proof activation-seal-ready-not-retained-proof but received ${qaProof}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireQaBuyerProofReleaseBoundary(label, response) {
  const aal2Execution = response.headers.get("x-scrimed-aal2-execution");
  const buyerProofRelease = response.headers.get("x-scrimed-qa-buyer-proof-release");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const qaProof = response.headers.get("x-scrimed-qa-proof");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (aal2Execution !== "human-required-not-code-bypass") {
    throw new Error(`${label} expected x-scrimed-aal2-execution human-required-not-code-bypass but received ${aal2Execution}.`);
  }

  if (!["protected-release-required", "retained-packet-gated"].includes(buyerProofRelease ?? "")) {
    throw new Error(`${label} expected x-scrimed-qa-buyer-proof-release protected-release-required or retained-packet-gated but received ${buyerProofRelease}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (![
    "buyer-proof-release-gated-retained-packet-required",
    "buyer-proof-release-brief-no-public-release",
    "buyer-proof-release-gated"
  ].includes(qaProof ?? "")) {
    throw new Error(`${label} expected buyer proof release qa-proof boundary but received ${qaProof}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireBuyerReleaseControlRunBoundary(label, response) {
  const buyerShare = response.headers.get("x-scrimed-buyer-share");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const releaseAuthority = response.headers.get("x-scrimed-release-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (buyerShare !== "runbook-ready-protected-aal2-required") {
    throw new Error(`${label} expected x-scrimed-buyer-share runbook-ready-protected-aal2-required but received ${buyerShare}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (releaseAuthority !== "not-release-approval") {
    throw new Error(`${label} expected x-scrimed-release-authority not-release-approval but received ${releaseAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireQaManualExecutionConsoleBoundary(label, response) {
  const aal2Execution = response.headers.get("x-scrimed-aal2-execution");
  const executionConsole = response.headers.get("x-scrimed-qa-execution-console");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const qaProof = response.headers.get("x-scrimed-qa-proof");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (aal2Execution !== "human-required-not-code-bypass") {
    throw new Error(`${label} expected x-scrimed-aal2-execution human-required-not-code-bypass but received ${aal2Execution}.`);
  }

  if (!["public-summary-only", "brief-no-secret-no-auth-claim", "protected-state-verification"].includes(executionConsole ?? "")) {
    throw new Error(`${label} expected manual execution console boundary header but received ${executionConsole}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (!["retained-packet-required", "retained-packet-gated"].includes(qaProof ?? "")) {
    throw new Error(`${label} expected retained-packet manual execution proof boundary but received ${qaProof}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireQaAal2RunEvidenceBoundary(label, response) {
  const aal2Execution = response.headers.get("x-scrimed-aal2-execution");
  const evidence = response.headers.get("x-scrimed-qa-evidence");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const qaProof = response.headers.get("x-scrimed-qa-proof");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (aal2Execution !== "human-required-not-code-bypass") {
    throw new Error(`${label} expected x-scrimed-aal2-execution human-required-not-code-bypass but received ${aal2Execution}.`);
  }

  if (!["aal2-run-evidence-package", "aal2-run-evidence-brief", "aal2-run-evidence-protected-state"].includes(evidence ?? "")) {
    throw new Error(`${label} expected AAL2 run evidence boundary header but received ${evidence}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (!["no-buyer-proof-release-without-retained-packet", "retained-packet-gated"].includes(qaProof ?? "")) {
    throw new Error(`${label} expected retained-packet AAL2 evidence proof boundary but received ${qaProof}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

async function checkHtml(path) {
  const result = await request(path);
  requireStatus(path, result.response.status, 200);
  requireContentType(path, result.response, "text/html");
  console.log(`pass html route ${path}: ${result.response.status}`);
}

async function checkProductConsole() {
  const result = await request("/api/product/console");
  requireStatus("product console", result.response.status, 200);
  requireContentType("product console", result.response, "application/json");
  const body = requireJson("product console", result.body);

  if (body.service !== "scrimed-product-console") {
    throw new Error(`product console expected service scrimed-product-console but received ${body.service}.`);
  }

  if (body.proofStack?.passkeyTenantAuthentication !== "passkey-or-magic-link-plus-aal2") {
    throw new Error("product console missing passkey tenant authentication proof-stack posture.");
  }

  if (
    body.proofStack?.releaseContinuity !==
    "release-continuity-checkpointed-aal2-boundary"
  ) {
    throw new Error("product console missing release continuity proof-stack posture.");
  }

  if (
    body.proofStack?.releaseContinuityBrief !==
    "release-continuity-brief-operator-ready"
  ) {
    throw new Error("product console missing release continuity brief proof-stack posture.");
  }

  if (!body.releaseContinuityGateCount || body.releaseContinuityGateCount < 5) {
    throw new Error("product console expected release continuity gate coverage.");
  }

  if (!body.releaseContinuityPassedCheckCount || body.releaseContinuityPassedCheckCount < 4) {
    throw new Error("product console expected release continuity passed-check coverage.");
  }

  if (!body.releaseContinuityOperatorRequiredGateCount) {
    throw new Error("product console expected release continuity AAL2 operator gate coverage.");
  }

  if (body.proofStack?.navigationAudit !== "route-navigation-audit-active") {
    throw new Error("product console missing navigation audit proof-stack posture.");
  }

  if (body.proofStack?.navigationAuditBrief !== "route-navigation-audit-brief-ready") {
    throw new Error("product console missing navigation audit brief proof-stack posture.");
  }

  if (!body.navigationAuditPageRouteCount || body.navigationAuditPageRouteCount < 102) {
    throw new Error("product console expected navigation audit page route coverage.");
  }

  if (!body.navigationAuditApiRoutePatternCount || body.navigationAuditApiRoutePatternCount < 243) {
    throw new Error("product console expected navigation audit API route coverage.");
  }

  if (!body.navigationAuditGroupCount || body.navigationAuditGroupCount < 8) {
    throw new Error("product console expected navigation group coverage.");
  }

  if (!body.navigationAuditSmokeCoveredHtmlRouteCount || body.navigationAuditSmokeCoveredHtmlRouteCount < 26) {
    throw new Error("product console expected smoke-covered HTML route coverage.");
  }

  if (body.proofStack?.serviceReliability !== "service-reliability-hardening-active") {
    throw new Error("product console missing service reliability proof-stack posture.");
  }

  if (body.proofStack?.serviceReliabilityBrief !== "service-reliability-brief-ready") {
    throw new Error("product console missing service reliability brief proof-stack posture.");
  }

  if (!body.serviceReliabilityControlCount || body.serviceReliabilityControlCount < 10) {
    throw new Error("product console expected service reliability control coverage.");
  }

  if (!body.serviceReliabilityFaultClassCount || body.serviceReliabilityFaultClassCount < 8) {
    throw new Error("product console expected service reliability fault-class coverage.");
  }

  if (!body.serviceReliabilityEfficiencyImprovementCount || body.serviceReliabilityEfficiencyImprovementCount < 6) {
    throw new Error("product console expected service reliability efficiency coverage.");
  }

  if (!body.serviceReliabilityOpenGateCount || body.serviceReliabilityOpenGateCount < 4) {
    throw new Error("product console expected service reliability open-gate coverage.");
  }

  if (
    body.proofStack?.approvalsReadiness !==
    "approvals-readiness-operating-ladder-active"
  ) {
    throw new Error("product console missing approvals readiness proof-stack posture.");
  }

  if (
    body.proofStack?.approvalsReadinessBrief !==
    "approvals-readiness-brief-no-approval-claim"
  ) {
    throw new Error("product console missing approvals readiness brief proof-stack posture.");
  }

  if (!body.approvalsReadinessTrackCount || body.approvalsReadinessTrackCount < 7) {
    throw new Error("product console expected approvals readiness track coverage.");
  }

  if (!body.approvalsReadinessAgentControlCount || body.approvalsReadinessAgentControlCount < 5) {
    throw new Error("product console expected approvals readiness agent-control coverage.");
  }

  if (
    body.proofStack?.clinicalAuthorityReadiness !==
    "clinical-authority-readiness-hard-gates-contained"
  ) {
    throw new Error("product console missing clinical authority readiness proof-stack posture.");
  }

  if (
    body.proofStack?.clinicalAuthorityReadinessBrief !==
    "clinical-authority-readiness-brief-no-authority-claim"
  ) {
    throw new Error("product console missing clinical authority readiness brief proof-stack posture.");
  }

  if (
    body.proofStack?.boundaryResolutionRegister !==
    "cross-system-boundary-resolution-register-no-authority-claim"
  ) {
    throw new Error("product console missing boundary resolution register proof-stack posture.");
  }

  if (
    body.proofStack?.boundaryResolutionBrief !==
    "boundary-resolution-brief-no-approval-claim"
  ) {
    throw new Error("product console missing boundary resolution brief proof-stack posture.");
  }

  if (!body.boundaryResolutionRecordCount || body.boundaryResolutionRecordCount < 25) {
    throw new Error("product console expected boundary resolution record coverage.");
  }

  if (!body.boundaryResolutionExternalGateCount || body.boundaryResolutionExternalGateCount < 10) {
    throw new Error("product console expected external boundary gate coverage.");
  }

  if (body.proofStack?.clinicalCareActivation !== "clinical-care-activation-readiness-gated") {
    throw new Error("product console missing clinical care activation proof-stack posture.");
  }

  if (body.proofStack?.clinicalActivationDossier !== "aal2-clinical-activation-dossier-no-phi") {
    throw new Error("product console missing clinical activation dossier proof-stack posture.");
  }

  if (
    body.proofStack?.clinicalActivationApprovals !==
    "aal2-clinical-activation-approval-workflow-no-phi"
  ) {
    throw new Error("product console missing clinical activation approval workflow proof-stack posture.");
  }

  if (
    body.proofStack?.publicMarketReadiness !==
    "public-market-readiness-capital-efficiency-kpi-stack"
  ) {
    throw new Error("product console missing public market readiness proof-stack posture.");
  }

  if (
    body.proofStack?.publicMarketReadinessBrief !==
    "public-market-readiness-board-brief-no-financial-advice"
  ) {
    throw new Error("product console missing public market readiness brief proof-stack posture.");
  }

  if (
    body.proofStack?.protectedOperatorMetrics !==
    "aal2-protected-operator-metric-capture-no-phi"
  ) {
    throw new Error("product console missing protected operator metrics proof-stack posture.");
  }

  if (
    body.proofStack?.protectedMetricRollups !==
    "aal2-finance-reviewed-metric-rollups-no-phi"
  ) {
    throw new Error("product console missing protected metric rollups proof-stack posture.");
  }

  if (
    body.proofStack?.protectedMetricRollupPackets !==
    "aal2-audited-board-metric-packets-no-phi"
  ) {
    throw new Error("product console missing protected metric rollup packet proof-stack posture.");
  }

  if (
    body.proofStack?.protectedMetricTrends !==
    "aal2-board-trend-review-no-phi"
  ) {
    throw new Error("product console missing protected metric trends proof-stack posture.");
  }

  if (
    body.proofStack?.protectedMetricTrendPackets !==
    "aal2-audited-board-trend-packets-no-phi"
  ) {
    throw new Error("product console missing protected metric trend packet proof-stack posture.");
  }

  if (
    body.proofStack?.protectedBoardScorecards !==
    "aal2-rolling-quarter-board-scorecards-no-phi"
  ) {
    throw new Error("product console missing protected board scorecards proof-stack posture.");
  }

  if (
    body.proofStack?.protectedBoardScorecardPackets !==
    "aal2-audited-board-scorecard-packets-no-phi"
  ) {
    throw new Error("product console missing protected board scorecard packet proof-stack posture.");
  }

  if (
    body.proofStack?.protectedFinanceMethodologyGates !==
    "aal2-finance-methodology-gates-no-phi"
  ) {
    throw new Error("product console missing protected finance methodology gate proof-stack posture.");
  }

  if (
    body.proofStack?.protectedFinanceMethodologyPackets !==
    "aal2-audited-finance-methodology-gate-packets-no-phi"
  ) {
    throw new Error("product console missing protected finance methodology packet proof-stack posture.");
  }

  if (
    body.proofStack?.protectedExternalApprovalEvidence !==
    "aal2-qualified-external-approval-evidence-links-no-phi"
  ) {
    throw new Error("product console missing protected external approval evidence proof-stack posture.");
  }

  if (
    body.proofStack?.protectedExternalApprovalEvidencePackets !==
    "aal2-audited-external-approval-evidence-link-packets-no-phi"
  ) {
    throw new Error("product console missing protected external approval evidence packet proof-stack posture.");
  }

  if (
    body.proofStack?.protectedReleaseDecisions !==
    "aal2-qualified-release-decision-workflow-no-phi"
  ) {
    throw new Error("product console missing protected release decision workflow proof-stack posture.");
  }

  if (
    body.proofStack?.protectedReleaseDecisionPackets !==
    "aal2-audited-release-decision-claim-registry-packets-no-phi"
  ) {
    throw new Error("product console missing protected release decision packet proof-stack posture.");
  }

  if (
    body.proofStack?.protectedNamedReviewerSignoffs !==
    "aal2-named-reviewer-signoff-metadata-no-phi"
  ) {
    throw new Error("product console missing protected named reviewer sign-off proof-stack posture.");
  }

  if (
    body.proofStack?.protectedNamedReviewerSignoffPackets !==
    "aal2-audited-named-reviewer-signoff-packets-no-phi"
  ) {
    throw new Error("product console missing protected named reviewer sign-off packet proof-stack posture.");
  }

  if (
    body.proofStack?.protectedDistributionLockboxes !==
    "aal2-external-distribution-lockbox-disabled-no-phi"
  ) {
    throw new Error("product console missing protected distribution lockbox proof-stack posture.");
  }

  if (
    body.proofStack?.protectedDistributionLockboxPackets !==
    "aal2-audited-distribution-lockbox-packets-no-phi"
  ) {
    throw new Error("product console missing protected distribution lockbox packet proof-stack posture.");
  }

  if (
    body.proofStack?.protectedReleaseAuthorityAttestations !==
    "aal2-external-release-authority-attestations-disabled-no-phi"
  ) {
    throw new Error("product console missing protected release authority attestation proof-stack posture.");
  }

  if (
    body.proofStack?.protectedReleaseAuthorityAttestationPackets !==
    "aal2-audited-release-authority-attestation-packets-no-phi"
  ) {
    throw new Error(
      "product console missing protected release authority attestation packet proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedEvidenceRoomRecipientAttestations !==
    "aal2-evidence-room-recipient-attestations-disabled-no-phi"
  ) {
    throw new Error("product console missing protected evidence-room recipient attestation proof-stack posture.");
  }

  if (
    body.proofStack?.protectedEvidenceRoomRecipientAttestationPackets !==
    "aal2-audited-evidence-room-recipient-attestation-packets-no-phi"
  ) {
    throw new Error(
      "product console missing protected evidence-room recipient attestation packet proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedEvidenceRoomAccessLogReconciliations !==
    "aal2-evidence-room-access-log-reconciliation-disabled-no-phi"
  ) {
    throw new Error(
      "product console missing protected evidence-room access-log reconciliation proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedEvidenceRoomAccessLogReconciliationPackets !==
    "aal2-audited-evidence-room-access-log-reconciliation-packets-no-phi"
  ) {
    throw new Error(
      "product console missing protected evidence-room access-log reconciliation packet proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedEvidenceRoomProviderAdapters !==
    "aal2-evidence-room-provider-adapter-contracts-disabled-no-phi"
  ) {
    throw new Error("product console missing protected evidence-room provider adapter proof-stack posture.");
  }

  if (
    body.proofStack?.protectedEvidenceRoomProviderAdapterPackets !==
    "aal2-audited-evidence-room-provider-adapter-packets-no-phi"
  ) {
    throw new Error(
      "product console missing protected evidence-room provider adapter packet proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedProviderSecurityReviews !==
    "aal2-provider-security-review-workbench-no-phi"
  ) {
    throw new Error("product console missing protected provider security review proof-stack posture.");
  }

  if (
    body.proofStack?.protectedProviderSecurityReviewPackets !==
    "aal2-audited-provider-security-review-packets-no-phi"
  ) {
    throw new Error(
      "product console missing protected provider security review packet proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedProcurementEvidenceRegistry !==
    "aal2-procurement-evidence-registry-no-sensitive-artifacts"
  ) {
    throw new Error("product console missing protected procurement evidence registry proof-stack posture.");
  }

  if (
    body.proofStack?.protectedProcurementEvidenceRegistryPackets !==
    "aal2-audited-procurement-evidence-registry-packets-no-sensitive-artifacts"
  ) {
    throw new Error(
      "product console missing protected procurement evidence registry packet proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedClinicalAuthorityEvidenceRoom !==
    "aal2-clinical-authority-evidence-room-no-phi"
  ) {
    throw new Error("product console missing protected clinical authority evidence room proof-stack posture.");
  }

  if (
    body.proofStack?.protectedClinicalAuthorityEvidenceRoomPackets !==
    "aal2-audited-clinical-authority-evidence-room-packet-no-phi"
  ) {
    throw new Error(
      "product console missing protected clinical authority evidence room packet proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedClinicalAuthorityOwnerMatrix !==
    "aal2-clinical-authority-owner-matrix-no-phi"
  ) {
    throw new Error("product console missing protected clinical authority owner matrix proof-stack posture.");
  }

  if (
    body.proofStack?.protectedClinicalAuthorityOwnerMatrixPackets !==
    "aal2-audited-clinical-authority-owner-matrix-packet-no-phi"
  ) {
    throw new Error(
      "product console missing protected clinical authority owner matrix packet proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedClinicalAuthorityArtifactIntake !==
    "aal2-clinical-authority-artifact-intake-checklist-no-phi"
  ) {
    throw new Error(
      "product console missing protected clinical authority artifact intake proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedClinicalAuthorityArtifactIntakePackets !==
    "aal2-audited-clinical-authority-artifact-intake-checklist-packet-no-phi"
  ) {
    throw new Error(
      "product console missing protected clinical authority artifact intake packet proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedAuthorityArtifactReferences !==
    "aal2-authority-artifact-reference-status-capture-no-artifact-storage"
  ) {
    throw new Error(
      "product console missing protected authority artifact reference proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedAuthorityArtifactReferenceRenewalQueue !==
    "aal2-authority-renewal-queue-no-artifact-storage"
  ) {
    throw new Error(
      "product console missing protected authority artifact renewal queue proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedAuthorityArtifactReferencePackets !==
    "aal2-audited-authority-artifact-reference-status-packet-no-artifact-storage"
  ) {
    throw new Error(
      "product console missing protected authority artifact reference packet proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedAuthorityArtifactReferenceQaHarness !==
    "aal2-authority-reference-qa-harness-token-boundary"
  ) {
    throw new Error(
      "product console missing protected authority artifact reference QA harness proof-stack posture."
    );
  }

  if (
    body.proofStack?.globalPartnerLocalization !==
    "global-partner-localization-layer-ready"
  ) {
    throw new Error("product console missing global partner localization proof-stack posture.");
  }

  if (
    body.proofStack?.globalPartnerLocalizationBrief !==
    "global-partner-localization-brief-ready-no-legal-advice"
  ) {
    throw new Error("product console missing global partner localization brief proof-stack posture.");
  }

  if (body.proofStack?.passkeyManagement !== "self-service-list-rename-register-revoke") {
    throw new Error("product console missing passkey management proof-stack posture.");
  }

  if (body.proofStack?.enterpriseProofPackets !== "tenant-admin-aggregate-write-before-release") {
    throw new Error("product console missing enterprise proof packet proof-stack posture.");
  }

  if (body.proofStack?.tenantSessionVerification !== "browser-aal2-no-secret-protected-route-checks") {
    throw new Error("product console missing tenant-session verification proof-stack posture.");
  }

  if (body.proofStack?.pilotDemoReadinessCommandCenter !== "protected-workspace-demo-readiness-command-center") {
    throw new Error("product console missing pilot demo readiness command-center proof-stack posture.");
  }

  if (body.proofStack?.pilotDemoReadinessPackets !== "aal2-audited-demo-readiness-snapshot-packets") {
    throw new Error("product console missing pilot demo readiness packet proof-stack posture.");
  }

  if (body.proofStack?.buyerPilotRoom !== "aal2-buyer-room-evidence-bundle") {
    throw new Error("product console missing Buyer Pilot Room proof-stack posture.");
  }

  if (body.proofStack?.buyerPilotRoomPackets !== "aal2-audited-buyer-diligence-export") {
    throw new Error("product console missing audited Buyer Diligence Export proof-stack posture.");
  }

  if (body.proofStack?.commandIntelligenceHub !== "aal2-command-intelligence-hub") {
    throw new Error("product console missing Command Intelligence Hub proof-stack posture.");
  }

  if (
    body.proofStack?.commandIntelligenceSnapshots !==
    "aal2-audited-command-intelligence-snapshots"
  ) {
    throw new Error("product console missing Command Intelligence snapshot proof-stack posture.");
  }

  if (
    body.proofStack?.commandIntelligencePackets !==
    "aal2-audited-command-intelligence-packets"
  ) {
    throw new Error("product console missing Command Intelligence packet proof-stack posture.");
  }

  if (body.proofStack?.salesCommandCenter !== "aal2-sales-command-intelligence-timeline") {
    throw new Error("product console missing Sales Command Center proof-stack posture.");
  }

  if (body.proofStack?.salesDealRoom !== "sales-to-buyer-room-linkage-ready") {
    throw new Error("product console missing Pilot Deal Room proof-stack posture.");
  }

  if (body.proofStack?.salesDealRoomPackets !== "aal2-audited-sales-deal-room-packets") {
    throw new Error("product console missing audited Pilot Deal Room packet proof-stack posture.");
  }

  if (body.proofStack?.opportunityWorkspaceProvisioning !== "aal2-opportunity-workspace-provisioning") {
    throw new Error("product console missing opportunity workspace provisioning proof-stack posture.");
  }

  if (body.proofStack?.opportunityWorkspaceProvisioningPackets !== "aal2-audited-opportunity-workspace-packets") {
    throw new Error("product console missing opportunity workspace packet proof-stack posture.");
  }

  if (body.proofStack?.buyerTenantLifecycle !== "aal2-buyer-tenant-lifecycle-automation") {
    throw new Error("product console missing buyer tenant lifecycle proof-stack posture.");
  }

  if (body.proofStack?.buyerTenantLifecyclePackets !== "aal2-audited-buyer-tenant-lifecycle-packets") {
    throw new Error("product console missing buyer tenant lifecycle packet proof-stack posture.");
  }

  if (body.proofStack?.productionActivationReadiness !== "aal2-production-sso-invitation-readiness") {
    throw new Error("product console missing production activation readiness proof-stack posture.");
  }

  if (body.proofStack?.productionActivationReadinessPackets !== "aal2-audited-production-readiness-packets") {
    throw new Error("product console missing production readiness packet proof-stack posture.");
  }

  if (body.proofStack?.customerActivationApprovals !== "aal2-paid-pilot-activation-approvals") {
    throw new Error("product console missing customer activation approvals proof-stack posture.");
  }

  if (body.proofStack?.customerActivationApprovalPackets !== "aal2-audited-activation-approval-packets") {
    throw new Error("product console missing customer activation approval packet proof-stack posture.");
  }

  if (body.proofStack?.buyerDiligenceRoom !== "aal2-buyer-evidence-signed-controls-diligence-room") {
    throw new Error("product console missing buyer diligence room proof-stack posture.");
  }

  if (body.proofStack?.buyerDiligenceRoomPackets !== "aal2-audited-buyer-diligence-packets") {
    throw new Error("product console missing buyer diligence packet proof-stack posture.");
  }

  if (
    body.proofStack?.secureEvidenceVaultReadiness !==
    "aal2-secure-evidence-vault-readiness-disabled-by-default"
  ) {
    throw new Error("product console missing secure evidence vault readiness proof-stack posture.");
  }

  if (
    body.proofStack?.secureEvidenceVaultReadinessPackets !==
    "aal2-audited-secure-evidence-vault-readiness-packets"
  ) {
    throw new Error("product console missing secure evidence vault readiness packet proof-stack posture.");
  }

  if (body.proofStack?.buyerDemoExecutionPath !== "aal2-authenticated-buyer-demo-execution-path") {
    throw new Error("product console missing buyer demo execution path proof-stack posture.");
  }

  if (
    body.proofStack?.buyerDemoExecutionBrief !==
    "operator-brief-non-audited-existing-packets-remain-source-of-truth"
  ) {
    throw new Error("product console missing buyer demo execution brief proof-stack posture.");
  }

  if (body.proofStack?.buyerDemoSessions !== "aal2-persisted-buyer-demo-sessions") {
    throw new Error("product console missing persisted buyer demo session proof-stack posture.");
  }

  if (body.proofStack?.buyerDemoSessionPackets !== "aal2-audited-buyer-demo-session-packets") {
    throw new Error("product console missing audited buyer demo session packet proof-stack posture.");
  }

  if (
    body.proofStack?.buyerDemoSessionQa !==
    "aal2-operator-buyer-demo-session-qa-short-lived-token-compatible"
  ) {
    throw new Error("product console missing buyer demo session QA proof-stack posture.");
  }

  if (
    body.proofStack?.buyerDemoSessionQaTokenPolicy !==
    "short-lived-aal2-token-preflight-and-manual-ci-policy"
  ) {
    throw new Error("product console missing buyer demo session QA token-policy posture.");
  }

  if (
    body.proofStack?.qaEvidenceLedger !==
    "dated-qa-evidence-ledger-with-manual-aal2-gate"
  ) {
    throw new Error("product console missing QA evidence ledger proof-stack posture.");
  }

  if (body.proofStack?.qaManualRunEvidencePacket !== "manual-aal2-run-evidence-packet-ready") {
    throw new Error("product console missing manual QA run evidence packet posture.");
  }

  if (
    body.proofStack?.qaManualRunEvidencePersistence !==
    "tenant-scoped-aal2-manual-qa-evidence-ledger"
  ) {
    throw new Error("product console missing manual QA run evidence persistence posture.");
  }

  if (
    body.proofStack?.qaAuthorityReferenceEvidenceBridge !==
    "authority-reference-qa-evidence-bridge-ready"
  ) {
    throw new Error("product console missing authority-reference QA evidence bridge posture.");
  }

  if (
    body.proofStack?.qaEvidenceActivationPlan !==
    "manual-aal2-qa-evidence-activation-plan-ready"
  ) {
    throw new Error("product console missing QA evidence activation plan posture.");
  }

  if (
    body.proofStack?.qaExecutionReadiness !==
    "manual-aal2-qa-execution-go-no-go-no-secret"
  ) {
    throw new Error("product console missing QA execution readiness proof-stack posture.");
  }

  if (
    body.proofStack?.qaExecutionReadinessBrief !==
    "manual-aal2-qa-execution-brief-no-proof-claim"
  ) {
    throw new Error("product console missing QA execution readiness brief proof-stack posture.");
  }

  if (
    body.proofStack?.qaRunControl !==
    "manual-aal2-qa-run-control-no-secret-operator-brief"
  ) {
    throw new Error("product console missing QA run-control proof-stack posture.");
  }

  if (
    body.proofStack?.qaRunControlBrief !==
    "manual-aal2-qa-run-control-brief-no-auth-claim"
  ) {
    throw new Error("product console missing QA run-control brief proof-stack posture.");
  }

  if (
    body.proofStack?.qaLaunchKit !==
    "manual-aal2-qa-launch-kit-no-secret-human-handoff"
  ) {
    throw new Error("product console missing QA launch-kit proof-stack posture.");
  }

  if (
    body.proofStack?.qaLaunchKitBrief !==
    "manual-aal2-qa-launch-kit-brief-no-token-storage"
  ) {
    throw new Error("product console missing QA launch-kit brief proof-stack posture.");
  }

  if (
    body.proofStack?.qaHumanRunPacket !==
    "manual-aal2-qa-human-run-packet-dispatch-ready"
  ) {
    throw new Error("product console missing QA human run packet proof-stack posture.");
  }

  if (
    body.proofStack?.qaHumanRunPacketBrief !==
    "manual-aal2-qa-human-run-packet-brief-no-proof-claim"
  ) {
    throw new Error("product console missing QA human run packet brief proof-stack posture.");
  }

  if (
    body.proofStack?.qaCompletionBridge !==
    "manual-aal2-qa-completion-bridge-no-secret-pre-persistence"
  ) {
    throw new Error("product console missing QA completion bridge proof-stack posture.");
  }

  if (
    body.proofStack?.qaCompletionBridgeBrief !==
    "manual-aal2-qa-completion-bridge-brief-no-retained-proof-claim"
  ) {
    throw new Error("product console missing QA completion bridge brief proof-stack posture.");
  }

  if (
    body.proofStack?.qaClaimGuard !==
    "manual-aal2-qa-claim-guard-no-overclaim"
  ) {
    throw new Error("product console missing QA claim guard proof-stack posture.");
  }

  if (
    body.proofStack?.qaClaimGuardBrief !==
    "manual-aal2-qa-claim-guard-brief-current-state-language"
  ) {
    throw new Error("product console missing QA claim guard brief proof-stack posture.");
  }

  if (
    body.proofStack?.qaActivationSeal !==
    "manual-aal2-qa-activation-seal-no-secret-boundary-check"
  ) {
    throw new Error("product console missing QA activation seal proof-stack posture.");
  }

  if (
    body.proofStack?.qaActivationSealBrief !==
    "manual-aal2-qa-activation-seal-brief-retained-packet-required"
  ) {
    throw new Error("product console missing QA activation seal brief proof-stack posture.");
  }

  if (
    body.proofStack?.qaProofPromotion !==
    "retained-manual-qa-proof-promotion-gate-no-secret"
  ) {
    throw new Error("product console missing QA proof-promotion proof-stack posture.");
  }

  if (
    body.proofStack?.qaProofPromotionBrief !==
    "manual-qa-proof-promotion-brief-retained-packet-required"
  ) {
    throw new Error("product console missing QA proof-promotion brief proof-stack posture.");
  }

  if (
    body.proofStack?.qaBuyerProofRelease !==
    "manual-aal2-qa-buyer-proof-release-retained-packet-gate"
  ) {
    throw new Error("product console missing QA buyer proof release proof-stack posture.");
  }

  if (
    body.proofStack?.qaBuyerProofReleaseBrief !==
    "manual-aal2-qa-buyer-proof-release-brief-no-public-release"
  ) {
    throw new Error("product console missing QA buyer proof release brief proof-stack posture.");
  }

  if (
    body.proofStack?.buyerReleaseControlRun !==
    "metadata-only-buyer-release-control-runbook-no-release-approval"
  ) {
    throw new Error("product console missing buyer release-control runbook proof-stack posture.");
  }

  if (
    body.proofStack?.buyerReleaseControlRunBrief !==
    "buyer-release-control-runbook-brief-no-secret-no-approval"
  ) {
    throw new Error("product console missing buyer release-control brief proof-stack posture.");
  }

  if (
    body.proofStack?.protectedBuyerReleaseControlRun !==
    "aal2-protected-buyer-release-control-chain-verifier-no-release-approval"
  ) {
    throw new Error("product console missing protected buyer release-control verifier proof-stack posture.");
  }

  if (
    body.proofStack?.protectedBuyerReleaseControlRunPackets !==
    "aal2-audited-buyer-release-control-chain-packet-no-release-approval"
  ) {
    throw new Error("product console missing protected buyer release-control packet proof-stack posture.");
  }

  if (
    body.proofStack?.protectedBuyerReleaseReadinessTimeline !==
    "aal2-protected-buyer-release-readiness-timeline-no-release-approval"
  ) {
    throw new Error("product console missing protected buyer release-readiness timeline proof-stack posture.");
  }

  if (
    body.proofStack?.qaManualExecutionConsole !==
    "manual-aal2-qa-execution-console-protected-operator-control"
  ) {
    throw new Error("product console missing QA manual execution console proof-stack posture.");
  }

  if (
    body.proofStack?.qaManualExecutionConsoleBrief !==
    "manual-aal2-qa-execution-console-brief-no-auth-claim"
  ) {
    throw new Error("product console missing QA manual execution console brief proof-stack posture.");
  }

  if (!body.qaExecutionReadinessWorkflowCount || body.qaExecutionReadinessWorkflowCount < 2) {
    throw new Error("product console expected QA execution readiness workflow coverage.");
  }

  if (!body.qaExecutionReadinessHumanRequiredStageCount || body.qaExecutionReadinessHumanRequiredStageCount < 2) {
    throw new Error("product console expected human-required QA execution stages.");
  }

  if (!body.qaRunControlWorkflowCount || body.qaRunControlWorkflowCount < 2) {
    throw new Error("product console expected QA run-control workflow coverage.");
  }

  if (!body.qaRunControlGateCount || body.qaRunControlGateCount < 7) {
    throw new Error("product console expected QA run-control gate coverage.");
  }

  if (!body.qaRunControlCommandTemplateCount || body.qaRunControlCommandTemplateCount < 4) {
    throw new Error("product console expected QA run-control command template coverage.");
  }

  if (!body.qaLaunchKitPhaseCount || body.qaLaunchKitPhaseCount < 9) {
    throw new Error("product console expected QA launch-kit phase coverage.");
  }

  if (!body.qaLaunchKitWorkflowCount || body.qaLaunchKitWorkflowCount < 2) {
    throw new Error("product console expected QA launch-kit workflow coverage.");
  }

  if (!body.qaLaunchKitSafeCopyFieldCount || body.qaLaunchKitSafeCopyFieldCount < 10) {
    throw new Error("product console expected QA launch-kit safe-copy field coverage.");
  }

  if (!body.qaLaunchKitBlockedClaimCount || body.qaLaunchKitBlockedClaimCount < 9) {
    throw new Error("product console expected QA launch-kit blocked-claim coverage.");
  }

  if (!body.qaHumanRunPacketWorkflowCount || body.qaHumanRunPacketWorkflowCount < 2) {
    throw new Error("product console expected QA human run packet workflow coverage.");
  }

  if (!body.qaHumanRunPacketControlCount || body.qaHumanRunPacketControlCount < 7) {
    throw new Error("product console expected QA human run packet control coverage.");
  }

  if (!body.qaHumanRunPacketHardStopControlCount || body.qaHumanRunPacketHardStopControlCount < 3) {
    throw new Error("product console expected QA human run packet hard-stop coverage.");
  }

  if (!body.qaHumanRunPacketPostRunRouteCount || body.qaHumanRunPacketPostRunRouteCount < 7) {
    throw new Error("product console expected QA human run packet post-run route coverage.");
  }

  if (!body.qaHumanRunPacketBlockedClaimCount || body.qaHumanRunPacketBlockedClaimCount < 12) {
    throw new Error("product console expected QA human run packet blocked claim coverage.");
  }

  if (!body.qaCompletionBridgeCheckpointCount || body.qaCompletionBridgeCheckpointCount < 5) {
    throw new Error("product console expected QA completion bridge checkpoint coverage.");
  }

  if (!body.qaCompletionBridgeHardStopCount || body.qaCompletionBridgeHardStopCount < 2) {
    throw new Error("product console expected QA completion bridge hard-stop coverage.");
  }

  if (!body.qaCompletionBridgeSafeFieldCount || body.qaCompletionBridgeSafeFieldCount < 10) {
    throw new Error("product console expected QA completion bridge safe-field coverage.");
  }

  if (!body.qaCompletionBridgeBlockedClaimCount || body.qaCompletionBridgeBlockedClaimCount < 9) {
    throw new Error("product console expected QA completion bridge blocked-claim coverage.");
  }

  if (!body.qaClaimGuardRuleCount || body.qaClaimGuardRuleCount < 4) {
    throw new Error("product console expected QA claim guard rule coverage.");
  }

  if (!body.qaClaimGuardSafeCurrentClaimCount || body.qaClaimGuardSafeCurrentClaimCount < 5) {
    throw new Error("product console expected QA claim guard safe-current claim coverage.");
  }

  if (!body.qaClaimGuardRetainedPacketClaimCount || body.qaClaimGuardRetainedPacketClaimCount < 5) {
    throw new Error("product console expected QA claim guard retained-packet claim coverage.");
  }

  if (!body.qaClaimGuardBlockedAuthorityClaimCount || body.qaClaimGuardBlockedAuthorityClaimCount < 10) {
    throw new Error("product console expected QA claim guard blocked-authority claim coverage.");
  }

  if (!body.qaClaimGuardReviewTriggerCount || body.qaClaimGuardReviewTriggerCount < 8) {
    throw new Error("product console expected QA claim guard review-trigger coverage.");
  }

  if (!body.qaActivationSealRuleCount || body.qaActivationSealRuleCount < 7) {
    throw new Error("product console expected QA activation seal rule coverage.");
  }

  if (!body.qaActivationSealHardStopRuleCount || body.qaActivationSealHardStopRuleCount < 4) {
    throw new Error("product console expected QA activation seal hard-stop coverage.");
  }

  if (!body.qaActivationSealRequiredEvidenceCount || body.qaActivationSealRequiredEvidenceCount < 10) {
    throw new Error("product console expected QA activation seal evidence coverage.");
  }

  if (!body.qaActivationSealHardStopClaimCount || body.qaActivationSealHardStopClaimCount < 10) {
    throw new Error("product console expected QA activation seal blocked-claim coverage.");
  }

  if (!body.qaProofPromotionRuleCount || body.qaProofPromotionRuleCount < 5) {
    throw new Error("product console expected QA proof-promotion rule coverage.");
  }

  if (!body.qaProofPromotionHardStopRuleCount || body.qaProofPromotionHardStopRuleCount < 3) {
    throw new Error("product console expected QA proof-promotion hard-stop coverage.");
  }

  if (!body.qaProofPromotionBlockedClaimCount || body.qaProofPromotionBlockedClaimCount < 8) {
    throw new Error("product console expected QA proof-promotion blocked-claim coverage.");
  }

  if (!body.qaBuyerProofReleaseRuleCount || body.qaBuyerProofReleaseRuleCount < 5) {
    throw new Error("product console expected QA buyer proof release rule coverage.");
  }

  if (!body.qaBuyerProofReleaseHardStopCount || body.qaBuyerProofReleaseHardStopCount < 8) {
    throw new Error("product console expected QA buyer proof release hard-stop coverage.");
  }

  if (!body.qaBuyerProofReleaseRequiredEvidenceCount || body.qaBuyerProofReleaseRequiredEvidenceCount < 10) {
    throw new Error("product console expected QA buyer proof release evidence coverage.");
  }

  if (!body.qaBuyerProofReleaseBlockedClaimCount || body.qaBuyerProofReleaseBlockedClaimCount < 8) {
    throw new Error("product console expected QA buyer proof release blocked-claim coverage.");
  }

  if (!body.buyerReleaseControlRunStepCount || body.buyerReleaseControlRunStepCount < 8) {
    throw new Error("product console expected buyer release-control step coverage.");
  }

  if (!body.buyerReleaseControlRunProtectedRouteCount || body.buyerReleaseControlRunProtectedRouteCount < 8) {
    throw new Error("product console expected buyer release-control protected route coverage.");
  }

  if (!body.buyerReleaseControlRunPacketRouteCount || body.buyerReleaseControlRunPacketRouteCount < 8) {
    throw new Error("product console expected buyer release-control packet route coverage.");
  }

  if (!body.buyerReleaseControlRunHardStopCount || body.buyerReleaseControlRunHardStopCount < 35) {
    throw new Error("product console expected buyer release-control hard-stop coverage.");
  }

  if (!body.qaManualExecutionConsoleStageCount || body.qaManualExecutionConsoleStageCount < 6) {
    throw new Error("product console expected QA manual execution console stage coverage.");
  }

  if (!body.qaManualExecutionConsoleHardStopCount || body.qaManualExecutionConsoleHardStopCount < 8) {
    throw new Error("product console expected QA manual execution console hard-stop coverage.");
  }

  if (!body.qaManualExecutionConsoleWorkflowCount || body.qaManualExecutionConsoleWorkflowCount < 2) {
    throw new Error("product console expected QA manual execution console workflow coverage.");
  }

  if (!body.qaManualExecutionConsoleBlockedClaimCount || body.qaManualExecutionConsoleBlockedClaimCount < 6) {
    throw new Error("product console expected QA manual execution console blocked-claim coverage.");
  }

  if (body.proofStack?.publicProductionSmoke !== "no-secret-route-readiness-and-fail-closed-checks") {
    throw new Error("product console missing public production smoke proof-stack posture.");
  }

  if (body.salesOperationsSummary?.authentication !== "passkey-or-magic-link-plus-totp") {
    throw new Error("product console missing passkey-aware Sales Operations authentication posture.");
  }

  console.log("pass product console passkey posture");
}

async function checkReadiness() {
  const result = await request("/api/pilot-workspaces/readiness");
  requireStatus("protected pilot readiness", result.response.status, 200);
  requireContentType("protected pilot readiness", result.response, "application/json");
  const body = requireJson("protected pilot readiness", result.body);

  if (body.service !== "scrimed-protected-pilot-workspaces") {
    throw new Error(`protected pilot readiness expected service scrimed-protected-pilot-workspaces but received ${body.service}.`);
  }

  console.log("pass protected pilot readiness");
}

async function checkCompetitiveEdgeApi() {
  const result = await request("/api/competitive-edge");
  requireStatus("competitive edge", result.response.status, 200);
  requireContentType("competitive edge", result.response, "application/json");
  const body = requireJson("competitive edge", result.body);

  if (body.service !== "scrimed-competitive-edge") {
    throw new Error(`competitive edge expected service scrimed-competitive-edge but received ${body.service}.`);
  }

  if (body.status !== "public-positioning-ready") {
    throw new Error(`competitive edge expected public-positioning-ready but received ${body.status}.`);
  }

  if (!Array.isArray(body.edges) || body.edges.length < 5) {
    throw new Error("competitive edge expected at least five public proof pillars.");
  }

  console.log("pass competitive edge API");
}

async function checkPilotDealRoomApi() {
  const result = await request("/api/pilot-deal-room");
  requireStatus("pilot deal room", result.response.status, 200);
  requireContentType("pilot deal room", result.response, "application/json");
  const body = requireJson("pilot deal room", result.body);

  if (body.service !== "scrimed-sales-deal-room") {
    throw new Error(`pilot deal room expected service scrimed-sales-deal-room but received ${body.service}.`);
  }

  if (body.status !== "public-organization-and-protected-packet-ready") {
    throw new Error(`pilot deal room expected public-organization-and-protected-packet-ready but received ${body.status}.`);
  }

  if (!Array.isArray(body.stages) || body.stages.length < 6) {
    throw new Error("pilot deal room expected at least six buyer journey stages.");
  }

  console.log("pass pilot deal room API");
}

async function checkQaEvidenceLedger() {
  const result = await request("/api/qa-evidence");
  requireStatus("QA evidence ledger", result.response.status, 200);
  requireContentType("QA evidence ledger", result.response, "application/json");
  requireSyntheticBoundary("QA evidence ledger", result.response);
  const body = requireJson("QA evidence ledger", result.body);

  if (body.service !== "scrimed-qa-evidence-ledger") {
    throw new Error(`QA evidence ledger expected service scrimed-qa-evidence-ledger but received ${body.service}.`);
  }

  if (body.status !== "qa-evidence-ledger-active") {
    throw new Error(`QA evidence ledger expected qa-evidence-ledger-active but received ${body.status}.`);
  }

  if (body.proofStackStatus !== "dated-qa-evidence-ledger-with-manual-aal2-gate") {
    throw new Error("QA evidence ledger missing proof-stack status.");
  }

  if (!Array.isArray(body.entries) || body.entries.length < 5) {
    throw new Error("QA evidence ledger expected at least five evidence entries.");
  }

  if (!body.entries.some((entry) => entry.status === "manual-gate")) {
    throw new Error("QA evidence ledger expected a visible manual AAL2 gate.");
  }

  if (body.manualRunEvidenceCapture?.status !== "manual-aal2-run-evidence-packet-ready") {
    throw new Error("QA evidence ledger expected manual run evidence packet capture status.");
  }

  if (
    body.manualRunEvidencePersistence?.status !==
    "tenant-scoped-aal2-manual-qa-evidence-ledger"
  ) {
    throw new Error("QA evidence ledger expected manual run evidence persistence status.");
  }

  if (body.activationPlan?.status !== "manual-aal2-qa-evidence-activation-plan-ready") {
    throw new Error("QA evidence ledger expected activation plan status.");
  }

  const brief = await request("/api/qa-evidence/brief");
  requireStatus("QA evidence brief", brief.response.status, 200);
  requireContentType("QA evidence brief", brief.response, "text/markdown");
  requireSyntheticBoundary("QA evidence brief", brief.response);

  const activationPlan = await request("/api/qa-evidence/activation-plan");
  requireStatus("QA evidence activation plan", activationPlan.response.status, 200);
  requireContentType("QA evidence activation plan", activationPlan.response, "application/json");
  requireSyntheticBoundary("QA evidence activation plan", activationPlan.response);
  const activationPlanBody = requireJson("QA evidence activation plan", activationPlan.body);

  if (activationPlanBody.status !== "manual-aal2-qa-evidence-activation-plan-ready") {
    throw new Error("QA evidence activation plan expected ready status.");
  }

  if (!activationPlanBody.workflows?.some((workflow) => workflow.workflowKind === "authority-reference-qa")) {
    throw new Error("QA evidence activation plan missing authority-reference workflow.");
  }

  if (!activationPlanBody.workflows?.some((workflow) => workflow.workflowKind === "sales-demo-session-qa")) {
    throw new Error("QA evidence activation plan missing sales-demo workflow.");
  }

  const activationPlanBrief = await request("/api/qa-evidence/activation-plan/brief");
  requireStatus("QA evidence activation plan brief", activationPlanBrief.response.status, 200);
  requireContentType("QA evidence activation plan brief", activationPlanBrief.response, "text/markdown");
  requireSyntheticBoundary("QA evidence activation plan brief", activationPlanBrief.response);

  if (!activationPlanBrief.body.text.includes("SCRIMED Manual AAL2 QA Evidence Activation Plan")) {
    throw new Error("QA evidence activation plan brief missing expected heading.");
  }

  const contract = await request("/api/qa-evidence/manual-run-packet");
  requireStatus("QA manual run evidence packet contract", contract.response.status, 200);
  requireContentType("QA manual run evidence packet contract", contract.response, "application/json");
  requireSyntheticBoundary("QA manual run evidence packet contract", contract.response);
  const contractBody = requireJson("QA manual run evidence packet contract", contract.body);

  if (contractBody.status !== "manual-aal2-run-evidence-packet-ready") {
    throw new Error("QA manual run evidence packet contract expected ready status.");
  }

  if (
    contractBody.authorityReferenceBridgeStatus !==
    "authority-reference-qa-evidence-bridge-ready"
  ) {
    throw new Error("QA manual run evidence packet contract missing authority-reference bridge status.");
  }

  if (!contractBody.supportedWorkflowKinds?.includes("authority-reference-qa")) {
    throw new Error("QA manual run evidence packet contract missing authority-reference workflow kind.");
  }

  const rejectedSecret = await postJson("/api/qa-evidence/manual-run-packet", {
    workflowKind: "sales-demo-session-qa",
    workflowRunId: "123456789",
    workflowRunUrl: "https://github.com/temitayodahunsi777/scrimed-site/actions/runs/123456789",
    executedAt: new Date().toISOString(),
    baseUrl: "https://app.scrimedsolutions.com",
    intakeId: "intake-test-123",
    createdSessionId: "11111111-1111-4111-8111-111111111111",
    packetAuditEventId: "22222222-2222-4222-8222-222222222222",
    qaOutcome: "pass",
    operatorAttestation: "no-secrets-no-phi-aal2-human-run",
    tokenDisposalAttestation: "temporary-token-deleted-or-rotated",
    dataBoundary: "synthetic-business-workflow-only",
    bearerToken: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkby1ub3Qtc3RvcmUifQ.signature"
  });
  requireStatus("QA manual run evidence packet secret rejection", rejectedSecret.response.status, 400);
  requireContentType("QA manual run evidence packet secret rejection", rejectedSecret.response, "application/json");
  requireSyntheticBoundary("QA manual run evidence packet secret rejection", rejectedSecret.response);

  const acceptedPacket = await postJson("/api/qa-evidence/manual-run-packet", {
    workflowKind: "sales-demo-session-qa",
    workflowRunId: "123456789",
    workflowRunUrl: "https://github.com/temitayodahunsi777/scrimed-site/actions/runs/123456789",
    executedAt: new Date().toISOString(),
    baseUrl: "https://app.scrimedsolutions.com",
    intakeId: "intake-test-123",
    createdSessionId: "11111111-1111-4111-8111-111111111111",
    packetAuditEventId: "22222222-2222-4222-8222-222222222222",
    qaOutcome: "pass",
    operatorAttestation: "no-secrets-no-phi-aal2-human-run",
    tokenDisposalAttestation: "temporary-token-deleted-or-rotated",
    dataBoundary: "synthetic-business-workflow-only"
  });
  requireStatus("QA manual run evidence packet", acceptedPacket.response.status, 200);
  requireContentType("QA manual run evidence packet", acceptedPacket.response, "text/markdown");
  requireSyntheticBoundary("QA manual run evidence packet", acceptedPacket.response);

  const acceptedAuthorityPacket = await postJson("/api/qa-evidence/manual-run-packet", {
    workflowKind: "authority-reference-qa",
    workflowRunId: "202606221321",
    workflowRunUrl: "https://app.scrimedsolutions.com/qa-run-control?runId=202606221321",
    executedAt: new Date().toISOString(),
    baseUrl: "https://app.scrimedsolutions.com",
    intakeId: "atlas-synthetic-evaluation",
    createdSessionId: "33333333-3333-4333-8333-333333333333",
    packetAuditEventId: "44444444-4444-4444-8444-444444444444",
    evidenceTargetLabel: "Workspace target",
    evidenceObjectLabel: "Created authority reference ID",
    packetAuditEventLabel: "Authority packet audit event ID",
    evidenceRoute: "/api/pilot-workspaces/{workspaceSlug}/authority-artifact-references/renewal-queue",
    packetRoute: "/api/pilot-workspaces/{workspaceSlug}/authority-artifact-references/packet",
    operatorRunbook: "/docs/protected-authority-artifact-references.md",
    qaOutcome: "pass",
    operatorAttestation: "no-secrets-no-phi-aal2-human-run",
    tokenDisposalAttestation: "temporary-token-deleted-or-rotated",
    dataBoundary: "synthetic-business-workflow-only"
  });
  requireStatus("QA authority reference evidence packet", acceptedAuthorityPacket.response.status, 200);
  requireContentType("QA authority reference evidence packet", acceptedAuthorityPacket.response, "text/markdown");
  requireSyntheticBoundary("QA authority reference evidence packet", acceptedAuthorityPacket.response);

  if (!acceptedAuthorityPacket.body.text.includes("Workflow kind: authority-reference-qa")) {
    throw new Error("QA authority reference evidence packet missing workflow kind.");
  }

  console.log("pass QA evidence ledger");
}

async function checkQaExecutionReadiness() {
  const result = await request("/api/qa-evidence/execution-readiness");
  requireStatus("QA execution readiness", result.response.status, 200);
  requireContentType("QA execution readiness", result.response, "application/json");
  requireQaExecutionBoundary("QA execution readiness", result.response);
  const body = requireJson("QA execution readiness", result.body);

  if (body.service !== "scrimed-manual-aal2-qa-execution-readiness") {
    throw new Error(`QA execution readiness expected scrimed-manual-aal2-qa-execution-readiness but received ${body.service}.`);
  }

  if (body.status !== "manual-aal2-qa-execution-readiness-ready") {
    throw new Error(`QA execution readiness expected ready status but received ${body.status}.`);
  }

  if (body.executionDecision !== "ready-for-human-run-not-code-bypass") {
    throw new Error("QA execution readiness must preserve human-run decision.");
  }

  if (body.buyerClaimStatus !== "activation-ready-not-retained-authenticated-proof") {
    throw new Error("QA execution readiness must preserve not-retained-proof claim boundary.");
  }

  if (!Array.isArray(body.dispatchWorkflows) || body.dispatchWorkflows.length < 2) {
    throw new Error("QA execution readiness expected both manual workflows.");
  }

  if (!body.dispatchWorkflows.every((workflow) => workflow.state === "ready-for-human-aal2-run-not-executed")) {
    throw new Error("QA execution readiness workflows must remain not executed.");
  }

  if (!body.hardStopRules?.some((rule) => rule.includes("Do not run authenticated QA without a fresh human AAL2 session"))) {
    throw new Error("QA execution readiness missing human AAL2 hard stop.");
  }

  const brief = await request("/api/qa-evidence/execution-readiness/brief");
  requireStatus("QA execution readiness brief", brief.response.status, 200);
  requireContentType("QA execution readiness brief", brief.response, "text/markdown");
  requireQaExecutionBoundary("QA execution readiness brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Manual AAL2 QA Execution Readiness Brief")) {
    throw new Error("QA execution readiness brief missing heading.");
  }

  if (!brief.body.text.includes("ready-for-human-run-not-code-bypass")) {
    throw new Error("QA execution readiness brief missing human-run decision.");
  }

  console.log("pass QA execution readiness");
}

async function checkQaRunControl() {
  const result = await request("/api/qa-evidence/run-control");
  requireStatus("QA run control", result.response.status, 200);
  requireContentType("QA run control", result.response, "application/json");
  requireQaRunControlBoundary("QA run control", result.response);
  const body = requireJson("QA run control", result.body);
  const serialized = JSON.stringify(body);

  if (body.service !== "scrimed-manual-aal2-qa-run-control") {
    throw new Error(`QA run control expected scrimed-manual-aal2-qa-run-control but received ${body.service}.`);
  }

  if (body.status !== "manual-aal2-qa-run-control-ready") {
    throw new Error(`QA run control expected ready status but received ${body.status}.`);
  }

  if (body.executionDecision !== "operator-control-ready-human-aal2-required") {
    throw new Error("QA run control must preserve human AAL2 operator-control decision.");
  }

  if (body.buyerClaimStatus !== "operator-brief-ready-not-retained-authenticated-proof") {
    throw new Error("QA run control must preserve not-retained authenticated proof boundary.");
  }

  if (!Array.isArray(body.workflows) || body.workflows.length < 2) {
    throw new Error("QA run control expected both manual workflows.");
  }

  if (!body.workflows.every((workflow) => workflow.state === "ready-for-operator-control-human-aal2-required")) {
    throw new Error("QA run control workflows must remain human AAL2 required.");
  }

  if (!body.workflows.every((workflow) => workflow.dispatchInputs?.require_authenticated_path === true)) {
    throw new Error("QA run control workflows must require authenticated path dispatch.");
  }

  if (!body.workflows.every((workflow) => workflow.safeEvidenceTemplate?.tokenDisposalAttestation === "temporary-token-deleted-or-rotated")) {
    throw new Error("QA run control safe evidence templates must require token disposal attestation.");
  }

  if (!body.workflows.every((workflow) => workflow.abortConditions?.some((condition) => condition.includes("No fresh human AAL2 session")))) {
    throw new Error("QA run control workflows must include human AAL2 abort condition.");
  }

  if (!Array.isArray(body.gates) || body.gates.length < 7) {
    throw new Error("QA run control expected gate coverage.");
  }

  if (!body.claimRules?.some((rule) => rule.includes("Not allowed yet: SCRIMED has retained authenticated AAL2 QA proof"))) {
    throw new Error("QA run control missing retained-proof claim boundary.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serialized)) {
    throw new Error("QA run control response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serialized)) {
    throw new Error("QA run control response must not contain bearer-token material.");
  }

  const brief = await request("/api/qa-evidence/run-control/brief");
  requireStatus("QA run control brief", brief.response.status, 200);
  requireContentType("QA run control brief", brief.response, "text/markdown");
  requireQaRunControlBoundary("QA run control brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Manual AAL2 QA Run Control Brief")) {
    throw new Error("QA run control brief missing heading.");
  }

  if (!brief.body.text.includes("operator-control-ready-human-aal2-required")) {
    throw new Error("QA run control brief missing operator-control decision.");
  }

  if (!brief.body.text.includes("not-retained-authenticated-proof")) {
    throw new Error("QA run control brief missing retained-proof boundary.");
  }

  console.log("pass QA run control");
}

async function checkQaLaunchKit() {
  const result = await request("/api/qa-evidence/launch-kit");
  requireStatus("QA launch kit", result.response.status, 200);
  requireContentType("QA launch kit", result.response, "application/json");
  requireQaLaunchKitBoundary("QA launch kit", result.response);
  const body = requireJson("QA launch kit", result.body);
  const serialized = JSON.stringify(body);

  if (body.service !== "scrimed-manual-aal2-qa-launch-kit") {
    throw new Error(`QA launch kit expected scrimed-manual-aal2-qa-launch-kit but received ${body.service}.`);
  }

  if (body.status !== "manual-aal2-qa-launch-kit-ready") {
    throw new Error(`QA launch kit expected ready status but received ${body.status}.`);
  }

  if (body.launchDecision !== "ready-for-human-launch-not-code-execution") {
    throw new Error("QA launch kit must preserve human-launch decision.");
  }

  if (body.buyerClaimStatus !== "operator-handoff-ready-not-retained-authenticated-proof") {
    throw new Error("QA launch kit must preserve not-retained authenticated proof boundary.");
  }

  if (!Array.isArray(body.phases) || body.phases.length < 9) {
    throw new Error("QA launch kit expected launch phase coverage.");
  }

  if (!body.phases.some((phase) => phase.state === "hard-stop")) {
    throw new Error("QA launch kit expected hard-stop phase.");
  }

  if (!Array.isArray(body.workflows) || body.workflows.length < 2) {
    throw new Error("QA launch kit expected both manual workflows.");
  }

  if (!body.workflows.every((workflow) => workflow.dispatchInputs?.require_authenticated_path === true)) {
    throw new Error("QA launch kit workflows must require authenticated path dispatch.");
  }

  if (!body.workflows.every((workflow) => workflow.safeEvidenceTemplate?.tokenDisposalAttestation === "temporary-token-deleted-or-rotated")) {
    throw new Error("QA launch kit safe evidence templates must require token disposal attestation.");
  }

  if (!Array.isArray(body.blockedClaims) || !body.blockedClaims.includes("live clinical care authorized")) {
    throw new Error("QA launch kit expected live clinical care to remain blocked.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serialized)) {
    throw new Error("QA launch kit response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serialized)) {
    throw new Error("QA launch kit response must not contain bearer-token material.");
  }

  const brief = await request("/api/qa-evidence/launch-kit/brief");
  requireStatus("QA launch kit brief", brief.response.status, 200);
  requireContentType("QA launch kit brief", brief.response, "text/markdown");
  requireQaLaunchKitBoundary("QA launch kit brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Manual AAL2 QA Launch Kit")) {
    throw new Error("QA launch kit brief missing heading.");
  }

  if (!brief.body.text.includes("ready-for-human-launch-not-code-execution")) {
    throw new Error("QA launch kit brief missing human-launch decision.");
  }

  if (!brief.body.text.includes("temporary-token-deleted-or-rotated")) {
    throw new Error("QA launch kit brief missing token disposal attestation.");
  }

  console.log("pass QA launch kit");
}

async function checkQaHumanRunPacket() {
  const result = await request("/api/qa-evidence/human-run-packet");
  requireStatus("QA human run packet", result.response.status, 200);
  requireContentType("QA human run packet", result.response, "application/json");
  requireQaHumanRunPacketBoundary("QA human run packet", result.response);
  const body = requireJson("QA human run packet", result.body);
  const serialized = JSON.stringify(body);

  if (body.service !== "scrimed-qa-human-run-packet") {
    throw new Error(`QA human run packet expected scrimed-qa-human-run-packet but received ${body.service}.`);
  }

  if (body.status !== "manual-aal2-qa-human-run-packet-ready") {
    throw new Error(`QA human run packet expected ready status but received ${body.status}.`);
  }

  if (body.decisionState !== "dispatch-template-ready") {
    throw new Error("QA human run packet must preserve dispatch-template-ready state.");
  }

  if (body.executionAllowedByCode !== false || body.humanAal2Required !== true) {
    throw new Error("QA human run packet must preserve human-required/no-code-execution boundary.");
  }

  if (body.proofClaimAllowed !== false || body.buyerUseAllowed !== false) {
    throw new Error("QA human run packet must block proof claims and buyer use before protected packet visibility.");
  }

  if (!Array.isArray(body.workflows) || body.workflows.length < 2) {
    throw new Error("QA human run packet expected both manual workflows.");
  }

  if (!Array.isArray(body.controls) || body.controls.length < 7) {
    throw new Error("QA human run packet expected control coverage.");
  }

  if (!body.controls.some((control) => control.state === "hard-stop")) {
    throw new Error("QA human run packet expected hard-stop controls.");
  }

  if (!body.workflows.every((workflow) => workflow.dispatchInputs?.require_authenticated_path === true)) {
    throw new Error("QA human run packet workflows must require authenticated path dispatch.");
  }

  if (!body.postRunRoutes?.includes("/qa-completion-bridge")) {
    throw new Error("QA human run packet expected Completion Bridge post-run route.");
  }

  if (!body.postRunRoutes?.includes("/api/pilot-workspaces/{workspaceSlug}/qa-evidence/manual-run-packets")) {
    throw new Error("QA human run packet expected protected Manual QA Evidence post-run route.");
  }

  if (!Array.isArray(body.blockedClaims) || !body.blockedClaims.includes("live clinical care authorized")) {
    throw new Error("QA human run packet expected live clinical care to remain blocked.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serialized)) {
    throw new Error("QA human run packet response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serialized)) {
    throw new Error("QA human run packet response must not contain bearer-token material.");
  }

  const rejectedSecret = await postJson("/api/qa-evidence/human-run-packet", {
    workflowKind: "sales-demo-session-qa",
    operatorRole: "tenant-admin",
    protectedWorkspaceSlug: "atlas-synthetic-evaluation",
    syntheticTargetId: "synthetic-sales-opportunity-intake-id",
    plannedExecutionWindow: "operator-window-2026-06-22T12:00:00Z",
    bearerToken: "Bearer eyJshould.not.persist.fake",
    dispatchAttestation: "human-aal2-required-no-code-bypass",
    proofBlockedAttestation: "no-retained-proof-until-protected-packet-visible",
    dataBoundary: "synthetic-business-workflow-only"
  });
  requireStatus("QA human run packet secret rejection", rejectedSecret.response.status, 400);
  requireContentType("QA human run packet secret rejection", rejectedSecret.response, "application/json");
  requireQaHumanRunPacketBoundary("QA human run packet secret rejection", rejectedSecret.response);
  const rejectedBody = requireJson("QA human run packet secret rejection", rejectedSecret.body);

  if (rejectedBody.decisionState !== "candidate-dispatch-rejected") {
    throw new Error("QA human run packet must reject secret-like dispatch candidates.");
  }

  const acceptedCandidate = await postJson("/api/qa-evidence/human-run-packet", {
    workflowKind: "authority-reference-qa",
    operatorRole: "tenant-admin",
    protectedWorkspaceSlug: "atlas-synthetic-evaluation",
    syntheticTargetId: "atlas-synthetic-evaluation",
    plannedExecutionWindow: "operator-window-2026-06-22T12:00:00Z",
    dispatchAttestation: "human-aal2-required-no-code-bypass",
    proofBlockedAttestation: "no-retained-proof-until-protected-packet-visible",
    dataBoundary: "synthetic-business-workflow-only"
  });
  requireStatus("QA human run packet accepted candidate", acceptedCandidate.response.status, 200);
  requireContentType("QA human run packet accepted candidate", acceptedCandidate.response, "application/json");
  requireQaHumanRunPacketBoundary("QA human run packet accepted candidate", acceptedCandidate.response);
  const acceptedBody = requireJson("QA human run packet accepted candidate", acceptedCandidate.body);

  if (acceptedBody.decisionState !== "candidate-dispatch-ready-human-aal2-required") {
    throw new Error("QA human run packet accepted candidate must remain human AAL2 required.");
  }

  if (acceptedBody.executionAllowedByCode !== false || acceptedBody.proofClaimAllowed !== false) {
    throw new Error("QA human run packet accepted candidate must not execute or allow proof claims.");
  }

  if (!/^[a-f0-9]{64}$/.test(acceptedBody.dispatchDigest)) {
    throw new Error("QA human run packet accepted candidate expected dispatch digest.");
  }

  if (acceptedBody.workflow?.workflowKind !== "authority-reference-qa") {
    throw new Error("QA human run packet accepted candidate expected authority-reference workflow.");
  }

  const brief = await request("/api/qa-evidence/human-run-packet/brief");
  requireStatus("QA human run packet brief", brief.response.status, 200);
  requireContentType("QA human run packet brief", brief.response, "text/markdown");
  requireQaHumanRunPacketBoundary("QA human run packet brief", brief.response);

  if (!brief.body.text.includes("SCRIMED QA Human Run Packet")) {
    throw new Error("QA human run packet brief missing heading.");
  }

  if (!brief.body.text.includes("dispatch-template-ready")) {
    throw new Error("QA human run packet brief missing dispatch-template-ready state.");
  }

  if (!brief.body.text.includes("Proof claim allowed: no")) {
    throw new Error("QA human run packet brief must keep proof claims blocked.");
  }

  console.log("pass QA human run packet");
}

async function checkQaCompletionBridge() {
  const result = await request("/api/qa-evidence/completion-bridge");
  requireStatus("QA completion bridge", result.response.status, 200);
  requireContentType("QA completion bridge", result.response, "application/json");
  requireQaCompletionBridgeBoundary("QA completion bridge", result.response);
  const body = requireJson("QA completion bridge", result.body);
  const serialized = JSON.stringify(body);

  if (body.service !== "scrimed-qa-completion-bridge") {
    throw new Error(`QA completion bridge expected scrimed-qa-completion-bridge but received ${body.service}.`);
  }

  if (body.status !== "manual-aal2-qa-completion-bridge-ready") {
    throw new Error(`QA completion bridge expected ready status but received ${body.status}.`);
  }

  if (body.completionDecisionState !== "waiting-for-human-aal2-run") {
    throw new Error("QA completion bridge must preserve waiting-for-human-aal2-run public decision.");
  }

  if (body.buyerClaimStatus !== "completion-bridge-ready-not-retained-authenticated-proof") {
    throw new Error("QA completion bridge must preserve not-retained authenticated proof boundary.");
  }

  if (!Array.isArray(body.checkpoints) || body.checkpoints.length < 5) {
    throw new Error("QA completion bridge expected checkpoint coverage.");
  }

  if (!body.checkpoints.some((checkpoint) => checkpoint.state === "protected-only")) {
    throw new Error("QA completion bridge expected protected-only persistence checkpoint.");
  }

  if (!Array.isArray(body.bridgeRules) || !body.bridgeRules.some((rule) => rule.includes("Not allowed here"))) {
    throw new Error("QA completion bridge expected not-allowed bridge rule.");
  }

  if (!Array.isArray(body.blockedClaims) || !body.blockedClaims.includes("live clinical care authorized")) {
    throw new Error("QA completion bridge expected live clinical care to remain blocked.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serialized)) {
    throw new Error("QA completion bridge response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serialized)) {
    throw new Error("QA completion bridge response must not contain bearer-token material.");
  }

  const rejectedSecret = await postJson("/api/qa-evidence/completion-bridge", {
    workflowKind: "sales-demo-session-qa",
    workflowRunId: "1234567890",
    workflowRunUrl: "https://github.com/temitayodahunsi777/scrimed-site/actions/runs/1234567890",
    executedAt: new Date().toISOString(),
    baseUrl: "https://app.scrimedsolutions.com",
    intakeId: "synthetic-intake-001",
    createdSessionId: "11111111-1111-4111-8111-111111111111",
    packetAuditEventId: "22222222-2222-4222-8222-222222222222",
    bearerToken: "Bearer eyJshould.not.persist.fake",
    qaOutcome: "pass",
    operatorAttestation: "no-secrets-no-phi-aal2-human-run",
    tokenDisposalAttestation: "temporary-token-deleted-or-rotated",
    dataBoundary: "synthetic-business-workflow-only"
  });
  requireStatus("QA completion bridge secret rejection", rejectedSecret.response.status, 400);
  requireContentType("QA completion bridge secret rejection", rejectedSecret.response, "application/json");
  requireQaCompletionBridgeBoundary("QA completion bridge secret rejection", rejectedSecret.response);
  const rejectedBody = requireJson("QA completion bridge secret rejection", rejectedSecret.body);

  if (rejectedBody.decisionState !== "candidate-validation-failed") {
    throw new Error("QA completion bridge must fail closed for secret-like candidate material.");
  }

  const acceptedCandidate = await postJson("/api/qa-evidence/completion-bridge", {
    workflowKind: "authority-reference-qa",
    workflowRunId: "1234567890",
    workflowRunUrl: "https://github.com/temitayodahunsi777/scrimed-site/actions/runs/1234567890",
    executedAt: new Date().toISOString(),
    baseUrl: "https://app.scrimedsolutions.com",
    intakeId: "atlas-synthetic-evaluation",
    createdSessionId: "11111111-1111-4111-8111-111111111111",
    packetAuditEventId: "22222222-2222-4222-8222-222222222222",
    evidenceTargetLabel: "Workspace target",
    evidenceObjectLabel: "Created authority reference ID",
    packetAuditEventLabel: "Authority packet audit event ID",
    evidenceRoute: "/api/pilot-workspaces/{workspaceSlug}/authority-artifact-references",
    packetRoute: "/api/pilot-workspaces/{workspaceSlug}/authority-artifact-references/packet",
    operatorRunbook: "/docs/protected-authority-artifact-references.md",
    qaOutcome: "pass",
    operatorAttestation: "no-secrets-no-phi-aal2-human-run",
    tokenDisposalAttestation: "temporary-token-deleted-or-rotated",
    dataBoundary: "synthetic-business-workflow-only"
  });
  requireStatus("QA completion bridge accepted candidate", acceptedCandidate.response.status, 200);
  requireContentType("QA completion bridge accepted candidate", acceptedCandidate.response, "application/json");
  requireQaCompletionBridgeBoundary("QA completion bridge accepted candidate", acceptedCandidate.response);
  const acceptedBody = requireJson("QA completion bridge accepted candidate", acceptedCandidate.body);

  if (acceptedBody.decisionState !== "ready-for-protected-persistence") {
    throw new Error("QA completion bridge accepted candidate must be ready for protected persistence.");
  }

  if (acceptedBody.promotionAllowed !== false) {
    throw new Error("QA completion bridge must not promote buyer proof before protected packet persistence.");
  }

  if (!/^[a-f0-9]{64}$/.test(acceptedBody.packetPreviewSha256)) {
    throw new Error("QA completion bridge accepted candidate expected packet preview SHA-256.");
  }

  if (!acceptedBody.packetPreviewMarkdown?.includes("SCRIMED Manual Authority Reference QA Evidence Packet")) {
    throw new Error("QA completion bridge accepted candidate expected authority reference packet preview.");
  }

  const brief = await request("/api/qa-evidence/completion-bridge/brief");
  requireStatus("QA completion bridge brief", brief.response.status, 200);
  requireContentType("QA completion bridge brief", brief.response, "text/markdown");
  requireQaCompletionBridgeBoundary("QA completion bridge brief", brief.response);

  if (!brief.body.text.includes("SCRIMED QA Completion Bridge Brief")) {
    throw new Error("QA completion bridge brief missing heading.");
  }

  if (!brief.body.text.includes("waiting-for-human-aal2-run")) {
    throw new Error("QA completion bridge brief missing waiting-for-human decision.");
  }

  if (!brief.body.text.includes("Protected persistence route")) {
    throw new Error("QA completion bridge brief missing protected persistence route.");
  }

  console.log("pass QA completion bridge");
}

async function checkQaClaimGuard() {
  const result = await request("/api/qa-evidence/claim-guard");
  requireStatus("QA claim guard", result.response.status, 200);
  requireContentType("QA claim guard", result.response, "application/json");
  requireQaClaimGuardBoundary("QA claim guard", result.response);
  const body = requireJson("QA claim guard", result.body);
  const serialized = JSON.stringify(body);

  if (body.service !== "scrimed-qa-claim-guard") {
    throw new Error(`QA claim guard expected scrimed-qa-claim-guard but received ${body.service}.`);
  }

  if (body.status !== "manual-aal2-qa-claim-guard-ready") {
    throw new Error(`QA claim guard expected ready status but received ${body.status}.`);
  }

  if (body.buyerClaimPosture !== "activation-ready-until-retained-packet-proof") {
    throw new Error("QA claim guard must preserve current activation-ready claim posture.");
  }

  if (!Array.isArray(body.rules) || body.rules.length < 4) {
    throw new Error("QA claim guard expected rule coverage.");
  }

  if (!Array.isArray(body.blockedAuthorityClaims) || !body.blockedAuthorityClaims.includes("live clinical care authorized")) {
    throw new Error("QA claim guard expected live clinical care authority to remain blocked.");
  }

  if (!Array.isArray(body.reviewTriggers) || !body.reviewTriggers.includes("press release")) {
    throw new Error("QA claim guard expected external-use review triggers.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serialized)) {
    throw new Error("QA claim guard response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serialized)) {
    throw new Error("QA claim guard response must not contain bearer-token material.");
  }

  const safeClaim = await postJson("/api/qa-evidence/claim-guard", {
    claim:
      "SCRIMED has a no-secret synthetic operator-ready human AAL2 required QA path with protected persistence required."
  });
  requireStatus("QA claim guard safe current claim", safeClaim.response.status, 200);
  requireContentType("QA claim guard safe current claim", safeClaim.response, "application/json");
  requireQaClaimGuardBoundary("QA claim guard safe current claim", safeClaim.response);
  const safeBody = requireJson("QA claim guard safe current claim", safeClaim.body);

  if (safeBody.decisionState !== "safe-current-claim" || safeBody.allowedForCurrentBuyerUse !== true) {
    throw new Error("QA claim guard expected safe current claim to be allowed.");
  }

  const packetClaim = await postJson("/api/qa-evidence/claim-guard", {
    claim: "SCRIMED has retained authenticated QA evidence for the completed human AAL2 QA workflow."
  });
  requireStatus("QA claim guard packet-gated claim", packetClaim.response.status, 200);
  requireContentType("QA claim guard packet-gated claim", packetClaim.response, "application/json");
  requireQaClaimGuardBoundary("QA claim guard packet-gated claim", packetClaim.response);
  const packetBody = requireJson("QA claim guard packet-gated claim", packetClaim.body);

  if (packetBody.decisionState !== "requires-retained-packet" || packetBody.allowedForCurrentBuyerUse !== false) {
    throw new Error("QA claim guard expected packet-backed claim to require retained packet evidence.");
  }

  const blockedClaim = await postJson("/api/qa-evidence/claim-guard", {
    claim: "SCRIMED is HIPAA compliant and live clinical care authorized with reimbursement guaranteed."
  });
  requireStatus("QA claim guard blocked authority claim", blockedClaim.response.status, 409);
  requireContentType("QA claim guard blocked authority claim", blockedClaim.response, "application/json");
  requireQaClaimGuardBoundary("QA claim guard blocked authority claim", blockedClaim.response);
  const blockedBody = requireJson("QA claim guard blocked authority claim", blockedClaim.body);

  if (blockedBody.decisionState !== "blocked-authority-claim" || blockedBody.allowedForCurrentBuyerUse !== false) {
    throw new Error("QA claim guard expected authority claim to remain blocked.");
  }

  const brief = await request("/api/qa-evidence/claim-guard/brief");
  requireStatus("QA claim guard brief", brief.response.status, 200);
  requireContentType("QA claim guard brief", brief.response, "text/markdown");
  requireQaClaimGuardBoundary("QA claim guard brief", brief.response);

  if (!brief.body.text.includes("SCRIMED QA Claim Guard Brief")) {
    throw new Error("QA claim guard brief missing heading.");
  }

  if (!brief.body.text.includes("activation-ready-until-retained-packet-proof")) {
    throw new Error("QA claim guard brief missing activation-ready posture.");
  }

  if (!brief.body.text.includes("Blocked Authority Claims")) {
    throw new Error("QA claim guard brief missing blocked authority claims.");
  }

  console.log("pass QA claim guard");
}

async function checkQaActivationSeal() {
  const result = await request("/api/qa-evidence/activation-seal");
  requireStatus("QA activation seal", result.response.status, 200);
  requireContentType("QA activation seal", result.response, "application/json");
  requireQaActivationSealBoundary("QA activation seal", result.response);
  const body = requireJson("QA activation seal", result.body);
  const serialized = JSON.stringify(body);

  if (body.service !== "scrimed-qa-activation-seal") {
    throw new Error(`QA activation seal expected scrimed-qa-activation-seal but received ${body.service}.`);
  }

  if (body.status !== "manual-aal2-qa-activation-seal-ready") {
    throw new Error(`QA activation seal expected ready status but received ${body.status}.`);
  }

  if (body.decisionState !== "unsealed-human-aal2-required") {
    throw new Error(`QA activation seal expected unsealed-human-aal2-required but received ${body.decisionState}.`);
  }

  if (body.sealAllowed !== false || body.buyerUseAllowed !== false) {
    throw new Error("QA activation seal must not allow public/default seal or buyer use.");
  }

  if (!Array.isArray(body.rules) || body.rules.length < 7) {
    throw new Error("QA activation seal expected rule coverage.");
  }

  if (!Array.isArray(body.requiredEvidence) || !body.requiredEvidence.includes("protected Manual QA Evidence packet SHA-256")) {
    throw new Error("QA activation seal expected protected packet evidence requirement.");
  }

  if (!Array.isArray(body.hardStopClaims) || !body.hardStopClaims.includes("live clinical care authorized")) {
    throw new Error("QA activation seal expected live clinical care authority to remain blocked.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serialized)) {
    throw new Error("QA activation seal response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serialized)) {
    throw new Error("QA activation seal response must not contain bearer-token material.");
  }

  const candidate = await postJson("/api/qa-evidence/activation-seal", {
    workflowRunId: "1234567890",
    workflowRunUrl: "https://github.com/temitayodahunsi777/scrimed-site/actions/runs/1234567890",
    packetSha256: "a".repeat(64),
    packetAuditEventId: "22222222-2222-4222-8222-222222222222",
    protectedWorkspaceSlug: "atlas-synthetic-evaluation",
    proofPromotionState: "ready-for-buyer-diligence",
    claimDecisionState: "requires-retained-packet",
    operatorAttestation: "no-secrets-no-phi-aal2-human-run",
    tokenDisposalAttestation: "temporary-token-deleted-or-rotated",
    dataBoundary: "synthetic-business-workflow-only"
  });
  requireStatus("QA activation seal candidate", candidate.response.status, 200);
  requireContentType("QA activation seal candidate", candidate.response, "application/json");
  requireQaActivationSealBoundary("QA activation seal candidate", candidate.response);
  const candidateBody = requireJson("QA activation seal candidate", candidate.body);

  if (
    candidateBody.decisionState !== "candidate-ready-protected-verification-required" ||
    candidateBody.sealAllowed !== false ||
    candidateBody.publicVerificationOnly !== true
  ) {
    throw new Error("QA activation seal expected candidate-ready public verification without seal allowance.");
  }

  const blocked = await postJson("/api/qa-evidence/activation-seal", {
    claim: "SCRIMED is HIPAA compliant with live clinical care authorized and reimbursement guaranteed."
  });
  requireStatus("QA activation seal blocked authority claim", blocked.response.status, 409);
  requireContentType("QA activation seal blocked authority claim", blocked.response, "application/json");
  requireQaActivationSealBoundary("QA activation seal blocked authority claim", blocked.response);
  const blockedBody = requireJson("QA activation seal blocked authority claim", blocked.body);

  if (blockedBody.decisionState !== "blocked-boundary-violation" || blockedBody.sealAllowed !== false) {
    throw new Error("QA activation seal expected authority claim to remain blocked.");
  }

  const brief = await request("/api/qa-evidence/activation-seal/brief");
  requireStatus("QA activation seal brief", brief.response.status, 200);
  requireContentType("QA activation seal brief", brief.response, "text/markdown");
  requireQaActivationSealBoundary("QA activation seal brief", brief.response);

  if (!brief.body.text.includes("SCRIMED QA Activation Seal Brief")) {
    throw new Error("QA activation seal brief missing heading.");
  }

  if (!brief.body.text.includes("unsealed-human-aal2-required")) {
    throw new Error("QA activation seal brief missing unsealed decision.");
  }

  if (!brief.body.text.includes("Protected packet required")) {
    throw new Error("QA activation seal brief missing protected packet rule.");
  }

  console.log("pass QA activation seal");
}

async function checkQaProofPromotion() {
  const result = await request("/api/qa-evidence/proof-promotion");
  requireStatus("QA proof promotion", result.response.status, 200);
  requireContentType("QA proof promotion", result.response, "application/json");
  requireQaProofPromotionBoundary("QA proof promotion", result.response);
  const body = requireJson("QA proof promotion", result.body);
  const serialized = JSON.stringify(body);

  if (body.service !== "scrimed-manual-qa-proof-promotion") {
    throw new Error(`QA proof promotion expected scrimed-manual-qa-proof-promotion but received ${body.service}.`);
  }

  if (body.status !== "manual-aal2-qa-proof-promotion-gate-ready") {
    throw new Error(`QA proof promotion expected ready status but received ${body.status}.`);
  }

  if (body.promotionDecisionState !== "pending-retained-packet") {
    throw new Error(`QA proof promotion expected pending-retained-packet public state but received ${body.promotionDecisionState}.`);
  }

  if (body.promotionAllowed !== false) {
    throw new Error("QA proof promotion must not allow public/default promotion before retained packet visibility.");
  }

  if (!Array.isArray(body.rules) || body.rules.length < 5) {
    throw new Error("QA proof promotion expected rule coverage.");
  }

  if (!Array.isArray(body.blockedClaims) || !body.blockedClaims.includes("live clinical care authorized")) {
    throw new Error("QA proof promotion expected live clinical care to remain a blocked claim.");
  }

  if (!body.decision?.buyerProofLanguage?.includes("not retained authenticated QA proof")) {
    throw new Error("QA proof promotion default decision must preserve not-retained proof language.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serialized)) {
    throw new Error("QA proof promotion response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serialized)) {
    throw new Error("QA proof promotion response must not contain bearer-token material.");
  }

  const brief = await request("/api/qa-evidence/proof-promotion/brief");
  requireStatus("QA proof promotion brief", brief.response.status, 200);
  requireContentType("QA proof promotion brief", brief.response, "text/markdown");
  requireQaProofPromotionBoundary("QA proof promotion brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Manual QA Proof Promotion Brief")) {
    throw new Error("QA proof promotion brief missing heading.");
  }

  if (!brief.body.text.includes("pending-retained-packet")) {
    throw new Error("QA proof promotion brief missing pending retained-packet state.");
  }

  if (!brief.body.text.includes("Retained packet hash required")) {
    throw new Error("QA proof promotion brief missing retained packet hash rule.");
  }

  console.log("pass QA proof promotion");
}

async function checkQaBuyerProofRelease() {
  const result = await request("/api/qa-evidence/buyer-proof-release");
  requireStatus("QA buyer proof release", result.response.status, 200);
  requireContentType("QA buyer proof release", result.response, "application/json");
  requireQaBuyerProofReleaseBoundary("QA buyer proof release", result.response);
  const body = requireJson("QA buyer proof release", result.body);
  const serialized = JSON.stringify(body);

  if (body.service !== "scrimed-qa-buyer-proof-release") {
    throw new Error(`QA buyer proof release expected scrimed-qa-buyer-proof-release but received ${body.service}.`);
  }

  if (body.status !== "manual-aal2-qa-buyer-proof-release-gate-ready") {
    throw new Error(`QA buyer proof release expected ready status but received ${body.status}.`);
  }

  if (body.releaseDecisionState !== "locked-retained-packet-required") {
    throw new Error(`QA buyer proof release expected locked-retained-packet-required but received ${body.releaseDecisionState}.`);
  }

  if (body.buyerDiligenceExportAllowed !== false || body.protectedVerificationRequired !== true) {
    throw new Error("QA buyer proof release must block public/default buyer export and require protected verification.");
  }

  if (body.externalDistributionAllowed !== false || body.publicClaimAllowed !== false) {
    throw new Error("QA buyer proof release must block external distribution and public claims.");
  }

  if (!Array.isArray(body.requiredEvidence) || body.requiredEvidence.length < 10) {
    throw new Error("QA buyer proof release expected required evidence coverage.");
  }

  if (!Array.isArray(body.hardStops) || !body.hardStops.some((stop) => stop.includes("PHI"))) {
    throw new Error("QA buyer proof release expected PHI hard-stop coverage.");
  }

  if (!Array.isArray(body.blockedClaims) || !body.blockedClaims.includes("SCRIMED can process production PHI")) {
    throw new Error("QA buyer proof release expected production PHI blocked claim.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serialized)) {
    throw new Error("QA buyer proof release response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serialized)) {
    throw new Error("QA buyer proof release response must not contain bearer-token material.");
  }

  const blocked = await postJson("/api/qa-evidence/buyer-proof-release", {
    claim: "SCRIMED is HIPAA certified with live clinical care authorized and reimbursement guaranteed."
  });
  requireStatus("QA buyer proof release blocked authority claim", blocked.response.status, 409);
  requireContentType("QA buyer proof release blocked authority claim", blocked.response, "application/json");
  requireQaBuyerProofReleaseBoundary("QA buyer proof release blocked authority claim", blocked.response);
  const blockedBody = requireJson("QA buyer proof release blocked authority claim", blocked.body);

  if (
    blockedBody.releaseDecisionState !== "blocked-boundary-violation" ||
    blockedBody.buyerDiligenceExportAllowed !== false
  ) {
    throw new Error("QA buyer proof release expected authority claim to remain blocked.");
  }

  const candidate = await postJson("/api/qa-evidence/buyer-proof-release", {
    workflowRunId: "1234567890",
    workflowRunUrl: "https://github.com/temitayodahunsi777/scrimed-site/actions/runs/1234567890",
    packetSha256: "b".repeat(64),
    packetAuditEventId: "22222222-2222-4222-8222-222222222222",
    protectedWorkspaceSlug: "atlas-synthetic-evaluation",
    proofPromotionState: "ready-for-buyer-diligence",
    activationSealState: "sealed-for-buyer-diligence",
    claimDecisionState: "requires-retained-packet",
    operatorAttestation: "no-secrets-no-phi-aal2-human-run",
    tokenDisposalAttestation: "temporary-token-deleted-or-rotated",
    dataBoundary: "synthetic-business-workflow-only"
  });
  requireStatus("QA buyer proof release candidate", candidate.response.status, 200);
  requireContentType("QA buyer proof release candidate", candidate.response, "application/json");
  requireQaBuyerProofReleaseBoundary("QA buyer proof release candidate", candidate.response);
  const candidateBody = requireJson("QA buyer proof release candidate", candidate.body);

  if (
    candidateBody.releaseDecisionState !== "candidate-ready-protected-verification-required" ||
    candidateBody.candidateComplete !== true ||
    candidateBody.buyerDiligenceExportAllowed !== false ||
    candidateBody.protectedVerificationRequired !== true
  ) {
    throw new Error("QA buyer proof release candidate must remain protected-verification-only.");
  }

  const brief = await request("/api/qa-evidence/buyer-proof-release/brief");
  requireStatus("QA buyer proof release brief", brief.response.status, 200);
  requireContentType("QA buyer proof release brief", brief.response, "text/markdown");
  requireQaBuyerProofReleaseBoundary("QA buyer proof release brief", brief.response);

  if (!brief.body.text.includes("SCRIMED QA Buyer Proof Release Brief")) {
    throw new Error("QA buyer proof release brief missing heading.");
  }

  if (!brief.body.text.includes("locked-retained-packet-required")) {
    throw new Error("QA buyer proof release brief missing locked retained-packet state.");
  }

  if (!brief.body.text.includes("Protected release route")) {
    throw new Error("QA buyer proof release brief missing protected release route.");
  }

  console.log("pass QA buyer proof release");
}

async function checkBuyerReleaseControlRun() {
  const result = await request("/api/buyer-release-control-run");
  requireStatus("Buyer release-control runbook", result.response.status, 200);
  requireContentType("Buyer release-control runbook", result.response, "application/json");
  requireBuyerReleaseControlRunBoundary("Buyer release-control runbook", result.response);
  const body = requireJson("Buyer release-control runbook", result.body);
  const serialized = JSON.stringify(body);

  if (body.service !== "scrimed-buyer-release-control-runbook") {
    throw new Error(`Buyer release-control runbook expected service scrimed-buyer-release-control-runbook but received ${body.service}.`);
  }

  if (body.status !== "buyer-release-control-runbook-ready") {
    throw new Error(`Buyer release-control runbook expected ready status but received ${body.status}.`);
  }

  if (body.executionDecision !== "runbook-ready-protected-aal2-required") {
    throw new Error(`Buyer release-control runbook expected protected AAL2 execution decision but received ${body.executionDecision}.`);
  }

  if (body.shareDecision !== "internal-only-until-release-chain-retained") {
    throw new Error(`Buyer release-control runbook expected internal-only share decision but received ${body.shareDecision}.`);
  }

  if (body.protectedVerifierRoute !== "/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run") {
    throw new Error("Buyer release-control runbook expected protected verifier route.");
  }

  if (body.protectedVerifierPacketRoute !== "/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/packet") {
    throw new Error("Buyer release-control runbook expected protected verifier packet route.");
  }

  if (body.protectedVerifierTimelineRoute !== "/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/timeline") {
    throw new Error("Buyer release-control runbook expected protected verifier timeline route.");
  }
  if (body.operatorRunScript !== "scripts/buyer-proof-release-operator-run.mjs") {
    throw new Error("Buyer release-control runbook expected buyer proof operator run script.");
  }
  if (
    body.operatorRunStatus !==
    "aal2-buyer-proof-release-operator-run-script-token-boundary"
  ) {
    throw new Error("Buyer release-control runbook expected buyer proof operator run token boundary.");
  }

  if (!Array.isArray(body.steps) || body.steps.length < 8) {
    throw new Error("Buyer release-control runbook expected release-control step coverage.");
  }

  if (!Array.isArray(body.requiredExternalApprovalDomains) || body.requiredExternalApprovalDomains.length < 7) {
    throw new Error("Buyer release-control runbook expected external approval domain coverage.");
  }

  if (!Array.isArray(body.requiredReviewerRoles) || body.requiredReviewerRoles.length < 7) {
    throw new Error("Buyer release-control runbook expected reviewer role coverage.");
  }

  if (!Array.isArray(body.requiredReleaseAuthorityDomains) || body.requiredReleaseAuthorityDomains.length < 7) {
    throw new Error("Buyer release-control runbook expected release authority domain coverage.");
  }

  if (!Array.isArray(body.blockedClaims) || !body.blockedClaims.some((claim) => claim.includes("production PHI"))) {
    throw new Error("Buyer release-control runbook expected production PHI blocked claim.");
  }

  if (!Array.isArray(body.workarounds) || !body.workarounds.some((workaround) => workaround.includes("bearer token"))) {
    throw new Error("Buyer release-control runbook expected bearer-token workaround guidance.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serialized)) {
    throw new Error("Buyer release-control runbook response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serialized)) {
    throw new Error("Buyer release-control runbook response must not contain bearer-token material.");
  }

  const brief = await request("/api/buyer-release-control-run/brief");
  requireStatus("Buyer release-control runbook brief", brief.response.status, 200);
  requireContentType("Buyer release-control runbook brief", brief.response, "text/markdown");
  requireBuyerReleaseControlRunBoundary("Buyer release-control runbook brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Buyer Release Control Runbook")) {
    throw new Error("Buyer release-control runbook brief missing heading.");
  }

  if (!brief.body.text.includes("not release approval")) {
    throw new Error("Buyer release-control runbook brief missing not-release-approval boundary.");
  }

  if (!brief.body.text.includes("protected AAL2 run")) {
    throw new Error("Buyer release-control runbook brief missing protected AAL2 run boundary.");
  }

  console.log("pass Buyer release-control runbook");
}

async function checkQaManualExecutionConsole() {
  const result = await request("/api/qa-evidence/manual-execution-console");
  requireStatus("QA manual execution console", result.response.status, 200);
  requireContentType("QA manual execution console", result.response, "application/json");
  requireQaManualExecutionConsoleBoundary("QA manual execution console", result.response);
  const body = requireJson("QA manual execution console", result.body);
  const serialized = JSON.stringify(body);

  if (body.service !== "scrimed-manual-aal2-qa-execution-console") {
    throw new Error(`QA manual execution console expected service scrimed-manual-aal2-qa-execution-console but received ${body.service}.`);
  }

  if (body.status !== "manual-aal2-qa-execution-console-ready") {
    throw new Error(`QA manual execution console expected ready status but received ${body.status}.`);
  }

  if (body.consoleState !== "operator-aal2-run-required") {
    throw new Error(`QA manual execution console expected operator-aal2-run-required but received ${body.consoleState}.`);
  }

  if (body.publicSummaryOnly !== true || body.protectedExecutionRequired !== true) {
    throw new Error("QA manual execution console public API must remain summary-only and protected-execution-required.");
  }

  if (body.buyerProofReleaseReady !== false) {
    throw new Error("QA manual execution console public API must not mark buyer proof release ready.");
  }

  if (!Array.isArray(body.workflows) || body.workflows.length < 2) {
    throw new Error("QA manual execution console expected workflow coverage.");
  }

  if (!Array.isArray(body.stages) || body.stages.length < 6) {
    throw new Error("QA manual execution console expected stage coverage.");
  }

  if (!Array.isArray(body.hardStops) || !body.hardStops.some((stop) => stop.includes("PHI"))) {
    throw new Error("QA manual execution console expected PHI hard-stop coverage.");
  }

  if (!Array.isArray(body.blockedAuthorityClaims) || !body.blockedAuthorityClaims.some((claim) => claim.includes("production PHI"))) {
    throw new Error("QA manual execution console expected production PHI blocked claim.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serialized)) {
    throw new Error("QA manual execution console response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serialized)) {
    throw new Error("QA manual execution console response must not contain bearer-token material.");
  }

  const brief = await request("/api/qa-evidence/manual-execution-console/brief");
  requireStatus("QA manual execution console brief", brief.response.status, 200);
  requireContentType("QA manual execution console brief", brief.response, "text/markdown");
  requireQaManualExecutionConsoleBoundary("QA manual execution console brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Manual QA Execution Console Brief")) {
    throw new Error("QA manual execution console brief missing heading.");
  }

  if (!brief.body.text.includes("operator-aal2-run-required")) {
    throw new Error("QA manual execution console brief missing operator AAL2 required state.");
  }

  if (!brief.body.text.includes("Protected console")) {
    throw new Error("QA manual execution console brief missing protected console route.");
  }

  console.log("pass QA manual execution console");
}

async function checkQaAal2RunEvidence() {
  const result = await request("/api/qa-evidence/aal2-run-evidence");
  requireStatus("QA AAL2 run evidence", result.response.status, 200);
  requireContentType("QA AAL2 run evidence", result.response, "application/json");
  requireQaAal2RunEvidenceBoundary("QA AAL2 run evidence", result.response);
  const body = requireJson("QA AAL2 run evidence", result.body);
  const serialized = JSON.stringify(body);

  if (body.service !== "scrimed-aal2-synthetic-qa-run-evidence") {
    throw new Error(`QA AAL2 run evidence expected service scrimed-aal2-synthetic-qa-run-evidence but received ${body.service}.`);
  }

  if (body.status !== "protected-aal2-synthetic-qa-evidence-package-ready") {
    throw new Error(`QA AAL2 run evidence expected package-ready status but received ${body.status}.`);
  }

  if (body.runState !== "protected-aal2-human-run-required") {
    throw new Error(`QA AAL2 run evidence expected protected-aal2-human-run-required but received ${body.runState}.`);
  }

  if (body.recommendation !== "NO-GO-buyer-proof-release") {
    throw new Error(`QA AAL2 run evidence expected NO-GO buyer proof release but received ${body.recommendation}.`);
  }

  if (body.buyerProofReleaseAllowed !== false || body.protectedHumanRunRequired !== true) {
    throw new Error("QA AAL2 run evidence public API must require protected human run and block buyer proof release.");
  }

  if (body.syntheticDataConfirmed !== true || body.phiEnteredSystem !== false) {
    throw new Error("QA AAL2 run evidence must confirm synthetic-only and no-PHI posture.");
  }

  if (body.productionSystemsTouched !== false || body.livePatientWorkflowTriggered !== false || body.autonomousClinicalActionPerformed !== false) {
    throw new Error("QA AAL2 run evidence must not touch production, live patient workflows, or autonomous clinical action.");
  }

  if (!Array.isArray(body.categories) || body.categories.length < 9) {
    throw new Error("QA AAL2 run evidence expected all required test categories.");
  }

  for (const requiredCategory of [
    "Clinical summary generation",
    "Missing-data handling",
    "Evidence attribution and traceability",
    "Escalation behavior",
    "Refusal behavior",
    "Boundary enforcement",
    "Human approval requirements",
    "Audit logging",
    "QA packet generation"
  ]) {
    if (!body.categories.some((category) => category.name === requiredCategory)) {
      throw new Error(`QA AAL2 run evidence missing category ${requiredCategory}.`);
    }
  }

  if (!Array.isArray(body.boundaryChecks) || !body.boundaryChecks.some((check) => check.check === "No PHI entered system")) {
    throw new Error("QA AAL2 run evidence expected no-PHI boundary check.");
  }

  if (!Array.isArray(body.remainingBlockers) || !body.remainingBlockers.some((blocker) => blocker.includes("Fresh human AAL2"))) {
    throw new Error("QA AAL2 run evidence expected human AAL2 blocker.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serialized)) {
    throw new Error("QA AAL2 run evidence response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serialized)) {
    throw new Error("QA AAL2 run evidence response must not contain bearer-token material.");
  }

  const brief = await request("/api/qa-evidence/aal2-run-evidence/brief");
  requireStatus("QA AAL2 run evidence brief", brief.response.status, 200);
  requireContentType("QA AAL2 run evidence brief", brief.response, "text/markdown");
  requireQaAal2RunEvidenceBoundary("QA AAL2 run evidence brief", brief.response);

  if (!brief.body.text.includes("SCRIMED AAL2 Synthetic QA Run Evidence Package")) {
    throw new Error("QA AAL2 run evidence brief missing heading.");
  }

  if (!brief.body.text.includes("NO-GO-buyer-proof-release")) {
    throw new Error("QA AAL2 run evidence brief missing NO-GO recommendation.");
  }

  if (!brief.body.text.includes("Clinical summary generation")) {
    throw new Error("QA AAL2 run evidence brief missing clinical summary category.");
  }

  console.log("pass QA AAL2 run evidence");
}

async function checkClinicalCareActivation() {
  const result = await request("/api/clinical-care-activation");
  requireStatus("Clinical care activation", result.response.status, 200);
  requireContentType("Clinical care activation", result.response, "application/json");
  requireSyntheticBoundary("Clinical care activation", result.response);
  requireNoClinicalCareAuthority("Clinical care activation", result.response);
  const body = requireJson("Clinical care activation", result.body);

  if (body.service !== "scrimed-clinical-care-activation") {
    throw new Error(`Clinical care activation expected service scrimed-clinical-care-activation but received ${body.service}.`);
  }

  if (body.status !== "clinical-care-activation-gated") {
    throw new Error(`Clinical care activation expected clinical-care-activation-gated but received ${body.status}.`);
  }

  if (body.careExecutionAuthority !== "not-authorized-live-care") {
    throw new Error("Clinical care activation must not authorize live clinical care.");
  }

  if (body.proofStackStatus !== "clinical-care-activation-readiness-gated") {
    throw new Error("Clinical care activation missing proof-stack status.");
  }

  if (!Array.isArray(body.gates) || body.gates.length < 12) {
    throw new Error("Clinical care activation expected at least twelve hard gates.");
  }

  if (!Array.isArray(body.blockedCapabilities) || !body.blockedCapabilities.includes("live diagnosis")) {
    throw new Error("Clinical care activation expected live diagnosis to remain blocked.");
  }

  if (body.readinessScore >= 100) {
    throw new Error("Clinical care activation must not report full clinical readiness.");
  }

  const brief = await request("/api/clinical-care-activation/brief");
  requireStatus("Clinical care activation brief", brief.response.status, 200);
  requireContentType("Clinical care activation brief", brief.response, "text/markdown");
  requireSyntheticBoundary("Clinical care activation brief", brief.response);
  requireNoClinicalCareAuthority("Clinical care activation brief", brief.response);

  if (!brief.body.text.includes("Care execution authority: not-authorized-live-care")) {
    throw new Error("Clinical care activation brief must preserve no-live-care authority.");
  }

  console.log("pass clinical care activation");
}

async function checkPublicMarketReadiness() {
  const result = await request("/api/public-market-readiness");
  requireStatus("Public Market Readiness", result.response.status, 200);
  requireContentType("Public Market Readiness", result.response, "application/json");
  requirePublicMarketBoundary("Public Market Readiness", result.response);
  const body = requireJson("Public Market Readiness", result.body);

  if (body.service !== "scrimed-public-market-readiness") {
    throw new Error(`Public Market Readiness expected scrimed-public-market-readiness but received ${body.service}.`);
  }

  if (body.status !== "capital-efficiency-kpi-stack-ready") {
    throw new Error(`Public Market Readiness expected capital-efficiency-kpi-stack-ready but received ${body.status}.`);
  }

  if (!Array.isArray(body.operatingMetrics) || body.operatingMetrics.length < 10) {
    throw new Error("Public Market Readiness expected at least ten operating metric definitions.");
  }

  if (!body.operatingMetrics.some((metric) => metric.id === "cost-per-workflow")) {
    throw new Error("Public Market Readiness missing cost per workflow KPI.");
  }

  if (!body.operatingMetrics.some((metric) => metric.id === "revenue-protected")) {
    throw new Error("Public Market Readiness missing revenue protected KPI.");
  }

  if (!Array.isArray(body.modelEfficiencyControls) || body.modelEfficiencyControls.length < 4) {
    throw new Error("Public Market Readiness expected model efficiency controls.");
  }

  if (
    body.protectedOperatorMetricStatus !==
    "aal2-protected-operator-metric-capture-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected operator metric status.");
  }

  if (
    body.protectedOperatorMetricApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/operator-metrics"
  ) {
    throw new Error("Public Market Readiness missing protected operator metric API route.");
  }

  if (
    body.protectedMetricRollupStatus !==
    "aal2-finance-reviewed-metric-rollups-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected metric rollup status.");
  }

  if (
    body.protectedMetricRollupApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/metric-rollups"
  ) {
    throw new Error("Public Market Readiness missing protected metric rollup API route.");
  }

  if (
    body.protectedMetricRollupPacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/metric-rollups/{snapshotId}/packet"
  ) {
    throw new Error("Public Market Readiness missing protected metric rollup packet API route.");
  }

  if (
    body.protectedMetricTrendStatus !==
    "aal2-board-trend-review-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected metric trend status.");
  }

  if (
    body.protectedMetricTrendApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/metric-trends"
  ) {
    throw new Error("Public Market Readiness missing protected metric trend API route.");
  }

  if (
    body.protectedMetricTrendPacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/metric-trends/{reviewId}/packet"
  ) {
    throw new Error("Public Market Readiness missing protected metric trend packet API route.");
  }

  if (
    body.protectedBoardScorecardStatus !==
    "aal2-rolling-quarter-board-scorecards-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected board scorecard status.");
  }

  if (
    body.protectedBoardScorecardApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/board-scorecards"
  ) {
    throw new Error("Public Market Readiness missing protected board scorecard API route.");
  }

  if (
    body.protectedBoardScorecardPacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/board-scorecards/{scorecardId}/packet"
  ) {
    throw new Error("Public Market Readiness missing protected board scorecard packet API route.");
  }

  if (
    body.protectedFinanceMethodologyStatus !==
    "aal2-finance-methodology-gates-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected finance methodology status.");
  }

  if (
    body.protectedFinanceMethodologyApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/finance-methodology"
  ) {
    throw new Error("Public Market Readiness missing protected finance methodology API route.");
  }

  if (
    body.protectedFinanceMethodologyPacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/finance-methodology/packet"
  ) {
    throw new Error("Public Market Readiness missing protected finance methodology packet API route.");
  }

  if (
    body.protectedExternalApprovalEvidenceStatus !==
    "aal2-qualified-external-approval-evidence-links-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected external approval evidence status.");
  }

  if (
    body.protectedExternalApprovalEvidenceApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/external-approval-evidence"
  ) {
    throw new Error("Public Market Readiness missing protected external approval evidence API route.");
  }

  if (
    body.protectedExternalApprovalEvidencePacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/external-approval-evidence/packet"
  ) {
    throw new Error("Public Market Readiness missing protected external approval evidence packet API route.");
  }

  if (
    body.protectedReleaseDecisionStatus !==
    "aal2-qualified-release-decision-workflow-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected release decision workflow status.");
  }

  if (
    body.protectedReleaseDecisionApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/release-decisions"
  ) {
    throw new Error("Public Market Readiness missing protected release decision API route.");
  }

  if (
    body.protectedReleaseDecisionPacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/release-decisions/packet"
  ) {
    throw new Error("Public Market Readiness missing protected release decision packet API route.");
  }

  if (
    body.protectedNamedReviewerSignoffStatus !==
    "aal2-named-reviewer-signoff-metadata-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected named reviewer sign-off status.");
  }

  if (
    body.protectedNamedReviewerSignoffApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/reviewer-signoffs"
  ) {
    throw new Error("Public Market Readiness missing protected named reviewer sign-off API route.");
  }

  if (
    body.protectedNamedReviewerSignoffPacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/reviewer-signoffs/packet"
  ) {
    throw new Error("Public Market Readiness missing protected named reviewer sign-off packet API route.");
  }

  if (
    body.protectedDistributionLockboxStatus !==
    "aal2-external-distribution-lockbox-disabled-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected distribution lockbox status.");
  }

  if (
    body.protectedDistributionLockboxApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/distribution-lockbox"
  ) {
    throw new Error("Public Market Readiness missing protected distribution lockbox API route.");
  }

  if (
    body.protectedDistributionLockboxPacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/distribution-lockbox/packet"
  ) {
    throw new Error("Public Market Readiness missing protected distribution lockbox packet API route.");
  }

  if (
    body.protectedReleaseAuthorityAttestationStatus !==
    "aal2-external-release-authority-attestations-disabled-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected release authority attestation status.");
  }

  if (
    body.protectedReleaseAuthorityAttestationApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/release-authority-attestations"
  ) {
    throw new Error("Public Market Readiness missing protected release authority attestation API route.");
  }

  if (
    body.protectedReleaseAuthorityAttestationPacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/release-authority-attestations/packet"
  ) {
    throw new Error(
      "Public Market Readiness missing protected release authority attestation packet API route."
    );
  }

  if (
    body.protectedEvidenceRoomRecipientAttestationStatus !==
    "aal2-evidence-room-recipient-attestations-disabled-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected evidence-room recipient attestation status.");
  }

  if (
    body.protectedEvidenceRoomRecipientAttestationApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/evidence-room-recipient-attestations"
  ) {
    throw new Error("Public Market Readiness missing protected evidence-room recipient attestation API route.");
  }

  if (
    body.protectedEvidenceRoomRecipientAttestationPacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/evidence-room-recipient-attestations/packet"
  ) {
    throw new Error(
      "Public Market Readiness missing protected evidence-room recipient attestation packet API route."
    );
  }

  if (
    body.protectedEvidenceRoomAccessLogReconciliationStatus !==
    "aal2-evidence-room-access-log-reconciliation-disabled-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected evidence-room access-log reconciliation status.");
  }

  if (
    body.protectedEvidenceRoomAccessLogReconciliationApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/evidence-room-access-log-reconciliation"
  ) {
    throw new Error(
      "Public Market Readiness missing protected evidence-room access-log reconciliation API route."
    );
  }

  if (
    body.protectedEvidenceRoomAccessLogReconciliationPacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/evidence-room-access-log-reconciliation/packet"
  ) {
    throw new Error(
      "Public Market Readiness missing protected evidence-room access-log reconciliation packet API route."
    );
  }

  if (
    body.protectedEvidenceRoomProviderAdapterStatus !==
    "aal2-evidence-room-provider-adapter-contracts-disabled-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected evidence-room provider adapter status.");
  }

  if (
    body.protectedEvidenceRoomProviderAdapterApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/evidence-room-provider-adapters"
  ) {
    throw new Error("Public Market Readiness missing protected evidence-room provider adapter API route.");
  }

  if (
    body.protectedEvidenceRoomProviderAdapterPacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/evidence-room-provider-adapters/packet"
  ) {
    throw new Error(
      "Public Market Readiness missing protected evidence-room provider adapter packet API route."
    );
  }

  if (
    body.protectedProviderSecurityReviewStatus !==
    "aal2-provider-security-review-workbench-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected provider security review status.");
  }

  if (
    body.protectedProviderSecurityReviewApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/provider-security-reviews"
  ) {
    throw new Error("Public Market Readiness missing protected provider security review API route.");
  }

  if (
    body.protectedProviderSecurityReviewPacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/provider-security-reviews/packet"
  ) {
    throw new Error(
      "Public Market Readiness missing protected provider security review packet API route."
    );
  }

  if (
    body.protectedProcurementEvidenceRegistryStatus !==
    "aal2-procurement-evidence-registry-no-sensitive-artifacts"
  ) {
    throw new Error("Public Market Readiness missing protected procurement evidence registry status.");
  }

  if (
    body.protectedProcurementEvidenceRegistryApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/procurement-evidence"
  ) {
    throw new Error("Public Market Readiness missing protected procurement evidence registry API route.");
  }

  if (
    body.protectedProcurementEvidenceRegistryPacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/procurement-evidence/packet"
  ) {
    throw new Error(
      "Public Market Readiness missing protected procurement evidence registry packet API route."
    );
  }

  const brief = await request("/api/public-market-readiness/brief");
  requireStatus("Public Market Readiness brief", brief.response.status, 200);
  requireContentType("Public Market Readiness brief", brief.response, "text/markdown");
  requirePublicMarketBoundary("Public Market Readiness brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Public Market Readiness Brief")) {
    throw new Error("Public Market Readiness brief missing heading.");
  }

  if (!brief.body.text.includes("not audited financial reporting")) {
    throw new Error("Public Market Readiness brief missing financial boundary.");
  }

  console.log("pass public market readiness");
}

async function checkGlobalReach() {
  const result = await request("/api/global-reach");
  requireStatus("Global Reach", result.response.status, 200);
  requireContentType("Global Reach", result.response, "application/json");
  requireGlobalReachBoundary("Global Reach", result.response);
  const body = requireJson("Global Reach", result.body);

  if (body.service !== "scrimed-global-partner-localization") {
    throw new Error(`Global Reach expected scrimed-global-partner-localization but received ${body.service}.`);
  }

  if (body.status !== "global-partner-localization-layer-ready") {
    throw new Error(`Global Reach expected global-partner-localization-layer-ready but received ${body.status}.`);
  }

  if (!Array.isArray(body.regions) || body.regions.length < 8) {
    throw new Error("Global Reach expected at least eight region focus packs.");
  }

  if (!Array.isArray(body.buyerPacks) || body.buyerPacks.length < 7) {
    throw new Error("Global Reach expected at least seven buyer localization packs.");
  }

  if (!Array.isArray(body.boundaryResolutions) || body.boundaryResolutions.length < 8) {
    throw new Error("Global Reach expected boundary resolution coverage.");
  }

  if (!body.boundaryResolutions.every((resolution) => resolution.status === "contained-with-workaround")) {
    throw new Error("Global Reach expected all known boundaries to be contained with workarounds.");
  }

  if (!Array.isArray(body.competitiveEdges) || body.competitiveEdges.length < 5) {
    throw new Error("Global Reach expected at least five competitive edge pillars.");
  }

  const brief = await request("/api/global-reach/brief");
  requireStatus("Global Reach brief", brief.response.status, 200);
  requireContentType("Global Reach brief", brief.response, "text/markdown");
  requireGlobalReachBoundary("Global Reach brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Global Partner And Buyer Localization Brief")) {
    throw new Error("Global Reach brief missing heading.");
  }

  if (!brief.body.text.includes("not legal advice")) {
    throw new Error("Global Reach brief missing legal boundary.");
  }

  console.log("pass global reach");
}

async function checkBoundaryResolution() {
  const result = await request("/api/boundary-resolution");
  requireStatus("Boundary Resolution Register", result.response.status, 200);
  requireContentType("Boundary Resolution Register", result.response, "application/json");
  requireBoundaryResolutionBoundary("Boundary Resolution Register", result.response);
  const body = requireJson("Boundary Resolution Register", result.body);

  if (body.service !== "scrimed-boundary-resolution-register") {
    throw new Error(`Boundary Resolution expected scrimed-boundary-resolution-register but received ${body.service}.`);
  }

  if (body.status !== "boundary-resolution-register-active") {
    throw new Error(`Boundary Resolution expected active status but received ${body.status}.`);
  }

  if (
    body.proofStackStatus !==
    "cross-system-boundary-resolution-register-no-authority-claim"
  ) {
    throw new Error("Boundary Resolution missing proof-stack status.");
  }

  if (!Array.isArray(body.records) || body.records.length < 25) {
    throw new Error("Boundary Resolution expected broad cross-system boundary coverage.");
  }

  if (!body.records.some((record) => record.state === "human-aal2-required")) {
    throw new Error("Boundary Resolution expected human AAL2 required gates.");
  }

  if (!body.records.some((record) => record.category === "clinical-authority")) {
    throw new Error("Boundary Resolution expected clinical authority records.");
  }

  if (!body.records.some((record) => record.category === "qa-evidence")) {
    throw new Error("Boundary Resolution expected QA evidence records.");
  }

  if (!body.operatingRules?.some((rule) => rule.includes("Do not enter PHI"))) {
    throw new Error("Boundary Resolution expected PHI operating rule.");
  }

  const brief = await request("/api/boundary-resolution/brief");
  requireStatus("Boundary Resolution brief", brief.response.status, 200);
  requireContentType("Boundary Resolution brief", brief.response, "text/markdown");
  requireBoundaryResolutionBoundary("Boundary Resolution brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Boundary Resolution Register Brief")) {
    throw new Error("Boundary Resolution brief missing heading.");
  }

  if (!brief.body.text.includes("does not authorize live clinical care")) {
    throw new Error("Boundary Resolution brief missing no-authority boundary.");
  }

  console.log("pass boundary resolution register");
}

async function checkApprovalsReadiness() {
  const result = await request("/api/approvals-readiness");
  requireStatus("Approvals Readiness", result.response.status, 200);
  requireContentType("Approvals Readiness", result.response, "application/json");
  requireApprovalsReadinessBoundary("Approvals Readiness", result.response);
  const body = requireJson("Approvals Readiness", result.body);

  if (body.service !== "scrimed-approvals-readiness") {
    throw new Error(`Approvals Readiness expected scrimed-approvals-readiness but received ${body.service}.`);
  }

  if (body.status !== "approvals-readiness-operating-ladder-active") {
    throw new Error(`Approvals Readiness expected operating ladder status but received ${body.status}.`);
  }

  if (body.authorizationStatus !== "public-operations-only-no-regulated-approval") {
    throw new Error("Approvals Readiness must preserve no-regulated-approval authorization status.");
  }

  if (body.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Approvals Readiness must keep PHI authority blocked.");
  }

  if (body.securityCertification !== "not-security-certified") {
    throw new Error("Approvals Readiness must preserve not-security-certified posture.");
  }

  if (body.regulatoryAuthority !== "external-review-required") {
    throw new Error("Approvals Readiness must keep regulatory authority externally reviewed.");
  }

  if (!Array.isArray(body.tracks) || body.tracks.length < 7) {
    throw new Error("Approvals Readiness expected at least seven approval tracks.");
  }

  if (!body.tracks.some((track) => track.key === "fda-cds-samd-classification")) {
    throw new Error("Approvals Readiness expected FDA/CDS/SaMD classification track.");
  }

  if (!body.tracks.some((track) => track.key === "hipaa-baa-security-rule")) {
    throw new Error("Approvals Readiness expected HIPAA/BAA track.");
  }

  if (!Array.isArray(body.agentControls) || body.agentControls.length < 5) {
    throw new Error("Approvals Readiness expected approval-aware agent controls.");
  }

  if (!Array.isArray(body.processes) || body.processes.length < 5) {
    throw new Error("Approvals Readiness expected approval processes.");
  }

  const brief = await request("/api/approvals-readiness/brief");
  requireStatus("Approvals Readiness brief", brief.response.status, 200);
  requireContentType("Approvals Readiness brief", brief.response, "text/markdown");
  requireApprovalsReadinessBoundary("Approvals Readiness brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Approvals Readiness Brief")) {
    throw new Error("Approvals Readiness brief missing heading.");
  }

  if (!brief.body.text.includes("not legal advice")) {
    throw new Error("Approvals Readiness brief missing legal boundary.");
  }

  if (!brief.body.text.includes("FDA clearance")) {
    throw new Error("Approvals Readiness brief missing FDA boundary.");
  }

  console.log("pass approvals readiness");
}

async function checkReleaseContinuity() {
  const result = await request("/api/release-continuity");
  requireStatus("Release Continuity", result.response.status, 200);
  requireContentType("Release Continuity", result.response, "application/json");
  requireReleaseContinuityBoundary("Release Continuity", result.response);
  const body = requireJson("Release Continuity", result.body);

  if (body.service !== "scrimed-release-continuity") {
    throw new Error(`Release Continuity expected scrimed-release-continuity but received ${body.service}.`);
  }

  if (body.status !== "release-continuity-checkpointed-aal2-boundary") {
    throw new Error(`Release Continuity expected checkpointed status but received ${body.status}.`);
  }

  if (body.authorizationStatus !== "public-release-evidence-only-protected-aal2-required") {
    throw new Error("Release Continuity must preserve protected AAL2 authorization boundary.");
  }

  if (body.tokenHandling !== "no-token-values-exposed-or-retained") {
    throw new Error("Release Continuity must preserve no-token exposure boundary.");
  }

  if (body.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Release Continuity must keep PHI authority blocked.");
  }

  if (body.releaseAuthority !== "not-release-approval") {
    throw new Error("Release Continuity must not create release authority.");
  }

  if (!Array.isArray(body.gates) || body.gates.length < 5) {
    throw new Error("Release Continuity expected at least five gates.");
  }

  if (!body.gates.some((gate) => gate.key === "protected-aal2-happy-path")) {
    throw new Error("Release Continuity expected protected AAL2 happy-path gate.");
  }

  if (!body.gates.some((gate) => gate.key === "secret-handling")) {
    throw new Error("Release Continuity expected secret-handling gate.");
  }

  if (!Array.isArray(body.checks) || body.checks.length < 6) {
    throw new Error("Release Continuity expected release checks.");
  }

  const brief = await request("/api/release-continuity/brief");
  requireStatus("Release Continuity brief", brief.response.status, 200);
  requireContentType("Release Continuity brief", brief.response, "text/markdown");
  requireReleaseContinuityBoundary("Release Continuity brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Release Continuity Brief")) {
    throw new Error("Release Continuity brief missing heading.");
  }

  if (!brief.body.text.includes("not release approval")) {
    throw new Error("Release Continuity brief missing release boundary.");
  }

  if (!brief.body.text.includes("does not mint tokens")) {
    throw new Error("Release Continuity brief missing token boundary.");
  }

  console.log("pass release continuity");
}

async function checkNavigationAudit() {
  const result = await request("/api/navigation-audit");
  requireStatus("Navigation Audit", result.response.status, 200);
  requireContentType("Navigation Audit", result.response, "application/json");
  requireNavigationAuditBoundary("Navigation Audit", result.response);
  const body = requireJson("Navigation Audit", result.body);

  if (body.service !== "scrimed-navigation-audit") {
    throw new Error(`Navigation Audit expected scrimed-navigation-audit but received ${body.service}.`);
  }

  if (body.status !== "route-navigation-audit-active") {
    throw new Error(`Navigation Audit expected active status but received ${body.status}.`);
  }

  if (body.coverage?.protectedCoverageStatus !== "fail-closed-publicly-aal2-required-for-happy-path") {
    throw new Error("Navigation Audit must preserve protected fail-closed and AAL2 boundary status.");
  }

  if (body.coverage?.releaseAuthority !== "not-release-approval") {
    throw new Error("Navigation Audit must not create release authority.");
  }

  if (body.coverage?.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Navigation Audit must keep PHI authority blocked.");
  }

  if (!Array.isArray(body.groups) || body.groups.length < 8) {
    throw new Error("Navigation Audit expected at least eight route groups.");
  }

  if (!Array.isArray(body.pageRouteInventory) || !body.pageRouteInventory.includes("/navigation")) {
    throw new Error("Navigation Audit expected /navigation in page route inventory.");
  }

  if (!body.pageRouteInventory.includes("/service-reliability")) {
    throw new Error("Navigation Audit expected /service-reliability in page route inventory.");
  }

  if (!Array.isArray(body.smokeCoveredHtmlRoutes) || !body.smokeCoveredHtmlRoutes.includes("/navigation")) {
    throw new Error("Navigation Audit expected /navigation in smoke-covered HTML routes.");
  }

  if (!body.smokeCoveredHtmlRoutes.includes("/service-reliability")) {
    throw new Error("Navigation Audit expected /service-reliability in smoke-covered HTML routes.");
  }

  if (!Array.isArray(body.bottlenecks) || !body.bottlenecks.some((bottleneck) => bottleneck.status === "operator-required")) {
    throw new Error("Navigation Audit expected an operator-required AAL2 bottleneck.");
  }

  const sourcePageRouteCount = await countRouteFiles("app", "page.tsx");
  const sourceApiRoutePatternCount = await countRouteFiles("app/api", "route.ts");

  if (body.sourceTotals?.pageRouteCount !== sourcePageRouteCount) {
    throw new Error(`Navigation Audit page route count mismatch. API reported ${body.sourceTotals?.pageRouteCount}; source has ${sourcePageRouteCount}.`);
  }

  if (body.sourceTotals?.apiRoutePatternCount !== sourceApiRoutePatternCount) {
    throw new Error(`Navigation Audit API route count mismatch. API reported ${body.sourceTotals?.apiRoutePatternCount}; source has ${sourceApiRoutePatternCount}.`);
  }

  const brief = await request("/api/navigation-audit/brief");
  requireStatus("Navigation Audit brief", brief.response.status, 200);
  requireContentType("Navigation Audit brief", brief.response, "text/markdown");
  requireNavigationAuditBoundary("Navigation Audit brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Navigation Audit Brief")) {
    throw new Error("Navigation Audit brief missing heading.");
  }

  if (!brief.body.text.includes("not release approval")) {
    throw new Error("Navigation Audit brief missing release boundary.");
  }

  console.log("pass navigation audit");
}

async function checkServiceReliability() {
  const result = await request("/api/service-reliability");
  requireStatus("Service Reliability", result.response.status, 200);
  requireContentType("Service Reliability", result.response, "application/json");
  requireServiceReliabilityBoundary("Service Reliability", result.response);
  const body = requireJson("Service Reliability", result.body);

  if (body.service !== "scrimed-service-reliability") {
    throw new Error(`Service Reliability expected scrimed-service-reliability but received ${body.service}.`);
  }

  if (body.status !== "service-reliability-hardening-active") {
    throw new Error(`Service Reliability expected active status but received ${body.status}.`);
  }

  if (body.authority?.releaseAuthority !== "not-release-approval") {
    throw new Error("Service Reliability must not create release authority.");
  }

  if (body.authority?.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Service Reliability must keep PHI authority blocked.");
  }

  if (!Array.isArray(body.productServiceControls) || body.productServiceControls.length < 10) {
    throw new Error("Service Reliability expected product/service control coverage.");
  }

  if (!Array.isArray(body.faultClasses) || body.faultClasses.length < 8) {
    throw new Error("Service Reliability expected fault-class coverage.");
  }

  if (!Array.isArray(body.efficiencyImprovements) || body.efficiencyImprovements.length < 6) {
    throw new Error("Service Reliability expected efficiency-improvement coverage.");
  }

  if (!body.operatorRequiredControlCount) {
    throw new Error("Service Reliability expected an operator-required control.");
  }

  if (!body.externalReviewControlCount) {
    throw new Error("Service Reliability expected external-review controls.");
  }

  if (!body.protectedGateControlCount) {
    throw new Error("Service Reliability expected protected-gated controls.");
  }

  const sourcePageRouteCount = await countRouteFiles("app", "page.tsx");
  const sourceApiRoutePatternCount = await countRouteFiles("app/api", "route.ts");

  if (body.sourceAlignment?.pageRouteCount !== sourcePageRouteCount) {
    throw new Error(`Service Reliability page route count mismatch. API reported ${body.sourceAlignment?.pageRouteCount}; source has ${sourcePageRouteCount}.`);
  }

  if (body.sourceAlignment?.apiRoutePatternCount !== sourceApiRoutePatternCount) {
    throw new Error(`Service Reliability API route count mismatch. API reported ${body.sourceAlignment?.apiRoutePatternCount}; source has ${sourceApiRoutePatternCount}.`);
  }

  const brief = await request("/api/service-reliability/brief");
  requireStatus("Service Reliability brief", brief.response.status, 200);
  requireContentType("Service Reliability brief", brief.response, "text/markdown");
  requireServiceReliabilityBoundary("Service Reliability brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Service Reliability Brief")) {
    throw new Error("Service Reliability brief missing heading.");
  }

  if (!brief.body.text.includes("not release approval")) {
    throw new Error("Service Reliability brief missing release boundary.");
  }

  console.log("pass service reliability");
}

async function checkClinicalAuthorityReadiness() {
  const result = await request("/api/clinical-authority-readiness");
  requireStatus("Clinical Authority Readiness", result.response.status, 200);
  requireContentType("Clinical Authority Readiness", result.response, "application/json");
  requireClinicalAuthorityBoundary("Clinical Authority Readiness", result.response);
  const body = requireJson("Clinical Authority Readiness", result.body);

  if (body.service !== "scrimed-clinical-authority-readiness") {
    throw new Error(`Clinical Authority Readiness expected scrimed-clinical-authority-readiness but received ${body.service}.`);
  }

  if (body.status !== "clinical-authority-readiness-hard-gates-contained") {
    throw new Error(`Clinical Authority Readiness expected hard-gates-contained status but received ${body.status}.`);
  }

  if (body.authorizationStatus !== "not-authorized-live-clinical-care") {
    throw new Error("Clinical Authority Readiness must remain not authorized for live clinical care.");
  }

  if (body.phiStatus !== "not-authorized-production-phi-processing") {
    throw new Error("Clinical Authority Readiness must remain not authorized for production PHI processing.");
  }

  if (body.reimbursementStatus !== "no-reimbursement-guarantee") {
    throw new Error("Clinical Authority Readiness must preserve no reimbursement guarantee.");
  }

  if (body.securityCertificationStatus !== "not-security-certified") {
    throw new Error("Clinical Authority Readiness must preserve not-security-certified posture.");
  }

  if (!Array.isArray(body.domains) || body.domains.length < 8) {
    throw new Error("Clinical Authority Readiness expected at least eight authority domains.");
  }

  if (!Array.isArray(body.boundaryResolutions) || body.boundaryResolutions.length < 7) {
    throw new Error("Clinical Authority Readiness expected boundary resolutions.");
  }

  if (!body.boundaryResolutions.every((resolution) => resolution.status === "contained-with-workaround")) {
    throw new Error("Clinical Authority Readiness expected all boundary resolutions contained with workarounds.");
  }

  if (!Array.isArray(body.sourceReferences) || body.sourceReferences.length < 6) {
    throw new Error("Clinical Authority Readiness expected source references.");
  }

  const brief = await request("/api/clinical-authority-readiness/brief");
  requireStatus("Clinical Authority Readiness brief", brief.response.status, 200);
  requireContentType("Clinical Authority Readiness brief", brief.response, "text/markdown");
  requireClinicalAuthorityBoundary("Clinical Authority Readiness brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Clinical Authority Readiness Brief")) {
    throw new Error("Clinical Authority Readiness brief missing heading.");
  }

  if (!brief.body.text.includes("not legal advice")) {
    throw new Error("Clinical Authority Readiness brief missing legal boundary.");
  }

  if (!brief.body.text.includes("not live clinical authorization")) {
    throw new Error("Clinical Authority Readiness brief missing clinical authority boundary.");
  }

  console.log("pass clinical authority readiness");
}

async function checkProtectedFailClosed(path, label) {
  const result = await request(path);
  requireStatus(label, result.response.status, [401, 503]);
  requireContentType(label, result.response, "application/json");
  requireSyntheticBoundary(label, result.response);
  console.log(`pass ${label} fail-closed: ${result.response.status} ${result.response.statusText}`);
}

async function checkProtectedPostFailClosed(path, label, payload) {
  const result = await postJson(path, payload);
  requireStatus(label, result.response.status, [401, 503]);
  requireContentType(label, result.response, "application/json");
  requireSyntheticBoundary(label, result.response);
  console.log(`pass ${label} fail-closed: ${result.response.status} ${result.response.statusText}`);
}

async function checkSalesProtectedFailClosed(path, label) {
  const result = await request(path);
  requireStatus(label, result.response.status, [401, 503]);
  requireContentType(label, result.response, "application/json");
  requireSalesBoundary(label, result.response);
  console.log(`pass ${label} fail-closed: ${result.response.status} ${result.response.statusText}`);
}

await checkHtml("/pilot-workspace/access");
await checkHtml("/sales-operations");
await checkHtml("/competitive-edge");
await checkHtml("/pilot-deal-room");
await checkHtml("/qa-evidence");
await checkHtml("/clinical-authority-readiness");
await checkHtml("/clinical-care-activation");
await checkHtml("/public-market-readiness");
await checkHtml("/global-reach");
await checkHtml("/boundary-resolution");
await checkHtml("/approvals-readiness");
await checkHtml("/release-continuity");
await checkHtml("/navigation");
await checkHtml("/service-reliability");
await checkHtml("/qa-execution-readiness");
await checkHtml("/qa-run-control");
await checkHtml("/qa-launch-kit");
await checkHtml("/qa-human-run-packet");
await checkHtml("/qa-completion-bridge");
await checkHtml("/qa-claim-guard");
await checkHtml("/qa-activation-seal");
await checkHtml("/qa-proof-promotion");
await checkHtml("/qa-buyer-proof-release");
await checkHtml("/buyer-release-control-run");
await checkHtml("/qa-manual-execution-console");
await checkHtml("/qa-aal2-run-evidence");
await checkReleaseContinuity();
await checkNavigationAudit();
await checkServiceReliability();
await checkApprovalsReadiness();
await checkClinicalAuthorityReadiness();
await checkClinicalCareActivation();
await checkPublicMarketReadiness();
await checkGlobalReach();
await checkBoundaryResolution();
await checkProductConsole();
await checkReadiness();
await checkCompetitiveEdgeApi();
await checkPilotDealRoomApi();
await checkQaEvidenceLedger();
await checkQaExecutionReadiness();
await checkQaRunControl();
await checkQaLaunchKit();
await checkQaHumanRunPacket();
await checkQaCompletionBridge();
await checkQaClaimGuard();
await checkQaActivationSeal();
await checkQaProofPromotion();
await checkQaBuyerProofRelease();
await checkBuyerReleaseControlRun();
await checkQaManualExecutionConsole();
await checkQaAal2RunEvidence();
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/deal-room-packet",
  "Sales deal-room packet protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/command-center",
  "Sales Command Center protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/workspace-provisioning",
  "Sales workspace provisioning protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/workspace-provisioning/packet",
  "Sales workspace provisioning packet protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/tenant-lifecycle",
  "Sales buyer tenant lifecycle protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/tenant-lifecycle/packet",
  "Sales buyer tenant lifecycle packet protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/production-readiness",
  "Sales production readiness protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/production-readiness/packet",
  "Sales production readiness packet protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/activation-approvals",
  "Sales customer activation approvals protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/activation-approvals/packet",
  "Sales customer activation approval packet protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/buyer-diligence",
  "Sales buyer diligence room protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/buyer-diligence/packet",
  "Sales buyer diligence packet protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/evidence-vault-readiness",
  "Sales secure evidence vault readiness protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/evidence-vault-readiness/packet",
  "Sales secure evidence vault readiness packet protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/demo-execution",
  "Sales buyer demo execution protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/demo-execution/brief",
  "Sales buyer demo execution brief protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/demo-sessions",
  "Sales buyer demo sessions protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/demo-sessions/00000000-0000-0000-0000-000000000000/packet",
  "Sales buyer demo session packet protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/qa/buyer-demo-sessions",
  "Sales buyer demo session QA protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/demo-readiness`,
  "Demo readiness snapshots protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/buyer-room`,
  "Buyer Pilot Room protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/command-intelligence`,
  "Command Intelligence Hub protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/command-intelligence/00000000-0000-0000-0000-000000000000/packet`,
  "Command Intelligence packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/clinical-activation-dossier`,
  "Clinical Activation Dossier protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/clinical-activation-dossier/packet`,
  "Clinical Activation Dossier packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/clinical-activation-approvals`,
  "Clinical Activation Approval Workflow protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/clinical-activation-approvals`,
  "Clinical Activation Approval Workflow write protected API",
  {
    domainId: "clinical-governance-safety",
    attestation: "aal2-readiness-attestation-no-phi"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/clinical-activation-approvals/packet`,
  "Clinical Activation Approval Workflow packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/clinical-authority-evidence-room`,
  "Clinical Authority Evidence Room protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/clinical-authority-evidence-room/packet`,
  "Clinical Authority Evidence Room packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/clinical-authority-owner-matrix`,
  "Clinical Authority Owner Matrix protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/clinical-authority-owner-matrix/packet`,
  "Clinical Authority Owner Matrix packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/clinical-authority-artifact-intake`,
  "Clinical Authority Artifact Intake protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/clinical-authority-artifact-intake/packet`,
  "Clinical Authority Artifact Intake packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/authority-artifact-references`,
  "Authority Artifact References protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/authority-artifact-references/renewal-queue`,
  "Authority Artifact References renewal queue protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/authority-artifact-references/packet`,
  "Authority Artifact References packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/operator-metrics`,
  "Protected Operator Metrics protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/operator-metrics`,
  "Protected Operator Metrics write protected API",
  {
    metricKey: "workflow-volume",
    metricValue: 1,
    workflowKey: "smoke.public-market-readiness",
    measurementWindowStart: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    measurementWindowEnd: new Date().toISOString(),
    sourceRoute: "/public-market-readiness",
    evidenceReference: "smoke-no-phi-operator-metric",
    operatorAttestation: "no-phi-finance-readiness-operator-metric",
    dataBoundary: "synthetic-business-workflow-only"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/metric-rollups`,
  "Protected Metric Rollups protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/metric-rollups`,
  "Protected Metric Rollups write protected API",
  {
    reportingPeriodStart: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    reportingPeriodEnd: new Date().toISOString(),
    reviewerAttestation: "finance-reviewed-no-phi-operating-rollup",
    dataBoundary: "synthetic-business-workflow-only",
    reviewNote: "smoke-no-phi-board-rollup"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/metric-rollups/00000000-0000-4000-8000-000000000000/packet`,
  "Protected Metric Rollup packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/metric-trends`,
  "Protected Metric Trends protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/metric-trends`,
  "Protected Metric Trends write protected API",
  {
    currentSnapshotId: "00000000-0000-4000-8000-000000000001",
    comparisonSnapshotId: "00000000-0000-4000-8000-000000000002",
    trendPeriodLabel: "smoke board trend",
    reviewerAttestation: "finance-reviewed-no-phi-board-trend",
    dataBoundary: "synthetic-business-workflow-only",
    costAllocationPolicy: "model-cost-only-finance-allocation-pending",
    reviewNote: "smoke-no-phi-metric-trend"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/metric-trends/00000000-0000-4000-8000-000000000000/packet`,
  "Protected Metric Trend packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/board-scorecards`,
  "Protected Board Scorecards protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/board-scorecards`,
  "Protected Board Scorecards write protected API",
  {
    primaryTrendReviewId: "00000000-0000-4000-8000-000000000001",
    secondaryTrendReviewId: "00000000-0000-4000-8000-000000000002",
    tertiaryTrendReviewId: "00000000-0000-4000-8000-000000000003",
    boardPeriodLabel: "smoke board scorecard",
    buyerSegmentFocus: "multi-segment",
    operatorAttestation: "finance-methodology-pending-no-phi-board-scorecard",
    dataBoundary: "synthetic-business-workflow-only",
    allocationProfileStatus: "finance-allocation-profile-pending",
    reviewNote: "smoke-no-phi-board-scorecard"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/board-scorecards/00000000-0000-4000-8000-000000000000/packet`,
  "Protected Board Scorecard packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/finance-methodology`,
  "Protected Finance Methodology protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/finance-methodology`,
  "Protected Finance Methodology write protected API",
  {
    gateId: "finance-cost-allocation",
    boardScorecardId: "00000000-0000-4000-8000-000000000001",
    attestation: "finance-external-use-gates-no-phi-readiness",
    dataBoundary: "synthetic-business-workflow-only",
    reviewNote: "smoke-no-phi-finance-methodology-gate"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/finance-methodology/packet`,
  "Protected Finance Methodology packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/external-approval-evidence`,
  "Protected External Approval Evidence protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/external-approval-evidence`,
  "Protected External Approval Evidence write protected API",
  {
    domainId: "finance-methodology-policy",
    financeGateRecordId: "00000000-0000-4000-8000-000000000001",
    externalReferenceLabel: "Smoke external approval reference",
    externalSystem: "external-secure-channel",
    referenceLocator: "external-secure-channel:smoke-reference",
    referenceOwner: "qualified external reviewer",
    evidenceRetainedExternally: true,
    attestation: "external-approval-evidence-reference-no-phi",
    dataBoundary: "synthetic-business-workflow-only",
    reviewNote: "smoke metadata-only external approval reference"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/external-approval-evidence/packet`,
  "Protected External Approval Evidence packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/release-decisions`,
  "Protected Release Decisions protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/release-decisions`,
  "Protected Release Decisions write protected API",
  {
    releaseAudience: "buyer-diligence",
    claimCategory: "governance",
    claimVersion: "claims-v1.0.0",
    claimText: "SCRIMED provides governed synthetic pilot evidence for healthcare workflow intelligence review.",
    distributionChannel: "buyer-data-room",
    externalApprovalEvidenceRecordIds: [],
    attestation: "release-decision-claim-registry-no-phi",
    dataBoundary: "synthetic-business-workflow-only",
    reviewNote: "smoke no-phi release decision"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/release-decisions/packet`,
  "Protected Release Decisions packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/reviewer-signoffs`,
  "Protected Named Reviewer Sign-Offs protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/reviewer-signoffs`,
  "Protected Named Reviewer Sign-Offs write protected API",
  {
    reviewerRole: "qualified-counsel",
    releaseDecisionId: "00000000-0000-4000-8000-000000000001",
    reviewerDisplayName: "qualified reviewer",
    reviewerOrganization: "external review channel",
    signoffReferenceLabel: "Smoke named reviewer signoff",
    signoffReferenceLocator: "review-room:claim-signoff",
    artifactScope: "governance claim registry version",
    approvedClaimVersion: "claims-v1.0.0",
    distributionScope: "controlled buyer diligence review",
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    externalSignoffRetained: true,
    attestation: "named-reviewer-signoff-metadata-no-phi",
    dataBoundary: "synthetic-business-workflow-only",
    reviewNote: "smoke metadata-only named reviewer signoff"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/reviewer-signoffs/packet`,
  "Protected Named Reviewer Sign-Offs packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/distribution-lockbox`,
  "Protected Distribution Lockbox protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/distribution-lockbox`,
  "Protected Distribution Lockbox write protected API",
  {
    signoffRecordIds: ["00000000-0000-4000-8000-000000000001"],
    distributionAudience: "buyer-diligence-room",
    distributionChannelControl: "counsel-reviewed-room",
    manifestVersion: "distribution-v1.0.0",
    manifestTitle: "SCRIMED controlled buyer diligence packet",
    artifactManifestLabel: "controlled distribution manifest",
    artifactManifestLocator: "external-lockbox:controlled-manifest",
    customerPermissionReference: "external-permission-channel:retained",
    counselReviewReference: "counsel-review-channel:retained",
    distributionWindowStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    distributionWindowEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    recipientScope: "named buyer diligence reviewers",
    revocationPlan: "revoke access and re-review claims if scope changes",
    externalApprovalsRetained: true,
    distributionDisabled: true,
    attestation: "external-distribution-lockbox-metadata-no-phi",
    dataBoundary: "synthetic-business-workflow-only",
    reviewNote: "smoke metadata-only disabled lockbox"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/distribution-lockbox/packet`,
  "Protected Distribution Lockbox packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/release-authority-attestations`,
  "Protected Release Authority Attestations protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/release-authority-attestations`,
  "Protected Release Authority Attestations write protected API",
  {
    lockboxRecordIds: ["00000000-0000-4000-8000-000000000001"],
    authorityDomain: "qualified-counsel",
    distributionAudience: "buyer-diligence-room",
    releaseAuthorityReferenceLabel: "external release authority attestation",
    releaseAuthorityReferenceLocator: "release-authority-room:attestation",
    authorityOwnerLabel: "external authority owner",
    attestedManifestVersion: "distribution-v1.0.0",
    authorityWindowStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    authorityWindowEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    releaseScope: "controlled buyer diligence release review",
    revocationTrigger: "revoke release scope and re-review authority if audience changes",
    externalAuthorityRetained: true,
    releaseDisabled: true,
    attestation: "external-release-authority-attestation-metadata-no-phi",
    dataBoundary: "synthetic-business-workflow-only",
    reviewNote: "smoke metadata-only release authority reference"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/release-authority-attestations/packet`,
  "Protected Release Authority Attestations packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/evidence-room-recipient-attestations`,
  "Protected Evidence Room Recipient Attestations protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/evidence-room-recipient-attestations`,
  "Protected Evidence Room Recipient Attestations write protected API",
  {
    releaseAuthorityAttestationRecordIds: ["00000000-0000-4000-8000-000000000001"],
    distributionAudience: "buyer-diligence-room",
    recipientSegment: "named-buyer-reviewers",
    recipientScopeLabel: "named buyer diligence reviewer group",
    evidenceRoomReferenceLabel: "external evidence room recipient control",
    evidenceRoomReferenceLocator: "evidence-room:recipient-control",
    packetReferenceLabel: "controlled recipient proof packet",
    packetReferenceLocator: "evidence-room:packet-reference",
    accessWindowStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    accessWindowEnd: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    revocationState: "access-not-issued",
    revocationTrigger: "revoke and re-review evidence room access if scope changes",
    externalRecipientAuthorityRetained: true,
    exportDisabled: true,
    attestation: "evidence-room-recipient-attestation-metadata-no-phi",
    dataBoundary: "synthetic-business-workflow-only",
    reviewNote: "smoke metadata-only recipient attestation"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/evidence-room-recipient-attestations/packet`,
  "Protected Evidence Room Recipient Attestations packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/evidence-room-access-log-reconciliation`,
  "Protected Evidence Room Access Log Reconciliation protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/evidence-room-access-log-reconciliation`,
  "Protected Evidence Room Access Log Reconciliation write protected API",
  {
    recipientAttestationRecordIds: ["00000000-0000-4000-8000-000000000001"],
    distributionAudience: "buyer-diligence-room",
    reconciliationScope: "pre-release-access-log-review",
    externalLogSystemLabel: "external evidence room access ledger",
    accessLogReferenceLabel: "metadata access log reconciliation",
    accessLogReferenceLocator: "evidence-room:access-log-ledger",
    reconciliationWindowStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    reconciliationWindowEnd: new Date().toISOString(),
    observedAccessEventCount: 0,
    expectedRecipientSegmentCount: 1,
    anomalyState: "none-observed",
    revocationExerciseState: "not-issued",
    anomalyEscalationPath: "escalate to governance owner and keep export disabled",
    externalLogAuthorityRetained: true,
    exportDisabled: true,
    attestation: "evidence-room-access-log-reconciliation-metadata-no-phi",
    dataBoundary: "synthetic-business-workflow-only",
    reviewNote: "smoke metadata-only access log reconciliation"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/evidence-room-access-log-reconciliation/packet`,
  "Protected Evidence Room Access Log Reconciliation packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/evidence-room-provider-adapters`,
  "Protected Evidence Room Provider Adapters protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/evidence-room-provider-adapters`,
  "Protected Evidence Room Provider Adapters write protected API",
  {
    accessLogReconciliationRecordIds: ["00000000-0000-4000-8000-000000000001"],
    distributionAudience: "buyer-diligence-room",
    providerClass: "evidence-room-platform",
    integrationMode: "contract-only",
    externalProviderLabel: "qualified external evidence room provider",
    adapterContractReferenceLabel: "provider adapter contract metadata",
    adapterContractReferenceLocator: "provider-adapter:contract-readiness",
    auditLogImportStubLabel: "metadata-only audit log import stub",
    auditLogImportStubLocator: "provider-adapter:audit-log-import-stub",
    supportedAuditLogFormat: "access-review-report",
    verificationCadence: "review before each external release window",
    providerRiskTier: "not-assessed",
    externalProviderAuthorityRetained: true,
    rawLogImportDisabled: true,
    credentialStorageDisabled: true,
    exportDisabled: true,
    attestation: "evidence-room-provider-adapter-contract-metadata-no-phi",
    dataBoundary: "synthetic-business-workflow-only",
    reviewNote: "smoke provider adapter metadata only"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/evidence-room-provider-adapters/packet`,
  "Protected Evidence Room Provider Adapters packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/provider-security-reviews`,
  "Protected Provider Security Reviews protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/provider-security-reviews`,
  "Protected Provider Security Reviews write protected API",
  {
    providerAdapterRecordIds: ["00000000-0000-4000-8000-000000000001"],
    reviewDomain: "security-architecture",
    securityOwnerLabel: "enterprise security review owner",
    privacyOwnerLabel: "enterprise privacy review owner",
    agreementPathLabel: "baa dpa readiness path defined",
    incidentResponsePathLabel: "incident response path defined",
    retentionResidencyPathLabel: "retention residency review path",
    rollbackPlanLabel: "go live rollback plan defined",
    reviewCadence: "review before production connector activation",
    providerSecurityRisk: "not-assessed",
    externalSecurityReviewRetained: true,
    phiProcessingDisabled: true,
    credentialStorageDisabled: true,
    signedAgreementStorageDisabled: true,
    liveIntegrationDisabled: true,
    humanApprovalRequired: true,
    attestation: "provider-security-review-metadata-no-phi",
    dataBoundary: "synthetic-business-workflow-only",
    reviewNote: "smoke security review metadata only"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/provider-security-reviews/packet`,
  "Protected Provider Security Reviews packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/procurement-evidence`,
  "Protected Procurement Evidence Registry protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/procurement-evidence`,
  "Protected Procurement Evidence Registry write protected API",
  {
    providerSecurityReviewRecordIds: ["00000000-0000-4000-8000-000000000001"],
    targetAudience: "provider-health-system",
    procurementDomain: "security-questionnaire",
    evidenceClass: "questionnaire-response-routing",
    procurementOwnerLabel: "enterprise procurement evidence owner",
    buyerSegmentLabel: "health system security procurement reviewer",
    externalSystemLabel: "qualified external diligence system",
    evidenceRoutingLabel: "metadata only evidence routing label",
    evidenceRoutingLocator: "external-system:procurement-evidence-room",
    responseCadence: "review before buyer diligence response",
    procurementRiskTier: "not-assessed",
    securityQuestionnaireRetainedExternally: true,
    socReportRetainedExternally: true,
    pentestReportRetainedExternally: true,
    signedLegalArtifactsRetainedExternally: true,
    credentialStorageDisabled: true,
    phiProcessingDisabled: true,
    confidentialAnswerStorageDisabled: true,
    humanApprovalRequired: true,
    externalDistributionDisabled: true,
    attestation: "procurement-evidence-routing-metadata-no-sensitive-artifacts",
    dataBoundary: "synthetic-business-workflow-only",
    reviewNote: "smoke procurement routing metadata only"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/procurement-evidence/packet`,
  "Protected Procurement Evidence Registry packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/buyer-room/packet`,
  "Buyer Diligence Export protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/buyer-release-control-run`,
  "Protected Buyer Release Control verifier protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/buyer-release-control-run/packet`,
  "Protected Buyer Release Control packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/buyer-release-control-run/timeline`,
  "Protected Buyer Release Timeline protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/buyer-release-control-run/remediation`,
  "Protected Buyer Release Remediation Plan protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/buyer-release-control-run/reconciliation`,
  "Protected Buyer Release Gate Reconciliation protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/buyer-release-control-run/metadata-drafts`,
  "Protected Buyer Release Metadata Drafts protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/buyer-release-control-run/metadata-drafts/checklist`,
  "Protected Buyer Release Draft Checklist protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/qa-evidence/manual-run-packets`,
  "Manual QA evidence persistence protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/qa-evidence/buyer-proof-release`,
  "QA Buyer Proof Release protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/qa-evidence/manual-execution-console`,
  "QA Manual Execution Console protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/qa-evidence/aal2-run-evidence`,
  "QA AAL2 Run Evidence protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/enterprise-proof-packet`,
  "Enterprise proof packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/trust-safety-incidents`,
  "TrustOps protected API"
);
await checkProtectedFailClosed(
  `/api/agent-workspaces/${workspaceSlug}/work-orders`,
  "Agent Workspace protected API"
);

console.log("pass public production smoke");
