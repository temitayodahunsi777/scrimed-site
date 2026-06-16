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

export type TrustSafetyIncidentSeverity = "low" | "moderate" | "high" | "critical";
export type TrustSafetyIncidentStatus =
  | "new"
  | "triaged"
  | "contained"
  | "remediating"
  | "monitoring"
  | "closed"
  | "production-gated";
export type TrustSafetyLegalHoldStatus = "not-required" | "watch" | "recommended" | "active";

export type TrustSafetyIncident = {
  id: string;
  title: string;
  severity: TrustSafetyIncidentSeverity;
  status: TrustSafetyIncidentStatus;
  owner: string;
  accountableAgent: string;
  sourceChannel: string;
  createdAt: string;
  updatedAt: string;
  affectedSurface: string[];
  triggerSignal: string;
  buyerImpact: string;
  containmentAction: string;
  remediationPlan: string;
  legalHoldStatus: TrustSafetyLegalHoldStatus;
  reportRoute: string;
  evidenceRoutes: string[];
  auditEvents: string[];
  improvementActions: string[];
  productionBoundary: string;
};

export type TrustSafetyIncidentSla = {
  severity: TrustSafetyIncidentSeverity;
  responseTarget: string;
  containmentTarget: string;
  executiveEscalation: string;
  requiredReviewers: string[];
};

export type TrustSafetyNotificationDecision =
  | "pending"
  | "not-required"
  | "internal-only"
  | "customer-review"
  | "regulatory-review"
  | "counsel-escalation";
export type TrustSafetyPostIncidentReviewStatus =
  | "not-started"
  | "in-review"
  | "actions-assigned"
  | "complete";
export type TrustSafetyIncidentEventType =
  | "incident-created"
  | "status-updated"
  | "containment-recorded"
  | "remediation-updated"
  | "legal-hold-recorded"
  | "legal-hold-released"
  | "notification-decision-recorded"
  | "post-incident-review-recorded"
  | "review-packet-downloaded"
  | "incident-closed";

export type DurableTrustSafetyIncidentRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  incidentKey: string;
  title: string;
  severity: TrustSafetyIncidentSeverity;
  status: TrustSafetyIncidentStatus;
  owner: string;
  accountableAgent: string;
  sourceChannel: string;
  affectedSurface: string[];
  triggerSignal: string;
  buyerImpact: string;
  containmentAction: string;
  remediationPlan: string;
  legalHoldStatus: TrustSafetyLegalHoldStatus;
  notificationDecision: TrustSafetyNotificationDecision;
  notificationReason: string;
  postIncidentReviewStatus: TrustSafetyPostIncidentReviewStatus;
  retentionUntil: string | null;
  legalHoldUntil: string | null;
  eventMetadata: Record<string, unknown>;
  boundary: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
};

export type DurableTrustSafetyIncidentEventRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  incidentId: string;
  actorUserId: string;
  eventType: TrustSafetyIncidentEventType;
  priorStatus: TrustSafetyIncidentStatus | null;
  nextStatus: TrustSafetyIncidentStatus;
  priorLegalHoldStatus: TrustSafetyLegalHoldStatus | null;
  nextLegalHoldStatus: TrustSafetyLegalHoldStatus;
  priorNotificationDecision: TrustSafetyNotificationDecision | null;
  nextNotificationDecision: TrustSafetyNotificationDecision;
  eventSummary: string;
  eventMetadata: Record<string, unknown>;
  boundary: string;
  createdAt: string;
};

export type TrustSafetyIncidentCreateInput = {
  incidentKey: string;
  title: string;
  severity: TrustSafetyIncidentSeverity;
  owner: string;
  accountableAgent: string;
  sourceChannel: string;
  affectedSurface: string[];
  triggerSignal: string;
  buyerImpact: string;
  containmentAction: string;
  remediationPlan: string;
  legalHoldStatus: TrustSafetyLegalHoldStatus;
  notificationDecision: TrustSafetyNotificationDecision;
  notificationReason: string;
  retentionUntil: string | null;
  legalHoldUntil: string | null;
  eventMetadata: Record<string, unknown>;
};

export type TrustSafetyIncidentUpdateInput = {
  status: TrustSafetyIncidentStatus | null;
  severity: TrustSafetyIncidentSeverity | null;
  legalHoldStatus: TrustSafetyLegalHoldStatus | null;
  notificationDecision: TrustSafetyNotificationDecision | null;
  notificationReason: string | null;
  containmentAction: string | null;
  remediationPlan: string | null;
  postIncidentReviewStatus: TrustSafetyPostIncidentReviewStatus | null;
  retentionUntil: string | null;
  legalHoldUntil: string | null;
  eventType: TrustSafetyIncidentEventType;
  eventSummary: string;
  eventMetadata: Record<string, unknown>;
};

export type DurableTrustSafetyIncidentDashboard = {
  totalIncidents: number;
  openIncidents: number;
  highOrCriticalOpen: number;
  legalHoldActive: number;
  notificationReviews: number;
  postIncidentReviewsOpen: number;
  packetDownloads: number;
  latestUpdatedAt: string | null;
  bySeverity: Record<TrustSafetyIncidentSeverity, number>;
  byStatus: Record<TrustSafetyIncidentStatus, number>;
  byLegalHoldStatus: Record<TrustSafetyLegalHoldStatus, number>;
  byNotificationDecision: Record<TrustSafetyNotificationDecision, number>;
  boundaryControls: string[];
};

export type TenantTrustSafetyIncidentPacketInput = {
  workspace: {
    slug: string;
    name: string;
    tenantName: string;
    boundary: string;
  };
  incident: DurableTrustSafetyIncidentRecord;
  events: DurableTrustSafetyIncidentEventRecord[];
  auditEventId: string;
  generatedAt: string;
  actorUserId: string;
  appBaseUrl: string;
};

type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: string[] };

export const trustSafetyOperationsBoundary =
  "SCRIMED Trust and Safety Operations is an operating model and product control layer for synthetic evaluations, protected pilots, and enterprise readiness. It does not create legal advice, compliance certification, 24/7 managed SOC/MDR coverage, production clinical monitoring, or authorization for live clinical execution.";

export const tenantTrustSafetyIncidentBoundary =
  "Tenant TrustOps Incident Workspace stores synthetic-pilot and enterprise-readiness incident evidence only. It does not store PHI, patient identifiers, live clinical records, secrets, payer member identifiers, production breach determinations, legal advice, compliance certification, or managed 24/7 SOC/MDR coverage.";

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

