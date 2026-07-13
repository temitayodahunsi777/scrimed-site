# SCRIMED Safety Boundaries

SCRIMED uses a centralized safety governance gate in `app/lib/scrimedSafetyGovernance.ts`.

## Allowed Today

- Synthetic evaluation.
- Demo workflows.
- Clinical Robustness Lab work.
- Audit preparation.
- Investor and buyer diligence.
- Internal no-secret testing.

## Blocked Today

- Live PHI.
- Clinical diagnosis.
- Treatment recommendations.
- Prescribing.
- Patient outreach.
- Payer submission.
- EHR writeback.
- Production connector approval.
- Certification or clinical validation claims.

These blocked actions are SCRIMED's current NO-GO boundary.

Every sensitive API must remain inside the no-PHI, synthetic, human-reviewed boundary. Blocked workflows should fail closed with a safe response and no secret, token, credential, PHI, or production connector payload in logs or fixtures.
