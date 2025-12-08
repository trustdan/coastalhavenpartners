import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/onboarding/screens/splash_screen.dart';
import '../../features/onboarding/screens/onboarding_screen.dart';
import '../../features/onboarding/screens/role_selection_screen.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/signup_candidate_screen.dart';
import '../../features/auth/screens/signup_recruiter_screen.dart';
import '../../features/auth/screens/signup_school_screen.dart';
import '../../features/auth/screens/verify_email_screen.dart';
import '../../features/auth/screens/forgot_password_screen.dart';
import '../../features/auth/screens/mfa_screen.dart';
import '../../features/auth/screens/complete_profile_candidate_screen.dart';
import '../../features/auth/screens/complete_profile_recruiter_screen.dart';
import '../../features/auth/screens/complete_profile_school_screen.dart';
import '../../features/candidate/screens/candidate_dashboard.dart';
import '../../features/candidate/screens/candidate_profile_screen.dart';
import '../../features/candidate/screens/edit_profile_screen.dart';
import '../../features/candidate/screens/job_listings_screen.dart';
import '../../features/candidate/screens/job_detail_screen.dart';
import '../../features/candidate/screens/applications_screen.dart';
import '../../features/recruiter/screens/recruiter_dashboard.dart';
import '../../features/recruiter/screens/candidate_search_screen.dart';
import '../../features/recruiter/screens/candidate_detail_screen.dart';
import '../../features/recruiter/screens/saved_candidates_screen.dart';
import '../../features/recruiter/screens/campaigns_screen.dart';
import '../../features/recruiter/screens/campaign_builder_screen.dart';
import '../../features/recruiter/screens/campaign_detail_screen.dart';
import '../../features/messaging/screens/inbox_screen.dart';
import '../../features/messaging/screens/conversation_screen.dart';
import '../../features/messaging/screens/new_conversation_screen.dart';
import '../../features/shared/screens/placeholder_screen.dart';
import '../../features/shared/screens/settings_screen.dart';
import '../providers/auth_provider.dart';

/// Route names as constants
class AppRoutes {
  AppRoutes._();

  // Onboarding
  static const splash = '/';
  static const onboarding = '/onboarding';
  static const roleSelection = '/role-selection';

  // Auth
  static const login = '/login';
  static const signup = '/signup';
  static const signupCandidate = '/signup/candidate';
  static const signupRecruiter = '/signup/recruiter';
  static const signupSchool = '/signup/school';
  static const verifyEmail = '/verify-email';
  static const forgotPassword = '/forgot-password';
  static const mfa = '/mfa';
  static const completeProfileCandidate = '/complete-profile/candidate';
  static const completeProfileRecruiter = '/complete-profile/recruiter';
  static const completeProfileSchool = '/complete-profile/school';

  // Candidate Portal
  static const candidate = '/candidate';
  static const candidateJobs = '/candidate/jobs';
  static const candidateApplications = '/candidate/applications';
  static const candidateMessages = '/candidate/messages';
  static const candidateProfile = '/candidate/profile';
  static const candidateEditProfile = '/candidate/edit-profile';
  static const candidateSettings = '/candidate/settings';

  // Recruiter Portal
  static const recruiter = '/recruiter';
  static const recruiterCandidates = '/recruiter/candidates';
  static const recruiterCampaigns = '/recruiter/campaigns';
  static const recruiterNewCampaign = '/recruiter/campaigns/new';
  static const recruiterAnalytics = '/recruiter/analytics';
  static const recruiterSettings = '/recruiter/settings';

  // School Portal
  static const school = '/school';

  // Shared
  static const settings = '/settings';
  static const messages = '/messages';
  static const messagesNew = '/messages/new';
  // Note: Individual conversation routes use /messages/:conversationId
}