export const trustSafetyIncidentSlas: TrustSafetyIncidentSla[] = [
  {
    severity: "critical",
    responseTarget: "Immediate founder/security/privacy escalation in the target operating model.",
    containmentTarget: "Fail closed, pause affected workflow, and preserve evidence before further release.",
    executiveEscalation: "Founder, security owner, privacy owner, counsel, and customer incident owner when applicable.",
    requiredReviewers: ["security", "privacy", "legal", "engineering", "executive owner"]
  },
  {
    severity: "high",
    responseTarget: "Same-business-day owner assignment in protected pilots; faster for production incidents once staffed.",
    containmentTarget: "Block publication, export, connector action, or claim until reviewed.",
    executiveEscalation: "Founder plus accountable domain owner.",
    requiredReviewers: ["domain owner", "legal/privacy/security as applicable", "product owner"]
  },
  {
    severity: "moderate",
    responseTarget: "Next operational review cycle with assigned owner and evidence route.",
    containmentTarget: "Document workaround, add review gate, and prevent unsupported external release.",
    executiveEscalation: "Escalate if repeated, unowned, or buyer-facing.",
    requiredReviewers: ["control owner", "engineering/product owner"]
  },
  {
    severity: "low",
    responseTarget: "Track in the continuous-improvement queue.",
    containmentTarget: "Fix through normal release, documentation, or smoke-check improvement.",
    executiveEscalation: "Escalate only if repeated or tied to buyer trust.",
    requiredReviewers: ["control owner"]
  }
];

export const trustSafetyIncidentSeverities: TrustSafetyIncidentSeverity[] = [
  "low",
  "moderate",
  "high",
  "critical"
];

export const trustSafetyIncidentStatuses: TrustSafetyIncidentStatus[] = [
  "new",
  "triaged",
  "contained",
  "remediating",
  "monitoring",
  "closed",
  "production-gated"
];

export const trustSafetyLegalHoldStatuses: TrustSafetyLegalHoldStatus[] = [
  "not-required",
  "watch",
  "recommended",
  "active"
];

export const trustSafetyNotificationDecisions: TrustSafetyNotificationDecision[] = [
  "pending",
  "not-required",
  "internal-only",
  "customer-review",
  "regulatory-review",
  "counsel-escalation"
];

export const trustSafetyPostIncidentReviewStatuses: TrustSafetyPostIncidentReviewStatus[] = [
  "not-started",
  "in-review",
  "actions-assigned",
  "complete"
];

export const trustSafetyIncidentEventTypes: TrustSafetyIncidentEventType[] = [
  "incident-created",
  "status-updated",
  "containment-recorded",
  "remediation-updated",
  "legal-hold-recorded",
  "legal-hold-released",
  "notification-decision-recorded",
  "post-incident-review-recorded",
  "review-packet-downloaded",
  "incident-closed"
];

export const targetAudienceTrustOpsSignals = [
  {
    audience: "CIOs and digital transformation leaders",
    appeal:
      "Shows SCRIMED can operate as a tenant-isolated healthcare intelligence layer with durable evidence, route-level controls, and rollout discipline."
  },
  {
    audience: "CISOs, security reviewers, and privacy officers",
    appeal:
      "Surfaces authentication, AAL2 mutation gates, no-PHI boundaries, legal-hold posture, notification decisions, and audit packet evidence."
  },
  {
    audience: "Compliance, legal, and governance teams",
    appeal:
      "Keeps claims, incident ownership, reviewer status, limitation registers, and escalation boundaries visible before production commitments."
  },
  {
    audience: "Clinical operations, RCM, research, and payer teams",
    appeal:
      "Connects incident controls to workflow reliability, human review, revenue-risk review, trial operations, documentation review, and interoperability readiness."
  },
  {
    audience: "Enterprise buyers, investors, and strategic partners",
    appeal:
      "Turns trust into inspectable operating evidence rather than unsupported marketing language."
  }
];

