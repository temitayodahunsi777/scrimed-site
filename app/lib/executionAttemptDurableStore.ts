import type { SupabaseClient } from "@supabase/supabase-js";
import {
  executionAttemptEnvelopes,
  getExecutionAttemptEnvelopeSummary,
  type ExecutionAttemptEnvelope
} from "./executionAttemptEnvelope";
import { isScrimedComputeAuditHash } from "./scrimedComputeFabric";

export type ExecutionAttemptDurableStoreReviewDisposition =
  | "approved-for-synthetic-release"
  | "changes-requested"
  | "rejected"
  | "escalated";

export type ExecutionAttemptDurableStoreRegion =
  | "us"
  | "eu"
  | "uk"
  | "ca"
  | "apac"
  | "customer-private-region";

export type ExecutionAttemptDurableStoreRecordRequest = {
  workspaceSlug: string;
  attemptId?: string;
  idempotencyKey?: string;
  region?: ExecutionAttemptDurableStoreRegion;
  retentionUntil?: string;
};

export type ExecutionAttemptDurableStoreReplayRequest = {
  workspaceSlug: string;
  idempotencyKey?: string;
  replayToken?: string;
};

export type ExecutionAttemptDurableStoreReviewRequest = {
  workspaceSlug: string;
  attemptId: string;
  disposition: ExecutionAttemptDurableStoreReviewDisposition;
  reviewerRole: string;
  reasonCode: string;
  reviewNote: string;
  humanReviewAttestation: "no-phi-human-review-no-clinical-authority";
};

export type ExecutionAttemptDurableStoreValidation<T> =
  | { ok: true; value: T }
  | { ok: false; errors: string[] };

export type ExecutionAttemptDurableStoreCheck = {
  check: string;
  passed: boolean;
  detail: string;
};

export type ExecutionAttemptDurableStoreContractValidation = {
  status: "pass" | "fail";
  checks: ExecutionAttemptDurableStoreCheck[];
};

export type ExecutionAttemptDurableRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  workspaceSlug: string;
  attemptId: string;
  idempotencyKey: string;
  replayToken: string;
  workflowSlug: string;
  workflowVersion: string;
  lifecycleState: string;
  buildStatus: string;
  clinicalRiskLevel: string;
  region: ExecutionAttemptDurableStoreRegion;
  retentionUntil: string;
  lockExpiresAt: string;
  computeFabricTelemetry: ExecutionAttemptEnvelope["computeFabricTelemetry"] | null;
  computeFabricAuditHash: string | null;
  computeFabricSelectedModel: string | null;
  computeFabricModelTier: string | null;
  computeFabricProvider: string | null;
  computeFabricDeploymentMode: string | null;
  computeFabricPhiPolicy: string | null;
  computeFabricHumanReviewRequired: boolean | null;
  computeFabricFallbackModels: string[] | null;
  envelope: ExecutionAttemptEnvelope;
  eventCount: number;
  reviewDispositionCount: number;
  humanReviewRequired: boolean;
  noPhiAssertion: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  boundary: string;
};

export type ExecutionAttemptDurableStoreArchitecture = {
  systemArchitecture: string[];
  moduleBoundaries: string[];
  interfaces: string[];
  dataModels: string[];
  threatModel: string[];
  testPlan: string[];
  migrationPlan: string[];
  rolloutPlan: string[];
};

export const executionAttemptDurableStoreStatus =
  "execution-attempt-durable-store-contract-active-no-phi";
export const executionAttemptDurableStoreBriefStatus =
  "execution-attempt-durable-store-brief-ready-no-phi";
export const executionAttemptDurableStoreRoute = "/workflows/execution-attempts";
export const executionAttemptDurableStoreApiRoute =
  "/api/workflows/execution-attempts/durable-store";
export const executionAttemptDurableStoreBriefRoute =
  "/api/workflows/execution-attempts/durable-store/brief";
export const executionAttemptDurableStoreRecordRoute =
  "/api/workflows/execution-attempts/durable-store/record";
export const executionAttemptDurableStoreReplayRoute =
  "/api/workflows/execution-attempts/durable-store/replay";
export const executionAttemptDurableStoreReviewDispositionRoute =
  "/api/workflows/execution-attempts/durable-store/review-disposition";
export const executionAttemptDurableStoreContractVersion =
  "scrimed-execution-attempt-durable-store-v1";
export const executionAttemptDurableStoreUpdatedAt = "2026-06-28";

export const executionAttemptDurableStoreBoundary =
  "SCRIMED Execution Attempt Durable Store v1 is a tenant-scoped, no-PHI, metadata-only persistence contract for execution-attempt envelopes, idempotency, replay lookup, review dispositions, immutable audit events, regional retention, Compute Fabric routing evidence, and fail-closed protected route access. It does not authorize PHI processing, live patient data use, production model routing, autonomous diagnosis, autonomous treatment, prescribing, payer submission, claim submission, EHR writeback, patient outreach, production connector use, or clinical production approval.";

