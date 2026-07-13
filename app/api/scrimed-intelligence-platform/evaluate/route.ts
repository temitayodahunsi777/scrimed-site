import { NextResponse } from "next/server";
import {
  evaluateScrimedIntelligenceRequest,
  getScrimedIntelligenceEvaluationSamples,
  parseScrimedIntelligenceEvaluationRequest,
  scrimedIntelligencePlatformEvaluateRoute,
  scrimedIntelligencePlatformStatus
} from "../../../lib/scrimedIntelligencePlatform";

export const dynamic = "force-dynamic";

const scrimedIntelligencePlatformHeaders = {
  "Cache-Control": "no-store",
  "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
  "X-SCRIMED-Data-Boundary": "synthetic-and-metadata-only",
  "X-SCRIMED-EHR-Writeback": "not-authorized",
  "X-SCRIMED-Imaging-Authority": "not-final-medical-interpretation",
  "X-SCRIMED-Intelligence-Platform": scrimedIntelligencePlatformStatus,
  "X-SCRIMED-Payer-Submission": "not-authorized",
  "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
  "X-SCRIMED-Production-Activation": "not-authorized-customer-go-live",
  "X-SCRIMED-Security-Certification": "not-security-certified",
  "X-SCRIMED-Token-Handling": "no-token-values-exposed-or-retained"
};

export async function GET() {
  const samples = getScrimedIntelligenceEvaluationSamples();

  return NextResponse.json(
    {
      service: "scrimed-intelligence-platform-evaluator",
      route: scrimedIntelligencePlatformEvaluateRoute,
      status: "evaluation-gate-ready-synthetic-only",
      acceptedPayload: "metadata-only",
      rejectedPayloads: [
        "raw clinical notes",
        "live PHI",
        "patient identifiers",
        "connector payloads",
        "tokens or secrets",
        "autonomous clinical or payer actions"
      ],
      sampleCount: samples.length,
      samples: samples.map((sample) => evaluateScrimedIntelligenceRequest(sample)),
      no_external_call_performed: true,
      no_phi_confirmed: true,
      boundary:
        "Evaluation gate validates synthetic metadata only. It does not process live PHI, call external models, diagnose, treat, prescribe, submit payer transactions, write to EHRs, or approve production use."
    },
    {
      headers: scrimedIntelligencePlatformHeaders
    }
  );
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "invalid-intelligence-evaluation-request",
        reason: "Request body must be valid JSON.",
        route: scrimedIntelligencePlatformEvaluateRoute,
        no_external_call_performed: true
      },
      {
        status: 400,
        headers: scrimedIntelligencePlatformHeaders
      }
    );
  }

  const parsed = parseScrimedIntelligenceEvaluationRequest(payload);

  if (!parsed.ok) {
    return NextResponse.json(
      {
        error: "invalid-intelligence-evaluation-request",
        reason: parsed.reason,
        rejected_field: parsed.rejected_field ?? null,
        route: scrimedIntelligencePlatformEvaluateRoute,
        no_external_call_performed: true
      },
      {
        status: 400,
        headers: scrimedIntelligencePlatformHeaders
      }
    );
  }

  const evaluation = evaluateScrimedIntelligenceRequest(parsed.request);

  return NextResponse.json(evaluation, {
    status: evaluation.http_status,
    headers: scrimedIntelligencePlatformHeaders
  });
}
