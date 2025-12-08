import 'dart:convert';
import 'package:drift/drift.dart';
import 'package:drift_flutter/drift_flutter.dart';

part 'database.g.dart';

/// ============================================================================
/// TABLE DEFINITIONS
/// ============================================================================

/// Cached firms table
class CachedFirms extends Table {
  TextColumn get id => text()();
  TextColumn get name => text()();
  TextColumn get slug => text()();
  TextColumn get description => text().nullable()();
  TextColumn get logoUrl => text().nullable()();
  TextColumn get firmType => text().nullable()();
  TextColumn get website => text().nullable()();
  TextColumn get locations => text().nullable()(); // JSON array
  TextColumn get employeeCount => text().nullable()();
  IntColumn get foundedYear => integer().nullable()();
  TextColumn get culture => text().nullable()();
  TextColumn get hiringRoles => text().nullable()(); // JSON array
  BoolColumn get isVisible => boolean().withDefault(const Constant(true))();
  DateTimeColumn get createdAt => dateTime().nullable()();
  DateTimeColumn get updatedAt => dateTime().nullable()();
  DateTimeColumn get cachedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

/// Cached job listings table
class CachedJobListings extends Table {
  TextColumn get id => text()();
  TextColumn get title => text()();
  TextColumn get slug => text()();
  TextColumn get description => text()();
  TextColumn get firmId => text()();
  TextColumn get postedBy => text()();
  TextColumn get jobType => text()();
  TextColumn get status => text()();
  TextColumn get locations => text().nullable()(); // JSON array
  TextColumn get compensationRange => text().nullable()();
  TextColumn get requirements => text().nullable()();
  TextColumn get responsibilities => text().nullable()();
  TextColumn get applicationInstructions => text().nullable()();
  TextColumn get externalUrl => text().nullable()();
  RealColumn get minGpa => real().nullable()();
  TextColumn get targetGradYears => text().nullable()(); // JSON array
  TextColumn get targetRoles => text().nullable()(); // JSON array
  TextColumn get targetSchools => text().nullable()(); // JSON array
  IntColumn get viewCount => integer().withDefault(const Constant(0))();
  IntColumn get applicationCount => integer().withDefault(const Constant(0))();
  BoolColumn get isFeatured => boolean().withDefault(const Constant(false))();
  DateTimeColumn get applicationDeadline => dateTime().nullable()();
  DateTimeColumn get startDate => dateTime().nullable()();
  DateTimeColumn get publishedAt => dateTime().nullable()();
  DateTimeColumn get closedAt => dateTime().nullable()();
  DateTimeColumn get createdAt => dateTime().nullable()();
  DateTimeColumn get updatedAt => dateTime().nullable()();
  DateTimeColumn get cachedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

/// Cached conversations table
class CachedConversations extends Table {
  TextColumn get id => text()();
  TextColumn get candidateId => text().nullable()();
  TextColumn get recruiterId => text().nullable()();
  DateTimeColumn get lastMessageAt => dateTime().nullable()();
  DateTimeColumn get createdAt => dateTime().nullable()();
  TextColumn get candidateProfileJson => text().nullable()();
  TextColumn get recruiterProfileJson => text().nullable()();
  TextColumn get lastMessageJson => text().nullable()();
  IntColumn get unreadCount => integer().withDefault(const Constant(0))();
  DateTimeColumn get cachedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

/// Cached messages table
class CachedMessages extends Table {
  TextColumn get id => text()();
  TextColumn get conversationId => text()();
  TextColumn get senderId => text()();
  TextColumn get content => text()();
  DateTimeColumn get readAt => dateTime().nullable()();
  DateTimeColumn get createdAt => dateTime().nullable()();
  BoolColumn get isPending => boolean().withDefault(const Constant(false))();
  BoolColumn get isFailed => boolean().withDefault(const Constant(false))();
  DateTimeColumn get cachedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

/// Cached applications table
class CachedApplications extends Table {
  TextColumn get id => text()();
  TextColumn get candidateProfileId => text()();
  TextColumn get jobListingId => text().nullable()();
  TextColumn get firmId => text().nullable()();
  TextColumn get status => text()();
  TextColumn get coverLetter => text()();
  TextColumn get outreachApproach => text()();
  TextColumn get snapshot => text()(); // JSON object
  TextColumn get internalNotes => text().nullable()();
  TextColumn get reviewedBy => text().nullable()();
  DateTimeColumn get reviewedAt => dateTime().nullable()();
  DateTimeColumn get appliedAt => dateTime().nullable()();
  DateTimeColumn get updatedAt => dateTime().nullable()();
  TextColumn get jobListingJson => text().nullable()(); // Cached job listing data
  DateTimeColumn get cachedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

/// Cached candidate profile table
class CachedCandidateProfiles extends Table {
  TextColumn get id => text()();
  TextColumn get userId => text().nullable()();
  TextColumn get schoolName => text()();
  TextColumn get major => text()();
  RealColumn get gpa => real()();
  IntColumn get graduationYear => integer()();
  TextColumn get undergradDegreeType => text().nullable()();
  TextColumn get undergradSpecialty => text().nullable()();
  TextColumn get educationLevel => text().nullable()();
  TextColumn get gradSchool => text().nullable()();
  TextColumn get gradMajor => text().nullable()();
  RealColumn get gradGpa => real().nullable()();
  IntColumn get gradGraduationYear => integer().nullable()();
  TextColumn get gradDegreeType => text().nullable()();
  TextColumn get gradSpecialty => text().nullable()();
  TextColumn get bio => text().nullable()();
  TextColumn get resumeUrl => text().nullable()();
  TextColumn get transcriptUrl => text().nullable()();
  TextColumn get schedulingUrl => text().nullable()();
  TextColumn get targetRoles => text().nullable()(); // JSON array
  TextColumn get preferredLocations => text().nullable()(); // JSON array
  TextColumn get tags => text().nullable()(); // JSON array
  TextColumn get status => text().nullable()();
  BoolColumn get emailVerified => boolean().withDefault(const Constant(false))();
  BoolColumn get schoolVerified => boolean().withDefault(const Constant(false))();
  BoolColumn get gpaVerified => boolean().withDefault(const Constant(false))();
  BoolColumn get resumeVerified => boolean().withDefault(const Constant(false))();
  BoolColumn get transcriptVerified => boolean().withDefault(const Constant(false))();
  BoolColumn get isRejected => boolean().withDefault(const Constant(false))();
  TextColumn get visibleFieldsToRecruiters => text().nullable()(); // JSON object
  TextColumn get visibleFieldsToSchools => text().nullable()(); // JSON object
  DateTimeColumn get lastActivityAt => dateTime().nullable()();
  DateTimeColumn get createdAt => dateTime().nullable()();
  DateTimeColumn get updatedAt => dateTime().nullable()();
  TextColumn get profileJson => text().nullable()(); // Cached base profile data
  DateTimeColumn get cachedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

/// Cached recruiter profile table
class CachedRecruiterProfiles extends Table {
  TextColumn get id => text()();
  TextColumn get userId => text().nullable()();
  TextColumn get firmName => text()();
  TextColumn get jobTitle => text()();
  TextColumn get firmType => text().nullable()();
  TextColumn get firmId => text().nullable()();
  TextColumn get bio => text().nullable()();
  TextColumn get linkedinUrl => text().nullable()();
  TextColumn get profilePhotoUrl => text().nullable()();
  TextColumn get companyWebsite => text().nullable()();
  IntColumn get yearsExperience => integer().nullable()();
  TextColumn get specialties => text().nullable()(); // JSON array
  TextColumn get locations => text().nullable()(); // JSON array
  BoolColumn get isApproved => boolean().withDefault(const Constant(false))();
  BoolColumn get isRejected => boolean().withDefault(const Constant(false))();
  TextColumn get emailDomain => text().nullable()();
  BoolColumn get emailDomainMatchesCompany => boolean().withDefault(const Constant(false))();
  TextColumn get verificationNotes => text().nullable()();
  BoolColumn get isVisibleToCandidates => boolean().withDefault(const Constant(true))();
  BoolColumn get isVisibleToRecruiters => boolean().withDefault(const Constant(true))();
  BoolColumn get isVisibleToSchools => boolean().withDefault(const Constant(true))();
  DateTimeColumn get approvedAt => dateTime().nullable()();
  DateTimeColumn get createdAt => dateTime().nullable()();
  DateTimeColumn get updatedAt => dateTime().nullable()();
  TextColumn get profileJson => text().nullable()(); // Cached base profile data
  DateTimeColumn get cachedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

/// Cached base profile table
class CachedProfiles extends Table {
  TextColumn get id => text()();
  TextColumn get email => text()();
  TextColumn get fullName => text()();
  TextColumn get role => text()();
  TextColumn get linkedinUrl => text().nullable()();
  TextColumn get phone => text().nullable()();
  TextColumn get discordId => text().nullable()();
  TextColumn get discordUsername => text().nullable()();
  TextColumn get referralCode => text().nullable()();
  BoolColumn get isBanned => boolean().withDefault(const Constant(false))();
  DateTimeColumn get createdAt => dateTime().nullable()();
  DateTimeColumn get updatedAt => dateTime().nullable()();
  DateTimeColumn get cachedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

/// Sync queue for offline operations
class SyncQueue extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get operationType => text()(); // 'create', 'update', 'delete'
  TextColumn get entityTable => text()(); // The table this operation applies to
  TextColumn get recordId => text()();
  TextColumn get payload => text()(); // JSON payload
  IntColumn get retryCount => integer().withDefault(const Constant(0))();
  TextColumn get lastError => text().nullable()();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get lastAttemptAt => dateTime().nullable()();
}

/// App settings and metadata
class AppMetadata extends Table {
  TextColumn get key => text()();
  TextColumn get value => text()();
  DateTimeColumn get updatedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {key};
}

/// ============================================================================
/// DATABASE CLASS
/// ============================================================================

@DriftDatabase(tables: [
  CachedFirms,
  CachedJobListings,
  CachedConversations,
  CachedMessages,
  CachedApplications,
  CachedCandidateProfiles,
  CachedRecruiterProfiles,
  CachedProfiles,
  SyncQueue,
  AppMetadata,
])
class AppDatabase extends _$AppDatabase {
  AppDatabase._internal() : super(_openConnection());

