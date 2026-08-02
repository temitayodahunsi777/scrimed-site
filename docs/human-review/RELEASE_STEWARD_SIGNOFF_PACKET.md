# Release Steward Sign-Off Packet

- **Decision:** Admit or reject the exact immutable candidate into the next authorized stage.
- **Why needed:** Promotion must bind source, artifacts, validation, approvals and rollback.
- **Candidate fingerprint:** `[FINAL 64-HEX; current dirty worktree has none]`
- **Scope:** attribution, commit, fingerprints, packets, checks, external gates, preview/migration state.
- **Evidence:** final candidate/review/gate/SBOM/migration packets and worktree report.
- **Residual risks:** all missing professional/operator/production evidence must remain visible.
- **Recommended disposition:** DEFER until clean commit; then admit for named review only if exact
  fingerprints align and every automated check passes.
- **Conditions:** no stale packet, partial approval, self-review, silent fallback, push or deploy.
- **Approval text:** “I admit candidate [fingerprint] to [named stage] only; no broader authority.”
- **Rejection text:** “I reject candidate [fingerprint] from promotion because: ____.”
- **Expiry:** 7 days or any candidate/evidence/environment change.
- **Qualification:** Named release steward independent of implementation and authorized for stage.

Reviewer name: __________ Signature: __________ Date: __________
