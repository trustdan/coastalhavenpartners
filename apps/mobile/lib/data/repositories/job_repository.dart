import 'base_repository.dart';
import '../models/models.dart';
import '../local/database.dart';
import '../local/converters.dart';
import '../../services/connectivity_service.dart';
import '../../services/sync_service.dart';

/// Repository for job-related operations with offline support
class JobRepository extends BaseRepository {
  JobRepository._();
  static JobRepository? _instance;
  static JobRepository get instance => _instance ??= JobRepository._();

  final AppDatabase _db = AppDatabase();
  final ConnectivityService _connectivity = ConnectivityService.instance;
  final SyncService _sync = SyncService.instance;

  // =====================
  // Firms
  // =====================

  /// Get all visible firms (local-first)
  Future<List<Firm>> getFirms({int limit = 50, int offset = 0}) async {
    // If offline, return cached data
    if (!_connectivity.isOnline) {
      return _getCachedFirms();
    }

    // Try to fetch from network
    if (!isAvailable) {
      return _getCachedFirms();
    }

    final result = await safeExecute<List<Firm>>(() async {
      final response = await table('firms')
          .select()
          .eq('is_visible', true)
          .order('name')
          .range(offset, offset + limit - 1);
      final firms = (response as List).map((e) => Firm.fromJson(e)).toList();

      // Cache the results
      await _cacheFirms(firms);

      return firms;
    }, errorMessage: 'Error fetching firms', rethrowError: false);

    // If network failed, return cached data
    if (result == null) {
      return _getCachedFirms();
    }

    return result;
  }

  /// Get cached firms from local database
  Future<List<Firm>> _getCachedFirms() async {
    final cached = await _db.getAllFirms();
    return cached.map((c) => c.toFirm()).toList();
  }

  /// Cache firms to local database
  Future<void> _cacheFirms(List<Firm> firms) async {
    final companions = firms.map((f) => f.toCacheCompanion()).toList();
    await _db.cacheFirms(companions);
    await _db.setLastSyncTime('firms');
  }

  /// Get firm by ID
  Future<Firm?> getFirm(String firmId) async {
    if (!isAvailable) return null;

    return safeExecute<Firm?>(() async {
      final response = await table('firms')
          .select()
          .eq('id', firmId)
          .maybeSingle();
      if (response == null) return null;
      return Firm.fromJson(response);
    }, errorMessage: 'Error fetching firm');
  }

  /// Search firms by name
  Future<List<Firm>> searchFirms(String query) async {
    if (!isAvailable) return [];

    final result = await safeExecute<List<Firm>>(() async {
      final response = await table('firms')
          .select()
          .eq('is_visible', true)
          .ilike('name', '%$query%')
          .order('name')
          .limit(20);
      return (response as List).map((e) => Firm.fromJson(e)).toList();
    }, errorMessage: 'Error searching firms', rethrowError: false);
    return result ?? [];
  }

  // =====================
  // Job Listings
  // =====================

  /// Get active job listings with optional filters (local-first)
  Future<List<JobListing>> getJobListings({
    int limit = 20,
    int offset = 0,
    String? firmId,
    JobType? jobType,
    List<String>? locations,
    String? searchQuery,
  }) async {
    // If offline, return cached data
    if (!_connectivity.isOnline) {
      return _getCachedJobListings(
        query: searchQuery,
        jobType: jobType,
        firmId: firmId,
      );
    }

    // Try to fetch from network
    if (!isAvailable) {
      return _getCachedJobListings(
        query: searchQuery,
        jobType: jobType,
        firmId: firmId,
      );
    }

    final result = await safeExecute<List<JobListing>>(() async {
      var query = table('job_listings')
          .select('*, firms(*)')
          .eq('status', 'published');

      if (firmId != null) {
        query = query.eq('firm_id', firmId);
      }
      if (jobType != null) {
        query = query.eq('job_type', jobType.name);
      }
      if (searchQuery != null && searchQuery.isNotEmpty) {
        query = query.or('title.ilike.%$searchQuery%,description.ilike.%$searchQuery%');
      }

      final response = await query
          .order('is_featured', ascending: false)
          .order('published_at', ascending: false)
          .range(offset, offset + limit - 1);

      final jobs = (response as List).map((e) => JobListing.fromJson(e)).toList();

      // Cache the results (only on first page to avoid duplicates)
      if (offset == 0) {
        await _cacheJobListings(jobs);
      }

      return jobs;
    }, errorMessage: 'Error fetching job listings', rethrowError: false);

    // If network failed, return cached data
    if (result == null) {
      return _getCachedJobListings(
        query: searchQuery,
        jobType: jobType,
        firmId: firmId,
      );
    }

    return result;
  }

