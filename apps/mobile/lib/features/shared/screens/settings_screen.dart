import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:supabase_flutter/supabase_flutter.dart' show FactorStatus;
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/analytics_provider.dart';
import '../../../core/providers/recruiter_provider.dart';
import '../../../core/providers/settings_provider.dart';
import '../../../core/router/app_router.dart';
import '../../../core/providers/theme_provider.dart';
import '../../../data/models/models.dart';
import '../../../data/services/supabase_service.dart';
import '../../../services/connectivity_service.dart';
import '../../../services/sync_service.dart';
import '../../../data/local/database.dart';

/// Settings Screen - Account settings, preferences, and app info
class SettingsScreen extends ConsumerStatefulWidget {
  /// User role determines which sections to show
  final String userRole;

  const SettingsScreen({
    super.key,
    required this.userRole,
  });

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final settingsAsync = ref.watch(userSettingsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: ListView(
        padding: AppSpacing.screenPadding,
        children: [
          // Account Section
          _buildSectionHeader('Account'),
          _buildSettingsCard(
            context,
            isDark,
            children: [
              _buildSettingsTile(
                icon: Icons.person_outline,
                title: 'Edit Profile',
                subtitle: 'Update your personal information',
                onTap: () {
                  if (widget.userRole == 'candidate') {
                    context.push(AppRoutes.candidateEditProfile);
                  } else if (widget.userRole == 'recruiter') {
                    context.push(AppRoutes.recruiterEditProfile);
                  } else {
                    // School admin - coming soon
                    _showComingSoon();
                  }
                },
              ),
              _buildDivider(isDark),
              _buildSettingsTile(
                icon: Icons.lock_outline,
                title: 'Change Password',
                subtitle: 'Update your password',
                onTap: () => _showChangePasswordDialog(),
              ),
              _buildDivider(isDark),
              _buildSettingsTile(
                icon: Icons.email_outlined,
                title: 'Change Email',
                subtitle: 'Update your email address',
                onTap: () => _showChangeEmailDialog(),
              ),
            ],
          ),
          AppSpacing.sectionGap,

          // Security Section
          _buildSectionHeader('Security'),
          _buildSecuritySection(context, isDark),
          AppSpacing.sectionGap,

          // Verification Section (Recruiter only)
          if (widget.userRole == 'recruiter') ...[
            _buildSectionHeader('Verification'),
            _buildVerificationSection(context, isDark),
            AppSpacing.sectionGap,
          ],

          // Notifications Section
          _buildSectionHeader('Notifications'),
          _buildNotificationsSection(context, isDark, settingsAsync),
          AppSpacing.sectionGap,

          // Privacy Section
          _buildSectionHeader('Privacy'),
          _buildPrivacySection(context, isDark, settingsAsync),
          AppSpacing.sectionGap,

          // Appearance Section
          _buildSectionHeader('Appearance'),
          _buildAppearanceSection(context, isDark),
          AppSpacing.sectionGap,

          // Data & Sync Section
          _buildSectionHeader('Data & Sync'),
          _buildDataSyncSection(context, isDark),
          AppSpacing.sectionGap,

          // Support Section
          _buildSectionHeader('Support'),
          _buildSettingsCard(
            context,
            isDark,
            children: [
              _buildSettingsTile(
                icon: Icons.help_outline,
                title: 'Help Center',
                onTap: () => _openUrl('https://coastalhavenpartners.com/help'),
              ),
              _buildDivider(isDark),
              _buildSettingsTile(
                icon: Icons.feedback_outlined,
                title: 'Send Feedback',
                onTap: () => _openUrl('mailto:support@coastalhavenpartners.com'),
              ),
              _buildDivider(isDark),
              _buildSettingsTile(
                icon: Icons.bug_report_outlined,
                title: 'Report a Bug',
                onTap: () => _openUrl('mailto:support@coastalhavenpartners.com?subject=Bug%20Report'),
              ),
              _buildDivider(isDark),
              _buildSettingsTile(
                icon: Icons.support_agent,
                title: 'Submit Support Request',
                subtitle: 'Account issues, verification appeals, etc.',
                onTap: () => context.push(
                  '${AppRoutes.verificationAppeal}?role=${widget.userRole}',
                ),
              ),
            ],
          ),
          AppSpacing.sectionGap,

          // Legal Section
          _buildSectionHeader('Legal'),
          _buildSettingsCard(
            context,
            isDark,
            children: [
              _buildSettingsTile(
                icon: Icons.description_outlined,
                title: 'Terms of Service',
                onTap: () => _openUrl('https://coastalhavenpartners.com/terms'),
              ),
              _buildDivider(isDark),
              _buildSettingsTile(
                icon: Icons.privacy_tip_outlined,
                title: 'Privacy Policy',
                onTap: () => _openUrl('https://coastalhavenpartners.com/privacy'),
              ),
            ],
          ),
          AppSpacing.sectionGap,

          // App Info
          _buildSectionHeader('About'),
          _buildSettingsCard(
            context,
            isDark,
            children: [
              _buildSettingsTile(
                icon: Icons.info_outline,
                title: 'App Version',
                subtitle: '1.0.0 (Build 1)',
                onTap: null,
              ),
            ],
          ),
          AppSpacing.sectionGap,

          // Danger Zone
          _buildSettingsCard(
            context,
            isDark,
            children: [
              _buildSettingsTile(
                icon: Icons.logout,
                title: 'Sign Out',
                titleColor: AppColors.warning,
                onTap: () => _showSignOutDialog(),
              ),
              _buildDivider(isDark),
              _buildSettingsTile(
                icon: Icons.delete_forever_outlined,
                title: 'Delete Account',
                titleColor: AppColors.error,
                onTap: () => _showDeleteAccountDialog(),
              ),
            ],
          ),
          AppSpacing.sectionGap,
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, left: 4),
      child: Text(
        title.toUpperCase(),
        style: AppTextStyles.caption.copyWith(
          color: Theme.of(context).colorScheme.onSurfaceVariant,
          fontWeight: FontWeight.w600,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildSettingsCard(
    BuildContext context,
    bool isDark, {
    required List<Widget> children,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: AppRadius.card,
        border: Border.all(
          color: isDark ? AppColors.borderDark : AppColors.borderLight,
        ),
      ),
      child: Column(children: children),
    );
  }

  Widget _buildSettingsTile({
    required IconData icon,
    required String title,
    String? subtitle,
    Color? titleColor,
    VoidCallback? onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: titleColor ?? AppColors.teal),
      title: Text(
        title,
        style: AppTextStyles.labelMedium.copyWith(color: titleColor),
      ),
      subtitle: subtitle != null
          ? Text(
              subtitle,
              style: AppTextStyles.caption.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            )
          : null,
      trailing: onTap != null
          ? const Icon(Icons.chevron_right, size: 20)
          : null,
      onTap: onTap,
    );
  }

  Widget _buildSwitchTile({
    required IconData icon,
    required String title,
    String? subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return ListTile(
      leading: Icon(icon, color: AppColors.teal),
      title: Text(title, style: AppTextStyles.labelMedium),
      subtitle: subtitle != null
          ? Text(
              subtitle,
              style: AppTextStyles.caption.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            )
          : null,
      trailing: Switch.adaptive(
        value: value,
        onChanged: onChanged,
        activeTrackColor: AppColors.teal,
      ),
    );
  }

  Widget _buildDivider(bool isDark) {
    return Divider(
      height: 1,
      indent: 56,
      color: isDark ? AppColors.borderDark : AppColors.borderLight,
    );
  }

  Widget _buildNotificationsSection(
    BuildContext context,
    bool isDark,
    AsyncValue<UserSettings?> settingsAsync,
  ) {
    return settingsAsync.when(
      data: (settings) {
        // Use defaults if settings not loaded
        final emailNotifications = settings?.emailNotifications ?? true;
        final pushNotifications = settings?.pushNotifications ?? true;
        final jobAlerts = settings?.jobAlerts ?? true;
        final messageNotifications = settings?.messageNotifications ?? true;
        final marketingEmails = settings?.marketingEmails ?? false;

        return _buildSettingsCard(
          context,
          isDark,
          children: [
            _buildSwitchTile(
              icon: Icons.email_outlined,
              title: 'Email Notifications',
              value: emailNotifications,
              onChanged: (value) => ref
                  .read(userSettingsProvider.notifier)
                  .toggleEmailNotifications(value),
            ),
            _buildDivider(isDark),
            _buildSwitchTile(
              icon: Icons.notifications_outlined,
              title: 'Push Notifications',
              value: pushNotifications,
              onChanged: (value) => ref
                  .read(userSettingsProvider.notifier)
                  .togglePushNotifications(value),
            ),
            if (widget.userRole == 'candidate') ...[
              _buildDivider(isDark),
              _buildSwitchTile(
                icon: Icons.work_outline,
                title: 'Job Alerts',
                subtitle: 'Get notified about matching opportunities',
                value: jobAlerts,
                onChanged: (value) => ref
                    .read(userSettingsProvider.notifier)
                    .toggleJobAlerts(value),
              ),
            ],
            _buildDivider(isDark),
            _buildSwitchTile(
              icon: Icons.chat_bubble_outline,
              title: 'Message Notifications',
              value: messageNotifications,
              onChanged: (value) => ref
                  .read(userSettingsProvider.notifier)
                  .toggleMessageNotifications(value),
            ),
            _buildDivider(isDark),
            _buildSwitchTile(
              icon: Icons.campaign_outlined,
              title: 'Marketing Emails',
              subtitle: 'Receive updates and tips',
              value: marketingEmails,
              onChanged: (value) => ref
                  .read(userSettingsProvider.notifier)
                  .toggleMarketingEmails(value),
            ),
          ],
        );
      },
      loading: () => _buildSettingsCard(
        context,
        isDark,
        children: [
          const ListTile(
            leading: SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
            title: Text('Loading settings...'),
          ),
        ],
      ),
      error: (_, __) => _buildSettingsCard(
        context,
        isDark,
        children: [
          ListTile(
            leading: const Icon(Icons.error_outline, color: AppColors.error),
            title: const Text('Error loading settings'),
            trailing: TextButton(
              onPressed: () => ref.invalidate(userSettingsProvider),
              child: const Text('Retry'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPrivacySection(
    BuildContext context,
    bool isDark,
    AsyncValue<UserSettings?> settingsAsync,
  ) {
    return settingsAsync.when(
      data: (settings) {
        // Use defaults if settings not loaded
        final profileVisible = settings?.profileVisible ?? true;
        final showOnlineStatus = settings?.showOnlineStatus ?? true;
        final allowMessagesFromRecruiters =
            settings?.allowMessagesFromRecruiters ?? true;
        final allowMessagesFromCandidates =
            settings?.allowMessagesFromCandidates ?? true;

        return _buildSettingsCard(
          context,
          isDark,
          children: [
            _buildSwitchTile(
              icon: Icons.visibility_outlined,
              title: 'Profile Visible',
              subtitle: widget.userRole == 'candidate'
                  ? 'Allow recruiters to find you'
                  : 'Allow candidates to see your profile',
              value: profileVisible,
              onChanged: (value) => ref
                  .read(userSettingsProvider.notifier)
                  .toggleProfileVisible(value),
            ),
            _buildDivider(isDark),
            _buildSwitchTile(
              icon: Icons.circle,
              title: 'Show Online Status',
              value: showOnlineStatus,
              onChanged: (value) => ref
                  .read(userSettingsProvider.notifier)
                  .toggleShowOnlineStatus(value),
            ),
            if (widget.userRole == 'candidate') ...[
              _buildDivider(isDark),
              _buildSwitchTile(
                icon: Icons.message_outlined,
                title: 'Allow Messages from Recruiters',
                value: allowMessagesFromRecruiters,
                onChanged: (value) => ref
                    .read(userSettingsProvider.notifier)
                    .toggleAllowMessagesFromRecruiters(value),
              ),
            ],
            if (widget.userRole == 'recruiter') ...[
              _buildDivider(isDark),
              _buildSwitchTile(
                icon: Icons.message_outlined,
                title: 'Allow Messages from Candidates',
                value: allowMessagesFromCandidates,
                onChanged: (value) => ref
                    .read(userSettingsProvider.notifier)
                    .toggleAllowMessagesFromCandidates(value),
              ),
            ],
          ],
        );
      },
      loading: () => _buildSettingsCard(
        context,
        isDark,
        children: [
          const ListTile(
            leading: SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
            title: Text('Loading settings...'),
          ),
        ],
      ),
      error: (_, __) => _buildSettingsCard(
        context,
        isDark,
        children: [
          ListTile(
            leading: const Icon(Icons.error_outline, color: AppColors.error),
            title: const Text('Error loading settings'),
            trailing: TextButton(
              onPressed: () => ref.invalidate(userSettingsProvider),
              child: const Text('Retry'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSecuritySection(BuildContext context, bool isDark) {
    return FutureBuilder(
      future: SupabaseService.instance.mfaListFactors(),
      builder: (context, snapshot) {
        bool hasMfaEnabled = false;
        bool isLoading = snapshot.connectionState == ConnectionState.waiting;

        if (snapshot.hasData) {
          final factors = snapshot.data!;
          hasMfaEnabled = factors.totp.any((f) => f.status == FactorStatus.verified);
        }

        return _buildSettingsCard(
          context,
          isDark,
          children: [
            ListTile(
              leading: Icon(
                hasMfaEnabled ? Icons.security : Icons.security_outlined,
                color: hasMfaEnabled ? AppColors.success : AppColors.teal,
              ),
              title: Text('Two-Factor Authentication', style: AppTextStyles.labelMedium),
              subtitle: Text(
                hasMfaEnabled ? 'Enabled - Your account is protected' : 'Add extra security to your account',
                style: AppTextStyles.caption.copyWith(
                  color: hasMfaEnabled ? AppColors.success : Theme.of(context).colorScheme.onSurfaceVariant,
                ),
              ),
              trailing: isLoading
                  ? const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : hasMfaEnabled
                      ? Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.success.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            'ON',
                            style: AppTextStyles.badge.copyWith(
                              color: AppColors.success,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        )
                      : const Icon(Icons.chevron_right, size: 20),
              onTap: isLoading
                  ? null
                  : () {
                      if (hasMfaEnabled) {
                        _showDisableMfaDialog();
                      } else {
                        _navigateToMfaSetup();
                      }
                    },
            ),
          ],
        );
      },
    );
  }

  Future<void> _navigateToMfaSetup() async {
    final result = await context.push<bool>(AppRoutes.mfaSetup);
    if (result == true && mounted) {
      // Refresh the security section
      setState(() {});
    }
  }

  void _showDisableMfaDialog() {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Disable Two-Factor Authentication?'),
        content: const Text(
          'This will make your account less secure. You can always re-enable it later.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Cancel'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.warning),
            onPressed: () async {
              Navigator.pop(dialogContext);
              await _disableMfa();
            },
            child: const Text('Disable'),
          ),
        ],
      ),
    );
  }

  Future<void> _disableMfa() async {
    try {
      // Get the user's factors and unenroll them
      final factors = await SupabaseService.instance.mfaListFactors();
      final verifiedFactors = factors.totp.where((f) => f.status == FactorStatus.verified);

      for (final factor in verifiedFactors) {
        await SupabaseService.instance.mfaUnenroll(factorId: factor.id);
      }

      if (mounted) {
        setState(() {}); // Refresh UI
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Two-factor authentication disabled'),
            backgroundColor: AppColors.warning,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to disable 2FA: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Widget _buildVerificationSection(BuildContext context, bool isDark) {
    final recruiterProfileAsync = ref.watch(currentRecruiterProfileProvider);

    return recruiterProfileAsync.when(
      data: (profile) {
        if (profile == null) {
          return _buildSettingsCard(
            context,
            isDark,
            children: [
              _buildSettingsTile(
                icon: Icons.verified_outlined,
                title: 'Verification Status',
                subtitle: 'Unable to load',
                onTap: null,
              ),
            ],
          );
        }

        final isApproved = profile.isApproved;
        final isRejected = profile.isRejected;
        final statusText = isApproved
            ? 'Verified'
            : isRejected
                ? 'Rejected'
                : 'Pending Review';
        final statusColor = isApproved
            ? AppColors.success
            : isRejected
                ? AppColors.error
                : AppColors.warning;

        return _buildSettingsCard(
          context,
          isDark,
          children: [
            ListTile(
              leading: Icon(
                isApproved
                    ? Icons.verified
                    : isRejected
                        ? Icons.cancel
                        : Icons.hourglass_empty,
                color: statusColor,
              ),
              title: Text('Verification Status', style: AppTextStyles.labelMedium),
              subtitle: Text(
                statusText,
                style: AppTextStyles.caption.copyWith(color: statusColor),
              ),
              trailing: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  statusText,
                  style: AppTextStyles.badge.copyWith(
                    color: statusColor,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            _buildDivider(isDark),
            _buildSettingsTile(
              icon: Icons.domain,
              title: 'Email Domain',
              subtitle: profile.emailDomain ?? 'Not detected',
              onTap: null,
            ),
            _buildDivider(isDark),
            _buildSettingsTile(
              icon: Icons.language,
              title: 'Company Website',
              subtitle: profile.companyWebsite ?? 'Not set',
              onTap: () => _showUpdateWebsiteDialog(profile),
            ),
            if (profile.verificationNotes != null) ...[
              _buildDivider(isDark),
              ListTile(
                leading: const Icon(Icons.note_outlined, color: AppColors.teal),
                title: Text('Verification Notes', style: AppTextStyles.labelMedium),
                subtitle: Text(
                  profile.verificationNotes!,
                  style: AppTextStyles.caption.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
              ),
            ],
            // Show appeal option if rejected
            if (isRejected) ...[
              _buildDivider(isDark),
              ListTile(
                leading: const Icon(Icons.support_agent, color: AppColors.info),
                title: Text('Appeal Decision', style: AppTextStyles.labelMedium),
                subtitle: Text(
                  'Submit an appeal if you believe this was an error',
                  style: AppTextStyles.caption.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => context.push(
                  '${AppRoutes.verificationAppeal}?role=${widget.userRole}&type=verificationRejected',
                ),
              ),
            ],
          ],
        );
      },
      loading: () => _buildSettingsCard(
        context,
        isDark,
        children: [
          const ListTile(
            leading: SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
            title: Text('Loading verification status...'),
          ),
        ],
      ),
      error: (_, __) => _buildSettingsCard(
        context,
        isDark,
        children: [
          _buildSettingsTile(
            icon: Icons.error_outline,
            title: 'Verification Status',
            subtitle: 'Error loading status',
            titleColor: AppColors.error,
            onTap: () => ref.invalidate(currentRecruiterProfileProvider),
          ),
        ],
      ),
    );
  }

  Widget _buildDataSyncSection(BuildContext context, bool isDark) {
    final connectivity = ConnectivityService.instance;
    final syncService = SyncService.instance;
    final db = AppDatabase();

    return StatefulBuilder(
      builder: (context, setState) {
        return FutureBuilder<int>(
          future: db.getPendingSyncCount(),
          builder: (context, snapshot) {
            final pendingCount = snapshot.data ?? 0;
            final isOnline = connectivity.isOnline;

            return _buildSettingsCard(
              context,
              isDark,
              children: [
                // Connection Status
                ListTile(
                  leading: Icon(
                    isOnline ? Icons.cloud_done : Icons.cloud_off,
                    color: isOnline ? AppColors.success : AppColors.warning,
                  ),
                  title: Text('Connection Status', style: AppTextStyles.labelMedium),
                  subtitle: Text(
                    isOnline ? 'Online' : 'Offline',
                    style: AppTextStyles.caption.copyWith(
                      color: isOnline ? AppColors.success : AppColors.warning,
                    ),
                  ),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: (isOnline ? AppColors.success : AppColors.warning)
                          .withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      isOnline ? 'Connected' : 'Offline Mode',
                      style: AppTextStyles.badge.copyWith(
                        color: isOnline ? AppColors.success : AppColors.warning,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                _buildDivider(isDark),
                // Pending Sync Count
                ListTile(
                  leading: Icon(
                    pendingCount > 0 ? Icons.sync_problem : Icons.sync,
                    color: pendingCount > 0 ? AppColors.warning : AppColors.teal,
                  ),
                  title: Text('Pending Changes', style: AppTextStyles.labelMedium),
                  subtitle: Text(
                    pendingCount > 0
                        ? '$pendingCount item${pendingCount > 1 ? 's' : ''} waiting to sync'
                        : 'All changes synced',
                    style: AppTextStyles.caption.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  trailing: pendingCount > 0
                      ? Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.warning.withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Text(
                            '$pendingCount',
                            style: AppTextStyles.badge.copyWith(
                              color: AppColors.warning,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        )
                      : const Icon(Icons.check_circle, color: AppColors.success, size: 20),
                ),
                _buildDivider(isDark),
                // Sync Now Button
                ListTile(
                  leading: const Icon(Icons.sync, color: AppColors.teal),
                  title: Text('Sync Now', style: AppTextStyles.labelMedium),
                  subtitle: Text(
                    'Manually sync all pending changes',
                    style: AppTextStyles.caption.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  trailing: syncService.isSyncing
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.chevron_right, size: 20),
                  onTap: isOnline && !syncService.isSyncing
                      ? () async {
                          setState(() {}); // Trigger rebuild
                          try {
                            final results = await syncService.syncPendingOperations();
                            final allSuccess = results.every((r) => r.success);
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    allSuccess
                                        ? 'Sync completed successfully'
                                        : 'Some items failed to sync',
                                  ),
                                  backgroundColor:
                                      allSuccess ? AppColors.success : AppColors.warning,
                                ),
                              );
                            }
                          } catch (e) {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Sync failed: $e'),
                                  backgroundColor: AppColors.error,
                                ),
                              );
                            }
                          } finally {
                            setState(() {}); // Trigger rebuild
                          }
                        }
                      : null,
                ),
                _buildDivider(isDark),
                // Clear Cache
                _buildSettingsTile(
                  icon: Icons.delete_sweep_outlined,
                  title: 'Clear Cached Data',
                  subtitle: 'Remove locally stored data',
                  onTap: () => _showClearCacheDialog(),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _showClearCacheDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear Cached Data'),
        content: const Text(
          'This will remove all locally stored data. You will need to be online to fetch fresh data. Are you sure?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.warning),
            onPressed: () async {
              Navigator.pop(context);
              final db = AppDatabase();
              await db.clearAllData();
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Cached data cleared'),
                  ),
                );
              }
            },
            child: const Text('Clear'),
          ),
        ],
      ),
    );
  }

  void _showUpdateWebsiteDialog(RecruiterProfile profile) {
    final controller = TextEditingController(text: profile.companyWebsite ?? '');

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Company Website'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Enter your company website URL. This helps us verify your employment.',
              style: AppTextStyles.bodySmall.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: controller,
              decoration: const InputDecoration(
                labelText: 'Website URL',
                hintText: 'https://example.com',
                prefixIcon: Icon(Icons.language),
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.url,
              autocorrect: false,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () async {
              final website = controller.text.trim();
              if (website.isNotEmpty) {
                final repo = ref.read(recruiterRepositoryProvider);
                await repo.updateRecruiterProfile(companyWebsite: website);
                ref.invalidate(currentRecruiterProfileProvider);
              }
              if (mounted) {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Company website updated')),
                );
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _showComingSoon() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Coming soon!')),
    );
  }

  void _showChangePasswordDialog() {
    final currentPasswordController = TextEditingController();
    final newPasswordController = TextEditingController();
    final confirmPasswordController = TextEditingController();
    final formKey = GlobalKey<FormState>();
    bool isLoading = false;
    String? errorMessage;

    showDialog(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Change Password'),
          content: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.error.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline, color: AppColors.error, size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            errorMessage!,
                            style: AppTextStyles.caption.copyWith(color: AppColors.error),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
                TextFormField(
                  controller: currentPasswordController,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'Current Password',
                    border: OutlineInputBorder(),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your current password';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: newPasswordController,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'New Password',
                    border: OutlineInputBorder(),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter a new password';
                    }
                    if (value.length < 8) {
                      return 'Password must be at least 8 characters';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: confirmPasswordController,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'Confirm New Password',
                    border: OutlineInputBorder(),
                  ),
                  validator: (value) {
                    if (value != newPasswordController.text) {
                      return 'Passwords do not match';
                    }
                    return null;
                  },
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: isLoading ? null : () => Navigator.pop(dialogContext),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: isLoading
                  ? null
                  : () async {
                      if (!formKey.currentState!.validate()) return;

                      setDialogState(() {
                        isLoading = true;
                        errorMessage = null;
                      });

                      final result = await ref.read(authStateProvider.notifier).changePassword(
                            currentPassword: currentPasswordController.text,
                            newPassword: newPasswordController.text,
                          );

                      if (!dialogContext.mounted) return;

                      if (result.success) {
                        Navigator.pop(dialogContext);
                        ScaffoldMessenger.of(this.context).showSnackBar(
                          const SnackBar(
                            content: Text('Password updated successfully'),
                            backgroundColor: AppColors.success,
                          ),
                        );
                      } else {
                        setDialogState(() {
                          isLoading = false;
                          errorMessage = result.error ?? 'Failed to update password';
                        });
                      }
                    },
              child: isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Update'),
            ),
          ],
        ),
      ),
    );
  }

  void _showChangeEmailDialog() {
    final emailController = TextEditingController();
    final passwordController = TextEditingController();
    final formKey = GlobalKey<FormState>();
    bool isLoading = false;
    String? errorMessage;

    // Get current email to display
    final currentEmail = ref.read(currentUserProvider)?.email ?? '';

    showDialog(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Change Email'),
          content: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Current email: $currentEmail',
                  style: AppTextStyles.caption.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 16),
                if (errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.error.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline, color: AppColors.error, size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            errorMessage!,
                            style: AppTextStyles.caption.copyWith(color: AppColors.error),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
                TextFormField(
                  controller: emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    labelText: 'New Email',
                    border: OutlineInputBorder(),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter a new email';
                    }
                    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                      return 'Please enter a valid email';
                    }
                    if (value == currentEmail) {
                      return 'New email must be different';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: passwordController,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'Current Password',
                    border: OutlineInputBorder(),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your password';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 12),
                Text(
                  'A verification link will be sent to your new email address.',
                  style: AppTextStyles.caption.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: isLoading ? null : () => Navigator.pop(dialogContext),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: isLoading
                  ? null
                  : () async {
                      if (!formKey.currentState!.validate()) return;

                      setDialogState(() {
                        isLoading = true;
                        errorMessage = null;
                      });

                      final result = await ref.read(authStateProvider.notifier).changeEmail(
                            newEmail: emailController.text.trim(),
                            password: passwordController.text,
                          );

                      if (!dialogContext.mounted) return;

                      if (result.success) {
                        Navigator.pop(dialogContext);
                        if (mounted) {
                          ScaffoldMessenger.of(this.context).showSnackBar(
                            const SnackBar(
                              content: Text('Verification email sent to your new address'),
                              backgroundColor: AppColors.success,
                            ),
                          );
                        }
                      } else {
                        setDialogState(() {
                          isLoading = false;
                          errorMessage = result.error ?? 'Failed to update email';
                        });
                      }
                    },
              child: isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Update'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAppearanceSection(BuildContext context, bool isDark) {
    final themeMode = ref.watch(themeModeProvider);
    final themeModeString = switch (themeMode) {
      ThemeMode.system => 'System default',
      ThemeMode.light => 'Light mode',
      ThemeMode.dark => 'Dark mode',
    };

    return _buildSettingsCard(
      context,
      isDark,
      children: [
        _buildSettingsTile(
          icon: Icons.dark_mode_outlined,
          title: 'Theme',
          subtitle: themeModeString,
          onTap: () => _showThemeDialog(),
        ),
      ],
    );
  }

  void _showThemeDialog() {
    final currentMode = ref.read(themeModeProvider);

    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Choose Theme'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            RadioListTile<ThemeMode>(
              title: const Text('System Default'),
              value: ThemeMode.system,
              groupValue: currentMode,
              onChanged: (value) {
                ref.read(themeModeProvider.notifier).setThemeMode(value!);
                Navigator.pop(dialogContext);
              },
            ),
            RadioListTile<ThemeMode>(
              title: const Text('Light Mode'),
              value: ThemeMode.light,
              groupValue: currentMode,
              onChanged: (value) {
                ref.read(themeModeProvider.notifier).setThemeMode(value!);
                Navigator.pop(dialogContext);
              },
            ),
            RadioListTile<ThemeMode>(
              title: const Text('Dark Mode'),
              value: ThemeMode.dark,
              groupValue: currentMode,
              onChanged: (value) {
                ref.read(themeModeProvider.notifier).setThemeMode(value!);
                Navigator.pop(dialogContext);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showSignOutDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sign Out'),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () async {
              Navigator.pop(context);
              // Track logout
              ref.read(analyticsNotifierProvider.notifier).logLogout();
              await ref.read(authStateProvider.notifier).signOut();
              if (mounted) {
                context.go('/login');
              }
            },
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );
  }

  void _showDeleteAccountDialog() {
    final TextEditingController confirmController = TextEditingController();
    bool isConfirmValid = false;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Delete Account'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'This action cannot be undone. All your data will be permanently deleted, including:',
              ),
              const SizedBox(height: 12),
              const Text('• Your profile information'),
              const Text('• All uploaded documents'),
              const Text('• Messages and conversations'),
              const Text('• Any other account data'),
              const SizedBox(height: 16),
              const Text(
                'Type "DELETE" to confirm:',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: confirmController,
                decoration: const InputDecoration(
                  hintText: 'Type DELETE',
                  border: OutlineInputBorder(),
                ),
                onChanged: (value) {
                  setDialogState(() {
                    isConfirmValid = value.toUpperCase() == 'DELETE';
                  });
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            FilledButton(
              style: FilledButton.styleFrom(backgroundColor: AppColors.error),
              onPressed: isConfirmValid
                  ? () async {
                      Navigator.pop(context);
                      await _performAccountDeletion();
                    }
                  : null,
              child: const Text('Delete My Account'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _performAccountDeletion() async {
    // Show loading indicator
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const AlertDialog(
        content: Row(
          children: [
            CircularProgressIndicator(),
            SizedBox(width: 16),
            Expanded(child: Text('Deleting your account...')),
          ],
        ),
      ),
    );

    try {
      final supabase = SupabaseService.instance;
      final result = await supabase.deleteAccount();

      // Close loading dialog
      if (mounted) Navigator.pop(context);

      if (result['success'] == true) {
        // Sign out locally and navigate to login
        await supabase.signOut();

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Your account has been deleted'),
              backgroundColor: Colors.green,
            ),
          );

          // Navigate to login screen
          context.go('/login');
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(result['message'] ?? 'Failed to delete account'),
              backgroundColor: AppColors.error,
            ),
          );
        }
      }
    } catch (e) {
      // Close loading dialog
      if (mounted) Navigator.pop(context);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _openUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }
}
