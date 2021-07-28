import {PullRequestActivityAction} from '../models/enums';
import {NotificationOptions} from '../models/models';

export function GetSlackNotificationTitle(options: NotificationOptions): string {
  // todo: move :reaction: names to settings
  let title;
  switch (options.action) {
    case PullRequestActivityAction.Commented:
      title = `:memo: @${options.comment?.author.name} added new comment`;
      break;
    case PullRequestActivityAction.Opened:
      title = `:pull_request: @${options.pullRequest.author.user.name} assigned you a new pull request`;
      break;
    case PullRequestActivityAction.Approved:
      title = ':white_check_mark: Your pull request approved';
      break;
    case PullRequestActivityAction.Merged:
      title = `:merged: @${options.activity?.user.name} merged pull request`;
      break;
    case PullRequestActivityAction.Declined:
      title = `:heavy_multiplication_x: @${options.activity?.user.name} declined pull request`;
      break;
    case PullRequestActivityAction.Removed:
      title = `:x: pull request was removed`;
      break;
    case PullRequestActivityAction.NeedsWork:
      title = `:construction_worker: pull request needs additional work`;
      break;
    case PullRequestActivityAction.Conflicted:
      title = `:collision: pull request got code conflicts`;
      break;
    default:
      title = `something happened with pull request: ${options.action}`;
      break;
  }

  return title;
}

export function GetWindowsNotificationBody(action: PullRequestActivityAction) {
  let body;
  switch (action) {
    case PullRequestActivityAction.Commented:
      body = 'comment(s) added';
      break;
    case PullRequestActivityAction.Opened:
      body = 'new pull request created';
      break;
    case PullRequestActivityAction.Approved:
      body = 'pull request approved';
      break;
    case PullRequestActivityAction.Merged:
      body = 'pull request merged';
      break;
    case PullRequestActivityAction.Declined:
      body = 'pull request declined';
      break;
    case PullRequestActivityAction.Removed:
      body = 'pull request removed';
      break;
    case PullRequestActivityAction.NeedsWork:
      body = 'pull request needs additional work';
      break;
    case PullRequestActivityAction.Conflicted:
      body = 'pull request got code conflicts';
      break;
  }

  return body;
}
