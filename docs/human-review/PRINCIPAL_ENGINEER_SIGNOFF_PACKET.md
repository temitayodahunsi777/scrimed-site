# Principal Engineer Sign-Off Packet

- **Decision:** Accept or reject technical architecture and candidate integrity for review.
- **Why needed:** Accountable engineering judgment cannot be supplied by the implementation agent.
- **Candidate fingerprint:** `[FINAL 64-HEX; current dirty worktree has none]`
- **Scope:** typed contracts, API/data compatibility, agent/model controls, tests, rollback.
- **Evidence:** source/review packets, typecheck/lint/build/nonsecret results, generated integrity,
  adversarial completeness and operational reviews.
- **Residual risks:** executable external checks and specialist approvals remain separate.
- **Recommended disposition:** APPROVE FOR SYNTHETIC PREVIEW REVIEW after clean candidate and all
  local checks pass; not production approval.
- **Conditions:** no hidden test exclusions; resolve high findings; rerun on any source change.
- **Approval text:** “I approve candidate [fingerprint] for bounded synthetic review only.”
- **Rejection text:** “I reject candidate [fingerprint] for these evidenced defects: ____.”
- **Expiry:** 14 days or any source/toolchain change.
- **Qualification:** Named principal engineer independent of implementation.

Reviewer name: __________ Signature: __________ Date: __________