  /// Get cached job listings from local database
  Future<List<JobListing>> _getCachedJobListings({
    String? query,
    JobType? jobType,
    String? firmId,
  }) async {
    final cached = await _db.searchJobListings(
      query: query,
      jobType: jobType?.value,
      firmId: firmId,
    );

    // Also fetch associated firms for full data
    final jobs = <JobListing>[];
    for (final cachedJob in cached) {
      final cachedFirm = await _db.getFirmById(cachedJob.firmId);
      jobs.add(cachedJob.toJobListing(
        firm: cachedFirm?.toFirm(),
      ));
    }
    return jobs;
  }

  /// Cache job listings to local database
  Future<void> _cacheJobListings(List<JobListing> jobs) async {
    // Cache firms first
    final firms = jobs.map((j) => j.firm).whereType<Firm>().toList();
    if (firms.isNotEmpty) {
      await _cacheFirms(firms);
    }

    // Then cache job listings
    final companions = jobs.map((j) => j.toCacheCompanion()).toList();
    await _db.cacheJobListings(companions);
    await _db.setLastSyncTime('job_listings');
  }

  /// Get job listing by ID
  Future<JobListing?> getJobListing(String jobId) async {
    if (!isAvailable) return null;

    return safeExecute<JobListing?>(() async {
      final response = await table('job_listings')
          .select('*, firms(*)')
          .eq('id', jobId)
          .maybeSingle();
      if (response == null) return null;

      // Increment view count
      _incrementViewCount(jobId);

      return JobListing.fromJson(response);
    }, errorMessage: 'Error fetching job listing');
  }

  /// Get jobs matching candidate profile
  Future<List<JobListing>> getMatchingJobs({
    required int graduationYear,
    required double gpa,
    List<String>? targetRoles,
    int limit = 20,
  }) async {
    if (!isAvailable) return [];

    final result = await safeExecute<List<JobListing>>(() async {
      var query = table('job_listings')
          .select('*, firms(*)')
          .eq('status', 'published')
          .or('min_gpa.is.null,min_gpa.lte.$gpa');

      final response = await query
          .order('is_featured', ascending: false)
          .order('published_at', ascending: false)
          .limit(limit);

      // Filter by graduation year in memory (array contains)
      final jobs = (response as List).map((e) => JobListing.fromJson(e)).toList();
      return jobs.where((job) {
        if (job.targetGradYears == null || job.targetGradYears!.isEmpty) {
          return true;
        }
        return job.targetGradYears!.contains(graduationYear);
      }).toList();
    }, errorMessage: 'Error fetching matching jobs', rethrowError: false);
    return result ?? [];
  }

  /// Get featured job listings
  Future<List<JobListing>> getFeaturedJobs({int limit = 5}) async {
    if (!isAvailable) return [];

    final result = await safeExecute<List<JobListing>>(() async {
      final response = await table('job_listings')
          .select('*, firms(*)')
          .eq('status', 'published')
          .eq('is_featured', true)
          .order('published_at', ascending: false)
          .limit(limit);

      return (response as List).map((e) => JobListing.fromJson(e)).toList();
    }, errorMessage: 'Error fetching featured jobs', rethrowError: false);
    return result ?? [];
  }

