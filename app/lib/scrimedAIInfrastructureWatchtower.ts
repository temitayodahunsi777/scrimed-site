import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import { scrimedSafetyPolicyVersion } from "./scrimedSafetyGovernance";

export type ScrimedAIInfrastructureWatchCategory =
  | "AI chips"
  | "model sovereignty"
  | "local/on-device models"
  | "open-weight model access"
  | "energy infrastructure"
  | "data center cooling"
  | "AI regulations"
  | "AI companion restrictions"
  | "cybersecurity/agentic ransomware"
  | "clinical AI funding"
  | "healthcare interoperability"
  | "legal/regulatory benchmarks"
  | "workforce skills"
  | "payer automation"
  | "medical imaging"
  | "drug discovery";

export type ScrimedAIInfrastructureWatchItem = {
  category: ScrimedAIInfrastructureWatchCategory;
  strategicQuestion: string;
  scrimedRelevance: string;
  recommendedSignal: string;
  responsePosture: "monitor" | "prepare" | "investigate" | "block_until_review";
  watchHash: string;
};

export const scrimedAIInfrastructureWatchtowerApiRoute = "/api/scrimed-ai-infrastructure-watchtower";
export const scrimedAIInfrastructureWatchtowerBriefRoute = "/api/scrimed-ai-infrastructure-watchtower/brief";
export const scrimedAIInfrastructureWatchtowerStatus =
  "scrimed-ai-infrastructure-watchtower-active-synthetic-no-phi";
export const scrimedAIInfrastructureWatchtowerBoundary =
  "SCRIMED AI Infrastructure Watchtower is strategic metadata and market-signal tracking only. It does not make investment advice, securities claims, production deployment claims, clinical validation claims, certification claims, or customer go-live claims.";

const categories: ScrimedAIInfrastructureWatchCategory[] = [
  "AI chips",
  "model sovereignty",
  "local/on-device models",
  "open-weight model access",
  "energy infrastructure",
  "data center cooling",
  "AI regulations",
  "AI companion restrictions",
  "cybersecurity/agentic ransomware",
  "clinical AI funding",
  "healthcare interoperability",
  "legal/regulatory benchmarks",
  "workforce skills",
  "payer automation",
  "medical imaging",
  "drug discovery"
];

export const scrimedAIInfrastructureWatchItems: ScrimedAIInfrastructureWatchItem[] = categories.map((category) => {
  const responsePosture: ScrimedAIInfrastructureWatchItem["responsePosture"] =
    category.includes("cybersecurity") || category.includes("regulations") || category.includes("companion")
      ? "block_until_review"
      : category.includes("clinical") || category.includes("medical")
        ? "prepare"
        : "monitor";
  const item = {
    category,
    strategicQuestion: `How should SCRIMED adapt to changes in ${category}?`,
    scrimedRelevance:
      "Impacts model routing, private inference, cost posture, enterprise deployment, healthcare trust, or buyer diligence.",
    recommendedSignal: `Track ${category} changes through reviewed sources, internal owner notes, and non-PHI strategy briefs.`,
    responsePosture,
    watchHash: ""
  };

  return {
    ...item,
    watchHash: generateScrimedAuditHash({
      category,
      responsePosture,
      safetyPolicyVersion: scrimedSafetyPolicyVersion
    })
  };
});

export function getScrimedAIInfrastructureWatchtowerSummary() {
  return {
    service: "scrimed-ai-infrastructure-watchtower",
    status: scrimedAIInfrastructureWatchtowerStatus,
    apiRoute: scrimedAIInfrastructureWatchtowerApiRoute,
    briefRoute: scrimedAIInfrastructureWatchtowerBriefRoute,
    boundary: scrimedAIInfrastructureWatchtowerBoundary,
    categoryCount: scrimedAIInfrastructureWatchItems.length,
    blockUntilReviewCount: scrimedAIInfrastructureWatchItems.filter(
      (item) => item.responsePosture === "block_until_review"
    ).length,
    watchItems: scrimedAIInfrastructureWatchItems,
    productionReadiness: false,
    noPhiConfirmed: true
  };
}

export function buildScrimedAIInfrastructureWatchtowerBrief() {
  const summary = getScrimedAIInfrastructureWatchtowerSummary();

  return [
    "# SCRIMED AI Infrastructure Watchtower",
    "",
    summary.boundary,
    "",
    "## Strategic Intelligence Categories",
    ...summary.watchItems.map(
      (item) => `- ${item.category}: posture=${item.responsePosture}; signal=${item.recommendedSignal}`
    ),
    "",
    "This is an internal strategy watch surface only and does not approve deployment, procurement, medical claims, or investment claims."
  ].join("\n");
}
