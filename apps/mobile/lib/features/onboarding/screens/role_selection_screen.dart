import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/router/app_router.dart';
import '../../../widgets/magic_ui/magic_ui.dart';

/// Role selection screen
/// Users choose whether they're a candidate, recruiter, or school admin
class RoleSelectionScreen extends StatelessWidget {
  const RoleSelectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
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
                      onTap: () => context.go(AppRoutes.signupCandidate),
                    ),

                    const SizedBox(height: 16),

                    // Recruiter
                    _RoleCard(
                      icon: Icons.business_outlined,
                      title: 'Recruiter',
                      description: 'I\'m hiring elite finance talent',
                      gradientColors: [AppColors.emerald, AppColors.green],
                      onTap: () => context.go(AppRoutes.signupRecruiter),
                    ),

                    const SizedBox(height: 16),

                    // School/Career Services
                    _RoleCard(
                      icon: Icons.account_balance_outlined,
                      title: 'Career Services',
                      description: 'I support students at my institution',
                      gradientColors: [AppColors.green, AppColors.teal],
                      onTap: () => context.go(AppRoutes.signupSchool),
                    ),
                  ],
                ),
              ),

              // Sign in link
              Center(
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 24),
                  child: Row(
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
