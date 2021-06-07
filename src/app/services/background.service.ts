import {EventEmitter, Injectable} from '@angular/core';
import {BitbucketService} from './bitbucket.service';
import {PullRequestAction, PullRequestRole, PullRequestState} from '../models/enums';
import {PullRequest} from '../models/models';
import {DataService} from './data.service';
import {NotificationService} from './notification.service';

@Injectable()
export class BackgroundService {
  timer?: number;
  interval: number;
  public dataProcessed!: EventEmitter<PullRequestRole>;

  constructor(
    private dataService: DataService,
    private bitbucketService: BitbucketService,
    private notificationService: NotificationService) {
    this.dataProcessed = new EventEmitter<PullRequestRole>(true);
    const settings = this.dataService.getExtensionSettings();
    this.interval = settings.refreshIntervalInMinutes;
  }

  doWork() {
    const settings = this.dataService.getExtensionSettings();
    if (!settings.bitbucket?.isValid()) {
      console.log('setup bitbucket settings first...');
      this.notificationService.setBadge({message: '404', color: 'red', title: 'missing settings'});
      return;
    }

    this.notificationService.setBadge({message: '...', title: 'loading...', color: 'gray'});
    const processingTime = new Date();
    this.bitbucketService
      .getAllPullRequests(PullRequestState.Open)
      .subscribe(data => {
        const authored = data.values.filter(v => v.author.user.name === settings.bitbucket?.username);
        const reviewing = data.values.filter(v => v.reviewers.some(r => r.user.name === settings.bitbucket?.username));
        const participant = data.values.filter(v => v.participants.some(r => r.user.name === settings.bitbucket?.username));

        this.handleResponse(PullRequestRole.Author, authored);
        this.handleResponse(PullRequestRole.Reviewer, reviewing);
        this.handleResponse(PullRequestRole.Participant, participant);

        this.notificationService.setBadge({
          message: `${authored.length + reviewing.length + participant.length}`,
          color: 'green',
          title: `authored: ${authored.length}\nreviewing: ${reviewing.length}\nparticipant: ${participant.length}\nlast update at ${processingTime.toLocaleTimeString()}`
        });

        this.dataProcessed.emit();
      });
  }

  handleResponse(role: PullRequestRole, values: PullRequest[]) {
    const before = this.dataService.getPullRequests(role);

    this.reviewCommentsCount(before, values);
    switch (role) {
      case PullRequestRole.Author:
        this.reviewMissingPullRequests(before, values);
        break;
      case PullRequestRole.Reviewer:
        this.reviewNewPullRequests(before, values);
        this.reviewMissingPullRequests(before, values);
        break;
      case PullRequestRole.Participant:
        this.reviewNewPullRequests(before, values);
        break;
    }

    this.dataService.savePullRequests(role, values);
  }

  // run for pull requests with any role
  reviewCommentsCount(before: PullRequest[], now: PullRequest[]) {
    before
      .filter(b => now.some(n => n.id === b.id && n.properties.commentCount !== b.properties.commentCount))
      .forEach(b => {
        // todo: perform deep event processing
        // - check if comment is mine or not
        //

        this.notificationService.sendNotification(
          {
            action: PullRequestAction.Comment,
            pullRequest: b
          });
      });
  }

  // run only for REVIEWING or PARTICIPANT role
  reviewNewPullRequests(before: PullRequest[], now: PullRequest[]) {
    // todo: don't send notification if pr was claimed by myself
    // if activity user is me and "action": "UPDATED" and addedReviewers includes my user
    now
      .filter(b => !before.some(n => n.id === b.id))
      .forEach(b => {
        this.notificationService.sendNotification(
          {
            action: PullRequestAction.Created,
            pullRequest: b
          });
      });
  }

  reviewMissingPullRequests(before: PullRequest[], now: PullRequest[]) {
    before
      .filter(b => !now.some(n => n.id === b.id))
      .forEach(b => {
        // todo: check missing PR, was it merged / declined ?
      });

  }
}
