import {Injectable} from '@angular/core';
import {BitbucketResponse, BitbucketUser, ExtensionSettings, PullRequest} from '../models/models';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DataService} from './data.service';
import {PullRequestRole, PullRequestState} from '../models/enums';
import {map} from 'rxjs/operators';

@Injectable()
export class BitbucketService {
  private settings: ExtensionSettings;
  private readonly headers: { Authorization: string };

  constructor(private http: HttpClient, settings: DataService) {
    this.settings = settings.getExtensionSettings();
    this.headers = {'Authorization': `Bearer + ${this.settings.bitbucket?.token}`};
  }

  validateCredentials(url?: string, token?: string, userSlug?: string): Observable<BitbucketUser> {
    return this.http.get(
      `${url}/rest/api/latest/users/${userSlug}`,
      {headers: {'Authorisation': `Bearer + ${token}`}})
      .pipe(
        map((data) => data as BitbucketUser)
      );
  }

  getPullRequests(role: PullRequestRole): Observable<BitbucketResponse<PullRequest>> {
    // normally participant shouldn't be assigned to more than 50 PRs
    // todo: https://bitbucket.teamvelocityonline.com/rest/api/latest/dashboard/pull-requests?limit=50&state=OPEN
    return this.http.get(
      `${this.settings.bitbucket?.url}/rest/api/latest/inbox/pull-requests?role=${role}&limit=50`,
      {headers: this.headers})
      .pipe(
        map((data) => data as BitbucketResponse<PullRequest>)
      );
  }

  getAllPullRequests(state?: PullRequestState): Observable<BitbucketResponse<PullRequest>> {
    return this.http.get(
      `${this.settings.bitbucket?.url}/rest/api/latest/dashboard/pull-requests?state=${state}&limit=100`,
      {headers: this.headers})
      .pipe(
        map((data) => data as BitbucketResponse<PullRequest>)
      );
  }

  getPullRequestActivities(projectKey: string, repositorySlug: string, pullRequestId: number) {
    return this.http.get(
      `${this.settings.bitbucket?.url}/rest/api/latest/projects/${projectKey}/repos/${repositorySlug}/pull-requests/${pullRequestId}/activities?limit=100`,
      {headers: this.headers}
    );
  }
}


