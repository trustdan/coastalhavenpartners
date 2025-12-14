import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'base_repository.dart';
import '../models/models.dart';
import '../local/database.dart';
import '../local/converters.dart';
import '../../services/connectivity_service.dart';

/// Repository for profile-related operations with offline support
class ProfileRepository extends BaseRepository {
  ProfileRepository._();
  static ProfileRepository? _instance;
  static ProfileRepository get instance => _instance ??= ProfileRepository._();

  final AppDatabase _db = AppDatabase();
  final ConnectivityService _connectivity = ConnectivityService.instance;

  // =====================
  // Base Profile (Local-First)
  // =====================

  /// Get current user's base profile (local-first)
  Future<Profile?> getCurrentProfile() async {
    if (currentUserId == null) return null;

    // If offline, return cached data
    if (!_connectivity.isOnline) {
      return _getCachedProfile(currentUserId!);
    }

    if (!isAvailable) {
      return _getCachedProfile(currentUserId!);
    }

    final result = await safeExecute<Profile?>(
      () async {
        final response = await table(
          'profiles',
        ).select().eq('id', currentUserId!).single();
        final profile = Profile.fromJson(response);

        // Cache the profile
        await _db.cacheProfile(profile.toCacheCompanion());

        return profile;
      },
      errorMessage: 'Error fetching current profile',
      rethrowError: false,
    );

    // If network failed, return cached data
    if (result == null) {
      return _getCachedProfile(currentUserId!);
    }

    return result;
  }

  /// Get cached profile from local database
  Future<Profile?> _getCachedProfile(String userId) async {
    final cached = await _db.getProfileById(userId);
    return cached?.toProfile();
  }

  /// Get profile by user ID (local-first)
  Future<Profile?> getProfile(String userId) async {
    // If offline, return cached data
    if (!_connectivity.isOnline) {
      return _getCachedProfile(userId);
    }

    if (!isAvailable) {
      return _getCachedProfile(userId);
    }

    final result = await safeExecute<Profile?>(
      () async {
        final response = await table(
          'profiles',
        ).select().eq('id', userId).maybeSingle();
        if (response == null) return null;

        final profile = Profile.fromJson(response);

        // Cache the profile
        await _db.cacheProfile(profile.toCacheCompanion());

        return profile;
      },
      errorMessage: 'Error fetching profile',
      rethrowError: false,
    );

    // If network failed, return cached data
    if (result == null) {
      return _getCachedProfile(userId);
    }

    return result;
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
      await table('profiles')
          .update({
            if (fullName != null) 'full_name': fullName,
            if (linkedinUrl != null) 'linkedin_url': linkedinUrl,
            if (phone != null) 'phone': phone,
            if (role != null) 'role': role.name,
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('id', userId);

      // Refresh cache
      await getProfile(userId);
    }, errorMessage: 'Error updating profile');
  }

  // =====================
  // Candidate Profile (Local-First)
  // =====================

  /// Get candidate profile for current user (local-first)
  Future<CandidateProfile?> getCurrentCandidateProfile() async {
    if (currentUserId == null) return null;

    // If offline, return cached data
    if (!_connectivity.isOnline) {
      return _getCachedCandidateProfile(currentUserId!);
    }

    if (!isAvailable) {
      return _getCachedCandidateProfile(currentUserId!);
    }

    final result = await safeExecute<CandidateProfile?>(
      () async {
        final response = await table('candidate_profiles')
            .select('*, profiles!candidate_profiles_user_id_fkey(*)')
            .eq('user_id', currentUserId!)
            .maybeSingle();
        if (response == null) return null;

        final profile = CandidateProfile.fromJson(response);

        // Cache the profile
        await _db.cacheCandidateProfile(profile.toCacheCompanion());

        return profile;
      },
      errorMessage: 'Error fetching candidate profile',
      rethrowError: false,
    );

    // If network failed, return cached data
    if (result == null) {
      return _getCachedCandidateProfile(currentUserId!);
    }

    return result;
  }

  /// Get cached candidate profile from local database
  Future<CandidateProfile?> _getCachedCandidateProfile(String userId) async {
    final cached = await _db.getCandidateProfileByUserId(userId);
    return cached?.toCandidateProfile();
  }

  /// Get candidate profile by ID (local-first)
  Future<CandidateProfile?> getCandidateProfile(String profileId) async {
    // If offline, return cached data
    if (!_connectivity.isOnline) {
      final cached = await _db.getCandidateProfileById(profileId);
      return cached?.toCandidateProfile();
    }

    if (!isAvailable) {
      final cached = await _db.getCandidateProfileById(profileId);
      return cached?.toCandidateProfile();
    }

    final result = await safeExecute<CandidateProfile?>(
      () async {
        final response = await table('candidate_profiles')
            .select('*, profiles!candidate_profiles_user_id_fkey(*)')
            .eq('id', profileId)
            .maybeSingle();
        if (response == null) return null;

        final profile = CandidateProfile.fromJson(response);

        // Cache the profile
        await _db.cacheCandidateProfile(profile.toCacheCompanion());

        return profile;
      },
      errorMessage: 'Error fetching candidate profile',
      rethrowError: false,
    );

    // If network failed, return cached data
    if (result == null) {
      final cached = await _db.getCandidateProfileById(profileId);
      return cached?.toCandidateProfile();
    }

    return result;
  }

