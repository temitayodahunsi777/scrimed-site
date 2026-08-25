"use client";

import { useMemo, useState } from "react";
import {
  buildCommercialScopeDecision,
  type CommercialEngagementGoal,
  type CommercialPriceRange
} from "../lib/commercialStrategy";

export type PricingScopeTier = {
  goal: CommercialEngagementGoal;
  label: string;
  priceRange: CommercialPriceRange;
};

type PricingScopeGuardProps = {
  tiers: PricingScopeTier[];
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function formatRange(range: CommercialPriceRange) {
  if (range.customScope) return "Custom scope requiring named human approval";
  return `${currencyFormatter.format(range.minimumUsd)}-${currencyFormatter.format(range.maximumUsd)} ${range.cadence}`;
}

export default function PricingScopeGuard({ tiers }: PricingScopeGuardProps) {
  const [engagementGoal, setEngagementGoal] = useState<CommercialEngagementGoal>(
    tiers[0]?.goal ?? "assessment"
  );
  const [workflowCount, setWorkflowCount] = useState(2);
  const [siteCount, setSiteCount] = useState(1);
  const [regionCount, setRegionCount] = useState(1);
  const [protectedEnvironmentRequested, setProtectedEnvironmentRequested] = useState(false);

  const decision = useMemo(() => {
    try {
      return {
        result: buildCommercialScopeDecision({
          engagementGoal,
          workflowCount,
          siteCount,
          regionCount,
          protectedEnvironmentRequested
        }),
        error: null
      };
    } catch (error) {
      return {
        result: null,
        error: error instanceof Error ? error.message : "The scope inputs are invalid."
      };
    }
  }, [engagementGoal, protectedEnvironmentRequested, regionCount, siteCount, workflowCount]);

  return (
    <div className="pricing-planner pricing-scope-guard">
      <div className="pricing-planner-heading">
        <div>
          <p className="eyebrow">Governed scope guard</p>
          <h2>Qualify the buying lane before anyone drafts a proposal.</h2>
        </div>
        <p>
          Controlled inputs only. This tool stores nothing, creates no quote, and cannot approve pricing, discounts,
          protected data, production use, or customer activation.
        </p>
      </div>

      <div className="pricing-planner-grid">
        <fieldset className="pricing-input-panel">
          <legend>Opportunity scope</legend>
          <div className="form-grid">
            <label className="form-field form-field-wide">
              <span>Engagement goal</span>
              <select
                onChange={(event) => setEngagementGoal(event.target.value as CommercialEngagementGoal)}
                value={engagementGoal}
              >
                {tiers.map((tier) => (
                  <option key={tier.goal} value={tier.goal}>
                    {tier.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Workflows</span>
              <input
                inputMode="numeric"
                max={100}
                min={1}
                onChange={(event) => setWorkflowCount(Number(event.target.value))}
                step={1}
                type="number"
                value={workflowCount}
              />
            </label>

            <label className="form-field">
              <span>Sites</span>
              <input
                inputMode="numeric"
                max={1_000}
                min={1}
                onChange={(event) => setSiteCount(Number(event.target.value))}
                step={1}
                type="number"
                value={siteCount}
              />
            </label>

            <label className="form-field">
              <span>Regions</span>
              <input
                inputMode="numeric"
                max={50}
                min={1}
                onChange={(event) => setRegionCount(Number(event.target.value))}
                step={1}
                type="number"
                value={regionCount}
              />
            </label>

            <label className="form-field scope-toggle-field">
              <input
                checked={protectedEnvironmentRequested}
                onChange={(event) => setProtectedEnvironmentRequested(event.target.checked)}
                type="checkbox"
              />
              <span>Protected environment requested</span>
            </label>
          </div>
        </fieldset>

        <section aria-label="Scope decision" aria-live="polite" className="pricing-output-panel">
          {decision.result ? (
            <>
              <div className="pricing-result-status">
                <span>Scope status</span>
                <strong>{decision.result.status.replaceAll("-", " ")}</strong>
              </div>
              <div className="pricing-scope-summary">
                <article>
                  <span>Planning lane</span>
                  <strong>{decision.result.recommendedTier}</strong>
                </article>
                <article>
                  <span>Non-binding posture</span>
                  <strong>{formatRange(decision.result.priceRange)}</strong>
                </article>
              </div>
              <p className="pricing-scope-reason">{decision.result.reason}</p>
              <div className="pricing-planner-notice">
                <strong>Required human gates</strong>
                <ul className="compact-list">
                  {decision.result.requiredGates.map((gate) => (
                    <li key={gate}>{gate}</li>
                  ))}
                </ul>
              </div>
              <div className="scope-authority-grid" aria-label="Scope authority status">
                <span>Binding quote: blocked</span>
                <span>Production authority: blocked</span>
                <span>Human review: required</span>
              </div>
            </>
          ) : (
            <div className="intake-alert" role="alert">
              {decision.error}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
