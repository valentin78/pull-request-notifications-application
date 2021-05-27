import {Injectable} from '@angular/core';
import {BitbucketSettings} from '../models/bitbucketSettings';

@Injectable()
export class SettingsService {

  private settingsKey: string = 'bitbucket-notifications.settings.bitbucket';

  getBitbucketSettings() {
    return JSON.parse(window.localStorage.getItem(this.settingsKey) as string) || {};
  }

  saveBitbucketSettings(settings: BitbucketSettings) {
    window.localStorage.setItem(this.settingsKey, JSON.stringify(settings));
  }
}

