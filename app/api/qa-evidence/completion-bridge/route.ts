import { NextResponse } from "next/server";
import {
  evaluateQaCompletionBridgeCandidate,
  getQaCompletionBridgeSummary
} from "../../../lib/qaCompletionBridge";

const headers = {
  "X-SCRIMED-AAL2-Execution": "human-required-not-code-bypass",
  "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
  "X-SCRIMED-Data-Boundary": "synthetic-only",
  "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
  "X-SCRIMED-QA-Completion-Bridge": "no-secret-pre-persistence-validation",
  "X-SCRIMED-QA-Proof": "candidate-ready-not-retained-proof",
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
  return NextResponse.json(getQaCompletionBridgeSummary(), { headers });
}

export async function POST(request: Request) {
  const body = await requestBody(request);
  const evaluation = evaluateQaCompletionBridgeCandidate(body);

  return NextResponse.json(evaluation, {
    status: evaluation.candidateValid ? 200 : 400,
    headers
  });
}
