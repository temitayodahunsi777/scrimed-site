import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import { getScrimedSecurityAssuranceSummary } from "./scrimedSecurityAssurancePipeline";
import { getScrimedSecurityDiligenceEvidenceSummary } from "./scrimedSecurityDiligenceEvidence";
import { getScrimedSecurityReleaseReadinessSummary } from "./scrimedSecurityReleaseReadiness";
import { scrimedSafetyPolicyVersion } from "./scrimedSafetyGovernance";

export type ScrimedCyberDefenseControlStatus =
  | "enforced"
  | "monitored"
  | "planned_external_dependency"
  | "blocked_until_authorized";

export type ScrimedCyberDefenseRiskLevel = "low" | "moderate" | "high" | "critical";

export type ScrimedCyberDefenseControl = {
  id: string;
  name: string;
  category:
    | "browser_surface"
    | "request_sanitization"
    | "auth_rbac"
    | "api_abuse"
    | "secret_protection"
    | "phi_safety"
    | "supply_chain"
    | "incident_response"
    | "auditability";
  status: ScrimedCyberDefenseControlStatus;
  enforcement: string;
  evidence: string[];
  protectedAssets: string[];
  verification: string;
  retainedBoundary: string;
};

export type ScrimedCyberDefenseThreat = {
  id: string;
  name: string;
  riskLevel: ScrimedCyberDefenseRiskLevel;
  attackSurface: string;
  currentMitigation: string;
  detectionSignal: string;
  escalationPath: string;
  residualRisk: string;
};

export type ScrimedIncidentReadinessLane = {
  id: string;
  name: string;
  owner: string;
  trigger: string;
  firstResponse: string;
  evidenceRoute: string;
  retainedBoundary: string;
};

export type ScrimedCyberDefenseBuyerDiligenceStatus =
  | "ready_to_share"
  | "manual_operator_required"
  | "external_evidence_required"
  | "blocked_until_approved";

export type ScrimedCyberDefenseBuyerDiligenceCard = {
  id: string;
  title: string;
  category:
    | "identity_access"
    | "token_secret_protection"
    | "protected_route_boundary"
    | "data_boundary"
    | "request_sanitization"
    | "api_abuse_cost_guardrail"
    | "incident_response"
    | "release_governance"
    | "vendor_connector_readiness";
  buyerQuestion: string;
  currentAnswer: string;
  evidenceRoutes: string[];
  controlSummary: string;
  implementationStatus: ScrimedCyberDefenseBuyerDiligenceStatus;
  residualRisk: string;
  owner: string;
  reviewCadence: string;
  requiredNextEvidence: string;
  blockedClaims: string[];
  humanReviewRequired: true;
  syntheticOnly: true;
  auditHash: string;
};

export type ScrimedCyberDefenseScorecard = {
  enforcedControlCount: number;
  monitoredControlCount: number;
  plannedControlCount: number;
  criticalThreatCount: number;
  highThreatCount: number;
  buyerDiligenceCardCount: number;
  buyerDiligenceReadyCount: number;
  externalEvidenceGapCount: number;
  noPhiBoundary: boolean;
  noCertificationClaim: boolean;
  summary: string;
  auditHash: string;
};

export const scrimedCyberDefenseApiRoute = "/api/scrimed-cyber-defense";
export const scrimedCyberDefensePageRoute = "/scrimed-cyber-defense";
export const scrimedCyberDefenseStatus = "scrimed-cyber-defense-active-no-secrets-no-phi";
export const scrimedCyberDefenseBoundary =
  "SCRIMED Cyber Defense Command Center is a synthetic/no-PHI security-readiness and control-monitoring layer. It does not claim security certification, HIPAA compliance, SOC 2, HITRUST, penetration-test completion, breach immunity, PHI authority, production connector approval, or customer go-live.";

