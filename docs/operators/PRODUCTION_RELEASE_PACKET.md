# p.34 Production Release Packet

Status: `PRODUCTION_AUTHORIZATION_REQUIRED`; current release state ceiling is `EXACT_REVIEW_REQUIRED`.

No production release may run until a separately authenticated authorization names the exact candidate, environment, window, allowed services, migration decision, rollback owner, monitoring plan, expiry, and every required external approval.

Mandatory prerequisites include exact-candidate technical review, intended-use review, applicable clinical/legal/privacy/security review, fresh AAL2 evidence, approved migration evidence, production credentials held outside the repository, a tested rollback, and customer-specific authorization where applicable.

The deployment command must remain inaccessible until those prerequisites validate. Post-deployment smoke and customer go-live evidence cannot exist before an authorized deployment. No form, template, synthetic test, or AI review can substitute for these actions.
