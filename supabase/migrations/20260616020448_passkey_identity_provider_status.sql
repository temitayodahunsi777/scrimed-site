-- Align tenant identity readiness with Supabase passkey-enabled product flows.
do $$
declare
  identity_constraint_name text;
begin
  select constraint_name
  into identity_constraint_name
  from information_schema.constraint_column_usage
  where table_schema = 'public'
    and table_name = 'pilot_tenants'
    and column_name = 'identity_provider_status'
  limit 1;

  if identity_constraint_name is not null then
    execute format('alter table public.pilot_tenants drop constraint %I', identity_constraint_name);
  end if;
end;
$$;

alter table public.pilot_tenants
  alter column identity_provider_status set default 'passkey-or-magic-link',
  add constraint pilot_tenants_identity_provider_status_check
    check (identity_provider_status in (
      'passkey-or-magic-link',
      'passwordless-magic-link',
      'sso-readiness',
      'sso-configured'
    ));

update public.pilot_tenants
set identity_provider_status = 'passkey-or-magic-link'
where identity_provider_status = 'passwordless-magic-link';

create or replace function private.update_tenant_identity_readiness(
  p_workspace_slug text,
  p_identity_provider_status text,
  p_sso_provider text,
  p_sso_domain text,
  p_notes text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  clean_status text;
  clean_provider text;
  clean_domain text;
  clean_notes text;
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin']
  );

  clean_status := trim(coalesce(p_identity_provider_status, ''));
  clean_provider := trim(coalesce(p_sso_provider, ''));
  clean_domain := lower(trim(coalesce(p_sso_domain, '')));
  clean_notes := trim(coalesce(p_notes, ''));

  if clean_status not in (
      'passkey-or-magic-link',
      'passwordless-magic-link',
      'sso-readiness',
      'sso-configured'
    )
    or char_length(clean_provider) > 120
    or char_length(clean_domain) > 160
    or char_length(clean_notes) > 700
    or (clean_domain <> '' and clean_domain !~* '^[A-Z0-9.-]+\.[A-Z]{2,}$') then
    raise exception 'tenant-access-invalid-identity-readiness';
  end if;

  perform private.reject_prohibited_identity_text(concat_ws(' ', clean_provider, clean_domain, clean_notes));

  update public.pilot_tenants
  set
    identity_provider_status = clean_status,
    sso_provider = clean_provider,
    sso_domain = clean_domain,
    sso_readiness_notes = clean_notes,
    sso_updated_at = now(),
    sso_updated_by = (select auth.uid())
  where id = selected_workspace.tenant_id;

  insert into private.pilot_identity_lifecycle_events (
    tenant_id,
    workspace_id,
    actor_user_id,
    event_type,
    event_metadata
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    (select auth.uid()),
    'sso-readiness-updated',
    jsonb_build_object(
      'providerStatus', clean_status,
      'ssoProviderPresent', clean_provider <> '',
      'ssoDomainPresent', clean_domain <> '',
      'notesPresent', clean_notes <> '',
      'syntheticPilotBoundary', true
    )
  );

  return jsonb_build_object(
    'providerStatus', clean_status,
    'ssoProvider', clean_provider,
    'ssoDomain', clean_domain,
    'updatedAt', now()
  );
end;
$$;
