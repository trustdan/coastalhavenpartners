import 'package:freezed_annotation/freezed_annotation.dart';
import 'enums.dart';

part 'profile.freezed.dart';
part 'profile.g.dart';

/// Helper to read nested profile data from either 'profiles' or 'profile' key
Object? _readProfile(Map<dynamic, dynamic> json, String key) =>
    json['profiles'] ?? json['profile'];

/// Custom converter for CandidateStatus enum to handle snake_case from DB
class CandidateStatusConverter implements JsonConverter<CandidateStatus?, String?> {
  const CandidateStatusConverter();

  @override
  CandidateStatus? fromJson(String? json) {
    if (json == null) return null;
    return CandidateStatus.fromString(json);
  }

  @override
  String? toJson(CandidateStatus? object) => object?.value;
}

/// Custom converter for EducationLevel enum
class EducationLevelConverter implements JsonConverter<EducationLevel?, String?> {
  const EducationLevelConverter();

  @override
  EducationLevel? fromJson(String? json) {
    if (json == null) return null;
    return EducationLevel.fromString(json);
  }

  @override
  String? toJson(EducationLevel? object) => object?.value;
}

/// Base user profile model
@freezed
sealed class Profile with _$Profile {
  const factory Profile({
    required String id,
    required String email,
    @JsonKey(name: 'full_name') required String fullName,
    required UserRole role,
    @JsonKey(name: 'linkedin_url') String? linkedinUrl,
    String? phone,
    @JsonKey(name: 'discord_id') String? discordId,
    @JsonKey(name: 'discord_username') String? discordUsername,
    @JsonKey(name: 'referral_code') String? referralCode,
    @JsonKey(name: 'is_banned') @Default(false) bool isBanned,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
  }) = _Profile;

  factory Profile.fromJson(Map<String, dynamic> json) =>
      _$ProfileFromJson(json);
}

/// Candidate profile model
@freezed
sealed class CandidateProfile with _$CandidateProfile {
  const CandidateProfile._();

  const factory CandidateProfile({
    required String id,
    @JsonKey(name: 'user_id') String? userId,
    @JsonKey(name: 'school_name') required String schoolName,
    required String major,
    required double gpa,
    @JsonKey(name: 'graduation_year') required int graduationYear,
    @JsonKey(name: 'undergrad_degree_type') String? undergradDegreeType,
    @JsonKey(name: 'undergrad_specialty') String? undergradSpecialty,
    @JsonKey(name: 'education_level') @EducationLevelConverter() EducationLevel? educationLevel,
    // Graduate education
    @JsonKey(name: 'grad_school') String? gradSchool,
    @JsonKey(name: 'grad_major') String? gradMajor,
    @JsonKey(name: 'grad_gpa') double? gradGpa,
    @JsonKey(name: 'grad_graduation_year') int? gradGraduationYear,
    @JsonKey(name: 'grad_degree_type') String? gradDegreeType,
    @JsonKey(name: 'grad_specialty') String? gradSpecialty,
    // Profile details
    String? bio,
    @JsonKey(name: 'resume_url') String? resumeUrl,
    @JsonKey(name: 'transcript_url') String? transcriptUrl,
    @JsonKey(name: 'scheduling_url') String? schedulingUrl,
    @JsonKey(name: 'target_roles') List<String>? targetRoles,
    @JsonKey(name: 'preferred_locations') List<String>? preferredLocations,
    List<String>? tags,
    // Verification status
    @CandidateStatusConverter() CandidateStatus? status,
    @JsonKey(name: 'email_verified') @Default(false) bool emailVerified,
    @JsonKey(name: 'school_verified') @Default(false) bool schoolVerified,
    @JsonKey(name: 'gpa_verified') @Default(false) bool gpaVerified,
    @JsonKey(name: 'resume_verified') @Default(false) bool resumeVerified,
    @JsonKey(name: 'transcript_verified') @Default(false) bool transcriptVerified,
    @JsonKey(name: 'is_rejected') @Default(false) bool isRejected,
    // Visibility settings
    @JsonKey(name: 'visible_fields_to_recruiters') Map<String, dynamic>? visibleFieldsToRecruiters,
    @JsonKey(name: 'visible_fields_to_schools') Map<String, dynamic>? visibleFieldsToSchools,
    // Timestamps
    @JsonKey(name: 'last_activity_at') DateTime? lastActivityAt,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
    // Joined profile data (for display - exclude from toJson)
    @JsonKey(readValue: _readProfile, includeToJson: false) Profile? profile,
  }) = _CandidateProfile;

  factory CandidateProfile.fromJson(Map<String, dynamic> json) =>
      _$CandidateProfileFromJson(json);

