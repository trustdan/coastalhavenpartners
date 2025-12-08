import 'dart:convert';
import 'package:drift/drift.dart';
import '../models/models.dart';
import 'database.dart';

/// Converters between Drift cached models and Freezed domain models
/// These handle the bidirectional mapping for offline support

// =============================================================================
// FIRMS
// =============================================================================

extension FirmConverter on Firm {
  /// Convert Firm to Drift companion for caching
  CachedFirmsCompanion toCacheCompanion() {
    return CachedFirmsCompanion.insert(
      id: id,
      name: name,
      slug: slug,
      description: Value(description),
      logoUrl: Value(logoUrl),
      firmType: Value(firmType),
      website: Value(website),
      locations: Value(locations != null ? jsonEncode(locations) : null),
      employeeCount: Value(employeeCount),
      foundedYear: Value(foundedYear),
      culture: Value(culture),
      hiringRoles: Value(hiringRoles != null ? jsonEncode(hiringRoles) : null),
      isVisible: Value(isVisible),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      cachedAt: DateTime.now(),
    );
  }
}

extension CachedFirmConverter on CachedFirm {
  /// Convert cached firm to domain model
  Firm toFirm() {
    return Firm(
      id: id,
      name: name,
      slug: slug,
      description: description,
      logoUrl: logoUrl,
      firmType: firmType,
      website: website,
      locations: locations != null
          ? (jsonDecode(locations!) as List).cast<String>()
          : null,
      employeeCount: employeeCount,
      foundedYear: foundedYear,
      culture: culture,
      hiringRoles: hiringRoles != null
          ? (jsonDecode(hiringRoles!) as List).cast<String>()
          : null,
      isVisible: isVisible,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}

// =============================================================================
// JOB LISTINGS
// =============================================================================

extension JobListingConverter on JobListing {
  /// Convert JobListing to Drift companion for caching
  CachedJobListingsCompanion toCacheCompanion() {
    return CachedJobListingsCompanion.insert(
      id: id,
      title: title,
      slug: slug,
      description: description,
      firmId: firmId,
      postedBy: postedBy,
      jobType: jobType.value,
      status: status.value,
      locations: Value(locations != null ? jsonEncode(locations) : null),
      compensationRange: Value(compensationRange),
      requirements: Value(requirements),
      responsibilities: Value(responsibilities),
      applicationInstructions: Value(applicationInstructions),
      externalUrl: Value(externalUrl),
      minGpa: Value(minGpa),
      targetGradYears: Value(
          targetGradYears != null ? jsonEncode(targetGradYears) : null),
      targetRoles:
          Value(targetRoles != null ? jsonEncode(targetRoles) : null),
      targetSchools:
          Value(targetSchools != null ? jsonEncode(targetSchools) : null),
      viewCount: Value(viewCount),
      applicationCount: Value(applicationCount),
      isFeatured: Value(isFeatured),
      applicationDeadline: Value(applicationDeadline),
      startDate: Value(startDate),
      publishedAt: Value(publishedAt),
      closedAt: Value(closedAt),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      cachedAt: DateTime.now(),
    );
  }
}

extension CachedJobListingConverter on CachedJobListing {
  /// Convert cached job listing to domain model
  JobListing toJobListing({Firm? firm}) {
    return JobListing(
      id: id,
      title: title,
      slug: slug,
      description: description,
      firmId: firmId,
      postedBy: postedBy,
      jobType: JobType.fromString(jobType),
      status: JobListingStatus.fromString(status),
      locations: locations != null
          ? (jsonDecode(locations!) as List).cast<String>()
          : null,
      compensationRange: compensationRange,
      requirements: requirements,
      responsibilities: responsibilities,
      applicationInstructions: applicationInstructions,
      externalUrl: externalUrl,
      minGpa: minGpa,
      targetGradYears: targetGradYears != null
          ? (jsonDecode(targetGradYears!) as List).cast<int>()
          : null,
      targetRoles: targetRoles != null
          ? (jsonDecode(targetRoles!) as List).cast<String>()
          : null,
      targetSchools: targetSchools != null
          ? (jsonDecode(targetSchools!) as List).cast<String>()
          : null,
      viewCount: viewCount,
      applicationCount: applicationCount,
      isFeatured: isFeatured,
      applicationDeadline: applicationDeadline,
      startDate: startDate,
      publishedAt: publishedAt,
      closedAt: closedAt,
      createdAt: createdAt,
      updatedAt: updatedAt,
      firm: firm,
    );
  }
}

// =============================================================================
// CONVERSATIONS
// =============================================================================

extension ConversationConverter on Conversation {
  /// Convert Conversation to Drift companion for caching
  CachedConversationsCompanion toCacheCompanion() {
    return CachedConversationsCompanion.insert(
      id: id,
      candidateId: Value(candidateId),
      recruiterId: Value(recruiterId),
      lastMessageAt: Value(lastMessageAt),
      createdAt: Value(createdAt),
      candidateProfileJson: Value(
          candidateProfile != null ? jsonEncode(candidateProfile!.toJson()) : null),
      recruiterProfileJson: Value(
          recruiterProfile != null ? jsonEncode(recruiterProfile!.toJson()) : null),
      lastMessageJson:
          Value(lastMessage != null ? jsonEncode(lastMessage!.toJson()) : null),
      unreadCount: Value(unreadCount),
      cachedAt: DateTime.now(),
    );
  }
}

extension CachedConversationConverter on CachedConversation {
  /// Convert cached conversation to domain model
  Conversation toConversation() {
    return Conversation(
      id: id,
      candidateId: candidateId,
      recruiterId: recruiterId,
      lastMessageAt: lastMessageAt,
      createdAt: createdAt,
      candidateProfile: candidateProfileJson != null
          ? CandidateProfile.fromJson(
              jsonDecode(candidateProfileJson!) as Map<String, dynamic>)
          : null,
      recruiterProfile: recruiterProfileJson != null
          ? RecruiterProfile.fromJson(
              jsonDecode(recruiterProfileJson!) as Map<String, dynamic>)
          : null,
      lastMessage: lastMessageJson != null
          ? Message.fromJson(
              jsonDecode(lastMessageJson!) as Map<String, dynamic>)
          : null,
      unreadCount: unreadCount,
    );
  }
}

// =============================================================================
// MESSAGES
// =============================================================================

extension MessageConverter on Message {
  /// Convert Message to Drift companion for caching
  CachedMessagesCompanion toCacheCompanion() {
    return CachedMessagesCompanion.insert(
      id: id,
      conversationId: conversationId,
      senderId: senderId,
      content: content,
      readAt: Value(readAt),
      createdAt: Value(createdAt),
      isPending: Value(isPending),
      isFailed: Value(isFailed),
      cachedAt: DateTime.now(),
    );
  }
}

extension CachedMessageConverter on CachedMessage {
  /// Convert cached message to domain model
  Message toMessage() {
    return Message(
      id: id,
      conversationId: conversationId,
      senderId: senderId,
      content: content,
      readAt: readAt,
      createdAt: createdAt,
      isPending: isPending,
      isFailed: isFailed,
    );
  }
}

// =============================================================================
// APPLICATIONS
// =============================================================================

extension ApplicationConverter on Application {
  /// Convert Application to Drift companion for caching
  CachedApplicationsCompanion toCacheCompanion() {
    return CachedApplicationsCompanion.insert(
      id: id,
      candidateProfileId: candidateProfileId,
      jobListingId: Value(jobListingId),
      firmId: Value(firmId),
      status: status.value,
      coverLetter: coverLetter,
      outreachApproach: outreachApproach,
      snapshot: jsonEncode(snapshot),
      internalNotes: Value(internalNotes),
      reviewedBy: Value(reviewedBy),
      reviewedAt: Value(reviewedAt),
      appliedAt: Value(appliedAt),
      updatedAt: Value(updatedAt),
      jobListingJson: Value(
          jobListing != null ? jsonEncode(jobListing!.toJson()) : null),
      cachedAt: DateTime.now(),
    );
  }
}

extension CachedApplicationConverter on CachedApplication {
  /// Convert cached application to domain model
  Application toApplication() {
    return Application(
      id: id,
      candidateProfileId: candidateProfileId,
      jobListingId: jobListingId,
      firmId: firmId,
      status: ApplicationStatus.fromString(status),
      coverLetter: coverLetter,
      outreachApproach: outreachApproach,
      snapshot: jsonDecode(snapshot) as Map<String, dynamic>,
      internalNotes: internalNotes,
      reviewedBy: reviewedBy,
      reviewedAt: reviewedAt,
      appliedAt: appliedAt,
      updatedAt: updatedAt,
      jobListing: jobListingJson != null
          ? JobListing.fromJson(
              jsonDecode(jobListingJson!) as Map<String, dynamic>)
          : null,
    );
  }
}

// =============================================================================
// CANDIDATE PROFILES
// =============================================================================

extension CandidateProfileConverter on CandidateProfile {
  /// Convert CandidateProfile to Drift companion for caching
  CachedCandidateProfilesCompanion toCacheCompanion() {
    return CachedCandidateProfilesCompanion.insert(
      id: id,
      userId: Value(userId),
      schoolName: schoolName,
      major: major,
      gpa: gpa,
      graduationYear: graduationYear,
      undergradDegreeType: Value(undergradDegreeType),
      undergradSpecialty: Value(undergradSpecialty),
      educationLevel: Value(educationLevel?.value),
      gradSchool: Value(gradSchool),
      gradMajor: Value(gradMajor),
      gradGpa: Value(gradGpa),
      gradGraduationYear: Value(gradGraduationYear),
      gradDegreeType: Value(gradDegreeType),
      gradSpecialty: Value(gradSpecialty),
      bio: Value(bio),
      resumeUrl: Value(resumeUrl),
      transcriptUrl: Value(transcriptUrl),
      schedulingUrl: Value(schedulingUrl),
      targetRoles:
          Value(targetRoles != null ? jsonEncode(targetRoles) : null),
      preferredLocations: Value(
          preferredLocations != null ? jsonEncode(preferredLocations) : null),
      tags: Value(tags != null ? jsonEncode(tags) : null),
      status: Value(status?.value),
      emailVerified: Value(emailVerified),
      schoolVerified: Value(schoolVerified),
      gpaVerified: Value(gpaVerified),
      resumeVerified: Value(resumeVerified),
      transcriptVerified: Value(transcriptVerified),
      isRejected: Value(isRejected),
      visibleFieldsToRecruiters: Value(visibleFieldsToRecruiters != null
          ? jsonEncode(visibleFieldsToRecruiters)
          : null),
      visibleFieldsToSchools: Value(visibleFieldsToSchools != null
          ? jsonEncode(visibleFieldsToSchools)
          : null),
      lastActivityAt: Value(lastActivityAt),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      profileJson:
          Value(profile != null ? jsonEncode(profile!.toJson()) : null),
      cachedAt: DateTime.now(),
    );
  }
}

extension CachedCandidateProfileConverter on CachedCandidateProfile {
  /// Convert cached candidate profile to domain model
  CandidateProfile toCandidateProfile() {
    return CandidateProfile(
      id: id,
      userId: userId,
      schoolName: schoolName,
      major: major,
      gpa: gpa,
      graduationYear: graduationYear,
      undergradDegreeType: undergradDegreeType,
      undergradSpecialty: undergradSpecialty,
      educationLevel: educationLevel != null
          ? EducationLevel.fromString(educationLevel)
          : null,
      gradSchool: gradSchool,
      gradMajor: gradMajor,
      gradGpa: gradGpa,
      gradGraduationYear: gradGraduationYear,
      gradDegreeType: gradDegreeType,
      gradSpecialty: gradSpecialty,
      bio: bio,
      resumeUrl: resumeUrl,
      transcriptUrl: transcriptUrl,
      schedulingUrl: schedulingUrl,
      targetRoles: targetRoles != null
          ? (jsonDecode(targetRoles!) as List).cast<String>()
          : null,
      preferredLocations: preferredLocations != null
          ? (jsonDecode(preferredLocations!) as List).cast<String>()
          : null,
      tags: tags != null ? (jsonDecode(tags!) as List).cast<String>() : null,
      status:
          status != null ? CandidateStatus.fromString(status) : null,
      emailVerified: emailVerified,
      schoolVerified: schoolVerified,
      gpaVerified: gpaVerified,
      resumeVerified: resumeVerified,
      transcriptVerified: transcriptVerified,
      isRejected: isRejected,
      visibleFieldsToRecruiters: visibleFieldsToRecruiters != null
          ? jsonDecode(visibleFieldsToRecruiters!) as Map<String, dynamic>
          : null,
      visibleFieldsToSchools: visibleFieldsToSchools != null
          ? jsonDecode(visibleFieldsToSchools!) as Map<String, dynamic>
          : null,
      lastActivityAt: lastActivityAt,
      createdAt: createdAt,
      updatedAt: updatedAt,
      profile: profileJson != null
          ? Profile.fromJson(jsonDecode(profileJson!) as Map<String, dynamic>)
          : null,
    );
  }
}

// =============================================================================
// RECRUITER PROFILES
// =============================================================================

extension RecruiterProfileConverter on RecruiterProfile {
  /// Convert RecruiterProfile to Drift companion for caching
  CachedRecruiterProfilesCompanion toCacheCompanion() {
    return CachedRecruiterProfilesCompanion.insert(
      id: id,
      userId: Value(userId),
      firmName: firmName,
      jobTitle: jobTitle,
      firmType: Value(firmType),
      firmId: Value(firmId),
      bio: Value(bio),
      linkedinUrl: Value(linkedinUrl),
      profilePhotoUrl: Value(profilePhotoUrl),
      companyWebsite: Value(companyWebsite),
      yearsExperience: Value(yearsExperience),
      specialties: Value(specialties != null ? jsonEncode(specialties) : null),
      locations: Value(locations != null ? jsonEncode(locations) : null),
      isApproved: Value(isApproved),
      isRejected: Value(isRejected),
      emailDomain: Value(emailDomain),
      emailDomainMatchesCompany: Value(emailDomainMatchesCompany),
      verificationNotes: Value(verificationNotes),
      isVisibleToCandidates: Value(isVisibleToCandidates),
      isVisibleToRecruiters: Value(isVisibleToRecruiters),
      isVisibleToSchools: Value(isVisibleToSchools),
      approvedAt: Value(approvedAt),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      profileJson: Value(profile != null ? jsonEncode(profile!.toJson()) : null),
      cachedAt: DateTime.now(),
    );
  }
}

extension CachedRecruiterProfileConverter on CachedRecruiterProfile {
  /// Convert cached recruiter profile to domain model
  RecruiterProfile toRecruiterProfile() {
    return RecruiterProfile(
      id: id,
      userId: userId,
      firmName: firmName,
      jobTitle: jobTitle,
      firmType: firmType,
      firmId: firmId,
      bio: bio,
      linkedinUrl: linkedinUrl,
      profilePhotoUrl: profilePhotoUrl,
      companyWebsite: companyWebsite,
      yearsExperience: yearsExperience,
      specialties: specialties != null
          ? (jsonDecode(specialties!) as List).cast<String>()
          : null,
      locations: locations != null
          ? (jsonDecode(locations!) as List).cast<String>()
          : null,
      isApproved: isApproved,
      isRejected: isRejected,
      emailDomain: emailDomain,
      emailDomainMatchesCompany: emailDomainMatchesCompany,
      verificationNotes: verificationNotes,
      isVisibleToCandidates: isVisibleToCandidates,
      isVisibleToRecruiters: isVisibleToRecruiters,
      isVisibleToSchools: isVisibleToSchools,
      approvedAt: approvedAt,
      createdAt: createdAt,
      updatedAt: updatedAt,
      profile: profileJson != null
          ? Profile.fromJson(jsonDecode(profileJson!) as Map<String, dynamic>)
          : null,
    );
  }
}

// =============================================================================
// BASE PROFILES
// =============================================================================

extension ProfileConverter on Profile {
  /// Convert Profile to Drift companion for caching
  CachedProfilesCompanion toCacheCompanion() {
    return CachedProfilesCompanion.insert(
      id: id,
      email: email,
      fullName: fullName,
      role: role.name,
      linkedinUrl: Value(linkedinUrl),
      phone: Value(phone),
      discordId: Value(discordId),
      discordUsername: Value(discordUsername),
      referralCode: Value(referralCode),
      isBanned: Value(isBanned),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      cachedAt: DateTime.now(),
    );
  }
}

extension CachedProfileConverter on CachedProfile {
  /// Convert cached profile to domain model
  Profile toProfile() {
    return Profile(
      id: id,
      email: email,
      fullName: fullName,
      role: UserRole.values.firstWhere(
        (r) => r.name == role,
        orElse: () => UserRole.candidate,
      ),
      linkedinUrl: linkedinUrl,
      phone: phone,
      discordId: discordId,
      discordUsername: discordUsername,
      referralCode: referralCode,
      isBanned: isBanned,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}
