import { NextResponse } from "next/server";
import {
  buildComputeFabricMigrationPreflightBrief,
  computeFabricMigrationPreflightStatus
} from "../../../../lib/computeFabricMigrationPreflight";

export const dynamic = "force-dynamic";

export async function GET() {
  return new NextResponse(buildComputeFabricMigrationPreflightBrief(), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": "attachment; filename=\"scrimed-compute-fabric-migration-preflight.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Compute-Fabric-Migration-Preflight": computeFabricMigrationPreflightStatus,
      "X-SCRIMED-Data-Boundary": "synthetic-and-metadata-only",
      "X-SCRIMED-Database-Migration-Authority": "not-applied-by-this-route",
      "X-SCRIMED-EHR-Writeback": "not-authorized",
      "X-SCRIMED-Model-Calls": "not-enabled",
      "X-SCRIMED-Payer-Submission": "not-authorized",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Production-Activation": "not-authorized-customer-go-live",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
