import { NextResponse } from "next/server";
import {
  buildClientOnboardingCommunicationsBrief,
  clientOnboardingCommunicationsBriefStatus
} from "../../../lib/clientOnboardingCommunications";

export async function GET() {
  return new NextResponse(buildClientOnboardingCommunicationsBrief(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Client-Onboarding": clientOnboardingCommunicationsBriefStatus,
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