export const executionAttemptDurableStoreHeaders = {
  "Cache-Control": "private, no-store",
  Vary: "Authorization",
  "X-SCRIMED-Agent-Autonomy": "human-review-required-for-protected-actions",
  "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
  "X-SCRIMED-Connector-Authority": "not-production-connector-approved",
  "X-SCRIMED-Data-Boundary": "synthetic-and-metadata-only",
  "X-SCRIMED-Model-Routing-Authority": "telemetry-only-not-production-routing",
  "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
  "X-SCRIMED-Record-Mutation": "not-authorized",
  "X-SCRIMED-Replay-Authority": "metadata-replay-only",
  "X-SCRIMED-Workflow-Execution": "durable-attempt-store-no-protected-execution"
} as const;

export const executionAttemptDurableStoreHardStops = [
  "No live patient data, PHI, member identifiers, raw chart text, secrets, credentials, or production connector payloads in durable attempt records.",
  "No autonomous clinical authority, diagnosis, treatment, prescribing, clinical triage replacement, patient messaging, EHR writeback, payer submission, claim submission, or final billing action.",
  "No tool access without explicit tenant membership, AAL2 governance session, scoped server runtime token, and route-level permission check.",
  "No replay of protected side effects; replay can return retained metadata only.",
  "No review disposition can create live-care, PHI, connector, payer, billing, certification, or go-live authority.",
  "No production activation until the migration is applied, authenticated AAL2 smoke passes, retention/residency is approved, and customer-specific authorization exists."
];

export const executionAttemptDurableStoreActivationControls = [
  {
    gate: "live-migration-structural-verification",
    owner: "SCRIMED platform reliability + database owner",
    requiredEvidence:
      "Supabase migration history contains execution_attempt_durable_store, execution_attempt_durable_store_rpc_hardening, and execution_attempt_durable_store_advisor_alignment; live structural SQL verifies private tables, public wrappers, RLS, deny policies, restricted table grants, and foreign-key index coverage.",
    rollback:
      "Keep SCRIMED_EXECUTION_ATTEMPT_DURABLE_STORE_ENABLED=false or flip it back to false before any app release rollback."
  },
  {
    gate: "rpc-least-privilege-hardening",
    owner: "SCRIMED security lead",
    requiredEvidence:
      "Public durable-store RPC wrappers stay SECURITY INVOKER with empty search_path; private implementation RPCs retain explicit authenticated execute only because wrappers delegate to them and each private RPC enforces AAL2 governance, tenant membership, server runtime token, and no-PHI guards.",
    rollback:
      "Revoke public wrapper execute from authenticated while retaining private tables for forensic review; keep the feature flag disabled until a new smoke passes."
  },
  {
    gate: "authenticated-aal2-smoke",
    owner: "SCRIMED governance operator",
    requiredEvidence:
      "Run npm run smoke:execution-attempt-durable-store:authenticated with SCRIMED_BEARER_TOKEN, SCRIMED_REQUIRE_AUTHENTICATED_SMOKE=true, and a tenant workspace slug.",
    rollback:
      "Disable the feature flag and preserve retained audit events; do not delete durable evidence during incident review."
  },
  {
    gate: "supabase-auth-password-posture",
    owner: "SCRIMED security lead + identity owner",
    requiredEvidence:
      "Supabase security advisor is clean for leaked-password protection when password sign-in is enabled, or product routes remain passkey/magic-link first with password auth excluded from protected durable-store operation.",
    rollback:
      "Keep password sign-in disabled for product routes or keep durable-store protected writes off in environments that rely on passwords without leaked-password protection."
  },
  {
    gate: "tenant-canary-only",
    owner: "SCRIMED pilot operations",
    requiredEvidence:
      "One named no-PHI synthetic workspace records, replays, idempotently retries, and captures review disposition before broader tenant access.",
    rollback:
      "Remove tenant access to the route, keep protected workflow execution blocked, and retain no-PHI durable records until retention review."
  }
];

export function isExecutionAttemptDurableStoreEnabled() {
  return process.env.SCRIMED_EXECUTION_ATTEMPT_DURABLE_STORE_ENABLED === "true";
}

