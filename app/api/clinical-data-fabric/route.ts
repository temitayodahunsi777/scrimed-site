import { NextResponse } from "next/server";
import {
  clinicalDataFabricStatus,
  getClinicalDataFabricSummary
} from "../../lib/clinicalDataFabric";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../lib/scrimedSafetyGovernance";

export async function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: "/api/clinical-data-fabric",
    requestedAction: "clinical data fabric semantic control plane",
    inputText: "metadata control audit readiness source contracts semantic normalization provenance governance health graph",
    allowMetadataOnly: true
  });

  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Clinical-Data-Fabric": clinicalDataFabricStatus,
    "X-SCRIMED-Data-Boundary": "no-live-phi-control-plane",
    "X-SCRIMED-Connector-Authority": "not-production-connector-approved",
    "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
    "X-SCRIMED-Agent-Data-Authority": "semantic-layer-only-no-raw-schema-access",
    "X-SCRIMED-Live-Ingestion-Authority": "blocked-pending-customer-authorization",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: "clinical-data-fabric-blocked",
        safety
      },
      {
        status: safety.statusCode,
        headers
      }
    );
  }

  return NextResponse.json(
    {
      ...getClinicalDataFabricSummary(),
      safety
    },
    {
      headers
    }
  );
}
