import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_settings.freezed.dart';
part 'user_settings.g.dart';

/// User settings model for notification and privacy preferences
@freezed
sealed class UserSettings with _$UserSettings {
  const factory UserSettings({
    required String id,
    required String userId,

    // Notification preferences
    @Default(true) @JsonKey(name: 'email_notifications') bool emailNotifications,
    @Default(true) @JsonKey(name: 'push_notifications') bool pushNotifications,
    @Default(true) @JsonKey(name: 'job_alerts') bool jobAlerts,
    @Default(true) @JsonKey(name: 'message_notifications') bool messageNotifications,
    @Default(false) @JsonKey(name: 'marketing_emails') bool marketingEmails,

    // Privacy preferences
    @Default(true) @JsonKey(name: 'profile_visible') bool profileVisible,
    @Default(true) @JsonKey(name: 'show_online_status') bool showOnlineStatus,
    @Default(true) @JsonKey(name: 'allow_messages_from_recruiters') bool allowMessagesFromRecruiters,
    @Default(true) @JsonKey(name: 'allow_messages_from_candidates') bool allowMessagesFromCandidates,

    // Timestamps
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
  }) = _UserSettings;

  factory UserSettings.fromJson(Map<String, dynamic> json) =>
      _$UserSettingsFromJson(json);

  /// Creates default settings for a new user
  factory UserSettings.defaultSettings(String userId) => UserSettings(
        id: '', // Will be set by Supabase
        userId: userId,
      );
}
