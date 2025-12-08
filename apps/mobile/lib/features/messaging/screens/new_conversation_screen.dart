import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/providers/messaging_provider.dart';

/// New Conversation Screen - Select recipient and compose first message
class NewConversationScreen extends ConsumerStatefulWidget {
  /// Optional recipient ID to pre-fill
  final String? recipientId;

  /// Optional recipient name for display
  final String? recipientName;

  /// Optional recipient organization
  final String? recipientOrganization;

  const NewConversationScreen({
    super.key,
    this.recipientId,
    this.recipientName,
    this.recipientOrganization,
  });

  @override
  ConsumerState<NewConversationScreen> createState() => _NewConversationScreenState();
}

class _NewConversationScreenState extends ConsumerState<NewConversationScreen> {
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _messageController = TextEditingController();
  String _searchQuery = '';
  _Recipient? _selectedRecipient;
  bool _isSending = false;

  // Mock recipients - will be replaced with Supabase query
  final List<_Recipient> _allRecipients = [
    _Recipient(
      id: 'r1',
      name: 'Sarah Chen',
      role: 'Recruiter',
      organization: 'Goldman Sachs',
      avatarUrl: null,
      isOnline: true,
    ),
    _Recipient(
      id: 'r2',
      name: 'Michael Rodriguez',
      role: 'Recruiter',
      organization: 'Blackstone',
      avatarUrl: null,
      isOnline: false,
    ),
    _Recipient(
      id: 'r3',
      name: 'Emily Watson',
      role: 'Recruiter',
      organization: 'Morgan Stanley',
      avatarUrl: null,
      isOnline: true,
    ),
    _Recipient(
      id: 'r4',
      name: 'David Kim',
      role: 'Recruiter',
      organization: 'JP Morgan',
      avatarUrl: null,
      isOnline: false,
    ),
    _Recipient(
      id: 'r5',
      name: 'Amanda Foster',
      role: 'Career Services',
      organization: 'Wharton School',
      avatarUrl: null,
      isOnline: true,
    ),
    _Recipient(
      id: 'r6',
      name: 'James Thompson',
      role: 'Recruiter',
      organization: 'KKR',
      avatarUrl: null,
      isOnline: false,
    ),
    _Recipient(
      id: 'r7',
      name: 'Lisa Park',
      role: 'Recruiter',
      organization: 'Citadel',
      avatarUrl: null,
      isOnline: true,
    ),
  ];

  @override
  void initState() {
    super.initState();
    // Pre-fill recipient if provided
    if (widget.recipientId != null) {
      _selectedRecipient = _Recipient(
        id: widget.recipientId!,
        name: widget.recipientName ?? 'Unknown',
        role: 'Recruiter',
        organization: widget.recipientOrganization ?? '',
        isOnline: false,
      );
    }
  }

  List<_Recipient> get _filteredRecipients {
    if (_searchQuery.isEmpty) return _allRecipients;
    return _allRecipients.where((r) {
      return r.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          r.organization.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          r.role.toLowerCase().contains(_searchQuery.toLowerCase());
    }).toList();
  }

