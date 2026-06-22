import { NextResponse } from "next/server";
import { buildQaCompletionBridgeBrief } from "../../../../lib/qaCompletionBridge";

const headers = {
  "Content-Disposition": "attachment; filename=\"scrimed-qa-completion-bridge-brief.md\"",
  "Content-Type": "text/markdown; charset=utf-8",
  "X-SCRIMED-AAL2-Execution": "human-required-not-code-bypass",
  "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
  "X-SCRIMED-Data-Boundary": "synthetic-only",
  "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
  "X-SCRIMED-QA-Completion-Bridge": "no-secret-pre-persistence-validation",
  "X-SCRIMED-QA-Proof": "candidate-ready-not-retained-proof",
  "X-SCRIMED-Security-Certification": "not-security-certified"
};

export async function GET() {
  return new NextResponse(buildQaCompletionBridgeBrief(), { headers });
}
