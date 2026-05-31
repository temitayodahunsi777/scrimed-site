import {
  getWorkflowExecutionReadinessBySlug,
  workflowExecutions
} from "./workflowExecutions";
import { validateWorkflowResultBySlug } from "./workflowResultValidation";

export type WorkflowPromotionReviewStatus =
  | "approved-for-synthetic-staging"
  | "attention-required";

export type WorkflowPromotionReview = {
  id: string;
  workflowSlug: string;
  workflowRoute: string;
  status: WorkflowPromotionReviewStatus;
  reviewerRole: string;
  approvalScope: string;
  reviewNote: string;
  requiredBeforePromotion: string[];
  blockedActions: string[];
};

export function getWorkflowPromotionReviews(): WorkflowPromotionReview[] {
  return workflowExecutions.map((workflow) => {
    const readiness = getWorkflowExecutionReadinessBySlug(workflow.slug);
    const resultValidation = validateWorkflowResultBySlug(workflow.slug);
    const approved =
      readiness?.status === "synthetic-ready" && resultValidation?.status === "pass";

    return {
      id: `workflow-promotion-review-${workflow.slug}`,
      workflowSlug: workflow.slug,
      workflowRoute: workflow.route,
      status: approved ? "approved-for-synthetic-staging" : "attention-required",
      reviewerRole: "workflow owner, clinical governance reviewer, and integration architect",
      approvalScope:
        "Synthetic-only staging approval for governed workflow readiness, result fixture validation, and blocked-action retention.",
      reviewNote: approved
        ? "Workflow is approved for synthetic staging only; live automation remains blocked until connector, privacy, and production promotion gates are complete."
        : "Workflow requires readiness or result validation repair before synthetic staging approval.",
      requiredBeforePromotion: [
        "result validation remains passing",
        "fixture fingerprints remain approved",
        "human review role remains explicit",
        "production connector boundary is reviewed",
        "privacy and security approval is recorded"
      ],
      blockedActions: workflow.prohibitedActions
    };
  });
}

export function getWorkflowPromotionReviewBySlug(slug: string) {
  return getWorkflowPromotionReviews().find((review) => review.workflowSlug === slug);
}

export function getWorkflowPromotionReviewSummary() {
  const reviews = getWorkflowPromotionReviews();
  const approved = reviews.filter(
    (review) => review.status === "approved-for-synthetic-staging"
  ).length;
  const attentionRequired = reviews.length - approved;

  return {
    service: "scrimed-workflow-promotion-review",
    status: attentionRequired === 0 ? "pass" : "attention-required",
    reviewCount: reviews.length,
    approved,
    attentionRequired,
    reviews,
    updated: "2026-05-31"
  };
}
