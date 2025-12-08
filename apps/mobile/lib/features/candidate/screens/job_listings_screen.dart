import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/providers/providers.dart';
import '../../../data/models/models.dart';

/// Job Listings Screen - Browse available job opportunities
class JobListingsScreen extends ConsumerStatefulWidget {
  const JobListingsScreen({super.key});

  @override
  ConsumerState<JobListingsScreen> createState() => _JobListingsScreenState();
}

class _JobListingsScreenState extends ConsumerState<JobListingsScreen> {
  final _searchController = TextEditingController();
  JobType? _selectedJobType;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final jobsAsync = ref.watch(jobListingsProvider(JobListingsParams(
      searchQuery: _searchController.text.isEmpty ? null : _searchController.text,
      jobType: _selectedJobType,
    )));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Jobs'),
        actions: [
          IconButton(
            icon: const Icon(Icons.bookmark_outline),
            onPressed: () {
              // TODO: Navigate to saved jobs
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: AppSpacing.screenPaddingHorizontal,
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search jobs...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          setState(() {});
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
                filled: true,
                fillColor: isDark ? AppColors.cardDark : AppColors.cardLight,
              ),
              onChanged: (_) => setState(() {}),
            ),
          ),
          AppSpacing.itemGap,

          // Filter Chips
          SizedBox(
            height: 40,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: AppSpacing.screenPaddingHorizontal,
              children: [
                _buildFilterChip(context, 'All', null),
                const SizedBox(width: 8),
                _buildFilterChip(context, 'Full-Time', JobType.fullTime),
                const SizedBox(width: 8),
                _buildFilterChip(context, 'Internship', JobType.internship),
                const SizedBox(width: 8),
                _buildFilterChip(context, 'Summer Analyst', JobType.summerAnalyst),
                const SizedBox(width: 8),
                _buildFilterChip(context, 'Off-Cycle', JobType.offCycle),
              ],
            ),
          ),
          AppSpacing.subsectionGap,

          // Results Count
          Padding(
            padding: AppSpacing.screenPaddingHorizontal,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                jobsAsync.when(
                  loading: () => Text(
                    'Loading...',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  error: (_, __) => Text(
                    '0 jobs found',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  data: (jobs) => Text(
                    '${jobs.length} jobs found',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                ),
                TextButton.icon(
                  onPressed: _showSortOptions,
                  icon: const Icon(Icons.sort, size: 18),
                  label: const Text('Sort'),
                ),
              ],
            ),
          ),

          // Job List
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async {
                ref.invalidate(jobListingsProvider(JobListingsParams(
                  searchQuery: _searchController.text.isEmpty ? null : _searchController.text,
                  jobType: _selectedJobType,
                )));
              },
              child: jobsAsync.when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (error, stack) => Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 48, color: Colors.red),
                      const SizedBox(height: 16),
                      Text('Error loading jobs: $error'),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () => ref.invalidate(jobListingsProvider(JobListingsParams())),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                ),
                data: (jobs) {
                  if (jobs.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.work_outline,
                            size: 64,
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'No jobs found',
                            style: AppTextStyles.h4.copyWith(
                              color: Theme.of(context).colorScheme.onSurfaceVariant,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Try adjusting your search or filters',
                            style: AppTextStyles.bodySmall.copyWith(
                              color: Theme.of(context).colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    );
                  }
                  return ListView.separated(
                    padding: AppSpacing.screenPadding,
                    itemCount: jobs.length,
                    separatorBuilder: (_, __) => AppSpacing.subsectionGap,
                    itemBuilder: (context, index) {
                      final job = jobs[index];
                      return _buildJobCard(context, isDark, job);
                    },
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(BuildContext context, String label, JobType? jobType) {
    final isSelected = _selectedJobType == jobType;
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) {
        setState(() => _selectedJobType = jobType);
      },
      selectedColor: AppColors.teal.withValues(alpha: 0.2),
      checkmarkColor: AppColors.teal,
      side: BorderSide(
        color: isSelected
            ? AppColors.teal
            : Theme.of(context).colorScheme.outline,
      ),
    );
  }

  Widget _buildJobCard(BuildContext context, bool isDark, JobListing job) {
    final daysUntilDeadline = job.daysUntilDeadline;
    final isUrgent = daysUntilDeadline != null && daysUntilDeadline <= 7;

    return GestureDetector(
      onTap: () => context.push('/candidate/jobs/${job.id}'),
      child: Container(
        padding: AppSpacing.cardPadding,
        decoration: BoxDecoration(
          color: isDark ? AppColors.cardDark : AppColors.cardLight,
          borderRadius: AppRadius.card,
          border: Border.all(
            color: isUrgent
                ? AppColors.warning.withValues(alpha: 0.5)
                : (isDark ? AppColors.borderDark : AppColors.borderLight),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Row
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Company Logo
                Container(
                  width: 48,
                  height: 48,
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
                                job.firmName.isNotEmpty ? job.firmName.substring(0, 1) : 'F',
                                style: AppTextStyles.h3.copyWith(color: AppColors.teal),
                              ),
                            ),
                          ),
                        )
                      : Center(
                          child: Text(
                            job.firmName.isNotEmpty ? job.firmName.substring(0, 1) : 'F',
                            style: AppTextStyles.h3.copyWith(color: AppColors.teal),
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
                        style: AppTextStyles.labelLarge,
                        maxLines: 2,
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
                if (job.isFeatured)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.teal.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      'Featured',
                      style: AppTextStyles.badge.copyWith(color: AppColors.teal),
                    ),
                  ),
              ],
            ),
            AppSpacing.subsectionGap,

            // Tags Row
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                if (job.locations != null && job.locations!.isNotEmpty)
                  _buildTag(context, Icons.location_on_outlined, job.locations!.first),
                _buildTag(context, Icons.work_outline, job.jobType.displayName),
                if (job.compensationRange != null)
                  _buildTag(context, Icons.attach_money, job.compensationRange!, isHighlight: true),
              ],
            ),
            AppSpacing.subsectionGap,

            // Footer Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  job.publishedAt != null
                      ? 'Posted ${_formatTimeAgo(job.publishedAt!)}'
                      : 'New listing',
                  style: AppTextStyles.caption.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
                if (daysUntilDeadline != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: isUrgent
                          ? AppColors.warning.withValues(alpha: 0.1)
                          : AppColors.info.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      isUrgent
                          ? '$daysUntilDeadline days left'
                          : 'Due ${_formatDate(job.applicationDeadline!)}',
                      style: AppTextStyles.badge.copyWith(
                        color: isUrgent ? AppColors.warning : AppColors.info,
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTag(BuildContext context, IconData icon, String text, {bool isHighlight = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isHighlight
            ? AppColors.success.withValues(alpha: 0.1)
            : Theme.of(context).colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(4),
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

  void _showSortOptions() {
    showModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.access_time),
              title: const Text('Most Recent'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.schedule),
              title: const Text('Deadline (Soonest)'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.business),
              title: const Text('Company (A-Z)'),
              onTap: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }

  String _formatTimeAgo(DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inDays == 0) return 'today';
    if (diff.inDays == 1) return 'yesterday';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${(diff.inDays / 7).floor()}w ago';
  }

  String _formatDate(DateTime date) {
    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${months[date.month - 1]} ${date.day}';
  }
}
