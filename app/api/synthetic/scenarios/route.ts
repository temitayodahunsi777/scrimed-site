import { NextResponse } from "next/server";
import { getSyntheticClinicalSummary } from "../../../lib/syntheticClinical";

export async function GET() {
  return NextResponse.json(getSyntheticClinicalSummary());
}
