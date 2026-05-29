import { NextResponse } from "next/server";

const modules = [
  { name: "Clinical Copilot", phase: "staged", status: "design", route: "/modules/clinical-copilot" },
  { name: "DocuTwin", phase: "staged", status: "design", route: "/modules/docutwin" },
  { name: "CarePath AI", phase: "staged", status: "design", route: "/modules/carepath-ai" },
  { name: "TrialCore", phase: "staged", status: "design", route: "/modules/trialcore" },
  { name: "Watchtower", phase: "foundation", status: "active-concept", route: "/modules/watchtower" }
];

const routes = [
  "/",
  "/platform",
  "/trust",
  "/modules/clinical-copilot",
  "/modules/docutwin",
  "/modules/carepath-ai",
  "/modules/trialcore",
  "/modules/watchtower",
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
