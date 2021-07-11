import {Injectable} from '@angular/core';
import {ExtensionSettings, PullRequest} from '../models/models';
import {PullRequestRole} from '../models/enums';

@Injectable()
export class DataService {

  private keys = {
    settings: 'bitbucket-notifications.settings',
    lastRunningTime: 'bitbucket-notifications.last-running-time',
    snoozeSettings: 'bitbucket-notifications.snooze-settings',
    pullRequests: 'bitbucket-notifications.pull-requests'
  };

  getExtensionSettings(): ExtensionSettings {
    let settings = JSON.parse(localStorage.getItem(this.keys.settings) as string);

    return new ExtensionSettings(settings);
  }

  saveExtensionSettings(settings: ExtensionSettings) {
    localStorage.setItem(this.keys.settings, JSON.stringify(settings));
  }

  getPullRequests(role: PullRequestRole): PullRequest[] {
    return JSON.parse(localStorage.getItem(`${this.keys.pullRequests}.${role}`) as string) || [];
  }

  savePullRequests(role: PullRequestRole, values: PullRequest[]) {
    localStorage.setItem(`${this.keys.pullRequests}.${role}`, JSON.stringify(values));
  }

  getLastDataFetchingTimestamp(): number {
    // return now - 1h, if last running time is not available
    return JSON.parse(localStorage.getItem(this.keys.lastRunningTime) as string) || (Date.now() - 60 * 60 * 1000);
  }

  saveLastDataFetchingTimestamp(timestamp: number) {
    return localStorage.setItem(this.keys.lastRunningTime, JSON.stringify(timestamp));
  }

  getNotificationSnoozeSettings(): number[] {
    return JSON.parse(localStorage.getItem(this.keys.snoozeSettings) as string) || [];
  }

  saveNotificationSnoozeSettings(settings: number[]) {
    return localStorage.setItem(this.keys.snoozeSettings, JSON.stringify(settings));
  }
}

