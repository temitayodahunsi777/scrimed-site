import { NextResponse } from "next/server";
import { getProductReadinessBrief } from "../../../lib/productConsole";

export async function GET() {
  return new NextResponse(getProductReadinessBrief(), {
    headers: {
      "Content-Disposition": "attachment; filename=\"scrimed-product-readiness-brief.md\"",
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