export const trustSafetyIncidents: TrustSafetyIncident[] = [
  {
    id: "trustops-phi-style-intake-block",
    title: "PHI-style intake content attempted in a public or sales workflow",
    severity: "moderate",
    status: "contained",
    owner: "Privacy and product control owner",
    accountableAgent: "PHI Shield Agent",
    sourceChannel: "Supabase Identity And Audit Watch",
    createdAt: "2026-06-16T09:00:00.000Z",
    updatedAt: "2026-06-16T09:00:00.000Z",
    affectedSurface: ["public pilot intake", "sales operations", "protected pilot boundary"],
    triggerSignal: "PHI-style wording, patient identifier pattern, or clinical-record request appears in a no-PHI workflow.",
    buyerImpact:
      "Protects SCRIMED and buyers from routing patient data into public intake, sales analytics, or synthetic pilot workflows before approved production controls.",
    containmentAction: "Reject prohibited content, return no-PHI guidance, and preserve safe metadata only.",
    remediationPlan:
      "Keep public and sales workflows business-contact only; add stricter phrase checks when repeated patterns appear.",
    legalHoldStatus: "not-required",
    reportRoute: "/api/trust-safety-operations/incidents/trustops-phi-style-intake-block/report",
    evidenceRoutes: ["/pilot", "/sales-operations", "/trust-center/privacy", "/api/pilot/intake"],
    auditEvents: ["intake-blocked", "no-phi-boundary-returned", "safe-metadata-retained"],
    improvementActions: [
      "Review rejected patterns after every campaign launch.",
      "Add new prohibited terms to intake and sales operations validation.",
      "Escalate suspected live PHI to privacy and counsel before any retention decision."
    ],
    productionBoundary:
      "This incident pattern is synthetic/pilot boundary protection only; actual breach analysis requires authorized privacy, security, legal, and customer incident owners."
  },
  {
    id: "trustops-claims-substantiation-gate",
    title: "Unsupported public claim, sales claim, or advertising claim needs substantiation",
    severity: "high",
    status: "contained",
    owner: "Claims, marketing, legal, and product owner",
    accountableAgent: "Claims And Legal Guard",
    sourceChannel: "Claims And Content Watch",
    createdAt: "2026-06-16T09:10:00.000Z",
    updatedAt: "2026-06-16T09:10:00.000Z",
    affectedSurface: ["website copy", "sales packets", "pricing", "PR and advertising"],
    triggerSignal:
      "Language suggests certification, clinical outcome, guaranteed ROI, partnership, production readiness, or patient treatment capability without approved evidence.",
    buyerImpact:
      "Keeps SCRIMED credible with health systems, payers, investors, regulators, and enterprise counsel by forcing claims to match current capability.",
    containmentAction: "Block publication and replace with current-boundary language until evidence and approvers are attached.",
    remediationPlan:
      "Route each quantified or regulated claim through the claims register with dated evidence, approved channel, limitation, and accountable approver.",
    legalHoldStatus: "watch",
    reportRoute: "/api/trust-safety-operations/incidents/trustops-claims-substantiation-gate/report",
    evidenceRoutes: ["/claims", "/trust-center", "/market-activation", "/api/enterprise-readiness/claims"],
    auditEvents: ["claim-blocked", "evidence-required", "approved-boundary-replacement-used"],
    improvementActions: [
      "Require claims-register entry before publishing new marketing copy.",
      "Keep synthetic-pilot boundary visible in buyer and investor artifacts.",
      "Escalate regulated health, compliance, and ROI claims to qualified external reviewers."
    ],
    productionBoundary:
      "This gate is not legal advice or advertising clearance; final external claims require qualified counsel and appropriate domain reviewers."
  },
  {
    id: "trustops-ip-provenance-register",
    title: "Copyright, trademark, or third-party asset provenance missing before external use",
    severity: "high",
    status: "remediating",
    owner: "Brand, product, founder, and qualified IP counsel",
    accountableAgent: "Copyright And IP Sentinel",
    sourceChannel: "Claims And Content Watch",
    createdAt: "2026-06-16T09:20:00.000Z",
    updatedAt: "2026-06-16T09:20:00.000Z",
    affectedSurface: ["product names", "public pages", "generated media", "sales packets", "source-informed strategy"],
    triggerSignal:
      "Asset, name, screenshot, logo, source excerpt, dataset, code, or generated-media item lacks clear ownership, permission, license, or approval.",
    buyerImpact:
      "Reduces brand, IP, and partnership risk while preserving SCRIMED-owned product value and defensibility.",
    containmentAction: "Hold external publication until provenance, ownership, license, or counsel review is attached.",
    remediationPlan:
      "Maintain an IP inventory, registration candidate list, trademark clearance plan, contributor assignments, and approved asset source log.",
    legalHoldStatus: "watch",
    reportRoute: "/api/trust-safety-operations/incidents/trustops-ip-provenance-register/report",
    evidenceRoutes: ["/trust-safety-operations", "/trust-center/branding", "/claims", "/source-intelligence"],
    auditEvents: ["asset-provenance-required", "registration-candidate-routed", "third-party-mark-blocked"],
    improvementActions: [
      "Add source URL, license, owner, approval status, and expiration to each external asset.",
      "Separate source-informed strategy from copied third-party implementation details.",
      "Escalate marks, slogans, and product names to trademark clearance before major launch."
    ],
    productionBoundary:
      "This register supports IP readiness and evidence discipline; it does not create copyright registration, trademark registration, or legal clearance by itself."
  },
  {
    id: "trustops-attribution-packet-audit-event",
    title: "Attribution analytics packet needed a dedicated audit event instead of CRM-export workaround",
    severity: "moderate",
    status: "monitoring",
    owner: "Sales operations and audit persistence owner",
    accountableAgent: "Continuous Improvement Agent",
    sourceChannel: "Supabase Identity And Audit Watch",
    createdAt: "2026-06-16T09:30:00.000Z",
    updatedAt: "2026-06-16T09:30:00.000Z",
    affectedSurface: ["sales operations", "attribution analytics", "audit events", "enterprise proof packets"],
    triggerSignal:
      "Attribution packet release was audited under a generic sales artifact event while a dedicated event type was pending migration.",
    buyerImpact:
      "Improves evidence specificity for investor, board, and enterprise sales reviews without exposing PHI or buyer-sensitive health data.",
    containmentAction:
      "Add a dedicated attribution packet audit event and keep a compatibility fallback during database rollout.",
    remediationPlan:
      "Deploy the event migration, update the packet route header, and retain fallback metadata only until the database migration is confirmed.",
    legalHoldStatus: "not-required",
    reportRoute: "/api/trust-safety-operations/incidents/trustops-attribution-packet-audit-event/report",
    evidenceRoutes: [
      "/attribution-analytics",
      "/sales-operations",
      "/api/sales-operations/opportunities/{intakeId}/attribution-analytics-packet"
    ],
    auditEvents: [
      "attribution-analytics-packet-downloaded",
      "crm-export-downloaded-rollout-fallback",
      "no-phi-boundary-confirmed"
    ],
    improvementActions: [
      "Promote the dedicated audit event in Supabase.",
      "Smoke authenticated packet release after migration.",
      "Remove fallback metadata once the production migration is verified."
    ],
    productionBoundary:
      "This audit event applies to business-contact and workflow-scope sales metadata only; no PHI, clinical records, diagnosis details, payer member identifiers, or autonomous care claims."
  },
  {
    id: "trustops-coverage-claim-gate",
    title: "24/7 managed monitoring coverage must not be claimed before staffing and external readiness",
    severity: "high",
    status: "production-gated",
    owner: "Founder, security, operations, legal, and communications",
    accountableAgent: "Security Incident Sentinel",
    sourceChannel: "Vercel Runtime And Deployment Watch",
    createdAt: "2026-06-16T09:40:00.000Z",
    updatedAt: "2026-06-16T09:40:00.000Z",
    affectedSurface: ["trust center", "sales proposals", "security review", "enterprise readiness"],
    triggerSignal:
      "Copy or sales material implies live 24/7 managed SOC, MDR, production clinical monitoring, or customer incident-response coverage.",
    buyerImpact:
      "Keeps SCRIMED trustworthy by separating current product controls from future managed operations commitments.",
    containmentAction: "Use target-operating-model language and block live-coverage claims until staffing, contracts, runbooks, and tabletop evidence exist.",
    remediationPlan:
      "Approve on-call rota, severity taxonomy, notification tree, escalation owners, external security review, and tabletop cadence.",
    legalHoldStatus: "watch",
    reportRoute: "/api/trust-safety-operations/incidents/trustops-coverage-claim-gate/report",
    evidenceRoutes: ["/trust-safety-operations", "/operations", "/observability", "/trust-center/security"],
    auditEvents: ["coverage-claim-blocked", "staffing-gate-opened", "external-review-required"],
    improvementActions: [
      "Keep 24/7 language framed as an operating design until staffed.",
      "Attach incident owner matrix before any production customer agreement.",
      "Add post-tabletop evidence before upgrading the claim."
    ],
    productionBoundary:
      "SCRIMED can show the operating architecture now, but live managed coverage requires approved staffing, vendor coverage, customer-specific runbooks, and legal/security review."
  },
  {
    id: "trustops-runtime-security-watch",
    title: "Runtime, dependency, and deployment anomaly watch needs owner-driven review",
    severity: "low",
    status: "monitoring",
    owner: "Engineering and security owner",
    accountableAgent: "Security Incident Sentinel",
    sourceChannel: "Vercel Runtime And Deployment Watch",
    createdAt: "2026-06-16T09:50:00.000Z",
    updatedAt: "2026-06-16T09:50:00.000Z",
    affectedSurface: ["Vercel deployment", "runtime logs", "quality gates", "dependency checks"],
    triggerSignal: "Production smoke check, runtime log scan, dependency audit, or build gate reports an anomaly.",
    buyerImpact:
      "Maintains demo and pilot reliability while preventing small failures from becoming hidden sales or security risk.",
    containmentAction: "Fail closed, investigate logs, patch, verify, and preserve release evidence.",
    remediationPlan:
      "Keep build, lint, typecheck, generated integrity, production smoke, and runtime-log review in every strategic release loop.",
    legalHoldStatus: "not-required",
    reportRoute: "/api/trust-safety-operations/incidents/trustops-runtime-security-watch/report",
    evidenceRoutes: ["/quality", "/observability", "/operations", "/api/health"],
    auditEvents: ["build-gate-reviewed", "runtime-log-scan-clean", "production-smoke-checked"],
    improvementActions: [
      "Increase smoke coverage when a route is added.",
      "Escalate repeated 5xx or auth-boundary regressions.",
      "Keep local npm limitation bypassed through direct Node quality commands until package manager access is restored."
    ],
    productionBoundary:
      "Runtime watch supports current Vercel-hosted pilot and demo readiness; production customers still require customer-specific monitoring, alerting, incident ownership, and support agreements."
  }
];

