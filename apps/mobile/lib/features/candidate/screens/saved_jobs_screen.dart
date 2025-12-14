import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/providers/job_provider.dart';
import '../../../core/router/app_router.dart';
import '../../../data/models/models.dart';

/// Saved Jobs Screen - Shows jobs saved by the candidate
class SavedJobsScreen extends ConsumerWidget {
  const SavedJobsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final savedJobsAsync = ref.watch(savedJobsNotifierProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Saved Jobs'),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(savedJobsNotifierProvider);
        },
        child: savedJobsAsync.when(
          data: (jobs) {
            if (jobs.isEmpty) {
              return _buildEmptyState(context);
            }
            return ListView.builder(
              padding: AppSpacing.screenPadding,
              itemCount: jobs.length,
              itemBuilder: (context, index) {
                final job = jobs[index];
                return _SavedJobCard(
                  job: job,
                  isDark: isDark,
                  onTap: () => context.push('${AppRoutes.candidateJobs}/${job.id}'),
                  onUnsave: () {
                    ref.read(savedJobsNotifierProvider.notifier).unsaveJob(job.id);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: const Text('Job removed from saved'),
                        action: SnackBarAction(
                          label: 'Undo',
                          onPressed: () {
                            ref.read(savedJobsNotifierProvider.notifier).saveJob(job.id);
                          },
                        ),
                      ),
                    );
                  },
                );
              },
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, stack) => Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 48, color: AppColors.error),
                const SizedBox(height: 16),
                Text('Error loading saved jobs'),
                const SizedBox(height: 8),
                ElevatedButton(
                  onPressed: () => ref.invalidate(savedJobsNotifierProvider),
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.bookmark_border,
            size: 64,
            color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.3),
          ),
          const SizedBox(height: 16),
          Text(
            'No saved jobs yet',
            style: AppTextStyles.h4.copyWith(
              color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Save jobs you\'re interested in to review later',
            style: AppTextStyles.bodySmall.copyWith(
              color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.4),
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => context.go(AppRoutes.candidateJobs),
            child: const Text('Browse Jobs'),
          ),
        ],
      ),
    );
  }
}

/// Individual saved job card
class _SavedJobCard extends StatelessWidget {
  final JobListing job;
  final bool isDark;
  final VoidCallback onTap;
  final VoidCallback onUnsave;

  const _SavedJobCard({
    required this.job,
    required this.isDark,
    required this.onTap,
    required this.onUnsave,
  });

  @override
  Widget build(BuildContext context) {
    final daysUntilDeadline = job.daysUntilDeadline;

    return Dismissible(
      key: Key(job.id),
      direction: DismissDirection.endToStart,
      onDismissed: (_) => onUnsave(),
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 16),
        decoration: BoxDecoration(
          color: AppColors.error,
          borderRadius: AppRadius.card,
        ),
        child: const Icon(Icons.bookmark_remove, color: Colors.white),
      ),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: isDark ? AppColors.cardDark : AppColors.cardLight,
          borderRadius: AppRadius.card,
          border: Border.all(
            color: isDark ? AppColors.borderDark : AppColors.borderLight,
          ),
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            borderRadius: AppRadius.card,
            child: Padding(
              padding: AppSpacing.cardPadding,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      // Firm Logo
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: isDark
                              ? Colors.white.withValues(alpha: 0.1)
                              : Colors.black.withValues(alpha: 0.05),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: job.firmLogo != null
                            ? ClipRRect(
                                borderRadius: BorderRadius.circular(7),
                                child: Image.network(
                                  job.firmLogo!,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => Center(
                                    child: Text(
                                      job.firmName.isNotEmpty
                                          ? job.firmName.substring(0, 1)
                                          : 'F',
                                      style: AppTextStyles.labelLarge.copyWith(
                                        color: AppColors.teal,
                                      ),
                                    ),
                                  ),
                                ),
                              )
                            : Center(
                                child: Text(
                                  job.firmName.isNotEmpty
                                      ? job.firmName.substring(0, 1)
                                      : 'F',
                                  style: AppTextStyles.labelLarge.copyWith(
                                    color: AppColors.teal,
                                  ),
                                ),
                              ),
                      ),
                      const SizedBox(width: 12),
                      // Job Details
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              job.title,
                              style: AppTextStyles.labelMedium.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              job.firmName,
                              style: AppTextStyles.bodySmall.copyWith(
                                color: Theme.of(context).colorScheme.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Unsave Button
                      IconButton(
                        onPressed: onUnsave,
                        icon: const Icon(Icons.bookmark),
                        color: AppColors.teal,
                        tooltip: 'Remove from saved',
                      ),
                    ],
                  ),
                  AppSpacing.itemGap,
                  // Tags
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      if (job.locations?.isNotEmpty == true)
                        _buildTag(
                          context,
                          Icons.location_on_outlined,
                          job.locations!.first,
                        ),
                      _buildTag(
                        context,
                        Icons.work_outline,
                        job.jobType.displayName,
                      ),
                      if (job.compensationRange != null)
                        _buildTag(
                          context,
                          Icons.attach_money,
                          job.compensationRange!,
                          isHighlight: true,
                        ),
                    ],
                  ),
                  // Deadline Warning
                  if (daysUntilDeadline != null && daysUntilDeadline <= 14) ...[
                    AppSpacing.itemGap,
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: daysUntilDeadline <= 7
                            ? AppColors.error.withValues(alpha: 0.1)
                            : AppColors.warning.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.schedule,
                            size: 14,
                            color: daysUntilDeadline <= 7
                                ? AppColors.error
                                : AppColors.warning,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            daysUntilDeadline <= 0
                                ? 'Deadline passed'
                                : '$daysUntilDeadline days left',
                            style: AppTextStyles.caption.copyWith(
                              color: daysUntilDeadline <= 7
                                  ? AppColors.error
                                  : AppColors.warning,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTag(BuildContext context, IconData icon, String text,
      {bool isHighlight = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isHighlight
            ? AppColors.success.withValues(alpha: 0.1)
            : Theme.of(context).colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 14,
            color: isHighlight
                ? AppColors.success
                : Theme.of(context).colorScheme.onSurfaceVariant,
          ),
          const SizedBox(width: 4),
          Text(
            text,
            style: AppTextStyles.caption.copyWith(
              color: isHighlight
                  ? AppColors.success
                  : Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }
}
