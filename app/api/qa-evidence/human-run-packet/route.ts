import { NextResponse } from "next/server";
import {
  evaluateQaHumanRunPacketCandidate,
  getQaHumanRunPacketSummary
} from "../../../lib/qaHumanRunPacket";

const headers = {
  "Cache-Control": "no-store",
  "X-SCRIMED-AAL2-Execution": "human-required-not-code-bypass",
  "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
  "X-SCRIMED-Data-Boundary": "synthetic-only",
  "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
  "X-SCRIMED-QA-Human-Run-Packet": "dispatch-ready-human-aal2-required",
  "X-SCRIMED-QA-Proof": "dispatch-ready-not-retained-proof",
  "X-SCRIMED-Security-Certification": "not-security-certified"
};

export async function GET() {
  return NextResponse.json(getQaHumanRunPacketSummary(), { headers });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        service: "scrimed-qa-human-run-packet",
        status: "invalid-json",
        decisionState: "candidate-dispatch-rejected",
        executionAllowedByCode: false,
        humanAal2Required: true,
        proofClaimAllowed: false,
        buyerUseAllowed: false,
        errors: ["Body must be valid JSON."]
      },
      { status: 400, headers }
    );
  }

  const result = evaluateQaHumanRunPacketCandidate(body);

  return NextResponse.json(result, {
    status: result.decisionState === "candidate-dispatch-rejected" ? 400 : 200,
    headers
  });
}
