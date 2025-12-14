import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/providers/notification_provider.dart';
import '../../../data/models/notification.dart';

/// Notifications Screen - Shows all user notifications
class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationsAsync = ref.watch(notificationListNotifierProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert),
            onSelected: (value) {
              if (value == 'mark_all_read') {
                ref.read(notificationListNotifierProvider.notifier).markAllAsRead();
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'mark_all_read',
                child: Row(
                  children: [
                    Icon(Icons.done_all, size: 20),
                    SizedBox(width: 12),
                    Text('Mark all as read'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await ref.read(notificationListNotifierProvider.notifier).refresh();
        },
        child: notificationsAsync.when(
          data: (notifications) {
            if (notifications.isEmpty) {
              return _buildEmptyState(context);
            }
            return ListView.builder(
              padding: AppSpacing.screenPadding,
              itemCount: notifications.length,
              itemBuilder: (context, index) {
                final notification = notifications[index];
                return _NotificationTile(
                  notification: notification,
                  isDark: isDark,
                  onTap: () => _handleNotificationTap(context, ref, notification),
                  onDismiss: () {
                    ref
                        .read(notificationListNotifierProvider.notifier)
                        .deleteNotification(notification.id);
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
                Text('Error loading notifications'),
                const SizedBox(height: 8),
                ElevatedButton(
                  onPressed: () => ref.invalidate(notificationListNotifierProvider),
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
            Icons.notifications_none_outlined,
            size: 64,
            color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.3),
          ),
          const SizedBox(height: 16),
          Text(
            'No notifications yet',
            style: AppTextStyles.h4.copyWith(
              color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'When you receive notifications, they\'ll appear here',
            style: AppTextStyles.bodySmall.copyWith(
              color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.4),
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  void _handleNotificationTap(
    BuildContext context,
    WidgetRef ref,
    AppNotification notification,
  ) {
    // Mark as read
    if (!notification.isRead) {
      ref.read(notificationListNotifierProvider.notifier).markAsRead(notification.id);
    }

    // Navigate if there's an action URL
    if (notification.actionUrl != null && notification.actionUrl!.isNotEmpty) {
      context.push(notification.actionUrl!);
    }
  }
}

/// Individual notification tile widget
class _NotificationTile extends StatelessWidget {
  final AppNotification notification;
  final bool isDark;
  final VoidCallback onTap;
  final VoidCallback onDismiss;

  const _NotificationTile({
    required this.notification,
    required this.isDark,
    required this.onTap,
    required this.onDismiss,
  });

  @override
  Widget build(BuildContext context) {
    return Dismissible(
      key: Key(notification.id),
      direction: DismissDirection.endToStart,
      onDismissed: (_) => onDismiss(),
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 16),
        decoration: BoxDecoration(
          color: AppColors.error,
          borderRadius: AppRadius.card,
        ),
        child: const Icon(Icons.delete, color: Colors.white),
      ),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        decoration: BoxDecoration(
          color: notification.isRead
              ? (isDark ? AppColors.cardDark : AppColors.cardLight)
              : (isDark
                  ? AppColors.teal.withValues(alpha: 0.1)
                  : AppColors.teal.withValues(alpha: 0.05)),
          borderRadius: AppRadius.card,
          border: Border.all(
            color: notification.isRead
                ? (isDark ? AppColors.borderDark : AppColors.borderLight)
                : AppColors.teal.withValues(alpha: 0.3),
          ),
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            borderRadius: AppRadius.card,
            child: Padding(
              padding: AppSpacing.cardPadding,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Icon
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: _getTypeColor(notification.type).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      _getTypeIcon(notification.type),
                      color: _getTypeColor(notification.type),
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Content
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                notification.title,
                                style: AppTextStyles.labelMedium.copyWith(
                                  fontWeight: notification.isRead
                                      ? FontWeight.normal
                                      : FontWeight.w600,
                                ),
                              ),
                            ),
                            if (!notification.isRead)
                              Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                  color: AppColors.teal,
                                  shape: BoxShape.circle,
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          notification.body,
                          style: AppTextStyles.bodySmall.copyWith(
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _formatTime(notification.createdAt),
                          style: AppTextStyles.caption.copyWith(
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  IconData _getTypeIcon(NotificationType type) {
    switch (type) {
      case NotificationType.jobAlert:
        return Icons.work_outline;
      case NotificationType.message:
        return Icons.chat_bubble_outline;
      case NotificationType.applicationUpdate:
        return Icons.description_outlined;
      case NotificationType.profileView:
        return Icons.visibility_outlined;
      case NotificationType.campaignUpdate:
        return Icons.campaign_outlined;
      case NotificationType.verificationUpdate:
        return Icons.verified_outlined;
      case NotificationType.system:
        return Icons.notifications_outlined;
    }
  }

  Color _getTypeColor(NotificationType type) {
    switch (type) {
      case NotificationType.jobAlert:
        return AppColors.teal;
      case NotificationType.message:
        return AppColors.info;
      case NotificationType.applicationUpdate:
        return AppColors.emerald;
      case NotificationType.profileView:
        return AppColors.green;
      case NotificationType.campaignUpdate:
        return AppColors.warning;
      case NotificationType.verificationUpdate:
        return AppColors.success;
      case NotificationType.system:
        return AppColors.info;
    }
  }

  String _formatTime(DateTime time) {
    final now = DateTime.now();
    final diff = now.difference(time);

    if (diff.inMinutes < 1) {
      return 'Just now';
    } else if (diff.inMinutes < 60) {
      return '${diff.inMinutes}m ago';
    } else if (diff.inHours < 24) {
      return '${diff.inHours}h ago';
    } else if (diff.inDays < 7) {
      return '${diff.inDays}d ago';
    } else {
      final months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return '${months[time.month - 1]} ${time.day}';
    }
  }
}
