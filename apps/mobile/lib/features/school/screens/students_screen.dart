import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';

/// Students Screen - List of students for school administrators
class StudentsScreen extends ConsumerStatefulWidget {
  const StudentsScreen({super.key});

  @override
  ConsumerState<StudentsScreen> createState() => _StudentsScreenState();
}

class _StudentsScreenState extends ConsumerState<StudentsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Students'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          tabs: const [
            Tab(text: 'All'),
            Tab(text: 'Verified'),
            Tab(text: 'Pending'),
            Tab(text: 'Placed'),
          ],
        ),
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: AppSpacing.screenPadding.copyWith(bottom: 0),
            child: TextField(
              controller: _searchController,
              onChanged: (value) => setState(() => _searchQuery = value),
              decoration: InputDecoration(
                hintText: 'Search students...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
                fillColor: isDark ? AppColors.cardDark : AppColors.cardLight,
              ),
            ),
          ),
          AppSpacing.itemGap,

          // Tab Views
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildStudentList(context, isDark, 'all'),
                _buildStudentList(context, isDark, 'verified'),
                _buildStudentList(context, isDark, 'pending'),
                _buildStudentList(context, isDark, 'placed'),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showInviteDialog(context),
        icon: const Icon(Icons.person_add),
        label: const Text('Invite'),
        backgroundColor: AppColors.teal,
        foregroundColor: Colors.white,
      ),
    );
  }

  Widget _buildStudentList(BuildContext context, bool isDark, String filter) {
    // Mock data - would come from provider
    final students = _getMockStudents(filter);

    if (students.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.people_outline,
              size: 64,
              color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.3),
            ),
            const SizedBox(height: 16),
            Text(
              'No students found',
              style: AppTextStyles.h4.copyWith(
                color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: AppSpacing.screenPadding,
      itemCount: students.length,
      itemBuilder: (context, index) {
        final student = students[index];
        return _StudentCard(
          student: student,
          isDark: isDark,
          onTap: () => _showStudentDetails(context, student),
        );
      },
    );
  }

  List<_MockStudent> _getMockStudents(String filter) {
    final allStudents = [
      _MockStudent(
        name: 'Sarah Johnson',
        email: 'sarah.johnson@university.edu',
        major: 'Finance',
        graduationYear: 2025,
        status: StudentStatus.verified,
        placementStatus: null,
      ),
      _MockStudent(
        name: 'Michael Chen',
        email: 'michael.chen@university.edu',
        major: 'Economics',
        graduationYear: 2024,
        status: StudentStatus.verified,
        placementStatus: 'Goldman Sachs',
      ),
      _MockStudent(
        name: 'Emily Davis',
        email: 'emily.davis@university.edu',
        major: 'Finance',
        graduationYear: 2025,
        status: StudentStatus.pending,
        placementStatus: null,
      ),
      _MockStudent(
        name: 'James Wilson',
        email: 'james.wilson@university.edu',
        major: 'Accounting',
        graduationYear: 2025,
        status: StudentStatus.verified,
        placementStatus: 'Blackstone',
      ),
      _MockStudent(
        name: 'Amanda Lee',
        email: 'amanda.lee@university.edu',
        major: 'Finance',
        graduationYear: 2026,
        status: StudentStatus.pending,
        placementStatus: null,
      ),
    ];

    // Filter by search query
    var filtered = allStudents.where((s) {
      if (_searchQuery.isEmpty) return true;
      return s.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          s.email.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          s.major.toLowerCase().contains(_searchQuery.toLowerCase());
    }).toList();

    // Filter by tab
    switch (filter) {
      case 'verified':
        return filtered.where((s) => s.status == StudentStatus.verified).toList();
      case 'pending':
        return filtered.where((s) => s.status == StudentStatus.pending).toList();
      case 'placed':
        return filtered.where((s) => s.placementStatus != null).toList();
      default:
        return filtered;
    }
  }

  void _showInviteDialog(BuildContext context) {
    final emailController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Invite Student'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Send an invitation email to a student to join the platform.',
              style: AppTextStyles.bodySmall.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: emailController,
              decoration: const InputDecoration(
                labelText: 'Student Email',
                hintText: 'student@university.edu',
                prefixIcon: Icon(Icons.email_outlined),
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.emailAddress,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              // Send invitation
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Invitation sent!'),
                  backgroundColor: AppColors.success,
                ),
              );
            },
            child: const Text('Send Invite'),
          ),
        ],
      ),
    );
  }

  void _showStudentDetails(BuildContext context, _MockStudent student) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        minChildSize: 0.4,
        maxChildSize: 0.9,
        expand: false,
        builder: (context, scrollController) => SingleChildScrollView(
          controller: scrollController,
          child: Padding(
            padding: AppSpacing.screenPadding,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.outline,
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
                      backgroundColor: AppColors.teal.withValues(alpha: 0.1),
                      child: Text(
                        student.name.split(' ').map((e) => e[0]).join(),
                        style: AppTextStyles.h3.copyWith(color: AppColors.teal),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(student.name, style: AppTextStyles.h3),
                          Text(
                            student.email,
                            style: AppTextStyles.bodySmall.copyWith(
                              color: Theme.of(context).colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    ),
                    _buildStatusBadge(student.status),
                  ],
                ),
                const SizedBox(height: 24),

                // Details
                _buildDetailRow(context, isDark, 'Major', student.major),
                _buildDetailRow(context, isDark, 'Graduation', '${student.graduationYear}'),
                if (student.placementStatus != null)
                  _buildDetailRow(context, isDark, 'Placement', student.placementStatus!),

                const SizedBox(height: 24),

                // Actions
                if (student.status == StudentStatus.pending) ...[
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {
                            Navigator.pop(context);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Verification rejected'),
                                backgroundColor: AppColors.error,
                              ),
                            );
                          },
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.error,
                          ),
                          child: const Text('Reject'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: FilledButton(
                          onPressed: () {
                            Navigator.pop(context);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Student verified!'),
                                backgroundColor: AppColors.success,
                              ),
                            );
                          },
                          child: const Text('Verify'),
                        ),
                      ),
                    ],
                  ),
                ] else ...[
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        Navigator.pop(context);
                        // TODO: Navigate to messaging
                      },
                      icon: const Icon(Icons.message_outlined),
                      label: const Text('Send Message'),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(StudentStatus status) {
    Color color;
    String text;

    switch (status) {
      case StudentStatus.verified:
        color = AppColors.success;
        text = 'Verified';
        break;
      case StudentStatus.pending:
        color = AppColors.warning;
        text = 'Pending';
        break;
      case StudentStatus.rejected:
        color = AppColors.error;
        text = 'Rejected';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        text,
        style: AppTextStyles.badge.copyWith(
          color: color,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildDetailRow(
    BuildContext context,
    bool isDark,
    String label,
    String value,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: AppTextStyles.bodySmall.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
          Text(value, style: AppTextStyles.labelMedium),
        ],
      ),
    );
  }
}

