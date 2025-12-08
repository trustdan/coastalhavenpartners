import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/router/app_router.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../data/services/profile_service.dart';
import '../../../widgets/magic_ui/magic_ui.dart';

/// List of target universities for autocomplete
const List<String> _targetSchools = [
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

/// List of common majors
const List<String> _commonMajors = [
  'Finance',
  'Economics',
  'Business Administration',
  'Accounting',
  'Mathematics',
  'Statistics',
  'Computer Science',
  'Applied Mathematics',
  'Political Science',
  'International Relations',
  'Philosophy',
  'Engineering',
  'Data Science',
];

/// Degree types
const List<String> _degreeTypes = [
  'Bachelor of Arts (BA)',
  'Bachelor of Science (BS)',
  'MBA',
  'Master of Finance',
  'Master of Arts (MA)',
  'Master of Science (MS)',
  'PhD',
];

/// Target roles in finance
const List<String> _targetRoles = [
  'Investment Banking',
  'Private Equity',
  'Venture Capital',
  'Hedge Fund',
  'Equity Research',
  'Sales & Trading',
  'Corporate Development',
  'Asset Management',
  'Restructuring',
  'Real Estate',
  'Wealth Management',
];

/// Preferred locations
const List<String> _preferredLocations = [
  'New York, NY',
  'San Francisco, CA',
  'Boston, MA',
  'Chicago, IL',
  'Los Angeles, CA',
  'Miami, FL',
  'Dallas, TX',
  'Houston, TX',
  'Atlanta, GA',
  'Washington, DC',
  'Seattle, WA',
  'Denver, CO',
  'London, UK',
  'Hong Kong',
];

/// Candidate profile completion screen - collects education, preferences, and resume
class CompleteProfileCandidateScreen extends ConsumerStatefulWidget {
  const CompleteProfileCandidateScreen({super.key});

  @override
  ConsumerState<CompleteProfileCandidateScreen> createState() =>
      _CompleteProfileCandidateScreenState();
}

class _CompleteProfileCandidateScreenState
    extends ConsumerState<CompleteProfileCandidateScreen> {
  final _formKey = GlobalKey<FormState>();
  int _currentStep = 0;

  // Step 1: Education
  final _schoolController = TextEditingController();
  final _majorController = TextEditingController();
  String? _selectedDegreeType;
  final _gpaController = TextEditingController();
  int _graduationYear = DateTime.now().year + 1;

  // Step 2: Career Preferences
  final Set<String> _selectedRoles = {};
  final Set<String> _selectedLocations = {};

  // Step 3: Documents
  String? _resumeFileName;
  bool _isLoading = false;

  @override
  void dispose() {
    _schoolController.dispose();
    _majorController.dispose();
    _gpaController.dispose();
    super.dispose();
  }

  bool _validateStep(int step) {
    switch (step) {
      case 0: // Education
        if (_schoolController.text.isEmpty) {
          _showError('Please select your school');
          return false;
        }
        if (_majorController.text.isEmpty) {
          _showError('Please enter your major');
          return false;
        }
        if (_selectedDegreeType == null) {
          _showError('Please select your degree type');
          return false;
        }
        if (_gpaController.text.isEmpty) {
          _showError('Please enter your GPA');
          return false;
        }
        final gpa = double.tryParse(_gpaController.text);
        if (gpa == null || gpa < 0 || gpa > 4.0) {
          _showError('Please enter a valid GPA (0.0 - 4.0)');
          return false;
        }
        return true;
      case 1: // Career Preferences
        if (_selectedRoles.isEmpty) {
          _showError('Please select at least one target role');
          return false;
        }
        if (_selectedLocations.isEmpty) {
          _showError('Please select at least one preferred location');
          return false;
        }
        return true;
      case 2: // Documents
        // Resume is optional for now, can be uploaded later
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
      if (_currentStep < 2) {
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

  Future<void> _pickResume() async {
    // TODO: Implement file picker
    // For now, just simulate file selection
    setState(() {
      _resumeFileName = 'resume.pdf';
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('File picker will be implemented with file_picker package'),
        backgroundColor: AppColors.info,
      ),
    );
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

      // Parse GPA
      final gpa = double.tryParse(_gpaController.text) ?? 0.0;

      // Save to Supabase
      final profileId = await ProfileService.instance.saveCandidateProfile(
        userId: user.id,
        schoolName: _schoolController.text,
        major: _majorController.text,
        gpa: gpa,
        graduationYear: _graduationYear,
        degreeType: _selectedDegreeType,
        targetRoles: _selectedRoles.toList(),
        preferredLocations: _selectedLocations.toList(),
        email: user.email,
        fullName: user.userMetadata?['full_name'] as String?,
      );

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
                  Text('Profile Complete!', style: TextStyle(color: AppColors.textPrimaryDark)),
                ],
              ),
              content: Text(
                'Your candidate profile has been saved to Supabase.\n\n'
                'School: ${_schoolController.text}\n'
                'Major: ${_majorController.text}\n'
                'GPA: ${_gpaController.text}\n'
                'Roles: ${_selectedRoles.join(", ")}\n'
                'Locations: ${_selectedLocations.join(", ")}',
                style: TextStyle(color: AppColors.textSecondaryDark),
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.pop(context);
                    context.go(AppRoutes.candidate);
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
      child: Column(
        children: [
          Row(
            children: [
              _buildStepIndicator(0, 'Education'),
              _buildStepConnector(0),
              _buildStepIndicator(1, 'Preferences'),
              _buildStepConnector(1),
              _buildStepIndicator(2, 'Resume'),
            ],
          ),
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
      width: 24,
      height: 2,
      color: isActive ? AppColors.teal : AppColors.borderDark,
    );
  }

  Widget _buildCurrentStep() {
    switch (_currentStep) {
      case 0:
        return _buildEducationStep();
      case 1:
        return _buildPreferencesStep();
      case 2:
        return _buildDocumentsStep();
      default:
        return _buildEducationStep();
    }
  }

  Widget _buildEducationStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Education Details',
          style: AppTextStyles.h3.copyWith(color: AppColors.textPrimaryDark),
        ),
        const SizedBox(height: 8),
        Text(
          'Tell us about your academic background',
          style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondaryDark),
        ),
        const SizedBox(height: 24),

        // School autocomplete
        Autocomplete<String>(
          optionsBuilder: (textEditingValue) {
            if (textEditingValue.text.isEmpty) {
              return _targetSchools.take(5);
            }
            return _targetSchools.where((school) =>
                school.toLowerCase().contains(textEditingValue.text.toLowerCase()));
          },
          onSelected: (selection) {
            _schoolController.text = selection;
          },
          fieldViewBuilder: (context, controller, focusNode, onFieldSubmitted) {
            // Sync with our controller
            controller.text = _schoolController.text;
            controller.addListener(() {
              _schoolController.text = controller.text;
            });

            return TextFormField(
              controller: controller,
              focusNode: focusNode,
              style: TextStyle(color: AppColors.textPrimaryDark),
              decoration: const InputDecoration(
                labelText: 'School *',
                hintText: 'Start typing to search...',
                prefixIcon: Icon(Icons.school_outlined),
              ),
            );
          },
        ),
        const SizedBox(height: 16),

        // Major autocomplete
        Autocomplete<String>(
          optionsBuilder: (textEditingValue) {
            if (textEditingValue.text.isEmpty) {
              return _commonMajors;
            }
            return _commonMajors.where((major) =>
                major.toLowerCase().contains(textEditingValue.text.toLowerCase()));
          },
          onSelected: (selection) {
            _majorController.text = selection;
          },
          fieldViewBuilder: (context, controller, focusNode, onFieldSubmitted) {
            controller.text = _majorController.text;
            controller.addListener(() {
              _majorController.text = controller.text;
            });

            return TextFormField(
              controller: controller,
              focusNode: focusNode,
              style: TextStyle(color: AppColors.textPrimaryDark),
              decoration: const InputDecoration(
                labelText: 'Major *',
                hintText: 'e.g., Finance, Economics',
                prefixIcon: Icon(Icons.book_outlined),
              ),
            );
          },
        ),
        const SizedBox(height: 16),

        // Degree type dropdown
        DropdownButtonFormField<String>(
          initialValue: _selectedDegreeType,
          dropdownColor: AppColors.surfaceDark,
          style: TextStyle(color: AppColors.textPrimaryDark),
          decoration: const InputDecoration(
            labelText: 'Degree Type *',
            prefixIcon: Icon(Icons.school),
          ),
          items: _degreeTypes.map((type) {
            return DropdownMenuItem(
              value: type,
              child: Text(type),
            );
          }).toList(),
          onChanged: (value) {
            setState(() => _selectedDegreeType = value);
          },
        ),
        const SizedBox(height: 16),

        // GPA and Graduation Year row
        Row(
          children: [
            Expanded(
              child: TextFormField(
                controller: _gpaController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                style: TextStyle(color: AppColors.textPrimaryDark),
                decoration: const InputDecoration(
                  labelText: 'GPA *',
                  hintText: '3.85',
                  prefixIcon: Icon(Icons.grade_outlined),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: DropdownButtonFormField<int>(
                initialValue: _graduationYear,
                dropdownColor: AppColors.surfaceDark,
                style: TextStyle(color: AppColors.textPrimaryDark),
                decoration: const InputDecoration(
                  labelText: 'Graduation Year *',
                  prefixIcon: Icon(Icons.calendar_today_outlined),
                ),
                items: List.generate(8, (index) {
                  final year = DateTime.now().year - 2 + index;
                  return DropdownMenuItem(
                    value: year,
                    child: Text(year.toString()),
                  );
                }),
                onChanged: (value) {
                  if (value != null) {
                    setState(() => _graduationYear = value);
                  }
                },
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildPreferencesStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Career Preferences',
          style: AppTextStyles.h3.copyWith(color: AppColors.textPrimaryDark),
        ),
        const SizedBox(height: 8),
        Text(
          'What roles and locations are you targeting?',
          style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondaryDark),
        ),
        const SizedBox(height: 24),

        // Target Roles
        Text(
          'Target Roles *',
          style: AppTextStyles.labelLarge.copyWith(color: AppColors.textPrimaryDark),
        ),
        const SizedBox(height: 8),
        Text(
          'Select all that apply',
          style: AppTextStyles.bodySmall.copyWith(color: AppColors.textMutedDark),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _targetRoles.map((role) {
            final isSelected = _selectedRoles.contains(role);
            return FilterChip(
              label: Text(role),
              selected: isSelected,
              onSelected: (selected) {
                setState(() {
                  if (selected) {
                    _selectedRoles.add(role);
                  } else {
                    _selectedRoles.remove(role);
                  }
                });
              },
              selectedColor: AppColors.teal.withValues(alpha: 0.2),
              checkmarkColor: AppColors.teal,
              labelStyle: TextStyle(
                color: isSelected ? AppColors.teal : AppColors.textSecondaryDark,
              ),
              backgroundColor: AppColors.surfaceDark,
              side: BorderSide(
                color: isSelected ? AppColors.teal : AppColors.borderDark,
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 32),

        // Preferred Locations
        Text(
          'Preferred Locations *',
          style: AppTextStyles.labelLarge.copyWith(color: AppColors.textPrimaryDark),
        ),
        const SizedBox(height: 8),
        Text(
          'Where would you like to work?',
          style: AppTextStyles.bodySmall.copyWith(color: AppColors.textMutedDark),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _preferredLocations.map((location) {
            final isSelected = _selectedLocations.contains(location);
            return FilterChip(
              label: Text(location),
              selected: isSelected,
              onSelected: (selected) {
                setState(() {
                  if (selected) {
                    _selectedLocations.add(location);
                  } else {
                    _selectedLocations.remove(location);
                  }
                });
              },
              selectedColor: AppColors.emerald.withValues(alpha: 0.2),
              checkmarkColor: AppColors.emerald,
              labelStyle: TextStyle(
                color: isSelected ? AppColors.emerald : AppColors.textSecondaryDark,
              ),
              backgroundColor: AppColors.surfaceDark,
              side: BorderSide(
                color: isSelected ? AppColors.emerald : AppColors.borderDark,
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildDocumentsStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Upload Resume',
          style: AppTextStyles.h3.copyWith(color: AppColors.textPrimaryDark),
        ),
        const SizedBox(height: 8),
        Text(
          'Your resume helps recruiters learn more about you',
          style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondaryDark),
        ),
        const SizedBox(height: 32),

        // Upload area
        InkWell(
          onTap: _pickResume,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          child: Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: AppColors.surfaceDark,
              borderRadius: BorderRadius.circular(AppRadius.lg),
              border: Border.all(
                color: _resumeFileName != null ? AppColors.teal : AppColors.borderDark,
                width: 2,
                style: BorderStyle.solid,
              ),
            ),
            child: Column(
              children: [
                Icon(
                  _resumeFileName != null ? Icons.check_circle : Icons.upload_file,
                  size: 48,
                  color: _resumeFileName != null ? AppColors.teal : AppColors.textMutedDark,
                ),
                const SizedBox(height: 16),
                Text(
                  _resumeFileName ?? 'Tap to upload your resume',
                  style: AppTextStyles.bodyLarge.copyWith(
                    color: _resumeFileName != null
                        ? AppColors.textPrimaryDark
                        : AppColors.textSecondaryDark,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'PDF format, max 5MB',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.textMutedDark,
                  ),
                ),
                if (_resumeFileName != null) ...[
                  const SizedBox(height: 16),
                  TextButton.icon(
                    onPressed: _pickResume,
                    icon: const Icon(Icons.swap_horiz, size: 18),
                    label: const Text('Replace'),
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.teal,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),

        // Note about skipping
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.info.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(
              color: AppColors.info.withValues(alpha: 0.3),
            ),
          ),
          child: Row(
            children: [
              Icon(Icons.info_outline, color: AppColors.info, size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'You can skip this step and upload your resume later from your profile.',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.textSecondaryDark,
                  ),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 32),

        // Summary of selections
        Text(
          'Profile Summary',
          style: AppTextStyles.labelLarge.copyWith(color: AppColors.textPrimaryDark),
        ),
        const SizedBox(height: 12),
        _buildSummaryItem(Icons.school, 'School', _schoolController.text),
        _buildSummaryItem(Icons.book, 'Major', _majorController.text),
        _buildSummaryItem(Icons.grade, 'GPA', _gpaController.text),
        _buildSummaryItem(Icons.work, 'Target Roles', _selectedRoles.join(', ')),
        _buildSummaryItem(Icons.location_on, 'Locations', _selectedLocations.join(', ')),
      ],
    );
  }

  Widget _buildSummaryItem(IconData icon, String label, String value) {
    if (value.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: AppColors.textMutedDark),
          const SizedBox(width: 8),
          Text(
            '$label: ',
            style: AppTextStyles.bodySmall.copyWith(color: AppColors.textMutedDark),
          ),
          Expanded(
            child: Text(
              value,
              style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondaryDark),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
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
              text: _currentStep == 2 ? 'Complete Profile' : 'Continue',
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
