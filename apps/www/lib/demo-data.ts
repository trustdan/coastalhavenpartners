/**
 * Demo data constants for the web app portals.
 * Values match the mobile app (apps/mobile) for cross-platform consistency.
 */

// ============================================
// CANDIDATE PORTAL DEMO DATA
// ============================================

export const candidateDemoData = {
  profileViewers: {
    totalViews: 47,
    weeklyViews: 12,
    monthlyViews: 32,
    uniqueFirms: 8,
    viewsChange: 23.5, // +23.5% from last period
    weeklyViewsData: [3, 5, 4, 7, 6, 8, 6, 8], // 8 weeks chart data
    viewers: [
      { firm: 'Goldman Sachs', time: '2 hours ago', views: 3 },
      { firm: 'Morgan Stanley', time: 'Yesterday', views: 2 },
      { firm: 'Blackstone', time: '3 days ago', views: 4 },
      { firm: 'KKR', time: '5 days ago', views: 1 },
      { firm: 'Bain Capital', time: '1 week ago', views: 2 },
    ],
  },

  activity: {
    applicationsSubmitted: 5,
    savedByRecruiters: 8,
    conversations: 3,
  },

  upcomingDeadlines: [
    {
      id: 'demo-deadline-1',
      title: 'Summer Analyst Program',
      slug: 'demo-summer-analyst',
      job_type: 'summer_analyst' as const,
      application_deadline: getDateDaysFromNow(14),
      locations: ['New York', 'San Francisco'],
      target_roles: ['Investment Banking Analyst'],
      target_grad_years: [2026],
      firm_id: 'demo-firm-1',
      firm_name: 'Goldman Sachs',
      firm_slug: 'goldman-sachs',
      firm_logo_url: null,
      firm_type: 'Investment Banking',
      has_reminder: false,
    },
    {
      id: 'demo-deadline-2',
      title: 'PE Associate - Off-Cycle',
      slug: 'demo-pe-associate',
      job_type: 'off_cycle' as const,
      application_deadline: getDateDaysFromNow(7),
      locations: ['New York'],
      target_roles: ['Private Equity Associate'],
      target_grad_years: [2025],
      firm_id: 'demo-firm-2',
      firm_name: 'Blackstone',
      firm_slug: 'blackstone',
      firm_logo_url: null,
      firm_type: 'Private Equity',
      has_reminder: true,
    },
    {
      id: 'demo-deadline-3',
      title: 'VC Analyst Program',
      slug: 'demo-vc-analyst',
      job_type: 'full_time' as const,
      application_deadline: getDateDaysFromNow(21),
      locations: ['San Francisco', 'Palo Alto'],
      target_roles: ['Venture Capital Analyst'],
      target_grad_years: [2025, 2026],
      firm_id: 'demo-firm-3',
      firm_name: 'Andreessen Horowitz',
      firm_slug: 'a16z',
      firm_logo_url: null,
      firm_type: 'Venture Capital',
      has_reminder: false,
    },
    {
      id: 'demo-deadline-4',
      title: 'Investment Banking Analyst',
      slug: 'demo-ib-analyst',
      job_type: 'full_time' as const,
      application_deadline: getDateDaysFromNow(10),
      locations: ['New York', 'Chicago'],
      target_roles: ['Investment Banking Analyst'],
      target_grad_years: [2025],
      firm_id: 'demo-firm-4',
      firm_name: 'Morgan Stanley',
      firm_slug: 'morgan-stanley',
      firm_logo_url: null,
      firm_type: 'Investment Banking',
      has_reminder: false,
    },
  ],

  firmInterests: [
    {
      id: 'demo-interest-1',
      firm_name: 'Blackstone',
      created_at: getDateDaysFromNow(-3),
    },
    {
      id: 'demo-interest-2',
      firm_name: 'KKR',
      created_at: getDateDaysFromNow(-5),
    },
    {
      id: 'demo-interest-3',
      firm_name: 'Apollo Global',
      created_at: getDateDaysFromNow(-7),
    },
  ],

  referrals: {
    stats: {
      total_referrals: 5,
      pending: 2,
      signed_up: 2,
      verified: 1,
    },
    list: [
      {
        id: 'demo-ref-1',
        referrer_id: 'demo-user',
        referred_email: 'john.doe@university.edu',
        referred_user_id: 'demo-referred-1',
        status: 'verified' as const,
        signed_up_at: getDateDaysFromNow(-14),
        verified_at: getDateDaysFromNow(-7),
        created_at: getDateDaysFromNow(-21),
        referred_user: { full_name: 'John Doe' },
      },
      {
        id: 'demo-ref-2',
        referrer_id: 'demo-user',
        referred_email: 'jane.smith@university.edu',
        referred_user_id: 'demo-referred-2',
        status: 'signed_up' as const,
        signed_up_at: getDateDaysFromNow(-3),
        verified_at: null,
        created_at: getDateDaysFromNow(-10),
        referred_user: { full_name: 'Jane Smith' },
      },
      {
        id: 'demo-ref-3',
        referrer_id: 'demo-user',
        referred_email: 'mike.johnson@university.edu',
        referred_user_id: null,
        status: 'pending' as const,
        signed_up_at: null,
        verified_at: null,
        created_at: getDateDaysFromNow(-2),
        referred_user: null,
      },
    ],
  },
}