const retainedBoundary =
  "No PHI, no production credentials, no raw connector payloads, no customer go-live approval, no production connector approval, no security certification claim, and no breach guarantee.";

export const scrimedCyberDefenseControls: ScrimedCyberDefenseControl[] = [
  {
    id: "securityHeaders",
    name: "Global browser security headers",
    category: "browser_surface",
    status: "enforced",
    enforcement:
      "Next.js response headers enforce CSP, frame denial, MIME sniffing prevention, referrer limits, HSTS, CORP, COOP, Origin-Agent-Cluster, and restricted browser permissions.",
    evidence: ["next.config.js", "npm run build", "npm run smoke:public"],
    protectedAssets: ["public app routes", "investor/buyer surfaces", "synthetic readiness APIs"],
    verification: "Contract check verifies hardened headers stay present.",
    retainedBoundary
  },
  {
    id: "proxyHeaderSanitizer",
    name: "Proxy request-header sanitizer",
    category: "request_sanitization",
    status: "enforced",
    enforcement:
      "Next proxy strips middleware-bypass, debug-token, API-key, and forwarded token headers before App Router handlers receive requests.",
    evidence: ["proxy.ts", "npm run smoke:scrimed-cyber-defense"],
    protectedAssets: ["all non-static routes", "protected AAL2 APIs", "public diligence routes"],
    verification: "Contract check requires x-middleware-subrequest stripping and proxy guard headers.",
    retainedBoundary
  },
  {
    id: "protectedFailClosed",
    name: "Protected APIs fail closed",
    category: "auth_rbac",
    status: "monitored",
    enforcement:
      "Protected durable-store and buyer evidence paths require authorized AAL2 bearer context and return fail-closed responses without valid sessions.",
    evidence: ["scripts/execution-attempt-durable-store-authenticated-smoke.mjs", "scripts/aal2-token-policy-selftest.mjs"],
    protectedAssets: ["execution attempt evidence", "boundary release evidence", "tenant-scoped pilot workspaces"],
    verification: "Nonsecret suite runs missing-token and policy checks without logging tokens.",
    retainedBoundary
  },
  {
    id: "rateLimitControls",
    name: "Cost and API abuse guardrails",
    category: "api_abuse",
    status: "monitored",
    enforcement:
      "Request counting, cost guardrail metadata, provider-call kill switch defaults, and safe synthetic limits constrain high-volume abuse paths.",
    evidence: ["app/lib/requestRateLimit.ts", "app/lib/costApiGuardrails.ts", "docs/RISK_REGISTER.md"],
    protectedAssets: ["model-router budget", "public APIs", "synthetic evaluation endpoints"],
    verification: "Readiness contracts keep provider calls disabled by default unless explicitly configured.",
    retainedBoundary
  },
  {
    id: "secretRedaction",
    name: "Token and secret redaction",
    category: "secret_protection",
    status: "enforced",
    enforcement:
      "Bearer-token helper, smoke paths, and policy tests use fingerprints and redaction rather than writing or logging full credentials.",
    evidence: ["scripts/aal2-bearer-token-helper.mjs", "scripts/lib/aal2-token-policy.mjs"],
    protectedAssets: ["AAL2 bearer tokens", "Supabase sessions", "local .env.local"],
    verification: "Nonsecret suite clears token env vars and validates local helper behavior without exposing secrets.",
    retainedBoundary
  },
  {
    id: "safetyGovernance",
    name: "PHI and clinical authority safety gate",
    category: "phi_safety",
    status: "enforced",
    enforcement:
      "Central safety gate blocks live PHI, final clinical decision authority, treatment, prescribing, outreach, payer submission, EHR writeback, connector approval, and certification claims.",
    evidence: ["app/lib/scrimedSafetyGovernance.ts", "app/api/scrimed-cyber-defense/route.ts"],
    protectedAssets: ["clinical-facing copy", "AI workflow APIs", "public diligence materials"],
    verification: "API route evaluates safety governance before returning cyber-defense metadata.",
    retainedBoundary
  },
  {
    id: "noSecretTestSuite",
    name: "No-secret regression suite",
    category: "supply_chain",
    status: "enforced",
    enforcement:
      "Nonsecret test runner clears bearer-token environment variables and validates generated-integrity, safety, AAL2, and SCRIMED control contracts.",
    evidence: ["scripts/scrimed-nonsecret-test-suite.mjs", "scripts/check-generated-integrity.mjs"],
    protectedAssets: ["CI quality gates", "source tree integrity", "nonsecret developer workflows"],
    verification: "npm run test:nonsecret runs the cyber-defense contract with credentials blanked.",
    retainedBoundary
  },
  {
    id: "securityAssurancePipeline",
    name: "Security assurance pipeline",
    category: "supply_chain",
    status: "enforced",
    enforcement:
      "A no-secret assurance contract checks hardening headers, proxy sanitization, forbidden claims, token-like leaks, route wiring, and retained authority boundaries.",
    evidence: ["app/lib/scrimedSecurityAssurancePipeline.ts", "scripts/scrimed-security-assurance-contract-check.mjs"],
    protectedAssets: ["source code", "docs", "scripts", "public cyber route", "nonsecret CI gates"],
    verification: "npm run security:assurance and npm run test:nonsecret keep the assurance gate active.",
    retainedBoundary
  },
  {
    id: "incidentReadiness",
    name: "Incident response readiness lanes",
    category: "incident_response",
    status: "planned_external_dependency",
    enforcement:
      "Incident lanes define first response for token leakage, suspicious agent action, PHI exposure risk, dependency alert, and public-route abuse.",
    evidence: ["docs/scrimed-cyber-defense.md", "/scrimed-cyber-defense"],
    protectedAssets: ["operators", "buyers", "evidence routes", "future PHI programs"],
    verification: "Requires external owner assignment, SIEM/log drain setup, and tabletop exercise before production PHI authority.",
    retainedBoundary
  }
];

