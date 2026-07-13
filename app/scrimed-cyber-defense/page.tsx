import Link from "next/link";
import { getScrimedCyberDefenseSummary } from "../lib/scrimedCyberDefenseCommandCenter";

export const metadata = {
  title: "SCRIMED Cyber Defense Command Center",
  description:
    "Synthetic/no-PHI SCRIMED cyber defense command center for browser hardening, proxy sanitization, protected-route monitoring, incident readiness, and security governance."
};

export default function ScrimedCyberDefensePage() {
  const summary = getScrimedCyberDefenseSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/competitive-defense">
          Competitive Defense
        </Link>
        <p className="eyebrow">SCRIMED Cyber Defense Command Center</p>
        <h1>Turn security into an operating control plane across every SCRIMED route.</h1>
        <p className="hero-text">{summary.boundary}</p>
        <div className="hero-actions" aria-label="SCRIMED cyber defense actions">
          <Link href={summary.apiRoute}>Inspect API</Link>
          <Link href="/api/scrimed-cyber-defense/evidence-packet">Evidence Packet API</Link>
          <Link href="/trust-center">Trust Center</Link>
          <Link href="/release-continuity">Release Continuity</Link>
          <Link href="/limitations-workarounds">Workarounds</Link>
          <Link href="/qa-evidence">QA Evidence</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Cyber defense scorecard">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Enforced controls</span>
          <strong>{summary.scorecard.enforcedControlCount}</strong>
        </article>
        <article>
          <span>Monitored controls</span>
          <strong>{summary.scorecard.monitoredControlCount}</strong>
        </article>
        <article>
          <span>Critical threats</span>
          <strong>{summary.scorecard.criticalThreatCount}</strong>
        </article>
        <article>
          <span>High threats</span>
          <strong>{summary.scorecard.highThreatCount}</strong>
        </article>
        <article>
          <span>Diligence cards</span>
          <strong>{summary.scorecard.buyerDiligenceCardCount}</strong>
        </article>
        <article>
          <span>Share-ready cards</span>
          <strong>{summary.scorecard.buyerDiligenceReadyCount}</strong>
        </article>
        <article>
          <span>Evidence gaps</span>
          <strong>{summary.scorecard.externalEvidenceGapCount}</strong>
        </article>
        <article>
          <span>Audit hash</span>
          <strong>{summary.scorecard.auditHash}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Cyber defense posture">
        <div>
          <p className="eyebrow">Cybersecurity Posture</p>
          <h2>{summary.scorecard.summary}</h2>
        </div>
        <div>
          <p>
            SCRIMED&apos;s current cyber layer is designed for no-PHI diligence, synthetic pilots, protected operator
            evidence, and future regulated deployment preparation.
          </p>
          <p>
            The current posture preserves fail-closed protected routes, browser hardening, proxy sanitization, token
            redaction, no-secret tests, and explicit no-authority headers.
          </p>
          <p>External WAF, SIEM, penetration testing, SBOM signing, and customer-specific controls remain required before PHI authority.</p>
        </div>
      </section>

      <section className="table-section" aria-label="Buyer Security Diligence Cards">
        <div className="section-heading">
          <p className="eyebrow">Buyer Security Diligence Cards</p>
          <h2>Procurement-grade answers are packaged as auditable, synthetic-only control cards.</h2>
        </div>
        {summary.buyerDiligenceCards.map((card) => (
          <article className="module-row" key={card.id}>
            <div>
              <span>{card.implementationStatus}</span>
              <h2>{card.title}</h2>
            </div>
            <p>{card.buyerQuestion}</p>
            <div>
              <strong>{card.currentAnswer}</strong>
              <ul className="compact-list">
                <li>Category: {card.category}</li>
                <li>Owner: {card.owner}</li>
                <li>Review cadence: {card.reviewCadence}</li>
                <li>Evidence routes: {card.evidenceRoutes.join(", ")}</li>
                <li>Required next evidence: {card.requiredNextEvidence}</li>
                <li>Human review required: {String(card.humanReviewRequired)}</li>
                <li>Synthetic only: {String(card.syntheticOnly)}</li>
                <li>Audit hash: {card.auditHash}</li>
                <li>Blocked claims: {card.blockedClaims.join(" ")}</li>
                <li>Residual risk: {card.residualRisk}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Enforced controls">
        <div className="section-heading">
          <p className="eyebrow">Enforced Controls</p>
          <h2>Controls are categorized by surface, status, evidence, protected assets, and retained boundary.</h2>
        </div>
        {summary.controls.map((control) => (
          <article className="module-row" key={control.id}>
            <div>
              <span>{control.status}</span>
              <h2>{control.name}</h2>
            </div>
            <p>{control.enforcement}</p>
            <div>
              <strong>{control.category}</strong>
              <ul className="compact-list">
                <li>Evidence: {control.evidence.join(", ")}</li>
                <li>Protected assets: {control.protectedAssets.join(", ")}</li>
                <li>Verification: {control.verification}</li>
                <li>Boundary: {control.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Threat Matrix">
        <div className="section-heading">
          <p className="eyebrow">Threat Matrix</p>
          <h2>Every major threat receives a current mitigation, detection signal, escalation path, and residual risk.</h2>
        </div>
        {summary.threatMatrix.map((threat) => (
          <article className="module-row" key={threat.id}>
            <div>
              <span>{threat.riskLevel}</span>
              <h2>{threat.name}</h2>
            </div>
            <p>{threat.attackSurface}</p>
            <div>
              <strong>{threat.currentMitigation}</strong>
              <ul className="compact-list">
                <li>Detection: {threat.detectionSignal}</li>
                <li>Escalation: {threat.escalationPath}</li>
                <li>Residual risk: {threat.residualRisk}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Security Assurance Pipeline">
        <div className="section-heading">
          <p className="eyebrow">Security Assurance Pipeline</p>
          <h2>No-secret security checks convert cyber readiness into repeatable release evidence.</h2>
        </div>
        {summary.securityAssurancePipeline.gates.map((gate) => (
          <article className="module-row" key={gate.id}>
            <div>
              <span>{gate.status}</span>
              <h2>{gate.name}</h2>
            </div>
            <p>{gate.requiredControl}</p>
            <div>
              <strong>{gate.automatedCheck}</strong>
              <ul className="compact-list">
                <li>Category: {gate.category}</li>
                <li>Evidence: {gate.evidence.join(", ")}</li>
                <li>Failure mode: {gate.failureMode}</li>
                <li>Manual follow-up: {gate.manualFollowUp}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Security Release Readiness Gate">
        <div className="section-heading">
          <p className="eyebrow">Security Release Readiness Gate</p>
          <h2>SCRIMED can show synthetic and buyer-diligence readiness while keeping PHI and go-live authority blocked.</h2>
        </div>
        <article className="module-row">
          <div>
            <span>{summary.securityReleaseReadiness.scorecard.currentStage}</span>
            <h2>Current authority: {summary.securityReleaseReadiness.scorecard.releaseAuthority}</h2>
          </div>
          <p>{summary.securityReleaseReadiness.boundary}</p>
          <div>
            <strong>{summary.securityReleaseReadiness.scorecard.auditHash}</strong>
            <ul className="compact-list">
              <li>PHI authority: {summary.securityReleaseReadiness.scorecard.phiAuthority}</li>
              <li>Customer go-live: {summary.securityReleaseReadiness.scorecard.customerGoLiveAuthority}</li>
              <li>Go gates: {summary.securityReleaseReadiness.scorecard.goGateCount}</li>
              <li>Conditional gates: {summary.securityReleaseReadiness.scorecard.conditionalGateCount}</li>
              <li>No-go gates: {summary.securityReleaseReadiness.scorecard.noGoGateCount}</li>
            </ul>
          </div>
        </article>
        {summary.securityReleaseReadiness.lanes.map((lane) => (
          <article className="module-row" key={lane.stage}>
            <div>
              <span>{lane.decision}</span>
              <h2>{lane.label}</h2>
            </div>
            <p>Allowed: {lane.allowedUse.join(", ")}</p>
            <div>
              <strong>Blocked: {lane.blockedUse.join(", ")}</strong>
              <ul className="compact-list">
                <li>Required evidence: {lane.requiredEvidence.join(", ")}</li>
                <li>Exit criteria: {lane.exitCriteria.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Security Diligence Evidence Packet">
        <div className="section-heading">
          <p className="eyebrow">Security Diligence Evidence Packet</p>
          <h2>Buyer and investor evidence is packaged as redacted metadata with explicit blocked-authority boundaries.</h2>
        </div>
        <article className="module-row">
          <div>
            <span>{summary.securityDiligenceEvidence.status}</span>
            <h2>Buyer diligence share-ready: {String(summary.securityDiligenceEvidence.scorecard.buyerDiligenceShareReady)}</h2>
          </div>
          <p>{summary.securityDiligenceEvidence.boundary}</p>
          <div>
            <strong>{summary.securityDiligenceEvidence.scorecard.auditHash}</strong>
            <ul className="compact-list">
              <li>Ready to share: {summary.securityDiligenceEvidence.scorecard.readyToShareCount}</li>
              <li>Manual operator required: {summary.securityDiligenceEvidence.scorecard.manualOperatorRequiredCount}</li>
              <li>External evidence required: {summary.securityDiligenceEvidence.scorecard.externalEvidenceRequiredCount}</li>
              <li>Blocked until approved: {summary.securityDiligenceEvidence.scorecard.blockedUntilApprovedCount}</li>
              <li>Questionnaire responses: {summary.securityDiligenceEvidence.scorecard.questionnaireResponseCount}</li>
              <li>Questionnaire ready: {summary.securityDiligenceEvidence.scorecard.questionnaireReadyCount}</li>
              <li>Questionnaire external evidence gaps: {summary.securityDiligenceEvidence.scorecard.questionnaireExternalEvidenceCount}</li>
              <li>PHI production share-ready: {String(summary.securityDiligenceEvidence.scorecard.phiProductionShareReady)}</li>
              <li>Customer go-live share-ready: {String(summary.securityDiligenceEvidence.scorecard.customerGoLiveShareReady)}</li>
            </ul>
          </div>
        </article>
        {summary.securityDiligenceEvidence.artifacts.map((artifact) => (
          <article className="module-row" key={artifact.id}>
            <div>
              <span>{artifact.status}</span>
              <h2>{artifact.title}</h2>
            </div>
            <p>{artifact.buyerQuestionAnswered}</p>
            <div>
              <strong>{artifact.evidenceSource}</strong>
              <ul className="compact-list">
                <li>Category: {artifact.category}</li>
                <li>Owner: {artifact.owner}</li>
                <li>Release stage: {artifact.releaseStage}</li>
                <li>Redaction rule: {artifact.redactionRule}</li>
                <li>Boundary: {artifact.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
        {summary.securityDiligenceEvidence.questionnaireResponses.map((response) => (
          <article className="module-row" key={response.id}>
            <div>
              <span>Security Questionnaire Response Library: {response.answerStatus}</span>
              <h2>{response.domain}</h2>
            </div>
            <p>{response.question}</p>
            <div>
              <strong>{response.buyerSafeAnswer}</strong>
              <ul className="compact-list">
                <li>Evidence artifacts: {response.evidenceArtifactIds.join(", ")}</li>
                <li>Supporting routes: {response.supportingRoutes.join(", ")}</li>
                <li>Owner: {response.owner}</li>
                <li>External evidence needed: {response.externalEvidenceNeeded}</li>
                <li>Human review required: {String(response.humanReviewRequired)}</li>
                <li>Redaction boundary: {response.redactionBoundary}</li>
                <li>Cannot say: {response.cannotSay.join(" ")}</li>
                <li>Audit hash: {response.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
        {summary.securityDiligenceEvidence.buyerQuestions.map((question) => (
          <article className="module-row" key={question.id}>
            <div>
              <span>Buyer question</span>
              <h2>{question.question}</h2>
            </div>
            <p>{question.currentAnswer}</p>
            <div>
              <strong>Evidence artifacts: {question.evidenceArtifactIds.join(", ")}</strong>
              <ul className="compact-list">
                <li>Remaining manual step: {question.remainingManualStep}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Incident Readiness">
        <div className="section-heading">
          <p className="eyebrow">Incident Readiness</p>
          <h2>Response lanes keep token, protected-route, PHI-risk, and public-route events operator-owned.</h2>
        </div>
        {summary.incidentReadiness.map((lane) => (
          <article className="module-row" key={lane.id}>
            <div>
              <span>{lane.owner}</span>
              <h2>{lane.name}</h2>
            </div>
            <p>{lane.trigger}</p>
            <div>
              <strong>{lane.firstResponse}</strong>
              <ul className="compact-list">
                <li>Evidence route: {lane.evidenceRoute}</li>
                <li>Boundary: {lane.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Next cyber hardening moves">
        <div className="section-heading">
          <p className="eyebrow">Next Hardening Moves</p>
          <h2>These are the next steps before regulated data, connectors, customer activation, or broader release authority.</h2>
        </div>
        {summary.nextHardeningMoves.map((move, index) => (
          <article className="module-row" key={move}>
            <div>
              <span>Move {index + 1}</span>
              <h2>{move}</h2>
            </div>
            <p>{summary.noGoBoundaries.join(" ")}</p>
            <div>
              <strong>Owner required before authority expands.</strong>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
