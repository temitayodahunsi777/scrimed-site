import { NextResponse } from "next/server";
import {
  buildWriteAuthorizationDecision,
  containsPhiRisk,
  containsTokenLikeField,
  errorEnvelope,
  getSessionOrError,
  guardedGetProtectedWorkSession,
  guardedCreateArtifact,
  guardedCreateSession,
  guardedTransitionSession,
  scrimedWorkProviderRegistry,
  simulateVoiceWorkflow,
  wrapWorkData
} from "../../../lib/scrimed-work";
import {
  buildControlPlaneBrief,
  buildP33IntegratedBrief,
  consequenceBenchCases,
  controlPlaneAgentRegistry,
  controlPlaneHeaders,
  controlPlaneProviderPolicyProfiles,
  controlPlaneSkillRegistry,
  controlPlaneWorkflowRegistry,
  getCapitalIntelligenceSummary,
  getApprovalAchievementSummary,
  getComputeResilienceSummary,
  getControlPlaneSummary,
  getP33IntegratedSummary,
  getCrossPlatformEvidenceSummary,
  getOutcomeIntelligenceSummary,
  getScrimedPlatformGraph,
  getPlatformStrategySummary,
  getStrategicDecisionIntelligenceSummary,
  getTrustReadinessSummary,
  routeControlPlaneModel,
  runConsequenceBench,
  searchControlPlaneContext,
  verifyControlPlaneSession
} from "../../../lib/scrimed-control-plane";
import type { DataClassification, RiskLevel } from "../../../lib/scrimed-control-plane";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ path?: string[] }> };

function json(data: unknown, seed: string, status = 200, extraHeaders: Record<string, string> = {}) {
  return NextResponse.json(wrapWorkData(data, seed), {
    status,
    headers: controlPlaneHeaders(extraHeaders)
  });
}

function failure(code: string, message: string, seed: string, status: number) {
  return NextResponse.json(errorEnvelope(code, message, seed, false), {
    status,
    headers: controlPlaneHeaders({ "X-SCRIMED-Control-Plane-Decision": "fail-closed" })
  });
}

async function pathParts(context: RouteContext) {
  const params = await context.params;
  return params.path ?? [];
}

async function readNoSecretPayload(request: Request, action: string) {
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) {
    return { ok: false as const, response: failure("control_plane_content_type_required", "Control-plane POST requests require application/json.", action, 415) };
  }

  const raw = await request.text();
  if (raw.length > 24_000) {
    return { ok: false as const, response: failure("control_plane_payload_too_large", "Control-plane metadata payload exceeds the 24KB limit.", action, 413) };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return { ok: false as const, response: failure("control_plane_invalid_json", "Control-plane payload must be valid JSON.", action, 400) };
  }

  if (!payload || typeof payload !== "object" || containsTokenLikeField(payload) || containsPhiRisk(payload)) {
    return { ok: false as const, response: failure("control_plane_sensitive_payload_blocked", "Control-plane requests reject PHI, direct identifiers, credentials, tokens, and secret-like fields.", action, 400) };
  }

  return { ok: true as const, payload: payload as Record<string, unknown> };
}

async function authorizeMetadataPost(request: Request, action: string, payload: Record<string, unknown>) {
  const decision = await buildWriteAuthorizationDecision(request, `control-plane-${action}`, payload);
  if (!decision.allowed) {
    return {
      ok: false as const,
      response: NextResponse.json(decision.error, {
        status: decision.status,
        headers: controlPlaneHeaders({ "X-SCRIMED-Control-Plane-Decision": "fail-closed" })
      })
    };
  }

  return { ok: true as const, context: decision.context };
}

