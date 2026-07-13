import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getAuthenticatedGovernanceContext } from "../../../lib/protectedPilotStore";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../lib/requestRateLimit";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../lib/scrimedSafetyGovernance";

export const dynamic = "force-dynamic";

const route = "/api/scrimed-build-roadmap/stored-vector-rpc-smoke";
const boundary =
  "SCRIMED stored-vector RPC smoke is synthetic/no-PHI only. It validates AAL2-protected database-side vector registration and lookup with no raw embedding return, PHI, secrets, live patient data, payer submissions, EHR writes, or autonomous clinical authority.";
const headers = {
  "Cache-Control": "private, no-store",
  "X-SCRIMED-Data-Boundary": "synthetic-no-phi-only",
  "X-SCRIMED-Stored-Vector-RPC": "aal2-protected-synthetic-smoke",
  "X-SCRIMED-Embedding-Return": "disabled"
};

type StoredVectorRegistrationResult = {
  record?: {
    vectorId?: string;
    sourceRef?: string;
    vectorDomain?: string;
    documentClass?: string | null;
    syntheticOnly?: boolean;
    noPhiAssertion?: boolean;
    humanReviewRequired?: boolean;
  };
  eventId?: string;
  persisted?: boolean;
  boundary?: string;
};

type StoredVectorSearchResult = {
  rank?: number;
  vector_id?: string;
  source_ref?: string;
  vector_domain?: string;
  match_score?: number;
  metadata?: unknown;
  source_status?: string;
  reviewer_status?: string;
  evidence_summary?: unknown;
  safety_boundary?: string;
  created_at?: string;
};

function safeSlug(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim();

  return /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(normalized) ? normalized : fallback;
}

function smokeRunId() {
  return createHash("sha256")
    .update(`scrimed-stored-vector-smoke:${Date.now()}:${Math.random()}`)
    .digest("hex")
    .slice(0, 18);
}

function vectorLiteral(seed: number) {
  const values = Array.from({ length: 1536 }, (_, index) => {
    const value = ((index + seed) % 23) + 1;

    return (value / 100).toFixed(4);
  });

  return `[${values.join(",")}]`;
}

function responseDigest(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

async function readBoundedJson(request: Request, guardedHeaders: HeadersInit) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return {
      error: NextResponse.json(
        {
          error: {
            code: "unsupported-content-type",
            message: "Stored-vector RPC smoke requires application/json."
          },
          boundary
        },
        { status: 415, headers: guardedHeaders }
      )
    };
  }

  const rawBody = await request.text();

  if (rawBody.length > 4000) {
    return {
      error: NextResponse.json(
        {
          error: {
            code: "payload-too-large",
            message: "Stored-vector RPC smoke payloads must remain concise and synthetic."
          },
          boundary
        },
        { status: 413, headers: guardedHeaders }
      )
    };
  }

  try {
    return { payload: JSON.parse(rawBody) as Record<string, unknown> };
  } catch {
    return {
      error: NextResponse.json(
        {
          error: { code: "invalid-json", message: "Request body must be valid JSON." },
          boundary
        },
        { status: 400, headers: guardedHeaders }
      )
    };
  }
}

function rpcFailure(message: string | undefined) {
  const detail = message ?? "stored-vector-rpc-failed";

  if (detail.includes("aal2-session-required") || detail.includes("mfa")) {
    return {
      status: 403,
      code: "stored-vector-rpc-aal2-required",
      message: "Stored-vector RPC smoke requires an active AAL2 governance session."
    } as const;
  }

  if (detail.includes("role-denied") || detail.includes("tenant-scope-denied")) {
    return {
      status: 403,
      code: "stored-vector-rpc-forbidden",
      message:
        "Stored-vector RPC smoke registration is limited to authorized tenant-admin or pilot-lead roles; stored-vector lookup remains reviewer-readable through the database RPC boundary."
    } as const;
  }

  if (detail.includes("sales-server-token") || detail.includes("server-token")) {
    return {
      status: 503,
      code: "stored-vector-rpc-server-token-missing",
      message:
        "Stored-vector RPC smoke could not verify the server runtime token. Configure the protected persistence token before retrying."
    } as const;
  }

  if (detail.includes("prohibited-content") || detail.includes("boundary-violation")) {
    return {
      status: 403,
      code: "stored-vector-rpc-boundary-blocked",
      message: "Stored-vector RPC smoke was blocked by the no-PHI synthetic boundary."
    } as const;
  }

  return {
    status: 503,
    code: "stored-vector-rpc-unavailable",
    message:
      "Stored-vector RPC smoke could not complete. Confirm migration state, Supabase runtime credentials, AAL2 session, tenant role, and protected server token."
  } as const;
}

