import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    system: "SCRIMED OS Hub",
    version: "1.7.1",
    status: "ready",
    deployment: "vercel-safe",
    timestamp: new Date().toISOString(),
    modules: [
      "Command Center",
      "Guardian Layer",
      "Spec-to-Agent Engine",
      "ROI Engine",
      "TrustCore",
      "Clinical Ontology"
    ]
  });
}