export async function GET(request: Request, context: RouteContext) {
  const parts = await pathParts(context);
  const endpoint = parts.join("/");
  const summary = getControlPlaneSummary();

  if (endpoint === "") return json(summary, "control-plane-summary");
  if (endpoint === "brief") {
    return new NextResponse(buildControlPlaneBrief(), {
      headers: {
        "Content-Disposition": 'attachment; filename="scrimed-intelligence-control-plane.md"',
        "Content-Type": "text/markdown; charset=utf-8",
        ...controlPlaneHeaders()
      }
    });
  }
  if (endpoint === "sessions") return json({ sessions: summary.sessions }, "control-plane-sessions");
  if (parts[0] === "sessions" && parts.length === 2) {
    const fixture = getSessionOrError(parts[1]);
    if (fixture.ok) {
      return NextResponse.json(fixture.body, {
        status: fixture.status,
        headers: controlPlaneHeaders({ "X-SCRIMED-Control-Plane-Read": "public-synthetic-fixture" })
      });
    }

    const protectedSession = await guardedGetProtectedWorkSession(request, parts[1]);
    if (!protectedSession.allowed) {
      return NextResponse.json(protectedSession.error, {
        status: protectedSession.status,
        headers: controlPlaneHeaders({ "X-SCRIMED-Control-Plane-Decision": "fail-closed" })
      });
    }

    return json(protectedSession.data.session, parts[1], 200, {
      "X-SCRIMED-Control-Plane-Read": "authorized-aal2-durable-read"
    });
  }
  if (endpoint === "agents") return json({ agents: controlPlaneAgentRegistry }, "control-plane-agents");
  if (endpoint === "skills") return json({ skills: controlPlaneSkillRegistry }, "control-plane-skills");
  if (endpoint === "workflows") return json({ workflows: controlPlaneWorkflowRegistry }, "control-plane-workflows");
  if (endpoint === "providers") return json({ policyProfiles: controlPlaneProviderPolicyProfiles, adapters: scrimedWorkProviderRegistry }, "control-plane-providers");
  if (endpoint === "compute-resilience") return json(getComputeResilienceSummary(), "control-plane-compute-resilience");
  if (endpoint === "capital-intelligence") return json(getCapitalIntelligenceSummary(), "control-plane-capital-intelligence");
  if (endpoint === "outcomes") return json(getOutcomeIntelligenceSummary(), "control-plane-outcomes");
  if (endpoint === "approvals") return json(getApprovalAchievementSummary(), "control-plane-approvals");
  if (endpoint === "platform-evidence") return json(getCrossPlatformEvidenceSummary(), "control-plane-platform-evidence");
  if (endpoint === "platform-strategy") return json(getPlatformStrategySummary(), "control-plane-platform-strategy");
  if (endpoint === "platform-graph") return json(getScrimedPlatformGraph(), "control-plane-platform-graph");
  if (endpoint === "trust-readiness") return json(getTrustReadinessSummary(), "control-plane-trust-readiness");
  if (endpoint === "strategic-decision-intelligence") {
    return json(getStrategicDecisionIntelligenceSummary(), "control-plane-strategic-decision-intelligence");
  }
  if (endpoint === "p33") {
    return json(getP33IntegratedSummary(), "control-plane-p33-integrated");
  }
  if (endpoint === "p33/brief") {
    return new NextResponse(buildP33IntegratedBrief(), {
      headers: {
        "Content-Disposition": 'attachment; filename="scrimed-p33-integrated-upgrades.md"',
        "Content-Type": "text/markdown; charset=utf-8",
        ...controlPlaneHeaders({ "X-SCRIMED-P33": "synthetic-human-review-required" })
      }
    });
  }
  if (endpoint === "p33/context") {
    return json(getP33IntegratedSummary().contextFabric, "control-plane-p33-context");
  }
  if (endpoint === "p33/evidence") {
    return json(getP33IntegratedSummary().decisionEvidence, "control-plane-p33-evidence");
  }
  if (endpoint === "p33/opportunities") {
    return json(getP33IntegratedSummary().opportunities, "control-plane-p33-opportunities");
  }
  if (endpoint === "p33/pilots") {
    return json(getP33IntegratedSummary().pilotProfiles, "control-plane-p33-pilots");
  }

  return failure("control_plane_route_not_found", "SCRIMED control-plane route was not found.", endpoint || "root", 404);
}

