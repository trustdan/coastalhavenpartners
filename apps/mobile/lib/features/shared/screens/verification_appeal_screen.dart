import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart' show FileOptions;
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../data/services/supabase_service.dart';

/// Appeal type options
enum AppealType {
  verificationRejected('Verification Rejected', 'My verification was rejected and I believe this was an error'),
  documentIssue('Document Issue', 'I need help with verification documents'),
  accountAccess('Account Access', 'I cannot access my account properly'),
  other('Other Issue', 'I have a different issue to report');

  const AppealType(this.title, this.description);
  final String title;
  final String description;
}

/// Verification Appeal Screen - Submit appeals for rejected verifications
class VerificationAppealScreen extends ConsumerStatefulWidget {
  /// Pre-selected appeal type
  final AppealType? initialAppealType;

  /// User role for context
  final String userRole;

  const VerificationAppealScreen({
    super.key,
    this.initialAppealType,
    required this.userRole,
  });

  @override
  ConsumerState<VerificationAppealScreen> createState() => _VerificationAppealScreenState();
}

class _VerificationAppealScreenState extends ConsumerState<VerificationAppealScreen> {
  final _formKey = GlobalKey<FormState>();
  final _subjectController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _additionalInfoController = TextEditingController();
  final _imagePicker = ImagePicker();

  AppealType? _selectedType;
  bool _isSubmitting = false;
  bool _attachDocuments = false;
  final List<XFile> _selectedFiles = [];
  final List<String> _uploadedUrls = [];

  @override
  void initState() {
    super.initState();
    _selectedType = widget.initialAppealType;
    if (_selectedType != null) {
      _subjectController.text = _selectedType!.title;
    }
  }

  @override
  void dispose() {
    _subjectController.dispose();
    _descriptionController.dispose();
    _additionalInfoController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final authState = ref.watch(authStateProvider);
    final userEmail = authState.hasValue ? authState.value?.user?.email : null;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Submit Appeal'),
      ),
      body: SingleChildScrollView(
        padding: AppSpacing.screenPadding,
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.info.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.info.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline, color: AppColors.info),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Our team will review your appeal and respond within 1-2 business days.',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.info,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              AppSpacing.sectionGap,

              // Appeal Type Selection
              Text('Issue Type', style: AppTextStyles.h4),
              const SizedBox(height: 12),
              ...AppealType.values.map((type) => _buildTypeOption(type, isDark)),
              AppSpacing.sectionGap,

