/// Database enums matching Supabase schema
library;

/// User role enum
enum UserRole {
  candidate,
  recruiter,
  admin,
  schoolAdmin;

  String get value {
    switch (this) {
      case UserRole.candidate:
        return 'candidate';
      case UserRole.recruiter:
        return 'recruiter';
      case UserRole.admin:
        return 'admin';
      case UserRole.schoolAdmin:
        return 'school_admin';
    }
  }

  static UserRole fromString(String? value) {
    switch (value) {
      case 'candidate':
        return UserRole.candidate;
      case 'recruiter':
        return UserRole.recruiter;
      case 'admin':
        return UserRole.admin;
      case 'school_admin':
        return UserRole.schoolAdmin;
      default:
        return UserRole.candidate;
    }
  }
}

/// Candidate status enum
enum CandidateStatus {
  pendingVerification,
  verified,
  active,
  placed,
  rejected;

  String get value {
    switch (this) {
      case CandidateStatus.pendingVerification:
        return 'pending_verification';
      case CandidateStatus.verified:
        return 'verified';
      case CandidateStatus.active:
        return 'active';
      case CandidateStatus.placed:
        return 'placed';
      case CandidateStatus.rejected:
        return 'rejected';
    }
  }

  static CandidateStatus fromString(String? value) {
    switch (value) {
      case 'pending_verification':
        return CandidateStatus.pendingVerification;
      case 'verified':
        return CandidateStatus.verified;
      case 'active':
        return CandidateStatus.active;
      case 'placed':
        return CandidateStatus.placed;
      case 'rejected':
        return CandidateStatus.rejected;
      default:
        return CandidateStatus.pendingVerification;
    }
  }
}

/// Education level enum
enum EducationLevel {
  bachelors,
  masters,
  mba,
  phd,
  professional;

  String get value => name;

  String get displayName {
    switch (this) {
      case EducationLevel.bachelors:
        return "Bachelor's";
      case EducationLevel.masters:
        return "Master's";
      case EducationLevel.mba:
        return 'MBA';
      case EducationLevel.phd:
        return 'PhD';
      case EducationLevel.professional:
        return 'Professional';
    }
  }

  static EducationLevel fromString(String? value) {
    switch (value) {
      case 'bachelors':
        return EducationLevel.bachelors;
      case 'masters':
        return EducationLevel.masters;
      case 'mba':
        return EducationLevel.mba;
      case 'phd':
        return EducationLevel.phd;
      case 'professional':
        return EducationLevel.professional;
      default:
        return EducationLevel.bachelors;
    }
  }
}

/// Application status enum
enum ApplicationStatus {
  pending,
  reviewing,
  interviewed,
  accepted,
  rejected,
  withdrawn;

  String get value => name;

  String get displayName {
    switch (this) {
      case ApplicationStatus.pending:
        return 'Pending';
      case ApplicationStatus.reviewing:
        return 'Under Review';
      case ApplicationStatus.interviewed:
        return 'Interviewed';
      case ApplicationStatus.accepted:
        return 'Accepted';
      case ApplicationStatus.rejected:
        return 'Rejected';
      case ApplicationStatus.withdrawn:
        return 'Withdrawn';
    }
  }

  static ApplicationStatus fromString(String? value) {
    switch (value) {
      case 'pending':
        return ApplicationStatus.pending;
      case 'reviewing':
        return ApplicationStatus.reviewing;
      case 'interviewed':
        return ApplicationStatus.interviewed;
      case 'accepted':
        return ApplicationStatus.accepted;
      case 'rejected':
        return ApplicationStatus.rejected;
      case 'withdrawn':
        return ApplicationStatus.withdrawn;
      default:
        return ApplicationStatus.pending;
    }
  }
}

/// Job type enum
enum JobType {
  fullTime,
  internship,
  summerAnalyst,
  offCycle;

  String get value {
    switch (this) {
      case JobType.fullTime:
        return 'full_time';
      case JobType.internship:
        return 'internship';
      case JobType.summerAnalyst:
        return 'summer_analyst';
      case JobType.offCycle:
        return 'off_cycle';
    }
  }

  String get displayName {
    switch (this) {
      case JobType.fullTime:
        return 'Full Time';
      case JobType.internship:
        return 'Internship';
      case JobType.summerAnalyst:
        return 'Summer Analyst';
      case JobType.offCycle:
        return 'Off-Cycle';
    }
  }

  static JobType fromString(String? value) {
    switch (value) {
      case 'full_time':
        return JobType.fullTime;
      case 'internship':
        return JobType.internship;
      case 'summer_analyst':
        return JobType.summerAnalyst;
      case 'off_cycle':
        return JobType.offCycle;
      default:
        return JobType.fullTime;
    }
  }
}

/// Job listing status enum
enum JobListingStatus {
  draft,
  active,
  paused,
  closed,
  filled;

  String get value => name;

  String get displayName {
    switch (this) {
      case JobListingStatus.draft:
        return 'Draft';
      case JobListingStatus.active:
        return 'Active';
      case JobListingStatus.paused:
        return 'Paused';
      case JobListingStatus.closed:
        return 'Closed';
      case JobListingStatus.filled:
        return 'Filled';
    }
  }

  static JobListingStatus fromString(String? value) {
    switch (value) {
      case 'draft':
        return JobListingStatus.draft;
      case 'active':
        return JobListingStatus.active;
      case 'paused':
        return JobListingStatus.paused;
      case 'closed':
        return JobListingStatus.closed;
      case 'filled':
        return JobListingStatus.filled;
      default:
        return JobListingStatus.draft;
    }
  }
}

/// Bookmark status enum
enum BookmarkStatus {
  newBookmark,
  contacted,
  interviewing,
  offerExtended,
  hired,
  passed,
  notAFit;

