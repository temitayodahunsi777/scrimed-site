import { NextResponse } from "next/server";
import { getScrimedComputeFabricSummary, scrimedComputeFabricStatus } from "../../lib/scrimedComputeFabric";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getScrimedComputeFabricSummary(), {
    headers: {
      "Cache-Control": "no-store",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Compute-Fabric": scrimedComputeFabricStatus,
      "X-SCRIMED-Data-Boundary": "synthetic-and-metadata-only",
      "X-SCRIMED-EHR-Writeback": "not-authorized",
      "X-SCRIMED-Imaging-Authority": "not-final-medical-interpretation",
      "X-SCRIMED-Model-Calls": "not-enabled",
      "X-SCRIMED-Payer-Submission": "not-authorized",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Production-Activation": "not-authorized-customer-go-live",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
