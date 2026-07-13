import { NextResponse } from "next/server";
import {
  buildDiligencePacketManifestBrief,
  diligencePacketManifestStatus
} from "../../../../lib/diligencePacketManifest";

export const dynamic = "force-dynamic";

export async function GET() {
  return new NextResponse(buildDiligencePacketManifestBrief(), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": "attachment; filename=\"scrimed-diligence-packet-manifest.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Approval-Authority": "external-review-required",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Diligence-Packet-Manifest": diligencePacketManifestStatus,
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Public-Distribution-Authority": "not-authorized",
      "X-SCRIMED-Release-Authority": "not-release-approval",
      "X-SCRIMED-Security-Certification": "not-security-certified",
      "X-SCRIMED-Token-Handling": "no-token-values-exposed-or-retained"
    }
  });
}
