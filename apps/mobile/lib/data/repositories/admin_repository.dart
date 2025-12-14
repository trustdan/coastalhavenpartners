import 'package:flutter/foundation.dart';
import '../models/enums.dart';
import '../models/profile.dart';
import '../models/support_message.dart';
import 'base_repository.dart';

/// Repository for admin-related data operations
class AdminRepository extends BaseRepository {
  AdminRepository._();
  static AdminRepository? _instance;
  static AdminRepository get instance => _instance ??= AdminRepository._();

  // ==================== Dashboard Stats ====================

  /// Fetch dashboard statistics for admin overview
  Future<AdminDashboardStats> getDashboardStats() async {
    if (!isAvailable) {
      return const AdminDashboardStats();
    }

    try {
      // Run all count queries in parallel
      final results = await Future.wait([
        // Pending candidate verifications
        table('candidate_profiles')
            .select()
            .eq('status', CandidateStatus.pendingVerification.value)
            .count(),
        // Verified today (candidates)
        table('candidate_profiles')
            .select()
            .eq('status', CandidateStatus.verified.value)
            .gte('updated_at', _todayStart.toIso8601String())
            .count(),
        // Open support tickets
        table('support_messages')
            .select()
            .inFilter('status', ['new', 'in_progress']).count(),
        // Total users
        table('profiles').select().count(),
        // Pending recruiters
        table('recruiter_profiles')
            .select()
            .eq('is_approved', false)
            .eq('is_rejected', false)
            .count(),
        // Pending schools
        table('school_profiles')
            .select()
            .eq('is_approved', false)
            .eq('is_rejected', false)
            .count(),
      ]);

      return AdminDashboardStats(
        pendingVerifications: results[0].count,
        verifiedToday: results[1].count,
        openTickets: results[2].count,
        totalUsers: results[3].count,
        pendingRecruiters: results[4].count,
        pendingSchools: results[5].count,
        lastUpdated: DateTime.now(),
      );
    } catch (e) {
      debugPrint('Error fetching dashboard stats: $e');
      return const AdminDashboardStats();
    }
  }

  /// Get the start of today in UTC
  DateTime get _todayStart {
    final now = DateTime.now().toUtc();
    return DateTime.utc(now.year, now.month, now.day);
  }

  // ==================== Candidate Verification ====================

