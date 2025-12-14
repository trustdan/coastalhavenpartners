import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/enums.dart';
import '../../data/models/profile.dart';
import '../../data/models/support_message.dart';
import '../../data/repositories/admin_repository.dart';

/// Provider for admin repository instance
final adminRepositoryProvider = Provider<AdminRepository>((ref) {
  return AdminRepository.instance;
});

// ==================== Dashboard Stats ====================

/// Provider for admin dashboard statistics
final adminDashboardStatsProvider =
    FutureProvider<AdminDashboardStats>((ref) async {
  final repo = ref.watch(adminRepositoryProvider);
  return repo.getDashboardStats();
});

/// Notifier for refreshable dashboard stats
class AdminDashboardStatsNotifier extends AsyncNotifier<AdminDashboardStats> {
  @override
  Future<AdminDashboardStats> build() async {
    final repo = ref.watch(adminRepositoryProvider);
    return repo.getDashboardStats();
  }

  /// Manually refresh stats
  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repo = ref.read(adminRepositoryProvider);
      return repo.getDashboardStats();
    });
  }
}

/// Provider for refreshable dashboard stats notifier
final adminDashboardStatsNotifierProvider =
    AsyncNotifierProvider<AdminDashboardStatsNotifier, AdminDashboardStats>(
  AdminDashboardStatsNotifier.new,
);

// ==================== Candidate Verification ====================

/// Provider for pending verification candidates
final pendingVerificationCandidatesProvider =
    FutureProvider<List<CandidateProfile>>((ref) async {
  final repo = ref.watch(adminRepositoryProvider);
  return repo.getCandidatesByStatus(CandidateStatus.pendingVerification);
});

/// Provider for verified candidates
final verifiedCandidatesProvider =
    FutureProvider<List<CandidateProfile>>((ref) async {
  final repo = ref.watch(adminRepositoryProvider);
  return repo.getCandidatesByStatus(CandidateStatus.verified);
});

/// Provider for rejected candidates
final rejectedCandidatesProvider =
    FutureProvider<List<CandidateProfile>>((ref) async {
  final repo = ref.watch(adminRepositoryProvider);
  return repo.getCandidatesByStatus(CandidateStatus.rejected);
});

/// Notifier for verification actions
class VerificationActionsNotifier extends Notifier<void> {
  @override
  void build() {}

  /// Approve a candidate
  Future<bool> approveCandidate(String candidateId) async {
    final repo = ref.read(adminRepositoryProvider);
    final success = await repo.approveCandidate(candidateId);
    if (success) {
      // Refresh the lists
      ref.invalidate(pendingVerificationCandidatesProvider);
      ref.invalidate(verifiedCandidatesProvider);
      ref.invalidate(adminDashboardStatsNotifierProvider);
    }
    return success;
  }

  /// Reject a candidate
  Future<bool> rejectCandidate(String candidateId, {String? reason}) async {
    final repo = ref.read(adminRepositoryProvider);
    final success = await repo.rejectCandidate(candidateId, reason: reason);
    if (success) {
      // Refresh the lists
      ref.invalidate(pendingVerificationCandidatesProvider);
      ref.invalidate(rejectedCandidatesProvider);
      ref.invalidate(adminDashboardStatsNotifierProvider);
    }
    return success;
  }
}

/// Provider for verification actions
final verificationActionsProvider =
    NotifierProvider<VerificationActionsNotifier, void>(
  VerificationActionsNotifier.new,
);

// ==================== Candidate Management ====================

/// Parameters for candidate search
class CandidateSearchParams {
  final String query;
  final CandidateStatus? statusFilter;
  final int limit;

