import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/providers/recruiter_provider.dart';
import '../../../data/models/models.dart';
import '../../../data/repositories/repositories.dart';
import '../widgets/candidate_card.dart';
import '../widgets/filter_bottom_sheet.dart';

/// Candidate Search Screen - Search and filter candidates
class CandidateSearchScreen extends ConsumerStatefulWidget {
  const CandidateSearchScreen({super.key});

  @override
  ConsumerState<CandidateSearchScreen> createState() => _CandidateSearchScreenState();
}

class _CandidateSearchScreenState extends ConsumerState<CandidateSearchScreen> {
  final _searchController = TextEditingController();
  String _sortBy = 'relevance';
  List<String> _activeFilters = [];
  CandidateSearchFilters _filters = const CandidateSearchFilters();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      builder: (context) => FilterBottomSheet(
        onApply: (filterLabels) {
          setState(() {
            _activeFilters = filterLabels;
            // Parse filter labels to build CandidateSearchFilters
            _filters = _parseFiltersFromLabels(filterLabels);
          });
        },
      ),
    );
  }

  CandidateSearchFilters _parseFiltersFromLabels(List<String> labels) {
    double? minGpa;
    bool hasResume = false;
    bool hasTranscript = false;
    bool hasCalendar = false;
    bool hasBio = false;
    List<String>? schools;
    List<String>? targetRoles;

    for (final label in labels) {
      if (label.startsWith('GPA ')) {
        // Parse GPA range like "GPA 3.5-4.0"
        final gpaMatch = RegExp(r'GPA (\d+\.?\d*)-?').firstMatch(label);
        if (gpaMatch != null) {
          minGpa = double.tryParse(gpaMatch.group(1) ?? '');
        }
      } else if (label == 'Has Resume') {
        hasResume = true;
      } else if (label == 'Has Transcript') {
        hasTranscript = true;
      } else if (label == 'Has Calendar Link') {
        hasCalendar = true;
      } else if (label == 'Has Bio') {
        hasBio = true;
      }
      // Note: Schools and roles from the filter sheet are shown as labels
      // but we'd need to store them separately for accurate filtering
    }

    return CandidateSearchFilters(
      searchQuery: _searchController.text.isEmpty ? null : _searchController.text,
      minGpa: minGpa,
      hasResume: hasResume,
      hasTranscript: hasTranscript,
      hasCalendar: hasCalendar,
      hasBio: hasBio,
      schools: schools,
      targetRoles: targetRoles,
    );
  }

  void _updateSearchQuery(String query) {
    setState(() {
      _filters = _filters.copyWith(
        searchQuery: query.isEmpty ? null : query,
      );
    });
  }

  void _clearFilters() {
    setState(() {
      _activeFilters = [];
      _filters = CandidateSearchFilters(
        searchQuery: _searchController.text.isEmpty ? null : _searchController.text,
      );
    });
  }

  Future<void> _saveSearch() async {
    // Show dialog to name the search
    final name = await showDialog<String>(
      context: context,
      builder: (context) {
        final controller = TextEditingController();
        return AlertDialog(
          title: const Text('Save Search'),
          content: TextField(
            controller: controller,
            decoration: const InputDecoration(
              labelText: 'Search Name',
              hintText: 'e.g., Top MBA Candidates',
            ),
            autofocus: true,
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context, controller.text),
              child: const Text('Save'),
            ),
          ],
        );
      },
    );

    if (name != null && name.isNotEmpty && mounted) {
      try {
        await RecruiterRepository.instance.createSavedSearch(
          name: name,
          filters: _filters,
        );
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Search saved!')),
          );
          // Invalidate saved searches to refresh
          ref.invalidate(savedSearchesProvider);
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error saving search: $e')),
          );
        }
      }
    }
  }

  Future<void> _toggleBookmark(CandidateProfile candidate, bool isCurrentlyBookmarked) async {
    try {
      if (isCurrentlyBookmarked) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Remove bookmark from saved candidates page')),
        );
      } else {
        await RecruiterRepository.instance.bookmarkCandidate(
          candidateProfileId: candidate.id,
        );
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('${candidate.profile?.fullName ?? "Candidate"} saved!')),
          );
          ref.invalidate(bookmarkedCandidatesProvider);
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final candidatesAsync = ref.watch(candidateSearchProvider(_filters));
    final bookmarkedAsync = ref.watch(bookmarkedCandidatesProvider);

    // Get bookmarked candidate IDs for quick lookup
    final bookmarkedIds = <String>{};
    bookmarkedAsync.whenData((bookmarks) {
      for (final b in bookmarks) {
        bookmarkedIds.add(b.candidateId);
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('Candidates'),
        actions: [
          IconButton(
            icon: const Icon(Icons.bookmark_outline),
            onPressed: () {
              context.push('/recruiter/candidates/saved');
            },
            tooltip: 'Saved Candidates',
          ),
        ],
      ),
      body: Column(
        children: [
          // Search bar and filter button
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
              border: Border(
                bottom: BorderSide(
                  color: isDark ? AppColors.borderDark : AppColors.borderLight,
                ),
              ),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        decoration: InputDecoration(
                          hintText: 'Search by name, school, or major...',
                          prefixIcon: const Icon(Icons.search),
                          suffixIcon: _searchController.text.isNotEmpty
                              ? IconButton(
                                  icon: const Icon(Icons.clear),
                                  onPressed: () {
                                    _searchController.clear();
                                    _updateSearchQuery('');
                                  },
                                )
                              : null,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                          filled: true,
                          fillColor: isDark ? AppColors.cardDark : AppColors.cardLight,
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 12,
                          ),
                        ),
                        onChanged: _updateSearchQuery,
                        onSubmitted: _updateSearchQuery,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Badge(
                      isLabelVisible: _activeFilters.isNotEmpty,
                      label: Text('${_activeFilters.length}'),
                      child: IconButton.filled(
                        onPressed: _showFilterSheet,
                        icon: const Icon(Icons.tune),
                        style: IconButton.styleFrom(
                          backgroundColor: AppColors.teal,
                          foregroundColor: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
                if (_activeFilters.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 32,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _activeFilters.length + 1,
                      separatorBuilder: (_, __) => const SizedBox(width: 8),
                      itemBuilder: (context, index) {
                        if (index == _activeFilters.length) {
                          return TextButton.icon(
                            onPressed: _clearFilters,
                            icon: const Icon(Icons.clear_all, size: 16),
                            label: const Text('Clear all'),
                            style: TextButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 8),
                              visualDensity: VisualDensity.compact,
                            ),
                          );
                        }
                        return Chip(
                          label: Text(
                            _activeFilters[index],
                            style: AppTextStyles.badge,
                          ),
                          backgroundColor: AppColors.teal.withValues(alpha: 0.1),
                          side: BorderSide.none,
                          padding: EdgeInsets.zero,
                          labelPadding: const EdgeInsets.symmetric(horizontal: 8),
                          visualDensity: VisualDensity.compact,
                        );
                      },
                    ),
                  ),
                ],
              ],
            ),
          ),

          // Results count and sort
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                candidatesAsync.when(
                  data: (candidates) => Text(
                    '${candidates.length} candidates',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  loading: () => Text(
                    'Loading...',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  error: (_, __) => Text(
                    'Error loading',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.error,
                    ),
                  ),
                ),
                Row(
                  children: [
                    TextButton.icon(
                      onPressed: _saveSearch,
                      icon: const Icon(Icons.save_outlined, size: 18),
                      label: const Text('Save Search'),
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 8),
                        visualDensity: VisualDensity.compact,
                      ),
                    ),
                    PopupMenuButton<String>(
                      initialValue: _sortBy,
                      onSelected: (value) {
                        setState(() {
                          _sortBy = value;
                        });
                      },
                      itemBuilder: (context) => [
                        const PopupMenuItem(
                          value: 'relevance',
                          child: Text('Most Relevant'),
                        ),
                        const PopupMenuItem(
                          value: 'gpa_high',
                          child: Text('Highest GPA'),
                        ),
                        const PopupMenuItem(
                          value: 'recent',
                          child: Text('Recently Active'),
                        ),
                        const PopupMenuItem(
                          value: 'graduation',
                          child: Text('Graduation Year'),
                        ),
                      ],
                      child: Row(
                        children: [
                          Text(
                            _getSortLabel(_sortBy),
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.teal,
                            ),
                          ),
                          const Icon(
                            Icons.arrow_drop_down,
                            color: AppColors.teal,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Candidates list
          Expanded(
            child: candidatesAsync.when(
              data: (candidates) {
                if (candidates.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.search_off,
                          size: 64,
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No candidates found',
                          style: AppTextStyles.h4.copyWith(
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Try adjusting your search filters',
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  );
                }

                // Sort candidates based on selection
                List<CandidateProfile> sortedCandidates = List.from(candidates);
                switch (_sortBy) {
                  case 'gpa_high':
                    sortedCandidates.sort((a, b) => b.gpa.compareTo(a.gpa));
                    break;
                  case 'graduation':
                    sortedCandidates.sort((a, b) => a.graduationYear.compareTo(b.graduationYear));
                    break;
                }

                return RefreshIndicator(
                  onRefresh: () async {
                    ref.invalidate(candidateSearchProvider(_filters));
                  },
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: sortedCandidates.length,
                    itemBuilder: (context, index) {
                      final candidate = sortedCandidates[index];
                      final isSaved = bookmarkedIds.contains(candidate.id);

                      return CandidateCard(
                        candidate: CandidateData(
                          id: candidate.id,
                          name: candidate.profile?.fullName ?? 'Unknown',
                          school: candidate.schoolName,
                          major: candidate.major,
                          gpa: candidate.gpa.toStringAsFixed(2),
                          graduationYear: candidate.graduationYear.toString(),
                          targetRoles: candidate.targetRoles ?? [],
                          locations: candidate.preferredLocations ?? [],
                          hasResume: candidate.resumeUrl != null,
                          hasTranscript: candidate.transcriptUrl != null,
                          isSaved: isSaved,
                          matchScore: candidate.completionPercentage,
                        ),
                        onTap: () {
                          context.push('/recruiter/candidates/${candidate.id}');
                        },
                        onSave: () => _toggleBookmark(candidate, isSaved),
                        onMessage: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Message ${candidate.profile?.fullName ?? "candidate"}')),
                          );
                        },
                      );
                    },
                  ),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, _) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.error_outline, size: 64, color: AppColors.error),
                    const SizedBox(height: 16),
                    Text(
                      'Error loading candidates',
                      style: AppTextStyles.h4.copyWith(color: AppColors.error),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      error.toString(),
                      style: AppTextStyles.bodySmall,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => ref.invalidate(candidateSearchProvider(_filters)),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _getSortLabel(String sortBy) {
    switch (sortBy) {
      case 'relevance':
        return 'Most Relevant';
      case 'gpa_high':
        return 'Highest GPA';
      case 'recent':
        return 'Recently Active';
      case 'graduation':
        return 'Graduation Year';
      default:
        return 'Sort';
    }
  }
}

/// Data class for candidate information (for CandidateCard compatibility)
class CandidateData {
  final String id;
  final String name;
  final String school;
  final String major;
  final String gpa;
  final String graduationYear;
  final List<String> targetRoles;
  final List<String> locations;
  final bool hasResume;
  final bool hasTranscript;
  final bool isSaved;
  final int matchScore;

  CandidateData({
    required this.id,
    required this.name,
    required this.school,
    required this.major,
    required this.gpa,
    required this.graduationYear,
    required this.targetRoles,
    required this.locations,
    required this.hasResume,
    required this.hasTranscript,
    required this.isSaved,
    required this.matchScore,
  });

  CandidateData copyWith({
    String? id,
    String? name,
    String? school,
    String? major,
    String? gpa,
    String? graduationYear,
    List<String>? targetRoles,
    List<String>? locations,
    bool? hasResume,
    bool? hasTranscript,
    bool? isSaved,
    int? matchScore,
  }) {
    return CandidateData(
      id: id ?? this.id,
      name: name ?? this.name,
      school: school ?? this.school,
      major: major ?? this.major,
      gpa: gpa ?? this.gpa,
      graduationYear: graduationYear ?? this.graduationYear,
      targetRoles: targetRoles ?? this.targetRoles,
      locations: locations ?? this.locations,
      hasResume: hasResume ?? this.hasResume,
      hasTranscript: hasTranscript ?? this.hasTranscript,
      isSaved: isSaved ?? this.isSaved,
      matchScore: matchScore ?? this.matchScore,
    );
  }
}
