import { NextResponse } from "next/server";
import {
  evaluateQaActivationSealCandidate,
  getQaActivationSealSummary
} from "../../../lib/qaActivationSeal";

const headers = {
  "X-SCRIMED-AAL2-Execution": "human-required-not-code-bypass",
  "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
  "X-SCRIMED-Data-Boundary": "synthetic-only",
  "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
  "X-SCRIMED-QA-Activation-Seal": "protected-packet-required",
  "X-SCRIMED-QA-Proof": "activation-seal-ready-not-retained-proof",
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
  return NextResponse.json(getQaActivationSealSummary(), { headers });
}

export async function POST(request: Request) {
  const result = evaluateQaActivationSealCandidate(await requestBody(request));
  const status = result.decisionState === "blocked-boundary-violation" ? 409 : 200;

  return NextResponse.json(result, { status, headers });
}
