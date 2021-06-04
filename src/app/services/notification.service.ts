import {Injectable} from '@angular/core';
import {DataService} from './data.service';
import {SlackClient, SlackMessageOptions} from './slackClient';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {NotificationOptions, PullRequest} from '../models/models';
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
                body = 'comment(s) added';
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
      const slackSettings = extensionSettings.notifications.slack;
      let slackClient = new SlackClient(slackSettings.token);
      let messageOptions: SlackMessageOptions;
      switch (options.action) {
        case PullRequestAction.Created:
          messageOptions = this.buildNewPullRequestMessage(slackSettings.memberId, options.pullRequest);
          break;
        case PullRequestAction.Comment:
          messageOptions = {
            channel: slackSettings.memberId,
            text: 'new comment(s) added'
          };
          break;
        default:
          messageOptions = {
            channel: slackSettings.memberId,
            text: `something happened: ${options.action}`
          };
          break;
      }

      slackClient
        .postMessage(messageOptions)
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

  buildNewPullRequestMessage(channel: string, data: PullRequest): SlackMessageOptions {
    return {
      channel: channel,
      text: `You have a new pull request`,
      blocks: [
        {
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text': `You have a new pull request: *<${data.links.self[0].href}|${data.title}>*`
          }
        },
        {
          'type': 'divider'
        },
        {
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text': `*Description:*\n${data.description || '<empty>'}\n*Comments:* ${data.properties.commentCount || 0}\n*Repository:* <${data.fromRef.repository.links?.self[0].href}|${data.fromRef.repository.name}>`
          }
        },
        {
          'type': 'context',
          'elements': [
            {
              'text': `*${new Date(data.createdDate).toDateString()}* | <${data.author.user.links?.self[0].href}|${data.author.user.displayName}>`,
              'type': 'mrkdwn'
            }
          ]
        }
      ]
    };
  }
}
