import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import { scrimedSafetyPolicyVersion } from "./scrimedSafetyGovernance";

export type ScrimedSecurityAssuranceCategory =
  | "secret_detection"
  | "browser_hardening"
  | "request_sanitization"
  | "protected_access"
  | "phi_boundary"
  | "supply_chain"
  | "dependency_floor"
  | "ci_workflow"
  | "incident_response"
  | "deployment_boundary";

export type ScrimedSecurityAssuranceStatus = "automated" | "manual_required" | "planned_external_dependency";

export type ScrimedSecurityAssuranceGate = {
  id: string;
  category: ScrimedSecurityAssuranceCategory;
  name: string;
  status: ScrimedSecurityAssuranceStatus;
  requiredControl: string;
  automatedCheck: string;
  evidence: string[];
  failureMode: string;
  manualFollowUp: string;
  retainedBoundary: string;
};

export type ScrimedSecurityAssuranceScorecard = {
  automatedGateCount: number;
  manualGateCount: number;
  externalDependencyCount: number;
  blocksSecretLeaks: boolean;
  blocksUnsafeClaims: boolean;
  blocksPhiAuthority: boolean;
  auditHash: string;
};

export const scrimedSecurityAssuranceStatus = "scrimed-security-assurance-active-no-secrets-no-phi";
export const scrimedSecurityAssuranceBoundary =
  "SCRIMED Security Assurance Pipeline is a no-secret, no-PHI control verification layer. It improves evidence discipline and regression detection without granting PHI authority, production connector approval, customer go-live, security certification, penetration-test completion, SOC 2, HITRUST, FDA, or HIPAA approval.";

const retainedBoundary =
  "No live PHI, no production credentials, no raw connector payload logging, no security certification claim, no production connector approval, and no customer go-live approval.";

export const scrimedSecurityAssuranceGates: ScrimedSecurityAssuranceGate[] = [
  {
    id: "secret-scan",
    category: "secret_detection",
    name: "Static token and secret leak scan",
    status: "automated",
    requiredControl: "Source files must not contain live bearer tokens, JWTs, API keys, private keys, or cloud credentials.",
    automatedCheck: "scripts/scrimed-security-assurance-contract-check.mjs scans curated source surfaces for high-risk token patterns.",
    evidence: ["npm run security:assurance", "npm run test:nonsecret"],
    failureMode: "A live credential-like value enters source, docs, scripts, or route code.",
    manualFollowUp: "Rotate the affected credential, remove the value, preserve only a fingerprint, and rerun nonsecret checks.",
    retainedBoundary
  },
  {
    id: "header-hardening",
    category: "browser_hardening",
    name: "Global security header regression gate",
    status: "automated",
    requiredControl: "CSP, HSTS, frame denial, no-sniff, CORP, COOP, Origin-Agent-Cluster, and restricted Permissions-Policy must remain present.",
    automatedCheck: "Security assurance checks next.config.js for required hardening headers and no-authority SCRIMED headers.",
    evidence: ["next.config.js", "npm run smoke:scrimed-cyber-defense"],
    failureMode: "A route or refactor removes browser hardening or no-authority response headers.",
    manualFollowUp: "Review CSP compatibility and add report-only monitoring before stricter enforcement.",
    retainedBoundary
  },
  {
    id: "proxy-sanitizer",
    category: "request_sanitization",
    name: "Middleware/proxy bypass header guard",
    status: "automated",
    requiredControl: "Inbound x-middleware-subrequest and token-like debug headers must be stripped before route handlers receive requests.",
    automatedCheck: "Security assurance requires proxy.ts to strip bypass and debug headers and emit scrub status headers.",
    evidence: ["proxy.ts", "live header smoke"],
    failureMode: "A crafted header influences route behavior or bypass assumptions.",
    manualFollowUp: "Mirror the stripping rule at WAF or reverse-proxy level before regulated deployment.",
    retainedBoundary
  },
  {
    id: "protected-fail-closed",
    category: "protected_access",
    name: "Protected API fail-closed evidence",
    status: "automated",
    requiredControl: "Protected AAL2 and buyer-evidence routes must fail closed without valid authorized context.",
    automatedCheck: "Public smoke and nonsecret suite verify protected routes return safe fail-closed states without bearer tokens.",
    evidence: ["npm run smoke:public", "scripts/aal2-token-policy-selftest.mjs"],
    failureMode: "Unauthenticated access succeeds or exposes protected evidence.",
    manualFollowUp: "Inspect auth/RBAC/RLS policy, revoke suspect sessions, and rerun strict AAL2 smoke with a valid short-lived token.",
    retainedBoundary
  },
  {
    id: "phi-boundary",
    category: "phi_boundary",
    name: "No-PHI and clinical authority boundary",
    status: "automated",
    requiredControl: "No route, page, doc, or script may claim live PHI authority, autonomous clinical care, payer submission, or EHR writeback.",
    automatedCheck: "Security assurance scans critical surfaces for forbidden authority phrases and unsafe clinical/compliance claims.",
    evidence: ["app/lib/scrimedSafetyGovernance.ts", "docs/NO_PHI_POLICY.md"],
    failureMode: "Marketing or operator copy implies authority that SCRIMED does not have.",
    manualFollowUp: "Route copy through legal, privacy, clinical governance, and qualified external reviewers before release.",
    retainedBoundary
  },
  {
    id: "supply-chain-integrity",
    category: "supply_chain",
    name: "Generated integrity and dependency posture",
    status: "automated",
    requiredControl: "Generated duplicate files must not corrupt resolution, and dependency/security evidence must be ready for external review.",
    automatedCheck: "Security assurance requires generated-integrity checks and documents the SBOM/dependency-scan follow-up.",
    evidence: ["scripts/check-generated-integrity.mjs", "package.json"],
    failureMode: "Generated duplicates, unsafe dependency drift, or missing dependency evidence blocks clean deploy review.",
    manualFollowUp: "Add SBOM generation, dependency scan, provenance signing, and external vulnerability review before PHI authority.",
    retainedBoundary
  },
  {
    id: "dependency-security-floor",
    category: "dependency_floor",
    name: "Framework dependency security floor",
    status: "automated",
    requiredControl:
      "Next.js, React, React DOM, eslint-config-next, and postcss must remain pinned to reviewed versions at or above the current SCRIMED security floor.",
    automatedCheck:
      "scripts/dependency-security-floor-contract-check.mjs verifies package.json and package-lock.json agree on exact patched framework versions.",
    evidence: ["npm run security:dependency-floor", "package.json", "package-lock.json"],
    failureMode: "A dependency update or merge conflict silently downgrades SCRIMED below the approved framework security floor.",
    manualFollowUp:
      "Review Next.js and React security advisories, update lockfile through npm ci/install in a trusted environment, then rerun nonsecret checks.",
    retainedBoundary
  },
  {
    id: "ci-workflow-governance",
    category: "ci_workflow",
    name: "CI workflow governance contract",
    status: "automated",
    requiredControl:
      "Main CI and protected smoke workflows must retain no-secret validation, read-only permissions, deterministic Node setup, explicit timeouts, and no fail-open patterns.",
    automatedCheck:
      "scripts/ci-workflow-contract-check.mjs verifies GitHub Actions workflow controls for normal CI and protected AAL2 smoke paths.",
    evidence: ["npm run contract:ci-workflows", ".github/workflows/ci.yml", ".github/workflows/*smoke.yml"],
    failureMode: "A workflow edit removes safety checks, disables failure, prints secrets, or leaves protected smokes without timeouts.",
    manualFollowUp:
      "Review GitHub Actions logs, rotate any exposed credential, restore fail-closed checks, and rerun the nonsecret suite before merge.",
    retainedBoundary
  },
  {
    id: "incident-readiness",
    category: "incident_response",
    name: "Incident response lane coverage",
    status: "manual_required",
    requiredControl: "Token leakage, PHI exposure risk, protected-route abuse, and public-route abuse must have owners and first-response steps.",
    automatedCheck: "Security assurance requires incident readiness metadata to remain visible in the cyber defense command center.",
    evidence: ["app/lib/scrimedCyberDefenseCommandCenter.ts", "docs/scrimed-cyber-defense.md"],
    failureMode: "Security event response depends on ad hoc operator memory instead of a defined lane.",
    manualFollowUp: "Run a tabletop exercise and attach SIEM/log-drain evidence before production PHI workflows.",
    retainedBoundary
  },
  {
    id: "deployment-boundary",
    category: "deployment_boundary",
    name: "External deployment assurance boundary",
    status: "planned_external_dependency",
    requiredControl: "WAF, bot controls, SIEM/log drains, customer-specific threat models, penetration testing, and legal/security review are required before authority expands.",
    automatedCheck: "Security assurance verifies this dependency remains documented and not misrepresented as complete.",
    evidence: ["docs/scrimed-cyber-defense.md", "/scrimed-cyber-defense"],
    failureMode: "The platform claims regulated or customer go-live readiness before external controls exist.",
    manualFollowUp: "Complete external WAF, SIEM, SBOM, penetration test, incident tabletop, and customer-specific approvals.",
    retainedBoundary
  }
];