  Future<void> _sendMessage() async {
    if (_selectedRecipient == null || _messageController.text.trim().isEmpty) {
      return;
    }

    setState(() => _isSending = true);

    try {
      // Get or create conversation and send message
      final conversationsNotifier = ref.read(conversationsProvider.notifier);
      final conversation = await conversationsNotifier.getOrCreateConversation(
        recruiterProfileId: _selectedRecipient!.id,
      );

      if (conversation != null) {
        // Send the initial message
        await conversationsNotifier.sendMessage(
          conversationId: conversation.id,
          content: _messageController.text.trim(),
        );

        if (mounted) {
          // Navigate to the new conversation
          context.go('/messages/${conversation.id}');
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Failed to create conversation')),
          );
          setState(() => _isSending = false);
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
        setState(() => _isSending = false);
      }
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('New Message'),
        actions: [
          if (_selectedRecipient != null)
            TextButton(
              onPressed: _messageController.text.trim().isNotEmpty && !_isSending
                  ? _sendMessage
                  : null,
              child: _isSending
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Send'),
            ),
        ],
      ),
      body: Column(
        children: [
          // Selected recipient chip (if any)
          if (_selectedRecipient != null)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? AppColors.surfaceDark : Colors.white,
                border: Border(
                  bottom: BorderSide(
                    color: isDark ? AppColors.borderDark : AppColors.borderLight,
                  ),
                ),
              ),
              child: Row(
                children: [
                  Text(
                    'To:',
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Wrap(
                      children: [
                        Chip(
                          avatar: CircleAvatar(
                            backgroundColor: AppColors.teal.withValues(alpha: 0.1),
                            child: Text(
                              _selectedRecipient!.name.substring(0, 1),
                              style: AppTextStyles.caption.copyWith(
                                color: AppColors.teal,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          label: Text(_selectedRecipient!.name),
                          deleteIcon: const Icon(Icons.close, size: 18),
                          onDeleted: () {
                            setState(() => _selectedRecipient = null);
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

          // Search bar (show when no recipient selected)
          if (_selectedRecipient == null)
            Padding(
              padding: const EdgeInsets.all(16),
              child: TextField(
                controller: _searchController,
                autofocus: true,
                onChanged: (value) => setState(() => _searchQuery = value),
                decoration: InputDecoration(
                  hintText: 'Search by name or organization...',
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
                  filled: true,
                  fillColor: isDark ? AppColors.cardDark : AppColors.cardLight,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
            ),

          // Content area
          Expanded(
            child: _selectedRecipient == null
                ? _buildRecipientList(isDark)
                : _buildMessageComposer(isDark),
          ),
        ],
      ),
    );
  }

  Widget _buildRecipientList(bool isDark) {
    if (_filteredRecipients.isEmpty) {
      return Center(
        child: Padding(
          padding: AppSpacing.screenPadding,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.person_search,
                size: 64,
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
              AppSpacing.subsectionGap,
              Text(
                'No results found',
                style: AppTextStyles.h4,
              ),
              const SizedBox(height: 8),
              Text(
                'Try searching for a different name or organization',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      itemCount: _filteredRecipients.length,
      itemBuilder: (context, index) {
        final recipient = _filteredRecipients[index];
        return _RecipientTile(
          recipient: recipient,
          isDark: isDark,
          onTap: () {
            setState(() {
              _selectedRecipient = recipient;
              _searchQuery = '';
              _searchController.clear();
            });
          },
        );
      },
    );
  }

  Widget _buildMessageComposer(bool isDark) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Recipient preview card
          Container(
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
                Stack(
                  children: [
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: AppColors.teal.withValues(alpha: 0.1),
                      child: Text(
                        _selectedRecipient!.name.substring(0, 1),
                        style: AppTextStyles.h4.copyWith(color: AppColors.teal),
                      ),
                    ),
                    if (_selectedRecipient!.isOnline)
                      Positioned(
                        right: 0,
                        bottom: 0,
                        child: Container(
                          width: 12,
                          height: 12,
                          decoration: BoxDecoration(
                            color: AppColors.success,
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: isDark ? AppColors.cardDark : Colors.white,
                              width: 2,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _selectedRecipient!.name,
                        style: AppTextStyles.labelLarge,
                      ),
                      Text(
                        '${_selectedRecipient!.role} at ${_selectedRecipient!.organization}',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          AppSpacing.subsectionGap,

          // Message input
          Text(
            'Message',
            style: AppTextStyles.labelMedium,
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _messageController,
            maxLines: 6,
            minLines: 4,
            textCapitalization: TextCapitalization.sentences,
            onChanged: (_) => setState(() {}),
            decoration: InputDecoration(
              hintText: 'Write your message...',
              filled: true,
              fillColor: isDark ? AppColors.cardDark : AppColors.cardLight,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: isDark ? AppColors.borderDark : AppColors.borderLight,
                ),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: isDark ? AppColors.borderDark : AppColors.borderLight,
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.teal, width: 2),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Tip: Introduce yourself and mention why you\'re reaching out.',
            style: AppTextStyles.caption.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),

          const Spacer(),

          // Send button
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: _messageController.text.trim().isNotEmpty && !_isSending
                  ? _sendMessage
                  : null,
              icon: _isSending
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.send),
              label: Text(_isSending ? 'Sending...' : 'Send Message'),
            ),
          ),
        ],
      ),
    );
  }
}

/// Recipient tile widget
class _RecipientTile extends StatelessWidget {
  final _Recipient recipient;
  final bool isDark;
  final VoidCallback onTap;

  const _RecipientTile({
    required this.recipient,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: isDark ? AppColors.borderDark : AppColors.borderLight,
              width: 0.5,
            ),
          ),
        ),
        child: Row(
          children: [
            Stack(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: AppColors.teal.withValues(alpha: 0.1),
                  backgroundImage: recipient.avatarUrl != null
                      ? NetworkImage(recipient.avatarUrl!)
                      : null,
                  child: recipient.avatarUrl == null
                      ? Text(
                          recipient.name.substring(0, 1),
                          style: AppTextStyles.h4.copyWith(color: AppColors.teal),
                        )
                      : null,
                ),
                if (recipient.isOnline)
                  Positioned(
                    right: 0,
                    bottom: 0,
                    child: Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: AppColors.success,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: isDark ? AppColors.backgroundDark : Colors.white,
                          width: 2,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    recipient.name,
                    style: AppTextStyles.labelLarge,
                  ),
                  Text(
                    '${recipient.role} at ${recipient.organization}',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right,
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ],
        ),
      ),
    );
  }
}

/// Recipient model
class _Recipient {
  final String id;
  final String name;
  final String role;
  final String organization;
  final String? avatarUrl;
  final bool isOnline;

  _Recipient({
    required this.id,
    required this.name,
    required this.role,
    required this.organization,
    this.avatarUrl,
    required this.isOnline,
  });
}
