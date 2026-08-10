import { NextResponse } from "next/server";

import { buildClinicalAssuranceControlPlaneBrief } from "../../../lib/clinicalAssuranceControlPlane";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../../lib/scrimedSafetyGovernance";

export const dynamic = "force-dynamic";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: "/api/clinical-assurance-control-plane/brief",
    requestedAction: "synthetic metadata clinical assurance brief for internal review",
    inputText: "no phi no provider call human review required",
    allowMetadataOnly: true
  });
  if (!safety.allowed) {
    return NextResponse.json(
      { error: { code: "clinical-assurance-brief-blocked", message: "Clinical assurance brief is blocked by safety policy." } },
      { status: safety.statusCode, headers: scrimedSafetyHeaders(safety) }
    );
  }

  return new NextResponse(buildClinicalAssuranceControlPlaneBrief(), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Data-Boundary": "synthetic-metadata-only",
      ...scrimedSafetyHeaders(safety)
    }
  });
}
