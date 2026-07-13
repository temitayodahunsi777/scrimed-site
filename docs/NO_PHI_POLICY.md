# SCRIMED No-PHI Policy

SCRIMED public demos, contract tests, smoke tests, pages, and readiness APIs must remain no-PHI unless a future qualified approval path explicitly changes the boundary.

## Prohibited In Source and Tests

- Patient identifiers.
- MRNs, member IDs, subscriber IDs, or policy IDs.
- Real names tied to patient context.
- Dates of birth.
- Real phone numbers or emails tied to patient context.
- Raw chart text.
- Production connector payloads.
- Secrets, bearer tokens, Supabase service keys, OpenAI keys, or credentials.

## Required Handling

- Use synthetic fixtures only.
- Keep `.env.local` gitignored.
- Supply tokens only through local environment or secure prompt flow.
- Redact token-like values in logs.
- Fail closed for unauthenticated, invalid, unauthorized, PHI-like, or protected-action requests.

NO-GO: no-PHI readiness does not create HIPAA compliance, BAA coverage, live patient-care authority, connector approval, or clinical production approval.
