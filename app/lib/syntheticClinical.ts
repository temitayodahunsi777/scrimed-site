export type SyntheticScenario = {
  id: string;
  route: string;
  status: "fixture-ready" | "planned";
  contractSlug: string;
  patientProfile: string;
  scenario: string;
  expectedOutcome: string;
  riskMarkers: string[];
  workflowTrace: string[];
  assertions: string[];
};

export const syntheticScenarios: SyntheticScenario[] = [
  {
    id: "care-navigation-high-risk-followup",
    route: "/synthetic/care-navigation-high-risk-followup",
    status: "fixture-ready",
    contractSlug: "synthetic-clinical-test-environment",
    patientProfile: "Synthetic adult patient with multiple chronic conditions and recent emergency utilization.",
    scenario: "CarePath AI receives an intake summary and must identify high-risk follow-up needs without using live patient identifiers.",
    expectedOutcome: "The workflow routes the patient to care navigation review, marks follow-up urgency, and records a trace for Watchtower review.",
    riskMarkers: ["recent emergency visit", "medication complexity", "missed follow-up", "transportation barrier"],
    workflowTrace: ["intake_received", "risk_markers_extracted", "navigation_review_recommended", "watchtower_trace_recorded"],
    assertions: ["synthetic-only label present", "no production identifiers", "risk markers retained", "navigation recommendation explainable"]
  },
  {
    id: "docutwin-note-review",
    route: "/synthetic/docutwin-note-review",
    status: "fixture-ready",
    contractSlug: "synthetic-clinical-test-environment",
    patientProfile: "Synthetic outpatient visit with structured vitals, medication list, and clinician-patient conversation summary.",
    scenario: "DocuTwin drafts a reviewable note from structured and conversational inputs.",
    expectedOutcome: "The note remains marked as draft, preserves source traceability, and requires clinician review before use.",
    riskMarkers: ["source mismatch", "missing medication context", "draft output", "review required"],
    workflowTrace: ["inputs_loaded", "draft_generated", "source_trace_attached", "clinician_review_required"],
    assertions: ["draft status retained", "source trace attached", "no final-signature claim", "review requirement visible"]
  },
  {
    id: "trialcore-eligibility-screen",
    route: "/synthetic/trialcore-eligibility-screen",
    status: "fixture-ready",
    contractSlug: "synthetic-clinical-test-environment",
    patientProfile: "Synthetic oncology patient profile with diagnosis, prior therapy, age band, and lab summary.",
    scenario: "TrialCore evaluates eligibility signals against a mock trial requirement set.",
    expectedOutcome: "The workflow returns candidate match rationale, missing evidence, and exclusion flags without final enrollment claims.",
    riskMarkers: ["eligibility uncertainty", "missing lab recency", "prior therapy dependency", "human review needed"],
    workflowTrace: ["profile_loaded", "criteria_compared", "evidence_gap_identified", "review_queue_created"],
    assertions: ["no enrollment guarantee", "missing evidence listed", "review queue created", "criteria trace retained"]
  }
];

export function getSyntheticScenarioBySlug(slug: string) {
  return syntheticScenarios.find((scenario) => scenario.id === slug);
}

export function getSyntheticClinicalSummary() {
  const fixtureReady = syntheticScenarios.filter((scenario) => scenario.status === "fixture-ready").length;

  return {
    service: "scrimed-synthetic-clinical-environment",
    status: "fixture-ready",
    scenarioCount: syntheticScenarios.length,
    fixtureReady,
    scenarios: syntheticScenarios,
    updated: "2026-05-29"
  };
}
