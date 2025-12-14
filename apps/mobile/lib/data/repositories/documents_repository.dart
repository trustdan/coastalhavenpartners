import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'base_repository.dart';
import '../models/models.dart';
import '../../services/connectivity_service.dart';

/// Repository for managing candidate resumes and transcripts
class DocumentsRepository extends BaseRepository {
  DocumentsRepository._();
  static DocumentsRepository? _instance;
  static DocumentsRepository get instance =>
      _instance ??= DocumentsRepository._();

  final ConnectivityService _connectivity = ConnectivityService.instance;

  /// Base URL for the web API (for verification endpoints)
  static const String _apiBaseUrl = 'https://coastalhavenpartners.com';

  // =====================
  // Resumes
  // =====================

  /// Get all resumes for the current user's candidate profile
  Future<List<CandidateResume>> getResumes() async {
    if (!isAvailable || currentUserId == null) return [];

    final result = await safeExecute<List<CandidateResume>>(
      () async {
        // First get the candidate profile ID
        final profileResponse = await table('candidate_profiles')
            .select('id')
            .eq('user_id', currentUserId!)
            .maybeSingle();

        if (profileResponse == null) return [];

        final profileId = profileResponse['id'] as String;

        // Get all resumes for this profile
        final response = await table('candidate_resumes')
            .select()
            .eq('candidate_profile_id', profileId)
            .order('is_default', ascending: false)
            .order('created_at', ascending: false);

        return (response as List)
            .map((json) => CandidateResume.fromJson(json))
            .toList();
      },
      errorMessage: 'Error fetching resumes',
      rethrowError: false,
    );

    return result ?? [];
  }

  /// Get a single resume by ID
  Future<CandidateResume?> getResume(String resumeId) async {
    if (!isAvailable) return null;

    return safeExecute<CandidateResume?>(
      () async {
        final response = await table('candidate_resumes')
            .select()
            .eq('id', resumeId)
            .single();

        return CandidateResume.fromJson(response);
      },
      errorMessage: 'Error fetching resume',
    );
  }

  /// Upload a new resume with label and optional description
  Future<CandidateResume?> uploadResume({
    required Uint8List fileBytes,
    required String fileName,
    required String label,
    String? description,
    bool isDefault = false,
  }) async {
    if (!isAvailable || currentUserId == null) return null;

    return safeExecute<CandidateResume?>(
      () async {
        // Get candidate profile ID
        final profileResponse = await table('candidate_profiles')
            .select('id')
            .eq('user_id', currentUserId!)
            .single();

        final profileId = profileResponse['id'] as String;

        // Upload file to storage
        final timestamp = DateTime.now().millisecondsSinceEpoch;
        final storagePath = '$currentUserId/${timestamp}_$fileName';

        await client!.storage.from('resumes').uploadBinary(
              storagePath,
              fileBytes,
              fileOptions: const FileOptions(
                contentType: 'application/pdf',
                upsert: true,
              ),
            );

        final resumeUrl =
            client!.storage.from('resumes').getPublicUrl(storagePath);

        // If setting as default, unset other defaults first
        final existingResumes = await getResumes();
        final shouldBeDefault = isDefault || existingResumes.isEmpty;

        if (shouldBeDefault && existingResumes.isNotEmpty) {
          await table('candidate_resumes')
              .update({'is_default': false}).eq('candidate_profile_id', profileId);
        }

        // Create resume record
        final response = await table('candidate_resumes')
            .insert({
              'candidate_profile_id': profileId,
              'user_id': currentUserId,
              'resume_url': resumeUrl,
              'label': label,
              'description': description,
              'is_default': shouldBeDefault,
              'is_verified': false,
            })
            .select()
            .single();

        final resume = CandidateResume.fromJson(response);

        // Trigger verification in background
        _triggerResumeVerification(resume.id);

        return resume;
      },
      errorMessage: 'Error uploading resume',
    );
  }