export const scrimedCyberDefenseThreatMatrix: ScrimedCyberDefenseThreat[] = [
  {
    id: "promptInjectionToolMisuse",
    name: "Prompt injection and tool misuse",
    riskLevel: "high",
    attackSurface: "Untrusted content, future RAG sources, agent tool calls, MCP connectors.",
    currentMitigation: "Safety governance, scoped tool registries, human review, no direct LLM-to-record-system authority.",
    detectionSignal: "Unexpected tool request, missing citation, untrusted source escalation, denied policy decision.",
    escalationPath: "Pause automation, route to security lead and clinical governance, convert trace into regression test.",
    residualRisk: "Future live connectors require external penetration testing, red-team evaluation, and customer-specific policy review."
  },
  {
    id: "credentialLeakage",
    name: "Credential or bearer-token leakage",
    riskLevel: "critical",
    attackSurface: "Local terminals, browser console, protected smoke tests, environment files, logs.",
    currentMitigation: "Token helper stores only local env state with restricted mode, redacts fingerprints, proxy strips token-like debug headers.",
    detectionSignal: "Token-like value in logs, invalid/expired token preflight, suspicious forwarded auth header.",
    escalationPath: "Clear clipboard, rotate token/session, revoke compromised session, rerun nonsecret suite.",
    residualRisk: "Production secret rotation playbooks and managed secrets scanning must be externally operated."
  },
  {
    id: "phiExposure",
    name: "PHI exposure before approval",
    riskLevel: "critical",
    attackSurface: "Synthetic demos, future import pipelines, user pasted text, connector payloads.",
    currentMitigation: "No-PHI boundary, PHI pattern classification, no raw connector payload logging, safety gate blocks live PHI.",
    detectionSignal: "PHI pattern match, live-patient wording, raw payload attempt, connector write request.",
    escalationPath: "Block request, isolate artifact, require privacy/security review, document root cause.",
    residualRisk: "Live PHI authority requires BAA, privacy program, logging controls, retention policy, and customer-specific approval."
  },
  {
    id: "middlewareBypass",
    name: "Middleware/proxy bypass header abuse",
    riskLevel: "high",
    attackSurface: "Inbound HTTP headers and reverse-proxy forwarding behavior.",
    currentMitigation: "Proxy strips x-middleware-subrequest and debug-token headers and labels sanitized responses.",
    detectionSignal: "X-SCRIMED-Middleware-Bypass-Header response value shows stripped.",
    escalationPath: "Inspect upstream proxy, add WAF rule, verify protected routes still fail closed.",
    residualRisk: "External WAF enforcement and platform log correlation remain deployment tasks."
  },
  {
    id: "costSpikeApiAbuse",
    name: "API abuse and model-cost spike",
    riskLevel: "high",
    attackSurface: "Public APIs, synthetic evaluation routes, model-router scaffolds, future provider calls.",
    currentMitigation: "Provider calls disabled by default, cost guardrails, rate-limit metadata, no-secret tests.",
    detectionSignal: "Request-count threshold, cost threshold, repeated synthetic-eval calls, provider-call kill switch.",
    escalationPath: "Return safe error, enable stricter route limits, review source IP and tenant context.",
    residualRisk: "Production-grade WAF, bot rules, and billing anomaly alerts require hosting-provider configuration."
  },
  {
    id: "supplyChainDependency",
    name: "Supply-chain and generated artifact drift",
    riskLevel: "moderate",
    attackSurface: "Node dependencies, generated .next artifacts, build cache, package overrides.",
    currentMitigation: "Generated integrity check, lockfile discipline, audit-ready dependency structure, no generated duplicate suffixes.",
    detectionSignal: "Integrity check failure, npm audit finding, unexpected generated duplicate.",
    escalationPath: "Clean generated cache, review dependency advisory, patch or pin safely.",
    residualRisk: "SBOM signing and external dependency scanning should be added before regulated deployment."
  }
];