export const resolvedTrustSafetyLimitations = [
  {
    limitation: "Trust Safety Operations had no incident queue or audit-ready report surface.",
    resolution:
      "Added a synthetic trust-ops incident queue, severity/status/owner model, escalation SLA, and downloadable incident report route for each tracked incident."
  },
  {
    limitation: "Trust-ops incidents were inspectable product-control records without a tenant-scoped durable incident workspace contract.",
    resolution:
      "Added a private-schema Supabase migration, guarded RPC contract, authenticated incident dashboard, mutation path, event trail, legal-hold fields, notification decisions, and review-packet release pattern."
  },
  {
    limitation: "Attribution analytics packet release used a generic CRM export audit event.",
    resolution:
      "Added a dedicated attribution analytics packet event path with compatibility fallback until the Supabase migration is confirmed in production."
  }
];

export const remainingTrustSafetyLimitations = [
  "Production managed 24/7 coverage still requires staffed on-call/SOC/MDR coverage, contracts, tabletop exercises, customer-specific runbooks, and external security review.",
  "Tenant TrustOps storage is designed for synthetic pilots and enterprise readiness; regulated production incidents still require customer-approved live-data boundaries, breach analysis, notification decisions, and forensic process.",
  "The TrustOps Supabase migration must be applied and authenticated-smoke-tested in each environment before tenant mutation routes are used with buyers.",
  "Clinical, legal, privacy, security, copyright, trademark, reimbursement, and advertising determinations still require qualified human reviewers."
];

const incidentKeyPattern = /^trustops-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const prohibitedIncidentContentPatterns = [
  /\bmrn\b/i,
  /\bmedical record number\b/i,
  /\bmember id\b/i,
  /\bpolicy number\b/i,
  /\bssn\b/i,
  /\bsocial security\b/i,
  /\bdate of birth\b/i,
  /\bdob\b/i,
  /\bpatient identifier\b/i,
  /\bdiagnosis code for patient\b/i,
  /\blive chart\b/i,
  /\bclinical record\b/i,
  /\bprogress note\b/i,
  /\blab result\b/i
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function optionalString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function optionalIsoTimestamp(value: unknown, fieldName: string, errors: string[]) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    errors.push(`${fieldName} must be an ISO timestamp when provided`);
    return null;
  }

  const parsed = Date.parse(value);

  if (!Number.isFinite(parsed)) {
    errors.push(`${fieldName} must be a valid ISO timestamp`);
    return null;
  }

  return new Date(parsed).toISOString();
}

function metadataObject(value: unknown, fieldName: string, errors: string[]) {
  if (value === undefined || value === null) {
    return {};
  }

  if (!isRecord(value)) {
    errors.push(`${fieldName} must be a JSON object`);
    return {};
  }

  if (JSON.stringify(value).length > 16000) {
    errors.push(`${fieldName} must stay below 16000 serialized characters`);
  }

  return value;
}

function affectedSurfaceArray(value: unknown, errors: string[]) {
  if (!Array.isArray(value)) {
    errors.push("affectedSurface must be an array of one to twelve non-empty strings");
    return [];
  }

  const surface = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);

  if (surface.length === 0 || surface.length !== value.length) {
    errors.push("affectedSurface must contain one to twelve non-empty strings");
  }

  if (surface.some((item) => item.length > 160)) {
    errors.push("affectedSurface entries must be 160 characters or fewer");
  }

  return surface;
}

function slugifyIncidentKey(title: string) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `trustops-${slug || "tenant-incident"}`;
}

function hasProhibitedIncidentContent(...values: string[]) {
  const joined = values.join(" ");
  return prohibitedIncidentContentPatterns.some((pattern) => pattern.test(joined));
}

function validateLength(
  value: string,
  fieldName: string,
  min: number,
  max: number,
  errors: string[]
) {
  if (value.length < min || value.length > max) {
    errors.push(`${fieldName} must be between ${min} and ${max} characters`);
  }
}

export function isTrustSafetyIncidentSeverity(value: unknown): value is TrustSafetyIncidentSeverity {
  return typeof value === "string" && trustSafetyIncidentSeverities.includes(value as TrustSafetyIncidentSeverity);
}

export function isTrustSafetyIncidentStatus(value: unknown): value is TrustSafetyIncidentStatus {
  return typeof value === "string" && trustSafetyIncidentStatuses.includes(value as TrustSafetyIncidentStatus);
}

export function isTrustSafetyLegalHoldStatus(value: unknown): value is TrustSafetyLegalHoldStatus {
  return typeof value === "string" && trustSafetyLegalHoldStatuses.includes(value as TrustSafetyLegalHoldStatus);
}

