import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/services/analytics_service.dart';
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
import '../../features/auth/screens/mfa_setup_screen.dart';
import '../../features/auth/screens/complete_profile_candidate_screen.dart';
import '../../features/auth/screens/complete_profile_recruiter_screen.dart';
import '../../features/auth/screens/complete_profile_school_screen.dart';
import '../../features/candidate/screens/candidate_dashboard.dart';
import '../../features/candidate/screens/candidate_profile_screen.dart';
import '../../features/candidate/screens/edit_profile_screen.dart';
import '../../features/candidate/screens/job_listings_screen.dart';
import '../../features/candidate/screens/job_detail_screen.dart';
import '../../features/candidate/screens/saved_jobs_screen.dart';
import '../../features/candidate/screens/applications_screen.dart';
import '../../features/candidate/screens/candidate_analytics_screen.dart';
import '../../features/recruiter/screens/recruiter_dashboard.dart';
import '../../features/recruiter/screens/candidate_search_screen.dart';
import '../../features/recruiter/screens/candidate_detail_screen.dart';
import '../../features/recruiter/screens/saved_candidates_screen.dart';
import '../../features/recruiter/screens/campaigns_screen.dart';
import '../../features/recruiter/screens/campaign_builder_screen.dart';
import '../../features/recruiter/screens/campaign_detail_screen.dart';
import '../../features/recruiter/screens/analytics_screen.dart';
import '../../features/recruiter/screens/edit_recruiter_profile_screen.dart';
import '../../features/messaging/screens/inbox_screen.dart';
import '../../features/messaging/screens/conversation_screen.dart';
import '../../features/messaging/screens/new_conversation_screen.dart';
import '../../features/shared/screens/settings_screen.dart';
import '../../features/shared/screens/notifications_screen.dart';
import '../../features/shared/screens/verification_appeal_screen.dart';
import '../../features/school/screens/school_dashboard.dart';
import '../../features/school/screens/students_screen.dart';
import '../../features/school/widgets/school_shell.dart';
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
  static const mfaSetup = '/mfa/setup';
  static const completeProfileCandidate = '/complete-profile/candidate';
  static const completeProfileRecruiter = '/complete-profile/recruiter';
  static const completeProfileSchool = '/complete-profile/school';

  // Candidate Portal
  static const candidate = '/candidate';
  static const candidateJobs = '/candidate/jobs';
  static const candidateSavedJobs = '/candidate/jobs/saved';
  static const candidateApplications = '/candidate/applications';
  static const candidateMessages = '/candidate/messages';
  static const candidateProfile = '/candidate/profile';
  static const candidateEditProfile = '/candidate/edit-profile';
  static const candidateAnalytics = '/candidate/analytics';
  static const candidateSettings = '/candidate/settings';

  // Recruiter Portal
  static const recruiter = '/recruiter';
  static const recruiterCandidates = '/recruiter/candidates';
  static const recruiterCampaigns = '/recruiter/campaigns';
  static const recruiterNewCampaign = '/recruiter/campaigns/new';
  static const recruiterAnalytics = '/recruiter/analytics';
  static const recruiterEditProfile = '/recruiter/edit-profile';
  static const recruiterSettings = '/recruiter/settings';

  // School Portal
  static const school = '/school';
  static const schoolStudents = '/school/students';
  static const schoolMessages = '/school/messages';
  static const schoolSettings = '/school/settings';

  // Shared
  static const settings = '/settings';
  static const messages = '/messages';
  static const messagesNew = '/messages/new';
  static const notifications = '/notifications';
  static const verificationAppeal = '/verification-appeal';
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

  // Get analytics observer if available
  final analyticsObserver = AnalyticsService.instance.observer;

  return GoRouter(
    initialLocation: AppRoutes.splash,
    debugLogDiagnostics: true,
    refreshListenable: authChangeNotifier,
    observers: [
      if (analyticsObserver != null) analyticsObserver,
    ],

    // Redirect logic based on auth state
    redirect: (context, state) {
      final authState = ref.read(authStateProvider);
      final authValue = authState.hasValue ? authState.value : null;
      final isLoggedIn = authValue?.isAuthenticated ?? false;
      final isLoading = authState.isLoading;
      final currentPath = state.matchedLocation;

      // Get role from auth state, with fallback to user metadata
      String? userRole = authValue?.userRole;
      if ((userRole == null || userRole.isEmpty) && isLoggedIn) {
        // Fallback: Check user metadata directly (set during signup)
        userRole = authValue?.user?.userMetadata?['role'] as String?;
      }

      // Don't redirect while loading
      if (isLoading) return null;

      // Public routes that don't require auth (but NOT profile completion routes)
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
      ];

      // Profile completion routes - require auth AND matching role
      final profileCompletionRoutes = {
        AppRoutes.completeProfileCandidate: 'candidate',
        AppRoutes.completeProfileRecruiter: 'recruiter',
        AppRoutes.completeProfileSchool: 'school_admin',
      };

      final isPublicRoute = publicRoutes.contains(currentPath);
      final isProfileCompletionRoute = profileCompletionRoutes.containsKey(currentPath);

      // If not logged in and trying to access protected route
      if (!isLoggedIn && !isPublicRoute) {
        // Profile completion routes require login
        if (isProfileCompletionRoute) {
          return AppRoutes.login;
        }
        return AppRoutes.login;
      }

      // Handle profile completion routes - ensure user has matching role
      if (isLoggedIn && isProfileCompletionRoute) {
        final requiredRole = profileCompletionRoutes[currentPath];

        // If user has no role, redirect to role selection
        if (userRole == null || userRole.isEmpty) {
          return AppRoutes.roleSelection;
        }

        // If user's role doesn't match this profile completion screen, redirect to correct one
        if (userRole != requiredRole) {
          switch (userRole) {
            case 'candidate':
              return AppRoutes.completeProfileCandidate;
            case 'recruiter':
              return AppRoutes.completeProfileRecruiter;
            case 'school_admin':
              return AppRoutes.completeProfileSchool;
            default:
              return AppRoutes.roleSelection;
          }
        }

        // Role matches, allow access to profile completion
        return null;
      }

      // If logged in and on login/signup pages, redirect to appropriate destination
      if (isLoggedIn && (currentPath == AppRoutes.login ||
          currentPath.startsWith('/signup'))) {
        // If user has a role, redirect to profile completion (it will redirect to dashboard if complete)
        if (userRole != null && userRole.isNotEmpty) {
          switch (userRole) {
            case 'candidate':
              return AppRoutes.completeProfileCandidate;
            case 'recruiter':
              return AppRoutes.completeProfileRecruiter;
            case 'school_admin':
              return AppRoutes.completeProfileSchool;
          }
        }
        // No role set - redirect to role selection
        return AppRoutes.roleSelection;
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
        builder: (context, state) {
          final email = state.uri.queryParameters['email'];
          return VerifyEmailScreen(email: email);
        },
      ),
      GoRoute(
        path: AppRoutes.forgotPassword,
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: AppRoutes.mfa,
        builder: (context, state) => const MfaScreen(),
      ),
      GoRoute(
        path: AppRoutes.mfaSetup,
        builder: (context, state) => const MfaSetupScreen(),
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
                path: 'saved',
                builder: (context, state) => const SavedJobsScreen(),
              ),
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
            path: AppRoutes.candidateAnalytics,
            builder: (context, state) => const CandidateAnalyticsScreen(),
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
            builder: (context, state) => const AnalyticsScreen(),
          ),
          GoRoute(
            path: AppRoutes.recruiterEditProfile,
            builder: (context, state) => const EditRecruiterProfileScreen(),
          ),
          GoRoute(
            path: AppRoutes.recruiterSettings,
            builder: (context, state) => const SettingsScreen(userRole: 'recruiter'),
          ),
        ],
      ),

      // School Portal (Shell Route for bottom nav)
      ShellRoute(
        builder: (context, state, child) {
          return SchoolShell(child: child);
        },
        routes: [
          GoRoute(
            path: AppRoutes.school,
            builder: (context, state) => const SchoolDashboard(),
          ),
          GoRoute(
            path: AppRoutes.schoolStudents,
            builder: (context, state) => const StudentsScreen(),
          ),
          GoRoute(
            path: AppRoutes.schoolMessages,
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
            path: AppRoutes.schoolSettings,
            builder: (context, state) => const SettingsScreen(userRole: 'school_admin'),
          ),
        ],
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

      // Notifications (accessible from any portal)
      GoRoute(
        path: AppRoutes.notifications,
        builder: (context, state) => const NotificationsScreen(),
      ),

      // Verification Appeal (accessible from any portal)
      GoRoute(
        path: AppRoutes.verificationAppeal,
        builder: (context, state) {
          final userRole = state.uri.queryParameters['role'] ?? 'candidate';
          final appealType = state.uri.queryParameters['type'];
          AppealType? initialType;
          if (appealType != null) {
            initialType = AppealType.values.firstWhere(
              (t) => t.name == appealType,
              orElse: () => AppealType.other,
            );
          }
          return VerificationAppealScreen(
            userRole: userRole,
            initialAppealType: initialType,
          );
        },
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
            label: 'Apply',
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
