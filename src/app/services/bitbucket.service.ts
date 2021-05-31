import {Injectable} from '@angular/core';
import {BitbucketResponse, ExtensionSettings, PullRequest} from '../models/models';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DataService} from './data.service';
import {PullRequestRole} from '../models/enums';
import {map} from 'rxjs/operators';

@Injectable()
export class BitbucketService {
  private settings: ExtensionSettings;
  private readonly headers: { Authorisation: string };

  constructor(private http: HttpClient, settings: DataService) {
    this.settings = settings.getExtensionSettings();
    this.headers = {'Authorisation': `Bearer + ${this.settings.bitbucket.token}`};
  }

  getPullRequests(role: PullRequestRole): Observable<BitbucketResponse<PullRequest>> {
    // normally participant shouldn't be assigned to more than 50 PRs
    return this.http.get(
      `${this.settings.bitbucket.url}/rest/api/latest/inbox/pull-requests?role=${role}&limit=50`,
      {headers: this.headers})
      .pipe(
        map((data) => data as BitbucketResponse<PullRequest>)
      );
  }

  getPullRequestActivities(projectKey: string, repositorySlug: string, pullRequestId: number) {
    return this.http.get(
      `${this.settings.bitbucket.url}/rest/api/latest/projects/${projectKey}/repos/${repositorySlug}/pull-requests/${pullRequestId}/activities?limit=100`,
      {headers: this.headers}
    );
  }
}


