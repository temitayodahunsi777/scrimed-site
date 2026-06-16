import { NextResponse } from "next/server";
import { getAuthenticatedSalesContext } from "../../../../../lib/protectedPilotStore";
import {
  opportunityWorkspaceProvisioningBoundary
} from "../../../../../lib/opportunityWorkspaceProvisioning";
import {
  salesOperationsBoundary,
  salesOperationsNoStoreHeaders
} from "../../../../../lib/salesOperations";
import {
  getSalesOpportunity,
  provisionSalesOpportunityWorkspace
} from "../../../../../lib/salesOperationsStore";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ intakeId: string }>;
};

function mutationStatus(message?: string) {
  if (!message) return 502;
  if (message.includes("not-qualified")) return 409;
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
        boundary: opportunityWorkspaceProvisioningBoundary
      },
      {
        status: result.error?.message.includes("sales-operations-admin-required") ? 403 : 404,
        headers: salesOperationsNoStoreHeaders
      }
    );
  }

  return NextResponse.json(
    {
      workspaceProvisioning: result.opportunity.workspaceProvisioning ?? null,
      boundary: opportunityWorkspaceProvisioningBoundary
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
  const result = await provisionSalesOpportunityWorkspace(context.client, intakeId);

  if (result.error || !result.result) {
    return NextResponse.json(
      {
        error: {
          code: "sales-opportunity-workspace-provisioning-failed",
          message:
            result.error?.message.includes("not-qualified")
              ? "Advance this opportunity to Qualified, Discovery, Proposal, Pilot Planning, or Won before provisioning a buyer workspace."
              : "The buyer-specific workspace was not provisioned because the guarded database operation failed."
        },
        boundary: opportunityWorkspaceProvisioningBoundary
      },
      {
        status: mutationStatus(result.error?.message),
        headers: salesOperationsNoStoreHeaders
      }
    );
  }

  return NextResponse.json(result.result, { headers: salesOperationsNoStoreHeaders });
}
