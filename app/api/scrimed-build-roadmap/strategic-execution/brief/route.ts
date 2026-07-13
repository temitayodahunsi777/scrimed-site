import { NextResponse } from "next/server";
import {
  buildScrimedStrategicExecutionBrief,
  scrimedStrategicExecutionBriefRoute,
  scrimedStrategicExecutionStatus
} from "../../../../lib/scrimedStrategicExecutionLayer";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedStrategicExecutionBriefRoute,
    requestedAction:
      "scrimed strategic execution brief synthetic vector lookup ai usage logging healthcare observability workflow orchestration investor intelligence inference efficiency prescription engagement mlflow evaluation",
    inputText:
      "synthetic no-phi strategic execution brief stored-vector lookup medlog usage logging observability human approval benchmark internal testing",
    allowMetadataOnly: true
  });
  const headers = {
    ...scrimedSafetyHeaders(safety),
    "Content-Disposition": "attachment; filename=\"scrimed-strategic-execution-layer.md\"",
    "Content-Type": "text/markdown; charset=utf-8",
    "X-SCRIMED-Strategic-Execution": scrimedStrategicExecutionStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-only"
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-strategic-execution-brief-blocked",
          message: "SCRIMED strategic execution brief is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return new NextResponse(buildScrimedStrategicExecutionBrief(), { headers });
}
