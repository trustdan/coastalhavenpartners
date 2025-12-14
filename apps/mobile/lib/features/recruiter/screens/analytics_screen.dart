import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/recruiter_analytics_provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';

/// Analytics dashboard for recruiters
class AnalyticsScreen extends ConsumerStatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  ConsumerState<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends ConsumerState<AnalyticsScreen> {
  String _selectedPeriod = '30d';
  bool _showSampleData = true;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final analyticsAsync = ref.watch(recruiterAnalyticsProvider);

    // Auto-clear sample data when real data comes in
    final hasRealData = analyticsAsync.whenOrNull(
      data: (analytics) => analytics.hasData,
    ) ?? false;

    // If real data exists, don't show sample data
    final showingSampleData = _showSampleData && !hasRealData;

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
          await ref.read(recruiterAnalyticsProvider.notifier).refresh();
        },
        child: SingleChildScrollView(
          padding: AppSpacing.screenPadding,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Sample Data Banner (only show if displaying sample data and no real data)
              if (showingSampleData) _buildSampleDataBanner(context, isDark),

              // Show real data, sample data, or empty state
              if (hasRealData)
                _buildRealDataContent(context, isDark, analyticsAsync.value!)
              else if (!showingSampleData)
                _buildEmptyState(context)
              else ...[
              // Summary Cards
              _buildSummarySection(context, isDark),
              AppSpacing.sectionGap,

              // Profile Views Chart
              _buildChartSection(
                context,
                isDark,
                title: 'Profile Views',
                subtitle: 'Candidate profile views over time',
                child: _buildLineChart(context, isDark),
              ),
              AppSpacing.sectionGap,

              // Engagement Metrics
              _buildChartSection(
                context,
                isDark,
                title: 'Engagement Breakdown',
                subtitle: 'How candidates interact with your listings',
                child: _buildEngagementBreakdown(context, isDark),
              ),
              AppSpacing.sectionGap,

              // Top Performing Jobs
              _buildChartSection(
                context,
                isDark,
                title: 'Top Performing Jobs',
                subtitle: 'Most viewed job listings',
                child: _buildTopJobsList(context, isDark),
              ),
              AppSpacing.sectionGap,

              // Campaign Performance
              _buildChartSection(
                context,
                isDark,
                title: 'Campaign Performance',
                subtitle: 'Outreach campaign statistics',
                child: _buildCampaignStats(context, isDark),
              ),
              const SizedBox(height: 100),
              ],
            ],
          ),
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
                  'Sample Analytics',
                  style: AppTextStyles.labelMedium.copyWith(
                    color: AppColors.warning,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'This is example data to show you what the analytics feature looks like.',
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
          'Remove all sample analytics data? This will show an empty analytics view until you have real data.',
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
      height: MediaQuery.of(context).size.height * 0.6,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.analytics_outlined,
              size: 64,
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
            const SizedBox(height: 16),
            Text('No analytics data yet', style: AppTextStyles.h4),
            const SizedBox(height: 8),
            Text(
              'Analytics will appear here once you have\nactive job listings and candidate activity.',
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

  /// Build content using real analytics data from the backend
  Widget _buildRealDataContent(
    BuildContext context,
    bool isDark,
    RecruiterAnalytics analytics,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Summary Cards with real data
        _buildRealSummarySection(context, isDark, analytics),
        AppSpacing.sectionGap,

        // Profile Views Chart
        if (analytics.monthlyViews.isNotEmpty)
          _buildChartSection(
            context,
            isDark,
            title: 'Profile Views',
            subtitle: 'Candidate profile views over time',
            child: _buildRealLineChart(context, isDark, analytics.monthlyViews),
          ),
        if (analytics.monthlyViews.isNotEmpty) AppSpacing.sectionGap,

        // Engagement Metrics
        if (analytics.engagementBreakdown.isNotEmpty)
          _buildChartSection(
            context,
            isDark,
            title: 'Engagement Breakdown',
            subtitle: 'How candidates interact with your listings',
            child: _buildRealEngagementBreakdown(
                context, isDark, analytics.engagementBreakdown),
          ),
        if (analytics.engagementBreakdown.isNotEmpty) AppSpacing.sectionGap,

        // Top Performing Jobs
        if (analytics.topJobs.isNotEmpty)
          _buildChartSection(
            context,
            isDark,
            title: 'Top Performing Jobs',
            subtitle: 'Most viewed job listings',
            child: _buildRealTopJobsList(context, isDark, analytics.topJobs),
          ),
        if (analytics.topJobs.isNotEmpty) AppSpacing.sectionGap,

        // Campaign Performance
        if (analytics.campaignStats.isNotEmpty)
          _buildChartSection(
            context,
            isDark,
            title: 'Campaign Performance',
            subtitle: 'Outreach campaign statistics',
            child:
                _buildRealCampaignStats(context, isDark, analytics.campaignStats),
          ),
        const SizedBox(height: 100),
      ],
    );
  }

  Widget _buildRealSummarySection(
    BuildContext context,
    bool isDark,
    RecruiterAnalytics analytics,
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
                label: 'Total Views',
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
                icon: Icons.people_outline,
                label: 'Interested',
                value: _formatNumber(analytics.interestedCount),
                change: _formatChange(analytics.interestedChange),
                isPositive: analytics.interestedChange >= 0,
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
                icon: Icons.description_outlined,
                label: 'Applications',
                value: _formatNumber(analytics.applicationsCount),
                change: _formatChange(analytics.applicationsChange),
                isPositive: analytics.applicationsChange >= 0,
              ),
            ),
            AppSpacing.hGapMd,
            Expanded(
              child: _buildMetricCard(
                context,
                isDark,
                icon: Icons.email_outlined,
                label: 'Messages',
                value: _formatNumber(analytics.messagesCount),
                change: _formatChange(analytics.messagesChange),
                isPositive: analytics.messagesChange >= 0,
              ),
            ),
          ],
        ),
      ],
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

  Widget _buildRealLineChart(BuildContext context, bool isDark, List<int> data) {
    if (data.isEmpty) return const SizedBox.shrink();
    final maxValue = data.reduce((a, b) => a > b ? a : b).toDouble();

    return Column(
      children: [
        SizedBox(
          height: 150,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: data.asMap().entries.map((entry) {
              final height = maxValue > 0 ? (entry.value / maxValue) * 130 : 0.0;
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 2),
                  child: Container(
                    height: height,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.bottomCenter,
                        end: Alignment.topCenter,
                        colors: [
                          AppColors.teal.withValues(alpha: 0.3),
                          AppColors.teal,
                        ],
                      ),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
        AppSpacing.itemGap,
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
              .take(data.length)
              .map((month) => Text(
                    month,
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

  Widget _buildRealEngagementBreakdown(
    BuildContext context,
    bool isDark,
    List<EngagementMetric> metrics,
  ) {
    final total = metrics.fold<int>(0, (sum, m) => sum + m.value);
    final colors = [AppColors.teal, AppColors.emerald, AppColors.green, AppColors.info];

    return Column(
      children: metrics.asMap().entries.map((entry) {
        final metric = entry.value;
        final color = colors[entry.key % colors.length];
        final percentage = total > 0 ? (metric.value / total * 100).round() : 0;
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(metric.label, style: AppTextStyles.labelSmall),
                  Text(
                    '${metric.value} ($percentage%)',
                    style: AppTextStyles.labelSmall.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: total > 0 ? metric.value / total : 0,
                  backgroundColor: isDark
                      ? Colors.white.withValues(alpha: 0.1)
                      : Colors.black.withValues(alpha: 0.1),
                  valueColor: AlwaysStoppedAnimation(color),
                  minHeight: 8,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildRealTopJobsList(
    BuildContext context,
    bool isDark,
    List<TopJob> jobs,
  ) {
    return Column(
      children: jobs.asMap().entries.map((entry) {
        final index = entry.key;
        final job = entry.value;
        return Container(
          margin: EdgeInsets.only(bottom: index < jobs.length - 1 ? 12 : 0),
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
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: AppColors.teal.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                alignment: Alignment.center,
                child: Text(
                  '${index + 1}',
                  style: AppTextStyles.labelMedium.copyWith(
                    color: AppColors.teal,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  job.title,
                  style: AppTextStyles.labelMedium,
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '${job.views} views',
                    style: AppTextStyles.caption.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  Text(
                    '${job.applications} apps',
                    style: AppTextStyles.caption.copyWith(
                      color: AppColors.success,
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildRealCampaignStats(
    BuildContext context,
    bool isDark,
    List<CampaignStat> campaigns,
  ) {
    return Column(
      children: campaigns.map((campaign) {
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isDark
                ? Colors.white.withValues(alpha: 0.05)
                : Colors.black.withValues(alpha: 0.02),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      campaign.name,
                      style: AppTextStyles.labelMedium,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: campaign.isActive
                          ? AppColors.success.withValues(alpha: 0.1)
                          : AppColors.info.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      campaign.isActive ? 'Active' : 'Completed',
                      style: AppTextStyles.caption.copyWith(
                        color: campaign.isActive ? AppColors.success : AppColors.info,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  _buildCampaignStat(context, 'Sent', '${campaign.sent}'),
                  _buildCampaignStat(
                      context, 'Open Rate', '${campaign.openRate.toStringAsFixed(0)}%'),
                  _buildCampaignStat(
                      context, 'Response', '${campaign.responseRate.toStringAsFixed(0)}%'),
                ],
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildSummarySection(BuildContext context, bool isDark) {
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
                label: 'Total Views',
                value: '2,847',
                change: '+12%',
                isPositive: true,
              ),
            ),
            AppSpacing.hGapMd,
            Expanded(
              child: _buildMetricCard(
                context,
                isDark,
                icon: Icons.people_outline,
                label: 'Interested',
                value: '156',
                change: '+8%',
                isPositive: true,
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
                icon: Icons.description_outlined,
                label: 'Applications',
                value: '89',
                change: '+24%',
                isPositive: true,
              ),
            ),
            AppSpacing.hGapMd,
            Expanded(
              child: _buildMetricCard(
                context,
                isDark,
                icon: Icons.email_outlined,
                label: 'Messages',
                value: '34',
                change: '-5%',
                isPositive: false,
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
    required String change,
    required bool isPositive,
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
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
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
            label,
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

  Widget _buildLineChart(BuildContext context, bool isDark) {
    // Simple mock chart visualization
    final data = [45, 52, 48, 61, 55, 67, 72, 68, 75, 82, 78, 89];
    final maxValue = data.reduce((a, b) => a > b ? a : b).toDouble();

    return Column(
      children: [
        SizedBox(
          height: 150,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: data.asMap().entries.map((entry) {
              final height = (entry.value / maxValue) * 130;
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 2),
                  child: Container(
                    height: height,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.bottomCenter,
                        end: Alignment.topCenter,
                        colors: [
                          AppColors.teal.withValues(alpha: 0.3),
                          AppColors.teal,
                        ],
                      ),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
        AppSpacing.itemGap,
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
              .map((month) => Text(
                    month.substring(0, 1),
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

  Widget _buildEngagementBreakdown(BuildContext context, bool isDark) {
    final metrics = [
      {'label': 'Profile Views', 'value': 847, 'color': AppColors.teal},
      {'label': 'Resume Downloads', 'value': 234, 'color': AppColors.emerald},
      {'label': 'Saved Profiles', 'value': 156, 'color': AppColors.green},
      {'label': 'Messages Sent', 'value': 89, 'color': AppColors.info},
    ];

    final total = metrics.fold<int>(0, (sum, m) => sum + (m['value'] as int));

    return Column(
      children: metrics.map((metric) {
        final percentage = ((metric['value'] as int) / total * 100).round();
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(metric['label'] as String, style: AppTextStyles.labelSmall),
                  Text(
                    '${metric['value']} ($percentage%)',
                    style: AppTextStyles.labelSmall.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: (metric['value'] as int) / total,
                  backgroundColor: isDark
                      ? Colors.white.withValues(alpha: 0.1)
                      : Colors.black.withValues(alpha: 0.1),
                  valueColor: AlwaysStoppedAnimation(metric['color'] as Color),
                  minHeight: 8,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildTopJobsList(BuildContext context, bool isDark) {
    final jobs = [
      {'title': 'Investment Banking Analyst', 'views': 423, 'apps': 28},
      {'title': 'Private Equity Associate', 'views': 356, 'apps': 19},
      {'title': 'Venture Capital Analyst', 'views': 287, 'apps': 15},
      {'title': 'M&A Associate', 'views': 234, 'apps': 12},
    ];

    return Column(
      children: jobs.asMap().entries.map((entry) {
        final index = entry.key;
        final job = entry.value;
        return Container(
          margin: EdgeInsets.only(bottom: index < jobs.length - 1 ? 12 : 0),
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
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: AppColors.teal.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                alignment: Alignment.center,
                child: Text(
                  '${index + 1}',
                  style: AppTextStyles.labelMedium.copyWith(
                    color: AppColors.teal,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  job['title'] as String,
                  style: AppTextStyles.labelMedium,
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '${job['views']} views',
                    style: AppTextStyles.caption.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  Text(
                    '${job['apps']} apps',
                    style: AppTextStyles.caption.copyWith(
                      color: AppColors.success,
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildCampaignStats(BuildContext context, bool isDark) {
    final campaigns = [
      {
        'name': 'Q4 Recruiting Drive',
        'sent': 150,
        'opened': 89,
        'responded': 34,
        'status': 'active'
      },
      {
        'name': 'MBA Summer Outreach',
        'sent': 200,
        'opened': 156,
        'responded': 67,
        'status': 'completed'
      },
      {
        'name': 'Tech Talent Search',
        'sent': 75,
        'opened': 45,
        'responded': 12,
        'status': 'active'
      },
    ];

    return Column(
      children: campaigns.map((campaign) {
        final openRate = ((campaign['opened'] as int) / (campaign['sent'] as int) * 100).round();
        final responseRate = ((campaign['responded'] as int) / (campaign['sent'] as int) * 100).round();
        final isActive = campaign['status'] == 'active';

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isDark
                ? Colors.white.withValues(alpha: 0.05)
                : Colors.black.withValues(alpha: 0.02),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      campaign['name'] as String,
                      style: AppTextStyles.labelMedium,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: isActive
                          ? AppColors.success.withValues(alpha: 0.1)
                          : AppColors.info.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      isActive ? 'Active' : 'Completed',
                      style: AppTextStyles.caption.copyWith(
                        color: isActive ? AppColors.success : AppColors.info,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  _buildCampaignStat(context, 'Sent', '${campaign['sent']}'),
                  _buildCampaignStat(context, 'Open Rate', '$openRate%'),
                  _buildCampaignStat(context, 'Response', '$responseRate%'),
                ],
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildCampaignStat(BuildContext context, String label, String value) {
    return Expanded(
      child: Column(
        children: [
          Text(
            value,
            style: AppTextStyles.labelLarge.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: AppTextStyles.caption.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }
}
