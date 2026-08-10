import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";
import { routeScrimedWorkModel } from "./scrimed-work/modelRouter";
import type {
  EvidenceClaim,
  EvidenceSource,
  PolicyDecision,
  SearchRequest,
  SearchResult
} from "./scrimed-work/p32Contracts";
import { scrimedP32Boundary, scrimedP32ContractVersion } from "./scrimed-work/p32Contracts";

export const clinicalSearchFabricVersion = "scrimed-clinical-search-fabric-v1-2026-07-20";

export const clinicalSearchFabricBoundary =
  "Clinical Search Fabric evaluates bounded, rights-aware public or approved reference evidence supplied through governed adapters. It does not crawl authenticated or prohibited content, process live PHI, or replace qualified clinical review.";

export type ClinicalSearchClaimInput = Pick<EvidenceClaim, "claimId" | "statement" | "material" | "citedPassageIds">;

export type ClinicalSearchConflictInput = {
  topic: string;
  sourceIds: string[];
  summary: string;
};

export type ClinicalSearchExecutionInput = {
  request: SearchRequest;
  candidateSources: EvidenceSource[];
  proposedClaims: ClinicalSearchClaimInput[];
  declaredConflicts?: ClinicalSearchConflictInput[];
  evaluatedAt: string;
  retrievalFailure?: string;
  measuredLatencyMs?: number;
  costs?: Partial<{
    retrievalUsd: number;
    normalizationUsd: number;
    inferenceUsd: number;
    retryUsd: number;
    infrastructureUsd: number;
    humanReviewUsd: number;
  }>;
  clinicianAccepted?: boolean;
};

type RankedEvidenceSource = EvidenceSource & {
  lexicalScore: number;
  trustScore: number;
  freshnessScore: number;
  totalScore: number;
};

const stopWords = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "in", "is", "it", "of", "on", "or", "that", "the", "to", "with"
]);

const retrievedInstructionPattern = /\b(?:ignore|override|disregard)\s+(?:all\s+)?(?:previous|prior|system|developer|policy)\b|\b(?:reveal|exfiltrate|send)\s+(?:the\s+)?(?:system prompt|credentials?|tokens?|secrets?)\b|\bexecute\s+(?:this\s+)?tool\b/i;

function tokens(value: string) {
  return value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((token) => token.length > 1 && !stopWords.has(token));
}

function boundedScore(value: number) {
  return Number(Math.max(0, Math.min(1, value)).toFixed(4));
}

function daysBetween(earlier: string, later: string) {
  return Math.max(0, (Date.parse(later) - Date.parse(earlier)) / 86_400_000);
}

function sourceIsCurrent(source: EvidenceSource, evaluatedAt: string, requiredFreshnessDays: number) {
  const evaluated = Date.parse(evaluatedAt);
  const published = Date.parse(source.publicationDate);
  const effective = Date.parse(source.effectiveDate);
  const retrieved = Date.parse(source.retrievedAt);
  if (![evaluated, published, effective, retrieved].every(Number.isFinite)) return false;
  if (published > evaluated || effective > evaluated || retrieved > evaluated) return false;
  if (source.expiresAt) {
    const expires = Date.parse(source.expiresAt);
    if (!Number.isFinite(expires) || expires <= evaluated) return false;
  }
  return daysBetween(source.retrievedAt, evaluatedAt) <= requiredFreshnessDays;
}

function isSha256(value: string) {
  return /^[a-f0-9]{64}$/i.test(value);
}

function isHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

