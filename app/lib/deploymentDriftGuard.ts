import { smokeCoveredHtmlRoutes } from "./navigationAudit";

export type DeploymentDriftRouteClass =
  | "buyer-critical-public-page"
  | "operator-critical-public-page"
  | "governance-critical-public-page"
  | "evidence-critical-api";

export type DeploymentDriftExpectedStatus = 200 | 401 | 403 | 503;

export type DeploymentDriftGuardRoute = {
  path: string;
  routeClass: DeploymentDriftRouteClass;
  expectedStatus: DeploymentDriftExpectedStatus;
  owner: string;
  whyItMatters: string;
  driftSignal: string;
  sourceEvidence: string[];
  responseBoundary: string;
};

export type DeploymentDriftGuardRunbookStep = {
  step: string;
  owner: string;
  command: string;
  successSignal: string;
  failureAction: string;
};

export type DeploymentDriftGuardSummary = {
  service: "scrimed-deployment-drift-guard";
  status: typeof deploymentDriftGuardStatus;
  pageRoute: typeof deploymentDriftGuardPageRoute;
  apiRoute: typeof deploymentDriftGuardApiRoute;
  briefRoute: typeof deploymentDriftGuardBriefRoute;
  dataBoundary: "synthetic-and-metadata-only";
  deploymentAuthority: "not-deployed-by-this-route";
  productionGoLiveAuthority: "not-authorized";
  targetUrl: typeof deploymentDriftGuardDefaultTargetUrl;
  guardRouteCount: number;
  smokeCoveredRouteCount: number;
  driftDecision: "block-external-promotion-until-target-and-repo-match";
  guardRoutes: DeploymentDriftGuardRoute[];
  runbook: DeploymentDriftGuardRunbookStep[];
  noGoBoundaries: string[];
  exactCommands: string[];
  boundary: typeof deploymentDriftGuardBoundary;
  updated: typeof deploymentDriftGuardUpdatedAt;
};

export const deploymentDriftGuardStatus =
  "deployment-drift-guard-active-no-secret-route-alignment";
export const deploymentDriftGuardPageRoute = "/deployment-drift-guard";
export const deploymentDriftGuardApiRoute = "/api/deployment-drift-guard";
export const deploymentDriftGuardBriefRoute = "/api/deployment-drift-guard/brief";
export const deploymentDriftGuardDefaultTargetUrl = "https://app.scrimedsolutions.com";
export const deploymentDriftGuardUpdatedAt = "2026-07-09T00:00:00.000-04:00";

export const deploymentDriftGuardBoundary =
  "SCRIMED Deployment Drift Guard is a no-secret, synthetic-and-metadata-only release control. It compares source-known route expectations with a target deployment before buyer, investor, or operator promotion. It does not deploy code, commit source, apply migrations, expose PHI, authorize clinical care, approve payer submission, write to EHRs, certify compliance, or approve customer go-live.";

