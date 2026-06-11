create index if not exists trustos_decisions_created_by_idx
  on public.trustos_decisions(created_by);

create index if not exists trustos_review_events_actor_user_id_idx
  on public.trustos_review_events(actor_user_id);
