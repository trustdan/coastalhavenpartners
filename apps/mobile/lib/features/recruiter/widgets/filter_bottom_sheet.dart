import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../widgets/magic_ui/magic_ui.dart';

/// Filter bottom sheet for candidate search
class FilterBottomSheet extends StatefulWidget {
  final Function(List<String>) onApply;

  const FilterBottomSheet({
    super.key,
    required this.onApply,
  });

  @override
  State<FilterBottomSheet> createState() => _FilterBottomSheetState();
}

class _FilterBottomSheetState extends State<FilterBottomSheet> {
  // GPA Range
  RangeValues _gpaRange = const RangeValues(3.0, 4.0);

  // Schools (selected)
  final Set<String> _selectedSchools = {'Harvard University', 'Wharton School'};

  // Target Roles (selected)
  final Set<String> _selectedRoles = {'Investment Banking'};

  // Graduation Year
  int _minYear = 2024;
  int _maxYear = 2026;

  // Experience Level
  String _experienceLevel = 'Any';

  // Profile Completeness
  bool _hasResume = false;
  bool _hasTranscript = false;
  bool _hasCalendar = false;
  bool _hasBio = false;

  // Available options
  static const _schools = [
    'Harvard University',
    'Wharton School',
    'Stanford GSB',
    'Columbia Business School',
    'MIT Sloan',
    'Chicago Booth',
    'Kellogg',
    'Yale SOM',
    'NYU Stern',
    'Duke Fuqua',
    'Berkeley Haas',
    'Michigan Ross',
    'Dartmouth Tuck',
    'Cornell Johnson',
    'UCLA Anderson',
  ];

  static const _roles = [
    'Investment Banking',
    'Private Equity',
    'Venture Capital',
    'Hedge Fund',
    'Equity Research',
    'Sales & Trading',
    'Corporate Development',
    'Asset Management',
  ];

  static const _experienceLevels = [
    'Any',
    '0-2 years',
    '3-5 years',
    '5+ years',
  ];

  List<String> _buildFilterList() {
    final filters = <String>[];

    // GPA filter
    if (_gpaRange.start > 3.0 || _gpaRange.end < 4.0) {
      filters.add('GPA ${_gpaRange.start.toStringAsFixed(1)}-${_gpaRange.end.toStringAsFixed(1)}');
    }

    // Schools
    if (_selectedSchools.isNotEmpty && _selectedSchools.length < _schools.length) {
      if (_selectedSchools.length <= 2) {
        filters.addAll(_selectedSchools);
      } else {
        filters.add('${_selectedSchools.length} schools');
      }
    }

    // Roles
    if (_selectedRoles.isNotEmpty) {
      filters.addAll(_selectedRoles.take(2));
      if (_selectedRoles.length > 2) {
        filters.add('+${_selectedRoles.length - 2} roles');
      }
    }

    // Graduation year
    if (_minYear > 2024 || _maxYear < 2026) {
      filters.add('$_minYear-$_maxYear');
    }

    // Experience
    if (_experienceLevel != 'Any') {
      filters.add(_experienceLevel);
    }

    // Profile completeness
    if (_hasResume) filters.add('Has Resume');
    if (_hasTranscript) filters.add('Has Transcript');
    if (_hasCalendar) filters.add('Has Calendar');
    if (_hasBio) filters.add('Has Bio');

    return filters;
  }