/// Student card widget
class _StudentCard extends StatelessWidget {
  final _MockStudent student;
  final bool isDark;
  final VoidCallback onTap;

  const _StudentCard({
    required this.student,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: AppRadius.card,
        border: Border.all(
          color: isDark ? AppColors.borderDark : AppColors.borderLight,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: AppRadius.card,
          child: Padding(
            padding: AppSpacing.listItemPadding,
            child: Row(
              children: [
                // Avatar
                CircleAvatar(
                  radius: 24,
                  backgroundColor: AppColors.teal.withValues(alpha: 0.1),
                  child: Text(
                    student.name.split(' ').map((e) => e[0]).join(),
                    style: AppTextStyles.labelLarge.copyWith(color: AppColors.teal),
                  ),
                ),
                const SizedBox(width: 12),

                // Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        student.name,
                        style: AppTextStyles.labelMedium,
                      ),
                      Text(
                        '${student.major} • Class of ${student.graduationYear}',
                        style: AppTextStyles.caption.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),

                // Status / Placement
                if (student.placementStatus != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.success.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.check_circle, size: 14, color: AppColors.success),
                        const SizedBox(width: 4),
                        Text(
                          'Placed',
                          style: AppTextStyles.badge.copyWith(color: AppColors.success),
                        ),
                      ],
                    ),
                  )
                else
                  _buildStatusIndicator(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusIndicator() {
    Color color;
    IconData icon;

    switch (student.status) {
      case StudentStatus.verified:
        color = AppColors.success;
        icon = Icons.verified;
        break;
      case StudentStatus.pending:
        color = AppColors.warning;
        icon = Icons.schedule;
        break;
      case StudentStatus.rejected:
        color = AppColors.error;
        icon = Icons.cancel;
        break;
    }

    return Icon(icon, color: color, size: 20);
  }
}

enum StudentStatus { verified, pending, rejected }

class _MockStudent {
  final String name;
  final String email;
  final String major;
  final int graduationYear;
  final StudentStatus status;
  final String? placementStatus;

  _MockStudent({
    required this.name,
    required this.email,
    required this.major,
    required this.graduationYear,
    required this.status,
    this.placementStatus,
  });
}
