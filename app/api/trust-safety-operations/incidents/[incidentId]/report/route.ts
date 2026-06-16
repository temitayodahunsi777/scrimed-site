import { NextResponse } from "next/server";
import {
  buildTrustSafetyIncidentReport,
  getTrustSafetyIncidentById,
  trustSafetyOperationsBoundary
} from "../../../../../lib/trustSafetyOperations";

export const dynamic = "force-dynamic";

const trustSafetyNoStoreHeaders = {
  "Cache-Control": "private, no-store",
  "X-SCRIMED-Data-Boundary": "synthetic-evaluation-and-enterprise-readiness-only",
  "X-SCRIMED-Clinical-Execution": "denied",
  "X-SCRIMED-Legal-Advice": "not-legal-advice"
} as const;

const trustSafetyReportHeaders = {
  ...trustSafetyNoStoreHeaders,
  "Content-Type": "text/markdown; charset=utf-8"
} as const;

type RouteContext = {
  params: Promise<{ incidentId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { incidentId } = await params;
  const incident = getTrustSafetyIncidentById(incidentId);

  if (!incident) {
    return NextResponse.json(
      {
        error: {
          code: "trust-safety-incident-not-found",
          message: "No trust safety incident report is available for this incident ID."
        },
        boundary: trustSafetyOperationsBoundary
      },
      { status: 404, headers: trustSafetyNoStoreHeaders }
    );
  }

  const safeIncidentId = incident.id.replace(/[^a-z0-9-]/gi, "-");
  const report = buildTrustSafetyIncidentReport(incident);

  return new NextResponse(report, {
    headers: {
      ...trustSafetyReportHeaders,
      "Content-Disposition": `attachment; filename="scrimed-${safeIncidentId}-trust-safety-incident-report.md"`,
      "X-SCRIMED-Incident-Severity": incident.severity,
      "X-SCRIMED-Incident-Status": incident.status
    }
  });
}
