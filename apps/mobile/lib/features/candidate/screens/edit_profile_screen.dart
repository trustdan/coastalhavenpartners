import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../data/repositories/profile_repository.dart';
import '../widgets/documents_tab.dart';

/// Edit Profile Screen - Tab-based profile editor for candidates
/// Tabs: Basic | Education | Documents | Preferences
class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _hasChanges = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _markChanged() {
    if (!_hasChanges) {
      setState(() {
        _hasChanges = true;
      });
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
              TextButton(onPressed: _saveProfile, child: const Text('Save')),
          ],
          bottom: TabBar(
            controller: _tabController,
            isScrollable: true,
            tabAlignment: TabAlignment.start,
            tabs: const [
              Tab(text: 'Basic'),
              Tab(text: 'Education'),
              Tab(text: 'Documents'),
              Tab(text: 'Preferences'),
            ],
          ),
        ),
        body: TabBarView(
          controller: _tabController,
          children: [
            _BasicInfoTab(onChanged: _markChanged),
            _EducationTab(onChanged: _markChanged),
            DocumentsTab(onChanged: _markChanged),
            _PreferencesTab(onChanged: _markChanged),
          ],
        ),
      ),
    );
  }

  void _saveProfile() {
    // TODO: Save profile to Supabase
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Profile saved successfully'),
        backgroundColor: AppColors.success,
      ),
    );
    setState(() {
      _hasChanges = false;
    });
  }
}

/// Basic Info Tab - Photo, name, bio, links
class _BasicInfoTab extends StatefulWidget {
  final VoidCallback onChanged;

  const _BasicInfoTab({required this.onChanged});

  @override
  State<_BasicInfoTab> createState() => _BasicInfoTabState();
}

class _BasicInfoTabState extends State<_BasicInfoTab> {
  final _firstNameController = TextEditingController(text: 'John');
  final _lastNameController = TextEditingController(text: 'Smith');
  final _linkedInController = TextEditingController(
    text: 'linkedin.com/in/johnsmith',
  );
  final _schedulingController = TextEditingController(
    text: 'calendly.com/johnsmith',
  );
  final _bioController = TextEditingController(
    text:
        'Passionate about finance and technology with a strong background in investment analysis.',
  );

