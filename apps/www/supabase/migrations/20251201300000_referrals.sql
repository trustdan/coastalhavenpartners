-- Referral System Migration
-- Allows candidates to invite classmates with tracking

-- 1. Add referral_code to profiles table
alter table profiles add column if not exists referral_code text unique;

-- 2. Create function to generate unique referral codes
create or replace function generate_referral_code()
returns text as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Excludes confusing chars (0, O, 1, I)
  code text := '';
  i integer;
begin
  for i in 1..8 loop
    code := code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  end loop;
  return code;
end;
$$ language plpgsql;

-- 3. Create function to assign referral code on profile creation
create or replace function assign_referral_code()
returns trigger as $$
declare
  new_code text;
  attempts integer := 0;
begin
  -- Only assign if not already set
  if new.referral_code is null then
    loop
      new_code := generate_referral_code();
      begin
        new.referral_code := new_code;
        exit;
      exception when unique_violation then
        attempts := attempts + 1;
        if attempts > 10 then
          raise exception 'Could not generate unique referral code';
        end if;
      end;
    end loop;
  end if;
  return new;
end;
$$ language plpgsql;

-- 4. Create trigger for new profiles
drop trigger if exists trigger_assign_referral_code on profiles;
create trigger trigger_assign_referral_code
  before insert on profiles
  for each row
  execute function assign_referral_code();

-- 5. Generate referral codes for existing profiles that don't have one
do $$
declare
  profile_record record;
  new_code text;
  attempts integer;
begin
  for profile_record in select id from profiles where referral_code is null loop
    attempts := 0;
    loop
      new_code := generate_referral_code();
      begin
        update profiles set referral_code = new_code where id = profile_record.id;
        exit;
      exception when unique_violation then
        attempts := attempts + 1;
        if attempts > 10 then
          raise exception 'Could not generate unique referral code for profile %', profile_record.id;
        end if;
      end;
    end loop;
  end loop;
end;
$$;

-- 6. Create referral status enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'referral_status') then
    create type referral_status as enum ('pending', 'signed_up', 'verified');
  end if;
end;
$$;

-- 7. Create referrals table
create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references profiles(id) on delete cascade,
  referred_email text not null,
  referred_user_id uuid references profiles(id) on delete set null,
  status referral_status default 'pending',
  signed_up_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz default now(),

  -- Each email can only be referred once per referrer
  unique(referrer_id, referred_email)
);

-- 8. Create index for faster lookups
create index if not exists idx_referrals_referrer_id on referrals(referrer_id);
create index if not exists idx_referrals_referred_email on referrals(referred_email);
create index if not exists idx_referrals_referred_user_id on referrals(referred_user_id);
create index if not exists idx_profiles_referral_code on profiles(referral_code);

-- 9. Enable RLS
alter table referrals enable row level security;

-- 10. RLS Policies for referrals

-- Users can view their own referrals (as referrer)
create policy "Users can view own referrals"
  on referrals
  for select
  using (referrer_id = auth.uid());

-- Users can insert referrals where they are the referrer
create policy "Users can create referrals"
  on referrals
  for insert
  with check (referrer_id = auth.uid());

-- Users can view referrals where they are the referred user
create policy "Users can view referrals about them"
  on referrals
  for select
  using (referred_user_id = auth.uid());

-- Admins can view all referrals
create policy "Admins can view all referrals"
  on referrals
  for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Admins can update referrals
create policy "Admins can update referrals"
  on referrals
  for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- 11. Function to link referral when user signs up
create or replace function link_referral_on_signup()
returns trigger as $$
begin
  -- Update any pending referrals for this email
  update referrals
  set
    referred_user_id = new.id,
    status = 'signed_up',
    signed_up_at = now()
  where
    referred_email = new.email
    and status = 'pending';

  return new;
end;
$$ language plpgsql security definer;

-- 12. Trigger to link referral on profile creation
drop trigger if exists trigger_link_referral_on_signup on profiles;
create trigger trigger_link_referral_on_signup
  after insert on profiles
  for each row
  execute function link_referral_on_signup();

-- 13. Function to mark referral as verified when candidate is verified
create or replace function link_referral_on_verification()
returns trigger as $$
begin
  -- When a candidate is verified, update their referral status
  if new.status = 'verified' and (old.status is null or old.status != 'verified') then
    update referrals
    set
      status = 'verified',
      verified_at = now()
    where
      referred_user_id = new.user_id
      and status = 'signed_up';
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- 14. Trigger on candidate_profiles for verification
drop trigger if exists trigger_link_referral_on_verification on candidate_profiles;
create trigger trigger_link_referral_on_verification
  after update on candidate_profiles
  for each row
  execute function link_referral_on_verification();

-- 15. Helper function to get referral stats for a user
create or replace function get_referral_stats(user_id uuid)
returns json as $$
declare
  result json;
begin
  select json_build_object(
    'total_referrals', count(*),
    'pending', count(*) filter (where status = 'pending'),
    'signed_up', count(*) filter (where status = 'signed_up'),
    'verified', count(*) filter (where status = 'verified')
  ) into result
  from referrals
  where referrer_id = user_id;

  return result;
end;
$$ language plpgsql security definer;

-- Grant execute on function
grant execute on function get_referral_stats(uuid) to authenticated;
