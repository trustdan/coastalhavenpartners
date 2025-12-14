import 'dart:typed_data';
import 'package:supabase_flutter/supabase_flutter.dart' show FileOptions;
import 'base_repository.dart';
import '../models/models.dart';

/// Repository for recruiter-specific operations
class RecruiterRepository extends BaseRepository {
  RecruiterRepository._();
  static RecruiterRepository? _instance;
  static RecruiterRepository get instance => _instance ??= RecruiterRepository._();

  // =====================
  // Recruiter Profile
  // =====================

  /// Get current recruiter's profile with verification info
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

  /// Update recruiter profile fields
  Future<RecruiterProfile?> updateRecruiterProfile({
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
    if (!isAvailable || currentUserId == null) return null;

    return safeExecute<RecruiterProfile?>(() async {
      final response = await table('recruiter_profiles').update({
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
          .eq('user_id', currentUserId!)
          .select('*, profiles!recruiter_profiles_user_id_fkey(*)')
          .single();

      return RecruiterProfile.fromJson(response);
    }, errorMessage: 'Error updating recruiter profile');
  }

  /// Upload recruiter profile photo
  Future<String?> uploadProfilePhoto(
    Uint8List photoBytes,
    String fileName,
  ) async {
    if (!isAvailable || currentUserId == null) return null;

    return safeExecute<String?>(() async {
      const bucketName = 'profile-photos';
      final timestamp = DateTime.now().millisecondsSinceEpoch;
      final extension = fileName.split('.').last.toLowerCase();
      final storagePath = 'recruiters/$currentUserId/${timestamp}_profile.$extension';

      // Upload to Supabase Storage
      await client!.storage.from(bucketName).uploadBinary(
        storagePath,
        photoBytes,
        fileOptions: FileOptions(
          contentType: 'image/$extension',
          upsert: true,
        ),
      );

      // Get public URL
      final publicUrl = client!.storage.from(bucketName).getPublicUrl(storagePath);

      // Update profile with new photo URL
      await table('recruiter_profiles').update({
        'profile_photo_url': publicUrl,
        'updated_at': DateTime.now().toIso8601String(),
      }).eq('user_id', currentUserId!);

      return publicUrl;
    }, errorMessage: 'Error uploading profile photo');
  }

  // =====================
  // Candidate Search
  // =====================

  /// Search candidates with filters
  Future<List<CandidateProfile>> searchCandidates({
    CandidateSearchFilters? filters,
    int limit = 20,
    int offset = 0,
  }) async {
    if (!isAvailable) return [];

    final result = await safeExecute<List<CandidateProfile>>(() async {
      var query = table('candidate_profiles')
          .select('*, profiles!candidate_profiles_user_id_fkey(*)')
          .eq('status', 'verified'); // Only show verified candidates

      // Apply filters
      if (filters != null) {
        if (filters.minGpa != null) {
          query = query.gte('gpa', filters.minGpa!);
        }
        if (filters.maxGpa != null) {
          query = query.lte('gpa', filters.maxGpa!);
        }
        if (filters.minGraduationYear != null) {
          query = query.gte('graduation_year', filters.minGraduationYear!);
        }
        if (filters.maxGraduationYear != null) {
          query = query.lte('graduation_year', filters.maxGraduationYear!);
        }
        if (filters.hasResume) {
          query = query.not('resume_url', 'is', null);
        }
        if (filters.hasTranscript) {
          query = query.not('transcript_url', 'is', null);
        }
        if (filters.hasCalendar) {
          query = query.not('scheduling_url', 'is', null);
        }
        if (filters.hasBio) {
          query = query.not('bio', 'is', null);
        }
        if (filters.searchQuery != null && filters.searchQuery!.isNotEmpty) {
          // Search in school name and major
          query = query.or(
            'school_name.ilike.%${filters.searchQuery}%,'
            'major.ilike.%${filters.searchQuery}%',
          );
        }
      }

      final response = await query
          .order('last_activity_at', ascending: false)
          .range(offset, offset + limit - 1);

      var candidates = (response as List)
          .map((e) => CandidateProfile.fromJson(e))
          .toList();

      // Filter by schools, target roles, and locations in memory
      // (PostgreSQL array operations are more complex)
      if (filters != null) {
        if (filters.schools != null && filters.schools!.isNotEmpty) {
          candidates = candidates.where((c) =>
            filters.schools!.any((s) =>
              c.schoolName.toLowerCase().contains(s.toLowerCase()))).toList();
        }
        if (filters.targetRoles != null && filters.targetRoles!.isNotEmpty) {
          candidates = candidates.where((c) =>
            c.targetRoles != null &&
            c.targetRoles!.any((r) =>
              filters.targetRoles!.any((fr) =>
                r.toLowerCase().contains(fr.toLowerCase())))).toList();
        }
        if (filters.preferredLocations != null && filters.preferredLocations!.isNotEmpty) {
          candidates = candidates.where((c) =>
            c.preferredLocations != null &&
            c.preferredLocations!.any((l) =>
              filters.preferredLocations!.any((fl) =>
                l.toLowerCase().contains(fl.toLowerCase())))).toList();
        }
      }

      return candidates;
    }, errorMessage: 'Error searching candidates', rethrowError: false);
    return result ?? [];
  }

  /// Get candidate by profile ID
  Future<CandidateProfile?> getCandidateById(String profileId) async {
    if (!isAvailable) return null;

    return safeExecute<CandidateProfile?>(() async {
      final response = await table('candidate_profiles')
          .select('*, profiles!candidate_profiles_user_id_fkey(*)')
          .eq('id', profileId)
          .maybeSingle();
      if (response == null) return null;

      // Log profile view
      _logProfileView(profileId);

      return CandidateProfile.fromJson(response);
    }, errorMessage: 'Error fetching candidate');
  }

  /// Private: Log profile view event
  void _logProfileView(String candidateProfileId) {
    if (currentUserId == null) return;

    // Fire and forget
    table('analytics_events').insert({
      'user_id': currentUserId,
      'target_id': candidateProfileId,
      'event_type': 'profile_view',
      'created_at': DateTime.now().toIso8601String(),
    }).then((_) {}).catchError((e) {});
  }

  // =====================
  // Bookmarked Candidates
  // =====================

  /// Get bookmarked candidates for current recruiter
  Future<List<BookmarkedCandidate>> getBookmarkedCandidates({
    BookmarkStatus? status,
    int limit = 50,
  }) async {
    if (!isAvailable || currentUserId == null) return [];

    final result = await safeExecute<List<BookmarkedCandidate>>(() async {
      final recruiterProfile = await table('recruiter_profiles')
          .select('id')
          .eq('user_id', currentUserId!)
          .maybeSingle();

      if (recruiterProfile == null) return <BookmarkedCandidate>[];

      var query = table('bookmarked_candidates')
          .select('*, candidate_profiles(*, profiles!candidate_profiles_user_id_fkey(*))')
          .eq('recruiter_id', recruiterProfile['id']);

      if (status != null) {
        query = query.eq('status', status.name);
      }

      final response = await query
          .order('created_at', ascending: false)
          .limit(limit);

      return (response as List)
          .map((e) => BookmarkedCandidate.fromJson(e))
          .toList();
    }, errorMessage: 'Error fetching bookmarked candidates', rethrowError: false);
    return result ?? [];
  }

  /// Bookmark a candidate
  Future<BookmarkedCandidate?> bookmarkCandidate({
    required String candidateProfileId,
    String? notes,
  }) async {
    if (!isAvailable || currentUserId == null) return null;

    return safeExecute<BookmarkedCandidate?>(() async {
      final recruiterProfile = await table('recruiter_profiles')
          .select('id')
          .eq('user_id', currentUserId!)
          .single();

      final response = await table('bookmarked_candidates').insert({
        'recruiter_id': recruiterProfile['id'],
        'candidate_id': candidateProfileId,
        'status': 'new',
        'notes': notes,
        'created_at': DateTime.now().toIso8601String(),
      }).select('*, candidate_profiles(*, profiles!candidate_profiles_user_id_fkey(*))').single();

      return BookmarkedCandidate.fromJson(response);
    }, errorMessage: 'Error bookmarking candidate');
  }

  /// Update bookmark status
  Future<void> updateBookmarkStatus({
    required String bookmarkId,
    required BookmarkStatus status,
    String? notes,
  }) async {
    if (!isAvailable) return;

    await safeExecute<void>(() async {
      await table('bookmarked_candidates').update({
        'status': status.name,
        if (notes != null) 'notes': notes,
      }).eq('id', bookmarkId);
    }, errorMessage: 'Error updating bookmark');
  }

  /// Remove bookmark
  Future<void> removeBookmark(String bookmarkId) async {
    if (!isAvailable) return;

    await safeExecute<void>(() async {
      await table('bookmarked_candidates').delete().eq('id', bookmarkId);
    }, errorMessage: 'Error removing bookmark');
  }

  /// Check if candidate is bookmarked
  Future<bool> isBookmarked(String candidateProfileId) async {
    if (!isAvailable || currentUserId == null) return false;

    final result = await safeExecute<bool>(() async {
      final recruiterProfile = await table('recruiter_profiles')
          .select('id')
          .eq('user_id', currentUserId!)
          .maybeSingle();

      if (recruiterProfile == null) return false;

      final response = await table('bookmarked_candidates')
          .select('id')
          .eq('recruiter_id', recruiterProfile['id'])
          .eq('candidate_id', candidateProfileId)
          .maybeSingle();

      return response != null;
    }, errorMessage: 'Error checking bookmark status', rethrowError: false);
    return result ?? false;
  }

  // =====================
  // Saved Searches
  // =====================

  /// Get saved searches for current recruiter
  Future<List<SavedSearch>> getSavedSearches() async {
    if (!isAvailable || currentUserId == null) return [];

    final result = await safeExecute<List<SavedSearch>>(() async {
      final recruiterProfile = await table('recruiter_profiles')
          .select('id')
          .eq('user_id', currentUserId!)
          .maybeSingle();

      if (recruiterProfile == null) return <SavedSearch>[];

      final response = await table('saved_searches')
          .select()
          .eq('recruiter_id', recruiterProfile['id'])
          .order('created_at', ascending: false);

      return (response as List).map((e) => SavedSearch.fromJson(e)).toList();
    }, errorMessage: 'Error fetching saved searches', rethrowError: false);
    return result ?? [];
  }

  /// Create saved search
  Future<SavedSearch?> createSavedSearch({
    required String name,
    required CandidateSearchFilters filters,
    bool notifyNewMatches = false,
  }) async {
    if (!isAvailable || currentUserId == null) return null;

    return safeExecute<SavedSearch?>(() async {
      final recruiterProfile = await table('recruiter_profiles')
          .select('id')
          .eq('user_id', currentUserId!)
          .single();

      final response = await table('saved_searches').insert({
        'recruiter_id': recruiterProfile['id'],
        'name': name,
        'filters': filters.toJson(),
        'notify_new_matches': notifyNewMatches,
        'created_at': DateTime.now().toIso8601String(),
      }).select().single();

      return SavedSearch.fromJson(response);
    }, errorMessage: 'Error creating saved search');
  }

  /// Delete saved search
  Future<void> deleteSavedSearch(String searchId) async {
    if (!isAvailable) return;

    await safeExecute<void>(() async {
      await table('saved_searches').delete().eq('id', searchId);
    }, errorMessage: 'Error deleting saved search');
  }

  // =====================
  // Campaigns
  // =====================

  /// Get campaigns for current recruiter
  Future<List<RecruiterCampaign>> getCampaigns({
    CampaignStatus? status,
    int limit = 20,
  }) async {
    if (!isAvailable || currentUserId == null) return [];

    final result = await safeExecute<List<RecruiterCampaign>>(() async {
      final recruiterProfile = await table('recruiter_profiles')
          .select('id')
          .eq('user_id', currentUserId!)
          .maybeSingle();

      if (recruiterProfile == null) return <RecruiterCampaign>[];

      var query = table('recruiter_campaigns')
          .select()
          .eq('recruiter_profile_id', recruiterProfile['id']);

      if (status != null) {
        query = query.eq('status', status.name);
      }

      final response = await query
          .order('created_at', ascending: false)
          .limit(limit);

      // Get stats for each campaign
      final campaigns = <RecruiterCampaign>[];
      for (final campaignData in response as List) {
        var campaign = RecruiterCampaign.fromJson(campaignData);

        // Get recipient stats
        final statsResponse = await table('campaign_recipients')
            .select('status')
            .eq('campaign_id', campaign.id);

        int total = (statsResponse as List).length;
        int sent = statsResponse.where((r) => r['status'] == 'sent').length;
        int opened = statsResponse.where((r) => r['status'] == 'opened').length;
        int replied = statsResponse.where((r) => r['status'] == 'replied').length;
        int failed = statsResponse.where((r) => r['status'] == 'failed').length;

        campaign = campaign.copyWith(
          totalRecipients: total,
          sentCount: sent,
          openedCount: opened,
          repliedCount: replied,
          failedCount: failed,
        );
        campaigns.add(campaign);
      }

      return campaigns;
    }, errorMessage: 'Error fetching campaigns', rethrowError: false);
    return result ?? [];
  }

  /// Get campaign by ID
  Future<RecruiterCampaign?> getCampaign(String campaignId) async {
    if (!isAvailable) return null;

    return safeExecute<RecruiterCampaign?>(() async {
      final response = await table('recruiter_campaigns')
          .select()
          .eq('id', campaignId)
          .maybeSingle();
      if (response == null) return null;
      return RecruiterCampaign.fromJson(response);
    }, errorMessage: 'Error fetching campaign');
  }

  /// Create campaign
  Future<RecruiterCampaign?> createCampaign({
    required String name,
    required String subject,
    required String messageTemplate,
    Map<String, dynamic>? filters,
    String? savedSearchId,
  }) async {
    if (!isAvailable || currentUserId == null) return null;

    return safeExecute<RecruiterCampaign?>(() async {
      final recruiterProfile = await table('recruiter_profiles')
          .select('id')
          .eq('user_id', currentUserId!)
          .single();

      final response = await table('recruiter_campaigns').insert({
        'recruiter_profile_id': recruiterProfile['id'],
        'name': name,
        'subject': subject,
        'message_template': messageTemplate,
        'filters': filters,
        'saved_search_id': savedSearchId,
        'status': 'draft',
        'created_at': DateTime.now().toIso8601String(),
      }).select().single();

      return RecruiterCampaign.fromJson(response);
    }, errorMessage: 'Error creating campaign');
  }

  /// Update campaign
  Future<void> updateCampaign({
    required String campaignId,
    String? name,
    String? subject,
    String? messageTemplate,
    Map<String, dynamic>? filters,
    CampaignStatus? status,
    DateTime? scheduledAt,
  }) async {
    if (!isAvailable) return;

    await safeExecute<void>(() async {
      await table('recruiter_campaigns').update({
        if (name != null) 'name': name,
        if (subject != null) 'subject': subject,
        if (messageTemplate != null) 'message_template': messageTemplate,
        if (filters != null) 'filters': filters,
        if (status != null) 'status': status.name,
        if (scheduledAt != null) 'scheduled_at': scheduledAt.toIso8601String(),
        'updated_at': DateTime.now().toIso8601String(),
      }).eq('id', campaignId);
    }, errorMessage: 'Error updating campaign');
  }

  /// Delete campaign (only if draft)
  Future<void> deleteCampaign(String campaignId) async {
    if (!isAvailable) return;

    await safeExecute<void>(() async {
      await table('recruiter_campaigns')
          .delete()
          .eq('id', campaignId)
          .eq('status', 'draft');
    }, errorMessage: 'Error deleting campaign');
  }

  /// Get campaign recipients
  Future<List<CampaignRecipient>> getCampaignRecipients(
    String campaignId, {
    int limit = 50,
    int offset = 0,
  }) async {
    if (!isAvailable) return [];

    final result = await safeExecute<List<CampaignRecipient>>(() async {
      final response = await table('campaign_recipients')
          .select('*, candidate_profiles(*, profiles!candidate_profiles_user_id_fkey(*))')
          .eq('campaign_id', campaignId)
          .order('created_at', ascending: false)
          .range(offset, offset + limit - 1);

      return (response as List)
          .map((e) => CampaignRecipient.fromJson(e))
          .toList();
    }, errorMessage: 'Error fetching campaign recipients', rethrowError: false);
    return result ?? [];
  }

  // =====================
  // Notes
  // =====================

  /// Get notes for a candidate
  Future<List<RecruiterCandidateNote>> getCandidateNotes(
    String candidateProfileId,
  ) async {
    if (!isAvailable || currentUserId == null) return [];

    final result = await safeExecute<List<RecruiterCandidateNote>>(() async {
      final recruiterProfile = await table('recruiter_profiles')
          .select('id')
          .eq('user_id', currentUserId!)
          .maybeSingle();

      if (recruiterProfile == null) return <RecruiterCandidateNote>[];

      final response = await table('recruiter_candidate_notes')
          .select()
          .eq('recruiter_id', recruiterProfile['id'])
          .eq('candidate_id', candidateProfileId)
          .order('created_at', ascending: false);

      return (response as List)
          .map((e) => RecruiterCandidateNote.fromJson(e))
          .toList();
    }, errorMessage: 'Error fetching candidate notes', rethrowError: false);
    return result ?? [];
  }

  /// Add note to candidate
  Future<RecruiterCandidateNote?> addCandidateNote({
    required String candidateProfileId,
    required String content,
  }) async {
    if (!isAvailable || currentUserId == null) return null;

    return safeExecute<RecruiterCandidateNote?>(() async {
      final recruiterProfile = await table('recruiter_profiles')
          .select('id')
          .eq('user_id', currentUserId!)
          .single();

      final response = await table('recruiter_candidate_notes').insert({
        'recruiter_id': recruiterProfile['id'],
        'candidate_id': candidateProfileId,
        'content': content,
        'created_at': DateTime.now().toIso8601String(),
      }).select().single();

      return RecruiterCandidateNote.fromJson(response);
    }, errorMessage: 'Error adding candidate note');
  }

  /// Update note
  Future<void> updateCandidateNote({
    required String noteId,
    required String content,
  }) async {
    if (!isAvailable) return;

    await safeExecute<void>(() async {
      await table('recruiter_candidate_notes').update({
        'content': content,
        'updated_at': DateTime.now().toIso8601String(),
      }).eq('id', noteId);
    }, errorMessage: 'Error updating candidate note');
  }

  /// Delete note
  Future<void> deleteCandidateNote(String noteId) async {
    if (!isAvailable) return;

    await safeExecute<void>(() async {
      await table('recruiter_candidate_notes').delete().eq('id', noteId);
    }, errorMessage: 'Error deleting candidate note');
  }
}