  String get value {
    switch (this) {
      case BookmarkStatus.newBookmark:
        return 'new';
      case BookmarkStatus.contacted:
        return 'contacted';
      case BookmarkStatus.interviewing:
        return 'interviewing';
      case BookmarkStatus.offerExtended:
        return 'offer_extended';
      case BookmarkStatus.hired:
        return 'hired';
      case BookmarkStatus.passed:
        return 'passed';
      case BookmarkStatus.notAFit:
        return 'not_a_fit';
    }
  }

  String get displayName {
    switch (this) {
      case BookmarkStatus.newBookmark:
        return 'New';
      case BookmarkStatus.contacted:
        return 'Contacted';
      case BookmarkStatus.interviewing:
        return 'Interviewing';
      case BookmarkStatus.offerExtended:
        return 'Offer Extended';
      case BookmarkStatus.hired:
        return 'Hired';
      case BookmarkStatus.passed:
        return 'Passed';
      case BookmarkStatus.notAFit:
        return 'Not a Fit';
    }
  }

  static BookmarkStatus fromString(String? value) {
    switch (value) {
      case 'new':
        return BookmarkStatus.newBookmark;
      case 'contacted':
        return BookmarkStatus.contacted;
      case 'interviewing':
        return BookmarkStatus.interviewing;
      case 'offer_extended':
        return BookmarkStatus.offerExtended;
      case 'hired':
        return BookmarkStatus.hired;
      case 'passed':
        return BookmarkStatus.passed;
      case 'not_a_fit':
        return BookmarkStatus.notAFit;
      default:
        return BookmarkStatus.newBookmark;
    }
  }
}

/// Campaign status enum
enum CampaignStatus {
  draft,
  scheduled,
  sending,
  sent,
  completed;

  String get value => name;

  String get displayName {
    switch (this) {
      case CampaignStatus.draft:
        return 'Draft';
      case CampaignStatus.scheduled:
        return 'Scheduled';
      case CampaignStatus.sending:
        return 'Sending';
      case CampaignStatus.sent:
        return 'Sent';
      case CampaignStatus.completed:
        return 'Completed';
    }
  }

  static CampaignStatus fromString(String? value) {
    switch (value) {
      case 'draft':
        return CampaignStatus.draft;
      case 'scheduled':
        return CampaignStatus.scheduled;
      case 'sending':
        return CampaignStatus.sending;
      case 'sent':
        return CampaignStatus.sent;
      case 'completed':
        return CampaignStatus.completed;
      default:
        return CampaignStatus.draft;
    }
  }
}

/// Support message type enum
enum SupportMessageType {
  technicalSupport,
  feedback,
  verificationAppeal,
  documentIssue,
  accountAccess,
  other;

  String get value {
    switch (this) {
      case SupportMessageType.technicalSupport:
        return 'technical_support';
      case SupportMessageType.feedback:
        return 'feedback';
      case SupportMessageType.verificationAppeal:
        return 'verification_appeal';
      case SupportMessageType.documentIssue:
        return 'document_issue';
      case SupportMessageType.accountAccess:
        return 'account_access';
      case SupportMessageType.other:
        return 'other';
    }
  }

  String get displayName {
    switch (this) {
      case SupportMessageType.technicalSupport:
        return 'Technical Support';
      case SupportMessageType.feedback:
        return 'Feedback';
      case SupportMessageType.verificationAppeal:
        return 'Verification Appeal';
      case SupportMessageType.documentIssue:
        return 'Document Issue';
      case SupportMessageType.accountAccess:
        return 'Account Access';
      case SupportMessageType.other:
        return 'Other';
    }
  }

  static SupportMessageType fromString(String? value) {
    switch (value) {
      case 'technical_support':
        return SupportMessageType.technicalSupport;
      case 'feedback':
        return SupportMessageType.feedback;
      case 'verification_appeal':
        return SupportMessageType.verificationAppeal;
      case 'document_issue':
        return SupportMessageType.documentIssue;
      case 'account_access':
        return SupportMessageType.accountAccess;
      case 'other':
        return SupportMessageType.other;
      default:
        return SupportMessageType.other;
    }
  }
}

/// Support message status enum
enum SupportMessageStatus {
  newMessage,
  inProgress,
  resolved,
  spam;

  String get value {
    switch (this) {
      case SupportMessageStatus.newMessage:
        return 'new';
      case SupportMessageStatus.inProgress:
        return 'in_progress';
      case SupportMessageStatus.resolved:
        return 'resolved';
      case SupportMessageStatus.spam:
        return 'spam';
    }
  }

  String get displayName {
    switch (this) {
      case SupportMessageStatus.newMessage:
        return 'New';
      case SupportMessageStatus.inProgress:
        return 'In Progress';
      case SupportMessageStatus.resolved:
        return 'Resolved';
      case SupportMessageStatus.spam:
        return 'Spam';
    }
  }

  static SupportMessageStatus fromString(String? value) {
    switch (value) {
      case 'new':
        return SupportMessageStatus.newMessage;
      case 'in_progress':
        return SupportMessageStatus.inProgress;
      case 'resolved':
        return SupportMessageStatus.resolved;
      case 'spam':
        return SupportMessageStatus.spam;
      default:
        return SupportMessageStatus.newMessage;
    }
  }
}

/// Support message source enum
enum SupportMessageSource {
  web,
  mobile,
  api;

  String get value => name;

  static SupportMessageSource fromString(String? value) {
    switch (value) {
      case 'web':
        return SupportMessageSource.web;
      case 'mobile':
        return SupportMessageSource.mobile;
      case 'api':
        return SupportMessageSource.api;
      default:
        return SupportMessageSource.web;
    }
  }
}
