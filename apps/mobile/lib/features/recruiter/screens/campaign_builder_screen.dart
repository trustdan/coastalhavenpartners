import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../widgets/magic_ui/magic_ui.dart';
import '../../../data/repositories/recruiter_repository.dart';
import '../../../data/models/models.dart';
import '../../../core/providers/recruiter_provider.dart';

/// Campaign Builder Screen - 4-step wizard for creating campaigns
class CampaignBuilderScreen extends ConsumerStatefulWidget {
  final String? campaignId; // For editing existing campaigns

  const CampaignBuilderScreen({super.key, this.campaignId});

  @override
  ConsumerState<CampaignBuilderScreen> createState() =>
      _CampaignBuilderScreenState();
}

class _CampaignBuilderScreenState extends ConsumerState<CampaignBuilderScreen> {
  int _currentStep = 0;
  final _formKey = GlobalKey<FormState>();

  // Step 1: Campaign Details
  final _nameController = TextEditingController();
  final _subjectController = TextEditingController();
  String _selectedTemplate = 'blank';

  // Step 2: Target Filters
  RangeValues _gpaRange = const RangeValues(3.0, 4.0);
  final Set<String> _selectedSchools = {};
  final Set<String> _selectedRoles = {'Investment Banking', 'Private Equity'};
  int _minYear = 2024;
  int _maxYear = 2026;

  // Step 3: Message
  final _messageController = TextEditingController(
    text: '''Hi {{first_name}},

I'm {{recruiter_name}} from {{firm_name}}. I came across your profile and was impressed by your background at {{school}}.

We're currently looking for talented individuals to join our team, and I believe you'd be a great fit.

Would you be open to a brief call to discuss potential opportunities?

Best regards,
{{recruiter_name}}''',
  );

  // Step 4: Review
  DateTime? _scheduledFor;

  // Mock data
  final _templates = [
    ('blank', 'Blank Template', 'Start from scratch'),
    ('intro', 'Introduction', 'Introduce yourself and your firm'),
    ('opportunity', 'Job Opportunity', 'Share a specific role'),
    ('event', 'Event Invitation', 'Invite to a networking event'),
  ];

  final _schools = [
    'Harvard University',
    'Wharton School',
    'Stanford GSB',
    'Columbia Business School',
    'MIT Sloan',
    'Chicago Booth',
  ];

  final _roles = [
    'Investment Banking',
    'Private Equity',
    'Venture Capital',
    'Hedge Fund',
    'Equity Research',
  ];

  int get _matchingCandidates {
    // Mock calculation based on filters
    int base = 250;
    if (_selectedSchools.isNotEmpty) {
      base = (base * _selectedSchools.length / _schools.length).round();
    }
    if (_selectedRoles.isNotEmpty) {
      base = (base * _selectedRoles.length / _roles.length).round();
    }
    if (_gpaRange.start > 3.0) {
      base = (base * 0.7).round();
    }
    return base.clamp(5, 200);
  }

  bool _isLoading = false;
  bool _isSaving = false;
  String? _existingCampaignId;

  @override
  void initState() {
    super.initState();
    if (widget.campaignId != null) {
      _loadExistingCampaign();
    }
  }

