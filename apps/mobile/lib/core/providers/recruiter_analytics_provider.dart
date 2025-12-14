import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repositories/recruiter_repository.dart';
import 'auth_provider.dart';

/// Recruiter dashboard analytics data
class RecruiterAnalytics {
  final int totalViews;
  final int interestedCount;
  final int applicationsCount;
  final int messagesCount;
  final double viewsChange;
  final double interestedChange;
  final double applicationsChange;
  final double messagesChange;
  final List<int> monthlyViews;
  final List<EngagementMetric> engagementBreakdown;
  final List<TopJob> topJobs;
  final List<CampaignStat> campaignStats;
  final DateTime? lastUpdated;

  const RecruiterAnalytics({
    this.totalViews = 0,
    this.interestedCount = 0,
    this.applicationsCount = 0,
    this.messagesCount = 0,
    this.viewsChange = 0,
    this.interestedChange = 0,
    this.applicationsChange = 0,
    this.messagesChange = 0,
    this.monthlyViews = const [],
    this.engagementBreakdown = const [],
    this.topJobs = const [],
    this.campaignStats = const [],
    this.lastUpdated,
  });

  bool get hasData =>
      totalViews > 0 ||
      interestedCount > 0 ||
      applicationsCount > 0 ||
      messagesCount > 0 ||
      topJobs.isNotEmpty ||
      campaignStats.isNotEmpty;

  static const empty = RecruiterAnalytics();
}

class EngagementMetric {
  final String label;
  final int value;

  const EngagementMetric({required this.label, required this.value});
}

class TopJob {
  final String id;
  final String title;
  final int views;
  final int applications;

  const TopJob({
    required this.id,
    required this.title,
    required this.views,
    required this.applications,
  });
}

class CampaignStat {
  final String id;
  final String name;
  final int sent;
  final int opened;
  final int responded;
  final bool isActive;

  const CampaignStat({
    required this.id,
    required this.name,
    required this.sent,
    required this.opened,
    required this.responded,
    required this.isActive,
  });

  double get openRate => sent > 0 ? (opened / sent * 100) : 0;
  double get responseRate => sent > 0 ? (responded / sent * 100) : 0;
}

/// Notifier for recruiter analytics
class RecruiterAnalyticsNotifier extends AsyncNotifier<RecruiterAnalytics> {
  @override
  Future<RecruiterAnalytics> build() async {
    // Watch auth state
    final authState = ref.watch(authStateProvider);

    return authState.when(
      data: (auth) async {
        if (auth.user == null || auth.userRole != 'recruiter') {
          return RecruiterAnalytics.empty;
        }
        return _fetchAnalytics();
      },
      loading: () => RecruiterAnalytics.empty,
      error: (_, __) => RecruiterAnalytics.empty,
    );
  }

  Future<RecruiterAnalytics> _fetchAnalytics() async {
    final repo = RecruiterRepository.instance;
    if (!repo.isAvailable || repo.currentUserId == null) {
      return RecruiterAnalytics.empty;
    }

    try {
      // Get recruiter profile ID
      final recruiterProfile = await repo.table('recruiter_profiles')
          .select('id')
          .eq('user_id', repo.currentUserId!)
          .maybeSingle();

      if (recruiterProfile == null) return RecruiterAnalytics.empty;

      final recruiterId = recruiterProfile['id'] as String;

      // Fetch data in parallel for better performance
      final results = await Future.wait([
        _fetchOverviewMetrics(repo, recruiterId),
        _fetchTopJobs(repo, recruiterId),
        _fetchCampaignStats(repo, recruiterId),
        _fetchMonthlyViews(repo),
      ]);

      final overview = results[0] as Map<String, dynamic>;
      final topJobs = results[1] as List<TopJob>;
      final campaignStats = results[2] as List<CampaignStat>;
      final monthlyViews = results[3] as List<int>;

      return RecruiterAnalytics(
        totalViews: overview['totalViews'] ?? 0,
        interestedCount: overview['interestedCount'] ?? 0,
        applicationsCount: overview['applicationsCount'] ?? 0,
        messagesCount: overview['messagesCount'] ?? 0,
        viewsChange: overview['viewsChange'] ?? 0.0,
        interestedChange: overview['interestedChange'] ?? 0.0,
        applicationsChange: overview['applicationsChange'] ?? 0.0,
        messagesChange: overview['messagesChange'] ?? 0.0,
        monthlyViews: monthlyViews,
        engagementBreakdown: _buildEngagementBreakdown(overview),
        topJobs: topJobs,
        campaignStats: campaignStats,
        lastUpdated: DateTime.now(),
      );
    } catch (e) {
      // Return empty on error - sample data will show
      return RecruiterAnalytics.empty;
    }
  }

