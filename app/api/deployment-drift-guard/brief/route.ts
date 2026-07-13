import { NextResponse } from "next/server";
import {
  buildDeploymentDriftGuardBrief,
  deploymentDriftGuardStatus
} from "../../../lib/deploymentDriftGuard";

export const dynamic = "force-dynamic";

export function GET() {
  return new NextResponse(buildDeploymentDriftGuardBrief(), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": "attachment; filename=\"scrimed-deployment-drift-guard.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Customer-Go-Live": "not-authorized",
      "X-SCRIMED-Data-Boundary": "synthetic-and-metadata-only",
      "X-SCRIMED-Deployment-Authority": "not-deployed-by-this-route",
      "X-SCRIMED-Deployment-Drift-Guard": deploymentDriftGuardStatus,
      "X-SCRIMED-EHR-Writeback": "not-authorized",
      "X-SCRIMED-Payer-Submission": "not-authorized",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
