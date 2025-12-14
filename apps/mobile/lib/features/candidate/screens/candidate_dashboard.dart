import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/router/app_router.dart';
import '../../../core/providers/providers.dart';
import '../../../core/providers/candidate_analytics_provider.dart';
import '../../../data/models/models.dart';
import '../../../widgets/magic_ui/magic_ui.dart';

/// Candidate Dashboard - Main home screen for candidates
/// Shows profile completion, activity stats, recent viewers, and deadlines
class CandidateDashboard extends ConsumerWidget {
  const CandidateDashboard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final candidateProfileAsync = ref.watch(candidateProfileProvider);
    final matchingJobsAsync = ref.watch(matchingJobsProvider);
    final applicationsAsync = ref.watch(myApplicationsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              // TODO: Navigate to notifications
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          // Invalidate providers to refresh data
          ref.invalidate(candidateProfileProvider);
          ref.invalidate(matchingJobsProvider);
          ref.invalidate(myApplicationsProvider);
        },
        child: candidateProfileAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, stack) => Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 48, color: Colors.red),
                const SizedBox(height: 16),
                Text('Error loading profile: $error'),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => ref.invalidate(candidateProfileProvider),
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
          data: (profile) => SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: AppSpacing.screenPadding,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Greeting
                _buildGreeting(context, profile?.displayName ?? 'there'),
                AppSpacing.subsectionGap,

                // Profile Completion Card
                _buildProfileCompletionCard(context, isDark, profile),
                AppSpacing.subsectionGap,

                // Activity Stats
                _buildActivityStats(context, isDark, ref),
                AppSpacing.subsectionGap,

                // Matching Jobs
                matchingJobsAsync.when(
                  loading: () => const SizedBox.shrink(),
                  error: (_, __) => const SizedBox.shrink(),
                  data: (jobs) => jobs.isNotEmpty
                      ? _buildMatchingJobs(context, isDark, jobs)
                      : const SizedBox.shrink(),
                ),

                // Upcoming Deadlines from applications
                applicationsAsync.when(
                  loading: () => const SizedBox.shrink(),
                  error: (_, __) => const SizedBox.shrink(),
                  data: (applications) {
                    final pendingApps = applications
                        .where((a) => a.status == ApplicationStatus.pending)
                        .take(3)
                        .toList();
                    return pendingApps.isNotEmpty
                        ? _buildUpcomingDeadlines(context, isDark, pendingApps)
                        : const SizedBox.shrink();
                  },
                ),
                AppSpacing.sectionGap,
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildGreeting(BuildContext context, String name) {
    final hour = DateTime.now().hour;
    String greeting;
    if (hour < 12) {
      greeting = 'Good morning';
    } else if (hour < 17) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }

    // Get first name only
    final firstName = name.split(' ').first;

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
          firstName,
          style: AppTextStyles.h2,
        ),
      ],
    );
  }

  Widget _buildProfileCompletionCard(
    BuildContext context,
    bool isDark,
    CandidateProfile? profile,
  ) {
    final completionPercentage = profile?.completionPercentage ?? 0;

    // Calculate incomplete items
    final incompleteItems = <String>[];
    if (profile != null) {
      if (profile.bio == null || profile.bio!.isEmpty) {
        incompleteItems.add('Add a professional bio');
      }
      if (profile.resumeUrl == null) {
        incompleteItems.add('Upload your resume');
      }
      if (profile.transcriptUrl == null) {
        incompleteItems.add('Upload your transcript');
      }
      if (profile.targetRoles == null || profile.targetRoles!.isEmpty) {
        incompleteItems.add('Select target roles');
      }
      if (profile.preferredLocations == null || profile.preferredLocations!.isEmpty) {
        incompleteItems.add('Add preferred locations');
      }
      if (profile.schedulingUrl == null) {
        incompleteItems.add('Add calendar link');
      }
    }

    return ShineBorderCard(
      onTap: () => context.push(AppRoutes.candidateEditProfile),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Profile Completion',
                      style: AppTextStyles.h4,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Complete your profile to get noticed',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              Stack(
                alignment: Alignment.center,
                children: [
                  SizedBox(
                    width: 56,
                    height: 56,
                    child: CircularProgressIndicator(
                      value: completionPercentage / 100,
                      strokeWidth: 6,
                      backgroundColor: isDark
                          ? AppColors.borderDark
                          : AppColors.borderLight,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        completionPercentage >= 80
                            ? AppColors.success
                            : completionPercentage >= 50
                                ? AppColors.warning
                                : AppColors.error,
                      ),
                    ),
                  ),
                  Text(
                    '$completionPercentage%',
                    style: AppTextStyles.labelMedium.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ],
          ),
          if (incompleteItems.isNotEmpty) ...[
            AppSpacing.subsectionGap,
            Divider(
              color: isDark ? AppColors.borderDark : AppColors.borderLight,
            ),
            AppSpacing.itemGap,
            ...incompleteItems.take(3).map((item) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    children: [
                      Icon(
                        Icons.circle_outlined,
                        size: 16,
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          item,
                          style: AppTextStyles.bodySmall,
                        ),
                      ),
                    ],
                  ),
                )),
            AppSpacing.itemGap,
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () => context.push(AppRoutes.candidateEditProfile),
                child: const Text('Complete Profile'),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildActivityStats(BuildContext context, bool isDark, WidgetRef ref) {
    final analyticsAsync = ref.watch(candidateAnalyticsProvider);

    return analyticsAsync.when(
      loading: () => _buildActivityStatsContent(context, isDark, 0, 0, null),
      error: (_, __) => _buildActivityStatsContent(context, isDark, 0, 0, null),
      data: (analytics) => _buildActivityStatsContent(
        context,
        isDark,
        analytics.totalViews,
        analytics.uniqueFirms,
        analytics.viewsChange,
      ),
    );
  }

  Widget _buildActivityStatsContent(
    BuildContext context,
    bool isDark,
    int profileViews,
    int uniqueFirms,
    double? viewsChange,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Activity',
              style: AppTextStyles.h4,
            ),
            TextButton(
              onPressed: () => context.push(AppRoutes.candidateAnalytics),
              child: const Text('View all'),
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
                icon: Icons.visibility_outlined,
                value: profileViews,
                label: 'Profile Views',
                trend: viewsChange != null && viewsChange != 0
                    ? '${viewsChange >= 0 ? '+' : ''}${viewsChange.toStringAsFixed(0)}%'
                    : null,
                trendPositive: viewsChange != null && viewsChange >= 0,
              ),
            ),
            AppSpacing.hGapMd,
            Expanded(
              child: _buildStatCard(
                context,
                isDark,
                icon: Icons.business_outlined,
                value: uniqueFirms,
                label: 'Unique Firms',
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
    String? trend,
    bool trendPositive = true,
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(
                icon,
                size: 20,
                color: AppColors.teal,
              ),
              if (trend != null)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 6,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: trendPositive
                        ? AppColors.success.withValues(alpha: 0.1)
                        : AppColors.error.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    trend,
                    style: AppTextStyles.badge.copyWith(
                      color: trendPositive ? AppColors.success : AppColors.error,
                    ),
                  ),
                ),
            ],
          ),
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

  Widget _buildMatchingJobs(
    BuildContext context,
    bool isDark,
    List<JobListing> jobs,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Jobs For You',
              style: AppTextStyles.h4,
            ),
            TextButton(
              onPressed: () => context.go(AppRoutes.candidateJobs),
              child: const Text('See all'),
            ),
          ],
        ),
        AppSpacing.itemGap,
        ...jobs.take(3).map((job) => _buildJobTile(context, isDark, job)),
        AppSpacing.subsectionGap,
      ],
    );
  }

  Widget _buildJobTile(BuildContext context, bool isDark, JobListing job) {
    return GestureDetector(
      onTap: () => context.push('${AppRoutes.candidateJobs}/${job.id}'),
      child: Container(
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
            // Firm logo or placeholder
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.teal.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: job.firmLogo != null
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.network(
                        job.firmLogo!,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Center(
                          child: Text(
                            job.firmName.substring(0, 1),
                            style: AppTextStyles.h4.copyWith(color: AppColors.teal),
                          ),
                        ),
                      ),
                    )
                  : Center(
                      child: Text(
                        job.firmName.substring(0, 1),
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
                    job.title,
                    style: AppTextStyles.labelMedium,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    job.firmName,
                    style: AppTextStyles.caption.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
            if (job.daysUntilDeadline != null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: job.daysUntilDeadline! <= 3
                      ? AppColors.error.withValues(alpha: 0.1)
                      : AppColors.teal.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  '${job.daysUntilDeadline}d left',
                  style: AppTextStyles.badge.copyWith(
                    color: job.daysUntilDeadline! <= 3
                        ? AppColors.error
                        : AppColors.teal,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildUpcomingDeadlines(
    BuildContext context,
    bool isDark,
    List<Application> applications,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'My Applications',
              style: AppTextStyles.h4,
            ),
            TextButton(
              onPressed: () => context.go(AppRoutes.candidateApplications),
              child: const Text('See all'),
            ),
          ],
        ),
        AppSpacing.itemGap,
        ...applications.map((app) => _buildApplicationTile(context, isDark, app)),
        AppSpacing.subsectionGap,
      ],
    );
  }

  Widget _buildApplicationTile(
    BuildContext context,
    bool isDark,
    Application application,
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
          // Status indicator
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: _getStatusColor(application.status).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              _getStatusIcon(application.status),
              color: _getStatusColor(application.status),
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  application.jobTitle,
                  style: AppTextStyles.labelMedium,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  application.firmName,
                  style: AppTextStyles.caption.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: _getStatusColor(application.status).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              _getStatusLabel(application.status),
              style: AppTextStyles.badge.copyWith(
                color: _getStatusColor(application.status),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(ApplicationStatus status) {
    switch (status) {
      case ApplicationStatus.pending:
        return AppColors.statusPending;
      case ApplicationStatus.reviewing:
        return AppColors.statusReviewing;
      case ApplicationStatus.interviewed:
        return AppColors.statusInterviewed;
      case ApplicationStatus.accepted:
        return AppColors.statusAccepted;
      case ApplicationStatus.rejected:
        return AppColors.statusRejected;
      case ApplicationStatus.withdrawn:
        return AppColors.textMutedDark;
    }
  }

  IconData _getStatusIcon(ApplicationStatus status) {
    switch (status) {
      case ApplicationStatus.pending:
        return Icons.schedule;
      case ApplicationStatus.reviewing:
        return Icons.visibility;
      case ApplicationStatus.interviewed:
        return Icons.people;
      case ApplicationStatus.accepted:
        return Icons.check_circle;
      case ApplicationStatus.rejected:
        return Icons.cancel;
      case ApplicationStatus.withdrawn:
        return Icons.undo;
    }
  }

  String _getStatusLabel(ApplicationStatus status) {
    // Use the displayName from the enum for consistency
    return status.displayName;
  }
}
