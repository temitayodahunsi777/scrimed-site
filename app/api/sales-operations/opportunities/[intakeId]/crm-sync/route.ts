import { NextResponse } from "next/server";
import { getAuthenticatedSalesContext } from "../../../../../lib/protectedPilotStore";
import {
  buildCrmOpportunityPayload,
  salesOperationsBoundary,
  salesOperationsNoStoreHeaders
} from "../../../../../lib/salesOperations";
import {
  getSalesOpportunity,
  recordSalesCrmSync
} from "../../../../../lib/salesOperationsStore";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ intakeId: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "sales-opportunity-crm-sync",
    limit: 30,
    windowSeconds: 600
  });
  const headers = { ...salesOperationsNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: { code: "rate-limit-exceeded", message: "CRM synchronization is temporarily rate limited." } },
      { status: 429, headers }
    );
  }

  const context = await getAuthenticatedSalesContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: salesOperationsBoundary },
      { status: context.status, headers }
    );
  }

  const { intakeId } = await params;
  const result = await getSalesOpportunity(context.client, intakeId);

  if (result.error || !result.opportunity) {
    return NextResponse.json(
      { error: { code: "sales-opportunity-not-found", message: "No tenant-scoped opportunity is available for this ID." } },
      { status: result.error?.message.includes("sales-operations-admin-required") ? 403 : 404, headers }
    );
  }

  const webhookUrl = process.env.SCRIMED_PILOT_INTAKE_WEBHOOK_URL;

  if (!webhookUrl) {
    const audit = await recordSalesCrmSync(
      context.client,
      intakeId,
      "not-configured",
      "CRM webhook activation is required before sales opportunity synchronization."
    );

    if (audit.error) {
      return NextResponse.json(
        {
          error: {
            code: "crm-sync-audit-failed",
            message: "CRM is not configured and the required append-only outcome event could not be committed."
          }
        },
        { status: 502, headers }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "crm-webhook-not-configured",
          message: "The opportunity remains durably retained. Configure the approved CRM webhook before synchronization."
        },
        boundary: salesOperationsBoundary
      },
      { status: 409, headers }
    );
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
      body: JSON.stringify(buildCrmOpportunityPayload(result.opportunity)),
      signal: controller.signal
    });

    if (!response.ok) {
      const audit = await recordSalesCrmSync(context.client, intakeId, "failed", `Configured CRM webhook returned ${response.status}.`);
      return NextResponse.json(
        {
          error: {
            code: audit.error ? "crm-sync-and-audit-failed" : "crm-sync-failed",
            message: audit.error
              ? "The CRM destination did not accept the opportunity and the append-only failure event could not be committed."
              : "The configured CRM destination did not accept the opportunity."
          }
        },
        { status: 502, headers }
      );
    }

    const audit = await recordSalesCrmSync(context.client, intakeId, "synced", "Configured CRM webhook accepted the opportunity.");

    if (audit.error) {
      return NextResponse.json(
        {
          error: {
            code: "crm-sync-audit-failed",
            message: "The configured CRM accepted the opportunity, but the required append-only outcome event could not be committed."
          }
        },
        { status: 502, headers }
      );
    }

    return NextResponse.json(
      {
        service: "scrimed-sales-operations",
        status: "crm-synced",
        boundary: salesOperationsBoundary
      },
      { headers }
    );
  } catch {
    const audit = await recordSalesCrmSync(context.client, intakeId, "failed", "Configured CRM webhook did not respond within the routing timeout.");
    return NextResponse.json(
      {
        error: {
          code: audit.error ? "crm-sync-and-audit-failed" : "crm-sync-failed",
          message: audit.error
            ? "The CRM destination timed out and the append-only failure event could not be committed."
            : "The configured CRM destination did not respond within the routing timeout."
        }
      },
      { status: 502, headers }
    );
  } finally {
    clearTimeout(timeout);
  }
}
