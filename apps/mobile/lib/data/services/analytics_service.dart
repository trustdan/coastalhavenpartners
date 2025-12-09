import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:flutter/foundation.dart';

/// Analytics event names used throughout the app
class AnalyticsEvents {
  // Auth events
  static const String signUpStarted = 'sign_up_started';
  static const String signUpCompleted = 'sign_up_completed';
  static const String signUpFailed = 'sign_up_failed';
  static const String login = 'login';
  static const String loginFailed = 'login_failed';
  static const String logout = 'logout';
  static const String passwordResetRequested = 'password_reset_requested';
  static const String mfaEnabled = 'mfa_enabled';
  static const String mfaVerified = 'mfa_verified';

  // Profile events
  static const String profileStarted = 'profile_started';
  static const String profileCompleted = 'profile_completed';
  static const String profileUpdated = 'profile_updated';
  static const String resumeUploaded = 'resume_uploaded';
  static const String transcriptUploaded = 'transcript_uploaded';
  static const String profilePhotoUpdated = 'profile_photo_updated';

  // Job events (candidates)
  static const String jobViewed = 'job_viewed';
  static const String jobSaved = 'job_saved';
  static const String jobUnsaved = 'job_unsaved';
  static const String jobApplied = 'job_applied';
  static const String jobSearched = 'job_searched';
  static const String jobFiltered = 'job_filtered';

  // Application events
  static const String applicationSubmitted = 'application_submitted';
  static const String applicationViewed = 'application_viewed';
  static const String applicationWithdrawn = 'application_withdrawn';

  // Candidate search events (recruiters)
  static const String candidateSearched = 'candidate_searched';
  static const String candidateFiltered = 'candidate_filtered';
  static const String candidateViewed = 'candidate_viewed';
  static const String candidateSaved = 'candidate_saved';
  static const String candidateUnsaved = 'candidate_unsaved';
  static const String candidateContacted = 'candidate_contacted';

  // Campaign events (recruiters)
  static const String campaignStarted = 'campaign_started';
  static const String campaignCreated = 'campaign_created';
  static const String campaignSent = 'campaign_sent';
  static const String campaignDeleted = 'campaign_deleted';

  // Messaging events
  static const String messageSent = 'message_sent';
  static const String conversationStarted = 'conversation_started';
  static const String conversationViewed = 'conversation_viewed';

  // Engagement events
  static const String notificationReceived = 'notification_received';
  static const String notificationTapped = 'notification_tapped';
  static const String deepLinkOpened = 'deep_link_opened';
  static const String shareContent = 'share_content';

  // Settings events
  static const String settingsViewed = 'settings_viewed';
  static const String notificationSettingsChanged = 'notification_settings_changed';
  static const String privacySettingsChanged = 'privacy_settings_changed';
  static const String themeChanged = 'theme_changed';
  static const String accountDeleted = 'account_deleted';

  // Error events
  static const String errorOccurred = 'error_occurred';
  static const String networkError = 'network_error';
}

/// User properties for analytics segmentation
class AnalyticsUserProperties {
  static const String userRole = 'user_role';
  static const String profileCompleteness = 'profile_completeness';
  static const String school = 'school';
  static const String firmName = 'firm_name';
  static const String firmType = 'firm_type';
  static const String graduationYear = 'graduation_year';
  static const String targetRoles = 'target_roles';
  static const String accountAge = 'account_age_days';
  static const String appVersion = 'app_version';
  static const String platform = 'platform';
}

/// Service for managing Firebase Analytics
class AnalyticsService {
  AnalyticsService._();
  static final AnalyticsService _instance = AnalyticsService._();
  static AnalyticsService get instance => _instance;

  FirebaseAnalytics? _analytics;
  FirebaseAnalyticsObserver? _observer;
  bool _initialized = false;
  bool _analyticsEnabled = true;

  /// Whether analytics is initialized
  bool get isInitialized => _initialized;

  /// Whether analytics collection is enabled
  bool get isEnabled => _analyticsEnabled;

  /// Analytics observer for navigation tracking
  FirebaseAnalyticsObserver? get observer => _observer;

