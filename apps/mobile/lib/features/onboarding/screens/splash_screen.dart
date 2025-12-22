import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/router/app_router.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../data/services/local_storage_service.dart';
import '../../../widgets/magic_ui/magic_ui.dart';

/// Set to true to show dev testing buttons on splash screen
const bool _devMode = false;

/// Splash screen shown on app launch
/// Shows animated logo and navigates based on auth state
class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOutBack,
      ),
    );

    _opacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.5, curve: Curves.easeOut),
      ),
    );

    _controller.forward();

    // Navigate after animation (skip in dev mode to allow testing)
    if (!_devMode) {
      Future.delayed(const Duration(milliseconds: 2500), () {
        if (mounted) {
          _navigateBasedOnState();
        }
      });
    }
  }

  /// Navigate based on auth state and onboarding status
  Future<void> _navigateBasedOnState() async {
    // Check if user has completed onboarding
    final hasCompletedOnboarding =
        await LocalStorageService.instance.hasCompletedOnboarding();

    // Check auth state
    final authState = ref.read(authStateProvider);
    final isAuthenticated =
        authState.hasValue && (authState.value?.isAuthenticated ?? false);

    // Get role from auth state, with fallback to user metadata
    String? userRole = authState.hasValue ? authState.value?.userRole : null;
    if ((userRole == null || userRole.isEmpty) && isAuthenticated) {
      // Fallback: Check user metadata directly
      final user = authState.value?.user;
      userRole = user?.userMetadata?['role'] as String?;
    }

    if (!mounted) return;

    if (!hasCompletedOnboarding) {
      // New user - show onboarding
      context.go(AppRoutes.onboarding);
    } else if (isAuthenticated && userRole != null && userRole.isNotEmpty) {
      // Authenticated user with role - go to profile completion
      // (profile completion screens will redirect to dashboard if profile is already complete)
      switch (userRole) {
        case 'candidate':
          context.go(AppRoutes.completeProfileCandidate);
          break;
        case 'recruiter':
          context.go(AppRoutes.completeProfileRecruiter);
          break;
        case 'school_admin':
          context.go(AppRoutes.completeProfileSchool);
          break;
        case 'admin':
          // Admin users go directly to admin dashboard (no profile completion needed)
          context.go(AppRoutes.admin);
          break;
        default:
          context.go(AppRoutes.roleSelection);
      }
    } else if (isAuthenticated && userRole == null) {
      // Authenticated but no role - go to role selection
      context.go(AppRoutes.roleSelection);
    } else {
      // Not authenticated - go to login
      context.go(AppRoutes.login);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      body: MeteorsBackground(
        meteorCount: 6,
        child: SafeArea(
          child: Column(
            children: [
              Expanded(
                child: Center(
                  child: AnimatedBuilder(
                    animation: _controller,
                    builder: (context, child) {
                      return Opacity(
                        opacity: _opacityAnimation.value,
                        child: Transform.scale(
                          scale: _scaleAnimation.value,
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              // Logo placeholder
                              Container(
                                width: 100,
                                height: 100,
                                decoration: BoxDecoration(
                                  gradient: AppColors.brandGradient,
                                  borderRadius: BorderRadius.circular(24),
                                  boxShadow: [
                                    BoxShadow(
                                      color: AppColors.teal.withValues(alpha: 0.4),
                                      blurRadius: 30,
                                      spreadRadius: 5,
                                    ),
                                  ],
                                ),
                                child: const Center(
                                  child: Text(
                                    'CH',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 36,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 24),
                              // App name
                              ShimmerText(
                                text: 'Coastal Haven',
                                style: AppTextStyles.h1.copyWith(
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Partners',
                                style: AppTextStyles.h3.copyWith(
                                  color: AppColors.textSecondaryDark,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
              // Dev mode quick access buttons
              if (_devMode) _buildDevButtons(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDevButtons(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.warning.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              'DEV MODE - Quick Navigation',
              style: AppTextStyles.labelSmall.copyWith(
                color: AppColors.warning,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 12),
          // Main flow button
          OutlinedButton(
            onPressed: () => context.go(AppRoutes.onboarding),
            child: const Text('Start Onboarding Flow'),
          ),
          const SizedBox(height: 8),
          // Login button for returning users
          TextButton(
            onPressed: () => context.go(AppRoutes.login),
            child: Text(
              'Already have an account? Sign In',
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.teal,
              ),
            ),
          ),
          const SizedBox(height: 8),
          // Profile completion screens
          Row(
            children: [
              Expanded(
                child: _DevButton(
                  label: 'Candidate\nProfile',
                  icon: Icons.school,
                  color: AppColors.teal,
                  onTap: () => context.go(AppRoutes.completeProfileCandidate),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _DevButton(
                  label: 'Recruiter\nProfile',
                  icon: Icons.business,
                  color: AppColors.emerald,
                  onTap: () => context.go(AppRoutes.completeProfileRecruiter),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _DevButton(
                  label: 'School\nProfile',
                  icon: Icons.account_balance,
                  color: AppColors.green,
                  onTap: () => context.go(AppRoutes.completeProfileSchool),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}

class _DevButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _DevButton({
    required this.label,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 4),
            Text(
              label,
              style: AppTextStyles.labelSmall.copyWith(color: color),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
