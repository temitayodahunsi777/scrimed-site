import { NextResponse } from "next/server";

const modules = [
  { name: "Clinical Copilot", phase: "staged", status: "design" },
  { name: "DocuTwin", phase: "staged", status: "design" },
  { name: "CarePath AI", phase: "staged", status: "design" },
  { name: "TrialCore", phase: "staged", status: "design" },
  { name: "Watchtower", phase: "foundation", status: "active-concept" }
];

const routes = [
  "/",
  "/platform",
  "/trust",
  "/api/health",
  "/api/status",
  "/api/readiness",
  "/api/events"
];

export async function GET() {
  return NextResponse.json({
    service: "scrimed-site",
    status: "ready",
    baseline: "nextjs-app-router",
    modules,
    routes,
    updated: "2026-05-28"
  });
}
