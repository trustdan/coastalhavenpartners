import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/router/app_router.dart';
import '../../../widgets/magic_ui/magic_ui.dart';

/// School Dashboard - Main home screen for school administrators
/// Shows student stats, placement metrics, and upcoming events
class SchoolDashboard extends ConsumerStatefulWidget {
  const SchoolDashboard({super.key});

  @override
  ConsumerState<SchoolDashboard> createState() => _SchoolDashboardState();
}

class _SchoolDashboardState extends ConsumerState<SchoolDashboard> {
  bool _showSampleData = true;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () => context.push(AppRoutes.notifications),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          // Refresh data
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: AppSpacing.screenPadding,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Sample Data Banner
              if (_showSampleData) _buildSampleDataBanner(context, isDark),

              // Greeting
              _buildGreeting(context),
              AppSpacing.subsectionGap,

              // Stats Overview
              if (_showSampleData) ...[
                _buildStatsOverview(context, isDark),
                AppSpacing.sectionGap,

                // Placement Rate Card
                _buildPlacementRateCard(context, isDark),
                AppSpacing.sectionGap,

                // Recent Activity
                _buildRecentActivity(context, isDark),
                AppSpacing.sectionGap,

                // Quick Actions
                _buildQuickActions(context, isDark),
                AppSpacing.sectionGap,
              ] else
                _buildEmptyState(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSampleDataBanner(BuildContext context, bool isDark) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.warning.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: AppColors.warning.withValues(alpha: 0.3),
        ),
      ),
      child: Row(
        children: [
          Icon(
            Icons.info_outline,
            size: 20,
            color: AppColors.warning,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Sample Data',
                  style: AppTextStyles.labelMedium.copyWith(
                    color: AppColors.warning,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'This is example data to preview the dashboard.',
                  style: AppTextStyles.caption.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: _clearSampleData,
            style: TextButton.styleFrom(
              foregroundColor: AppColors.warning,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            ),
            child: const Text('Clear'),
          ),
        ],
      ),
    );
  }

  void _clearSampleData() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear Sample Data'),
        content: const Text(
          'Remove all sample data? This will show an empty dashboard until you have real students and activity.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() {
                _showSampleData = false;
              });
              ScaffoldMessenger.of(this.context).showSnackBar(
                const SnackBar(content: Text('Sample data cleared')),
              );
            },
            child: const Text('Clear'),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return SizedBox(
      height: MediaQuery.of(context).size.height * 0.5,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.school_outlined,
              size: 64,
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
            const SizedBox(height: 16),
            Text('No data yet', style: AppTextStyles.h4),
            const SizedBox(height: 8),
            Text(
              'Your dashboard will populate once you\nhave students and activity.',
              style: AppTextStyles.bodyMedium.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGreeting(BuildContext context) {
    final hour = DateTime.now().hour;
    String greeting;
    if (hour < 12) {
      greeting = 'Good morning';
    } else if (hour < 17) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          greeting,
          style: AppTextStyles.bodyMedium.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Career Services',
          style: AppTextStyles.h2,
        ),
      ],
    );
  }

  Widget _buildStatsOverview(BuildContext context, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Overview',
          style: AppTextStyles.h4,
        ),
        AppSpacing.itemGap,
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                context,
                isDark,
                icon: Icons.people_outline,
                value: 156,
                label: 'Total Students',
                color: AppColors.teal,
              ),
            ),
            AppSpacing.hGapMd,
            Expanded(
              child: _buildStatCard(
                context,
                isDark,
                icon: Icons.verified_outlined,
                value: 142,
                label: 'Verified',
                color: AppColors.success,
              ),
            ),
          ],
        ),
        AppSpacing.itemGap,
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                context,
                isDark,
                icon: Icons.work_outline,
                value: 48,
                label: 'Placed',
                color: AppColors.info,
              ),
            ),
            AppSpacing.hGapMd,
            Expanded(
              child: _buildStatCard(
                context,
                isDark,
                icon: Icons.schedule,
                value: 14,
                label: 'Pending Review',
                color: AppColors.warning,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatCard(
    BuildContext context,
    bool isDark, {
    required IconData icon,
    required int value,
    required String label,
    required Color color,
  }) {
    return Container(
      padding: AppSpacing.cardPadding,
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: AppRadius.card,
        border: Border.all(
          color: isDark ? AppColors.borderDark : AppColors.borderLight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: color),
          AppSpacing.itemGap,
          NumberTicker(
            value: value,
            style: AppTextStyles.stat,
            useGradient: true,
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: AppTextStyles.statLabel.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlacementRateCard(BuildContext context, bool isDark) {
    const placementRate = 0.68; // 68%

    return ShineBorderCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Placement Rate',
                    style: AppTextStyles.h4,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'This recruiting season',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Text(
                  '${(placementRate * 100).toInt()}%',
                  style: AppTextStyles.h3.copyWith(
                    color: AppColors.success,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          AppSpacing.subsectionGap,
          LinearProgressIndicator(
            value: placementRate,
            minHeight: 8,
            borderRadius: BorderRadius.circular(4),
            backgroundColor: isDark ? AppColors.borderDark : AppColors.borderLight,
            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.success),
          ),
          AppSpacing.itemGap,
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '48 of 71 active job seekers placed',
                style: AppTextStyles.caption.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
              ),
              Icon(
                Icons.trending_up,
                size: 16,
                color: AppColors.success,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRecentActivity(BuildContext context, bool isDark) {
    final activities = [
      _ActivityItem(
        icon: Icons.person_add_outlined,
        title: 'New student registered',
        subtitle: 'Sarah Johnson joined the platform',
        time: '2h ago',
        color: AppColors.teal,
      ),
      _ActivityItem(
        icon: Icons.check_circle_outline,
        title: 'Placement confirmed',
        subtitle: 'Michael Chen accepted offer at Goldman Sachs',
        time: '5h ago',
        color: AppColors.success,
      ),
      _ActivityItem(
        icon: Icons.business_outlined,
        title: 'New recruiter partnership',
        subtitle: 'Blackstone joined the network',
        time: '1d ago',
        color: AppColors.info,
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Recent Activity',
              style: AppTextStyles.h4,
            ),
            TextButton(
              onPressed: () {
                // TODO: Navigate to full activity log
              },
              child: const Text('See all'),
            ),
          ],
        ),
        AppSpacing.itemGap,
        ...activities.map((activity) => _buildActivityTile(context, isDark, activity)),
      ],
    );
  }

  Widget _buildActivityTile(
    BuildContext context,
    bool isDark,
    _ActivityItem activity,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: AppSpacing.listItemPadding,
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: AppRadius.card,
        border: Border.all(
          color: isDark ? AppColors.borderDark : AppColors.borderLight,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: activity.color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              activity.icon,
              color: activity.color,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  activity.title,
                  style: AppTextStyles.labelMedium,
                ),
                Text(
                  activity.subtitle,
                  style: AppTextStyles.caption.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          Text(
            activity.time,
            style: AppTextStyles.caption.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Quick Actions',
          style: AppTextStyles.h4,
        ),
        AppSpacing.itemGap,
        Row(
          children: [
            Expanded(
              child: _buildActionCard(
                context,
                isDark,
                icon: Icons.person_add_outlined,
                label: 'Invite Student',
                onTap: () {
                  // TODO: Open invite dialog
                },
              ),
            ),
            AppSpacing.hGapMd,
            Expanded(
              child: _buildActionCard(
                context,
                isDark,
                icon: Icons.email_outlined,
                label: 'Send Announcement',
                onTap: () {
                  // TODO: Open announcement composer
                },
              ),
            ),
          ],
        ),
        AppSpacing.itemGap,
        Row(
          children: [
            Expanded(
              child: _buildActionCard(
                context,
                isDark,
                icon: Icons.assessment_outlined,
                label: 'View Reports',
                onTap: () {
                  // TODO: Navigate to reports
                },
              ),
            ),
            AppSpacing.hGapMd,
            Expanded(
              child: _buildActionCard(
                context,
                isDark,
                icon: Icons.download_outlined,
                label: 'Export Data',
                onTap: () {
                  // TODO: Open export options
                },
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActionCard(
    BuildContext context,
    bool isDark, {
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: AppRadius.card,
      child: Container(
        padding: AppSpacing.cardPadding,
        decoration: BoxDecoration(
          color: isDark ? AppColors.cardDark : AppColors.cardLight,
          borderRadius: AppRadius.card,
          border: Border.all(
            color: isDark ? AppColors.borderDark : AppColors.borderLight,
          ),
        ),
        child: Column(
          children: [
            Icon(icon, color: AppColors.teal, size: 28),
            const SizedBox(height: 8),
            Text(
              label,
              style: AppTextStyles.labelSmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _ActivityItem {
  final IconData icon;
  final String title;
  final String subtitle;
  final String time;
  final Color color;

  _ActivityItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.time,
    required this.color,
  });
}
