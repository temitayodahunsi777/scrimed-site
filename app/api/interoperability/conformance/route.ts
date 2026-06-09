import { NextResponse } from "next/server";
import {
  interoperabilityBoundary,
  interoperabilityConformanceControls,
  interoperabilityTerminologyResolutions
} from "../../../lib/interoperabilityStandards";
import { getIntegrationFixtureValidationResults } from "../../../lib/integrationFixtureValidation";

export async function GET() {
  return NextResponse.json({
    service: "scrimed-interoperability-conformance",
    status: "synthetic-conformance-gate-active",
    boundary: interoperabilityBoundary,
    controls: interoperabilityConformanceControls,
    terminologyResolutions: interoperabilityTerminologyResolutions,
    fixtureValidation: getIntegrationFixtureValidationResults(),
    updated: "2026-06-09"
  });
}
