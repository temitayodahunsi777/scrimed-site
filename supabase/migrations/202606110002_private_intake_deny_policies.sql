create policy pilot_intake_credentials_deny_direct_access
on private.pilot_intake_credentials
for all
to public
using (false)
with check (false);

create policy pilot_intake_submissions_deny_direct_access
on private.pilot_intake_submissions
for all
to public
using (false)
with check (false);
