"use client";

import Link from "next/link";

import { type ChangeEvent, type FormEvent, useState } from "react";
import type {
  AgentEvaluationRecord,
  AgentEvaluationRequest,
  AgentEvaluationWorkspaceSummary,
  EvaluationScenario
} from "../lib/agentEvaluationWorkspace";
import type { ExecutionMode } from "../lib/agentOS";

type EvaluationResponse = {
  status: string;
  evaluation: AgentEvaluationRecord;
};

type EvaluationFormState = AgentEvaluationRequest & {
  syntheticPacketFileName: string;
};

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function AgentEvaluationWorkspace({
  summary
}: {
  summary: AgentEvaluationWorkspaceSummary;
}) {
  const [form, setForm] = useState<EvaluationFormState>(() => createInitialFormState(summary.scenarios[0]!));
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<EvaluationResponse | null>(null);

  const selectedScenario =
    summary.scenarios.find((scenario) => scenario.slug === form.scenarioSlug) ?? summary.scenarios[0]!;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");
    setResult(null);

    try {
      const response = await fetch(summary.apiRoute, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioSlug: form.scenarioSlug,
          organizationId: form.organizationId,
          requestedByRole: form.requestedByRole,
          mode: form.mode,
          taskType: form.taskType,
          workflowTarget: form.workflowTarget,
          objective: form.objective,
          documentFamily: form.documentFamily,
          syntheticDocumentSummary: form.syntheticDocumentSummary,
          dataBoundaryAcknowledged: form.dataBoundaryAcknowledged
        })
      });
      const body = await response.json();

      if (!response.ok) {
        setMessage(Array.isArray(body.errors) ? body.errors.join(" ") : "Evaluation could not be created.");
        setStatus("error");
        return;
      }

      setResult(body);
      setStatus("success");
    } catch {
      setMessage("AgentOS Evaluation Workspace could not reach the evaluation endpoint.");
      setStatus("error");
    }
  }

  function updateField<Field extends keyof EvaluationFormState>(
    field: Field,
    value: EvaluationFormState[Field]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleScenarioChange(slug: string) {
    const nextScenario = summary.scenarios.find((scenario) => scenario.slug === slug) ?? summary.scenarios[0]!;

    setForm((current) => ({
      ...createInitialFormState(nextScenario),
      organizationId: current.organizationId,
      requestedByRole: current.requestedByRole,
      mode: current.mode,
      dataBoundaryAcknowledged: current.dataBoundaryAcknowledged
    }));
    setResult(null);
    setMessage("");
    setStatus("idle");
  }

  async function handleSyntheticPacketFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > 12000) {
      setMessage("Synthetic packet file must stay under 12 KB for the v1 evaluation workspace.");
      setStatus("error");
      return;
    }

    const text = await file.text();
    updateField("syntheticPacketFileName", file.name);
    updateField("syntheticDocumentSummary", text.slice(0, 2400));
    setMessage("");
    setStatus("idle");
  }

  return (
    <div className="evaluation-workspace">
      <form className="evaluation-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <p className="eyebrow">Synthetic evaluation</p>
          <h2>Generate an AgentOS plan from a synthetic document packet.</h2>
          <div className="form-grid">
            <label className="form-field">
              <span>Scenario</span>
              <select onChange={(event) => handleScenarioChange(event.target.value)} value={form.scenarioSlug}>
                {summary.scenarios.map((scenario) => (
                  <option key={scenario.slug} value={scenario.slug}>
                    {scenario.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Mode</span>
              <select
                onChange={(event) => updateField("mode", event.target.value as ExecutionMode)}
                value={form.mode}
              >
                <option value="synthetic-pilot">Synthetic pilot</option>
                <option value="enterprise-assessment">Enterprise assessment</option>
                <option value="production-request">Production request test</option>
              </select>
            </label>
            <label className="form-field">
              <span>Organization ID</span>
              <input
                onChange={(event) => updateField("organizationId", event.target.value)}
                value={form.organizationId}
              />
            </label>
            <label className="form-field">
              <span>Requested by role</span>
              <input
                onChange={(event) => updateField("requestedByRole", event.target.value)}
                value={form.requestedByRole}
              />
            </label>
          </div>
        </div>

        <div className="form-section">
          <p className="eyebrow">Workflow scope</p>
          <div className="form-grid">
            <label className="form-field">
              <span>Task template</span>
              <select onChange={(event) => updateField("taskType", event.target.value)} value={form.taskType}>
                {summary.taskTemplates.map((template) => (
                  <option key={template.slug} value={template.slug}>
                    {template.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Document family</span>
              <select
                onChange={(event) => updateField("documentFamily", event.target.value as EvaluationFormState["documentFamily"])}
                value={form.documentFamily}
              >
                {summary.documentFamilies.map((family) => (
                  <option key={family} value={family}>
                    {family}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field form-field-wide">
              <span>Workflow target</span>
              <input
                onChange={(event) => updateField("workflowTarget", event.target.value)}
                value={form.workflowTarget}
              />
            </label>
            <label className="form-field form-field-wide">
              <span>Evaluation objective</span>
              <textarea
                maxLength={1200}
                onChange={(event) => updateField("objective", event.target.value)}
                value={form.objective}
              />
              <small>Keep this at workflow level. Do not include patient identifiers or copied chart text.</small>
            </label>
          </div>
        </div>

        <div className="form-section">
          <p className="eyebrow">Synthetic packet</p>
          <label className="form-field form-field-wide">
            <span>Upload synthetic text packet</span>
            <input accept=".txt,.md,.json,.csv" onChange={handleSyntheticPacketFile} type="file" />
            <small>
              Synthetic text, JSON, markdown, or CSV only. Selected: {form.syntheticPacketFileName || "default scenario packet"}.
            </small>
          </label>
          <label className="form-field form-field-wide">
            <span>Synthetic document summary</span>
            <textarea
              maxLength={2400}
              onChange={(event) => updateField("syntheticDocumentSummary", event.target.value)}
              value={form.syntheticDocumentSummary}
            />
            <small>No PHI, patient identifiers, payer member IDs, diagnosis details, or live records.</small>
          </label>
        </div>

        <div className="intake-acknowledgement">
          <label>
            <input
              checked={form.dataBoundaryAcknowledged}
              onChange={(event) => updateField("dataBoundaryAcknowledged", event.target.checked)}
              type="checkbox"
            />
            <span>
              I acknowledge this workspace accepts synthetic document packets only and does not execute live
              clinical, payer, patient-facing, or production medical-record workflows.
            </span>
          </label>
        </div>

        {message ? <div className="intake-alert">{message}</div> : null}

        <div className="form-actions">
          <button className="primary-action" disabled={status === "submitting"} type="submit">
            {status === "submitting" ? "Generating Evaluation" : "Generate AgentOS Evaluation"}
          </button>
          <a className="secondary-action" href="/api/agent-os/evaluation">
            Inspect API
          </a>
          <Link className="secondary-action" href="/trust">
            View Trust Cards
          </Link>
        </div>
      </form>

      <aside className="evaluation-preview">
        <span>{selectedScenario.buyer}</span>
        <h2>{selectedScenario.name}</h2>
        <p>{selectedScenario.expectedBuyerValue}</p>
        <ul className="compact-list">
          {selectedScenario.outcomeSignals.map((signal) => (
            <li key={signal}>{signal}</li>
          ))}
        </ul>
      </aside>

      {result ? <EvaluationResult result={result.evaluation} /> : null}
    </div>
  );
}

function EvaluationResult({ result }: { result: AgentEvaluationRecord }) {
  return (
    <section className="evaluation-result" aria-live="polite">
      <div className="section-heading">
        <p className="eyebrow">{result.status}</p>
        <h2>Evaluation packet generated.</h2>
        <p className="section-copy">{result.boundary}</p>
      </div>

      <div className="result-grid">
        <div>
          <strong>Evaluation ID</strong>
          <p>{result.evaluationId}</p>
        </div>
        <div>
          <strong>Task ID</strong>
          <p>{result.taskPlan.taskId}</p>
        </div>
        <div>
          <strong>Trust Card</strong>
          <p>{result.trustCard.workflow}</p>
        </div>
        <div>
          <strong>Confidence</strong>
          <p>{Math.round(result.trustCard.confidence * 100)}%</p>
        </div>
        <div>
          <strong>TrustOS decision</strong>
          <p>{result.trustOSDecision.decision}</p>
        </div>
      </div>

      <div className="evaluation-output-grid">
        <article>
          <span>AgentOS plan</span>
          <h3>{result.taskPlan.template.name}</h3>
          <p>{result.taskPlan.template.plannerSteps.join(", ")}</p>
          <ul className="compact-list">
            <li>Router: {result.taskPlan.routerAgent}</li>
            <li>Specialists: {result.taskPlan.specialistAgents.join(", ")}</li>
            <li>Approvals: {result.humanApprovals.join(", ")}</li>
          </ul>
        </article>

        <article>
          <span>Structural intelligence</span>
          <h3>{result.documentIntelligence.family}</h3>
          <p>{result.documentIntelligence.extractionPolicy}</p>
          <ul className="compact-list">
            {result.documentIntelligence.layoutUnderstanding.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article>
          <span>Trust Card</span>
          <h3>{result.trustCard.recommendation}</h3>
          <p>{result.trustCard.sourceAttribution}</p>
          <ul className="compact-list">
            <li>{result.trustCard.guidelineVersion}</li>
            <li>{result.trustCard.humanReview}</li>
            <li>Validated: {result.trustCard.lastUpdated}</li>
          </ul>
        </article>

        <article>
          <span>Observability</span>
          <h3>{result.observabilityRecord.outcomeSignals.join(", ")}</h3>
          <p>{result.observabilityRecord.measurementBoundary}</p>
          <ul className="compact-list">
            {result.observabilityRecord.metrics.map((metric) => (
              <li key={metric}>{metric}</li>
            ))}
          </ul>
        </article>
        <article>
          <span>TrustOS governance</span>
          <h3>{result.trustOSDecision.summary}</h3>
          <p>{result.trustOSDecision.clinicalTrace.captureBoundary}</p>
          <ul className="compact-list">
            <li>Clinical Trace: {result.trustOSDecision.clinicalTrace.traceId}</li>
            <li>Confidence: {result.trustOSDecision.confidence}%</li>
            <li>Uncertainty: {result.trustOSDecision.uncertainty}%</li>
          </ul>
        </article>
      </div>

      <div className="evaluation-output-grid evaluation-output-grid-compact">
        <article>
          <span>Evidence sources</span>
          <h3>{result.evidenceSources.length} attached</h3>
          <ul className="compact-list">
            {result.evidenceSources.map((source) => (
              <li key={source.id}>{source.title}: {source.version}</li>
            ))}
          </ul>
        </article>
        <article>
          <span>Audit preview</span>
          <h3>Metadata-first trace</h3>
          <ul className="compact-list">
            {result.auditPreview.map((event) => (
              <li key={event}>{event}</li>
            ))}
          </ul>
        </article>
        <article>
          <span>Blocked capabilities</span>
          <h3>No autonomous execution</h3>
          <ul className="compact-list">
            {result.deniedCapabilities.map((capability) => (
              <li key={capability}>{capability}</li>
            ))}
          </ul>
        </article>
        <article>
          <span>Next actions</span>
          <h3>Enterprise follow-up</h3>
          <ul className="compact-list">
            {result.nextActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

function createInitialFormState(scenario: EvaluationScenario): EvaluationFormState {
  return {
    scenarioSlug: scenario.slug,
    organizationId: "SCRIMED-DEMO-ORG",
    requestedByRole: "Enterprise sponsor",
    mode: "synthetic-pilot",
    taskType: scenario.taskType,
    workflowTarget: scenario.workflowTarget,
    objective: scenario.objective,
    documentFamily: scenario.documentFamily,
    syntheticDocumentSummary: scenario.syntheticDocumentSummary,
    syntheticPacketFileName: "",
    dataBoundaryAcknowledged: false
  };
}
