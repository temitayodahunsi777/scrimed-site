#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/pilotDemoCommercialReadiness.ts",
  "app/lib/pilotDemoSessionPlanner.ts",
  "app/lib/pilotDemoProofPreflight.ts",
  "app/lib/pilotDemoRehearsal.ts",
  "app/lib/pilotDemoProtectedHandoff.ts",
  "app/lib/buyerDemoSessions.ts",
  "app/api/pilot-demo-commercial-readiness/route.ts",
  "app/api/sales-operations/opportunities/[intakeId]/demo-sessions/route.ts",
  "app/api/pilot-demo-commercial-readiness/brief/route.ts",
  "app/pilot-demo-commercial-readiness/page.tsx",
  "app/pilot-demo-commercial-readiness/PilotDemoSessionPlanner.tsx",
  "app/sales-operations/SalesOperationsConsole.tsx",
  "docs/pilot-demo-commercial-readiness.md",
  "scripts/pilot-demo-session-plan-policy-test.mjs",
  "scripts/pilot-demo-proof-preflight-policy-test.mjs",
  "scripts/pilot-demo-rehearsal-policy-test.mjs",
  "scripts/pilot-demo-protected-handoff-policy-test.mjs",
  "scripts/public-production-smoke.mjs",
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "package.json"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} missing required Pilot Demo Commercial Readiness text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/pilotDemoCommercialReadiness.ts"];

for (const expected of [
  "PilotDemoBuyerConversionPacket",
  "buildPilotDemoBuyerConversionPackets",
  "buyerConversionPackets",
  "buyerConversionPacketCount",
  "sponsorRole",
  "workflowOwnerRole",
  "reviewCadence",
  "decisionWindow",
  "proofBundle",
  "acceptanceCriteria",
  "noPhiIntakeFields",
  "paidDiligenceTriggers",
  "disqualifiers",
  "pricingGuardrail",
  "minimumPaidStep",
  "closePlan",
  "humanReviewRequired: true",
  "syntheticOnly: true",
  "generateScrimedAuditHash",
  "non-PHI operating pain statement",
  "buildPilotDemoSessionCatalog",
  "sessionPlanner",
  "interactive-synthetic-session-planner-active",
  "rehearsalGate",
  "pilotDemoRehearsalStatus",
  "automated-route-preflight-plus-operator-self-attestation",
  "pilotDemoProofPreflightStatus",
  "carepath-access-operations",
  "docutwin-documentation-review",
  "trialcore-research-operations",
  "atlas-interoperability-readiness",
  "agentos-governance-evaluation"
]) {
  requireIncludes("app/lib/pilotDemoCommercialReadiness.ts", source, expected);
}

for (const expected of [
  "Buyer conversion packets",
  "buyerConversionPacketCount",
  "summary.buyerConversionPackets",
  "PilotDemoSessionPlanner",
  "summary.sessionPlanner.catalog",
  "Human review",
  "Audit hash"
]) {
  requireIncludes("app/pilot-demo-commercial-readiness/page.tsx", files["app/pilot-demo-commercial-readiness/page.tsx"], expected);
}

for (const expected of [
  "buildPilotDemoSessionPlan",
  "serializePilotDemoSessionPlanMarkdown",
  "ready-for-synthetic-guided-demo",
  "humanReviewRequired: true",
  "bindingQuoteAuthorized: false",
  "externalSendAuthorized: false",
  "releaseAuthorityGranted: false",
  "clinical-production-readiness"
]) {
  requireIncludes("app/lib/pilotDemoSessionPlanner.ts", files["app/lib/pilotDemoSessionPlanner.ts"], expected);
}

for (const expected of [
  "buildPilotDemoProofTargets",
  "buildPendingPilotDemoProofPreflight",
  "evaluatePilotDemoProofPreflight",
  "same-origin-read-only-proof-preflight-active",
  "method: \"HEAD\"",
  "credentials: \"omit\"",
  "sameOriginOnly: true",
  "requestBodyAllowed: false",
  "externalNetworkAllowed: false",
  "storesBuyerData: false",
  "protectedImportAuthorized: false",
  "unsafe-proof-route",
  "too-many-proof-routes"
]) {
  requireIncludes("app/lib/pilotDemoProofPreflight.ts", files["app/lib/pilotDemoProofPreflight.ts"], expected);
}

