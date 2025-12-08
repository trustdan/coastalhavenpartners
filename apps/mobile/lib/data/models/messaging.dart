import 'package:freezed_annotation/freezed_annotation.dart';
import 'profile.dart';

part 'messaging.freezed.dart';
part 'messaging.g.dart';

/// Conversation model
@freezed
sealed class Conversation with _$Conversation {
  const Conversation._();

  const factory Conversation({
    required String id,
    @JsonKey(name: 'candidate_id') String? candidateId,
    @JsonKey(name: 'recruiter_id') String? recruiterId,
    @JsonKey(name: 'last_message_at') DateTime? lastMessageAt,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    // Joined data (exclude from toJson - only used in fromJson)
    @JsonKey(name: 'candidate_profiles', includeToJson: false) CandidateProfile? candidateProfile,
    @JsonKey(name: 'recruiter_profiles', includeToJson: false) RecruiterProfile? recruiterProfile,
    // Computed fields (set after fetch)
    Message? lastMessage,
    @Default(0) int unreadCount,
  }) = _Conversation;

  factory Conversation.fromJson(Map<String, dynamic> json) =>
      _$ConversationFromJson(json);

  /// Get the other party's name based on current user role
  String getOtherPartyName(String currentUserId) {
    if (candidateProfile?.userId == currentUserId) {
      return recruiterProfile?.displayName ?? 'Unknown';
    }
    return candidateProfile?.displayName ?? 'Unknown';
  }

  /// Get the other party's firm/school name
  String? getOtherPartyOrganization(String currentUserId) {
    if (candidateProfile?.userId == currentUserId) {
      return recruiterProfile?.firmName;
    }
    return candidateProfile?.schoolName;
  }
}

/// Message model
@freezed
sealed class Message with _$Message {
  const Message._();

  const factory Message({
    required String id,
    @JsonKey(name: 'conversation_id') required String conversationId,
    @JsonKey(name: 'sender_id') required String senderId,
    required String content,
    @JsonKey(name: 'read_at') DateTime? readAt,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    // Local state
    @Default(false) bool isPending,
    @Default(false) bool isFailed,
  }) = _Message;

  factory Message.fromJson(Map<String, dynamic> json) => _$MessageFromJson(json);

  /// Check if message is read
  bool get isRead => readAt != null;

  /// Check if message is from current user
  bool isFromMe(String currentUserId) => senderId == currentUserId;
}

/// Conversation participant model
@freezed
sealed class ConversationParticipant with _$ConversationParticipant {
  const factory ConversationParticipant({
    required String id,
    @JsonKey(name: 'conversation_id') required String conversationId,
    @JsonKey(name: 'user_id') required String userId,
    @JsonKey(name: 'profile_id') required String profileId,
    @JsonKey(name: 'participant_type') required String participantType,
    @JsonKey(name: 'joined_at') DateTime? joinedAt,
  }) = _ConversationParticipant;

  factory ConversationParticipant.fromJson(Map<String, dynamic> json) =>
      _$ConversationParticipantFromJson(json);
}

/// Messaging preferences model
@freezed
sealed class MessagingPreferences with _$MessagingPreferences {
  const factory MessagingPreferences({
    required String id,
    @JsonKey(name: 'user_id') required String userId,
    @JsonKey(name: 'allow_messages_from_candidates') @Default(true) bool allowMessagesFromCandidates,
    @JsonKey(name: 'allow_messages_from_recruiters') @Default(true) bool allowMessagesFromRecruiters,
    @JsonKey(name: 'allow_messages_from_schools') @Default(true) bool allowMessagesFromSchools,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
  }) = _MessagingPreferences;

  factory MessagingPreferences.fromJson(Map<String, dynamic> json) =>
      _$MessagingPreferencesFromJson(json);
}
