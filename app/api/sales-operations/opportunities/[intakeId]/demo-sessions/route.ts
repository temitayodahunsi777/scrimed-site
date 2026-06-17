import { NextResponse } from "next/server";
import {
  buildBuyerDemoExecutionPath,
  buyerDemoExecutionPathBoundary
} from "../../../../../lib/buyerDemoExecutionPath";
import {
  buildBuyerDemoSessionPayload,
  buyerDemoSessionBoundary,
  containsProhibitedDemoSessionText,
  type SalesBuyerDemoSessionInput
} from "../../../../../lib/buyerDemoSessions";
import { getAuthenticatedSalesContext } from "../../../../../lib/protectedPilotStore";
import {
  salesOperationsBoundary,
  salesOperationsNoStoreHeaders,
  type SalesAuditEvent,
  type SalesOpportunity
} from "../../../../../lib/salesOperations";
import {
  getSalesOperationsDashboard,
  getSalesOpportunity,
  listSalesBuyerDemoSessions,
  recordSalesBuyerDemoSession
} from "../../../../../lib/salesOperationsStore";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ intakeId: string }>;
};

type LoadPathResult =
  | { response: NextResponse }
  | {
      opportunity: SalesOpportunity;
      auditEvents: SalesAuditEvent[];
      path: ReturnType<typeof buildBuyerDemoExecutionPath>;
    };

function appBaseUrl(request: Request) {
  return process.env.SCRIMED_APP_BASE_URL ?? new URL(request.url).origin;
}

async function requestBody(request: Request): Promise<SalesBuyerDemoSessionInput> {
  try {
    const body = (await request.json()) as SalesBuyerDemoSessionInput;
    return body && typeof body === "object" ? body : {};
  } catch {
    return {};
  }
}

function queryStatus(message?: string) {
  if (!message) return 502;
  if (message.includes("sales-operations-admin-required")) return 403;
  if (message.includes("mfa-required")) return 403;
  if (message.includes("sales-opportunity-not-found")) return 404;
  return 502;
}

function mutationStatus(message?: string) {
  if (!message) return 502;
  if (message.includes("prohibited-data")) return 400;
  if (message.includes("invalid")) return 400;
  if (message.includes("closed-lost")) return 409;
  if (message.includes("sales-operations-admin-required")) return 403;
  if (message.includes("mfa-required")) return 403;
  if (message.includes("sales-opportunity-not-found")) return 404;
  return 502;
}

async function loadPath(
  request: Request,
  context: Awaited<ReturnType<typeof getAuthenticatedSalesContext>>,
  intakeId: string
): Promise<LoadPathResult> {
  if (!context.ok) {
    return {
      response: NextResponse.json(
        { error: { code: context.code, message: context.message }, boundary: salesOperationsBoundary },
        { status: context.status, headers: salesOperationsNoStoreHeaders }
      )
    };
  }

  const [opportunityResult, dashboardResult] = await Promise.all([
    getSalesOpportunity(context.client, intakeId),
    getSalesOperationsDashboard(context.client)
  ]);

  if (opportunityResult.error || !opportunityResult.opportunity) {
    return {
      response: NextResponse.json(
        {
          error: {
            code: "sales-opportunity-not-found",
            message: "No tenant-scoped opportunity is available for this ID."
          },
          boundary: buyerDemoExecutionPathBoundary
        },
        {
          status: queryStatus(opportunityResult.error?.message),
          headers: salesOperationsNoStoreHeaders
        }
      )
    };
  }

  if (dashboardResult.error || !dashboardResult.dashboard) {
    return {
      response: NextResponse.json(
        {
          error: {
            code: "sales-demo-session-dashboard-unavailable",
            message: "Buyer demo sessions could not be loaded because the tenant dashboard was unavailable."
          },
          boundary: buyerDemoSessionBoundary
        },
        { status: 502, headers: salesOperationsNoStoreHeaders }
      )
    };
  }

  const opportunityAuditEvents = dashboardResult.dashboard.auditEvents.filter(
    (event) => event.intakeId === intakeId
  );
  const path = buildBuyerDemoExecutionPath({
    opportunity: opportunityResult.opportunity,
    auditEvents: opportunityAuditEvents,
    appBaseUrl: appBaseUrl(request)
  });

  return {
    opportunity: opportunityResult.opportunity,
    auditEvents: opportunityAuditEvents,
    path
  };
}

export async function GET(request: Request, { params }: RouteContext) {
  const context = await getAuthenticatedSalesContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: salesOperationsBoundary },
      { status: context.status, headers: salesOperationsNoStoreHeaders }
    );
  }

  const { intakeId } = await params;
  const pathResult = await loadPath(request, context, intakeId);

  if ("response" in pathResult) {
    return pathResult.response;
  }

  const sessionsResult = await listSalesBuyerDemoSessions(context.client, intakeId);

  if (sessionsResult.error || !sessionsResult.buyerDemoSessions) {
    return NextResponse.json(
      {
        error: {
          code: "sales-demo-sessions-query-failed",
          message: "Persisted buyer demo sessions could not be retrieved."
        },
        boundary: buyerDemoSessionBoundary
      },
      { status: queryStatus(sessionsResult.error?.message), headers: salesOperationsNoStoreHeaders }
    );
  }

  return NextResponse.json(
    {
      buyerDemoExecutionPath: pathResult.path,
      buyerDemoSessions: sessionsResult.buyerDemoSessions,
      boundary: buyerDemoSessionBoundary
    },
    {
      headers: {
        ...salesOperationsNoStoreHeaders,
        "X-SCRIMED-Demo-Session-History": "aal2-private-rpc-no-phi"
      }
    }
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  const context = await getAuthenticatedSalesContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: salesOperationsBoundary },
      { status: context.status, headers: salesOperationsNoStoreHeaders }
    );
  }

  const { intakeId } = await params;
  const body = await requestBody(request);

  if (containsProhibitedDemoSessionText(body)) {
    return NextResponse.json(
      {
        error: {
          code: "sales-demo-session-prohibited-data",
          message:
            "Demo sessions cannot store PHI, patient identifiers, live clinical records, payer member data, diagnosis details, or medical-record excerpts."
        },
        boundary: buyerDemoSessionBoundary
      },
      { status: 400, headers: salesOperationsNoStoreHeaders }
    );
  }

  const pathResult = await loadPath(request, context, intakeId);

  if ("response" in pathResult) {
    return pathResult.response;
  }

  const payload = buildBuyerDemoSessionPayload({
    path: pathResult.path,
    input: body
  });
  const result = await recordSalesBuyerDemoSession(context.client, intakeId, payload);

  if (result.error || !result.result) {
    return NextResponse.json(
      {
        error: {
          code: "sales-demo-session-record-failed",
          message:
            result.error?.message.includes("prohibited-data")
              ? "The demo session was rejected because it appears to include prohibited clinical, patient, payer, or credential data."
              : "The demo session was not recorded because the guarded database operation failed."
        },
        boundary: buyerDemoSessionBoundary
      },
      {
        status: mutationStatus(result.error?.message),
        headers: salesOperationsNoStoreHeaders
      }
    );
  }

  return NextResponse.json(result.result, {
    headers: {
      ...salesOperationsNoStoreHeaders,
      "X-SCRIMED-Demo-Session-History": "recorded-aal2-private-rpc"
    }
  });
}
