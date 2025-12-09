import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/services/analytics_service.dart';
import 'auth_provider.dart';

/// Analytics state
class AnalyticsState {
  final bool isInitialized;
  final bool isEnabled;
  final String? userId;

  const AnalyticsState({
    this.isInitialized = false,
    this.isEnabled = true,
    this.userId,
  });

  AnalyticsState copyWith({
    bool? isInitialized,
    bool? isEnabled,
    String? userId,
  }) {
    return AnalyticsState(
      isInitialized: isInitialized ?? this.isInitialized,
      isEnabled: isEnabled ?? this.isEnabled,
      userId: userId ?? this.userId,
    );
  }
}

/// Analytics notifier for managing analytics state
class AnalyticsNotifier extends AsyncNotifier<AnalyticsState> {
  AnalyticsService get _analytics => AnalyticsService.instance;

  @override
  Future<AnalyticsState> build() async {
    // Watch auth state to track user changes
    ref.listen<AsyncValue<AuthState>>(authStateProvider, (previous, next) {
      next.whenData((authState) {
        _handleAuthStateChange(authState);
      });
    });

    // Initialize analytics
    await _analytics.initialize();

    // Get current auth state
    final authState = ref.read(authStateProvider);
    String? userId;

    authState.whenData((auth) {
      userId = auth.user?.id;
      if (userId != null) {
        _analytics.setUserId(userId);
        _setUserProperties(auth);
      }
    });

    // Log app open
    await _analytics.logAppOpen();

    return AnalyticsState(
      isInitialized: _analytics.isInitialized,
      isEnabled: _analytics.isEnabled,
      userId: userId,
    );
  }

  /// Handle auth state changes
  void _handleAuthStateChange(AuthState authState) async {
    if (authState.user != null) {
      // User signed in
      await _analytics.setUserId(authState.user!.id);
      await _setUserProperties(authState);

      state = AsyncData(state.value!.copyWith(
        userId: authState.user!.id,
      ));
    } else {
      // User signed out
      await _analytics.clearUserId();

      state = AsyncData(state.value!.copyWith(
        userId: null,
      ));
    }
  }

  /// Set user properties based on auth state
  Future<void> _setUserProperties(AuthState authState) async {
    final role = authState.userRole;
    if (role != null) {
      await _analytics.setUserProperty(
        name: AnalyticsUserProperties.userRole,
        value: role,
      );
    }
  }

  /// Update user properties (call after profile changes)
  Future<void> updateUserProperties({
    String? school,
    String? firmName,
    String? firmType,
    String? graduationYear,
    List<String>? targetRoles,
    int? profileCompleteness,
    int? accountAgeDays,
  }) async {
    if (school != null) {
      await _analytics.setUserProperty(
        name: AnalyticsUserProperties.school,
        value: school,
      );
    }
    if (firmName != null) {
      await _analytics.setUserProperty(
        name: AnalyticsUserProperties.firmName,
        value: firmName,
      );
    }
    if (firmType != null) {
      await _analytics.setUserProperty(
        name: AnalyticsUserProperties.firmType,
        value: firmType,
      );
    }
    if (graduationYear != null) {
      await _analytics.setUserProperty(
        name: AnalyticsUserProperties.graduationYear,
        value: graduationYear,
      );
    }
    if (targetRoles != null && targetRoles.isNotEmpty) {
      await _analytics.setUserProperty(
        name: AnalyticsUserProperties.targetRoles,
        value: targetRoles.take(3).join(','),
      );
    }
    if (profileCompleteness != null) {
      await _analytics.setUserProperty(
        name: AnalyticsUserProperties.profileCompleteness,
        value: '$profileCompleteness',
      );
    }
    if (accountAgeDays != null) {
      await _analytics.setUserProperty(
        name: AnalyticsUserProperties.accountAge,
        value: '$accountAgeDays',
      );
    }
  }

  /// Enable or disable analytics collection
  Future<void> setAnalyticsEnabled(bool enabled) async {
    await _analytics.setAnalyticsEnabled(enabled);
    state = AsyncData(state.value!.copyWith(isEnabled: enabled));
  }

  /// Log a screen view
  Future<void> logScreenView({
    required String screenName,
    String? screenClass,
  }) async {
    await _analytics.logScreenView(
      screenName: screenName,
      screenClass: screenClass,
    );
  }

  // ==================== Auth Events ====================