export const scrimedCyberIncidentReadiness: ScrimedIncidentReadinessLane[] = [
  {
    id: "token-leakage",
    name: "Token leakage response",
    owner: "Security lead + Workspace owner",
    trigger: "Credential-like value appears in output, logs, screenshot, chat, or forwarded header.",
    firstResponse: "Revoke session, rotate credential, clear clipboard, verify .env.local permissions, rerun token policy self-test.",
    evidenceRoute: "/qa-aal2-run-evidence",
    retainedBoundary
  },
  {
    id: "protected-route-abuse",
    name: "Protected route abuse response",
    owner: "Platform reliability + Security lead",
    trigger: "Protected AAL2 route receives unauthenticated, malformed, repeated, or unexpected-role access.",
    firstResponse: "Confirm fail-closed status, inspect sanitized headers, rate-limit source, preserve metadata-only evidence.",
    evidenceRoute: "/workflows/execution-attempts",
    retainedBoundary
  },
  {
    id: "phi-exposure-risk",
    name: "PHI exposure risk response",
    owner: "Privacy lead + Clinical governance",
    trigger: "Potential live PHI or raw connector payload is submitted to a no-PHI SCRIMED path.",
    firstResponse: "Block workflow, avoid echoing content, preserve only metadata, start privacy review, update regression case.",
    evidenceRoute: "/health-records",
    retainedBoundary
  },
  {
    id: "public-route-abuse",
    name: "Public route abuse response",
    owner: "Release steward + Infrastructure owner",
    trigger: "Traffic spike, abnormal request pattern, bot pressure, or suspicious security header probe.",
    firstResponse: "Enable stricter public rate limits, add WAF rule, run public smoke, verify headers and no-go boundaries.",
    evidenceRoute: "/release-continuity",
    retainedBoundary
  }
];

