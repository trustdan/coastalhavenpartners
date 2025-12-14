import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/router/app_router.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/admin_provider.dart';
import '../../../widgets/magic_ui/magic_ui.dart';

/// Admin dashboard screen
/// Shows overview stats and quick actions for admins
class AdminDashboard extends ConsumerWidget {
  const AdminDashboard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);
    final user = authState.hasValue ? authState.value?.user : null;
    final statsAsync = ref.watch(adminDashboardStatsNotifierProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'Admin Dashboard',
          style: AppTextStyles.h3.copyWith(color: AppColors.textPrimaryDark),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined,
                color: AppColors.textPrimaryDark),
            onPressed: () => context.push(AppRoutes.notifications),
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            await ref
                .read(adminDashboardStatsNotifierProvider.notifier)
                .refresh();
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: AppSpacing.screenPadding,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Welcome section
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        AppColors.teal.withValues(alpha: 0.2),
                        AppColors.emerald.withValues(alpha: 0.1),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: AppColors.teal.withValues(alpha: 0.3),
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          color: AppColors.teal.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Icon(
                          Icons.admin_panel_settings,
                          color: AppColors.teal,
                          size: 28,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Welcome back',
                              style: AppTextStyles.bodyMedium.copyWith(
                                color: AppColors.textSecondaryDark,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              user?.email ?? 'Admin',
                              style: AppTextStyles.h4.copyWith(
                                color: AppColors.textPrimaryDark,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Quick stats section
                Text(
                  'Overview',
                  style: AppTextStyles.h4.copyWith(
                    color: AppColors.textPrimaryDark,
                  ),
                ),
                const SizedBox(height: 16),

                // Stats grid - with real data
                statsAsync.when(
                  data: (stats) => Column(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: _StatCard(
                              icon: Icons.pending_actions,
                              label: 'Pending',
                              value: stats.pendingVerifications.toString(),
                              color: AppColors.warning,
                              onTap: () =>
                                  context.go(AppRoutes.adminVerification),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _StatCard(
                              icon: Icons.verified_user,
                              label: 'Verified Today',
                              value: stats.verifiedToday.toString(),
                              color: AppColors.teal,
                              onTap: () =>
                                  context.go(AppRoutes.adminVerification),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: _StatCard(
                              icon: Icons.support_agent,
                              label: 'Open Tickets',
                              value: stats.openTickets.toString(),
                              color: AppColors.info,
                              onTap: () => context.go(AppRoutes.adminSupport),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _StatCard(
                              icon: Icons.people,
                              label: 'Total Users',
                              value: stats.totalUsers.toString(),
                              color: AppColors.emerald,
                              onTap: () => context.go(AppRoutes.adminCandidates),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  loading: () => Column(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: _StatCard(
                              icon: Icons.pending_actions,
                              label: 'Pending',
                              value: '--',
                              color: AppColors.warning,
                              onTap: () =>
                                  context.go(AppRoutes.adminVerification),
                              isLoading: true,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _StatCard(
                              icon: Icons.verified_user,
                              label: 'Verified Today',
                              value: '--',
                              color: AppColors.teal,
                              onTap: () =>
                                  context.go(AppRoutes.adminVerification),
                              isLoading: true,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: _StatCard(
                              icon: Icons.support_agent,
                              label: 'Open Tickets',
                              value: '--',
                              color: AppColors.info,
                              onTap: () => context.go(AppRoutes.adminSupport),
                              isLoading: true,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _StatCard(
                              icon: Icons.people,
                              label: 'Total Users',
                              value: '--',
                              color: AppColors.emerald,
                              onTap: () => context.go(AppRoutes.adminCandidates),
                              isLoading: true,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  error: (_, __) => Column(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: _StatCard(
                              icon: Icons.pending_actions,
                              label: 'Pending',
                              value: '0',
                              color: AppColors.warning,
                              onTap: () =>
                                  context.go(AppRoutes.adminVerification),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _StatCard(
                              icon: Icons.verified_user,
                              label: 'Verified Today',
                              value: '0',
                              color: AppColors.teal,
                              onTap: () =>
                                  context.go(AppRoutes.adminVerification),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: _StatCard(
                              icon: Icons.support_agent,
                              label: 'Open Tickets',
                              value: '0',
                              color: AppColors.info,
                              onTap: () => context.go(AppRoutes.adminSupport),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _StatCard(
                              icon: Icons.people,
                              label: 'Total Users',
                              value: '0',
                              color: AppColors.emerald,
                              onTap: () => context.go(AppRoutes.adminCandidates),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 32),

                // Quick actions section
                Text(
                  'Quick Actions',
                  style: AppTextStyles.h4.copyWith(
                    color: AppColors.textPrimaryDark,
                  ),
                ),
                const SizedBox(height: 16),

                _ActionCard(
                  icon: Icons.verified_user_outlined,
                  title: 'Verification Queue',
                  description: 'Review and verify candidate profiles',
                  gradientColors: [AppColors.teal, AppColors.emerald],
                  onTap: () => context.go(AppRoutes.adminVerification),
                ),
                const SizedBox(height: 12),

                _ActionCard(
                  icon: Icons.people_outline,
                  title: 'Manage Candidates',
                  description: 'View and manage all candidates',
                  gradientColors: [AppColors.emerald, AppColors.green],
                  onTap: () => context.go(AppRoutes.adminCandidates),
                ),
                const SizedBox(height: 12),

                _ActionCard(
                  icon: Icons.support_agent_outlined,
                  title: 'Support Inbox',
                  description: 'View and respond to support requests',
                  gradientColors: [AppColors.info, AppColors.teal],
                  onTap: () => context.go(AppRoutes.adminSupport),
                ),

                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;
  final VoidCallback onTap;
  final bool isLoading;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
    required this.onTap,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardDark,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: color.withValues(alpha: 0.3),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 12),
            if (isLoading)
              SizedBox(
                height: 32,
                width: 32,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(color),
                ),
              )
            else
              Text(
                value,
                style: AppTextStyles.h2.copyWith(
                  color: AppColors.textPrimaryDark,
                ),
              ),
            const SizedBox(height: 4),
            Text(
              label,
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.textSecondaryDark,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final List<Color> gradientColors;
  final VoidCallback onTap;

  const _ActionCard({
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
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  gradientColors.first.withValues(alpha: 0.2),
                  gradientColors.last.withValues(alpha: 0.1),
                ],
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              icon,
              color: gradientColors.first,
              size: 24,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTextStyles.labelLarge.copyWith(
                    color: AppColors.textPrimaryDark,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.textSecondaryDark,
                  ),
                ),
              ],
            ),
          ),
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
