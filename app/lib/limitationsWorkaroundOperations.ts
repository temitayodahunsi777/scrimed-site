export type LimitationsWorkaroundState =
  | "resolved-with-control"
  | "workaround-active"
  | "human-review-required"
  | "external-review-required"
  | "blocked-until-approved";

export type LimitationsWorkaroundSeverity = "critical" | "high" | "medium" | "watch";

export type LimitationsWorkaroundCategory =
  | "clinical-phi-data"
  | "ehr-interoperability"
  | "api-sla-scale"
  | "ai-agent-autonomy"
  | "security-certification"
  | "global-legal-privacy"
  | "finance-revenue-contracts"
  | "onboarding-communications"
  | "release-proof"
  | "accessibility-ui"
  | "innovation-research";

export type LimitationsWorkaroundTrack = {
  slug: string;
  title: string;
  category: LimitationsWorkaroundCategory;
  severity: LimitationsWorkaroundSeverity;
  state: LimitationsWorkaroundState;
  limitation: string;
  riskIfIgnored: string;
  safeWorkaround: string;
  operatingControl: string;
  fallbackPath: string;
  owner: string;
  proofRoutes: string[];
  escalationTrigger: string;
  graduationGate: string;
  blockedClaims: string[];
  cadence: string;
};

export type LimitationsWorkaroundPacket = {
  slug: string;
  name: string;
  usedWhen: string;
  safeInputs: string[];
  output: string;
  owner: string;
  proofRoutes: string[];
  expiryRule: string;
  hardStops: string[];
};

export type LimitationsWorkaroundCadence = {
  cadence: string;
  owner: string;
  reviewedSignals: string[];
  decisionOutput: string;
  hardStops: string[];
};

export type LimitationsWorkaroundMetric = {
  metric: string;
  currentSignal: string;
  targetSignal: string;
  evidenceRoute: string;
  boundary: string;
};

export type LimitationsBuyerConfidenceSignal = {
  buyerConcern: string;
  trustMessage: string;
  commercialValue: string;
  proofRoute: string;
};

export type LimitationsBoundaryEscalation = {
  slug: string;
  requestPattern: string;
  severity: LimitationsWorkaroundSeverity;
  immediateDecision: string;
  safeResponse: string;
  requiredOwner: string;
  escalationPath: string[];
  proofRoutes: string[];
  decisionSla: string;
  hardStops: string[];
  graduationEvidence: string[];
};

export type LimitationsBoundaryWorkaroundPlaybookStatus =
  | "safe-workaround-ready"
  | "human-review-required"
  | "external-approval-required"
  | "blocked-until-evidence";

export type LimitationsBoundaryWorkaroundPlaybookItem = {
  slug: string;
  boundary: string;
  status: LimitationsBoundaryWorkaroundPlaybookStatus;
  triggerSignals: string[];
  immediateDecision: string;
  safeAlternative: string;
  mappedPacket: string;
  requiredApprovals: string[];
  proofRoutes: string[];
  validationCommand: string;
  failClosedExpectation: string;
  graduationEvidence: string[];
  residualRisk: string;
  hardStops: string[];
  owner: string;
};

export type LimitationsBoundaryPreflightDecision =
  | "safe-workaround-only"
  | "human-review-required"
  | "external-approval-required"
  | "block-fail-closed";

export type LimitationsBoundaryPreflightRequest = {
  requestId: string;
  requestedAction: string;
  requestedSignals: string[];
  requestedDataClasses: string[];
  requestedOutcome: string;
  containsPhi: boolean;
  requestsProtectedAction: boolean;
  customerApprovalEvidencePresent: boolean;
  humanApprovalEvidencePresent: boolean;
};

export type LimitationsBoundaryPreflightEvaluation = {
  requestId: string;
  decision: LimitationsBoundaryPreflightDecision;
  matchedPlaybookSlugs: string[];
  matchedBoundaries: string[];
  mappedPackets: string[];
  immediateDecision: string;
  safeAlternative: string;
  requiredApprovals: string[];
  proofRoutes: string[];
  validationCommands: string[];
  hardStops: string[];
  failClosedExpectation: string;
  residualRisk: string;
  noGoBoundaryPreserved: true;
  externalExecutionAllowed: false;
  phiProcessingAllowed: false;
  autonomousActionAllowed: false;
  auditHash: string;
};

export type LimitationsResolutionWorkOrderStatus =
  | "resolved-by-workaround"
  | "active-workaround"
  | "blocked-external-dependency"
  | "requires-human-operator";

export type LimitationsResolutionWorkOrder = {
  slug: string;
  knownLimit: string;
  status: LimitationsResolutionWorkOrderStatus;
  severity: LimitationsWorkaroundSeverity;
  currentImpact: string;
  immediateWorkaround: string;
  durableResolution: string;
  owner: string;
  nextProofCommand: string;
  proofRoutes: string[];
  failClosedCheck: string;
  graduationGate: string;
  hardStops: string[];
};

export type LimitationsWorkaroundExecutionLedgerState =
  | "proof-retained-no-secret"
  | "control-active"
  | "operator-required"
  | "external-dependency-open";

export type LimitationsWorkaroundExecutionLedgerEntry = {
  slug: string;
  title: string;
  state: LimitationsWorkaroundExecutionLedgerState;
  resolvedBoundary: string;
  operationalUpgrade: string;
  evidenceRetained: string;
  verificationCommand: string;
  rollbackOrFallback: string;
  residualBoundary: string;
  nextControl: string;
  owner: string;
  proofRoutes: string[];
  hardStops: string[];
};

export const limitationsWorkaroundRoute = "/limitations-workarounds";
export const limitationsWorkaroundApiRoute = "/api/limitations-workarounds";
export const limitationsWorkaroundBriefRoute = "/api/limitations-workarounds/brief";
export const limitationsWorkaroundStatus = "limitations-workaround-control-plane-active";
export const limitationsWorkaroundBriefStatus =
  "limitations-workaround-brief-ready-no-authority-claim";
export const limitationsWorkaroundUpdatedAt = "2026-06-29";

export const limitationsWorkaroundBoundary =
  "SCRIMED Limitations and Workaround Operations turns hard boundaries, defects, bottlenecks, unresolved approvals, and unsupported claims into safe operating alternatives with owners, proof routes, escalation triggers, expiration rules, and graduation gates. It is a workaround and containment layer only. It does not authorize PHI processing, live clinical care, patient matching, EHR writeback, payer submission, production connectors, public API SLAs, contractual uptime, managed service coverage, autonomous remediation, live autonomous AI, production model routing, legal advice, accounting advice, tax advice, audited financial reporting, securities material, revenue guarantees, profit-margin guarantees, security certification, accessibility certification, regulatory approval, public quantum capability claims, or buyer release authority.";

export const limitationsWorkaroundBlockedClaims = [
  "PHI processing authorized",
  "live clinical care authorized",
  "patient matching approved",
  "EHR writeback approved",
  "payer submission approved",
  "production connector approved",
  "public API SLA approved",
  "contractual uptime guaranteed",
  "managed service coverage active",
  "autonomous remediation approved",
  "live autonomous AI approved",
  "production model routing approved",
  "legal advice provided",
  "accounting advice provided",
  "tax advice provided",
  "audited financial reporting completed",
  "securities offering material approved",
  "revenue guaranteed",
  "profit margin guaranteed",
  "security certified",
  "accessibility certified",
  "regulatory approval granted",
  "public quantum capability available",
  "buyer release approved"
];

