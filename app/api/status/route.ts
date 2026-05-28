import { NextResponse } from "next/server";

const modules = [
  { name: "Clinical Copilot", phase: "staged", status: "design" },
  { name: "DocuTwin", phase: "staged", status: "design" },
  { name: "CarePath AI", phase: "staged", status: "design" },
  { name: "TrialCore", phase: "staged", status: "design" },
  { name: "Watchtower", phase: "foundation", status: "active-concept" }
];

export async function GET() {
  return NextResponse.json({
    service: "scrimed-site",
    status: "ready",
    baseline: "nextjs-app-router",
    modules,
    updated: "2026-05-28"
  });
}