  Future<Map<String, dynamic>> _fetchOverviewMetrics(
    RecruiterRepository repo,
    String recruiterId,
  ) async {
    // Get total views from job listings
    final jobsResponse = await repo.table('job_listings')
        .select('view_count, application_count')
        .eq('posted_by', recruiterId);

    int totalViews = 0;
    int totalApplications = 0;
    for (final job in jobsResponse as List) {
      totalViews += (job['view_count'] as int?) ?? 0;
      totalApplications += (job['application_count'] as int?) ?? 0;
    }

    // Get bookmarked candidates count (interested)
    final bookmarkedResponse = await repo.table('bookmarked_candidates')
        .select('id')
        .eq('recruiter_id', recruiterId);
    final interestedCount = (bookmarkedResponse as List).length;

    // Get messages count (conversations where recruiter is a participant)
    final conversationsResponse = await repo.table('conversation_participants')
        .select('conversation_id')
        .eq('user_id', repo.currentUserId!);
    final messagesCount = (conversationsResponse as List).length;

    // Get profile views from analytics_events
    final profileViewsResponse = await repo.table('analytics_events')
        .select('id')
        .eq('user_id', repo.currentUserId!)
        .eq('event_type', 'profile_view');
    final profileViews = (profileViewsResponse as List).length;

    // Use profile views if higher than job views
    final finalViews = profileViews > totalViews ? profileViews : totalViews;

    return {
      'totalViews': finalViews,
      'interestedCount': interestedCount,
      'applicationsCount': totalApplications,
      'messagesCount': messagesCount,
      'profileViews': profileViews,
      'resumeDownloads': 0, // Would need separate tracking
      'savedProfiles': interestedCount,
      // Change percentages would require historical data comparison
      'viewsChange': 0.0,
      'interestedChange': 0.0,
      'applicationsChange': 0.0,
      'messagesChange': 0.0,
    };
  }

  List<EngagementMetric> _buildEngagementBreakdown(Map<String, dynamic> overview) {
    final metrics = <EngagementMetric>[];

    final profileViews = overview['profileViews'] as int? ?? 0;
    final savedProfiles = overview['savedProfiles'] as int? ?? 0;
    final messagesCount = overview['messagesCount'] as int? ?? 0;

    if (profileViews > 0) {
      metrics.add(EngagementMetric(label: 'Profile Views', value: profileViews));
    }
    if (savedProfiles > 0) {
      metrics.add(EngagementMetric(label: 'Saved Profiles', value: savedProfiles));
    }
    if (messagesCount > 0) {
      metrics.add(EngagementMetric(label: 'Messages Sent', value: messagesCount));
    }

    return metrics;
  }

  Future<List<TopJob>> _fetchTopJobs(
    RecruiterRepository repo,
    String recruiterId,
  ) async {
    final response = await repo.table('job_listings')
        .select('id, title, view_count, application_count')
        .eq('posted_by', recruiterId)
        .order('view_count', ascending: false)
        .limit(5);

    return (response as List).map((job) => TopJob(
      id: job['id'] as String,
      title: job['title'] as String,
      views: (job['view_count'] as int?) ?? 0,
      applications: (job['application_count'] as int?) ?? 0,
    )).where((job) => job.views > 0 || job.applications > 0).toList();
  }

  Future<List<CampaignStat>> _fetchCampaignStats(
    RecruiterRepository repo,
    String recruiterId,
  ) async {
    // Query the campaign_stats view
    final response = await repo.table('campaign_stats')
        .select()
        .order('sent_at', ascending: false)
        .limit(5);

    return (response as List).map((campaign) => CampaignStat(
      id: campaign['campaign_id'] as String,
      name: campaign['name'] as String,
      sent: (campaign['sent_count'] as int?) ?? 0,
      opened: (campaign['opened_count'] as int?) ?? 0,
      responded: (campaign['replied_count'] as int?) ?? 0,
      isActive: campaign['status'] == 'sent' || campaign['status'] == 'sending',
    )).where((c) => c.sent > 0).toList();
  }

  Future<List<int>> _fetchMonthlyViews(RecruiterRepository repo) async {
    // Get profile views grouped by month for the current year
    final now = DateTime.now();
    final startOfYear = DateTime(now.year, 1, 1);

    final response = await repo.table('analytics_events')
        .select('created_at')
        .eq('user_id', repo.currentUserId!)
        .eq('event_type', 'profile_view')
        .gte('created_at', startOfYear.toIso8601String());

    // Group by month
    final monthlyData = List<int>.filled(12, 0);
    for (final event in response as List) {
      final createdAt = DateTime.parse(event['created_at'] as String);
      final monthIndex = createdAt.month - 1;
      monthlyData[monthIndex]++;
    }

    // Return only months up to current month
    return monthlyData.sublist(0, now.month);
  }

  /// Refresh analytics data
  Future<void> refresh() async {
    state = const AsyncLoading();
    state = AsyncData(await _fetchAnalytics());
  }
}

/// Provider for recruiter analytics
final recruiterAnalyticsProvider =
    AsyncNotifierProvider<RecruiterAnalyticsNotifier, RecruiterAnalytics>(
  RecruiterAnalyticsNotifier.new,
);
