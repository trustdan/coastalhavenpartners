import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/router/app_router.dart';
import '../../../core/providers/providers.dart';
import '../../../data/models/models.dart';

/// Candidate Profile Screen - Shows full profile information
class CandidateProfileScreen extends ConsumerWidget {
  const CandidateProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final profileAsync = ref.watch(candidateProfileProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => context.push(AppRoutes.candidateSettings),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(candidateProfileProvider);
        },
        child: profileAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, stack) => SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, size: 48, color: Colors.red),
                    const SizedBox(height: 16),
                    Text('Error loading profile: $error'),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => ref.invalidate(candidateProfileProvider),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            ),
          ),
          data: (profile) {
            if (profile == null) {
              return const Center(
                child: Text('Profile not found'),
              );
            }
            return _buildProfileContent(context, ref, isDark, profile);
          },
        ),
      ),
    );
  }

  Widget _buildProfileContent(
    BuildContext context,
    WidgetRef ref,
    bool isDark,
    CandidateProfile profile,
  ) {
    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      child: Column(
        children: [
          // Profile Header
          _buildProfileHeader(context, isDark, profile),

          // Profile Content
          Padding(
            padding: AppSpacing.screenPadding,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Edit Profile Button
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () => context.push(AppRoutes.candidateEditProfile),
                    icon: const Icon(Icons.edit_outlined),
                    label: const Text('Edit Profile'),
                  ),
                ),
                AppSpacing.sectionGap,

                // Education Section
                _buildSectionHeader(context, 'Education'),
                AppSpacing.itemGap,
                _buildEducationCard(context, isDark, profile),
                AppSpacing.sectionGap,

                // Target Roles Section
                if (profile.targetRoles != null && profile.targetRoles!.isNotEmpty) ...[
                  _buildSectionHeader(context, 'Target Roles'),
                  AppSpacing.itemGap,
                  _buildChipList(context, profile.targetRoles!),
                  AppSpacing.sectionGap,
                ],

                // Preferred Locations Section
                if (profile.preferredLocations != null && profile.preferredLocations!.isNotEmpty) ...[
                  _buildSectionHeader(context, 'Preferred Locations'),
                  AppSpacing.itemGap,
                  _buildChipList(context, profile.preferredLocations!),
                  AppSpacing.sectionGap,
                ],

                // Bio Section
                if (profile.bio != null && profile.bio!.isNotEmpty) ...[
                  _buildSectionHeader(context, 'About'),
                  AppSpacing.itemGap,
                  Text(
                    profile.bio!,
                    style: AppTextStyles.bodyMedium,
                  ),
                  AppSpacing.sectionGap,
                ],

                // Documents Section
                _buildSectionHeader(context, 'Documents'),
                AppSpacing.itemGap,
                _buildDocumentsCard(context, isDark, profile),
                AppSpacing.sectionGap,

                // Links Section
                _buildSectionHeader(context, 'Links'),
                AppSpacing.itemGap,
                _buildLinksCard(context, isDark, profile),
                AppSpacing.sectionGap,
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Get initials from a name string
  String _getInitials(String name) {
    final parts = name.trim().split(' ');
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts[0].isNotEmpty ? parts[0][0].toUpperCase() : '?';
    return '${parts[0][0]}${parts[parts.length - 1][0]}'.toUpperCase();
  }

  Widget _buildProfileHeader(
    BuildContext context,
    bool isDark,
    CandidateProfile profile,
  ) {
    final initials = _getInitials(profile.displayName);
    final degreeType = profile.undergradDegreeType ?? 'B.S.';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 32),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            AppColors.teal.withValues(alpha: 0.1),
            Colors.transparent,
          ],
        ),
      ),
      child: Column(
        children: [
          // Profile Photo (initials avatar)
          Stack(
            children: [
              CircleAvatar(
                radius: 50,
                backgroundColor: isDark ? AppColors.cardDark : AppColors.cardLight,
                child: Text(
                  initials,
                  style: AppTextStyles.h1.copyWith(
                    color: AppColors.teal,
                  ),
                ),
              ),
              if (profile.completionPercentage >= 80)
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: AppColors.success,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: Theme.of(context).scaffoldBackgroundColor,
                        width: 2,
                      ),
                    ),
                    child: const Icon(
                      Icons.check,
                      size: 12,
                      color: Colors.white,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),

          // Name
          Text(
            profile.displayName,
            style: AppTextStyles.h2,
          ),
          const SizedBox(height: 4),

          // Headline
          Text(
            '$degreeType ${profile.major} • ${profile.schoolName}',
            style: AppTextStyles.bodyMedium.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),

          // Completion percentage if not complete
          if (profile.completionPercentage < 80) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.warning.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      value: profile.completionPercentage / 100,
                      strokeWidth: 2,
                      backgroundColor: AppColors.warning.withValues(alpha: 0.3),
                      valueColor: const AlwaysStoppedAnimation<Color>(AppColors.warning),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '${profile.completionPercentage}% complete',
                    style: AppTextStyles.labelSmall.copyWith(
                      color: AppColors.warning,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title) {
    return Text(
      title,
      style: AppTextStyles.h4,
    );
  }

  Widget _buildEducationCard(
    BuildContext context,
    bool isDark,
    CandidateProfile profile,
  ) {
    final degreeType = profile.undergradDegreeType ?? 'B.S.';

    return Container(
      width: double.infinity,
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
          // Undergraduate
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.teal.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.school_outlined,
                  size: 24,
                  color: AppColors.teal,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      profile.schoolName,
                      style: AppTextStyles.labelLarge,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '$degreeType in ${profile.major}',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Class of ${profile.graduationYear} • GPA: ${profile.gpa.toStringAsFixed(2)}',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          // Graduate (if applicable)
          if (profile.gradSchool != null) ...[
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 16),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.emerald.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.workspace_premium_outlined,
                    size: 24,
                    color: AppColors.emerald,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        profile.gradSchool!,
                        style: AppTextStyles.labelLarge,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${profile.gradDegreeType ?? ''} in ${profile.gradMajor ?? ''}',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                      ),
                      if (profile.gradGraduationYear != null) ...[
                        const SizedBox(height: 2),
                        Text(
                          'Expected ${profile.gradGraduationYear}${profile.gradGpa != null ? ' • GPA: ${profile.gradGpa!.toStringAsFixed(2)}' : ''}',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
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

  Widget _buildChipList(BuildContext context, List<String> items) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: items.map((item) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: AppColors.teal.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: AppColors.teal.withValues(alpha: 0.3),
            ),
          ),
          child: Text(
            item,
            style: AppTextStyles.labelSmall.copyWith(
              color: AppColors.teal,
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildDocumentsCard(
    BuildContext context,
    bool isDark,
    CandidateProfile profile,
  ) {
    return Container(
      width: double.infinity,
      padding: AppSpacing.cardPadding,
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: AppRadius.card,
        border: Border.all(
          color: isDark ? AppColors.borderDark : AppColors.borderLight,
        ),
      ),
      child: Column(
        children: [
          // Resume
          _buildDocumentRow(
            context,
            icon: Icons.description_outlined,
            title: 'Resume',
            subtitle: profile.resumeUrl != null ? 'Uploaded' : 'Not uploaded',
            hasFile: profile.resumeUrl != null,
            onTap: () {
              if (profile.resumeUrl != null) {
                _launchUrl(context, profile.resumeUrl!);
              }
            },
          ),
          const SizedBox(height: 12),
          const Divider(),
          const SizedBox(height: 12),
          // Transcript
          _buildDocumentRow(
            context,
            icon: Icons.assignment_outlined,
            title: 'Transcript',
            subtitle: profile.transcriptUrl != null ? 'Uploaded' : 'Not uploaded',
            hasFile: profile.transcriptUrl != null,
            onTap: () {
              if (profile.transcriptUrl != null) {
                _launchUrl(context, profile.transcriptUrl!);
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildDocumentRow(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required bool hasFile,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: hasFile ? onTap : null,
      child: Row(
        children: [
          Icon(
            icon,
            size: 24,
            color: hasFile ? AppColors.teal : AppColors.textMutedLight,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTextStyles.labelMedium,
                ),
                Text(
                  subtitle,
                  style: AppTextStyles.caption.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          if (hasFile)
            Icon(
              Icons.open_in_new,
              size: 20,
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
        ],
      ),
    );
  }

  Widget _buildLinksCard(
    BuildContext context,
    bool isDark,
    CandidateProfile profile,
  ) {
    return Container(
      width: double.infinity,
      padding: AppSpacing.cardPadding,
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: AppRadius.card,
        border: Border.all(
          color: isDark ? AppColors.borderDark : AppColors.borderLight,
        ),
      ),
      child: Column(
        children: [
          // LinkedIn
          _buildLinkRow(
            context,
            icon: Icons.link,
            title: 'LinkedIn',
            url: profile.linkedinUrl,
            onTap: () {
              if (profile.linkedinUrl != null) {
                _launchUrl(context, profile.linkedinUrl!);
              }
            },
          ),
          if (profile.schedulingUrl != null) ...[
            const SizedBox(height: 12),
            const Divider(),
            const SizedBox(height: 12),
            _buildLinkRow(
              context,
              icon: Icons.calendar_today_outlined,
              title: 'Schedule a Call',
              url: profile.schedulingUrl,
              onTap: () {
                if (profile.schedulingUrl != null) {
                  _launchUrl(context, profile.schedulingUrl!);
                }
              },
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildLinkRow(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String? url,
    required VoidCallback onTap,
  }) {
    final hasUrl = url != null && url.isNotEmpty;

    return InkWell(
      onTap: hasUrl ? onTap : null,
      child: Row(
        children: [
          Icon(
            icon,
            size: 24,
            color: hasUrl ? AppColors.teal : AppColors.textMutedLight,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTextStyles.labelMedium,
                ),
                Text(
                  hasUrl ? url : 'Not added',
                  style: AppTextStyles.caption.copyWith(
                    color: hasUrl
                        ? AppColors.teal
                        : Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          if (hasUrl)
            Icon(
              Icons.open_in_new,
              size: 20,
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
        ],
      ),
    );
  }

  Future<void> _launchUrl(BuildContext context, String url) async {
    // Add https:// if missing
    String fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fullUrl = 'https://$url';
    }

    try {
      final uri = Uri.parse(fullUrl);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Could not open $url'),
              backgroundColor: AppColors.error,
            ),
          );
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error opening URL: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }
}
