import { evaluateScrimedSafetyGate } from "../scrimedSafetyGovernance";
import type { AutonomyLevel, DefinitionOfDoneContract, RiskLevel } from "./types";

export type AutonomyScoreInput = {
  riskLevel: RiskLevel;
  requestedAutonomy: AutonomyLevel;
  definitionOfDone: DefinitionOfDoneContract;
  observability: number;
  testability: number;
  reversibility: number;
  evidenceQuality: number;
  blastRadius: number;
  privacySensitivity: number;
  clinicalConsequence: number;
  financialConsequence: number;
  providerReliability: number;
};

export type AutonomyPolicyDecision = {
  autonomyScore: number;
  approvedAutonomy: AutonomyLevel;
  decision: "allow" | "deny" | "require_human_approval";
  reason: string;
  humanApprovalRequired: boolean;
  blockedActions: string[];
};

const autonomyRank: Record<AutonomyLevel, number> = {
  observe: 1,
  recommend: 2,
  prepare: 3,
  execute_with_approval: 4,
  execute_preapproved: 5
};

const autonomyByScore: Array<{ max: number; level: AutonomyLevel }> = [
  { max: 30, level: "observe" },
  { max: 55, level: "recommend" },
  { max: 75, level: "prepare" },
  { max: 90, level: "execute_with_approval" },
  { max: 100, level: "execute_preapproved" }
];

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function scoreAutonomy(input: AutonomyScoreInput): AutonomyPolicyDecision {
  const positive =
    input.observability +
    input.testability +
    input.reversibility +
    input.evidenceQuality +
    input.providerReliability;
  const penalties =
    input.blastRadius * 0.8 +
    input.privacySensitivity +
    input.clinicalConsequence * 1.2 +
    input.financialConsequence;
  const score = clampScore((positive / 5) - (penalties / 4));
  const scoreLevel = autonomyByScore.find((entry) => score <= entry.max)?.level ?? "observe";
  let approvedAutonomy = autonomyRank[scoreLevel] < autonomyRank[input.requestedAutonomy]
    ? scoreLevel
    : input.requestedAutonomy;

  const contractText = [
    input.definitionOfDone.goal,
    input.definitionOfDone.allowedScope.join(" "),
    input.definitionOfDone.prohibitedActions.join(" ")
  ].join(" ");
  const safety = evaluateScrimedSafetyGate({
    route: "/api/scrimed-work",
    requestedAction: contractText,
    inputText: contractText,
    allowMetadataOnly: true
  });
  const blockedActions = [
    ...input.definitionOfDone.prohibitedActions,
    ...safety.matchedBlockedActions
  ];

  if (input.riskLevel === "prohibited" || !safety.allowed) {
    return {
      autonomyScore: score,
      approvedAutonomy: "observe",
      decision: "deny",
      reason: "Prohibited or blocked safety-policy work cannot execute.",
      humanApprovalRequired: true,
      blockedActions
    };
  }

  if (input.riskLevel === "high" && autonomyRank[approvedAutonomy] > autonomyRank.prepare) {
    approvedAutonomy = "prepare";
  }

  if (!input.definitionOfDone.rollbackPlan || input.definitionOfDone.requiredEvidence.length === 0) {
    approvedAutonomy = "observe";
  }

  const humanApprovalRequired =
    input.riskLevel === "high" ||
    input.definitionOfDone.humanApprovalRequired ||
    autonomyRank[approvedAutonomy] >= autonomyRank.execute_with_approval;

  return {
    autonomyScore: score,
    approvedAutonomy,
    decision: humanApprovalRequired ? "require_human_approval" : "allow",
    reason:
      "Autonomy follows verification strength, reversibility, evidence quality, privacy sensitivity, and clinical/financial consequence.",
    humanApprovalRequired,
    blockedActions
  };
}

export function shouldFailClosedForTool(input: {
  riskLevel: RiskLevel;
  category: string;
  consequentialActionsEnabled: boolean;
}) {
  if (input.category === "consequential-write" || input.category === "external-communication") {
    return !input.consequentialActionsEnabled;
  }

  return input.riskLevel === "prohibited";
}
