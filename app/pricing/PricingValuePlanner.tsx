"use client";

import { useMemo, useState } from "react";
import {
  calculateCommercialValueScenario,
  type CommercialEngagementGoal,
  type CommercialPriceRange
} from "../lib/commercialStrategy";

export type PricingPlannerTier = {
  goal: CommercialEngagementGoal;
  label: string;
  priceRange: CommercialPriceRange;
};

type PricingValuePlannerProps = {
  tiers: PricingPlannerTier[];
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function midpoint(range: CommercialPriceRange) {
  if (range.customScope) return 0;
  return Math.round((range.minimumUsd + range.maximumUsd) / 2);
}

function percentage(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default function PricingValuePlanner({ tiers }: PricingValuePlannerProps) {
  const defaultTier = tiers.find((tier) => tier.goal === "assessment") ?? tiers[0];
  const [engagementGoal, setEngagementGoal] = useState<CommercialEngagementGoal>(
    defaultTier?.goal ?? "assessment"
  );
  const [annualWorkflowVolume, setAnnualWorkflowVolume] = useState(50_000);
  const [baselineMinutesPerWorkflow, setBaselineMinutesPerWorkflow] = useState(25);
  const [loadedHourlyCostUsd, setLoadedHourlyCostUsd] = useState(75);
  const [eligibleCaptureRate, setEligibleCaptureRate] = useState(80);
  const [expectedEfficiencyRate, setExpectedEfficiencyRate] = useState(30);
  const [verifiedTaskRate, setVerifiedTaskRate] = useState(80);
  const [plannedSpendUsd, setPlannedSpendUsd] = useState(
    defaultTier ? midpoint(defaultTier.priceRange) : 50_000
  );

  const calculation = useMemo(() => {
    try {
      return {
        result: calculateCommercialValueScenario({
          engagementGoal,
          annualWorkflowVolume,
          baselineMinutesPerWorkflow,
          loadedHourlyCostUsd,
          eligibleCaptureRate: eligibleCaptureRate / 100,
          expectedEfficiencyRate: expectedEfficiencyRate / 100,
          verifiedTaskRate: verifiedTaskRate / 100,
          plannedSpendUsd
        }),
        error: null
      };
    } catch (error) {
      return {
        result: null,
        error: error instanceof Error ? error.message : "The planning inputs are invalid."
      };
    }
  }, [
    annualWorkflowVolume,
    baselineMinutesPerWorkflow,
    eligibleCaptureRate,
    engagementGoal,
    expectedEfficiencyRate,
    loadedHourlyCostUsd,
    plannedSpendUsd,
    verifiedTaskRate
  ]);

  function updateGoal(nextGoal: CommercialEngagementGoal) {
    const tier = tiers.find((candidate) => candidate.goal === nextGoal);

    if (!tier) {
      return;
    }

    setEngagementGoal(nextGoal);
    setPlannedSpendUsd(midpoint(tier.priceRange));
  }

  return (
    <div className="pricing-planner">
      <div className="pricing-planner-heading">
        <div>
          <p className="eyebrow">Buyer value hypothesis</p>
          <h2>Test whether the scope can support its planning range.</h2>
        </div>
        <p>
          This browser-only model stores nothing and uses no patient data. Results are planning hypotheses, not quotes,
          forecasts, staffing decisions, reimbursement estimates, or ROI guarantees.
        </p>
      </div>

      <div className="pricing-planner-grid">
        <fieldset className="pricing-input-panel">
          <legend>Planning inputs</legend>
          <div className="form-grid">
            <label className="form-field form-field-wide">
              <span>Engagement goal</span>
              <select
                onChange={(event) => updateGoal(event.target.value as CommercialEngagementGoal)}
                value={engagementGoal}
              >
                {tiers.map((tier) => (
                  <option key={tier.goal} value={tier.goal}>
                    {tier.label}
                  </option>
                ))}
              </select>
              <small>Assessment loads the approved starting point. Custom-scope pilots start blank for human planning.</small>
            </label>

            <label className="form-field">
              <span>Annual workflow volume</span>
              <input
                inputMode="numeric"
                max={10_000_000}
                min={1}
                onChange={(event) => setAnnualWorkflowVolume(Number(event.target.value))}
                step={1}
                type="number"
                value={annualWorkflowVolume}
              />
            </label>

            <label className="form-field">
              <span>Baseline minutes per workflow</span>
              <input
                inputMode="numeric"
                max={480}
                min={1}
                onChange={(event) => setBaselineMinutesPerWorkflow(Number(event.target.value))}
                type="number"
                value={baselineMinutesPerWorkflow}
              />
            </label>

            <label className="form-field">
              <span>Loaded hourly cost (USD)</span>
              <input
                inputMode="decimal"
                max={2_000}
                min={1}
                onChange={(event) => setLoadedHourlyCostUsd(Number(event.target.value))}
                type="number"
                value={loadedHourlyCostUsd}
              />
            </label>

            <label className="form-field">
              <span>Planned SCRIMED spend (USD)</span>
              <input
                inputMode="numeric"
                max={100_000_000}
                min={0}
                onChange={(event) => setPlannedSpendUsd(Number(event.target.value))}
                type="number"
                value={plannedSpendUsd}
              />
            </label>

            <label className="form-field">
              <span>Eligible workflow capture: {eligibleCaptureRate}%</span>
              <input
                max={100}
                min={0}
                onChange={(event) => setEligibleCaptureRate(Number(event.target.value))}
                type="range"
                value={eligibleCaptureRate}
              />
            </label>

            <label className="form-field">
              <span>Expected efficiency: {expectedEfficiencyRate}%</span>
              <input
                max={100}
                min={0}
                onChange={(event) => setExpectedEfficiencyRate(Number(event.target.value))}
                type="range"
                value={expectedEfficiencyRate}
              />
            </label>

            <label className="form-field form-field-wide">
              <span>Verified task acceptance: {verifiedTaskRate}%</span>
              <input
                max={100}
                min={0}
                onChange={(event) => setVerifiedTaskRate(Number(event.target.value))}
                type="range"
                value={verifiedTaskRate}
              />
              <small>Only tasks that pass agreed acceptance criteria count toward the value hypothesis.</small>
            </label>
          </div>
        </fieldset>

        <section aria-label="Planning result" aria-live="polite" className="pricing-output-panel">
          {calculation.result ? (
            <>
              <div className="pricing-result-status">
                <span>Model status</span>
                <strong>{calculation.result.status.replaceAll("-", " ")}</strong>
              </div>
              <div className="pricing-output-grid">
                <article>
                  <span>Annual manual baseline</span>
                  <strong>{currencyFormatter.format(calculation.result.annualManualCostBaselineUsd)}</strong>
                </article>
                <article>
                  <span>Verified capacity value</span>
                  <strong>{currencyFormatter.format(calculation.result.estimatedVerifiedCapacityValueUsd)}</strong>
                </article>
                <article>
                  <span>Value-to-cost hypothesis</span>
                  <strong>{calculation.result.valueToCostRatio.toFixed(2)}x</strong>
                </article>
                <article>
                  <span>Planning break-even</span>
                  <strong>
                    {calculation.result.estimatedBreakEvenMonths === null
                      ? "Not supported"
                      : `${calculation.result.estimatedBreakEvenMonths} months`}
                  </strong>
                </article>
                <article>
                  <span>Verified workflows</span>
                  <strong>{calculation.result.estimatedVerifiedWorkflowCount.toLocaleString("en-US")}</strong>
                </article>
                <article>
                  <span>Cost per verified workflow</span>
                  <strong>{currencyFormatter.format(calculation.result.costPerVerifiedWorkflowUsd)}</strong>
                </article>
              </div>
              <div className="pricing-planner-notice">
                <strong>Assumption check</strong>
                <p>
                  {percentage(eligibleCaptureRate / 100)} eligible, {percentage(expectedEfficiencyRate / 100)}
                  {" "}efficiency, and {percentage(verifiedTaskRate / 100)} verified acceptance. Validate every input
                  during a governed pilot before using it in a proposal or investment narrative.
                </p>
              </div>
            </>
          ) : (
            <div className="intake-alert" role="alert">
              {calculation.error}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