export function getScrimedSecurityAssuranceScorecard(): ScrimedSecurityAssuranceScorecard {
  const automatedGateCount = scrimedSecurityAssuranceGates.filter((gate) => gate.status === "automated").length;
  const manualGateCount = scrimedSecurityAssuranceGates.filter((gate) => gate.status === "manual_required").length;
  const externalDependencyCount = scrimedSecurityAssuranceGates.filter(
    (gate) => gate.status === "planned_external_dependency"
  ).length;

  return {
    automatedGateCount,
    manualGateCount,
    externalDependencyCount,
    blocksSecretLeaks: true,
    blocksUnsafeClaims: true,
    blocksPhiAuthority: true,
    auditHash: generateScrimedAuditHash({
      status: scrimedSecurityAssuranceStatus,
      safetyPolicyVersion: scrimedSafetyPolicyVersion,
      gates: scrimedSecurityAssuranceGates.map((gate) => [gate.id, gate.status])
    })
  };
}

export function getScrimedSecurityAssuranceSummary() {
  return {
    service: "scrimed-security-assurance-pipeline",
    status: scrimedSecurityAssuranceStatus,
    boundary: scrimedSecurityAssuranceBoundary,
    safetyPolicyVersion: scrimedSafetyPolicyVersion,
    scorecard: getScrimedSecurityAssuranceScorecard(),
    gates: scrimedSecurityAssuranceGates,
    validationCommands: [
      "npm run security:assurance",
      "npm run security:dependency-floor",
      "npm run contract:ci-workflows",
      "npm run smoke:scrimed-cyber-defense",
      "npm run test:nonsecret",
      "npm run typecheck",
      "npm run lint",
      "npm run build"
    ],
    nextManualActions: [
      "Connect WAF and bot management at deployment edge.",
      "Configure redacted SIEM/log drains with retention policy.",
      "Add SBOM generation, dependency provenance signing, and independent dependency review in CI.",
      "Run external penetration test and privacy/security tabletop before PHI authority."
    ]
  };
}