export const limitationsWorkaroundTracks: LimitationsWorkaroundTrack[] = [
  {
    slug: "phi-live-data-boundary",
    title: "PHI and live patient-data boundary",
    category: "clinical-phi-data",
    severity: "critical",
    state: "blocked-until-approved",
    limitation:
      "Current public and synthetic workflows cannot ingest PHI, patient identifiers, payer member data, live charts, production credentials, or source medical records.",
    riskIfIgnored:
      "A buyer demo or pilot could accidentally become regulated production data processing before privacy, security, BAA/DPA, customer environment, and clinical governance approvals exist.",
    safeWorkaround:
      "Use synthetic fixtures, metadata-only references, external evidence-room pointers, no-PHI excerpts, and Health Records Safety Exchange source mapping.",
    operatingControl:
      "No-PHI intake lint, route headers, source-class labels, blocked-input copy, and protected AAL2 evidence references.",
    fallbackPath:
      "If a buyer needs live records, convert the ask into a customer-hosted sandbox scoping packet and hold execution until approved authority exists.",
    owner: "Privacy, security, clinical governance, customer authority owner, and TrustOS",
    proofRoutes: ["/health-records", "/clinical-authority-readiness", "/boundary-resolution"],
    escalationTrigger: "Any PHI, identifier, live chart, production credential, patient matching, or data-residency request appears.",
    graduationGate:
      "Executed customer authority, BAA/DPA when required, security review, clinical governance approval, connector approval, monitoring, rollback, and retained evidence.",
    blockedClaims: [
      "PHI processing authorized",
      "live patient data connected",
      "patient matching approved"
    ],
    cadence: "Immediate block plus daily review until safely re-scoped."
  },
  {
    slug: "clinical-care-authority-boundary",
    title: "Live clinical care and CDS authority",
    category: "clinical-phi-data",
    severity: "critical",
    state: "external-review-required",
    limitation:
      "SCRIMED can prepare workflow intelligence, draft-only outputs, and governance evidence, but cannot diagnose, treat, route patients, sign notes, or provide live clinical decision support.",
    riskIfIgnored:
      "Operational language could be interpreted as clinical authority, medical advice, or production CDS/SaMD readiness before qualified review.",
    safeWorkaround:
      "Frame outputs as synthetic workflow planning, review queues, draft-only documentation, and clinical-governance preparation with explicit human review.",
    operatingControl:
      "Clinical Authority Readiness, Clinical Care Activation gates, Claim Guard, and no-live-care headers.",
    fallbackPath:
      "Route clinical intent, care pathway, diagnosis, treatment, triage, or clinician signature requests to clinical governance before any external claim expands.",
    owner: "Clinical governance, qualified clinicians, legal, privacy, and release stewardship",
    proofRoutes: ["/clinical-authority-readiness", "/clinical-care-activation", "/qa-claim-guard"],
    escalationTrigger: "A claim implies diagnosis, treatment, live triage, autonomous care coordination, or production CDS.",
    graduationGate:
      "Clinical governance approval, regulatory classification, customer scope, clinician workflow controls, monitoring, override, and rollback evidence.",
    blockedClaims: [
      "live clinical care authorized",
      "clinical decision support cleared",
      "autonomous diagnosis or treatment permitted"
    ],
    cadence: "Daily claim scan and immediate qualified-review escalation."
  },
  {
    slug: "ehr-writeback-connector-boundary",
    title: "Production EHR connector and writeback boundary",
    category: "ehr-interoperability",
    severity: "critical",
    state: "blocked-until-approved",
    limitation:
      "FHIR, SMART, HL7, DICOM, X12, terminology, and connector planning are synthetic; production connectors, writeback, payer submission, and patient matching remain blocked.",
    riskIfIgnored:
      "Integration demos can turn into unsafe production connector promises, mutation claims, or payer-submission commitments.",
    safeWorkaround:
      "Use fixture validation, synthetic conformance kits, connector contract review, external artifact references, and no-mutation evidence.",
    operatingControl:
      "Interoperability standards map, Health Records Safety Exchange, connector blocked-claim list, and synthetic extraction evaluator.",
    fallbackPath:
      "Convert live integration asks into a standards mapping, sandbox preflight, and customer authority checklist.",
    owner: "Interoperability, platform engineering, privacy, security, clinical governance, and customer integration owner",
    proofRoutes: ["/interoperability", "/health-records", "/integrations/fixture-validation"],
    escalationTrigger: "Production endpoint, credential, writeback, payer submission, patient match, or live HIE/EHR request appears.",
    graduationGate:
      "Customer sandbox, security review, connector contract, data boundary approval, mutation policy, audit, monitoring, and rollback evidence.",
    blockedClaims: [
      "production connector approved",
      "EHR writeback approved",
      "payer submission approved"
    ],
    cadence: "Weekly connector-readiness review plus immediate block on live endpoint requests."
  },
  {
    slug: "public-api-sla-boundary",
    title: "Public API, SLA, and unlimited-scale boundary",
    category: "api-sla-scale",
    severity: "high",
    state: "human-review-required",
    limitation:
      "Route handlers, summaries, and briefs are inspectable contract-readiness surfaces, not public API marketplace launch, contractual SLA, unlimited rate limit, or uptime guarantee.",
    riskIfIgnored:
      "Enterprise diligence could mistake technical maturity for contractual support, public availability, unlimited usage, or managed-service coverage.",
    safeWorkaround:
      "Use route summaries, boundary headers, version posture, draft quotas, rate-limit classes, support assumptions, and no-SLA language.",
    operatingControl:
      "Platform Power API contract register, Enterprise Scalability SLO readiness, Service Reliability fault classes, and Navigation Audit route counts.",
    fallbackPath:
      "If a buyer needs API terms, route to contract review with route class, quota, auth posture, monitoring, incident, support tier, and price floor.",
    owner: "Platform engineering, legal ops, service reliability, customer operations, and finance",
    proofRoutes: ["/platform-power", "/enterprise-scalability", "/service-reliability"],
    escalationTrigger: "Public API, unlimited usage, uptime, SLA, support, or managed-service language appears.",
    graduationGate:
      "Contract terms, staffing model, support tier, incident response, monitoring, rate limits, price model, and executive approval.",
    blockedClaims: [
      "public API SLA approved",
      "unlimited API scale approved",
      "contractual uptime guaranteed"
    ],
    cadence: "Daily API contract review and weekly scale council."
  },
  {
    slug: "ai-agent-autonomy-boundary",
    title: "Live AI, production model-routing, and agent autonomy boundary",
    category: "ai-agent-autonomy",
    severity: "critical",
    state: "external-review-required",
    limitation:
      "Agents may plan, route, inspect, recommend, and produce synthetic evidence, but they cannot execute protected clinical, legal, financial, customer, or production actions autonomously.",
    riskIfIgnored:
      "Agent language can imply production model approval, autonomous remediation, clinical action, legal advice, or financial decision authority.",
    safeWorkaround:
      "Use model-route registers, allowed/blocked data classes, eval packs, red-team loops, human approval triggers, and protected AAL2 operator lanes.",
    operatingControl:
      "AgentOS, TrustOS, Platform Power, QA Claim Guard, Runtime Safety, and Continuous Review loops.",
    fallbackPath:
      "When a tool action is requested, switch to recommendation mode and require named human approval before protected execution.",
    owner: "AI platform, AgentOS, TrustOS, QA, security, finance, and clinical governance",
    proofRoutes: ["/agents", "/trust-os", "/platform-power", "/continuous-review-audit"],
    escalationTrigger: "The system is asked to act without approval, route PHI to a model, self-remediate production, or make clinical/legal/financial decisions.",
    graduationGate:
      "Approved provider, model route, data policy, eval pass criteria, monitoring, tool schema, approval UI, rollback, audit persistence, and customer authority.",
    blockedClaims: [
      "live autonomous AI approved",
      "production model routing approved",
      "agent actions fully autonomous"
    ],
    cadence: "Daily AI safety/eval queue plus immediate human escalation for protected actions."
  },
  {
    slug: "security-certification-boundary",
    title: "Security, privacy, SOC 2, HITRUST, and certification boundary",
    category: "security-certification",
    severity: "high",
    state: "external-review-required",
    limitation:
      "SCRIMED can organize readiness evidence, controls, and protected review paths, but cannot claim SOC 2, HITRUST, ISO, HIPAA certification, penetration-test completion, or security approval without qualified evidence.",
    riskIfIgnored:
      "Procurement packets could overstate security posture, compliance status, or customer-specific readiness.",
    safeWorkaround:
      "Use Trust Center, Provider Security Reviews, Procurement Evidence Registry, Global Certification Readiness, and no-sensitive-artifact references.",
    operatingControl:
      "Evidence-room metadata, owner matrix, certification tracks, blocked claims, renewal queue, and protected access logs.",
    fallbackPath:
      "Respond with readiness status, evidence-request owner, due date, and external-review gate instead of certification language.",
    owner: "Security, privacy, legal, trust operations, customer authority owner, and qualified external reviewers",
    proofRoutes: ["/trust-center", "/global-certification-readiness", "/pilot-workspace/access"],
    escalationTrigger: "A buyer asks for SOC 2, HITRUST, ISO, HIPAA certification, pentest, BAA/DPA, vendor-risk approval, or security signoff.",
    graduationGate:
      "Qualified assessment, remediation evidence, approved artifact reference, customer-specific acceptance, and release authority.",
    blockedClaims: [
      "security certified",
      "SOC 2 certified",
      "HITRUST certified"
    ],
    cadence: "Weekly evidence-room review and immediate escalation on procurement claims."
  },
  {
    slug: "global-legal-privacy-boundary",
    title: "Global legal, privacy, AI Act, GDPR, NHS, MHRA, and regional boundary",
    category: "global-legal-privacy",
    severity: "high",
    state: "external-review-required",
    limitation:
      "Global expansion readiness can map evidence needs and regional packs, but cannot claim local legal approval, procurement approval, data-residency approval, EU AI Act conformity, GDPR compliance approval, NHS DTAC approval, MHRA approval, or government endorsement.",
    riskIfIgnored:
      "Public-sector and global buyer conversations can become unsupported country-launch or conformity claims.",
    safeWorkaround:
      "Use regional buyer packs, deployment profiles, official-source evidence implications, partner authority registers, and qualified regional counsel review.",
    operatingControl:
      "Global Certification Readiness, Global Reach, Deployment Profiles, Claim Guard, and Boundary Resolution.",
    fallbackPath:
      "Frame global work as no-PHI discovery and localization planning until regional authority exists.",
    owner: "Regional counsel, privacy, security, clinical governance, global partnerships, and customer procurement owner",
    proofRoutes: ["/global-certification-readiness", "/global-reach", "/deployment-profiles"],
    escalationTrigger: "A claim names country launch, public-sector approval, local hosting approval, GDPR/EU AI Act conformity, NHS/MHRA/Australia approval, or government endorsement.",
    graduationGate:
      "Qualified regional legal/privacy/security review, hosting decision, procurement authority, partner approval, and retained release evidence.",
    blockedClaims: [
      "EU AI Act conformant",
      "GDPR approved",
      "government endorsed"
    ],
    cadence: "Weekly global pack review and regional-counsel escalation before external use."
  },
  {
    slug: "legal-finance-revenue-boundary",
    title: "Legal, finance, accounting, tax, revenue, and profit boundary",
    category: "finance-revenue-contracts",
    severity: "high",
    state: "external-review-required",
    limitation:
      "Enterprise Business Ops can prepare deal desk, pricing, margin, billing, and review packets, but cannot provide legal/accounting/tax advice, audited financial reporting, contract approval, securities material, revenue guarantees, ROI guarantees, or profit-margin guarantees.",
    riskIfIgnored:
      "Sales, board, investor, and buyer materials could become unsupported professional advice, financial reporting, securities material, or commercial promises.",
    safeWorkaround:
      "Use fixed-scope offers, price floors, buyer-approved measurement plans, counsel review slots, finance/accounting/tax triage, and qualified release authority.",
    operatingControl:
      "Enterprise Business Ops, Growth Engine, Capital Vitality, Public Market Readiness, Deal Room, and Claim Guard.",
    fallbackPath:
      "Route exceptions to qualified counsel, finance, accounting, tax, and executive approval before proposal release.",
    owner: "Founder, deal desk, legal, finance, accounting, tax, revenue operations, and qualified reviewers",
    proofRoutes: ["/enterprise-business-ops", "/growth-engine", "/capital-vitality", "/public-market-readiness"],
    escalationTrigger: "A proposal includes contract approval, non-standard terms, revenue impact, ROI, reimbursement, valuation, fundraising, tax, accounting, or legal conclusions.",
    graduationGate:
      "Qualified review, signed approval, buyer baseline, measurement plan, billing setup, payment terms, and retained release authority.",
    blockedClaims: [
      "legal advice provided",
      "revenue guaranteed",
      "profit margin guaranteed"
    ],
    cadence: "Per-deal desk review plus weekly margin and contract-risk council."
  },
  {
    slug: "autonomous-communications-boundary",
    title: "Email, calendar, demo, meeting, and buyer communication boundary",
    category: "onboarding-communications",
    severity: "medium",
    state: "human-review-required",
    limitation:
      "SCRIMED can prepare email-ready copy, calendar-ready agendas, demo scripts, meeting notes, and follow-up packets, but cannot autonomously send emails, create calendar invites, approve procurement, or commit scope.",
    riskIfIgnored:
      "A draft could become an unauthorized buyer commitment, meeting invite, sales promise, procurement statement, or customer-specific claim.",
    safeWorkaround:
      "Use human-reviewed templates, meeting packets, owner handoffs, no-PHI notes, and explicit send/invite approval fields.",
    operatingControl:
      "Client Onboarding and Communications stages, handoffs, templates, calendar packets, and blocked-content list.",
    fallbackPath:
      "Hold the communication in draft state and require sender, recipient, scope, data boundary, and approval evidence before use.",
    owner: "Revenue operations, sales engineering, customer operations, legal ops, finance, and product owner",
    proofRoutes: ["/client-onboarding", "/offerings", "/pilot-deal-room"],
    escalationTrigger: "The communication contains PHI, security claims, contract language, pricing exceptions, procurement claims, or clinical promises.",
    graduationGate:
      "Human approval of exact content, recipients, timing, scope, no-PHI boundary, pricing, and follow-up owner.",
    blockedClaims: [
      "email sent autonomously",
      "calendar invite created autonomously",
      "buyer commitment approved"
    ],
    cadence: "Per-message human review and daily onboarding handoff review."
  },
  {
    slug: "release-proof-boundary",
    title: "Protected QA, buyer proof, and release authority boundary",
    category: "release-proof",
    severity: "high",
    state: "human-review-required",
    limitation:
      "Public smoke can prove route availability and fail-closed protected behavior, but cannot prove protected happy-path execution, buyer-specific release, authenticated QA completion, or customer evidence-room distribution.",
    riskIfIgnored:
      "Public checks could be mistaken for retained protected evidence, customer permission, or release authority.",
    safeWorkaround:
      "Use AAL2 protected workspaces, no-secret operator packets, QA Completion Bridge, Activation Seal, Proof Promotion, Buyer Proof Release, and release-control runbooks.",
    operatingControl:
      "Release Continuity, QA Launch Kit, Manual QA Execution Console, Buyer Release Control Runbook, protected evidence packets, and no-token policy.",
    fallbackPath:
      "When protected proof is requested, run the approved human AAL2 flow and retain only no-secret packet hashes and metadata.",
    owner: "Release engineering, TrustOS, tenant governance, approved operator, and buyer diligence",
    proofRoutes: ["/release-continuity", "/qa-manual-execution-console", "/buyer-release-control-run", "/pilot-workspace/access"],
    escalationTrigger: "A claim references retained protected proof, customer release, authenticated QA, token handling, evidence-room access, or buyer distribution.",
    graduationGate:
      "Fresh human AAL2 run, no-secret packet, reviewer signoff, release decision, lockbox, recipient authority, access-log reconciliation, and claim guard approval.",
    blockedClaims: [
      "protected happy path completed without AAL2",
      "buyer release approved",
      "bearer token retained as evidence"
    ],
    cadence: "Release preflight and protected proof review before buyer-specific use."
  },
  {
    slug: "ui-accessibility-boundary",
    title: "UI quality, accessibility, and seamless navigation boundary",
    category: "accessibility-ui",
    severity: "medium",
    state: "workaround-active",
    limitation:
      "Navigation can be improved continuously, but current UI polish, responsive behavior, keyboard path, contrast, and accessibility posture are not formal WCAG, VPAT, Section 508, or external UX certification.",
    riskIfIgnored:
      "Enterprise demos could overstate accessibility certification or leave high-value workflows hard to find.",
    safeWorkaround:
      "Use site navigation, role journeys, Navigation Audit, Product Console, Hub cards, smoke-covered routes, and manual UI review before demos.",
    operatingControl:
      "SiteNavigation, Navigation Audit inventory, Product Console proof stack, Platform Power UI role journey control, and smoke checks.",
    fallbackPath:
      "If users cannot find a workflow, add it to primary navigation, role journeys, limitation controls, hub views, product actions, and smoke coverage.",
    owner: "Frontend, Product Console, QA, accessibility reviewer, customer operations, and sales engineering",
    proofRoutes: ["/navigation", "/product", "/hub", "/platform-power"],
    escalationTrigger: "A buyer-critical route is hidden, text overlaps, mobile route is unusable, keyboard path is unclear, or accessibility certification is implied.",
    graduationGate:
      "Manual responsive review, keyboard path review, contrast review, copy fit, accessibility remediation evidence, and qualified external review if claims expand.",
    blockedClaims: [
      "accessibility certified",
      "WCAG conformance approved",
      "VPAT completed"
    ],
    cadence: "Daily navigation scan and pre-demo UI review."
  },
  {
    slug: "innovation-quantum-boundary",
    title: "Internal innovation, quantum, and future infrastructure boundary",
    category: "innovation-research",
    severity: "watch",
    state: "blocked-until-approved",
    limitation:
      "Internal research may investigate quantum, advanced model routing, privacy-preserving computation, and future infrastructure, but public product claims remain blocked.",
    riskIfIgnored:
      "Future-looking research language could become unsupported buyer, investor, clinical, security, or public-market claims.",
    safeWorkaround:
      "Keep research assigned to the internal research team with private hypotheses, no-public-claim labels, source logs, review owners, and claim-guard blocks.",
    operatingControl:
      "Continuous Review and Innovation control plane, internal research assignments, Claim Guard, Boundary Resolution, and no-public-quantum authority headers.",
    fallbackPath:
      "Translate future research into internal backlog items and remove public wording until validated evidence and qualified review exist.",
    owner: "Internal Research Team, TrustOS, AI platform, security, legal, finance, and founder",
    proofRoutes: ["/continuous-review-audit", "/qa-claim-guard", "/boundary-resolution"],
    escalationTrigger: "Quantum, model advantage, cryptographic, clinical, security, financial, or infrastructure superiority language appears in external material.",
    graduationGate:
      "Validated technical evidence, risk review, qualified legal/security review, buyer-safe claim language, and approved release decision.",
    blockedClaims: [
      "public quantum capability available",
      "quantum clinical advantage",
      "future infrastructure superiority proven"
    ],
    cadence: "Weekly internal research review and immediate public-claim removal."
  }
];

