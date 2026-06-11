"use client";

import { type FormEvent, useState } from "react";
import type {
  ActionRisk,
  DataClassification,
  ModelRouteProfile,
  TrustOSDecisionRecord,
  TrustOSRequest,
  getTrustOSSummary
} from "../lib/trustOS";
import type { ExecutionMode } from "../lib/agentOS";

type TrustOSSummary = ReturnType<typeof getTrustOSSummary>;
type FormStatus = "idle" | "submitting" | "success" | "error";
type TrustOSResponse = {
  status?: string;
  decision?: TrustOSDecisionRecord;
  errors?: string[];
  message?: string;
};

const availableTools = [
  "evidence-retrieval",
  "document-parser",
  "workflow-planner",
  "connector-read",
  "connector-write",
  "patient-outreach",
  "payer-submission",
  "order-entry",
  "record-finalization"
];

export default function TrustOSEvaluationWorkspace({ summary }: { summary: TrustOSSummary }) {
  const firstScenario = summary.scenarios[0]!;
  const [form, setForm] = useState<TrustOSRequest>(() => createInitialRequest(firstScenario));
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<TrustOSDecisionRecord | null>(null);

  function updateField<Field extends keyof TrustOSRequest>(field: Field, value: TrustOSRequest[Field]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function selectScenario(slug: string) {
    const scenario = summary.scenarios.find((candidate) => candidate.slug === slug) ?? firstScenario;
    setForm(createInitialRequest(scenario));
    setStatus("idle");
    setMessage("");
    setResult(null);
  }

  function toggleTool(tool: string) {
    setForm((current) => ({
      ...current,
      requestedTools: current.requestedTools.includes(tool)
        ? current.requestedTools.filter((candidate) => candidate !== tool)
        : [...current.requestedTools, tool]
    }));
  }

  function toggleEvidence(sourceId: string) {
    setForm((current) => ({
      ...current,
      evidenceSourceIds: current.evidenceSourceIds.includes(sourceId)
        ? current.evidenceSourceIds.filter((candidate) => candidate !== sourceId)
        : [...current.evidenceSourceIds, sourceId]
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");
    setResult(null);

    try {
      const response = await fetch(summary.evaluationApiRoute, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const body = (await response.json()) as TrustOSResponse;

      if (body.decision) {
        setResult(body.decision);
        setStatus("success");
        return;
      }

      setMessage(body.errors?.join(" ") ?? body.message ?? "TrustOS could not evaluate this request.");
      setStatus("error");
    } catch {
      setMessage("TrustOS could not reach the governance evaluation endpoint.");
      setStatus("error");
    }
  }

  return (
    <div className="evaluation-workspace">
      <form className="evaluation-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <p className="eyebrow">TrustOS decision request</p>
          <h2>Evaluate the action before an agent can proceed.</h2>
          <div className="form-grid">
            <label className="form-field">
              <span>Scenario</span>
              <select onChange={(event) => selectScenario(event.target.value)} defaultValue={firstScenario.slug}>
                {summary.scenarios.map((scenario) => (
                  <option key={scenario.slug} value={scenario.slug}>{scenario.name}</option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Mode</span>
              <select onChange={(event) => updateField("mode", event.target.value as ExecutionMode)} value={form.mode}>
                <option value="synthetic-pilot">Synthetic pilot</option>
                <option value="enterprise-assessment">Enterprise assessment</option>
                <option value="production-request">Production boundary test</option>
              </select>
            </label>
            <label className="form-field">
              <span>Data classification</span>
              <select
                onChange={(event) => updateField("dataClassification", event.target.value as DataClassification)}
                value={form.dataClassification}
              >
                <option value="synthetic">Synthetic</option>
                <option value="business-confidential">Business confidential</option>
                <option value="unknown">Unknown</option>
                <option value="live-healthcare-data">Live healthcare data boundary test</option>
              </select>
            </label>
            <label className="form-field">
              <span>Action risk</span>
              <select onChange={(event) => updateField("actionRisk", event.target.value as ActionRisk)} value={form.actionRisk}>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
                <option value="prohibited">Prohibited boundary test</option>
              </select>
            </label>
            <label className="form-field">
              <span>Model route profile</span>
              <select
                onChange={(event) => updateField("requestedModelProfile", event.target.value as ModelRouteProfile)}
                value={form.requestedModelProfile}
              >
                {summary.modelRouteProfiles.map((profile) => (
                  <option key={profile.profile} value={profile.profile}>{profile.profile}</option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Human review role</span>
              <input onChange={(event) => updateField("humanReviewRole", event.target.value)} value={form.humanReviewRole} />
            </label>
            <label className="form-field form-field-wide">
              <span>Workflow</span>
              <input onChange={(event) => updateField("workflow", event.target.value)} value={form.workflow} />
            </label>
            <label className="form-field form-field-wide">
              <span>Objective</span>
              <textarea maxLength={1200} onChange={(event) => updateField("objective", event.target.value)} value={form.objective} />
            </label>
            <label className="form-field form-field-wide">
              <span>Requested action</span>
              <textarea
                maxLength={1200}
                onChange={(event) => updateField("requestedAction", event.target.value)}
                value={form.requestedAction}
              />
            </label>
          </div>
        </div>

        <div className="form-section">
          <p className="eyebrow">Agent Firewall tools</p>
          <div className="checkbox-grid">
            {availableTools.map((tool) => (
              <label key={tool}>
                <input checked={form.requestedTools.includes(tool)} onChange={() => toggleTool(tool)} type="checkbox" />
                <span>{tool}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <p className="eyebrow">Evidence sources</p>
          <div className="checkbox-grid">
            {summary.evidenceSources.map((source) => (
              <label key={source.id}>
                <input checked={form.evidenceSourceIds.includes(source.id)} onChange={() => toggleEvidence(source.id)} type="checkbox" />
                <span>{source.title}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="intake-acknowledgement">
          <label>
            <input
              checked={form.dataBoundaryAcknowledged}
              onChange={(event) => updateField("dataBoundaryAcknowledged", event.target.checked)}
              type="checkbox"
            />
            <span>
              I acknowledge this evaluation accepts synthetic workflow context only and cannot authorize live
              clinical, patient-facing, payer-facing, or production connector action.
            </span>
          </label>
        </div>

        {message ? <div className="intake-alert">{message}</div> : null}

        <div className="form-actions">
          <button className="primary-action" disabled={status === "submitting"} type="submit">
            {status === "submitting" ? "Evaluating Request" : "Run TrustOS Decision"}
          </button>
          <a className="secondary-action" href={summary.evaluationApiRoute}>Inspect API</a>
        </div>
      </form>

      {result ? <TrustOSResult result={result} /> : null}
    </div>
  );
}

function TrustOSResult({ result }: { result: TrustOSDecisionRecord }) {
  return (
    <section className="evaluation-result" aria-live="polite">
      <div className="section-heading">
        <p className="eyebrow">{result.decision}</p>
        <h2>{result.summary}</h2>
        <p className="section-copy">{result.boundary}</p>
      </div>

      <div className="result-grid">
        <div><strong>Decision ID</strong><p>{result.decisionId}</p></div>
        <div><strong>Clinical Trace</strong><p>{result.clinicalTrace.traceId}</p></div>
        <div><strong>Confidence</strong><p>{result.confidence}%</p></div>
        <div><strong>Uncertainty</strong><p>{result.uncertainty}%</p></div>
      </div>

      <div className="evaluation-output-grid">
        <article>
          <span>Model Router</span>
          <h3>{result.modelRoute.selectedRoute}</h3>
          <p>{result.modelRoute.rationale}</p>
          <ul className="compact-list">
            <li>Fallback: {result.modelRoute.fallbackRoute}</li>
            <li>{result.modelRoute.productionGate}</li>
          </ul>
        </article>
        <article>
          <span>Clinical Trace</span>
          <h3>Metadata-only institutional memory</h3>
          <p>{result.clinicalTrace.captureBoundary}</p>
          <ul className="compact-list">
            {result.clinicalTrace.approvalCheckpoints.map((checkpoint) => <li key={checkpoint}>{checkpoint}</li>)}
          </ul>
        </article>
        <article>
          <span>Escalations</span>
          <h3>{result.escalationReasons.length} review signals</h3>
          <ul className="compact-list">
            {(result.escalationReasons.length ? result.escalationReasons : ["No additional escalation signal."]).map((reason) => <li key={reason}>{reason}</li>)}
          </ul>
        </article>
        <article>
          <span>Denials</span>
          <h3>{result.deniedReasons.length} blocking signals</h3>
          <ul className="compact-list">
            {(result.deniedReasons.length ? result.deniedReasons : ["No blocking signal."]).map((reason) => <li key={reason}>{reason}</li>)}
          </ul>
        </article>
      </div>

      <div className="table-section trust-control-results" aria-label="TrustOS control results">
        {result.controls.map((item) => (
          <article className="module-row" key={item.control}>
            <div><span>{item.status}</span><h2>{item.component}</h2></div>
            <p>{item.reason}</p>
            <strong>{item.requiredAction}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function createInitialRequest(scenario: TrustOSSummary["scenarios"][number]): TrustOSRequest {
  return {
    mode: scenario.slug === "production-boundary-test" ? "production-request" : "synthetic-pilot",
    workflow: scenario.workflow,
    objective: scenario.objective,
    requestedAction: scenario.requestedAction,
    dataClassification: scenario.slug === "production-boundary-test" ? "live-healthcare-data" : "synthetic",
    actionRisk: scenario.actionRisk,
    requestedTools: scenario.requestedTools,
    requestedModelProfile: scenario.requestedModelProfile,
    evidenceSourceIds: scenario.evidenceSourceIds,
    humanReviewRole: scenario.humanReviewRole,
    dataBoundaryAcknowledged: false,
    context: ""
  };
}