  /// Fetch candidates by verification status with joined profile data
  Future<List<CandidateProfile>> getCandidatesByStatus(
    CandidateStatus status, {
    int limit = 50,
    int offset = 0,
  }) async {
    if (!isAvailable) return [];

    try {
      final response = await table('candidate_profiles')
          .select('*, profiles!inner(*)')
          .eq('status', status.value)
          .order('created_at', ascending: false)
          .range(offset, offset + limit - 1);

      return (response as List)
          .map((json) =>
              CandidateProfile.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      debugPrint('Error fetching candidates by status: $e');
      return [];
    }
  }

  /// Approve a candidate (set status to verified)
  Future<bool> approveCandidate(String candidateId) async {
    if (!isAvailable) return false;

    try {
      await table('candidate_profiles').update({
        'status': CandidateStatus.verified.value,
        'updated_at': DateTime.now().toIso8601String(),
      }).eq('id', candidateId);
      return true;
    } catch (e) {
      debugPrint('Error approving candidate: $e');
      return false;
    }
  }

  /// Reject a candidate
  Future<bool> rejectCandidate(String candidateId, {String? reason}) async {
    if (!isAvailable) return false;

    try {
      await table('candidate_profiles').update({
        'status': CandidateStatus.rejected.value,
        'is_rejected': true,
        'updated_at': DateTime.now().toIso8601String(),
      }).eq('id', candidateId);
      return true;
    } catch (e) {
      debugPrint('Error rejecting candidate: $e');
      return false;
    }
  }

  // ==================== Candidate Management ====================

  /// Search candidates by name or email
  Future<List<CandidateProfile>> searchCandidates(
    String query, {
    int limit = 50,
    CandidateStatus? statusFilter,
  }) async {
    if (!isAvailable) return [];

    try {
      var request =
          table('candidate_profiles').select('*, profiles!inner(*)');

      // Search by name or email in profiles
      if (query.isNotEmpty) {
        request = request.or(
          'profiles.full_name.ilike.%$query%,profiles.email.ilike.%$query%',
        );
      }

      if (statusFilter != null) {
        request = request.eq('status', statusFilter.value);
      }

      final response =
          await request.order('created_at', ascending: false).limit(limit);

      return (response as List)
          .map((json) =>
              CandidateProfile.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      debugPrint('Error searching candidates: $e');
      return [];
    }
  }

  /// Get all candidates for management list
  Future<List<CandidateProfile>> getAllCandidates({
    int limit = 100,
    int offset = 0,
  }) async {
    if (!isAvailable) return [];

    try {
      final response = await table('candidate_profiles')
          .select('*, profiles!inner(*)')
          .order('created_at', ascending: false)
          .range(offset, offset + limit - 1);

      return (response as List)
          .map((json) =>
              CandidateProfile.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      debugPrint('Error fetching all candidates: $e');
      return [];
    }
  }

  // ==================== Support Messages ====================

  /// Fetch support messages by status
  Future<List<SupportMessage>> getSupportMessagesByStatus(
    SupportMessageStatus status, {
    int limit = 50,
    int offset = 0,
  }) async {
    if (!isAvailable) return [];

    try {
      final response = await table('support_messages')
          .select()
          .eq('status', status.value)
          .neq('status', 'spam') // Never show spam
          .order('created_at', ascending: false)
          .range(offset, offset + limit - 1);

      return (response as List)
          .map(
              (json) => SupportMessage.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      debugPrint('Error fetching support messages: $e');
      return [];
    }
  }

  /// Get open support messages (new + in_progress)
  Future<List<SupportMessage>> getOpenSupportMessages({
    int limit = 50,
  }) async {
    if (!isAvailable) return [];

    try {
      final response = await table('support_messages')
          .select()
          .inFilter('status', ['new', 'in_progress'])
          .order('created_at', ascending: false)
          .limit(limit);

      return (response as List)
          .map(
              (json) => SupportMessage.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      debugPrint('Error fetching open support messages: $e');
      return [];
    }
  }

  /// Update support message status
  Future<bool> updateSupportMessageStatus(
    String messageId,
    SupportMessageStatus newStatus, {
    String? adminNotes,
  }) async {
    if (!isAvailable) return false;

    try {
      final updates = <String, dynamic>{
        'status': newStatus.value,
      };

      if (newStatus == SupportMessageStatus.inProgress ||
          newStatus == SupportMessageStatus.resolved) {
        updates['handled_by'] = currentUserId;
        updates['handled_at'] = DateTime.now().toIso8601String();
      }

      if (adminNotes != null) {
        updates['admin_notes'] = adminNotes;
      }

      await table('support_messages').update(updates).eq('id', messageId);
      return true;
    } catch (e) {
      debugPrint('Error updating support message status: $e');
      return false;
    }
  }

  /// Get a single support message by ID
  Future<SupportMessage?> getSupportMessage(String messageId) async {
    if (!isAvailable) return null;

    try {
      final response = await table('support_messages')
          .select()
          .eq('id', messageId)
          .single();

      return SupportMessage.fromJson(response);
    } catch (e) {
      debugPrint('Error fetching support message: $e');
      return null;
    }
  }

  // ==================== Recruiter Management ====================

  /// Get pending recruiters awaiting approval
  Future<List<RecruiterProfile>> getPendingRecruiters({
    int limit = 50,
  }) async {
    if (!isAvailable) return [];

    try {
      final response = await table('recruiter_profiles')
          .select('*, profiles!inner(*)')
          .eq('is_approved', false)
          .eq('is_rejected', false)
          .order('created_at', ascending: false)
          .limit(limit);

      return (response as List)
          .map((json) =>
              RecruiterProfile.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      debugPrint('Error fetching pending recruiters: $e');
      return [];
    }
  }

  /// Approve a recruiter
  Future<bool> approveRecruiter(String recruiterId) async {
    if (!isAvailable) return false;

    try {
      await table('recruiter_profiles').update({
        'is_approved': true,
        'approved_at': DateTime.now().toIso8601String(),
      }).eq('id', recruiterId);
      return true;
    } catch (e) {
      debugPrint('Error approving recruiter: $e');
      return false;
    }
  }

  /// Reject a recruiter
  Future<bool> rejectRecruiter(String recruiterId, {String? reason}) async {
    if (!isAvailable) return false;

    try {
      await table('recruiter_profiles').update({
        'is_rejected': true,
        if (reason != null) 'verification_notes': reason,
      }).eq('id', recruiterId);
      return true;
    } catch (e) {
      debugPrint('Error rejecting recruiter: $e');
      return false;
    }
  }

  // ==================== School Management ====================

  /// Get pending schools awaiting approval
  Future<List<SchoolProfile>> getPendingSchools({
    int limit = 50,
  }) async {
    if (!isAvailable) return [];

    try {
      final response = await table('school_profiles')
          .select('*, profiles!inner(*)')
          .eq('is_approved', false)
          .eq('is_rejected', false)
          .order('created_at', ascending: false)
          .limit(limit);

      return (response as List)
          .map(
              (json) => SchoolProfile.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      debugPrint('Error fetching pending schools: $e');
      return [];
    }
  }

  /// Approve a school
  Future<bool> approveSchool(String schoolId) async {
    if (!isAvailable) return false;

    try {
      await table('school_profiles').update({
        'is_approved': true,
        'approved_at': DateTime.now().toIso8601String(),
      }).eq('id', schoolId);
      return true;
    } catch (e) {
      debugPrint('Error approving school: $e');
      return false;
    }
  }

  /// Reject a school
  Future<bool> rejectSchool(String schoolId, {String? reason}) async {
    if (!isAvailable) return false;

    try {
      await table('school_profiles').update({
        'is_rejected': true,
        if (reason != null) 'verification_notes': reason,
      }).eq('id', schoolId);
      return true;
    } catch (e) {
      debugPrint('Error rejecting school: $e');
      return false;
    }
  }
}
