import { NextResponse } from "next/server";
import {
  getScrimedWorkProductionHardeningGate,
  scrimedWorkHeaders,
  wrapWorkData
} from "../../../lib/scrimed-work";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    wrapWorkData(getScrimedWorkProductionHardeningGate(), "scrimed-work-production-hardening"),
    {
      headers: scrimedWorkHeaders({
        "X-SCRIMED-Production-Hardening": "operator-gated-no-production-authorization"
      })
    }
  );
}