  /// Private: Increment job view count
  void _incrementViewCount(String jobId) {
    // Fire and forget - don't await
    table('job_listings')
        .update({'view_count': 'view_count + 1'})
        .eq('id', jobId)
        .then((_) {})
        .catchError((e) {});
  }

  // =====================
  // Applications
  // =====================

  /// Get applications for current candidate (local-first)
  Future<List<Application>> getMyApplications({
    ApplicationStatus? status,
    int limit = 50,
  }) async {
    // If offline, return cached data
    if (!_connectivity.isOnline && currentUserId != null) {
      return _getCachedApplications();
    }

    if (!isAvailable || currentUserId == null) {
      return _getCachedApplications();
    }

    final result = await safeExecute<List<Application>>(() async {
      // First get candidate profile ID
      final candidateProfile = await table('candidate_profiles')
          .select('id')
          .eq('user_id', currentUserId!)
          .maybeSingle();

      if (candidateProfile == null) return <Application>[];

      var query = table('applications')
          .select('*, job_listings(*, firms(*))')
          .eq('candidate_profile_id', candidateProfile['id']);

      if (status != null) {
        query = query.eq('status', status.name);
      }

      final response = await query
          .order('applied_at', ascending: false)
          .limit(limit);

      final applications = (response as List).map((e) => Application.fromJson(e)).toList();

      // Cache the results
      await _cacheApplications(applications);

      return applications;
    }, errorMessage: 'Error fetching applications', rethrowError: false);

    // If network failed, return cached data
    if (result == null) {
      return _getCachedApplications();
    }

    return result;
  }

  /// Get cached applications from local database
  Future<List<Application>> _getCachedApplications() async {
    if (currentUserId == null) return [];

    // Get cached candidate profile to get profile ID
    final cachedProfile = await _db.getCandidateProfileByUserId(currentUserId!);
    if (cachedProfile == null) return [];

    final cached = await _db.getMyApplications(cachedProfile.id);
    return cached.map((c) => c.toApplication()).toList();
  }

  /// Cache applications to local database
  Future<void> _cacheApplications(List<Application> applications) async {
    final companions = applications.map((a) => a.toCacheCompanion()).toList();
    await _db.cacheApplications(companions);
    await _db.setLastSyncTime('applications');
  }

  /// Get single application
  Future<Application?> getApplication(String applicationId) async {
    if (!isAvailable) return null;

    return safeExecute<Application?>(() async {
      final response = await table('applications')
          .select('*, job_listings(*, firms(*))')
          .eq('id', applicationId)
          .maybeSingle();
      if (response == null) return null;
      return Application.fromJson(response);
    }, errorMessage: 'Error fetching application');
  }

  /// Submit application for a job (supports offline queueing)
  Future<Application?> submitApplication({
    required String jobListingId,
    required String coverLetter,
    required String outreachApproach,
    Map<String, dynamic>? snapshot,
  }) async {
    if (currentUserId == null) return null;

    // If offline, create a pending application and queue for sync
    if (!_connectivity.isOnline || !isAvailable) {
      return _queueApplicationForSync(
        jobListingId: jobListingId,
        coverLetter: coverLetter,
        outreachApproach: outreachApproach,
      );
    }

    return safeExecute<Application?>(() async {
      // Get candidate profile ID
      final candidateProfile = await table('candidate_profiles')
          .select('id, school_name, major, gpa, graduation_year')
          .eq('user_id', currentUserId!)
          .single();

      // Get job listing for snapshot
      final jobListing = await table('job_listings')
          .select('id, title, firm_id, firms(name)')
          .eq('id', jobListingId)
          .single();

      final applicationSnapshot = snapshot ?? {
        'job_title': jobListing['title'],
        'firm_name': jobListing['firms']?['name'],
        'school_name': candidateProfile['school_name'],
        'major': candidateProfile['major'],
        'gpa': candidateProfile['gpa'],
        'graduation_year': candidateProfile['graduation_year'],
      };

      final response = await table('applications').insert({
        'candidate_profile_id': candidateProfile['id'],
        'job_listing_id': jobListingId,
        'firm_id': jobListing['firm_id'],
        'cover_letter': coverLetter,
        'outreach_approach': outreachApproach,
        'snapshot': applicationSnapshot,
        'status': 'pending',
        'applied_at': DateTime.now().toIso8601String(),
      }).select('*, job_listings(*, firms(*))').single();

      final application = Application.fromJson(response);

      // Cache the new application
      await _db.cacheApplication(application.toCacheCompanion());

      return application;
    }, errorMessage: 'Error submitting application');
  }

