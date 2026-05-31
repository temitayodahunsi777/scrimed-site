export type WorkflowExecutionResult = {
  workflowSlug: string;
  route: string;
  apiRoute: string;
  resultId: string;
  syntheticOnly: true;
  decisionState: string;
  outputSignals: string[];
  watchtowerTrace: string[];
  reviewState: string;
  reviewerRole: string;
  blockedActions: string[];
  qualityEvidence: string[];
};

export const workflowExecutionResults: WorkflowExecutionResult[] = [
  {
    workflowSlug: "carepath-high-risk-followup-routing",
    route: "/workflows/results/carepath-high-risk-followup-routing",
    apiRoute: "/api/workflows/results/carepath-high-risk-followup-routing",
    resultId: "result-carepath-high-risk-followup-routing-v1",
    syntheticOnly: true,
    decisionState: "navigation_review_recommended",
    outputSignals: [
      "navigation review recommendation",
      "urgency rationale",
      "transportation support consideration",
      "Watchtower trace",
      "human review requirement"
    ],
    watchtowerTrace: [
      "synthetic_fixture_loaded",
      "agent_boundary_checked",
      "integration_fixtures_verified",
      "navigation_review_recommended",
      "care_navigator_review_required"
    ],
    reviewState: "held_for_care_navigator_review",
    reviewerRole: "care navigator",
    blockedActions: [
      "live patient routing",
      "autonomous appointment confirmation",
      "clinical diagnosis",
      "treatment order",
      "production data ingestion"
    ],
    qualityEvidence: [
      "synthetic validation passed",
      "fixture change review approved",
      "integration fixture validation passed",
      "human review required"
    ]
  },
  {
    workflowSlug: "docutwin-draft-note-review",
    route: "/workflows/results/docutwin-draft-note-review",
    apiRoute: "/api/workflows/results/docutwin-draft-note-review",
    resultId: "result-docutwin-draft-note-review-v1",
    syntheticOnly: true,
    decisionState: "draft_ready_for_clinician_review",
    outputSignals: [
      "draft note",
      "source trace",
      "missing context prompts",
      "clinician review required",
      "no final signature"
    ],
    watchtowerTrace: [
      "synthetic_fixture_loaded",
      "documentation_boundary_checked",
      "source_trace_attached",
      "draft_note_prepared",
      "clinician_review_required"
    ],
    reviewState: "held_for_clinician_review",
    reviewerRole: "licensed clinician or delegated documentation reviewer",
    blockedActions: [
      "signed note",
      "final medical record",
      "uncited diagnosis insertion",
      "autonomous documentation filing",
      "production data ingestion"
    ],
    qualityEvidence: [
      "synthetic validation passed",
      "fixture change review approved",
      "source trace retained",
      "draft-only guardrail retained"
    ]
  },
  {
    workflowSlug: "trialcore-eligibility-review-queue",
    route: "/workflows/results/trialcore-eligibility-review-queue",
    apiRoute: "/api/workflows/results/trialcore-eligibility-review-queue",
    resultId: "result-trialcore-eligibility-review-queue-v1",
    syntheticOnly: true,
    decisionState: "review_queue_created",
    outputSignals: [
      "candidate match rationale",
      "missing evidence list",
      "exclusion flags",
      "criteria trace",
      "research coordinator review required"
    ],
    watchtowerTrace: [
      "synthetic_fixture_loaded",
      "trial_matching_boundary_checked",
      "criteria_trace_retained",
      "review_queue_created",
      "research_review_required"
    ],
    reviewState: "held_for_research_coordinator_review",
    reviewerRole: "research coordinator or qualified clinician reviewer",
    blockedActions: [
      "enrollment guarantee",
      "eligibility certification",
      "treatment recommendation",
      "patient outreach",
      "production data ingestion"
    ],
    qualityEvidence: [
      "synthetic validation passed",
      "fixture change review approved",
      "criteria trace retained",
      "enrollment claims blocked"
    ]
  }
];

export function getWorkflowExecutionResultBySlug(slug: string) {
  return workflowExecutionResults.find((result) => result.workflowSlug === slug);
}

export function getWorkflowExecutionResultSummary() {
  const syntheticOnly = workflowExecutionResults.every((result) => result.syntheticOnly);

  return {
    service: "scrimed-workflow-execution-results",
    status:
      syntheticOnly && workflowExecutionResults.length >= 3
        ? "result-fixtures-ready"
        : "attention-required",
    resultCount: workflowExecutionResults.length,
    syntheticOnly,
    results: workflowExecutionResults,
    updated: "2026-05-31"
  };
}
