import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/router/app_router.dart';
import '../../../widgets/magic_ui/magic_ui.dart';

/// MFA verification screen for two-factor authentication
class MfaScreen extends ConsumerStatefulWidget {
  const MfaScreen({super.key});

  @override
  ConsumerState<MfaScreen> createState() => _MfaScreenState();
}

class _MfaScreenState extends ConsumerState<MfaScreen> {
  final List<TextEditingController> _controllers =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());

  bool _isVerifying = false;
  bool _rememberDevice = false;
  int _resendCooldown = 0;
  Timer? _cooldownTimer;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    // Auto-focus first field
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focusNodes[0].requestFocus();
    });
  }

  @override
  void dispose() {
    for (final controller in _controllers) {
      controller.dispose();
    }
    for (final node in _focusNodes) {
      node.dispose();
    }
    _cooldownTimer?.cancel();
    super.dispose();
  }

  String get _code => _controllers.map((c) => c.text).join();

  bool get _isCodeComplete => _code.length == 6;

  void _onDigitChanged(int index, String value) {
    setState(() => _errorMessage = null);

    if (value.length == 1 && index < 5) {
      // Move to next field
      _focusNodes[index + 1].requestFocus();
    } else if (value.isEmpty && index > 0) {
      // Move to previous field on backspace
      _focusNodes[index - 1].requestFocus();
    }

    // Auto-submit when complete
    if (_isCodeComplete) {
      _verifyCode();
    }
  }

  void _onKeyEvent(int index, KeyEvent event) {
    if (event is KeyDownEvent &&
        event.logicalKey == LogicalKeyboardKey.backspace &&
        _controllers[index].text.isEmpty &&
        index > 0) {
      _focusNodes[index - 1].requestFocus();
    }
  }

  void _handlePaste(String? pastedText) {
    if (pastedText == null) return;

    // Extract only digits
    final digits = pastedText.replaceAll(RegExp(r'[^0-9]'), '');
    if (digits.isEmpty) return;

    // Fill in the fields
    for (int i = 0; i < 6 && i < digits.length; i++) {
      _controllers[i].text = digits[i];
    }

    // Focus last filled field or submit
    if (digits.length >= 6) {
      _focusNodes[5].requestFocus();
      _verifyCode();
    } else {
      _focusNodes[digits.length.clamp(0, 5)].requestFocus();
    }
    setState(() {});
  }

  void _startCooldown() {
    setState(() => _resendCooldown = 30);
    _cooldownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_resendCooldown > 0) {
        setState(() => _resendCooldown--);
      } else {
        timer.cancel();
      }
    });
  }

  Future<void> _resendCode() async {
    if (_resendCooldown > 0) return;

    try {
      // TODO: Implement resend MFA code via Supabase
      await Future.delayed(const Duration(milliseconds: 500));

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('New verification code sent!'),
            backgroundColor: Colors.green,
          ),
        );
        _startCooldown();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to resend code: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _verifyCode() async {
    if (!_isCodeComplete || _isVerifying) return;

    setState(() {
      _isVerifying = true;
      _errorMessage = null;
    });

    try {
      // TODO: Implement MFA verification via Supabase
      await Future.delayed(const Duration(seconds: 1));

      // Simulate validation - replace with actual Supabase MFA verification
      if (_code == '123456') {
        // Success - navigate to appropriate dashboard
        if (mounted) {
          // TODO: Get user role and navigate accordingly
          context.go(AppRoutes.candidate);
        }
      } else {
        // Invalid code
        setState(() {
          _errorMessage = 'Invalid verification code. Please try again.';
        });
        // Clear the fields
        for (final controller in _controllers) {
          controller.clear();
        }
        _focusNodes[0].requestFocus();
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Verification failed: ${e.toString()}';
      });
    } finally {
      if (mounted) {
        setState(() => _isVerifying = false);
      }
    }
  }

  void _useRecoveryCode() {
    // Show recovery code dialog
    showDialog(
      context: context,
      builder: (context) => _RecoveryCodeDialog(
        onSubmit: (recoveryCode) async {
          // TODO: Implement recovery code verification
          Navigator.of(context).pop();
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Recovery code functionality coming soon'),
                backgroundColor: Colors.orange,
              ),
            );
          }
        },
      ),
    );
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
        child: GestureDetector(
          onTap: () => FocusScope.of(context).unfocus(),
          child: SingleChildScrollView(
            padding: AppSpacing.screenPadding,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 24),

                // Shield icon
                Center(
                  child: Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          AppColors.teal.withValues(alpha: 0.2),
                          AppColors.emerald.withValues(alpha: 0.1),
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(28),
                    ),
                    child: const Icon(
                      Icons.security_outlined,
                      size: 48,
                      color: AppColors.teal,
                    ),
                  ),
                ),

                const SizedBox(height: 32),

                // Title
                Text(
                  'Two-Factor Authentication',
                  style: AppTextStyles.h2.copyWith(
                    color: AppColors.textPrimaryDark,
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 12),

                // Subtitle
                Text(
                  'Enter the 6-digit code from your authenticator app',
                  style: AppTextStyles.bodyLarge.copyWith(
                    color: AppColors.textSecondaryDark,
                    height: 1.4,
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 40),

                // Code input fields
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(6, (index) {
                    return Container(
                      width: 48,
                      height: 56,
                      margin: EdgeInsets.only(
                        left: index == 0 ? 0 : 4,
                        right: index == 2 ? 12 : (index == 5 ? 0 : 4),
                      ),
                      child: KeyboardListener(
                        focusNode: FocusNode(),
                        onKeyEvent: (event) => _onKeyEvent(index, event),
                        child: TextFormField(
                          controller: _controllers[index],
                          focusNode: _focusNodes[index],
                          keyboardType: TextInputType.number,
                          textAlign: TextAlign.center,
                          maxLength: 1,
                          style: AppTextStyles.h3.copyWith(
                            color: AppColors.textPrimaryDark,
                          ),
                          decoration: InputDecoration(
                            counterText: '',
                            contentPadding: EdgeInsets.zero,
                            filled: true,
                            fillColor: _errorMessage != null
                                ? Colors.red.withValues(alpha: 0.1)
                                : AppColors.cardDark,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(
                                color: _errorMessage != null
                                    ? Colors.red
                                    : AppColors.borderDark,
                              ),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(
                                color: _errorMessage != null
                                    ? Colors.red
                                    : AppColors.borderDark,
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(
                                color: _errorMessage != null
                                    ? Colors.red
                                    : AppColors.teal,
                                width: 2,
                              ),
                            ),
                          ),
                          inputFormatters: [
                            FilteringTextInputFormatter.digitsOnly,
                          ],
                          onChanged: (value) => _onDigitChanged(index, value),
                          onTap: () {
                            // Handle paste from clipboard
                            Clipboard.getData(Clipboard.kTextPlain)
                                .then((data) {
                              if (data?.text != null &&
                                  data!.text!.length >= 6) {
                                _handlePaste(data.text);
                              }
                            });
                          },
                        ),
                      ),
                    );
                  }),
                ),

                // Error message
                if (_errorMessage != null) ...[
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.red.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: Colors.red.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.error_outline,
                          color: Colors.red,
                          size: 20,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            _errorMessage!,
                            style: AppTextStyles.bodySmall.copyWith(
                              color: Colors.red,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: 32),

                // Remember device checkbox
                GestureDetector(
                  onTap: () {
                    setState(() => _rememberDevice = !_rememberDevice);
                  },
                  child: Container(
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
                      children: [
                        SizedBox(
                          height: 24,
                          width: 24,
                          child: Checkbox(
                            value: _rememberDevice,
                            onChanged: (value) {
                              setState(() => _rememberDevice = value ?? false);
                            },
                            activeColor: AppColors.teal,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Remember this device',
                                style: AppTextStyles.bodyMedium.copyWith(
                                  color: AppColors.textPrimaryDark,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'Don\'t ask for codes on this device for 30 days',
                                style: AppTextStyles.bodySmall.copyWith(
                                  color: AppColors.textMutedDark,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 32),

                // Verify button
                ShimmerButton(
                  text: _isVerifying ? 'Verifying...' : 'Verify',
                  onPressed:
                      (_isCodeComplete && !_isVerifying) ? _verifyCode : null,
                  isLoading: _isVerifying,
                  fullWidth: true,
                  height: AppSizes.buttonHeightLg,
                ),

                const SizedBox(height: 24),

                // Resend code
                Center(
                  child: TextButton(
                    onPressed: (_resendCooldown > 0) ? null : _resendCode,
                    child: Text(
                      _resendCooldown > 0
                          ? 'Resend code in ${_resendCooldown}s'
                          : 'Resend code',
                      style: AppTextStyles.labelMedium.copyWith(
                        color: _resendCooldown > 0
                            ? AppColors.textMutedDark
                            : AppColors.teal,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 8),

                // Recovery code option
                Center(
                  child: TextButton(
                    onPressed: _useRecoveryCode,
                    child: Text(
                      'Use a recovery code instead',
                      style: AppTextStyles.labelMedium.copyWith(
                        color: AppColors.textSecondaryDark,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 32),

                // Help text
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.cardDark,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.borderDark),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        Icons.lightbulb_outline,
                        color: AppColors.textMutedDark,
                        size: 20,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Open your authenticator app (like Google Authenticator or Authy) and enter the 6-digit code shown for Coastal Haven.',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.textMutedDark,
                            height: 1.5,
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
    );
  }
}

/// Dialog for entering recovery code
class _RecoveryCodeDialog extends StatefulWidget {
  final Function(String) onSubmit;

  const _RecoveryCodeDialog({required this.onSubmit});

  @override
  State<_RecoveryCodeDialog> createState() => _RecoveryCodeDialogState();
}

class _RecoveryCodeDialogState extends State<_RecoveryCodeDialog> {
  final _controller = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: AppColors.cardDark,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      title: Text(
        'Recovery Code',
        style: AppTextStyles.h4.copyWith(
          color: AppColors.textPrimaryDark,
        ),
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Enter one of your recovery codes to sign in.',
            style: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.textSecondaryDark,
            ),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _controller,
            style: TextStyle(color: AppColors.textPrimaryDark),
            decoration: const InputDecoration(
              labelText: 'Recovery Code',
              hintText: 'XXXX-XXXX-XXXX',
            ),
            textCapitalization: TextCapitalization.characters,
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: Text(
            'Cancel',
            style: TextStyle(color: AppColors.textSecondaryDark),
          ),
        ),
        TextButton(
          onPressed: _isSubmitting
              ? null
              : () {
                  if (_controller.text.isNotEmpty) {
                    setState(() => _isSubmitting = true);
                    widget.onSubmit(_controller.text);
                  }
                },
          child: Text(
            _isSubmitting ? 'Verifying...' : 'Verify',
            style: TextStyle(color: AppColors.teal),
          ),
        ),
      ],
    );
  }
}
