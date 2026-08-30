export const exactHeadReviewStates = [
  "NOT_REQUESTED",
  "REQUESTED",
  "CURRENT",
  "STALE",
  "CHANGES_REQUESTED",
  "APPROVED_EXACT_HEAD"
] as const;

export type ExactHeadReviewState = (typeof exactHeadReviewStates)[number];

export type ExactHeadReviewStateInput = {
  currentHeadSha: string | null;
  requestedHeadSha: string | null;
  requestAcknowledged: boolean;
  disposition: "NONE" | "COMMENTED" | "CHANGES_REQUESTED" | "APPROVED";
  dispositionHeadSha: string | null;
  trustedExternalReceiptValid: boolean;
};

const gitShaPattern = /^[0-9a-f]{40}$/i;

function normalizedSha(value: string | null) {
  const normalized = value?.trim().toLowerCase() ?? "";
  return gitShaPattern.test(normalized) ? normalized : null;
}

export function deriveExactHeadReviewState(input: ExactHeadReviewStateInput): ExactHeadReviewState {
  const currentHead = normalizedSha(input.currentHeadSha);
  const requestedHead = normalizedSha(input.requestedHeadSha);
  const dispositionHead = normalizedSha(input.dispositionHeadSha);
  if (!currentHead) return "NOT_REQUESTED";

  if (
    (requestedHead && requestedHead !== currentHead)
    || (dispositionHead && dispositionHead !== currentHead)
  ) return "STALE";

  if (input.disposition === "CHANGES_REQUESTED" && dispositionHead === currentHead) {
    return "CHANGES_REQUESTED";
  }
  if (
    input.disposition === "APPROVED"
    && dispositionHead === currentHead
    && input.trustedExternalReceiptValid
  ) return "APPROVED_EXACT_HEAD";

  if (requestedHead === currentHead) {
    return input.requestAcknowledged ? "CURRENT" : "REQUESTED";
  }
  return "NOT_REQUESTED";
}
