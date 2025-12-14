import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/router/app_router.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/profile_provider.dart';
import '../../../data/services/profile_service.dart';
import '../../../widgets/magic_ui/magic_ui.dart';

/// Firm types
const List<String> _firmTypes = [
  'Investment Bank',
  'Private Equity',
  'Venture Capital',
  'Hedge Fund',
  'Asset Management',
  'Boutique Advisory',
  'Corporate M&A',
  'Family Office',
  'Search Fund',
  'Other',
];

/// Roles at firm
const List<String> _firmRoles = [
  'Managing Director',
  'Partner',
  'Principal',
  'Vice President',
  'Director',
  'Associate',
  'Analyst',
  'HR / Recruiting Lead',
  'Talent Acquisition',
  'Campus Recruiter',
  'Other',
];

/// Firm sizes
const List<String> _firmSizes = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '500+ employees',
];

/// Recruiter profile completion screen - collects firm details and role
class CompleteProfileRecruiterScreen extends ConsumerStatefulWidget {
  const CompleteProfileRecruiterScreen({super.key});

  @override
  ConsumerState<CompleteProfileRecruiterScreen> createState() =>
      _CompleteProfileRecruiterScreenState();
}

class _CompleteProfileRecruiterScreenState
    extends ConsumerState<CompleteProfileRecruiterScreen> {
  final _formKey = GlobalKey<FormState>();
  int _currentStep = 0;

  // Step 1: Firm Details
  final _firmNameController = TextEditingController();
  final _firmWebsiteController = TextEditingController();
  String? _selectedFirmType;
  String? _selectedFirmSize;

  // Step 2: Your Role
  String? _selectedRole;
  final _titleController = TextEditingController();
  final _linkedInController = TextEditingController();
  final _phoneController = TextEditingController();

  // State
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    // Check auth on screen load
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkAuthStatus();
    });
  }

  Future<void> _checkAuthStatus() async {
    final user = ref.read(currentUserProvider);
    if (user == null) {
      // Show dialog explaining they need to sign up first
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          backgroundColor: AppColors.surfaceDark,
          title: Row(
            children: [
              Icon(Icons.account_circle_outlined, color: AppColors.warning),
              const SizedBox(width: 8),
              Text('Sign Up Required', style: TextStyle(color: AppColors.textPrimaryDark)),
            ],
          ),
          content: Text(
            'You need to create an account before completing your profile.\n\n'
            'This ensures your information is saved securely.',
            style: TextStyle(color: AppColors.textSecondaryDark),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                context.go(AppRoutes.splash);
              },
              child: const Text('Go Back'),
            ),
            FilledButton(
              onPressed: () {
                Navigator.pop(context);
                context.go(AppRoutes.signupRecruiter);
              },
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.teal,
              ),
              child: const Text('Sign Up'),
            ),
          ],
        ),
      );
      return;
    }

    // Check if profile is already complete - redirect to dashboard if so
    try {
      final hasProfile = await ref.read(hasRoleProfileProvider.future);
      if (hasProfile && mounted) {
        context.go(AppRoutes.recruiter);
      }
    } catch (e) {
      // Error checking profile, allow user to continue with profile completion
      debugPrint('Error checking profile completion: $e');
    }
  }

  @override
  void dispose() {
    _firmNameController.dispose();
    _firmWebsiteController.dispose();
    _titleController.dispose();
    _linkedInController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  bool _validateStep(int step) {
    switch (step) {
      case 0: // Firm Details
        if (_firmNameController.text.isEmpty) {
          _showError('Please enter your firm name');
          return false;
        }
        if (_selectedFirmType == null) {
          _showError('Please select your firm type');
          return false;
        }
        return true;
      case 1: // Your Role
        if (_selectedRole == null) {
          _showError('Please select your role');
          return false;
        }
        return true;
      default:
        return true;
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.error,
      ),
    );
  }

  void _nextStep() {
    if (_validateStep(_currentStep)) {
      if (_currentStep < 1) {
        setState(() => _currentStep++);
      } else {
        _completeProfile();
      }
    }
  }

  void _previousStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
    }
  }


  Future<void> _completeProfile() async {
    setState(() => _isLoading = true);

    try {
      // Get current user
      final user = ref.read(currentUserProvider);

      if (user == null) {
        _showError('You must be logged in to complete your profile');
        setState(() => _isLoading = false);
        return;
      }

      // Determine job title - use selected role or custom title
      final jobTitle = _titleController.text.isNotEmpty
          ? _titleController.text
          : _selectedRole ?? 'Recruiter';

      // Save to Supabase
      final profileId = await ProfileService.instance.saveRecruiterProfile(
        userId: user.id,
        firmName: _firmNameController.text,
        jobTitle: jobTitle,
        firmType: _selectedFirmType,
        firmSize: _selectedFirmSize,
        linkedInUrl: _linkedInController.text.isNotEmpty
            ? _linkedInController.text
            : null,
        phone: _phoneController.text.isNotEmpty ? _phoneController.text : null,
      );

      // Also update LinkedIn/phone in main profiles table if provided
      if (_linkedInController.text.isNotEmpty) {
        await ProfileService.instance
            .updateLinkedInUrl(user.id, _linkedInController.text);
      }
      if (_phoneController.text.isNotEmpty) {
        await ProfileService.instance.updatePhone(user.id, _phoneController.text);
      }

      if (mounted) {
        if (profileId != null) {
          // Success - show dialog then navigate
          await showDialog(
            context: context,
            builder: (context) => AlertDialog(
              backgroundColor: AppColors.surfaceDark,
              title: Row(
                children: [
                  Icon(Icons.check_circle, color: AppColors.success),
                  const SizedBox(width: 8),
                  Text('Profile Complete!',
                      style: TextStyle(color: AppColors.textPrimaryDark)),
                ],
              ),
              content: Text(
                'Your recruiter profile has been saved.\n\n'
                'Firm: ${_firmNameController.text}\n'
                'Type: ${_selectedFirmType ?? "N/A"}\n'
                'Role: ${_selectedRole ?? "N/A"}',
                style: TextStyle(color: AppColors.textSecondaryDark),
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.pop(context);
                    context.go(AppRoutes.recruiter);
                  },
                  child: const Text('Go to Dashboard'),
                ),
              ],
            ),
          );
        } else {
          _showError('Failed to save profile. Please try again.');
        }
      }
    } catch (e) {
      if (mounted) {
        _showError('Failed to complete profile: ${e.toString()}');
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
        title: Text(
          'Complete Your Profile',
          style: AppTextStyles.h4.copyWith(color: AppColors.textPrimaryDark),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.textPrimaryDark),
          onPressed: _currentStep > 0 ? _previousStep : () => context.go(AppRoutes.splash),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Progress indicator
            _buildProgressIndicator(),

            // Form content
            Expanded(
              child: SingleChildScrollView(
                padding: AppSpacing.screenPadding,
                child: Form(
                  key: _formKey,
                  child: _buildCurrentStep(),
                ),
              ),
            ),

            // Bottom buttons
            _buildBottomButtons(),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressIndicator() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Row(
        children: [
          _buildStepIndicator(0, 'Firm'),
          _buildStepConnector(0),
          _buildStepIndicator(1, 'Your Role'),
        ],
      ),
    );
  }

  Widget _buildStepIndicator(int step, String label) {
    final isActive = _currentStep >= step;
    final isCurrent = _currentStep == step;

    return Expanded(
      child: Column(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isActive ? AppColors.teal : AppColors.surfaceDark,
              border: Border.all(
                color: isCurrent ? AppColors.teal : AppColors.borderDark,
                width: 2,
              ),
            ),
            child: Center(
              child: isActive && !isCurrent
                  ? const Icon(Icons.check, size: 16, color: Colors.white)
                  : Text(
                      '${step + 1}',
                      style: AppTextStyles.labelMedium.copyWith(
                        color: isActive ? Colors.white : AppColors.textMutedDark,
                      ),
                    ),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: AppTextStyles.labelSmall.copyWith(
              color: isActive ? AppColors.textPrimaryDark : AppColors.textMutedDark,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepConnector(int afterStep) {
    final isActive = _currentStep > afterStep;
    return Container(
      width: 40,
      height: 2,
      color: isActive ? AppColors.teal : AppColors.borderDark,
    );
  }

  Widget _buildCurrentStep() {
    switch (_currentStep) {
      case 0:
        return _buildFirmDetailsStep();
      case 1:
        return _buildRoleStep();
      default:
        return _buildFirmDetailsStep();
    }
  }

  Widget _buildFirmDetailsStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Firm Details',
          style: AppTextStyles.h3.copyWith(color: AppColors.textPrimaryDark),
        ),
        const SizedBox(height: 8),
        Text(
          'Tell us about your firm',
          style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondaryDark),
        ),
        const SizedBox(height: 24),

        // Firm name
        TextFormField(
          controller: _firmNameController,
          textCapitalization: TextCapitalization.words,
          style: TextStyle(color: AppColors.textPrimaryDark),
          decoration: const InputDecoration(
            labelText: 'Firm Name *',
            hintText: 'e.g., Goldman Sachs',
            prefixIcon: Icon(Icons.business_outlined),
          ),
        ),
        const SizedBox(height: 16),

        // Firm website
        TextFormField(
          controller: _firmWebsiteController,
          keyboardType: TextInputType.url,
          style: TextStyle(color: AppColors.textPrimaryDark),
          decoration: const InputDecoration(
            labelText: 'Firm Website',
            hintText: 'https://yourfirm.com',
            prefixIcon: Icon(Icons.language_outlined),
          ),
        ),
        const SizedBox(height: 16),

        // Firm type dropdown
        DropdownButtonFormField<String>(
          initialValue: _selectedFirmType,
          dropdownColor: AppColors.surfaceDark,
          style: TextStyle(color: AppColors.textPrimaryDark),
          decoration: const InputDecoration(
            labelText: 'Firm Type *',
            prefixIcon: Icon(Icons.category_outlined),
          ),
          items: _firmTypes.map((type) {
            return DropdownMenuItem(
              value: type,
              child: Text(type),
            );
          }).toList(),
          onChanged: (value) {
            setState(() => _selectedFirmType = value);
          },
        ),
        const SizedBox(height: 16),

        // Firm size dropdown
        DropdownButtonFormField<String>(
          initialValue: _selectedFirmSize,
          dropdownColor: AppColors.surfaceDark,
          style: TextStyle(color: AppColors.textPrimaryDark),
          decoration: const InputDecoration(
            labelText: 'Firm Size',
            prefixIcon: Icon(Icons.people_outline),
          ),
          items: _firmSizes.map((size) {
            return DropdownMenuItem(
              value: size,
              child: Text(size),
            );
          }).toList(),
          onChanged: (value) {
            setState(() => _selectedFirmSize = value);
          },
        ),
      ],
    );
  }

  Widget _buildRoleStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Your Role',
          style: AppTextStyles.h3.copyWith(color: AppColors.textPrimaryDark),
        ),
        const SizedBox(height: 8),
        Text(
          'Tell us about your position',
          style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondaryDark),
        ),
        const SizedBox(height: 24),

        // Role dropdown
        DropdownButtonFormField<String>(
          initialValue: _selectedRole,
          dropdownColor: AppColors.surfaceDark,
          style: TextStyle(color: AppColors.textPrimaryDark),
          decoration: const InputDecoration(
            labelText: 'Role *',
            prefixIcon: Icon(Icons.badge_outlined),
          ),
          items: _firmRoles.map((role) {
            return DropdownMenuItem(
              value: role,
              child: Text(role),
            );
          }).toList(),
          onChanged: (value) {
            setState(() => _selectedRole = value);
          },
        ),
        const SizedBox(height: 16),

        // Title
        TextFormField(
          controller: _titleController,
          textCapitalization: TextCapitalization.words,
          style: TextStyle(color: AppColors.textPrimaryDark),
          decoration: const InputDecoration(
            labelText: 'Job Title',
            hintText: 'e.g., Vice President of Recruiting',
            prefixIcon: Icon(Icons.work_outline),
          ),
        ),
        const SizedBox(height: 16),

        // LinkedIn URL
        TextFormField(
          controller: _linkedInController,
          keyboardType: TextInputType.url,
          style: TextStyle(color: AppColors.textPrimaryDark),
          decoration: const InputDecoration(
            labelText: 'LinkedIn Profile',
            hintText: 'https://linkedin.com/in/yourprofile',
            prefixIcon: Icon(Icons.link),
          ),
        ),
        const SizedBox(height: 16),

        // Phone
        TextFormField(
          controller: _phoneController,
          keyboardType: TextInputType.phone,
          style: TextStyle(color: AppColors.textPrimaryDark),
          decoration: const InputDecoration(
            labelText: 'Phone Number',
            hintText: '+1 (555) 123-4567',
            prefixIcon: Icon(Icons.phone_outlined),
          ),
        ),
        const SizedBox(height: 32),

        // Summary
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surfaceDark,
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(color: AppColors.borderDark),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.business, color: AppColors.teal, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _firmNameController.text.isNotEmpty
                          ? _firmNameController.text
                          : 'Your Firm',
                      style: AppTextStyles.labelLarge.copyWith(
                        color: AppColors.textPrimaryDark,
                      ),
                    ),
                  ),
                ],
              ),
              if (_selectedFirmType != null) ...[
                const SizedBox(height: 8),
                Text(
                  _selectedFirmType!,
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.textSecondaryDark,
                  ),
                ),
              ],
              if (_selectedRole != null) ...[
                const SizedBox(height: 4),
                Text(
                  _selectedRole!,
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.textMutedDark,
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBottomButtons() {
    return Container(
      padding: AppSpacing.screenPadding.copyWith(top: 16, bottom: 16),
      decoration: BoxDecoration(
        color: AppColors.surfaceDark,
        border: Border(
          top: BorderSide(color: AppColors.borderDark),
        ),
      ),
      child: Row(
        children: [
          if (_currentStep > 0)
            Expanded(
              child: OutlinedButton(
                onPressed: _previousStep,
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('Back'),
              ),
            ),
          if (_currentStep > 0) const SizedBox(width: 16),
          Expanded(
            flex: _currentStep == 0 ? 1 : 2,
            child: ShimmerButton(
              text: _currentStep == 1 ? 'Complete Profile' : 'Continue',
              onPressed: _isLoading ? null : _nextStep,
              isLoading: _isLoading,
              fullWidth: true,
              height: AppSizes.buttonHeightLg,
            ),
          ),
        ],
      ),
    );
  }
}
