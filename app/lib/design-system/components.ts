export type DesignSystemComponentContract = {
  component: string;
  source: string;
  props: string[];
  variants: string[];
  states: string[];
  tokenDependencies: string[];
  figmaNodeId: null;
  mappingStatus: "READY_FOR_FIGMA_MAPPING";
};

type ComponentRow = readonly [
  component: string,
  source: string,
  props: readonly string[],
  variants: readonly string[],
  states: readonly string[]
];

const componentRows: ComponentRow[] = [
  ["Button", "app/globals.css", ["label", "disabled", "type"], ["primary", "secondary", "danger"], ["default", "hover", "focus-visible", "disabled"]],
  ["Card", "app/globals.css", ["title", "content"], ["default", "evidence", "decision"], ["default", "selected"]],
  ["MetricCard", "app/globals.css", ["label", "value", "status"], ["neutral", "positive", "caution"], ["default"]],
  ["StatusBadge", "app/globals.css", ["status"], ["pass", "review", "blocked"], ["default"]],
  ["GateStatus", "app/globals.css", ["label", "status", "reason"], ["pass", "operator-required", "blocked", "fail"], ["default"]],
  ["EvidenceCard", "app/globals.css", ["title", "source", "freshness"], ["verified", "synthetic", "missing"], ["default"]],
  ["DecisionCard", "app/globals.css", ["decision", "owner", "evidence"], ["founder", "reviewer", "operator"], ["default"]],
  ["WorkflowStep", "app/globals.css", ["order", "label", "status"], ["planned", "active", "complete", "blocked"], ["default"]],
  ["AgentRunCard", "app/globals.css", ["runId", "status", "budget"], ["active", "paused", "complete", "failed"], ["default"]],
  ["ModelRouteCard", "app/globals.css", ["route", "reason", "qualification"], ["selected", "fallback", "abstain"], ["default"]],
  ["ProofPacketCard", "app/globals.css", ["packet", "fingerprint", "distribution"], ["review", "ready", "locked"], ["default"]],
  ["TrustReadinessCard", "app/globals.css", ["decision", "dimensions"], ["allow", "review", "block"], ["default"]],
  ["InvestorReadinessCard", "app/globals.css", ["dimension", "score", "evidence"], ["strong", "developing", "blocked"], ["default"]],
  ["Navigation", "app/components/SiteNavigation.tsx", ["groups", "journeys"], ["desktop", "mobile"], ["default", "open", "focus"]],
  ["Modal", "app/globals.css", ["title", "open", "onClose"], ["standard", "approval"], ["open", "closed"]],
  ["Table", "app/globals.css", ["columns", "rows"], ["compact", "standard"], ["default", "empty"]],
  ["EmptyState", "app/globals.css", ["title", "description", "action"], ["default"], ["default"]],
  ["Alert", "app/globals.css", ["title", "message"], ["info", "caution", "blocked"], ["default"]]
];

const contracts: Array<Omit<DesignSystemComponentContract, "figmaNodeId" | "mappingStatus">> = componentRows.map(([component, source, props, variants, states]) => ({
  component,
  source,
  props: [...props],
  variants: [...variants],
  states: [...states],
  tokenDependencies: ["color", "spacing", "radii", "typography", "elevation", "motion"]
}));

export const designSystemComponentContracts: DesignSystemComponentContract[] = contracts.map((contract) => ({
  ...contract,
  figmaNodeId: null,
  mappingStatus: "READY_FOR_FIGMA_MAPPING"
}));
