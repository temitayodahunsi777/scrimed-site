import Link from "next/link";
import { getClientOnboardingCommunicationsSummary } from "../lib/clientOnboardingCommunications";

export const metadata = {
  title: "SCRIMED Client Onboarding | Demo and Pilot Path",
  description:
    "SCRIMED client onboarding turns buyer interest into human-reviewed demos, pilot meetings, presentations, follow-up, and no-PHI next steps."
};

export default function ClientOnboardingPage() {
  const summary = getClientOnboardingCommunicationsSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/offerings">Offerings</Link>
        <p className="eyebrow">Make the sales experience feel easy</p>
        <h1>Turn buyer interest into the right demo, meeting, pilot, and follow-up.</h1>
        <p className="hero-text">
          SCRIMED keeps the buyer journey polished: human-reviewed emails, calendar-ready agendas,
          demo runbooks, presentation packets, meeting cadences, follow-up SLAs, and handoffs that move
          the account forward without sending PHI or overclaiming readiness.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>
            Download Onboarding Brief
          </a>
          <Link className="secondary-action" href="/demos">
            Watch Demos
          </Link>
          <Link className="secondary-action" href="/pilot">
            Request a Pilot
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Client onboarding summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Stages</span>
          <strong>{summary.stageCount}</strong>
        </article>
        <article>
          <span>Templates</span>
          <strong>{summary.templateCount}</strong>
        </article>
        <article>
          <span>Calendar packets</span>
          <strong>{summary.calendarPacketCount}</strong>
        </article>
        <article>
          <span>Meeting cadences</span>
          <strong>{summary.meetingCadenceCount}</strong>
        </article>
        <article>
          <span>Deck packets</span>
          <strong>{summary.presentationPacketCount}</strong>
        </article>
        <article>
          <span>Controls</span>
          <strong>{summary.controlCount}</strong>
        </article>
        <article>
          <span>Handoffs</span>
          <strong>{summary.handoffCount}</strong>
        </article>
        <article>
          <span>Human review stages</span>
          <strong>{summary.humanReviewStageCount}</strong>
        </article>
        <article>
          <span>Hard stops</span>
          <strong>{summary.hardStopCount}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Onboarding boundary">
        <div>
          <p className="eyebrow">Operating rule</p>
          <h2>Email, calendar, demo, and presentation artifacts are drafted for humans to approve before use.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.recommendedOperatingPath.map((step, index) => (
            <div className="layer-row" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Client onboarding stages">
        <div className="section-heading">
          <p className="eyebrow">Onboarding path</p>
          <h2>Every buyer touchpoint has a stage, owner, output, proof route, and hard stop.</h2>
        </div>
        {summary.clientOnboardingStages.map((stage) => (
          <article className="module-row" key={stage.slug}>
            <div>
              <span>{stage.status}</span>
              <h2>{stage.name}</h2>
            </div>
            <p>{stage.buyerMoment}</p>
            <div>
              <strong>{stage.objective}</strong>
              <ul className="compact-list">
                <li>Owner: {stage.owner}</li>
                <li>Buyer outputs: {stage.buyerOutputs.join(", ")}</li>
                <li>Internal outputs: {stage.internalOutputs.join(", ")}</li>
                <li>Hard stops: {stage.hardStops.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Communication templates">
        <div className="section-heading">
          <p className="eyebrow">Email and calendar-ready templates</p>
          <h2>Templates accelerate communication without silently sending anything or expanding claims.</h2>
        </div>
        {summary.clientCommunicationTemplates.map((template) => (
          <article className="module-row" key={template.slug}>
            <div>
              <span>{template.channel}</span>
              <h2>{template.name}</h2>
            </div>
            <p>{template.trigger}</p>
            <div>
              <strong>{template.subject}</strong>
              <p>{template.template}</p>
              <ul className="compact-list">
                <li>Audience: {template.audience}</li>
                <li>Fields: {template.personalizationFields.join(", ")}</li>
                <li>Approvals: {template.approvalGates.join(", ")}</li>
                <li>Blocked: {template.blockedContent.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Calendar packets">
        <div className="section-heading">
          <p className="eyebrow">Calendar packets</p>
          <h2>Meeting invites get safe titles, durations, attendee rules, follow-up SLAs, and no-PHI reminders.</h2>
        </div>
        {summary.clientCalendarPackets.map((packet) => (
          <article className="module-row" key={packet.slug}>
            <div>
              <span>{packet.meetingType}</span>
              <h2>{packet.title}</h2>
            </div>
            <p>{packet.calendarDescription}</p>
            <div>
              <strong>{packet.durationMinutes} minutes</strong>
              <ul className="compact-list">
                <li>Attendees: {packet.attendeeRules.join(", ")}</li>
                <li>Scheduling: {packet.schedulingRules.join(", ")}</li>
                <li>Follow-up: {packet.followUpSla}</li>
                <li>{packet.boundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Meeting cadences">
        <div className="section-heading">
          <p className="eyebrow">Meetings and cadences</p>
          <h2>Repeatable meeting rhythms keep demos, pilots, procurement, and renewals from depending on memory.</h2>
        </div>
        <div className="principle-grid">
          {summary.clientMeetingCadences.map((cadence) => (
            <article key={cadence.slug}>
              <span>{cadence.cadence}</span>
              <h3>{cadence.name}</h3>
              <p>{cadence.boundary}</p>
              <ul className="compact-list">
                <li>Owner: {cadence.owner}</li>
                <li>Agenda: {cadence.agenda.join(", ")}</li>
                <li>Outputs: {cadence.outputs.join(", ")}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band" aria-label="Presentation packets">
        <div className="section-heading">
          <p className="eyebrow">Presentation packets</p>
          <h2>Presentation outlines keep buyer decks, demo decks, procurement packets, and renewal reviews claims-controlled.</h2>
        </div>
        <div className="principle-grid">
          {summary.clientPresentationPackets.map((packet) => (
            <article key={packet.slug}>
              <span>{packet.audience}</span>
              <h3>{packet.name}</h3>
              <p>{packet.approvalGate}</p>
              <ul className="compact-list">
                <li>Sections: {packet.sections.join(", ")}</li>
                <li>Proof routes: {packet.proofRoutes.join(", ")}</li>
                <li>Blocked claims: {packet.blockedClaims.join(", ")}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Controls and handoffs">
        <div className="section-heading">
          <p className="eyebrow">Controls and handoffs</p>
          <h2>Human approvals, no-PHI rules, CRM logging, follow-up SLAs, and handoffs protect the buyer journey.</h2>
        </div>
        {summary.clientOnboardingControls.map((control) => (
          <article className="module-row" key={control.slug}>
            <div>
              <span>{control.status}</span>
              <h2>{control.control}</h2>
            </div>
            <p>{control.purpose}</p>
            <div>
              <strong>{control.owner}</strong>
              <ul className="compact-list">
                <li>Evidence: {control.requiredEvidence.join(", ")}</li>
                <li>Hard stops: {control.hardStops.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
        {summary.clientOnboardingHandoffs.map((handoff) => (
          <article className="module-row" key={handoff.slug}>
            <div>
              <span>handoff</span>
              <h2>{handoff.from} to {handoff.to}</h2>
            </div>
            <p>{handoff.trigger}</p>
            <div>
              <strong>{handoff.nextAction}</strong>
              <ul className="compact-list">
                <li>Artifacts: {handoff.requiredArtifacts.join(", ")}</li>
                <li>Proof routes: {handoff.proofRoutes.join(", ")}</li>
                <li>Hard stops: {handoff.hardStops.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