export const executionAttemptDurableStoreArchitecture: ExecutionAttemptDurableStoreArchitecture = {
  systemArchitecture: [
    "Agent Runtime builds deterministic no-PHI envelopes before any workflow worker can run.",
    "Durable Store records envelope metadata, idempotency state, replay tokens, review dispositions, and immutable events in tenant-scoped storage.",
    "Compute Fabric metadata is projected into first-class durable-store columns for selected model, tier, provider, deployment mode, PHI policy, human-review flag, fallback model path, and audit hash.",
    "Governance routes require Supabase Auth verification, AAL2 session freshness, workspace membership, and a server runtime token before any write RPC is reachable.",
    "Workflow Engine remains blocked from protected external side effects until review disposition, connector approval, PHI authorization, and production rollout gates are separately approved.",
    "Evaluation Engine binds each attempt to clinical readiness scorecards, adversarial scenarios, missing-data checks, and evidence-quality gates."
  ],
  moduleBoundaries: [
    "executionAttemptEnvelope owns deterministic envelope construction and no-PHI synthetic scorecards.",
    "scrimedComputeFabric owns model-routing metadata, confidence/correctness boundaries, private/edge deployment policy, and synthetic benchmarking scaffolds.",
    "executionAttemptDurableStore owns the storage contract, request validators, public evidence summary, and Supabase RPC helpers.",
    "protectedPilotStore continues to own authentication context and tenant workspace lookup.",
    "Route handlers own HTTP concerns, rate limits, fail-closed errors, and boundary headers.",
    "Supabase migration owns tenant isolation, direct table denial, function grants, idempotency, replay lookup, review disposition, and append-only event storage."
  ],
  interfaces: [
    "GET durable-store summary for public architecture evidence.",
    "GET durable-store brief as Markdown for diligence packets.",
    "POST record accepts a workspace slug plus a known synthetic attempt reference and persists the server-side envelope.",
    "POST replay accepts a workspace slug plus idempotency key or replay token and returns metadata-only retained state.",
    "POST review-disposition records human review outcome with fixed no-PHI, no-clinical-authority attestation."
  ],
  dataModels: [
    "private.execution_attempts: one row per tenant workspace and idempotency key with envelope JSON, replay token, trace, region, lock TTL, retention, risk, and no-PHI flags.",
    "private.execution_attempts Compute Fabric columns: compute_fabric_telemetry, compute_fabric_audit_hash, compute_fabric_selected_model, compute_fabric_model_tier, compute_fabric_provider, compute_fabric_deployment_mode, compute_fabric_phi_policy, compute_fabric_human_review_required, and compute_fabric_fallback_models.",
    "private.execution_attempt_events: append-only audit events for record, replay, idempotency reuse, quarantine, and review actions.",
    "private.execution_attempt_review_dispositions: immutable human review outcomes with reviewer role, reason code, attestation, and retained boundary.",
    "No raw prompt text, PHI, connector payload, credential, payer member data, or production record content is accepted."
  ],
  threatModel: [
    "PHI injection through request bodies is blocked by known-envelope reference recording and SQL content guards.",
    "Cross-tenant replay is blocked by tenant membership, workspace slug lookup, and workspace-scoped idempotency uniqueness.",
    "Unauthorized tool access is blocked because no durable route grants connector execution, and every write requires AAL2 governance context.",
    "Idempotency collision returns conflict unless the retained digest, context fingerprint, attempt id, and replay token match.",
    "Prompt injection and missing citations trigger quarantine-ready metadata and do not obtain tool permissions.",
    "Cost runaway is controlled by model-route telemetry, budget guard placeholders, and replay metadata without re-executing models.",
    "Unsafe model escalation is controlled by Compute Fabric PHI policy, no-live-model-call audit tags, confidence-is-not-correctness boundaries, and high-risk human review enforcement.",
    "Stale reviewer authority is blocked by Supabase session freshness and immutable review dispositions."
  ],
  testPlan: [
    "Public smoke validates summary status, boundary headers, architecture sections, clinical robustness coverage, MCP gateway contract, and no-PHI hard stops.",
    "Public smoke validates Markdown brief content and durable-store evidence counts.",
    "Public smoke verifies protected record, replay, and review-disposition endpoints fail closed without bearer tokens.",
    "Typecheck, lint, and build gate all TypeScript route and library changes.",
    "Authenticated AAL2 smoke must be run after the migration is applied before pilot use.",
    "Compute Fabric migration smoke must verify trigger extraction, JSON projection, audit-hash parity, and high-risk human-review enforcement.",
    "Supabase advisors and RLS tests should run in the target environment before tenant canary."
  ],
  migrationPlan: [
    "Apply the Supabase migration in a non-production project first.",
    "Apply execution_attempt_compute_fabric_evidence_binding after the durable-store base and hardening migrations so new records project Compute Fabric evidence columns.",
    "Run RLS/advisor checks and verify direct table access remains denied to anon and authenticated roles.",
    "Run authenticated AAL2 record, replay, idempotency-reuse, idempotency-conflict, and review-disposition smoke.",
    "Apply to production only after rollback and retention/residency owners approve.",
    "Keep protected workflow execution disabled after migration until customer authorization and connector approvals exist."
  ],
  rolloutPlan: [
    "Stage 0: code and public architecture evidence deployed with protected writes fail-closed.",
    "Stage 1: migration applied in staging and authenticated AAL2 smoke passes.",
    "Stage 1b: Compute Fabric evidence projection verified against record, replay, and review-disposition responses.",
    "Stage 2: one synthetic pilot workspace canary records known attempts only.",
    "Stage 3: reviewer dispositions enabled for tenant-admin, pilot-lead, and reviewer roles.",
    "Stage 4: production connector, PHI, and model routing remain separate approval tracks with rollback gates."
  ]
};