  /// Update an existing resume's metadata (not the file)
  Future<CandidateResume?> updateResume({
    required String resumeId,
    String? label,
    String? description,
    bool? isDefault,
  }) async {
    if (!isAvailable) return null;

    return safeExecute<CandidateResume?>(
      () async {
        // If setting as default, unset other defaults first
        if (isDefault == true) {
          final resume = await getResume(resumeId);
          if (resume != null) {
            await table('candidate_resumes')
                .update({'is_default': false})
                .eq('candidate_profile_id', resume.candidateProfileId);
          }
        }

        final response = await table('candidate_resumes')
            .update({
              if (label != null) 'label': label,
              if (description != null) 'description': description,
              if (isDefault != null) 'is_default': isDefault,
              'updated_at': DateTime.now().toIso8601String(),
            })
            .eq('id', resumeId)
            .select()
            .single();

        return CandidateResume.fromJson(response);
      },
      errorMessage: 'Error updating resume',
    );
  }

  /// Replace a resume file (keeps the same record, new file)
  Future<CandidateResume?> replaceResumeFile({
    required String resumeId,
    required Uint8List fileBytes,
    required String fileName,
  }) async {
    if (!isAvailable || currentUserId == null) return null;

    return safeExecute<CandidateResume?>(
      () async {
        // Upload new file
        final timestamp = DateTime.now().millisecondsSinceEpoch;
        final storagePath = '$currentUserId/${timestamp}_$fileName';

        await client!.storage.from('resumes').uploadBinary(
              storagePath,
              fileBytes,
              fileOptions: const FileOptions(
                contentType: 'application/pdf',
                upsert: true,
              ),
            );

        final resumeUrl =
            client!.storage.from('resumes').getPublicUrl(storagePath);

        // Update record with new URL and reset verification
        final response = await table('candidate_resumes')
            .update({
              'resume_url': resumeUrl,
              'is_verified': false,
              'updated_at': DateTime.now().toIso8601String(),
            })
            .eq('id', resumeId)
            .select()
            .single();

        final resume = CandidateResume.fromJson(response);

        // Trigger re-verification
        _triggerResumeVerification(resume.id);

        return resume;
      },
      errorMessage: 'Error replacing resume file',
    );
  }

  /// Delete a resume
  Future<bool> deleteResume(String resumeId) async {
    if (!isAvailable) return false;

    final result = await safeExecute<bool>(
      () async {
        await table('candidate_resumes').delete().eq('id', resumeId);
        return true;
      },
      errorMessage: 'Error deleting resume',
      rethrowError: false,
    );

    return result ?? false;
  }

  /// Set a resume as the default
  Future<bool> setDefaultResume(String resumeId) async {
    if (!isAvailable) return false;

    final result = await safeExecute<bool>(
      () async {
        final resume = await getResume(resumeId);
        if (resume == null) return false;

        // Unset all other defaults
        await table('candidate_resumes')
            .update({'is_default': false})
            .eq('candidate_profile_id', resume.candidateProfileId);

        // Set this one as default
        await table('candidate_resumes')
            .update({'is_default': true}).eq('id', resumeId);

        return true;
      },
      errorMessage: 'Error setting default resume',
      rethrowError: false,
    );

    return result ?? false;
  }

  // =====================
  // Transcripts
  // =====================

  /// Get all transcripts for the current user's candidate profile
  Future<List<CandidateTranscript>> getTranscripts() async {
    if (!isAvailable || currentUserId == null) return [];

    final result = await safeExecute<List<CandidateTranscript>>(
      () async {
        // First get the candidate profile ID
        final profileResponse = await table('candidate_profiles')
            .select('id')
            .eq('user_id', currentUserId!)
            .maybeSingle();

        if (profileResponse == null) return [];

        final profileId = profileResponse['id'] as String;

        // Get all transcripts for this profile
        final response = await table('candidate_transcripts')
            .select()
            .eq('candidate_profile_id', profileId)
            .order('created_at', ascending: false);

        return (response as List)
            .map((json) => CandidateTranscript.fromJson(json))
            .toList();
      },
      errorMessage: 'Error fetching transcripts',
      rethrowError: false,
    );

    return result ?? [];
  }

