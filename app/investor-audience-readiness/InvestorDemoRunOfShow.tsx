"use client";

import Link from "next/link";
import { useState } from "react";
import {
  assessInvestorDemoRehearsal,
  buildInvestorDemoRunOfShow,
  investorDemoModes,
  investorDemoRunOfShowBoundary,
  type InvestorDemoMode
} from "../lib/investorDemoRunOfShow";

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds} sec`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds === 0
    ? `${minutes} min`
    : `${minutes} min ${remainingSeconds} sec`;
}

export default function InvestorDemoRunOfShow() {
  const [mode, setMode] = useState<InvestorDemoMode>("executive-preview");
  const plan = buildInvestorDemoRunOfShow(mode);
  const rehearsal = assessInvestorDemoRehearsal(mode);

  return (
    <section
      className="investor-demo-console"
      id="investor-demo-run-of-show"
      aria-labelledby="investor-demo-title"
    >
      <div className="investor-demo-heading">
        <div>
          <p className="eyebrow">Guided investor demonstration</p>
          <h2 id="investor-demo-title">One workflow. One trust moat. One controlled next step.</h2>
          <p>
            Use a timed path that keeps the product clear, the proof inspectable, and every unsupported
            claim out of the room.
          </p>
        </div>
        <div className="investor-demo-mode" role="group" aria-label="Investor demo duration">
          {investorDemoModes.map((option) => (
            <button
              aria-pressed={mode === option.id}
              key={option.id}
              onClick={() => setMode(option.id)}
              type="button"
            >
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="investor-demo-status" aria-label="Investor demo safety status">
        <span>{plan.durationMinutes} minutes</span>
        <span>{plan.chapters.length} proof chapters</span>
        <span>Synthetic only</span>
        <span>Human review required</span>
      </div>

      <div className="investor-demo-rehearsal" aria-label="Investor demo rehearsal gate">
        <div>
          <p className="eyebrow">Automated rehearsal gate</p>
          <h3>
            {rehearsal.internalRehearsalReady
              ? "Ready for an internal founder rehearsal"
              : "Rehearsal blocked"}
          </h3>
          <p>
            {rehearsal.automatedChecksPassed}/{rehearsal.automatedCheckCount} automated checks pass.
            External artifact distribution and investment solicitation remain unauthorized.
          </p>
        </div>
        <div>
          <strong>Before an external meeting</strong>
          <ol className="compact-list">
            {rehearsal.requiredHumanActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ol>
        </div>
      </div>

      <p className="investor-demo-question">{plan.openingQuestion}</p>

      <ol className="investor-demo-timeline">
        {plan.chapters.map((chapter) => (
          <li key={chapter.id}>
            <article>
              <div className="investor-demo-step-meta">
                <span>0{chapter.order}</span>
                <strong>{formatDuration(chapter.durationSeconds)}</strong>
              </div>
              <h3>{chapter.title}</h3>
              <p>{chapter.talkTrack}</p>
              <div className="investor-demo-evidence">
                <strong>Evidence to show</strong>
                <p>{chapter.evidenceStatement}</p>
              </div>
              <p className="investor-demo-decision">{chapter.decisionPoint}</p>
              <div className="investor-demo-links">
                <Link
                  className="primary-action"
                  href={chapter.primaryProof.route}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open {chapter.primaryProof.label}
                </Link>
                {chapter.supportingProof.map((proof) => (
                  <Link
                    className="secondary-action"
                    href={proof.route}
                    key={proof.route}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {proof.label}
                  </Link>
                ))}
              </div>
              <small>{chapter.retainedBoundary}</small>
            </article>
          </li>
        ))}
      </ol>

      <div className="investor-demo-close">
        <div>
          <span>Controlled next decision</span>
          <strong>{plan.closingDecision}</strong>
        </div>
        <p>{plan.evidenceStandard}</p>
      </div>

      <p className="investor-demo-boundary">{investorDemoRunOfShowBoundary}</p>
    </section>
  );
}