  Future<void> logSignUpStarted({required String role}) async {
    await _analytics.logSignUpStarted(role: role);
  }

  Future<void> logSignUpCompleted({
    required String role,
    String signUpMethod = 'email',
  }) async {
    await _analytics.logSignUpCompleted(role: role, signUpMethod: signUpMethod);
  }

  Future<void> logSignUpFailed({
    required String role,
    required String error,
  }) async {
    await _analytics.logSignUpFailed(role: role, error: error);
  }

  Future<void> logLogin({String loginMethod = 'email'}) async {
    await _analytics.logLogin(loginMethod: loginMethod);
  }

  Future<void> logLoginFailed({required String error}) async {
    await _analytics.logLoginFailed(error: error);
  }

  Future<void> logLogout() async {
    await _analytics.logLogout();
  }

  Future<void> logPasswordResetRequested() async {
    await _analytics.logPasswordResetRequested();
  }

  Future<void> logMfaEnabled() async {
    await _analytics.logMfaEnabled();
  }

  Future<void> logMfaVerified() async {
    await _analytics.logMfaVerified();
  }

  // ==================== Profile Events ====================

  Future<void> logProfileStarted({required String role}) async {
    await _analytics.logProfileStarted(role: role);
  }

  Future<void> logProfileCompleted({
    required String role,
    required int completenessPercent,
  }) async {
    await _analytics.logProfileCompleted(
      role: role,
      completenessPercent: completenessPercent,
    );
  }

  Future<void> logProfileUpdated({required String section}) async {
    await _analytics.logProfileUpdated(section: section);
  }

  Future<void> logResumeUploaded() async {
    await _analytics.logResumeUploaded();
  }

  Future<void> logTranscriptUploaded() async {
    await _analytics.logTranscriptUploaded();
  }

  Future<void> logProfilePhotoUpdated() async {
    await _analytics.logProfilePhotoUpdated();
  }

  // ==================== Job Events ====================

  Future<void> logJobViewed({
    required String jobId,
    required String jobTitle,
    required String firmName,
  }) async {
    await _analytics.logJobViewed(
      jobId: jobId,
      jobTitle: jobTitle,
      firmName: firmName,
    );
  }

  Future<void> logJobSaved({
    required String jobId,
    required String jobTitle,
  }) async {
    await _analytics.logJobSaved(jobId: jobId, jobTitle: jobTitle);
  }

  Future<void> logJobUnsaved({required String jobId}) async {
    await _analytics.logJobUnsaved(jobId: jobId);
  }

  Future<void> logJobApplied({
    required String jobId,
    required String jobTitle,
    required String firmName,
  }) async {
    await _analytics.logJobApplied(
      jobId: jobId,
      jobTitle: jobTitle,
      firmName: firmName,
    );
  }

  Future<void> logJobSearched({
    required String searchTerm,
    required int resultsCount,
  }) async {
    await _analytics.logJobSearched(
      searchTerm: searchTerm,
      resultsCount: resultsCount,
    );
  }

  Future<void> logJobFiltered({
    required Map<String, dynamic> filters,
    required int resultsCount,
  }) async {
    await _analytics.logJobFiltered(
      filters: filters,
      resultsCount: resultsCount,
    );
  }

  // ==================== Application Events ====================

  Future<void> logApplicationSubmitted({
    required String jobId,
    required String firmName,
  }) async {
    await _analytics.logApplicationSubmitted(jobId: jobId, firmName: firmName);
  }

  Future<void> logApplicationViewed({required String applicationId}) async {
    await _analytics.logApplicationViewed(applicationId: applicationId);
  }

  Future<void> logApplicationWithdrawn({required String applicationId}) async {
    await _analytics.logApplicationWithdrawn(applicationId: applicationId);
  }

  // ==================== Candidate Search Events ====================

  Future<void> logCandidateSearched({
    required String searchTerm,
    required int resultsCount,
  }) async {
    await _analytics.logCandidateSearched(
      searchTerm: searchTerm,
      resultsCount: resultsCount,
    );
  }

  Future<void> logCandidateFiltered({
    required Map<String, dynamic> filters,
    required int resultsCount,
  }) async {
    await _analytics.logCandidateFiltered(
      filters: filters,
      resultsCount: resultsCount,
    );
  }

  Future<void> logCandidateViewed({
    required String candidateId,
    String? school,
    String? graduationYear,
  }) async {
    await _analytics.logCandidateViewed(
      candidateId: candidateId,
      school: school,
      graduationYear: graduationYear,
    );
  }