  // Photo handling
  final ImagePicker _imagePicker = ImagePicker();
  Uint8List? _photoBytes;
  String? _photoUrl;
  bool _isUploadingPhoto = false;

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _linkedInController.dispose();
    _schedulingController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SingleChildScrollView(
      padding: AppSpacing.screenPadding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Profile Photo Section
          _buildSectionTitle('Profile Photo'),
          AppSpacing.itemGap,
          Center(
            child: Stack(
              children: [
                // Profile photo circle
                CircleAvatar(
                  radius: 50,
                  backgroundColor: isDark
                      ? AppColors.cardDark
                      : AppColors.cardLight,
                  backgroundImage: _photoBytes != null
                      ? MemoryImage(_photoBytes!)
                      : (_photoUrl != null ? NetworkImage(_photoUrl!) : null),
                  child: _photoBytes == null && _photoUrl == null
                      ? Text(
                          'JS',
                          style: AppTextStyles.h1.copyWith(color: AppColors.teal),
                        )
                      : null,
                ),
                // Upload progress overlay
                if (_isUploadingPhoto)
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.5),
                        shape: BoxShape.circle,
                      ),
                      child: const Center(
                        child: SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ),
                // Camera button
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: GestureDetector(
                    onTap: _isUploadingPhoto ? null : _pickPhoto,
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: _isUploadingPhoto
                            ? AppColors.teal.withValues(alpha: 0.5)
                            : AppColors.teal,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: Theme.of(context).scaffoldBackgroundColor,
                          width: 2,
                        ),
                      ),
                      child: const Icon(
                        Icons.camera_alt,
                        size: 16,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          AppSpacing.sectionGap,

          // Name Section
          _buildSectionTitle('Name'),
          AppSpacing.itemGap,
          Row(
            children: [
              Expanded(
                child: _buildTextField(
                  controller: _firstNameController,
                  label: 'First Name',
                  onChanged: (_) => widget.onChanged(),
                ),
              ),
              AppSpacing.hGapMd,
              Expanded(
                child: _buildTextField(
                  controller: _lastNameController,
                  label: 'Last Name',
                  onChanged: (_) => widget.onChanged(),
                ),
              ),
            ],
          ),
          AppSpacing.sectionGap,

          // Links Section
          _buildSectionTitle('Links'),
          AppSpacing.itemGap,
          _buildTextField(
            controller: _linkedInController,
            label: 'LinkedIn URL',
            prefixIcon: Icons.link,
            keyboardType: TextInputType.url,
            onChanged: (_) => widget.onChanged(),
          ),
          AppSpacing.subsectionGap,
          _buildTextField(
            controller: _schedulingController,
            label: 'Scheduling URL (Calendly, etc.)',
            prefixIcon: Icons.calendar_today_outlined,
            keyboardType: TextInputType.url,
            onChanged: (_) => widget.onChanged(),
          ),
          AppSpacing.sectionGap,

          // Bio Section
          _buildSectionTitle('Bio'),
          AppSpacing.itemGap,
          _buildTextField(
            controller: _bioController,
            label: 'Tell recruiters about yourself',
            maxLines: 5,
            maxLength: 500,
            onChanged: (_) => widget.onChanged(),
          ),
          AppSpacing.sectionGap,
        ],
      ),
    );
  }

  Future<void> _pickPhoto() async {
    // Show bottom sheet with camera/gallery options
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.outline,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Choose Photo',
                style: AppTextStyles.h4,
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.teal.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.camera_alt, color: AppColors.teal),
                ),
                title: const Text('Take a Photo'),
                subtitle: const Text('Use your camera'),
                onTap: () => Navigator.pop(context, ImageSource.camera),
              ),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.info.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.photo_library, color: AppColors.info),
                ),
                title: const Text('Choose from Gallery'),
                subtitle: const Text('Select an existing photo'),
                onTap: () => Navigator.pop(context, ImageSource.gallery),
              ),
              if (_photoBytes != null || _photoUrl != null) ...[
                const Divider(),
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.error.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.delete_outline, color: AppColors.error),
                  ),
                  title: const Text('Remove Photo'),
                  subtitle: const Text('Delete current photo'),
                  onTap: () {
                    Navigator.pop(context);
                    _removePhoto();
                  },
                ),
              ],
            ],
          ),
        ),
      ),
    );

    if (source == null) return;

    try {
      final pickedFile = await _imagePicker.pickImage(
        source: source,
        maxWidth: 800,
        maxHeight: 800,
        imageQuality: 85,
      );

      if (pickedFile == null) return;

      // Read the file bytes
      final bytes = await pickedFile.readAsBytes();

      setState(() {
        _photoBytes = bytes;
        _photoUrl = null; // Clear remote URL when new local photo is selected
      });

      widget.onChanged();

      // Auto-upload the photo
      await _uploadPhoto(bytes, pickedFile.name);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error picking photo: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  void _removePhoto() {
    setState(() {
      _photoBytes = null;
      _photoUrl = null;
    });
    widget.onChanged();
  }

  Future<void> _uploadPhoto(Uint8List bytes, String fileName) async {
    setState(() => _isUploadingPhoto = true);

    try {
      final url = await ProfileRepository.instance.uploadProfilePhoto(
        bytes,
        fileName,
      );

      if (url != null && mounted) {
        setState(() {
          _photoUrl = url;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profile photo updated'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error uploading photo: $e'),
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

  Widget _buildSectionTitle(String title) {
    return Text(title, style: AppTextStyles.h4);
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    IconData? prefixIcon,
    TextInputType? keyboardType,
    int maxLines = 1,
    int? maxLength,
    void Function(String)? onChanged,
  }) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      maxLines: maxLines,
      maxLength: maxLength,
      onChanged: onChanged,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: prefixIcon != null ? Icon(prefixIcon) : null,
        border: const OutlineInputBorder(),
      ),
    );
  }
}

