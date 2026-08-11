"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  assessInvestorDemoCommandRoom,
  createInvestorDemoCommandRoomReceipt,
  createInvestorDemoOperatorConfirmations,
  getInvestorDemoProofRoutes,
  type InvestorDemoOperatorConfirmationId,
  type InvestorDemoProofCheck
} from "../lib/investorDemoCommandRoom";
import {
  buildInvestorDemoRunOfShow,
  investorDemoModes,
  type InvestorDemoMode
} from "../lib/investorDemoRunOfShow";

const proofCheckTimeoutMs = 5000;

function formatClock(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function createUncheckedProofRoutes(mode: InvestorDemoMode): InvestorDemoProofCheck[] {
  return getInvestorDemoProofRoutes(mode).map((route) => ({
    route,
    outcome: "not-checked",
    httpStatus: null,
    boundaryHeadersValid: false
  }));
}

function proofLabel(route: string) {
  return route
    .split("/")
    .filter(Boolean)
    .map((part) => part.replaceAll("-", " "))
    .join(" / ");
}

export default function InvestorDemoCommandRoom() {
  const [mode, setMode] = useState<InvestorDemoMode>("executive-preview");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [proofChecks, setProofChecks] = useState<InvestorDemoProofCheck[]>(() =>
    createUncheckedProofRoutes("executive-preview")
  );
  const [checkingRoutes, setCheckingRoutes] = useState(false);
  const [confirmations, setConfirmations] = useState(() =>
    createInvestorDemoOperatorConfirmations()
  );
  const [completedChapterIds, setCompletedChapterIds] = useState<string[]>([]);

  const plan = useMemo(() => buildInvestorDemoRunOfShow(mode), [mode]);
  const assessment = useMemo(
    () =>
      assessInvestorDemoCommandRoom({
        mode,
        proofChecks,
        confirmations,
        completedChapterIds,
        elapsedSeconds
      }),
    [completedChapterIds, confirmations, elapsedSeconds, mode, proofChecks]
  );

  useEffect(() => {
    if (!timerRunning) return;

    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [timerRunning]);

  function resetSession(nextMode = mode) {
    setTimerRunning(false);
    setElapsedSeconds(0);
    setCompletedChapterIds([]);
    setConfirmations(createInvestorDemoOperatorConfirmations());
    setProofChecks(createUncheckedProofRoutes(nextMode));
  }

  function selectMode(nextMode: InvestorDemoMode) {
    setMode(nextMode);
    resetSession(nextMode);
  }

  function toggleConfirmation(id: InvestorDemoOperatorConfirmationId) {
    setConfirmations((current) =>
      current.map((confirmation) =>
        confirmation.id === id
          ? { ...confirmation, confirmed: !confirmation.confirmed }
          : confirmation
      )
    );
  }

  async function runProofPreflight() {
    setCheckingRoutes(true);

    const results = await Promise.all(
      getInvestorDemoProofRoutes(mode).map(async (route) => {
        const controller = new AbortController();
        const timeout = window.setTimeout(
          () => controller.abort(),
          proofCheckTimeoutMs
        );

        try {
          const response = await fetch(route, {
            method: "HEAD",
            cache: "no-store",
            credentials: "same-origin",
            redirect: "follow",
            signal: controller.signal
          });
          const boundaryHeadersValid =
            response.headers.get("x-scrimed-clinical-care-authority") ===
              "not-authorized-live-care" &&
            response.headers.get("x-scrimed-phi-authority") ===
              "not-authorized-production-phi" &&
            response.headers.get(
              "x-scrimed-production-connector-authority"
            ) === "not-production-connector-approved";

          return {
            route,
            outcome:
              response.ok && boundaryHeadersValid
                ? ("pass" as const)
                : ("fail" as const),
            httpStatus: response.status,
            boundaryHeadersValid
          };
        } catch {
          return {
            route,
            outcome: "fail" as const,
            httpStatus: null,
            boundaryHeadersValid: false
          };
        } finally {
          window.clearTimeout(timeout);
        }
      })
    );

    setProofChecks(results);
    setCheckingRoutes(false);
  }

  function toggleChapter(chapterId: string, chapterOrder: number) {
    if (completedChapterIds.includes(chapterId)) {
      setCompletedChapterIds((current) =>
        current.filter((id) => {
          const chapter = plan.chapters.find((entry) => entry.id === id);
          return chapter ? chapter.order < chapterOrder : false;
        })
      );
      return;
    }

    if (chapterOrder !== completedChapterIds.length + 1) return;
    const next = [...completedChapterIds, chapterId];
    setCompletedChapterIds(next);
    if (next.length === plan.chapters.length) setTimerRunning(false);
  }

  function downloadReceipt() {
    if (!assessment.presentationComplete) return;

    const blob = new Blob(
      [createInvestorDemoCommandRoomReceipt(assessment)],
      { type: "text/markdown;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `scrimed-investor-demo-${mode}-receipt.md`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  const nextChapterOrder = completedChapterIds.length + 1;

  return (
    <section className="investor-command-room" aria-label="Investor demo command room">
      <div className="investor-command-toolbar">
        <div>
          <p className="eyebrow">Operator control</p>
          <h2>Prepare, present, and close without outrunning the evidence.</h2>
        </div>
        <div className={`investor-command-stage stage-${assessment.stage}`} aria-live="polite">
          <span>Session state</span>
          <strong>{assessment.stage.replaceAll("-", " ")}</strong>
        </div>
      </div>

      <div className="investor-command-mode" role="group" aria-label="Presentation mode">
        {investorDemoModes.map((option) => (
          <button
            aria-pressed={mode === option.id}
            key={option.id}
            onClick={() => selectMode(option.id)}
            type="button"
          >
            <strong>{option.label}</strong>
            <span>{option.description}</span>
          </button>
        ))}
      </div>

      <div className="investor-command-instruments">
        <section aria-labelledby="timer-title">
          <div className="investor-command-section-heading">
            <div>
              <p className="eyebrow">Timebox</p>
              <h3 id="timer-title">Presentation clock</h3>
            </div>
            <strong className={elapsedSeconds > plan.durationSeconds ? "timer-over" : ""}>
              {formatClock(elapsedSeconds)} / {formatClock(plan.durationSeconds)}
            </strong>
          </div>
          <progress max={plan.durationSeconds} value={Math.min(elapsedSeconds, plan.durationSeconds)}>
            {elapsedSeconds} seconds
          </progress>
          <div className="investor-command-actions">
            <button
              className="primary-action"
              disabled={!assessment.eligibleToBegin || assessment.presentationComplete}
              onClick={() => setTimerRunning((current) => !current)}
              type="button"
            >
              {timerRunning ? "Pause" : elapsedSeconds > 0 ? "Resume" : "Start"}
            </button>
            <button className="secondary-action" onClick={() => resetSession()} type="button">
              Reset
            </button>
          </div>
        </section>

        <section aria-labelledby="preflight-title">
          <div className="investor-command-section-heading">
            <div>
              <p className="eyebrow">Proof preflight</p>
              <h3 id="preflight-title">Same-origin route and boundary check</h3>
            </div>
            <strong>
              {proofChecks.filter((check) => check.outcome === "pass").length}/{proofChecks.length}
            </strong>
          </div>
          <p>
            Read-only checks confirm every canonical proof route is reachable and still advertises the
            no-PHI, no-live-care, and no-production-connector boundary.
          </p>
          <button
            className="primary-action"
            disabled={checkingRoutes}
            onClick={runProofPreflight}
            type="button"
          >
            {checkingRoutes ? "Checking routes" : "Run proof preflight"}
          </button>
        </section>
      </div>

      <section className="investor-command-checklist" aria-labelledby="operator-checklist-title">
        <div className="investor-command-section-heading">
          <div>
            <p className="eyebrow">Human gate</p>
            <h3 id="operator-checklist-title">Presenter confirmations</h3>
          </div>
          <strong>
            {confirmations.filter((confirmation) => confirmation.confirmed).length}/{confirmations.length}
          </strong>
        </div>
        <div className="investor-command-confirmations">
          {confirmations.map((confirmation) => (
            <label key={confirmation.id}>
              <input
                checked={confirmation.confirmed}
                onChange={() => toggleConfirmation(confirmation.id)}
                type="checkbox"
              />
              <span>
                <strong>{confirmation.label}</strong>
                <small>{confirmation.detail}</small>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="investor-command-route-list" aria-label="Proof route results">
        {proofChecks.map((check) => (
          <div className={`route-${check.outcome}`} key={check.route}>
            <span>{check.outcome.replace("not-checked", "pending")}</span>
            <strong>{proofLabel(check.route)}</strong>
            <small>{check.httpStatus ?? "not checked"}</small>
          </div>
        ))}
      </section>

      <p className="investor-command-opening">{plan.openingQuestion}</p>

      <ol className="investor-command-chapters">
        {plan.chapters.map((chapter) => {
          const completed = completedChapterIds.includes(chapter.id);
          const available = assessment.eligibleToBegin && chapter.order <= nextChapterOrder;

          return (
            <li className={completed ? "chapter-complete" : ""} key={chapter.id}>
              <article>
                <div className="investor-command-chapter-meta">
                  <span>0{chapter.order}</span>
                  <strong>{formatClock(chapter.durationSeconds)}</strong>
                </div>
                <h3>{chapter.title}</h3>
                <p>{chapter.talkTrack}</p>
                <dl>
                  <div>
                    <dt>Evidence</dt>
                    <dd>{chapter.evidenceStatement}</dd>
                  </div>
                  <div>
                    <dt>Decision</dt>
                    <dd>{chapter.decisionPoint}</dd>
                  </div>
                </dl>
                <div className="investor-command-links">
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
                <button
                  className="investor-command-complete"
                  disabled={!available}
                  onClick={() => toggleChapter(chapter.id, chapter.order)}
                  type="button"
                >
                  {completed ? "Marked presented" : "Mark chapter presented"}
                </button>
                <small className="investor-command-boundary">{chapter.retainedBoundary}</small>
              </article>
            </li>
          );
        })}
      </ol>

      <section className="investor-command-close" aria-labelledby="command-close-title">
        <div>
          <p className="eyebrow">Controlled next decision</p>
          <h3 id="command-close-title">{plan.closingDecision}</h3>
          <p>{plan.evidenceStandard}</p>
        </div>
        <div>
          <button
            className="primary-action"
            disabled={!assessment.presentationComplete}
            onClick={downloadReceipt}
            type="button"
          >
            Download internal receipt
          </button>
          <span>{assessment.auditHash}</span>
        </div>
      </section>

      {assessment.blockers.length > 0 ? (
        <section className="investor-command-blockers" aria-live="polite">
          <strong>Complete before presenting</strong>
          <ul>
            {assessment.blockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="investor-command-disclaimer">
        {assessment.warnings.join(" ")} No external send, solicitation, PHI, clinical, production,
        or independent-approval authority is granted.
      </p>
    </section>
  );
}
