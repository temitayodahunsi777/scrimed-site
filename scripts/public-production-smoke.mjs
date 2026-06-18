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

function requireSalesBoundary(label, response) {
  const boundary = response.headers.get("x-scrimed-data-boundary");

  if (boundary !== "business-contact-and-workflow-scope-only") {
    throw new Error(`${label} expected x-scrimed-data-boundary business-contact-and-workflow-scope-only but received ${boundary}.`);
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

async function checkProtectedFailClosed(path, label) {
  const result = await request(path);
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
