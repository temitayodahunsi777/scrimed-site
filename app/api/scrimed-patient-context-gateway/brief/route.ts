import { NextResponse } from "next/server";
import {
  buildScrimedPatientContextGatewayBrief,
  scrimedPatientContextGatewayBriefRoute,
  scrimedPatientContextGatewayStatus
} from "../../../lib/scrimedPatientContextGateway";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedPatientContextGatewayBriefRoute,
    requestedAction: "scrimed patient context gateway brief synthetic metadata internal testing",
    inputText: "synthetic no-phi patient context gateway brief",
    allowMetadataOnly: true
  });
  const headers = {
    ...scrimedSafetyHeaders(safety),
    "Content-Disposition": "attachment; filename=\"scrimed-patient-context-gateway.md\"",
    "Content-Type": "text/markdown; charset=utf-8",
    "X-SCRIMED-Code-PT-4": scrimedPatientContextGatewayStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-metadata-only"
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-patient-context-gateway-brief-blocked",
          message: "SCRIMED Patient Context Gateway brief is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return new NextResponse(buildScrimedPatientContextGatewayBrief(), { headers });
}
