-- Recruiter Verification Enhancements
-- Adds domain verification and admin notes functionality

-- Add verification notes for admin to document review decisions
ALTER TABLE recruiter_profiles
ADD COLUMN IF NOT EXISTS verification_notes text;

-- Add email domain verification fields
-- email_domain: extracted from the recruiter's email (e.g., "goldmansachs.com")
-- email_domain_matches_company: whether the email domain matches the company_website domain
ALTER TABLE recruiter_profiles
ADD COLUMN IF NOT EXISTS email_domain text;

ALTER TABLE recruiter_profiles
ADD COLUMN IF NOT EXISTS email_domain_matches_company boolean DEFAULT false;

-- Create a function to extract domain from a URL or email
CREATE OR REPLACE FUNCTION extract_domain(input text)
RETURNS text AS $$
DECLARE
  result text;
BEGIN
  IF input IS NULL THEN
    RETURN NULL;
  END IF;

  -- If it's an email, extract domain after @
  IF input LIKE '%@%' THEN
    result := lower(split_part(input, '@', 2));
  -- If it's a URL, extract the domain
  ELSIF input LIKE 'http%' THEN
    -- Remove protocol
    result := regexp_replace(input, '^https?://(www\.)?', '', 'i');
    -- Take only the domain part (before any path)
    result := lower(split_part(result, '/', 1));
  ELSE
    result := lower(input);
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a function to check if email domain matches company website
CREATE OR REPLACE FUNCTION check_domain_match(email text, website text)
RETURNS boolean AS $$
DECLARE
  email_dom text;
  website_dom text;
BEGIN
  IF email IS NULL OR website IS NULL THEN
    RETURN false;
  END IF;

  email_dom := extract_domain(email);
  website_dom := extract_domain(website);

  -- Direct match
  IF email_dom = website_dom THEN
    RETURN true;
  END IF;

  -- Check if one contains the other (for subdomains like careers.company.com)
  IF email_dom LIKE '%' || website_dom OR website_dom LIKE '%' || email_dom THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a trigger function to auto-populate email_domain when recruiter is created/updated
CREATE OR REPLACE FUNCTION update_recruiter_email_domain()
RETURNS TRIGGER AS $$
DECLARE
  recruiter_email text;
BEGIN
  -- Get email from profiles table
  SELECT email INTO recruiter_email
  FROM profiles
  WHERE id = NEW.user_id;

  -- Set email domain
  NEW.email_domain := extract_domain(recruiter_email);

  -- Check if domain matches company website
  NEW.email_domain_matches_company := check_domain_match(recruiter_email, NEW.company_website);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new recruiter profiles
DROP TRIGGER IF EXISTS trigger_update_recruiter_email_domain ON recruiter_profiles;
CREATE TRIGGER trigger_update_recruiter_email_domain
  BEFORE INSERT OR UPDATE OF company_website ON recruiter_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_recruiter_email_domain();

-- Backfill existing recruiters with email domain info
DO $$
DECLARE
  rec RECORD;
  recruiter_email text;
BEGIN
  FOR rec IN SELECT rp.id, rp.user_id, rp.company_website FROM recruiter_profiles rp LOOP
    -- Get email from profiles
    SELECT email INTO recruiter_email FROM profiles WHERE id = rec.user_id;

    -- Update recruiter profile
    UPDATE recruiter_profiles
    SET
      email_domain = extract_domain(recruiter_email),
      email_domain_matches_company = check_domain_match(recruiter_email, rec.company_website)
    WHERE id = rec.id;
  END LOOP;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN recruiter_profiles.verification_notes IS 'Admin notes about verification decision';
COMMENT ON COLUMN recruiter_profiles.email_domain IS 'Domain extracted from recruiter email for verification';
COMMENT ON COLUMN recruiter_profiles.email_domain_matches_company IS 'Whether email domain matches claimed company website';