  /// Queue an application for sync when offline
  Future<Application?> _queueApplicationForSync({
    required String jobListingId,
    required String coverLetter,
    required String outreachApproach,
  }) async {
    // Get cached candidate profile
    final cachedProfile = await _db.getCandidateProfileByUserId(currentUserId!);
    if (cachedProfile == null) return null;

    // Get cached job listing for snapshot
    final cachedJob = await _db.getJobListingById(jobListingId);
    final cachedFirm = cachedJob != null ? await _db.getFirmById(cachedJob.firmId) : null;

    // Generate a temporary ID for the pending application
    final tempId = 'pending_${DateTime.now().millisecondsSinceEpoch}';

    final applicationSnapshot = {
      'job_title': cachedJob?.title ?? 'Unknown',
      'firm_name': cachedFirm?.name ?? 'Unknown',
      'school_name': cachedProfile.schoolName,
      'major': cachedProfile.major,
      'gpa': cachedProfile.gpa,
      'graduation_year': cachedProfile.graduationYear,
    };

    // Create the application payload for sync
    final payload = {
      'candidate_profile_id': cachedProfile.id,
      'job_listing_id': jobListingId,
      'firm_id': cachedJob?.firmId,
      'cover_letter': coverLetter,
      'outreach_approach': outreachApproach,
      'snapshot': applicationSnapshot,
      'status': 'pending',
      'applied_at': DateTime.now().toIso8601String(),
    };

    // Queue for sync
    await _sync.queueCreate(
      entityTable: 'applications',
      recordId: tempId,
      data: payload,
    );

    // Create a local pending application
    final pendingApplication = Application(
      id: tempId,
      candidateProfileId: cachedProfile.id,
      jobListingId: jobListingId,
      firmId: cachedJob?.firmId,
      status: ApplicationStatus.pending,
      coverLetter: coverLetter,
      outreachApproach: outreachApproach,
      snapshot: applicationSnapshot,
      appliedAt: DateTime.now(),
      jobListing: cachedJob?.toJobListing(firm: cachedFirm?.toFirm()),
    );

    // Cache the pending application
    await _db.cacheApplication(pendingApplication.toCacheCompanion());

    return pendingApplication;
  }

  /// Check if user has already applied to a job (checks local cache too)
  Future<bool> hasApplied(String jobListingId) async {
    if (currentUserId == null) return false;

    // First check local cache
    final cachedProfile = await _db.getCandidateProfileByUserId(currentUserId!);
    if (cachedProfile != null) {
      final hasLocalApplication = await _db.hasAppliedToJob(
        cachedProfile.id,
        jobListingId,
      );
      if (hasLocalApplication) return true;
    }

    // If offline or unavailable, rely on local cache only
    if (!_connectivity.isOnline || !isAvailable) {
      return false;
    }

    final result = await safeExecute<bool>(() async {
      final candidateProfile = await table('candidate_profiles')
          .select('id')
          .eq('user_id', currentUserId!)
          .maybeSingle();

      if (candidateProfile == null) return false;

      final response = await table('applications')
          .select('id')
          .eq('candidate_profile_id', candidateProfile['id'])
          .eq('job_listing_id', jobListingId)
          .maybeSingle();

      return response != null;
    }, errorMessage: 'Error checking application status', rethrowError: false);
    return result ?? false;
  }

