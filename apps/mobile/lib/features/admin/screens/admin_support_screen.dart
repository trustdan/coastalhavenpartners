import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/providers/admin_provider.dart';
import '../../../data/models/support_message.dart';
import '../../../data/models/enums.dart';

/// Admin support inbox screen
/// Shows support tickets and inquiries
class AdminSupportScreen extends ConsumerStatefulWidget {
  const AdminSupportScreen({super.key});

  @override
  ConsumerState<AdminSupportScreen> createState() => _AdminSupportScreenState();
}

class _AdminSupportScreenState extends ConsumerState<AdminSupportScreen>
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
          'Support',
          style: AppTextStyles.h3.copyWith(color: AppColors.textPrimaryDark),
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.teal,
          unselectedLabelColor: AppColors.textSecondaryDark,
          indicatorColor: AppColors.teal,
          tabs: [
            _buildTab('Open', ref.watch(newSupportMessagesProvider)),
            _buildTab('In Progress', ref.watch(inProgressSupportMessagesProvider)),
            const Tab(text: 'Resolved'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _SupportMessagesTab(
            provider: newSupportMessagesProvider,
            emptyIcon: Icons.inbox_outlined,
            emptyTitle: 'No Open Tickets',
            emptySubtitle: 'New support requests will appear here',
          ),
          _SupportMessagesTab(
            provider: inProgressSupportMessagesProvider,
            emptyIcon: Icons.hourglass_empty,
            emptyTitle: 'No Tickets In Progress',
            emptySubtitle: 'Tickets being worked on will appear here',
          ),
          _SupportMessagesTab(
            provider: resolvedSupportMessagesProvider,
            emptyIcon: Icons.check_circle_outline,
            emptyTitle: 'No Resolved Tickets',
            emptySubtitle: 'Completed tickets will appear here',
          ),
        ],
      ),
    );
  }

  Widget _buildTab(String label, AsyncValue<List<SupportMessage>> messagesAsync) {
    return Tab(
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(label),
          messagesAsync.when(
            data: (messages) => messages.isNotEmpty
                ? Container(
                    margin: const EdgeInsets.only(left: 6),
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.teal,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      messages.length.toString(),
                      style: AppTextStyles.caption.copyWith(
                        color: Colors.white,
                        fontSize: 10,
                      ),
                    ),
                  )
                : const SizedBox.shrink(),
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
          ),
        ],
      ),
    );
  }
}

class _SupportMessagesTab extends ConsumerWidget {
  final FutureProvider<List<SupportMessage>> provider;
  final IconData emptyIcon;
  final String emptyTitle;
  final String emptySubtitle;