export async function POST(request: Request) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "stored-vector-rpc-smoke",
    limit: 8,
    windowSeconds: 600
  });
  const baseHeaders = { ...headers, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Stored-vector RPC smoke is temporarily rate limited."
        },
        boundary
      },
      { status: 429, headers: baseHeaders }
    );
  }

  const context = await getAuthenticatedGovernanceContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary },
      { status: context.status, headers: baseHeaders }
    );
  }

  const body = await readBoundedJson(request, baseHeaders);

  if (body.error) {
    return body.error;
  }

  const workspaceSlug = safeSlug(
    body.payload?.workspaceSlug,
    process.env.SCRIMED_WORKSPACE_SLUG ?? "atlas-synthetic-evaluation"
  );
  const runId = smokeRunId();
  const sourceRef = `stored-vector-smoke-source-${runId}`;
  const targetRef = `stored-vector-smoke-target-${runId}`;
  const smokeMetadata = {
    fixture: "stored-vector-rpc-smoke",
    syntheticOnly: true,
    noPhiAssertion: true,
    generatedBy: "scrimed-backend-smoke",
    runId
  };
  const safety = evaluateScrimedSafetyGate({
    route,
    requestedAction:
      "synthetic no-phi internal testing stored-vector RPC smoke audit preparation",
    inputText: JSON.stringify({
      workspaceSlug,
      sourceRef,
      targetRef,
      fixture: smokeMetadata.fixture,
      syntheticOnly: true,
      noPhiAssertion: true
    }),
    allowMetadataOnly: true
  });
  const guardedHeaders = { ...baseHeaders, ...scrimedSafetyHeaders(safety) };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "stored-vector-rpc-smoke-blocked",
          message: "Stored-vector RPC smoke is blocked by SCRIMED safety governance."
        },
        safety,
        boundary
      },
      { status: safety.statusCode, headers: guardedHeaders }
    );
  }

  const sharedAttributes = {
    documentClass: "stored-vector-rpc-smoke",
    reviewerStatus: "validated",
    sourceStatus: "active",
    sourceCitation: "synthetic-stored-vector-smoke-reference",
    syntheticOnly: true,
    noPhiAssertion: true
  };
  const registrationPayload = {
    p_workspace_slug: workspaceSlug,
    p_vector_domain: "document-similarity",
    p_embedding: vectorLiteral(7),
    p_embedding_model: "scrimed-synthetic-1536-smoke-v1",
    p_metadata: smokeMetadata
  };

  const sourceResult = await context.client.rpc("register_scrimed_synthetic_stored_vector", {
    ...registrationPayload,
    p_source_ref: sourceRef,
    p_attributes: {
      ...sharedAttributes,
      sourceCitation: "synthetic-stored-vector-smoke-source-reference"
    }
  });

  if (sourceResult.error) {
    const failure = rpcFailure(sourceResult.error.message);

    return NextResponse.json(
      { error: { code: failure.code, message: failure.message }, boundary },
      { status: failure.status, headers: guardedHeaders }
    );
  }

  const targetResult = await context.client.rpc("register_scrimed_synthetic_stored_vector", {
    ...registrationPayload,
    p_source_ref: targetRef,
    p_attributes: {
      ...sharedAttributes,
      sourceCitation: "synthetic-stored-vector-smoke-target-reference"
    }
  });

  if (targetResult.error) {
    const failure = rpcFailure(targetResult.error.message);

    return NextResponse.json(
      { error: { code: failure.code, message: failure.message }, boundary },
      { status: failure.status, headers: guardedHeaders }
    );
  }

  const sourceData = sourceResult.data as StoredVectorRegistrationResult | null;
  const targetData = targetResult.data as StoredVectorRegistrationResult | null;
  const sourceVectorId = sourceData?.record?.vectorId;
  const targetVectorId = targetData?.record?.vectorId;

  if (!sourceVectorId || !targetVectorId) {
    return NextResponse.json(
      {
        error: {
          code: "stored-vector-rpc-invalid-registration-result",
          message: "Stored-vector RPC registration did not return expected synthetic vector IDs."
        },
        boundary
      },
      { status: 503, headers: guardedHeaders }
    );
  }

  const searchResult = await context.client.rpc("scrimed_search_similar_documents", {
    source_vector_id: sourceVectorId,
    tenant_scope: workspaceSlug,
    document_class: "stored-vector-rpc-smoke",
    match_threshold: 0.99,
    match_count: 5
  });

  if (searchResult.error) {
    const failure = rpcFailure(searchResult.error.message);

    return NextResponse.json(
      { error: { code: failure.code, message: failure.message }, boundary },
      { status: failure.status, headers: guardedHeaders }
    );
  }

  const matches = Array.isArray(searchResult.data)
    ? (searchResult.data as StoredVectorSearchResult[])
    : [];
  const targetMatch = matches.find((match) => match.vector_id === targetVectorId);

  if (!targetMatch || targetMatch.match_score === undefined || targetMatch.match_score < 0.99) {
    return NextResponse.json(
      {
        error: {
          code: "stored-vector-rpc-match-missing",
          message: "Stored-vector RPC search did not return the expected synthetic target match."
        },
        matchCount: matches.length,
        boundary
      },
      { status: 503, headers: guardedHeaders }
    );
  }

  const evidenceEnvelope = {
    route,
    workspaceSlug,
    sourceVectorId,
    targetVectorId,
    matchCount: matches.length,
    targetMatchScore: targetMatch.match_score,
    sourceEventId: sourceData?.eventId,
    targetEventId: targetData?.eventId,
    safetyPolicyVersion: safety.policyVersion,
    syntheticOnly: true,
    noPhiAssertion: true,
    embeddingReturned: false
  };

  return NextResponse.json(
    {
      service: "scrimed-stored-vector-rpc-smoke",
      status: "stored-vector-rpc-smoke-passed",
      persisted: sourceData?.persisted === true && targetData?.persisted === true,
      workspaceSlug,
      sourceVectorId,
      targetVectorId,
      matchCount: matches.length,
      targetMatchScore: targetMatch.match_score,
      sourceEventId: sourceData?.eventId,
      targetEventId: targetData?.eventId,
      evidenceEnvelopeHash: responseDigest(evidenceEnvelope),
      outputHash: responseDigest({
        sourceVectorId,
        targetVectorId,
        targetMatchScore: targetMatch.match_score
      }),
      embeddingReturned: false,
      syntheticOnly: true,
      noPhiAssertion: true,
      humanReviewRequired: true,
      safety,
      boundary
    },
    { status: 201, headers: guardedHeaders }
  );
}
