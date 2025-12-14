import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repositories/profile_repository.dart';
import 'auth_provider.dart';

/// Profile viewer from a recruiter/firm
class ProfileViewer {
  final String firmName;
  final DateTime viewedAt;
  final int viewCount;

  const ProfileViewer({
    required this.firmName,
    required this.viewedAt,
    required this.viewCount,
  });
}

/// Candidate dashboard analytics data
class CandidateAnalytics {
  final int totalViews;
  final int monthlyViews;
  final int weeklyViews;
  final int uniqueFirms;
  final int applicationsCount;
  final int savedByRecruiters;
  final int messagesCount;
  final double viewsChange;
  final List<int> weeklyViewsData;
  final List<ProfileViewer> recentViewers;
  final DateTime? lastUpdated;

  const CandidateAnalytics({
    this.totalViews = 0,
    this.monthlyViews = 0,
    this.weeklyViews = 0,
    this.uniqueFirms = 0,
    this.applicationsCount = 0,
    this.savedByRecruiters = 0,
    this.messagesCount = 0,
    this.viewsChange = 0,
    this.weeklyViewsData = const [],
    this.recentViewers = const [],
    this.lastUpdated,
  });

  bool get hasData =>
      totalViews > 0 ||
      applicationsCount > 0 ||
      messagesCount > 0 ||
      recentViewers.isNotEmpty;

  static const empty = CandidateAnalytics();
}

/// Notifier for candidate analytics
class CandidateAnalyticsNotifier extends AsyncNotifier<CandidateAnalytics> {
  @override
  Future<CandidateAnalytics> build() async {
    // Watch auth state
    final authState = ref.watch(authStateProvider);

    return authState.when(
      data: (auth) async {
        if (auth.user == null || auth.userRole != 'candidate') {
          return CandidateAnalytics.empty;
        }
        return _fetchAnalytics();
      },
      loading: () => CandidateAnalytics.empty,
      error: (_, __) => CandidateAnalytics.empty,
    );
  }

  Future<CandidateAnalytics> _fetchAnalytics() async {
    final repo = ProfileRepository.instance;
    if (!repo.isAvailable || repo.currentUserId == null) {
      return CandidateAnalytics.empty;
    }

    try {
      // Fetch data in parallel for better performance
      final results = await Future.wait([
        _fetchProfileViews(repo),
        _fetchApplicationsCount(repo),
        _fetchSavedByRecruiters(repo),
        _fetchMessagesCount(repo),
        _fetchWeeklyViewsData(repo),
      ]);

      final viewsData = results[0] as Map<String, dynamic>;
      final applicationsCount = results[1] as int;
      final savedByRecruiters = results[2] as int;
      final messagesCount = results[3] as int;
      final weeklyViewsData = results[4] as List<int>;

      return CandidateAnalytics(
        totalViews: viewsData['totalViews'] ?? 0,
        monthlyViews: viewsData['monthlyViews'] ?? 0,
        weeklyViews: viewsData['weeklyViews'] ?? 0,
        uniqueFirms: viewsData['uniqueFirms'] ?? 0,
        viewsChange: viewsData['viewsChange'] ?? 0.0,
        recentViewers: viewsData['recentViewers'] ?? [],
        applicationsCount: applicationsCount,
        savedByRecruiters: savedByRecruiters,
        messagesCount: messagesCount,
        weeklyViewsData: weeklyViewsData,
        lastUpdated: DateTime.now(),
      );
    } catch (e) {
      // Return empty on error
      return CandidateAnalytics.empty;
    }
  }

