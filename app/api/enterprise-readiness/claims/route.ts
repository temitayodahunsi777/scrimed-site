import { NextResponse } from "next/server";
import { getClaimsRegister } from "../../../lib/enterpriseReadiness";

export async function GET() {
  return NextResponse.json({
    service: "scrimed-public-claims-register",
    boundary:
      "Claims are approved only for the current governed synthetic evaluation boundary unless a dated evidence and approval record says otherwise.",
    claims: getClaimsRegister()
  });
}