  /// Calculate profile completion percentage
  int get completionPercentage {
    int completed = 0;
    int total = 10;

    if (schoolName.isNotEmpty) completed++;
    if (major.isNotEmpty) completed++;
    if (gpa > 0) completed++;
    if (graduationYear > 0) completed++;
    if (bio != null && bio!.isNotEmpty) completed++;
    if (resumeUrl != null) completed++;
    if (targetRoles != null && targetRoles!.isNotEmpty) completed++;
    if (preferredLocations != null && preferredLocations!.isNotEmpty) completed++;
    if (schedulingUrl != null) completed++;
    if (transcriptUrl != null) completed++;

    return ((completed / total) * 100).round();
  }

  /// Get display name from profile
  String get displayName => profile?.fullName ?? 'Unknown';

  /// Get email from profile
  String? get email => profile?.email;

  /// Get linkedin from profile
  String? get linkedinUrl => profile?.linkedinUrl;
}

/// Recruiter profile model
@freezed
sealed class RecruiterProfile with _$RecruiterProfile {
  const RecruiterProfile._();

  const factory RecruiterProfile({
    required String id,
    @JsonKey(name: 'user_id') String? userId,
    @JsonKey(name: 'firm_name') required String firmName,
    @JsonKey(name: 'job_title') required String jobTitle,
    @JsonKey(name: 'firm_type') String? firmType,
    @JsonKey(name: 'firm_id') String? firmId,
    String? bio,
    @JsonKey(name: 'linkedin_url') String? linkedinUrl,
    @JsonKey(name: 'profile_photo_url') String? profilePhotoUrl,
    @JsonKey(name: 'company_website') String? companyWebsite,
    @JsonKey(name: 'years_experience') int? yearsExperience,
    List<String>? specialties,
    List<String>? locations,
    // Verification
    @JsonKey(name: 'is_approved') @Default(false) bool isApproved,
    @JsonKey(name: 'is_rejected') @Default(false) bool isRejected,
    @JsonKey(name: 'email_domain') String? emailDomain,
    @JsonKey(name: 'email_domain_matches_company') @Default(false) bool emailDomainMatchesCompany,
    @JsonKey(name: 'verification_notes') String? verificationNotes,
    // Visibility settings
    @JsonKey(name: 'is_visible_to_candidates') @Default(true) bool isVisibleToCandidates,
    @JsonKey(name: 'is_visible_to_recruiters') @Default(true) bool isVisibleToRecruiters,
    @JsonKey(name: 'is_visible_to_schools') @Default(true) bool isVisibleToSchools,
    // Timestamps
    @JsonKey(name: 'approved_at') DateTime? approvedAt,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
    // Joined profile data (exclude from toJson)
    @JsonKey(readValue: _readProfile, includeToJson: false) Profile? profile,
  }) = _RecruiterProfile;

  factory RecruiterProfile.fromJson(Map<String, dynamic> json) =>
      _$RecruiterProfileFromJson(json);

  String get displayName => profile?.fullName ?? firmName;
  String? get email => profile?.email;
}

/// School admin profile model
@freezed
sealed class SchoolProfile with _$SchoolProfile {
  const SchoolProfile._();

  const factory SchoolProfile({
    required String id,
    @JsonKey(name: 'user_id') String? userId,
    @JsonKey(name: 'school_name') required String schoolName,
    @JsonKey(name: 'department_name') String? departmentName,
    @JsonKey(name: 'contact_email') String? contactEmail,
    @JsonKey(name: 'contact_phone') String? contactPhone,
    String? website,
    @JsonKey(name: 'school_domain') String? schoolDomain,
    // Verification
    @JsonKey(name: 'is_approved') @Default(false) bool isApproved,
    @JsonKey(name: 'is_rejected') @Default(false) bool isRejected,
    @JsonKey(name: 'verification_status') String? verificationStatus,
    @JsonKey(name: 'verification_document_url') String? verificationDocumentUrl,
    @JsonKey(name: 'verification_document_type') String? verificationDocumentType,
    @JsonKey(name: 'verification_notes') String? verificationNotes,
    // Timestamps
    @JsonKey(name: 'approved_at') DateTime? approvedAt,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
    // Joined profile data (exclude from toJson)
    @JsonKey(readValue: _readProfile, includeToJson: false) Profile? profile,
  }) = _SchoolProfile;

  factory SchoolProfile.fromJson(Map<String, dynamic> json) =>
      _$SchoolProfileFromJson(json);

  String get displayName => profile?.fullName ?? schoolName;
  String? get email => profile?.email;
}