export function isTrustSafetyNotificationDecision(value: unknown): value is TrustSafetyNotificationDecision {
  return (
    typeof value === "string" &&
    trustSafetyNotificationDecisions.includes(value as TrustSafetyNotificationDecision)
  );
}

export function isTrustSafetyPostIncidentReviewStatus(
  value: unknown
): value is TrustSafetyPostIncidentReviewStatus {
  return (
    typeof value === "string" &&
    trustSafetyPostIncidentReviewStatuses.includes(value as TrustSafetyPostIncidentReviewStatus)
  );
}

export function isTrustSafetyIncidentEventType(value: unknown): value is TrustSafetyIncidentEventType {
  return typeof value === "string" && trustSafetyIncidentEventTypes.includes(value as TrustSafetyIncidentEventType);
}

export function validateTrustSafetyIncidentCreatePayload(
  payload: unknown
): ValidationResult<TrustSafetyIncidentCreateInput> {
  const errors: string[] = [];

  if (!isRecord(payload)) {
    return { ok: false, errors: ["payload must be a JSON object"] };
  }

  const title = optionalString(payload.title);
  const incidentKey = optionalString(payload.incidentKey, slugifyIncidentKey(title));
  const severity = isTrustSafetyIncidentSeverity(payload.severity) ? payload.severity : null;
  const owner = optionalString(payload.owner);
  const accountableAgent = optionalString(payload.accountableAgent);
  const sourceChannel = optionalString(payload.sourceChannel);
  const affectedSurface = affectedSurfaceArray(payload.affectedSurface, errors);
  const triggerSignal = optionalString(payload.triggerSignal);
  const buyerImpact = optionalString(payload.buyerImpact);
  const containmentAction = optionalString(payload.containmentAction);
  const remediationPlan = optionalString(payload.remediationPlan);
  const legalHoldStatus = isTrustSafetyLegalHoldStatus(payload.legalHoldStatus)
    ? payload.legalHoldStatus
    : "not-required";
  const notificationDecision = isTrustSafetyNotificationDecision(payload.notificationDecision)
    ? payload.notificationDecision
    : "pending";
  const notificationReason = optionalString(payload.notificationReason);
  const retentionUntil = optionalIsoTimestamp(payload.retentionUntil, "retentionUntil", errors);
  const legalHoldUntil = optionalIsoTimestamp(payload.legalHoldUntil, "legalHoldUntil", errors);
  const eventMetadata = metadataObject(payload.eventMetadata, "eventMetadata", errors);

  if (!incidentKeyPattern.test(incidentKey) || incidentKey.length > 120) {
    errors.push("incidentKey must match trustops-slug-format and be 120 characters or fewer");
  }

  if (!severity) {
    errors.push("severity must be low, moderate, high, or critical");
  }

  validateLength(title, "title", 10, 240, errors);
  validateLength(owner, "owner", 3, 180, errors);
  validateLength(accountableAgent, "accountableAgent", 3, 180, errors);
  validateLength(sourceChannel, "sourceChannel", 3, 180, errors);
  validateLength(triggerSignal, "triggerSignal", 20, 2000, errors);
  validateLength(buyerImpact, "buyerImpact", 20, 2000, errors);
  validateLength(containmentAction, "containmentAction", 20, 2000, errors);
  validateLength(remediationPlan, "remediationPlan", 20, 2000, errors);

  if (notificationReason.length > 1200) {
    errors.push("notificationReason must be 1200 characters or fewer");
  }

  if (legalHoldStatus === "active" && legalHoldUntil && Date.parse(legalHoldUntil) <= Date.now()) {
    errors.push("legalHoldUntil must be in the future for an active legal hold");
  }

  if (retentionUntil && Date.parse(retentionUntil) <= Date.now()) {
    errors.push("retentionUntil must be in the future when provided");
  }

  if (
    hasProhibitedIncidentContent(
      title,
      owner,
      accountableAgent,
      sourceChannel,
      triggerSignal,
      buyerImpact,
      containmentAction,
      remediationPlan,
      notificationReason,
      ...affectedSurface
    )
  ) {
    errors.push("incident fields must not include PHI, patient identifiers, payer member identifiers, or live clinical record details");
  }

  if (errors.length > 0 || !severity) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      incidentKey,
      title,
      severity,
      owner,
      accountableAgent,
      sourceChannel,
      affectedSurface,
      triggerSignal,
      buyerImpact,
      containmentAction,
      remediationPlan,
      legalHoldStatus,
      notificationDecision,
      notificationReason,
      retentionUntil,
      legalHoldUntil,
      eventMetadata
    }
  };
}

function defaultTrustSafetyEventType(
  status: TrustSafetyIncidentStatus | null,
  legalHoldStatus: TrustSafetyLegalHoldStatus | null,
  notificationDecision: TrustSafetyNotificationDecision | null,
  postIncidentReviewStatus: TrustSafetyPostIncidentReviewStatus | null
): TrustSafetyIncidentEventType {
  if (status === "closed") {
    return "incident-closed";
  }

  if (legalHoldStatus === "active") {
    return "legal-hold-recorded";
  }

  if (legalHoldStatus === "not-required") {
    return "legal-hold-released";
  }

  if (notificationDecision && notificationDecision !== "pending") {
    return "notification-decision-recorded";
  }

  if (postIncidentReviewStatus) {
    return "post-incident-review-recorded";
  }

  return "status-updated";
}

