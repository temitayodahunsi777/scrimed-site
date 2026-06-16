import { NextResponse } from "next/server";
import {
  buyerTenantLifecycleBoundary
} from "../../../../../lib/buyerTenantLifecycle";
import { getAuthenticatedSalesContext } from "../../../../../lib/protectedPilotStore";
import {
  salesOperationsBoundary,
  salesOperationsNoStoreHeaders
} from "../../../../../lib/salesOperations";
import {
  activateSalesBuyerTenantLifecycle,
  getSalesOpportunity
} from "../../../../../lib/salesOperationsStore";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ intakeId: string }>;
};

function mutationStatus(message?: string) {
  if (!message) return 502;
  if (message.includes("workspace-required")) return 409;
  if (message.includes("closed-lost")) return 409;
  if (message.includes("sales-operations-admin-required")) return 403;
  if (message.includes("mfa-required")) return 403;
  if (message.includes("sales-opportunity-not-found")) return 404;
  return 502;
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
  const result = await getSalesOpportunity(context.client, intakeId);

  if (result.error || !result.opportunity) {
    return NextResponse.json(
      {
        error: {
          code: "sales-opportunity-not-found",
          message: "No tenant-scoped opportunity is available for this ID."
        },
        boundary: buyerTenantLifecycleBoundary
      },
      {
        status: result.error?.message.includes("sales-operations-admin-required") ? 403 : 404,
        headers: salesOperationsNoStoreHeaders
      }
    );
  }

  return NextResponse.json(
    {
      buyerTenantLifecycle: result.opportunity.buyerTenantLifecycle ?? null,
      boundary: buyerTenantLifecycleBoundary
    },
    { headers: salesOperationsNoStoreHeaders }
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
  const result = await activateSalesBuyerTenantLifecycle(context.client, intakeId);

  if (result.error || !result.result) {
    return NextResponse.json(
      {
        error: {
          code: "sales-buyer-tenant-lifecycle-activation-failed",
          message:
            result.error?.message.includes("workspace-required")
              ? "Provision the buyer-specific protected workspace before activating tenant lifecycle controls."
              : result.error?.message.includes("closed-lost")
                ? "Closed-lost opportunities cannot activate buyer tenant lifecycle controls."
                : "The buyer tenant lifecycle was not activated because the guarded database operation failed."
        },
        boundary: buyerTenantLifecycleBoundary
      },
      {
        status: mutationStatus(result.error?.message),
        headers: salesOperationsNoStoreHeaders
      }
    );
  }

  return NextResponse.json(result.result, { headers: salesOperationsNoStoreHeaders });
}