export const deploymentDriftGuardRoutes: DeploymentDriftGuardRoute[] = [
  {
    path: "/scrimed-market-execution",
    routeClass: "buyer-critical-public-page",
    expectedStatus: 200,
    owner: "Revenue Operations + Release Steward",
    whyItMatters:
      "Market Execution is a buyer and investor narrative surface that packages clean-room competitor intelligence, revenue levers, sales motions, and proof artifacts.",
    driftSignal:
      "A 404 means the live target is behind the current repository build and should not be used as evidence for this capability.",
    sourceEvidence: [
      "app/scrimed-market-execution/page.tsx",
      "app/api/scrimed-market-execution/route.ts",
      "scripts/scrimed-market-execution-contract-check.mjs",
      "scripts/public-production-smoke.mjs"
    ],
    responseBoundary:
      "Synthetic business metadata only; no PHI, no autonomous clinical authority, no payer submission, no EHR writeback, no certification claim."
  },
  {
    path: "/enterprise-healthcare-infrastructure",
    routeClass: "buyer-critical-public-page",
    expectedStatus: 200,
    owner: "Interoperability + Security + Release Steward",
    whyItMatters:
      "Enterprise Healthcare Infrastructure Readiness proves SCRIMED can discuss HL7/FHIR, DICOM/PACS/RIS/HIS, X12, VPN, firewall, database, VM, and integration-engine readiness without live connector claims.",
    driftSignal:
      "A 404 means the live target is behind the current hospital-infrastructure readiness build and should not be used for buyer, investor, or implementation proof.",
    sourceEvidence: [
      "app/enterprise-healthcare-infrastructure/page.tsx",
      "app/api/enterprise-healthcare-infrastructure/route.ts",
      "scripts/enterprise-healthcare-infrastructure-contract-check.mjs",
      "scripts/public-production-smoke.mjs"
    ],
    responseBoundary:
      "Synthetic infrastructure metadata only; no PHI, no final imaging interpretation, no payer submission, no EHR writeback, no production connector approval, no customer go-live."
  },
  {
    path: "/scrimed-cyber-defense",
    routeClass: "governance-critical-public-page",
    expectedStatus: 200,
    owner: "Security Lead + Release Steward",
    whyItMatters:
      "Cyber Defense anchors security diligence, token redaction posture, protected-route monitoring, and residual-risk communication.",
    driftSignal:
      "A missing or stale route weakens buyer security diligence and should block external security-readiness claims.",
    sourceEvidence: [
      "app/scrimed-cyber-defense/page.tsx",
      "app/api/scrimed-cyber-defense/route.ts",
      "scripts/scrimed-cyber-defense-contract-check.mjs"
    ],
    responseBoundary:
      "Security readiness only; not a security certification, breach guarantee, PHI authority, or customer go-live approval."
  },
  {
    path: "/scrimed-intelligence-platform",
    routeClass: "buyer-critical-public-page",
    expectedStatus: 200,
    owner: "Platform Product + Release Steward",
    whyItMatters:
      "The Intelligence Platform route demonstrates the governed AI-native operating-system foundation without live PHI or model calls.",
    driftSignal:
      "A missing route means the public deployment cannot support investor or buyer diligence for this architecture layer.",
    sourceEvidence: [
      "app/scrimed-intelligence-platform/page.tsx",
      "app/api/scrimed-intelligence-platform/route.ts",
      "scripts/scrimed-intelligence-platform-contract-check.mjs"
    ],
    responseBoundary:
      "Synthetic metadata only; no live clinical authority, external model approval, payer submission, EHR writeback, or customer go-live."
  },
  {
    path: "/release-continuity",
    routeClass: "operator-critical-public-page",
    expectedStatus: 200,
    owner: "Release Steward",
    whyItMatters:
      "Release Continuity is the operating lane that keeps public smoke, GitHub checks, AAL2 boundaries, and release evidence visible.",
    driftSignal:
      "A missing route means operators lose the source-to-production checkpoint before promotion or buyer proof release.",
    sourceEvidence: [
      "app/release-continuity/page.tsx",
      "app/api/release-continuity/route.ts",
      "scripts/public-production-smoke.mjs"
    ],
    responseBoundary:
      "Operational release evidence only; no deploy authority, no protected mutation authority, and no clinical production approval."
  },
  {
    path: "/api/deployment-drift-guard",
    routeClass: "evidence-critical-api",
    expectedStatus: 200,
    owner: "Release Steward + Platform Engineering",
    whyItMatters:
      "The API gives CI, operators, and buyer-diligence tooling a machine-readable view of deployment drift guardrails.",
    driftSignal:
      "A 404 means the target deployment predates the drift guard and should be treated as stale until redeployed.",
    sourceEvidence: [
      "app/api/deployment-drift-guard/route.ts",
      "app/lib/deploymentDriftGuard.ts",
      "scripts/deployment-drift-guard-contract-check.mjs"
    ],
    responseBoundary:
      "No-secret route metadata only; not a commit, deploy, migration, production connector, or go-live authority."
  }
];

