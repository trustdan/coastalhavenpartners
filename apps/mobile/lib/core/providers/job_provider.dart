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

// =====================
// Saved Jobs Providers
// =====================

/// Provider for saved jobs list
final savedJobsProvider = FutureProvider<List<JobListing>>((ref) async {
  final repo = ref.watch(jobRepositoryProvider);
  return repo.getSavedJobs();
});

/// Check if a job is saved
final isJobSavedProvider = FutureProvider.family<bool, String>((ref, jobListingId) async {
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
final savedJobsNotifierProvider = AsyncNotifierProvider<SavedJobsNotifier, List<JobListing>>(
  SavedJobsNotifier.new,
);

// =====================
// Firms Directory Providers
// =====================

/// Parameters for firms directory query
class FirmsDirectoryParams {
  final String? category;
  final String? region;
  final String? state;
  final int? priority;
  final String? searchQuery;
  final String sortBy;
  final bool ascending;
  final int limit;
  final int offset;

  const FirmsDirectoryParams({
    this.category,
    this.region,
    this.state,
    this.priority,
    this.searchQuery,
    this.sortBy = 'priority',
    this.ascending = true,
    this.limit = 25,
    this.offset = 0,
  });

  FirmsDirectoryParams copyWith({
    String? category,
    String? region,
    String? state,
    int? priority,
    String? searchQuery,
    String? sortBy,
    bool? ascending,
    int? limit,
    int? offset,
  }) {
    return FirmsDirectoryParams(
      category: category ?? this.category,
      region: region ?? this.region,
      state: state ?? this.state,
      priority: priority ?? this.priority,
      searchQuery: searchQuery ?? this.searchQuery,
      sortBy: sortBy ?? this.sortBy,
      ascending: ascending ?? this.ascending,
      limit: limit ?? this.limit,
      offset: offset ?? this.offset,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is FirmsDirectoryParams &&
          category == other.category &&
          region == other.region &&
          state == other.state &&
          priority == other.priority &&
          searchQuery == other.searchQuery &&
          sortBy == other.sortBy &&
          ascending == other.ascending &&
          limit == other.limit &&
          offset == other.offset;

  @override
  int get hashCode => Object.hash(
        category,
        region,
        state,
        priority,
        searchQuery,
        sortBy,
        ascending,
        limit,
        offset,
      );
}

/// Notifier for firms directory filter state
class FirmsDirectoryParamsNotifier extends Notifier<FirmsDirectoryParams> {
  @override
  FirmsDirectoryParams build() => const FirmsDirectoryParams();

  void updateParams(FirmsDirectoryParams params) {
    state = params;
  }

  void setCategory(String? category) {
    state = state.copyWith(category: category);
  }

  void setRegion(String? region) {
    state = state.copyWith(region: region);
  }

  void setState(String? stateValue) {
    state = state.copyWith(state: stateValue);
  }

  void setPriority(int? priority) {
    state = state.copyWith(priority: priority);
  }

  void setSearchQuery(String? query) {
    state = state.copyWith(searchQuery: query);
  }

  void setSortBy(String sortBy, {bool? ascending}) {
    state = state.copyWith(sortBy: sortBy, ascending: ascending);
  }

  void setOffset(int offset) {
    state = state.copyWith(offset: offset);
  }

  void clearFilters() {
    state = const FirmsDirectoryParams();
  }
}

/// Provider for current firms directory filter state
final firmsDirectoryParamsProvider = NotifierProvider<FirmsDirectoryParamsNotifier, FirmsDirectoryParams>(
  FirmsDirectoryParamsNotifier.new,
);

/// Provider for firms directory with filters
final firmsDirectoryProvider = FutureProvider.family<List<Firm>, FirmsDirectoryParams>(
  (ref, params) async {
    final repo = ref.watch(jobRepositoryProvider);
    return repo.getFirmsDirectory(
      category: params.category,
      region: params.region,
      state: params.state,
      priority: params.priority,
      searchQuery: params.searchQuery,
      sortBy: params.sortBy,
      ascending: params.ascending,
      limit: params.limit,
      offset: params.offset,
    );
  },
);

/// Provider for firms directory using current filter state
final currentFirmsDirectoryProvider = FutureProvider<List<Firm>>((ref) async {
  final params = ref.watch(firmsDirectoryParamsProvider);
  return ref.watch(firmsDirectoryProvider(params).future);
});

/// Provider for saved firm IDs
final savedFirmIdsProvider = FutureProvider<Set<String>>((ref) async {
  final repo = ref.watch(jobRepositoryProvider);
  return repo.getSavedFirmIds();
});

/// Provider for saved firms list
final savedFirmsProvider = FutureProvider<List<Firm>>((ref) async {
  final repo = ref.watch(jobRepositoryProvider);
  return repo.getSavedFirms();
});

/// Check if a firm is saved
final isFirmSavedProvider = FutureProvider.family<bool, String>((ref, firmId) async {
  final repo = ref.watch(jobRepositoryProvider);
  return repo.isFirmSaved(firmId);
});

/// Notifier for managing saved firms
class SavedFirmsNotifier extends AsyncNotifier<Set<String>> {
  @override
  Future<Set<String>> build() async {
    final repo = ref.watch(jobRepositoryProvider);
    return repo.getSavedFirmIds();
  }

  /// Save a firm
  Future<bool> saveFirm(String firmId) async {
    final repo = ref.read(jobRepositoryProvider);
    final success = await repo.saveFirm(firmId);
    if (success) {
      // Optimistically add to set
      final current = state.hasValue ? state.value! : <String>{};
      state = AsyncData({...current, firmId});
      // Invalidate related providers
      ref.invalidate(isFirmSavedProvider(firmId));
      ref.invalidate(savedFirmsProvider);
    }
    return success;
  }

  /// Unsave a firm
  Future<bool> unsaveFirm(String firmId) async {
    final repo = ref.read(jobRepositoryProvider);
    final success = await repo.unsaveFirm(firmId);
    if (success) {
      // Optimistically remove from set
      final current = state.hasValue ? state.value! : <String>{};
      state = AsyncData(current.where((id) => id != firmId).toSet());
      // Invalidate related providers
      ref.invalidate(isFirmSavedProvider(firmId));
      ref.invalidate(savedFirmsProvider);
    }
    return success;
  }

  /// Toggle save status
  Future<void> toggleSave(String firmId, bool currentlySaved) async {
    if (currentlySaved) {
      await unsaveFirm(firmId);
    } else {
      await saveFirm(firmId);
    }
  }
}

/// Provider for saved firms notifier
final savedFirmsNotifierProvider = AsyncNotifierProvider<SavedFirmsNotifier, Set<String>>(
  SavedFirmsNotifier.new,
);
