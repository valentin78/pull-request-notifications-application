import {Injectable} from '@angular/core';
import {DataService} from './data.service';
import {SlackClient, SlackMessageOptions} from './slackClient';
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
                body = 'comment(s) added';
                break;
              case PullRequestAction.Created:
                body = 'new pull request created';
                break;
              case PullRequestAction.Approved:
                body = 'pull request approved';
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
      let messageOptions = this.buildPullRequestSlackMessage(slackSettings.memberId, options);

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

  private buildPullRequestSlackMessage(memberId: string, options: NotificationOptions): SlackMessageOptions {

    let title = '';
    let data = options.pullRequest;
    let spaceIndex = data.description?.indexOf(' ', 50) ?? 0;
    let prDescription = (data.description?.length ?? 0 > 50) && spaceIndex > 50
      ? (data.description?.substr(0, spaceIndex + 1)) + '...'
      : data.description;

    switch (options.action) {
      case PullRequestAction.Comment:
        title = `:memo: @${options.comment?.author.name} added new comment`;
        break;
      case PullRequestAction.Created:
        title = `:pull_request: @${options.pullRequest.author.user.name} assigned a new pull request`;
        break;
      case PullRequestAction.Approved:
        title = ':white_check_mark: Your pull request approved';
        break;
      default:
        title = `something happened: ${options.action}`;
        break;
    }

    let message = {
      channel: memberId,
      text: title,
      blocks: [
        {
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text': `${title}: *<${data.links.self[0].href}|${data.title}>*`
          }
        },
        {
          'type': 'divider'
        },
        {
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text':
              `*Description:*${prDescription ? ('\n' + prDescription) : ''}\n` +
              `*Repository:* <${data.fromRef.repository.links?.self[0].href}|${data.fromRef.repository.name}>`
          }
        },
        {
          'type': 'context',
          'elements': [
            {
              'text':
                `*${new Date(data.createdDate).toDateString()}*` +
                ` | <${data.author.user.links?.self[0].href}|${data.author.user.displayName}>` +
                ` | <${data.fromRef.repository.links?.self[0].href}|${data.fromRef.repository.name}>` +
                ` | \`${data.toRef.displayId}\`` +
                `${data.properties.commentCount ? (` :memo:${data.properties.commentCount}`) : ''}`,
              'type': 'mrkdwn'
            }
          ]
        }
      ]
    };

    if (options.action == PullRequestAction.Comment) {
      message.blocks.splice(1, 0, {
        'type': 'context',
        'elements': [
          {
            'type': 'mrkdwn',
            'text': `\`\`\`${options.comment?.text}\`\`\``
          }
        ]
      });
    }

    return message;
  }
}
