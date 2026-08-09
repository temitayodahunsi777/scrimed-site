#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  evaluateFaithCoreUse,
  faithCorePublicCopy,
  getFaithCoreBoundarySummary
} from "../app/lib/faithCorePolicy.ts";
import {
  evaluateOperatingModeAction,
  getScrimedOperatingModeSummary
} from "../app/lib/operatingMode.ts";

const optionalUse = evaluateFaithCoreUse({
  userSelected: true,
  requestedUse: "faith-aligned-engagement"
});
assert.equal(optionalUse.allowed, true);
assert.equal(optionalUse.clinicalDecisionAuthority, false);
assert.equal(optionalUse.operationalDecisionAuthority, false);

const missingConsent = evaluateFaithCoreUse({
  userSelected: false,
  requestedUse: "faith-aligned-engagement"
});
assert.equal(missingConsent.allowed, false);
assert.equal(missingConsent.reasonCode, "explicit-opt-in-required");

for (const requestedUse of [
  "clinical-logic",
  "operational-decision",
  "diagnosis",
  "treatment",
  "eligibility",
  "prioritization",
  "risk-scoring",
  "medical-recommendation",
  "access-to-care"
]) {
  const decision = evaluateFaithCoreUse({
    userSelected: true,
    requestedUse
  });
  assert.equal(decision.allowed, false);
  assert.equal(decision.reasonCode, "clinical-influence-prohibited");
}

const operatingModeDecision = evaluateOperatingModeAction("faith-influenced-clinical-logic");
assert.equal(operatingModeDecision.allowed, false);
assert.equal(operatingModeDecision.reasonCode, "action-not-authorized");

const boundary = getFaithCoreBoundarySummary();
assert.equal(boundary.optInRequired, true);
assert.equal(boundary.clinicalDecisionAuthority, false);
assert.equal(boundary.operationalDecisionAuthority, false);

const operatingMode = getScrimedOperatingModeSummary();
assert.equal(operatingMode.mode.faithAffectsClinicalLogic, false);
assert.deepEqual(operatingMode.faithCore, boundary);

const operatingModeRouteSource = await readFile("app/api/operating-mode/route.ts", "utf8");
assert.ok(operatingModeRouteSource.includes("getScrimedOperatingModeSummary"));
assert.ok(operatingModeRouteSource.includes("X-SCRIMED-Clinical-Care-Authority"));
assert.equal(operatingMode.faithCore.optInRequired, true);
assert.equal(operatingMode.faithCore.clinicalDecisionAuthority, false);
assert.equal(operatingMode.faithCore.operationalDecisionAuthority, false);

const publicSurfacePaths = [
  "app/faithcore/page.tsx",
  "app/lib/faithCorePolicy.ts",
  "config/wix-publication-policy.json"
];
const publicSurfaces = (
  await Promise.all(publicSurfacePaths.map((path) => readFile(path, "utf8")))
).join("\n");

for (const requiredCopy of Object.values(faithCorePublicCopy)) {
  assert.ok(publicSurfaces.includes(requiredCopy), `Missing governed FaithCore copy: ${requiredCopy}`);
}

for (const prohibitedClaim of [
  "A spiritually aligned trust and encouragement layer",
  "governs clinical reasoning",
  "spiritually governed clinical",
  "scripture-driven diagnosis",
  "faith-based prioritization",
  "faith-based eligibility",
  "faith-based clinical recommendations"
]) {
  assert.equal(
    publicSurfaces.toLowerCase().includes(prohibitedClaim.toLowerCase()),
    false,
    `Prohibited FaithCore claim reappeared: ${prohibitedClaim}`
  );
}

console.log("pass SCRIMED FaithCore API, service, and public-copy neutrality policy");
