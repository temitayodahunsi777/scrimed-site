"use client";

import { useMemo, useState } from "react";
import {
  capitalPlanningBoundary,
  capitalPlanningInputTemplate,
  evaluateCapitalPlan,
  type CapitalPlanningField,
  type CapitalPlanningInputs
} from "../lib/capitalPlanning";

type InputState = Record<CapitalPlanningField, string>;

const fieldDefinitions: Array<{
  field: CapitalPlanningField;
  label: string;
  hint: string;
  step: string;
}> = [
  { field: "monthlyRecurringRevenueUsd", label: "Monthly recurring revenue", hint: "Founder-approved USD amount", step: "0.01" },
  { field: "monthlyServicesRevenueUsd", label: "Monthly services revenue", hint: "Founder-approved USD amount", step: "0.01" },
  { field: "monthlyCostOfRevenueUsd", label: "Monthly cost of revenue", hint: "Hosting, delivery, and direct costs", step: "0.01" },
  { field: "monthlyOperatingExpenseUsd", label: "Monthly operating expense", hint: "Operating costs outside cost of revenue", step: "0.01" },
  { field: "cashOnHandUsd", label: "Cash on hand", hint: "Use a reconciled as-of date", step: "0.01" },
  { field: "raiseTargetUsd", label: "Planned gross raise", hint: "Planning input, not an offering term", step: "0.01" },
  { field: "oneTimeRaiseCostsUsd", label: "Estimated one-time raise costs", hint: "Counsel, diligence, and transaction costs", step: "0.01" },
  { field: "targetRunwayMonths", label: "Target runway after close", hint: "Whole months, 6 to 60", step: "1" },
  { field: "estimatedMonthsToClose", label: "Estimated months to close", hint: "Whole months, 0 to 24", step: "1" },
  { field: "acceptedWorkflowOutcomesPerMonth", label: "Accepted workflow outcomes per month", hint: "Reviewed and accepted outputs only", step: "1" },
  { field: "monthlyModelInfrastructureCostUsd", label: "Monthly model and infrastructure cost", hint: "Inference, hosting, retrieval, and observability", step: "0.01" },
  { field: "monthlyHumanReviewCostUsd", label: "Monthly human-review cost", hint: "Qualified reviewer cost for accepted outcomes", step: "0.01" }
];

function initialInputState(): InputState {
  return {
    monthlyRecurringRevenueUsd: "",
    monthlyServicesRevenueUsd: "",
    monthlyCostOfRevenueUsd: "",
    monthlyOperatingExpenseUsd: "",
    cashOnHandUsd: "",
    raiseTargetUsd: "",
    oneTimeRaiseCostsUsd: "",
    targetRunwayMonths: String(capitalPlanningInputTemplate.targetRunwayMonths),
    estimatedMonthsToClose: String(capitalPlanningInputTemplate.estimatedMonthsToClose),
    acceptedWorkflowOutcomesPerMonth: "",
    monthlyModelInfrastructureCostUsd: "",
    monthlyHumanReviewCostUsd: ""
  };
}

function parseInputs(state: InputState): CapitalPlanningInputs {
  return Object.fromEntries(
    Object.entries(state).map(([field, value]) => [field, value.trim() === "" ? 0 : Number(value)])
  ) as CapitalPlanningInputs;
}

