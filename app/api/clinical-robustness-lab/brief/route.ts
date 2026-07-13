import { NextResponse } from "next/server";
import {
  buildClinicalRobustnessLabBrief,
  clinicalRobustnessLabBriefStatus
} from "../../../lib/clinicalRobustnessLab";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: "/api/clinical-robustness-lab/brief",
    requestedAction: "clinical robustness lab brief synthetic evaluation",
    inputText: "synthetic no-phi clinical robustness lab brief",
    allowMetadataOnly: true
  });
  const headers = {
    ...scrimedSafetyHeaders(safety),
    "Content-Type": "text/markdown; charset=utf-8",
    "Content-Disposition": 'attachment; filename="scrimed-clinical-robustness-lab-brief.md"',
    "X-SCRIMED-Clinical-Robustness-Lab": clinicalRobustnessLabBriefStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-only",
    "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
    "X-SCRIMED-Clinical-Authority": "not-authorized-live-care",
    "X-SCRIMED-Autonomous-Clinical-Authority": "not-authorized-autonomous-clinical-action",
    "X-SCRIMED-Certification-Authority": "not-certified-readiness-only",
    "X-SCRIMED-Reviewer-Gate": "human-review-required"
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "clinical-robustness-lab-brief-blocked",
          message: "Clinical Robustness Lab brief request is blocked by SCRIMED safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return new NextResponse(buildClinicalRobustnessLabBrief(), {
    headers
  });
}