export const limitationsWorkaroundPackets: LimitationsWorkaroundPacket[] = [
  {
    slug: "synthetic-no-phi-packet",
    name: "Synthetic no-PHI packet",
    usedWhen: "A buyer asks for workflow proof, record extraction, AI output, or demo evidence without approved PHI authority.",
    safeInputs: ["synthetic fixtures", "metadata-only source labels", "de-identified public examples", "no-secret operator notes"],
    output: "Buyer-safe demo or assessment packet with explicit no-PHI and no-live-care boundary.",
    owner: "TrustOS + product owner",
    proofRoutes: ["/health-records", "/pilot-evidence", "/boundary-resolution"],
    expiryRule: "Refresh whenever source class, buyer scope, approval state, or claim language changes.",
    hardStops: ["PHI introduced", "patient identifier introduced", "live chart requested", "source artifact pasted"]
  },
  {
    slug: "external-evidence-reference",
    name: "External evidence reference",
    usedWhen: "The artifact is sensitive, confidential, regulated, buyer-owned, or not safe to store in SCRIMED.",
    safeInputs: ["external system name", "artifact type", "reviewer label", "status", "expiry date"],
    output: "Metadata-only reference that points to the authority source without storing the underlying artifact.",
    owner: "Customer authority owner + trust operations",
    proofRoutes: ["/pilot-workspace/access", "/global-certification-readiness", "/trust-center"],
    expiryRule: "Renew before expiration, owner change, buyer scope change, or regulation/certification scope change.",
    hardStops: ["artifact uploaded", "secret included", "contract pasted", "medical record pasted"]
  },
  {
    slug: "human-reviewed-communication",
    name: "Human-reviewed communication packet",
    usedWhen: "Email, calendar, demo, presentation, pilot workshop, proposal, or follow-up language is needed.",
    safeInputs: ["recipient role", "meeting objective", "no-PHI scope", "offer", "proof route", "required reviewer"],
    output: "Draft-only communication with approval slot, send owner, follow-up owner, and blocked-content checklist.",
    owner: "Revenue operations + sales engineering",
    proofRoutes: ["/client-onboarding", "/offerings", "/enterprise-business-ops"],
    expiryRule: "Re-review after 7 days, pricing change, scope change, reviewer change, or new buyer requirement.",
    hardStops: ["autonomous send requested", "calendar invite creation requested", "contract promise included", "PHI included"]
  },
  {
    slug: "aal2-protected-proof",
    name: "AAL2 protected proof packet",
    usedWhen: "A buyer, operator, or reviewer needs retained protected proof instead of public smoke evidence.",
    safeInputs: ["workspace slug", "operator role", "packet hash", "reviewer label", "no-secret summary"],
    output: "Protected no-secret proof packet with release decision and buyer-safe claim state.",
    owner: "Approved operator + release stewardship",
    proofRoutes: ["/qa-manual-execution-console", "/buyer-release-control-run", "/pilot-workspace/access"],
    expiryRule: "Re-run when deployment, route, workspace, reviewer, claim language, or evidence packet changes.",
    hardStops: ["token retained", "AAL2 bypass attempted", "protected route publicly exposed", "buyer release claimed early"]
  },
  {
    slug: "api-contract-readiness",
    name: "API contract readiness packet",
    usedWhen: "A technical buyer needs API detail before public API SLA, SDK, or production connector approval exists.",
    safeInputs: ["route", "owner", "schema", "version posture", "auth posture", "boundary headers"],
    output: "Draft API contract packet with examples, rate-limit posture, no-SLA language, and blocked claims.",
    owner: "Platform engineering + developer experience",
    proofRoutes: ["/platform-power", "/navigation", "/api/product/console"],
    expiryRule: "Re-review on schema change, auth change, rate-limit change, version change, or buyer-specific scope.",
    hardStops: ["public API SLA implied", "production connector promised", "PHI payload accepted", "unlimited usage promised"]
  },
  {
    slug: "model-route-register",
    name: "Model-route register packet",
    usedWhen: "A feature proposes AI model execution, provider routing, fallback, evals, or agent reasoning.",
    safeInputs: ["provider", "model class", "allowed data", "blocked data", "eval pack", "fallback", "cost owner"],
    output: "Readiness-only model-route record with human approval triggers and no-live-AI boundary.",
    owner: "AI platform + TrustOS + finance",
    proofRoutes: ["/platform-power", "/agents", "/trust-os", "/continuous-review-audit"],
    expiryRule: "Re-review on provider, model, data class, cost threshold, eval failure, or customer scope change.",
    hardStops: ["PHI routed to model", "provider approval missing", "production model approval implied", "clinical validation claimed"]
  },
  {
    slug: "deal-desk-exception",
    name: "Deal desk exception packet",
    usedWhen: "Pricing, scope, payment terms, ROI, reimbursement, legal, tax, accounting, securities, or contract language is non-standard.",
    safeInputs: ["offer", "price floor", "scope", "payment terms", "reviewer role", "approval status"],
    output: "Qualified-review packet with blocked claims, margin notes, counsel/accounting/tax slots, and release gate.",
    owner: "Deal desk + legal + finance",
    proofRoutes: ["/enterprise-business-ops", "/growth-engine", "/capital-vitality"],
    expiryRule: "Re-review on price, scope, buyer, term, reviewer, or claim-language change.",
    hardStops: ["legal advice implied", "revenue guaranteed", "profit guaranteed", "contract approved without reviewer"]
  },
  {
    slug: "global-regional-pack",
    name: "Global regional workaround pack",
    usedWhen: "A region, public-sector buyer, channel partner, or global certification question appears before local authority exists.",
    safeInputs: ["region", "buyer type", "deployment profile", "regional counsel owner", "blocked claims"],
    output: "Localization pack that frames readiness, evidence needs, hosting questions, and retained external gates.",
    owner: "Global partnerships + regional counsel",
    proofRoutes: ["/global-reach", "/global-certification-readiness", "/deployment-profiles"],
    expiryRule: "Re-review on region, regulation, hosting profile, partner, customer segment, or public-sector scope change.",
    hardStops: ["country launch claimed", "government endorsement implied", "data residency approved early", "regional clinical approval claimed"]
  }
];

export const limitationsWorkaroundCadences: LimitationsWorkaroundCadence[] = [
  {
    cadence: "Daily limitation intake and workaround triage",
    owner: "Boundary owner + operational efficiency owner",
    reviewedSignals: ["new blocker", "new defect", "buyer request", "claim drift", "missing owner", "stale route"],
    decisionOutput:
      "Resolve with existing control, assign workaround packet, escalate to qualified review, or block until authority exists.",
    hardStops: ["owner missing", "proof route missing", "PHI introduced", "unsupported claim repeated"]
  },
  {
    cadence: "Daily no-PHI and clinical authority review",
    owner: "TrustOS + privacy + clinical governance",
    reviewedSignals: ["PHI hint", "patient identifier", "clinical advice claim", "record mutation", "care pathway language"],
    decisionOutput:
      "Hold, re-scope to synthetic/no-PHI, or escalate to clinical/privacy/legal owners.",
    hardStops: ["live record requested", "diagnosis implied", "treatment implied", "patient matching requested"]
  },
  {
    cadence: "Daily API, UI, and AI boundary scan",
    owner: "Platform engineering + Product Console + AI platform",
    reviewedSignals: ["new API", "UI navigation gap", "model route", "agent tool request", "eval failure", "cost spike"],
    decisionOutput:
      "Attach contract packet, UI route, model-route record, agent approval trigger, or cost owner.",
    hardStops: ["public API SLA implied", "live AI implied", "agent tool execution without approval", "route orphaned"]
  },
  {
    cadence: "Weekly legal, finance, and deal-risk council",
    owner: "Founder + legal + finance + deal desk",
    reviewedSignals: ["pricing exception", "margin risk", "contract term", "ROI claim", "tax/accounting question", "investor language"],
    decisionOutput:
      "Approve exact reviewed language, request qualified review, revise scope, or block external use.",
    hardStops: ["legal advice implied", "revenue guaranteed", "profit guaranteed", "securities material created"]
  },
  {
    cadence: "Weekly global and certification workaround review",
    owner: "Security + privacy + regional counsel + global partnerships",
    reviewedSignals: ["certification ask", "regional buyer", "public-sector path", "data residency", "hosting profile", "procurement evidence"],
    decisionOutput:
      "Prepare regional pack, reference external artifact, assign reviewer, or hold until external authority exists.",
    hardStops: ["certified claim", "country launch claim", "government endorsement", "data residency approved early"]
  },
  {
    cadence: "Pre-demo seamless-navigation review",
    owner: "Product Console + frontend + sales engineering",
    reviewedSignals: ["buyer-critical route", "primary nav", "role journey", "hub view", "product action", "limitation link"],
    decisionOutput:
      "Promote route into navigation, add product action, add smoke coverage, or hold the demo until the path is discoverable.",
    hardStops: ["route hidden", "text overlap", "mobile route unusable", "accessibility certification implied"]
  }
];

export const limitationsWorkaroundOperatingPath = [
  "Classify every issue, blocker, limitation, or buyer request by category, severity, owner, proof route, and authority boundary.",
  "Prefer a safe workaround packet before inventing a new process: synthetic no-PHI, external evidence reference, human-reviewed communication, AAL2 proof, API contract, model-route register, deal desk, or regional pack.",
  "Escalate immediately when PHI, live care, legal, finance, tax, security certification, regional approval, production connector, public API SLA, live AI, or buyer-release authority is implied.",
  "Attach an expiration rule so workaround packets do not become stale informal permission.",
  "Graduate the workaround only after the required evidence, qualified review, customer authority, release decision, and smoke or protected proof exist.",
  "Promote repeated issues into Navigation Audit, Operational Efficiency, Boundary Resolution, Platform Power, Service Reliability, or public smoke coverage."
];

export const limitationsResolutionWorkOrders: LimitationsResolutionWorkOrder[] = [
  {
    slug: "aal2-durable-store-token-smoke",
    knownLimit:
      "Future AAL2 durable-store happy-path smoke runs still require an authorized tenant-admin, pilot-lead, or reviewer to supply a fresh short-lived AAL2 bearer token.",
    status: "requires-human-operator",
    severity: "high",
    currentImpact:
      "The latest strict canary produced protected record, replay, review, idempotency, and unauthenticated fail-closed proof, but every repeat run must still start from a fresh human AAL2 session.",
    immediateWorkaround:
      "Run npm run smoke:aal2:readiness first, then use the no-secret helper with an explicit token source: npm run smoke:aal2:token -- --clipboard-token --clear-clipboard --write-env-local, or the hidden prompt path when clipboard transfer is blocked.",
    durableResolution:
      "Retain only no-secret smoke status, command names, workspace slug, role class, audit metadata, and packet hashes after a human AAL2 operator runs the strict smoke; never store or paste bearer tokens.",
    owner: "Tenant governance operator + release engineering + TrustOS",
    nextProofCommand: "npm run smoke:aal2:durable-store:strict",
    proofRoutes: ["/release-continuity", "/qa-manual-execution-console", "/api/workflows/execution-attempts/durable-store"],
    failClosedCheck:
      "Missing SCRIMED_BEARER_TOKEN and invalid tokens stop before authenticated mutation; unauthenticated durable-store endpoints remain 401 or 503.",
    graduationGate:
      "Fresh AAL2 session, authorized role, gitignored .env.local or shell env only, strict smoke pass, no-token evidence packet, reviewer signoff, and re-run before buyer-specific proof is released.",
    hardStops: ["token pasted into source", "token retained in docs", "AAL2 bypass attempted", "observer role used for writes"]
  },
  {
    slug: "durable-store-protected-writes-flag",
    knownLimit:
      "The deployed app exposes durable-store contracts while protected writes depend on the SCRIMED_EXECUTION_ATTEMPT_DURABLE_STORE_ENABLED runtime flag and protected Supabase RPCs.",
    status: "active-workaround",
    severity: "high",
    currentImpact:
      "Production protected writes are enabled for the synthetic canary path, but writes remain fail-closed unless Supabase Auth, AAL2, tenant role, workspace membership, no-PHI guards, and route authorization all align.",
    immediateWorkaround:
      "Keep public summary and unauthenticated fail-closed smoke active; use strict AAL2 smoke only with a short-lived authorized operator token and synthetic workspace.",
    durableResolution:
      "Keep the flag paired with named synthetic canaries, migration evidence, runtime-token configuration, rollback owner, strict AAL2 proof, and protected audit review.",
    owner: "Platform reliability + database owner + release stewardship",
    nextProofCommand: "npm run smoke:aal2:durable-store",
    proofRoutes: ["/api/workflows/execution-attempts/durable-store", "/workflows/execution-attempts", "/release-continuity"],
    failClosedCheck:
      "When protected writes are disabled or auth context is missing, authenticated and unauthenticated mutation attempts do not create durable records.",
    graduationGate:
      "Applied migration, server runtime token, feature flag scoped to target, strict AAL2 canary pass, rollback plan, and retained audit event review.",
    hardStops: ["feature flag enabled without migration", "production write enabled without AAL2 smoke", "rollback owner missing"]
  },
  {
    slug: "sandbox-dns-network-boundary",
    knownLimit:
      "The local sandbox may fail DNS resolution for app.scrimedsolutions.com, which can block live production smoke checks inside the default sandbox.",
    status: "resolved-by-workaround",
    severity: "medium",
    currentImpact:
      "Local implementation can pass build and static tests while live smoke requires an approved network execution path.",
    immediateWorkaround:
      "Retry the exact same smoke command with approved network escalation, or run against a local dev server with SCRIMED_BASE_URL=http://127.0.0.1:3025.",
    durableResolution:
      "Keep every live-domain smoke command reproducible, documented, and paired with a local-server equivalent where practical.",
    owner: "Release engineering + platform reliability",
    nextProofCommand: "SCRIMED_BASE_URL=https://app.scrimedsolutions.com npm run smoke:public",
    proofRoutes: ["/launch-readiness", "/release-continuity", "/service-reliability"],
    failClosedCheck:
      "DNS failure is classified as an environment boundary, not an application pass; the same smoke must pass with network access before release proof expands.",
    graduationGate:
      "Live smoke passes from an approved network path and local fallback remains documented for sandbox-limited development.",
    hardStops: ["treating ENOTFOUND as product proof", "changing application code to bypass DNS", "skipping live-domain smoke before release"]
  },
  {
    slug: "supabase-password-posture",
    knownLimit:
      "Supabase leaked-password protection and password-auth posture must be resolved before password sign-in is used for protected operations.",
    status: "resolved-by-workaround",
    severity: "high",
    currentImpact:
      "Protected synthetic routes remain passwordless and AAL2-gated. The advisor warning stays open, and password-based protected operator flows are denied until leaked-password protection is verified.",
    immediateWorkaround:
      "Keep protected durable-store and QA flows on short-lived AAL2 sessions from passkey or magic-link paths; exclude password sign-in from protected smoke instructions.",
    durableResolution:
      "Enable and verify leaked-password protection before introducing password-based protected access, or when the plan exposes the control; re-observe all compensating controls before their evidence expires.",
    owner: "Security lead + identity owner",
    nextProofCommand: "npm run smoke:aal2:token -- --prompt-token",
    proofRoutes: ["/global-certification-readiness", "/trust-center", "/pilot-workspace/access"],
    failClosedCheck:
      "Protected APIs continue to require verified Supabase Auth, aal=aal2, session_id, tenant role, and route-level authorization.",
    graduationGate:
      "Password auth remains excluded or leaked-password protection is verified; MFA enrollment, AAL2 claims, rate limits, server authorization, and tenant role proof remain current without secrets.",
    hardStops: ["claiming HIPAA/SOC certification", "using password-only protected access", "bypassing AAL2"]
  },
  {
    slug: "local-next-swc-signature-boundary",
    knownLimit:
      "Local Next.js builds may warn that the native Darwin SWC binary has a macOS code-signature mismatch and fall back to WASM bindings.",
    status: "resolved-by-workaround",
    severity: "watch",
    currentImpact:
      "Builds still complete, but the warning can be mistaken for an application failure or obscure actual build errors.",
    immediateWorkaround:
      "Treat the warning as local toolchain noise when npm run build exits 0; preserve the full build result in release notes.",
    durableResolution:
      "Refresh local dependencies or reinstall the native SWC package in a clean workspace when the team wants faster native builds.",
    owner: "Developer experience + platform reliability",
    nextProofCommand: "npm run build",
    proofRoutes: ["/service-reliability", "/release-continuity", "/platform-power"],
    failClosedCheck:
      "No release proof is accepted unless build exits 0, lint and typecheck pass, and route generation completes.",
    graduationGate:
      "Clean native SWC load or accepted WASM fallback with successful build, typecheck, lint, and smoke evidence.",
    hardStops: ["ignoring nonzero build exit", "hiding build warnings from release notes", "treating local toolchain warning as production capacity proof"]
  },
  {
    slug: "dirty-worktree-release-hygiene",
    knownLimit:
      "The SCRIMED worktree can carry many staged, modified, and untracked build artifacts across long execution sessions.",
    status: "active-workaround",
    severity: "medium",
    currentImpact:
      "Implementation can continue, but release proof and investor or buyer evidence must distinguish new changes from prior work and generated output.",
    immediateWorkaround:
      "Use git status --short, git diff --name-only, and focused smoke outputs before summarizing; never revert unrelated user or prior-session changes.",
    durableResolution:
      "Create a release checkpoint with scoped files, generated-output policy, commit message, tag, and deployment evidence after human review.",
    owner: "Release stewardship + founder/operator",
    nextProofCommand: "git status --short",
    proofRoutes: ["/release-continuity", "/navigation", "/api/product/console"],
    failClosedCheck:
      "No commit, deploy, or buyer proof claim is made until changed files, untracked files, smoke commands, and known exclusions are listed.",
    graduationGate:
      "Reviewed diff, successful lint/typecheck/build/smoke, clean or intentionally scoped worktree, and release decision recorded.",
    hardStops: ["reverting unrelated work", "committing secrets", "claiming release readiness without status and smoke evidence"]
  }
];

