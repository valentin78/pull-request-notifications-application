import {Injectable} from '@angular/core';
import {DataService} from './data.service';
import {SlackClient} from './slackClient';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {NotificationOptions} from '../models/models';
import {PullRequestAction} from '../models/enums';

@Injectable()
export class NotificationService {

  constructor(private dataService: DataService) {
  }

  private requestPermission(): Promise<NotificationPermission> {
    if (Notification.permission !== 'denied') {
      return Notification.requestPermission();
    }

    return new Promise<NotificationPermission>(() => Notification.permission);
  }

  sendNotification(options: NotificationOptions) {
    let extensionSettings = this.dataService.getExtensionSettings();

    if (extensionSettings.notifications.browser) {
      this.requestPermission()
        .then(permission => {
          if (permission === 'granted') {

            let body = '';
            switch (options.action) {
              case PullRequestAction.Comment:
                body = ';';
                break;
              case PullRequestAction.Created:
                body = 'new pull request created';
                break;
            }

            const notification = new Notification(options.pullRequest.title, {
              icon: 'favicon.ico',
              body: body
            });
          }
        });
    }

    // check if slack is enabled
    if (extensionSettings.notifications.slack) {
      let slackClient = new SlackClient(extensionSettings.notifications.slack.token);
      slackClient
        .postMessage({
          channel: extensionSettings.notifications.slack.memberId,
          icon_url: `${options.pullRequest.author.user.links?.self[0].href}/avatar.png`,
          text: options.pullRequest.title
        })
        .pipe(
          catchError((error: any) => {
            this.setBadge({title: error.error, color: 'red', message: 'slack'});
            return throwError(error);
          }))
        .subscribe((data: any) => {
          if (!data.ok) {
            console.log(data);
            this.setBadge({title: data.error, color: 'red', message: 'slack'});
            throw data.error;
          }
        });
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
