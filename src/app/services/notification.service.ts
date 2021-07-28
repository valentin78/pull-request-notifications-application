import {Injectable} from '@angular/core';
import {DataService} from './data.service';
import {SlackClient, SlackMessageOptions} from './slackClient';
import {catchError} from 'rxjs/operators';
import {from, Observable, of, throwError} from 'rxjs';
import {NotificationOptions, PullRequestIssue} from '../models/models';
import {BitbucketService} from './bitbucket.service';
import {PullRequestActivityAction} from '../models/enums';
import {GetSlackNotificationTitle, GetWindowsNotificationBody} from '../other/notification.titles';

@Injectable()
export class NotificationService {

  constructor(private dataService: DataService, private bitbucketService: BitbucketService) {
  }

  public requestPermission(): Observable<NotificationPermission> {
    if (Notification.permission !== 'denied') {
      return from(Notification.requestPermission());
    }

    return of(Notification.permission);
  }

  sendNotification(options: NotificationOptions) {

    // skip notification if it is snoozed for this PR
    let snoozeSettings = this.dataService.getNotificationSnoozeSettings();
    if (snoozeSettings.includes(options.pullRequest.id)) {
      return;
    }

    let extensionSettings = this.dataService.getExtensionSettings();

    if (extensionSettings.notifications.browser) {
      this.requestPermission()
        .subscribe(permission => {
          if (permission === 'granted') {
            let body = GetWindowsNotificationBody(options.action);

            new Notification(options.pullRequest.title, {
              icon: 'favicon.ico',
              body: body
            });
          }
        });
    }

    // check if slack is enabled
    if (extensionSettings.notifications.slack) {
      let slackSettings = extensionSettings.notifications.slack;
      let slackClient = new SlackClient(slackSettings.token);

      // todo: pull connected issues from:
      let pr = options.pullRequest;
      this.bitbucketService
        .getPullRequestIssues(pr.fromRef.repository.project.key, pr.fromRef.repository.slug, pr.id)
        .pipe(catchError(() => of([])))
        .subscribe(issues => {
          let messageOptions = NotificationService.buildPullRequestSlackMessage(slackSettings.memberId, options, issues);

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

  public static buildPullRequestSlackMessage(memberId: string, options: NotificationOptions, issues: PullRequestIssue[]): SlackMessageOptions {
    let title = GetSlackNotificationTitle(options);
    let data = options.pullRequest;

    let message: SlackMessageOptions = {
      channel: memberId,
      text: title,
      blocks: []
    };

    // add title with PR link
    // todo: use link to the comment for Commented action
    message.blocks?.push({
      'type': 'section',
      'text': {
        'type': 'mrkdwn',
        'text': `${title}: *<${data.links.self[0].href}|${data.title}>*`
      }
    });

    // add comment
    if (options.action == PullRequestActivityAction.Commented) {
      message.blocks?.push({
        'type': 'section',
        'text': {
          'type': 'mrkdwn',
          'text': `_${options.comment?.text}_`
        }
      });
    }

    // add description
    let descriptionMaxLength = 50;
    if (data.description?.length) {
      let prDescription: string;
      if (options.action === PullRequestActivityAction.Opened) {
        // use longer description for just created PR
        descriptionMaxLength = 200;
      }
      let spaceIndex = data.description.indexOf(' ', descriptionMaxLength);
      prDescription = data.description.length > descriptionMaxLength && spaceIndex > descriptionMaxLength
        ? (data.description.substr(0, spaceIndex + 1)) + '...'
        : data.description;

      message.blocks?.push({
        'type': 'section',
        'text': {
          'type': 'mrkdwn',
          'text': `*Description:*\n${prDescription}\n`
        }
      });
    }

    // add issues
    if (issues.length) {
      message.blocks?.push({
        'type': 'section',
        'text': {
          'type': 'mrkdwn',
          'text': `*Issues:* ${issues.map(i => `<${i.url}|${i.key}>`).join(', ')}`
        }
      });
    }

    // add context
    message.blocks?.push({
      'type': 'context',
      'elements': [
        {
          'text':
            `*PR created by <${data.author.user.links?.self[0].href}|${data.author.user.displayName}>` +
            ` at ${new Date(data.createdDate).toDateString()}*` +
            ` | <${data.fromRef.repository.links?.self[0].href}|${data.fromRef.repository.name}>` +
            ` \`${data.toRef.displayId}\`` +
            `${data.properties.commentCount ? (` :memo:${data.properties.commentCount}`) : ''}`,
          'type': 'mrkdwn'
        }
      ]
    });

    message.blocks?.push({'type': 'divider'});
    return message;
  }
}
