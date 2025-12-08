import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../screens/candidate_search_screen.dart';

/// Candidate card widget for recruiter search results
class CandidateCard extends StatelessWidget {
  final CandidateData candidate;
  final VoidCallback? onTap;
  final VoidCallback? onSave;
  final VoidCallback? onMessage;

  const CandidateCard({
    super.key,
    required this.candidate,
    this.onTap,
    this.onSave,
    this.onMessage,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: AppRadius.card,
        child: InkWell(
          onTap: onTap,
          borderRadius: AppRadius.card,
          child: Container(
            padding: AppSpacing.cardPadding,
            decoration: BoxDecoration(
              borderRadius: AppRadius.card,
              border: Border.all(
                color: isDark ? AppColors.borderDark : AppColors.borderLight,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header row with avatar, name, and actions
                Row(
                  children: [
                    // Avatar
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: AppColors.teal.withValues(alpha: 0.1),
                      child: Text(
                        candidate.name.split(' ').map((e) => e[0]).join(),
                        style: AppTextStyles.labelMedium.copyWith(
                          color: AppColors.teal,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    // Name and school
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  candidate.name,
                                  style: AppTextStyles.h4,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              // Match score
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: _getMatchColor(candidate.matchScore)
                                      .withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  '${candidate.matchScore}%',
                                  style: AppTextStyles.badge.copyWith(
                                    color: _getMatchColor(candidate.matchScore),
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(
                            candidate.school,
                            style: AppTextStyles.bodySmall.copyWith(
                              color: Theme.of(context).colorScheme.onSurfaceVariant,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Details row
                Row(
                  children: [
                    _buildDetailChip(
                      context,
                      isDark,
                      Icons.school_outlined,
                      candidate.major,
                    ),
                    const SizedBox(width: 8),
                    _buildDetailChip(
                      context,
                      isDark,
                      Icons.grade_outlined,
                      'GPA ${candidate.gpa}',
                    ),
                    const SizedBox(width: 8),
                    _buildDetailChip(
                      context,
                      isDark,
                      Icons.calendar_today_outlined,
                      candidate.graduationYear,
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Target roles
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: candidate.targetRoles.take(3).map((role) {
                    return Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.teal.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        role,
                        style: AppTextStyles.badge.copyWith(
                          color: AppColors.teal,
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 12),

                // Bottom row with documents and actions
                Row(
                  children: [
                    // Document indicators
                    if (candidate.hasResume)
                      _buildDocIndicator(
                        context,
                        isDark,
                        Icons.description_outlined,
                        'Resume',
                      ),
                    if (candidate.hasResume && candidate.hasTranscript)
                      const SizedBox(width: 12),
                    if (candidate.hasTranscript)
                      _buildDocIndicator(
                        context,
                        isDark,
                        Icons.article_outlined,
                        'Transcript',
                      ),
                    const Spacer(),
                    // Action buttons
                    IconButton(
                      onPressed: onMessage,
                      icon: const Icon(Icons.message_outlined, size: 20),
                      tooltip: 'Message',
                      color: AppColors.teal,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(
                        minWidth: 36,
                        minHeight: 36,
                      ),
                    ),
                    IconButton(
                      onPressed: onSave,
                      icon: Icon(
                        candidate.isSaved
                            ? Icons.bookmark
                            : Icons.bookmark_outline,
                        size: 20,
                      ),
                      tooltip: candidate.isSaved ? 'Saved' : 'Save',
                      color: candidate.isSaved
                          ? AppColors.emerald
                          : Theme.of(context).colorScheme.onSurfaceVariant,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(
                        minWidth: 36,
                        minHeight: 36,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDetailChip(
    BuildContext context,
    bool isDark,
    IconData icon,
    String text,
  ) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isDark ? AppColors.borderDark : AppColors.borderLight,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 14,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
          const SizedBox(width: 4),
          Text(
            text,
            style: AppTextStyles.caption.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDocIndicator(
    BuildContext context,
    bool isDark,
    IconData icon,
    String label,
  ) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          icon,
          size: 16,
          color: AppColors.success,
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: AppTextStyles.caption.copyWith(
            color: AppColors.success,
          ),
        ),
      ],
    );
  }

  Color _getMatchColor(int score) {
    if (score >= 90) return AppColors.success;
    if (score >= 75) return AppColors.teal;
    if (score >= 60) return AppColors.warning;
    return AppColors.error;
  }
}
