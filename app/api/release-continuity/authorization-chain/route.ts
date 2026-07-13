import { NextResponse } from "next/server";
import {
  getReleaseAuthorizationChainSummary,
  releaseAuthorizationChainStatus
} from "../../../lib/releaseAuthorizationChain";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getReleaseAuthorizationChainSummary(), {
    headers: {
      "Cache-Control": "no-store",
      "X-SCRIMED-Authorization-Chain": releaseAuthorizationChainStatus,
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Customer-Specific-Authority": "not-authorized-without-customer-permission",
      "X-SCRIMED-Data-Boundary": "synthetic-and-metadata-only",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Public-Distribution-Authority": "not-authorized",
      "X-SCRIMED-Release-Authority": "not-release-approval",
      "X-SCRIMED-Security-Certification": "not-security-certified",
      "X-SCRIMED-Token-Handling": "no-token-values-exposed-or-retained"
    }
  });
}
