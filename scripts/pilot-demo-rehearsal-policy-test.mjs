#!/usr/bin/env node

import { buildPilotDemoSessionCatalog } from "../app/lib/pilotDemoCommercialReadiness.ts";
import {
  buildPilotDemoSessionPlan,
  pilotDemoSessionAudienceOptions,
  pilotDemoSessionFocusOptions,
  pilotDemoSessionLengthOptions
} from "../app/lib/pilotDemoSessionPlanner.ts";
import {
  buildPassingPilotDemoProofObservations,
  buildPendingPilotDemoProofPreflight,
  evaluatePilotDemoProofPreflight
} from "../app/lib/pilotDemoProofPreflight.ts";
import {
  buildPilotDemoRehearsalReceipt,
  evaluatePilotDemoRehearsal,
  pilotDemoProtectedHandoffRoute,
  pilotDemoRehearsalControls,
  serializePilotDemoRehearsalReceiptMarkdown
} from "../app/lib/pilotDemoRehearsal.ts";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const catalog = buildPilotDemoSessionCatalog();
let evaluationCount = 0;

for (const entry of catalog) {
  for (const audience of pilotDemoSessionAudienceOptions) {
    for (const focus of pilotDemoSessionFocusOptions) {
      for (const duration of pilotDemoSessionLengthOptions) {
        const plan = buildPilotDemoSessionPlan(catalog, {
          demoSlug: entry.demoSlug,
          audience: audience.id,
          focus: focus.id,
          durationMinutes: duration.id
        });
        const incomplete = evaluatePilotDemoRehearsal({
          plan,
          completedStepIds: [],
          confirmedControlIds: [],
          proofPreflight: buildPendingPilotDemoProofPreflight(plan)
        });
        const completedStepIds = plan.agenda.map((step) => step.id);
        const confirmedControlIds = pilotDemoRehearsalControls.map((control) => control.id);
        const proofPreflight = evaluatePilotDemoProofPreflight({
          plan,
          observations: buildPassingPilotDemoProofObservations(plan)
        });
        const ready = evaluatePilotDemoRehearsal({
          plan,
          completedStepIds,
          confirmedControlIds,
          proofPreflight
        });

        assert(incomplete.status === "rehearsal-incomplete", "Empty rehearsal did not fail closed.");
        assert(incomplete.readinessScore === 0, "Empty rehearsal did not start at zero.");
        assert(incomplete.blockers.length === 4, "Empty rehearsal did not expose every blocker.");
        assert(ready.status === "ready-for-protected-handoff", "Complete rehearsal did not open protected handoff.");
        assert(ready.readinessScore === 100, "Complete rehearsal did not reach 100 percent.");
        assert(ready.blockers.length === 0, "Complete rehearsal retained an unexpected blocker.");
        assert(ready.protectedHandoffRoute === pilotDemoProtectedHandoffRoute, "Handoff route drifted.");
        assert(ready.storesBuyerData === false, "Rehearsal must not store buyer data.");
        assert(ready.externalSendAuthorized === false, "Rehearsal must not authorize external sending.");
        assert(ready.bindingQuoteAuthorized === false, "Rehearsal must not authorize a binding quote.");
        assert(ready.pilotLaunchAuthorized === false, "Rehearsal must not authorize pilot launch.");
        assert(ready.releaseAuthorityGranted === false, "Rehearsal must not grant release authority.");
        assert(ready.humanReviewRequired === true, "Rehearsal must preserve human review.");
        evaluationCount += 2;
      }
    }
  }
}

const defaultPlan = buildPilotDemoSessionPlan(catalog, {
  demoSlug: catalog[0].demoSlug,
  audience: "executive-sponsor",
  focus: "workflow-proof",
  durationMinutes: 30
});
const completedStepIds = defaultPlan.agenda.map((step) => step.id);
const confirmedControlIds = pilotDemoRehearsalControls.map((control) => control.id);
const proofPreflight = evaluatePilotDemoProofPreflight({
  plan: defaultPlan,
  observations: buildPassingPilotDemoProofObservations(defaultPlan)
});
const deterministicA = evaluatePilotDemoRehearsal({
  plan: defaultPlan,
  completedStepIds,
  confirmedControlIds,
  proofPreflight
});
const deterministicB = evaluatePilotDemoRehearsal({
  plan: defaultPlan,
  completedStepIds: [...completedStepIds].reverse(),
  confirmedControlIds: [...confirmedControlIds].reverse(),
  proofPreflight
});
assert(deterministicA.auditHash === deterministicB.auditHash, "Rehearsal audit hash is order-dependent.");

const partial = evaluatePilotDemoRehearsal({
  plan: defaultPlan,
  completedStepIds,
  confirmedControlIds: [],
  proofPreflight
});
assert(partial.readinessScore === 40, "Agenda-only rehearsal must score 40 percent.");
assert(partial.status === "rehearsal-incomplete", "Agenda-only rehearsal must remain incomplete.");

const unknownValues = evaluatePilotDemoRehearsal({
  plan: defaultPlan,
  completedStepIds: ["unknown-step", ...completedStepIds],
  confirmedControlIds: ["unknown-control", ...confirmedControlIds],
  proofPreflight
});
assert(unknownValues.completedStepCount === defaultPlan.agenda.length, "Unknown steps changed coverage.");
assert(unknownValues.passedCriteriaCount === 4, "Unknown controls changed criteria coverage.");

const selfAttestationOnly = evaluatePilotDemoRehearsal({
  plan: defaultPlan,
  completedStepIds,
  confirmedControlIds,
  proofPreflight: buildPendingPilotDemoProofPreflight(defaultPlan)
});
assert(selfAttestationOnly.readinessScore === 80, "Self-attestation without route evidence must score 80 percent.");
assert(selfAttestationOnly.status === "rehearsal-incomplete", "Self-attestation bypassed the proof preflight.");

const receipt = buildPilotDemoRehearsalReceipt({
  plan: defaultPlan,
  completedStepIds,
  confirmedControlIds,
  proofPreflight,
  generatedAt: "2026-07-31T12:00:00.000Z"
});
const repeatedReceipt = buildPilotDemoRehearsalReceipt({
  plan: defaultPlan,
  completedStepIds,
  confirmedControlIds,
  proofPreflight,
  generatedAt: "2026-07-31T12:00:00.000Z"
});
assert(receipt.receiptFingerprint === repeatedReceipt.receiptFingerprint, "Receipt fingerprint is not deterministic.");
assert(receipt.localOnly === true, "Receipt must remain local only.");
assert(receipt.syntheticOnly === true, "Receipt must remain synthetic only.");

const markdown = serializePilotDemoRehearsalReceiptMarkdown(receipt);
for (const required of [
  "automated-route-preflight-plus-operator-self-attestation",
  "Same-Origin Proof Preflight",
  "ready-for-protected-handoff",
  "Human review remains required",
  "Route reachability does not validate clinical correctness",
  "not independent verification",
  "bounded canonical plan and fingerprint metadata for validation",
  "does not upload this record or persist anything automatically"
]) {
  assert(markdown.includes(required), `Rehearsal receipt is missing: ${required}`);
}

console.log(`pass pilot demo rehearsal policy evaluations=${evaluationCount}`);
