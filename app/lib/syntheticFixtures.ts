export type SyntheticFixtureRequest = {
  fixtureId: string;
  syntheticOnly: true;
  module: "CarePath AI" | "DocuTwin" | "TrialCore";
  inputSignals: string[];
  workflowRequest: string;
  guardrails: string[];
};

export type SyntheticFixtureExpectedOutput = {
  decisionState: string;
  requiredTrace: string[];
  outputSignals: string[];
  requiredReview: string;
  prohibitedClaims: string[];
};

export type SyntheticFixture = {
  scenarioId: string;
  route: string;
  contractSlug: string;
  request: SyntheticFixtureRequest;
  expectedOutput: SyntheticFixtureExpectedOutput;
};

export const syntheticFixtures: SyntheticFixture[] = [
  {
    scenarioId: "care-navigation-high-risk-followup",
    route: "/synthetic/fixtures/care-navigation-high-risk-followup",
    contractSlug: "synthetic-clinical-test-environment",
    request: {
      fixtureId: "fixture-carepath-high-risk-followup-v1",
      syntheticOnly: true,
      module: "CarePath AI",
      inputSignals: [
        "recent emergency visit",
        "medication complexity",
        "missed follow-up",
        "transportation barrier"
      ],
      workflowRequest: "Route the synthetic patient profile to the appropriate care navigation review path.",
      guardrails: [
        "do not expose production identifiers",
        "do not claim clinical diagnosis",
        "require care navigator review",
        "retain Watchtower trace"
      ]
    },
    expectedOutput: {
      decisionState: "navigation_review_recommended",
      requiredTrace: [
        "intake_received",
        "risk_markers_extracted",
        "navigation_review_recommended",
        "watchtower_trace_recorded"
      ],
      outputSignals: [
        "high-risk follow-up",
        "care navigation review",
        "transportation support consideration"
      ],
      requiredReview: "care navigator review before action",
      prohibitedClaims: ["final diagnosis", "automated treatment order", "production patient identity"]
    }
  },
  {
    scenarioId: "docutwin-note-review",
    route: "/synthetic/fixtures/docutwin-note-review",
    contractSlug: "synthetic-clinical-test-environment",
    request: {
      fixtureId: "fixture-docutwin-note-review-v1",
      syntheticOnly: true,
      module: "DocuTwin",
      inputSignals: [
        "structured vitals",
        "medication list",
        "conversation summary",
        "review required"
      ],
      workflowRequest: "Generate a reviewable draft note from synthetic structured and conversational inputs.",
      guardrails: [
        "preserve draft status",
        "attach source trace",
        "do not create final signature",
        "require clinician review"
      ]
    },
    expectedOutput: {
      decisionState: "draft_ready_for_clinician_review",
      requiredTrace: [
        "inputs_loaded",
        "draft_generated",
        "source_trace_attached",
        "clinician_review_required"
      ],
      outputSignals: [
        "draft note",
        "source trace",
        "clinician review required"
      ],
      requiredReview: "clinician review before use",
      prohibitedClaims: ["signed note", "final medical record", "production patient identity"]
    }
  },
  {
    scenarioId: "trialcore-eligibility-screen",
    route: "/synthetic/fixtures/trialcore-eligibility-screen",
    contractSlug: "synthetic-clinical-test-environment",
    request: {
      fixtureId: "fixture-trialcore-eligibility-screen-v1",
      syntheticOnly: true,
      module: "TrialCore",
      inputSignals: [
        "synthetic oncology profile",
        "prior therapy summary",
        "age band",
        "lab summary"
      ],
      workflowRequest: "Compare synthetic patient signals against mock trial criteria and produce reviewable eligibility rationale.",
      guardrails: [
        "do not guarantee enrollment",
        "list missing evidence",
        "create review queue",
        "retain criteria trace"
      ]
    },
    expectedOutput: {
      decisionState: "review_queue_created",
      requiredTrace: [
        "profile_loaded",
        "criteria_compared",
        "evidence_gap_identified",
        "review_queue_created"
      ],
      outputSignals: [
        "candidate match rationale",
        "missing lab recency",
        "exclusion flags"
      ],
      requiredReview: "research coordinator review before enrollment discussion",
      prohibitedClaims: ["enrollment guarantee", "eligibility certification", "production patient identity"]
    }
  }
];

export function getSyntheticFixtureBySlug(slug: string) {
  return syntheticFixtures.find((fixture) => fixture.scenarioId === slug);
}

export function getSyntheticFixtureSummary() {
  return {
    service: "scrimed-synthetic-fixtures",
    status: "fixture-contracts-ready",
    fixtureCount: syntheticFixtures.length,
    fixtures: syntheticFixtures,
    updated: "2026-05-29"
  };
}