const sharedBlockedClaims = [
  "No security certification assertion.",
  "No breach immunity assertion.",
  "No live PHI authority.",
  "No customer go-live authority.",
  "No production connector approval.",
  "No autonomous clinical authority."
];

const rawBuyerDiligenceCards: Array<Omit<ScrimedCyberDefenseBuyerDiligenceCard, "auditHash">> = [
  {
    id: "identity-access-aal2-rbac-card",
    title: "AAL2 and role-scoped operator access",
    category: "identity_access",
    buyerQuestion: "How does SCRIMED constrain protected operator and evidence workflows?",
    currentAnswer:
      "Protected AAL2 flows are designed to fail closed without authorized tenant-admin, pilot-lead, or reviewer context, and happy-path writes require a short-lived authorized bearer session.",
    evidenceRoutes: ["/qa-aal2-run-evidence", "/api/scrimed-cyber-defense/evidence-packet"],
    controlSummary:
      "Role-scoped access, short-lived bearer-token handling, token fingerprints, local .env.local storage, and strict no-token logging rules are kept separate from public metadata surfaces.",
    implementationStatus: "manual_operator_required",
    residualRisk: "Customer SSO, SCIM, emergency access, and tenant-specific access review evidence remain deployment-specific work.",
    owner: "Security lead + tenant administrator",
    reviewCadence: "Before each protected no-PHI pilot evidence run.",
    requiredNextEvidence: "Run strict AAL2 durable-store smoke with an authorized role and attach only the redacted token fingerprint result.",
    blockedClaims: sharedBlockedClaims,
    humanReviewRequired: true,
    syntheticOnly: true
  },
  {
    id: "token-secret-protection-card",
    title: "Token, secret, and credential exposure controls",
    category: "token_secret_protection",
    buyerQuestion: "How does SCRIMED avoid exposing credentials during demos, smokes, and buyer evidence review?",
    currentAnswer:
      "No-secret tests, AAL2 helper redaction, token fingerprinting, clipboard cleanup support, and forbidden-claim checks keep credentials out of source, logs, docs, and chat output.",
    evidenceRoutes: ["scripts/aal2-bearer-token-helper.mjs", "scripts/lib/aal2-token-policy.mjs", "npm run test:nonsecret"],
    controlSummary:
      "Credential-like values are represented as fingerprints or policy decisions; full tokens, Supabase sessions, service role keys, and connector payloads must not be shared.",
    implementationStatus: "ready_to_share",
    residualRisk: "Managed secrets scanning and production secret rotation still require external CI/platform configuration.",
    owner: "Platform security",
    reviewCadence: "Every release candidate and before any protected smoke evidence is shared.",
    requiredNextEvidence: "Attach managed secret-scan output and rotation runbook metadata before PHI-bearing review.",
    blockedClaims: sharedBlockedClaims,
    humanReviewRequired: true,
    syntheticOnly: true
  },
  {
    id: "protected-route-boundary-card",
    title: "Protected route fail-closed posture",
    category: "protected_route_boundary",
    buyerQuestion: "Do protected APIs fail closed when authentication, AAL2, tenant context, or role checks are missing?",
    currentAnswer:
      "Protected durable-store and evidence flows return fail-closed responses without valid authorized context, while public buyer surfaces expose metadata-only readiness.",
    evidenceRoutes: ["/api/workflows/execution-attempts/durable-store", "npm run smoke:execution-attempt-durable-store"],
    controlSummary:
      "Route-level checks keep protected writes separate from public evidence pages, and unauthenticated paths stay unavailable until explicit authorized context exists.",
    implementationStatus: "ready_to_share",
    residualRisk: "Production authorization evidence still needs customer identity-provider integration and deployment logs.",
    owner: "Platform reliability + security",
    reviewCadence: "Every protected-route change.",
    requiredNextEvidence: "Attach customer-specific protected-route access review after SSO/RBAC configuration.",
    blockedClaims: sharedBlockedClaims,
    humanReviewRequired: true,
    syntheticOnly: true
  },
  {
    id: "data-boundary-no-phi-card",
    title: "No-PHI and raw-payload boundary",
    category: "data_boundary",
    buyerQuestion: "What prevents synthetic diligence routes from becoming live PHI processing paths?",
    currentAnswer:
      "Safety governance, explicit no-PHI headers, no raw connector payload logging, and retained no-go boundaries keep current routes metadata-only and synthetic-only.",
    evidenceRoutes: ["/api/scrimed-cyber-defense", "app/lib/scrimedSafetyGovernance.ts"],
    controlSummary:
      "Cyber-defense outputs expose control metadata, evidence pointers, and audit hashes only; they do not process patient records, raw EHR payloads, imaging, or payer submissions.",
    implementationStatus: "ready_to_share",
    residualRisk: "Live PHI processing requires legal, privacy, retention, customer, infrastructure, and incident-response approvals outside this code path.",
    owner: "Privacy lead + clinical governance",
    reviewCadence: "Every clinical, connector, or data-ingestion scope expansion.",
    requiredNextEvidence: "Complete privacy risk assessment, BAA/customer agreement, retention policy, and customer-specific data-flow review.",
    blockedClaims: sharedBlockedClaims,
    humanReviewRequired: true,
    syntheticOnly: true
  },
  {
    id: "proxy-request-sanitization-card",
    title: "Proxy and request-header sanitization",
    category: "request_sanitization",
    buyerQuestion: "How does SCRIMED reduce middleware-bypass and suspicious forwarded-header risk?",
    currentAnswer:
      "Next proxy sanitizes middleware-bypass, debug-token, API-key, and token-like forwarded headers before route handlers receive requests.",
    evidenceRoutes: ["proxy.ts", "next.config.js", "npm run smoke:scrimed-cyber-defense"],
    controlSummary:
      "Browser and request-surface controls are contract-tested through static checks and public response headers.",
    implementationStatus: "ready_to_share",
    residualRisk: "External WAF and bot-management controls remain deployment-specific defense-in-depth requirements.",
    owner: "Platform security + infrastructure",
    reviewCadence: "Every proxy, routing, or security-header change.",
    requiredNextEvidence: "Attach deployment WAF/bot-management policy and CSP report workflow before regulated traffic.",
    blockedClaims: sharedBlockedClaims,
    humanReviewRequired: true,
    syntheticOnly: true
  },
  {
    id: "api-abuse-cost-guardrail-card",
    title: "API abuse and model-cost guardrails",
    category: "api_abuse_cost_guardrail",
    buyerQuestion: "How does SCRIMED reduce billing-spike and automated abuse risk while provider calls are disabled by default?",
    currentAnswer:
      "Cost guardrail metadata, provider-call kill-switch defaults, request-counting scaffolds, and safe public errors keep current AI/provider usage controlled.",
    evidenceRoutes: ["app/lib/costApiGuardrails.ts", "app/lib/requestRateLimit.ts", "docs/RISK_REGISTER.md"],
    controlSummary:
      "Provider calls remain off unless explicitly configured; synthetic routes expose budget posture without invoking paid model APIs.",
    implementationStatus: "ready_to_share",
    residualRisk: "Production billing anomaly alerting, WAF throttling, and tenant-specific quotas must be configured in hosting/provider systems.",
    owner: "Platform reliability + finance operations",
    reviewCadence: "Every model-router, provider, or public API expansion.",
    requiredNextEvidence: "Attach tenant quota policy, billing alert thresholds, and abuse-response runbook before paid provider exposure.",
    blockedClaims: sharedBlockedClaims,
    humanReviewRequired: true,
    syntheticOnly: true
  },
  {
    id: "incident-response-tabletop-card",
    title: "Incident response and tabletop readiness",
    category: "incident_response",
    buyerQuestion: "What happens if a token, PHI-risk submission, protected route, or public route is abused?",
    currentAnswer:
      "Incident lanes define triggers, first response, owners, and evidence routes for token leakage, protected-route abuse, PHI exposure risk, and public-route abuse.",
    evidenceRoutes: ["/scrimed-cyber-defense", "docs/scrimed-cyber-defense.md"],
    controlSummary:
      "Response lanes exist in the command center, but production incident evidence requires assigned owners, SIEM/log drains, and tabletop completion.",
    implementationStatus: "external_evidence_required",
    residualRisk: "Tabletop exercise records, SIEM proof, pager escalation, and customer notification paths are not established by code alone.",
    owner: "Security lead + privacy lead + release steward",
    reviewCadence: "Quarterly before regulated pilots and after every security incident.",
    requiredNextEvidence: "Attach redacted tabletop notes, escalation roster, SIEM/log-drain proof, and incident communications template.",
    blockedClaims: sharedBlockedClaims,
    humanReviewRequired: true,
    syntheticOnly: true
  },
  {
    id: "vendor-connector-readiness-card",
    title: "Vendor connector and production integration readiness",
    category: "vendor_connector_readiness",
    buyerQuestion: "What remains blocked before EHR, payer, imaging, or device connector activation?",
    currentAnswer:
      "Production connectors remain blocked until customer-specific threat models, BAAs/contracts, data-flow reviews, testing evidence, and formal approvals exist.",
    evidenceRoutes: ["/release-continuity", "/boundary-release-approvals", "/approvals-readiness"],
    controlSummary:
      "The current cyber-defense layer can support diligence and no-PHI pilots, but does not authorize connector writes, payer submission, EHR writeback, or live PHI processing.",
    implementationStatus: "blocked_until_approved",
    residualRisk: "Each connector needs vendor security review, least-privilege scopes, rollback plan, monitoring, and customer signoff.",
    owner: "Security lead + integration owner + customer security",
    reviewCadence: "Per connector and per customer environment.",
    requiredNextEvidence: "Complete connector threat model, least-privilege scope map, rollback drill, legal approval, and customer security approval.",
    blockedClaims: sharedBlockedClaims,
    humanReviewRequired: true,
    syntheticOnly: true
  }
];

