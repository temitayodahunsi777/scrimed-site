import { NextResponse } from "next/server";
import {
  getScrimedClinicalBenchmarkSuiteSummary,
  scrimedClinicalBenchmarkSuiteApiRoute,
  scrimedClinicalBenchmarkSuiteStatus
} from "../../lib/scrimedClinicalBenchmarkSuite";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedClinicalBenchmarkSuiteApiRoute,
    requestedAction: "scrimed clinical benchmark suite synthetic metadata evaluation internal testing",
    inputText: "synthetic no-phi benchmark rubric reviewer routing evidence quality",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Code-PT-4": scrimedClinicalBenchmarkSuiteStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-metadata-only",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-clinical-benchmark-suite-blocked",
          message: "SCRIMED Clinical Benchmark Suite is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getScrimedClinicalBenchmarkSuiteSummary(), { headers });
}
