import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/models.dart';
import '../../data/repositories/repositories.dart';
import 'auth_provider.dart';

/// Provider for messaging repository instance
final messagingRepositoryProvider = Provider<MessagingRepository>((ref) {
  return MessagingRepository.instance;
});

/// Provider for conversations list with polling
class ConversationsNotifier extends AsyncNotifier<List<Conversation>> {
  Timer? _pollingTimer;
  static const _pollInterval = Duration(seconds: 15);

  @override
  Future<List<Conversation>> build() async {
    final user = ref.watch(currentUserProvider);
    if (user == null) return [];

    // Start polling when provider is built
    _startPolling();

    // Clean up on dispose
    ref.onDispose(_stopPolling);

    return _fetchConversations();
  }

  Future<List<Conversation>> _fetchConversations() async {
    final repo = ref.read(messagingRepositoryProvider);
    return repo.getConversations();
  }

  void _startPolling() {
    _stopPolling();
    _pollingTimer = Timer.periodic(_pollInterval, (_) async {
      final conversations = await _fetchConversations();
      state = AsyncData(conversations);
    });
  }

  void _stopPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
  }

  /// Manually refresh conversations
  Future<void> refresh() async {
    state = const AsyncLoading();
    state = AsyncData(await _fetchConversations());
  }

  /// Send a message
  Future<Message?> sendMessage({
    required String conversationId,
    required String content,
  }) async {
    final repo = ref.read(messagingRepositoryProvider);
    final message = await repo.sendMessage(
      conversationId: conversationId,
      content: content,
    );

    // Refresh conversations after sending
    if (message != null) {
      refresh();
    }

    return message;
  }

  /// Get or create a conversation with another user
  Future<Conversation?> getOrCreateConversation({
    String? candidateProfileId,
    String? recruiterProfileId,
  }) async {
    final repo = ref.read(messagingRepositoryProvider);
    final conversation = await repo.getOrCreateConversation(
      candidateProfileId: candidateProfileId,
      recruiterProfileId: recruiterProfileId,
    );

    if (conversation != null) {
      refresh();
    }

    return conversation;
  }
}

final conversationsProvider =
    AsyncNotifierProvider<ConversationsNotifier, List<Conversation>>(
  ConversationsNotifier.new,
);

/// Unread conversations count
final unreadConversationsCountProvider = Provider<int>((ref) {
  final conversationsAsync = ref.watch(conversationsProvider);
  if (!conversationsAsync.hasValue) return 0;

  return conversationsAsync.value!.where((c) => c.unreadCount > 0).length;
});

/// Messages for a conversation
final conversationMessagesProvider =
    FutureProvider.family<List<Message>, String>((ref, conversationId) async {
  final repo = ref.watch(messagingRepositoryProvider);
  return repo.getMessages(conversationId);
});

/// Unread message count
final unreadMessageCountProvider = FutureProvider<int>((ref) async {
  final repo = ref.watch(messagingRepositoryProvider);
  return repo.getUnreadCount();
});
