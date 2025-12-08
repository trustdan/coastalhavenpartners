import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/models.dart';
import '../../data/repositories/repositories.dart';
import 'auth_provider.dart';

/// Provider for profile repository instance
final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  return ProfileRepository.instance;
});

/// Provider for current user's base profile
final currentProfileProvider = FutureProvider<Profile?>((ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) return null;

  final repo = ref.watch(profileRepositoryProvider);
  return repo.getCurrentProfile();
});

/// Provider for candidate profile (current user)
final candidateProfileProvider = FutureProvider<CandidateProfile?>((ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) return null;

  final repo = ref.watch(profileRepositoryProvider);
  return repo.getCurrentCandidateProfile();
});

/// Provider for recruiter profile (current user)
final recruiterProfileProvider = FutureProvider<RecruiterProfile?>((ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) return null;

  final repo = ref.watch(profileRepositoryProvider);
  return repo.getCurrentRecruiterProfile();
});

/// Provider for school profile (current user)
final schoolProfileProvider = FutureProvider<SchoolProfile?>((ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) return null;

  final repo = ref.watch(profileRepositoryProvider);
  return repo.getCurrentSchoolProfile();
});

/// Provider to check if profile is complete based on role
final isProfileCompleteProvider = FutureProvider<bool>((ref) async {
  final role = ref.watch(userRoleProvider);
  if (role == null) return false;

  switch (role) {
    case 'candidate':
      final profile = await ref.watch(candidateProfileProvider.future);
      return profile != null && profile.completionPercentage >= 50;
    case 'recruiter':
      final profile = await ref.watch(recruiterProfileProvider.future);
      return profile != null && profile.isApproved;
    case 'school_admin':
      final profile = await ref.watch(schoolProfileProvider.future);
      return profile != null && profile.isApproved;
    default:
      return false;
  }
});

/// Provider to check if user has a profile for their role
final hasRoleProfileProvider = FutureProvider<bool>((ref) async {
  final role = ref.watch(userRoleProvider);
  final user = ref.watch(currentUserProvider);
  if (role == null || user == null) return false;

  final repo = ref.watch(profileRepositoryProvider);

  switch (role) {
    case 'candidate':
      return repo.hasCandidateProfile(user.id);
    case 'recruiter':
      return repo.hasRecruiterProfile(user.id);
    case 'school_admin':
      return repo.hasSchoolProfile(user.id);
    default:
      return false;
  }
});

/// Provider family to get a candidate profile by ID
final candidateProfileByIdProvider = FutureProvider.family<CandidateProfile?, String>((ref, profileId) async {
  final repo = ref.watch(profileRepositoryProvider);
  return repo.getCandidateProfile(profileId);
});

/// Provider family to get a recruiter profile by ID
final recruiterProfileByIdProvider = FutureProvider.family<RecruiterProfile?, String>((ref, profileId) async {
  final repo = ref.watch(profileRepositoryProvider);
  return repo.getRecruiterProfile(profileId);
});
