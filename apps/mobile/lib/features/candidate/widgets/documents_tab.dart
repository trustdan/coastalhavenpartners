import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/providers/providers.dart';
import '../../../data/models/models.dart';
import '../../../data/repositories/repositories.dart';
import '../../../widgets/magic_ui/magic_ui.dart';

/// Documents Tab - Multiple resumes with labels and transcripts by education level
class DocumentsTab extends ConsumerStatefulWidget {
  final VoidCallback onChanged;

  const DocumentsTab({super.key, required this.onChanged});

  @override
  ConsumerState<DocumentsTab> createState() => _DocumentsTabState();
}

class _DocumentsTabState extends ConsumerState<DocumentsTab> {
  bool _isUploading = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final resumesAsync = ref.watch(resumesProvider);
    final transcriptsAsync = ref.watch(transcriptsProvider);

    return SingleChildScrollView(
      padding: AppSpacing.screenPadding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Resumes Section
          _buildResumesSection(context, isDark, resumesAsync),
          AppSpacing.sectionGap,

          // Transcripts Section
          _buildTranscriptsSection(context, isDark, transcriptsAsync),
          AppSpacing.sectionGap,

          // Guidelines
          _buildGuidelines(context, isDark),
          AppSpacing.sectionGap,
        ],
      ),
    );
  }

  Widget _buildResumesSection(
    BuildContext context,
    bool isDark,
    AsyncValue<List<CandidateResume>> resumesAsync,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Resumes', style: AppTextStyles.h4),
            TextButton.icon(
              onPressed: _isUploading ? null : () => _showUploadResumeDialog(context),
              icon: const Icon(Icons.add, size: 18),
              label: const Text('Add Resume'),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          'Upload multiple resumes for different roles',
          style: AppTextStyles.caption.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
        AppSpacing.itemGap,
        resumesAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => _buildErrorState(context, isDark, 'Error loading resumes'),
          data: (resumes) {
            if (resumes.isEmpty) {
              return _buildEmptyResumeState(context, isDark);
            }
            return Column(
              children: resumes.map((resume) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _buildResumeCard(context, isDark, resume),
                );
              }).toList(),
            );
          },
        ),
      ],
    );
  }

  Widget _buildEmptyResumeState(BuildContext context, bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 32),
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: AppRadius.card,
        border: Border.all(
          color: isDark ? AppColors.borderDark : AppColors.borderLight,
        ),
      ),
      child: Column(
        children: [
          Icon(
            Icons.description_outlined,
            size: 48,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
          const SizedBox(height: 12),
          Text('No resumes uploaded', style: AppTextStyles.labelMedium),
          const SizedBox(height: 4),
          Text(
            'Upload different resumes for each role type',
            style: AppTextStyles.caption.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 16),
          ShimmerButton(
            text: _isUploading ? 'Uploading...' : 'Upload Resume',
            onPressed: _isUploading ? null : () => _showUploadResumeDialog(context),
          ),
        ],
      ),
    );
  }

  Widget _buildResumeCard(BuildContext context, bool isDark, CandidateResume resume) {
    final fileName = _extractFileName(resume.resumeUrl);

    return Container(
      padding: AppSpacing.cardPadding,
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: AppRadius.card,
        border: Border.all(
          color: resume.isDefault
              ? AppColors.teal
              : (isDark ? AppColors.borderDark : AppColors.borderLight),
          width: resume.isDefault ? 2 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.error.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.picture_as_pdf,
                  color: AppColors.error,
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            resume.label,
                            style: AppTextStyles.labelMedium,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (resume.isDefault)
                          Container(
                            margin: const EdgeInsets.only(left: 8),
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.teal.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              'Default',
                              style: AppTextStyles.caption.copyWith(
                                color: AppColors.teal,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        const SizedBox(width: 8),
                        _buildVerificationBadge(resume.isVerified),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      fileName,
                      style: AppTextStyles.caption.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (resume.description != null && resume.description!.isNotEmpty) ...[
                      const SizedBox(height: 2),
                      Text(
                        resume.description!,
                        style: AppTextStyles.caption.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                          fontStyle: FontStyle.italic,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          AppSpacing.subsectionGap,
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _viewDocument(resume.resumeUrl),
                  icon: const Icon(Icons.visibility_outlined, size: 18),
                  label: const Text('View'),
                ),
              ),
              AppSpacing.hGapSm,
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _isUploading
                      ? null
                      : () => _replaceResume(context, resume),
                  icon: const Icon(Icons.swap_horiz, size: 18),
                  label: const Text('Replace'),
                ),
              ),
              PopupMenuButton<String>(
                icon: const Icon(Icons.more_vert),
                onSelected: (value) async {
                  switch (value) {
                    case 'default':
                      await _setDefaultResume(resume.id);
                      break;
                    case 'edit':
                      _showEditResumeDialog(context, resume);
                      break;
                    case 'verify':
                      await _retryVerification(resume.id, 'resume');
                      break;
                    case 'delete':
                      await _confirmDeleteResume(context, resume);
                      break;
                  }
                },
                itemBuilder: (context) => [
                  if (!resume.isDefault)
                    const PopupMenuItem(
                      value: 'default',
                      child: Row(
                        children: [
                          Icon(Icons.star_outline, size: 20),
                          SizedBox(width: 8),
                          Text('Set as Default'),
                        ],
                      ),
                    ),
                  const PopupMenuItem(
                    value: 'edit',
                    child: Row(
                      children: [
                        Icon(Icons.edit_outlined, size: 20),
                        SizedBox(width: 8),
                        Text('Edit Label'),
                      ],
                    ),
                  ),
                  if (resume.isVerified != true)
                    const PopupMenuItem(
                      value: 'verify',
                      child: Row(
                        children: [
                          Icon(Icons.refresh, size: 20),
                          SizedBox(width: 8),
                          Text('Retry Verification'),
                        ],
                      ),
                    ),
                  const PopupMenuItem(
                    value: 'delete',
                    child: Row(
                      children: [
                        Icon(Icons.delete_outline, size: 20, color: AppColors.error),
                        SizedBox(width: 8),
                        Text('Delete', style: TextStyle(color: AppColors.error)),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTranscriptsSection(
    BuildContext context,
    bool isDark,
    AsyncValue<List<CandidateTranscript>> transcriptsAsync,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Transcripts', style: AppTextStyles.h4),
            TextButton.icon(
              onPressed: _isUploading ? null : () => _showUploadTranscriptDialog(context),
              icon: const Icon(Icons.add, size: 18),
              label: const Text('Add Transcript'),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          'Upload transcripts for each education level',
          style: AppTextStyles.caption.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
        AppSpacing.itemGap,
        transcriptsAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => _buildErrorState(context, isDark, 'Error loading transcripts'),
          data: (transcripts) {
            if (transcripts.isEmpty) {
              return _buildEmptyTranscriptState(context, isDark);
            }
            // Group by education level
            final grouped = <EducationLevel, List<CandidateTranscript>>{};
            for (final transcript in transcripts) {
              grouped.putIfAbsent(transcript.educationLevel, () => []).add(transcript);
            }

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: grouped.entries.map((entry) {
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(bottom: 8, top: 8),
                      child: Text(
                        educationLevelLabels[entry.key] ?? entry.key.value,
                        style: AppTextStyles.labelMedium.copyWith(
                          color: AppColors.teal,
                        ),
                      ),
                    ),
                    ...entry.value.map((transcript) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _buildTranscriptCard(context, isDark, transcript),
                      );
                    }),
                  ],
                );
              }).toList(),
            );
          },
        ),
      ],
    );
  }

  Widget _buildEmptyTranscriptState(BuildContext context, bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 32),
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: AppRadius.card,
        border: Border.all(
          color: isDark ? AppColors.borderDark : AppColors.borderLight,
        ),
      ),
      child: Column(
        children: [
          Icon(
            Icons.school_outlined,
            size: 48,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
          const SizedBox(height: 12),
          Text('No transcripts uploaded', style: AppTextStyles.labelMedium),
          const SizedBox(height: 4),
          Text(
            'Upload official or unofficial transcripts',
            style: AppTextStyles.caption.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 16),
          ShimmerButton(
            text: _isUploading ? 'Uploading...' : 'Upload Transcript',
            onPressed: _isUploading ? null : () => _showUploadTranscriptDialog(context),
          ),
        ],
      ),
    );
  }

  Widget _buildTranscriptCard(BuildContext context, bool isDark, CandidateTranscript transcript) {
    final fileName = _extractFileName(transcript.transcriptUrl);

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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.info.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.school,
                  color: AppColors.info,
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            transcript.schoolName ?? fileName,
                            style: AppTextStyles.labelMedium,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        _buildVerificationBadge(transcript.isVerified),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        if (transcript.degreeType != null) ...[
                          Text(
                            transcript.degreeType!,
                            style: AppTextStyles.caption.copyWith(
                              color: Theme.of(context).colorScheme.onSurfaceVariant,
                            ),
                          ),
                          const SizedBox(width: 8),
                        ],
                        if (transcript.gpa != null) ...[
                          Row(
                            children: [
                              Text(
                                'GPA: ${transcript.gpa!.toStringAsFixed(2)}',
                                style: AppTextStyles.caption.copyWith(
                                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                                ),
                              ),
                              const SizedBox(width: 4),
                              if (transcript.gpaVerified == true)
                                const Icon(Icons.verified, size: 14, color: AppColors.success)
                              else
                                const Icon(Icons.help_outline, size: 14, color: AppColors.warning),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          AppSpacing.subsectionGap,
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _viewDocument(transcript.transcriptUrl),
                  icon: const Icon(Icons.visibility_outlined, size: 18),
                  label: const Text('View'),
                ),
              ),
              AppSpacing.hGapSm,
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _isUploading
                      ? null
                      : () => _replaceTranscript(context, transcript),
                  icon: const Icon(Icons.swap_horiz, size: 18),
                  label: const Text('Replace'),
                ),
              ),
              PopupMenuButton<String>(
                icon: const Icon(Icons.more_vert),
                onSelected: (value) async {
                  switch (value) {
                    case 'edit':
                      _showEditTranscriptDialog(context, transcript);
                      break;
                    case 'verify':
                      await _retryVerification(transcript.id, 'transcript');
                      break;
                    case 'delete':
                      await _confirmDeleteTranscript(context, transcript);
                      break;
                  }
                },
                itemBuilder: (context) => [
                  const PopupMenuItem(
                    value: 'edit',
                    child: Row(
                      children: [
                        Icon(Icons.edit_outlined, size: 20),
                        SizedBox(width: 8),
                        Text('Edit Details'),
                      ],
                    ),
                  ),
                  if (transcript.isVerified != true && transcript.gpa != null)
                    const PopupMenuItem(
                      value: 'verify',
                      child: Row(
                        children: [
                          Icon(Icons.refresh, size: 20),
                          SizedBox(width: 8),
                          Text('Retry Verification'),
                        ],
                      ),
                    ),
                  const PopupMenuItem(
                    value: 'delete',
                    child: Row(
                      children: [
                        Icon(Icons.delete_outline, size: 20, color: AppColors.error),
                        SizedBox(width: 8),
                        Text('Delete', style: TextStyle(color: AppColors.error)),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildVerificationBadge(bool? isVerified) {
    if (isVerified == null) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(
          color: AppColors.warning.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.hourglass_empty, size: 12, color: AppColors.warning),
            const SizedBox(width: 4),
            Text(
              'Pending',
              style: AppTextStyles.caption.copyWith(
                color: AppColors.warning,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      );
    } else if (isVerified) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(
          color: AppColors.success.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.verified, size: 12, color: AppColors.success),
            const SizedBox(width: 4),
            Text(
              'Verified',
              style: AppTextStyles.caption.copyWith(
                color: AppColors.success,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      );
    } else {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(
          color: AppColors.error.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 12, color: AppColors.error),
            const SizedBox(width: 4),
            Text(
              'Review',
              style: AppTextStyles.caption.copyWith(
                color: AppColors.error,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      );
    }
  }

  Widget _buildErrorState(BuildContext context, bool isDark, String message) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 24),
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: AppRadius.card,
        border: Border.all(color: AppColors.error.withValues(alpha: 0.3)),
      ),
      child: Column(
        children: [
          const Icon(Icons.error_outline, size: 40, color: AppColors.error),
          const SizedBox(height: 8),
          Text(message, style: AppTextStyles.labelMedium),
          const SizedBox(height: 8),
          TextButton(
            onPressed: () {
              ref.invalidate(resumesProvider);
              ref.invalidate(transcriptsProvider);
            },
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildGuidelines(BuildContext context, bool isDark) {
    return Container(
      padding: AppSpacing.cardPadding,
      decoration: BoxDecoration(
        color: AppColors.info.withValues(alpha: 0.1),
        borderRadius: AppRadius.card,
        border: Border.all(color: AppColors.info.withValues(alpha: 0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.info_outline, size: 20, color: AppColors.info),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Document Guidelines',
                  style: AppTextStyles.labelMedium.copyWith(color: AppColors.info),
                ),
                const SizedBox(height: 4),
                Text(
                  '• PDF format only\n• Maximum file size: 5MB\n• Documents are automatically verified by AI\n• Verification typically takes 1-2 minutes',
                  style: AppTextStyles.bodySmall.copyWith(color: AppColors.info),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ========================
  // Resume Actions
  // ========================

  Future<void> _showUploadResumeDialog(BuildContext context) async {
    String selectedLabel = suggestedResumeLabels.first;
    String? description;
    bool isDefault = false;

    final result = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Upload Resume'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Select a label for this resume:'),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: selectedLabel,
                decoration: const InputDecoration(
                  labelText: 'Resume Label',
                  border: OutlineInputBorder(),
                ),
                items: suggestedResumeLabels.map((label) {
                  return DropdownMenuItem(value: label, child: Text(label));
                }).toList(),
                onChanged: (value) {
                  setDialogState(() => selectedLabel = value!);
                },
              ),
              const SizedBox(height: 12),
              TextField(
                decoration: const InputDecoration(
                  labelText: 'Description (optional)',
                  hintText: 'e.g., Tailored for PE roles',
                  border: OutlineInputBorder(),
                ),
                maxLength: 100,
                onChanged: (value) => description = value.isEmpty ? null : value,
              ),
              const SizedBox(height: 8),
              CheckboxListTile(
                title: const Text('Set as default resume'),
                value: isDefault,
                onChanged: (value) {
                  setDialogState(() => isDefault = value ?? false);
                },
                contentPadding: EdgeInsets.zero,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () => Navigator.pop(context, {
                'label': selectedLabel,
                'description': description,
                'isDefault': isDefault,
              }),
              child: const Text('Choose File'),
            ),
          ],
        ),
      ),
    );

    if (result == null || !mounted) return;

    await _pickAndUploadResume(
      label: result['label'] as String,
      description: result['description'] as String?,
      isDefault: result['isDefault'] as bool,
    );
  }

  Future<void> _pickAndUploadResume({
    required String label,
    String? description,
    bool isDefault = false,
  }) async {
    try {
      final fileResult = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf'],
        withData: true,
      );

      if (fileResult == null || fileResult.files.isEmpty) return;

      final file = fileResult.files.first;

      if (file.size > 5 * 1024 * 1024) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('File size exceeds 5MB limit'),
              backgroundColor: AppColors.error,
            ),
          );
        }
        return;
      }

      if (file.bytes == null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Failed to read file'),
              backgroundColor: AppColors.error,
            ),
          );
        }
        return;
      }

      setState(() => _isUploading = true);

      _showUploadingSnackBar('Uploading ${file.name}...');

      final resume = await DocumentsRepository.instance.uploadResume(
        fileBytes: file.bytes!,
        fileName: file.name,
        label: label,
        description: description,
        isDefault: isDefault,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).hideCurrentSnackBar();
      }

      if (resume != null) {
        ref.invalidate(resumesProvider);
        widget.onChanged();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Resume uploaded - verification in progress'),
              backgroundColor: AppColors.success,
            ),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Failed to upload resume'),
              backgroundColor: AppColors.error,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).hideCurrentSnackBar();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isUploading = false);
      }
    }
  }

  Future<void> _replaceResume(BuildContext context, CandidateResume resume) async {
    try {
      final fileResult = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf'],
        withData: true,
      );

      if (fileResult == null || fileResult.files.isEmpty) return;

      final file = fileResult.files.first;

      if (file.size > 5 * 1024 * 1024 || file.bytes == null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Invalid file'),
              backgroundColor: AppColors.error,
            ),
          );
        }
        return;
      }

      setState(() => _isUploading = true);
      _showUploadingSnackBar('Replacing resume...');

      final updated = await DocumentsRepository.instance.replaceResumeFile(
        resumeId: resume.id,
        fileBytes: file.bytes!,
        fileName: file.name,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).hideCurrentSnackBar();
      }

      if (updated != null) {
        ref.invalidate(resumesProvider);
        widget.onChanged();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Resume replaced - re-verifying'),
              backgroundColor: AppColors.success,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).hideCurrentSnackBar();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isUploading = false);
      }
    }
  }

  Future<void> _setDefaultResume(String resumeId) async {
    final success = await DocumentsRepository.instance.setDefaultResume(resumeId);
    if (success) {
      ref.invalidate(resumesProvider);
      widget.onChanged();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Default resume updated'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    }
  }

  void _showEditResumeDialog(BuildContext context, CandidateResume resume) {
    String selectedLabel = resume.label;
    String? description = resume.description;
    bool isDefault = resume.isDefault;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Edit Resume'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<String>(
                value: suggestedResumeLabels.contains(selectedLabel)
                    ? selectedLabel
                    : suggestedResumeLabels.first,
                decoration: const InputDecoration(
                  labelText: 'Resume Label',
                  border: OutlineInputBorder(),
                ),
                items: suggestedResumeLabels.map((label) {
                  return DropdownMenuItem(value: label, child: Text(label));
                }).toList(),
                onChanged: (value) {
                  setDialogState(() => selectedLabel = value!);
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                initialValue: description,
                decoration: const InputDecoration(
                  labelText: 'Description (optional)',
                  border: OutlineInputBorder(),
                ),
                maxLength: 100,
                onChanged: (value) => description = value.isEmpty ? null : value,
              ),
              const SizedBox(height: 8),
              CheckboxListTile(
                title: const Text('Set as default resume'),
                value: isDefault,
                onChanged: (value) {
                  setDialogState(() => isDefault = value ?? false);
                },
                contentPadding: EdgeInsets.zero,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () async {
                Navigator.pop(context);
                await DocumentsRepository.instance.updateResume(
                  resumeId: resume.id,
                  label: selectedLabel,
                  description: description,
                  isDefault: isDefault,
                );
                ref.invalidate(resumesProvider);
                widget.onChanged();
              },
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _confirmDeleteResume(BuildContext context, CandidateResume resume) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Resume'),
        content: Text('Are you sure you want to delete "${resume.label}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.error),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final success = await DocumentsRepository.instance.deleteResume(resume.id);
      if (success) {
        ref.invalidate(resumesProvider);
        widget.onChanged();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Resume deleted'),
              backgroundColor: AppColors.success,
            ),
          );
        }
      }
    }
  }

  // ========================
  // Transcript Actions
  // ========================

  Future<void> _showUploadTranscriptDialog(BuildContext context) async {
    EducationLevel selectedLevel = EducationLevel.bachelors;
    String? schoolName;
    String? degreeType;
    double? gpa;

    final result = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Upload Transcript'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                DropdownButtonFormField<EducationLevel>(
                  value: selectedLevel,
                  decoration: const InputDecoration(
                    labelText: 'Education Level',
                    border: OutlineInputBorder(),
                  ),
                  items: EducationLevel.values.map((level) {
                    return DropdownMenuItem(
                      value: level,
                      child: Text(educationLevelLabels[level] ?? level.value),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setDialogState(() => selectedLevel = value!);
                  },
                ),
                const SizedBox(height: 12),
                TextField(
                  decoration: const InputDecoration(
                    labelText: 'School Name (optional)',
                    border: OutlineInputBorder(),
                  ),
                  onChanged: (value) => schoolName = value.isEmpty ? null : value,
                ),
                const SizedBox(height: 12),
                TextField(
                  decoration: const InputDecoration(
                    labelText: 'Degree Type (optional)',
                    hintText: 'e.g., B.S., MBA',
                    border: OutlineInputBorder(),
                  ),
                  onChanged: (value) => degreeType = value.isEmpty ? null : value,
                ),
                const SizedBox(height: 12),
                TextField(
                  decoration: const InputDecoration(
                    labelText: 'GPA (optional)',
                    hintText: 'e.g., 3.85',
                    border: OutlineInputBorder(),
                  ),
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  onChanged: (value) {
                    gpa = double.tryParse(value);
                  },
                ),
                const SizedBox(height: 8),
                Text(
                  'If you enter a GPA, we will verify it against your transcript.',
                  style: AppTextStyles.caption.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () => Navigator.pop(context, {
                'educationLevel': selectedLevel,
                'schoolName': schoolName,
                'degreeType': degreeType,
                'gpa': gpa,
              }),
              child: const Text('Choose File'),
            ),
          ],
        ),
      ),
    );

    if (result == null || !mounted) return;

    await _pickAndUploadTranscript(
      educationLevel: result['educationLevel'] as EducationLevel,
      schoolName: result['schoolName'] as String?,
      degreeType: result['degreeType'] as String?,
      gpa: result['gpa'] as double?,
    );
  }

  Future<void> _pickAndUploadTranscript({
    required EducationLevel educationLevel,
    String? schoolName,
    String? degreeType,
    double? gpa,
  }) async {
    try {
      final fileResult = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf'],
        withData: true,
      );

      if (fileResult == null || fileResult.files.isEmpty) return;

      final file = fileResult.files.first;

      if (file.size > 5 * 1024 * 1024 || file.bytes == null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Invalid file'),
              backgroundColor: AppColors.error,
            ),
          );
        }
        return;
      }

      setState(() => _isUploading = true);
      _showUploadingSnackBar('Uploading ${file.name}...');

      final transcript = await DocumentsRepository.instance.uploadTranscript(
        fileBytes: file.bytes!,
        fileName: file.name,
        educationLevel: educationLevel,
        schoolName: schoolName,
        degreeType: degreeType,
        gpa: gpa,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).hideCurrentSnackBar();
      }

      if (transcript != null) {
        ref.invalidate(transcriptsProvider);
        widget.onChanged();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                gpa != null
                    ? 'Transcript uploaded - GPA verification in progress'
                    : 'Transcript uploaded successfully',
              ),
              backgroundColor: AppColors.success,
            ),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Failed to upload transcript'),
              backgroundColor: AppColors.error,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).hideCurrentSnackBar();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isUploading = false);
      }
    }
  }

  Future<void> _replaceTranscript(BuildContext context, CandidateTranscript transcript) async {
    try {
      final fileResult = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf'],
        withData: true,
      );

      if (fileResult == null || fileResult.files.isEmpty) return;

      final file = fileResult.files.first;

      if (file.size > 5 * 1024 * 1024 || file.bytes == null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Invalid file'),
              backgroundColor: AppColors.error,
            ),
          );
        }
        return;
      }

      setState(() => _isUploading = true);
      _showUploadingSnackBar('Replacing transcript...');

      final updated = await DocumentsRepository.instance.replaceTranscriptFile(
        transcriptId: transcript.id,
        fileBytes: file.bytes!,
        fileName: file.name,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).hideCurrentSnackBar();
      }

      if (updated != null) {
        ref.invalidate(transcriptsProvider);
        widget.onChanged();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Transcript replaced - re-verifying'),
              backgroundColor: AppColors.success,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).hideCurrentSnackBar();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isUploading = false);
      }
    }
  }

  void _showEditTranscriptDialog(BuildContext context, CandidateTranscript transcript) {
    EducationLevel selectedLevel = transcript.educationLevel;
    String? schoolName = transcript.schoolName;
    String? degreeType = transcript.degreeType;
    double? gpa = transcript.gpa;

    final schoolController = TextEditingController(text: schoolName);
    final degreeController = TextEditingController(text: degreeType);
    final gpaController = TextEditingController(text: gpa?.toString() ?? '');

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Edit Transcript'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<EducationLevel>(
                  value: selectedLevel,
                  decoration: const InputDecoration(
                    labelText: 'Education Level',
                    border: OutlineInputBorder(),
                  ),
                  items: EducationLevel.values.map((level) {
                    return DropdownMenuItem(
                      value: level,
                      child: Text(educationLevelLabels[level] ?? level.value),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setDialogState(() => selectedLevel = value!);
                  },
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: schoolController,
                  decoration: const InputDecoration(
                    labelText: 'School Name',
                    border: OutlineInputBorder(),
                  ),
                  onChanged: (value) => schoolName = value.isEmpty ? null : value,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: degreeController,
                  decoration: const InputDecoration(
                    labelText: 'Degree Type',
                    border: OutlineInputBorder(),
                  ),
                  onChanged: (value) => degreeType = value.isEmpty ? null : value,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: gpaController,
                  decoration: const InputDecoration(
                    labelText: 'GPA',
                    border: OutlineInputBorder(),
                  ),
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  onChanged: (value) => gpa = double.tryParse(value),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                schoolController.dispose();
                degreeController.dispose();
                gpaController.dispose();
                Navigator.pop(context);
              },
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () async {
                Navigator.pop(context);
                schoolController.dispose();
                degreeController.dispose();
                gpaController.dispose();
                await DocumentsRepository.instance.updateTranscript(
                  transcriptId: transcript.id,
                  educationLevel: selectedLevel,
                  schoolName: schoolName,
                  degreeType: degreeType,
                  gpa: gpa,
                );
                ref.invalidate(transcriptsProvider);
                widget.onChanged();
              },
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _confirmDeleteTranscript(BuildContext context, CandidateTranscript transcript) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Transcript'),
        content: Text(
          'Are you sure you want to delete this ${educationLevelLabels[transcript.educationLevel]} transcript?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.error),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final success = await DocumentsRepository.instance.deleteTranscript(transcript.id);
      if (success) {
        ref.invalidate(transcriptsProvider);
        widget.onChanged();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Transcript deleted'),
              backgroundColor: AppColors.success,
            ),
          );
        }
      }
    }
  }

  // ========================
  // Utility Methods
  // ========================

  Future<void> _viewDocument(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not open document'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _retryVerification(String id, String type) async {
    bool success;
    if (type == 'resume') {
      success = await DocumentsRepository.instance.verifyResume(id);
      ref.invalidate(resumesProvider);
    } else {
      success = await DocumentsRepository.instance.verifyTranscript(id);
      ref.invalidate(transcriptsProvider);
    }

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            success
                ? 'Verification requested - check back in a few minutes'
                : 'Failed to request verification',
          ),
          backgroundColor: success ? AppColors.success : AppColors.error,
        ),
      );
    }
  }

  void _showUploadingSnackBar(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
              const SizedBox(width: 16),
              Text(message),
            ],
          ),
          duration: const Duration(seconds: 30),
        ),
      );
    }
  }

  String _extractFileName(String url) {
    final uri = Uri.parse(url);
    final path = uri.pathSegments.last;
    // Remove timestamp prefix if present (format: timestamp_filename.pdf)
    final parts = path.split('_');
    if (parts.length > 1 && int.tryParse(parts.first) != null) {
      return parts.skip(1).join('_');
    }
    return path;
  }
}
