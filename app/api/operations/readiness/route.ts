import { NextResponse } from "next/server";
import { getCompanyOperationsSummary } from "../../../lib/companyOperations";

export async function GET() {
  return NextResponse.json(getCompanyOperationsSummary());
}
