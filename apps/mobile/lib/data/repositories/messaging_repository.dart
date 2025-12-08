import 'dart:async';
import 'package:drift/drift.dart';
import 'package:flutter/foundation.dart';
import 'base_repository.dart';
import '../models/models.dart';
import '../local/database.dart';
import '../local/converters.dart';
import '../../services/connectivity_service.dart';
import '../../services/sync_service.dart';

/// Repository for messaging operations with offline support and 15-second polling
class MessagingRepository extends BaseRepository {
  MessagingRepository._();
  static MessagingRepository? _instance;
  static MessagingRepository get instance => _instance ??= MessagingRepository._();

  final AppDatabase _db = AppDatabase();
  final ConnectivityService _connectivity = ConnectivityService.instance;
  final SyncService _sync = SyncService.instance;

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

    // Then poll every 15 seconds (only when online)
    _pollingTimer = Timer.periodic(
      const Duration(seconds: 15),
      (_) {
        if (_connectivity.isOnline) {
          _fetchConversations();
        }
      },
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
  // Conversations (Local-First)
  // =====================

  /// Get all conversations for current user (local-first)
  Future<List<Conversation>> getConversations() async {
    // If offline, return cached data
    if (!_connectivity.isOnline) {
      return _getCachedConversations();
    }

    if (!isAvailable || currentUserId == null) {
      return _getCachedConversations();
    }

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

      // Cache the conversations
      await _cacheConversations(resultList);

      return resultList;
    }, errorMessage: 'Error fetching conversations', rethrowError: false);

    // If network failed, return cached data
    if (result == null) {
      return _getCachedConversations();
    }

