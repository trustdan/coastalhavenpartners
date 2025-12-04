-- =============================================
-- JOB LISTINGS FOR JOB BOARD
-- =============================================
-- Allows recruiters to post job listings that candidates can browse and apply to

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE job_listing_status AS ENUM (
  'draft',       -- Not yet visible to candidates
  'active',      -- Visible and accepting applications
  'paused',      -- Temporarily hidden
  'closed',      -- No longer accepting applications
  'filled'       -- Position has been filled
);

CREATE TYPE job_type AS ENUM (
  'full_time',
  'internship',
  'summer_analyst',
  'off_cycle'
);

-- =============================================
-- TABLES
-- =============================================

CREATE TABLE job_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  posted_by UUID NOT NULL REFERENCES recruiter_profiles(id) ON DELETE CASCADE,

  -- Job Details
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  job_type job_type NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  responsibilities TEXT,

  -- Targeting/Filters
  target_roles TEXT[],                    -- e.g., ["Investment Banking", "Private Equity"]
  locations TEXT[],                       -- e.g., ["New York", "Chicago"]
  target_schools TEXT[],                  -- Optional school targeting
  min_gpa DECIMAL(3,2),                   -- Optional minimum GPA
  target_grad_years INTEGER[],            -- e.g., [2025, 2026]

  -- Compensation (optional, displayed as text)
  compensation_range TEXT,

  -- Application Settings
  application_deadline TIMESTAMPTZ,
  start_date TIMESTAMPTZ,
  external_url TEXT,                      -- Link to external application if any
  application_instructions TEXT,

  -- Status & Visibility
  status job_listing_status NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN NOT NULL DEFAULT false,

  -- Denormalized counts for performance
  application_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_job_listings_firm ON job_listings(firm_id);
CREATE INDEX idx_job_listings_posted_by ON job_listings(posted_by);
CREATE INDEX idx_job_listings_status ON job_listings(status) WHERE status = 'active';
CREATE INDEX idx_job_listings_slug ON job_listings(slug);
CREATE INDEX idx_job_listings_deadline ON job_listings(application_deadline)
  WHERE status = 'active' AND application_deadline IS NOT NULL;
CREATE INDEX idx_job_listings_featured ON job_listings(is_featured)
  WHERE status = 'active' AND is_featured = true;
CREATE INDEX idx_job_listings_target_roles ON job_listings USING gin(target_roles);
CREATE INDEX idx_job_listings_locations ON job_listings USING gin(locations);
CREATE INDEX idx_job_listings_target_grad_years ON job_listings USING gin(target_grad_years);

-- =============================================
-- EXTEND APPLICATIONS TABLE
-- =============================================

ALTER TABLE applications
ADD COLUMN job_listing_id UUID REFERENCES job_listings(id) ON DELETE SET NULL;

CREATE INDEX idx_applications_job_listing ON applications(job_listing_id)
  WHERE job_listing_id IS NOT NULL;

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-update updated_at timestamp
CREATE TRIGGER update_job_listings_updated_at
  BEFORE UPDATE ON job_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to generate slug from job title and firm name
CREATE OR REPLACE FUNCTION generate_job_slug(p_title TEXT, p_firm_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Combine firm name and title, convert to lowercase, replace special chars with hyphens
  base_slug := lower(regexp_replace(p_firm_name || '-' || p_title, '[^a-zA-Z0-9]+', '-', 'g'));
  -- Remove leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);
  -- Limit length
  base_slug := substring(base_slug from 1 for 80);

  final_slug := base_slug;

  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM job_listings WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to apply for a job
