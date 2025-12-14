import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/providers/candidate_analytics_provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';

/// Analytics dashboard for candidates
/// Shows profile views, firm engagement, and application stats
class CandidateAnalyticsScreen extends ConsumerStatefulWidget {
  const CandidateAnalyticsScreen({super.key});

  @override
  ConsumerState<CandidateAnalyticsScreen> createState() =>
      _CandidateAnalyticsScreenState();
}

class _CandidateAnalyticsScreenState
    extends ConsumerState<CandidateAnalyticsScreen> {
  String _selectedPeriod = '30d';

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final analyticsAsync = ref.watch(candidateAnalyticsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Analytics'),
        actions: [
          PopupMenuButton<String>(
            initialValue: _selectedPeriod,
            onSelected: (value) => setState(() => _selectedPeriod = value),
            itemBuilder: (context) => [
              const PopupMenuItem(value: '7d', child: Text('Last 7 days')),
              const PopupMenuItem(value: '30d', child: Text('Last 30 days')),
              const PopupMenuItem(value: '90d', child: Text('Last 90 days')),
              const PopupMenuItem(value: 'all', child: Text('All time')),
            ],
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    _getPeriodLabel(_selectedPeriod),
                    style: AppTextStyles.labelMedium.copyWith(
                      color: AppColors.teal,
                    ),
                  ),
                  const Icon(Icons.arrow_drop_down, color: AppColors.teal),
                ],
              ),
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await ref.read(candidateAnalyticsProvider.notifier).refresh();
        },
        child: analyticsAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, stack) => _buildErrorState(context, error),
          data: (analytics) => analytics.hasData
              ? _buildContent(context, isDark, analytics)
              : _buildEmptyState(context, isDark),
        ),
      ),
    );
  }

  String _getPeriodLabel(String period) {
    switch (period) {
      case '7d':
        return 'Last 7 days';
      case '30d':
        return 'Last 30 days';
      case '90d':
        return 'Last 90 days';
      case 'all':
        return 'All time';
      default:
        return 'Last 30 days';
    }
  }

  Widget _buildErrorState(BuildContext context, Object error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 48, color: Colors.red),
          const SizedBox(height: 16),
          Text('Error loading analytics'),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () =>
                ref.read(candidateAnalyticsProvider.notifier).refresh(),
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, bool isDark) {
    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      child: SizedBox(
        height: MediaQuery.of(context).size.height * 0.7,
        child: Center(
          child: Padding(
            padding: AppSpacing.screenPadding,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: AppColors.teal.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.analytics_outlined,
                    size: 64,
                    color: AppColors.teal,
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'No Activity Yet',
                  style: AppTextStyles.h3,
                ),
                const SizedBox(height: 12),
                Text(
                  'Analytics will appear here once recruiters\nstart viewing your profile.',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                OutlinedButton.icon(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.edit_outlined),
                  label: const Text('Complete Your Profile'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildContent(
    BuildContext context,
    bool isDark,
    CandidateAnalytics analytics,
  ) {
    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: AppSpacing.screenPadding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Overview Stats
          _buildOverviewSection(context, isDark, analytics),
          AppSpacing.sectionGap,

          // Profile Views Chart
          _buildChartSection(
            context,
            isDark,
            title: 'Profile Views',
            subtitle: 'Weekly views from recruiters',
            child: _buildWeeklyChart(context, isDark, analytics.weeklyViewsData),
          ),
          AppSpacing.sectionGap,

          // Recent Viewers
          if (analytics.recentViewers.isNotEmpty) ...[
            _buildChartSection(
              context,
              isDark,
              title: 'Who Viewed Your Profile',
              subtitle: 'Firms that have viewed your profile',
              child: _buildRecentViewersList(
                  context, isDark, analytics.recentViewers),
            ),
            AppSpacing.sectionGap,
          ],

          // Activity Summary
          _buildChartSection(
            context,
            isDark,
            title: 'Your Activity',
            subtitle: 'Applications and conversations',
            child: _buildActivitySummary(context, isDark, analytics),
          ),

          const SizedBox(height: 100),
        ],
      ),
    );
  }

  Widget _buildOverviewSection(
    BuildContext context,
    bool isDark,
    CandidateAnalytics analytics,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Overview', style: AppTextStyles.h4),
        AppSpacing.itemGap,
        Row(
          children: [
            Expanded(
              child: _buildMetricCard(
                context,
                isDark,
                icon: Icons.visibility_outlined,
                label: 'Profile Views',
                value: _formatNumber(analytics.totalViews),
                change: _formatChange(analytics.viewsChange),
                isPositive: analytics.viewsChange >= 0,
              ),
            ),
            AppSpacing.hGapMd,
            Expanded(
              child: _buildMetricCard(
                context,
                isDark,
                icon: Icons.business_outlined,
                label: 'Unique Firms',
                value: _formatNumber(analytics.uniqueFirms),
                subtitle: 'viewed your profile',
              ),
            ),
          ],
        ),
        AppSpacing.itemGap,
        Row(
          children: [
            Expanded(
              child: _buildMetricCard(
                context,
                isDark,
                icon: Icons.calendar_month_outlined,
                label: 'This Month',
                value: _formatNumber(analytics.monthlyViews),
                subtitle: 'profile views',
              ),
            ),
            AppSpacing.hGapMd,
            Expanded(
              child: _buildMetricCard(
                context,
                isDark,
                icon: Icons.trending_up_outlined,
                label: 'This Week',
                value: _formatNumber(analytics.weeklyViews),
                subtitle: 'profile views',
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildMetricCard(
    BuildContext context,
    bool isDark, {
    required IconData icon,
    required String label,
    required String value,
    String? change,
    bool? isPositive,
    String? subtitle,
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
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.teal.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, size: 18, color: AppColors.teal),
              ),
              const Spacer(),
              if (change != null && isPositive != null)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: isPositive
                        ? AppColors.success.withValues(alpha: 0.1)
                        : AppColors.error.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    change,
                    style: AppTextStyles.caption.copyWith(
                      color: isPositive ? AppColors.success : AppColors.error,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
            ],
          ),
          AppSpacing.itemGap,
          Text(value, style: AppTextStyles.h2),
          const SizedBox(height: 4),
          Text(
            subtitle ?? label,
            style: AppTextStyles.caption.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChartSection(
    BuildContext context,
    bool isDark, {
    required String title,
    required String subtitle,
    required Widget child,
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
          Text(title, style: AppTextStyles.h4),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: AppTextStyles.caption.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
          AppSpacing.subsectionGap,
          child,
        ],
      ),
    );
  }

  Widget _buildWeeklyChart(
      BuildContext context, bool isDark, List<int> data) {
    if (data.isEmpty) {
      return const SizedBox(height: 100);
    }

    final maxValue = data.reduce((a, b) => a > b ? a : b).toDouble();
    final weeks = _getWeekLabels();

    return Column(
      children: [
        SizedBox(
          height: 120,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: data.asMap().entries.map((entry) {
              final height = maxValue > 0 ? (entry.value / maxValue) * 100 : 0.0;
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      if (entry.value > 0)
                        Text(
                          entry.value.toString(),
                          style: AppTextStyles.caption.copyWith(
                            fontSize: 10,
                            color:
                                Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                        ),
                      const SizedBox(height: 4),
                      Container(
                        height: height.clamp(4.0, 100.0),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.bottomCenter,
                            end: Alignment.topCenter,
                            colors: [
                              AppColors.teal.withValues(alpha: 0.4),
                              AppColors.teal,
                            ],
                          ),
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ),
        AppSpacing.itemGap,
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: weeks
              .map((week) => Text(
                    week,
                    style: AppTextStyles.caption.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                      fontSize: 10,
                    ),
                  ))
              .toList(),
        ),
      ],
    );
  }

  List<String> _getWeekLabels() {
    final now = DateTime.now();
    final labels = <String>[];
    for (int i = 7; i >= 0; i--) {
      final weekStart = now.subtract(Duration(days: i * 7));
      labels.add(DateFormat('M/d').format(weekStart));
    }
    return labels;
  }

  Widget _buildRecentViewersList(
    BuildContext context,
    bool isDark,
    List<ProfileViewer> viewers,
  ) {
    return Column(
      children: viewers.map((viewer) {
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isDark
                ? Colors.white.withValues(alpha: 0.05)
                : Colors.black.withValues(alpha: 0.02),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppColors.teal.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Text(
                    viewer.firmName.isNotEmpty
                        ? viewer.firmName[0].toUpperCase()
                        : '?',
                    style: AppTextStyles.h4.copyWith(color: AppColors.teal),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      viewer.firmName,
                      style: AppTextStyles.labelMedium,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      _formatViewedAt(viewer.viewedAt),
                      style: AppTextStyles.caption.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.teal.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${viewer.viewCount} ${viewer.viewCount == 1 ? 'view' : 'views'}',
                  style: AppTextStyles.caption.copyWith(
                    color: AppColors.teal,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  String _formatViewedAt(DateTime viewedAt) {
    final now = DateTime.now();
    final difference = now.difference(viewedAt);

    if (difference.inDays == 0) {
      if (difference.inHours == 0) {
        return '${difference.inMinutes} min ago';
      }
      return '${difference.inHours} hours ago';
    } else if (difference.inDays == 1) {
      return 'Yesterday';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} days ago';
    } else {
      return DateFormat('MMM d').format(viewedAt);
    }
  }

  Widget _buildActivitySummary(
    BuildContext context,
    bool isDark,
    CandidateAnalytics analytics,
  ) {
    final activities = [
      {
        'icon': Icons.description_outlined,
        'label': 'Applications Submitted',
        'value': analytics.applicationsCount,
        'color': AppColors.teal,
      },
      {
        'icon': Icons.bookmark_outlined,
        'label': 'Saved by Recruiters',
        'value': analytics.savedByRecruiters,
        'color': AppColors.emerald,
      },
      {
        'icon': Icons.chat_bubble_outline,
        'label': 'Conversations',
        'value': analytics.messagesCount,
        'color': AppColors.info,
      },
    ];

    return Column(
      children: activities.map((activity) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color:
                      (activity['color'] as Color).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  activity['icon'] as IconData,
                  size: 20,
                  color: activity['color'] as Color,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  activity['label'] as String,
                  style: AppTextStyles.labelMedium,
                ),
              ),
              Text(
                '${activity['value']}',
                style: AppTextStyles.h4.copyWith(
                  color: activity['color'] as Color,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  String _formatNumber(int value) {
    if (value >= 1000) {
      return '${(value / 1000).toStringAsFixed(1)}k';
    }
    return value.toString();
  }

  String _formatChange(double change) {
    final sign = change >= 0 ? '+' : '';
    return '$sign${change.toStringAsFixed(0)}%';
  }
}
