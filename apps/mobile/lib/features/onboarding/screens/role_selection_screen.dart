import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/router/app_router.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../widgets/magic_ui/magic_ui.dart';

/// Role selection screen
/// Users choose whether they're a candidate, recruiter, or school admin
class RoleSelectionScreen extends ConsumerWidget {
  const RoleSelectionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);
    final isLoggedIn = authState.hasValue && authState.value!.isAuthenticated;
    final userEmail = authState.hasValue ? authState.value!.user?.email : null;
    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.textPrimaryDark),
          onPressed: () => context.go(AppRoutes.onboarding),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: AppSpacing.screenPadding,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 24),

              // Title
              Text(
                'I am a...',
                style: AppTextStyles.h1.copyWith(
                  color: AppColors.textPrimaryDark,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Choose your role to get started',
                style: AppTextStyles.bodyLarge.copyWith(
                  color: AppColors.textSecondaryDark,
                ),
              ),

              // Auth status indicator
              if (isLoggedIn) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.teal.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: AppColors.teal.withValues(alpha: 0.3),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.check_circle,
                        size: 16,
                        color: AppColors.teal,
                      ),
                      const SizedBox(width: 8),
                      Flexible(
                        child: Text(
                          'Signed in as $userEmail',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.teal,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 40),

              // Role cards
              Expanded(
                child: Column(
                  children: [
                    // Candidate
                    _RoleCard(
                      icon: Icons.school_outlined,
                      title: 'Candidate',
                      description:
                          'I\'m looking for opportunities in finance',
                      gradientColors: [AppColors.teal, AppColors.emerald],
                      onTap: () => context.go(
                        isLoggedIn
                          ? AppRoutes.completeProfileCandidate
                          : AppRoutes.signupCandidate,
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Recruiter
                    _RoleCard(
                      icon: Icons.business_outlined,
                      title: 'Recruiter',
                      description: 'I\'m hiring elite finance talent',
                      gradientColors: [AppColors.emerald, AppColors.green],
                      onTap: () => context.go(
                        isLoggedIn
                          ? AppRoutes.completeProfileRecruiter
                          : AppRoutes.signupRecruiter,
                      ),
                    ),

                    const SizedBox(height: 16),

                    // School/Career Services
                    _RoleCard(
                      icon: Icons.account_balance_outlined,
                      title: 'Career Services',
                      description: 'I support students at my institution',
                      gradientColors: [AppColors.green, AppColors.teal],
                      onTap: () => context.go(
                        isLoggedIn
                          ? AppRoutes.completeProfileSchool
                          : AppRoutes.signupSchool,
                      ),
                    ),
                  ],
                ),
              ),

              // Sign in/out link
              Center(
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 24),
                  child: isLoggedIn
                    ? GestureDetector(
                        onTap: () async {
                          await ref.read(authStateProvider.notifier).signOut();
                          if (context.mounted) {
                            context.go(AppRoutes.onboarding);
                          }
                        },
                        child: Text(
                          'Sign out',
                          style: AppTextStyles.labelMedium.copyWith(
                            color: AppColors.textMutedDark,
                          ),
                        ),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Already have an account? ',
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: AppColors.textSecondaryDark,
                            ),
                          ),
                          GestureDetector(
                            onTap: () => context.go(AppRoutes.login),
                            child: Text(
                              'Sign in',
                              style: AppTextStyles.labelMedium.copyWith(
                                color: AppColors.teal,
                              ),
                            ),
                          ),
                        ],
                      ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final List<Color> gradientColors;
  final VoidCallback onTap;

  const _RoleCard({
    required this.icon,
    required this.title,
    required this.description,
    required this.gradientColors,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ShineBorderCard(
      shineColors: gradientColors,
      backgroundColor: AppColors.cardDark,
      onTap: onTap,
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          // Icon container
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  gradientColors.first.withValues(alpha: 0.2),
                  gradientColors.last.withValues(alpha: 0.1),
                ],
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(
              icon,
              color: gradientColors.first,
              size: 28,
            ),
          ),
          const SizedBox(width: 16),

          // Text content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTextStyles.h4.copyWith(
                    color: AppColors.textPrimaryDark,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.textSecondaryDark,
                  ),
                ),
              ],
            ),
          ),

          // Arrow
          Icon(
            Icons.arrow_forward_ios,
            color: AppColors.textMutedDark,
            size: 16,
          ),
        ],
      ),
    );
  }
}
