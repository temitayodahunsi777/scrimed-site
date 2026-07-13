import { getCapitalVitalitySummary } from "../capitalVitality";
import { createAuditHash } from "../scrimed-work";

export type CapitalIntelligenceProfile = {
  id: string;
  archetype: string;
  healthcareThesisMatch: number;
  aiThesisMatch: number;
  geographicRelevance: number;
  sovereignCapitalRelevance: number;
  portfolioOverlapRisk: number;
  warmIntroductionReadiness: number;
  engagementStatus: "research-only" | "qualified-internal" | "ceo-review-required";
  objections: string[];
  recommendedNextStep: string;
};

export const capitalIntelligenceProfiles: CapitalIntelligenceProfile[] = [
  {
    id: "health-system-strategic-archetype",
    archetype: "Health-system strategic investor",
    healthcareThesisMatch: 95,
    aiThesisMatch: 80,
    geographicRelevance: 85,
    sovereignCapitalRelevance: 35,
    portfolioOverlapRisk: 40,
    warmIntroductionReadiness: 0,
    engagementStatus: "research-only",
    objections: ["clinical-production evidence pending", "protected pilot evidence requires operator approval"],
    recommendedNextStep: "CEO reviews an evidence-backed internal profile before any contact."
  },
  {
    id: "enterprise-ai-infrastructure-archetype",
    archetype: "Enterprise AI infrastructure investor",
    healthcareThesisMatch: 70,
    aiThesisMatch: 95,
    geographicRelevance: 80,
    sovereignCapitalRelevance: 45,
    portfolioOverlapRisk: 55,
    warmIntroductionReadiness: 0,
    engagementStatus: "research-only",
    objections: ["provider-neutral moat evidence must remain specific", "unit economics require pilot baselines"],
    recommendedNextStep: "Prepare a claims-safe architecture and effective-cost memo for CEO review."
  },
  {
    id: "sovereign-health-transformation-archetype",
    archetype: "Sovereign health-transformation fund",
    healthcareThesisMatch: 90,
    aiThesisMatch: 85,
    geographicRelevance: 60,
    sovereignCapitalRelevance: 100,
    portfolioOverlapRisk: 30,
    warmIntroductionReadiness: 0,
    engagementStatus: "research-only",
    objections: ["regional approval not established", "data residency requires jurisdiction-specific diligence"],
    recommendedNextStep: "Prepare a no-PHI regional discovery brief for counsel and CEO review."
  }
];

export function scoreCapitalProfile(profile: CapitalIntelligenceProfile) {
  const score = Math.round(
    profile.healthcareThesisMatch * 0.3 +
    profile.aiThesisMatch * 0.25 +
    profile.geographicRelevance * 0.15 +
    profile.sovereignCapitalRelevance * 0.1 +
    profile.warmIntroductionReadiness * 0.1 +
    (100 - profile.portfolioOverlapRisk) * 0.1
  );

  return {
    profileId: profile.id,
    qualificationScore: score,
    qualificationBand: score >= 80 ? "strong-internal-fit" : score >= 65 ? "review-fit" : "low-priority",
    outboundAllowed: false,
    requiredApprover: "CEO",
    auditHash: createAuditHash({ profileId: profile.id, score })
  };
}

export function authorizeCapitalAction(action: string) {
  const prohibited = /contact|send|share|grant|valuation|negotiate|projection|commit|term sheet|data-room access/i.test(action);

  return {
    action,
    decision: prohibited ? "deny" : "require-ceo-review",
    outboundAllowed: false,
    ceoApprovalRequired: true,
    reason: prohibited
      ? "Capital Intelligence cannot contact investors, share files, grant access, discuss valuation, negotiate, project, or commit."
      : "Research, scoring, analysis, and drafting remain internal until explicit CEO approval.",
    auditHash: createAuditHash({ action, prohibited })
  };
}

export function getCapitalIntelligenceSummary() {
  const vitality = getCapitalVitalitySummary();
  return {
    service: "scrimed-capital-intelligence-copilot",
    status: "internal-research-and-drafting-only",
    profiles: capitalIntelligenceProfiles.map((profile) => ({ ...profile, score: scoreCapitalProfile(profile) })),
    engagementHistorySchema: ["profileId", "eventType", "occurredAt", "approvedBy", "evidenceHash"],
    pitchDeckEngagementSchema: ["artifactId", "viewerClass", "pageRange", "durationBand", "consentStatus"],
    dataRoomAccessEventSchema: ["requestId", "recipient", "scope", "approver", "expiry", "revokedAt"],
    outboundPolicy: authorizeCapitalAction("send investor memo"),
    capitalVitalityStatus: vitality.status,
    noSecuritiesRepresentation: true,
    boundary: "Internal research, qualification, analysis, and draft preparation only. All outbound activity requires CEO approval."
  };
}
