import { NextResponse } from "next/server";
import {
  isP32EvidenceIssuerEnabled,
  issueP32Aal2Evidence,
  P32EvidenceIssuerError,
  scrimedP32EvidenceIssuerBoundary,
  scrimedP32EvidenceIssuerStatus,
  validateP32EvidenceIssuerRequest
} from "../../../../../lib/scrimedP32EvidenceIssuer";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listQaManualRunEvidencePackets,
  recordP32EvidenceAttestationIssuance
} from "../../../../../lib/protectedPilotStore";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../../lib/protectedPilotWorkspace";
import {
  enforceRequestRateLimit,
  rateLimitHeaders
} from "../../../../../lib/requestRateLimit";
import {
  evaluateScrimedWorkWriteRequestProvenance,
  scrimedWorkCsrfPolicyVersion
} from "../../../../../lib/scrimed-work/csrfProtection";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ workspaceSlug: string }>;
};

const routeHeaders = {
  ...protectedPilotNoStoreHeaders,
  "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
  "X-SCRIMED-Data-Boundary": "synthetic-metadata-only",
  "X-SCRIMED-Evidence-Issuer": "candidate-bound-aal2-technical-evidence-only",
  "X-SCRIMED-CSRF-Protection": scrimedWorkCsrfPolicyVersion,
  "X-SCRIMED-Release-Authority": "not-granted"
};

function errorResponse(error: P32EvidenceIssuerError, headers: HeadersInit) {
  return NextResponse.json(
    {
      error: { code: error.code, message: error.message },
      boundary: scrimedP32EvidenceIssuerBoundary
    },
    { status: error.status, headers }
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-p32-evidence-attestation-issue",
    limit: 6,
    windowSeconds: 600
  });
  const headers = { ...routeHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected p.32 evidence issuance is temporarily rate limited."
        },
        boundary: scrimedP32EvidenceIssuerBoundary
      },
      { status: 429, headers }
    );
  }

  if (!isP32EvidenceIssuerEnabled()) {
    return NextResponse.json(
      {
        error: {
          code: "p32-evidence-issuer-disabled",
          message: "Protected p.32 evidence issuance is disabled by default."
        },
        boundary: scrimedP32EvidenceIssuerBoundary
      },
      { status: 503, headers }
    );
  }

  const provenance = evaluateScrimedWorkWriteRequestProvenance(request);
  if (!provenance.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "p32-evidence-issuer-csrf-denied",
          message: "Protected p.32 evidence issuance rejected an unverifiable mutation origin."
        },
        boundary: scrimedP32EvidenceIssuerBoundary
      },
      { status: 403, headers }
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
  const workspaceResult = await getAccessiblePilotWorkspace(context.client, workspaceSlug);
  if (workspaceResult.error || !workspaceResult.workspace) {
    return NextResponse.json(
      {
        error: {
          code: "pilot-workspace-not-found",
          message: "No tenant-isolated pilot workspace is available for this member and slug."
        },
        boundary: protectedPilotBoundary
      },
      { status: 404, headers }
    );
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      {
        error: {
          code: "unsupported-content-type",
          message: "Protected p.32 evidence issuance requires application/json."
        },
        boundary: scrimedP32EvidenceIssuerBoundary
      },
      { status: 415, headers }
    );
  }

  const rawBody = await request.text();
  if (rawBody.length > 2048) {
    return NextResponse.json(
      {
        error: {
          code: "payload-too-large",
          message: "Protected p.32 evidence issuance accepts bounded fingerprints only."
        },
        boundary: scrimedP32EvidenceIssuerBoundary
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
        boundary: scrimedP32EvidenceIssuerBoundary
      },
      { status: 400, headers }
    );
  }

  const packetResult = await listQaManualRunEvidencePackets(
    context.client,
    workspaceResult.workspace.id
  );
  if (packetResult.error) {
    return NextResponse.json(
      {
        error: {
          code: "p32-evidence-issuer-qa-evidence-unavailable",
          message: "Retained tenant QA evidence could not be verified."
        },
        boundary: scrimedP32EvidenceIssuerBoundary
      },
      { status: 502, headers }
    );
  }

  try {
    const issuance = await issueP32Aal2Evidence({
      request: validateP32EvidenceIssuerRequest(payload),
      idempotencyKey: request.headers.get("idempotency-key")?.trim() ?? "",
      packets: packetResult.packets,
      persistReceipt: (receiptInput) =>
        recordP32EvidenceAttestationIssuance(
          context.client,
          workspaceResult.workspace!.slug,
          receiptInput
        )
    });

    return NextResponse.json(
      {
        service: "scrimed-protected-p32-evidence-issuer",
        status: scrimedP32EvidenceIssuerStatus,
        workspace: workspaceResult.workspace,
        evidenceFile: issuance.evidenceFile,
        receipt: issuance.receipt,
        issuer: issuance.issuer,
        qaEvidence: issuance.qaEvidence,
        humanApprovalGranted: false,
        releaseAuthorityGranted: false,
        boundary: scrimedP32EvidenceIssuerBoundary
      },
      {
        status: 201,
        headers: {
          ...headers,
          "X-SCRIMED-P32-Evidence-Attestation": "issued-and-audited"
        }
      }
    );
  } catch (error) {
    if (error instanceof P32EvidenceIssuerError) return errorResponse(error, headers);
    return NextResponse.json(
      {
        error: {
          code: "p32-evidence-issuer-unavailable",
          message: "Protected p.32 evidence issuance failed closed."
        },
        boundary: scrimedP32EvidenceIssuerBoundary
      },
      { status: 503, headers }
    );
  }
}
