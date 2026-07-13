import { NextResponse } from "next/server";
import {
  evaluateSentinelAgentAction,
  getSentinelEvaluationSamples,
  parseSentinelActionEvaluationRequest,
  sentinelEvaluationRoute,
  scrimedIntelligenceSafetyStackStatus
} from "../../../lib/scrimedIntelligenceSafetyStack";
import { scrimedSafetyHeaders } from "../../../lib/scrimedSafetyGovernance";

export const dynamic = "force-dynamic";

const sentinelEvaluationHeaders = {
  "Cache-Control": "private, no-store",
  "X-SCRIMED-Intelligence-Safety-Stack": scrimedIntelligenceSafetyStackStatus,
  "X-SCRIMED-Project-SENTINEL": "evaluation-only-deny-by-default",
  "X-SCRIMED-Agent-Execution-Authority": "policy-evaluation-only-no-tool-execution",
  "X-SCRIMED-Data-Boundary": "metadata-only-no-phi",
  "X-SCRIMED-Token-Handling": "token-like-fields-rejected",
  ...scrimedSafetyHeaders()
};

export function GET() {
  return NextResponse.json(
    {
      service: "scrimed-sentinel-action-evaluator",
      route: sentinelEvaluationRoute,
      status: "sentinel-evaluation-ready-metadata-only",
      acceptedPayload: {
        requestId: "string",
        agentId: "known Sentinel agent id",
        actionType: "known Sentinel action enum",
        requestedTool: "known Sentinel tool scope",
        dataClassification: "synthetic_metadata | public_reference | deidentified_preview | phi_blocked",
        humanApprovalTokenPresent: "boolean metadata only; never paste a token",
        retryCount: "integer 0-50",
        abnormalPatternDetected: "boolean"
      },
      rejectedPayloads: [
        "token-like fields",
        "secret-like fields",
        "unknown agents",
        "unknown actions",
        "unknown tool scopes",
        "unknown data classifications",
        "raw PHI",
        "raw connector payloads"
      ],
      possibleDecisions: ["allow", "deny", "human_approval_required", "kill_switch_triggered"],
      sampleCount: getSentinelEvaluationSamples().length,
      samples: getSentinelEvaluationSamples().map((sample) => {
        const parsed = parseSentinelActionEvaluationRequest(sample);
        return parsed.ok ? evaluateSentinelAgentAction(parsed.request) : parsed;
      }),
      no_tool_execution_performed: true,
      no_external_call_performed: true,
      no_phi_confirmed: true
    },
    { headers: sentinelEvaluationHeaders }
  );
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "invalid-sentinel-evaluation-request",
        reason: "Request body must be valid JSON.",
        route: sentinelEvaluationRoute,
        no_tool_execution_performed: true,
        no_external_call_performed: true
      },
      { status: 400, headers: sentinelEvaluationHeaders }
    );
  }

  const parsed = parseSentinelActionEvaluationRequest(payload);

  if (!parsed.ok) {
    return NextResponse.json(
      {
        error: "invalid-sentinel-evaluation-request",
        reason: parsed.reason,
        rejected_field: parsed.rejectedField ?? null,
        route: sentinelEvaluationRoute,
        no_tool_execution_performed: true,
        no_external_call_performed: true
      },
      { status: 400, headers: sentinelEvaluationHeaders }
    );
  }

  const event = evaluateSentinelAgentAction(parsed.request);
  const status = event.decision === "allow" ? 200 : event.decision === "human_approval_required" ? 202 : 403;

  return NextResponse.json(
    {
      ...event,
      route: sentinelEvaluationRoute,
      no_tool_execution_performed: true,
      no_external_call_performed: true,
      no_phi_confirmed: parsed.request.dataClassification !== "phi_blocked"
    },
    { status, headers: sentinelEvaluationHeaders }
  );
}