  /// Initialize the analytics service
  Future<void> initialize() async {
    if (_initialized) return;

    try {
      _analytics = FirebaseAnalytics.instance;
      _observer = FirebaseAnalyticsObserver(analytics: _analytics!);

      // Enable analytics collection
      await _analytics!.setAnalyticsCollectionEnabled(true);

      _initialized = true;
      debugPrint('AnalyticsService initialized successfully');
    } catch (e) {
      debugPrint('AnalyticsService initialization error: $e');
      // Don't throw - analytics is optional functionality
    }
  }

  /// Enable or disable analytics collection
  Future<void> setAnalyticsEnabled(bool enabled) async {
    _analyticsEnabled = enabled;
    await _analytics?.setAnalyticsCollectionEnabled(enabled);
    debugPrint('Analytics collection ${enabled ? 'enabled' : 'disabled'}');
  }

  /// Set the current user ID for analytics
  Future<void> setUserId(String? userId) async {
    if (!_initialized || !_analyticsEnabled) return;

    try {
      await _analytics?.setUserId(id: userId);
      debugPrint('Analytics user ID set: ${userId?.substring(0, 8)}...');
    } catch (e) {
      debugPrint('Error setting analytics user ID: $e');
    }
  }

  /// Clear the user ID on logout
  Future<void> clearUserId() async {
    if (!_initialized) return;

    try {
      await _analytics?.setUserId(id: null);
      debugPrint('Analytics user ID cleared');
    } catch (e) {
      debugPrint('Error clearing analytics user ID: $e');
    }
  }

  /// Set a user property for segmentation
  Future<void> setUserProperty({
    required String name,
    required String? value,
  }) async {
    if (!_initialized || !_analyticsEnabled) return;

    try {
      await _analytics?.setUserProperty(name: name, value: value);
      debugPrint('Analytics user property set: $name = $value');
    } catch (e) {
      debugPrint('Error setting analytics user property: $e');
    }
  }

  /// Set multiple user properties at once
  Future<void> setUserProperties(Map<String, String?> properties) async {
    for (final entry in properties.entries) {
      await setUserProperty(name: entry.key, value: entry.value);
    }
  }

  /// Log a screen view
  Future<void> logScreenView({
    required String screenName,
    String? screenClass,
  }) async {
    if (!_initialized || !_analyticsEnabled) return;

    try {
      await _analytics?.logScreenView(
        screenName: screenName,
        screenClass: screenClass,
      );
      debugPrint('Analytics screen view: $screenName');
    } catch (e) {
      debugPrint('Error logging screen view: $e');
    }
  }

  /// Log a custom event
  Future<void> logEvent({
    required String name,
    Map<String, Object>? parameters,
  }) async {
    if (!_initialized || !_analyticsEnabled) return;

    try {
      await _analytics?.logEvent(
        name: name,
        parameters: parameters,
      );
      debugPrint('Analytics event: $name ${parameters ?? ''}');
    } catch (e) {
      debugPrint('Error logging event: $e');
    }
  }

  // ==================== Auth Events ====================

  /// Log sign up started
  Future<void> logSignUpStarted({required String role}) async {
    await logEvent(
      name: AnalyticsEvents.signUpStarted,
      parameters: {'role': role},
    );
  }

  /// Log successful sign up
  Future<void> logSignUpCompleted({
    required String role,
    required String signUpMethod,
  }) async {
    await _analytics?.logSignUp(signUpMethod: signUpMethod);
    await logEvent(
      name: AnalyticsEvents.signUpCompleted,
      parameters: {
        'role': role,
        'method': signUpMethod,
      },
    );
  }

  /// Log failed sign up
  Future<void> logSignUpFailed({
    required String role,
    required String error,
  }) async {
    await logEvent(
      name: AnalyticsEvents.signUpFailed,
      parameters: {
        'role': role,
        'error': error,
      },
    );
  }

  /// Log successful login
  Future<void> logLogin({required String loginMethod}) async {
    await _analytics?.logLogin(loginMethod: loginMethod);
  }

  /// Log failed login
  Future<void> logLoginFailed({required String error}) async {
    await logEvent(
      name: AnalyticsEvents.loginFailed,
      parameters: {'error': error},
    );
  }

  /// Log logout
  Future<void> logLogout() async {
    await logEvent(name: AnalyticsEvents.logout);
    await clearUserId();
  }

