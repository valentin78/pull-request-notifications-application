import {Injectable} from '@angular/core';
import {BitbucketSettings} from '../models/bitbucketSettings';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SettingsService} from './settings.service';
import {PullRequestRole, PullRequestState, PullRequestStatus} from '../models/enums';
import {map} from 'rxjs/operators';

@Injectable()
export class BitbucketService {
  private settings: BitbucketSettings;
  private readonly headers: { Authorisation: string };

  constructor(private http: HttpClient, settings: SettingsService) {
    this.settings = settings.getBitbucketSettings();
    this.headers = {'Authorisation': `Bearer + ${this.settings.token}`};
  }

  getPullRequests(role: PullRequestRole): Observable<BitbucketResponse<PullRequest>> {
    // normally user shouldn't be assigned to more than 50 PRs
    return this.http.get(
      `${this.settings.url}/rest/api/latest/inbox/pull-requests?role=${role}&limit=50`,
      {headers: this.headers})
      .pipe(
        map((data) => data as BitbucketResponse<PullRequest>)
      );
  }

  getPullRequestActivities(projectKey: string, repositorySlug: string, pullRequestId: number) {
    return this.http.get(
      `${this.settings.url}/rest/api/latest/projects/${projectKey}/repos/${repositorySlug}/pull-requests/${pullRequestId}/activities?limit=100`,
      {headers: this.headers}
    );
  }
}

export class BitbucketResponse<T> {
  size: number | undefined;
  limit: number | undefined;
  isLastPage: boolean | undefined;
  values: T[] | undefined;
}

export class PullRequest {
  id: number | undefined;
  version: number | undefined;
  title: string | undefined;
  state: PullRequestState | undefined;
  open: boolean | undefined;
  closed: boolean | undefined;

  createdDate: Date | undefined;
  updatedDate: Date | undefined;
  locked: boolean | undefined;
  author: PullRequestAuthor | undefined;

  reviewers: [] | undefined;
  participants: [] | undefined;
  properties: any | undefined;
  links: { self: [{ href: string }] } | undefined;
}

export class PullRequestAuthor {
  user: BitbucketUser | undefined;
  role: PullRequestRole | undefined;
  approved: boolean | undefined;
  status: PullRequestStatus | undefined;
}

export class BitbucketUser {
  name: string | undefined;
  id: number | undefined;
  displayName: string | undefined;
  slug: string | undefined;
  links: Links | undefined;
}

export class Links {
  self: [{ href: string }] | undefined;
}

