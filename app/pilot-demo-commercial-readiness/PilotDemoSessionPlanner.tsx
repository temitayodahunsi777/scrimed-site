"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  buildPilotDemoSessionPlan,
  pilotDemoSessionAudienceOptions,
  pilotDemoSessionFocusOptions,
  pilotDemoSessionLengthOptions,
  serializePilotDemoSessionPlanMarkdown,
  type PilotDemoSessionAudience,
  type PilotDemoSessionCatalogEntry,
  type PilotDemoSessionFocus,
  type PilotDemoSessionLength,
  type PilotDemoSessionPlanStep
} from "../lib/pilotDemoSessionPlanner";
import {
  buildPendingPilotDemoProofPreflight,
  buildPilotDemoProofTargets,
  evaluatePilotDemoProofPreflight,
  pilotDemoProofPreflightTimeoutMs,
  type PilotDemoProofObservation
} from "../lib/pilotDemoProofPreflight";
import {
  buildPilotDemoRehearsalReceipt,
  evaluatePilotDemoRehearsal,
  pilotDemoRehearsalControls,
  serializePilotDemoRehearsalReceiptMarkdown,
  type PilotDemoRehearsalControlId
} from "../lib/pilotDemoRehearsal";
import {
  buildPilotDemoProtectedHandoff,
  buildPilotDemoProtectedHandoffRoute
} from "../lib/pilotDemoProtectedHandoff";

