
create table public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  url text not null,
  label text,
  style text default 'logo',
  created_at timestamptz default now()
);

alter table public.qr_codes enable row level security;

create policy "Users can view own qr codes" on public.qr_codes
  for select to authenticated using (auth.uid() = user_id);

create policy "Users can insert own qr codes" on public.qr_codes
  for insert to authenticated with check (auth.uid() = user_id);

create policy "Users can delete own qr codes" on public.qr_codes
  for delete to authenticated using (auth.uid() = user_id);
