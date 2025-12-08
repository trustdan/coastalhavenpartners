import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'base_repository.dart';
import '../models/models.dart';

/// Repository for profile-related operations
class ProfileRepository extends BaseRepository {
  ProfileRepository._();
  static ProfileRepository? _instance;
  static ProfileRepository get instance => _instance ??= ProfileRepository._();

  // =====================
  // Base Profile
  // =====================

  /// Get current user's base profile
  Future<Profile?> getCurrentProfile() async {
    if (!isAvailable || currentUserId == null) return null;

    return safeExecute<Profile?>(() async {
      final response = await table('profiles')
          .select()
          .eq('id', currentUserId!)
          .single();
      return Profile.fromJson(response);
    }, errorMessage: 'Error fetching current profile');
  }

  /// Get profile by user ID
  Future<Profile?> getProfile(String userId) async {
    if (!isAvailable) return null;

    return safeExecute<Profile?>(() async {
      final response = await table('profiles')
          .select()
          .eq('id', userId)
          .maybeSingle();
      if (response == null) return null;
      return Profile.fromJson(response);
    }, errorMessage: 'Error fetching profile');
  }

  /// Update base profile
  Future<void> updateProfile({
    required String userId,
    String? fullName,
    String? linkedinUrl,
    String? phone,
    UserRole? role,
  }) async {
    if (!isAvailable) return;

    await safeExecute<void>(() async {
      await table('profiles').update({
        if (fullName != null) 'full_name': fullName,
        if (linkedinUrl != null) 'linkedin_url': linkedinUrl,
        if (phone != null) 'phone': phone,
        if (role != null) 'role': role.name,
        'updated_at': DateTime.now().toIso8601String(),
      }).eq('id', userId);
    }, errorMessage: 'Error updating profile');
  }

  // =====================
  // Candidate Profile
  // =====================

  /// Get candidate profile for current user
  Future<CandidateProfile?> getCurrentCandidateProfile() async {
    if (!isAvailable || currentUserId == null) return null;

    return safeExecute<CandidateProfile?>(() async {
      final response = await table('candidate_profiles')
          .select('*, profiles!candidate_profiles_user_id_fkey(*)')
          .eq('user_id', currentUserId!)
          .maybeSingle();
      if (response == null) return null;
      return CandidateProfile.fromJson(response);
    }, errorMessage: 'Error fetching candidate profile');
  }

  /// Get candidate profile by ID
  Future<CandidateProfile?> getCandidateProfile(String profileId) async {
    if (!isAvailable) return null;

    return safeExecute<CandidateProfile?>(() async {
      final response = await table('candidate_profiles')
          .select('*, profiles!candidate_profiles_user_id_fkey(*)')
          .eq('id', profileId)
          .maybeSingle();
      if (response == null) return null;
      return CandidateProfile.fromJson(response);
    }, errorMessage: 'Error fetching candidate profile');
  }

