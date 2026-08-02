import Link from "next/link";
import { getScrimedWorkSummary } from "../lib/scrimed-work";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "SCRIMED Work & Intelligence Platform",
  description:
    "Synthetic/no-PHI SCRIMED Work control plane for governed sessions, model routing, agents, context, verification, artifacts, schedules, voice simulation, learning loops, auditability, rollback, and value telemetry."
};

export default function ScrimedWorkPage() {
  const summary = getScrimedWorkSummary();
  const primarySession = summary.sessions[0];

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">
          Product Console
        </Link>
        <p className="eyebrow">SCRIMED Work & Intelligence Platform</p>
        <h1>Governed long-running healthcare work sessions with verification-first autonomy.</h1>
        <p className="hero-text">
          SCRIMED Work consolidates workspaces, agents, model routing, context retrieval, approvals,
          verification, artifact generation, schedules, voice simulation, learning loops, rollback, and
          value telemetry into one synthetic/no-PHI operating surface.
        </p>
        <div className="hero-actions" aria-label="SCRIMED Work actions">
          <Link href="/api/scrimed-work">Inspect API</Link>
          <Link href="/api/scrimed-work/brief">Download Brief</Link>
          <Link href="/api/scrimed-work/providers">Providers</Link>
          <Link href="/api/scrimed-work/agents">Agents</Link>
          <Link href="/api/scrimed-work/tools">Tools</Link>
          <Link href="/api/scrimed-work/production-hardening">Hardening Gate</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED Work summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Workspaces</span>
          <strong>{summary.workspaces.length}</strong>
        </article>
        <article>
          <span>Sessions</span>
          <strong>{summary.sessionCount}</strong>
        </article>
        <article>
          <span>Agents</span>
          <strong>{summary.agents.length}</strong>
        </article>
        <article>
          <span>Tools</span>
          <strong>{summary.tools.length}</strong>
        </article>
        <article>
          <span>Providers</span>
          <strong>{summary.providers.length}</strong>
        </article>
        <article>
          <span>Agent teams</span>
          <strong>{summary.agentTeams.templateCount}</strong>
        </article>
        <article>
          <span>Approval passports</span>
          <strong>{summary.modelQualification.passportCount}</strong>
        </article>
        <article>
          <span>Independent review lanes</span>
          <strong>{summary.reviewOrchestrator.laneCount}</strong>
        </article>
        <article>
          <span>Risk-tiered actions</span>
          <strong>{summary.reviewPolicy.requirementCount}</strong>
        </article>
        <article>
          <span>Schedules</span>
          <strong>{summary.scheduleDefinitions.length}</strong>
        </article>
        <article>
          <span>Consequential actions</span>
          <strong>{summary.featureFlags.consequentialActionsEnabled ? "enabled" : "disabled"}</strong>
        </article>
        <article>
          <span>Hardening gate</span>
          <strong>{summary.productionHardening.status}</strong>
        </article>
        <article>
          <span>Lifecycle policy</span>
          <strong>fail-closed</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="SCRIMED Work governance status">
        <div>
          <p className="eyebrow">Governance Status</p>
          <h2>Every run starts with Definition of Done, then earns autonomy through verification.</h2>
        </div>
        <div>
          <p>{summary.boundary}</p>
          <ul className="compact-list">
            <li>Definition of Done required: {summary.governanceStatus.definitionOfDoneRequired ? "yes" : "no"}</li>
            <li>Verification blocks completion: {summary.governanceStatus.verificationBlocksCompletion ? "yes" : "no"}</li>
            <li>Browser mutation CSRF protection: {summary.governanceStatus.browserWriteCsrfEnforced ? "exact same-origin" : "not enforced"}</li>
            <li>Mutation rate-limit mode: {summary.governanceStatus.mutationRateLimit.mode}</li>
            <li>Distributed rate-limit provider configured: {summary.governanceStatus.mutationRateLimit.distributedProviderConfigured ? "yes" : "no"}</li>
            <li>Provider-unavailable behavior: {summary.governanceStatus.mutationRateLimit.failClosedOnProviderUnavailable ? "fail closed" : "local/test bounded fallback"}</li>
            <li>Schedules disabled by default: {summary.governanceStatus.schedulesDisabledByDefault ? "yes" : "no"}</li>
            <li>Voice simulation only: {summary.governanceStatus.voiceSimulationOnly ? "yes" : "no"}</li>
          </ul>
        </div>
      </section>

      <section className="table-section" aria-label="Production hardening gate">
        <div className="section-heading">
          <p className="eyebrow">Production Hardening Gate</p>
          <h2>Evidence-ready controls are separated from operator-required release steps.</h2>
        </div>
        <article className="module-row">
          <div>
            <span>{summary.productionHardening.status}</span>
            <h2>Strict durable-store readiness</h2>
          </div>
          <p>
            SCRIMED Work can progress only through approved non-production migration, strict AAL2 smoke,
            and no-PHI canary evidence. This gate does not approve production use.
          </p>
          <div>
            <strong>Readiness</strong>
            <ul className="compact-list">
              <li>Evidence-ready gates: {summary.productionHardening.summary.evidenceReady}/{summary.productionHardening.summary.totalGates}</li>
              <li>Operator-required gates: {summary.productionHardening.summary.operatorRequired}</li>
              <li>Strict smoke eligible: {summary.productionHardening.canRunStrictNonProductionSmoke ? "yes" : "no"}</li>
              <li>Canary eligible: {summary.productionHardening.canaryEligible ? "yes" : "no"}</li>
              <li>Mutation rate-limit mode: {summary.productionHardening.mutationRateLimit.mode}</li>
              <li>Actor quota: {summary.productionHardening.mutationRateLimit.actorLimit} / {summary.productionHardening.mutationRateLimit.windowSeconds}s</li>
              <li>Tenant quota: {summary.productionHardening.mutationRateLimit.tenantLimit} / {summary.productionHardening.mutationRateLimit.windowSeconds}s</li>
              <li>Distributed provider configured: {summary.productionHardening.mutationRateLimit.distributedProviderConfigured ? "yes" : "no"}</li>
              <li>Production downgrade prevented: {summary.productionHardening.mutationRateLimit.downgradePrevented ? "yes" : "not requested"}</li>
              <li>Current release: {summary.productionHardening.releaseBinding.currentReleaseShaFingerprint}</li>
              <li>Canary release: {summary.productionHardening.releaseBinding.canaryReleaseShaFingerprint}</li>
              <li>Evidence authenticated: {summary.productionHardening.releaseBinding.evidenceIdAuthenticated ? "yes" : "no"}</li>
              <li>Workspace binding: {summary.productionHardening.releaseBinding.workspaceBound ? summary.productionHardening.releaseBinding.workspaceSlug : "not verified"}</li>
              <li>Canary freshness: {summary.productionHardening.releaseBinding.fresh ? `fresh (${summary.productionHardening.releaseBinding.ageHours?.toFixed(2) ?? "0.00"}h)` : "stale or unavailable"}</li>
              <li>Release binding matched: {summary.productionHardening.releaseBinding.matched ? "yes" : "no"}</li>
            </ul>
          </div>
          <div>
            <strong>Commands</strong>
            <ul className="compact-list">
              {summary.productionHardening.strictSmokeCommands.map((command) => (
                <li key={command}>{command}</li>
              ))}
            </ul>
          </div>
        </article>
        {summary.productionHardening.gates.map((gate) => (
          <article className="module-row" key={gate.gateId}>
            <div>
              <span>{gate.status}</span>
              <h2>{gate.title}</h2>
            </div>
            <p>{gate.requiredFor}</p>
            <div>
              <strong>Evidence</strong>
              <ul className="compact-list">
                {gate.evidence.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>Next action</strong>
              <p>{gate.operatorAction}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Workspace selector">
        <div className="section-heading">
          <p className="eyebrow">Workspace Selector</p>
          <h2>Domain views keep clinical, executive, research, operations, and Studio work separated by boundary.</h2>
        </div>
        {summary.workspaces.map((workspace) => (
          <article className="module-row" key={workspace.workspaceId}>
            <div>
              <span>{workspace.domain}</span>
              <h2>{workspace.title}</h2>
            </div>
            <p>{workspace.purpose}</p>
            <div>
              <strong>Allowed data</strong>
              <ul className="compact-list">
                <li>{workspace.allowedDataClassifications.join(", ")}</li>
                <li>Default risk: {workspace.defaultRiskLevel}</li>
                <li>Human review default: {workspace.humanReviewDefault ? "yes" : "no"}</li>
              </ul>
            </div>
            <div>
              <strong>Boundary</strong>
              <p>{workspace.retainedBoundary}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Active work sessions">
        <div className="section-heading">
          <p className="eyebrow">Active Work Sessions</p>
          <h2>Persistent sessions carry scope, risk, autonomy, context, plans, approvals, artifacts, telemetry, cancellation, and rollback metadata.</h2>
        </div>
        {summary.sessions.map((session) => (
          <article className="module-row" key={session.id}>
            <div>
              <span>{session.statusHistory.at(-1)?.status}</span>
              <h2>{session.title}</h2>
            </div>
            <p>{session.objective}</p>
            <div>
              <strong>Definition of Done</strong>
              <ul className="compact-list">
                <li>Goal: {session.definitionOfDone.goal}</li>
                <li>Maximum steps: {session.definitionOfDone.maximumSteps}</li>
                <li>Maximum tool calls: {session.definitionOfDone.maximumToolCalls}</li>
                <li>Human approval required: {session.definitionOfDone.humanApprovalRequired ? "yes" : "no"}</li>
              </ul>
            </div>
            <div>
              <strong>Autonomy</strong>
              <ul className="compact-list">
                <li>Requested: {session.requestedAutonomy}</li>
                <li>Approved: {session.approvedAutonomy}</li>
                <li>Risk: {session.riskLevel}</li>
                <li>Rollback: {session.rollbackMetadata.rollbackAvailable ? "available" : "blocked"}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Agent plan and timeline">
        <div className="section-heading">
          <p className="eyebrow">Agent Plan and Step Timeline</p>
          <h2>Planner, specialist, verifier, and reviewer roles operate with bounded steps and approval checkpoints.</h2>
        </div>
        {primarySession.plannedSteps.map((step) => (
          <article className="module-row" key={step.stepId}>
            <div>
              <span>{step.status}</span>
              <h2>{step.title}</h2>
            </div>
            <p>Agent: {step.assignedAgent}</p>
            <div>
              <strong>Controls</strong>
              <ul className="compact-list">
                <li>Depends on: {step.dependsOn.length ? step.dependsOn.join(", ") : "none"}</li>
                <li>Approval required: {step.requiresApproval ? "yes" : "no"}</li>
                <li>Deadline: {step.deadlineMs}ms</li>
                <li>Audit: {step.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Session lifecycle control">
        <div className="section-heading">
          <p className="eyebrow">Lifecycle Control</p>
          <h2>Authoritative state, independent approval, and durable idempotency prevent impossible or duplicated work histories.</h2>
        </div>
        {summary.lifecycle.map((lifecycle) => (
          <article className="module-row" key={lifecycle.sessionId}>
            <div>
              <span>{lifecycle.currentStatus}</span>
              <h2>{lifecycle.sessionId}</h2>
            </div>
            <p>
              Every protected mutation re-reads the tenant-scoped durable record. The database locks the
              session, validates the transition, preserves append-only history, and checks the idempotency ledger.
            </p>
            <div>
              <strong>Available now</strong>
              <ul className="compact-list">
                <li>{lifecycle.allowedActions.join(", ") || "No transition available"}</li>
                <li>Terminal: {lifecycle.terminal ? "yes" : "no"}</li>
                <li>Policy: {lifecycle.policyVersion}</li>
              </ul>
            </div>
            <div>
              <strong>Fail-closed examples</strong>
              <ul className="compact-list">
                {lifecycle.blockedActions.slice(0, 4).map((item) => (
                  <li key={`${lifecycle.sessionId}-${item.action}`}>
                    {item.action}: {item.reason}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Context and citations">
        <div className="section-heading">
          <p className="eyebrow">Context and Citations</p>
          <h2>Agents retrieve ranked context with citations, trust tiers, recency, and tenant metadata instead of guessing.</h2>
        </div>
        {summary.context.records.map((record) => (
          <article className="module-row" key={record.sourceId}>
            <div>
              <span>{record.sourceType}</span>
              <h2>{record.title}</h2>
            </div>
            <p>{record.excerpt}</p>
            <div>
              <strong>Scores</strong>
              <ul className="compact-list">
                <li>Retrieval: {record.retrievalScore}</li>
                <li>Semantic: {record.semanticScore}</li>
                <li>Lexical: {record.lexicalScore}</li>
                <li>Trust: {record.trustTier}</li>
              </ul>
            </div>
            <div>
              <strong>Citation</strong>
              <p>{record.citation}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Approvals and verification results">
        <div className="section-heading">
          <p className="eyebrow">Approval Queue + Verification Results</p>
          <h2>High-risk work pauses for human review, and completion is blocked when mandatory verification fails.</h2>
        </div>
        {primarySession.approvalCheckpoints.map((checkpoint) => (
          <article className="module-row" key={checkpoint.checkpointId}>
            <div>
              <span>{checkpoint.status}</span>
              <h2>{checkpoint.action}</h2>
            </div>
            <p>{checkpoint.reason}</p>
            <div>
              <strong>Reviewer</strong>
              <ul className="compact-list">
                <li>Role: {checkpoint.requiredRole}</li>
                <li>Token status: {checkpoint.scopedApprovalTokenStatus}</li>
                <li>Audit: {checkpoint.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
        {primarySession.artifacts.map((artifact) => (
          <article className="module-row" key={artifact.artifactId}>
            <div>
              <span>{artifact.reviewStatus}</span>
              <h2>{artifact.title}</h2>
            </div>
            <p>{artifact.verification.recommendedAction}</p>
            <div>
              <strong>Verification</strong>
              <ul className="compact-list">
                <li>All pass: {artifact.verification.allPass ? "yes" : "no"}</li>
                <li>Pass rate: {artifact.verification.criteriaPassRate}%</li>
                <li>Completion eligible: {artifact.verification.eligibleForCompletion ? "yes" : "no"}</li>
                <li>Failed criteria: {artifact.verification.failedCriteria.join(", ") || "none"}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Model routing and telemetry">
        <div className="section-heading">
          <p className="eyebrow">Model Routing + Value Telemetry</p>
          <h2>Routing records privacy, risk, cost, latency, provider status, and fallback rationale without external calls.</h2>
        </div>
        {summary.modelRoutes.map((route) => (
          <article className="module-row" key={`${route.provider}-${route.modelTier}-${route.riskLevel}`}>
            <div>
              <span>{route.modelTier}</span>
              <h2>{route.selectedModel}</h2>
            </div>
            <p>{route.reason}</p>
            <div>
              <strong>Route</strong>
              <ul className="compact-list">
                <li>Provider: {route.provider}</li>
                <li>Deployment: {route.deploymentMode}</li>
                <li>Cost: {route.estimatedCostClass}</li>
                <li>Latency: {route.estimatedLatencyClass}</li>
                <li>Human review: {route.requiresHumanReview ? "yes" : "no"}</li>
              </ul>
            </div>
          </article>
        ))}
        {summary.valueTelemetry.map((item) => (
          <article className="module-row" key={item.sessionId}>
            <div>
              <span>Value telemetry</span>
              <h2>{item.sessionId}</h2>
            </div>
            <p>No raw prompts, PHI, tokens, or sensitive document text are stored in telemetry.</p>
            <div>
              <strong>Outcome economics</strong>
              <ul className="compact-list">
                <li>Botsitting ratio: {item.telemetry.botsittingRatio.toFixed(2)}</li>
                <li>Net time saved: {item.telemetry.netTimeSavedMinutes}</li>
                <li>Cost per verified artifact: {item.telemetry.costPerVerifiedArtifact.toFixed(4)}</li>
                <li>First-pass verification: {item.telemetry.verificationFirstPassRate}%</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Qualification and impact governance">
        <div className="section-heading">
          <p className="eyebrow">Qualification + Impact Governance</p>
          <h2>Models, agent teams, value evidence, workforce effects, and procurement claims remain independently reviewable.</h2>
        </div>
        <article className="module-row">
          <div>
            <span>Model and agent passports</span>
            <h2>{summary.modelQualification.passportCount} governed subjects</h2>
          </div>
          <p>{summary.modelQualification.boundary}</p>
          <div>
            <strong>Qualification posture</strong>
            <ul className="compact-list">
              <li>Model passports: {summary.modelQualification.modelPassportCount}</li>
              <li>Agent passports: {summary.modelQualification.agentPassportCount}</li>
              <li>Provider calls: disabled</li>
              <li>PHI authority: none</li>
              <li>Clinical authority: none</li>
            </ul>
          </div>
          <div>
            <strong>Unverified candidates</strong>
            <ul className="compact-list">
              {summary.modelQualification.unverifiedCandidates.map((candidate) => (
                <li key={candidate.candidateId}>
                  {candidate.requestedCandidateName}: {candidate.verificationStatus}
                </li>
              ))}
            </ul>
          </div>
        </article>
        <article className="module-row">
          <div>
            <span>Governed agent teams</span>
            <h2>{summary.agentTeams.templateCount} bounded templates</h2>
          </div>
          <p>{summary.agentTeams.boundary}</p>
          <div>
            <strong>Team controls</strong>
            <ul className="compact-list">
              <li>Independent review: required</li>
              <li>Human conflict escalation: required</li>
              <li>Cost, runtime, and actions: bounded</li>
              <li>Network: default deny</li>
              <li>Audit and idempotency: required</li>
              <li>External execution: disabled</li>
              <li>Release authority: none</li>
            </ul>
          </div>
          <div>
            <strong>Templates</strong>
            <p>{summary.agentTeams.templates.map((template) => template.title).join(", ")}</p>
          </div>
        </article>
        <article className="module-row">
          <div>
            <span>AI-assisted review</span>
            <h2>{summary.reviewOrchestrator.laneCount} independent lanes</h2>
          </div>
          <p>{summary.reviewOrchestrator.boundary}</p>
          <div>
            <strong>Review controls</strong>
            <ul className="compact-list">
              <li>Self-review: prohibited</li>
              <li>Evidence references: required</li>
              <li>Stale review: rejected</li>
              <li>Human approval impersonation: prohibited</li>
            </ul>
          </div>
          <div>
            <strong>Accountable sign-off</strong>
            <p>Legal, clinical, privacy, security, database, finance, and release authority remain human-controlled.</p>
          </div>
        </article>
        <article className="module-row">
          <div>
            <span>{summary.impactGovernance.intelligenceYield.evidenceStatus}</span>
            <h2>Verified Intelligence Yield</h2>
          </div>
          <p>{summary.impactGovernance.boundary}</p>
          <div>
            <strong>Synthetic planning evidence</strong>
            <ul className="compact-list">
              <li>
                Accepted outputs per burden dollar: {summary.impactGovernance.intelligenceYield.yieldPerUsd?.toFixed(2) ?? "unavailable"}
              </li>
              <li>
                Healthcare value evidence: {summary.impactGovernance.healthcareValueReturned.evidenceStatus}
              </li>
              <li>Workforce transition: {summary.impactGovernance.workforceTransition.decision}</li>
              <li>Procurement: {summary.impactGovernance.procurement.status}</li>
            </ul>
          </div>
          <div>
            <strong>Sovereign profile</strong>
            <ul className="compact-list">
              <li>Status: {summary.impactGovernance.sovereignDeployment.status}</li>
              <li>Production activation: disabled</li>
              <li>PHI authority: none</li>
            </ul>
          </div>
        </article>
      </section>

      <section className="table-section" aria-label="Schedules and voice simulation">
        <div className="section-heading">
          <p className="eyebrow">Schedules + Voice Simulation</p>
          <h2>Scheduled work is defined but disabled by default; voice remains simulation-only with no raw audio storage.</h2>
        </div>
        {summary.scheduleDefinitions.map((schedule) => (
          <article className="module-row" key={schedule.id}>
            <div>
              <span>{schedule.enabled ? "enabled" : "disabled"}</span>
              <h2>{schedule.title}</h2>
            </div>
            <p>{schedule.taskTemplate}</p>
            <div>
              <strong>Policy</strong>
              <ul className="compact-list">
                <li>Cadence: {schedule.cadenceExpression}</li>
                <li>Approval: {schedule.approvalPolicy}</li>
                <li>Maximum cost: ${schedule.maximumCostUsd}</li>
                <li>Simulation only: {schedule.simulationOnly ? "yes" : "no"}</li>
              </ul>
            </div>
          </article>
        ))}
        <article className="module-row">
          <div>
            <span>{summary.voiceSimulation.syntheticDemoMode ? "simulation" : "disabled"}</span>
            <h2>Voice-session state machine</h2>
          </div>
          <p>{summary.voiceSimulation.retainedBoundary}</p>
          <div>
            <strong>States</strong>
            <ul className="compact-list">
              <li>{summary.voiceSimulation.states.join(" -> ")}</li>
              <li>Raw audio stored: {summary.voiceSimulation.rawAudioStored ? "yes" : "no"}</li>
              <li>Consent acknowledged: {summary.voiceSimulation.consentAcknowledged ? "yes" : "no"}</li>
              <li>Emergency language detected: {summary.voiceSimulation.emergencyLanguageDetected ? "yes" : "no"}</li>
            </ul>
          </div>
        </article>
      </section>

      <section className="table-section" aria-label="SCRIMED Studio registries">
        <div className="section-heading">
          <p className="eyebrow">SCRIMED Studio</p>
          <h2>Read-only registries expose agents, tools, providers, artifact templates, schedules, policies, and ontology concepts.</h2>
        </div>
        {summary.agents.slice(0, 6).map((agent) => (
          <article className="module-row" key={agent.agentId}>
            <div>
              <span>{agent.trustTier}</span>
              <h2>{agent.name}</h2>
            </div>
            <p>{agent.purpose}</p>
            <div>
              <strong>Least privilege</strong>
              <ul className="compact-list">
                <li>{agent.leastPrivilegeScope}</li>
                <li>Blocked: {agent.blockedActions.join(", ")}</li>
                <li>Human escalation: {agent.humanEscalationRequired ? "yes" : "no"}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
