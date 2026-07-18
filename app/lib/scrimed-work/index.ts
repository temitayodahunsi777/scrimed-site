import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../scrimedSafetyGovernance";
import { getAuthenticatedGovernanceContext } from "../protectedPilotStore";
import { scrimedWorkAgents } from "./agentRegistry";
import { buildScrimedWorkArtifact, scrimedWorkArtifactTemplates } from "./artifactEngine";
import { evaluateArtifactReview, parseArtifactReviewInput } from "./artifactReview";
import { createAuditEvent, createAuditHash, envelope, errorEnvelope, scrimedWorkAuditBoundary, scrimedWorkPolicyVersion } from "./audit";
import {
  buildScrimedWorkCanaryAttestation,
  getScrimedWorkRuntimeReleaseSha,
  scrimedWorkCanaryAttestationBoundary,
  scrimedWorkCanaryAttestationPolicyVersion
} from "./canaryAttestation";
import { getHealthcareOntologyRegistry, searchScrimedWorkContext } from "./contextEngine";
import {
  evaluateScrimedWorkWriteRequestProvenance,
  scrimedWorkCsrfBoundary,
  scrimedWorkCsrfPolicyVersion
} from "./csrfProtection";
import {
  getScrimedWorkDurableStorageMode,
  getScrimedWorkWorkspaceSlug,
  fetchScrimedWorkSessionFromDurableStore,
  isScrimedWorkDurableStoreEnabled,
  listScrimedWorkCompletionEvidenceInDurableStore,
  listScrimedWorkCompletionQueueInDurableStore,
  listScrimedWorkArtifactReviewQueueInDurableStore,
  recordScrimedWorkArtifactInDurableStore,
  reviewScrimedWorkArtifactInDurableStore,
  recordScrimedWorkSessionInDurableStore,
  resolveScrimedWorkMembership,
  scrimedWorkDurableStoreBoundary,
  scrimedWorkDurableStoreRpcFailure,
  scrimedWorkDurableStoreStatus,
  transitionScrimedWorkSessionInDurableStore,
  type ScrimedWorkDurableStoreContext
} from "./durableStore";
import {
  isScrimedWorkCompletionOperator,
  parseScrimedWorkCompletionQueueLimit,
  parseScrimedWorkCompletionReadMode,
  scrimedWorkCompletionQueueBoundary,
  scrimedWorkCompletionQueuePolicyVersion
} from "./completionQueue";
import {
  scrimedWorkCompletionEvidenceBoundary,
  scrimedWorkCompletionEvidencePolicyVersion
} from "./completionEvidence";
import { getScrimedWorkFeatureFlags, scrimedWorkFeatureFlagHeaders } from "./featureFlags";
import { sampleLearningLoopArtifacts } from "./learningLoop";
import { isScrimedWorkMigrationSetVerified } from "./migrationSet";
import {
  buildPayerIqProtectedWorkSession,
  parsePayerIqProtectedHandoffInput,
  payerIqProtectedHandoffAuthority
} from "./payerIqHandoff";
import { sampleModelRouteInputs, routeScrimedWorkModel } from "./modelRouter";
import { previewOrchestration } from "./orchestrationEngine";
import { getScrimedWorkProductionHardeningGate } from "./productionHardening";
import { scrimedWorkProviderRegistry } from "./providerRegistry";
import {
  enforceScrimedWorkMutationRateLimit,
  getScrimedWorkRateLimitPosture,
  scrimedWorkMutationRateLimitHeaders
} from "./rateLimitPolicy";
import {
  parseScrimedWorkReviewQueueLimit,
  scrimedWorkReviewQueueBoundary,
  scrimedWorkReviewQueuePolicyVersion
} from "./reviewQueue";
import { containsPhiRisk, containsTokenLikeField, parseArtifactRequest, parseWorkSessionCreateInput } from "./schemas";
import { scrimedWorkScheduleDefinitions } from "./scheduleDefinitions";
import {
  evaluateWorkSessionTransition,
  getWorkSessionLifecycleSnapshot
} from "./sessionLifecycle";
import { getScrimedWorkTools } from "./toolRegistry";
import { verifyScrimedWorkResult } from "./verificationEngine";
import { listWorkSessions, getWorkSession, buildTransitionedWorkSession, buildWorkSessionFromContract } from "./workSessionStore";
import { scrimedWorkspaces } from "./workspaceRegistry";
import { simulateVoiceWorkflow } from "./voiceWorkflow";
import type {
  WorkApiEnvelope,
  WorkArtifact,
  WorkSession,
  WorkSessionTransitionAction
} from "./types";

export * from "./types";
export * from "./schemas";
export * from "./workspaceRegistry";
export * from "./workSessionStore";
export * from "./modelRouter";
export * from "./providerRegistry";
export * from "./productionHardening";
export * from "./rateLimitPolicy";
export * from "./toolRegistry";
export * from "./agentRegistry";
export * from "./orchestrationEngine";
export * from "./contextEngine";
export * from "./csrfProtection";
export * from "./verificationEngine";
export * from "./autonomyPolicy";
export * from "./approvalEngine";
export * from "./artifactEngine";
export * from "./artifactReview";
export * from "./canaryAttestation";
export * from "./completionEvidence";
export * from "./completionQueue";
export * from "./reviewQueue";
export * from "./reviewPreparation";
export * from "./payerIqHandoff";
export * from "./scheduleDefinitions";
export * from "./learningLoop";
export * from "./migrationSet";
export * from "./valueTelemetry";
export * from "./audit";
export * from "./featureFlags";
export * from "./voiceWorkflow";
export * from "./durableStore";
export * from "./sessionLifecycle";

