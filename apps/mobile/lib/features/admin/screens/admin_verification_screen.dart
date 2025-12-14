import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/providers/admin_provider.dart';
import '../../../data/models/profile.dart';

/// Admin verification screen
/// Shows pending candidates for verification review
class AdminVerificationScreen extends ConsumerStatefulWidget {
  const AdminVerificationScreen({super.key});

  @override
  ConsumerState<AdminVerificationScreen> createState() =>
      _AdminVerificationScreenState();
}

class _AdminVerificationScreenState
    extends ConsumerState<AdminVerificationScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'Verification',
          style: AppTextStyles.h3.copyWith(color: AppColors.textPrimaryDark),
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.teal,
          unselectedLabelColor: AppColors.textSecondaryDark,
          indicatorColor: AppColors.teal,
          tabs: const [
            Tab(text: 'Pending'),
            Tab(text: 'Verified'),
            Tab(text: 'Rejected'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildPendingTab(),
          _buildVerifiedTab(),
          _buildRejectedTab(),
        ],
      ),
    );
  }

  Widget _buildPendingTab() {
    final candidatesAsync = ref.watch(pendingVerificationCandidatesProvider);

    return candidatesAsync.when(
      data: (candidates) {
        if (candidates.isEmpty) {
          return _buildEmptyState(
            icon: Icons.pending_actions,
            title: 'No Pending Verifications',
            subtitle: 'All candidates have been reviewed',
          );
        }
        return RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(pendingVerificationCandidatesProvider);
          },
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(vertical: 8),
            itemCount: candidates.length,
            itemBuilder: (context, index) {
              final candidate = candidates[index];
              return VerificationCandidateCard(
                candidateId: candidate.id,
                name: candidate.displayName,
                email: candidate.email ?? '',
                school: candidate.schoolName,
                major: candidate.major,
                submittedAt: candidate.createdAt ?? DateTime.now(),
                onApprove: () => _approveCandidate(candidate),
                onReject: () => _showRejectDialog(candidate),
                onViewDetails: () => _viewCandidateDetails(candidate),
              );
            },
          ),
        );
      },
      loading: () => const Center(
        child: CircularProgressIndicator(color: AppColors.teal),
      ),
      error: (error, _) => _buildErrorState(
        onRetry: () => ref.invalidate(pendingVerificationCandidatesProvider),
      ),
    );
  }

  Widget _buildVerifiedTab() {
    final candidatesAsync = ref.watch(verifiedCandidatesProvider);

    return candidatesAsync.when(
      data: (candidates) {
        if (candidates.isEmpty) {
          return _buildEmptyState(
            icon: Icons.verified_user,
            title: 'Verified Candidates',
            subtitle: 'Recently verified candidates will appear here',
          );
        }
        return RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(verifiedCandidatesProvider);
          },
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(vertical: 8),
            itemCount: candidates.length,
            itemBuilder: (context, index) {
              final candidate = candidates[index];
              return _VerifiedCandidateCard(
                name: candidate.displayName,
                email: candidate.email ?? '',
                school: candidate.schoolName,
                major: candidate.major,
                verifiedAt: candidate.updatedAt ?? DateTime.now(),
              );
            },
          ),
        );
      },
      loading: () => const Center(
        child: CircularProgressIndicator(color: AppColors.teal),
      ),
      error: (error, _) => _buildErrorState(
        onRetry: () => ref.invalidate(verifiedCandidatesProvider),
      ),
    );
  }

  Widget _buildRejectedTab() {
    final candidatesAsync = ref.watch(rejectedCandidatesProvider);

    return candidatesAsync.when(
      data: (candidates) {
        if (candidates.isEmpty) {
          return _buildEmptyState(
            icon: Icons.cancel_outlined,
            title: 'Rejected Candidates',
            subtitle: 'Rejected verifications will appear here',
          );
        }
        return RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(rejectedCandidatesProvider);
          },
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(vertical: 8),
            itemCount: candidates.length,
            itemBuilder: (context, index) {
              final candidate = candidates[index];
              return _RejectedCandidateCard(
                name: candidate.displayName,
                email: candidate.email ?? '',
                school: candidate.schoolName,
                rejectedAt: candidate.updatedAt ?? DateTime.now(),
              );
            },
          ),
        );
      },
      loading: () => const Center(
        child: CircularProgressIndicator(color: AppColors.teal),
      ),
      error: (error, _) => _buildErrorState(
        onRetry: () => ref.invalidate(rejectedCandidatesProvider),
      ),
    );
  }

  Future<void> _approveCandidate(CandidateProfile candidate) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardDark,
        title: Text(
          'Approve Candidate',
          style: AppTextStyles.h4.copyWith(color: AppColors.textPrimaryDark),
        ),
        content: Text(
          'Are you sure you want to approve ${candidate.displayName}?',
          style:
              AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondaryDark),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(backgroundColor: AppColors.teal),
            child: const Text('Approve'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      final success = await ref
          .read(verificationActionsProvider.notifier)
          .approveCandidate(candidate.id);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(success
                ? 'Candidate approved successfully'
                : 'Failed to approve candidate'),
            backgroundColor: success ? AppColors.teal : AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _showRejectDialog(CandidateProfile candidate) async {
    final reasonController = TextEditingController();

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardDark,
        title: Text(
          'Reject Candidate',
          style: AppTextStyles.h4.copyWith(color: AppColors.textPrimaryDark),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Are you sure you want to reject ${candidate.displayName}?',
              style: AppTextStyles.bodyMedium
                  .copyWith(color: AppColors.textSecondaryDark),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: reasonController,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'Reason for rejection (optional)',
                hintStyle: AppTextStyles.bodyMedium
                    .copyWith(color: AppColors.textMutedDark),
                filled: true,
                fillColor: AppColors.surfaceDark,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide.none,
                ),
              ),
              style: AppTextStyles.bodyMedium
                  .copyWith(color: AppColors.textPrimaryDark),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Reject'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      final reason =
          reasonController.text.isNotEmpty ? reasonController.text : null;
      final success = await ref
          .read(verificationActionsProvider.notifier)
          .rejectCandidate(candidate.id, reason: reason);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(success
                ? 'Candidate rejected'
                : 'Failed to reject candidate'),
            backgroundColor: success ? AppColors.warning : AppColors.error,
          ),
        );
      }
    }

    reasonController.dispose();
  }

  void _viewCandidateDetails(CandidateProfile candidate) {
    // TODO: Navigate to candidate detail view
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.cardDark,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: AppColors.teal.withValues(alpha: 0.2),
                  child: Text(
                    candidate.displayName.isNotEmpty
                        ? candidate.displayName[0].toUpperCase()
                        : '?',
                    style: AppTextStyles.h3.copyWith(color: AppColors.teal),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        candidate.displayName,
                        style: AppTextStyles.h4
                            .copyWith(color: AppColors.textPrimaryDark),
                      ),
                      Text(
                        candidate.email ?? '',
                        style: AppTextStyles.bodyMedium
                            .copyWith(color: AppColors.textSecondaryDark),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            _buildDetailRow('School', candidate.schoolName),
            _buildDetailRow('Major', candidate.major),
            _buildDetailRow('GPA', candidate.gpa.toStringAsFixed(2)),
            _buildDetailRow(
                'Graduation', candidate.graduationYear.toString()),
            if (candidate.bio != null)
              _buildDetailRow('Bio', candidate.bio!),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      Navigator.pop(context);
                      _showRejectDialog(candidate);
                    },
                    icon: const Icon(Icons.close),
                    label: const Text('Reject'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.error,
                      side:
                          BorderSide(color: AppColors.error.withValues(alpha: 0.5)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: FilledButton.icon(
                    onPressed: () {
                      Navigator.pop(context);
                      _approveCandidate(candidate);
                    },
                    icon: const Icon(Icons.check),
                    label: const Text('Approve'),
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.teal,
                      padding: const EdgeInsets.symmetric(vertical: 12),
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

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: AppTextStyles.bodyMedium
                  .copyWith(color: AppColors.textMutedDark),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: AppTextStyles.bodyMedium
                  .copyWith(color: AppColors.textPrimaryDark),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Center(
      child: Padding(
        padding: AppSpacing.screenPadding,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.teal.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Icon(
                icon,
                color: AppColors.teal,
                size: 40,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              title,
              style: AppTextStyles.h4.copyWith(
                color: AppColors.textPrimaryDark,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textSecondaryDark,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState({required VoidCallback onRetry}) {
    return Center(
      child: Padding(
        padding: AppSpacing.screenPadding,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.error.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Icon(
                Icons.error_outline,
                color: AppColors.error,
                size: 40,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Failed to load data',
              style: AppTextStyles.h4.copyWith(
                color: AppColors.textPrimaryDark,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Please try again',
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textSecondaryDark,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}

/// Verification candidate card widget
class VerificationCandidateCard extends StatelessWidget {
  final String candidateId;
  final String name;
  final String email;
  final String? school;
  final String? major;
  final DateTime submittedAt;
  final VoidCallback onApprove;
  final VoidCallback onReject;
  final VoidCallback onViewDetails;

  const VerificationCandidateCard({
    super.key,
    required this.candidateId,
    required this.name,
    required this.email,
    this.school,
    this.major,
    required this.submittedAt,
    required this.onApprove,
    required this.onReject,
    required this.onViewDetails,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.borderDark,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with name and time
          Row(
            children: [
              CircleAvatar(
                backgroundColor: AppColors.teal.withValues(alpha: 0.2),
                child: Text(
                  name.isNotEmpty ? name[0].toUpperCase() : '?',
                  style: AppTextStyles.labelLarge.copyWith(
                    color: AppColors.teal,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: AppTextStyles.labelLarge.copyWith(
                        color: AppColors.textPrimaryDark,
                      ),
                    ),
                    Text(
                      email,
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.textSecondaryDark,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                _formatTimeAgo(submittedAt),
                style: AppTextStyles.caption.copyWith(
                  color: AppColors.textMutedDark,
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // School and major info
          if (school != null || major != null) ...[
            Wrap(
              spacing: 8,
              runSpacing: 4,
              children: [
                if (school != null) _buildInfoChip(Icons.school_outlined, school!),
                if (major != null) _buildInfoChip(Icons.book_outlined, major!),
              ],
            ),
            const SizedBox(height: 12),
          ],

          // Action buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onReject,
                  icon: const Icon(Icons.close, size: 18),
                  label: const Text('Reject'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.error,
                    side: BorderSide(color: AppColors.error.withValues(alpha: 0.5)),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onViewDetails,
                  icon: const Icon(Icons.visibility_outlined, size: 18),
                  label: const Text('View'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.textSecondaryDark,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: FilledButton.icon(
                  onPressed: onApprove,
                  icon: const Icon(Icons.check, size: 18),
                  label: const Text('Approve'),
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.teal,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.surfaceDark,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AppColors.textMutedDark),
          const SizedBox(width: 4),
          Text(
            text,
            style: AppTextStyles.caption.copyWith(
              color: AppColors.textSecondaryDark,
            ),
          ),
        ],
      ),
    );
  }

  String _formatTimeAgo(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }
}

/// Verified candidate card (read-only display)
class _VerifiedCandidateCard extends StatelessWidget {
  final String name;
  final String email;
  final String? school;
  final String? major;
  final DateTime verifiedAt;

  const _VerifiedCandidateCard({
    required this.name,
    required this.email,
    this.school,
    this.major,
    required this.verifiedAt,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.teal.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: AppColors.teal.withValues(alpha: 0.2),
            child: Text(
              name.isNotEmpty ? name[0].toUpperCase() : '?',
              style: AppTextStyles.labelLarge.copyWith(color: AppColors.teal),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: AppTextStyles.labelLarge
                      .copyWith(color: AppColors.textPrimaryDark),
                ),
                Text(
                  school ?? email,
                  style: AppTextStyles.bodySmall
                      .copyWith(color: AppColors.textSecondaryDark),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Icon(Icons.verified, color: AppColors.teal, size: 20),
              const SizedBox(height: 4),
              Text(
                _formatTimeAgo(verifiedAt),
                style:
                    AppTextStyles.caption.copyWith(color: AppColors.textMutedDark),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatTimeAgo(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }
}

/// Rejected candidate card (read-only display)
class _RejectedCandidateCard extends StatelessWidget {
  final String name;
  final String email;
  final String? school;
  final DateTime rejectedAt;

  const _RejectedCandidateCard({
    required this.name,
    required this.email,
    this.school,
    required this.rejectedAt,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.error.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: AppColors.error.withValues(alpha: 0.2),
            child: Text(
              name.isNotEmpty ? name[0].toUpperCase() : '?',
              style: AppTextStyles.labelLarge.copyWith(color: AppColors.error),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: AppTextStyles.labelLarge
                      .copyWith(color: AppColors.textPrimaryDark),
                ),
                Text(
                  school ?? email,
                  style: AppTextStyles.bodySmall
                      .copyWith(color: AppColors.textSecondaryDark),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Icon(Icons.cancel, color: AppColors.error, size: 20),
              const SizedBox(height: 4),
              Text(
                _formatTimeAgo(rejectedAt),
                style:
                    AppTextStyles.caption.copyWith(color: AppColors.textMutedDark),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatTimeAgo(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }
}
