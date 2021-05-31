import {Injectable} from '@angular/core';
import {ExtensionSettings, PullRequest} from '../models/models';
import {PullRequestRole} from '../models/enums';

@Injectable()
export class DataService {

  private keys = {
    settings: 'bitbucket-notifications.settings',
    pullRequests: 'bitbucket-notifications.pull-requests'
  };

  getExtensionSettings(): ExtensionSettings {
    let settings = JSON.parse(window.localStorage.getItem(this.keys.settings) as string);

    return settings || new ExtensionSettings();
  }

  saveExtensionSettings(settings: ExtensionSettings) {
    window.localStorage.setItem(this.keys.settings, JSON.stringify(settings));
  }

  getPullRequests(role: PullRequestRole) {
    return JSON.parse(window.localStorage.getItem(`${this.keys.pullRequests}.${role}`) as string) || {};
  }

  savePullRequests(role: PullRequestRole, values: PullRequest[]) {
    window.localStorage.setItem(`${this.keys.pullRequests}.${role}`, JSON.stringify(values));
  }
}

