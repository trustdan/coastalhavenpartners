import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/providers/recruiter_provider.dart';
import '../../../data/repositories/recruiter_repository.dart';

/// Firm type options
const _firmTypes = [
  'Investment Bank',
  'Private Equity',
  'Venture Capital',
  'Hedge Fund',
  'Asset Management',
  'Corporate Finance',
  'Consulting',
  'Other',
];

/// Specialty options
const _specialtyOptions = [
  'M&A Advisory',
  'Capital Markets',
  'Restructuring',
  'Private Equity',
  'Venture Capital',
  'Hedge Funds',
  'Real Estate',
  'Infrastructure',
  'Healthcare',
  'Technology',
  'Consumer',
  'Energy',
  'Financial Services',
  'Industrials',
];

/// Location options
const _locationOptions = [
  'New York',
  'San Francisco',
  'Los Angeles',
  'Chicago',
  'Boston',
  'Miami',
  'Houston',
  'Dallas',
  'Atlanta',
  'Seattle',
  'Denver',
  'Washington D.C.',
  'London',
  'Hong Kong',
  'Singapore',
  'Remote',
];

/// Edit Recruiter Profile Screen - Tab-based profile editor for recruiters
class EditRecruiterProfileScreen extends ConsumerStatefulWidget {
  const EditRecruiterProfileScreen({super.key});

  @override
  ConsumerState<EditRecruiterProfileScreen> createState() =>
      _EditRecruiterProfileScreenState();
}

