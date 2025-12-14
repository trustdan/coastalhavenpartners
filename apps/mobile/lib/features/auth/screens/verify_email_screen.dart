import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart' show OtpType;
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/router/app_router.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../data/services/supabase_service.dart';
import '../../../widgets/magic_ui/magic_ui.dart';

/// Email verification screen shown after signup
class VerifyEmailScreen extends ConsumerStatefulWidget {
  final String? email;

  const VerifyEmailScreen({super.key, this.email});

  @override
  ConsumerState<VerifyEmailScreen> createState() => _VerifyEmailScreenState();
}

class _VerifyEmailScreenState extends ConsumerState<VerifyEmailScreen> {
  bool _isResending = false;
  bool _isChecking = false;
  int _resendCooldown = 0;
  Timer? _cooldownTimer;

  @override
  void dispose() {
    _cooldownTimer?.cancel();
    super.dispose();
  }

  void _startCooldown() {
    setState(() => _resendCooldown = 60);
    _cooldownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_resendCooldown > 0) {
        setState(() => _resendCooldown--);
      } else {
        timer.cancel();
      }
    });
  }

  /// Get the email to display (from param or current user)
  String? get _displayEmail =>
      widget.email ?? SupabaseService.instance.currentUser?.email;

  Future<void> _resendEmail() async {
    if (_resendCooldown > 0) return;

    final emailToResend = _displayEmail;
    if (emailToResend == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('No email address available'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isResending = true);

    try {
      await SupabaseService.instance.client?.auth.resend(
        type: OtpType.signup,
        email: emailToResend,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Verification email sent!'),
            backgroundColor: Colors.green,
          ),
        );
        _startCooldown();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to send email: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isResending = false);
      }
    }
  }

  Future<void> _checkVerification() async {
    setState(() => _isChecking = true);

    try {
      // Try to refresh the session to get updated user data
      final session = await SupabaseService.instance.client?.auth.refreshSession();

      final user = session?.user ?? SupabaseService.instance.currentUser;

      if (user?.emailConfirmedAt != null) {
        // Email is verified - navigate to profile completion based on role
        if (mounted) {
          // First check auth state
          final authState = ref.read(authStateProvider);
          String? role = authState.hasValue ? authState.value?.userRole : null;

          // Fallback: Check user metadata directly (role is stored there during signup)
          if ((role == null || role.isEmpty) && user != null) {
            role = user.userMetadata?['role'] as String?;
          }

          // Always go to profile completion first after email verification
          // The profile completion screen will redirect to dashboard if already complete
          switch (role) {
            case 'candidate':
              context.go(AppRoutes.completeProfileCandidate);
              break;
            case 'recruiter':
              context.go(AppRoutes.completeProfileRecruiter);
              break;
            case 'school_admin':
              context.go(AppRoutes.completeProfileSchool);
              break;
            default:
              // If no role set, go to role selection
              context.go(AppRoutes.roleSelection);
          }
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Email not verified yet. Please check your inbox.'),
              backgroundColor: Colors.orange,
            ),
          );
        }
      }
    } catch (e) {
      // Session missing means user needs to log in after email verification
      // This is expected when email confirmation is required before session creation
      if (e.toString().contains('AuthSessionMissing') ||
          e.toString().contains('session missing')) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Email verified! Please log in to continue.'),
              backgroundColor: Colors.green,
            ),
          );
          // Redirect to login
          context.go(AppRoutes.login);
        }
        return;
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isChecking = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.textPrimaryDark),
          onPressed: () => context.go(AppRoutes.login),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: AppSpacing.screenPadding,
          child: Column(
            children: [
              const Spacer(),

              // Email icon
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppColors.teal.withValues(alpha: 0.2),
                      AppColors.emerald.withValues(alpha: 0.1),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(32),
                ),
                child: const Icon(
                  Icons.mark_email_unread_outlined,
                  size: 56,
                  color: AppColors.teal,
                ),
              ),

              const SizedBox(height: 32),

              // Title
              Text(
                'Check Your Email',
                style: AppTextStyles.h2.copyWith(
                  color: AppColors.textPrimaryDark,
                ),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 16),

              // Description
              Text(
                'We\'ve sent a verification link to your email address. Please click the link to verify your account.',
                style: AppTextStyles.bodyLarge.copyWith(
                  color: AppColors.textSecondaryDark,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 8),

              // Email display
              Container(
                margin: const EdgeInsets.symmetric(vertical: 16),
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: AppColors.cardDark,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.borderDark),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.email_outlined,
                      size: 18,
                      color: AppColors.textMutedDark,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _displayEmail ?? 'your@email.com',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.textSecondaryDark,
                      ),
                    ),
                  ],
                ),
              ),

              const Spacer(),

              // Verify button
              ShimmerButton(
                text: _isChecking ? 'Checking...' : 'I\'ve Verified My Email',
                onPressed: _isChecking ? null : _checkVerification,
                isLoading: _isChecking,
                fullWidth: true,
                height: AppSizes.buttonHeightLg,
              ),

              const SizedBox(height: 16),

              // Resend button
              TextButton(
                onPressed:
                    (_resendCooldown > 0 || _isResending) ? null : _resendEmail,
                child: Text(
                  _resendCooldown > 0
                      ? 'Resend email in ${_resendCooldown}s'
                      : _isResending
                          ? 'Sending...'
                          : 'Resend verification email',
                  style: AppTextStyles.labelMedium.copyWith(
                    color: _resendCooldown > 0
                        ? AppColors.textMutedDark
                        : AppColors.teal,
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Help text
              Text(
                'Didn\'t receive the email? Check your spam folder.',
                style: AppTextStyles.bodySmall.copyWith(
                  color: AppColors.textMutedDark,
                ),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