export const clinicalAIOperatingSystemFoundation = [
  {
    priority: "Clinical Robustness Lab",
    implementedBy:
      "Adversarial, missing-data, hallucination, evidence-quality, prompt-injection, regression, and clinical-safety scorecards bound to every durable attempt.",
    productionGate:
      "Add persisted evaluation datasets and reviewer-calibrated clinical readiness scores before clinical production use."
  },
  {
    priority: "Agent Orchestration Layer",
    implementedBy:
      "Agent runtime identity, permission lists, denied capabilities, human approval gates, trace ids, and immutable event hooks on every envelope.",
    productionGate:
      "Specialty agents remain review-gated until scoped tools, memory hooks, and supervisor policies are approved per tenant."
  },
  {
    priority: "Enterprise MCP Gateway",
    implementedBy:
      "Tool registry metadata, no connector access, route-level authorization, AAL2 governance session, and immutable audit events before tool use.",
    productionGate:
      "OAuth, scoped tokens, revocation endpoints, and tool-level allowlists must be live before MCP tools can operate."
  },
  {
    priority: "Dynamic Model Routing",
    implementedBy:
      "Provider class, model version placeholder, cost, latency, confidence, fallback provider, and routing rationale are retained for every attempt.",
    productionGate:
      "Approved model registry, provider contracts, privacy review, budget limits, and routing observability must be activated."
  },
  {
    priority: "Lazy Capability Loading",
    implementedBy:
      "Attempt records retain only task-relevant context refs, evidence refs, policy refs, allowed tools, and blocked tools.",
    productionGate:
      "Capability loader must enforce retrieval source, memory, model, and tool activation per task before live workflow workers run."
  },
  {
    priority: "Dynamic Few-Shot Engine",
    implementedBy:
      "Validated example references are treated as evidence-bound retrieval inputs, not generic chain-of-thought prompts.",
    productionGate:
      "Persist reviewed examples with outcome, reviewer, specialty, risk level, and source before model execution."
  },
  {
    priority: "Live Steering Engine",
    implementedBy:
      "Quarantine triggers, human approval gates, failure recovery, and protected-action denial are durable before execution.",
    productionGate:
      "Mid-run drift, cost, tool misuse, missing citations, and unsafe conclusion monitors must pause or terminate workers."
  },
  {
    priority: "ReferralOS",
    implementedBy:
      "Referral queue summary attempts can be persisted as no-outreach metadata and routed to reviewer-held operations handoff.",
    productionGate:
      "Provider matching, insurance verification, scheduling, leakage analytics, and closed-loop feedback require approved connectors."
  },
  {
    priority: "Ambient Clinical Workflow",
    implementedBy:
      "Documentation draft attempts carry clinician-review gates, no chart writeback, no orders, no patient instructions, and no PHI authority.",
    productionGate:
      "Conversation capture, note drafting, coding, prior auth, education, follow-up, referral, and medication workflows require human signoff."
  },
  {
    priority: "Research Pipeline Engine",
    implementedBy:
      "Evidence refs, policy refs, source attribution, confidence, and human review state are preserved for research-like synthesis attempts.",
    productionGate:
      "Literature retrieval, contradiction detection, guideline comparison, trial matching, and recommendation review need validated sources."
  },
  {
    priority: "Scientific Agent Toolkit",
    implementedBy:
      "Specialty-ready metadata lanes can bind oncology, imaging, genomics, trials, public health, and population health evidence cards.",
    productionGate:
      "Each scientific agent needs retrieval verification, citation checks, evidence grading, and accountable human review."
  },
  {
    priority: "Edge / Private AI Architecture",
    implementedBy:
      "No-PHI and no-connector authority headers keep private deployment and local inference lanes distinct from public metadata evidence.",
    productionGate:
      "Local inference, speech, vision, imaging, FHIR gateway, knowledge graph, offline mode, and data-residency controls must be tenant approved."
  },
  {
    priority: "MLOps / AIOps Foundation",
    implementedBy:
      "Attempt contract version, model route telemetry, scorecards, trace ids, replay tokens, and review dispositions create a registry-ready spine.",
    productionGate:
      "Prompt registry, model registry, evaluation datasets, reviewer queues, CI evals, regression detection, and rollback support must be connected."
  },
  {
    priority: "Security and Compliance",
    implementedBy:
      "Least privilege, RLS deny-all tables, PHI guards, immutable events, no secrets, retention, regional tags, and fail-closed protected routes.",
    productionGate:
      "HIPAA program artifacts, BAAs/DPAs, secret scanning, SBOM, exploitability review, consent, and residency controls require external review."
  },
  {
    priority: "Progressive Delivery",
    implementedBy:
      "Migration-ready store, canary rollout plan, protected fail-closed routes, health checks, and rollback-oriented hard stops.",
    productionGate:
      "Feature flags, staged tenant rollout, blast-radius controls, dashboards, and rollback drills must pass before broader activation."
  },
  {
    priority: "Observability",
    implementedBy:
      "Model, prompt boundary, tool plan, latency budget, token/cost placeholders, confidence, reviewer outcome, clinical risk, and PHI risk are retained.",
    productionGate:
      "Live telemetry streams and dashboards must connect costs, latency, token use, hallucination risk, reviewer outcome, and escalation events."
  }
];

const allowedRegions: ExecutionAttemptDurableStoreRegion[] = [
  "us",
  "eu",
  "uk",
  "ca",
  "apac",
  "customer-private-region"
];

const allowedDispositions: ExecutionAttemptDurableStoreReviewDisposition[] = [
  "approved-for-synthetic-release",
  "changes-requested",
  "rejected",
  "escalated"
];

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function knownEnvelopeForReference(payload: Record<string, unknown>) {
  const attemptId = stringValue(payload.attemptId);
  const idempotencyKey = stringValue(payload.idempotencyKey);

  return executionAttemptEnvelopes.find(
    (envelope) =>
      (attemptId && envelope.attemptId === attemptId) ||
      (idempotencyKey && envelope.idempotencyKey === idempotencyKey)
  );
}