export function validateTrustSafetyIncidentUpdatePayload(
  payload: unknown
): ValidationResult<TrustSafetyIncidentUpdateInput> {
  const errors: string[] = [];

  if (!isRecord(payload)) {
    return { ok: false, errors: ["payload must be a JSON object"] };
  }

  const status =
    payload.status === undefined || payload.status === null
      ? null
      : isTrustSafetyIncidentStatus(payload.status)
        ? payload.status
        : "__invalid_status__";
  const severity =
    payload.severity === undefined || payload.severity === null
      ? null
      : isTrustSafetyIncidentSeverity(payload.severity)
        ? payload.severity
        : "__invalid_severity__";
  const legalHoldStatus =
    payload.legalHoldStatus === undefined || payload.legalHoldStatus === null
      ? null
      : isTrustSafetyLegalHoldStatus(payload.legalHoldStatus)
        ? payload.legalHoldStatus
        : "__invalid_legal_hold__";
  const notificationDecision =
    payload.notificationDecision === undefined || payload.notificationDecision === null
      ? null
      : isTrustSafetyNotificationDecision(payload.notificationDecision)
        ? payload.notificationDecision
        : "__invalid_notification__";
  const postIncidentReviewStatus =
    payload.postIncidentReviewStatus === undefined || payload.postIncidentReviewStatus === null
      ? null
      : isTrustSafetyPostIncidentReviewStatus(payload.postIncidentReviewStatus)
        ? payload.postIncidentReviewStatus
        : "__invalid_review_status__";
  const eventType =
    payload.eventType === undefined || payload.eventType === null
      ? defaultTrustSafetyEventType(
          status === "__invalid_status__" ? null : status,
          legalHoldStatus === "__invalid_legal_hold__" ? null : legalHoldStatus,
          notificationDecision === "__invalid_notification__" ? null : notificationDecision,
          postIncidentReviewStatus === "__invalid_review_status__" ? null : postIncidentReviewStatus
        )
      : isTrustSafetyIncidentEventType(payload.eventType)
        ? payload.eventType
        : null;
  const notificationReason =
    payload.notificationReason === undefined || payload.notificationReason === null
      ? null
      : optionalString(payload.notificationReason);
  const containmentAction =
    payload.containmentAction === undefined || payload.containmentAction === null
      ? null
      : optionalString(payload.containmentAction);
  const remediationPlan =
    payload.remediationPlan === undefined || payload.remediationPlan === null
      ? null
      : optionalString(payload.remediationPlan);
  const eventSummary = optionalString(payload.eventSummary);
  const retentionUntil = optionalIsoTimestamp(payload.retentionUntil, "retentionUntil", errors);
  const legalHoldUntil = optionalIsoTimestamp(payload.legalHoldUntil, "legalHoldUntil", errors);
  const eventMetadata = metadataObject(payload.eventMetadata, "eventMetadata", errors);

  if (status === "__invalid_status__") {
    errors.push("status must match a supported TrustOps status");
  }

  if (severity === "__invalid_severity__") {
    errors.push("severity must be low, moderate, high, or critical");
  }

  if (legalHoldStatus === "__invalid_legal_hold__") {
    errors.push("legalHoldStatus must be not-required, watch, recommended, or active");
  }

  if (notificationDecision === "__invalid_notification__") {
    errors.push("notificationDecision must match a supported TrustOps notification decision");
  }

  if (postIncidentReviewStatus === "__invalid_review_status__") {
    errors.push("postIncidentReviewStatus must match a supported review status");
  }

  if (!eventType) {
    errors.push("eventType must match a supported TrustOps incident event type");
  }

  if (notificationReason && notificationReason.length > 1200) {
    errors.push("notificationReason must be 1200 characters or fewer");
  }

  if (containmentAction !== null) {
    validateLength(containmentAction, "containmentAction", 20, 2000, errors);
  }

  if (remediationPlan !== null) {
    validateLength(remediationPlan, "remediationPlan", 20, 2000, errors);
  }

  if (eventSummary.length < 12 || eventSummary.length > 2000) {
    errors.push("eventSummary must be between 12 and 2000 characters");
  }

  if (legalHoldStatus === "active" && legalHoldUntil && Date.parse(legalHoldUntil) <= Date.now()) {
    errors.push("legalHoldUntil must be in the future for an active legal hold");
  }

  if (retentionUntil && Date.parse(retentionUntil) <= Date.now()) {
    errors.push("retentionUntil must be in the future when provided");
  }

  if (status === "closed" && postIncidentReviewStatus !== "complete") {
    errors.push("closing a TrustOps incident requires postIncidentReviewStatus complete");
  }

  if (
    hasProhibitedIncidentContent(
      notificationReason ?? "",
      containmentAction ?? "",
      remediationPlan ?? "",
      eventSummary
    )
  ) {
    errors.push("incident update fields must not include PHI, patient identifiers, payer member identifiers, or live clinical record details");
  }

  if (errors.length > 0 || !eventType) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      status: status === "__invalid_status__" ? null : status,
      severity: severity === "__invalid_severity__" ? null : severity,
      legalHoldStatus: legalHoldStatus === "__invalid_legal_hold__" ? null : legalHoldStatus,
      notificationDecision:
        notificationDecision === "__invalid_notification__" ? null : notificationDecision,
      notificationReason,
      containmentAction,
      remediationPlan,
      postIncidentReviewStatus:
        postIncidentReviewStatus === "__invalid_review_status__" ? null : postIncidentReviewStatus,
      retentionUntil,
      legalHoldUntil,
      eventType,
      eventSummary,
      eventMetadata
    }
  };
}

function emptySeverityCounts() {
  return Object.fromEntries(trustSafetyIncidentSeverities.map((severity) => [severity, 0])) as Record<
    TrustSafetyIncidentSeverity,
    number
  >;
}

function emptyStatusCounts() {
  return Object.fromEntries(trustSafetyIncidentStatuses.map((status) => [status, 0])) as Record<
    TrustSafetyIncidentStatus,
    number
  >;
}

function emptyLegalHoldCounts() {
  return Object.fromEntries(trustSafetyLegalHoldStatuses.map((status) => [status, 0])) as Record<
    TrustSafetyLegalHoldStatus,
    number
  >;
}

function emptyNotificationCounts() {
  return Object.fromEntries(trustSafetyNotificationDecisions.map((decision) => [decision, 0])) as Record<
    TrustSafetyNotificationDecision,
    number
  >;
}

