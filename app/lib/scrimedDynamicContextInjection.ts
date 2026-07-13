import {
  scrimedBuildRoadmapBoundary,
  scrimedBuildRoadmapModules,
  scrimedBuildRoadmapStatus,
  scrimedBuildRoadmapUpdatedAt
} from "./scrimedBuildRoadmap";
import { scrimedModules } from "./scrimedModuleRegistry";
import {
  evaluateScrimedSafetyGate,
  scrimedNoGoBoundaries,
  scrimedSafetyPolicyVersion,
  type ScrimedPolicyDecision
} from "./scrimedSafetyGovernance";
import { trustOpsModules } from "./scrimed/trustops-registry";

export type ScrimedContextManifestCadence =
  | "session-start"
  | "every-turn"
  | "after-state-change"
  | "pre-agent-run";

export type ScrimedContextManifestStatus =
  | "ready-for-synthetic-agent-run"
  | "blocked-by-policy"
  | "invalid";

export type ScrimedContextManifestModule = {
  id: string;
  name: string;
  source: "build-roadmap" | "scrimed-module-registry" | "trustops";
  reasonSelected: string;
  loadedCapabilities: string[];
  permissionBoundary: string;
};

export type ScrimedContextManifestSkill = {
  id: string;
  name: string;
  purpose: string;
  includedEveryTurn: boolean;
  boundary: string;
};

export type ScrimedTaskReminder = {
  id: string;
  text: string;
  status: "active" | "blocked" | "complete";
  version: number;
  updatedAt: string;
  requiredBeforeNextRun: boolean;
};

export type ScrimedOmittedContext = {
  id: string;
  category:
    | "phi"
    | "secret"
    | "production-connector"
    | "irrelevant-tool"
    | "hidden-chain-of-thought"
    | "unapproved-data-source";
  reason: string;
  safetyNote: string;
};

export type ScrimedContextValidator = {
  id: string;
  name: string;
  validationType:
    | "schema"
    | "evidence"
    | "rule"
    | "human-review"
    | "safety-policy"
    | "benchmark";
  required: boolean;
  failClosedBehavior: string;
};

export type ScrimedLazyCapabilityLoadout = {
  loadedNow: string[];
  deferredUntilNeeded: string[];
  blockedUntilApproval: string[];
};

export type ScrimedContextMemoryWritePlan = {
  destination: "metadata-only-decision-memory-ledger";
  allowedFields: string[];
  blockedFields: string[];
  retentionBoundary: string;
  chainOfThoughtPolicy: string;
};

export type ScrimedContextInjectionManifest = {
  id: string;
  schemaVersion: string;
  service: "scrimed-dynamic-context-injection-engine";
  status: ScrimedContextManifestStatus;
  cadence: ScrimedContextManifestCadence;
  generatedAt: string;
  syntheticOnly: true;
  phiDetected: boolean;
  noPhiBoundary: string;
  requestedAction: string;
  sessionStartPlanningSummary: string;
  selectedModules: ScrimedContextManifestModule[];
  relevantSkills: ScrimedContextManifestSkill[];
  activeTaskReminders: ScrimedTaskReminder[];
  omittedContext: ScrimedOmittedContext[];
  lazyCapabilityLoadout: ScrimedLazyCapabilityLoadout;
  validators: ScrimedContextValidator[];
  safetyDecision: ScrimedPolicyDecision;
  promptPayloadBoundary: string;
  memoryWritePlan: ScrimedContextMemoryWritePlan;
  audit: {
    traceId: string;
    policyVersion: string;
    decisionTraceKind: "metadata-rationale-summary-not-hidden-chain-of-thought";
    toolAccessGrants: "none-context-manifest-does-not-grant-permissions";
    reviewerGate: "human-review-required-before-protected-workflow";
    manifestHash: string;
  };
  noGoBoundaries: string[];
};

export type ScrimedContextManifestValidationCheck = {
  check: string;
  passed: boolean;
  detail: string;
};