  static AppDatabase? _instance;

  factory AppDatabase() {
    _instance ??= AppDatabase._internal();
    return _instance!;
  }

  @override
  int get schemaVersion => 2;

  static QueryExecutor _openConnection() {
    return driftDatabase(name: 'coastal_haven_offline');
  }

  /// Clear all cached data (for logout)
  Future<void> clearAllData() async {
    await batch((batch) {
      batch.deleteAll(cachedFirms);
      batch.deleteAll(cachedJobListings);
      batch.deleteAll(cachedConversations);
      batch.deleteAll(cachedMessages);
      batch.deleteAll(cachedApplications);
      batch.deleteAll(cachedCandidateProfiles);
      batch.deleteAll(cachedRecruiterProfiles);
      batch.deleteAll(cachedProfiles);
      batch.deleteAll(syncQueue);
    });
  }

  /// Clear stale cached data (older than specified duration)
  Future<void> clearStaleData({Duration maxAge = const Duration(days: 7)}) async {
    final cutoff = DateTime.now().subtract(maxAge);

    await (delete(cachedJobListings)..where((t) => t.cachedAt.isSmallerThanValue(cutoff))).go();
    await (delete(cachedFirms)..where((t) => t.cachedAt.isSmallerThanValue(cutoff))).go();
    await (delete(cachedMessages)..where((t) => t.cachedAt.isSmallerThanValue(cutoff))).go();
  }

