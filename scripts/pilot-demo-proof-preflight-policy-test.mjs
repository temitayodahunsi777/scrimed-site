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
  buildPilotDemoProofTargets,
  evaluatePilotDemoProofPreflight,
  pilotDemoProofPreflightMaximumTargets,
  PilotDemoProofPreflightError
} from "../app/lib/pilotDemoProofPreflight.ts";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function expectUnsafeRoute(plan, route) {
  const unsafePlan = {
    ...plan,
    agenda: plan.agenda.map((step, index) =>
      index === 0 ? { ...step, proof: { ...step.proof, route } } : step
    )
  };

  try {
    buildPilotDemoProofTargets(unsafePlan);
    throw new Error(`Unsafe route was accepted: ${route}`);
  } catch (error) {
    assert(error instanceof PilotDemoProofPreflightError, "Unsafe route returned the wrong error type.");
    assert(error.code === "unsafe-proof-route", "Unsafe route returned the wrong error code.");
  }
}

const catalog = buildPilotDemoSessionCatalog();
let planCount = 0;
let routeCount = 0;

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
        const targets = buildPilotDemoProofTargets(plan);
        const pending = buildPendingPilotDemoProofPreflight(plan);
        const observations = buildPassingPilotDemoProofObservations(plan);
        const passed = evaluatePilotDemoProofPreflight({ plan, observations });

        assert(targets.length > 0, "Proof preflight generated no targets.");
        assert(targets.length <= pilotDemoProofPreflightMaximumTargets, "Proof preflight exceeded its target bound.");
        assert(new Set(targets.map((target) => target.requestPath)).size === targets.length, "Proof targets were not deduplicated.");
        assert(targets.every((target) => target.route.startsWith("/") && !target.route.startsWith("//")), "Proof preflight accepted a noncanonical route.");
        assert(targets.every((target) => target.method === "HEAD"), "Proof preflight must remain read-only HEAD.");
        assert(targets.every((target) => target.credentials === "omit"), "Proof preflight must omit browser credentials.");
        assert(targets.every((target) => target.requestBodyAllowed === false), "Proof preflight allowed a request body.");
        assert(pending.status === "not-run", "Pending preflight did not remain visibly unverified.");
        assert(pending.reachableCount === 0, "Pending preflight reported reachable routes.");
        assert(passed.status === "passed", "Reachable proof routes did not pass preflight.");
        assert(passed.reachableCount === targets.length, "Passed preflight lost reachable route evidence.");
        assert(passed.externalNetworkAllowed === false, "Proof preflight authorized external network access.");
        assert(passed.storesBuyerData === false, "Proof preflight stores buyer data.");
        assert(passed.protectedImportAuthorized === false, "Proof preflight authorized protected import.");
        planCount += 1;
        routeCount += targets.length;
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
const passingObservations = buildPassingPilotDemoProofObservations(defaultPlan);
const deterministicA = evaluatePilotDemoProofPreflight({
  plan: defaultPlan,
  observations: passingObservations
});
const deterministicB = evaluatePilotDemoProofPreflight({
  plan: defaultPlan,
  observations: [...passingObservations]
    .reverse()
    .map((observation) => ({ ...observation, checkedAt: "2099-01-01T00:00:00.000Z", latencyMs: 9_999 }))
});
assert(deterministicA.auditHash === deterministicB.auditHash, "Proof preflight hash depends on timing or observation order.");

const failedObservation = passingObservations.map((observation, index) =>
  index === 0
    ? { ...observation, outcome: "http-error", httpStatus: 404 }
    : observation
);
const blocked = evaluatePilotDemoProofPreflight({ plan: defaultPlan, observations: failedObservation });
assert(blocked.status === "blocked", "HTTP failure did not block proof preflight.");
assert(blocked.reachableCount === passingObservations.length - 1, "Blocked preflight reported the wrong reachable count.");

const mismatchedObservation = passingObservations.map((observation, index) =>
  index === 0 ? { ...observation, requestPath: "/different-route" } : observation
);
assert(
  evaluatePilotDemoProofPreflight({ plan: defaultPlan, observations: mismatchedObservation }).status === "blocked",
  "Target identity mismatch did not block proof preflight."
);

for (const unsafeRoute of [
  "https://example.com/proof",
  "//example.com/proof",
  "/proof/../admin",
  "/proof\\admin"
]) {
  expectUnsafeRoute(defaultPlan, unsafeRoute);
}

console.log(`pass pilot demo proof preflight plans=${planCount} routes=${routeCount}`);
