export type TrustSafetyStatus =
  | "active-control"
  | "watch-required"
  | "external-review-required"
  | "production-gated";

export type TrustSafetyAgent = {
  name: string;
  status: TrustSafetyStatus;
  mission: string;
  monitoringCadence: string;
  watches: string[];
  autoActions: string[];
  escalationTriggers: string[];
  blockedActions: string[];
  evidenceRoutes: string[];
};

export type TrustSafetyControl = {
  name: string;
  status: TrustSafetyStatus;
  owner: string;
  purpose: string;
  evidence: string[];
  requiredNextStep: string;
};

export type TrustSafetyChannel = {
  name: string;
  status: TrustSafetyStatus;
  source: string;
  signal: string;
  escalation: string;
};

export type TrustSafetyLoop = {
  stage: string;
  owner: string;
  action: string;
  evidence: string;
  boundary: string;
};

export const trustSafetyOperationsBoundary =
  "SCRIMED Trust and Safety Operations is an operating model and product control layer for synthetic evaluations, protected pilots, and enterprise readiness. It does not create legal advice, compliance certification, 24/7 managed SOC/MDR coverage, production clinical monitoring, or authorization for live clinical execution.";

export const trustSafetyAgents: TrustSafetyAgent[] = [
  {
    name: "PHI Shield Agent",
    status: "active-control",
    mission: "Detect and block PHI-style content from public, sales, pilot, and agent-workspace flows.",
    monitoringCadence: "Continuous checks on governed intake and synthetic workflows; human review for ambiguous content.",
    watches: ["public intake payloads", "sales updates", "workflow packets", "agent work-order notes"],
    autoActions: ["reject prohibited content", "return no-PHI guidance", "preserve safe metadata only"],
    escalationTriggers: ["suspected PHI", "patient identifier pattern", "clinical-record upload request"],
    blockedActions: ["store PHI through public forms", "route patient data into analytics", "export sensitive health inferences"],
    evidenceRoutes: ["/pilot", "/sales-operations", "/agent-workspace", "/trust-center/privacy"]
  },
  {
    name: "Agent Firewall",
    status: "active-control",
    mission: "Keep agents inside approved tools, scopes, workflow states, and human-review checkpoints.",
    monitoringCadence: "Every governed agent action before external output or workflow promotion.",
    watches: ["tool requests", "model route intent", "workflow state transitions", "blocked production connectors"],
    autoActions: ["deny prohibited execution", "require reviewer approval", "attach audit metadata"],
    escalationTriggers: ["production connector request", "autonomous clinical action", "payer submission request"],
    blockedActions: ["autonomous diagnosis", "patient outreach", "EHR filing", "claim submission"],
    evidenceRoutes: ["/trust-os", "/agents", "/workflows/runtime-safety", "/audit"]
  },
  {
    name: "Copyright And IP Sentinel",
    status: "watch-required",
    mission: "Protect SCRIMED-owned work while preventing unapproved third-party content, logos, screenshots, datasets, code, and media from entering public artifacts.",
    monitoringCadence: "Review every publishable asset, generated asset, sales packet, deck, public page, and training source before external use.",
    watches: ["copy", "visual assets", "third-party source excerpts", "logos", "datasets", "generated media", "repository code"],
    autoActions: ["flag missing provenance", "route registration candidates", "block unapproved customer or partner marks"],
    escalationTriggers: ["unknown license", "customer-identifying artifact", "third-party logo", "large quoted passage", "unclear generated-content rights"],
    blockedActions: ["publish unlicensed content", "claim partner endorsement", "use customer logo without approval", "copy proprietary material"],
    evidenceRoutes: ["/trust-safety-operations", "/claims", "/trust-center/legal", "/trust-center/branding"]
  },
  {
    name: "Claims And Legal Guard",
    status: "active-control",
    mission: "Keep sales, marketing, PR, advertising, product copy, and investor language aligned with approved current capability.",
    monitoringCadence: "Pre-publication review for all external-facing claims and export packets.",
    watches: ["claims register", "pricing copy", "pilot proposals", "ads", "PR copy", "investor language"],
    autoActions: ["block prohibited claims", "require qualifiers", "attach evidence route"],
    escalationTriggers: ["compliance claim", "clinical outcome claim", "ROI guarantee", "customer result", "partnership announcement"],
    blockedActions: ["HIPAA certified claim", "FDA cleared claim", "guaranteed ROI", "production clinical-ready claim"],
    evidenceRoutes: ["/claims", "/trust-center", "/pricing", "/market-activation"]
  },
  {
    name: "Clinical Safety Sentinel",
    status: "active-control",
    mission: "Prevent clinical overreach and keep all outputs non-diagnostic, review-gated, and bounded to operational intelligence.",
    monitoringCadence: "Every clinical-adjacent workflow, Trust Card, demo, and buyer-facing artifact.",
    watches: ["clinical wording", "care recommendations", "risk signals", "patient-facing instructions", "medical device implications"],
    autoActions: ["downgrade to review prompt", "add clinical boundary", "escalate high uncertainty"],
    escalationTriggers: ["diagnosis", "treatment instruction", "emergency guidance", "medication change", "licensed clinician replacement"],
    blockedActions: ["autonomous care decisions", "patient-specific instructions", "medical emergency advice"],
    evidenceRoutes: ["/trust-os", "/atlas", "/workflows", "/trust-center/governance"]
  },
  {
    name: "Security Incident Sentinel",
    status: "watch-required",
    mission: "Watch authentication, rate-limit, runtime, dependency, and audit signals for security escalation.",
    monitoringCadence: "24/7 target operating model; production on-call/SOC/MDR staffing remains an external readiness gate.",
    watches: ["Vercel runtime errors", "Supabase auth failures", "Upstash rate limits", "audit anomalies", "dependency checks"],
    autoActions: ["fail closed", "recommend token rotation", "surface incident checklist"],
    escalationTriggers: ["repeated auth failure", "unexpected 5xx", "audit write failure", "rate-limit spike", "secret exposure signal"],
    blockedActions: ["continue unsafe export", "ignore audit failure", "disable auth boundary"],
    evidenceRoutes: ["/operations", "/trust-center/security", "/audit", "/observability"]
  },
  {
    name: "Continuous Improvement Agent",
    status: "active-control",
    mission: "Convert errors, limitations, buyer friction, denied actions, and audit findings into prioritized fixes.",
    monitoringCadence: "Every release, smoke check, production log review, and buyer workflow review.",
    watches: ["known limitations", "smoke failures", "buyer blockers", "overdue follow-up", "validation gaps"],
    autoActions: ["create next-build recommendation", "preserve workaround", "route owner and evidence"],
    escalationTriggers: ["repeated failure", "manual workaround exceeds threshold", "unowned control", "new legal/security risk"],
    blockedActions: ["hide limitations", "ship unsupported claim", "treat workaround as final control"],
    evidenceRoutes: ["/quality", "/operations", "/product", "/pilot-evidence"]
  }
];