  const _SupportMessagesTab({
    required this.provider,
    required this.emptyIcon,
    required this.emptyTitle,
    required this.emptySubtitle,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final messagesAsync = ref.watch(provider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(provider);
      },
      child: messagesAsync.when(
        data: (messages) => messages.isEmpty
            ? _buildEmptyState()
            : ListView.builder(
                padding: const EdgeInsets.only(top: 8, bottom: 16),
                itemCount: messages.length,
                itemBuilder: (context, index) {
                  final message = messages[index];
                  return _SupportMessageCard(
                    message: message,
                    onTap: () => _showMessageDetails(context, ref, message),
                  );
                },
              ),
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppColors.teal),
        ),
        error: (error, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                color: AppColors.error,
                size: 48,
              ),
              const SizedBox(height: 16),
              Text(
                'Failed to load messages',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.textSecondaryDark,
                ),
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => ref.invalidate(provider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
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
                color: AppColors.info.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Icon(
                emptyIcon,
                color: AppColors.info,
                size: 40,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              emptyTitle,
              style: AppTextStyles.h4.copyWith(
                color: AppColors.textPrimaryDark,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              emptySubtitle,
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

  void _showMessageDetails(
      BuildContext context, WidgetRef ref, SupportMessage message) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.cardDark,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => _MessageDetailsSheet(message: message),
    );
  }
}

class _SupportMessageCard extends StatelessWidget {
  final SupportMessage message;
  final VoidCallback onTap;

  const _SupportMessageCard({
    required this.message,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardDark,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: _getTypeColor().withValues(alpha: 0.3),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                CircleAvatar(
                  radius: 18,
                  backgroundColor: AppColors.info.withValues(alpha: 0.2),
                  child: Text(
                    message.displayName.isNotEmpty
                        ? message.displayName[0].toUpperCase()
                        : '?',
                    style: AppTextStyles.labelMedium.copyWith(
                      color: AppColors.info,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        message.displayName,
                        style: AppTextStyles.labelMedium.copyWith(
                          color: AppColors.textPrimaryDark,
                        ),
                      ),
                      if (message.senderEmail != null)
                        Text(
                          message.senderEmail!,
                          style: AppTextStyles.caption.copyWith(
                            color: AppColors.textMutedDark,
                          ),
                        ),
                    ],
                  ),
                ),
                _buildTypeBadge(),
              ],
            ),

            const SizedBox(height: 12),

            // Subject
            Text(
              message.subject,
              style: AppTextStyles.labelLarge.copyWith(
                color: AppColors.textPrimaryDark,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),

            const SizedBox(height: 4),

            // Preview
            Text(
              message.preview,
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.textSecondaryDark,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),

            const SizedBox(height: 12),

            // Footer
            Row(
              children: [
                Icon(
                  Icons.access_time,
                  size: 14,
                  color: AppColors.textMutedDark,
                ),
                const SizedBox(width: 4),
                Text(
                  _formatTimeAgo(message.createdAt),
                  style: AppTextStyles.caption.copyWith(
                    color: AppColors.textMutedDark,
                  ),
                ),
                if (message.hasAttachments) ...[
                  const SizedBox(width: 12),
                  Icon(
                    Icons.attach_file,
                    size: 14,
                    color: AppColors.textMutedDark,
                  ),
                ],
                if (message.isAppeal) ...[
                  const SizedBox(width: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.warning.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      'APPEAL',
                      style: AppTextStyles.caption.copyWith(
                        color: AppColors.warning,
                        fontWeight: FontWeight.w600,
                        fontSize: 9,
                      ),
                    ),
                  ),
                ],
                const Spacer(),
                Icon(
                  Icons.arrow_forward_ios,
                  size: 14,
                  color: AppColors.textMutedDark,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTypeBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: _getTypeColor().withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        message.messageType.displayName,
        style: AppTextStyles.caption.copyWith(
          color: _getTypeColor(),
          fontWeight: FontWeight.w600,
          fontSize: 10,
        ),
      ),
    );
  }

  Color _getTypeColor() {
    return switch (message.messageType) {
      SupportMessageType.technicalSupport => AppColors.info,
      SupportMessageType.feedback => AppColors.emerald,
      SupportMessageType.verificationAppeal => AppColors.warning,
      SupportMessageType.documentIssue => AppColors.error,
      SupportMessageType.accountAccess => AppColors.teal,
      SupportMessageType.other => AppColors.textMutedDark,
    };
  }

  String _formatTimeAgo(DateTime? date) {
    if (date == null) return 'Unknown';

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

class _MessageDetailsSheet extends ConsumerStatefulWidget {
  final SupportMessage message;

  const _MessageDetailsSheet({required this.message});

  @override
  ConsumerState<_MessageDetailsSheet> createState() =>
      _MessageDetailsSheetState();
}

class _MessageDetailsSheetState extends ConsumerState<_MessageDetailsSheet> {
  bool _isLoading = false;
  final _notesController = TextEditingController();

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.75,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      expand: false,
      builder: (context, scrollController) => SingleChildScrollView(
        controller: scrollController,
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Handle bar
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.textMutedDark,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Header
            Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: AppColors.info.withValues(alpha: 0.2),
                  child: Text(
                    widget.message.displayName.isNotEmpty
                        ? widget.message.displayName[0].toUpperCase()
                        : '?',
                    style: AppTextStyles.labelLarge.copyWith(
                      color: AppColors.info,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.message.displayName,
                        style: AppTextStyles.h4.copyWith(
                          color: AppColors.textPrimaryDark,
                        ),
                      ),
                      if (widget.message.senderEmail != null)
                        Text(
                          widget.message.senderEmail!,
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.textSecondaryDark,
                          ),
                        ),
                    ],
                  ),
                ),
                _buildStatusBadge(),
              ],
            ),

            const SizedBox(height: 24),

            // Subject
            Text(
              widget.message.subject,
              style: AppTextStyles.h4.copyWith(
                color: AppColors.textPrimaryDark,
              ),
            ),

            const SizedBox(height: 8),

            // Type and time
            Row(
              children: [
                _buildTypePill(),
                const SizedBox(width: 12),
                Icon(Icons.access_time, size: 14, color: AppColors.textMutedDark),
                const SizedBox(width: 4),
                Text(
                  _formatDateTime(widget.message.createdAt),
                  style: AppTextStyles.caption.copyWith(
                    color: AppColors.textMutedDark,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Message content
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.backgroundDark,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                widget.message.message,
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.textPrimaryDark,
                ),
              ),
            ),

            if (widget.message.additionalInfo != null) ...[
              const SizedBox(height: 16),
              Text(
                'Additional Info',
                style: AppTextStyles.labelMedium.copyWith(
                  color: AppColors.teal,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.backgroundDark,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  widget.message.additionalInfo!,
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.textSecondaryDark,
                  ),
                ),
              ),
            ],

            if (widget.message.adminNotes != null) ...[
              const SizedBox(height: 16),
              Text(
                'Admin Notes',
                style: AppTextStyles.labelMedium.copyWith(
                  color: AppColors.warning,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.warning.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: AppColors.warning.withValues(alpha: 0.3),
                  ),
                ),
                child: Text(
                  widget.message.adminNotes!,
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.textPrimaryDark,
                  ),
                ),
              ),
            ],

            const SizedBox(height: 24),

            // Action buttons based on status
            if (widget.message.status != SupportMessageStatus.resolved) ...[
              // Notes input
              TextField(
                controller: _notesController,
                maxLines: 2,
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.textPrimaryDark,
                ),
                decoration: InputDecoration(
                  hintText: 'Add notes (optional)...',
                  hintStyle: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.textMutedDark,
                  ),
                  filled: true,
                  fillColor: AppColors.backgroundDark,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Action buttons
              Row(
                children: [
                  if (widget.message.status == SupportMessageStatus.newMessage)
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _isLoading ? null : _markInProgress,
                        icon: const Icon(Icons.pending_actions),
                        label: const Text('In Progress'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.info,
                          side: BorderSide(color: AppColors.info),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    ),
                  if (widget.message.status == SupportMessageStatus.newMessage)
                    const SizedBox(width: 12),
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: _isLoading ? null : _markResolved,
                      icon: _isLoading
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Icon(Icons.check_circle),
                      label: const Text('Resolve'),
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.teal,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              // Mark as spam button
              SizedBox(
                width: double.infinity,
                child: TextButton.icon(
                  onPressed: _isLoading ? null : _markAsSpam,
                  icon: const Icon(Icons.block, size: 18),
                  label: const Text('Mark as Spam'),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.error,
                  ),
                ),
              ),
            ],

            // Resolved status info
            if (widget.message.status == SupportMessageStatus.resolved) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.teal.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: AppColors.teal.withValues(alpha: 0.3),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.check_circle,
                      color: AppColors.teal,
                      size: 24,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Resolved',
                            style: AppTextStyles.labelMedium.copyWith(
                              color: AppColors.teal,
                            ),
                          ),
                          if (widget.message.handledAt != null)
                            Text(
                              _formatDateTime(widget.message.handledAt),
                              style: AppTextStyles.caption.copyWith(
                                color: AppColors.textSecondaryDark,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge() {
    final (color, label) = switch (widget.message.status) {
      SupportMessageStatus.newMessage => (AppColors.warning, 'New'),
      SupportMessageStatus.inProgress => (AppColors.info, 'In Progress'),
      SupportMessageStatus.resolved => (AppColors.teal, 'Resolved'),
      SupportMessageStatus.spam => (AppColors.error, 'Spam'),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: AppTextStyles.caption.copyWith(
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildTypePill() {
    final color = switch (widget.message.messageType) {
      SupportMessageType.technicalSupport => AppColors.info,
      SupportMessageType.feedback => AppColors.emerald,
      SupportMessageType.verificationAppeal => AppColors.warning,
      SupportMessageType.documentIssue => AppColors.error,
      SupportMessageType.accountAccess => AppColors.teal,
      SupportMessageType.other => AppColors.textMutedDark,
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        widget.message.messageType.displayName,
        style: AppTextStyles.caption.copyWith(
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  String _formatDateTime(DateTime? date) {
    if (date == null) return 'Unknown';
    return '${date.month}/${date.day}/${date.year} at ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }

  Future<void> _markInProgress() async {
    setState(() => _isLoading = true);
    try {
      final success = await ref
          .read(supportMessageActionsProvider.notifier)
          .markInProgress(widget.message.id);
      if (success && mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Ticket marked as in progress'),
            backgroundColor: AppColors.info,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _markResolved() async {
    setState(() => _isLoading = true);
    try {
      final notes = _notesController.text.trim();
      final success = await ref
          .read(supportMessageActionsProvider.notifier)
          .markResolved(widget.message.id, adminNotes: notes.isNotEmpty ? notes : null);
      if (success && mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Ticket resolved'),
            backgroundColor: AppColors.teal,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _markAsSpam() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardDark,
        title: Text(
          'Mark as Spam',
          style: AppTextStyles.h4.copyWith(color: AppColors.textPrimaryDark),
        ),
        content: Text(
          'Are you sure you want to mark this message as spam?',
          style: AppTextStyles.bodyMedium.copyWith(
            color: AppColors.textSecondaryDark,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.error,
            ),
            child: const Text('Mark as Spam'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() => _isLoading = true);
    try {
      final success = await ref
          .read(supportMessageActionsProvider.notifier)
          .markAsSpam(widget.message.id);
      if (success && mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Message marked as spam'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }
}
