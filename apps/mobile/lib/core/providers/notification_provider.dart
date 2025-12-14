import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../data/services/notification_service.dart';
import '../../data/repositories/notification_repository.dart';
import '../../data/models/notification.dart' as db;

/// State for notification management
class NotificationState {
  final bool isInitialized;
  final bool hasPermission;
  final String? fcmToken;
  final NotificationPayload? lastNotification;
  final bool isLoading;
  final String? error;

  const NotificationState({
    this.isInitialized = false,
    this.hasPermission = false,
    this.fcmToken,
    this.lastNotification,
    this.isLoading = false,
    this.error,
  });

  NotificationState copyWith({
    bool? isInitialized,
    bool? hasPermission,
    String? fcmToken,
    NotificationPayload? lastNotification,
    bool? isLoading,
    String? error,
  }) {
    return NotificationState(
      isInitialized: isInitialized ?? this.isInitialized,
      hasPermission: hasPermission ?? this.hasPermission,
      fcmToken: fcmToken ?? this.fcmToken,
      lastNotification: lastNotification ?? this.lastNotification,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Notifier for managing notification state
class NotificationNotifier extends AsyncNotifier<NotificationState> {
  final NotificationService _service = NotificationService.instance;
  StreamSubscription<NotificationPayload>? _notificationSubscription;
  StreamSubscription<String>? _tokenSubscription;

  // Callback for deep link navigation
  void Function(String route)? onDeepLink;

  @override
  Future<NotificationState> build() async {
    // Clean up subscriptions when provider is disposed
    ref.onDispose(() {
      _notificationSubscription?.cancel();
      _tokenSubscription?.cancel();
    });

    // Try to initialize notifications
    try {
      await _service.initialize();

      // Listen for notifications
      _notificationSubscription = _service.notificationStream.listen(
        _onNotificationReceived,
      );

      // Listen for token changes
      _tokenSubscription = _service.tokenStream.listen((token) {
        final currentState = state.hasValue ? state.value! : const NotificationState();
        state = AsyncData(currentState.copyWith(fcmToken: token));
      });

      final hasPermission = await _service.areNotificationsEnabled();

      return NotificationState(
        isInitialized: true,
        hasPermission: hasPermission,
        fcmToken: _service.fcmToken,
      );
    } catch (e) {
      debugPrint('NotificationNotifier error: $e');
      return NotificationState(
        isInitialized: false,
        error: e.toString(),
      );
    }
  }

  /// Get current state value safely
  NotificationState get _currentValue {
    return state.hasValue ? state.value! : const NotificationState();
  }

  /// Request notification permission
  Future<bool> requestPermission() async {
    final granted = await _service.requestPermission();
    state = AsyncData(_currentValue.copyWith(hasPermission: granted));
    return granted;
  }

  /// Handle received notification
  void _onNotificationReceived(NotificationPayload payload) {
    debugPrint('Notification received: ${payload.title}');
    state = AsyncData(_currentValue.copyWith(lastNotification: payload));

    // Handle deep link if callback is set
    if (onDeepLink != null && payload.deepLinkRoute != null) {
      onDeepLink!(payload.deepLinkRoute!);
    }
  }

  /// Clear last notification
  void clearLastNotification() {
    state = AsyncData(_currentValue.copyWith(lastNotification: null));
  }

  /// Subscribe to a topic
  Future<void> subscribeToTopic(String topic) async {
    await _service.subscribeToTopic(topic);
  }

  /// Unsubscribe from a topic
  Future<void> unsubscribeFromTopic(String topic) async {
    await _service.unsubscribeFromTopic(topic);
  }

  /// Subscribe user to their role-specific topics
  Future<void> subscribeUserTopics({
    required String userId,
    required String role,
  }) async {
    // Subscribe to user-specific topic
    await _service.subscribeToTopic('user_$userId');

    // Subscribe to role-specific topic
    await _service.subscribeToTopic('role_$role');

    // Subscribe to all users topic for announcements
    await _service.subscribeToTopic('all_users');
  }

  /// Unsubscribe user from all topics on logout
  Future<void> unsubscribeUserTopics({
    required String userId,
    required String role,
  }) async {
    await _service.unsubscribeFromTopic('user_$userId');
    await _service.unsubscribeFromTopic('role_$role');
    await _service.unsubscribeFromTopic('all_users');
  }

  /// Unregister token on logout
  Future<void> unregisterToken() async {
    await _service.unregisterToken();
    state = AsyncData(_currentValue.copyWith(fcmToken: null));
  }

  /// Show a local notification
  Future<void> showNotification({
    required String title,
    required String body,
    NotificationType type = NotificationType.systemAlert,
    Map<String, dynamic>? data,
  }) async {
    await _service.showNotification(
      title: title,
      body: body,
      type: type,
      data: data,
    );
  }

  /// Cancel all notifications
  Future<void> cancelAllNotifications() async {
    await _service.cancelAllNotifications();
  }

  /// Set up deep link handler with GoRouter
  void setupDeepLinkHandler(GoRouter router) {
    onDeepLink = (route) {
      debugPrint('Deep linking to: $route');
      router.go(route);
    };
  }
}

/// Provider for notification state management
final notificationProvider =
    AsyncNotifierProvider<NotificationNotifier, NotificationState>(
  NotificationNotifier.new,
);

/// Provider to check if notifications are enabled
final notificationsEnabledProvider = Provider<bool>((ref) {
  final notificationAsync = ref.watch(notificationProvider);
  return notificationAsync.hasValue ? notificationAsync.value!.hasPermission : false;
});

/// Provider for the current FCM token
final fcmTokenProvider = Provider<String?>((ref) {
  final notificationAsync = ref.watch(notificationProvider);
  return notificationAsync.hasValue ? notificationAsync.value!.fcmToken : null;
});

/// Provider for the last received notification
final lastNotificationProvider = Provider<NotificationPayload?>((ref) {
  final notificationAsync = ref.watch(notificationProvider);
  return notificationAsync.hasValue ? notificationAsync.value!.lastNotification : null;
});

// =====================
// Database Notification Providers (for notification list screen)
// =====================

/// Provider for notification repository instance
final notificationRepositoryProvider = Provider<NotificationRepository>((ref) {
  return NotificationRepository.instance;
});

/// Provider for fetching notification list from database
final notificationListProvider = FutureProvider<List<db.AppNotification>>((ref) async {
  final repo = ref.watch(notificationRepositoryProvider);
  return repo.getNotifications();
});

/// Provider for unread notification count
final unreadNotificationCountProvider = FutureProvider<int>((ref) async {
  final repo = ref.watch(notificationRepositoryProvider);
  return repo.getUnreadCount();
});

/// Notifier for managing notification list actions
class NotificationListNotifier extends AsyncNotifier<List<db.AppNotification>> {
  @override
  Future<List<db.AppNotification>> build() async {
    final repo = ref.watch(notificationRepositoryProvider);
    return repo.getNotifications();
  }

  /// Mark a notification as read
  Future<void> markAsRead(String notificationId) async {
    final repo = ref.read(notificationRepositoryProvider);
    final success = await repo.markAsRead(notificationId);
    if (success) {
      // Update the list optimistically
      final current = state.hasValue ? state.value! : <db.AppNotification>[];
      state = AsyncData(
        current.map((n) {
          if (n.id == notificationId) {
            return db.AppNotification(
              id: n.id,
              userId: n.userId,
              type: n.type,
              title: n.title,
              body: n.body,
              actionUrl: n.actionUrl,
              metadata: n.metadata,
              isRead: true,
              createdAt: n.createdAt,
              readAt: DateTime.now(),
            );
          }
          return n;
        }).toList(),
      );
      // Invalidate unread count
      ref.invalidate(unreadNotificationCountProvider);
    }
  }

  /// Mark all notifications as read
  Future<void> markAllAsRead() async {
    final repo = ref.read(notificationRepositoryProvider);
    final success = await repo.markAllAsRead();
    if (success) {
      // Update the list optimistically
      final current = state.hasValue ? state.value! : <db.AppNotification>[];
      state = AsyncData(
        current.map((n) => db.AppNotification(
          id: n.id,
          userId: n.userId,
          type: n.type,
          title: n.title,
          body: n.body,
          actionUrl: n.actionUrl,
          metadata: n.metadata,
          isRead: true,
          createdAt: n.createdAt,
          readAt: DateTime.now(),
        )).toList(),
      );
      // Invalidate unread count
      ref.invalidate(unreadNotificationCountProvider);
    }
  }

  /// Delete a notification
  Future<void> deleteNotification(String notificationId) async {
    final repo = ref.read(notificationRepositoryProvider);
    final success = await repo.deleteNotification(notificationId);
    if (success) {
      // Update the list optimistically
      final current = state.hasValue ? state.value! : <db.AppNotification>[];
      state = AsyncData(current.where((n) => n.id != notificationId).toList());
      // Invalidate unread count
      ref.invalidate(unreadNotificationCountProvider);
    }
  }

  /// Refresh the notification list
  Future<void> refresh() async {
    state = const AsyncLoading();
    final repo = ref.read(notificationRepositoryProvider);
    final notifications = await repo.getNotifications();
    state = AsyncData(notifications);
  }
}

/// Provider for notification list management
final notificationListNotifierProvider =
    AsyncNotifierProvider<NotificationListNotifier, List<db.AppNotification>>(
  NotificationListNotifier.new,
);
