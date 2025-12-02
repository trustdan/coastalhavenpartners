-- Create firms table for public firm profiles
create table firms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  description text,
  culture text,
  website text,
  locations text[],
  firm_type text, -- PE, VC, IB, HF, Consulting, etc.
  hiring_roles text[], -- Array of role types currently hiring
  employee_count text, -- '1-50', '51-200', '201-500', '500+'
  founded_year integer,
  is_visible boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add firm_id to recruiter_profiles to link recruiters to their firm
alter table recruiter_profiles add column firm_id uuid references firms(id) on delete set null;

-- Create index for slug lookups
create index idx_firms_slug on firms(slug);
create index idx_firms_visible on firms(is_visible) where is_visible = true;
create index idx_recruiter_profiles_firm_id on recruiter_profiles(firm_id);

-- RLS policies for firms
alter table firms enable row level security;

-- Anyone can view visible firms
create policy "Anyone can view visible firms"
  on firms for select
  using (is_visible = true);

-- Recruiters can update their own firm
create policy "Recruiters can update their firm"
  on firms for update
  using (
    exists (
      select 1 from recruiter_profiles rp
      where rp.firm_id = firms.id
      and rp.user_id = auth.uid()
      and rp.is_approved = true
    )
  );

-- Admins can manage all firms
create policy "Admins can manage firms"
  on firms for all
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.role = 'admin'
    )
  );

-- Function to generate slug from firm name
create or replace function generate_firm_slug(firm_name text)
returns text as $$
declare
  base_slug text;
  final_slug text;
  counter integer := 0;
begin
  -- Convert to lowercase, replace spaces and special chars with hyphens
  base_slug := lower(regexp_replace(firm_name, '[^a-zA-Z0-9]+', '-', 'g'));
  -- Remove leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);

  final_slug := base_slug;

  -- Check for uniqueness and add counter if needed
  while exists (select 1 from firms where slug = final_slug) loop
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  end loop;

  return final_slug;
end;
$$ language plpgsql;

-- Create firms from existing recruiter profiles (one per unique firm_name)
insert into firms (name, slug, website, locations, firm_type)
select distinct on (firm_name)
  firm_name as name,
  generate_firm_slug(firm_name) as slug,
  company_website as website,
  locations,
  firm_type
from recruiter_profiles
where firm_name is not null
  and is_approved = true
order by firm_name, created_at;

-- Link existing recruiters to their firms
update recruiter_profiles rp
set firm_id = f.id
from firms f
where rp.firm_name = f.name
  and rp.is_approved = true;