  /// Log password reset requested
  Future<void> logPasswordResetRequested() async {
    await logEvent(name: AnalyticsEvents.passwordResetRequested);
  }

  /// Log MFA enabled
  Future<void> logMfaEnabled() async {
    await logEvent(name: AnalyticsEvents.mfaEnabled);
  }

  /// Log MFA verified
  Future<void> logMfaVerified() async {
    await logEvent(name: AnalyticsEvents.mfaVerified);
  }

  // ==================== Profile Events ====================

  /// Log profile completion started
  Future<void> logProfileStarted({required String role}) async {
    await logEvent(
      name: AnalyticsEvents.profileStarted,
      parameters: {'role': role},
    );
  }

  /// Log profile completed
  Future<void> logProfileCompleted({
    required String role,
    required int completenessPercent,
  }) async {
    await logEvent(
      name: AnalyticsEvents.profileCompleted,
      parameters: {
        'role': role,
        'completeness_percent': completenessPercent,
      },
    );
    await setUserProperty(
      name: AnalyticsUserProperties.profileCompleteness,
      value: '$completenessPercent',
    );
  }

  /// Log profile updated
  Future<void> logProfileUpdated({
    required String section,
  }) async {
    await logEvent(
      name: AnalyticsEvents.profileUpdated,
      parameters: {'section': section},
    );
  }

  /// Log resume uploaded
  Future<void> logResumeUploaded() async {
    await logEvent(name: AnalyticsEvents.resumeUploaded);
  }

  /// Log transcript uploaded
  Future<void> logTranscriptUploaded() async {
    await logEvent(name: AnalyticsEvents.transcriptUploaded);
  }

  /// Log profile photo updated
  Future<void> logProfilePhotoUpdated() async {
    await logEvent(name: AnalyticsEvents.profilePhotoUpdated);
  }

  // ==================== Job Events (Candidates) ====================

  /// Log job viewed
  Future<void> logJobViewed({
    required String jobId,
    required String jobTitle,
    required String firmName,
  }) async {
    await _analytics?.logViewItem(
      items: [
        AnalyticsEventItem(
          itemId: jobId,
          itemName: jobTitle,
          itemCategory: 'job',
          itemBrand: firmName,
        ),
      ],
    );
    await logEvent(
      name: AnalyticsEvents.jobViewed,
      parameters: {
        'job_id': jobId,
        'job_title': jobTitle,
        'firm_name': firmName,
      },
    );
  }

  /// Log job saved
  Future<void> logJobSaved({
    required String jobId,
    required String jobTitle,
  }) async {
    await _analytics?.logAddToWishlist(
      items: [
        AnalyticsEventItem(
          itemId: jobId,
          itemName: jobTitle,
          itemCategory: 'job',
        ),
      ],
    );
    await logEvent(
      name: AnalyticsEvents.jobSaved,
      parameters: {
        'job_id': jobId,
        'job_title': jobTitle,
      },
    );
  }

  /// Log job unsaved
  Future<void> logJobUnsaved({required String jobId}) async {
    await logEvent(
      name: AnalyticsEvents.jobUnsaved,
      parameters: {'job_id': jobId},
    );
  }

  /// Log job application
  Future<void> logJobApplied({
    required String jobId,
    required String jobTitle,
    required String firmName,
  }) async {
    await logEvent(
      name: AnalyticsEvents.jobApplied,
      parameters: {
        'job_id': jobId,
        'job_title': jobTitle,
        'firm_name': firmName,
      },
    );
  }

  /// Log job search
  Future<void> logJobSearched({
    required String searchTerm,
    required int resultsCount,
  }) async {
    await _analytics?.logSearch(searchTerm: searchTerm);
    await logEvent(
      name: AnalyticsEvents.jobSearched,
      parameters: {
        'search_term': searchTerm,
        'results_count': resultsCount,
      },
    );
  }

  /// Log job filter applied
  Future<void> logJobFiltered({
    required Map<String, dynamic> filters,
    required int resultsCount,
  }) async {
    await logEvent(
      name: AnalyticsEvents.jobFiltered,
      parameters: {
        'filters': filters.keys.join(','),
        'results_count': resultsCount,
      },
    );
  }

  // ==================== Application Events ====================

