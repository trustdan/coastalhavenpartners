import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/providers/admin_provider.dart';
import '../../../data/models/enums.dart';
import '../../../data/models/profile.dart';

/// Admin candidates management screen
/// Shows all candidates with search and filter capabilities
class AdminCandidatesScreen extends ConsumerStatefulWidget {
  const AdminCandidatesScreen({super.key});

  @override
  ConsumerState<AdminCandidatesScreen> createState() =>
      _AdminCandidatesScreenState();
}

class _AdminCandidatesScreenState extends ConsumerState<AdminCandidatesScreen> {
  final _searchController = TextEditingController();
  CandidateStatus? _statusFilter;
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  CandidateSearchParams get _searchParams => CandidateSearchParams(
        query: _searchQuery,
        statusFilter: _statusFilter,
      );

  @override
  Widget build(BuildContext context) {
    final candidatesAsync = ref.watch(searchCandidatesProvider(_searchParams));

    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'Candidates',
          style: AppTextStyles.h3.copyWith(color: AppColors.textPrimaryDark),
        ),
        actions: [
          IconButton(
            icon: Badge(
              isLabelVisible: _statusFilter != null,
              backgroundColor: AppColors.teal,
              child: const Icon(Icons.filter_list, color: AppColors.textPrimaryDark),
            ),
            onPressed: _showFilterSheet,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(searchCandidatesProvider(_searchParams));
        },
        child: Column(
          children: [
            // Search bar
            Padding(
              padding: const EdgeInsets.all(16),
              child: TextField(
                controller: _searchController,
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.textPrimaryDark,
                ),
                decoration: InputDecoration(
                  hintText: 'Search by name, school, or major...',
                  hintStyle: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.textMutedDark,
                  ),
                  prefixIcon:
                      const Icon(Icons.search, color: AppColors.textMutedDark),
                  suffixIcon: _searchQuery.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear,
                              color: AppColors.textMutedDark),
                          onPressed: () {
                            _searchController.clear();
                            setState(() => _searchQuery = '');
                          },
                        )
                      : null,
                  filled: true,
                  fillColor: AppColors.cardDark,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                ),
                onChanged: (value) {
                  setState(() => _searchQuery = value);
                },
              ),
            ),

            // Active filter chip
            if (_statusFilter != null)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    Chip(
                      label: Text(
                        'Status: ${_statusFilter!.value.replaceAll('_', ' ')}',
                        style: AppTextStyles.caption.copyWith(
                          color: AppColors.textPrimaryDark,
                        ),
                      ),
                      deleteIcon: const Icon(Icons.close, size: 16),
                      deleteIconColor: AppColors.textMutedDark,
                      onDeleted: () {
                        setState(() => _statusFilter = null);
                      },
                      backgroundColor: AppColors.cardDark,
                      side: BorderSide(
                        color: AppColors.teal.withValues(alpha: 0.5),
                      ),
                    ),
                  ],
                ),
              ),

            // Candidates list
            Expanded(
              child: candidatesAsync.when(
                data: (candidates) => candidates.isEmpty
                    ? _buildEmptyState()
                    : ListView.builder(
                        padding: const EdgeInsets.only(bottom: 16),
                        itemCount: candidates.length,
                        itemBuilder: (context, index) {
                          final candidate = candidates[index];
                          return _CandidateCard(
                            candidate: candidate,
                            onTap: () => _showCandidateDetails(candidate),
                          );
                        },
                      ),
                loading: () => const Center(
                  child: CircularProgressIndicator(color: AppColors.teal),
                ),
                error: (error, _) => Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.error_outline,
                        color: AppColors.error,
                        size: 48,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Failed to load candidates',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.textSecondaryDark,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextButton(
                        onPressed: () {
                          ref.invalidate(searchCandidatesProvider(_searchParams));
                        },
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: AppSpacing.screenPadding,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.emerald.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Icon(
                Icons.people_outline,
                color: AppColors.emerald,
                size: 40,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              _searchQuery.isNotEmpty || _statusFilter != null
                  ? 'No Matching Candidates'
                  : 'No Candidates Found',
              style: AppTextStyles.h4.copyWith(
                color: AppColors.textPrimaryDark,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              _searchQuery.isNotEmpty || _statusFilter != null
                  ? 'Try adjusting your search or filters'
                  : 'Candidates will appear here once they register',
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textSecondaryDark,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.cardDark,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => StatefulBuilder(
        builder: (context, setSheetState) => Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Filter Candidates',
                    style: AppTextStyles.h4.copyWith(
                      color: AppColors.textPrimaryDark,
                    ),
                  ),
                  if (_statusFilter != null)
                    TextButton(
                      onPressed: () {
                        setSheetState(() {});
                        setState(() => _statusFilter = null);
                      },
                      child: Text(
                        'Clear',
                        style: TextStyle(color: AppColors.teal),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                'Status',
                style: AppTextStyles.labelMedium.copyWith(
                  color: AppColors.textSecondaryDark,
                ),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: CandidateStatus.values.map((status) {
                  final isSelected = _statusFilter == status;
                  return FilterChip(
                    label: Text(
                      status.value.replaceAll('_', ' '),
                      style: TextStyle(
                        color: isSelected
                            ? Colors.white
                            : AppColors.textPrimaryDark,
                      ),
                    ),
                    selected: isSelected,
                    onSelected: (selected) {
                      setSheetState(() {});
                      setState(() {
                        _statusFilter = selected ? status : null;
                      });
                    },
                    selectedColor: AppColors.teal,
                    backgroundColor: AppColors.backgroundDark,
                    checkmarkColor: Colors.white,
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () => Navigator.pop(context),
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.teal,
                  ),
                  child: const Text('Apply'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showCandidateDetails(CandidateProfile candidate) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.cardDark,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) => SingleChildScrollView(
          controller: scrollController,
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Handle bar
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.textMutedDark,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Header
              Row(
                children: [
                  CircleAvatar(
                    radius: 32,
                    backgroundColor: AppColors.emerald.withValues(alpha: 0.2),
                    child: Text(
                      candidate.displayName.isNotEmpty
                          ? candidate.displayName[0].toUpperCase()
                          : '?',
                      style: AppTextStyles.h3.copyWith(
                        color: AppColors.emerald,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          candidate.displayName,
                          style: AppTextStyles.h4.copyWith(
                            color: AppColors.textPrimaryDark,
                          ),
                        ),
                        Text(
                          candidate.email ?? 'No email',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.textSecondaryDark,
                          ),
                        ),
                      ],
                    ),
                  ),
                  _buildStatusBadge(candidate.status),
                ],
              ),

              const SizedBox(height: 24),

              // Education info
              _DetailSection(
                title: 'Education',
                children: [
                  _DetailRow(
                      icon: Icons.school, label: 'School', value: candidate.schoolName),
                  _DetailRow(
                      icon: Icons.book, label: 'Major', value: candidate.major),
                  _DetailRow(
                      icon: Icons.grade,
                      label: 'GPA',
                      value: candidate.gpa.toStringAsFixed(2)),
                  _DetailRow(
                      icon: Icons.calendar_today,
                      label: 'Graduation',
                      value: candidate.graduationYear.toString()),
                  if (candidate.educationLevel != null)
                    _DetailRow(
                        icon: Icons.workspace_premium,
                        label: 'Level',
                        value: candidate.educationLevel!.displayName),
                ],
              ),

              if (candidate.gradSchool != null) ...[
                const SizedBox(height: 16),
                _DetailSection(
                  title: 'Graduate Education',
                  children: [
                    _DetailRow(
                        icon: Icons.school,
                        label: 'School',
                        value: candidate.gradSchool!),
                    if (candidate.gradMajor != null)
                      _DetailRow(
                          icon: Icons.book,
                          label: 'Major',
                          value: candidate.gradMajor!),
                    if (candidate.gradGpa != null)
                      _DetailRow(
                          icon: Icons.grade,
                          label: 'GPA',
                          value: candidate.gradGpa!.toStringAsFixed(2)),
                  ],
                ),
              ],

              const SizedBox(height: 16),

              // Verification status
              _DetailSection(
                title: 'Verification',
                children: [
                  _VerificationRow(
                      label: 'Email', verified: candidate.emailVerified),
                  _VerificationRow(
                      label: 'School', verified: candidate.schoolVerified),
                  _VerificationRow(label: 'GPA', verified: candidate.gpaVerified),
                  _VerificationRow(
                      label: 'Resume', verified: candidate.resumeVerified),
                  _VerificationRow(
                      label: 'Transcript', verified: candidate.transcriptVerified),
                ],
              ),

              if (candidate.targetRoles != null &&
                  candidate.targetRoles!.isNotEmpty) ...[
                const SizedBox(height: 16),
                _DetailSection(
                  title: 'Target Roles',
                  children: [
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: candidate.targetRoles!
                          .map((role) => Chip(
                                label: Text(
                                  role,
                                  style: AppTextStyles.caption.copyWith(
                                    color: AppColors.textPrimaryDark,
                                  ),
                                ),
                                backgroundColor: AppColors.backgroundDark,
                              ))
                          .toList(),
                    ),
                  ],
                ),
              ],

              if (candidate.preferredLocations != null &&
                  candidate.preferredLocations!.isNotEmpty) ...[
                const SizedBox(height: 16),
                _DetailSection(
                  title: 'Preferred Locations',
                  children: [
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: candidate.preferredLocations!
                          .map((loc) => Chip(
                                label: Text(
                                  loc,
                                  style: AppTextStyles.caption.copyWith(
                                    color: AppColors.textPrimaryDark,
                                  ),
                                ),
                                backgroundColor: AppColors.backgroundDark,
                              ))
                          .toList(),
                    ),
                  ],
                ),
              ],

              if (candidate.bio != null && candidate.bio!.isNotEmpty) ...[
                const SizedBox(height: 16),
                _DetailSection(
                  title: 'Bio',
                  children: [
                    Text(
                      candidate.bio!,
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.textSecondaryDark,
                      ),
                    ),
                  ],
                ),
              ],

              const SizedBox(height: 24),

              // Profile completion
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.backgroundDark,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        SizedBox(
                          width: 48,
                          height: 48,
                          child: CircularProgressIndicator(
                            value: candidate.completionPercentage / 100,
                            backgroundColor: AppColors.textMutedDark.withValues(alpha: 0.2),
                            valueColor: AlwaysStoppedAnimation<Color>(
                              candidate.completionPercentage >= 80
                                  ? AppColors.teal
                                  : candidate.completionPercentage >= 50
                                      ? AppColors.warning
                                      : AppColors.error,
                            ),
                            strokeWidth: 4,
                          ),
                        ),
                        Text(
                          '${candidate.completionPercentage}%',
                          style: AppTextStyles.caption.copyWith(
                            color: AppColors.textPrimaryDark,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Profile Completion',
                            style: AppTextStyles.labelMedium.copyWith(
                              color: AppColors.textPrimaryDark,
                            ),
                          ),
                          Text(
                            candidate.completionPercentage >= 80
                                ? 'Well completed'
                                : candidate.completionPercentage >= 50
                                    ? 'Needs more details'
                                    : 'Incomplete profile',
                            style: AppTextStyles.caption.copyWith(
                              color: AppColors.textSecondaryDark,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(CandidateStatus? status) {
    final (color, label) = switch (status) {
      CandidateStatus.pendingVerification => (AppColors.warning, 'Pending'),
      CandidateStatus.verified => (AppColors.teal, 'Verified'),
      CandidateStatus.active => (AppColors.emerald, 'Active'),
      CandidateStatus.placed => (AppColors.info, 'Placed'),
      CandidateStatus.rejected => (AppColors.error, 'Rejected'),
      null => (AppColors.textMutedDark, 'Unknown'),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: AppTextStyles.caption.copyWith(
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _CandidateCard extends StatelessWidget {
  final CandidateProfile candidate;
  final VoidCallback onTap;

  const _CandidateCard({
    required this.candidate,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardDark,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: _getStatusColor().withValues(alpha: 0.3),
          ),
        ),
        child: Row(
          children: [
            CircleAvatar(
              radius: 24,
              backgroundColor: AppColors.emerald.withValues(alpha: 0.2),
              child: Text(
                candidate.displayName.isNotEmpty
                    ? candidate.displayName[0].toUpperCase()
                    : '?',
                style: AppTextStyles.labelLarge.copyWith(
                  color: AppColors.emerald,
                ),
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
                          candidate.displayName,
                          style: AppTextStyles.labelLarge.copyWith(
                            color: AppColors.textPrimaryDark,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      _buildStatusBadge(),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${candidate.schoolName} • ${candidate.major}',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.textSecondaryDark,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'GPA: ${candidate.gpa.toStringAsFixed(2)} • Class of ${candidate.graduationYear}',
                    style: AppTextStyles.caption.copyWith(
                      color: AppColors.textMutedDark,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Icon(
              Icons.arrow_forward_ios,
              size: 16,
              color: AppColors.textMutedDark,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge() {
    final (color, label) = switch (candidate.status) {
      CandidateStatus.pendingVerification => (AppColors.warning, 'Pending'),
      CandidateStatus.verified => (AppColors.teal, 'Verified'),
      CandidateStatus.active => (AppColors.emerald, 'Active'),
      CandidateStatus.placed => (AppColors.info, 'Placed'),
      CandidateStatus.rejected => (AppColors.error, 'Rejected'),
      null => (AppColors.textMutedDark, 'Unknown'),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: AppTextStyles.caption.copyWith(
          color: color,
          fontWeight: FontWeight.w600,
          fontSize: 10,
        ),
      ),
    );
  }

  Color _getStatusColor() {
    return switch (candidate.status) {
      CandidateStatus.pendingVerification => AppColors.warning,
      CandidateStatus.verified => AppColors.teal,
      CandidateStatus.active => AppColors.emerald,
      CandidateStatus.placed => AppColors.info,
      CandidateStatus.rejected => AppColors.error,
      null => AppColors.textMutedDark,
    };
  }
}

class _DetailSection extends StatelessWidget {
  final String title;
  final List<Widget> children;

  const _DetailSection({
    required this.title,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: AppTextStyles.labelMedium.copyWith(
            color: AppColors.teal,
          ),
        ),
        const SizedBox(height: 12),
        ...children,
      ],
    );
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.textMutedDark),
          const SizedBox(width: 8),
          Text(
            '$label:',
            style: AppTextStyles.bodySmall.copyWith(
              color: AppColors.textSecondaryDark,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              value,
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.textPrimaryDark,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}

class _VerificationRow extends StatelessWidget {
  final String label;
  final bool verified;

  const _VerificationRow({
    required this.label,
    required this.verified,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(
            verified ? Icons.check_circle : Icons.cancel,
            size: 18,
            color: verified ? AppColors.teal : AppColors.textMutedDark,
          ),
          const SizedBox(width: 8),
          Text(
            label,
            style: AppTextStyles.bodySmall.copyWith(
              color: verified
                  ? AppColors.textPrimaryDark
                  : AppColors.textSecondaryDark,
            ),
          ),
        ],
      ),
    );
  }
}