export function summarizeDurableTrustSafetyIncidents(
  incidents: DurableTrustSafetyIncidentRecord[],
  events: DurableTrustSafetyIncidentEventRecord[] = []
): DurableTrustSafetyIncidentDashboard {
  const bySeverity = emptySeverityCounts();
  const byStatus = emptyStatusCounts();
  const byLegalHoldStatus = emptyLegalHoldCounts();
  const byNotificationDecision = emptyNotificationCounts();

  for (const incident of incidents) {
    bySeverity[incident.severity] += 1;
    byStatus[incident.status] += 1;
    byLegalHoldStatus[incident.legalHoldStatus] += 1;
    byNotificationDecision[incident.notificationDecision] += 1;
  }

  const openIncidents = incidents.filter((incident) => incident.status !== "closed").length;
  const latestUpdatedAt = incidents.reduce<string | null>(
    (latest, incident) => (!latest || incident.updatedAt > latest ? incident.updatedAt : latest),
    null
  );

  return {
    totalIncidents: incidents.length,
    openIncidents,
    highOrCriticalOpen: incidents.filter(
      (incident) =>
        incident.status !== "closed" && ["high", "critical"].includes(incident.severity)
    ).length,
    legalHoldActive: incidents.filter((incident) => incident.legalHoldStatus === "active").length,
    notificationReviews: incidents.filter((incident) =>
      ["customer-review", "regulatory-review", "counsel-escalation"].includes(incident.notificationDecision)
    ).length,
    postIncidentReviewsOpen: incidents.filter(
      (incident) =>
        incident.status === "closed" && incident.postIncidentReviewStatus !== "complete"
    ).length,
    packetDownloads: events.filter((event) => event.eventType === "review-packet-downloaded").length,
    latestUpdatedAt,
    bySeverity,
    byStatus,
    byLegalHoldStatus,
    byNotificationDecision,
    boundaryControls: [
      "Private-schema incident tables",
      "RLS deny-all defense in depth",
      "AAL2 tenant-admin or pilot-lead mutation gates",
      "Tenant reviewer packet release with write-before-release audit",
      "Legal-hold and notification-decision fields",
      "Synthetic-pilot and enterprise-readiness data only",
      "No PHI, breach determination, legal advice, compliance certification, or managed SOC/MDR claim"
    ]
  };
}

function countIncidentsBySeverity(severity: TrustSafetyIncidentSeverity) {
  return trustSafetyIncidents.filter((incident) => incident.severity === severity).length;
}

function countIncidentsByStatus(status: TrustSafetyIncidentStatus) {
  return trustSafetyIncidents.filter((incident) => incident.status === status).length;
}

function cleanReportText(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export function getTrustSafetyIncidentById(incidentId: string) {
  return trustSafetyIncidents.find((incident) => incident.id === incidentId) ?? null;
}

export function getTrustSafetyOperationsSummary() {
  const activeControls = trustSafetyControls.filter((control) => control.status === "active-control").length;
  const watchRequired = trustSafetyControls.filter((control) => control.status === "watch-required").length;
  const productionGated = trustSafetyControls.filter((control) => control.status === "production-gated").length;
  const openIncidentCount = trustSafetyIncidents.filter(
    (incident) => incident.status !== "closed"
  ).length;
  const containedIncidentCount = trustSafetyIncidents.filter((incident) =>
    ["contained", "monitoring", "closed"].includes(incident.status)
  ).length;
  const legalHoldWatchCount = trustSafetyIncidents.filter(
    (incident) => incident.legalHoldStatus !== "not-required"
  ).length;

  return {
    service: "scrimed-trust-safety-operations",
    status: "trust-safety-incident-operations-ready",
    route: "/trust-safety-operations",
    apiRoute: "/api/trust-safety-operations",
    incidentReportApiRoute: "/api/trust-safety-operations/incidents/{incidentId}/report",
    tenantIncidentDashboardApiRoute: "/api/pilot-workspaces/{workspaceSlug}/trust-safety-incidents",
    tenantIncidentMutationApiRoute: "/api/pilot-workspaces/{workspaceSlug}/trust-safety-incidents/{incidentId}",
    tenantIncidentReviewPacketApiRoute:
      "/api/pilot-workspaces/{workspaceSlug}/trust-safety-incidents/{incidentId}/review-packet",
    boundary: trustSafetyOperationsBoundary,
    tenantIncidentBoundary: tenantTrustSafetyIncidentBoundary,
    operatingPosture:
      "24/7 trust, safety, monitoring, auditing, fixing, improving, and escalation model is defined. Production managed monitoring still requires approved staffing, on-call, SOC/MDR, and customer-specific runbooks before being claimed as live coverage.",
    durableTenantStorage:
      "Tenant-scoped TrustOps incident storage is implemented as a private-schema Supabase migration with guarded RPCs, AAL2 mutation gates, append-only event trails, legal-hold fields, notification decisions, and audited review-packet downloads.",
    agents: trustSafetyAgents,
    controls: trustSafetyControls,
    channels: trustSafetyChannels,
    targetAudienceSignals: targetAudienceTrustOpsSignals,
    continuousImprovementLoops,
    incidentSlas: trustSafetyIncidentSlas,
    incidents: trustSafetyIncidents,
    resolvedLimitations: resolvedTrustSafetyLimitations,
    remainingLimitations: remainingTrustSafetyLimitations,
    agentCount: trustSafetyAgents.length,
    controlCount: trustSafetyControls.length,
    channelCount: trustSafetyChannels.length,
    targetAudienceCount: targetAudienceTrustOpsSignals.length,
    loopStageCount: continuousImprovementLoops.length,
    incidentCount: trustSafetyIncidents.length,
    openIncidentCount,
    containedIncidentCount,
    legalHoldWatchCount,
    highIncidentCount: countIncidentsBySeverity("high"),
    criticalIncidentCount: countIncidentsBySeverity("critical"),
    remediatingIncidentCount: countIncidentsByStatus("remediating"),
    productionGatedIncidentCount: countIncidentsByStatus("production-gated"),
    activeControls,
    watchRequired,
    productionGated,
    durableTrustOpsControls: summarizeDurableTrustSafetyIncidents([], []).boundaryControls,
    sourceUrls: [
      "https://www.copyright.gov/registration/",
      "https://www.uspto.gov/trademarks/basics",
      "https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance",
      "https://www.hhs.gov/hipaa/for-professionals/security/index.html",
      "https://www.nist.gov/itl/ai-risk-management-framework"
    ],
    nextBuildStep:
      "Apply and verify the tenant TrustOps Supabase migration in production, then add an authenticated workspace UI panel for incident creation, update, legal-hold review, notification decision, and packet download.",
    updated: "2026-06-16"
  };
}

export function buildTrustSafetyIncidentReport(incident: TrustSafetyIncident, generatedAt = new Date().toISOString()) {
  const sla = trustSafetyIncidentSlas.find((entry) => entry.severity === incident.severity);

  return [
    "# SCRIMED Trust Safety Incident Report",
    "",
    `Incident ID: ${incident.id}`,
    `Title: ${incident.title}`,
    `Generated: ${generatedAt}`,
    `Severity: ${incident.severity}`,
    `Status: ${incident.status}`,
    `Owner: ${incident.owner}`,
    `Accountable agent: ${incident.accountableAgent}`,
    `Source channel: ${incident.sourceChannel}`,
    `Created: ${incident.createdAt}`,
    `Updated: ${incident.updatedAt}`,
    `Legal-hold status: ${incident.legalHoldStatus}`,
    "",
    "## Boundary",
    trustSafetyOperationsBoundary,
    "",
    "## Trigger Signal",
    cleanReportText(incident.triggerSignal),
    "",
    "## Affected Surface",
    ...incident.affectedSurface.map((surface) => `- ${cleanReportText(surface)}`),
    "",
    "## Buyer And Company Impact",
    cleanReportText(incident.buyerImpact),
    "",
    "## Containment",
    cleanReportText(incident.containmentAction),
    "",
    "## Remediation Plan",
    cleanReportText(incident.remediationPlan),
    "",
    "## Evidence Routes",
    ...incident.evidenceRoutes.map((route) => `- ${route}`),
    "",
    "## Audit Events",
    ...incident.auditEvents.map((event) => `- ${event}`),
    "",
    "## Improvement Actions",
    ...incident.improvementActions.map((action) => `- ${cleanReportText(action)}`),
    "",
    "## Severity SLA",
    sla
      ? [
          `- Response target: ${sla.responseTarget}`,
          `- Containment target: ${sla.containmentTarget}`,
          `- Executive escalation: ${sla.executiveEscalation}`,
          `- Required reviewers: ${sla.requiredReviewers.join(", ")}`
        ].join("\n")
      : "- No SLA found.",
    "",
    "## Production Boundary",
    cleanReportText(incident.productionBoundary),
    "",
    "## Remaining Limitations",
    ...remainingTrustSafetyLimitations.map((limitation) => `- ${limitation}`)
  ].join("\n");
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
    "## Tenant Durable TrustOps",
    summary.durableTenantStorage,
    `Dashboard API: ${summary.tenantIncidentDashboardApiRoute}`,
    `Mutation API: ${summary.tenantIncidentMutationApiRoute}`,
    `Review packet API: ${summary.tenantIncidentReviewPacketApiRoute}`,
    `Boundary: ${summary.tenantIncidentBoundary}`,
    "",
    "## Target Audience Fit",
    ...summary.targetAudienceSignals.map((signal) => `- ${signal.audience}: ${signal.appeal}`),
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
    "## Incident Queue",
    `Incidents: ${summary.incidentCount}`,
    `Open incidents: ${summary.openIncidentCount}`,
    `Contained or monitoring: ${summary.containedIncidentCount}`,
    `Legal-hold watch: ${summary.legalHoldWatchCount}`,
    ...summary.incidents.map(
      (incident) =>
        `- ${incident.id} (${incident.severity}/${incident.status}): ${incident.title} Owner: ${incident.owner}. Report: ${incident.reportRoute}`
    ),
    "",
    "## Resolved Limitations",
    ...summary.resolvedLimitations.map(
      (item) => `- ${item.limitation} Resolution: ${item.resolution}`
    ),
    "",
    "## Remaining Limitations",
    ...summary.remainingLimitations.map((limitation) => `- ${limitation}`),
    "",
    "## Next Build Step",
    summary.nextBuildStep
  ].join("\n");
}

