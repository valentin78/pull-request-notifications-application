import {HttpClient, HttpHeaders} from '@angular/common/http';
import {inject} from '@angular/core';
import {SlackMessageOptions} from '../models/slack-client.models';
import {DataService} from './data.service';
import {SlackSettings} from '../models/models';

export const SLACK_API_URL = 'https://slack.com/api';

export class SlackClientService {
  private _http = inject(HttpClient);
  private _settingsService = inject(DataService);

  private _slackApiUrl: string = SLACK_API_URL;
  private _slackSettings?: SlackSettings;

  constructor() {
    this._settingsService.getExtensionSettings().then(settings => {
      this._slackSettings = settings.notifications.slack || new SlackSettings();
    });
  }

  private getHeaders(token?: string): HttpHeaders | { [p: string]: string | string[] } {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8'
    };
  }

  public testAuth(token: string) {
    return this._http.post(
      `${this._slackApiUrl}/auth.test`,
      undefined,
      {headers: this.getHeaders(token)});
  }

  public postMessage(options: SlackMessageOptions) {
    return this._http.post(
      `${this._slackApiUrl}/chat.postMessage`,
      options,
      {headers: this.getHeaders(this._slackSettings?.token)});
  }
}
