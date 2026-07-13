export type PlatformPowerStatus =
  | "active-control-plane"
  | "human-review-required"
  | "external-review-required"
  | "blocked-before-approval";

export type PlatformPowerPillar = {
  slug: string;
  name: string;
  status: PlatformPowerStatus;
  owner: string;
  ambition: string;
  operatingControl: string;
  evidence: string[];
  proofRoutes: string[];
  retainedBoundary: string;
  nextAction: string;
};

export type PlatformPowerControl = {
  slug: string;
  control: string;
  status: PlatformPowerStatus;
  owner: string;
  purpose: string;
  requiredEvidence: string[];
  hardStops: string[];
};

export type PlatformPowerWorkstream = {
  slug: string;
  name: string;
  owner: string;
  objective: string;
  sequence: string[];
  proofRoutes: string[];
  retainedBoundary: string;
};

export type PlatformPowerCadence = {
  cadence: string;
  owner: string;
  reviewedSignals: string[];
  decisionOutput: string;
  hardStops: string[];
};

export type PlatformPowerBottleneck = {
  slug: string;
  name: string;
  status: PlatformPowerStatus;
  impact: string;
  workaround: string;
  graduationGate: string;
  owner: string;
  proofRoutes: string[];
};

export const platformPowerRoute = "/platform-power";
export const platformPowerApiRoute = "/api/platform-power";
export const platformPowerBriefRoute = "/api/platform-power/brief";
export const platformPowerStatus =
  "api-ui-ai-platform-power-control-plane-active";
export const platformPowerBriefStatus =
  "api-ui-ai-platform-power-brief-ready-no-live-ai-authority";
export const platformPowerUpdatedAt = "2026-06-26";

export const platformPowerBoundary =
  "SCRIMED Platform Power Operations organizes API contract governance, developer experience, versioning, authentication posture, tenant isolation, rate limits, idempotency, observability, operator-grade UI navigation, accessibility readiness, design-system discipline, AI model-routing readiness, agent orchestration, evaluation loops, retrieval/evidence intelligence, tool approval, cost controls, and safety boundaries for synthetic, business-contact, workflow, and metadata-only evaluation. It is an enterprise platform readiness layer only. It is not a public API SLA, production API marketplace launch, live autonomous AI authority, production model-routing approval, external LLM provider approval, PHI processing authority, EHR access approval, production connector approval, model-safety certification, security certification, accessibility certification, clinical validation, legal advice, financial advice, contractual uptime guarantee, managed service commitment, and it is not proof that SCRIMED has trillion-dollar-company-equivalent capacity.";

export const platformPowerBlockedClaims = [
  "trillion-dollar company parity guaranteed",
  "public API SLA approved",
  "production API marketplace launched",
  "unlimited API scale approved",
  "production API uptime guaranteed",
  "live autonomous AI approved",
  "production model routing approved",
  "external LLM provider approved for production PHI",
  "agent actions fully autonomous",
  "tool execution approved without human review",
  "RAG answers clinically validated",
  "model safety certified",
  "AI governance certification granted",
  "accessibility certified",
  "security certification granted",
  "SOC 2 certified",
  "HITRUST certified",
  "PHI processing authorized",
  "EHR access approved",
  "FHIR writeback approved",
  "payer submission approved",
  "clinical decision support authorized",
  "contractual uptime guaranteed",
  "managed service commitment active",
  "error-free AI guaranteed"
];

