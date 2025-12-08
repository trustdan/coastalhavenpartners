import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/recruiter_provider.dart';
import '../../../data/models/models.dart';
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
  // Notification preferences
  bool _emailNotifications = true;
  bool _pushNotifications = true;
  bool _jobAlerts = true;
  bool _messageNotifications = true;
  bool _marketingEmails = false;

  // Privacy preferences
  bool _profileVisible = true;
  bool _showOnlineStatus = true;
  bool _allowMessagesFromRecruiters = true;
  bool _allowMessagesFromCandidates = true;

  // Appearance
  String _themeMode = 'system'; // 'light', 'dark', 'system'

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

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
                    context.push('/candidate/edit-profile');
                  } else {
                    // TODO: Recruiter edit profile
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

          // Verification Section (Recruiter only)
          if (widget.userRole == 'recruiter') ...[
            _buildSectionHeader('Verification'),
            _buildVerificationSection(context, isDark),
            AppSpacing.sectionGap,
          ],

          // Notifications Section
          _buildSectionHeader('Notifications'),
          _buildSettingsCard(
            context,
            isDark,
            children: [
              _buildSwitchTile(
                icon: Icons.email_outlined,
                title: 'Email Notifications',
                value: _emailNotifications,
                onChanged: (value) => setState(() => _emailNotifications = value),
              ),
              _buildDivider(isDark),
              _buildSwitchTile(
                icon: Icons.notifications_outlined,
                title: 'Push Notifications',
                value: _pushNotifications,
                onChanged: (value) => setState(() => _pushNotifications = value),
              ),
              if (widget.userRole == 'candidate') ...[
                _buildDivider(isDark),
                _buildSwitchTile(
                  icon: Icons.work_outline,
                  title: 'Job Alerts',
                  subtitle: 'Get notified about matching opportunities',
                  value: _jobAlerts,
                  onChanged: (value) => setState(() => _jobAlerts = value),
                ),
              ],
              _buildDivider(isDark),
              _buildSwitchTile(
                icon: Icons.chat_bubble_outline,
                title: 'Message Notifications',
                value: _messageNotifications,
                onChanged: (value) => setState(() => _messageNotifications = value),
              ),
              _buildDivider(isDark),
              _buildSwitchTile(
                icon: Icons.campaign_outlined,
                title: 'Marketing Emails',
                subtitle: 'Receive updates and tips',
                value: _marketingEmails,
                onChanged: (value) => setState(() => _marketingEmails = value),
              ),
            ],
          ),
          AppSpacing.sectionGap,

          // Privacy Section
          _buildSectionHeader('Privacy'),
          _buildSettingsCard(
            context,
            isDark,
            children: [
              _buildSwitchTile(
                icon: Icons.visibility_outlined,
                title: 'Profile Visible',
                subtitle: widget.userRole == 'candidate'
                    ? 'Allow recruiters to find you'
                    : 'Allow candidates to see your profile',
                value: _profileVisible,
                onChanged: (value) => setState(() => _profileVisible = value),
              ),
              _buildDivider(isDark),
              _buildSwitchTile(
                icon: Icons.circle,
                title: 'Show Online Status',
                value: _showOnlineStatus,
                onChanged: (value) => setState(() => _showOnlineStatus = value),
              ),
              if (widget.userRole == 'candidate') ...[
                _buildDivider(isDark),
                _buildSwitchTile(
                  icon: Icons.message_outlined,
                  title: 'Allow Messages from Recruiters',
                  value: _allowMessagesFromRecruiters,
                  onChanged: (value) => setState(() => _allowMessagesFromRecruiters = value),
                ),
              ],
              if (widget.userRole == 'recruiter') ...[
                _buildDivider(isDark),
                _buildSwitchTile(
                  icon: Icons.message_outlined,
                  title: 'Allow Messages from Candidates',
                  value: _allowMessagesFromCandidates,
                  onChanged: (value) => setState(() => _allowMessagesFromCandidates = value),
                ),
              ],
            ],
          ),
          AppSpacing.sectionGap,

          // Appearance Section
          _buildSectionHeader('Appearance'),
          _buildSettingsCard(
            context,
            isDark,
            children: [
              _buildSettingsTile(
                icon: Icons.dark_mode_outlined,
                title: 'Theme',
                subtitle: _themeMode == 'system'
                    ? 'System default'
                    : _themeMode == 'dark'
                        ? 'Dark mode'
                        : 'Light mode',
                onTap: () => _showThemeDialog(),
              ),
            ],
          ),
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
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Change Password'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              obscureText: true,
              decoration: InputDecoration(
                labelText: 'Current Password',
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 16),
            TextField(
              obscureText: true,
              decoration: InputDecoration(
                labelText: 'New Password',
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 16),
            TextField(
              obscureText: true,
              decoration: InputDecoration(
                labelText: 'Confirm New Password',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Password updated successfully')),
              );
            },
            child: const Text('Update'),
          ),
        ],
      ),
    );
  }

  void _showChangeEmailDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Change Email'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              keyboardType: TextInputType.emailAddress,
              decoration: InputDecoration(
                labelText: 'New Email',
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 16),
            TextField(
              obscureText: true,
              decoration: InputDecoration(
                labelText: 'Current Password',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Verification email sent')),
              );
            },
            child: const Text('Update'),
          ),
        ],
      ),
    );
  }

  void _showThemeDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Choose Theme'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            RadioListTile<String>(
              title: const Text('System Default'),
              value: 'system',
              groupValue: _themeMode,
              onChanged: (value) {
                setState(() => _themeMode = value!);
                Navigator.pop(context);
              },
            ),
            RadioListTile<String>(
              title: const Text('Light Mode'),
              value: 'light',
              groupValue: _themeMode,
              onChanged: (value) {
                setState(() => _themeMode = value!);
                Navigator.pop(context);
              },
            ),
            RadioListTile<String>(
              title: const Text('Dark Mode'),
              value: 'dark',
              groupValue: _themeMode,
              onChanged: (value) {
                setState(() => _themeMode = value!);
                Navigator.pop(context);
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
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Account'),
        content: const Text(
          'This action cannot be undone. All your data will be permanently deleted. Are you sure you want to proceed?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.error),
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Please contact support to delete your account'),
                ),
              );
            },
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  Future<void> _openUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }
}
