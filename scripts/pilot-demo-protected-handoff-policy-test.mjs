import {
  buildPilotDemoProtectedHandoff,
  buildPilotDemoProtectedHandoffRoute,
  parsePilotDemoProtectedHandoffQuery,
  pilotDemoProtectedHandoffAnchor,
  pilotDemoProtectedHandoffBaseRoute,
  pilotDemoProtectedHandoffMaximumQueryLength,
  pilotDemoProtectedHandoffQueryKeys,
  toPilotDemoProtectedHandoffCandidate,
  validatePilotDemoProtectedHandoff
} from "../app/lib/pilotDemoProtectedHandoff.ts";
import {
  buildPassingPilotDemoProofObservations,
  buildPendingPilotDemoProofPreflight,
  evaluatePilotDemoProofPreflight
} from "../app/lib/pilotDemoProofPreflight.ts";
import {
  evaluatePilotDemoRehearsal,
  pilotDemoRehearsalControls
} from "../app/lib/pilotDemoRehearsal.ts";
import {
  buildPilotDemoSessionPlan,
  pilotDemoSessionAudienceOptions,
  pilotDemoSessionFocusOptions,
  pilotDemoSessionLengthOptions
} from "../app/lib/pilotDemoSessionPlanner.ts";
import { buildPilotDemoSessionCatalog } from "../app/lib/pilotDemoCommercialReadiness.ts";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readyEvidence(plan) {
  const proofPreflight = evaluatePilotDemoProofPreflight({
    plan,
    observations: buildPassingPilotDemoProofObservations(plan)
  });
  const rehearsal = evaluatePilotDemoRehearsal({
    plan,
    completedStepIds: plan.agenda.map((step) => step.id),
    confirmedControlIds: pilotDemoRehearsalControls.map((control) => control.id),
    proofPreflight
  });

  return { proofPreflight, rehearsal };
}

function queryFromRoute(route) {
  const queryStart = route.indexOf("?");
  const hashStart = route.indexOf("#");
  return route.slice(queryStart, hashStart);
}

const catalog = buildPilotDemoSessionCatalog();
let evaluationCount = 0;

for (const demo of catalog) {
  for (const audience of pilotDemoSessionAudienceOptions) {
    for (const focus of pilotDemoSessionFocusOptions) {
      for (const duration of pilotDemoSessionLengthOptions) {
        const plan = buildPilotDemoSessionPlan(catalog, {
          demoSlug: demo.demoSlug,
          audience: audience.id,
          focus: focus.id,
          durationMinutes: duration.id
        });
        const { proofPreflight, rehearsal } = readyEvidence(plan);
        const handoff = buildPilotDemoProtectedHandoff({ plan, proofPreflight, rehearsal });
        const route = buildPilotDemoProtectedHandoffRoute(handoff);
        const parsed = parsePilotDemoProtectedHandoffQuery(queryFromRoute(route), catalog);

        assert(
          route.startsWith(`${pilotDemoProtectedHandoffBaseRoute}?`) &&
            route.endsWith(`#${pilotDemoProtectedHandoffAnchor}`),
          "Protected handoff escaped its same-origin Sales Operations route."
        );
        assert(route.length < pilotDemoProtectedHandoffMaximumQueryLength, "Protected handoff route is oversized.");
        assert(parsed.status === "accepted-metadata-draft", "Valid protected handoff was rejected.");
        assert(parsed.handoff.planId === plan.planId, "Protected handoff changed the canonical plan identity.");
        assert(parsed.handoff.canonicalDemoName === plan.demoName, "Protected handoff changed the demo name.");
        assert(parsed.handoff.proofTargetCount === proofPreflight.targetCount, "Protected handoff changed proof count.");
        assert(parsed.handoff.readinessScore === 100, "Protected handoff accepted incomplete rehearsal readiness.");
        assert(parsed.handoff.syntheticOnly === true, "Protected handoff lost the synthetic-only boundary.");
        assert(parsed.handoff.humanReviewRequired === true, "Protected handoff removed human review.");
        assert(parsed.handoff.automaticPersistenceAuthorized === false, "Protected handoff enabled automatic persistence.");
        assert(parsed.handoff.externalSendAuthorized === false, "Protected handoff enabled external send.");
        assert(parsed.handoff.releaseAuthorityGranted === false, "Protected handoff granted release authority.");

        const candidate = toPilotDemoProtectedHandoffCandidate(parsed.handoff);
        assert(
          validatePilotDemoProtectedHandoff(candidate, catalog).status === "accepted-metadata-draft",
          "Validated protected handoff could not round trip through the API candidate shape."
        );
        assert(!JSON.stringify(candidate).includes("operatorNotes"), "Protected handoff retained free text.");
        evaluationCount += 1;
      }
    }
  }
}