/// Education Tab - Undergrad and Graduate education
class _EducationTab extends StatefulWidget {
  final VoidCallback onChanged;

  const _EducationTab({required this.onChanged});

  @override
  State<_EducationTab> createState() => _EducationTabState();
}

class _EducationTabState extends State<_EducationTab> {
  // Undergrad fields
  final _schoolController = TextEditingController(
    text: 'University of Pennsylvania',
  );
  final _majorController = TextEditingController(text: 'Finance');
  final _gpaController = TextEditingController(text: '3.85');
  String _degreeType = 'B.S.';
  int _gradYear = 2025;

  // Graduate fields
  bool _hasGradDegree = true;
  final _gradSchoolController = TextEditingController(
    text: 'Wharton School of Business',
  );
  final _gradMajorController = TextEditingController(
    text: 'Finance & Strategy',
  );
  final _gradGpaController = TextEditingController(text: '3.90');
  String _gradDegreeType = 'MBA';
  int _gradGradYear = 2027;

  final List<String> _degreeTypes = ['B.A.', 'B.S.', 'B.B.A.', 'Other'];
  final List<String> _gradDegreeTypes = [
    'MBA',
    'M.S.',
    'M.A.',
    'Ph.D.',
    'J.D.',
    'Other',
  ];

  @override
  void dispose() {
    _schoolController.dispose();
    _majorController.dispose();
    _gpaController.dispose();
    _gradSchoolController.dispose();
    _gradMajorController.dispose();
    _gradGpaController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SingleChildScrollView(
      padding: AppSpacing.screenPadding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Undergraduate Section
          _buildSectionTitle('Undergraduate'),
          AppSpacing.itemGap,
          _buildEducationCard(
            context,
            isDark,
            schoolController: _schoolController,
            majorController: _majorController,
            gpaController: _gpaController,
            degreeType: _degreeType,
            gradYear: _gradYear,
            degreeTypes: _degreeTypes,
            onDegreeChanged: (value) {
              setState(() => _degreeType = value!);
              widget.onChanged();
            },
            onYearChanged: (value) {
              setState(() => _gradYear = value!);
              widget.onChanged();
            },
          ),
          AppSpacing.sectionGap,

          // Graduate Section
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildSectionTitle('Graduate Degree'),
              Switch(
                value: _hasGradDegree,
                onChanged: (value) {
                  setState(() => _hasGradDegree = value);
                  widget.onChanged();
                },
              ),
            ],
          ),
          if (_hasGradDegree) ...[
            AppSpacing.itemGap,
            _buildEducationCard(
              context,
              isDark,
              schoolController: _gradSchoolController,
              majorController: _gradMajorController,
              gpaController: _gradGpaController,
              degreeType: _gradDegreeType,
              gradYear: _gradGradYear,
              degreeTypes: _gradDegreeTypes,
              onDegreeChanged: (value) {
                setState(() => _gradDegreeType = value!);
                widget.onChanged();
              },
              onYearChanged: (value) {
                setState(() => _gradGradYear = value!);
                widget.onChanged();
              },
              isGrad: true,
            ),
          ],
          AppSpacing.sectionGap,
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(title, style: AppTextStyles.h4);
  }

  Widget _buildEducationCard(
    BuildContext context,
    bool isDark, {
    required TextEditingController schoolController,
    required TextEditingController majorController,
    required TextEditingController gpaController,
    required String degreeType,
    required int gradYear,
    required List<String> degreeTypes,
    required void Function(String?) onDegreeChanged,
    required void Function(int?) onYearChanged,
    bool isGrad = false,
  }) {
    final currentYear = DateTime.now().year;
    final years = List.generate(26, (i) => currentYear + i - 20);

    return Container(
      padding: AppSpacing.cardPadding,
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: AppRadius.card,
        border: Border.all(
          color: isDark ? AppColors.borderDark : AppColors.borderLight,
        ),
      ),
      child: Column(
        children: [
          // School
          TextField(
            controller: schoolController,
            onChanged: (_) => widget.onChanged(),
            decoration: const InputDecoration(
              labelText: 'School',
              prefixIcon: Icon(Icons.school_outlined),
              border: OutlineInputBorder(),
            ),
          ),
          AppSpacing.subsectionGap,

          // Degree Type and Major
          Row(
            children: [
              Expanded(
                flex: 2,
                child: DropdownButtonFormField<String>(
                  initialValue: degreeType,
                  decoration: const InputDecoration(
                    labelText: 'Degree',
                    border: OutlineInputBorder(),
                  ),
                  items: degreeTypes.map((type) {
                    return DropdownMenuItem(value: type, child: Text(type));
                  }).toList(),
                  onChanged: onDegreeChanged,
                ),
              ),
              AppSpacing.hGapMd,
              Expanded(
                flex: 3,
                child: TextField(
                  controller: majorController,
                  onChanged: (_) => widget.onChanged(),
                  decoration: const InputDecoration(
                    labelText: 'Major',
                    border: OutlineInputBorder(),
                  ),
                ),
              ),
            ],
          ),
          AppSpacing.subsectionGap,

          // GPA and Graduation Year
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: gpaController,
                  onChanged: (_) => widget.onChanged(),
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                  ),
                  inputFormatters: [
                    FilteringTextInputFormatter.allow(
                      RegExp(r'^\d*\.?\d{0,2}'),
                    ),
                  ],
                  decoration: const InputDecoration(
                    labelText: 'GPA',
                    border: OutlineInputBorder(),
                  ),
                ),
              ),
              AppSpacing.hGapMd,
              Expanded(
                child: DropdownButtonFormField<int>(
                  initialValue: gradYear,
                  decoration: InputDecoration(
                    labelText: isGrad ? 'Expected' : 'Class of',
                    border: const OutlineInputBorder(),
                  ),
                  items: years.map((year) {
                    return DropdownMenuItem(value: year, child: Text('$year'));
                  }).toList(),
                  onChanged: onYearChanged,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Preferences Tab - Target roles, locations, visibility settings
class _PreferencesTab extends StatefulWidget {
  final VoidCallback onChanged;

  const _PreferencesTab({required this.onChanged});

  @override
  State<_PreferencesTab> createState() => _PreferencesTabState();
}

class _PreferencesTabState extends State<_PreferencesTab> {
  // Target roles (matches website options)
  final List<String> _allRoles = [
    'Investment Banking',
    'Private Equity',
    'Venture Capital',
    'Hedge Fund',
    'Asset Management',
    'Consulting',
    'Corporate Finance',
    'Equity Research',
    'Sales & Trading',
    'Wealth Management',
    'Real Estate',
    'Fintech',
  ];
  final Set<String> _selectedRoles = {
    'Investment Banking',
    'Private Equity',
    'Venture Capital',
  };

  // Preferred locations (matches website options + international)
  final List<String> _allLocations = [
    'New York, NY',
    'San Francisco, CA',
    'Chicago, IL',
    'Boston, MA',
    'Los Angeles, CA',
    'Miami, FL',
    'Dallas, TX',
    'Houston, TX',
    'Seattle, WA',
    'Austin, TX',
    'Denver, CO',
    'Atlanta, GA',
    'Washington, DC',
    'London, UK',
    'Hong Kong',
    'Remote',
  ];
  final Set<String> _selectedLocations = {
    'New York, NY',
    'San Francisco, CA',
    'Boston, MA',
  };

  // Visibility settings
  bool _showLinkedIn = true;
  bool _showEmail = true;
  bool _showResume = true;
  bool _showTranscript = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SingleChildScrollView(
      padding: AppSpacing.screenPadding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Target Roles
          _buildSectionTitle('Target Roles'),
          const SizedBox(height: 4),
          Text(
            'Select all roles you\'re interested in',
            style: AppTextStyles.caption.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
          AppSpacing.itemGap,
          _buildChipSelector(
            context,
            items: _allRoles,
            selected: _selectedRoles,
            onToggle: (role) {
              setState(() {
                if (_selectedRoles.contains(role)) {
                  _selectedRoles.remove(role);
                } else {
                  _selectedRoles.add(role);
                }
              });
              widget.onChanged();
            },
          ),
          AppSpacing.sectionGap,

          // Preferred Locations
          _buildSectionTitle('Preferred Locations'),
          const SizedBox(height: 4),
          Text(
            'Where would you like to work?',
            style: AppTextStyles.caption.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
          AppSpacing.itemGap,
          _buildChipSelector(
            context,
            items: _allLocations,
            selected: _selectedLocations,
            onToggle: (location) {
              setState(() {
                if (_selectedLocations.contains(location)) {
                  _selectedLocations.remove(location);
                } else {
                  _selectedLocations.add(location);
                }
              });
              widget.onChanged();
            },
          ),
          AppSpacing.sectionGap,

          // Visibility Settings - Recruiters
          _buildSectionTitle('Visibility to Recruiters'),
          const SizedBox(height: 4),
          Text(
            'Control what recruiters can see',
            style: AppTextStyles.caption.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
          AppSpacing.itemGap,
          _buildVisibilityCard(context, isDark, [
            _buildVisibilityToggle(
              'LinkedIn URL',
              'Allow recruiters to see your LinkedIn',
              _showLinkedIn,
              (value) {
                setState(() => _showLinkedIn = value);
                widget.onChanged();
              },
            ),
            _buildVisibilityToggle(
              'Email Address',
              'Allow recruiters to see your email',
              _showEmail,
              (value) {
                setState(() => _showEmail = value);
                widget.onChanged();
              },
            ),
            _buildVisibilityToggle(
              'Resume',
              'Allow recruiters to view your resume',
              _showResume,
              (value) {
                setState(() => _showResume = value);
                widget.onChanged();
              },
            ),
            _buildVisibilityToggle(
              'Transcript',
              'Allow recruiters to view your transcript',
              _showTranscript,
              (value) {
                setState(() => _showTranscript = value);
                widget.onChanged();
              },
            ),
          ]),
          AppSpacing.sectionGap,
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(title, style: AppTextStyles.h4);
  }

  Widget _buildChipSelector(
    BuildContext context, {
    required List<String> items,
    required Set<String> selected,
    required void Function(String) onToggle,
  }) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: items.map((item) {
        final isSelected = selected.contains(item);
        return FilterChip(
          label: Text(item),
          selected: isSelected,
          onSelected: (_) => onToggle(item),
          selectedColor: AppColors.teal.withValues(alpha: 0.2),
          checkmarkColor: AppColors.teal,
          side: BorderSide(
            color: isSelected
                ? AppColors.teal
                : Theme.of(context).colorScheme.outline,
          ),
        );
      }).toList(),
    );
  }

  Widget _buildVisibilityCard(
    BuildContext context,
    bool isDark,
    List<Widget> children,
  ) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: AppRadius.card,
        border: Border.all(
          color: isDark ? AppColors.borderDark : AppColors.borderLight,
        ),
      ),
      child: Column(
        children: children
            .asMap()
            .entries
            .map(
              (entry) => Column(
                children: [
                  entry.value,
                  if (entry.key < children.length - 1) const Divider(height: 1),
                ],
              ),
            )
            .toList(),
      ),
    );
  }

  Widget _buildVisibilityToggle(
    String title,
    String subtitle,
    bool value,
    void Function(bool) onChanged,
  ) {
    return ListTile(
      title: Text(title, style: AppTextStyles.labelMedium),
      subtitle: Text(
        subtitle,
        style: AppTextStyles.caption.copyWith(
          color: Theme.of(context).colorScheme.onSurfaceVariant,
        ),
      ),
      trailing: Switch(value: value, onChanged: onChanged),
    );
  }
}