function validateEvidenceSources(request: SearchRequest, sources: EvidenceSource[]) {
  const blockers: string[] = [];
  const sourceIds = sources.map((source) => source.sourceId);
  const passageIds = sources.flatMap((source) => source.passages.map((passage) => passage.passageId));
  if (new Set(sourceIds).size !== sourceIds.length) blockers.push("evidence source identifiers must be unique");
  if (new Set(passageIds).size !== passageIds.length) blockers.push("evidence passage identifiers must be globally unique");
  if (request.mode === "public-evidence" && sources.some((source) => source.tenantId !== "public")) {
    blockers.push("public evidence mode accepts public-scoped sources only");
  }
  for (const source of sources) {
    if (!source.sourceId || !source.version || !source.title.trim() || !isHttpsUrl(source.canonicalUrl)) {
      blockers.push(`${source.sourceId || "unknown-source"}: source identity or canonical URL is invalid`);
    }
    if (!isSha256(source.provenanceHash)) {
      blockers.push(`${source.sourceId}: source provenance hash is invalid`);
    }
    if (source.passages.length === 0) blockers.push(`${source.sourceId}: at least one evidence passage is required`);
    for (const passage of source.passages) {
      if (!passage.passageId || !passage.text.trim() || passage.text.length > 16_000) {
        blockers.push(`${source.sourceId}: passage metadata is invalid`);
      } else if (retrievedInstructionPattern.test(passage.text)) {
        blockers.push(`${source.sourceId}:${passage.passageId}: passage contains untrusted instruction-like content`);
      } else if (!isSha256(passage.passageHash) || passage.passageHash !== createClinicalEvidenceHash(passage.text)) {
        blockers.push(`${source.sourceId}:${passage.passageId}: passage content hash does not match`);
      }
    }
  }
  return blockers;
}

function validateRequest(request: SearchRequest) {
  const blockers: string[] = [];
  if (!request.tenantId || !request.actorId || !request.workflowId || !request.question.trim()) {
    blockers.push("tenant, actor, workflow, and question are required");
  }
  if (request.maximumQueries < 1 || request.maximumQueries > 8 || request.queryTerms.length > request.maximumQueries) {
    blockers.push("query expansion exceeds the bounded query budget");
  }
  if (request.maximumSources < 1 || request.maximumSources > 20) blockers.push("source budget must be between 1 and 20");
  if (request.requiredFreshnessDays < 1 || request.requiredFreshnessDays > 3_650) {
    blockers.push("freshness window is outside the supported range");
  }
  if (request.inputClassification === "phi-prohibited") blockers.push("live PHI is prohibited in Clinical Search Fabric");
  if (request.mode === "public-evidence" && request.inputClassification !== "public-reference") {
    blockers.push("public evidence mode accepts public-reference inputs only");
  }
  if (request.mode === "clinical-context" && request.inputClassification === "public-reference") {
    blockers.push("clinical context mode requires an approved synthetic, deidentified, or metadata classification");
  }
  if (request.cachePolicy === "approved-public-reference-only" && request.inputClassification !== "public-reference") {
    blockers.push("patient-specific or restricted context cannot use the public reference cache");
  }
  return blockers;
}

export function rankClinicalSearchSources(
  request: SearchRequest,
  candidateSources: EvidenceSource[],
  evaluatedAt: string
): RankedEvidenceSource[] {
  const queryTokens = new Set(tokens([request.question, ...request.queryTerms].join(" ")));

  return candidateSources
    .filter((source) => source.tenantId === "public" || source.tenantId === request.tenantId)
    .filter((source) => request.approvedSourceTypes.includes(source.sourceType))
    .filter((source) => request.approvedJurisdictions.includes(source.jurisdiction))
    .filter((source) => source.contentRights !== "retrieval-prohibited")
    .map((source) => {
      const sourceTokens = new Set(tokens(`${source.title} ${source.passages.map((passage) => passage.text).join(" ")}`));
      const overlap = [...queryTokens].filter((token) => sourceTokens.has(token)).length;
      const lexicalScore = boundedScore(queryTokens.size ? overlap / queryTokens.size : 0);
      const trustScore = source.trustTier === "authoritative" ? 1 : source.trustTier === "reviewed" ? 0.7 : 0.2;
      const freshnessScore = sourceIsCurrent(source, evaluatedAt, request.requiredFreshnessDays) ? 1 : 0;
      return {
        ...source,
        lexicalScore,
        trustScore,
        freshnessScore,
        totalScore: boundedScore(lexicalScore * 0.5 + trustScore * 0.35 + freshnessScore * 0.15)
      };
    })
    .sort((left, right) => right.totalScore - left.totalScore || left.sourceId.localeCompare(right.sourceId))
    .slice(0, request.maximumSources);
}

