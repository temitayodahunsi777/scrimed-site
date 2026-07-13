create or replace function public.record_execution_attempt_envelope(
  p_workspace_slug text,
  p_envelope jsonb,
  p_region text default 'us',
  p_retention_until timestamptz default null
)
returns jsonb
language sql
volatile
security definer
set search_path = ''
as $$
  select private.record_execution_attempt_envelope(
    p_workspace_slug,
    p_envelope,
    p_region,
    p_retention_until
  );
$$;

create or replace function public.replay_execution_attempt_envelope(
  p_workspace_slug text,
  p_idempotency_key text default null,
  p_replay_token text default null
)
returns jsonb
language sql
volatile
security definer
set search_path = ''
as $$
  select private.replay_execution_attempt_envelope(
    p_workspace_slug,
    p_idempotency_key,
    p_replay_token
  );
$$;

create or replace function public.record_execution_attempt_review_disposition(
  p_workspace_slug text,
  p_attempt_id text,
  p_disposition text,
  p_reviewer_role text,
  p_reason_code text,
  p_review_note text,
  p_attestation text,
  p_event_metadata jsonb default '{}'::jsonb
)
returns jsonb
language sql
volatile
security definer
set search_path = ''
as $$
  select private.record_execution_attempt_review_disposition(
    p_workspace_slug,
    p_attempt_id,
    p_disposition,
    p_reviewer_role,
    p_reason_code,
    p_review_note,
    p_attestation,
    p_event_metadata
  );
$$;

revoke all on function private.record_execution_attempt_envelope(text, jsonb, text, timestamptz)
  from public, anon, authenticated, service_role;
revoke all on function private.replay_execution_attempt_envelope(text, text, text)
  from public, anon, authenticated, service_role;
revoke all on function private.record_execution_attempt_review_disposition(text, text, text, text, text, text, text, jsonb)
  from public, anon, authenticated, service_role;

revoke all on function public.record_execution_attempt_envelope(text, jsonb, text, timestamptz)
  from public, anon, authenticated, service_role;
revoke all on function public.replay_execution_attempt_envelope(text, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.record_execution_attempt_review_disposition(text, text, text, text, text, text, text, jsonb)
  from public, anon, authenticated, service_role;

grant execute on function public.record_execution_attempt_envelope(text, jsonb, text, timestamptz)
  to authenticated;
grant execute on function public.replay_execution_attempt_envelope(text, text, text)
  to authenticated;
grant execute on function public.record_execution_attempt_review_disposition(text, text, text, text, text, text, text, jsonb)
  to authenticated;
