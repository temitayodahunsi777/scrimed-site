import { NextResponse } from "next/server";
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
    { status: readiness.deniedResponse.statusCode }
  );
}
