"use client";

import Link from "next/link";

import { FormEvent, useState } from "react";
import type { PilotIntakeOption, PilotIntakeSubmission, PilotIntakeSummary } from "../lib/pilotIntake";

type IntakeResult = {
  status: string;
  intakeId: string;
  receivedAt: string;
  boundary: string;
  assessment: {
    qualification: string;
    recommendedOffer: string;
    recommendedNextStep: string;
    governanceWorkflowPack: {
      slug: string;
      name: string;
      status: string;
      reason: string;
      matchedSignals: string[];
    };
    governanceGates: string[];
    riskFlags: string[];
    crmTags: string[];
  };
  handoff: {
    mode: string;
    status: string;
    destination: string;
    detail: string;
  };
  nextActions: string[];
};

type FieldError = {
  field: string;
  message: string;
};

type FormStatus = "idle" | "submitting" | "success" | "error";

type PilotIntakePrefill = {
  offer?: string;
  workflow?: string;
};

export default function PilotIntakeForm({
  prefill,
  summary
}: {
  prefill: PilotIntakePrefill;
  summary: PilotIntakeSummary;
}) {
  const [form, setForm] = useState<PilotIntakeSubmission>(() => createInitialFormState(summary, prefill));
  const [status, setStatus] = useState<FormStatus>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<IntakeResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setFieldErrors([]);
    setMessage("");
    setResult(null);

    try {
      const response = await fetch("/api/pilot/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const body = await response.json();

      if (!response.ok) {
        setFieldErrors(body.error?.fields ?? []);
        setMessage(body.error?.message ?? "Pilot intake could not be submitted.");
        setStatus("error");
        return;
      }

      setResult(body);
      setStatus("success");
    } catch {
      setMessage("Pilot intake could not reach the SCRIMED intake endpoint.");
      setStatus("error");
    }
  }

  function updateField<Field extends keyof PilotIntakeSubmission>(
    field: Field,
    value: PilotIntakeSubmission[Field]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleListValue(field: "workflowTargets" | "readinessNeeds" | "governanceRequirements", value: string) {
    setForm((current) => {
      const selected = current[field];
      const next = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value];

      return { ...current, [field]: next };
    });
  }

  return (
    <div className="intake-workspace">
      <form className="intake-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <p className="eyebrow">Buyer profile</p>
          <h2>Capture the enterprise sponsor and organization context.</h2>
          <div className="form-grid">
            <TextField
              error={getFieldError(fieldErrors, "fullName")}
              label="Full name"
              onChange={(value) => updateField("fullName", value)}
              required
              value={form.fullName}
            />
            <TextField
              error={getFieldError(fieldErrors, "workEmail")}
              label="Work email"
              onChange={(value) => updateField("workEmail", value)}
              required
              type="email"
              value={form.workEmail}
            />
            <TextField
              error={getFieldError(fieldErrors, "organization")}
              label="Organization"
              onChange={(value) => updateField("organization", value)}
              required
              value={form.organization}
            />
            <TextField
              error={getFieldError(fieldErrors, "role")}
              label="Role / title"
              onChange={(value) => updateField("role", value)}
              required
              value={form.role}
            />
            <TextField
              error={getFieldError(fieldErrors, "phone")}
              label="Phone"
              onChange={(value) => updateField("phone", value)}
              value={form.phone}
            />
            <TextField
              error={getFieldError(fieldErrors, "website")}
              label="Organization website"
              onChange={(value) => updateField("website", value)}
              value={form.website}
            />
          </div>
        </div>

        <div className="form-section">
          <p className="eyebrow">Enterprise scope</p>
          <h2>Package the buyer need into a sellable SCRIMED offer.</h2>
          <div className="form-grid">
            <SelectField
              error={getFieldError(fieldErrors, "buyerSegment")}
              label="Buyer segment"
              onChange={(value) => updateField("buyerSegment", value)}
              options={summary.buyerSegments}
              value={form.buyerSegment}
            />
            <SelectField
              error={getFieldError(fieldErrors, "organizationSize")}
              label="Organization size"
              onChange={(value) => updateField("organizationSize", value)}
              options={summary.organizationSizes}
              value={form.organizationSize}
            />
            <SelectField
              error={getFieldError(fieldErrors, "region")}
              label="Region"
              onChange={(value) => updateField("region", value)}
              options={summary.regions}
              value={form.region}
            />
            <SelectField
              error={getFieldError(fieldErrors, "timeline")}
              label="Timeline"
              onChange={(value) => updateField("timeline", value)}
              options={summary.timelineOptions}
              value={form.timeline}
            />
          </div>
          <SelectField
            error={getFieldError(fieldErrors, "offerInterest")}
            label="Primary offer"
            onChange={(value) => updateField("offerInterest", value)}
            options={summary.serviceOffers}
            value={form.offerInterest}
          />
        </div>

        <ChecklistGroup
          error={getFieldError(fieldErrors, "workflowTargets")}
          legend="Workflow targets"
          maxDetail="Select up to 4 workflows for this intake."
          onToggle={(value) => toggleListValue("workflowTargets", value)}
          options={summary.workflowTargets}
          selected={form.workflowTargets}
        />

        <ChecklistGroup
          error={getFieldError(fieldErrors, "readinessNeeds")}
          legend="Readiness needs"
          maxDetail="Select up to 5 readiness needs."
          onToggle={(value) => toggleListValue("readinessNeeds", value)}
          options={summary.readinessNeeds}
          selected={form.readinessNeeds}
        />

        <ChecklistGroup
          error={getFieldError(fieldErrors, "governanceRequirements")}
          legend="Governance requirements"
          maxDetail="Select the controls expected for pilot evaluation."
          onToggle={(value) => toggleListValue("governanceRequirements", value)}
          options={summary.governanceRequirements}
          selected={form.governanceRequirements}
        />

        <div className="form-section">
          <p className="eyebrow">Operating context</p>
          <h2>Describe the workflow-level need without patient-level details.</h2>
          <label className="form-field form-field-wide">
            <span>Current systems or interoperability context</span>
            <textarea
              maxLength={1000}
              onChange={(event) => updateField("interoperabilityContext", event.target.value)}
              placeholder="Example: Epic EHR, FHIR integration planning, claims queue, referral inbox, scheduling system, analytics warehouse."
              value={form.interoperabilityContext}
            />
            <small>Do not include PHI, patient identifiers, copied chart text, member IDs, or clinical records.</small>
            <FieldErrorMessage message={getFieldError(fieldErrors, "interoperabilityContext")} />
          </label>
          <label className="form-field form-field-wide">
            <span>Pilot goals</span>
            <textarea
              maxLength={1200}
              onChange={(event) => updateField("pilotGoals", event.target.value)}
              placeholder="Example: reduce referral backlog, identify prior-auth friction, improve documentation review quality, or map governance readiness."
              required
              value={form.pilotGoals}
            />
            <small>Frame goals as operational outcomes for a synthetic pilot or assessment.</small>
            <FieldErrorMessage message={getFieldError(fieldErrors, "pilotGoals")} />
          </label>
        </div>

        <div className="intake-acknowledgement">
          <label>
            <input
              checked={form.boundaryAcknowledged}
              onChange={(event) => updateField("boundaryAcknowledged", event.target.checked)}
              type="checkbox"
            />
            <span>
              I acknowledge this intake excludes PHI, patient identifiers, live clinical records, diagnosis
              details, payer member identifiers, and production clinical data.
            </span>
          </label>
          <FieldErrorMessage message={getFieldError(fieldErrors, "boundaryAcknowledged")} />
          <label>
            <input
              checked={form.contactConsent}
              onChange={(event) => updateField("contactConsent", event.target.checked)}
              type="checkbox"
            />
            <span>
              I agree SCRIMED may use this business-contact and workflow-scope information to respond about an
              enterprise pilot, assessment, or governance review.
            </span>
          </label>
          <FieldErrorMessage message={getFieldError(fieldErrors, "contactConsent")} />
        </div>

        {message ? <div className="intake-alert">{message}</div> : null}

        <div className="form-actions">
          <button className="primary-action" disabled={status === "submitting"} type="submit">
            {status === "submitting" ? "Packaging Intake" : "Submit Pilot Intake"}
          </button>
          <a className="secondary-action" href="/api/product/readiness-brief">
            Download Readiness Brief
          </a>
          <Link className="secondary-action" href="/product">
            View Product Console
          </Link>
        </div>
      </form>

      {result ? (
        <aside className="intake-result" aria-live="polite">
          <span>{result.status}</span>
          <h2>Enterprise intake accepted.</h2>
          <p>{result.assessment.recommendedNextStep}</p>
          <div className="result-grid">
            <div>
              <strong>Intake ID</strong>
              <p>{result.intakeId}</p>
            </div>
            <div>
              <strong>Recommended offer</strong>
              <p>{result.assessment.recommendedOffer}</p>
            </div>
            <div>
              <strong>Qualification</strong>
              <p>{result.assessment.qualification}</p>
            </div>
            <div>
              <strong>Governance pack</strong>
              <p>{result.assessment.governanceWorkflowPack.name}</p>
            </div>
            <div>
              <strong>Intake handoff</strong>
              <p>{result.handoff.status}: {result.handoff.detail}</p>
            </div>
          </div>
          <p className="section-copy">{result.assessment.governanceWorkflowPack.reason}</p>
          <ul className="compact-list">
            {result.nextActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </aside>
      ) : null}
    </div>
  );
}

function TextField({
  error,
  label,
  onChange,
  required = false,
  type = "text",
  value
}: {
  error?: string;
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input onChange={(event) => onChange(event.target.value)} required={required} type={type} value={value} />
      <FieldErrorMessage message={error} />
    </label>
  );
}

function SelectField({
  error,
  label,
  onChange,
  options,
  value
}: {
  error?: string;
  label: string;
  onChange: (value: string) => void;
  options: PilotIntakeOption[];
  value: string;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <select onChange={(event) => onChange(event.target.value)} value={value}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldErrorMessage message={error} />
    </label>
  );
}

function ChecklistGroup({
  error,
  legend,
  maxDetail,
  onToggle,
  options,
  selected
}: {
  error?: string;
  legend: string;
  maxDetail: string;
  onToggle: (value: string) => void;
  options: PilotIntakeOption[];
  selected: string[];
}) {
  return (
    <fieldset className="checklist-group">
      <legend>{legend}</legend>
      <p>{maxDetail}</p>
      <div className="checkbox-grid">
        {options.map((option) => (
          <label className="checkbox-card" key={option.value}>
            <input
              checked={selected.includes(option.value)}
              onChange={() => onToggle(option.value)}
              type="checkbox"
            />
            <span>
              <strong>{option.label}</strong>
              <small>{option.description}</small>
            </span>
          </label>
        ))}
      </div>
      <FieldErrorMessage message={error} />
    </fieldset>
  );
}

function FieldErrorMessage({ message }: { message?: string }) {
  return message ? <small className="field-error">{message}</small> : null;
}

function getFieldError(errors: FieldError[], field: string) {
  return errors.find((error) => error.field === field)?.message;
}

function isOptionValue(options: PilotIntakeOption[], value: string | null): value is string {
  return Boolean(value && options.some((option) => option.value === value));
}

function createInitialFormState(summary: PilotIntakeSummary, prefill: PilotIntakePrefill): PilotIntakeSubmission {
  const requestedOffer = prefill.offer ?? null;
  const requestedWorkflow = prefill.workflow ?? null;
  const offerInterest = isOptionValue(summary.serviceOffers, requestedOffer)
    ? requestedOffer
    : summary.serviceOffers[0]?.value ?? "";
  const workflowTargets = isOptionValue(summary.workflowTargets, requestedWorkflow)
    ? Array.from(new Set(["referral-intake", requestedWorkflow]))
    : ["referral-intake"];

  return {
    fullName: "",
    workEmail: "",
    organization: "",
    role: "",
    phone: "",
    website: "",
    buyerSegment: summary.buyerSegments[0]?.value ?? "",
    organizationSize: summary.organizationSizes[1]?.value ?? "",
    region: summary.regions[0]?.value ?? "",
    offerInterest,
    workflowTargets,
    readinessNeeds: ["workflow-map", "synthetic-demo"],
    governanceRequirements: ["human-review", "synthetic-only", "no-autonomous-diagnosis"],
    timeline: "30-90-days",
    interoperabilityContext: "",
    pilotGoals: "",
    boundaryAcknowledged: false,
    contactConsent: false,
    source: "/pilot"
  };
}