export const scrimedWorkRoute = "/scrimed-work";
export const scrimedWorkApiRoute = "/api/scrimed-work";
export const scrimedWorkBriefRoute = "/api/scrimed-work/brief";
export const scrimedWorkStatus = "scrimed-work-intelligence-platform-active-synthetic-no-phi";
export const scrimedWorkUpdatedAt = "2026-07-13";
export const scrimedWorkBoundary =
  "SCRIMED Work & Intelligence Platform is a synthetic/no-PHI, verification-first control plane for workspace sessions, model/tool routing, agent orchestration, context retrieval, artifacts, schedules, voice simulation, learning loops, governance, auditability, rollback, and value telemetry. It does not authorize live PHI, autonomous clinical care, diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, final imaging interpretation, production connector approval, certification claims, customer go-live, or external model calls.";

export function scrimedWorkHeaders(
  extra: Record<string, string> = {},
  request?: Request
) {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedWorkApiRoute,
    requestedAction: "synthetic no-phi metadata-only work intelligence platform audit preparation internal testing",
    inputText: scrimedWorkBoundary,
    allowMetadataOnly: true
  });

  return {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Work": scrimedWorkStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-metadata-only",
    "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
    "X-SCRIMED-EHR-Writeback": "not-authorized",
    "X-SCRIMED-Payer-Submission": "not-authorized",
    "X-SCRIMED-Patient-Outreach": "human-review-and-consent-required",
    "X-SCRIMED-External-Model-Calls": "disabled-by-default",
    "X-SCRIMED-Consequential-Actions": "disabled-by-default",
    "X-SCRIMED-CSRF-Protection": "exact-same-origin-or-explicit-non-browser",
    ...scrimedWorkMutationRateLimitHeaders(request),
    "X-SCRIMED-Production-Authorization": "not-production-authorized",
    "X-SCRIMED-Customer-Go-Live": "not-authorized",
    "X-SCRIMED-Audit-Boundary": scrimedWorkAuditBoundary,
    ...scrimedSafetyHeaders(safety),
    ...scrimedWorkFeatureFlagHeaders(),
    ...extra
  };
}

export function getScrimedWorkSummary() {
  const sessions = listWorkSessions();
  const featureFlags = getScrimedWorkFeatureFlags();
  const sampleContext = searchScrimedWorkContext({
    query: "care coordination prior authorization FHIR human review",
    tenant: "synthetic-tenant",
    limit: 4
  });
  const mutationRateLimit = getScrimedWorkRateLimitPosture();

  return {
    service: "scrimed-work-intelligence-platform",
    status: scrimedWorkStatus,
    route: scrimedWorkRoute,
    apiRoute: scrimedWorkApiRoute,
    briefRoute: scrimedWorkBriefRoute,
    updated: scrimedWorkUpdatedAt,
    boundary: scrimedWorkBoundary,
    policyVersion: scrimedWorkPolicyVersion,
    persistence: {
      mode: getScrimedWorkDurableStorageMode(),
      durableStoreStatus: scrimedWorkDurableStoreStatus,
      durableStoreEnabled: isScrimedWorkDurableStoreEnabled(),
      protectedWritesRequireAal2: true,
      boundary: scrimedWorkDurableStoreBoundary
    },
    featureFlags,
    workspaces: scrimedWorkspaces,
    sessions,
    sessionCount: sessions.length,
    activeOrReviewSessionCount: sessions.filter((session) =>
      ["active", "awaiting_approval", "verifying", "paused"].includes(session.statusHistory.at(-1)?.status ?? "")
    ).length,
    agents: scrimedWorkAgents,
    tools: getScrimedWorkTools(),
    providers: scrimedWorkProviderRegistry,
    modelRoutes: sampleModelRouteInputs.map(routeScrimedWorkModel),
    context: sampleContext,
    ontology: getHealthcareOntologyRegistry(),
    artifactTemplates: scrimedWorkArtifactTemplates,
    scheduleDefinitions: scrimedWorkScheduleDefinitions,
    voiceSimulation: simulateVoiceWorkflow({
      transcript: "Prepare a care coordination briefing for synthetic demo review.",
      consentAcknowledged: true
    }),
    learningLoopArtifacts: sampleLearningLoopArtifacts,
    orchestrationPreview: previewOrchestration(sessions[0]),
    auditEvents: [
      createAuditEvent({
        eventId: "audit_scrimed_work_summary",
        sessionId: sessions[0].id,
        action: "read_scrimed_work_summary",
        actorId: "synthetic-system",
        tenantId: "synthetic-tenant",
        decision: "allow",
        reason: "Read-only synthetic metadata summary.",
        traceId: "trace_scrimed_work_summary"
      })
    ],
    valueTelemetry: sessions.map((session) => ({
      sessionId: session.id,
      telemetry: session.valueTelemetry
    })),
    lifecycle: sessions.map(getWorkSessionLifecycleSnapshot),
    governanceStatus: {
      definitionOfDoneRequired: true,
      verificationBlocksCompletion: true,
      consequentialActionsDisabled: !featureFlags.consequentialActionsEnabled,
      schedulesDisabledByDefault: !featureFlags.schedulesEnabled,
      voiceSimulationOnly: true,
      externalProviderCallsDisabledByDefault: true,
      humanReviewForHighRisk: true,
      cancellationAndRollbackMetadataRequired: true,
      durableWritesRequireSupabaseAal2RbacRls: true,
      browserWriteCsrfEnforced: true,
      csrfPolicyVersion: scrimedWorkCsrfPolicyVersion,
      csrfBoundary: scrimedWorkCsrfBoundary,
      mutationRateLimit
    },
    productionHardening: getScrimedWorkProductionHardeningGate(),
    nextProductionHardeningStep:
      "Verify the distributed actor/tenant mutation limiter in the exact-release two-identity canary, then add retained no-secret abuse-event evidence and provider-health circuit-breaker telemetry without expanding action authority."
  };
}