export const trustSafetyControls: TrustSafetyControl[] = [
  {
    name: "Copyright, Trademark, And Provenance Register",
    status: "watch-required",
    owner: "Founder, product, brand, and qualified IP counsel",
    purpose: "Track SCRIMED-owned code, copy, product names, generated assets, third-party references, licenses, registration candidates, and trademark review.",
    evidence: [
      "SCRIMED name, slogan, product names, and routes are centralized.",
      "Public copy avoids unapproved customer, partner, and certification claims.",
      "Source-informed strategy is described without copying proprietary third-party implementation details."
    ],
    requiredNextStep:
      "Create counsel-reviewed IP inventory, copyright registration candidates, trademark clearance plan, contributor assignment records, and asset provenance workflow."
  },
  {
    name: "Claims, Advertising, And Substantiation Gate",
    status: "active-control",
    owner: "Marketing, product, legal, clinical governance, and founder",
    purpose: "Prevent unsupported health, financial, compliance, partnership, and performance claims.",
    evidence: ["Claims register", "Market Activation guardrails", "Product readiness brief", "Attribution packet limitations"],
    requiredNextStep:
      "Attach a dated evidence packet, approver, baseline, method, limitation, and approved channel to every quantified claim."
  },
  {
    name: "Security Monitoring And Incident Response Runbook",
    status: "watch-required",
    owner: "Security, privacy, legal, communications, and engineering",
    purpose: "Move from fail-closed controls to continuous monitoring, triage, incident evidence preservation, and post-incident improvement.",
    evidence: ["AAL2 sales operations", "protected workspace auth", "rate limiting", "runtime log checks", "audit-failure deny paths"],
    requiredNextStep:
      "Approve severity taxonomy, on-call rota, notification decision tree, evidence retention, tabletop cadence, and external security review."
  },
  {
    name: "Agent Safety And Human Review Gate",
    status: "active-control",
    owner: "AI governance, product, clinical governance, and workflow owners",
    purpose: "Keep agents review-gated, explainable, auditable, and non-autonomous for clinical and payer-adjacent work.",
    evidence: ["TrustOS", "AgentOS", "workflow runtime safety", "denied execution stubs", "human approval checkpoints"],
    requiredNextStep:
      "Bind every production candidate to reviewer competence, escalation, override logging, rollback, and outcome validation."
  },
  {
    name: "Evidence Retention And Legal Hold Readiness",
    status: "production-gated",
    owner: "Legal, security, privacy, and operations",
    purpose: "Preserve audit, export, incident, and governance evidence without over-retaining sensitive data.",
    evidence: ["append-only protected-pilot audit", "sales audit events", "proof packet downloads"],
    requiredNextStep:
      "Approve retention schedules, legal hold triggers, deletion workflow, backup handling, and jurisdiction-specific review before regulated data."
  }
];