  /// Check if user has candidate profile
  Future<bool> hasCandidateProfile(String userId) async {
    if (!isAvailable) return false;

    final response = await table('candidate_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
    return response != null;
  }

  /// Create candidate profile
  Future<String?> createCandidateProfile({
    required String schoolName,
    required String major,
    required double gpa,
    required int graduationYear,
    EducationLevel? educationLevel,
    String? bio,
    List<String>? targetRoles,
    List<String>? preferredLocations,
  }) async {
    if (!isAvailable || currentUserId == null) return null;

    return safeExecute<String?>(() async {
      // Use RPC function if available, otherwise direct insert
      try {
        final result = await client!.rpc('create_candidate_profile', params: {
          'p_user_id': currentUserId,
          'p_school_name': schoolName,
          'p_major': major,
          'p_gpa': gpa,
          'p_graduation_year': graduationYear,
        });
        final profileId = result as String?;

        // Update additional fields
        if (profileId != null) {
          await updateCandidateProfile(
            profileId: profileId,
            educationLevel: educationLevel,
            bio: bio,
            targetRoles: targetRoles,
            preferredLocations: preferredLocations,
          );
        }
        return profileId;
      } catch (e) {
        // Fallback to direct insert
        debugPrint('RPC failed, using direct insert: $e');
        final response = await table('candidate_profiles').insert({
          'user_id': currentUserId,
          'school_name': schoolName,
          'major': major,
          'gpa': gpa,
          'graduation_year': graduationYear,
          'education_level': educationLevel?.name,
          'bio': bio,
          'target_roles': targetRoles,
          'preferred_locations': preferredLocations,
        }).select('id').single();
        return response['id'] as String;
      }
    }, errorMessage: 'Error creating candidate profile');
  }

  /// Update candidate profile
  Future<void> updateCandidateProfile({
    required String profileId,
    String? schoolName,
    String? major,
    double? gpa,
    int? graduationYear,
    EducationLevel? educationLevel,
    String? bio,
    String? resumeUrl,
    String? transcriptUrl,
    String? schedulingUrl,
    List<String>? targetRoles,
    List<String>? preferredLocations,
    List<String>? tags,
  }) async {
    if (!isAvailable) return;

    await safeExecute<void>(() async {
      await table('candidate_profiles').update({
        if (schoolName != null) 'school_name': schoolName,
        if (major != null) 'major': major,
        if (gpa != null) 'gpa': gpa,
        if (graduationYear != null) 'graduation_year': graduationYear,
        if (educationLevel != null) 'education_level': educationLevel.name,
        if (bio != null) 'bio': bio,
        if (resumeUrl != null) 'resume_url': resumeUrl,
        if (transcriptUrl != null) 'transcript_url': transcriptUrl,
        if (schedulingUrl != null) 'scheduling_url': schedulingUrl,
        if (targetRoles != null) 'target_roles': targetRoles,
        if (preferredLocations != null) 'preferred_locations': preferredLocations,
        if (tags != null) 'tags': tags,
        'updated_at': DateTime.now().toIso8601String(),
      }).eq('id', profileId);
    }, errorMessage: 'Error updating candidate profile');
  }

  // =====================
  // Recruiter Profile
  // =====================

  /// Get recruiter profile for current user
  Future<RecruiterProfile?> getCurrentRecruiterProfile() async {
    if (!isAvailable || currentUserId == null) return null;

    return safeExecute<RecruiterProfile?>(() async {
      final response = await table('recruiter_profiles')
          .select('*, profiles!recruiter_profiles_user_id_fkey(*)')
          .eq('user_id', currentUserId!)
          .maybeSingle();
      if (response == null) return null;
      return RecruiterProfile.fromJson(response);
    }, errorMessage: 'Error fetching recruiter profile');
  }

  /// Get recruiter profile by ID
  Future<RecruiterProfile?> getRecruiterProfile(String profileId) async {
    if (!isAvailable) return null;

    return safeExecute<RecruiterProfile?>(() async {
      final response = await table('recruiter_profiles')
          .select('*, profiles!recruiter_profiles_user_id_fkey(*)')
          .eq('id', profileId)
          .maybeSingle();
      if (response == null) return null;
      return RecruiterProfile.fromJson(response);
    }, errorMessage: 'Error fetching recruiter profile');
  }

  /// Check if user has recruiter profile
  Future<bool> hasRecruiterProfile(String userId) async {
    if (!isAvailable) return false;

    final response = await table('recruiter_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
    return response != null;
  }

  /// Create recruiter profile
  Future<String?> createRecruiterProfile({
    required String firmName,
    required String jobTitle,
    String? firmType,
    String? bio,
    String? linkedinUrl,
    List<String>? specialties,
    List<String>? locations,
  }) async {
    if (!isAvailable || currentUserId == null) return null;

    return safeExecute<String?>(() async {
      final response = await table('recruiter_profiles').insert({
        'user_id': currentUserId,
        'firm_name': firmName,
        'job_title': jobTitle,
        'firm_type': firmType,
        'bio': bio,
        'linkedin_url': linkedinUrl,
        'specialties': specialties,
        'locations': locations,
      }).select('id').single();
      return response['id'] as String;
    }, errorMessage: 'Error creating recruiter profile');
  }

  /// Update recruiter profile
  Future<void> updateRecruiterProfile({
    required String profileId,
    String? firmName,
    String? jobTitle,
    String? firmType,
    String? bio,
    String? linkedinUrl,
    String? profilePhotoUrl,
    String? companyWebsite,
    int? yearsExperience,
    List<String>? specialties,
    List<String>? locations,
  }) async {
    if (!isAvailable) return;

    await safeExecute<void>(() async {
      await table('recruiter_profiles').update({
        if (firmName != null) 'firm_name': firmName,
        if (jobTitle != null) 'job_title': jobTitle,
        if (firmType != null) 'firm_type': firmType,
        if (bio != null) 'bio': bio,
        if (linkedinUrl != null) 'linkedin_url': linkedinUrl,
        if (profilePhotoUrl != null) 'profile_photo_url': profilePhotoUrl,
        if (companyWebsite != null) 'company_website': companyWebsite,
        if (yearsExperience != null) 'years_experience': yearsExperience,
        if (specialties != null) 'specialties': specialties,
        if (locations != null) 'locations': locations,
        'updated_at': DateTime.now().toIso8601String(),
      }).eq('id', profileId);
    }, errorMessage: 'Error updating recruiter profile');
  }

  // =====================
  // School Profile
  // =====================

  /// Get school profile for current user
  Future<SchoolProfile?> getCurrentSchoolProfile() async {
    if (!isAvailable || currentUserId == null) return null;

    return safeExecute<SchoolProfile?>(() async {
      final response = await table('school_profiles')
          .select('*, profiles!school_profiles_user_id_fkey(*)')
          .eq('user_id', currentUserId!)
          .maybeSingle();
      if (response == null) return null;
      return SchoolProfile.fromJson(response);
    }, errorMessage: 'Error fetching school profile');
  }

  /// Check if user has school profile
  Future<bool> hasSchoolProfile(String userId) async {
    if (!isAvailable) return false;

    final response = await table('school_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
    return response != null;
  }

  /// Create school profile
  Future<String?> createSchoolProfile({
    required String schoolName,
    String? departmentName,
    String? contactEmail,
    String? contactPhone,
    String? website,
    String? schoolDomain,
  }) async {
    if (!isAvailable || currentUserId == null) return null;

    return safeExecute<String?>(() async {
      final response = await table('school_profiles').insert({
        'user_id': currentUserId,
        'school_name': schoolName,
        'department_name': departmentName ?? 'Career Services',
        'contact_email': contactEmail,
        'contact_phone': contactPhone,
        'website': website,
        'school_domain': schoolDomain,
      }).select('id').single();
      return response['id'] as String;
    }, errorMessage: 'Error creating school profile');
  }

  /// Update school profile
  Future<void> updateSchoolProfile({
    required String profileId,
    String? schoolName,
    String? departmentName,
    String? contactEmail,
    String? contactPhone,
    String? website,
    String? schoolDomain,
  }) async {
    if (!isAvailable) return;

    await safeExecute<void>(() async {
      await table('school_profiles').update({
        if (schoolName != null) 'school_name': schoolName,
        if (departmentName != null) 'department_name': departmentName,
        if (contactEmail != null) 'contact_email': contactEmail,
        if (contactPhone != null) 'contact_phone': contactPhone,
        if (website != null) 'website': website,
        if (schoolDomain != null) 'school_domain': schoolDomain,
        'updated_at': DateTime.now().toIso8601String(),
      }).eq('id', profileId);
    }, errorMessage: 'Error updating school profile');
  }

  // =====================
  // Document Upload
  // =====================

  /// Upload a document (resume or transcript) to Supabase storage
  /// Returns the public URL of the uploaded file
  Future<String?> uploadDocument(
    Uint8List fileBytes,
    String fileName,
    String documentType, // 'resume' or 'transcript'
  ) async {
    if (!isAvailable || currentUserId == null) return null;

    return safeExecute<String?>(() async {
      // Create a unique file path
      final timestamp = DateTime.now().millisecondsSinceEpoch;
      final extension = fileName.split('.').last;
      final storagePath = '$currentUserId/$documentType/${timestamp}_$fileName';

      // Upload to Supabase storage
      await client!.storage
          .from('documents')
          .uploadBinary(
            storagePath,
            fileBytes,
            fileOptions: FileOptions(
              contentType: 'application/$extension',
              upsert: true,
            ),
          );

      // Get the public URL
      final url = client!.storage.from('documents').getPublicUrl(storagePath);

      // Update the candidate profile with the new document URL
      if (documentType == 'resume') {
        final profile = await getCurrentCandidateProfile();
        if (profile != null) {
          await updateCandidateProfile(
            profileId: profile.id,
            resumeUrl: url,
          );
        }
      } else if (documentType == 'transcript') {
        final profile = await getCurrentCandidateProfile();
        if (profile != null) {
          await updateCandidateProfile(
            profileId: profile.id,
            transcriptUrl: url,
          );
        }
      }

      return url;
    }, errorMessage: 'Error uploading document');
  }

  /// Delete a document from Supabase storage
  Future<bool> deleteDocument(String documentUrl) async {
    if (!isAvailable) return false;

    final result = await safeExecute<bool>(() async {
      // Extract the path from the URL
      final uri = Uri.parse(documentUrl);
      final pathSegments = uri.pathSegments;

      // Find the path after 'documents/'
      final documentsIndex = pathSegments.indexOf('documents');
      if (documentsIndex == -1 || documentsIndex >= pathSegments.length - 1) {
        return false;
      }

      final storagePath = pathSegments.sublist(documentsIndex + 1).join('/');

      await client!.storage.from('documents').remove([storagePath]);
      return true;
    }, errorMessage: 'Error deleting document', rethrowError: false);
    return result ?? false;
  }
}
