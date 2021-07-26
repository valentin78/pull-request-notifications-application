export enum PullRequestRole {
  Author = 'AUTHOR',
  Reviewer = 'REVIEWER',
  Participant = 'PARTICIPANT'
}

export enum PullRequestState {
  Open = 'OPEN',
  Closed = 'CLOSED'
}

export enum PullRequestStatus {
  Approved = 'APPROVED',
  Unapproved = 'UNAPPROVED',
  NeedsWork = 'NEEDS_WORK'
}

export enum PullRequestActivityAction {
  Opened = 'OPENED',
  Approved = 'APPROVED',
  Updated = 'UPDATED',
  Rescoped = 'RESCOPED',
  Commented = 'COMMENTED',
  Merged = 'MERGED',
  Declined = 'DECLINED',

  // virtual activity
  Removed = 'REMOVED',
  NeedsWork = 'NEEDS_WORK',
  Conflicted = 'CONFLICTED'
}

export enum BitbucketCommentAction {
  Added = 'ADDED'
}

export enum BitbucketMergeResultOutcome {
  Conflicted = 'CONFLICTED',
  Clean = 'CLEAN'
}
