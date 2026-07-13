import { NextResponse } from "next/server";
import { getServiceDeliverySummary } from "../../lib/serviceDelivery";

export async function GET() {
  return NextResponse.json(getServiceDeliverySummary(), {
    headers: {
      "X-SCRIMED-Service-Delivery": "service-delivery-workbench-active",
      "X-SCRIMED-Accounting-Authority": "qualified-accounting-review-required",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Connector-Authority": "not-production-connector-approved",
      "X-SCRIMED-Contract-Authority": "not-contract-approval",
      "X-SCRIMED-Customer-Permission": "not-customer-permission",
      "X-SCRIMED-Data-Boundary": "synthetic-business-and-metadata-only",
      "X-SCRIMED-Financial-Authority": "not-audited-financial-report",
      "X-SCRIMED-Legal-Authority": "qualified-review-required",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Profit-Authority": "not-profit-margin-guarantee",
      "X-SCRIMED-Reimbursement-Authority": "no-reimbursement-guarantee",
      "X-SCRIMED-Revenue-Authority": "not-revenue-guarantee",
      "X-SCRIMED-Security-Certification": "not-security-certified",
      "X-SCRIMED-SLA-Authority": "not-contractual-sla",
      "X-SCRIMED-Tax-Authority": "qualified-tax-review-required"
    }
  });
}
