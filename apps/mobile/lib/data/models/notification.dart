import 'package:freezed_annotation/freezed_annotation.dart';

part 'notification.freezed.dart';
part 'notification.g.dart';

/// Types of notifications in the app
enum NotificationType {
  @JsonValue('job_alert')
  jobAlert,
  @JsonValue('message')
  message,
  @JsonValue('application_update')
  applicationUpdate,
  @JsonValue('profile_view')
  profileView,
  @JsonValue('campaign_update')
  campaignUpdate,
  @JsonValue('verification_update')
  verificationUpdate,
  @JsonValue('system')
  system,
}

extension NotificationTypeExtension on NotificationType {
  String get displayName {
    switch (this) {
      case NotificationType.jobAlert:
        return 'Job Alert';
      case NotificationType.message:
        return 'Message';
      case NotificationType.applicationUpdate:
        return 'Application Update';
      case NotificationType.profileView:
        return 'Profile View';
      case NotificationType.campaignUpdate:
        return 'Campaign Update';
      case NotificationType.verificationUpdate:
        return 'Verification Update';
      case NotificationType.system:
        return 'System';
    }
  }
}

/// App notification model
@freezed
sealed class AppNotification with _$AppNotification {
  const factory AppNotification({
    required String id,
    required String userId,
    required NotificationType type,
    required String title,
    required String body,
    String? actionUrl,
    Map<String, dynamic>? metadata,
    @Default(false) bool isRead,
    required DateTime createdAt,
    DateTime? readAt,
  }) = _AppNotification;

  factory AppNotification.fromJson(Map<String, dynamic> json) =>
      _$AppNotificationFromJson(json);
}
