import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../data/services/supabase_service.dart';
import '../../../widgets/magic_ui/magic_ui.dart';

/// MFA Setup Screen - Allows users to enroll in two-factor authentication
class MfaSetupScreen extends ConsumerStatefulWidget {
  const MfaSetupScreen({super.key});

  @override
  ConsumerState<MfaSetupScreen> createState() => _MfaSetupScreenState();
}

class _MfaSetupScreenState extends ConsumerState<MfaSetupScreen> {
  // Enrollment state
  bool _isLoading = true;
  String? _errorMessage;
  String? _totpUri;
  String? _secret;
  String? _factorId;

  // Verification state
  final List<TextEditingController> _controllers =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());
  bool _isVerifying = false;
  bool _showSecret = false;

  @override
  void initState() {
    super.initState();
    _enrollMfa();
  }

  @override
  void dispose() {
    for (final controller in _controllers) {
      controller.dispose();
    }
    for (final node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  String get _code => _controllers.map((c) => c.text).join();
  bool get _isCodeComplete => _code.length == 6;

  Future<void> _enrollMfa() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await SupabaseService.instance.mfaEnroll();

      if (mounted) {
        setState(() {
          _totpUri = response.totp?.uri;
          _secret = response.totp?.secret;
          _factorId = response.id;
          _isLoading = false;
        });

        // Focus first verification field
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (_focusNodes.isNotEmpty) {
            _focusNodes[0].requestFocus();
          }
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Failed to initialize MFA setup: ${e.toString()}';
          _isLoading = false;
        });
      }
    }
  }

  void _onDigitChanged(int index, String value) {
    setState(() => _errorMessage = null);

    if (value.length == 1 && index < 5) {
      _focusNodes[index + 1].requestFocus();
    } else if (value.isEmpty && index > 0) {
      _focusNodes[index - 1].requestFocus();
    }

    if (_isCodeComplete) {
      _verifyAndComplete();
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

    final digits = pastedText.replaceAll(RegExp(r'[^0-9]'), '');
    if (digits.isEmpty) return;

    for (int i = 0; i < 6 && i < digits.length; i++) {
      _controllers[i].text = digits[i];
    }

    if (digits.length >= 6) {
      _focusNodes[5].requestFocus();
      _verifyAndComplete();
    } else {
      _focusNodes[digits.length.clamp(0, 5)].requestFocus();
    }
    setState(() {});
  }

  Future<void> _verifyAndComplete() async {
    if (!_isCodeComplete || _isVerifying || _factorId == null) return;

    setState(() {
      _isVerifying = true;
      _errorMessage = null;
    });

    try {
      // First create a challenge
      final challenge = await SupabaseService.instance.mfaChallenge(
        factorId: _factorId!,
      );

      // Then verify the code
      await SupabaseService.instance.mfaVerify(
        factorId: _factorId!,
        challengeId: challenge.id,
        code: _code,
      );

      // MFA is now enabled - generate and store recovery codes
      final recoveryResult = await SupabaseService.instance.storeRecoveryCodes();

      if (mounted) {
        if (recoveryResult['success'] == true) {
          final codes = List<String>.from(recoveryResult['codes'] ?? []);
          // Show recovery codes dialog (user must dismiss before proceeding)
          await showDialog(
            context: context,
            barrierDismissible: false,
            builder: (context) => _RecoveryCodesDialog(codes: codes),
          );
        }

        // Show success and navigate back
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Two-factor authentication enabled successfully!'),
            backgroundColor: AppColors.success,
          ),
        );
        context.pop(true); // Return true to indicate success
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Invalid code. Please try again.';
          _isVerifying = false;
        });
        // Clear fields
        for (final controller in _controllers) {
          controller.clear();
        }
        _focusNodes[0].requestFocus();
      }
    }
  }

  void _copySecret() {
    if (_secret != null) {
      Clipboard.setData(ClipboardData(text: _secret!));
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Secret key copied to clipboard'),
          duration: Duration(seconds: 2),
        ),
      );
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
          icon: const Icon(Icons.close, color: AppColors.textPrimaryDark),
          onPressed: () => context.pop(false),
        ),
        title: Text(
          'Set Up 2FA',
          style: AppTextStyles.h4.copyWith(color: AppColors.textPrimaryDark),
        ),
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _errorMessage != null && _totpUri == null
                ? _buildErrorState()
                : _buildSetupContent(),
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Padding(
        padding: AppSpacing.screenPadding,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: AppColors.error,
            ),
            const SizedBox(height: 16),
            Text(
              _errorMessage!,
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textSecondaryDark,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ShimmerButton(
              text: 'Try Again',
              onPressed: _enrollMfa,
              fullWidth: false,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSetupContent() {
    return SingleChildScrollView(
      padding: AppSpacing.screenPadding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Step 1: Scan QR Code
          _buildStepHeader(1, 'Scan QR Code'),
          const SizedBox(height: 8),
          Text(
            'Open your authenticator app and scan this QR code:',
            style: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.textSecondaryDark,
            ),
          ),
          const SizedBox(height: 20),

          // QR Code
          Center(
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
              child: _totpUri != null
                  ? QrImageView(
                      data: _totpUri!,
                      version: QrVersions.auto,
                      size: 200,
                      backgroundColor: Colors.white,
                    )
                  : const SizedBox(
                      width: 200,
                      height: 200,
                      child: Center(child: CircularProgressIndicator()),
                    ),
            ),
          ),

          const SizedBox(height: 16),

          // Manual entry option
          Center(
            child: TextButton(
              onPressed: () => setState(() => _showSecret = !_showSecret),
              child: Text(
                _showSecret ? 'Hide secret key' : "Can't scan? Enter manually",
                style: AppTextStyles.labelMedium.copyWith(
                  color: AppColors.teal,
                ),
              ),
            ),
          ),

          if (_showSecret && _secret != null) ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.cardDark,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.borderDark),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Secret Key:',
                    style: AppTextStyles.caption.copyWith(
                      color: AppColors.textMutedDark,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          _secret!,
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: AppColors.textPrimaryDark,
                            fontFamily: 'monospace',
                            letterSpacing: 1.5,
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.copy, size: 20),
                        color: AppColors.teal,
                        onPressed: _copySecret,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 32),

          // Step 2: Enter Verification Code
          _buildStepHeader(2, 'Enter Verification Code'),
          const SizedBox(height: 8),
          Text(
            'Enter the 6-digit code from your authenticator app:',
            style: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.textSecondaryDark,
            ),
          ),
          const SizedBox(height: 20),

          // Code input
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
                      Clipboard.getData(Clipboard.kTextPlain).then((data) {
                        if (data?.text != null && data!.text!.length >= 6) {
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
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.red.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.error_outline, color: Colors.red, size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      _errorMessage!,
                      style: AppTextStyles.bodySmall.copyWith(color: Colors.red),
                    ),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 32),

          // Verify Button
          ShimmerButton(
            text: _isVerifying ? 'Verifying...' : 'Enable 2FA',
            onPressed: (_isCodeComplete && !_isVerifying) ? _verifyAndComplete : null,
            isLoading: _isVerifying,
            fullWidth: true,
            height: AppSizes.buttonHeightLg,
          ),

          const SizedBox(height: 24),

          // Info box
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.teal.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.teal.withValues(alpha: 0.3)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.info_outline, color: AppColors.teal, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Recommended authenticator apps:\n• Google Authenticator\n• Authy\n• Microsoft Authenticator',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.textSecondaryDark,
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
    );
  }

  Widget _buildStepHeader(int step, String title) {
    return Row(
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            color: AppColors.teal,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Center(
            child: Text(
              '$step',
              style: AppTextStyles.labelMedium.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Text(
          title,
          style: AppTextStyles.h4.copyWith(
            color: AppColors.textPrimaryDark,
          ),
        ),
      ],
    );
  }
}

