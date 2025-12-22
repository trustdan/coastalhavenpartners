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

/// List of universities
const List<String> _universities = [
  'Harvard University',
  'Yale University',
  'Princeton University',
  'Stanford University',
  'MIT',
  'Columbia University',
  'University of Pennsylvania',
  'Duke University',
  'Northwestern University',
  'University of Chicago',
  'Dartmouth College',
  'Cornell University',
  'Brown University',
  'Georgetown University',
  'NYU',
  'UCLA',
  'UC Berkeley',
  'University of Michigan',
  'University of Virginia',
  'Notre Dame',
  'Vanderbilt University',
  'Emory University',
  'USC',
  'Boston College',
  'Washington University in St. Louis',
];

/// Departments
const List<String> _departments = [
  'Career Services',
  'Business School Career Center',
  'Undergraduate Career Development',
  'Graduate Career Services',
  'Finance Department',
  'Economics Department',
  'Business Administration',
  'Alumni Relations',
  'Student Affairs',
  'Academic Advising',
  'Other',
];

/// Roles at school
const List<String> _schoolRoles = [
  'Director of Career Services',
  'Associate Director',
  'Career Counselor',
  'Career Coach',
  'Employer Relations Manager',
  'Finance Industry Advisor',
  'Department Head',
  'Professor',
  'Advisor',
  'Administrator',
  'Other',
];

/// School admin profile completion screen - collects school details and role
class CompleteProfileSchoolScreen extends ConsumerStatefulWidget {
  const CompleteProfileSchoolScreen({super.key});

  @override
  ConsumerState<CompleteProfileSchoolScreen> createState() =>
      _CompleteProfileSchoolScreenState();
}

