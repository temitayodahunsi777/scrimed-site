import { NextResponse } from "next/server";

const checks = [
  { name: "nextjs_baseline", status: "pass", detail: "App Router baseline is present." },
  { name: "health_endpoint", status: "pass", detail: "/api/health is available." },
  { name: "status_endpoint", status: "pass", detail: "/api/status is available." },
  { name: "product_pages", status: "pass", detail: "Platform and trust pages are available." },
  { name: "clinical_integrations", status: "planned", detail: "FHIR, HL7, and clinical data connectors are not active yet." }
];

export async function GET() {
  const passed = checks.filter((check) => check.status === "pass").length;

  return NextResponse.json({
    service: "scrimed-site",
    status: "ready-for-foundation-review",
    score: passed / checks.length,
    checks,
    recommendation: "Continue product surface development before clinical workflow integration.",
    updated: "2026-05-28"
  });
}
