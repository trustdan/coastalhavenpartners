import 'dart:async';
import 'package:flutter/foundation.dart';
import 'base_repository.dart';
import '../models/models.dart';

/// Repository for messaging operations with 15-second polling
class MessagingRepository extends BaseRepository {
  MessagingRepository._();
  static MessagingRepository? _instance;
  static MessagingRepository get instance => _instance ??= MessagingRepository._();

  Timer? _pollingTimer;
  final _conversationsController = StreamController<List<Conversation>>.broadcast();
  final _messagesControllers = <String, StreamController<List<Message>>>{};

  /// Stream of conversations (updated every 15 seconds)
  Stream<List<Conversation>> get conversationsStream => _conversationsController.stream;

  /// Start polling for conversations
  void startPolling() {
    stopPolling(); // Clear any existing timer

    // Fetch immediately
    _fetchConversations();

    // Then poll every 15 seconds
    _pollingTimer = Timer.periodic(
      const Duration(seconds: 15),
      (_) => _fetchConversations(),
    );
    debugPrint('MessagingRepository: Started polling');
  }

  /// Stop polling
  void stopPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
    debugPrint('MessagingRepository: Stopped polling');
  }

  /// Get stream for a specific conversation's messages
  Stream<List<Message>> getMessagesStream(String conversationId) {
    if (!_messagesControllers.containsKey(conversationId)) {
      _messagesControllers[conversationId] = StreamController<List<Message>>.broadcast();
    }
    return _messagesControllers[conversationId]!.stream;
  }

  /// Start polling for messages in a conversation
  void startMessagePolling(String conversationId) {
    // Fetch immediately
    _fetchMessages(conversationId);
  }

  /// Private: Fetch conversations and emit to stream
  Future<void> _fetchConversations() async {
    try {
      final conversations = await getConversations();
      _conversationsController.add(conversations);
    } catch (e) {
      debugPrint('MessagingRepository: Error polling conversations: $e');
    }
  }

  /// Private: Fetch messages and emit to stream
  Future<void> _fetchMessages(String conversationId) async {
    try {
      final messages = await getMessages(conversationId);
      _messagesControllers[conversationId]?.add(messages);
    } catch (e) {
      debugPrint('MessagingRepository: Error polling messages: $e');
    }
  }

  // =====================
  // Conversations
  // =====================

  /// Get all conversations for current user
  Future<List<Conversation>> getConversations() async {
    if (!isAvailable || currentUserId == null) return [];

    final result = await safeExecute<List<Conversation>>(() async {
      // Get candidate profile ID if exists
      final candidateProfile = await table('candidate_profiles')
          .select('id')
          .eq('user_id', currentUserId!)
          .maybeSingle();

      // Get recruiter profile ID if exists
      final recruiterProfile = await table('recruiter_profiles')
          .select('id')
          .eq('user_id', currentUserId!)
          .maybeSingle();

      List<dynamic> conversations = [];

      if (candidateProfile != null) {
        final response = await table('conversations')
            .select('*, candidate_profiles(*), recruiter_profiles(*)')
            .eq('candidate_id', candidateProfile['id'])
            .order('last_message_at', ascending: false);
        conversations.addAll(response as List);
      }

      if (recruiterProfile != null) {
        final response = await table('conversations')
            .select('*, candidate_profiles(*), recruiter_profiles(*)')
            .eq('recruiter_id', recruiterProfile['id'])
            .order('last_message_at', ascending: false);
        conversations.addAll(response as List);
      }

      // Convert to Conversation objects and fetch last message
      final resultList = <Conversation>[];
      for (final conv in conversations) {
        var conversation = Conversation.fromJson(conv);

        // Get last message
        final lastMessageResponse = await table('messages')
            .select()
            .eq('conversation_id', conversation.id)
            .order('created_at', ascending: false)
            .limit(1)
            .maybeSingle();

        if (lastMessageResponse != null) {
          conversation = conversation.copyWith(
            lastMessage: Message.fromJson(lastMessageResponse),
          );
        }

        // Get unread count
        final unreadResponse = await table('messages')
            .select('id')
            .eq('conversation_id', conversation.id)
            .neq('sender_id', currentUserId!)
            .isFilter('read_at', null);

        conversation = conversation.copyWith(
          unreadCount: (unreadResponse as List).length,
        );

        resultList.add(conversation);
      }

      return resultList;
    }, errorMessage: 'Error fetching conversations', rethrowError: false);
    return result ?? [];
  }

  /// Get or create conversation
  Future<Conversation?> getOrCreateConversation({
    String? candidateProfileId,
    String? recruiterProfileId,
  }) async {
    if (!isAvailable) return null;
    if (candidateProfileId == null && recruiterProfileId == null) return null;

    return safeExecute<Conversation?>(() async {
      // Check if conversation exists
      var query = table('conversations').select('*, candidate_profiles(*), recruiter_profiles(*)');

      if (candidateProfileId != null) {
        query = query.eq('candidate_id', candidateProfileId);
      }
      if (recruiterProfileId != null) {
        query = query.eq('recruiter_id', recruiterProfileId);
      }

      final existing = await query.maybeSingle();
      if (existing != null) {
        return Conversation.fromJson(existing);
      }

      // Create new conversation
      final response = await table('conversations').insert({
        'candidate_id': candidateProfileId,
        'recruiter_id': recruiterProfileId,
        'created_at': DateTime.now().toIso8601String(),
      }).select('*, candidate_profiles(*), recruiter_profiles(*)').single();

      return Conversation.fromJson(response);
    }, errorMessage: 'Error getting/creating conversation');
  }

  // =====================
  // Messages
  // =====================

  /// Get messages for a conversation
  Future<List<Message>> getMessages(
    String conversationId, {
    int limit = 50,
    int offset = 0,
  }) async {
    if (!isAvailable) return [];

    final result = await safeExecute<List<Message>>(() async {
      final response = await table('messages')
          .select()
          .eq('conversation_id', conversationId)
          .order('created_at', ascending: false)
          .range(offset, offset + limit - 1);

      return (response as List)
          .map((e) => Message.fromJson(e))
          .toList()
          .reversed
          .toList(); // Return in chronological order
    }, errorMessage: 'Error fetching messages', rethrowError: false);
    return result ?? [];
  }

  /// Send a message
  Future<Message?> sendMessage({
    required String conversationId,
    required String content,
  }) async {
    if (!isAvailable || currentUserId == null) return null;

    return safeExecute<Message?>(() async {
      final response = await table('messages').insert({
        'conversation_id': conversationId,
        'sender_id': currentUserId,
        'content': content,
        'created_at': DateTime.now().toIso8601String(),
      }).select().single();

      // Update conversation last_message_at
      await table('conversations')
          .update({'last_message_at': DateTime.now().toIso8601String()})
          .eq('id', conversationId);

      // Emit updated messages to stream
      _fetchMessages(conversationId);

      return Message.fromJson(response);
    }, errorMessage: 'Error sending message');
  }

  /// Mark messages as read
  Future<void> markMessagesAsRead(String conversationId) async {
    if (!isAvailable || currentUserId == null) return;

    await safeExecute<void>(() async {
      await table('messages')
          .update({'read_at': DateTime.now().toIso8601String()})
          .eq('conversation_id', conversationId)
          .neq('sender_id', currentUserId!)
          .isFilter('read_at', null);
    }, errorMessage: 'Error marking messages as read');
  }

  /// Get total unread message count
  Future<int> getUnreadCount() async {
    if (!isAvailable || currentUserId == null) return 0;

    final result = await safeExecute<int>(() async {
      // Get user's profile IDs
      final candidateProfile = await table('candidate_profiles')
          .select('id')
          .eq('user_id', currentUserId!)
          .maybeSingle();

      final recruiterProfile = await table('recruiter_profiles')
          .select('id')
          .eq('user_id', currentUserId!)
          .maybeSingle();

      int totalUnread = 0;

      if (candidateProfile != null) {
        final conversations = await table('conversations')
            .select('id')
            .eq('candidate_id', candidateProfile['id']);

        for (final conv in conversations as List) {
          final unread = await table('messages')
              .select('id')
              .eq('conversation_id', conv['id'])
              .neq('sender_id', currentUserId!)
              .isFilter('read_at', null);
          totalUnread += (unread as List).length;
        }
      }

      if (recruiterProfile != null) {
        final conversations = await table('conversations')
            .select('id')
            .eq('recruiter_id', recruiterProfile['id']);

        for (final conv in conversations as List) {
          final unread = await table('messages')
              .select('id')
              .eq('conversation_id', conv['id'])
              .neq('sender_id', currentUserId!)
              .isFilter('read_at', null);
          totalUnread += (unread as List).length;
        }
      }

      return totalUnread;
    }, errorMessage: 'Error getting unread count', rethrowError: false);
    return result ?? 0;
  }

  /// Dispose resources
  void dispose() {
    stopPolling();
    _conversationsController.close();
    for (final controller in _messagesControllers.values) {
      controller.close();
    }
    _messagesControllers.clear();
  }
}
