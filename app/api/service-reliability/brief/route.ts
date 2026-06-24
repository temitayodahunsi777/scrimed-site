import { NextResponse } from "next/server";
import { buildServiceReliabilityBrief } from "../../../lib/serviceReliability";

export async function GET() {
  return new NextResponse(buildServiceReliabilityBrief(), {
    headers: {
      "Content-Disposition": "attachment; filename=\"scrimed-service-reliability-brief.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Approval-Authority": "external-review-required",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Financial-Authority": "not-audited-financial-report",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Release-Authority": "not-release-approval",
      "X-SCRIMED-Security-Certification": "not-security-certified",
      "X-SCRIMED-Service-Reliability": "service-reliability-brief-ready"
    }
  });
}
