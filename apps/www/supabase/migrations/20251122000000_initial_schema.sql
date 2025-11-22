-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE user_role AS ENUM ('candidate', 'recruiter', 'admin');
CREATE TYPE candidate_status AS ENUM ('pending_verification', 'verified', 'active', 'placed', 'rejected');
CREATE TYPE education_level AS ENUM ('bachelors', 'masters', 'mba', 'phd');

-- =============================================
-- TABLES
-- =============================================

-- User Profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'candidate',
  full_name TEXT NOT NULL,
  phone TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidate Profiles
CREATE TABLE public.candidate_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Education
  school_name TEXT NOT NULL,
  graduation_year INTEGER NOT NULL,
  major TEXT NOT NULL,
  gpa DECIMAL(3, 2) NOT NULL CHECK (gpa >= 0 AND gpa <= 4.0),
  education_level education_level DEFAULT 'bachelors',

  -- Professional
  resume_url TEXT,
  transcript_url TEXT,
  target_roles TEXT[], -- ['IB', 'PE', 'VC', 'Consulting']
  preferred_locations TEXT[], -- ['NYC', 'SF', 'Chicago']

  -- Verification
  status candidate_status DEFAULT 'pending_verification',
  email_verified BOOLEAN DEFAULT FALSE,
  gpa_verified BOOLEAN DEFAULT FALSE,
  school_verified BOOLEAN DEFAULT FALSE,

  -- Metadata
  notes TEXT, -- Recruiter notes
  tags TEXT[], -- Searchable tags
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recruiter Profiles
CREATE TABLE public.recruiter_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Firm Details
  firm_name TEXT NOT NULL,
  firm_type TEXT, -- 'Investment Bank', 'PE', 'VC', 'Consulting'
  job_title TEXT NOT NULL,

  -- Access Control
  is_approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidate-Recruiter Interactions
CREATE TABLE public.candidate_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  recruiter_id UUID REFERENCES public.recruiter_profiles(id) ON DELETE CASCADE,

  interaction_type TEXT NOT NULL, -- 'viewed', 'contacted', 'interviewed', 'offered'
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_candidate_status ON public.candidate_profiles(status);
CREATE INDEX idx_candidate_gpa ON public.candidate_profiles(gpa);
CREATE INDEX idx_candidate_graduation_year ON public.candidate_profiles(graduation_year);
CREATE INDEX idx_candidate_email_verified ON public.candidate_profiles(email_verified);
CREATE INDEX idx_recruiter_approved ON public.recruiter_profiles(is_approved);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_interactions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Candidate Profiles: Candidates can manage their own, recruiters can view verified
CREATE POLICY "Candidates can view their own profile"
  ON public.candidate_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Candidates can update their own profile"
  ON public.candidate_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Recruiters can view verified candidates"
  ON public.candidate_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.recruiter_profiles
      WHERE user_id = auth.uid() AND is_approved = TRUE
    )
    AND status = 'verified'
  );

-- Recruiter Profiles: Recruiters manage their own
CREATE POLICY "Recruiters can view their own profile"
  ON public.recruiter_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Recruiters can update their own profile"
  ON public.recruiter_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Interactions: Recruiters can create, candidates can view their own
CREATE POLICY "Recruiters can create interactions"
  ON public.candidate_interactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recruiter_profiles
      WHERE user_id = auth.uid() AND is_approved = TRUE
    )
  );

CREATE POLICY "Candidates can view their interactions"
  ON public.candidate_interactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.candidate_profiles
      WHERE id = candidate_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can view their interactions"
  ON public.candidate_interactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.recruiter_profiles
      WHERE id = recruiter_id AND user_id = auth.uid()
    )
  );

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidate_profiles_updated_at BEFORE UPDATE ON public.candidate_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recruiter_profiles_updated_at BEFORE UPDATE ON public.recruiter_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
