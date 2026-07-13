import { NextResponse } from "next/server";
import {
  buildPilotDemoCommercialReadinessBrief,
  pilotDemoCommercialReadinessBriefStatus
} from "../../../lib/pilotDemoCommercialReadiness";

export async function GET() {
  return new NextResponse(buildPilotDemoCommercialReadinessBrief(), {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"scrimed-pilot-demo-commercial-readiness-brief.md\"",
      "X-SCRIMED-Pilot-Demo-Commercial-Readiness": pilotDemoCommercialReadinessBriefStatus,
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Connector-Authority": "not-production-connector-approved",
      "X-SCRIMED-Contract-Authority": "not-contract-approval",
      "X-SCRIMED-Customer-Permission": "not-customer-permission",
      "X-SCRIMED-Data-Boundary": "synthetic-business-and-metadata-only",
      "X-SCRIMED-Financial-Authority": "not-audited-financial-report",
      "X-SCRIMED-Legal-Authority": "qualified-review-required",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Procurement-Authority": "not-procurement-approval",
      "X-SCRIMED-Profit-Authority": "not-profit-margin-guarantee",
      "X-SCRIMED-Quote-Authority": "not-binding-quote",
      "X-SCRIMED-Reimbursement-Authority": "no-reimbursement-guarantee",
      "X-SCRIMED-Revenue-Authority": "not-revenue-guarantee",
      "X-SCRIMED-ROI-Authority": "not-roi-guarantee",
      "X-SCRIMED-Securities-Authority": "not-securities-offering-material",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
