import { NextResponse } from "next/server";
import {
  buildQaManualRunEvidencePacket,
  qaEvidenceLedgerBoundary,
  qaManualRunEvidencePersistenceStatus,
  validateQaManualRunEvidenceInput
} from "../../../../../lib/qaEvidenceLedger";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listQaManualRunEvidencePackets,
  recordQaManualRunEvidencePacket
} from "../../../../../lib/protectedPilotStore";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../../lib/protectedPilotWorkspace";
import {
  enforceRequestRateLimit,
  rateLimitHeaders
} from "../../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string }>;
};

async function requestBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function statusForManualQaEvidenceError(message: string) {
  if (
    message.includes("role-denied") ||
    message.includes("governance-aal2-session-required") ||
    message.includes("protected-pilot-aal2-session-required") ||
    message.includes("mfa-required") ||
    message.includes("session-policy-required")
  ) {
    return 403;
  }

  if (message.includes("workspace")) return 404;
  if (message.includes("duplicate") || message.includes("unique")) return 409;
  if (message.includes("invalid") || message.includes("prohibited") || message.includes("validation")) {
    return 400;
  }

  return 502;
}

async function loadAuthorizedWorkspace(request: Request, workspaceSlug: string) {
  const context = await getAuthenticatedGovernanceContext(request);

  if (!context.ok) {
    return {
      response: NextResponse.json(
        { error: { code: context.code, message: context.message }, boundary: protectedPilotBoundary },
        { status: context.status, headers: protectedPilotNoStoreHeaders }
      )
    };
  }

  const workspaceResult = await getAccessiblePilotWorkspace(context.client, workspaceSlug);

  if (workspaceResult.error || !workspaceResult.workspace) {
    return {
      response: NextResponse.json(
        {
          error: {
            code: "pilot-workspace-not-found",
            message: "No tenant-isolated pilot workspace is available for this member and slug."
          },
          boundary: protectedPilotBoundary
        },
        { status: 404, headers: protectedPilotNoStoreHeaders }
      )
    };
  }

  return {
    context,
    workspace: workspaceResult.workspace
  };
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "qa-manual-run-evidence-list",
    limit: 60,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Manual QA evidence packet reads are temporarily rate limited."
        },
        boundary: protectedPilotBoundary
      },
      { status: 429, headers }
    );
  }

  const { workspaceSlug } = await params;
  const authorization = await loadAuthorizedWorkspace(request, workspaceSlug);

  if ("response" in authorization) {
    return authorization.response;
  }

  const packetResult = await listQaManualRunEvidencePackets(
    authorization.context.client,
    authorization.workspace.id
  );

  if (packetResult.error) {
    return NextResponse.json(
      {
        error: {
          code: "qa-manual-evidence-packets-unavailable",
          message: "Manual QA evidence packets could not be retrieved for this tenant workspace."
        },
        boundary: protectedPilotBoundary
      },
      { status: 502, headers }
    );
  }

  return NextResponse.json(
    {
      service: "scrimed-qa-manual-run-evidence-persistence",
      status: qaManualRunEvidencePersistenceStatus,
      workspace: authorization.workspace,
      packetCount: packetResult.packets.length,
      packets: packetResult.packets,
      boundary: qaEvidenceLedgerBoundary
    },
    { headers }
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "qa-manual-run-evidence-persist",
    limit: 12,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Manual QA evidence packet persistence is temporarily rate limited."
        },
        boundary: protectedPilotBoundary
      },
      { status: 429, headers }
    );
  }

  const { workspaceSlug } = await params;
  const authorization = await loadAuthorizedWorkspace(request, workspaceSlug);

  if ("response" in authorization) {
    return authorization.response;
  }

  const body = await requestBody(request);
  const validation = validateQaManualRunEvidenceInput(body);

  if (!validation.ok) {
    return NextResponse.json(
      {
        service: "scrimed-qa-manual-run-evidence-persistence",
        status: "validation-failed",
        errors: validation.errors,
        boundary: qaEvidenceLedgerBoundary
      },
      { status: 400, headers }
    );
  }

  const packetMarkdown = buildQaManualRunEvidencePacket(validation.input);
  const result = await recordQaManualRunEvidencePacket(
    authorization.context.client,
    authorization.workspace.slug,
    validation.input,
    packetMarkdown
  );

  if (result.error || !result.packet || !result.auditEventId) {
    const message = result.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "qa-manual-evidence-persistence-failed",
          message:
            "The manual QA evidence packet was not persisted because the tenant-scoped audit write failed."
        },
        boundary: qaEvidenceLedgerBoundary
      },
      { status: statusForManualQaEvidenceError(message), headers }
    );
  }

  return NextResponse.json(
    {
      service: "scrimed-qa-manual-run-evidence-persistence",
      status: qaManualRunEvidencePersistenceStatus,
      workspace: authorization.workspace,
      packet: result.packet,
      auditEventId: result.auditEventId,
      evidencePacketMarkdown: packetMarkdown,
      boundary: result.boundary ?? qaEvidenceLedgerBoundary
    },
    {
      status: 201,
      headers: {
        ...headers,
        "X-SCRIMED-QA-Evidence-Persisted": "true"
      }
    }
  );
}
