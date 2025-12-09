import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart' show Color;
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Notification types used in the app
enum NotificationType {
  newMessage,
  profileView,
  candidateMatch,
  applicationStatus,
  campaignUpdate,
  systemAlert,
}

/// Notification payload model
class NotificationPayload {
  final NotificationType type;
  final String title;
  final String body;
  final Map<String, dynamic>? data;
  final DateTime receivedAt;

  NotificationPayload({
    required this.type,
    required this.title,
    required this.body,
    this.data,
    DateTime? receivedAt,
  }) : receivedAt = receivedAt ?? DateTime.now();

  factory NotificationPayload.fromRemoteMessage(RemoteMessage message) {
    final typeString = message.data['type'] as String? ?? 'systemAlert';
    final type = NotificationType.values.firstWhere(
      (t) => t.name == typeString,
      orElse: () => NotificationType.systemAlert,
    );

    return NotificationPayload(
      type: type,
      title: message.notification?.title ?? 'Coastal Haven',
      body: message.notification?.body ?? '',
      data: message.data,
    );
  }

  /// Route path for deep linking
  String? get deepLinkRoute {
    switch (type) {
      case NotificationType.newMessage:
        final conversationId = data?['conversation_id'];
        if (conversationId != null) {
          return '/messages/$conversationId';
        }
        return '/messages';

      case NotificationType.profileView:
        return '/dashboard';

      case NotificationType.candidateMatch:
        final candidateId = data?['candidate_id'];
        if (candidateId != null) {
          return '/candidates/$candidateId';
        }
        return '/candidates';

      case NotificationType.applicationStatus:
        final applicationId = data?['application_id'];
        if (applicationId != null) {
          return '/applications/$applicationId';
        }
        return '/applications';

      case NotificationType.campaignUpdate:
        final campaignId = data?['campaign_id'];
        if (campaignId != null) {
          return '/campaigns/$campaignId';
        }
        return '/campaigns';

      case NotificationType.systemAlert:
        return null;
    }
  }
}

/// Background message handler - must be top-level function
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Initialize Firebase if needed
  await Firebase.initializeApp();
  debugPrint('Background notification received: ${message.messageId}');
}

/// Service for managing push notifications
class NotificationService {
  NotificationService._();
  static final NotificationService _instance = NotificationService._();
  static NotificationService get instance => _instance;

  bool _initialized = false;
  FirebaseMessaging? _messaging;
  FlutterLocalNotificationsPlugin? _localNotifications;
  String? _fcmToken;

  // Stream controllers
  final _notificationStream = StreamController<NotificationPayload>.broadcast();
  final _tokenStream = StreamController<String>.broadcast();

  /// Stream of received notifications
  Stream<NotificationPayload> get notificationStream => _notificationStream.stream;

  /// Stream of FCM token changes
  Stream<String> get tokenStream => _tokenStream.stream;

  /// Current FCM token
  String? get fcmToken => _fcmToken;

  /// Whether notifications are initialized
  bool get isInitialized => _initialized;

  /// Notification channels
  static const _channelId = 'coastal_haven_notifications';
  static const _channelName = 'Coastal Haven Notifications';
  static const _channelDescription = 'Notifications from Coastal Haven Partners';

  static const _messagesChannelId = 'coastal_haven_messages';
  static const _messagesChannelName = 'Messages';
  static const _messagesChannelDescription = 'New message notifications';

  /// Initialize the notification service
  Future<void> initialize() async {
    if (_initialized) return;

    try {
      // Initialize Firebase
      await Firebase.initializeApp();

      // Get Firebase Messaging instance
      _messaging = FirebaseMessaging.instance;

      // Set up background handler
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

      // Initialize local notifications
      await _initializeLocalNotifications();

      // Request permissions
      await requestPermission();

      // Get initial token
      await _getToken();

      // Listen for token refresh
      _messaging!.onTokenRefresh.listen(_onTokenRefresh);

      // Handle foreground messages
      FirebaseMessaging.onMessage.listen(_onForegroundMessage);

      // Handle notification taps (when app is in background)
      FirebaseMessaging.onMessageOpenedApp.listen(_onNotificationTap);

      // Check for initial message (app was opened from notification)
      final initialMessage = await _messaging!.getInitialMessage();
      if (initialMessage != null) {
        _onNotificationTap(initialMessage);
      }

      _initialized = true;
      debugPrint('NotificationService initialized successfully');
    } catch (e) {
      debugPrint('NotificationService initialization error: $e');
      // Don't throw - notifications are optional functionality
    }
  }

