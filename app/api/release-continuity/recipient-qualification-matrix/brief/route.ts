import { NextResponse } from "next/server";
import {
  buildRecipientQualificationMatrixBrief,
  recipientQualificationMatrixStatus
} from "../../../../lib/recipientQualificationMatrix";

export const dynamic = "force-dynamic";

export async function GET() {
  return new NextResponse(buildRecipientQualificationMatrixBrief(), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": "attachment; filename=\"scrimed-recipient-qualification-matrix.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Approval-Authority": "external-review-required",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-and-metadata-only",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Public-Distribution-Authority": "not-authorized",
      "X-SCRIMED-Recipient-Identifier-Storage": "not-stored-in-scrimed",
      "X-SCRIMED-Recipient-Qualification": recipientQualificationMatrixStatus,
      "X-SCRIMED-Release-Authority": "not-release-approval",
      "X-SCRIMED-Security-Certification": "not-security-certified",
      "X-SCRIMED-Token-Handling": "no-token-values-exposed-or-retained"
    }
  });
}