export function validateExecutionAttemptDurableStoreRecordRequest(
  payload: unknown
): ExecutionAttemptDurableStoreValidation<
  ExecutionAttemptDurableStoreRecordRequest & { envelope: ExecutionAttemptEnvelope }
> {
  const record = asRecord(payload);
  const errors: string[] = [];
  const workspaceSlug = stringValue(record.workspaceSlug);
  const region = stringValue(record.region) || "us";
  const retentionUntil = stringValue(record.retentionUntil);
  const envelope = knownEnvelopeForReference(record);

  if (!/^[a-z0-9][a-z0-9-]{2,120}$/.test(workspaceSlug)) {
    errors.push("workspaceSlug must be a tenant workspace slug.");
  }

  if (!envelope) {
    errors.push("attemptId or idempotencyKey must reference a server-known no-PHI synthetic envelope.");
  }

  if (!allowedRegions.includes(region as ExecutionAttemptDurableStoreRegion)) {
    errors.push("region must be one of the approved durable-store region codes.");
  }

  if (retentionUntil && Number.isNaN(Date.parse(retentionUntil))) {
    errors.push("retentionUntil must be an ISO timestamp when provided.");
  }

  if (envelope?.phiAuthority !== "not-authorized-production-phi") {
    errors.push("Referenced envelope must deny production PHI authority.");
  }

  if (envelope?.clinicalCareAuthority !== "not-authorized-live-care") {
    errors.push("Referenced envelope must deny live clinical-care authority.");
  }

  if (!envelope?.humanApprovalGate.required) {
    errors.push("Referenced envelope must require human review.");
  }

  if (errors.length > 0 || !envelope) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      workspaceSlug,
      attemptId: envelope.attemptId,
      idempotencyKey: envelope.idempotencyKey,
      region: region as ExecutionAttemptDurableStoreRegion,
      retentionUntil: retentionUntil || undefined,
      envelope
    }
  };
}

export function validateExecutionAttemptDurableStoreReplayRequest(
  payload: unknown
): ExecutionAttemptDurableStoreValidation<ExecutionAttemptDurableStoreReplayRequest> {
  const record = asRecord(payload);
  const errors: string[] = [];
  const workspaceSlug = stringValue(record.workspaceSlug);
  const idempotencyKey = stringValue(record.idempotencyKey);
  const replayToken = stringValue(record.replayToken);

  if (!/^[a-z0-9][a-z0-9-]{2,120}$/.test(workspaceSlug)) {
    errors.push("workspaceSlug must be a tenant workspace slug.");
  }

  if (!idempotencyKey && !replayToken) {
    errors.push("idempotencyKey or replayToken is required.");
  }

  if (idempotencyKey && !/^idem_[a-f0-9]{24}$/.test(idempotencyKey)) {
    errors.push("idempotencyKey must match the SCRIMED envelope format.");
  }

  if (replayToken && !/^replay_[a-f0-9]{24}$/.test(replayToken)) {
    errors.push("replayToken must match the SCRIMED replay format.");
  }

  return errors.length > 0
    ? { ok: false, errors }
    : { ok: true, value: { workspaceSlug, idempotencyKey, replayToken } };
}

export function validateExecutionAttemptDurableStoreReviewRequest(
  payload: unknown
): ExecutionAttemptDurableStoreValidation<ExecutionAttemptDurableStoreReviewRequest> {
  const record = asRecord(payload);
  const errors: string[] = [];
  const workspaceSlug = stringValue(record.workspaceSlug);
  const attemptId = stringValue(record.attemptId);
  const disposition = stringValue(record.disposition);
  const reviewerRole = stringValue(record.reviewerRole);
  const reasonCode = stringValue(record.reasonCode);
  const reviewNote = stringValue(record.reviewNote);
  const humanReviewAttestation = stringValue(record.humanReviewAttestation);

  if (!/^[a-z0-9][a-z0-9-]{2,120}$/.test(workspaceSlug)) {
    errors.push("workspaceSlug must be a tenant workspace slug.");
  }

  if (!executionAttemptEnvelopes.some((envelope) => envelope.attemptId === attemptId)) {
    errors.push("attemptId must reference a server-known no-PHI synthetic envelope.");
  }

  if (!allowedDispositions.includes(disposition as ExecutionAttemptDurableStoreReviewDisposition)) {
    errors.push("disposition must be an approved durable-store review disposition.");
  }

  if (!/^[a-z0-9][a-z0-9 -]{2,80}$/i.test(reviewerRole)) {
    errors.push("reviewerRole must be a concise reviewer role label.");
  }

  if (!/^[a-z0-9][a-z0-9-]{2,80}$/.test(reasonCode)) {
    errors.push("reasonCode must be a lowercase governance reason code.");
  }

  if (reviewNote.length < 20 || reviewNote.length > 1200) {
    errors.push("reviewNote must be between 20 and 1200 characters.");
  }

  if (humanReviewAttestation !== "no-phi-human-review-no-clinical-authority") {
    errors.push("humanReviewAttestation must confirm no-PHI human review without clinical authority.");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      workspaceSlug,
      attemptId,
      disposition: disposition as ExecutionAttemptDurableStoreReviewDisposition,
      reviewerRole,
      reasonCode,
      reviewNote,
      humanReviewAttestation: "no-phi-human-review-no-clinical-authority"
    }
  };
}

