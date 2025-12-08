import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/providers/recruiter_provider.dart';
import '../../../data/models/models.dart';
import '../../../data/repositories/repositories.dart';
import '../widgets/candidate_card.dart';
import 'candidate_search_screen.dart';

/// Saved Candidates Screen - View and manage bookmarked candidates
class SavedCandidatesScreen extends ConsumerStatefulWidget {
  const SavedCandidatesScreen({super.key});

  @override
  ConsumerState<SavedCandidatesScreen> createState() => _SavedCandidatesScreenState();
}

class _SavedCandidatesScreenState extends ConsumerState<SavedCandidatesScreen> {
  bool _isSelectionMode = false;
  final Set<String> _selectedIds = {};
  final Map<String, String> _bookmarkIds = {}; // candidateId -> bookmarkId

  void _toggleSelectionMode() {
    setState(() {
      _isSelectionMode = !_isSelectionMode;
      if (!_isSelectionMode) {
        _selectedIds.clear();
      }
    });
  }

  void _toggleSelection(String id) {
    setState(() {
      if (_selectedIds.contains(id)) {
        _selectedIds.remove(id);
      } else {
        _selectedIds.add(id);
      }
    });
  }

  void _selectAll(List<BookmarkedCandidate> bookmarks) {
    setState(() {
      if (_selectedIds.length == bookmarks.length) {
        _selectedIds.clear();
      } else {
        _selectedIds.addAll(bookmarks.map((c) => c.candidateId));
      }
    });
  }

