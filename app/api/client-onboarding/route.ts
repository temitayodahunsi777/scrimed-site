import { NextResponse } from "next/server";
import { getClientOnboardingCommunicationsSummary } from "../../lib/clientOnboardingCommunications";

export async function GET() {
  return NextResponse.json(getClientOnboardingCommunicationsSummary(), {
    headers: {
      "X-SCRIMED-Client-Onboarding": "communications-control-plane-active",
      "X-SCRIMED-Communication-Authority": "templates-only-human-send-required",
      "X-SCRIMED-Calendar-Authority": "calendar-ready-not-invite-created",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Contract-Authority": "not-contract-approval",
      "X-SCRIMED-Data-Boundary": "business-contact-workflow-and-metadata-only",
      "X-SCRIMED-Legal-Authority": "qualified-review-required",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Procurement-Authority": "not-procurement-approval",
      "X-SCRIMED-Revenue-Authority": "not-revenue-guarantee",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
