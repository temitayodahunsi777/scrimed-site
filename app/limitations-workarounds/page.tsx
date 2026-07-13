import Link from "next/link";
import { getLimitationsWorkaroundSummary } from "../lib/limitationsWorkaroundOperations";

export const metadata = {
  title: "SCRIMED Limitations and Workaround Operations",
  description:
    "SCRIMED limitation, boundary, issue, and workaround control plane for safe alternatives, owners, proof routes, escalation triggers, and graduation gates."
};

export default function LimitationsWorkaroundPage() {
  const summary = getLimitationsWorkaroundSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/boundary-resolution">Boundary Register</Link>
        <p className="eyebrow">Limitations and workaround operations</p>
        <h1>SCRIMED turns every limitation into a safe operating path, owner, proof route, and graduation gate.</h1>
        <p className="hero-text">
          This control plane resolves the practical question behind every boundary: what do we
          do today, safely, while PHI, live care, legal, finance, security, certification,
          connector, API, AI, release, and global authority remain gated?
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>
            Download workaround brief
          </a>
          <Link className="secondary-action" href="/operational-efficiency">
            Resolve bottlenecks
          </Link>
          <Link className="secondary-action" href="/platform-power">
            Platform Power
          </Link>
          <Link className="secondary-action" href="/client-onboarding">
            Client Onboarding
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Limitations workaround summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Tracks</span>
          <strong>{summary.trackCount}</strong>
        </article>
        <article>
          <span>Open risks</span>
          <strong>{summary.openRiskCount}</strong>
        </article>
        <article>
          <span>Critical</span>
          <strong>{summary.criticalTrackCount}</strong>
        </article>
        <article>
          <span>High risk</span>
          <strong>{summary.highTrackCount}</strong>
        </article>
        <article>
          <span>Packets</span>
          <strong>{summary.packetCount}</strong>
        </article>
        <article>
          <span>Escalations</span>
          <strong>{summary.boundaryEscalationCount}</strong>
        </article>
        <article>
          <span>Playbooks</span>
          <strong>{summary.boundaryWorkaroundPlaybookCount}</strong>
        </article>
        <article>
          <span>Preflights</span>
          <strong>{summary.boundaryPreflightEvaluationCount}</strong>
        </article>
        <article>
          <span>Fail closed</span>
          <strong>{summary.failClosedPreflightCount}</strong>
        </article>
        <article>
          <span>Known blockers</span>
          <strong>{summary.resolutionWorkOrderCount}</strong>
        </article>
        <article>
          <span>Unresolved blockers</span>
          <strong>{summary.unresolvedResolutionWorkOrderCount}</strong>
        </article>
        <article>
          <span>Execution ledger</span>
          <strong>{summary.executionLedgerCount}</strong>
        </article>
        <article>
          <span>Resolved controls</span>
          <strong>{summary.resolvedExecutionLedgerCount}</strong>
        </article>
        <article>
          <span>Cadences</span>
          <strong>{summary.cadenceCount}</strong>
        </article>
        <article>
          <span>Proof routes</span>
          <strong>{summary.proofRouteCount}</strong>
        </article>
        <article>
          <span>Hard stops</span>
          <strong>{summary.hardStopCount}</strong>
        </article>
        <article>
          <span>Blocked claims</span>
          <strong>{summary.blockedClaimCount}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Limitations workaround boundary">
        <div>
          <p className="eyebrow">Operating boundary</p>
          <h2>Workarounds create safe motion; they do not create authority.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.operatingPath.map((step, index) => (
            <div className="layer-row" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Limitations as buyer confidence">
        <div className="section-heading">
          <p className="eyebrow">Boundaries buyers can trust</p>
          <h2>SCRIMED turns limitations into a safer buying path instead of hiding them until procurement.</h2>
          <p className="section-copy">
            The strategic message is simple: buyers can purchase no-PHI assessments and synthetic pilots now because SCRIMED
            keeps production, clinical, connector, security, and legal authority visibly gated.
          </p>
        </div>
        {summary.buyerConfidenceSignals.map((signal) => (
          <article className="module-row" key={signal.buyerConcern}>
            <div>
              <span>buyer concern</span>
              <h2>{signal.buyerConcern}</h2>
            </div>
            <p>{signal.trustMessage}</p>
            <div>
              <strong>{signal.commercialValue}</strong>
              <ul className="compact-list">
                <li>Proof route: {signal.proofRoute}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Boundary escalation matrix">
        <div className="section-heading">
          <p className="eyebrow">Boundary escalation matrix</p>
          <h2>High-risk requests now have deterministic triage before anyone improvises a promise.</h2>
          <p className="section-copy">
            Each pattern defines the immediate decision, safe response, owner, escalation path,
            decision SLA, hard stops, and evidence required before the boundary can graduate.
          </p>
        </div>
        {summary.boundaryEscalations.map((escalation) => (
          <article className="module-row" key={escalation.slug}>
            <div>
              <span>{escalation.severity} / {escalation.decisionSla}</span>
              <h2>{escalation.requestPattern}</h2>
            </div>
            <p>{escalation.immediateDecision}</p>
            <div>
              <strong>{escalation.requiredOwner}</strong>
              <ul className="compact-list">
                <li>Safe response: {escalation.safeResponse}</li>
                <li>Path: {escalation.escalationPath.join(", ")}</li>
                <li>Hard stops: {escalation.hardStops.join(", ")}</li>
                <li>Evidence: {escalation.graduationEvidence.join(", ")}</li>
                <li>Proof routes: {escalation.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Boundary workaround playbook">
        <div className="section-heading">
          <p className="eyebrow">Boundary workaround playbook</p>
          <h2>Every preserved NO-GO boundary now maps to a safe alternative before execution expands.</h2>
          <p className="section-copy">
            The playbook gives operators deterministic trigger signals, immediate decisions, mapped packets,
            validation commands, fail-closed expectations, required approvals, residual risks, and graduation evidence.
          </p>
        </div>
        {summary.boundaryWorkaroundPlaybook.map((item) => (
          <article className="module-row" key={item.slug}>
            <div>
              <span>{item.status}</span>
              <h2>{item.boundary}</h2>
            </div>
            <p>{item.immediateDecision}</p>
            <div>
              <strong>{item.mappedPacket}</strong>
              <ul className="compact-list">
                <li>Signals: {item.triggerSignals.join(", ")}</li>
                <li>Safe alternative: {item.safeAlternative}</li>
                <li>Approvals: {item.requiredApprovals.join(", ")}</li>
                <li>Validate: {item.validationCommand}</li>
                <li>Fail closed: {item.failClosedExpectation}</li>
                <li>Residual risk: {item.residualRisk}</li>
                <li>Hard stops: {item.hardStops.join(", ")}</li>
                <li>Proof routes: {item.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Boundary preflight evaluations">
        <div className="section-heading">
          <p className="eyebrow">Boundary preflight evaluator</p>
          <h2>Gray-zone requests are classified before they become execution, sales, or clinical promises.</h2>
          <p className="section-copy">
            Synthetic preflight cases prove SCRIMED maps risky requests to fail-closed decisions,
            approval gates, safe workaround packets, proof routes, and no-authority outputs.
          </p>
        </div>
        {summary.boundaryPreflightEvaluations.map((evaluation) => (
          <article className="module-row" key={evaluation.requestId}>
            <div>
              <span>{evaluation.decision}</span>
              <h2>{evaluation.requestId}</h2>
            </div>
            <p>{evaluation.immediateDecision}</p>
            <div>
              <strong>{evaluation.mappedPackets.join(", ") || "synthetic assessment"}</strong>
              <ul className="compact-list">
                <li>Matched playbooks: {evaluation.matchedPlaybookSlugs.join(", ") || "none"}</li>
                <li>Safe alternative: {evaluation.safeAlternative}</li>
                <li>Approvals: {evaluation.requiredApprovals.join(", ") || "human review before external use"}</li>
                <li>Validate: {evaluation.validationCommands.join(", ") || "npm run smoke:limitations-workarounds"}</li>
                <li>External execution allowed: {evaluation.externalExecutionAllowed ? "yes" : "no"}</li>
                <li>PHI processing allowed: {evaluation.phiProcessingAllowed ? "yes" : "no"}</li>
                <li>Autonomous action allowed: {evaluation.autonomousActionAllowed ? "yes" : "no"}</li>
                <li>Audit: {evaluation.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Known limitation resolution queue">
        <div className="section-heading">
          <p className="eyebrow">Known limit resolution queue</p>
          <h2>Current blockers now have safe workarounds, next proof commands, and graduation gates.</h2>
          <p className="section-copy">
            These are the practical boundaries SCRIMED is actively carrying forward from build and smoke execution:
            AAL2 operator proof, the AAL2 durable-store token blocker, durable-store feature flags, sandbox DNS,
            Supabase identity posture, local build tooling, and release hygiene.
          </p>
        </div>
        {summary.resolutionWorkOrders.map((workOrder) => (
          <article className="module-row" key={workOrder.slug}>
            <div>
              <span>{workOrder.severity} / {workOrder.status}</span>
              <h2>{workOrder.knownLimit}</h2>
            </div>
            <p>{workOrder.currentImpact}</p>
            <div>
              <strong>{workOrder.owner}</strong>
              <ul className="compact-list">
                <li>Workaround: {workOrder.immediateWorkaround}</li>
                <li>Resolution: {workOrder.durableResolution}</li>
                <li>Next proof: {workOrder.nextProofCommand}</li>
                <li>Fail-closed check: {workOrder.failClosedCheck}</li>
                <li>Gate: {workOrder.graduationGate}</li>
                <li>Hard stops: {workOrder.hardStops.join(", ")}</li>
                <li>Proof routes: {workOrder.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Recent workaround execution ledger">
        <div className="section-heading">
          <p className="eyebrow">Recent workaround execution ledger</p>
          <h2>Resolved boundaries are retained as no-secret proof, rollback controls, and residual-risk guidance.</h2>
          <p className="section-copy">
            This ledger captures the practical fixes from SCRIMED execution: tenant-admin workspace bootstrap,
            AAL2 token-helper precedence, durable-store PHI guard precision, strict AAL2 durable-store smoke,
            and deploy hygiene. It records proof posture without storing bearer tokens, secrets, PHI, or buyer-release authority.
          </p>
        </div>
        {summary.executionLedger.map((entry) => (
          <article className="module-row" key={entry.slug}>
            <div>
              <span>{entry.state}</span>
              <h2>{entry.title}</h2>
            </div>
            <p>{entry.resolvedBoundary}</p>
            <div>
              <strong>{entry.owner}</strong>
              <ul className="compact-list">
                <li>Upgrade: {entry.operationalUpgrade}</li>
                <li>Evidence retained: {entry.evidenceRetained}</li>
                <li>Verify: {entry.verificationCommand}</li>
                <li>Rollback/fallback: {entry.rollbackOrFallback}</li>
                <li>Residual boundary: {entry.residualBoundary}</li>
                <li>Next control: {entry.nextControl}</li>
                <li>Hard stops: {entry.hardStops.join(", ")}</li>
                <li>Proof routes: {entry.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Limitation workaround tracks">
        <div className="section-heading">
          <p className="eyebrow">Issue tracks</p>
          <h2>Each hard boundary now has an owned workaround, fallback path, trigger, and graduation gate.</h2>
        </div>
        {summary.tracks.map((track) => (
          <article className="module-row" key={track.slug}>
            <div>
              <span>{track.severity} / {track.state}</span>
              <h2>{track.title}</h2>
            </div>
            <p>{track.limitation}</p>
            <div>
              <strong>{track.owner}</strong>
              <ul className="compact-list">
                <li>Workaround: {track.safeWorkaround}</li>
                <li>Fallback: {track.fallbackPath}</li>
                <li>Escalate: {track.escalationTrigger}</li>
                <li>Gate: {track.graduationGate}</li>
                <li>Proof routes: {track.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Workaround packets">
        <div className="section-heading">
          <p className="eyebrow">Workaround packets</p>
          <h2>Reusable packets keep blocked work moving without improvising around regulated gates.</h2>
        </div>
        <div className="principle-grid">
          {summary.packets.map((packet) => (
            <article key={packet.slug}>
              <span>{packet.owner}</span>
              <h3>{packet.name}</h3>
              <p>{packet.usedWhen}</p>
              <ul className="compact-list">
                <li>Inputs: {packet.safeInputs.join(", ")}</li>
                <li>Output: {packet.output}</li>
                <li>Expiry: {packet.expiryRule}</li>
                <li>Hard stops: {packet.hardStops.join(", ")}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Workaround cadences and metrics">
        <div className="section-heading">
          <p className="eyebrow">Cadence and proof</p>
          <h2>Review loops keep workarounds from becoming stale, informal, or overclaimed.</h2>
        </div>
        {summary.cadences.map((cadence) => (
          <article className="module-row" key={cadence.cadence}>
            <div>
              <span>cadence</span>
              <h2>{cadence.cadence}</h2>
            </div>
            <p>{cadence.decisionOutput}</p>
            <div>
              <strong>{cadence.owner}</strong>
              <ul className="compact-list">
                <li>Signals: {cadence.reviewedSignals.join(", ")}</li>
                <li>Hard stops: {cadence.hardStops.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
        {summary.metrics.map((metric) => (
          <article className="module-row" key={metric.metric}>
            <div>
              <span>metric</span>
              <h2>{metric.metric}</h2>
            </div>
            <p>{metric.currentSignal}</p>
            <div>
              <strong>{metric.targetSignal}</strong>
              <ul className="compact-list">
                <li>Evidence: {metric.evidenceRoute}</li>
                <li>{metric.boundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
