import Link from "next/link";
import {
  getProofPacketShareReadinessSummary,
  proofPacketShareReadinessApiRoute
} from "../lib/proofPacketShareReadiness";
import { getScrimedProofPacketStudioSummary, scrimedProofPacketBriefRouteFor } from "../lib/scrimedProofPacketStudio";
import ProofPacketShareReadinessWorkbench from "./ProofPacketShareReadinessWorkbench";

export const metadata = {
  title: "SCRIMED Proof Packet Studio",
  description:
    "Synthetic/no-PHI SCRIMED Proof Packet Studio for investor pitch, buyer demo, pilot scope, partner implementation, and internal execution packets."
};

export default function ScrimedProofPacketStudioPage() {
  const summary = getScrimedProofPacketStudioSummary();
  const shareReadiness = getProofPacketShareReadinessSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/scrimed-guided-execution">
          Guided Execution
        </Link>
        <p className="eyebrow">SCRIMED Proof Packet Studio</p>
        <h1>Package every pitch, demo, pilot, partner handoff, and weekly execution step with proof.</h1>
        <p className="hero-text">{summary.boundary}</p>
        <div className="hero-actions" aria-label="SCRIMED Proof Packet Studio actions">
          <Link href={summary.apiRoute}>Inspect API</Link>
          <Link href="/scrimed-guided-execution">Guided Paths</Link>
          <Link href="/investor-readiness">Investor Command</Link>
          <Link href="/pilot-demo-commercial-readiness">Demo to Pilot</Link>
          <Link href="/qa-evidence">QA Evidence</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED Proof Packet Studio scorecard">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Packets</span>
          <strong>{summary.packetCount}</strong>
        </article>
        <article>
          <span>Demo readiness</span>
          <strong>{summary.scorecard.demoReadiness}</strong>
        </article>
        <article>
          <span>Investor confidence</span>
          <strong>{summary.scorecard.investorConfidence}</strong>
        </article>
        <article>
          <span>Boundary strength</span>
          <strong>{summary.scorecard.safetyBoundaryStrength}</strong>
        </article>
        <article>
          <span>Markdown exports</span>
          <strong>{summary.downloadablePacketRoutes.length}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Proof packet posture">
        <div>
          <p className="eyebrow">Strategic Packaging</p>
          <h2>{summary.scorecard.summary}</h2>
        </div>
        <div>
          <p>{summary.recommendedNextBuildStep}</p>
          <p>
            Proof packets keep SCRIMED presentations, demos, investor meetings, pilot handoffs, and weekly execution
            grounded in routes, evidence, owners, acceptance criteria, and retained boundaries.
          </p>
          <p>Markdown packet exports require human operator review before external sharing.</p>
        </div>
      </section>

      <section className="section-band" aria-label="Protected share readiness">
        <div className="section-heading">
          <p className="eyebrow">Protected Share Readiness</p>
          <h2>Move exact packet fingerprints into governed review without sending anything.</h2>
          <p>
            This no-PII preflight maps an external-facing packet into the canonical protected
            Distribution Lockbox. A successful assessment prepares a disabled handoff draft; it
            does not create approval, customer permission, solicitation authority, or external
            distribution authority.
          </p>
        </div>
        <ProofPacketShareReadinessWorkbench
          apiRoute={proofPacketShareReadinessApiRoute}
          packets={shareReadiness.eligiblePackets}
          requiredConfirmations={shareReadiness.requiredConfirmations}
        />
      </section>

      <section className="table-section" aria-label="Proof packet manifests">
        <div className="section-heading">
          <p className="eyebrow">Packet Manifests</p>
          <h2>Each packet binds narrative, deck flow, demo route, proof evidence, pricing motion, and follow-up.</h2>
        </div>
        {summary.packets.map((packet) => (
          <article className="module-row" key={packet.id}>
            <div>
              <span>{packet.readiness}</span>
              <h2>{packet.title}</h2>
            </div>
            <p>{packet.pitchNarrative}</p>
            <div>
              <strong>{packet.followUpAction}</strong>
              <ul className="compact-list">
                <li>Audience: {packet.audience}</li>
                <li>Owner: {packet.owner}</li>
                <li>Type: {packet.packetType}</li>
                <li>Pricing motion: {packet.pricingMotion}</li>
                <li>Audit: {packet.auditHash}</li>
                <li>
                  Markdown packet: <Link href={scrimedProofPacketBriefRouteFor(packet.id)}>{scrimedProofPacketBriefRouteFor(packet.id)}</Link>
                </li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Downloadable markdown packet endpoints">
        <div className="section-heading">
          <p className="eyebrow">Downloadable Markdown Packets</p>
          <h2>Each export is claims-safe, no-PHI, and marked for human review before external sharing.</h2>
        </div>
        {summary.downloadablePacketRoutes.map((packetRoute) => (
          <article className="module-row" key={packetRoute.packetId}>
            <div>
              <span>{packetRoute.audience}</span>
              <h2>{packetRoute.title}</h2>
            </div>
            <p>{packetRoute.retainedBoundary}</p>
            <div>
              <strong>
                <Link href={packetRoute.route}>{packetRoute.route}</Link>
              </strong>
              <ul className="compact-list">
                <li>Human review required: {packetRoute.humanReviewRequired ? "yes" : "no"}</li>
                <li>Data boundary: synthetic/no-PHI metadata only</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Deck and demo structure">
        <div className="section-heading">
          <p className="eyebrow">Presentation + Demo Structure</p>
          <h2>Deck sections and demo scripts keep SCRIMED sharp, repeatable, and claims-safe.</h2>
        </div>
        {summary.packets.map((packet) => (
          <article className="module-row" key={`${packet.id}-deck`}>
            <div>
              <span>{packet.packetType}</span>
              <h2>{packet.title}</h2>
            </div>
            <p>{packet.objective}</p>
            <div>
              <strong>Deck: {packet.deckSections.join(" -> ")}</strong>
              <ul className="compact-list">
                <li>Demo script: {packet.demoScript.join(", ")}</li>
                <li>Acceptance: {packet.acceptanceCriteria.join(" ")}</li>
                <li>Limitations: {packet.limitationDisclosures.join(" ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Proof artifacts">
        <div className="section-heading">
          <p className="eyebrow">Proof Artifacts</p>
          <h2>Every packet includes route-backed evidence and freshness expectations.</h2>
        </div>
        {summary.packets.flatMap((packet) =>
          packet.proofArtifacts.map((artifact) => (
            <article className="module-row" key={`${packet.id}-${artifact.id}`}>
              <div>
                <span>{packet.audience}</span>
                <h2>{artifact.label}</h2>
              </div>
              <p>{artifact.evidencePurpose}</p>
              <div>
                <strong>{artifact.route}</strong>
                <ul className="compact-list">
                  <li>Owner: {artifact.owner}</li>
                  <li>Freshness: {artifact.freshnessRequirement}</li>
                </ul>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