export default function PilotDemoSessionPlanner({
  catalog
}: {
  catalog: PilotDemoSessionCatalogEntry[];
}) {
  const [demoSlug, setDemoSlug] = useState(catalog[0]?.demoSlug ?? "");
  const [audience, setAudience] = useState<PilotDemoSessionAudience>("executive-sponsor");
  const [focus, setFocus] = useState<PilotDemoSessionFocus>("workflow-proof");
  const [durationMinutes, setDurationMinutes] = useState<PilotDemoSessionLength>(30);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [completedStepIds, setCompletedStepIds] = useState<PilotDemoSessionPlanStep["id"][]>([]);
  const [confirmedControlIds, setConfirmedControlIds] = useState<PilotDemoRehearsalControlId[]>([]);
  const [proofObservations, setProofObservations] = useState<PilotDemoProofObservation[]>([]);
  const [proofPreflightAttempted, setProofPreflightAttempted] = useState(false);
  const [proofPreflightRunning, setProofPreflightRunning] = useState(false);

  const plan = useMemo(
    () => buildPilotDemoSessionPlan(catalog, { demoSlug, audience, focus, durationMinutes }),
    [audience, catalog, demoSlug, durationMinutes, focus]
  );
  const activeStep = plan.agenda[activeStepIndex] ?? plan.agenda[0];
  const progress = Math.round(((activeStepIndex + 1) / plan.agenda.length) * 100);
  const proofPreflight = useMemo(
    () =>
      proofPreflightAttempted
        ? evaluatePilotDemoProofPreflight({ plan, observations: proofObservations })
        : buildPendingPilotDemoProofPreflight(plan),
    [plan, proofObservations, proofPreflightAttempted]
  );
  const rehearsal = useMemo(
    () => evaluatePilotDemoRehearsal({ plan, completedStepIds, confirmedControlIds, proofPreflight }),
    [completedStepIds, confirmedControlIds, plan, proofPreflight]
  );
  const protectedHandoff = useMemo(() => {
    if (rehearsal.status !== "ready-for-protected-handoff") return null;

    try {
      return buildPilotDemoProtectedHandoff({ plan, proofPreflight, rehearsal });
    } catch {
      return null;
    }
  }, [plan, proofPreflight, rehearsal]);
  const protectedHandoffRoute = protectedHandoff
    ? buildPilotDemoProtectedHandoffRoute(protectedHandoff)
    : null;

  function resetSessionState() {
    setActiveStepIndex(0);
    setCompletedStepIds([]);
    setConfirmedControlIds([]);
    setProofObservations([]);
    setProofPreflightAttempted(false);
    setProofPreflightRunning(false);
  }

  function toggleCompletedStep(stepId: PilotDemoSessionPlanStep["id"]) {
    setCompletedStepIds((current) =>
      current.includes(stepId)
        ? current.filter((candidate) => candidate !== stepId)
        : [...current, stepId]
    );
  }

  function toggleRehearsalControl(controlId: PilotDemoRehearsalControlId) {
    setConfirmedControlIds((current) =>
      current.includes(controlId)
        ? current.filter((candidate) => candidate !== controlId)
        : [...current, controlId]
    );
  }

  function downloadPlan() {
    const content = serializePilotDemoSessionPlanMarkdown(plan);
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${plan.demoSlug}-${plan.durationMinutes}-minute-demo-plan.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function runProofPreflight() {
    setProofPreflightRunning(true);
    setProofPreflightAttempted(false);

    try {
      const targets = buildPilotDemoProofTargets(plan);
      const observations = await Promise.all(
        targets.map(async (target): Promise<PilotDemoProofObservation> => {
          const controller = new AbortController();
          const timeout = window.setTimeout(() => controller.abort(), pilotDemoProofPreflightTimeoutMs);
          const startedAt = performance.now();

          try {
            const response = await fetch(target.requestPath, {
              method: target.method,
              cache: "no-store",
              credentials: target.credentials,
              mode: "same-origin",
              redirect: "follow",
              signal: controller.signal
            });
            const reachable = response.status >= 200 && response.status < 400;

            return {
              targetId: target.id,
              requestPath: target.requestPath,
              outcome: reachable ? "reachable" : "http-error",
              httpStatus: response.status,
              latencyMs: Math.max(0, Math.round(performance.now() - startedAt)),
              checkedAt: new Date().toISOString()
            };
          } catch {
            return {
              targetId: target.id,
              requestPath: target.requestPath,
              outcome: controller.signal.aborted ? "timeout" : "network-error",
              httpStatus: null,
              latencyMs: Math.max(0, Math.round(performance.now() - startedAt)),
              checkedAt: new Date().toISOString()
            };
          } finally {
            window.clearTimeout(timeout);
          }
        })
      );

      setProofObservations(observations);
      setProofPreflightAttempted(true);
    } finally {
      setProofPreflightRunning(false);
    }
  }

  function downloadRehearsalRecord() {
    const receipt = buildPilotDemoRehearsalReceipt({
      plan,
      completedStepIds,
      confirmedControlIds,
      proofPreflight,
      generatedAt: new Date().toISOString()
    });
    const content = serializePilotDemoRehearsalReceiptMarkdown(receipt);
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${plan.demoSlug}-rehearsal-record.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="section-band demo-session-planner" id="demo-session-planner" aria-labelledby="demo-session-planner-title">
      <div className="section-heading demo-session-heading">
        <p className="eyebrow">Interactive presentation workspace</p>
        <h2 id="demo-session-planner-title">Build a buyer-ready demo run of show in under a minute.</h2>
        <p className="section-copy">
          Choose the audience, evidence focus, and meeting length. SCRIMED uses the governed demo registry to
          assemble a timed walkthrough, proof path, pilot close, and explicit safety boundary without collecting
          free text or buyer data.
        </p>
      </div>

      <div className="demo-session-config" aria-label="Demo session configuration">
        <label className="demo-session-field">
          <span>Demo</span>
          <select
            onChange={(event) => {
              setDemoSlug(event.target.value);
              resetSessionState();
            }}
            value={demoSlug}
          >
            {catalog.map((entry) => (
              <option key={entry.demoSlug} value={entry.demoSlug}>{entry.demoName}</option>
            ))}
          </select>
        </label>

        <label className="demo-session-field">
          <span>Audience</span>
          <select
            onChange={(event) => {
              setAudience(event.target.value as PilotDemoSessionAudience);
              resetSessionState();
            }}
            value={audience}
          >
            {pilotDemoSessionAudienceOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="demo-session-field">
          <span>Primary focus</span>
          <select
            onChange={(event) => {
              setFocus(event.target.value as PilotDemoSessionFocus);
              resetSessionState();
            }}
            value={focus}
          >
            {pilotDemoSessionFocusOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </label>

        <fieldset className="demo-session-duration">
          <legend>Meeting length</legend>
          <div className="demo-session-duration-options">
            {pilotDemoSessionLengthOptions.map((option) => (
              <button
                aria-pressed={durationMinutes === option.id}
                className={durationMinutes === option.id ? "is-selected" : undefined}
                key={option.id}
                onClick={() => {
                  setDurationMinutes(option.id);
                  resetSessionState();
                }}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="demo-session-decision" aria-live="polite">
        <span>Decision question</span>
        <strong>{plan.decisionQuestion}</strong>
        <div>
          <span className="status-pill status-pill-pass">Synthetic guided demo</span>
          <span className="status-pill status-pill-warn">Human review required</span>
        </div>
      </div>

      <div className="demo-session-workspace">
        <nav className="demo-session-steps" aria-label="Presentation steps">
          <div className="demo-session-progress">
            <span>Run of show</span>
            <strong>{progress}%</strong>
            <progress max="100" value={progress}>{progress}%</progress>
          </div>
          {plan.agenda.map((step, index) => (
            <button
              aria-current={activeStepIndex === index ? "step" : undefined}
              className={activeStepIndex === index ? "demo-session-step is-active" : "demo-session-step"}
              key={step.id}
              onClick={() => setActiveStepIndex(index)}
              type="button"
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step.title}</strong>
              <small>{step.minutes} min{completedStepIds.includes(step.id) ? " | practiced" : ""}</small>
            </button>
          ))}
        </nav>

        <article className="demo-session-stage" aria-live="polite">
          <div className="demo-session-stage-heading">
            <div>
              <span>Step {activeStepIndex + 1} of {plan.agenda.length}</span>
              <h3>{activeStep.title}</h3>
            </div>
            <strong>{activeStep.minutes} min</strong>
          </div>
          <p className="demo-session-objective">{activeStep.objective}</p>
          <div className="demo-session-talk-track">
            <span>Presenter focus</span>
            <p>{activeStep.talkTrack}</p>
          </div>
          <div className="demo-session-proof">
            <div>
              <span>Inspectable evidence</span>
              <strong>{activeStep.proof.label}</strong>
              <p>{activeStep.proof.evidence}</p>
            </div>
            <Link className="module-link" href={activeStep.proof.route}>Open proof</Link>
          </div>
          <div className="demo-session-boundary">
            <span>Retained boundary</span>
            <p>{plan.retainedBoundary}</p>
          </div>
          <div className="demo-session-navigation">
            <button
              className="secondary-action"
              disabled={activeStepIndex === 0}
              onClick={() => setActiveStepIndex((current) => Math.max(0, current - 1))}
              type="button"
            >
              Previous
            </button>
            <button
              aria-pressed={completedStepIds.includes(activeStep.id)}
              className="secondary-action demo-rehearsal-practice"
              onClick={() => toggleCompletedStep(activeStep.id)}
              type="button"
            >
              {completedStepIds.includes(activeStep.id) ? "Practiced" : "Mark practiced"}
            </button>
            <button
              className="primary-action"
              disabled={activeStepIndex === plan.agenda.length - 1}
              onClick={() => setActiveStepIndex((current) => Math.min(plan.agenda.length - 1, current + 1))}
              type="button"
            >
              Next step
            </button>
          </div>
        </article>
      </div>

      <div className="demo-session-summary" aria-label="Generated demo and pilot summary">
        <div>
          <span>Sponsor</span>
          <strong>{plan.sponsorRole}</strong>
        </div>
        <div>
          <span>Workflow owner</span>
          <strong>{plan.workflowOwnerRole}</strong>
        </div>
        <div>
          <span>Recommended pilot</span>
          <strong>{plan.recommendedPilotName}</strong>
        </div>
        <div>
          <span>Pricing guidance</span>
          <strong>{plan.pricingBand}</strong>
        </div>
      </div>

      <div className="demo-session-readiness">
        <div>
          <p className="eyebrow">Buyer questions</p>
          <ul className="compact-list">
            {plan.buyerQuestions.map((question) => <li key={question}>{question}</li>)}
          </ul>
        </div>
        <div>
          <p className="eyebrow">Pilot acceptance</p>
          <ul className="compact-list">
            {plan.successCriteria.map((criterion) => <li key={criterion}>{criterion}</li>)}
          </ul>
        </div>
      </div>

      <section className="demo-rehearsal-gate" aria-labelledby="demo-rehearsal-title">
        <div className="demo-rehearsal-heading">
          <div>
            <p className="eyebrow">Governed rehearsal gate</p>
            <h3 id="demo-rehearsal-title">Practice the proof, boundary, and pilot close before protected handoff.</h3>
            <p>
              This local checklist records operator self-attestation only. It does not create independent validation,
              persist buyer data, or transfer authority into the protected workspace.
            </p>
          </div>
          <div className="demo-rehearsal-score" aria-live="polite">
            <strong>{rehearsal.readinessScore}%</strong>
            <span>{rehearsal.status === "ready-for-protected-handoff" ? "Rehearsal complete" : "Rehearsal in progress"}</span>
          </div>
        </div>

        <div className="demo-proof-preflight" aria-live="polite">
          <div className="demo-proof-preflight-heading">
            <div>
              <span>Automated proof-route check</span>
              <strong>
                {proofPreflight.status === "passed"
                  ? `${proofPreflight.reachableCount}/${proofPreflight.targetCount} same-origin routes reachable`
                  : proofPreflight.status === "blocked"
                    ? `${proofPreflight.reachableCount}/${proofPreflight.targetCount} routes reachable`
                    : `${proofPreflight.targetCount} routes awaiting preflight`}
              </strong>
              <small>Anonymous read-only HEAD requests, same-origin only, five-second timeout, no buyer data.</small>
            </div>
            <button
              className="secondary-action"
              disabled={proofPreflightRunning}
              onClick={runProofPreflight}
              type="button"
            >
              {proofPreflightRunning
                ? "Checking routes"
                : proofPreflightAttempted
                  ? "Rerun proof preflight"
                  : "Run proof preflight"}
            </button>
          </div>
          <div className="demo-proof-preflight-routes" aria-label="Proof route preflight results">
            {proofPreflight.routeChecks.map((check) => (
              <div key={check.id}>
                <span className={check.passed ? "status-pill status-pill-pass" : "status-pill status-pill-warn"}>
                  {check.passed ? "Pass" : check.outcome === "not-run" ? "Pending" : "Blocked"}
                </span>
                <strong>{check.label}</strong>
                <small>
                  {check.requestPath}
                  {check.httpStatus ? ` | HTTP ${check.httpStatus}` : ""}
                  {check.latencyMs !== null ? ` | ${check.latencyMs}ms` : ""}
                </small>
              </div>
            ))}
          </div>
        </div>

        <progress
          aria-label="Rehearsal readiness"
          className="demo-rehearsal-progress"
          max="100"
          value={rehearsal.readinessScore}
        >
          {rehearsal.readinessScore}%
        </progress>

        <div className="demo-rehearsal-grid">
          <div aria-label="Rehearsal criteria">
            {rehearsal.criteria.map((criterion) => (
              <div className="demo-rehearsal-criterion" key={criterion.id}>
                <span className={criterion.status === "pass" ? "status-pill status-pill-pass" : "status-pill status-pill-warn"}>
                  {criterion.status === "pass" ? "Pass" : "Pending"}
                </span>
                <div>
                  <strong>{criterion.label}</strong>
                  <p>{criterion.evidence}</p>
                </div>
                <small>{criterion.weight} pts</small>
              </div>
            ))}
          </div>

          <fieldset className="demo-rehearsal-controls">
            <legend>Operator confirmations</legend>
            {pilotDemoRehearsalControls.map((control) => (
              <label className="demo-rehearsal-control" key={control.id}>
                <input
                  checked={confirmedControlIds.includes(control.id)}
                  disabled={control.id === "proof-routes-reviewed" && proofPreflight.status !== "passed"}
                  onChange={() => toggleRehearsalControl(control.id)}
                  type="checkbox"
                />
                <span>
                  <strong>{control.label}</strong>
                  <small>{control.description}</small>
                </span>
              </label>
            ))}
          </fieldset>
        </div>

        {rehearsal.blockers.length > 0 ? (
          <div className="demo-rehearsal-blockers" aria-live="polite">
            <strong>Protected handoff remains locked</strong>
            <p>{rehearsal.blockers.join(" | ")}</p>
          </div>
        ) : (
          <div className="demo-rehearsal-ready" aria-live="polite">
            <strong>Local rehearsal gate passed</strong>
            <p>
              Open the existing AAL2 Sales Operations workflow with a canonical metadata draft. Nothing is
              persisted until an authenticated operator reviews and records the session.
            </p>
          </div>
        )}

        <div className="form-actions demo-rehearsal-actions">
          <button className="secondary-action" onClick={downloadRehearsalRecord} type="button">
            Download rehearsal record
          </button>
          <button className="secondary-action" onClick={resetSessionState} type="button">
            Reset rehearsal
          </button>
          {protectedHandoffRoute ? (
            <Link className="primary-action" href={protectedHandoffRoute}>Open protected handoff</Link>
          ) : (
            <span className="demo-rehearsal-locked">Complete all rehearsal criteria to open the protected handoff.</span>
          )}
        </div>
        <p className="demo-session-provenance">
          Rehearsal {rehearsal.auditHash} | route preflight {proofPreflight.auditHash}
          {protectedHandoff ? ` | handoff ${protectedHandoff.handoffFingerprint}` : ""} | operator self-attestation |
          metadata draft only | no automatic persistence | no send | no launch authority
        </p>
      </section>

      <div className="form-actions demo-session-actions">
        <button className="secondary-action" onClick={downloadPlan} type="button">Download session plan</button>
        <Link className="secondary-action" href={plan.recommendedPilotRoute}>Open recommended pilot</Link>
        <Link className="primary-action" href={plan.noPhiIntakeRoute}>Start no-PHI intake</Link>
      </div>
      <p className="demo-session-provenance">
        Plan {plan.planId} | {plan.auditHash} | no storage | no external send | no binding quote | no release authority
      </p>
    </section>
  );
}