    return result;
  }

  /// Get cached conversations from local database
  Future<List<Conversation>> _getCachedConversations() async {
    final cached = await _db.getAllConversations();
    return cached.map((c) => c.toConversation()).toList();
  }

  /// Cache conversations to local database
  Future<void> _cacheConversations(List<Conversation> conversations) async {
    final companions = conversations.map((c) => c.toCacheCompanion()).toList();
    await _db.cacheConversations(companions);
    await _db.setLastSyncTime('conversations');
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
        final conversation = Conversation.fromJson(existing);
        // Cache the conversation
        await _db.cacheConversation(conversation.toCacheCompanion());
        return conversation;
      }

      // Create new conversation
      final response = await table('conversations').insert({
        'candidate_id': candidateProfileId,
        'recruiter_id': recruiterProfileId,
        'created_at': DateTime.now().toIso8601String(),
      }).select('*, candidate_profiles(*), recruiter_profiles(*)').single();

      final conversation = Conversation.fromJson(response);
      // Cache the new conversation
      await _db.cacheConversation(conversation.toCacheCompanion());

      return conversation;
    }, errorMessage: 'Error getting/creating conversation');
  }

  // =====================
  // Messages (Local-First)
  // =====================

  /// Get messages for a conversation (local-first)
  Future<List<Message>> getMessages(
    String conversationId, {
    int limit = 50,
    int offset = 0,
  }) async {
    // If offline, return cached data
    if (!_connectivity.isOnline) {
      return _getCachedMessages(conversationId);
    }

    if (!isAvailable) {
      return _getCachedMessages(conversationId);
    }

    final result = await safeExecute<List<Message>>(() async {
      final response = await table('messages')
          .select()
          .eq('conversation_id', conversationId)
          .order('created_at', ascending: false)
          .range(offset, offset + limit - 1);

      final messages = (response as List)
          .map((e) => Message.fromJson(e))
          .toList()
          .reversed
          .toList(); // Return in chronological order

      // Cache the messages (only on first page)
      if (offset == 0) {
        await _cacheMessages(messages);
      }

      return messages;
    }, errorMessage: 'Error fetching messages', rethrowError: false);

    // If network failed, return cached data
    if (result == null) {
      return _getCachedMessages(conversationId);
    }

    return result;
  }

  /// Get cached messages from local database
  Future<List<Message>> _getCachedMessages(String conversationId) async {
    final cached = await _db.getMessagesForConversation(conversationId);
    return cached.map((c) => c.toMessage()).toList();
  }

  /// Cache messages to local database
  Future<void> _cacheMessages(List<Message> messages) async {
    final companions = messages.map((m) => m.toCacheCompanion()).toList();
    await _db.cacheMessages(companions);
  }

  /// Send a message (supports offline queueing)
  Future<Message?> sendMessage({
    required String conversationId,
    required String content,
  }) async {
    if (currentUserId == null) return null;

    // If offline, create a pending message and queue for sync
    if (!_connectivity.isOnline || !isAvailable) {
      return _queueMessageForSync(
        conversationId: conversationId,
        content: content,
      );
    }

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

      final message = Message.fromJson(response);

      // Cache the sent message
      await _db.cacheMessage(message.toCacheCompanion());

      // Emit updated messages to stream
      _fetchMessages(conversationId);

      return message;
    }, errorMessage: 'Error sending message');
  }

  /// Queue a message for sync when offline
  Future<Message?> _queueMessageForSync({
    required String conversationId,
    required String content,
  }) async {
    // Generate a temporary ID for the pending message
    final tempId = 'pending_msg_${DateTime.now().millisecondsSinceEpoch}';

    // Create the message payload for sync
    final payload = {
      'conversation_id': conversationId,
      'sender_id': currentUserId,
      'content': content,
      'created_at': DateTime.now().toIso8601String(),
    };

    // Queue for sync
    await _sync.queueCreate(
      entityTable: 'messages',
      recordId: tempId,
      data: payload,
    );

    // Create a local pending message
    final pendingMessage = Message(
      id: tempId,
      conversationId: conversationId,
      senderId: currentUserId!,
      content: content,
      createdAt: DateTime.now(),
      isPending: true,
      isFailed: false,
    );

    // Cache the pending message
    await _db.cacheMessage(pendingMessage.toCacheCompanion());

    // Emit updated messages to stream
    _fetchMessages(conversationId);

    return pendingMessage;
  }

  /// Retry sending a failed message
  Future<Message?> retryMessage(String messageId) async {
    // Get the cached message
    final cachedMessages = await _db.getMessagesForConversation('');
    final message = cachedMessages.where((m) => m.id == messageId).firstOrNull;

    if (message == null) return null;

    // If now online, try to send
    if (_connectivity.isOnline && isAvailable) {
      final result = await sendMessage(
        conversationId: message.conversationId,
        content: message.content,
      );

      if (result != null) {
        // Remove the failed message from cache
        // The new message will be cached by sendMessage
      }

      return result;
    }

    return null;
  }

  /// Mark messages as read
  Future<void> markMessagesAsRead(String conversationId) async {
    if (currentUserId == null) return;

    // Update local cache first
    final cached = await _db.getMessagesForConversation(conversationId);
    for (final msg in cached) {
      if (msg.senderId != currentUserId && msg.readAt == null) {
        await _db.cacheMessage(CachedMessagesCompanion(
          id: Value(msg.id),
          conversationId: Value(msg.conversationId),
          senderId: Value(msg.senderId),
          content: Value(msg.content),
          readAt: Value(DateTime.now()),
          createdAt: Value(msg.createdAt),
          isPending: Value(msg.isPending),
          isFailed: Value(msg.isFailed),
          cachedAt: Value(DateTime.now()),
        ));
      }
    }

    // If offline, queue for sync
    if (!_connectivity.isOnline || !isAvailable) {
      await _sync.queueUpdate(
        entityTable: 'messages',
        recordId: 'read_$conversationId',
        data: {
          'conversation_id': conversationId,
          'read_at': DateTime.now().toIso8601String(),
        },
      );
      return;
    }

    await safeExecute<void>(() async {
      await table('messages')
          .update({'read_at': DateTime.now().toIso8601String()})
          .eq('conversation_id', conversationId)
          .neq('sender_id', currentUserId!)
          .isFilter('read_at', null);
    }, errorMessage: 'Error marking messages as read');
  }

  /// Get total unread message count (local-first)
  Future<int> getUnreadCount() async {
    if (currentUserId == null) return 0;

    // If offline, calculate from cache
    if (!_connectivity.isOnline) {
      return _getCachedUnreadCount();
    }

    if (!isAvailable) {
      return _getCachedUnreadCount();
    }

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
    return result ?? _getCachedUnreadCount();
  }

  /// Get unread count from cache
  Future<int> _getCachedUnreadCount() async {
    final conversations = await _db.getAllConversations();
    int total = 0;
    for (final conv in conversations) {
      total += conv.unreadCount;
    }
    return total;
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
