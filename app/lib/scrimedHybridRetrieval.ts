import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import { scrimedSafetyPolicyVersion } from "./scrimedSafetyGovernance";

export type ScrimedSourceTrustTier = "primary" | "reviewed" | "internal_policy" | "synthetic_fixture";

export type ScrimedHybridRetrievalDocument = {
  id: string;
  title: string;
  keywords: string[];
  bm25Score: number;
  vectorScore: number;
  ontologyBoost: number;
  knowledgeGraphBoost: number;
  sourceTrustTier: ScrimedSourceTrustTier;
  citationRequired: boolean;
};

export type ScrimedHybridRetrievalResult = ScrimedHybridRetrievalDocument & {
  unifiedScore: number;
  rank: number;
  answerBoundary: string;
  auditHash: string;
};

export const scrimedHybridRetrievalApiRoute = "/api/scrimed-hybrid-retrieval";
export const scrimedHybridRetrievalBriefRoute = "/api/scrimed-hybrid-retrieval/brief";
export const scrimedHybridRetrievalStatus = "scrimed-hybrid-retrieval-active-synthetic-no-phi";
export const scrimedHybridRetrievalBoundary =
  "SCRIMED Hybrid Retrieval is a synthetic/no-PHI retrieval architecture layer. Clinical settings require citations and evidence; the system must not answer clinical questions without evidence and does not authorize diagnosis, treatment, prescribing, EHR writeback, or payer submission.";

export const scrimedHybridRetrievalDocuments: ScrimedHybridRetrievalDocument[] = [
  {
    id: "retrieval-doc-prior-auth-policy",
    title: "Synthetic prior authorization policy criteria",
    keywords: ["prior authorization", "medical necessity", "payer policy"],
    bm25Score: 0.82,
    vectorScore: 0.76,
    ontologyBoost: 0.08,
    knowledgeGraphBoost: 0.06,
    sourceTrustTier: "internal_policy",
    citationRequired: true
  },
  {
    id: "retrieval-doc-fhir-observation",
    title: "FHIR Observation semantic mapping fixture",
    keywords: ["FHIR", "Observation", "LOINC", "semantic mapping"],
    bm25Score: 0.7,
    vectorScore: 0.84,
    ontologyBoost: 0.12,
    knowledgeGraphBoost: 0.1,
    sourceTrustTier: "synthetic_fixture",
    citationRequired: true
  },
  {
    id: "retrieval-doc-clinical-guideline",
    title: "Reviewed clinical guideline summary placeholder",
    keywords: ["guideline", "evidence", "clinical review"],
    bm25Score: 0.78,
    vectorScore: 0.8,
    ontologyBoost: 0.1,
    knowledgeGraphBoost: 0.09,
    sourceTrustTier: "reviewed",
    citationRequired: true
  }
];

const trustTierWeight: Record<ScrimedSourceTrustTier, number> = {
  primary: 0.12,
  reviewed: 0.1,
  internal_policy: 0.08,
  synthetic_fixture: 0.04
};

export function rankScrimedHybridRetrievalDocuments(
  documents: ScrimedHybridRetrievalDocument[] = scrimedHybridRetrievalDocuments
): ScrimedHybridRetrievalResult[] {
  return documents
    .map((document) => {
      const unifiedScore =
        document.bm25Score * 0.32 +
        document.vectorScore * 0.38 +
        document.ontologyBoost +
        document.knowledgeGraphBoost +
        trustTierWeight[document.sourceTrustTier];

      return {
        ...document,
        unifiedScore: Number(unifiedScore.toFixed(3)),
        rank: 0,
        answerBoundary:
          "Do not answer clinical questions without evidence. Cite sources, expose uncertainty, and route high-risk content to human review.",
        auditHash: generateScrimedAuditHash({
          document,
          unifiedScore,
          safetyPolicyVersion: scrimedSafetyPolicyVersion
        })
      };
    })
    .sort((left, right) => right.unifiedScore - left.unifiedScore)
    .map((result, index) => ({ ...result, rank: index + 1 }));
}

export function getScrimedHybridRetrievalSummary() {
  const rankedResults = rankScrimedHybridRetrievalDocuments();

  return {
    service: "scrimed-hybrid-retrieval",
    status: scrimedHybridRetrievalStatus,
    apiRoute: scrimedHybridRetrievalApiRoute,
    briefRoute: scrimedHybridRetrievalBriefRoute,
    boundary: scrimedHybridRetrievalBoundary,
    scoring: {
      keywordBm25Placeholder: true,
      vectorSimilarityPlaceholder: true,
      ontologyBoostPlaceholder: true,
      knowledgeGraphBoostPlaceholder: true,
      unifiedRankingFunction: "0.32*bm25 + 0.38*vector + ontology + graph + trustTier"
    },
    clinicalSetting: {
      citationRequired: true,
      doNotAnswerWithoutEvidence: true
    },
    rankedResults,
    productionReadiness: false,
    noPhiConfirmed: true
  };
}

export function buildScrimedHybridRetrievalBrief() {
  const summary = getScrimedHybridRetrievalSummary();

  return [
    "# SCRIMED Hybrid Retrieval Engine",
    "",
    summary.boundary,
    "",
    "## Ranking Formula",
    `- ${summary.scoring.unifiedRankingFunction}`,
    "",
    "## Ranked Synthetic Sources",
    ...summary.rankedResults.map(
      (result) =>
        `- #${result.rank} ${result.title}: score=${result.unifiedScore}; trust=${result.sourceTrustTier}; citation_required=${result.citationRequired}`
    ),
    "",
    "Clinical setting: do not answer without evidence; cite sources and require human review for high-risk content."
  ].join("\n");
}