  const CandidateSearchParams({
    this.query = '',
    this.statusFilter,
    this.limit = 50,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CandidateSearchParams &&
          query == other.query &&
          statusFilter == other.statusFilter &&
          limit == other.limit;

  @override
  int get hashCode => Object.hash(query, statusFilter, limit);
}

/// Provider for searching candidates
final searchCandidatesProvider =
    FutureProvider.family<List<CandidateProfile>, CandidateSearchParams>(
  (ref, params) async {
    final repo = ref.watch(adminRepositoryProvider);
    if (params.query.isEmpty && params.statusFilter == null) {
      return repo.getAllCandidates(limit: params.limit);
    }
    return repo.searchCandidates(
      params.query,
      limit: params.limit,
      statusFilter: params.statusFilter,
    );
  },
);

/// Provider for all candidates (default view)
final allCandidatesProvider =
    FutureProvider<List<CandidateProfile>>((ref) async {
  final repo = ref.watch(adminRepositoryProvider);
  return repo.getAllCandidates();
});

// ==================== Support Messages ====================

/// Provider for new support messages
final newSupportMessagesProvider =
    FutureProvider<List<SupportMessage>>((ref) async {
  final repo = ref.watch(adminRepositoryProvider);
  return repo.getSupportMessagesByStatus(SupportMessageStatus.newMessage);
});

/// Provider for in-progress support messages
final inProgressSupportMessagesProvider =
    FutureProvider<List<SupportMessage>>((ref) async {
  final repo = ref.watch(adminRepositoryProvider);
  return repo.getSupportMessagesByStatus(SupportMessageStatus.inProgress);
});

/// Provider for resolved support messages
final resolvedSupportMessagesProvider =
    FutureProvider<List<SupportMessage>>((ref) async {
  final repo = ref.watch(adminRepositoryProvider);
  return repo.getSupportMessagesByStatus(SupportMessageStatus.resolved);
});

/// Provider for open support messages count (for badge)
final openSupportCountProvider = FutureProvider<int>((ref) async {
  final repo = ref.watch(adminRepositoryProvider);
  final messages = await repo.getOpenSupportMessages();
  return messages.length;
});

/// Notifier for support message actions
class SupportMessageActionsNotifier extends Notifier<void> {
  @override
  void build() {}

  /// Mark as in progress
  Future<bool> markInProgress(String messageId) async {
    final repo = ref.read(adminRepositoryProvider);
    final success = await repo.updateSupportMessageStatus(
      messageId,
      SupportMessageStatus.inProgress,
    );
    if (success) {
      _invalidateProviders();
    }
    return success;
  }

  /// Mark as resolved
  Future<bool> markResolved(String messageId, {String? adminNotes}) async {
    final repo = ref.read(adminRepositoryProvider);
    final success = await repo.updateSupportMessageStatus(
      messageId,
      SupportMessageStatus.resolved,
      adminNotes: adminNotes,
    );
    if (success) {
      _invalidateProviders();
    }
    return success;
  }

  /// Mark as spam
  Future<bool> markAsSpam(String messageId) async {
    final repo = ref.read(adminRepositoryProvider);
    final success = await repo.updateSupportMessageStatus(
      messageId,
      SupportMessageStatus.spam,
    );
    if (success) {
      _invalidateProviders();
    }
    return success;
  }

  void _invalidateProviders() {
    ref.invalidate(newSupportMessagesProvider);
    ref.invalidate(inProgressSupportMessagesProvider);
    ref.invalidate(resolvedSupportMessagesProvider);
    ref.invalidate(openSupportCountProvider);
    ref.invalidate(adminDashboardStatsNotifierProvider);
  }
}

/// Provider for support message actions
final supportMessageActionsProvider =
    NotifierProvider<SupportMessageActionsNotifier, void>(
  SupportMessageActionsNotifier.new,
);

// ==================== Recruiter Management ====================

/// Provider for pending recruiters
final pendingRecruitersProvider =
    FutureProvider<List<RecruiterProfile>>((ref) async {
  final repo = ref.watch(adminRepositoryProvider);
  return repo.getPendingRecruiters();
});

/// Notifier for recruiter actions
class RecruiterActionsNotifier extends Notifier<void> {
  @override
  void build() {}

  /// Approve a recruiter
  Future<bool> approveRecruiter(String recruiterId) async {
    final repo = ref.read(adminRepositoryProvider);
    final success = await repo.approveRecruiter(recruiterId);
    if (success) {
      ref.invalidate(pendingRecruitersProvider);
      ref.invalidate(adminDashboardStatsNotifierProvider);
    }
    return success;
  }

  /// Reject a recruiter
  Future<bool> rejectRecruiter(String recruiterId, {String? reason}) async {
    final repo = ref.read(adminRepositoryProvider);
    final success = await repo.rejectRecruiter(recruiterId, reason: reason);
    if (success) {
      ref.invalidate(pendingRecruitersProvider);
      ref.invalidate(adminDashboardStatsNotifierProvider);
    }
    return success;
  }
}

/// Provider for recruiter actions
final recruiterActionsProvider =
    NotifierProvider<RecruiterActionsNotifier, void>(
  RecruiterActionsNotifier.new,
);

// ==================== School Management ====================

/// Provider for pending schools
final pendingSchoolsProvider = FutureProvider<List<SchoolProfile>>((ref) async {
  final repo = ref.watch(adminRepositoryProvider);
  return repo.getPendingSchools();
});

/// Notifier for school actions
class SchoolActionsNotifier extends Notifier<void> {
  @override
  void build() {}

  /// Approve a school
  Future<bool> approveSchool(String schoolId) async {
    final repo = ref.read(adminRepositoryProvider);
    final success = await repo.approveSchool(schoolId);
    if (success) {
      ref.invalidate(pendingSchoolsProvider);
      ref.invalidate(adminDashboardStatsNotifierProvider);
    }
    return success;
  }

  /// Reject a school
  Future<bool> rejectSchool(String schoolId, {String? reason}) async {
    final repo = ref.read(adminRepositoryProvider);
    final success = await repo.rejectSchool(schoolId, reason: reason);
    if (success) {
      ref.invalidate(pendingSchoolsProvider);
      ref.invalidate(adminDashboardStatsNotifierProvider);
    }
    return success;
  }
}

/// Provider for school actions
final schoolActionsProvider = NotifierProvider<SchoolActionsNotifier, void>(
  SchoolActionsNotifier.new,
);