/// Listenable for auth state changes (used by GoRouter's refreshListenable)
class AuthChangeNotifier extends ChangeNotifier {
  AuthChangeNotifier(this._ref) {
    _ref.listen(authStateProvider, (_, __) {
      notifyListeners();
    });
  }
  final Ref _ref;
}

/// Provider for the auth change notifier
final authChangeNotifierProvider = Provider<AuthChangeNotifier>((ref) {
  return AuthChangeNotifier(ref);
});

/// App router configuration
final appRouterProvider = Provider<GoRouter>((ref) {
  final authChangeNotifier = ref.watch(authChangeNotifierProvider);

  return GoRouter(
    initialLocation: AppRoutes.splash,
    debugLogDiagnostics: true,
    refreshListenable: authChangeNotifier,

    // Redirect logic based on auth state
    redirect: (context, state) {
      final authState = ref.read(authStateProvider);
      final authValue = authState.hasValue ? authState.value : null;
      final isLoggedIn = authValue?.isAuthenticated ?? false;
      final isLoading = authState.isLoading;
      final currentPath = state.matchedLocation;

      // Don't redirect while loading
      if (isLoading) return null;

      // Public routes that don't require auth
      final publicRoutes = [
        AppRoutes.splash,
        AppRoutes.onboarding,
        AppRoutes.roleSelection,
        AppRoutes.login,
        AppRoutes.signup,
        AppRoutes.signupCandidate,
        AppRoutes.signupRecruiter,
        AppRoutes.signupSchool,
        AppRoutes.verifyEmail,
        AppRoutes.forgotPassword,
        AppRoutes.mfa,
        AppRoutes.completeProfileCandidate,
        AppRoutes.completeProfileRecruiter,
        AppRoutes.completeProfileSchool,
      ];

      final isPublicRoute = publicRoutes.contains(currentPath);

      // If not logged in and trying to access protected route
      if (!isLoggedIn && !isPublicRoute) {
        return AppRoutes.login;
      }

      // If logged in and on login/signup pages, redirect to appropriate dashboard
      // But only if user has a role set - otherwise let them complete their profile
      if (isLoggedIn && (currentPath == AppRoutes.login ||
          currentPath.startsWith('/signup'))) {
        final userRole = authValue?.userRole;
        // Only redirect if user has a role - otherwise let them access signup/complete-profile
        if (userRole != null && userRole.isNotEmpty) {
          switch (userRole) {
            case 'candidate':
              return AppRoutes.candidate;
            case 'recruiter':
              return AppRoutes.recruiter;
            case 'school':
              return AppRoutes.school;
          }
        }
        // No role set - don't redirect, let them complete signup
        return null;
      }

      return null;
    },

    routes: [
      // Splash
      GoRoute(
        path: AppRoutes.splash,
        builder: (context, state) => const SplashScreen(),
      ),

      // Onboarding
      GoRoute(
        path: AppRoutes.onboarding,
        builder: (context, state) => const OnboardingScreen(),
      ),

      // Role Selection
      GoRoute(
        path: AppRoutes.roleSelection,
        builder: (context, state) => const RoleSelectionScreen(),
      ),

      // Auth
      GoRoute(
        path: AppRoutes.login,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: AppRoutes.signupCandidate,
        builder: (context, state) => const SignupCandidateScreen(),
      ),
      GoRoute(
        path: AppRoutes.signupRecruiter,
        builder: (context, state) => const SignupRecruiterScreen(),
      ),
      GoRoute(
        path: AppRoutes.signupSchool,
        builder: (context, state) => const SignupSchoolScreen(),
      ),
      GoRoute(
        path: AppRoutes.verifyEmail,
        builder: (context, state) => const VerifyEmailScreen(),
      ),
      GoRoute(
        path: AppRoutes.forgotPassword,
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: AppRoutes.mfa,
        builder: (context, state) => const MfaScreen(),
      ),

      // Profile Completion
      GoRoute(
        path: AppRoutes.completeProfileCandidate,
        builder: (context, state) => const CompleteProfileCandidateScreen(),
      ),
      GoRoute(
        path: AppRoutes.completeProfileRecruiter,
        builder: (context, state) => const CompleteProfileRecruiterScreen(),
      ),
      GoRoute(
        path: AppRoutes.completeProfileSchool,
        builder: (context, state) => const CompleteProfileSchoolScreen(),
      ),

      // Candidate Portal (Shell Route for bottom nav)
      ShellRoute(
        builder: (context, state, child) {
          return CandidateShell(child: child);
        },
        routes: [
          GoRoute(
            path: AppRoutes.candidate,
            builder: (context, state) => const CandidateDashboard(),
          ),
          GoRoute(
            path: AppRoutes.candidateJobs,
            builder: (context, state) => const JobListingsScreen(),
            routes: [
              GoRoute(
                path: ':jobId',
                builder: (context, state) {
                  final jobId = state.pathParameters['jobId'] ?? '';
                  return JobDetailScreen(jobId: jobId);
                },
              ),
            ],
          ),
          GoRoute(
            path: AppRoutes.candidateApplications,
            builder: (context, state) => const ApplicationsScreen(),
          ),
          GoRoute(
            path: AppRoutes.candidateMessages,
            builder: (context, state) => const InboxScreen(),
            routes: [
              GoRoute(
                path: 'new',
                builder: (context, state) {
                  final recipientId = state.uri.queryParameters['recipientId'];
                  final recipientName = state.uri.queryParameters['recipientName'];
                  final recipientOrg = state.uri.queryParameters['recipientOrg'];
                  return NewConversationScreen(
                    recipientId: recipientId,
                    recipientName: recipientName,
                    recipientOrganization: recipientOrg,
                  );
                },
              ),
              GoRoute(
                path: ':conversationId',
                builder: (context, state) {
                  final conversationId = state.pathParameters['conversationId'] ?? '';
                  return ConversationScreen(conversationId: conversationId);
                },
              ),
            ],
          ),
          GoRoute(
            path: AppRoutes.candidateProfile,
            builder: (context, state) => const CandidateProfileScreen(),
          ),
          GoRoute(
            path: AppRoutes.candidateEditProfile,
            builder: (context, state) => const EditProfileScreen(),
          ),
          GoRoute(
            path: AppRoutes.candidateSettings,
            builder: (context, state) => const SettingsScreen(userRole: 'candidate'),
          ),
        ],
      ),

      // Recruiter Portal (Shell Route for bottom nav)
      ShellRoute(
        builder: (context, state, child) {
          return RecruiterShell(child: child);
        },
        routes: [
          GoRoute(
            path: AppRoutes.recruiter,
            builder: (context, state) => const RecruiterDashboard(),
          ),
          GoRoute(
            path: AppRoutes.recruiterCandidates,
            builder: (context, state) => const CandidateSearchScreen(),
            routes: [
              GoRoute(
                path: 'saved',
                builder: (context, state) => const SavedCandidatesScreen(),
              ),
              GoRoute(
                path: ':candidateId',
                builder: (context, state) {
                  final candidateId = state.pathParameters['candidateId'] ?? '';
                  return CandidateDetailScreen(candidateId: candidateId);
                },
              ),
            ],
          ),
          GoRoute(
            path: AppRoutes.recruiterCampaigns,
            builder: (context, state) => const CampaignsScreen(),
            routes: [
              GoRoute(
                path: 'new',
                builder: (context, state) => const CampaignBuilderScreen(),
              ),
              GoRoute(
                path: ':campaignId',
                builder: (context, state) {
                  final campaignId = state.pathParameters['campaignId'] ?? '';
                  return CampaignDetailScreen(campaignId: campaignId);
                },
              ),
              GoRoute(
                path: ':campaignId/edit',
                builder: (context, state) {
                  final campaignId = state.pathParameters['campaignId'] ?? '';
                  return CampaignBuilderScreen(campaignId: campaignId);
                },
              ),
            ],
          ),
          GoRoute(
            path: AppRoutes.recruiterAnalytics,
            builder: (context, state) => const PlaceholderScreen(title: 'Analytics'),
          ),
          GoRoute(
            path: AppRoutes.recruiterSettings,
            builder: (context, state) => const SettingsScreen(userRole: 'recruiter'),
          ),
        ],
      ),

      // School Portal
      GoRoute(
        path: AppRoutes.school,
        builder: (context, state) => const PlaceholderScreen(title: 'School Dashboard'),
      ),

      // Shared Messages (accessible from any portal)
      GoRoute(
        path: AppRoutes.messages,
        builder: (context, state) => const InboxScreen(),
        routes: [
          GoRoute(
            path: 'new',
            builder: (context, state) {
              final recipientId = state.uri.queryParameters['recipientId'];
              final recipientName = state.uri.queryParameters['recipientName'];
              final recipientOrg = state.uri.queryParameters['recipientOrg'];
              return NewConversationScreen(
                recipientId: recipientId,
                recipientName: recipientName,
                recipientOrganization: recipientOrg,
              );
            },
          ),
          GoRoute(
            path: ':conversationId',
            builder: (context, state) {
              final conversationId = state.pathParameters['conversationId'] ?? '';
              return ConversationScreen(conversationId: conversationId);
            },
          ),
        ],
      ),
    ],

    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Page not found: ${state.matchedLocation}'),
      ),
    ),
  );
});