export const scrimedCyberDefenseBuyerDiligenceCards: ScrimedCyberDefenseBuyerDiligenceCard[] =
  rawBuyerDiligenceCards.map((card) => ({
    ...card,
    auditHash: generateScrimedAuditHash({
      status: scrimedCyberDefenseStatus,
      safetyPolicyVersion: scrimedSafetyPolicyVersion,
      card: {
        id: card.id,
        category: card.category,
        implementationStatus: card.implementationStatus,
        evidenceRoutes: card.evidenceRoutes,
        syntheticOnly: card.syntheticOnly,
        humanReviewRequired: card.humanReviewRequired
      }
    })
  }));

export const scrimedCyberDefenseNextHardeningMoves = [
  "Attach production WAF and bot-management rules to public and protected routes.",
  "Configure managed log drains or SIEM export with token/PHI redaction and retention controls.",
  "Add SBOM generation, dependency scan, secret scan, and provenance signing to CI.",
  "Run external penetration test and healthcare privacy/security tabletop before PHI authority.",
  "Add CSP report-only endpoint and review workflow before enforcing any stricter policy that could affect Next.js runtime assets.",
  "Add customer-specific threat models before any production connector, EHR, payer, imaging, or device integration."
];

export const scrimedCyberDefenseAuthorityHeaders = {
  securityCertification: "not-security-certified",
  phiAuthority: "not-authorized-production-phi",
  clinicalCareAuthority: "not-authorized-live-care",
  productionConnectorAuthority: "not-production-connector-approved"
} as const;

