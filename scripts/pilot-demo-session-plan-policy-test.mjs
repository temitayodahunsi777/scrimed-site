#!/usr/bin/env node

import {
  buildPilotDemoSessionCatalog
} from "../app/lib/pilotDemoCommercialReadiness.ts";
import {
  buildPilotDemoSessionPlan,
  PilotDemoSessionPlanError,
  pilotDemoSessionAudienceOptions,
  pilotDemoSessionFocusOptions,
  pilotDemoSessionLengthOptions,
  serializePilotDemoSessionPlanMarkdown
} from "../app/lib/pilotDemoSessionPlanner.ts";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const catalog = buildPilotDemoSessionCatalog();
assert(catalog.length === 6, `Expected six governed demo entries, received ${catalog.length}.`);
assert(
  catalog.some((entry) => entry.demoSlug === "prior-authorization-support"),
  "Session catalog omitted the documentation-before-authorization demo."
);

let generatedPlanCount = 0;
for (const entry of catalog) {
  for (const audience of pilotDemoSessionAudienceOptions) {
    for (const focus of pilotDemoSessionFocusOptions) {
      for (const duration of pilotDemoSessionLengthOptions) {
        const input = {
          demoSlug: entry.demoSlug,
          audience: audience.id,
          focus: focus.id,
          durationMinutes: duration.id
        };
        const plan = buildPilotDemoSessionPlan(catalog, input);
        const repeated = buildPilotDemoSessionPlan(catalog, input);
        const totalMinutes = plan.agenda.reduce((total, step) => total + step.minutes, 0);

        assert(totalMinutes === duration.id, `${plan.planId} agenda does not fit its meeting length.`);
        assert(plan.agenda.length === 5, `${plan.planId} lost the five-step presentation contract.`);
        assert(plan.auditHash === repeated.auditHash, `${plan.planId} audit hash is not deterministic.`);
        assert(plan.planId === repeated.planId, `${plan.planId} plan identity is not deterministic.`);
        assert(plan.syntheticOnly === true, `${plan.planId} lost the synthetic-only boundary.`);
        assert(plan.humanReviewRequired === true, `${plan.planId} lost human review.`);
        assert(plan.bindingQuoteAuthorized === false, `${plan.planId} authorized a binding quote.`);
        assert(plan.externalSendAuthorized === false, `${plan.planId} authorized external sending.`);
        assert(plan.releaseAuthorityGranted === false, `${plan.planId} granted release authority.`);
        assert(plan.noPhiIntakeRoute.includes("/pilot?"), `${plan.planId} lost its no-PHI intake path.`);
        assert(plan.successCriteria.length >= 3, `${plan.planId} has insufficient pilot acceptance criteria.`);
        assert(plan.buyerQuestions.length === 3, `${plan.planId} has an unstable buyer-question count.`);
        assert(
          plan.agenda.some((step) => step.proof.route === entry.runRoute),
          `${plan.planId} does not link to the executable product surface.`
        );
        assert(
          plan.agenda.some((step) => step.proof.route === "/clinical-production-readiness"),
          `${plan.planId} does not show the production boundary.`
        );
        generatedPlanCount += 1;
      }
    }
  }
}

assert(generatedPlanCount === 360, `Expected 360 deterministic plan variants, received ${generatedPlanCount}.`);

const defaultPlan = buildPilotDemoSessionPlan(catalog, {
  demoSlug: "carepath-access-operations",
  audience: "executive-sponsor",
  focus: "workflow-proof",
  durationMinutes: 30
});
const markdown = serializePilotDemoSessionPlanMarkdown(defaultPlan);
for (const required of [
  "Guided Demo Session Plan",
  "## Run of Show",
  "## Success Criteria",
  "## Retained Boundary",
  "Synthetic demonstration only",
  "does not authorize external distribution"
]) {
  assert(markdown.includes(required), `Session-plan Markdown omitted ${required}.`);
}

let unknownDemoError = null;
try {
  buildPilotDemoSessionPlan(catalog, {
    demoSlug: "unregistered-demo",
    audience: "executive-sponsor",
    focus: "workflow-proof",
    durationMinutes: 30
  });
} catch (error) {
  unknownDemoError = error;
}
assert(unknownDemoError instanceof PilotDemoSessionPlanError, "Unknown demo did not fail through the controlled error type.");
assert(unknownDemoError?.code === "unknown-demo", "Unknown demo returned the wrong controlled error code.");

console.log(`pass pilot demo session plan policy generated_plans=${generatedPlanCount}`);
