import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import type { PilotDemoSessionPlan } from "./pilotDemoSessionPlanner";

export type PilotDemoProofPreflightOutcome =
  | "reachable"
  | "http-error"
  | "network-error"
  | "timeout";

export type PilotDemoProofTarget = {
  id: string;
  label: string;
  route: string;
  requestPath: string;
  evidence: string;
  method: "HEAD";
  credentials: "omit";
  sameOriginRequired: true;
  requestBodyAllowed: false;
};

export type PilotDemoProofObservation = {
  targetId: string;
  requestPath: string;
  outcome: PilotDemoProofPreflightOutcome;
  httpStatus: number | null;
  latencyMs: number | null;
  checkedAt: string;
};

export type PilotDemoProofRouteCheck = PilotDemoProofTarget & {
  outcome: "not-run" | PilotDemoProofPreflightOutcome;
  httpStatus: number | null;
  latencyMs: number | null;
  checkedAt: string | null;
  passed: boolean;
};

export type PilotDemoProofPreflightResult = {
  planId: string;
  status: "not-run" | "passed" | "blocked";
  targetCount: number;
  reachableCount: number;
  routeChecks: PilotDemoProofRouteCheck[];
  blockers: string[];
  sameOriginOnly: true;
  method: "HEAD";
  credentials: "omit";
  operatorTriggered: true;
  readOnly: true;
  storesBuyerData: false;
  externalNetworkAllowed: false;
  requestBodyAllowed: false;
  protectedImportAuthorized: false;
  auditHash: string;
};

export class PilotDemoProofPreflightError extends Error {
  readonly code: "unsafe-proof-route" | "too-many-proof-routes";

  constructor(code: "unsafe-proof-route" | "too-many-proof-routes", message: string) {
    super(message);
    this.name = "PilotDemoProofPreflightError";
    this.code = code;
  }
}

export const pilotDemoProofPreflightStatus = "same-origin-read-only-proof-preflight-active";
export const pilotDemoProofPreflightTimeoutMs = 5_000;
export const pilotDemoProofPreflightMaximumTargets = 8;

function normalizeInternalRoute(route: string) {
  const candidate = route.trim();
  if (
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    candidate.includes("..") ||
    /[\u0000-\u001f\u007f]/.test(candidate)
  ) {
    throw new PilotDemoProofPreflightError(
      "unsafe-proof-route",
      "Demo proof preflight accepts canonical same-origin routes only."
    );
  }

  const parsed = new URL(candidate, "https://scrimed.local");
  if (parsed.origin !== "https://scrimed.local") {
    throw new PilotDemoProofPreflightError(
      "unsafe-proof-route",
      "Demo proof preflight cannot target an external origin."
    );
  }

  return {
    route: `${parsed.pathname}${parsed.search}${parsed.hash}`,
    requestPath: `${parsed.pathname}${parsed.search}`
  };
}

export function buildPilotDemoProofTargets(plan: PilotDemoSessionPlan): PilotDemoProofTarget[] {
  const targets = new Map<string, PilotDemoProofTarget>();

  for (const step of plan.agenda) {
    const normalized = normalizeInternalRoute(step.proof.route);
    if (!targets.has(normalized.requestPath)) {
      targets.set(normalized.requestPath, {
        id: `proof-target-${generateScrimedAuditHash({
          planId: plan.planId,
          requestPath: normalized.requestPath
        }).replace("scrimed-intel-", "")}`,
        label: step.proof.label,
        route: normalized.route,
        requestPath: normalized.requestPath,
        evidence: step.proof.evidence,
        method: "HEAD",
        credentials: "omit",
        sameOriginRequired: true,
        requestBodyAllowed: false
      });
    }
  }

  if (targets.size > pilotDemoProofPreflightMaximumTargets) {
    throw new PilotDemoProofPreflightError(
      "too-many-proof-routes",
      `Demo proof preflight is bounded to ${pilotDemoProofPreflightMaximumTargets} routes.`
    );
  }

  return [...targets.values()];
}