export const platformPowerPillars: PlatformPowerPillar[] = [
  {
    slug: "api-contract-productization",
    name: "API contract productization",
    status: "active-control-plane",
    owner: "Platform engineering, product, and developer experience",
    ambition:
      "Make every public or buyer-facing capability inspectable as a stable, versioned contract before enterprise buyers ask for integrations.",
    operatingControl:
      "Route handlers, status headers, typed summaries, markdown briefs, route inventory, smoke tests, and future OpenAPI/SDK handoff stay aligned.",
    evidence: ["Route inventory", "API pattern count", "public smoke", "typed summaries", "brief endpoints"],
    proofRoutes: ["/navigation", "/product", "/api/product/console"],
    retainedBoundary:
      "Contract readiness is not a public API SLA, external API marketplace launch, or production integration approval.",
    nextAction:
      "Promote buyer-critical APIs into a contract register with version, owner, auth posture, rate limit, schema, examples, and blocked claims."
  },
  {
    slug: "secure-tenant-api-plane",
    name: "Secure tenant API plane",
    status: "human-review-required",
    owner: "Security, tenant governance, platform engineering, and customer authority owners",
    ambition:
      "Prepare tenant-scoped API access, role boundaries, AAL2 gates, audit trails, and metadata-only payload rules before production data appears.",
    operatingControl:
      "Every tenant-facing path retains fail-closed checks, no-PHI rules, owner assignment, access review cadence, and protected workspace routing.",
    evidence: ["AAL2 gates", "protected workspace fail-closed checks", "tenant lifecycle packets", "no-PHI headers"],
    proofRoutes: ["/pilot-workspace/access", "/clinical-authority-readiness", "/boundary-resolution"],
    retainedBoundary:
      "Tenant API planning does not approve PHI processing, customer-specific tenancy, production credentials, or live connector use.",
    nextAction:
      "Attach tenant owner, scope, auth mode, token handling, access review, and revocation path to every protected API before expansion."
  },
  {
    slug: "rate-limit-idempotency-resilience",
    name: "Rate limit, idempotency, and resilience",
    status: "active-control-plane",
    owner: "Runtime safety, service reliability, and QA",
    ambition:
      "Keep repeated requests, retries, queue pressure, and long-running work from creating duplicate evidence or unsafe operator load.",
    operatingControl:
      "Idempotency keys, retry ceilings, throttling posture, duplicate-proof checks, dead-letter ownership, and fail-closed responses are required before scale claims.",
    evidence: ["Execution attempts", "runtime safety", "service reliability", "manual QA console"],
    proofRoutes: ["/workflows/execution-attempts", "/workflows/runtime-safety", "/service-reliability", "/qa-manual-execution-console"],
    retainedBoundary:
      "Resilience design does not create contractual uptime, unlimited throughput, or autonomous production remediation.",
    nextAction:
      "Add rate-limit class, idempotency key, retry ceiling, quarantine path, and smoke assertion to every high-value platform API."
  },
  {
    slug: "operator-grade-ui-command",
    name: "Operator-grade UI command surfaces",
    status: "active-control-plane",
    owner: "Product Console, design systems, sales engineering, and release operators",
    ambition:
      "Make the UI feel like an enterprise operating console: dense, navigable, role-based, and grounded in proof instead of marketing fog.",
    operatingControl:
      "Homepage actions, hub console views, product summary cards, role journeys, limitation controls, and proof-stack sections stay cross-linked.",
    evidence: ["Product Console", "OS Hub", "site navigation shell", "navigation audit"],
    proofRoutes: ["/", "/hub", "/product", "/navigation"],
    retainedBoundary:
      "UI command readiness is not accessibility certification, buyer training completion, or customer approval.",
    nextAction:
      "Add role-specific platform-power entry points for API owners, UI operators, AI governance reviewers, and enterprise buyers."
  },
  {
    slug: "design-system-accessibility-performance",
    name: "Design system, accessibility, and performance readiness",
    status: "human-review-required",
    owner: "Frontend, design systems, QA, and accessibility reviewers",
    ambition:
      "Reduce UI friction with consistent components, scanning-friendly hierarchy, mobile-safe layouts, keyboard-safe controls, and readable enterprise copy.",
    operatingControl:
      "Route pages use stable sections, table rows, summary metrics, constrained copy, and smoke-visible navigation while accessibility review remains explicit.",
    evidence: ["Page build", "public smoke", "manual UI review", "navigation groups"],
    proofRoutes: ["/navigation", "/product", "/hub"],
    retainedBoundary:
      "Accessibility and performance readiness is not a WCAG audit, VPAT, Section 508 conformance claim, or external UX certification.",
    nextAction:
      "Turn high-traffic workflows into a UI quality checklist with keyboard path, responsive scan, copy length, contrast, and empty-state checks."
  },
  {
    slug: "ai-model-gateway-routing",
    name: "AI model gateway and routing readiness",
    status: "external-review-required",
    owner: "AI platform, TrustOS, security, finance, and model governance",
    ambition:
      "Prepare model routing, fallback, cost attribution, provider review, and output boundaries before any live model path is exposed to buyers.",
    operatingControl:
      "Model choices, provider approvals, cost tags, failover design, prompt boundaries, output schemas, and human review rules stay in evidence-first planning.",
    evidence: ["TrustOS", "AgentOS", "continuous review", "model efficiency controls"],
    proofRoutes: ["/trust-os", "/agents", "/continuous-review-audit", "/public-market-readiness"],
    retainedBoundary:
      "Model gateway readiness does not approve production model calls, external provider processing, PHI use, or clinical validation.",
    nextAction:
      "Create a model-route register with provider, model class, allowed data, blocked data, eval set, cost owner, fallback, and approval status."
  },
  {
    slug: "agent-orchestration-human-approval",
    name: "Agent orchestration with human approval",
    status: "human-review-required",
    owner: "AgentOS, TrustOS, QA, clinical governance, and release stewardship",
    ambition:
      "Build agents that plan, route, inspect, and recommend while humans retain clinical, legal, financial, customer, and production decisions.",
    operatingControl:
      "Agents stay tied to scoped tools, approval states, QA packets, claim guards, runtime safety, audit trails, and blocked-action lists.",
    evidence: ["Agent registry", "QA claim guard", "QA activation seal", "runtime safety"],
    proofRoutes: ["/agents", "/qa-claim-guard", "/qa-activation-seal", "/workflows/runtime-safety"],
    retainedBoundary:
      "Agent orchestration readiness is not autonomous tool execution, live care authority, production remediation, or legal/financial advice.",
    nextAction:
      "Attach each agent to allowed tools, blocked tools, approval triggers, eval pack, escalation owner, and rollback or quarantine behavior."
  },
  {
    slug: "evidence-retrieval-intelligence",
    name: "Evidence retrieval and knowledge intelligence",
    status: "active-control-plane",
    owner: "Atlas, interoperability, TrustOS, source intelligence, and product",
    ambition:
      "Make every AI or operator answer trace back to evidence, source attribution, standards mapping, and safe no-PHI extraction rules.",
    operatingControl:
      "Trust Cards, source intelligence, health-record safety checks, interoperability conformance, and boundary routes keep retrieval inspectable.",
    evidence: ["Atlas Trust Cards", "source intelligence", "health records safety", "interoperability evaluations"],
    proofRoutes: ["/atlas", "/source-intelligence", "/health-records", "/interoperability/evaluations"],
    retainedBoundary:
      "Retrieval readiness is not clinical validation, payer submission approval, patient matching approval, or EHR writeback authority.",
    nextAction:
      "Link each generated or extracted claim to source class, evidence route, freshness need, confidence boundary, and reviewer requirement."
  },
  {
    slug: "platform-cost-margin-observability",
    name: "Platform cost, margin, and observability",
    status: "active-control-plane",
    owner: "Finance, platform operations, service reliability, and deal desk",
    ambition:
      "Protect margins while AI, API, storage, review, support, and evaluation workloads increase with enterprise pilots.",
    operatingControl:
      "Usage thresholds, model cost controls, route-level telemetry, support load review, price floors, and change-order triggers stay connected.",
    evidence: ["Enterprise Business Ops", "Enterprise Scalability", "Public Market Readiness", "Service Reliability"],
    proofRoutes: ["/enterprise-business-ops", "/enterprise-scalability", "/public-market-readiness", "/service-reliability"],
    retainedBoundary:
      "Cost observability improves margin discipline only; it is not a profit guarantee, audited financial report, or accounting advice.",
    nextAction:
      "Tie every premium API, UI workflow, and AI loop to usage ceiling, cost owner, margin floor, support assumption, and billing trigger."
  }
];

