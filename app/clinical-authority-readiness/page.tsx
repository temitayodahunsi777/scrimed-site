import Link from "next/link";
import { getClinicalAuthorityReadinessSummary } from "../lib/clinicalAuthorityReadiness";

export const metadata = {
  title: "SCRIMED Clinical Authority Readiness",
  description:
    "Hard-gate readiness for live clinical care authority, PHI processing, legal approval, regional approval, reimbursement review, security certification, and production clinical authorization."
};

export default function ClinicalAuthorityReadinessPage() {
  const summary = getClinicalAuthorityReadinessSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/clinical-care-activation">Clinical Care Activation</Link>
        <p className="eyebrow">Clinical Authority Readiness</p>
        <h1>SCRIMED prepares every hard clinical authority gate without pretending those gates are cleared.</h1>
        <p className="hero-text">
          This layer organizes live-care authority, PHI processing, legal approval, regional regulatory approval,
          reimbursement review, security certification, connector acceptance, and production clinical authorization
          into explicit evidence packs, retained gates, safe workarounds, and next operator actions.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Authority Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/pilot-workspace/access#clinical-authority-evidence-room">Protected Evidence Room</Link>
          <Link className="secondary-action" href="/pilot-workspace/access#clinical-authority-owner-matrix">Owner Matrix</Link>
          <Link className="secondary-action" href="/pilot-workspace/access#clinical-authority-artifact-intake">Artifact Intake</Link>
          <Link className="secondary-action" href="/pilot-workspace/access#authority-artifact-references">Artifact References</Link>
          <Link className="secondary-action" href="/trust-center">Trust Center</Link>
          <Link className="secondary-action" href="/global-reach">Regional Readiness</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Clinical authority readiness summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Clinical authority</span>
          <strong>{summary.authorizationStatus}</strong>
        </article>
        <article>
          <span>PHI</span>
          <strong>{summary.phiStatus}</strong>
        </article>
        <article>
          <span>Legal</span>
          <strong>{summary.legalStatus}</strong>
        </article>
        <article>
          <span>Regional</span>
          <strong>{summary.regionalStatus}</strong>
        </article>
        <article>
          <span>Reimbursement</span>
          <strong>{summary.reimbursementStatus}</strong>
        </article>
        <article>
          <span>Security</span>
          <strong>{summary.securityCertificationStatus}</strong>
        </article>
        <article>
          <span>Production</span>
          <strong>{summary.productionClinicalStatus}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Hard boundary</p>
          <h2>Preparation is active. Authorization remains blocked until signed evidence exists.</h2>
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

      <section className="table-section" aria-label="Clinical authority domains">
        <div className="section-heading">
          <p className="eyebrow">Authority domains</p>
          <h2>Every known hard gate has an owner, evidence path, retained gate, and safe workaround.</h2>
        </div>
        {summary.domains.map((domain) => (
          <article className="module-row" key={domain.key}>
            <div>
              <span>{domain.status}</span>
              <h2>{domain.name}</h2>
            </div>
            <p>{domain.currentBoundary}</p>
            <div>
              <strong>{domain.preparationNow}</strong>
              <ul className="compact-list">
                <li>Gate: {domain.retainedGate}</li>
                <li>Workaround: {domain.safeWorkaround}</li>
                <li>Owners: {domain.accountableOwners.join(", ")}</li>
                <li>Proof: {domain.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Boundary resolutions">
        <div className="section-heading">
          <p className="eyebrow">Boundary resolution</p>
          <h2>Known limitations are contained with workarounds while signed approvals remain mandatory.</h2>
        </div>
        {summary.boundaryResolutions.map((resolution) => (
          <article className="module-row" key={resolution.boundary}>
            <div>
              <span>{resolution.status}</span>
              <h2>{resolution.boundary}</h2>
            </div>
            <p>{resolution.riskIfIgnored}</p>
            <div>
              <strong>{resolution.resolution}</strong>
              <p>{resolution.retainedGate}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Preparation workstreams">
        <div className="section-heading">
          <p className="eyebrow">Preparation workstreams</p>
          <h2>SCRIMED can keep moving without accepting PHI or live clinical execution prematurely.</h2>
        </div>
        {summary.workstreams.map((workstream) => (
          <article className="module-row" key={workstream.name}>
            <div>
              <span>workstream</span>
              <h2>{workstream.name}</h2>
            </div>
            <p>{workstream.objective}</p>
            <div>
              <strong>{workstream.nextOperatorAction}</strong>
              <ul className="compact-list">
                <li>Current evidence: {workstream.currentSCRIMEDEvidence.join(", ")}</li>
                <li>Missing before clearance: {workstream.missingBeforeClearance.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Evidence packs">
        <div className="section-heading">
          <p className="eyebrow">Evidence packs</p>
          <h2>Authority readiness routes connect public review to protected no-PHI diligence packets.</h2>
        </div>
        {summary.evidencePacks.map((pack) => (
          <article className="module-row" key={pack.name}>
            <div>
              <span>pack</span>
              <h2>{pack.name}</h2>
            </div>
            <p>{pack.purpose}</p>
            <div>
              <Link className="module-link" href={pack.route}>
                Open pack route
              </Link>
              <p>{pack.packetRoute ?? "Public packet"}</p>
              <p>{pack.boundary}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Operating modes">
        <div className="section-heading">
          <p className="eyebrow">Operating modes</p>
          <h2>Only synthetic evaluation is permitted now; every higher-risk mode has explicit entry criteria.</h2>
        </div>
        {summary.operatingModes.map((mode) => (
          <article className="module-row" key={mode.mode}>
            <div>
              <span>{mode.permittedNow ? "permitted-now" : "blocked-now"}</span>
              <h2>{mode.mode}</h2>
            </div>
            <p>{mode.operatorInstruction}</p>
            <div>
              <strong>Entry criteria</strong>
              <ul className="compact-list">
                {mode.entryCriteria.map((criteria) => (
                  <li key={criteria}>{criteria}</li>
                ))}
                <li>Blocked until: {mode.blockedUntil.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Source references">
        <div className="section-heading">
          <p className="eyebrow">Source references</p>
          <h2>Authority readiness is anchored to official references and SCRIMED internal controls.</h2>
        </div>
        {summary.sourceReferences.map((source) => (
          <article className="module-row" key={source.name}>
            <div>
              <span>{source.sourceType}</span>
              <h2>{source.name}</h2>
            </div>
            <p>{source.readinessImplication}</p>
            {source.url ? (
              <a className="module-link" href={source.url}>
                Source checked {source.sourceCheckedAt}
              </a>
            ) : (
              <strong>Internal control checked {source.sourceCheckedAt}</strong>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
