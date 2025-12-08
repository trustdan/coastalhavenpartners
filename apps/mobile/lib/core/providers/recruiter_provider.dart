import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/models.dart';
import '../../data/repositories/repositories.dart';

/// Provider for recruiter repository instance
final recruiterRepositoryProvider = Provider<RecruiterRepository>((ref) {
  return RecruiterRepository.instance;
});

/// Search candidates with filters
final candidateSearchProvider = FutureProvider.family<List<CandidateProfile>, CandidateSearchFilters>((ref, filters) async {
  final repo = ref.watch(recruiterRepositoryProvider);
  return repo.searchCandidates(filters: filters);
});

/// Bookmarked candidates for current recruiter
final bookmarkedCandidatesProvider = FutureProvider<List<BookmarkedCandidate>>((ref) async {
  final repo = ref.watch(recruiterRepositoryProvider);
  return repo.getBookmarkedCandidates();
});

/// Check if a candidate is bookmarked
final isBookmarkedProvider = FutureProvider.family<bool, String>((ref, candidateId) async {
  final repo = ref.watch(recruiterRepositoryProvider);
  return repo.isBookmarked(candidateId);
});

/// Saved searches for current recruiter
final savedSearchesProvider = FutureProvider<List<SavedSearch>>((ref) async {
  final repo = ref.watch(recruiterRepositoryProvider);
  return repo.getSavedSearches();
});

/// Campaigns for current recruiter
final campaignsProvider = FutureProvider<List<RecruiterCampaign>>((ref) async {
  final repo = ref.watch(recruiterRepositoryProvider);
  return repo.getCampaigns();
});

/// Single campaign by ID
final campaignProvider = FutureProvider.family<RecruiterCampaign?, String>((ref, campaignId) async {
  final repo = ref.watch(recruiterRepositoryProvider);
  return repo.getCampaign(campaignId);
});

/// Campaign recipients
final campaignRecipientsProvider = FutureProvider.family<List<CampaignRecipient>, String>((ref, campaignId) async {
  final repo = ref.watch(recruiterRepositoryProvider);
  return repo.getCampaignRecipients(campaignId);
});

/// Notes on a candidate
final candidateNotesProvider = FutureProvider.family<List<RecruiterCandidateNote>, String>((ref, candidateId) async {
  final repo = ref.watch(recruiterRepositoryProvider);
  return repo.getCandidateNotes(candidateId);
});

/// Single candidate profile by ID
final candidateByIdProvider = FutureProvider.family<CandidateProfile?, String>((ref, candidateId) async {
  final repo = ref.watch(recruiterRepositoryProvider);
  return repo.getCandidateById(candidateId);
});

/// Current recruiter's profile with verification status
final currentRecruiterProfileProvider = FutureProvider<RecruiterProfile?>((ref) async {
  final repo = ref.watch(recruiterRepositoryProvider);
  return repo.getCurrentRecruiterProfile();
});
