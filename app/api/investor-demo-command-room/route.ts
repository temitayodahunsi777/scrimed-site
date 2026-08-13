import { NextResponse } from "next/server";
import {
  buildInvestorDemoRunOfShow,
  type InvestorDemoMode
} from "../../lib/investorDemoRunOfShow";
import {
  getInvestorDemoCommandRoomSummary,
  getInvestorDemoProofRoutes
} from "../../lib/investorDemoCommandRoom";

const supportedModes = new Set<InvestorDemoMode>([
  "executive-preview",
  "technical-walkthrough",
  "diligence-walkthrough"
]);

const responseHeaders = {
  "Cache-Control": "private, no-store",
  "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
  "X-SCRIMED-Data-Boundary": "synthetic-and-readiness-metadata-only",
  "X-SCRIMED-External-Send": "not-authorized",
  "X-SCRIMED-Investment-Solicitation": "not-authorized",
  "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
  "X-SCRIMED-Production-Connector-Authority":
    "not-production-connector-approved",
  "X-SCRIMED-Production-Release": "not-authorized",
  "X-Robots-Tag": "noindex, nofollow"
};

export async function GET(request: Request) {
  const requestedMode = new URL(request.url).searchParams.get("mode");

  if (requestedMode && !supportedModes.has(requestedMode as InvestorDemoMode)) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "unsupported-investor-demo-mode",
          message:
            "mode must be executive-preview, technical-walkthrough, or diligence-walkthrough",
          retryable: false
        }
      },
      { status: 400, headers: responseHeaders }
    );
  }

  const mode = (requestedMode ?? "executive-preview") as InvestorDemoMode;

  return NextResponse.json(
    {
      ok: true,
      data: {
        summary: getInvestorDemoCommandRoomSummary(),
        plan: buildInvestorDemoRunOfShow(mode),
        requiredProofRoutes: getInvestorDemoProofRoutes(mode)
      }
    },
    { headers: responseHeaders }
  );
}
