drop policy if exists pilot_membership_audit_events_deny_all
  on private.pilot_membership_audit_events;
create policy pilot_membership_audit_events_deny_all
on private.pilot_membership_audit_events
as restrictive
for all
to public
using (false)
with check (false);

comment on policy pilot_membership_audit_events_deny_all
  on private.pilot_membership_audit_events is
  'Explicitly denies direct runtime access. Approved tenant-admin access is available only through governed security-definer functions.';
