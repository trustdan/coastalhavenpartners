import 'package:flutter/material.dart';
import '../../features/candidate/screens/candidate_dashboard.dart';
import '../../features/candidate/screens/job_listings_screen.dart';
import '../../features/candidate/screens/applications_screen.dart';
import '../../features/candidate/screens/candidate_analytics_screen.dart';
import '../../features/candidate/screens/candidate_profile_screen.dart';
import '../../features/recruiter/screens/recruiter_dashboard.dart';
import '../../features/recruiter/screens/candidate_search_screen.dart';
import '../../features/recruiter/screens/campaigns_screen.dart';
import '../../features/recruiter/screens/analytics_screen.dart';
import '../../features/shared/screens/settings_screen.dart';
import '../../features/school/screens/school_dashboard.dart';
import '../../features/school/screens/students_screen.dart';
import '../../features/messaging/screens/inbox_screen.dart';
import '../../features/admin/screens/admin_dashboard.dart';
import '../../features/admin/screens/admin_verification_screen.dart';
import '../../features/admin/screens/admin_candidates_screen.dart';
import '../../features/admin/screens/admin_support_screen.dart';
import 'app_router.dart';

/// Configuration for swipeable navigation shells
class NavigationConfig {
  /// Route paths in order
  final List<String> routes;

  /// Navigation destinations (icons + labels)
  final List<NavigationDestination> destinations;

  /// Builders for each screen (called lazily)
  final List<Widget Function()> screenBuilders;

  const NavigationConfig({
    required this.routes,
    required this.destinations,
    required this.screenBuilders,
  });
}

/// Candidate portal navigation configuration (5 tabs)
final candidateNavConfig = NavigationConfig(
  routes: [
    AppRoutes.candidate,
    AppRoutes.candidateJobs,
    AppRoutes.candidateApplications,
    AppRoutes.candidateAnalytics,
    AppRoutes.candidateProfile,
  ],
  destinations: const [
    NavigationDestination(
      icon: Icon(Icons.home_outlined),
      selectedIcon: Icon(Icons.home),
      label: 'Home',
    ),
    NavigationDestination(
      icon: Icon(Icons.search_outlined),
      selectedIcon: Icon(Icons.search),
      label: 'Jobs',
    ),
    NavigationDestination(
      icon: Icon(Icons.description_outlined),
      selectedIcon: Icon(Icons.description),
      label: 'Apply',
    ),
    NavigationDestination(
      icon: Icon(Icons.analytics_outlined),
      selectedIcon: Icon(Icons.analytics),
      label: 'Analytics',
    ),
    NavigationDestination(
      icon: Icon(Icons.person_outline),
      selectedIcon: Icon(Icons.person),
      label: 'Profile',
    ),
  ],
  screenBuilders: [
    () => const CandidateDashboard(),
    () => const JobListingsScreen(),
    () => const ApplicationsScreen(),
    () => const CandidateAnalyticsScreen(),
    () => const CandidateProfileScreen(),
  ],
);

/// Recruiter portal navigation configuration (5 tabs)
final recruiterNavConfig = NavigationConfig(
  routes: [
    AppRoutes.recruiter,
    AppRoutes.recruiterCandidates,
    AppRoutes.recruiterCampaigns,
    AppRoutes.recruiterAnalytics,
    AppRoutes.recruiterSettings,
  ],
  destinations: const [
    NavigationDestination(
      icon: Icon(Icons.home_outlined),
      selectedIcon: Icon(Icons.home),
      label: 'Home',
    ),
    NavigationDestination(
      icon: Icon(Icons.people_outline),
      selectedIcon: Icon(Icons.people),
      label: 'Candidates',
    ),
    NavigationDestination(
      icon: Icon(Icons.campaign_outlined),
      selectedIcon: Icon(Icons.campaign),
      label: 'Campaigns',
    ),
    NavigationDestination(
      icon: Icon(Icons.analytics_outlined),
      selectedIcon: Icon(Icons.analytics),
      label: 'Analytics',
    ),
    NavigationDestination(
      icon: Icon(Icons.settings_outlined),
      selectedIcon: Icon(Icons.settings),
      label: 'Settings',
    ),
  ],
  screenBuilders: [
    () => const RecruiterDashboard(),
    () => const CandidateSearchScreen(),
    () => const CampaignsScreen(),
    () => const AnalyticsScreen(),
    () => const SettingsScreen(userRole: 'recruiter'),
  ],
);

/// School portal navigation configuration (4 tabs)
final schoolNavConfig = NavigationConfig(
  routes: [
    AppRoutes.school,
    AppRoutes.schoolStudents,
    AppRoutes.schoolMessages,
    AppRoutes.schoolSettings,
  ],
  destinations: const [
    NavigationDestination(
      icon: Icon(Icons.dashboard_outlined),
      selectedIcon: Icon(Icons.dashboard),
      label: 'Dashboard',
    ),
    NavigationDestination(
      icon: Icon(Icons.people_outline),
      selectedIcon: Icon(Icons.people),
      label: 'Students',
    ),
    NavigationDestination(
      icon: Icon(Icons.message_outlined),
      selectedIcon: Icon(Icons.message),
      label: 'Messages',
    ),
    NavigationDestination(
      icon: Icon(Icons.settings_outlined),
      selectedIcon: Icon(Icons.settings),
      label: 'Settings',
    ),
  ],
  screenBuilders: [
    () => const SchoolDashboard(),
    () => const StudentsScreen(),
    () => const InboxScreen(),
    () => const SettingsScreen(userRole: 'school_admin'),
  ],
);

/// Admin portal navigation configuration (5 tabs)
final adminNavConfig = NavigationConfig(
  routes: [
    AppRoutes.admin,
    AppRoutes.adminVerification,
    AppRoutes.adminCandidates,
    AppRoutes.adminSupport,
    AppRoutes.adminSettings,
  ],
  destinations: const [
    NavigationDestination(
      icon: Icon(Icons.home_outlined),
      selectedIcon: Icon(Icons.home),
      label: 'Home',
    ),
    NavigationDestination(
      icon: Icon(Icons.verified_user_outlined),
      selectedIcon: Icon(Icons.verified_user),
      label: 'Verification',
    ),
    NavigationDestination(
      icon: Icon(Icons.people_outline),
      selectedIcon: Icon(Icons.people),
      label: 'Candidates',
    ),
    NavigationDestination(
      icon: Icon(Icons.support_agent_outlined),
      selectedIcon: Icon(Icons.support_agent),
      label: 'Support',
    ),
    NavigationDestination(
      icon: Icon(Icons.settings_outlined),
      selectedIcon: Icon(Icons.settings),
      label: 'Settings',
    ),
  ],
  screenBuilders: [
    () => const AdminDashboard(),
    () => const AdminVerificationScreen(),
    () => const AdminCandidatesScreen(),
    () => const AdminSupportScreen(),
    () => const SettingsScreen(userRole: 'admin'),
  ],
);
