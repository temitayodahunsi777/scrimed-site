import { NextResponse } from "next/server";

import {
  guardedReviewProtectedArtifact,
  scrimedWorkArtifactReviewPolicyVersion,
  scrimedWorkHeaders,
  wrapWorkData
} from "../../../../../../../lib/scrimed-work";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string; artifactId: string }> }
) {
  const { sessionId, artifactId } = await params;
  const result = await guardedReviewProtectedArtifact(request, sessionId, artifactId);
  const headers = scrimedWorkHeaders({
    "X-SCRIMED-Artifact-Review": result.allowed
      ? "independent-aal2-review-bound"
      : "fail-closed",
    "X-SCRIMED-Artifact-Review-Policy": scrimedWorkArtifactReviewPolicyVersion,
    "X-SCRIMED-External-Distribution": "not-authorized",
    "X-SCRIMED-Payer-Submission": "not-authorized"
  });

  if (!result.allowed) {
    return NextResponse.json(result.error, { status: result.status, headers });
  }

  return NextResponse.json(wrapWorkData(result.data, result.data.decision.reviewDecisionHash), {
    headers
  });
}
