#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const files = {
  gateway: "app/lib/clinicalContextGateway.ts",
  route: "app/api/clinical-context-gateway/route.ts",
  briefRoute: "app/api/clinical-context-gateway/brief/route.ts",
  os: "app/lib/healthcareIntelligenceOS.ts",
  page: "app/healthcare-intelligence-os/page.tsx",
  hub: "app/lib/scrimedHub.ts",
  navigation: "app/lib/navigationAudit.ts",
  docs: "docs/clinical-context-gateway.md",
  healthcareDocs: "docs/healthcare-intelligence-os.md",
  architectureDocs: "docs/architecture.md",
  systemsMap: "docs/scrimed-systems-map.md",
  readme: "README.md",
  packageJson: "package.json",
  nonsecretSuite: "scripts/scrimed-nonsecret-test-suite.mjs",
  publicSmoke: "scripts/public-production-smoke.mjs"
};

async function read(path) {
  return readFile(path, "utf8");
}

function requireIncludes(label, text, expected) {
  const missing = expected.filter((value) => !text.includes(value));

  if (missing.length > 0) {
    throw new Error(`${label} missing required text: ${missing.join(", ")}`);
  }
}

function requireNotIncludes(label, text, forbidden) {
  const found = forbidden.filter((value) => text.includes(value));

  if (found.length > 0) {
    throw new Error(`${label} contains forbidden text: ${found.join(", ")}`);
  }
}

const contents = Object.fromEntries(
  await Promise.all(Object.entries(files).map(async ([key, path]) => [key, await read(path)]))
);

const forbiddenTokenMarkers = [
  "service_" + "role",
  "SCRIMED_" + "BEARER_TOKEN",
  "sk-" + "proj-",
  "sk_" + "live_",
  "Authorization: " + "Bearer"
];

requireIncludes("clinical context gateway", contents.gateway, [
  "ClinicalContextGatewayRequest",
  "ClinicalContextGatewayEnvelope",
  "ClinicalContextGatewayAuditEnvelope",
  "clinical-context-gateway-ready-no-phi",
  "scrimed-clinical-context-gateway-v2026-07-03",
  "scrimed-context-envelope-v1",
  "/healthcare-intelligence-os#clinical-context-gateway",
  "/api/clinical-context-gateway",
  "/api/clinical-context-gateway/brief",
  "governed-semantic-context-only-no-live-phi",
  "rawSchemaAccess",
  "rawConnectorPayloadAccess",
  "not-authorized-live-care",
  "not-production-connector-approved",
  "strict metadata-only request schema",
  "source contract allowlist",
  "semantic concept allowlist",
  "no raw database schema exposure",
  "no raw connector payload exposure",
  "no credential exposure",
  "context envelope hashing",
  "audit envelope generation",
  "Clinical Data Governance policy decision",
  "evaluateClinicalDataGovernanceRequest",
  "getClinicalDataFabricSummary",
  "isClinicalContextGatewayRequest",
  "semantic-context-ready",
  "review-required",
  "blocked",
  "internal-fhir-metadata-context",
  "deidentified-document-review-context",
  "phi-external-model-context",
  "payer-network-context-block",
  "unknown-source-contract",
  "containsPhi: false",
  "includesRawSourcePayload: false",
  "includesRawDatabaseSchema: false",
  "includesCredentials: false"
]);

requireNotIncludes("clinical context gateway", contents.gateway, forbiddenTokenMarkers);

requireIncludes("clinical context gateway API route", contents.route, [
  "GET()",
  "POST(request: Request)",
  "evaluateClinicalContextGatewayRequest",
  "isClinicalContextGatewayRequest",
  "invalid-context-gateway-request",
  "X-SCRIMED-Clinical-Context-Gateway",
  "X-SCRIMED-Data-Boundary",
  "X-SCRIMED-Raw-Schema-Access",
  "X-SCRIMED-Raw-Connector-Payload",
  "X-SCRIMED-Record-Mutation",
  "X-SCRIMED-Patient-Outreach",
  "X-SCRIMED-Payer-Submission",
  "private, no-store"
]);

requireIncludes("clinical context gateway brief route", contents.briefRoute, [
  "buildClinicalContextGatewayBrief",
  "scrimed-clinical-context-gateway.md",
  "text/markdown",
  "X-SCRIMED-Clinical-Context-Gateway"
]);

requireIncludes("healthcare intelligence OS integration", contents.os, [
  "getClinicalContextGatewaySummary",
  "clinicalContextGateway",
  "Clinical Context Gateway",
  "Clinical Context Gateway API",
  "Clinical Context Gateway Brief",
  "gatewayControlCount",
  "baselineEvaluationCount"
]);

requireIncludes("healthcare intelligence OS page integration", contents.page, [
  "summary.clinicalContextGateway",
  "id=\"clinical-context-gateway\"",
  "Clinical Context Gateway",
  "/api/clinical-context-gateway",
  "raw schemas",
  "raw connector payloads"
]);

requireIncludes("hub route registry", contents.hub, [
  "clinicalContextGatewayRoute",
  "clinicalContextGatewayApiRoute",
  "clinicalContextGatewayBriefRoute"
]);

requireIncludes("navigation audit", contents.navigation, [
  "expectedApiRoutePatternCount = 439"
]);

requireIncludes("clinical context gateway docs", contents.docs, [
  "SCRIMED Clinical Context Gateway",
  "/api/clinical-context-gateway",
  "/api/clinical-context-gateway/brief",
  "Clinical Data Fabric contract -> Clinical Data Governance decision -> Clinical Context Gateway envelope",
  "semantic context envelopes",
  "no-live-PHI control plane",
  "Production Roadmap"
]);

requireIncludes("healthcare intelligence docs", contents.healthcareDocs, [
  "Clinical Context Gateway API",
  "Clinical Context Gateway Brief",
  "docs/clinical-context-gateway.md"
]);

requireIncludes("architecture docs", contents.architectureDocs, [
  "Clinical Context Gateway",
  "/api/clinical-context-gateway",
  "/api/clinical-context-gateway/brief"
]);

requireIncludes("systems map", contents.systemsMap, [
  "/api/clinical-context-gateway",
  "/api/clinical-context-gateway/brief"
]);

requireIncludes("readme", contents.readme, [
  "Clinical Context Gateway boundary",
  "/api/clinical-context-gateway",
  "/api/clinical-context-gateway/brief"
]);

requireIncludes("package scripts", contents.packageJson, [
  "\"smoke:clinical-context-gateway\": \"node scripts/clinical-context-gateway-contract-check.mjs\""
]);

requireIncludes("nonsecret suite", contents.nonsecretSuite, [
  "clinical context gateway contract",
  "scripts/clinical-context-gateway-contract-check.mjs"
]);

requireIncludes("public production smoke", contents.publicSmoke, [
  "requireClinicalContextGatewayBoundary",
  "checkClinicalContextGateway",
  "/api/clinical-context-gateway",
  "/api/clinical-context-gateway/brief"
]);

console.log("pass clinical context gateway contract");