export const limitationsWorkaroundExecutionLedger: LimitationsWorkaroundExecutionLedgerEntry[] = [
  {
    slug: "tenant-admin-workspace-bootstrap-complete",
    title: "Tenant-admin workspace bootstrap completed for synthetic canary",
    state: "proof-retained-no-secret",
    resolvedBoundary:
      "The signed-in founder/operator account existed, but the synthetic workspace did not yet have a verified tenant-admin membership for protected AAL2 smoke execution.",
    operationalUpgrade:
      "Created the protected tenant/workspace membership path for atlas-synthetic-evaluation so authorized AAL2 smoke can prove tenant role, status, and workspace scope before mutation.",
    evidenceRetained:
      "No-secret membership facts only: workspace slug, active tenant-admin role class, status, and access-review due date.",
    verificationCommand: "npm run smoke:aal2:token -- --clipboard-token --clear-clipboard --write-env-local",
    rollbackOrFallback:
      "Suspend membership or downgrade role in Supabase, then rerun protected smoke to confirm record/replay/review return 401 or 403.",
    residualBoundary:
      "Future users still need a governed tenant-access workflow, access review, and offboarding path before they can operate protected workflows.",
    nextControl:
      "Promote the founder bootstrap into a reusable tenant-admin access-review checklist with least-privilege role assignment and expiry evidence.",
    owner: "Tenant governance operator + security lead + release engineering",
    proofRoutes: ["/pilot-workspace/access", "/release-continuity", "/limitations-workarounds"],
    hardStops: ["role granted without owner", "inactive membership used", "workspace slug guessed", "access review omitted"]
  },
  {
    slug: "aal2-token-helper-source-precedence",
    title: "AAL2 token helper now prefers explicit operator token sources",
    state: "control-active",
    resolvedBoundary:
      "A stale gitignored local bearer token could be read before a newly copied or prompted token, causing false expired-token failures during strict smoke setup.",
    operationalUpgrade:
      "The helper now prefers explicit session-file, clipboard, or prompt sources before local environment fallbacks and clears the macOS clipboard when requested.",
    evidenceRetained:
      "No bearer token retained in source, docs, logs, or smoke output; only redacted preflight status and token policy metadata are shown.",
    verificationCommand: "npm run smoke:aal2:policy-test",
    rollbackOrFallback:
      "Use the hidden prompt mode and delete SCRIMED_BEARER_TOKEN from .env.local before retrying if clipboard controls are unavailable.",
    residualBoundary:
      "A valid JWT still depends on a live AAL2 session and may expire before the protected smoke completes.",
    nextControl:
      "Add the token-helper preflight to every protected smoke runbook and keep all token-like values behind redaction.",
    owner: "Security platform + developer experience",
    proofRoutes: ["/release-continuity", "/qa-manual-execution-console", "/limitations-workarounds"],
    hardStops: ["token printed", "token committed", "stale token reused", "AAL2 bypass attempted"]
  },
  {
    slug: "durable-store-phi-guard-precision-applied",
    title: "Durable-store PHI guard precision migrations applied",
    state: "proof-retained-no-secret",
    resolvedBoundary:
      "The durable-store no-PHI guard treated safe synthetic envelope identifiers as potential PHI, blocking protected synthetic smoke even when no patient data was present.",
    operationalUpgrade:
      "Applied precision migrations so identifier checks use bounded patterns while preserving hard stops for PHI, patient identifiers, live charts, member data, and production records.",
    evidenceRetained:
      "Migration file names, contract-check pass state, and synthetic no-PHI smoke result only; no patient data or live records are used.",
    verificationCommand: "npm run smoke:execution-attempt-durable-store",
    rollbackOrFallback:
      "Disable protected writes with SCRIMED_EXECUTION_ATTEMPT_DURABLE_STORE_ENABLED=false and keep public fail-closed smoke active while the guard is reviewed.",
    residualBoundary:
      "Guard precision is a synthetic-safety control, not permission to process PHI or live health records.",
    nextControl:
      "Keep adding adversarial synthetic strings to the durable-store contract check before broadening any protected workflow surface.",
    owner: "Database owner + TrustOS + clinical safety reviewer",
    proofRoutes: ["/api/workflows/execution-attempts/durable-store", "/health-records", "/limitations-workarounds"],
    hardStops: ["PHI introduced", "live chart pasted", "member ID used", "guard weakened without review"]
  },
  {
    slug: "strict-aal2-durable-store-smoke-passed",
    title: "Strict AAL2 durable-store smoke passed for record, replay, review, and idempotency",
    state: "proof-retained-no-secret",
    resolvedBoundary:
      "Before the protected canary, SCRIMED had fail-closed unauthenticated evidence but lacked retained happy-path proof for authenticated durable-store operations.",
    operationalUpgrade:
      "Strict smoke now proves unauthenticated record/replay/review fail closed and authorized AAL2 tenant-admin access can create record, reuse idempotency, replay evidence, and submit review disposition.",
    evidenceRetained:
      "No-secret pass/fail status, route class, workspace slug, operation classes, and command names; bearer tokens and protected payload details are not retained.",
    verificationCommand: "npm run smoke:aal2:durable-store:strict",
    rollbackOrFallback:
      "Turn off SCRIMED_EXECUTION_ATTEMPT_DURABLE_STORE_ENABLED or revoke the tenant role, then verify protected writes fail closed.",
    residualBoundary:
      "This is synthetic protected-workflow proof only; it is not production clinical approval, PHI authority, buyer release authority, or SLA evidence.",
    nextControl:
      "Mirror the strict smoke pattern for every future protected workflow before exposing it in demos, pilots, or buyer diligence.",
    owner: "Release engineering + TrustOS + tenant governance operator",
    proofRoutes: ["/workflows/execution-attempts", "/release-continuity", "/limitations-workarounds"],
    hardStops: ["buyer release claimed", "PHI authority implied", "token retained", "observer role used for writes"]
  },
  {
    slug: "vercel-archive-deploy-hygiene-active",
    title: "Vercel deploy hygiene hardened around local dependency archives",
    state: "control-active",
    resolvedBoundary:
      "A local dependency archive directory could inflate deploy payloads and obscure whether deployment failures came from product code or local machine artifacts.",
    operationalUpgrade:
      "The deploy ignore policy, TypeScript exclusion, and ESLint ignore now contain local dependency artifacts including node_modules 2, and production deploys can use archive mode to reduce file-count risk.",
    evidenceRetained:
      "Deployment identifier, ready status, ignore-file policy, and command class only; no secrets or local cache contents are retained.",
    verificationCommand: "npm run build",
    rollbackOrFallback:
      "Remove local generated dependency archives, rerun build, then deploy with the Vercel archive pathway after human release review.",
    residualBoundary:
      "A successful lint, build, typecheck, or deploy does not create launch approval, customer release approval, uptime guarantee, or managed-service coverage.",
    nextControl:
      "Keep generated-output hygiene in predeploy checks and require release notes to distinguish product changes from local artifacts.",
    owner: "Platform reliability + release stewardship",
    proofRoutes: ["/launch-readiness", "/service-reliability", "/limitations-workarounds"],
    hardStops: ["secret in deploy bundle", "generated cache deployed", "deploy success treated as launch approval", "file-count error ignored"]
  }
];