export function buildScrimedWorkBrief() {
  const summary = getScrimedWorkSummary();

  return [
    "# SCRIMED Work & Intelligence Platform Brief",
    "",
    `Status: ${summary.status}`,
    `Updated: ${summary.updated}`,
    `Sessions: ${summary.sessionCount}`,
    `Agents: ${summary.agents.length}`,
    `Tools: ${summary.tools.length}`,
    `Providers: ${summary.providers.length}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Control Plane",
    "- Workspace sessions require a Definition-of-Done contract before planning.",
    "- Autonomy follows verification strength, reversibility, evidence quality, privacy sensitivity, and clinical/financial consequence.",
    "- Consequential tools remain disabled and approval-gated by default.",
    "- Protected write routes require AAL2 governance identity, tenant role authorization, server runtime token, idempotency, and the durable-store feature flag.",
    "- Protected mutations use actor and tenant quotas; production requires the distributed provider and fails closed if it is unavailable.",
    "- Retrieved context is treated as untrusted data with citations, tenant metadata, and confidence scores.",
    "- Verification blocks completion when citations, scope, policy, PHI checks, rollback, budget, loop, or approval criteria fail.",
    "- Lifecycle transitions use authoritative durable state, append-only history, independent reviewer checks, and tenant-scoped idempotency.",
    "",
    "## Feature Flags",
    ...Object.entries(summary.featureFlags).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Schedules",
    ...summary.scheduleDefinitions.map((schedule) => `- ${schedule.title}: disabled=${!schedule.enabled}, simulationOnly=${schedule.simulationOnly}`),
    "",
    "## Production Hardening Gate",
    `- Status: ${summary.productionHardening.status}`,
    `- Strict non-production smoke eligible: ${summary.productionHardening.canRunStrictNonProductionSmoke}`,
    `- Canary eligible: ${summary.productionHardening.canaryEligible}`,
    `- Evidence-ready gates: ${summary.productionHardening.summary.evidenceReady}/${summary.productionHardening.summary.totalGates}`,
    `- Operator-required gates: ${summary.productionHardening.summary.operatorRequired}`,
    "",
    "## Next Production-Hardening Step",
    summary.nextProductionHardeningStep
  ].join("\n");
}

export function wrapWorkData<T>(data: T, seed: string): WorkApiEnvelope<T> {
  return envelope(data, seed);
}

async function readBoundedJson(request: Request, action: string, maxBytes = 24000) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return {
      ok: false as const,
      status: 415,
      error: errorEnvelope("scrimed_work_unsupported_content_type", "SCRIMED Work protected writes require application/json.", action, false)
    };
  }

  const rawBody = await request.text();

  if (rawBody.length > maxBytes) {
    return {
      ok: false as const,
      status: 413,
      error: errorEnvelope("scrimed_work_payload_too_large", "SCRIMED Work protected write payload is too large for metadata-only persistence.", action, false)
    };
  }

  try {
    return { ok: true as const, payload: JSON.parse(rawBody) as unknown };
  } catch {
    return {
      ok: false as const,
      status: 400,
      error: errorEnvelope("scrimed_work_invalid_json", "SCRIMED Work protected write payload must be valid JSON.", action, false)
    };
  }
}

type ProtectedAccessMode = "read" | "write";

async function buildProtectedAuthorizationDecision(
  request: Request,
  action: string,
  payload: unknown,
  accessMode: ProtectedAccessMode
) {
  const authorization = request.headers.get("authorization") ?? "";
  const idempotencyKey = request.headers.get("idempotency-key") ?? "";
  const flags = getScrimedWorkFeatureFlags();

  if (!flags.workEnabled) {
    return {
      allowed: false as const,
      status: 503,
      error: errorEnvelope("scrimed_work_disabled", "SCRIMED Work is disabled by feature flag.", action, true)
    };
  }

  if (accessMode === "write" && process.env.SCRIMED_WORK_PROTECTED_WRITES_ENABLED !== "true") {
    return {
      allowed: false as const,
      status: 503,
      error: errorEnvelope(
        "scrimed_work_protected_writes_disabled",
        "SCRIMED Work protected write endpoints are disabled until approved auth, RBAC, rate limiting, and durable storage are configured.",
        action,
        false
      )
    };
  }

  if (accessMode === "write") {
    const provenance = evaluateScrimedWorkWriteRequestProvenance(request);

    if (!provenance.allowed) {
      return {
        allowed: false as const,
        status: 403,
        error: errorEnvelope(
          "scrimed_work_csrf_denied",
          "SCRIMED Work rejected the protected mutation because its browser origin or non-browser request provenance could not be verified.",
          action,
          false
        )
      };
    }
  }

  if (!isScrimedWorkDurableStoreEnabled()) {
    return {
      allowed: false as const,
      status: 503,
      error: errorEnvelope(
        "scrimed_work_durable_store_disabled",
        accessMode === "write"
          ? "SCRIMED Work protected writes require SCRIMED_WORK_DURABLE_STORE_ENABLED=true and the approved Supabase migration before mutation routes can run."
          : "SCRIMED Work protected reads require SCRIMED_WORK_DURABLE_STORE_ENABLED=true and the approved Supabase migration before authoritative records can be retrieved.",
        action,
        false
      )
    };
  }

  if (!isScrimedWorkMigrationSetVerified()) {
    return {
      allowed: false as const,
      status: 503,
      error: errorEnvelope(
        "scrimed_work_migration_set_unverified",
        "SCRIMED Work protected access requires the current reviewed ten-migration set and nonsecret migration evidence before durable routes can run.",
        action,
        false
      )
    };
  }

  if (!authorization.startsWith("Bearer ") || authorization.length < 24) {
    return {
      allowed: false as const,
      status: 401,
      error: errorEnvelope("scrimed_work_auth_required", "A scoped bearer session is required for this protected action.", action, false)
    };
  }

  if (containsTokenLikeField(payload) || containsPhiRisk(payload)) {
    return {
      allowed: false as const,
      status: 400,
      error: errorEnvelope(
        "scrimed_work_sensitive_payload_blocked",
        "SCRIMED Work protected access rejects token-like fields, credentials, PHI, and direct identifiers.",
        action,
        false
      )
    };
  }

  if (accessMode === "write" && (!idempotencyKey || idempotencyKey.length < 8)) {
    return {
      allowed: false as const,
      status: 428,
      error: errorEnvelope("scrimed_work_idempotency_required", "An idempotency-key header is required for protected work mutations.", action, true)
    };
  }

  const workspaceSlug = getScrimedWorkWorkspaceSlug(request, payload);

  if (!workspaceSlug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(workspaceSlug)) {
    return {
      allowed: false as const,
      status: 428,
      error: errorEnvelope(
        "scrimed_work_workspace_slug_required",
        "A tenant-scoped x-scrimed-workspace-slug header, workspaceSlug field, or SCRIMED_WORK_DEFAULT_WORKSPACE_SLUG value is required.",
        action,
        true
      )
    };
  }

  const context = await getAuthenticatedGovernanceContext(request);

  if (!context.ok) {
    return {
      allowed: false as const,
      status: context.status,
      error: errorEnvelope(context.code, context.message, action, false)
    };
  }

  const membership = await resolveScrimedWorkMembership({
    client: context.client,
    user: context.user,
    workspaceSlug
  });

  if (!membership.ok) {
    return {
      allowed: false as const,
      status: membership.status,
      error: errorEnvelope(membership.code, membership.message, action, membership.status >= 500)
    };
  }

  if (accessMode === "write") {
    const mutationRateLimit = await enforceScrimedWorkMutationRateLimit({
      request,
      workspaceId: membership.workspaceId,
      tenantId: membership.tenantId,
      actorId: context.user.id,
      action
    });

    if (!mutationRateLimit.allowed) {
      return {
        allowed: false as const,
        status: mutationRateLimit.status,
        error: errorEnvelope(
          mutationRateLimit.code,
          mutationRateLimit.reason === "provider-unavailable"
            ? "SCRIMED Work protected mutations are unavailable because the required rate-limit control could not be verified."
            : "SCRIMED Work protected mutation quota was exceeded; retry after the bounded window resets.",
          action,
          true
        )
      };
    }
  }

  return {
    allowed: true as const,
    status: 200,
    error: null,
    context: {
      client: context.client,
      user: context.user,
      workspaceSlug,
      idempotencyKey: accessMode === "write" ? idempotencyKey : "read-only-protected-access",
      workspaceId: membership.workspaceId,
      tenantId: membership.tenantId,
      memberRole: membership.memberRole,
      actorRole: membership.actorRole
    } satisfies ScrimedWorkDurableStoreContext
  };
}

export function buildWriteAuthorizationDecision(request: Request, action: string, payload?: unknown) {
  return buildProtectedAuthorizationDecision(request, action, payload, "write");
}

export function buildReadAuthorizationDecision(request: Request, action: string, payload?: unknown) {
  return buildProtectedAuthorizationDecision(request, action, payload, "read");
}

export async function guardedCreateSession(request: Request) {
  const body = await readBoundedJson(request, "create-session");
  if (!body.ok) return { allowed: false as const, status: body.status, error: body.error };

  const auth = await buildWriteAuthorizationDecision(request, "create-session", body.payload);
  if (!auth.allowed) return auth;

  const parsed = parseWorkSessionCreateInput(body.payload);

  if (!parsed.ok) {
    return {
      allowed: false as const,
      status: 400,
      error: errorEnvelope("scrimed_work_invalid_session", parsed.reason, parsed.rejectedField ?? "session", false)
    };
  }

  const session = buildWorkSessionFromContract({
    ...parsed.value,
    tenantId: auth.context.tenantId,
    organizationScope: auth.context.workspaceSlug,
    actor: {
      actorId: auth.context.user.id,
      displayName: "Authenticated SCRIMED Work operator",
      role: auth.context.actorRole,
      tenantId: auth.context.tenantId
    },
    idempotencySeed: auth.context.idempotencyKey,
    definitionOfDone: parsed.value.definitionOfDone
  });
  const durable = await recordScrimedWorkSessionInDurableStore(auth.context, session);

  if (durable.error || !durable.record) {
    const failure = scrimedWorkDurableStoreRpcFailure(durable.error, "scrimed-work-session-record-failed");

    return {
      allowed: false as const,
      status: failure.status,
      error: errorEnvelope(failure.code, failure.message, "create-session", failure.status >= 500)
    };
  }

  return {
    allowed: true as const,
    status: durable.idempotentReplay ? 200 : 201,
    data: {
      session,
      durableStore: {
        status: scrimedWorkDurableStoreStatus,
        persisted: durable.persisted,
        idempotentReplay: durable.idempotentReplay,
        eventId: durable.eventId,
        workspaceSlug: auth.context.workspaceSlug,
        boundary: durable.boundary
      }
    }
  };
}

async function resolveProtectedWorkSession(context: ScrimedWorkDurableStoreContext, sessionId: string): Promise<{
  session: WorkSession | null;
  failure: ReturnType<typeof scrimedWorkDurableStoreRpcFailure> | null;
}> {
  const durable = await fetchScrimedWorkSessionFromDurableStore(context, sessionId);

  if (durable.error || !durable.record?.session) {
    return {
      session: null,
      failure: scrimedWorkDurableStoreRpcFailure(durable.error, "scrimed-work-session-fetch-failed")
    };
  }

  return { session: durable.record.session, failure: null };
}

export async function guardedGetProtectedWorkSession(request: Request, sessionId: string) {
  const auth = await buildReadAuthorizationDecision(request, `read-protected-${sessionId}`, { sessionId });
  if (!auth.allowed) return auth;

  const resolved = await resolveProtectedWorkSession(auth.context, sessionId);
  if (!resolved.session && resolved.failure) {
    return {
      allowed: false as const,
      status: resolved.failure.status,
      error: errorEnvelope(
        resolved.failure.code,
        resolved.failure.message,
        `read-protected-${sessionId}`,
        resolved.failure.status >= 500
      )
    };
  }

  if (!resolved.session) {
    return {
      allowed: false as const,
      status: 404,
      error: errorEnvelope("scrimed_work_session_not_found", "SCRIMED Work session was not found.", sessionId, false)
    };
  }

  return { allowed: true as const, status: 200, data: { session: resolved.session } };
}

export async function guardedVerifyProtectedWorkSession(request: Request, sessionId: string) {
  const session = await guardedGetProtectedWorkSession(request, sessionId);
  if (!session.allowed) return session;

  return {
    allowed: true as const,
    status: 200,
    data: verifyScrimedWorkResult({ session: session.data.session })
  };
}

export async function guardedTransitionSession(
  request: Request,
  sessionId: string,
  action: WorkSessionTransitionAction,
  reason: string
) {
  const auth = await buildWriteAuthorizationDecision(request, `${action}-${sessionId}`, { sessionId, action, reason });
  if (!auth.allowed) return auth;

  if (
    action === "complete" &&
    !isScrimedWorkCompletionOperator(auth.context.memberRole, auth.context.actorRole)
  ) {
    return {
      allowed: false as const,
      status: 403,
      error: errorEnvelope(
        "scrimed_work_completion_operator_required",
        "Verified internal completion requires tenant-admin or pilot-lead membership after independent review.",
        `${action}-${sessionId}`,
        false
      )
    };
  }

  const resolved = await resolveProtectedWorkSession(auth.context, sessionId);

  if (!resolved.session && resolved.failure) {
    return {
      allowed: false as const,
      status: resolved.failure.status,
      error: errorEnvelope(resolved.failure.code, resolved.failure.message, `${action}-${sessionId}`, resolved.failure.status >= 500)
    };
  }

  if (!resolved.session) {
    return {
      allowed: false as const,
      status: 404,
      error: errorEnvelope("scrimed_work_session_not_found", "SCRIMED Work session was not found.", sessionId, false)
    };
  }

  const completionArtifact =
    action === "complete"
      ? resolved.session.artifacts.find(
          (artifact) =>
            artifact.reviewStatus === "reviewed" &&
            artifact.verification.eligibleForCompletion
        )
      : undefined;

  if (action === "complete" && !completionArtifact) {
    return {
      allowed: false as const,
      status: 422,
      error: errorEnvelope(
        "scrimed_work_completion_verification_required",
        "Completion requires a durably bound, independently reviewed artifact with current mandatory verification evidence.",
        `${action}-${sessionId}`,
        false
      )
    };
  }

  const completionVerification = completionArtifact
    ? verifyScrimedWorkResult({
        session: resolved.session,
        artifact: completionArtifact
      })
    : undefined;

  const lifecycle = evaluateWorkSessionTransition({
    session: resolved.session,
    action,
    actor: {
      actorId: auth.context.user.id,
      role: auth.context.actorRole
    },
    verification: completionVerification
  });

  if (!lifecycle.allowed) {
    return {
      allowed: false as const,
      status: lifecycle.code === "terminal-session" ? 409 : 422,
      error: errorEnvelope(`scrimed_work_${lifecycle.code.replaceAll("-", "_")}`, lifecycle.reason, lifecycle.decisionHash, false),
      lifecycle
    };
  }

  const session = buildTransitionedWorkSession(resolved.session, lifecycle, reason);

  const durable = await transitionScrimedWorkSessionInDurableStore(auth.context, {
    sessionId,
    status: lifecycle.targetStatus,
    reason,
    session,
    action,
    lifecycleDecisionHash: lifecycle.decisionHash
  });

  if (durable.error || !durable.record) {
    const failure = scrimedWorkDurableStoreRpcFailure(durable.error, "scrimed-work-session-transition-failed");

    return {
      allowed: false as const,
      status: failure.status,
      error: errorEnvelope(failure.code, failure.message, `${action}-${sessionId}`, failure.status >= 500)
    };
  }

  return {
    allowed: true as const,
    status: 200,
    data: {
      session,
      lifecycle,
      ...(completionVerification ? { verification: completionVerification } : {}),
      durableStore: {
        status: scrimedWorkDurableStoreStatus,
        transitioned: durable.transitioned,
        idempotentReplay: durable.idempotentReplay,
        eventId: durable.eventId,
        workspaceSlug: auth.context.workspaceSlug,
        boundary: durable.boundary
      }
    }
  };
}

export async function guardedRecordArtifact(request: Request, action: string, artifact: WorkArtifact, sessionId: string) {
  const auth = await buildWriteAuthorizationDecision(request, action, { sessionId, artifactId: artifact.artifactId, artifactType: artifact.type });
  if (!auth.allowed) return auth;

  const durable = await recordScrimedWorkArtifactInDurableStore(auth.context, {
    sessionId,
    artifact
  });

  if (durable.error || !durable.artifactId) {
    const failure = scrimedWorkDurableStoreRpcFailure(durable.error, "scrimed-work-artifact-record-failed");

    return {
      allowed: false as const,
      status: failure.status,
      error: errorEnvelope(failure.code, failure.message, action, failure.status >= 500)
    };
  }

  return {
    allowed: true as const,
    status: durable.idempotentReplay ? 200 : 201,
    data: {
      artifact,
      durableStore: {
        status: scrimedWorkDurableStoreStatus,
        persisted: durable.persisted,
        idempotentReplay: durable.idempotentReplay,
        eventId: durable.eventId,
        workspaceSlug: auth.context.workspaceSlug,
        boundary: durable.boundary
      }
    }
  };
}

export async function guardedCreateArtifact(request: Request) {
  const body = await readBoundedJson(request, "artifact-create", 16000);
  if (!body.ok) return { allowed: false as const, status: body.status, error: body.error };

  const parsed = parseArtifactRequest(body.payload);

  if (!parsed.ok) {
    return {
      allowed: false as const,
      status: 400,
      error: errorEnvelope("scrimed_work_invalid_artifact", parsed.reason, parsed.rejectedField ?? "artifact", false)
    };
  }

  const auth = await buildWriteAuthorizationDecision(request, "artifact-create", body.payload);
  if (!auth.allowed) return auth;

  const resolved = await resolveProtectedWorkSession(auth.context, parsed.value.sessionId);

  if (!resolved.session && resolved.failure) {
    return {
      allowed: false as const,
      status: resolved.failure.status,
      error: errorEnvelope(resolved.failure.code, resolved.failure.message, "artifact-create", resolved.failure.status >= 500)
    };
  }

  if (!resolved.session) {
    return {
      allowed: false as const,
      status: 404,
      error: errorEnvelope("scrimed_work_session_not_found", "SCRIMED Work session was not found.", parsed.value.sessionId, false)
    };
  }

  const artifact = buildScrimedWorkArtifact({
    session: resolved.session,
    type: parsed.value.type,
    title: parsed.value.title
  });
  const durable = await recordScrimedWorkArtifactInDurableStore(auth.context, {
    sessionId: parsed.value.sessionId,
    artifact
  });

  if (durable.error || !durable.artifactId) {
    const failure = scrimedWorkDurableStoreRpcFailure(durable.error, "scrimed-work-artifact-record-failed");

    return {
      allowed: false as const,
      status: failure.status,
      error: errorEnvelope(failure.code, failure.message, "artifact-create", failure.status >= 500)
    };
  }

  return {
    allowed: true as const,
    status: durable.idempotentReplay ? 200 : 201,
    data: {
      artifact,
      durableStore: {
        status: scrimedWorkDurableStoreStatus,
        persisted: durable.persisted,
        idempotentReplay: durable.idempotentReplay,
        eventId: durable.eventId,
        workspaceSlug: auth.context.workspaceSlug,
        boundary: durable.boundary
      }
    }
  };
}

function scopedIdempotencyKey(seed: string, scope: string) {
  return `scrimed-work-${scope}-${createAuditHash({ seed, scope }).slice(0, 24)}`;
}

export async function guardedCreatePayerIqProtectedHandoff(request: Request) {
  const body = await readBoundedJson(request, "payeriq-protected-handoff", 12_000);
  if (!body.ok) return { allowed: false as const, status: body.status, error: body.error };

  const parsed = parsePayerIqProtectedHandoffInput(body.payload);
  if (!parsed.ok) {
    return {
      allowed: false as const,
      status: 422,
      error: errorEnvelope("payeriq_protected_handoff_invalid", parsed.reason, "payeriq-protected-handoff", false)
    };
  }

  const auth = await buildWriteAuthorizationDecision(request, "payeriq-protected-handoff", body.payload);
  if (!auth.allowed) return auth;

  const idempotencySeed = scopedIdempotencyKey(auth.context.idempotencyKey, "payeriq-handoff");
  const { session, artifact } = buildPayerIqProtectedWorkSession({
    packet: parsed.packet,
    actor: {
      actorId: auth.context.user.id,
      displayName: "Authenticated PayerIQ operator",
      role: auth.context.actorRole,
      tenantId: auth.context.tenantId
    },
    tenantId: auth.context.tenantId,
    workspaceSlug: auth.context.workspaceSlug,
    idempotencySeed
  });
  const sessionContext = {
    ...auth.context,
    idempotencyKey: scopedIdempotencyKey(auth.context.idempotencyKey, "payeriq-session")
  };
  const artifactContext = {
    ...auth.context,
    idempotencyKey: scopedIdempotencyKey(auth.context.idempotencyKey, "payeriq-artifact")
  };
  const durableSession = await recordScrimedWorkSessionInDurableStore(sessionContext, session);

  if (durableSession.error || !durableSession.record) {
    const failure = scrimedWorkDurableStoreRpcFailure(
      durableSession.error,
      "payeriq-scrimed-work-session-record-failed"
    );
    return {
      allowed: false as const,
      status: failure.status,
      error: errorEnvelope(failure.code, failure.message, "payeriq-protected-handoff", true)
    };
  }

  const durableArtifact = await recordScrimedWorkArtifactInDurableStore(artifactContext, {
    sessionId: session.id,
    artifact
  });

  if (durableArtifact.error || !durableArtifact.artifactId) {
    const failure = scrimedWorkDurableStoreRpcFailure(
      durableArtifact.error,
      "payeriq-scrimed-work-artifact-record-failed"
    );
    return {
      allowed: false as const,
      status: failure.status,
      error: errorEnvelope(
        failure.code,
        `${failure.message} The durable session can be safely retried with the same idempotency key.`,
        session.id,
        true
      )
    };
  }

  return {
    allowed: true as const,
    status:
      durableSession.idempotentReplay && durableArtifact.idempotentReplay ? 200 : 201,
    data: {
      session,
      artifact,
      packet: parsed.packet,
      durableStore: {
        persisted: durableSession.persisted && durableArtifact.persisted,
        sessionIdempotentReplay: durableSession.idempotentReplay,
        artifactIdempotentReplay: durableArtifact.idempotentReplay,
        sessionEventId: durableSession.eventId,
        artifactEventId: durableArtifact.eventId,
        workspaceSlug: auth.context.workspaceSlug,
        boundary: durableArtifact.boundary
      },
      nextRequiredActions: [
        "plan the durable session",
        "run it into awaiting approval",
        "record approval with a separate AAL2 reviewer",
        "bind the artifact review disposition",
        "run mandatory verification",
        "complete the session only after all mandatory criteria pass"
      ],
      ...payerIqProtectedHandoffAuthority
    }
  };
}

export async function guardedListProtectedArtifactReviewQueue(request: Request) {
  const limit = parseScrimedWorkReviewQueueLimit(new URL(request.url).searchParams.get("limit"));
  if (!limit.ok) {
    return {
      allowed: false as const,
      status: 422,
      error: errorEnvelope(
        "scrimed_work_review_queue_invalid_limit",
        limit.reason,
        "artifact-review-queue-read",
        false
      )
    };
  }

  const auth = await buildReadAuthorizationDecision(request, "artifact-review-queue-read", {
    limit: limit.value
  });
  if (!auth.allowed) return auth;

  if (auth.context.memberRole !== "reviewer" || auth.context.actorRole !== "reviewer") {
    return {
      allowed: false as const,
      status: 403,
      error: errorEnvelope(
        "scrimed_work_review_queue_reviewer_required",
        "SCRIMED Work review queue access requires a separately authorized reviewer membership.",
        "artifact-review-queue-read",
        false
      )
    };
  }

  const durable = await listScrimedWorkArtifactReviewQueueInDurableStore(
    auth.context,
    limit.value
  );
  if (durable.error || !durable.queue) {
    const failure = scrimedWorkDurableStoreRpcFailure(
      durable.error,
      "scrimed-work-review-queue-unavailable"
    );
    return {
      allowed: false as const,
      status: failure.status,
      error: errorEnvelope(
        failure.code,
        failure.message,
        "artifact-review-queue-read",
        failure.status >= 500
      )
    };
  }

  return {
    allowed: true as const,
    status: 200,
    data: {
      queue: durable.queue,
      authorization: {
        memberRole: auth.context.memberRole,
        reviewerOnly: true,
        aal2Required: true,
        tenantScoped: true,
        metadataOnly: true,
        auditEventId: durable.queue.auditEventId
      },
      policyVersion: scrimedWorkReviewQueuePolicyVersion,
      boundary: scrimedWorkReviewQueueBoundary
    }
  };
}

export async function guardedListProtectedCompletionQueue(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const limit = parseScrimedWorkCompletionQueueLimit(searchParams.get("limit"));
  if (!limit.ok) {
    return {
      allowed: false as const,
      status: 422,
      error: errorEnvelope(
        "scrimed_work_completion_queue_invalid_limit",
        limit.reason,
        "completion-queue-read",
        false
      )
    };
  }

  const mode = parseScrimedWorkCompletionReadMode(searchParams.get("mode"));
  if (!mode.ok) {
    return {
      allowed: false as const,
      status: 422,
      error: errorEnvelope(
        "scrimed_work_completion_read_invalid_mode",
        mode.reason,
        "completion-read",
        false
      )
    };
  }

  const action = mode.value === "evidence" ? "completion-evidence-read" : "completion-queue-read";
  const auth = await buildReadAuthorizationDecision(request, action, {
    limit: limit.value,
    mode: mode.value
  });
  if (!auth.allowed) return auth;

  if (!isScrimedWorkCompletionOperator(auth.context.memberRole, auth.context.actorRole)) {
    return {
      allowed: false as const,
      status: 403,
      error: errorEnvelope(
        "scrimed_work_completion_queue_operator_required",
        "SCRIMED Work completion access requires tenant-admin or pilot-lead membership.",
        action,
        false
      )
    };
  }

  if (mode.value === "evidence") {
    const durable = await listScrimedWorkCompletionEvidenceInDurableStore(
      auth.context,
      limit.value
    );
    if (durable.error || !durable.evidence) {
      const failure = scrimedWorkDurableStoreRpcFailure(
        durable.error,
        "scrimed-work-completion-evidence-unavailable"
      );
      return {
        allowed: false as const,
        status: failure.status,
        error: errorEnvelope(
          failure.code,
          failure.message,
          action,
          failure.status >= 500
        )
      };
    }

    const canaryAttestation = await buildScrimedWorkCanaryAttestation({
      evidence: durable.evidence,
      releaseSha: getScrimedWorkRuntimeReleaseSha(),
      signingSecret: process.env.SCRIMED_PILOT_INTAKE_PERSISTENCE_TOKEN
    });

    return {
      allowed: true as const,
      status: 200,
      data: {
        mode: "evidence" as const,
        evidence: durable.evidence,
        canaryAttestation,
        authorization: {
          memberRole: auth.context.memberRole,
          operatorOnly: true,
          aal2Required: true,
          tenantScoped: true,
          metadataOnly: true,
          internalUseOnly: true,
          auditEventId: durable.evidence.auditEventId
        },
        policyVersion: scrimedWorkCompletionEvidencePolicyVersion,
        canaryAttestationPolicyVersion: scrimedWorkCanaryAttestationPolicyVersion,
        boundary: scrimedWorkCompletionEvidenceBoundary,
        canaryAttestationBoundary: scrimedWorkCanaryAttestationBoundary
      }
    };
  }

  const durable = await listScrimedWorkCompletionQueueInDurableStore(
    auth.context,
    limit.value
  );
  if (durable.error || !durable.queue) {
    const failure = scrimedWorkDurableStoreRpcFailure(
      durable.error,
      "scrimed-work-completion-queue-unavailable"
    );
    return {
      allowed: false as const,
      status: failure.status,
      error: errorEnvelope(
        failure.code,
        failure.message,
        "completion-queue-read",
        failure.status >= 500
      )
    };
  }

  return {
    allowed: true as const,
    status: 200,
    data: {
      mode: "ready" as const,
      queue: durable.queue,
      authorization: {
        memberRole: auth.context.memberRole,
        operatorOnly: true,
        aal2Required: true,
        tenantScoped: true,
        metadataOnly: true,
        auditEventId: durable.queue.auditEventId
      },
      policyVersion: scrimedWorkCompletionQueuePolicyVersion,
      boundary: scrimedWorkCompletionQueueBoundary
    }
  };
}

export async function guardedReviewProtectedArtifact(
  request: Request,
  sessionId: string,
  artifactId: string
) {
  const body = await readBoundedJson(request, `artifact-review-${sessionId}`, 4_000);
  if (!body.ok) return { allowed: false as const, status: body.status, error: body.error };

  const parsed = parseArtifactReviewInput(body.payload);
  if (!parsed.ok) {
    return {
      allowed: false as const,
      status: 422,
      error: errorEnvelope("scrimed_work_artifact_review_invalid", parsed.reason, artifactId, false)
    };
  }

  const auth = await buildWriteAuthorizationDecision(
    request,
    `artifact-review-${sessionId}-${artifactId}`,
    { sessionId, artifactId, ...parsed.value }
  );
  if (!auth.allowed) return auth;

  const resolved = await resolveProtectedWorkSession(auth.context, sessionId);
  if (!resolved.session && resolved.failure) {
    return {
      allowed: false as const,
      status: resolved.failure.status,
      error: errorEnvelope(
        resolved.failure.code,
        resolved.failure.message,
        `artifact-review-${sessionId}`,
        resolved.failure.status >= 500
      )
    };
  }

  if (!resolved.session) {
    return {
      allowed: false as const,
      status: 404,
      error: errorEnvelope("scrimed_work_session_not_found", "SCRIMED Work session was not found.", sessionId, false)
    };
  }

  const decision = evaluateArtifactReview({
    session: resolved.session,
    artifactId,
    actor: { actorId: auth.context.user.id, role: auth.context.actorRole },
    review: parsed.value
  });

  if (!decision.allowed || !decision.reviewedArtifact) {
    const status = decision.code.includes("role") || decision.code.includes("separation")
      ? 403
      : decision.code.includes("state")
        ? 409
        : 422;
    return {
      allowed: false as const,
      status,
      error: errorEnvelope(
        `scrimed_work_${decision.code.replaceAll("-", "_")}`,
        decision.code === "artifact-review-verification-required"
          ? "Artifact approval remains blocked until mandatory verification passes."
          : "Artifact review was denied by the independent-review lifecycle policy.",
        decision.reviewDecisionHash,
        false
      ),
      decision
    };
  }

  const durable = await reviewScrimedWorkArtifactInDurableStore(auth.context, {
    sessionId,
    artifact: decision.reviewedArtifact,
    decision
  });

  if (durable.error || !durable.record || !durable.reviewId) {
    const failure = scrimedWorkDurableStoreRpcFailure(
      durable.error,
      "scrimed-work-artifact-review-failed"
    );
    return {
      allowed: false as const,
      status: failure.status,
      error: errorEnvelope(failure.code, failure.message, decision.reviewDecisionHash, failure.status >= 500)
    };
  }

  return {
    allowed: true as const,
    status: 200,
    data: {
      session: durable.record.session,
      artifact: decision.reviewedArtifact,
      decision,
      durableStore: {
        reviewId: durable.reviewId,
        eventId: durable.eventId,
        reviewed: durable.reviewed,
        idempotentReplay: durable.idempotentReplay,
        workspaceSlug: auth.context.workspaceSlug,
        boundary: durable.boundary
      }
    }
  };
}

export function getSessionOrError(sessionId: string) {
  const session = getWorkSession(sessionId);

  if (!session) {
    return {
      ok: false as const,
      status: 404,
      body: errorEnvelope("scrimed_work_session_not_found", "SCRIMED Work session was not found.", sessionId, false)
    };
  }

  return { ok: true as const, status: 200, body: envelope(session, sessionId) };
}
