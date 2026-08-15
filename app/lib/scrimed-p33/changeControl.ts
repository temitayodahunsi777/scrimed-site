import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import type { RiskLevel } from "../scrimed-work/types";
import type {
  AgenticChangeDecision,
  AgenticChangeProposal
} from "./types";

export const p33ChangeControlVersion =
  "scrimed-p33-agentic-change-control-v1-2026-08-13";

export const p33ChangeControlBoundary =
  "Agentic Change Management prepares attributable review evidence and never permits an agent to self-approve a high-risk change, alter production policy, deploy, migrate production data, or bypass named review.";

const protectedPathRules: Array<{
  pattern: RegExp;
  label: string;
  risk: RiskLevel;
  reviewers: string[];
  tests: string[];
}> = [
  {
    pattern: /(?:^|\/)supabase\/migrations\//,
    label: "database-migration",
    risk: "high",
    reviewers: ["database-owner", "security-privacy-reviewer"],
    tests: ["migration-static-validation", "disposable-database-dry-run", "rollback-or-forward-recovery"]
  },
  {
    pattern: /(?:clinical|patient|fhir|hl7|dicom|oncology|trial)/i,
    label: "clinical-safety-surface",
    risk: "high",
    reviewers: ["qualified-clinical-safety-reviewer", "product-owner"],
    tests: ["clinical-release-negative-paths", "evidence-grounding", "human-review-enforcement"]
  },
  {
    pattern: /(?:auth|security|policy|capability|approval|audit|rls)/i,
    label: "security-governance-surface",
    risk: "high",
    reviewers: ["security-privacy-reviewer"],
    tests: ["authorization-denial-paths", "tenant-isolation", "audit-integrity"]
  },
  {
    pattern: /(?:release|deploy|vercel|github\/workflows)/i,
    label: "release-control-surface",
    risk: "high",
    reviewers: ["release-owner", "security-privacy-reviewer"],
    tests: ["strict-candidate-validation", "preview-verification", "rollback-readiness"]
  },
  {
    pattern: /(?:investor|claims|public|marketing|pricing)/i,
    label: "external-claims-surface",
    risk: "moderate",
    reviewers: ["founder", "claims-legal-reviewer"],
    tests: ["public-claims-integrity", "prohibited-claims-scan"]
  }
];

const rank: Record<RiskLevel, number> = {
  low: 0,
  moderate: 1,
  high: 2,
  prohibited: 3
};

function maximumRisk(values: RiskLevel[]) {
  return values.sort((left, right) => rank[right] - rank[left])[0] ?? "low";
}

