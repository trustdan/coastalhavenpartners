import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/router/app_router.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../widgets/magic_ui/magic_ui.dart';

/// Forgot password screen
class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  bool _isLoading = false;
  bool _emailSent = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _handleResetPassword() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      await ref
          .read(authStateProvider.notifier)
          .resetPassword(_emailController.text.trim());

      // Check auth state for errors
      final authState = ref.read(authStateProvider);
      if (authState.hasValue && authState.value!.error != null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(authState.value!.error!),
              backgroundColor: Colors.red,
            ),
          );
        }
      } else if (mounted) {
        setState(() => _emailSent = true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to send reset email: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
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
          child: _emailSent ? _buildSuccessView() : _buildFormView(),
        ),
      ),
    );
  }

  Widget _buildFormView() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: 24),

          // Icon
          Center(
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.teal.withValues(alpha: 0.2),
                    AppColors.emerald.withValues(alpha: 0.1),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child: const Icon(
                Icons.lock_reset_outlined,
                size: 40,
                color: AppColors.teal,
              ),
            ),
          ),

          const SizedBox(height: 32),

          // Title
          Text(
            'Reset Password',
            style: AppTextStyles.h2.copyWith(
              color: AppColors.textPrimaryDark,
            ),
          ),

          const SizedBox(height: 8),

          // Description
          Text(
            'Enter your email address and we\'ll send you a link to reset your password.',
            style: AppTextStyles.bodyLarge.copyWith(
              color: AppColors.textSecondaryDark,
              height: 1.5,
            ),
          ),

          const SizedBox(height: 32),

          // Email field
          TextFormField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            style: TextStyle(color: AppColors.textPrimaryDark),
            decoration: const InputDecoration(
              labelText: 'Email',
              hintText: 'you@example.com',
              prefixIcon: Icon(Icons.email_outlined),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter your email';
              }
              if (!value.contains('@')) {
                return 'Please enter a valid email';
              }
              return null;
            },
          ),

          const SizedBox(height: 32),

          // Submit button
          ShimmerButton(
            text: 'Send Reset Link',
            onPressed: _isLoading ? null : _handleResetPassword,
            isLoading: _isLoading,
            fullWidth: true,
            height: AppSizes.buttonHeightLg,
          ),

          const SizedBox(height: 24),

          // Back to login link
          Center(
            child: GestureDetector(
              onTap: () => context.go(AppRoutes.login),
              child: Text(
                'Back to Sign In',
                style: AppTextStyles.labelMedium.copyWith(
                  color: AppColors.teal,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSuccessView() {
    return Column(
      children: [
        const Spacer(),

        // Success icon
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
            Icons.check_circle_outline,
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
          'We\'ve sent a password reset link to:',
          style: AppTextStyles.bodyLarge.copyWith(
            color: AppColors.textSecondaryDark,
          ),
          textAlign: TextAlign.center,
        ),

        const SizedBox(height: 8),

        // Email display
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: AppColors.cardDark,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.borderDark),
          ),
          child: Text(
            _emailController.text,
            style: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.textPrimaryDark,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),

        const SizedBox(height: 24),

        Text(
          'Click the link in the email to reset your password. If you don\'t see it, check your spam folder.',
          style: AppTextStyles.bodyMedium.copyWith(
            color: AppColors.textSecondaryDark,
            height: 1.5,
          ),
          textAlign: TextAlign.center,
        ),

        const Spacer(),

        // Back to login button
        ShimmerButton(
          text: 'Back to Sign In',
          onPressed: () => context.go(AppRoutes.login),
          fullWidth: true,
          height: AppSizes.buttonHeightLg,
        ),

        const SizedBox(height: 16),

        // Resend link
        TextButton(
          onPressed: () {
            setState(() => _emailSent = false);
          },
          child: Text(
            'Didn\'t receive the email? Try again',
            style: AppTextStyles.labelMedium.copyWith(
              color: AppColors.teal,
            ),
          ),
        ),

        const SizedBox(height: 32),
      ],
    );
  }
}