  /// Get a single transcript by ID
  Future<CandidateTranscript?> getTranscript(String transcriptId) async {
    if (!isAvailable) return null;

    return safeExecute<CandidateTranscript?>(
      () async {
        final response = await table('candidate_transcripts')
            .select()
            .eq('id', transcriptId)
            .single();

        return CandidateTranscript.fromJson(response);
      },
      errorMessage: 'Error fetching transcript',
    );
  }

  /// Upload a new transcript
  Future<CandidateTranscript?> uploadTranscript({
    required Uint8List fileBytes,
    required String fileName,
    required EducationLevel educationLevel,
    String? schoolName,
    String? degreeType,
    double? gpa,
  }) async {
    if (!isAvailable || currentUserId == null) return null;

    return safeExecute<CandidateTranscript?>(
      () async {
        // Get candidate profile
        final profileResponse = await table('candidate_profiles')
            .select('id, school_name, gpa')
            .eq('user_id', currentUserId!)
            .single();

        final profileId = profileResponse['id'] as String;

        // Upload file to storage
        final timestamp = DateTime.now().millisecondsSinceEpoch;
        final storagePath = '$currentUserId/${timestamp}_$fileName';

        await client!.storage.from('transcripts').uploadBinary(
              storagePath,
              fileBytes,
              fileOptions: const FileOptions(
                contentType: 'application/pdf',
                upsert: true,
              ),
            );

        final transcriptUrl =
            client!.storage.from('transcripts').getPublicUrl(storagePath);

        // Use profile values as defaults if not provided
        final effectiveSchoolName =
            schoolName ?? profileResponse['school_name'] as String?;
        final effectiveGpa = gpa ?? profileResponse['gpa'] as double?;

        // Create transcript record
        final response = await table('candidate_transcripts')
            .insert({
              'candidate_profile_id': profileId,
              'user_id': currentUserId,
              'transcript_url': transcriptUrl,
              'education_level': educationLevel.value,
              'school_name': effectiveSchoolName,
              'degree_type': degreeType,
              'gpa': effectiveGpa,
              'is_verified': false,
              'gpa_verified': false,
            })
            .select()
            .single();

        final transcript = CandidateTranscript.fromJson(response);

        // Trigger verification if GPA is provided
        if (effectiveGpa != null) {
          _triggerTranscriptVerification(transcript.id);
        }

        return transcript;
      },
      errorMessage: 'Error uploading transcript',
    );
  }

  /// Update a transcript's metadata
  Future<CandidateTranscript?> updateTranscript({
    required String transcriptId,
    EducationLevel? educationLevel,
    String? schoolName,
    String? degreeType,
    double? gpa,
  }) async {
    if (!isAvailable) return null;

    return safeExecute<CandidateTranscript?>(
      () async {
        final oldTranscript = await getTranscript(transcriptId);
        final gpaChanged = gpa != null && gpa != oldTranscript?.gpa;

        final response = await table('candidate_transcripts')
            .update({
              if (educationLevel != null)
                'education_level': educationLevel.value,
              if (schoolName != null) 'school_name': schoolName,
              if (degreeType != null) 'degree_type': degreeType,
              if (gpa != null) 'gpa': gpa,
              // Reset verification if GPA changed
              if (gpaChanged) 'is_verified': false,
              if (gpaChanged) 'gpa_verified': false,
              'updated_at': DateTime.now().toIso8601String(),
            })
            .eq('id', transcriptId)
            .select()
            .single();

        final transcript = CandidateTranscript.fromJson(response);

        // Re-trigger verification if GPA changed
        if (gpaChanged) {
          _triggerTranscriptVerification(transcript.id);
        }

        return transcript;
      },
      errorMessage: 'Error updating transcript',
    );
  }