function buildAuditHash({
  plan,
  status,
  routeChecks
}: {
  plan: PilotDemoSessionPlan;
  status: PilotDemoProofPreflightResult["status"];
  routeChecks: PilotDemoProofRouteCheck[];
}) {
  return generateScrimedAuditHash({
    planId: plan.planId,
    planAuditHash: plan.auditHash,
    status,
    routeChecks: routeChecks.map((check) => ({
      targetId: check.id,
      requestPath: check.requestPath,
      outcome: check.outcome,
      httpStatus: check.httpStatus,
      passed: check.passed
    }))
  });
}

function resultBoundary(
  plan: PilotDemoSessionPlan,
  status: PilotDemoProofPreflightResult["status"],
  routeChecks: PilotDemoProofRouteCheck[],
  blockers: string[]
): PilotDemoProofPreflightResult {
  return {
    planId: plan.planId,
    status,
    targetCount: routeChecks.length,
    reachableCount: routeChecks.filter((check) => check.passed).length,
    routeChecks,
    blockers,
    sameOriginOnly: true,
    method: "HEAD",
    credentials: "omit",
    operatorTriggered: true,
    readOnly: true,
    storesBuyerData: false,
    externalNetworkAllowed: false,
    requestBodyAllowed: false,
    protectedImportAuthorized: false,
    auditHash: buildAuditHash({ plan, status, routeChecks })
  };
}

export function buildPendingPilotDemoProofPreflight(
  plan: PilotDemoSessionPlan
): PilotDemoProofPreflightResult {
  const routeChecks = buildPilotDemoProofTargets(plan).map<PilotDemoProofRouteCheck>((target) => ({
    ...target,
    outcome: "not-run",
    httpStatus: null,
    latencyMs: null,
    checkedAt: null,
    passed: false
  }));

  return resultBoundary(plan, "not-run", routeChecks, ["Run the same-origin proof route preflight."]);
}

export function evaluatePilotDemoProofPreflight({
  plan,
  observations
}: {
  plan: PilotDemoSessionPlan;
  observations: readonly PilotDemoProofObservation[];
}): PilotDemoProofPreflightResult {
  const targets = buildPilotDemoProofTargets(plan);
  const observationsByTarget = new Map(
    observations.map((observation) => [observation.targetId, observation])
  );
  const routeChecks = targets.map<PilotDemoProofRouteCheck>((target) => {
    const observation = observationsByTarget.get(target.id);
    const identityMatches = observation?.requestPath === target.requestPath;
    const passed = Boolean(
      observation &&
        identityMatches &&
        observation.outcome === "reachable" &&
        observation.httpStatus !== null &&
        observation.httpStatus >= 200 &&
        observation.httpStatus < 400
    );

    return {
      ...target,
      outcome: identityMatches && observation ? observation.outcome : "not-run",
      httpStatus: identityMatches && observation ? observation.httpStatus : null,
      latencyMs: identityMatches && observation ? observation.latencyMs : null,
      checkedAt: identityMatches && observation ? observation.checkedAt : null,
      passed
    };
  });
  const blockers = routeChecks
    .filter((check) => !check.passed)
    .map((check) => `${check.label}: ${check.outcome === "not-run" ? "not verified" : check.outcome}.`);
  const status = blockers.length === 0 && routeChecks.length > 0 ? "passed" : "blocked";

  return resultBoundary(plan, status, routeChecks, blockers);
}

export function buildPassingPilotDemoProofObservations(
  plan: PilotDemoSessionPlan,
  checkedAt = "2026-07-31T00:00:00.000Z"
): PilotDemoProofObservation[] {
  return buildPilotDemoProofTargets(plan).map((target) => ({
    targetId: target.id,
    requestPath: target.requestPath,
    outcome: "reachable",
    httpStatus: 200,
    latencyMs: 0,
    checkedAt
  }));
}
