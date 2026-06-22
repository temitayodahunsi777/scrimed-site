create index if not exists protected_board_scorecards_secondary_trend_idx
  on public.protected_board_scorecards(secondary_trend_review_id)
  where secondary_trend_review_id is not null;

create index if not exists protected_board_scorecards_tertiary_trend_idx
  on public.protected_board_scorecards(tertiary_trend_review_id)
  where tertiary_trend_review_id is not null;