  /// Log application submitted
  Future<void> logApplicationSubmitted({
    required String jobId,
    required String firmName,
  }) async {
    await logEvent(
      name: AnalyticsEvents.applicationSubmitted,
      parameters: {
        'job_id': jobId,
        'firm_name': firmName,
      },
    );
  }

  /// Log application viewed
  Future<void> logApplicationViewed({required String applicationId}) async {
    await logEvent(
      name: AnalyticsEvents.applicationViewed,
      parameters: {'application_id': applicationId},
    );
  }

  /// Log application withdrawn
  Future<void> logApplicationWithdrawn({required String applicationId}) async {
    await logEvent(
      name: AnalyticsEvents.applicationWithdrawn,
      parameters: {'application_id': applicationId},
    );
  }

  // ==================== Candidate Search Events (Recruiters) ====================

  /// Log candidate search
  Future<void> logCandidateSearched({
    required String searchTerm,
    required int resultsCount,
  }) async {
    await _analytics?.logSearch(searchTerm: searchTerm);
    await logEvent(
      name: AnalyticsEvents.candidateSearched,
      parameters: {
        'search_term': searchTerm,
        'results_count': resultsCount,
      },
    );
  }

  /// Log candidate filter applied
  Future<void> logCandidateFiltered({
    required Map<String, dynamic> filters,
    required int resultsCount,
  }) async {
    await logEvent(
      name: AnalyticsEvents.candidateFiltered,
      parameters: {
        'filters': filters.keys.join(','),
        'results_count': resultsCount,
      },
    );
  }

  /// Log candidate profile viewed
  Future<void> logCandidateViewed({
    required String candidateId,
    String? school,
    String? graduationYear,
  }) async {
    await logEvent(
      name: AnalyticsEvents.candidateViewed,
      parameters: {
        'candidate_id': candidateId,
        if (school != null) 'school': school,
        if (graduationYear != null) 'graduation_year': graduationYear,
      },
    );
  }

  /// Log candidate saved
  Future<void> logCandidateSaved({required String candidateId}) async {
    await logEvent(
      name: AnalyticsEvents.candidateSaved,
      parameters: {'candidate_id': candidateId},
    );
  }

  /// Log candidate unsaved
  Future<void> logCandidateUnsaved({required String candidateId}) async {
    await logEvent(
      name: AnalyticsEvents.candidateUnsaved,
      parameters: {'candidate_id': candidateId},
    );
  }

  /// Log candidate contacted
  Future<void> logCandidateContacted({
    required String candidateId,
    required String method,
  }) async {
    await logEvent(
      name: AnalyticsEvents.candidateContacted,
      parameters: {
        'candidate_id': candidateId,
        'method': method,
      },
    );
  }

  // ==================== Campaign Events (Recruiters) ====================

  /// Log campaign started
  Future<void> logCampaignStarted() async {
    await logEvent(name: AnalyticsEvents.campaignStarted);
  }

  /// Log campaign created
  Future<void> logCampaignCreated({
    required String campaignId,
    required int recipientCount,
  }) async {
    await logEvent(
      name: AnalyticsEvents.campaignCreated,
      parameters: {
        'campaign_id': campaignId,
        'recipient_count': recipientCount,
      },
    );
  }

  /// Log campaign sent
  Future<void> logCampaignSent({
    required String campaignId,
    required int recipientCount,
  }) async {
    await logEvent(
      name: AnalyticsEvents.campaignSent,
      parameters: {
        'campaign_id': campaignId,
        'recipient_count': recipientCount,
      },
    );
  }

  /// Log campaign deleted
  Future<void> logCampaignDeleted({required String campaignId}) async {
    await logEvent(
      name: AnalyticsEvents.campaignDeleted,
      parameters: {'campaign_id': campaignId},
    );
  }

  // ==================== Messaging Events ====================

  /// Log message sent
  Future<void> logMessageSent({
    required String conversationId,
  }) async {
    await logEvent(
      name: AnalyticsEvents.messageSent,
      parameters: {'conversation_id': conversationId},
    );
  }

  /// Log conversation started
  Future<void> logConversationStarted({
    required String recipientRole,
  }) async {
    await logEvent(
      name: AnalyticsEvents.conversationStarted,
      parameters: {'recipient_role': recipientRole},
    );
  }

