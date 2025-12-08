import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';

/// Campaigns Screen - View and manage outreach campaigns
class CampaignsScreen extends StatefulWidget {
  const CampaignsScreen({super.key});

  @override
  State<CampaignsScreen> createState() => _CampaignsScreenState();
}

class _CampaignsScreenState extends State<CampaignsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Mock campaigns
  final List<_Campaign> _campaigns = [
    _Campaign(
      id: '1',
      name: 'Summer Analyst Outreach 2025',
      status: CampaignStatus.draft,
      recipientCount: 45,
      sentCount: 0,
      openRate: 0,
      responseRate: 0,
      createdAt: DateTime.now().subtract(const Duration(days: 2)),
      scheduledFor: null,
    ),
    _Campaign(
      id: '2',
      name: 'MBA Associate Program',
      status: CampaignStatus.sent,
      recipientCount: 128,
      sentCount: 128,
      openRate: 68.5,
      responseRate: 23.4,
      createdAt: DateTime.now().subtract(const Duration(days: 7)),
      scheduledFor: null,
    ),
    _Campaign(
      id: '3',
      name: 'NYC Networking Event',
      status: CampaignStatus.scheduled,
      recipientCount: 67,
      sentCount: 0,
      openRate: 0,
      responseRate: 0,
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
      scheduledFor: DateTime.now().add(const Duration(days: 3)),
    ),
    _Campaign(
      id: '4',
      name: 'PE Associate Recruitment',
      status: CampaignStatus.sent,
      recipientCount: 89,
      sentCount: 89,
      openRate: 72.1,
      responseRate: 31.5,
      createdAt: DateTime.now().subtract(const Duration(days: 14)),
      scheduledFor: null,
    ),
    _Campaign(
      id: '5',
      name: 'Harvard Finance Club',
      status: CampaignStatus.completed,
      recipientCount: 34,
      sentCount: 34,
      openRate: 85.3,
      responseRate: 44.1,
      createdAt: DateTime.now().subtract(const Duration(days: 30)),
      scheduledFor: null,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  List<_Campaign> _getFilteredCampaigns(CampaignStatus? status) {
    if (status == null) return _campaigns;
    return _campaigns.where((c) => c.status == status).toList();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Campaigns'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: [
            Tab(text: 'All (${_campaigns.length})'),
            Tab(
              text: 'Draft (${_getFilteredCampaigns(CampaignStatus.draft).length})',
            ),
            Tab(
              text: 'Scheduled (${_getFilteredCampaigns(CampaignStatus.scheduled).length})',
            ),
            Tab(
              text: 'Sent (${_getFilteredCampaigns(CampaignStatus.sent).length + _getFilteredCampaigns(CampaignStatus.completed).length})',
            ),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildCampaignList(context, isDark, null),
          _buildCampaignList(context, isDark, CampaignStatus.draft),
          _buildCampaignList(context, isDark, CampaignStatus.scheduled),
          _buildCampaignList(
            context,
            isDark,
            null,
            filter: (c) =>
                c.status == CampaignStatus.sent ||
                c.status == CampaignStatus.completed,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/recruiter/campaigns/new'),
        icon: const Icon(Icons.add),
        label: const Text('New Campaign'),
        backgroundColor: AppColors.teal,
        foregroundColor: Colors.white,
      ),
    );
  }

  Widget _buildCampaignList(
    BuildContext context,
    bool isDark,
    CampaignStatus? status, {
    bool Function(_Campaign)? filter,
  }) {
    List<_Campaign> campaigns;
    if (filter != null) {
      campaigns = _campaigns.where(filter).toList();
    } else {
      campaigns = _getFilteredCampaigns(status);
    }

    if (campaigns.isEmpty) {
      return _buildEmptyState(context, status);
    }

    return ListView.builder(
      padding: AppSpacing.screenPadding,
      itemCount: campaigns.length,
      itemBuilder: (context, index) {
        return _buildCampaignCard(context, isDark, campaigns[index]);
      },
    );
  }

  Widget _buildEmptyState(BuildContext context, CampaignStatus? status) {
    String message;
    switch (status) {
      case CampaignStatus.draft:
        message = 'No draft campaigns';
        break;
      case CampaignStatus.scheduled:
        message = 'No scheduled campaigns';
        break;
      case CampaignStatus.sent:
      case CampaignStatus.completed:
        message = 'No sent campaigns';
        break;
      default:
        message = 'No campaigns yet';
    }

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.campaign_outlined,
            size: 64,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
          const SizedBox(height: 16),
          Text(message, style: AppTextStyles.h4),
          const SizedBox(height: 8),
          Text(
            'Create a campaign to reach out to candidates',
            style: AppTextStyles.bodyMedium.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCampaignCard(
    BuildContext context,
    bool isDark,
    _Campaign campaign,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: AppRadius.card,
        child: InkWell(
          onTap: () {
            context.push('/recruiter/campaigns/${campaign.id}');
          },
          onLongPress: () {
            _showCampaignActions(context, campaign);
          },
          borderRadius: AppRadius.card,
          child: Container(
            padding: AppSpacing.cardPadding,
            decoration: BoxDecoration(
              borderRadius: AppRadius.card,
              border: Border.all(
                color: isDark ? AppColors.borderDark : AppColors.borderLight,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            campaign.name,
                            style: AppTextStyles.h4,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${campaign.recipientCount} recipients',
                            style: AppTextStyles.caption.copyWith(
                              color: Theme.of(context).colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    ),
                    _buildStatusBadge(campaign.status),
                  ],
                ),
                const SizedBox(height: 16),

                // Stats (for sent campaigns)
                if (campaign.status == CampaignStatus.sent ||
                    campaign.status == CampaignStatus.completed)
                  _buildStats(context, isDark, campaign),

                // Scheduled info
                if (campaign.status == CampaignStatus.scheduled &&
                    campaign.scheduledFor != null)
                  _buildScheduledInfo(context, campaign),

                // Draft actions
                if (campaign.status == CampaignStatus.draft)
                  _buildDraftActions(context, campaign),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(CampaignStatus status) {
    Color color;
    String label;
    IconData icon;

    switch (status) {
      case CampaignStatus.draft:
        color = AppColors.warning;
        label = 'Draft';
        icon = Icons.edit_outlined;
        break;
      case CampaignStatus.scheduled:
        color = AppColors.teal;
        label = 'Scheduled';
        icon = Icons.schedule;
        break;
      case CampaignStatus.sent:
        color = AppColors.emerald;
        label = 'Sent';
        icon = Icons.send;
        break;
      case CampaignStatus.completed:
        color = AppColors.success;
        label = 'Completed';
        icon = Icons.check_circle_outline;
        break;
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

  Widget _buildStats(BuildContext context, bool isDark, _Campaign campaign) {
    return Row(
      children: [
        Expanded(
          child: _buildStatItem(
            context,
            isDark,
            label: 'Sent',
            value: '${campaign.sentCount}',
            icon: Icons.send_outlined,
          ),
        ),
        Expanded(
          child: _buildStatItem(
            context,
            isDark,
            label: 'Open Rate',
            value: '${campaign.openRate.toStringAsFixed(1)}%',
            icon: Icons.visibility_outlined,
            valueColor: campaign.openRate >= 50 ? AppColors.success : null,
          ),
        ),
        Expanded(
          child: _buildStatItem(
            context,
            isDark,
            label: 'Response',
            value: '${campaign.responseRate.toStringAsFixed(1)}%',
            icon: Icons.reply_outlined,
            valueColor: campaign.responseRate >= 20 ? AppColors.success : null,
          ),
        ),
      ],
    );
  }

  Widget _buildStatItem(
    BuildContext context,
    bool isDark, {
    required String label,
    required String value,
    required IconData icon,
    Color? valueColor,
  }) {
    return Column(
      children: [
        Icon(
          icon,
          size: 18,
          color: Theme.of(context).colorScheme.onSurfaceVariant,
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: AppTextStyles.labelMedium.copyWith(
            color: valueColor,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: AppTextStyles.caption.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }

  Widget _buildScheduledInfo(BuildContext context, _Campaign campaign) {
    final scheduledFor = campaign.scheduledFor!;
    final daysUntil = scheduledFor.difference(DateTime.now()).inDays;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.teal.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          const Icon(Icons.schedule, size: 18, color: AppColors.teal),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Scheduled to send in $daysUntil day${daysUntil > 1 ? 's' : ''}',
                  style: AppTextStyles.labelSmall.copyWith(
                    color: AppColors.teal,
                  ),
                ),
                Text(
                  _formatDate(scheduledFor),
                  style: AppTextStyles.caption,
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: () {
              context.push('/recruiter/campaigns/${campaign.id}/edit');
            },
            child: const Text('Edit'),
          ),
        ],
      ),
    );
  }

  Widget _buildDraftActions(BuildContext context, _Campaign campaign) {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton(
            onPressed: () {
              context.push('/recruiter/campaigns/${campaign.id}/edit');
            },
            child: const Text('Continue Editing'),
          ),
        ),
        const SizedBox(width: 12),
        IconButton(
          onPressed: () => _deleteCampaign(campaign),
          icon: const Icon(Icons.delete_outline),
          color: AppColors.error,
        ),
      ],
    );
  }

  void _showCampaignActions(BuildContext context, _Campaign campaign) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.visibility_outlined),
              title: const Text('View Details'),
              onTap: () {
                Navigator.pop(context);
                context.push('/recruiter/campaigns/${campaign.id}');
              },
            ),
            if (campaign.status == CampaignStatus.draft ||
                campaign.status == CampaignStatus.scheduled)
              ListTile(
                leading: const Icon(Icons.edit_outlined),
                title: const Text('Edit Campaign'),
                onTap: () {
                  Navigator.pop(context);
                  context.push('/recruiter/campaigns/${campaign.id}/edit');
                },
              ),
            if (campaign.status == CampaignStatus.draft)
              ListTile(
                leading: const Icon(Icons.send_outlined),
                title: const Text('Send Now'),
                onTap: () {
                  Navigator.pop(context);
                  _sendCampaign(campaign);
                },
              ),
            ListTile(
              leading: const Icon(Icons.copy_outlined),
              title: const Text('Duplicate'),
              onTap: () {
                Navigator.pop(context);
                _duplicateCampaign(campaign);
              },
            ),
            ListTile(
              leading: Icon(Icons.delete_outline, color: AppColors.error),
              title: Text('Delete', style: TextStyle(color: AppColors.error)),
              onTap: () {
                Navigator.pop(context);
                _deleteCampaign(campaign);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _sendCampaign(_Campaign campaign) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Send Campaign'),
        content: Text(
          'Send "${campaign.name}" to ${campaign.recipientCount} recipients now?',
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
                final index = _campaigns.indexWhere((c) => c.id == campaign.id);
                if (index != -1) {
                  _campaigns[index] = campaign.copyWith(
                    status: CampaignStatus.sent,
                    sentCount: campaign.recipientCount,
                  );
                }
              });
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Campaign sent!')),
              );
            },
            child: const Text('Send'),
          ),
        ],
      ),
    );
  }

  void _duplicateCampaign(_Campaign campaign) {
    setState(() {
      _campaigns.insert(
        0,
        _Campaign(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          name: '${campaign.name} (Copy)',
          status: CampaignStatus.draft,
          recipientCount: campaign.recipientCount,
          sentCount: 0,
          openRate: 0,
          responseRate: 0,
          createdAt: DateTime.now(),
          scheduledFor: null,
        ),
      );
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Campaign duplicated')),
    );
  }

  void _deleteCampaign(_Campaign campaign) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Campaign'),
        content: Text('Are you sure you want to delete "${campaign.name}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() {
                _campaigns.removeWhere((c) => c.id == campaign.id);
              });
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
    return '${months[date.month - 1]} ${date.day}, ${date.year} at ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }
}

enum CampaignStatus { draft, scheduled, sent, completed }

class _Campaign {
  final String id;
  final String name;
  final CampaignStatus status;
  final int recipientCount;
  final int sentCount;
  final double openRate;
  final double responseRate;
  final DateTime createdAt;
  final DateTime? scheduledFor;

  _Campaign({
    required this.id,
    required this.name,
    required this.status,
    required this.recipientCount,
    required this.sentCount,
    required this.openRate,
    required this.responseRate,
    required this.createdAt,
    this.scheduledFor,
  });

  _Campaign copyWith({
    String? id,
    String? name,
    CampaignStatus? status,
    int? recipientCount,
    int? sentCount,
    double? openRate,
    double? responseRate,
    DateTime? createdAt,
    DateTime? scheduledFor,
  }) {
    return _Campaign(
      id: id ?? this.id,
      name: name ?? this.name,
      status: status ?? this.status,
      recipientCount: recipientCount ?? this.recipientCount,
      sentCount: sentCount ?? this.sentCount,
      openRate: openRate ?? this.openRate,
      responseRate: responseRate ?? this.responseRate,
      createdAt: createdAt ?? this.createdAt,
      scheduledFor: scheduledFor ?? this.scheduledFor,
    );
  }
}
