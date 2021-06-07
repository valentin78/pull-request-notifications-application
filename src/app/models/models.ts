import {BitbucketCommentAction, PullRequestAction, PullRequestActivityAction, PullRequestRole, PullRequestState, PullRequestStatus} from './enums';

export class ExtensionSettings {
  bitbucket?: BitbucketSettings = new BitbucketSettings(undefined);
  refreshIntervalInMinutes: number = 1;
  notifications: { browser: boolean, slack?: SlackSettings } = {browser: true};

  constructor(data?: ExtensionSettings) {
    if (data) {
      Object.assign(this, data, {
        bitbucket: new BitbucketSettings(data.bitbucket)
      });
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
  mergeResult!: MergeResult;
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

export class NotificationOptions {
  action!: PullRequestAction;
  pullRequest!: PullRequest;
  comment?: BitbucketComment;
}