export const limitationsBoundaryEscalations: LimitationsBoundaryEscalation[] = [
  {
    slug: "phi-live-data-escalation",
    requestPattern: "Buyer asks to upload, paste, connect, or analyze PHI, patient identifiers, member IDs, live charts, production records, or customer credentials.",
    severity: "critical",
    immediateDecision: "Block the request and re-scope to synthetic, no-PHI, or metadata-only evaluation.",
    safeResponse:
      "SCRIMED can evaluate the workflow with synthetic fixtures, metadata-only source references, and a health-record safety plan while PHI authority remains gated.",
    requiredOwner: "Privacy, security, clinical governance, customer authority owner, and TrustOS",
    escalationPath: ["Health Records Safety Exchange", "Clinical Authority Readiness", "Boundary Resolution", "Qualified customer/privacy approval"],
    proofRoutes: ["/health-records", "/clinical-authority-readiness", "/boundary-resolution"],
    decisionSla: "Immediate block, same-business-day owner assignment, and daily review until safely re-scoped.",
    hardStops: ["PHI introduced", "patient identifier introduced", "production credential requested", "live chart requested"],
    graduationEvidence: ["BAA/DPA when required", "customer authority", "security review", "clinical governance approval", "connector/data boundary approval"]
  },
  {
    slug: "live-clinical-care-escalation",
    requestPattern: "Buyer, demo, sales, or product language asks SCRIMED to diagnose, treat, triage, prescribe, route patients, sign notes, or provide production CDS.",
    severity: "critical",
    immediateDecision: "Hold the claim and convert the workflow to draft-only operational planning with human clinical review.",
    safeResponse:
      "SCRIMED can prepare workflow intelligence, draft queues, evidence organization, and governance packets, but live clinical decisions require qualified authority.",
    requiredOwner: "Clinical governance, qualified clinicians, legal, privacy, and release stewardship",
    escalationPath: ["Clinical Care Activation", "Clinical Authority Readiness", "QA Claim Guard", "Regulatory/intended-use review"],
    proofRoutes: ["/clinical-care-activation", "/clinical-authority-readiness", "/qa-claim-guard"],
    decisionSla: "Immediate claim hold before external use; qualified review required before any clinical wording expands.",
    hardStops: ["diagnosis implied", "treatment implied", "autonomous triage requested", "clinician signature implied"],
    graduationEvidence: ["intended-use review", "clinical governance approval", "customer scope", "monitoring/override plan", "rollback evidence"]
  },
  {
    slug: "production-connector-escalation",
    requestPattern: "Buyer requests production EHR, HIE, payer, imaging, device, SMART launch, writeback, patient matching, or payer submission connectivity.",
    severity: "critical",
    immediateDecision: "Block live connector execution and route to standards mapping, sandbox preflight, and customer authority review.",
    safeResponse:
      "SCRIMED can provide standards-aware synthetic conformance review, connector contract planning, and no-mutation evidence before production connectivity is approved.",
    requiredOwner: "Interoperability, platform engineering, privacy, security, clinical governance, and customer integration owner",
    escalationPath: ["Interoperability registry", "Health Records Safety Exchange", "Platform Power API contract register", "Customer sandbox authority"],
    proofRoutes: ["/interoperability", "/health-records", "/platform-power", "/integrations/fixture-validation"],
    decisionSla: "Immediate block for production endpoints; weekly connector-readiness review once safely scoped.",
    hardStops: ["production endpoint requested", "EHR writeback requested", "payer submission requested", "patient matching requested"],
    graduationEvidence: ["customer sandbox", "security review", "connector contract", "mutation policy", "audit/monitoring", "rollback plan"]
  },
  {
    slug: "security-certification-escalation",
    requestPattern: "Procurement asks for SOC 2, HITRUST, ISO, HIPAA certification, penetration testing, vendor-risk approval, BAA/DPA, or security signoff.",
    severity: "high",
    immediateDecision: "Respond with readiness posture, available evidence references, missing artifacts, and external-review owner.",
    safeResponse:
      "SCRIMED can provide trust-center readiness evidence, metadata-only artifact references, and a review plan without claiming certification or approval.",
    requiredOwner: "Security, privacy, legal, trust operations, customer authority owner, and qualified external reviewer",
    escalationPath: ["Trust Center", "Global Certification Readiness", "Provider Security Reviews", "Procurement Evidence Registry"],
    proofRoutes: ["/trust-center", "/global-certification-readiness", "/pilot-workspace/access"],
    decisionSla: "Same-business-day evidence owner assignment; weekly procurement evidence review until artifact status changes.",
    hardStops: ["security certified claimed", "SOC 2 certified claimed", "HITRUST certified claimed", "penetration test complete claimed"],
    graduationEvidence: ["qualified assessment", "remediation evidence", "approved artifact reference", "customer-specific acceptance", "release authority"]
  },
  {
    slug: "api-sla-scale-escalation",
    requestPattern: "Buyer asks for public API access, unlimited usage, public SDK, uptime, support coverage, contractual SLA, managed service coverage, or trillion-scale capacity.",
    severity: "high",
    immediateDecision: "Route to API contract readiness and deal-desk review before any external commitment.",
    safeResponse:
      "SCRIMED can share route summaries, version posture, boundary headers, rate-class planning, and support assumptions without creating an SLA.",
    requiredOwner: "Platform engineering, service reliability, legal ops, finance, customer operations, and executive approver",
    escalationPath: ["Platform Power", "Enterprise Scalability", "Service Reliability", "Enterprise Business Ops"],
    proofRoutes: ["/platform-power", "/enterprise-scalability", "/service-reliability", "/enterprise-business-ops"],
    decisionSla: "Same-business-day API owner assignment; weekly scale council for quota, support, incident, and price-floor decisions.",
    hardStops: ["public API SLA implied", "unlimited usage promised", "contractual uptime promised", "managed service commitment implied"],
    graduationEvidence: ["contract terms", "rate limits", "support tier", "incident response plan", "monitoring", "price model", "executive approval"]
  },
  {
    slug: "autonomous-agent-action-escalation",
    requestPattern: "User asks agents to send messages, create invites, execute tools, remediate production, make clinical/legal/financial decisions, or act without human approval.",
    severity: "critical",
    immediateDecision: "Switch to recommendation mode and require named human approval before any protected action.",
    safeResponse:
      "SCRIMED agents can plan, inspect, draft, evaluate, and route work while protected execution remains human-approved and audit-bound.",
    requiredOwner: "AgentOS, TrustOS, QA, security, finance, clinical governance, and approved operator",
    escalationPath: ["AgentOS", "TrustOS", "Continuous Review", "Manual QA Execution Console", "QA Claim Guard"],
    proofRoutes: ["/agents", "/trust-os", "/continuous-review-audit", "/qa-manual-execution-console", "/qa-claim-guard"],
    decisionSla: "Immediate stop for protected execution; approval packet required before action resumes.",
    hardStops: ["tool execution without approval", "production remediation requested", "clinical decision requested", "legal or financial decision requested"],
    graduationEvidence: ["allowed tool schema", "blocked tool list", "human approval UI", "audit persistence", "rollback behavior", "customer authority"]
  },
  {
    slug: "deal-investor-finance-escalation",
    requestPattern: "Proposal, investor, buyer, or board language asks for legal advice, tax/accounting conclusions, audited financials, valuation, securities material, ROI, revenue, reimbursement, or profit guarantees.",
    severity: "high",
    immediateDecision: "Hold external release and route to deal desk plus qualified legal, finance, accounting, tax, or securities review.",
    safeResponse:
      "SCRIMED can provide readiness evidence, fixed-scope offers, buyer-approved measurement plans, and review slots without giving professional advice or guarantees.",
    requiredOwner: "Founder, deal desk, legal, finance, accounting, tax, revenue operations, and qualified advisors",
    escalationPath: ["Enterprise Business Ops", "Growth Engine", "Capital Vitality", "Investor Audience Readiness", "QA Claim Guard"],
    proofRoutes: ["/enterprise-business-ops", "/growth-engine", "/capital-vitality", "/investor-audience-readiness", "/qa-claim-guard"],
    decisionSla: "Hold until qualified reviewer signs off on exact language, recipient, scope, and measurement boundary.",
    hardStops: ["legal advice implied", "tax advice implied", "securities material implied", "ROI or revenue guaranteed"],
    graduationEvidence: ["qualified review", "approved language", "buyer baseline", "measurement plan", "recipient context", "release decision"]
  },
  {
    slug: "regional-global-approval-escalation",
    requestPattern: "Buyer or partner asks for country launch, public-sector approval, government endorsement, GDPR/EU AI Act conformity, NHS/MHRA/Australia approval, or data-residency approval.",
    severity: "high",
    immediateDecision: "Convert to regional discovery and localization planning until qualified regional authority exists.",
    safeResponse:
      "SCRIMED can prepare no-PHI regional packs, deployment questions, and evidence implications without claiming local approval or conformity.",
    requiredOwner: "Regional counsel, privacy, security, global partnerships, procurement, and customer authority owner",
    escalationPath: ["Global Reach", "Global Certification Readiness", "Deployment Profiles", "Boundary Resolution"],
    proofRoutes: ["/global-reach", "/global-certification-readiness", "/deployment-profiles", "/boundary-resolution"],
    decisionSla: "Same-business-day region owner assignment; external regional review before any public-sector or country-specific claim.",
    hardStops: ["country launch approved claimed", "government endorsement implied", "data residency approved claimed", "regional compliance approved claimed"],
    graduationEvidence: ["regional counsel review", "privacy/security review", "hosting decision", "procurement authority", "partner/customer signoff"]
  }
];

