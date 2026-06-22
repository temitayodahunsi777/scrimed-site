import { NextResponse } from "next/server";
import {
  evaluateQaBuyerProofReleaseCandidate,
  getQaBuyerProofReleaseSummary
} from "../../../lib/qaBuyerProofRelease";

const headers = {
  "X-SCRIMED-AAL2-Execution": "human-required-not-code-bypass",
  "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
  "X-SCRIMED-Data-Boundary": "synthetic-only",
  "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
  "X-SCRIMED-QA-Buyer-Proof-Release": "protected-release-required",
  "X-SCRIMED-QA-Proof": "buyer-proof-release-gated-retained-packet-required",
  "X-SCRIMED-Security-Certification": "not-security-certified"
};

async function requestBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function GET() {
  return NextResponse.json(getQaBuyerProofReleaseSummary(), { headers });
}

export async function POST(request: Request) {
  const result = evaluateQaBuyerProofReleaseCandidate(await requestBody(request));
  const status = result.releaseDecisionState === "blocked-boundary-violation" ? 409 : 200;

  return NextResponse.json(result, { status, headers });
}