export const scrimedDynamicContextInjectionApiRoute =
  "/api/scrimed-build-roadmap/context-manifest";
export const scrimedDynamicContextInjectionBriefRoute =
  "/api/scrimed-build-roadmap/context-manifest/brief";
export const scrimedDynamicContextInjectionStatus =
  "scrimed-dynamic-context-injection-ready-no-phi";
export const scrimedDynamicContextInjectionSchemaVersion =
  "scrimed-context-manifest-v2026-06-30";

export const scrimedDynamicContextInjectionBoundary =
  "SCRIMED Dynamic Context Injection Engine is a synthetic/no-PHI pre-agent-run manifest layer. It can select context, modules, skills, reminders, validators, omitted context, and audit metadata, but it cannot grant tool permissions, expose secrets, store hidden chain-of-thought, authorize PHI, or execute protected healthcare actions.";

const deterministicGeneratedAt = `${scrimedBuildRoadmapUpdatedAt}T00:00:00.000Z`;

const validators: ScrimedContextValidator[] = [
  {
    id: "schema-validator",
    name: "Structured Output Schema Validator",
    validationType: "schema",
    required: true,
    failClosedBehavior: "Block agent run artifact release until typed schema validation passes."
  },
  {
    id: "evidence-validator",
    name: "Evidence and Source Validator",
    validationType: "evidence",
    required: true,
    failClosedBehavior: "Escalate outputs that lack evidence, source attribution, freshness, or limitation notes."
  },
  {
    id: "rule-validator",
    name: "Deterministic Rule Validator",
    validationType: "rule",
    required: true,
    failClosedBehavior: "Block outputs that conflict with policy, workflow state, payer rules, or no-go boundaries."
  },
  {
    id: "human-review-validator",
    name: "Human Review Gate",
    validationType: "human-review",
    required: true,
    failClosedBehavior: "Keep protected workflow status unresolved until a qualified reviewer disposition exists."
  },
  {
    id: "safety-policy-validator",
    name: "SCRIMED Safety Governance Gate",
    validationType: "safety-policy",
    required: true,
    failClosedBehavior: "Fail closed on PHI, live-care authority, patient outreach, payer submission, EHR writeback, or certification claims."
  },
  {
    id: "operational-benchmark-validator",
    name: "Operational Benchmark Layer",
    validationType: "benchmark",
    required: true,
    failClosedBehavior: "Block release when schema fidelity, reasoning validity, or operational accuracy regresses."
  }
];

