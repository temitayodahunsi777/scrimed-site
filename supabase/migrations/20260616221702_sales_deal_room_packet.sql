alter table private.pilot_intake_submissions
  add column if not exists last_buyer_deal_room_packet_at timestamptz;

alter table private.sales_opportunity_audit_events
  drop constraint if exists sales_opportunity_audit_events_event_type_check;

alter table private.sales_opportunity_audit_events
  add constraint sales_opportunity_audit_events_event_type_check check (
    event_type in (
      'opportunity-updated',
      'proposal-downloaded',
      'crm-sync-recorded',
      'crm-export-downloaded',
      'follow-up-draft-downloaded',
      'follow-up-completed',
      'assessment-invitation-downloaded',
      'attribution-analytics-packet-downloaded',
      'buyer-deal-room-packet-downloaded'
    )
  );

create or replace function private.sales_opportunity_json(
  opportunity private.pilot_intake_submissions
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  return jsonb_build_object(
    'intakeId', opportunity.intake_id,
    'receivedAt', opportunity.received_at,
    'pipelineStage', opportunity.pipeline_stage,
    'assignedOwner', opportunity.assigned_owner,
    'nextAction', opportunity.next_action,
    'nextActionDueAt', opportunity.next_action_due_at,
    'nextActionCompletedAt', opportunity.next_action_completed_at,
    'updatedAt', opportunity.updated_at,
    'updatedBy', opportunity.updated_by,
    'lastCrmSyncAt', opportunity.last_crm_sync_at,
    'lastCrmSyncStatus', opportunity.last_crm_sync_status,
    'lastCrmSyncDetail', opportunity.last_crm_sync_detail,
    'lastCrmExportAt', opportunity.last_crm_export_at,
    'lastAttributionAnalyticsPacketAt', opportunity.last_attribution_analytics_packet_at,
    'lastBuyerDealRoomPacketAt', opportunity.last_buyer_deal_room_packet_at,
    'assessmentStartAt', opportunity.assessment_start_at,
    'assessmentDurationMinutes', opportunity.assessment_duration_minutes,
    'assessmentMeetingUrl', opportunity.assessment_meeting_url,
    'assessmentStatus', opportunity.assessment_status,
    'retentionUntil', opportunity.retention_until,
    'payload', opportunity.payload
  );
end;
$$;

create or replace function private.record_sales_artifact_download(
  p_intake_id text,
  p_event_type text,
  p_event_metadata jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_tenant_id uuid;
  created_event_id uuid;
begin
  target_tenant_id := private.require_sales_tenant_admin();
  perform private.require_sales_server_token();

  if p_event_type not in (
    'crm-export-downloaded',
    'follow-up-draft-downloaded',
    'attribution-analytics-packet-downloaded',
    'buyer-deal-room-packet-downloaded'
  ) then
    raise exception 'invalid-sales-artifact-event';
  end if;

  if jsonb_typeof(coalesce(p_event_metadata, '{}'::jsonb)) <> 'object' then
    raise exception 'invalid-sales-artifact-metadata';
  end if;

  if not exists (
    select 1 from private.pilot_intake_submissions
    where tenant_id = target_tenant_id and intake_id = p_intake_id
  ) then
    raise exception 'sales-opportunity-not-found';
  end if;

  if p_event_type = 'crm-export-downloaded' then
    update private.pilot_intake_submissions
    set last_crm_export_at = now(),
        updated_at = now(),
        updated_by = (select auth.uid())
    where tenant_id = target_tenant_id and intake_id = p_intake_id;
  end if;

  if p_event_type = 'attribution-analytics-packet-downloaded' then
    update private.pilot_intake_submissions
    set last_attribution_analytics_packet_at = now(),
        updated_at = now(),
        updated_by = (select auth.uid())
    where tenant_id = target_tenant_id and intake_id = p_intake_id;
  end if;

  if p_event_type = 'buyer-deal-room-packet-downloaded' then
    update private.pilot_intake_submissions
    set last_buyer_deal_room_packet_at = now(),
        updated_at = now(),
        updated_by = (select auth.uid())
    where tenant_id = target_tenant_id and intake_id = p_intake_id;
  end if;

  insert into private.sales_opportunity_audit_events (
    tenant_id, intake_id, actor_user_id, event_type, event_metadata
  )
  values (
    target_tenant_id,
    p_intake_id,
    (select auth.uid()),
    p_event_type,
    coalesce(p_event_metadata, '{}'::jsonb)
  )
  returning id into created_event_id;

  return created_event_id;
end;
$$;

revoke all on function private.record_sales_artifact_download(text, text, jsonb)
  from public, anon, authenticated, service_role;
grant execute on function private.record_sales_artifact_download(text, text, jsonb)
  to authenticated;

comment on column private.pilot_intake_submissions.last_buyer_deal_room_packet_at is
  'Timestamp of the latest tenant-admin audited Pilot Deal Room packet download for no-PHI sales opportunity diligence.';

comment on function private.record_sales_artifact_download(text, text, jsonb) is
  'Records tenant-scoped no-PHI sales artifact downloads, including Pilot Deal Room packet releases, after tenant-admin AAL2 and server-token checks.';
