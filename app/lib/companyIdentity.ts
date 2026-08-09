export type CompanyIdentity = {
  displayName: "SCRIMED SOLUTIONS";
  productName: "SCRIMED";
  commercialStatus: "pre-commercial";
  canonicalMarketingUrl: "https://www.scrimedsolutions.com";
  applicationUrl: "https://app.scrimedsolutions.com";
  publicContactEmail: "scrimedsolutions@gmail.com";
  privacyContactEmail: "scrimedsolutions@gmail.com";
  accessibilityContactEmail: "scrimedsolutions@gmail.com";
  securityContactPath: "/security";
  publishedStreetAddress: null;
  registeredLegalName: null;
  governingJurisdiction: null;
};

export const companyIdentity: CompanyIdentity = {
  displayName: "SCRIMED SOLUTIONS",
  productName: "SCRIMED",
  commercialStatus: "pre-commercial",
  canonicalMarketingUrl: "https://www.scrimedsolutions.com",
  applicationUrl: "https://app.scrimedsolutions.com",
  publicContactEmail: "scrimedsolutions@gmail.com",
  privacyContactEmail: "scrimedsolutions@gmail.com",
  accessibilityContactEmail: "scrimedsolutions@gmail.com",
  securityContactPath: "/security",
  publishedStreetAddress: null,
  registeredLegalName: null,
  governingJurisdiction: null
};

export const companyIdentityBoundary =
  "SCRIMED does not publish a street address, registered legal name, or governing jurisdiction until the Founder and qualified counsel verify the applicable record.";

export function applicationUrl(path = "/") {
  return new URL(path, `${companyIdentity.applicationUrl}/`).toString();
}

export function marketingUrl(path = "/") {
  return new URL(path, `${companyIdentity.canonicalMarketingUrl}/`).toString();
}

export function getPublicCompanyIdentity() {
  return {
    displayName: companyIdentity.displayName,
    productName: companyIdentity.productName,
    commercialStatus: companyIdentity.commercialStatus,
    canonicalMarketingUrl: companyIdentity.canonicalMarketingUrl,
    applicationUrl: companyIdentity.applicationUrl,
    publicContactEmail: companyIdentity.publicContactEmail,
    publishedStreetAddress: companyIdentity.publishedStreetAddress,
    boundary: companyIdentityBoundary
  };
}
