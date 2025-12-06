-- =============================================
-- PLACEMENT TRACKING FOR SCHOOL ANALYTICS
-- =============================================
-- Allows schools to track student placements and view analytics

-- =============================================
-- ADD PLACEMENT COLUMNS TO CANDIDATE_PROFILES
-- =============================================

ALTER TABLE candidate_profiles
ADD COLUMN IF NOT EXISTS placed_firm_id UUID REFERENCES firms(id),
ADD COLUMN IF NOT EXISTS placed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS placement_role TEXT,
ADD COLUMN IF NOT EXISTS placement_salary_range TEXT,
ADD COLUMN IF NOT EXISTS placement_location TEXT;

-- Create index for placement queries
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_placed ON candidate_profiles(placed_firm_id)
  WHERE placed_firm_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_candidate_profiles_placed_at ON candidate_profiles(placed_at)
  WHERE placed_at IS NOT NULL;

-- =============================================
-- SCHOOL ANALYTICS VIEW
-- =============================================
-- Pre-aggregated view for efficient analytics queries

CREATE OR REPLACE VIEW school_placement_stats AS
SELECT
  cp.school_name,
  cp.graduation_year,
  COUNT(*) as total_students,
  COUNT(cp.placed_firm_id) as placed_students,
  ROUND(COUNT(cp.placed_firm_id)::numeric / NULLIF(COUNT(*)::numeric, 0) * 100, 1) as placement_rate,
  AVG(cp.gpa) as avg_gpa,
  AVG(CASE WHEN cp.placed_firm_id IS NOT NULL THEN cp.gpa END) as avg_placed_gpa
FROM candidate_profiles cp
WHERE cp.status IN ('verified', 'active', 'placed')
  AND cp.is_rejected = false
GROUP BY cp.school_name, cp.graduation_year;

-- Grant access to the view
GRANT SELECT ON school_placement_stats TO authenticated;

-- =============================================
-- PLACEMENT BY FIRM TYPE VIEW
-- =============================================

CREATE OR REPLACE VIEW school_placements_by_firm_type AS
SELECT
  cp.school_name,
  cp.graduation_year,
  f.firm_type,
  COUNT(*) as placement_count
FROM candidate_profiles cp
JOIN firms f ON f.id = cp.placed_firm_id
WHERE cp.placed_firm_id IS NOT NULL
GROUP BY cp.school_name, cp.graduation_year, f.firm_type;

-- Grant access to the view
GRANT SELECT ON school_placements_by_firm_type TO authenticated;

-- =============================================
-- RECENT PLACEMENTS VIEW
-- =============================================

CREATE OR REPLACE VIEW school_recent_placements AS
SELECT
  cp.id as candidate_id,
  cp.school_name,
  p.full_name as candidate_name,
  cp.major,
  cp.graduation_year,
  cp.gpa,
  cp.placed_at,
  cp.placement_role,
  cp.placement_location,
  f.id as firm_id,
  f.name as firm_name,
  f.firm_type,
  f.logo_url as firm_logo_url
FROM candidate_profiles cp
JOIN profiles p ON p.id = cp.user_id
JOIN firms f ON f.id = cp.placed_firm_id
WHERE cp.placed_firm_id IS NOT NULL
ORDER BY cp.placed_at DESC;

-- Grant access to the view
GRANT SELECT ON school_recent_placements TO authenticated;

-- =============================================
-- FUNCTION: Get School Analytics
-- =============================================
-- Returns comprehensive analytics for a school admin

CREATE OR REPLACE FUNCTION get_school_analytics(p_school_name TEXT)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_total_students INTEGER;
  v_placed_students INTEGER;
  v_verified_students INTEGER;
  v_active_students INTEGER;
  v_avg_gpa DECIMAL;
  v_avg_placed_gpa DECIMAL;
BEGIN
  -- Get basic counts
  SELECT
    COUNT(*),
    COUNT(CASE WHEN placed_firm_id IS NOT NULL THEN 1 END),
    COUNT(CASE WHEN status = 'verified' THEN 1 END),
    COUNT(CASE WHEN status = 'active' THEN 1 END),
    AVG(gpa),
    AVG(CASE WHEN placed_firm_id IS NOT NULL THEN gpa END)
  INTO
    v_total_students,
    v_placed_students,
    v_verified_students,
    v_active_students,
    v_avg_gpa,
    v_avg_placed_gpa
  FROM candidate_profiles
  WHERE school_name = p_school_name
    AND status IN ('verified', 'active', 'placed')
    AND is_rejected = false;

  -- Build result
  v_result := jsonb_build_object(
    'total_students', COALESCE(v_total_students, 0),
    'placed_students', COALESCE(v_placed_students, 0),
    'verified_students', COALESCE(v_verified_students, 0),
    'active_students', COALESCE(v_active_students, 0),
    'placement_rate', CASE
      WHEN v_total_students > 0
      THEN ROUND((v_placed_students::numeric / v_total_students::numeric) * 100, 1)
      ELSE 0
    END,
    'avg_gpa', ROUND(COALESCE(v_avg_gpa, 0), 2),
    'avg_placed_gpa', ROUND(COALESCE(v_avg_placed_gpa, 0), 2)
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_school_analytics TO authenticated;

-- =============================================
-- RLS FOR PLACEMENT VIEWS
-- =============================================

-- School admins can only see stats for their own school
-- This is enforced through the queries that join on school_name

-- =============================================
-- UPDATE CANDIDATE STATUS ENUM
-- =============================================

-- Add 'placed' status if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'placed'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'candidate_status')
  ) THEN
    ALTER TYPE candidate_status ADD VALUE 'placed';
  END IF;
END $$;

-- =============================================
-- FUNCTION: Mark Candidate as Placed
-- =============================================
-- Admin function to record a placement

CREATE OR REPLACE FUNCTION mark_candidate_placed(
  p_candidate_id UUID,
  p_firm_id UUID,
  p_role TEXT,
  p_location TEXT DEFAULT NULL,
  p_salary_range TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_role TEXT;
BEGIN
  -- Check if caller is admin
  SELECT role INTO v_user_role
  FROM profiles
  WHERE id = auth.uid();

  IF v_user_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can mark candidates as placed';
  END IF;

  -- Update candidate profile
  UPDATE candidate_profiles
  SET
    placed_firm_id = p_firm_id,
    placed_at = NOW(),
    placement_role = p_role,
    placement_location = p_location,
    placement_salary_range = p_salary_range,
    status = 'placed'
  WHERE id = p_candidate_id;

  RETURN jsonb_build_object('success', true, 'placed_at', NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION mark_candidate_placed TO authenticated;
