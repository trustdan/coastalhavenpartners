import 'package:freezed_annotation/freezed_annotation.dart';
import 'enums.dart';

part 'job.freezed.dart';
part 'job.g.dart';

/// Helper to read nested firm data from either 'firms' or 'firm' key
Object? _readFirm(Map<dynamic, dynamic> json, String key) =>
    json['firms'] ?? json['firm'];

/// Helper to read nested job listing data
Object? _readJobListing(Map<dynamic, dynamic> json, String key) =>
    json['job_listings'] ?? json['job_listing'];

/// Firm model
@freezed
sealed class Firm with _$Firm {
  const factory Firm({
    required String id,
    required String name,
    required String slug,
    String? description,
    @JsonKey(name: 'logo_url') String? logoUrl,
    @JsonKey(name: 'firm_type') String? firmType,
    String? website,
    List<String>? locations,
    @JsonKey(name: 'employee_count') String? employeeCount,
    @JsonKey(name: 'founded_year') int? foundedYear,
    String? culture,
    @JsonKey(name: 'hiring_roles') List<String>? hiringRoles,
    @JsonKey(name: 'is_visible') @Default(true) bool isVisible,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
  }) = _Firm;

  factory Firm.fromJson(Map<String, dynamic> json) => _$FirmFromJson(json);
}

/// Job listing model
@freezed
sealed class JobListing with _$JobListing {
  const JobListing._();

  const factory JobListing({
    required String id,
    required String title,
    required String slug,
    required String description,
    @JsonKey(name: 'firm_id') required String firmId,
    @JsonKey(name: 'posted_by') required String postedBy,
    @JsonKey(name: 'job_type') required JobType jobType,
    required JobListingStatus status,
    // Details
    List<String>? locations,
    @JsonKey(name: 'compensation_range') String? compensationRange,
    String? requirements,
    String? responsibilities,
    @JsonKey(name: 'application_instructions') String? applicationInstructions,
    @JsonKey(name: 'external_url') String? externalUrl,
    // Targeting
    @JsonKey(name: 'min_gpa') double? minGpa,
    @JsonKey(name: 'target_grad_years') List<int>? targetGradYears,
    @JsonKey(name: 'target_roles') List<String>? targetRoles,
    @JsonKey(name: 'target_schools') List<String>? targetSchools,
    // Stats
    @JsonKey(name: 'view_count') @Default(0) int viewCount,
    @JsonKey(name: 'application_count') @Default(0) int applicationCount,
    @JsonKey(name: 'is_featured') @Default(false) bool isFeatured,
    // Dates
    @JsonKey(name: 'application_deadline') DateTime? applicationDeadline,
    @JsonKey(name: 'start_date') DateTime? startDate,
    @JsonKey(name: 'published_at') DateTime? publishedAt,
    @JsonKey(name: 'closed_at') DateTime? closedAt,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
    // Joined firm data (exclude from toJson)
    @JsonKey(readValue: _readFirm, includeToJson: false) Firm? firm,
  }) = _JobListing;

  factory JobListing.fromJson(Map<String, dynamic> json) =>
      _$JobListingFromJson(json);

  /// Check if deadline has passed
  bool get isDeadlinePassed {
    if (applicationDeadline == null) return false;
    return DateTime.now().isAfter(applicationDeadline!);
  }

  /// Days until deadline
  int? get daysUntilDeadline {
    if (applicationDeadline == null) return null;
    final now = DateTime.now();
    if (now.isAfter(applicationDeadline!)) return 0;
    return applicationDeadline!.difference(now).inDays;
  }

  /// Get firm name
  String get firmName => firm?.name ?? 'Unknown Firm';

  /// Get firm logo
  String? get firmLogo => firm?.logoUrl;
}

/// Application model
@freezed
sealed class Application with _$Application {
  const Application._();

  const factory Application({
    required String id,
    @JsonKey(name: 'candidate_profile_id') required String candidateProfileId,
    @JsonKey(name: 'job_listing_id') String? jobListingId,
    @JsonKey(name: 'firm_id') String? firmId,
    required ApplicationStatus status,
    @JsonKey(name: 'cover_letter') required String coverLetter,
    @JsonKey(name: 'outreach_approach') required String outreachApproach,
    required Map<String, dynamic> snapshot,
    @JsonKey(name: 'internal_notes') String? internalNotes,
    @JsonKey(name: 'reviewed_by') String? reviewedBy,
    @JsonKey(name: 'reviewed_at') DateTime? reviewedAt,
    @JsonKey(name: 'applied_at') DateTime? appliedAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
    // Joined data (exclude from toJson)
    @JsonKey(readValue: _readJobListing, includeToJson: false) JobListing? jobListing,
  }) = _Application;

  factory Application.fromJson(Map<String, dynamic> json) =>
      _$ApplicationFromJson(json);

  /// Get job title from listing or snapshot
  String get jobTitle => jobListing?.title ?? (snapshot['job_title'] as String?) ?? 'Unknown Position';

  /// Get firm name from listing or snapshot
  String get firmName => jobListing?.firmName ?? (snapshot['firm_name'] as String?) ?? 'Unknown Firm';
}
