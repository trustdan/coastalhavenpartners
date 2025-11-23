-- Analytics Events Table
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'profile_view', 'login', 'search', etc.
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Who performed the action (e.g. Recruiter)
  target_id UUID, -- Optional target (e.g. Candidate ID being viewed)
  metadata JSONB DEFAULT '{}'::jsonb, -- Extra data (e.g. filters used)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_target_id ON public.analytics_events(target_id);
CREATE INDEX idx_analytics_created_at ON public.analytics_events(created_at);

-- RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Insert: Authenticated users can log events
CREATE POLICY "Authenticated users can insert analytics"
  ON public.analytics_events FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Select: Admins can see everything
CREATE POLICY "Admins can view all analytics"
  ON public.analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Select: Candidates can see events targeting them (e.g. "Who viewed my profile?")
CREATE POLICY "Candidates can view events targeting them"
  ON public.analytics_events FOR SELECT
  USING (
    auth.uid() = target_id
    AND EXISTS (
       SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'candidate'
    )
  );

-- Select: Recruiters can see their own actions
CREATE POLICY "Recruiters can view their own events"
  ON public.analytics_events FOR SELECT
  USING (
    auth.uid() = user_id
  );

