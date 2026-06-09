export type RuntimeSafetyReadinessStatus =
  | "decision-required"
  | "ready-for-implementation";

export type RuntimeSafetyControlState =
  | "defined"
  | "decision-required";

export type RuntimeSafetyControl = {
  name: string;
  state: RuntimeSafetyControlState;
  owner: string;
  requirement: string;
  riskIfMissing: string;
};

export type RuntimeSafetyState = {
  state: string;
  disposition: string;
};

export const runtimeSafetyEnvelope = [
  "workflow slug",
  "tenant reference",
  "caller identity reference",
  "service credential reference",
  "patient-context authorization reference",
  "region",
  "workflow risk tier",
  "runtime policy version",
  "request trace id",
  "idempotency key",
  "rate-limit decision",
  "shutdown flag",
  "abuse signal references",
  "audit event link"
];

export const runtimeSafetyStates: RuntimeSafetyState[] = [
  {
    state: "locked",
    disposition:
      "Current production behavior rejects governed execution before body parsing, attempt creation, connector access, workflow mutation, or patient-facing action."
  },
  {
    state: "preflight-watch",
    disposition:
      "Future authenticated requests can be evaluated for throttle, region, tenant, identity, service, and workflow risk without executing work."
  },
  {
    state: "throttled",
    disposition:
      "Requests exceeding approved limits must be rejected or delayed with deterministic audit evidence and no connector side effects."
  },
  {
    state: "suspended",
    disposition:
      "Tenant, service, user, workflow, or region suspension blocks execution while preserving operator review and incident context."
  },
  {
    state: "shutdown-active",
    disposition:
      "Emergency shutdown prevents all governed execution attempts from being accepted until restoration is approved."
  },
  {
    state: "incident-review",
    disposition:
      "Runtime safety events require owner, severity, evidence, containment, corrective action, and restoration decision."
  },
  {
    state: "restored-after-approval",
    disposition:
      "Execution can only resume after approved review, policy version update, audit linkage, and Watchtower confirmation."
  }
];