export function buildTenantTrustSafetyIncidentReviewPacket({
  workspace,
  incident,
  events,
  auditEventId,
  generatedAt,
  actorUserId,
  appBaseUrl
}: TenantTrustSafetyIncidentPacketInput) {
  const eventTimeline = events
    .filter((event) => event.incidentId === incident.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return [
    "# SCRIMED Tenant TrustOps Incident Review Packet",
    "",
    `Generated: ${generatedAt}`,
    `Workspace: ${workspace.name} (${workspace.slug})`,
    `Tenant: ${workspace.tenantName}`,
    `Incident ID: ${incident.id}`,
    `Incident key: ${incident.incidentKey}`,
    `Audit event ID: ${auditEventId}`,
    `Actor user ID: ${actorUserId}`,
    "",
    "## Boundary",
    tenantTrustSafetyIncidentBoundary,
    "",
    "## Incident Summary",
    `Title: ${incident.title}`,
    `Severity: ${incident.severity}`,
    `Status: ${incident.status}`,
    `Owner: ${incident.owner}`,
    `Accountable agent: ${incident.accountableAgent}`,
    `Source channel: ${incident.sourceChannel}`,
    `Legal-hold status: ${incident.legalHoldStatus}`,
    `Notification decision: ${incident.notificationDecision}`,
    `Post-incident review: ${incident.postIncidentReviewStatus}`,
    `Created: ${incident.createdAt}`,
    `Updated: ${incident.updatedAt}`,
    `Closed: ${incident.closedAt ?? "not closed"}`,
    "",
    "## Buyer Impact",
    cleanReportText(incident.buyerImpact),
    "",
    "## Trigger Signal",
    cleanReportText(incident.triggerSignal),
    "",
    "## Affected Surface",
    ...incident.affectedSurface.map((surface) => `- ${cleanReportText(surface)}`),
    "",
    "## Containment And Remediation",
    `Containment: ${cleanReportText(incident.containmentAction)}`,
    `Remediation: ${cleanReportText(incident.remediationPlan)}`,
    "",
    "## Legal Hold And Notification",
    `Retention until: ${incident.retentionUntil ?? "not set"}`,
    `Legal hold until: ${incident.legalHoldUntil ?? "not set or indefinite"}`,
    `Notification reason: ${incident.notificationReason || "not recorded"}`,
    "",
    "## Event Timeline",
    ...(eventTimeline.length > 0
      ? eventTimeline.map(
          (event) =>
            `- ${event.createdAt}: ${event.eventType} by ${event.actorUserId}; status ${event.priorStatus ?? "none"} -> ${event.nextStatus}; legal hold ${event.priorLegalHoldStatus ?? "none"} -> ${event.nextLegalHoldStatus}; notification ${event.priorNotificationDecision ?? "none"} -> ${event.nextNotificationDecision}; ${cleanReportText(event.eventSummary)}`
        )
      : ["- No incident events were visible through the tenant-scoped dashboard."]),
    "",
    "## Durable Controls",
    ...summarizeDurableTrustSafetyIncidents([incident], eventTimeline).boundaryControls.map(
      (control) => `- ${control}`
    ),
    "",
    "## Workspace Boundary",
    cleanReportText(workspace.boundary),
    "",
    "## Evidence Routes",
    `- ${appBaseUrl}/trust-safety-operations`,
    `- ${appBaseUrl}/trust-center`,
    `- ${appBaseUrl}/audit`,
    `- ${appBaseUrl}/observability`,
    "",
    "## Remaining Limitations",
    ...remainingTrustSafetyLimitations.map((limitation) => `- ${limitation}`)
  ].join("\n");
}
