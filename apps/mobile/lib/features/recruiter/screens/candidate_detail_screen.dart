import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/providers/recruiter_provider.dart';
import '../../../data/models/models.dart';
import '../../../data/repositories/repositories.dart';
import '../../../widgets/magic_ui/magic_ui.dart';

/// Candidate Detail Screen - Full profile view for recruiters
class CandidateDetailScreen extends ConsumerStatefulWidget {
  final String candidateId;

  const CandidateDetailScreen({
    super.key,
    required this.candidateId,
  });

  @override
  ConsumerState<CandidateDetailScreen> createState() => _CandidateDetailScreenState();
}

class _CandidateDetailScreenState extends ConsumerState<CandidateDetailScreen> {
  final _notesController = TextEditingController();
  bool _isLoadingNotes = false;
  String? _currentNoteId;

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _toggleBookmark(CandidateProfile candidate, bool isCurrentlyBookmarked) async {
    try {
      if (isCurrentlyBookmarked) {
        // For now, show a message - we'd need to store bookmark ID for removal
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
          ref.invalidate(isBookmarkedProvider(widget.candidateId));
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

  void _startMessage(CandidateProfile candidate) {
    // TODO: Navigate to conversation with this candidate
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Opening conversation with ${candidate.profile?.fullName}...')),
    );
  }

  Future<void> _openUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not open $url')),
        );
      }
    }
  }

  Future<void> _loadNotes() async {
    final notes = await RecruiterRepository.instance.getCandidateNotes(widget.candidateId);
    if (notes.isNotEmpty && mounted) {
      setState(() {
        _notesController.text = notes.first.content;
        _currentNoteId = notes.first.id;
      });
    }
  }

  Future<void> _saveNotes() async {
    if (_notesController.text.isEmpty) return;

    setState(() => _isLoadingNotes = true);
    try {
      if (_currentNoteId != null) {
        await RecruiterRepository.instance.updateCandidateNote(
          noteId: _currentNoteId!,
          content: _notesController.text,
        );
      } else {
        final note = await RecruiterRepository.instance.addCandidateNote(
          candidateProfileId: widget.candidateId,
          content: _notesController.text,
        );
        if (note != null) {
          _currentNoteId = note.id;
        }
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Notes saved')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error saving notes: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoadingNotes = false);
      }
    }
  }

  @override
  void initState() {
    super.initState();
    _loadNotes();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final candidateAsync = ref.watch(candidateByIdProvider(widget.candidateId));
    final isBookmarkedAsync = ref.watch(isBookmarkedProvider(widget.candidateId));

    return candidateAsync.when(
      data: (candidate) {
        if (candidate == null) {
          return Scaffold(
            appBar: AppBar(),
            body: const Center(child: Text('Candidate not found')),
          );
        }

        bool isSaved = false;
        isBookmarkedAsync.whenData((saved) => isSaved = saved);

        return Scaffold(
          body: CustomScrollView(
            slivers: [
              // App bar with profile background
              SliverAppBar(
                expandedHeight: 200,
                pinned: true,
                flexibleSpace: FlexibleSpaceBar(
                  background: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [AppColors.teal, AppColors.emerald],
                      ),
                    ),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const SizedBox(height: 40),
                          CircleAvatar(
                            radius: 40,
                            backgroundColor: Colors.white,
                            child: Text(
                              _getInitials(candidate.profile?.fullName ?? '?'),
                              style: AppTextStyles.h2.copyWith(color: AppColors.teal),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            candidate.profile?.fullName ?? 'Unknown',
                            style: AppTextStyles.h3.copyWith(color: Colors.white),
                          ),
                          Text(
                            candidate.schoolName,
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: Colors.white.withValues(alpha: 0.9),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                actions: [
                  IconButton(
                    icon: Icon(isSaved ? Icons.bookmark : Icons.bookmark_outline),
                    onPressed: () => _toggleBookmark(candidate, isSaved),
                    color: Colors.white,
                  ),
                  PopupMenuButton(
                    icon: const Icon(Icons.more_vert, color: Colors.white),
                    itemBuilder: (context) => [
                      const PopupMenuItem(
                        value: 'share',
                        child: ListTile(
                          leading: Icon(Icons.share),
                          title: Text('Share Profile'),
                          contentPadding: EdgeInsets.zero,
                        ),
                      ),
                      const PopupMenuItem(
                        value: 'report',
                        child: ListTile(
                          leading: Icon(Icons.flag_outlined),
                          title: Text('Report'),
                          contentPadding: EdgeInsets.zero,
                        ),
                      ),
                    ],
                  ),
                ],
              ),

              // Content
              SliverToBoxAdapter(
                child: Padding(
                  padding: AppSpacing.screenPadding,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Match score and quick actions
                      _buildQuickActions(context, isDark, candidate),
                      AppSpacing.sectionGap,

                      // Education
                      _buildSectionTitle('Education'),
                      AppSpacing.itemGap,
                      _buildEducationCard(context, isDark, candidate),
                      AppSpacing.sectionGap,

                      // Target roles and locations
                      _buildSectionTitle('Career Interests'),
                      AppSpacing.itemGap,
                      _buildInterestsCard(context, isDark, candidate),
                      AppSpacing.sectionGap,

                      // Bio
                      if (candidate.bio != null && candidate.bio!.isNotEmpty) ...[
                        _buildSectionTitle('About'),
                        AppSpacing.itemGap,
                        _buildBioCard(context, isDark, candidate.bio!),
                        AppSpacing.sectionGap,
                      ],

                      // Documents
                      _buildSectionTitle('Documents'),
                      AppSpacing.itemGap,
                      _buildDocumentsCard(context, isDark, candidate),
                      AppSpacing.sectionGap,

                      // Links
                      if (candidate.profile?.linkedinUrl != null || candidate.schedulingUrl != null) ...[
                        _buildSectionTitle('Links'),
                        AppSpacing.itemGap,
                        _buildLinksCard(context, isDark, candidate),
                        AppSpacing.sectionGap,
                      ],

                      // Recruiter Notes (private)
                      _buildSectionTitle('Your Notes'),
                      const SizedBox(height: 4),
                      Text(
                        'Only visible to you',
                        style: AppTextStyles.caption.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                      ),
                      AppSpacing.itemGap,
                      _buildNotesCard(context, isDark),
                      AppSpacing.sectionGap,
                    ],
                  ),
                ),
              ),
            ],
          ),
          bottomNavigationBar: _buildBottomActions(context, isDark, candidate),
        );
      },
      loading: () => Scaffold(
        appBar: AppBar(),
        body: const Center(child: CircularProgressIndicator()),
      ),
      error: (error, _) => Scaffold(
        appBar: AppBar(),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: AppColors.error),
              const SizedBox(height: 16),
              Text('Error loading candidate', style: AppTextStyles.h4),
              const SizedBox(height: 8),
              Text(error.toString(), style: AppTextStyles.bodySmall),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(candidateByIdProvider(widget.candidateId)),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _getInitials(String name) {
    return name.split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join();
  }

  Widget _buildQuickActions(BuildContext context, bool isDark, CandidateProfile candidate) {
    final matchScore = candidate.completionPercentage;
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: _getMatchColor(matchScore).withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Icon(Icons.auto_awesome, color: _getMatchColor(matchScore), size: 20),
              const SizedBox(width: 8),
              Text(
                '$matchScore% Complete',
                style: AppTextStyles.labelMedium.copyWith(
                  color: _getMatchColor(matchScore),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        const Spacer(),
        IconButton.filledTonal(
          onPressed: () => _startMessage(candidate),
          icon: const Icon(Icons.message_outlined),
          tooltip: 'Message',
        ),
        const SizedBox(width: 8),
        if (candidate.schedulingUrl != null)
          IconButton.filledTonal(
            onPressed: () => _openUrl(candidate.schedulingUrl!),
            icon: const Icon(Icons.calendar_today_outlined),
            tooltip: 'Schedule',
          ),
      ],
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(title, style: AppTextStyles.h4);
  }

  Widget _buildEducationCard(BuildContext context, bool isDark, CandidateProfile candidate) {
    return Container(
      padding: AppSpacing.cardPadding,
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: AppRadius.card,
        border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppColors.teal.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.school_outlined, color: AppColors.teal, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(candidate.schoolName, style: AppTextStyles.labelMedium),
                    Text(
                      '${candidate.undergradDegreeType ?? "Bachelor's"} in ${candidate.major}',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        _buildTag('GPA ${candidate.gpa.toStringAsFixed(2)}', isDark),
                        const SizedBox(width: 8),
                        _buildTag('Class of ${candidate.graduationYear}', isDark),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          // Graduate education
          if (candidate.gradSchool != null) ...[
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 16),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.emerald.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.school, color: AppColors.emerald, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(candidate.gradSchool!, style: AppTextStyles.labelMedium),
                      if (candidate.gradMajor != null)
                        Text(
                          candidate.gradMajor!,
                          style: AppTextStyles.bodySmall.copyWith(
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                        ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          if (candidate.gradGpa != null)
                            _buildTag('GPA ${candidate.gradGpa!.toStringAsFixed(2)}', isDark),
                          if (candidate.gradGpa != null) const SizedBox(width: 8),
                          if (candidate.gradGraduationYear != null)
                            _buildTag('Class of ${candidate.gradGraduationYear}', isDark),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildTag(String text, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isDark ? AppColors.borderDark : AppColors.borderLight,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(text, style: AppTextStyles.badge),
    );
  }

  Widget _buildInterestsCard(BuildContext context, bool isDark, CandidateProfile candidate) {
    return Container(
      padding: AppSpacing.cardPadding,
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: AppRadius.card,
        border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (candidate.targetRoles != null && candidate.targetRoles!.isNotEmpty) ...[
            Text(
              'Target Roles',
              style: AppTextStyles.labelSmall.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: candidate.targetRoles!.map((role) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.teal.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(role, style: AppTextStyles.labelSmall.copyWith(color: AppColors.teal)),
                );
              }).toList(),
            ),
          ],
          if (candidate.preferredLocations != null && candidate.preferredLocations!.isNotEmpty) ...[
            const SizedBox(height: 16),
            Text(
              'Preferred Locations',
              style: AppTextStyles.labelSmall.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: candidate.preferredLocations!.map((location) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.emerald.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.location_on_outlined, size: 14, color: AppColors.emerald),
                      const SizedBox(width: 4),
                      Text(location, style: AppTextStyles.labelSmall.copyWith(color: AppColors.emerald)),
                    ],
                  ),
                );
              }).toList(),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildBioCard(BuildContext context, bool isDark, String bio) {
    return Container(
      width: double.infinity,
      padding: AppSpacing.cardPadding,
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: AppRadius.card,
        border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
      ),
      child: Text(bio, style: AppTextStyles.bodyMedium),
    );
  }

  Widget _buildDocumentsCard(BuildContext context, bool isDark, CandidateProfile candidate) {
    return Container(
      padding: AppSpacing.cardPadding,
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: AppRadius.card,
        border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
      ),
      child: Column(
        children: [
          _buildDocumentRow(
            context, isDark,
            icon: Icons.description_outlined,
            title: 'Resume',
            available: candidate.resumeUrl != null,
            onTap: candidate.resumeUrl != null ? () => _openUrl(candidate.resumeUrl!) : null,
          ),
          const SizedBox(height: 12),
          _buildDocumentRow(
            context, isDark,
            icon: Icons.article_outlined,
            title: 'Transcript',
            available: candidate.transcriptUrl != null,
            onTap: candidate.transcriptUrl != null ? () => _openUrl(candidate.transcriptUrl!) : null,
          ),
        ],
      ),
    );
  }

  Widget _buildDocumentRow(BuildContext context, bool isDark, {
    required IconData icon,
    required String title,
    required bool available,
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: available
                    ? AppColors.success.withValues(alpha: 0.1)
                    : (isDark ? AppColors.borderDark : AppColors.borderLight),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                icon,
                size: 18,
                color: available ? AppColors.success : Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(child: Text(title, style: AppTextStyles.labelMedium)),
            if (available)
              const Icon(Icons.open_in_new, size: 18, color: AppColors.teal)
            else
              Text(
                'Not shared',
                style: AppTextStyles.caption.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildLinksCard(BuildContext context, bool isDark, CandidateProfile candidate) {
    return Container(
      padding: AppSpacing.cardPadding,
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: AppRadius.card,
        border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
      ),
      child: Column(
        children: [
          if (candidate.profile?.linkedinUrl != null)
            _buildLinkRow(context, icon: Icons.link, title: 'LinkedIn', url: candidate.profile!.linkedinUrl!),
          if (candidate.profile?.linkedinUrl != null && candidate.schedulingUrl != null)
            const SizedBox(height: 12),
          if (candidate.schedulingUrl != null)
            _buildLinkRow(context, icon: Icons.calendar_today_outlined, title: 'Schedule a Call', url: candidate.schedulingUrl!),
        ],
      ),
    );
  }

  Widget _buildLinkRow(BuildContext context, {required IconData icon, required String title, required String url}) {
    return InkWell(
      onTap: () => _openUrl(url),
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          children: [
            Icon(icon, size: 20, color: AppColors.teal),
            const SizedBox(width: 12),
            Expanded(child: Text(title, style: AppTextStyles.labelMedium)),
            const Icon(Icons.open_in_new, size: 18, color: AppColors.teal),
          ],
        ),
      ),
    );
  }

  Widget _buildNotesCard(BuildContext context, bool isDark) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: AppRadius.card,
        border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
      ),
      child: Column(
        children: [
          TextField(
            controller: _notesController,
            maxLines: 4,
            decoration: InputDecoration(
              hintText: 'Add private notes about this candidate...',
              border: InputBorder.none,
              contentPadding: AppSpacing.cardPadding,
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(right: 8, bottom: 8),
            child: Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: _isLoadingNotes ? null : _saveNotes,
                child: _isLoadingNotes
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text('Save Notes'),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomActions(BuildContext context, bool isDark, CandidateProfile candidate) {
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
            if (candidate.schedulingUrl != null)
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _openUrl(candidate.schedulingUrl!),
                  icon: const Icon(Icons.calendar_today_outlined),
                  label: const Text('Schedule'),
                ),
              ),
            if (candidate.schedulingUrl != null) const SizedBox(width: 12),
            Expanded(
              flex: candidate.schedulingUrl != null ? 2 : 1,
              child: ShimmerButton(
                onPressed: () => _startMessage(candidate),
                text: 'Message',
              ),
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
}
