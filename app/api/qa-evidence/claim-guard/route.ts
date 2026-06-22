import { NextResponse } from "next/server";
import {
  evaluateQaClaim,
  getQaClaimGuardSummary
} from "../../../lib/qaClaimGuard";

const headers = {
  "X-SCRIMED-AAL2-Execution": "human-required-not-code-bypass",
  "X-SCRIMED-Claim-Authority": "claim-guidance-not-legal-approval",
  "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
  "X-SCRIMED-Data-Boundary": "synthetic-only",
  "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
  "X-SCRIMED-QA-Claim-Guard": "current-state-no-overclaim",
  "X-SCRIMED-QA-Proof": "claim-guard-ready-not-retained-proof",
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
  return NextResponse.json(getQaClaimGuardSummary(), { headers });
}

export async function POST(request: Request) {
  const body = await requestBody(request);
  const evaluation = evaluateQaClaim(body);
  const status = evaluation.decisionState === "blocked-authority-claim" ? 409 : 200;

  return NextResponse.json(evaluation, { status, headers });
}
