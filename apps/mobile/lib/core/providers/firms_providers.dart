import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/models.dart';
import '../utils/app_debug.dart';
import '../utils/result.dart';
import 'jobs_providers.dart' show jobRepositoryProvider;

// =====================
// Filter Category Constants
// =====================

/// List of category labels (display names)
const firmsCategoryLabels = ['All', 'IB', 'PE', 'VC', 'HF', 'AM', 'FO'];

/// List of category values (database values, null = All)
const List<String?> firmsCategoryValues = [
  null,
  'Investment Banking',
  'Private Equity',
  'Venture Capital',
  'Hedge Fund',
  'Asset Management',
  'Family Office',
];

// =====================
// Basic Firms Providers
// =====================

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
final searchFirmsProvider = FutureProvider.family<List<Firm>, String>((
  ref,
  query,
) async {
  if (query.isEmpty) return [];
  final repo = ref.watch(jobRepositoryProvider);
  return repo.searchFirms(query);
});

// =====================
// Firms Directory Providers
// =====================

/// Parameters for firms directory query
class FirmsDirectoryParams {
  static const Object _unset = Object();

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
    Object? category = _unset,
    Object? region = _unset,
    Object? state = _unset,
    Object? priority = _unset,
    Object? searchQuery = _unset,
    String? sortBy,
    bool? ascending,
    int? limit,
    int? offset,
  }) {
    return FirmsDirectoryParams(
      category: identical(category, _unset)
          ? this.category
          : category as String?,
      region: identical(region, _unset) ? this.region : region as String?,
      state: identical(state, _unset) ? this.state : state as String?,
      priority: identical(priority, _unset) ? this.priority : priority as int?,
      searchQuery: identical(searchQuery, _unset)
          ? this.searchQuery
          : searchQuery as String?,
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
    final prev = state;
    state = state.copyWith(category: category, offset: 0);
    AppDebug.log(
      'firms',
      'setCategory',
      data: {'prev': prev.toString(), 'next': state.toString()},
    );
  }

  void setRegion(String? region) {
    final prev = state;
    state = state.copyWith(region: region, offset: 0);
    AppDebug.log(
      'firms',
      'setRegion',
      data: {'prev': prev.toString(), 'next': state.toString()},
    );
  }

  void setState(String? stateValue) {
    final prev = state;
    state = state.copyWith(state: stateValue, offset: 0);
    AppDebug.log(
      'firms',
      'setState',
      data: {'prev': prev.toString(), 'next': state.toString()},
    );
  }

  void setPriority(int? priority) {
    final prev = state;
    state = state.copyWith(priority: priority, offset: 0);
    AppDebug.log(
      'firms',
      'setPriority',
      data: {'prev': prev.toString(), 'next': state.toString()},
    );
  }

  void setSearchQuery(String? query) {
    final prev = state;
    state = state.copyWith(searchQuery: query, offset: 0);
    AppDebug.log(
      'firms',
      'setSearchQuery',
      data: {'prev': prev.toString(), 'next': state.toString()},
    );
  }

  void setSortBy(String sortBy, {bool? ascending}) {
    final prev = state;
    state = state.copyWith(sortBy: sortBy, ascending: ascending, offset: 0);
    AppDebug.log(
      'firms',
      'setSortBy',
      data: {'prev': prev.toString(), 'next': state.toString()},
    );
  }

  void setOffset(int offset) {
    state = state.copyWith(offset: offset);
  }

  void clearFilters() {
    state = const FirmsDirectoryParams();
    AppDebug.log('firms', 'clearFilters');
  }
}

/// Provider for current firms directory filter state
final firmsDirectoryParamsProvider =
    NotifierProvider<FirmsDirectoryParamsNotifier, FirmsDirectoryParams>(
      FirmsDirectoryParamsNotifier.new,
    );

/// Notifier for current category index in swipe navigation
class FirmsCategoryIndexNotifier extends Notifier<int> {
  @override
  int build() => 0;

  void setIndex(int index) {
    if (index >= 0 && index < firmsCategoryValues.length) {
      state = index;
      // Also update the params provider to sync filter state
      ref.read(firmsDirectoryParamsProvider.notifier).setCategory(
        firmsCategoryValues[index],
      );
    }
  }
}

