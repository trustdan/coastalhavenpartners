import 'package:freezed_annotation/freezed_annotation.dart';
import 'enums.dart';
import 'profile.dart';

part 'recruiter.freezed.dart';
part 'recruiter.g.dart';

/// Helper to read nested candidate profile data
Object? _readCandidateProfile(Map<dynamic, dynamic> json, String key) =>
    json['candidate_profiles'] ?? json['candidate_profile'];

/// Bookmarked candidate model
@freezed
sealed class BookmarkedCandidate with _$BookmarkedCandidate {
  const factory BookmarkedCandidate({
    required String id,
    @JsonKey(name: 'recruiter_id') required String recruiterId,
    @JsonKey(name: 'candidate_id') required String candidateId,
    @Default(BookmarkStatus.newBookmark) BookmarkStatus status,
    String? notes,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    // Joined candidate profile (exclude from toJson)
    @JsonKey(readValue: _readCandidateProfile, includeToJson: false) CandidateProfile? candidateProfile,
  }) = _BookmarkedCandidate;

  factory BookmarkedCandidate.fromJson(Map<String, dynamic> json) =>
      _$BookmarkedCandidateFromJson(json);
}

/// Saved search model
@freezed
sealed class SavedSearch with _$SavedSearch {
  const factory SavedSearch({
    required String id,
    @JsonKey(name: 'recruiter_id') required String recruiterId,
    required String name,
    required Map<String, dynamic> filters,
    @JsonKey(name: 'notify_new_matches') @Default(false) bool notifyNewMatches,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
  }) = _SavedSearch;

  factory SavedSearch.fromJson(Map<String, dynamic> json) =>
      _$SavedSearchFromJson(json);
}

/// Recruiter campaign model
@freezed
sealed class RecruiterCampaign with _$RecruiterCampaign {
  const RecruiterCampaign._();

  const factory RecruiterCampaign({
    required String id,
    @JsonKey(name: 'recruiter_profile_id') required String recruiterProfileId,
    required String name,
    required String subject,
    @JsonKey(name: 'message_template') required String messageTemplate,
    Map<String, dynamic>? filters,
    @JsonKey(name: 'saved_search_id') String? savedSearchId,
    CampaignStatus? status,
    @JsonKey(name: 'scheduled_at') DateTime? scheduledAt,
    @JsonKey(name: 'sent_at') DateTime? sentAt,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
    // Stats from view
    @Default(0) int totalRecipients,
    @Default(0) int sentCount,
    @Default(0) int openedCount,
    @Default(0) int repliedCount,
    @Default(0) int failedCount,
  }) = _RecruiterCampaign;

  factory RecruiterCampaign.fromJson(Map<String, dynamic> json) =>
      _$RecruiterCampaignFromJson(json);

  /// Calculate open rate
  double get openRate {
    if (sentCount == 0) return 0;
    return (openedCount / sentCount) * 100;
  }

  /// Calculate reply rate
  double get replyRate {
    if (sentCount == 0) return 0;
    return (repliedCount / sentCount) * 100;
  }
}

/// Campaign recipient model
@freezed
sealed class CampaignRecipient with _$CampaignRecipient {
  const factory CampaignRecipient({
    required String id,
    @JsonKey(name: 'campaign_id') required String campaignId,
    @JsonKey(name: 'candidate_profile_id') required String candidateProfileId,
    String? status,
    @JsonKey(name: 'message_id') String? messageId,
    @JsonKey(name: 'conversation_id') String? conversationId,
    @JsonKey(name: 'sent_at') DateTime? sentAt,
    @JsonKey(name: 'opened_at') DateTime? openedAt,
    @JsonKey(name: 'replied_at') DateTime? repliedAt,
    @JsonKey(name: 'error_message') String? errorMessage,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    // Joined candidate profile (exclude from toJson)
    @JsonKey(name: 'candidate_profiles', includeToJson: false) CandidateProfile? candidateProfile,
  }) = _CampaignRecipient;

  factory CampaignRecipient.fromJson(Map<String, dynamic> json) =>
      _$CampaignRecipientFromJson(json);
}

/// Recruiter candidate notes model
@freezed
sealed class RecruiterCandidateNote with _$RecruiterCandidateNote {
  const factory RecruiterCandidateNote({
    required String id,
    @JsonKey(name: 'recruiter_id') required String recruiterId,
    @JsonKey(name: 'candidate_id') required String candidateId,
    required String content,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
  }) = _RecruiterCandidateNote;

  factory RecruiterCandidateNote.fromJson(Map<String, dynamic> json) =>
      _$RecruiterCandidateNoteFromJson(json);
}

/// Candidate search filters model
@freezed
sealed class CandidateSearchFilters with _$CandidateSearchFilters {
  const factory CandidateSearchFilters({
    String? searchQuery,
    double? minGpa,
    double? maxGpa,
    List<String>? schools,
    List<String>? targetRoles,
    int? minGraduationYear,
    int? maxGraduationYear,
    List<String>? preferredLocations,
    @Default(false) bool hasResume,
    @Default(false) bool hasTranscript,
    @Default(false) bool hasCalendar,
    @Default(false) bool hasBio,
  }) = _CandidateSearchFilters;

  factory CandidateSearchFilters.fromJson(Map<String, dynamic> json) =>
      _$CandidateSearchFiltersFromJson(json);
}

/// Analytics/profile view event
@freezed
sealed class ProfileViewEvent with _$ProfileViewEvent {
  const factory ProfileViewEvent({
    required String id,
    @JsonKey(name: 'user_id') String? userId,
    @JsonKey(name: 'target_id') String? targetId,
    @JsonKey(name: 'event_type') required String eventType,
    Map<String, dynamic>? metadata,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    // Joined recruiter profile for display (exclude from toJson)
    @JsonKey(includeToJson: false) RecruiterProfile? recruiterProfile,
  }) = _ProfileViewEvent;

  factory ProfileViewEvent.fromJson(Map<String, dynamic> json) =>
      _$ProfileViewEventFromJson(json);
}
