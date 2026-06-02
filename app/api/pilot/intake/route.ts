import { NextResponse } from "next/server";
import {
  buildPilotIntakeAssessment,
  buildPilotIntakeHandoffPayload,
  getPilotIntakeSummary,
  validatePilotIntakePayload,
  type PilotIntakeHandoffPayload
} from "../../../lib/pilotIntake";

export const dynamic = "force-dynamic";

type HandoffResult = {
  mode: "webhook" | "manual-crm-handoff";
  status: "routed" | "pending-configuration" | "failed";
  destination: string;
  detail: string;
};

export async function GET() {
  return NextResponse.json(getPilotIntakeSummary());
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (contentLength > 25000) {
    return NextResponse.json(
      {
        error: {
          code: "payload-too-large",
          message: "Pilot intake payload is too large. Submit workflow-scope information only."
        }
      },
      { status: 413 }
    );
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      {
        error: {
          code: "unsupported-content-type",
          message: "Submit pilot intake as application/json."
        }
      },
      { status: 415 }
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "invalid-json",
          message: "Request body must be valid JSON."
        }
      },
      { status: 400 }
    );
  }

  const validation = validatePilotIntakePayload(payload);

  if (!validation.ok) {
    return NextResponse.json(
      {
        error: {
          code: "invalid-pilot-intake",
          message: "Pilot intake requires complete business-contact, workflow-scope, and governance-boundary data.",
          fields: validation.errors
        }
      },
      { status: 400 }
    );
  }

  const receivedAt = new Date().toISOString();
  const intakeId = createPilotIntakeId(receivedAt);
  const assessment = buildPilotIntakeAssessment(validation.submission);
  const handoffPayload = buildPilotIntakeHandoffPayload(
    intakeId,
    receivedAt,
    validation.submission,
    assessment
  );
  const handoff = await routePilotIntake(handoffPayload);
  const accepted = handoff.status !== "failed";

  return NextResponse.json(
    {
      service: "scrimed-pilot-intake",
      status: accepted ? "accepted" : "handoff-failed",
      intakeId,
      receivedAt,
      boundary: handoffPayload.boundary,
      assessment,
      handoff,
      nextActions: [
        "Review the packaged scope with the enterprise buyer.",
        "Confirm no-PHI synthetic fixture boundaries and pilot sponsor.",
        "Define pilot metrics, workflow owners, governance gates, and CRM follow-up owner."
      ]
    },
    { status: accepted ? 202 : 502 }
  );
}

async function routePilotIntake(payload: PilotIntakeHandoffPayload): Promise<HandoffResult> {
  const webhookUrl = process.env.SCRIMED_PILOT_INTAKE_WEBHOOK_URL;

  if (!webhookUrl) {
    return {
      mode: "manual-crm-handoff",
      status: "pending-configuration",
      destination: "manual CRM handoff",
      detail:
        "No SCRIMED_PILOT_INTAKE_WEBHOOK_URL is configured. Intake was validated and packaged for secure manual HubSpot, Wix, or CRM entry."
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.SCRIMED_PILOT_INTAKE_WEBHOOK_TOKEN
          ? { Authorization: `Bearer ${process.env.SCRIMED_PILOT_INTAKE_WEBHOOK_TOKEN}` }
          : {})
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!response.ok) {
      return {
        mode: "webhook",
        status: "failed",
        destination: "configured CRM webhook",
        detail: `Configured CRM webhook returned ${response.status}.`
      };
    }

    return {
      mode: "webhook",
      status: "routed",
      destination: "configured CRM webhook",
      detail: "Validated intake was routed to the configured HubSpot, Wix, or CRM webhook."
    };
  } catch {
    return {
      mode: "webhook",
      status: "failed",
      destination: "configured CRM webhook",
      detail: "Configured CRM webhook did not accept the intake within the routing timeout."
    };
  } finally {
    clearTimeout(timeout);
  }
}

function createPilotIntakeId(receivedAt: string) {
  const compactTimestamp = receivedAt.replace(/[-:.TZ]/g, "").slice(0, 14);
  const randomSuffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);

  return `SCRIMED-PILOT-${compactTimestamp}-${randomSuffix.toUpperCase()}`;
}