  // ============================================================================
  // FIRMS OPERATIONS
  // ============================================================================

  Future<void> cacheFirm(CachedFirmsCompanion firm) async {
    await into(cachedFirms).insertOnConflictUpdate(firm);
  }

  Future<void> cacheFirms(List<CachedFirmsCompanion> firms) async {
    await batch((batch) {
      for (final firm in firms) {
        batch.insert(cachedFirms, firm, onConflict: DoUpdate((_) => firm));
      }
    });
  }

  Future<CachedFirm?> getFirmById(String id) async {
    return (select(cachedFirms)..where((t) => t.id.equals(id))).getSingleOrNull();
  }

  Future<List<CachedFirm>> getAllFirms() async {
    return select(cachedFirms).get();
  }

  // ============================================================================
  // JOB LISTINGS OPERATIONS
  // ============================================================================

  Future<void> cacheJobListing(CachedJobListingsCompanion job) async {
    await into(cachedJobListings).insertOnConflictUpdate(job);
  }

  Future<void> cacheJobListings(List<CachedJobListingsCompanion> jobs) async {
    await batch((batch) {
      for (final job in jobs) {
        batch.insert(cachedJobListings, job, onConflict: DoUpdate((_) => job));
      }
    });
  }

  Future<CachedJobListing?> getJobListingById(String id) async {
    return (select(cachedJobListings)..where((t) => t.id.equals(id))).getSingleOrNull();
  }