for (const expected of [
  "evaluatePilotDemoRehearsal",
  "buildPilotDemoRehearsalReceipt",
  "serializePilotDemoRehearsalReceiptMarkdown",
  "ready-for-protected-handoff",
  "automated-route-preflight-plus-operator-self-attestation",
  "proofPreflight.status",
  "storesBuyerData: false",
  "externalSendAuthorized: false",
  "bindingQuoteAuthorized: false",
  "pilotLaunchAuthorized: false",
  "releaseAuthorityGranted: false",
  "humanReviewRequired: true"
]) {
  requireIncludes("app/lib/pilotDemoRehearsal.ts", files["app/lib/pilotDemoRehearsal.ts"], expected);
}

for (const expected of [
  "PilotDemoProtectedHandoff",
  "ValidatedPilotDemoProtectedHandoff",
  "buildPilotDemoProtectedHandoff",
  "buildPilotDemoProtectedHandoffRoute",
  "parsePilotDemoProtectedHandoffQuery",
  "validatePilotDemoProtectedHandoff",
  "canonical-metadata-draft-handoff-active",
  "public-rehearsal-metadata",
  "canonical-plan-identity-validated",
  "client-rehearsal-reference-not-independent-verification",
  "syntheticOnly: true",
  "humanReviewRequired: true",
  "automaticPersistenceAuthorized: false",
  "externalSendAuthorized: false",
  "releaseAuthorityGranted: false",
  "unknown-field",
  "duplicate-field",
  "invalid-plan-identity",
  "invalid-fingerprint"
]) {
  requireIncludes(
    "app/lib/pilotDemoProtectedHandoff.ts",
    files["app/lib/pilotDemoProtectedHandoff.ts"],
    expected
  );
}

for (const expected of [
  "X-SCRIMED-Demo-Session-Planner",
  "interactive-synthetic-session-planner-active",
  "X-SCRIMED-Demo-Rehearsal-Gate",
  "proof-preflight-rehearsal-gate-active",
  "X-SCRIMED-Demo-Proof-Preflight",
  "same-origin-read-only-operator-triggered",
  "X-SCRIMED-Demo-Protected-Handoff",
  "aal2-sales-operations-only",
  "X-SCRIMED-Demo-Handoff-Draft",
  "canonical-metadata-no-automatic-persistence",
  "X-SCRIMED-Demo-Session-Storage",
  "no-buyer-data-stored",
  "X-SCRIMED-Demo-Session-Send-Authority",
  "not-authorized-external-send"
]) {
  requireIncludes(
    "app/api/pilot-demo-commercial-readiness/route.ts",
    files["app/api/pilot-demo-commercial-readiness/route.ts"],
    expected
  );
}

for (const expected of [
  "Interactive presentation workspace",
  "Build a buyer-ready demo run of show",
  "Presentation steps",
  "Download session plan",
  "Governed rehearsal gate",
  "Automated proof-route check",
  "Run proof preflight",
  "Anonymous read-only HEAD requests",
  "same-origin only",
  "Download rehearsal record",
  "Open protected handoff",
  "metadata draft only | no automatic persistence | no send | no launch authority",
  "Start no-PHI intake",
  "no storage | no external send | no binding quote | no release authority"
]) {
  requireIncludes(
    "app/pilot-demo-commercial-readiness/PilotDemoSessionPlanner.tsx",
    files["app/pilot-demo-commercial-readiness/PilotDemoSessionPlanner.tsx"],
    expected
  );
}

for (const expected of [
  "id=\"authenticated-buyer-demo-execution\"",
  "parsePilotDemoProtectedHandoffQuery",
  "useSyncExternalStore",
  "notifyLocationSearchChanged",
  "Public metadata draft",
  "Canonical plan identity",
  "explicit AAL2 persistence",
  "Handoff rejected",
  "Rebuild rehearsal",
  "toPilotDemoProtectedHandoffCandidate",
  "Boolean(rejectedDemoHandoff)"
]) {
  requireIncludes(
    "app/sales-operations/SalesOperationsConsole.tsx",
    files["app/sales-operations/SalesOperationsConsole.tsx"],
    expected
  );
}