export const limitationsBoundaryWorkaroundPlaybook: LimitationsBoundaryWorkaroundPlaybookItem[] = [
  {
    slug: "playbook-live-phi-request",
    boundary: "live PHI, patient identifiers, member data, live charts, and production credentials",
    status: "blocked-until-evidence",
    triggerSignals: ["PHI upload", "patient identifier", "member ID", "live chart", "production credential"],
    immediateDecision: "Block intake, do not store the payload, and re-scope to synthetic or metadata-only review.",
    safeAlternative:
      "Use the Synthetic no-PHI packet, Health Records Safety Exchange source mapping, and external evidence references without copying protected records into SCRIMED.",
    mappedPacket: "synthetic-no-phi-packet",
    requiredApprovals: ["privacy review", "security review", "customer authority", "BAA/DPA when required", "clinical governance review"],
    proofRoutes: ["/health-records", "/clinical-authority-readiness", "/boundary-resolution", "/limitations-workarounds"],
    validationCommand: "npm run smoke:limitations-workarounds",
    failClosedExpectation:
      "Requests that contain PHI or identifiers remain blocked before storage, model routing, connector execution, or buyer-facing output.",
    graduationEvidence: ["signed authority", "data boundary approval", "retention policy", "monitoring plan", "rollback owner"],
    residualRisk:
      "Synthetic proof can support diligence, but it does not validate live PHI operations or patient-specific safety.",
    hardStops: ["PHI pasted into prompt", "live chart uploaded", "patient matching requested", "production credential provided"],
    owner: "Privacy, security, clinical governance, customer authority owner, and TrustOS"
  },
  {
    slug: "playbook-clinical-authority-request",
    boundary: "diagnosis, treatment, prescribing, triage, patient routing, signed notes, and production CDS",
    status: "external-approval-required",
    triggerSignals: ["diagnosis", "treatment recommendation", "prescribing", "triage", "sign note", "clinical decision support"],
    immediateDecision: "Convert to draft-only workflow intelligence and require qualified clinical review.",
    safeAlternative:
      "Use clinical-governance preparation, synthetic clinical robustness evaluation, evidence organization, and human review queues.",
    mappedPacket: "synthetic-no-phi-packet",
    requiredApprovals: ["qualified clinician review", "intended-use review", "regulatory classification", "customer scope approval", "monitoring and override plan"],
    proofRoutes: ["/clinical-care-activation", "/clinical-authority-readiness", "/clinical-robustness-lab", "/qa-claim-guard"],
    validationCommand: "npm run smoke:clinical-robustness-lab",
    failClosedExpectation:
      "Clinical outputs remain research/demo or draft-only and cannot become autonomous care, diagnosis, treatment, prescribing, or signed documentation.",
    graduationEvidence: ["clinical governance signoff", "reviewer workflow", "risk classification", "override policy", "rollback evidence"],
    residualRisk:
      "Reviewer-gated drafts can reduce operational burden but do not replace clinician judgment or establish clinical validation.",
    hardStops: ["autonomous diagnosis", "treatment plan finalized", "prescription action", "patient routed without approval"],
    owner: "Clinical governance, qualified clinicians, legal, privacy, and release stewardship"
  },
  {
    slug: "playbook-ehr-writeback-connector-request",
    boundary: "production EHR/HIE/payer/imaging/device connector use, patient matching, writeback, and mutation",
    status: "blocked-until-evidence",
    triggerSignals: ["production endpoint", "SMART launch", "EHR writeback", "patient matching", "PACS mutation", "device feed"],
    immediateDecision: "Block production connector execution and convert the ask into standards mapping plus sandbox preflight.",
    safeAlternative:
      "Use fixture validation, interoperability conformance metadata, connector contract review, and no-mutation evidence packets.",
    mappedPacket: "api-contract-readiness",
    requiredApprovals: ["customer sandbox authority", "security review", "connector contract", "mutation policy", "audit and rollback review"],
    proofRoutes: ["/interoperability", "/health-records", "/integrations/fixture-validation", "/platform-power"],
    validationCommand: "npm run smoke:public",
    failClosedExpectation:
      "Production connector, writeback, patient matching, and raw connector payload logging stay blocked until explicit customer and technical authority exists.",
    graduationEvidence: ["sandbox credentials", "scoped connector approval", "audit trail", "rate limits", "rollback plan"],
    residualRisk:
      "Synthetic conformance shows readiness posture only; it cannot prove customer-specific connector acceptance.",
    hardStops: ["production endpoint requested", "raw connector payload stored", "EHR writeback requested", "patient merge requested"],
    owner: "Interoperability, platform engineering, privacy, security, clinical governance, and customer integration owner"
  },
  {
    slug: "playbook-payer-submission-request",
    boundary: "payer submission, billing submission, claim filing, reimbursement certainty, and medical-necessity determination",
    status: "human-review-required",
    triggerSignals: ["submit prior authorization", "submit claim", "bill payer", "medical necessity approved", "reimbursement guaranteed"],
    immediateDecision: "Keep payer work in documentation readiness or draft-review mode and block submission.",
    safeAlternative:
      "Use Documentation-Before-Authorization checks, RCM denial-risk metadata, payer-policy lookup scaffolds, and human-reviewed packets.",
    mappedPacket: "deal-desk-exception",
    requiredApprovals: ["payer workflow owner", "clinical reviewer", "billing compliance review", "customer authorization", "release decision"],
    proofRoutes: ["/scrimed-build-roadmap", "/enterprise-business-ops", "/qa-claim-guard", "/limitations-workarounds"],
    validationCommand: "npm run smoke:documentation-before-authorization",
    failClosedExpectation:
      "SCRIMED may identify missing documentation and draft review packets, but it does not submit payer transactions or guarantee reimbursement.",
    graduationEvidence: ["customer payer authority", "billing compliance signoff", "human submitter approval", "audit log", "rollback/void process"],
    residualRisk:
      "Documentation readiness can lower denial risk but cannot assure payer behavior or reimbursement.",
    hardStops: ["payer transaction submitted", "claim filed", "reimbursement guaranteed", "medical necessity certified"],
    owner: "RCM owner, compliance reviewer, clinical governance, customer billing owner, and legal"
  },
  {
    slug: "playbook-autonomous-agent-action-request",
    boundary: "autonomous agent execution, production remediation, model routing, tool calls, email/calendar actions, and protected workflow actions",
    status: "human-review-required",
    triggerSignals: ["execute tool", "send email", "create calendar invite", "auto-remediate", "route PHI to model", "production model approved"],
    immediateDecision: "Switch to recommendation mode and require named human approval before any protected action resumes.",
    safeAlternative:
      "Use the Meta-Harness, model-route register, manual QA execution console, and no-secret AAL2 operator lanes.",
    mappedPacket: "model-route-register",
    requiredApprovals: ["tool permission owner", "TrustOS review", "security review", "cost owner", "clinical/legal/finance owner when relevant"],
    proofRoutes: ["/agents", "/trust-os", "/scrimed-build-roadmap", "/continuous-review-audit", "/qa-manual-execution-console"],
    validationCommand: "npm run smoke:scrimed-meta-harness",
    failClosedExpectation:
      "Agents can plan, inspect, draft, evaluate, and recommend, but protected execution requires permissioned tools, audit logs, and human approval.",
    graduationEvidence: ["allowed tool schema", "blocked tool list", "approval UI", "audit persistence", "rollback behavior"],
    residualRisk:
      "Human-reviewed recommendations still require monitoring for drift, misuse, cost spikes, and unsafe automation pressure.",
    hardStops: ["tool execution without approval", "patient outreach", "production remediation", "clinical/legal/financial decision"],
    owner: "AgentOS, TrustOS, AI platform, security, QA, finance, and clinical governance"
  },
  {
    slug: "playbook-security-certification-request",
    boundary: "SOC 2, HITRUST, ISO, HIPAA certification, penetration test completion, BAA/DPA, and security signoff",
    status: "external-approval-required",
    triggerSignals: ["SOC 2 certified", "HITRUST certified", "HIPAA certified", "pentest complete", "BAA approved", "vendor risk approved"],
    immediateDecision: "Respond with readiness posture and evidence request owner, not certification language.",
    safeAlternative:
      "Use Trust Center readiness, global certification readiness, provider security review metadata, and external evidence references.",
    mappedPacket: "external-evidence-reference",
    requiredApprovals: ["qualified assessor", "security owner", "privacy owner", "legal owner", "customer-specific acceptance"],
    proofRoutes: ["/trust-center", "/global-certification-readiness", "/pilot-workspace/access", "/boundary-resolution"],
    validationCommand: "npm run smoke:limitations-workarounds",
    failClosedExpectation:
      "Security and privacy claims remain readiness-only unless qualified evidence and approved release authority exist.",
    graduationEvidence: ["assessment report", "remediation evidence", "artifact reference", "release approval", "renewal owner"],
    residualRisk:
      "Readiness artifacts can support procurement but do not substitute for independent assessment or customer acceptance.",
    hardStops: ["certification claimed", "assessment implied complete", "security signoff promised", "BAA accepted without review"],
    owner: "Security, privacy, legal, trust operations, and qualified external reviewers"
  },
  {
    slug: "playbook-api-sla-scale-request",
    boundary: "public API SLA, unlimited usage, contractual uptime, managed service coverage, support guarantee, and scale-equivalence claims",
    status: "human-review-required",
    triggerSignals: ["public API", "unlimited usage", "uptime guaranteed", "managed service", "support guarantee", "trillion-dollar scale"],
    immediateDecision: "Route to API contract readiness, pricing, support, incident, and executive review before external commitment.",
    safeAlternative:
      "Share route summaries, version posture, boundary headers, draft quotas, rate classes, support assumptions, and no-SLA language.",
    mappedPacket: "api-contract-readiness",
    requiredApprovals: ["platform owner", "service reliability owner", "legal", "finance", "executive approver"],
    proofRoutes: ["/platform-power", "/enterprise-scalability", "/service-reliability", "/enterprise-business-ops"],
    validationCommand: "npm run smoke:public",
    failClosedExpectation:
      "Public routes remain inspectable readiness surfaces and do not create contractual SLA, unlimited scale, or managed-service obligations.",
    graduationEvidence: ["contract terms", "rate limits", "support tier", "incident plan", "monitoring", "price model"],
    residualRisk:
      "Technical availability checks are not contractual commitments and do not prove enterprise support capacity.",
    hardStops: ["unlimited usage promised", "contractual uptime promised", "managed service active claimed", "scale parity guaranteed"],
    owner: "Platform engineering, service reliability, legal ops, finance, customer operations, and executive approver"
  },
  {
    slug: "playbook-legal-finance-investor-request",
    boundary: "legal advice, tax/accounting conclusions, audited financials, securities material, valuation, ROI, revenue, reimbursement, and profit guarantees",
    status: "external-approval-required",
    triggerSignals: ["legal advice", "tax advice", "audited financials", "securities material", "valuation", "ROI guaranteed", "revenue guaranteed"],
    immediateDecision: "Hold external release and route exact language to qualified legal, finance, accounting, tax, or securities review.",
    safeAlternative:
      "Use fixed-scope offers, buyer-approved measurement plans, review slots, finance methodology gates, and no-guarantee language.",
    mappedPacket: "deal-desk-exception",
    requiredApprovals: ["qualified counsel", "finance reviewer", "accounting reviewer", "tax reviewer when relevant", "executive release authority"],
    proofRoutes: ["/enterprise-business-ops", "/growth-engine", "/capital-vitality", "/investor-audience-readiness"],
    validationCommand: "npm run smoke:limitations-workarounds",
    failClosedExpectation:
      "Commercial and investor material remains readiness and operating discipline, not legal advice, audited reporting, securities material, or guarantees.",
    graduationEvidence: ["approved language", "recipient context", "measurement plan", "buyer baseline", "release decision"],
    residualRisk:
      "Value narratives remain estimates or hypotheses until buyer-approved baselines and qualified review exist.",
    hardStops: ["legal advice provided", "tax/accounting conclusion", "securities material released", "ROI guaranteed"],
    owner: "Founder, deal desk, legal, finance, accounting, tax, revenue operations, and qualified advisors"
  },
  {
    slug: "playbook-global-regional-approval-request",
    boundary: "country launch, public-sector approval, government endorsement, data residency, GDPR, EU AI Act, NHS, MHRA, and regional procurement claims",
    status: "external-approval-required",
    triggerSignals: ["country launch", "government endorsed", "data residency approved", "GDPR approved", "EU AI Act conformant", "NHS approved"],
    immediateDecision: "Convert to no-PHI regional discovery and localization planning until qualified local authority exists.",
    safeAlternative:
      "Use global regional workaround packs, deployment profiles, regional evidence implications, and local-counsel owner assignment.",
    mappedPacket: "global-regional-pack",
    requiredApprovals: ["regional counsel", "privacy review", "security review", "hosting decision", "procurement authority", "partner/customer signoff"],
    proofRoutes: ["/global-reach", "/global-certification-readiness", "/deployment-profiles", "/boundary-resolution"],
    validationCommand: "npm run smoke:limitations-workarounds",
    failClosedExpectation:
      "Regional work remains discovery and localization planning, not local approval, procurement acceptance, conformity, or launch authority.",
    graduationEvidence: ["regional counsel review", "hosting evidence", "privacy/security signoff", "partner authority", "release decision"],
    residualRisk:
      "Global readiness maps requirements but does not resolve local law, procurement, hosting, or clinical authority.",
    hardStops: ["country launch approved", "government endorsement implied", "data residency approved early", "regional compliance approved"],
    owner: "Regional counsel, privacy, security, global partnerships, procurement, and customer authority owner"
  },
  {
    slug: "playbook-customer-go-live-release-request",
    boundary: "customer go-live, buyer release, protected proof distribution, production support, and launch approval",
    status: "human-review-required",
    triggerSignals: ["go-live approved", "buyer release", "send proof packet", "production support", "launch approved"],
    immediateDecision: "Hold release language and require protected proof, reviewer signoff, recipient authority, and claim guard review.",
    safeAlternative:
      "Use QA Completion Bridge, Activation Seal, Manual QA Execution Console, Buyer Proof Release, and no-secret protected evidence packets.",
    mappedPacket: "aal2-protected-proof",
    requiredApprovals: ["approved AAL2 operator", "reviewer signoff", "release steward", "recipient authority", "claim guard"],
    proofRoutes: ["/release-continuity", "/qa-manual-execution-console", "/buyer-release-control-run", "/pilot-workspace/access"],
    validationCommand: "npm run smoke:aal2:readiness",
    failClosedExpectation:
      "Public smoke and synthetic proof do not become buyer release authority or customer go-live approval.",
    graduationEvidence: ["fresh AAL2 run", "no-secret packet", "reviewer signoff", "recipient qualification", "access-log reconciliation"],
    residualRisk:
      "Protected proof can expire or become stale after deployment, route, reviewer, workspace, recipient, or claim-language changes.",
    hardStops: ["token retained", "buyer release claimed early", "go-live approved without signoff", "protected proof shared without recipient authority"],
    owner: "Release engineering, TrustOS, approved operator, reviewer, and buyer diligence owner"
  },
  {
    slug: "playbook-public-quantum-claim-request",
    boundary: "public quantum capability, quantum clinical advantage, quantum-safe certification, and future infrastructure superiority",
    status: "blocked-until-evidence",
    triggerSignals: ["quantum capability", "quantum advantage", "quantum-safe certified", "future infrastructure superiority"],
    immediateDecision: "Keep the topic internal research only and remove external product, buyer, investor, or security claims.",
    safeAlternative:
      "Use internal research backlog items with hypothesis, source log, review owner, and no-public-claim labels.",
    mappedPacket: "external-evidence-reference",
    requiredApprovals: ["internal research owner", "security review", "legal review", "claim guard", "release decision"],
    proofRoutes: ["/continuous-review-audit", "/qa-claim-guard", "/boundary-resolution", "/limitations-workarounds"],
    validationCommand: "npm run smoke:limitations-workarounds",
    failClosedExpectation:
      "Quantum remains internal research and cannot appear as a public capability, certification, clinical advantage, or investor claim.",
    graduationEvidence: ["validated technical evidence", "risk review", "qualified legal/security review", "approved claim language"],
    residualRisk:
      "Future-facing language can quickly become an unsupported superiority claim if not kept behind release review.",
    hardStops: ["public quantum capability claimed", "quantum clinical advantage claimed", "quantum-safe certification claimed"],
    owner: "Internal Research Team, TrustOS, AI platform, security, legal, finance, and founder"
  }
];

export const limitationsBoundaryPreflightRequests: LimitationsBoundaryPreflightRequest[] = [
  {
    requestId: "preflight-live-phi-upload",
    requestedAction: "Upload a live chart and match the patient before a demo.",
    requestedSignals: ["PHI upload", "live chart", "patient matching"],
    requestedDataClasses: ["live chart", "patient identifier", "production record"],
    requestedOutcome: "clinical workflow proof",
    containsPhi: true,
    requestsProtectedAction: true,
    customerApprovalEvidencePresent: false,
    humanApprovalEvidencePresent: false
  },
  {
    requestId: "preflight-payer-submit",
    requestedAction: "Submit the prior authorization and guarantee reimbursement.",
    requestedSignals: ["submit prior authorization", "reimbursement guaranteed"],
    requestedDataClasses: ["synthetic documentation packet"],
    requestedOutcome: "payer approval",
    containsPhi: false,
    requestsProtectedAction: true,
    customerApprovalEvidencePresent: false,
    humanApprovalEvidencePresent: false
  },
  {
    requestId: "preflight-agent-remediate",
    requestedAction: "Let an agent auto-remediate production and send the follow-up email.",
    requestedSignals: ["auto-remediate", "send email", "execute tool"],
    requestedDataClasses: ["operational metadata"],
    requestedOutcome: "autonomous production action",
    containsPhi: false,
    requestsProtectedAction: true,
    customerApprovalEvidencePresent: false,
    humanApprovalEvidencePresent: false
  },
  {
    requestId: "preflight-security-certification",
    requestedAction: "Tell procurement SCRIMED is SOC 2 certified and HIPAA certified.",
    requestedSignals: ["SOC 2 certified", "HIPAA certified", "vendor risk approved"],
    requestedDataClasses: ["security readiness metadata"],
    requestedOutcome: "procurement approval",
    containsPhi: false,
    requestsProtectedAction: false,
    customerApprovalEvidencePresent: false,
    humanApprovalEvidencePresent: false
  },
  {
    requestId: "preflight-safe-synthetic-assessment",
    requestedAction: "Run a no-PHI synthetic workflow assessment with metadata-only evidence.",
    requestedSignals: ["synthetic assessment", "metadata-only", "no PHI"],
    requestedDataClasses: ["synthetic fixture", "metadata-only reference"],
    requestedOutcome: "buyer-safe workflow assessment",
    containsPhi: false,
    requestsProtectedAction: false,
    customerApprovalEvidencePresent: false,
    humanApprovalEvidencePresent: true
  }
];

