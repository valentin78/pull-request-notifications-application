import {NotificationOptions, PullRequestIssue} from '../models/models';
import {GetSlackNotificationTitle} from './notification.titles';
import {PullRequestActivityAction} from '../models/enums';
import {SlackMessageOptions} from '../models/slack-client.models';

export class SlackNotificationBuilder {
  private readonly message: SlackMessageOptions;

  constructor(private memberId: string, private options: NotificationOptions, private issues: PullRequestIssue[]) {
    let title = GetSlackNotificationTitle(this.options);

    this.message = {
      channel: this.memberId,
      text: title,
      blocks: []
    };

    // add title with PR link
    // todo: use link to the comment for Commented action
    this.message.blocks?.push({
      'type': 'section',
      'text': {
        'type': 'mrkdwn',
        'text': `${title}: *<${options.pullRequest.links.self[0].href}|${options.pullRequest.title}>*`
      }
    });
  }

  private addComment() {
    if (this.options.action == PullRequestActivityAction.Commented) {
      this.message.blocks?.push({
        'type': 'section',
        'text': {
          'type': 'mrkdwn',
          'text': `_${this.options.comment?.text}_`
        }
      });
    }

    return this;
  }

  private addDescription() {
    let descriptionMaxLength = 50;
    if (this.options.pullRequest.description?.length) {
      let prDescription: string;
      if (this.options.action === PullRequestActivityAction.Opened) {
        // use longer description for just created PR
        descriptionMaxLength = 200;
      }

      // todo: fix description
      let spaceIndex = this.options.pullRequest.description.indexOf(' ', descriptionMaxLength);
      prDescription = this.options.pullRequest.description.length > descriptionMaxLength && spaceIndex > descriptionMaxLength
        ? (this.options.pullRequest.description.substr(0, spaceIndex + 1)) + '...'
        : this.options.pullRequest.description;

      this.message.blocks?.push({
        'type': 'section',
        'text': {
          'type': 'mrkdwn',
          'text': `*Description:*\n${prDescription}\n`
        }
      });
    }
    return this;
  }

  private addIssues() {
    if (this.issues.length) {
      this.message.blocks?.push({
        'type': 'section',
        'text': {
          'type': 'mrkdwn',
          'text': `*Issues:* ${this.issues.map(i => `<${i.url}|${i.key}>`).join(', ')}`
        }
      });
    }
    return this;
  }

  private addContext() {
    const data = this.options.pullRequest;
    this.message.blocks?.push({
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
    return this;
  }

  public build(): SlackMessageOptions {
    this
      .addComment()
      // .addDescription()
      .addIssues()
      .addContext();

    this.message.blocks?.push({'type': 'divider'});
    return this.message;
  }
}
