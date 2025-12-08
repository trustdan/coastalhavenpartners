import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/providers/recruiter_provider.dart';
import '../../../data/models/models.dart';

/// Verification status card for recruiter dashboard
/// Shows the current verification status and provides guidance
class VerificationStatusCard extends ConsumerWidget {
  const VerificationStatusCard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final recruiterProfileAsync = ref.watch(currentRecruiterProfileProvider);

    return recruiterProfileAsync.when(
      data: (profile) {
        if (profile == null) return const SizedBox.shrink();
        return _buildCard(context, isDark, profile, ref);
      },
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
    );
  }

  Widget _buildCard(
    BuildContext context,
    bool isDark,
    RecruiterProfile profile,
    WidgetRef ref,
  ) {
    final status = _getVerificationStatus(profile);
    final statusColor = _getStatusColor(status);
    final statusIcon = _getStatusIcon(status);

    // Don't show if already verified
    if (status == _VerificationStatus.approved) {
      return const SizedBox.shrink();
    }

    return Container(
      padding: AppSpacing.cardPadding,
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: AppRadius.card,
        border: Border.all(
          color: statusColor.withValues(alpha: 0.3),
          width: 1.5,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(statusIcon, color: statusColor, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _getStatusTitle(status),
                      style: AppTextStyles.labelMedium.copyWith(
                        color: statusColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      _getStatusSubtitle(status),
                      style: AppTextStyles.caption.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              _buildStatusBadge(context, status, statusColor),
            ],
          ),
          const SizedBox(height: 16),
          _buildStatusContent(context, isDark, profile, status, ref),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(
    BuildContext context,
    _VerificationStatus status,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        _getStatusLabel(status),
        style: AppTextStyles.badge.copyWith(
          color: color,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildStatusContent(
    BuildContext context,
    bool isDark,
    RecruiterProfile profile,
    _VerificationStatus status,
    WidgetRef ref,
  ) {
    switch (status) {
      case _VerificationStatus.pending:
        return _buildPendingContent(context, isDark, profile, ref);
      case _VerificationStatus.domainMismatch:
        return _buildDomainMismatchContent(context, isDark, profile, ref);
      case _VerificationStatus.rejected:
        return _buildRejectedContent(context, isDark, profile);
      case _VerificationStatus.approved:
        return const SizedBox.shrink();
    }
  }

  Widget _buildPendingContent(
    BuildContext context,
    bool isDark,
    RecruiterProfile profile,
    WidgetRef ref,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Your account is being reviewed by our team. This usually takes 1-2 business days.',
          style: AppTextStyles.bodySmall.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 12),
        _buildInfoRow(
          context,
          'Email Domain',
          profile.emailDomain ?? 'Not detected',
          profile.emailDomainMatchesCompany ? Icons.check_circle : Icons.info_outline,
          profile.emailDomainMatchesCompany ? AppColors.success : AppColors.warning,
        ),
        if (profile.companyWebsite != null) ...[
          const SizedBox(height: 8),
          _buildInfoRow(
            context,
            'Company Website',
            profile.companyWebsite!,
            Icons.language,
            AppColors.teal,
          ),
        ],
        const SizedBox(height: 16),
        Text(
          'Tips to speed up verification:',
          style: AppTextStyles.labelSmall.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        _buildTip(context, 'Use your company email address'),
        _buildTip(context, 'Add your company website to your profile'),
        _buildTip(context, 'Complete your LinkedIn profile'),
        const SizedBox(height: 12),
        if (profile.companyWebsite == null)
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () => _showUpdateWebsiteDialog(context, profile, ref),
              icon: const Icon(Icons.add),
              label: const Text('Add Company Website'),
            ),
          ),
      ],
    );
  }

  Widget _buildDomainMismatchContent(
    BuildContext context,
    bool isDark,
    RecruiterProfile profile,
    WidgetRef ref,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.warning.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              const Icon(Icons.warning_amber, color: AppColors.warning, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Your email domain doesn\'t match your company website. This may delay verification.',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.warning,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        _buildInfoRow(
          context,
          'Email Domain',
          profile.emailDomain ?? 'Not detected',
          Icons.email_outlined,
          Theme.of(context).colorScheme.onSurfaceVariant,
        ),
        if (profile.companyWebsite != null) ...[
          const SizedBox(height: 8),
          _buildInfoRow(
            context,
            'Company Website',
            profile.companyWebsite!,
            Icons.language,
            Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ],
        const SizedBox(height: 16),
        Text(
          'To resolve this:',
          style: AppTextStyles.labelSmall.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        _buildTip(context, 'Sign up with your company email'),
        _buildTip(context, 'Or update your company website if incorrect'),
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: () => _showUpdateWebsiteDialog(context, profile, ref),
            icon: const Icon(Icons.edit),
            label: const Text('Update Company Website'),
          ),
        ),
      ],
    );
  }

  Widget _buildRejectedContent(
    BuildContext context,
    bool isDark,
    RecruiterProfile profile,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.error.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.error_outline, color: AppColors.error, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Your verification was not approved.',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.error,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (profile.verificationNotes != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        profile.verificationNotes!,
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.error,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: () {
              // TODO: Open support/appeal form
            },
            icon: const Icon(Icons.support_agent),
            label: const Text('Contact Support'),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoRow(
    BuildContext context,
    String label,
    String value,
    IconData icon,
    Color iconColor,
  ) {
    return Row(
      children: [
        Icon(icon, size: 16, color: iconColor),
        const SizedBox(width: 8),
        Text(
          '$label: ',
          style: AppTextStyles.caption.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: AppTextStyles.caption.copyWith(
              fontWeight: FontWeight.w500,
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  Widget _buildTip(BuildContext context, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('  \u2022  ', style: TextStyle(fontSize: 12)),
          Expanded(
            child: Text(
              text,
              style: AppTextStyles.caption.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showUpdateWebsiteDialog(
    BuildContext context,
    RecruiterProfile profile,
    WidgetRef ref,
  ) {
    final controller = TextEditingController(text: profile.companyWebsite ?? '');

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Company Website'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Enter your company website URL. This helps us verify your employment.',
              style: AppTextStyles.bodySmall.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: controller,
              decoration: const InputDecoration(
                labelText: 'Website URL',
                hintText: 'https://example.com',
                prefixIcon: Icon(Icons.language),
              ),
              keyboardType: TextInputType.url,
              autocorrect: false,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () async {
              final website = controller.text.trim();
              if (website.isNotEmpty) {
                final repo = ref.read(recruiterRepositoryProvider);
                await repo.updateRecruiterProfile(companyWebsite: website);
                ref.invalidate(currentRecruiterProfileProvider);
              }
              if (context.mounted) Navigator.pop(context);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  _VerificationStatus _getVerificationStatus(RecruiterProfile profile) {
    if (profile.isApproved) return _VerificationStatus.approved;
    if (profile.isRejected) return _VerificationStatus.rejected;
    if (profile.emailDomain != null && !profile.emailDomainMatchesCompany) {
      return _VerificationStatus.domainMismatch;
    }
    return _VerificationStatus.pending;
  }

  Color _getStatusColor(_VerificationStatus status) {
    switch (status) {
      case _VerificationStatus.approved:
        return AppColors.success;
      case _VerificationStatus.pending:
        return AppColors.teal;
      case _VerificationStatus.domainMismatch:
        return AppColors.warning;
      case _VerificationStatus.rejected:
        return AppColors.error;
    }
  }

  IconData _getStatusIcon(_VerificationStatus status) {
    switch (status) {
      case _VerificationStatus.approved:
        return Icons.verified;
      case _VerificationStatus.pending:
        return Icons.hourglass_empty;
      case _VerificationStatus.domainMismatch:
        return Icons.warning_amber;
      case _VerificationStatus.rejected:
        return Icons.cancel;
    }
  }

  String _getStatusTitle(_VerificationStatus status) {
    switch (status) {
      case _VerificationStatus.approved:
        return 'Account Verified';
      case _VerificationStatus.pending:
        return 'Verification Pending';
      case _VerificationStatus.domainMismatch:
        return 'Domain Verification Issue';
      case _VerificationStatus.rejected:
        return 'Verification Rejected';
    }
  }

  String _getStatusSubtitle(_VerificationStatus status) {
    switch (status) {
      case _VerificationStatus.approved:
        return 'Full access granted';
      case _VerificationStatus.pending:
        return 'Under review';
      case _VerificationStatus.domainMismatch:
        return 'Action required';
      case _VerificationStatus.rejected:
        return 'Contact support';
    }
  }

  String _getStatusLabel(_VerificationStatus status) {
    switch (status) {
      case _VerificationStatus.approved:
        return 'Verified';
      case _VerificationStatus.pending:
        return 'Pending';
      case _VerificationStatus.domainMismatch:
        return 'Action Needed';
      case _VerificationStatus.rejected:
        return 'Rejected';
    }
  }
}

enum _VerificationStatus {
  pending,
  domainMismatch,
  rejected,
  approved,
}
