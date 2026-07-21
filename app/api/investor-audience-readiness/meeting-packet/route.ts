import { NextRequest, NextResponse } from "next/server";
import {
  buildStrategicInvestorMeetingBrief,
  getStrategicInvestorMeetingProfile,
  strategicInvestorMeetingProfiles
} from "../../../lib/strategicInvestorOutreach";

const boundaryHeaders = {
  "Cache-Control": "no-store",
  "X-SCRIMED-Approval-Authority": "external-release-review-required",
  "X-SCRIMED-Data-Boundary": "synthetic-and-business-readiness-only",
  "X-SCRIMED-External-Outreach": "not-sent",
  "X-SCRIMED-Fundraising-Release": "not-authorized",
  "X-SCRIMED-Investment-Advice": "not-investment-advice",
  "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
  "X-SCRIMED-Securities-Authority": "not-securities-offering-material",
  "X-SCRIMED-Strategic-Relationship": "not-implied"
};

function safeFilename(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET(request: NextRequest) {
  const targetId = request.nextUrl.searchParams.get("target") ?? "openai";
  const format = request.nextUrl.searchParams.get("format") ?? "json";
  const profile = getStrategicInvestorMeetingProfile(targetId);

  if (!profile) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "strategic_investor_target_not_found",
          message: "The requested strategic investor target is not registered.",
          retryable: false,
          allowedTargets: strategicInvestorMeetingProfiles.map((candidate) => candidate.targetId)
        }
      },
      { status: 400, headers: boundaryHeaders }
    );
  }

  if (format === "markdown") {
    const brief = buildStrategicInvestorMeetingBrief(targetId);

    return new NextResponse(brief, {
      headers: {
        ...boundaryHeaders,
        "Content-Disposition": `attachment; filename="scrimed-${safeFilename(profile.organization)}-meeting-preparation.md"`,
        "Content-Type": "text/markdown; charset=utf-8"
      }
    });
  }

  if (format !== "json") {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "strategic_investor_packet_format_not_supported",
          message: "Use format=json or format=markdown.",
          retryable: false
        }
      },
      { status: 400, headers: boundaryHeaders }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      data: profile,
      meta: {
        generatedAt: new Date().toISOString(),
        externalReleaseAuthorized: false,
        externalOutreachSent: false,
        relationshipImplied: false
      }
    },
    { headers: boundaryHeaders }
  );
}
