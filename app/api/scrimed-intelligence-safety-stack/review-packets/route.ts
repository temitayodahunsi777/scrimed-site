import { NextResponse } from "next/server";
import {
  buildSentinelReviewPackets,
  scrimedIntelligenceSafetyStackApiRoute,
  scrimedIntelligenceSafetyStackStatus
} from "../../../lib/scrimedIntelligenceSafetyStack";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../lib/scrimedSafetyGovernance";

export const dynamic = "force-dynamic";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: `${scrimedIntelligenceSafetyStackApiRoute}/review-packets`,
    requestedAction:
      "synthetic metadata-only Project SENTINEL review packets audit preparation internal testing human review queue regression promotion",
    inputText:
      "no-phi metadata-only review packet summary blocked agent actions kill-switch human approval review",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Intelligence-Safety-Stack": scrimedIntelligenceSafetyStackStatus,
    "X-SCRIMED-Project-SENTINEL": "review-packets-read-only",
    "X-SCRIMED-Agent-Execution-Authority": "review-only-no-tool-execution",
    "X-SCRIMED-Protected-Persistence": "blocked-until-aal2-and-boundary-release",
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-metadata-only",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "sentinel-review-packets-blocked",
          message: "Project SENTINEL review packets are blocked by SCRIMED safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  const packets = buildSentinelReviewPackets();

  return NextResponse.json(
    {
      service: "scrimed-sentinel-review-packets",
      status: "review-packets-ready-read-only-metadata",
      packetCount: packets.length,
      regressionCandidateCount: packets.filter((packet) => packet.regressionCandidate).length,
      protectedPersistence: "blocked_until_aal2_and_boundary_release",
      allowedDisposition: ["pass", "fail", "needs_more_evidence"],
      blockedDisposition: [
        "execute production action",
        "bypass human approval",
        "persist protected evidence without AAL2",
        "send external communication",
        "store secrets or PHI"
      ],
      packets,
      no_tool_execution_performed: true,
      no_external_call_performed: true,
      no_phi_confirmed: true
    },
    { headers }
  );
}