function hashManifest(input: unknown) {
  const serialized = JSON.stringify(input);
  let hash = 0x811c9dc5;

  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return `synthetic-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function roadmapModule(id: string, reasonSelected: string): ScrimedContextManifestModule {
  const selectedModule = scrimedBuildRoadmapModules.find((item) => item.id === id);

  return {
    id,
    name: selectedModule?.name ?? id,
    source: "build-roadmap",
    reasonSelected,
    loadedCapabilities: selectedModule?.outputs ?? [],
    permissionBoundary: selectedModule?.controls.join("; ") ?? scrimedDynamicContextInjectionBoundary
  };
}

function registryModule(slug: string, reasonSelected: string): ScrimedContextManifestModule {
  const selectedModule = scrimedModules.find((item) => item.slug === slug);

  return {
    id: slug,
    name: selectedModule?.name ?? slug,
    source: "scrimed-module-registry",
    reasonSelected,
    loadedCapabilities: selectedModule?.coreCapabilities ?? [],
    permissionBoundary: selectedModule?.blockedProductionMode ?? "No protected production action is authorized."
  };
}

function trustOpsModule(id: string, reasonSelected: string): ScrimedContextManifestModule {
  const selectedModule = trustOpsModules.find((item) => item.id === id);

  return {
    id,
    name: selectedModule?.name ?? id,
    source: "trustops",
    reasonSelected,
    loadedCapabilities: selectedModule?.capabilities ?? [],
    permissionBoundary: selectedModule?.safetyBoundaries.join("; ") ?? "Demo/synthetic only."
  };
}

export function buildScrimedDynamicContextManifest(input?: {
  requestedAction?: string;
  cadence?: ScrimedContextManifestCadence;
  taskReminderVersion?: number;
}): ScrimedContextInjectionManifest {
  const requestedAction =
    input?.requestedAction ??
    "synthetic pre-agent-run roadmap execution for dynamic context injection, operational benchmark validation, TrustOps governance, and no-PHI internal testing";
  const safetyDecision = evaluateScrimedSafetyGate({
    route: scrimedDynamicContextInjectionApiRoute,
    requestedAction,
    inputText:
      "synthetic no-phi context manifest pre-agent-run module skill listing task reminders validators benchmark human review internal testing",
    allowMetadataOnly: true
  });
  const selectedModules = safetyDecision.allowed
    ? [
        roadmapModule(
          "dynamic-context-injection-engine",
          "Primary next build step; creates the pre-agent-run context manifest."
        ),
        roadmapModule(
          "operational-benchmark-layer",
          "Required to prevent the self-correction trap through structured benchmarks."
        ),
        registryModule(
          "workflow-planner",
          "Provides workflow state, approval maps, rollback expectations, and audit requirements."
        ),
        trustOpsModule(
          "governance-compliance",
          "Supervises policy gates, sensitive-task detection, evidence completeness, and compliance escalation."
        ),
        trustOpsModule(
          "secure-middleware-gateway",
          "Keeps tool access permissioned and prevents direct LLM-to-system access."
        )
      ]
    : [];
  const relevantSkills: ScrimedContextManifestSkill[] = [
    {
      id: "nextjs-app-router",
      name: "Next.js App Router",
      purpose: "Route handlers and server-rendered internal command surfaces.",
      includedEveryTurn: true,
      boundary: "Build-safe server modules; no runtime SDK initialization at module scope."
    },
    {
      id: "scrimed-safety-governance",
      name: "SCRIMED Safety Governance Gate",
      purpose: "Classify requests, enforce no-PHI boundaries, and fail closed on blocked healthcare actions.",
      includedEveryTurn: true,
      boundary: "Policy decisions do not create PHI, clinical, connector, certification, or customer go-live authority."
    },
    {
      id: "trustops-module-registry",
      name: "TrustOps Module Registry",
      purpose: "Load only the governance, middleware, signal, and benchmark modules needed for the current task.",
      includedEveryTurn: true,
      boundary: "Synthetic governance only; remediation remains recommendation-only."
    },
    {
      id: "nonsecret-contract-smoke",
      name: "Nonsecret Contract Smoke",
      purpose: "Verify manifest source strings, docs, APIs, safety boundaries, and test-suite wiring.",
      includedEveryTurn: true,
      boundary: "No secrets, bearer tokens, Supabase sessions, PHI, or production credentials."
    }
  ];
  const activeTaskReminders: ScrimedTaskReminder[] = [
    {
      id: "reminder-no-phi",
      text: "Keep the run synthetic/no-PHI and reject live patient data, identifiers, source charts, and credentials.",
      status: "active",
      version: input?.taskReminderVersion ?? 1,
      updatedAt: deterministicGeneratedAt,
      requiredBeforeNextRun: true
    },
    {
      id: "reminder-validate-not-self-correct",
      text: "Validate with schemas, evidence, deterministic rules, benchmarks, and human review rather than model self-verification alone.",
      status: "active",
      version: input?.taskReminderVersion ?? 1,
      updatedAt: deterministicGeneratedAt,
      requiredBeforeNextRun: true
    },
    {
      id: "reminder-context-minimization",
      text: "Load only modules, tools, and context needed for this run; document omitted context and why it stayed out.",
      status: "active",
      version: input?.taskReminderVersion ?? 1,
      updatedAt: deterministicGeneratedAt,
      requiredBeforeNextRun: true
    }
  ];
  const omittedContext: ScrimedOmittedContext[] = [
    {
      id: "omit-live-phi",
      category: "phi",
      reason: "Live PHI and patient identifiers are outside the current SCRIMED authority boundary.",
      safetyNote: "No patient data, source charts, MRNs, DOBs, emails, phones, or identifiers may enter this manifest."
    },
    {
      id: "omit-secrets",
      category: "secret",
      reason: "Secrets are not needed for synthetic manifest construction.",
      safetyNote: "Bearer tokens, Supabase keys, service roles, API keys, and credentials are excluded."
    },
    {
      id: "omit-production-connectors",
      category: "production-connector",
      reason: "The manifest cannot authorize live EHR, payer, imaging, outreach, billing, or connector actions.",
      safetyNote: "Production connector access remains blocked until external approvals and customer authorization exist."
    },
    {
      id: "omit-hidden-chain-of-thought",
      category: "hidden-chain-of-thought",
      reason: "SCRIMED stores decision trace metadata and rationale summaries, not private model chain-of-thought.",
      safetyNote: "Audit memory captures inputs hashes, evidence refs, validators, policy decisions, and reviewer status."
    },
    {
      id: "omit-irrelevant-tools",
      category: "irrelevant-tool",
      reason: "Lazy capability loading excludes tools and modules unrelated to this pre-agent-run context task.",
      safetyNote: "Tool access is separately permissioned and cannot be granted by context injection."
    }
  ];
  const promptPayloadBoundary =
    "Prompt payload may include synthetic task objective, selected module summaries, skill/module listing every turn, active task reminders, validators, evidence refs, omitted-context log, and safety boundaries. It must exclude PHI, secrets, credentials, hidden chain-of-thought, irrelevant tools, and production connector payloads.";
  const memoryWritePlan: ScrimedContextMemoryWritePlan = {
    destination: "metadata-only-decision-memory-ledger",
    allowedFields: [
      "manifest_id",
      "policy_version",
      "requested_action",
      "selected_module_ids",
      "skill_ids",
      "task_reminder_ids",
      "omitted_context_ids",
      "validator_ids",
      "safety_decision",
      "manifest_hash",
      "reviewer_status"
    ],
    blockedFields: [
      "PHI",
      "patient_identifiers",
      "credentials",
      "bearer_tokens",
      "service_role_keys",
      "hidden_chain_of_thought",
      "production_connector_payloads"
    ],
    retentionBoundary:
      "Synthetic metadata-only memory until tenant retention, deletion, residency, and customer authorization controls are approved.",
    chainOfThoughtPolicy:
      "Store concise rationale summaries and evidence refs only; do not request, expose, or persist hidden model chain-of-thought."
  };
  const hashPayload = {
    requestedAction,
    selectedModules: selectedModules.map((module) => module.id),
    relevantSkills: relevantSkills.map((skill) => skill.id),
    activeTaskReminders: activeTaskReminders.map((reminder) => `${reminder.id}:${reminder.version}`),
    validators: validators.map((validator) => validator.id),
    safety: safetyDecision.status
  };
  const manifestHash = hashManifest(hashPayload);

  return {
    id: "scrimed-context-manifest-synthetic-pre-agent-run-v1",
    schemaVersion: scrimedDynamicContextInjectionSchemaVersion,
    service: "scrimed-dynamic-context-injection-engine",
    status: safetyDecision.allowed ? "ready-for-synthetic-agent-run" : "blocked-by-policy",
    cadence: input?.cadence ?? "pre-agent-run",
    generatedAt: deterministicGeneratedAt,
    syntheticOnly: true,
    phiDetected: safetyDecision.phiDetected,
    noPhiBoundary: scrimedDynamicContextInjectionBoundary,
    requestedAction,
    sessionStartPlanningSummary:
      "Concise planning summary only: build the next safe SCRIMED layer by loading the context injection module, TrustOps governance, middleware boundaries, validators, and active reminders before any synthetic agent run. This is not hidden chain-of-thought.",
    selectedModules,
    relevantSkills,
    activeTaskReminders,
    omittedContext,
    lazyCapabilityLoadout: {
      loadedNow: [
        "dynamic-context-injection-engine",
        "operational-benchmark-layer",
        "workflow-planner",
        "governance-compliance",
        "secure-middleware-gateway",
        "schema-validator",
        "safety-policy-validator"
      ],
      deferredUntilNeeded: [
        "researchops",
        "clinicalbench",
        "semantic-intelligence-graph",
        "signal-detection",
        "self-healing-operations"
      ],
      blockedUntilApproval: [
        "live-phi-context",
        "production-ehr-connector",
        "production-payer-submission",
        "patient-outreach-tools",
        "billing-submission-tools"
      ]
    },
    validators,
    safetyDecision,
    promptPayloadBoundary,
    memoryWritePlan,
    audit: {
      traceId: "trace-scrimed-context-manifest-synthetic-001",
      policyVersion: scrimedSafetyPolicyVersion,
      decisionTraceKind: "metadata-rationale-summary-not-hidden-chain-of-thought",
      toolAccessGrants: "none-context-manifest-does-not-grant-permissions",
      reviewerGate: "human-review-required-before-protected-workflow",
      manifestHash
    },
    noGoBoundaries: scrimedNoGoBoundaries
  };
}

export function validateScrimedDynamicContextManifest(
  manifest = buildScrimedDynamicContextManifest()
) {
  const checks: ScrimedContextManifestValidationCheck[] = [
    {
      check: "pre-agent-run-context-manifest-ready",
      passed:
        manifest.service === "scrimed-dynamic-context-injection-engine" &&
        manifest.status === "ready-for-synthetic-agent-run" &&
        manifest.syntheticOnly === true,
      detail: "Manifest must be ready only for synthetic/no-PHI pre-agent-run use."
    },
    {
      check: "selected-modules-listed-every-turn",
      passed:
        manifest.selectedModules.length >= 5 &&
        manifest.relevantSkills.every((skill) => skill.includedEveryTurn),
      detail: "Manifest must include selected modules plus skill/module listing every turn."
    },
    {
      check: "task-reminders-versioned",
      passed:
        manifest.activeTaskReminders.length >= 3 &&
        manifest.activeTaskReminders.every(
          (reminder) => reminder.version >= 1 && reminder.requiredBeforeNextRun
        ),
      detail: "Task reminders must be versioned and required before the next agent run."
    },
    {
      check: "omitted-context-protects-phi-secrets-connectors-and-hidden-chain-of-thought",
      passed:
        manifest.omittedContext.some((item) => item.category === "phi") &&
        manifest.omittedContext.some((item) => item.category === "secret") &&
        manifest.omittedContext.some((item) => item.category === "production-connector") &&
        manifest.omittedContext.some((item) => item.category === "hidden-chain-of-thought"),
      detail: "Manifest must explicitly omit PHI, secrets, production connectors, and hidden chain-of-thought."
    },
    {
      check: "validators-avoid-self-correction-trap",
      passed:
        manifest.validators.some((validator) => validator.validationType === "schema") &&
        manifest.validators.some((validator) => validator.validationType === "evidence") &&
        manifest.validators.some((validator) => validator.validationType === "rule") &&
        manifest.validators.some((validator) => validator.validationType === "human-review") &&
        manifest.validators.some((validator) => validator.validationType === "benchmark"),
      detail: "Manifest must validate with schemas, evidence, rules, benchmarks, and human review."
    },
    {
      check: "manifest-cannot-grant-tool-access",
      passed:
        manifest.audit.toolAccessGrants ===
        "none-context-manifest-does-not-grant-permissions",
      detail: "Context injection may select context but cannot grant tools or permissions."
    },
    {
      check: "memory-plan-metadata-only-no-hidden-cot",
      passed:
        manifest.memoryWritePlan.destination === "metadata-only-decision-memory-ledger" &&
        manifest.memoryWritePlan.blockedFields.includes("PHI") &&
        manifest.memoryWritePlan.blockedFields.includes("hidden_chain_of_thought"),
      detail: "Long-term memory plan must stay metadata-only and block PHI plus hidden chain-of-thought."
    },
    {
      check: "safety-governance-pass",
      passed:
        manifest.safetyDecision.allowed &&
        manifest.safetyDecision.policyVersion === scrimedSafetyPolicyVersion &&
        manifest.safetyDecision.inputClassification === "synthetic-no-phi",
      detail: "Manifest must pass SCRIMED's no-PHI safety governance gate."
    }
  ];

  return {
    status: checks.every((check) => check.passed) ? "pass" : "fail",
    checks
  };
}

export function getScrimedDynamicContextInjectionSummary() {
  const manifest = buildScrimedDynamicContextManifest();
  const validation = validateScrimedDynamicContextManifest(manifest);

  return {
    service: manifest.service,
    status: scrimedDynamicContextInjectionStatus,
    buildRoadmapStatus: scrimedBuildRoadmapStatus,
    schemaVersion: scrimedDynamicContextInjectionSchemaVersion,
    apiRoute: scrimedDynamicContextInjectionApiRoute,
    briefRoute: scrimedDynamicContextInjectionBriefRoute,
    boundary: scrimedDynamicContextInjectionBoundary,
    roadmapBoundary: scrimedBuildRoadmapBoundary,
    manifest,
    validation,
    agentRunContract: {
      beforeEveryRun:
        "Create the manifest, run safety governance, inject selected modules/skills/reminders/validators, record omitted context, and write metadata-only audit memory.",
      afterEveryStateChange:
        "Increment task reminder versions, update workflow state, rerun validators, and preserve human-review gates.",
      failClosed:
        "Block the run when PHI, secrets, production connector payloads, missing validators, or protected actions appear."
    },
    recommendedNextBuildStep:
      "Wire this manifest into the SCRIMED Workflow Planner and Agent Runtime as the required pre-run packet for every synthetic agent execution."
  };
}

export function buildScrimedDynamicContextInjectionBrief() {
  const summary = getScrimedDynamicContextInjectionSummary();
  const manifest = summary.manifest;

  return [
    "# SCRIMED Dynamic Context Injection Engine",
    "",
    `Status: ${summary.status}`,
    `Schema: ${summary.schemaVersion}`,
    `API: ${summary.apiRoute}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Pre-Agent-Run Manifest",
    `- Manifest ID: ${manifest.id}`,
    `- Cadence: ${manifest.cadence}`,
    `- Safety decision: ${manifest.safetyDecision.status}`,
    `- Manifest hash: ${manifest.audit.manifestHash}`,
    "",
    "## Selected Modules",
    ...manifest.selectedModules.map(
      (module) => `- ${module.name}: ${module.reasonSelected}`
    ),
    "",
    "## Skill/Module Listing Every Turn",
    ...manifest.relevantSkills.map((skill) => `- ${skill.name}: ${skill.purpose}`),
    "",
    "## Task Reminders",
    ...manifest.activeTaskReminders.map(
      (reminder) => `- v${reminder.version} ${reminder.id}: ${reminder.text}`
    ),
    "",
    "## Omitted Context",
    ...manifest.omittedContext.map((item) => `- ${item.id}: ${item.reason}`),
    "",
    "## Validators",
    ...manifest.validators.map(
      (validator) => `- ${validator.name}: ${validator.failClosedBehavior}`
    ),
    "",
    "## Memory Write Plan",
    `- Destination: ${manifest.memoryWritePlan.destination}`,
    `- Chain-of-thought policy: ${manifest.memoryWritePlan.chainOfThoughtPolicy}`,
    "",
    "## Validation",
    ...summary.validation.checks.map(
      (check) => `- ${check.passed ? "PASS" : "FAIL"} ${check.check}: ${check.detail}`
    ),
    "",
    "## Next Build Step",
    summary.recommendedNextBuildStep,
    ""
  ].join("\n");
}