  /// Check if user has candidate profile
  Future<bool> hasCandidateProfile(String userId) async {
    // Check local cache first
    final cached = await _db.getCandidateProfileByUserId(userId);
    if (cached != null) return true;

    if (!_connectivity.isOnline || !isAvailable) return false;

    final response = await table(
      'candidate_profiles',
    ).select('id').eq('user_id', userId).maybeSingle();
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
        final result = await client!.rpc(
          'create_candidate_profile',
          params: {
            'p_user_id': currentUserId,
            'p_school_name': schoolName,
            'p_major': major,
            'p_gpa': gpa,
            'p_graduation_year': graduationYear,
          },
        );
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

        // Refresh cache
        await getCurrentCandidateProfile();

        return profileId;
      } catch (e) {
        // Fallback to direct insert
        debugPrint('RPC failed, using direct insert: $e');
        final response = await table('candidate_profiles')
            .insert({
              'user_id': currentUserId,
              'school_name': schoolName,
              'major': major,
              'gpa': gpa,
              'graduation_year': graduationYear,
              'education_level': educationLevel?.name,
              'bio': bio,
              'target_roles': targetRoles,
              'preferred_locations': preferredLocations,
            })
            .select('id')
            .single();

        // Refresh cache
        await getCurrentCandidateProfile();

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
      await table('candidate_profiles')
          .update({
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
            if (preferredLocations != null)
              'preferred_locations': preferredLocations,
            if (tags != null) 'tags': tags,
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('id', profileId);

      // Refresh cache
      await getCurrentCandidateProfile();
    }, errorMessage: 'Error updating candidate profile');
  }

  // =====================
  // Recruiter Profile (Local-First)
  // =====================

  /// Get recruiter profile for current user (local-first)
  Future<RecruiterProfile?> getCurrentRecruiterProfile() async {
    if (currentUserId == null) return null;

    // If offline, return cached data
    if (!_connectivity.isOnline) {
      return _getCachedRecruiterProfile(currentUserId!);
    }

    if (!isAvailable) {
      return _getCachedRecruiterProfile(currentUserId!);
    }

    final result = await safeExecute<RecruiterProfile?>(
      () async {
        final response = await table('recruiter_profiles')
            .select('*, profiles!recruiter_profiles_user_id_fkey(*)')
            .eq('user_id', currentUserId!)
            .maybeSingle();
        if (response == null) return null;

        final profile = RecruiterProfile.fromJson(response);

        // Cache the profile
        await _db.cacheRecruiterProfile(profile.toCacheCompanion());

        return profile;
      },
      errorMessage: 'Error fetching recruiter profile',
      rethrowError: false,
    );

    // If network failed, return cached data
    if (result == null) {
      return _getCachedRecruiterProfile(currentUserId!);
    }

    return result;
  }

  /// Get cached recruiter profile from local database
  Future<RecruiterProfile?> _getCachedRecruiterProfile(String userId) async {
    final cached = await _db.getRecruiterProfileByUserId(userId);
    return cached?.toRecruiterProfile();
  }

  /// Get recruiter profile by ID (local-first)
  Future<RecruiterProfile?> getRecruiterProfile(String profileId) async {
    // If offline, return cached data
    if (!_connectivity.isOnline) {
      final cached = await _db.getRecruiterProfileById(profileId);
      return cached?.toRecruiterProfile();
    }

    if (!isAvailable) {
      final cached = await _db.getRecruiterProfileById(profileId);
      return cached?.toRecruiterProfile();
    }

    final result = await safeExecute<RecruiterProfile?>(
      () async {
        final response = await table('recruiter_profiles')
            .select('*, profiles!recruiter_profiles_user_id_fkey(*)')
            .eq('id', profileId)
            .maybeSingle();
        if (response == null) return null;

        final profile = RecruiterProfile.fromJson(response);

        // Cache the profile
        await _db.cacheRecruiterProfile(profile.toCacheCompanion());

        return profile;
      },
      errorMessage: 'Error fetching recruiter profile',
      rethrowError: false,
    );

    // If network failed, return cached data
    if (result == null) {
      final cached = await _db.getRecruiterProfileById(profileId);
      return cached?.toRecruiterProfile();
    }

    return result;
  }

