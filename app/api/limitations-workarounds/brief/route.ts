import { NextResponse } from "next/server";
import {
  buildLimitationsWorkaroundBrief,
  limitationsWorkaroundBriefStatus
} from "../../../lib/limitationsWorkaroundOperations";

export async function GET() {
  return new NextResponse(buildLimitationsWorkaroundBrief(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Limitations-Workarounds": limitationsWorkaroundBriefStatus,
      "X-SCRIMED-Limitation-Control": "safe-workaround-operations",
      "X-SCRIMED-Autonomy-Authority": "no-autonomous-production-remediation",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Connector-Authority": "not-production-connector-approved",
      "X-SCRIMED-Data-Boundary": "synthetic-and-metadata-only",
      "X-SCRIMED-Financial-Authority": "not-audited-financial-report",
      "X-SCRIMED-Legal-Authority": "qualified-review-required",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Profit-Authority": "not-profit-margin-guarantee",
      "X-SCRIMED-Quantum-Authority": "internal-research-only-no-public-claim",
      "X-SCRIMED-Release-Authority": "not-release-approval",
      "X-SCRIMED-Revenue-Authority": "not-revenue-guarantee",
      "X-SCRIMED-Security-Certification": "not-security-certified",
      "X-SCRIMED-SLA-Authority": "not-contractual-sla"
    }
  });
}
