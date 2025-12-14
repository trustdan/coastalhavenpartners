import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/providers/providers.dart';
import '../../../data/models/models.dart';
import '../../../widgets/magic_ui/magic_ui.dart';

/// Job Detail Screen - Full job information with apply option
class JobDetailScreen extends ConsumerStatefulWidget {
  final String jobId;

  const JobDetailScreen({super.key, required this.jobId});

  @override
  ConsumerState<JobDetailScreen> createState() => _JobDetailScreenState();
}

class _JobDetailScreenState extends ConsumerState<JobDetailScreen> {
  bool _isApplying = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final jobAsync = ref.watch(jobListingProvider(widget.jobId));
    final hasAppliedAsync = ref.watch(hasAppliedProvider(widget.jobId));
    final candidateProfileAsync = ref.watch(candidateProfileProvider);

    return jobAsync.when(
      loading: () => Scaffold(
        appBar: AppBar(),
        body: const Center(child: CircularProgressIndicator()),
      ),
      error: (error, stack) => Scaffold(
        appBar: AppBar(),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text('Error loading job: $error'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(jobListingProvider(widget.jobId)),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
      data: (job) {
        if (job == null) {
          return Scaffold(
            appBar: AppBar(),
            body: const Center(
              child: Text('Job not found'),
            ),
          );
        }

        final daysUntilDeadline = job.daysUntilDeadline ?? 0;
        final hasApplied = hasAppliedAsync.maybeWhen(
          data: (value) => value,
          orElse: () => false,
        );

        return Scaffold(
          body: CustomScrollView(
            slivers: [
              // App Bar
              SliverAppBar(
                expandedHeight: 200,
                pinned: true,
                actions: [
                  IconButton(
                    icon: const Icon(Icons.share_outlined),
                    onPressed: () => _shareJob(job),
                  ),
                ],
                flexibleSpace: FlexibleSpaceBar(
                  background: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          AppColors.teal.withValues(alpha: 0.2),
                          Theme.of(context).scaffoldBackgroundColor,
                        ],
                      ),
                    ),
                    child: SafeArea(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(16, 56, 16, 16),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.end,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                // Company Logo
                                Container(
                                  width: 56,
                                  height: 56,
                                  decoration: BoxDecoration(
                                    color: isDark ? AppColors.cardDark : AppColors.cardLight,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: isDark ? AppColors.borderDark : AppColors.borderLight,
                                    ),
                                  ),
                                  child: job.firmLogo != null
                                      ? ClipRRect(
                                          borderRadius: BorderRadius.circular(11),
                                          child: Image.network(
                                            job.firmLogo!,
                                            fit: BoxFit.cover,
                                            errorBuilder: (_, __, ___) => Center(
                                              child: Text(
                                                job.firmName.isNotEmpty ? job.firmName.substring(0, 1) : 'F',
                                                style: AppTextStyles.h2.copyWith(color: AppColors.teal),
                                              ),
                                            ),
                                          ),
                                        )
                                      : Center(
                                          child: Text(
                                            job.firmName.isNotEmpty ? job.firmName.substring(0, 1) : 'F',
                                            style: AppTextStyles.h2.copyWith(color: AppColors.teal),
                                          ),
                                        ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        job.firmName,
                                        style: AppTextStyles.labelLarge,
                                      ),
                                      Text(
                                        job.jobType.displayName,
                                        style: AppTextStyles.caption.copyWith(
                                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),

              // Content
              SliverToBoxAdapter(
                child: Padding(
                  padding: AppSpacing.screenPadding,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Title
                      Text(
                        job.title,
                        style: AppTextStyles.h2,
                      ),
                      AppSpacing.itemGap,

                      // Tags
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          if (job.locations != null && job.locations!.isNotEmpty)
                            _buildTag(context, Icons.location_on_outlined, job.locations!.first),
                          _buildTag(context, Icons.work_outline, job.jobType.displayName),
                          if (job.compensationRange != null)
                            _buildTag(context, Icons.attach_money, job.compensationRange!, isHighlight: true),
                          if (job.isFeatured)
                            _buildTag(context, Icons.star, 'Featured', isHighlight: true),
                        ],
                      ),
                      AppSpacing.subsectionGap,

                      // Deadline Banner
                      if (job.applicationDeadline != null)
                        Container(
                          padding: AppSpacing.cardPaddingCompact,
                          decoration: BoxDecoration(
                            color: daysUntilDeadline <= 7
                                ? AppColors.warning.withValues(alpha: 0.1)
                                : AppColors.info.withValues(alpha: 0.1),
                            borderRadius: AppRadius.card,
                            border: Border.all(
                              color: daysUntilDeadline <= 7
                                  ? AppColors.warning.withValues(alpha: 0.3)
                                  : AppColors.info.withValues(alpha: 0.3),
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                Icons.schedule,
                                size: 20,
                                color: daysUntilDeadline <= 7 ? AppColors.warning : AppColors.info,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'Application deadline: ${_formatDate(job.applicationDeadline!)} ($daysUntilDeadline days left)',
                                  style: AppTextStyles.labelSmall.copyWith(
                                    color: daysUntilDeadline <= 7 ? AppColors.warning : AppColors.info,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      AppSpacing.sectionGap,

                      // Description
                      _buildSection('About the Role', job.description),
                      AppSpacing.sectionGap,

                      // Requirements
                      if (job.requirements != null && job.requirements!.isNotEmpty)
                        ...[
                          _buildSection('Requirements', job.requirements!),
                          AppSpacing.sectionGap,
                        ],

                      // Responsibilities
                      if (job.responsibilities != null && job.responsibilities!.isNotEmpty)
                        ...[
                          _buildSection('Responsibilities', job.responsibilities!),
                          AppSpacing.sectionGap,
                        ],

                      // Application Instructions
                      if (job.applicationInstructions != null && job.applicationInstructions!.isNotEmpty)
                        ...[
                          _buildSection('How to Apply', job.applicationInstructions!),
                          AppSpacing.sectionGap,
                        ],

                      // Posted Info
                      if (job.publishedAt != null)
                        Text(
                          'Posted ${_formatTimeAgo(job.publishedAt!)}',
                          style: AppTextStyles.caption.copyWith(
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                        ),

                      // Bottom padding for floating button
                      const SizedBox(height: 100),
                    ],
                  ),
                ),
              ),
            ],
          ),
          bottomNavigationBar: SafeArea(
            child: Padding(
              padding: AppSpacing.screenPadding,
              child: Row(
                children: [
                  Expanded(
                    child: hasApplied
                        ? OutlinedButton(
                            onPressed: null,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.check_circle, color: AppColors.success),
                                const SizedBox(width: 8),
                                Text(
                                  'Already Applied',
                                  style: TextStyle(color: AppColors.success),
                                ),
                              ],
                            ),
                          )
                        : ShimmerButton(
                            text: _isApplying ? 'Submitting...' : 'Apply Now',
                            fullWidth: true,
                            onPressed: _isApplying
                                ? null
                                : () => _applyForJob(job, candidateProfileAsync.maybeWhen(
                                    data: (value) => value,
                                    orElse: () => null,
                                  )),
                          ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildSection(String title, String content) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: AppTextStyles.h4),
        AppSpacing.itemGap,
        Text(
          content.trim(),
          style: AppTextStyles.bodyMedium,
        ),
      ],
    );
  }

  Widget _buildTag(BuildContext context, IconData icon, String text, {bool isHighlight = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
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
            size: 16,
            color: isHighlight
                ? AppColors.success
                : Theme.of(context).colorScheme.onSurfaceVariant,
          ),
          const SizedBox(width: 6),
          Text(
            text,
            style: AppTextStyles.labelSmall.copyWith(
              color: isHighlight
                  ? AppColors.success
                  : Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  void _shareJob(JobListing job) {
    final jobUrl = 'https://coastalhavenpartners.com/jobs/${job.id}';
    final shareText = '''
Check out this ${job.jobType.displayName} opportunity at ${job.firmName}!

${job.title}
${job.locations?.isNotEmpty == true ? job.locations!.first : ''}

Apply now: $jobUrl
''';

    SharePlus.instance.share(
      ShareParams(
        text: shareText.trim(),
        subject: '${job.title} at ${job.firmName}',
      ),
    );
  }

  Future<void> _applyForJob(JobListing job, CandidateProfile? candidateProfile) async {
    if (candidateProfile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please complete your profile before applying'),
          backgroundColor: AppColors.warning,
        ),
      );
      return;
    }

    // Show confirmation dialog
    final confirmed = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      builder: (context) => SafeArea(
        child: Padding(
          padding: AppSpacing.screenPadding,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 8),
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.outline,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Text('Apply to ${job.firmName}', style: AppTextStyles.h3),
              const SizedBox(height: 8),
              Text(
                'Your profile and resume will be shared with the recruiter.',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 24),

              // Profile Summary
              Container(
                padding: AppSpacing.cardPadding,
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surfaceContainerHighest,
                  borderRadius: AppRadius.card,
                ),
                child: Column(
                  children: [
                    _buildProfileRow(
                      context,
                      'Resume',
                      candidateProfile.resumeUrl != null ? 'Uploaded' : 'Not uploaded',
                      Icons.description_outlined,
                      candidateProfile.resumeUrl != null,
                    ),
                    const Divider(),
                    _buildProfileRow(
                      context,
                      'GPA',
                      candidateProfile.gpa.toStringAsFixed(2),
                      Icons.school_outlined,
                      true,
                    ),
                    const Divider(),
                    _buildProfileRow(
                      context,
                      'School',
                      candidateProfile.schoolName,
                      Icons.account_balance_outlined,
                      true,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Apply Button
              SizedBox(
                width: double.infinity,
                child: ShimmerButton(
                  text: 'Submit Application',
                  fullWidth: true,
                  onPressed: () => Navigator.pop(context, true),
                ),
              ),
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: TextButton(
                  onPressed: () => Navigator.pop(context, false),
                  child: const Text('Cancel'),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );

    if (confirmed != true) return;

    setState(() => _isApplying = true);

    try {
      final jobRepo = ref.read(jobRepositoryProvider);
      await jobRepo.submitApplication(
        jobListingId: job.id,
        coverLetter: '', // Could add a cover letter field
        outreachApproach: 'direct_application',
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Application submitted successfully!'),
            backgroundColor: AppColors.success,
          ),
        );
        ref.invalidate(hasAppliedProvider(widget.jobId));
        ref.invalidate(myApplicationsProvider);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error submitting application: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isApplying = false);
      }
    }
  }

  Widget _buildProfileRow(BuildContext context, String label, String value, IconData icon, bool isComplete) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.teal),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: AppTextStyles.caption),
                Text(value, style: AppTextStyles.labelMedium),
              ],
            ),
          ),
          Icon(
            isComplete ? Icons.check_circle : Icons.warning,
            size: 20,
            color: isComplete ? AppColors.success : AppColors.warning,
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }

  String _formatTimeAgo(DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inDays == 0) return 'today';
    if (diff.inDays == 1) return 'yesterday';
    if (diff.inDays < 7) return '${diff.inDays} days ago';
    return '${(diff.inDays / 7).floor()} weeks ago';
  }
}