class _CompleteProfileSchoolScreenState
    extends ConsumerState<CompleteProfileSchoolScreen> {
  final _formKey = GlobalKey<FormState>();
  int _currentStep = 0;

  // Step 1: School Details
  final _schoolController = TextEditingController();
  String? _selectedDepartment;

  // Step 2: Your Role
  String? _selectedRole;
  final _titleController = TextEditingController();
  final _phoneController = TextEditingController();
  final _officeController = TextEditingController();

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
                context.go(AppRoutes.signupSchool);
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
        context.go(AppRoutes.school);
      }
    } catch (e) {
      // Error checking profile, allow user to continue with profile completion
      debugPrint('Error checking profile completion: $e');
    }
  }

  @override
  void dispose() {
    _schoolController.dispose();
    _titleController.dispose();
    _phoneController.dispose();
    _officeController.dispose();
    super.dispose();
  }

  bool _validateStep(int step) {
    switch (step) {
      case 0: // School Details
        if (_schoolController.text.isEmpty) {
          _showError('Please select your school');
          return false;
        }
        if (_selectedDepartment == null) {
          _showError('Please select your department');
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

      // Save to Supabase
      final profileId = await ProfileService.instance.saveSchoolProfile(
        userId: user.id,
        schoolName: _schoolController.text,
        departmentName: _selectedDepartment,
        contactPhone:
            _phoneController.text.isNotEmpty ? _phoneController.text : null,
        email: user.email,
        fullName: user.userMetadata?['full_name'] as String?,
      );

      // Also update phone in main profiles table if provided
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
                'Your school admin profile has been saved.\n\n'
                'School: ${_schoolController.text}\n'
                'Department: ${_selectedDepartment ?? "N/A"}\n'
                'Role: ${_selectedRole ?? "N/A"}',
                style: TextStyle(color: AppColors.textSecondaryDark),
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.pop(context);
                    context.go(AppRoutes.school);
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
          _buildStepIndicator(0, 'School'),
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
        return _buildSchoolDetailsStep();
      case 1:
        return _buildRoleStep();
      default:
        return _buildSchoolDetailsStep();
    }
  }

  Widget _buildSchoolDetailsStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'School Details',
          style: AppTextStyles.h3.copyWith(color: AppColors.textPrimaryDark),
        ),
        const SizedBox(height: 8),
        Text(
          'Tell us about your institution',
          style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondaryDark),
        ),
        const SizedBox(height: 24),

        // School autocomplete
        Autocomplete<String>(
          optionsBuilder: (textEditingValue) {
            if (textEditingValue.text.isEmpty) {
              return _universities.take(5);
            }
            return _universities.where((school) =>
                school.toLowerCase().contains(textEditingValue.text.toLowerCase()));
          },
          onSelected: (selection) {
            _schoolController.text = selection;
          },
          optionsViewBuilder: (context, onSelected, options) {
            return Align(
              alignment: Alignment.topLeft,
              child: Material(
                color: AppColors.surfaceDark,
                elevation: 4,
                borderRadius: BorderRadius.circular(8),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxHeight: 200),
                  child: ListView.builder(
                    padding: EdgeInsets.zero,
                    shrinkWrap: true,
                    itemCount: options.length,
                    itemBuilder: (context, index) {
                      final option = options.elementAt(index);
                      return ListTile(
                        title: Text(
                          option,
                          style: TextStyle(color: AppColors.textPrimaryDark),
                        ),
                        onTap: () => onSelected(option),
                      );
                    },
                  ),
                ),
              ),
            );
          },
          fieldViewBuilder: (context, controller, focusNode, onFieldSubmitted) {
            controller.text = _schoolController.text;
            controller.addListener(() {
              _schoolController.text = controller.text;
            });

            return TextFormField(
              controller: controller,
              focusNode: focusNode,
              style: TextStyle(color: AppColors.textPrimaryDark),
              decoration: InputDecoration(
                labelText: 'School / University *',
                hintText: 'Start typing to search...',
                prefixIcon: Icon(Icons.school_outlined, color: AppColors.textMutedDark),
                filled: true,
                fillColor: AppColors.surfaceDark,
                labelStyle: TextStyle(color: AppColors.textSecondaryDark),
                hintStyle: TextStyle(color: AppColors.textMutedDark),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(color: AppColors.borderDark),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(color: AppColors.teal, width: 2),
                ),
              ),
            );
          },
        ),
        const SizedBox(height: 16),

        // Department dropdown
        DropdownButtonFormField<String>(
          initialValue: _selectedDepartment,
          dropdownColor: AppColors.surfaceDark,
          style: TextStyle(color: AppColors.textPrimaryDark),
          iconEnabledColor: AppColors.textMutedDark,
          decoration: InputDecoration(
            labelText: 'Department *',
            prefixIcon: Icon(Icons.business_outlined, color: AppColors.textMutedDark),
            filled: true,
            fillColor: AppColors.surfaceDark,
            labelStyle: TextStyle(color: AppColors.textSecondaryDark),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppColors.borderDark),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppColors.teal, width: 2),
            ),
          ),
          items: _departments.map((dept) {
            return DropdownMenuItem(
              value: dept,
              child: Text(dept),
            );
          }).toList(),
          onChanged: (value) {
            setState(() => _selectedDepartment = value);
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
          iconEnabledColor: AppColors.textMutedDark,
          decoration: InputDecoration(
            labelText: 'Role *',
            prefixIcon: Icon(Icons.badge_outlined, color: AppColors.textMutedDark),
            filled: true,
            fillColor: AppColors.surfaceDark,
            labelStyle: TextStyle(color: AppColors.textSecondaryDark),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppColors.borderDark),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppColors.teal, width: 2),
            ),
          ),
          items: _schoolRoles.map((role) {
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
          decoration: InputDecoration(
            labelText: 'Job Title',
            hintText: 'e.g., Associate Director of Career Services',
            prefixIcon: Icon(Icons.work_outline, color: AppColors.textMutedDark),
            filled: true,
            fillColor: AppColors.surfaceDark,
            labelStyle: TextStyle(color: AppColors.textSecondaryDark),
            hintStyle: TextStyle(color: AppColors.textMutedDark),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppColors.borderDark),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppColors.teal, width: 2),
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Office location
        TextFormField(
          controller: _officeController,
          textCapitalization: TextCapitalization.words,
          style: TextStyle(color: AppColors.textPrimaryDark),
          decoration: InputDecoration(
            labelText: 'Office Location',
            hintText: 'e.g., Career Center, Room 202',
            prefixIcon: Icon(Icons.location_on_outlined, color: AppColors.textMutedDark),
            filled: true,
            fillColor: AppColors.surfaceDark,
            labelStyle: TextStyle(color: AppColors.textSecondaryDark),
            hintStyle: TextStyle(color: AppColors.textMutedDark),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppColors.borderDark),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppColors.teal, width: 2),
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Phone
        TextFormField(
          controller: _phoneController,
          keyboardType: TextInputType.phone,
          style: TextStyle(color: AppColors.textPrimaryDark),
          decoration: InputDecoration(
            labelText: 'Phone Number',
            hintText: '+1 (555) 123-4567',
            prefixIcon: Icon(Icons.phone_outlined, color: AppColors.textMutedDark),
            filled: true,
            fillColor: AppColors.surfaceDark,
            labelStyle: TextStyle(color: AppColors.textSecondaryDark),
            hintStyle: TextStyle(color: AppColors.textMutedDark),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppColors.borderDark),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppColors.teal, width: 2),
            ),
          ),
        ),
        const SizedBox(height: 32),

        // Summary card
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
                  Icon(Icons.school, color: AppColors.teal, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _schoolController.text.isNotEmpty
                          ? _schoolController.text
                          : 'Your School',
                      style: AppTextStyles.labelLarge.copyWith(
                        color: AppColors.textPrimaryDark,
                      ),
                    ),
                  ),
                ],
              ),
              if (_selectedDepartment != null) ...[
                const SizedBox(height: 8),
                Text(
                  _selectedDepartment!,
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

        const SizedBox(height: 24),

        // What you can do info
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.teal.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(
              color: AppColors.teal.withValues(alpha: 0.3),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'As a Career Services admin, you can:',
                style: AppTextStyles.labelMedium.copyWith(
                  color: AppColors.textPrimaryDark,
                ),
              ),
              const SizedBox(height: 12),
              _buildFeatureItem('View and manage your students'),
              _buildFeatureItem('Track student applications and outcomes'),
              _buildFeatureItem('Connect students with recruiters'),
              _buildFeatureItem('Access analytics and reports'),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildFeatureItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(Icons.check_circle, color: AppColors.teal, size: 16),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.textSecondaryDark,
              ),
            ),
          ),
        ],
      ),
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
