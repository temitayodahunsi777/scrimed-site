import { NextResponse } from "next/server";
import {
  buildBuyerDemoExecutionPath,
  buyerDemoExecutionPathBoundary
} from "../../../../lib/buyerDemoExecutionPath";
import {
  buildBuyerDemoSessionPayload,
  buyerDemoSessionBoundary
} from "../../../../lib/buyerDemoSessions";
import { getAuthenticatedSalesContext } from "../../../../lib/protectedPilotStore";
import {
  buildSalesDemoSessionQaInput,
  salesDemoSessionQaApiRoute,
  salesDemoSessionQaBoundary,
  salesDemoSessionQaControls,
  salesDemoSessionQaProofStackStatus,
  type SalesDemoSessionQaRun
} from "../../../../lib/salesDemoSessionQa";
import {
  salesOperationsBoundary,
  salesOperationsNoStoreHeaders,
  type SalesAuditEvent,
  type SalesOpportunity
} from "../../../../lib/salesOperations";
import {
  getSalesOperationsDashboard,
  getSalesOpportunity,
  listSalesBuyerDemoSessions,
  recordSalesBuyerDemoSession,
  recordSalesBuyerDemoSessionPacketDownload
} from "../../../../lib/salesOperationsStore";

export const dynamic = "force-dynamic";

type RequestBody = {
  intakeId?: unknown;
};

type LoadQaTargetResult =
  | { response: NextResponse }
  | {
      opportunity: SalesOpportunity;
      auditEvents: SalesAuditEvent[];
      existingSessionCount: number;
      path: ReturnType<typeof buildBuyerDemoExecutionPath>;
    };

function appBaseUrl(request: Request) {
  return process.env.SCRIMED_APP_BASE_URL ?? new URL(request.url).origin;
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
  if (message.includes("closed-lost")) return 409;
  if (message.includes("invalid")) return 400;
  if (message.includes("prohibited-data")) return 400;
  if (message.includes("sales-operations-admin-required")) return 403;
  if (message.includes("mfa-required")) return 403;
  if (message.includes("sales-opportunity-not-found")) return 404;
  if (message.includes("sales-demo-session-not-found")) return 404;
  return 502;
}

async function requestBody(request: Request): Promise<RequestBody> {
  try {
    const body = (await request.json()) as RequestBody;
    return body && typeof body === "object" ? body : {};
  } catch {
    return {};
  }
}

function requestedIntakeIdFromUrl(request: Request) {
  const value = new URL(request.url).searchParams.get("intakeId");
  return value?.trim() || "";
}

function requestedIntakeIdFromBody(body: RequestBody) {
  return typeof body.intakeId === "string" ? body.intakeId.trim() : "";
}

