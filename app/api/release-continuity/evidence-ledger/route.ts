import { NextResponse } from "next/server";
import {
  getReleaseEvidenceLedgerSummary,
  releaseEvidenceLedgerStatus
} from "../../../lib/releaseEvidenceLedger";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getReleaseEvidenceLedgerSummary(), {
    headers: {
      "Cache-Control": "no-store",
      "X-SCRIMED-Approval-Authority": "external-review-required",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Release-Authority": "not-release-approval",
      "X-SCRIMED-Release-Evidence-Ledger": releaseEvidenceLedgerStatus,
      "X-SCRIMED-Security-Certification": "not-security-certified",
      "X-SCRIMED-Token-Handling": "no-token-values-exposed-or-retained"
    }
  });
}