export const deploymentDriftGuardRunbook: DeploymentDriftGuardRunbookStep[] = [
  {
    step: "Validate source contract",
    owner: "Platform Engineering",
    command: "npm run contract:deployment-drift-guard",
    successSignal: "Guard constants, routes, docs, scripts, and safety boundaries are present.",
    failureAction: "Fix source registration before build, deploy, or buyer proof references."
  },
  {
    step: "Validate local rebuilt app",
    owner: "Release Steward",
    command:
      "SCRIMED_BASE_URL=http://127.0.0.1:3048 npm run smoke:deployment-drift-guard",
    successSignal: "Local production server serves every guarded route with expected status codes.",
    failureAction: "Fix local route, API, or build break before any production deploy."
  },
  {
    step: "Validate production target",
    owner: "Release Steward",
    command:
      "SCRIMED_BASE_URL=https://app.scrimedsolutions.com npm run smoke:deployment-drift-guard",
    successSignal: "Production target matches the guarded source route set.",
    failureAction:
      "Treat as deployment drift, deploy the reviewed release candidate, then rerun public and drift smoke."
  },
  {
    step: "Block external promotion on drift",
    owner: "Founder + Release Steward",
    command: "npm run smoke:public",
    successSignal: "Public smoke and drift guard both pass against the intended target.",
    failureAction:
      "Do not use stale routes in buyer demos, investor packets, launch claims, or diligence packets."
  }
];

const noGoBoundaries = [
  "no live PHI",
  "no autonomous clinical care, diagnosis, treatment, prescribing, or final imaging interpretation",
  "no payer submission, claim submission, patient outreach, or EHR writeback",
  "no production connector approval, customer go-live approval, or public certification claim",
  "no raw secrets, bearer tokens, Supabase service keys, credentials, or connector payloads in logs",
  "no deploy, commit, migration apply, rollback, or infrastructure mutation authority from this route"
];

const exactCommands = [
  "npm run contract:deployment-drift-guard",
  "npm run typecheck",
  "npm run lint",
  "npm run test:nonsecret",
  "npm run build",
  "SCRIMED_BASE_URL=http://127.0.0.1:3048 npm run smoke:deployment-drift-guard",
  "SCRIMED_BASE_URL=https://app.scrimedsolutions.com npm run smoke:deployment-drift-guard",
  "SCRIMED_BASE_URL=https://app.scrimedsolutions.com npm run smoke:public"
];

export function getDeploymentDriftGuardSummary(): DeploymentDriftGuardSummary {
  return {
    service: "scrimed-deployment-drift-guard",
    status: deploymentDriftGuardStatus,
    pageRoute: deploymentDriftGuardPageRoute,
    apiRoute: deploymentDriftGuardApiRoute,
    briefRoute: deploymentDriftGuardBriefRoute,
    dataBoundary: "synthetic-and-metadata-only",
    deploymentAuthority: "not-deployed-by-this-route",
    productionGoLiveAuthority: "not-authorized",
    targetUrl: deploymentDriftGuardDefaultTargetUrl,
    guardRouteCount: deploymentDriftGuardRoutes.length,
    smokeCoveredRouteCount: deploymentDriftGuardRoutes.filter((route) =>
      smokeCoveredHtmlRoutes.includes(route.path)
    ).length,
    driftDecision: "block-external-promotion-until-target-and-repo-match",
    guardRoutes: deploymentDriftGuardRoutes,
    runbook: deploymentDriftGuardRunbook,
    noGoBoundaries,
    exactCommands,
    boundary: deploymentDriftGuardBoundary,
    updated: deploymentDriftGuardUpdatedAt
  };
}

export function buildDeploymentDriftGuardBrief() {
  const summary = getDeploymentDriftGuardSummary();

  return [
    "# SCRIMED Deployment Drift Guard",
    "",
    `Status: ${summary.status}`,
    `Default target: ${summary.targetUrl}`,
    `Decision: ${summary.driftDecision}`,
    `Guarded routes: ${summary.guardRouteCount}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Guard Routes",
    ...summary.guardRoutes.map(
      (route) =>
        `- ${route.path}: expect ${route.expectedStatus}; owner ${route.owner}; signal ${route.driftSignal}`
    ),
    "",
    "## Runbook",
    ...summary.runbook.map(
      (step) =>
        `- ${step.step}: ${step.command}. Success: ${step.successSignal} Failure: ${step.failureAction}`
    ),
    "",
    "## NO-GO Boundaries",
    ...summary.noGoBoundaries.map((boundary) => `- ${boundary}`),
    "",
    "## Exact Commands",
    ...summary.exactCommands.map((command) => `- ${command}`)
  ].join("\n");
}
