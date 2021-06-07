import {Injectable} from '@angular/core';
import {ExtensionSettings, PullRequest} from '../models/models';
import {PullRequestRole} from '../models/enums';

@Injectable()
export class DataService {

  private keys = {
    settings: 'bitbucket-notifications.settings',
    lastRunningTime: 'bitbucket-notifications.last-running-time',
    pullRequests: 'bitbucket-notifications.pull-requests'
  };

  getExtensionSettings(): ExtensionSettings {
    let settings = JSON.parse(window.localStorage.getItem(this.keys.settings) as string);

    return new ExtensionSettings(settings);
  }

  saveExtensionSettings(settings: ExtensionSettings) {
    window.localStorage.setItem(this.keys.settings, JSON.stringify(settings));
  }

  getPullRequests(role: PullRequestRole): PullRequest[] {
    return JSON.parse(window.localStorage.getItem(`${this.keys.pullRequests}.${role}`) as string) || [];
  }

  savePullRequests(role: PullRequestRole, values: PullRequest[]) {
    window.localStorage.setItem(`${this.keys.pullRequests}.${role}`, JSON.stringify(values));
  }

  getLastRunningTimestamp(): number {
    // return now - 1h, if last running time is not available
    return JSON.parse(window.localStorage.getItem(this.keys.lastRunningTime) as string) || (Date.now() - 60 * 60 * 1000);
  }

  saveLastRunningTimestamp(timestamp: number) {
    return window.localStorage.setItem(this.keys.lastRunningTime, JSON.stringify(timestamp));
  }
}

