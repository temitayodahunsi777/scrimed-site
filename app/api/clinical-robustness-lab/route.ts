import { NextResponse } from "next/server";
import {
  clinicalRobustnessLabStatus,
  getClinicalRobustnessLabSummary
} from "../../lib/clinicalRobustnessLab";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: "/api/clinical-robustness-lab",
    requestedAction: "clinical robustness lab synthetic evaluation",
    inputText: "synthetic no-phi clinical robustness lab adversarial evaluation",
    allowMetadataOnly: true
  });
  const headers = {
    ...scrimedSafetyHeaders(safety),
    "X-SCRIMED-Clinical-Robustness-Lab": clinicalRobustnessLabStatus,
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
          code: "clinical-robustness-lab-blocked",
          message: "Clinical Robustness Lab request is blocked by SCRIMED safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getClinicalRobustnessLabSummary(), {
    headers
  });
}