// ============================================
// RECRUITER PORTAL DEMO DATA
// ============================================

export const recruiterDemoData = {
  stats: {
    totalCandidates: 156,
    fromTargetSchools: 89,
    matchingFilters: 34,
  },

  candidates: [
    {
      id: 'demo-candidate-1',
      school_name: 'University of Pennsylvania',
      major: 'Finance',
      gpa: 3.92,
      graduation_year: 2025,
      target_roles: ['Investment Banking Analyst', 'Private Equity Associate'],
      preferred_locations: ['New York', 'San Francisco'],
      status: 'verified' as const,
      undergrad_degree_type: 'BS',
      grad_degree_type: null,
      gpa_verified: true,
      resume_verified: true,
      transcript_verified: true,
      resume_url: '/demo-resume.pdf',
      transcript_url: '/demo-transcript.pdf',
      scheduling_url: 'https://calendly.com/demo',
      bio: 'Passionate about finance with experience in investment banking.',
      profiles: {
        full_name: 'Alexandra Chen',
        email: 'alexandra.chen@wharton.upenn.edu',
      },
    },
    {
      id: 'demo-candidate-2',
      school_name: 'Harvard Business School',
      major: 'Business Administration',
      gpa: 3.88,
      graduation_year: 2025,
      target_roles: ['Private Equity Associate', 'Growth Equity'],
      preferred_locations: ['New York', 'Boston'],
      status: 'verified' as const,
      undergrad_degree_type: 'BA',
      grad_degree_type: 'MBA',
      gpa_verified: true,
      resume_verified: true,
      transcript_verified: true,
      resume_url: '/demo-resume.pdf',
      transcript_url: '/demo-transcript.pdf',
      scheduling_url: null,
      bio: 'MBA candidate with pre-MBA experience at McKinsey.',
      profiles: {
        full_name: 'Michael Rodriguez',
        email: 'mrodriguez@mba2025.hbs.edu',
      },
    },
    {
      id: 'demo-candidate-3',
      school_name: 'Stanford Graduate School of Business',
      major: 'MBA',
      gpa: 3.85,
      graduation_year: 2025,
      target_roles: ['Venture Capital Analyst', 'Growth Equity'],
      preferred_locations: ['San Francisco', 'Palo Alto'],
      status: 'verified' as const,
      undergrad_degree_type: 'BS',
      grad_degree_type: 'MBA',
      gpa_verified: true,
      resume_verified: true,
      transcript_verified: false,
      resume_url: '/demo-resume.pdf',
      transcript_url: null,
      scheduling_url: 'https://calendly.com/demo',
      bio: 'Tech-focused MBA with experience at Google and a Series A startup.',
      profiles: {
        full_name: 'Sarah Kim',
        email: 'skim@gsb.stanford.edu',
      },
    },
    {
      id: 'demo-candidate-4',
      school_name: 'Columbia Business School',
      major: 'Finance & Economics',
      gpa: 3.78,
      graduation_year: 2026,
      target_roles: ['Investment Banking Analyst', 'M&A'],
      preferred_locations: ['New York'],
      status: 'verified' as const,
      undergrad_degree_type: 'BS',
      grad_degree_type: null,
      gpa_verified: true,
      resume_verified: true,
      transcript_verified: true,
      resume_url: '/demo-resume.pdf',
      transcript_url: '/demo-transcript.pdf',
      scheduling_url: null,
      bio: 'Dual degree student with internship experience at JPMorgan.',
      profiles: {
        full_name: 'David Park',
        email: 'dpark@columbia.edu',
      },
    },
    {
      id: 'demo-candidate-5',
      school_name: 'MIT Sloan School of Management',
      major: 'Finance',
      gpa: 3.95,
      graduation_year: 2025,
      target_roles: ['Quantitative Research', 'Hedge Fund Analyst'],
      preferred_locations: ['New York', 'Boston', 'Chicago'],
      status: 'verified' as const,
      undergrad_degree_type: 'BS',
      grad_degree_type: 'MFin',
      gpa_verified: true,
      resume_verified: true,
      transcript_verified: true,
      resume_url: '/demo-resume.pdf',
      transcript_url: '/demo-transcript.pdf',
      scheduling_url: 'https://calendly.com/demo',
      bio: 'Quantitative background with PhD-level research experience.',
      profiles: {
        full_name: 'Emily Zhang',
        email: 'ezhang@mit.edu',
      },
    },
  ],

  recommendations: [
    {
      id: 'demo-candidate-1',
      matchReason: 'Strong GPA match with your recent searches',
    },
    {
      id: 'demo-candidate-3',
      matchReason: 'Similar profile to candidates you saved',
    },
    {
      id: 'demo-candidate-5',
      matchReason: 'Top candidate from target school',
    },
  ],
}

