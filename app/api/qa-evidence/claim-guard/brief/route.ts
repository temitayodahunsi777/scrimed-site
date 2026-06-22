import { NextResponse } from "next/server";
import { buildQaClaimGuardBrief } from "../../../../lib/qaClaimGuard";

const headers = {
  "Content-Disposition": "attachment; filename=\"scrimed-qa-claim-guard-brief.md\"",
  "Content-Type": "text/markdown; charset=utf-8",
  "X-SCRIMED-AAL2-Execution": "human-required-not-code-bypass",
  "X-SCRIMED-Claim-Authority": "claim-guidance-not-legal-approval",
  "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
  "X-SCRIMED-Data-Boundary": "synthetic-only",
  "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
  "X-SCRIMED-QA-Claim-Guard": "current-state-no-overclaim",
  "X-SCRIMED-QA-Proof": "claim-guard-ready-not-retained-proof",
  "X-SCRIMED-Security-Certification": "not-security-certified"
};

export async function GET() {
  return new NextResponse(buildQaClaimGuardBrief(), { headers });
}
