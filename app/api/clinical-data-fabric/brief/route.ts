import { NextResponse } from "next/server";
import {
  buildClinicalDataFabricBrief,
  clinicalDataFabricStatus
} from "../../../lib/clinicalDataFabric";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../lib/scrimedSafetyGovernance";

export async function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: "/api/clinical-data-fabric/brief",
    requestedAction: "clinical data fabric brief semantic control plane",
    inputText: "metadata control audit readiness source contracts semantic normalization provenance governance health graph brief",
    allowMetadataOnly: true
  });

  const headers = {
    "Cache-Control": "private, no-store",
    "Content-Disposition": "attachment; filename=\"scrimed-clinical-data-fabric.md\"",
    "Content-Type": "text/markdown; charset=utf-8",
    "X-SCRIMED-Clinical-Data-Fabric": clinicalDataFabricStatus,
    "X-SCRIMED-Data-Boundary": "no-live-phi-control-plane",
    "X-SCRIMED-Connector-Authority": "not-production-connector-approved",
    "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
    "X-SCRIMED-Agent-Data-Authority": "semantic-layer-only-no-raw-schema-access",
    "X-SCRIMED-Live-Ingestion-Authority": "blocked-pending-customer-authorization",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return new NextResponse(
      [
        "# SCRIMED Clinical Data Fabric",
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

  return new NextResponse(buildClinicalDataFabricBrief(), {
    headers
  });
}
