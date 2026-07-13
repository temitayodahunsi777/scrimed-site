# Contributing to SCRIMED

SCRIMED is developed with parallel AI-assisted workstreams. Treat every change as healthcare-adjacent, security-sensitive, and reviewable.

## Worktree-Friendly Development

- Keep changes scoped to the feature or safety layer you are touching.
- Do not revert unrelated dirty files. They may belong to another active worktree or agent.
- Run targeted smokes before broad validation.
- Clean generated output with `npm run clean:generated` after builds.
- Never commit `.env.local`, tokens, Supabase keys, service role keys, OpenAI keys, credentials, patient data, or raw connector payloads.

## Safety Boundaries

Do not introduce live PHI, autonomous diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, production connector activation, certification claims, clinical validation claims, or customer go-live approval.

High-risk actions require human approval and retained evidence.

## Recommended Local Validation

```bash
npm run smoke:scrimed-intelligence-safety-stack
npm run test:nonsecret
npm run typecheck
npm run lint
npm run build
git diff --check
```

## AI Reviewer Profiles

GitHub Copilot custom-agent profiles live in `.github/agents/`:

- `security-auditor.md`
- `clinical-safety-reviewer.md`
- `fhir-integration-engineer.md`
- `ai-evaluation-engineer.md`
- `compliance-reviewer.md`

Use them to split review across security, clinical safety, interoperability, evaluation, and compliance lanes.