export const trustSafetyChannels: TrustSafetyChannel[] = [
  {
    name: "Vercel Runtime And Deployment Watch",
    status: "active-control",
    source: "Vercel production deployments, runtime logs, and smoke checks.",
    signal: "Build status, runtime errors, route availability, 4xx/5xx patterns.",
    escalation: "Block release, inspect logs, hotfix, rollback, or open incident review based on severity."
  },
  {
    name: "Supabase Identity And Audit Watch",
    status: "active-control",
    source: "Supabase Auth, RLS-protected RPCs, protected pilot audits, sales audits.",
    signal: "AAL2 enforcement, auth failures, audit-write failure, tenant-boundary failures.",
    escalation: "Fail closed, require reauthentication, rotate credentials, preserve event metadata."
  },
  {
    name: "Rate Limit And Abuse Watch",
    status: "active-control",
    source: "Upstash-backed public intake and protected session controls.",
    signal: "Repeated requests, suspicious intake volume, abuse spikes, webhook failure patterns.",
    escalation: "Throttle, block, switch to manual review, pause paid campaigns."
  },
  {
    name: "Claims And Content Watch",
    status: "watch-required",
    source: "Claims register, product pages, docs, sales packets, market activation copy.",
    signal: "Unsupported compliance, health, ROI, partner, customer, or production-readiness language.",
    escalation: "Block publication, route to counsel or clinical governance, require evidence packet."
  },
  {
    name: "Agent Action Watch",
    status: "active-control",
    source: "TrustOS decisions, AgentOS tasks, work-order events, workflow safety gates.",
    signal: "Denied action, escalation, reviewer override, missing evidence, tool misuse attempt.",
    escalation: "Deny execution, request human approval, quarantine workflow, log improvement item."
  }
];