CREATE OR REPLACE FUNCTION apply_to_job(
  p_job_listing_id UUID,
  p_cover_letter TEXT,
  p_resume_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_candidate_profile candidate_profiles%ROWTYPE;
  v_profile profiles%ROWTYPE;
  v_job job_listings%ROWTYPE;
  v_application_id UUID;
  v_resume_url TEXT;
BEGIN
  -- Get candidate profile
  SELECT * INTO v_candidate_profile
  FROM candidate_profiles
  WHERE user_id = auth.uid();

  IF v_candidate_profile.id IS NULL THEN
    RAISE EXCEPTION 'Candidate profile not found';
  END IF;

  IF v_candidate_profile.status NOT IN ('verified', 'active') THEN
    RAISE EXCEPTION 'Profile must be verified to apply';
  END IF;

  -- Get base profile
  SELECT * INTO v_profile
  FROM profiles
  WHERE id = auth.uid();

  -- Get job listing
  SELECT * INTO v_job
  FROM job_listings
  WHERE id = p_job_listing_id AND status = 'active';

  IF v_job.id IS NULL THEN
    RAISE EXCEPTION 'Job not found or not accepting applications';
  END IF;

  -- Check deadline
  IF v_job.application_deadline IS NOT NULL AND v_job.application_deadline < NOW() THEN
    RAISE EXCEPTION 'Application deadline has passed';
  END IF;

  -- Check for existing application
  IF EXISTS (
    SELECT 1 FROM applications
    WHERE candidate_profile_id = v_candidate_profile.id
    AND job_listing_id = p_job_listing_id
  ) THEN
    RAISE EXCEPTION 'You have already applied to this job';
  END IF;

  -- Get resume URL if specified
  IF p_resume_id IS NOT NULL THEN
    SELECT resume_url INTO v_resume_url
    FROM candidate_resumes
    WHERE id = p_resume_id AND candidate_profile_id = v_candidate_profile.id;
  ELSE
    -- Use default resume
    SELECT resume_url INTO v_resume_url
    FROM candidate_resumes
    WHERE candidate_profile_id = v_candidate_profile.id AND is_default = true
    LIMIT 1;

    -- Fallback to legacy resume_url
    IF v_resume_url IS NULL THEN
      v_resume_url := v_candidate_profile.resume_url;
    END IF;
  END IF;

  -- Create application with snapshot
  INSERT INTO applications (
    candidate_profile_id,
    target_type,
    firm_id,
    job_listing_id,
    snapshot,
    cover_letter,
    outreach_approach,
    status
  ) VALUES (
    v_candidate_profile.id,
    'firm',
    v_job.firm_id,
    p_job_listing_id,
    jsonb_build_object(
      'full_name', v_profile.full_name,
      'email', v_profile.email,
      'phone', v_profile.phone,
      'linkedin_url', v_profile.linkedin_url,
      'school_name', v_candidate_profile.school_name,
      'major', v_candidate_profile.major,
      'graduation_year', v_candidate_profile.graduation_year,
      'gpa', v_candidate_profile.gpa,
      'resume_url', v_resume_url,
      'transcript_url', v_candidate_profile.transcript_url,
      'scheduling_url', v_candidate_profile.scheduling_url,
      'bio', v_candidate_profile.bio,
      'target_roles', v_candidate_profile.target_roles,
      'preferred_locations', v_candidate_profile.preferred_locations,
      'job_title', v_job.title,
      'firm_name', (SELECT name FROM firms WHERE id = v_job.firm_id)
    ),
    p_cover_letter,
    'Applied via job board',
    'pending'
  )
  RETURNING id INTO v_application_id;

  -- Increment application count on job listing
  UPDATE job_listings
  SET application_count = application_count + 1
  WHERE id = p_job_listing_id;

  RETURN v_application_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION apply_to_job TO authenticated;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;

-- Anyone can view active job listings
CREATE POLICY "Anyone can view active job listings"
  ON job_listings FOR SELECT
  USING (status = 'active');

-- Recruiters can view all their firm's job listings
CREATE POLICY "Recruiters can view own firm jobs"
  ON job_listings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recruiter_profiles rp
      WHERE rp.firm_id = job_listings.firm_id
      AND rp.user_id = auth.uid()
      AND rp.is_approved = true
    )
  );

-- Approved recruiters can create jobs for their firm
CREATE POLICY "Approved recruiters can create jobs"
  ON job_listings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recruiter_profiles rp
      WHERE rp.id = posted_by
      AND rp.firm_id = firm_id
      AND rp.user_id = auth.uid()
      AND rp.is_approved = true
    )
  );

-- Recruiters can update jobs they posted
CREATE POLICY "Recruiters can update own jobs"
  ON job_listings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM recruiter_profiles rp
      WHERE rp.id = job_listings.posted_by
      AND rp.user_id = auth.uid()
    )
  );

-- Recruiters can delete their own draft jobs only
CREATE POLICY "Recruiters can delete own draft jobs"
  ON job_listings FOR DELETE
  USING (
    status = 'draft'
    AND EXISTS (
      SELECT 1 FROM recruiter_profiles rp
      WHERE rp.id = job_listings.posted_by
      AND rp.user_id = auth.uid()
    )
  );

-- Admins can do everything
CREATE POLICY "Admins can manage all job listings"
  ON job_listings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- =============================================
-- APPLICATION RLS UPDATE
-- =============================================

-- Recruiters can view applications to their firm's jobs
CREATE POLICY "Recruiters can view job applications"
  ON applications FOR SELECT
  USING (
    target_type = 'firm'
    AND job_listing_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM job_listings jl
      JOIN recruiter_profiles rp ON rp.firm_id = jl.firm_id
      WHERE jl.id = applications.job_listing_id
      AND rp.user_id = auth.uid()
      AND rp.is_approved = true
    )
  );

-- Recruiters can update application status for their firm's jobs
CREATE POLICY "Recruiters can update job applications"
  ON applications FOR UPDATE
  USING (
    target_type = 'firm'
    AND job_listing_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM job_listings jl
      JOIN recruiter_profiles rp ON rp.firm_id = jl.firm_id
      WHERE jl.id = applications.job_listing_id
      AND rp.user_id = auth.uid()
      AND rp.is_approved = true
    )
  );