/// Provider for current category index in swipe navigation
final firmsCategoryIndexProvider =
    NotifierProvider<FirmsCategoryIndexNotifier, int>(
  FirmsCategoryIndexNotifier.new,
);

/// Provider for firms directory with filters
final firmsDirectoryProvider =
    FutureProvider.family<List<Firm>, FirmsDirectoryParams>((
      ref,
      params,
    ) async {
      final repo = ref.watch(jobRepositoryProvider);
      AppDebug.log(
        'firms',
        'fetch firmsDirectoryProvider',
        data: {
          'category': params.category,
          'region': params.region,
          'state': params.state,
          'priority': params.priority,
          'searchQuery': params.searchQuery,
          'sortBy': params.sortBy,
          'ascending': params.ascending,
          'limit': params.limit,
          'offset': params.offset,
        },
      );
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
    });

/// Error information for the Firms Directory.
class FirmsDirectoryError {
  final FailureKind kind;
  final String message;

  const FirmsDirectoryError({
    required this.kind,
    required this.message,
  });

  /// Whether this error should trigger re-authentication.
  bool get requiresAuth => kind == FailureKind.auth;

  /// Whether this is a permission/RLS error.
  bool get isPermissionError => kind == FailureKind.permission;

  /// Whether this is a network-related error.
  bool get isNetworkError =>
      kind == FailureKind.network || kind == FailureKind.offline;
}

/// Paged state for the Firms Directory (supports "Load more" + total count).
class FirmsDirectoryPagedState {
  final FirmsDirectoryParams params;
  final List<Firm> firms;
  final int totalCount;
  final bool isLoadingMore;
  final bool isFromCache;

  /// Error from the last fetch operation (null if successful).
  final FirmsDirectoryError? error;

  const FirmsDirectoryPagedState({
    required this.params,
    required this.firms,
    required this.totalCount,
    this.isLoadingMore = false,
    this.isFromCache = false,
    this.error,
  });

  bool get hasMore => firms.length < totalCount;

  /// Whether there was an error in the last operation.
  bool get hasError => error != null;

