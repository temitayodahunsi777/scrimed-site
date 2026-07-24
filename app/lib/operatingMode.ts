export type ScrimedOperatingMode = {
  version: "2026-07-23.synthetic-default-v1";
  syntheticOnly: boolean;
  allowPHI: boolean;
  liveClinicalExecution: boolean;
  productionEHRConnections: boolean;
  medicalDeviceConnections: boolean;
  emergencyMonitoring: boolean;
  autonomousTreatmentActions: boolean;
  autonomousEligibilityDecisions: boolean;
  autonomousPayerDecisions: boolean;
  faithAffectsClinicalLogic: boolean;
};

export type OperatingModeAction =
  | "public-business-intake"
  | "synthetic-evaluation"
  | "phi-processing"
  | "live-clinical-execution"
  | "ehr-connection"
  | "medical-device-connection"
  | "emergency-monitoring"
  | "autonomous-treatment"
  | "autonomous-eligibility"
  | "autonomous-payer-decision"
  | "faith-influenced-clinical-logic";

export type OperatingModeDecision = {
  allowed: boolean;
  action: OperatingModeAction;
  reasonCode: string;
  reason: string;
  operatingModeVersion: ScrimedOperatingMode["version"];
  humanReviewRequired: boolean;
};

const defaultOperatingMode: ScrimedOperatingMode = {
  version: "2026-07-23.synthetic-default-v1",
  syntheticOnly: true,
  allowPHI: false,
  liveClinicalExecution: false,
  productionEHRConnections: false,
  medicalDeviceConnections: false,
  emergencyMonitoring: false,
  autonomousTreatmentActions: false,
  autonomousEligibilityDecisions: false,
  autonomousPayerDecisions: false,
  faithAffectsClinicalLogic: false
};

function envBoolean(name: string, fallback: boolean) {
  const value = process.env[name]?.trim().toLowerCase();

  if (value === undefined || value === "") return fallback;
  if (value === "true") return true;
  if (value === "false") return false;

  throw new Error(`Invalid boolean value for ${name}; expected "true" or "false".`);
}

export function resolveScrimedOperatingMode(): ScrimedOperatingMode {
  return {
    version: defaultOperatingMode.version,
    syntheticOnly: envBoolean("SCRIMED_SYNTHETIC_ONLY", defaultOperatingMode.syntheticOnly),
    allowPHI: envBoolean("SCRIMED_ALLOW_PHI", defaultOperatingMode.allowPHI),
    liveClinicalExecution: envBoolean(
      "SCRIMED_LIVE_CLINICAL_EXECUTION",
      defaultOperatingMode.liveClinicalExecution
    ),
    productionEHRConnections: envBoolean(
      "SCRIMED_PRODUCTION_EHR_CONNECTIONS",
      defaultOperatingMode.productionEHRConnections
    ),
    medicalDeviceConnections: envBoolean(
      "SCRIMED_MEDICAL_DEVICE_CONNECTIONS",
      defaultOperatingMode.medicalDeviceConnections
    ),
    emergencyMonitoring: envBoolean(
      "SCRIMED_EMERGENCY_MONITORING",
      defaultOperatingMode.emergencyMonitoring
    ),
    autonomousTreatmentActions: envBoolean(
      "SCRIMED_AUTONOMOUS_TREATMENT_ACTIONS",
      defaultOperatingMode.autonomousTreatmentActions
    ),
    autonomousEligibilityDecisions: envBoolean(
      "SCRIMED_AUTONOMOUS_ELIGIBILITY_DECISIONS",
      defaultOperatingMode.autonomousEligibilityDecisions
    ),
    autonomousPayerDecisions: envBoolean(
      "SCRIMED_AUTONOMOUS_PAYER_DECISIONS",
      defaultOperatingMode.autonomousPayerDecisions
    ),
    faithAffectsClinicalLogic: envBoolean(
      "SCRIMED_FAITH_AFFECTS_CLINICAL_LOGIC",
      defaultOperatingMode.faithAffectsClinicalLogic
    )
  };
}

export function validateScrimedOperatingMode(mode = resolveScrimedOperatingMode()) {
  const violations: string[] = [];

  if (!mode.syntheticOnly) violations.push("syntheticOnly-must-remain-enabled");
  if (mode.allowPHI) violations.push("phi-processing-not-authorized");
  if (mode.liveClinicalExecution) violations.push("live-clinical-execution-not-authorized");
  if (mode.productionEHRConnections) violations.push("production-ehr-connections-not-authorized");
  if (mode.medicalDeviceConnections) violations.push("medical-device-connections-not-authorized");
  if (mode.emergencyMonitoring) violations.push("emergency-monitoring-not-authorized");
  if (mode.autonomousTreatmentActions) violations.push("autonomous-treatment-not-authorized");
  if (mode.autonomousEligibilityDecisions) violations.push("autonomous-eligibility-not-authorized");
  if (mode.autonomousPayerDecisions) violations.push("autonomous-payer-decisions-not-authorized");
  if (mode.faithAffectsClinicalLogic) violations.push("faith-clinical-influence-prohibited");

  return {
    valid: violations.length === 0,
    violations,
    safeDefaultsActive: violations.length === 0,
    productionActivationAuthorized: false as const
  };
}

export function assertSafeScrimedOperatingMode(mode = resolveScrimedOperatingMode()) {
  const validation = validateScrimedOperatingMode(mode);

  if (!validation.valid) {
    throw new Error(`Unsafe SCRIMED operating mode rejected: ${validation.violations.join(",")}`);
  }

  return mode;
}

export function evaluateOperatingModeAction(
  action: OperatingModeAction,
  mode = resolveScrimedOperatingMode()
): OperatingModeDecision {
  const safeActions = new Set<OperatingModeAction>(["public-business-intake", "synthetic-evaluation"]);
  const modeValidation = validateScrimedOperatingMode(mode);

  if (!modeValidation.valid) {
    return {
      allowed: false,
      action,
      reasonCode: "unsafe-operating-mode",
      reason: "Runtime configuration attempted to leave the approved synthetic-only operating boundary.",
      operatingModeVersion: mode.version,
      humanReviewRequired: true
    };
  }

  if (safeActions.has(action)) {
    return {
      allowed: true,
      action,
      reasonCode: "synthetic-boundary-allowed",
      reason: "Action remains inside the no-PHI, synthetic-only, human-supervised operating boundary.",
      operatingModeVersion: mode.version,
      humanReviewRequired: action !== "public-business-intake"
    };
  }

  return {
    allowed: false,
    action,
    reasonCode: "action-not-authorized",
    reason:
      "This action requires separate technical, identity, security, privacy, legal, clinical, regulatory, and deployment authorization.",
    operatingModeVersion: mode.version,
    humanReviewRequired: true
  };
}

export function getScrimedOperatingModeSummary() {
  const mode = resolveScrimedOperatingMode();
  const validation = validateScrimedOperatingMode(mode);

  return {
    service: "scrimed-operating-mode",
    status: validation.valid ? "synthetic-demonstration-only" : "startup-blocked",
    mode,
    validation,
    banner: "Synthetic demonstration environment — no PHI — no live clinical execution.",
    boundary:
      "No environment variable can authorize live PHI, live clinical execution, production EHR/device connections, emergency monitoring, autonomous care, payer decisions, or faith-influenced clinical logic in this release."
  };
}
