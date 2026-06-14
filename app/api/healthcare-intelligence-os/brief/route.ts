import { NextResponse } from "next/server";
import { buildHealthcareIntelligenceOSBrief } from "../../../lib/healthcareIntelligenceOS";

export async function GET() {
  return new NextResponse(buildHealthcareIntelligenceOSBrief(), {
    headers: {
      "Content-Disposition": "attachment; filename=\"scrimed-healthcare-intelligence-os-brief.md\"",
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