export const platformPowerControls: PlatformPowerControl[] = [
  {
    slug: "api-contract-register",
    control: "API contract register",
    status: "active-control-plane",
    owner: "Platform engineering + product",
    purpose:
      "Track route owner, schema, examples, version, auth posture, data boundary, and blocked claims for buyer-critical APIs.",
    requiredEvidence: ["route", "owner", "schema", "version", "auth posture", "boundary headers"],
    hardStops: ["route lacks owner", "schema missing", "boundary headers missing", "public API SLA implied"]
  },
  {
    slug: "api-versioning-deprecation",
    control: "API versioning and deprecation discipline",
    status: "human-review-required",
    owner: "Developer experience + release stewardship",
    purpose:
      "Prevent enterprise integrations from breaking silently as contracts mature from readiness to customer-specific use.",
    requiredEvidence: ["version policy", "change log", "migration path", "deprecation window", "buyer communication owner"],
    hardStops: ["breaking change unannounced", "migration path missing", "customer-specific approval missing"]
  },
  {
    slug: "tenant-auth-scope-review",
    control: "Tenant auth and scope review",
    status: "human-review-required",
    owner: "Security + tenant governance",
    purpose:
      "Ensure protected APIs require the right identity, tenant, role, AAL2 path, revocation rule, and no-PHI payload scope.",
    requiredEvidence: ["tenant owner", "role map", "AAL2 gate", "token handling", "revocation rule"],
    hardStops: ["PHI requested", "production credential requested", "AAL2 bypass attempted", "tenant owner missing"]
  },
  {
    slug: "idempotency-retry-contract",
    control: "Idempotency and retry contract",
    status: "active-control-plane",
    owner: "Runtime safety + QA",
    purpose:
      "Avoid duplicated work, duplicate proof packets, and uncontrolled retries when API or agent jobs are repeated.",
    requiredEvidence: ["idempotency key", "retry ceiling", "duplicate detection", "dead-letter owner", "manual remediation path"],
    hardStops: ["retry ceiling absent", "duplicate evidence risk", "dead-letter owner missing", "autonomous remediation implied"]
  },
  {
    slug: "rate-limit-abuse-control",
    control: "Rate limit and abuse control",
    status: "human-review-required",
    owner: "Platform + service reliability + security",
    purpose:
      "Prepare quotas, throttles, and abuse-response behavior before enterprise pilots expand traffic or expose premium endpoints.",
    requiredEvidence: ["route class", "quota", "burst limit", "abuse signal", "operator escalation path"],
    hardStops: ["unlimited usage promised", "abuse path missing", "contractual uptime implied", "support coverage implied"]
  },
  {
    slug: "ui-role-journey-control",
    control: "UI role journey control",
    status: "active-control-plane",
    owner: "Product Console + customer operations",
    purpose:
      "Make API, UI, AI, reliability, scale, business, and approval tasks discoverable by audience without requiring tribal knowledge.",
    requiredEvidence: ["primary nav link", "hub view", "product action", "role journey", "limitation link"],
    hardStops: ["route orphaned", "buyer-critical task hidden", "limitation path missing"]
  },
  {
    slug: "ui-quality-accessibility-review",
    control: "UI quality and accessibility review",
    status: "human-review-required",
    owner: "Frontend + QA + accessibility reviewer",
    purpose:
      "Keep enterprise UI layouts readable, navigable, responsive, and keyboard-reviewable before external demos or buyer training.",
    requiredEvidence: ["responsive route", "copy review", "keyboard path", "contrast review", "manual screenshot check"],
    hardStops: ["text overlap", "mobile route unusable", "accessibility certification claimed", "unreviewed external demo"]
  },
  {
    slug: "ai-model-route-register",
    control: "AI model-route register",
    status: "external-review-required",
    owner: "AI platform + TrustOS + security + finance",
    purpose:
      "Track provider, model, allowed data, blocked data, fallback, cost owner, eval pack, and approval status before model use expands.",
    requiredEvidence: ["provider", "model class", "allowed data", "blocked data", "fallback", "cost tag", "eval pack"],
    hardStops: ["PHI routed to model", "provider approval missing", "production model approval implied", "cost owner missing"]
  },
  {
    slug: "agent-tool-approval",
    control: "Agent tool approval and escalation",
    status: "human-review-required",
    owner: "AgentOS + TrustOS + QA",
    purpose:
      "Ensure agents recommend and route work without executing protected, clinical, financial, legal, customer, or production actions alone.",
    requiredEvidence: ["allowed tools", "blocked tools", "approval trigger", "escalation owner", "audit output"],
    hardStops: ["tool execution without approval", "clinical action requested", "contract or payment action requested", "production remediation requested"]
  },
  {
    slug: "ai-evaluation-red-team",
    control: "AI evaluation and red-team loop",
    status: "active-control-plane",
    owner: "Continuous review, QA, TrustOps, and internal research",
    purpose:
      "Convert repeated mistakes, hallucination risk, unsafe claims, and future AI research into eval sets, smoke checks, and controlled backlog.",
    requiredEvidence: ["eval set", "claims guard", "red-team prompt", "regression owner", "promotion rule"],
    hardStops: ["error-free AI claimed", "clinical validation claimed", "unsafe output untriaged", "public quantum claim made"]
  },
  {
    slug: "evidence-rag-source-attribution",
    control: "Evidence retrieval and source attribution",
    status: "active-control-plane",
    owner: "Atlas + source intelligence + interoperability",
    purpose:
      "Keep extracted data, summaries, and AI answers tied to source class, evidence route, freshness requirement, and reviewer boundary.",
    requiredEvidence: ["source class", "evidence route", "freshness check", "confidence boundary", "reviewer need"],
    hardStops: ["source missing", "PHI included", "clinical validation implied", "EHR writeback requested"]
  },
  {
    slug: "platform-cost-latency-observability",
    control: "Platform cost, latency, and quality observability",
    status: "active-control-plane",
    owner: "Service reliability + finance + platform operations",
    purpose:
      "Track API, UI, AI, evidence, review, support, and model-cost pressure before enterprise packages outgrow margins.",
    requiredEvidence: ["cost owner", "usage threshold", "latency target", "quality signal", "margin floor"],
    hardStops: ["profit guarantee claimed", "cost owner missing", "SLA implied", "support commitment unfunded"]
  }
];

