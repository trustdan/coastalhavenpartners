import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/router/app_router.dart';
import '../../../core/providers/profile_provider.dart';
import '../../../core/providers/recruiter_provider.dart';
import '../../../data/models/models.dart';
import '../../../widgets/magic_ui/magic_ui.dart';
import '../widgets/verification_status_card.dart';

/// Recruiter Dashboard - Main home screen for recruiters
/// Shows recommended candidates, saved searches, recent activity, and interested candidates
class RecruiterDashboard extends ConsumerWidget {
  const RecruiterDashboard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final profileAsync = ref.watch(currentProfileProvider);
    final bookmarkedAsync = ref.watch(bookmarkedCandidatesProvider);
    final savedSearchesAsync = ref.watch(savedSearchesProvider);
    final campaignsAsync = ref.watch(campaignsProvider);

    // Search for recommended candidates (top candidates)
    final recommendedAsync = ref.watch(
      candidateSearchProvider(const CandidateSearchFilters(minGpa: 3.5)),
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              // TODO: Navigate to notifications
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(bookmarkedCandidatesProvider);
          ref.invalidate(savedSearchesProvider);
          ref.invalidate(campaignsProvider);
          ref.invalidate(candidateSearchProvider(const CandidateSearchFilters(minGpa: 3.5)));
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: AppSpacing.screenPadding,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Greeting
              _buildGreeting(context, profileAsync),
              AppSpacing.subsectionGap,

              // Verification Status (shown if not verified)
              const VerificationStatusCard(),
              AppSpacing.subsectionGap,

              // Quick Stats Row
              _buildQuickStats(context, isDark, bookmarkedAsync, campaignsAsync),
              AppSpacing.subsectionGap,

              // Recommended Candidates
              _buildRecommendedCandidates(context, isDark, recommendedAsync),
              AppSpacing.subsectionGap,

              // Saved Searches
              _buildSavedSearches(context, isDark, savedSearchesAsync),
              AppSpacing.subsectionGap,

              // Candidates Interested in Your Firm
              _buildInterestedCandidates(context, isDark),
              AppSpacing.subsectionGap,

              // Recent Activity
              _buildRecentActivity(context, isDark),
              AppSpacing.sectionGap,
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGreeting(BuildContext context, AsyncValue<Profile?> profileAsync) {
    final hour = DateTime.now().hour;
    String greeting;
    if (hour < 12) {
      greeting = 'Good morning';
    } else if (hour < 17) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }

    String firstName = 'there';
    profileAsync.whenData((profile) {
      if (profile != null) {
        firstName = profile.fullName.split(' ').first;
      }
    });

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          greeting,
          style: AppTextStyles.bodyMedium.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          firstName,
          style: AppTextStyles.h2,
        ),
      ],
    );
  }

  Widget _buildQuickStats(
    BuildContext context,
    bool isDark,
    AsyncValue<List<BookmarkedCandidate>> bookmarkedAsync,
    AsyncValue<List<RecruiterCampaign>> campaignsAsync,
  ) {
    int savedCount = 0;
    int campaignCount = 0;
    bookmarkedAsync.whenData((bookmarks) => savedCount = bookmarks.length);
    campaignsAsync.whenData((campaigns) => campaignCount = campaigns.length);

    return Row(
      children: [
        Expanded(
          child: _buildStatCard(
            context,
            isDark,
            icon: Icons.visibility_outlined,
            value: 0, // TODO: Track profile views
            label: 'Profiles Viewed',
            color: AppColors.teal,
          ),
        ),
        AppSpacing.hGapMd,
        Expanded(
          child: _buildStatCard(
            context,
            isDark,
            icon: Icons.bookmark_outlined,
            value: savedCount,
            label: 'Saved',
            color: AppColors.emerald,
          ),
        ),
        AppSpacing.hGapMd,
        Expanded(
          child: _buildStatCard(
            context,
            isDark,
            icon: Icons.campaign_outlined,
            value: campaignCount,
            label: 'Campaigns',
            color: AppColors.green,
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(
    BuildContext context,
    bool isDark, {
    required IconData icon,
    required int value,
    required String label,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: AppRadius.card,
        border: Border.all(
          color: isDark ? AppColors.borderDark : AppColors.borderLight,
        ),
      ),
      child: Column(
        children: [
          Icon(icon, size: 20, color: color),
          const SizedBox(height: 8),
          NumberTicker(
            value: value,
            style: AppTextStyles.h4,
            useGradient: true,
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: AppTextStyles.caption.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildRecommendedCandidates(
    BuildContext context,
    bool isDark,
    AsyncValue<List<CandidateProfile>> recommendedAsync,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Text('Recommended', style: AppTextStyles.h4),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.teal.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    'AI',
                    style: AppTextStyles.badge.copyWith(color: AppColors.teal),
                  ),
                ),
              ],
            ),
            TextButton(
              onPressed: () => context.go(AppRoutes.recruiterCandidates),
              child: const Text('See all'),
            ),
          ],
        ),
        AppSpacing.itemGap,
        recommendedAsync.when(
          data: (candidates) {
            if (candidates.isEmpty) {
              return Container(
                height: 180,
                alignment: Alignment.center,
                child: Text(
                  'No candidates found.\nAdjust your search criteria.',
                  textAlign: TextAlign.center,
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
              );
            }
            return SizedBox(
              height: 180,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: candidates.take(5).length,
                separatorBuilder: (_, __) => const SizedBox(width: 12),
                itemBuilder: (context, index) {
                  return _buildRecommendedCard(context, isDark, candidates[index]);
                },
              ),
            );
          },
          loading: () => const SizedBox(
            height: 180,
            child: Center(child: CircularProgressIndicator()),
          ),
          error: (e, _) => Container(
            height: 180,
            alignment: Alignment.center,
            child: Text(
              'Error loading candidates',
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.error,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRecommendedCard(
    BuildContext context,
    bool isDark,
    CandidateProfile candidate,
  ) {
    // Calculate a match score based on profile completeness
    final matchScore = candidate.completionPercentage;
    final initials = candidate.profile?.fullName.split(' ').map((e) => e.isNotEmpty ? e[0] : '').join() ?? '?';

    return GestureDetector(
      onTap: () => context.push('/recruiter/candidates/${candidate.id}'),
      child: Container(
        width: 200,
        padding: AppSpacing.cardPadding,
        decoration: BoxDecoration(
          color: isDark ? AppColors.cardDark : AppColors.cardLight,
          borderRadius: AppRadius.card,
          border: Border.all(
            color: isDark ? AppColors.borderDark : AppColors.borderLight,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Match score badge
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundColor: AppColors.teal.withValues(alpha: 0.1),
                  child: Text(
                    initials,
                    style: AppTextStyles.labelMedium.copyWith(
                      color: AppColors.teal,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _getMatchColor(matchScore).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '$matchScore%',
                    style: AppTextStyles.badge.copyWith(
                      color: _getMatchColor(matchScore),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              candidate.profile?.fullName ?? 'Unknown',
              style: AppTextStyles.labelMedium,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
            Text(
              candidate.schoolName,
              style: AppTextStyles.caption.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),
            Text(
              '${candidate.major} • GPA ${candidate.gpa.toStringAsFixed(2)}',
              style: AppTextStyles.caption.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const Spacer(),
            if (candidate.targetRoles != null && candidate.targetRoles!.isNotEmpty)
              Wrap(
                spacing: 4,
                runSpacing: 4,
                children: candidate.targetRoles!.take(2).map((role) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.borderDark : AppColors.borderLight,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      role.length > 10 ? '${role.substring(0, 8)}...' : role,
                      style: AppTextStyles.badge,
                    ),
                  );
                }).toList(),
              ),
          ],
        ),
      ),
    );
  }

  Color _getMatchColor(int score) {
    if (score >= 90) return AppColors.success;
    if (score >= 75) return AppColors.teal;
    if (score >= 60) return AppColors.warning;
    return AppColors.error;
  }

  Widget _buildSavedSearches(
    BuildContext context,
    bool isDark,
    AsyncValue<List<SavedSearch>> savedSearchesAsync,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Saved Searches', style: AppTextStyles.h4),
            TextButton(
              onPressed: () {
                // TODO: Navigate to manage saved searches
              },
              child: const Text('Manage'),
            ),
          ],
        ),
        AppSpacing.itemGap,
        savedSearchesAsync.when(
          data: (searches) {
            if (searches.isEmpty) {
              return Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.cardDark : AppColors.cardLight,
                  borderRadius: AppRadius.card,
                  border: Border.all(
                    color: isDark ? AppColors.borderDark : AppColors.borderLight,
                  ),
                ),
                child: Row(
                  children: [
                    Icon(Icons.search_off, color: Theme.of(context).colorScheme.onSurfaceVariant),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'No saved searches yet. Save a search from the candidates page!',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }
            return Column(
              children: searches.take(3).map((search) => _buildSavedSearchTile(context, isDark, search)).toList(),
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Text('Error loading searches', style: TextStyle(color: AppColors.error)),
        ),
      ],
    );
  }

  Widget _buildSavedSearchTile(
    BuildContext context,
    bool isDark,
    SavedSearch search,
  ) {
    // Format filters for display
    final filterSummary = _formatFilters(search.filters);

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: AppRadius.card,
        child: InkWell(
          onTap: () {
            // TODO: Apply saved search filters and navigate to candidates
            context.go(AppRoutes.recruiterCandidates);
          },
          borderRadius: AppRadius.card,
          child: Container(
            padding: AppSpacing.listItemPadding,
            decoration: BoxDecoration(
              borderRadius: AppRadius.card,
              border: Border.all(
                color: isDark ? AppColors.borderDark : AppColors.borderLight,
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.emerald.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.search,
                    color: AppColors.emerald,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        search.name,
                        style: AppTextStyles.labelMedium,
                      ),
                      Text(
                        filterSummary,
                        style: AppTextStyles.caption.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                if (search.notifyNewMatches)
                  Icon(Icons.notifications_active, size: 16, color: AppColors.teal),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _formatFilters(Map<String, dynamic> filtersMap) {
    final parts = <String>[];
    try {
      final filters = CandidateSearchFilters.fromJson(filtersMap);
      if (filters.minGpa != null) parts.add('GPA ${filters.minGpa}+');
      if (filters.schools != null && filters.schools!.isNotEmpty) {
        parts.add('${filters.schools!.length} schools');
      }
      if (filters.targetRoles != null && filters.targetRoles!.isNotEmpty) {
        parts.add(filters.targetRoles!.first);
      }
      if (filters.preferredLocations != null && filters.preferredLocations!.isNotEmpty) {
        parts.add(filters.preferredLocations!.first);
      }
    } catch (e) {
      // Fallback to raw map parsing if CandidateSearchFilters.fromJson fails
      if (filtersMap['minGpa'] != null) parts.add('GPA ${filtersMap['minGpa']}+');
      if (filtersMap['schools'] != null) parts.add('${(filtersMap['schools'] as List).length} schools');
    }
    return parts.isEmpty ? 'No filters' : parts.join(', ');
  }

  Widget _buildInterestedCandidates(BuildContext context, bool isDark) {
    // TODO: Implement interested candidates from database
    // This would be candidates who have expressed interest in the recruiter's firm
    return const SizedBox.shrink();
  }

  Widget _buildRecentActivity(BuildContext context, bool isDark) {
    // TODO: Implement recent activity from analytics_events table
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Recent Activity', style: AppTextStyles.h4),
        AppSpacing.itemGap,
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDark ? AppColors.cardDark : AppColors.cardLight,
            borderRadius: AppRadius.card,
            border: Border.all(
              color: isDark ? AppColors.borderDark : AppColors.borderLight,
            ),
          ),
          child: Row(
            children: [
              Icon(Icons.history, color: Theme.of(context).colorScheme.onSurfaceVariant),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Activity tracking coming soon!',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
