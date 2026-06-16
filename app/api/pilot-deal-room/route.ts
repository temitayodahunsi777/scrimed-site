import { NextResponse } from "next/server";
import { getSalesDealRoomSummary, salesDealRoomPublicSummary } from "../../lib/salesDealRoom";

export async function GET() {
  const summary = getSalesDealRoomSummary();

  return NextResponse.json({
    ...summary,
    salesMotion: salesDealRoomPublicSummary.motions
  });
}
