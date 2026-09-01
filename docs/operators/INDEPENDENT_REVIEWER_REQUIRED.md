# Independent Reviewer Required

Status: **EXACT_REVIEW_REQUIRED**

## Exact Review Target

- Pull request: `https://github.com/temitayodahunsi777/scrimed-site/pull/40`
- Branch: `agent/scrimed-p34-post-review-readiness`
- Commit: `a7cfd5d4ad851199261d001a51aabba012aab93b`
- Tree: `7ecdee2198416f99e9ca62ce51247ca02bcd5296`
- Candidate: `31cfd44e50345caecf852bbb0a9b431543fd8fc8ecc975fde9594a0105e35aee`
- Source: `ca61a20b36e81c5429fdf83986e946f9f456a08120aeab7fab751f70364587d7`
- Validation: `bfe3dbb4f22551c0aa4a8c43483cd204f8db8f2291217a84915f39db0c52953c`
- Review packet: `d3b86011b20210174c30c0a10c5a1a856845443fb99dd000b4c9aa977bf8476a`
- Gate packet: `b87ab58d852c95510e06cc716378f38a4def20ef4590497e521bb3a22575f42a`
- SBOM: `3add86d32bb65bdbdc163bb76975d2cfd5f4a26dba8888622fe0ca64fc49e52f`

PR #39 is predecessor evidence. It must not be mistaken for the current exact-head approval target.

## Reviewer Criteria

The reviewer must be a real person distinct from the change author and able to inspect the code and
GitHub checks. They should be technically competent to assess the changed TypeScript/Next.js
controls, authorization boundaries, synthetic-pilot behavior, release evidence, and the identified
security and privacy risks. A professional certification is not required for this engineering gate.
Separate clinical, legal, privacy, security, migration, deployment, and customer approvals remain
required where their scopes apply.

Self-review, founder acceptance, an issue or PR comment, generated evidence, and automated Codex
comments do not satisfy this gate.

## Ten-Minute Review Path

1. Confirm PR #40 still has the exact commit and tree above. Stop if either differs.
2. Read `docs/review/P34_FINAL_EXACT_HEAD_REVIEW_BRIEF.md` and
   `docs/review/P40_CURRENT_EXACT_HEAD_REVIEW_BRIEF.md`.
3. Inspect CRITICAL and HIGH entries in `artifacts/review/p40-current-risk-map.json`.
4. Confirm the candidate manifest binds the candidate, source, validation, review, gate, SBOM,
   security, route, render, preview, migration, and AAL2 state to the same exact source tree.
5. Confirm the autonomy ceiling remains synthetic/no-PHI and that clinical, payer, EHR/device,
   production, migration, protected-pilot, and customer actions remain denied.
6. Inspect tenant isolation, approval replay, idempotency, passwordless controls, AAL2 enforcement,
   provider-offline behavior, and evidence-tamper tests.
7. Inspect the exact Vercel preview evidence and confirm that acceptance grants no production alias.
8. Submit one attributable GitHub pull-request review.

## Expected Decision Format

Use GitHub **Review changes**, not a comment-only response:

- **Approve** with body `APPROVE_EXACT_HEAD` when the exact target is acceptable.
- **Request changes** with body `REQUEST_CHANGES` and concrete findings when remediation is needed.
- Do not approve if the head changed, evidence is stale, a high-risk boundary is unclear, or the
  reviewer cannot complete the review.

An approval changes only the engineering review state to `APPROVED_EXACT_HEAD`. It grants no merge,
migration, production, PHI, clinical, payer, EHR/device, protected-pilot, customer, contract,
certification, compliance, or external-distribution authority.
