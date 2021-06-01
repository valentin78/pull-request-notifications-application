import {PullRequestRole, PullRequestState, PullRequestStatus} from './enums';

export class ExtensionSettings {
  bitbucket: BitbucketSettings = new BitbucketSettings(undefined);
  refreshIntervalInMinutes: number = 1;

  constructor(data?: ExtensionSettings) {
    if (data) {
      Object.assign(this, data, {
        bitbucket: new BitbucketSettings(data.bitbucket)
      });
    }
  }
}

export class BitbucketSettings {
  url: string | undefined;
  username: string | undefined;
  token: string | undefined;

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
  size: number | undefined;
  limit: number | undefined;
  isLastPage: boolean | undefined;
  values!: T[];
}

export class PullRequest {
  id!: number;
  version: number | undefined;
  title!: string;
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
