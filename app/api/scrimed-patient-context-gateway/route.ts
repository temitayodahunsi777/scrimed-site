import { NextResponse } from "next/server";
import {
  getScrimedPatientContextGatewaySummary,
  scrimedPatientContextGatewayApiRoute,
  scrimedPatientContextGatewayStatus
} from "../../lib/scrimedPatientContextGateway";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedPatientContextGatewayApiRoute,
    requestedAction: "scrimed patient context gateway synthetic metadata continuity internal testing",
    inputText: "synthetic no-phi metadata-only patient context continuity consent fhir",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Code-PT-4": scrimedPatientContextGatewayStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-metadata-only",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-patient-context-gateway-blocked",
          message: "SCRIMED Patient Context Gateway is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getScrimedPatientContextGatewaySummary(), { headers });
}
