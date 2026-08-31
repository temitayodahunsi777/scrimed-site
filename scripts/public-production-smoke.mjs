#!/usr/bin/env node

import { readdir } from "node:fs/promises";
import { redactSensitive } from "./lib/aal2-token-policy.mjs";
import {
  boundedPublicFetch,
  normalizePublicSmokeBaseUrl,
  parsePublicSmokeMaxAttempts,
  parsePublicSmokeMaxResponseBytes,
  parsePublicSmokeTimeoutMs,
  readBoundedResponseText
} from "./lib/bounded-public-fetch.mjs";
import { bindVercelPreviewAccessCookie } from "./lib/vercel-preview-access.mjs";

const baseUrl = normalizePublicSmokeBaseUrl(
  process.env.SCRIMED_BASE_URL,
  "https://app.scrimedsolutions.com"
);
const requestTimeoutMs = parsePublicSmokeTimeoutMs(
  process.env.SCRIMED_SMOKE_REQUEST_TIMEOUT_MS
);
const maxResponseBytes = parsePublicSmokeMaxResponseBytes(
  process.env.SCRIMED_SMOKE_MAX_RESPONSE_BYTES
);
const maxReadAttempts = parsePublicSmokeMaxAttempts(
  process.env.SCRIMED_SMOKE_MAX_ATTEMPTS
);
const workspaceSlug = process.env.SCRIMED_WORKSPACE_SLUG?.trim() || "atlas-synthetic-evaluation";
const previewAccessCookie = bindVercelPreviewAccessCookie({
  cookie: process.env.SCRIMED_PREVIEW_ACCESS_COOKIE,
  accessOrigin: process.env.SCRIMED_PREVIEW_ACCESS_ORIGIN,
  requestOrigin: baseUrl
})?.header;
if (!/^[a-z0-9][a-z0-9-]{2,80}$/.test(workspaceSlug)) {
  throw new Error("SCRIMED_WORKSPACE_SLUG must be a bounded lowercase workspace slug.");
}

function endpoint(path) {
  return `${baseUrl}${path}`;
}

async function countRouteFiles(root, fileName) {
  const entries = await readdir(root, { recursive: true, withFileTypes: true });

  return entries.filter((entry) => entry.isFile() && entry.name === fileName).length;
}

async function readResponse(response) {
  const text = await readBoundedResponseText(response, maxResponseBytes, {
    timeoutMs: requestTimeoutMs
  });

  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

async function request(path) {
  let response;

  try {
    response = await boundedPublicFetch(endpoint(path), {
      headers: previewAccessCookie ? { Cookie: previewAccessCookie } : {}
    }, {
      timeoutMs: requestTimeoutMs,
      maxAttempts: maxReadAttempts
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const cause = error instanceof Error && error.cause instanceof Error ? ` Cause: ${error.cause.message}` : "";

    throw new Error(
      redactSensitive(
        `public smoke could not reach ${endpoint(path)}. Verify SCRIMED_BASE_URL, local server state, or approved network access. ${message}.${cause}`
      )
    );
  }

  const body = await readResponse(response);
  return { body, response };
}

async function postJson(path, payload, extraHeaders = {}) {
  let response;

  try {
    response = await boundedPublicFetch(
      endpoint(path),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(previewAccessCookie ? { Cookie: previewAccessCookie } : {}),
          ...extraHeaders
        },
        body: JSON.stringify(payload)
      },
      { timeoutMs: requestTimeoutMs }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const cause = error instanceof Error && error.cause instanceof Error ? ` Cause: ${error.cause.message}` : "";

    throw new Error(
      redactSensitive(
        `public smoke could not reach ${endpoint(path)}. Verify SCRIMED_BASE_URL, local server state, or approved network access. ${message}.${cause}`
      )
    );
  }

  const body = await readResponse(response);
  return { body, response };
}

function requireStatus(label, actual, expected) {
  const expectedValues = Array.isArray(expected) ? expected : [expected];

  if (!expectedValues.includes(actual)) {
    throw new Error(`${label} expected ${expectedValues.join(" or ")} but received ${actual}.`);
  }
}

function requireJson(label, body) {
  if (!body.json) {
    throw new Error(`${label} expected JSON response.`);
  }

  return body.json;
}

function requireContentType(label, response, expected) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes(expected)) {
    throw new Error(`${label} expected content-type containing ${expected} but received ${contentType}.`);
  }
}

function requireSyntheticBoundary(label, response) {
  const boundary = response.headers.get("x-scrimed-data-boundary");

  if (boundary !== "synthetic-only") {
    throw new Error(`${label} expected x-scrimed-data-boundary synthetic-only but received ${boundary}.`);
  }
}

function requireNoClinicalCareAuthority(label, response) {
  const authority = response.headers.get("x-scrimed-clinical-care-authority");

  if (authority !== "not-authorized-live-care") {
    throw new Error(`${label} expected x-scrimed-clinical-care-authority not-authorized-live-care but received ${authority}.`);
  }
}

function requireSyntheticMetadataBoundary(label, response) {
  const boundary = response.headers.get("x-scrimed-data-boundary");

  if (boundary !== "synthetic-and-metadata-only") {
    throw new Error(`${label} expected x-scrimed-data-boundary synthetic-and-metadata-only but received ${boundary}.`);
  }
}

function requireScrimedIntelligencePlatformBoundary(label, response) {
  const ehrWriteback = response.headers.get("x-scrimed-ehr-writeback");
  const imagingAuthority = response.headers.get("x-scrimed-imaging-authority");
  const intelligencePlatform = response.headers.get("x-scrimed-intelligence-platform");
  const payerSubmission = response.headers.get("x-scrimed-payer-submission");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const productionActivation = response.headers.get("x-scrimed-production-activation");
  const securityCertification = response.headers.get("x-scrimed-security-certification");
  const tokenHandling = response.headers.get("x-scrimed-token-handling");

  requireSyntheticMetadataBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (intelligencePlatform !== "scrimed-intelligence-platform-active-synthetic-only") {
    throw new Error(`${label} expected intelligence platform active synthetic-only header but received ${intelligencePlatform}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (ehrWriteback !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-ehr-writeback not-authorized but received ${ehrWriteback}.`);
  }

  if (payerSubmission !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-payer-submission not-authorized but received ${payerSubmission}.`);
  }

  if (imagingAuthority !== "not-final-medical-interpretation") {
    throw new Error(`${label} expected x-scrimed-imaging-authority not-final-medical-interpretation but received ${imagingAuthority}.`);
  }

  if (productionActivation !== "not-authorized-customer-go-live") {
    throw new Error(`${label} expected x-scrimed-production-activation not-authorized-customer-go-live but received ${productionActivation}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }

  if (tokenHandling !== "no-token-values-exposed-or-retained") {
    throw new Error(`${label} expected x-scrimed-token-handling no-token-values-exposed-or-retained but received ${tokenHandling}.`);
  }
}

function requireSalesBoundary(label, response) {
  const boundary = response.headers.get("x-scrimed-data-boundary");

  if (boundary !== "business-contact-and-workflow-scope-only") {
    throw new Error(`${label} expected x-scrimed-data-boundary business-contact-and-workflow-scope-only but received ${boundary}.`);
  }
}

function requirePublicMarketBoundary(label, response) {
  const financialAuthority = response.headers.get("x-scrimed-financial-authority");
  const securitiesAuthority = response.headers.get("x-scrimed-securities-authority");

  requireSyntheticBoundary(label, response);

  if (financialAuthority !== "not-audited-financial-report") {
    throw new Error(`${label} expected x-scrimed-financial-authority not-audited-financial-report but received ${financialAuthority}.`);
  }

  if (securitiesAuthority !== "not-securities-offering-material") {
    throw new Error(`${label} expected x-scrimed-securities-authority not-securities-offering-material but received ${securitiesAuthority}.`);
  }
}

function requireCapitalVitalityBoundary(label, response) {
  const approvalAuthority = response.headers.get("x-scrimed-approval-authority");
  const capitalInputPersistence = response.headers.get("x-scrimed-capital-input-persistence");
  const capturePacket = response.headers.get("x-scrimed-capture-packet");
  const capitalVitality = response.headers.get("x-scrimed-capital-vitality");
  const financialAuthority = response.headers.get("x-scrimed-financial-authority");
  const federalOfferAuthority = response.headers.get("x-scrimed-federal-offer-authority");
  const fundraisingRelease = response.headers.get("x-scrimed-fundraising-release");
  const governmentAwardAuthority = response.headers.get("x-scrimed-government-award-authority");
  const governmentRegistration = response.headers.get("x-scrimed-government-registration");
  const investmentAdvice = response.headers.get("x-scrimed-investment-advice");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const publicSectorSubmission = response.headers.get("x-scrimed-public-sector-submission");
  const reimbursementAuthority = response.headers.get("x-scrimed-reimbursement-authority");
  const samControl = response.headers.get("x-scrimed-sam-control");
  const securitiesAuthority = response.headers.get("x-scrimed-securities-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");
  const valuationAuthority = response.headers.get("x-scrimed-valuation-authority");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (approvalAuthority !== "external-review-required") {
    throw new Error(`${label} expected x-scrimed-approval-authority external-review-required but received ${approvalAuthority}.`);
  }

  if (capitalInputPersistence !== "none-local-browser-only") {
    throw new Error(`${label} expected x-scrimed-capital-input-persistence none-local-browser-only but received ${capitalInputPersistence}.`);
  }

  if (capturePacket !== "internal-metadata-only-not-release-authority") {
    throw new Error(`${label} expected x-scrimed-capture-packet internal-metadata-only-not-release-authority but received ${capturePacket}.`);
  }

  if (![
    "capital-vitality-revenue-funding-readiness-active",
    "capital-vitality-brief-ready-no-securities-offer"
  ].includes(capitalVitality ?? "")) {
    throw new Error(`${label} expected capital vitality boundary header but received ${capitalVitality}.`);
  }

  if (financialAuthority !== "not-audited-financial-report") {
    throw new Error(`${label} expected x-scrimed-financial-authority not-audited-financial-report but received ${financialAuthority}.`);
  }

  if (federalOfferAuthority !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-federal-offer-authority not-authorized but received ${federalOfferAuthority}.`);
  }

  if (fundraisingRelease !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-fundraising-release not-authorized but received ${fundraisingRelease}.`);
  }

  if (governmentAwardAuthority !== "not-contract-or-grant-award") {
    throw new Error(`${label} expected x-scrimed-government-award-authority not-contract-or-grant-award but received ${governmentAwardAuthority}.`);
  }

  if (governmentRegistration !== "not-verified") {
    throw new Error(`${label} expected x-scrimed-government-registration not-verified but received ${governmentRegistration}.`);
  }

  if (investmentAdvice !== "not-investment-advice") {
    throw new Error(`${label} expected x-scrimed-investment-advice not-investment-advice but received ${investmentAdvice}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (publicSectorSubmission !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-public-sector-submission not-authorized but received ${publicSectorSubmission}.`);
  }

  if (reimbursementAuthority !== "no-reimbursement-guarantee") {
    throw new Error(`${label} expected x-scrimed-reimbursement-authority no-reimbursement-guarantee but received ${reimbursementAuthority}.`);
  }

  if (samControl !== "operator-evidence-required") {
    throw new Error(`${label} expected x-scrimed-sam-control operator-evidence-required but received ${samControl}.`);
  }

  if (securitiesAuthority !== "not-securities-offering-material") {
    throw new Error(`${label} expected x-scrimed-securities-authority not-securities-offering-material but received ${securitiesAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }

  if (valuationAuthority !== "not-valuation-assurance") {
    throw new Error(`${label} expected x-scrimed-valuation-authority not-valuation-assurance but received ${valuationAuthority}.`);
  }
}

function requireGrowthEngineBoundary(label, response) {
  const approvalAuthority = response.headers.get("x-scrimed-approval-authority");
  const financialAuthority = response.headers.get("x-scrimed-financial-authority");
  const growthEngine = response.headers.get("x-scrimed-growth-engine");
  const investmentAdvice = response.headers.get("x-scrimed-investment-advice");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const reimbursementAuthority = response.headers.get("x-scrimed-reimbursement-authority");
  const revenueAuthority = response.headers.get("x-scrimed-revenue-authority");
  const securitiesAuthority = response.headers.get("x-scrimed-securities-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");
  const valuationAuthority = response.headers.get("x-scrimed-valuation-authority");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (approvalAuthority !== "external-review-required") {
    throw new Error(`${label} expected x-scrimed-approval-authority external-review-required but received ${approvalAuthority}.`);
  }

  if (![
    "commercial-growth-engine-active",
    "commercial-growth-engine-brief-ready-no-revenue-guarantee"
  ].includes(growthEngine ?? "")) {
    throw new Error(`${label} expected growth engine boundary header but received ${growthEngine}.`);
  }

  if (financialAuthority !== "not-audited-financial-report") {
    throw new Error(`${label} expected x-scrimed-financial-authority not-audited-financial-report but received ${financialAuthority}.`);
  }

  if (investmentAdvice !== "not-investment-advice") {
    throw new Error(`${label} expected x-scrimed-investment-advice not-investment-advice but received ${investmentAdvice}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (reimbursementAuthority !== "no-reimbursement-guarantee") {
    throw new Error(`${label} expected x-scrimed-reimbursement-authority no-reimbursement-guarantee but received ${reimbursementAuthority}.`);
  }

  if (revenueAuthority !== "not-revenue-guarantee") {
    throw new Error(`${label} expected x-scrimed-revenue-authority not-revenue-guarantee but received ${revenueAuthority}.`);
  }

  if (securitiesAuthority !== "not-securities-offering-material") {
    throw new Error(`${label} expected x-scrimed-securities-authority not-securities-offering-material but received ${securitiesAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }

  if (valuationAuthority !== "not-valuation-assurance") {
    throw new Error(`${label} expected x-scrimed-valuation-authority not-valuation-assurance but received ${valuationAuthority}.`);
  }
}

function requireInvestorAudienceReadinessBoundary(label, response) {
  const approvalAuthority = response.headers.get("x-scrimed-approval-authority");
  const clinicalCareAuthority = response.headers.get("x-scrimed-clinical-care-authority");
  const dataBoundary = response.headers.get("x-scrimed-data-boundary");
  const faithBasedAuthority = response.headers.get("x-scrimed-faith-based-authority");
  const financialAuthority = response.headers.get("x-scrimed-financial-authority");
  const investmentAdvice = response.headers.get("x-scrimed-investment-advice");
  const readiness = response.headers.get("x-scrimed-investor-audience-readiness");
  const legalAuthority = response.headers.get("x-scrimed-legal-authority");
  const nonprofitAuthority = response.headers.get("x-scrimed-nonprofit-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const profitAuthority = response.headers.get("x-scrimed-profit-authority");
  const reimbursementAuthority = response.headers.get("x-scrimed-reimbursement-authority");
  const revenueAuthority = response.headers.get("x-scrimed-revenue-authority");
  const securitiesAuthority = response.headers.get("x-scrimed-securities-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");
  const solicitationAuthority = response.headers.get("x-scrimed-solicitation-authority");
  const externalOutreach = response.headers.get("x-scrimed-external-outreach");
  const strategicRelationship = response.headers.get("x-scrimed-strategic-relationship");
  const taxAuthority = response.headers.get("x-scrimed-tax-authority");
  const valuationAuthority = response.headers.get("x-scrimed-valuation-authority");

  if (approvalAuthority !== "external-review-required") {
    throw new Error(`${label} expected x-scrimed-approval-authority external-review-required but received ${approvalAuthority}.`);
  }

  if (clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error(`${label} expected x-scrimed-clinical-care-authority not-authorized-live-care but received ${clinicalCareAuthority}.`);
  }

  if (dataBoundary !== "synthetic-and-business-readiness-only") {
    throw new Error(`${label} expected x-scrimed-data-boundary synthetic-and-business-readiness-only but received ${dataBoundary}.`);
  }

  if (faithBasedAuthority !== "not-endorsement-or-donor-advice") {
    throw new Error(`${label} expected x-scrimed-faith-based-authority not-endorsement-or-donor-advice but received ${faithBasedAuthority}.`);
  }

  if (financialAuthority !== "not-audited-financial-report") {
    throw new Error(`${label} expected x-scrimed-financial-authority not-audited-financial-report but received ${financialAuthority}.`);
  }

  if (investmentAdvice !== "not-investment-advice") {
    throw new Error(`${label} expected x-scrimed-investment-advice not-investment-advice but received ${investmentAdvice}.`);
  }

  if (![
    "investor-audience-readiness-control-plane-active",
    "investor-audience-readiness-brief-ready-no-securities-offer"
  ].includes(readiness ?? "")) {
    throw new Error(`${label} expected investor audience readiness header but received ${readiness}.`);
  }

  if (legalAuthority !== "qualified-review-required") {
    throw new Error(`${label} expected x-scrimed-legal-authority qualified-review-required but received ${legalAuthority}.`);
  }

  if (nonprofitAuthority !== "qualified-review-required") {
    throw new Error(`${label} expected x-scrimed-nonprofit-authority qualified-review-required but received ${nonprofitAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (profitAuthority !== "not-profit-margin-guarantee") {
    throw new Error(`${label} expected x-scrimed-profit-authority not-profit-margin-guarantee but received ${profitAuthority}.`);
  }

  if (reimbursementAuthority !== "no-reimbursement-guarantee") {
    throw new Error(`${label} expected x-scrimed-reimbursement-authority no-reimbursement-guarantee but received ${reimbursementAuthority}.`);
  }

  if (revenueAuthority !== "not-revenue-guarantee") {
    throw new Error(`${label} expected x-scrimed-revenue-authority not-revenue-guarantee but received ${revenueAuthority}.`);
  }

  if (securitiesAuthority !== "not-securities-offering-material") {
    throw new Error(`${label} expected x-scrimed-securities-authority not-securities-offering-material but received ${securitiesAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }

  if (solicitationAuthority !== "not-solicitation") {
    throw new Error(`${label} expected x-scrimed-solicitation-authority not-solicitation but received ${solicitationAuthority}.`);
  }

  if (externalOutreach !== "not-sent") {
    throw new Error(`${label} expected x-scrimed-external-outreach not-sent but received ${externalOutreach}.`);
  }

  if (strategicRelationship !== "not-implied") {
    throw new Error(`${label} expected x-scrimed-strategic-relationship not-implied but received ${strategicRelationship}.`);
  }

  if (taxAuthority !== "qualified-review-required") {
    throw new Error(`${label} expected x-scrimed-tax-authority qualified-review-required but received ${taxAuthority}.`);
  }

  if (valuationAuthority !== "not-valuation-assurance") {
    throw new Error(`${label} expected x-scrimed-valuation-authority not-valuation-assurance but received ${valuationAuthority}.`);
  }
}

function requireLaunchReadinessBoundary(label, response) {
  const accountingAuthority = response.headers.get("x-scrimed-accounting-authority");
  const clinicalCareAuthority = response.headers.get("x-scrimed-clinical-care-authority");
  const connectorAuthority = response.headers.get("x-scrimed-connector-authority");
  const customerReleaseAuthority = response.headers.get("x-scrimed-customer-release-authority");
  const dataBoundary = response.headers.get("x-scrimed-data-boundary");
  const dnsAuthority = response.headers.get("x-scrimed-dns-authority");
  const fallbackAuthority = response.headers.get("x-scrimed-fallback-authority");
  const launchApprovalAuthority = response.headers.get("x-scrimed-launch-approval-authority");
  const launchReadiness = response.headers.get("x-scrimed-launch-readiness");
  const legalAuthority = response.headers.get("x-scrimed-legal-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const profitAuthority = response.headers.get("x-scrimed-profit-authority");
  const revenueAuthority = response.headers.get("x-scrimed-revenue-authority");
  const sandboxBypassAuthority = response.headers.get("x-scrimed-sandbox-bypass-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");
  const slaAuthority = response.headers.get("x-scrimed-sla-authority");
  const taxAuthority = response.headers.get("x-scrimed-tax-authority");

  if (accountingAuthority !== "qualified-review-required") {
    throw new Error(`${label} expected x-scrimed-accounting-authority qualified-review-required but received ${accountingAuthority}.`);
  }

  if (clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error(`${label} expected x-scrimed-clinical-care-authority not-authorized-live-care but received ${clinicalCareAuthority}.`);
  }

  if (connectorAuthority !== "not-production-connector-approved") {
    throw new Error(`${label} expected x-scrimed-connector-authority not-production-connector-approved but received ${connectorAuthority}.`);
  }

  if (customerReleaseAuthority !== "customer-permission-and-release-control-required") {
    throw new Error(`${label} expected x-scrimed-customer-release-authority customer-permission-and-release-control-required but received ${customerReleaseAuthority}.`);
  }

  if (dataBoundary !== "synthetic-business-and-metadata-only") {
    throw new Error(`${label} expected x-scrimed-data-boundary synthetic-business-and-metadata-only but received ${dataBoundary}.`);
  }

  if (dnsAuthority !== "verification-and-routing-only") {
    throw new Error(`${label} expected x-scrimed-dns-authority verification-and-routing-only but received ${dnsAuthority}.`);
  }

  if (fallbackAuthority !== "continuity-only-not-launch-approval") {
    throw new Error(`${label} expected x-scrimed-fallback-authority continuity-only-not-launch-approval but received ${fallbackAuthority}.`);
  }

  if (launchApprovalAuthority !== "human-launch-review-required") {
    throw new Error(`${label} expected x-scrimed-launch-approval-authority human-launch-review-required but received ${launchApprovalAuthority}.`);
  }

  if (![
    "launch-readiness-control-plane-active",
    "launch-readiness-brief-ready"
  ].includes(launchReadiness ?? "")) {
    throw new Error(`${label} expected launch readiness header but received ${launchReadiness}.`);
  }

  if (legalAuthority !== "qualified-review-required") {
    throw new Error(`${label} expected x-scrimed-legal-authority qualified-review-required but received ${legalAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (profitAuthority !== "not-profit-margin-guarantee") {
    throw new Error(`${label} expected x-scrimed-profit-authority not-profit-margin-guarantee but received ${profitAuthority}.`);
  }

  if (revenueAuthority !== "not-revenue-guarantee") {
    throw new Error(`${label} expected x-scrimed-revenue-authority not-revenue-guarantee but received ${revenueAuthority}.`);
  }

  if (sandboxBypassAuthority !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-sandbox-bypass-authority not-authorized but received ${sandboxBypassAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }

  if (slaAuthority !== "not-contractual-sla") {
    throw new Error(`${label} expected x-scrimed-sla-authority not-contractual-sla but received ${slaAuthority}.`);
  }

  if (taxAuthority !== "qualified-review-required") {
    throw new Error(`${label} expected x-scrimed-tax-authority qualified-review-required but received ${taxAuthority}.`);
  }
}

function requireCompetitiveDefenseBoundary(label, response) {
  const attackGuarantee = response.headers.get("x-scrimed-attack-guarantee");
  const clinicalCareAuthority = response.headers.get("x-scrimed-clinical-care-authority");
  const competitiveDefense = response.headers.get("x-scrimed-competitive-defense");
  const competitorPartnership = response.headers.get("x-scrimed-competitor-partnership");
  const customerReleaseAuthority = response.headers.get("x-scrimed-customer-release-authority");
  const dataBoundary = response.headers.get("x-scrimed-data-boundary");
  const legalAuthority = response.headers.get("x-scrimed-legal-authority");
  const penetrationTestAuthority = response.headers.get("x-scrimed-penetration-test-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const privacyAuthority = response.headers.get("x-scrimed-privacy-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  if (attackGuarantee !== "not-protection-guarantee") {
    throw new Error(`${label} expected x-scrimed-attack-guarantee not-protection-guarantee but received ${attackGuarantee}.`);
  }

  if (clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error(`${label} expected x-scrimed-clinical-care-authority not-authorized-live-care but received ${clinicalCareAuthority}.`);
  }

  if (![
    "competitive-defense-hardening-active",
    "competitive-defense-brief-ready-no-legal-security-certification"
  ].includes(competitiveDefense ?? "")) {
    throw new Error(`${label} expected competitive defense header but received ${competitiveDefense}.`);
  }

  if (competitorPartnership !== "not-third-party-partnership") {
    throw new Error(`${label} expected x-scrimed-competitor-partnership not-third-party-partnership but received ${competitorPartnership}.`);
  }

  if (customerReleaseAuthority !== "customer-permission-and-release-control-required") {
    throw new Error(`${label} expected x-scrimed-customer-release-authority customer-permission-and-release-control-required but received ${customerReleaseAuthority}.`);
  }

  if (dataBoundary !== "synthetic-business-and-metadata-only") {
    throw new Error(`${label} expected x-scrimed-data-boundary synthetic-business-and-metadata-only but received ${dataBoundary}.`);
  }

  if (legalAuthority !== "not-legal-advice-qualified-review-required") {
    throw new Error(`${label} expected x-scrimed-legal-authority not-legal-advice-qualified-review-required but received ${legalAuthority}.`);
  }

  if (penetrationTestAuthority !== "not-penetration-test-authorization") {
    throw new Error(`${label} expected x-scrimed-penetration-test-authority not-penetration-test-authorization but received ${penetrationTestAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (privacyAuthority !== "qualified-privacy-review-required") {
    throw new Error(`${label} expected x-scrimed-privacy-authority qualified-privacy-review-required but received ${privacyAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireEnterpriseBusinessOpsBoundary(label, response) {
  const accountingAuthority = response.headers.get("x-scrimed-accounting-authority");
  const businessOps = response.headers.get("x-scrimed-enterprise-business-ops");
  const contractAuthority = response.headers.get("x-scrimed-contract-authority");
  const dataBoundary = response.headers.get("x-scrimed-data-boundary");
  const financialAuthority = response.headers.get("x-scrimed-financial-authority");
  const investmentAdvice = response.headers.get("x-scrimed-investment-advice");
  const legalAuthority = response.headers.get("x-scrimed-legal-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const profitAuthority = response.headers.get("x-scrimed-profit-authority");
  const revenueAuthority = response.headers.get("x-scrimed-revenue-authority");
  const securitiesAuthority = response.headers.get("x-scrimed-securities-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");
  const taxAuthority = response.headers.get("x-scrimed-tax-authority");
  const valuationAuthority = response.headers.get("x-scrimed-valuation-authority");

  requireNoClinicalCareAuthority(label, response);

  if (!["control-plane-active", "brief-no-legal-accounting-advice"].includes(businessOps ?? "")) {
    throw new Error(`${label} expected enterprise business ops boundary header but received ${businessOps}.`);
  }

  if (accountingAuthority !== "qualified-accounting-review-required") {
    throw new Error(`${label} expected x-scrimed-accounting-authority qualified-accounting-review-required but received ${accountingAuthority}.`);
  }

  if (contractAuthority !== "human-executive-approval-required") {
    throw new Error(`${label} expected x-scrimed-contract-authority human-executive-approval-required but received ${contractAuthority}.`);
  }

  if (dataBoundary !== "business-and-metadata-only") {
    throw new Error(`${label} expected x-scrimed-data-boundary business-and-metadata-only but received ${dataBoundary}.`);
  }

  if (financialAuthority !== "not-audited-financial-report") {
    throw new Error(`${label} expected x-scrimed-financial-authority not-audited-financial-report but received ${financialAuthority}.`);
  }

  if (investmentAdvice !== "not-investment-advice") {
    throw new Error(`${label} expected x-scrimed-investment-advice not-investment-advice but received ${investmentAdvice}.`);
  }

  if (legalAuthority !== "qualified-counsel-review-required") {
    throw new Error(`${label} expected x-scrimed-legal-authority qualified-counsel-review-required but received ${legalAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (profitAuthority !== "not-profit-margin-guarantee") {
    throw new Error(`${label} expected x-scrimed-profit-authority not-profit-margin-guarantee but received ${profitAuthority}.`);
  }

  if (revenueAuthority !== "not-revenue-guarantee") {
    throw new Error(`${label} expected x-scrimed-revenue-authority not-revenue-guarantee but received ${revenueAuthority}.`);
  }

  if (securitiesAuthority !== "not-securities-offering-material") {
    throw new Error(`${label} expected x-scrimed-securities-authority not-securities-offering-material but received ${securitiesAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }

  if (taxAuthority !== "qualified-tax-review-required") {
    throw new Error(`${label} expected x-scrimed-tax-authority qualified-tax-review-required but received ${taxAuthority}.`);
  }

  if (valuationAuthority !== "not-valuation-assurance") {
    throw new Error(`${label} expected x-scrimed-valuation-authority not-valuation-assurance but received ${valuationAuthority}.`);
  }
}

function requireEnterpriseScalabilityBoundary(label, response) {
  const clinicalCareAuthority = response.headers.get("x-scrimed-clinical-care-authority");
  const connectorAuthority = response.headers.get("x-scrimed-connector-authority");
  const dataBoundary = response.headers.get("x-scrimed-data-boundary");
  const managedServiceAuthority = response.headers.get("x-scrimed-managed-service-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const profitAuthority = response.headers.get("x-scrimed-profit-authority");
  const revenueAuthority = response.headers.get("x-scrimed-revenue-authority");
  const scaleAuthority = response.headers.get("x-scrimed-scale-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");
  const slaAuthority = response.headers.get("x-scrimed-sla-authority");

  if (clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error(`${label} expected x-scrimed-clinical-care-authority not-authorized-live-care but received ${clinicalCareAuthority}.`);
  }

  if (connectorAuthority !== "not-production-connector-approved") {
    throw new Error(`${label} expected x-scrimed-connector-authority not-production-connector-approved but received ${connectorAuthority}.`);
  }

  if (dataBoundary !== "synthetic-business-and-metadata-only") {
    throw new Error(`${label} expected x-scrimed-data-boundary synthetic-business-and-metadata-only but received ${dataBoundary}.`);
  }

  if (managedServiceAuthority !== "not-managed-service-commitment") {
    throw new Error(`${label} expected x-scrimed-managed-service-authority not-managed-service-commitment but received ${managedServiceAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (profitAuthority !== "not-profit-margin-guarantee") {
    throw new Error(`${label} expected x-scrimed-profit-authority not-profit-margin-guarantee but received ${profitAuthority}.`);
  }

  if (revenueAuthority !== "not-revenue-guarantee") {
    throw new Error(`${label} expected x-scrimed-revenue-authority not-revenue-guarantee but received ${revenueAuthority}.`);
  }

  if (scaleAuthority !== "readiness-only-not-production-sla") {
    throw new Error(`${label} expected x-scrimed-scale-authority readiness-only-not-production-sla but received ${scaleAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }

  if (slaAuthority !== "not-contractual-sla") {
    throw new Error(`${label} expected x-scrimed-sla-authority not-contractual-sla but received ${slaAuthority}.`);
  }
}

function requirePlatformPowerBoundary(label, response) {
  const agentAuthority = response.headers.get("x-scrimed-agent-authority");
  const aiAuthority = response.headers.get("x-scrimed-ai-authority");
  const apiAuthority = response.headers.get("x-scrimed-api-authority");
  const clinicalCareAuthority = response.headers.get("x-scrimed-clinical-care-authority");
  const connectorAuthority = response.headers.get("x-scrimed-connector-authority");
  const dataBoundary = response.headers.get("x-scrimed-data-boundary");
  const modelAuthority = response.headers.get("x-scrimed-model-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const platformPower = response.headers.get("x-scrimed-platform-power");
  const securityCertification = response.headers.get("x-scrimed-security-certification");
  const slaAuthority = response.headers.get("x-scrimed-sla-authority");
  const trillionScaleAuthority = response.headers.get("x-scrimed-trillion-scale-authority");
  const uiAuthority = response.headers.get("x-scrimed-ui-authority");

  if (!["control-plane-active", "api-ui-ai-platform-power-brief-ready-no-live-ai-authority"].includes(platformPower ?? "")) {
    throw new Error(`${label} expected platform power boundary header but received ${platformPower}.`);
  }

  if (agentAuthority !== "human-approval-required-for-protected-actions") {
    throw new Error(`${label} expected x-scrimed-agent-authority human-approval-required-for-protected-actions but received ${agentAuthority}.`);
  }

  if (aiAuthority !== "no-live-autonomous-ai-authority") {
    throw new Error(`${label} expected x-scrimed-ai-authority no-live-autonomous-ai-authority but received ${aiAuthority}.`);
  }

  if (apiAuthority !== "contract-readiness-not-public-api-sla") {
    throw new Error(`${label} expected x-scrimed-api-authority contract-readiness-not-public-api-sla but received ${apiAuthority}.`);
  }

  if (clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error(`${label} expected x-scrimed-clinical-care-authority not-authorized-live-care but received ${clinicalCareAuthority}.`);
  }

  if (connectorAuthority !== "not-production-connector-approved") {
    throw new Error(`${label} expected x-scrimed-connector-authority not-production-connector-approved but received ${connectorAuthority}.`);
  }

  if (dataBoundary !== "synthetic-business-and-metadata-only") {
    throw new Error(`${label} expected x-scrimed-data-boundary synthetic-business-and-metadata-only but received ${dataBoundary}.`);
  }

  if (modelAuthority !== "not-production-model-routing-approved") {
    throw new Error(`${label} expected x-scrimed-model-authority not-production-model-routing-approved but received ${modelAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }

  if (slaAuthority !== "not-contractual-sla") {
    throw new Error(`${label} expected x-scrimed-sla-authority not-contractual-sla but received ${slaAuthority}.`);
  }

  if (trillionScaleAuthority !== "aspirational-design-not-scale-equivalence") {
    throw new Error(`${label} expected x-scrimed-trillion-scale-authority aspirational-design-not-scale-equivalence but received ${trillionScaleAuthority}.`);
  }

  if (uiAuthority !== "operator-interface-readiness-not-accessibility-certification") {
    throw new Error(`${label} expected x-scrimed-ui-authority operator-interface-readiness-not-accessibility-certification but received ${uiAuthority}.`);
  }
}

function requireGlobalReachBoundary(label, response) {
  const globalAuthority = response.headers.get("x-scrimed-global-authority");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (globalAuthority !== "localization-readiness-not-legal-approval") {
    throw new Error(`${label} expected x-scrimed-global-authority localization-readiness-not-legal-approval but received ${globalAuthority}.`);
  }
}

function requireGlobalEnterpriseCommandBoundary(label, response) {
  const communicationAuthority = response.headers.get("x-scrimed-communication-authority");
  const globalAuthority = response.headers.get("x-scrimed-global-authority");
  const interoperabilityAuthority = response.headers.get("x-scrimed-interoperability-authority");
  const productionAuthorization = response.headers.get("x-scrimed-production-authorization");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (communicationAuthority !== "human-reviewed-templates-only") {
    throw new Error(`${label} expected x-scrimed-communication-authority human-reviewed-templates-only but received ${communicationAuthority}.`);
  }

  if (globalAuthority !== "readiness-only-not-legal-approval") {
    throw new Error(`${label} expected x-scrimed-global-authority readiness-only-not-legal-approval but received ${globalAuthority}.`);
  }

  if (interoperabilityAuthority !== "synthetic-conformance-only") {
    throw new Error(`${label} expected x-scrimed-interoperability-authority synthetic-conformance-only but received ${interoperabilityAuthority}.`);
  }

  if (productionAuthorization !== "not-production-authorized") {
    throw new Error(`${label} expected x-scrimed-production-authorization not-production-authorized but received ${productionAuthorization}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireClinicalAuthorityBoundary(label, response) {
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const regulatoryAuthority = response.headers.get("x-scrimed-regulatory-authority");
  const reimbursementAuthority = response.headers.get("x-scrimed-reimbursement-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (regulatoryAuthority !== "external-approval-required") {
    throw new Error(`${label} expected x-scrimed-regulatory-authority external-approval-required but received ${regulatoryAuthority}.`);
  }

  if (reimbursementAuthority !== "no-reimbursement-guarantee") {
    throw new Error(`${label} expected x-scrimed-reimbursement-authority no-reimbursement-guarantee but received ${reimbursementAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireBoundaryResolutionBoundary(label, response) {
  const autonomyAuthority = response.headers.get("x-scrimed-autonomy-authority");
  const boundaryResolution = response.headers.get("x-scrimed-boundary-resolution");
  const financialAuthority = response.headers.get("x-scrimed-financial-authority");
  const legalAuthority = response.headers.get("x-scrimed-legal-authority");
  const limitationControl = response.headers.get("x-scrimed-limitation-control");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const quantumAuthority = response.headers.get("x-scrimed-quantum-authority");
  const reimbursementAuthority = response.headers.get("x-scrimed-reimbursement-authority");
  const revenueAuthority = response.headers.get("x-scrimed-revenue-authority");
  const securitiesAuthority = response.headers.get("x-scrimed-securities-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (boundaryResolution !== "active-control-register") {
    throw new Error(`${label} expected x-scrimed-boundary-resolution active-control-register but received ${boundaryResolution}.`);
  }

  if (limitationControl !== "centralized-boundary-register") {
    throw new Error(`${label} expected x-scrimed-limitation-control centralized-boundary-register but received ${limitationControl}.`);
  }

  if (autonomyAuthority !== "no-autonomous-production-remediation") {
    throw new Error(`${label} expected x-scrimed-autonomy-authority no-autonomous-production-remediation but received ${autonomyAuthority}.`);
  }

  if (financialAuthority !== "not-audited-financial-report") {
    throw new Error(`${label} expected x-scrimed-financial-authority not-audited-financial-report but received ${financialAuthority}.`);
  }

  if (legalAuthority !== "external-approval-required") {
    throw new Error(`${label} expected x-scrimed-legal-authority external-approval-required but received ${legalAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (reimbursementAuthority !== "no-reimbursement-guarantee") {
    throw new Error(`${label} expected x-scrimed-reimbursement-authority no-reimbursement-guarantee but received ${reimbursementAuthority}.`);
  }

  if (quantumAuthority !== "internal-research-only-no-public-claim") {
    throw new Error(`${label} expected x-scrimed-quantum-authority internal-research-only-no-public-claim but received ${quantumAuthority}.`);
  }

  if (revenueAuthority !== "not-revenue-guarantee") {
    throw new Error(`${label} expected x-scrimed-revenue-authority not-revenue-guarantee but received ${revenueAuthority}.`);
  }

  if (securitiesAuthority !== "not-securities-offering-material") {
    throw new Error(`${label} expected x-scrimed-securities-authority not-securities-offering-material but received ${securitiesAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireBoundaryReleaseApprovalMatrixBoundary(label, response) {
  const approvalMatrix = response.headers.get("x-scrimed-boundary-release-approval-matrix");
  const certificationAuthority = response.headers.get("x-scrimed-certification-authority");
  const clinicalAuthority = response.headers.get("x-scrimed-clinical-care-authority");
  const customerGoLiveAuthority = response.headers.get("x-scrimed-customer-go-live-authority");
  const dataBoundary = response.headers.get("x-scrimed-data-boundary");
  const ehrWritebackAuthority = response.headers.get("x-scrimed-ehr-writeback-authority");
  const payerSubmissionAuthority = response.headers.get("x-scrimed-payer-submission-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const productionConnectorAuthority = response.headers.get("x-scrimed-production-connector-authority");
  const releaseAuthority = response.headers.get("x-scrimed-release-authority");

  if (approvalMatrix !== "active-fail-closed") {
    throw new Error(`${label} expected x-scrimed-boundary-release-approval-matrix active-fail-closed but received ${approvalMatrix}.`);
  }

  if (dataBoundary !== "synthetic-metadata-only-no-live-phi") {
    throw new Error(`${label} expected x-scrimed-data-boundary synthetic-metadata-only-no-live-phi but received ${dataBoundary}.`);
  }

  if (releaseAuthority !== "not-authorized-boundary-release") {
    throw new Error(`${label} expected x-scrimed-release-authority not-authorized-boundary-release but received ${releaseAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (clinicalAuthority !== "not-authorized-live-care") {
    throw new Error(`${label} expected x-scrimed-clinical-care-authority not-authorized-live-care but received ${clinicalAuthority}.`);
  }

  if (payerSubmissionAuthority !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-payer-submission-authority not-authorized but received ${payerSubmissionAuthority}.`);
  }

  if (ehrWritebackAuthority !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-ehr-writeback-authority not-authorized but received ${ehrWritebackAuthority}.`);
  }

  if (productionConnectorAuthority !== "not-production-connector-approved") {
    throw new Error(`${label} expected x-scrimed-production-connector-authority not-production-connector-approved but received ${productionConnectorAuthority}.`);
  }

  if (certificationAuthority !== "not-certified-readiness-only") {
    throw new Error(`${label} expected x-scrimed-certification-authority not-certified-readiness-only but received ${certificationAuthority}.`);
  }

  if (customerGoLiveAuthority !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-customer-go-live-authority not-authorized but received ${customerGoLiveAuthority}.`);
  }
}

function requireApprovalsReadinessBoundary(label, response) {
  const approvalsReadiness = response.headers.get("x-scrimed-approvals-readiness");
  const intendedUseAuthority = response.headers.get("x-scrimed-intended-use-authority");
  const legalAuthority = response.headers.get("x-scrimed-legal-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const regulatoryAuthority = response.headers.get("x-scrimed-regulatory-authority");
  const reimbursementAuthority = response.headers.get("x-scrimed-reimbursement-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (!["operating-ladder-active", "brief-no-approval-claim"].includes(approvalsReadiness ?? "")) {
    throw new Error(`${label} expected approvals readiness boundary header but received ${approvalsReadiness}.`);
  }

  if (legalAuthority !== "external-approval-required") {
    throw new Error(`${label} expected x-scrimed-legal-authority external-approval-required but received ${legalAuthority}.`);
  }

  if (intendedUseAuthority !== "qualified-review-required") {
    throw new Error(`${label} expected x-scrimed-intended-use-authority qualified-review-required but received ${intendedUseAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (regulatoryAuthority !== "external-review-required") {
    throw new Error(`${label} expected x-scrimed-regulatory-authority external-review-required but received ${regulatoryAuthority}.`);
  }

  if (reimbursementAuthority !== "no-reimbursement-guarantee") {
    throw new Error(`${label} expected x-scrimed-reimbursement-authority no-reimbursement-guarantee but received ${reimbursementAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireGlobalCertificationReadinessBoundary(label, response) {
  const certificationReadiness = response.headers.get("x-scrimed-global-certification-readiness");
  const legalAuthority = response.headers.get("x-scrimed-legal-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const productionAuthorization = response.headers.get("x-scrimed-production-authorization");
  const regulatoryAuthority = response.headers.get("x-scrimed-regulatory-authority");
  const reimbursementAuthority = response.headers.get("x-scrimed-reimbursement-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (!["control-plane-active", "brief-no-certification-claim"].includes(certificationReadiness ?? "")) {
    throw new Error(`${label} expected global certification readiness boundary header but received ${certificationReadiness}.`);
  }

  if (legalAuthority !== "external-approval-required") {
    throw new Error(`${label} expected x-scrimed-legal-authority external-approval-required but received ${legalAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (productionAuthorization !== "not-production-authorized") {
    throw new Error(`${label} expected x-scrimed-production-authorization not-production-authorized but received ${productionAuthorization}.`);
  }

  if (regulatoryAuthority !== "external-review-required") {
    throw new Error(`${label} expected x-scrimed-regulatory-authority external-review-required but received ${regulatoryAuthority}.`);
  }

  if (reimbursementAuthority !== "no-reimbursement-guarantee") {
    throw new Error(`${label} expected x-scrimed-reimbursement-authority no-reimbursement-guarantee but received ${reimbursementAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireContinuousReviewAuditBoundary(label, response) {
  const autonomousRemediation = response.headers.get("x-scrimed-autonomous-remediation");
  const continuousReviewAudit = response.headers.get("x-scrimed-continuous-review-audit");
  const dataBoundary = response.headers.get("x-scrimed-data-boundary");
  const innovationVisibility = response.headers.get("x-scrimed-innovation-visibility");
  const managedCoverage = response.headers.get("x-scrimed-managed-coverage");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const quantumAuthority = response.headers.get("x-scrimed-quantum-authority");
  const regulatoryAuthority = response.headers.get("x-scrimed-regulatory-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireNoClinicalCareAuthority(label, response);

  if (!["control-plane-active", "brief-no-autonomous-claims"].includes(continuousReviewAudit ?? "")) {
    throw new Error(`${label} expected continuous review boundary header but received ${continuousReviewAudit}.`);
  }

  if (autonomousRemediation !== "human-review-required") {
    throw new Error(`${label} expected x-scrimed-autonomous-remediation human-review-required but received ${autonomousRemediation}.`);
  }

  if (dataBoundary !== "synthetic-and-metadata-only") {
    throw new Error(`${label} expected x-scrimed-data-boundary synthetic-and-metadata-only but received ${dataBoundary}.`);
  }

  if (innovationVisibility !== "internal-research-only") {
    throw new Error(`${label} expected x-scrimed-innovation-visibility internal-research-only but received ${innovationVisibility}.`);
  }

  if (managedCoverage !== "not-managed-24-7-soc-mdr") {
    throw new Error(`${label} expected x-scrimed-managed-coverage not-managed-24-7-soc-mdr but received ${managedCoverage}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (quantumAuthority !== "internal-research-only-no-production-claims") {
    throw new Error(`${label} expected x-scrimed-quantum-authority internal-research-only-no-production-claims but received ${quantumAuthority}.`);
  }

  if (regulatoryAuthority !== "external-review-required") {
    throw new Error(`${label} expected x-scrimed-regulatory-authority external-review-required but received ${regulatoryAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireReleaseContinuityBoundary(label, response) {
  const approvalAuthority = response.headers.get("x-scrimed-approval-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const releaseAuthority = response.headers.get("x-scrimed-release-authority");
  const releaseContinuity = response.headers.get("x-scrimed-release-continuity");
  const securityCertification = response.headers.get("x-scrimed-security-certification");
  const tokenHandling = response.headers.get("x-scrimed-token-handling");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (approvalAuthority !== "external-review-required") {
    throw new Error(`${label} expected x-scrimed-approval-authority external-review-required but received ${approvalAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (releaseAuthority !== "not-release-approval") {
    throw new Error(`${label} expected x-scrimed-release-authority not-release-approval but received ${releaseAuthority}.`);
  }

  if (!["live-checkpointed-aal2-boundary", "brief-operator-boundary"].includes(releaseContinuity ?? "")) {
    throw new Error(`${label} expected release continuity boundary header but received ${releaseContinuity}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }

  if (tokenHandling !== "no-token-values-exposed-or-retained") {
    throw new Error(`${label} expected x-scrimed-token-handling no-token-values-exposed-or-retained but received ${tokenHandling}.`);
  }
}

function requireReleaseEvidenceLedgerBoundary(label, response) {
  const approvalAuthority = response.headers.get("x-scrimed-approval-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const releaseAuthority = response.headers.get("x-scrimed-release-authority");
  const releaseEvidenceLedger = response.headers.get("x-scrimed-release-evidence-ledger");
  const securityCertification = response.headers.get("x-scrimed-security-certification");
  const tokenHandling = response.headers.get("x-scrimed-token-handling");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (approvalAuthority !== "external-review-required") {
    throw new Error(`${label} expected x-scrimed-approval-authority external-review-required but received ${approvalAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (releaseAuthority !== "not-release-approval") {
    throw new Error(`${label} expected x-scrimed-release-authority not-release-approval but received ${releaseAuthority}.`);
  }

  if (releaseEvidenceLedger !== "release-evidence-ledger-active-no-secret") {
    throw new Error(`${label} expected release evidence ledger header but received ${releaseEvidenceLedger}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }

  if (tokenHandling !== "no-token-values-exposed-or-retained") {
    throw new Error(`${label} expected x-scrimed-token-handling no-token-values-exposed-or-retained but received ${tokenHandling}.`);
  }
}

function requireReleaseEvidencePromotionBoundary(label, response) {
  const approvalAuthority = response.headers.get("x-scrimed-approval-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const promotionAuthority = response.headers.get("x-scrimed-promotion-authority");
  const releaseAuthority = response.headers.get("x-scrimed-release-authority");
  const releaseEvidencePromotion = response.headers.get("x-scrimed-release-evidence-promotion");
  const securityCertification = response.headers.get("x-scrimed-security-certification");
  const tokenHandling = response.headers.get("x-scrimed-token-handling");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (approvalAuthority !== "external-review-required") {
    throw new Error(`${label} expected x-scrimed-approval-authority external-review-required but received ${approvalAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (promotionAuthority !== "human-gated-no-secret-metadata-only") {
    throw new Error(`${label} expected x-scrimed-promotion-authority human-gated-no-secret-metadata-only but received ${promotionAuthority}.`);
  }

  if (releaseAuthority !== "not-release-approval") {
    throw new Error(`${label} expected x-scrimed-release-authority not-release-approval but received ${releaseAuthority}.`);
  }

  if (releaseEvidencePromotion !== "release-evidence-promotion-queue-active-human-gated") {
    throw new Error(`${label} expected release evidence promotion header but received ${releaseEvidencePromotion}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }

  if (tokenHandling !== "no-token-values-exposed-or-retained") {
    throw new Error(`${label} expected x-scrimed-token-handling no-token-values-exposed-or-retained but received ${tokenHandling}.`);
  }
}

function requireReleaseEvidenceFreshnessGuardBoundary(label, response) {
  const approvalAuthority = response.headers.get("x-scrimed-approval-authority");
  const freshnessAuthority = response.headers.get("x-scrimed-freshness-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const publicDistributionAuthority = response.headers.get("x-scrimed-public-distribution-authority");
  const releaseAuthority = response.headers.get("x-scrimed-release-authority");
  const releaseEvidenceFreshnessGuard = response.headers.get("x-scrimed-release-evidence-freshness-guard");
  const securityCertification = response.headers.get("x-scrimed-security-certification");
  const tokenHandling = response.headers.get("x-scrimed-token-handling");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (approvalAuthority !== "external-review-required") {
    throw new Error(`${label} expected x-scrimed-approval-authority external-review-required but received ${approvalAuthority}.`);
  }

  if (freshnessAuthority !== "fresh-rerun-required-before-external-use") {
    throw new Error(`${label} expected x-scrimed-freshness-authority fresh-rerun-required-before-external-use but received ${freshnessAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (publicDistributionAuthority !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-public-distribution-authority not-authorized but received ${publicDistributionAuthority}.`);
  }

  if (releaseAuthority !== "not-release-approval") {
    throw new Error(`${label} expected x-scrimed-release-authority not-release-approval but received ${releaseAuthority}.`);
  }

  if (releaseEvidenceFreshnessGuard !== "release-evidence-freshness-guard-active-no-secret") {
    throw new Error(`${label} expected release evidence freshness guard header but received ${releaseEvidenceFreshnessGuard}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }

  if (tokenHandling !== "no-token-values-exposed-or-retained") {
    throw new Error(`${label} expected x-scrimed-token-handling no-token-values-exposed-or-retained but received ${tokenHandling}.`);
  }
}

function requireDiligenceReleaseGateBoundary(label, response) {
  const approvalAuthority = response.headers.get("x-scrimed-approval-authority");
  const diligenceReleaseGate = response.headers.get("x-scrimed-diligence-release-gate");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const releaseAuthority = response.headers.get("x-scrimed-release-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");
  const tokenHandling = response.headers.get("x-scrimed-token-handling");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (approvalAuthority !== "external-review-required") {
    throw new Error(`${label} expected x-scrimed-approval-authority external-review-required but received ${approvalAuthority}.`);
  }

  if (diligenceReleaseGate !== "diligence-release-gate-active-no-production-approval") {
    throw new Error(`${label} expected diligence release gate header but received ${diligenceReleaseGate}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (releaseAuthority !== "not-release-approval") {
    throw new Error(`${label} expected x-scrimed-release-authority not-release-approval but received ${releaseAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }

  if (tokenHandling !== "no-token-values-exposed-or-retained") {
    throw new Error(`${label} expected x-scrimed-token-handling no-token-values-exposed-or-retained but received ${tokenHandling}.`);
  }
}

function requireDiligencePacketManifestBoundary(label, response) {
  const approvalAuthority = response.headers.get("x-scrimed-approval-authority");
  const diligencePacketManifest = response.headers.get("x-scrimed-diligence-packet-manifest");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const publicDistributionAuthority = response.headers.get("x-scrimed-public-distribution-authority");
  const releaseAuthority = response.headers.get("x-scrimed-release-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");
  const tokenHandling = response.headers.get("x-scrimed-token-handling");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (approvalAuthority !== "external-review-required") {
    throw new Error(`${label} expected x-scrimed-approval-authority external-review-required but received ${approvalAuthority}.`);
  }

  if (diligencePacketManifest !== "diligence-packet-manifest-active-no-secret") {
    throw new Error(`${label} expected diligence packet manifest header but received ${diligencePacketManifest}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (publicDistributionAuthority !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-public-distribution-authority not-authorized but received ${publicDistributionAuthority}.`);
  }

  if (releaseAuthority !== "not-release-approval") {
    throw new Error(`${label} expected x-scrimed-release-authority not-release-approval but received ${releaseAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }

  if (tokenHandling !== "no-token-values-exposed-or-retained") {
    throw new Error(`${label} expected x-scrimed-token-handling no-token-values-exposed-or-retained but received ${tokenHandling}.`);
  }
}

function requireDiligencePacketShareGuardBoundary(label, response) {
  const approvalAuthority = response.headers.get("x-scrimed-approval-authority");
  const diligencePacketShareGuard = response.headers.get("x-scrimed-diligence-packet-share-guard");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const publicDistributionAuthority = response.headers.get("x-scrimed-public-distribution-authority");
  const recipientAuthorization = response.headers.get("x-scrimed-recipient-authorization");
  const releaseAuthority = response.headers.get("x-scrimed-release-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");
  const tokenHandling = response.headers.get("x-scrimed-token-handling");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (approvalAuthority !== "external-review-required") {
    throw new Error(`${label} expected x-scrimed-approval-authority external-review-required but received ${approvalAuthority}.`);
  }

  if (diligencePacketShareGuard !== "diligence-packet-share-guard-active-human-gated") {
    throw new Error(`${label} expected diligence packet share guard header but received ${diligencePacketShareGuard}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (publicDistributionAuthority !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-public-distribution-authority not-authorized but received ${publicDistributionAuthority}.`);
  }

  if (recipientAuthorization !== "recipient-specific-human-approval-required") {
    throw new Error(`${label} expected x-scrimed-recipient-authorization recipient-specific-human-approval-required but received ${recipientAuthorization}.`);
  }

  if (releaseAuthority !== "not-release-approval") {
    throw new Error(`${label} expected x-scrimed-release-authority not-release-approval but received ${releaseAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }

  if (tokenHandling !== "no-token-values-exposed-or-retained") {
    throw new Error(`${label} expected x-scrimed-token-handling no-token-values-exposed-or-retained but received ${tokenHandling}.`);
  }
}

function requireRecipientQualificationMatrixBoundary(label, response) {
  const approvalAuthority = response.headers.get("x-scrimed-approval-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const publicDistributionAuthority = response.headers.get("x-scrimed-public-distribution-authority");
  const recipientIdentifierStorage = response.headers.get("x-scrimed-recipient-identifier-storage");
  const recipientQualification = response.headers.get("x-scrimed-recipient-qualification");
  const releaseAuthority = response.headers.get("x-scrimed-release-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");
  const tokenHandling = response.headers.get("x-scrimed-token-handling");

  requireSyntheticMetadataBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (approvalAuthority !== "external-review-required") {
    throw new Error(`${label} expected x-scrimed-approval-authority external-review-required but received ${approvalAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (publicDistributionAuthority !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-public-distribution-authority not-authorized but received ${publicDistributionAuthority}.`);
  }

  if (recipientIdentifierStorage !== "not-stored-in-scrimed") {
    throw new Error(`${label} expected x-scrimed-recipient-identifier-storage not-stored-in-scrimed but received ${recipientIdentifierStorage}.`);
  }

  if (recipientQualification !== "recipient-qualification-matrix-active-no-secret") {
    throw new Error(`${label} expected recipient qualification header but received ${recipientQualification}.`);
  }

  if (releaseAuthority !== "not-release-approval") {
    throw new Error(`${label} expected x-scrimed-release-authority not-release-approval but received ${releaseAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }

  if (tokenHandling !== "no-token-values-exposed-or-retained") {
    throw new Error(`${label} expected x-scrimed-token-handling no-token-values-exposed-or-retained but received ${tokenHandling}.`);
  }
}

function requireReleaseAuthorizationChainBoundary(label, response) {
  const authorizationChain = response.headers.get("x-scrimed-authorization-chain");
  const customerSpecificAuthority = response.headers.get("x-scrimed-customer-specific-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const publicDistributionAuthority = response.headers.get("x-scrimed-public-distribution-authority");
  const releaseAuthority = response.headers.get("x-scrimed-release-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");
  const tokenHandling = response.headers.get("x-scrimed-token-handling");

  requireSyntheticMetadataBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (authorizationChain !== "release-authorization-chain-active-no-release-approval") {
    throw new Error(`${label} expected release authorization chain header but received ${authorizationChain}.`);
  }

  if (customerSpecificAuthority !== "not-authorized-without-customer-permission") {
    throw new Error(`${label} expected x-scrimed-customer-specific-authority not-authorized-without-customer-permission but received ${customerSpecificAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (publicDistributionAuthority !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-public-distribution-authority not-authorized but received ${publicDistributionAuthority}.`);
  }

  if (releaseAuthority !== "not-release-approval") {
    throw new Error(`${label} expected x-scrimed-release-authority not-release-approval but received ${releaseAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }

  if (tokenHandling !== "no-token-values-exposed-or-retained") {
    throw new Error(`${label} expected x-scrimed-token-handling no-token-values-exposed-or-retained but received ${tokenHandling}.`);
  }
}

function requireNavigationAuditBoundary(label, response) {
  const approvalAuthority = response.headers.get("x-scrimed-approval-authority");
  const functionAudit = response.headers.get("x-scrimed-function-audit");
  const navigationAudit = response.headers.get("x-scrimed-navigation-audit");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const releaseAuthority = response.headers.get("x-scrimed-release-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (approvalAuthority !== "external-review-required") {
    throw new Error(`${label} expected x-scrimed-approval-authority external-review-required but received ${approvalAuthority}.`);
  }

  if (![
    "typecheck-build-smoke-plus-protected-fail-closed",
    "brief-typecheck-build-smoke-plus-protected-fail-closed"
  ].includes(functionAudit ?? "")) {
    throw new Error(`${label} expected function audit boundary header but received ${functionAudit}.`);
  }

  if (![
    "route-navigation-audit-active",
    "route-navigation-audit-brief-ready"
  ].includes(navigationAudit ?? "")) {
    throw new Error(`${label} expected navigation audit boundary header but received ${navigationAudit}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (releaseAuthority !== "not-release-approval") {
    throw new Error(`${label} expected x-scrimed-release-authority not-release-approval but received ${releaseAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireServiceReliabilityBoundary(label, response) {
  const approvalAuthority = response.headers.get("x-scrimed-approval-authority");
  const financialAuthority = response.headers.get("x-scrimed-financial-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const releaseAuthority = response.headers.get("x-scrimed-release-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");
  const serviceReliability = response.headers.get("x-scrimed-service-reliability");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (approvalAuthority !== "external-review-required") {
    throw new Error(`${label} expected x-scrimed-approval-authority external-review-required but received ${approvalAuthority}.`);
  }

  if (financialAuthority !== "not-audited-financial-report") {
    throw new Error(`${label} expected x-scrimed-financial-authority not-audited-financial-report but received ${financialAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (releaseAuthority !== "not-release-approval") {
    throw new Error(`${label} expected x-scrimed-release-authority not-release-approval but received ${releaseAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }

  if (![
    "service-reliability-hardening-active",
    "service-reliability-brief-ready"
  ].includes(serviceReliability ?? "")) {
    throw new Error(`${label} expected service reliability boundary header but received ${serviceReliability}.`);
  }
}

function requireOperationalEfficiencyBoundary(label, response) {
  const autonomyAuthority = response.headers.get("x-scrimed-autonomy-authority");
  const financialAuthority = response.headers.get("x-scrimed-financial-authority");
  const legalAuthority = response.headers.get("x-scrimed-legal-authority");
  const operationalEfficiency = response.headers.get("x-scrimed-operational-efficiency");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const profitAuthority = response.headers.get("x-scrimed-profit-authority");
  const revenueAuthority = response.headers.get("x-scrimed-revenue-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticMetadataBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (!["bottleneck-resolution-active", "bottleneck-resolution-brief"].includes(operationalEfficiency ?? "")) {
    throw new Error(`${label} expected operational efficiency header but received ${operationalEfficiency}.`);
  }

  if (autonomyAuthority !== "no-autonomous-production-remediation") {
    throw new Error(`${label} expected x-scrimed-autonomy-authority no-autonomous-production-remediation but received ${autonomyAuthority}.`);
  }

  if (financialAuthority !== "not-audited-financial-report") {
    throw new Error(`${label} expected x-scrimed-financial-authority not-audited-financial-report but received ${financialAuthority}.`);
  }

  if (legalAuthority !== "qualified-review-required") {
    throw new Error(`${label} expected x-scrimed-legal-authority qualified-review-required but received ${legalAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (profitAuthority !== "not-profit-margin-guarantee") {
    throw new Error(`${label} expected x-scrimed-profit-authority not-profit-margin-guarantee but received ${profitAuthority}.`);
  }

  if (revenueAuthority !== "not-revenue-guarantee") {
    throw new Error(`${label} expected x-scrimed-revenue-authority not-revenue-guarantee but received ${revenueAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireScrimedAutomationAutopilotBoundary(label, response) {
  const automationAutopilot = response.headers.get("x-scrimed-automation-autopilot");
  const autonomyAuthority = response.headers.get("x-scrimed-autonomy-authority");
  const customerGoLive = response.headers.get("x-scrimed-customer-go-live");
  const ehrWriteback = response.headers.get("x-scrimed-ehr-writeback");
  const payerSubmission = response.headers.get("x-scrimed-payer-submission");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const productionRemediation = response.headers.get("x-scrimed-production-remediation");
  const revenueAuthority = response.headers.get("x-scrimed-revenue-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticMetadataBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (![
    "scrimed-automation-autopilot-active-synthetic-no-phi",
    "scrimed-automation-autopilot-brief-ready"
  ].includes(automationAutopilot ?? "")) {
    throw new Error(`${label} expected automation autopilot boundary header but received ${automationAutopilot}.`);
  }

  if (autonomyAuthority !== "synthetic-and-review-gated-only") {
    throw new Error(`${label} expected x-scrimed-autonomy-authority synthetic-and-review-gated-only but received ${autonomyAuthority}.`);
  }

  if (customerGoLive !== "not-customer-go-live-approval") {
    throw new Error(`${label} expected x-scrimed-customer-go-live not-customer-go-live-approval but received ${customerGoLive}.`);
  }

  if (ehrWriteback !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-ehr-writeback not-authorized but received ${ehrWriteback}.`);
  }

  if (payerSubmission !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-payer-submission not-authorized but received ${payerSubmission}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (productionRemediation !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-production-remediation not-authorized but received ${productionRemediation}.`);
  }

  if (revenueAuthority !== "not-revenue-guarantee") {
    throw new Error(`${label} expected x-scrimed-revenue-authority not-revenue-guarantee but received ${revenueAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireStrategicProblemResolutionBoundary(label, response) {
  const communicationAuthority = response.headers.get("x-scrimed-communication-authority");
  const executionAuthority = response.headers.get("x-scrimed-execution-authority");
  const payerAuthority = response.headers.get("x-scrimed-payer-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const productionAuthorization = response.headers.get("x-scrimed-production-authorization");
  const valuationAuthority = response.headers.get("x-scrimed-valuation-authority");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (communicationAuthority !== "human-review-required-before-send") {
    throw new Error(`${label} expected x-scrimed-communication-authority human-review-required-before-send but received ${communicationAuthority}.`);
  }

  if (executionAuthority !== "recommendation-and-control-plane-only") {
    throw new Error(`${label} expected x-scrimed-execution-authority recommendation-and-control-plane-only but received ${executionAuthority}.`);
  }

  if (payerAuthority !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-payer-authority not-authorized but received ${payerAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (productionAuthorization !== "not-production-authorized") {
    throw new Error(`${label} expected x-scrimed-production-authorization not-production-authorized but received ${productionAuthorization}.`);
  }

  if (valuationAuthority !== "not-valuation-assurance") {
    throw new Error(`${label} expected x-scrimed-valuation-authority not-valuation-assurance but received ${valuationAuthority}.`);
  }
}

function requireHealthcareOptimizationCommandBoundary(label, response) {
  const ehrWriteback = response.headers.get("x-scrimed-ehr-writeback");
  const imagingAuthority = response.headers.get("x-scrimed-imaging-authority");
  const interoperabilityAuthority = response.headers.get("x-scrimed-interoperability-authority");
  const patientOutreachAuthority = response.headers.get("x-scrimed-patient-outreach-authority");
  const payerAuthority = response.headers.get("x-scrimed-payer-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const productionAuthorization = response.headers.get("x-scrimed-production-authorization");
  const valuationAuthority = response.headers.get("x-scrimed-valuation-authority");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (ehrWriteback !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-ehr-writeback not-authorized but received ${ehrWriteback}.`);
  }

  if (imagingAuthority !== "not-final-medical-interpretation") {
    throw new Error(`${label} expected x-scrimed-imaging-authority not-final-medical-interpretation but received ${imagingAuthority}.`);
  }

  if (interoperabilityAuthority !== "synthetic-conformance-only") {
    throw new Error(`${label} expected x-scrimed-interoperability-authority synthetic-conformance-only but received ${interoperabilityAuthority}.`);
  }

  if (patientOutreachAuthority !== "human-review-and-consent-required") {
    throw new Error(`${label} expected x-scrimed-patient-outreach-authority human-review-and-consent-required but received ${patientOutreachAuthority}.`);
  }

  if (payerAuthority !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-payer-authority not-authorized but received ${payerAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (productionAuthorization !== "not-production-authorized") {
    throw new Error(`${label} expected x-scrimed-production-authorization not-production-authorized but received ${productionAuthorization}.`);
  }

  if (valuationAuthority !== "not-valuation-assurance") {
    throw new Error(`${label} expected x-scrimed-valuation-authority not-valuation-assurance but received ${valuationAuthority}.`);
  }
}

function requireHealthcareValueRealizationBoundary(label, response) {
  const ehrWriteback = response.headers.get("x-scrimed-ehr-writeback");
  const financialAuthority = response.headers.get("x-scrimed-financial-authority");
  const imagingAuthority = response.headers.get("x-scrimed-imaging-authority");
  const payerAuthority = response.headers.get("x-scrimed-payer-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const productionAuthorization = response.headers.get("x-scrimed-production-authorization");
  const revenueAuthority = response.headers.get("x-scrimed-revenue-authority");
  const roiAuthority = response.headers.get("x-scrimed-roi-authority");
  const valuationAuthority = response.headers.get("x-scrimed-valuation-authority");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (ehrWriteback !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-ehr-writeback not-authorized but received ${ehrWriteback}.`);
  }

  if (financialAuthority !== "not-audited-financial-report") {
    throw new Error(`${label} expected x-scrimed-financial-authority not-audited-financial-report but received ${financialAuthority}.`);
  }

  if (imagingAuthority !== "not-final-medical-interpretation") {
    throw new Error(`${label} expected x-scrimed-imaging-authority not-final-medical-interpretation but received ${imagingAuthority}.`);
  }

  if (payerAuthority !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-payer-authority not-authorized but received ${payerAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (productionAuthorization !== "not-production-authorized") {
    throw new Error(`${label} expected x-scrimed-production-authorization not-production-authorized but received ${productionAuthorization}.`);
  }

  if (revenueAuthority !== "not-revenue-guarantee") {
    throw new Error(`${label} expected x-scrimed-revenue-authority not-revenue-guarantee but received ${revenueAuthority}.`);
  }

  if (roiAuthority !== "not-roi-guarantee") {
    throw new Error(`${label} expected x-scrimed-roi-authority not-roi-guarantee but received ${roiAuthority}.`);
  }

  if (valuationAuthority !== "not-valuation-assurance") {
    throw new Error(`${label} expected x-scrimed-valuation-authority not-valuation-assurance but received ${valuationAuthority}.`);
  }
}

function requirePilotValueEvidenceBoundary(label, response) {
  const commercialAuthority = response.headers.get("x-scrimed-commercial-authority");
  const customerActivation = response.headers.get("x-scrimed-customer-activation");
  const ehrWriteback = response.headers.get("x-scrimed-ehr-writeback");
  const financialAuthority = response.headers.get("x-scrimed-financial-authority");
  const imagingAuthority = response.headers.get("x-scrimed-imaging-authority");
  const payerAuthority = response.headers.get("x-scrimed-payer-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const productionAuthorization = response.headers.get("x-scrimed-production-authorization");
  const revenueAuthority = response.headers.get("x-scrimed-revenue-authority");
  const roiAuthority = response.headers.get("x-scrimed-roi-authority");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (commercialAuthority !== "not-binding-commercial-offer") {
    throw new Error(`${label} expected x-scrimed-commercial-authority not-binding-commercial-offer but received ${commercialAuthority}.`);
  }

  if (customerActivation !== "not-customer-go-live-approval") {
    throw new Error(`${label} expected x-scrimed-customer-activation not-customer-go-live-approval but received ${customerActivation}.`);
  }

  if (ehrWriteback !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-ehr-writeback not-authorized but received ${ehrWriteback}.`);
  }

  if (financialAuthority !== "not-audited-financial-report") {
    throw new Error(`${label} expected x-scrimed-financial-authority not-audited-financial-report but received ${financialAuthority}.`);
  }

  if (imagingAuthority !== "not-final-medical-interpretation") {
    throw new Error(`${label} expected x-scrimed-imaging-authority not-final-medical-interpretation but received ${imagingAuthority}.`);
  }

  if (payerAuthority !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-payer-authority not-authorized but received ${payerAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (productionAuthorization !== "not-production-authorized") {
    throw new Error(`${label} expected x-scrimed-production-authorization not-production-authorized but received ${productionAuthorization}.`);
  }

  if (revenueAuthority !== "not-revenue-guarantee") {
    throw new Error(`${label} expected x-scrimed-revenue-authority not-revenue-guarantee but received ${revenueAuthority}.`);
  }

  if (roiAuthority !== "not-roi-guarantee") {
    throw new Error(`${label} expected x-scrimed-roi-authority not-roi-guarantee but received ${roiAuthority}.`);
  }
}

function requirePilotActivationPlannerBoundary(label, response) {
  const commercialAuthority = response.headers.get("x-scrimed-commercial-authority");
  const customerActivation = response.headers.get("x-scrimed-customer-activation");
  const ehrWriteback = response.headers.get("x-scrimed-ehr-writeback");
  const financialAuthority = response.headers.get("x-scrimed-financial-authority");
  const legalAuthority = response.headers.get("x-scrimed-legal-authority");
  const patientOutreachAuthority = response.headers.get("x-scrimed-patient-outreach-authority");
  const payerAuthority = response.headers.get("x-scrimed-payer-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const productionAuthorization = response.headers.get("x-scrimed-production-authorization");
  const revenueAuthority = response.headers.get("x-scrimed-revenue-authority");
  const roiAuthority = response.headers.get("x-scrimed-roi-authority");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (commercialAuthority !== "not-binding-commercial-offer") {
    throw new Error(`${label} expected x-scrimed-commercial-authority not-binding-commercial-offer but received ${commercialAuthority}.`);
  }

  if (customerActivation !== "not-customer-go-live-approval") {
    throw new Error(`${label} expected x-scrimed-customer-activation not-customer-go-live-approval but received ${customerActivation}.`);
  }

  if (ehrWriteback !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-ehr-writeback not-authorized but received ${ehrWriteback}.`);
  }

  if (financialAuthority !== "not-audited-financial-report") {
    throw new Error(`${label} expected x-scrimed-financial-authority not-audited-financial-report but received ${financialAuthority}.`);
  }

  if (legalAuthority !== "qualified-review-required") {
    throw new Error(`${label} expected x-scrimed-legal-authority qualified-review-required but received ${legalAuthority}.`);
  }

  if (patientOutreachAuthority !== "human-review-and-consent-required") {
    throw new Error(`${label} expected x-scrimed-patient-outreach-authority human-review-and-consent-required but received ${patientOutreachAuthority}.`);
  }

  if (payerAuthority !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-payer-authority not-authorized but received ${payerAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (productionAuthorization !== "not-production-authorized") {
    throw new Error(`${label} expected x-scrimed-production-authorization not-production-authorized but received ${productionAuthorization}.`);
  }

  if (revenueAuthority !== "not-revenue-guarantee") {
    throw new Error(`${label} expected x-scrimed-revenue-authority not-revenue-guarantee but received ${revenueAuthority}.`);
  }

  if (roiAuthority !== "not-roi-guarantee") {
    throw new Error(`${label} expected x-scrimed-roi-authority not-roi-guarantee but received ${roiAuthority}.`);
  }
}

function requirePilotHandoffCommandBoundary(label, response) {
  const automationAuthority = response.headers.get("x-scrimed-automation-authority");
  const commercialAuthority = response.headers.get("x-scrimed-commercial-authority");
  const customerActivation = response.headers.get("x-scrimed-customer-activation");
  const ehrWriteback = response.headers.get("x-scrimed-ehr-writeback");
  const externalSendAuthority = response.headers.get("x-scrimed-external-send-authority");
  const financialAuthority = response.headers.get("x-scrimed-financial-authority");
  const legalAuthority = response.headers.get("x-scrimed-legal-authority");
  const patientOutreachAuthority = response.headers.get("x-scrimed-patient-outreach-authority");
  const payerAuthority = response.headers.get("x-scrimed-payer-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const productionAuthorization = response.headers.get("x-scrimed-production-authorization");
  const revenueAuthority = response.headers.get("x-scrimed-revenue-authority");
  const roiAuthority = response.headers.get("x-scrimed-roi-authority");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (automationAuthority !== "recommendation-only") {
    throw new Error(`${label} expected x-scrimed-automation-authority recommendation-only but received ${automationAuthority}.`);
  }

  if (commercialAuthority !== "not-binding-commercial-offer") {
    throw new Error(`${label} expected x-scrimed-commercial-authority not-binding-commercial-offer but received ${commercialAuthority}.`);
  }

  if (customerActivation !== "not-customer-go-live-approval") {
    throw new Error(`${label} expected x-scrimed-customer-activation not-customer-go-live-approval but received ${customerActivation}.`);
  }

  if (ehrWriteback !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-ehr-writeback not-authorized but received ${ehrWriteback}.`);
  }

  if (externalSendAuthority !== "human-review-required") {
    throw new Error(`${label} expected x-scrimed-external-send-authority human-review-required but received ${externalSendAuthority}.`);
  }

  if (financialAuthority !== "not-audited-financial-report") {
    throw new Error(`${label} expected x-scrimed-financial-authority not-audited-financial-report but received ${financialAuthority}.`);
  }

  if (legalAuthority !== "qualified-review-required") {
    throw new Error(`${label} expected x-scrimed-legal-authority qualified-review-required but received ${legalAuthority}.`);
  }

  if (patientOutreachAuthority !== "human-review-and-consent-required") {
    throw new Error(`${label} expected x-scrimed-patient-outreach-authority human-review-and-consent-required but received ${patientOutreachAuthority}.`);
  }

  if (payerAuthority !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-payer-authority not-authorized but received ${payerAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (productionAuthorization !== "not-production-authorized") {
    throw new Error(`${label} expected x-scrimed-production-authorization not-production-authorized but received ${productionAuthorization}.`);
  }

  if (revenueAuthority !== "not-revenue-guarantee") {
    throw new Error(`${label} expected x-scrimed-revenue-authority not-revenue-guarantee but received ${revenueAuthority}.`);
  }

  if (roiAuthority !== "not-roi-guarantee") {
    throw new Error(`${label} expected x-scrimed-roi-authority not-roi-guarantee but received ${roiAuthority}.`);
  }
}

function requirePilotSuccessReviewCommandBoundary(label, response) {
  const commercialAuthority = response.headers.get("x-scrimed-commercial-authority");
  const customerActivation = response.headers.get("x-scrimed-customer-activation");
  const ehrWriteback = response.headers.get("x-scrimed-ehr-writeback");
  const externalDistributionAuthority = response.headers.get("x-scrimed-external-distribution-authority");
  const financialAuthority = response.headers.get("x-scrimed-financial-authority");
  const legalAuthority = response.headers.get("x-scrimed-legal-authority");
  const patientOutreachAuthority = response.headers.get("x-scrimed-patient-outreach-authority");
  const payerAuthority = response.headers.get("x-scrimed-payer-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const productionAuthorization = response.headers.get("x-scrimed-production-authorization");
  const revenueAuthority = response.headers.get("x-scrimed-revenue-authority");
  const roiAuthority = response.headers.get("x-scrimed-roi-authority");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (commercialAuthority !== "not-binding-commercial-offer") {
    throw new Error(`${label} expected x-scrimed-commercial-authority not-binding-commercial-offer but received ${commercialAuthority}.`);
  }

  if (customerActivation !== "not-customer-go-live-approval") {
    throw new Error(`${label} expected x-scrimed-customer-activation not-customer-go-live-approval but received ${customerActivation}.`);
  }

  if (ehrWriteback !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-ehr-writeback not-authorized but received ${ehrWriteback}.`);
  }

  if (externalDistributionAuthority !== "human-review-required") {
    throw new Error(`${label} expected x-scrimed-external-distribution-authority human-review-required but received ${externalDistributionAuthority}.`);
  }

  if (financialAuthority !== "not-audited-financial-report") {
    throw new Error(`${label} expected x-scrimed-financial-authority not-audited-financial-report but received ${financialAuthority}.`);
  }

  if (legalAuthority !== "qualified-review-required") {
    throw new Error(`${label} expected x-scrimed-legal-authority qualified-review-required but received ${legalAuthority}.`);
  }

  if (patientOutreachAuthority !== "human-review-and-consent-required") {
    throw new Error(`${label} expected x-scrimed-patient-outreach-authority human-review-and-consent-required but received ${patientOutreachAuthority}.`);
  }

  if (payerAuthority !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-payer-authority not-authorized but received ${payerAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (productionAuthorization !== "not-production-authorized") {
    throw new Error(`${label} expected x-scrimed-production-authorization not-production-authorized but received ${productionAuthorization}.`);
  }

  if (revenueAuthority !== "not-revenue-guarantee") {
    throw new Error(`${label} expected x-scrimed-revenue-authority not-revenue-guarantee but received ${revenueAuthority}.`);
  }

  if (roiAuthority !== "not-roi-guarantee") {
    throw new Error(`${label} expected x-scrimed-roi-authority not-roi-guarantee but received ${roiAuthority}.`);
  }
}

function requireScrimedWorkBoundary(label, response) {
  const work = response.headers.get("x-scrimed-work");
  const dataBoundary = response.headers.get("x-scrimed-data-boundary");
  const clinicalAuthority = response.headers.get("x-scrimed-clinical-care-authority");
  const autonomousClinicalAuthority = response.headers.get("x-scrimed-autonomous-clinical-authority");
  const ehrWriteback = response.headers.get("x-scrimed-ehr-writeback");
  const payerSubmission = response.headers.get("x-scrimed-payer-submission");
  const externalModelCalls = response.headers.get("x-scrimed-external-model-calls");
  const consequentialActions = response.headers.get("x-scrimed-consequential-actions");
  const productionAuthorization = response.headers.get("x-scrimed-production-authorization");
  const customerGoLive = response.headers.get("x-scrimed-customer-go-live");
  const csrfProtection = response.headers.get("x-scrimed-csrf-protection");

  if (work !== "scrimed-work-intelligence-platform-active-synthetic-no-phi") {
    throw new Error(`${label} expected SCRIMED Work active synthetic header but received ${work}.`);
  }

  if (dataBoundary !== "synthetic-no-phi-metadata-only") {
    throw new Error(`${label} expected x-scrimed-data-boundary synthetic-no-phi-metadata-only but received ${dataBoundary}.`);
  }

  if (clinicalAuthority !== "not-authorized-live-care") {
    throw new Error(`${label} expected x-scrimed-clinical-care-authority not-authorized-live-care but received ${clinicalAuthority}.`);
  }

  if (autonomousClinicalAuthority !== "not-authorized-autonomous-clinical-action") {
    throw new Error(`${label} expected x-scrimed-autonomous-clinical-authority not-authorized-autonomous-clinical-action but received ${autonomousClinicalAuthority}.`);
  }

  if (ehrWriteback !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-ehr-writeback not-authorized but received ${ehrWriteback}.`);
  }

  if (payerSubmission !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-payer-submission not-authorized but received ${payerSubmission}.`);
  }

  if (externalModelCalls !== "disabled-by-default") {
    throw new Error(`${label} expected x-scrimed-external-model-calls disabled-by-default but received ${externalModelCalls}.`);
  }

  if (consequentialActions !== "disabled-by-default") {
    throw new Error(`${label} expected x-scrimed-consequential-actions disabled-by-default but received ${consequentialActions}.`);
  }

  if (productionAuthorization !== "not-production-authorized") {
    throw new Error(`${label} expected x-scrimed-production-authorization not-production-authorized but received ${productionAuthorization}.`);
  }

  if (customerGoLive !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-customer-go-live not-authorized but received ${customerGoLive}.`);
  }

  if (csrfProtection !== "exact-same-origin-or-explicit-non-browser") {
    throw new Error(`${label} expected SCRIMED Work request-provenance protection but received ${csrfProtection}.`);
  }
}

function requireLimitationsWorkaroundBoundary(label, response) {
  const autonomyAuthority = response.headers.get("x-scrimed-autonomy-authority");
  const connectorAuthority = response.headers.get("x-scrimed-connector-authority");
  const financialAuthority = response.headers.get("x-scrimed-financial-authority");
  const legalAuthority = response.headers.get("x-scrimed-legal-authority");
  const limitationControl = response.headers.get("x-scrimed-limitation-control");
  const limitationsWorkarounds = response.headers.get("x-scrimed-limitations-workarounds");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const profitAuthority = response.headers.get("x-scrimed-profit-authority");
  const quantumAuthority = response.headers.get("x-scrimed-quantum-authority");
  const releaseAuthority = response.headers.get("x-scrimed-release-authority");
  const revenueAuthority = response.headers.get("x-scrimed-revenue-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");
  const slaAuthority = response.headers.get("x-scrimed-sla-authority");

  requireSyntheticMetadataBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (!["control-plane-active", "limitations-workaround-brief-ready-no-authority-claim"].includes(limitationsWorkarounds ?? "")) {
    throw new Error(`${label} expected limitations workaround header but received ${limitationsWorkarounds}.`);
  }

  if (limitationControl !== "safe-workaround-operations") {
    throw new Error(`${label} expected x-scrimed-limitation-control safe-workaround-operations but received ${limitationControl}.`);
  }

  if (autonomyAuthority !== "no-autonomous-production-remediation") {
    throw new Error(`${label} expected x-scrimed-autonomy-authority no-autonomous-production-remediation but received ${autonomyAuthority}.`);
  }

  if (connectorAuthority !== "not-production-connector-approved") {
    throw new Error(`${label} expected x-scrimed-connector-authority not-production-connector-approved but received ${connectorAuthority}.`);
  }

  if (financialAuthority !== "not-audited-financial-report") {
    throw new Error(`${label} expected x-scrimed-financial-authority not-audited-financial-report but received ${financialAuthority}.`);
  }

  if (legalAuthority !== "qualified-review-required") {
    throw new Error(`${label} expected x-scrimed-legal-authority qualified-review-required but received ${legalAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (profitAuthority !== "not-profit-margin-guarantee") {
    throw new Error(`${label} expected x-scrimed-profit-authority not-profit-margin-guarantee but received ${profitAuthority}.`);
  }

  if (quantumAuthority !== "internal-research-only-no-public-claim") {
    throw new Error(`${label} expected x-scrimed-quantum-authority internal-research-only-no-public-claim but received ${quantumAuthority}.`);
  }

  if (releaseAuthority !== "not-release-approval") {
    throw new Error(`${label} expected x-scrimed-release-authority not-release-approval but received ${releaseAuthority}.`);
  }

  if (revenueAuthority !== "not-revenue-guarantee") {
    throw new Error(`${label} expected x-scrimed-revenue-authority not-revenue-guarantee but received ${revenueAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }

  if (slaAuthority !== "not-contractual-sla") {
    throw new Error(`${label} expected x-scrimed-sla-authority not-contractual-sla but received ${slaAuthority}.`);
  }
}

function requireHealthRecordsBoundary(label, response) {
  const connectorAuthority = response.headers.get("x-scrimed-connector-authority");
  const healthRecords = response.headers.get("x-scrimed-health-records");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const recordMutation = response.headers.get("x-scrimed-record-mutation");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticMetadataBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (!["safety-exchange-active", "safety-exchange-brief", "synthetic-extraction-evaluator"].includes(healthRecords ?? "")) {
    throw new Error(`${label} expected health records boundary header but received ${healthRecords}.`);
  }

  if (connectorAuthority !== "not-production-connector-approved") {
    throw new Error(`${label} expected x-scrimed-connector-authority not-production-connector-approved but received ${connectorAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (recordMutation !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-record-mutation not-authorized but received ${recordMutation}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireHealthcareIntelligenceOSBoundary(label, response) {
  const connectorAuthority = response.headers.get("x-scrimed-connector-authority");
  const clinicalWorkflowAutomation = response.headers.get("x-scrimed-clinical-workflow-automation");
  const patientOutreach = response.headers.get("x-scrimed-patient-outreach");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const recordMutation = response.headers.get("x-scrimed-record-mutation");

  requireSyntheticMetadataBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (clinicalWorkflowAutomation !== "synthetic-and-review-gated") {
    throw new Error(`${label} expected x-scrimed-clinical-workflow-automation synthetic-and-review-gated but received ${clinicalWorkflowAutomation}.`);
  }

  if (connectorAuthority !== "not-production-connector-approved") {
    throw new Error(`${label} expected x-scrimed-connector-authority not-production-connector-approved but received ${connectorAuthority}.`);
  }

  if (patientOutreach !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-patient-outreach not-authorized but received ${patientOutreach}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (recordMutation !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-record-mutation not-authorized but received ${recordMutation}.`);
  }
}

function requireClinicalDataFabricBoundary(label, response) {
  const agentDataAuthority = response.headers.get("x-scrimed-agent-data-authority");
  const clinicalCareAuthority = response.headers.get("x-scrimed-clinical-care-authority");
  const clinicalDataFabric = response.headers.get("x-scrimed-clinical-data-fabric");
  const connectorAuthority = response.headers.get("x-scrimed-connector-authority");
  const dataBoundary = response.headers.get("x-scrimed-data-boundary");
  const liveIngestionAuthority = response.headers.get("x-scrimed-live-ingestion-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const safetyDecision = response.headers.get("x-scrimed-safety-decision");

  if (agentDataAuthority !== "semantic-layer-only-no-raw-schema-access") {
    throw new Error(`${label} expected x-scrimed-agent-data-authority semantic-layer-only-no-raw-schema-access but received ${agentDataAuthority}.`);
  }

  if (clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error(`${label} expected x-scrimed-clinical-care-authority not-authorized-live-care but received ${clinicalCareAuthority}.`);
  }

  if (clinicalDataFabric !== "clinical-data-fabric-control-plane-ready-no-phi") {
    throw new Error(`${label} expected clinical data fabric status header but received ${clinicalDataFabric}.`);
  }

  if (connectorAuthority !== "not-production-connector-approved") {
    throw new Error(`${label} expected x-scrimed-connector-authority not-production-connector-approved but received ${connectorAuthority}.`);
  }

  if (dataBoundary !== "no-live-phi-control-plane") {
    throw new Error(`${label} expected x-scrimed-data-boundary no-live-phi-control-plane but received ${dataBoundary}.`);
  }

  if (liveIngestionAuthority !== "blocked-pending-customer-authorization") {
    throw new Error(`${label} expected x-scrimed-live-ingestion-authority blocked-pending-customer-authorization but received ${liveIngestionAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (safetyDecision !== "allowed") {
    throw new Error(`${label} expected x-scrimed-safety-decision allowed but received ${safetyDecision}.`);
  }
}

function requireClinicalDataGovernanceBoundary(label, response) {
  const clinicalCareAuthority = response.headers.get("x-scrimed-clinical-care-authority");
  const clinicalDataGovernance = response.headers.get("x-scrimed-clinical-data-governance");
  const dataBoundary = response.headers.get("x-scrimed-data-boundary");
  const externalModelPhi = response.headers.get("x-scrimed-external-model-phi");
  const patientOutreach = response.headers.get("x-scrimed-patient-outreach");
  const payerSubmission = response.headers.get("x-scrimed-payer-submission");
  const productionConnectorAuthority = response.headers.get("x-scrimed-production-connector-authority");
  const recordMutation = response.headers.get("x-scrimed-record-mutation");
  const safetyDecision = response.headers.get("x-scrimed-safety-decision");

  if (clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error(`${label} expected x-scrimed-clinical-care-authority not-authorized-live-care but received ${clinicalCareAuthority}.`);
  }

  if (clinicalDataGovernance !== "clinical-data-governance-policy-engine-ready-no-phi") {
    throw new Error(`${label} expected clinical data governance status header but received ${clinicalDataGovernance}.`);
  }

  if (dataBoundary !== "metadata-and-policy-only-no-live-phi") {
    throw new Error(`${label} expected x-scrimed-data-boundary metadata-and-policy-only-no-live-phi but received ${dataBoundary}.`);
  }

  if (externalModelPhi !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-external-model-phi not-authorized but received ${externalModelPhi}.`);
  }

  if (patientOutreach !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-patient-outreach not-authorized but received ${patientOutreach}.`);
  }

  if (payerSubmission !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-payer-submission not-authorized but received ${payerSubmission}.`);
  }

  if (productionConnectorAuthority !== "not-production-connector-approved") {
    throw new Error(`${label} expected x-scrimed-production-connector-authority not-production-connector-approved but received ${productionConnectorAuthority}.`);
  }

  if (recordMutation !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-record-mutation not-authorized but received ${recordMutation}.`);
  }

  if (safetyDecision !== "allowed") {
    throw new Error(`${label} expected x-scrimed-safety-decision allowed but received ${safetyDecision}.`);
  }
}

function requireClinicalContextGatewayBoundary(label, response) {
  const clinicalCareAuthority = response.headers.get("x-scrimed-clinical-care-authority");
  const clinicalContextGateway = response.headers.get("x-scrimed-clinical-context-gateway");
  const dataBoundary = response.headers.get("x-scrimed-data-boundary");
  const patientOutreach = response.headers.get("x-scrimed-patient-outreach");
  const payerSubmission = response.headers.get("x-scrimed-payer-submission");
  const productionConnectorAuthority = response.headers.get("x-scrimed-production-connector-authority");
  const rawConnectorPayload = response.headers.get("x-scrimed-raw-connector-payload");
  const rawSchemaAccess = response.headers.get("x-scrimed-raw-schema-access");
  const recordMutation = response.headers.get("x-scrimed-record-mutation");
  const safetyDecision = response.headers.get("x-scrimed-safety-decision");

  if (clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error(`${label} expected x-scrimed-clinical-care-authority not-authorized-live-care but received ${clinicalCareAuthority}.`);
  }

  if (clinicalContextGateway !== "clinical-context-gateway-ready-no-phi") {
    throw new Error(`${label} expected clinical context gateway status header but received ${clinicalContextGateway}.`);
  }

  if (dataBoundary !== "governed-semantic-context-only-no-live-phi") {
    throw new Error(`${label} expected x-scrimed-data-boundary governed-semantic-context-only-no-live-phi but received ${dataBoundary}.`);
  }

  if (patientOutreach !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-patient-outreach not-authorized but received ${patientOutreach}.`);
  }

  if (payerSubmission !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-payer-submission not-authorized but received ${payerSubmission}.`);
  }

  if (productionConnectorAuthority !== "not-production-connector-approved") {
    throw new Error(`${label} expected x-scrimed-production-connector-authority not-production-connector-approved but received ${productionConnectorAuthority}.`);
  }

  if (rawConnectorPayload !== "blocked") {
    throw new Error(`${label} expected x-scrimed-raw-connector-payload blocked but received ${rawConnectorPayload}.`);
  }

  if (rawSchemaAccess !== "blocked") {
    throw new Error(`${label} expected x-scrimed-raw-schema-access blocked but received ${rawSchemaAccess}.`);
  }

  if (recordMutation !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-record-mutation not-authorized but received ${recordMutation}.`);
  }

  if (safetyDecision !== "allowed") {
    throw new Error(`${label} expected x-scrimed-safety-decision allowed but received ${safetyDecision}.`);
  }
}

function requireScrimedOSUpgradeBatchBoundary(label, response) {
  const clinicalCareAuthority = response.headers.get("x-scrimed-clinical-care-authority");
  const dataBoundary = response.headers.get("x-scrimed-data-boundary");
  const externalModelCalls = response.headers.get("x-scrimed-external-model-calls");
  const patientOutreach = response.headers.get("x-scrimed-patient-outreach");
  const payerSubmission = response.headers.get("x-scrimed-payer-submission");
  const productionBehavior = response.headers.get("x-scrimed-production-behavior");
  const recordMutation = response.headers.get("x-scrimed-record-mutation");
  const safetyDecision = response.headers.get("x-scrimed-safety-decision");
  const upgradeBatch = response.headers.get("x-scrimed-os-upgrade-batch");

  if (clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error(`${label} expected x-scrimed-clinical-care-authority not-authorized-live-care but received ${clinicalCareAuthority}.`);
  }

  if (dataBoundary !== "synthetic-metadata-only-no-live-phi") {
    throw new Error(`${label} expected x-scrimed-data-boundary synthetic-metadata-only-no-live-phi but received ${dataBoundary}.`);
  }

  if (externalModelCalls !== "disabled") {
    throw new Error(`${label} expected x-scrimed-external-model-calls disabled but received ${externalModelCalls}.`);
  }

  if (patientOutreach !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-patient-outreach not-authorized but received ${patientOutreach}.`);
  }

  if (payerSubmission !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-payer-submission not-authorized but received ${payerSubmission}.`);
  }

  if (productionBehavior !== "disabled") {
    throw new Error(`${label} expected x-scrimed-production-behavior disabled but received ${productionBehavior}.`);
  }

  if (recordMutation !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-record-mutation not-authorized but received ${recordMutation}.`);
  }

  if (safetyDecision !== "allowed") {
    throw new Error(`${label} expected x-scrimed-safety-decision allowed but received ${safetyDecision}.`);
  }

  if (upgradeBatch !== "scrimed-os-upgrade-batch-ready-no-phi") {
    throw new Error(`${label} expected x-scrimed-os-upgrade-batch scrimed-os-upgrade-batch-ready-no-phi but received ${upgradeBatch}.`);
  }
}

function requireProductionArchitectureBoundary(label, response) {
  const agentAutonomy = response.headers.get("x-scrimed-agent-autonomy");
  const complianceCertification = response.headers.get("x-scrimed-compliance-certification");
  const connectorAuthority = response.headers.get("x-scrimed-connector-authority");
  const modelRoutingAuthority = response.headers.get("x-scrimed-model-routing-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const recordMutation = response.headers.get("x-scrimed-record-mutation");
  const workflowExecution = response.headers.get("x-scrimed-workflow-execution");

  requireSyntheticMetadataBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (agentAutonomy !== "human-review-required-for-protected-actions") {
    throw new Error(`${label} expected x-scrimed-agent-autonomy human-review-required-for-protected-actions but received ${agentAutonomy}.`);
  }

  if (complianceCertification !== "not-certified-readiness-only") {
    throw new Error(`${label} expected x-scrimed-compliance-certification not-certified-readiness-only but received ${complianceCertification}.`);
  }

  if (connectorAuthority !== "not-production-connector-approved") {
    throw new Error(`${label} expected x-scrimed-connector-authority not-production-connector-approved but received ${connectorAuthority}.`);
  }

  if (modelRoutingAuthority !== "not-production-phi-routing-approved") {
    throw new Error(`${label} expected x-scrimed-model-routing-authority not-production-phi-routing-approved but received ${modelRoutingAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (recordMutation !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-record-mutation not-authorized but received ${recordMutation}.`);
  }

  if (workflowExecution !== "deterministic-review-gated") {
    throw new Error(`${label} expected x-scrimed-workflow-execution deterministic-review-gated but received ${workflowExecution}.`);
  }
}

function requireExecutionAttemptEnvelopeBoundary(label, response) {
  const agentAutonomy = response.headers.get("x-scrimed-agent-autonomy");
  const connectorAuthority = response.headers.get("x-scrimed-connector-authority");
  const modelRoutingAuthority = response.headers.get("x-scrimed-model-routing-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const recordMutation = response.headers.get("x-scrimed-record-mutation");
  const replayAuthority = response.headers.get("x-scrimed-replay-authority");
  const workflowExecution = response.headers.get("x-scrimed-workflow-execution");

  requireSyntheticMetadataBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (agentAutonomy !== "human-review-required-for-protected-actions") {
    throw new Error(`${label} expected x-scrimed-agent-autonomy human-review-required-for-protected-actions but received ${agentAutonomy}.`);
  }

  if (connectorAuthority !== "not-production-connector-approved") {
    throw new Error(`${label} expected x-scrimed-connector-authority not-production-connector-approved but received ${connectorAuthority}.`);
  }

  if (modelRoutingAuthority !== "telemetry-only-not-production-routing") {
    throw new Error(`${label} expected x-scrimed-model-routing-authority telemetry-only-not-production-routing but received ${modelRoutingAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (recordMutation !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-record-mutation not-authorized but received ${recordMutation}.`);
  }

  if (replayAuthority !== "metadata-replay-only") {
    throw new Error(`${label} expected x-scrimed-replay-authority metadata-replay-only but received ${replayAuthority}.`);
  }

  if (workflowExecution !== "envelope-contract-only-protected-execution-blocked") {
    throw new Error(`${label} expected x-scrimed-workflow-execution envelope-contract-only-protected-execution-blocked but received ${workflowExecution}.`);
  }
}

function requireExecutionAttemptDurableStoreBoundary(label, response) {
  const agentAutonomy = response.headers.get("x-scrimed-agent-autonomy");
  const connectorAuthority = response.headers.get("x-scrimed-connector-authority");
  const modelRoutingAuthority = response.headers.get("x-scrimed-model-routing-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const recordMutation = response.headers.get("x-scrimed-record-mutation");
  const replayAuthority = response.headers.get("x-scrimed-replay-authority");
  const workflowExecution = response.headers.get("x-scrimed-workflow-execution");

  requireSyntheticMetadataBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (agentAutonomy !== "human-review-required-for-protected-actions") {
    throw new Error(`${label} expected x-scrimed-agent-autonomy human-review-required-for-protected-actions but received ${agentAutonomy}.`);
  }

  if (connectorAuthority !== "not-production-connector-approved") {
    throw new Error(`${label} expected x-scrimed-connector-authority not-production-connector-approved but received ${connectorAuthority}.`);
  }

  if (modelRoutingAuthority !== "telemetry-only-not-production-routing") {
    throw new Error(`${label} expected x-scrimed-model-routing-authority telemetry-only-not-production-routing but received ${modelRoutingAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (recordMutation !== "not-authorized") {
    throw new Error(`${label} expected x-scrimed-record-mutation not-authorized but received ${recordMutation}.`);
  }

  if (replayAuthority !== "metadata-replay-only") {
    throw new Error(`${label} expected x-scrimed-replay-authority metadata-replay-only but received ${replayAuthority}.`);
  }

  if (workflowExecution !== "durable-attempt-store-no-protected-execution") {
    throw new Error(`${label} expected x-scrimed-workflow-execution durable-attempt-store-no-protected-execution but received ${workflowExecution}.`);
  }
}

function requireProductServicePortfolioBoundary(label, response) {
  const accountingAuthority = response.headers.get("x-scrimed-accounting-authority");
  const connectorAuthority = response.headers.get("x-scrimed-connector-authority");
  const dataBoundary = response.headers.get("x-scrimed-data-boundary");
  const financialAuthority = response.headers.get("x-scrimed-financial-authority");
  const legalAuthority = response.headers.get("x-scrimed-legal-authority");
  const offerings = response.headers.get("x-scrimed-offerings");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const profitAuthority = response.headers.get("x-scrimed-profit-authority");
  const reimbursementAuthority = response.headers.get("x-scrimed-reimbursement-authority");
  const revenueAuthority = response.headers.get("x-scrimed-revenue-authority");
  const securitiesAuthority = response.headers.get("x-scrimed-securities-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");
  const taxAuthority = response.headers.get("x-scrimed-tax-authority");

  requireNoClinicalCareAuthority(label, response);

  if (!["product-service-portfolio-active", "product-service-portfolio-brief"].includes(offerings ?? "")) {
    throw new Error(`${label} expected product service portfolio header but received ${offerings}.`);
  }

  if (accountingAuthority !== "qualified-accounting-review-required") {
    throw new Error(`${label} expected x-scrimed-accounting-authority qualified-accounting-review-required but received ${accountingAuthority}.`);
  }

  if (connectorAuthority !== "not-production-connector-approved") {
    throw new Error(`${label} expected x-scrimed-connector-authority not-production-connector-approved but received ${connectorAuthority}.`);
  }

  if (dataBoundary !== "synthetic-business-and-metadata-only") {
    throw new Error(`${label} expected x-scrimed-data-boundary synthetic-business-and-metadata-only but received ${dataBoundary}.`);
  }

  if (financialAuthority !== "not-audited-financial-report") {
    throw new Error(`${label} expected x-scrimed-financial-authority not-audited-financial-report but received ${financialAuthority}.`);
  }

  if (legalAuthority !== "qualified-review-required") {
    throw new Error(`${label} expected x-scrimed-legal-authority qualified-review-required but received ${legalAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (profitAuthority !== "not-profit-margin-guarantee") {
    throw new Error(`${label} expected x-scrimed-profit-authority not-profit-margin-guarantee but received ${profitAuthority}.`);
  }

  if (reimbursementAuthority !== "no-reimbursement-guarantee") {
    throw new Error(`${label} expected x-scrimed-reimbursement-authority no-reimbursement-guarantee but received ${reimbursementAuthority}.`);
  }

  if (revenueAuthority !== "not-revenue-guarantee") {
    throw new Error(`${label} expected x-scrimed-revenue-authority not-revenue-guarantee but received ${revenueAuthority}.`);
  }

  if (securitiesAuthority !== "not-securities-offering-material") {
    throw new Error(`${label} expected x-scrimed-securities-authority not-securities-offering-material but received ${securitiesAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }

  if (taxAuthority !== "qualified-tax-review-required") {
    throw new Error(`${label} expected x-scrimed-tax-authority qualified-tax-review-required but received ${taxAuthority}.`);
  }
}

function requireServiceDeliveryBoundary(label, response) {
  const accountingAuthority = response.headers.get("x-scrimed-accounting-authority");
  const connectorAuthority = response.headers.get("x-scrimed-connector-authority");
  const contractAuthority = response.headers.get("x-scrimed-contract-authority");
  const customerPermission = response.headers.get("x-scrimed-customer-permission");
  const dataBoundary = response.headers.get("x-scrimed-data-boundary");
  const financialAuthority = response.headers.get("x-scrimed-financial-authority");
  const legalAuthority = response.headers.get("x-scrimed-legal-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const profitAuthority = response.headers.get("x-scrimed-profit-authority");
  const reimbursementAuthority = response.headers.get("x-scrimed-reimbursement-authority");
  const revenueAuthority = response.headers.get("x-scrimed-revenue-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");
  const serviceDelivery = response.headers.get("x-scrimed-service-delivery");
  const slaAuthority = response.headers.get("x-scrimed-sla-authority");
  const taxAuthority = response.headers.get("x-scrimed-tax-authority");

  requireNoClinicalCareAuthority(label, response);

  if (![
    "service-delivery-workbench-active",
    "service-delivery-brief-ready-no-sla-authority"
  ].includes(serviceDelivery ?? "")) {
    throw new Error(`${label} expected service delivery header but received ${serviceDelivery}.`);
  }

  if (accountingAuthority !== "qualified-accounting-review-required") {
    throw new Error(`${label} expected x-scrimed-accounting-authority qualified-accounting-review-required but received ${accountingAuthority}.`);
  }

  if (connectorAuthority !== "not-production-connector-approved") {
    throw new Error(`${label} expected x-scrimed-connector-authority not-production-connector-approved but received ${connectorAuthority}.`);
  }

  if (contractAuthority !== "not-contract-approval") {
    throw new Error(`${label} expected x-scrimed-contract-authority not-contract-approval but received ${contractAuthority}.`);
  }

  if (customerPermission !== "not-customer-permission") {
    throw new Error(`${label} expected x-scrimed-customer-permission not-customer-permission but received ${customerPermission}.`);
  }

  if (dataBoundary !== "synthetic-business-and-metadata-only") {
    throw new Error(`${label} expected x-scrimed-data-boundary synthetic-business-and-metadata-only but received ${dataBoundary}.`);
  }

  if (financialAuthority !== "not-audited-financial-report") {
    throw new Error(`${label} expected x-scrimed-financial-authority not-audited-financial-report but received ${financialAuthority}.`);
  }

  if (legalAuthority !== "qualified-review-required") {
    throw new Error(`${label} expected x-scrimed-legal-authority qualified-review-required but received ${legalAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (profitAuthority !== "not-profit-margin-guarantee") {
    throw new Error(`${label} expected x-scrimed-profit-authority not-profit-margin-guarantee but received ${profitAuthority}.`);
  }

  if (reimbursementAuthority !== "no-reimbursement-guarantee") {
    throw new Error(`${label} expected x-scrimed-reimbursement-authority no-reimbursement-guarantee but received ${reimbursementAuthority}.`);
  }

  if (revenueAuthority !== "not-revenue-guarantee") {
    throw new Error(`${label} expected x-scrimed-revenue-authority not-revenue-guarantee but received ${revenueAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }

  if (slaAuthority !== "not-contractual-sla") {
    throw new Error(`${label} expected x-scrimed-sla-authority not-contractual-sla but received ${slaAuthority}.`);
  }

  if (taxAuthority !== "qualified-tax-review-required") {
    throw new Error(`${label} expected x-scrimed-tax-authority qualified-tax-review-required but received ${taxAuthority}.`);
  }
}

function requirePilotDemoCommercialReadinessBoundary(label, response) {
  const commercialReadiness = response.headers.get("x-scrimed-pilot-demo-commercial-readiness");
  const connectorAuthority = response.headers.get("x-scrimed-connector-authority");
  const contractAuthority = response.headers.get("x-scrimed-contract-authority");
  const customerPermission = response.headers.get("x-scrimed-customer-permission");
  const dataBoundary = response.headers.get("x-scrimed-data-boundary");
  const financialAuthority = response.headers.get("x-scrimed-financial-authority");
  const legalAuthority = response.headers.get("x-scrimed-legal-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const procurementAuthority = response.headers.get("x-scrimed-procurement-authority");
  const profitAuthority = response.headers.get("x-scrimed-profit-authority");
  const quoteAuthority = response.headers.get("x-scrimed-quote-authority");
  const reimbursementAuthority = response.headers.get("x-scrimed-reimbursement-authority");
  const revenueAuthority = response.headers.get("x-scrimed-revenue-authority");
  const roiAuthority = response.headers.get("x-scrimed-roi-authority");
  const securitiesAuthority = response.headers.get("x-scrimed-securities-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireNoClinicalCareAuthority(label, response);

  if (![
    "pilot-demo-commercial-accelerator-active",
    "pilot-demo-commercial-brief-ready-no-guarantee"
  ].includes(commercialReadiness ?? "")) {
    throw new Error(`${label} expected pilot demo commercial readiness header but received ${commercialReadiness}.`);
  }

  if (connectorAuthority !== "not-production-connector-approved") {
    throw new Error(`${label} expected x-scrimed-connector-authority not-production-connector-approved but received ${connectorAuthority}.`);
  }

  if (contractAuthority !== "not-contract-approval") {
    throw new Error(`${label} expected x-scrimed-contract-authority not-contract-approval but received ${contractAuthority}.`);
  }

  if (customerPermission !== "not-customer-permission") {
    throw new Error(`${label} expected x-scrimed-customer-permission not-customer-permission but received ${customerPermission}.`);
  }

  if (dataBoundary !== "synthetic-business-and-metadata-only") {
    throw new Error(`${label} expected x-scrimed-data-boundary synthetic-business-and-metadata-only but received ${dataBoundary}.`);
  }

  if (financialAuthority !== "not-audited-financial-report") {
    throw new Error(`${label} expected x-scrimed-financial-authority not-audited-financial-report but received ${financialAuthority}.`);
  }

  if (legalAuthority !== "qualified-review-required") {
    throw new Error(`${label} expected x-scrimed-legal-authority qualified-review-required but received ${legalAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (procurementAuthority !== "not-procurement-approval") {
    throw new Error(`${label} expected x-scrimed-procurement-authority not-procurement-approval but received ${procurementAuthority}.`);
  }

  if (profitAuthority !== "not-profit-margin-guarantee") {
    throw new Error(`${label} expected x-scrimed-profit-authority not-profit-margin-guarantee but received ${profitAuthority}.`);
  }

  if (quoteAuthority !== "not-binding-quote") {
    throw new Error(`${label} expected x-scrimed-quote-authority not-binding-quote but received ${quoteAuthority}.`);
  }

  if (reimbursementAuthority !== "no-reimbursement-guarantee") {
    throw new Error(`${label} expected x-scrimed-reimbursement-authority no-reimbursement-guarantee but received ${reimbursementAuthority}.`);
  }

  if (revenueAuthority !== "not-revenue-guarantee") {
    throw new Error(`${label} expected x-scrimed-revenue-authority not-revenue-guarantee but received ${revenueAuthority}.`);
  }

  if (roiAuthority !== "not-roi-guarantee") {
    throw new Error(`${label} expected x-scrimed-roi-authority not-roi-guarantee but received ${roiAuthority}.`);
  }

  if (securitiesAuthority !== "not-securities-offering-material") {
    throw new Error(`${label} expected x-scrimed-securities-authority not-securities-offering-material but received ${securitiesAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireCompanyAssessmentBoundary(label, response) {
  const accountingAuthority = response.headers.get("x-scrimed-accounting-authority");
  const approvalAuthority = response.headers.get("x-scrimed-approval-authority");
  const companyAssessment = response.headers.get("x-scrimed-company-assessment");
  const connectorAuthority = response.headers.get("x-scrimed-connector-authority");
  const customerPermission = response.headers.get("x-scrimed-customer-permission");
  const dataBoundary = response.headers.get("x-scrimed-data-boundary");
  const financialAuthority = response.headers.get("x-scrimed-financial-authority");
  const investmentAdvice = response.headers.get("x-scrimed-investment-advice");
  const launchAuthority = response.headers.get("x-scrimed-launch-authority");
  const legalAuthority = response.headers.get("x-scrimed-legal-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const profitAuthority = response.headers.get("x-scrimed-profit-authority");
  const reimbursementAuthority = response.headers.get("x-scrimed-reimbursement-authority");
  const revenueAuthority = response.headers.get("x-scrimed-revenue-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");
  const securitiesAuthority = response.headers.get("x-scrimed-securities-authority");
  const solicitationAuthority = response.headers.get("x-scrimed-solicitation-authority");
  const taxAuthority = response.headers.get("x-scrimed-tax-authority");
  const valuationAuthority = response.headers.get("x-scrimed-valuation-authority");

  requireNoClinicalCareAuthority(label, response);

  if (![
    "company-operating-assessment-active",
    "company-operating-assessment-brief-ready-no-advice"
  ].includes(companyAssessment ?? "")) {
    throw new Error(`${label} expected company assessment header but received ${companyAssessment}.`);
  }

  if (accountingAuthority !== "qualified-accounting-review-required") {
    throw new Error(`${label} expected x-scrimed-accounting-authority qualified-accounting-review-required but received ${accountingAuthority}.`);
  }

  if (approvalAuthority !== "external-review-required") {
    throw new Error(`${label} expected x-scrimed-approval-authority external-review-required but received ${approvalAuthority}.`);
  }

  if (connectorAuthority !== "not-production-connector-approved") {
    throw new Error(`${label} expected x-scrimed-connector-authority not-production-connector-approved but received ${connectorAuthority}.`);
  }

  if (customerPermission !== "not-customer-permission") {
    throw new Error(`${label} expected x-scrimed-customer-permission not-customer-permission but received ${customerPermission}.`);
  }

  if (dataBoundary !== "synthetic-business-and-metadata-only") {
    throw new Error(`${label} expected x-scrimed-data-boundary synthetic-business-and-metadata-only but received ${dataBoundary}.`);
  }

  if (financialAuthority !== "not-audited-financial-report") {
    throw new Error(`${label} expected x-scrimed-financial-authority not-audited-financial-report but received ${financialAuthority}.`);
  }

  if (investmentAdvice !== "not-investment-advice") {
    throw new Error(`${label} expected x-scrimed-investment-advice not-investment-advice but received ${investmentAdvice}.`);
  }

  if (launchAuthority !== "human-launch-review-required") {
    throw new Error(`${label} expected x-scrimed-launch-authority human-launch-review-required but received ${launchAuthority}.`);
  }

  if (legalAuthority !== "qualified-review-required") {
    throw new Error(`${label} expected x-scrimed-legal-authority qualified-review-required but received ${legalAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (profitAuthority !== "not-profit-margin-guarantee") {
    throw new Error(`${label} expected x-scrimed-profit-authority not-profit-margin-guarantee but received ${profitAuthority}.`);
  }

  if (reimbursementAuthority !== "no-reimbursement-guarantee") {
    throw new Error(`${label} expected x-scrimed-reimbursement-authority no-reimbursement-guarantee but received ${reimbursementAuthority}.`);
  }

  if (revenueAuthority !== "not-revenue-guarantee") {
    throw new Error(`${label} expected x-scrimed-revenue-authority not-revenue-guarantee but received ${revenueAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }

  if (securitiesAuthority !== "not-securities-offering-material") {
    throw new Error(`${label} expected x-scrimed-securities-authority not-securities-offering-material but received ${securitiesAuthority}.`);
  }

  if (solicitationAuthority !== "not-solicitation") {
    throw new Error(`${label} expected x-scrimed-solicitation-authority not-solicitation but received ${solicitationAuthority}.`);
  }

  if (taxAuthority !== "qualified-tax-review-required") {
    throw new Error(`${label} expected x-scrimed-tax-authority qualified-tax-review-required but received ${taxAuthority}.`);
  }

  if (valuationAuthority !== "not-valuation-assurance") {
    throw new Error(`${label} expected x-scrimed-valuation-authority not-valuation-assurance but received ${valuationAuthority}.`);
  }
}

function requireClinicalProductionReadinessBoundary(label, response) {
  const aiAuthority = response.headers.get("x-scrimed-ai-authority");
  const approvalAuthority = response.headers.get("x-scrimed-approval-authority");
  const clinicalProduction = response.headers.get("x-scrimed-clinical-production-readiness");
  const connectorAuthority = response.headers.get("x-scrimed-connector-authority");
  const customerPermission = response.headers.get("x-scrimed-customer-permission");
  const dataBoundary = response.headers.get("x-scrimed-data-boundary");
  const financialAuthority = response.headers.get("x-scrimed-financial-authority");
  const investmentAdvice = response.headers.get("x-scrimed-investment-advice");
  const launchAuthority = response.headers.get("x-scrimed-launch-authority");
  const legalAuthority = response.headers.get("x-scrimed-legal-authority");
  const medicalAdvice = response.headers.get("x-scrimed-medical-advice");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const profitAuthority = response.headers.get("x-scrimed-profit-authority");
  const regulatoryAuthority = response.headers.get("x-scrimed-regulatory-authority");
  const reimbursementAuthority = response.headers.get("x-scrimed-reimbursement-authority");
  const revenueAuthority = response.headers.get("x-scrimed-revenue-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");
  const securitiesAuthority = response.headers.get("x-scrimed-securities-authority");
  const valuationAuthority = response.headers.get("x-scrimed-valuation-authority");

  requireNoClinicalCareAuthority(label, response);

  if (![
    "clinical-production-readiness-task-ledger-active",
    "clinical-production-readiness-brief-ready-no-clinical-authority"
  ].includes(clinicalProduction ?? "")) {
    throw new Error(`${label} expected clinical production readiness header but received ${clinicalProduction}.`);
  }

  if (aiAuthority !== "no-live-autonomous-ai-authority") {
    throw new Error(`${label} expected x-scrimed-ai-authority no-live-autonomous-ai-authority but received ${aiAuthority}.`);
  }

  if (approvalAuthority !== "external-review-required") {
    throw new Error(`${label} expected x-scrimed-approval-authority external-review-required but received ${approvalAuthority}.`);
  }

  if (connectorAuthority !== "not-production-connector-approved") {
    throw new Error(`${label} expected x-scrimed-connector-authority not-production-connector-approved but received ${connectorAuthority}.`);
  }

  if (customerPermission !== "not-customer-permission") {
    throw new Error(`${label} expected x-scrimed-customer-permission not-customer-permission but received ${customerPermission}.`);
  }

  if (dataBoundary !== "synthetic-no-phi-and-metadata-only") {
    throw new Error(`${label} expected x-scrimed-data-boundary synthetic-no-phi-and-metadata-only but received ${dataBoundary}.`);
  }

  if (financialAuthority !== "not-audited-financial-report") {
    throw new Error(`${label} expected x-scrimed-financial-authority not-audited-financial-report but received ${financialAuthority}.`);
  }

  if (investmentAdvice !== "not-investment-advice") {
    throw new Error(`${label} expected x-scrimed-investment-advice not-investment-advice but received ${investmentAdvice}.`);
  }

  if (launchAuthority !== "human-launch-review-required") {
    throw new Error(`${label} expected x-scrimed-launch-authority human-launch-review-required but received ${launchAuthority}.`);
  }

  if (legalAuthority !== "qualified-review-required") {
    throw new Error(`${label} expected x-scrimed-legal-authority qualified-review-required but received ${legalAuthority}.`);
  }

  if (medicalAdvice !== "not-medical-advice") {
    throw new Error(`${label} expected x-scrimed-medical-advice not-medical-advice but received ${medicalAdvice}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (profitAuthority !== "not-profit-margin-guarantee") {
    throw new Error(`${label} expected x-scrimed-profit-authority not-profit-margin-guarantee but received ${profitAuthority}.`);
  }

  if (regulatoryAuthority !== "external-review-required") {
    throw new Error(`${label} expected x-scrimed-regulatory-authority external-review-required but received ${regulatoryAuthority}.`);
  }

  if (reimbursementAuthority !== "no-reimbursement-guarantee") {
    throw new Error(`${label} expected x-scrimed-reimbursement-authority no-reimbursement-guarantee but received ${reimbursementAuthority}.`);
  }

  if (revenueAuthority !== "not-revenue-guarantee") {
    throw new Error(`${label} expected x-scrimed-revenue-authority not-revenue-guarantee but received ${revenueAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }

  if (securitiesAuthority !== "not-securities-offering-material") {
    throw new Error(`${label} expected x-scrimed-securities-authority not-securities-offering-material but received ${securitiesAuthority}.`);
  }

  if (valuationAuthority !== "not-valuation-assurance") {
    throw new Error(`${label} expected x-scrimed-valuation-authority not-valuation-assurance but received ${valuationAuthority}.`);
  }
}

function requireClientOnboardingBoundary(label, response) {
  const calendarAuthority = response.headers.get("x-scrimed-calendar-authority");
  const clientOnboarding = response.headers.get("x-scrimed-client-onboarding");
  const communicationAuthority = response.headers.get("x-scrimed-communication-authority");
  const contractAuthority = response.headers.get("x-scrimed-contract-authority");
  const dataBoundary = response.headers.get("x-scrimed-data-boundary");
  const legalAuthority = response.headers.get("x-scrimed-legal-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const procurementAuthority = response.headers.get("x-scrimed-procurement-authority");
  const revenueAuthority = response.headers.get("x-scrimed-revenue-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireNoClinicalCareAuthority(label, response);

  if (![
    "communications-control-plane-active",
    "client-onboarding-communications-brief-ready-no-sent-communication"
  ].includes(clientOnboarding ?? "")) {
    throw new Error(`${label} expected client onboarding boundary header but received ${clientOnboarding}.`);
  }

  if (calendarAuthority !== "calendar-ready-not-invite-created") {
    throw new Error(`${label} expected x-scrimed-calendar-authority calendar-ready-not-invite-created but received ${calendarAuthority}.`);
  }

  if (communicationAuthority !== "templates-only-human-send-required") {
    throw new Error(`${label} expected x-scrimed-communication-authority templates-only-human-send-required but received ${communicationAuthority}.`);
  }

  if (contractAuthority !== "not-contract-approval") {
    throw new Error(`${label} expected x-scrimed-contract-authority not-contract-approval but received ${contractAuthority}.`);
  }

  if (dataBoundary !== "business-contact-workflow-and-metadata-only") {
    throw new Error(`${label} expected x-scrimed-data-boundary business-contact-workflow-and-metadata-only but received ${dataBoundary}.`);
  }

  if (legalAuthority !== "qualified-review-required") {
    throw new Error(`${label} expected x-scrimed-legal-authority qualified-review-required but received ${legalAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (procurementAuthority !== "not-procurement-approval") {
    throw new Error(`${label} expected x-scrimed-procurement-authority not-procurement-approval but received ${procurementAuthority}.`);
  }

  if (revenueAuthority !== "not-revenue-guarantee") {
    throw new Error(`${label} expected x-scrimed-revenue-authority not-revenue-guarantee but received ${revenueAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireQaExecutionBoundary(label, response) {
  const aal2Execution = response.headers.get("x-scrimed-aal2-execution");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const qaProof = response.headers.get("x-scrimed-qa-proof");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (aal2Execution !== "human-required-not-code-bypass") {
    throw new Error(`${label} expected x-scrimed-aal2-execution human-required-not-code-bypass but received ${aal2Execution}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (qaProof !== "activation-ready-not-retained-proof") {
    throw new Error(`${label} expected x-scrimed-qa-proof activation-ready-not-retained-proof but received ${qaProof}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireQaRunControlBoundary(label, response) {
  const aal2Execution = response.headers.get("x-scrimed-aal2-execution");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const qaProof = response.headers.get("x-scrimed-qa-proof");
  const runControl = response.headers.get("x-scrimed-run-control");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (aal2Execution !== "human-required-not-code-bypass") {
    throw new Error(`${label} expected x-scrimed-aal2-execution human-required-not-code-bypass but received ${aal2Execution}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (qaProof !== "operator-brief-ready-not-retained-proof") {
    throw new Error(`${label} expected x-scrimed-qa-proof operator-brief-ready-not-retained-proof but received ${qaProof}.`);
  }

  if (runControl !== "no-secret-operator-brief") {
    throw new Error(`${label} expected x-scrimed-run-control no-secret-operator-brief but received ${runControl}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireQaLaunchKitBoundary(label, response) {
  const aal2Execution = response.headers.get("x-scrimed-aal2-execution");
  const launchKit = response.headers.get("x-scrimed-qa-launch-kit");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const qaProof = response.headers.get("x-scrimed-qa-proof");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (aal2Execution !== "human-required-not-code-bypass") {
    throw new Error(`${label} expected x-scrimed-aal2-execution human-required-not-code-bypass but received ${aal2Execution}.`);
  }

  if (launchKit !== "no-secret-human-aal2-handoff") {
    throw new Error(`${label} expected x-scrimed-qa-launch-kit no-secret-human-aal2-handoff but received ${launchKit}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (qaProof !== "operator-handoff-ready-not-retained-proof") {
    throw new Error(`${label} expected x-scrimed-qa-proof operator-handoff-ready-not-retained-proof but received ${qaProof}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireQaHumanRunPacketBoundary(label, response) {
  const aal2Execution = response.headers.get("x-scrimed-aal2-execution");
  const humanRunPacket = response.headers.get("x-scrimed-qa-human-run-packet");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const qaProof = response.headers.get("x-scrimed-qa-proof");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (aal2Execution !== "human-required-not-code-bypass") {
    throw new Error(`${label} expected x-scrimed-aal2-execution human-required-not-code-bypass but received ${aal2Execution}.`);
  }

  if (humanRunPacket !== "dispatch-ready-human-aal2-required") {
    throw new Error(`${label} expected x-scrimed-qa-human-run-packet dispatch-ready-human-aal2-required but received ${humanRunPacket}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (qaProof !== "dispatch-ready-not-retained-proof") {
    throw new Error(`${label} expected x-scrimed-qa-proof dispatch-ready-not-retained-proof but received ${qaProof}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireQaCompletionBridgeBoundary(label, response) {
  const aal2Execution = response.headers.get("x-scrimed-aal2-execution");
  const completionBridge = response.headers.get("x-scrimed-qa-completion-bridge");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const qaProof = response.headers.get("x-scrimed-qa-proof");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (aal2Execution !== "human-required-not-code-bypass") {
    throw new Error(`${label} expected x-scrimed-aal2-execution human-required-not-code-bypass but received ${aal2Execution}.`);
  }

  if (completionBridge !== "no-secret-pre-persistence-validation") {
    throw new Error(`${label} expected x-scrimed-qa-completion-bridge no-secret-pre-persistence-validation but received ${completionBridge}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (qaProof !== "candidate-ready-not-retained-proof") {
    throw new Error(`${label} expected x-scrimed-qa-proof candidate-ready-not-retained-proof but received ${qaProof}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireQaClaimGuardBoundary(label, response) {
  const aal2Execution = response.headers.get("x-scrimed-aal2-execution");
  const claimAuthority = response.headers.get("x-scrimed-claim-authority");
  const claimGuard = response.headers.get("x-scrimed-qa-claim-guard");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const qaProof = response.headers.get("x-scrimed-qa-proof");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (aal2Execution !== "human-required-not-code-bypass") {
    throw new Error(`${label} expected x-scrimed-aal2-execution human-required-not-code-bypass but received ${aal2Execution}.`);
  }

  if (claimAuthority !== "claim-guidance-not-legal-approval") {
    throw new Error(`${label} expected x-scrimed-claim-authority claim-guidance-not-legal-approval but received ${claimAuthority}.`);
  }

  if (claimGuard !== "current-state-no-overclaim") {
    throw new Error(`${label} expected x-scrimed-qa-claim-guard current-state-no-overclaim but received ${claimGuard}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (qaProof !== "claim-guard-ready-not-retained-proof") {
    throw new Error(`${label} expected x-scrimed-qa-proof claim-guard-ready-not-retained-proof but received ${qaProof}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireQaProofPromotionBoundary(label, response) {
  const aal2Execution = response.headers.get("x-scrimed-aal2-execution");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const qaProof = response.headers.get("x-scrimed-qa-proof");
  const proofPromotion = response.headers.get("x-scrimed-qa-proof-promotion");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (aal2Execution !== "human-required-not-code-bypass") {
    throw new Error(`${label} expected x-scrimed-aal2-execution human-required-not-code-bypass but received ${aal2Execution}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (qaProof !== "promotion-gated-retained-packet-required") {
    throw new Error(`${label} expected x-scrimed-qa-proof promotion-gated-retained-packet-required but received ${qaProof}.`);
  }

  if (proofPromotion !== "retained-packet-required") {
    throw new Error(`${label} expected x-scrimed-qa-proof-promotion retained-packet-required but received ${proofPromotion}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireQaActivationSealBoundary(label, response) {
  const aal2Execution = response.headers.get("x-scrimed-aal2-execution");
  const activationSeal = response.headers.get("x-scrimed-qa-activation-seal");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const qaProof = response.headers.get("x-scrimed-qa-proof");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (aal2Execution !== "human-required-not-code-bypass") {
    throw new Error(`${label} expected x-scrimed-aal2-execution human-required-not-code-bypass but received ${aal2Execution}.`);
  }

  if (activationSeal !== "protected-packet-required") {
    throw new Error(`${label} expected x-scrimed-qa-activation-seal protected-packet-required but received ${activationSeal}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (qaProof !== "activation-seal-ready-not-retained-proof") {
    throw new Error(`${label} expected x-scrimed-qa-proof activation-seal-ready-not-retained-proof but received ${qaProof}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireQaBuyerProofReleaseBoundary(label, response) {
  const aal2Execution = response.headers.get("x-scrimed-aal2-execution");
  const buyerProofRelease = response.headers.get("x-scrimed-qa-buyer-proof-release");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const qaProof = response.headers.get("x-scrimed-qa-proof");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (aal2Execution !== "human-required-not-code-bypass") {
    throw new Error(`${label} expected x-scrimed-aal2-execution human-required-not-code-bypass but received ${aal2Execution}.`);
  }

  if (!["protected-release-required", "retained-packet-gated"].includes(buyerProofRelease ?? "")) {
    throw new Error(`${label} expected x-scrimed-qa-buyer-proof-release protected-release-required or retained-packet-gated but received ${buyerProofRelease}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (![
    "buyer-proof-release-gated-retained-packet-required",
    "buyer-proof-release-brief-no-public-release",
    "buyer-proof-release-gated"
  ].includes(qaProof ?? "")) {
    throw new Error(`${label} expected buyer proof release qa-proof boundary but received ${qaProof}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireBuyerReleaseControlRunBoundary(label, response) {
  const buyerShare = response.headers.get("x-scrimed-buyer-share");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const releaseAuthority = response.headers.get("x-scrimed-release-authority");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (buyerShare !== "runbook-ready-protected-aal2-required") {
    throw new Error(`${label} expected x-scrimed-buyer-share runbook-ready-protected-aal2-required but received ${buyerShare}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (releaseAuthority !== "not-release-approval") {
    throw new Error(`${label} expected x-scrimed-release-authority not-release-approval but received ${releaseAuthority}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireQaManualExecutionConsoleBoundary(label, response) {
  const aal2Execution = response.headers.get("x-scrimed-aal2-execution");
  const executionConsole = response.headers.get("x-scrimed-qa-execution-console");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const qaProof = response.headers.get("x-scrimed-qa-proof");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (aal2Execution !== "human-required-not-code-bypass") {
    throw new Error(`${label} expected x-scrimed-aal2-execution human-required-not-code-bypass but received ${aal2Execution}.`);
  }

  if (!["public-summary-only", "brief-no-secret-no-auth-claim", "protected-state-verification"].includes(executionConsole ?? "")) {
    throw new Error(`${label} expected manual execution console boundary header but received ${executionConsole}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (!["retained-packet-required", "retained-packet-gated"].includes(qaProof ?? "")) {
    throw new Error(`${label} expected retained-packet manual execution proof boundary but received ${qaProof}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

function requireQaAal2RunEvidenceBoundary(label, response) {
  const aal2Execution = response.headers.get("x-scrimed-aal2-execution");
  const evidence = response.headers.get("x-scrimed-qa-evidence");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const qaProof = response.headers.get("x-scrimed-qa-proof");
  const securityCertification = response.headers.get("x-scrimed-security-certification");

  requireSyntheticBoundary(label, response);
  requireNoClinicalCareAuthority(label, response);

  if (aal2Execution !== "human-required-not-code-bypass") {
    throw new Error(`${label} expected x-scrimed-aal2-execution human-required-not-code-bypass but received ${aal2Execution}.`);
  }

  if (![
    "aal2-run-evidence-package",
    "aal2-run-evidence-brief",
    "aal2-run-evidence-protected-state",
    "aal2-smoke-readiness-preflight",
    "aal2-smoke-readiness-brief"
  ].includes(evidence ?? "")) {
    throw new Error(`${label} expected AAL2 run evidence boundary header but received ${evidence}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected x-scrimed-phi-authority not-authorized-production-phi but received ${phiAuthority}.`);
  }

  if (![
    "no-buyer-proof-release-without-retained-packet",
    "retained-packet-gated",
    "no-secret-operator-readiness-only"
  ].includes(qaProof ?? "")) {
    throw new Error(`${label} expected retained-packet AAL2 evidence proof boundary but received ${qaProof}.`);
  }

  if (securityCertification !== "not-security-certified") {
    throw new Error(`${label} expected x-scrimed-security-certification not-security-certified but received ${securityCertification}.`);
  }
}

async function checkHtml(path) {
  const result = await request(path);
  requireStatus(path, result.response.status, 200);
  requireContentType(path, result.response, "text/html");
  console.log(`pass html route ${path}: ${result.response.status}`);
}

async function checkSiteNavigationShell() {
  const root = await request("/");
  requireStatus("site navigation root", root.response.status, 200);
  requireContentType("site navigation root", root.response, "text/html");

  if (!root.body.text.includes("site-navigation-shell")) {
    throw new Error("site navigation root expected persistent site-navigation-shell markup.");
  }

  if (!root.body.text.includes("Atlas-first healthcare intelligence")) {
    throw new Error("site navigation root expected Atlas-first public positioning.");
  }

  if (!root.body.text.includes("Illustrative engagement paths")) {
    throw new Error("site navigation root expected pre-commercial engagement paths.");
  }

  if (!root.body.text.includes("Trust that helps close the deal")) {
    throw new Error("site navigation root expected strategic trust, reliability, and safety buyer messaging.");
  }

  if (!root.body.text.includes("Grouped site navigation")) {
    throw new Error("site navigation root expected grouped site navigation aria label.");
  }

  if (!root.body.text.includes("Company")) {
    throw new Error("site navigation root expected company assessment shortcut.");
  }

  if (!root.body.text.includes("Limitations")) {
    throw new Error("site navigation root expected limitations shortcut.");
  }

  if (!root.body.text.includes("Health Records")) {
    throw new Error("site navigation root expected health records shortcut.");
  }

  if (!root.body.text.includes("Offerings")) {
    throw new Error("site navigation root expected offerings shortcut.");
  }

  if (!root.body.text.includes("Delivery")) {
    throw new Error("site navigation root expected delivery shortcut.");
  }

  if (!root.body.text.includes("Client Onboarding")) {
    throw new Error("site navigation root expected client onboarding shortcut.");
  }

  if (!root.body.text.includes("Enterprise Scale")) {
    throw new Error("site navigation root expected enterprise scale shortcut.");
  }

  if (!root.body.text.includes("Platform Power")) {
    throw new Error("site navigation root expected platform power shortcut.");
  }

  if (!root.body.text.includes("Workarounds")) {
    throw new Error("site navigation root expected workarounds shortcut.");
  }

  if (!root.body.text.includes("Investors")) {
    throw new Error("site navigation root expected investors shortcut.");
  }

  const navigationPage = await request("/navigation");
  requireStatus("site navigation audit page", navigationPage.response.status, 200);
  requireContentType("site navigation audit page", navigationPage.response, "text/html");

  if (!navigationPage.body.text.includes("Role Journeys")) {
    throw new Error("navigation page expected role journey section.");
  }

  if (!navigationPage.body.text.includes("Navigation limitation controls")) {
    throw new Error("navigation page expected limitation-control section.");
  }

  console.log("pass site navigation shell");
}

async function checkBuyerTrustReliabilitySafetyMessaging() {
  const trustCenter = await request("/trust-center");
  requireStatus("trust center messaging", trustCenter.response.status, 200);
  requireContentType("trust center messaging", trustCenter.response, "text/html");

  if (!trustCenter.body.text.includes("Trust is a buying advantage")) {
    throw new Error("Trust Center missing buyer trust advantage messaging.");
  }

  if (!trustCenter.body.text.includes("lower diligence friction")) {
    throw new Error("Trust Center missing diligence-friction trust copy.");
  }

  const trustOps = await request("/trust-safety-operations");
  requireStatus("trust safety operations messaging", trustOps.response.status, 200);
  requireContentType("trust safety operations messaging", trustOps.response, "text/html");

  if (!trustOps.body.text.includes("Reliability buyers can inspect")) {
    throw new Error("Trust Safety Operations missing reliability buyer messaging.");
  }

  const limitations = await request("/limitations-workarounds");
  requireStatus("limitations buyer trust messaging", limitations.response.status, 200);
  requireContentType("limitations buyer trust messaging", limitations.response, "text/html");

  if (!limitations.body.text.includes("Boundaries buyers can trust")) {
    throw new Error("Limitations Workarounds missing buyer-confidence boundary messaging.");
  }

  if (!limitations.body.text.includes("Known limit resolution queue")) {
    throw new Error("Limitations Workarounds missing known-limit resolution queue section.");
  }

  if (!limitations.body.text.includes("Recent workaround execution ledger")) {
    throw new Error("Limitations Workarounds missing recent workaround execution ledger section.");
  }

  if (!limitations.body.text.includes("AAL2 durable-store token")) {
    throw new Error("Limitations Workarounds missing AAL2 durable-store token blocker.");
  }

  if (!limitations.body.text.includes("strict AAL2 durable-store smoke")) {
    throw new Error("Limitations Workarounds missing strict AAL2 durable-store smoke proof language.");
  }

  const enterprise = await request("/api/enterprise-readiness");
  requireStatus("enterprise trust dividend API", enterprise.response.status, 200);
  requireContentType("enterprise trust dividend API", enterprise.response, "application/json");
  const enterpriseJson = requireJson("enterprise trust dividend API", enterprise.body);

  if (enterpriseJson.trustDividendSignalCount < 5) {
    throw new Error("Enterprise readiness API expected trust dividend buyer signals.");
  }

  if (enterpriseJson.claims.approved < 8) {
    throw new Error("Enterprise readiness API expected expanded approved trust/reliability/safety claims.");
  }

  const claims = await request("/api/enterprise-readiness/claims");
  requireStatus("claims trust proof API", claims.response.status, 200);
  requireContentType("claims trust proof API", claims.response, "application/json");
  const claimsJson = requireJson("claims trust proof API", claims.body);

  if (!claimsJson.claims.some((claim) => claim.id === "claim-safety-first-evaluation")) {
    throw new Error("Claims API missing safety-first evaluation approved claim.");
  }

  const limitationsApi = await request("/api/limitations-workarounds");
  requireStatus("limitations buyer-confidence API", limitationsApi.response.status, 200);
  requireContentType("limitations buyer-confidence API", limitationsApi.response, "application/json");
  const limitationsJson = requireJson("limitations buyer-confidence API", limitationsApi.body);

  if (limitationsJson.buyerConfidenceSignalCount < 4) {
    throw new Error("Limitations Workarounds API expected buyer-confidence signals.");
  }

  if (limitationsJson.resolutionWorkOrderCount < 6) {
    throw new Error("Limitations Workarounds API expected known-limit resolution work orders.");
  }

  if (limitationsJson.unresolvedResolutionWorkOrderCount < 4) {
    throw new Error("Limitations Workarounds API expected unresolved known-limit blockers.");
  }

  if (limitationsJson.executionLedgerCount < 5) {
    throw new Error("Limitations Workarounds API expected no-secret execution ledger entries.");
  }

  if (limitationsJson.resolvedExecutionLedgerCount < 5) {
    throw new Error("Limitations Workarounds API expected resolved execution ledger controls.");
  }

  const knownLimitSlugs = new Set(
    (limitationsJson.resolutionWorkOrders ?? []).map((workOrder) => workOrder.slug)
  );

  for (const slug of [
    "aal2-durable-store-token-smoke",
    "sandbox-dns-network-boundary",
    "supabase-password-posture",
    "local-next-swc-signature-boundary",
    "dirty-worktree-release-hygiene"
  ]) {
    if (!knownLimitSlugs.has(slug)) {
      throw new Error(`Limitations Workarounds API missing known-limit work order ${slug}.`);
    }
  }

  const executionLedgerSlugs = new Set(
    (limitationsJson.executionLedger ?? []).map((entry) => entry.slug)
  );

  for (const slug of [
    "tenant-admin-workspace-bootstrap-complete",
    "aal2-token-helper-source-precedence",
    "durable-store-phi-guard-precision-applied",
    "strict-aal2-durable-store-smoke-passed",
    "vercel-archive-deploy-hygiene-active"
  ]) {
    if (!executionLedgerSlugs.has(slug)) {
      throw new Error(`Limitations Workarounds API missing execution ledger entry ${slug}.`);
    }
  }

  console.log("pass buyer trust reliability safety messaging");
}

async function checkProductConsole() {
  const result = await request("/api/product/console");
  requireStatus("product console", result.response.status, 200);
  requireContentType("product console", result.response, "application/json");
  const body = requireJson("product console", result.body);

  if (body.service !== "scrimed-product-console") {
    throw new Error(`product console expected service scrimed-product-console but received ${body.service}.`);
  }

  if (body.proofStack?.passkeyTenantAuthentication !== "passkey-or-magic-link-plus-aal2") {
    throw new Error("product console missing passkey tenant authentication proof-stack posture.");
  }

  if (
    body.proofStack?.releaseContinuity !==
    "release-continuity-checkpointed-aal2-boundary"
  ) {
    throw new Error("product console missing release continuity proof-stack posture.");
  }

  if (
    body.proofStack?.releaseContinuityBrief !==
    "release-continuity-brief-operator-ready"
  ) {
    throw new Error("product console missing release continuity brief proof-stack posture.");
  }

  if (!body.releaseContinuityGateCount || body.releaseContinuityGateCount < 5) {
    throw new Error("product console expected release continuity gate coverage.");
  }

  if (!body.releaseContinuityPassedCheckCount || body.releaseContinuityPassedCheckCount < 4) {
    throw new Error("product console expected release continuity passed-check coverage.");
  }

  if (!body.releaseContinuityOperatorRequiredGateCount) {
    throw new Error("product console expected release continuity AAL2 operator gate coverage.");
  }

  if (body.proofStack?.navigationAudit !== "route-navigation-audit-active") {
    throw new Error("product console missing navigation audit proof-stack posture.");
  }

  if (body.proofStack?.navigationAuditBrief !== "route-navigation-audit-brief-ready") {
    throw new Error("product console missing navigation audit brief proof-stack posture.");
  }

  if (!body.navigationAuditPageRouteCount || body.navigationAuditPageRouteCount < 120) {
    throw new Error("product console expected navigation audit page route coverage.");
  }

  if (!body.navigationAuditApiRoutePatternCount || body.navigationAuditApiRoutePatternCount < 281) {
    throw new Error("product console expected navigation audit API route coverage.");
  }

  if (!body.navigationAuditGroupCount || body.navigationAuditGroupCount < 8) {
    throw new Error("product console expected navigation group coverage.");
  }

  if (!body.navigationAuditSmokeCoveredHtmlRouteCount || body.navigationAuditSmokeCoveredHtmlRouteCount < 45) {
    throw new Error("product console expected smoke-covered HTML route coverage.");
  }

  if (body.proofStack?.launchReadiness !== "launch-readiness-control-plane-active") {
    throw new Error("product console missing launch readiness proof-stack posture.");
  }

  if (body.proofStack?.launchReadinessBrief !== "launch-readiness-brief-ready") {
    throw new Error("product console missing launch readiness brief proof-stack posture.");
  }

  if (!body.launchReadinessTrackCount || body.launchReadinessTrackCount < 10) {
    throw new Error("product console expected launch readiness track coverage.");
  }

  if (!body.launchReadinessDnsControlCount || body.launchReadinessDnsControlCount < 3) {
    throw new Error("product console expected launch readiness DNS control coverage.");
  }

  if (!body.launchReadinessServicePathCount || body.launchReadinessServicePathCount < 5) {
    throw new Error("product console expected launch readiness service path coverage.");
  }

  if (!body.launchReadinessHardStopCount || body.launchReadinessHardStopCount < 10) {
    throw new Error("product console expected launch readiness hard-stop coverage.");
  }

  if (body.proofStack?.competitiveMarketIntelligence !== "competitor-informed-build-map-active") {
    throw new Error("product console missing competitive market intelligence proof-stack posture.");
  }

  if (!body.competitiveMarketSourceCount || body.competitiveMarketSourceCount < 14) {
    throw new Error("product console expected competitive market source coverage.");
  }

  if (!body.competitiveMarketBuildPatternCount || body.competitiveMarketBuildPatternCount < 5) {
    throw new Error("product console expected competitive market build pattern coverage.");
  }

  if (!body.competitiveTargetAudienceStrategyCount || body.competitiveTargetAudienceStrategyCount < 10) {
    throw new Error("product console expected competitive target audience strategy coverage.");
  }

  if (!body.competitiveTargetAudienceProofRouteCount || body.competitiveTargetAudienceProofRouteCount < 20) {
    throw new Error("product console expected competitive target audience proof-route coverage.");
  }

  if (body.proofStack?.competitiveDefense !== "competitive-defense-hardening-active") {
    throw new Error("product console missing competitive defense proof-stack posture.");
  }

  if (
    body.proofStack?.competitiveDefenseBrief !==
    "competitive-defense-brief-ready-no-legal-security-certification"
  ) {
    throw new Error("product console missing competitive defense brief proof-stack posture.");
  }

  if (!body.competitiveDefenseThreatProfileCount || body.competitiveDefenseThreatProfileCount < 10) {
    throw new Error("product console expected competitive defense threat profile coverage.");
  }

  if (!body.competitiveDefenseLegalPrivacyCyberControlCount || body.competitiveDefenseLegalPrivacyCyberControlCount < 8) {
    throw new Error("product console expected competitive defense legal/privacy/cyber control coverage.");
  }

  if (!body.competitiveDefenseInfiltrationDeterrenceLayerCount || body.competitiveDefenseInfiltrationDeterrenceLayerCount < 6) {
    throw new Error("product console expected competitive defense infiltration deterrence coverage.");
  }

  if (!body.competitiveDefenseHardStopCount || body.competitiveDefenseHardStopCount < 6) {
    throw new Error("product console expected competitive defense hard-stop coverage.");
  }

  if (body.proofStack?.serviceReliability !== "service-reliability-hardening-active") {
    throw new Error("product console missing service reliability proof-stack posture.");
  }

  if (body.proofStack?.serviceReliabilityBrief !== "service-reliability-brief-ready") {
    throw new Error("product console missing service reliability brief proof-stack posture.");
  }

  if (!body.serviceReliabilityControlCount || body.serviceReliabilityControlCount < 10) {
    throw new Error("product console expected service reliability control coverage.");
  }

  if (!body.serviceReliabilityFaultClassCount || body.serviceReliabilityFaultClassCount < 8) {
    throw new Error("product console expected service reliability fault-class coverage.");
  }

  if (!body.serviceReliabilityEfficiencyImprovementCount || body.serviceReliabilityEfficiencyImprovementCount < 6) {
    throw new Error("product console expected service reliability efficiency coverage.");
  }

  if (!body.serviceReliabilityOpenGateCount || body.serviceReliabilityOpenGateCount < 4) {
    throw new Error("product console expected service reliability open-gate coverage.");
  }

  if (
    body.proofStack?.automationAutopilot !==
    "scrimed-automation-autopilot-active-synthetic-no-phi"
  ) {
    throw new Error("product console missing automation autopilot proof-stack posture.");
  }

  if (
    body.proofStack?.automationAutopilotBrief !==
    "scrimed-automation-autopilot-brief-ready"
  ) {
    throw new Error("product console missing automation autopilot brief proof-stack posture.");
  }

  if (!body.automationAutopilotCapabilityCount || body.automationAutopilotCapabilityCount < 10) {
    throw new Error("product console expected automation autopilot capability coverage.");
  }

  if (!body.automationAutopilotSyntheticAutopilotCount) {
    throw new Error("product console expected automation autopilot synthetic lane coverage.");
  }

  if (
    body.automationAutopilotReviewRequiredCount !==
    body.automationAutopilotCapabilityCount
  ) {
    throw new Error("product console expected all automation autopilot lanes to require review.");
  }

  if (
    body.automationAutopilotProductionAuthorityBlockedCount !==
    body.automationAutopilotCapabilityCount
  ) {
    throw new Error("product console expected all automation autopilot lanes to block production authority.");
  }

  if (
    !body.automationAutopilotBottleneckWorkaroundCount ||
    body.automationAutopilotBottleneckWorkaroundCount < 4
  ) {
    throw new Error("product console expected automation autopilot bottleneck workaround coverage.");
  }

  if (
    body.proofStack?.strategicProblemResolution !==
    "strategic-problem-resolution-engine-active-no-production-authority"
  ) {
    throw new Error("product console missing strategic problem resolution proof-stack posture.");
  }

  if (
    body.proofStack?.strategicProblemResolutionBrief !==
    "strategic-problem-resolution-brief-ready-no-execution-claim"
  ) {
    throw new Error("product console missing strategic problem resolution brief proof-stack posture.");
  }

  if (!body.strategicProblemResolutionProblemCount || body.strategicProblemResolutionProblemCount < 8) {
    throw new Error("product console expected strategic problem queue coverage.");
  }

  if (!body.strategicProblemResolutionCriticalProblemCount || body.strategicProblemResolutionCriticalProblemCount < 3) {
    throw new Error("product console expected critical strategic problem coverage.");
  }

  if (!body.strategicProblemResolutionAveragePriorityScore || body.strategicProblemResolutionAveragePriorityScore < 80) {
    throw new Error("product console expected strategic problem priority score coverage.");
  }

  if (!body.strategicProblemResolutionHumanReviewRequiredCount || body.strategicProblemResolutionHumanReviewRequiredCount < 3) {
    throw new Error("product console expected strategic problem human-review coverage.");
  }

  if (!body.strategicProblemResolutionProofRouteCount || body.strategicProblemResolutionProofRouteCount < 15) {
    throw new Error("product console expected strategic problem proof-route coverage.");
  }

  if (
    body.proofStack?.healthcareOptimizationCommand !==
    "healthcare-optimization-command-active-synthetic-no-production-authority"
  ) {
    throw new Error("product console missing healthcare optimization command proof-stack posture.");
  }

  if (
    body.proofStack?.healthcareOptimizationCommandBrief !==
    "healthcare-optimization-command-brief-ready-no-live-action"
  ) {
    throw new Error("product console missing healthcare optimization command brief proof-stack posture.");
  }

  if (!body.healthcareOptimizationCommandLaneCount || body.healthcareOptimizationCommandLaneCount < 7) {
    throw new Error("product console expected healthcare optimization lane coverage.");
  }

  if (!body.healthcareOptimizationCommandPlaybookCount || body.healthcareOptimizationCommandPlaybookCount < 4) {
    throw new Error("product console expected healthcare optimization playbook coverage.");
  }

  if (!body.healthcareOptimizationCommandInnovationTrackCount || body.healthcareOptimizationCommandInnovationTrackCount < 4) {
    throw new Error("product console expected healthcare optimization innovation-track coverage.");
  }

  if (!body.healthcareOptimizationCommandAgentCapabilityCount || body.healthcareOptimizationCommandAgentCapabilityCount < 25) {
    throw new Error("product console expected healthcare optimization agent capability coverage.");
  }

  if (!body.healthcareOptimizationCommandInteroperableStandardCount || body.healthcareOptimizationCommandInteroperableStandardCount < 15) {
    throw new Error("product console expected healthcare optimization interoperability coverage.");
  }

  if (!body.healthcareOptimizationCommandMeasurableOutcomeCount || body.healthcareOptimizationCommandMeasurableOutcomeCount < 20) {
    throw new Error("product console expected healthcare optimization outcome coverage.");
  }

  if (
    body.healthcareOptimizationCommandHumanReviewRequiredCount !==
    body.healthcareOptimizationCommandLaneCount
  ) {
    throw new Error("product console expected every healthcare optimization lane to require human review.");
  }

  if (!body.healthcareOptimizationCommandSummary?.blockedActions?.includes("live PHI processing")) {
    throw new Error("product console expected healthcare optimization to keep live PHI blocked.");
  }

  if (
    body.proofStack?.healthcareValueRealization !==
    "healthcare-value-realization-active-synthetic-no-roi-guarantee"
  ) {
    throw new Error("product console missing healthcare value realization proof-stack posture.");
  }

  if (
    body.proofStack?.healthcareValueRealizationBrief !==
    "healthcare-value-realization-brief-ready-no-financial-authority"
  ) {
    throw new Error("product console missing healthcare value realization brief proof-stack posture.");
  }

  if (!body.healthcareValueRealizationMetricCount || body.healthcareValueRealizationMetricCount < 12) {
    throw new Error("product console expected healthcare value metric coverage.");
  }

  if (!body.healthcareValueRealizationPackageCount || body.healthcareValueRealizationPackageCount < 5) {
    throw new Error("product console expected healthcare value package coverage.");
  }

  if (!body.healthcareValueRealizationRiskControlCount || body.healthcareValueRealizationRiskControlCount < 6) {
    throw new Error("product console expected healthcare value risk-control coverage.");
  }

  if (!body.healthcareValueRealizationAverageEvidenceScore || body.healthcareValueRealizationAverageEvidenceScore < 85) {
    throw new Error("product console expected healthcare value evidence score coverage.");
  }

  if (
    body.healthcareValueRealizationHumanReviewRequiredCount !==
    body.healthcareValueRealizationMetricCount
  ) {
    throw new Error("product console expected every healthcare value metric to require human review.");
  }

  if (!body.healthcareValueRealizationSummary?.blockedActions?.includes("ROI guarantee")) {
    throw new Error("product console expected healthcare value realization to keep ROI guarantee blocked.");
  }

  if (
    body.proofStack?.pilotValueEvidence !==
    "pilot-value-evidence-packets-active-synthetic-no-commercial-guarantee"
  ) {
    throw new Error("product console missing pilot value evidence proof-stack posture.");
  }

  if (
    body.proofStack?.pilotValueEvidenceBrief !==
    "pilot-value-evidence-brief-ready-no-customer-activation-authority"
  ) {
    throw new Error("product console missing pilot value evidence brief proof-stack posture.");
  }

  if (!body.pilotValueEvidenceArtifactCount || body.pilotValueEvidenceArtifactCount < 8) {
    throw new Error("product console expected pilot value evidence artifact coverage.");
  }

  if (!body.pilotValueEvidencePacketCount || body.pilotValueEvidencePacketCount < 5) {
    throw new Error("product console expected pilot value evidence packet coverage.");
  }

  if (!body.pilotValueEvidenceReviewerCheckpointCount || body.pilotValueEvidenceReviewerCheckpointCount < 5) {
    throw new Error("product console expected pilot value evidence reviewer checkpoint coverage.");
  }

  if (!body.pilotValueEvidenceClaimControlCount || body.pilotValueEvidenceClaimControlCount < 7) {
    throw new Error("product console expected pilot value evidence claim-control coverage.");
  }

  if (!body.pilotValueEvidenceAverageEvidenceScore || body.pilotValueEvidenceAverageEvidenceScore < 85) {
    throw new Error("product console expected pilot value evidence score coverage.");
  }

  if (!body.pilotValueEvidenceSummary?.blockedClaims?.includes("binding commercial offer")) {
    throw new Error("product console expected pilot value evidence to keep binding commercial offers blocked.");
  }

  if (
    body.proofStack?.pilotActivationPlanner !==
    "pilot-activation-planner-active-synthetic-no-customer-go-live-authority"
  ) {
    throw new Error("product console missing pilot activation planner proof-stack posture.");
  }

  if (
    body.proofStack?.pilotActivationPlannerBrief !==
    "pilot-activation-planner-brief-ready-no-production-activation-authority"
  ) {
    throw new Error("product console missing pilot activation planner brief proof-stack posture.");
  }

  if (!body.pilotActivationPlannerStepCount || body.pilotActivationPlannerStepCount < 9) {
    throw new Error("product console expected pilot activation step coverage.");
  }

  if (!body.pilotActivationPlannerPlanCount || body.pilotActivationPlannerPlanCount < 5) {
    throw new Error("product console expected pilot activation plan coverage.");
  }

  if (!body.pilotActivationPlannerBlockerCount || body.pilotActivationPlannerBlockerCount < 6) {
    throw new Error("product console expected pilot activation blocker coverage.");
  }

  if (!body.pilotActivationPlannerHandoffCount || body.pilotActivationPlannerHandoffCount < 4) {
    throw new Error("product console expected pilot activation handoff coverage.");
  }

  if (!body.pilotActivationPlannerExternalApprovalRequiredCount || body.pilotActivationPlannerExternalApprovalRequiredCount < 3) {
    throw new Error("product console expected pilot activation external-approval coverage.");
  }

  if (!body.pilotActivationPlannerBlockedBeforeLiveCount || body.pilotActivationPlannerBlockedBeforeLiveCount < 2) {
    throw new Error("product console expected pilot activation blocked-before-live coverage.");
  }

  if (!body.pilotActivationPlannerProofRouteCount || body.pilotActivationPlannerProofRouteCount < 12) {
    throw new Error("product console expected pilot activation proof-route coverage.");
  }

  if (!body.pilotActivationPlannerSummary?.blockedActions?.includes("binding commercial offer")) {
    throw new Error("product console expected pilot activation planner to keep binding commercial offers blocked.");
  }

  if (
    body.proofStack?.pilotHandoffCommand !==
    "pilot-handoff-command-active-synthetic-human-review-required"
  ) {
    throw new Error("product console missing pilot handoff command proof-stack posture.");
  }

  if (
    body.proofStack?.pilotHandoffCommandBrief !==
    "pilot-handoff-command-brief-ready-no-external-send-authority"
  ) {
    throw new Error("product console missing pilot handoff command brief proof-stack posture.");
  }

  if (!body.pilotHandoffCommandPacketCount || body.pilotHandoffCommandPacketCount < 6) {
    throw new Error("product console expected pilot handoff packet coverage.");
  }

  if (!body.pilotHandoffCommandChecklistCount || body.pilotHandoffCommandChecklistCount < 7) {
    throw new Error("product console expected pilot handoff checklist coverage.");
  }

  if (!body.pilotHandoffCommandRiskControlCount || body.pilotHandoffCommandRiskControlCount < 5) {
    throw new Error("product console expected pilot handoff risk-control coverage.");
  }

  if (!body.pilotHandoffCommandHardStopCount || body.pilotHandoffCommandHardStopCount < 10) {
    throw new Error("product console expected pilot handoff hard-stop coverage.");
  }

  if (!body.pilotHandoffCommandProofRouteCount || body.pilotHandoffCommandProofRouteCount < 12) {
    throw new Error("product console expected pilot handoff proof-route coverage.");
  }

  if (!body.pilotHandoffCommandSummary?.blockedActions?.includes("external send without human review")) {
    throw new Error("product console expected pilot handoff command to keep external send blocked without review.");
  }

  if (
    body.proofStack?.pilotSuccessReviewCommand !==
    "pilot-success-review-command-active-synthetic-no-roi-guarantee"
  ) {
    throw new Error("product console missing pilot success review command proof-stack posture.");
  }

  if (
    body.proofStack?.pilotSuccessReviewCommandBrief !==
    "pilot-success-review-command-brief-ready-human-review-required"
  ) {
    throw new Error("product console missing pilot success review command brief proof-stack posture.");
  }

  if (!body.pilotSuccessReviewCommandReviewPlanCount || body.pilotSuccessReviewCommandReviewPlanCount < 6) {
    throw new Error("product console expected pilot success review plan coverage.");
  }

  if (!body.pilotSuccessReviewCommandEvidenceGapCount || body.pilotSuccessReviewCommandEvidenceGapCount < 5) {
    throw new Error("product console expected pilot success review evidence-gap coverage.");
  }

  if (!body.pilotSuccessReviewCommandExpansionReadinessCount || body.pilotSuccessReviewCommandExpansionReadinessCount < 4) {
    throw new Error("product console expected pilot success review expansion-readiness coverage.");
  }

  if (!body.pilotSuccessReviewCommandBlockedClaimCount || body.pilotSuccessReviewCommandBlockedClaimCount < 12) {
    throw new Error("product console expected pilot success review blocked-claim coverage.");
  }

  if (!body.pilotSuccessReviewCommandBlockedBeforeClaimCount || body.pilotSuccessReviewCommandBlockedBeforeClaimCount < 3) {
    throw new Error("product console expected pilot success review blocked-before-claim coverage.");
  }

  if (!body.pilotSuccessReviewCommandExternalApprovalRequiredCount || body.pilotSuccessReviewCommandExternalApprovalRequiredCount < 3) {
    throw new Error("product console expected pilot success review external-approval coverage.");
  }

  if (!body.pilotSuccessReviewCommandProofRouteCount || body.pilotSuccessReviewCommandProofRouteCount < 12) {
    throw new Error("product console expected pilot success review proof-route coverage.");
  }

  if (!body.pilotSuccessReviewCommandSummary?.blockedClaims?.includes("ROI guarantee")) {
    throw new Error("product console expected pilot success review command to keep ROI guarantees blocked.");
  }

  if (!body.pilotSuccessReviewCommandSummary?.blockedClaims?.includes("binding commercial offer")) {
    throw new Error("product console expected pilot success review command to keep binding commercial offers blocked.");
  }

  if (
    body.proofStack?.operationalEfficiency !==
    "operational-efficiency-bottleneck-resolution-control-plane-active"
  ) {
    throw new Error("product console missing operational efficiency proof-stack posture.");
  }

  if (
    body.proofStack?.operationalEfficiencyBrief !==
    "operational-efficiency-brief-ready-no-autonomous-authority"
  ) {
    throw new Error("product console missing operational efficiency brief proof-stack posture.");
  }

  if (!body.operationalEfficiencyRecordCount || body.operationalEfficiencyRecordCount < 40) {
    throw new Error("product console expected operational efficiency record coverage.");
  }

  if (!body.operationalEfficiencyOpenBottleneckCount || body.operationalEfficiencyOpenBottleneckCount < 10) {
    throw new Error("product console expected operational efficiency open-bottleneck coverage.");
  }

  if (!body.operationalEfficiencySprintCount || body.operationalEfficiencySprintCount < 8) {
    throw new Error("product console expected operational efficiency sprint coverage.");
  }

  if (!body.operationalEfficiencyHardStopCount || body.operationalEfficiencyHardStopCount < 20) {
    throw new Error("product console expected operational efficiency hard-stop coverage.");
  }

  if (!body.operationalEfficiencyProofRouteCount || body.operationalEfficiencyProofRouteCount < 20) {
    throw new Error("product console expected operational efficiency proof-route coverage.");
  }

  if (
    !body.operationalEfficiencyDiscrepancyFaultTriageCount ||
    body.operationalEfficiencyDiscrepancyFaultTriageCount < 8
  ) {
    throw new Error("product console expected operational efficiency discrepancy and fault triage coverage.");
  }

  if (
    body.proofStack?.limitationsWorkarounds !==
    "limitations-workaround-control-plane-active"
  ) {
    throw new Error("product console missing limitations workaround proof-stack posture.");
  }

  if (
    body.proofStack?.limitationsWorkaroundsBrief !==
    "limitations-workaround-brief-ready-no-authority-claim"
  ) {
    throw new Error("product console missing limitations workaround brief proof-stack posture.");
  }

  if (!body.limitationsWorkaroundTrackCount || body.limitationsWorkaroundTrackCount < 10) {
    throw new Error("product console expected limitations workaround track coverage.");
  }

  if (!body.limitationsWorkaroundPacketCount || body.limitationsWorkaroundPacketCount < 8) {
    throw new Error("product console expected limitations workaround packet coverage.");
  }

  if (!body.limitationsWorkaroundBoundaryEscalationCount || body.limitationsWorkaroundBoundaryEscalationCount < 8) {
    throw new Error("product console expected limitations boundary escalation coverage.");
  }

  if (!body.limitationsResolutionWorkOrderCount || body.limitationsResolutionWorkOrderCount < 6) {
    throw new Error("product console expected known-limit resolution work-order coverage.");
  }

  if (!body.limitationsWorkaroundExecutionLedgerCount || body.limitationsWorkaroundExecutionLedgerCount < 5) {
    throw new Error("product console expected limitations workaround execution-ledger coverage.");
  }

  if (!body.limitationsWorkaroundResolvedExecutionLedgerCount || body.limitationsWorkaroundResolvedExecutionLedgerCount < 5) {
    throw new Error("product console expected limitations workaround resolved execution-ledger coverage.");
  }

  if (
    !body.limitationsUnresolvedResolutionWorkOrderCount ||
    body.limitationsUnresolvedResolutionWorkOrderCount < 4
  ) {
    throw new Error("product console expected unresolved known-limit blocker coverage.");
  }

  if (!body.limitationsWorkaroundOpenRiskCount || body.limitationsWorkaroundOpenRiskCount < 8) {
    throw new Error("product console expected limitations workaround open-risk coverage.");
  }

  if (
    body.proofStack?.enterpriseScalabilityOperations !==
    "enterprise-scalability-operations-control-plane-active"
  ) {
    throw new Error("product console missing enterprise scalability proof-stack posture.");
  }

  if (
    body.proofStack?.enterpriseScalabilityOperationsBrief !==
    "enterprise-scalability-operations-brief-ready-no-production-sla"
  ) {
    throw new Error("product console missing enterprise scalability brief proof-stack posture.");
  }

  if (!body.enterpriseScalabilityDomainCount || body.enterpriseScalabilityDomainCount < 8) {
    throw new Error("product console expected enterprise scalability domain coverage.");
  }

  if (!body.enterpriseScalabilityControlCount || body.enterpriseScalabilityControlCount < 10) {
    throw new Error("product console expected enterprise scalability control coverage.");
  }

  if (!body.enterpriseScalabilityWorkstreamCount || body.enterpriseScalabilityWorkstreamCount < 6) {
    throw new Error("product console expected enterprise scalability workstream coverage.");
  }

  if (!body.enterpriseScalabilityBottleneckCount || body.enterpriseScalabilityBottleneckCount < 6) {
    throw new Error("product console expected enterprise scalability bottleneck coverage.");
  }

  if (!body.enterpriseScalabilityBlockedClaimCount || body.enterpriseScalabilityBlockedClaimCount < 20) {
    throw new Error("product console expected enterprise scalability blocked claim coverage.");
  }

  if (body.proofStack?.platformPower !== "api-ui-ai-platform-power-control-plane-active") {
    throw new Error("product console missing platform power proof-stack posture.");
  }

  if (body.proofStack?.platformPowerBrief !== "api-ui-ai-platform-power-brief-ready-no-live-ai-authority") {
    throw new Error("product console missing platform power brief proof-stack posture.");
  }

  if (!body.platformPowerPillarCount || body.platformPowerPillarCount < 9) {
    throw new Error("product console expected platform power pillar coverage.");
  }

  if (!body.platformPowerControlCount || body.platformPowerControlCount < 12) {
    throw new Error("product console expected platform power control coverage.");
  }

  if (!body.platformPowerWorkstreamCount || body.platformPowerWorkstreamCount < 7) {
    throw new Error("product console expected platform power workstream coverage.");
  }

  if (!body.platformPowerBottleneckCount || body.platformPowerBottleneckCount < 7) {
    throw new Error("product console expected platform power bottleneck coverage.");
  }

  if (!body.platformPowerBlockedClaimCount || body.platformPowerBlockedClaimCount < 20) {
    throw new Error("product console expected platform power blocked claim coverage.");
  }

  if (body.proofStack?.productionArchitecture !== "production-architecture-contract-active") {
    throw new Error("product console missing production architecture proof-stack posture.");
  }

  if (body.proofStack?.productionArchitectureBrief !== "production-architecture-brief-ready-no-live-clinical-authority") {
    throw new Error("product console missing production architecture brief proof-stack posture.");
  }

  if (!body.productionArchitectureLayerCount || body.productionArchitectureLayerCount < 7) {
    throw new Error("product console expected production architecture layer coverage.");
  }

  if (!body.productionArchitectureModelProviderCount || body.productionArchitectureModelProviderCount < 9) {
    throw new Error("product console expected production architecture provider coverage.");
  }

  if (!body.productionArchitectureContextDomainCount || body.productionArchitectureContextDomainCount < 6) {
    throw new Error("product console expected production architecture context domain coverage.");
  }

  if (!body.productionArchitectureTrustControlCount || body.productionArchitectureTrustControlCount < 5) {
    throw new Error("product console expected production architecture trust control coverage.");
  }

  if (!body.productionArchitectureEvaluationScenarioCount || body.productionArchitectureEvaluationScenarioCount < 7) {
    throw new Error("product console expected production architecture evaluation scenario coverage.");
  }

  if (!body.productionArchitectureClinSecOpsControlCount || body.productionArchitectureClinSecOpsControlCount < 6) {
    throw new Error("product console expected production architecture ClinSecOps control coverage.");
  }

  if (!body.productionArchitectureWorkflowTrackCount || body.productionArchitectureWorkflowTrackCount < 5) {
    throw new Error("product console expected production architecture workflow track coverage.");
  }

  if (body.productionArchitectureValidationStatus !== "pass") {
    throw new Error("product console expected production architecture validation pass.");
  }

  if (!body.productionArchitectureSummary?.readinessAssessment?.includes("NO-GO for live clinical production")) {
    throw new Error("product console expected production architecture NO-GO assessment.");
  }

  if (!body.productionArchitectureSummary?.modelProviderMesh?.some((provider) => provider.name === "Future models")) {
    throw new Error("product console expected future-model slot in production architecture.");
  }

  if (body.proofStack?.executionAttemptEnvelope !== "execution-attempt-envelope-active-no-phi") {
    throw new Error("product console missing execution attempt envelope proof-stack posture.");
  }

  if (body.proofStack?.executionAttemptEnvelopeBrief !== "execution-attempt-envelope-brief-ready-no-phi") {
    throw new Error("product console missing execution attempt envelope brief proof-stack posture.");
  }

  if (!body.executionAttemptEnvelopeCount || body.executionAttemptEnvelopeCount < 4) {
    throw new Error("product console expected execution attempt envelope coverage.");
  }

  if (body.executionAttemptEnvelopeReplayReadyCount !== body.executionAttemptEnvelopeCount) {
    throw new Error("product console expected every execution attempt envelope to be replay-ready.");
  }

  if (body.executionAttemptEnvelopeModelRouteTelemetryCount !== body.executionAttemptEnvelopeCount) {
    throw new Error("product console expected route telemetry for every execution attempt envelope.");
  }

  if (!body.executionAttemptEnvelopeScorecardCount || body.executionAttemptEnvelopeScorecardCount < 8) {
    throw new Error("product console expected execution attempt scorecard coverage.");
  }

  if (body.executionAttemptEnvelopePassingScorecardCount !== body.executionAttemptEnvelopeScorecardCount) {
    throw new Error("product console expected every execution attempt scorecard to pass.");
  }

  if (body.executionAttemptEnvelopeReleaseDecision !== "pass-for-synthetic-contract") {
    throw new Error("product console expected execution attempt envelope synthetic release decision.");
  }

  if (!body.executionAttemptEnvelopeSummary?.boundary?.includes("does not persist live attempts")) {
    throw new Error("product console expected execution attempt envelope no-live-persistence boundary.");
  }

  if (body.proofStack?.healthcareIntelligenceOS !== "healthcare-intelligence-os-foundation") {
    throw new Error("product console missing healthcare intelligence OS proof-stack posture.");
  }

  if (
    body.proofStack?.healthcareClinicalWorkflowAutomation !==
    "clinical-workflow-automation-synthetic-and-review-gated"
  ) {
    throw new Error("product console missing clinical workflow automation proof-stack posture.");
  }

  if (!body.healthcareIntelligenceClinicalWorkflowTrackCount || body.healthcareIntelligenceClinicalWorkflowTrackCount < 8) {
    throw new Error("product console expected clinical workflow automation track coverage.");
  }

  if (!body.healthcareIntelligencePatientSafetyControlCount || body.healthcareIntelligencePatientSafetyControlCount < 30) {
    throw new Error("product console expected clinical workflow patient-safety control coverage.");
  }

  if (!body.healthcareIntelligencePatientEngagementSignalCount || body.healthcareIntelligencePatientEngagementSignalCount < 20) {
    throw new Error("product console expected patient-engagement analysis coverage.");
  }

  if (!body.healthcareIntelligenceInteroperabilityBindingCount || body.healthcareIntelligenceInteroperabilityBindingCount < 20) {
    throw new Error("product console expected clinical workflow interoperability binding coverage.");
  }

  if (!body.healthcareIntelligenceClinicianBurdenReductionCount || body.healthcareIntelligenceClinicianBurdenReductionCount < 20) {
    throw new Error("product console expected clinician burden-reduction coverage.");
  }

  if (!body.healthcareIntelligenceOperationsOptimizationLeverCount || body.healthcareIntelligenceOperationsOptimizationLeverCount < 20) {
    throw new Error("product console expected clinical operations optimization coverage.");
  }

  if (!body.healthcareIntelligenceOSSummary?.clinicalWorkflowAutomation?.blockedActions?.includes("patient outreach")) {
    throw new Error("product console expected patient outreach to remain blocked in healthcare intelligence OS.");
  }

  if (body.proofStack?.healthRecordsSafetyExchange !== "health-records-safety-exchange-control-plane-active") {
    throw new Error("product console missing health records safety exchange proof-stack posture.");
  }

  if (body.proofStack?.healthRecordsSafetyExchangeBrief !== "health-records-safety-exchange-brief-ready") {
    throw new Error("product console missing health records safety exchange brief proof-stack posture.");
  }

  if (body.proofStack?.healthRecordsSyntheticExtraction !== "synthetic-health-record-extraction-evaluator-active") {
    throw new Error("product console missing health records synthetic extraction proof-stack posture.");
  }

  if (!body.healthRecordsCapabilityCount || body.healthRecordsCapabilityCount < 5) {
    throw new Error("product console expected health records capability coverage.");
  }

  if (!body.healthRecordsSafetyCheckCount || body.healthRecordsSafetyCheckCount < 6) {
    throw new Error("product console expected health records patient-safety check coverage.");
  }

  if (!body.healthRecordsBoundaryResolutionCount || body.healthRecordsBoundaryResolutionCount < 5) {
    throw new Error("product console expected health records boundary resolution coverage.");
  }

  if (!body.healthRecordsWorkaroundCount || body.healthRecordsWorkaroundCount < 8) {
    throw new Error("product console expected health records workaround coverage.");
  }

  if (body.proofStack?.capitalVitality !== "capital-vitality-revenue-funding-readiness-active") {
    throw new Error("product console missing capital vitality proof-stack posture.");
  }

  if (body.proofStack?.capitalVitalityBrief !== "capital-vitality-brief-ready-no-securities-offer") {
    throw new Error("product console missing capital vitality brief proof-stack posture.");
  }

  if (!body.capitalVitalityRevenueCapabilityCount || body.capitalVitalityRevenueCapabilityCount < 8) {
    throw new Error("product console expected capital vitality revenue capability coverage.");
  }

  if (!body.capitalVitalityMoatSignalCount || body.capitalVitalityMoatSignalCount < 8) {
    throw new Error("product console expected capital vitality moat signal coverage.");
  }

  if (!body.capitalVitalityInvestorMilestoneCount || body.capitalVitalityInvestorMilestoneCount < 8) {
    throw new Error("product console expected capital vitality investor milestone coverage.");
  }

  if (!body.capitalVitalityFundingWorkstreamCount || body.capitalVitalityFundingWorkstreamCount < 8) {
    throw new Error("product console expected capital vitality funding workstream coverage.");
  }

  if (!body.capitalVitalityRetainedExternalReviewCount || body.capitalVitalityRetainedExternalReviewCount < 4) {
    throw new Error("product console expected capital vitality external review coverage.");
  }

  if (body.proofStack?.growthEngine !== "commercial-growth-engine-active") {
    throw new Error("product console missing growth engine proof-stack posture.");
  }

  if (body.proofStack?.growthEngineBrief !== "commercial-growth-engine-brief-ready-no-revenue-guarantee") {
    throw new Error("product console missing growth engine brief proof-stack posture.");
  }

  if (!body.growthEnginePlayCount || body.growthEnginePlayCount < 6) {
    throw new Error("product console expected growth engine play coverage.");
  }

  if (!body.growthEngineExecuteNowPlayCount || body.growthEngineExecuteNowPlayCount < 2) {
    throw new Error("product console expected execute-now growth play coverage.");
  }

  if (!body.growthEngineConversionLaneCount || body.growthEngineConversionLaneCount < 4) {
    throw new Error("product console expected growth conversion lane coverage.");
  }

  if (!body.growthEngineProofLadderStepCount || body.growthEngineProofLadderStepCount < 5) {
    throw new Error("product console expected growth proof ladder coverage.");
  }

  if (!body.growthEngineBottleneckCount || body.growthEngineBottleneckCount < 4) {
    throw new Error("product console expected growth bottleneck coverage.");
  }

  if (body.proofStack?.companyAssessment !== "company-operating-assessment-active") {
    throw new Error("product console missing company assessment proof-stack posture.");
  }

  if (body.proofStack?.companyAssessmentBrief !== "company-operating-assessment-brief-ready-no-advice") {
    throw new Error("product console missing company assessment brief proof-stack posture.");
  }

  if (!body.companyAssessmentOverallScore || body.companyAssessmentOverallScore < 80) {
    throw new Error("product console expected company assessment score coverage.");
  }

  if (!body.companyAssessmentDimensionCount || body.companyAssessmentDimensionCount < 10) {
    throw new Error("product console expected company assessment dimension coverage.");
  }

  if (!body.companyAssessmentWeaknessCount || body.companyAssessmentWeaknessCount < 8) {
    throw new Error("product console expected company assessment weakness relief coverage.");
  }

  if (!body.companyAssessmentUpgradeWorkstreamCount || body.companyAssessmentUpgradeWorkstreamCount < 8) {
    throw new Error("product console expected company assessment workstream coverage.");
  }

  if (!body.companyAssessmentAuditFindingCount || body.companyAssessmentAuditFindingCount < 8) {
    throw new Error("product console expected company assessment audit finding coverage.");
  }

  if (!body.companyAssessmentRevenueBuilderCount || body.companyAssessmentRevenueBuilderCount < 8) {
    throw new Error("product console expected company assessment revenue builder coverage.");
  }

  if (
    !body.companyAssessmentCompetitiveEdgeAmplifierCount ||
    body.companyAssessmentCompetitiveEdgeAmplifierCount < 8
  ) {
    throw new Error("product console expected company assessment competitive edge amplifier coverage.");
  }

  if (!body.companyAssessmentImprovementPriorityCount || body.companyAssessmentImprovementPriorityCount < 8) {
    throw new Error("product console expected company assessment improvement priority coverage.");
  }

  if (
    !body.companyAssessmentMissingCapabilityClosureCount ||
    body.companyAssessmentMissingCapabilityClosureCount < 10
  ) {
    throw new Error("product console expected company assessment missing capability closure coverage.");
  }

  if (
    !body.companyAssessmentCriticalMissingCapabilityClosureCount ||
    body.companyAssessmentCriticalMissingCapabilityClosureCount < 4
  ) {
    throw new Error("product console expected critical missing capability closure coverage.");
  }

  if (!body.companyAssessmentHardStopCount || body.companyAssessmentHardStopCount < 12) {
    throw new Error("product console expected company assessment hard-stop coverage.");
  }

  if (!body.companyAssessmentTeamLaneCount || body.companyAssessmentTeamLaneCount < 5) {
    throw new Error("product console expected company assessment team lane coverage.");
  }

  if (body.proofStack?.clinicalProductionReadiness !== "clinical-production-readiness-task-ledger-active") {
    throw new Error("product console missing clinical production readiness proof-stack posture.");
  }

  if (
    body.proofStack?.clinicalProductionReadinessBrief !==
    "clinical-production-readiness-brief-ready-no-clinical-authority"
  ) {
    throw new Error("product console missing clinical production readiness brief proof-stack posture.");
  }

  if (body.clinicalProductionReady !== false) {
    throw new Error("product console must not mark SCRIMED clinical-production-ready.");
  }

  if (!body.clinicalProductionTaskCount || body.clinicalProductionTaskCount < 20) {
    throw new Error("product console expected clinical production task coverage.");
  }

  if (!body.clinicalProductionIncompleteTaskCount || body.clinicalProductionIncompleteTaskCount < 20) {
    throw new Error("product console expected incomplete clinical production task coverage.");
  }

  if (!body.clinicalProductionCriticalOpenTaskCount || body.clinicalProductionCriticalOpenTaskCount < 10) {
    throw new Error("product console expected critical open clinical production task coverage.");
  }

  if (!body.clinicalProductionCurrentCapabilityMotionCount || body.clinicalProductionCurrentCapabilityMotionCount < 8) {
    throw new Error("product console expected current capability motion coverage.");
  }

  if (!body.clinicalProductionActivateNowMotionCount || body.clinicalProductionActivateNowMotionCount < 4) {
    throw new Error("product console expected activate-now current capability coverage.");
  }

  if (body.proofStack?.pilotDemoCommercialReadiness !== "pilot-demo-commercial-accelerator-active") {
    throw new Error("product console missing pilot demo commercial readiness proof-stack posture.");
  }

  if (
    body.proofStack?.pilotDemoCommercialReadinessBrief !==
    "pilot-demo-commercial-brief-ready-no-guarantee"
  ) {
    throw new Error("product console missing pilot demo commercial readiness brief proof-stack posture.");
  }

  if (!body.pilotDemoCommercialReadinessDemoPathCount || body.pilotDemoCommercialReadinessDemoPathCount < 5) {
    throw new Error("product console expected pilot demo commercial path coverage.");
  }

  if (!body.pilotDemoCommercialReadinessMarketBenchmarkCount || body.pilotDemoCommercialReadinessMarketBenchmarkCount < 6) {
    throw new Error("product console expected pilot demo market benchmark coverage.");
  }

  if (!body.pilotDemoCommercialReadinessPricingAlignmentCount || body.pilotDemoCommercialReadinessPricingAlignmentCount < 6) {
    throw new Error("product console expected pilot demo pricing alignment coverage.");
  }

  if (!body.pilotDemoCommercialReadinessStandardPathScore || body.pilotDemoCommercialReadinessStandardPathScore < 90) {
    throw new Error("product console expected pilot demo standard path score coverage.");
  }

  if (body.proofStack?.investorAudienceReadiness !== "investor-audience-readiness-control-plane-active") {
    throw new Error("product console missing investor audience readiness proof-stack posture.");
  }

  if (body.proofStack?.investorAudienceReadinessBrief !== "investor-audience-readiness-brief-ready-no-securities-offer") {
    throw new Error("product console missing investor audience readiness brief proof-stack posture.");
  }

  if (!body.investorAudienceWeaknessTrackCount || body.investorAudienceWeaknessTrackCount < 10) {
    throw new Error("product console expected investor audience weakness relief coverage.");
  }

  if (!body.investorAudienceCompetitiveEdgeSignalCount || body.investorAudienceCompetitiveEdgeSignalCount < 8) {
    throw new Error("product console expected investor audience competitive edge coverage.");
  }

  if (!body.investorAudiencePacketCount || body.investorAudiencePacketCount < 10) {
    throw new Error("product console expected investor audience packet coverage.");
  }

  if (!body.investorAudienceReadinessGateCount || body.investorAudienceReadinessGateCount < 8) {
    throw new Error("product console expected investor audience readiness gate coverage.");
  }

  if (!body.investorAudienceBlockedClaimCount || body.investorAudienceBlockedClaimCount < 20) {
    throw new Error("product console expected investor audience blocked-claim coverage.");
  }

  if (
    body.proofStack?.productServicePortfolio !==
    "product-service-portfolio-upgrade-active"
  ) {
    throw new Error("product console missing product/service portfolio proof-stack posture.");
  }

  if (
    body.proofStack?.productServicePortfolioBrief !==
    "product-service-portfolio-brief-ready-no-advice"
  ) {
    throw new Error("product console missing product/service portfolio brief proof-stack posture.");
  }

  if (!body.productServicePortfolioOfferCount || body.productServicePortfolioOfferCount < 10) {
    throw new Error("product console expected product/service portfolio offer coverage.");
  }

  if (!body.productServicePortfolioPackageCount || body.productServicePortfolioPackageCount < 5) {
    throw new Error("product console expected product/service portfolio package coverage.");
  }

  if (!body.productServicePortfolioMarginControlCount || body.productServicePortfolioMarginControlCount < 8) {
    throw new Error("product console expected product/service portfolio margin-control coverage.");
  }

  if (!body.productServicePortfolioBoundaryResolutionCount || body.productServicePortfolioBoundaryResolutionCount < 6) {
    throw new Error("product console expected product/service portfolio boundary-resolution coverage.");
  }

  if (!body.productServicePortfolioProofRouteCount || body.productServicePortfolioProofRouteCount < 20) {
    throw new Error("product console expected product/service portfolio proof-route coverage.");
  }

  if (!body.productServicePortfolioBlockedClaimCount || body.productServicePortfolioBlockedClaimCount < 20) {
    throw new Error("product console expected product/service portfolio blocked-claim coverage.");
  }

  if (!body.productServicePortfolioDeliveryPlaybookCount || body.productServicePortfolioDeliveryPlaybookCount < 5) {
    throw new Error("product console expected product/service portfolio delivery-playbook coverage.");
  }

  if (body.proofStack?.serviceDelivery !== "service-delivery-workbench-active") {
    throw new Error("product console missing service delivery proof-stack posture.");
  }

  if (body.proofStack?.serviceDeliveryBrief !== "service-delivery-brief-ready-no-sla-authority") {
    throw new Error("product console missing service delivery brief proof-stack posture.");
  }

  if (!body.serviceDeliveryOfferCount || body.serviceDeliveryOfferCount < 7) {
    throw new Error("product console expected service delivery offer coverage.");
  }

  if (!body.serviceDeliveryPhaseCount || body.serviceDeliveryPhaseCount < 7) {
    throw new Error("product console expected service delivery phase coverage.");
  }

  if (!body.serviceDeliveryWorkOrderTemplateCount || body.serviceDeliveryWorkOrderTemplateCount < 8) {
    throw new Error("product console expected service delivery work-order coverage.");
  }

  if (!body.serviceDeliveryArtifactCount || body.serviceDeliveryArtifactCount < 7) {
    throw new Error("product console expected service delivery artifact coverage.");
  }

  if (!body.serviceDeliveryActivationGateCount || body.serviceDeliveryActivationGateCount < 8) {
    throw new Error("product console expected service delivery activation-gate coverage.");
  }

  if (!body.serviceDeliveryHardStopCount || body.serviceDeliveryHardStopCount < 20) {
    throw new Error("product console expected service delivery hard-stop coverage.");
  }

  if (
    body.proofStack?.clientOnboardingCommunications !==
    "client-onboarding-communications-control-plane-active"
  ) {
    throw new Error("product console missing client onboarding communications proof-stack posture.");
  }

  if (
    body.proofStack?.clientOnboardingCommunicationsBrief !==
    "client-onboarding-communications-brief-ready-no-sent-communication"
  ) {
    throw new Error("product console missing client onboarding communications brief proof-stack posture.");
  }

  if (!body.clientOnboardingStageCount || body.clientOnboardingStageCount < 8) {
    throw new Error("product console expected client onboarding stage coverage.");
  }

  if (!body.clientOnboardingTemplateCount || body.clientOnboardingTemplateCount < 9) {
    throw new Error("product console expected client onboarding template coverage.");
  }

  if (!body.clientOnboardingCalendarPacketCount || body.clientOnboardingCalendarPacketCount < 6) {
    throw new Error("product console expected client onboarding calendar packet coverage.");
  }

  if (!body.clientOnboardingMeetingCadenceCount || body.clientOnboardingMeetingCadenceCount < 5) {
    throw new Error("product console expected client onboarding meeting cadence coverage.");
  }

  if (!body.clientOnboardingPresentationPacketCount || body.clientOnboardingPresentationPacketCount < 5) {
    throw new Error("product console expected client onboarding presentation packet coverage.");
  }

  if (!body.clientOnboardingControlCount || body.clientOnboardingControlCount < 8) {
    throw new Error("product console expected client onboarding control coverage.");
  }

  if (!body.clientOnboardingHandoffCount || body.clientOnboardingHandoffCount < 6) {
    throw new Error("product console expected client onboarding handoff coverage.");
  }

  if (
    body.proofStack?.enterpriseBusinessOps !==
    "enterprise-business-ops-revenue-margin-control-plane-active"
  ) {
    throw new Error("product console missing enterprise business operations proof-stack posture.");
  }

  if (
    body.proofStack?.enterpriseBusinessOpsBrief !==
    "enterprise-business-ops-brief-ready-no-legal-accounting-advice"
  ) {
    throw new Error("product console missing enterprise business operations brief proof-stack posture.");
  }

  if (!body.enterpriseBusinessOpsRevenueCapabilityCount || body.enterpriseBusinessOpsRevenueCapabilityCount < 8) {
    throw new Error("product console expected enterprise business revenue capability coverage.");
  }

  if (!body.enterpriseBusinessOpsMarginControlCount || body.enterpriseBusinessOpsMarginControlCount < 8) {
    throw new Error("product console expected enterprise business margin control coverage.");
  }

  if (!body.enterpriseBusinessOpsTeamRoleCount || body.enterpriseBusinessOpsTeamRoleCount < 8) {
    throw new Error("product console expected enterprise business team-role coverage.");
  }

  if (!body.enterpriseBusinessOpsEnterpriseControlCount || body.enterpriseBusinessOpsEnterpriseControlCount < 8) {
    throw new Error("product console expected enterprise business control coverage.");
  }

  if (!body.enterpriseBusinessOpsProfitLeverCount || body.enterpriseBusinessOpsProfitLeverCount < 8) {
    throw new Error("product console expected enterprise business profit-lever coverage.");
  }

  if (!body.enterpriseBusinessOpsSourceCount || body.enterpriseBusinessOpsSourceCount < 6) {
    throw new Error("product console expected enterprise business source coverage.");
  }

  if (
    body.proofStack?.approvalsReadiness !==
    "approvals-readiness-operating-ladder-active"
  ) {
    throw new Error("product console missing approvals readiness proof-stack posture.");
  }

  if (
    body.proofStack?.approvalsReadinessBrief !==
    "approvals-readiness-brief-no-approval-claim"
  ) {
    throw new Error("product console missing approvals readiness brief proof-stack posture.");
  }

  if (!body.approvalsReadinessTrackCount || body.approvalsReadinessTrackCount < 7) {
    throw new Error("product console expected approvals readiness track coverage.");
  }

  if (!body.approvalsReadinessAgentControlCount || body.approvalsReadinessAgentControlCount < 5) {
    throw new Error("product console expected approvals readiness agent-control coverage.");
  }

  if (
    body.proofStack?.globalCertificationReadiness !==
    "global-approval-certification-readiness-control-plane-active"
  ) {
    throw new Error("product console missing global certification readiness proof-stack posture.");
  }

  if (
    body.proofStack?.globalCertificationReadinessBrief !==
    "global-approval-certification-brief-ready-no-certification-claim"
  ) {
    throw new Error("product console missing global certification readiness brief proof-stack posture.");
  }

  if (!body.globalCertificationReadinessTrackCount || body.globalCertificationReadinessTrackCount < 6) {
    throw new Error("product console expected global certification track coverage.");
  }

  if (!body.globalCertificationReadinessSourceCount || body.globalCertificationReadinessSourceCount < 10) {
    throw new Error("product console expected global certification source coverage.");
  }

  if (!body.globalCertificationReadinessGateCount || body.globalCertificationReadinessGateCount < 5) {
    throw new Error("product console expected global certification gate coverage.");
  }

  if (!body.globalCertificationReadinessRegionalPackCount || body.globalCertificationReadinessRegionalPackCount < 5) {
    throw new Error("product console expected global certification regional pack coverage.");
  }

  if (
    body.proofStack?.globalEnterpriseCommand !==
    "global-enterprise-command-active-no-production-authority"
  ) {
    throw new Error("product console missing global enterprise command proof-stack posture.");
  }

  if (
    body.proofStack?.globalEnterpriseCommandBrief !==
    "global-enterprise-command-brief-ready-no-approval-claim"
  ) {
    throw new Error("product console missing global enterprise command brief proof-stack posture.");
  }

  if (!body.globalEnterpriseCommandRegionCount || body.globalEnterpriseCommandRegionCount < 8) {
    throw new Error("product console expected global enterprise command regional coverage.");
  }

  if (!body.globalEnterpriseCommandSalesPlaybookCount || body.globalEnterpriseCommandSalesPlaybookCount < 7) {
    throw new Error("product console expected global enterprise sales playbook coverage.");
  }

  if (!body.globalEnterpriseCommandInteroperabilityLaneCount || body.globalEnterpriseCommandInteroperabilityLaneCount < 8) {
    throw new Error("product console expected global enterprise interoperability lane coverage.");
  }

  if (!body.globalEnterpriseCommandCommunicationLaneCount || body.globalEnterpriseCommandCommunicationLaneCount < 4) {
    throw new Error("product console expected global enterprise communication lane coverage.");
  }

  if (!body.globalEnterpriseCommandAverageReadinessScore || body.globalEnterpriseCommandAverageReadinessScore < 60) {
    throw new Error("product console expected global enterprise readiness score coverage.");
  }

  if (
    body.proofStack?.continuousReviewAudit !==
    "continuous-review-audit-innovation-control-plane-active"
  ) {
    throw new Error("product console missing continuous review audit proof-stack posture.");
  }

  if (
    body.proofStack?.continuousReviewAuditBrief !==
    "continuous-review-audit-brief-ready-no-autonomous-claims"
  ) {
    throw new Error("product console missing continuous review audit brief proof-stack posture.");
  }

  if (!body.continuousReviewAuditAgentCount || body.continuousReviewAuditAgentCount < 7) {
    throw new Error("product console expected continuous review agent coverage.");
  }

  if (!body.continuousReviewAuditLoopCount || body.continuousReviewAuditLoopCount < 8) {
    throw new Error("product console expected continuous review loop coverage.");
  }

  if (!body.continuousReviewAuditControlCount || body.continuousReviewAuditControlCount < 6) {
    throw new Error("product console expected continuous audit control coverage.");
  }

  if (!body.continuousReviewAuditInnovationTrackCount || body.continuousReviewAuditInnovationTrackCount < 5) {
    throw new Error("product console expected continuous review innovation track coverage.");
  }

  if (!body.continuousReviewAuditInternalResearchAssignmentCount || body.continuousReviewAuditInternalResearchAssignmentCount < 4) {
    throw new Error("product console expected internal research assignment coverage.");
  }

  if (
    body.proofStack?.clinicalAuthorityReadiness !==
    "clinical-authority-readiness-hard-gates-contained"
  ) {
    throw new Error("product console missing clinical authority readiness proof-stack posture.");
  }

  if (
    body.proofStack?.clinicalAuthorityReadinessBrief !==
    "clinical-authority-readiness-brief-no-authority-claim"
  ) {
    throw new Error("product console missing clinical authority readiness brief proof-stack posture.");
  }

  if (
    body.proofStack?.boundaryResolutionRegister !==
    "cross-system-boundary-resolution-register-no-authority-claim"
  ) {
    throw new Error("product console missing boundary resolution register proof-stack posture.");
  }

  if (
    body.proofStack?.boundaryResolutionBrief !==
    "boundary-resolution-brief-no-approval-claim"
  ) {
    throw new Error("product console missing boundary resolution brief proof-stack posture.");
  }

  if (!body.boundaryResolutionRecordCount || body.boundaryResolutionRecordCount < 25) {
    throw new Error("product console expected boundary resolution record coverage.");
  }

  if (!body.boundaryResolutionExternalGateCount || body.boundaryResolutionExternalGateCount < 10) {
    throw new Error("product console expected external boundary gate coverage.");
  }

  if (body.proofStack?.clinicalCareActivation !== "clinical-care-activation-readiness-gated") {
    throw new Error("product console missing clinical care activation proof-stack posture.");
  }

  if (body.proofStack?.clinicalActivationDossier !== "aal2-clinical-activation-dossier-no-phi") {
    throw new Error("product console missing clinical activation dossier proof-stack posture.");
  }

  if (
    body.proofStack?.clinicalActivationApprovals !==
    "aal2-clinical-activation-approval-workflow-no-phi"
  ) {
    throw new Error("product console missing clinical activation approval workflow proof-stack posture.");
  }

  if (
    body.proofStack?.publicMarketReadiness !==
    "public-market-readiness-capital-efficiency-kpi-stack"
  ) {
    throw new Error("product console missing public market readiness proof-stack posture.");
  }

  if (
    body.proofStack?.publicMarketReadinessBrief !==
    "public-market-readiness-board-brief-no-financial-advice"
  ) {
    throw new Error("product console missing public market readiness brief proof-stack posture.");
  }

  if (
    body.proofStack?.protectedOperatorMetrics !==
    "aal2-protected-operator-metric-capture-no-phi"
  ) {
    throw new Error("product console missing protected operator metrics proof-stack posture.");
  }

  if (
    body.proofStack?.protectedMetricRollups !==
    "aal2-finance-reviewed-metric-rollups-no-phi"
  ) {
    throw new Error("product console missing protected metric rollups proof-stack posture.");
  }

  if (
    body.proofStack?.protectedMetricRollupPackets !==
    "aal2-audited-board-metric-packets-no-phi"
  ) {
    throw new Error("product console missing protected metric rollup packet proof-stack posture.");
  }

  if (
    body.proofStack?.protectedMetricTrends !==
    "aal2-board-trend-review-no-phi"
  ) {
    throw new Error("product console missing protected metric trends proof-stack posture.");
  }

  if (
    body.proofStack?.protectedMetricTrendPackets !==
    "aal2-audited-board-trend-packets-no-phi"
  ) {
    throw new Error("product console missing protected metric trend packet proof-stack posture.");
  }

  if (
    body.proofStack?.protectedBoardScorecards !==
    "aal2-rolling-quarter-board-scorecards-no-phi"
  ) {
    throw new Error("product console missing protected board scorecards proof-stack posture.");
  }

  if (
    body.proofStack?.protectedBoardScorecardPackets !==
    "aal2-audited-board-scorecard-packets-no-phi"
  ) {
    throw new Error("product console missing protected board scorecard packet proof-stack posture.");
  }

  if (
    body.proofStack?.protectedFinanceMethodologyGates !==
    "aal2-finance-methodology-gates-no-phi"
  ) {
    throw new Error("product console missing protected finance methodology gate proof-stack posture.");
  }

  if (
    body.proofStack?.protectedFinanceMethodologyPackets !==
    "aal2-audited-finance-methodology-gate-packets-no-phi"
  ) {
    throw new Error("product console missing protected finance methodology packet proof-stack posture.");
  }

  if (
    body.proofStack?.protectedExternalApprovalEvidence !==
    "aal2-qualified-external-approval-evidence-links-no-phi"
  ) {
    throw new Error("product console missing protected external approval evidence proof-stack posture.");
  }

  if (
    body.proofStack?.protectedExternalApprovalEvidencePackets !==
    "aal2-audited-external-approval-evidence-link-packets-no-phi"
  ) {
    throw new Error("product console missing protected external approval evidence packet proof-stack posture.");
  }

  if (
    body.proofStack?.protectedReleaseDecisions !==
    "aal2-qualified-release-decision-workflow-no-phi"
  ) {
    throw new Error("product console missing protected release decision workflow proof-stack posture.");
  }

  if (
    body.proofStack?.protectedReleaseDecisionPackets !==
    "aal2-audited-release-decision-claim-registry-packets-no-phi"
  ) {
    throw new Error("product console missing protected release decision packet proof-stack posture.");
  }

  if (
    body.proofStack?.protectedNamedReviewerSignoffs !==
    "aal2-named-reviewer-signoff-metadata-no-phi"
  ) {
    throw new Error("product console missing protected named reviewer sign-off proof-stack posture.");
  }

  if (
    body.proofStack?.protectedNamedReviewerSignoffPackets !==
    "aal2-audited-named-reviewer-signoff-packets-no-phi"
  ) {
    throw new Error("product console missing protected named reviewer sign-off packet proof-stack posture.");
  }

  if (
    body.proofStack?.protectedDistributionLockboxes !==
    "aal2-external-distribution-lockbox-disabled-no-phi"
  ) {
    throw new Error("product console missing protected distribution lockbox proof-stack posture.");
  }

  if (
    body.proofStack?.protectedDistributionLockboxPackets !==
    "aal2-audited-distribution-lockbox-packets-no-phi"
  ) {
    throw new Error("product console missing protected distribution lockbox packet proof-stack posture.");
  }

  if (
    body.proofStack?.protectedReleaseAuthorityAttestations !==
    "aal2-external-release-authority-attestations-disabled-no-phi"
  ) {
    throw new Error("product console missing protected release authority attestation proof-stack posture.");
  }

  if (
    body.proofStack?.protectedReleaseAuthorityAttestationPackets !==
    "aal2-audited-release-authority-attestation-packets-no-phi"
  ) {
    throw new Error(
      "product console missing protected release authority attestation packet proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedEvidenceRoomRecipientAttestations !==
    "aal2-evidence-room-recipient-attestations-disabled-no-phi"
  ) {
    throw new Error("product console missing protected evidence-room recipient attestation proof-stack posture.");
  }

  if (
    body.proofStack?.protectedEvidenceRoomRecipientAttestationPackets !==
    "aal2-audited-evidence-room-recipient-attestation-packets-no-phi"
  ) {
    throw new Error(
      "product console missing protected evidence-room recipient attestation packet proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedEvidenceRoomAccessLogReconciliations !==
    "aal2-evidence-room-access-log-reconciliation-disabled-no-phi"
  ) {
    throw new Error(
      "product console missing protected evidence-room access-log reconciliation proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedEvidenceRoomAccessLogReconciliationPackets !==
    "aal2-audited-evidence-room-access-log-reconciliation-packets-no-phi"
  ) {
    throw new Error(
      "product console missing protected evidence-room access-log reconciliation packet proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedEvidenceRoomProviderAdapters !==
    "aal2-evidence-room-provider-adapter-contracts-disabled-no-phi"
  ) {
    throw new Error("product console missing protected evidence-room provider adapter proof-stack posture.");
  }

  if (
    body.proofStack?.protectedEvidenceRoomProviderAdapterPackets !==
    "aal2-audited-evidence-room-provider-adapter-packets-no-phi"
  ) {
    throw new Error(
      "product console missing protected evidence-room provider adapter packet proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedProviderSecurityReviews !==
    "aal2-provider-security-review-workbench-no-phi"
  ) {
    throw new Error("product console missing protected provider security review proof-stack posture.");
  }

  if (
    body.proofStack?.protectedProviderSecurityReviewPackets !==
    "aal2-audited-provider-security-review-packets-no-phi"
  ) {
    throw new Error(
      "product console missing protected provider security review packet proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedProcurementEvidenceRegistry !==
    "aal2-procurement-evidence-registry-no-sensitive-artifacts"
  ) {
    throw new Error("product console missing protected procurement evidence registry proof-stack posture.");
  }

  if (
    body.proofStack?.protectedProcurementEvidenceRegistryPackets !==
    "aal2-audited-procurement-evidence-registry-packets-no-sensitive-artifacts"
  ) {
    throw new Error(
      "product console missing protected procurement evidence registry packet proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedClinicalAuthorityEvidenceRoom !==
    "aal2-clinical-authority-evidence-room-no-phi"
  ) {
    throw new Error("product console missing protected clinical authority evidence room proof-stack posture.");
  }

  if (
    body.proofStack?.protectedClinicalAuthorityEvidenceRoomPackets !==
    "aal2-audited-clinical-authority-evidence-room-packet-no-phi"
  ) {
    throw new Error(
      "product console missing protected clinical authority evidence room packet proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedClinicalAuthorityOwnerMatrix !==
    "aal2-clinical-authority-owner-matrix-no-phi"
  ) {
    throw new Error("product console missing protected clinical authority owner matrix proof-stack posture.");
  }

  if (
    body.proofStack?.protectedClinicalAuthorityOwnerMatrixPackets !==
    "aal2-audited-clinical-authority-owner-matrix-packet-no-phi"
  ) {
    throw new Error(
      "product console missing protected clinical authority owner matrix packet proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedClinicalAuthorityArtifactIntake !==
    "aal2-clinical-authority-artifact-intake-checklist-no-phi"
  ) {
    throw new Error(
      "product console missing protected clinical authority artifact intake proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedClinicalAuthorityArtifactIntakePackets !==
    "aal2-audited-clinical-authority-artifact-intake-checklist-packet-no-phi"
  ) {
    throw new Error(
      "product console missing protected clinical authority artifact intake packet proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedAuthorityArtifactReferences !==
    "aal2-authority-artifact-reference-status-capture-no-artifact-storage"
  ) {
    throw new Error(
      "product console missing protected authority artifact reference proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedAuthorityArtifactReferenceRenewalQueue !==
    "aal2-authority-renewal-queue-no-artifact-storage"
  ) {
    throw new Error(
      "product console missing protected authority artifact renewal queue proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedAuthorityArtifactReferencePackets !==
    "aal2-audited-authority-artifact-reference-status-packet-no-artifact-storage"
  ) {
    throw new Error(
      "product console missing protected authority artifact reference packet proof-stack posture."
    );
  }

  if (
    body.proofStack?.protectedAuthorityArtifactReferenceQaHarness !==
    "aal2-authority-reference-qa-harness-token-boundary"
  ) {
    throw new Error(
      "product console missing protected authority artifact reference QA harness proof-stack posture."
    );
  }

  if (
    body.proofStack?.globalPartnerLocalization !==
    "global-partner-localization-layer-ready"
  ) {
    throw new Error("product console missing global partner localization proof-stack posture.");
  }

  if (
    body.proofStack?.globalPartnerLocalizationBrief !==
    "global-partner-localization-brief-ready-no-legal-advice"
  ) {
    throw new Error("product console missing global partner localization brief proof-stack posture.");
  }

  if (body.proofStack?.passkeyManagement !== "self-service-list-rename-register-revoke") {
    throw new Error("product console missing passkey management proof-stack posture.");
  }

  if (body.proofStack?.enterpriseProofPackets !== "tenant-admin-aggregate-write-before-release") {
    throw new Error("product console missing enterprise proof packet proof-stack posture.");
  }

  if (body.proofStack?.tenantSessionVerification !== "browser-aal2-no-secret-protected-route-checks") {
    throw new Error("product console missing tenant-session verification proof-stack posture.");
  }

  if (body.proofStack?.pilotDemoReadinessCommandCenter !== "protected-workspace-demo-readiness-command-center") {
    throw new Error("product console missing pilot demo readiness command-center proof-stack posture.");
  }

  if (body.proofStack?.pilotDemoReadinessPackets !== "aal2-audited-demo-readiness-snapshot-packets") {
    throw new Error("product console missing pilot demo readiness packet proof-stack posture.");
  }

  if (body.proofStack?.buyerPilotRoom !== "aal2-buyer-room-evidence-bundle") {
    throw new Error("product console missing Buyer Pilot Room proof-stack posture.");
  }

  if (body.proofStack?.buyerPilotRoomPackets !== "aal2-audited-buyer-diligence-export") {
    throw new Error("product console missing audited Buyer Diligence Export proof-stack posture.");
  }

  if (body.proofStack?.commandIntelligenceHub !== "aal2-command-intelligence-hub") {
    throw new Error("product console missing Command Intelligence Hub proof-stack posture.");
  }

  if (
    body.proofStack?.commandIntelligenceSnapshots !==
    "aal2-audited-command-intelligence-snapshots"
  ) {
    throw new Error("product console missing Command Intelligence snapshot proof-stack posture.");
  }

  if (
    body.proofStack?.commandIntelligencePackets !==
    "aal2-audited-command-intelligence-packets"
  ) {
    throw new Error("product console missing Command Intelligence packet proof-stack posture.");
  }

  if (body.proofStack?.salesCommandCenter !== "aal2-sales-command-intelligence-timeline") {
    throw new Error("product console missing Sales Command Center proof-stack posture.");
  }

  if (body.proofStack?.salesDealRoom !== "sales-to-buyer-room-linkage-ready") {
    throw new Error("product console missing Pilot Deal Room proof-stack posture.");
  }

  if (body.proofStack?.salesDealRoomPackets !== "aal2-audited-sales-deal-room-packets") {
    throw new Error("product console missing audited Pilot Deal Room packet proof-stack posture.");
  }

  if (body.proofStack?.opportunityWorkspaceProvisioning !== "aal2-opportunity-workspace-provisioning") {
    throw new Error("product console missing opportunity workspace provisioning proof-stack posture.");
  }

  if (body.proofStack?.opportunityWorkspaceProvisioningPackets !== "aal2-audited-opportunity-workspace-packets") {
    throw new Error("product console missing opportunity workspace packet proof-stack posture.");
  }

  if (body.proofStack?.buyerTenantLifecycle !== "aal2-buyer-tenant-lifecycle-automation") {
    throw new Error("product console missing buyer tenant lifecycle proof-stack posture.");
  }

  if (body.proofStack?.buyerTenantLifecyclePackets !== "aal2-audited-buyer-tenant-lifecycle-packets") {
    throw new Error("product console missing buyer tenant lifecycle packet proof-stack posture.");
  }

  if (body.proofStack?.productionActivationReadiness !== "aal2-production-sso-invitation-readiness") {
    throw new Error("product console missing production activation readiness proof-stack posture.");
  }

  if (body.proofStack?.productionActivationReadinessPackets !== "aal2-audited-production-readiness-packets") {
    throw new Error("product console missing production readiness packet proof-stack posture.");
  }

  if (body.proofStack?.customerActivationApprovals !== "aal2-paid-pilot-activation-approvals") {
    throw new Error("product console missing customer activation approvals proof-stack posture.");
  }

  if (body.proofStack?.customerActivationApprovalPackets !== "aal2-audited-activation-approval-packets") {
    throw new Error("product console missing customer activation approval packet proof-stack posture.");
  }

  if (body.proofStack?.buyerDiligenceRoom !== "aal2-buyer-evidence-signed-controls-diligence-room") {
    throw new Error("product console missing buyer diligence room proof-stack posture.");
  }

  if (body.proofStack?.buyerDiligenceRoomPackets !== "aal2-audited-buyer-diligence-packets") {
    throw new Error("product console missing buyer diligence packet proof-stack posture.");
  }

  if (
    body.proofStack?.secureEvidenceVaultReadiness !==
    "aal2-secure-evidence-vault-readiness-disabled-by-default"
  ) {
    throw new Error("product console missing secure evidence vault readiness proof-stack posture.");
  }

  if (
    body.proofStack?.secureEvidenceVaultReadinessPackets !==
    "aal2-audited-secure-evidence-vault-readiness-packets"
  ) {
    throw new Error("product console missing secure evidence vault readiness packet proof-stack posture.");
  }

  if (body.proofStack?.buyerDemoExecutionPath !== "aal2-authenticated-buyer-demo-execution-path") {
    throw new Error("product console missing buyer demo execution path proof-stack posture.");
  }

  if (
    body.proofStack?.buyerDemoExecutionBrief !==
    "operator-brief-non-audited-existing-packets-remain-source-of-truth"
  ) {
    throw new Error("product console missing buyer demo execution brief proof-stack posture.");
  }

  if (body.proofStack?.buyerDemoSessions !== "aal2-persisted-buyer-demo-sessions") {
    throw new Error("product console missing persisted buyer demo session proof-stack posture.");
  }

  if (body.proofStack?.buyerDemoSessionPackets !== "aal2-audited-buyer-demo-session-packets") {
    throw new Error("product console missing audited buyer demo session packet proof-stack posture.");
  }

  if (
    body.proofStack?.buyerDemoSessionQa !==
    "aal2-operator-buyer-demo-session-qa-short-lived-token-compatible"
  ) {
    throw new Error("product console missing buyer demo session QA proof-stack posture.");
  }

  if (
    body.proofStack?.buyerDemoSessionQaTokenPolicy !==
    "short-lived-aal2-token-preflight-and-manual-ci-policy"
  ) {
    throw new Error("product console missing buyer demo session QA token-policy posture.");
  }

  if (
    body.proofStack?.qaEvidenceLedger !==
    "dated-qa-evidence-ledger-with-manual-aal2-gate"
  ) {
    throw new Error("product console missing QA evidence ledger proof-stack posture.");
  }

  if (body.proofStack?.qaManualRunEvidencePacket !== "manual-aal2-run-evidence-packet-ready") {
    throw new Error("product console missing manual QA run evidence packet posture.");
  }

  if (
    body.proofStack?.qaManualRunEvidencePersistence !==
    "tenant-scoped-aal2-manual-qa-evidence-ledger"
  ) {
    throw new Error("product console missing manual QA run evidence persistence posture.");
  }

  if (
    body.proofStack?.qaAuthorityReferenceEvidenceBridge !==
    "authority-reference-qa-evidence-bridge-ready"
  ) {
    throw new Error("product console missing authority-reference QA evidence bridge posture.");
  }

  if (
    body.proofStack?.qaEvidenceActivationPlan !==
    "manual-aal2-qa-evidence-activation-plan-ready"
  ) {
    throw new Error("product console missing QA evidence activation plan posture.");
  }

  if (
    body.proofStack?.qaExecutionReadiness !==
    "manual-aal2-qa-execution-go-no-go-no-secret"
  ) {
    throw new Error("product console missing QA execution readiness proof-stack posture.");
  }

  if (
    body.proofStack?.qaExecutionReadinessBrief !==
    "manual-aal2-qa-execution-brief-no-proof-claim"
  ) {
    throw new Error("product console missing QA execution readiness brief proof-stack posture.");
  }

  if (
    body.proofStack?.qaRunControl !==
    "manual-aal2-qa-run-control-no-secret-operator-brief"
  ) {
    throw new Error("product console missing QA run-control proof-stack posture.");
  }

  if (
    body.proofStack?.qaRunControlBrief !==
    "manual-aal2-qa-run-control-brief-no-auth-claim"
  ) {
    throw new Error("product console missing QA run-control brief proof-stack posture.");
  }

  if (
    body.proofStack?.qaLaunchKit !==
    "manual-aal2-qa-launch-kit-no-secret-human-handoff"
  ) {
    throw new Error("product console missing QA launch-kit proof-stack posture.");
  }

  if (
    body.proofStack?.qaLaunchKitBrief !==
    "manual-aal2-qa-launch-kit-brief-no-token-storage"
  ) {
    throw new Error("product console missing QA launch-kit brief proof-stack posture.");
  }

  if (
    body.proofStack?.qaHumanRunPacket !==
    "manual-aal2-qa-human-run-packet-dispatch-ready"
  ) {
    throw new Error("product console missing QA human run packet proof-stack posture.");
  }

  if (
    body.proofStack?.qaHumanRunPacketBrief !==
    "manual-aal2-qa-human-run-packet-brief-no-proof-claim"
  ) {
    throw new Error("product console missing QA human run packet brief proof-stack posture.");
  }

  if (
    body.proofStack?.qaCompletionBridge !==
    "manual-aal2-qa-completion-bridge-no-secret-pre-persistence"
  ) {
    throw new Error("product console missing QA completion bridge proof-stack posture.");
  }

  if (
    body.proofStack?.qaCompletionBridgeBrief !==
    "manual-aal2-qa-completion-bridge-brief-no-retained-proof-claim"
  ) {
    throw new Error("product console missing QA completion bridge brief proof-stack posture.");
  }

  if (
    body.proofStack?.qaClaimGuard !==
    "manual-aal2-qa-claim-guard-no-overclaim"
  ) {
    throw new Error("product console missing QA claim guard proof-stack posture.");
  }

  if (
    body.proofStack?.qaClaimGuardBrief !==
    "manual-aal2-qa-claim-guard-brief-current-state-language"
  ) {
    throw new Error("product console missing QA claim guard brief proof-stack posture.");
  }

  if (
    body.proofStack?.qaActivationSeal !==
    "manual-aal2-qa-activation-seal-no-secret-boundary-check"
  ) {
    throw new Error("product console missing QA activation seal proof-stack posture.");
  }

  if (
    body.proofStack?.qaActivationSealBrief !==
    "manual-aal2-qa-activation-seal-brief-retained-packet-required"
  ) {
    throw new Error("product console missing QA activation seal brief proof-stack posture.");
  }

  if (
    body.proofStack?.qaProofPromotion !==
    "retained-manual-qa-proof-promotion-gate-no-secret"
  ) {
    throw new Error("product console missing QA proof-promotion proof-stack posture.");
  }

  if (
    body.proofStack?.qaProofPromotionBrief !==
    "manual-qa-proof-promotion-brief-retained-packet-required"
  ) {
    throw new Error("product console missing QA proof-promotion brief proof-stack posture.");
  }

  if (
    body.proofStack?.qaBuyerProofRelease !==
    "manual-aal2-qa-buyer-proof-release-retained-packet-gate"
  ) {
    throw new Error("product console missing QA buyer proof release proof-stack posture.");
  }

  if (
    body.proofStack?.qaBuyerProofReleaseBrief !==
    "manual-aal2-qa-buyer-proof-release-brief-no-public-release"
  ) {
    throw new Error("product console missing QA buyer proof release brief proof-stack posture.");
  }

  if (
    body.proofStack?.buyerReleaseControlRun !==
    "metadata-only-buyer-release-control-runbook-no-release-approval"
  ) {
    throw new Error("product console missing buyer release-control runbook proof-stack posture.");
  }

  if (
    body.proofStack?.buyerReleaseControlRunBrief !==
    "buyer-release-control-runbook-brief-no-secret-no-approval"
  ) {
    throw new Error("product console missing buyer release-control brief proof-stack posture.");
  }

  if (
    body.proofStack?.protectedBuyerReleaseControlRun !==
    "aal2-protected-buyer-release-control-chain-verifier-no-release-approval"
  ) {
    throw new Error("product console missing protected buyer release-control verifier proof-stack posture.");
  }

  if (
    body.proofStack?.protectedBuyerReleaseControlRunPackets !==
    "aal2-audited-buyer-release-control-chain-packet-no-release-approval"
  ) {
    throw new Error("product console missing protected buyer release-control packet proof-stack posture.");
  }

  if (
    body.proofStack?.protectedBuyerReleaseReadinessTimeline !==
    "aal2-protected-buyer-release-readiness-timeline-no-release-approval"
  ) {
    throw new Error("product console missing protected buyer release-readiness timeline proof-stack posture.");
  }

  if (
    body.proofStack?.qaManualExecutionConsole !==
    "manual-aal2-qa-execution-console-protected-operator-control"
  ) {
    throw new Error("product console missing QA manual execution console proof-stack posture.");
  }

  if (
    body.proofStack?.qaManualExecutionConsoleBrief !==
    "manual-aal2-qa-execution-console-brief-no-auth-claim"
  ) {
    throw new Error("product console missing QA manual execution console brief proof-stack posture.");
  }

  if (!body.qaExecutionReadinessWorkflowCount || body.qaExecutionReadinessWorkflowCount < 2) {
    throw new Error("product console expected QA execution readiness workflow coverage.");
  }

  if (!body.qaExecutionReadinessHumanRequiredStageCount || body.qaExecutionReadinessHumanRequiredStageCount < 2) {
    throw new Error("product console expected human-required QA execution stages.");
  }

  if (!body.qaRunControlWorkflowCount || body.qaRunControlWorkflowCount < 2) {
    throw new Error("product console expected QA run-control workflow coverage.");
  }

  if (!body.qaRunControlGateCount || body.qaRunControlGateCount < 7) {
    throw new Error("product console expected QA run-control gate coverage.");
  }

  if (!body.qaRunControlCommandTemplateCount || body.qaRunControlCommandTemplateCount < 4) {
    throw new Error("product console expected QA run-control command template coverage.");
  }

  if (!body.qaLaunchKitPhaseCount || body.qaLaunchKitPhaseCount < 9) {
    throw new Error("product console expected QA launch-kit phase coverage.");
  }

  if (!body.qaLaunchKitWorkflowCount || body.qaLaunchKitWorkflowCount < 2) {
    throw new Error("product console expected QA launch-kit workflow coverage.");
  }

  if (!body.qaLaunchKitSafeCopyFieldCount || body.qaLaunchKitSafeCopyFieldCount < 10) {
    throw new Error("product console expected QA launch-kit safe-copy field coverage.");
  }

  if (!body.qaLaunchKitBlockedClaimCount || body.qaLaunchKitBlockedClaimCount < 9) {
    throw new Error("product console expected QA launch-kit blocked-claim coverage.");
  }

  if (!body.qaHumanRunPacketWorkflowCount || body.qaHumanRunPacketWorkflowCount < 2) {
    throw new Error("product console expected QA human run packet workflow coverage.");
  }

  if (!body.qaHumanRunPacketControlCount || body.qaHumanRunPacketControlCount < 7) {
    throw new Error("product console expected QA human run packet control coverage.");
  }

  if (!body.qaHumanRunPacketHardStopControlCount || body.qaHumanRunPacketHardStopControlCount < 3) {
    throw new Error("product console expected QA human run packet hard-stop coverage.");
  }

  if (!body.qaHumanRunPacketPostRunRouteCount || body.qaHumanRunPacketPostRunRouteCount < 7) {
    throw new Error("product console expected QA human run packet post-run route coverage.");
  }

  if (!body.qaHumanRunPacketBlockedClaimCount || body.qaHumanRunPacketBlockedClaimCount < 12) {
    throw new Error("product console expected QA human run packet blocked claim coverage.");
  }

  if (!body.qaCompletionBridgeCheckpointCount || body.qaCompletionBridgeCheckpointCount < 5) {
    throw new Error("product console expected QA completion bridge checkpoint coverage.");
  }

  if (!body.qaCompletionBridgeHardStopCount || body.qaCompletionBridgeHardStopCount < 2) {
    throw new Error("product console expected QA completion bridge hard-stop coverage.");
  }

  if (!body.qaCompletionBridgeSafeFieldCount || body.qaCompletionBridgeSafeFieldCount < 10) {
    throw new Error("product console expected QA completion bridge safe-field coverage.");
  }

  if (!body.qaCompletionBridgeBlockedClaimCount || body.qaCompletionBridgeBlockedClaimCount < 9) {
    throw new Error("product console expected QA completion bridge blocked-claim coverage.");
  }

  if (!body.qaClaimGuardRuleCount || body.qaClaimGuardRuleCount < 4) {
    throw new Error("product console expected QA claim guard rule coverage.");
  }

  if (!body.qaClaimGuardSafeCurrentClaimCount || body.qaClaimGuardSafeCurrentClaimCount < 5) {
    throw new Error("product console expected QA claim guard safe-current claim coverage.");
  }

  if (!body.qaClaimGuardRetainedPacketClaimCount || body.qaClaimGuardRetainedPacketClaimCount < 5) {
    throw new Error("product console expected QA claim guard retained-packet claim coverage.");
  }

  if (!body.qaClaimGuardBlockedAuthorityClaimCount || body.qaClaimGuardBlockedAuthorityClaimCount < 10) {
    throw new Error("product console expected QA claim guard blocked-authority claim coverage.");
  }

  if (!body.qaClaimGuardReviewTriggerCount || body.qaClaimGuardReviewTriggerCount < 8) {
    throw new Error("product console expected QA claim guard review-trigger coverage.");
  }

  if (!body.qaActivationSealRuleCount || body.qaActivationSealRuleCount < 7) {
    throw new Error("product console expected QA activation seal rule coverage.");
  }

  if (!body.qaActivationSealHardStopRuleCount || body.qaActivationSealHardStopRuleCount < 4) {
    throw new Error("product console expected QA activation seal hard-stop coverage.");
  }

  if (!body.qaActivationSealRequiredEvidenceCount || body.qaActivationSealRequiredEvidenceCount < 10) {
    throw new Error("product console expected QA activation seal evidence coverage.");
  }

  if (!body.qaActivationSealHardStopClaimCount || body.qaActivationSealHardStopClaimCount < 10) {
    throw new Error("product console expected QA activation seal blocked-claim coverage.");
  }

  if (!body.qaProofPromotionRuleCount || body.qaProofPromotionRuleCount < 5) {
    throw new Error("product console expected QA proof-promotion rule coverage.");
  }

  if (!body.qaProofPromotionHardStopRuleCount || body.qaProofPromotionHardStopRuleCount < 3) {
    throw new Error("product console expected QA proof-promotion hard-stop coverage.");
  }

  if (!body.qaProofPromotionBlockedClaimCount || body.qaProofPromotionBlockedClaimCount < 8) {
    throw new Error("product console expected QA proof-promotion blocked-claim coverage.");
  }

  if (!body.qaBuyerProofReleaseRuleCount || body.qaBuyerProofReleaseRuleCount < 5) {
    throw new Error("product console expected QA buyer proof release rule coverage.");
  }

  if (!body.qaBuyerProofReleaseHardStopCount || body.qaBuyerProofReleaseHardStopCount < 8) {
    throw new Error("product console expected QA buyer proof release hard-stop coverage.");
  }

  if (!body.qaBuyerProofReleaseRequiredEvidenceCount || body.qaBuyerProofReleaseRequiredEvidenceCount < 10) {
    throw new Error("product console expected QA buyer proof release evidence coverage.");
  }

  if (!body.qaBuyerProofReleaseBlockedClaimCount || body.qaBuyerProofReleaseBlockedClaimCount < 8) {
    throw new Error("product console expected QA buyer proof release blocked-claim coverage.");
  }

  if (!body.buyerReleaseControlRunStepCount || body.buyerReleaseControlRunStepCount < 8) {
    throw new Error("product console expected buyer release-control step coverage.");
  }

  if (!body.buyerReleaseControlRunProtectedRouteCount || body.buyerReleaseControlRunProtectedRouteCount < 8) {
    throw new Error("product console expected buyer release-control protected route coverage.");
  }

  if (!body.buyerReleaseControlRunPacketRouteCount || body.buyerReleaseControlRunPacketRouteCount < 8) {
    throw new Error("product console expected buyer release-control packet route coverage.");
  }

  if (!body.buyerReleaseControlRunHardStopCount || body.buyerReleaseControlRunHardStopCount < 35) {
    throw new Error("product console expected buyer release-control hard-stop coverage.");
  }

  if (!body.qaManualExecutionConsoleStageCount || body.qaManualExecutionConsoleStageCount < 6) {
    throw new Error("product console expected QA manual execution console stage coverage.");
  }

  if (!body.qaManualExecutionConsoleHardStopCount || body.qaManualExecutionConsoleHardStopCount < 8) {
    throw new Error("product console expected QA manual execution console hard-stop coverage.");
  }

  if (!body.qaManualExecutionConsoleWorkflowCount || body.qaManualExecutionConsoleWorkflowCount < 2) {
    throw new Error("product console expected QA manual execution console workflow coverage.");
  }

  if (!body.qaManualExecutionConsoleBlockedClaimCount || body.qaManualExecutionConsoleBlockedClaimCount < 6) {
    throw new Error("product console expected QA manual execution console blocked-claim coverage.");
  }

  if (body.proofStack?.publicProductionSmoke !== "no-secret-route-readiness-and-fail-closed-checks") {
    throw new Error("product console missing public production smoke proof-stack posture.");
  }

  if (!body.strategicExecutionBetCount || body.strategicExecutionBetCount < 8) {
    throw new Error("product console expected strategic execution bet coverage.");
  }

  if (!body.strategicDecisionGateCount || body.strategicDecisionGateCount < 6) {
    throw new Error("product console expected strategic decision gate coverage.");
  }

  if (!body.strategicExecutionCommandCount || body.strategicExecutionCommandCount < 8) {
    throw new Error("product console expected strategic execution command coverage.");
  }

  if (!body.strategicCriticalExecutionCommandCount || body.strategicCriticalExecutionCommandCount < 3) {
    throw new Error("product console expected critical strategic execution command coverage.");
  }

  if (!body.strategicThisWeekExecutionCommandCount || body.strategicThisWeekExecutionCommandCount < 2) {
    throw new Error("product console expected this-week strategic execution command coverage.");
  }

  if (!body.strategicExecutionCommandProofRouteCount || body.strategicExecutionCommandProofRouteCount < 25) {
    throw new Error("product console expected strategic execution command proof-route coverage.");
  }

  if (!body.strategicExecutionScorecardCount || body.strategicExecutionScorecardCount < 8) {
    throw new Error("product console expected strategic execution scorecard coverage.");
  }

  if (!body.strategicActiveExecutionScorecardCount || body.strategicActiveExecutionScorecardCount < 3) {
    throw new Error("product console expected active strategic execution scorecard coverage.");
  }

  if (!body.strategicProofReadyExecutionScorecardCount || body.strategicProofReadyExecutionScorecardCount < 3) {
    throw new Error("product console expected proof-ready strategic execution scorecard coverage.");
  }

  if (
    !body.strategicExecutionScorecardMissingProofCount ||
    body.strategicExecutionScorecardMissingProofCount < 20
  ) {
    throw new Error("product console expected strategic execution missing-proof coverage.");
  }

  if (
    !body.strategicPlatformIntelligenceSummary?.executionScorecards?.some(
      (scorecard) => scorecard.commandSlug === "deal-desk-margin-command" && scorecard.scoreState === "watch"
    )
  ) {
    throw new Error("product console expected deal desk scorecard watch state.");
  }

  if (
    !body.strategicPlatformIntelligenceSummary?.executionScorecards?.some(
      (scorecard) =>
        scorecard.commandSlug === "clinical-global-approval-command" &&
        scorecard.evidenceState === "external-review-required"
    )
  ) {
    throw new Error("product console expected clinical/global scorecard external-review state.");
  }

  if (
    !body.strategicPlatformIntelligenceSummary?.recommendedStrategicSequence?.includes(
      "customer-facing conversion command"
    )
  ) {
    throw new Error("product console expected recommended strategic sequence.");
  }

  if (
    !body.strategicPlatformIntelligenceSummary?.executionCommands?.some(
      (command) => command.slug === "deal-desk-margin-command"
    )
  ) {
    throw new Error("product console expected deal desk margin command.");
  }

  if (
    !body.strategicPlatformIntelligenceSummary?.executionCommands?.some(
      (command) => command.slug === "clinical-global-approval-command"
    )
  ) {
    throw new Error("product console expected clinical global approval command.");
  }

  if (
    !body.strategicPlatformIntelligenceSummary?.executionBets?.some(
      (bet) => bet.slug === "proof-before-production-risk"
    )
  ) {
    throw new Error("product console expected proof-before-production-risk strategic bet.");
  }

  if (
    !body.strategicPlatformIntelligenceSummary?.decisionGates?.some(
      (gate) => gate.slug === "clinical-production-gate"
    )
  ) {
    throw new Error("product console expected clinical production strategic gate.");
  }

  if (body.salesOperationsSummary?.authentication !== "passkey-or-magic-link-plus-totp") {
    throw new Error("product console missing passkey-aware Sales Operations authentication posture.");
  }

  console.log("pass product console passkey posture");
}

async function checkReadiness() {
  const result = await request("/api/pilot-workspaces/readiness");
  requireStatus("protected pilot readiness", result.response.status, 200);
  requireContentType("protected pilot readiness", result.response, "application/json");
  const body = requireJson("protected pilot readiness", result.body);

  if (body.service !== "scrimed-protected-pilot-workspaces") {
    throw new Error(`protected pilot readiness expected service scrimed-protected-pilot-workspaces but received ${body.service}.`);
  }

  console.log("pass protected pilot readiness");
}

async function checkCommercialPricing() {
  const result = await request("/api/commercial/pricing");
  requireStatus("commercial pricing", result.response.status, 200);
  requireContentType("commercial pricing", result.response, "application/json");
  requirePilotValueEvidenceBoundary("commercial pricing", result.response);
  if (result.response.headers.get("x-scrimed-market-evidence") !== "current") {
    throw new Error("commercial pricing market evidence header is not current.");
  }
  if (result.response.headers.get("x-scrimed-competitive-comparison") !== "current-first-party-evidence-only") {
    throw new Error("commercial pricing competitive comparison header lost its freshness boundary.");
  }
  const body = requireJson("commercial pricing", result.body);

  if (body.service !== "scrimed-commercial-strategy") {
    throw new Error(`commercial pricing expected scrimed-commercial-strategy but received ${body.service}.`);
  }

  if (body.status !== "commercial-planning-model-active-pre-commercial") {
    throw new Error(`commercial pricing expected pre-commercial planning status but received ${body.status}.`);
  }

  if (
    body.authority?.pricingAuthority !== "non-binding-planning-ranges" ||
    body.authority?.contractAuthority !== "not-granted" ||
    body.authority?.productionAuthority !== "not-production-authorized" ||
    body.authority?.customerActivationAuthority !== "not-customer-go-live-approval"
  ) {
    throw new Error("commercial pricing lost a quote, contract, production, or customer-activation boundary.");
  }

  if (!Array.isArray(body.pricingTiers) || body.pricingTiers.length < 6) {
    throw new Error("commercial pricing expected a complete pricing ladder.");
  }

  if (
    !body.pricingTiers.every(
      (tier) =>
        tier.priceRange?.minimumUsd >= 0 &&
        tier.priceRange?.maximumUsd >= tier.priceRange?.minimumUsd &&
        tier.proposalGate &&
        tier.pricingAuthority
    )
  ) {
    throw new Error("commercial pricing expected machine-readable ranges and proposal gates.");
  }

  if (
    body.valuePlanner?.status !== "browser-only-no-data-persistence" ||
    body.valuePlanner?.pricingAuthority !== "non-binding-planning-model" ||
    body.valuePlanner?.humanReviewRequired !== true
  ) {
    throw new Error("commercial pricing value planner lost its no-storage or human-review boundary.");
  }

  if (!Array.isArray(body.marketPricingBenchmarks) || body.marketPricingBenchmarks.length < 4) {
    throw new Error("commercial pricing expected dated market evidence.");
  }

  if (
    !body.marketPricingBenchmarks.every(
      (benchmark) =>
        benchmark.evidenceStatus === "first-party-public" &&
        benchmark.sourceUrl?.startsWith("https://") &&
        benchmark.lastVerified === "2026-08-01" &&
        benchmark.reviewDue === "2026-10-30" &&
        ["current", "review-due"].includes(benchmark.freshness) &&
        benchmark.comparisonBoundary
    )
  ) {
    throw new Error("commercial pricing expected first-party market evidence with comparison boundaries.");
  }

  if (
    body.marketEvidenceReview?.status !== "current" ||
    body.marketEvidenceReview?.competitiveComparisonAllowed !== true ||
    body.marketEvidenceReview?.staleCount !== 0 ||
    body.marketEvidenceReview?.humanReviewRequired !== true ||
    body.sourceCounts?.currentMarketBenchmarkCount !== body.marketPricingBenchmarks.length
  ) {
    throw new Error("commercial pricing market evidence is stale, incomplete, or missing its human review gate.");
  }

  if (!Array.isArray(body.competitivePositioningPillars) || body.competitivePositioningPillars.length < 6) {
    throw new Error("commercial pricing expected competitive positioning pillars.");
  }

  if (!Array.isArray(body.globalCommercialProfiles) || body.globalCommercialProfiles.length < 4) {
    throw new Error("commercial pricing expected global commercial profiles.");
  }

  if (
    !Array.isArray(body.commercialReadinessControls) ||
    !body.commercialReadinessControls.some(
      (control) => control.dimension === "safety" && control.status === "enforced-in-code"
    ) ||
    !body.commercialReadinessControls.some(
      (control) => control.dimension === "privacy" && control.status === "enforced-in-code"
    )
  ) {
    throw new Error("commercial pricing expected enforced safety and privacy controls.");
  }

  console.log("pass commercial pricing");
}

async function checkCompetitiveEdgeApi() {
  const result = await request("/api/competitive-edge");
  requireStatus("competitive edge", result.response.status, 200);
  requireContentType("competitive edge", result.response, "application/json");
  const body = requireJson("competitive edge", result.body);

  if (body.service !== "scrimed-competitive-edge") {
    throw new Error(`competitive edge expected service scrimed-competitive-edge but received ${body.service}.`);
  }

  if (body.status !== "public-positioning-ready") {
    throw new Error(`competitive edge expected public-positioning-ready but received ${body.status}.`);
  }

  if (!Array.isArray(body.edges) || body.edges.length < 5) {
    throw new Error("competitive edge expected at least five public proof pillars.");
  }

  if (body.marketIntelligenceStatus !== "competitor-informed-build-map-active") {
    throw new Error("competitive edge expected active market intelligence status.");
  }

  if (body.marketIntelligenceRoute !== "/competitive-intelligence") {
    throw new Error("competitive edge expected competitive intelligence route.");
  }

  if (!body.competitorSourceCount || body.competitorSourceCount < 8) {
    throw new Error("competitive edge expected competitor source coverage.");
  }

  if (!body.competitorBuildPatternCount || body.competitorBuildPatternCount < 5) {
    throw new Error("competitive edge expected competitor build pattern coverage.");
  }

  if (!body.competitorTargetAudienceStrategyCount || body.competitorTargetAudienceStrategyCount < 10) {
    throw new Error("competitive edge expected target audience strategy coverage.");
  }

  console.log("pass competitive edge API");
}

async function checkCompetitiveIntelligenceApi() {
  const result = await request("/api/competitive-intelligence");
  requireStatus("competitive market intelligence", result.response.status, 200);
  requireContentType("competitive market intelligence", result.response, "application/json");
  const body = requireJson("competitive market intelligence", result.body);

  if (body.service !== "scrimed-competitive-market-intelligence") {
    throw new Error(`competitive market intelligence expected service scrimed-competitive-market-intelligence but received ${body.service}.`);
  }

  if (body.status !== "competitor-informed-build-map-active") {
    throw new Error(`competitive market intelligence expected active status but received ${body.status}.`);
  }

  if (body.route !== "/competitive-intelligence") {
    throw new Error("competitive market intelligence expected page route.");
  }

  if (!Array.isArray(body.sources) || body.sources.length < 8) {
    throw new Error("competitive market intelligence expected public competitor source coverage.");
  }

  if (!body.researchSignalCount || body.researchSignalCount < 8) {
    throw new Error("competitive market intelligence expected fresh public research signal coverage.");
  }

  if (!body.cleanRoomPlayCount || body.cleanRoomPlayCount < 6) {
    throw new Error("competitive market intelligence expected clean-room market response play coverage.");
  }

  if (!Array.isArray(body.patterns) || body.patterns.length < 5) {
    throw new Error("competitive market intelligence expected build pattern coverage.");
  }

  if (!Array.isArray(body.targetAudienceStrategies) || body.targetAudienceStrategies.length < 10) {
    throw new Error("competitive market intelligence expected target audience strategy coverage.");
  }

  if (!body.targetAudienceStrategies.some((strategy) => strategy.slug === "health-system-executive-transformation-sponsors")) {
    throw new Error("competitive market intelligence expected health-system executive strategy.");
  }

  if (!body.targetAudienceStrategies.some((strategy) => strategy.slug === "community-independent-faith-clinics")) {
    throw new Error("competitive market intelligence expected community and faith-based clinic strategy.");
  }

  if (!body.targetAudienceStrategies.some((strategy) => strategy.slug === "investors-corporate-strategics")) {
    throw new Error("competitive market intelligence expected investor and strategic audience strategy.");
  }

  if (!body.targetAudienceProofRouteCount || body.targetAudienceProofRouteCount < 20) {
    throw new Error("competitive market intelligence expected target audience proof-route coverage.");
  }

  if (
    !Array.isArray(body.targetAudienceBlockedClaims) ||
    !body.targetAudienceBlockedClaims.includes("public quantum capability")
  ) {
    throw new Error("competitive market intelligence expected future-innovation blocked claim coverage.");
  }

  if (!Array.isArray(body.blockedClaims) || !body.blockedClaims.includes("production EHR integration")) {
    throw new Error("competitive market intelligence expected production EHR integration to remain blocked.");
  }

  if (!Array.isArray(body.cleanRoomPlays) || !body.cleanRoomPlays.some((play) => play.slug === "trust-center-as-sales-asset")) {
    throw new Error("competitive market intelligence expected trust center clean-room sales asset play.");
  }

  if (
    !Array.isArray(body.cleanRoomPlays) ||
    !body.cleanRoomPlays.some((play) => play.slug === "imaging-to-action-without-interpretation")
  ) {
    throw new Error("competitive market intelligence expected imaging-to-action without interpretation play.");
  }

  if (!Array.isArray(body.researchSignals) || !body.researchSignals.some((signal) => signal.sourceName === "Redox")) {
    throw new Error("competitive market intelligence expected Redox interoperability research signal.");
  }

  if (!Array.isArray(body.researchSignals) || !body.researchSignals.some((signal) => signal.sourceName === "Aidoc")) {
    throw new Error("competitive market intelligence expected Aidoc imaging research signal.");
  }

  if (!body.boundary?.includes("does not copy third-party code")) {
    throw new Error("competitive market intelligence expected no-copy boundary.");
  }

  console.log("pass competitive market intelligence API");
}

async function checkScrimedMarketExecutionApi() {
  const result = await request("/api/scrimed-market-execution");
  requireStatus("SCRIMED Market Execution", result.response.status, 200);
  requireContentType("SCRIMED Market Execution", result.response, "application/json");
  const body = requireJson("SCRIMED Market Execution", result.body);

  if (result.response.headers.get("x-scrimed-market-execution") !== "scrimed-market-execution-active-clean-room-no-phi") {
    throw new Error("SCRIMED Market Execution expected active clean-room no-PHI header.");
  }

  if (result.response.headers.get("x-scrimed-data-boundary") !== "synthetic-business-and-market-metadata-only") {
    throw new Error("SCRIMED Market Execution expected synthetic business and market metadata boundary.");
  }

  if (result.response.headers.get("x-scrimed-clean-room") !== "public-sources-only-no-proprietary-copying") {
    throw new Error("SCRIMED Market Execution expected public-sources-only clean-room header.");
  }

  if (body.service !== "scrimed-market-execution") {
    throw new Error(`SCRIMED Market Execution expected service scrimed-market-execution but received ${body.service}.`);
  }

  if (body.status !== "scrimed-market-execution-active-clean-room-no-phi") {
    throw new Error(`SCRIMED Market Execution expected active status but received ${body.status}.`);
  }

  if (body.pageRoute !== "/scrimed-market-execution") {
    throw new Error("SCRIMED Market Execution expected page route.");
  }

  if (!Array.isArray(body.lanes) || body.lanes.length < 6) {
    throw new Error("SCRIMED Market Execution expected at least six execution lanes.");
  }

  if (!body.lanes.some((lane) => lane.slug === "trust-center-as-sales-asset")) {
    throw new Error("SCRIMED Market Execution expected trust-center-as-sales-asset lane.");
  }

  if (!body.lanes.some((lane) => lane.slug === "payer-policy-evidence-loop")) {
    throw new Error("SCRIMED Market Execution expected payer-policy-evidence-loop lane.");
  }

  if (!Array.isArray(body.riskControls) || body.riskControls.length < 4) {
    throw new Error("SCRIMED Market Execution expected clean-room risk controls.");
  }

  if (!Array.isArray(body.blockedActions) || !body.blockedActions.some((action) => action.includes("No PHI"))) {
    throw new Error("SCRIMED Market Execution expected no-PHI blocked action.");
  }

  if (body.productionReadiness !== false) {
    throw new Error("SCRIMED Market Execution expected production readiness to remain false.");
  }

  if (body.humanReviewRequired !== true) {
    throw new Error("SCRIMED Market Execution expected human review requirement.");
  }

  console.log("pass SCRIMED Market Execution API");
}

async function checkEnterpriseHealthcareInfrastructureApi() {
  const result = await request("/api/enterprise-healthcare-infrastructure");
  requireStatus("Enterprise Healthcare Infrastructure", result.response.status, 200);
  requireContentType("Enterprise Healthcare Infrastructure", result.response, "application/json");
  const body = requireJson("Enterprise Healthcare Infrastructure", result.body);

  if (
    result.response.headers.get("x-scrimed-enterprise-infrastructure") !==
    "enterprise-healthcare-infrastructure-readiness-active-no-phi"
  ) {
    throw new Error("Enterprise Healthcare Infrastructure expected active no-PHI readiness header.");
  }

  if (result.response.headers.get("x-scrimed-data-boundary") !== "synthetic-infrastructure-metadata-only") {
    throw new Error("Enterprise Healthcare Infrastructure expected synthetic infrastructure metadata boundary.");
  }

  if (result.response.headers.get("x-scrimed-connector-authority") !== "not-production-connector-approved") {
    throw new Error("Enterprise Healthcare Infrastructure expected no production connector authority.");
  }

  if (result.response.headers.get("x-scrimed-imaging-authority") !== "not-final-imaging-interpretation") {
    throw new Error("Enterprise Healthcare Infrastructure expected no final imaging interpretation authority.");
  }

  if (result.response.headers.get("x-scrimed-payer-authority") !== "not-payer-submission-authorized") {
    throw new Error("Enterprise Healthcare Infrastructure expected no payer submission authority.");
  }

  if (result.response.headers.get("x-scrimed-conformance") !== "synthetic-evidence-live-blocked") {
    throw new Error("Enterprise Healthcare Infrastructure expected synthetic conformance evidence with live exchange blocked.");
  }

  if (body.service !== "enterprise-healthcare-infrastructure") {
    throw new Error(
      `Enterprise Healthcare Infrastructure expected service enterprise-healthcare-infrastructure but received ${body.service}.`
    );
  }

  if (body.status !== "enterprise-healthcare-infrastructure-readiness-active-no-phi") {
    throw new Error(`Enterprise Healthcare Infrastructure expected active status but received ${body.status}.`);
  }

  if (body.pageRoute !== "/enterprise-healthcare-infrastructure") {
    throw new Error("Enterprise Healthcare Infrastructure expected page route.");
  }

  if (!Array.isArray(body.standardsCovered) || !body.standardsCovered.includes("DICOM")) {
    throw new Error("Enterprise Healthcare Infrastructure expected DICOM standards coverage.");
  }

  if (!body.standardsCovered.includes("HL7 v2 ADT") || !body.standardsCovered.includes("FHIR")) {
    throw new Error("Enterprise Healthcare Infrastructure expected HL7 ADT and FHIR standards coverage.");
  }

  if (!body.standardsCovered.includes("PACS") || !body.standardsCovered.includes("RIS") || !body.standardsCovered.includes("HIS")) {
    throw new Error("Enterprise Healthcare Infrastructure expected PACS/RIS/HIS systems coverage.");
  }

  if (!body.standardsCovered.includes("VPN") || !body.standardsCovered.includes("Firewalls")) {
    throw new Error("Enterprise Healthcare Infrastructure expected VPN and firewall coverage.");
  }

  if (!Array.isArray(body.capabilities) || body.capabilities.length < 10) {
    throw new Error("Enterprise Healthcare Infrastructure expected at least ten capabilities.");
  }

  if (!body.capabilities.some((capability) => capability.id === "dicom-pacs-ris-workflow")) {
    throw new Error("Enterprise Healthcare Infrastructure expected DICOM/PACS/RIS workflow capability.");
  }

  if (!body.capabilities.some((capability) => capability.id === "x12-payer-rcm-rail")) {
    throw new Error("Enterprise Healthcare Infrastructure expected X12 payer/RCM rail capability.");
  }

  if (!Array.isArray(body.integrationPaths) || body.integrationPaths.length < 4) {
    throw new Error("Enterprise Healthcare Infrastructure expected integration paths.");
  }

  if (
    !body.conformanceControlPack ||
    body.conformanceControlPack.id !== "hospital-integration-conformance-control-pack" ||
    body.conformanceControlPack.evaluationCount < 5 ||
    body.conformanceControlPack.syntheticPassed !== body.conformanceControlPack.evaluationCount ||
    body.conformanceControlPack.liveBlocked !== body.conformanceControlPack.evaluationCount
  ) {
    throw new Error("Enterprise Healthcare Infrastructure expected five passing synthetic conformance kits with every live lane blocked.");
  }

  if (
    !body.conformanceControlPack.supportedLanes.includes("hl7-v2-adt-event-feed") ||
    !body.conformanceControlPack.supportedLanes.includes("x12-payer-rcm-evidence") ||
    body.conformanceControlPack.humanReviewRequired !== true ||
    body.conformanceControlPack.productionAuthority !== false
  ) {
    throw new Error("Enterprise Healthcare Infrastructure expected governed HL7/X12 lanes with no production authority.");
  }

  if (
    !Array.isArray(body.competitiveDesignPatterns) ||
    body.competitiveDesignPatterns.length < 4 ||
    !body.competitiveDesignPatterns.every(
      (pattern) =>
        typeof pattern.publicSourceUrl === "string" &&
        pattern.publicSourceUrl.startsWith("https://") &&
        typeof pattern.safetyBoundary === "string"
    )
  ) {
    throw new Error("Enterprise Healthcare Infrastructure expected sourced, independently applied competitive design patterns.");
  }

  if (!Array.isArray(body.salesMotions) || body.salesMotions.length < 4) {
    throw new Error("Enterprise Healthcare Infrastructure expected buyer sales motions.");
  }

  if (!Array.isArray(body.discoveryQuestions) || body.discoveryQuestions.length < 8) {
    throw new Error("Enterprise Healthcare Infrastructure expected no-PHI discovery questions.");
  }

  if (!body.discoveryQuestions.some((question) => question.id === "network-security-discovery")) {
    throw new Error("Enterprise Healthcare Infrastructure expected network security discovery question.");
  }

  if (!body.discoveryQuestions.every((question) => question.humanReviewRequired === true)) {
    throw new Error("Enterprise Healthcare Infrastructure expected human review on every discovery question.");
  }

  if (!Array.isArray(body.pilotScopes) || body.pilotScopes.length < 5) {
    throw new Error("Enterprise Healthcare Infrastructure expected scoped no-PHI pilot packages.");
  }

  if (!body.pilotScopes.some((scope) => scope.id === "dicom-pacs-ris-ops-sprint")) {
    throw new Error("Enterprise Healthcare Infrastructure expected DICOM/PACS/RIS operations sprint.");
  }

  if (!body.pilotScopes.every((scope) => scope.noGoBoundary && scope.priceBandSignal)) {
    throw new Error("Enterprise Healthcare Infrastructure expected pilot no-go boundaries and price signals.");
  }

  if (!Array.isArray(body.proofPacketChecklist) || body.proofPacketChecklist.length < 5) {
    throw new Error("Enterprise Healthcare Infrastructure expected proof packet checklist.");
  }

  if (!Array.isArray(body.pilotRecommendationInputs) || body.pilotRecommendationInputs.length < 5) {
    throw new Error("Enterprise Healthcare Infrastructure expected pilot recommendation inputs.");
  }

  if (!Array.isArray(body.pilotRecommendations) || body.pilotRecommendations.length < 5) {
    throw new Error("Enterprise Healthcare Infrastructure expected pilot recommendations.");
  }

  if (!body.pilotRecommendations.some((recommendation) => recommendation.inputId === "radiology-ops-buyer" && recommendation.recommendedPilotScopeId === "dicom-pacs-ris-ops-sprint")) {
    throw new Error("Enterprise Healthcare Infrastructure expected radiology buyer to map to DICOM/PACS/RIS operations sprint.");
  }

  if (!body.pilotRecommendations.some((recommendation) => recommendation.inputId === "rcm-cfo-buyer" && recommendation.recommendedPilotScopeId === "x12-rcm-evidence-sprint")) {
    throw new Error("Enterprise Healthcare Infrastructure expected RCM buyer to map to X12/RCM evidence sprint.");
  }

  if (!body.pilotRecommendations.every((recommendation) => recommendation.humanReviewRequired === true)) {
    throw new Error("Enterprise Healthcare Infrastructure expected human review on every pilot recommendation.");
  }

  if (!Array.isArray(body.buyerPackets) || body.buyerPackets.length < 5) {
    throw new Error("Enterprise Healthcare Infrastructure expected buyer packets.");
  }

  if (!body.buyerPackets.some((packet) => packet.recommendationInputId === "radiology-ops-buyer" && packet.recommendedPilotScopeId === "dicom-pacs-ris-ops-sprint")) {
    throw new Error("Enterprise Healthcare Infrastructure expected radiology buyer packet for DICOM/PACS/RIS sprint.");
  }

  if (!body.buyerPackets.some((packet) => packet.recommendationInputId === "security-private-ai-buyer" && packet.recommendedPilotScopeId === "private-runtime-readiness-sprint")) {
    throw new Error("Enterprise Healthcare Infrastructure expected security buyer packet for private runtime sprint.");
  }

  if (!body.buyerPackets.every((packet) => packet.humanReviewRequired === true && packet.blockedClaims?.length >= 5)) {
    throw new Error("Enterprise Healthcare Infrastructure expected human-reviewed buyer packets with blocked claims.");
  }

  if (!body.buyerPackets.every((packet) => Array.isArray(packet.meetingAgenda) && Array.isArray(packet.followUpOutline))) {
    throw new Error("Enterprise Healthcare Infrastructure expected buyer packet agenda and follow-up outline.");
  }

  if (!Array.isArray(body.decisionReadinessScorecards) || body.decisionReadinessScorecards.length < 5) {
    throw new Error("Enterprise Healthcare Infrastructure expected decision readiness scorecards.");
  }

  if (
    !body.decisionReadinessScorecards.some(
      (scorecard) =>
        scorecard.buyerPacketId === "radiology-ops-buyer-buyer-packet" &&
        scorecard.recommendedPilotScopeId === "dicom-pacs-ris-ops-sprint"
    )
  ) {
    throw new Error("Enterprise Healthcare Infrastructure expected radiology decision scorecard for DICOM/PACS/RIS sprint.");
  }

  if (
    !body.decisionReadinessScorecards.every(
      (scorecard) =>
        scorecard.humanReviewRequired === true &&
        scorecard.productionAuthority === false &&
        scorecard.procurementReadinessScore >= 70 &&
        Array.isArray(scorecard.blockedDecisionReasons) &&
        scorecard.blockedDecisionReasons.length >= 5
    )
  ) {
    throw new Error("Enterprise Healthcare Infrastructure expected human-reviewed decision scorecards with blocked production authority.");
  }

  if (!body.decisionReadinessScorecards.every((scorecard) => Array.isArray(scorecard.requiredNextEvidence) && Array.isArray(scorecard.safeClosePlan))) {
    throw new Error("Enterprise Healthcare Infrastructure expected decision scorecards with next evidence and safe close plan.");
  }

  if (!Array.isArray(body.procurementActionPlans) || body.procurementActionPlans.length < 5) {
    throw new Error("Enterprise Healthcare Infrastructure expected procurement action plans.");
  }

  if (
    !body.procurementActionPlans.some(
      (plan) =>
        plan.buyerPacketId === "radiology-ops-buyer-buyer-packet" &&
        plan.recommendedPilotScopeId === "dicom-pacs-ris-ops-sprint"
    )
  ) {
    throw new Error("Enterprise Healthcare Infrastructure expected radiology procurement action plan for DICOM/PACS/RIS sprint.");
  }

  if (
    !body.procurementActionPlans.every(
      (plan) =>
        plan.humanReviewRequired === true &&
        plan.productionAuthority === false &&
        Array.isArray(plan.ownerRoles) &&
        plan.ownerRoles.length >= 4 &&
        Array.isArray(plan.gateSequence) &&
        plan.gateSequence.length >= 5
    )
  ) {
    throw new Error("Enterprise Healthcare Infrastructure expected human-reviewed procurement action plans with owners and gates.");
  }

  if (
    !body.procurementActionPlans.every(
      (plan) =>
        Array.isArray(plan.safeOperatorScript) &&
        plan.safeOperatorScript.some((line) => line.includes("no-PHI readiness")) &&
        typeof plan.escalationTrigger === "string" &&
        plan.escalationTrigger.includes("PHI")
    )
  ) {
    throw new Error("Enterprise Healthcare Infrastructure expected procurement action plans with safe operator scripts and PHI escalation triggers.");
  }

  if (body.productionAuthority !== false) {
    throw new Error("Enterprise Healthcare Infrastructure expected production authority to remain false.");
  }

  if (body.humanReviewRequired !== true) {
    throw new Error("Enterprise Healthcare Infrastructure expected human review requirement.");
  }

  console.log("pass Enterprise Healthcare Infrastructure API");
}

async function checkDeploymentDriftGuard() {
  const result = await request("/api/deployment-drift-guard");
  requireStatus("Deployment Drift Guard", result.response.status, 200);
  requireContentType("Deployment Drift Guard", result.response, "application/json");
  const body = requireJson("Deployment Drift Guard", result.body);

  if (
    result.response.headers.get("x-scrimed-deployment-drift-guard") !==
    "deployment-drift-guard-active-no-secret-route-alignment"
  ) {
    throw new Error("Deployment Drift Guard expected active no-secret route-alignment header.");
  }

  if (result.response.headers.get("x-scrimed-data-boundary") !== "synthetic-and-metadata-only") {
    throw new Error("Deployment Drift Guard expected synthetic-and-metadata-only boundary.");
  }

  if (result.response.headers.get("x-scrimed-deployment-authority") !== "not-deployed-by-this-route") {
    throw new Error("Deployment Drift Guard expected not-deployed-by-this-route authority.");
  }

  if (body.service !== "scrimed-deployment-drift-guard") {
    throw new Error(`Deployment Drift Guard expected service scrimed-deployment-drift-guard but received ${body.service}.`);
  }

  if (body.status !== "deployment-drift-guard-active-no-secret-route-alignment") {
    throw new Error(`Deployment Drift Guard expected active status but received ${body.status}.`);
  }

  if (body.pageRoute !== "/deployment-drift-guard") {
    throw new Error("Deployment Drift Guard expected page route.");
  }

  if (body.deploymentAuthority !== "not-deployed-by-this-route") {
    throw new Error("Deployment Drift Guard expected no deployment authority.");
  }

  if (!Array.isArray(body.guardRoutes) || !body.guardRoutes.some((route) => route.path === "/scrimed-market-execution")) {
    throw new Error("Deployment Drift Guard expected /scrimed-market-execution guard route.");
  }

  if (!body.guardRoutes.some((route) => route.path === "/enterprise-healthcare-infrastructure")) {
    throw new Error("Deployment Drift Guard expected /enterprise-healthcare-infrastructure guard route.");
  }

  if (!Array.isArray(body.noGoBoundaries) || !body.noGoBoundaries.some((boundary) => boundary.includes("no live PHI"))) {
    throw new Error("Deployment Drift Guard expected no live PHI boundary.");
  }

  console.log("pass Deployment Drift Guard");
}

async function checkScrimedExecutionFocusApi() {
  const result = await request("/api/scrimed-execution-focus");
  requireStatus("SCRIMED Execution Focus", result.response.status, 200);
  requireContentType("SCRIMED Execution Focus", result.response, "application/json");
  const body = requireJson("SCRIMED Execution Focus", result.body);

  if (result.response.headers.get("x-scrimed-execution-focus") !== "scrimed-execution-focus-active-synthetic-no-phi") {
    throw new Error("SCRIMED Execution Focus expected active synthetic no-PHI header.");
  }

  if (result.response.headers.get("x-scrimed-data-boundary") !== "synthetic-prioritization-metadata-only") {
    throw new Error("SCRIMED Execution Focus expected synthetic prioritization metadata boundary.");
  }

  if (result.response.headers.get("x-scrimed-execution-authority") !== "recommendation-only-human-reviewed") {
    throw new Error("SCRIMED Execution Focus expected recommendation-only execution authority.");
  }

  if (body.service !== "scrimed-execution-focus") {
    throw new Error(`SCRIMED Execution Focus expected service scrimed-execution-focus but received ${body.service}.`);
  }

  if (body.status !== "scrimed-execution-focus-active-synthetic-no-phi") {
    throw new Error(`SCRIMED Execution Focus expected active status but received ${body.status}.`);
  }

  if (body.pageRoute !== "/scrimed-execution-focus") {
    throw new Error("SCRIMED Execution Focus expected page route.");
  }

  if (!Array.isArray(body.focusItems) || body.focusItems.length < 8) {
    throw new Error("SCRIMED Execution Focus expected at least eight focus items.");
  }

  if (!Array.isArray(body.nowItems) || !body.nowItems.some((item) => item.id === "buyer-proof-to-pilot")) {
    throw new Error("SCRIMED Execution Focus expected buyer-proof-to-pilot now item.");
  }

  if (!Array.isArray(body.blockedItems) || !body.blockedItems.some((item) => item.id === "aal2-protected-smoke-operator")) {
    throw new Error("SCRIMED Execution Focus expected AAL2 protected smoke blocked item.");
  }

  if (!Array.isArray(body.blockedItems) || !body.blockedItems.some((item) => item.id === "live-phi-and-clinical-authority")) {
    throw new Error("SCRIMED Execution Focus expected live data and clinical authority blocked item.");
  }

  if (body.productionReadiness !== false) {
    throw new Error("SCRIMED Execution Focus expected production readiness to remain false.");
  }

  if (body.humanReviewRequired !== true) {
    throw new Error("SCRIMED Execution Focus expected human review requirement.");
  }

  console.log("pass SCRIMED Execution Focus API");
}

async function checkStrategicPlatformIntelligence() {
  const result = await request("/api/strategic-intelligence");
  requireStatus("strategic platform intelligence", result.response.status, 200);
  requireContentType("strategic platform intelligence", result.response, "application/json");
  const body = requireJson("strategic platform intelligence", result.body);

  if (body.service !== "scrimed-strategic-platform-intelligence") {
    throw new Error(
      `strategic platform intelligence expected service scrimed-strategic-platform-intelligence but received ${body.service}.`
    );
  }

  if (body.status !== "source-informed-strategy-coded") {
    throw new Error(`strategic platform intelligence expected coded status but received ${body.status}.`);
  }

  if (!body.patternCount || body.patternCount < 5) {
    throw new Error("strategic platform intelligence expected source-informed pattern coverage.");
  }

  if (!Array.isArray(body.executionBets) || body.executionBets.length < 8) {
    throw new Error("strategic platform intelligence expected strategic execution bets.");
  }

  if (!Array.isArray(body.decisionGates) || body.decisionGates.length < 6) {
    throw new Error("strategic platform intelligence expected strategic decision gates.");
  }

  if (!Array.isArray(body.executionCommands) || body.executionCommands.length < 8) {
    throw new Error("strategic platform intelligence expected strategic execution commands.");
  }

  if (!body.executionCommands.some((command) => command.slug === "customer-facing-conversion-command")) {
    throw new Error("strategic platform intelligence missing customer-facing conversion command.");
  }

  if (!body.executionCommands.some((command) => command.slug === "no-phi-proof-engine-command")) {
    throw new Error("strategic platform intelligence missing no-PHI proof engine command.");
  }

  if (!body.executionCommands.some((command) => command.slug === "enterprise-operating-layer-command")) {
    throw new Error("strategic platform intelligence missing enterprise operating layer command.");
  }

  if (!body.executionCommands.some((command) => command.slug === "clinical-global-approval-command")) {
    throw new Error("strategic platform intelligence missing clinical global approval command.");
  }

  if (!body.executionCommands.every((command) => command.successMetric && command.retainedBoundary)) {
    throw new Error("strategic platform intelligence expected every command to retain metric and boundary.");
  }

  if (!body.executionCommands.every((command) => Array.isArray(command.blockedExpansion) && command.blockedExpansion.length >= 4)) {
    throw new Error("strategic platform intelligence expected every command to retain blocked expansion controls.");
  }

  if (!body.executionCommandProofRouteCount || body.executionCommandProofRouteCount < 25) {
    throw new Error("strategic platform intelligence expected command proof-route coverage.");
  }

  if (!body.executionCommandBlockedExpansions?.includes("PHI upload")) {
    throw new Error("strategic platform intelligence expected PHI upload to remain blocked by commands.");
  }

  if (!Array.isArray(body.executionScorecards) || body.executionScorecards.length < 8) {
    throw new Error("strategic platform intelligence expected strategic execution scorecards.");
  }

  if (
    !body.executionScorecards.some(
      (scorecard) => scorecard.commandSlug === "no-phi-proof-engine-command" && scorecard.scoreState === "active"
    )
  ) {
    throw new Error("strategic platform intelligence missing active no-PHI proof engine scorecard.");
  }

  if (
    !body.executionScorecards.some(
      (scorecard) =>
        scorecard.commandSlug === "clinical-global-approval-command" &&
        scorecard.evidenceState === "external-review-required"
    )
  ) {
    throw new Error("strategic platform intelligence missing external-review clinical/global scorecard.");
  }

  if (
    !body.executionScorecards.every(
      (scorecard) =>
        scorecard.leadingIndicator &&
        scorecard.laggingIndicator &&
        scorecard.nextCheckpoint &&
        scorecard.escalationPath
    )
  ) {
    throw new Error("strategic platform intelligence expected every scorecard to retain indicators and escalation.");
  }

  if (
    !body.executionScorecards.every(
      (scorecard) => Array.isArray(scorecard.promotionCriteria) && scorecard.promotionCriteria.length >= 4
    )
  ) {
    throw new Error("strategic platform intelligence expected every scorecard to retain promotion criteria.");
  }

  if (!body.executionScorecardDemotionTriggers?.includes("PHI upload requested")) {
    throw new Error("strategic platform intelligence expected scorecards to retain PHI-upload demotion trigger.");
  }

  const expectedBetSlugs = [
    "proof-before-production-risk",
    "enterprise-operating-layer-license",
    "clinical-production-gate-discipline"
  ];
  for (const slug of expectedBetSlugs) {
    if (!body.executionBets.some((bet) => bet.slug === slug)) {
      throw new Error(`strategic platform intelligence missing strategic bet ${slug}.`);
    }
  }

  const expectedGateSlugs = [
    "no-phi-proof-gate",
    "clinical-production-gate",
    "public-claims-and-investor-gate"
  ];
  for (const slug of expectedGateSlugs) {
    if (!body.decisionGates.some((gate) => gate.slug === slug)) {
      throw new Error(`strategic platform intelligence missing strategic gate ${slug}.`);
    }
  }

  if (!body.executionBets.every((bet) => bet.proofMetric && bet.stopCondition)) {
    throw new Error("strategic platform intelligence expected every bet to retain metric and stop condition.");
  }

  if (!body.decisionGates.every((gate) => gate.allowIf && gate.blockIf)) {
    throw new Error("strategic platform intelligence expected every gate to retain allow and block conditions.");
  }

  if (!body.recommendedStrategicSequence?.includes("customer-facing conversion command")) {
    throw new Error("strategic platform intelligence expected recommended strategic sequence.");
  }

  console.log("pass strategic platform intelligence");
}

async function checkCompetitiveDefense() {
  const result = await request("/api/competitive-defense");
  requireStatus("competitive defense", result.response.status, 200);
  requireContentType("competitive defense", result.response, "application/json");
  requireCompetitiveDefenseBoundary("competitive defense", result.response);
  const body = requireJson("competitive defense", result.body);

  if (body.service !== "scrimed-competitive-defense") {
    throw new Error(`competitive defense expected scrimed-competitive-defense but received ${body.service}.`);
  }

  if (body.status !== "competitive-defense-hardening-active") {
    throw new Error(`competitive defense expected active status but received ${body.status}.`);
  }

  if (body.route !== "/competitive-defense") {
    throw new Error("competitive defense expected page route.");
  }

  if (body.apiRoute !== "/api/competitive-defense") {
    throw new Error("competitive defense expected API route.");
  }

  if (!body.boundary?.includes("does not copy competitor products")) {
    throw new Error("competitive defense expected no-copy boundary.");
  }

  if (body.noAuthority?.securityCertification !== "not-security-certified") {
    throw new Error("competitive defense expected no security-certification authority.");
  }

  if (body.noAuthority?.penetrationTesting !== "not-penetration-test-authorization") {
    throw new Error("competitive defense expected no penetration-test authorization.");
  }

  if (!Array.isArray(body.threatProfiles) || body.threatProfiles.length < 10) {
    throw new Error("competitive defense expected competitor threat profile coverage.");
  }

  if (!body.threatProfiles.some((profile) => profile.competitor === "Microsoft Dragon Copilot")) {
    throw new Error("competitive defense expected Microsoft Dragon Copilot threat profile.");
  }

  if (!body.threatProfiles.some((profile) => profile.competitor === "Oracle Health")) {
    throw new Error("competitive defense expected Oracle Health threat profile.");
  }

  if (!Array.isArray(body.legalPrivacyCyberControls) || body.legalPrivacyCyberControls.length < 8) {
    throw new Error("competitive defense expected legal/privacy/cyber controls.");
  }

  if (!body.legalPrivacyCyberControls.some((control) => control.control === "LLM and agent threat model")) {
    throw new Error("competitive defense expected LLM and agent threat model.");
  }

  if (!Array.isArray(body.infiltrationDeterrenceLayers) || body.infiltrationDeterrenceLayers.length < 6) {
    throw new Error("competitive defense expected infiltration-deterrence layers.");
  }

  if (!Array.isArray(body.externalReviewGates) || body.externalReviewGates.length < 4) {
    throw new Error("competitive defense expected external review gates.");
  }

  if (!Array.isArray(body.hardStops) || !body.hardStops.some((hardStop) => hardStop.includes("No PHI"))) {
    throw new Error("competitive defense expected no-PHI hard stop.");
  }

  const brief = await request("/api/competitive-defense/brief");
  requireStatus("competitive defense brief", brief.response.status, 200);
  requireContentType("competitive defense brief", brief.response, "text/markdown");
  requireCompetitiveDefenseBoundary("competitive defense brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Competitive Defense Brief")) {
    throw new Error("competitive defense brief missing heading.");
  }

  if (!brief.body.text.includes("No-Authority Boundary")) {
    throw new Error("competitive defense brief missing no-authority section.");
  }

  if (!brief.body.text.includes("Infiltration Deterrence Layers")) {
    throw new Error("competitive defense brief missing infiltration section.");
  }

  console.log("pass competitive defense");
}

async function checkPilotDealRoomApi() {
  const result = await request("/api/pilot-deal-room");
  requireStatus("pilot deal room", result.response.status, 200);
  requireContentType("pilot deal room", result.response, "application/json");
  const body = requireJson("pilot deal room", result.body);

  if (body.service !== "scrimed-sales-deal-room") {
    throw new Error(`pilot deal room expected service scrimed-sales-deal-room but received ${body.service}.`);
  }

  if (body.status !== "public-organization-and-protected-packet-ready") {
    throw new Error(`pilot deal room expected public-organization-and-protected-packet-ready but received ${body.status}.`);
  }

  if (!Array.isArray(body.stages) || body.stages.length < 6) {
    throw new Error("pilot deal room expected at least six buyer journey stages.");
  }

  console.log("pass pilot deal room API");
}

async function checkQaEvidenceLedger() {
  const result = await request("/api/qa-evidence");
  requireStatus("QA evidence ledger", result.response.status, 200);
  requireContentType("QA evidence ledger", result.response, "application/json");
  requireSyntheticBoundary("QA evidence ledger", result.response);
  const body = requireJson("QA evidence ledger", result.body);

  if (body.service !== "scrimed-qa-evidence-ledger") {
    throw new Error(`QA evidence ledger expected service scrimed-qa-evidence-ledger but received ${body.service}.`);
  }

  if (body.status !== "qa-evidence-ledger-active") {
    throw new Error(`QA evidence ledger expected qa-evidence-ledger-active but received ${body.status}.`);
  }

  if (body.proofStackStatus !== "dated-qa-evidence-ledger-with-manual-aal2-gate") {
    throw new Error("QA evidence ledger missing proof-stack status.");
  }

  if (!Array.isArray(body.entries) || body.entries.length < 5) {
    throw new Error("QA evidence ledger expected at least five evidence entries.");
  }

  if (!body.entries.some((entry) => entry.status === "manual-gate")) {
    throw new Error("QA evidence ledger expected a visible manual AAL2 gate.");
  }

  if (body.manualRunEvidenceCapture?.status !== "manual-aal2-run-evidence-packet-ready") {
    throw new Error("QA evidence ledger expected manual run evidence packet capture status.");
  }

  if (
    body.manualRunEvidencePersistence?.status !==
    "tenant-scoped-aal2-manual-qa-evidence-ledger"
  ) {
    throw new Error("QA evidence ledger expected manual run evidence persistence status.");
  }

  if (body.activationPlan?.status !== "manual-aal2-qa-evidence-activation-plan-ready") {
    throw new Error("QA evidence ledger expected activation plan status.");
  }

  const brief = await request("/api/qa-evidence/brief");
  requireStatus("QA evidence brief", brief.response.status, 200);
  requireContentType("QA evidence brief", brief.response, "text/markdown");
  requireSyntheticBoundary("QA evidence brief", brief.response);

  const activationPlan = await request("/api/qa-evidence/activation-plan");
  requireStatus("QA evidence activation plan", activationPlan.response.status, 200);
  requireContentType("QA evidence activation plan", activationPlan.response, "application/json");
  requireSyntheticBoundary("QA evidence activation plan", activationPlan.response);
  const activationPlanBody = requireJson("QA evidence activation plan", activationPlan.body);

  if (activationPlanBody.status !== "manual-aal2-qa-evidence-activation-plan-ready") {
    throw new Error("QA evidence activation plan expected ready status.");
  }

  if (!activationPlanBody.workflows?.some((workflow) => workflow.workflowKind === "authority-reference-qa")) {
    throw new Error("QA evidence activation plan missing authority-reference workflow.");
  }

  if (!activationPlanBody.workflows?.some((workflow) => workflow.workflowKind === "sales-demo-session-qa")) {
    throw new Error("QA evidence activation plan missing sales-demo workflow.");
  }

  if (!activationPlanBody.workflows?.some((workflow) => workflow.workflowKind === "execution-attempt-durable-store-qa")) {
    throw new Error("QA evidence activation plan missing execution-attempt durable-store workflow.");
  }

  const activationPlanBrief = await request("/api/qa-evidence/activation-plan/brief");
  requireStatus("QA evidence activation plan brief", activationPlanBrief.response.status, 200);
  requireContentType("QA evidence activation plan brief", activationPlanBrief.response, "text/markdown");
  requireSyntheticBoundary("QA evidence activation plan brief", activationPlanBrief.response);

  if (!activationPlanBrief.body.text.includes("SCRIMED Manual AAL2 QA Evidence Activation Plan")) {
    throw new Error("QA evidence activation plan brief missing expected heading.");
  }

  const contract = await request("/api/qa-evidence/manual-run-packet");
  requireStatus("QA manual run evidence packet contract", contract.response.status, 200);
  requireContentType("QA manual run evidence packet contract", contract.response, "application/json");
  requireSyntheticBoundary("QA manual run evidence packet contract", contract.response);
  const contractBody = requireJson("QA manual run evidence packet contract", contract.body);

  if (contractBody.status !== "manual-aal2-run-evidence-packet-ready") {
    throw new Error("QA manual run evidence packet contract expected ready status.");
  }

  if (
    contractBody.authorityReferenceBridgeStatus !==
    "authority-reference-qa-evidence-bridge-ready"
  ) {
    throw new Error("QA manual run evidence packet contract missing authority-reference bridge status.");
  }

  if (!contractBody.supportedWorkflowKinds?.includes("authority-reference-qa")) {
    throw new Error("QA manual run evidence packet contract missing authority-reference workflow kind.");
  }

  if (!contractBody.supportedWorkflowKinds?.includes("execution-attempt-durable-store-qa")) {
    throw new Error("QA manual run evidence packet contract missing durable-store workflow kind.");
  }

  const rejectedSecret = await postJson("/api/qa-evidence/manual-run-packet", {
    workflowKind: "sales-demo-session-qa",
    workflowRunId: "123456789",
    workflowRunUrl: "https://github.com/temitayodahunsi777/scrimed-site/actions/runs/123456789",
    executedAt: new Date().toISOString(),
    baseUrl: "https://app.scrimedsolutions.com",
    intakeId: "intake-test-123",
    createdSessionId: "11111111-1111-4111-8111-111111111111",
    packetAuditEventId: "22222222-2222-4222-8222-222222222222",
    qaOutcome: "pass",
    operatorAttestation: "no-secrets-no-phi-aal2-human-run",
    tokenDisposalAttestation: "temporary-token-deleted-or-rotated",
    dataBoundary: "synthetic-business-workflow-only",
    bearerToken: "eyJexampleHeader.examplePayload.exampleSignature"
  });
  requireStatus("QA manual run evidence packet secret rejection", rejectedSecret.response.status, 400);
  requireContentType("QA manual run evidence packet secret rejection", rejectedSecret.response, "application/json");
  requireSyntheticBoundary("QA manual run evidence packet secret rejection", rejectedSecret.response);

  const acceptedPacket = await postJson("/api/qa-evidence/manual-run-packet", {
    workflowKind: "sales-demo-session-qa",
    workflowRunId: "123456789",
    workflowRunUrl: "https://github.com/temitayodahunsi777/scrimed-site/actions/runs/123456789",
    executedAt: new Date().toISOString(),
    baseUrl: "https://app.scrimedsolutions.com",
    intakeId: "intake-test-123",
    createdSessionId: "11111111-1111-4111-8111-111111111111",
    packetAuditEventId: "22222222-2222-4222-8222-222222222222",
    qaOutcome: "pass",
    operatorAttestation: "no-secrets-no-phi-aal2-human-run",
    tokenDisposalAttestation: "temporary-token-deleted-or-rotated",
    dataBoundary: "synthetic-business-workflow-only"
  });
  requireStatus("QA manual run evidence packet", acceptedPacket.response.status, 200);
  requireContentType("QA manual run evidence packet", acceptedPacket.response, "text/markdown");
  requireSyntheticBoundary("QA manual run evidence packet", acceptedPacket.response);

  const acceptedAuthorityPacket = await postJson("/api/qa-evidence/manual-run-packet", {
    workflowKind: "authority-reference-qa",
    workflowRunId: "202606221321",
    workflowRunUrl: "https://app.scrimedsolutions.com/qa-run-control?runId=202606221321",
    executedAt: new Date().toISOString(),
    baseUrl: "https://app.scrimedsolutions.com",
    intakeId: "atlas-synthetic-evaluation",
    createdSessionId: "33333333-3333-4333-8333-333333333333",
    packetAuditEventId: "44444444-4444-4444-8444-444444444444",
    evidenceTargetLabel: "Workspace target",
    evidenceObjectLabel: "Created authority reference ID",
    packetAuditEventLabel: "Authority packet audit event ID",
    evidenceRoute: "/api/pilot-workspaces/{workspaceSlug}/authority-artifact-references/renewal-queue",
    packetRoute: "/api/pilot-workspaces/{workspaceSlug}/authority-artifact-references/packet",
    operatorRunbook: "/docs/protected-authority-artifact-references.md",
    qaOutcome: "pass",
    operatorAttestation: "no-secrets-no-phi-aal2-human-run",
    tokenDisposalAttestation: "temporary-token-deleted-or-rotated",
    dataBoundary: "synthetic-business-workflow-only"
  });
  requireStatus("QA authority reference evidence packet", acceptedAuthorityPacket.response.status, 200);
  requireContentType("QA authority reference evidence packet", acceptedAuthorityPacket.response, "text/markdown");
  requireSyntheticBoundary("QA authority reference evidence packet", acceptedAuthorityPacket.response);

  if (!acceptedAuthorityPacket.body.text.includes("Workflow kind: authority-reference-qa")) {
    throw new Error("QA authority reference evidence packet missing workflow kind.");
  }

  const acceptedDurableStorePacket = await postJson("/api/qa-evidence/manual-run-packet", {
    workflowKind: "execution-attempt-durable-store-qa",
    workflowRunId: "202606221322",
    workflowRunUrl: "https://app.scrimedsolutions.com/qa-run-control?runId=202606221322",
    executedAt: new Date().toISOString(),
    baseUrl: "https://app.scrimedsolutions.com",
    intakeId: "atlas-synthetic-evaluation",
    createdSessionId: "55555555-5555-4555-8555-555555555555",
    packetAuditEventId: "66666666-6666-4666-8666-666666666666",
    evidenceTargetLabel: "Workspace target",
    evidenceObjectLabel: "Created durable record ID",
    packetAuditEventLabel: "Review disposition audit event ID",
    evidenceRoute: "/api/workflows/execution-attempts/durable-store/record",
    packetRoute: "/api/workflows/execution-attempts/durable-store/review-disposition",
    operatorRunbook: "/docs/aal2-durable-store-smoke.md",
    qaOutcome: "pass",
    operatorAttestation: "no-secrets-no-phi-aal2-human-run",
    tokenDisposalAttestation: "temporary-token-deleted-or-rotated",
    dataBoundary: "synthetic-business-workflow-only"
  });
  requireStatus("QA durable-store evidence packet", acceptedDurableStorePacket.response.status, 200);
  requireContentType("QA durable-store evidence packet", acceptedDurableStorePacket.response, "text/markdown");
  requireSyntheticBoundary("QA durable-store evidence packet", acceptedDurableStorePacket.response);

  if (!acceptedDurableStorePacket.body.text.includes("Workflow kind: execution-attempt-durable-store-qa")) {
    throw new Error("QA durable-store evidence packet missing workflow kind.");
  }

  console.log("pass QA evidence ledger");
}

async function checkQaExecutionReadiness() {
  const result = await request("/api/qa-evidence/execution-readiness");
  requireStatus("QA execution readiness", result.response.status, 200);
  requireContentType("QA execution readiness", result.response, "application/json");
  requireQaExecutionBoundary("QA execution readiness", result.response);
  const body = requireJson("QA execution readiness", result.body);

  if (body.service !== "scrimed-manual-aal2-qa-execution-readiness") {
    throw new Error(`QA execution readiness expected scrimed-manual-aal2-qa-execution-readiness but received ${body.service}.`);
  }

  if (body.status !== "manual-aal2-qa-execution-readiness-ready") {
    throw new Error(`QA execution readiness expected ready status but received ${body.status}.`);
  }

  if (body.executionDecision !== "ready-for-human-run-not-code-bypass") {
    throw new Error("QA execution readiness must preserve human-run decision.");
  }

  if (body.buyerClaimStatus !== "activation-ready-not-retained-authenticated-proof") {
    throw new Error("QA execution readiness must preserve not-retained-proof claim boundary.");
  }

  if (!Array.isArray(body.dispatchWorkflows) || body.dispatchWorkflows.length < 3) {
    throw new Error("QA execution readiness expected all three governed manual workflows.");
  }

  if (!body.dispatchWorkflows.every((workflow) => workflow.state === "ready-for-human-aal2-run-not-executed")) {
    throw new Error("QA execution readiness workflows must remain not executed.");
  }

  if (!body.hardStopRules?.some((rule) => rule.includes("Do not run authenticated QA without a fresh human AAL2 session"))) {
    throw new Error("QA execution readiness missing human AAL2 hard stop.");
  }

  const brief = await request("/api/qa-evidence/execution-readiness/brief");
  requireStatus("QA execution readiness brief", brief.response.status, 200);
  requireContentType("QA execution readiness brief", brief.response, "text/markdown");
  requireQaExecutionBoundary("QA execution readiness brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Manual AAL2 QA Execution Readiness Brief")) {
    throw new Error("QA execution readiness brief missing heading.");
  }

  if (!brief.body.text.includes("ready-for-human-run-not-code-bypass")) {
    throw new Error("QA execution readiness brief missing human-run decision.");
  }

  console.log("pass QA execution readiness");
}

async function checkQaRunControl() {
  const result = await request("/api/qa-evidence/run-control");
  requireStatus("QA run control", result.response.status, 200);
  requireContentType("QA run control", result.response, "application/json");
  requireQaRunControlBoundary("QA run control", result.response);
  const body = requireJson("QA run control", result.body);
  const serialized = JSON.stringify(body);

  if (body.service !== "scrimed-manual-aal2-qa-run-control") {
    throw new Error(`QA run control expected scrimed-manual-aal2-qa-run-control but received ${body.service}.`);
  }

  if (body.status !== "manual-aal2-qa-run-control-ready") {
    throw new Error(`QA run control expected ready status but received ${body.status}.`);
  }

  if (body.executionDecision !== "operator-control-ready-human-aal2-required") {
    throw new Error("QA run control must preserve human AAL2 operator-control decision.");
  }

  if (body.buyerClaimStatus !== "operator-brief-ready-not-retained-authenticated-proof") {
    throw new Error("QA run control must preserve not-retained authenticated proof boundary.");
  }

  if (!Array.isArray(body.workflows) || body.workflows.length < 3) {
    throw new Error("QA run control expected all three governed manual workflows.");
  }

  if (!body.workflows.every((workflow) => workflow.state === "ready-for-operator-control-human-aal2-required")) {
    throw new Error("QA run control workflows must remain human AAL2 required.");
  }

  if (!body.workflows.every((workflow) => workflow.dispatchInputs?.require_authenticated_path === true)) {
    throw new Error("QA run control workflows must require authenticated path dispatch.");
  }

  if (!body.workflows.every((workflow) => workflow.safeEvidenceTemplate?.tokenDisposalAttestation === "temporary-token-deleted-or-rotated")) {
    throw new Error("QA run control safe evidence templates must require token disposal attestation.");
  }

  if (!body.workflows.every((workflow) => workflow.abortConditions?.some((condition) => condition.includes("No fresh human AAL2 session")))) {
    throw new Error("QA run control workflows must include human AAL2 abort condition.");
  }

  if (!Array.isArray(body.gates) || body.gates.length < 7) {
    throw new Error("QA run control expected gate coverage.");
  }

  if (!body.claimRules?.some((rule) => rule.includes("Not allowed yet: SCRIMED has retained authenticated AAL2 QA proof"))) {
    throw new Error("QA run control missing retained-proof claim boundary.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serialized)) {
    throw new Error("QA run control response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serialized)) {
    throw new Error("QA run control response must not contain bearer-token material.");
  }

  const brief = await request("/api/qa-evidence/run-control/brief");
  requireStatus("QA run control brief", brief.response.status, 200);
  requireContentType("QA run control brief", brief.response, "text/markdown");
  requireQaRunControlBoundary("QA run control brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Manual AAL2 QA Run Control Brief")) {
    throw new Error("QA run control brief missing heading.");
  }

  if (!brief.body.text.includes("operator-control-ready-human-aal2-required")) {
    throw new Error("QA run control brief missing operator-control decision.");
  }

  if (!brief.body.text.includes("not-retained-authenticated-proof")) {
    throw new Error("QA run control brief missing retained-proof boundary.");
  }

  console.log("pass QA run control");
}

async function checkQaLaunchKit() {
  const result = await request("/api/qa-evidence/launch-kit");
  requireStatus("QA launch kit", result.response.status, 200);
  requireContentType("QA launch kit", result.response, "application/json");
  requireQaLaunchKitBoundary("QA launch kit", result.response);
  const body = requireJson("QA launch kit", result.body);
  const serialized = JSON.stringify(body);

  if (body.service !== "scrimed-manual-aal2-qa-launch-kit") {
    throw new Error(`QA launch kit expected scrimed-manual-aal2-qa-launch-kit but received ${body.service}.`);
  }

  if (body.status !== "manual-aal2-qa-launch-kit-ready") {
    throw new Error(`QA launch kit expected ready status but received ${body.status}.`);
  }

  if (body.launchDecision !== "ready-for-human-launch-not-code-execution") {
    throw new Error("QA launch kit must preserve human-launch decision.");
  }

  if (body.buyerClaimStatus !== "operator-handoff-ready-not-retained-authenticated-proof") {
    throw new Error("QA launch kit must preserve not-retained authenticated proof boundary.");
  }

  if (!Array.isArray(body.phases) || body.phases.length < 9) {
    throw new Error("QA launch kit expected launch phase coverage.");
  }

  if (!body.phases.some((phase) => phase.state === "hard-stop")) {
    throw new Error("QA launch kit expected hard-stop phase.");
  }

  if (!Array.isArray(body.workflows) || body.workflows.length < 3) {
    throw new Error("QA launch kit expected all three governed manual workflows.");
  }

  if (!body.workflows.every((workflow) => workflow.dispatchInputs?.require_authenticated_path === true)) {
    throw new Error("QA launch kit workflows must require authenticated path dispatch.");
  }

  if (!body.workflows.every((workflow) => workflow.safeEvidenceTemplate?.tokenDisposalAttestation === "temporary-token-deleted-or-rotated")) {
    throw new Error("QA launch kit safe evidence templates must require token disposal attestation.");
  }

  if (!Array.isArray(body.blockedClaims) || !body.blockedClaims.includes("live clinical care authorized")) {
    throw new Error("QA launch kit expected live clinical care to remain blocked.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serialized)) {
    throw new Error("QA launch kit response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serialized)) {
    throw new Error("QA launch kit response must not contain bearer-token material.");
  }

  const brief = await request("/api/qa-evidence/launch-kit/brief");
  requireStatus("QA launch kit brief", brief.response.status, 200);
  requireContentType("QA launch kit brief", brief.response, "text/markdown");
  requireQaLaunchKitBoundary("QA launch kit brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Manual AAL2 QA Launch Kit")) {
    throw new Error("QA launch kit brief missing heading.");
  }

  if (!brief.body.text.includes("ready-for-human-launch-not-code-execution")) {
    throw new Error("QA launch kit brief missing human-launch decision.");
  }

  if (!brief.body.text.includes("temporary-token-deleted-or-rotated")) {
    throw new Error("QA launch kit brief missing token disposal attestation.");
  }

  console.log("pass QA launch kit");
}

async function checkQaHumanRunPacket() {
  const result = await request("/api/qa-evidence/human-run-packet");
  requireStatus("QA human run packet", result.response.status, 200);
  requireContentType("QA human run packet", result.response, "application/json");
  requireQaHumanRunPacketBoundary("QA human run packet", result.response);
  const body = requireJson("QA human run packet", result.body);
  const serialized = JSON.stringify(body);

  if (body.service !== "scrimed-qa-human-run-packet") {
    throw new Error(`QA human run packet expected scrimed-qa-human-run-packet but received ${body.service}.`);
  }

  if (body.status !== "manual-aal2-qa-human-run-packet-ready") {
    throw new Error(`QA human run packet expected ready status but received ${body.status}.`);
  }

  if (body.decisionState !== "dispatch-template-ready") {
    throw new Error("QA human run packet must preserve dispatch-template-ready state.");
  }

  if (body.executionAllowedByCode !== false || body.humanAal2Required !== true) {
    throw new Error("QA human run packet must preserve human-required/no-code-execution boundary.");
  }

  if (body.proofClaimAllowed !== false || body.buyerUseAllowed !== false) {
    throw new Error("QA human run packet must block proof claims and buyer use before protected packet visibility.");
  }

  if (!Array.isArray(body.workflows) || body.workflows.length < 3) {
    throw new Error("QA human run packet expected all three governed manual workflows.");
  }

  if (!Array.isArray(body.controls) || body.controls.length < 7) {
    throw new Error("QA human run packet expected control coverage.");
  }

  if (!body.controls.some((control) => control.state === "hard-stop")) {
    throw new Error("QA human run packet expected hard-stop controls.");
  }

  if (!body.workflows.every((workflow) => workflow.dispatchInputs?.require_authenticated_path === true)) {
    throw new Error("QA human run packet workflows must require authenticated path dispatch.");
  }

  if (!body.postRunRoutes?.includes("/qa-completion-bridge")) {
    throw new Error("QA human run packet expected Completion Bridge post-run route.");
  }

  if (!body.postRunRoutes?.includes("/api/pilot-workspaces/{workspaceSlug}/qa-evidence/manual-run-packets")) {
    throw new Error("QA human run packet expected protected Manual QA Evidence post-run route.");
  }

  if (!Array.isArray(body.blockedClaims) || !body.blockedClaims.includes("live clinical care authorized")) {
    throw new Error("QA human run packet expected live clinical care to remain blocked.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serialized)) {
    throw new Error("QA human run packet response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serialized)) {
    throw new Error("QA human run packet response must not contain bearer-token material.");
  }

  const rejectedSecret = await postJson("/api/qa-evidence/human-run-packet", {
    workflowKind: "sales-demo-session-qa",
    operatorRole: "tenant-admin",
    protectedWorkspaceSlug: "atlas-synthetic-evaluation",
    syntheticTargetId: "synthetic-sales-opportunity-intake-id",
    plannedExecutionWindow: "operator-window-2026-06-22T12:00:00Z",
    bearerToken: "Bearer eyJshould.not.persist.fake",
    dispatchAttestation: "human-aal2-required-no-code-bypass",
    proofBlockedAttestation: "no-retained-proof-until-protected-packet-visible",
    dataBoundary: "synthetic-business-workflow-only"
  });
  requireStatus("QA human run packet secret rejection", rejectedSecret.response.status, 400);
  requireContentType("QA human run packet secret rejection", rejectedSecret.response, "application/json");
  requireQaHumanRunPacketBoundary("QA human run packet secret rejection", rejectedSecret.response);
  const rejectedBody = requireJson("QA human run packet secret rejection", rejectedSecret.body);

  if (rejectedBody.decisionState !== "candidate-dispatch-rejected") {
    throw new Error("QA human run packet must reject secret-like dispatch candidates.");
  }

  const acceptedCandidate = await postJson("/api/qa-evidence/human-run-packet", {
    workflowKind: "authority-reference-qa",
    operatorRole: "tenant-admin",
    protectedWorkspaceSlug: "atlas-synthetic-evaluation",
    syntheticTargetId: "atlas-synthetic-evaluation",
    plannedExecutionWindow: "operator-window-2026-06-22T12:00:00Z",
    dispatchAttestation: "human-aal2-required-no-code-bypass",
    proofBlockedAttestation: "no-retained-proof-until-protected-packet-visible",
    dataBoundary: "synthetic-business-workflow-only"
  });
  requireStatus("QA human run packet accepted candidate", acceptedCandidate.response.status, 200);
  requireContentType("QA human run packet accepted candidate", acceptedCandidate.response, "application/json");
  requireQaHumanRunPacketBoundary("QA human run packet accepted candidate", acceptedCandidate.response);
  const acceptedBody = requireJson("QA human run packet accepted candidate", acceptedCandidate.body);

  if (acceptedBody.decisionState !== "candidate-dispatch-ready-human-aal2-required") {
    throw new Error("QA human run packet accepted candidate must remain human AAL2 required.");
  }

  if (acceptedBody.executionAllowedByCode !== false || acceptedBody.proofClaimAllowed !== false) {
    throw new Error("QA human run packet accepted candidate must not execute or allow proof claims.");
  }

  if (!/^[a-f0-9]{64}$/.test(acceptedBody.dispatchDigest)) {
    throw new Error("QA human run packet accepted candidate expected dispatch digest.");
  }

  if (acceptedBody.workflow?.workflowKind !== "authority-reference-qa") {
    throw new Error("QA human run packet accepted candidate expected authority-reference workflow.");
  }

  const acceptedDurableCandidate = await postJson("/api/qa-evidence/human-run-packet", {
    workflowKind: "execution-attempt-durable-store-qa",
    operatorRole: "tenant-admin",
    protectedWorkspaceSlug: "atlas-synthetic-evaluation",
    syntheticTargetId: "atlas-synthetic-evaluation",
    plannedExecutionWindow: "operator-window-2026-08-08T12:00:00Z",
    dispatchAttestation: "human-aal2-required-no-code-bypass",
    proofBlockedAttestation: "no-retained-proof-until-protected-packet-visible",
    dataBoundary: "synthetic-business-workflow-only"
  });
  requireStatus("QA human run packet durable-store candidate", acceptedDurableCandidate.response.status, 200);
  const acceptedDurableBody = requireJson("QA human run packet durable-store candidate", acceptedDurableCandidate.body);
  if (acceptedDurableBody.workflow?.workflowKind !== "execution-attempt-durable-store-qa") {
    throw new Error("QA human run packet expected the durable-store workflow.");
  }

  const brief = await request("/api/qa-evidence/human-run-packet/brief");
  requireStatus("QA human run packet brief", brief.response.status, 200);
  requireContentType("QA human run packet brief", brief.response, "text/markdown");
  requireQaHumanRunPacketBoundary("QA human run packet brief", brief.response);

  if (!brief.body.text.includes("SCRIMED QA Human Run Packet")) {
    throw new Error("QA human run packet brief missing heading.");
  }

  if (!brief.body.text.includes("dispatch-template-ready")) {
    throw new Error("QA human run packet brief missing dispatch-template-ready state.");
  }

  if (!brief.body.text.includes("Proof claim allowed: no")) {
    throw new Error("QA human run packet brief must keep proof claims blocked.");
  }

  console.log("pass QA human run packet");
}

async function checkQaCompletionBridge() {
  const result = await request("/api/qa-evidence/completion-bridge");
  requireStatus("QA completion bridge", result.response.status, 200);
  requireContentType("QA completion bridge", result.response, "application/json");
  requireQaCompletionBridgeBoundary("QA completion bridge", result.response);
  const body = requireJson("QA completion bridge", result.body);
  const serialized = JSON.stringify(body);

  if (body.service !== "scrimed-qa-completion-bridge") {
    throw new Error(`QA completion bridge expected scrimed-qa-completion-bridge but received ${body.service}.`);
  }

  if (body.status !== "manual-aal2-qa-completion-bridge-ready") {
    throw new Error(`QA completion bridge expected ready status but received ${body.status}.`);
  }

  if (body.completionDecisionState !== "waiting-for-human-aal2-run") {
    throw new Error("QA completion bridge must preserve waiting-for-human-aal2-run public decision.");
  }

  if (body.buyerClaimStatus !== "completion-bridge-ready-not-retained-authenticated-proof") {
    throw new Error("QA completion bridge must preserve not-retained authenticated proof boundary.");
  }

  if (!Array.isArray(body.checkpoints) || body.checkpoints.length < 5) {
    throw new Error("QA completion bridge expected checkpoint coverage.");
  }

  if (!body.checkpoints.some((checkpoint) => checkpoint.state === "protected-only")) {
    throw new Error("QA completion bridge expected protected-only persistence checkpoint.");
  }

  if (!Array.isArray(body.bridgeRules) || !body.bridgeRules.some((rule) => rule.includes("Not allowed here"))) {
    throw new Error("QA completion bridge expected not-allowed bridge rule.");
  }

  if (!Array.isArray(body.blockedClaims) || !body.blockedClaims.includes("live clinical care authorized")) {
    throw new Error("QA completion bridge expected live clinical care to remain blocked.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serialized)) {
    throw new Error("QA completion bridge response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serialized)) {
    throw new Error("QA completion bridge response must not contain bearer-token material.");
  }

  const rejectedSecret = await postJson("/api/qa-evidence/completion-bridge", {
    workflowKind: "sales-demo-session-qa",
    workflowRunId: "1234567890",
    workflowRunUrl: "https://github.com/temitayodahunsi777/scrimed-site/actions/runs/1234567890",
    executedAt: new Date().toISOString(),
    baseUrl: "https://app.scrimedsolutions.com",
    intakeId: "synthetic-intake-001",
    createdSessionId: "11111111-1111-4111-8111-111111111111",
    packetAuditEventId: "22222222-2222-4222-8222-222222222222",
    bearerToken: "Bearer eyJshould.not.persist.fake",
    qaOutcome: "pass",
    operatorAttestation: "no-secrets-no-phi-aal2-human-run",
    tokenDisposalAttestation: "temporary-token-deleted-or-rotated",
    dataBoundary: "synthetic-business-workflow-only"
  });
  requireStatus("QA completion bridge secret rejection", rejectedSecret.response.status, 400);
  requireContentType("QA completion bridge secret rejection", rejectedSecret.response, "application/json");
  requireQaCompletionBridgeBoundary("QA completion bridge secret rejection", rejectedSecret.response);
  const rejectedBody = requireJson("QA completion bridge secret rejection", rejectedSecret.body);

  if (rejectedBody.decisionState !== "candidate-validation-failed") {
    throw new Error("QA completion bridge must fail closed for secret-like candidate material.");
  }

  const acceptedCandidate = await postJson("/api/qa-evidence/completion-bridge", {
    workflowKind: "authority-reference-qa",
    workflowRunId: "1234567890",
    workflowRunUrl: "https://github.com/temitayodahunsi777/scrimed-site/actions/runs/1234567890",
    executedAt: new Date().toISOString(),
    baseUrl: "https://app.scrimedsolutions.com",
    intakeId: "atlas-synthetic-evaluation",
    createdSessionId: "11111111-1111-4111-8111-111111111111",
    packetAuditEventId: "22222222-2222-4222-8222-222222222222",
    evidenceTargetLabel: "Workspace target",
    evidenceObjectLabel: "Created authority reference ID",
    packetAuditEventLabel: "Authority packet audit event ID",
    evidenceRoute: "/api/pilot-workspaces/{workspaceSlug}/authority-artifact-references",
    packetRoute: "/api/pilot-workspaces/{workspaceSlug}/authority-artifact-references/packet",
    operatorRunbook: "/docs/protected-authority-artifact-references.md",
    qaOutcome: "pass",
    operatorAttestation: "no-secrets-no-phi-aal2-human-run",
    tokenDisposalAttestation: "temporary-token-deleted-or-rotated",
    dataBoundary: "synthetic-business-workflow-only"
  });
  requireStatus("QA completion bridge accepted candidate", acceptedCandidate.response.status, 200);
  requireContentType("QA completion bridge accepted candidate", acceptedCandidate.response, "application/json");
  requireQaCompletionBridgeBoundary("QA completion bridge accepted candidate", acceptedCandidate.response);
  const acceptedBody = requireJson("QA completion bridge accepted candidate", acceptedCandidate.body);

  if (acceptedBody.decisionState !== "ready-for-protected-persistence") {
    throw new Error("QA completion bridge accepted candidate must be ready for protected persistence.");
  }

  if (acceptedBody.promotionAllowed !== false) {
    throw new Error("QA completion bridge must not promote buyer proof before protected packet persistence.");
  }

  if (!/^[a-f0-9]{64}$/.test(acceptedBody.packetPreviewSha256)) {
    throw new Error("QA completion bridge accepted candidate expected packet preview SHA-256.");
  }

  if (!acceptedBody.packetPreviewMarkdown?.includes("SCRIMED Manual Authority Reference QA Evidence Packet")) {
    throw new Error("QA completion bridge accepted candidate expected authority reference packet preview.");
  }

  const acceptedDurableCandidate = await postJson("/api/qa-evidence/completion-bridge", {
    workflowKind: "execution-attempt-durable-store-qa",
    workflowRunId: "1234567891",
    workflowRunUrl: "https://github.com/temitayodahunsi777/scrimed-site/actions/runs/1234567891",
    executedAt: new Date().toISOString(),
    baseUrl: "https://app.scrimedsolutions.com",
    intakeId: "atlas-synthetic-evaluation",
    createdSessionId: "33333333-3333-4333-8333-333333333333",
    packetAuditEventId: "44444444-4444-4444-8444-444444444444",
    evidenceTargetLabel: "Workspace target",
    evidenceObjectLabel: "Created durable record ID",
    packetAuditEventLabel: "Review disposition audit event ID",
    evidenceRoute: "/api/workflows/execution-attempts/durable-store/record",
    packetRoute: "/api/workflows/execution-attempts/durable-store/review-disposition",
    operatorRunbook: "/docs/aal2-durable-store-smoke.md",
    qaOutcome: "pass",
    operatorAttestation: "no-secrets-no-phi-aal2-human-run",
    tokenDisposalAttestation: "temporary-token-deleted-or-rotated",
    dataBoundary: "synthetic-business-workflow-only"
  });
  requireStatus("QA completion bridge durable-store candidate", acceptedDurableCandidate.response.status, 200);
  const acceptedDurableBody = requireJson("QA completion bridge durable-store candidate", acceptedDurableCandidate.body);
  if (!acceptedDurableBody.packetPreviewMarkdown?.includes("SCRIMED Manual Execution Attempt Durable Store QA Evidence Packet")) {
    throw new Error("QA completion bridge expected the durable-store packet preview.");
  }

  const brief = await request("/api/qa-evidence/completion-bridge/brief");
  requireStatus("QA completion bridge brief", brief.response.status, 200);
  requireContentType("QA completion bridge brief", brief.response, "text/markdown");
  requireQaCompletionBridgeBoundary("QA completion bridge brief", brief.response);

  if (!brief.body.text.includes("SCRIMED QA Completion Bridge Brief")) {
    throw new Error("QA completion bridge brief missing heading.");
  }

  if (!brief.body.text.includes("waiting-for-human-aal2-run")) {
    throw new Error("QA completion bridge brief missing waiting-for-human decision.");
  }

  if (!brief.body.text.includes("Protected persistence route")) {
    throw new Error("QA completion bridge brief missing protected persistence route.");
  }

  console.log("pass QA completion bridge");
}

async function checkQaClaimGuard() {
  const result = await request("/api/qa-evidence/claim-guard");
  requireStatus("QA claim guard", result.response.status, 200);
  requireContentType("QA claim guard", result.response, "application/json");
  requireQaClaimGuardBoundary("QA claim guard", result.response);
  const body = requireJson("QA claim guard", result.body);
  const serialized = JSON.stringify(body);

  if (body.service !== "scrimed-qa-claim-guard") {
    throw new Error(`QA claim guard expected scrimed-qa-claim-guard but received ${body.service}.`);
  }

  if (body.status !== "manual-aal2-qa-claim-guard-ready") {
    throw new Error(`QA claim guard expected ready status but received ${body.status}.`);
  }

  if (body.buyerClaimPosture !== "activation-ready-until-retained-packet-proof") {
    throw new Error("QA claim guard must preserve current activation-ready claim posture.");
  }

  if (!Array.isArray(body.rules) || body.rules.length < 4) {
    throw new Error("QA claim guard expected rule coverage.");
  }

  if (!Array.isArray(body.blockedAuthorityClaims) || !body.blockedAuthorityClaims.includes("live clinical care authorized")) {
    throw new Error("QA claim guard expected live clinical care authority to remain blocked.");
  }

  if (!Array.isArray(body.reviewTriggers) || !body.reviewTriggers.includes("press release")) {
    throw new Error("QA claim guard expected external-use review triggers.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serialized)) {
    throw new Error("QA claim guard response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serialized)) {
    throw new Error("QA claim guard response must not contain bearer-token material.");
  }

  const safeClaim = await postJson("/api/qa-evidence/claim-guard", {
    claim:
      "SCRIMED has a no-secret synthetic operator-ready human AAL2 required QA path with protected persistence required."
  });
  requireStatus("QA claim guard safe current claim", safeClaim.response.status, 200);
  requireContentType("QA claim guard safe current claim", safeClaim.response, "application/json");
  requireQaClaimGuardBoundary("QA claim guard safe current claim", safeClaim.response);
  const safeBody = requireJson("QA claim guard safe current claim", safeClaim.body);

  if (safeBody.decisionState !== "safe-current-claim" || safeBody.allowedForCurrentBuyerUse !== true) {
    throw new Error("QA claim guard expected safe current claim to be allowed.");
  }

  const packetClaim = await postJson("/api/qa-evidence/claim-guard", {
    claim: "SCRIMED has retained authenticated QA evidence for the completed human AAL2 QA workflow."
  });
  requireStatus("QA claim guard packet-gated claim", packetClaim.response.status, 200);
  requireContentType("QA claim guard packet-gated claim", packetClaim.response, "application/json");
  requireQaClaimGuardBoundary("QA claim guard packet-gated claim", packetClaim.response);
  const packetBody = requireJson("QA claim guard packet-gated claim", packetClaim.body);

  if (packetBody.decisionState !== "requires-retained-packet" || packetBody.allowedForCurrentBuyerUse !== false) {
    throw new Error("QA claim guard expected packet-backed claim to require retained packet evidence.");
  }

  const blockedClaim = await postJson("/api/qa-evidence/claim-guard", {
    claim: "SCRIMED is HIPAA compliant and live clinical care authorized with reimbursement guaranteed."
  });
  requireStatus("QA claim guard blocked authority claim", blockedClaim.response.status, 409);
  requireContentType("QA claim guard blocked authority claim", blockedClaim.response, "application/json");
  requireQaClaimGuardBoundary("QA claim guard blocked authority claim", blockedClaim.response);
  const blockedBody = requireJson("QA claim guard blocked authority claim", blockedClaim.body);

  if (blockedBody.decisionState !== "blocked-authority-claim" || blockedBody.allowedForCurrentBuyerUse !== false) {
    throw new Error("QA claim guard expected authority claim to remain blocked.");
  }

  const brief = await request("/api/qa-evidence/claim-guard/brief");
  requireStatus("QA claim guard brief", brief.response.status, 200);
  requireContentType("QA claim guard brief", brief.response, "text/markdown");
  requireQaClaimGuardBoundary("QA claim guard brief", brief.response);

  if (!brief.body.text.includes("SCRIMED QA Claim Guard Brief")) {
    throw new Error("QA claim guard brief missing heading.");
  }

  if (!brief.body.text.includes("activation-ready-until-retained-packet-proof")) {
    throw new Error("QA claim guard brief missing activation-ready posture.");
  }

  if (!brief.body.text.includes("Blocked Authority Claims")) {
    throw new Error("QA claim guard brief missing blocked authority claims.");
  }

  console.log("pass QA claim guard");
}

async function checkQaActivationSeal() {
  const result = await request("/api/qa-evidence/activation-seal");
  requireStatus("QA activation seal", result.response.status, 200);
  requireContentType("QA activation seal", result.response, "application/json");
  requireQaActivationSealBoundary("QA activation seal", result.response);
  const body = requireJson("QA activation seal", result.body);
  const serialized = JSON.stringify(body);

  if (body.service !== "scrimed-qa-activation-seal") {
    throw new Error(`QA activation seal expected scrimed-qa-activation-seal but received ${body.service}.`);
  }

  if (body.status !== "manual-aal2-qa-activation-seal-ready") {
    throw new Error(`QA activation seal expected ready status but received ${body.status}.`);
  }

  if (body.decisionState !== "unsealed-human-aal2-required") {
    throw new Error(`QA activation seal expected unsealed-human-aal2-required but received ${body.decisionState}.`);
  }

  if (body.sealAllowed !== false || body.buyerUseAllowed !== false) {
    throw new Error("QA activation seal must not allow public/default seal or buyer use.");
  }

  if (!Array.isArray(body.rules) || body.rules.length < 7) {
    throw new Error("QA activation seal expected rule coverage.");
  }

  if (!Array.isArray(body.requiredEvidence) || !body.requiredEvidence.includes("protected Manual QA Evidence packet SHA-256")) {
    throw new Error("QA activation seal expected protected packet evidence requirement.");
  }

  if (!Array.isArray(body.hardStopClaims) || !body.hardStopClaims.includes("live clinical care authorized")) {
    throw new Error("QA activation seal expected live clinical care authority to remain blocked.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serialized)) {
    throw new Error("QA activation seal response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serialized)) {
    throw new Error("QA activation seal response must not contain bearer-token material.");
  }

  const candidate = await postJson("/api/qa-evidence/activation-seal", {
    workflowRunId: "1234567890",
    workflowRunUrl: "https://github.com/temitayodahunsi777/scrimed-site/actions/runs/1234567890",
    packetSha256: "a".repeat(64),
    packetAuditEventId: "22222222-2222-4222-8222-222222222222",
    protectedWorkspaceSlug: "atlas-synthetic-evaluation",
    proofPromotionState: "ready-for-buyer-diligence",
    claimDecisionState: "requires-retained-packet",
    operatorAttestation: "no-secrets-no-phi-aal2-human-run",
    tokenDisposalAttestation: "temporary-token-deleted-or-rotated",
    dataBoundary: "synthetic-business-workflow-only"
  });
  requireStatus("QA activation seal candidate", candidate.response.status, 200);
  requireContentType("QA activation seal candidate", candidate.response, "application/json");
  requireQaActivationSealBoundary("QA activation seal candidate", candidate.response);
  const candidateBody = requireJson("QA activation seal candidate", candidate.body);

  if (
    candidateBody.decisionState !== "candidate-ready-protected-verification-required" ||
    candidateBody.sealAllowed !== false ||
    candidateBody.publicVerificationOnly !== true
  ) {
    throw new Error("QA activation seal expected candidate-ready public verification without seal allowance.");
  }

  const blocked = await postJson("/api/qa-evidence/activation-seal", {
    claim: "SCRIMED is HIPAA compliant with live clinical care authorized and reimbursement guaranteed."
  });
  requireStatus("QA activation seal blocked authority claim", blocked.response.status, 409);
  requireContentType("QA activation seal blocked authority claim", blocked.response, "application/json");
  requireQaActivationSealBoundary("QA activation seal blocked authority claim", blocked.response);
  const blockedBody = requireJson("QA activation seal blocked authority claim", blocked.body);

  if (blockedBody.decisionState !== "blocked-boundary-violation" || blockedBody.sealAllowed !== false) {
    throw new Error("QA activation seal expected authority claim to remain blocked.");
  }

  const brief = await request("/api/qa-evidence/activation-seal/brief");
  requireStatus("QA activation seal brief", brief.response.status, 200);
  requireContentType("QA activation seal brief", brief.response, "text/markdown");
  requireQaActivationSealBoundary("QA activation seal brief", brief.response);

  if (!brief.body.text.includes("SCRIMED QA Activation Seal Brief")) {
    throw new Error("QA activation seal brief missing heading.");
  }

  if (!brief.body.text.includes("unsealed-human-aal2-required")) {
    throw new Error("QA activation seal brief missing unsealed decision.");
  }

  if (!brief.body.text.includes("Protected packet required")) {
    throw new Error("QA activation seal brief missing protected packet rule.");
  }

  console.log("pass QA activation seal");
}

async function checkQaProofPromotion() {
  const result = await request("/api/qa-evidence/proof-promotion");
  requireStatus("QA proof promotion", result.response.status, 200);
  requireContentType("QA proof promotion", result.response, "application/json");
  requireQaProofPromotionBoundary("QA proof promotion", result.response);
  const body = requireJson("QA proof promotion", result.body);
  const serialized = JSON.stringify(body);

  if (body.service !== "scrimed-manual-qa-proof-promotion") {
    throw new Error(`QA proof promotion expected scrimed-manual-qa-proof-promotion but received ${body.service}.`);
  }

  if (body.status !== "manual-aal2-qa-proof-promotion-gate-ready") {
    throw new Error(`QA proof promotion expected ready status but received ${body.status}.`);
  }

  if (body.promotionDecisionState !== "pending-retained-packet") {
    throw new Error(`QA proof promotion expected pending-retained-packet public state but received ${body.promotionDecisionState}.`);
  }

  if (body.promotionAllowed !== false) {
    throw new Error("QA proof promotion must not allow public/default promotion before retained packet visibility.");
  }

  if (!Array.isArray(body.rules) || body.rules.length < 5) {
    throw new Error("QA proof promotion expected rule coverage.");
  }

  if (!Array.isArray(body.blockedClaims) || !body.blockedClaims.includes("live clinical care authorized")) {
    throw new Error("QA proof promotion expected live clinical care to remain a blocked claim.");
  }

  if (!body.decision?.buyerProofLanguage?.includes("not retained authenticated QA proof")) {
    throw new Error("QA proof promotion default decision must preserve not-retained proof language.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serialized)) {
    throw new Error("QA proof promotion response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serialized)) {
    throw new Error("QA proof promotion response must not contain bearer-token material.");
  }

  const brief = await request("/api/qa-evidence/proof-promotion/brief");
  requireStatus("QA proof promotion brief", brief.response.status, 200);
  requireContentType("QA proof promotion brief", brief.response, "text/markdown");
  requireQaProofPromotionBoundary("QA proof promotion brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Manual QA Proof Promotion Brief")) {
    throw new Error("QA proof promotion brief missing heading.");
  }

  if (!brief.body.text.includes("pending-retained-packet")) {
    throw new Error("QA proof promotion brief missing pending retained-packet state.");
  }

  if (!brief.body.text.includes("Retained packet hash required")) {
    throw new Error("QA proof promotion brief missing retained packet hash rule.");
  }

  console.log("pass QA proof promotion");
}

async function checkQaBuyerProofRelease() {
  const result = await request("/api/qa-evidence/buyer-proof-release");
  requireStatus("QA buyer proof release", result.response.status, 200);
  requireContentType("QA buyer proof release", result.response, "application/json");
  requireQaBuyerProofReleaseBoundary("QA buyer proof release", result.response);
  const body = requireJson("QA buyer proof release", result.body);
  const serialized = JSON.stringify(body);

  if (body.service !== "scrimed-qa-buyer-proof-release") {
    throw new Error(`QA buyer proof release expected scrimed-qa-buyer-proof-release but received ${body.service}.`);
  }

  if (body.status !== "manual-aal2-qa-buyer-proof-release-gate-ready") {
    throw new Error(`QA buyer proof release expected ready status but received ${body.status}.`);
  }

  if (body.releaseDecisionState !== "locked-retained-packet-required") {
    throw new Error(`QA buyer proof release expected locked-retained-packet-required but received ${body.releaseDecisionState}.`);
  }

  if (body.buyerDiligenceExportAllowed !== false || body.protectedVerificationRequired !== true) {
    throw new Error("QA buyer proof release must block public/default buyer export and require protected verification.");
  }

  if (body.externalDistributionAllowed !== false || body.publicClaimAllowed !== false) {
    throw new Error("QA buyer proof release must block external distribution and public claims.");
  }

  if (!Array.isArray(body.requiredEvidence) || body.requiredEvidence.length < 10) {
    throw new Error("QA buyer proof release expected required evidence coverage.");
  }

  if (!Array.isArray(body.hardStops) || !body.hardStops.some((stop) => stop.includes("PHI"))) {
    throw new Error("QA buyer proof release expected PHI hard-stop coverage.");
  }

  if (!Array.isArray(body.blockedClaims) || !body.blockedClaims.includes("SCRIMED can process production PHI")) {
    throw new Error("QA buyer proof release expected production PHI blocked claim.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serialized)) {
    throw new Error("QA buyer proof release response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serialized)) {
    throw new Error("QA buyer proof release response must not contain bearer-token material.");
  }

  const blocked = await postJson("/api/qa-evidence/buyer-proof-release", {
    claim: "SCRIMED is HIPAA certified with live clinical care authorized and reimbursement guaranteed."
  });
  requireStatus("QA buyer proof release blocked authority claim", blocked.response.status, 409);
  requireContentType("QA buyer proof release blocked authority claim", blocked.response, "application/json");
  requireQaBuyerProofReleaseBoundary("QA buyer proof release blocked authority claim", blocked.response);
  const blockedBody = requireJson("QA buyer proof release blocked authority claim", blocked.body);

  if (
    blockedBody.releaseDecisionState !== "blocked-boundary-violation" ||
    blockedBody.buyerDiligenceExportAllowed !== false
  ) {
    throw new Error("QA buyer proof release expected authority claim to remain blocked.");
  }

  const candidate = await postJson("/api/qa-evidence/buyer-proof-release", {
    workflowRunId: "1234567890",
    workflowRunUrl: "https://github.com/temitayodahunsi777/scrimed-site/actions/runs/1234567890",
    packetSha256: "b".repeat(64),
    packetAuditEventId: "22222222-2222-4222-8222-222222222222",
    protectedWorkspaceSlug: "atlas-synthetic-evaluation",
    proofPromotionState: "ready-for-buyer-diligence",
    activationSealState: "sealed-for-buyer-diligence",
    claimDecisionState: "requires-retained-packet",
    operatorAttestation: "no-secrets-no-phi-aal2-human-run",
    tokenDisposalAttestation: "temporary-token-deleted-or-rotated",
    dataBoundary: "synthetic-business-workflow-only"
  });
  requireStatus("QA buyer proof release candidate", candidate.response.status, 200);
  requireContentType("QA buyer proof release candidate", candidate.response, "application/json");
  requireQaBuyerProofReleaseBoundary("QA buyer proof release candidate", candidate.response);
  const candidateBody = requireJson("QA buyer proof release candidate", candidate.body);

  if (
    candidateBody.releaseDecisionState !== "candidate-ready-protected-verification-required" ||
    candidateBody.candidateComplete !== true ||
    candidateBody.buyerDiligenceExportAllowed !== false ||
    candidateBody.protectedVerificationRequired !== true
  ) {
    throw new Error("QA buyer proof release candidate must remain protected-verification-only.");
  }

  const brief = await request("/api/qa-evidence/buyer-proof-release/brief");
  requireStatus("QA buyer proof release brief", brief.response.status, 200);
  requireContentType("QA buyer proof release brief", brief.response, "text/markdown");
  requireQaBuyerProofReleaseBoundary("QA buyer proof release brief", brief.response);

  if (!brief.body.text.includes("SCRIMED QA Buyer Proof Release Brief")) {
    throw new Error("QA buyer proof release brief missing heading.");
  }

  if (!brief.body.text.includes("locked-retained-packet-required")) {
    throw new Error("QA buyer proof release brief missing locked retained-packet state.");
  }

  if (!brief.body.text.includes("Protected release route")) {
    throw new Error("QA buyer proof release brief missing protected release route.");
  }

  console.log("pass QA buyer proof release");
}

async function checkBuyerReleaseControlRun() {
  const result = await request("/api/buyer-release-control-run");
  requireStatus("Buyer release-control runbook", result.response.status, 200);
  requireContentType("Buyer release-control runbook", result.response, "application/json");
  requireBuyerReleaseControlRunBoundary("Buyer release-control runbook", result.response);
  const body = requireJson("Buyer release-control runbook", result.body);
  const serialized = JSON.stringify(body);

  if (body.service !== "scrimed-buyer-release-control-runbook") {
    throw new Error(`Buyer release-control runbook expected service scrimed-buyer-release-control-runbook but received ${body.service}.`);
  }

  if (body.status !== "buyer-release-control-runbook-ready") {
    throw new Error(`Buyer release-control runbook expected ready status but received ${body.status}.`);
  }

  if (body.executionDecision !== "runbook-ready-protected-aal2-required") {
    throw new Error(`Buyer release-control runbook expected protected AAL2 execution decision but received ${body.executionDecision}.`);
  }

  if (body.shareDecision !== "internal-only-until-release-chain-retained") {
    throw new Error(`Buyer release-control runbook expected internal-only share decision but received ${body.shareDecision}.`);
  }

  if (body.protectedVerifierRoute !== "/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run") {
    throw new Error("Buyer release-control runbook expected protected verifier route.");
  }

  if (body.protectedVerifierPacketRoute !== "/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/packet") {
    throw new Error("Buyer release-control runbook expected protected verifier packet route.");
  }

  if (body.protectedVerifierTimelineRoute !== "/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/timeline") {
    throw new Error("Buyer release-control runbook expected protected verifier timeline route.");
  }
  if (body.operatorRunScript !== "scripts/buyer-proof-release-operator-run.mjs") {
    throw new Error("Buyer release-control runbook expected buyer proof operator run script.");
  }
  if (
    body.operatorRunStatus !==
    "aal2-buyer-proof-release-operator-run-script-token-boundary"
  ) {
    throw new Error("Buyer release-control runbook expected buyer proof operator run token boundary.");
  }

  if (!Array.isArray(body.steps) || body.steps.length < 8) {
    throw new Error("Buyer release-control runbook expected release-control step coverage.");
  }

  if (!Array.isArray(body.requiredExternalApprovalDomains) || body.requiredExternalApprovalDomains.length < 7) {
    throw new Error("Buyer release-control runbook expected external approval domain coverage.");
  }

  if (!Array.isArray(body.requiredReviewerRoles) || body.requiredReviewerRoles.length < 7) {
    throw new Error("Buyer release-control runbook expected reviewer role coverage.");
  }

  if (!Array.isArray(body.requiredReleaseAuthorityDomains) || body.requiredReleaseAuthorityDomains.length < 7) {
    throw new Error("Buyer release-control runbook expected release authority domain coverage.");
  }

  if (!Array.isArray(body.blockedClaims) || !body.blockedClaims.some((claim) => claim.includes("production PHI"))) {
    throw new Error("Buyer release-control runbook expected production PHI blocked claim.");
  }

  if (!Array.isArray(body.workarounds) || !body.workarounds.some((workaround) => workaround.includes("bearer token"))) {
    throw new Error("Buyer release-control runbook expected bearer-token workaround guidance.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serialized)) {
    throw new Error("Buyer release-control runbook response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serialized)) {
    throw new Error("Buyer release-control runbook response must not contain bearer-token material.");
  }

  const brief = await request("/api/buyer-release-control-run/brief");
  requireStatus("Buyer release-control runbook brief", brief.response.status, 200);
  requireContentType("Buyer release-control runbook brief", brief.response, "text/markdown");
  requireBuyerReleaseControlRunBoundary("Buyer release-control runbook brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Buyer Release Control Runbook")) {
    throw new Error("Buyer release-control runbook brief missing heading.");
  }

  if (!brief.body.text.includes("not release approval")) {
    throw new Error("Buyer release-control runbook brief missing not-release-approval boundary.");
  }

  if (!brief.body.text.includes("protected AAL2 run")) {
    throw new Error("Buyer release-control runbook brief missing protected AAL2 run boundary.");
  }

  console.log("pass Buyer release-control runbook");
}

async function checkQaManualExecutionConsole() {
  const result = await request("/api/qa-evidence/manual-execution-console");
  requireStatus("QA manual execution console", result.response.status, 200);
  requireContentType("QA manual execution console", result.response, "application/json");
  requireQaManualExecutionConsoleBoundary("QA manual execution console", result.response);
  const body = requireJson("QA manual execution console", result.body);
  const serialized = JSON.stringify(body);

  if (body.service !== "scrimed-manual-aal2-qa-execution-console") {
    throw new Error(`QA manual execution console expected service scrimed-manual-aal2-qa-execution-console but received ${body.service}.`);
  }

  if (body.status !== "manual-aal2-qa-execution-console-ready") {
    throw new Error(`QA manual execution console expected ready status but received ${body.status}.`);
  }

  if (body.consoleState !== "operator-aal2-run-required") {
    throw new Error(`QA manual execution console expected operator-aal2-run-required but received ${body.consoleState}.`);
  }

  if (body.publicSummaryOnly !== true || body.protectedExecutionRequired !== true) {
    throw new Error("QA manual execution console public API must remain summary-only and protected-execution-required.");
  }

  if (body.buyerProofReleaseReady !== false) {
    throw new Error("QA manual execution console public API must not mark buyer proof release ready.");
  }

  if (!Array.isArray(body.workflows) || body.workflows.length < 3) {
    throw new Error("QA manual execution console expected workflow coverage.");
  }

  if (!Array.isArray(body.stages) || body.stages.length < 6) {
    throw new Error("QA manual execution console expected stage coverage.");
  }

  if (!Array.isArray(body.hardStops) || !body.hardStops.some((stop) => stop.includes("PHI"))) {
    throw new Error("QA manual execution console expected PHI hard-stop coverage.");
  }

  if (!Array.isArray(body.blockedAuthorityClaims) || !body.blockedAuthorityClaims.some((claim) => claim.includes("production PHI"))) {
    throw new Error("QA manual execution console expected production PHI blocked claim.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serialized)) {
    throw new Error("QA manual execution console response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serialized)) {
    throw new Error("QA manual execution console response must not contain bearer-token material.");
  }

  const brief = await request("/api/qa-evidence/manual-execution-console/brief");
  requireStatus("QA manual execution console brief", brief.response.status, 200);
  requireContentType("QA manual execution console brief", brief.response, "text/markdown");
  requireQaManualExecutionConsoleBoundary("QA manual execution console brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Manual QA Execution Console Brief")) {
    throw new Error("QA manual execution console brief missing heading.");
  }

  if (!brief.body.text.includes("operator-aal2-run-required")) {
    throw new Error("QA manual execution console brief missing operator AAL2 required state.");
  }

  if (!brief.body.text.includes("Protected console")) {
    throw new Error("QA manual execution console brief missing protected console route.");
  }

  console.log("pass QA manual execution console");
}

async function checkQaAal2RunEvidence() {
  const result = await request("/api/qa-evidence/aal2-run-evidence");
  requireStatus("QA AAL2 run evidence", result.response.status, 200);
  requireContentType("QA AAL2 run evidence", result.response, "application/json");
  requireQaAal2RunEvidenceBoundary("QA AAL2 run evidence", result.response);
  const body = requireJson("QA AAL2 run evidence", result.body);
  const serialized = JSON.stringify(body);

  if (body.service !== "scrimed-aal2-synthetic-qa-run-evidence") {
    throw new Error(`QA AAL2 run evidence expected service scrimed-aal2-synthetic-qa-run-evidence but received ${body.service}.`);
  }

  if (body.status !== "protected-aal2-synthetic-qa-evidence-package-ready") {
    throw new Error(`QA AAL2 run evidence expected package-ready status but received ${body.status}.`);
  }

  if (body.runState !== "protected-aal2-human-run-required") {
    throw new Error(`QA AAL2 run evidence expected protected-aal2-human-run-required but received ${body.runState}.`);
  }

  if (body.recommendation !== "NO-GO-buyer-proof-release") {
    throw new Error(`QA AAL2 run evidence expected NO-GO buyer proof release but received ${body.recommendation}.`);
  }

  if (body.buyerProofReleaseAllowed !== false || body.protectedHumanRunRequired !== true) {
    throw new Error("QA AAL2 run evidence public API must require protected human run and block buyer proof release.");
  }

  if (body.syntheticDataConfirmed !== true || body.phiEnteredSystem !== false) {
    throw new Error("QA AAL2 run evidence must confirm synthetic-only and no-PHI posture.");
  }

  if (body.productionSystemsTouched !== false || body.livePatientWorkflowTriggered !== false || body.autonomousClinicalActionPerformed !== false) {
    throw new Error("QA AAL2 run evidence must not touch production, live patient workflows, or autonomous clinical action.");
  }

  if (!Array.isArray(body.categories) || body.categories.length < 9) {
    throw new Error("QA AAL2 run evidence expected all required test categories.");
  }

  for (const requiredCategory of [
    "Clinical summary generation",
    "Missing-data handling",
    "Evidence attribution and traceability",
    "Escalation behavior",
    "Refusal behavior",
    "Boundary enforcement",
    "Human approval requirements",
    "Audit logging",
    "QA packet generation"
  ]) {
    if (!body.categories.some((category) => category.name === requiredCategory)) {
      throw new Error(`QA AAL2 run evidence missing category ${requiredCategory}.`);
    }
  }

  if (!Array.isArray(body.boundaryChecks) || !body.boundaryChecks.some((check) => check.check === "No PHI entered system")) {
    throw new Error("QA AAL2 run evidence expected no-PHI boundary check.");
  }

  if (!Array.isArray(body.remainingBlockers) || !body.remainingBlockers.some((blocker) => blocker.includes("Fresh human AAL2"))) {
    throw new Error("QA AAL2 run evidence expected human AAL2 blocker.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serialized)) {
    throw new Error("QA AAL2 run evidence response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serialized)) {
    throw new Error("QA AAL2 run evidence response must not contain bearer-token material.");
  }

  const brief = await request("/api/qa-evidence/aal2-run-evidence/brief");
  requireStatus("QA AAL2 run evidence brief", brief.response.status, 200);
  requireContentType("QA AAL2 run evidence brief", brief.response, "text/markdown");
  requireQaAal2RunEvidenceBoundary("QA AAL2 run evidence brief", brief.response);

  if (!brief.body.text.includes("SCRIMED AAL2 Synthetic QA Run Evidence Package")) {
    throw new Error("QA AAL2 run evidence brief missing heading.");
  }

  if (!brief.body.text.includes("NO-GO-buyer-proof-release")) {
    throw new Error("QA AAL2 run evidence brief missing NO-GO recommendation.");
  }

  if (!brief.body.text.includes("Clinical summary generation")) {
    throw new Error("QA AAL2 run evidence brief missing clinical summary category.");
  }

  const readiness = await request("/api/qa-evidence/aal2-smoke-readiness");
  requireStatus("QA AAL2 smoke readiness", readiness.response.status, 200);
  requireContentType("QA AAL2 smoke readiness", readiness.response, "application/json");
  requireQaAal2RunEvidenceBoundary("QA AAL2 smoke readiness", readiness.response);
  const readinessBody = requireJson("QA AAL2 smoke readiness", readiness.body);
  const readinessSerialized = JSON.stringify(readinessBody);

  if (readinessBody.service !== "scrimed-aal2-smoke-readiness") {
    throw new Error(`QA AAL2 smoke readiness expected service scrimed-aal2-smoke-readiness but received ${readinessBody.service}.`);
  }

  if (readinessBody.status !== "aal2-smoke-readiness-preflight-ready-no-secret") {
    throw new Error(`QA AAL2 smoke readiness expected no-secret preflight-ready status but received ${readinessBody.status}.`);
  }

  if (readinessBody.strictAttemptReady !== false || readinessBody.protectedHumanRunRequired !== true) {
    throw new Error("QA AAL2 smoke readiness must keep strict smoke blocked until human AAL2 token is supplied.");
  }

  if (readinessBody.tokenMaterialStored !== false || readinessBody.tokenMaterialPrinted !== false) {
    throw new Error("QA AAL2 smoke readiness must not store or print token material.");
  }

  if (!Array.isArray(readinessBody.commands) || !readinessBody.commands.includes("npm run smoke:aal2:readiness")) {
    throw new Error("QA AAL2 smoke readiness missing readiness command.");
  }

  if (!readinessBody.commands.includes("npm run smoke:aal2:durable-store:strict")) {
    throw new Error("QA AAL2 smoke readiness missing strict durable-store smoke command.");
  }

  if (!Array.isArray(readinessBody.gates) || !readinessBody.gates.some((gate) => gate.id === "aal2-bearer-token")) {
    throw new Error("QA AAL2 smoke readiness missing AAL2 bearer-token gate.");
  }

  if (!Array.isArray(readinessBody.failureModes) || !readinessBody.failureModes.some((failureMode) => failureMode.includes("Missing SCRIMED_BEARER_TOKEN"))) {
    throw new Error("QA AAL2 smoke readiness missing missing-token fail-closed mode.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(readinessSerialized)) {
    throw new Error("QA AAL2 smoke readiness response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(readinessSerialized)) {
    throw new Error("QA AAL2 smoke readiness response must not contain bearer-token material.");
  }

  const readinessBrief = await request("/api/qa-evidence/aal2-smoke-readiness/brief");
  requireStatus("QA AAL2 smoke readiness brief", readinessBrief.response.status, 200);
  requireContentType("QA AAL2 smoke readiness brief", readinessBrief.response, "text/markdown");
  requireQaAal2RunEvidenceBoundary("QA AAL2 smoke readiness brief", readinessBrief.response);

  if (!readinessBrief.body.text.includes("SCRIMED AAL2 Smoke Readiness Preflight")) {
    throw new Error("QA AAL2 smoke readiness brief missing heading.");
  }

  if (!readinessBrief.body.text.includes("npm run smoke:aal2:readiness")) {
    throw new Error("QA AAL2 smoke readiness brief missing readiness command.");
  }

  if (!readinessBrief.body.text.includes("no-secret operator preflight")) {
    throw new Error("QA AAL2 smoke readiness brief missing no-secret boundary.");
  }

  console.log("pass QA AAL2 run evidence");
}

async function checkClinicalCareActivation() {
  const result = await request("/api/clinical-care-activation");
  requireStatus("Clinical care activation", result.response.status, 200);
  requireContentType("Clinical care activation", result.response, "application/json");
  requireSyntheticBoundary("Clinical care activation", result.response);
  requireNoClinicalCareAuthority("Clinical care activation", result.response);
  const body = requireJson("Clinical care activation", result.body);

  if (body.service !== "scrimed-clinical-care-activation") {
    throw new Error(`Clinical care activation expected service scrimed-clinical-care-activation but received ${body.service}.`);
  }

  if (body.status !== "clinical-care-activation-gated") {
    throw new Error(`Clinical care activation expected clinical-care-activation-gated but received ${body.status}.`);
  }

  if (body.careExecutionAuthority !== "not-authorized-live-care") {
    throw new Error("Clinical care activation must not authorize live clinical care.");
  }

  if (body.proofStackStatus !== "clinical-care-activation-readiness-gated") {
    throw new Error("Clinical care activation missing proof-stack status.");
  }

  if (!Array.isArray(body.gates) || body.gates.length < 12) {
    throw new Error("Clinical care activation expected at least twelve hard gates.");
  }

  if (!Array.isArray(body.blockedCapabilities) || !body.blockedCapabilities.includes("live diagnosis")) {
    throw new Error("Clinical care activation expected live diagnosis to remain blocked.");
  }

  if (body.readinessScore >= 100) {
    throw new Error("Clinical care activation must not report full clinical readiness.");
  }

  const brief = await request("/api/clinical-care-activation/brief");
  requireStatus("Clinical care activation brief", brief.response.status, 200);
  requireContentType("Clinical care activation brief", brief.response, "text/markdown");
  requireSyntheticBoundary("Clinical care activation brief", brief.response);
  requireNoClinicalCareAuthority("Clinical care activation brief", brief.response);

  if (!brief.body.text.includes("Care execution authority: not-authorized-live-care")) {
    throw new Error("Clinical care activation brief must preserve no-live-care authority.");
  }

  console.log("pass clinical care activation");
}

async function checkPublicMarketReadiness() {
  const result = await request("/api/public-market-readiness");
  requireStatus("Public Market Readiness", result.response.status, 200);
  requireContentType("Public Market Readiness", result.response, "application/json");
  requirePublicMarketBoundary("Public Market Readiness", result.response);
  const body = requireJson("Public Market Readiness", result.body);

  if (body.service !== "scrimed-public-market-readiness") {
    throw new Error(`Public Market Readiness expected scrimed-public-market-readiness but received ${body.service}.`);
  }

  if (body.status !== "capital-efficiency-kpi-stack-ready") {
    throw new Error(`Public Market Readiness expected capital-efficiency-kpi-stack-ready but received ${body.status}.`);
  }

  if (!Array.isArray(body.operatingMetrics) || body.operatingMetrics.length < 10) {
    throw new Error("Public Market Readiness expected at least ten operating metric definitions.");
  }

  if (!body.operatingMetrics.some((metric) => metric.id === "cost-per-workflow")) {
    throw new Error("Public Market Readiness missing cost per workflow KPI.");
  }

  if (!body.operatingMetrics.some((metric) => metric.id === "revenue-protected")) {
    throw new Error("Public Market Readiness missing revenue protected KPI.");
  }

  if (!Array.isArray(body.modelEfficiencyControls) || body.modelEfficiencyControls.length < 4) {
    throw new Error("Public Market Readiness expected model efficiency controls.");
  }

  if (
    body.protectedOperatorMetricStatus !==
    "aal2-protected-operator-metric-capture-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected operator metric status.");
  }

  if (
    body.protectedOperatorMetricApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/operator-metrics"
  ) {
    throw new Error("Public Market Readiness missing protected operator metric API route.");
  }

  if (
    body.protectedMetricRollupStatus !==
    "aal2-finance-reviewed-metric-rollups-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected metric rollup status.");
  }

  if (
    body.protectedMetricRollupApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/metric-rollups"
  ) {
    throw new Error("Public Market Readiness missing protected metric rollup API route.");
  }

  if (
    body.protectedMetricRollupPacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/metric-rollups/{snapshotId}/packet"
  ) {
    throw new Error("Public Market Readiness missing protected metric rollup packet API route.");
  }

  if (
    body.protectedMetricTrendStatus !==
    "aal2-board-trend-review-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected metric trend status.");
  }

  if (
    body.protectedMetricTrendApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/metric-trends"
  ) {
    throw new Error("Public Market Readiness missing protected metric trend API route.");
  }

  if (
    body.protectedMetricTrendPacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/metric-trends/{reviewId}/packet"
  ) {
    throw new Error("Public Market Readiness missing protected metric trend packet API route.");
  }

  if (
    body.protectedBoardScorecardStatus !==
    "aal2-rolling-quarter-board-scorecards-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected board scorecard status.");
  }

  if (
    body.protectedBoardScorecardApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/board-scorecards"
  ) {
    throw new Error("Public Market Readiness missing protected board scorecard API route.");
  }

  if (
    body.protectedBoardScorecardPacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/board-scorecards/{scorecardId}/packet"
  ) {
    throw new Error("Public Market Readiness missing protected board scorecard packet API route.");
  }

  if (
    body.protectedFinanceMethodologyStatus !==
    "aal2-finance-methodology-gates-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected finance methodology status.");
  }

  if (
    body.protectedFinanceMethodologyApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/finance-methodology"
  ) {
    throw new Error("Public Market Readiness missing protected finance methodology API route.");
  }

  if (
    body.protectedFinanceMethodologyPacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/finance-methodology/packet"
  ) {
    throw new Error("Public Market Readiness missing protected finance methodology packet API route.");
  }

  if (
    body.protectedExternalApprovalEvidenceStatus !==
    "aal2-qualified-external-approval-evidence-links-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected external approval evidence status.");
  }

  if (
    body.protectedExternalApprovalEvidenceApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/external-approval-evidence"
  ) {
    throw new Error("Public Market Readiness missing protected external approval evidence API route.");
  }

  if (
    body.protectedExternalApprovalEvidencePacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/external-approval-evidence/packet"
  ) {
    throw new Error("Public Market Readiness missing protected external approval evidence packet API route.");
  }

  if (
    body.protectedReleaseDecisionStatus !==
    "aal2-qualified-release-decision-workflow-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected release decision workflow status.");
  }

  if (
    body.protectedReleaseDecisionApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/release-decisions"
  ) {
    throw new Error("Public Market Readiness missing protected release decision API route.");
  }

  if (
    body.protectedReleaseDecisionPacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/release-decisions/packet"
  ) {
    throw new Error("Public Market Readiness missing protected release decision packet API route.");
  }

  if (
    body.protectedNamedReviewerSignoffStatus !==
    "aal2-named-reviewer-signoff-metadata-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected named reviewer sign-off status.");
  }

  if (
    body.protectedNamedReviewerSignoffApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/reviewer-signoffs"
  ) {
    throw new Error("Public Market Readiness missing protected named reviewer sign-off API route.");
  }

  if (
    body.protectedNamedReviewerSignoffPacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/reviewer-signoffs/packet"
  ) {
    throw new Error("Public Market Readiness missing protected named reviewer sign-off packet API route.");
  }

  if (
    body.protectedDistributionLockboxStatus !==
    "aal2-external-distribution-lockbox-disabled-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected distribution lockbox status.");
  }

  if (
    body.protectedDistributionLockboxApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/distribution-lockbox"
  ) {
    throw new Error("Public Market Readiness missing protected distribution lockbox API route.");
  }

  if (
    body.protectedDistributionLockboxPacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/distribution-lockbox/packet"
  ) {
    throw new Error("Public Market Readiness missing protected distribution lockbox packet API route.");
  }

  if (
    body.protectedReleaseAuthorityAttestationStatus !==
    "aal2-external-release-authority-attestations-disabled-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected release authority attestation status.");
  }

  if (
    body.protectedReleaseAuthorityAttestationApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/release-authority-attestations"
  ) {
    throw new Error("Public Market Readiness missing protected release authority attestation API route.");
  }

  if (
    body.protectedReleaseAuthorityAttestationPacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/release-authority-attestations/packet"
  ) {
    throw new Error(
      "Public Market Readiness missing protected release authority attestation packet API route."
    );
  }

  if (
    body.protectedEvidenceRoomRecipientAttestationStatus !==
    "aal2-evidence-room-recipient-attestations-disabled-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected evidence-room recipient attestation status.");
  }

  if (
    body.protectedEvidenceRoomRecipientAttestationApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/evidence-room-recipient-attestations"
  ) {
    throw new Error("Public Market Readiness missing protected evidence-room recipient attestation API route.");
  }

  if (
    body.protectedEvidenceRoomRecipientAttestationPacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/evidence-room-recipient-attestations/packet"
  ) {
    throw new Error(
      "Public Market Readiness missing protected evidence-room recipient attestation packet API route."
    );
  }

  if (
    body.protectedEvidenceRoomAccessLogReconciliationStatus !==
    "aal2-evidence-room-access-log-reconciliation-disabled-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected evidence-room access-log reconciliation status.");
  }

  if (
    body.protectedEvidenceRoomAccessLogReconciliationApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/evidence-room-access-log-reconciliation"
  ) {
    throw new Error(
      "Public Market Readiness missing protected evidence-room access-log reconciliation API route."
    );
  }

  if (
    body.protectedEvidenceRoomAccessLogReconciliationPacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/evidence-room-access-log-reconciliation/packet"
  ) {
    throw new Error(
      "Public Market Readiness missing protected evidence-room access-log reconciliation packet API route."
    );
  }

  if (
    body.protectedEvidenceRoomProviderAdapterStatus !==
    "aal2-evidence-room-provider-adapter-contracts-disabled-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected evidence-room provider adapter status.");
  }

  if (
    body.protectedEvidenceRoomProviderAdapterApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/evidence-room-provider-adapters"
  ) {
    throw new Error("Public Market Readiness missing protected evidence-room provider adapter API route.");
  }

  if (
    body.protectedEvidenceRoomProviderAdapterPacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/evidence-room-provider-adapters/packet"
  ) {
    throw new Error(
      "Public Market Readiness missing protected evidence-room provider adapter packet API route."
    );
  }

  if (
    body.protectedProviderSecurityReviewStatus !==
    "aal2-provider-security-review-workbench-no-phi"
  ) {
    throw new Error("Public Market Readiness missing protected provider security review status.");
  }

  if (
    body.protectedProviderSecurityReviewApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/provider-security-reviews"
  ) {
    throw new Error("Public Market Readiness missing protected provider security review API route.");
  }

  if (
    body.protectedProviderSecurityReviewPacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/provider-security-reviews/packet"
  ) {
    throw new Error(
      "Public Market Readiness missing protected provider security review packet API route."
    );
  }

  if (
    body.protectedProcurementEvidenceRegistryStatus !==
    "aal2-procurement-evidence-registry-no-sensitive-artifacts"
  ) {
    throw new Error("Public Market Readiness missing protected procurement evidence registry status.");
  }

  if (
    body.protectedProcurementEvidenceRegistryApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/procurement-evidence"
  ) {
    throw new Error("Public Market Readiness missing protected procurement evidence registry API route.");
  }

  if (
    body.protectedProcurementEvidenceRegistryPacketApiRoute !==
    "/api/pilot-workspaces/{workspaceSlug}/procurement-evidence/packet"
  ) {
    throw new Error(
      "Public Market Readiness missing protected procurement evidence registry packet API route."
    );
  }

  const brief = await request("/api/public-market-readiness/brief");
  requireStatus("Public Market Readiness brief", brief.response.status, 200);
  requireContentType("Public Market Readiness brief", brief.response, "text/markdown");
  requirePublicMarketBoundary("Public Market Readiness brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Public Market Readiness Brief")) {
    throw new Error("Public Market Readiness brief missing heading.");
  }

  if (!brief.body.text.includes("not audited financial reporting")) {
    throw new Error("Public Market Readiness brief missing financial boundary.");
  }

  console.log("pass public market readiness");
}

async function checkGlobalReach() {
  const result = await request("/api/global-reach");
  requireStatus("Global Reach", result.response.status, 200);
  requireContentType("Global Reach", result.response, "application/json");
  requireGlobalReachBoundary("Global Reach", result.response);
  const body = requireJson("Global Reach", result.body);

  if (body.service !== "scrimed-global-partner-localization") {
    throw new Error(`Global Reach expected scrimed-global-partner-localization but received ${body.service}.`);
  }

  if (body.status !== "global-partner-localization-layer-ready") {
    throw new Error(`Global Reach expected global-partner-localization-layer-ready but received ${body.status}.`);
  }

  if (!Array.isArray(body.regions) || body.regions.length < 8) {
    throw new Error("Global Reach expected at least eight region focus packs.");
  }

  if (!Array.isArray(body.buyerPacks) || body.buyerPacks.length < 7) {
    throw new Error("Global Reach expected at least seven buyer localization packs.");
  }

  if (!Array.isArray(body.boundaryResolutions) || body.boundaryResolutions.length < 8) {
    throw new Error("Global Reach expected boundary resolution coverage.");
  }

  if (!body.boundaryResolutions.every((resolution) => resolution.status === "contained-with-workaround")) {
    throw new Error("Global Reach expected all known boundaries to be contained with workarounds.");
  }

  if (!Array.isArray(body.competitiveEdges) || body.competitiveEdges.length < 5) {
    throw new Error("Global Reach expected at least five competitive edge pillars.");
  }

  const brief = await request("/api/global-reach/brief");
  requireStatus("Global Reach brief", brief.response.status, 200);
  requireContentType("Global Reach brief", brief.response, "text/markdown");
  requireGlobalReachBoundary("Global Reach brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Global Partner And Buyer Localization Brief")) {
    throw new Error("Global Reach brief missing heading.");
  }

  if (!brief.body.text.includes("not legal advice")) {
    throw new Error("Global Reach brief missing legal boundary.");
  }

  console.log("pass global reach");
}

async function checkGlobalEnterpriseCommand() {
  const result = await request("/api/global-enterprise-command");
  requireStatus("Global Enterprise Command", result.response.status, 200);
  requireContentType("Global Enterprise Command", result.response, "application/json");
  requireGlobalEnterpriseCommandBoundary("Global Enterprise Command", result.response);
  const body = requireJson("Global Enterprise Command", result.body);

  if (body.service !== "scrimed-global-enterprise-command") {
    throw new Error(`Global Enterprise Command expected scrimed-global-enterprise-command but received ${body.service}.`);
  }

  if (body.status !== "global-enterprise-command-active-no-production-authority") {
    throw new Error(`Global Enterprise Command expected active no-production-authority status but received ${body.status}.`);
  }

  if (body.authority?.globalAuthority !== "readiness-only-not-legal-approval") {
    throw new Error("Global Enterprise Command must preserve readiness-only global authority.");
  }

  if (body.authority?.communicationAuthority !== "human-reviewed-templates-only") {
    throw new Error("Global Enterprise Command must preserve human-reviewed communication authority.");
  }

  if (body.authority?.interoperabilityAuthority !== "synthetic-conformance-only") {
    throw new Error("Global Enterprise Command must preserve synthetic conformance-only interoperability authority.");
  }

  if (!Array.isArray(body.regionalCommands) || body.regionalCommands.length < 8) {
    throw new Error("Global Enterprise Command expected regional command coverage.");
  }

  if (!Array.isArray(body.salesPlaybooks) || body.salesPlaybooks.length < 7) {
    throw new Error("Global Enterprise Command expected buyer sales playbook coverage.");
  }

  if (!Array.isArray(body.interoperabilityLanes) || body.interoperabilityLanes.length < 8) {
    throw new Error("Global Enterprise Command expected interoperability lane coverage.");
  }

  if (!Array.isArray(body.communicationLanes) || body.communicationLanes.length < 4) {
    throw new Error("Global Enterprise Command expected communication lane coverage.");
  }

  if (!body.communicationLanes.every((lane) => lane.humanReviewRequired === true)) {
    throw new Error("Global Enterprise Command expected every communication lane to require human review.");
  }

  if (!Array.isArray(body.scorecards) || body.scorecards.length < 4) {
    throw new Error("Global Enterprise Command expected scorecard coverage.");
  }

  if (!Array.isArray(body.blockedClaims) || body.blockedClaims.length < 10) {
    throw new Error("Global Enterprise Command expected blocked-claim coverage.");
  }

  const brief = await request("/api/global-enterprise-command/brief");
  requireStatus("Global Enterprise Command brief", brief.response.status, 200);
  requireContentType("Global Enterprise Command brief", brief.response, "text/markdown");
  requireGlobalEnterpriseCommandBoundary("Global Enterprise Command brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Global Enterprise Command Brief")) {
    throw new Error("Global Enterprise Command brief missing heading.");
  }

  if (!brief.body.text.includes("does not authorize live PHI")) {
    throw new Error("Global Enterprise Command brief missing live PHI boundary.");
  }

  console.log("pass global enterprise command");
}

async function checkProductServicePortfolio() {
  const result = await request("/api/offerings");
  requireStatus("Product Service Portfolio", result.response.status, 200);
  requireContentType("Product Service Portfolio", result.response, "application/json");
  requireProductServicePortfolioBoundary("Product Service Portfolio", result.response);
  const body = requireJson("Product Service Portfolio", result.body);

  if (body.service !== "scrimed-product-service-portfolio") {
    throw new Error(`Product Service Portfolio expected scrimed-product-service-portfolio but received ${body.service}.`);
  }

  if (body.status !== "product-service-portfolio-upgrade-active") {
    throw new Error(`Product Service Portfolio expected active status but received ${body.status}.`);
  }

  if (!Array.isArray(body.productServiceOfferings) || body.productServiceOfferings.length < 10) {
    throw new Error("Product Service Portfolio expected at least ten offers.");
  }

  if (!Array.isArray(body.productServicePackages) || body.productServicePackages.length < 5) {
    throw new Error("Product Service Portfolio expected at least five packages.");
  }

  if (!Array.isArray(body.productServiceMarginControls) || body.productServiceMarginControls.length < 8) {
    throw new Error("Product Service Portfolio expected margin controls.");
  }

  if (!Array.isArray(body.productServiceBoundaryResolutions) || body.productServiceBoundaryResolutions.length < 6) {
    throw new Error("Product Service Portfolio expected boundary resolutions.");
  }

  if (!Array.isArray(body.productServiceDeliveryPlaybooks) || body.productServiceDeliveryPlaybooks.length < 5) {
    throw new Error("Product Service Portfolio expected delivery playbook coverage.");
  }

  if (!body.blockedClaims?.includes("public quantum capability")) {
    throw new Error("Product Service Portfolio expected public quantum capability blocked claim.");
  }

  if (!body.blockedClaims?.includes("production EHR connector approved")) {
    throw new Error("Product Service Portfolio expected production EHR connector blocked claim.");
  }

  if (!body.productServiceOfferings.some((offer) => offer.slug === "continuous-review-innovation-retainer")) {
    throw new Error("Product Service Portfolio expected continuous review innovation retainer.");
  }

  if (!body.productServiceOfferings.some((offer) => offer.slug === "enterprise-operating-layer-license")) {
    throw new Error("Product Service Portfolio expected enterprise operating layer license.");
  }

  const brief = await request("/api/offerings/brief");
  requireStatus("Product Service Portfolio brief", brief.response.status, 200);
  requireContentType("Product Service Portfolio brief", brief.response, "text/markdown");
  requireProductServicePortfolioBoundary("Product Service Portfolio brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Product And Services Portfolio Brief")) {
    throw new Error("Product Service Portfolio brief missing heading.");
  }

  if (!brief.body.text.includes("not legal advice")) {
    throw new Error("Product Service Portfolio brief missing legal boundary.");
  }

  if (!brief.body.text.includes("Continuous Review and Innovation Retainer")) {
    throw new Error("Product Service Portfolio brief missing continuous review retainer.");
  }

  console.log("pass product service portfolio");
}

async function checkServiceDelivery() {
  const result = await request("/api/service-delivery");
  requireStatus("Service Delivery", result.response.status, 200);
  requireContentType("Service Delivery", result.response, "application/json");
  requireServiceDeliveryBoundary("Service Delivery", result.response);
  const body = requireJson("Service Delivery", result.body);

  if (body.service !== "scrimed-service-delivery-workbench") {
    throw new Error(`Service Delivery expected scrimed-service-delivery-workbench but received ${body.service}.`);
  }

  if (body.status !== "service-delivery-workbench-active") {
    throw new Error(`Service Delivery expected active status but received ${body.status}.`);
  }

  if (!Array.isArray(body.serviceDeliveryOffers) || body.serviceDeliveryOffers.length < 7) {
    throw new Error("Service Delivery expected at least seven delivery offers.");
  }

  if (!Array.isArray(body.serviceDeliveryPhases) || body.serviceDeliveryPhases.length < 7) {
    throw new Error("Service Delivery expected at least seven delivery phases.");
  }

  if (!Array.isArray(body.serviceDeliveryWorkOrderTemplates) || body.serviceDeliveryWorkOrderTemplates.length < 8) {
    throw new Error("Service Delivery expected at least eight work-order templates.");
  }

  if (!Array.isArray(body.serviceDeliveryArtifacts) || body.serviceDeliveryArtifacts.length < 7) {
    throw new Error("Service Delivery expected delivery artifacts.");
  }

  if (!Array.isArray(body.serviceDeliveryActivationGates) || body.serviceDeliveryActivationGates.length < 8) {
    throw new Error("Service Delivery expected activation gates.");
  }

  if (!Array.isArray(body.serviceDeliveryPackageBindings) || body.serviceDeliveryPackageBindings.length < 5) {
    throw new Error("Service Delivery expected package bindings.");
  }

  if (!Array.isArray(body.serviceDeliveryLiveActivationMatrix) || body.serviceDeliveryLiveActivationMatrix.length < body.serviceDeliveryOffers.length) {
    throw new Error("Service Delivery expected live service activation matrix for every delivery offer.");
  }

  if (
    !body.serviceDeliveryLiveActivationMatrix.every(
      (plan) =>
        plan.humanReviewRequired === true &&
        plan.productionAuthority === false &&
        plan.salesReadinessScore >= 60 &&
        plan.deliveryReadinessScore >= 60 &&
        plan.revenueReadinessScore >= 60 &&
        plan.supportReadinessScore >= 60
    )
  ) {
    throw new Error("Service Delivery expected activation plans with review gates, readiness scores, and blocked production authority.");
  }

  if (
    !body.serviceDeliveryLiveActivationMatrix.some(
      (plan) =>
        plan.offerSlug === "synthetic-pilot-evaluation-delivery" &&
        plan.activationStatus === "protected-pilot-candidate" &&
        plan.deploymentPosture === "protected_workspace_required"
    )
  ) {
    throw new Error("Service Delivery expected synthetic pilot delivery to remain a protected-pilot candidate.");
  }

  if (
    !body.serviceDeliveryLiveActivationMatrix.every(
      (plan) =>
        Array.isArray(plan.blockedBeforeGoLive) &&
        plan.blockedBeforeGoLive.some((blocker) => blocker.includes("PHI")) &&
        plan.safeLaunchMotion.includes("no-PHI") &&
        plan.supportMotion.includes("do not promise contractual SLA")
    )
  ) {
    throw new Error("Service Delivery expected activation plans to preserve no-PHI, no-SLA, and go-live blockers.");
  }

  if (!body.serviceDeliveryActivationGates.some((gate) => gate.gate === "No-PHI Intake Gate")) {
    throw new Error("Service Delivery expected No-PHI Intake Gate.");
  }

  if (!body.serviceDeliveryActivationGates.some((gate) => gate.gate === "Clinical Action Gate")) {
    throw new Error("Service Delivery expected Clinical Action Gate.");
  }

  if (!body.serviceDeliveryWorkOrderTemplates.some((template) => template.slug === "buyer-proof-packet-release")) {
    throw new Error("Service Delivery expected buyer proof packet release work order.");
  }

  if (!body.hardStops?.some((stop) => stop.includes("No PHI"))) {
    throw new Error("Service Delivery expected no-PHI hard stop.");
  }

  if (!body.hardStops?.some((stop) => stop.includes("No production connector"))) {
    throw new Error("Service Delivery expected production connector hard stop.");
  }

  const brief = await request("/api/service-delivery/brief");
  requireStatus("Service Delivery brief", brief.response.status, 200);
  requireContentType("Service Delivery brief", brief.response, "text/markdown");
  requireServiceDeliveryBoundary("Service Delivery brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Service Delivery Workbench Brief")) {
    throw new Error("Service Delivery brief missing heading.");
  }

  if (!brief.body.text.includes("not a statement of work")) {
    throw new Error("Service Delivery brief missing SOW boundary.");
  }

  if (!brief.body.text.includes("Buyer Proof Packet and Release Control")) {
    throw new Error("Service Delivery brief missing buyer proof release work order.");
  }

  if (!brief.body.text.includes("Live Service Activation Matrix")) {
    throw new Error("Service Delivery brief missing live activation matrix.");
  }

  console.log("pass service delivery");
}

async function checkCompanyAssessment() {
  const result = await request("/api/company-assessment");
  requireStatus("Company Assessment", result.response.status, 200);
  requireContentType("Company Assessment", result.response, "application/json");
  requireCompanyAssessmentBoundary("Company Assessment", result.response);
  const body = requireJson("Company Assessment", result.body);

  if (body.service !== "scrimed-company-operating-assessment") {
    throw new Error(`Company Assessment expected scrimed-company-operating-assessment but received ${body.service}.`);
  }

  if (body.status !== "company-operating-assessment-active") {
    throw new Error(`Company Assessment expected active status but received ${body.status}.`);
  }

  if (!body.overallScore || body.overallScore < 80) {
    throw new Error("Company Assessment expected readiness score of at least 80.");
  }

  if (!Array.isArray(body.dimensions) || body.dimensions.length < 10) {
    throw new Error("Company Assessment expected at least ten assessment dimensions.");
  }

  if (!Array.isArray(body.companyStrengths) || body.companyStrengths.length < 10) {
    throw new Error("Company Assessment expected at least ten company strengths.");
  }

  if (!Array.isArray(body.weaknessReliefQueue) || body.weaknessReliefQueue.length < 8) {
    throw new Error("Company Assessment expected at least eight weakness relief items.");
  }

  if (!Array.isArray(body.upgradeWorkstreams) || body.upgradeWorkstreams.length < 8) {
    throw new Error("Company Assessment expected at least eight upgrade workstreams.");
  }

  if (!Array.isArray(body.companyAuditFindings) || body.companyAuditFindings.length < 8) {
    throw new Error("Company Assessment expected at least eight whole-company audit findings.");
  }

  if (!Array.isArray(body.revenueBuilders) || body.revenueBuilders.length < 8) {
    throw new Error("Company Assessment expected at least eight revenue builders.");
  }

  if (!Array.isArray(body.competitiveEdgeAmplifiers) || body.competitiveEdgeAmplifiers.length < 8) {
    throw new Error("Company Assessment expected at least eight competitive edge amplifiers.");
  }

  if (!Array.isArray(body.improvementPriorities) || body.improvementPriorities.length < 8) {
    throw new Error("Company Assessment expected at least eight improvement priorities.");
  }

  if (!Array.isArray(body.missingCapabilityClosures) || body.missingCapabilityClosures.length < 10) {
    throw new Error("Company Assessment expected at least ten missing capability closures.");
  }

  if (
    !body.missingCapabilityClosures.every(
      (capability) => capability.currentWorkaround && capability.permanentBuild && capability.blockedUntil
    )
  ) {
    throw new Error("Company Assessment expected every missing capability closure to include workaround, permanent build, and blocked-until fields.");
  }

  if (!Array.isArray(body.companyAssessmentTeamLanes) || body.companyAssessmentTeamLanes.length < 5) {
    throw new Error("Company Assessment expected at least five team operating lanes.");
  }

  if (!Array.isArray(body.hardStops) || body.hardStops.length < 12) {
    throw new Error("Company Assessment expected at least twelve hard stops.");
  }

  if (!body.dimensions.some((dimension) => dimension.name === "Product and services portfolio")) {
    throw new Error("Company Assessment expected product and services portfolio dimension.");
  }

  if (!body.dimensions.some((dimension) => dimension.name === "Trust, approvals, certifications, and global readiness")) {
    throw new Error("Company Assessment expected trust approvals and global readiness dimension.");
  }

  if (!body.upgradeWorkstreams.some((workstream) => workstream.name === "Enterprise deal desk and margin lock")) {
    throw new Error("Company Assessment expected enterprise deal desk and margin lock workstream.");
  }

  if (!body.companyAuditFindings.some((finding) => finding.area === "Commercial story clarity")) {
    throw new Error("Company Assessment expected commercial story clarity audit finding.");
  }

  if (!body.revenueBuilders.some((builder) => builder.name === "Synthetic pilot conversion engine")) {
    throw new Error("Company Assessment expected synthetic pilot conversion revenue builder.");
  }

  if (!body.competitiveEdgeAmplifiers.some((edge) => edge.name === "Proof before production risk")) {
    throw new Error("Company Assessment expected proof-before-production competitive edge.");
  }

  if (!body.improvementPriorities.some((priority) => priority.name === "Compress the buyer front door")) {
    throw new Error("Company Assessment expected buyer front-door improvement priority.");
  }

  const expectedMissingCapabilities = [
    "production-tenant-sso-and-invitation-activation",
    "live-connector-authority-and-sandbox-acceptance",
    "external-security-compliance-and-vendor-risk-evidence",
    "model-evaluation-red-team-and-source-quality-benchmarking"
  ];
  for (const slug of expectedMissingCapabilities) {
    if (!body.missingCapabilityClosures.some((capability) => capability.slug === slug)) {
      throw new Error(`Company Assessment expected missing capability closure ${slug}.`);
    }
  }

  if (!body.hardStops.some((stop) => stop.includes("No PHI"))) {
    throw new Error("Company Assessment expected no-PHI hard stop.");
  }

  if (!body.hardStops.some((stop) => stop.includes("No revenue"))) {
    throw new Error("Company Assessment expected revenue guarantee hard stop.");
  }

  const brief = await request("/api/company-assessment/brief");
  requireStatus("Company Assessment brief", brief.response.status, 200);
  requireContentType("Company Assessment brief", brief.response, "text/markdown");
  requireCompanyAssessmentBoundary("Company Assessment brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Company Operating Assessment Brief")) {
    throw new Error("Company Assessment brief missing heading.");
  }

  if (!brief.body.text.includes("not legal advice")) {
    throw new Error("Company Assessment brief missing legal boundary.");
  }

  if (!brief.body.text.includes("Enterprise deal desk and margin lock")) {
    throw new Error("Company Assessment brief missing enterprise deal desk workstream.");
  }

  if (!brief.body.text.includes("Synthetic pilot conversion engine")) {
    throw new Error("Company Assessment brief missing revenue builder section.");
  }

  if (!brief.body.text.includes("Proof before production risk")) {
    throw new Error("Company Assessment brief missing competitive edge section.");
  }

  if (!brief.body.text.includes("Missing Capability Closure Register")) {
    throw new Error("Company Assessment brief missing missing capability closure section.");
  }

  if (!brief.body.text.includes("Production tenant, SSO, and invitation activation")) {
    throw new Error("Company Assessment brief missing production tenant missing capability.");
  }

  console.log("pass company assessment");
}

async function checkClinicalProductionReadiness() {
  const result = await request("/api/clinical-production-readiness");
  requireStatus("Clinical Production Readiness", result.response.status, 200);
  requireContentType("Clinical Production Readiness", result.response, "application/json");
  requireClinicalProductionReadinessBoundary("Clinical Production Readiness", result.response);
  const body = requireJson("Clinical Production Readiness", result.body);

  if (body.service !== "scrimed-clinical-production-readiness") {
    throw new Error(`Clinical Production Readiness expected scrimed-clinical-production-readiness but received ${body.service}.`);
  }

  if (body.status !== "clinical-production-readiness-task-ledger-active") {
    throw new Error(`Clinical Production Readiness expected active status but received ${body.status}.`);
  }

  if (body.clinicalProductionReady !== false) {
    throw new Error("Clinical Production Readiness must remain not clinical-production-ready.");
  }

  if (!Array.isArray(body.requiredTasks) || body.requiredTasks.length < 20) {
    throw new Error("Clinical Production Readiness expected at least twenty required tasks.");
  }

  if (!body.incompleteTaskCount || body.incompleteTaskCount < 20) {
    throw new Error("Clinical Production Readiness expected incomplete task count.");
  }

  if (!body.criticalOpenTaskCount || body.criticalOpenTaskCount < 10) {
    throw new Error("Clinical Production Readiness expected critical open task coverage.");
  }

  if (!Array.isArray(body.currentCapabilityMotions) || body.currentCapabilityMotions.length < 8) {
    throw new Error("Clinical Production Readiness expected current capability motions.");
  }

  if (!Array.isArray(body.productionGates) || body.productionGates.length < 5) {
    throw new Error("Clinical Production Readiness expected go-live gate coverage.");
  }

  if (!Array.isArray(body.sourceReferences) || body.sourceReferences.length < 8) {
    throw new Error("Clinical Production Readiness expected source references.");
  }

  if (!body.requiredTasks.some((task) => task.task.includes("HIPAA risk analysis"))) {
    throw new Error("Clinical Production Readiness expected HIPAA risk analysis task.");
  }

  if (!body.requiredTasks.some((task) => task.task.includes("FDA CDS/SaMD"))) {
    throw new Error("Clinical Production Readiness expected FDA CDS/SaMD task.");
  }

  if (!body.requiredTasks.some((task) => task.task.includes("customer production go-live"))) {
    throw new Error("Clinical Production Readiness expected customer production go-live task.");
  }

  if (!body.currentCapabilityMotions.some((motion) => motion.name === "No-PHI health-record and interoperability readiness package")) {
    throw new Error("Clinical Production Readiness expected no-PHI health-record current capability motion.");
  }

  if (!body.hardStops.some((stop) => stop.includes("No PHI"))) {
    throw new Error("Clinical Production Readiness expected no-PHI hard stop.");
  }

  const brief = await request("/api/clinical-production-readiness/brief");
  requireStatus("Clinical Production Readiness brief", brief.response.status, 200);
  requireContentType("Clinical Production Readiness brief", brief.response, "text/markdown");
  requireClinicalProductionReadinessBoundary("Clinical Production Readiness brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Clinical Production Readiness Task Ledger")) {
    throw new Error("Clinical Production Readiness brief missing heading.");
  }

  if (!brief.body.text.includes("Current Capability Maximization")) {
    throw new Error("Clinical Production Readiness brief missing current capability maximization section.");
  }

  if (!brief.body.text.includes("not legal advice")) {
    throw new Error("Clinical Production Readiness brief missing legal boundary.");
  }

  console.log("pass clinical production readiness");
}

async function checkPilotDemoCommercialReadiness() {
  const result = await request("/api/pilot-demo-commercial-readiness");
  requireStatus("Pilot Demo Commercial Readiness", result.response.status, 200);
  requireContentType("Pilot Demo Commercial Readiness", result.response, "application/json");
  requirePilotDemoCommercialReadinessBoundary("Pilot Demo Commercial Readiness", result.response);
  if (result.response.headers.get("x-scrimed-demo-session-planner") !== "interactive-synthetic-session-planner-active") {
    throw new Error("Pilot Demo Commercial Readiness missing session-planner evidence header.");
  }
  if (result.response.headers.get("x-scrimed-demo-rehearsal-gate") !== "proof-preflight-rehearsal-gate-active") {
    throw new Error("Pilot Demo Commercial Readiness missing rehearsal-gate evidence header.");
  }
  if (result.response.headers.get("x-scrimed-demo-proof-preflight") !== "same-origin-read-only-operator-triggered") {
    throw new Error("Pilot Demo Commercial Readiness missing proof-preflight evidence header.");
  }
  if (result.response.headers.get("x-scrimed-demo-protected-handoff") !== "aal2-sales-operations-only") {
    throw new Error("Pilot Demo Commercial Readiness must retain the protected AAL2 handoff boundary.");
  }
  if (
    result.response.headers.get("x-scrimed-demo-handoff-draft") !==
    "canonical-metadata-no-automatic-persistence"
  ) {
    throw new Error("Pilot Demo Commercial Readiness must expose its bounded metadata-only handoff contract.");
  }
  if (result.response.headers.get("x-scrimed-demo-session-storage") !== "no-buyer-data-stored") {
    throw new Error("Pilot Demo Commercial Readiness missing no-storage evidence header.");
  }
  if (result.response.headers.get("x-scrimed-demo-session-send-authority") !== "not-authorized-external-send") {
    throw new Error("Pilot Demo Commercial Readiness must not authorize external sending.");
  }
  const body = requireJson("Pilot Demo Commercial Readiness", result.body);

  if (body.service !== "scrimed-pilot-demo-commercial-readiness") {
    throw new Error(`Pilot Demo Commercial Readiness expected scrimed-pilot-demo-commercial-readiness but received ${body.service}.`);
  }

  if (body.status !== "pilot-demo-commercial-accelerator-active") {
    throw new Error(`Pilot Demo Commercial Readiness expected active status but received ${body.status}.`);
  }

  if (body.authority?.quoteAuthority !== "not-binding-quote") {
    throw new Error("Pilot Demo Commercial Readiness must not create binding quotes.");
  }

  if (body.authority?.roiAuthority !== "not-roi-guarantee") {
    throw new Error("Pilot Demo Commercial Readiness must preserve no ROI guarantee.");
  }

  if (!Array.isArray(body.demoOfferPaths) || body.demoOfferPaths.length < 5) {
    throw new Error("Pilot Demo Commercial Readiness expected at least five demo offer paths.");
  }

  if (!Array.isArray(body.buyerConversionPackets) || body.buyerConversionPackets.length < 5) {
    throw new Error("Pilot Demo Commercial Readiness expected at least five buyer conversion packets.");
  }

  if (
    !body.buyerConversionPackets.some(
      (packet) =>
        packet.demoSlug === "carepath-access-operations" &&
        packet.minimumPaidStep === "Synthetic Pilot Evaluation" &&
        packet.humanReviewRequired === true &&
        packet.syntheticOnly === true
    )
  ) {
    throw new Error("Pilot Demo Commercial Readiness expected CarePath buyer conversion packet controls.");
  }

  if (
    !body.buyerConversionPackets.every(
      (packet) =>
        Array.isArray(packet.noPhiIntakeFields) &&
        packet.noPhiIntakeFields.includes("non-PHI operating pain statement") &&
        Array.isArray(packet.disqualifiers) &&
        packet.disqualifiers.length > 0 &&
        typeof packet.auditHash === "string" &&
        packet.auditHash.length >= 12
    )
  ) {
    throw new Error("Pilot Demo Commercial Readiness buyer conversion packets must include intake fields, disqualifiers, and audit hashes.");
  }

  const sessionPlanner = body.sessionPlanner;
  if (sessionPlanner?.status !== "interactive-synthetic-session-planner-active") {
    throw new Error("Pilot Demo Commercial Readiness expected the interactive session planner.");
  }

  if (!Array.isArray(sessionPlanner.catalog) || sessionPlanner.catalog.length !== body.demoOfferPaths.length) {
    throw new Error("Pilot Demo Commercial Readiness session planner must cover every demo offer path.");
  }

  if (sessionPlanner.defaultPlan?.status !== "ready-for-synthetic-guided-demo") {
    throw new Error("Pilot Demo Commercial Readiness expected a synthetic guided-demo default plan.");
  }

  if (
    sessionPlanner.defaultPlan?.syntheticOnly !== true ||
    sessionPlanner.defaultPlan?.humanReviewRequired !== true ||
    sessionPlanner.defaultPlan?.bindingQuoteAuthorized !== false ||
    sessionPlanner.defaultPlan?.externalSendAuthorized !== false ||
    sessionPlanner.defaultPlan?.releaseAuthorityGranted !== false
  ) {
    throw new Error("Pilot Demo Commercial Readiness session planner lost a commercial or safety boundary.");
  }

  if (!Array.isArray(sessionPlanner.defaultPlan?.agenda) || sessionPlanner.defaultPlan.agenda.length !== 5) {
    throw new Error("Pilot Demo Commercial Readiness expected a five-step default run of show.");
  }

  const plannedMinutes = sessionPlanner.defaultPlan.agenda.reduce((total, step) => total + step.minutes, 0);
  if (plannedMinutes !== sessionPlanner.defaultPlan.durationMinutes) {
    throw new Error("Pilot Demo Commercial Readiness default run of show does not fit its meeting length.");
  }

  if (
    sessionPlanner.storesBuyerData !== false ||
    sessionPlanner.acceptsFreeText !== false ||
    sessionPlanner.externalSendAuthorized !== false
  ) {
    throw new Error("Pilot Demo Commercial Readiness planner must remain local, structured, and no-send.");
  }

  const rehearsalGate = sessionPlanner.rehearsalGate;
  if (rehearsalGate?.status !== "proof-preflight-rehearsal-gate-active") {
    throw new Error("Pilot Demo Commercial Readiness expected a governed local rehearsal gate.");
  }

  if (!Array.isArray(rehearsalGate.controls) || rehearsalGate.controls.length !== 3) {
    throw new Error("Pilot Demo Commercial Readiness rehearsal gate expected three operator controls.");
  }

  if (
    rehearsalGate.defaultEvaluation?.status !== "rehearsal-incomplete" ||
    rehearsalGate.defaultEvaluation?.readinessScore !== 0 ||
    !Array.isArray(rehearsalGate.defaultEvaluation?.blockers) ||
    rehearsalGate.defaultEvaluation.blockers.length !== 4
  ) {
    throw new Error("Pilot Demo Commercial Readiness rehearsal gate must fail closed before self-attestation.");
  }

  if (
    rehearsalGate.protectedHandoffRoute !== "/sales-operations#authenticated-buyer-demo-execution" ||
    rehearsalGate.completionStatus !== "ready-for-protected-handoff" ||
    rehearsalGate.evidenceBasis !== "automated-route-preflight-plus-operator-self-attestation" ||
    rehearsalGate.persistent !== false ||
    rehearsalGate.importsAutomatically !== false ||
    rehearsalGate.humanReviewRequired !== true ||
    rehearsalGate.pilotLaunchAuthorized !== false ||
    rehearsalGate.defaultEvaluation?.externalSendAuthorized !== false ||
    rehearsalGate.defaultEvaluation?.releaseAuthorityGranted !== false
  ) {
    throw new Error("Pilot Demo Commercial Readiness rehearsal gate lost a handoff or authority boundary.");
  }

  const protectedHandoff = rehearsalGate.protectedHandoff;
  if (
    protectedHandoff?.status !== "canonical-metadata-draft-handoff-active" ||
    protectedHandoff.transport !== "same-origin-query-metadata" ||
    protectedHandoff.sourceTrust !== "untrusted-public-origin-draft" ||
    protectedHandoff.canonicalPlanValidationRequired !== true ||
    !Number.isInteger(protectedHandoff.maximumQueryLength) ||
    protectedHandoff.maximumQueryLength < 1 ||
    protectedHandoff.maximumQueryLength > 1_800 ||
    protectedHandoff.acceptsFreeText !== false ||
    protectedHandoff.storesBuyerData !== false ||
    protectedHandoff.automaticPersistenceAuthorized !== false ||
    protectedHandoff.aal2RecordRequired !== true ||
    protectedHandoff.externalSendAuthorized !== false ||
    protectedHandoff.releaseAuthorityGranted !== false
  ) {
    throw new Error("Pilot Demo Commercial Readiness protected handoff lost a validation or authority boundary.");
  }

  if (
    rehearsalGate.proofPreflight?.status !== "same-origin-read-only-proof-preflight-active" ||
    rehearsalGate.proofPreflight?.method !== "HEAD" ||
    rehearsalGate.proofPreflight?.credentials !== "omit" ||
    rehearsalGate.proofPreflight?.sameOriginOnly !== true ||
    rehearsalGate.proofPreflight?.operatorTriggered !== true ||
    rehearsalGate.proofPreflight?.externalNetworkAllowed !== false ||
    rehearsalGate.proofPreflight?.requestBodyAllowed !== false ||
    rehearsalGate.proofPreflight?.storesBuyerData !== false ||
    rehearsalGate.proofPreflight?.defaultResult?.status !== "not-run" ||
    !Array.isArray(rehearsalGate.proofPreflight?.defaultResult?.routeChecks) ||
    rehearsalGate.proofPreflight.defaultResult.routeChecks.length < 1 ||
    rehearsalGate.proofPreflight.defaultResult.routeChecks.length > rehearsalGate.proofPreflight.maximumTargets
  ) {
    throw new Error("Pilot Demo Commercial Readiness proof preflight lost its bounded read-only boundary.");
  }

  if (!rehearsalGate.defaultEvaluation?.criteria?.some((criterion) => criterion.id === "agenda-coverage")) {
    throw new Error("Pilot Demo Commercial Readiness rehearsal gate is missing agenda coverage.");
  }

  if (!Array.isArray(body.conversionSteps) || body.conversionSteps.length < 6) {
    throw new Error("Pilot Demo Commercial Readiness expected at least six conversion steps.");
  }

  if (!Array.isArray(body.pricingTierAlignments) || body.pricingTierAlignments.length < 6) {
    throw new Error("Pilot Demo Commercial Readiness expected at least six pricing tier alignments.");
  }

  if (!Array.isArray(body.marketBenchmarks) || body.marketBenchmarks.length < 6) {
    throw new Error("Pilot Demo Commercial Readiness expected market benchmark coverage.");
  }

  if (!body.demoOfferPaths.some((path) => path.slug === "atlas-interoperability-readiness" && path.pricingBand.includes("Custom enterprise scope"))) {
    throw new Error("Pilot Demo Commercial Readiness expected custom Atlas readiness scope.");
  }

  if (!body.demoOfferPaths.some((path) => path.slug === "carepath-access-operations" && path.fastPathCta.includes("synthetic-pilot-evaluation"))) {
    throw new Error("Pilot Demo Commercial Readiness expected CarePath synthetic pilot fast path.");
  }

  if (!body.pricingTierAlignments.some((alignment) => alignment.tier === "Synthetic Pilot Evaluation" && alignment.recommendedBand.includes("Custom enterprise scope") && alignment.recommendedBand.includes("human"))) {
    throw new Error("Pilot Demo Commercial Readiness expected human-approved custom synthetic pilot scope.");
  }

  if (!body.marketBenchmarks.some((benchmark) => benchmark.competitor === "Redox")) {
    throw new Error("Pilot Demo Commercial Readiness expected Redox integration benchmark.");
  }

  if (!body.hardStops.some((stop) => stop.includes("Do not accept PHI"))) {
    throw new Error("Pilot Demo Commercial Readiness expected no-PHI hard stop.");
  }

  if (!body.nextActions.some((action) => action.includes("/pilot-demo-commercial-readiness"))) {
    throw new Error("Pilot Demo Commercial Readiness expected accelerator next action.");
  }

  const brief = await request("/api/pilot-demo-commercial-readiness/brief");
  requireStatus("Pilot Demo Commercial Readiness brief", brief.response.status, 200);
  requireContentType("Pilot Demo Commercial Readiness brief", brief.response, "text/markdown");
  requirePilotDemoCommercialReadinessBoundary("Pilot Demo Commercial Readiness brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Pilot Demo Commercial Readiness Brief")) {
    throw new Error("Pilot Demo Commercial Readiness brief missing heading.");
  }

  if (!brief.body.text.includes("not a signed quote")) {
    throw new Error("Pilot Demo Commercial Readiness brief missing quote boundary.");
  }

  if (!brief.body.text.includes("Pricing Tier Alignment")) {
    throw new Error("Pilot Demo Commercial Readiness brief missing pricing tier alignment section.");
  }

  if (!brief.body.text.includes("Buyer Conversion Packets")) {
    throw new Error("Pilot Demo Commercial Readiness brief missing buyer conversion packet section.");
  }

  if (!brief.body.text.includes("Guided Demo Session Plan")) {
    throw new Error("Pilot Demo Commercial Readiness brief missing guided session plan section.");
  }

  if (!brief.body.text.includes("stores no buyer data")) {
    throw new Error("Pilot Demo Commercial Readiness brief missing no-storage boundary.");
  }

  if (!brief.body.text.includes("Governed Rehearsal Gate")) {
    throw new Error("Pilot Demo Commercial Readiness brief missing rehearsal-gate section.");
  }

  if (!brief.body.text.includes("Route reachability is checked automatically")) {
    throw new Error("Pilot Demo Commercial Readiness brief missing proof-preflight evidence limitation.");
  }

  console.log("pass pilot demo commercial readiness");
}

async function checkClientOnboardingCommunications() {
  const result = await request("/api/client-onboarding");
  requireStatus("Client Onboarding Communications", result.response.status, 200);
  requireContentType("Client Onboarding Communications", result.response, "application/json");
  requireClientOnboardingBoundary("Client Onboarding Communications", result.response);
  const body = requireJson("Client Onboarding Communications", result.body);

  if (body.service !== "scrimed-client-onboarding-communications") {
    throw new Error(`Client Onboarding expected scrimed-client-onboarding-communications but received ${body.service}.`);
  }

  if (body.status !== "client-onboarding-communications-control-plane-active") {
    throw new Error(`Client Onboarding expected active status but received ${body.status}.`);
  }

  if (body.authority?.communicationAuthority !== "templates-only-human-send-required") {
    throw new Error("Client Onboarding must require human approval before communication send.");
  }

  if (body.authority?.calendarAuthority !== "calendar-ready-not-invite-created") {
    throw new Error("Client Onboarding must not create calendar invites automatically.");
  }

  if (!Array.isArray(body.clientOnboardingStages) || body.clientOnboardingStages.length < 8) {
    throw new Error("Client Onboarding expected full onboarding stage coverage.");
  }

  if (!Array.isArray(body.clientCommunicationTemplates) || body.clientCommunicationTemplates.length < 9) {
    throw new Error("Client Onboarding expected communication template coverage.");
  }

  if (!Array.isArray(body.clientCalendarPackets) || body.clientCalendarPackets.length < 6) {
    throw new Error("Client Onboarding expected calendar packet coverage.");
  }

  if (!Array.isArray(body.clientMeetingCadences) || body.clientMeetingCadences.length < 5) {
    throw new Error("Client Onboarding expected meeting cadence coverage.");
  }

  if (!Array.isArray(body.clientPresentationPackets) || body.clientPresentationPackets.length < 5) {
    throw new Error("Client Onboarding expected presentation packet coverage.");
  }

  if (!Array.isArray(body.clientOnboardingControls) || body.clientOnboardingControls.length < 8) {
    throw new Error("Client Onboarding expected controls.");
  }

  if (!Array.isArray(body.clientOnboardingHandoffs) || body.clientOnboardingHandoffs.length < 6) {
    throw new Error("Client Onboarding expected handoffs.");
  }

  if (!body.blockedContent?.includes("email sent automatically")) {
    throw new Error("Client Onboarding expected automatic email blocked content.");
  }

  if (!body.blockedContent?.includes("calendar invite created automatically")) {
    throw new Error("Client Onboarding expected automatic calendar invite blocked content.");
  }

  if (!body.clientCommunicationTemplates.some((template) => template.slug === "demo-follow-up")) {
    throw new Error("Client Onboarding expected demo follow-up template.");
  }

  if (!body.clientCalendarPackets.some((packet) => packet.slug === "pilot-scoping-workshop")) {
    throw new Error("Client Onboarding expected pilot scoping workshop calendar packet.");
  }

  const brief = await request("/api/client-onboarding/brief");
  requireStatus("Client Onboarding Communications brief", brief.response.status, 200);
  requireContentType("Client Onboarding Communications brief", brief.response, "text/markdown");
  requireClientOnboardingBoundary("Client Onboarding Communications brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Client Onboarding And Communications Brief")) {
    throw new Error("Client Onboarding brief missing heading.");
  }

  if (!brief.body.text.includes("does not send email")) {
    throw new Error("Client Onboarding brief missing no-send boundary.");
  }

  if (!brief.body.text.includes("Calendar Packets")) {
    throw new Error("Client Onboarding brief missing calendar packet section.");
  }

  console.log("pass client onboarding communications");
}

async function checkBoundaryResolution() {
  const result = await request("/api/boundary-resolution");
  requireStatus("Boundary Resolution Register", result.response.status, 200);
  requireContentType("Boundary Resolution Register", result.response, "application/json");
  requireBoundaryResolutionBoundary("Boundary Resolution Register", result.response);
  const body = requireJson("Boundary Resolution Register", result.body);

  if (body.service !== "scrimed-boundary-resolution-register") {
    throw new Error(`Boundary Resolution expected scrimed-boundary-resolution-register but received ${body.service}.`);
  }

  if (body.status !== "boundary-resolution-register-active") {
    throw new Error(`Boundary Resolution expected active status but received ${body.status}.`);
  }

  if (
    body.proofStackStatus !==
    "cross-system-boundary-resolution-register-no-authority-claim"
  ) {
    throw new Error("Boundary Resolution missing proof-stack status.");
  }

  if (!Array.isArray(body.records) || body.records.length < 40) {
    throw new Error("Boundary Resolution expected broad cross-system boundary coverage.");
  }

  if (!body.records.some((record) => record.state === "human-aal2-required")) {
    throw new Error("Boundary Resolution expected human AAL2 required gates.");
  }

  if (!body.records.some((record) => record.category === "clinical-authority")) {
    throw new Error("Boundary Resolution expected clinical authority records.");
  }

  if (!body.records.some((record) => record.category === "qa-evidence")) {
    throw new Error("Boundary Resolution expected QA evidence records.");
  }

  if ((body.countsByCategory?.["global-certification-readiness"] ?? 0) < 1) {
    throw new Error("Boundary Resolution expected global certification readiness records.");
  }

  if ((body.countsByCategory?.["continuous-review-audit"] ?? 0) < 1) {
    throw new Error("Boundary Resolution expected continuous review and audit records.");
  }

  if ((body.countsByCategory?.["health-records-safety-exchange"] ?? 0) < 5) {
    throw new Error("Boundary Resolution expected health records safety exchange records.");
  }

  if ((body.countsByCategory?.["product-service-offerings"] ?? 0) < 6) {
    throw new Error("Boundary Resolution expected product service offering records.");
  }

  if ((body.countsByCategory?.["client-onboarding-communications"] ?? 0) < 8) {
    throw new Error("Boundary Resolution expected client onboarding communication records.");
  }

  if ((body.countsByCategory?.["enterprise-scalability-operations"] ?? 0) < 10) {
    throw new Error("Boundary Resolution expected enterprise scalability operation records.");
  }

  if ((body.countsByCategory?.["platform-power-operations"] ?? 0) < 12) {
    throw new Error("Boundary Resolution expected platform power operation records.");
  }

  if ((body.countsByCategory?.["limitations-workaround-operations"] ?? 0) < 10) {
    throw new Error("Boundary Resolution expected limitations workaround operation records.");
  }

  if ((body.countsByCategory?.["enterprise-growth-operations"] ?? 0) < 1) {
    throw new Error("Boundary Resolution expected enterprise growth operations records.");
  }

  if (!body.records.some((record) => record.prohibitedClaims?.includes("quantum-safe certified"))) {
    throw new Error("Boundary Resolution expected internal quantum/public-claim limitations.");
  }

  if (!body.records.some((record) => record.prohibitedClaims?.includes("revenue guaranteed"))) {
    throw new Error("Boundary Resolution expected revenue guarantee limitations.");
  }

  if (!body.records.some((record) => record.prohibitedClaims?.includes("live autonomous AI approved"))) {
    throw new Error("Boundary Resolution expected live autonomous AI limitations.");
  }

  if (!body.operatingRules?.some((rule) => rule.includes("Do not enter PHI"))) {
    throw new Error("Boundary Resolution expected PHI operating rule.");
  }

  if (!body.operatingRules?.some((rule) => rule.includes("Health Records Safety Exchange"))) {
    throw new Error("Boundary Resolution expected health records operating rule.");
  }

  if (!body.operatingRules?.some((rule) => rule.includes("Product and Services Portfolio"))) {
    throw new Error("Boundary Resolution expected product service portfolio operating rule.");
  }

  if (!body.operatingRules?.some((rule) => rule.includes("Client Onboarding and Communications"))) {
    throw new Error("Boundary Resolution expected client onboarding communications operating rule.");
  }

  if (!body.operatingRules?.some((rule) => rule.includes("Enterprise Scalability Operations"))) {
    throw new Error("Boundary Resolution expected enterprise scalability operating rule.");
  }

  if (!body.operatingRules?.some((rule) => rule.includes("Platform Power Operations"))) {
    throw new Error("Boundary Resolution expected platform power operating rule.");
  }

  if (!body.operatingRules?.some((rule) => rule.includes("Limitations and Workaround Operations"))) {
    throw new Error("Boundary Resolution expected limitations workaround operating rule.");
  }

  if (!body.operatingRules?.some((rule) => rule.includes("Do not position 24/7 review agents"))) {
    throw new Error("Boundary Resolution expected 24/7 review-agent operating rule.");
  }

  const brief = await request("/api/boundary-resolution/brief");
  requireStatus("Boundary Resolution brief", brief.response.status, 200);
  requireContentType("Boundary Resolution brief", brief.response, "text/markdown");
  requireBoundaryResolutionBoundary("Boundary Resolution brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Boundary Resolution Register Brief")) {
    throw new Error("Boundary Resolution brief missing heading.");
  }

  if (!brief.body.text.includes("does not authorize live clinical care")) {
    throw new Error("Boundary Resolution brief missing no-authority boundary.");
  }

  console.log("pass boundary resolution register");
}

async function checkBoundaryReleaseApprovalMatrix() {
  const result = await request("/api/boundary-release-approvals");
  requireStatus("Boundary Release Approval Matrix", result.response.status, 200);
  requireContentType("Boundary Release Approval Matrix", result.response, "application/json");
  requireBoundaryReleaseApprovalMatrixBoundary("Boundary Release Approval Matrix", result.response);
  const body = requireJson("Boundary Release Approval Matrix", result.body);

  if (body.service !== "scrimed-boundary-release-approval-matrix") {
    throw new Error(`Boundary Release Approval Matrix expected scrimed-boundary-release-approval-matrix but received ${body.service}.`);
  }

  if (body.status !== "boundary-release-approval-matrix-active-fail-closed") {
    throw new Error("Boundary Release Approval Matrix expected active fail-closed status.");
  }

  if (body.releaseAuthority !== "not-authorized-boundary-release") {
    throw new Error("Boundary Release Approval Matrix must not grant release authority.");
  }

  if (body.releasedBoundaryCount !== 0 || body.blockedBoundaryCount !== body.releaseCandidateCount) {
    throw new Error("Boundary Release Approval Matrix expected every release candidate to remain blocked.");
  }

  if (body.allApprovalStepsDocumented !== true) {
    throw new Error("Boundary Release Approval Matrix expected all approval steps to be documented.");
  }

  if (!body.selfTest?.unknownBoundaryFailsClosed || !body.selfTest?.noAutomaticRelease) {
    throw new Error("Boundary Release Approval Matrix expected fail-closed self tests.");
  }

  if (body.evidenceWorkQueueSummary?.status !== "metadata-only-evidence-work-queue-active") {
    throw new Error("Boundary Release Approval Matrix expected metadata-only evidence work queue.");
  }

  if (!Array.isArray(body.evidenceWorkQueue) || body.evidenceWorkQueue.length < body.releaseCandidateCount) {
    throw new Error("Boundary Release Approval Matrix expected evidence work queue coverage for release candidates.");
  }

  if (body.evidenceWorkQueueSummary?.acceptsRawEvidence !== false) {
    throw new Error("Boundary Release Approval Matrix must not accept raw evidence.");
  }

  if (!body.evidenceWorkQueueSummary?.allWorkItemsMetadataOnly || !body.selfTest?.noWorkItemAcceptsRawEvidence) {
    throw new Error("Boundary Release Approval Matrix expected all work items to be metadata-only.");
  }

  if (!body.selfTest?.everyPendingStepHasEvidenceWorkItem || !body.selfTest?.everyPendingSignoffHasEvidenceWorkItem) {
    throw new Error("Boundary Release Approval Matrix expected every pending step and signoff to have evidence work items.");
  }

  if (!body.selfTest?.workQueueCannotReleaseBoundaries) {
    throw new Error("Boundary Release Approval Matrix work queue must not release boundaries.");
  }

  if (!body.evidenceWorkQueue.some((item) => item.priority === "critical" && item.status === "blocked-sensitive-storage")) {
    throw new Error("Boundary Release Approval Matrix expected critical sensitive-storage blockers.");
  }

  if (!body.evidenceWorkQueue.every((item) => item.requiredBeforeRelease === true && item.acceptsRawEvidence === false && item.workItemHash?.length === 64)) {
    throw new Error("Boundary Release Approval Matrix expected every evidence work item to be required, metadata-only, and hashed.");
  }

  for (const expectedPath of [
    "live-phi",
    "clinical-decision-support",
    "autonomous-clinical-action",
    "ehr-writeback",
    "payer-submission",
    "clinical-research-outcomes-learning",
    "security-certification-claims",
    "global-operation",
    "customer-go-live"
  ]) {
    const path = body.approvalPaths?.find((approvalPath) => approvalPath.id === expectedPath);

    if (!path) {
      throw new Error(`Boundary Release Approval Matrix missing path ${expectedPath}.`);
    }

    if (path.releaseDecision !== "blocked-fail-closed" || path.canRelieveBoundary !== false) {
      throw new Error(`Boundary Release Approval Matrix path ${expectedPath} must remain blocked.`);
    }

    if (!path.releaseHash || path.releaseHash.length !== 64) {
      throw new Error(`Boundary Release Approval Matrix path ${expectedPath} missing deterministic release hash.`);
    }

    if (!path.approvalSteps?.every((approvalStep) => approvalStep.matrixStepDocumented === true)) {
      throw new Error(`Boundary Release Approval Matrix path ${expectedPath} has undocumented approval steps.`);
    }
  }

  const brief = await request("/api/boundary-release-approvals/brief");
  requireStatus("Boundary Release Approval Matrix brief", brief.response.status, 200);
  requireContentType("Boundary Release Approval Matrix brief", brief.response, "text/markdown");
  requireBoundaryReleaseApprovalMatrixBoundary("Boundary Release Approval Matrix brief", brief.response);

  for (const expectedText of [
    "SCRIMED Boundary Release Approval Matrix",
    "Live PHI / ePHI processing",
    "Clinical decision support",
    "Payer submission",
    "Customer go-live",
    "Evidence Work Queue",
    "Accepts raw evidence: false",
    "NO-GO Claims Still Preserved"
  ]) {
    if (!brief.body.text.includes(expectedText)) {
      throw new Error(`Boundary Release Approval Matrix brief missing ${expectedText}.`);
    }
  }

  console.log("pass boundary release approval matrix");
}

async function checkApprovalsReadiness() {
  const result = await request("/api/approvals-readiness");
  requireStatus("Approvals Readiness", result.response.status, 200);
  requireContentType("Approvals Readiness", result.response, "application/json");
  requireApprovalsReadinessBoundary("Approvals Readiness", result.response);
  const body = requireJson("Approvals Readiness", result.body);

  if (body.service !== "scrimed-approvals-readiness") {
    throw new Error(`Approvals Readiness expected scrimed-approvals-readiness but received ${body.service}.`);
  }

  if (body.status !== "approvals-readiness-operating-ladder-active") {
    throw new Error(`Approvals Readiness expected operating ladder status but received ${body.status}.`);
  }

  if (body.authorizationStatus !== "public-operations-only-no-regulated-approval") {
    throw new Error("Approvals Readiness must preserve no-regulated-approval authorization status.");
  }

  if (body.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Approvals Readiness must keep PHI authority blocked.");
  }

  if (body.securityCertification !== "not-security-certified") {
    throw new Error("Approvals Readiness must preserve not-security-certified posture.");
  }

  if (body.regulatoryAuthority !== "external-review-required") {
    throw new Error("Approvals Readiness must keep regulatory authority externally reviewed.");
  }

  if (!Array.isArray(body.tracks) || body.tracks.length < 7) {
    throw new Error("Approvals Readiness expected at least seven approval tracks.");
  }

  if (!body.tracks.some((track) => track.key === "fda-cds-samd-classification")) {
    throw new Error("Approvals Readiness expected FDA/CDS/SaMD classification track.");
  }

  if (!body.tracks.some((track) => track.key === "hipaa-baa-security-rule")) {
    throw new Error("Approvals Readiness expected HIPAA/BAA track.");
  }

  if (!Array.isArray(body.agentControls) || body.agentControls.length < 5) {
    throw new Error("Approvals Readiness expected approval-aware agent controls.");
  }

  if (!Array.isArray(body.processes) || body.processes.length < 5) {
    throw new Error("Approvals Readiness expected approval processes.");
  }

  if (body.intendedUseReview?.service !== "scrimed-intended-use-review") {
    throw new Error("Approvals Readiness expected the Intended Use review program.");
  }

  if (body.intendedUseReview?.status !== "intended-use-review-packet-safe-draft-only") {
    throw new Error("Approvals Readiness expected Intended Use draft-only status.");
  }

  const intendedUseDefault = body.intendedUseReview?.defaultEvaluation;

  if (intendedUseDefault?.decision !== "qualified-review-packet-ready") {
    throw new Error("Approvals Readiness expected the bounded default scope to be ready for qualified review.");
  }

  for (const field of ["approved", "approvalClaimAllowed", "externalUseAuthorized", "phiAuthority", "clinicalAuthority", "productionAuthority"]) {
    if (intendedUseDefault?.[field] !== false) {
      throw new Error(`Approvals Readiness Intended Use default must keep ${field} false.`);
    }
  }

  if (!Array.isArray(body.intendedUseReview?.actionOptions) || !body.intendedUseReview.actionOptions.some((action) => action.id === "ehr-writeback" && action.classification === "prohibited")) {
    throw new Error("Approvals Readiness Intended Use registry must prohibit EHR writeback.");
  }

  const brief = await request("/api/approvals-readiness/brief");
  requireStatus("Approvals Readiness brief", brief.response.status, 200);
  requireContentType("Approvals Readiness brief", brief.response, "text/markdown");
  requireApprovalsReadinessBoundary("Approvals Readiness brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Approvals Readiness Brief")) {
    throw new Error("Approvals Readiness brief missing heading.");
  }

  if (!brief.body.text.includes("not legal advice")) {
    throw new Error("Approvals Readiness brief missing legal boundary.");
  }

  if (!brief.body.text.includes("FDA clearance")) {
    throw new Error("Approvals Readiness brief missing FDA boundary.");
  }

  if (!brief.body.text.includes("Intended Use Review Packet")) {
    throw new Error("Approvals Readiness brief missing Intended Use review packet.");
  }

  if (!brief.body.text.includes("External use authorized: false")) {
    throw new Error("Approvals Readiness brief must preserve blocked external use.");
  }

  console.log("pass approvals readiness");
}

async function checkGlobalCertificationReadiness() {
  const result = await request("/api/global-certification-readiness");
  requireStatus("Global Certification Readiness", result.response.status, 200);
  requireContentType("Global Certification Readiness", result.response, "application/json");
  requireGlobalCertificationReadinessBoundary("Global Certification Readiness", result.response);
  const body = requireJson("Global Certification Readiness", result.body);

  if (body.service !== "scrimed-global-approval-certification-readiness") {
    throw new Error(`Global Certification Readiness expected scrimed-global-approval-certification-readiness but received ${body.service}.`);
  }

  if (body.status !== "global-approval-certification-readiness-control-plane-active") {
    throw new Error(`Global Certification Readiness expected control plane status but received ${body.status}.`);
  }

  if (!Array.isArray(body.tracks) || body.tracks.length < 6) {
    throw new Error("Global Certification Readiness expected at least six approval and certification tracks.");
  }

  if (!Array.isArray(body.sources) || body.sources.length < 10) {
    throw new Error("Global Certification Readiness expected at least ten official source records.");
  }

  if (!Array.isArray(body.gates) || body.gates.length < 5) {
    throw new Error("Global Certification Readiness expected at least five certification gates.");
  }

  if (!Array.isArray(body.regionalPacks) || body.regionalPacks.length < 5) {
    throw new Error("Global Certification Readiness expected at least five regional packs.");
  }

  if (!body.tracks.some((track) => track.slug === "us-fda-cds-samd-classification")) {
    throw new Error("Global Certification Readiness expected FDA CDS/SaMD classification track.");
  }

  if (!body.tracks.some((track) => track.slug === "eu-ai-act-gdpr-ehds-readiness")) {
    throw new Error("Global Certification Readiness expected EU AI Act/GDPR readiness track.");
  }

  if (!body.blockedClaims?.includes("HIPAA certified")) {
    throw new Error("Global Certification Readiness expected HIPAA certified blocked claim.");
  }

  if (!body.blockedClaims?.includes("EU AI Act conformant")) {
    throw new Error("Global Certification Readiness expected EU AI Act conformant blocked claim.");
  }

  const brief = await request("/api/global-certification-readiness/brief");
  requireStatus("Global Certification Readiness brief", brief.response.status, 200);
  requireContentType("Global Certification Readiness brief", brief.response, "text/markdown");
  requireGlobalCertificationReadinessBoundary("Global Certification Readiness brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Global Approval and Certification Readiness Brief")) {
    throw new Error("Global Certification Readiness brief missing heading.");
  }

  if (!brief.body.text.includes("not legal advice")) {
    throw new Error("Global Certification Readiness brief missing legal boundary.");
  }

  if (!brief.body.text.includes("HIPAA compliance certification")) {
    throw new Error("Global Certification Readiness brief missing certification boundary.");
  }

  console.log("pass global certification readiness");
}

async function checkContinuousReviewAudit() {
  const result = await request("/api/continuous-review-audit");
  requireStatus("Continuous Review Audit", result.response.status, 200);
  requireContentType("Continuous Review Audit", result.response, "application/json");
  requireContinuousReviewAuditBoundary("Continuous Review Audit", result.response);
  const body = requireJson("Continuous Review Audit", result.body);

  if (body.service !== "scrimed-continuous-review-audit-innovation") {
    throw new Error(`Continuous Review Audit expected scrimed-continuous-review-audit-innovation but received ${body.service}.`);
  }

  if (body.status !== "continuous-review-audit-innovation-control-plane-active") {
    throw new Error(`Continuous Review Audit expected control plane status but received ${body.status}.`);
  }

  if (body.quantumTrackStatus !== "internal-research-only-no-public-claim") {
    throw new Error("Continuous Review Audit must keep quantum work internal-only with no public claim.");
  }

  if (body.managedCoverageAuthority !== "not-managed-24-7-soc-mdr") {
    throw new Error("Continuous Review Audit must not claim managed 24/7 SOC/MDR coverage.");
  }

  if (body.autonomousRemediationAuthority !== "human-review-required-before-production-change") {
    throw new Error("Continuous Review Audit must keep production remediation human-review gated.");
  }

  if (!Array.isArray(body.agents) || body.agents.length < 7) {
    throw new Error("Continuous Review Audit expected at least seven review agents.");
  }

  if (!Array.isArray(body.loops) || body.loops.length < 8) {
    throw new Error("Continuous Review Audit expected at least eight operating loops.");
  }

  if (!Array.isArray(body.controls) || body.controls.length < 6) {
    throw new Error("Continuous Review Audit expected at least six audit controls.");
  }

  if (!Array.isArray(body.innovationTracks) || body.innovationTracks.length < 5) {
    throw new Error("Continuous Review Audit expected at least five innovation research tracks.");
  }

  if (!Array.isArray(body.internalResearchAssignments) || body.internalResearchAssignments.length < 4) {
    throw new Error("Continuous Review Audit expected at least four internal research assignments.");
  }

  if (!Array.isArray(body.sources) || body.sources.length < 5) {
    throw new Error("Continuous Review Audit expected official and internal source coverage.");
  }

  if (!body.blockedClaims?.includes("quantum clinical advantage")) {
    throw new Error("Continuous Review Audit expected quantum clinical advantage blocked claim.");
  }

  if (!body.blockedClaims?.includes("production change without reviewer")) {
    throw new Error("Continuous Review Audit expected production change without reviewer hard stop.");
  }

  const brief = await request("/api/continuous-review-audit/brief");
  requireStatus("Continuous Review Audit brief", brief.response.status, 200);
  requireContentType("Continuous Review Audit brief", brief.response, "text/markdown");
  requireContinuousReviewAuditBoundary("Continuous Review Audit brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Continuous Review, Audit, and Innovation Brief")) {
    throw new Error("Continuous Review Audit brief missing heading.");
  }

  if (!brief.body.text.includes("not managed 24/7 SOC/MDR coverage")) {
    throw new Error("Continuous Review Audit brief missing managed-coverage boundary.");
  }

  if (!brief.body.text.includes("public quantum capability claim")) {
    throw new Error("Continuous Review Audit brief missing quantum public-claim boundary.");
  }

  console.log("pass continuous review audit");
}

async function checkReleaseContinuity() {
  const result = await request("/api/release-continuity");
  requireStatus("Release Continuity", result.response.status, 200);
  requireContentType("Release Continuity", result.response, "application/json");
  requireReleaseContinuityBoundary("Release Continuity", result.response);
  const body = requireJson("Release Continuity", result.body);

  if (body.service !== "scrimed-release-continuity") {
    throw new Error(`Release Continuity expected scrimed-release-continuity but received ${body.service}.`);
  }

  if (body.status !== "release-continuity-checkpointed-aal2-boundary") {
    throw new Error(`Release Continuity expected checkpointed status but received ${body.status}.`);
  }

  if (body.authorizationStatus !== "public-release-evidence-only-protected-aal2-required") {
    throw new Error("Release Continuity must preserve protected AAL2 authorization boundary.");
  }

  if (body.tokenHandling !== "no-token-values-exposed-or-retained") {
    throw new Error("Release Continuity must preserve no-token exposure boundary.");
  }

  if (body.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Release Continuity must keep PHI authority blocked.");
  }

  if (body.releaseAuthority !== "not-release-approval") {
    throw new Error("Release Continuity must not create release authority.");
  }

  if (!Array.isArray(body.gates) || body.gates.length < 5) {
    throw new Error("Release Continuity expected at least five gates.");
  }

  if (!body.gates.some((gate) => gate.key === "protected-aal2-happy-path")) {
    throw new Error("Release Continuity expected protected AAL2 happy-path gate.");
  }

  if (!body.gates.some((gate) => gate.key === "secret-handling")) {
    throw new Error("Release Continuity expected secret-handling gate.");
  }

  if (!body.gates.some((gate) => gate.key === "aal2-smoke-readiness-packet")) {
    throw new Error("Release Continuity expected AAL2 smoke readiness packet gate.");
  }

  if (!Array.isArray(body.checks) || body.checks.length < 6) {
    throw new Error("Release Continuity expected release checks.");
  }

  if (!body.checks.some((check) => check.name === "AAL2 smoke readiness preflight")) {
    throw new Error("Release Continuity expected AAL2 smoke readiness preflight check.");
  }

  if (body.aal2SmokeReadiness?.status !== "aal2-smoke-readiness-preflight-ready-no-secret") {
    throw new Error("Release Continuity expected no-secret AAL2 smoke readiness status.");
  }

  if (body.aal2SmokeReadiness?.strictAttemptReady !== false || body.aal2SmokeReadiness?.protectedHumanRunRequired !== true) {
    throw new Error("Release Continuity must keep strict AAL2 smoke human-gated.");
  }

  if (!Array.isArray(body.deploymentReleaseChecklist) || body.deploymentReleaseChecklist.length < 5) {
    throw new Error("Release Continuity expected deployment release checklist coverage.");
  }

  if (!body.deploymentReleaseChecklist.some((item) => item.id === "aal2-smoke-readiness-preflight")) {
    throw new Error("Release Continuity expected AAL2 smoke readiness checklist item.");
  }

  if (!body.deploymentReleaseChecklist.some((item) => item.command === "npm run smoke:aal2:durable-store:strict")) {
    throw new Error("Release Continuity expected strict durable-store smoke checklist command.");
  }

  if (body.releaseEvidenceLedger?.status !== "release-evidence-ledger-active-no-secret") {
    throw new Error("Release Continuity expected release evidence ledger status.");
  }

  if (!body.releaseEvidenceLedger?.entryCount || body.releaseEvidenceLedger.entryCount < 8) {
    throw new Error("Release Continuity expected release evidence ledger entry coverage.");
  }

  if (body.releaseEvidenceLedger?.tokenMaterialCaptured !== false || body.releaseEvidenceLedger?.productionApproval !== false) {
    throw new Error("Release Continuity evidence ledger must not capture token material or create production approval.");
  }

  if (body.releaseEvidencePromotion?.status !== "release-evidence-promotion-queue-active-human-gated") {
    throw new Error("Release Continuity expected release evidence promotion queue status.");
  }

  if (!body.releaseEvidencePromotion?.queueCount || body.releaseEvidencePromotion.queueCount < 8) {
    throw new Error("Release Continuity expected release evidence promotion queue coverage.");
  }

  if (body.releaseEvidencePromotion?.tokenMaterialCaptured !== false || body.releaseEvidencePromotion?.productionApproval !== false) {
    throw new Error("Release Continuity evidence promotion must not capture token material or create production approval.");
  }

  if (body.releaseEvidenceFreshnessGuard?.status !== "release-evidence-freshness-guard-active-no-secret") {
    throw new Error("Release Continuity expected release evidence freshness guard status.");
  }

  if (body.releaseEvidenceFreshnessGuard?.freshnessAuthority !== "fresh-rerun-required-before-external-use") {
    throw new Error("Release Continuity expected release evidence freshness authority.");
  }

  if (body.releaseEvidenceFreshnessGuard?.publicDistributionAuthority !== "not-authorized") {
    throw new Error("Release Continuity must keep freshness public distribution unauthorized.");
  }

  if (body.releaseEvidenceFreshnessGuard?.customerSpecificAuthority !== "not-authorized-without-customer-permission") {
    throw new Error("Release Continuity must keep freshness customer-specific authority gated.");
  }

  if (body.releaseEvidenceFreshnessGuard?.clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error("Release Continuity must keep freshness clinical care unauthorized.");
  }

  if (body.releaseEvidenceFreshnessGuard?.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Release Continuity must keep freshness PHI authority blocked.");
  }

  if (body.releaseEvidenceFreshnessGuard?.tokenMaterialCaptured !== false || body.releaseEvidenceFreshnessGuard?.productionApproval !== false) {
    throw new Error("Release Evidence Freshness Guard must not capture token material or create production approval.");
  }

  if (!body.releaseEvidenceFreshnessGuard?.cardCount || body.releaseEvidenceFreshnessGuard.cardCount < 8) {
    throw new Error("Release Continuity expected release evidence freshness guard card coverage.");
  }

  if (body.releaseAuthorizationChain?.status !== "release-authorization-chain-active-no-release-approval") {
    throw new Error("Release Continuity expected release authorization chain status.");
  }

  if (!/^release-authorization-[a-f0-9]{8}$/.test(body.releaseAuthorizationChain?.authorizationHash ?? "")) {
    throw new Error("Release Continuity expected deterministic release authorization hash.");
  }

  if (body.releaseAuthorizationChain?.safeUseLabel !== "no-secret-metadata-chain-not-release-approval") {
    throw new Error("Release Continuity expected authorization chain safe-use label.");
  }

  if (body.releaseAuthorizationChain?.chainDecision !== "blocked-by-design") {
    throw new Error("Release Continuity authorization chain must remain blocked by design until approvals exist.");
  }

  if (!body.releaseAuthorizationChain?.weakestLink?.includes("blocked-by-design")) {
    throw new Error("Release Continuity authorization chain expected blocked weakest link.");
  }

  if (body.releaseAuthorizationChain?.protectedProofLane !== "blocked-until-human-aal2") {
    throw new Error("Release Continuity authorization chain must keep protected proof AAL2-gated.");
  }

  if (body.releaseAuthorizationChain?.releaseAuthority !== "not-release-approval") {
    throw new Error("Release Continuity authorization chain must not create release approval.");
  }

  if (body.releaseAuthorizationChain?.publicDistributionAuthority !== "not-authorized") {
    throw new Error("Release Continuity authorization chain must keep public distribution unauthorized.");
  }

  if (body.releaseAuthorizationChain?.customerSpecificAuthority !== "not-authorized-without-customer-permission") {
    throw new Error("Release Continuity authorization chain must keep customer-specific sharing gated.");
  }

  if (body.releaseAuthorizationChain?.clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error("Release Continuity authorization chain must keep clinical care unauthorized.");
  }

  if (body.releaseAuthorizationChain?.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Release Continuity authorization chain must keep PHI authority blocked.");
  }

  if (body.releaseAuthorizationChain?.tokenMaterialCaptured !== false || body.releaseAuthorizationChain?.productionApproval !== false) {
    throw new Error("Release Authorization Chain must not capture token material or create production approval.");
  }

  if (!body.releaseAuthorizationChain?.controlCount || body.releaseAuthorizationChain.controlCount < 8) {
    throw new Error("Release Continuity expected release authorization chain control coverage.");
  }

  if (body.diligenceReleaseGate?.status !== "diligence-release-gate-active-no-production-approval") {
    throw new Error("Release Continuity expected diligence release gate status.");
  }

  if (body.diligenceReleaseGate?.buyerDiligenceGate !== "go-no-secret-metadata-with-release-steward-review") {
    throw new Error("Release Continuity expected no-secret buyer diligence gate.");
  }

  if (body.diligenceReleaseGate?.protectedAal2Gate !== "no-go-until-human-aal2-retained-packet") {
    throw new Error("Release Continuity must keep protected AAL2 proof gated.");
  }

  if (body.diligenceReleaseGate?.productionReleaseGate !== "no-go-not-release-approval") {
    throw new Error("Release Continuity must keep production release not approved.");
  }

  if (body.diligenceReleaseGate?.clinicalProductionGate !== "no-go-not-authorized-live-care") {
    throw new Error("Release Continuity must keep clinical production blocked.");
  }

  if (body.diligenceReleaseGate?.tokenMaterialCaptured !== false || body.diligenceReleaseGate?.productionApproval !== false) {
    throw new Error("Diligence Release Gate must not capture token material or create production approval.");
  }

  if (body.diligencePacketManifest?.status !== "diligence-packet-manifest-active-no-secret") {
    throw new Error("Release Continuity expected diligence packet manifest status.");
  }

  if (body.diligencePacketManifest?.packetUseAuthority !== "no-secret-buyer-investor-diligence-only") {
    throw new Error("Release Continuity expected no-secret buyer/investor packet use authority.");
  }

  if (body.diligencePacketManifest?.publicDistributionAuthority !== "not-authorized") {
    throw new Error("Release Continuity must keep diligence packet public distribution unauthorized.");
  }

  if (body.diligencePacketManifest?.clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error("Release Continuity must keep diligence packet clinical care unauthorized.");
  }

  if (body.diligencePacketManifest?.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Release Continuity must keep diligence packet PHI authority blocked.");
  }

  if (body.diligencePacketManifest?.tokenMaterialCaptured !== false || body.diligencePacketManifest?.productionApproval !== false) {
    throw new Error("Diligence Packet Manifest must not capture token material or create production approval.");
  }

  if (!body.diligencePacketManifest?.itemCount || body.diligencePacketManifest.itemCount < 8) {
    throw new Error("Release Continuity expected diligence packet manifest item coverage.");
  }

  if (body.diligencePacketShareGuard?.status !== "diligence-packet-share-guard-active-human-gated") {
    throw new Error("Release Continuity expected diligence packet share guard status.");
  }

  if (body.diligencePacketShareGuard?.externalShareAuthority !== "protected-diligence-only-after-human-review") {
    throw new Error("Release Continuity expected protected diligence share authority.");
  }

  if (body.diligencePacketShareGuard?.recipientAuthorizationAuthority !== "recipient-specific-human-approval-required") {
    throw new Error("Release Continuity expected recipient-specific share authorization authority.");
  }

  if (body.diligencePacketShareGuard?.publicDistributionAuthority !== "not-authorized") {
    throw new Error("Release Continuity must keep diligence packet public sharing unauthorized.");
  }

  if (body.diligencePacketShareGuard?.customerSpecificAuthority !== "not-authorized-without-customer-permission") {
    throw new Error("Release Continuity must keep customer-specific diligence sharing gated.");
  }

  if (body.diligencePacketShareGuard?.clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error("Release Continuity must keep diligence packet share clinical care unauthorized.");
  }

  if (body.diligencePacketShareGuard?.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Release Continuity must keep diligence packet share PHI authority blocked.");
  }

  if (body.diligencePacketShareGuard?.tokenMaterialCaptured !== false || body.diligencePacketShareGuard?.productionApproval !== false) {
    throw new Error("Diligence Packet Share Guard must not capture token material or create production approval.");
  }

  if (!body.diligencePacketShareGuard?.cardCount || body.diligencePacketShareGuard.cardCount < 6) {
    throw new Error("Release Continuity expected diligence packet share guard card coverage.");
  }

  if (body.recipientQualificationMatrix?.status !== "recipient-qualification-matrix-active-no-secret") {
    throw new Error("Release Continuity expected recipient qualification matrix status.");
  }

  if (!/^recipient-qualification-[a-f0-9]{8}$/.test(body.recipientQualificationMatrix?.qualificationHash ?? "")) {
    throw new Error("Release Continuity expected deterministic recipient qualification hash.");
  }

  if (body.recipientQualificationMatrix?.externalShareAuthority !== "qualified-recipient-review-required") {
    throw new Error("Release Continuity expected qualified-recipient review authority.");
  }

  if (body.recipientQualificationMatrix?.recipientIdentifierStorage !== "not-stored-in-scrimed") {
    throw new Error("Release Continuity must not store recipient identifiers.");
  }

  if (body.recipientQualificationMatrix?.publicDistributionAuthority !== "not-authorized") {
    throw new Error("Release Continuity must keep recipient public distribution unauthorized.");
  }

  if (body.recipientQualificationMatrix?.customerSpecificAuthority !== "not-authorized-without-customer-permission") {
    throw new Error("Release Continuity must keep customer-specific recipient sharing gated.");
  }

  if (body.recipientQualificationMatrix?.clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error("Release Continuity must keep recipient matrix clinical care unauthorized.");
  }

  if (body.recipientQualificationMatrix?.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Release Continuity must keep recipient matrix PHI authority blocked.");
  }

  if (body.recipientQualificationMatrix?.tokenMaterialCaptured !== false || body.recipientQualificationMatrix?.productionApproval !== false) {
    throw new Error("Recipient Qualification Matrix must not capture token material or create production approval.");
  }

  if (!body.recipientQualificationMatrix?.recipientClassCount || body.recipientQualificationMatrix.recipientClassCount < 6) {
    throw new Error("Release Continuity expected recipient qualification class coverage.");
  }

  if (!body.recipientQualificationMatrix?.blockedRecipientCount || body.recipientQualificationMatrix.blockedRecipientCount < 4) {
    throw new Error("Release Continuity expected blocked recipient coverage.");
  }

  const brief = await request("/api/release-continuity/brief");
  requireStatus("Release Continuity brief", brief.response.status, 200);
  requireContentType("Release Continuity brief", brief.response, "text/markdown");
  requireReleaseContinuityBoundary("Release Continuity brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Release Continuity Brief")) {
    throw new Error("Release Continuity brief missing heading.");
  }

  if (!brief.body.text.includes("not release approval")) {
    throw new Error("Release Continuity brief missing release boundary.");
  }

  if (!brief.body.text.includes("does not mint tokens")) {
    throw new Error("Release Continuity brief missing token boundary.");
  }

  if (!brief.body.text.includes("Diligence Packet Share Guard")) {
    throw new Error("Release Continuity brief missing diligence packet share guard section.");
  }

  if (!brief.body.text.includes("Release Evidence Freshness Guard")) {
    throw new Error("Release Continuity brief missing release evidence freshness guard section.");
  }

  if (!brief.body.text.includes("Release Authorization Chain")) {
    throw new Error("Release Continuity brief missing release authorization chain section.");
  }

  if (!brief.body.text.includes("AAL2 Smoke Readiness")) {
    throw new Error("Release Continuity brief missing AAL2 smoke readiness section.");
  }

  if (!brief.body.text.includes("Deployment Release Checklist")) {
    throw new Error("Release Continuity brief missing deployment release checklist section.");
  }

  if (!brief.body.text.includes("Release Evidence Ledger")) {
    throw new Error("Release Continuity brief missing release evidence ledger section.");
  }

  if (!brief.body.text.includes("Release Evidence Promotion Queue")) {
    throw new Error("Release Continuity brief missing release evidence promotion queue section.");
  }

  if (!brief.body.text.includes("Diligence Release Gate")) {
    throw new Error("Release Continuity brief missing diligence release gate section.");
  }

  if (!brief.body.text.includes("Diligence Packet Manifest")) {
    throw new Error("Release Continuity brief missing diligence packet manifest section.");
  }

  if (!brief.body.text.includes("Recipient Qualification Matrix")) {
    throw new Error("Release Continuity brief missing recipient qualification matrix section.");
  }

  const ledger = await request("/api/release-continuity/evidence-ledger");
  requireStatus("Release Evidence Ledger", ledger.response.status, 200);
  requireContentType("Release Evidence Ledger", ledger.response, "application/json");
  requireReleaseEvidenceLedgerBoundary("Release Evidence Ledger", ledger.response);
  const ledgerBody = requireJson("Release Evidence Ledger", ledger.body);
  const serializedLedger = JSON.stringify(ledgerBody);

  if (ledgerBody.service !== "scrimed-release-evidence-ledger") {
    throw new Error(`Release Evidence Ledger expected service scrimed-release-evidence-ledger but received ${ledgerBody.service}.`);
  }

  if (ledgerBody.status !== "release-evidence-ledger-active-no-secret") {
    throw new Error(`Release Evidence Ledger expected active no-secret status but received ${ledgerBody.status}.`);
  }

  if (ledgerBody.noPhiConfirmed !== true || ledgerBody.tokenMaterialCaptured !== false || ledgerBody.productionApproval !== false) {
    throw new Error("Release Evidence Ledger must stay no-PHI, no-token, and not production approval.");
  }

  if (!Array.isArray(ledgerBody.entries) || ledgerBody.entries.length < 8) {
    throw new Error("Release Evidence Ledger expected release evidence entries.");
  }

  for (const requiredEntry of [
    "nonsecret-regression-suite",
    "execution-attempt-durable-store-contract",
    "aal2-smoke-readiness-preflight",
    "strict-aal2-durable-store-smoke",
    "strict-stored-vector-rpc-smoke"
  ]) {
    if (!ledgerBody.entries.some((entry) => entry.id === requiredEntry)) {
      throw new Error(`Release Evidence Ledger missing entry ${requiredEntry}.`);
    }
  }

  if (!ledgerBody.entries.every((entry) => /^release-evidence-[a-f0-9]{8}$/.test(entry.evidenceHash))) {
    throw new Error("Release Evidence Ledger expected deterministic no-secret evidence hashes.");
  }

  if (!Array.isArray(ledgerBody.blockedClaims) || !ledgerBody.blockedClaims.includes("PHI processing authorized")) {
    throw new Error("Release Evidence Ledger expected blocked PHI claim.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serializedLedger)) {
    throw new Error("Release Evidence Ledger response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serializedLedger)) {
    throw new Error("Release Evidence Ledger response must not contain bearer-token material.");
  }

  const ledgerBrief = await request("/api/release-continuity/evidence-ledger/brief");
  requireStatus("Release Evidence Ledger brief", ledgerBrief.response.status, 200);
  requireContentType("Release Evidence Ledger brief", ledgerBrief.response, "text/markdown");
  requireReleaseEvidenceLedgerBoundary("Release Evidence Ledger brief", ledgerBrief.response);

  if (!ledgerBrief.body.text.includes("SCRIMED Release Evidence Ledger")) {
    throw new Error("Release Evidence Ledger brief missing heading.");
  }

  if (!ledgerBrief.body.text.includes("Blocked Claims")) {
    throw new Error("Release Evidence Ledger brief missing blocked claims section.");
  }

  const promotion = await request("/api/release-continuity/evidence-promotion");
  requireStatus("Release Evidence Promotion Queue", promotion.response.status, 200);
  requireContentType("Release Evidence Promotion Queue", promotion.response, "application/json");
  requireReleaseEvidencePromotionBoundary("Release Evidence Promotion Queue", promotion.response);
  const promotionBody = requireJson("Release Evidence Promotion Queue", promotion.body);
  const serializedPromotion = JSON.stringify(promotionBody);

  if (promotionBody.service !== "scrimed-release-evidence-promotion-queue") {
    throw new Error(`Release Evidence Promotion Queue expected service scrimed-release-evidence-promotion-queue but received ${promotionBody.service}.`);
  }

  if (promotionBody.status !== "release-evidence-promotion-queue-active-human-gated") {
    throw new Error(`Release Evidence Promotion Queue expected active human-gated status but received ${promotionBody.status}.`);
  }

  if (promotionBody.noPhiConfirmed !== true || promotionBody.tokenMaterialCaptured !== false || promotionBody.productionApproval !== false) {
    throw new Error("Release Evidence Promotion Queue must stay no-PHI, no-token, and not production approval.");
  }

  if (promotionBody.buyerDistributionAuthority !== "protected-buyer-diligence-only-after-review") {
    throw new Error("Release Evidence Promotion Queue expected protected buyer diligence authority.");
  }

  if (promotionBody.publicClaimAuthority !== "not-authorized-public-claim") {
    throw new Error("Release Evidence Promotion Queue must keep public claims unauthorized.");
  }

  if (!Array.isArray(promotionBody.queue) || promotionBody.queue.length < 8) {
    throw new Error("Release Evidence Promotion Queue expected release promotion entries.");
  }

  for (const requiredLane of [
    "buyer-diligence-candidate",
    "protected-operator-proof-required",
    "qualified-external-review-required"
  ]) {
    if (!promotionBody.queue.some((item) => item.lane === requiredLane)) {
      throw new Error(`Release Evidence Promotion Queue missing lane ${requiredLane}.`);
    }
  }

  for (const requiredSource of [
    "nonsecret-regression-suite",
    "strict-aal2-durable-store-smoke",
    "qualified-external-approval-review"
  ]) {
    if (!promotionBody.queue.some((item) => item.sourceEntryId === requiredSource)) {
      throw new Error(`Release Evidence Promotion Queue missing source entry ${requiredSource}.`);
    }
  }

  if (!promotionBody.queue.every((item) => /^release-evidence-[a-f0-9]{8}$/.test(item.sourceEvidenceHash))) {
    throw new Error("Release Evidence Promotion Queue expected deterministic source evidence hashes.");
  }

  if (!Array.isArray(promotionBody.blockedClaims) || !promotionBody.blockedClaims.includes("release evidence promotion is production approval")) {
    throw new Error("Release Evidence Promotion Queue expected production approval blocked claim.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serializedPromotion)) {
    throw new Error("Release Evidence Promotion Queue response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serializedPromotion)) {
    throw new Error("Release Evidence Promotion Queue response must not contain bearer-token material.");
  }

  const promotionBrief = await request("/api/release-continuity/evidence-promotion/brief");
  requireStatus("Release Evidence Promotion Queue brief", promotionBrief.response.status, 200);
  requireContentType("Release Evidence Promotion Queue brief", promotionBrief.response, "text/markdown");
  requireReleaseEvidencePromotionBoundary("Release Evidence Promotion Queue brief", promotionBrief.response);

  if (!promotionBrief.body.text.includes("SCRIMED Release Evidence Promotion Queue")) {
    throw new Error("Release Evidence Promotion Queue brief missing heading.");
  }

  if (!promotionBrief.body.text.includes("Blocked Claims")) {
    throw new Error("Release Evidence Promotion Queue brief missing blocked claims section.");
  }

  const freshnessGuard = await request("/api/release-continuity/evidence-freshness-guard");
  requireStatus("Release Evidence Freshness Guard", freshnessGuard.response.status, 200);
  requireContentType("Release Evidence Freshness Guard", freshnessGuard.response, "application/json");
  requireReleaseEvidenceFreshnessGuardBoundary("Release Evidence Freshness Guard", freshnessGuard.response);
  const freshnessGuardBody = requireJson("Release Evidence Freshness Guard", freshnessGuard.body);
  const serializedFreshnessGuard = JSON.stringify(freshnessGuardBody);

  if (freshnessGuardBody.service !== "scrimed-release-evidence-freshness-guard") {
    throw new Error(`Release Evidence Freshness Guard expected service scrimed-release-evidence-freshness-guard but received ${freshnessGuardBody.service}.`);
  }

  if (freshnessGuardBody.status !== "release-evidence-freshness-guard-active-no-secret") {
    throw new Error(`Release Evidence Freshness Guard expected active no-secret status but received ${freshnessGuardBody.status}.`);
  }

  if (!/^freshness-[a-f0-9]{8}$/.test(freshnessGuardBody.freshnessHash ?? "")) {
    throw new Error("Release Evidence Freshness Guard expected deterministic freshness hash.");
  }

  if (
    freshnessGuardBody.noPhiConfirmed !== true ||
    freshnessGuardBody.tokenMaterialCaptured !== false ||
    freshnessGuardBody.productionApproval !== false
  ) {
    throw new Error("Release Evidence Freshness Guard must stay no-PHI, no-token, and not production approval.");
  }

  if (freshnessGuardBody.freshnessAuthority !== "fresh-rerun-required-before-external-use") {
    throw new Error("Release Evidence Freshness Guard expected fresh-rerun authority.");
  }

  if (freshnessGuardBody.publicDistributionAuthority !== "not-authorized") {
    throw new Error("Release Evidence Freshness Guard must keep public distribution unauthorized.");
  }

  if (freshnessGuardBody.customerSpecificAuthority !== "not-authorized-without-customer-permission") {
    throw new Error("Release Evidence Freshness Guard must keep customer-specific sharing gated.");
  }

  if (freshnessGuardBody.clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error("Release Evidence Freshness Guard must keep live clinical care unauthorized.");
  }

  if (freshnessGuardBody.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Release Evidence Freshness Guard must keep PHI authority blocked.");
  }

  if (!Array.isArray(freshnessGuardBody.cards) || freshnessGuardBody.cards.length < 8) {
    throw new Error("Release Evidence Freshness Guard expected freshness cards.");
  }

  for (const requiredFreshnessStatus of [
    "fresh-for-internal-readiness",
    "refresh-required-before-external-sharing",
    "blocked-until-human-aal2-refresh",
    "blocked-until-qualified-review-refresh"
  ]) {
    if (!freshnessGuardBody.cards.some((card) => card.freshnessStatus === requiredFreshnessStatus)) {
      throw new Error(`Release Evidence Freshness Guard missing freshness status ${requiredFreshnessStatus}.`);
    }
  }

  for (const requiredSource of [
    "nonsecret-regression-suite",
    "strict-aal2-durable-store-smoke",
    "qualified-external-approval-review"
  ]) {
    if (!freshnessGuardBody.cards.some((card) => card.sourceEntryId === requiredSource)) {
      throw new Error(`Release Evidence Freshness Guard missing source entry ${requiredSource}.`);
    }
  }

  if (!freshnessGuardBody.cards.every((card) => /^release-evidence-[a-f0-9]{8}$/.test(card.evidenceHash))) {
    throw new Error("Release Evidence Freshness Guard expected deterministic source evidence hashes.");
  }

  if (!Array.isArray(freshnessGuardBody.blockedClaims) || !freshnessGuardBody.blockedClaims.includes("freshness guard is production release approval")) {
    throw new Error("Release Evidence Freshness Guard expected production release blocked claim.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serializedFreshnessGuard)) {
    throw new Error("Release Evidence Freshness Guard response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serializedFreshnessGuard)) {
    throw new Error("Release Evidence Freshness Guard response must not contain bearer-token material.");
  }

  const freshnessGuardBrief = await request("/api/release-continuity/evidence-freshness-guard/brief");
  requireStatus("Release Evidence Freshness Guard brief", freshnessGuardBrief.response.status, 200);
  requireContentType("Release Evidence Freshness Guard brief", freshnessGuardBrief.response, "text/markdown");
  requireReleaseEvidenceFreshnessGuardBoundary("Release Evidence Freshness Guard brief", freshnessGuardBrief.response);

  if (!freshnessGuardBrief.body.text.includes("SCRIMED Release Evidence Freshness Guard")) {
    throw new Error("Release Evidence Freshness Guard brief missing heading.");
  }

  if (!freshnessGuardBrief.body.text.includes("Freshness Cards")) {
    throw new Error("Release Evidence Freshness Guard brief missing freshness cards section.");
  }

  if (!freshnessGuardBrief.body.text.includes("Blocked Claims")) {
    throw new Error("Release Evidence Freshness Guard brief missing blocked claims section.");
  }

  const releaseAuthorizationChain = await request("/api/release-continuity/authorization-chain");
  requireStatus("Release Authorization Chain", releaseAuthorizationChain.response.status, 200);
  requireContentType("Release Authorization Chain", releaseAuthorizationChain.response, "application/json");
  requireReleaseAuthorizationChainBoundary("Release Authorization Chain", releaseAuthorizationChain.response);
  const releaseAuthorizationChainBody = requireJson("Release Authorization Chain", releaseAuthorizationChain.body);
  const serializedReleaseAuthorizationChain = JSON.stringify(releaseAuthorizationChainBody);

  if (releaseAuthorizationChainBody.service !== "scrimed-release-authorization-chain") {
    throw new Error(`Release Authorization Chain expected service scrimed-release-authorization-chain but received ${releaseAuthorizationChainBody.service}.`);
  }

  if (releaseAuthorizationChainBody.status !== "release-authorization-chain-active-no-release-approval") {
    throw new Error(`Release Authorization Chain expected active no-release-approval status but received ${releaseAuthorizationChainBody.status}.`);
  }

  if (!/^release-authorization-[a-f0-9]{8}$/.test(releaseAuthorizationChainBody.authorizationHash ?? "")) {
    throw new Error("Release Authorization Chain expected deterministic authorization hash.");
  }

  if (
    releaseAuthorizationChainBody.noPhiConfirmed !== true ||
    releaseAuthorizationChainBody.tokenMaterialCaptured !== false ||
    releaseAuthorizationChainBody.productionApproval !== false
  ) {
    throw new Error("Release Authorization Chain must stay no-PHI, no-token, and not production approval.");
  }

  if (releaseAuthorizationChainBody.safeUseLabel !== "no-secret-metadata-chain-not-release-approval") {
    throw new Error("Release Authorization Chain expected no-secret safe-use label.");
  }

  if (releaseAuthorizationChainBody.chainDecision !== "blocked-by-design") {
    throw new Error("Release Authorization Chain must remain blocked by design until approvals exist.");
  }

  if (!releaseAuthorizationChainBody.weakestLink?.includes("blocked-by-design")) {
    throw new Error("Release Authorization Chain expected blocked weakest link.");
  }

  if (releaseAuthorizationChainBody.buyerDiligenceMetadataLane !== "available-after-release-steward-review") {
    throw new Error("Release Authorization Chain expected release-steward buyer diligence lane.");
  }

  if (releaseAuthorizationChainBody.protectedProofLane !== "blocked-until-human-aal2") {
    throw new Error("Release Authorization Chain must keep protected proof human AAL2-gated.");
  }

  if (releaseAuthorizationChainBody.publicDistributionAuthority !== "not-authorized") {
    throw new Error("Release Authorization Chain must keep public distribution unauthorized.");
  }

  if (releaseAuthorizationChainBody.customerSpecificAuthority !== "not-authorized-without-customer-permission") {
    throw new Error("Release Authorization Chain must keep customer-specific sharing gated.");
  }

  if (releaseAuthorizationChainBody.releaseAuthority !== "not-release-approval") {
    throw new Error("Release Authorization Chain must not create release authority.");
  }

  if (releaseAuthorizationChainBody.clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error("Release Authorization Chain must keep live clinical care unauthorized.");
  }

  if (releaseAuthorizationChainBody.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Release Authorization Chain must keep PHI authority blocked.");
  }

  if (!Array.isArray(releaseAuthorizationChainBody.controls) || releaseAuthorizationChainBody.controls.length < 8) {
    throw new Error("Release Authorization Chain expected control coverage.");
  }

  for (const requiredControl of [
    "release-evidence-ledger",
    "evidence-freshness-guard",
    "diligence-release-gate",
    "diligence-packet-manifest",
    "recipient-qualification-matrix",
    "diligence-packet-share-guard",
    "protected-aal2-proof"
  ]) {
    if (!releaseAuthorizationChainBody.controls.some((control) => control.id === requiredControl)) {
      throw new Error(`Release Authorization Chain missing control ${requiredControl}.`);
    }
  }

  for (const requiredState of [
    "passed-no-secret",
    "human-review-required",
    "operator-required",
    "blocked-by-design"
  ]) {
    if (!releaseAuthorizationChainBody.controls.some((control) => control.state === requiredState)) {
      throw new Error(`Release Authorization Chain missing control state ${requiredState}.`);
    }
  }

  if (!Array.isArray(releaseAuthorizationChainBody.blockedClaims) || !releaseAuthorizationChainBody.blockedClaims.includes("release authorization chain is release approval")) {
    throw new Error("Release Authorization Chain expected release approval blocked claim.");
  }

  if (!releaseAuthorizationChainBody.blockedClaims.includes("boundary release approved")) {
    throw new Error("Release Authorization Chain expected boundary-release approval blocked claim.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serializedReleaseAuthorizationChain)) {
    throw new Error("Release Authorization Chain response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serializedReleaseAuthorizationChain)) {
    throw new Error("Release Authorization Chain response must not contain bearer-token material.");
  }

  const releaseAuthorizationChainBrief = await request("/api/release-continuity/authorization-chain/brief");
  requireStatus("Release Authorization Chain brief", releaseAuthorizationChainBrief.response.status, 200);
  requireContentType("Release Authorization Chain brief", releaseAuthorizationChainBrief.response, "text/markdown");
  requireReleaseAuthorizationChainBoundary("Release Authorization Chain brief", releaseAuthorizationChainBrief.response);

  if (!releaseAuthorizationChainBrief.body.text.includes("SCRIMED Release Authorization Chain")) {
    throw new Error("Release Authorization Chain brief missing heading.");
  }

  if (!releaseAuthorizationChainBrief.body.text.includes("Control Counts")) {
    throw new Error("Release Authorization Chain brief missing control counts section.");
  }

  if (!releaseAuthorizationChainBrief.body.text.includes("Blocked Claims")) {
    throw new Error("Release Authorization Chain brief missing blocked claims section.");
  }

  const diligenceGate = await request("/api/release-continuity/diligence-gate");
  requireStatus("Diligence Release Gate", diligenceGate.response.status, 200);
  requireContentType("Diligence Release Gate", diligenceGate.response, "application/json");
  requireDiligenceReleaseGateBoundary("Diligence Release Gate", diligenceGate.response);
  const diligenceGateBody = requireJson("Diligence Release Gate", diligenceGate.body);
  const serializedDiligenceGate = JSON.stringify(diligenceGateBody);

  if (diligenceGateBody.service !== "scrimed-diligence-release-gate") {
    throw new Error(`Diligence Release Gate expected service scrimed-diligence-release-gate but received ${diligenceGateBody.service}.`);
  }

  if (diligenceGateBody.status !== "diligence-release-gate-active-no-production-approval") {
    throw new Error(`Diligence Release Gate expected no-production-approval status but received ${diligenceGateBody.status}.`);
  }

  if (diligenceGateBody.noPhiConfirmed !== true || diligenceGateBody.tokenMaterialCaptured !== false || diligenceGateBody.productionApproval !== false) {
    throw new Error("Diligence Release Gate must stay no-PHI, no-token, and not production approval.");
  }

  if (diligenceGateBody.buyerDiligenceGate !== "go-no-secret-metadata-with-release-steward-review") {
    throw new Error("Diligence Release Gate expected no-secret buyer diligence gate.");
  }

  for (const [field, expected] of [
    ["protectedAal2Gate", "no-go-until-human-aal2-retained-packet"],
    ["publicDistributionGate", "no-go-until-qualified-review"],
    ["productionReleaseGate", "no-go-not-release-approval"],
    ["clinicalProductionGate", "no-go-not-authorized-live-care"]
  ]) {
    if (diligenceGateBody[field] !== expected) {
      throw new Error(`Diligence Release Gate expected ${field} ${expected} but received ${diligenceGateBody[field]}.`);
    }
  }

  if (!Array.isArray(diligenceGateBody.cards) || diligenceGateBody.cards.length < 5) {
    throw new Error("Diligence Release Gate expected gate cards.");
  }

  for (const requiredCard of [
    "no-secret-release-evidence",
    "strict-aal2-proof",
    "external-approval-claims",
    "production-and-clinical-authority"
  ]) {
    if (!diligenceGateBody.cards.some((card) => card.id === requiredCard)) {
      throw new Error(`Diligence Release Gate missing card ${requiredCard}.`);
    }
  }

  if (!Array.isArray(diligenceGateBody.blockedClaims) || !diligenceGateBody.blockedClaims.includes("production release approved")) {
    throw new Error("Diligence Release Gate expected production release blocked claim.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serializedDiligenceGate)) {
    throw new Error("Diligence Release Gate response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serializedDiligenceGate)) {
    throw new Error("Diligence Release Gate response must not contain bearer-token material.");
  }

  const diligenceGateBrief = await request("/api/release-continuity/diligence-gate/brief");
  requireStatus("Diligence Release Gate brief", diligenceGateBrief.response.status, 200);
  requireContentType("Diligence Release Gate brief", diligenceGateBrief.response, "text/markdown");
  requireDiligenceReleaseGateBoundary("Diligence Release Gate brief", diligenceGateBrief.response);

  if (!diligenceGateBrief.body.text.includes("SCRIMED Diligence Release Gate")) {
    throw new Error("Diligence Release Gate brief missing heading.");
  }

  if (!diligenceGateBrief.body.text.includes("Blocked Claims")) {
    throw new Error("Diligence Release Gate brief missing blocked claims section.");
  }

  const diligencePacketManifest = await request("/api/release-continuity/diligence-packet-manifest");
  requireStatus("Diligence Packet Manifest", diligencePacketManifest.response.status, 200);
  requireContentType("Diligence Packet Manifest", diligencePacketManifest.response, "application/json");
  requireDiligencePacketManifestBoundary("Diligence Packet Manifest", diligencePacketManifest.response);
  const diligencePacketManifestBody = requireJson("Diligence Packet Manifest", diligencePacketManifest.body);
  const serializedDiligencePacketManifest = JSON.stringify(diligencePacketManifestBody);

  if (diligencePacketManifestBody.service !== "scrimed-diligence-packet-manifest") {
    throw new Error(`Diligence Packet Manifest expected service scrimed-diligence-packet-manifest but received ${diligencePacketManifestBody.service}.`);
  }

  if (diligencePacketManifestBody.status !== "diligence-packet-manifest-active-no-secret") {
    throw new Error(`Diligence Packet Manifest expected active no-secret status but received ${diligencePacketManifestBody.status}.`);
  }

  if (!/^diligence-manifest-[a-f0-9]{8}$/.test(diligencePacketManifestBody.manifestHash ?? "")) {
    throw new Error("Diligence Packet Manifest expected deterministic manifest hash.");
  }

  if (
    diligencePacketManifestBody.noPhiConfirmed !== true ||
    diligencePacketManifestBody.tokenMaterialCaptured !== false ||
    diligencePacketManifestBody.productionApproval !== false
  ) {
    throw new Error("Diligence Packet Manifest must stay no-PHI, no-token, and not production approval.");
  }

  if (diligencePacketManifestBody.packetUseAuthority !== "no-secret-buyer-investor-diligence-only") {
    throw new Error("Diligence Packet Manifest expected no-secret buyer/investor packet authority.");
  }

  if (diligencePacketManifestBody.publicDistributionAuthority !== "not-authorized") {
    throw new Error("Diligence Packet Manifest must keep public distribution unauthorized.");
  }

  if (diligencePacketManifestBody.clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error("Diligence Packet Manifest must keep live clinical care unauthorized.");
  }

  if (diligencePacketManifestBody.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Diligence Packet Manifest must keep PHI authority blocked.");
  }

  if (!Array.isArray(diligencePacketManifestBody.items) || diligencePacketManifestBody.items.length < 8) {
    throw new Error("Diligence Packet Manifest expected manifest items.");
  }

  for (const requiredItem of [
    "enterprise-diligence-snapshot",
    "diligence-release-gate",
    "aal2-smoke-readiness",
    "protected-boundary-release-evidence-intake-packet",
    "qualified-external-approval-claims"
  ]) {
    if (!diligencePacketManifestBody.items.some((item) => item.id === requiredItem)) {
      throw new Error(`Diligence Packet Manifest missing item ${requiredItem}.`);
    }
  }

  for (const requiredShareability of [
    "include-no-secret-metadata",
    "withhold-until-human-aal2",
    "withhold-until-qualified-review"
  ]) {
    if (!diligencePacketManifestBody.items.some((item) => item.shareability === requiredShareability)) {
      throw new Error(`Diligence Packet Manifest missing shareability lane ${requiredShareability}.`);
    }
  }

  if (!Array.isArray(diligencePacketManifestBody.blockedClaims) || !diligencePacketManifestBody.blockedClaims.includes("diligence packet is production approval")) {
    throw new Error("Diligence Packet Manifest expected production approval blocked claim.");
  }

  if (!diligencePacketManifestBody.blockedClaims.includes("boundary release approved")) {
    throw new Error("Diligence Packet Manifest expected boundary-release approval blocked claim.");
  }

  const boundaryIntakePacketItem = diligencePacketManifestBody.items.find(
    (item) => item.id === "protected-boundary-release-evidence-intake-packet"
  );

  if (!boundaryIntakePacketItem) {
    throw new Error("Diligence Packet Manifest missing protected boundary-release evidence intake packet item.");
  }

  if (
    boundaryIntakePacketItem.shareability !== "withhold-until-human-aal2" ||
    boundaryIntakePacketItem.goNoGo !== "no-go" ||
    boundaryIntakePacketItem.apiRoute !== "/api/pilot-workspaces/{workspaceSlug}/boundary-release-evidence-intake/packet"
  ) {
    throw new Error("Diligence Packet Manifest must keep boundary-release intake packet human-AAL2 gated and no-go.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serializedDiligencePacketManifest)) {
    throw new Error("Diligence Packet Manifest response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serializedDiligencePacketManifest)) {
    throw new Error("Diligence Packet Manifest response must not contain bearer-token material.");
  }

  const diligencePacketManifestBrief = await request("/api/release-continuity/diligence-packet-manifest/brief");
  requireStatus("Diligence Packet Manifest brief", diligencePacketManifestBrief.response.status, 200);
  requireContentType("Diligence Packet Manifest brief", diligencePacketManifestBrief.response, "text/markdown");
  requireDiligencePacketManifestBoundary("Diligence Packet Manifest brief", diligencePacketManifestBrief.response);

  if (!diligencePacketManifestBrief.body.text.includes("SCRIMED Diligence Packet Manifest")) {
    throw new Error("Diligence Packet Manifest brief missing heading.");
  }

  if (!diligencePacketManifestBrief.body.text.includes("Packet Assembly Rules")) {
    throw new Error("Diligence Packet Manifest brief missing packet assembly rules section.");
  }

  if (!diligencePacketManifestBrief.body.text.includes("Blocked Claims")) {
    throw new Error("Diligence Packet Manifest brief missing blocked claims section.");
  }

  if (!diligencePacketManifestBrief.body.text.includes("Protected Boundary Release Evidence Intake Packet")) {
    throw new Error("Diligence Packet Manifest brief missing protected boundary-release evidence intake packet.");
  }

  const diligencePacketShareGuard = await request("/api/release-continuity/diligence-packet-share-guard");
  requireStatus("Diligence Packet Share Guard", diligencePacketShareGuard.response.status, 200);
  requireContentType("Diligence Packet Share Guard", diligencePacketShareGuard.response, "application/json");
  requireDiligencePacketShareGuardBoundary("Diligence Packet Share Guard", diligencePacketShareGuard.response);
  const diligencePacketShareGuardBody = requireJson("Diligence Packet Share Guard", diligencePacketShareGuard.body);
  const serializedDiligencePacketShareGuard = JSON.stringify(diligencePacketShareGuardBody);

  if (diligencePacketShareGuardBody.service !== "scrimed-diligence-packet-share-guard") {
    throw new Error(`Diligence Packet Share Guard expected service scrimed-diligence-packet-share-guard but received ${diligencePacketShareGuardBody.service}.`);
  }

  if (diligencePacketShareGuardBody.status !== "diligence-packet-share-guard-active-human-gated") {
    throw new Error(`Diligence Packet Share Guard expected active human-gated status but received ${diligencePacketShareGuardBody.status}.`);
  }

  if (!/^diligence-share-[a-f0-9]{8}$/.test(diligencePacketShareGuardBody.guardHash ?? "")) {
    throw new Error("Diligence Packet Share Guard expected deterministic guard hash.");
  }

  if (
    diligencePacketShareGuardBody.noPhiConfirmed !== true ||
    diligencePacketShareGuardBody.tokenMaterialCaptured !== false ||
    diligencePacketShareGuardBody.productionApproval !== false
  ) {
    throw new Error("Diligence Packet Share Guard must stay no-PHI, no-token, and not production approval.");
  }

  if (diligencePacketShareGuardBody.externalShareAuthority !== "protected-diligence-only-after-human-review") {
    throw new Error("Diligence Packet Share Guard expected protected diligence share authority.");
  }

  if (diligencePacketShareGuardBody.recipientAuthorizationAuthority !== "recipient-specific-human-approval-required") {
    throw new Error("Diligence Packet Share Guard expected recipient-specific authorization authority.");
  }

  if (diligencePacketShareGuardBody.publicDistributionAuthority !== "not-authorized") {
    throw new Error("Diligence Packet Share Guard must keep public distribution unauthorized.");
  }

  if (diligencePacketShareGuardBody.customerSpecificAuthority !== "not-authorized-without-customer-permission") {
    throw new Error("Diligence Packet Share Guard must keep customer-specific sharing gated.");
  }

  if (diligencePacketShareGuardBody.clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error("Diligence Packet Share Guard must keep live clinical care unauthorized.");
  }

  if (diligencePacketShareGuardBody.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Diligence Packet Share Guard must keep PHI authority blocked.");
  }

  if (!Array.isArray(diligencePacketShareGuardBody.cards) || diligencePacketShareGuardBody.cards.length < 6) {
    throw new Error("Diligence Packet Share Guard expected share-decision cards.");
  }

  for (const requiredCard of [
    "internal-release-steward-review",
    "qualified-buyer-investor-review",
    "protected-boundary-release-evidence-intake-packet-sharing",
    "customer-specific-recipient",
    "public-press-distribution",
    "security-certification-reviewer"
  ]) {
    if (!diligencePacketShareGuardBody.cards.some((card) => card.id === requiredCard)) {
      throw new Error(`Diligence Packet Share Guard missing card ${requiredCard}.`);
    }
  }

  for (const requiredDecision of [
    "allow-internal-no-secret",
    "review-required-protected-diligence",
    "withhold-until-customer-authorization",
    "withhold-until-qualified-review",
    "no-go"
  ]) {
    if (!diligencePacketShareGuardBody.cards.some((card) => card.decision === requiredDecision)) {
      throw new Error(`Diligence Packet Share Guard missing decision ${requiredDecision}.`);
    }
  }

  if (
    !Array.isArray(diligencePacketShareGuardBody.blockedClaims) ||
    !diligencePacketShareGuardBody.blockedClaims.includes("packet share guard is public distribution approval")
  ) {
    throw new Error("Diligence Packet Share Guard expected public distribution blocked claim.");
  }

  if (!diligencePacketShareGuardBody.blockedClaims.includes("boundary release approved")) {
    throw new Error("Diligence Packet Share Guard expected boundary-release approval blocked claim.");
  }

  const boundaryReleasePacketShareCard = diligencePacketShareGuardBody.cards.find(
    (card) => card.id === "protected-boundary-release-evidence-intake-packet-sharing"
  );

  if (!boundaryReleasePacketShareCard) {
    throw new Error("Diligence Packet Share Guard missing protected boundary-release packet share card.");
  }

  if (
    boundaryReleasePacketShareCard.artifactId !== "protected-boundary-release-evidence-intake-packet" ||
    boundaryReleasePacketShareCard.protectedPacketRoute !==
      "/api/pilot-workspaces/{workspaceSlug}/boundary-release-evidence-intake/packet" ||
    boundaryReleasePacketShareCard.decision !== "withhold-until-qualified-review"
  ) {
    throw new Error("Diligence Packet Share Guard must keep the boundary-release packet withheld until qualified review.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serializedDiligencePacketShareGuard)) {
    throw new Error("Diligence Packet Share Guard response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serializedDiligencePacketShareGuard)) {
    throw new Error("Diligence Packet Share Guard response must not contain bearer-token material.");
  }

  const diligencePacketShareGuardBrief = await request("/api/release-continuity/diligence-packet-share-guard/brief");
  requireStatus("Diligence Packet Share Guard brief", diligencePacketShareGuardBrief.response.status, 200);
  requireContentType("Diligence Packet Share Guard brief", diligencePacketShareGuardBrief.response, "text/markdown");
  requireDiligencePacketShareGuardBoundary("Diligence Packet Share Guard brief", diligencePacketShareGuardBrief.response);

  if (!diligencePacketShareGuardBrief.body.text.includes("SCRIMED Diligence Packet Share Guard")) {
    throw new Error("Diligence Packet Share Guard brief missing heading.");
  }

  if (!diligencePacketShareGuardBrief.body.text.includes("Share Decisions")) {
    throw new Error("Diligence Packet Share Guard brief missing share decisions section.");
  }

  if (!diligencePacketShareGuardBrief.body.text.includes("Blocked Claims")) {
    throw new Error("Diligence Packet Share Guard brief missing blocked claims section.");
  }

  if (!diligencePacketShareGuardBrief.body.text.includes("protected-boundary-release-evidence-intake-packet-sharing")) {
    throw new Error("Diligence Packet Share Guard brief missing protected boundary-release packet share card.");
  }

  const recipientQualificationMatrix = await request("/api/release-continuity/recipient-qualification-matrix");
  requireStatus("Recipient Qualification Matrix", recipientQualificationMatrix.response.status, 200);
  requireContentType("Recipient Qualification Matrix", recipientQualificationMatrix.response, "application/json");
  requireRecipientQualificationMatrixBoundary(
    "Recipient Qualification Matrix",
    recipientQualificationMatrix.response
  );
  const recipientQualificationMatrixBody = requireJson(
    "Recipient Qualification Matrix",
    recipientQualificationMatrix.body
  );
  const serializedRecipientQualificationMatrix = JSON.stringify(recipientQualificationMatrixBody);

  if (recipientQualificationMatrixBody.service !== "scrimed-recipient-qualification-matrix") {
    throw new Error(`Recipient Qualification Matrix expected service scrimed-recipient-qualification-matrix but received ${recipientQualificationMatrixBody.service}.`);
  }

  if (recipientQualificationMatrixBody.status !== "recipient-qualification-matrix-active-no-secret") {
    throw new Error(`Recipient Qualification Matrix expected active no-secret status but received ${recipientQualificationMatrixBody.status}.`);
  }

  if (!/^recipient-qualification-[a-f0-9]{8}$/.test(recipientQualificationMatrixBody.qualificationHash ?? "")) {
    throw new Error("Recipient Qualification Matrix expected deterministic qualification hash.");
  }

  if (
    recipientQualificationMatrixBody.noPhiConfirmed !== true ||
    recipientQualificationMatrixBody.tokenMaterialCaptured !== false ||
    recipientQualificationMatrixBody.productionApproval !== false
  ) {
    throw new Error("Recipient Qualification Matrix must stay no-PHI, no-token, and not production approval.");
  }

  if (recipientQualificationMatrixBody.externalShareAuthority !== "qualified-recipient-review-required") {
    throw new Error("Recipient Qualification Matrix expected qualified-recipient review authority.");
  }

  if (recipientQualificationMatrixBody.publicDistributionAuthority !== "not-authorized") {
    throw new Error("Recipient Qualification Matrix must keep public distribution unauthorized.");
  }

  if (recipientQualificationMatrixBody.recipientIdentifierStorage !== "not-stored-in-scrimed") {
    throw new Error("Recipient Qualification Matrix must not store recipient identifiers.");
  }

  if (recipientQualificationMatrixBody.customerSpecificAuthority !== "not-authorized-without-customer-permission") {
    throw new Error("Recipient Qualification Matrix must keep customer-specific sharing gated.");
  }

  if (recipientQualificationMatrixBody.clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error("Recipient Qualification Matrix must keep live clinical care unauthorized.");
  }

  if (recipientQualificationMatrixBody.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Recipient Qualification Matrix must keep PHI authority blocked.");
  }

  if (!Array.isArray(recipientQualificationMatrixBody.entries) || recipientQualificationMatrixBody.entries.length < 6) {
    throw new Error("Recipient Qualification Matrix expected qualification entries.");
  }

  for (const requiredEntry of [
    "internal-release-steward-preflight",
    "qualified-buyer-investor-preflight",
    "customer-specific-recipient-preflight",
    "public-press-recipient-preflight",
    "clinical-production-reviewer-preflight",
    "security-certification-reviewer-preflight"
  ]) {
    if (!recipientQualificationMatrixBody.entries.some((entry) => entry.id === requiredEntry)) {
      throw new Error(`Recipient Qualification Matrix missing entry ${requiredEntry}.`);
    }
  }

  for (const requiredDecision of [
    "eligible-internal-no-secret",
    "eligible-after-human-review",
    "blocked-until-customer-authorization",
    "blocked-until-qualified-review",
    "blocked"
  ]) {
    if (!recipientQualificationMatrixBody.entries.some((entry) => entry.defaultDecision === requiredDecision)) {
      throw new Error(`Recipient Qualification Matrix missing decision ${requiredDecision}.`);
    }
  }

  if (
    !Array.isArray(recipientQualificationMatrixBody.blockedClaims) ||
    !recipientQualificationMatrixBody.blockedClaims.includes("recipient qualification matrix is distribution approval")
  ) {
    throw new Error("Recipient Qualification Matrix expected distribution approval blocked claim.");
  }

  if (!recipientQualificationMatrixBody.blockedClaims.includes("boundary release approved")) {
    throw new Error("Recipient Qualification Matrix expected boundary-release approval blocked claim.");
  }

  if (
    !Array.isArray(recipientQualificationMatrixBody.preflightChecklist) ||
    !recipientQualificationMatrixBody.preflightChecklist.some((item) =>
      item.includes("Diligence Packet Share Guard")
    )
  ) {
    throw new Error("Recipient Qualification Matrix expected share guard preflight linkage.");
  }

  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serializedRecipientQualificationMatrix)) {
    throw new Error("Recipient Qualification Matrix response must not contain JWT-like material.");
  }

  if (/Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i.test(serializedRecipientQualificationMatrix)) {
    throw new Error("Recipient Qualification Matrix response must not contain bearer-token material.");
  }

  const recipientQualificationMatrixBrief = await request("/api/release-continuity/recipient-qualification-matrix/brief");
  requireStatus("Recipient Qualification Matrix brief", recipientQualificationMatrixBrief.response.status, 200);
  requireContentType("Recipient Qualification Matrix brief", recipientQualificationMatrixBrief.response, "text/markdown");
  requireRecipientQualificationMatrixBoundary(
    "Recipient Qualification Matrix brief",
    recipientQualificationMatrixBrief.response
  );

  if (!recipientQualificationMatrixBrief.body.text.includes("SCRIMED Recipient Qualification Matrix")) {
    throw new Error("Recipient Qualification Matrix brief missing heading.");
  }

  if (!recipientQualificationMatrixBrief.body.text.includes("Recipient Classes")) {
    throw new Error("Recipient Qualification Matrix brief missing recipient classes section.");
  }

  if (!recipientQualificationMatrixBrief.body.text.includes("Preflight Checklist")) {
    throw new Error("Recipient Qualification Matrix brief missing preflight checklist section.");
  }

  if (!recipientQualificationMatrixBrief.body.text.includes("Blocked Claims")) {
    throw new Error("Recipient Qualification Matrix brief missing blocked claims section.");
  }

  console.log("pass release continuity");
}

async function checkNavigationAudit() {
  const result = await request("/api/navigation-audit");
  requireStatus("Navigation Audit", result.response.status, 200);
  requireContentType("Navigation Audit", result.response, "application/json");
  requireNavigationAuditBoundary("Navigation Audit", result.response);
  const body = requireJson("Navigation Audit", result.body);

  if (body.service !== "scrimed-navigation-audit") {
    throw new Error(`Navigation Audit expected scrimed-navigation-audit but received ${body.service}.`);
  }

  if (body.status !== "route-navigation-audit-active") {
    throw new Error(`Navigation Audit expected active status but received ${body.status}.`);
  }

  if (body.coverage?.protectedCoverageStatus !== "fail-closed-publicly-aal2-required-for-happy-path") {
    throw new Error("Navigation Audit must preserve protected fail-closed and AAL2 boundary status.");
  }

  if (body.coverage?.releaseAuthority !== "not-release-approval") {
    throw new Error("Navigation Audit must not create release authority.");
  }

  if (body.coverage?.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Navigation Audit must keep PHI authority blocked.");
  }

  if (!Array.isArray(body.groups) || body.groups.length < 8) {
    throw new Error("Navigation Audit expected at least eight route groups.");
  }

  if (!Array.isArray(body.siteNavigationSections) || body.siteNavigationSections.length < 5) {
    throw new Error("Navigation Audit expected app-wide site navigation sections.");
  }

  if (!Array.isArray(body.roleJourneys) || body.roleJourneys.length < 5) {
    throw new Error("Navigation Audit expected role-based navigation journeys.");
  }

  if (!Array.isArray(body.limitationControls) || body.limitationControls.length < 14) {
    throw new Error("Navigation Audit expected limitation-control navigation links.");
  }

  if (body.coverage?.siteNavigationSectionCount < 5) {
    throw new Error("Navigation Audit expected site navigation section count.");
  }

  if (body.coverage?.roleJourneyCount < 5) {
    throw new Error("Navigation Audit expected role journey count.");
  }

  if (body.coverage?.limitationControlCount < 14) {
    throw new Error("Navigation Audit expected limitation control count.");
  }

  if (!Array.isArray(body.pageRouteInventory) || !body.pageRouteInventory.includes("/navigation")) {
    throw new Error("Navigation Audit expected /navigation in page route inventory.");
  }

  if (!body.pageRouteInventory.includes("/company-assessment")) {
    throw new Error("Navigation Audit expected /company-assessment in page route inventory.");
  }

  if (!body.pageRouteInventory.includes("/synthetic-pilot")) {
    throw new Error("Navigation Audit expected /synthetic-pilot in page route inventory.");
  }

  if (!body.pageRouteInventory.includes("/clinical-production-readiness")) {
    throw new Error("Navigation Audit expected /clinical-production-readiness in page route inventory.");
  }

  if (!body.pageRouteInventory.includes("/pilot-demo-commercial-readiness")) {
    throw new Error("Navigation Audit expected /pilot-demo-commercial-readiness in page route inventory.");
  }

  if (!body.pageRouteInventory.includes("/service-reliability")) {
    throw new Error("Navigation Audit expected /service-reliability in page route inventory.");
  }

  if (!body.pageRouteInventory.includes("/capital-vitality")) {
    throw new Error("Navigation Audit expected /capital-vitality in page route inventory.");
  }

  if (!body.pageRouteInventory.includes("/growth-engine")) {
    throw new Error("Navigation Audit expected /growth-engine in page route inventory.");
  }

  if (!body.pageRouteInventory.includes("/investor-audience-readiness")) {
    throw new Error("Navigation Audit expected /investor-audience-readiness in page route inventory.");
  }

  if (!body.pageRouteInventory.includes("/launch-readiness")) {
    throw new Error("Navigation Audit expected /launch-readiness in page route inventory.");
  }

  if (!body.pageRouteInventory.includes("/enterprise-business-ops")) {
    throw new Error("Navigation Audit expected /enterprise-business-ops in page route inventory.");
  }

  if (!body.pageRouteInventory.includes("/enterprise-scalability")) {
    throw new Error("Navigation Audit expected /enterprise-scalability in page route inventory.");
  }

  if (!body.pageRouteInventory.includes("/platform-power")) {
    throw new Error("Navigation Audit expected /platform-power in page route inventory.");
  }

  if (!body.pageRouteInventory.includes("/limitations-workarounds")) {
    throw new Error("Navigation Audit expected /limitations-workarounds in page route inventory.");
  }

  if (!body.pageRouteInventory.includes("/competitive-intelligence")) {
    throw new Error("Navigation Audit expected /competitive-intelligence in page route inventory.");
  }

  if (!body.pageRouteInventory.includes("/competitive-defense")) {
    throw new Error("Navigation Audit expected /competitive-defense in page route inventory.");
  }

  if (!body.pageRouteInventory.includes("/global-certification-readiness")) {
    throw new Error("Navigation Audit expected /global-certification-readiness in page route inventory.");
  }

  if (!body.pageRouteInventory.includes("/health-records")) {
    throw new Error("Navigation Audit expected /health-records in page route inventory.");
  }

  if (!body.pageRouteInventory.includes("/offerings")) {
    throw new Error("Navigation Audit expected /offerings in page route inventory.");
  }

  if (!body.pageRouteInventory.includes("/service-delivery")) {
    throw new Error("Navigation Audit expected /service-delivery in page route inventory.");
  }

  if (!body.pageRouteInventory.includes("/client-onboarding")) {
    throw new Error("Navigation Audit expected /client-onboarding in page route inventory.");
  }

  if (!body.pageRouteInventory.includes("/continuous-review-audit")) {
    throw new Error("Navigation Audit expected /continuous-review-audit in page route inventory.");
  }

  if (!Array.isArray(body.smokeCoveredHtmlRoutes) || !body.smokeCoveredHtmlRoutes.includes("/navigation")) {
    throw new Error("Navigation Audit expected /navigation in smoke-covered HTML routes.");
  }

  if (!body.smokeCoveredHtmlRoutes.includes("/company-assessment")) {
    throw new Error("Navigation Audit expected /company-assessment in smoke-covered HTML routes.");
  }

  if (!body.smokeCoveredHtmlRoutes.includes("/synthetic-pilot")) {
    throw new Error("Navigation Audit expected /synthetic-pilot in smoke-covered HTML routes.");
  }

  if (!body.smokeCoveredHtmlRoutes.includes("/clinical-production-readiness")) {
    throw new Error("Navigation Audit expected /clinical-production-readiness in smoke-covered HTML routes.");
  }

  if (!body.smokeCoveredHtmlRoutes.includes("/pilot-demo-commercial-readiness")) {
    throw new Error("Navigation Audit expected /pilot-demo-commercial-readiness in smoke-covered HTML routes.");
  }

  if (!body.smokeCoveredHtmlRoutes.includes("/service-reliability")) {
    throw new Error("Navigation Audit expected /service-reliability in smoke-covered HTML routes.");
  }

  if (!body.smokeCoveredHtmlRoutes.includes("/capital-vitality")) {
    throw new Error("Navigation Audit expected /capital-vitality in smoke-covered HTML routes.");
  }

  if (!body.smokeCoveredHtmlRoutes.includes("/growth-engine")) {
    throw new Error("Navigation Audit expected /growth-engine in smoke-covered HTML routes.");
  }

  if (!body.smokeCoveredHtmlRoutes.includes("/investor-audience-readiness")) {
    throw new Error("Navigation Audit expected /investor-audience-readiness in smoke-covered HTML routes.");
  }

  if (!body.smokeCoveredHtmlRoutes.includes("/launch-readiness")) {
    throw new Error("Navigation Audit expected /launch-readiness in smoke-covered HTML routes.");
  }

  if (!body.smokeCoveredHtmlRoutes.includes("/enterprise-business-ops")) {
    throw new Error("Navigation Audit expected /enterprise-business-ops in smoke-covered HTML routes.");
  }

  if (!body.smokeCoveredHtmlRoutes.includes("/enterprise-scalability")) {
    throw new Error("Navigation Audit expected /enterprise-scalability in smoke-covered HTML routes.");
  }

  if (!body.smokeCoveredHtmlRoutes.includes("/platform-power")) {
    throw new Error("Navigation Audit expected /platform-power in smoke-covered HTML routes.");
  }

  if (!body.smokeCoveredHtmlRoutes.includes("/scrimed-p33")) {
    throw new Error("Navigation Audit expected /scrimed-p33 in smoke-covered HTML routes.");
  }

  if (!body.smokeCoveredHtmlRoutes.includes("/scrimed-p34")) {
    throw new Error("Navigation Audit expected /scrimed-p34 in smoke-covered HTML routes.");
  }

  if (!body.smokeCoveredHtmlRoutes.includes("/limitations-workarounds")) {
    throw new Error("Navigation Audit expected /limitations-workarounds in smoke-covered HTML routes.");
  }

  if (!body.smokeCoveredHtmlRoutes.includes("/competitive-intelligence")) {
    throw new Error("Navigation Audit expected /competitive-intelligence in smoke-covered HTML routes.");
  }

  if (!body.smokeCoveredHtmlRoutes.includes("/competitive-defense")) {
    throw new Error("Navigation Audit expected /competitive-defense in smoke-covered HTML routes.");
  }

  if (!body.smokeCoveredHtmlRoutes.includes("/global-certification-readiness")) {
    throw new Error("Navigation Audit expected /global-certification-readiness in smoke-covered HTML routes.");
  }

  if (!body.smokeCoveredHtmlRoutes.includes("/health-records")) {
    throw new Error("Navigation Audit expected /health-records in smoke-covered HTML routes.");
  }

  if (!body.smokeCoveredHtmlRoutes.includes("/offerings")) {
    throw new Error("Navigation Audit expected /offerings in smoke-covered HTML routes.");
  }

  if (!body.smokeCoveredHtmlRoutes.includes("/service-delivery")) {
    throw new Error("Navigation Audit expected /service-delivery in smoke-covered HTML routes.");
  }

  if (!body.smokeCoveredHtmlRoutes.includes("/client-onboarding")) {
    throw new Error("Navigation Audit expected /client-onboarding in smoke-covered HTML routes.");
  }

  if (!body.smokeCoveredHtmlRoutes.includes("/continuous-review-audit")) {
    throw new Error("Navigation Audit expected /continuous-review-audit in smoke-covered HTML routes.");
  }

  if (!body.smokeCoveredHtmlRoutes.includes("/validation-evidence")) {
    throw new Error("Navigation Audit expected /validation-evidence in smoke-covered HTML routes.");
  }

  if (!body.smokeCoveredHtmlRoutes.includes("/legal")) {
    throw new Error("Navigation Audit expected /legal in smoke-covered HTML routes.");
  }

  if (!Array.isArray(body.bottlenecks) || !body.bottlenecks.some((bottleneck) => bottleneck.status === "operator-required")) {
    throw new Error("Navigation Audit expected an operator-required AAL2 bottleneck.");
  }

  const sourcePageRouteCount = await countRouteFiles("app", "page.tsx");
  const sourceApiRoutePatternCount = await countRouteFiles("app/api", "route.ts");

  if (body.sourceTotals?.pageRouteCount !== sourcePageRouteCount) {
    throw new Error(`Navigation Audit page route count mismatch. API reported ${body.sourceTotals?.pageRouteCount}; source has ${sourcePageRouteCount}.`);
  }

  if (body.sourceTotals?.apiRoutePatternCount !== sourceApiRoutePatternCount) {
    throw new Error(`Navigation Audit API route count mismatch. API reported ${body.sourceTotals?.apiRoutePatternCount}; source has ${sourceApiRoutePatternCount}.`);
  }

  const brief = await request("/api/navigation-audit/brief");
  requireStatus("Navigation Audit brief", brief.response.status, 200);
  requireContentType("Navigation Audit brief", brief.response, "text/markdown");
  requireNavigationAuditBoundary("Navigation Audit brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Navigation Audit Brief")) {
    throw new Error("Navigation Audit brief missing heading.");
  }

  if (!brief.body.text.includes("not release approval")) {
    throw new Error("Navigation Audit brief missing release boundary.");
  }

  console.log("pass navigation audit");
}

async function checkServiceReliability() {
  const result = await request("/api/service-reliability");
  requireStatus("Service Reliability", result.response.status, 200);
  requireContentType("Service Reliability", result.response, "application/json");
  requireServiceReliabilityBoundary("Service Reliability", result.response);
  const body = requireJson("Service Reliability", result.body);

  if (body.service !== "scrimed-service-reliability") {
    throw new Error(`Service Reliability expected scrimed-service-reliability but received ${body.service}.`);
  }

  if (body.status !== "service-reliability-hardening-active") {
    throw new Error(`Service Reliability expected active status but received ${body.status}.`);
  }

  if (body.authority?.releaseAuthority !== "not-release-approval") {
    throw new Error("Service Reliability must not create release authority.");
  }

  if (body.authority?.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Service Reliability must keep PHI authority blocked.");
  }

  if (!Array.isArray(body.productServiceControls) || body.productServiceControls.length < 10) {
    throw new Error("Service Reliability expected product/service control coverage.");
  }

  if (!Array.isArray(body.faultClasses) || body.faultClasses.length < 8) {
    throw new Error("Service Reliability expected fault-class coverage.");
  }

  if (!Array.isArray(body.efficiencyImprovements) || body.efficiencyImprovements.length < 6) {
    throw new Error("Service Reliability expected efficiency-improvement coverage.");
  }

  if (!body.operatorRequiredControlCount) {
    throw new Error("Service Reliability expected an operator-required control.");
  }

  if (!body.externalReviewControlCount) {
    throw new Error("Service Reliability expected external-review controls.");
  }

  if (!body.protectedGateControlCount) {
    throw new Error("Service Reliability expected protected-gated controls.");
  }

  const sourcePageRouteCount = await countRouteFiles("app", "page.tsx");
  const sourceApiRoutePatternCount = await countRouteFiles("app/api", "route.ts");

  if (body.sourceAlignment?.pageRouteCount !== sourcePageRouteCount) {
    throw new Error(`Service Reliability page route count mismatch. API reported ${body.sourceAlignment?.pageRouteCount}; source has ${sourcePageRouteCount}.`);
  }

  if (body.sourceAlignment?.apiRoutePatternCount !== sourceApiRoutePatternCount) {
    throw new Error(`Service Reliability API route count mismatch. API reported ${body.sourceAlignment?.apiRoutePatternCount}; source has ${sourceApiRoutePatternCount}.`);
  }

  const brief = await request("/api/service-reliability/brief");
  requireStatus("Service Reliability brief", brief.response.status, 200);
  requireContentType("Service Reliability brief", brief.response, "text/markdown");
  requireServiceReliabilityBoundary("Service Reliability brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Service Reliability Brief")) {
    throw new Error("Service Reliability brief missing heading.");
  }

  if (!brief.body.text.includes("not release approval")) {
    throw new Error("Service Reliability brief missing release boundary.");
  }

  console.log("pass service reliability");
}

async function checkOperationalEfficiency() {
  const result = await request("/api/operational-efficiency");
  requireStatus("Operational Efficiency", result.response.status, 200);
  requireContentType("Operational Efficiency", result.response, "application/json");
  requireOperationalEfficiencyBoundary("Operational Efficiency", result.response);
  const body = requireJson("Operational Efficiency", result.body);

  if (body.service !== "scrimed-operational-efficiency") {
    throw new Error(`Operational Efficiency expected scrimed-operational-efficiency but received ${body.service}.`);
  }

  if (body.status !== "operational-efficiency-bottleneck-resolution-control-plane-active") {
    throw new Error(`Operational Efficiency expected active status but received ${body.status}.`);
  }

  if (body.authority?.autonomyAuthority !== "no-autonomous-production-remediation") {
    throw new Error("Operational Efficiency must not authorize autonomous production remediation.");
  }

  if (body.authority?.revenueAuthority !== "not-revenue-guarantee") {
    throw new Error("Operational Efficiency must not create revenue guarantees.");
  }

  if (body.authority?.profitAuthority !== "not-profit-margin-guarantee") {
    throw new Error("Operational Efficiency must not create profit margin guarantees.");
  }

  if (!Array.isArray(body.records) || body.records.length < 40) {
    throw new Error("Operational Efficiency expected broad bottleneck record coverage.");
  }

  if (!body.openBottleneckCount || body.openBottleneckCount < 10) {
    throw new Error("Operational Efficiency expected open-bottleneck pressure coverage.");
  }

  if (!Array.isArray(body.sprints) || body.sprints.length < 6) {
    throw new Error("Operational Efficiency expected resolution sprint coverage.");
  }

  if (!Array.isArray(body.metrics) || body.metrics.length < 4) {
    throw new Error("Operational Efficiency expected operational metric coverage.");
  }

  if (!Array.isArray(body.discrepancyFaultTriageQueue) || body.discrepancyFaultTriageQueue.length < 8) {
    throw new Error("Operational Efficiency expected discrepancy and fault triage coverage.");
  }

  if (!body.discrepancyFaultTriageQueue.some((item) => item.id === "route-api-smoke-drift")) {
    throw new Error("Operational Efficiency expected route/API/smoke drift triage.");
  }

  if (!body.discrepancyFaultTriageQueue.some((item) => item.id === "protected-auth-status-mismatch")) {
    throw new Error("Operational Efficiency expected protected auth status mismatch triage.");
  }

  if (!body.discrepancyFaultTriageQueue.some((item) => item.id === "claims-boundary-drift")) {
    throw new Error("Operational Efficiency expected claims boundary drift triage.");
  }

  if (!body.discrepancyFaultTriageQueue.some((item) => item.id === "interoperability-live-data-slip")) {
    throw new Error("Operational Efficiency expected interoperability live-data slip triage.");
  }

  if (!body.discrepancyFaultTriageQueue.some((item) => item.id === "finance-margin-leak")) {
    throw new Error("Operational Efficiency expected finance margin leak triage.");
  }

  if (
    !body.discrepancyFaultTriageQueue.every(
      (item) => item.immediateContainment && item.rootCauseProbe && item.permanentControl
    )
  ) {
    throw new Error("Operational Efficiency expected each triage item to include containment, root-cause probe, and permanent control.");
  }

  if ((body.countsByDomain?.["release-quality"] ?? 0) < 1) {
    throw new Error("Operational Efficiency expected release-quality domain coverage.");
  }

  if ((body.countsByDomain?.["service-reliability"] ?? 0) < 10) {
    throw new Error("Operational Efficiency expected service-reliability domain coverage.");
  }

  if ((body.countsByDomain?.["offering-packaging"] ?? 0) < 8) {
    throw new Error("Operational Efficiency expected offering-packaging domain coverage.");
  }

  if ((body.countsByDomain?.["client-onboarding"] ?? 0) < 14) {
    throw new Error("Operational Efficiency expected client-onboarding domain coverage.");
  }

  if ((body.countsByDomain?.["enterprise-scalability"] ?? 0) < 12) {
    throw new Error("Operational Efficiency expected enterprise-scalability domain coverage.");
  }

  if ((body.countsByDomain?.["platform-power"] ?? 0) < 18) {
    throw new Error("Operational Efficiency expected platform-power domain coverage.");
  }

  if ((body.countsByDomain?.["limitations-workarounds"] ?? 0) < 18) {
    throw new Error("Operational Efficiency expected limitations-workarounds domain coverage.");
  }

  if ((body.countsByDomain?.["enterprise-operations"] ?? 0) < 10) {
    throw new Error("Operational Efficiency expected enterprise-operations domain coverage.");
  }

  if ((body.sourceAlignment?.enterpriseScalabilityControlCount ?? 0) < 10) {
    throw new Error("Operational Efficiency expected enterprise scalability source alignment.");
  }

  if ((body.sourceAlignment?.platformPowerControlCount ?? 0) < 12) {
    throw new Error("Operational Efficiency expected platform power source alignment.");
  }

  if ((body.sourceAlignment?.limitationsWorkaroundTrackCount ?? 0) < 10) {
    throw new Error("Operational Efficiency expected limitations workaround source alignment.");
  }

  if ((body.countsByDomain?.["health-records-safety"] ?? 0) < 5) {
    throw new Error("Operational Efficiency expected health-records safety domain coverage.");
  }

  if (!Array.isArray(body.hardStops) || !body.hardStops.some((stop) => stop.includes("PHI"))) {
    throw new Error("Operational Efficiency expected PHI hard-stop visibility.");
  }

  if (!body.records.some((record) => record.status === "operator-required")) {
    throw new Error("Operational Efficiency expected operator-required bottleneck coverage.");
  }

  const brief = await request("/api/operational-efficiency/brief");
  requireStatus("Operational Efficiency brief", brief.response.status, 200);
  requireContentType("Operational Efficiency brief", brief.response, "text/markdown");
  requireOperationalEfficiencyBoundary("Operational Efficiency brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Operational Efficiency Brief")) {
    throw new Error("Operational Efficiency brief missing heading.");
  }

  if (!brief.body.text.includes("not autonomous production remediation")) {
    throw new Error("Operational Efficiency brief missing autonomy boundary.");
  }

  if (!brief.body.text.includes("Discrepancy And Fault Triage")) {
    throw new Error("Operational Efficiency brief missing discrepancy and fault triage section.");
  }

  console.log("pass operational efficiency");
}

async function checkScrimedAutomationAutopilot() {
  const result = await request("/api/scrimed-automation-autopilot");
  requireStatus("SCRIMED Automation Autopilot", result.response.status, 200);
  requireContentType("SCRIMED Automation Autopilot", result.response, "application/json");
  requireScrimedAutomationAutopilotBoundary("SCRIMED Automation Autopilot", result.response);
  const body = requireJson("SCRIMED Automation Autopilot", result.body);

  if (body.service !== "scrimed-automation-autopilot") {
    throw new Error(`SCRIMED Automation Autopilot expected scrimed-automation-autopilot but received ${body.service}.`);
  }

  if (body.status !== "scrimed-automation-autopilot-active-synthetic-no-phi") {
    throw new Error(`SCRIMED Automation Autopilot expected active synthetic no-PHI status but received ${body.status}.`);
  }

  if (body.authority?.autonomyAuthority !== "synthetic-and-review-gated-only") {
    throw new Error("SCRIMED Automation Autopilot must keep autonomy synthetic and review-gated.");
  }

  if (body.authority?.productionRemediationAuthority !== "not-authorized") {
    throw new Error("SCRIMED Automation Autopilot must not authorize production remediation.");
  }

  if (body.authority?.customerGoLiveAuthority !== "not-customer-go-live-approval") {
    throw new Error("SCRIMED Automation Autopilot must not approve customer go-live.");
  }

  if (!Array.isArray(body.capabilities) || body.capabilities.length < 10) {
    throw new Error("SCRIMED Automation Autopilot expected broad capability coverage.");
  }

  if (!body.capabilities.every((capability) => capability.humanReviewRequired === true && capability.productionAuthority === false)) {
    throw new Error("SCRIMED Automation Autopilot expected every capability to require human review and block production authority.");
  }

  if (!body.capabilities.some((capability) => capability.mode === "synthetic-autopilot")) {
    throw new Error("SCRIMED Automation Autopilot expected at least one synthetic-autopilot lane.");
  }

  if (!body.capabilities.some((capability) => capability.mode === "review-gated-automation")) {
    throw new Error("SCRIMED Automation Autopilot expected at least one review-gated automation lane.");
  }

  if (!body.capabilities.some((capability) => capability.id === "service-delivery-autopilot")) {
    throw new Error("SCRIMED Automation Autopilot expected service delivery autopilot.");
  }

  if (!body.capabilities.some((capability) => capability.id === "agent-approval-autopilot")) {
    throw new Error("SCRIMED Automation Autopilot expected agent approval autopilot.");
  }

  if (!Array.isArray(body.bottleneckWorkarounds) || body.bottleneckWorkarounds.length < 4) {
    throw new Error("SCRIMED Automation Autopilot expected bottleneck workaround coverage.");
  }

  if (!Array.isArray(body.sampleDecisions) || !body.sampleDecisions.some((decision) => decision.decision === "block-production-action")) {
    throw new Error("SCRIMED Automation Autopilot expected block-production-action sample decision.");
  }

  if (!body.sampleDecisions.some((decision) => decision.decision === "require-human-review")) {
    throw new Error("SCRIMED Automation Autopilot expected require-human-review sample decision.");
  }

  if ((body.sourceAlignment?.liveActivationPlanCount ?? 0) < 1) {
    throw new Error("SCRIMED Automation Autopilot expected service delivery live activation alignment.");
  }

  const brief = await request("/api/scrimed-automation-autopilot/brief");
  requireStatus("SCRIMED Automation Autopilot brief", brief.response.status, 200);
  requireContentType("SCRIMED Automation Autopilot brief", brief.response, "text/markdown");
  requireScrimedAutomationAutopilotBoundary("SCRIMED Automation Autopilot brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Automation Autopilot Brief")) {
    throw new Error("SCRIMED Automation Autopilot brief missing heading.");
  }

  if (!brief.body.text.includes("does not authorize live PHI")) {
    throw new Error("SCRIMED Automation Autopilot brief missing preserved boundary.");
  }

  console.log("pass SCRIMED Automation Autopilot");
}

async function checkStrategicProblemResolution() {
  const result = await request("/api/strategic-problem-resolution");
  requireStatus("Strategic Problem Resolution", result.response.status, 200);
  requireContentType("Strategic Problem Resolution", result.response, "application/json");
  requireStrategicProblemResolutionBoundary("Strategic Problem Resolution", result.response);
  const body = requireJson("Strategic Problem Resolution", result.body);

  if (body.service !== "scrimed-strategic-problem-resolution") {
    throw new Error(`Strategic Problem Resolution expected scrimed-strategic-problem-resolution but received ${body.service}.`);
  }

  if (body.status !== "strategic-problem-resolution-engine-active-no-production-authority") {
    throw new Error(`Strategic Problem Resolution expected active no-production-authority status but received ${body.status}.`);
  }

  if (body.authority?.problemResolutionAuthority !== "recommendation-and-control-plane-only") {
    throw new Error("Strategic Problem Resolution must remain recommendation and control-plane only.");
  }

  if (body.authority?.productionAuthority !== "not-production-authorized") {
    throw new Error("Strategic Problem Resolution must not authorize production.");
  }

  if (body.authority?.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Strategic Problem Resolution must not authorize production PHI.");
  }

  if (body.authority?.clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error("Strategic Problem Resolution must not authorize live clinical care.");
  }

  if (body.authority?.communicationAuthority !== "human-review-required-before-send") {
    throw new Error("Strategic Problem Resolution must require human review before outbound communication.");
  }

  if (body.authority?.payerAuthority !== "not-authorized") {
    throw new Error("Strategic Problem Resolution must not authorize payer action.");
  }

  if (body.authority?.valuationAuthority !== "not-valuation-assurance") {
    throw new Error("Strategic Problem Resolution must not create valuation assurance.");
  }

  if (!Array.isArray(body.problems) || body.problems.length < 8) {
    throw new Error("Strategic Problem Resolution expected broad problem queue coverage.");
  }

  if (!Array.isArray(body.topProblems) || body.topProblems.length < 5) {
    throw new Error("Strategic Problem Resolution expected top problem coverage.");
  }

  if ((body.criticalProblemCount ?? 0) < 3) {
    throw new Error("Strategic Problem Resolution expected critical problem coverage.");
  }

  if ((body.averagePriorityScore ?? 0) < 80) {
    throw new Error("Strategic Problem Resolution expected high average priority score.");
  }

  if ((body.humanReviewRequiredCount ?? 0) < 3) {
    throw new Error("Strategic Problem Resolution expected human-review pressure coverage.");
  }

  if ((body.proofRouteCount ?? 0) < 15) {
    throw new Error("Strategic Problem Resolution expected dense proof-route coverage.");
  }

  if (
    !body.problems.every(
      (problem) =>
        problem.rootCause &&
        problem.safeWorkaround &&
        problem.owner &&
        Array.isArray(problem.proofRoutes) &&
        problem.proofRoutes.length > 0 &&
        Array.isArray(problem.blockedActions) &&
        problem.blockedActions.length > 0 &&
        problem.auditHash
    )
  ) {
    throw new Error("Strategic Problem Resolution expected every problem to include root cause, workaround, owner, proof routes, blocked actions, and audit hash.");
  }

  if (!Array.isArray(body.sprints) || body.sprints.length < 3) {
    throw new Error("Strategic Problem Resolution expected resolution sprint coverage.");
  }

  if (!Array.isArray(body.operatingRules) || body.operatingRules.length < 4) {
    throw new Error("Strategic Problem Resolution expected operating rule coverage.");
  }

  const brief = await request("/api/strategic-problem-resolution/brief");
  requireStatus("Strategic Problem Resolution brief", brief.response.status, 200);
  requireContentType("Strategic Problem Resolution brief", brief.response, "text/markdown");
  requireStrategicProblemResolutionBoundary("Strategic Problem Resolution brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Strategic Problem Resolution Brief")) {
    throw new Error("Strategic Problem Resolution brief missing heading.");
  }

  if (!brief.body.text.includes("does not authorize live PHI")) {
    throw new Error("Strategic Problem Resolution brief missing live PHI boundary.");
  }

  if (!brief.body.text.includes("Top Problems")) {
    throw new Error("Strategic Problem Resolution brief missing top problems section.");
  }

  console.log("pass strategic problem resolution");
}

async function checkHealthcareOptimizationCommand() {
  const result = await request("/api/healthcare-optimization-command");
  requireStatus("Healthcare Optimization Command", result.response.status, 200);
  requireContentType("Healthcare Optimization Command", result.response, "application/json");
  requireHealthcareOptimizationCommandBoundary("Healthcare Optimization Command", result.response);
  const body = requireJson("Healthcare Optimization Command", result.body);

  if (body.service !== "scrimed-healthcare-optimization-command") {
    throw new Error(`Healthcare Optimization Command expected scrimed-healthcare-optimization-command but received ${body.service}.`);
  }

  if (body.status !== "healthcare-optimization-command-active-synthetic-no-production-authority") {
    throw new Error(`Healthcare Optimization Command expected active synthetic no-production-authority status but received ${body.status}.`);
  }

  if (body.authority?.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Healthcare Optimization Command must not authorize production PHI.");
  }

  if (body.authority?.clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error("Healthcare Optimization Command must not authorize live clinical care.");
  }

  if (body.authority?.patientOutreachAuthority !== "human-review-and-consent-required") {
    throw new Error("Healthcare Optimization Command must require human review and consent for outreach.");
  }

  if (body.authority?.payerAuthority !== "not-authorized") {
    throw new Error("Healthcare Optimization Command must not authorize payer action.");
  }

  if (body.authority?.ehrWritebackAuthority !== "not-authorized") {
    throw new Error("Healthcare Optimization Command must not authorize EHR writeback.");
  }

  if (body.authority?.imagingAuthority !== "not-final-medical-interpretation") {
    throw new Error("Healthcare Optimization Command must not authorize final imaging interpretation.");
  }

  if (!Array.isArray(body.lanes) || body.lanes.length < 7) {
    throw new Error("Healthcare Optimization Command expected lane coverage.");
  }

  if (!Array.isArray(body.topLanes) || body.topLanes.length < 5) {
    throw new Error("Healthcare Optimization Command expected top lane coverage.");
  }

  if (!Array.isArray(body.playbooks) || body.playbooks.length < 4) {
    throw new Error("Healthcare Optimization Command expected playbook coverage.");
  }

  if (!Array.isArray(body.innovationTracks) || body.innovationTracks.length < 4) {
    throw new Error("Healthcare Optimization Command expected innovation-track coverage.");
  }

  if ((body.agentCapabilityCount ?? 0) < 25) {
    throw new Error("Healthcare Optimization Command expected agent capability coverage.");
  }

  if ((body.interoperableStandardCount ?? 0) < 15) {
    throw new Error("Healthcare Optimization Command expected interoperability standard coverage.");
  }

  if ((body.measurableOutcomeCount ?? 0) < 20) {
    throw new Error("Healthcare Optimization Command expected measurable outcome coverage.");
  }

  if (body.humanReviewRequiredCount !== body.laneCount) {
    throw new Error("Healthcare Optimization Command expected every lane to require human review.");
  }

  if (!body.lanes.some((lane) => lane.domain === "clinical-workflow")) {
    throw new Error("Healthcare Optimization Command missing clinical workflow lane.");
  }

  if (!body.lanes.some((lane) => lane.domain === "patient-engagement")) {
    throw new Error("Healthcare Optimization Command missing patient engagement lane.");
  }

  if (!body.lanes.some((lane) => lane.domain === "hospital-operations")) {
    throw new Error("Healthcare Optimization Command missing hospital operations lane.");
  }

  if (!body.lanes.some((lane) => lane.domain === "interoperability")) {
    throw new Error("Healthcare Optimization Command missing interoperability lane.");
  }

  if (
    !body.lanes.every(
      (lane) =>
        lane.humanReviewRequired === true &&
        Array.isArray(lane.blockedActions) &&
        lane.blockedActions.includes("live PHI processing") &&
        Array.isArray(lane.proofRoutes) &&
        lane.proofRoutes.length > 0 &&
        lane.auditHash
    )
  ) {
    throw new Error("Healthcare Optimization Command expected every lane to require review, block PHI, include proof routes, and carry an audit hash.");
  }

  const brief = await request("/api/healthcare-optimization-command/brief");
  requireStatus("Healthcare Optimization Command brief", brief.response.status, 200);
  requireContentType("Healthcare Optimization Command brief", brief.response, "text/markdown");
  requireHealthcareOptimizationCommandBoundary("Healthcare Optimization Command brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Healthcare Optimization Command Brief")) {
    throw new Error("Healthcare Optimization Command brief missing heading.");
  }

  if (!brief.body.text.includes("does not authorize live PHI")) {
    throw new Error("Healthcare Optimization Command brief missing live PHI boundary.");
  }

  if (!brief.body.text.includes("Governed Playbooks")) {
    throw new Error("Healthcare Optimization Command brief missing governed playbooks section.");
  }

  console.log("pass healthcare optimization command");
}

async function checkHealthcareValueRealization() {
  const result = await request("/api/healthcare-value-realization");
  requireStatus("Healthcare Value Realization", result.response.status, 200);
  requireContentType("Healthcare Value Realization", result.response, "application/json");
  requireHealthcareValueRealizationBoundary("Healthcare Value Realization", result.response);
  const body = requireJson("Healthcare Value Realization", result.body);

  if (body.service !== "scrimed-healthcare-value-realization") {
    throw new Error(`Healthcare Value Realization expected scrimed-healthcare-value-realization but received ${body.service}.`);
  }

  if (body.status !== "healthcare-value-realization-active-synthetic-no-roi-guarantee") {
    throw new Error(`Healthcare Value Realization expected active synthetic no-ROI-guarantee status but received ${body.status}.`);
  }

  if (body.authority?.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Healthcare Value Realization must not authorize production PHI.");
  }

  if (body.authority?.clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error("Healthcare Value Realization must not authorize live clinical care.");
  }

  if (body.authority?.financialAuthority !== "not-audited-financial-report") {
    throw new Error("Healthcare Value Realization must not claim audited financial authority.");
  }

  if (body.authority?.roiAuthority !== "not-roi-guarantee") {
    throw new Error("Healthcare Value Realization must not guarantee ROI.");
  }

  if (body.authority?.revenueAuthority !== "not-revenue-guarantee") {
    throw new Error("Healthcare Value Realization must not guarantee revenue.");
  }

  if (body.authority?.payerAuthority !== "not-authorized") {
    throw new Error("Healthcare Value Realization must not authorize payer action.");
  }

  if (body.authority?.ehrWritebackAuthority !== "not-authorized") {
    throw new Error("Healthcare Value Realization must not authorize EHR writeback.");
  }

  if (!Array.isArray(body.metrics) || body.metrics.length < 12) {
    throw new Error("Healthcare Value Realization expected value metric coverage.");
  }

  if (!Array.isArray(body.valuePackages) || body.valuePackages.length < 5) {
    throw new Error("Healthcare Value Realization expected value package coverage.");
  }

  if (!Array.isArray(body.riskControls) || body.riskControls.length < 6) {
    throw new Error("Healthcare Value Realization expected risk-control coverage.");
  }

  if ((body.averageEvidenceScore ?? 0) < 85) {
    throw new Error("Healthcare Value Realization expected average evidence score coverage.");
  }

  if (body.humanReviewRequiredCount !== body.metricCount) {
    throw new Error("Healthcare Value Realization expected every metric to require human review.");
  }

  if (!body.metrics.some((metric) => metric.domain === "clinical-workflow")) {
    throw new Error("Healthcare Value Realization missing clinical workflow metric.");
  }

  if (!body.metrics.some((metric) => metric.domain === "patient-engagement")) {
    throw new Error("Healthcare Value Realization missing patient engagement metric.");
  }

  if (!body.metrics.some((metric) => metric.domain === "financial-rcm")) {
    throw new Error("Healthcare Value Realization missing financial RCM metric.");
  }

  if (!body.metrics.some((metric) => metric.domain === "investor-proof")) {
    throw new Error("Healthcare Value Realization missing investor proof metric.");
  }

  if (
    !body.metrics.every(
      (metric) =>
        metric.humanReviewRequired === true &&
        typeof metric.allowedUse === "string" &&
        typeof metric.blockedUse === "string" &&
        Array.isArray(metric.proofRoutes) &&
        metric.proofRoutes.length > 0 &&
        metric.auditHash
    )
  ) {
    throw new Error("Healthcare Value Realization expected every metric to require review, include use boundaries, proof routes, and an audit hash.");
  }

  if (!body.blockedActions?.includes("ROI guarantee")) {
    throw new Error("Healthcare Value Realization expected ROI guarantee to stay blocked.");
  }

  if (!body.blockedActions?.includes("revenue guarantee")) {
    throw new Error("Healthcare Value Realization expected revenue guarantee to stay blocked.");
  }

  const brief = await request("/api/healthcare-value-realization/brief");
  requireStatus("Healthcare Value Realization brief", brief.response.status, 200);
  requireContentType("Healthcare Value Realization brief", brief.response, "text/markdown");
  requireHealthcareValueRealizationBoundary("Healthcare Value Realization brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Healthcare Value Realization Brief")) {
    throw new Error("Healthcare Value Realization brief missing heading.");
  }

  if (!brief.body.text.includes("does not authorize live PHI")) {
    throw new Error("Healthcare Value Realization brief missing live PHI boundary.");
  }

  if (!brief.body.text.includes("not an ROI guarantee")) {
    throw new Error("Healthcare Value Realization brief missing ROI guarantee boundary.");
  }

  if (!brief.body.text.includes("Risk Controls")) {
    throw new Error("Healthcare Value Realization brief missing risk controls section.");
  }

  console.log("pass healthcare value realization");
}

async function checkPilotValueEvidence() {
  const result = await request("/api/pilot-value-evidence");
  requireStatus("Pilot Value Evidence", result.response.status, 200);
  requireContentType("Pilot Value Evidence", result.response, "application/json");
  requirePilotValueEvidenceBoundary("Pilot Value Evidence", result.response);
  const body = requireJson("Pilot Value Evidence", result.body);

  if (body.service !== "scrimed-pilot-value-evidence") {
    throw new Error(`Pilot Value Evidence expected scrimed-pilot-value-evidence but received ${body.service}.`);
  }

  if (body.status !== "pilot-value-evidence-packets-active-synthetic-no-commercial-guarantee") {
    throw new Error(`Pilot Value Evidence expected active synthetic no-commercial-guarantee status but received ${body.status}.`);
  }

  if (body.authority?.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Pilot Value Evidence must not authorize production PHI.");
  }

  if (body.authority?.clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error("Pilot Value Evidence must not authorize live clinical care.");
  }

  if (body.authority?.commercialAuthority !== "not-binding-commercial-offer") {
    throw new Error("Pilot Value Evidence must not create binding commercial offers.");
  }

  if (body.authority?.customerActivationAuthority !== "not-customer-go-live-approval") {
    throw new Error("Pilot Value Evidence must not approve customer go-live.");
  }

  if (body.authority?.roiAuthority !== "not-roi-guarantee") {
    throw new Error("Pilot Value Evidence must not guarantee ROI.");
  }

  if (body.authority?.payerAuthority !== "not-authorized") {
    throw new Error("Pilot Value Evidence must not authorize payer action.");
  }

  if (body.authority?.ehrWritebackAuthority !== "not-authorized") {
    throw new Error("Pilot Value Evidence must not authorize EHR writeback.");
  }

  if (!Array.isArray(body.artifacts) || body.artifacts.length < 8) {
    throw new Error("Pilot Value Evidence expected artifact coverage.");
  }

  if (!Array.isArray(body.packets) || body.packets.length < 5) {
    throw new Error("Pilot Value Evidence expected packet coverage.");
  }

  if (!Array.isArray(body.reviewerCheckpoints) || body.reviewerCheckpoints.length < 5) {
    throw new Error("Pilot Value Evidence expected reviewer checkpoint coverage.");
  }

  if (!Array.isArray(body.claimControls) || body.claimControls.length < 7) {
    throw new Error("Pilot Value Evidence expected claim-control coverage.");
  }

  if ((body.averageEvidenceScore ?? 0) < 85) {
    throw new Error("Pilot Value Evidence expected average evidence score coverage.");
  }

  if (body.humanReviewRequiredCount < body.artifactCount + body.packetCount) {
    throw new Error("Pilot Value Evidence expected artifacts and packets to require human review gates.");
  }

  if (!body.packets.some((packet) => packet.pilotWindow === "30-day")) {
    throw new Error("Pilot Value Evidence missing 30-day packet.");
  }

  if (!body.packets.some((packet) => packet.pilotWindow === "60-day")) {
    throw new Error("Pilot Value Evidence missing 60-day packet.");
  }

  if (!body.packets.some((packet) => packet.pilotWindow === "90-day")) {
    throw new Error("Pilot Value Evidence missing 90-day packet.");
  }

  if (
    !body.artifacts.every(
      (artifact) =>
        typeof artifact.reviewGate === "string" &&
        Array.isArray(artifact.blockedClaims) &&
        artifact.blockedClaims.length > 0 &&
        Array.isArray(artifact.proofRoutes) &&
        artifact.proofRoutes.length > 0 &&
        artifact.auditHash
    )
  ) {
    throw new Error("Pilot Value Evidence expected every artifact to include review gate, blocked claims, proof routes, and audit hash.");
  }

  if (!body.blockedClaims?.includes("binding commercial offer")) {
    throw new Error("Pilot Value Evidence expected binding commercial offer to stay blocked.");
  }

  if (!body.blockedClaims?.includes("ROI guarantee")) {
    throw new Error("Pilot Value Evidence expected ROI guarantee to stay blocked.");
  }

  const brief = await request("/api/pilot-value-evidence/brief");
  requireStatus("Pilot Value Evidence brief", brief.response.status, 200);
  requireContentType("Pilot Value Evidence brief", brief.response, "text/markdown");
  requirePilotValueEvidenceBoundary("Pilot Value Evidence brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Pilot Value Evidence Brief")) {
    throw new Error("Pilot Value Evidence brief missing heading.");
  }

  if (!brief.body.text.includes("does not authorize live PHI")) {
    throw new Error("Pilot Value Evidence brief missing live PHI boundary.");
  }

  if (!brief.body.text.includes("binding commercial offers")) {
    throw new Error("Pilot Value Evidence brief missing commercial-offer boundary.");
  }

  if (!brief.body.text.includes("Reviewer Checkpoints")) {
    throw new Error("Pilot Value Evidence brief missing reviewer checkpoints section.");
  }

  console.log("pass pilot value evidence");
}

async function checkPilotActivationPlanner() {
  const result = await request("/api/pilot-activation-planner");
  requireStatus("Pilot Activation Planner", result.response.status, 200);
  requireContentType("Pilot Activation Planner", result.response, "application/json");
  requirePilotActivationPlannerBoundary("Pilot Activation Planner", result.response);
  const body = requireJson("Pilot Activation Planner", result.body);

  if (body.service !== "scrimed-pilot-activation-planner") {
    throw new Error(`Pilot Activation Planner expected scrimed-pilot-activation-planner but received ${body.service}.`);
  }

  if (body.status !== "pilot-activation-planner-active-synthetic-no-customer-go-live-authority") {
    throw new Error(`Pilot Activation Planner expected active synthetic no-go-live-authority status but received ${body.status}.`);
  }

  if (body.authority?.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Pilot Activation Planner must not authorize production PHI.");
  }

  if (body.authority?.clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error("Pilot Activation Planner must not authorize live clinical care.");
  }

  if (body.authority?.commercialAuthority !== "not-binding-commercial-offer") {
    throw new Error("Pilot Activation Planner must not create binding commercial offers.");
  }

  if (body.authority?.customerActivationAuthority !== "not-customer-go-live-approval") {
    throw new Error("Pilot Activation Planner must not approve customer go-live.");
  }

  if (body.authority?.productionAuthority !== "not-production-authorized") {
    throw new Error("Pilot Activation Planner must not authorize production.");
  }

  if (body.authority?.legalAuthority !== "qualified-review-required") {
    throw new Error("Pilot Activation Planner must require qualified legal/procurement review.");
  }

  if (body.authority?.patientOutreachAuthority !== "human-review-and-consent-required") {
    throw new Error("Pilot Activation Planner must require human review and consent for patient outreach.");
  }

  if (body.authority?.payerAuthority !== "not-authorized") {
    throw new Error("Pilot Activation Planner must not authorize payer action.");
  }

  if (body.authority?.ehrWritebackAuthority !== "not-authorized") {
    throw new Error("Pilot Activation Planner must not authorize EHR writeback.");
  }

  if (body.authority?.roiAuthority !== "not-roi-guarantee") {
    throw new Error("Pilot Activation Planner must not guarantee ROI.");
  }

  if (!Array.isArray(body.steps) || body.steps.length < 9) {
    throw new Error("Pilot Activation Planner expected activation step coverage.");
  }

  if (!Array.isArray(body.plans) || body.plans.length < 5) {
    throw new Error("Pilot Activation Planner expected activation plan coverage.");
  }

  if (!Array.isArray(body.blockers) || body.blockers.length < 6) {
    throw new Error("Pilot Activation Planner expected blocker coverage.");
  }

  if (!Array.isArray(body.handoffs) || body.handoffs.length < 4) {
    throw new Error("Pilot Activation Planner expected handoff coverage.");
  }

  if ((body.externalApprovalRequiredCount ?? 0) < 3) {
    throw new Error("Pilot Activation Planner expected external approval blockers.");
  }

  if ((body.blockedBeforeLiveCount ?? 0) < 2) {
    throw new Error("Pilot Activation Planner expected blocked-before-live states.");
  }

  if ((body.proofRouteCount ?? 0) < 12) {
    throw new Error("Pilot Activation Planner expected proof-route coverage.");
  }

  if (
    !body.steps.every(
      (step) =>
        typeof step.humanReviewGate === "string" &&
        step.humanReviewGate.length > 0 &&
        Array.isArray(step.blockedActions) &&
        step.blockedActions.includes("live PHI processing") &&
        Array.isArray(step.proofRoutes) &&
        step.proofRoutes.length > 0 &&
        step.auditHash
    )
  ) {
    throw new Error("Pilot Activation Planner expected every step to include review gate, blocked actions, proof routes, and audit hash.");
  }

  if (!body.blockedActions?.includes("binding commercial offer")) {
    throw new Error("Pilot Activation Planner expected binding commercial offer to stay blocked.");
  }

  if (!body.blockedActions?.includes("ROI guarantee")) {
    throw new Error("Pilot Activation Planner expected ROI guarantee to stay blocked.");
  }

  const brief = await request("/api/pilot-activation-planner/brief");
  requireStatus("Pilot Activation Planner brief", brief.response.status, 200);
  requireContentType("Pilot Activation Planner brief", brief.response, "text/markdown");
  requirePilotActivationPlannerBoundary("Pilot Activation Planner brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Pilot Activation Planner Brief")) {
    throw new Error("Pilot Activation Planner brief missing heading.");
  }

  if (!brief.body.text.includes("does not authorize live PHI")) {
    throw new Error("Pilot Activation Planner brief missing live PHI boundary.");
  }

  if (!brief.body.text.includes("legal/procurement approval")) {
    throw new Error("Pilot Activation Planner brief missing legal/procurement boundary.");
  }

  if (!brief.body.text.includes("Blockers")) {
    throw new Error("Pilot Activation Planner brief missing blockers section.");
  }

  console.log("pass pilot activation planner");
}

async function checkPilotHandoffCommand() {
  const result = await request("/api/pilot-handoff-command");
  requireStatus("Pilot Handoff Command", result.response.status, 200);
  requireContentType("Pilot Handoff Command", result.response, "application/json");
  requirePilotHandoffCommandBoundary("Pilot Handoff Command", result.response);
  const body = requireJson("Pilot Handoff Command", result.body);

  if (body.service !== "scrimed-pilot-handoff-command") {
    throw new Error(`Pilot Handoff Command expected scrimed-pilot-handoff-command but received ${body.service}.`);
  }

  if (body.status !== "pilot-handoff-command-active-synthetic-human-review-required") {
    throw new Error(`Pilot Handoff Command expected active synthetic human-review status but received ${body.status}.`);
  }

  if (body.authority?.externalSendAuthority !== "human-review-required") {
    throw new Error("Pilot Handoff Command must require human review before external send.");
  }

  if (body.authority?.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Pilot Handoff Command must not authorize production PHI.");
  }

  if (body.authority?.clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error("Pilot Handoff Command must not authorize live clinical care.");
  }

  if (body.authority?.commercialAuthority !== "not-binding-commercial-offer") {
    throw new Error("Pilot Handoff Command must not create binding commercial offers.");
  }

  if (body.authority?.customerActivationAuthority !== "not-customer-go-live-approval") {
    throw new Error("Pilot Handoff Command must not approve customer go-live.");
  }

  if (body.authority?.patientOutreachAuthority !== "human-review-and-consent-required") {
    throw new Error("Pilot Handoff Command must require human review and consent for patient outreach.");
  }

  if (body.authority?.payerAuthority !== "not-authorized") {
    throw new Error("Pilot Handoff Command must not authorize payer action.");
  }

  if (body.authority?.ehrWritebackAuthority !== "not-authorized") {
    throw new Error("Pilot Handoff Command must not authorize EHR writeback.");
  }

  if (!Array.isArray(body.packets) || body.packets.length < 6) {
    throw new Error("Pilot Handoff Command expected handoff packet coverage.");
  }

  if (!Array.isArray(body.checklist) || body.checklist.length < 7) {
    throw new Error("Pilot Handoff Command expected checklist coverage.");
  }

  if (!Array.isArray(body.riskControls) || body.riskControls.length < 5) {
    throw new Error("Pilot Handoff Command expected risk-control coverage.");
  }

  if ((body.hardStopCount ?? 0) < 10) {
    throw new Error("Pilot Handoff Command expected hard-stop coverage.");
  }

  if ((body.proofRouteCount ?? 0) < 12) {
    throw new Error("Pilot Handoff Command expected proof-route coverage.");
  }

  if (
    !body.packets.every(
      (packet) =>
        typeof packet.reviewGate === "string" &&
        packet.reviewGate.length > 0 &&
        typeof packet.blockedUse === "string" &&
        packet.blockedUse.length > 0 &&
        Array.isArray(packet.proofRoutes) &&
        packet.proofRoutes.length > 0 &&
        packet.auditHash &&
        packet.authorityFlags?.externalSendAuthority === "human-review-required"
    )
  ) {
    throw new Error("Pilot Handoff Command expected every packet to include review gate, blocked use, proof routes, audit hash, and human-review send authority.");
  }

  if (!body.blockedActions?.includes("external send without human review")) {
    throw new Error("Pilot Handoff Command expected external send without review to stay blocked.");
  }

  if (!body.blockedActions?.includes("binding commercial offer")) {
    throw new Error("Pilot Handoff Command expected binding commercial offer to stay blocked.");
  }

  if (!body.blockedActions?.includes("ROI guarantee")) {
    throw new Error("Pilot Handoff Command expected ROI guarantee to stay blocked.");
  }

  const brief = await request("/api/pilot-handoff-command/brief");
  requireStatus("Pilot Handoff Command brief", brief.response.status, 200);
  requireContentType("Pilot Handoff Command brief", brief.response, "text/markdown");
  requirePilotHandoffCommandBoundary("Pilot Handoff Command brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Pilot Handoff Command Brief")) {
    throw new Error("Pilot Handoff Command brief missing heading.");
  }

  if (!brief.body.text.includes("does not send external communications")) {
    throw new Error("Pilot Handoff Command brief missing external-send boundary.");
  }

  if (!brief.body.text.includes("Hard Stops")) {
    throw new Error("Pilot Handoff Command brief missing hard stops section.");
  }

  if (!brief.body.text.includes("Handoff Packets")) {
    throw new Error("Pilot Handoff Command brief missing handoff packets section.");
  }

  console.log("pass pilot handoff command");
}

async function checkPilotSuccessReviewCommand() {
  const result = await request("/api/pilot-success-review-command");
  requireStatus("Pilot Success Review Command", result.response.status, 200);
  requireContentType("Pilot Success Review Command", result.response, "application/json");
  requirePilotSuccessReviewCommandBoundary("Pilot Success Review Command", result.response);
  const body = requireJson("Pilot Success Review Command", result.body);

  if (body.service !== "scrimed-pilot-success-review-command") {
    throw new Error(`Pilot Success Review Command expected scrimed-pilot-success-review-command but received ${body.service}.`);
  }

  if (body.status !== "pilot-success-review-command-active-synthetic-no-roi-guarantee") {
    throw new Error(`Pilot Success Review Command expected synthetic no-ROI-guarantee status but received ${body.status}.`);
  }

  if (body.authority?.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Pilot Success Review Command must not authorize production PHI.");
  }

  if (body.authority?.clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error("Pilot Success Review Command must not authorize live clinical care.");
  }

  if (body.authority?.financialAuthority !== "not-audited-financial-report") {
    throw new Error("Pilot Success Review Command must not create audited financial reporting.");
  }

  if (body.authority?.roiAuthority !== "not-roi-guarantee") {
    throw new Error("Pilot Success Review Command must not guarantee ROI.");
  }

  if (body.authority?.revenueAuthority !== "not-revenue-guarantee") {
    throw new Error("Pilot Success Review Command must not guarantee revenue.");
  }

  if (body.authority?.commercialAuthority !== "not-binding-commercial-offer") {
    throw new Error("Pilot Success Review Command must not create binding commercial offers.");
  }

  if (body.authority?.customerActivationAuthority !== "not-customer-go-live-approval") {
    throw new Error("Pilot Success Review Command must not approve customer go-live.");
  }

  if (body.authority?.externalDistributionAuthority !== "human-review-required") {
    throw new Error("Pilot Success Review Command must require human review before external distribution.");
  }

  if (body.authority?.legalAuthority !== "qualified-review-required") {
    throw new Error("Pilot Success Review Command must require qualified legal/procurement review.");
  }

  if (!Array.isArray(body.reviewPlans) || body.reviewPlans.length < 6) {
    throw new Error("Pilot Success Review Command expected review plan coverage.");
  }

  if (!Array.isArray(body.evidenceGaps) || body.evidenceGaps.length < 5) {
    throw new Error("Pilot Success Review Command expected evidence-gap coverage.");
  }

  if (!Array.isArray(body.expansionReadiness) || body.expansionReadiness.length < 4) {
    throw new Error("Pilot Success Review Command expected expansion-readiness coverage.");
  }

  if ((body.blockedBeforeClaimCount ?? 0) < 3) {
    throw new Error("Pilot Success Review Command expected blocked-before-claim coverage.");
  }

  if ((body.externalApprovalRequiredCount ?? 0) < 3) {
    throw new Error("Pilot Success Review Command expected external-approval coverage.");
  }

  if ((body.proofRouteCount ?? 0) < 12) {
    throw new Error("Pilot Success Review Command expected proof-route coverage.");
  }

  if (
    !body.reviewPlans.every(
      (plan) =>
        typeof plan.reviewerRole === "string" &&
        plan.reviewerRole.length > 0 &&
        typeof plan.claimSafeOutput === "string" &&
        plan.claimSafeOutput.length > 0 &&
        typeof plan.blockedClaim === "string" &&
        plan.blockedClaim.length > 0 &&
        Array.isArray(plan.proofRoutes) &&
        plan.proofRoutes.length > 0 &&
        typeof plan.auditHash === "string" &&
        plan.auditHash.length > 0
    )
  ) {
    throw new Error("Pilot Success Review Command expected every review plan to include reviewer role, claim-safe output, blocked claim, proof routes, and audit hash.");
  }

  if (!body.blockedClaims?.includes("ROI guarantee")) {
    throw new Error("Pilot Success Review Command expected ROI guarantee to stay blocked.");
  }

  if (!body.blockedClaims?.includes("binding commercial offer")) {
    throw new Error("Pilot Success Review Command expected binding commercial offer to stay blocked.");
  }

  const brief = await request("/api/pilot-success-review-command/brief");
  requireStatus("Pilot Success Review Command brief", brief.response.status, 200);
  requireContentType("Pilot Success Review Command brief", brief.response, "text/markdown");
  requirePilotSuccessReviewCommandBoundary("Pilot Success Review Command brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Pilot Success Review Command Brief")) {
    throw new Error("Pilot Success Review Command brief missing heading.");
  }

  if (!brief.body.text.includes("does not authorize live PHI")) {
    throw new Error("Pilot Success Review Command brief missing live PHI boundary.");
  }

  if (!brief.body.text.includes("Review Plans")) {
    throw new Error("Pilot Success Review Command brief missing review plans section.");
  }

  if (!brief.body.text.includes("Evidence Gaps")) {
    throw new Error("Pilot Success Review Command brief missing evidence gaps section.");
  }

  if (!brief.body.text.includes("Expansion Readiness")) {
    throw new Error("Pilot Success Review Command brief missing expansion readiness section.");
  }

  console.log("pass pilot success review command");
}

async function checkScrimedWork() {
  const result = await request("/api/scrimed-work");
  requireStatus("SCRIMED Work", result.response.status, 200);
  requireContentType("SCRIMED Work", result.response, "application/json");
  requireScrimedWorkBoundary("SCRIMED Work", result.response);
  const envelope = requireJson("SCRIMED Work", result.body);
  const body = envelope.data;

  if (!envelope.ok || body?.service !== "scrimed-work-intelligence-platform") {
    throw new Error("SCRIMED Work expected typed ok envelope with service payload.");
  }

  if (body.status !== "scrimed-work-intelligence-platform-active-synthetic-no-phi") {
    throw new Error(`SCRIMED Work expected active synthetic status but received ${body.status}.`);
  }

  if (!body.persistence || !["deterministic-in-memory-adapter", "protected-supabase-rpc-aal2"].includes(body.persistence.mode)) {
    throw new Error("SCRIMED Work must disclose its current persistence mode.");
  }

  if (body.persistence.durableStoreStatus !== "scrimed-work-durable-store-contract-ready-no-phi") {
    throw new Error("SCRIMED Work must disclose durable-store contract readiness metadata.");
  }

  if (!body.governanceStatus?.definitionOfDoneRequired || !body.governanceStatus?.verificationBlocksCompletion) {
    throw new Error("SCRIMED Work expected Definition of Done and verification completion gates.");
  }

  if (!body.governanceStatus?.consequentialActionsDisabled || !body.governanceStatus?.externalProviderCallsDisabledByDefault) {
    throw new Error("SCRIMED Work expected consequential actions and provider calls disabled by default.");
  }

  if (!body.governanceStatus?.durableWritesRequireSupabaseAal2RbacRls) {
    throw new Error("SCRIMED Work expected durable writes to require Supabase AAL2/RBAC/RLS.");
  }

  if (
    body.governanceStatus?.mutationRateLimit?.policyVersion !==
      "scrimed-work-mutation-rate-limit-v1-2026-07-17" ||
    !["distributed-required", "bounded-memory"].includes(
      body.governanceStatus?.mutationRateLimit?.mode
    ) ||
    body.governanceStatus?.mutationRateLimit?.actorLimit !== 30 ||
    body.governanceStatus?.mutationRateLimit?.tenantLimit !== 120 ||
    body.governanceStatus?.mutationRateLimit?.windowSeconds !== 600
  ) {
    throw new Error("SCRIMED Work expected actor and tenant mutation rate-limit posture metadata.");
  }

  if (
    body.governanceStatus.mutationRateLimit.productionRuntime === true &&
    (body.governanceStatus.mutationRateLimit.mode !== "distributed-required" ||
      body.governanceStatus.mutationRateLimit.failClosedOnProviderUnavailable !== true)
  ) {
    throw new Error("SCRIMED Work production runtime must require distributed fail-closed mutation limiting.");
  }

  if (body.productionHardening?.service !== "scrimed-work-production-hardening-gate") {
    throw new Error("SCRIMED Work expected production hardening gate metadata.");
  }

  if (body.productionHardening?.noProductionAuthorization !== true || body.productionHardening?.noPhiAuthority !== true) {
    throw new Error("SCRIMED Work production hardening gate must retain no-production and no-PHI authority boundaries.");
  }

  if (
    body.productionHardening?.mutationRateLimit?.policyVersion !==
      "scrimed-work-mutation-rate-limit-v1-2026-07-17" ||
    typeof body.productionHardening?.mutationRateLimit?.distributedProviderConfigured !==
      "boolean" ||
    typeof body.productionHardening?.mutationRateLimit?.readyForProtectedMutations !== "boolean"
  ) {
    throw new Error("SCRIMED Work production hardening must expose no-secret mutation rate-limit posture.");
  }

  if (!Array.isArray(body.productionHardening?.gates) || body.productionHardening.gates.length < 8) {
    throw new Error("SCRIMED Work production hardening gate expected release-control coverage.");
  }

  if (
    typeof body.productionHardening?.releaseBinding?.currentReleaseShaFingerprint !== "string" ||
    typeof body.productionHardening?.releaseBinding?.canaryReleaseShaFingerprint !== "string" ||
    typeof body.productionHardening?.releaseBinding?.evidenceIdFormatValid !== "boolean" ||
    typeof body.productionHardening?.releaseBinding?.evidenceIdAuthenticated !== "boolean" ||
    typeof body.productionHardening?.releaseBinding?.workspaceSlug !== "string" ||
    typeof body.productionHardening?.releaseBinding?.workspaceBound !== "boolean" ||
    (body.productionHardening?.releaseBinding?.completedAt !== null &&
      typeof body.productionHardening?.releaseBinding?.completedAt !== "string") ||
    (body.productionHardening?.releaseBinding?.ageHours !== null &&
      typeof body.productionHardening?.releaseBinding?.ageHours !== "number") ||
    typeof body.productionHardening?.releaseBinding?.maxAgeHours !== "number" ||
    typeof body.productionHardening?.releaseBinding?.fresh !== "boolean" ||
    typeof body.productionHardening?.releaseBinding?.matched !== "boolean"
  ) {
    throw new Error("SCRIMED Work production hardening must expose no-secret release-binding posture.");
  }

  if (!Array.isArray(body.sessions) || body.sessions.length < 2) {
    throw new Error("SCRIMED Work expected synthetic work session coverage.");
  }

  if (!Array.isArray(body.agents) || body.agents.length < 10) {
    throw new Error("SCRIMED Work expected multi-agent registry coverage.");
  }

  if (!Array.isArray(body.tools) || !body.tools.some((tool) => tool.toolId === "ehr-writeback" && tool.enabled === false)) {
    throw new Error("SCRIMED Work expected EHR writeback tool to remain disabled.");
  }

  if (!Array.isArray(body.providers) || !body.providers.some((provider) => provider.providerId === "synthetic-fallback")) {
    throw new Error("SCRIMED Work expected synthetic fallback provider.");
  }

  if (!Array.isArray(body.scheduleDefinitions) || !body.scheduleDefinitions.every((schedule) => schedule.enabled === false && schedule.simulationOnly === true)) {
    throw new Error("SCRIMED Work schedules must remain disabled and simulation-only.");
  }

  if (body.voiceSimulation?.rawAudioStored !== false || body.voiceSimulation?.syntheticDemoMode !== true) {
    throw new Error("SCRIMED Work voice workflow must remain simulation-only with no raw audio storage.");
  }

  const providers = await request("/api/scrimed-work/providers");
  requireStatus("SCRIMED Work providers", providers.response.status, 200);
  requireScrimedWorkBoundary("SCRIMED Work providers", providers.response);

  const agents = await request("/api/scrimed-work/agents");
  requireStatus("SCRIMED Work agents", agents.response.status, 200);
  requireScrimedWorkBoundary("SCRIMED Work agents", agents.response);

  const tools = await request("/api/scrimed-work/tools");
  requireStatus("SCRIMED Work tools", tools.response.status, 200);
  requireScrimedWorkBoundary("SCRIMED Work tools", tools.response);

  const schedules = await request("/api/scrimed-work/schedules");
  requireStatus("SCRIMED Work schedules", schedules.response.status, 200);
  requireScrimedWorkBoundary("SCRIMED Work schedules", schedules.response);

  const hardening = await request("/api/scrimed-work/production-hardening");
  requireStatus("SCRIMED Work production hardening", hardening.response.status, 200);
  requireScrimedWorkBoundary("SCRIMED Work production hardening", hardening.response);
  const hardeningEnvelope = requireJson("SCRIMED Work production hardening", hardening.body);
  const hardeningBody = hardeningEnvelope.data;

  if (!hardeningEnvelope.ok || hardeningBody?.service !== "scrimed-work-production-hardening-gate") {
    throw new Error("SCRIMED Work production hardening expected typed gate envelope.");
  }

  if (hardeningBody.noProductionAuthorization !== true || hardeningBody.canaryEligible !== false) {
    throw new Error("SCRIMED Work production hardening must not approve production or canary readiness by default.");
  }

  const fixtureSession = await request("/api/scrimed-work/sessions/work_session_care_coordination_synthetic");
  requireStatus("SCRIMED Work synthetic session read", fixtureSession.response.status, 200);
  requireScrimedWorkBoundary("SCRIMED Work synthetic session read", fixtureSession.response);
  const fixtureSessionEnvelope = requireJson("SCRIMED Work synthetic session read", fixtureSession.body);

  if (fixtureSessionEnvelope.data?.id !== "work_session_care_coordination_synthetic") {
    throw new Error("SCRIMED Work synthetic session read expected the named public fixture.");
  }

  const fixtureVerification = await postJson(
    "/api/scrimed-work/sessions/work_session_care_coordination_synthetic/verify",
    {}
  );
  requireStatus("SCRIMED Work synthetic session verification", fixtureVerification.response.status, 200);
  requireScrimedWorkBoundary("SCRIMED Work synthetic session verification", fixtureVerification.response);
  const fixtureVerificationEnvelope = requireJson(
    "SCRIMED Work synthetic session verification",
    fixtureVerification.body
  );

  if (
    fixtureVerificationEnvelope.data?.eligibleForCompletion !== false ||
    !fixtureVerificationEnvelope.data?.failedCriteria?.includes("human-approval-state")
  ) {
    throw new Error("SCRIMED Work verification must hold the human-review gate before completion.");
  }

  const protectedRead = await request("/api/scrimed-work/sessions/work_session_unknown_protected");
  requireStatus("SCRIMED Work protected session read", protectedRead.response.status, [401, 503]);
  requireScrimedWorkBoundary("SCRIMED Work protected session read", protectedRead.response);

  const protectedReviewQueue = await request("/api/scrimed-work/review-queue");
  requireStatus("SCRIMED Work protected reviewer queue", protectedReviewQueue.response.status, [401, 503]);
  requireScrimedWorkBoundary("SCRIMED Work protected reviewer queue", protectedReviewQueue.response);
  if (protectedReviewQueue.response.headers.get("x-scrimed-review-queue") !== "fail-closed") {
    throw new Error("SCRIMED Work reviewer queue must fail closed without AAL2 reviewer authorization.");
  }
  if (
    protectedReviewQueue.response.headers.get("x-scrimed-external-distribution") !== "not-authorized" ||
    protectedReviewQueue.response.headers.get("x-scrimed-payer-submission") !== "not-authorized"
  ) {
    throw new Error("SCRIMED Work reviewer queue must retain external-distribution and payer-submission locks.");
  }

  const protectedCompletionQueue = await request("/api/scrimed-work/completion-queue");
  requireStatus("SCRIMED Work protected completion queue", protectedCompletionQueue.response.status, [401, 503]);
  requireScrimedWorkBoundary("SCRIMED Work protected completion queue", protectedCompletionQueue.response);
  if (protectedCompletionQueue.response.headers.get("x-scrimed-completion-queue") !== "fail-closed") {
    throw new Error("SCRIMED Work completion queue must fail closed without AAL2 operator authorization.");
  }
  if (
    protectedCompletionQueue.response.headers.get("x-scrimed-external-distribution") !== "not-authorized" ||
    protectedCompletionQueue.response.headers.get("x-scrimed-payer-submission") !== "not-authorized" ||
    protectedCompletionQueue.response.headers.get("x-scrimed-ehr-writeback") !== "not-authorized"
  ) {
    throw new Error("SCRIMED Work completion queue must retain external, payer, and EHR locks.");
  }

  const protectedCompletionEvidence = await request(
    "/api/scrimed-work/completion-queue?mode=evidence"
  );
  requireStatus(
    "SCRIMED Work protected completion evidence",
    protectedCompletionEvidence.response.status,
    [401, 503]
  );
  requireScrimedWorkBoundary(
    "SCRIMED Work protected completion evidence",
    protectedCompletionEvidence.response
  );
  if (
    protectedCompletionEvidence.response.headers.get("x-scrimed-completion-queue") !== "fail-closed" ||
    protectedCompletionEvidence.response.headers.get("x-scrimed-completion-read-mode") !== "denied" ||
    protectedCompletionEvidence.response.headers.get("x-scrimed-canary-attestation") !== "denied" ||
    protectedCompletionEvidence.response.headers.get("x-scrimed-canary-freshness") !== "denied"
  ) {
    throw new Error("SCRIMED Work completion evidence must fail closed without AAL2 operator authorization.");
  }
  if (
    protectedCompletionEvidence.response.headers.get("x-scrimed-external-distribution") !== "not-authorized" ||
    protectedCompletionEvidence.response.headers.get("x-scrimed-payer-submission") !== "not-authorized" ||
    protectedCompletionEvidence.response.headers.get("x-scrimed-ehr-writeback") !== "not-authorized"
  ) {
    throw new Error("SCRIMED Work completion evidence must retain external, payer, and EHR locks.");
  }

  const protectedVerification = await postJson(
    "/api/scrimed-work/sessions/work_session_unknown_protected/verify",
    {}
  );
  requireStatus("SCRIMED Work protected session verification", protectedVerification.response.status, [401, 503]);
  requireScrimedWorkBoundary("SCRIMED Work protected session verification", protectedVerification.response);

  const routeModel = await postJson("/api/scrimed-work/route-model", {
    taskType: "synthetic executive work routing",
    risk: "moderate",
    requiredCapability: "balanced",
    tenantPolicy: "no phi synthetic only"
  });
  requireStatus("SCRIMED Work route model", routeModel.response.status, 200);
  requireScrimedWorkBoundary("SCRIMED Work route model", routeModel.response);

  const context = await postJson("/api/scrimed-work/context/search", {
    query: "care coordination human review FHIR",
    tenant: "synthetic-tenant"
  });
  requireStatus("SCRIMED Work context search", context.response.status, 200);
  requireScrimedWorkBoundary("SCRIMED Work context search", context.response);

  const voice = await postJson("/api/scrimed-work/voice/simulate", {
    transcript: "Prepare a synthetic care coordination briefing.",
    consentAcknowledged: true
  });
  requireStatus("SCRIMED Work voice simulate", voice.response.status, 200);
  requireScrimedWorkBoundary("SCRIMED Work voice simulate", voice.response);

  const protectedCreate = await postJson(
    "/api/scrimed-work/sessions",
    { title: "blocked synthetic session create without protected write auth" },
    { "x-scrimed-request-context": "operator-smoke-v1" }
  );
  requireStatus("SCRIMED Work protected session create", protectedCreate.response.status, [401, 503]);
  requireScrimedWorkBoundary("SCRIMED Work protected session create", protectedCreate.response);

  const protectedPayerIqHandoff = await postJson(
    "/api/documentation-before-authorization/scrimed-work-handoff",
    {
      workspaceSlug: "atlas-synthetic-evaluation",
      scenarioPacketId: "doc-auth-imaging-synthetic-review-ready",
      documentedRequirementIds: [
        "symptom_language",
        "functional_status",
        "visit_timing",
        "medical_necessity_rationale",
        "prior_therapy_history",
        "diagnosis_specific_evidence",
        "policy_reference",
        "recent_visit_note",
        "reviewer_attestation"
      ],
      reviewerStatus: "queued",
      requestedAction: "draft_reviewer_packet",
      dataBoundaryAcknowledged: true
    },
    { "x-scrimed-request-context": "operator-smoke-v1" }
  );
  requireStatus("PayerIQ protected SCRIMED Work handoff", protectedPayerIqHandoff.response.status, [401, 503]);
  requireScrimedWorkBoundary("PayerIQ protected SCRIMED Work handoff", protectedPayerIqHandoff.response);

  const protectedArtifactReview = await postJson(
    "/api/scrimed-work/sessions/work_session_unknown_protected/artifacts/artifact_unknown_protected/review",
    {
      disposition: "approved_for_internal_use",
      reasonCode: "evidence_and_boundaries_confirmed"
    },
    { "x-scrimed-request-context": "operator-smoke-v1" }
  );
  requireStatus("SCRIMED Work protected artifact review", protectedArtifactReview.response.status, [401, 503]);
  requireScrimedWorkBoundary("SCRIMED Work protected artifact review", protectedArtifactReview.response);

  const protectedCompletion = await postJson(
    "/api/scrimed-work/sessions/work_session_unknown_protected/complete",
    {},
    { "x-scrimed-request-context": "operator-smoke-v1" }
  );
  requireStatus("SCRIMED Work protected completion", protectedCompletion.response.status, [401, 503]);
  requireScrimedWorkBoundary("SCRIMED Work protected completion", protectedCompletion.response);

  const brief = await request("/api/scrimed-work/brief");
  requireStatus("SCRIMED Work brief", brief.response.status, 200);
  requireContentType("SCRIMED Work brief", brief.response, "text/markdown");
  requireScrimedWorkBoundary("SCRIMED Work brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Work & Intelligence Platform Brief")) {
    throw new Error("SCRIMED Work brief missing heading.");
  }

  if (!brief.body.text.includes("Consequential tools remain disabled")) {
    throw new Error("SCRIMED Work brief missing consequential-action boundary.");
  }

  console.log("pass scrimed work");
}

async function checkHealthcareIntelligenceOS() {
  const result = await request("/api/healthcare-intelligence-os");
  requireStatus("Healthcare Intelligence OS", result.response.status, 200);
  requireContentType("Healthcare Intelligence OS", result.response, "application/json");
  requireHealthcareIntelligenceOSBoundary("Healthcare Intelligence OS", result.response);
  const body = requireJson("Healthcare Intelligence OS", result.body);

  if (body.service !== "scrimed-healthcare-intelligence-os") {
    throw new Error(`Healthcare Intelligence OS expected scrimed-healthcare-intelligence-os but received ${body.service}.`);
  }

  if (body.status !== "healthcare-intelligence-os-foundation") {
    throw new Error(`Healthcare Intelligence OS expected foundation status but received ${body.status}.`);
  }

  if (body.clinicalDataFabric?.status !== "clinical-data-fabric-control-plane-ready-no-phi") {
    throw new Error("Healthcare Intelligence OS expected Clinical Data Fabric control-plane status.");
  }

  if (body.clinicalDataFabric?.dataBoundary !== "no-live-phi-control-plane") {
    throw new Error("Healthcare Intelligence OS expected Clinical Data Fabric no-live-PHI boundary.");
  }

  if (body.clinicalDataFabric?.connectorAuthority !== "not-production-connector-approved") {
    throw new Error("Healthcare Intelligence OS expected Clinical Data Fabric connector authority blocker.");
  }

  if (body.clinicalDataFabric?.agentDataAuthority !== "semantic-layer-only-no-raw-schema-access") {
    throw new Error("Healthcare Intelligence OS expected Clinical Data Fabric semantic-only agent access.");
  }

  if (body.clinicalDataFabric?.sourceContractCount < 9) {
    throw new Error("Healthcare Intelligence OS expected Clinical Data Fabric source contract coverage.");
  }

  if (body.clinicalDataFabric?.semanticMappingCount < 6) {
    throw new Error("Healthcare Intelligence OS expected Clinical Data Fabric semantic mapping coverage.");
  }

  if (body.clinicalDataFabric?.graphNodeCount < 20 || body.clinicalDataFabric?.graphEdgeCount < 10) {
    throw new Error("Healthcare Intelligence OS expected Clinical Data Fabric health graph coverage.");
  }

  if (body.clinicalDataFabric?.workflowEventCount < 4 || body.clinicalDataFabric?.validationStatus !== "passed") {
    throw new Error("Healthcare Intelligence OS expected Clinical Data Fabric workflow event validation.");
  }

  if (body.clinicalDataGovernance?.status !== "clinical-data-governance-policy-engine-ready-no-phi") {
    throw new Error("Healthcare Intelligence OS expected Clinical Data Governance policy-engine status.");
  }

  if (body.clinicalDataGovernance?.dataBoundary !== "metadata-and-policy-only-no-live-phi") {
    throw new Error("Healthcare Intelligence OS expected Clinical Data Governance metadata-only boundary.");
  }

  if (body.clinicalDataGovernance?.policyRuleCount < 10) {
    throw new Error("Healthcare Intelligence OS expected Clinical Data Governance policy rule coverage.");
  }

  if (body.clinicalDataGovernance?.baselineEvaluationCount < 5 || body.clinicalDataGovernance?.validationStatus !== "passed") {
    throw new Error("Healthcare Intelligence OS expected Clinical Data Governance validation coverage.");
  }

  if (body.clinicalDataGovernance?.recordMutationAuthority !== "not-authorized") {
    throw new Error("Healthcare Intelligence OS expected Clinical Data Governance record mutation blocker.");
  }

  if (body.clinicalDataGovernance?.externalModelPhiAuthority !== "not-authorized") {
    throw new Error("Healthcare Intelligence OS expected Clinical Data Governance external model PHI blocker.");
  }

  if (body.clinicalContextGateway?.status !== "clinical-context-gateway-ready-no-phi") {
    throw new Error("Healthcare Intelligence OS expected Clinical Context Gateway status.");
  }

  if (body.clinicalContextGateway?.dataBoundary !== "governed-semantic-context-only-no-live-phi") {
    throw new Error("Healthcare Intelligence OS expected Clinical Context Gateway data boundary.");
  }

  if (body.clinicalContextGateway?.rawSchemaAccess !== "blocked") {
    throw new Error("Healthcare Intelligence OS expected Clinical Context Gateway raw schema access blocker.");
  }

  if (body.clinicalContextGateway?.rawConnectorPayloadAccess !== "blocked") {
    throw new Error("Healthcare Intelligence OS expected Clinical Context Gateway raw connector payload blocker.");
  }

  if (body.clinicalContextGateway?.gatewayControlCount < 10) {
    throw new Error("Healthcare Intelligence OS expected Clinical Context Gateway control coverage.");
  }

  if (body.clinicalContextGateway?.baselineEvaluationCount < 5 || body.clinicalContextGateway?.validationStatus !== "passed") {
    throw new Error("Healthcare Intelligence OS expected Clinical Context Gateway validation coverage.");
  }

  if (body.clinicalWorkflowAutomation?.status !== "clinical-workflow-automation-synthetic-and-review-gated") {
    throw new Error("Healthcare Intelligence OS expected clinical workflow automation gated status.");
  }

  if (!Array.isArray(body.clinicalWorkflowAutomation?.tracks) || body.clinicalWorkflowAutomation.tracks.length < 8) {
    throw new Error("Healthcare Intelligence OS expected clinical workflow automation track coverage.");
  }

  if (!body.clinicalWorkflowAutomation.tracks.some((track) => track.slug === "pre-visit-chart-prep-gap-review")) {
    throw new Error("Healthcare Intelligence OS missing pre-visit chart prep track.");
  }

  if (!body.clinicalWorkflowAutomation.tracks.some((track) => track.slug === "clinician-inbox-admin-triage")) {
    throw new Error("Healthcare Intelligence OS missing clinician inbox admin triage track.");
  }

  if (!body.clinicalWorkflowAutomation.patientSafetyControlCount || body.clinicalWorkflowAutomation.patientSafetyControlCount < 30) {
    throw new Error("Healthcare Intelligence OS expected patient-safety control coverage.");
  }

  if (!body.clinicalWorkflowAutomation.patientEngagementAnalysisSignalCount || body.clinicalWorkflowAutomation.patientEngagementAnalysisSignalCount < 20) {
    throw new Error("Healthcare Intelligence OS expected patient-engagement analysis coverage.");
  }

  if (!body.clinicalWorkflowAutomation.interoperabilityBindingCount || body.clinicalWorkflowAutomation.interoperabilityBindingCount < 20) {
    throw new Error("Healthcare Intelligence OS expected interoperability binding coverage.");
  }

  if (!body.clinicalWorkflowAutomation.clinicianBurdenReductionMotionCount || body.clinicalWorkflowAutomation.clinicianBurdenReductionMotionCount < 20) {
    throw new Error("Healthcare Intelligence OS expected clinician burden-reduction coverage.");
  }

  if (!body.clinicalWorkflowAutomation.operationsOptimizationLeverCount || body.clinicalWorkflowAutomation.operationsOptimizationLeverCount < 20) {
    throw new Error("Healthcare Intelligence OS expected operations optimization coverage.");
  }

  if (!body.clinicalWorkflowAutomation.blockedActions?.includes("patient outreach")) {
    throw new Error("Healthcare Intelligence OS expected patient outreach to remain blocked.");
  }

  if (!body.clinicalWorkflowAutomation.blockedActions?.includes("EHR filing")) {
    throw new Error("Healthcare Intelligence OS expected EHR filing to remain blocked.");
  }

  if (
    !body.clinicalWorkflowAutomation.tracks.every(
      (track) =>
        Array.isArray(track.patientSafetyControls) &&
        track.patientSafetyControls.length >= 5 &&
        Array.isArray(track.interoperabilityBindings) &&
        track.interoperabilityBindings.length >= 4 &&
        track.retainedBoundary
    )
  ) {
    throw new Error("Healthcare Intelligence OS expected every workflow track to retain safety, interoperability, and boundary details.");
  }

  const brief = await request("/api/healthcare-intelligence-os/brief");
  requireStatus("Healthcare Intelligence OS brief", brief.response.status, 200);
  requireContentType("Healthcare Intelligence OS brief", brief.response, "text/markdown");
  requireHealthcareIntelligenceOSBoundary("Healthcare Intelligence OS brief", brief.response);

  if (!brief.body.text.includes("Clinical Workflow Automation")) {
    throw new Error("Healthcare Intelligence OS brief missing clinical workflow automation section.");
  }

  if (!brief.body.text.includes("Clinical Data Fabric")) {
    throw new Error("Healthcare Intelligence OS brief missing clinical data fabric section.");
  }

  if (!brief.body.text.includes("Clinical Data Governance")) {
    throw new Error("Healthcare Intelligence OS brief missing clinical data governance section.");
  }

  if (!brief.body.text.includes("Clinical Context Gateway")) {
    throw new Error("Healthcare Intelligence OS brief missing clinical context gateway section.");
  }

  if (!brief.body.text.includes("does not ingest live PHI")) {
    throw new Error("Healthcare Intelligence OS brief missing retained authority boundary.");
  }

  console.log("pass healthcare intelligence OS");
}

async function checkClinicalDataFabric() {
  const result = await request("/api/clinical-data-fabric");
  requireStatus("Clinical Data Fabric", result.response.status, 200);
  requireContentType("Clinical Data Fabric", result.response, "application/json");
  requireClinicalDataFabricBoundary("Clinical Data Fabric", result.response);
  const body = requireJson("Clinical Data Fabric", result.body);

  if (body.service !== "scrimed-clinical-data-fabric") {
    throw new Error(`Clinical Data Fabric expected scrimed-clinical-data-fabric but received ${body.service}.`);
  }

  if (body.status !== "clinical-data-fabric-control-plane-ready-no-phi") {
    throw new Error(`Clinical Data Fabric expected control-plane status but received ${body.status}.`);
  }

  if (body.dataBoundary !== "no-live-phi-control-plane") {
    throw new Error("Clinical Data Fabric expected no-live-PHI data boundary.");
  }

  if (body.connectorAuthority !== "not-production-connector-approved") {
    throw new Error("Clinical Data Fabric expected connector approval blocker.");
  }

  if (body.agentDataAuthority !== "semantic-layer-only-no-raw-schema-access") {
    throw new Error("Clinical Data Fabric expected semantic-only agent data authority.");
  }

  if (body.liveIngestionAuthority !== "blocked-pending-customer-authorization") {
    throw new Error("Clinical Data Fabric expected live ingestion authority blocker.");
  }

  if (body.validation?.status !== "passed") {
    throw new Error("Clinical Data Fabric expected validation status passed.");
  }

  if (!Array.isArray(body.sourceContracts) || body.sourceContracts.length < 9) {
    throw new Error("Clinical Data Fabric expected source contract coverage.");
  }

  const sourceIds = body.sourceContracts.map((source) => source.id);
  for (const expectedSource of [
    "fhir-r4-us-core",
    "hl7-v2-interfaces",
    "dicom-dicomweb-metadata",
    "x12-claims-utilization",
    "clinical-documents-notes",
    "pharmacy-medication-feeds",
    "device-wearable-remote-monitoring",
    "genomics-pathology-research",
    "scheduling-portal-engagement"
  ]) {
    if (!sourceIds.includes(expectedSource)) {
      throw new Error(`Clinical Data Fabric missing source contract ${expectedSource}.`);
    }
  }

  if (!body.sourceContracts.every((source) => source.agentAccessPolicy?.includes("semantic concepts"))) {
    throw new Error("Clinical Data Fabric expected every source contract to restrict agent access to semantic concepts.");
  }

  if (!body.sourceContracts.some((source) => source.standards?.includes("FHIR R4"))) {
    throw new Error("Clinical Data Fabric expected FHIR R4 standard coverage.");
  }

  if (!body.sourceContracts.some((source) => source.standards?.includes("DICOMweb"))) {
    throw new Error("Clinical Data Fabric expected DICOMweb standard coverage.");
  }

  if (!body.sourceContracts.some((source) => source.standards?.includes("X12 837"))) {
    throw new Error("Clinical Data Fabric expected X12 standard coverage.");
  }

  if (!Array.isArray(body.semanticMappings) || body.semanticMappings.length < 6) {
    throw new Error("Clinical Data Fabric expected semantic mapping coverage.");
  }

  for (const expectedMapping of ["patient", "condition", "lab-result", "medication", "image", "claim"]) {
    if (!body.semanticMappings.some((mapping) => mapping.entity === expectedMapping)) {
      throw new Error(`Clinical Data Fabric missing semantic mapping ${expectedMapping}.`);
    }
  }

  if (!Array.isArray(body.healthGraphEdgeContracts) || body.healthGraphEdgeContracts.length < 10) {
    throw new Error("Clinical Data Fabric expected health graph edge coverage.");
  }

  for (const expectedEdge of ["treated_by", "diagnosed_with", "prescribed", "supports", "references"]) {
    if (!body.healthGraphEdgeContracts.some((edge) => edge.edge === expectedEdge)) {
      throw new Error(`Clinical Data Fabric missing health graph edge ${expectedEdge}.`);
    }
  }

  if (!Array.isArray(body.workflowEvents) || body.workflowEvents.length < 4) {
    throw new Error("Clinical Data Fabric expected workflow event coverage.");
  }

  if (!Array.isArray(body.blockedClaims) || !body.blockedClaims.includes("live PHI ingestion enabled")) {
    throw new Error("Clinical Data Fabric expected live PHI ingestion to remain blocked.");
  }

  if (!body.blockedClaims.includes("production connector approved")) {
    throw new Error("Clinical Data Fabric expected production connector approval to remain blocked.");
  }

  if (!body.boundary.includes("does not ingest live records")) {
    throw new Error("Clinical Data Fabric expected retained boundary statement.");
  }

  const brief = await request("/api/clinical-data-fabric/brief");
  requireStatus("Clinical Data Fabric brief", brief.response.status, 200);
  requireContentType("Clinical Data Fabric brief", brief.response, "text/markdown");
  requireClinicalDataFabricBoundary("Clinical Data Fabric brief", brief.response);

  for (const expectedText of [
    "SCRIMED Clinical Data Fabric",
    "Source Contracts",
    "Semantic Mappings",
    "Health Graph",
    "Workflow Events",
    "Governance Controls",
    "Blocked Claims"
  ]) {
    if (!brief.body.text.includes(expectedText)) {
      throw new Error(`Clinical Data Fabric brief missing ${expectedText}.`);
    }
  }

  console.log("pass clinical data fabric");
}

async function checkClinicalDataGovernance() {
  const result = await request("/api/clinical-data-governance");
  requireStatus("Clinical Data Governance", result.response.status, 200);
  requireContentType("Clinical Data Governance", result.response, "application/json");
  requireClinicalDataGovernanceBoundary("Clinical Data Governance", result.response);
  const body = requireJson("Clinical Data Governance", result.body);

  if (body.service !== "scrimed-clinical-data-governance") {
    throw new Error(`Clinical Data Governance expected scrimed-clinical-data-governance but received ${body.service}.`);
  }

  if (body.status !== "clinical-data-governance-policy-engine-ready-no-phi") {
    throw new Error(`Clinical Data Governance expected policy engine status but received ${body.status}.`);
  }

  if (body.validation?.status !== "passed") {
    throw new Error("Clinical Data Governance expected validation status passed.");
  }

  if (!Array.isArray(body.policyRules) || body.policyRules.length < 10) {
    throw new Error("Clinical Data Governance expected policy rule coverage.");
  }

  for (const expectedRule of [
    "public-api-no-sensitive-data",
    "live-phi-not-enabled",
    "external-model-no-phi",
    "record-mutation-disabled",
    "payer-submission-disabled",
    "patient-contact-disabled",
    "connector-activation-disabled"
  ]) {
    if (!body.policyRules.some((rule) => rule.id === expectedRule)) {
      throw new Error(`Clinical Data Governance missing policy rule ${expectedRule}.`);
    }
  }

  if (!Array.isArray(body.baselineControlEvaluations) || body.baselineControlEvaluations.length < 5) {
    throw new Error("Clinical Data Governance expected baseline control evaluations.");
  }

  if (!body.baselineControlEvaluations.some((evaluation) => evaluation.id === "phi-to-external-model" && evaluation.decision.status === "blocked")) {
    throw new Error("Clinical Data Governance expected PHI-to-external-model baseline to be blocked.");
  }

  if (!body.baselineControlEvaluations.some((evaluation) => evaluation.id === "deidentified-review-packet" && evaluation.decision.status === "requires-human-review")) {
    throw new Error("Clinical Data Governance expected deidentified review packet baseline to require review.");
  }

  if (!body.baselineControlEvaluations.some((evaluation) => evaluation.id === "internal-semantic-context" && evaluation.decision.status === "allowed")) {
    throw new Error("Clinical Data Governance expected internal semantic context baseline to be allowed.");
  }

  const allowed = await postJson("/api/clinical-data-governance", {
    requesterRole: "internal-operator",
    purposeOfUse: "audit-preparation",
    dataClasses: ["metadata"],
    action: "semantic-context-request",
    destination: "internal-control-plane",
    consentStatus: "not-required-for-metadata",
    humanReviewStatus: "not-required",
    baaDpaStatus: "not-required-for-metadata",
    tenantScoped: true,
    minimumNecessary: true,
    productionConnectorApproved: false,
    externalModelApproved: false,
    residencyRegion: "US"
  });
  requireStatus("Clinical Data Governance allowed decision", allowed.response.status, 200);
  requireClinicalDataGovernanceBoundary("Clinical Data Governance allowed decision", allowed.response);
  const allowedBody = requireJson("Clinical Data Governance allowed decision", allowed.body);

  if (allowedBody.decision?.status !== "allowed") {
    throw new Error("Clinical Data Governance POST expected metadata semantic context to be allowed.");
  }

  const blocked = await postJson("/api/clinical-data-governance", {
    requesterRole: "service-agent",
    purposeOfUse: "healthcare-operations",
    dataClasses: ["phi"],
    action: "model-inference-external",
    destination: "external-model-provider",
    consentStatus: "unknown",
    humanReviewStatus: "queued",
    baaDpaStatus: "unknown",
    tenantScoped: true,
    minimumNecessary: true,
    productionConnectorApproved: false,
    externalModelApproved: false,
    residencyRegion: "unknown"
  });
  requireStatus("Clinical Data Governance blocked decision", blocked.response.status, 403);
  requireClinicalDataGovernanceBoundary("Clinical Data Governance blocked decision", blocked.response);
  const blockedBody = requireJson("Clinical Data Governance blocked decision", blocked.body);

  if (blockedBody.decision?.status !== "blocked") {
    throw new Error("Clinical Data Governance POST expected PHI external model request to be blocked.");
  }

  const brief = await request("/api/clinical-data-governance/brief");
  requireStatus("Clinical Data Governance brief", brief.response.status, 200);
  requireContentType("Clinical Data Governance brief", brief.response, "text/markdown");
  requireClinicalDataGovernanceBoundary("Clinical Data Governance brief", brief.response);

  for (const expectedText of [
    "SCRIMED Clinical Data Governance",
    "Required Policy Inputs",
    "Policy Rules",
    "Baseline Control Evaluations",
    "Retained No-Go Boundaries"
  ]) {
    if (!brief.body.text.includes(expectedText)) {
      throw new Error(`Clinical Data Governance brief missing ${expectedText}.`);
    }
  }

  console.log("pass clinical data governance");
}

async function checkClinicalContextGateway() {
  const result = await request("/api/clinical-context-gateway");
  requireStatus("Clinical Context Gateway", result.response.status, 200);
  requireContentType("Clinical Context Gateway", result.response, "application/json");
  requireClinicalContextGatewayBoundary("Clinical Context Gateway", result.response);
  const body = requireJson("Clinical Context Gateway", result.body);

  if (body.service !== "scrimed-clinical-context-gateway") {
    throw new Error(`Clinical Context Gateway expected scrimed-clinical-context-gateway but received ${body.service}.`);
  }

  if (body.status !== "clinical-context-gateway-ready-no-phi") {
    throw new Error(`Clinical Context Gateway expected ready no-PHI status but received ${body.status}.`);
  }

  if (body.dataBoundary !== "governed-semantic-context-only-no-live-phi") {
    throw new Error("Clinical Context Gateway expected governed semantic context boundary.");
  }

  if (body.rawSchemaAccess !== "blocked" || body.rawConnectorPayloadAccess !== "blocked") {
    throw new Error("Clinical Context Gateway expected raw schema and connector payload access to be blocked.");
  }

  if (body.clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error("Clinical Context Gateway expected clinical care authority blocker.");
  }

  if (body.validation?.status !== "passed") {
    throw new Error("Clinical Context Gateway expected validation status passed.");
  }

  if (!Array.isArray(body.gatewayControls) || body.gatewayControls.length < 10) {
    throw new Error("Clinical Context Gateway expected gateway control coverage.");
  }

  if (!Array.isArray(body.supportedScopes) || !body.supportedScopes.includes("patient-context-summary")) {
    throw new Error("Clinical Context Gateway expected patient context scope support.");
  }

  if (!Array.isArray(body.baselineEvaluations) || body.baselineEvaluations.length < 5) {
    throw new Error("Clinical Context Gateway expected baseline evaluations.");
  }

  if (!body.baselineEvaluations.some((evaluation) => evaluation.id === "internal-fhir-metadata-context" && evaluation.decision.status === "semantic-context-ready")) {
    throw new Error("Clinical Context Gateway expected internal FHIR metadata baseline to produce semantic context.");
  }

  if (!body.baselineEvaluations.some((evaluation) => evaluation.id === "deidentified-document-review-context" && evaluation.decision.status === "review-required")) {
    throw new Error("Clinical Context Gateway expected deidentified document baseline to require review.");
  }

  if (!body.baselineEvaluations.some((evaluation) => evaluation.id === "phi-external-model-context" && evaluation.decision.status === "blocked")) {
    throw new Error("Clinical Context Gateway expected PHI external model context baseline to block.");
  }

  const allowed = await postJson("/api/clinical-context-gateway", {
    requesterRole: "internal-operator",
    purposeOfUse: "audit-preparation",
    sourceContractId: "fhir-r4-us-core",
    requestedContextScope: "patient-context-summary",
    requestedConcepts: ["patient", "encounter", "condition", "observation"],
    dataClasses: ["metadata"],
    destination: "internal-control-plane",
    consentStatus: "not-required-for-metadata",
    humanReviewStatus: "not-required",
    baaDpaStatus: "not-required-for-metadata",
    tenantScoped: true,
    minimumNecessary: true,
    productionConnectorApproved: false,
    externalModelApproved: false,
    residencyRegion: "US",
    traceId: "public-smoke-context-gateway-allowed"
  });
  requireStatus("Clinical Context Gateway allowed decision", allowed.response.status, 200);
  requireClinicalContextGatewayBoundary("Clinical Context Gateway allowed decision", allowed.response);
  const allowedBody = requireJson("Clinical Context Gateway allowed decision", allowed.body);

  if (allowedBody.decision?.status !== "semantic-context-ready") {
    throw new Error("Clinical Context Gateway POST expected metadata request to produce semantic context.");
  }

  if (allowedBody.decision?.contextEnvelope?.includesRawDatabaseSchema !== false) {
    throw new Error("Clinical Context Gateway allowed envelope must not include raw database schema.");
  }

  if (allowedBody.decision?.contextEnvelope?.includesRawSourcePayload !== false) {
    throw new Error("Clinical Context Gateway allowed envelope must not include raw source payload.");
  }

  if (allowedBody.decision?.contextEnvelope?.containsPhi !== false) {
    throw new Error("Clinical Context Gateway allowed envelope must not include PHI.");
  }

  if (!Array.isArray(allowedBody.decision?.contextEnvelope?.allowedSemanticConcepts) || allowedBody.decision.contextEnvelope.allowedSemanticConcepts.length < 4) {
    throw new Error("Clinical Context Gateway allowed envelope expected semantic concepts.");
  }

  if (allowedBody.decision?.auditEnvelope?.envelopeHash?.length !== 64) {
    throw new Error("Clinical Context Gateway allowed decision expected envelope hash.");
  }

  const review = await postJson("/api/clinical-context-gateway", {
    requesterRole: "reviewer",
    purposeOfUse: "customer-sandbox-review",
    sourceContractId: "clinical-documents-notes",
    requestedContextScope: "clinical-workflow-context",
    requestedConcepts: ["document", "condition", "medication"],
    dataClasses: ["deidentified"],
    destination: "tenant-workspace",
    consentStatus: "not-required-for-metadata",
    humanReviewStatus: "queued",
    baaDpaStatus: "not-required-for-metadata",
    tenantScoped: true,
    minimumNecessary: true,
    productionConnectorApproved: false,
    externalModelApproved: false,
    residencyRegion: "US",
    traceId: "public-smoke-context-gateway-review"
  });
  requireStatus("Clinical Context Gateway review decision", review.response.status, 202);
  requireClinicalContextGatewayBoundary("Clinical Context Gateway review decision", review.response);
  const reviewBody = requireJson("Clinical Context Gateway review decision", review.body);

  if (reviewBody.decision?.status !== "review-required" || !reviewBody.decision?.reviewPacket) {
    throw new Error("Clinical Context Gateway POST expected deidentified request to produce review packet.");
  }

  if (reviewBody.decision?.contextEnvelope !== null) {
    throw new Error("Clinical Context Gateway review-required decision must not deliver context automatically.");
  }

  const blocked = await postJson("/api/clinical-context-gateway", {
    requesterRole: "service-agent",
    purposeOfUse: "healthcare-operations",
    sourceContractId: "fhir-r4-us-core",
    requestedContextScope: "clinical-workflow-context",
    requestedConcepts: ["patient", "condition"],
    dataClasses: ["phi"],
    destination: "external-model-provider",
    consentStatus: "unknown",
    humanReviewStatus: "queued",
    baaDpaStatus: "unknown",
    tenantScoped: true,
    minimumNecessary: true,
    productionConnectorApproved: false,
    externalModelApproved: false,
    residencyRegion: "unknown",
    traceId: "public-smoke-context-gateway-blocked"
  });
  requireStatus("Clinical Context Gateway blocked decision", blocked.response.status, 403);
  requireClinicalContextGatewayBoundary("Clinical Context Gateway blocked decision", blocked.response);
  const blockedBody = requireJson("Clinical Context Gateway blocked decision", blocked.body);

  if (blockedBody.decision?.status !== "blocked") {
    throw new Error("Clinical Context Gateway POST expected PHI external model request to be blocked.");
  }

  const invalid = await postJson("/api/clinical-context-gateway", {
    requesterRole: "internal-operator",
    purposeOfUse: "audit-preparation",
    sourceContractId: "fhir-r4-us-core",
    requestedContextScope: "patient-context-summary",
    requestedConcepts: ["patient"],
    dataClasses: ["metadata"],
    destination: "internal-control-plane",
    consentStatus: "not-required-for-metadata",
    humanReviewStatus: "not-required",
    baaDpaStatus: "not-required-for-metadata",
    tenantScoped: true,
    minimumNecessary: true,
    productionConnectorApproved: false,
    externalModelApproved: false,
    residencyRegion: "US",
    rawPatientText: "not accepted by the gateway"
  });
  requireStatus("Clinical Context Gateway invalid raw payload", invalid.response.status, 400);
  requireClinicalContextGatewayBoundary("Clinical Context Gateway invalid raw payload", invalid.response);
  const invalidBody = requireJson("Clinical Context Gateway invalid raw payload", invalid.body);

  if (invalidBody.error !== "invalid-context-gateway-request") {
    throw new Error("Clinical Context Gateway expected invalid raw payload to fail closed.");
  }

  const brief = await request("/api/clinical-context-gateway/brief");
  requireStatus("Clinical Context Gateway brief", brief.response.status, 200);
  requireContentType("Clinical Context Gateway brief", brief.response, "text/markdown");
  requireClinicalContextGatewayBoundary("Clinical Context Gateway brief", brief.response);

  for (const expectedText of [
    "SCRIMED Clinical Context Gateway",
    "Gateway Controls",
    "Supported Context Scopes",
    "Baseline Evaluations",
    "semantic context"
  ]) {
    if (!brief.body.text.includes(expectedText)) {
      throw new Error(`Clinical Context Gateway brief missing ${expectedText}.`);
    }
  }

  console.log("pass clinical context gateway");
}

async function checkScrimedOSUpgradeBatch() {
  const result = await request("/api/scrimed-os/upgrade-batch");
  requireStatus("SCRIMED OS upgrade batch", result.response.status, 200);
  requireContentType("SCRIMED OS upgrade batch", result.response, "application/json");
  requireScrimedOSUpgradeBatchBoundary("SCRIMED OS upgrade batch", result.response);
  const body = requireJson("SCRIMED OS upgrade batch", result.body);

  if (body.service !== "scrimed-os-upgrade-batch") {
    throw new Error(`SCRIMED OS upgrade batch expected scrimed-os-upgrade-batch but received ${body.service}.`);
  }

  if (body.status !== "scrimed-os-upgrade-batch-ready-no-phi") {
    throw new Error(`SCRIMED OS upgrade batch expected ready no-PHI status but received ${body.status}.`);
  }

  if (body.dataBoundary !== "synthetic-metadata-only-no-live-phi") {
    throw new Error("SCRIMED OS upgrade batch expected synthetic metadata-only boundary.");
  }

  if (body.productionBehavior !== "disabled" || body.externalModelCalls !== "disabled") {
    throw new Error("SCRIMED OS upgrade batch expected production behavior and external model calls disabled.");
  }

  if (body.clinicalAuthority !== "not-authorized") {
    throw new Error("SCRIMED OS upgrade batch expected clinical authority to remain blocked.");
  }

  if (body.runtimeOptimizer?.status !== "runtime-optimizer-metadata-ready") {
    throw new Error("SCRIMED OS upgrade batch expected Runtime Optimizer status.");
  }

  if (!body.runtimeOptimizer?.records?.some((record) => record.id === "dynamic-model-routing" && record.guardrailState === "blocked")) {
    throw new Error("SCRIMED OS upgrade batch expected dynamic model routing production guardrail to be blocked.");
  }

  if (!body.promptEvolutionEngine?.prompts?.some((prompt) => prompt.prompt_id === "diagnosis-finalizer" && prompt.deployment_status === "blocked" && prompt.unsafeDeploymentBlocked)) {
    throw new Error("SCRIMED OS upgrade batch expected unsafe prompt deployment to remain blocked.");
  }

  if (body.clinicalJudgeEnsemble?.finalAuthorityStatement !== "AI can pre-screen; clinician remains final authority.") {
    throw new Error("SCRIMED OS upgrade batch expected clinician final authority statement.");
  }

  if (!Array.isArray(body.clinicalJudgeEnsemble?.syntheticScores) || !body.clinicalJudgeEnsemble.syntheticScores.every((score) => score.rationaleHash?.length === 64)) {
    throw new Error("SCRIMED OS upgrade batch expected judge outputs to be rationale hashes.");
  }

  if (!body.humanOversightQueue?.queue?.every((item) => item.risk_tier !== "high" || item.status === "human_reviewed" || item.executionAllowed === false)) {
    throw new Error("SCRIMED OS upgrade batch expected high-risk human oversight tasks to fail closed unless reviewed.");
  }

  if (!body.agentLab?.agents?.every((agent) => agent.owner && agent.risk_tier && agent.allowed_data_class && agent.blocked_actions?.length >= 5 && agent.audit_hash?.length === 64)) {
    throw new Error("SCRIMED OS upgrade batch expected every agent lab entry to have owner, risk, data class, blocked actions, and audit hash.");
  }

  for (const expectedMetric of [
    "cost_per_note",
    "cost_per_claim_review",
    "cost_per_prior_auth_draft",
    "cost_per_patient_summary",
    "cost_per_agent_run"
  ]) {
    if (!body.tokenEconomicsDashboard?.metrics?.some((metric) => metric.metric === expectedMetric)) {
      throw new Error(`SCRIMED OS upgrade batch missing token economics metric ${expectedMetric}.`);
    }
  }

  for (const expectedAgent of [
    "Diabetes Coach",
    "Heart Failure Monitor",
    "Oncology Navigator",
    "Population Health Agent",
    "Hospital Operations Agent"
  ]) {
    if (!body.longHorizonAgentRegistry?.agents?.some((agent) => agent.name === expectedAgent && agent.status === "lab_only" && agent.human_override_required)) {
      throw new Error(`SCRIMED OS upgrade batch missing lab-only long-horizon agent ${expectedAgent}.`);
    }
  }

  for (const expectedSource of ["FHIR", "SNOMED", "LOINC", "RxNorm", "ICD-10", "CPT", "payer policy", "clinical guidelines"]) {
    if (!body.clinicalKnowledgeFabric?.records?.some((record) => record.source === expectedSource)) {
      throw new Error(`SCRIMED OS upgrade batch missing clinical knowledge fabric source ${expectedSource}.`);
    }
  }

  if (!body.modelRegressionWatch?.models?.every((model) => model.autoPromoteToClinicalAuthority === false)) {
    throw new Error("SCRIMED OS upgrade batch expected model upgrades not to auto-promote to clinical authority.");
  }

  if (!body.lifeSciencesDrugDiscoveryReadiness?.modules?.every((module) => module.status === "research_preview" && module.blockedClaims?.includes("therapeutic claim"))) {
    throw new Error("SCRIMED OS upgrade batch expected life sciences modules to remain research preview only.");
  }

  if (!body.publicTrustInvestorNarrative?.some((record) => record.theme === "model-agnostic infrastructure")) {
    throw new Error("SCRIMED OS upgrade batch expected public trust model-agnostic infrastructure narrative.");
  }

  if (body.validation?.status !== "passed") {
    throw new Error("SCRIMED OS upgrade batch expected validation status passed.");
  }

  const brief = await request("/api/scrimed-os/upgrade-batch/brief");
  requireStatus("SCRIMED OS upgrade batch brief", brief.response.status, 200);
  requireContentType("SCRIMED OS upgrade batch brief", brief.response, "text/markdown");
  requireScrimedOSUpgradeBatchBoundary("SCRIMED OS upgrade batch brief", brief.response);

  for (const expectedText of [
    "SCRIMED OS Upgrade Batch",
    "Runtime Optimizer",
    "Prompt Evolution Engine",
    "Clinical Judge Ensemble",
    "Cost Per Outcome",
    "Model Regression Watch",
    "NO-GO Boundaries"
  ]) {
    if (!brief.body.text.includes(expectedText)) {
      throw new Error(`SCRIMED OS upgrade batch brief missing ${expectedText}.`);
    }
  }

  console.log("pass SCRIMED OS upgrade batch");
}

async function checkScrimedIntelligencePlatform() {
  const result = await request("/api/scrimed-intelligence-platform");
  requireStatus("SCRIMED Intelligence Platform", result.response.status, 200);
  requireContentType("SCRIMED Intelligence Platform", result.response, "application/json");
  requireScrimedIntelligencePlatformBoundary("SCRIMED Intelligence Platform", result.response);
  const body = requireJson("SCRIMED Intelligence Platform", result.body);

  if (body.service !== "scrimed-intelligence-platform") {
    throw new Error(`SCRIMED Intelligence Platform expected scrimed-intelligence-platform but received ${body.service}.`);
  }

  if (body.status !== "scrimed-intelligence-platform-active-synthetic-only") {
    throw new Error(`SCRIMED Intelligence Platform expected active synthetic-only status but received ${body.status}.`);
  }

  if (body.noPhiConfirmed !== true || body.syntheticOnly !== true || body.productionApproval !== false) {
    throw new Error("SCRIMED Intelligence Platform expected no-PHI, synthetic-only, productionApproval false posture.");
  }

  const expectedModules = [
    "clinical_intelligence",
    "rcm",
    "research",
    "imaging",
    "genomics",
    "ambient_scribe",
    "docutwin",
    "care_explain",
    "trialcore",
    "trust_engine",
    "education",
    "operations"
  ];
  const moduleIds = body.intelligenceMesh?.modules?.map((module) => module.module) ?? [];

  if (body.intelligenceMesh?.moduleCount !== expectedModules.length) {
    throw new Error("SCRIMED Intelligence Platform expected full intelligence mesh module count.");
  }

  for (const moduleId of expectedModules) {
    if (!moduleIds.includes(moduleId)) {
      throw new Error(`SCRIMED Intelligence Platform missing module ${moduleId}.`);
    }
  }

  if (!Array.isArray(body.intelligenceMesh?.modules) || !body.intelligenceMesh.modules.every((module) => module.allowed_tools?.includes("schema_validator") && module.blocked_tools?.includes("ehr_writeback"))) {
    throw new Error("SCRIMED Intelligence Platform expected every module to declare allowed and blocked tools.");
  }

  if (body.clinicalMemoryGraph?.nodeCount < 9 || body.clinicalMemoryGraph?.edgeCount < 6) {
    throw new Error("SCRIMED Intelligence Platform expected clinical memory graph node and edge coverage.");
  }

  if (!body.clinicalMemoryGraph.nodes.every((node) => node.provenance?.synthetic === true)) {
    throw new Error("SCRIMED Intelligence Platform expected every graph node to preserve synthetic provenance.");
  }

  const requiredFields = body.provenanceConfidence?.requiredFields ?? [];
  for (const field of [
    "sources",
    "confidence_score",
    "uncertainty_reason",
    "missing_evidence",
    "model_version",
    "timestamp",
    "human_validation_status",
    "clinical_disclaimer",
    "audit_hash"
  ]) {
    if (!requiredFields.includes(field)) {
      throw new Error(`SCRIMED Intelligence Platform missing provenance field ${field}.`);
    }
  }

  if (!/^scrimed-intel-[0-9a-f]{8}$/.test(body.provenanceConfidence?.output?.audit_hash ?? "")) {
    throw new Error("SCRIMED Intelligence Platform expected deterministic provenance audit hash.");
  }

  if (body.provenanceConfidence?.output?.confidence_score < 0 || body.provenanceConfidence?.output?.confidence_score > 1) {
    throw new Error("SCRIMED Intelligence Platform expected confidence score between 0 and 1.");
  }

  if (body.flightRecorder?.recordCount < 1 || !body.flightRecorder.records?.[0]?.audit_hash) {
    throw new Error("SCRIMED Intelligence Platform expected AI Flight Recorder metadata.");
  }

  for (const expectedCheck of [
    "hallucination_guard",
    "provenance_required",
    "confidence_required",
    "blocked_phi",
    "blocked_autonomous_clinical_action",
    "latency_budget_metadata",
    "regression_eval_placeholder"
  ]) {
    if (!body.evaluationPipeline?.checks?.some((check) => check.id === expectedCheck)) {
      throw new Error(`SCRIMED Intelligence Platform missing evaluation check ${expectedCheck}.`);
    }
  }

  if (body.syntheticPatientStudio?.generator !== "deterministic-seeded-synthetic-only") {
    throw new Error("SCRIMED Intelligence Platform expected deterministic synthetic patient studio.");
  }

  if (body.syntheticPatientStudio.cohort?.length < 3 || body.syntheticPatientStudio.fhir_r4_bundle_stub?.entry?.length < 12) {
    throw new Error("SCRIMED Intelligence Platform expected synthetic cohort and FHIR R4 stub entries.");
  }

  if (!body.syntheticPatientStudio.csv_export?.includes("synthetic_patient_id,age_band,geography")) {
    throw new Error("SCRIMED Intelligence Platform expected CSV export header.");
  }

  for (const domain of ["clinical", "financial", "operational", "patient"]) {
    if (!body.outcomeIntelligence?.schema?.[domain] || !body.outcomeIntelligence?.dashboardSample?.[domain]) {
      throw new Error(`SCRIMED Intelligence Platform missing outcome KPI domain ${domain}.`);
    }
  }

  for (const provider of ["openai", "anthropic", "gemini", "local_open_weight", "scrimed_internal"]) {
    if (!body.modelRouter?.providers?.includes(provider)) {
      throw new Error(`SCRIMED Intelligence Platform missing model provider ${provider}.`);
    }
  }

  if (!body.modelRouter?.decisions?.some((decision) => decision.route_status === "blocked_phi" && decision.no_external_call_performed === true)) {
    throw new Error("SCRIMED Intelligence Platform expected blocked PHI routing with no external call.");
  }

  if (!body.modelRouter?.decisions?.some((decision) => decision.human_review_required === true)) {
    throw new Error("SCRIMED Intelligence Platform expected human review route decision.");
  }

  if (body.scrimedUniversity?.trackCount < 14) {
    throw new Error("SCRIMED Intelligence Platform expected SCRIMED University track coverage.");
  }

  for (const boundary of ["no live PHI", "no EHR writeback", "no payer submission", "no regulatory certification claims"]) {
    if (!body.guardrails?.noGoBoundaries?.includes(boundary)) {
      throw new Error(`SCRIMED Intelligence Platform missing NO-GO boundary ${boundary}.`);
    }
  }

  if (!body.guardrails?.sampleDecisions?.some((decision) => decision.status === "blocked")) {
    throw new Error("SCRIMED Intelligence Platform expected blocked guardrail sample decision.");
  }

  if (body.evaluationGate?.route !== "/api/scrimed-intelligence-platform/evaluate") {
    throw new Error("SCRIMED Intelligence Platform expected evaluation gate route.");
  }

  if (!body.evaluationGate?.sampleResults?.some((result) => result.decision === "allowed")) {
    throw new Error("SCRIMED Intelligence Platform expected allowed evaluation sample.");
  }

  if (!body.evaluationGate.sampleResults?.some((result) => result.decision === "human_review_required")) {
    throw new Error("SCRIMED Intelligence Platform expected human-review evaluation sample.");
  }

  if (!body.evaluationGate.sampleResults?.some((result) => result.decision === "blocked")) {
    throw new Error("SCRIMED Intelligence Platform expected blocked evaluation sample.");
  }

  const serialized = JSON.stringify(body);
  if (/Bearer\s+[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(serialized)) {
    throw new Error("SCRIMED Intelligence Platform public response must not expose bearer tokens.");
  }

  const evaluationGate = await request("/api/scrimed-intelligence-platform/evaluate");
  requireStatus("SCRIMED Intelligence Platform evaluation gate", evaluationGate.response.status, 200);
  requireContentType("SCRIMED Intelligence Platform evaluation gate", evaluationGate.response, "application/json");
  requireScrimedIntelligencePlatformBoundary("SCRIMED Intelligence Platform evaluation gate", evaluationGate.response);
  const evaluationGateBody = requireJson("SCRIMED Intelligence Platform evaluation gate", evaluationGate.body);

  if (evaluationGateBody.status !== "evaluation-gate-ready-synthetic-only") {
    throw new Error("SCRIMED Intelligence Platform evaluation gate expected ready synthetic-only status.");
  }

  if (!evaluationGateBody.samples?.some((sample) => sample.decision === "allowed")) {
    throw new Error("SCRIMED Intelligence Platform evaluation gate expected allowed sample.");
  }

  if (!evaluationGateBody.samples?.some((sample) => sample.decision === "human_review_required")) {
    throw new Error("SCRIMED Intelligence Platform evaluation gate expected human review sample.");
  }

  if (!evaluationGateBody.samples?.some((sample) => sample.decision === "blocked")) {
    throw new Error("SCRIMED Intelligence Platform evaluation gate expected blocked sample.");
  }

  const allowedEvaluation = await postJson("/api/scrimed-intelligence-platform/evaluate", {
    request_id: "public-smoke-intel-eval-allowed",
    module: "operations",
    action: "synthetic operations metadata summary",
    data_classification: "synthetic_metadata",
    requested_tools: ["synthetic_context_loader", "schema_validator", "provenance_hasher"],
    output_metadata: {
      output_id: "public-smoke-intel-output-allowed",
      source_count: 2,
      confidence_score: 0.82,
      uncertainty_reason_present: true,
      missing_evidence_count: 1,
      clinical_disclaimer_present: true,
      audit_hash_present: true,
      human_validation_status: "validated_for_demo_only"
    },
    model_request: {
      task: "synthetic operational summary",
      cost: "low",
      latency: "interactive",
      privacy: "synthetic_only",
      accuracy_requirement: "standard",
      risk_level: "low",
      deployment_region: "us"
    },
    human_review_status: "not_required",
    synthetic_only: true
  });
  requireStatus("SCRIMED Intelligence Platform allowed evaluation", allowedEvaluation.response.status, 200);
  requireScrimedIntelligencePlatformBoundary("SCRIMED Intelligence Platform allowed evaluation", allowedEvaluation.response);
  const allowedEvaluationBody = requireJson("SCRIMED Intelligence Platform allowed evaluation", allowedEvaluation.body);

  if (allowedEvaluationBody.decision !== "allowed" || allowedEvaluationBody.no_external_call_performed !== true) {
    throw new Error("SCRIMED Intelligence Platform allowed evaluation expected allowed decision with no external call.");
  }

  const reviewEvaluation = await postJson("/api/scrimed-intelligence-platform/evaluate", {
    request_id: "public-smoke-intel-eval-review",
    module: "clinical_intelligence",
    action: "clinical education draft",
    data_classification: "synthetic_clinical_fixture",
    requested_tools: ["synthetic_context_loader", "schema_validator", "human_review_queue"],
    output_metadata: {
      output_id: "public-smoke-intel-output-review",
      source_count: 2,
      confidence_score: 0.76,
      uncertainty_reason_present: true,
      missing_evidence_count: 4,
      clinical_disclaimer_present: true,
      audit_hash_present: true,
      human_validation_status: "review_required"
    },
    model_request: {
      task: "clinical education draft",
      cost: "standard",
      latency: "standard",
      privacy: "synthetic_only",
      accuracy_requirement: "clinical_review_required",
      risk_level: "high",
      deployment_region: "us"
    },
    human_review_status: "queued",
    synthetic_only: true
  });
  requireStatus("SCRIMED Intelligence Platform review evaluation", reviewEvaluation.response.status, 202);
  requireScrimedIntelligencePlatformBoundary("SCRIMED Intelligence Platform review evaluation", reviewEvaluation.response);
  const reviewEvaluationBody = requireJson("SCRIMED Intelligence Platform review evaluation", reviewEvaluation.body);

  if (
    reviewEvaluationBody.decision !== "human_review_required" ||
    reviewEvaluationBody.status !== "evaluation-human-review-required"
  ) {
    throw new Error("SCRIMED Intelligence Platform review evaluation expected human_review_required.");
  }

  if (!reviewEvaluationBody.required_actions?.some((action) => action.includes("Queue qualified human review"))) {
    throw new Error("SCRIMED Intelligence Platform review evaluation expected human review required action.");
  }

  const blockedEvaluation = await postJson("/api/scrimed-intelligence-platform/evaluate", {
    request_id: "public-smoke-intel-eval-blocked",
    module: "clinical_intelligence",
    action: "diagnose live patient and write to EHR",
    data_classification: "live_phi_blocked",
    requested_tools: ["external_model_call", "ehr_writeback"],
    output_metadata: {
      output_id: "public-smoke-intel-output-blocked",
      source_count: 0,
      confidence_score: 1.4,
      uncertainty_reason_present: false,
      missing_evidence_count: 0,
      clinical_disclaimer_present: false,
      audit_hash_present: false,
      human_validation_status: "not_reviewed"
    },
    model_request: {
      task: "live PHI request",
      cost: "premium",
      latency: "batch",
      privacy: "live_phi_blocked",
      accuracy_requirement: "clinical_review_required",
      risk_level: "critical",
      deployment_region: "global_review_required"
    },
    human_review_status: "queued",
    synthetic_only: false
  });
  requireStatus("SCRIMED Intelligence Platform blocked evaluation", blockedEvaluation.response.status, 403);
  requireScrimedIntelligencePlatformBoundary("SCRIMED Intelligence Platform blocked evaluation", blockedEvaluation.response);
  const blockedEvaluationBody = requireJson("SCRIMED Intelligence Platform blocked evaluation", blockedEvaluation.body);

  if (blockedEvaluationBody.decision !== "blocked" || !blockedEvaluationBody.failed_checks?.includes("live_phi_blocked")) {
    throw new Error("SCRIMED Intelligence Platform blocked evaluation expected live PHI block.");
  }

  const invalidEvaluation = await postJson("/api/scrimed-intelligence-platform/evaluate", {
    request_id: "public-smoke-intel-eval-invalid",
    module: "operations",
    action: "synthetic operations metadata summary",
    data_classification: "synthetic_metadata",
    rawText: "not accepted by the SCRIMED evaluation gate"
  });
  requireStatus("SCRIMED Intelligence Platform invalid evaluation", invalidEvaluation.response.status, 400);
  requireScrimedIntelligencePlatformBoundary("SCRIMED Intelligence Platform invalid evaluation", invalidEvaluation.response);
  const invalidEvaluationBody = requireJson("SCRIMED Intelligence Platform invalid evaluation", invalidEvaluation.body);

  if (invalidEvaluationBody.error !== "invalid-intelligence-evaluation-request") {
    throw new Error("SCRIMED Intelligence Platform invalid evaluation expected fail-closed error.");
  }

  const brief = await request("/api/scrimed-intelligence-platform/brief");
  requireStatus("SCRIMED Intelligence Platform brief", brief.response.status, 200);
  requireContentType("SCRIMED Intelligence Platform brief", brief.response, "text/markdown");
  requireScrimedIntelligencePlatformBoundary("SCRIMED Intelligence Platform brief", brief.response);

  for (const expectedText of [
    "SCRIMED Intelligence Platform",
    "Intelligence Mesh",
    "Clinical Memory Graph",
    "AI Flight Recorder",
    "Evaluation Gate",
    "Provider-neutral Model Router",
    "NO-GO"
  ]) {
    if (!brief.body.text.includes(expectedText)) {
      throw new Error(`SCRIMED Intelligence Platform brief missing ${expectedText}.`);
    }
  }

  console.log("pass SCRIMED Intelligence Platform");
}

async function checkHealthRecordsSafetyExchange() {
  const result = await request("/api/health-records");
  requireStatus("Health Records Safety Exchange", result.response.status, 200);
  requireContentType("Health Records Safety Exchange", result.response, "application/json");
  requireHealthRecordsBoundary("Health Records Safety Exchange", result.response);
  const body = requireJson("Health Records Safety Exchange", result.body);

  if (body.service !== "scrimed-health-records-safety-exchange") {
    throw new Error(`Health Records Safety Exchange expected scrimed-health-records-safety-exchange but received ${body.service}.`);
  }

  if (body.status !== "health-records-safety-exchange-control-plane-active") {
    throw new Error(`Health Records Safety Exchange expected active status but received ${body.status}.`);
  }

  if (!Array.isArray(body.capabilities) || body.capabilities.length < 5) {
    throw new Error("Health Records Safety Exchange expected capability coverage.");
  }

  if (!Array.isArray(body.safetyChecks) || body.safetyChecks.length < 6) {
    throw new Error("Health Records Safety Exchange expected patient-safety checks.");
  }

  if (!Array.isArray(body.boundaryResolutions) || body.boundaryResolutions.length < 5) {
    throw new Error("Health Records Safety Exchange expected boundary workarounds.");
  }

  if (!Array.isArray(body.operatingRules) || !body.operatingRules.some((rule) => rule.includes("Reject PHI"))) {
    throw new Error("Health Records Safety Exchange expected PHI rejection operating rule.");
  }

  const brief = await request("/api/health-records/brief");
  requireStatus("Health Records Safety Exchange brief", brief.response.status, 200);
  requireContentType("Health Records Safety Exchange brief", brief.response, "text/markdown");
  requireHealthRecordsBoundary("Health Records Safety Exchange brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Health Records Safety Exchange Brief")) {
    throw new Error("Health Records Safety Exchange brief missing heading.");
  }

  if (!brief.body.text.includes("not PHI processing approval")) {
    throw new Error("Health Records Safety Exchange brief missing PHI authority boundary.");
  }

  const accepted = await postJson("/api/health-records/extract", {
    syntheticOnly: true,
    sourceFormat: "fhir-bundle",
    declaredStandard: "FHIR R4 synthetic bundle",
    recordKinds: ["Patient placeholder", "Encounter", "Observation"],
    containsPhi: false,
    includesPatientIdentifiers: false,
    intendedUse: "Synthetic extraction planning",
    requestedAction: "extract synthetic reviewer packet"
  });
  requireStatus("Health Records synthetic extraction accepted", accepted.response.status, 202);
  requireContentType("Health Records synthetic extraction accepted", accepted.response, "application/json");
  requireHealthRecordsBoundary("Health Records synthetic extraction accepted", accepted.response);
  const acceptedBody = requireJson("Health Records synthetic extraction accepted", accepted.body);

  if (acceptedBody.status !== "synthetic-extraction-plan-ready") {
    throw new Error("Health Records synthetic extraction expected ready status.");
  }

  if (!Array.isArray(acceptedBody.extractionPlan) || acceptedBody.extractionPlan.length < 4) {
    throw new Error("Health Records synthetic extraction expected extraction plan.");
  }

  const blocked = await postJson("/api/health-records/extract", {
    syntheticOnly: false,
    sourceFormat: "fhir-bundle",
    recordKinds: ["Patient"],
    containsPhi: true,
    includesPatientIdentifiers: true,
    requestedAction: "production EHR writeback"
  });
  requireStatus("Health Records synthetic extraction blocked", blocked.response.status, 400);
  requireContentType("Health Records synthetic extraction blocked", blocked.response, "application/json");
  requireHealthRecordsBoundary("Health Records synthetic extraction blocked", blocked.response);
  const blockedBody = requireJson("Health Records synthetic extraction blocked", blocked.body);

  if (blockedBody.status !== "blocked") {
    throw new Error("Health Records synthetic extraction expected blocked status for live/PHI request.");
  }

  console.log("pass health records safety exchange");
}

async function checkCapitalVitality() {
  const result = await request("/api/capital-vitality");
  requireStatus("Capital Vitality", result.response.status, 200);
  requireContentType("Capital Vitality", result.response, "application/json");
  requireCapitalVitalityBoundary("Capital Vitality", result.response);
  const body = requireJson("Capital Vitality", result.body);

  if (body.service !== "scrimed-capital-vitality") {
    throw new Error(`Capital Vitality expected scrimed-capital-vitality but received ${body.service}.`);
  }

  if (body.status !== "capital-vitality-revenue-funding-readiness-active") {
    throw new Error(`Capital Vitality expected active status but received ${body.status}.`);
  }

  if (body.fundingVitalityPosture !== "investor-ready-readiness-materials-no-securities-offer") {
    throw new Error("Capital Vitality must preserve no-securities funding posture.");
  }

  if (body.authority?.securitiesAuthority !== "not-securities-offering-material") {
    throw new Error("Capital Vitality must not create securities offering material.");
  }

  if (body.authority?.investmentAdvice !== "not-investment-advice") {
    throw new Error("Capital Vitality must not create investment advice.");
  }

  if (body.authority?.valuationAuthority !== "not-valuation-assurance") {
    throw new Error("Capital Vitality must not create valuation assurance.");
  }

  if (body.authority?.financialAuthority !== "not-audited-financial-report") {
    throw new Error("Capital Vitality must not create audited financial reporting.");
  }

  if (body.capitalPlanning?.status !== "capital-planning-workbench-ready-local-only") {
    throw new Error("Capital Vitality expected a local-only capital planning workbench.");
  }

  if (
    body.capitalPlanning?.modelVersion !== "scrimed-capital-plan-v1" ||
    body.capitalPlanning?.localOnly !== true ||
    body.capitalPlanning?.inputPersistence !== false ||
    body.capitalPlanning?.externalUseAuthorized !== false
  ) {
    throw new Error("Capital Vitality planning posture must remain local, nonpersistent, and externally unauthorized.");
  }

  if (body.investorDiligenceManifest?.status !== "investor-diligence-manifest-active-metadata-only") {
    throw new Error("Capital Vitality expected a metadata-only investor diligence manifest.");
  }

  if (
    body.investorDiligenceManifest?.artifactCount !== 6 ||
    body.investorDiligenceManifest?.blockingArtifactCount !== 5 ||
    body.investorDiligenceManifest?.acceptsRawEvidence !== false ||
    body.investorDiligenceManifest?.externalReleaseAuthorized !== false
  ) {
    throw new Error("Capital Vitality diligence manifest counts or fail-closed posture drifted.");
  }

  if (
    body.investorDiligenceManifest?.releaseAssessment?.decision !== "blocked-remediation-required" ||
    body.investorDiligenceManifest?.releaseAssessment?.externalReleaseAuthorized !== false ||
    body.externalFundraisingReleaseAuthorized !== false
  ) {
    throw new Error("Capital Vitality fundraising release must remain blocked pending qualified evidence and approval.");
  }

  if (
    body.capitalAcquisitionReadiness?.status !== "capital-and-public-sector-readiness-active-evidence-gated" ||
    body.capitalAcquisitionReadiness?.capitalAccessLaneCount !== 7 ||
    body.capitalAcquisitionReadiness?.readinessGateCount < 10
  ) {
    throw new Error("Capital Vitality expected evidence-gated capital and public-sector acquisition readiness.");
  }

  if (
    body.capitalAcquisitionReadiness?.authority?.registrationsVerified !== false ||
    body.capitalAcquisitionReadiness?.authority?.certificationsVerified !== false ||
    body.capitalAcquisitionReadiness?.authority?.governmentAwardVerified !== false ||
    body.capitalAcquisitionReadiness?.authority?.externalSubmissionAuthorized !== false ||
    body.externalPublicSectorSubmissionAuthorized !== false
  ) {
    throw new Error("Capital Vitality must not infer registration, certification, government award, or submission authority.");
  }

  if (body.capitalAcquisitionReadiness?.defaultAssessment?.decision !== "input-required") {
    throw new Error("Capital Vitality public-sector evaluator must require verified operator input by default.");
  }

  if (
    body.capitalAcquisitionReadiness?.federalContractReadiness?.status !==
      "sam-far-readiness-active-operator-evidence-required" ||
    body.capitalAcquisitionReadiness?.federalContractReadiness?.checkpointCount !== 14 ||
    body.capitalAcquisitionReadiness?.federalContractReadiness?.defaultDecision !== "operator-input-required" ||
    body.capitalAcquisitionReadiness?.federalContractReadiness?.authority?.samRegistrationVerified !== false ||
    body.capitalAcquisitionReadiness?.federalContractReadiness?.authority?.primeOfferAuthorized !== false ||
    body.capitalAcquisitionReadiness?.federalContractReadiness?.authority?.externalSubmissionAuthorized !== false
  ) {
    throw new Error("Capital Vitality federal contract readiness must require operator evidence and retain all registration, offer, and submission authority.");
  }

  if (
    body.capitalAcquisitionCapturePacket?.status !==
      "capital-acquisition-capture-packet-active-internal-metadata-only" ||
    body.capitalAcquisitionCapturePacket?.supportedLaneCount !== 5 ||
    body.capitalAcquisitionCapturePacket?.proofArtifactCount !== 5 ||
    body.capitalAcquisitionCapturePacket?.defaultExternalReleaseAuthorized !== false ||
    body.capitalAcquisitionCapturePacket?.defaultExternalSubmissionAuthorized !== false ||
    body.capitalAcquisitionCapturePacket?.containsRawProposal !== false ||
    body.capitalAcquisitionCapturePacket?.containsRegistrationIdentifiers !== false ||
    body.capitalAcquisitionCapturePacket?.containsCredentials !== false ||
    body.capitalAcquisitionCapturePacket?.containsPhi !== false
  ) {
    throw new Error("Capital Vitality capture packet must remain internal, metadata-only, and fail-closed for external release and submission.");
  }

  if (!Array.isArray(body.revenueCapabilities) || body.revenueCapabilities.length < 8) {
    throw new Error("Capital Vitality expected revenue capability coverage.");
  }

  if (!Array.isArray(body.competitiveMoatSignals) || body.competitiveMoatSignals.length < 8) {
    throw new Error("Capital Vitality expected competitive moat signal coverage.");
  }

  if (!Array.isArray(body.investorReadinessMilestones) || body.investorReadinessMilestones.length < 8) {
    throw new Error("Capital Vitality expected investor readiness milestone coverage.");
  }

  if (!Array.isArray(body.fundingVitalityWorkstreams) || body.fundingVitalityWorkstreams.length < 8) {
    throw new Error("Capital Vitality expected funding workstream coverage.");
  }

  if (!body.proofRouteCount || body.proofRouteCount < 20) {
    throw new Error("Capital Vitality expected proof-route coverage.");
  }

  const sourcePageRouteCount = await countRouteFiles("app", "page.tsx");
  const sourceApiRoutePatternCount = await countRouteFiles("app/api", "route.ts");

  if (body.sourceAlignment?.pageRouteCount !== sourcePageRouteCount) {
    throw new Error(`Capital Vitality page route count mismatch. API reported ${body.sourceAlignment?.pageRouteCount}; source has ${sourcePageRouteCount}.`);
  }

  if (body.sourceAlignment?.apiRoutePatternCount !== sourceApiRoutePatternCount) {
    throw new Error(`Capital Vitality API route count mismatch. API reported ${body.sourceAlignment?.apiRoutePatternCount}; source has ${sourceApiRoutePatternCount}.`);
  }

  const brief = await request("/api/capital-vitality/brief");
  requireStatus("Capital Vitality brief", brief.response.status, 200);
  requireContentType("Capital Vitality brief", brief.response, "text/markdown");
  requireCapitalVitalityBoundary("Capital Vitality brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Capital Vitality Brief")) {
    throw new Error("Capital Vitality brief missing heading.");
  }

  if (!brief.body.text.includes("not investment advice")) {
    throw new Error("Capital Vitality brief missing investment advice boundary.");
  }

  if (!brief.body.text.includes("not securities offering material")) {
    throw new Error("Capital Vitality brief missing securities boundary.");
  }

  if (!brief.body.text.includes("Capital Planning Workbench")) {
    throw new Error("Capital Vitality brief missing capital planning workbench posture.");
  }

  if (!brief.body.text.includes("Investor Diligence Manifest")) {
    throw new Error("Capital Vitality brief missing investor diligence manifest posture.");
  }

  if (!brief.body.text.includes("Capital And Public-Sector Acquisition Readiness")) {
    throw new Error("Capital Vitality brief missing public-sector acquisition readiness posture.");
  }

  if (!brief.body.text.includes("Capital Acquisition Capture Packet")) {
    throw new Error("Capital Vitality brief missing the internal capital acquisition capture packet posture.");
  }

  if (!brief.body.text.includes("External submission authorized: false")) {
    throw new Error("Capital Vitality brief must preserve the public-sector submission lock.");
  }

  if (!brief.body.text.includes("External release authorized: false")) {
    throw new Error("Capital Vitality brief must preserve the external fundraising release lock.");
  }

  console.log("pass capital vitality");
}

async function checkGrowthEngine() {
  const result = await request("/api/growth-engine");
  requireStatus("Growth Engine", result.response.status, 200);
  requireContentType("Growth Engine", result.response, "application/json");
  requireGrowthEngineBoundary("Growth Engine", result.response);
  const body = requireJson("Growth Engine", result.body);

  if (body.service !== "scrimed-commercial-growth-engine") {
    throw new Error(`Growth Engine expected scrimed-commercial-growth-engine but received ${body.service}.`);
  }

  if (body.status !== "commercial-growth-engine-active") {
    throw new Error(`Growth Engine expected active status but received ${body.status}.`);
  }

  if (body.authority?.revenueAuthority !== "not-revenue-guarantee") {
    throw new Error("Growth Engine must not create revenue guarantees.");
  }

  if (body.authority?.securitiesAuthority !== "not-securities-offering-material") {
    throw new Error("Growth Engine must not create securities offering material.");
  }

  if (body.authority?.investmentAdvice !== "not-investment-advice") {
    throw new Error("Growth Engine must not create investment advice.");
  }

  if (body.authority?.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Growth Engine must keep PHI authority blocked.");
  }

  if (!Array.isArray(body.growthPlays) || body.growthPlays.length < 6) {
    throw new Error("Growth Engine expected growth play coverage.");
  }

  if (!Array.isArray(body.conversionLanes) || body.conversionLanes.length < 4) {
    throw new Error("Growth Engine expected conversion lane coverage.");
  }

  if (!Array.isArray(body.revenueProofLadder) || body.revenueProofLadder.length < 5) {
    throw new Error("Growth Engine expected revenue proof ladder coverage.");
  }

  if (!Array.isArray(body.growthBottlenecks) || body.growthBottlenecks.length < 4) {
    throw new Error("Growth Engine expected bottleneck coverage.");
  }

  if (!body.proofRouteCount || body.proofRouteCount < 15) {
    throw new Error("Growth Engine expected proof-route coverage.");
  }

  if (!body.sourceCounts?.pricingTierCount || body.sourceCounts.pricingTierCount < 6) {
    throw new Error("Growth Engine expected pricing tier source alignment.");
  }

  if (!body.sourceCounts?.capitalRevenueCapabilityCount || body.sourceCounts.capitalRevenueCapabilityCount < 8) {
    throw new Error("Growth Engine expected capital revenue capability source alignment.");
  }

  const brief = await request("/api/growth-engine/brief");
  requireStatus("Growth Engine brief", brief.response.status, 200);
  requireContentType("Growth Engine brief", brief.response, "text/markdown");
  requireGrowthEngineBoundary("Growth Engine brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Commercial Growth Engine Brief")) {
    throw new Error("Growth Engine brief missing heading.");
  }

  if (!brief.body.text.includes("not a revenue guarantee")) {
    throw new Error("Growth Engine brief missing revenue guarantee boundary.");
  }

  if (!brief.body.text.includes("investment advice")) {
    throw new Error("Growth Engine brief missing investment advice boundary.");
  }

  console.log("pass growth engine");
}

async function checkInvestorAudienceReadiness() {
  const result = await request("/api/investor-audience-readiness");
  requireStatus("Investor Audience Readiness", result.response.status, 200);
  requireContentType("Investor Audience Readiness", result.response, "application/json");
  requireInvestorAudienceReadinessBoundary("Investor Audience Readiness", result.response);
  const body = requireJson("Investor Audience Readiness", result.body);

  if (body.service !== "scrimed-investor-audience-readiness") {
    throw new Error(`Investor Audience Readiness expected scrimed-investor-audience-readiness but received ${body.service}.`);
  }

  if (body.status !== "investor-audience-readiness-control-plane-active") {
    throw new Error(`Investor Audience Readiness expected active status but received ${body.status}.`);
  }

  if (body.posture !== "weakness-relief-and-audience-packaging-active-no-securities-offer") {
    throw new Error("Investor Audience Readiness must preserve no-securities posture.");
  }

  if (body.authority?.securitiesAuthority !== "not-securities-offering-material") {
    throw new Error("Investor Audience Readiness must not create securities offering material.");
  }

  if (body.authority?.solicitationAuthority !== "not-solicitation") {
    throw new Error("Investor Audience Readiness must not create solicitation authority.");
  }

  if (body.authority?.investmentAdvice !== "not-investment-advice") {
    throw new Error("Investor Audience Readiness must not create investment advice.");
  }

  if (body.authority?.taxAuthority !== "qualified-review-required") {
    throw new Error("Investor Audience Readiness tax authority must stay qualified-review-required.");
  }

  if (body.authority?.faithBasedAuthority !== "not-endorsement-or-donor-advice") {
    throw new Error("Investor Audience Readiness must not create faith-based endorsement or donor advice.");
  }

  if (!Array.isArray(body.weaknessReliefTracks) || body.weaknessReliefTracks.length < 10) {
    throw new Error("Investor Audience Readiness expected weakness relief coverage.");
  }

  if (!Array.isArray(body.competitiveEdgeSignals) || body.competitiveEdgeSignals.length < 8) {
    throw new Error("Investor Audience Readiness expected competitive edge coverage.");
  }

  if (!Array.isArray(body.investorAudiencePackets) || body.investorAudiencePackets.length < 10) {
    throw new Error("Investor Audience Readiness expected audience packet coverage.");
  }

  if (!body.investorAudiencePackets.some((packet) => packet.audience.includes("Faith-based clinics"))) {
    throw new Error("Investor Audience Readiness expected faith-based clinic packet.");
  }

  if (!body.investorAudiencePackets.some((packet) => packet.audience.includes("Large corporate strategic"))) {
    throw new Error("Investor Audience Readiness expected corporate strategic investor packet.");
  }

  if (!Array.isArray(body.investorReadinessGates) || body.investorReadinessGates.length < 8) {
    throw new Error("Investor Audience Readiness expected readiness gate coverage.");
  }

  if (!body.blockedClaimCount || body.blockedClaimCount < 20) {
    throw new Error("Investor Audience Readiness expected blocked claim coverage.");
  }

  if (body.sourceAlignment?.capitalInvestorMilestoneCount < 8) {
    throw new Error("Investor Audience Readiness expected Capital Vitality source alignment.");
  }

  if (body.sourceAlignment?.growthPlayCount < 6) {
    throw new Error("Investor Audience Readiness expected Growth Engine source alignment.");
  }

  if (
    body.strategicTargetCount !== 4 ||
    body.strategicInvestorOutreach?.externalOutreachSent !== false ||
    body.strategicInvestorOutreach?.investmentOrPartnershipImplied !== false
  ) {
    throw new Error("Investor Audience Readiness expected four unsent, non-implied strategic ecosystem packets.");
  }

  const strategicOrganizations = new Set(
    body.strategicInvestorOutreach?.targets?.map((target) => target.organization) ?? []
  );
  for (const organization of ["OpenAI", "NVIDIA", "Anthropic", "Microsoft"]) {
    if (!strategicOrganizations.has(organization)) {
      throw new Error(`Investor Audience Readiness missing strategic packet for ${organization}.`);
    }
  }

  if (
    body.strategicInvestorOutreach?.pitchSlideCount !== 12 ||
    body.strategicInvestorOutreach?.diligenceItemCount < 8 ||
    body.diligenceReviewRequiredCount < 1
  ) {
    throw new Error("Investor Audience Readiness expected pitch and diligence gap coverage.");
  }

  if (
    body.strategicMeetingPacketCount !== 4 ||
    body.strategicInvestorOutreach?.meetingPreparationReady !== true ||
    body.strategicInvestorOutreach?.externalFundraisingReleaseAuthorized !== false ||
    body.fundingReleaseBlockerCount !== 5
  ) {
    throw new Error("Investor Audience Readiness expected four internal meeting packets and five weakest-link funding release blockers.");
  }

  const openaiPacket = await request(
    "/api/investor-audience-readiness/meeting-packet?target=openai&format=json"
  );
  requireStatus("OpenAI meeting packet", openaiPacket.response.status, 200);
  requireContentType("OpenAI meeting packet", openaiPacket.response, "application/json");
  const openaiPacketBody = requireJson("OpenAI meeting packet", openaiPacket.body);

  if (
    openaiPacketBody.ok !== true ||
    openaiPacketBody.data?.organization !== "OpenAI" ||
    openaiPacketBody.data?.fundingPathStatus !== "no-public-direct-investment-application-verified" ||
    openaiPacketBody.meta?.externalReleaseAuthorized !== false ||
    openaiPacketBody.meta?.relationshipImplied !== false
  ) {
    throw new Error("OpenAI meeting packet must remain internal, source-aligned, and relationship-neutral.");
  }

  if (openaiPacket.response.headers.get("x-scrimed-fundraising-release") !== "not-authorized") {
    throw new Error("OpenAI meeting packet must fail closed for external fundraising release.");
  }

  const openaiMarkdown = await request(
    "/api/investor-audience-readiness/meeting-packet?target=openai&format=markdown"
  );
  requireStatus("OpenAI meeting packet markdown", openaiMarkdown.response.status, 200);
  requireContentType("OpenAI meeting packet markdown", openaiMarkdown.response, "text/markdown");

  if (
    !openaiMarkdown.body.text.includes("SCRIMED OpenAI Meeting Preparation Brief") ||
    !openaiMarkdown.body.text.includes("External release authorized: no")
  ) {
    throw new Error("OpenAI meeting packet markdown missing heading or external-release boundary.");
  }

  const invalidPacket = await request(
    "/api/investor-audience-readiness/meeting-packet?target=unsupported&format=json"
  );
  requireStatus("Invalid strategic meeting target", invalidPacket.response.status, 400);

  const brief = await request("/api/investor-audience-readiness/brief");
  requireStatus("Investor Audience Readiness brief", brief.response.status, 200);
  requireContentType("Investor Audience Readiness brief", brief.response, "text/markdown");
  requireInvestorAudienceReadinessBoundary("Investor Audience Readiness brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Investor and Audience Readiness Brief")) {
    throw new Error("Investor Audience Readiness brief missing heading.");
  }

  if (!brief.body.text.includes("not investment advice")) {
    throw new Error("Investor Audience Readiness brief missing investment advice boundary.");
  }

  if (!brief.body.text.includes("not securities offering material")) {
    throw new Error("Investor Audience Readiness brief missing securities boundary.");
  }

  if (!brief.body.text.includes("faith-based endorsement")) {
    throw new Error("Investor Audience Readiness brief missing faith-based boundary.");
  }

  console.log("pass investor audience readiness");
}

async function checkLaunchReadiness() {
  const result = await request("/api/launch-readiness");
  requireStatus("Launch Readiness", result.response.status, 200);
  requireContentType("Launch Readiness", result.response, "application/json");
  requireLaunchReadinessBoundary("Launch Readiness", result.response);
  const body = requireJson("Launch Readiness", result.body);

  if (body.service !== "scrimed-launch-readiness") {
    throw new Error(`Launch Readiness expected scrimed-launch-readiness but received ${body.service}.`);
  }

  if (body.status !== "launch-readiness-control-plane-active") {
    throw new Error(`Launch Readiness expected active status but received ${body.status}.`);
  }

  if (body.posture !== "strict-primary-domain-launch-gate-with-contained-sandbox-dns-workaround") {
    throw new Error("Launch Readiness must preserve strict primary-domain and contained DNS workaround posture.");
  }

  if (body.authority?.sandboxBypassAuthority !== "not-authorized") {
    throw new Error("Launch Readiness must not create sandbox bypass authority.");
  }

  if (body.authority?.fallbackAuthority !== "continuity-only-not-launch-approval") {
    throw new Error("Launch Readiness fallback authority must remain continuity-only.");
  }

  if (body.authority?.launchApprovalAuthority !== "human-launch-review-required") {
    throw new Error("Launch Readiness must require human launch review.");
  }

  if (body.authority?.slaAuthority !== "not-contractual-sla") {
    throw new Error("Launch Readiness must not create contractual SLA authority.");
  }

  if (!Array.isArray(body.launchReadinessTracks) || body.launchReadinessTracks.length < 10) {
    throw new Error("Launch Readiness expected launch track coverage.");
  }

  if (!Array.isArray(body.launchDnsControls) || body.launchDnsControls.length < 3) {
    throw new Error("Launch Readiness expected DNS control coverage.");
  }

  if (!body.launchDnsControls.some((control) => control.issue.includes("ENOTFOUND"))) {
    throw new Error("Launch Readiness expected sandbox ENOTFOUND DNS control.");
  }

  if (!body.launchDnsControls.some((control) => control.launchRule.includes("Fallback success is not sufficient"))) {
    throw new Error("Launch Readiness expected fallback-only launch boundary.");
  }

  if (!Array.isArray(body.launchServicePaths) || body.launchServicePaths.length < 5) {
    throw new Error("Launch Readiness expected service path coverage.");
  }

  if (!Array.isArray(body.launchRisks) || body.launchRisks.length < 5) {
    throw new Error("Launch Readiness expected launch risk coverage.");
  }

  if (!body.hardStopCount || body.hardStopCount < 10) {
    throw new Error("Launch Readiness expected hard-stop coverage.");
  }

  if (body.sourceAlignment?.navigationPageRouteCount < 117) {
    throw new Error("Launch Readiness expected Navigation Audit source alignment.");
  }

  if (body.sourceAlignment?.productOfferCount < 10) {
    throw new Error("Launch Readiness expected Product and Services Portfolio source alignment.");
  }

  const brief = await request("/api/launch-readiness/brief");
  requireStatus("Launch Readiness brief", brief.response.status, 200);
  requireContentType("Launch Readiness brief", brief.response, "text/markdown");
  requireLaunchReadinessBoundary("Launch Readiness brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Launch Readiness Brief")) {
    throw new Error("Launch Readiness brief missing heading.");
  }

  if (!brief.body.text.includes("Fallback success is continuity evidence only")) {
    throw new Error("Launch Readiness brief missing fallback-only boundary.");
  }

  if (!brief.body.text.includes("sandbox DNS")) {
    throw new Error("Launch Readiness brief missing sandbox DNS language.");
  }

  if (!brief.body.text.includes("branded domain")) {
    throw new Error("Launch Readiness brief missing branded-domain gate.");
  }

  console.log("pass launch readiness");
}

async function checkEnterpriseBusinessOps() {
  const result = await request("/api/enterprise-business-ops");
  requireStatus("Enterprise Business Ops", result.response.status, 200);
  requireContentType("Enterprise Business Ops", result.response, "application/json");
  requireEnterpriseBusinessOpsBoundary("Enterprise Business Ops", result.response);
  const body = requireJson("Enterprise Business Ops", result.body);

  if (body.service !== "scrimed-enterprise-business-operations") {
    throw new Error(`Enterprise Business Ops expected scrimed-enterprise-business-operations but received ${body.service}.`);
  }

  if (body.status !== "enterprise-business-ops-revenue-margin-control-plane-active") {
    throw new Error(`Enterprise Business Ops expected active status but received ${body.status}.`);
  }

  if (body.authority?.legalAuthority !== "qualified-counsel-review-required") {
    throw new Error("Enterprise Business Ops must require qualified counsel review.");
  }

  if (body.authority?.accountingAuthority !== "qualified-accounting-review-required") {
    throw new Error("Enterprise Business Ops must require qualified accounting review.");
  }

  if (body.authority?.taxAuthority !== "qualified-tax-review-required") {
    throw new Error("Enterprise Business Ops must require qualified tax review.");
  }

  if (body.authority?.profitAuthority !== "not-profit-margin-guarantee") {
    throw new Error("Enterprise Business Ops must not create profit-margin guarantees.");
  }

  if (body.authority?.contractAuthority !== "human-executive-approval-required") {
    throw new Error("Enterprise Business Ops must require human executive contract approval.");
  }

  if (!Array.isArray(body.sources) || body.sources.length < 6) {
    throw new Error("Enterprise Business Ops expected source coverage.");
  }

  if (!body.officialSourceCount || body.officialSourceCount < 4) {
    throw new Error("Enterprise Business Ops expected official source coverage.");
  }

  if (!Array.isArray(body.revenueCapabilities) || body.revenueCapabilities.length < 8) {
    throw new Error("Enterprise Business Ops expected revenue capability coverage.");
  }

  if (!Array.isArray(body.marginControls) || body.marginControls.length < 8) {
    throw new Error("Enterprise Business Ops expected margin control coverage.");
  }

  if (!Array.isArray(body.teamRoles) || body.teamRoles.length < 8) {
    throw new Error("Enterprise Business Ops expected team role coverage.");
  }

  if (!Array.isArray(body.enterpriseControls) || body.enterpriseControls.length < 8) {
    throw new Error("Enterprise Business Ops expected enterprise control coverage.");
  }

  if (!Array.isArray(body.operatingCadences) || body.operatingCadences.length < 6) {
    throw new Error("Enterprise Business Ops expected operating cadence coverage.");
  }

  if (!Array.isArray(body.profitLevers) || body.profitLevers.length < 8) {
    throw new Error("Enterprise Business Ops expected profit lever coverage.");
  }

  if (!Array.isArray(body.blockedClaims) || !body.blockedClaims.includes("guaranteed profit margin")) {
    throw new Error("Enterprise Business Ops expected guaranteed profit margin to remain blocked.");
  }

  if (!body.blockedClaims.includes("audited financial statements")) {
    throw new Error("Enterprise Business Ops expected audited financial statements to remain blocked.");
  }

  if (!body.blockedClaims.includes("legal approval without counsel")) {
    throw new Error("Enterprise Business Ops expected legal approval without counsel to remain blocked.");
  }

  if (!body.boundary?.includes("not legal advice")) {
    throw new Error("Enterprise Business Ops boundary must include no legal advice.");
  }

  if (!body.boundary?.includes("profit-margin guarantee")) {
    throw new Error("Enterprise Business Ops boundary must include no profit-margin guarantee.");
  }

  const brief = await request("/api/enterprise-business-ops/brief");
  requireStatus("Enterprise Business Ops brief", brief.response.status, 200);
  requireContentType("Enterprise Business Ops brief", brief.response, "text/markdown");
  requireEnterpriseBusinessOpsBoundary("Enterprise Business Ops brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Enterprise Business Operations Brief")) {
    throw new Error("Enterprise Business Ops brief missing heading.");
  }

  if (!brief.body.text.includes("not legal, accounting, tax, investment, securities, valuation, revenue, or profit-margin advice")) {
    throw new Error("Enterprise Business Ops brief missing advice boundary.");
  }

  console.log("pass enterprise business ops");
}

async function checkEnterpriseScalabilityOperations() {
  const result = await request("/api/enterprise-scalability");
  requireStatus("Enterprise Scalability", result.response.status, 200);
  requireContentType("Enterprise Scalability", result.response, "application/json");
  requireEnterpriseScalabilityBoundary("Enterprise Scalability", result.response);
  const body = requireJson("Enterprise Scalability", result.body);

  if (body.service !== "scrimed-enterprise-scalability-operations") {
    throw new Error(`Enterprise Scalability expected scrimed-enterprise-scalability-operations but received ${body.service}.`);
  }

  if (body.status !== "enterprise-scalability-operations-control-plane-active") {
    throw new Error(`Enterprise Scalability expected active status but received ${body.status}.`);
  }

  if (body.authority?.slaAuthority !== "not-contractual-sla") {
    throw new Error("Enterprise Scalability must not create contractual SLA authority.");
  }

  if (body.authority?.managedServiceAuthority !== "not-managed-service-commitment") {
    throw new Error("Enterprise Scalability must not create managed service commitments.");
  }

  if (body.authority?.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Enterprise Scalability must keep PHI authority blocked.");
  }

  if (body.authority?.connectorAuthority !== "not-production-connector-approved") {
    throw new Error("Enterprise Scalability must keep production connector authority blocked.");
  }

  if (!Array.isArray(body.domains) || body.domains.length < 8) {
    throw new Error("Enterprise Scalability expected scale domain coverage.");
  }

  if (!Array.isArray(body.controls) || body.controls.length < 10) {
    throw new Error("Enterprise Scalability expected operating control coverage.");
  }

  if (!Array.isArray(body.workstreams) || body.workstreams.length < 6) {
    throw new Error("Enterprise Scalability expected workstream coverage.");
  }

  if (!Array.isArray(body.cadences) || body.cadences.length < 6) {
    throw new Error("Enterprise Scalability expected cadence coverage.");
  }

  if (!Array.isArray(body.bottlenecks) || body.bottlenecks.length < 6) {
    throw new Error("Enterprise Scalability expected bottleneck coverage.");
  }

  if (!Array.isArray(body.blockedClaims) || !body.blockedClaims.includes("contractual SLA approved")) {
    throw new Error("Enterprise Scalability expected contractual SLA approval to remain blocked.");
  }

  if (!body.blockedClaims.includes("managed service commitment active")) {
    throw new Error("Enterprise Scalability expected managed service commitment to remain blocked.");
  }

  if (!body.blockedClaims.includes("PHI processing authorized")) {
    throw new Error("Enterprise Scalability expected PHI processing to remain blocked.");
  }

  if (!body.boundary?.includes("not a contractual SLA")) {
    throw new Error("Enterprise Scalability boundary must include no contractual SLA.");
  }

  if (!body.boundary?.includes("not a profit guarantee") && !body.boundary?.includes("profit-margin guarantee")) {
    throw new Error("Enterprise Scalability boundary must include no profit guarantee.");
  }

  const brief = await request("/api/enterprise-scalability/brief");
  requireStatus("Enterprise Scalability brief", brief.response.status, 200);
  requireContentType("Enterprise Scalability brief", brief.response, "text/markdown");
  requireEnterpriseScalabilityBoundary("Enterprise Scalability brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Enterprise Scalability Operations Brief")) {
    throw new Error("Enterprise Scalability brief missing heading.");
  }

  if (!brief.body.text.includes("not a contractual SLA")) {
    throw new Error("Enterprise Scalability brief missing SLA boundary.");
  }

  if (!brief.body.text.includes("Managed service authority")) {
    throw new Error("Enterprise Scalability brief missing managed service authority.");
  }

  console.log("pass enterprise scalability operations");
}

async function checkPlatformPowerOperations() {
  const result = await request("/api/platform-power");
  requireStatus("Platform Power", result.response.status, 200);
  requireContentType("Platform Power", result.response, "application/json");
  requirePlatformPowerBoundary("Platform Power", result.response);
  const body = requireJson("Platform Power", result.body);

  if (body.service !== "scrimed-api-ui-ai-platform-power") {
    throw new Error(`Platform Power expected scrimed-api-ui-ai-platform-power but received ${body.service}.`);
  }

  if (body.status !== "api-ui-ai-platform-power-control-plane-active") {
    throw new Error(`Platform Power expected active status but received ${body.status}.`);
  }

  if (body.authority?.apiAuthority !== "contract-readiness-not-public-api-sla") {
    throw new Error("Platform Power must not create public API SLA authority.");
  }

  if (body.authority?.aiAuthority !== "no-live-autonomous-ai-authority") {
    throw new Error("Platform Power must not create live autonomous AI authority.");
  }

  if (body.authority?.modelAuthority !== "not-production-model-routing-approved") {
    throw new Error("Platform Power must not approve production model routing.");
  }

  if (body.authority?.agentAuthority !== "human-approval-required-for-protected-actions") {
    throw new Error("Platform Power must require human approval for protected actions.");
  }

  if (body.authority?.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Platform Power must keep PHI authority blocked.");
  }

  if (body.authority?.trillionScaleAuthority !== "aspirational-design-not-scale-equivalence") {
    throw new Error("Platform Power must not claim trillion-scale equivalence.");
  }

  if (!Array.isArray(body.pillars) || body.pillars.length < 9) {
    throw new Error("Platform Power expected pillar coverage.");
  }

  if (!Array.isArray(body.controls) || body.controls.length < 12) {
    throw new Error("Platform Power expected control coverage.");
  }

  if (!Array.isArray(body.workstreams) || body.workstreams.length < 7) {
    throw new Error("Platform Power expected workstream coverage.");
  }

  if (!Array.isArray(body.cadences) || body.cadences.length < 6) {
    throw new Error("Platform Power expected cadence coverage.");
  }

  if (!Array.isArray(body.bottlenecks) || body.bottlenecks.length < 7) {
    throw new Error("Platform Power expected bottleneck coverage.");
  }

  if (!Array.isArray(body.blockedClaims) || !body.blockedClaims.includes("trillion-dollar company parity guaranteed")) {
    throw new Error("Platform Power expected trillion-dollar parity claim to remain blocked.");
  }

  if (!body.blockedClaims.includes("public API SLA approved")) {
    throw new Error("Platform Power expected public API SLA to remain blocked.");
  }

  if (!body.blockedClaims.includes("live autonomous AI approved")) {
    throw new Error("Platform Power expected live autonomous AI to remain blocked.");
  }

  if (!body.blockedClaims.includes("PHI processing authorized")) {
    throw new Error("Platform Power expected PHI processing to remain blocked.");
  }

  if (!body.boundary?.includes("not a public API SLA")) {
    throw new Error("Platform Power boundary must include no public API SLA.");
  }

  if (!body.boundary?.includes("not proof that SCRIMED has trillion-dollar-company-equivalent capacity")) {
    throw new Error("Platform Power boundary must include no trillion-scale proof claim.");
  }

  const brief = await request("/api/platform-power/brief");
  requireStatus("Platform Power brief", brief.response.status, 200);
  requireContentType("Platform Power brief", brief.response, "text/markdown");
  requirePlatformPowerBoundary("Platform Power brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Platform Power Operations Brief")) {
    throw new Error("Platform Power brief missing heading.");
  }

  if (!brief.body.text.includes("AI authority")) {
    throw new Error("Platform Power brief missing AI authority.");
  }

  if (!brief.body.text.includes("Trillion-scale authority")) {
    throw new Error("Platform Power brief missing trillion-scale authority.");
  }

  console.log("pass platform power operations");
}

async function checkProductionArchitecture() {
  const result = await request("/api/production-architecture");
  requireStatus("Production Architecture", result.response.status, 200);
  requireContentType("Production Architecture", result.response, "application/json");
  requireProductionArchitectureBoundary("Production Architecture", result.response);
  const body = requireJson("Production Architecture", result.body);

  if (body.service !== "scrimed-production-architecture") {
    throw new Error(`Production Architecture expected scrimed-production-architecture but received ${body.service}.`);
  }

  if (body.status !== "production-architecture-contract-active") {
    throw new Error(`Production Architecture expected active status but received ${body.status}.`);
  }

  if (body.validation?.status !== "pass") {
    throw new Error("Production Architecture expected validation status pass.");
  }

  if (!body.readinessAssessment?.includes("NO-GO for live clinical production")) {
    throw new Error("Production Architecture expected explicit live clinical production NO-GO assessment.");
  }

  if (!Array.isArray(body.layers) || body.layers.length < 7) {
    throw new Error("Production Architecture expected seven architecture layers.");
  }

  const requiredLayers = [
    "agent-runtime",
    "context-engine",
    "trust-engine-v2",
    "model-router",
    "evaluation-engine",
    "clinsecops-compliance",
    "workflow-engine"
  ];

  for (const layer of requiredLayers) {
    if (!body.layers.some((item) => item.id === layer)) {
      throw new Error(`Production Architecture missing layer ${layer}.`);
    }
  }

  if (!Array.isArray(body.contextDomains) || body.contextDomains.length < 6) {
    throw new Error("Production Architecture expected context domain coverage.");
  }

  if (!body.contextDomains.every((domain) => Array.isArray(domain.deniedInputs) && domain.deniedInputs.length >= 3 && domain.phiSafeHandling)) {
    throw new Error("Production Architecture expected every context domain to deny unsafe inputs and retain PHI-safe handling.");
  }

  const expectedProviders = [
    "OpenAI",
    "Claude",
    "Gemini",
    "Llama",
    "Mistral",
    "Qwen",
    "Z.ai GLM",
    "DeepSeek",
    "Future models"
  ];

  if (!Array.isArray(body.modelProviderMesh) || body.modelProviderMesh.length < expectedProviders.length) {
    throw new Error("Production Architecture expected model provider mesh coverage.");
  }

  for (const provider of expectedProviders) {
    if (!body.modelProviderMesh.some((item) => item.name === provider)) {
      throw new Error(`Production Architecture missing provider ${provider}.`);
    }
  }

  if (!body.modelProviderMesh.every((provider) => provider.blockedUses?.includes("production PHI routing"))) {
    throw new Error("Production Architecture expected production PHI routing to remain blocked for every provider.");
  }

  if (!Array.isArray(body.evaluationScenarios) || body.evaluationScenarios.length < 7) {
    throw new Error("Production Architecture expected evaluation scenario coverage.");
  }

  if (!body.evaluationScenarios.some((scenario) => scenario.category === "adversarial")) {
    throw new Error("Production Architecture expected adversarial evaluation coverage.");
  }

  if (!body.evaluationScenarios.some((scenario) => scenario.category === "missing-data")) {
    throw new Error("Production Architecture expected missing-data evaluation coverage.");
  }

  if (!Array.isArray(body.clinSecOpsControls) || body.clinSecOpsControls.length < 6) {
    throw new Error("Production Architecture expected ClinSecOps control coverage.");
  }

  if (!Array.isArray(body.workflowEngineTracks) || body.workflowEngineTracks.length < 5) {
    throw new Error("Production Architecture expected deterministic workflow coverage.");
  }

  if (!body.workflowEngineTracks.every((track) => Array.isArray(track.humanApprovalRequiredFor) && track.humanApprovalRequiredFor.length >= 3 && track.rollbackFallback)) {
    throw new Error("Production Architecture expected human approval and rollback/fallback on every workflow track.");
  }

  if (!body.hardStops?.includes("No PHI processing authority")) {
    throw new Error("Production Architecture expected no-PHI hard stop.");
  }

  if (!body.hardStops?.some((stop) => stop.includes("No production model routing"))) {
    throw new Error("Production Architecture expected production model routing hard stop.");
  }

  const brief = await request("/api/production-architecture/brief");
  requireStatus("Production Architecture brief", brief.response.status, 200);
  requireContentType("Production Architecture brief", brief.response, "text/markdown");
  requireProductionArchitectureBoundary("Production Architecture brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Production Architecture Brief")) {
    throw new Error("Production Architecture brief missing heading.");
  }

  if (!brief.body.text.includes("Intelligence Layer Provider Mesh")) {
    throw new Error("Production Architecture brief missing provider mesh section.");
  }

  if (!brief.body.text.includes("NO-GO for live clinical production")) {
    throw new Error("Production Architecture brief missing NO-GO assessment.");
  }

  console.log("pass production architecture");
}

async function checkExecutionAttemptEnvelope() {
  const result = await request("/api/workflows/execution-attempts/envelope");
  requireStatus("Execution Attempt Envelope", result.response.status, 200);
  requireContentType("Execution Attempt Envelope", result.response, "application/json");
  requireExecutionAttemptEnvelopeBoundary("Execution Attempt Envelope", result.response);
  const body = requireJson("Execution Attempt Envelope", result.body);

  if (body.service !== "scrimed-execution-attempt-envelope") {
    throw new Error(`Execution Attempt Envelope expected scrimed-execution-attempt-envelope but received ${body.service}.`);
  }

  if (body.status !== "execution-attempt-envelope-active-no-phi") {
    throw new Error(`Execution Attempt Envelope expected active status but received ${body.status}.`);
  }

  if (!body.readinessAssessment?.includes("NO-GO for live clinical production")) {
    throw new Error("Execution Attempt Envelope expected explicit live clinical production NO-GO assessment.");
  }

  if (!Array.isArray(body.envelopes) || body.envelopes.length < 4) {
    throw new Error("Execution Attempt Envelope expected synthetic envelope coverage.");
  }

  if (body.replayReadyCount !== body.envelopeCount) {
    throw new Error("Execution Attempt Envelope expected every envelope to be replay-ready.");
  }

  if (body.modelRouteTelemetryCount !== body.envelopeCount) {
    throw new Error("Execution Attempt Envelope expected model-route telemetry for every envelope.");
  }

  if (body.humanReviewGateCount !== body.envelopeCount) {
    throw new Error("Execution Attempt Envelope expected human review gate for every envelope.");
  }

  if (!body.envelopes.every((envelope) => envelope.idempotencyKey?.startsWith("idem_") && envelope.replayMetadata?.replayToken?.startsWith("replay_"))) {
    throw new Error("Execution Attempt Envelope expected idempotency and replay metadata on every envelope.");
  }

  if (!body.envelopes.every((envelope) => envelope.modelRouteTelemetry?.telemetryBoundary === "telemetry-only-not-production-routing")) {
    throw new Error("Execution Attempt Envelope expected telemetry-only model route boundary.");
  }

  if (!body.envelopes.every((envelope) => envelope.humanApprovalGate?.required)) {
    throw new Error("Execution Attempt Envelope expected required human approval gates.");
  }

  if (!body.envelopes.every((envelope) => envelope.deniedCapabilities?.includes("patient outreach") && envelope.deniedCapabilities?.includes("payer submission") && envelope.deniedCapabilities?.includes("EHR writeback"))) {
    throw new Error("Execution Attempt Envelope expected protected capabilities to remain denied.");
  }

  if (!Array.isArray(body.scorecards) || body.scorecards.length < 8) {
    throw new Error("Execution Attempt Envelope expected no-PHI scorecard coverage.");
  }

  if (!body.scorecards.every((scorecard) => scorecard.status === "pass" && scorecard.requiredHumanReview)) {
    throw new Error("Execution Attempt Envelope expected passing scorecards with required human review.");
  }

  if (body.releaseDecision !== "pass-for-synthetic-contract") {
    throw new Error("Execution Attempt Envelope expected pass-for-synthetic-contract release decision.");
  }

  if (!body.hardStops?.some((stop) => stop.includes("No live patient data"))) {
    throw new Error("Execution Attempt Envelope expected no-live-patient-data hard stop.");
  }

  const brief = await request("/api/workflows/execution-attempts/envelope/brief");
  requireStatus("Execution Attempt Envelope brief", brief.response.status, 200);
  requireContentType("Execution Attempt Envelope brief", brief.response, "text/markdown");
  requireExecutionAttemptEnvelopeBoundary("Execution Attempt Envelope brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Execution Attempt Envelope Brief")) {
    throw new Error("Execution Attempt Envelope brief missing heading.");
  }

  if (!brief.body.text.includes("replay metadata")) {
    throw new Error("Execution Attempt Envelope brief missing replay metadata.");
  }

  if (!brief.body.text.includes("No-PHI Scorecards")) {
    throw new Error("Execution Attempt Envelope brief missing no-PHI scorecards section.");
  }

  console.log("pass execution attempt envelope");
}

async function checkExecutionAttemptDurableStore() {
  const result = await request("/api/workflows/execution-attempts/durable-store");
  requireStatus("Execution Attempt Durable Store", result.response.status, 200);
  requireContentType("Execution Attempt Durable Store", result.response, "application/json");
  requireExecutionAttemptDurableStoreBoundary("Execution Attempt Durable Store", result.response);
  const body = requireJson("Execution Attempt Durable Store", result.body);

  if (body.service !== "scrimed-execution-attempt-durable-store") {
    throw new Error(`Execution Attempt Durable Store expected service scrimed-execution-attempt-durable-store but received ${body.service}.`);
  }

  if (body.status !== "execution-attempt-durable-store-contract-active-no-phi") {
    throw new Error(`Execution Attempt Durable Store expected active contract status but received ${body.status}.`);
  }

  if (!body.readinessAssessment?.includes("NO-GO for live clinical production")) {
    throw new Error("Execution Attempt Durable Store expected explicit live clinical production NO-GO assessment.");
  }

  if (body.validation?.status !== "pass") {
    throw new Error("Execution Attempt Durable Store expected passing contract validation.");
  }

  if (!Array.isArray(body.validation?.checks) || body.validation.checks.length < 8) {
    throw new Error("Execution Attempt Durable Store expected validation check coverage.");
  }

  if (!body.validation.checks.every((check) => check.passed)) {
    throw new Error("Execution Attempt Durable Store expected every validation check to pass.");
  }

  if (!Array.isArray(body.clinicalAIOperatingSystemFoundation) || body.clinicalAIOperatingSystemFoundation.length < 16) {
    throw new Error("Execution Attempt Durable Store expected healthcare AI OS priority coverage.");
  }

  const priorityNames = body.clinicalAIOperatingSystemFoundation.map((item) => item.priority);

  for (const requiredPriority of ["Clinical Robustness Lab", "Enterprise MCP Gateway", "Dynamic Model Routing", "Live Steering Engine", "Security and Compliance", "Observability"]) {
    if (!priorityNames.includes(requiredPriority)) {
      throw new Error(`Execution Attempt Durable Store missing ${requiredPriority} priority coverage.`);
    }
  }

  if (!body.architecture?.systemArchitecture || !body.architecture?.threatModel || !body.architecture?.rolloutPlan) {
    throw new Error("Execution Attempt Durable Store expected architecture, threat model, and rollout plan.");
  }

  if (!Array.isArray(body.sampleRecordableAttempts) || body.sampleRecordableAttempts.length < 4) {
    throw new Error("Execution Attempt Durable Store expected sample recordable attempts.");
  }

  if (!body.sampleRecordableAttempts.every((attempt) => attempt.idempotencyKey?.startsWith("idem_") && attempt.replayToken?.startsWith("replay_"))) {
    throw new Error("Execution Attempt Durable Store expected idempotency and replay metadata on every sample attempt.");
  }

  if (!body.hardStops?.some((stop) => stop.includes("No live patient data"))) {
    throw new Error("Execution Attempt Durable Store expected no-live-patient-data hard stop.");
  }

  const brief = await request("/api/workflows/execution-attempts/durable-store/brief");
  requireStatus("Execution Attempt Durable Store brief", brief.response.status, 200);
  requireContentType("Execution Attempt Durable Store brief", brief.response, "text/markdown");
  requireExecutionAttemptDurableStoreBoundary("Execution Attempt Durable Store brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Execution Attempt Durable Store Brief")) {
    throw new Error("Execution Attempt Durable Store brief missing heading.");
  }

  if (!brief.body.text.includes("Healthcare AI OS Foundation")) {
    throw new Error("Execution Attempt Durable Store brief missing healthcare AI OS section.");
  }

  if (!brief.body.text.includes("Protected review disposition")) {
    throw new Error("Execution Attempt Durable Store brief missing protected review disposition route.");
  }

  const sample = body.sampleRecordableAttempts[0];
  const record = await postJson("/api/workflows/execution-attempts/durable-store/record", {
    workspaceSlug,
    attemptId: sample.attemptId,
    region: "us"
  });
  requireStatus("Execution Attempt Durable Store protected record fail-closed", record.response.status, [401, 403, 503]);
  requireExecutionAttemptDurableStoreBoundary("Execution Attempt Durable Store protected record fail-closed", record.response);

  const replay = await postJson("/api/workflows/execution-attempts/durable-store/replay", {
    workspaceSlug,
    idempotencyKey: sample.idempotencyKey
  });
  requireStatus("Execution Attempt Durable Store protected replay fail-closed", replay.response.status, [401, 403, 503]);
  requireExecutionAttemptDurableStoreBoundary("Execution Attempt Durable Store protected replay fail-closed", replay.response);

  const review = await postJson("/api/workflows/execution-attempts/durable-store/review-disposition", {
    workspaceSlug,
    attemptId: sample.attemptId,
    disposition: "escalated",
    reviewerRole: "clinical governance",
    reasonCode: "public-smoke-fail-closed",
    reviewNote: "Public smoke confirms the protected review disposition route fails closed without a bearer token.",
    humanReviewAttestation: "no-phi-human-review-no-clinical-authority"
  });
  requireStatus("Execution Attempt Durable Store protected review fail-closed", review.response.status, [401, 403, 503]);
  requireExecutionAttemptDurableStoreBoundary("Execution Attempt Durable Store protected review fail-closed", review.response);

  console.log("pass execution attempt durable store");
}

async function checkLimitationsWorkaroundOperations() {
  const result = await request("/api/limitations-workarounds");
  requireStatus("Limitations Workarounds", result.response.status, 200);
  requireContentType("Limitations Workarounds", result.response, "application/json");
  requireLimitationsWorkaroundBoundary("Limitations Workarounds", result.response);
  const body = requireJson("Limitations Workarounds", result.body);

  if (body.service !== "scrimed-limitations-workaround-operations") {
    throw new Error(`Limitations Workarounds expected scrimed-limitations-workaround-operations but received ${body.service}.`);
  }

  if (body.status !== "limitations-workaround-control-plane-active") {
    throw new Error(`Limitations Workarounds expected active status but received ${body.status}.`);
  }

  if (body.authority?.limitationAuthority !== "workaround-control-only") {
    throw new Error("Limitations Workarounds must remain workaround control only.");
  }

  if (body.authority?.phiAuthority !== "not-authorized-production-phi") {
    throw new Error("Limitations Workarounds must keep PHI authority blocked.");
  }

  if (body.authority?.clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error("Limitations Workarounds must keep live care blocked.");
  }

  if (body.authority?.releaseAuthority !== "not-release-approval") {
    throw new Error("Limitations Workarounds must not create release authority.");
  }

  if (body.authority?.quantumAuthority !== "internal-research-only-no-public-claim") {
    throw new Error("Limitations Workarounds must keep quantum internal-only.");
  }

  if (!Array.isArray(body.tracks) || body.tracks.length < 10) {
    throw new Error("Limitations Workarounds expected track coverage.");
  }

  if (!Array.isArray(body.packets) || body.packets.length < 8) {
    throw new Error("Limitations Workarounds expected packet coverage.");
  }

  if (!Array.isArray(body.boundaryEscalations) || body.boundaryEscalations.length < 8) {
    throw new Error("Limitations Workarounds expected boundary escalation matrix coverage.");
  }

  if (!Array.isArray(body.cadences) || body.cadences.length < 6) {
    throw new Error("Limitations Workarounds expected cadence coverage.");
  }

  if (!Array.isArray(body.metrics) || body.metrics.length < 4) {
    throw new Error("Limitations Workarounds expected metric coverage.");
  }

  if (!Array.isArray(body.executionLedger) || body.executionLedger.length < 5) {
    throw new Error("Limitations Workarounds expected recent no-secret execution ledger coverage.");
  }

  if (!body.executionLedger.some((entry) => entry.slug === "strict-aal2-durable-store-smoke-passed")) {
    throw new Error("Limitations Workarounds expected strict AAL2 durable-store smoke ledger entry.");
  }

  if (!body.blockedClaims?.includes("PHI processing authorized")) {
    throw new Error("Limitations Workarounds expected PHI blocked claim.");
  }

  if (!body.blockedClaims?.includes("public API SLA approved")) {
    throw new Error("Limitations Workarounds expected public API SLA blocked claim.");
  }

  if (!body.blockedClaims?.includes("public quantum capability available")) {
    throw new Error("Limitations Workarounds expected public quantum blocked claim.");
  }

  if (!body.tracks.some((track) => track.slug === "phi-live-data-boundary")) {
    throw new Error("Limitations Workarounds expected PHI live-data track.");
  }

  if (!body.packets.some((packet) => packet.slug === "aal2-protected-proof")) {
    throw new Error("Limitations Workarounds expected AAL2 protected proof packet.");
  }

  if (!body.boundaryEscalations.some((escalation) => escalation.slug === "phi-live-data-escalation")) {
    throw new Error("Limitations Workarounds expected PHI live-data escalation.");
  }

  if (!body.boundaryEscalations.some((escalation) => escalation.slug === "autonomous-agent-action-escalation")) {
    throw new Error("Limitations Workarounds expected autonomous agent action escalation.");
  }

  if (!body.boundaryEscalations.every((escalation) => escalation.safeResponse && escalation.decisionSla)) {
    throw new Error("Limitations Workarounds expected each escalation to include safe response and decision SLA.");
  }

  if (!body.boundary?.includes("does not authorize PHI processing")) {
    throw new Error("Limitations Workarounds boundary must include no PHI authority.");
  }

  const brief = await request("/api/limitations-workarounds/brief");
  requireStatus("Limitations Workarounds brief", brief.response.status, 200);
  requireContentType("Limitations Workarounds brief", brief.response, "text/markdown");
  requireLimitationsWorkaroundBoundary("Limitations Workarounds brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Limitations and Workaround Operations Brief")) {
    throw new Error("Limitations Workarounds brief missing heading.");
  }

  if (!brief.body.text.includes("not PHI processing authority")) {
    throw new Error("Limitations Workarounds brief missing PHI authority boundary.");
  }

  if (!brief.body.text.includes("Workaround Packets")) {
    throw new Error("Limitations Workarounds brief missing packets section.");
  }

  if (!brief.body.text.includes("Boundary Escalation Matrix")) {
    throw new Error("Limitations Workarounds brief missing boundary escalation matrix.");
  }

  if (!brief.body.text.includes("Recent Workaround Execution Ledger")) {
    throw new Error("Limitations Workarounds brief missing recent workaround execution ledger.");
  }

  console.log("pass limitations workaround operations");
}

async function checkClinicalAuthorityReadiness() {
  const result = await request("/api/clinical-authority-readiness");
  requireStatus("Clinical Authority Readiness", result.response.status, 200);
  requireContentType("Clinical Authority Readiness", result.response, "application/json");
  requireClinicalAuthorityBoundary("Clinical Authority Readiness", result.response);
  const body = requireJson("Clinical Authority Readiness", result.body);

  if (body.service !== "scrimed-clinical-authority-readiness") {
    throw new Error(`Clinical Authority Readiness expected scrimed-clinical-authority-readiness but received ${body.service}.`);
  }

  if (body.status !== "clinical-authority-readiness-hard-gates-contained") {
    throw new Error(`Clinical Authority Readiness expected hard-gates-contained status but received ${body.status}.`);
  }

  if (body.authorizationStatus !== "not-authorized-live-clinical-care") {
    throw new Error("Clinical Authority Readiness must remain not authorized for live clinical care.");
  }

  if (body.phiStatus !== "not-authorized-production-phi-processing") {
    throw new Error("Clinical Authority Readiness must remain not authorized for production PHI processing.");
  }

  if (body.reimbursementStatus !== "no-reimbursement-guarantee") {
    throw new Error("Clinical Authority Readiness must preserve no reimbursement guarantee.");
  }

  if (body.securityCertificationStatus !== "not-security-certified") {
    throw new Error("Clinical Authority Readiness must preserve not-security-certified posture.");
  }

  if (!Array.isArray(body.domains) || body.domains.length < 8) {
    throw new Error("Clinical Authority Readiness expected at least eight authority domains.");
  }

  if (!Array.isArray(body.boundaryResolutions) || body.boundaryResolutions.length < 7) {
    throw new Error("Clinical Authority Readiness expected boundary resolutions.");
  }

  if (!body.boundaryResolutions.every((resolution) => resolution.status === "contained-with-workaround")) {
    throw new Error("Clinical Authority Readiness expected all boundary resolutions contained with workarounds.");
  }

  if (!Array.isArray(body.sourceReferences) || body.sourceReferences.length < 6) {
    throw new Error("Clinical Authority Readiness expected source references.");
  }

  const brief = await request("/api/clinical-authority-readiness/brief");
  requireStatus("Clinical Authority Readiness brief", brief.response.status, 200);
  requireContentType("Clinical Authority Readiness brief", brief.response, "text/markdown");
  requireClinicalAuthorityBoundary("Clinical Authority Readiness brief", brief.response);

  if (!brief.body.text.includes("SCRIMED Clinical Authority Readiness Brief")) {
    throw new Error("Clinical Authority Readiness brief missing heading.");
  }

  if (!brief.body.text.includes("not legal advice")) {
    throw new Error("Clinical Authority Readiness brief missing legal boundary.");
  }

  if (!brief.body.text.includes("not live clinical authorization")) {
    throw new Error("Clinical Authority Readiness brief missing clinical authority boundary.");
  }

  console.log("pass clinical authority readiness");
}

async function checkScrimedSecurityDiligenceEvidencePacket() {
  const result = await request("/api/scrimed-cyber-defense/evidence-packet");
  requireStatus("SCRIMED Security Diligence Evidence Packet", result.response.status, 200);
  requireContentType("SCRIMED Security Diligence Evidence Packet", result.response, "application/json");

  const boundary = result.response.headers.get("x-scrimed-data-boundary");
  if (boundary !== "synthetic-security-evidence-metadata-only") {
    throw new Error(
      `SCRIMED Security Diligence Evidence Packet expected synthetic-security-evidence-metadata-only boundary but received ${boundary}.`
    );
  }

  const shareRule = result.response.headers.get("x-scrimed-share-rule");
  if (shareRule !== "redacted-metadata-only") {
    throw new Error(`SCRIMED Security Diligence Evidence Packet expected redacted-metadata-only share rule but received ${shareRule}.`);
  }

  const body = requireJson("SCRIMED Security Diligence Evidence Packet", result.body);

  if (body.service !== "scrimed-security-diligence-evidence-packet") {
    throw new Error(`SCRIMED Security Diligence Evidence Packet expected service name but received ${body.service}.`);
  }

  if (body.status !== "scrimed-security-diligence-evidence-packet-active-no-phi") {
    throw new Error(`SCRIMED Security Diligence Evidence Packet expected active no-PHI status but received ${body.status}.`);
  }

  if (body.scorecard?.buyerDiligenceShareReady !== true) {
    throw new Error("SCRIMED Security Diligence Evidence Packet expected buyer diligence share-ready metadata.");
  }

  if (body.scorecard?.phiProductionShareReady !== false || body.scorecard?.customerGoLiveShareReady !== false) {
    throw new Error("SCRIMED Security Diligence Evidence Packet must keep PHI production and customer go-live share readiness false.");
  }

  if (!Array.isArray(body.artifacts) || body.artifacts.length < 8) {
    throw new Error("SCRIMED Security Diligence Evidence Packet expected at least eight evidence artifacts.");
  }

  if (!Array.isArray(body.questionnaireResponses) || body.questionnaireResponses.length < 8) {
    throw new Error("SCRIMED Security Diligence Evidence Packet expected at least eight questionnaire responses.");
  }

  if (!body.questionnaireResponses.every((response) => response.humanReviewRequired === true && response.auditHash)) {
    throw new Error("SCRIMED Security Diligence Evidence Packet expected human-reviewed questionnaire responses with audit hashes.");
  }

  if (!body.questionnaireResponses.some((response) => response.domain === "ai_governance")) {
    throw new Error("SCRIMED Security Diligence Evidence Packet missing AI governance questionnaire response.");
  }

  if (!Array.isArray(body.shareRules) || !body.shareRules.some((rule) => rule.includes("Do not share raw logs"))) {
    throw new Error("SCRIMED Security Diligence Evidence Packet missing raw-log redaction share rule.");
  }

  if (!body.shareRules.some((rule) => rule.includes("questionnaire responses as governed answer starters"))) {
    throw new Error("SCRIMED Security Diligence Evidence Packet missing questionnaire answer-starter share rule.");
  }

  console.log("pass SCRIMED Security Diligence Evidence Packet");
}

async function checkProtectedFailClosed(path, label) {
  const result = await request(path);
  requireStatus(label, result.response.status, [401, 503]);
  requireContentType(label, result.response, "application/json");
  requireSyntheticBoundary(label, result.response);
  console.log(`pass ${label} fail-closed: ${result.response.status} ${result.response.statusText}`);
}

async function checkProtectedPostFailClosed(path, label, payload) {
  const result = await postJson(path, payload);
  requireStatus(label, result.response.status, [401, 503]);
  requireContentType(label, result.response, "application/json");
  requireSyntheticBoundary(label, result.response);
  console.log(`pass ${label} fail-closed: ${result.response.status} ${result.response.statusText}`);
}

async function checkP32ProtectedPostFailClosed(path, label, payload) {
  const result = await postJson(path, payload);
  requireStatus(label, result.response.status, [401, 403, 503]);
  requireContentType(label, result.response, "application/json");
  const dataBoundary = result.response.headers.get("x-scrimed-data-boundary");
  if (dataBoundary !== "synthetic-metadata-only") {
    throw new Error(`${label} expected synthetic-metadata-only boundary but received ${dataBoundary}.`);
  }
  requireNoClinicalCareAuthority(label, result.response);
  if (!result.response.headers.get("x-scrimed-csrf-protection")) {
    throw new Error(`${label} missing protected mutation provenance policy header.`);
  }
  if (result.response.headers.get("x-scrimed-release-authority") !== "not-granted") {
    throw new Error(`${label} must not grant release authority.`);
  }
  console.log(`pass ${label} fail-closed: ${result.response.status} ${result.response.statusText}`);
}

async function checkSalesProtectedFailClosed(path, label) {
  const result = await request(path);
  requireStatus(label, result.response.status, [401, 503]);
  requireContentType(label, result.response, "application/json");
  requireSalesBoundary(label, result.response);
  console.log(`pass ${label} fail-closed: ${result.response.status} ${result.response.statusText}`);
}

await checkSiteNavigationShell();
await checkBuyerTrustReliabilitySafetyMessaging();
await checkHtml("/company-assessment");
await checkHtml("/clinical-production-readiness");
await checkHtml("/pricing");
await checkHtml("/pilot-demo-commercial-readiness");
await checkHtml("/pilot-workspace/access");
await checkHtml("/sales-operations");
await checkHtml("/competitive-edge");
await checkHtml("/competitive-defense");
await checkHtml("/competitive-intelligence");
await checkHtml("/scrimed-market-execution");
await checkHtml("/enterprise-healthcare-infrastructure");
await checkHtml("/scrimed-execution-focus");
await checkHtml("/strategic-intelligence");
await checkHtml("/pilot-deal-room");
await checkHtml("/qa-evidence");
await checkHtml("/clinical-authority-readiness");
await checkHtml("/clinical-care-activation");
await checkHtml("/public-market-readiness");
await checkHtml("/global-enterprise-command");
await checkHtml("/global-reach");
await checkHtml("/global-certification-readiness");
await checkHtml("/healthcare-intelligence-os");
await checkHtml("/healthcare-optimization-command");
await checkHtml("/healthcare-value-realization");
await checkHtml("/pilot-value-evidence");
await checkHtml("/pilot-activation-planner");
await checkHtml("/pilot-handoff-command");
await checkHtml("/pilot-success-review-command");
await checkHtml("/scrimed-os");
await checkHtml("/scrimed-intelligence-platform");
await checkHtml("/scrimed-work");
await checkHtml("/scrimed-p33");
await checkHtml("/scrimed-p34");
await checkHtml("/synthetic-pilot");
await checkHtml("/scrimed-agent-governance");
await checkHtml("/scrimed-reasoning-stability");
await checkHtml("/scrimed-clinical-benchmark-suite");
await checkHtml("/scrimed-automation-autopilot");
await checkHtml("/scrimed-enterprise-acceleration");
await checkHtml("/scrimed-governance-learning-loop");
await checkHtml("/scrimed-guided-execution");
await checkHtml("/scrimed-proof-packet-studio");
await checkHtml("/scrimed-cyber-defense");
await checkScrimedSecurityDiligenceEvidencePacket();
await checkHtml("/scrimed-hybrid-retrieval");
await checkHtml("/scrimed-llmops-observability");
await checkHtml("/scrimed-ai-infrastructure-watchtower");
await checkHtml("/scrimed-patient-context-gateway");
await checkHtml("/health-records");
await checkHtml("/offerings");
await checkHtml("/service-delivery");
await checkHtml("/client-onboarding");
await checkHtml("/continuous-review-audit");
await checkHtml("/boundary-resolution");
await checkHtml("/boundary-release-approvals");
await checkHtml("/approvals-readiness");
await checkHtml("/release-continuity");
await checkHtml("/deployment-drift-guard");
await checkHtml("/navigation");
await checkHtml("/service-reliability");
await checkHtml("/operational-efficiency");
await checkHtml("/strategic-problem-resolution");
await checkHtml("/capital-vitality");
await checkHtml("/growth-engine");
await checkHtml("/investor-audience-readiness");
await checkHtml("/launch-readiness");
await checkHtml("/enterprise-business-ops");
await checkHtml("/enterprise-scalability");
await checkHtml("/platform-power");
await checkHtml("/production-architecture");
await checkHtml("/workflows/execution-attempts");
await checkHtml("/limitations-workarounds");
await checkHtml("/qa-execution-readiness");
await checkHtml("/qa-run-control");
await checkHtml("/qa-launch-kit");
await checkHtml("/qa-human-run-packet");
await checkHtml("/qa-completion-bridge");
await checkHtml("/qa-claim-guard");
await checkHtml("/qa-activation-seal");
await checkHtml("/qa-proof-promotion");
await checkHtml("/qa-buyer-proof-release");
await checkHtml("/buyer-release-control-run");
await checkHtml("/qa-manual-execution-console");
await checkHtml("/qa-aal2-run-evidence");
await checkHtml("/validation-evidence");
await checkHtml("/legal");
await checkReleaseContinuity();
await checkNavigationAudit();
await checkServiceReliability();
await checkOperationalEfficiency();
await checkScrimedAutomationAutopilot();
await checkStrategicProblemResolution();
await checkHealthcareOptimizationCommand();
await checkHealthcareValueRealization();
await checkPilotValueEvidence();
await checkPilotActivationPlanner();
await checkPilotHandoffCommand();
await checkPilotSuccessReviewCommand();
await checkHealthRecordsSafetyExchange();
await checkCompanyAssessment();
await checkClinicalProductionReadiness();
await checkPilotDemoCommercialReadiness();
await checkProductServicePortfolio();
await checkServiceDelivery();
await checkClientOnboardingCommunications();
await checkCapitalVitality();
await checkGrowthEngine();
await checkInvestorAudienceReadiness();
await checkLaunchReadiness();
await checkEnterpriseBusinessOps();
await checkEnterpriseScalabilityOperations();
await checkPlatformPowerOperations();
await checkProductionArchitecture();
await checkExecutionAttemptEnvelope();
await checkExecutionAttemptDurableStore();
await checkLimitationsWorkaroundOperations();
await checkApprovalsReadiness();
await checkGlobalCertificationReadiness();
await checkContinuousReviewAudit();
await checkHealthcareIntelligenceOS();
await checkClinicalDataFabric();
await checkClinicalDataGovernance();
await checkClinicalContextGateway();
await checkScrimedOSUpgradeBatch();
await checkScrimedIntelligencePlatform();
await checkScrimedWork();
await checkClinicalAuthorityReadiness();
await checkClinicalCareActivation();
await checkPublicMarketReadiness();
await checkGlobalEnterpriseCommand();
await checkGlobalReach();
await checkBoundaryResolution();
await checkBoundaryReleaseApprovalMatrix();
await checkProductConsole();
await checkReadiness();
await checkCommercialPricing();
await checkCompetitiveEdgeApi();
await checkCompetitiveIntelligenceApi();
await checkScrimedMarketExecutionApi();
await checkEnterpriseHealthcareInfrastructureApi();
await checkDeploymentDriftGuard();
await checkScrimedExecutionFocusApi();
await checkStrategicPlatformIntelligence();
await checkCompetitiveDefense();
await checkPilotDealRoomApi();
await checkQaEvidenceLedger();
await checkQaExecutionReadiness();
await checkQaRunControl();
await checkQaLaunchKit();
await checkQaHumanRunPacket();
await checkQaCompletionBridge();
await checkQaClaimGuard();
await checkQaActivationSeal();
await checkQaProofPromotion();
await checkQaBuyerProofRelease();
await checkBuyerReleaseControlRun();
await checkQaManualExecutionConsole();
await checkQaAal2RunEvidence();
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/deal-room-packet",
  "Sales deal-room packet protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/command-center",
  "Sales Command Center protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/workspace-provisioning",
  "Sales workspace provisioning protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/workspace-provisioning/packet",
  "Sales workspace provisioning packet protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/tenant-lifecycle",
  "Sales buyer tenant lifecycle protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/tenant-lifecycle/packet",
  "Sales buyer tenant lifecycle packet protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/production-readiness",
  "Sales production readiness protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/production-readiness/packet",
  "Sales production readiness packet protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/activation-approvals",
  "Sales customer activation approvals protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/activation-approvals/packet",
  "Sales customer activation approval packet protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/buyer-diligence",
  "Sales buyer diligence room protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/buyer-diligence/packet",
  "Sales buyer diligence packet protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/evidence-vault-readiness",
  "Sales secure evidence vault readiness protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/evidence-vault-readiness/packet",
  "Sales secure evidence vault readiness packet protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/demo-execution",
  "Sales buyer demo execution protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/demo-execution/brief",
  "Sales buyer demo execution brief protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/demo-sessions",
  "Sales buyer demo sessions protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/opportunities/smoke-test/demo-sessions/00000000-0000-0000-0000-000000000000/packet",
  "Sales buyer demo session packet protected API"
);
await checkSalesProtectedFailClosed(
  "/api/sales-operations/qa/buyer-demo-sessions",
  "Sales buyer demo session QA protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/demo-readiness`,
  "Demo readiness snapshots protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/buyer-room`,
  "Buyer Pilot Room protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/command-intelligence`,
  "Command Intelligence Hub protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/command-intelligence/00000000-0000-0000-0000-000000000000/packet`,
  "Command Intelligence packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/clinical-activation-dossier`,
  "Clinical Activation Dossier protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/clinical-activation-dossier/packet`,
  "Clinical Activation Dossier packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/clinical-activation-approvals`,
  "Clinical Activation Approval Workflow protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/clinical-activation-approvals`,
  "Clinical Activation Approval Workflow write protected API",
  {
    domainId: "clinical-governance-safety",
    attestation: "aal2-readiness-attestation-no-phi"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/clinical-activation-approvals/packet`,
  "Clinical Activation Approval Workflow packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/clinical-authority-evidence-room`,
  "Clinical Authority Evidence Room protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/clinical-authority-evidence-room/packet`,
  "Clinical Authority Evidence Room packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/clinical-authority-owner-matrix`,
  "Clinical Authority Owner Matrix protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/clinical-authority-owner-matrix/packet`,
  "Clinical Authority Owner Matrix packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/clinical-authority-artifact-intake`,
  "Clinical Authority Artifact Intake protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/clinical-authority-artifact-intake/packet`,
  "Clinical Authority Artifact Intake packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/authority-artifact-references`,
  "Authority Artifact References protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/authority-artifact-references/renewal-queue`,
  "Authority Artifact References renewal queue protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/authority-artifact-references/packet`,
  "Authority Artifact References packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/operator-metrics`,
  "Protected Operator Metrics protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/operator-metrics`,
  "Protected Operator Metrics write protected API",
  {
    metricKey: "workflow-volume",
    metricValue: 1,
    workflowKey: "smoke.public-market-readiness",
    measurementWindowStart: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    measurementWindowEnd: new Date().toISOString(),
    sourceRoute: "/public-market-readiness",
    evidenceReference: "smoke-no-phi-operator-metric",
    operatorAttestation: "no-phi-finance-readiness-operator-metric",
    dataBoundary: "synthetic-business-workflow-only"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/metric-rollups`,
  "Protected Metric Rollups protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/metric-rollups`,
  "Protected Metric Rollups write protected API",
  {
    reportingPeriodStart: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    reportingPeriodEnd: new Date().toISOString(),
    reviewerAttestation: "finance-reviewed-no-phi-operating-rollup",
    dataBoundary: "synthetic-business-workflow-only",
    reviewNote: "smoke-no-phi-board-rollup"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/metric-rollups/00000000-0000-4000-8000-000000000000/packet`,
  "Protected Metric Rollup packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/metric-trends`,
  "Protected Metric Trends protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/metric-trends`,
  "Protected Metric Trends write protected API",
  {
    currentSnapshotId: "00000000-0000-4000-8000-000000000001",
    comparisonSnapshotId: "00000000-0000-4000-8000-000000000002",
    trendPeriodLabel: "smoke board trend",
    reviewerAttestation: "finance-reviewed-no-phi-board-trend",
    dataBoundary: "synthetic-business-workflow-only",
    costAllocationPolicy: "model-cost-only-finance-allocation-pending",
    reviewNote: "smoke-no-phi-metric-trend"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/metric-trends/00000000-0000-4000-8000-000000000000/packet`,
  "Protected Metric Trend packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/board-scorecards`,
  "Protected Board Scorecards protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/board-scorecards`,
  "Protected Board Scorecards write protected API",
  {
    primaryTrendReviewId: "00000000-0000-4000-8000-000000000001",
    secondaryTrendReviewId: "00000000-0000-4000-8000-000000000002",
    tertiaryTrendReviewId: "00000000-0000-4000-8000-000000000003",
    boardPeriodLabel: "smoke board scorecard",
    buyerSegmentFocus: "multi-segment",
    operatorAttestation: "finance-methodology-pending-no-phi-board-scorecard",
    dataBoundary: "synthetic-business-workflow-only",
    allocationProfileStatus: "finance-allocation-profile-pending",
    reviewNote: "smoke-no-phi-board-scorecard"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/board-scorecards/00000000-0000-4000-8000-000000000000/packet`,
  "Protected Board Scorecard packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/finance-methodology`,
  "Protected Finance Methodology protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/finance-methodology`,
  "Protected Finance Methodology write protected API",
  {
    gateId: "finance-cost-allocation",
    boardScorecardId: "00000000-0000-4000-8000-000000000001",
    attestation: "finance-external-use-gates-no-phi-readiness",
    dataBoundary: "synthetic-business-workflow-only",
    reviewNote: "smoke-no-phi-finance-methodology-gate"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/finance-methodology/packet`,
  "Protected Finance Methodology packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/external-approval-evidence`,
  "Protected External Approval Evidence protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/external-approval-evidence`,
  "Protected External Approval Evidence write protected API",
  {
    domainId: "finance-methodology-policy",
    financeGateRecordId: "00000000-0000-4000-8000-000000000001",
    externalReferenceLabel: "Smoke external approval reference",
    externalSystem: "external-secure-channel",
    referenceLocator: "external-secure-channel:smoke-reference",
    referenceOwner: "qualified external reviewer",
    evidenceRetainedExternally: true,
    attestation: "external-approval-evidence-reference-no-phi",
    dataBoundary: "synthetic-business-workflow-only",
    reviewNote: "smoke metadata-only external approval reference"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/external-approval-evidence/packet`,
  "Protected External Approval Evidence packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/boundary-release-evidence-intake`,
  "Protected Boundary Release Evidence Intake protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/boundary-release-evidence-intake`,
  "Protected Boundary Release Evidence Intake write protected API",
  {
    workItemId: "live-phi:hipaa-risk-analysis:risk-analysis-report",
    workItemHash: "0000000000000000000000000000000000000000000000000000000000000000",
    externalReferenceLabel: "Smoke boundary evidence reference",
    externalSystem: "security-grc",
    referenceLocator: "security-grc:boundary-evidence",
    referenceOwner: "qualified security reviewer",
    evidenceRetainedExternally: true,
    rawEvidenceStoredInScrimed: false,
    boundaryReleaseRequested: false,
    clinicalAuthorityRequested: false,
    humanReviewStatus: "queued",
    attestation: "boundary-release-evidence-intake-no-phi",
    reviewNote: "smoke metadata-only boundary evidence intake"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/boundary-release-evidence-intake/packet`,
  "Protected Boundary Release Evidence Intake packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/release-decisions`,
  "Protected Release Decisions protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/release-decisions`,
  "Protected Release Decisions write protected API",
  {
    releaseAudience: "buyer-diligence",
    claimCategory: "governance",
    claimVersion: "claims-v1.0.0",
    claimText: "SCRIMED provides governed synthetic pilot evidence for healthcare workflow intelligence review.",
    distributionChannel: "buyer-data-room",
    externalApprovalEvidenceRecordIds: [],
    attestation: "release-decision-claim-registry-no-phi",
    dataBoundary: "synthetic-business-workflow-only",
    reviewNote: "smoke no-phi release decision"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/release-decisions/packet`,
  "Protected Release Decisions packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/reviewer-signoffs`,
  "Protected Named Reviewer Sign-Offs protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/reviewer-signoffs`,
  "Protected Named Reviewer Sign-Offs write protected API",
  {
    reviewerRole: "qualified-counsel",
    releaseDecisionId: "00000000-0000-4000-8000-000000000001",
    reviewerDisplayName: "qualified reviewer",
    reviewerOrganization: "external review channel",
    signoffReferenceLabel: "Smoke named reviewer signoff",
    signoffReferenceLocator: "review-room:claim-signoff",
    artifactScope: "governance claim registry version",
    approvedClaimVersion: "claims-v1.0.0",
    distributionScope: "controlled buyer diligence review",
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    externalSignoffRetained: true,
    attestation: "named-reviewer-signoff-metadata-no-phi",
    dataBoundary: "synthetic-business-workflow-only",
    reviewNote: "smoke metadata-only named reviewer signoff"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/reviewer-signoffs/packet`,
  "Protected Named Reviewer Sign-Offs packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/distribution-lockbox`,
  "Protected Distribution Lockbox protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/distribution-lockbox`,
  "Protected Distribution Lockbox write protected API",
  {
    signoffRecordIds: ["00000000-0000-4000-8000-000000000001"],
    distributionAudience: "buyer-diligence-room",
    distributionChannelControl: "counsel-reviewed-room",
    manifestVersion: "distribution-v1.0.0",
    manifestTitle: "SCRIMED controlled buyer diligence packet",
    artifactManifestLabel: "controlled distribution manifest",
    artifactManifestLocator: "external-lockbox:controlled-manifest",
    customerPermissionReference: "external-permission-channel:retained",
    counselReviewReference: "counsel-review-channel:retained",
    distributionWindowStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    distributionWindowEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    recipientScope: "named buyer diligence reviewers",
    revocationPlan: "revoke access and re-review claims if scope changes",
    externalApprovalsRetained: true,
    distributionDisabled: true,
    attestation: "external-distribution-lockbox-metadata-no-phi",
    dataBoundary: "synthetic-business-workflow-only",
    reviewNote: "smoke metadata-only disabled lockbox"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/distribution-lockbox/packet`,
  "Protected Distribution Lockbox packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/release-authority-attestations`,
  "Protected Release Authority Attestations protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/release-authority-attestations`,
  "Protected Release Authority Attestations write protected API",
  {
    lockboxRecordIds: ["00000000-0000-4000-8000-000000000001"],
    authorityDomain: "qualified-counsel",
    distributionAudience: "buyer-diligence-room",
    releaseAuthorityReferenceLabel: "external release authority attestation",
    releaseAuthorityReferenceLocator: "release-authority-room:attestation",
    authorityOwnerLabel: "external authority owner",
    attestedManifestVersion: "distribution-v1.0.0",
    authorityWindowStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    authorityWindowEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    releaseScope: "controlled buyer diligence release review",
    revocationTrigger: "revoke release scope and re-review authority if audience changes",
    externalAuthorityRetained: true,
    releaseDisabled: true,
    attestation: "external-release-authority-attestation-metadata-no-phi",
    dataBoundary: "synthetic-business-workflow-only",
    reviewNote: "smoke metadata-only release authority reference"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/release-authority-attestations/packet`,
  "Protected Release Authority Attestations packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/evidence-room-recipient-attestations`,
  "Protected Evidence Room Recipient Attestations protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/evidence-room-recipient-attestations`,
  "Protected Evidence Room Recipient Attestations write protected API",
  {
    releaseAuthorityAttestationRecordIds: ["00000000-0000-4000-8000-000000000001"],
    distributionAudience: "buyer-diligence-room",
    recipientSegment: "named-buyer-reviewers",
    recipientScopeLabel: "named buyer diligence reviewer group",
    evidenceRoomReferenceLabel: "external evidence room recipient control",
    evidenceRoomReferenceLocator: "evidence-room:recipient-control",
    packetReferenceLabel: "controlled recipient proof packet",
    packetReferenceLocator: "evidence-room:packet-reference",
    accessWindowStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    accessWindowEnd: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    revocationState: "access-not-issued",
    revocationTrigger: "revoke and re-review evidence room access if scope changes",
    externalRecipientAuthorityRetained: true,
    exportDisabled: true,
    attestation: "evidence-room-recipient-attestation-metadata-no-phi",
    dataBoundary: "synthetic-business-workflow-only",
    reviewNote: "smoke metadata-only recipient attestation"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/evidence-room-recipient-attestations/packet`,
  "Protected Evidence Room Recipient Attestations packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/evidence-room-access-log-reconciliation`,
  "Protected Evidence Room Access Log Reconciliation protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/evidence-room-access-log-reconciliation`,
  "Protected Evidence Room Access Log Reconciliation write protected API",
  {
    recipientAttestationRecordIds: ["00000000-0000-4000-8000-000000000001"],
    distributionAudience: "buyer-diligence-room",
    reconciliationScope: "pre-release-access-log-review",
    externalLogSystemLabel: "external evidence room access ledger",
    accessLogReferenceLabel: "metadata access log reconciliation",
    accessLogReferenceLocator: "evidence-room:access-log-ledger",
    reconciliationWindowStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    reconciliationWindowEnd: new Date().toISOString(),
    observedAccessEventCount: 0,
    expectedRecipientSegmentCount: 1,
    anomalyState: "none-observed",
    revocationExerciseState: "not-issued",
    anomalyEscalationPath: "escalate to governance owner and keep export disabled",
    externalLogAuthorityRetained: true,
    exportDisabled: true,
    attestation: "evidence-room-access-log-reconciliation-metadata-no-phi",
    dataBoundary: "synthetic-business-workflow-only",
    reviewNote: "smoke metadata-only access log reconciliation"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/evidence-room-access-log-reconciliation/packet`,
  "Protected Evidence Room Access Log Reconciliation packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/evidence-room-provider-adapters`,
  "Protected Evidence Room Provider Adapters protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/evidence-room-provider-adapters`,
  "Protected Evidence Room Provider Adapters write protected API",
  {
    accessLogReconciliationRecordIds: ["00000000-0000-4000-8000-000000000001"],
    distributionAudience: "buyer-diligence-room",
    providerClass: "evidence-room-platform",
    integrationMode: "contract-only",
    externalProviderLabel: "qualified external evidence room provider",
    adapterContractReferenceLabel: "provider adapter contract metadata",
    adapterContractReferenceLocator: "provider-adapter:contract-readiness",
    auditLogImportStubLabel: "metadata-only audit log import stub",
    auditLogImportStubLocator: "provider-adapter:audit-log-import-stub",
    supportedAuditLogFormat: "access-review-report",
    verificationCadence: "review before each external release window",
    providerRiskTier: "not-assessed",
    externalProviderAuthorityRetained: true,
    rawLogImportDisabled: true,
    credentialStorageDisabled: true,
    exportDisabled: true,
    attestation: "evidence-room-provider-adapter-contract-metadata-no-phi",
    dataBoundary: "synthetic-business-workflow-only",
    reviewNote: "smoke provider adapter metadata only"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/evidence-room-provider-adapters/packet`,
  "Protected Evidence Room Provider Adapters packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/provider-security-reviews`,
  "Protected Provider Security Reviews protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/provider-security-reviews`,
  "Protected Provider Security Reviews write protected API",
  {
    providerAdapterRecordIds: ["00000000-0000-4000-8000-000000000001"],
    reviewDomain: "security-architecture",
    securityOwnerLabel: "enterprise security review owner",
    privacyOwnerLabel: "enterprise privacy review owner",
    agreementPathLabel: "baa dpa readiness path defined",
    incidentResponsePathLabel: "incident response path defined",
    retentionResidencyPathLabel: "retention residency review path",
    rollbackPlanLabel: "go live rollback plan defined",
    reviewCadence: "review before production connector activation",
    providerSecurityRisk: "not-assessed",
    externalSecurityReviewRetained: true,
    phiProcessingDisabled: true,
    credentialStorageDisabled: true,
    signedAgreementStorageDisabled: true,
    liveIntegrationDisabled: true,
    humanApprovalRequired: true,
    attestation: "provider-security-review-metadata-no-phi",
    dataBoundary: "synthetic-business-workflow-only",
    reviewNote: "smoke security review metadata only"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/provider-security-reviews/packet`,
  "Protected Provider Security Reviews packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/procurement-evidence`,
  "Protected Procurement Evidence Registry protected API"
);
await checkProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/procurement-evidence`,
  "Protected Procurement Evidence Registry write protected API",
  {
    providerSecurityReviewRecordIds: ["00000000-0000-4000-8000-000000000001"],
    targetAudience: "provider-health-system",
    procurementDomain: "security-questionnaire",
    evidenceClass: "questionnaire-response-routing",
    procurementOwnerLabel: "enterprise procurement evidence owner",
    buyerSegmentLabel: "health system security procurement reviewer",
    externalSystemLabel: "qualified external diligence system",
    evidenceRoutingLabel: "metadata only evidence routing label",
    evidenceRoutingLocator: "external-system:procurement-evidence-room",
    responseCadence: "review before buyer diligence response",
    procurementRiskTier: "not-assessed",
    securityQuestionnaireRetainedExternally: true,
    socReportRetainedExternally: true,
    pentestReportRetainedExternally: true,
    signedLegalArtifactsRetainedExternally: true,
    credentialStorageDisabled: true,
    phiProcessingDisabled: true,
    confidentialAnswerStorageDisabled: true,
    humanApprovalRequired: true,
    externalDistributionDisabled: true,
    attestation: "procurement-evidence-routing-metadata-no-sensitive-artifacts",
    dataBoundary: "synthetic-business-workflow-only",
    reviewNote: "smoke procurement routing metadata only"
  }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/procurement-evidence/packet`,
  "Protected Procurement Evidence Registry packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/buyer-room/packet`,
  "Buyer Diligence Export protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/buyer-release-control-run`,
  "Protected Buyer Release Control verifier protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/buyer-release-control-run/packet`,
  "Protected Buyer Release Control packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/buyer-release-control-run/timeline`,
  "Protected Buyer Release Timeline protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/buyer-release-control-run/remediation`,
  "Protected Buyer Release Remediation Plan protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/buyer-release-control-run/reconciliation`,
  "Protected Buyer Release Gate Reconciliation protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/buyer-release-control-run/metadata-drafts`,
  "Protected Buyer Release Metadata Drafts protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/buyer-release-control-run/metadata-drafts/checklist`,
  "Protected Buyer Release Draft Checklist protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/qa-evidence/manual-run-packets`,
  "Manual QA evidence persistence protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/qa-evidence/buyer-proof-release`,
  "QA Buyer Proof Release protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/qa-evidence/manual-execution-console`,
  "QA Manual Execution Console protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/qa-evidence/aal2-run-evidence`,
  "QA AAL2 Run Evidence protected API"
);
await checkP32ProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/qa-evidence/p32-attestation`,
  "P.32 Evidence Attestation protected API",
  {
    sourceCommit: "0".repeat(40),
    sourceTreeFingerprint: "1".repeat(64),
    artifactFingerprint: "2".repeat(64),
    validationEvidenceFingerprint: "3".repeat(64)
  }
);
await checkP32ProtectedPostFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/qa-evidence/p32-candidate-review?action=assign`,
  "P.32 Candidate Review protected API",
  { reviewerIdentityHash: "4".repeat(64) }
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/enterprise-proof-packet`,
  "Enterprise proof packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/trust-safety-incidents`,
  "TrustOps protected API"
);
await checkProtectedFailClosed(
  `/api/agent-workspaces/${workspaceSlug}/work-orders`,
  "Agent Workspace protected API"
);

console.log("pass public production smoke");
