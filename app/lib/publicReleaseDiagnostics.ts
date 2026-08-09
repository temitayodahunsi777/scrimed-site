import { getPublicCompanyIdentity } from "./companyIdentity";
import { getScrimedOperatingModeSummary } from "./operatingMode";
import { getPublicClaimsPolicySummary } from "./publicClaimsPolicy";

function releaseIdentifier() {
  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.trim();

  if (commit && /^[a-f0-9]{40}$/i.test(commit)) {
    return commit.slice(0, 12).toLowerCase();
  }

  return "local-unbound";
}

export function getPublicReleaseDiagnostics() {
  return {
    service: "scrimed-public-release-status",
    releaseId: releaseIdentifier(),
    status: "pre-commercial-synthetic-demonstration",
    company: getPublicCompanyIdentity(),
    operatingMode: getScrimedOperatingModeSummary(),
    publicClaimsPolicy: getPublicClaimsPolicySummary(),
    authoritativeApplicationHost: "app.scrimedsolutions.com",
    marketingContentHost: "www.scrimedsolutions.com",
    marketingContentAuthority: "external-wix-editor",
    productionReleaseAuthorized: false,
    customerGoLiveAuthorized: false,
    boundary:
      "Diagnostic metadata only. It exposes no credentials, environment values, PHI, customer data, deployment authorization, or compliance approval."
  };
}