  Future<List<CachedJobListing>> getActiveJobListings() async {
    return (select(cachedJobListings)
      ..where((t) => t.status.equals('active'))
      ..orderBy([(t) => OrderingTerm.desc(t.publishedAt)]))
      .get();
  }

  Future<List<CachedJobListing>> searchJobListings({
    String? query,
    String? jobType,
    String? firmId,
  }) async {
    var stmt = select(cachedJobListings);

    if (jobType != null) {
      stmt = stmt..where((t) => t.jobType.equals(jobType));
    }

    if (firmId != null) {
      stmt = stmt..where((t) => t.firmId.equals(firmId));
    }

    final results = await stmt.get();

    if (query != null && query.isNotEmpty) {
      final lowerQuery = query.toLowerCase();
      return results.where((job) =>
        job.title.toLowerCase().contains(lowerQuery) ||
        job.description.toLowerCase().contains(lowerQuery)
      ).toList();
    }

    return results;
  }

  // ============================================================================
  // CONVERSATIONS OPERATIONS
  // ============================================================================

  Future<void> cacheConversation(CachedConversationsCompanion conversation) async {
    await into(cachedConversations).insertOnConflictUpdate(conversation);
  }

  Future<void> cacheConversations(List<CachedConversationsCompanion> conversations) async {
    await batch((batch) {
      for (final conv in conversations) {
        batch.insert(cachedConversations, conv, onConflict: DoUpdate((_) => conv));
      }
    });
  }

  Future<List<CachedConversation>> getAllConversations() async {
    return (select(cachedConversations)
      ..orderBy([(t) => OrderingTerm.desc(t.lastMessageAt)]))
      .get();
  }

  Future<CachedConversation?> getConversationById(String id) async {
    return (select(cachedConversations)..where((t) => t.id.equals(id))).getSingleOrNull();
  }

  // ============================================================================
  // MESSAGES OPERATIONS
  // ============================================================================

  Future<void> cacheMessage(CachedMessagesCompanion message) async {
    await into(cachedMessages).insertOnConflictUpdate(message);
  }

  Future<void> cacheMessages(List<CachedMessagesCompanion> messages) async {
    await batch((batch) {
      for (final msg in messages) {
        batch.insert(cachedMessages, msg, onConflict: DoUpdate((_) => msg));
      }
    });
  }

  Future<List<CachedMessage>> getMessagesForConversation(String conversationId) async {
    return (select(cachedMessages)
      ..where((t) => t.conversationId.equals(conversationId))
      ..orderBy([(t) => OrderingTerm.asc(t.createdAt)]))
      .get();
  }

  Future<List<CachedMessage>> getPendingMessages() async {
    return (select(cachedMessages)..where((t) => t.isPending.equals(true))).get();
  }

  Future<void> markMessageSent(String id) async {
    await (update(cachedMessages)..where((t) => t.id.equals(id)))
      .write(const CachedMessagesCompanion(isPending: Value(false)));
  }

  Future<void> markMessageFailed(String id) async {
    await (update(cachedMessages)..where((t) => t.id.equals(id)))
      .write(const CachedMessagesCompanion(isPending: Value(false), isFailed: Value(true)));
  }

  // ============================================================================
  // APPLICATIONS OPERATIONS
  // ============================================================================

  Future<void> cacheApplication(CachedApplicationsCompanion application) async {
    await into(cachedApplications).insertOnConflictUpdate(application);
  }

  Future<void> cacheApplications(List<CachedApplicationsCompanion> applications) async {
    await batch((batch) {
      for (final app in applications) {
        batch.insert(cachedApplications, app, onConflict: DoUpdate((_) => app));
      }
    });
  }

  Future<List<CachedApplication>> getMyApplications(String candidateProfileId) async {
    return (select(cachedApplications)
      ..where((t) => t.candidateProfileId.equals(candidateProfileId))
      ..orderBy([(t) => OrderingTerm.desc(t.appliedAt)]))
      .get();
  }

  Future<bool> hasAppliedToJob(String candidateProfileId, String jobListingId) async {
    final count = await (select(cachedApplications)
      ..where((t) => t.candidateProfileId.equals(candidateProfileId))
      ..where((t) => t.jobListingId.equals(jobListingId)))
      .get();
    return count.isNotEmpty;
  }

