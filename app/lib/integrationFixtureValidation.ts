import {
  getContractSlug,
  integrationContracts
} from "./integrationContracts";
import {
  getIntegrationFixtureBySlug,
  integrationFixtures
} from "./integrationFixtures";
import type { IntegrationFixture } from "./integrationFixtures";

export type IntegrationFixtureValidationStatus = "pass" | "fail";

export type IntegrationFixtureDiff = {
  missingRequiredSignals: string[];
  unmappedSafeguards: string[];
  extraNormalizedSignals: string[];
  fingerprint: string;
};

export type IntegrationFixtureValidationCheck = {
  id: string;
  label: string;
  status: IntegrationFixtureValidationStatus;
  detail: string;
};

export type IntegrationFixtureValidationResult = {
  contractSlug: string;
  route: string;
  fixtureRoute?: string;
  status: IntegrationFixtureValidationStatus;
  passed: number;
  failed: number;
  diff: IntegrationFixtureDiff;
  checks: IntegrationFixtureValidationCheck[];
};

const productionIdentifierPattern =
  /\b(?:\d{3}-\d{2}-\d{4}|mrn[:#\s]*\d+|ssn[:#\s]*\d+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4})\b/i;

function createCheck(
  id: string,
  label: string,
  passed: boolean,
  detail: string
): IntegrationFixtureValidationCheck {
  return {
    id,
    label,
    status: passed ? "pass" : "fail",
    detail
  };
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function textIncludesNeedle(text: string, needle: string) {
  return normalize(text).includes(normalize(needle));
}

function createFingerprint(fixture: IntegrationFixture | undefined) {
  if (!fixture) {
    return "missing-fixture";
  }

  const source = JSON.stringify({
    contractSlug: fixture.contractSlug,
    requestSignals: fixture.request.requestSignals,
    normalizedSignals: fixture.expectedResponse.normalizedSignals,
    rejectedIfMissing: fixture.expectedResponse.rejectedIfMissing,
    prohibitedActions: fixture.expectedResponse.prohibitedActions
  });

  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) >>> 0;
  }

  return `fixture-${hash.toString(16).padStart(8, "0")}`;
}

export function validateIntegrationFixtureBySlug(
  slug: string
): IntegrationFixtureValidationResult | undefined {
  const contract = integrationContracts.find(
    (item) => getContractSlug(item) === slug
  );

  if (!contract || contract.sourceType === "synthetic") {
    return undefined;
  }

  const fixture = getIntegrationFixtureBySlug(slug);
  const fixtureText = fixture ? JSON.stringify(fixture) : "";
  const signalKeys = fixture ? Object.keys(fixture.request.requestSignals) : [];
  const normalizedSignals = fixture?.expectedResponse.normalizedSignals ?? [];

  const missingRequiredSignals = contract.requiredSignals.filter(
    (signal) =>
      !signalKeys.some((key) => normalize(key) === normalize(signal)) &&
      !normalizedSignals.some((item) => normalize(item) === normalize(signal))
  );
  const unmappedSafeguards = contract.safeguards.filter(
    (safeguard) => fixture && !textIncludesNeedle(fixtureText, safeguard)
  );
  const extraNormalizedSignals = normalizedSignals.filter(
    (signal) =>
      !contract.requiredSignals.some((required) => normalize(required) === normalize(signal))
  );
  const diff = {
    missingRequiredSignals,
    unmappedSafeguards,
    extraNormalizedSignals,
    fingerprint: createFingerprint(fixture)
  };

  const checks = [
    createCheck(
      "fixture_payload",
      "Fixture payload present",
      Boolean(fixture),
      "Every non-synthetic integration contract must have a synthetic request and expected-response fixture."
    ),
    createCheck(
      "synthetic_only",
      "Synthetic-only fixture",
      fixture?.request.syntheticOnly === true,
      "Integration fixture requests must be explicitly synthetic-only until live connector approval."
    ),
    createCheck(
      "contract_binding",
      "Contract binding",
      fixture?.contractSlug === slug && fixture?.request.contractSlug === slug,
      "Fixture and request payload must bind to the same integration contract slug."
    ),
    createCheck(
      "no_production_identifiers",
      "No production identifiers",
      Boolean(fixture) && !productionIdentifierPattern.test(fixtureText),
      "Fixture payload must not include obvious SSN, MRN, email, or phone identifiers."
    ),
    createCheck(
      "required_signals_covered",
      "Required signals covered",
      missingRequiredSignals.length === 0,
      "Fixture must cover every required signal declared by the integration contract."
    ),
    createCheck(
      "safeguards_mapped",
      "Safeguards mapped",
      unmappedSafeguards.length === 0,
      "Fixture text must map all declared safeguards into guardrails, trace, review, or prohibited-action controls."
    ),
    createCheck(
      "trace_complete",
      "Trace complete",
      Boolean(fixture) &&
        fixture!.expectedResponse.requiredTrace.length >= 4 &&
        fixture!.expectedResponse.requiredTrace.every(Boolean),
      "Expected response must include at least four deterministic trace steps."
    ),
    createCheck(
      "live_review_required",
      "Live review required",
      Boolean(fixture) && /review before live|before live/i.test(fixture!.expectedResponse.reviewBeforeLive),
      "Fixture must require human review before live connector promotion."
    ),
    createCheck(
      "prohibited_actions",
      "Prohibited actions",
      Boolean(fixture) && fixture!.expectedResponse.prohibitedActions.length >= 3,
      "Expected response must define prohibited actions for unsafe connector behavior."
    ),
    createCheck(
      "diff_fingerprint",
      "Diff fingerprint",
      diff.fingerprint !== "missing-fixture",
      "Fixture diff fingerprint must change when expected request or response fields change."
    )
  ];

  const passed = checks.filter((check) => check.status === "pass").length;
  const failed = checks.length - passed;

  return {
    contractSlug: slug,
    route: contract.route,
    fixtureRoute: fixture?.route,
    status: failed === 0 ? "pass" : "fail",
    passed,
    failed,
    diff,
    checks
  };
}

export function getIntegrationFixtureValidationResults() {
  const nonSyntheticContracts = integrationContracts.filter(
    (contract) => contract.sourceType !== "synthetic"
  );
  const results = nonSyntheticContracts
    .map((contract) => validateIntegrationFixtureBySlug(getContractSlug(contract)))
    .filter((result): result is IntegrationFixtureValidationResult => Boolean(result));
  const passedContracts = results.filter((result) => result.status === "pass").length;
  const failedContracts = results.length - passedContracts;
  const passedChecks = results.reduce((total, result) => total + result.passed, 0);
  const failedChecks = results.reduce((total, result) => total + result.failed, 0);

  return {
    service: "scrimed-integration-fixture-validation",
    status: failedContracts === 0 ? "pass" : "fail",
    contractCount: results.length,
    fixtureCount: integrationFixtures.length,
    passedContracts,
    failedContracts,
    passedChecks,
    failedChecks,
    results,
    updated: "2026-06-09"
  };
}