export const limitationsBuyerConfidenceSignals: LimitationsBuyerConfidenceSignal[] = [
  {
    buyerConcern: "Can we evaluate SCRIMED without exposing PHI or live operations?",
    trustMessage:
      "Yes. Current demos, assessments, and synthetic pilots are designed around no-PHI inputs, synthetic fixtures, metadata-only references, and explicit live-data hard stops.",
    commercialValue:
      "Buyers can move into a paid workflow assessment or synthetic pilot before privacy, connector, and live clinical approvals are complete.",
    proofRoute: "/health-records"
  },
  {
    buyerConcern: "Will SCRIMED overpromise compliance, security, or clinical readiness?",
    trustMessage:
      "No. The claims register, Trust Center, global certification readiness, and limitation routes separate readiness evidence from certification or approval claims.",
    commercialValue:
      "Procurement, counsel, and security reviewers can evaluate the current posture without forcing the sales team to invent unsupported answers.",
    proofRoute: "/trust-center"
  },
  {
    buyerConcern: "What happens when a buyer asks for something outside today’s capability?",
    trustMessage:
      "SCRIMED converts the request into a workaround packet with owner, safe inputs, output, expiry rule, hard stops, escalation trigger, and graduation gate.",
    commercialValue:
      "Sales momentum continues through scoped alternatives instead of unsafe custom promises or stalled follow-up.",
    proofRoute: "/limitations-workarounds"
  },
  {
    buyerConcern: "How does SCRIMED keep reliability issues from becoming hidden risk?",
    trustMessage:
      "Route checks, release proof, TrustOps incidents, operational-efficiency sprints, and continuous review loops make defects and bottlenecks visible.",
    commercialValue:
      "Enterprise buyers see a vendor operating model they can inspect before a larger pilot or protected activation.",
    proofRoute: "/trust-safety-operations"
  }
];

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => stableSerialize(item)).join(",")}]`;

  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, item]) => `${JSON.stringify(key)}:${stableSerialize(item)}`)
    .join(",")}}`;
}