class _EditRecruiterProfileScreenState
    extends ConsumerState<EditRecruiterProfileScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _hasChanges = false;
  bool _isSaving = false;

  // Form controllers
  final _firmNameController = TextEditingController();
  final _jobTitleController = TextEditingController();
  final _bioController = TextEditingController();
  final _linkedinController = TextEditingController();
  final _websiteController = TextEditingController();
  final _yearsExperienceController = TextEditingController();

  // Selected values
  String? _selectedFirmType;
  List<String> _selectedSpecialties = [];
  List<String> _selectedLocations = [];

  // Photo state
  Uint8List? _selectedPhotoBytes;
  String? _currentPhotoUrl;
  bool _isUploadingPhoto = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadProfileData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _firmNameController.dispose();
    _jobTitleController.dispose();
    _bioController.dispose();
    _linkedinController.dispose();
    _websiteController.dispose();
    _yearsExperienceController.dispose();
    super.dispose();
  }

  void _loadProfileData() {
    final profileAsync = ref.read(currentRecruiterProfileProvider);
    if (profileAsync.hasValue && profileAsync.value != null) {
      final profile = profileAsync.value!;
      _firmNameController.text = profile.firmName;
      _jobTitleController.text = profile.jobTitle;
      _bioController.text = profile.bio ?? '';
      _linkedinController.text = profile.linkedinUrl ?? '';
      _websiteController.text = profile.companyWebsite ?? '';
      _yearsExperienceController.text =
          profile.yearsExperience?.toString() ?? '';
      _selectedFirmType = profile.firmType;
      _selectedSpecialties = List.from(profile.specialties ?? []);
      _selectedLocations = List.from(profile.locations ?? []);
      _currentPhotoUrl = profile.profilePhotoUrl;
    }
  }

  void _markChanged() {
    if (!_hasChanges) {
      setState(() => _hasChanges = true);
    }
  }

  Future<bool> _onWillPop() async {
    if (!_hasChanges) return true;

    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Unsaved Changes'),
        content: const Text(
          'You have unsaved changes. Are you sure you want to leave?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Leave'),
          ),
        ],
      ),
    );

    return result ?? false;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return PopScope(
      canPop: !_hasChanges,
      onPopInvokedWithResult: (didPop, result) async {
        if (!didPop) {
          final shouldPop = await _onWillPop();
          if (shouldPop && context.mounted) {
            Navigator.of(context).pop();
          }
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Edit Profile'),
          actions: [
            if (_hasChanges)
              TextButton(
                onPressed: _isSaving ? null : _saveProfile,
                child: _isSaving
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Save'),
              ),
          ],
          bottom: TabBar(
            controller: _tabController,
            tabs: const [
              Tab(text: 'Basic Info'),
              Tab(text: 'Details'),
              Tab(text: 'Preferences'),
            ],
          ),
        ),
        body: TabBarView(
          controller: _tabController,
          children: [
            _buildBasicInfoTab(isDark),
            _buildDetailsTab(isDark),
            _buildPreferencesTab(isDark),
          ],
        ),
      ),
    );
  }

  Widget _buildBasicInfoTab(bool isDark) {
    return SingleChildScrollView(
      padding: AppSpacing.screenPadding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Profile Photo
          Center(
            child: Column(
              children: [
                Stack(
                  children: [
                    CircleAvatar(
                      radius: 50,
                      backgroundColor: AppColors.teal.withValues(alpha: 0.1),
                      backgroundImage: _selectedPhotoBytes != null
                          ? MemoryImage(_selectedPhotoBytes!)
                          : _currentPhotoUrl != null
                              ? NetworkImage(_currentPhotoUrl!)
                              : null,
                      child: _selectedPhotoBytes == null &&
                              _currentPhotoUrl == null
                          ? const Icon(Icons.person, size: 50, color: AppColors.teal)
                          : null,
                    ),
                    if (_isUploadingPhoto)
                      Positioned.fill(
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.5),
                            shape: BoxShape.circle,
                          ),
                          child: const Center(
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        decoration: BoxDecoration(
                          color: AppColors.teal,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                        ),
                        child: IconButton(
                          icon: const Icon(Icons.camera_alt, color: Colors.white, size: 18),
                          onPressed: _isUploadingPhoto ? null : _pickPhoto,
                          padding: const EdgeInsets.all(6),
                          constraints: const BoxConstraints(),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  'Tap to change photo',
                  style: AppTextStyles.caption.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          AppSpacing.sectionGap,

          // Company Name
          _buildTextField(
            label: 'Company/Firm Name',
            controller: _firmNameController,
            icon: Icons.business,
            required: true,
          ),
          const SizedBox(height: 16),

          // Job Title
          _buildTextField(
            label: 'Job Title',
            controller: _jobTitleController,
            icon: Icons.work,
            required: true,
          ),
          const SizedBox(height: 16),

          // Firm Type
          _buildDropdown(
            label: 'Firm Type',
            value: _selectedFirmType,
            items: _firmTypes,
            icon: Icons.category,
            onChanged: (value) {
              setState(() => _selectedFirmType = value);
              _markChanged();
            },
          ),
          const SizedBox(height: 16),

          // Years of Experience
          _buildTextField(
            label: 'Years of Experience',
            controller: _yearsExperienceController,
            icon: Icons.timeline,
            keyboardType: TextInputType.number,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          ),
          const SizedBox(height: 16),

          // LinkedIn
          _buildTextField(
            label: 'LinkedIn URL',
            controller: _linkedinController,
            icon: Icons.link,
            keyboardType: TextInputType.url,
            hint: 'https://linkedin.com/in/yourprofile',
          ),
          const SizedBox(height: 16),

          // Company Website
          _buildTextField(
            label: 'Company Website',
            controller: _websiteController,
            icon: Icons.language,
            keyboardType: TextInputType.url,
            hint: 'https://yourcompany.com',
          ),
        ],
      ),
    );
  }

  Widget _buildDetailsTab(bool isDark) {
    return SingleChildScrollView(
      padding: AppSpacing.screenPadding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Bio
          Text('About / Bio', style: AppTextStyles.h4),
          const SizedBox(height: 8),
          TextFormField(
            controller: _bioController,
            maxLines: 5,
            maxLength: 500,
            onChanged: (_) => _markChanged(),
            decoration: InputDecoration(
              hintText: 'Tell candidates about yourself and your firm...',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              filled: true,
              fillColor: isDark ? AppColors.cardDark : AppColors.cardLight,
              alignLabelWithHint: true,
            ),
          ),
          AppSpacing.sectionGap,

          // Specialties
          _buildMultiSelect(
            label: 'Specialties',
            subtitle: 'Select areas you focus on',
            options: _specialtyOptions,
            selectedValues: _selectedSpecialties,
            onChanged: (values) {
              setState(() => _selectedSpecialties = values);
              _markChanged();
            },
            icon: Icons.star,
          ),
          AppSpacing.sectionGap,

          // Locations
          _buildMultiSelect(
            label: 'Locations',
            subtitle: 'Where are you hiring?',
            options: _locationOptions,
            selectedValues: _selectedLocations,
            onChanged: (values) {
              setState(() => _selectedLocations = values);
              _markChanged();
            },
            icon: Icons.location_on,
          ),
        ],
      ),
    );
  }

  Widget _buildPreferencesTab(bool isDark) {
    final profileAsync = ref.watch(currentRecruiterProfileProvider);
    final profile = profileAsync.hasValue ? profileAsync.value : null;

    return SingleChildScrollView(
      padding: AppSpacing.screenPadding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Verification Status Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: (profile?.isApproved ?? false)
                  ? AppColors.success.withValues(alpha: 0.1)
                  : (profile?.isRejected ?? false)
                      ? AppColors.error.withValues(alpha: 0.1)
                      : AppColors.warning.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: (profile?.isApproved ?? false)
                    ? AppColors.success.withValues(alpha: 0.3)
                    : (profile?.isRejected ?? false)
                        ? AppColors.error.withValues(alpha: 0.3)
                        : AppColors.warning.withValues(alpha: 0.3),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  (profile?.isApproved ?? false)
                      ? Icons.verified
                      : (profile?.isRejected ?? false)
                          ? Icons.cancel
                          : Icons.hourglass_empty,
                  color: (profile?.isApproved ?? false)
                      ? AppColors.success
                      : (profile?.isRejected ?? false)
                          ? AppColors.error
                          : AppColors.warning,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Verification Status',
                        style: AppTextStyles.labelMedium,
                      ),
                      Text(
                        (profile?.isApproved ?? false)
                            ? 'Your profile is verified'
                            : (profile?.isRejected ?? false)
                                ? 'Verification rejected'
                                : 'Pending verification',
                        style: AppTextStyles.caption.copyWith(
                          color: (profile?.isApproved ?? false)
                              ? AppColors.success
                              : (profile?.isRejected ?? false)
                                  ? AppColors.error
                                  : AppColors.warning,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          AppSpacing.sectionGap,

          // Email Domain Info
          if (profile?.emailDomain != null) ...[
            _buildInfoCard(
              'Email Domain',
              profile!.emailDomain!,
              Icons.email,
              profile.emailDomainMatchesCompany
                  ? AppColors.success
                  : AppColors.warning,
            ),
            const SizedBox(height: 16),
          ],

          // Profile Tips
          Text('Profile Tips', style: AppTextStyles.h4),
          const SizedBox(height: 12),
          _buildTipCard(
            'Complete your bio',
            'A detailed bio helps candidates learn about you and your firm.',
            _bioController.text.length >= 50,
          ),
          const SizedBox(height: 8),
          _buildTipCard(
            'Add your LinkedIn',
            'Connect your LinkedIn profile to build trust.',
            _linkedinController.text.isNotEmpty,
          ),
          const SizedBox(height: 8),
          _buildTipCard(
            'Set your specialties',
            'Help candidates find you by listing your focus areas.',
            _selectedSpecialties.isNotEmpty,
          ),
          const SizedBox(height: 8),
          _buildTipCard(
            'Add hiring locations',
            'Let candidates know where your opportunities are.',
            _selectedLocations.isNotEmpty,
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    required IconData icon,
    bool required = false,
    TextInputType? keyboardType,
    String? hint,
    List<TextInputFormatter>? inputFormatters,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(label, style: AppTextStyles.labelMedium),
            if (required)
              const Text(' *', style: TextStyle(color: AppColors.error)),
          ],
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          inputFormatters: inputFormatters,
          onChanged: (_) => _markChanged(),
          decoration: InputDecoration(
            hintText: hint,
            prefixIcon: Icon(icon),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            filled: true,
            fillColor: isDark ? AppColors.cardDark : AppColors.cardLight,
          ),
        ),
      ],
    );
  }

  Widget _buildDropdown({
    required String label,
    required String? value,
    required List<String> items,
    required IconData icon,
    required ValueChanged<String?> onChanged,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.labelMedium),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          initialValue: value,
          items: items
              .map((item) => DropdownMenuItem(value: item, child: Text(item)))
              .toList(),
          onChanged: onChanged,
          decoration: InputDecoration(
            prefixIcon: Icon(icon),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            filled: true,
            fillColor: isDark ? AppColors.cardDark : AppColors.cardLight,
          ),
        ),
      ],
    );
  }

  Widget _buildMultiSelect({
    required String label,
    required String subtitle,
    required List<String> options,
    required List<String> selectedValues,
    required ValueChanged<List<String>> onChanged,
    required IconData icon,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 20, color: AppColors.teal),
            const SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: AppTextStyles.h4),
                Text(
                  subtitle,
                  style: AppTextStyles.caption.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: options.map((option) {
            final isSelected = selectedValues.contains(option);
            return FilterChip(
              label: Text(option),
              selected: isSelected,
              onSelected: (selected) {
                final newValues = List<String>.from(selectedValues);
                if (selected) {
                  newValues.add(option);
                } else {
                  newValues.remove(option);
                }
                onChanged(newValues);
              },
              selectedColor: AppColors.teal.withValues(alpha: 0.2),
              checkmarkColor: AppColors.teal,
              backgroundColor: isDark ? AppColors.cardDark : AppColors.cardLight,
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildInfoCard(String label, String value, IconData icon, Color color) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? AppColors.borderDark : AppColors.borderLight,
        ),
      ),
      child: Row(
        children: [
          Icon(icon, color: color),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: AppTextStyles.caption),
                Text(value, style: AppTextStyles.labelMedium),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTipCard(String title, String description, bool isComplete) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isComplete
              ? AppColors.success.withValues(alpha: 0.3)
              : isDark
                  ? AppColors.borderDark
                  : AppColors.borderLight,
        ),
      ),
      child: Row(
        children: [
          Icon(
            isComplete ? Icons.check_circle : Icons.circle_outlined,
            color: isComplete ? AppColors.success : AppColors.teal,
            size: 20,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTextStyles.labelSmall.copyWith(
                    decoration:
                        isComplete ? TextDecoration.lineThrough : null,
                  ),
                ),
                Text(
                  description,
                  style: AppTextStyles.caption.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _pickPhoto() async {
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.camera_alt),
                title: const Text('Take Photo'),
                onTap: () => Navigator.pop(context, ImageSource.camera),
              ),
              ListTile(
                leading: const Icon(Icons.photo_library),
                title: const Text('Choose from Gallery'),
                onTap: () => Navigator.pop(context, ImageSource.gallery),
              ),
              if (_currentPhotoUrl != null || _selectedPhotoBytes != null)
                ListTile(
                  leading: const Icon(Icons.delete, color: AppColors.error),
                  title: const Text('Remove Photo',
                      style: TextStyle(color: AppColors.error)),
                  onTap: () {
                    Navigator.pop(context);
                    _removePhoto();
                  },
                ),
            ],
          ),
        ),
      ),
    );

    if (source == null) return;

    final picker = ImagePicker();
    final image = await picker.pickImage(
      source: source,
      maxWidth: 512,
      maxHeight: 512,
      imageQuality: 85,
    );

    if (image == null) return;

    final bytes = await image.readAsBytes();
    setState(() {
      _selectedPhotoBytes = bytes;
    });
    _markChanged();

    // Upload immediately
    await _uploadPhoto(bytes, image.name);
  }

  Future<void> _uploadPhoto(Uint8List bytes, String fileName) async {
    setState(() => _isUploadingPhoto = true);

    try {
      final url = await RecruiterRepository.instance.uploadProfilePhoto(
        bytes,
        fileName,
      );

      if (url != null) {
        setState(() => _currentPhotoUrl = url);
        ref.invalidate(currentRecruiterProfileProvider);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Photo uploaded successfully'),
              backgroundColor: AppColors.success,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to upload photo: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isUploadingPhoto = false);
      }
    }
  }

  void _removePhoto() {
    setState(() {
      _selectedPhotoBytes = null;
      _currentPhotoUrl = null;
    });
    _markChanged();
  }

  Future<void> _saveProfile() async {
    // Validate required fields
    if (_firmNameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Company name is required'),
          backgroundColor: AppColors.warning,
        ),
      );
      return;
    }

    if (_jobTitleController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Job title is required'),
          backgroundColor: AppColors.warning,
        ),
      );
      return;
    }

    setState(() => _isSaving = true);

    try {
      await RecruiterRepository.instance.updateRecruiterProfile(
        firmName: _firmNameController.text.trim(),
        jobTitle: _jobTitleController.text.trim(),
        firmType: _selectedFirmType,
        bio: _bioController.text.trim().isEmpty
            ? null
            : _bioController.text.trim(),
        linkedinUrl: _linkedinController.text.trim().isEmpty
            ? null
            : _linkedinController.text.trim(),
        companyWebsite: _websiteController.text.trim().isEmpty
            ? null
            : _websiteController.text.trim(),
        yearsExperience: _yearsExperienceController.text.isEmpty
            ? null
            : int.tryParse(_yearsExperienceController.text),
        specialties:
            _selectedSpecialties.isEmpty ? null : _selectedSpecialties,
        locations: _selectedLocations.isEmpty ? null : _selectedLocations,
      );

      // Refresh profile
      ref.invalidate(currentRecruiterProfileProvider);

      setState(() => _hasChanges = false);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profile saved successfully'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to save profile: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }
}
