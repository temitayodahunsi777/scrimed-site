import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    events: [
      {
        id: "scrimed-os-v171",
        type: "system_upgrade",
        title: "SCRIMED OS Hub v1.7.1 stabilized for Vercel",
        severity: "info",
        timestamp: new Date().toISOString()
      },
      {
        id: "guardian-layer-active",
        type: "governance",
        title: "Guardian Layer active for safety and compliance routing",
        severity: "success",
        timestamp: new Date().toISOString()
      },
      {
        id: "roi-engine-active",
        type: "business",
        title: "ROI Engine active for investor and client value visibility",
        severity: "success",
        timestamp: new Date().toISOString()
      }
    ]
  });
}
