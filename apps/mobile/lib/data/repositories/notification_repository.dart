import 'package:supabase_flutter/supabase_flutter.dart';
import 'base_repository.dart';
import '../models/notification.dart';

/// Repository for notification operations
class NotificationRepository extends BaseRepository {
  NotificationRepository._();
  static NotificationRepository? _instance;
  static NotificationRepository get instance =>
      _instance ??= NotificationRepository._();

  /// Fetch all notifications for current user
  Future<List<AppNotification>> getNotifications({
    int limit = 50,
    int offset = 0,
    bool unreadOnly = false,
  }) async {
    if (!isAvailable) return [];

    final userId = currentUserId;
    if (userId == null) return [];

    final result = await safeExecute<List<AppNotification>>(() async {
      final baseQuery = table('notifications')
          .select()
          .eq('user_id', userId);

      final response = unreadOnly
          ? await baseQuery
              .eq('is_read', false)
              .order('created_at', ascending: false)
              .range(offset, offset + limit - 1)
          : await baseQuery
              .order('created_at', ascending: false)
              .range(offset, offset + limit - 1);

      return (response as List)
          .map((json) => AppNotification.fromJson(json))
          .toList();
    }, errorMessage: 'Error fetching notifications', rethrowError: false);

    return result ?? [];
  }

  /// Get unread notification count
  Future<int> getUnreadCount() async {
    if (!isAvailable) return 0;

    final userId = currentUserId;
    if (userId == null) return 0;

    final result = await safeExecute<int>(() async {
      final response = await table('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('is_read', false);

      return (response as List).length;
    }, errorMessage: 'Error getting unread count', rethrowError: false);

    return result ?? 0;
  }

  /// Mark a notification as read
  Future<bool> markAsRead(String notificationId) async {
    if (!isAvailable) return false;

    final result = await safeExecute<bool>(() async {
      await table('notifications').update({
        'is_read': true,
        'read_at': DateTime.now().toIso8601String(),
      }).eq('id', notificationId);
      return true;
    }, errorMessage: 'Error marking notification as read', rethrowError: false);

    return result ?? false;
  }

  /// Mark all notifications as read
  Future<bool> markAllAsRead() async {
    if (!isAvailable) return false;

    final userId = currentUserId;
    if (userId == null) return false;

    final result = await safeExecute<bool>(() async {
      await table('notifications').update({
        'is_read': true,
        'read_at': DateTime.now().toIso8601String(),
      }).eq('user_id', userId).eq('is_read', false);
      return true;
    }, errorMessage: 'Error marking all as read', rethrowError: false);

    return result ?? false;
  }

  /// Delete a notification
  Future<bool> deleteNotification(String notificationId) async {
    if (!isAvailable) return false;

    final result = await safeExecute<bool>(() async {
      await table('notifications').delete().eq('id', notificationId);
      return true;
    }, errorMessage: 'Error deleting notification', rethrowError: false);

    return result ?? false;
  }

  /// Subscribe to real-time notifications
  RealtimeChannel subscribeToNotifications(
    void Function(AppNotification notification) onNotification,
  ) {
    final userId = currentUserId;
    if (userId == null || !isAvailable) {
      throw Exception('User not authenticated');
    }

    return client!
        .channel('notifications:$userId')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'notifications',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'user_id',
            value: userId,
          ),
          callback: (payload) {
            final notification = AppNotification.fromJson(payload.newRecord);
            onNotification(notification);
          },
        )
        .subscribe();
  }
}
