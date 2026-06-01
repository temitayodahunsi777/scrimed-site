import { NextResponse } from "next/server";
import { getAuditPersistenceReadinessSummary } from "../../../lib/auditPersistenceReadiness";

export async function GET() {
  return NextResponse.json(getAuditPersistenceReadinessSummary());
}
