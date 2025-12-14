import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/router/app_router.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/analytics_provider.dart';
import '../../../widgets/magic_ui/magic_ui.dart';

/// Login screen
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _rememberMe = false;
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      await ref.read(authStateProvider.notifier).signIn(
            email: _emailController.text.trim(),
            password: _passwordController.text,
          );

      // Check auth state for errors
      final authState = ref.read(authStateProvider);
      if (authState.hasValue && authState.value!.error != null) {
        // Track login failure
        ref.read(analyticsNotifierProvider.notifier).logLoginFailed(
              error: authState.value!.error!,
            );
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(authState.value!.error!),
              backgroundColor: Colors.red,
            ),
          );
        }
      } else {
        // Track successful login
        ref.read(analyticsNotifierProvider.notifier).logLogin(loginMethod: 'email');
      }
      // Navigation is handled by router redirect based on auth state
    } catch (e) {
      // Track login failure
      ref.read(analyticsNotifierProvider.notifier).logLoginFailed(error: e.toString());
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Login failed: ${e.toString()}'),
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

  Future<void> _handleGoogleSignIn() async {
    setState(() => _isLoading = true);
    try {
      await ref.read(authStateProvider.notifier).signInWithGoogle();
      // OAuth opens browser, auth state listener handles the rest
      // Track login attempt (success tracked when auth state changes)
      ref.read(analyticsNotifierProvider.notifier).logLogin(loginMethod: 'google');
    } catch (e) {
      ref.read(analyticsNotifierProvider.notifier).logLoginFailed(error: 'google: ${e.toString()}');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Google sign-in failed: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _handleDiscordSignIn() async {
    setState(() => _isLoading = true);
    try {
      await ref.read(authStateProvider.notifier).signInWithDiscord();
      ref.read(analyticsNotifierProvider.notifier).logLogin(loginMethod: 'discord');
    } catch (e) {
      ref.read(analyticsNotifierProvider.notifier).logLoginFailed(error: 'discord: ${e.toString()}');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Discord sign-in failed: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _handleLinkedInSignIn() async {
    setState(() => _isLoading = true);
    try {
      await ref.read(authStateProvider.notifier).signInWithLinkedIn();
      ref.read(analyticsNotifierProvider.notifier).logLogin(loginMethod: 'linkedin');
    } catch (e) {
      ref.read(analyticsNotifierProvider.notifier).logLoginFailed(error: 'linkedin: ${e.toString()}');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('LinkedIn sign-in failed: ${e.toString()}'),
            backgroundColor: AppColors.error,
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
    // Force dark theme for input fields since this screen uses dark background
    return Theme(
      data: Theme.of(context).copyWith(
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: AppColors.surfaceDark,
          hintStyle: TextStyle(color: AppColors.textMutedDark),
          labelStyle: TextStyle(color: AppColors.textSecondaryDark),
          prefixIconColor: AppColors.textSecondaryDark,
          suffixIconColor: AppColors.textSecondaryDark,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: AppColors.borderDark),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: AppColors.borderDark),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: AppColors.teal, width: 2),
          ),
        ),
      ),
      child: Scaffold(
        backgroundColor: AppColors.backgroundDark,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          leading: IconButton(
            icon: Icon(Icons.arrow_back, color: AppColors.textPrimaryDark),
            onPressed: () => context.go('/'),
          ),
        ),
        body: SafeArea(
          child: SingleChildScrollView(
            padding: AppSpacing.screenPadding,
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                const SizedBox(height: 16),

                // Logo
                Center(
                  child: Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      gradient: AppColors.brandGradient,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Center(
                      child: Text(
                        'CH',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Center(
                  child: Text(
                    'Coastal Haven',
                    style: AppTextStyles.h3.copyWith(
                      color: AppColors.textPrimaryDark,
                    ),
                  ),
                ),

                const SizedBox(height: 48),

                // Title
                Text(
                  'Welcome back',
                  style: AppTextStyles.h2.copyWith(
                    color: AppColors.textPrimaryDark,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Sign in to continue',
                  style: AppTextStyles.bodyLarge.copyWith(
                    color: AppColors.textSecondaryDark,
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

                const SizedBox(height: 16),

                // Password field
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  style: TextStyle(color: AppColors.textPrimaryDark),
                  decoration: InputDecoration(
                    labelText: 'Password',
                    hintText: 'Enter your password',
                    prefixIcon: const Icon(Icons.lock_outlined),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword
                            ? Icons.visibility_outlined
                            : Icons.visibility_off_outlined,
                      ),
                      onPressed: () {
                        setState(() {
                          _obscurePassword = !_obscurePassword;
                        });
                      },
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your password';
                    }
                    return null;
                  },
                ),

                const SizedBox(height: 16),

                // Remember me & Forgot password
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        SizedBox(
                          height: 24,
                          width: 24,
                          child: Checkbox(
                            value: _rememberMe,
                            onChanged: (value) {
                              setState(() {
                                _rememberMe = value ?? false;
                              });
                            },
                            activeColor: AppColors.teal,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Remember me',
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: AppColors.textSecondaryDark,
                          ),
                        ),
                      ],
                    ),
                    GestureDetector(
                      onTap: () => context.go(AppRoutes.forgotPassword),
                      child: Text(
                        'Forgot password?',
                        style: AppTextStyles.labelMedium.copyWith(
                          color: AppColors.teal,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 32),

                // Sign in button
                ShimmerButton(
                  text: 'Sign In',
                  onPressed: _isLoading ? null : _handleLogin,
                  isLoading: _isLoading,
                  fullWidth: true,
                  height: AppSizes.buttonHeightLg,
                ),

                const SizedBox(height: 24),

                // Divider
                Row(
                  children: [
                    Expanded(
                      child: Divider(color: AppColors.borderDark),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Text(
                        'or continue with',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.textMutedDark,
                        ),
                      ),
                    ),
                    Expanded(
                      child: Divider(color: AppColors.borderDark),
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // Social login buttons
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _isLoading ? null : _handleGoogleSignIn,
                        icon: const Icon(Icons.g_mobiledata, size: 24),
                        label: const Text('Google'),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _isLoading ? null : _handleDiscordSignIn,
                        icon: const Icon(Icons.discord, size: 20),
                        label: const Text('Discord'),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _isLoading ? null : _handleLinkedInSignIn,
                        icon: const Icon(Icons.link, size: 20),
                        label: const Text('LinkedIn'),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 32),

                // Sign up link
                Center(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Don\'t have an account? ',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.textSecondaryDark,
                        ),
                      ),
                      GestureDetector(
                        onTap: () => context.go(AppRoutes.roleSelection),
                        child: Text(
                          'Sign up',
                          style: AppTextStyles.labelMedium.copyWith(
                            color: AppColors.teal,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