function canonical(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

export function evaluateAgenticChange(
  proposal: AgenticChangeProposal,
  input: { approverId: string | null; approved: boolean }
): AgenticChangeDecision {
  if (!proposal.changeId.trim() || !proposal.tenantId.trim() || !proposal.proposerId.trim()) {
    throw new Error("Agentic changes require stable change, tenant, and proposer identities");
  }
  if (!proposal.affectedPaths.length || !proposal.affectedModules.length) {
    throw new Error("Agentic changes require affected paths and modules");
  }
  if (!proposal.rollbackPlan.trim()) {
    throw new Error("Agentic changes require a rollback plan");
  }

  const matchedRules = proposal.affectedPaths.flatMap((path) =>
    protectedPathRules.filter((rule) => rule.pattern.test(path))
  );
  const riskSignals: RiskLevel[] = matchedRules.map((rule) => rule.risk);
  if (proposal.requestedEnvironment === "production") riskSignals.push("high");
  if (proposal.dataClasses.includes("phi-prohibited")) riskSignals.push("prohibited");
  if (proposal.changeKind === "model" || proposal.changeKind === "policy") {
    riskSignals.push("high");
  }
  const riskTier = maximumRisk(riskSignals);
  const requiredTests = canonical([
    "typecheck",
    "lint",
    "nonsecret-tests",
    "production-build",
    "generated-integrity",
    ...matchedRules.flatMap((rule) => rule.tests)
  ]);
  const requiredReviewerRoles = canonical([
    "independent-technical-reviewer",
    ...matchedRules.flatMap((rule) => rule.reviewers)
  ]);
  const protectedPathMatches = canonical(matchedRules.map((rule) => rule.label));
  const reasonCodes: string[] = [];
  if (proposal.proposerType === "agent" && input.approverId === proposal.proposerId) {
    reasonCodes.push("AGENT_CANNOT_SELF_APPROVE");
  }
  if (proposal.testEvidenceIds.length < requiredTests.length) {
    reasonCodes.push("REQUIRED_TEST_EVIDENCE_INCOMPLETE");
  }
  if (!input.approved || !input.approverId) reasonCodes.push("INDEPENDENT_APPROVAL_REQUIRED");
  if (riskTier === "prohibited") reasonCodes.push("PROHIBITED_DATA_OR_ACTION");
  if (proposal.requestedEnvironment === "production") {
    reasonCodes.push("PRODUCTION_DEPLOYMENT_AUTHORIZATION_REQUIRED");
  }

  const decision = riskTier === "prohibited"
    ? "BLOCK" as const
    : reasonCodes.length
      ? "REQUIRE_HUMAN" as const
      : "ALLOW" as const;
  const payload = {
    riskTier,
    decision,
    reasonCodes: canonical(reasonCodes),
    requiredTests,
    requiredReviewerRoles,
    protectedPathMatches,
    impact: {
      clinical: protectedPathMatches.includes("clinical-safety-surface")
        ? "Clinical decision-support behavior may change; independent clinical-safety review is required."
        : "No direct clinical surface identified by path policy.",
      privacy: proposal.dataClasses.some((value) => value !== "public" && value !== "synthetic-no-phi")
        ? "Non-public data classification requires minimum-necessary and privacy review."
        : "Synthetic/public scope only.",
      security: protectedPathMatches.includes("security-governance-surface")
        ? "Authorization or governance controls may change and require negative-path testing."
        : "No protected security path identified.",
      regulatory: protectedPathMatches.includes("external-claims-surface")
        ? "External claim posture may change and requires claims/legal review."
        : "No external regulatory claim change identified.",
      financial: proposal.requestedActions.some((action) => /payment|claim|payer|pricing/i.test(action))
        ? "Financial workflow impact requires accountable finance or RCM review."
        : "No direct financial mutation requested.",
      operational: `Affects ${proposal.affectedModules.length} declared module(s) with a tested rollback requirement.`
    },
    selfApprovalAllowed: false as const,
    postMergeMonitoring: canonical([
      "error-rate-and-policy-denial-monitoring",
      "rollback-trigger-monitoring",
      ...(riskTier === "high" ? ["fixed-sentinel-cohort-monitoring", "review-rate-drift-monitoring"] : [])
    ])
  };
  return {
    ...payload,
    reviewPacketHash: createClinicalEvidenceHash({
      type: "p33-agentic-change-review-packet",
      version: p33ChangeControlVersion,
      proposal,
      payload
    })
  };
}

export function getP33ChangeControlSummary() {
  const sample = evaluateAgenticChange({
    changeId: "change-p33-context-fabric",
    tenantId: "synthetic-tenant",
    proposerId: "agent-scrimed-principal-engineer",
    proposerType: "agent",
    changeKind: "code",
    affectedPaths: [
      "app/lib/scrimed-p33/contextFabric.ts",
      "app/lib/scrimed-p33/regulatoryOversight.ts"
    ],
    affectedModules: ["Clinical Context Fabric", "Regulatory Label Twin"],
    dataClasses: ["synthetic-no-phi"],
    requestedEnvironment: "local",
    requestedActions: ["prepare-synthetic-context", "evaluate-release-gate"],
    testEvidenceIds: [],
    rollbackPlan: "Revert the attributable p.33 commit and preserve decision-ledger evidence."
  }, { approverId: null, approved: false });
  return {
    version: p33ChangeControlVersion,
    status: "review-packet-generated-independent-approval-required",
    protectedRuleCount: protectedPathRules.length,
    sample,
    boundary: p33ChangeControlBoundary
  };
}