  /// Initialize local notifications plugin
  Future<void> _initializeLocalNotifications() async {
    _localNotifications = FlutterLocalNotificationsPlugin();

    // Android settings
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');

    // iOS settings
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications!.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onLocalNotificationTap,
    );

    // Create notification channels for Android
    if (Platform.isAndroid) {
      final androidPlugin = _localNotifications!
          .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();

      if (androidPlugin != null) {
        // Main channel
        await androidPlugin.createNotificationChannel(
          const AndroidNotificationChannel(
            _channelId,
            _channelName,
            description: _channelDescription,
            importance: Importance.high,
          ),
        );

        // Messages channel (high priority)
        await androidPlugin.createNotificationChannel(
          const AndroidNotificationChannel(
            _messagesChannelId,
            _messagesChannelName,
            description: _messagesChannelDescription,
            importance: Importance.max,
            playSound: true,
            enableVibration: true,
          ),
        );
      }
    }
  }

  /// Request notification permissions
  Future<bool> requestPermission() async {
    if (_messaging == null) return false;

    final settings = await _messaging!.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );

    final granted = settings.authorizationStatus == AuthorizationStatus.authorized ||
        settings.authorizationStatus == AuthorizationStatus.provisional;

    debugPrint('Notification permission: ${settings.authorizationStatus}');
    return granted;
  }

  /// Check if notifications are enabled
  Future<bool> areNotificationsEnabled() async {
    if (_messaging == null) return false;

    final settings = await _messaging!.getNotificationSettings();
    return settings.authorizationStatus == AuthorizationStatus.authorized ||
        settings.authorizationStatus == AuthorizationStatus.provisional;
  }

  /// Get and store FCM token
  Future<String?> _getToken() async {
    try {
      _fcmToken = await _messaging?.getToken();
      if (_fcmToken != null) {
        debugPrint('FCM Token: ${_fcmToken!.substring(0, 20)}...');
        await _registerTokenWithBackend(_fcmToken!);
        _tokenStream.add(_fcmToken!);
      }
      return _fcmToken;
    } catch (e) {
      debugPrint('Error getting FCM token: $e');
      return null;
    }
  }

  /// Handle token refresh
  void _onTokenRefresh(String token) {
    debugPrint('FCM Token refreshed');
    _fcmToken = token;
    _tokenStream.add(token);
    _registerTokenWithBackend(token);
  }

  /// Register token with backend
  Future<void> _registerTokenWithBackend(String token) async {
    try {
      // Register with Supabase if authenticated
      final client = _getSupabaseClient();
      if (client != null) {
        final userId = client.auth.currentUser?.id;
        if (userId != null) {
          // Use the upsert_device_token RPC function
          await client.rpc('upsert_device_token', params: {
            'p_user_id': userId,
            'p_token': token,
            'p_platform': Platform.isAndroid ? 'android' : 'ios',
          });
          debugPrint('FCM token registered with backend');
        }
      }
    } catch (e) {
      debugPrint('Error registering token with backend: $e');
    }
  }

  /// Get Supabase client if available
  SupabaseClient? _getSupabaseClient() {
    try {
      return Supabase.instance.client;
    } catch (e) {
      return null;
    }
  }

  /// Handle foreground messages
  void _onForegroundMessage(RemoteMessage message) {
    debugPrint('Foreground notification: ${message.notification?.title}');

    final payload = NotificationPayload.fromRemoteMessage(message);
    _notificationStream.add(payload);

    // Show local notification while app is in foreground
    _showLocalNotification(payload);
  }

  /// Handle notification tap (from background)
  void _onNotificationTap(RemoteMessage message) {
    debugPrint('Notification tapped: ${message.notification?.title}');

    final payload = NotificationPayload.fromRemoteMessage(message);
    _notificationStream.add(payload);

    // Deep link will be handled by the listener in the app
  }

  /// Handle local notification tap
  void _onLocalNotificationTap(NotificationResponse response) {
    debugPrint('Local notification tapped: ${response.payload}');

    if (response.payload != null) {
      try {
        final data = jsonDecode(response.payload!) as Map<String, dynamic>;
        final typeString = data['type'] as String? ?? 'systemAlert';
        final type = NotificationType.values.firstWhere(
          (t) => t.name == typeString,
          orElse: () => NotificationType.systemAlert,
        );

        final payload = NotificationPayload(
          type: type,
          title: data['title'] as String? ?? '',
          body: data['body'] as String? ?? '',
          data: data,
        );

        _notificationStream.add(payload);
      } catch (e) {
        debugPrint('Error parsing notification payload: $e');
      }
    }
  }

  /// Show a local notification
  Future<void> _showLocalNotification(NotificationPayload payload) async {
    if (_localNotifications == null) return;

    // Select channel based on notification type
    final channelId = payload.type == NotificationType.newMessage
        ? _messagesChannelId
        : _channelId;

    final androidDetails = AndroidNotificationDetails(
      channelId,
      payload.type == NotificationType.newMessage ? _messagesChannelName : _channelName,
      channelDescription: payload.type == NotificationType.newMessage
          ? _messagesChannelDescription
          : _channelDescription,
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
      icon: '@mipmap/ic_launcher',
      color: const Color(0xFF0D9488), // Teal brand color
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    final details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    // Encode payload for later retrieval
    final payloadJson = jsonEncode({
      'type': payload.type.name,
      'title': payload.title,
      'body': payload.body,
      ...?payload.data,
    });

    await _localNotifications!.show(
      DateTime.now().millisecondsSinceEpoch.remainder(100000),
      payload.title,
      payload.body,
      details,
      payload: payloadJson,
    );
  }

  /// Show a custom local notification
  Future<void> showNotification({
    required String title,
    required String body,
    NotificationType type = NotificationType.systemAlert,
    Map<String, dynamic>? data,
  }) async {
    final payload = NotificationPayload(
      type: type,
      title: title,
      body: body,
      data: data,
    );
    await _showLocalNotification(payload);
  }

  /// Cancel all notifications
  Future<void> cancelAllNotifications() async {
    await _localNotifications?.cancelAll();
  }

  /// Cancel a specific notification
  Future<void> cancelNotification(int id) async {
    await _localNotifications?.cancel(id);
  }

  /// Subscribe to a topic
  Future<void> subscribeToTopic(String topic) async {
    await _messaging?.subscribeToTopic(topic);
    debugPrint('Subscribed to topic: $topic');
  }

  /// Unsubscribe from a topic
  Future<void> unsubscribeFromTopic(String topic) async {
    await _messaging?.unsubscribeFromTopic(topic);
    debugPrint('Unsubscribed from topic: $topic');
  }

  /// Unregister device token on logout
  Future<void> unregisterToken() async {
    try {
      final client = _getSupabaseClient();
      if (client != null && _fcmToken != null) {
        final userId = client.auth.currentUser?.id;
        if (userId != null) {
          await client
              .from('device_tokens')
              .delete()
              .eq('user_id', userId)
              .eq('token', _fcmToken!);
        }
      }

      // Delete the token
      await _messaging?.deleteToken();
      _fcmToken = null;

      debugPrint('FCM token unregistered');
    } catch (e) {
      debugPrint('Error unregistering token: $e');
    }
  }

  /// Dispose of resources
  void dispose() {
    _notificationStream.close();
    _tokenStream.close();
  }
}