function formatCurrency(value: number | null) {
  if (value === null) return "cash-flow positive or not measurable";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function formatMonths(value: number | null) {
  return value === null ? "cash-flow positive" : `${value} months`;
}

function formatOutcomeCost(value: number | null) {
  return value === null ? "outcome volume required" : formatCurrency(value);
}

export default function CapitalReadinessWorkbench() {
  const [inputs, setInputs] = useState<InputState>(initialInputState);
  const evaluation = useMemo(() => evaluateCapitalPlan(parseInputs(inputs)), [inputs]);

  function updateField(field: CapitalPlanningField, value: string) {
    setInputs((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="table-section" id="capital-readiness-workbench" aria-label="Capital readiness workbench">
      <div className="section-heading">
        <p className="eyebrow">Capital readiness workbench</p>
        <h2>Replace a generic funding narrative with reconciled runway, margin, scenario, and outcome-economics inputs.</h2>
        <p className="section-copy">
          Figures stay in this browser tab. The workbench does not send, persist, cache, or log entered values. Its output remains modeled and requires founder, finance, accounting, counsel, and release review before external use.
        </p>
      </div>

      <form onSubmit={(event) => event.preventDefault()}>
        <div className="form-grid">
          {fieldDefinitions.map((definition) => (
            <label className="form-field" key={definition.field}>
              <span>{definition.label}</span>
              <input
                min="0"
                max={definition.field === "targetRunwayMonths" ? "60" : undefined}
                step={definition.step}
                type="number"
                value={inputs[definition.field]}
                onChange={(event) => updateField(definition.field, event.target.value)}
              />
              <small>{definition.hint}</small>
            </label>
          ))}
        </div>
        <div className="hero-actions">
          <button className="secondary-action" type="button" onClick={() => setInputs(initialInputState())}>
            Clear entered figures
          </button>
        </div>
      </form>

      <div className="workbench-notice" aria-live="polite">
        <strong>{evaluation.status}</strong>
        <p>{capitalPlanningBoundary}</p>
      </div>

      {evaluation.status === "blocked-invalid-input" ? (
        <ul className="compact-list" aria-label="Capital planning validation errors">
          {evaluation.errors.map((error) => (
            <li key={`${error.field}:${error.code}`}>{error.message}</li>
          ))}
        </ul>
      ) : null}

      {evaluation.valid ? (
        <>
          <div className="hub-summary" aria-label="Modeled capital metrics">
            <article>
              <span>Monthly revenue</span>
              <strong>{formatCurrency(evaluation.metrics.monthlyRevenueUsd)}</strong>
            </article>
            <article>
              <span>Gross margin</span>
              <strong>{evaluation.metrics.grossMarginPercent === null ? "not measurable" : `${evaluation.metrics.grossMarginPercent}%`}</strong>
            </article>
            <article>
              <span>Monthly net burn</span>
              <strong>{formatCurrency(evaluation.metrics.monthlyNetBurnUsd)}</strong>
            </article>
            <article>
              <span>Runway before raise</span>
              <strong>{formatMonths(evaluation.metrics.runwayBeforeRaiseMonths)}</strong>
            </article>
            <article>
              <span>Runway after close</span>
              <strong>{formatMonths(evaluation.metrics.runwayAfterCloseMonths)}</strong>
            </article>
            <article>
              <span>Pre-close funding gap</span>
              <strong>{formatCurrency(evaluation.metrics.preCloseFundingGapUsd)}</strong>
            </article>
            <article>
              <span>Minimum gross raise</span>
              <strong>{formatCurrency(evaluation.metrics.minimumGrossRaiseForTargetRunwayUsd)}</strong>
            </article>
            <article>
              <span>Additional funding gap</span>
              <strong>{formatCurrency(evaluation.metrics.additionalFundingGapUsd)}</strong>
            </article>
            <article>
              <span>Cost per accepted outcome</span>
              <strong>{formatOutcomeCost(evaluation.metrics.costPerAcceptedWorkflowOutcomeUsd)}</strong>
            </article>
          </div>

          <div className="section-heading">
            <p className="eyebrow">Scenario pressure test</p>
            <h2>The base case must survive downside revenue, cost pressure, and financing delay review.</h2>
          </div>
          {evaluation.scenarios.map((scenario) => (
            <article className="module-row" key={scenario.id}>
              <div>
                <span>{scenario.id}</span>
                <h2>{scenario.label}</h2>
              </div>
              <p>Runway after close: {formatMonths(scenario.runwayAfterCloseMonths)}</p>
              <div>
                <strong>Additional funding gap: {formatCurrency(scenario.additionalFundingGapUsd)}</strong>
                <ul className="compact-list">
                  <li>Monthly revenue: {formatCurrency(scenario.monthlyRevenueUsd)}</li>
                  <li>Monthly net burn: {formatCurrency(scenario.monthlyNetBurnUsd)}</li>
                  <li>Pre-close funding gap: {formatCurrency(scenario.preCloseFundingGapUsd)}</li>
                  <li>Cash at close: {formatCurrency(scenario.cashAtCloseUsd)}</li>
                </ul>
              </div>
            </article>
          ))}

          <div className="workbench-export-lock">
            <strong>Qualified review remains mandatory</strong>
            <ul className="compact-list">
              {evaluation.reviewFlags.map((flag) => <li key={flag}>{flag}</li>)}
              {evaluation.completionRequirements.map((requirement) => <li key={requirement}>{requirement}</li>)}
            </ul>
          </div>
        </>
      ) : null}
    </section>
  );
}
