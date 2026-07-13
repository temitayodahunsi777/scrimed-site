import { NextResponse } from "next/server";
import { getAgentOSSummary } from "../../lib/agentOS";
import { getAtlasIntelligenceCoreSummary } from "../../lib/atlasIntelligenceCore";
import { getScrimedStrategicExecutionLayerSummary } from "../../lib/scrimedStrategicExecutionLayer";

export async function GET() {
  const agentOS = getAgentOSSummary();
  const atlas = getAtlasIntelligenceCoreSummary();
  const strategicExecution = getScrimedStrategicExecutionLayerSummary();

  return NextResponse.json({
    service: "scrimed-observability-dashboard",
    route: "/observability",
    status: "continuous-validation-ready",
    observabilitySignals: agentOS.observabilitySignals,
    healthcareAiObservabilitySlices: strategicExecution.healthcareAiObservabilitySlices,
    medLogStyleUsageFields: strategicExecution.medLogStyleUsageFields,
    inferenceEfficiencyBacklog: strategicExecution.inferenceEfficiencyBacklog,
    mlflowStyleEvaluationLayers: strategicExecution.mlflowStyleEvaluationLayers,
    continuousValidationMetrics: atlas.continuousValidationMetrics,
    productionBoundary: atlas.boundary,
    updated: atlas.updated
  });
}
