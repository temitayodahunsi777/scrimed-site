import { NextResponse } from "next/server";
import { buildScrimedComputeFabricBrief, scrimedComputeFabricStatus } from "../../../lib/scrimedComputeFabric";

export const dynamic = "force-dynamic";

export async function GET() {
  return new NextResponse(buildScrimedComputeFabricBrief(), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": "attachment; filename=\"scrimed-compute-fabric.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
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