function evaluateClaimSupport(
  claim: ClinicalSearchClaimInput,
  sources: RankedEvidenceSource[],
  request: SearchRequest,
  evaluatedAt: string
): EvidenceClaim {
  const currentSources = sources.filter((source) => sourceIsCurrent(source, evaluatedAt, request.requiredFreshnessDays));
  const passages = currentSources.flatMap((source) => source.passages);
  const rankedPassageIds = new Set(sources.flatMap((source) => source.passages.map((passage) => passage.passageId)));
  const citedPassages = passages.filter((passage) => claim.citedPassageIds.includes(passage.passageId));
  const claimTokens = new Set(tokens(claim.statement));
  const passageTokens = new Set(tokens(citedPassages.map((passage) => passage.text).join(" ")));
  const overlap = [...claimTokens].filter((token) => passageTokens.has(token)).length;
  const supportRatio = claimTokens.size ? overlap / claimTokens.size : 0;
  const supported = citedPassages.length > 0 && supportRatio >= 0.15;
  const citedRankedPassage = claim.citedPassageIds.some((passageId) => rankedPassageIds.has(passageId));

  return {
    ...claim,
    supportStatus: supported ? "supported" : "unsupported",
    confidence: boundedScore(supportRatio),
    uncertainty: [
      ...(citedPassages.length === 0 && !citedRankedPassage
        ? ["cited passage was not present in the ranked evidence set"]
        : []),
      ...(citedPassages.length === 0 && citedRankedPassage
        ? ["cited passage was stale, expired, not yet effective, or retrieved in the future"]
        : []),
      ...(citedPassages.length > 0 && !supported ? ["cited passage did not provide sufficient lexical support"] : [])
    ]
  };
}

