import { NextResponse } from "next/server";
import {
  buildDiligencePacketShareGuardBrief,
  diligencePacketShareGuardStatus
} from "../../../../lib/diligencePacketShareGuard";

export const dynamic = "force-dynamic";

export async function GET() {
  return new NextResponse(buildDiligencePacketShareGuardBrief(), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": "attachment; filename=\"scrimed-diligence-packet-share-guard.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Approval-Authority": "external-review-required",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Diligence-Packet-Share-Guard": diligencePacketShareGuardStatus,
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Public-Distribution-Authority": "not-authorized",
      "X-SCRIMED-Recipient-Authorization": "recipient-specific-human-approval-required",
      "X-SCRIMED-Release-Authority": "not-release-approval",
      "X-SCRIMED-Security-Certification": "not-security-certified",
      "X-SCRIMED-Token-Handling": "no-token-values-exposed-or-retained"
    }
  });
}