export const platformPowerWorkstreams: PlatformPowerWorkstream[] = [
  {
    slug: "api-productization",
    name: "API productization and developer experience",
    owner: "Platform engineering + developer experience",
    objective:
      "Turn internal route handlers into an enterprise-ready contract catalog with owners, examples, version posture, boundaries, and future SDK handoff.",
    sequence: [
      "Classify buyer-critical APIs",
      "Attach owner, auth, schema, examples, version, and boundary headers",
      "Add contract smoke checks",
      "Prepare OpenAPI and SDK backlog"
    ],
    proofRoutes: ["/navigation", "/api/product/console", platformPowerApiRoute],
    retainedBoundary:
      "API productization does not launch a public API marketplace or create contractual SLA authority."
  },
  {
    slug: "ui-command-upgrade",
    name: "UI command and operator experience",
    owner: "Product Console + frontend + sales engineering",
    objective:
      "Make API, UI, AI, scale, reliability, business, and approval controls one click away for buyers, operators, and reviewers.",
    sequence: [
      "Add platform-power route to primary navigation",
      "Add hub and product console cards",
      "Add role journey and limitation-control entry",
      "Smoke-test route visibility"
    ],
    proofRoutes: ["/", "/hub", "/product", "/navigation"],
    retainedBoundary:
      "UI command upgrades do not certify accessibility, complete buyer training, or approve external release language."
  },
  {
    slug: "ai-orchestration-readiness",
    name: "AI orchestration and model-routing readiness",
    owner: "AI platform + TrustOS + security + finance",
    objective:
      "Prepare model routing, fallback, cost attribution, provider review, agent approval, and eval controls before live AI paths expand.",
    sequence: [
      "Define model-route register",
      "Attach allowed data and blocked data",
      "Map approval and fallback paths",
      "Attach eval and cost owner"
    ],
    proofRoutes: ["/trust-os", "/agents", "/continuous-review-audit", platformPowerRoute],
    retainedBoundary:
      "AI orchestration readiness is not live autonomous AI, PHI model processing, production model approval, or model-safety certification."
  },
  {
    slug: "evidence-intelligence",
    name: "Evidence intelligence and retrieval discipline",
    owner: "Atlas + interoperability + health-records safety",
    objective:
      "Ensure AI and operator outputs can cite source class, proof route, standards mapping, freshness, and reviewer boundaries.",
    sequence: [
      "Classify source",
      "Attach evidence route",
      "Run no-PHI safety check",
      "Assign reviewer or retained gate"
    ],
    proofRoutes: ["/atlas", "/source-intelligence", "/health-records", "/interoperability"],
    retainedBoundary:
      "Evidence intelligence does not approve patient matching, payer submission, clinical decisions, or EHR writeback."
  },
  {
    slug: "agent-eval-red-team",
    name: "Agent evaluation, red-team, and approval workflow",
    owner: "QA + TrustOps + internal research team",
    objective:
      "Turn agent failures, hallucination pressure, unsafe claims, and future research into deterministic tests and human escalation.",
    sequence: [
      "Capture failure pattern",
      "Add eval or smoke assertion",
      "Route high-risk cases to human owner",
      "Update claim guard and blocked-action list"
    ],
    proofRoutes: ["/continuous-review-audit", "/qa-claim-guard", "/qa-activation-seal", "/qa-buyer-proof-release"],
    retainedBoundary:
      "Agent evaluation does not claim error-free AI, clinical validation, autonomous remediation, or public quantum capability."
  },
  {
    slug: "platform-margin-telemetry",
    name: "Platform margin, telemetry, and scale economics",
    owner: "Finance + platform operations + service reliability",
    objective:
      "Tie API, UI, AI, support, review, and storage costs to pricing, package scope, and enterprise scale readiness.",
    sequence: [
      "Assign cost owner",
      "Define usage ceiling",
      "Attach latency and quality signal",
      "Route price-floor and change-order triggers"
    ],
    proofRoutes: ["/enterprise-business-ops", "/enterprise-scalability", "/public-market-readiness", "/service-reliability"],
    retainedBoundary:
      "Telemetry and margin discipline are not audited financial reporting, accounting advice, or profit guarantees."
  },
  {
    slug: "external-review-readiness",
    name: "External review and certification readiness",
    owner: "Legal, security, privacy, accessibility, clinical governance, and regional counsel",
    objective:
      "Prepare the API, UI, and AI evidence needed for future security, accessibility, privacy, AI governance, clinical, and regional reviews.",
    sequence: [
      "Identify required review authority",
      "Map evidence pack",
      "Retain blocked claims",
      "Escalate before external commitments"
    ],
    proofRoutes: ["/approvals-readiness", "/global-certification-readiness", "/boundary-resolution", platformPowerRoute],
    retainedBoundary:
      "Review readiness is not certification, conformity, legal approval, clinical authority, or public-sector approval."
  }
];