  Future<void> _loadExistingCampaign() async {
    setState(() => _isLoading = true);
    try {
      final campaign = await RecruiterRepository.instance.getCampaign(
        widget.campaignId!,
      );
      if (campaign != null && mounted) {
        setState(() {
          _existingCampaignId = campaign.id;
          _nameController.text = campaign.name;
          _subjectController.text = campaign.subject;
          _messageController.text = campaign.messageTemplate;

          // Load filters if available
          if (campaign.filters != null) {
            final filters = campaign.filters!;
            if (filters['gpa_min'] != null && filters['gpa_max'] != null) {
              _gpaRange = RangeValues(
                (filters['gpa_min'] as num).toDouble(),
                (filters['gpa_max'] as num).toDouble(),
              );
            }
            if (filters['schools'] != null) {
              _selectedSchools.clear();
              _selectedSchools.addAll(List<String>.from(filters['schools']));
            }
            if (filters['roles'] != null) {
              _selectedRoles.clear();
              _selectedRoles.addAll(List<String>.from(filters['roles']));
            }
            if (filters['grad_year_min'] != null) {
              _minYear = filters['grad_year_min'] as int;
            }
            if (filters['grad_year_max'] != null) {
              _maxYear = filters['grad_year_max'] as int;
            }
          }
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error loading campaign: $e')));
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _subjectController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_currentStep == 0) {
      if (_formKey.currentState?.validate() != true) return;
    }
    if (_currentStep < 3) {
      setState(() => _currentStep++);
    }
  }

  void _previousStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
    }
  }

  Map<String, dynamic> _buildFilters() {
    return {
      'gpa_min': _gpaRange.start,
      'gpa_max': _gpaRange.end,
      'schools': _selectedSchools.toList(),
      'roles': _selectedRoles.toList(),
      'grad_year_min': _minYear,
      'grad_year_max': _maxYear,
    };
  }

  Future<void> _saveDraft() async {
    if (_nameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a campaign name')),
      );
      return;
    }

    setState(() => _isSaving = true);
    try {
      if (_existingCampaignId != null) {
        // Update existing campaign
        await RecruiterRepository.instance.updateCampaign(
          campaignId: _existingCampaignId!,
          name: _nameController.text.trim(),
          subject: _subjectController.text.trim(),
          messageTemplate: _messageController.text,
          filters: _buildFilters(),
          status: CampaignStatus.draft,
        );
      } else {
        // Create new campaign (defaults to draft status)
        final campaign = await RecruiterRepository.instance.createCampaign(
          name: _nameController.text.trim(),
          subject: _subjectController.text.trim(),
          messageTemplate: _messageController.text,
          filters: _buildFilters(),
        );
        if (campaign != null) {
          _existingCampaignId = campaign.id;
        }
      }

      // Invalidate campaigns provider to refresh the list
      ref.invalidate(campaignsProvider);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Campaign saved as draft'),
            backgroundColor: AppColors.success,
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error saving campaign: $e')));
      }
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }

