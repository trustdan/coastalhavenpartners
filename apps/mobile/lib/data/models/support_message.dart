import 'package:freezed_annotation/freezed_annotation.dart';
import 'enums.dart';

part 'support_message.freezed.dart';
part 'support_message.g.dart';

/// Custom converter for SupportMessageType enum
class SupportMessageTypeConverter
    implements JsonConverter<SupportMessageType, String> {
  const SupportMessageTypeConverter();

  @override
  SupportMessageType fromJson(String json) =>
      SupportMessageType.fromString(json);

  @override
  String toJson(SupportMessageType object) => object.value;
}

/// Custom converter for SupportMessageStatus enum
class SupportMessageStatusConverter
    implements JsonConverter<SupportMessageStatus, String> {
  const SupportMessageStatusConverter();

  @override
  SupportMessageStatus fromJson(String json) =>
      SupportMessageStatus.fromString(json);

  @override
  String toJson(SupportMessageStatus object) => object.value;
}

/// Custom converter for SupportMessageSource enum
class SupportMessageSourceConverter
    implements JsonConverter<SupportMessageSource?, String?> {
  const SupportMessageSourceConverter();

  @override
  SupportMessageSource? fromJson(String? json) {
    if (json == null) return null;
    return SupportMessageSource.fromString(json);
  }

  @override
  String? toJson(SupportMessageSource? object) => object?.value;
}

/// Support message model for admin support inbox
@freezed
sealed class SupportMessage with _$SupportMessage {
  const SupportMessage._();

  const factory SupportMessage({
    required String id,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'message_type')
    @SupportMessageTypeConverter()
    required SupportMessageType messageType,
    @JsonKey(name: 'user_id') String? userId,
    @JsonKey(name: 'sender_name') String? senderName,
    @JsonKey(name: 'sender_email') String? senderEmail,
    required String subject,
    required String message,
    @SupportMessageStatusConverter()
    @Default(SupportMessageStatus.newMessage)
    SupportMessageStatus status,
    @JsonKey(name: 'handled_by') String? handledBy,
    @JsonKey(name: 'handled_at') DateTime? handledAt,
    @JsonKey(name: 'admin_notes') String? adminNotes,
    @JsonKey(name: 'user_role') String? userRole,
    @JsonKey(name: 'appeal_type') String? appealType,
    @JsonKey(name: 'additional_info') String? additionalInfo,
    @JsonKey(name: 'has_attachments') @Default(false) bool hasAttachments,
    @JsonKey(name: 'attachment_urls') List<String>? attachmentUrls,
    @JsonKey(name: 'source')
    @SupportMessageSourceConverter()
    SupportMessageSource? source,
  }) = _SupportMessage;

  factory SupportMessage.fromJson(Map<String, dynamic> json) =>
      _$SupportMessageFromJson(json);

  /// Get display name - prefer sender name, fallback to email
  String get displayName => senderName ?? senderEmail ?? 'Anonymous';

  /// Get preview text (first 100 characters of message)
  String get preview {
    if (message.length <= 100) return message;
    return '${message.substring(0, 100)}...';
  }

  /// Check if this is an appeal
  bool get isAppeal =>
      messageType == SupportMessageType.verificationAppeal ||
      appealType != null;
}

/// Admin dashboard stats model
@freezed
sealed class AdminDashboardStats with _$AdminDashboardStats {
  const factory AdminDashboardStats({
    @Default(0) int pendingVerifications,
    @Default(0) int verifiedToday,
    @Default(0) int openTickets,
    @Default(0) int totalUsers,
    @Default(0) int pendingRecruiters,
    @Default(0) int pendingSchools,
    DateTime? lastUpdated,
  }) = _AdminDashboardStats;

  factory AdminDashboardStats.fromJson(Map<String, dynamic> json) =>
      _$AdminDashboardStatsFromJson(json);
}
