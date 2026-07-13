import Link from "next/link";
import { getPilotHandoffCommandSummary } from "../lib/pilotHandoffCommand";

export const metadata = {
  title: "SCRIMED Pilot Handoff Command",
  description:
    "Synthetic-only pilot handoff command for review-gated buyer, security, clinical, implementation, RCM, and investor packets."
};

export default function PilotHandoffCommandPage() {
  const summary = getPilotHandoffCommandSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/pilot-activation-planner">Pilot Activation Planner</Link>
        <p className="eyebrow">Pilot Handoff Command</p>
        <h1>SCRIMED converts activation plans into human-reviewed handoff packets.</h1>
        <p className="hero-text">
          This command surface organizes buyer, security, clinical, implementation, RCM, and investor handoffs
          into packet drafts, hard stops, review gates, owners, and proof routes without sending communications
          or granting live-system authority.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>
            Download Handoff Brief
          </a>
          <a className="secondary-action" href={summary.apiRoute}>
            Inspect API
          </a>
          <Link className="secondary-action" href="/pilot-activation-planner">
            Activation Planner
          </Link>
          <Link className="secondary-action" href="/client-onboarding">
            Client Onboarding
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Pilot handoff command summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Packets</span>
          <strong>{summary.packetCount}</strong>
        </article>
        <article>
          <span>Checklist</span>
          <strong>{summary.checklistCount}</strong>
        </article>
        <article>
          <span>Risk controls</span>
          <strong>{summary.riskControlCount}</strong>
        </article>
        <article>
          <span>Review packets</span>
          <strong>{summary.reviewRequiredPacketCount}</strong>
        </article>
        <article>
          <span>External approvals</span>
          <strong>{summary.externalApprovalRequiredPacketCount}</strong>
        </article>
        <article>
          <span>Blocked before send</span>
          <strong>{summary.blockedBeforeSendPacketCount}</strong>
        </article>
        <article>
          <span>Hard stops</span>
          <strong>{summary.hardStopCount}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Pilot handoff command boundary">
        <div>
          <p className="eyebrow">Handoff boundary</p>
          <h2>Packet preparation is allowed; external send and live authority remain human-gated.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {Object.entries(summary.authority).map(([name, status], index) => (
            <div className="layer-row" key={name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{name}: {status}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Pilot handoff packets">
        <div className="section-heading">
          <p className="eyebrow">Handoff packets</p>
          <h2>Each packet has a recipient, source plan, inputs, outputs, delivery channel, review gate, and blocked use.</h2>
          <p className="section-copy">{summary.nextBestMove}</p>
        </div>
        {summary.packets.map((packet) => (
          <article className="module-row" key={packet.id}>
            <div>
              <span>{packet.audience}</span>
              <h2>{packet.title}</h2>
            </div>
            <p>{packet.purpose}</p>
            <div>
              <strong>{packet.status}</strong>
              <ul className="compact-list">
                <li>Review gate: {packet.reviewGate}</li>
                <li>Channel: {packet.deliveryChannel}</li>
                <li>Allowed: {packet.allowedUse}</li>
                <li>Blocked: {packet.blockedUse}</li>
                <li>Proof routes: {packet.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Pilot handoff hard stops">
        <div className="section-heading">
          <p className="eyebrow">Hard stops</p>
          <h2>Hard stops keep sales, implementation, and investor follow-up from outrunning governance.</h2>
        </div>
        {summary.riskControls.map((control) => (
          <article className="module-row" key={control.id}>
            <div>
              <span>{control.hardStop ? "hard stop" : "watch"}</span>
              <h2>{control.risk}</h2>
            </div>
            <p>{control.control}</p>
            <div>
              <strong>{control.owner}</strong>
              <ul className="compact-list">
                <li>Proof route: {control.proofRoute}</li>
                <li>Hard stop: {control.hardStop ? "yes" : "no"}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Pilot handoff checklist">
        <div className="section-heading">
          <p className="eyebrow">Owner checklist</p>
          <h2>Every handoff has an owner, evidence route, status, and missing-input hard stop.</h2>
        </div>
        {summary.checklist.map((item) => (
          <article className="module-row" key={item.id}>
            <div>
              <span>{item.category}</span>
              <h2>{item.requirement}</h2>
            </div>
            <p>{item.owner}</p>
            <div>
              <strong>{item.status}</strong>
              <ul className="compact-list">
                <li>Evidence route: {item.evidenceRoute}</li>
                <li>Hard stop if missing: {item.hardStopIfMissing ? "yes" : "no"}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
