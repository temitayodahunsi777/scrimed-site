import { NextResponse } from "next/server";
import {
  buildScrimedDynamicContextInjectionBrief,
  scrimedDynamicContextInjectionBriefRoute,
  scrimedDynamicContextInjectionStatus
} from "../../../../lib/scrimedDynamicContextInjection";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedDynamicContextInjectionBriefRoute,
    requestedAction:
      "scrimed dynamic context injection brief synthetic pre-agent-run manifest module skill listing task reminders validators benchmark human review",
    inputText:
      "synthetic no-phi context manifest brief selected modules omitted context validators safety gate nonsecret internal testing",
    allowMetadataOnly: true
  });
  const headers = {
    ...scrimedSafetyHeaders(safety),
    "Content-Disposition": "attachment; filename=\"scrimed-dynamic-context-injection.md\"",
    "Content-Type": "text/markdown; charset=utf-8",
    "X-SCRIMED-Context-Injection": scrimedDynamicContextInjectionStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-only"
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-context-injection-brief-blocked",
          message: "SCRIMED dynamic context injection brief is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return new NextResponse(buildScrimedDynamicContextInjectionBrief(), { headers });
}