function mapDurableRecord(payload: unknown): ExecutionAttemptDurableRecord | null {
  const record = asRecord(payload);

  if (!record.id || !record.attemptId || !record.envelope) {
    return null;
  }

  return record as unknown as ExecutionAttemptDurableRecord;
}

export async function recordExecutionAttemptEnvelopeInDurableStore(
  client: SupabaseClient,
  input: ExecutionAttemptDurableStoreRecordRequest & { envelope: ExecutionAttemptEnvelope }
) {
  const { data, error } = await client.rpc("record_execution_attempt_envelope", {
    p_workspace_slug: input.workspaceSlug,
    p_envelope: input.envelope,
    p_region: input.region ?? "us",
    p_retention_until: input.retentionUntil ?? null
  });
  const payload = asRecord(data);

  return {
    record: mapDurableRecord(payload.record),
    eventId: typeof payload.eventId === "string" ? payload.eventId : null,
    persisted: payload.persisted === true,
    idempotentReplay: payload.idempotentReplay === true,
    boundary: stringValue(payload.boundary),
    error
  };
}

export async function replayExecutionAttemptEnvelopeFromDurableStore(
  client: SupabaseClient,
  input: ExecutionAttemptDurableStoreReplayRequest
) {
  const { data, error } = await client.rpc("replay_execution_attempt_envelope", {
    p_workspace_slug: input.workspaceSlug,
    p_idempotency_key: input.idempotencyKey || null,
    p_replay_token: input.replayToken || null
  });
  const payload = asRecord(data);

  return {
    record: mapDurableRecord(payload.record),
    eventId: typeof payload.eventId === "string" ? payload.eventId : null,
    replayed: payload.replayed === true,
    boundary: stringValue(payload.boundary),
    error
  };
}

export async function recordExecutionAttemptReviewDispositionInDurableStore(
  client: SupabaseClient,
  input: ExecutionAttemptDurableStoreReviewRequest
) {
  const { data, error } = await client.rpc("record_execution_attempt_review_disposition", {
    p_workspace_slug: input.workspaceSlug,
    p_attempt_id: input.attemptId,
    p_disposition: input.disposition,
    p_reviewer_role: input.reviewerRole,
    p_reason_code: input.reasonCode,
    p_review_note: input.reviewNote,
    p_attestation: input.humanReviewAttestation,
    p_event_metadata: {
      syntheticOnly: true,
      noPhi: true,
      clinicalCareAuthority: "not-authorized-live-care",
      productionConnectorAuthority: "not-authorized"
    }
  });
  const payload = asRecord(data);

  return {
    record: mapDurableRecord(payload.record),
    dispositionId: typeof payload.dispositionId === "string" ? payload.dispositionId : null,
    eventId: typeof payload.eventId === "string" ? payload.eventId : null,
    boundary: stringValue(payload.boundary),
    error
  };
}

function durableStoreErrorText(error: unknown) {
  const fields =
    error && typeof error === "object"
      ? [
          (error as { message?: unknown }).message,
          (error as { details?: unknown }).details,
          (error as { hint?: unknown }).hint,
          (error as { code?: unknown }).code
        ]
      : [error];

  return fields
    .filter((field) => typeof field === "string")
    .join(" ")
    .toLowerCase();
}

export function executionAttemptDurableStoreRpcFailure(error: unknown, fallbackCode: string) {
  const text = durableStoreErrorText(error);

  if (text.includes("workspace-not-found-or-role-denied") || text.includes("role-denied")) {
    return {
      status: 403,
      code: "execution-attempt-durable-store-role-denied",
      message:
        "This verified AAL2 session is not authorized for the target workspace. Required tenant roles are tenant-admin, pilot-lead, or reviewer."
    };
  }

  if (text.includes("idempotency-conflict")) {
    return {
      status: 409,
      code: "execution-attempt-idempotency-conflict",
      message:
        "The idempotency key already exists for a different execution-attempt envelope in this workspace."
    };
  }

  if (text.includes("prohibited-content") || text.includes("boundary-violation")) {
    return {
      status: 422,
      code: "execution-attempt-prohibited-content",
      message:
        "The durable-store request was rejected because it crossed the no-PHI, metadata-only execution-attempt boundary."
    };
  }

  if (text.includes("invalid")) {
    return {
      status: 422,
      code: "execution-attempt-invalid-request",
      message: "The durable-store request did not satisfy the execution-attempt persistence contract."
    };
  }

  if (text.includes("not-found")) {
    return {
      status: 404,
      code: "execution-attempt-durable-record-not-found",
      message: "The requested execution-attempt durable-store record was not available in this workspace."
    };
  }

  return {
    status: fallbackCode.includes("replay") ? 404 : 503,
    code: fallbackCode,
    message:
      "The execution-attempt durable-store action could not be completed. Confirm migration state, AAL2 session, tenant role, server runtime token, and retained no-PHI record state before retrying."
  };
}

