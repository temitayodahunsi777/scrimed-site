import { SyntheticScenario, syntheticScenarios } from "./syntheticClinical";
import { getSyntheticFixtureBySlug } from "./syntheticFixtures";

export type SyntheticValidationStatus = "pass" | "fail";

export type SyntheticValidationCheck = {
  id: string;
  label: string;
  status: SyntheticValidationStatus;
  detail: string;
};

export type SyntheticValidationResult = {
  scenarioId: string;
  route: string;
  fixtureRoute?: string;
  status: SyntheticValidationStatus;
  passed: number;
  failed: number;
  checks: SyntheticValidationCheck[];
};

const productionIdentifierPattern =
  /\b(?:\d{3}-\d{2}-\d{4}|mrn[:#\s]*\d+|ssn[:#\s]*\d+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4})\b/i;

function scenarioText(scenario: SyntheticScenario) {
  return [
    scenario.id,
    scenario.contractSlug,
    scenario.patientProfile,
    scenario.scenario,
    scenario.expectedOutcome,
    ...scenario.riskMarkers,
    ...scenario.workflowTrace,
    ...scenario.assertions
  ].join(" ");
}

function createCheck(
  id: string,
  label: string,
  passed: boolean,
  detail: string
): SyntheticValidationCheck {
  return {
    id,
    label,
    status: passed ? "pass" : "fail",
    detail
  };
}

export function validateSyntheticScenario(
  scenario: SyntheticScenario
): SyntheticValidationResult {
  const fixture = getSyntheticFixtureBySlug(scenario.id);
  const text = scenarioText(scenario);
  const fixtureText = fixture ? JSON.stringify(fixture) : "";
  const lowerText = text.toLowerCase();

  const checks = [
    createCheck(
      "synthetic_label",
      "Synthetic-only label",
      lowerText.includes("synthetic"),
      "Scenario content must clearly identify itself as synthetic."
    ),
    createCheck(
      "no_production_identifiers",
      "No production identifiers",
      !productionIdentifierPattern.test(text),
      "Scenario content must not include obvious SSN, MRN, email, or phone identifiers."
    ),
    createCheck(
      "fixture_payload",
      "Fixture payload present",
      Boolean(fixture),
      "Scenario must have a structured request and expected-output fixture."
    ),
    createCheck(
      "fixture_identifier_safety",
      "Fixture identifier safety",
      Boolean(fixture) && !productionIdentifierPattern.test(fixtureText),
      "Fixture payload must not include obvious SSN, MRN, email, or phone identifiers."
    ),
    createCheck(
      "fixture_synthetic_only",
      "Fixture synthetic-only flag",
      fixture?.request.syntheticOnly === true,
      "Fixture request must be explicitly marked synthetic-only."
    ),
    createCheck(
      "contract_boundary",
      "Contract boundary",
      scenario.contractSlug === "synthetic-clinical-test-environment" &&
        fixture?.contractSlug === scenario.contractSlug,
      "Synthetic validation scenarios must stay bound to the synthetic clinical test contract."
    ),
    createCheck(
      "risk_markers",
      "Risk markers retained",
      scenario.riskMarkers.length >= 3 && scenario.riskMarkers.every(Boolean),
      "Scenario must retain at least three explicit risk markers."
    ),
    createCheck(
      "workflow_trace",
      "Workflow trace complete",
      scenario.workflowTrace.length >= 4 && scenario.workflowTrace.every(Boolean),
      "Scenario must expose at least four deterministic workflow trace steps."
    ),
    createCheck(
      "fixture_trace_alignment",
      "Fixture trace alignment",
      Boolean(fixture) &&
        fixture!.expectedOutput.requiredTrace.every((step) =>
          scenario.workflowTrace.includes(step)
        ),
      "Fixture expected trace must align with the scenario workflow trace."
    ),
    createCheck(
      "assertions",
      "Assertions mapped",
      scenario.assertions.length >= 4 && scenario.assertions.every(Boolean),
      "Scenario must include at least four explicit assertions."
    ),
    createCheck(
      "fixture_output_contract",
      "Fixture output contract",
      Boolean(fixture) &&
        fixture!.expectedOutput.outputSignals.length >= 3 &&
        fixture!.expectedOutput.prohibitedClaims.length >= 3,
      "Fixture must define expected output signals and prohibited claims."
    ),
    createCheck(
      "human_review_guardrail",
      "Human review guardrail",
      /review|required|draft|no final|no enrollment|watchtower/i.test(
        `${text} ${fixtureText}`
      ),
      "Scenario must retain a review, draft, no-final-claim, or Watchtower guardrail."
    )
  ];

  const passed = checks.filter((check) => check.status === "pass").length;
  const failed = checks.length - passed;

  return {
    scenarioId: scenario.id,
    route: scenario.route,
    fixtureRoute: fixture?.route,
    status: failed === 0 ? "pass" : "fail",
    passed,
    failed,
    checks
  };
}

export function getSyntheticValidationResults() {
  const results = syntheticScenarios.map(validateSyntheticScenario);
  const passedScenarios = results.filter((result) => result.status === "pass").length;
  const failedScenarios = results.length - passedScenarios;
  const passedChecks = results.reduce((total, result) => total + result.passed, 0);
  const failedChecks = results.reduce((total, result) => total + result.failed, 0);

  return {
    service: "scrimed-synthetic-validation",
    status: failedScenarios === 0 ? "pass" : "fail",
    scenarioCount: results.length,
    passedScenarios,
    failedScenarios,
    passedChecks,
    failedChecks,
    results,
    updated: "2026-05-29"
  };
}

export function getSyntheticValidationResultBySlug(slug: string) {
  const scenario = syntheticScenarios.find((item) => item.id === slug);

  if (!scenario) {
    return undefined;
  }

  return validateSyntheticScenario(scenario);
}
