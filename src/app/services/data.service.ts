import {Injectable} from '@angular/core';
import {BitbucketSettings, PullRequest} from '../models/models';
import {PullRequestRole} from '../models/enums';

@Injectable()
export class DataService {

  private settingsKey: string = 'bitbucket-notifications.settings.bitbucket';

  getBitbucketSettings() {
    return JSON.parse(window.localStorage.getItem(this.settingsKey) as string) || {};
  }

  saveBitbucketSettings(settings: BitbucketSettings) {
    window.localStorage.setItem(this.settingsKey, JSON.stringify(settings));
  }

  getPullRequests(role: PullRequestRole) {
    return JSON.parse(window.localStorage.getItem(`pull-requests.${role}`) as string) || {};
  }

  savePullRequests(role: PullRequestRole, values: PullRequest[]) {
    window.localStorage.setItem(`pull-requests.${role}`, JSON.stringify(values));
  }
}

