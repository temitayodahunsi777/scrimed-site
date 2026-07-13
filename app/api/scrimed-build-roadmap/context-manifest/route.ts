import { NextResponse } from "next/server";
import {
  getScrimedDynamicContextInjectionSummary,
  scrimedDynamicContextInjectionApiRoute,
  scrimedDynamicContextInjectionStatus
} from "../../../lib/scrimedDynamicContextInjection";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedDynamicContextInjectionApiRoute,
    requestedAction:
      "scrimed dynamic context injection synthetic pre-agent-run manifest module skill listing task reminders validators benchmark human review",
    inputText:
      "synthetic no-phi context manifest selected modules omitted context validators safety gate nonsecret internal testing",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Context-Injection": scrimedDynamicContextInjectionStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-only",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-context-injection-blocked",
          message: "SCRIMED dynamic context injection manifest is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getScrimedDynamicContextInjectionSummary(), { headers });
}