async function loadQaTarget(
  request: Request,
  context: Awaited<ReturnType<typeof getAuthenticatedSalesContext>>,
  requestedIntakeId: string
): Promise<LoadQaTargetResult> {
  if (!context.ok) {
    return {
      response: NextResponse.json(
        { error: { code: context.code, message: context.message }, boundary: salesOperationsBoundary },
        { status: context.status, headers: salesOperationsNoStoreHeaders }
      )
    };
  }

  const dashboardResult = await getSalesOperationsDashboard(context.client);

  if (dashboardResult.error || !dashboardResult.dashboard) {
    return {
      response: NextResponse.json(
        {
          error: {
            code: "sales-demo-session-qa-dashboard-unavailable",
            message:
              "The buyer demo session QA harness could not run because the tenant dashboard was unavailable."
          },
          boundary: salesDemoSessionQaBoundary
        },
        { status: queryStatus(dashboardResult.error?.message), headers: salesOperationsNoStoreHeaders }
      )
    };
  }

  let opportunity =
    requestedIntakeId.length > 0
      ? dashboardResult.dashboard.opportunities.find((item) => item.intakeId === requestedIntakeId) ?? null
      : dashboardResult.dashboard.opportunities.find((item) => item.pipelineStage !== "closed-lost") ??
        dashboardResult.dashboard.opportunities[0] ??
        null;

  if (requestedIntakeId.length > 0) {
    const opportunityResult = await getSalesOpportunity(context.client, requestedIntakeId);

    if (opportunityResult.error || !opportunityResult.opportunity) {
      return {
        response: NextResponse.json(
          {
            error: {
              code: "sales-opportunity-not-found",
              message: "No tenant-scoped opportunity is available for this QA target."
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

    opportunity = opportunityResult.opportunity;
  }

  if (!opportunity) {
    return {
      response: NextResponse.json(
        {
          error: {
            code: "sales-demo-session-qa-no-opportunity",
            message:
              "No tenant-scoped sales opportunity is available for buyer demo session QA. Create or retain a synthetic pilot opportunity first."
          },
          boundary: salesDemoSessionQaBoundary
        },
        { status: 404, headers: salesOperationsNoStoreHeaders }
      )
    };
  }

  const sessionsResult = await listSalesBuyerDemoSessions(context.client, opportunity.intakeId);

  if (sessionsResult.error || !sessionsResult.buyerDemoSessions) {
    return {
      response: NextResponse.json(
        {
          error: {
            code: "sales-demo-session-qa-history-unavailable",
            message:
              "The buyer demo session QA harness could not inspect existing session history for this opportunity."
          },
          boundary: buyerDemoSessionBoundary
        },
        { status: queryStatus(sessionsResult.error?.message), headers: salesOperationsNoStoreHeaders }
      )
    };
  }

  const auditEvents = dashboardResult.dashboard.auditEvents.filter(
    (event) => event.intakeId === opportunity.intakeId
  );
  const path = buildBuyerDemoExecutionPath({
    opportunity,
    auditEvents,
    appBaseUrl: appBaseUrl(request)
  });

  return {
    opportunity,
    auditEvents,
    existingSessionCount: sessionsResult.buyerDemoSessions.length,
    path
  };
}

export async function GET(request: Request) {
  const context = await getAuthenticatedSalesContext(request);
  const target = await loadQaTarget(request, context, requestedIntakeIdFromUrl(request));

  if ("response" in target) {
    return target.response;
  }

  return NextResponse.json(
    {
      service: "scrimed-sales-demo-session-qa",
      status:
        target.opportunity.pipelineStage === "closed-lost"
          ? "blocked-closed-lost-opportunity"
          : "ready-for-aal2-operator-run",
      qaHarness: {
        apiRoute: salesDemoSessionQaApiRoute,
        proofStackStatus: salesDemoSessionQaProofStackStatus,
        controls: salesDemoSessionQaControls,
        tokenHandling: "browser AAL2 session or externally supplied short-lived bearer token only",
        existingSessionCount: target.existingSessionCount
      },
      target: {
        intakeId: target.opportunity.intakeId,
        organizationName: target.opportunity.payload.organization.name,
        pipelineStage: target.opportunity.pipelineStage,
        pathStatus: target.path.status,
        readinessScore: target.path.readinessScore,
        selectedPacketRouteCount: target.path.steps.filter(
          (step) => step.packetRoute || step.primaryRoute?.includes("/packet")
        ).length
      },
      boundary: salesDemoSessionQaBoundary
    },
    {
      headers: {
        ...salesOperationsNoStoreHeaders,
        "X-SCRIMED-Sales-Demo-Session-QA": salesDemoSessionQaProofStackStatus
      }
    }
  );
}

export async function POST(request: Request) {
  const context = await getAuthenticatedSalesContext(request);
  const body = await requestBody(request);
  const requestedIntakeId = requestedIntakeIdFromBody(body);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: salesOperationsBoundary },
      { status: context.status, headers: salesOperationsNoStoreHeaders }
    );
  }

  if (!requestedIntakeId) {
    return NextResponse.json(
      {
        error: {
          code: "sales-demo-session-qa-target-required",
          message:
            "Buyer demo session QA requires an explicit tenant-scoped intakeId before it can create a verification record."
        },
        boundary: salesDemoSessionQaBoundary
      },
      { status: 400, headers: salesOperationsNoStoreHeaders }
    );
  }

  const target = await loadQaTarget(request, context, requestedIntakeId);

  if ("response" in target) {
    return target.response;
  }

  if (target.opportunity.pipelineStage === "closed-lost") {
    return NextResponse.json(
      {
        error: {
          code: "sales-demo-session-qa-closed-lost-opportunity",
          message: "Buyer demo session QA cannot create a verification record against a closed-lost opportunity."
        },
        boundary: salesDemoSessionQaBoundary
      },
      { status: 409, headers: salesOperationsNoStoreHeaders }
    );
  }

  const qaInput = buildSalesDemoSessionQaInput({
    operator: context.user.email ?? context.user.id,
    path: target.path
  });
  const payload = buildBuyerDemoSessionPayload({
    path: target.path,
    input: qaInput
  });
  const sessionResult = await recordSalesBuyerDemoSession(
    context.client,
    target.opportunity.intakeId,
    payload
  );

  if (sessionResult.error || !sessionResult.result?.buyerDemoSession) {
    return NextResponse.json(
      {
        error: {
          code: "sales-demo-session-qa-record-failed",
          message:
            sessionResult.error?.message.includes("prohibited-data")
              ? "The QA session payload was rejected by the no-PHI guard."
              : "The buyer demo session QA record was not committed by the guarded database operation."
        },
        boundary: salesDemoSessionQaBoundary
      },
      { status: mutationStatus(sessionResult.error?.message), headers: salesOperationsNoStoreHeaders }
    );
  }

  const createdSession = sessionResult.result.buyerDemoSession;
  const packetResult = await recordSalesBuyerDemoSessionPacketDownload(
    context.client,
    target.opportunity.intakeId,
    createdSession.id
  );

  if (packetResult.error || !packetResult.result?.buyerDemoSession) {
    return NextResponse.json(
      {
        service: "scrimed-sales-demo-session-qa",
        status: "partial",
        error: {
          code: "sales-demo-session-qa-packet-audit-failed",
          message:
            "The QA session was created, but packet audit verification did not complete. Retry the QA harness after reviewing the guarded packet RPC."
        },
        partialResult: {
          createdSessionId: createdSession.id,
          sessionAuditEventId: sessionResult.result.auditEventId
        },
        boundary: salesDemoSessionQaBoundary
      },
      { status: mutationStatus(packetResult.error?.message), headers: salesOperationsNoStoreHeaders }
    );
  }

  const packetSession = packetResult.result.buyerDemoSession;
  const qaRun: SalesDemoSessionQaRun = {
    intakeId: target.opportunity.intakeId,
    organizationName: target.opportunity.payload.organization.name,
    executedAt: new Date().toISOString(),
    executedBy: context.user.id,
    createdSessionId: createdSession.id,
    sessionAuditEventId: sessionResult.result.auditEventId,
    packetAuditEventId: packetResult.result.auditEventId,
    packetGeneratedAt: packetSession.lastPacketGeneratedAt,
    pathStatus: target.path.status,
    readinessScore: target.path.readinessScore,
    selectedPacketRouteCount: packetSession.selectedPacketRoutes.length,
    proofStackStatus: salesDemoSessionQaProofStackStatus,
    boundary: salesDemoSessionQaBoundary
  };

  return NextResponse.json(
    {
      service: "scrimed-sales-demo-session-qa",
      status: "passed",
      qaRun,
      boundary: salesDemoSessionQaBoundary
    },
    {
      headers: {
        ...salesOperationsNoStoreHeaders,
        "X-SCRIMED-Sales-Demo-Session-QA": "passed"
      }
    }
  );
}