  /// Withdraw application
  Future<void> withdrawApplication(String applicationId) async {
    if (!isAvailable) return;

    await safeExecute<void>(() async {
      await table('applications')
          .update({
            'status': 'withdrawn',
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('id', applicationId);
    }, errorMessage: 'Error withdrawing application');
  }

  /// Update application status (for accept/decline offer)
  Future<void> updateApplicationStatus(String applicationId, String status) async {
    if (!isAvailable) return;

    await safeExecute<void>(() async {
      await table('applications')
          .update({
            'status': status,
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('id', applicationId);
    }, errorMessage: 'Error updating application status');
  }

  // =====================
  // Saved Jobs
  // =====================

  /// Get saved jobs for current candidate
  Future<List<JobListing>> getSavedJobs({int limit = 50}) async {
    if (!isAvailable || currentUserId == null) return [];

    final result = await safeExecute<List<JobListing>>(() async {
      // First get candidate profile ID
      final candidateProfile = await table('candidate_profiles')
          .select('id')
          .eq('user_id', currentUserId!)
          .maybeSingle();

      if (candidateProfile == null) return <JobListing>[];

      final response = await table('saved_jobs')
          .select('job_listing_id, job_listings(*, firms(*))')
          .eq('candidate_profile_id', candidateProfile['id'])
          .order('created_at', ascending: false)
          .limit(limit);

      return (response as List)
          .where((e) => e['job_listings'] != null)
          .map((e) => JobListing.fromJson(e['job_listings']))
          .toList();
    }, errorMessage: 'Error fetching saved jobs', rethrowError: false);

    return result ?? [];
  }

  /// Save a job for current candidate
  Future<bool> saveJob(String jobListingId) async {
    if (!isAvailable || currentUserId == null) return false;

    final result = await safeExecute<bool>(() async {
      final candidateProfile = await table('candidate_profiles')
          .select('id')
          .eq('user_id', currentUserId!)
          .maybeSingle();

      if (candidateProfile == null) return false;

      await table('saved_jobs').insert({
        'candidate_profile_id': candidateProfile['id'],
        'job_listing_id': jobListingId,
      });

      return true;
    }, errorMessage: 'Error saving job', rethrowError: false);

    return result ?? false;
  }

  /// Unsave a job for current candidate
  Future<bool> unsaveJob(String jobListingId) async {
    if (!isAvailable || currentUserId == null) return false;

    final result = await safeExecute<bool>(() async {
      final candidateProfile = await table('candidate_profiles')
          .select('id')
          .eq('user_id', currentUserId!)
          .maybeSingle();

      if (candidateProfile == null) return false;

      await table('saved_jobs')
          .delete()
          .eq('candidate_profile_id', candidateProfile['id'])
          .eq('job_listing_id', jobListingId);

      return true;
    }, errorMessage: 'Error unsaving job', rethrowError: false);

    return result ?? false;
  }

  /// Check if current candidate has saved a job
  Future<bool> isJobSaved(String jobListingId) async {
    if (!isAvailable || currentUserId == null) return false;

    final result = await safeExecute<bool>(() async {
      final candidateProfile = await table('candidate_profiles')
          .select('id')
          .eq('user_id', currentUserId!)
          .maybeSingle();

      if (candidateProfile == null) return false;

      final response = await table('saved_jobs')
          .select('id')
          .eq('candidate_profile_id', candidateProfile['id'])
          .eq('job_listing_id', jobListingId)
          .maybeSingle();

      return response != null;
    }, errorMessage: 'Error checking saved job status', rethrowError: false);

    return result ?? false;
  }
}
