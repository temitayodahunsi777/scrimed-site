import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";

export const mergeReadinessVersion = "scrimed-merge-readiness-v1-2026-08-09";

export type MergeReadinessInput = {
  exactHeadApproval: boolean;
  exactHeadApprovalMatches: boolean;
  ciPassed: boolean;
  secretScanPassed: boolean;
  sbomPassed: boolean;
  publicClaimsPassed: boolean;
  unreviewedMigrationsAdded: boolean;
  syntheticOnly: boolean;
  phiEnabled: boolean;
  clinicalExecutionEnabled: boolean;
  ehrWritebackEnabled: boolean;
  deviceWritebackEnabled: boolean;
  customerActivationEnabled: boolean;
  productionAutoDeployFromMainEnabled: boolean;
};

export type MergeReadinessResult = {
  status: "READY_FOR_MERGE_AUTHORIZATION" | "NOT_READY_FOR_MERGE";
  ready: boolean;
  reasonCodes: string[];
  mergePerformed: false;
  deploymentPerformed: false;
  evaluationHash: string;
};

export function evaluateMergeReadiness(
  input: MergeReadinessInput
): MergeReadinessResult {
  const reasons = [
    !input.exactHeadApproval && "merge-exact-head-approval-missing",
    input.exactHeadApproval && !input.exactHeadApprovalMatches && "merge-exact-head-approval-stale",
    !input.ciPassed && "merge-ci-not-passing",
    !input.secretScanPassed && "merge-secret-scan-not-passing",
    !input.sbomPassed && "merge-sbom-not-passing",
    !input.publicClaimsPassed && "merge-public-claims-not-passing",
    input.unreviewedMigrationsAdded && "merge-unreviewed-migrations-present",
    !input.syntheticOnly && "merge-synthetic-only-boundary-disabled",
    input.phiEnabled && "merge-phi-enabled",
    input.clinicalExecutionEnabled && "merge-clinical-execution-enabled",
    input.ehrWritebackEnabled && "merge-ehr-writeback-enabled",
    input.deviceWritebackEnabled && "merge-device-writeback-enabled",
    input.customerActivationEnabled && "merge-customer-activation-enabled",
    input.productionAutoDeployFromMainEnabled && "merge-production-auto-deploy-enabled"
  ].filter((reason): reason is string => Boolean(reason));
  const ready = reasons.length === 0;
  const result = {
    status: ready
      ? ("READY_FOR_MERGE_AUTHORIZATION" as const)
      : ("NOT_READY_FOR_MERGE" as const),
    ready,
    reasonCodes: reasons,
    mergePerformed: false as const,
    deploymentPerformed: false as const
  };

  return {
    ...result,
    evaluationHash: createClinicalEvidenceHash({
      version: mergeReadinessVersion,
      input,
      ...result
    })
  };
}
