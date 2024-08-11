import {inject, Injectable} from '@angular/core';
import {DataService} from './data.service';
import {catchError} from 'rxjs/operators';
import {from, Observable, of, throwError} from 'rxjs';
import {NotificationOptions} from '../models/models';
import {BitbucketService} from './bitbucket.service';
import {ApplicationService} from './application.service';
import {GetWindowsNotificationBody} from '../core/notification.titles';
import {SlackNotificationBuilder} from '../core/slack-notification.builder';
import {SlackClientService} from './slack-client.service';

@Injectable()
export class NotificationService {
  private dataService = inject(DataService);
  private bitbucketService = inject(BitbucketService);
  private _applicationService = inject(ApplicationService);
  private _slackClientService = inject(SlackClientService);

  public requestPermission(): Observable<NotificationPermission> {
    if (Notification.permission !== 'denied') {
      return from(Notification.requestPermission());
    }

    return of(Notification.permission);
  }

  sendBrowserNotification(title: string, body: string, clickUrl?: string) {
    this
      .requestPermission()
      .subscribe((permission: NotificationPermission) => {
        if (permission === 'granted') {
          let notification = new Notification(title, {
            icon: 'icon64.png',
            body: body
          });

          if (clickUrl) {
            notification.onclick = (event) => {
              // prevent the browser from focusing the Notification's tab
              event.preventDefault();
              this._applicationService.navigateTo(clickUrl);
            };
          }
        }
      });
  }

  async sendNotification(options: NotificationOptions) {
    // skip notification if it is snoozed for this PR
    let snoozeSettings = await this.dataService.getNotificationSnoozeSettings();
    if (snoozeSettings.includes(options.pullRequest.id)) {
      return;
    }

    let extensionSettings = await this.dataService.getExtensionSettings();
    if (extensionSettings.notifications.browser) {
      let body = GetWindowsNotificationBody(options.action);
      this.sendBrowserNotification(options.pullRequest.title, body, options.pullRequest.links.self[0].href);
    }

    // check if Slack is enabled
    if (extensionSettings.notifications.slack) {
      let slackSettings = extensionSettings.notifications.slack;

      let pr = options.pullRequest;
      this.bitbucketService
        .getPullRequestIssues(pr.fromRef.repository.project.key, pr.fromRef.repository.slug, pr.id)
        .pipe(catchError(() => of([])))
        .subscribe(issues => {
          let messageOptions = new SlackNotificationBuilder(slackSettings.memberId, options, issues).build();

          this._slackClientService
            .postMessage(messageOptions)
            .pipe(
              catchError((error: any) => {
                this.setBadge({title: error.error, color: 'red', message: 'slack'});
                return throwError(() => error);
              }))
            .subscribe((data: any) => {
              if (!data.ok) {
                console.log(data);
                this.setBadge({title: data.error, color: 'red', message: 'slack'});
                throw data.error;
              }
            });
        });
    }
  }

  setBadge(options: { title?: string, message?: string, color?: string }) {
    if (options.message) {
      // @ts-ignore
      chrome.browserAction?.setBadgeText({text: options.message});
    }

    if (options.color) {
      // @ts-ignore
      chrome.browserAction?.setBadgeBackgroundColor({color: options.color});
    }

    if (options.title) {
      // @ts-ignore
      chrome.browserAction?.setTitle({title: options.title});
    }
  }
}
