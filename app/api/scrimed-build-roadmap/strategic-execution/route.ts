import { NextResponse } from "next/server";
import {
  getScrimedStrategicExecutionLayerSummary,
  scrimedStrategicExecutionApiRoute,
  scrimedStrategicExecutionStatus
} from "../../../lib/scrimedStrategicExecutionLayer";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedStrategicExecutionApiRoute,
    requestedAction:
      "scrimed strategic execution synthetic vector lookup ai usage logging healthcare observability workflow orchestration investor intelligence inference efficiency prescription engagement mlflow evaluation",
    inputText:
      "synthetic no-phi strategic execution stored-vector lookup medlog usage logging observability human approval benchmark internal testing",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Strategic-Execution": scrimedStrategicExecutionStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-only",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-strategic-execution-blocked",
          message: "SCRIMED strategic execution layer is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getScrimedStrategicExecutionLayerSummary(), { headers });
}
