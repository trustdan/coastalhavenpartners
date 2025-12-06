-- =============================================
-- DEADLINE REMINDERS
-- =============================================
-- Allows candidates to set reminders for job application deadlines

-- =============================================
-- TABLE
-- =============================================

CREATE TABLE deadline_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_profile_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  job_listing_id UUID NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,
  remind_at TIMESTAMPTZ NOT NULL,  -- When to send the reminder (e.g., 3 days before deadline)
  reminded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Each candidate can only have one reminder per job
  UNIQUE(candidate_profile_id, job_listing_id)
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_deadline_reminders_candidate ON deadline_reminders(candidate_profile_id);
CREATE INDEX idx_deadline_reminders_job ON deadline_reminders(job_listing_id);
CREATE INDEX idx_deadline_reminders_pending ON deadline_reminders(remind_at)
  WHERE reminded = false;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE deadline_reminders ENABLE ROW LEVEL SECURITY;

-- Candidates can view their own reminders
CREATE POLICY "Candidates can view own reminders"
  ON deadline_reminders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM candidate_profiles cp
      WHERE cp.id = deadline_reminders.candidate_profile_id
      AND cp.user_id = auth.uid()
    )
  );

-- Candidates can create reminders for themselves
CREATE POLICY "Candidates can create own reminders"
  ON deadline_reminders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM candidate_profiles cp
      WHERE cp.id = candidate_profile_id
      AND cp.user_id = auth.uid()
    )
  );

-- Candidates can update their own reminders
CREATE POLICY "Candidates can update own reminders"
  ON deadline_reminders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM candidate_profiles cp
      WHERE cp.id = deadline_reminders.candidate_profile_id
      AND cp.user_id = auth.uid()
    )
  );

-- Candidates can delete their own reminders
CREATE POLICY "Candidates can delete own reminders"
  ON deadline_reminders FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM candidate_profiles cp
      WHERE cp.id = deadline_reminders.candidate_profile_id
      AND cp.user_id = auth.uid()
    )
  );

-- Admins can manage all reminders
CREATE POLICY "Admins can manage all reminders"
  ON deadline_reminders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- =============================================
-- VIEW: Upcoming Deadlines
-- =============================================
-- Aggregates active job listings with upcoming deadlines

CREATE OR REPLACE VIEW upcoming_deadlines AS
SELECT
  jl.id,
  jl.title,
  jl.slug,
  jl.job_type,
  jl.application_deadline,
  jl.locations,
  jl.target_roles,
  jl.target_grad_years,
  f.id as firm_id,
  f.name as firm_name,
  f.slug as firm_slug,
  f.logo_url as firm_logo_url,
  f.firm_type
FROM job_listings jl
JOIN firms f ON jl.firm_id = f.id
WHERE jl.application_deadline IS NOT NULL
  AND jl.application_deadline > NOW()
  AND jl.status = 'active'
ORDER BY jl.application_deadline ASC;

-- Grant access to the view
GRANT SELECT ON upcoming_deadlines TO authenticated;

-- =============================================
-- FUNCTION: Toggle Deadline Reminder
-- =============================================
-- Creates or removes a deadline reminder for a job

CREATE OR REPLACE FUNCTION toggle_deadline_reminder(
  p_job_listing_id UUID,
  p_days_before INTEGER DEFAULT 3
)
RETURNS JSONB AS $$
DECLARE
  v_candidate_profile_id UUID;
  v_deadline TIMESTAMPTZ;
  v_existing_id UUID;
  v_remind_at TIMESTAMPTZ;
BEGIN
  -- Get candidate profile
  SELECT id INTO v_candidate_profile_id
  FROM candidate_profiles
  WHERE user_id = auth.uid();

  IF v_candidate_profile_id IS NULL THEN
    RAISE EXCEPTION 'Candidate profile not found';
  END IF;

  -- Get job deadline
  SELECT application_deadline INTO v_deadline
  FROM job_listings
  WHERE id = p_job_listing_id AND status = 'active';

  IF v_deadline IS NULL THEN
    RAISE EXCEPTION 'Job not found or has no deadline';
  END IF;

  -- Check if reminder exists
  SELECT id INTO v_existing_id
  FROM deadline_reminders
  WHERE candidate_profile_id = v_candidate_profile_id
    AND job_listing_id = p_job_listing_id;

  IF v_existing_id IS NOT NULL THEN
    -- Remove existing reminder
    DELETE FROM deadline_reminders WHERE id = v_existing_id;
    RETURN jsonb_build_object('action', 'removed', 'reminder_id', v_existing_id);
  ELSE
    -- Calculate remind_at time
    v_remind_at := v_deadline - (p_days_before || ' days')::INTERVAL;

    -- Don't set reminder in the past
    IF v_remind_at < NOW() THEN
      v_remind_at := NOW() + INTERVAL '1 hour';
    END IF;

    -- Create new reminder
    INSERT INTO deadline_reminders (candidate_profile_id, job_listing_id, remind_at)
    VALUES (v_candidate_profile_id, p_job_listing_id, v_remind_at)
    RETURNING id INTO v_existing_id;

    RETURN jsonb_build_object(
      'action', 'created',
      'reminder_id', v_existing_id,
      'remind_at', v_remind_at
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION toggle_deadline_reminder TO authenticated;
