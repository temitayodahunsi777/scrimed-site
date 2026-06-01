import { NextResponse } from "next/server";
import { getIdentityAccessReadinessSummary } from "../../../lib/identityAccessReadiness";

export async function GET() {
  return NextResponse.json(getIdentityAccessReadinessSummary());
}
