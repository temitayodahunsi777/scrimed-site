import { readFileSync } from "node:fs";

export const publicClaimsPolicy = JSON.parse(
  readFileSync(new URL("../../config/public-claims-policy.json", import.meta.url), "utf8")
);
export const blockedClaimRules = publicClaimsPolicy.blockedRules;
export const requiredDisclosureRules = publicClaimsPolicy.requiredDisclosureRules;

export function canonicalizePublicContent(value) {
  return value
    .toLowerCase()
    .replaceAll("\\u2019", "'")
    .replaceAll("\\u0027", "'")
    .replaceAll("&rsquo;", "'")
    .replaceAll("&#8217;", "'")
    .replaceAll("&#x2019;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&#x27;", "'")
    .replaceAll("\u2019", "'")
    .replace(/\s+/g, " ");
}

function hasUnnegatedMarker(corpus, marker) {
  let cursor = corpus.indexOf(marker);

  while (cursor >= 0) {
    const prefix = corpus.slice(Math.max(0, cursor - 60), cursor);
    const suffix = corpus.slice(cursor + marker.length, cursor + marker.length + 36);
    const prefixBoundary = Math.max(prefix.lastIndexOf("."), prefix.lastIndexOf("!"), prefix.lastIndexOf("?"));
    const localPrefix = prefix.slice(prefixBoundary + 1);
    const negated =
      publicClaimsPolicy.negationMarkers.some((negation) => localPrefix.includes(negation))
      || ["prohibited", "blocked", "cannot claim", "must not claim"].some((negation) =>
        suffix.includes(negation)
      );

    if (!negated) return true;
    cursor = corpus.indexOf(marker, cursor + marker.length);
  }

  return false;
}

export function evaluatePublicClaimsIntegrity(content) {
  const corpus = canonicalizePublicContent(content);
  const blockedClaims = blockedClaimRules
    .filter((rule) =>
      rule.markers.some((marker) => {
        const canonicalMarker = canonicalizePublicContent(marker);
        return (
          corpus.includes(canonicalMarker)
          && (!rule.allowNegated || hasUnnegatedMarker(corpus, canonicalMarker))
        );
      })
    )
    .map(({ id, reason }) => ({ id, reason }));
  const missingDisclosures = requiredDisclosureRules
    .filter((rule) =>
      !rule.markers.some((marker) => corpus.includes(canonicalizePublicContent(marker)))
    )
    .map((rule) => rule.id);

  return {
    service: "scrimed-public-claims-integrity-smoke",
    status:
      blockedClaims.length === 0 && missingDisclosures.length === 0
        ? "public-claims-integrity-pass"
        : "public-claims-integrity-blocked",
    publicClaimsReleaseAllowed: blockedClaims.length === 0 && missingDisclosures.length === 0,
    policyVersion: publicClaimsPolicy.version,
    blockedClaims,
    missingDisclosures,
    rawPageStored: false,
    visitorDataCollected: false,
    externalMutationPerformed: false,
    boundary:
      "This check evaluates published public copy only. It does not approve claims, mutate Wix, authorize PHI collection, certify compliance, or approve customer go-live."
  };
}
