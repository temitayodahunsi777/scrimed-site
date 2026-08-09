import { NextResponse } from "next/server";
import { getPilotDemoCommercialReadinessSummary } from "../../lib/pilotDemoCommercialReadiness";

export async function GET() {
  return NextResponse.json(getPilotDemoCommercialReadinessSummary(), {
    headers: {
      "X-SCRIMED-Pilot-Demo-Commercial-Readiness": "pilot-demo-commercial-accelerator-active",
      "X-SCRIMED-Demo-Session-Planner": "interactive-synthetic-session-planner-active",
      "X-SCRIMED-Demo-Rehearsal-Gate": "proof-preflight-rehearsal-gate-active",
      "X-SCRIMED-Demo-Proof-Preflight": "same-origin-read-only-operator-triggered",
      "X-SCRIMED-Demo-Protected-Handoff": "aal2-sales-operations-only",
      "X-SCRIMED-Demo-Handoff-Draft": "canonical-metadata-no-automatic-persistence",
      "X-SCRIMED-Demo-Session-Storage": "no-buyer-data-stored",
      "X-SCRIMED-Demo-Session-Send-Authority": "not-authorized-external-send",
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