  Future<void> _removeBookmark(String candidateId) async {
    final bookmarkId = _bookmarkIds[candidateId];
    if (bookmarkId == null) return;

    try {
      await RecruiterRepository.instance.removeBookmark(bookmarkId);
      ref.invalidate(bookmarkedCandidatesProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Removed from saved')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  Future<void> _removeSelected() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remove Candidates'),
        content: Text(
          'Remove ${_selectedIds.length} candidate${_selectedIds.length > 1 ? 's' : ''} from saved?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Remove'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      for (final candidateId in _selectedIds) {
        final bookmarkId = _bookmarkIds[candidateId];
        if (bookmarkId != null) {
          await RecruiterRepository.instance.removeBookmark(bookmarkId);
        }
      }
      ref.invalidate(bookmarkedCandidatesProvider);
      setState(() {
        _selectedIds.clear();
        _isSelectionMode = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Candidates removed')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  void _addToCampaign() {
    showModalBottomSheet(
      context: context,
      builder: (context) => _AddToCampaignSheet(
        candidateCount: _selectedIds.length,
        candidateIds: _selectedIds.toList(),
        onComplete: () {
          setState(() {
            _selectedIds.clear();
            _isSelectionMode = false;
          });
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bookmarkedAsync = ref.watch(bookmarkedCandidatesProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(_isSelectionMode
            ? '${_selectedIds.length} selected'
            : 'Saved Candidates'),
        actions: [
          if (_isSelectionMode) ...[
            bookmarkedAsync.whenData((bookmarks) {
              return IconButton(
                icon: Icon(
                  _selectedIds.length == bookmarks.length
                      ? Icons.deselect
                      : Icons.select_all,
                ),
                onPressed: () => _selectAll(bookmarks),
                tooltip: _selectedIds.length == bookmarks.length
                    ? 'Deselect all'
                    : 'Select all',
              );
            }).value ?? const SizedBox.shrink(),
            IconButton(
              icon: const Icon(Icons.close),
              onPressed: _toggleSelectionMode,
            ),
          ] else ...[
            bookmarkedAsync.whenData((bookmarks) {
              return IconButton(
                icon: const Icon(Icons.checklist),
                onPressed: bookmarks.isNotEmpty ? _toggleSelectionMode : null,
                tooltip: 'Select multiple',
              );
            }).value ?? const SizedBox.shrink(),
          ],
        ],
      ),
      body: bookmarkedAsync.when(
        data: (bookmarks) {
          // Build bookmark ID map
          _bookmarkIds.clear();
          for (final bookmark in bookmarks) {
            _bookmarkIds[bookmark.candidateId] = bookmark.id;
          }

          if (bookmarks.isEmpty) {
            return _buildEmptyState(context);
          }

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(bookmarkedCandidatesProvider);
            },
            child: ListView.builder(
              padding: AppSpacing.screenPadding,
              itemCount: bookmarks.length,
              itemBuilder: (context, index) {
                final bookmark = bookmarks[index];
                final isSelected = _selectedIds.contains(bookmark.candidateId);

                // Convert BookmarkedCandidate to CandidateData for the card
                final candidate = bookmark.candidateProfile;
                final candidateData = CandidateData(
                  id: bookmark.candidateId,
                  name: candidate?.profile?.fullName ?? 'Unknown',
                  school: candidate?.schoolName ?? 'Unknown',
                  major: candidate?.major ?? 'Unknown',
                  gpa: candidate?.gpa.toStringAsFixed(2) ?? 'N/A',
                  graduationYear: candidate?.graduationYear.toString() ?? 'N/A',
                  targetRoles: candidate?.targetRoles ?? const [],
                  locations: candidate?.preferredLocations ?? const [],
                  hasResume: candidate?.resumeUrl != null,
                  hasTranscript: candidate?.transcriptUrl != null,
                  isSaved: true,
                  matchScore: candidate?.completionPercentage ?? 0,
                );

                return Stack(
                  children: [
                    CandidateCard(
                      candidate: candidateData,
                      onTap: _isSelectionMode
                          ? () => _toggleSelection(bookmark.candidateId)
                          : () => context.push('/recruiter/candidates/${bookmark.candidateId}'),
                      onSave: () => _removeBookmark(bookmark.candidateId),
                      onMessage: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Message ${candidate?.profile?.fullName ?? "candidate"}')),
                        );
                      },
                    ),
                    if (_isSelectionMode)
                      Positioned(
                        top: 8,
                        left: 8,
                        child: Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppColors.teal
                                : (isDark ? AppColors.cardDark : Colors.white),
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: isSelected
                                  ? AppColors.teal
                                  : (isDark ? AppColors.borderDark : AppColors.borderLight),
                              width: 2,
                            ),
                          ),
                          child: isSelected
                              ? const Icon(Icons.check, size: 16, color: Colors.white)
                              : null,
                        ),
                      ),
                  ],
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
              Text('Error loading saved candidates', style: AppTextStyles.h4),
              const SizedBox(height: 8),
              Text(error.toString(), style: AppTextStyles.bodySmall),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(bookmarkedCandidatesProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: _isSelectionMode && _selectedIds.isNotEmpty
          ? _buildSelectionActions(context, isDark)
          : null,
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Padding(
        padding: AppSpacing.screenPadding,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.bookmark_outline,
              size: 64,
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
            const SizedBox(height: 16),
            Text('No saved candidates', style: AppTextStyles.h4),
            const SizedBox(height: 8),
            Text(
              'Bookmark candidates from search to see them here',
              style: AppTextStyles.bodyMedium.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            OutlinedButton.icon(
              onPressed: () => context.pop(),
              icon: const Icon(Icons.search),
              label: const Text('Search Candidates'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSelectionActions(BuildContext context, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
        border: Border(
          top: BorderSide(color: isDark ? AppColors.borderDark : AppColors.borderLight),
        ),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: _removeSelected,
                icon: const Icon(Icons.delete_outline),
                label: const Text('Remove'),
                style: OutlinedButton.styleFrom(foregroundColor: AppColors.error),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: FilledButton.icon(
                onPressed: _addToCampaign,
                icon: const Icon(Icons.campaign_outlined),
                label: const Text('Add to Campaign'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Bottom sheet for selecting a campaign to add candidates to
class _AddToCampaignSheet extends ConsumerWidget {
  final int candidateCount;
  final List<String> candidateIds;
  final VoidCallback onComplete;

  const _AddToCampaignSheet({
    required this.candidateCount,
    required this.candidateIds,
    required this.onComplete,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final campaignsAsync = ref.watch(campaignsProvider);

    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Add to Campaign', style: AppTextStyles.h4),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          Text(
            '$candidateCount candidate${candidateCount > 1 ? 's' : ''} selected',
            style: AppTextStyles.caption.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 16),
          campaignsAsync.when(
            data: (campaigns) {
              if (campaigns.isEmpty) {
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  child: Text(
                    'No campaigns yet. Create one to add candidates.',
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                );
              }
              return Column(
                children: campaigns.map((campaign) => ListTile(
                  leading: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: AppColors.teal.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.campaign, color: AppColors.teal),
                  ),
                  title: Text(campaign.name),
                  subtitle: Text(campaign.status?.name ?? 'draft'),
                  trailing: const Icon(Icons.add),
                  onTap: () {
                    // TODO: Implement addCampaignRecipient in RecruiterRepository
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          'Adding candidates to campaigns coming soon!',
                        ),
                      ),
                    );
                  },
                )).toList(),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Text('Error loading campaigns: $e'),
          ),
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () {
                Navigator.pop(context);
                context.push('/recruiter/campaigns/new');
              },
              icon: const Icon(Icons.add),
              label: const Text('Create New Campaign'),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}
