import { NextResponse } from "next/server";
import { getWorkflowExecutionAuditBoundaryBySlug } from "../../../../lib/workflowExecutionAudit";
import { getWorkflowImplementationReadinessBySlug } from "../../../../lib/workflowImplementationReadiness";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const readiness = getWorkflowImplementationReadinessBySlug(slug);

  if (!readiness) {
    return NextResponse.json({ error: "Workflow implementation readiness not found" }, { status: 404 });
  }

  return NextResponse.json(readiness);
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const readiness = getWorkflowImplementationReadinessBySlug(slug);
  const auditBoundary = getWorkflowExecutionAuditBoundaryBySlug(slug);

  if (!readiness) {
    return NextResponse.json({ error: "Workflow implementation readiness not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      error: readiness.deniedResponse.code,
      message: readiness.deniedResponse.message,
      workflow: readiness.slug,
      status: readiness.status,
      runtimeMode: readiness.runtimeMode,
      bodyHandling: readiness.bodyHandling,
      auditDisposition: readiness.auditDisposition,
      requiredBeforeExecution: readiness.requiredBeforeExecution,
      contractRoute: readiness.contractRoute,
      readinessRoute: readiness.route
    },
    {
      status: readiness.deniedResponse.statusCode,
      headers: {
        "x-scrimed-guard": "deny-by-default",
        "x-scrimed-audit-event": auditBoundary?.eventName ?? "workflow.execution.denied",
        "x-scrimed-workflow": readiness.slug,
        "x-scrimed-body-handling": "not-parsed"
      }
    }
  );
}
