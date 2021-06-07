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
  Unapproved = 'UNAPPROVED'
}

export enum PullRequestAction {
  Comment = 'comment',
  Created = 'created'
}

export enum PullRequestActivityAction {
  Opened = 'OPENED',
  Approved = 'APPROVED',
  Updated = 'UPDATED',
  Rescoped = 'RESCOPED',
  Commented = 'COMMENTED'
}


export enum BitbucketCommentAction {
  Added = 'ADDED'
}
