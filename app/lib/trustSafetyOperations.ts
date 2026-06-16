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
    limitation: "Attribution analytics packet release used a generic CRM export audit event.",
    resolution:
      "Added a dedicated attribution analytics packet event path with compatibility fallback until the Supabase migration is confirmed in production."
  }
];

export const remainingTrustSafetyLimitations = [
  "Production managed 24/7 coverage still requires staffed on-call/SOC/MDR coverage, contracts, tabletop exercises, customer-specific runbooks, and external security review.",
  "Trust-ops incidents are inspectable product-control records today; regulated production incidents require customer-approved durable storage, legal hold, breach analysis, notification decisions, and forensic process.",
  "Clinical, legal, privacy, security, copyright, trademark, reimbursement, and advertising determinations still require qualified human reviewers."
];

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
    boundary: trustSafetyOperationsBoundary,
    operatingPosture:
      "24/7 trust, safety, monitoring, auditing, fixing, improving, and escalation model is defined. Production managed monitoring still requires approved staffing, on-call, SOC/MDR, and customer-specific runbooks before being claimed as live coverage.",
    agents: trustSafetyAgents,
    controls: trustSafetyControls,
    channels: trustSafetyChannels,
    continuousImprovementLoops,
    incidentSlas: trustSafetyIncidentSlas,
    incidents: trustSafetyIncidents,
    resolvedLimitations: resolvedTrustSafetyLimitations,
    remainingLimitations: remainingTrustSafetyLimitations,
    agentCount: trustSafetyAgents.length,
    controlCount: trustSafetyControls.length,
    channelCount: trustSafetyChannels.length,
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
    sourceUrls: [
      "https://www.copyright.gov/registration/",
      "https://www.uspto.gov/trademarks/basics",
      "https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance",
      "https://www.hhs.gov/hipaa/for-professionals/security/index.html",
      "https://www.nist.gov/itl/ai-risk-management-framework"
    ],
    nextBuildStep:
      "Promote trust-ops incidents from deterministic product-control records into tenant-scoped durable storage with authenticated mutation, legal-hold workflow, notification decisions, and post-incident review packets.",
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