  Future<Map<String, dynamic>> _fetchProfileViews(
    ProfileRepository repo,
  ) async {
    final now = DateTime.now();
    final oneMonthAgo = now.subtract(const Duration(days: 30));
    final oneWeekAgo = now.subtract(const Duration(days: 7));
    final twoWeeksAgo = now.subtract(const Duration(days: 14));

    // Fetch all profile view events targeting this candidate
    final viewEvents = await repo.table('analytics_events')
        .select('metadata, created_at')
        .eq('target_id', repo.currentUserId!)
        .eq('event_type', 'profile_view')
        .order('created_at', ascending: false);

    final events = viewEvents as List;

    // Calculate metrics
    int totalViews = events.length;
    int monthlyViews = 0;
    int weeklyViews = 0;
    int previousWeekViews = 0;
    final firmViewCounts = <String, int>{};
    final firmLastViewed = <String, DateTime>{};

    for (final event in events) {
      final createdAt = DateTime.parse(event['created_at'] as String);
      final metadata = event['metadata'] as Map<String, dynamic>?;
      final firmName = metadata?['recruiter_firm'] as String? ?? 'Unknown Firm';

      // Count monthly views
      if (createdAt.isAfter(oneMonthAgo)) {
        monthlyViews++;
      }

      // Count weekly views
      if (createdAt.isAfter(oneWeekAgo)) {
        weeklyViews++;
      }

      // Count previous week views (for change calculation)
      if (createdAt.isAfter(twoWeeksAgo) && createdAt.isBefore(oneWeekAgo)) {
        previousWeekViews++;
      }

      // Track unique firms and their view counts
      firmViewCounts[firmName] = (firmViewCounts[firmName] ?? 0) + 1;
      if (!firmLastViewed.containsKey(firmName) ||
          createdAt.isAfter(firmLastViewed[firmName]!)) {
        firmLastViewed[firmName] = createdAt;
      }
    }

    // Calculate views change percentage
    double viewsChange = 0;
    if (previousWeekViews > 0) {
      viewsChange = ((weeklyViews - previousWeekViews) / previousWeekViews * 100);
    } else if (weeklyViews > 0) {
      viewsChange = 100; // New views this week
    }

    // Build recent viewers list (sorted by most recent)
    final recentViewers = firmViewCounts.entries.map((entry) {
      return ProfileViewer(
        firmName: entry.key,
        viewedAt: firmLastViewed[entry.key]!,
        viewCount: entry.value,
      );
    }).toList();

    // Sort by most recent view
    recentViewers.sort((a, b) => b.viewedAt.compareTo(a.viewedAt));

    return {
      'totalViews': totalViews,
      'monthlyViews': monthlyViews,
      'weeklyViews': weeklyViews,
      'uniqueFirms': firmViewCounts.length,
      'viewsChange': viewsChange,
      'recentViewers': recentViewers.take(10).toList(), // Top 10 recent viewers
    };
  }

  Future<int> _fetchApplicationsCount(ProfileRepository repo) async {
    final response = await repo.table('applications')
        .select('id')
        .eq('candidate_id', repo.currentUserId!);
    return (response as List).length;
  }

  Future<int> _fetchSavedByRecruiters(ProfileRepository repo) async {
    // Get candidate profile ID first
    final candidateProfile = await repo.table('candidate_profiles')
        .select('id')
        .eq('user_id', repo.currentUserId!)
        .maybeSingle();

    if (candidateProfile == null) return 0;

    final response = await repo.table('bookmarked_candidates')
        .select('id')
        .eq('candidate_id', candidateProfile['id']);
    return (response as List).length;
  }

  Future<int> _fetchMessagesCount(ProfileRepository repo) async {
    // Count conversations where user is a participant
    final response = await repo.table('conversation_participants')
        .select('conversation_id')
        .eq('user_id', repo.currentUserId!);
    return (response as List).length;
  }

  Future<List<int>> _fetchWeeklyViewsData(ProfileRepository repo) async {
    // Get profile views for the last 8 weeks
    final now = DateTime.now();
    final eightWeeksAgo = now.subtract(const Duration(days: 56));

    final response = await repo.table('analytics_events')
        .select('created_at')
        .eq('target_id', repo.currentUserId!)
        .eq('event_type', 'profile_view')
        .gte('created_at', eightWeeksAgo.toIso8601String());

    // Group by week
    final weeklyData = List<int>.filled(8, 0);
    for (final event in response as List) {
      final createdAt = DateTime.parse(event['created_at'] as String);
      final weeksAgo = now.difference(createdAt).inDays ~/ 7;
      if (weeksAgo < 8) {
        weeklyData[7 - weeksAgo]++; // Index 0 is oldest, 7 is current week
      }
    }

    return weeklyData;
  }

  /// Refresh analytics data
  Future<void> refresh() async {
    state = const AsyncLoading();
    state = AsyncData(await _fetchAnalytics());
  }
}

/// Provider for candidate analytics
final candidateAnalyticsProvider =
    AsyncNotifierProvider<CandidateAnalyticsNotifier, CandidateAnalytics>(
  CandidateAnalyticsNotifier.new,
);
