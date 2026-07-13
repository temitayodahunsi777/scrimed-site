import { NextResponse } from "next/server";
import {
  buildScrimedHybridRetrievalBrief,
  scrimedHybridRetrievalBriefRoute,
  scrimedHybridRetrievalStatus
} from "../../../lib/scrimedHybridRetrieval";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedHybridRetrievalBriefRoute,
    requestedAction: "scrimed hybrid retrieval brief synthetic metadata internal testing",
    inputText: "synthetic no-phi retrieval brief evidence citations",
    allowMetadataOnly: true
  });
  const headers = {
    ...scrimedSafetyHeaders(safety),
    "Content-Disposition": "attachment; filename=\"scrimed-hybrid-retrieval.md\"",
    "Content-Type": "text/markdown; charset=utf-8",
    "X-SCRIMED-Code-PT-4": scrimedHybridRetrievalStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-metadata-only"
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-hybrid-retrieval-brief-blocked",
          message: "SCRIMED Hybrid Retrieval brief is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return new NextResponse(buildScrimedHybridRetrievalBrief(), { headers });
}