/// Dialog to display recovery codes after MFA setup
/// User must save these codes before proceeding
class _RecoveryCodesDialog extends StatefulWidget {
  final List<String> codes;

  const _RecoveryCodesDialog({required this.codes});

  @override
  State<_RecoveryCodesDialog> createState() => _RecoveryCodesDialogState();
}

class _RecoveryCodesDialogState extends State<_RecoveryCodesDialog> {
  bool _hasCopied = false;
  bool _hasConfirmed = false;

  void _copyAllCodes() {
    final codesText = widget.codes.join('\n');
    Clipboard.setData(ClipboardData(text: codesText));
    setState(() => _hasCopied = true);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Recovery codes copied to clipboard'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: AppColors.cardDark,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      title: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.warning.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              Icons.key,
              color: AppColors.warning,
              size: 24,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'Save Your Recovery Codes',
              style: AppTextStyles.h4.copyWith(
                color: AppColors.textPrimaryDark,
              ),
            ),
          ),
        ],
      ),
      content: SizedBox(
        width: double.maxFinite,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.warning.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: AppColors.warning.withValues(alpha: 0.3),
                ),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.warning_amber_rounded,
                    color: AppColors.warning,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Save these codes in a safe place. You won\'t be able to see them again!',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.warning,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Use these codes to access your account if you lose your authenticator:',
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.textSecondaryDark,
              ),
            ),
            const SizedBox(height: 12),
            // Recovery codes grid
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.backgroundDark,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.borderDark),
              ),
              child: Column(
                children: [
                  for (int i = 0; i < widget.codes.length; i += 2)
                    Padding(
                      padding: EdgeInsets.only(
                        bottom: i < widget.codes.length - 2 ? 8 : 0,
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              widget.codes[i],
                              style: AppTextStyles.bodyMedium.copyWith(
                                color: AppColors.textPrimaryDark,
                                fontFamily: 'monospace',
                                letterSpacing: 1,
                              ),
                            ),
                          ),
                          if (i + 1 < widget.codes.length)
                            Expanded(
                              child: Text(
                                widget.codes[i + 1],
                                style: AppTextStyles.bodyMedium.copyWith(
                                  color: AppColors.textPrimaryDark,
                                  fontFamily: 'monospace',
                                  letterSpacing: 1,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            // Copy button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: _copyAllCodes,
                icon: Icon(
                  _hasCopied ? Icons.check : Icons.copy,
                  size: 18,
                ),
                label: Text(_hasCopied ? 'Copied!' : 'Copy All Codes'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.teal,
                  side: const BorderSide(color: AppColors.teal),
                ),
              ),
            ),
            const SizedBox(height: 16),
            // Confirmation checkbox
            GestureDetector(
              onTap: () => setState(() => _hasConfirmed = !_hasConfirmed),
              child: Row(
                children: [
                  SizedBox(
                    height: 24,
                    width: 24,
                    child: Checkbox(
                      value: _hasConfirmed,
                      onChanged: (v) => setState(() => _hasConfirmed = v ?? false),
                      activeColor: AppColors.teal,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'I have saved these recovery codes',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.textSecondaryDark,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      actions: [
        SizedBox(
          width: double.infinity,
          child: ShimmerButton(
            text: 'Done',
            onPressed: _hasConfirmed ? () => Navigator.of(context).pop() : null,
            fullWidth: true,
          ),
        ),
      ],
    );
  }
}
