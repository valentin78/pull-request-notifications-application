import {
  BitbucketCommentAction,
  PullRequestActivityAction,
  PullRequestRole,
  PullRequestState,
  PullRequestStatus
} from './enums';

export class ExtensionSettings {
  bitbucket?: BitbucketSettings = new BitbucketSettings();
  refreshIntervalInMinutes: number = 1;
  notifications: NotificationSettings = new NotificationSettings();

  constructor(data?: ExtensionSettings) {
    if (data) {
      Object.assign(this, data, {
        bitbucket: new BitbucketSettings(data.bitbucket),
        notifications: new NotificationSettings(data.notifications)
      });
    }
  }
}

export class NotificationSettings {
  browser = true;
  slack?: SlackSettings;
  events: NotificationEvents = new NotificationEvents();

  constructor(data?: NotificationSettings) {
    if (data) {
      Object.assign(this, data, {
        events: new NotificationEvents(data.events)
      });
    }
  }
}

export class NotificationEvents {
  pullRequestCreated = true;
  pullRequestStateChanged = true;
  commentAdded = true;

  constructor(data?: NotificationEvents) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

export class SlackSettings {
  token!: string;
  memberId!: string;
}

export class BitbucketSettings {
  url?: string;
  username?: string;
  userId?: number;
  token?: string;

  constructor(data?: BitbucketSettings) {
    if (data) {
      Object.assign(this, data);
    }
  }

  isValid() {
    return !!(this.url && this.username && this.token);
  }
}

export class BitbucketResponse<T> {
  size?: number;
  limit?: number;
  isLastPage?: boolean;
  values!: T[];
}

export class PullRequest {
  id!: number;
  version?: number;
  title!: string;
  description?: string;
  state!: PullRequestState;
  open!: boolean;
  closed!: boolean;

  createdDate!: Date;
  updatedDate!: Date;
  locked!: boolean;
  author!: PullRequestAuthor;

  reviewers!: PullRequestReviewer[];
  participants!: PullRequestParticipant[];
  properties!: Properties;
  links!: Links;

  fromRef!: PullRequestReference;
  toRef!: PullRequestReference;
  comments?: PullRequestActivity[];
}

export class PullRequestActivity {
  id!: number;
  createdDate!: number;
  user!: BitbucketUser;
  action!: PullRequestActivityAction;
  addedReviewers?: BitbucketUser[];
  removedReviewers?: BitbucketUser[];
  commentAction?: BitbucketCommentAction;
  comment?: BitbucketComment;
}

export class BitbucketComment {
  id!: number;
  author!: BitbucketUser;
  text!: string;
  // createdDate!: number;
  updatedDate!: number;

  // thread / replies
  comments?: BitbucketComment[];
}

export class Properties {
  mergeResult?: MergeResult;
  commentCount?: number;
}

export class MergeResult {
  // shows if PR approved
  current!: boolean;

  // CLEAN if PR doesn't have conflicts?
  outcome!: string;
}

export class BitbucketUser {
  name!: string;
  id!: number;
  displayName!: string;
  slug: string | undefined;
  links: Links | undefined;
}

export class Links {
  self!: [{ href: string }];
}

export class PullRequestParticipant {
  user!: BitbucketUser;
  role!: PullRequestRole;
  approved!: boolean;
  status!: PullRequestStatus;
}

export class PullRequestReviewer extends PullRequestParticipant {
  lastReviewedCommit: string | undefined;
}

export class PullRequestAuthor extends PullRequestParticipant {
}

export class PullRequestReference {
  displayId!: string;
  repository!: BitbucketRepository;
}

export class BitbucketRepository {
  name!: string;
  links!: Links;
  project!: BitbucketProject;
  slug!: string;
}

export class BitbucketProject {
  key!: string;
}

export class PullRequestIssue {
  key!: string;
  url!: string;
}

export class NotificationOptions {
  action!: PullRequestActivityAction;
  pullRequest!: PullRequest;
  comment?: BitbucketComment;
  activity?: PullRequestActivity;
}