export const platformPowerCadences: PlatformPowerCadence[] = [
  {
    cadence: "Daily API contract and boundary review",
    owner: "Platform engineering + release steward",
    reviewedSignals: ["new route", "schema drift", "boundary header", "auth posture", "public smoke"],
    decisionOutput:
      "Promote, hold, or route the API to owner review before public or buyer-facing language expands.",
    hardStops: ["owner missing", "schema missing", "PHI allowed", "public API SLA implied"]
  },
  {
    cadence: "Daily UI command-path scan",
    owner: "Product Console + customer operations",
    reviewedSignals: ["role journey", "primary nav", "hub view", "product action", "limitation path"],
    decisionOutput:
      "Keep high-value workflows discoverable and remove navigation dead ends before demos.",
    hardStops: ["route orphaned", "text overlap", "buyer-critical path hidden", "limitation path missing"]
  },
  {
    cadence: "Daily AI safety and eval queue",
    owner: "Continuous review + TrustOS + QA",
    reviewedSignals: ["unsafe output", "hallucination pressure", "claim drift", "tool request", "eval failure"],
    decisionOutput:
      "Route to eval, claim guard, owner review, or blocked-action update.",
    hardStops: ["error-free AI claimed", "clinical validation implied", "tool execution without approval"]
  },
  {
    cadence: "Weekly model-route and provider review",
    owner: "AI platform + security + finance",
    reviewedSignals: ["provider", "model", "allowed data", "fallback", "cost tag", "approval status"],
    decisionOutput:
      "Approve for sandbox planning, hold for external review, or block for PHI/production use.",
    hardStops: ["PHI route", "provider approval missing", "production model approval implied", "cost owner missing"]
  },
  {
    cadence: "Weekly design and accessibility readiness",
    owner: "Frontend + QA + accessibility reviewer",
    reviewedSignals: ["responsive route", "keyboard path", "contrast", "copy length", "demo readiness"],
    decisionOutput:
      "Mark UI route ready for demo, route to cleanup, or hold external use.",
    hardStops: ["accessibility certified claimed", "mobile route unusable", "keyboard path missing"]
  },
  {
    cadence: "Monthly platform margin and scale council",
    owner: "Finance + platform operations + deal desk",
    reviewedSignals: ["model cost", "support load", "latency", "usage ceiling", "margin floor", "change order"],
    decisionOutput:
      "Update packaging, pricing, limits, support assumptions, and enterprise scale workstreams.",
    hardStops: ["profit guarantee claimed", "unfunded support promise", "SLA implied", "usage ceiling missing"]
  }
];

