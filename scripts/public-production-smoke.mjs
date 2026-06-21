#!/usr/bin/env node

const baseUrl = (process.env.SCRIMED_BASE_URL ?? "https://app.scrimedsolutions.com").replace(/\/$/, "");
const workspaceSlug = process.env.SCRIMED_WORKSPACE_SLUG ?? "atlas-synthetic-evaluation";

function endpoint(path) {
  return `${baseUrl}${path}`;
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
    body.proofStack?.protectedAuthorityArtifactReferencePackets !==
    "aal2-audited-authority-artifact-reference-status-packet-no-artifact-storage"
  ) {
    throw new Error(
      "product console missing protected authority artifact reference packet proof-stack posture."
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

  const brief = await request("/api/qa-evidence/brief");
  requireStatus("QA evidence brief", brief.response.status, 200);
  requireContentType("QA evidence brief", brief.response, "text/markdown");
  requireSyntheticBoundary("QA evidence brief", brief.response);

  const contract = await request("/api/qa-evidence/manual-run-packet");
  requireStatus("QA manual run evidence packet contract", contract.response.status, 200);
  requireContentType("QA manual run evidence packet contract", contract.response, "application/json");
  requireSyntheticBoundary("QA manual run evidence packet contract", contract.response);
  const contractBody = requireJson("QA manual run evidence packet contract", contract.body);

  if (contractBody.status !== "manual-aal2-run-evidence-packet-ready") {
    throw new Error("QA manual run evidence packet contract expected ready status.");
  }

  const rejectedSecret = await postJson("/api/qa-evidence/manual-run-packet", {
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

  console.log("pass QA evidence ledger");
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
await checkClinicalAuthorityReadiness();
await checkClinicalCareActivation();
await checkPublicMarketReadiness();
await checkGlobalReach();
await checkProductConsole();
await checkReadiness();
await checkCompetitiveEdgeApi();
await checkPilotDealRoomApi();
await checkQaEvidenceLedger();
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
  `/api/pilot-workspaces/${workspaceSlug}/qa-evidence/manual-run-packets`,
  "Manual QA evidence persistence protected API"
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
