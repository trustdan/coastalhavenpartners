import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/providers/providers.dart';
import '../../../data/models/models.dart';
import '../../../data/repositories/repositories.dart';

/// Applications Screen - Track submitted job applications
class ApplicationsScreen extends ConsumerStatefulWidget {
  const ApplicationsScreen({super.key});

  @override
  ConsumerState<ApplicationsScreen> createState() => _ApplicationsScreenState();
}

class _ApplicationsScreenState extends ConsumerState<ApplicationsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final applicationsAsync = ref.watch(myApplicationsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Applications'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          tabs: applicationsAsync.when(
            loading: () => [
              _buildTab('All', 0),
              _buildTab('Active', 0),
              _buildTab('Accepted', 0),
              _buildTab('Rejected', 0),
              _buildTab('Withdrawn', 0),
            ],
            error: (_, __) => [
              _buildTab('All', 0),
              _buildTab('Active', 0),
              _buildTab('Accepted', 0),
              _buildTab('Rejected', 0),
              _buildTab('Withdrawn', 0),
            ],
            data: (applications) => [
              _buildTab('All', applications.length),
              _buildTab('Active', _getCountByStatus(applications, [
                ApplicationStatus.pending,
                ApplicationStatus.reviewing,
                ApplicationStatus.interviewed,
              ])),
              _buildTab('Accepted', _getCountByStatus(applications, [ApplicationStatus.accepted])),
              _buildTab('Rejected', _getCountByStatus(applications, [ApplicationStatus.rejected])),
              _buildTab('Withdrawn', _getCountByStatus(applications, [ApplicationStatus.withdrawn])),
            ],
          ),
        ),
      ),
      body: applicationsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text('Error loading applications: $error'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(myApplicationsProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (applications) => TabBarView(
          controller: _tabController,
          children: [
            _buildApplicationsList(isDark, applications, null),
            _buildApplicationsList(isDark, applications, [
              ApplicationStatus.pending,
              ApplicationStatus.reviewing,
              ApplicationStatus.interviewed,
            ]),
            _buildApplicationsList(isDark, applications, [ApplicationStatus.accepted]),
            _buildApplicationsList(isDark, applications, [ApplicationStatus.rejected]),
            _buildApplicationsList(isDark, applications, [ApplicationStatus.withdrawn]),
          ],
        ),
      ),
    );
  }

  Widget _buildTab(String label, int count) {
    return Tab(
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(label),
          if (count > 0) ...[
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: AppColors.teal.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                '$count',
                style: AppTextStyles.badge.copyWith(color: AppColors.teal),
              ),
            ),
          ],
        ],
      ),
    );
  }

  int _getCountByStatus(List<Application> applications, List<ApplicationStatus> statuses) {
    return applications.where((app) => statuses.contains(app.status)).length;
  }

  Widget _buildApplicationsList(
    bool isDark,
    List<Application> applications,
    List<ApplicationStatus>? filter,
  ) {
    final filtered = filter == null
        ? applications
        : applications.where((app) => filter.contains(app.status)).toList();

    if (filtered.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.inbox_outlined,
              size: 64,
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
            const SizedBox(height: 16),
            Text(
              'No applications',
              style: AppTextStyles.h4.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Applications in this category will appear here',
              style: AppTextStyles.bodySmall.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(myApplicationsProvider);
      },
      child: ListView.separated(
        padding: AppSpacing.screenPadding,
        itemCount: filtered.length,
        separatorBuilder: (_, __) => AppSpacing.subsectionGap,
        itemBuilder: (context, index) {
          return _buildApplicationCard(context, isDark, filtered[index]);
        },
      ),
    );
  }

  Widget _buildApplicationCard(
    BuildContext context,
    bool isDark,
    Application application,
  ) {
    final statusColor = _getStatusColor(application.status);
    final statusLabel = application.status.displayName;

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
                child: Center(
                  child: Text(
                    application.firmName.isNotEmpty
                        ? application.firmName.substring(0, 1)
                        : 'F',
                    style: AppTextStyles.h3.copyWith(
                      color: AppColors.teal,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      application.jobTitle,
                      style: AppTextStyles.labelLarge,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      application.firmName,
                      style: AppTextStyles.bodySmall.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              // Status Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  statusLabel,
                  style: AppTextStyles.badge.copyWith(
                    color: statusColor,
                  ),
                ),
              ),
            ],
          ),
          AppSpacing.subsectionGap,

          // Location and Date
          Row(
            children: [
              if (application.jobListing?.locations != null &&
                  application.jobListing!.locations!.isNotEmpty) ...[
                Icon(
                  Icons.location_on_outlined,
                  size: 16,
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
                const SizedBox(width: 4),
                Text(
                  application.jobListing!.locations!.first,
                  style: AppTextStyles.caption.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(width: 16),
              ],
              Icon(
                Icons.calendar_today_outlined,
                size: 16,
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
              const SizedBox(width: 4),
              Text(
                application.appliedAt != null
                    ? 'Applied ${_formatDate(application.appliedAt!)}'
                    : 'Applied recently',
                style: AppTextStyles.caption.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),

          // Actions
          AppSpacing.subsectionGap,
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              if (application.status == ApplicationStatus.accepted) ...[
                TextButton(
                  onPressed: () => _handleDecline(application),
                  child: const Text('Decline'),
                ),
                const SizedBox(width: 8),
                FilledButton(
                  onPressed: () => _handleAcceptOffer(application),
                  child: const Text('Accept Offer'),
                ),
              ] else if (application.status != ApplicationStatus.rejected &&
                  application.status != ApplicationStatus.withdrawn) ...[
                TextButton(
                  onPressed: () => _handleWithdraw(application),
                  child: const Text('Withdraw'),
                ),
                const SizedBox(width: 8),
                OutlinedButton(
                  onPressed: () => _viewDetails(application),
                  child: const Text('View Details'),
                ),
              ] else ...[
                OutlinedButton(
                  onPressed: () => _viewDetails(application),
                  child: const Text('View Details'),
                ),
              ],
            ],
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
        return AppColors.textMutedLight;
    }
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inDays == 0) return 'today';
    if (diff.inDays == 1) return 'yesterday';
    if (diff.inDays < 7) return '${diff.inDays} days ago';

    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${months[date.month - 1]} ${date.day}';
  }

  void _handleAcceptOffer(Application application) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Accept Offer'),
        content: Text('Are you sure you want to accept the offer from ${application.firmName}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await JobRepository.instance.updateApplicationStatus(
                  application.id,
                  'accepted_by_candidate',
                );
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Congratulations! Offer accepted.'),
                      backgroundColor: AppColors.success,
                    ),
                  );
                }
                ref.invalidate(myApplicationsProvider);
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Error accepting offer: $e'),
                      backgroundColor: AppColors.error,
                    ),
                  );
                }
              }
            },
            child: const Text('Accept'),
          ),
        ],
      ),
    );
  }

  void _handleDecline(Application application) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Decline Offer'),
        content: Text('Are you sure you want to decline the offer from ${application.firmName}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await JobRepository.instance.updateApplicationStatus(
                  application.id,
                  'declined_by_candidate',
                );
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Offer declined.'),
                    ),
                  );
                }
                ref.invalidate(myApplicationsProvider);
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Error declining offer: $e'),
                      backgroundColor: AppColors.error,
                    ),
                  );
                }
              }
            },
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.error,
            ),
            child: const Text('Decline'),
          ),
        ],
      ),
    );
  }

  void _handleWithdraw(Application application) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Withdraw Application'),
        content: Text('Are you sure you want to withdraw your application to ${application.firmName}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await JobRepository.instance.withdrawApplication(application.id);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Application withdrawn.'),
                    ),
                  );
                }
                ref.invalidate(myApplicationsProvider);
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Error withdrawing application: $e'),
                      backgroundColor: AppColors.error,
                    ),
                  );
                }
              }
            },
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.error,
            ),
            child: const Text('Withdraw'),
          ),
        ],
      ),
    );
  }

  void _viewDetails(Application application) {
    // Navigate to job detail screen
    if (application.jobListingId != null) {
      context.push('/candidate/jobs/${application.jobListingId}');
    }
  }
}