export const continuousImprovementLoops: TrustSafetyLoop[] = [
  {
    stage: "Detect",
    owner: "Trust and Safety agents",
    action: "Identify runtime, safety, legal, security, copyright, claims, and workflow signals.",
    evidence: "Logs, audit events, denied actions, claims checks, packet exports, route smoke checks.",
    boundary: "Detection is not a guarantee that every issue is found."
  },
  {
    stage: "Triage",
    owner: "Accountable human owner",
    action: "Classify severity, affected surface, data boundary, buyer impact, and escalation path.",
    evidence: "Severity record, owner, timestamp, supporting routes, and immediate containment decision.",
    boundary: "Clinical, legal, privacy, and security determinations require qualified reviewers."
  },
  {
    stage: "Contain",
    owner: "Engineering, security, and product",
    action: "Fail closed, disable unsafe workflow, block claim, pause campaign, or require manual review.",
    evidence: "Commit, config, route denial, audit event, or documented manual control.",
    boundary: "Containment prioritizes safety and trust over automation speed."
  },
  {
    stage: "Fix",
    owner: "Engineering and control owner",
    action: "Implement code, process, documentation, test, or monitoring changes.",
    evidence: "Diff, validation results, deployment status, smoke check, and updated runbook.",
    boundary: "A workaround remains a workaround until validated and governed."
  },
  {
    stage: "Improve",
    owner: "Executive and governance review",
    action: "Update agents, controls, claims, training, evidence packets, and product roadmap.",
    evidence: "Updated readiness register, claims register, release note, and next-build priority.",
    boundary: "Continuous improvement does not remove the synthetic/live-production boundary."
  }
];

export function getTrustSafetyOperationsSummary() {
  const activeControls = trustSafetyControls.filter((control) => control.status === "active-control").length;
  const watchRequired = trustSafetyControls.filter((control) => control.status === "watch-required").length;
  const productionGated = trustSafetyControls.filter((control) => control.status === "production-gated").length;

  return {
    service: "scrimed-trust-safety-operations",
    status: "trust-safety-watchtower-ready",
    route: "/trust-safety-operations",
    apiRoute: "/api/trust-safety-operations",
    boundary: trustSafetyOperationsBoundary,
    operatingPosture:
      "24/7 trust, safety, monitoring, auditing, fixing, improving, and escalation model is defined. Production managed monitoring still requires approved staffing, on-call, SOC/MDR, and customer-specific runbooks before being claimed as live coverage.",
    agents: trustSafetyAgents,
    controls: trustSafetyControls,
    channels: trustSafetyChannels,
    continuousImprovementLoops,
    agentCount: trustSafetyAgents.length,
    controlCount: trustSafetyControls.length,
    channelCount: trustSafetyChannels.length,
    loopStageCount: continuousImprovementLoops.length,
    activeControls,
    watchRequired,
    productionGated,
    sourceUrls: [
      "https://www.copyright.gov/registration/",
      "https://www.uspto.gov/trademarks/basics",
      "https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance",
      "https://www.hhs.gov/hipaa/for-professionals/security/index.html",
      "https://www.nist.gov/itl/ai-risk-management-framework"
    ],
    nextBuildStep:
      "Add a durable trust-ops incident and improvement ledger with severity, owner, containment, legal-hold, post-incident review, and agent-control update tracking.",
    updated: "2026-06-15"
  };
}

export function buildTrustSafetyOperationsBrief() {
  const summary = getTrustSafetyOperationsSummary();

  return [
    "# SCRIMED Trust And Safety Operations Brief",
    "",
    `Status: ${summary.status}`,
    `Boundary: ${summary.boundary}`,
    "",
    "## Operating Posture",
    summary.operatingPosture,
    "",
    "## Agents",
    ...summary.agents.map(
      (agent) => `- ${agent.name} (${agent.status}): ${agent.mission} Escalates: ${agent.escalationTriggers.join(", ")}.`
    ),
    "",
    "## Controls",
    ...summary.controls.map(
      (control) => `- ${control.name} (${control.status}): ${control.requiredNextStep}`
    ),
    "",
    "## Continuous Improvement Loop",
    ...summary.continuousImprovementLoops.map(
      (loop) => `- ${loop.stage}: ${loop.action} Evidence: ${loop.evidence}`
    ),
    "",
    "## Next Build Step",
    summary.nextBuildStep
  ].join("\n");
}
