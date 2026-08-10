import policy from "../../config/public-claims-policy.json" with { type: "json" };

export type PublicClaimRule = (typeof policy.blockedRules)[number];

export type PublicClaimsEvaluation = {
  policyVersion: string;
  allowed: boolean;
  blockedClaims: Array<{
    id: string;
    marker: string;
    reason: string;
  }>;
  missingDisclosures: string[];
};

function canonicalize(value: string) {
  return value
    .toLowerCase()
    .replaceAll("\u2019", "'")
    .replace(/\s+/g, " ")
    .trim();
}

function hasUnnegatedMarker(corpus: string, marker: string) {
  let cursor = corpus.indexOf(marker);

  while (cursor >= 0) {
    const prefix = corpus.slice(Math.max(0, cursor - 60), cursor);
    const suffix = corpus.slice(cursor + marker.length, cursor + marker.length + 36);
    const prefixBoundary = Math.max(prefix.lastIndexOf("."), prefix.lastIndexOf("!"), prefix.lastIndexOf("?"));
    const localPrefix = prefix.slice(prefixBoundary + 1);
    const negated =
      policy.negationMarkers.some((negation) => localPrefix.includes(negation))
      || ["prohibited", "blocked", "cannot claim", "must not claim"].some((negation) =>
        suffix.includes(negation)
      );

    if (!negated) return true;
    cursor = corpus.indexOf(marker, cursor + marker.length);
  }

  return false;
}

export function evaluatePublicClaims(content: string): PublicClaimsEvaluation {
  const corpus = canonicalize(content);
  const blockedClaims = policy.blockedRules.flatMap((rule) => {
    const marker = rule.markers
      .map(canonicalize)
      .find(
        (candidate) =>
          corpus.includes(candidate) && (!rule.allowNegated || hasUnnegatedMarker(corpus, candidate))
      );

    return marker ? [{ id: rule.id, marker, reason: rule.reason }] : [];
  });
  const missingDisclosures = policy.requiredDisclosureRules
    .filter((rule) => !rule.markers.map(canonicalize).some((marker) => corpus.includes(marker)))
    .map((rule) => rule.id);

  return {
    policyVersion: policy.version,
    allowed: blockedClaims.length === 0 && missingDisclosures.length === 0,
    blockedClaims,
    missingDisclosures
  };
}

export function getPublicClaimsPolicySummary() {
  return {
    version: policy.version,
    blockedRuleCount: policy.blockedRules.length,
    requiredDisclosureCount: policy.requiredDisclosureRules.length,
    blockedRuleIds: policy.blockedRules.map((rule) => rule.id),
    boundary:
      "A passing string policy is necessary but insufficient. Claims still require evidence ownership, publication permission, expiry review, and qualified human approval."
  };
}
