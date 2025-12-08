import 'package:flutter/foundation.dart';
import 'supabase_service.dart';

/// Service for managing user profiles in Supabase
class ProfileService {
  ProfileService._();

  static ProfileService? _instance;
  static ProfileService get instance => _instance ??= ProfileService._();

  /// Update the user's role in the profiles table
  Future<void> updateUserRole(String userId, String role) async {
    final client = SupabaseService.instance.client;
    if (client == null) {
      debugPrint('ProfileService: Supabase not initialized');
      return;
    }

    await client.from('profiles').update({'role': role}).eq('id', userId);
    debugPrint('ProfileService: Updated user role to $role');
  }

  /// Create or update a candidate profile
  Future<String?> saveCandidateProfile({
    required String userId,
    required String schoolName,
    required String major,
    required double gpa,
    required int graduationYear,
    String? degreeType,
    List<String>? targetRoles,
    List<String>? preferredLocations,
    String? resumeUrl,
  }) async {
    final client = SupabaseService.instance.client;
    if (client == null) {
      debugPrint('ProfileService: Supabase not initialized');
      return null;
    }

    try {
      // First check if candidate profile exists
      final existing = await client
          .from('candidate_profiles')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

      if (existing != null) {
        // Update existing profile
        await client.from('candidate_profiles').update({
          'school_name': schoolName,
          'major': major,
          'gpa': gpa,
          'graduation_year': graduationYear,
          'education_level': _mapDegreeType(degreeType),
          'target_roles': targetRoles,
          'preferred_locations': preferredLocations,
          if (resumeUrl != null) 'resume_url': resumeUrl,
          'updated_at': DateTime.now().toIso8601String(),
        }).eq('user_id', userId);

        debugPrint('ProfileService: Updated candidate profile');
        return existing['id'] as String;
      } else {
        // Create new profile using the database function
        final result = await client.rpc('create_candidate_profile', params: {
          'p_user_id': userId,
          'p_school_name': schoolName,
          'p_major': major,
          'p_gpa': gpa,
          'p_graduation_year': graduationYear,
        });

        final profileId = result as String?;

        // Update with additional fields
        if (profileId != null) {
          await client.from('candidate_profiles').update({
            'education_level': _mapDegreeType(degreeType),
            'target_roles': targetRoles,
            'preferred_locations': preferredLocations,
            if (resumeUrl != null) 'resume_url': resumeUrl,
          }).eq('id', profileId);
        }

        debugPrint('ProfileService: Created candidate profile: $profileId');
        return profileId;
      }
    } catch (e) {
      debugPrint('ProfileService: Error saving candidate profile: $e');
      rethrow;
    }
  }

  /// Create or update a recruiter profile
  Future<String?> saveRecruiterProfile({
    required String userId,
    required String firmName,
    required String jobTitle,
    String? firmType,
    String? firmSize,
    String? linkedInUrl,
    String? phone,
  }) async {
    final client = SupabaseService.instance.client;
    if (client == null) {
      debugPrint('ProfileService: Supabase not initialized');
      return null;
    }

    try {
      // First check if recruiter profile exists
      final existing = await client
          .from('recruiter_profiles')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

      final data = {
        'user_id': userId,
        'firm_name': firmName,
        'job_title': jobTitle,
        'firm_type': firmType,
        'updated_at': DateTime.now().toIso8601String(),
      };

      if (existing != null) {
        // Update existing profile
        await client
            .from('recruiter_profiles')
            .update(data)
            .eq('user_id', userId);

        debugPrint('ProfileService: Updated recruiter profile');
        return existing['id'] as String;
      } else {
        // Create new profile
        final result = await client
            .from('recruiter_profiles')
            .insert(data)
            .select('id')
            .single();

        final profileId = result['id'] as String;
        debugPrint('ProfileService: Created recruiter profile: $profileId');
        return profileId;
      }
    } catch (e) {
      debugPrint('ProfileService: Error saving recruiter profile: $e');
      rethrow;
    }
  }

  /// Create or update a school admin profile
  Future<String?> saveSchoolProfile({
    required String userId,
    required String schoolName,
    String? departmentName,
    String? contactEmail,
    String? contactPhone,
    String? website,
  }) async {
    final client = SupabaseService.instance.client;
    if (client == null) {
      debugPrint('ProfileService: Supabase not initialized');
      return null;
    }

    try {
      // First check if school profile exists
      final existing = await client
          .from('school_profiles')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

      final data = {
        'user_id': userId,
        'school_name': schoolName,
        'department_name': departmentName ?? 'Career Services',
        if (contactEmail != null) 'contact_email': contactEmail,
        if (contactPhone != null) 'contact_phone': contactPhone,
        if (website != null) 'website': website,
        'updated_at': DateTime.now().toIso8601String(),
      };

      if (existing != null) {
        // Update existing profile
        await client
            .from('school_profiles')
            .update(data)
            .eq('user_id', userId);

        debugPrint('ProfileService: Updated school profile');
        return existing['id'] as String;
      } else {
        // Create new profile
        final result = await client
            .from('school_profiles')
            .insert(data)
            .select('id')
            .single();

        final profileId = result['id'] as String;
        debugPrint('ProfileService: Created school profile: $profileId');
        return profileId;
      }
    } catch (e) {
      debugPrint('ProfileService: Error saving school profile: $e');
      rethrow;
    }
  }

  /// Update user's LinkedIn URL in profiles table
  Future<void> updateLinkedInUrl(String userId, String linkedInUrl) async {
    final client = SupabaseService.instance.client;
    if (client == null) return;

    await client
        .from('profiles')
        .update({'linkedin_url': linkedInUrl})
        .eq('id', userId);
  }

  /// Update user's phone in profiles table
  Future<void> updatePhone(String userId, String phone) async {
    final client = SupabaseService.instance.client;
    if (client == null) return;

    await client.from('profiles').update({'phone': phone}).eq('id', userId);
  }

  /// Check if user has completed their profile
  Future<bool> hasCompletedProfile(String userId, String role) async {
    final client = SupabaseService.instance.client;
    if (client == null) return false;

    try {
      switch (role) {
        case 'candidate':
          final result = await client
              .from('candidate_profiles')
              .select('id')
              .eq('user_id', userId)
              .maybeSingle();
          return result != null;

        case 'recruiter':
          final result = await client
              .from('recruiter_profiles')
              .select('id')
              .eq('user_id', userId)
              .maybeSingle();
          return result != null;

        case 'school_admin':
          final result = await client
              .from('school_profiles')
              .select('id')
              .eq('user_id', userId)
              .maybeSingle();
          return result != null;

        default:
          return false;
      }
    } catch (e) {
      debugPrint('ProfileService: Error checking profile completion: $e');
      return false;
    }
  }

  /// Map degree type string to database enum
  String? _mapDegreeType(String? degreeType) {
    if (degreeType == null) return null;

    final lower = degreeType.toLowerCase();
    if (lower.contains('bachelor') || lower.contains('ba') || lower.contains('bs')) {
      return 'bachelors';
    } else if (lower.contains('mba')) {
      return 'mba';
    } else if (lower.contains('master') || lower.contains('ma') || lower.contains('ms')) {
      return 'masters';
    } else if (lower.contains('phd') || lower.contains('doctor')) {
      return 'phd';
    }
    return 'bachelors'; // default
  }
}
