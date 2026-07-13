import { createAuditHash, nowIso } from "./audit";
import { verifyScrimedWorkResult } from "./verificationEngine";
import type { ArtifactType, WorkArtifact, WorkSession, WorkAgentRole } from "./types";

function titleForType(type: ArtifactType) {
  return type
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function buildScrimedWorkArtifact(input: {
  session: WorkSession;
  type: ArtifactType;
  title?: string;
  createdBy?: WorkAgentRole;
}): WorkArtifact {
  const title = input.title ?? `${titleForType(input.type)} Draft`;
  const sourceCitations = input.session.evidence.map((record) => record.citation);
  const content = [
    `# ${title}`,
    "",
    `Session: ${input.session.id}`,
    `Objective: ${input.session.objective}`,
    "",
    "## Evidence",
    ...input.session.evidence.map((record) => `- ${record.title}: ${record.citation}`),
    "",
    "## Boundaries",
    "Research/demo/support use only. Not for diagnosis, treatment, prescribing, live patient care, payer submission, EHR writeback, or customer go-live.",
    "",
    "## Human Review",
    input.session.riskLevel === "high"
      ? "Human review is required before use."
      : "Human review is recommended before external use."
  ].join("\n");
  const verification = verifyScrimedWorkResult({ session: input.session, outputText: content });
  const artifactId = `artifact_${createAuditHash({ sessionId: input.session.id, type: input.type, title }).slice(0, 16)}`;

  return {
    artifactId,
    sessionId: input.session.id,
    type: input.type,
    title,
    content,
    markdown: content,
    json: {
      title,
      sessionId: input.session.id,
      type: input.type,
      sourceCitations,
      boundary: "synthetic-only-human-review-required"
    },
    sourceCitations,
    verification,
    reviewStatus: input.session.riskLevel === "high" ? "human_review_required" : "draft",
    createdBy: input.createdBy ?? "artifact-writer",
    createdAt: nowIso(),
    exportMetadata: {
      exportable: verification.allPass && input.session.riskLevel !== "high",
      exportRequiresHumanReview: true,
      noPhiConfirmed: true
    }
  };
}

export const scrimedWorkArtifactTemplates: Array<{
  type: ArtifactType;
  title: string;
  requiredSections: string[];
  retainedBoundary: string;
}> = [
  { type: "research-brief", title: "Research Brief", requiredSections: ["question", "evidence", "limitations", "human review"], retainedBoundary: "No therapeutic or clinical claim." },
  { type: "patient-education", title: "Patient Education Draft", requiredSections: ["plain language", "reviewer note", "escalation"], retainedBoundary: "Requires clinician review before patient use." },
  { type: "care-coordination-brief", title: "Care Coordination Brief", requiredSections: ["context", "open issues", "handoff"], retainedBoundary: "Decision support only." },
  { type: "prior-authorization-draft", title: "Prior Authorization Draft", requiredSections: ["policy criteria", "missing documentation", "review gate"], retainedBoundary: "Draft only, no payer submission." },
  { type: "appeal-letter-draft", title: "Appeal Letter Draft", requiredSections: ["denial reason", "evidence", "review gate"], retainedBoundary: "Draft only, no filing." },
  { type: "executive-report", title: "Executive Report", requiredSections: ["status", "risks", "next approvals"], retainedBoundary: "No audited financial or legal claim." },
  { type: "payer-report", title: "Payer Report", requiredSections: ["scope", "criteria", "evidence"], retainedBoundary: "No coverage determination." },
  { type: "quality-report", title: "Quality Report", requiredSections: ["measure", "source", "gap"], retainedBoundary: "Synthetic quality preview only." },
  { type: "board-brief", title: "Board Brief", requiredSections: ["evidence", "risk", "ask"], retainedBoundary: "Not securities material." },
  { type: "fhir-bundle-preview", title: "FHIR Bundle Preview", requiredSections: ["resource map", "validation", "no writeback"], retainedBoundary: "Preview only, never writes to EHR." },
  { type: "workflow-runbook", title: "Workflow Runbook", requiredSections: ["steps", "owners", "rollback"], retainedBoundary: "Runbook only, not production approval." }
];