for (const expected of [
  "validatedRehearsalHandoff",
  "rehearsalHandoff",
  "canonicalDemoName",
  "Automatic persistence authorized: no",
  "Human review required: yes"
]) {
  requireIncludes("app/lib/buyerDemoSessions.ts", files["app/lib/buyerDemoSessions.ts"], expected);
}

for (const expected of [
  "validatePilotDemoProtectedHandoff",
  "buildPilotDemoSessionCatalog",
  "sales-demo-session-invalid-rehearsal-handoff",
  "canonical-metadata-draft-recorded",
  "not-supplied"
]) {
  requireIncludes(
    "app/api/sales-operations/opportunities/[intakeId]/demo-sessions/route.ts",
    files["app/api/sales-operations/opportunities/[intakeId]/demo-sessions/route.ts"],
    expected
  );
}

for (const expected of [
  "Buyer Conversion Packets",
  "sponsor role",
  "workflow owner role",
  "paid diligence triggers",
  "human review requirement",
  "audit hash",
  "Interactive Demo Session Planner",
  "timed run of show",
  "Governed Rehearsal Gate",
  "operator self-attestation",
  "same-origin",
  "proof preflight",
  "metadata-only handoff draft",
  "AAL2 operator"
]) {
  requireIncludes("docs/pilot-demo-commercial-readiness.md", files["docs/pilot-demo-commercial-readiness.md"], expected);
}

for (const expected of [
  "buyerConversionPackets",
  "CarePath buyer conversion packet controls",
  "non-PHI operating pain statement",
  "Buyer Conversion Packets",
  "sessionPlanner",
  "ready-for-synthetic-guided-demo",
  "rehearsalGate",
  "proofPreflight",
  "ready-for-protected-handoff",
  "protectedHandoff"
]) {
  requireIncludes("scripts/public-production-smoke.mjs", files["scripts/public-production-smoke.mjs"], expected);
}

for (const expected of [
  "\"smoke:pilot-demo-commercial-readiness\"",
  "\"test:pilot-demo-session-plan\"",
  "\"test:pilot-demo-proof-preflight\"",
  "\"test:pilot-demo-rehearsal\"",
  "\"test:pilot-demo-protected-handoff\""
]) {
  requireIncludes("package.json", files["package.json"], expected);
}

for (const expected of [
  "scripts/pilot-demo-commercial-readiness-contract-check.mjs",
  "scripts/pilot-demo-session-plan-policy-test.mjs",
  "scripts/pilot-demo-proof-preflight-policy-test.mjs",
  "scripts/pilot-demo-rehearsal-policy-test.mjs",
  "scripts/pilot-demo-protected-handoff-policy-test.mjs"
]) {
  requireIncludes(
    "scripts/scrimed-nonsecret-test-suite.mjs",
    files["scripts/scrimed-nonsecret-test-suite.mjs"],
    expected
  );
}

const forbiddenPhrases = [
  "binding quote created",
  "customer go-live approved",
  "production connector approved",
  "payer submission enabled",
  "EHR writeback enabled",
  "autonomous clinical care enabled",
  "ROI guaranteed",
  "revenue guaranteed"
];

for (const path of [
  "app/lib/pilotDemoCommercialReadiness.ts",
  "app/lib/pilotDemoSessionPlanner.ts",
  "app/lib/pilotDemoProofPreflight.ts",
  "app/lib/pilotDemoRehearsal.ts",
  "app/lib/pilotDemoProtectedHandoff.ts",
  "app/lib/buyerDemoSessions.ts",
  "app/pilot-demo-commercial-readiness/page.tsx",
  "app/pilot-demo-commercial-readiness/PilotDemoSessionPlanner.tsx",
  "docs/pilot-demo-commercial-readiness.md"
]) {
  const lower = files[path].toLowerCase();

  for (const phrase of forbiddenPhrases) {
    if (lower.includes(phrase.toLowerCase())) {
      throw new Error(`${path} contains forbidden Pilot Demo Commercial Readiness phrase: ${phrase}`);
    }
  }
}

console.log("pass pilot demo commercial readiness contract check");
