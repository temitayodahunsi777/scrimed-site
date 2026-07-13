import { NextResponse } from "next/server";
import {
  buildClinicalContextGatewayBrief,
  clinicalContextGatewayStatus
} from "../../../lib/clinicalContextGateway";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../lib/scrimedSafetyGovernance";

export async function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: "/api/clinical-context-gateway/brief",
    requestedAction: "clinical context gateway brief metadata semantic envelope readiness",
    inputText: "metadata-only semantic context gateway brief audit readiness no phi",
    allowMetadataOnly: true
  });

  const headers = {
    "Cache-Control": "private, no-store",
    "Content-Disposition": "attachment; filename=\"scrimed-clinical-context-gateway.md\"",
    "Content-Type": "text/markdown; charset=utf-8",
    "X-SCRIMED-Clinical-Context-Gateway": clinicalContextGatewayStatus,
    "X-SCRIMED-Data-Boundary": "governed-semantic-context-only-no-live-phi",
    "X-SCRIMED-Raw-Schema-Access": "blocked",
    "X-SCRIMED-Raw-Connector-Payload": "blocked",
    "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
    "X-SCRIMED-Record-Mutation": "not-authorized",
    "X-SCRIMED-Patient-Outreach": "not-authorized",
    "X-SCRIMED-Payer-Submission": "not-authorized",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return new NextResponse(
      [
        "# SCRIMED Clinical Context Gateway",
        "",
        "Request blocked by SCRIMED safety governance.",
        `Policy: ${safety.policyVersion}`,
        `Reason: ${safety.reason}`
      ].join("\n"),
      {
        status: safety.statusCode,
        headers
      }
    );
  }

  return new NextResponse(buildClinicalContextGatewayBrief(), {
    headers
  });
}
