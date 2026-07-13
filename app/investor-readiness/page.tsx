import Link from "next/link";
import { getInvestorReadinessCommandCenterSummary } from "../lib/investorReadinessCommandCenter";

export default function InvestorReadinessPage() {
  const summary = getInvestorReadinessCommandCenterSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/trust-center">
          Trust Center
        </Link>
        <p className="eyebrow">Investor Readiness Command Center</p>
        <h1>Enterprise diligence snapshot for SCRIMED’s no-PHI healthcare intelligence platform.</h1>
        <p className="hero-text">
          SCRIMED is ready for synthetic demos, buyer diligence, platform audit review, and execution-attempt evidence binding while PHI, live clinical action, payer submission, patient outreach, EHR writeback, and certification claims remain blocked.
        </p>
        <div className="hero-actions" aria-label="Investor readiness actions">
          <Link href="/api/investor-readiness/status">Inspect Snapshot API</Link>
          <Link href="/clinical-robustness-lab">Clinical Robustness Lab</Link>
          <Link href="/risk-register">Risk Register</Link>
          <Link href="/qa-aal2-run-evidence">AAL2 Smoke Readiness</Link>
          <Link href="/release-continuity">Release Checklist</Link>
          <Link href="/api/release-continuity/evidence-ledger">Evidence Ledger</Link>
          <Link href="/api/release-continuity/evidence-promotion">Promotion Queue</Link>
          <Link href="/api/release-continuity/evidence-freshness-guard">Freshness Guard</Link>
          <Link href="/api/release-continuity/authorization-chain">Authorization Chain</Link>
          <Link href="/api/release-continuity/diligence-gate">Diligence Gate</Link>
          <Link href="/api/release-continuity/diligence-packet-manifest">Packet Manifest</Link>
          <Link href="/api/release-continuity/recipient-qualification-matrix">Recipient Matrix</Link>
          <Link href="/api/release-continuity/diligence-packet-share-guard">Share Guard</Link>
          <Link href="/api/products/readiness">Product Registry</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Enterprise diligence snapshot">
        <article>
          <span>Company</span>
          <strong>{summary.enterpriseDiligenceSnapshot.company}</strong>
        </article>
        <article>
          <span>Status</span>
          <strong>{summary.enterpriseDiligenceSnapshot.status}</strong>
        </article>
        <article>
          <span>PHI</span>
          <strong>{summary.enterpriseDiligenceSnapshot.phi_status}</strong>
        </article>
        <article>
          <span>Clinical action</span>
          <strong>{summary.enterpriseDiligenceSnapshot.clinical_action_status}</strong>
        </article>
        <article>
          <span>Audit</span>
          <strong>{summary.enterpriseDiligenceSnapshot.audit_readiness ? "ready" : "blocked"}</strong>
        </article>
        <article>
          <span>Deployment</span>
          <strong>{summary.enterpriseDiligenceSnapshot.deployment_readiness}</strong>
        </article>
        <article>
          <span>AAL2 smoke</span>
          <strong>{summary.aal2SmokeReadiness.status}</strong>
        </article>
        <article>
          <span>Strict smoke</span>
          <strong>{summary.aal2SmokeReadiness.strictAttemptReady ? "ready" : "human operator required"}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Current boundary">
        <div>
          <p className="eyebrow">Safety posture</p>
          <h2>Buyer diligence is enabled; live clinical production remains blocked.</h2>
        </div>
        <p>{summary.boundary}</p>
      </section>

      <section className="table-section" aria-label="Evidence artifacts">
        {summary.evidenceArtifacts.map((artifact) => (
          <article className="module-row" key={artifact.label}>
            <div>
              <span>{artifact.status}</span>
              <h2>{artifact.label}</h2>
            </div>
            <p>
              Evidence route {artifact.apiRoute}; operating route {artifact.route}.
            </p>
            <Link className="module-link" href={artifact.route}>
              Review artifact
            </Link>
          </article>
        ))}
      </section>

      <section className="section-band hub-summary" aria-label="Readiness metrics">
        <article>
          <span>Clinical scenarios</span>
          <strong>{summary.clinicalReadinessStatus.scenarioCount}</strong>
        </article>
        <article>
          <span>Perturbations</span>
          <strong>{summary.clinicalReadinessStatus.perturbationCoverage}</strong>
        </article>
        <article>
          <span>Audit traces</span>
          <strong>{summary.auditLogs.envelopeAuditTraceCount}</strong>
        </article>
        <article>
          <span>Evidence trails</span>
          <strong>{summary.auditLogs.evidenceAuditTrailCount}</strong>
        </article>
        <article>
          <span>Products</span>
          <strong>{summary.productReadiness.productCount}</strong>
        </article>
        <article>
          <span>Risks</span>
          <strong>{summary.riskRegister.riskCount}</strong>
        </article>
        <article>
          <span>AAL2 gates</span>
          <strong>{summary.aal2SmokeReadiness.gateCount}</strong>
        </article>
        <article>
          <span>Release checks</span>
          <strong>{summary.deploymentReleaseChecklist.length}</strong>
        </article>
        <article>
          <span>Ledger entries</span>
          <strong>{summary.releaseEvidenceLedger.entryCount}</strong>
        </article>
        <article>
          <span>No-secret proof</span>
          <strong>{summary.releaseEvidenceLedger.passedNoSecretCount}</strong>
        </article>
        <article>
          <span>Promotion queue</span>
          <strong>{summary.releaseEvidencePromotion.queueCount}</strong>
        </article>
        <article>
          <span>Shareable metadata</span>
          <strong>{summary.releaseEvidencePromotion.shareableNoSecretCount}</strong>
        </article>
        <article>
          <span>Freshness cards</span>
          <strong>{summary.releaseEvidenceFreshnessGuard.cardCount}</strong>
        </article>
        <article>
          <span>Refresh required</span>
          <strong>{summary.releaseEvidenceFreshnessGuard.refreshRequiredCount}</strong>
        </article>
        <article>
          <span>Diligence GO</span>
          <strong>{summary.diligenceReleaseGate.goCount}</strong>
        </article>
        <article>
          <span>NO-GO gates</span>
          <strong>{summary.diligenceReleaseGate.noGoCount}</strong>
        </article>
        <article>
          <span>Packet items</span>
          <strong>{summary.diligencePacketManifest.itemCount}</strong>
        </article>
        <article>
          <span>Withheld items</span>
          <strong>
            {summary.diligencePacketManifest.withholdUntilHumanAal2Count +
              summary.diligencePacketManifest.withholdUntilQualifiedReviewCount}
          </strong>
        </article>
        <article>
          <span>Share cards</span>
          <strong>{summary.diligencePacketShareGuard.cardCount}</strong>
        </article>
        <article>
          <span>Share review</span>
          <strong>{summary.diligencePacketShareGuard.reviewRequiredCount}</strong>
        </article>
        <article>
          <span>Recipient classes</span>
          <strong>{summary.recipientQualificationMatrix.recipientClassCount}</strong>
        </article>
        <article>
          <span>Blocked recipients</span>
          <strong>{summary.recipientQualificationMatrix.blockedRecipientCount}</strong>
        </article>
        <article>
          <span>Auth chain</span>
          <strong>{summary.releaseAuthorizationChain.chainDecision}</strong>
        </article>
        <article>
          <span>Weakest link</span>
          <strong>{summary.releaseAuthorizationChain.weakestLink}</strong>
        </article>
        <article>
          <span>Chain controls</span>
          <strong>{summary.releaseAuthorizationChain.controlCount}</strong>
        </article>
        <article>
          <span>Chain blocked</span>
          <strong>{summary.releaseAuthorizationChain.blockedByDesignCount}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="Release authorization chain">
        <div className="section-heading">
          <p className="eyebrow">Release authorization chain</p>
          <h2>Diligence evidence now resolves through a weakest-link control view.</h2>
          <p>{summary.releaseAuthorizationChain.boundary}</p>
        </div>
        <div className="principle-grid">
          <article>
            <span>Decision</span>
            <h3>{summary.releaseAuthorizationChain.chainDecision}</h3>
            <p>{summary.releaseAuthorizationChain.safeUseLabel}</p>
          </article>
          <article>
            <span>Weakest link</span>
            <h3>{summary.releaseAuthorizationChain.weakestLink}</h3>
            <p>Release evidence cannot become approval authority unless all required human and external reviews are complete.</p>
          </article>
          <article>
            <span>Hash</span>
            <h3>{summary.releaseAuthorizationChain.authorizationHash}</h3>
            <p>No token values, PHI, raw logs, recipient identifiers, or customer payloads are captured.</p>
          </article>
          <article>
            <span>Buyer lane</span>
            <h3>{summary.releaseAuthorizationChain.buyerDiligenceMetadataLane}</h3>
            <p>Metadata may support diligence only after release steward review.</p>
          </article>
        </div>
      </section>

      <section className="table-section" aria-label="Deployment release checklist">
        <div className="section-heading">
          <p className="eyebrow">Deployment release checklist</p>
          <h2>Every buyer-facing release keeps public smoke, no-secret AAL2 readiness, and protected strict smoke separated.</h2>
        </div>
        {summary.deploymentReleaseChecklist.map((item) => (
          <article className="module-row" key={item.id}>
            <div>
              <span>{item.status}</span>
              <h2>{item.label}</h2>
            </div>
            <p>{item.evidence}</p>
            <div>
              <strong>{item.command}</strong>
              <ul className="compact-list">
                <li>Route: {item.route}</li>
                <li>Human review required: {item.humanReviewRequired ? "yes" : "no"}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band split-band" aria-label="AAL2 smoke readiness boundary">
        <div>
          <p className="eyebrow">AAL2 smoke readiness</p>
          <h2>Strict protected proof remains human-gated, even when the public readiness packet is buyer-visible.</h2>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>api</span>
            <strong>{summary.aal2SmokeReadiness.apiRoute}</strong>
          </div>
          <div className="layer-row">
            <span>brief</span>
            <strong>{summary.aal2SmokeReadiness.briefRoute}</strong>
          </div>
          <div className="layer-row">
            <span>token</span>
            <strong>{summary.aal2SmokeReadiness.operatorTokenRequired ? "short-lived human token required" : "not required"}</strong>
          </div>
          <div className="layer-row">
            <span>flag</span>
            <strong>{summary.aal2SmokeReadiness.targetFeatureFlagRequired ? "target feature flag required" : "not required"}</strong>
          </div>
        </div>
      </section>

      <section className="section-band split-band" aria-label="Release evidence ledger">
        <div>
          <p className="eyebrow">Release evidence ledger</p>
          <h2>No-secret build, smoke, and readiness evidence is tracked separately from approvals.</h2>
          <p className="section-copy">{summary.releaseEvidenceLedger.boundary}</p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>api</span>
            <strong>{summary.releaseEvidenceLedger.apiRoute}</strong>
          </div>
          <div className="layer-row">
            <span>brief</span>
            <strong>{summary.releaseEvidenceLedger.briefRoute}</strong>
          </div>
          <div className="layer-row">
            <span>operator</span>
            <strong>{summary.releaseEvidenceLedger.operatorRequiredCount}</strong>
          </div>
          <div className="layer-row">
            <span>approval</span>
            <strong>{summary.releaseEvidenceLedger.productionApproval ? "approved" : "not approved"}</strong>
          </div>
        </div>
      </section>

      <section className="section-band split-band" aria-label="Release evidence promotion queue">
        <div>
          <p className="eyebrow">Release evidence promotion</p>
          <h2>Evidence is split into shareable metadata, operator proof blockers, and qualified-review blockers.</h2>
          <p className="section-copy">{summary.releaseEvidencePromotion.boundary}</p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>api</span>
            <strong>{summary.releaseEvidencePromotion.apiRoute}</strong>
          </div>
          <div className="layer-row">
            <span>buyer</span>
            <strong>{summary.releaseEvidencePromotion.buyerDistributionAuthority}</strong>
          </div>
          <div className="layer-row">
            <span>AAL2 proof</span>
            <strong>{summary.releaseEvidencePromotion.operatorProofRequiredCount}</strong>
          </div>
          <div className="layer-row">
            <span>public claims</span>
            <strong>{summary.releaseEvidencePromotion.publicClaimAuthority}</strong>
          </div>
        </div>
      </section>

      <section className="section-band split-band" aria-label="Release evidence freshness guard">
        <div>
          <p className="eyebrow">Release evidence freshness</p>
          <h2>Buyer and investor evidence reuse requires a fresh rerun, AAL2 refresh, or qualified review when scope changes.</h2>
          <p className="section-copy">{summary.releaseEvidenceFreshnessGuard.boundary}</p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>api</span>
            <strong>{summary.releaseEvidenceFreshnessGuard.apiRoute}</strong>
          </div>
          <div className="layer-row">
            <span>authority</span>
            <strong>{summary.releaseEvidenceFreshnessGuard.freshnessAuthority}</strong>
          </div>
          <div className="layer-row">
            <span>refresh</span>
            <strong>{summary.releaseEvidenceFreshnessGuard.refreshRequiredCount}</strong>
          </div>
          <div className="layer-row">
            <span>review</span>
            <strong>{summary.releaseEvidenceFreshnessGuard.qualifiedReviewRefreshCount}</strong>
          </div>
        </div>
      </section>

      <section className="section-band split-band" aria-label="Diligence release gate">
        <div>
          <p className="eyebrow">Diligence release gate</p>
          <h2>Buyer diligence is GO only for no-secret metadata; production, public distribution, PHI, and clinical authority remain blocked.</h2>
          <p className="section-copy">{summary.diligenceReleaseGate.boundary}</p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>buyer</span>
            <strong>{summary.diligenceReleaseGate.buyerDiligenceGate}</strong>
          </div>
          <div className="layer-row">
            <span>AAL2</span>
            <strong>{summary.diligenceReleaseGate.protectedAal2Gate}</strong>
          </div>
          <div className="layer-row">
            <span>public</span>
            <strong>{summary.diligenceReleaseGate.publicDistributionGate}</strong>
          </div>
          <div className="layer-row">
            <span>clinical</span>
            <strong>{summary.diligenceReleaseGate.clinicalProductionGate}</strong>
          </div>
        </div>
      </section>

      <section className="section-band split-band" aria-label="Diligence packet manifest">
        <div>
          <p className="eyebrow">Diligence packet manifest</p>
          <h2>Buyer and investor packets stay no-secret, review-owned, and explicit about withheld material.</h2>
          <p className="section-copy">{summary.diligencePacketManifest.boundary}</p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>hash</span>
            <strong>{summary.diligencePacketManifest.manifestHash}</strong>
          </div>
          <div className="layer-row">
            <span>packet</span>
            <strong>{summary.diligencePacketManifest.packetUseAuthority}</strong>
          </div>
          <div className="layer-row">
            <span>public</span>
            <strong>{summary.diligencePacketManifest.publicDistributionAuthority}</strong>
          </div>
          <div className="layer-row">
            <span>items</span>
            <strong>{summary.diligencePacketManifest.itemCount}</strong>
          </div>
        </div>
      </section>

      <section className="section-band split-band" aria-label="Diligence packet share guard">
        <div>
          <p className="eyebrow">Diligence packet share guard</p>
          <h2>Packet sharing remains recipient-scoped, human-reviewed, and blocked from public distribution.</h2>
          <p className="section-copy">{summary.diligencePacketShareGuard.boundary}</p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>hash</span>
            <strong>{summary.diligencePacketShareGuard.guardHash}</strong>
          </div>
          <div className="layer-row">
            <span>external</span>
            <strong>{summary.diligencePacketShareGuard.externalShareAuthority}</strong>
          </div>
          <div className="layer-row">
            <span>recipient</span>
            <strong>{summary.diligencePacketShareGuard.recipientAuthorizationAuthority}</strong>
          </div>
          <div className="layer-row">
            <span>public</span>
            <strong>{summary.diligencePacketShareGuard.publicDistributionAuthority}</strong>
          </div>
        </div>
      </section>

      <section className="section-band split-band" aria-label="Recipient qualification matrix">
        <div>
          <p className="eyebrow">Recipient qualification matrix</p>
          <h2>External packet references now require recipient-class preflight, expiry, revocation, and no-identifier storage.</h2>
          <p className="section-copy">{summary.recipientQualificationMatrix.boundary}</p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>hash</span>
            <strong>{summary.recipientQualificationMatrix.qualificationHash}</strong>
          </div>
          <div className="layer-row">
            <span>recipient IDs</span>
            <strong>{summary.recipientQualificationMatrix.recipientIdentifierStorage}</strong>
          </div>
          <div className="layer-row">
            <span>external</span>
            <strong>{summary.recipientQualificationMatrix.externalShareAuthority}</strong>
          </div>
          <div className="layer-row">
            <span>revocation</span>
            <strong>{summary.recipientQualificationMatrix.revocationRequiredCount}</strong>
          </div>
        </div>
      </section>

      <section className="section-band principle-grid" aria-label="Model provider readiness">
        <article>
          <span>Model router</span>
          <h3>{summary.modelProviderReadiness.status}</h3>
          <p>Provider adapters: {summary.modelProviderReadiness.providerCount}; external calls enabled: {String(summary.modelProviderReadiness.externalCallsEnabled)}.</p>
        </article>
        <article>
          <span>Cost guardrails</span>
          <h3>{summary.modelProviderReadiness.costGuardrails.version}</h3>
          <p>Fail-closed verified: {String(summary.modelProviderReadiness.costGuardrails.failClosedVerified)}; provider calls enabled: {String(summary.modelProviderReadiness.costGuardrails.providerCallsEnabled)}.</p>
        </article>
        <article>
          <span>Integration readiness</span>
          <h3>{summary.integrationReadiness.currentStatus}</h3>
          <p>{summary.integrationReadiness.readyFor}</p>
        </article>
      </section>

      <section className="section-band compact-list" aria-label="Known no-go boundaries">
        <div>
          <p className="eyebrow">NO-GO boundaries</p>
          <h2>Preserved before clinical production.</h2>
        </div>
        <ul>
          {summary.knownNoGoBoundaries.map((boundary) => (
            <li key={boundary}>{boundary}</li>
          ))}
        </ul>
      </section>

      <section className="section-band compact-list" aria-label="Next milestones">
        <div>
          <p className="eyebrow">Next milestones</p>
          <h2>Highest-leverage path toward enterprise deployment.</h2>
        </div>
        <ul>
          {summary.nextMilestones.map((milestone) => (
            <li key={milestone}>{milestone}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
