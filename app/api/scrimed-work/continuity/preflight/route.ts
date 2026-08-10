import { NextResponse } from "next/server";

import {
  guardedEvaluateReviewPolicyPreflight,
  scrimedReviewPolicyPreflightVersion,
  scrimedWorkHeaders,
  wrapWorkData
} from "../../../../lib/scrimed-work";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const result = await guardedEvaluateReviewPolicyPreflight(request);
  const headers = scrimedWorkHeaders(
    {
      "X-SCRIMED-Continuity-Preflight": result.allowed
        ? "authenticated-aal2-tenant-scoped-advisory"
        : "fail-closed",
      "X-SCRIMED-Review-Policy": scrimedReviewPolicyPreflightVersion,
      "X-SCRIMED-Approval-Assertions": "caller-supplied-approvals-rejected",
      "X-SCRIMED-Execution-Authority": "not-granted",
      "X-SCRIMED-External-Mutation": "not-authorized",
      "X-SCRIMED-Production-Authority": "not-granted"
    },
    request
  );

  if (!result.allowed) {
    return NextResponse.json(result.error, { status: result.status, headers });
  }

  return NextResponse.json(
    wrapWorkData(result.data, result.data.scopeBindingHash),
    { status: result.status, headers }
  );
}