  void _reset() {
    setState(() {
      _gpaRange = const RangeValues(3.0, 4.0);
      _selectedSchools.clear();
      _selectedRoles.clear();
      _minYear = 2024;
      _maxYear = 2026;
      _experienceLevel = 'Any';
      _hasResume = false;
      _hasTranscript = false;
      _hasCalendar = false;
      _hasBio = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.85,
      ),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 12),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: isDark ? AppColors.borderDark : AppColors.borderLight,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Filters', style: AppTextStyles.h3),
                TextButton(
                  onPressed: _reset,
                  child: const Text('Reset'),
                ),
              ],
            ),
          ),

          const Divider(height: 1),

          // Filters content
          Flexible(
            child: SingleChildScrollView(
              padding: AppSpacing.screenPadding,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // GPA Range
                  _buildSectionTitle('GPA Range'),
                  AppSpacing.itemGap,
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _gpaRange.start.toStringAsFixed(1),
                        style: AppTextStyles.labelMedium,
                      ),
                      Text(
                        _gpaRange.end.toStringAsFixed(1),
                        style: AppTextStyles.labelMedium,
                      ),
                    ],
                  ),
                  RangeSlider(
                    values: _gpaRange,
                    min: 2.5,
                    max: 4.0,
                    divisions: 15,
                    labels: RangeLabels(
                      _gpaRange.start.toStringAsFixed(1),
                      _gpaRange.end.toStringAsFixed(1),
                    ),
                    onChanged: (values) {
                      setState(() {
                        _gpaRange = values;
                      });
                    },
                  ),
                  AppSpacing.subsectionGap,

                  // Schools
                  _buildSectionTitle('Schools'),
                  AppSpacing.itemGap,
                  _buildExpandableList(
                    items: _schools,
                    selected: _selectedSchools,
                    onToggle: (school) {
                      setState(() {
                        if (_selectedSchools.contains(school)) {
                          _selectedSchools.remove(school);
                        } else {
                          _selectedSchools.add(school);
                        }
                      });
                    },
                    isDark: isDark,
                  ),
                  AppSpacing.subsectionGap,

                  // Target Roles
                  _buildSectionTitle('Target Roles'),
                  AppSpacing.itemGap,
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _roles.map((role) {
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
                        side: BorderSide(
                          color: isSelected
                              ? AppColors.teal
                              : (isDark
                                  ? AppColors.borderDark
                                  : AppColors.borderLight),
                        ),
                      );
                    }).toList(),
                  ),
                  AppSpacing.subsectionGap,

                  // Graduation Year
                  _buildSectionTitle('Graduation Year'),
                  AppSpacing.itemGap,
                  Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<int>(
                          value: _minYear,
                          decoration: const InputDecoration(
                            labelText: 'From',
                            contentPadding: EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 8,
                            ),
                          ),
                          items: List.generate(5, (i) => 2022 + i)
                              .map((year) => DropdownMenuItem(
                                    value: year,
                                    child: Text('$year'),
                                  ))
                              .toList(),
                          onChanged: (value) {
                            if (value != null) {
                              setState(() {
                                _minYear = value;
                                if (_maxYear < _minYear) {
                                  _maxYear = _minYear;
                                }
                              });
                            }
                          },
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: DropdownButtonFormField<int>(
                          value: _maxYear,
                          decoration: const InputDecoration(
                            labelText: 'To',
                            contentPadding: EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 8,
                            ),
                          ),
                          items: List.generate(5, (i) => 2022 + i)
                              .where((year) => year >= _minYear)
                              .map((year) => DropdownMenuItem(
                                    value: year,
                                    child: Text('$year'),
                                  ))
                              .toList(),
                          onChanged: (value) {
                            if (value != null) {
                              setState(() {
                                _maxYear = value;
                              });
                            }
                          },
                        ),
                      ),
                    ],
                  ),
                  AppSpacing.subsectionGap,

                  // Experience Level
                  _buildSectionTitle('Experience Level'),
                  AppSpacing.itemGap,
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _experienceLevels.map((level) {
                      final isSelected = _experienceLevel == level;
                      return ChoiceChip(
                        label: Text(level),
                        selected: isSelected,
                        onSelected: (selected) {
                          if (selected) {
                            setState(() {
                              _experienceLevel = level;
                            });
                          }
                        },
                        selectedColor: AppColors.teal.withValues(alpha: 0.2),
                        checkmarkColor: AppColors.teal,
                      );
                    }).toList(),
                  ),
                  AppSpacing.subsectionGap,

                  // Profile Completeness
                  _buildSectionTitle('Profile Completeness'),
                  AppSpacing.itemGap,
                  _buildCheckbox('Has Resume', _hasResume, (v) {
                    setState(() => _hasResume = v ?? false);
                  }),
                  _buildCheckbox('Has Transcript', _hasTranscript, (v) {
                    setState(() => _hasTranscript = v ?? false);
                  }),
                  _buildCheckbox('Has Calendar Link', _hasCalendar, (v) {
                    setState(() => _hasCalendar = v ?? false);
                  }),
                  _buildCheckbox('Has Bio', _hasBio, (v) {
                    setState(() => _hasBio = v ?? false);
                  }),
                  AppSpacing.sectionGap,
                ],
              ),
            ),
          ),

          // Apply button
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
              border: Border(
                top: BorderSide(
                  color: isDark ? AppColors.borderDark : AppColors.borderLight,
                ),
              ),
            ),
            child: SafeArea(
              top: false,
              child: SizedBox(
                width: double.infinity,
                child: ShimmerButton(
                  onPressed: () {
                    widget.onApply(_buildFilterList());
                    Navigator.of(context).pop();
                  },
                  text: 'Apply Filters',
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: AppTextStyles.labelLarge.copyWith(
        fontWeight: FontWeight.w600,
      ),
    );
  }

  Widget _buildExpandableList({
    required List<String> items,
    required Set<String> selected,
    required Function(String) onToggle,
    required bool isDark,
  }) {
    // Show all items as chips for schools
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
                : (isDark ? AppColors.borderDark : AppColors.borderLight),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildCheckbox(String label, bool value, Function(bool?) onChanged) {
    return CheckboxListTile(
      title: Text(label, style: AppTextStyles.bodyMedium),
      value: value,
      onChanged: onChanged,
      dense: true,
      contentPadding: EdgeInsets.zero,
      controlAffinity: ListTileControlAffinity.leading,
      activeColor: AppColors.teal,
    );
  }
}