// ============================================
// SCHOOL PORTAL DEMO DATA
// Values from apps/mobile/lib/features/school/screens/school_dashboard.dart
// ============================================

export const schoolDemoData = {
  stats: {
    totalStudents: 156,
    verified: 142,
    placed: 48,
    pendingReview: 14,
    placementRate: 0.68, // 68% - 48 of 71 active job seekers placed
    activeJobSeekers: 71,
  },

  students: [
    {
      id: 'demo-student-1',
      school_name: 'Your University',
      major: 'Finance',
      gpa: 3.92,
      graduation_year: 2025,
      education_level: 'Bachelors',
      target_roles: ['Investment Banking Analyst', 'Private Equity Associate'],
      preferred_locations: ['New York', 'San Francisco'],
      status: 'verified' as const,
      profiles: {
        full_name: 'Sarah Johnson',
        email: 'sarah.johnson@university.edu',
        linkedin_url: 'https://linkedin.com/in/demo',
      },
    },
    {
      id: 'demo-student-2',
      school_name: 'Your University',
      major: 'Economics',
      gpa: 3.85,
      graduation_year: 2025,
      education_level: 'Bachelors',
      target_roles: ['Consulting', 'Strategy'],
      preferred_locations: ['New York', 'Chicago'],
      status: 'verified' as const,
      profiles: {
        full_name: 'Michael Chen',
        email: 'michael.chen@university.edu',
        linkedin_url: null,
      },
    },
    {
      id: 'demo-student-3',
      school_name: 'Your University',
      major: 'Business Administration',
      gpa: 3.78,
      graduation_year: 2026,
      education_level: 'Bachelors',
      target_roles: ['Venture Capital Analyst'],
      preferred_locations: ['San Francisco'],
      status: 'pending_verification' as const,
      profiles: {
        full_name: 'Emily Davis',
        email: 'emily.davis@university.edu',
        linkedin_url: 'https://linkedin.com/in/demo2',
      },
    },
    {
      id: 'demo-student-4',
      school_name: 'Your University',
      major: 'Finance',
      gpa: 3.95,
      graduation_year: 2025,
      education_level: 'Bachelors',
      target_roles: ['Investment Banking Analyst'],
      preferred_locations: ['New York'],
      status: 'placed' as const,
      profiles: {
        full_name: 'James Wilson',
        email: 'james.wilson@university.edu',
        linkedin_url: null,
      },
    },
    {
      id: 'demo-student-5',
      school_name: 'Your University',
      major: 'Accounting',
      gpa: 3.72,
      graduation_year: 2026,
      education_level: 'Bachelors',
      target_roles: ['Private Equity Associate', 'M&A'],
      preferred_locations: ['New York', 'Boston'],
      status: 'verified' as const,
      profiles: {
        full_name: 'Amanda Lee',
        email: 'amanda.lee@university.edu',
        linkedin_url: 'https://linkedin.com/in/demo3',
      },
    },
  ],

  recentActivity: [
    {
      type: 'person_add',
      icon: 'UserPlus',
      title: 'New student registered',
      subtitle: 'Sarah Johnson joined the platform',
      time: '2h ago',
      color: 'teal',
    },
    {
      type: 'check_circle',
      icon: 'CheckCircle',
      title: 'Placement confirmed',
      subtitle: 'Michael Chen accepted offer at Goldman Sachs',
      time: '5h ago',
      color: 'green',
    },
    {
      type: 'business',
      icon: 'Building2',
      title: 'New recruiter partnership',
      subtitle: 'Blackstone joined the network',
      time: '1d ago',
      color: 'blue',
    },
  ],
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/** Get a date N days from now (positive = future, negative = past) */
function getDateDaysFromNow(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

// ============================================
// TYPE EXPORTS
// ============================================

export type DemoDeadline = (typeof candidateDemoData.upcomingDeadlines)[number]
export type DemoViewer = (typeof candidateDemoData.profileViewers.viewers)[number]
export type DemoFirmInterest = (typeof candidateDemoData.firmInterests)[number]
export type DemoReferral = (typeof candidateDemoData.referrals.list)[number]
export type DemoCandidate = (typeof recruiterDemoData.candidates)[number]
export type DemoStudent = (typeof schoolDemoData.students)[number]
export type DemoActivity = (typeof schoolDemoData.recentActivity)[number]
