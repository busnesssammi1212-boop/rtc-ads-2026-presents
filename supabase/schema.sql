-- Supabase > SQL Editor-এ পুরোটা paste করে Run করুন

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  balance numeric(14,4) not null default 0 check (balance >= 0),   -- BDT
  total_earned numeric(14,4) not null default 0,
  is_admin boolean not null default false,
  is_blocked boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.wallet_transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('adgem_reward','adgem_reversal','withdraw','withdraw_refund')),
  amount numeric(14,4) not null,
  ref text,
  meta jsonb,
  created_at timestamptz not null default now(),
  unique (kind, ref)  -- একই postback দুইবার এলে দ্বিতীয়টা আটকাবে
);

create table public.adgem_events (
  id bigint generated always as identity primary key,
  transaction_id text unique,
  player_id text,
  payout_usd numeric(14,6),
  raw jsonb,
  created_at timestamptz not null default now()
);

create table public.withdrawals (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id),
  amount numeric(14,2) not null check (amount > 0),
  method text not null check (method in ('bkash','nagad','rocket')),
  account_no text not null,
  status text not null default 'pending' check (status in ('pending','paid','rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.adgem_events enable row level security;
alter table public.withdrawals enable row level security;

-- user শুধু নিজের data পড়তে পারবে। insert/update policy ইচ্ছা করেই নেই:
-- সব লেখা হবে শুধু server (service role) থেকে।
create policy "own profile read" on public.profiles for select using (auth.uid() = id);
create policy "own tx read" on public.wallet_transactions for select using (auth.uid() = user_id);
create policy "own withdrawals read" on public.withdrawals for select using (auth.uid() = user_id);

create function public.credit_adgem(p_user uuid, p_tx text, p_amount numeric, p_meta jsonb)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  insert into wallet_transactions(user_id, kind, amount, ref, meta)
  values (p_user, 'adgem_reward', p_amount, p_tx, p_meta);
  update profiles set balance = balance + p_amount, total_earned = total_earned + p_amount
  where id = p_user;
  return true;
exception when unique_violation then
  return false;
end $$;

create function public.reverse_adgem(p_user uuid, p_tx text, p_amount numeric, p_meta jsonb)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  insert into wallet_transactions(user_id, kind, amount, ref, meta)
  values (p_user, 'adgem_reversal', -p_amount, p_tx, p_meta);
  update profiles set balance = greatest(balance - p_amount, 0) where id = p_user;
  return true;
exception when unique_violation then
  return false;
end $$;

create function public.request_withdraw(p_user uuid, p_amount numeric, p_method text, p_account text, p_min numeric)
returns bigint language plpgsql security definer set search_path = public as $$
declare wid bigint; bal numeric; blocked boolean;
begin
  select balance, is_blocked into bal, blocked from profiles where id = p_user for update;
  if blocked then raise exception 'account blocked'; end if;
  if p_amount < p_min then raise exception 'below minimum'; end if;
  if bal < p_amount then raise exception 'insufficient balance'; end if;
  update profiles set balance = balance - p_amount where id = p_user;
  insert into withdrawals(user_id, amount, method, account_no)
  values (p_user, p_amount, p_method, p_account) returning id into wid;
  insert into wallet_transactions(user_id, kind, amount, ref)
  values (p_user, 'withdraw', -p_amount, wid::text);
  return wid;
end $$;

create function public.process_withdraw(p_id bigint, p_status text, p_note text)
returns void language plpgsql security definer set search_path = public as $$
declare w withdrawals;
begin
  select * into w from withdrawals where id = p_id and status = 'pending' for update;
  if not found then raise exception 'not pending'; end if;
  update withdrawals set status = p_status, admin_note = p_note, processed_at = now() where id = p_id;
  if p_status = 'rejected' then
    update profiles set balance = balance + w.amount where id = w.user_id;
    insert into wallet_transactions(user_id, kind, amount, ref)
    values (w.user_id, 'withdraw_refund', w.amount, p_id::text);
  end if;
end $$;

-- এই function-গুলো browser থেকে ডাকা যাবে না, শুধু service role পারবে
revoke all on function public.credit_adgem(uuid,text,numeric,jsonb) from public, anon, authenticated;
revoke all on function public.reverse_adgem(uuid,text,numeric,jsonb) from public, anon, authenticated;
revoke all on function public.request_withdraw(uuid,numeric,text,text,numeric) from public, anon, authenticated;
revoke all on function public.process_withdraw(bigint,text,text) from public, anon, authenticated;

-- signup করার পর নিজেকে admin বানান (email বদলে নিন):
-- update public.profiles set is_admin = true where email = 'you@example.com';