  /// Check if user has recruiter profile
  Future<bool> hasRecruiterProfile(String userId) async {
    // Check local cache first
    final cached = await _db.getRecruiterProfileByUserId(userId);
    if (cached != null) return true;

    if (!_connectivity.isOnline || !isAvailable) return false;

    final response = await table(
      'recruiter_profiles',
    ).select('id').eq('user_id', userId).maybeSingle();
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
      final response = await table('recruiter_profiles')
          .insert({
            'user_id': currentUserId,
            'firm_name': firmName,
            'job_title': jobTitle,
            'firm_type': firmType,
            'bio': bio,
            'linkedin_url': linkedinUrl,
            'specialties': specialties,
            'locations': locations,
          })
          .select('id')
          .single();

      // Refresh cache
      await getCurrentRecruiterProfile();

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
      await table('recruiter_profiles')
          .update({
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
          })
          .eq('id', profileId);

      // Refresh cache
      await getCurrentRecruiterProfile();
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

    final response = await table(
      'school_profiles',
    ).select('id').eq('user_id', userId).maybeSingle();
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
      final response = await table('school_profiles')
          .insert({
            'user_id': currentUserId,
            'school_name': schoolName,
            'department_name': departmentName ?? 'Career Services',
            'contact_email': contactEmail,
            'contact_phone': contactPhone,
            'website': website,
            'school_domain': schoolDomain,
          })
          .select('id')
          .single();
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
      await table('school_profiles')
          .update({
            if (schoolName != null) 'school_name': schoolName,
            if (departmentName != null) 'department_name': departmentName,
            if (contactEmail != null) 'contact_email': contactEmail,
            if (contactPhone != null) 'contact_phone': contactPhone,
            if (website != null) 'website': website,
            if (schoolDomain != null) 'school_domain': schoolDomain,
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('id', profileId);
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
      // Determine the correct bucket based on document type
      // Storage buckets are: 'resumes' and 'transcripts'
      final bucketName = documentType == 'resume' ? 'resumes' : 'transcripts';

      // Create a unique file path (RLS expects user_id as first folder)
      final timestamp = DateTime.now().millisecondsSinceEpoch;
      final storagePath = '$currentUserId/${timestamp}_$fileName';

      // Upload to Supabase storage
      await client!.storage
          .from(bucketName)
          .uploadBinary(
            storagePath,
            fileBytes,
            fileOptions: FileOptions(
              contentType: 'application/pdf',
              upsert: true,
            ),
          );

      // Get the public URL
      final url = client!.storage.from(bucketName).getPublicUrl(storagePath);

      // Update the candidate profile with the new document URL
      if (documentType == 'resume') {
        final profile = await getCurrentCandidateProfile();
        if (profile != null) {
          await updateCandidateProfile(profileId: profile.id, resumeUrl: url);
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

  /// Upload a profile photo to Supabase storage
  /// Returns the public URL of the uploaded photo
  Future<String?> uploadProfilePhoto(
    Uint8List photoBytes,
    String fileName,
  ) async {
    if (!isAvailable || currentUserId == null) return null;

    return safeExecute<String?>(() async {
      // Storage bucket for profile photos
      const bucketName = 'profile-photos';

      // Create a unique file path (RLS expects user_id as first folder)
      final timestamp = DateTime.now().millisecondsSinceEpoch;
      final extension = fileName.split('.').last.toLowerCase();
      final storagePath = '$currentUserId/${timestamp}_profile.$extension';

      // Determine content type
      String contentType;
      switch (extension) {
        case 'png':
          contentType = 'image/png';
          break;
        case 'gif':
          contentType = 'image/gif';
          break;
        case 'webp':
          contentType = 'image/webp';
          break;
        default:
          contentType = 'image/jpeg';
      }

      // Upload to Supabase storage
      await client!.storage
          .from(bucketName)
          .uploadBinary(
            storagePath,
            photoBytes,
            fileOptions: FileOptions(
              contentType: contentType,
              upsert: true,
            ),
          );

      // Get the public URL
      final url = client!.storage.from(bucketName).getPublicUrl(storagePath);

      // Update the profile with the new photo URL
      await table('profiles')
          .update({
            'avatar_url': url,
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('id', currentUserId!);

      return url;
    }, errorMessage: 'Error uploading profile photo');
  }

  /// Delete a document from Supabase storage
  Future<bool> deleteDocument(String documentUrl) async {
    if (!isAvailable) return false;

    final result = await safeExecute<bool>(
      () async {
        // Extract the path from the URL
        final uri = Uri.parse(documentUrl);
        final pathSegments = uri.pathSegments;

        // Determine which bucket the file is in (resumes or transcripts)
        String? bucketName;
        int bucketIndex = -1;

        for (final bucket in ['resumes', 'transcripts']) {
          final index = pathSegments.indexOf(bucket);
          if (index != -1) {
            bucketName = bucket;
            bucketIndex = index;
            break;
          }
        }

        if (bucketName == null || bucketIndex >= pathSegments.length - 1) {
          return false;
        }

        final storagePath = pathSegments.sublist(bucketIndex + 1).join('/');

        await client!.storage.from(bucketName).remove([storagePath]);
        return true;
      },
      errorMessage: 'Error deleting document',
      rethrowError: false,
    );
    return result ?? false;
  }
}
