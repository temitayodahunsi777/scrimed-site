import Link from "next/link";

import { getP34AdaptiveGovernanceSummary } from "../lib/scrimed-p34";

export const metadata = {
  title: "SCRIMED p.34 Adaptive Governance",
  description:
    "Synthetic, human-supervised workflow contracts, model-fit routing, action maturity, continuity, provenance, assurance, and operator accountability."
};

function Status({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const tone = normalized.includes("pass") || normalized.includes("allow") || normalized.includes("normal") || normalized.includes("valid")
    ? "ready"
    : normalized.includes("block") || normalized.includes("fail") || normalized.includes("refusal")
      ? "blocked"
      : "review";
  return <span className={`status ${tone}`}>{value}</span>;
}

export default function ScrimedP34Page() {
  const summary = getP34AdaptiveGovernanceSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/scrimed-control-plane">Intelligence Control Plane</Link>
        <p className="eyebrow">SCRIMED p.34</p>
        <h1>Adaptive governance with proof at every decision.</h1>
        <p className="hero-text">
          Vendor-neutral capability admission, deterministic-first model fit, versioned workflow contracts,
          approval-bound autonomy, PHI and sandbox boundaries, continuity evidence, DICOM privacy, external
          validation, quality ratchets, and task-level economics in one synthetic operator surface.
        </p>
        <div className="hero-actions" aria-label="p.34 resources">
          <Link href={summary.apiRoute}>Inspect API</Link>
          <Link href={summary.briefRoute}>Download Brief</Link>
          <Link href="/scrimed-p33">Review p.33 Baseline</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="p.34 status">
        <article><span>Status</span><strong>{summary.status}</strong></article>
        <article><span>Provider routes</span><strong>{summary.registry.providers.length}</strong></article>
        <article><span>Technique</span><strong>{summary.taskRoute.selectedTechnique ?? "safe refusal"}</strong></article>
        <article><span>Context chunks</span><strong>{summary.context.chunks.length}</strong></article>
        <article><span>Workflow evidence</span><strong>{summary.workflowContractDecision.evidenceFreshness}</strong></article>
        <article><span>Action state</span><strong>{summary.actionMaturity.events.at(-1)?.nextState ?? "none"}</strong></article>
        <article><span>Autonomy</span><strong>{summary.clinicalOperatingSystem.autonomy.grantedTier}</strong></article>
        <article><span>PHI route</span><strong>{summary.clinicalOperatingSystem.phi.egress.providerCallAuthorized ? "authorized" : "disabled"}</strong></article>
        <article><span>Sandbox</span><strong>{summary.clinicalOperatingSystem.sandbox.decision}</strong></article>
        <article><span>Continuity days</span><strong>{summary.continuity.continuityDurationDays}</strong></article>
        <article><span>Gate passes</span><strong>{summary.gateCounts.PASS}</strong></article>
        <article><span>Operator gates</span><strong>{summary.gateCounts.OPERATOR_REQUIRED}</strong></article>
        <article><span>Blocked gates</span><strong>{summary.gateCounts.BLOCKED}</strong></article>
        <article><span>Provider calls</span><strong>{summary.externalProviderCallsExecuted ? "executed" : "none"}</strong></article>
      </section>

      <section className="table-section" aria-label="Autonomy privacy and sandbox controls">
        <div className="section-heading">
          <p className="eyebrow">Authority + Isolation</p>
          <h2>Every action stays inside its exact identity, scope, and stopping condition.</h2>
        </div>
        <article className="module-row">
          <div><Status value={summary.clinicalOperatingSystem.autonomy.decision} /><h2>Autonomy contract</h2></div>
          <p>{summary.clinicalOperatingSystem.autonomy.stoppingCondition}</p>
          <div><strong>Tier</strong><p>{summary.clinicalOperatingSystem.autonomy.requestedTier} requested · {summary.clinicalOperatingSystem.autonomy.grantedTier} granted</p></div>
          <div><strong>Approval</strong><p>{summary.clinicalOperatingSystem.autonomy.authorizationState}</p></div>
        </article>
        <article className="module-row">
          <div><Status value={summary.clinicalOperatingSystem.phi.startupValidation.decision} /><h2>PHI and secret boundary</h2></div>
          <p>{summary.clinicalOperatingSystem.phi.registry.fields.length} classified fields · unknown fields fail closed.</p>
          <div><strong>Egress</strong><p>{summary.clinicalOperatingSystem.phi.egress.decision}</p></div>
          <div><strong>Break glass</strong><p>{summary.clinicalOperatingSystem.phi.breakGlass.decision}</p></div>
        </article>
        <article className="module-row">
          <div><Status value={summary.clinicalOperatingSystem.sandbox.decision} /><h2>Agent sandbox</h2></div>
          <p>Tenant workspace admitted with default-deny network and disposable state.</p>
          <div><strong>Egress destinations</strong><p>{summary.clinicalOperatingSystem.sandbox.networkDestinationsAllowed.length}</p></div>
          <div><strong>External runtime</strong><p>{summary.clinicalOperatingSystem.sandbox.externalSandboxActivated ? "active" : "not activated"}</p></div>
        </article>
      </section>

      <section className="table-section" aria-label="Retrieval validation and oversight controls">
        <div className="section-heading">
          <p className="eyebrow">Evidence + Oversight</p>
          <h2>Tenant-first retrieval and external proof keep apparent success from weakening review.</h2>
        </div>
        <article className="module-row">
          <div><Status value={summary.clinicalOperatingSystem.retrieval.decision} /><h2>Clinical retrieval</h2></div>
          <p>{summary.clinicalOperatingSystem.retrieval.resultIds.length} current result · citation coverage {(summary.clinicalOperatingSystem.retrieval.citationCoverage * 100).toFixed(0)}%</p>
          <div><strong>Ambiguity</strong><p>{summary.clinicalOperatingSystem.retrieval.ambiguousEntityIds.length ? "abstained" : "none"}</p></div>
          <div><strong>Tenant filter</strong><p>{summary.clinicalOperatingSystem.retrieval.tenantFilterAppliedBeforeRanking ? "before ranking" : "failed"}</p></div>
        </article>
        <article className="module-row">
          <div><Status value={summary.clinicalOperatingSystem.externalValidation.decision} /><h2>External validation</h2></div>
          <p>{summary.clinicalOperatingSystem.externalValidation.reasonCodes.join(" · ")}</p>
          <div><strong>Evidence</strong><p>{summary.clinicalOperatingSystem.externalValidation.evidenceFresh ? "fresh internal" : "stale or missing"}</p></div>
          <div><strong>Clinical production</strong><p>not eligible</p></div>
        </article>
        <article className="module-row">
          <div><Status value={summary.clinicalOperatingSystem.oversight.decision} /><h2>Oversight drift</h2></div>
          <p>Reviewed {(summary.clinicalOperatingSystem.oversight.reviewedActionPercentage * 100).toFixed(0)}% · {summary.clinicalOperatingSystem.oversight.errorVolume} errors</p>
          <div><strong>Silent acceptance</strong><p>{(summary.clinicalOperatingSystem.oversight.silentAcceptanceRate * 100).toFixed(0)}%</p></div>
          <div><strong>Review reduction</strong><p>{summary.clinicalOperatingSystem.oversight.oversightReductionAuthorized ? "authorized" : "not authorized"}</p></div>
        </article>
      </section>

      <section className="table-section" aria-label="Patient coding and recovery controls">
        <div className="section-heading">
          <p className="eyebrow">Outputs + Recovery</p>
          <h2>Approved information can be prepared while delivery, billing, and unsafe retries stay blocked.</h2>
        </div>
        <article className="module-row">
          <div><Status value={summary.clinicalOperatingSystem.patientTakeHome.decision} /><h2>Patient Take-Home</h2></div>
          <p>{summary.clinicalOperatingSystem.patientTakeHome.sections.length} grounded section · {summary.clinicalOperatingSystem.patientTakeHome.language}</p>
          <div><strong>Channel</strong><p>{summary.clinicalOperatingSystem.patientTakeHome.channel}</p></div>
          <div><strong>Delivery</strong><p>{summary.clinicalOperatingSystem.patientTakeHome.deliveryAuthorized ? "authorized" : "clinician review pending"}</p></div>
        </article>
        <article className="module-row">
          <div><Status value={summary.clinicalOperatingSystem.coding.decision} /><h2>Medical coding contract</h2></div>
          <p>{summary.clinicalOperatingSystem.coding.effectiveMode} mode</p>
          <div><strong>Draft</strong><p>{summary.clinicalOperatingSystem.coding.draftAuthorized ? "review draft allowed" : "blocked"}</p></div>
          <div><strong>Billing submission</strong><p>disabled</p></div>
        </article>
        <article className="module-row">
          <div><Status value={summary.clinicalOperatingSystem.operations.nextState} /><h2>Retry and recovery</h2></div>
          <p>{summary.clinicalOperatingSystem.operations.retryAllowed ? "Bounded checkpoint retry" : "Dead-letter review"}</p>
          <div><strong>Idempotency</strong><p>{summary.clinicalOperatingSystem.operations.idempotencyPreserved ? "preserved" : "failed"}</p></div>
          <div><strong>Claim evidence</strong><p>{summary.clinicalOperatingSystem.claims.decision}</p></div>
        </article>
      </section>

      <section className="section-band split-band" aria-label="p.34 boundary">
        <div>
          <p className="eyebrow">Optimization Target</p>
          <h2>Cost per safe, accepted outcome.</h2>
        </div>
        <div>
          <p>{summary.boundary}</p>
          <ul className="compact-list">
            <li>PHI processed: no</li>
            <li>Clinical action authority: no</li>
            <li>Deployment authority: no</li>
            <li>Customer activation authority: no</li>
          </ul>
        </div>
      </section>

      <section className="table-section" aria-label="Capability admission and routing">
        <div className="section-heading">
          <p className="eyebrow">Capability + Route</p>
          <h2>Unknown capability denies; sufficient deterministic methods lead.</h2>
        </div>
        <article className="module-row">
          <div><Status value={summary.capabilityAdmission.decision} /><h2>Capability admission</h2></div>
          <p>Registry {summary.registry.registryVersion}</p>
          <div><strong>Route</strong><p>{summary.capabilityAdmission.routeId ?? "denied"}</p></div>
          <div><strong>Provider execution</strong><p>{summary.capabilityAdmission.providerCallAuthorized ? "authorized" : "disabled"}</p></div>
        </article>
        <article className="module-row">
          <div><Status value={summary.taskRoute.decision} /><h2>Deterministic-first route</h2></div>
          <p>{summary.taskPolicy.intendedUse}</p>
          <div><strong>Selected</strong><p>{summary.taskRoute.selectedTechnique ?? "human escalation"}</p></div>
          <div><strong>Evidence</strong><p>{summary.taskRoute.decisionHash}</p></div>
        </article>
      </section>

      <section className="table-section" aria-label="Context and imaging privacy">
        <div className="section-heading">
          <p className="eyebrow">Provenance + Privacy</p>
          <h2>Evidence remains attributable, conflicting, and reviewable.</h2>
        </div>
        <article className="module-row">
          <div><Status value={summary.context.generationDecision} /><h2>Healthcare context</h2></div>
          <p>{summary.context.purpose}</p>
          <div><strong>Coverage</strong><p>{summary.context.chunks.length} chunks · {summary.context.conflictGroupIds.length} conflict groups</p></div>
          <div><strong>Claims</strong><p>{summary.claimValidation.decision}</p></div>
        </article>
        <article className="module-row">
          <div><Status value={summary.dicomPrivacy.decision} /><h2>DICOM privacy manifest</h2></div>
          <p>{summary.dicomPrivacy.disposition}</p>
          <div><strong>Private tags</strong><p>{summary.dicomPrivacy.detectedPrivateTags.length}</p></div>
          <div><strong>Export</strong><p>{summary.dicomPrivacy.exportAuthorized ? "authorized" : "human approval required"}</p></div>
        </article>
      </section>

      <section className="table-section" aria-label="Assurance and resilience">
        <div className="section-heading">
          <p className="eyebrow">Assurance + Resilience</p>
          <h2>Hard floors stay hard under regression, outage, and budget pressure.</h2>
        </div>
        <article className="module-row">
          <div><Status value={summary.evaluation.decision} /><h2>Two-loop evaluation</h2></div>
          <p>Inner fixed suite: {summary.evaluation.innerLoopPassed ? "pass" : "fail"} · Outer shadow metrics: {summary.evaluation.outerLoopPassed ? "pass" : "fail"}</p>
          <div><strong>Promotion</strong><p>{summary.evaluation.automaticPromotionAllowed ? "automatic" : "independent review required"}</p></div>
          <div><strong>Rollback</strong><p>{summary.evaluation.rollbackImmediate ? "ready" : "blocked"}</p></div>
        </article>
        <article className="module-row">
          <div><Status value={summary.finOps.runtimeState} /><h2>Task economics</h2></div>
          <p>Cost per completed synthetic task: ${summary.finOps.costPerCompletedTaskUsd?.toFixed(4) ?? "not available"}</p>
          <div><strong>Cache hit</strong><p>{(summary.finOps.cacheHitRatio * 100).toFixed(1)}%</p></div>
          <div><strong>Placement</strong><p>{summary.placement.selectedPlacementId ?? "safe refusal"}</p></div>
        </article>
      </section>

      <section className="table-section" aria-label="Agent operations">
        <div className="section-heading">
          <p className="eyebrow">Agent Operations</p>
          <h2>Human ownership and evidence completeness remain visible.</h2>
        </div>
        {summary.operations.map((operation) => (
          <article className="module-row" key={operation.operationId}>
            <div><Status value={operation.state} /><h2>{operation.task}</h2></div>
            <p>{operation.workflow}</p>
            <div><strong>Owner</strong><p>{operation.responsibleHumanOwner}</p></div>
            <div><strong>Review</strong><p>{(operation.humanReviewRate * 100).toFixed(0)}% · {operation.approvalState}</p></div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Workflow and action maturity">
        <div className="section-heading">
          <p className="eyebrow">Workflow + Action</p>
          <h2>Execution starts with a complete contract and advances one authorized state at a time.</h2>
        </div>
        <article className="module-row">
          <div><Status value={summary.workflowContractDecision.decision} /><h2>{summary.workflowContract.workflowId}</h2></div>
          <p>{summary.workflowContract.intendedUse}</p>
          <div><strong>Owner</strong><p>{summary.workflowContract.namedOwner}</p></div>
          <div><strong>Release evidence</strong><p>{summary.workflowContract.releaseEvidence.length} records · {summary.workflowContractDecision.evidenceFreshness}</p></div>
        </article>
        <article className="module-row">
          <div><Status value={summary.workflowModelFit.decision} /><h2>Model-fit route</h2></div>
          <p>{summary.workflowModelFit.routeReasons.join(" · ")}</p>
          <div><strong>Selected route</strong><p>{summary.workflowModelFit.selectedRouteId ?? "safe refusal"}</p></div>
          <div><strong>Public rank</strong><p>{summary.workflowModelFit.publicBenchmarkRankUsed ? "used" : "never used"}</p></div>
        </article>
        <article className="module-row">
          <div><Status value={summary.actionMaturity.events.at(-1)?.nextState ?? "blocked"} /><h2>Action maturity</h2></div>
          <p>{summary.actionMaturity.events.length} attributable transitions; external writes remain disabled.</p>
          <div><strong>Chain</strong><p>{summary.actionMaturity.verification.valid ? "valid" : "failed"}</p></div>
          <div><strong>Execution</strong><p>human approval pending</p></div>
        </article>
      </section>

      <section className="table-section" aria-label="Continuity and expansion evidence">
        <div className="section-heading">
          <p className="eyebrow">Continuity + Expansion</p>
          <h2>Relationship continuity is measurable; expansion is earned through fresh evidence.</h2>
        </div>
        <article className="module-row">
          <div><Status value={summary.continuity.decision} /><h2>Continuity operations</h2></div>
          <p>{summary.continuity.transferCount} transfer · {summary.continuity.interruptionCount} interruption · {summary.continuity.reconnectCount} reconnect</p>
          <div><strong>Follow-up queue</strong><p>{summary.continuity.followUpWorkQueue.length} human-reviewed items</p></div>
          <div><strong>Claims</strong><p>no causal or therapeutic authority</p></div>
        </article>
        <article className="module-row">
          <div><Status value={summary.trustExpansion.decision} /><h2>Trust-based expansion</h2></div>
          <p>{summary.trustExpansion.thresholdsPassed ? "Thresholds met" : "Thresholds missed"}; named approvals {summary.trustExpansion.namedApprovalsComplete ? "complete" : "pending"}.</p>
          <div><strong>Evidence</strong><p>{summary.trustExpansion.evidenceFresh ? "fresh" : "stale or missing"}</p></div>
          <div><strong>Expansion</strong><p>{summary.trustExpansion.expansionAuthorized ? "authorized" : "disabled"}</p></div>
        </article>
        <article className="module-row">
          <div><Status value={summary.publicSectorReadiness.decision} /><h2>Public-sector evidence</h2></div>
          <p>Documentary coverage {(summary.publicSectorReadiness.documentaryCoverage * 100).toFixed(0)}%.</p>
          <div><strong>Procurement review</strong><p>{summary.publicSectorReadiness.readyForProcurementReview ? "eligible" : "evidence pending"}</p></div>
          <div><strong>Eligibility claim</strong><p>not authorized</p></div>
        </article>
      </section>

      <section className="table-section" aria-label="Challenger and return on investment telemetry">
        <div className="section-heading">
          <p className="eyebrow">Challengers + ROI</p>
          <h2>Research candidates stay isolated while value telemetry follows verified workflows.</h2>
        </div>
        <article className="module-row">
          <div><Status value={summary.challengerHarness.enabled ? "review" : "blocked"} /><h2>Isolated challenger harness</h2></div>
          <p>{summary.challengerHarness.profiles.length} unverified research profiles; no provider calls or PHI.</p>
          <div><strong>Promotion</strong><p>{summary.challengerHarness.evaluation.productionPromotionAuthorized ? "authorized" : "disabled"}</p></div>
          <div><strong>Local evidence</strong><p>{summary.challengerHarness.evaluation.locallyReproducedEvidenceAccepted ? "accepted" : "not reproduced"}</p></div>
        </article>
        <article className="module-row">
          <div><Status value={summary.roiDashboard.expansionGateStatus} /><h2>Workflow ROI</h2></div>
          <p>Asking {summary.roiDashboard.askingVersusDoing.asking} · doing {summary.roiDashboard.askingVersusDoing.doing} · verified outcomes {summary.roiDashboard.verifiedOutcomes}</p>
          <div><strong>Human review</strong><p>{summary.roiDashboard.humanReviewMinutes} minutes</p></div>
          <div><strong>Cost/workflow</strong><p>${summary.roiDashboard.costPerCompletedWorkflowUsd?.toFixed(4) ?? "not available"}</p></div>
        </article>
      </section>

      <section className="table-section" aria-label="p.34 gates">
        <div className="section-heading">
          <p className="eyebrow">Release Gates</p>
          <h2>Local proof and external authority remain separate.</h2>
        </div>
        {summary.gateMatrix.map((gate) => (
          <article className="module-row" key={gate.gateId}>
            <div><Status value={gate.status} /><h2>{gate.gateId}</h2></div>
            <p>{gate.description}</p>
            <div><strong>Owner</strong><p>{gate.ownerRole}</p></div>
            <div><strong>Reason</strong><p>{gate.reasonCodes.join(", ") || "Objective local evidence passed."}</p></div>
          </article>
        ))}
      </section>
    </main>
  );
}