  /// Replace a transcript file
  Future<CandidateTranscript?> replaceTranscriptFile({
    required String transcriptId,
    required Uint8List fileBytes,
    required String fileName,
  }) async {
    if (!isAvailable || currentUserId == null) return null;

    return safeExecute<CandidateTranscript?>(
      () async {
        // Upload new file
        final timestamp = DateTime.now().millisecondsSinceEpoch;
        final storagePath = '$currentUserId/${timestamp}_$fileName';

        await client!.storage.from('transcripts').uploadBinary(
              storagePath,
              fileBytes,
              fileOptions: const FileOptions(
                contentType: 'application/pdf',
                upsert: true,
              ),
            );

        final transcriptUrl =
            client!.storage.from('transcripts').getPublicUrl(storagePath);

        // Update record with new URL and reset verification
        final response = await table('candidate_transcripts')
            .update({
              'transcript_url': transcriptUrl,
              'is_verified': false,
              'gpa_verified': false,
              'updated_at': DateTime.now().toIso8601String(),
            })
            .eq('id', transcriptId)
            .select()
            .single();

        final transcript = CandidateTranscript.fromJson(response);

        // Re-trigger verification if transcript has GPA
        if (transcript.gpa != null) {
          _triggerTranscriptVerification(transcript.id);
        }

        return transcript;
      },
      errorMessage: 'Error replacing transcript file',
    );
  }

  /// Delete a transcript
  Future<bool> deleteTranscript(String transcriptId) async {
    if (!isAvailable) return false;

    final result = await safeExecute<bool>(
      () async {
        await table('candidate_transcripts').delete().eq('id', transcriptId);
        return true;
      },
      errorMessage: 'Error deleting transcript',
      rethrowError: false,
    );

    return result ?? false;
  }

  // =====================
  // Verification
  // =====================

  /// Trigger resume verification via API
  Future<void> _triggerResumeVerification(String resumeId) async {
    if (!_connectivity.isOnline) return;

    try {
      final token = client?.auth.currentSession?.accessToken;
      if (token == null) {
        debugPrint('[Documents] No auth token for verification');
        return;
      }

      final response = await http.post(
        Uri.parse('$_apiBaseUrl/api/verify/resume'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({'resumeId': resumeId}),
      );

      if (response.statusCode == 200) {
        debugPrint('[Documents] Resume verification triggered for $resumeId');
      } else {
        debugPrint(
            '[Documents] Resume verification failed: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('[Documents] Error triggering resume verification: $e');
    }
  }

  /// Trigger transcript verification via API
  Future<void> _triggerTranscriptVerification(String transcriptId) async {
    if (!_connectivity.isOnline) return;

    try {
      final token = client?.auth.currentSession?.accessToken;
      if (token == null) {
        debugPrint('[Documents] No auth token for verification');
        return;
      }

      final response = await http.post(
        Uri.parse('$_apiBaseUrl/api/verify/transcript'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({'transcriptId': transcriptId}),
      );

      if (response.statusCode == 200) {
        debugPrint(
            '[Documents] Transcript verification triggered for $transcriptId');
      } else {
        debugPrint(
            '[Documents] Transcript verification failed: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('[Documents] Error triggering transcript verification: $e');
    }
  }

  /// Manually trigger verification for a resume
  Future<bool> verifyResume(String resumeId) async {
    try {
      await _triggerResumeVerification(resumeId);
      return true;
    } catch (e) {
      return false;
    }
  }

  /// Manually trigger verification for a transcript
  Future<bool> verifyTranscript(String transcriptId) async {
    try {
      await _triggerTranscriptVerification(transcriptId);
      return true;
    } catch (e) {
      return false;
    }
  }
}
