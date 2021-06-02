import {Injectable} from '@angular/core';
import {DataService} from './data.service';
import {SlackClient} from './slackClient';
import {ExtensionSettings} from '../models/models';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';

@Injectable()
export class NotificationService {
  private readonly slackClient?: SlackClient;
  private readonly extensionSettings: ExtensionSettings;

  constructor(dataService: DataService) {
    this.extensionSettings = dataService.getExtensionSettings();
    if (this.extensionSettings.notifications.slack) {
      this.slackClient = new SlackClient(this.extensionSettings.notifications.slack.token);
    }
  }

  private requestPermission(): Promise<NotificationPermission> {
    if (Notification.permission !== 'denied') {
      return Notification.requestPermission();
    }

    return new Promise<NotificationPermission>(() => Notification.permission);
  }

  sendNotification(title: string, options: NotificationOptions) {
    if (this.extensionSettings.notifications.browser) {
      this.requestPermission()
        .then(permission => {
          if (permission === 'granted') {
            options.icon = options.icon || 'favicon.ico';
            const notification = new Notification(title, options);
          }
        });
    }

    // check if slack is enabled
    if (this.slackClient && this.extensionSettings.notifications.slack) {
      this.slackClient
        .postMessage({
          channel: this.extensionSettings.notifications.slack.token,
          text: title
        })
        .pipe(
          catchError((error: any) => {
            this.setBadge({title: error.error, color: 'red', message: 'slack'});
            return throwError(error);
          }))
        .subscribe();
    }
  }

  setBadge(options: { title?: string, message?: string, color?: string }) {
    if (options.message) {
      // @ts-ignore
      chrome.browserAction.setBadgeText({text: options.message});
    }

    if (options.color) {
      // @ts-ignore
      chrome.browserAction.setBadgeBackgroundColor({color: options.color});
    }

    if (options.title) {
      // @ts-ignore
      chrome.browserAction.setTitle({title: options.title});
    }
  }
}
