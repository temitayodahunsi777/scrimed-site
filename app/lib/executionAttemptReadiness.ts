export type ExecutionAttemptReadinessStatus =
  | "decision-required"
  | "ready-for-implementation";

export type ExecutionAttemptControlState =
  | "defined"
  | "decision-required";

export type ExecutionAttemptControl = {
  name: string;
  state: ExecutionAttemptControlState;
  owner: string;
  requirement: string;
  riskIfMissing: string;
};

export type ExecutionAttemptState = {
  state: string;
  disposition: string;
};

export const executionAttemptEnvelope = [
  "workflow slug",
  "contract version",
  "request trace id",
  "idempotency key",
  "tenant reference",
  "caller identity reference",
  "patient-context authorization reference",
  "review owner",
  "runtime mode",
  "audit event link"
];

export const executionAttemptStateMachine: ExecutionAttemptState[] = [
  {
    state: "received",
    disposition:
      "Future execution requests enter preflight without connector access, workflow mutation, or patient-facing action."
  },
  {
    state: "deduplicated",
    disposition:
      "Idempotency policy decides whether the request is new, replayed, conflicting, expired, or rejected."
  },
  {
    state: "preflight-denied",
    disposition:
      "Current production behavior remains deny-by-default before body parsing or attempt persistence."
  },
  {
    state: "review-required",
    disposition:
      "Human review gates hold clinical, documentation, research, or operational actions before execution."
  },
  {
    state: "approved-for-execution",
    disposition:
      "Only approved, authenticated, authorized, persisted, and traceable attempts can enter execution."
  },
  {
    state: "completed",
    disposition:
      "Completion requires immutable audit linkage, result evidence, reviewer state, and blocked-action retention."
  },
  {
    state: "failed-quarantined",
    disposition:
      "Failures route to quarantine, retry, compensation, or incident review without silent replay."
  }
];

export const executionAttemptControls: ExecutionAttemptControl[] = [
  {
    name: "Attempt identity envelope",
    state: "defined",
    owner: "Trust infrastructure",
    requirement:
      "Require workflow slug, contract version, request trace id, idempotency key, tenant reference, caller identity reference, patient-context authorization reference, review owner, runtime mode, and audit event link before any executable attempt can exist.",
    riskIfMissing:
      "Execution attempts could be impossible to deduplicate, investigate, replay, or connect to the right identity, tenant, patient-context, and audit evidence."
  },
  {
    name: "Idempotency key policy",
    state: "decision-required",
    owner: "Platform architecture",
    requirement:
      "Approve key generation, uniqueness scope, TTL, replay response, conflict response, expiration behavior, and required client headers for each governed execution route.",
    riskIfMissing:
      "A retry, refresh, integration timeout, or duplicate client request could trigger repeated workflow action."
  },
  {
    name: "Attempt state machine",
    state: "defined",
    owner: "Workflow platform",
    requirement:
      "Use received, deduplicated, preflight-denied, review-required, approved-for-execution, completed, and failed-quarantined states as the reference execution lifecycle.",
    riskIfMissing:
      "Execution could move through ambiguous states that are hard to audit, recover, or explain."
  },
  {
    name: "Durable attempt store",
    state: "decision-required",
    owner: "Platform architecture",
    requirement:
      "Select durable storage for attempt identity, idempotency records, state transitions, review state, trace references, retry counters, and audit linkage.",
    riskIfMissing:
      "SCRIMED could lose execution history, replay protection, or review evidence during retries, deploys, incidents, or regional failover."
  },
  {
    name: "Concurrency and lock model",
    state: "decision-required",
    owner: "Platform reliability",
    requirement:
      "Define per-workflow, per-tenant, per-patient-context, and per-idempotency-key locking behavior before parallel requests can compete.",
    riskIfMissing:
      "Concurrent requests could race into inconsistent review, routing, documentation, or research states."
  },
  {
    name: "Retry and replay policy",
    state: "decision-required",
    owner: "Reliability engineering",
    requirement:
      "Approve retry windows, replay eligibility, deterministic response reuse, retry-after behavior, and operator-visible retry history.",
    riskIfMissing:
      "Transient failures could become duplicate actions or untracked gaps in clinical and operational workflows."
  },
  {
    name: "Failure quarantine and compensation",
    state: "decision-required",
    owner: "Trust operations",
    requirement:
      "Define failure categories, quarantine triggers, compensation workflow, escalation owners, incident linkage, and blocked-action retention.",
    riskIfMissing:
      "Partial failures could be hidden, retried unsafely, or left without accountable operational recovery."
  },
  {
    name: "Rate limits and misuse throttles",
    state: "decision-required",
    owner: "Security operations",
    requirement:
      "Approve tenant, user, service, workflow, region, and emergency shutdown limits before executable attempts are accepted.",
    riskIfMissing:
      "Attackers, misconfigured clients, or runaway agents could flood execution surfaces and overwhelm review or connector systems."
  },
  {
    name: "Metadata-only body boundary",
    state: "defined",
    owner: "Privacy",
    requirement:
      "Keep current denied execution behavior body-free and prohibit request bodies, PHI, clinical free text, connector payloads, secrets, and insurance identifiers from attempt readiness records.",
    riskIfMissing:
      "Attempt-readiness evidence could accidentally become an unapproved clinical data store."
  },
  {
    name: "Regional attempt compliance",
    state: "decision-required",
    owner: "Global compliance",
    requirement:
      "Map attempt retention, residency, failover, export, deletion, and legal-hold behavior for the United States, UAE, Saudi Arabia, Kuwait, Nigeria, Kenya, Rwanda, Ghana, and Europe.",
    riskIfMissing:
      "Global governed execution could conflict with sovereign-cloud, customer, or regional privacy obligations."
  }
];

export function getExecutionAttemptReadinessSummary() {
  const defined = executionAttemptControls.filter((control) => control.state === "defined").length;
  const decisionRequired = executionAttemptControls.length - defined;

  return {
    service: "scrimed-execution-attempt-readiness",
    status:
      decisionRequired === 0 ? "ready-for-implementation" : "decision-required",
    controlCount: executionAttemptControls.length,
    defined,
    decisionRequired,
    runtimeBoundary: "attempt-creation-disabled",
    activeReplacement:
      "Deny-by-default governed execution endpoints remain the active replacement until idempotency, durable attempt storage, concurrency, retry, failure quarantine, rate-limit, privacy, and regional attempt-compliance decisions are approved.",
    requiredBeforeExecution:
      "Governed execution must not create, persist, retry, replay, or release execution attempts until execution-attempt readiness is approved.",
    attemptEnvelope: executionAttemptEnvelope,
    stateMachine: executionAttemptStateMachine,
    controls: executionAttemptControls,
    updated: "2026-06-01"
  };
}
