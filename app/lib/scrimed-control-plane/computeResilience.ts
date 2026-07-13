import { getScrimedComputeFabricSummary } from "../scrimedComputeFabric";
import { createAuditHash } from "../scrimed-work";

export type ComputeResilienceInput = {
  profileId: string;
  deploymentProfile: "cloud" | "private-cloud" | "customer-vpc" | "sovereign-cloud" | "on-premises" | "air-gapped" | "edge-device";
  providerAvailability: number;
  capacityAvailability: number;
  dataResidencyEligibility: number;
  fallbackReadiness: number;
  vendorConcentrationRisk: number;
  exportControlExposure: number;
  powerCoolingRisk: number;
  costVolatility: number;
  replacementLeadTimeRisk: number;
};

export function calculateComputeResilienceScore(input: ComputeResilienceInput) {
  const positive =
    input.providerAvailability * 0.2 +
    input.capacityAvailability * 0.18 +
    input.dataResidencyEligibility * 0.22 +
    input.fallbackReadiness * 0.2;
  const riskPenalty =
    input.vendorConcentrationRisk * 0.06 +
    input.exportControlExposure * 0.04 +
    input.powerCoolingRisk * 0.035 +
    input.costVolatility * 0.035 +
    input.replacementLeadTimeRisk * 0.03;
  const score = Math.max(0, Math.min(100, Math.round(positive - riskPenalty + 20)));

  return {
    profileId: input.profileId,
    deploymentProfile: input.deploymentProfile,
    computeResilienceScore: score,
    readiness: score >= 80 ? "resilient-metadata" : score >= 60 ? "review-required" : "blocked-for-hardening",
    silentProtectedWorkloadMigrationAllowed: false,
    fallbackRequiresPolicyReevaluation: true,
    auditHash: createAuditHash({ input, score })
  };
}

export const computeResilienceProfiles: ComputeResilienceInput[] = [
  { profileId: "cloud-metadata", deploymentProfile: "cloud", providerAvailability: 85, capacityAvailability: 80, dataResidencyEligibility: 60, fallbackReadiness: 75, vendorConcentrationRisk: 75, exportControlExposure: 35, powerCoolingRisk: 30, costVolatility: 55, replacementLeadTimeRisk: 35 },
  { profileId: "customer-vpc-metadata", deploymentProfile: "customer-vpc", providerAvailability: 75, capacityAvailability: 70, dataResidencyEligibility: 90, fallbackReadiness: 65, vendorConcentrationRisk: 60, exportControlExposure: 30, powerCoolingRisk: 35, costVolatility: 45, replacementLeadTimeRisk: 45 },
  { profileId: "air-gapped-metadata", deploymentProfile: "air-gapped", providerAvailability: 55, capacityAvailability: 50, dataResidencyEligibility: 100, fallbackReadiness: 45, vendorConcentrationRisk: 45, exportControlExposure: 65, powerCoolingRisk: 60, costVolatility: 50, replacementLeadTimeRisk: 80 },
  { profileId: "edge-device-metadata", deploymentProfile: "edge-device", providerAvailability: 60, capacityAvailability: 55, dataResidencyEligibility: 95, fallbackReadiness: 55, vendorConcentrationRisk: 40, exportControlExposure: 45, powerCoolingRisk: 20, costVolatility: 35, replacementLeadTimeRisk: 60 }
];

export function getComputeResilienceSummary() {
  const computeFabric = getScrimedComputeFabricSummary();
  return {
    service: "scrimed-compute-resilience",
    status: "metadata-readiness-only",
    profiles: computeResilienceProfiles.map(calculateComputeResilienceScore),
    trackedSignals: ["GPUs and accelerators", "foundries", "advanced packaging", "semiconductor testing", "HBM", "networking", "power", "cooling", "model export restrictions", "regional infrastructure"],
    computeFabricStatus: computeFabric.status,
    supportedDeploymentProfiles: ["cloud", "private-cloud", "customer-vpc", "sovereign-cloud", "on-premises", "air-gapped", "edge-device"],
    protectedWorkloadMigrationPolicy: "No silent migration. Residency, privacy, safety, capacity, and human approval must be re-evaluated.",
    boundary: "Readiness metadata only; no workload migration, provider activation, infrastructure purchase, or production authorization."
  };
}
