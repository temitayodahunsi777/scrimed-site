import { NextResponse } from "next/server";
import {
  diligenceReleaseGateStatus,
  getDiligenceReleaseGateSummary
} from "../../../lib/diligenceReleaseGate";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getDiligenceReleaseGateSummary(), {
    headers: {
      "Cache-Control": "no-store",
      "X-SCRIMED-Approval-Authority": "external-review-required",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Diligence-Release-Gate": diligenceReleaseGateStatus,
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Release-Authority": "not-release-approval",
      "X-SCRIMED-Security-Certification": "not-security-certified",
      "X-SCRIMED-Token-Handling": "no-token-values-exposed-or-retained"
    }
  });
}
