import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";

export const syntheticPilotFactoryVersion =
  "scrimed-synthetic-pilot-factory-v1-2026-08-09";

export const syntheticPilotStages = [
  "discovery",
  "workflow-map",
  "synthetic-baseline",
  "success-criteria",
  "implementation",
  "evaluation",
  "executive-readout",
  "expansion-hypothesis"
] as const;

export type SyntheticPilotStage = (typeof syntheticPilotStages)[number];

export type SyntheticWorkflowTwin = {
  actors: string[];
  systems: string[];
  inputs: string[];
  outputs: string[];
  handoffs: string[];
  latencyAssumptions: string[];
  failureModes: string[];
  costInputs: string[];
  evidenceRequirements: string[];
};

export type SyntheticPilotDefinition = {
  pilotId: string;
  title: string;
  workflow: string;
  objective: string;
  stage: SyntheticPilotStage;
  baseline: string[];
  successCriteria: string[];
  workflowTwin: SyntheticWorkflowTwin;
  limitations: string[];
  safetyStatus: "SYNTHETIC_NO_PHI_DECISION_SUPPORT_ONLY";
  expansionDecision: "NOT_EVALUATED" | "HOLD" | "REVIEW_REQUIRED";
  externalActionsEnabled: false;
};

export function createSyntheticPilot(
  input: Omit<
    SyntheticPilotDefinition,
    "safetyStatus" | "expansionDecision" | "externalActionsEnabled"
  >
) {
  if (!syntheticPilotStages.includes(input.stage)) {
    throw new Error("synthetic-pilot-stage-invalid");
  }
  if (!input.successCriteria.length || !input.workflowTwin.evidenceRequirements.length) {
    throw new Error("synthetic-pilot-definition-incomplete");
  }
  const pilot = {
    ...input,
    safetyStatus: "SYNTHETIC_NO_PHI_DECISION_SUPPORT_ONLY" as const,
    expansionDecision: "NOT_EVALUATED" as const,
    externalActionsEnabled: false as const
  };

  return {
    ...pilot,
    pilotFingerprint: createClinicalEvidenceHash({
      version: syntheticPilotFactoryVersion,
      ...pilot
    })
  };
}

export function buildDocumentationAuthorizationPilot() {
  return createSyntheticPilot({
    pilotId: "pilot-documentation-authorization-synthetic-v1",
    title: "Documentation Before Authorization Synthetic Pilot",
    workflow: "prior-authorization-documentation-preparation",
    objective:
      "Evaluate whether SCRIMED can identify documentation gaps and prepare a cited review packet without submission or coverage determination.",
    stage: "success-criteria",
    baseline: [
      "Synthetic cases only",
      "Manual gap-identification time not yet measured",
      "No production payer or EHR connection"
    ],
    successCriteria: [
      "All criteria findings cite the supplied synthetic policy fixture",
      "Missing evidence produces abstention or human review",
      "No payer submission or record mutation is possible",
      "Reviewer correction and elapsed time are captured"
    ],
    workflowTwin: {
      actors: ["synthetic coordinator", "documentation reviewer", "payer-policy reviewer"],
      systems: ["SCRIMED Work", "synthetic policy corpus", "evidence ledger"],
      inputs: ["synthetic case", "synthetic payer criteria"],
      outputs: ["documentation gap list", "review packet draft", "verification result"],
      handoffs: ["agent preparation to independent human review"],
      latencyAssumptions: ["interactive preparation target recorded as a scenario input"],
      failureModes: ["missing policy evidence", "contradictory criteria", "unsupported claim", "review rejection"],
      costInputs: ["inference", "retrieval", "review", "retry", "correction"],
      evidenceRequirements: ["source citations", "policy version", "review disposition", "cost inputs", "boundary receipt"]
    },
    limitations: [
      "SYNTHETIC pilot; no customer, clinical, payer, revenue, or production outcome is represented.",
      "No causal, savings, denial-reduction, or ROI claim is permitted.",
      "Expansion requires independent review and separately authorized operating scope."
    ]
  });
}

export function buildSyntheticPilotEvidencePack(
  pilot: ReturnType<typeof createSyntheticPilot>
) {
  const pack = {
    pilotId: pilot.pilotId,
    label: "SYNTHETIC" as const,
    objective: pilot.objective,
    baseline: pilot.baseline,
    workflow: pilot.workflowTwin,
    intervention: "Governed, cited, human-reviewed workflow preparation",
    evidence: pilot.workflowTwin.evidenceRequirements,
    outcomes: [] as string[],
    limitations: pilot.limitations,
    cost: "UNAVAILABLE" as const,
    value: "UNAVAILABLE" as const,
    safetyStatus: pilot.safetyStatus,
    expansionDecision: "REVIEW_REQUIRED" as const,
    productionAuthorityGranted: false as const
  };

  return {
    ...pack,
    evidencePackHash: createClinicalEvidenceHash({
      version: syntheticPilotFactoryVersion,
      pilotFingerprint: pilot.pilotFingerprint,
      ...pack
    })
  };
}
