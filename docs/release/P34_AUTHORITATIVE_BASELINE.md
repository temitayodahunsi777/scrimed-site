# p.34 Authoritative Baseline

Verified before the gap-closure branch was created on 2026-08-21.

| Item | Exact value |
| --- | --- |
| Preserved branch | `agent/scrimed-clinical-ops-p34` |
| Commit | `72c44bed5bc4550464bbf8a6ece648403ed7da4e` |
| Tree | `5615ba2af1e8596bd88afc6faa5f476088840c04` |
| Candidate fingerprint | `8526df4107d04b6ebb3387c1fb446b7d8e612fb656dd9949ddd274539f6c9577` |
| Source fingerprint | `8144b81702a3574086b2b04a2f588d09524a501547c989ad46305d41740aacc6` |
| Investor artifact fingerprint | `b042b32834de48bceb337d8b33fe14242ca7bff8869722ca41e096b75999b4b9` |
| Validation fingerprint | `08a3249d589161945d18d39e3f1b667d217ce13cebf177a6dc42f29c5be84bc8` |
| Review packet fingerprint | `9c437a3938e257a883d07fcc0e74ac8cfbc7f8e97b9e1ff860d15ba59910baba` |
| Gate packet fingerprint | `cb3c55b2ea7816bb7dfb9662e55111432b70671e1021a871b47ccfc4584b2969` |
| SBOM fingerprint | `fe917546c3220ca1d855fa8ce843d9df242dc657668f34f6e2eb480ba3adc33b` |
| Worktree | clean |
| Gate-evidence expiry | `2026-08-22T05:11:03.000Z` |

The baseline p.34 suites reproduced before source changes: adaptive policy 40/40, workflow policy 27/27, clinical OS policy 42/42, adaptive contract 67/67, clinical OS contract 66/66, and artifact integrity 2/2.

## Branch Decision

The preserved candidate was already packaged for independent review. Gap closure therefore continues on `agent/scrimed-p34-gap-closure`, created at the exact baseline commit. Any source mutation on the gap-closure branch invalidates the baseline candidate, source, validation, review, gate, and SBOM fingerprints for that new branch. Those values must be regenerated after its attributable commit.

Expired or candidate-mismatched evidence cannot satisfy a gate. Regeneration order is candidate manifest, validation packet, security evidence, review packet, and gate packet. No prior review transfers automatically.

No push, merge, preview deployment, production deployment, migration, provider call, PHI processing, customer activation, or external distribution was performed while establishing this baseline.