  void _sendCampaign() {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Send Campaign'),
        content: Text(
          _scheduledFor != null
              ? 'Schedule campaign for ${_formatDate(_scheduledFor!)}?'
              : 'Send campaign to $_matchingCandidates candidates now?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () async {
              Navigator.pop(dialogContext);
              await _executeSendCampaign();
            },
            child: Text(_scheduledFor != null ? 'Schedule' : 'Send'),
          ),
        ],
      ),
    );
  }

  Future<void> _executeSendCampaign() async {
    setState(() => _isSaving = true);
    try {
      final status = _scheduledFor != null
          ? CampaignStatus.scheduled
          : CampaignStatus.sent;

      if (_existingCampaignId != null) {
        // Update existing campaign
        await RecruiterRepository.instance.updateCampaign(
          campaignId: _existingCampaignId!,
          name: _nameController.text.trim(),
          subject: _subjectController.text.trim(),
          messageTemplate: _messageController.text,
          filters: _buildFilters(),
          status: status,
          scheduledAt: _scheduledFor,
        );
      } else {
        // Create new campaign first
        final campaign = await RecruiterRepository.instance.createCampaign(
          name: _nameController.text.trim(),
          subject: _subjectController.text.trim(),
          messageTemplate: _messageController.text,
          filters: _buildFilters(),
        );

        // Then update to scheduled/sent status
        if (campaign != null) {
          await RecruiterRepository.instance.updateCampaign(
            campaignId: campaign.id,
            status: status,
            scheduledAt: _scheduledFor,
          );
        }
      }

      // Invalidate campaigns provider to refresh the list
      ref.invalidate(campaignsProvider);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              _scheduledFor != null ? 'Campaign scheduled!' : 'Campaign sent!',
            ),
            backgroundColor: AppColors.success,
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.campaignId != null ? 'Edit Campaign' : 'New Campaign',
        ),
        actions: [
          if (_isSaving)
            const Padding(
              padding: EdgeInsets.only(right: 16),
              child: Center(
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
              ),
            )
          else
            TextButton(onPressed: _saveDraft, child: const Text('Save Draft')),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Step indicator
                _buildStepIndicator(context, isDark),

                // Step content
                Expanded(
                  child: SingleChildScrollView(
                    padding: AppSpacing.screenPadding,
                    child: _buildStepContent(context, isDark),
                  ),
                ),

                // Navigation buttons
                _buildNavigationButtons(context, isDark),
              ],
            ),
    );
  }

  Widget _buildStepIndicator(BuildContext context, bool isDark) {
    final steps = ['Details', 'Filters', 'Message', 'Review'];

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
        border: Border(
          bottom: BorderSide(
            color: isDark ? AppColors.borderDark : AppColors.borderLight,
          ),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(steps.length, (index) {
          final isActive = index == _currentStep;
          final isCompleted = index < _currentStep;

          return Row(
            children: [
              if (index > 0)
                Container(
                  width: 32,
                  height: 2,
                  color: isCompleted
                      ? AppColors.teal
                      : (isDark ? AppColors.borderDark : AppColors.borderLight),
                ),
              Column(
                children: [
                  Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(
                      color: isActive || isCompleted
                          ? AppColors.teal
                          : (isDark
                                ? AppColors.borderDark
                                : AppColors.borderLight),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: isCompleted
                          ? const Icon(
                              Icons.check,
                              size: 16,
                              color: Colors.white,
                            )
                          : Text(
                              '${index + 1}',
                              style: AppTextStyles.badge.copyWith(
                                color: isActive || isCompleted
                                    ? Colors.white
                                    : Theme.of(
                                        context,
                                      ).colorScheme.onSurfaceVariant,
                              ),
                            ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    steps[index],
                    style: AppTextStyles.caption.copyWith(
                      color: isActive
                          ? AppColors.teal
                          : Theme.of(context).colorScheme.onSurfaceVariant,
                      fontWeight: isActive
                          ? FontWeight.w600
                          : FontWeight.normal,
                    ),
                  ),
                ],
              ),
            ],
          );
        }),
      ),
    );
  }

  Widget _buildStepContent(BuildContext context, bool isDark) {
    switch (_currentStep) {
      case 0:
        return _buildStep1Details(context, isDark);
      case 1:
        return _buildStep2Filters(context, isDark);
      case 2:
        return _buildStep3Message(context, isDark);
      case 3:
        return _buildStep4Review(context, isDark);
      default:
        return const SizedBox.shrink();
    }
  }

  // Step 1: Campaign Details
  Widget _buildStep1Details(BuildContext context, bool isDark) {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Campaign Details', style: AppTextStyles.h3),
          const SizedBox(height: 8),
          Text(
            'Give your campaign a name and choose a template',
            style: AppTextStyles.bodyMedium.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
          AppSpacing.sectionGap,

          // Campaign name
          TextFormField(
            controller: _nameController,
            decoration: const InputDecoration(
              labelText: 'Campaign Name',
              hintText: 'e.g., Summer Analyst Outreach 2025',
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter a campaign name';
              }
              return null;
            },
          ),
          AppSpacing.subsectionGap,

          // Subject line
          TextFormField(
            controller: _subjectController,
            decoration: const InputDecoration(
              labelText: 'Email Subject Line',
              hintText: 'e.g., Exciting opportunity at [Firm Name]',
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter a subject line';
              }
              return null;
            },
          ),
          AppSpacing.sectionGap,

          // Template selection
          Text('Choose a Template', style: AppTextStyles.labelLarge),
          AppSpacing.itemGap,
          ..._templates.map(
            (template) => _buildTemplateOption(
              context,
              isDark,
              id: template.$1,
              title: template.$2,
              description: template.$3,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTemplateOption(
    BuildContext context,
    bool isDark, {
    required String id,
    required String title,
    required String description,
  }) {
    final isSelected = _selectedTemplate == id;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: isSelected
            ? AppColors.teal.withValues(alpha: 0.1)
            : (isDark ? AppColors.cardDark : AppColors.cardLight),
        borderRadius: AppRadius.card,
        child: InkWell(
          onTap: () => setState(() => _selectedTemplate = id),
          borderRadius: AppRadius.card,
          child: Container(
            padding: AppSpacing.listItemPadding,
            decoration: BoxDecoration(
              borderRadius: AppRadius.card,
              border: Border.all(
                color: isSelected
                    ? AppColors.teal
                    : (isDark ? AppColors.borderDark : AppColors.borderLight),
                width: isSelected ? 2 : 1,
              ),
            ),
            child: Row(
              children: [
                Radio<String>(
                  value: id,
                  groupValue: _selectedTemplate,
                  onChanged: (value) {
                    if (value != null) {
                      setState(() => _selectedTemplate = value);
                    }
                  },
                  activeColor: AppColors.teal,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: AppTextStyles.labelMedium),
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
          ),
        ),
      ),
    );
  }

  // Step 2: Target Filters
  Widget _buildStep2Filters(BuildContext context, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Target Audience', style: AppTextStyles.h3),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.teal.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.people, size: 16, color: AppColors.teal),
                  const SizedBox(width: 6),
                  Text(
                    '$_matchingCandidates matches',
                    style: AppTextStyles.labelSmall.copyWith(
                      color: AppColors.teal,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          'Define who should receive this campaign',
          style: AppTextStyles.bodyMedium.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
        AppSpacing.sectionGap,

        // GPA Range
        Text('GPA Range', style: AppTextStyles.labelLarge),
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
          onChanged: (values) => setState(() => _gpaRange = values),
        ),
        AppSpacing.subsectionGap,

        // Schools
        Text('Schools', style: AppTextStyles.labelLarge),
        AppSpacing.itemGap,
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _schools.map((school) {
            final isSelected = _selectedSchools.contains(school);
            return FilterChip(
              label: Text(school),
              selected: isSelected,
              onSelected: (selected) {
                setState(() {
                  if (selected) {
                    _selectedSchools.add(school);
                  } else {
                    _selectedSchools.remove(school);
                  }
                });
              },
              selectedColor: AppColors.teal.withValues(alpha: 0.2),
              checkmarkColor: AppColors.teal,
            );
          }).toList(),
        ),
        AppSpacing.subsectionGap,

        // Target Roles
        Text('Target Roles', style: AppTextStyles.labelLarge),
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
            );
          }).toList(),
        ),
        AppSpacing.subsectionGap,

        // Graduation Year
        Text('Graduation Year', style: AppTextStyles.labelLarge),
        AppSpacing.itemGap,
        Row(
          children: [
            Expanded(
              child: DropdownButtonFormField<int>(
                initialValue: _minYear,
                decoration: const InputDecoration(labelText: 'From'),
                items: List.generate(5, (i) => 2022 + i)
                    .map(
                      (year) =>
                          DropdownMenuItem(value: year, child: Text('$year')),
                    )
                    .toList(),
                onChanged: (value) {
                  if (value != null) {
                    setState(() {
                      _minYear = value;
                      if (_maxYear < _minYear) _maxYear = _minYear;
                    });
                  }
                },
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: DropdownButtonFormField<int>(
                initialValue: _maxYear,
                decoration: const InputDecoration(labelText: 'To'),
                items: List.generate(5, (i) => 2022 + i)
                    .where((year) => year >= _minYear)
                    .map(
                      (year) =>
                          DropdownMenuItem(value: year, child: Text('$year')),
                    )
                    .toList(),
                onChanged: (value) {
                  if (value != null) {
                    setState(() => _maxYear = value);
                  }
                },
              ),
            ),
          ],
        ),
      ],
    );
  }

  // Step 3: Message
  Widget _buildStep3Message(BuildContext context, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Compose Message', style: AppTextStyles.h3),
        const SizedBox(height: 8),
        Text(
          'Write your outreach message. Use variables to personalize.',
          style: AppTextStyles.bodyMedium.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
        AppSpacing.subsectionGap,

        // Variable chips
        Text('Available Variables', style: AppTextStyles.labelMedium),
        AppSpacing.itemGap,
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            _buildVariableChip('{{first_name}}', 'Candidate first name'),
            _buildVariableChip('{{school}}', 'Candidate school'),
            _buildVariableChip('{{firm_name}}', 'Your firm name'),
            _buildVariableChip('{{recruiter_name}}', 'Your name'),
          ],
        ),
        AppSpacing.subsectionGap,

        // Message editor
        Container(
          decoration: BoxDecoration(
            color: isDark ? AppColors.cardDark : AppColors.cardLight,
            borderRadius: AppRadius.card,
            border: Border.all(
              color: isDark ? AppColors.borderDark : AppColors.borderLight,
            ),
          ),
          child: TextField(
            controller: _messageController,
            maxLines: 12,
            decoration: const InputDecoration(
              border: InputBorder.none,
              contentPadding: EdgeInsets.all(16),
              hintText: 'Write your message here...',
            ),
          ),
        ),
        AppSpacing.subsectionGap,

        // Preview button
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: () => _showPreview(context, isDark),
            icon: const Icon(Icons.visibility_outlined),
            label: const Text('Preview with Sample Data'),
          ),
        ),
      ],
    );
  }

  Widget _buildVariableChip(String variable, String description) {
    return Tooltip(
      message: description,
      child: ActionChip(
        label: Text(variable, style: const TextStyle(fontFamily: 'monospace')),
        onPressed: () {
          final text = _messageController.text;
          final selection = _messageController.selection;
          final newText = text.replaceRange(
            selection.start,
            selection.end,
            variable,
          );
          _messageController.value = TextEditingValue(
            text: newText,
            selection: TextSelection.collapsed(
              offset: selection.start + variable.length,
            ),
          );
        },
        backgroundColor: AppColors.teal.withValues(alpha: 0.1),
        side: BorderSide.none,
      ),
    );
  }

  void _showPreview(BuildContext context, bool isDark) {
    final previewMessage = _messageController.text
        .replaceAll('{{first_name}}', 'Alex')
        .replaceAll('{{school}}', 'Harvard University')
        .replaceAll('{{firm_name}}', 'Blackstone')
        .replaceAll('{{recruiter_name}}', 'Sarah Johnson');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.7,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Preview', style: AppTextStyles.h4),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const Divider(),
            Text(
              'Subject: ${_subjectController.text.isEmpty ? "(No subject)" : _subjectController.text}',
              style: AppTextStyles.labelMedium,
            ),
            const SizedBox(height: 16),
            Expanded(
              child: SingleChildScrollView(
                child: Text(previewMessage, style: AppTextStyles.bodyMedium),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Step 4: Review
  Widget _buildStep4Review(BuildContext context, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Review Campaign', style: AppTextStyles.h3),
        const SizedBox(height: 8),
        Text(
          'Review your campaign before sending',
          style: AppTextStyles.bodyMedium.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
        AppSpacing.sectionGap,

        // Summary card
        ShineBorderCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildReviewRow(
                'Campaign Name',
                _nameController.text.isEmpty
                    ? '(Not set)'
                    : _nameController.text,
              ),
              const SizedBox(height: 12),
              _buildReviewRow(
                'Subject Line',
                _subjectController.text.isEmpty
                    ? '(Not set)'
                    : _subjectController.text,
              ),
              const SizedBox(height: 12),
              _buildReviewRow('Recipients', '$_matchingCandidates candidates'),
              const SizedBox(height: 12),
              _buildReviewRow(
                'Target Roles',
                _selectedRoles.isEmpty
                    ? 'All roles'
                    : _selectedRoles.join(', '),
              ),
              const SizedBox(height: 12),
              _buildReviewRow(
                'GPA Range',
                '${_gpaRange.start.toStringAsFixed(1)} - ${_gpaRange.end.toStringAsFixed(1)}',
              ),
            ],
          ),
        ),
        AppSpacing.sectionGap,

        // Schedule option
        Text('When to Send', style: AppTextStyles.labelLarge),
        AppSpacing.itemGap,
        _buildScheduleOption(
          context,
          isDark,
          isSelected: _scheduledFor == null,
          title: 'Send Now',
          subtitle: 'Campaign will be sent immediately',
          icon: Icons.send,
          onTap: () => setState(() => _scheduledFor = null),
        ),
        const SizedBox(height: 8),
        _buildScheduleOption(
          context,
          isDark,
          isSelected: _scheduledFor != null,
          title: 'Schedule for Later',
          subtitle: _scheduledFor != null
              ? _formatDate(_scheduledFor!)
              : 'Choose date and time',
          icon: Icons.schedule,
          onTap: () => _pickScheduleTime(context),
        ),
        AppSpacing.sectionGap,

        // Message preview
        Text('Message Preview', style: AppTextStyles.labelLarge),
        AppSpacing.itemGap,
        Container(
          padding: AppSpacing.cardPadding,
          decoration: BoxDecoration(
            color: isDark ? AppColors.cardDark : AppColors.cardLight,
            borderRadius: AppRadius.card,
            border: Border.all(
              color: isDark ? AppColors.borderDark : AppColors.borderLight,
            ),
          ),
          child: Text(
            _messageController.text.length > 200
                ? '${_messageController.text.substring(0, 200)}...'
                : _messageController.text,
            style: AppTextStyles.bodySmall,
          ),
        ),
      ],
    );
  }

  Widget _buildReviewRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 100,
          child: Text(
            label,
            style: AppTextStyles.caption.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
        ),
        Expanded(child: Text(value, style: AppTextStyles.labelMedium)),
      ],
    );
  }

  Widget _buildScheduleOption(
    BuildContext context,
    bool isDark, {
    required bool isSelected,
    required String title,
    required String subtitle,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return Material(
      color: isSelected
          ? AppColors.teal.withValues(alpha: 0.1)
          : (isDark ? AppColors.cardDark : AppColors.cardLight),
      borderRadius: AppRadius.card,
      child: InkWell(
        onTap: onTap,
        borderRadius: AppRadius.card,
        child: Container(
          padding: AppSpacing.listItemPadding,
          decoration: BoxDecoration(
            borderRadius: AppRadius.card,
            border: Border.all(
              color: isSelected
                  ? AppColors.teal
                  : (isDark ? AppColors.borderDark : AppColors.borderLight),
              width: isSelected ? 2 : 1,
            ),
          ),
          child: Row(
            children: [
              Icon(
                icon,
                color: isSelected
                    ? AppColors.teal
                    : Theme.of(context).colorScheme.onSurfaceVariant,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: AppTextStyles.labelMedium),
                    Text(
                      subtitle,
                      style: AppTextStyles.caption.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              if (isSelected)
                const Icon(Icons.check_circle, color: AppColors.teal),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _pickScheduleTime(BuildContext context) async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
    );

    if (date != null && mounted) {
      final time = await showTimePicker(
        context: context,
        initialTime: const TimeOfDay(hour: 9, minute: 0),
      );

      if (time != null && mounted) {
        setState(() {
          _scheduledFor = DateTime(
            date.year,
            date.month,
            date.day,
            time.hour,
            time.minute,
          );
        });
      }
    }
  }

  Widget _buildNavigationButtons(BuildContext context, bool isDark) {
    return Container(
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
        child: Row(
          children: [
            if (_currentStep > 0)
              Expanded(
                child: OutlinedButton(
                  onPressed: _previousStep,
                  child: const Text('Back'),
                ),
              ),
            if (_currentStep > 0) const SizedBox(width: 12),
            Expanded(
              flex: 2,
              child: _currentStep < 3
                  ? FilledButton(
                      onPressed: _nextStep,
                      child: const Text('Continue'),
                    )
                  : ShimmerButton(
                      onPressed: _sendCampaign,
                      text: _scheduledFor != null
                          ? 'Schedule'
                          : 'Send Campaign',
                    ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return '${months[date.month - 1]} ${date.day}, ${date.year} at ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }
}
