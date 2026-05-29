import { NextResponse } from "next/server";
import { getSyntheticValidationResults } from "../../../lib/syntheticValidation";

export async function GET() {
  return NextResponse.json(getSyntheticValidationResults());
}