/// Candidate navigation shell with bottom nav bar
class CandidateShell extends StatelessWidget {
  final Widget child;

  const CandidateShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _calculateSelectedIndex(context),
        onDestinationSelected: (index) => _onItemTapped(index, context),
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
            label: 'Applications',
          ),
          NavigationDestination(
            icon: Icon(Icons.chat_bubble_outline),
            selectedIcon: Icon(Icons.chat_bubble),
            label: 'Messages',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  int _calculateSelectedIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    if (location.startsWith(AppRoutes.candidateJobs)) return 1;
    if (location.startsWith(AppRoutes.candidateApplications)) return 2;
    if (location.startsWith(AppRoutes.candidateMessages)) return 3;
    if (location.startsWith(AppRoutes.candidateProfile)) return 4;
    return 0;
  }

  void _onItemTapped(int index, BuildContext context) {
    switch (index) {
      case 0:
        context.go(AppRoutes.candidate);
        break;
      case 1:
        context.go(AppRoutes.candidateJobs);
        break;
      case 2:
        context.go(AppRoutes.candidateApplications);
        break;
      case 3:
        context.go(AppRoutes.candidateMessages);
        break;
      case 4:
        context.go(AppRoutes.candidateProfile);
        break;
    }
  }
}

/// Recruiter navigation shell with bottom nav bar
class RecruiterShell extends StatelessWidget {
  final Widget child;

  const RecruiterShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _calculateSelectedIndex(context),
        onDestinationSelected: (index) => _onItemTapped(index, context),
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
      ),
    );
  }

  int _calculateSelectedIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    if (location.startsWith(AppRoutes.recruiterCandidates)) return 1;
    if (location.startsWith(AppRoutes.recruiterCampaigns)) return 2;
    if (location.startsWith(AppRoutes.recruiterAnalytics)) return 3;
    if (location.startsWith(AppRoutes.recruiterSettings)) return 4;
    return 0;
  }

  void _onItemTapped(int index, BuildContext context) {
    switch (index) {
      case 0:
        context.go(AppRoutes.recruiter);
        break;
      case 1:
        context.go(AppRoutes.recruiterCandidates);
        break;
      case 2:
        context.go(AppRoutes.recruiterCampaigns);
        break;
      case 3:
        context.go(AppRoutes.recruiterAnalytics);
        break;
      case 4:
        context.go(AppRoutes.recruiterSettings);
        break;
    }
  }
}