export const runtimeSafetyControls: RuntimeSafetyControl[] = [
  {
    name: "Runtime safety envelope",
    state: "defined",
    owner: "Trust infrastructure",
    requirement:
      "Require workflow slug, tenant reference, caller identity reference, service credential reference, patient-context authorization reference, region, workflow risk tier, runtime policy version, request trace id, idempotency key, rate-limit decision, shutdown flag, abuse signal references, and audit event link before execution can be accepted.",
    riskIfMissing:
      "Runtime safety decisions could be impossible to explain, reproduce, localize, or connect to the right actor, tenant, workflow, and audit evidence."
  },
  {
    name: "Throttle policy",
    state: "decision-required",
    owner: "Security operations",
    requirement:
      "Approve limits for tenant, user, service credential, workflow slug, patient-context authorization, region, and burst behavior before accepting executable requests.",
    riskIfMissing:
      "Attackers, misconfigured clients, or runaway agents could overload review queues, connector surfaces, or workflow runtimes."
  },
  {
    name: "Emergency shutdown switch",
    state: "decision-required",
    owner: "Trust operations",
    requirement:
      "Define who can trigger global, regional, tenant, service, workflow, or connector shutdown, how long shutdown lasts, and which evidence is required to restore service.",
    riskIfMissing:
      "SCRIMED may be unable to quickly contain unsafe automation, active misuse, compromised credentials, or connector incidents."
  },
  {
    name: "Abuse signal taxonomy",
    state: "defined",
    owner: "Watchtower",
    requirement:
      "Classify suspicious request bursts, replay anomalies, identity mismatches, policy violations, connector-risk signals, prompt-injection indicators, and repeated denied attempts as runtime safety signals.",
    riskIfMissing:
      "Operational teams could miss patterns that should trigger throttling, suspension, or incident review."
  },
  {
    name: "Connector containment boundary",
    state: "defined",
    owner: "Interoperability",
    requirement:
      "Keep runtime safety checks upstream of FHIR, HL7 v2, DICOM/DICOMweb, X12, IHE, pharmacy, terminology, pricing, research, device, and workflow connectors so denied or throttled requests never create connector side effects.",
    riskIfMissing:
      "Unsafe requests could reach production healthcare systems before SCRIMED has applied containment controls."
  },
  {
    name: "Rate-limit persistence",
    state: "decision-required",
    owner: "Platform reliability",
    requirement:
      "Select storage for rate-limit counters, cooldown windows, suspension records, shutdown flags, policy versions, and restoration evidence.",
    riskIfMissing:
      "Deploys, region failover, or retries could reset safety limits and allow repeated unsafe requests."
  },
  {
    name: "Regional safety policy",
    state: "decision-required",
    owner: "Global compliance",
    requirement:
      "Map runtime limits, incident escalation, retention, data residency, local operator authority, and restoration process for the United States, UAE, Saudi Arabia, Kuwait, Nigeria, Kenya, Rwanda, Ghana, and Europe.",
    riskIfMissing:
      "Global deployments could apply the wrong safety posture to sovereign-cloud, customer, or regional healthcare obligations."
  },
  {
    name: "Watchtower escalation",
    state: "decision-required",
    owner: "Watchtower",
    requirement:
      "Define dashboards, thresholds, alert routing, on-call ownership, severity model, and operator acknowledgement for runtime safety events.",
    riskIfMissing:
      "Safety signals could exist without timely response, triage, or accountable containment."
  },
  {
    name: "Break-glass safety override",
    state: "decision-required",
    owner: "Compliance",
    requirement:
      "Approve whether emergency human overrides can bypass throttles, which roles can request them, justification requirements, expiration, retrospective review, and patient-context limits.",
    riskIfMissing:
      "A crisis workflow could be blocked without a governed override path, or an override could become an untracked privilege escalation."
  },
  {
    name: "Runtime denial evidence",
    state: "defined",
    owner: "Trust infrastructure",
    requirement:
      "Return deterministic runtime-safety, shutdown, throttle, guard, audit-event, workflow, body-handling, execution-mode, and idempotency evidence headers when governed execution is denied.",
    riskIfMissing:
      "Denied requests could be hard to distinguish from generic failures during incident review or partner integration testing."
  },
  {
    name: "Restoration protocol",
    state: "decision-required",
    owner: "Trust operations",
    requirement:
      "Define who approves service restoration, what evidence is required, how policy versions change, and how restored execution is monitored after suspension or shutdown.",
    riskIfMissing:
      "Execution could resume before the root cause is contained, or remain disabled without clear restoration accountability."
  },
  {
    name: "Synthetic runtime safety drills",
    state: "decision-required",
    owner: "Quality",
    requirement:
      "Create synthetic tests for throttle exhaustion, replay bursts, service suspension, regional shutdown, connector containment, operator restoration, and audit evidence completeness.",
    riskIfMissing:
      "Runtime safety controls could be approved on paper without executable evidence that containment works."
  }
];

export function getRuntimeSafetyReadinessSummary() {
  const defined = runtimeSafetyControls.filter((control) => control.state === "defined").length;
  const decisionRequired = runtimeSafetyControls.length - defined;

  return {
    service: "scrimed-runtime-safety-readiness",
    status:
      decisionRequired === 0 ? "ready-for-implementation" : "decision-required",
    controlCount: runtimeSafetyControls.length,
    defined,
    decisionRequired,
    runtimeBoundary: "runtime-acceptance-disabled",
    shutdownBoundary: "emergency-shutdown-not-enabled",
    activeReplacement:
      "Deny-by-default governed execution endpoints remain the active replacement until throttle policy, emergency shutdown, abuse detection, regional safety policy, Watchtower escalation, override rules, restoration protocol, and synthetic safety drills are approved.",
    requiredBeforeExecution:
      "Governed execution must not accept executable requests until runtime safety readiness is approved.",
    safetyEnvelope: runtimeSafetyEnvelope,
    states: runtimeSafetyStates,
    controls: runtimeSafetyControls,
    updated: "2026-06-01"
  };
}
