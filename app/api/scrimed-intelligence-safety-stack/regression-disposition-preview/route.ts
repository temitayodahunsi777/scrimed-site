import { NextResponse } from "next/server";
import {
  buildSentinelRegressionDispositionPreview,
  getSentinelRegressionDispositionPreviewSamples,
  parseSentinelRegressionDispositionPreviewRequest,
  sentinelRegressionDispositionPreviewRoute,
  scrimedIntelligenceSafetyStackStatus
} from "../../../lib/scrimedIntelligenceSafetyStack";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../lib/scrimedSafetyGovernance";

export const dynamic = "force-dynamic";

const safety = evaluateScrimedSafetyGate({
  route: sentinelRegressionDispositionPreviewRoute,
  requestedAction:
    "synthetic metadata-only Project SENTINEL reviewer disposition preview no persistence nonsecret regression metadata validation",
  inputText:
    "no-phi no-secret reviewer disposition preview pass fail needs more evidence no tool execution no external call",
  allowMetadataOnly: true
});

const dispositionPreviewHeaders = {
  "Cache-Control": "private, no-store",
  "X-SCRIMED-Intelligence-Safety-Stack": scrimedIntelligenceSafetyStackStatus,
  "X-SCRIMED-Project-SENTINEL": "regression-disposition-preview-read-only",
  "X-SCRIMED-Agent-Execution-Authority": "disposition-preview-only-no-execution-authority",
  "X-SCRIMED-Protected-Persistence": "blocked-until-aal2-and-boundary-release",
  "X-SCRIMED-Data-Boundary": "synthetic-no-phi-no-secret-metadata-only",
  "X-SCRIMED-Token-Handling": "token-like-fields-rejected",
  ...scrimedSafetyHeaders(safety)
};

export function GET() {
  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "sentinel-regression-disposition-preview-blocked",
          message: "Project SENTINEL disposition preview is blocked by SCRIMED safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers: dispositionPreviewHeaders }
    );
  }

  return NextResponse.json(
    {
      service: "scrimed-sentinel-regression-disposition-preview",
      route: sentinelRegressionDispositionPreviewRoute,
      status: "regression-disposition-preview-ready-metadata-only",
      acceptedPayload: {
        caseId: "known Sentinel regression case id",
        reviewerRole: "case reviewer gate role",
        disposition: "pass | fail | needs_more_evidence",
        notesSummary: "12-280 characters of nonsecret metadata only",
        evidenceRefs: "optional array of up to six short metadata references"
      },
      rejectedPayloads: [
        "token-like fields",
        "secret-like fields",
        "PHI-like notes",
        "unknown case ids",
        "reviewer role mismatches",
        "unsupported dispositions",
        "oversized evidence references"
      ],
      samples: getSentinelRegressionDispositionPreviewSamples(),
      no_persistence_performed: true,
      no_execution_authority: true,
      no_tool_execution_performed: true,
      no_external_call_performed: true,
      no_phi_confirmed: true,
      no_secret_fixture_confirmed: true
    },
    { headers: dispositionPreviewHeaders }
  );
}

export async function POST(request: Request) {
  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: "sentinel-regression-disposition-preview-blocked",
        reason: "SCRIMED safety governance blocked the disposition preview route.",
        route: sentinelRegressionDispositionPreviewRoute
      },
      { status: safety.statusCode, headers: dispositionPreviewHeaders }
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "invalid-sentinel-regression-disposition-preview-request",
        reason: "Request body must be valid JSON.",
        route: sentinelRegressionDispositionPreviewRoute,
        no_persistence_performed: true,
        no_execution_authority: true
      },
      { status: 400, headers: dispositionPreviewHeaders }
    );
  }

  const parsed = parseSentinelRegressionDispositionPreviewRequest(payload);

  if (!parsed.ok) {
    return NextResponse.json(
      {
        error: "invalid-sentinel-regression-disposition-preview-request",
        reason: parsed.reason,
        rejected_field: parsed.rejectedField ?? null,
        route: sentinelRegressionDispositionPreviewRoute,
        no_persistence_performed: true,
        no_execution_authority: true
      },
      { status: 400, headers: dispositionPreviewHeaders }
    );
  }

  const preview = buildSentinelRegressionDispositionPreview(parsed.payload);

  return NextResponse.json(
    {
      ...preview,
      route: sentinelRegressionDispositionPreviewRoute,
      no_tool_execution_performed: true,
      no_external_call_performed: true,
      no_phi_confirmed: true,
      no_secret_fixture_confirmed: true
    },
    { status: 200, headers: dispositionPreviewHeaders }
  );
}
