import { NextResponse } from "next/server";
import {
  getTrustOpsReviewPacketSummary
} from "../../../../lib/scrimed/trustops-review-packets";
import {
  scrimedTrustOpsApiRoute,
  scrimedTrustOpsStatus
} from "../../../../lib/scrimed/trustops-registry";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../../lib/scrimedSafetyGovernance";

function buildReviewPacketBrief() {
  const summary = getTrustOpsReviewPacketSummary();

  return [
    "# SCRIMED TrustOps Review Packets",
    "",
    `Status: ${summary.status}`,
    `Packet count: ${summary.packetCount}`,
    "",
    "## Durable Store Binding",
    `- Record route: ${summary.durableStoreRoutes.record}`,
    `- Replay route: ${summary.durableStoreRoutes.replay}`,
    `- Review disposition route: ${summary.durableStoreRoutes.reviewDisposition}`,
    `- Boundary: ${summary.persistenceBoundary}`,
    "",
    "## Packets",
    ...summary.packets.map(
      (packet) =>
        `- ${packet.packetId}: ${packet.signalId}; ${packet.recommendation.action}; attempt ${packet.durableEvidenceBinding.attemptId}; status ${packet.durableEvidenceBinding.persistenceStatus}`
    ),
    "",
    "## Validation",
    ...summary.validation.checks.map(
      (check) => `- ${check.passed ? "PASS" : "FAIL"} ${check.check}: ${check.detail}`
    ),
    ""
  ].join("\n");
}

export function GET() {
  const route = `${scrimedTrustOpsApiRoute}/review-packets/brief`;
  const safety = evaluateScrimedSafetyGate({
    route,
    requestedAction: "scrimed trustops review packets brief durable evidence binding",
    inputText: "synthetic no-phi trustops review packet brief durable record replay review disposition recommendation only human review",
    allowMetadataOnly: true
  });
  const headers = {
    ...scrimedSafetyHeaders(safety),
    "Content-Disposition": "attachment; filename=\"scrimed-trustops-review-packets.md\"",
    "Content-Type": "text/markdown; charset=utf-8",
    "X-SCRIMED-TrustOps": scrimedTrustOpsStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-only",
    "X-SCRIMED-TrustOps-Persistence": "aal2-protected-durable-store-ready-not-public-write"
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-trustops-review-packets-brief-blocked",
          message: "SCRIMED TrustOps review packet brief is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return new NextResponse(buildReviewPacketBrief(), { headers });
}