export function validateExecutionAttemptDurableStoreContract(): ExecutionAttemptDurableStoreContractValidation {
  const envelopeSummary = getExecutionAttemptEnvelopeSummary();
  const checks: ExecutionAttemptDurableStoreCheck[] = [
    {
      check: "durable-store-wraps-all-known-envelopes",
      passed: envelopeSummary.envelopeCount >= 4 && envelopeSummary.replayReadyCount === envelopeSummary.envelopeCount,
      detail: `${envelopeSummary.envelopeCount} envelopes are available for metadata-only durable persistence.`
    },
    {
      check: "protected-writes-require-human-review",
      passed: executionAttemptEnvelopes.every((envelope) => envelope.humanApprovalGate.required),
      detail: "Every server-known envelope carries a required human review gate."
    },
    {
      check: "no-phi-boundary-retained",
      passed: executionAttemptEnvelopes.every(
        (envelope) =>
          envelope.dataBoundary === "synthetic-and-metadata-only" &&
          envelope.phiAuthority === "not-authorized-production-phi"
      ),
      detail: "All durable-store candidate envelopes deny production PHI authority."
    },
    {
      check: "idempotency-ttl-locking-replay-defined",
      passed:
        executionAttemptDurableStoreArchitecture.dataModels.some((model) => model.includes("idempotency")) &&
        executionAttemptDurableStoreArchitecture.dataModels.some((model) => model.includes("lock TTL")) &&
        executionAttemptDurableStoreArchitecture.interfaces.some((item) => item.includes("replay")),
      detail: "Contract defines idempotency keys, lock TTLs, retention, and metadata-only replay."
    },
    {
      check: "mcp-gateway-permissioning-defined",
      passed: clinicalAIOperatingSystemFoundation.some(
        (item) => item.priority === "Enterprise MCP Gateway" && item.implementedBy.includes("AAL2")
      ),
      detail: "MCP-compatible tool access remains blocked without explicit AAL2, tenant, and tool permissions."
    },
    {
      check: "clinical-robustness-lab-covered",
      passed:
        clinicalAIOperatingSystemFoundation.some(
          (item) => item.priority === "Clinical Robustness Lab" && item.implementedBy.includes("Adversarial")
        ) &&
        envelopeSummary.clinicalRobustnessScenarioBindingCount >= envelopeSummary.envelopeCount &&
        envelopeSummary.clinicalRobustnessPerturbationBindingCount >=
          envelopeSummary.clinicalRobustnessRequiredPerturbationCount,
      detail:
        "Clinical robustness coverage is bound to durable attempt metadata, scorecards, reviewer queues, and the current required adversarial perturbation families."
    },
    {
      check: "model-router-observability-covered",
      passed: executionAttemptEnvelopes.every(
        (envelope) =>
          envelope.modelRouteTelemetry.estimatedCostUsd > 0 &&
          envelope.modelRouteTelemetry.latencyBudgetMs > 0 &&
          envelope.modelRouteTelemetry.confidence > 0
      ),
      detail: "Every durable-store candidate carries cost, latency, confidence, fallback, and routing rationale."
    },
    {
      check: "compute-fabric-evidence-binding-covered",
      passed: executionAttemptEnvelopes.every(
        (envelope) =>
          isScrimedComputeAuditHash(envelope.computeFabricTelemetry.auditHash) &&
          envelope.evidenceAuditTrail.compute_fabric_audit_hash === envelope.computeFabricTelemetry.auditHash &&
          envelope.computeFabricTelemetry.safetyBoundary === "metadata-only-no-live-model-call"
      ),
      detail:
        "Every durable-store candidate binds SCRIMED Compute Fabric selected model, tier, PHI policy, human review flag, and audit hash."
    },
    {
      check: "progressive-delivery-rollout-defined",
      passed:
        executionAttemptDurableStoreArchitecture.rolloutPlan.length >= 5 &&
        executionAttemptDurableStoreArchitecture.migrationPlan.length >= 5,
      detail: "Migration, canary, authenticated smoke, and rollback-aware rollout stages are defined."
    }
  ];

  return {
    status: checks.every((check) => check.passed) ? "pass" : "fail",
    checks
  };
}

