import { assertSafeScrimedOperatingMode, getScrimedOperatingModeSummary } from "./app/lib/operatingMode";

export async function register() {
  assertSafeScrimedOperatingMode();

  const summary = getScrimedOperatingModeSummary();
  console.info(
    "[scrimed-operating-mode]",
    JSON.stringify({
      status: summary.status,
      version: summary.mode.version,
      syntheticOnly: summary.mode.syntheticOnly,
      allowPHI: summary.mode.allowPHI,
      liveClinicalExecution: summary.mode.liveClinicalExecution,
      productionActivationAuthorized: summary.validation.productionActivationAuthorized
    })
  );
}