export const platformPowerBottlenecks: PlatformPowerBottleneck[] = [
  {
    slug: "api-contracts-not-yet-openapi",
    name: "API contracts are typed but not yet exported as OpenAPI or SDKs",
    status: "human-review-required",
    impact:
      "Enterprise technical buyers can inspect live JSON and brief endpoints, but developer adoption will remain slower until formal contracts, examples, and SDK packaging exist.",
    workaround:
      "Use route summaries, smoke-tested JSON, boundary headers, and markdown briefs as the interim contract packet.",
    graduationGate:
      "OpenAPI spec, examples, auth model, rate limits, SDK backlog, version policy, and developer docs are reviewed.",
    owner: "Platform engineering + developer experience",
    proofRoutes: [platformPowerRoute, "/navigation", "/api/product/console"]
  },
  {
    slug: "live-ai-not-enabled",
    name: "Live AI model execution remains intentionally gated",
    status: "external-review-required",
    impact:
      "The AI posture can be evaluated through architecture, agents, evals, and synthetic proof, but production model calls need provider, privacy, safety, cost, and legal review.",
    workaround:
      "Use deterministic synthetic summaries, model-route registers, eval design, TrustOS checks, and human approval packets.",
    graduationGate:
      "Approved model provider, allowed data class, eval pass criteria, monitoring, human approval flow, and customer-specific authority exist.",
    owner: "AI platform + TrustOS + security + finance",
    proofRoutes: ["/trust-os", "/agents", "/continuous-review-audit", platformPowerRoute]
  },
  {
    slug: "accessibility-certification-not-complete",
    name: "Accessibility certification is not complete",
    status: "external-review-required",
    impact:
      "The UI can be improved continuously, but enterprise procurement may require formal WCAG, VPAT, or Section 508 review before certain buyer claims.",
    workaround:
      "Run manual UI quality checks, keep layouts stable, avoid text overlap, expose role navigation, and retain accessibility review as a named gate.",
    graduationGate:
      "Qualified accessibility review, remediation evidence, VPAT or equivalent artifact, and approved external claims.",
    owner: "Frontend + accessibility reviewer + legal ops",
    proofRoutes: [platformPowerRoute, "/navigation", "/product"]
  },
  {
    slug: "public-api-rate-limits-not-contracted",
    name: "Public API rate limits are readiness targets, not contracted terms",
    status: "human-review-required",
    impact:
      "SCRIMED can scope route classes and quotas, but it cannot imply unlimited use, contractual uptime, or managed service coverage.",
    workaround:
      "State route class, draft quota, throttle behavior, support assumption, and no-SLA boundary on enterprise packets.",
    graduationGate:
      "Contract, staffing, monitoring, incident response, support tier, and executive approval define the exact commitment.",
    owner: "Platform + legal ops + customer operations",
    proofRoutes: [platformPowerRoute, "/enterprise-scalability", "/service-reliability"]
  },
  {
    slug: "agent-tool-approval-needs-production-runtime",
    name: "Agent tool approval needs production runtime approval",
    status: "human-review-required",
    impact:
      "Agents can be described, evaluated, and routed, but protected actions need approval states, audit logging, and fail-closed runtime behavior.",
    workaround:
      "Use agent registry, QA packets, claim guard, human approval rules, and protected workspace evidence before any execution claim.",
    graduationGate:
      "Approved tool schemas, human approval UI, audit persistence, rollback behavior, and customer-specific authority.",
    owner: "AgentOS + QA + platform engineering",
    proofRoutes: ["/agents", "/qa-claim-guard", "/qa-manual-execution-console", platformPowerRoute]
  },
  {
    slug: "evidence-rag-still-synthetic",
    name: "Evidence retrieval remains synthetic and metadata-only",
    status: "blocked-before-approval",
    impact:
      "SCRIMED can demonstrate source attribution, extraction planning, and Trust Cards without ingesting live PHI or protected medical records.",
    workaround:
      "Use synthetic fixtures, no-PHI examples, source classes, external evidence references, and health-record safety gates.",
    graduationGate:
      "PHI authority, customer environment, BAA/DPA if required, security review, connector approval, and clinical governance approval.",
    owner: "Atlas + interoperability + privacy + clinical governance",
    proofRoutes: ["/atlas", "/health-records", "/interoperability", "/boundary-resolution"]
  },
  {
    slug: "trillion-scale-positioning-boundary",
    name: "Trillion-dollar-scale positioning must stay evidence-based",
    status: "human-review-required",
    impact:
      "The platform can be designed with world-class discipline, but SCRIMED cannot claim equivalent scale, staffing, certifications, or infrastructure until evidence exists.",
    workaround:
      "Frame the product as enterprise-grade readiness with explicit proof routes, operating controls, and retained external gates.",
    graduationGate:
      "Audited scale evidence, customer proof, security certifications, support operations, incident history, financial controls, and qualified release approval.",
    owner: "Founder + product + legal + finance + platform",
    proofRoutes: [platformPowerRoute, "/enterprise-scalability", "/enterprise-business-ops", "/public-market-readiness"]
  }
];

