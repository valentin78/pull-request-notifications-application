import {inject, Injectable} from '@angular/core';
import {ExtensionSettings, PullRequest} from '../models/models';
import {PullRequestRole} from '../models/enums';
import {ApplicationService} from "./application.service";

/**
 * https://github.com/electron-userland/electron-json-storage
 */
@Injectable()
export class DataService {
  private _applicationService = inject(ApplicationService);

  private _keys = {
    settings: 'pull-request-notifications.settings',
    lastRunningTime: 'pull-request-notifications.last-running-time',
    snoozeSettings: 'pull-request-notifications.snooze-settings',
    pullRequests: 'pull-request-notifications.pull-requests'
  };

  private async loadDataByGet(key: string): Promise<any> {
    const settings = await this._applicationService.getSettings();
    return settings ? settings[key] : undefined;
  }

  private async storeDataByKey(key: string, data: any) {
    await this._applicationService.setSettings(key, data);
  }

  async getExtensionSettings(): Promise<ExtensionSettings> {
    let settings = await this.loadDataByGet(this._keys.settings);
    return new ExtensionSettings(settings);
  }

  public async saveExtensionSettings(settings: ExtensionSettings) {
    await this.storeDataByKey(this._keys.settings, settings);
  }

  public async getPullRequests(role: PullRequestRole): Promise<PullRequest[]> {
    return await this.loadDataByGet(`${this._keys.pullRequests}.${role}`) || [];
  }

  public async savePullRequests(role: PullRequestRole, values: PullRequest[]) {
    await this.storeDataByKey(`${this._keys.pullRequests}.${role}`, values);
  }

  public async getLastDataFetchingTimestamp(): Promise<number> {
    // return now - 1h, if last running time is not available
    return await this.loadDataByGet(this._keys.lastRunningTime) || (Date.now() - 60 * 60 * 1000);
  }

  public async saveLastDataFetchingTimestamp(timestamp: number) {
    return await this.storeDataByKey(this._keys.lastRunningTime, timestamp);
  }

  public async getNotificationSnoozeSettings(): Promise<number[]> {
    return await this.loadDataByGet(this._keys.snoozeSettings) || [];
  }

  public async saveNotificationSnoozeSettings(settings: number[]) {
    return await this.storeDataByKey(this._keys.snoozeSettings, settings);
  }
}

