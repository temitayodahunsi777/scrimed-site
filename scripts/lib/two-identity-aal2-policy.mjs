import {
  analyzeAal2BearerToken,
  tokenFingerprint,
  userFingerprint
} from "./aal2-token-policy.mjs";

export const twoIdentityTokenEnvironment = {
  operator: "SCRIMED_BEARER_TOKEN",
  reviewer: "SCRIMED_REVIEWER_BEARER_TOKEN"
};

function claim(value, key) {
  return value?.claims && typeof value.claims[key] === "string"
    ? value.claims[key].trim()
    : "";
}

export function analyzeTwoIdentityAal2Tokens({
  operatorToken,
  reviewerToken,
  workspaceSlug,
  nowMs = Date.now()
}) {
  const operator = analyzeAal2BearerToken({
    bearerToken: operatorToken,
    workspaceSlug,
    nowMs
  });
  const reviewer = analyzeAal2BearerToken({
    bearerToken: reviewerToken,
    workspaceSlug,
    nowMs
  });
  const errors = [
    ...operator.errors.map((error) => `Operator token: ${error}`),
    ...reviewer.errors.map((error) => `Reviewer token: ${error}`)
  ];
  const operatorSubject = claim(operator, "sub");
  const reviewerSubject = claim(reviewer, "sub");
  const operatorSession = claim(operator, "session_id");
  const reviewerSession = claim(reviewer, "session_id");

  if (operator.ok && !operatorSubject) {
    errors.push("Operator token must contain a non-empty sub claim for identity separation.");
  }

  if (reviewer.ok && !reviewerSubject) {
    errors.push("Reviewer token must contain a non-empty sub claim for identity separation.");
  }

  if (operatorSubject && reviewerSubject && operatorSubject === reviewerSubject) {
    errors.push("Operator and reviewer tokens must belong to different authenticated users.");
  }

  if (operatorSession && reviewerSession && operatorSession === reviewerSession) {
    errors.push("Operator and reviewer tokens must come from different authenticated sessions.");
  }

  if (operatorToken && reviewerToken && operatorToken.trim() === reviewerToken.trim()) {
    errors.push("Operator and reviewer bearer tokens must be different.");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings: [
      ...operator.warnings.map((warning) => `Operator token: ${warning}`),
      ...reviewer.warnings.map((warning) => `Reviewer token: ${warning}`)
    ],
    workspaceSlug,
    operator: {
      analysis: operator,
      userFingerprint: userFingerprint(operatorSubject),
      sessionFingerprint: userFingerprint(operatorSession),
      tokenFingerprint: operatorToken ? tokenFingerprint(operatorToken) : "missing"
    },
    reviewer: {
      analysis: reviewer,
      userFingerprint: userFingerprint(reviewerSubject),
      sessionFingerprint: userFingerprint(reviewerSession),
      tokenFingerprint: reviewerToken ? tokenFingerprint(reviewerToken) : "missing"
    },
    identitySeparationVerifiedLocally:
      Boolean(operatorSubject) &&
      Boolean(reviewerSubject) &&
      operatorSubject !== reviewerSubject &&
      Boolean(operatorSession) &&
      Boolean(reviewerSession) &&
      operatorSession !== reviewerSession
  };
}

export function formatTwoIdentityAal2Report(result) {
  return [
    `workspace=${result.workspaceSlug || "missing"}`,
    `operator_user=${result.operator.userFingerprint}`,
    `reviewer_user=${result.reviewer.userFingerprint}`,
    `operator_session=${result.operator.sessionFingerprint}`,
    `reviewer_session=${result.reviewer.sessionFingerprint}`,
    `operator_token_fingerprint=${result.operator.tokenFingerprint}`,
    `reviewer_token_fingerprint=${result.reviewer.tokenFingerprint}`,
    `identity_separation=${result.identitySeparationVerifiedLocally ? "verified-local-claims" : "not-verified"}`,
    "signature_and_roles=verified-by-protected-api"
  ].join(" ");
}
