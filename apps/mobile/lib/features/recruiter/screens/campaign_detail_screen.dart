import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../data/models/models.dart';
import '../../../core/providers/recruiter_provider.dart';

/// Campaign Detail Screen - View campaign details and recipients
class CampaignDetailScreen extends ConsumerWidget {
  final String campaignId;

  const CampaignDetailScreen({
    super.key,
    required this.campaignId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final campaignAsync = ref.watch(campaignProvider(campaignId));
    final recipientsAsync = ref.watch(campaignRecipientsProvider(campaignId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Campaign Details'),
        actions: [
          PopupMenuButton<String>(
            onSelected: (value) {
              switch (value) {
                case 'edit':
                  context.push('/recruiter/campaigns/$campaignId/edit');
                  break;
                case 'duplicate':
                  _duplicateCampaign(context, ref);
                  break;
                case 'delete':
                  _deleteCampaign(context, ref);
                  break;
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'edit',
                child: Row(
                  children: [
                    Icon(Icons.edit_outlined),
                    SizedBox(width: 12),
                    Text('Edit'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'duplicate',
                child: Row(
                  children: [
                    Icon(Icons.copy_outlined),
                    SizedBox(width: 12),
                    Text('Duplicate'),
                  ],
                ),
              ),
              PopupMenuItem(
                value: 'delete',
                child: Row(
                  children: [
                    Icon(Icons.delete_outline, color: AppColors.error),
                    const SizedBox(width: 12),
                    Text('Delete', style: TextStyle(color: AppColors.error)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: campaignAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text('Error: $error'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(campaignProvider(campaignId)),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (campaign) {
          if (campaign == null) {
            return const Center(child: Text('Campaign not found'));
          }

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(campaignProvider(campaignId));
              ref.invalidate(campaignRecipientsProvider(campaignId));
            },
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: AppSpacing.screenPadding,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Campaign Header
                  _buildCampaignHeader(context, isDark, campaign),
                  AppSpacing.sectionGap,

                  // Stats (show if there are any recipients)
                  if (campaign.totalRecipients > 0)
                    _buildStatsSection(context, isDark, campaign),
                  if (campaign.totalRecipients > 0) AppSpacing.sectionGap,

                  // Message Preview
                  _buildMessagePreview(context, isDark, campaign),
                  AppSpacing.sectionGap,

                  // Recipients Section
                  _buildRecipientsSection(
                    context,
                    isDark,
                    recipientsAsync,
                    ref,
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildCampaignHeader(
    BuildContext context,
    bool isDark,
    RecruiterCampaign campaign,
  ) {
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
              Expanded(
                child: Text(
                  campaign.name,
                  style: AppTextStyles.h3,
                ),
              ),
              _buildStatusBadge(campaign.status),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Subject: ${campaign.subject}',
            style: AppTextStyles.bodyMedium.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 8),
          if (campaign.createdAt != null)
            Text(
              'Created: ${_formatDate(campaign.createdAt!)}',
              style: AppTextStyles.caption.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
          if (campaign.scheduledAt != null) ...[
            const SizedBox(height: 4),
            Text(
              'Scheduled: ${_formatDate(campaign.scheduledAt!)}',
              style: AppTextStyles.caption.copyWith(
                color: AppColors.teal,
              ),
            ),
          ],
          if (campaign.sentAt != null) ...[
            const SizedBox(height: 4),
            Text(
              'Sent: ${_formatDate(campaign.sentAt!)}',
              style: AppTextStyles.caption.copyWith(
                color: AppColors.success,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStatusBadge(CampaignStatus? status) {
    Color color;
    String label;
    IconData icon;

    switch (status) {
      case CampaignStatus.draft:
        color = AppColors.warning;
        label = 'Draft';
        icon = Icons.edit_outlined;
      case CampaignStatus.scheduled:
        color = AppColors.teal;
        label = 'Scheduled';
        icon = Icons.schedule;
      case CampaignStatus.sending:
        color = AppColors.info;
        label = 'Sending';
        icon = Icons.send;
      case CampaignStatus.sent:
        color = AppColors.emerald;
        label = 'Sent';
        icon = Icons.check;
      case CampaignStatus.completed:
        color = AppColors.success;
        label = 'Completed';
        icon = Icons.check_circle_outline;
      case null:
        color = AppColors.warning;
        label = 'Unknown';
        icon = Icons.help_outline;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: AppTextStyles.badge.copyWith(
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsSection(
    BuildContext context,
    bool isDark,
    RecruiterCampaign campaign,
  ) {
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
          Text('Campaign Performance', style: AppTextStyles.h4),
          AppSpacing.itemGap,
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  context,
                  isDark,
                  label: 'Total Recipients',
                  value: '${campaign.totalRecipients}',
                  icon: Icons.people_outline,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatCard(
                  context,
                  isDark,
                  label: 'Sent',
                  value: '${campaign.sentCount}',
                  icon: Icons.send_outlined,
                  color: AppColors.teal,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  context,
                  isDark,
                  label: 'Opened',
                  value: '${campaign.openedCount}',
                  icon: Icons.visibility_outlined,
                  color: AppColors.emerald,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatCard(
                  context,
                  isDark,
                  label: 'Replied',
                  value: '${campaign.repliedCount}',
                  icon: Icons.reply_outlined,
                  color: AppColors.success,
                ),
              ),
            ],
          ),
          if (campaign.failedCount > 0) ...[
            const SizedBox(height: 12),
            _buildStatCard(
              context,
              isDark,
              label: 'Failed',
              value: '${campaign.failedCount}',
              icon: Icons.error_outline,
              color: AppColors.error,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStatCard(
    BuildContext context,
    bool isDark, {
    required String label,
    required String value,
    required IconData icon,
    Color? color,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: (color ?? AppColors.teal).withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(icon, size: 24, color: color ?? AppColors.teal),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: AppTextStyles.h4.copyWith(color: color),
              ),
              Text(
                label,
                style: AppTextStyles.caption.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMessagePreview(
    BuildContext context,
    bool isDark,
    RecruiterCampaign campaign,
  ) {
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
          Text('Message Template', style: AppTextStyles.h4),
          AppSpacing.itemGap,
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark ? Colors.black26 : Colors.grey.shade100,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              campaign.messageTemplate,
              style: AppTextStyles.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecipientsSection(
    BuildContext context,
    bool isDark,
    AsyncValue<List<CampaignRecipient>> recipientsAsync,
    WidgetRef ref,
  ) {
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
          Text('Recipients', style: AppTextStyles.h4),
          AppSpacing.itemGap,
          recipientsAsync.when(
            loading: () => const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: CircularProgressIndicator(),
              ),
            ),
            error: (error, stack) => Center(
              child: Text('Error loading recipients: $error'),
            ),
            data: (recipients) {
              if (recipients.isEmpty) {
                return Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        Icon(
                          Icons.people_outline,
                          size: 48,
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'No recipients yet',
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }

              return Column(
                children: recipients.map((recipient) {
                  return _buildRecipientTile(context, isDark, recipient);
                }).toList(),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildRecipientTile(
    BuildContext context,
    bool isDark,
    CampaignRecipient recipient,
  ) {
    final statusColor = _getRecipientStatusColor(recipient.status);
    final statusIcon = _getRecipientStatusIcon(recipient.status);
    final statusLabel = recipient.status ?? 'pending';

    // Get candidate name from joined profile if available
    final candidateName = recipient.candidateProfile?.profile?.fullName ??
        'Candidate ${recipient.candidateProfileId.substring(0, 8)}';
    final initials = candidateName.split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join().toUpperCase();

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? Colors.black12 : Colors.grey.shade50,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor: AppColors.teal.withValues(alpha: 0.1),
            child: Text(
              initials.isNotEmpty ? initials : 'C',
              style: AppTextStyles.labelMedium.copyWith(color: AppColors.teal),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  candidateName,
                  style: AppTextStyles.labelMedium,
                ),
                Text(
                  recipient.sentAt != null
                      ? 'Sent: ${_formatDate(recipient.sentAt!)}'
                      : 'Pending',
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
              color: statusColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(statusIcon, size: 14, color: statusColor),
                const SizedBox(width: 4),
                Text(
                  statusLabel,
                  style: AppTextStyles.caption.copyWith(
                    color: statusColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _getRecipientStatusColor(String? status) {
    switch (status) {
      case 'pending':
        return AppColors.warning;
      case 'sent':
        return AppColors.teal;
      case 'opened':
        return AppColors.emerald;
      case 'replied':
        return AppColors.success;
      case 'failed':
        return AppColors.error;
      default:
        return AppColors.warning;
    }
  }

  IconData _getRecipientStatusIcon(String? status) {
    switch (status) {
      case 'pending':
        return Icons.schedule;
      case 'sent':
        return Icons.send;
      case 'opened':
        return Icons.visibility_outlined;
      case 'replied':
        return Icons.reply;
      case 'failed':
        return Icons.error_outline;
      default:
        return Icons.schedule;
    }
  }

  void _duplicateCampaign(BuildContext context, WidgetRef ref) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Campaign duplicated')),
    );
  }

  void _deleteCampaign(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Delete Campaign'),
        content: const Text('Are you sure you want to delete this campaign?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(dialogContext);
              context.pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Campaign deleted')),
              );
            },
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }
}
