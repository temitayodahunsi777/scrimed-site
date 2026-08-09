import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";

export const releaseStateMachineVersion =
  "scrimed-release-state-machine-v1-2026-08-09";

export type ScrimedReleaseState =
  | "DEVELOPMENT"
  | "CANDIDATE"
  | "REVIEW_REQUESTED"
  | "REVIEW_APPROVED"
  | "MERGE_AUTHORIZED"
  | "MERGED"
  | "PREVIEW_VERIFIED"
  | "PRODUCTION_AUTHORIZATION_REQUIRED"
  | "PRODUCTION_DEPLOYED"
  | "PRODUCTION_VERIFIED";

export type ReleaseTransitionEvidence = {
  candidateFrozen?: boolean;
  exactHeadReviewApproved?: boolean;
  mergeAuthorizationVerified?: boolean;
  mergeReceiptVerified?: boolean;
  previewVerified?: boolean;
  productionAuthorizationVerified?: boolean;
  productionDeploymentReceiptVerified?: boolean;
  productionSmokeVerified?: boolean;
  rollbackReady?: boolean;
};

export type ReleaseTransitionResult = {
  allowed: boolean;
  from: ScrimedReleaseState;
  to: ScrimedReleaseState;
  reasonCode: string;
  missingEvidence: string[];
  mergePerformed: false;
  deploymentPerformed: false;
  transitionHash: string;
};

const transitions: Record<
  ScrimedReleaseState,
  Partial<Record<ScrimedReleaseState, Array<keyof ReleaseTransitionEvidence>>>
> = {
  DEVELOPMENT: { CANDIDATE: ["candidateFrozen"] },
  CANDIDATE: { REVIEW_REQUESTED: ["candidateFrozen"] },
  REVIEW_REQUESTED: { REVIEW_APPROVED: ["exactHeadReviewApproved"] },
  REVIEW_APPROVED: { MERGE_AUTHORIZED: ["mergeAuthorizationVerified", "rollbackReady"] },
  MERGE_AUTHORIZED: { MERGED: ["mergeReceiptVerified"] },
  MERGED: { PREVIEW_VERIFIED: ["previewVerified"] },
  PREVIEW_VERIFIED: { PRODUCTION_AUTHORIZATION_REQUIRED: ["previewVerified"] },
  PRODUCTION_AUTHORIZATION_REQUIRED: {
    PRODUCTION_DEPLOYED: ["productionAuthorizationVerified", "productionDeploymentReceiptVerified", "rollbackReady"]
  },
  PRODUCTION_DEPLOYED: { PRODUCTION_VERIFIED: ["productionSmokeVerified", "rollbackReady"] },
  PRODUCTION_VERIFIED: {}
};

export const currentPr25ReleaseState: ScrimedReleaseState = "REVIEW_REQUESTED";

export function evaluateReleaseTransition(input: {
  from: ScrimedReleaseState;
  to: ScrimedReleaseState;
  evidence?: ReleaseTransitionEvidence;
}): ReleaseTransitionResult {
  const required = transitions[input.from][input.to];
  const missingEvidence = required
    ? required.filter((key) => input.evidence?.[key] !== true)
    : [];
  const allowed = Boolean(required && missingEvidence.length === 0);
  const result = {
    allowed,
    from: input.from,
    to: input.to,
    reasonCode: !required
      ? "release-transition-not-permitted"
      : missingEvidence.length > 0
        ? "release-transition-evidence-missing"
        : "release-transition-eligible",
    missingEvidence,
    mergePerformed: false as const,
    deploymentPerformed: false as const
  };

  return {
    ...result,
    transitionHash: createClinicalEvidenceHash({
      version: releaseStateMachineVersion,
      ...result
    })
  };
}

export function getReleaseStateSummary() {
  return {
    service: "scrimed-release-state-machine" as const,
    version: releaseStateMachineVersion,
    currentState: currentPr25ReleaseState,
    states: Object.keys(transitions) as ScrimedReleaseState[],
    nextState: "REVIEW_APPROVED" as const,
    nextEvidenceRequired: ["exactHeadReviewApproved"],
    invariants: [
      "Review approval does not authorize merge.",
      "Merge authorization does not authorize production deployment.",
      "Preview verification does not establish production readiness.",
      "Production deployment requires separate exact-candidate authorization and rollback evidence.",
      "Production verification is required after an authorized deployment."
    ],
    mutationAuthorityGranted: false as const
  };
}