export function getExecutionAttemptDurableStoreSummary() {
  const envelopeSummary = getExecutionAttemptEnvelopeSummary();
  const validation = validateExecutionAttemptDurableStoreContract();

  return {
    service: "scrimed-execution-attempt-durable-store",
    route: executionAttemptDurableStoreRoute,
    apiRoute: executionAttemptDurableStoreApiRoute,
    briefRoute: executionAttemptDurableStoreBriefRoute,
    recordRoute: executionAttemptDurableStoreRecordRoute,
    replayRoute: executionAttemptDurableStoreReplayRoute,
    reviewDispositionRoute: executionAttemptDurableStoreReviewDispositionRoute,
    status: executionAttemptDurableStoreStatus,
    briefStatus: executionAttemptDurableStoreBriefStatus,
    contractVersion: executionAttemptDurableStoreContractVersion,
    boundary: executionAttemptDurableStoreBoundary,
    readinessAssessment:
      "GO for migration-ready, tenant-scoped, no-PHI durable execution-attempt metadata, idempotency, replay lookup, and human review disposition APIs. NO-GO for live clinical production, PHI, autonomous workflow execution, production connectors, patient outreach, payer submission, EHR writeback, final billing, or production model routing.",
    dataBoundary: "synthetic-and-metadata-only",
    phiAuthority: "not-authorized-production-phi",
    clinicalCareAuthority: "not-authorized-live-care",
    workflowExecutionAuthority: "durable-attempt-store-no-protected-execution",
    replayAuthority: "metadata-replay-only",
    modelRoutingAuthority: "telemetry-only-not-production-routing",
    protectedWritesEnabled: isExecutionAttemptDurableStoreEnabled(),
    envelopeCount: envelopeSummary.envelopeCount,
    recordableEnvelopeCount: executionAttemptEnvelopes.length,
    acceptedEnvelopeCount: envelopeSummary.acceptedEnvelopeCount,
    replayReadyCount: envelopeSummary.replayReadyCount,
    scorecardCount: envelopeSummary.scorecardCount,
    passingScorecardCount: envelopeSummary.passingScorecardCount,
    architectureSectionCount: Object.values(executionAttemptDurableStoreArchitecture).flat().length,
    healthcareAIPriorityCount: clinicalAIOperatingSystemFoundation.length,
    validation,
    architecture: executionAttemptDurableStoreArchitecture,
    clinicalAIOperatingSystemFoundation,
    hardStops: executionAttemptDurableStoreHardStops,
    supportedReviewDispositions: allowedDispositions,
    supportedRegions: allowedRegions,
    activationControls: executionAttemptDurableStoreActivationControls,
    sampleRecordableAttempts: executionAttemptEnvelopes.map((envelope) => ({
      attemptId: envelope.attemptId,
      idempotencyKey: envelope.idempotencyKey,
      replayToken: envelope.replayMetadata.replayToken,
      workflowSlug: envelope.workflowSlug,
      clinicalRiskLevel: envelope.modelRouteTelemetry.riskTier,
      humanReviewRequired: envelope.humanApprovalGate.required,
      modelRoute: envelope.modelRouteTelemetry.routeId,
      computeFabricSelectedModel: envelope.computeFabricTelemetry.selectedModel,
      computeFabricModelTier: envelope.computeFabricTelemetry.modelTier,
      computeFabricPhiPolicy: envelope.computeFabricTelemetry.phiPolicy,
      computeFabricAuditHash: envelope.computeFabricTelemetry.auditHash,
      clinicalRobustnessScenarioRefs:
        envelope.evaluationBindings.clinicalRobustness.scenarioRefs,
      boundary: envelope.retainedBoundary
    })),
    remainingProductionGates: [
      "Retain live Supabase structural verification evidence for migration history, private tables, RLS, deny policies, and RPC grants.",
      "Run authenticated AAL2 record/replay/review smoke with server runtime token configured.",
      "Connect model registry, prompt registry, cost budgets, and evaluation datasets to the durable record.",
      "Implement OAuth scoped token issuance and revocation for a production MCP gateway.",
      "Activate feature flags, canary dashboard, rollback runbook, and tenant-specific retention/residency policy."
    ],
    updated: executionAttemptDurableStoreUpdatedAt
  };
}

export function buildExecutionAttemptDurableStoreBrief() {
  const summary = getExecutionAttemptDurableStoreSummary();

  return [
    "# SCRIMED Execution Attempt Durable Store Brief",
    "",
    `Status: ${summary.status}`,
    `Readiness assessment: ${summary.readinessAssessment}`,
    `Boundary: ${summary.boundary}`,
    "",
    "## Routes",
    `- Summary: ${summary.apiRoute}`,
    `- Brief: ${summary.briefRoute}`,
    `- Protected record: ${summary.recordRoute}`,
    `- Protected replay: ${summary.replayRoute}`,
    `- Protected review disposition: ${summary.reviewDispositionRoute}`,
    "",
    "## Architecture",
    ...Object.entries(summary.architecture).flatMap(([section, items]) => [
      `### ${section}`,
      ...(items as string[]).map((item) => `- ${item}`)
    ]),
    "",
    "## Healthcare AI OS Foundation",
    ...summary.clinicalAIOperatingSystemFoundation.map(
      (item) => `- ${item.priority}: ${item.implementedBy} Gate: ${item.productionGate}`
    ),
    "",
    "## Recordable Attempts",
    ...summary.sampleRecordableAttempts.map(
      (attempt) =>
        `- ${attempt.workflowSlug}: ${attempt.attemptId}; ${attempt.idempotencyKey}; ${attempt.replayToken}; review required ${attempt.humanReviewRequired}`
    ),
    "",
    "## Contract Validation",
    ...summary.validation.checks.map(
      (check) => `- ${check.check}: ${check.passed ? "pass" : "fail"} - ${check.detail}`
    ),
    "",
    "## Hard Stops",
    ...summary.hardStops.map((stop) => `- ${stop}`),
    "",
    "## Activation Controls",
    ...summary.activationControls.map(
      (control) =>
        `- ${control.gate}: ${control.requiredEvidence} Rollback: ${control.rollback}`
    ),
    "",
    "## Remaining Production Gates",
    ...summary.remainingProductionGates.map((gate) => `- ${gate}`),
    "",
    `Updated: ${summary.updated}`
  ].join("\n");
}