              // Subject
              Text('Subject', style: AppTextStyles.h4),
              const SizedBox(height: 8),
              TextFormField(
                controller: _subjectController,
                decoration: InputDecoration(
                  hintText: 'Brief summary of your issue',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  filled: true,
                  fillColor: isDark ? AppColors.cardDark : AppColors.cardLight,
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter a subject';
                  }
                  return null;
                },
              ),
              AppSpacing.sectionGap,

              // Description
              Text('Description', style: AppTextStyles.h4),
              const SizedBox(height: 8),
              TextFormField(
                controller: _descriptionController,
                maxLines: 5,
                decoration: InputDecoration(
                  hintText: 'Please describe your issue in detail...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  filled: true,
                  fillColor: isDark ? AppColors.cardDark : AppColors.cardLight,
                  alignLabelWithHint: true,
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please describe your issue';
                  }
                  if (value.trim().length < 20) {
                    return 'Please provide more details (at least 20 characters)';
                  }
                  return null;
                },
              ),
              AppSpacing.sectionGap,

              // Additional Information
              Text('Additional Information (Optional)', style: AppTextStyles.h4),
              const SizedBox(height: 8),
              TextFormField(
                controller: _additionalInfoController,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'Any additional context that might help...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  filled: true,
                  fillColor: isDark ? AppColors.cardDark : AppColors.cardLight,
                  alignLabelWithHint: true,
                ),
              ),
              AppSpacing.sectionGap,

              // Document Attachment Option
              _buildDocumentSection(isDark),
              AppSpacing.sectionGap,

              // Contact Info
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.cardDark : AppColors.cardLight,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isDark ? AppColors.borderDark : AppColors.borderLight,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Contact Information', style: AppTextStyles.labelMedium),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.email_outlined, size: 18, color: AppColors.teal),
                        const SizedBox(width: 8),
                        Text(
                          userEmail ?? 'No email on file',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'We will respond to this email address',
                      style: AppTextStyles.caption.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              AppSpacing.sectionGap,

              // Submit Button
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: _isSubmitting ? null : _submitAppeal,
                  child: _isSubmitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text('Submit Appeal'),
                ),
              ),
              const SizedBox(height: 12),

              // Alternative Contact
              Center(
                child: TextButton.icon(
                  onPressed: () => _showDirectContactOptions(),
                  icon: const Icon(Icons.support_agent, size: 18),
                  label: const Text('Contact Support Directly'),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTypeOption(AppealType type, bool isDark) {
    final isSelected = _selectedType == type;

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        onTap: () {
          setState(() {
            _selectedType = type;
            if (_subjectController.text.isEmpty ||
                AppealType.values.any((t) => t.title == _subjectController.text)) {
              _subjectController.text = type.title;
            }
          });
        },
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isSelected
                ? AppColors.teal.withValues(alpha: 0.1)
                : isDark ? AppColors.cardDark : AppColors.cardLight,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected
                  ? AppColors.teal
                  : isDark ? AppColors.borderDark : AppColors.borderLight,
              width: isSelected ? 2 : 1,
            ),
          ),
          child: Row(
            children: [
              Icon(
                isSelected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                color: isSelected ? AppColors.teal : Theme.of(context).colorScheme.onSurfaceVariant,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      type.title,
                      style: AppTextStyles.labelMedium.copyWith(
                        color: isSelected ? AppColors.teal : null,
                      ),
                    ),
                    Text(
                      type.description,
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
    );
  }

  Widget _buildDocumentSection(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? AppColors.borderDark : AppColors.borderLight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Attach Supporting Documents', style: AppTextStyles.labelMedium),
                    const SizedBox(height: 4),
                    Text(
                      'Upload documents to support your appeal (e.g., ID, company verification)',
                      style: AppTextStyles.caption.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              Switch(
                value: _attachDocuments,
                onChanged: (value) => setState(() => _attachDocuments = value),
                activeTrackColor: AppColors.teal.withValues(alpha: 0.5),
                activeThumbColor: AppColors.teal,
              ),
            ],
          ),
          if (_attachDocuments) ...[
            const SizedBox(height: 16),
            if (_selectedFiles.isEmpty)
              OutlinedButton.icon(
                onPressed: _pickDocuments,
                icon: const Icon(Icons.attach_file),
                label: const Text('Select Files'),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 48),
                ),
              )
            else
              Column(
                children: [
                  ..._selectedFiles.map((file) => ListTile(
                    dense: true,
                    leading: const Icon(Icons.description, size: 20),
                    title: Text(file.name, style: AppTextStyles.bodySmall),
                    trailing: IconButton(
                      icon: const Icon(Icons.close, size: 18),
                      onPressed: () {
                        setState(() => _selectedFiles.remove(file));
                      },
                    ),
                  )),
                  TextButton.icon(
                    onPressed: _pickDocuments,
                    icon: const Icon(Icons.add, size: 18),
                    label: const Text('Add More'),
                  ),
                ],
              ),
            const SizedBox(height: 8),
            Text(
              'Supported formats: PDF, JPG, PNG (max 10MB each)',
              style: AppTextStyles.caption.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Future<void> _pickDocuments() async {
    // Show options: camera or gallery
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Select Document Source', style: AppTextStyles.h4),
            const SizedBox(height: 16),
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
          ],
        ),
      ),
    );

    if (source == null) return;

    try {
      final XFile? file = await _imagePicker.pickImage(
        source: source,
        maxWidth: 2000,
        maxHeight: 2000,
        imageQuality: 85,
      );

      if (file != null) {
        // Check file size (10MB limit)
        final bytes = await file.length();
        if (bytes > 10 * 1024 * 1024) {
          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('File too large. Maximum size is 10MB.'),
              backgroundColor: AppColors.warning,
            ),
          );
          return;
        }

        setState(() => _selectedFiles.add(file));
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to pick file: $e'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  /// Upload files to Supabase storage and return URLs
  Future<List<String>> _uploadAttachments(String appealId) async {
    final urls = <String>[];
    final client = SupabaseService.instance.client;
    if (client == null) return urls;

    final userId = SupabaseService.instance.currentUser?.id;
    if (userId == null) return urls;

    for (final file in _selectedFiles) {
      try {
        final bytes = await file.readAsBytes();
        final extension = file.name.split('.').last.toLowerCase();
        final fileName = '${DateTime.now().millisecondsSinceEpoch}_${file.name}';
        final path = '$userId/$appealId/$fileName';

        await client.storage
            .from('appeal-attachments')
            .uploadBinary(path, bytes, fileOptions: FileOptions(
              contentType: _getMimeType(extension),
            ));

        // Get signed URL (valid for 1 year)
        final signedUrl = await client.storage
            .from('appeal-attachments')
            .createSignedUrl(path, 365 * 24 * 60 * 60);

        urls.add(signedUrl);
      } catch (e) {
        debugPrint('Failed to upload ${file.name}: $e');
      }
    }

    return urls;
  }

  String _getMimeType(String extension) {
    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      default:
        return 'application/octet-stream';
    }
  }

  /// Map appeal type to message_type for database
  String _getMessageType(AppealType type) {
    switch (type) {
      case AppealType.verificationRejected:
        return 'verification_appeal';
      case AppealType.documentIssue:
        return 'document_issue';
      case AppealType.accountAccess:
        return 'account_access';
      case AppealType.other:
        return 'other';
    }
  }

  Future<void> _submitAppeal() async {
    if (!_formKey.currentState!.validate()) return;

    if (_selectedType == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select an issue type'),
          backgroundColor: AppColors.warning,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final client = SupabaseService.instance.client;
      if (client == null) {
        throw Exception('Not connected to server');
      }

      final user = SupabaseService.instance.currentUser;
      final appealId = DateTime.now().millisecondsSinceEpoch.toString();

      // Upload attachments first if any
      List<String> attachmentUrls = [];
      if (_selectedFiles.isNotEmpty) {
        attachmentUrls = await _uploadAttachments(appealId);
      }

      // Submit to support_messages table (shared with website)
      final appeal = {
        'message_type': _getMessageType(_selectedType!),
        'user_id': user?.id,
        'sender_name': user?.userMetadata?['full_name'] ?? 'Unknown',
        'sender_email': user?.email ?? '',
        'subject': _subjectController.text.trim(),
        'message': _descriptionController.text.trim(),
        'user_role': widget.userRole,
        'appeal_type': _selectedType!.name,
        'additional_info': _additionalInfoController.text.trim().isEmpty
            ? null
            : _additionalInfoController.text.trim(),
        'has_attachments': attachmentUrls.isNotEmpty,
        'attachment_urls': attachmentUrls.isEmpty ? null : attachmentUrls,
        'source': 'mobile',
        'status': 'new',
      };

      await client.from('support_messages').insert(appeal);

      if (!mounted) return;

      // Show success
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          icon: const Icon(Icons.check_circle, color: AppColors.success, size: 48),
          title: const Text('Appeal Submitted'),
          content: const Text(
            'Your appeal has been submitted successfully. Our team will review it and respond within 1-2 business days.',
          ),
          actions: [
            FilledButton(
              onPressed: () {
                Navigator.of(context).pop(); // Close dialog
                Navigator.of(context).pop(); // Go back
              },
              child: const Text('Done'),
            ),
          ],
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to submit appeal: $e'),
          backgroundColor: AppColors.error,
        ),
      );
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  void _showDirectContactOptions() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(24),
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
            const SizedBox(height: 24),
            Text('Contact Support', style: AppTextStyles.h3),
            const SizedBox(height: 8),
            Text(
              'Choose how you would like to reach us',
              style: AppTextStyles.bodySmall.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 24),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.teal.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.email, color: AppColors.teal),
              ),
              title: const Text('Email Support'),
              subtitle: const Text('support@coastalhavenpartners.com'),
              onTap: () {
                Navigator.pop(context);
                // Would use url_launcher
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Opening email client...')),
                );
              },
            ),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.info.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.chat, color: AppColors.info),
              ),
              title: const Text('Live Chat'),
              subtitle: const Text('Available Mon-Fri, 9AM-6PM EST'),
              onTap: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Live chat coming soon!')),
                );
              },
            ),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.warning.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.discord, color: AppColors.warning),
              ),
              title: const Text('Discord Community'),
              subtitle: const Text('Join our community for peer support'),
              onTap: () {
                Navigator.pop(context);
                // Would use url_launcher to open Discord
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Opening Discord...')),
                );
              },
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}
