import Link from "next/link";
import { getQaEvidenceLedger } from "../lib/qaEvidenceLedger";
import { getQaActivationSealSummary } from "../lib/qaActivationSeal";
import { getQaClaimGuardSummary } from "../lib/qaClaimGuard";
import { getQaCompletionBridgeSummary } from "../lib/qaCompletionBridge";
import { getQaExecutionReadinessSummary } from "../lib/qaExecutionReadiness";
import { getQaHumanRunPacketSummary } from "../lib/qaHumanRunPacket";
import { getQaLaunchKitSummary } from "../lib/qaLaunchKit";
import { getQaProofPromotionSummary } from "../lib/qaProofPromotion";
import { getQaRunControlSummary } from "../lib/qaRunControl";
import { getQaBuyerProofReleaseSummary } from "../lib/qaBuyerProofRelease";

export const metadata = {
  title: "SCRIMED QA Evidence Ledger",
  description:
    "Review SCRIMED release QA evidence, protected-route containment, token-policy readiness, known limitations, and manual AAL2 verification gates."
};

export default function QaEvidencePage() {
  const ledger = getQaEvidenceLedger();
  const executionReadiness = getQaExecutionReadinessSummary();
  const runControl = getQaRunControlSummary();
  const launchKit = getQaLaunchKitSummary();
  const humanRunPacket = getQaHumanRunPacketSummary();
  const completionBridge = getQaCompletionBridgeSummary();
  const claimGuard = getQaClaimGuardSummary();
  const activationSeal = getQaActivationSealSummary();
  const proofPromotion = getQaProofPromotionSummary();
  const buyerProofRelease = getQaBuyerProofReleaseSummary();
  const commitSha =
    ledger.currentDeployment.commitSha === "local-or-unset"
      ? ledger.currentDeployment.commitSha
      : ledger.currentDeployment.commitSha.slice(0, 12);

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/quality">Quality Gates</Link>
        <p className="eyebrow">QA Evidence Ledger</p>
        <h1>SCRIMED release evidence, fail-closed controls, and operator-token gates stay visible and buyer-safe.</h1>
        <p className="hero-text">
          This ledger records what has passed, what intentionally fails closed, which limitations are contained, and the
          one remaining authenticated QA gate that requires a fresh short-lived AAL2 operator session.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={ledger.briefRoute}>
            Download QA Brief
          </a>
          <a className="secondary-action" href={ledger.apiRoute}>
            Inspect QA API
          </a>
          <a className="secondary-action" href={ledger.manualRunEvidenceCapture.route}>
            Capture Run Packet
          </a>
          <a className="secondary-action" href={ledger.activationPlan.briefRoute}>
            Download Activation Plan
          </a>
          <Link className="secondary-action" href={executionReadiness.route}>
            Execution Readiness
          </Link>
          <Link className="secondary-action" href={runControl.route}>
            Run Control
          </Link>
          <Link className="secondary-action" href={launchKit.route}>
            Launch Kit
          </Link>
          <Link className="secondary-action" href={humanRunPacket.route}>
            Human Run Packet
          </Link>
          <Link className="secondary-action" href={completionBridge.route}>
            Completion Bridge
          </Link>
          <Link className="secondary-action" href={claimGuard.route}>
            Claim Guard
          </Link>
          <Link className="secondary-action" href={activationSeal.route}>
            Activation Seal
          </Link>
          <Link className="secondary-action" href={proofPromotion.route}>
            Proof Promotion
          </Link>
          <Link className="secondary-action" href={buyerProofRelease.route}>
            Buyer Proof Release
          </Link>
          <Link className="secondary-action" href="/pilot-evidence">
            Pilot Evidence
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED QA evidence summary">
        <article>
          <span>Status</span>
          <strong>{ledger.status}</strong>
        </article>
        <article>
          <span>Evidence entries</span>
          <strong>{ledger.recordedEvidenceCount}</strong>
        </article>
        <article>
          <span>Passed</span>
          <strong>{ledger.passed}</strong>
        </article>
        <article>
          <span>Fail closed</span>
          <strong>{ledger.failClosed}</strong>
        </article>
        <article>
          <span>Manual gates</span>
          <strong>{ledger.manualGates}</strong>
        </article>
        <article>
          <span>Capture path</span>
          <strong>{ledger.manualRunEvidenceCapture.status}</strong>
        </article>
        <article>
          <span>Activation</span>
          <strong>{ledger.activationPlan.status}</strong>
        </article>
        <article>
          <span>Persistence</span>
          <strong>{ledger.manualRunEvidencePersistence.status}</strong>
        </article>
        <article>
          <span>Execution</span>
          <strong>{executionReadiness.executionDecision}</strong>
        </article>
        <article>
          <span>Run control</span>
          <strong>{runControl.executionDecision}</strong>
        </article>
        <article>
          <span>Launch kit</span>
          <strong>{launchKit.launchDecision}</strong>
        </article>
        <article>
          <span>Launch phases</span>
          <strong>{launchKit.phaseCount}</strong>
        </article>
        <article>
          <span>Human run packet</span>
          <strong>{humanRunPacket.decisionState}</strong>
        </article>
        <article>
          <span>Run packet controls</span>
          <strong>{humanRunPacket.controlCount}</strong>
        </article>
        <article>
          <span>Run packet stops</span>
          <strong>{humanRunPacket.hardStopControlCount}</strong>
        </article>
        <article>
          <span>Completion bridge</span>
          <strong>{completionBridge.completionDecisionState}</strong>
        </article>
        <article>
          <span>Bridge hard stops</span>
          <strong>{completionBridge.hardStopCount}</strong>
        </article>
        <article>
          <span>Claim guard</span>
          <strong>{claimGuard.buyerClaimPosture}</strong>
        </article>
        <article>
          <span>Claim blocks</span>
          <strong>{claimGuard.blockedAuthorityClaimCount}</strong>
        </article>
        <article>
          <span>Activation seal</span>
          <strong>{activationSeal.decisionState}</strong>
        </article>
        <article>
          <span>Seal hard stops</span>
          <strong>{activationSeal.hardStopRuleCount}</strong>
        </article>
        <article>
          <span>Proof promotion</span>
          <strong>{proofPromotion.promotionDecisionState}</strong>
        </article>
        <article>
          <span>Promotion rules</span>
          <strong>{proofPromotion.ruleCount}</strong>
        </article>
        <article>
          <span>Proof blocked</span>
          <strong>{proofPromotion.blockedClaims.length}</strong>
        </article>
        <article>
          <span>Buyer release</span>
          <strong>{buyerProofRelease.releaseDecisionState}</strong>
        </article>
        <article>
          <span>Release stops</span>
          <strong>{buyerProofRelease.hardStopCount}</strong>
        </article>
        <article>
          <span>Data boundary</span>
          <strong>synthetic only</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Current boundary</p>
          <h2>{ledger.buyerSafeSummary}</h2>
          <p className="section-copy">{ledger.boundary}</p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>env</span>
            <strong>{ledger.currentDeployment.environment}</strong>
          </div>
          <div className="layer-row">
            <span>ref</span>
            <strong>{ledger.currentDeployment.commitRef}</strong>
          </div>
          <div className="layer-row">
            <span>sha</span>
            <strong>{commitSha}</strong>
          </div>
        </div>
      </section>

      <section className="table-section" aria-label="SCRIMED manual AAL2 QA activation plan">
        <div className="section-heading">
          <p className="eyebrow">Activation plan</p>
          <h2>Human AAL2 QA runs now have a no-secret sequence from workflow dispatch to Buyer Diligence export.</h2>
          <p className="section-copy">{ledger.activationPlan.boundary}</p>
        </div>
        <div className="principle-grid">
          <article>
            <span>status</span>
            <h3>{ledger.activationPlan.status}</h3>
            <p>{ledger.activationPlan.activationPrinciple}</p>
          </article>
          <article>
            <span>route</span>
            <h3>{ledger.activationPlan.route}</h3>
            <p>{ledger.activationPlan.forbiddenContent}</p>
          </article>
          <article>
            <span>completion</span>
            <h3>{ledger.activationPlan.completionCriteria.length} criteria</h3>
            <p>{ledger.activationPlan.unresolvedBoundary}</p>
          </article>
        </div>
        {ledger.activationPlan.workflows.map((workflow) => (
          <article className="module-row" key={workflow.workflowKind}>
            <div>
              <span>{workflow.status}</span>
              <h2>{workflow.name}</h2>
            </div>
            <p>{workflow.buyerDiligenceImpact}</p>
            <div>
              <strong>{workflow.workflowPath}</strong>
              <ul className="compact-list">
                <li>Target input: {workflow.targetInput}</li>
                <li>Preflight: {workflow.preflightScript}</li>
                <li>Smoke: {workflow.smokeScript}</li>
                <li>Temporary secret: {workflow.requiredSecretName}</li>
                <li>Persistence: {workflow.persistenceTarget}</li>
                <li>Next: {workflow.nextAction}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED manual AAL2 QA execution readiness">
        <div className="section-heading">
          <p className="eyebrow">Execution readiness</p>
          <h2>SCRIMED can guide the human AAL2 run without claiming authenticated proof before evidence is retained.</h2>
          <p className="section-copy">{executionReadiness.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={executionReadiness.route}>
              Open Execution Readiness
            </Link>
            <a className="secondary-action" href={executionReadiness.briefRoute}>
              Download Execution Brief
            </a>
          </div>
        </div>
        {executionReadiness.dispatchWorkflows.map((workflow) => (
          <article className="module-row" key={workflow.workflowKind}>
            <div>
              <span>{workflow.state}</span>
              <h2>{workflow.name}</h2>
            </div>
            <p>{workflow.boundary}</p>
            <div>
              <strong>{workflow.dispatchPath}</strong>
              <ul className="compact-list">
                <li>Target: {workflow.targetInput}</li>
                <li>Temporary secret: {workflow.temporarySecret}</li>
                <li>Next: {workflow.nextAction}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED manual AAL2 QA run control">
        <div className="section-heading">
          <p className="eyebrow">Run control</p>
          <h2>Operators now have workflow-specific dispatch inputs, command templates, and safe evidence payloads before touching a token.</h2>
          <p className="section-copy">{runControl.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={runControl.route}>
              Open Run Control
            </Link>
            <a className="secondary-action" href={runControl.briefRoute}>
              Download Run-Control Brief
            </a>
          </div>
        </div>
        {runControl.workflows.map((workflow) => (
          <article className="module-row" key={workflow.workflowKind}>
            <div>
              <span>{workflow.state}</span>
              <h2>{workflow.name}</h2>
            </div>
            <p>{workflow.buyerProofPromotionRule}</p>
            <div>
              <strong>{workflow.dispatchPath}</strong>
              <ul className="compact-list">
                <li>Temporary secret: {workflow.temporarySecret}</li>
                <li>Evidence route: {workflow.evidencePacketRoute}</li>
                <li>Persistence: {workflow.protectedPersistenceRoute}</li>
                <li>Abort conditions: {workflow.abortConditions.length}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED manual AAL2 QA launch kit">
        <div className="section-heading">
          <p className="eyebrow">Launch kit</p>
          <h2>Operators now have one no-secret handoff before running the first human AAL2 workflow.</h2>
          <p className="section-copy">{launchKit.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={launchKit.route}>
              Open Launch Kit
            </Link>
            <a className="secondary-action" href={launchKit.briefRoute}>
              Download Launch Kit
            </a>
          </div>
        </div>
        {launchKit.phases.map((phase) => (
          <article className="module-row" key={phase.phase}>
            <div>
              <span>{phase.state}</span>
              <h2>{phase.phase}</h2>
            </div>
            <p>{phase.operatorAction}</p>
            <div>
              <strong>{phase.owner}</strong>
              <ul className="compact-list">
                <li>Pass: {phase.passSignal}</li>
                <li>Fail closed: {phase.failClosedIf}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED QA human run packet">
        <div className="section-heading">
          <p className="eyebrow">Human run packet</p>
          <h2>The final dispatch packet keeps the first AAL2 run operator-controlled and proof-blocked.</h2>
          <p className="section-copy">{humanRunPacket.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={humanRunPacket.route}>
              Open Human Run Packet
            </Link>
            <a className="secondary-action" href={humanRunPacket.briefRoute}>
              Download Packet Brief
            </a>
          </div>
        </div>
        {humanRunPacket.controls.map((control) => (
          <article className="module-row" key={control.control}>
            <div>
              <span>{control.state}</span>
              <h2>{control.control}</h2>
            </div>
            <p>{control.passSignal}</p>
            <div>
              <strong>{control.owner}</strong>
              <ul className="compact-list">
                <li>Fail closed: {control.failClosedIf}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED QA completion bridge">
        <div className="section-heading">
          <p className="eyebrow">Completion bridge</p>
          <h2>After the human run, validate the no-secret packet before protected persistence.</h2>
          <p className="section-copy">{completionBridge.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={completionBridge.route}>
              Open Completion Bridge
            </Link>
            <a className="secondary-action" href={completionBridge.briefRoute}>
              Download Bridge Brief
            </a>
          </div>
        </div>
        {completionBridge.checkpoints.map((checkpoint) => (
          <article className="module-row" key={checkpoint.checkpoint}>
            <div>
              <span>{checkpoint.state}</span>
              <h2>{checkpoint.checkpoint}</h2>
            </div>
            <p>{checkpoint.evidenceRequired}</p>
            <div>
              <strong>{checkpoint.owner}</strong>
              <ul className="compact-list">
                <li>Pass: {checkpoint.passSignal}</li>
                <li>Fail closed: {checkpoint.failClosedIf}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED QA claim guard">
        <div className="section-heading">
          <p className="eyebrow">Claim guard</p>
          <h2>Keep external and buyer language aligned with retained evidence, not ambition.</h2>
          <p className="section-copy">{claimGuard.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={claimGuard.route}>
              Open Claim Guard
            </Link>
            <a className="secondary-action" href={claimGuard.briefRoute}>
              Download Claim Brief
            </a>
          </div>
        </div>
        {claimGuard.rules.map((rule) => (
          <article className="module-row" key={rule.rule}>
            <div>
              <span>{rule.state}</span>
              <h2>{rule.rule}</h2>
            </div>
            <p>{rule.appliesWhen}</p>
            <div>
              <strong>{rule.requiredEvidence}</strong>
              <ul className="compact-list">
                <li>{rule.saferLanguage}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED QA activation seal">
        <div className="section-heading">
          <p className="eyebrow">Activation seal</p>
          <h2>Use the seal after protected persistence to keep buyer proof tied to retained packet evidence.</h2>
          <p className="section-copy">{activationSeal.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={activationSeal.route}>
              Open Activation Seal
            </Link>
            <a className="secondary-action" href={activationSeal.briefRoute}>
              Download Seal Brief
            </a>
          </div>
        </div>
        <article className="module-row">
          <div>
            <span>{activationSeal.decisionState}</span>
            <h2>{activationSeal.decision.buyerSafeClaim}</h2>
          </div>
          <p>{activationSeal.decision.nextAction}</p>
          <div>
            <strong>Seal allowed: {activationSeal.sealAllowed ? "yes" : "no"}</strong>
            <ul className="compact-list">
              <li>Buyer use: {activationSeal.buyerUseAllowed ? "yes" : "no"}</li>
              <li>Required evidence: {activationSeal.requiredEvidenceCount}</li>
              <li>Blocked claims: {activationSeal.hardStopClaimCount}</li>
            </ul>
          </div>
        </article>
        {activationSeal.rules.map((rule) => (
          <article className="module-row" key={rule.rule}>
            <div>
              <span>{rule.status}</span>
              <h2>{rule.rule}</h2>
            </div>
            <p>{rule.evidenceRequired}</p>
            <div>
              <strong>{rule.passSignal}</strong>
              <ul className="compact-list">
                <li>Fail closed: {rule.failClosedIf}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED manual QA proof promotion">
        <div className="section-heading">
          <p className="eyebrow">Proof promotion</p>
          <h2>SCRIMED separates activation readiness from retained authenticated QA proof.</h2>
          <p className="section-copy">{proofPromotion.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={proofPromotion.route}>
              Open Proof Promotion
            </Link>
            <a className="secondary-action" href={proofPromotion.briefRoute}>
              Download Promotion Brief
            </a>
          </div>
        </div>
        <article className="module-row">
          <div>
            <span>{proofPromotion.promotionDecisionState}</span>
            <h2>{proofPromotion.decision.buyerSafeClaim}</h2>
          </div>
          <p>{proofPromotion.decision.buyerProofLanguage}</p>
          <div>
            <strong>{proofPromotion.decision.nextAction}</strong>
            <ul className="compact-list">
              <li>Promotion allowed: {proofPromotion.promotionAllowed ? "yes" : "no"}</li>
              <li>Protected persistence: {proofPromotion.protectedPersistenceRoute}</li>
              <li>Hard stops: {proofPromotion.hardStopRuleCount}</li>
            </ul>
          </div>
        </article>
        {proofPromotion.rules.map((rule) => (
          <article className="module-row" key={rule.rule}>
            <div>
              <span>{rule.status}</span>
              <h2>{rule.rule}</h2>
            </div>
            <p>{rule.beforePromotion}</p>
            <div>
              <strong>{rule.afterPromotion}</strong>
              <ul className="compact-list">
                <li>{rule.boundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED QA buyer proof release">
        <div className="section-heading">
          <p className="eyebrow">Buyer proof release</p>
          <h2>Use one protected go/no-go gate before retained manual QA proof enters Buyer Diligence.</h2>
          <p className="section-copy">{buyerProofRelease.boundary}</p>
          <div className="form-actions">
            <Link className="primary-action" href={buyerProofRelease.route}>
              Open Buyer Proof Release
            </Link>
            <a className="secondary-action" href={buyerProofRelease.briefRoute}>
              Download Release Brief
            </a>
          </div>
        </div>
        <article className="module-row">
          <div>
            <span>{buyerProofRelease.releaseDecisionState}</span>
            <h2>{buyerProofRelease.decision.buyerSafeClaim}</h2>
          </div>
          <p>{buyerProofRelease.decision.nextAction}</p>
          <div>
            <strong>
              Buyer export: {buyerProofRelease.buyerDiligenceExportAllowed ? "allowed" : "blocked"}
            </strong>
            <ul className="compact-list">
              <li>Protected route: {buyerProofRelease.protectedReleaseRoute}</li>
              <li>Buyer packet: {buyerProofRelease.buyerDiligencePacketRoute}</li>
              <li>Public claims: {buyerProofRelease.publicClaimAllowed ? "allowed" : "blocked"}</li>
            </ul>
          </div>
        </article>
        {buyerProofRelease.decision.releaseCriteria.map((criterion) => (
          <article className="module-row" key={criterion.id}>
            <div>
              <span>{criterion.status}</span>
              <h2>{criterion.name}</h2>
            </div>
            <p>{criterion.evidence}</p>
            <div>
              <strong>{criterion.nextAction}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED QA evidence entries">
        <div className="section-heading">
          <p className="eyebrow">Evidence entries</p>
          <h2>Every check is tied to an artifact, route, limitation, and workaround.</h2>
        </div>
        {ledger.entries.map((entry) => (
          <article className="module-row" key={entry.id}>
            <div>
              <span>{entry.status}</span>
              <h2>{entry.name}</h2>
            </div>
            <p>{entry.evidence}</p>
            <div>
              <strong>{entry.artifact}</strong>
              <ul className="compact-list">
                <li>Owner: {entry.owner}</li>
                <li>Recorded: {entry.recordedAt}</li>
                <li>Limitation: {entry.limitation}</li>
                <li>Workaround: {entry.workaround}</li>
                <li>Next: {entry.nextAction}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="SCRIMED known limitations">
        <div className="section-heading">
          <p className="eyebrow">Known limitations</p>
          <h2>Limitations are either contained, manual-action required, or external-review required.</h2>
        </div>
        <div className="principle-grid">
          {ledger.knownLimitations.map((limitation) => (
            <article key={limitation.title}>
              <span>{limitation.status}</span>
              <h3>{limitation.title}</h3>
              <p>{limitation.impact}</p>
              <ul className="compact-list">
                <li>{limitation.currentControl}</li>
                <li>{limitation.resolutionPath}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band" aria-label="SCRIMED Sales Demo Session QA token policy">
        <div className="section-heading">
          <p className="eyebrow">AAL2 token policy</p>
          <h2>Authenticated QA is deliberately narrow, short-lived, and operator-controlled.</h2>
        </div>
        <div className="principle-grid">
          <article>
            <span>policy</span>
            <h3>{ledger.tokenPolicy.status}</h3>
            <p>{ledger.tokenPolicy.ciMode}</p>
          </article>
          <article>
            <span>claims</span>
            <h3>{ledger.tokenPolicy.requiredClaims.join(", ")}</h3>
            <p>
              Maximum lifetime {ledger.tokenPolicy.maxTokenLifetimeSeconds}s; minimum remaining{" "}
              {ledger.tokenPolicy.minRemainingSeconds}s.
            </p>
          </article>
          <article>
            <span>boundary</span>
            <h3>No long-lived secret</h3>
            <p>{ledger.salesDemoSessionQaBoundary}</p>
          </article>
        </div>
      </section>

      <section className="section-band" aria-label="SCRIMED manual QA evidence capture">
        <div className="section-heading">
          <p className="eyebrow">Manual run packet</p>
          <h2>After the AAL2 workflow passes, SCRIMED can generate a no-secret evidence packet without storing credentials.</h2>
        </div>
        <div className="principle-grid">
          <article>
            <span>status</span>
            <h3>{ledger.manualRunEvidenceCapture.status}</h3>
            <p>{ledger.manualRunEvidenceCapture.persistenceBoundary}</p>
          </article>
          <article>
            <span>route</span>
            <h3>{ledger.manualRunEvidenceCapture.route}</h3>
            <p>{ledger.manualRunEvidenceCapture.forbiddenContent}</p>
          </article>
          <article>
            <span>protected</span>
            <h3>{ledger.manualRunEvidenceCapture.protectedPersistenceRoute}</h3>
            <p>{ledger.manualRunEvidencePersistence.boundary}</p>
          </article>
          <article>
            <span>required</span>
            <h3>{ledger.manualRunEvidenceCapture.requiredFields.length} fields</h3>
            <p>
              Required attestations: {Object.values(ledger.manualRunEvidenceCapture.acceptedAttestations).join(", ")}.
            </p>
          </article>
        </div>
      </section>

      <section className="table-section" aria-label="SCRIMED Sales Demo Session QA controls">
        <div className="section-heading">
          <p className="eyebrow">Controls</p>
          <h2>The QA path records synthetic business workflow evidence only.</h2>
        </div>
        {ledger.salesDemoSessionQaControls.map((control) => (
          <article className="module-row" key={control}>
            <div>
              <span>control</span>
              <h2>{control}</h2>
            </div>
            <p>{ledger.nextRecommendedBuildStep}</p>
            <Link className="module-link" href="/sales-operations">
              Open Sales Operations
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
