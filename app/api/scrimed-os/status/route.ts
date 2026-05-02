import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    system: "SCRIMED OS Hub",
    version: "1.7.1",
    status: "online",
    environment: process.env.VERCEL ? "vercel" : "local",
    modules: {
      commandCenter: "online",
      guardianLayer: "online",
      specToAgent: "online",
      roiEngine: "online",
      trustCore: "online"
    },
    timestamp: new Date().toISOString()
  });
}
