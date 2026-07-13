import { NextResponse } from "next/server";
import {
  buildScrimedIntelligencePlatformBrief,
  scrimedIntelligencePlatformStatus
} from "../../../lib/scrimedIntelligencePlatform";

export const dynamic = "force-dynamic";

export async function GET() {
  return new NextResponse(buildScrimedIntelligencePlatformBrief(), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": "attachment; filename=\"scrimed-intelligence-platform.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-and-metadata-only",
      "X-SCRIMED-EHR-Writeback": "not-authorized",
      "X-SCRIMED-Imaging-Authority": "not-final-medical-interpretation",
      "X-SCRIMED-Intelligence-Platform": scrimedIntelligencePlatformStatus,
      "X-SCRIMED-Payer-Submission": "not-authorized",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Production-Activation": "not-authorized-customer-go-live",
      "X-SCRIMED-Security-Certification": "not-security-certified",
      "X-SCRIMED-Token-Handling": "no-token-values-exposed-or-retained"
    }
  });
}