  Future<void> logCandidateSaved({required String candidateId}) async {
    await _analytics.logCandidateSaved(candidateId: candidateId);
  }

  Future<void> logCandidateUnsaved({required String candidateId}) async {
    await _analytics.logCandidateUnsaved(candidateId: candidateId);
  }

  Future<void> logCandidateContacted({
    required String candidateId,
    required String method,
  }) async {
    await _analytics.logCandidateContacted(
      candidateId: candidateId,
      method: method,
    );
  }

  // ==================== Campaign Events ====================

  Future<void> logCampaignStarted() async {
    await _analytics.logCampaignStarted();
  }

  Future<void> logCampaignCreated({
    required String campaignId,
    required int recipientCount,
  }) async {
    await _analytics.logCampaignCreated(
      campaignId: campaignId,
      recipientCount: recipientCount,
    );
  }

  Future<void> logCampaignSent({
    required String campaignId,
    required int recipientCount,
  }) async {
    await _analytics.logCampaignSent(
      campaignId: campaignId,
      recipientCount: recipientCount,
    );
  }

  Future<void> logCampaignDeleted({required String campaignId}) async {
    await _analytics.logCampaignDeleted(campaignId: campaignId);
  }

  // ==================== Messaging Events ====================

  Future<void> logMessageSent({required String conversationId}) async {
    await _analytics.logMessageSent(conversationId: conversationId);
  }

  Future<void> logConversationStarted({required String recipientRole}) async {
    await _analytics.logConversationStarted(recipientRole: recipientRole);
  }

  Future<void> logConversationViewed({required String conversationId}) async {
    await _analytics.logConversationViewed(conversationId: conversationId);
  }

  // ==================== Engagement Events ====================

  Future<void> logNotificationReceived({required String notificationType}) async {
    await _analytics.logNotificationReceived(notificationType: notificationType);
  }

  Future<void> logNotificationTapped({required String notificationType}) async {
    await _analytics.logNotificationTapped(notificationType: notificationType);
  }

  Future<void> logDeepLinkOpened({
    required String path,
    String? source,
  }) async {
    await _analytics.logDeepLinkOpened(path: path, source: source);
  }

  Future<void> logShareContent({
    required String contentType,
    required String itemId,
  }) async {
    await _analytics.logShareContent(contentType: contentType, itemId: itemId);
  }

  // ==================== Settings Events ====================

  Future<void> logSettingsViewed() async {
    await _analytics.logSettingsViewed();
  }

  Future<void> logNotificationSettingsChanged({required bool enabled}) async {
    await _analytics.logNotificationSettingsChanged(enabled: enabled);
  }

  Future<void> logPrivacySettingsChanged({
    required String setting,
    required bool enabled,
  }) async {
    await _analytics.logPrivacySettingsChanged(setting: setting, enabled: enabled);
  }

  Future<void> logThemeChanged({required String theme}) async {
    await _analytics.logThemeChanged(theme: theme);
  }

  Future<void> logAccountDeleted({required String role}) async {
    await _analytics.logAccountDeleted(role: role);
  }

  // ==================== Error Events ====================

  Future<void> logError({
    required String errorType,
    required String errorMessage,
    String? screenName,
  }) async {
    await _analytics.logError(
      errorType: errorType,
      errorMessage: errorMessage,
      screenName: screenName,
    );
  }

  Future<void> logNetworkError({
    required String endpoint,
    required int statusCode,
  }) async {
    await _analytics.logNetworkError(
      endpoint: endpoint,
      statusCode: statusCode,
    );
  }

  // ==================== Standard Events ====================

  Future<void> logTutorialBegin() async {
    await _analytics.logTutorialBegin();
  }

  Future<void> logTutorialComplete() async {
    await _analytics.logTutorialComplete();
  }
}

/// Provider for analytics state
final analyticsNotifierProvider =
    AsyncNotifierProvider<AnalyticsNotifier, AnalyticsState>(
  AnalyticsNotifier.new,
);

/// Provider for analytics service (direct access for simple operations)
final analyticsServiceProvider = Provider<AnalyticsService>((ref) {
  return AnalyticsService.instance;
});

/// Provider for analytics observer (for navigation tracking)
final analyticsObserverProvider = Provider((ref) {
  return AnalyticsService.instance.observer;
});
