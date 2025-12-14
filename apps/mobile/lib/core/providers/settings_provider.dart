import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/user_settings.dart';
import '../../data/repositories/settings_repository.dart';

/// Provider for the settings repository
final settingsRepositoryProvider = Provider<SettingsRepository>((ref) {
  return SettingsRepository.instance;
});

/// Provider for current user settings
final userSettingsProvider = AsyncNotifierProvider<UserSettingsNotifier, UserSettings?>(
  UserSettingsNotifier.new,
);

/// Notifier for user settings with persistence
class UserSettingsNotifier extends AsyncNotifier<UserSettings?> {
  @override
  Future<UserSettings?> build() async {
    final repo = ref.read(settingsRepositoryProvider);
    return repo.getCurrentSettings();
  }

  /// Update notification settings
  Future<void> updateNotificationSettings({
    bool? emailNotifications,
    bool? pushNotifications,
    bool? jobAlerts,
    bool? messageNotifications,
    bool? marketingEmails,
  }) async {
    final current = state.hasValue ? state.value : null;
    if (current == null) return;

    // Optimistically update the state
    state = AsyncData(current.copyWith(
      emailNotifications: emailNotifications ?? current.emailNotifications,
      pushNotifications: pushNotifications ?? current.pushNotifications,
      jobAlerts: jobAlerts ?? current.jobAlerts,
      messageNotifications: messageNotifications ?? current.messageNotifications,
      marketingEmails: marketingEmails ?? current.marketingEmails,
    ));

    // Persist to Supabase
    final repo = ref.read(settingsRepositoryProvider);
    await repo.updateNotificationSettings(
      emailNotifications: emailNotifications,
      pushNotifications: pushNotifications,
      jobAlerts: jobAlerts,
      messageNotifications: messageNotifications,
      marketingEmails: marketingEmails,
    );
  }

  /// Update privacy settings
  Future<void> updatePrivacySettings({
    bool? profileVisible,
    bool? showOnlineStatus,
    bool? allowMessagesFromRecruiters,
    bool? allowMessagesFromCandidates,
  }) async {
    final current = state.hasValue ? state.value : null;
    if (current == null) return;

    // Optimistically update the state
    state = AsyncData(current.copyWith(
      profileVisible: profileVisible ?? current.profileVisible,
      showOnlineStatus: showOnlineStatus ?? current.showOnlineStatus,
      allowMessagesFromRecruiters:
          allowMessagesFromRecruiters ?? current.allowMessagesFromRecruiters,
      allowMessagesFromCandidates:
          allowMessagesFromCandidates ?? current.allowMessagesFromCandidates,
    ));

    // Persist to Supabase
    final repo = ref.read(settingsRepositoryProvider);
    await repo.updatePrivacySettings(
      profileVisible: profileVisible,
      showOnlineStatus: showOnlineStatus,
      allowMessagesFromRecruiters: allowMessagesFromRecruiters,
      allowMessagesFromCandidates: allowMessagesFromCandidates,
    );
  }

  /// Toggle a specific notification setting
  Future<void> toggleEmailNotifications(bool value) =>
      updateNotificationSettings(emailNotifications: value);

  Future<void> togglePushNotifications(bool value) =>
      updateNotificationSettings(pushNotifications: value);

  Future<void> toggleJobAlerts(bool value) =>
      updateNotificationSettings(jobAlerts: value);

  Future<void> toggleMessageNotifications(bool value) =>
      updateNotificationSettings(messageNotifications: value);

  Future<void> toggleMarketingEmails(bool value) =>
      updateNotificationSettings(marketingEmails: value);

  /// Toggle a specific privacy setting
  Future<void> toggleProfileVisible(bool value) =>
      updatePrivacySettings(profileVisible: value);

  Future<void> toggleShowOnlineStatus(bool value) =>
      updatePrivacySettings(showOnlineStatus: value);

  Future<void> toggleAllowMessagesFromRecruiters(bool value) =>
      updatePrivacySettings(allowMessagesFromRecruiters: value);

  Future<void> toggleAllowMessagesFromCandidates(bool value) =>
      updatePrivacySettings(allowMessagesFromCandidates: value);

  /// Refresh settings from server
  Future<void> refresh() async {
    state = const AsyncLoading();
    final repo = ref.read(settingsRepositoryProvider);
    state = AsyncData(await repo.getCurrentSettings());
  }
}
