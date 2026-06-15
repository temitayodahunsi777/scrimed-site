import { NextResponse } from "next/server";
import {
  buildPilotIntakeAssessment,
  buildPilotIntakeHandoffPayload,
  getPilotIntakeSummary,
  validatePilotIntakePayload,
  type PilotIntakeHandoffPayload
} from "../../../lib/pilotIntake";
import { persistPilotIntake, type PilotIntakePersistenceResult } from "../../../lib/pilotIntakeStore";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type HandoffResult = {
  mode: "durable-store" | "durable-store-and-webhook" | "webhook" | "unavailable";
  status: "durably-retained" | "routed-and-retained" | "routed" | "failed";
  destination: string;
  detail: string;
  persistence: PilotIntakePersistenceResult;
};

export async function GET() {
  return NextResponse.json(getPilotIntakeSummary());
}

export async function POST(request: Request) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "public-pilot-intake",
    limit: 5,
    windowSeconds: 600
  });
  const headers = rateLimitHeaders(rateLimit);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Pilot intake is temporarily rate limited. Retry after the current intake window."
        }
      },
      { status: 429, headers }
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (contentLength > 25000) {
    return NextResponse.json(
      {
        error: {
          code: "payload-too-large",
          message: "Pilot intake payload is too large. Submit workflow-scope information only."
        }
      },
      { status: 413, headers }
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
      { status: 415, headers }
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
      { status: 400, headers }
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
      { status: 400, headers }
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
        `Attach ${assessment.governanceWorkflowPack.name} to sales operations and protected workspace activation planning.`,
        "Confirm no-PHI synthetic fixture boundaries and pilot sponsor.",
        "Define pilot metrics, workflow owners, governance gates, customer inputs, and CRM follow-up owner."
      ]
    },
    { status: accepted ? 202 : 502, headers }
  );
}

async function routePilotIntake(payload: PilotIntakeHandoffPayload): Promise<HandoffResult> {
  const persistence = await persistPilotIntake(payload);
  const webhookUrl = process.env.SCRIMED_PILOT_INTAKE_WEBHOOK_URL;

  if (!webhookUrl) {
    if (!persistence.retained) {
      return {
        mode: "unavailable",
        status: "failed",
        destination: "durable enterprise intake ledger",
        detail:
          "The intake was validated but could not be durably retained. SCRIMED did not report it as accepted.",
        persistence
      };
    }

    return {
      mode: "durable-store",
      status: "durably-retained",
      destination: "private enterprise intake ledger",
      detail:
        "Validated no-PHI intake was durably retained for controlled SCRIMED review and CRM follow-up.",
      persistence
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
      if (persistence.retained) {
        return {
          mode: "durable-store",
          status: "durably-retained",
          destination: "private enterprise intake ledger",
          detail: `Intake was retained, but the configured CRM webhook returned ${response.status}.`,
          persistence
        };
      }

      return {
        mode: "unavailable",
        status: "failed",
        destination: "durable enterprise intake ledger and configured CRM webhook",
        detail: `Neither durable storage nor the configured CRM webhook accepted the intake. Webhook returned ${response.status}.`,
        persistence
      };
    }

    return {
      mode: persistence.retained ? "durable-store-and-webhook" : "webhook",
      status: persistence.retained ? "routed-and-retained" : "routed",
      destination: persistence.retained
        ? "private enterprise intake ledger and configured CRM webhook"
        : "configured CRM webhook",
      detail: persistence.retained
        ? "Validated intake was durably retained and routed to the configured CRM webhook."
        : "Validated intake was routed to the configured CRM webhook; durable ledger retention was unavailable.",
      persistence
    };
  } catch {
    if (persistence.retained) {
      return {
        mode: "durable-store",
        status: "durably-retained",
        destination: "private enterprise intake ledger",
        detail: "Intake was retained, but the configured CRM webhook did not respond within the routing timeout.",
        persistence
      };
    }

    return {
      mode: "unavailable",
      status: "failed",
      destination: "durable enterprise intake ledger and configured CRM webhook",
      detail: "Neither durable storage nor the configured CRM webhook accepted the intake within the routing timeout.",
      persistence
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