export function getScrimedCyberDefenseScorecard(): ScrimedCyberDefenseScorecard {
  const enforcedControlCount = scrimedCyberDefenseControls.filter((control) => control.status === "enforced").length;
  const monitoredControlCount = scrimedCyberDefenseControls.filter((control) => control.status === "monitored").length;
  const plannedControlCount = scrimedCyberDefenseControls.filter(
    (control) => control.status === "planned_external_dependency" || control.status === "blocked_until_authorized"
  ).length;
  const criticalThreatCount = scrimedCyberDefenseThreatMatrix.filter((threat) => threat.riskLevel === "critical").length;
  const highThreatCount = scrimedCyberDefenseThreatMatrix.filter((threat) => threat.riskLevel === "high").length;
  const buyerDiligenceReadyCount = scrimedCyberDefenseBuyerDiligenceCards.filter(
    (card) => card.implementationStatus === "ready_to_share"
  ).length;
  const externalEvidenceGapCount = scrimedCyberDefenseBuyerDiligenceCards.filter((card) =>
    ["manual_operator_required", "external_evidence_required", "blocked_until_approved"].includes(card.implementationStatus)
  ).length;

  return {
    enforcedControlCount,
    monitoredControlCount,
    plannedControlCount,
    criticalThreatCount,
    highThreatCount,
    buyerDiligenceCardCount: scrimedCyberDefenseBuyerDiligenceCards.length,
    buyerDiligenceReadyCount,
    externalEvidenceGapCount,
    noPhiBoundary: true,
    noCertificationClaim: true,
    summary:
      "SCRIMED now treats cybersecurity as an operating control plane: browser hardening, request sanitization, protected-route fail-closed behavior, token redaction, no-PHI safety governance, incident lanes, and buyer diligence cards are visible and contract-tested.",
    auditHash: generateScrimedAuditHash({
      status: scrimedCyberDefenseStatus,
      safetyPolicyVersion: scrimedSafetyPolicyVersion,
      controls: scrimedCyberDefenseControls.map((control) => [control.id, control.status]),
      threats: scrimedCyberDefenseThreatMatrix.map((threat) => [threat.id, threat.riskLevel]),
      buyerDiligenceCards: scrimedCyberDefenseBuyerDiligenceCards.map((card) => [
        card.id,
        card.implementationStatus,
        card.auditHash
      ])
    })
  };
}

