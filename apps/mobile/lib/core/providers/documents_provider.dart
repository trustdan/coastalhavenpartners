import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/models.dart';
import '../../data/repositories/repositories.dart';
import 'auth_provider.dart';

/// Provider for documents repository instance
final documentsRepositoryProvider = Provider<DocumentsRepository>((ref) {
  return DocumentsRepository.instance;
});

/// Provider for current user's resumes
final resumesProvider = FutureProvider<List<CandidateResume>>((ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) return [];

  final repo = ref.watch(documentsRepositoryProvider);
  return repo.getResumes();
});

/// Provider for current user's transcripts
final transcriptsProvider = FutureProvider<List<CandidateTranscript>>((ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) return [];

  final repo = ref.watch(documentsRepositoryProvider);
  return repo.getTranscripts();
});

/// Provider for the default resume
final defaultResumeProvider = FutureProvider<CandidateResume?>((ref) async {
  final resumes = await ref.watch(resumesProvider.future);
  if (resumes.isEmpty) return null;

  // Find the default resume, or return the first one
  return resumes.firstWhere(
    (r) => r.isDefault,
    orElse: () => resumes.first,
  );
});

/// Provider family to get a single resume by ID
final resumeByIdProvider = FutureProvider.family<CandidateResume?, String>((ref, resumeId) async {
  final repo = ref.watch(documentsRepositoryProvider);
  return repo.getResume(resumeId);
});

/// Provider family to get a single transcript by ID
final transcriptByIdProvider = FutureProvider.family<CandidateTranscript?, String>((ref, transcriptId) async {
  final repo = ref.watch(documentsRepositoryProvider);
  return repo.getTranscript(transcriptId);
});

/// Provider to get transcripts grouped by education level
final transcriptsByEducationLevelProvider = FutureProvider<Map<EducationLevel, List<CandidateTranscript>>>((ref) async {
  final transcripts = await ref.watch(transcriptsProvider.future);

  final grouped = <EducationLevel, List<CandidateTranscript>>{};
  for (final transcript in transcripts) {
    grouped.putIfAbsent(transcript.educationLevel, () => []).add(transcript);
  }

  return grouped;
});
