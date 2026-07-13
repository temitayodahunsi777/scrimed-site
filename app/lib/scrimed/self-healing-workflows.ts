import {
  validateSelfHealingRecommendation,
  type SelfHealingAction,
  type SelfHealingRecommendation,
  type SyntheticOperationalSignal
} from "./trustops-schema";
import { detectSyntheticOperationalSignals } from "./signal-engine";

const blockedRealWorldActions = [
  "Live PHI access",
  "Autonomous diagnosis",
  "Treatment recommendation",
  "Prescribing",
  "Patient outreach",
  "Payer submission",
  "EHR writeback",
  "Billing submission",
  "Production connector mutation"
];

const recommendationBoundary =
  "Recommendation-only synthetic remediation; no real clinical, payer, EHR, billing, outreach, PHI-impacting, or production connector action may execute without explicit human approval and future authorization.";

const actionBySignal: Record<string, SelfHealingAction> = {
  denied_claim_spike: "open investigation ticket",
  referral_delay: "request human review",
  prior_auth_stalled: "queue for manual verification",
  missing_documentation: "regenerate missing packet",
  imaging_turnaround_delay: "retry workflow",
  care_gap_detected: "request human review",
  failed_api_sync: "re-run validation",
  duplicate_patient_context: "reconcile duplicate records",
  low_confidence_agent_output: "pause automation",
  compliance_sensitive_task: "escalate to compliance"
};

const stepsByAction: Record<SelfHealingAction, string[]> = {
  "retry workflow": [
    "Replay the synthetic workflow trace.",
    "Re-run structured-output validation.",
    "Send the replay packet to the assigned owner."
  ],
  "regenerate missing packet": [
    "Regenerate the synthetic evidence packet.",
    "Validate required schema fields.",
    "Queue the packet for human review."
  ],
  "request human review": [
    "Create a reviewer task with signal reason and source event.",
    "Attach the synthetic evidence packet.",
    "Block any downstream automation until disposition is recorded."
  ],
  "escalate to compliance": [
    "Create a compliance escalation packet.",
    "Attach policy boundary and signal details.",
    "Pause related automation recommendations until compliance review completes."
  ],
  "queue for manual verification": [
    "Create a manual verification queue item.",
    "Attach the stalled workflow trace.",
    "Require owner disposition before any next step."
  ],
  "reconcile duplicate records": [
    "Create a duplicate-context reconciliation packet.",
    "Compare only synthetic context identifiers.",
    "Require data-governance review before any merge-like recommendation."
  ],
  "re-run validation": [
    "Re-run schema validation against the synthetic trace.",
    "Capture validation errors.",
    "Route failures to platform reliability review."
  ],
  "open investigation ticket": [
    "Create an investigation ticket draft.",
    "Attach trend summary, threshold, and affected workflow.",
    "Assign the owner for manual investigation."
  ],
  "pause automation": [
    "Mark the synthetic workflow as automation-paused.",
    "Attach the confidence or safety reason.",
    "Require qualified reviewer approval before continuing."
  ]
};

export function buildSelfHealingRecommendations(
  signals: SyntheticOperationalSignal[] = detectSyntheticOperationalSignals()
): SelfHealingRecommendation[] {
  return signals.map((signal) => {
    const action = actionBySignal[signal.id] ?? "request human review";

    return {
      id: `recommendation-${signal.id}`,
      signalId: signal.id,
      action,
      recommendedOwner: signal.recommendedOwner,
      steps: stepsByAction[action],
      automationEligibility: "recommendation-only",
      humanReviewRequired: true,
      expectedOutcome: `A human-reviewed ${action} packet for ${signal.affectedWorkflow}.`,
      blockedActions: blockedRealWorldActions,
      safetyBoundary: recommendationBoundary
    };
  });
}

export function validateSelfHealingRecommendationSet(
  recommendations = buildSelfHealingRecommendations()
) {
  const validations = recommendations.map(validateSelfHealingRecommendation);

  return {
    status: validations.every((result) => result.valid) ? "pass" : "fail",
    validations
  };
}