  FirmsDirectoryPagedState copyWith({
    FirmsDirectoryParams? params,
    List<Firm>? firms,
    int? totalCount,
    bool? isLoadingMore,
    bool? isFromCache,
    FirmsDirectoryError? error,
    bool clearError = false,
  }) {
    return FirmsDirectoryPagedState(
      params: params ?? this.params,
      firms: firms ?? this.firms,
      totalCount: totalCount ?? this.totalCount,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      isFromCache: isFromCache ?? this.isFromCache,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

class FirmsDirectoryPagedNotifier
    extends AsyncNotifier<FirmsDirectoryPagedState> {
  @override
  Future<FirmsDirectoryPagedState> build() async {
    final params = ref.watch(firmsDirectoryParamsProvider);
    final repo = ref.watch(jobRepositoryProvider);

    AppDebug.log(
      'firms',
      'paged build',
      data: {
        'category': params.category,
        'region': params.region,
        'state': params.state,
        'priority': params.priority,
        'searchQuery': params.searchQuery,
        'sortBy': params.sortBy,
        'ascending': params.ascending,
        'limit': params.limit,
        'offset': params.offset,
      },
    );

    // Fetch count using Result pattern
    final countResult = await repo.getFirmsCountResult(
      category: params.category,
      region: params.region,
      state: params.state,
      priority: params.priority,
      searchQuery: params.searchQuery,
    );

    // Fetch firms using Result pattern
    final firmsResult = await repo.getFirmsDirectoryResult(
      category: params.category,
      region: params.region,
      state: params.state,
      priority: params.priority,
      searchQuery: params.searchQuery,
      sortBy: params.sortBy,
      ascending: params.ascending,
      limit: params.limit,
      offset: 0,
    );

    // Handle results - check for failures
    FirmsDirectoryError? error;
    int total = 0;
    List<Firm> firms = [];
    bool isFromCache = false;

    // Process count result
    switch (countResult) {
      case Success(:final data, isFromCache: final cached):
        total = data;
        isFromCache = cached;
      case Failure(:final kind, :final message):
        error = FirmsDirectoryError(kind: kind, message: message);
        AppDebug.log('firms', 'count failed', data: {'kind': kind.name, 'message': message});
    }

    // Process firms result
    switch (firmsResult) {
      case Success(:final data, isFromCache: final cached):
        firms = data;
        // If either result is from cache, mark as cached
        isFromCache = isFromCache || cached;
      case Failure(:final kind, :final message):
        // If we didn't already have an error, set this one
        error ??= FirmsDirectoryError(kind: kind, message: message);
        AppDebug.log('firms', 'firms fetch failed', data: {'kind': kind.name, 'message': message});
    }

    AppDebug.log(
      'firms',
      'paged initial result',
      data: {
        'total': total,
        'returned': firms.length,
        'isFromCache': isFromCache,
        'hasError': error != null,
        'errorKind': error?.kind.name,
      },
    );

    return FirmsDirectoryPagedState(
      params: params,
      firms: firms,
      totalCount: total,
      isFromCache: isFromCache,
      error: error,
    );
  }

  Future<void> loadMore() async {
    final current = state.asData?.value;
    if (current == null) return;
    if (current.isLoadingMore) return;
    if (!current.hasMore) return;

    // Clear any previous error and set loading state
    state = AsyncData(current.copyWith(isLoadingMore: true, clearError: true));

    final repo = ref.read(jobRepositoryProvider);
    final nextOffset = current.firms.length;
    final params = current.params;

    AppDebug.log(
      'firms',
      'loadMore',
      data: {
        'nextOffset': nextOffset,
        'limit': params.limit,
        'category': params.category,
        'region': params.region,
        'state': params.state,
        'priority': params.priority,
        'searchQuery': params.searchQuery,
        'sortBy': params.sortBy,
        'ascending': params.ascending,
      },
    );

    final result = await repo.getFirmsDirectoryResult(
      category: params.category,
      region: params.region,
      state: params.state,
      priority: params.priority,
      searchQuery: params.searchQuery,
      sortBy: params.sortBy,
      ascending: params.ascending,
      limit: params.limit,
      offset: nextOffset,
    );

    switch (result) {
      case Success(:final data, :final isFromCache):
        final merged = <Firm>[...current.firms, ...data];
        AppDebug.log(
          'firms',
          'loadMore success',
          data: {
            'received': data.length,
            'merged': merged.length,
            'total': current.totalCount,
            'isFromCache': isFromCache,
          },
        );
        state = AsyncData(current.copyWith(
          firms: merged,
          isLoadingMore: false,
          isFromCache: isFromCache,
          clearError: true,
        ));

      case Failure(:final kind, :final message):
        AppDebug.log(
          'firms',
          'loadMore failed',
          data: {'kind': kind.name, 'message': message},
        );
        state = AsyncData(current.copyWith(
          isLoadingMore: false,
          error: FirmsDirectoryError(kind: kind, message: message),
        ));
    }
  }

  /// Clear the current error state.
  void clearError() {
    final current = state.asData?.value;
    if (current != null && current.hasError) {
      state = AsyncData(current.copyWith(clearError: true));
    }
  }

  /// Retry after an error.
  Future<void> retry() async {
    clearError();
    ref.invalidateSelf();
  }
}

final firmsDirectoryPagedProvider =
    AsyncNotifierProvider<
      FirmsDirectoryPagedNotifier,
      FirmsDirectoryPagedState
    >(FirmsDirectoryPagedNotifier.new);

/// Provider for firms directory using current filter state
final currentFirmsDirectoryProvider = FutureProvider<List<Firm>>((ref) async {
  final params = ref.watch(firmsDirectoryParamsProvider);
  return ref.watch(firmsDirectoryProvider(params).future);
});

// =====================
// Saved Firms Providers
// =====================

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
final isFirmSavedProvider = FutureProvider.family<bool, String>((
  ref,
  firmId,
) async {
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
final savedFirmsNotifierProvider =
    AsyncNotifierProvider<SavedFirmsNotifier, Set<String>>(
      SavedFirmsNotifier.new,
    );