  /// Log conversation viewed
  Future<void> logConversationViewed({
    required String conversationId,
  }) async {
    await logEvent(
      name: AnalyticsEvents.conversationViewed,
      parameters: {'conversation_id': conversationId},
    );
  }

  // ==================== Engagement Events ====================

  /// Log notification received
  Future<void> logNotificationReceived({
    required String notificationType,
  }) async {
    await logEvent(
      name: AnalyticsEvents.notificationReceived,
      parameters: {'notification_type': notificationType},
    );
  }

  /// Log notification tapped
  Future<void> logNotificationTapped({
    required String notificationType,
  }) async {
    await logEvent(
      name: AnalyticsEvents.notificationTapped,
      parameters: {'notification_type': notificationType},
    );
  }

  /// Log deep link opened
  Future<void> logDeepLinkOpened({
    required String path,
    String? source,
  }) async {
    await logEvent(
      name: AnalyticsEvents.deepLinkOpened,
      parameters: {
        'path': path,
        if (source != null) 'source': source,
      },
    );
  }

  /// Log content shared
  Future<void> logShareContent({
    required String contentType,
    required String itemId,
  }) async {
    await _analytics?.logShare(
      contentType: contentType,
      itemId: itemId,
      method: 'share',
    );
  }

  // ==================== Settings Events ====================

  /// Log settings viewed
  Future<void> logSettingsViewed() async {
    await logEvent(name: AnalyticsEvents.settingsViewed);
  }

  /// Log notification settings changed
  Future<void> logNotificationSettingsChanged({
    required bool enabled,
  }) async {
    await logEvent(
      name: AnalyticsEvents.notificationSettingsChanged,
      parameters: {'enabled': enabled},
    );
  }

  /// Log privacy settings changed
  Future<void> logPrivacySettingsChanged({
    required String setting,
    required bool enabled,
  }) async {
    await logEvent(
      name: AnalyticsEvents.privacySettingsChanged,
      parameters: {
        'setting': setting,
        'enabled': enabled,
      },
    );
  }

  /// Log theme changed
  Future<void> logThemeChanged({required String theme}) async {
    await logEvent(
      name: AnalyticsEvents.themeChanged,
      parameters: {'theme': theme},
    );
  }

  /// Log account deleted
  Future<void> logAccountDeleted({required String role}) async {
    await logEvent(
      name: AnalyticsEvents.accountDeleted,
      parameters: {'role': role},
    );
  }

  // ==================== Error Events ====================

  /// Log error occurred
  Future<void> logError({
    required String errorType,
    required String errorMessage,
    String? screenName,
  }) async {
    await logEvent(
      name: AnalyticsEvents.errorOccurred,
      parameters: {
        'error_type': errorType,
        'error_message': errorMessage.substring(0, errorMessage.length.clamp(0, 100)),
        if (screenName != null) 'screen_name': screenName,
      },
    );
  }

  /// Log network error
  Future<void> logNetworkError({
    required String endpoint,
    required int statusCode,
  }) async {
    await logEvent(
      name: AnalyticsEvents.networkError,
      parameters: {
        'endpoint': endpoint,
        'status_code': statusCode,
      },
    );
  }

  // ==================== Standard Firebase Events ====================

  /// Log app open
  Future<void> logAppOpen() async {
    await _analytics?.logAppOpen();
  }

  /// Log tutorial begin
  Future<void> logTutorialBegin() async {
    await _analytics?.logTutorialBegin();
  }

  /// Log tutorial complete
  Future<void> logTutorialComplete() async {
    await _analytics?.logTutorialComplete();
  }

  /// Set current screen (alternative to observer)
  Future<void> setCurrentScreen({
    required String screenName,
    String? screenClassOverride,
  }) async {
    await logScreenView(
      screenName: screenName,
      screenClass: screenClassOverride,
    );
  }

  /// Reset analytics data (for testing or user request)
  Future<void> resetAnalyticsData() async {
    if (!_initialized) return;

    try {
      await _analytics?.resetAnalyticsData();
      debugPrint('Analytics data reset');
    } catch (e) {
      debugPrint('Error resetting analytics data: $e');
    }
  }
}
