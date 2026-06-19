import { NextResponse } from "next/server";
import {
  buildClinicalActivationApprovalEvidenceSnapshot,
  clinicalActivationApprovalAttestation,
  deriveClinicalActivationApprovalWorkflow
} from "../../../../lib/clinicalActivationApprovals";
import { deriveClinicalActivationDossier } from "../../../../lib/clinicalActivationDossier";
import {
  createClinicalActivationApproval,
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listClinicalActivationApprovals,
  listCommandIntelligenceSnapshots,
  listPilotAuditEvents,
  listPilotDemoReadinessSnapshots,
  listPilotSessions,
  listQaManualRunEvidencePackets
} from "../../../../lib/protectedPilotStore";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../lib/protectedPilotWorkspace";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string }>;
};

function payloadRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function statusForClinicalApprovalError(message: string) {
  if (
    message.includes("role-denied") ||
    message.includes("authentication-required") ||
    message.includes("aal2-session-required") ||
    message.includes("governance-aal2-session-required") ||
    message.includes("server-authorization-required")
  ) {
    return 403;
  }

  if (message.includes("workspace-not-found")) return 404;
  if (message.includes("does not exist") || message.includes("schema cache")) return 503;
  return 502;
}

async function buildApprovalWorkflow(
  context: Awaited<ReturnType<typeof getAuthenticatedGovernanceContext>>,
  workspaceSlug: string
) {
  if (!context.ok) {
    return { status: context.status, body: null, error: context };
  }

  const workspaceResult = await getAccessiblePilotWorkspace(context.client, workspaceSlug);

  if (workspaceResult.error || !workspaceResult.workspace) {
    return {
      status: 404,
      body: null,
      error: {
        code: "pilot-workspace-not-found",
        message: "No tenant-isolated pilot workspace is available for this member and slug."
      }
    };
  }

  const workspace = workspaceResult.workspace;
  const [
    sessionsResult,
    auditResult,
    snapshotsResult,
    manualQaEvidenceResult,
    commandSnapshotsResult,
    approvalsResult
  ] = await Promise.all([
    listPilotSessions(context.client, workspace.id),
    listPilotAuditEvents(context.client, workspace.id),
    listPilotDemoReadinessSnapshots(context.client, workspace.id),
    listQaManualRunEvidencePackets(context.client, workspace.id),
    listCommandIntelligenceSnapshots(context.client, workspace.id),
    listClinicalActivationApprovals(context.client, workspace.id)
  ]);
  const unavailableSections = [
    sessionsResult.error ? "Durable synthetic sessions could not be retrieved." : "",
    auditResult.error ? "Append-only pilot audit events could not be retrieved." : "",
    snapshotsResult.error ? "Demo readiness snapshots could not be retrieved." : "",
    manualQaEvidenceResult.error ? "Manual QA evidence packets could not be retrieved." : "",
    commandSnapshotsResult.error ? "Command Intelligence snapshots could not be retrieved." : "",
    approvalsResult.error
      ? "Clinical activation approval history could not be retrieved; use external signed evidence and the dossier packet as a safe workaround."
      : ""
  ].filter(Boolean);
  const dossier = deriveClinicalActivationDossier({
    workspace,
    sessions: sessionsResult.error ? [] : sessionsResult.sessions,
    auditEvents: auditResult.error ? [] : auditResult.events,
    demoSnapshots: snapshotsResult.error ? [] : snapshotsResult.snapshots,
    manualQaEvidencePackets: manualQaEvidenceResult.error ? [] : manualQaEvidenceResult.packets,
    commandSnapshots: commandSnapshotsResult.error ? [] : commandSnapshotsResult.snapshots,
    unavailableSections: unavailableSections.filter(
      (section) => !section.includes("approval history")
    )
  });
  const workflow = deriveClinicalActivationApprovalWorkflow({
    dossier,
    approvals: approvalsResult.error ? [] : approvalsResult.approvals,
    unavailableSections
  });

  return {
    status: 200,
    body: {
      service: workflow.service,
      boundary: workflow.boundary,
      workspace,
      dossier,
      workflow
    },
    error: null
  };
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "clinical-activation-approvals-read",
    limit: 60,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Clinical Activation Approval Workflow reads are temporarily rate limited."
        },
        boundary: protectedPilotBoundary
      },
      { status: 429, headers }
    );
  }

  const context = await getAuthenticatedGovernanceContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: protectedPilotBoundary },
      { status: context.status, headers }
    );
  }

  const { workspaceSlug } = await params;
  const result = await buildApprovalWorkflow(context, workspaceSlug);

  if (!result.body) {
    return NextResponse.json(
      { error: result.error, boundary: protectedPilotBoundary },
      { status: result.status, headers }
    );
  }

  return NextResponse.json(result.body, { headers });
}

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "clinical-activation-approval-create",
    limit: 12,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Clinical Activation Approval Workflow writes are temporarily rate limited."
        },
        boundary: protectedPilotBoundary
      },
      { status: 429, headers }
    );
  }

  const context = await getAuthenticatedGovernanceContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: protectedPilotBoundary },
      { status: context.status, headers }
    );
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      {
        error: {
          code: "unsupported-content-type",
          message: "Clinical activation approvals must use application/json."
        },
        boundary: protectedPilotBoundary
      },
      { status: 415, headers }
    );
  }

  const rawBody = await request.text();

  if (rawBody.length > 1600) {
    return NextResponse.json(
      {
        error: {
          code: "payload-too-large",
          message: "Approval capture accepts only the domain id and fixed no-PHI attestation."
        },
        boundary: protectedPilotBoundary
      },
      { status: 413, headers }
    );
  }

  let payload: unknown;

  try {
    payload = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return NextResponse.json(
      {
        error: { code: "invalid-json", message: "Request body must be valid JSON." },
        boundary: protectedPilotBoundary
      },
      { status: 400, headers }
    );
  }

  const record = payloadRecord(payload);
  const domainId = typeof record.domainId === "string" ? record.domainId.trim() : "";
  const attestation = typeof record.attestation === "string" ? record.attestation.trim() : "";

  if (!domainId || attestation !== clinicalActivationApprovalAttestation) {
    return NextResponse.json(
      {
        error: {
          code: "invalid-approval-attestation",
          message:
            "Clinical activation approval capture requires a known domain id and the fixed no-PHI AAL2 readiness attestation."
        },
        boundary: protectedPilotBoundary
      },
      { status: 400, headers }
    );
  }

  const { workspaceSlug } = await params;
  const workflowResult = await buildApprovalWorkflow(context, workspaceSlug);

  if (!workflowResult.body) {
    return NextResponse.json(
      { error: workflowResult.error, boundary: protectedPilotBoundary },
      { status: workflowResult.status, headers }
    );
  }

  const domain = workflowResult.body.workflow.domains.find(
    (candidate) => candidate.domainId === domainId
  );

  if (!domain) {
    return NextResponse.json(
      {
        error: {
          code: "unknown-clinical-activation-domain",
          message: "The requested clinical activation approval domain is not part of this dossier."
        },
        boundary: protectedPilotBoundary
      },
      { status: 400, headers }
    );
  }

  const persistence = await createClinicalActivationApproval(
    context.client,
    workflowResult.body.workspace.slug,
    {
      domainId: domain.domainId,
      domainLabel: domain.domainLabel,
      approvalStatus: domain.approvalStatus,
      reviewerRole: domain.requiredSignatures.join(", "),
      evidenceSnapshot: buildClinicalActivationApprovalEvidenceSnapshot({
        domain,
        dossier: workflowResult.body.dossier
      }),
      retainedBlockers: domain.retainedBlockers
    }
  );

  if (persistence.error || !persistence.approvalId) {
    const message = persistence.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "clinical-activation-approval-persistence-failed",
          message:
            "The no-PHI clinical activation approval attestation was not committed. Use the Clinical Activation Dossier packet and external signed evidence while durable approval storage is repaired."
        },
        boundary: protectedPilotBoundary
      },
      { status: statusForClinicalApprovalError(message), headers }
    );
  }

  const refreshed = await buildApprovalWorkflow(context, workflowResult.body.workspace.slug);

  return NextResponse.json(
    {
      service: "scrimed-clinical-activation-approval-workflow",
      boundary: workflowResult.body.workflow.boundary,
      workspace: workflowResult.body.workspace,
      approvalId: persistence.approvalId,
      workflow: refreshed.body?.workflow ?? workflowResult.body.workflow
    },
    { status: 201, headers }
  );
}
