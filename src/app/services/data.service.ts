import {inject, Injectable} from '@angular/core';
import {ExtensionSettings, PullRequest} from '../models/models';
import {PullRequestRole} from '../models/enums';
import {ApplicationService} from "./application.service";

@Injectable()
export class DataService {
  private _applicationService = inject(ApplicationService);

  private _keys = {
    settings: 'settings',
    lastRunningTime: 'last-running-time',
    snoozeSettings: 'snooze-settings',
    pullRequests: 'pull-requests'
  };

  private async loadDataByKet(key: string, defaultValue?: any): Promise<any> {
    const value = await this._applicationService.getSettings(key);
    return value ?? defaultValue;
  }

  private async storeDataByKey(key: string, data: any) {
    await this._applicationService.setSettings(key, data);
  }

  async getExtensionSettings(): Promise<ExtensionSettings> {
    let settings = await this.loadDataByKet(this._keys.settings);
    return new ExtensionSettings(settings);
  }

  public async saveExtensionSettings(settings: ExtensionSettings) {
    await this.storeDataByKey(this._keys.settings, settings);
  }

  public async getPullRequests(role: PullRequestRole): Promise<PullRequest[]> {
    return await this.loadDataByKet(`${this._keys.pullRequests}.${role}`, []);
  }

  public async savePullRequests(role: PullRequestRole, values: PullRequest[]) {
    await this.storeDataByKey(`${this._keys.pullRequests}.${role}`, values);
  }

  /**
   * return now - 1h, if last running time is not available
   */
  public async getLastDataFetchingTimestamp(): Promise<number> {
    return await this.loadDataByKet(this._keys.lastRunningTime, Date.now() - 60 * 60 * 1000);
  }

  public async saveLastDataFetchingTimestamp(timestamp: number) {
    return await this.storeDataByKey(this._keys.lastRunningTime, timestamp);
  }

  public async getNotificationSnoozeSettings(): Promise<number[]> {
    return await this.loadDataByKet(this._keys.snoozeSettings, []);
  }

  public async saveNotificationSnoozeSettings(settings: number[]) {
    return await this.storeDataByKey(this._keys.snoozeSettings, settings);
  }
}

