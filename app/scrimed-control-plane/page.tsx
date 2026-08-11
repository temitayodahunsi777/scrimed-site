import Link from "next/link";
import { getControlPlaneSummary } from "../lib/scrimed-control-plane";

export const metadata = {
  title: "SCRIMED Intelligence Control Plane",
  description: "Synthetic/no-PHI executive mission control for governed healthcare agents, verification, approvals, cross-platform release evidence, capital intelligence, compute resilience, learning, and outcomes."
};

export default function ScrimedControlPlanePage() {
  const summary = getControlPlaneSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">SCRIMED Intelligence Control Plane</p>
        <h1>Executive mission control for governed healthcare intelligence.</h1>
        <p className="hero-text">
          One synthetic, verification-first view across work sessions, agents, skills, workflows, context,
          model policy, approvals, benchmarks, artifacts, capital intelligence, compute resilience, learning,
          outcomes, cross-platform release evidence, and audit history.
        </p>
        <div className="hero-actions" aria-label="Control-plane resources">
          <Link href="/api/scrimed-control-plane">Inspect API</Link>
          <Link href="/api/scrimed-control-plane/brief">Download Brief</Link>
          <Link href="/api/scrimed-control-plane/platform-graph">Inspect Platform Graph</Link>
          <Link href="/scrimed-work">Open SCRIMED Work</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Control-plane status">
        <article><span>Status</span><strong>{summary.status}</strong></article>
        <article><span>Sessions</span><strong>{summary.sessions.length}</strong></article>
        <article><span>Agents</span><strong>{summary.agents.length}</strong></article>
        <article><span>Skills</span><strong>{summary.skills.length}</strong></article>
        <article><span>Workflows</span><strong>{summary.workflows.length}</strong></article>
        <article><span>Semantic definitions</span><strong>{summary.ontology.length}</strong></article>
        <article><span>Trust score</span><strong>{summary.verification.trustScore.total}</strong></article>
        <article><span>Graph integrity</span><strong>{summary.platformGraph.validation.valid ? "valid" : "review"}</strong></article>
        <article><span>Investor heuristic</span><strong>{summary.strategicDecisionIntelligence.investorReadiness.score}</strong></article>
        <article><span>Consequential actions</span><strong>{summary.featureFlags.consequentialActionsEnabled ? "enabled" : "disabled"}</strong></article>
      </section>

      <section className="section-band split-band" aria-label="Governance boundary">
        <div>
          <p className="eyebrow">Governance Before Autonomy</p>
          <h2>Definition of Done, evidence, verification, and human approval determine completion.</h2>
        </div>
        <div>
          <p>{summary.boundary}</p>
          <ul className="compact-list">
            <li>Runtime authority: {summary.architecture.runtimeAuthority}</li>
            <li>Mutation authority: {summary.architecture.mutationAuthority}</li>
            <li>Agent narrative accepted as proof: {summary.governance.agentNarrativeIsProof ? "yes" : "no"}</li>
            <li>Hidden chain-of-thought stored: {summary.governance.rawPromptsOrChainOfThoughtStored ? "yes" : "no"}</li>
          </ul>
        </div>
      </section>

      <section className="table-section" aria-label="Workspace and session control">
        <div className="section-heading"><p className="eyebrow">Workspace + Active Sessions</p><h2>Persistent work remains scoped, cancellable, auditable, and rollback-aware.</h2></div>
        {summary.sessions.map((session) => (
          <article className="module-row" key={session.id}>
            <div><span>{session.statusHistory.at(-1)?.status}</span><h2>{session.title}</h2></div>
            <p>{session.objective}</p>
            <div><strong>Contract</strong><ul className="compact-list"><li>Maximum steps: {session.definitionOfDone.maximumSteps}</li><li>Maximum tools: {session.definitionOfDone.maximumToolCalls}</li><li>Human approval: {session.definitionOfDone.humanApprovalRequired ? "required" : "conditional"}</li></ul></div>
            <div><strong>Recovery</strong><ul className="compact-list"><li>Cancellable: {session.cancellationState.cancellable ? "yes" : "no"}</li><li>Rollback: {session.rollbackMetadata.rollbackAvailable ? "available" : "blocked"}</li><li>Risk: {session.riskLevel}</li></ul></div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Agent and skill registries">
        <div className="section-heading"><p className="eyebrow">Agent OS + Skills Registry</p><h2>Least-privilege identities expose declared scope, tools, schemas, evaluations, and owners.</h2></div>
        {summary.agents.map((agent) => (
          <article className="module-row" key={agent.id}>
            <div><span>{agent.activationStatus}</span><h2>{agent.id}</h2></div>
            <p>{agent.purpose}</p>
            <div><strong>Scope</strong><ul className="compact-list"><li>{agent.allowedDomains.join(", ")}</li><li>Risk ceiling: {agent.riskCeiling}</li><li>Model class: {agent.defaultModelClass}</li></ul></div>
            <div><strong>Governance</strong><ul className="compact-list"><li>Owner: {agent.owner}</li><li>Human review: {agent.requiresHumanReview ? "required" : "policy-dependent"}</li><li>Audit: {agent.auditHash}</li></ul></div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Workflow catalog">
        <div className="section-heading"><p className="eyebrow">Workflow Engine</p><h2>Reusable task graphs stop at verification and human gates before consequential action.</h2></div>
        {summary.workflows.map((workflow) => (
          <article className="module-row" key={workflow.id}>
            <div><span>{workflow.domain}</span><h2>{workflow.title}</h2></div>
            <p>{workflow.definitionOfDone.goal}</p>
            <div><strong>Agents</strong><p>{workflow.participatingAgents.join(", ")}</p></div>
            <div><strong>Boundary</strong><p>External actions enabled: {workflow.externalActionsEnabled ? "yes" : "no"}</p></div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Context and model routing">
        <div className="section-heading"><p className="eyebrow">Context Fabric + Multi-Model Router</p><h2>Cited context is ranked as untrusted data; policy selects a model class without making a provider call.</h2></div>
        {summary.context.records.map((record) => (
          <article className="module-row" key={record.id}>
            <div><span>{record.trustTier}</span><h2>{record.sourceTitle}</h2></div>
            <p>{record.excerpt}</p>
            <div><strong>Ranking</strong><ul className="compact-list"><li>Unified: {record.unifiedScore}</li><li>Ontology: {record.ontologyScore}</li><li>Graph: {record.graphScore}</li><li>Freshness: {record.freshnessScore}</li></ul></div>
            <div><strong>Citation</strong><p>{record.citation}</p></div>
          </article>
        ))}
        <article className="module-row">
          <div><span>{summary.modelRoute.policyProfile}</span><h2>Model routing explanation</h2></div>
          <p>{summary.modelRoute.routingReason}</p>
          <div><strong>Selection</strong><ul className="compact-list"><li>Provider class: {summary.modelRoute.providerClass}</li><li>Model: {summary.modelRoute.selectedModelProfile}</li><li>Human review: {summary.modelRoute.requiresHumanReview ? "required" : "policy-dependent"}</li></ul></div>
          <div><strong>Execution</strong><p>Provider calls executed: {summary.modelRoute.providerCallsExecuted ? "yes" : "no"}</p></div>
        </article>
      </section>

      <section className="table-section" aria-label="Verification and reasoning observatory">
        <div className="section-heading"><p className="eyebrow">Verification + Reasoning Observatory</p><h2>Operational evidence is visible without exposing hidden chain-of-thought.</h2></div>
        <article className="module-row">
          <div><span>{summary.verification.allPass ? "pass" : "review-required"}</span><h2>Verification result</h2></div>
          <p>{summary.verification.recommendedAction}</p>
          <div><strong>Trust</strong><ul className="compact-list"><li>Total: {summary.verification.trustScore.total}</li><li>Evidence coverage: {summary.verification.trustScore.evidenceCoverage}</li><li>Policy compliance: {summary.verification.trustScore.policyCompliance}</li></ul></div>
          <div><strong>Failed checks</strong><p>{summary.verification.failedChecks.join(", ") || "none"}</p></div>
        </article>
        <article className="module-row">
          <div><span>{summary.reasoningObservatory.pauseRequired ? "paused" : "within-scope"}</span><h2>Objective drift monitor</h2></div>
          <p>{summary.reasoningObservatory.recommendedAction}</p>
          <div><strong>Current step</strong><p>{summary.reasoningObservatory.currentStep}</p></div>
          <div><strong>Drift flags</strong><p>{summary.reasoningObservatory.objectiveDriftFlags.join(", ") || "none"}</p></div>
        </article>
      </section>

      <section className="table-section" aria-label="ConsequenceBench and artifacts">
        <div className="section-heading"><p className="eyebrow">ConsequenceBench + Artifacts</p><h2>High-consequence, worst-group, edge-case, lineage, and staleness evidence outrank generic leaderboard scores.</h2></div>
        <article className="module-row">
          <div><span>{summary.consequenceBench.evaluationStatus}</span><h2>Consequence-weighted benchmark</h2></div>
          <p>{summary.consequenceBench.boundary}</p>
          <div><strong>Coverage</strong><ul className="compact-list"><li>Cases: {summary.consequenceBench.caseCount}</li><li>High-consequence performance: {summary.consequenceBench.highConsequencePerformance}</li><li>Worst-group performance: {summary.consequenceBench.worstGroupPerformance}</li></ul></div>
          <div><strong>Distribution shift</strong><p>{summary.consequenceBench.distributionShiftPerformance}</p></div>
        </article>
        <article className="module-row">
          <div><span>{summary.artifacts.staleness.stale ? "stale" : "current-metadata"}</span><h2>Artifact lineage</h2></div>
          <p>{summary.artifacts.staleness.recommendedAction}</p>
          <div><strong>Artifacts</strong><p>{summary.artifacts.sample.length}</p></div>
          <div><strong>External use</strong><p>{summary.artifacts.staleness.externalUseAllowed ? "allowed" : "human approval required"}</p></div>
        </article>
      </section>

      <section className="table-section" aria-label="Capital and compute resilience">
        <div className="section-heading"><p className="eyebrow">Capital Intelligence + Compute Resilience</p><h2>Internal opportunity analysis and infrastructure resilience stay evidence-led and approval-gated.</h2></div>
        <article className="module-row"><div><span>{summary.capitalIntelligence.status}</span><h2>Capital Intelligence Copilot</h2></div><p>{summary.capitalIntelligence.boundary}</p><div><strong>Profiles</strong><p>{summary.capitalIntelligence.profiles.length}</p></div><div><strong>Outbound</strong><p>{summary.capitalIntelligence.outboundPolicy.outboundAllowed ? "enabled" : "disabled; CEO approval required"}</p></div></article>
        {summary.computeResilience.profiles.map((profile) => (
          <article className="module-row" key={profile.profileId}><div><span>{profile.readiness}</span><h2>{profile.deploymentProfile}</h2></div><p>Compute resilience score: {profile.computeResilienceScore}</p><div><strong>Fallback</strong><p>Policy reevaluation: {profile.fallbackRequiresPolicyReevaluation ? "required" : "not required"}</p></div><div><strong>Migration</strong><p>Silent protected migration: {profile.silentProtectedWorkloadMigrationAllowed ? "allowed" : "blocked"}</p></div></article>
        ))}
      </section>

      <section className="table-section" aria-label="Platform capability and portfolio strategy">
        <div className="section-heading">
          <p className="eyebrow">Platform Map + Portfolio Discipline</p>
          <h2>Every capability declares its owner, evidence, commercial path, risk, activation state, and retained authority.</h2>
        </div>
        <article className="module-row">
          <div><span>{summary.platformStrategy.validation.valid ? "registry-valid" : "review-required"}</span><h2>{summary.platformStrategy.coreWedge.offer}</h2></div>
          <p>{summary.platformStrategy.nextBestAction}</p>
          <div><strong>Core workflow</strong><p>{summary.platformStrategy.coreWedge.productWorkflow}</p></div>
          <div><strong>Progression</strong><p>{summary.platformStrategy.coreWedge.progression.join(" → ")}</p></div>
        </article>
        {summary.platformStrategy.capabilities.map((capability) => (
          <article className="module-row" key={capability.id}>
            <div><span>{capability.activationStatus}</span><h2>{capability.name}</h2></div>
            <p>{capability.purpose}</p>
            <div><strong>Ownership + evidence</strong><ul className="compact-list"><li>{capability.owner}</li><li>{capability.evidenceStatus}</li><li>Risk: {capability.riskTier}</li></ul></div>
            <div><strong>Commercial discipline</strong><ul className="compact-list"><li>{capability.monetizationPath}</li><li>Public claim: {capability.publicClaimStatus}</li><li>External actions: disabled</li></ul></div>
          </article>
        ))}
        {summary.platformStrategy.strategicMetrics.map((metric) => (
          <article className="module-row" key={metric.id}>
            <div><span>{metric.evidenceStatus}</span><h2>{metric.name}</h2></div>
            <p>{metric.formula}</p>
            <div><strong>Current value</strong><p>{metric.currentValue ?? "baseline not collected"}</p></div>
            <div><strong>Boundary</strong><p>{metric.blockedInterpretation}</p></div>
          </article>
        ))}
        {summary.platformStrategy.portfolioScorecards.map((entry) => (
          <article className="module-row" key={entry.id}>
            <div><span>{entry.category}</span><h2>{entry.id}</h2></div>
            <p>{entry.rationale}</p>
            <div><strong>Priority</strong><ul className="compact-list"><li>Score: {entry.priorityScore}/100</li><li>Confidence: {entry.confidence}</li><li>External authority: none</li></ul></div>
            <div><strong>Next action</strong><p>{entry.nextAction}</p></div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Platform graph and trust readiness">
        <div className="section-heading">
          <p className="eyebrow">Platform Graph + Trust Readiness</p>
          <h2>Architecture relationships and execution eligibility are machine-checkable without becoming authority.</h2>
        </div>
        <article className="module-row">
          <div><span>{summary.platformGraph.status}</span><h2>Canonical platform graph</h2></div>
          <p>{summary.platformGraph.boundary}</p>
          <div><strong>Coverage</strong><ul className="compact-list"><li>{summary.platformGraph.validation.nodeCount} nodes</li><li>{summary.platformGraph.validation.edgeCount} edges</li><li>{summary.platformGraph.validation.orphanNodeIds.length} orphan nodes</li></ul></div>
          <div><strong>Integrity</strong><p>{summary.platformGraph.integrityHash}</p></div>
        </article>
        {summary.trustReadiness.scenarios.map((scenario) => (
          <article className="module-row" key={scenario.auditHash}>
            <div><span>{scenario.decision}</span><h2>{scenario.capability?.product ?? "Unknown capability"}</h2></div>
            <p>{scenario.reasonCodes.join(", ") || "All synthetic execution checks passed."}</p>
            <div><strong>Internal readiness</strong><ul className="compact-list"><li>Score: {scenario.internalScore}</li><li>Human approval: {scenario.requiredHumanApproval ? "required" : "not required for this synthetic read-only scenario"}</li><li>Certification claim: prohibited</li></ul></div>
            <div><strong>Authority</strong><p>Production and distribution authority: not granted</p></div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Strategic decision intelligence">
        <div className="section-heading">
          <p className="eyebrow">Strategic Decision Intelligence</p>
          <h2>Commercial focus, investor diligence, partner fit, and human gates remain evidence-bound.</h2>
        </div>
        <article className="module-row">
          <div><span>{summary.strategicDecisionIntelligence.investorReadiness.status}</span><h2>Investor readiness evidence heuristic</h2></div>
          <p>{summary.strategicDecisionIntelligence.investorReadiness.scoreMeaning}</p>
          <div><strong>Coverage</strong><ul className="compact-list"><li>Score: {summary.strategicDecisionIntelligence.investorReadiness.score}/100</li><li>Dimensions: {summary.strategicDecisionIntelligence.investorReadiness.dimensions.length}</li><li>Material gaps: {summary.strategicDecisionIntelligence.investorReadiness.materialNoGoCount}</li></ul></div>
          <div><strong>Outbound</strong><p>Distribution authorized: no</p></div>
        </article>
        <article className="module-row">
          <div><span>PENDING_EXTERNAL_EVIDENCE</span><h2>Human-gate minimization</h2></div>
          <p>{summary.strategicDecisionIntelligence.humanGateMinimization.designObjective}</p>
          <div><strong>Accountability</strong><ul className="compact-list"><li>Human: {summary.strategicDecisionIntelligence.humanGateMinimization.counts.humanAccountability}</li><li>Commercial: {summary.strategicDecisionIntelligence.humanGateMinimization.counts.commercialAuthority}</li><li>Operator: {summary.strategicDecisionIntelligence.humanGateMinimization.counts.operatorAction}</li></ul></div>
          <div><strong>Approvals created by software</strong><p>{summary.strategicDecisionIntelligence.humanGateMinimization.externalApprovalsAchievedByThisReport}</p></div>
        </article>
        {summary.strategicDecisionIntelligence.ceoDecisions.map((decision) => (
          <article className="module-row" key={decision.decisionId}>
            <div><span>{decision.status}</span><h2>{decision.decisionRequired}</h2></div>
            <p>{decision.recommendation}</p>
            <div><strong>Default safe action</strong><p>{decision.defaultSafeAction}</p></div>
            <div><strong>Evidence</strong><p>{decision.evidence.join(", ")}</p></div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Approval achievement">
        <div className="section-heading"><p className="eyebrow">Approval Achievement</p><h2>Evidence, dependencies, owners, expiry, and authority stay explicit before scope expands.</h2></div>
        <article className="module-row">
          <div><span>{summary.approvalAchievement.status}</span><h2>Approval critical path</h2></div>
          <p>{summary.approvalAchievement.retainedBoundary}</p>
          <div><strong>Completed scope</strong><ul className="compact-list"><li>Automated technical gates: {summary.approvalAchievement.achievedTechnicalGateCount}</li><li>Human/external approvals: {summary.approvalAchievement.humanOrExternalApprovalsAchieved}</li></ul></div>
          <div><strong>Next candidate</strong><p>{summary.approvalAchievement.nextApprovalCandidate.title}</p></div>
        </article>
        {summary.approvalAchievement.nodes.map((approval) => (
          <article className="module-row" key={approval.id}>
            <div><span>{approval.status}</span><h2>{approval.title}</h2></div>
            <p>{approval.commercialValue}</p>
            <div><strong>Missing evidence</strong><p>{approval.missingEvidence.join(", ") || "none within automated technical scope"}</p></div>
            <div><strong>Next action</strong><p>{approval.nextAction}</p></div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Cross-platform release evidence">
        <div className="section-heading"><p className="eyebrow">Cross-Platform Evidence</p><h2>GitHub, Vercel, Supabase, Wix, and Figma evidence is reconciled before release claims expand.</h2></div>
        <article className="module-row">
          <div><span>{summary.platformEvidence.status}</span><h2>Release evidence decision</h2></div>
          <p>{summary.platformEvidence.boundary}</p>
          <div><strong>Current blockers</strong><p>{summary.platformEvidence.summary.blockedProviderCount}</p></div>
          <div><strong>Production promotion</strong><p>{summary.platformEvidence.summary.productionPromotionAllowed ? "allowed" : "blocked"}</p></div>
        </article>
        <article className="module-row">
          <div><span>{summary.platformEvidence.immediateCorrection.safeReplacement.eyebrow}</span><h2>{summary.platformEvidence.immediateCorrection.safeReplacement.heading}</h2></div>
          <p>{summary.platformEvidence.immediateCorrection.safeReplacement.body}</p>
          <div><strong>Primary action</strong><p>{summary.platformEvidence.immediateCorrection.safeReplacement.primaryAction}</p></div>
          <div><strong>Public disclosure</strong><p>{summary.platformEvidence.immediateCorrection.safeReplacement.disclosure}</p></div>
        </article>
        {summary.platformEvidence.records.map((record) => (
          <article className="module-row" key={record.id}>
            <div><span>{record.status} · {record.freshness}</span><h2>{record.provider} · {record.controlDomain}</h2></div>
            <p>{record.summary}</p>
            <div><strong>Remediation</strong><p>{record.remediationStatus}: {record.remediationEvidence.join(", ")}</p></div>
            <div><strong>Next action</strong><p>{record.nextAction}</p></div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Voice learning outcomes and audit">
        <div className="section-heading"><p className="eyebrow">Voice + Learning + Outcomes + Audit</p><h2>Simulation, reviewed corrections, baseline-first value measurement, and immutable evidence close the loop.</h2></div>
        <article className="module-row"><div><span>simulation-only</span><h2>Voice workflow</h2></div><p>{summary.voiceSimulation.retainedBoundary}</p><div><strong>States</strong><p>{summary.voiceSimulation.states.join(" → ")}</p></div><div><strong>Raw audio stored</strong><p>{summary.voiceSimulation.rawAudioStored ? "yes" : "no"}</p></div></article>
        <article className="module-row"><div><span>review-gated</span><h2>Learning proposals</h2></div><p>Memory records validated facts and decisions; learning proposals change behavior only through tests, approval, and normal deployment.</p><div><strong>Proposals</strong><p>{summary.learningProposals.length}</p></div><div><strong>Self-deployment</strong><p>{summary.governance.learningSelfDeploymentAllowed ? "allowed" : "blocked"}</p></div></article>
        <article className="module-row"><div><span>{summary.outcomes.status}</span><h2>Outcome and value intelligence</h2></div><p>{summary.outcomes.boundary}</p><div><strong>Metrics</strong><p>{summary.outcomes.metrics.length}</p></div><div><strong>Post values present</strong><p>{summary.outcomes.postImplementationValuesPresent ? "yes" : "no"}</p></div></article>
        <article className="module-row"><div><span>metadata-only</span><h2>Audit history</h2></div><p>Initiator, objective, model, context, tools, policy, approvals, verification, cost, latency, state, and rollback remain traceable without raw PHI, secrets, prompts, or chain-of-thought.</p><div><strong>Events</strong><p>{summary.auditHistory.length}</p></div><div><strong>Audit hash</strong><p>{summary.auditHistory[0]?.auditHash}</p></div></article>
      </section>
    </main>
  );
}
