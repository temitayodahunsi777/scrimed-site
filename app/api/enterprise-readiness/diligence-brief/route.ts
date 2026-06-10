import { NextResponse } from "next/server";
import { getEnterpriseDiligenceBrief } from "../../../lib/enterpriseReadiness";

export async function GET() {
  return new NextResponse(getEnterpriseDiligenceBrief(), {
    headers: {
      "Content-Disposition": "attachment; filename=\"scrimed-enterprise-diligence-brief.md\"",
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