export function executeClinicalSearchFabric(input: ClinicalSearchExecutionInput): SearchResult {
  const requestBlockers = [
    ...validateRequest(input.request),
    ...validateEvidenceSources(input.request, input.candidateSources)
  ];
  const crossTenantSourceIds = input.candidateSources
    .filter((source) => source.tenantId !== "public" && source.tenantId !== input.request.tenantId)
    .map((source) => source.sourceId);
  if (crossTenantSourceIds.length > 0) requestBlockers.push("cross-tenant evidence was supplied and the request failed closed");

  const rankedSources = requestBlockers.length
    ? []
    : rankClinicalSearchSources(input.request, input.candidateSources, input.evaluatedAt);
  const rankedSourceIds = rankedSources.map((source) => source.sourceId);
  const rankedPassageIds = new Set(rankedSources.flatMap((source) => source.passages.map((passage) => passage.passageId)));
  const claims = input.proposedClaims.map((claim) =>
    evaluateClaimSupport(claim, rankedSources, input.request, input.evaluatedAt)
  );
  const passageSourceIds = new Map(
    rankedSources.flatMap((source) => source.passages.map((passage) => [passage.passageId, source.sourceId] as const))
  );
  const conflicts = (input.declaredConflicts ?? []).filter(
    (conflict) => conflict.sourceIds.length > 1 && conflict.sourceIds.every((sourceId) => rankedSourceIds.includes(sourceId))
  );
  for (const conflict of conflicts) {
    for (const claim of claims) {
      if (
        claim.citedPassageIds.some((passageId) => {
          const sourceId = passageSourceIds.get(passageId);
          return sourceId ? conflict.sourceIds.includes(sourceId) : false;
        })
      ) {
        claim.supportStatus = "conflicted";
        claim.uncertainty = [...claim.uncertainty, `conflicting evidence: ${conflict.topic}`];
      }
    }
  }

  const freshnessWarnings = rankedSources
    .filter((source) => !sourceIsCurrent(source, input.evaluatedAt, input.request.requiredFreshnessDays))
    .map((source) => `${source.sourceId}:stale-or-expired`);
  const unsupportedMaterialClaims = claims.filter((claim) => claim.material && claim.supportStatus !== "supported");
  const missingEvidence = [
    ...requestBlockers,
    ...(input.retrievalFailure ? [`retrieval failure: ${input.retrievalFailure}`] : []),
    ...(rankedSources.length === 0 && !input.retrievalFailure ? ["no approved evidence source was retrieved"] : []),
    ...unsupportedMaterialClaims.map((claim) => `${claim.claimId}:material claim is not fully supported`),
    ...freshnessWarnings
  ];
  const highRisk = input.request.riskLevel === "high" || input.request.mode === "clinical-context";
  const route = routeScrimedWorkModel({
    taskType: "bounded clinical reference search and evidence synthesis",
    risk: input.request.riskLevel,
    requiredCapability: conflicts.length || highRisk ? "reasoning" : "balanced",
    dataClassification: input.request.inputClassification === "public-reference" ? "synthetic-no-phi" : "deidentified",
    latencyTargetMs: 5_000,
    budgetUsd: 0.5,
    tenantPolicy: "no PHI; evidence required; human review for high risk or conflict",
    reasoningRequirement: conflicts.length || highRisk ? "high" : "medium",
    qualityThreshold: highRisk ? 0.9 : 0.8,
    costComponents: {
      retrievalUsd: input.costs?.retrievalUsd,
      hostingUsd: input.costs?.infrastructureUsd,
      retriesUsd: input.costs?.retryUsd,
      humanReviewUsd: input.costs?.humanReviewUsd
    },
    maximumFallbacks: 1
  });
  const routeBlocked = route.routingStatus !== "selected";
  const requiresHumanReview = highRisk || conflicts.length > 0 || freshnessWarnings.length > 0 || unsupportedMaterialClaims.length > 0;
  const policyDecision: PolicyDecision = requestBlockers.length || routeBlocked
    ? "BLOCK"
    : requiresHumanReview
      ? "REQUIRE_HUMAN"
      : "ALLOW";
  const retrievalStatus = input.retrievalFailure ? "failed" as const : "completed" as const;
  const status: SearchResult["status"] = input.retrievalFailure
    ? "retrieval-failed"
    : policyDecision === "BLOCK" || rankedSources.length === 0
      ? "abstained"
      : policyDecision === "REQUIRE_HUMAN"
        ? "requires-human-review"
        : "answered";
  const sourceCoverage = input.proposedClaims.length
    ? claims.filter((claim) => claim.citedPassageIds.some((passageId) => rankedPassageIds.has(passageId))).length /
      input.proposedClaims.length
    : 0;
  const citationFaithfulness = input.proposedClaims.length
    ? claims.filter((claim) => claim.supportStatus === "supported").length / input.proposedClaims.length
    : 0;
  const costs = input.costs ?? {};
  const totalSystemCostUsd = [
    costs.retrievalUsd,
    costs.normalizationUsd,
    costs.inferenceUsd,
    costs.retryUsd,
    costs.infrastructureUsd,
    costs.humanReviewUsd
  ].reduce<number>((total, value) => total + Math.max(0, value ?? 0), 0);
  const accepted = Boolean(input.clinicianAccepted && status !== "abstained" && status !== "retrieval-failed");
  const metrics = {
    citationFaithfulness: boundedScore(citationFaithfulness),
    sourceCoverage: boundedScore(sourceCoverage),
    safetyWeightedAccuracy: boundedScore(citationFaithfulness * (unsupportedMaterialClaims.length ? 0.5 : 1)),
    latencyMs: Math.max(0, input.measuredLatencyMs ?? 0),
    totalSystemCostUsd: Number(totalSystemCostUsd.toFixed(6)),
    humanReviewCostUsd: Number(Math.max(0, costs.humanReviewUsd ?? 0).toFixed(6)),
    accepted,
    costPerAcceptedAnswerUsd: accepted ? Number(totalSystemCostUsd.toFixed(6)) : null
  };

  return {
    requestId: input.request.requestId,
    tenantId: input.request.tenantId,
    status,
    retrievalStatus,
    rankedSourceIds,
    claims,
    conflicts,
    missingEvidence,
    freshnessWarnings,
    route,
    metrics,
    policyDecision,
    humanReviewRequired: requiresHumanReview || policyDecision !== "ALLOW",
    auditHash: createClinicalEvidenceHash({
      contractVersion: scrimedP32ContractVersion,
      searchVersion: clinicalSearchFabricVersion,
      request: { ...input.request, question: createClinicalEvidenceHash(input.request.question) },
      rankedSourceIds,
      claims,
      conflicts,
      missingEvidence,
      policyDecision,
      metrics
    }),
    boundary: scrimedP32Boundary
  };
}
