import Link from "next/link";

import {
  clinicalAssuranceScenarioIds,
  getClinicalAssuranceControlPlaneSummary,
  runClinicalAssuranceScenario
} from "../lib/clinicalAssuranceControlPlane";
import { getScrimedWorkFeatureFlags } from "../lib/scrimed-work/featureFlags";

export const metadata = {
  title: "Clinical Assurance Control Plane | SCRIMED",
  description:
    "Synthetic SCRIMED control plane for clinical assurance levels, sovereign enclaves, model passports, capacity, concentration, evidence, kill switches, and independent failover."
};

export default function ClinicalAssuranceControlPlanePage() {
  const summary = getClinicalAssuranceControlPlaneSummary();
  const flags = getScrimedWorkFeatureFlags();
  const scenarios = clinicalAssuranceScenarioIds.map(runClinicalAssuranceScenario);
  const decision = summary.verticalSlice.decision;

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/scrimed-work">
          SCRIMED Work
        </Link>
        <p className="eyebrow">SCRIMED Atlas Assurance</p>
        <h1>Clinical Assurance Control Plane</h1>
        <p className="hero-text">
          Exact model passports, sovereign enclave policy, worst-cell evidence, capacity admission, concentration
          ceilings, kill switches, and materially independent fallback are evaluated before a governed route can run.
        </p>
        <div className="hero-actions" aria-label="Clinical assurance resources">
          <Link href="/api/clinical-assurance-control-plane">Inspect API</Link>
          <Link href="/api/clinical-assurance-control-plane/brief">Read Brief</Link>
          <Link href="/documentation-before-authorization">Open PayerIQ</Link>
          <Link href="/boundary-release-approvals">Approval Matrix</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Clinical assurance posture">
        <article>
          <span>Control plane</span>
          <strong>{flags.clinicalAssuranceControlPlaneEnabled ? "enabled" : "disabled"}</strong>
        </article>
        <article>
          <span>Enforcement</span>
          <strong>{flags.clinicalAssuranceEnforcementEnabled ? "enabled" : "observe only"}</strong>
        </article>
        <article>
          <span>Durable writes</span>
          <strong>{flags.clinicalAssuranceDurableStoreEnabled ? "enabled" : "disabled"}</strong>
        </article>
        <article>
          <span>External calls</span>
          <strong>disabled</strong>
        </article>
        <article>
          <span>Clinical authority</span>
          <strong>not authorized</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="PayerIQ vertical slice">
        <div>
          <p className="eyebrow">First Vertical Slice</p>
          <h2>PayerIQ binds every synthetic review packet to exact runtime authorization evidence.</h2>
        </div>
        <div>
          <p>
            Preflight status: <strong>{decision.status}</strong>
          </p>
          <p>
            CAL: <strong>{decision.resolvedAssuranceLevel}</strong>
          </p>
          <p>
            Independent fallback: <strong>{decision.fallbackMateriallyIndependent ? "verified" : "blocked"}</strong>
          </p>
          <p>
            Human review: <strong>required</strong>
          </p>
        </div>
      </section>

      <section className="table-section" aria-label="Clinical assurance registry">
        <div className="section-heading">
          <p className="eyebrow">Registry</p>
          <h2>Versioned authorization replaces silent provider and model substitution.</h2>
        </div>
        {[
          ["Sovereign enclaves", summary.registry.enclaveCount],
          ["Model passports", summary.registry.modelPassportCount],
          ["Tool passports", summary.registry.toolPassportCount],
          ["Capacity passports", summary.registry.capacityPassportCount],
          ["Dependency edges", summary.registry.dependencyEdgeCount],
          ["Concentration budgets", summary.registry.concentrationBudgetCount],
          ["Validated domain cells", summary.registry.validatedCellCount]
        ].map(([label, count]) => (
          <article className="module-row" key={label}>
            <div>
              <span>registered</span>
              <h2>{label}</h2>
            </div>
            <p>{count} governed synthetic metadata record{count === 1 ? "" : "s"}</p>
            <div>
              <strong>Audit and human approval required</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Controlled assurance drills">
        <div className="section-heading">
          <p className="eyebrow">Controlled Drills</p>
          <h2>Negative paths are executable, deterministic, and isolated from providers and clinical systems.</h2>
        </div>
        {scenarios.map((scenario) => (
          <article className="module-row" key={scenario.scenario}>
            <div>
              <span>{scenario.type}</span>
              <h2>{scenario.scenario.replaceAll("-", " ")}</h2>
            </div>
            <p>Status: {scenario.result.status}</p>
            <div>
              <strong>{scenario.externalActionTaken ? "External action occurred" : "No external action"}</strong>
              <ul className="compact-list">
                <li>Synthetic only: yes</li>
                <li>No PHI: yes</li>
                <li>Human review remains required</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band split-band" aria-label="Clinical assurance boundary">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>CAL is an internal SCRIMED control classification, not an external certification.</h2>
        </div>
        <div>
          <p>{summary.boundary}</p>
        </div>
      </section>
    </main>
  );
}
