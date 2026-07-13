import Link from "next/link";
import { getReleaseContinuitySummary } from "../lib/releaseContinuity";

export const metadata = {
  title: "SCRIMED Release Continuity",
  description:
    "SCRIMED release continuity checkpoint for live production proof, source-control alignment, fail-closed protected routes, AAL2 operator boundaries, and approval-safe workarounds."
};

export default function ReleaseContinuityPage() {
  const summary = getReleaseContinuitySummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">Release Continuity</p>
        <h1>SCRIMED keeps live production, source checkpoints, and protected AAL2 proof in one release lane.</h1>
        <p className="hero-text">
          This page closes the gap between public smoke, GitHub checkpoints, production deployment proof,
          and the human AAL2 boundary required for protected happy-path evidence.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Continuity Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <a className="secondary-action" href={summary.releaseEvidenceLedger.apiRoute}>Evidence Ledger</a>
          <a className="secondary-action" href={summary.releaseEvidencePromotion.apiRoute}>Promotion Queue</a>
          <a className="secondary-action" href={summary.releaseEvidenceFreshnessGuard.apiRoute}>Freshness Guard</a>
          <a className="secondary-action" href={summary.releaseAuthorizationChain.apiRoute}>Authorization Chain</a>
          <a className="secondary-action" href={summary.diligenceReleaseGate.apiRoute}>Diligence Gate</a>
          <a className="secondary-action" href={summary.diligencePacketManifest.apiRoute}>Packet Manifest</a>
          <a className="secondary-action" href={summary.recipientQualificationMatrix.apiRoute}>Recipient Matrix</a>
          <a className="secondary-action" href={summary.diligencePacketShareGuard.apiRoute}>Share Guard</a>
          <Link className="secondary-action" href="/qa-aal2-run-evidence">AAL2 Smoke Readiness</Link>
          <Link className="secondary-action" href="/pilot-workspace/access">Protected Workspace</Link>
          <Link className="secondary-action" href="/buyer-release-control-run">Buyer Release Control</Link>
          <Link className="secondary-action" href="/approvals-readiness">Approvals Readiness</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Release continuity summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Gates</span>
          <strong>{summary.gateCount}</strong>
        </article>
        <article>
          <span>Resolved</span>
          <strong>{summary.resolvedGateCount}</strong>
        </article>
        <article>
          <span>AAL2 required</span>
          <strong>{summary.operatorRequiredGateCount}</strong>
        </article>
        <article>
          <span>Blocked by design</span>
          <strong>{summary.blockedByDesignGateCount}</strong>
        </article>
        <article>
          <span>External review</span>
          <strong>{summary.externalReviewGateCount}</strong>
        </article>
        <article>
          <span>Checks</span>
          <strong>{summary.checkCount}</strong>
        </article>
        <article>
          <span>Passed</span>
          <strong>{summary.passedCheckCount}</strong>
        </article>
        <article>
          <span>AAL2 smoke</span>
          <strong>{summary.aal2SmokeReadiness.status}</strong>
        </article>
        <article>
          <span>Release checklist</span>
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

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>Continuity proof is operational evidence, not release or clinical authority.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.nextOperatorActions.map((action, index) => (
            <div className="layer-row" key={action}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{action}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" id="release-authorization-chain" aria-label="Release authorization chain">
        <div className="section-heading">
          <p className="eyebrow">Release authorization chain</p>
          <h2>SCRIMED now shows the weakest-link decision before any external packet reference.</h2>
          <p>
            {summary.releaseAuthorizationChain.boundary}
          </p>
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
            <p>Buyer metadata is still separated from protected proof, public distribution, and clinical authority.</p>
          </article>
          <article>
            <span>Authorization hash</span>
            <h3>{summary.releaseAuthorizationChain.authorizationHash}</h3>
            <p>Deterministic metadata hash; no token material, PHI, recipient identifiers, or raw logs are captured.</p>
          </article>
          <article>
            <span>Protected proof lane</span>
            <h3>{summary.releaseAuthorizationChain.protectedProofLane}</h3>
            <p>Strict proof remains human AAL2-gated and never authorizes release by itself.</p>
          </article>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>passed</span>
            <strong>{summary.releaseAuthorizationChain.passedNoSecretCount}</strong>
          </div>
          <div className="layer-row">
            <span>human</span>
            <strong>{summary.releaseAuthorizationChain.humanReviewRequiredCount}</strong>
          </div>
          <div className="layer-row">
            <span>operator</span>
            <strong>{summary.releaseAuthorizationChain.operatorRequiredCount}</strong>
          </div>
          <div className="layer-row">
            <span>external</span>
            <strong>{summary.releaseAuthorizationChain.externalReviewRequiredCount}</strong>
          </div>
          <div className="layer-row">
            <span>blocked</span>
            <strong>{summary.releaseAuthorizationChain.blockedByDesignCount}</strong>
          </div>
        </div>
      </section>

      <section className="table-section" aria-label="Release source checkpoint">
        <div className="section-heading">
          <p className="eyebrow">Source checkpoint</p>
          <h2>Production proof stays tied to commit, tag, deployment, and runtime metadata.</h2>
        </div>
        <div className="principle-grid">
          <article>
            <span>Production domain</span>
            <h3>{summary.source.productionDomain}</h3>
            <p>Custom-domain smoke remains the release truth for public availability.</p>
          </article>
          <article>
            <span>Baseline deployment</span>
            <h3>{summary.source.baselineDeploymentId}</h3>
            <p>Last checkpointed production deployment before this continuity layer.</p>
          </article>
          <article>
            <span>Baseline commit</span>
            <h3>{summary.source.baselineShortCommit}</h3>
            <p>{summary.source.baselineTag}</p>
          </article>
          <article>
            <span>Runtime commit</span>
            <h3>{summary.source.runtimeCommit}</h3>
            <p>{summary.source.runtimeBranch}</p>
          </article>
        </div>
      </section>

      <section className="table-section" aria-label="Release continuity gates">
        <div className="section-heading">
          <p className="eyebrow">Gates</p>
          <h2>Every remaining limitation has an explicit owner and workaround.</h2>
        </div>
        {summary.gates.map((gate) => (
          <article className="module-row" key={gate.key}>
            <div>
              <span>{gate.status}</span>
              <h2>{gate.name}</h2>
            </div>
            <p>{gate.proof}</p>
            <div>
              <strong>{gate.workaround}</strong>
              <ul className="compact-list">
                <li>Bottleneck: {gate.bottleneck}</li>
                <li>Owner: {gate.owner}</li>
                <li>Proof: {gate.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Release checks">
        <div className="section-heading">
          <p className="eyebrow">Checks</p>
          <h2>Release evidence separates automated confidence from human-gated proof.</h2>
        </div>
        {summary.checks.map((check) => (
          <article className="module-row" key={check.name}>
            <div>
              <span>{check.status}</span>
              <h2>{check.name}</h2>
            </div>
            <p>{check.evidence}</p>
            <div>
              <strong>{check.nextAction}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Deployment release checklist">
        <div className="section-heading">
          <p className="eyebrow">Deployment release checklist</p>
          <h2>Release readiness keeps no-secret public checks separate from human-gated protected proof.</h2>
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
                <li>Boundary: {item.noSecretBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band split-band" aria-label="AAL2 smoke readiness summary">
        <div>
          <p className="eyebrow">AAL2 smoke readiness</p>
          <h2>Strict smoke remains blocked until an approved human AAL2 operator supplies a fresh short-lived token.</h2>
          <p className="section-copy">
            The readiness packet is public, no-secret release evidence. It does not mint, store, print, or verify token material.
          </p>
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
            <span>strict</span>
            <strong>{summary.aal2SmokeReadiness.strictAttemptReady ? "ready" : "human AAL2 required"}</strong>
          </div>
          <div className="layer-row">
            <span>gates</span>
            <strong>{summary.aal2SmokeReadiness.gateCount}</strong>
          </div>
        </div>
      </section>

      <section id="release-evidence-ledger" className="section-band split-band" aria-label="Release evidence ledger">
        <div>
          <p className="eyebrow">Release evidence ledger</p>
          <h2>No-secret proof is tracked as metadata; approvals remain externally gated.</h2>
          <p className="section-copy">{summary.releaseEvidenceLedger.boundary}</p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>status</span>
            <strong>{summary.releaseEvidenceLedger.status}</strong>
          </div>
          <div className="layer-row">
            <span>entries</span>
            <strong>{summary.releaseEvidenceLedger.entryCount}</strong>
          </div>
          <div className="layer-row">
            <span>operator</span>
            <strong>{summary.releaseEvidenceLedger.operatorRequiredCount}</strong>
          </div>
          <div className="layer-row">
            <span>tokens</span>
            <strong>{summary.releaseEvidenceLedger.tokenMaterialCaptured ? "captured" : "not captured"}</strong>
          </div>
        </div>
      </section>

      <section id="release-evidence-promotion" className="section-band split-band" aria-label="Release evidence promotion queue">
        <div>
          <p className="eyebrow">Release evidence promotion</p>
          <h2>Ledger evidence is promoted through human-gated lanes before buyer distribution.</h2>
          <p className="section-copy">{summary.releaseEvidencePromotion.boundary}</p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>status</span>
            <strong>{summary.releaseEvidencePromotion.status}</strong>
          </div>
          <div className="layer-row">
            <span>shareable</span>
            <strong>{summary.releaseEvidencePromotion.shareableNoSecretCount}</strong>
          </div>
          <div className="layer-row">
            <span>AAL2 proof</span>
            <strong>{summary.releaseEvidencePromotion.operatorProofRequiredCount}</strong>
          </div>
          <div className="layer-row">
            <span>approval</span>
            <strong>{summary.releaseEvidencePromotion.productionApproval ? "approved" : "not approved"}</strong>
          </div>
        </div>
      </section>

      <section id="release-evidence-freshness-guard" className="section-band split-band" aria-label="Release evidence freshness guard">
        <div>
          <p className="eyebrow">Release evidence freshness</p>
          <h2>Evidence reuse requires freshness checks before buyer, investor, clinical, security, or customer-specific language expands.</h2>
          <p className="section-copy">{summary.releaseEvidenceFreshnessGuard.boundary}</p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>hash</span>
            <strong>{summary.releaseEvidenceFreshnessGuard.freshnessHash}</strong>
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
            <span>AAL2 refresh</span>
            <strong>{summary.releaseEvidenceFreshnessGuard.humanAal2RefreshCount}</strong>
          </div>
        </div>
      </section>

      <section id="diligence-release-gate" className="section-band split-band" aria-label="Diligence release gate">
        <div>
          <p className="eyebrow">Diligence release gate</p>
          <h2>No-secret buyer diligence is separated from protected AAL2, public distribution, production, and clinical NO-GO gates.</h2>
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
            <span>production</span>
            <strong>{summary.diligenceReleaseGate.productionReleaseGate}</strong>
          </div>
          <div className="layer-row">
            <span>clinical</span>
            <strong>{summary.diligenceReleaseGate.clinicalProductionGate}</strong>
          </div>
        </div>
      </section>

      <section id="diligence-packet-manifest" className="section-band split-band" aria-label="Diligence packet manifest">
        <div>
          <p className="eyebrow">Diligence packet manifest</p>
          <h2>Buyer and investor packets are assembled from no-secret artifacts with explicit withheld material and reviewer ownership.</h2>
          <p className="section-copy">{summary.diligencePacketManifest.boundary}</p>
          <p className="section-copy">
            Protected Boundary Release Evidence Intake Packet remains human AAL2 required at
            /api/pilot-workspaces/{"{workspaceSlug}"}/boundary-release-evidence-intake/packet and does not approve boundary release.
          </p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>hash</span>
            <strong>{summary.diligencePacketManifest.manifestHash}</strong>
          </div>
          <div className="layer-row">
            <span>items</span>
            <strong>{summary.diligencePacketManifest.itemCount}</strong>
          </div>
          <div className="layer-row">
            <span>packet</span>
            <strong>{summary.diligencePacketManifest.packetUseAuthority}</strong>
          </div>
          <div className="layer-row">
            <span>public</span>
            <strong>{summary.diligencePacketManifest.publicDistributionAuthority}</strong>
          </div>
        </div>
      </section>

      <section id="diligence-packet-share-guard" className="section-band split-band" aria-label="Diligence packet share guard">
        <div>
          <p className="eyebrow">Diligence packet share guard</p>
          <h2>External packet references require recipient class, human review, and public-distribution controls.</h2>
          <p className="section-copy">{summary.diligencePacketShareGuard.boundary}</p>
          <p className="section-copy">
            protected-boundary-release-evidence-intake-packet-sharing keeps the Boundary Release Evidence Intake Packet route
            withheld until human AAL2 evidence and qualified review are retained.
          </p>
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

      <section id="recipient-qualification-matrix" className="section-band split-band" aria-label="Recipient qualification matrix">
        <div>
          <p className="eyebrow">Recipient qualification matrix</p>
          <h2>Every external packet reference now has a recipient-class, expiry, revocation, and no-identifier storage preflight.</h2>
          <p className="section-copy">{summary.recipientQualificationMatrix.boundary}</p>
          <p className="section-copy">
            The matrix keeps named recipients, access grants, raw logs, signed approvals, and protected packet bodies outside SCRIMED while preserving
            metadata-only diligence readiness.
          </p>
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
    </main>
  );
}
