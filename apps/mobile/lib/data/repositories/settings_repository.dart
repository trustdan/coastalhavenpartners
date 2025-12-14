import 'package:flutter/foundation.dart';
import 'base_repository.dart';
import '../models/user_settings.dart';
import '../../services/connectivity_service.dart';
import '../services/local_storage_service.dart';

/// Repository for user settings operations with offline support
class SettingsRepository extends BaseRepository {
  SettingsRepository._();
  static SettingsRepository? _instance;
  static SettingsRepository get instance => _instance ??= SettingsRepository._();

  final ConnectivityService _connectivity = ConnectivityService.instance;
  final LocalStorageService _localStorage = LocalStorageService.instance;

  // Cache settings in memory
  UserSettings? _cachedSettings;

  /// Get current user's settings
  Future<UserSettings?> getCurrentSettings() async {
    if (currentUserId == null) return null;

    // Return cached settings if available
    if (_cachedSettings != null && _cachedSettings!.userId == currentUserId) {
      return _cachedSettings;
    }

    // Try to load from local storage first
    final localSettings = await _loadFromLocalStorage();
    if (localSettings != null) {
      _cachedSettings = localSettings;
    }

    // If offline, return local settings
    if (!_connectivity.isOnline || !isAvailable) {
      return _cachedSettings;
    }

    // Try to fetch from Supabase
    final result = await safeExecute<UserSettings?>(
      () async {
        final response = await table('user_settings')
            .select()
            .eq('user_id', currentUserId!)
            .maybeSingle();

        if (response == null) {
          // No settings exist, create default
          return await _createDefaultSettings();
        }

        return UserSettings.fromJson(response);
      },
      errorMessage: 'Error fetching user settings',
      rethrowError: false,
    );

    if (result != null) {
      _cachedSettings = result;
      await _saveToLocalStorage(result);
    }

    return result ?? _cachedSettings;
  }

  /// Create default settings for a new user
  Future<UserSettings?> _createDefaultSettings() async {
    if (!isAvailable || currentUserId == null) return null;

    return safeExecute<UserSettings?>(() async {
      final response = await table('user_settings')
          .insert({
            'user_id': currentUserId,
            'email_notifications': true,
            'push_notifications': true,
            'job_alerts': true,
            'message_notifications': true,
            'marketing_emails': false,
            'profile_visible': true,
            'show_online_status': true,
            'allow_messages_from_recruiters': true,
            'allow_messages_from_candidates': true,
          })
          .select()
          .single();

      return UserSettings.fromJson(response);
    }, errorMessage: 'Error creating default settings');
  }

  /// Update notification preferences
  Future<bool> updateNotificationSettings({
    bool? emailNotifications,
    bool? pushNotifications,
    bool? jobAlerts,
    bool? messageNotifications,
    bool? marketingEmails,
  }) async {
    if (currentUserId == null) return false;

    // Build update map
    final updates = <String, dynamic>{
      if (emailNotifications != null) 'email_notifications': emailNotifications,
      if (pushNotifications != null) 'push_notifications': pushNotifications,
      if (jobAlerts != null) 'job_alerts': jobAlerts,
      if (messageNotifications != null) 'message_notifications': messageNotifications,
      if (marketingEmails != null) 'marketing_emails': marketingEmails,
      'updated_at': DateTime.now().toIso8601String(),
    };

    // Update cache immediately for optimistic UI
    if (_cachedSettings != null) {
      _cachedSettings = _cachedSettings!.copyWith(
        emailNotifications: emailNotifications ?? _cachedSettings!.emailNotifications,
        pushNotifications: pushNotifications ?? _cachedSettings!.pushNotifications,
        jobAlerts: jobAlerts ?? _cachedSettings!.jobAlerts,
        messageNotifications: messageNotifications ?? _cachedSettings!.messageNotifications,
        marketingEmails: marketingEmails ?? _cachedSettings!.marketingEmails,
      );
      await _saveToLocalStorage(_cachedSettings!);
    }

    // If offline, return success (will sync later)
    if (!_connectivity.isOnline || !isAvailable) {
      return true;
    }

    final result = await safeExecute<bool>(
      () async {
        await table('user_settings')
            .update(updates)
            .eq('user_id', currentUserId!);
        return true;
      },
      errorMessage: 'Error updating notification settings',
      rethrowError: false,
    );

    return result ?? false;
  }

  /// Update privacy preferences
  Future<bool> updatePrivacySettings({
    bool? profileVisible,
    bool? showOnlineStatus,
    bool? allowMessagesFromRecruiters,
    bool? allowMessagesFromCandidates,
  }) async {
    if (currentUserId == null) return false;

    // Build update map
    final updates = <String, dynamic>{
      if (profileVisible != null) 'profile_visible': profileVisible,
      if (showOnlineStatus != null) 'show_online_status': showOnlineStatus,
      if (allowMessagesFromRecruiters != null)
        'allow_messages_from_recruiters': allowMessagesFromRecruiters,
      if (allowMessagesFromCandidates != null)
        'allow_messages_from_candidates': allowMessagesFromCandidates,
      'updated_at': DateTime.now().toIso8601String(),
    };

    // Update cache immediately for optimistic UI
    if (_cachedSettings != null) {
      _cachedSettings = _cachedSettings!.copyWith(
        profileVisible: profileVisible ?? _cachedSettings!.profileVisible,
        showOnlineStatus: showOnlineStatus ?? _cachedSettings!.showOnlineStatus,
        allowMessagesFromRecruiters:
            allowMessagesFromRecruiters ?? _cachedSettings!.allowMessagesFromRecruiters,
        allowMessagesFromCandidates:
            allowMessagesFromCandidates ?? _cachedSettings!.allowMessagesFromCandidates,
      );
      await _saveToLocalStorage(_cachedSettings!);
    }

    // If offline, return success (will sync later)
    if (!_connectivity.isOnline || !isAvailable) {
      return true;
    }

    final result = await safeExecute<bool>(
      () async {
        await table('user_settings')
            .update(updates)
            .eq('user_id', currentUserId!);
        return true;
      },
      errorMessage: 'Error updating privacy settings',
      rethrowError: false,
    );

    return result ?? false;
  }

  /// Save settings to local storage
  Future<void> _saveToLocalStorage(UserSettings settings) async {
    try {
      await _localStorage.setUserSettings(settings.toJson());
    } catch (e) {
      debugPrint('Error saving settings to local storage: $e');
    }
  }

  /// Load settings from local storage
  Future<UserSettings?> _loadFromLocalStorage() async {
    try {
      final json = await _localStorage.getUserSettings();
      if (json != null) {
        return UserSettings.fromJson(json);
      }
    } catch (e) {
      debugPrint('Error loading settings from local storage: $e');
    }
    return null;
  }

  /// Clear cached settings (on logout)
  void clearCache() {
    _cachedSettings = null;
  }
}