const samplePlan = buildPilotDemoSessionPlan(catalog, {
  demoSlug: catalog[0].demoSlug,
  audience: "executive-sponsor",
  focus: "workflow-proof",
  durationMinutes: 30
});
const sampleReady = readyEvidence(samplePlan);
const sampleHandoff = buildPilotDemoProtectedHandoff({
  plan: samplePlan,
  proofPreflight: sampleReady.proofPreflight,
  rehearsal: sampleReady.rehearsal
});
const sampleRoute = buildPilotDemoProtectedHandoffRoute(sampleHandoff);
const sampleQuery = queryFromRoute(sampleRoute);

const pendingProof = buildPendingPilotDemoProofPreflight(samplePlan);
const pendingRehearsal = evaluatePilotDemoRehearsal({
  plan: samplePlan,
  completedStepIds: samplePlan.agenda.map((step) => step.id),
  confirmedControlIds: pilotDemoRehearsalControls.map((control) => control.id),
  proofPreflight: pendingProof
});
let incompleteRejected = false;
try {
  buildPilotDemoProtectedHandoff({
    plan: samplePlan,
    proofPreflight: pendingProof,
    rehearsal: pendingRehearsal
  });
} catch (error) {
  incompleteRejected = error?.code === "evidence-mismatch" || error?.code === "rehearsal-incomplete";
}
assert(incompleteRejected, "Incomplete rehearsal created protected handoff metadata.");

const duplicateQuery = `${sampleQuery}&${pilotDemoProtectedHandoffQueryKeys.demoSlug}=${samplePlan.demoSlug}`;
assert(
  parsePilotDemoProtectedHandoffQuery(duplicateQuery, catalog).status === "rejected",
  "Duplicate protected handoff field was accepted."
);
assert(
  parsePilotDemoProtectedHandoffQuery(`${sampleQuery}&unexpected=value`, catalog).status === "rejected",
  "Unknown protected handoff field was accepted."
);
assert(
  parsePilotDemoProtectedHandoffQuery(`?${"x".repeat(pilotDemoProtectedHandoffMaximumQueryLength)}`, catalog).status === "rejected",
  "Oversized protected handoff was accepted."
);

const tamperedPlanParams = new URLSearchParams(sampleQuery.slice(1));
tamperedPlanParams.set(pilotDemoProtectedHandoffQueryKeys.audience, "clinical-operations");
assert(
  parsePilotDemoProtectedHandoffQuery(tamperedPlanParams.toString(), catalog).status === "rejected",
  "Mismatched canonical plan identity was accepted."
);

const tamperedFingerprintParams = new URLSearchParams(sampleQuery.slice(1));
tamperedFingerprintParams.set(pilotDemoProtectedHandoffQueryKeys.handoffFingerprint, "scrimed-intel-00000000");
assert(
  parsePilotDemoProtectedHandoffQuery(tamperedFingerprintParams.toString(), catalog).status === "rejected",
  "Tampered protected handoff fingerprint was accepted."
);

assert(
  validatePilotDemoProtectedHandoff(
    { ...sampleHandoff, automaticPersistenceAuthorized: true },
    catalog
  ).status === "rejected",
  "Protected handoff allowed automatic persistence."
);
assert(
  validatePilotDemoProtectedHandoff({ ...sampleHandoff, buyerEmail: "buyer@example.test" }, catalog).status === "rejected",
  "Protected handoff accepted an unsupported buyer-data field."
);

console.log(`pass pilot demo protected handoff evaluations=${evaluationCount}`);
