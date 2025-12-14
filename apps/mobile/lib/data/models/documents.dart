import 'package:freezed_annotation/freezed_annotation.dart';
import 'enums.dart';
import 'profile.dart' show EducationLevelConverter;

part 'documents.freezed.dart';
part 'documents.g.dart';

/// Suggested resume labels for classification
const List<String> suggestedResumeLabels = [
  'General',
  'Investment Banking',
  'Private Equity',
  'Venture Capital',
  'Consulting',
  'Asset Management',
  'Hedge Fund',
  'Corporate Finance',
];

/// Education level labels for display
const Map<EducationLevel, String> educationLevelLabels = {
  EducationLevel.bachelors: 'Undergraduate',
  EducationLevel.masters: "Master's",
  EducationLevel.mba: 'MBA',
  EducationLevel.phd: 'PhD',
  EducationLevel.professional: 'Professional (JD, MD)',
};

/// Candidate resume model matching the candidate_resumes table
@freezed
sealed class CandidateResume with _$CandidateResume {
  const CandidateResume._();

  const factory CandidateResume({
    required String id,
    @JsonKey(name: 'candidate_profile_id') required String candidateProfileId,
    @JsonKey(name: 'user_id') required String userId,
    @JsonKey(name: 'resume_url') required String resumeUrl,
    required String label,
    String? description,
    @JsonKey(name: 'is_default') @Default(false) bool isDefault,
    @JsonKey(name: 'is_verified') bool? isVerified,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
  }) = _CandidateResume;

  factory CandidateResume.fromJson(Map<String, dynamic> json) =>
      _$CandidateResumeFromJson(json);

  /// Whether this resume is pending verification
  bool get isPendingVerification => isVerified == null || isVerified == false;

  /// Get file name from URL
  String get fileName {
    try {
      final uri = Uri.parse(resumeUrl);
      final segments = uri.pathSegments;
      if (segments.isNotEmpty) {
        // Remove timestamp prefix if present (format: 1234567890_filename.pdf)
        final lastSegment = segments.last;
        final underscoreIndex = lastSegment.indexOf('_');
        if (underscoreIndex > 0 && underscoreIndex < 15) {
          return lastSegment.substring(underscoreIndex + 1);
        }
        return lastSegment;
      }
    } catch (_) {}
    return 'Resume.pdf';
  }
}

/// Candidate transcript model matching the candidate_transcripts table
@freezed
sealed class CandidateTranscript with _$CandidateTranscript {
  const CandidateTranscript._();

  const factory CandidateTranscript({
    required String id,
    @JsonKey(name: 'candidate_profile_id') required String candidateProfileId,
    @JsonKey(name: 'user_id') required String userId,
    @JsonKey(name: 'transcript_url') required String transcriptUrl,
    @JsonKey(name: 'education_level') @EducationLevelConverter() required EducationLevel educationLevel,
    @JsonKey(name: 'school_name') String? schoolName,
    @JsonKey(name: 'degree_type') String? degreeType,
    double? gpa,
    @JsonKey(name: 'is_verified') bool? isVerified,
    @JsonKey(name: 'gpa_verified') bool? gpaVerified,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
  }) = _CandidateTranscript;

  factory CandidateTranscript.fromJson(Map<String, dynamic> json) =>
      _$CandidateTranscriptFromJson(json);

  /// Whether this transcript is pending verification
  bool get isPendingVerification => isVerified == null || isVerified == false;

  /// Get display name for education level
  String get educationLevelDisplay =>
      educationLevelLabels[educationLevel] ?? educationLevel.displayName;

  /// Get file name from URL
  String get fileName {
    try {
      final uri = Uri.parse(transcriptUrl);
      final segments = uri.pathSegments;
      if (segments.isNotEmpty) {
        // Remove timestamp prefix if present
        final lastSegment = segments.last;
        final underscoreIndex = lastSegment.indexOf('_');
        if (underscoreIndex > 0 && underscoreIndex < 15) {
          return lastSegment.substring(underscoreIndex + 1);
        }
        return lastSegment;
      }
    } catch (_) {}
    return 'Transcript.pdf';
  }
}

/// Input model for creating/updating a resume
class ResumeInput {
  final String label;
  final String? description;
  final bool isDefault;

  const ResumeInput({
    required this.label,
    this.description,
    this.isDefault = false,
  });
}

/// Input model for creating/updating a transcript
class TranscriptInput {
  final EducationLevel educationLevel;
  final String? schoolName;
  final String? degreeType;
  final double? gpa;

  const TranscriptInput({
    required this.educationLevel,
    this.schoolName,
    this.degreeType,
    this.gpa,
  });
}