function generateLimitationsPreflightHash(payload: unknown) {
  const serialized = stableSerialize(payload);
  let hash = 0x811c9dc5;

  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return `scrimed-limit-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function decisionForPlaybookStatus(
  status: LimitationsBoundaryWorkaroundPlaybookStatus
): LimitationsBoundaryPreflightDecision {
  if (status === "blocked-until-evidence") return "block-fail-closed";
  if (status === "external-approval-required") return "external-approval-required";
  if (status === "human-review-required") return "human-review-required";
  return "safe-workaround-only";
}

function strongestPreflightDecision(
  decisions: LimitationsBoundaryPreflightDecision[]
): LimitationsBoundaryPreflightDecision {
  if (decisions.includes("block-fail-closed")) return "block-fail-closed";
  if (decisions.includes("external-approval-required")) return "external-approval-required";
  if (decisions.includes("human-review-required")) return "human-review-required";
  return "safe-workaround-only";
}

function matchesPlaybook(
  request: LimitationsBoundaryPreflightRequest,
  item: LimitationsBoundaryWorkaroundPlaybookItem
) {
  const requestText = [
    request.requestedAction,
    request.requestedOutcome,
    ...request.requestedSignals,
    ...request.requestedDataClasses
  ]
    .join(" ")
    .toLowerCase();

  return item.triggerSignals.some((signal) => requestText.includes(signal.toLowerCase()));
}

export function evaluateLimitationsBoundaryPreflightRequest(
  request: LimitationsBoundaryPreflightRequest
): LimitationsBoundaryPreflightEvaluation {
  const directMatches = limitationsBoundaryWorkaroundPlaybook.filter((item) =>
    matchesPlaybook(request, item)
  );
  const forcedMatches = [
    request.containsPhi
      ? limitationsBoundaryWorkaroundPlaybook.find((item) => item.slug === "playbook-live-phi-request")
      : undefined,
    request.requestsProtectedAction && directMatches.length === 0
      ? limitationsBoundaryWorkaroundPlaybook.find(
          (item) => item.slug === "playbook-autonomous-agent-action-request"
        )
      : undefined
  ].filter((item): item is LimitationsBoundaryWorkaroundPlaybookItem => Boolean(item));
  const matches = unique([...directMatches, ...forcedMatches].map((item) => item.slug))
    .map((slug) => limitationsBoundaryWorkaroundPlaybook.find((item) => item.slug === slug))
    .filter((item): item is LimitationsBoundaryWorkaroundPlaybookItem => Boolean(item));
  const decisions =
    matches.length > 0
      ? matches.map((item) => decisionForPlaybookStatus(item.status))
      : (["safe-workaround-only"] satisfies LimitationsBoundaryPreflightDecision[]);
  const decision = strongestPreflightDecision(decisions);
  const requiredApprovals = unique(matches.flatMap((item) => item.requiredApprovals));
  const proofRoutes = unique(matches.flatMap((item) => item.proofRoutes));
  const validationCommands = unique(matches.map((item) => item.validationCommand));
  const hardStops = unique(matches.flatMap((item) => item.hardStops));
  const mappedPackets = unique(matches.map((item) => item.mappedPacket));
  const matchedBoundaries = matches.map((item) => item.boundary);
  const immediateDecision =
    matches.length > 0
      ? matches.map((item) => item.immediateDecision).join(" ")
      : "Proceed only as a no-PHI synthetic or metadata-only assessment with no protected execution.";
  const safeAlternative =
    matches.length > 0
      ? matches.map((item) => item.safeAlternative).join(" ")
      : "Use a buyer-safe synthetic assessment, metadata-only references, and human-reviewed output language.";
  const failClosedExpectation =
    matches.length > 0
      ? matches.map((item) => item.failClosedExpectation).join(" ")
      : "No live PHI, clinical care, payer submission, EHR writeback, production connector, autonomous execution, certification claim, or release authority is created.";
  const residualRisk =
    matches.length > 0
      ? matches.map((item) => item.residualRisk).join(" ")
      : "Even safe synthetic assessment outputs require review before external buyer use.";

  return {
    requestId: request.requestId,
    decision,
    matchedPlaybookSlugs: matches.map((item) => item.slug),
    matchedBoundaries,
    mappedPackets,
    immediateDecision,
    safeAlternative,
    requiredApprovals,
    proofRoutes,
    validationCommands,
    hardStops,
    failClosedExpectation,
    residualRisk,
    noGoBoundaryPreserved: true,
    externalExecutionAllowed: false,
    phiProcessingAllowed: false,
    autonomousActionAllowed: false,
    auditHash: generateLimitationsPreflightHash({
      requestId: request.requestId,
      requestedSignals: request.requestedSignals,
      requestedDataClasses: request.requestedDataClasses,
      containsPhi: request.containsPhi,
      requestsProtectedAction: request.requestsProtectedAction,
      customerApprovalEvidencePresent: request.customerApprovalEvidencePresent,
      humanApprovalEvidencePresent: request.humanApprovalEvidencePresent,
      decision,
      matchedPlaybookSlugs: matches.map((item) => item.slug)
    })
  };
}

function countByState(tracks: LimitationsWorkaroundTrack[]) {
  return tracks.reduce(
    (counts, track) => ({
      ...counts,
      [track.state]: counts[track.state] + 1
    }),
    {
      "resolved-with-control": 0,
      "workaround-active": 0,
      "human-review-required": 0,
      "external-review-required": 0,
      "blocked-until-approved": 0
    } satisfies Record<LimitationsWorkaroundState, number>
  );
}

function countBySeverity(tracks: LimitationsWorkaroundTrack[]) {
  return tracks.reduce(
    (counts, track) => ({
      ...counts,
      [track.severity]: counts[track.severity] + 1
    }),
    {
      critical: 0,
      high: 0,
      medium: 0,
      watch: 0
    } satisfies Record<LimitationsWorkaroundSeverity, number>
  );
}

function countByCategory(tracks: LimitationsWorkaroundTrack[]) {
  return tracks.reduce(
    (counts, track) => ({
      ...counts,
      [track.category]: counts[track.category] + 1
    }),
    {
      "clinical-phi-data": 0,
      "ehr-interoperability": 0,
      "api-sla-scale": 0,
      "ai-agent-autonomy": 0,
      "security-certification": 0,
      "global-legal-privacy": 0,
      "finance-revenue-contracts": 0,
      "onboarding-communications": 0,
      "release-proof": 0,
      "accessibility-ui": 0,
      "innovation-research": 0
    } satisfies Record<LimitationsWorkaroundCategory, number>
  );
}

function markdownItems(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function trackLines(tracks: LimitationsWorkaroundTrack[]) {
  return tracks
    .map(
      (track) =>
        `- ${track.title} (${track.category}, ${track.severity}, ${track.state}): ${track.limitation} Workaround: ${track.safeWorkaround} Control: ${track.operatingControl} Gate: ${track.graduationGate}`
    )
    .join("\n");
}

function resolutionWorkOrderLines(workOrders: LimitationsResolutionWorkOrder[]) {
  return workOrders
    .map(
      (workOrder) =>
        `- ${workOrder.knownLimit} (${workOrder.severity}, ${workOrder.status}): Workaround: ${workOrder.immediateWorkaround} Resolution: ${workOrder.durableResolution} Proof: ${workOrder.nextProofCommand} Gate: ${workOrder.graduationGate}`
    )
    .join("\n");
}

function executionLedgerLines(entries: LimitationsWorkaroundExecutionLedgerEntry[]) {
  return entries
    .map(
      (entry) =>
        `- ${entry.title} (${entry.state}): Resolved boundary: ${entry.resolvedBoundary} Upgrade: ${entry.operationalUpgrade} Evidence retained: ${entry.evidenceRetained} Verify: ${entry.verificationCommand} Residual boundary: ${entry.residualBoundary} Next control: ${entry.nextControl}`
    )
    .join("\n");
}

function boundaryWorkaroundPlaybookLines(items: LimitationsBoundaryWorkaroundPlaybookItem[]) {
  return items
    .map(
      (item) =>
        `- ${item.boundary} (${item.status}): Decision: ${item.immediateDecision} Safe alternative: ${item.safeAlternative} Packet: ${item.mappedPacket}. Validate: ${item.validationCommand}. Fail-closed: ${item.failClosedExpectation}. Gate: ${item.graduationEvidence.join(", ")}`
    )
    .join("\n");
}

function boundaryPreflightEvaluationLines(items: LimitationsBoundaryPreflightEvaluation[]) {
  return items
    .map(
      (item) =>
        `- ${item.requestId}: ${item.decision}. Matches: ${item.matchedPlaybookSlugs.join(", ") || "none"}. Packets: ${item.mappedPackets.join(", ") || "synthetic assessment"}. External execution allowed: ${item.externalExecutionAllowed ? "yes" : "no"}. PHI allowed: ${item.phiProcessingAllowed ? "yes" : "no"}. Audit: ${item.auditHash}`
    )
    .join("\n");
}

export function getLimitationsWorkaroundSummary() {
  const proofRoutes = unique([
    ...limitationsWorkaroundTracks.flatMap((track) => track.proofRoutes),
    ...limitationsWorkaroundPackets.flatMap((packet) => packet.proofRoutes),
    ...limitationsBoundaryEscalations.flatMap((escalation) => escalation.proofRoutes),
    ...limitationsBoundaryWorkaroundPlaybook.flatMap((item) => item.proofRoutes),
    ...limitationsResolutionWorkOrders.flatMap((workOrder) => workOrder.proofRoutes),
    ...limitationsWorkaroundExecutionLedger.flatMap((entry) => entry.proofRoutes),
    limitationsWorkaroundRoute,
    limitationsWorkaroundApiRoute,
    limitationsWorkaroundBriefRoute
  ]);
  const hardStops = unique([
    ...limitationsWorkaroundTracks.flatMap((track) => track.blockedClaims),
    ...limitationsWorkaroundPackets.flatMap((packet) => packet.hardStops),
    ...limitationsWorkaroundCadences.flatMap((cadence) => cadence.hardStops),
    ...limitationsBoundaryEscalations.flatMap((escalation) => escalation.hardStops),
    ...limitationsBoundaryWorkaroundPlaybook.flatMap((item) => item.hardStops),
    ...limitationsResolutionWorkOrders.flatMap((workOrder) => workOrder.hardStops),
    ...limitationsWorkaroundExecutionLedger.flatMap((entry) => entry.hardStops),
    ...limitationsWorkaroundBlockedClaims
  ]);
  const owners = unique([
    ...limitationsWorkaroundTracks.map((track) => track.owner),
    ...limitationsWorkaroundPackets.map((packet) => packet.owner),
    ...limitationsWorkaroundCadences.map((cadence) => cadence.owner),
    ...limitationsBoundaryEscalations.map((escalation) => escalation.requiredOwner),
    ...limitationsBoundaryWorkaroundPlaybook.map((item) => item.owner),
    ...limitationsResolutionWorkOrders.map((workOrder) => workOrder.owner),
    ...limitationsWorkaroundExecutionLedger.map((entry) => entry.owner)
  ]);
  const countsByState = countByState(limitationsWorkaroundTracks);
  const countsBySeverity = countBySeverity(limitationsWorkaroundTracks);
  const countsByCategory = countByCategory(limitationsWorkaroundTracks);
  const resolutionWorkOrdersByStatus = limitationsResolutionWorkOrders.reduce(
    (counts, workOrder) => ({
      ...counts,
      [workOrder.status]: counts[workOrder.status] + 1
    }),
    {
      "resolved-by-workaround": 0,
      "active-workaround": 0,
      "blocked-external-dependency": 0,
      "requires-human-operator": 0
    } satisfies Record<LimitationsResolutionWorkOrderStatus, number>
  );
  const executionLedgerByState = limitationsWorkaroundExecutionLedger.reduce(
    (counts, entry) => ({
      ...counts,
      [entry.state]: counts[entry.state] + 1
    }),
    {
      "proof-retained-no-secret": 0,
      "control-active": 0,
      "operator-required": 0,
      "external-dependency-open": 0
    } satisfies Record<LimitationsWorkaroundExecutionLedgerState, number>
  );
  const resolvedExecutionLedgerCount =
    executionLedgerByState["proof-retained-no-secret"] + executionLedgerByState["control-active"];
  const openExecutionLedgerCount =
    executionLedgerByState["operator-required"] + executionLedgerByState["external-dependency-open"];
  const openRiskCount =
    countsByState["human-review-required"] +
    countsByState["external-review-required"] +
    countsByState["blocked-until-approved"];
  const unresolvedWorkOrderCount =
    resolutionWorkOrdersByStatus["active-workaround"] +
    resolutionWorkOrdersByStatus["blocked-external-dependency"] +
    resolutionWorkOrdersByStatus["requires-human-operator"];
  const boundaryPreflightEvaluations = limitationsBoundaryPreflightRequests.map((request) =>
    evaluateLimitationsBoundaryPreflightRequest(request)
  );
  const failClosedPreflightCount = boundaryPreflightEvaluations.filter(
    (evaluation) => evaluation.decision === "block-fail-closed"
  ).length;
  const safeWorkaroundPreflightCount = boundaryPreflightEvaluations.filter(
    (evaluation) => evaluation.decision === "safe-workaround-only"
  ).length;

  const metrics: LimitationsWorkaroundMetric[] = [
    {
      metric: "Open limitation pressure",
      currentSignal: `${openRiskCount} tracks still require human, external, or approval-gated resolution.`,
      targetSignal: "Every open limitation has a safe workaround, owner, proof route, escalation trigger, and graduation gate.",
      evidenceRoute: limitationsWorkaroundApiRoute,
      boundary: "Lower open pressure is operating discipline, not approval or certification."
    },
    {
      metric: "Workaround packet coverage",
      currentSignal: `${limitationsWorkaroundPackets.length} reusable workaround packets and ${limitationsBoundaryEscalations.length} escalation paths cover the highest-risk boundary classes.`,
      targetSignal: "Every repeated issue resolves to an approved packet or escalation decision before buyer use.",
      evidenceRoute: limitationsWorkaroundRoute,
      boundary: "Packets are interim controls; they do not become authority without retained evidence."
    },
    {
      metric: "Hard-stop visibility",
      currentSignal: `${hardStops.length} hard stops and blocked claims are visible from this layer.`,
      targetSignal: "Each hard stop has an escalation owner and no-authority language before external use.",
      evidenceRoute: "/boundary-resolution",
      boundary: "Hard-stop visibility does not waive qualified review."
    },
    {
      metric: "Proof-route coverage",
      currentSignal: `${proofRoutes.length} proof routes support workaround routing and graduation checks.`,
      targetSignal: "Every workaround links to a live route, API, brief, protected workspace, or external evidence reference.",
      evidenceRoute: "/navigation",
      boundary: "Proof routes organize evidence; they do not prove protected execution alone."
    },
    {
      metric: "Known blocker resolution queue",
      currentSignal: `${limitationsResolutionWorkOrders.length} current operational blockers are tracked, with ${unresolvedWorkOrderCount} still requiring active workaround, external dependency closure, or human operator action.`,
      targetSignal:
        "Every known blocker has a fail-closed check, safe workaround, next proof command, owner, and graduation gate before launch claims expand.",
      evidenceRoute: limitationsWorkaroundApiRoute,
      boundary: "A resolution queue is operational control, not production, clinical, security, or release approval."
    },
    {
      metric: "No-secret execution ledger",
      currentSignal: `${limitationsWorkaroundExecutionLedger.length} recent limitation workarounds are retained with ${resolvedExecutionLedgerCount} proof-retained or active-control entries and ${openExecutionLedgerCount} open dependency entries.`,
      targetSignal:
        "Every resolved boundary keeps verification command, rollback path, residual boundary, owner, hard stops, and no-secret evidence-retention language.",
      evidenceRoute: limitationsWorkaroundApiRoute,
      boundary: "Execution ledger entries prove operational control only; they do not retain tokens, PHI, secrets, or buyer-release authority."
    },
    {
      metric: "Boundary workaround playbook coverage",
      currentSignal: `${limitationsBoundaryWorkaroundPlaybook.length} preserved NO-GO boundaries have trigger signals, immediate decisions, safe alternatives, validation commands, fail-closed expectations, approval gates, and residual-risk language.`,
      targetSignal:
        "Every high-risk request can be routed to a deterministic workaround before anyone improvises a buyer, clinical, connector, legal, financial, or security promise.",
      evidenceRoute: limitationsWorkaroundApiRoute,
      boundary: "A playbook creates operating discipline only; it does not release any preserved boundary."
    },
    {
      metric: "Boundary preflight fail-closed coverage",
      currentSignal: `${boundaryPreflightEvaluations.length} synthetic request preflights are evaluated, with ${failClosedPreflightCount} fail-closed decisions and ${safeWorkaroundPreflightCount} safe-workaround-only decisions.`,
      targetSignal:
        "Every gray-zone buyer, operator, agent, clinical, payer, connector, security, finance, global, or release request is classified before execution or external language expands.",
      evidenceRoute: limitationsWorkaroundApiRoute,
      boundary:
        "Preflight classification is routing and containment only; it does not process PHI, execute tools, submit payer work, or approve customer go-live."
    }
  ];

  return {
    service: "scrimed-limitations-workaround-operations",
    route: limitationsWorkaroundRoute,
    apiRoute: limitationsWorkaroundApiRoute,
    briefRoute: limitationsWorkaroundBriefRoute,
    status: limitationsWorkaroundStatus,
    briefStatus: limitationsWorkaroundBriefStatus,
    updated: limitationsWorkaroundUpdatedAt,
    boundary: limitationsWorkaroundBoundary,
    authority: {
      limitationAuthority: "workaround-control-only",
      dataBoundary: "synthetic-and-metadata-only",
      phiAuthority: "not-authorized-production-phi",
      clinicalCareAuthority: "not-authorized-live-care",
      connectorAuthority: "not-production-connector-approved",
      autonomyAuthority: "no-autonomous-production-remediation",
      aiAuthority: "no-live-autonomous-ai-authority",
      legalAuthority: "qualified-review-required",
      financialAuthority: "not-audited-financial-report",
      revenueAuthority: "not-revenue-guarantee",
      profitAuthority: "not-profit-margin-guarantee",
      securityCertification: "not-security-certified",
      accessibilityCertification: "not-accessibility-certified",
      slaAuthority: "not-contractual-sla",
      releaseAuthority: "not-release-approval",
      quantumAuthority: "internal-research-only-no-public-claim"
    },
    trackCount: limitationsWorkaroundTracks.length,
    packetCount: limitationsWorkaroundPackets.length,
    boundaryEscalationCount: limitationsBoundaryEscalations.length,
    boundaryWorkaroundPlaybookCount: limitationsBoundaryWorkaroundPlaybook.length,
    boundaryPreflightRequestCount: limitationsBoundaryPreflightRequests.length,
    boundaryPreflightEvaluationCount: boundaryPreflightEvaluations.length,
    failClosedPreflightCount,
    safeWorkaroundPreflightCount,
    resolutionWorkOrderCount: limitationsResolutionWorkOrders.length,
    unresolvedResolutionWorkOrderCount: unresolvedWorkOrderCount,
    executionLedgerCount: limitationsWorkaroundExecutionLedger.length,
    resolvedExecutionLedgerCount,
    openExecutionLedgerCount,
    cadenceCount: limitationsWorkaroundCadences.length,
    metricCount: metrics.length,
    openRiskCount,
    countsByState,
    countsBySeverity,
    countsByCategory,
    resolutionWorkOrdersByStatus,
    executionLedgerByState,
    criticalTrackCount: countsBySeverity.critical,
    highTrackCount: countsBySeverity.high,
    proofRouteCount: proofRoutes.length,
    hardStopCount: hardStops.length,
    blockedClaimCount: limitationsWorkaroundBlockedClaims.length,
    ownerCount: owners.length,
    tracks: limitationsWorkaroundTracks,
    packets: limitationsWorkaroundPackets,
    boundaryEscalations: limitationsBoundaryEscalations,
    boundaryWorkaroundPlaybook: limitationsBoundaryWorkaroundPlaybook,
    boundaryPreflightRequests: limitationsBoundaryPreflightRequests,
    boundaryPreflightEvaluations,
    resolutionWorkOrders: limitationsResolutionWorkOrders,
    executionLedger: limitationsWorkaroundExecutionLedger,
    cadences: limitationsWorkaroundCadences,
    metrics,
    buyerConfidenceSignals: limitationsBuyerConfidenceSignals,
    buyerConfidenceSignalCount: limitationsBuyerConfidenceSignals.length,
    blockedClaims: limitationsWorkaroundBlockedClaims,
    proofRoutes,
    hardStops,
    owners,
    operatingPath: limitationsWorkaroundOperatingPath,
    nextBuildStep:
      "Attach this workaround layer and boundary escalation matrix to every new limitation found in sales, demos, QA, API, UI, AI, clinical, finance, legal, security, global, and release work; if a workaround repeats twice, promote it into smoke coverage, route inventory, Boundary Resolution, Operational Efficiency, Platform Power, or Service Reliability before claims expand."
  };
}

export function buildLimitationsWorkaroundBrief() {
  const summary = getLimitationsWorkaroundSummary();

  return [
    "# SCRIMED Limitations and Workaround Operations Brief",
    "",
    `Status: ${summary.status}`,
    `Updated: ${summary.updated}`,
    `Tracks: ${summary.trackCount}`,
    `Workaround packets: ${summary.packetCount}`,
    `Boundary escalations: ${summary.boundaryEscalationCount}`,
    `Boundary workaround playbooks: ${summary.boundaryWorkaroundPlaybookCount}`,
    `Boundary preflight evaluations: ${summary.boundaryPreflightEvaluationCount}`,
    `Fail-closed preflights: ${summary.failClosedPreflightCount}`,
    `Execution ledger entries: ${summary.executionLedgerCount}`,
    `Resolved execution ledger entries: ${summary.resolvedExecutionLedgerCount}`,
    `Open risks: ${summary.openRiskCount}`,
    `Proof routes: ${summary.proofRouteCount}`,
    `Hard stops: ${summary.hardStopCount}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is not PHI processing authority, live clinical care authority, legal/accounting/tax advice, audited financial reporting, security certification, accessibility certification, production connector approval, public API SLA approval, live autonomous AI approval, buyer release approval, public quantum capability, revenue guarantee, or profit-margin guarantee.",
    "",
    "## Authority",
    `- Limitation authority: ${summary.authority.limitationAuthority}`,
    `- Data boundary: ${summary.authority.dataBoundary}`,
    `- PHI authority: ${summary.authority.phiAuthority}`,
    `- Clinical care authority: ${summary.authority.clinicalCareAuthority}`,
    `- Connector authority: ${summary.authority.connectorAuthority}`,
    `- Autonomy authority: ${summary.authority.autonomyAuthority}`,
    `- AI authority: ${summary.authority.aiAuthority}`,
    `- Legal authority: ${summary.authority.legalAuthority}`,
    `- Financial authority: ${summary.authority.financialAuthority}`,
    `- SLA authority: ${summary.authority.slaAuthority}`,
    `- Release authority: ${summary.authority.releaseAuthority}`,
    `- Quantum authority: ${summary.authority.quantumAuthority}`,
    "",
    "## Counts By State",
    ...Object.entries(summary.countsByState).map(([state, count]) => `- ${state}: ${count}`),
    "",
    "## Counts By Category",
    ...Object.entries(summary.countsByCategory).map(([category, count]) => `- ${category}: ${count}`),
    "",
    "## Operating Path",
    markdownItems(summary.operatingPath),
    "",
    "## Buyer Confidence Signals",
    ...summary.buyerConfidenceSignals.map(
      (signal) =>
        `- ${signal.buyerConcern} Trust message: ${signal.trustMessage} Commercial value: ${signal.commercialValue} Proof route: ${signal.proofRoute}`
    ),
    "",
    "## Workaround Packets",
    ...summary.packets.map(
      (packet) =>
        `- ${packet.name}: ${packet.usedWhen} Output: ${packet.output} Expiry: ${packet.expiryRule} Hard stops: ${packet.hardStops.join(", ")}`
    ),
    "",
    "## Boundary Escalation Matrix",
    ...summary.boundaryEscalations.map(
      (escalation) =>
        `- ${escalation.requestPattern} Decision: ${escalation.immediateDecision} Safe response: ${escalation.safeResponse} Owner: ${escalation.requiredOwner}. SLA: ${escalation.decisionSla}. Hard stops: ${escalation.hardStops.join(", ")}. Graduation evidence: ${escalation.graduationEvidence.join(", ")}`
    ),
    "",
    "## Boundary Workaround Playbook",
    boundaryWorkaroundPlaybookLines(summary.boundaryWorkaroundPlaybook),
    "",
    "## Boundary Preflight Evaluations",
    boundaryPreflightEvaluationLines(summary.boundaryPreflightEvaluations),
    "",
    "## Known Limit Resolution Queue",
    resolutionWorkOrderLines(summary.resolutionWorkOrders),
    "",
    "## Recent Workaround Execution Ledger",
    executionLedgerLines(summary.executionLedger),
    "",
    "## Cadences",
    ...summary.cadences.map(
      (cadence) =>
        `- ${cadence.cadence}: ${cadence.decisionOutput} Owner: ${cadence.owner}. Hard stops: ${cadence.hardStops.join(", ")}`
    ),
    "",
    "## Metrics",
    ...summary.metrics.map(
      (metric) =>
        `- ${metric.metric}: ${metric.currentSignal} Target: ${metric.targetSignal} Boundary: ${metric.boundary}`
    ),
    "",
    "## Tracks",
    trackLines(summary.tracks),
    "",
    "## Blocked Claims",
    markdownItems(summary.blockedClaims),
    "",
    "## Next Build Step",
    summary.nextBuildStep,
    ""
  ].join("\n");
}
