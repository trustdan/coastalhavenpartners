import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/models.dart';
import '../../data/repositories/repositories.dart';
import 'profile_provider.dart';

/// Provider for job repository instance
final jobRepositoryProvider = Provider<JobRepository>((ref) {
  return JobRepository.instance;
});

/// Provider for job listings with optional filters
final jobListingsProvider = FutureProvider.family<List<JobListing>, JobListingsParams>((ref, params) async {
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
final defaultJobListingsProvider = FutureProvider<List<JobListing>>((ref) async {
  final repo = ref.watch(jobRepositoryProvider);
  return repo.getJobListings();
});

/// Featured jobs provider
final featuredJobsProvider = FutureProvider<List<JobListing>>((ref) async {
  final repo = ref.watch(jobRepositoryProvider);
  return repo.getFeaturedJobs();
});

/// Job listing by ID
final jobListingProvider = FutureProvider.family<JobListing?, String>((ref, jobId) async {
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

/// Provider for all firms
final firmsProvider = FutureProvider<List<Firm>>((ref) async {
  final repo = ref.watch(jobRepositoryProvider);
  return repo.getFirms();
});

/// Firm by ID
final firmProvider = FutureProvider.family<Firm?, String>((ref, firmId) async {
  final repo = ref.watch(jobRepositoryProvider);
  return repo.getFirm(firmId);
});

/// Search firms
final searchFirmsProvider = FutureProvider.family<List<Firm>, String>((ref, query) async {
  if (query.isEmpty) return [];
  final repo = ref.watch(jobRepositoryProvider);
  return repo.searchFirms(query);
});

/// My applications (for candidates)
final myApplicationsProvider = FutureProvider<List<Application>>((ref) async {
  final repo = ref.watch(jobRepositoryProvider);
  return repo.getMyApplications();
});

/// Application by ID
final applicationProvider = FutureProvider.family<Application?, String>((ref, applicationId) async {
  final repo = ref.watch(jobRepositoryProvider);
  return repo.getApplication(applicationId);
});

/// Check if user has applied to a job
final hasAppliedProvider = FutureProvider.family<bool, String>((ref, jobListingId) async {
  final repo = ref.watch(jobRepositoryProvider);
  return repo.hasApplied(jobListingId);
});
