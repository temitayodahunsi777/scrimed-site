import { NextResponse } from "next/server";
import { getWorkflowPromotionReviewSummary } from "../../../lib/workflowPromotionReviews";

export async function GET() {
  return NextResponse.json(getWorkflowPromotionReviewSummary());
}