export async function POST(request: Request, context: RouteContext) {
  const parts = await pathParts(context);
  const endpoint = parts.join("/");

  if (endpoint === "sessions") {
    const result = await guardedCreateSession(request);
    if (!result.allowed) {
      return NextResponse.json(result.error, { status: result.status, headers: controlPlaneHeaders({ "X-SCRIMED-Control-Plane-Decision": "fail-closed" }) });
    }
    return json(result.data, result.data.session.id, result.status, { "X-SCRIMED-Control-Plane-Write": "aal2-durable-authorized" });
  }

  if (endpoint === "artifacts") {
    const result = await guardedCreateArtifact(request);
    if (!result.allowed) {
      return NextResponse.json(result.error, { status: result.status, headers: controlPlaneHeaders({ "X-SCRIMED-Control-Plane-Decision": "fail-closed" }) });
    }
    return json(result.data, result.data.artifact.artifactId, result.status, { "X-SCRIMED-Control-Plane-Artifact": "draft-human-review-required" });
  }

  const sessionAction = parts[0] === "sessions" && parts.length === 3 ? parts[2] : null;
  if (sessionAction && ["plan", "run", "pause", "resume", "cancel", "approve", "reject"].includes(sessionAction)) {
    const transitions = {
      plan: "Protected control-plane planning requested.",
      run: "Run requested; execution pauses when scoped human approval is required.",
      pause: "Protected control-plane pause requested.",
      resume: "Protected control-plane resume requested after checkpoint review.",
      cancel: "Cancellation requested and propagated to planned work.",
      approve: "Independent human approval received; mandatory verification remains required.",
      reject: "Human reviewer rejected the output; session paused for correction."
    } as const;
    const action = sessionAction as keyof typeof transitions;
    const result = await guardedTransitionSession(request, parts[1], action, transitions[action]);
    if (!result.allowed) {
      return NextResponse.json(result.error, { status: result.status, headers: controlPlaneHeaders({ "X-SCRIMED-Control-Plane-Decision": "fail-closed" }) });
    }
    return json(result.data, parts[1], result.status, { "X-SCRIMED-Control-Plane-Write": "aal2-durable-authorized" });
  }

  if (parts[0] === "sessions" && parts.length === 3 && parts[2] === "verify") {
    const session = await guardedGetProtectedWorkSession(request, parts[1]);
    if (!session.allowed) {
      return NextResponse.json(session.error, {
        status: session.status,
        headers: controlPlaneHeaders({ "X-SCRIMED-Control-Plane-Decision": "fail-closed" })
      });
    }
    return json(verifyControlPlaneSession(session.data.session), parts[1], 200, { "X-SCRIMED-Verification": "human-gate-still-required" });
  }

  const parsed = await readNoSecretPayload(request, endpoint || "unknown");
  if (!parsed.ok) return parsed.response;
  const authorization = await authorizeMetadataPost(request, endpoint, parsed.payload);
  if (!authorization.ok) return authorization.response;
  const body = parsed.payload;

  if (endpoint === "route-model") {
    const classifications: DataClassification[] = ["public", "internal", "confidential", "restricted", "deidentified-clinical", "phi-prohibited"];
    const risks: RiskLevel[] = ["low", "moderate", "high", "prohibited"];
    const dataClassification = classifications.includes(body.dataClassification as DataClassification) ? body.dataClassification as DataClassification : "internal";
    const consequence = risks.includes(body.consequence as RiskLevel) ? body.consequence as RiskLevel : "moderate";
    return json(routeControlPlaneModel({
      taskType: typeof body.taskType === "string" ? body.taskType : "synthetic metadata routing",
      complexity: body.complexity === "high" || body.complexity === "low" ? body.complexity : "moderate",
      consequence,
      dataClassification,
      requiredModality: body.requiredModality === "coding" || body.requiredModality === "vision" || body.requiredModality === "voice" || body.requiredModality === "embedding" ? body.requiredModality : "text",
      residencyRequirement: body.residencyRequirement === "local-only" || body.residencyRequirement === "customer-region" ? body.residencyRequirement : "us",
      latencyTargetMs: typeof body.latencyTargetMs === "number" ? body.latencyTargetMs : 3_000,
      budgetUsd: typeof body.budgetUsd === "number" ? body.budgetUsd : 0.25,
      tenantPolicy: typeof body.tenantPolicy === "string" ? body.tenantPolicy : "synthetic no-PHI",
      verificationStrength: typeof body.verificationStrength === "number" ? body.verificationStrength : 80,
      localPrivateRequired: body.localPrivateRequired === true
    }), "control-plane-route-model");
  }

  if (endpoint === "context/search") {
    return json(searchControlPlaneContext({
      query: typeof body.query === "string" ? body.query : "human review evidence",
      tenantId: typeof body.tenantId === "string" ? body.tenantId : "synthetic-tenant",
      limit: typeof body.limit === "number" ? body.limit : 5
    }), "control-plane-context-search");
  }

  if (endpoint === "benchmarks/run") {
    const scores = body.scores && typeof body.scores === "object"
      ? Object.fromEntries(Object.entries(body.scores as Record<string, unknown>).filter((entry): entry is [string, number] => typeof entry[1] === "number"))
      : undefined;
    return json({ cases: consequenceBenchCases, report: runConsequenceBench({ scores }) }, "control-plane-consequence-bench");
  }

  if (endpoint === "voice/simulate") {
    return json(simulateVoiceWorkflow({
      transcript: typeof body.transcript === "string" ? body.transcript : "Prepare a synthetic workflow brief.",
      language: typeof body.language === "string" ? body.language : "en-US",
      consentAcknowledged: body.consentAcknowledged === true
    }), "control-plane-voice-simulation", 200, { "X-SCRIMED-Voice": "synthetic-simulation-only" });
  }

  return failure("control_plane_route_not_found", "SCRIMED control-plane POST route was not found.", endpoint || "root", 404);
}
