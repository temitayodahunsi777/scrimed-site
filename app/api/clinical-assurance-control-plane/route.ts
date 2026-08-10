import { NextResponse } from "next/server";

import {
  clinicalAssuranceScenarioIds,
  getClinicalAssuranceControlPlaneSummary,
  runClinicalAssuranceScenario,
  type ClinicalAssuranceScenarioId
} from "../../lib/clinicalAssuranceControlPlane";
import { getScrimedWorkFeatureFlags } from "../../lib/scrimed-work/featureFlags";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../lib/scrimedSafetyGovernance";

export const dynamic = "force-dynamic";

const route = "/api/clinical-assurance-control-plane";

function routeHeaders() {
  const safety = evaluateScrimedSafetyGate({
    route,
    requestedAction: "synthetic metadata clinical assurance preflight policy capacity concentration and failover drill",
    inputText: "no phi no provider call no clinical action no external mutation human review required",
    allowMetadataOnly: true
  });

  return {
    safety,
    headers: {
      "Cache-Control": "private, no-store",
      "X-SCRIMED-Clinical-Assurance": "synthetic-metadata-only",
      "X-SCRIMED-External-Provider-Calls": "disabled",
      "X-SCRIMED-Human-Review": "required",
      ...scrimedSafetyHeaders(safety)
    }
  };
}

export function GET() {
  const { safety, headers } = routeHeaders();
  if (!safety.allowed) {
    return NextResponse.json(
      { error: { code: "clinical-assurance-safety-blocked", message: "Clinical assurance metadata is blocked by safety policy." } },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getClinicalAssuranceControlPlaneSummary(), { headers });
}

export async function POST(request: Request) {
  const { safety, headers } = routeHeaders();
  const flags = getScrimedWorkFeatureFlags();
  if (!safety.allowed || !flags.clinicalAssuranceControlPlaneEnabled) {
    return NextResponse.json(
      {
        error: {
          code: "clinical-assurance-control-plane-disabled",
          message: "Clinical assurance scenario evaluation is unavailable or disabled by policy."
        }
      },
      { status: 503, headers }
    );
  }

  if (!(request.headers.get("content-type") ?? "").includes("application/json")) {
    return NextResponse.json(
      { error: { code: "unsupported-content-type", message: "Use application/json with an enumerated scenario." } },
      { status: 415, headers }
    );
  }

  const body = await request.text();
  if (body.length > 500) {
    return NextResponse.json(
      { error: { code: "payload-too-large", message: "Only a concise enumerated scenario is accepted." } },
      { status: 413, headers }
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return NextResponse.json(
      { error: { code: "invalid-json", message: "The scenario request must be valid JSON." } },
      { status: 400, headers }
    );
  }

  const scenario =
    parsed && typeof parsed === "object" && !Array.isArray(parsed) && "scenario" in parsed
      ? (parsed as { scenario?: unknown }).scenario
      : null;
  if (typeof scenario !== "string" || !clinicalAssuranceScenarioIds.includes(scenario as ClinicalAssuranceScenarioId)) {
    return NextResponse.json(
      {
        error: {
          code: "invalid-clinical-assurance-scenario",
          message: "Select one registered synthetic clinical-assurance scenario.",
          allowedScenarios: clinicalAssuranceScenarioIds
        }
      },
      { status: 422, headers }
    );
  }

  return NextResponse.json(runClinicalAssuranceScenario(scenario as ClinicalAssuranceScenarioId), { headers });
}
