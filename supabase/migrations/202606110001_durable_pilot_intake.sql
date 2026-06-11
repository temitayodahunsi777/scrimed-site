create table if not exists private.pilot_intake_credentials (
  singleton boolean primary key default true check (singleton),
  token_hash text not null check (token_hash ~ '^[a-f0-9]{64}$'),
  updated_at timestamptz not null default now()
);

create table if not exists private.pilot_intake_submissions (
  id uuid primary key default gen_random_uuid(),
  intake_id text not null unique check (char_length(intake_id) between 20 and 100),
  received_at timestamptz not null,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  status text not null default 'new' check (status in ('new', 'reviewing', 'routed', 'closed')),
  retention_until timestamptz not null default (now() + interval '180 days'),
  created_at timestamptz not null default now()
);

create index if not exists pilot_intake_submissions_status_created_at_idx
  on private.pilot_intake_submissions(status, created_at desc);
create index if not exists pilot_intake_submissions_retention_until_idx
  on private.pilot_intake_submissions(retention_until);

alter table private.pilot_intake_credentials enable row level security;
alter table private.pilot_intake_submissions enable row level security;

revoke all on private.pilot_intake_credentials from public, anon, authenticated;
revoke all on private.pilot_intake_submissions from public, anon, authenticated;

create or replace function private.record_pilot_intake_submission(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_headers jsonb;
  supplied_token text;
  expected_hash text;
  created_submission_id uuid;
begin
  request_headers := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
  supplied_token := coalesce(request_headers ->> 'x-scrimed-intake-token', '');

  select credential.token_hash
  into expected_hash
  from private.pilot_intake_credentials credential
  where credential.singleton = true;

  if expected_hash is null
    or supplied_token = ''
    or encode(extensions.digest(supplied_token, 'sha256'), 'hex') <> expected_hash then
    raise exception 'pilot-intake-persistence-not-authorized';
  end if;

  if jsonb_typeof(p_payload) <> 'object'
    or char_length(coalesce(p_payload ->> 'intakeId', '')) not between 20 and 100
    or coalesce(p_payload #>> '{contact,workEmail}', '') = ''
    or coalesce(p_payload ->> 'boundary', '') = '' then
    raise exception 'invalid-pilot-intake-payload';
  end if;

  insert into private.pilot_intake_submissions (
    intake_id,
    received_at,
    payload
  )
  values (
    p_payload ->> 'intakeId',
    (p_payload ->> 'receivedAt')::timestamptz,
    p_payload
  )
  returning id into created_submission_id;

  return created_submission_id;
end;
$$;

revoke all on function private.record_pilot_intake_submission(jsonb) from public;
grant usage on schema private to anon, authenticated;
grant execute on function private.record_pilot_intake_submission(jsonb) to anon, authenticated;

create or replace function public.record_pilot_intake_submission(p_payload jsonb)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_pilot_intake_submission(p_payload);
$$;

revoke all on function public.record_pilot_intake_submission(jsonb) from public;
grant execute on function public.record_pilot_intake_submission(jsonb) to anon, authenticated;

comment on table private.pilot_intake_submissions is
  'Durable no-PHI enterprise pilot intake ledger. Direct Data API access is prohibited.';
