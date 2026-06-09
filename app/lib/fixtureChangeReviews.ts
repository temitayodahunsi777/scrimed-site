import {
  getIntegrationFixtureBySlug,
  integrationFixtures
} from "./integrationFixtures";
import { getIntegrationFixtureValidationResults } from "./integrationFixtureValidation";
import {
  getSyntheticFixtureBySlug,
  syntheticFixtures
} from "./syntheticFixtures";
import { getSyntheticValidationResultBySlug } from "./syntheticValidation";

export type FixtureChangeReviewStatus = "approved" | "attention-required";

export type FixtureChangeReview = {
  id: string;
  fixtureType: "integration" | "synthetic";
  fixtureId: string;
  fixtureRoute: string;
  contractSlug: string;
  fingerprint: string;
  status: FixtureChangeReviewStatus;
  reviewerRole: string;
  approvalScope: string;
  reviewNote: string;
  requiredBeforeChange: string[];
  blockedActions: string[];
};

function createFingerprint(source: unknown, prefix: string) {
  const text = JSON.stringify(source);
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }

  return `${prefix}-${hash.toString(16).padStart(8, "0")}`;
}

function createSyntheticFixtureFingerprint(scenarioId: string) {
  const fixture = getSyntheticFixtureBySlug(scenarioId);

  if (!fixture) {
    return "missing-synthetic-fixture";
  }

  return createFingerprint(
    {
      scenarioId: fixture.scenarioId,
      inputSignals: fixture.request.inputSignals,
      workflowRequest: fixture.request.workflowRequest,
      decisionState: fixture.expectedOutput.decisionState,
      requiredTrace: fixture.expectedOutput.requiredTrace,
      outputSignals: fixture.expectedOutput.outputSignals,
      prohibitedClaims: fixture.expectedOutput.prohibitedClaims
    },
    "synthetic-fixture"
  );
}

function createIntegrationReviews(): FixtureChangeReview[] {
  const validation = getIntegrationFixtureValidationResults();

  return validation.results.map((result) => {
    const fixture = getIntegrationFixtureBySlug(result.contractSlug);
    const approved = result.status === "pass" && Boolean(fixture);

    return {
      id: `integration-review-${result.contractSlug}`,
      fixtureType: "integration",
      fixtureId: fixture?.request.fixtureId ?? "missing-fixture",
      fixtureRoute: fixture?.route ?? result.route,
      contractSlug: result.contractSlug,
      fingerprint: result.diff.fingerprint,
      status: approved ? "approved" : "attention-required",
      reviewerRole: "integration architect and data governance owner",
      approvalScope: "Synthetic request and expected-response contract baseline before live connector implementation.",
      reviewNote: approved
        ? "Current integration fixture passes coverage, safeguard mapping, trace, and live-review checks."
        : "Integration fixture requires review before it can support connector implementation.",
      requiredBeforeChange: [
        "compare new fingerprint against the prior approved fingerprint",
        "document added, removed, or renamed request signals",
        "confirm safeguard mapping still covers the integration contract",
        "record human approval before workflow or connector promotion"
      ],
      blockedActions: [
        "live connector promotion",
        "production data ingestion",
        "silent expected-output change",
        "clinical workflow automation"
      ]
    };
  });
}

function createSyntheticReviews(): FixtureChangeReview[] {
  return syntheticFixtures.map((fixture) => {
    const validation = getSyntheticValidationResultBySlug(fixture.scenarioId);
    const approved = validation?.status === "pass";

    return {
      id: `synthetic-review-${fixture.scenarioId}`,
      fixtureType: "synthetic",
      fixtureId: fixture.request.fixtureId,
      fixtureRoute: fixture.route,
      contractSlug: fixture.contractSlug,
      fingerprint: createSyntheticFixtureFingerprint(fixture.scenarioId),
      status: approved ? "approved" : "attention-required",
      reviewerRole: "workflow owner and clinical governance reviewer",
      approvalScope: "Synthetic workflow expected-output baseline before product workflow execution.",
      reviewNote: approved
        ? "Current synthetic fixture passes deterministic validation and remains approved for synthetic execution."
        : "Synthetic fixture requires validation review before workflow execution.",
      requiredBeforeChange: [
        "compare new fingerprint against the prior approved fingerprint",
        "document expected-output, prohibited-claim, or trace changes",
        "confirm human-review requirements remain visible",
        "record workflow-owner approval before implementation depends on the change"
      ],
      blockedActions: [
        "live clinical use",
        "patient-facing guidance",
        "final clinical documentation",
        "production connector dependency"
      ]
    };
  });
}

export function getFixtureChangeReviews() {
  return [...createIntegrationReviews(), ...createSyntheticReviews()];
}

export function getFixtureChangeReviewById(id: string) {
  return getFixtureChangeReviews().find((review) => review.id === id);
}

export function getFixtureChangeReviewSummary() {
  const reviews = getFixtureChangeReviews();
  const approved = reviews.filter((review) => review.status === "approved").length;
  const attentionRequired = reviews.length - approved;

  return {
    service: "scrimed-fixture-change-review",
    status: attentionRequired === 0 ? "pass" : "attention-required",
    reviewCount: reviews.length,
    integrationFixtureCount: integrationFixtures.length,
    syntheticFixtureCount: syntheticFixtures.length,
    approved,
    attentionRequired,
    reviews,
    updated: "2026-06-09"
  };
}