export function getScrimedCyberDefenseSummary() {
  return {
    service: "scrimed-cyber-defense-command-center",
    status: scrimedCyberDefenseStatus,
    route: scrimedCyberDefensePageRoute,
    apiRoute: scrimedCyberDefenseApiRoute,
    safetyPolicyVersion: scrimedSafetyPolicyVersion,
    boundary: scrimedCyberDefenseBoundary,
    scorecard: getScrimedCyberDefenseScorecard(),
    controls: scrimedCyberDefenseControls,
    threatMatrix: scrimedCyberDefenseThreatMatrix,
    buyerDiligenceCards: scrimedCyberDefenseBuyerDiligenceCards,
    incidentReadiness: scrimedCyberIncidentReadiness,
    nextHardeningMoves: scrimedCyberDefenseNextHardeningMoves,
    securityAssurancePipeline: getScrimedSecurityAssuranceSummary(),
    securityReleaseReadiness: getScrimedSecurityReleaseReadinessSummary(),
    securityDiligenceEvidence: getScrimedSecurityDiligenceEvidenceSummary(),
    authorityHeaders: scrimedCyberDefenseAuthorityHeaders,
    noGoBoundaries: [
      "No live PHI or ePHI authority.",
      "No production credentials or raw connector payloads in logs, UI, tests, or chat output.",
      "No final clinical diagnosis authority, treatment, prescribing, payer submission, patient outreach, EHR writeback, or final imaging interpretation.",
      "No production connector approval, customer go-live approval, security certification claim, or breach guarantee."
    ]
  };
}
