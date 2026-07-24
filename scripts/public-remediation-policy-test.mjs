#!/usr/bin/env node

import assert from "node:assert/strict";
import { companyIdentity } from "../app/lib/companyIdentity.ts";
import {
  evaluateOperatingModeAction,
  resolveScrimedOperatingMode,
  validateScrimedOperatingMode
} from "../app/lib/operatingMode.ts";
import { evaluatePublicClaims } from "../app/lib/publicClaimsPolicy.ts";
import { validatePilotIntakePayload } from "../app/lib/pilotIntake.ts";

const operatingEnvNames = [
  "SCRIMED_SYNTHETIC_ONLY",
  "SCRIMED_ALLOW_PHI",
  "SCRIMED_LIVE_CLINICAL_EXECUTION",
  "SCRIMED_PRODUCTION_EHR_CONNECTIONS",
  "SCRIMED_MEDICAL_DEVICE_CONNECTIONS",
  "SCRIMED_EMERGENCY_MONITORING",
  "SCRIMED_AUTONOMOUS_TREATMENT_ACTIONS",
  "SCRIMED_AUTONOMOUS_ELIGIBILITY_DECISIONS",
  "SCRIMED_AUTONOMOUS_PAYER_DECISIONS",
  "SCRIMED_FAITH_AFFECTS_CLINICAL_LOGIC"
];
const originalEnv = Object.fromEntries(operatingEnvNames.map((name) => [name, process.env[name]]));

try {
  for (const name of operatingEnvNames) delete process.env[name];

  const mode = resolveScrimedOperatingMode();
  assert.equal(validateScrimedOperatingMode(mode).valid, true);
  assert.equal(mode.syntheticOnly, true);
  assert.equal(mode.allowPHI, false);
  assert.equal(mode.liveClinicalExecution, false);
  assert.equal(mode.productionEHRConnections, false);
  assert.equal(mode.medicalDeviceConnections, false);
  assert.equal(mode.emergencyMonitoring, false);
  assert.equal(mode.autonomousTreatmentActions, false);
  assert.equal(mode.autonomousEligibilityDecisions, false);
  assert.equal(mode.autonomousPayerDecisions, false);
  assert.equal(mode.faithAffectsClinicalLogic, false);

  assert.equal(evaluateOperatingModeAction("public-business-intake", mode).allowed, true);
  assert.equal(evaluateOperatingModeAction("synthetic-evaluation", mode).allowed, true);
  for (const action of [
    "phi-processing",
    "live-clinical-execution",
    "ehr-connection",
    "medical-device-connection",
    "emergency-monitoring",
    "autonomous-treatment",
    "autonomous-eligibility",
    "autonomous-payer-decision",
    "faith-influenced-clinical-logic"
  ]) {
    assert.equal(evaluateOperatingModeAction(action, mode).allowed, false, action);
  }

  process.env.SCRIMED_ALLOW_PHI = "yes";
  assert.throws(() => resolveScrimedOperatingMode(), /Invalid boolean value/);
  process.env.SCRIMED_ALLOW_PHI = "true";
  assert.equal(validateScrimedOperatingMode(resolveScrimedOperatingMode()).valid, false);
  delete process.env.SCRIMED_ALLOW_PHI;

  const safeClaims = evaluatePublicClaims(
    "No-PHI synthetic demonstration. SCRIMED is not FDA approved. Clinician-supportive outputs require human review."
  );
  assert.equal(safeClaims.allowed, true);

  const mixedClaims = evaluatePublicClaims(
    "No-PHI synthetic demonstration requiring human review. SCRIMED is not FDA approved. Another sentence says FDA approved."
  );
  assert.equal(mixedClaims.allowed, false);
  assert.equal(mixedClaims.blockedClaims.some((claim) => claim.id === "unsupported-fda-claim"), true);

  assert.equal(companyIdentity.commercialStatus, "pre-commercial");
  assert.equal(companyIdentity.publishedStreetAddress, null);
  assert.equal(companyIdentity.registeredLegalName, null);
  assert.equal(companyIdentity.governingJurisdiction, null);

  const validSubmission = {
    fullName: "Jordan Reviewer",
    workEmail: "jordan@example.org",
    organization: "Example Health Innovation Team",
    role: "Operations leader",
    phone: "",
    website: "https://example.org",
    buyerSegment: "health-system",
    organizationSize: "501-5000",
    region: "united-states",
    offerInterest: "synthetic-pilot-evaluation",
    workflowTargets: ["referral-intake"],
    readinessNeeds: ["synthetic-demo"],
    governanceRequirements: ["synthetic-only", "human-review"],
    timeline: "exploratory",
    interoperabilityContext: "Synthetic FHIR interface planning only.",
    pilotGoals: "Evaluate referral workflow completeness using synthetic records.",
    boundaryAcknowledged: true,
    contactConsent: true,
    source: "/pilot",
    referrer: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmTerm: "",
    utmContent: ""
  };

  assert.equal(validatePilotIntakePayload(validSubmission).ok, true);

  const phiAttempt = validatePilotIntakePayload({
    ...validSubmission,
    pilotGoals: "Patient MRN 12345 needs review."
  });
  assert.equal(phiAttempt.ok, false);
  if (!phiAttempt.ok) {
    assert.equal(phiAttempt.errors.some((error) => error.field === "pilotGoals"), true);
    assert.equal(JSON.stringify(phiAttempt.errors).includes("12345"), false);
  }

  const markupAttempt = validatePilotIntakePayload({
    ...validSubmission,
    organization: "<script>alert('x')</script>"
  });
  assert.equal(markupAttempt.ok, false);
  if (!markupAttempt.ok) {
    assert.equal(
      markupAttempt.errors.some((error) => error.message.includes("Markup and executable content")),
      true
    );
  }

  const missingConsent = validatePilotIntakePayload({
    ...validSubmission,
    contactConsent: false
  });
  assert.equal(missingConsent.ok, false);

  console.log("pass SCRIMED public remediation policy tests (operating mode, claims, identity, form safety)");
} finally {
  for (const [name, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
}
