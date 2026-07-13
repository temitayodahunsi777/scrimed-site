import { NextResponse } from "next/server";
import {
  buildScrimedClinicalBenchmarkSuiteBrief,
  scrimedClinicalBenchmarkSuiteBriefRoute,
  scrimedClinicalBenchmarkSuiteStatus
} from "../../../lib/scrimedClinicalBenchmarkSuite";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedClinicalBenchmarkSuiteBriefRoute,
    requestedAction: "scrimed clinical benchmark suite brief synthetic metadata internal testing",
    inputText: "synthetic no-phi benchmark brief",
    allowMetadataOnly: true
  });
  const headers = {
    ...scrimedSafetyHeaders(safety),
    "Content-Disposition": "attachment; filename=\"scrimed-clinical-benchmark-suite.md\"",
    "Content-Type": "text/markdown; charset=utf-8",
    "X-SCRIMED-Code-PT-4": scrimedClinicalBenchmarkSuiteStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-metadata-only"
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-clinical-benchmark-suite-brief-blocked",
          message: "SCRIMED Clinical Benchmark Suite brief is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return new NextResponse(buildScrimedClinicalBenchmarkSuiteBrief(), { headers });
}
