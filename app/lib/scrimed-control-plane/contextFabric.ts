import { createAuditHash, searchScrimedWorkContext } from "../scrimed-work";
import { controlPlaneSemanticRegistry } from "./registries";
import type { ControlPlaneContextRecord } from "./types";

const injectionPatterns: Array<[RegExp, string]> = [
  [/ignore (?:all|any|the) previous instructions/i, "instruction-override"],
  [/system prompt|developer message/i, "prompt-exfiltration"],
  [/execute (?:this|the) tool|call (?:a|the) tool/i, "tool-instruction"],
  [/send (?:the|all) data|export (?:the|all) records/i, "data-exfiltration"],
  [/reveal (?:a|the) secret|api key|bearer token/i, "secret-exfiltration"]
];

export function classifyRetrievedContentRisk(text: string) {
  const promptInjectionFlags = injectionPatterns
    .filter(([pattern]) => pattern.test(text))
    .map(([, flag]) => flag);

  return {
    sourceRisk: promptInjectionFlags.length > 1 ? "high" as const : promptInjectionFlags.length === 1 ? "moderate" as const : "low" as const,
    promptInjectionFlags,
    executableInstructionsAllowed: false as const
  };
}

function ontologyScore(query: string, text: string) {
  const normalized = `${query} ${text}`.toLowerCase();
  const matches = controlPlaneSemanticRegistry.filter((definition) =>
    normalized.includes(definition.label.toLowerCase()) ||
    normalized.includes(definition.canonicalIdentifier.split(".").at(-1)?.replaceAll("-", " ") ?? "")
  ).length;
  return Math.min(100, matches * 18);
}

function graphScore(sourceType: string, citation: string) {
  const provenanceBoost = citation.trim().length > 0 ? 30 : 0;
  const relationshipBoost = ["fhir-preview", "clinical-guideline", "payer-rule", "organization-ontology"].includes(sourceType) ? 35 : 20;
  return provenanceBoost + relationshipBoost;
}

export function searchControlPlaneContext(input: { query: string; tenantId: string; limit?: number }) {
  if (input.tenantId !== "synthetic-tenant") {
    return {
      query: input.query,
      tenantId: input.tenantId,
      records: [] as ControlPlaneContextRecord[],
      tenantIsolation: "blocked-unregistered-tenant",
      citationRequired: true,
      doNotAnswerWithoutEvidence: true,
      retrievedContentIsUntrustedData: true,
      confidenceScore: 0
    };
  }

  const result = searchScrimedWorkContext({
    query: input.query,
    tenant: input.tenantId,
    limit: input.limit ?? 5
  });
  const records = result.records.map((record): ControlPlaneContextRecord => {
    const sourceText = `${record.title} ${record.excerpt}`;
    const risk = classifyRetrievedContentRisk(sourceText);
    const ontology = ontologyScore(input.query, sourceText);
    const graph = graphScore(record.sourceType, record.citation);
    const trustScore = record.trustTier === "source-of-record" ? 100 : record.trustTier === "reviewed-reference" ? 85 : 65;
    const unifiedScore = Math.round(
      record.lexicalScore * 0.25 +
      record.semanticScore * 0.25 +
      ontology * 0.15 +
      graph * 0.1 +
      record.recencyScore * 0.1 +
      trustScore * 0.15
    );

    return {
      id: record.sourceId,
      tenantId: input.tenantId,
      sourceType: record.sourceType,
      sourceTitle: record.title,
      excerpt: record.excerpt,
      citation: record.citation,
      effectiveDate: record.effectiveDate,
      expirationDate: record.expiryDate,
      trustTier: record.trustTier,
      dataClassification: record.dataClassification === "deidentified" ? "deidentified-clinical" : "internal",
      freshnessScore: record.recencyScore,
      lexicalScore: record.lexicalScore,
      semanticScore: record.semanticScore,
      ontologyScore: ontology,
      graphScore: graph,
      unifiedScore,
      ...risk,
      auditHash: createAuditHash({ sourceId: record.sourceId, tenantId: input.tenantId, unifiedScore, flags: risk.promptInjectionFlags })
    };
  }).sort((left, right) => right.unifiedScore - left.unifiedScore);

  return {
    query: input.query,
    tenantId: input.tenantId,
    records,
    tenantIsolation: "enforced-synthetic-tenant",
    citationRequired: true,
    doNotAnswerWithoutEvidence: true,
    retrievedContentIsUntrustedData: true,
    confidenceScore: records.length === 0 ? 0 : Math.round(records.reduce((sum, record) => sum + record.unifiedScore, 0) / records.length)
  };
}
