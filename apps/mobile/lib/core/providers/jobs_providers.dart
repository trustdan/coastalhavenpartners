import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/models.dart';
import '../../data/repositories/repositories.dart';
import 'profile_provider.dart';

/// Provider for job repository instance
final jobRepositoryProvider = Provider<JobRepository>((ref) {
  return JobRepository.instance;
});

/// Provider for job listings with optional filters
final jobListingsProvider =
    FutureProvider.family<List<JobListing>, JobListingsParams>((
      ref,
      params,
    ) async {
      final repo = ref.watch(jobRepositoryProvider);
      return repo.getJobListings(
        limit: params.limit,
        offset: params.offset,
        firmId: params.firmId,
        jobType: params.jobType,
        searchQuery: params.searchQuery,
      );
    });

/// Parameters for job listings query
class JobListingsParams {
  final int limit;
  final int offset;
  final String? firmId;
  final JobType? jobType;
  final String? searchQuery;

  const JobListingsParams({
    this.limit = 20,
    this.offset = 0,
    this.firmId,
    this.jobType,
    this.searchQuery,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is JobListingsParams &&
          limit == other.limit &&
          offset == other.offset &&
          firmId == other.firmId &&
          jobType == other.jobType &&
          searchQuery == other.searchQuery;

  @override
  int get hashCode => Object.hash(limit, offset, firmId, jobType, searchQuery);
}

/// Default job listings (first page)
final defaultJobListingsProvider = FutureProvider<List<JobListing>>((
  ref,
) async {
  final repo = ref.watch(jobRepositoryProvider);
  return repo.getJobListings();
});

/// Featured jobs provider
final featuredJobsProvider = FutureProvider<List<JobListing>>((ref) async {
  final repo = ref.watch(jobRepositoryProvider);
  return repo.getFeaturedJobs();
});

/// Job listing by ID
final jobListingProvider = FutureProvider.family<JobListing?, String>((
  ref,
  jobId,
) async {
  final repo = ref.watch(jobRepositoryProvider);
  return repo.getJobListing(jobId);
});

/// Matching jobs for current candidate
final matchingJobsProvider = FutureProvider<List<JobListing>>((ref) async {
  final candidateProfile = await ref.watch(candidateProfileProvider.future);
  if (candidateProfile == null) return [];

  final repo = ref.watch(jobRepositoryProvider);
  return repo.getMatchingJobs(
    graduationYear: candidateProfile.graduationYear,
    gpa: candidateProfile.gpa,
    targetRoles: candidateProfile.targetRoles,
  );
});

// =====================
// Applications Providers
// =====================

/// My applications (for candidates)
final myApplicationsProvider = FutureProvider<List<Application>>((ref) async {
  final repo = ref.watch(jobRepositoryProvider);
  return repo.getMyApplications();
});

/// Application by ID
final applicationProvider = FutureProvider.family<Application?, String>((
  ref,
  applicationId,
) async {
  final repo = ref.watch(jobRepositoryProvider);
  return repo.getApplication(applicationId);
});

/// Check if user has applied to a job
final hasAppliedProvider = FutureProvider.family<bool, String>((
  ref,
  jobListingId,
) async {
  final repo = ref.watch(jobRepositoryProvider);
  return repo.hasApplied(jobListingId);
});

// =====================
// Saved Jobs Providers
// =====================

/// Provider for saved jobs list
final savedJobsProvider = FutureProvider<List<JobListing>>((ref) async {
  final repo = ref.watch(jobRepositoryProvider);
  return repo.getSavedJobs();
});

/// Check if a job is saved
final isJobSavedProvider = FutureProvider.family<bool, String>((
  ref,
  jobListingId,
) async {
  final repo = ref.watch(jobRepositoryProvider);
  return repo.isJobSaved(jobListingId);
});

/// Notifier for managing saved jobs
class SavedJobsNotifier extends AsyncNotifier<List<JobListing>> {
  @override
  Future<List<JobListing>> build() async {
    final repo = ref.watch(jobRepositoryProvider);
    return repo.getSavedJobs();
  }

  /// Save a job
  Future<bool> saveJob(String jobListingId) async {
    final repo = ref.read(jobRepositoryProvider);
    final success = await repo.saveJob(jobListingId);
    if (success) {
      // Refresh the list
      ref.invalidateSelf();
      // Also invalidate the isJobSaved provider
      ref.invalidate(isJobSavedProvider(jobListingId));
    }
    return success;
  }

  /// Unsave a job
  Future<bool> unsaveJob(String jobListingId) async {
    final repo = ref.read(jobRepositoryProvider);
    final success = await repo.unsaveJob(jobListingId);
    if (success) {
      // Optimistically remove from current list
      final current = state.hasValue ? state.value! : <JobListing>[];
      state = AsyncData(current.where((j) => j.id != jobListingId).toList());
      // Also invalidate the isJobSaved provider
      ref.invalidate(isJobSavedProvider(jobListingId));
    }
    return success;
  }

  /// Toggle save status
  Future<void> toggleSave(String jobListingId, bool currentlySaved) async {
    if (currentlySaved) {
      await unsaveJob(jobListingId);
    } else {
      await saveJob(jobListingId);
    }
  }
}

/// Provider for saved jobs notifier
final savedJobsNotifierProvider =
    AsyncNotifierProvider<SavedJobsNotifier, List<JobListing>>(
      SavedJobsNotifier.new,
    );