export const platformPowerRecommendedOperatingPath = [
  "Classify every API, UI, and AI improvement by buyer value, authority boundary, owner, and proof route.",
  "Promote buyer-critical APIs into a contract register with versioning, schema, boundary headers, auth posture, examples, and smoke checks.",
  "Keep UI upgrades role-based and operator-grade: primary nav, hub view, product action, journey, limitation route, and proof stack.",
  "Keep AI paths in readiness mode until model provider, allowed data, evals, cost owner, monitoring, and human approval are approved.",
  "Route PHI, EHR, clinical, legal, finance, security certification, accessibility certification, SLA, and trillion-scale claims to Boundary Resolution before external use.",
  "Attach cost, latency, quality, support, and margin controls to every premium platform capability before enterprise packages expand."
];

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function markdownItems(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

export function getPlatformPowerSummary() {
  const proofRoutes = unique([
    ...platformPowerPillars.flatMap((pillar) => pillar.proofRoutes),
    ...platformPowerWorkstreams.flatMap((workstream) => workstream.proofRoutes),
    ...platformPowerBottlenecks.flatMap((bottleneck) => bottleneck.proofRoutes),
    platformPowerRoute,
    platformPowerApiRoute,
    platformPowerBriefRoute
  ]);
  const hardStops = unique([
    ...platformPowerControls.flatMap((control) => control.hardStops),
    ...platformPowerCadences.flatMap((cadence) => cadence.hardStops)
  ]);
  const owners = unique([
    ...platformPowerPillars.map((pillar) => pillar.owner),
    ...platformPowerControls.map((control) => control.owner),
    ...platformPowerWorkstreams.map((workstream) => workstream.owner),
    ...platformPowerCadences.map((cadence) => cadence.owner),
    ...platformPowerBottlenecks.map((bottleneck) => bottleneck.owner)
  ]);
  const openBottleneckCount = platformPowerBottlenecks.filter(
    (bottleneck) => bottleneck.status !== "active-control-plane"
  ).length;
  const externalReviewCount = [
    ...platformPowerPillars,
    ...platformPowerControls,
    ...platformPowerBottlenecks
  ].filter((item) => item.status === "external-review-required").length;
  const humanReviewCount = [
    ...platformPowerPillars,
    ...platformPowerControls,
    ...platformPowerBottlenecks
  ].filter((item) => item.status === "human-review-required").length;

  return {
    service: "scrimed-api-ui-ai-platform-power",
    route: platformPowerRoute,
    apiRoute: platformPowerApiRoute,
    briefRoute: platformPowerBriefRoute,
    status: platformPowerStatus,
    briefStatus: platformPowerBriefStatus,
    updated: platformPowerUpdatedAt,
    boundary: platformPowerBoundary,
    authority: {
      apiAuthority: "contract-readiness-not-public-api-sla",
      uiAuthority: "operator-interface-readiness-not-accessibility-certification",
      aiAuthority: "no-live-autonomous-ai-authority",
      modelAuthority: "not-production-model-routing-approved",
      agentAuthority: "human-approval-required-for-protected-actions",
      dataBoundary: "synthetic-business-and-metadata-only",
      phiAuthority: "not-authorized-production-phi",
      clinicalCareAuthority: "not-authorized-live-care",
      connectorAuthority: "not-production-connector-approved",
      securityCertification: "not-security-certified",
      slaAuthority: "not-contractual-sla",
      trillionScaleAuthority: "aspirational-design-not-scale-equivalence"
    },
    pillarCount: platformPowerPillars.length,
    controlCount: platformPowerControls.length,
    workstreamCount: platformPowerWorkstreams.length,
    cadenceCount: platformPowerCadences.length,
    bottleneckCount: platformPowerBottlenecks.length,
    openBottleneckCount,
    humanReviewCount,
    externalReviewCount,
    proofRouteCount: proofRoutes.length,
    hardStopCount: hardStops.length,
    ownerCount: owners.length,
    blockedClaimCount: platformPowerBlockedClaims.length,
    pillars: platformPowerPillars,
    controls: platformPowerControls,
    workstreams: platformPowerWorkstreams,
    cadences: platformPowerCadences,
    bottlenecks: platformPowerBottlenecks,
    blockedClaims: platformPowerBlockedClaims,
    proofRoutes,
    hardStops,
    owners,
    recommendedOperatingPath: platformPowerRecommendedOperatingPath,
    nextBuildStep:
      "Convert Platform Power into a contract-backed operating system: API contract register, role-based UI command paths, model-route register, agent approval workflow, evidence retrieval map, eval/red-team queue, accessibility review checklist, and cost/margin telemetry before external claims expand."
  };
}

export function buildPlatformPowerBrief() {
  const summary = getPlatformPowerSummary();

  return [
    "# SCRIMED Platform Power Operations Brief",
    "",
    `Status: ${summary.status}`,
    `Updated: ${summary.updated}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Authority",
    `- API authority: ${summary.authority.apiAuthority}`,
    `- UI authority: ${summary.authority.uiAuthority}`,
    `- AI authority: ${summary.authority.aiAuthority}`,
    `- Model authority: ${summary.authority.modelAuthority}`,
    `- Agent authority: ${summary.authority.agentAuthority}`,
    `- Data boundary: ${summary.authority.dataBoundary}`,
    `- PHI authority: ${summary.authority.phiAuthority}`,
    `- Clinical care authority: ${summary.authority.clinicalCareAuthority}`,
    `- Connector authority: ${summary.authority.connectorAuthority}`,
    `- Security certification: ${summary.authority.securityCertification}`,
    `- SLA authority: ${summary.authority.slaAuthority}`,
    `- Trillion-scale authority: ${summary.authority.trillionScaleAuthority}`,
    "",
    "## Counts",
    `- Pillars: ${summary.pillarCount}`,
    `- Controls: ${summary.controlCount}`,
    `- Workstreams: ${summary.workstreamCount}`,
    `- Cadences: ${summary.cadenceCount}`,
    `- Bottlenecks: ${summary.bottleneckCount}`,
    `- Open bottlenecks: ${summary.openBottleneckCount}`,
    `- Proof routes: ${summary.proofRouteCount}`,
    `- Hard stops: ${summary.hardStopCount}`,
    `- Blocked claims: ${summary.blockedClaimCount}`,
    "",
    "## Operating Path",
    markdownItems(summary.recommendedOperatingPath),
    "",
    "## Pillars",
    summary.pillars
      .map(
        (pillar) =>
          `- ${pillar.name} (${pillar.status}): ${pillar.ambition} Control: ${pillar.operatingControl} Boundary: ${pillar.retainedBoundary}`
      )
      .join("\n"),
    "",
    "## Controls",
    summary.controls
      .map(
        (control) =>
          `- ${control.control} (${control.status}): ${control.purpose} Evidence: ${control.requiredEvidence.join(", ")} Hard stops: ${control.hardStops.join(", ")}`
      )
      .join("\n"),
    "",
    "## Bottlenecks",
    summary.bottlenecks
      .map(
        (bottleneck) =>
          `- ${bottleneck.name} (${bottleneck.status}): ${bottleneck.impact} Workaround: ${bottleneck.workaround} Gate: ${bottleneck.graduationGate}`
      )
      .join("\n"),
    "",
    "## Blocked Claims",
    markdownItems(summary.blockedClaims),
    "",
    "## Next Build Step",
    summary.nextBuildStep,
    ""
  ].join("\n");
}