  // ============================================================================
  // CANDIDATE PROFILE OPERATIONS
  // ============================================================================

  Future<void> cacheCandidateProfile(CachedCandidateProfilesCompanion profile) async {
    await into(cachedCandidateProfiles).insertOnConflictUpdate(profile);
  }

  Future<CachedCandidateProfile?> getCandidateProfileByUserId(String userId) async {
    return (select(cachedCandidateProfiles)..where((t) => t.userId.equals(userId))).getSingleOrNull();
  }

  Future<CachedCandidateProfile?> getCandidateProfileById(String id) async {
    return (select(cachedCandidateProfiles)..where((t) => t.id.equals(id))).getSingleOrNull();
  }

  // ============================================================================
  // RECRUITER PROFILE OPERATIONS
  // ============================================================================

  Future<void> cacheRecruiterProfile(CachedRecruiterProfilesCompanion profile) async {
    await into(cachedRecruiterProfiles).insertOnConflictUpdate(profile);
  }

  Future<CachedRecruiterProfile?> getRecruiterProfileByUserId(String userId) async {
    return (select(cachedRecruiterProfiles)..where((t) => t.userId.equals(userId))).getSingleOrNull();
  }

  Future<CachedRecruiterProfile?> getRecruiterProfileById(String id) async {
    return (select(cachedRecruiterProfiles)..where((t) => t.id.equals(id))).getSingleOrNull();
  }

  // ============================================================================
  // BASE PROFILE OPERATIONS
  // ============================================================================

  Future<void> cacheProfile(CachedProfilesCompanion profile) async {
    await into(cachedProfiles).insertOnConflictUpdate(profile);
  }

  Future<CachedProfile?> getProfileById(String id) async {
    return (select(cachedProfiles)..where((t) => t.id.equals(id))).getSingleOrNull();
  }

  // ============================================================================
  // SYNC QUEUE OPERATIONS
  // ============================================================================

  Future<int> addToSyncQueue({
    required String operationType,
    required String entityTable,
    required String recordId,
    required Map<String, dynamic> payload,
  }) async {
    return into(syncQueue).insert(SyncQueueCompanion.insert(
      operationType: operationType,
      entityTable: entityTable,
      recordId: recordId,
      payload: jsonEncode(payload),
      createdAt: DateTime.now(),
    ));
  }

  Future<List<SyncQueueData>> getPendingSyncOperations() async {
    return (select(syncQueue)
      ..where((t) => t.retryCount.isSmallerThanValue(5))
      ..orderBy([(t) => OrderingTerm.asc(t.createdAt)]))
      .get();
  }

  Future<void> markSyncAttempt(int id, {String? error}) async {
    // First get current retry count
    final current = await (select(syncQueue)..where((t) => t.id.equals(id))).getSingleOrNull();
    if (current == null) return;

    await (update(syncQueue)..where((t) => t.id.equals(id)))
      .write(SyncQueueCompanion(
        retryCount: Value(current.retryCount + 1),
        lastAttemptAt: Value(DateTime.now()),
        lastError: Value(error),
      ));
  }

  Future<void> removeSyncOperation(int id) async {
    await (delete(syncQueue)..where((t) => t.id.equals(id))).go();
  }

  Future<int> getPendingSyncCount() async {
    final count = await (selectOnly(syncQueue)
      ..addColumns([syncQueue.id.count()]))
      .getSingle();
    return count.read(syncQueue.id.count()) ?? 0;
  }

  // ============================================================================
  // METADATA OPERATIONS
  // ============================================================================

  Future<void> setMetadata(String key, String value) async {
    await into(appMetadata).insertOnConflictUpdate(AppMetadataCompanion.insert(
      key: key,
      value: value,
      updatedAt: DateTime.now(),
    ));
  }

  Future<String?> getMetadata(String key) async {
    final result = await (select(appMetadata)..where((t) => t.key.equals(key))).getSingleOrNull();
    return result?.value;
  }

  Future<DateTime?> getLastSyncTime(String tableName) async {
    final value = await getMetadata('last_sync_$tableName');
    if (value != null) {
      return DateTime.tryParse(value);
    }
    return null;
  }

  Future<void> setLastSyncTime(String tableName) async {
    await setMetadata('last_sync_$tableName', DateTime.now().toIso8601String());
  }
}
